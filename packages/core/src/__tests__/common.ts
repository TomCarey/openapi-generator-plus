import { CodegenGeneratorConstructor, CodegenGenerator, CodegenDocument, CodegenState, CodegenGeneratorType, CodegenSchemaType, CodegenOperationGroupingStrategy, CodegenSchemaPurpose, CodegenLogLevel, CodegenAllOfStrategy, CodegenOneOfStrategy, CodegenAnyOfStrategy, CodegenConfig } from '@openapi-generator-plus/types'
import { addToGroupsByPath } from '../operation-grouping'
import { constructGenerator, createCodegenState, createCodegenDocument, createCodegenInput } from '..'
import path from 'path'
import pluralize from 'pluralize'
import { camelCase } from 'lodash'
import { createGeneratorContext } from '../generators'
import { isURL } from '../utils'

interface TestCodegenOptions {
	config: TestCodegenConfig
}

export interface TestCodegenConfig {
	operationGroupingStrategy?: CodegenOperationGroupingStrategy
	allOfStrategy?: CodegenAllOfStrategy
	anyOfStrategy?: CodegenAnyOfStrategy
	oneOfStrategy?: CodegenOneOfStrategy
	supportsInheritance?: boolean
	supportsMultipleInheritance?: boolean
	expectLogWarnings?: boolean
	toSchemaName?: (name: string) => string
}

const testGeneratorConstructor: CodegenGeneratorConstructor = (config, generatorContext) => {
	const testConfig = config as TestCodegenConfig
	const generatorOptions: TestCodegenOptions = {
		config: testConfig,
	}

	return {
		...generatorContext.baseGenerator(config, generatorContext),
		generatorType: () => CodegenGeneratorType.SERVER,
		toClassName: (name) => `${name}_class`,
		toIdentifier: (name) => {
			if (name === 'type') {
				name = 'aType' /* Test reserved words */
			}
			return camelCase(`${name.replace(/[^a-zA-Z0-9_]/g, '_')}`)
		},
		toConstantName: (name) => `${name}_constant`,
		toEnumMemberName: (name) => `${name.replace('-', '')}_enum_member`,
		toOperationName: (path, method) => `${method} ${path.replace(/\{[^}]*\}/g, '').replace(/\/$/, '')} operation`,
		toOperationGroupName: (name) => `${name} api`,
		toSchemaName: (name) => {
			if (testConfig.toSchemaName) {
				return testConfig.toSchemaName(name)
			} else {
				return name
			}
		},
		toSuggestedSchemaName: (name, options) => {
			if (options.purpose === CodegenSchemaPurpose.ARRAY_ITEM || options.purpose === CodegenSchemaPurpose.MAP_VALUE) {
				name = pluralize.singular(name)
			}
			if (options.schemaType === CodegenSchemaType.ENUM) {
				return `${name}_enum`
			} else if (options.schemaType === CodegenSchemaType.OBJECT) {
				return `${name}_model`
			} else if (options.purpose === CodegenSchemaPurpose.EXTRACTED_INTERFACE) {
				return `i_${name}`
			} else if (options.purpose === CodegenSchemaPurpose.IMPLEMENTATION) {
				return `abstract_${name}`
			} else {
				return name
			}
		},
		toIteratedSchemaName: (name, _, iteration) => `${name}${iteration}`,
		toLiteral: (value) => {
			if (value === undefined || value === null) {
				return null
			} else if (typeof value === 'object') {
				return JSON.stringify(value)
			} else if (typeof value === 'string') {
				return `"${value}"`
			} else {
				return `${value}`
			}
		},
		toNativeType: (options) => new generatorContext.NativeType(options.type),
		toNativeObjectType: (options) => new generatorContext.NativeType(options.scopedName.join('.')),
		toNativeArrayType: (options) => new generatorContext.NativeType(`array ${options.componentNativeType}`),
		toNativeMapType: (options) => new generatorContext.NativeType(`map ${options.componentNativeType}`),
		nativeTypeUsageTransformer: () => ({
			default: (nativeType) => nativeType.nativeType,
		}),
		defaultValue: (options) => {
			if (!options.required) {
				return { value: undefined, literalValue: 'undefined' }
			}

			switch (options.schemaType) {
				case CodegenSchemaType.ARRAY:
					return { value: [], literalValue: '[]' }
				case CodegenSchemaType.OBJECT:
					return { value: {}, literalValue: '{}' }
				case CodegenSchemaType.NUMBER:
					return { value: 0.0, literalValue: '0.0' }
				case CodegenSchemaType.INTEGER:
					return { value: 0, literalValue: '0' }
				case CodegenSchemaType.BOOLEAN:
					return { value: false, literalValue: 'false' }
				default:
					return { value: undefined, literalValue: 'undefined' }
			}
		},
		initialValue: (options) => {
			/* Use the default value from the spec if available */
			if (options.defaultValue) {
				return options.defaultValue
			}

			if (!options.required) {
				return null
			}

			switch (options.schemaType) {
				case CodegenSchemaType.ARRAY:
					/* Initial blank array value for required array properties */
					return { value: [], literalValue: '[]' }
				case CodegenSchemaType.OBJECT:
					/* Initial empty object value for required object properties */
					return { value: {}, literalValue: '{}' }
				default:
					/* No initial values for other types */
					return null
			}
		},
		operationGroupingStrategy: () => generatorOptions.config.operationGroupingStrategy || addToGroupsByPath,
		allOfStrategy: () => generatorOptions.config.allOfStrategy || CodegenAllOfStrategy.NATIVE,
		anyOfStrategy: () => generatorOptions.config.anyOfStrategy || CodegenAnyOfStrategy.NATIVE,
		oneOfStrategy: () => generatorOptions.config.oneOfStrategy || CodegenOneOfStrategy.NATIVE,
		supportsMultipleInheritance: () => generatorOptions.config.supportsMultipleInheritance || false,
		supportsInheritance: () => generatorOptions.config.supportsInheritance || false,
		nativeCompositionCanBeScope: () => true,
		nativeComposedSchemaRequiresName: () => true,
		nativeComposedSchemaRequiresObjectLikeOrWrapper: () => false,
		interfaceCanBeNested: () => true,
		exportTemplates: async() => {
			// NOOP
		},
		watchPaths: () => [],
		cleanPathPatterns: () => undefined,
		templateRootContext: () => ({}),
	}
}

export function createTestGenerator(config?: TestCodegenConfig): CodegenGenerator {
	
	return constructGenerator(config as CodegenConfig || {}, createGeneratorContext(), testGeneratorConstructor)
}

export async function createTestDocument(inputPath: string, config?: TestCodegenConfig): Promise<CodegenDocument> {
	return (await createTestResult(inputPath, config)).result
}

export interface TestResult {
	result: CodegenDocument
	state: CodegenState
}

export async function createTestResult(inputPath: string, config?: TestCodegenConfig): Promise<TestResult> {
	const generator = createTestGenerator(config)
	const state = createTestCodegenState(generator, config)
	const input = await createCodegenInput(isURL(inputPath) ? inputPath : path.resolve(__dirname, inputPath))
	const result = createCodegenDocument(input, state)
	return {
		result,
		state,
	}
}

function createTestCodegenState(generator: CodegenGenerator, config?: TestCodegenConfig): CodegenState {
	const state = createCodegenState(generator)
	state.log = function(level, message) {
		if (level >= CodegenLogLevel.WARN && (!config || !config.expectLogWarnings)) {
			/* We should not emit any warning messages during the tests */
			throw new Error(`Warning message generated: ${message}`)
		}
	}
	return state
}
