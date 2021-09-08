import { CodegenExamples, CodegenParameter, CodegenParameterIn, CodegenParameters, CodegenSchemaUsage, CodegenSchemaPurpose, CodegenValue, CodegenEncodingStyle, CodegenParameterEncoding, isCodegenArraySchema, isCodegenObjectSchema } from '@openapi-generator-plus/types'
import { OpenAPI } from 'openapi-types'
import { isOpenAPIReferenceObject, isOpenAPIV2GeneralParameterObject } from '../openapi-type-guards'
import { InternalCodegenState } from '../types'
import { toCodegenExamples } from './examples'
import { convertToBoolean, nameFromRef, resolveReference } from './utils'
import { toCodegenVendorExtensions } from './vendor-extensions'
import * as idx from '@openapi-generator-plus/indexed-type'
import { OpenAPIX } from '../types/patches'
import { toCodegenSchemaUsage } from './schema'

export function toCodegenParameters(parameters: OpenAPIX.Parameters, pathParameters: CodegenParameters | undefined, scopeName: string, state: InternalCodegenState): CodegenParameters | null {
	const result: CodegenParameters = idx.create()
	if (pathParameters) {
		idx.merge(result, pathParameters)
	}
	for (const parameter of parameters) {
		const codegenParameter = toCodegenParameter(parameter, scopeName, state)
		idx.set(result, codegenParameter.name, codegenParameter)
	}
	return idx.nullIfEmpty(result)
}

function toCodegenParameter(parameter: OpenAPI.Parameter, scopeName: string, state: InternalCodegenState): CodegenParameter {
	const parameterContextName = isOpenAPIReferenceObject(parameter) ? nameFromRef(parameter.$ref, state) : `${scopeName}_${parameter.name}`
	parameter = resolveReference(parameter, state)

	let schemaUse: CodegenSchemaUsage | undefined
	let examples: CodegenExamples | null
	let defaultValue: CodegenValue | null
	if (isOpenAPIV2GeneralParameterObject(parameter, state.specVersion)) {
		schemaUse = toCodegenSchemaUsage(parameter, state, {
			required: convertToBoolean(parameter.required, false),
			suggestedName: parameterContextName,
			purpose: CodegenSchemaPurpose.PARAMETER,
			scope: null,
		})
		examples = null
		defaultValue = parameter.default !== undefined ? {
			value: parameter.default,
			literalValue: state.generator.toLiteral(parameter.default, schemaUse),
		} : null
	} else {
		/* We pass [] as scopeNames so we create any nested models at the root of the models package,
		 * as we reference all models relative to the models package, but a parameter is in an
		 * operation. TODO it would be nice to improve this; maybe we can declare an enum in an Api
		 * interface... we'd just need to make sure that the nativeTypes referring to it were fixed.
		 * But we don't know the Api class name at this point. If we knew it, we could perhaps pass
		 * the package along with the scope names in all cases. 
		 * However it's sort of up to the templates to decide where to output models... so does that
		 * mean that we need to provide more info to toNativeType so it can put in full package names?
		 */
		schemaUse = toCodegenSchemaUsage(parameter.schema || { type: 'string' }, state, {
			required: convertToBoolean(parameter.required, false),
			suggestedName: parameterContextName,
			purpose: CodegenSchemaPurpose.PARAMETER,
			scope: null,
		})

		examples = toCodegenExamples(parameter.example, parameter.examples, undefined, schemaUse, state)
		defaultValue = null
	}

	const parameterIn = parameter.in as CodegenParameterIn
	const vendorExtensions = toCodegenVendorExtensions(parameter)

	const style = (parameter.style as CodegenEncodingStyle | undefined) || defaultEncodingStyle(parameterIn)

	const encoding: CodegenParameterEncoding | null = {
		style,
		explode: convertToBoolean(parameter.explode, style === CodegenEncodingStyle.FORM),
		allowReserved: parameter.allowReserved || false,
		vendorExtensions,
	}

	if ((encoding.style === CodegenEncodingStyle.SPACE_DELIMITED || encoding.style === CodegenEncodingStyle.PIPE_DELIMITED) && !isCodegenArraySchema(schemaUse.schema) && !isCodegenObjectSchema(schemaUse.schema)) {
		throw new Error(`Encoding style "${encoding.style}" is not appropriate schema type ${schemaUse.schema.schemaType} in parameter "${parameter.name}"`)
	} else if (encoding.style === CodegenEncodingStyle.DEEP_OBJECT && !isCodegenObjectSchema(schemaUse.schema)) {
		throw new Error(`Encoding style "${encoding.style}" is not appropriate for schema type ${schemaUse.schema.schemaType} in parameter "${parameter.name}"`)
	}

	const result: CodegenParameter = {
		name: parameter.name,

		...schemaUse,

		in: parameterIn,
		description: parameter.description || null,
		required: parameter.in === 'path' ? true : convertToBoolean(parameter.required, false),
		collectionFormat: isOpenAPIV2GeneralParameterObject(parameter, state.specVersion) ? parameter.collectionFormat || null : null, // TODO OpenAPI3
		examples,
		defaultValue,

		vendorExtensions,
		encoding,

		isQueryParam: parameter.in === 'query',
		isPathParam: parameter.in === 'path',
		isHeaderParam: parameter.in === 'header',
		isCookieParam: parameter.in === 'cookie',
		isFormParam: parameter.in === 'formData',
	}

	return result
}

function defaultEncodingStyle(parameterIn: CodegenParameterIn): CodegenEncodingStyle {
	switch (parameterIn) {
		case 'query': return CodegenEncodingStyle.FORM
		case 'path': return CodegenEncodingStyle.SIMPLE
		case 'header': return CodegenEncodingStyle.SIMPLE
		case 'cookie': return CodegenEncodingStyle.FORM
		case 'formData': return CodegenEncodingStyle.FORM
		case 'body': return CodegenEncodingStyle.FORM /* This is an OpenAPIv2 thing that we repair later */
	}
	throw new Error(`Unsupported 'in' for parameter: ${parameterIn}`)
}
