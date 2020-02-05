import { CodegenOptions, CodegenRootContext } from 'openapi-generator-node-core/dist/types'

/**
 * Options specific to Java that the user can provide to the code generation process.
 */
export interface CodegenOptionsJava extends CodegenOptions {
	apiPackage: string
	apiServiceImplPackage: string
	modelPackage: string
	invokerPackage: string
	useBeanValidation?: boolean
}

export interface CodegenRootContextJava extends CodegenRootContext {
	package: string
	imports?: string[]
}
