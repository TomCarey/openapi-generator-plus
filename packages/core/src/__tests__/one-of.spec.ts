import { createTestDocument } from './common'
import { idx } from '../'
// import util from 'util'
import { CodegenAllOfStrategy, CodegenInterfaceSchema, CodegenNumericSchema, CodegenObjectSchema, CodegenOneOfSchema, CodegenOneOfStrategy, CodegenSchemaType, CodegenWrapperSchema, isCodegenAllOfSchema, isCodegenInterfaceSchema, isCodegenObjectSchema, isCodegenOneOfSchema } from '@openapi-generator-plus/types'

test('oneOf simple (native)', async() => {
	const result = await createTestDocument('one-of/one-of-simple.yml', {
		oneOfStrategy: CodegenOneOfStrategy.NATIVE,
	})

	const child = idx.get(result.schemas, 'Cat') as CodegenObjectSchema
	const parent = idx.get(result.schemas, 'Pet') as CodegenOneOfSchema

	expect(isCodegenObjectSchema(child)).toBeTruthy()
	expect(isCodegenOneOfSchema(parent)).toBeTruthy()

	expect(child.name).toEqual('Cat')
	expect(child.implements).toBeNull()
	expect(child.discriminatorValues).toBeNull()

	expect(parent.name).toEqual('Pet')
	expect(parent.discriminator).toBeNull()
	expect(parent.composes).toBeTruthy()
	expect(parent.composes!.indexOf(child)).not.toEqual(-1)
})

test('oneOf simple (object)', async() => {
	const result = await createTestDocument('one-of/one-of-simple.yml', {
		oneOfStrategy: CodegenOneOfStrategy.INTERFACE,
	})

	const child = idx.get(result.schemas, 'Cat') as CodegenObjectSchema
	const parent = idx.get(result.schemas, 'Pet') as CodegenInterfaceSchema

	expect(isCodegenObjectSchema(child)).toBeTruthy()
	expect(isCodegenInterfaceSchema(parent)).toBeTruthy()

	expect(child.name).toEqual('Cat')
	expect(child.implements).toBeTruthy()
	expect(child.implements!.length).toEqual(1)
	expect(child.implements![0]).toBe(parent)
	expect(child.discriminatorValues).toBeNull()

	expect(parent.name).toEqual('Pet')
	expect(parent.discriminator).toBeNull()
	expect(parent.implementors).toBeTruthy()
	expect(parent.implementors!.indexOf(child)).not.toEqual(-1)
})

test('oneOf discriminator (native)', async() => {
	const result = await createTestDocument('one-of/one-of-discriminator.yml', {
		oneOfStrategy: CodegenOneOfStrategy.NATIVE,
	})

	const child = idx.get(result.schemas, 'Cat') as CodegenObjectSchema
	const parent = idx.get(result.schemas, 'Pet') as CodegenOneOfSchema

	expect(isCodegenObjectSchema(child)).toBeTruthy()
	expect(isCodegenOneOfSchema(parent)).toBeTruthy()

	expect(child.name).toEqual('Cat')
	expect(child.implements).toBeNull()
	expect(child.discriminatorValues).toBeTruthy()
	expect(child.discriminatorValues!.length).toEqual(1)

	expect(parent.name).toEqual('Pet')
	expect(parent.discriminator!.name).toEqual('petType')
	expect(parent.discriminator!.references.length).toEqual(3)
	expect(parent.composes).toBeTruthy()
	expect(parent.composes!.indexOf(child)).not.toEqual(-1)
})

test('oneOf discriminator (object)', async() => {
	const result = await createTestDocument('one-of/one-of-discriminator.yml', {
		oneOfStrategy: CodegenOneOfStrategy.INTERFACE,
	})

	const child = idx.get(result.schemas, 'Cat') as CodegenObjectSchema
	const parent = idx.get(result.schemas, 'Pet') as CodegenInterfaceSchema

	expect(isCodegenObjectSchema(child)).toBeTruthy()
	expect(isCodegenInterfaceSchema(parent)).toBeTruthy()

	expect(child.name).toEqual('Cat')
	expect(child.implements!.length).toBe(1)
	expect(parent.name).toEqual('Pet')
	expect(parent.discriminator!.name).toEqual('petType')
	expect(parent.discriminator!.references.length).toEqual(3)
	expect(parent.children).toBeNull()
})

test('oneOf discriminator missing property (native)', async() => {
	await expect(createTestDocument('one-of/one-of-discriminator-missing-property.yml', {
		oneOfStrategy: CodegenOneOfStrategy.NATIVE,
	}))
		.rejects.toThrow('Discriminator property "petType" for "MyResponseType" missing in "Cat"')
})

test('oneOf discriminator missing property (object)', async() => {
	await expect(createTestDocument('one-of/one-of-discriminator-missing-property.yml', {
		oneOfStrategy: CodegenOneOfStrategy.INTERFACE,
	}))
		.rejects.toThrow('Discriminator property "petType" for "MyResponseType" missing in "Cat"')
})

test('oneOf no discriminator (native)', async() => {
	const result = await createTestDocument('one-of/one-of-no-discriminator.yml', {
		oneOfStrategy: CodegenOneOfStrategy.NATIVE,
	})

	const combinedModel = idx.get(result.schemas, 'MyResponseType') as CodegenOneOfSchema
	const model1 = idx.get(result.schemas, 'Cat') as CodegenObjectSchema

	expect(combinedModel).toBeDefined()
	expect(model1).toBeDefined()

	expect(isCodegenOneOfSchema(combinedModel)).toBeTruthy()
	expect(combinedModel.composes.length).toEqual(3)
	expect(combinedModel.composes.indexOf(model1)).not.toEqual(-1)

	expect(isCodegenObjectSchema(model1)).toBeTruthy()
	expect(model1.implements).toBeNull()
})

test('oneOf no discriminator (object)', async() => {
	const result = await createTestDocument('one-of/one-of-no-discriminator.yml', {
		oneOfStrategy: CodegenOneOfStrategy.INTERFACE,
	})

	const combinedModel = idx.get(result.schemas, 'MyResponseType') as CodegenInterfaceSchema
	expect(combinedModel).toBeDefined()
	expect(isCodegenInterfaceSchema(combinedModel)).toBeTruthy()

	/* The combined model has no properties, as it implements the parent interfaces */
	expect(combinedModel.properties).toBeNull()

	const model1 = idx.get(result.schemas, 'Cat') as CodegenObjectSchema
	expect(model1).toBeDefined()
	expect(isCodegenObjectSchema(model1)).toBeTruthy()
	expect(model1.implements!.find(s => s.name === 'MyResponseType')).toBeTruthy()
})

test('oneOf property no discriminator (object)', async() => {
	const result = await createTestDocument('one-of/one-of-property-no-discriminator.yml', {
		oneOfStrategy: CodegenOneOfStrategy.INTERFACE,
	})

	const someObject = idx.get(result.schemas, 'SomeObject') as CodegenObjectSchema
	expect(someObject).toBeDefined()
	expect(someObject.schemaType).toEqual(CodegenSchemaType.OBJECT)

	const submodels = idx.allValues(someObject!.schemas!)
	expect(submodels.length).toEqual(1)
	const submodel = submodels[0] as CodegenInterfaceSchema
	expect(isCodegenInterfaceSchema(submodel)).toBeTruthy()
})

test('oneOf arrays (native)', async() => {
	const result = await createTestDocument('one-of/one-of-arrays.yml', {
		oneOfStrategy: CodegenOneOfStrategy.NATIVE,
	})
	expect(result).toBeDefined()

	const polygon = result.schemas['Polygon'] as CodegenObjectSchema
	expect(polygon).toBeDefined()
	expect(isCodegenObjectSchema(polygon)).toBeTruthy()
	expect(polygon.schemas).not.toBeNull()
	const coordinates = idx.get(polygon.schemas!, 'coordinates') as CodegenOneOfSchema
	expect(coordinates.schemaType).toEqual(CodegenSchemaType.ONEOF)
	expect(coordinates.composes).toBeTruthy()
	expect(coordinates.composes.length).toEqual(2)

	const oneOfCoordinates = coordinates.composes[0]
	expect(oneOfCoordinates.nativeType.nativeType).toEqual('array array array number')
	expect(oneOfCoordinates.schemaType).toEqual(CodegenSchemaType.ARRAY)
})

test('oneOf arrays (object)', async() => {
	const result = await createTestDocument('one-of/one-of-arrays.yml', {
		oneOfStrategy: CodegenOneOfStrategy.INTERFACE,
	})
	expect(result).toBeDefined()

	const polygon = result.schemas['Polygon'] as CodegenObjectSchema
	expect(polygon).toBeDefined()
	expect(isCodegenObjectSchema(polygon)).toBeTruthy()
	expect(polygon.schemas).not.toBeNull()
	const coordinates = idx.allValues(polygon.schemas!)[1] as CodegenInterfaceSchema
	expect(coordinates.schemaType).toEqual(CodegenSchemaType.INTERFACE)
	expect(coordinates.implementors).not.toBeNull()
	expect(coordinates.implementors!.length).toEqual(2)

	const oneOfCoordinates = coordinates.implementors![0] as CodegenWrapperSchema
	expect(oneOfCoordinates.schemaType).toEqual(CodegenSchemaType.WRAPPER)
	expect(oneOfCoordinates.nativeType.nativeType).toEqual('Polygon.coordinates.array_value_wrapper')

	expect(oneOfCoordinates.property.nativeType.nativeType).toEqual('array array array number')
	expect(oneOfCoordinates.property.schema.schemaType).toEqual(CodegenSchemaType.ARRAY)
})

test('oneOf discriminator with separate allOf (native)', async() => {
	const result = await createTestDocument('one-of/one-of-discriminator-separate-all-of.yml', {
		oneOfStrategy: CodegenOneOfStrategy.NATIVE,
	})

	const child = idx.get(result.schemas, 'Cat') as CodegenObjectSchema
	const parent = idx.get(result.schemas, 'Pet') as CodegenOneOfSchema

	expect(isCodegenAllOfSchema(child)).toBeTruthy()
	expect(isCodegenOneOfSchema(parent)).toBeTruthy()

	expect(child.name).toEqual('Cat')
	expect(child.implements).toBeNull()
	expect(child.discriminatorValues).toBeTruthy()
	expect(child.discriminatorValues!.length).toEqual(1)

	expect(parent.name).toEqual('Pet')
	expect(parent.discriminator!.name).toEqual('petType')
	expect(parent.discriminator!.references.length).toEqual(3)
	expect(parent.composes).toBeTruthy()
	expect(parent.composes!.indexOf(child)).not.toEqual(-1)
})

test('oneOf discriminator with separate allOf (object)', async() => {
	const result = await createTestDocument('one-of/one-of-discriminator-separate-all-of.yml', {
		oneOfStrategy: CodegenOneOfStrategy.INTERFACE,
		allOfStrategy: CodegenAllOfStrategy.OBJECT,
	})

	const child = idx.get(result.schemas, 'Cat') as CodegenObjectSchema
	const parent = idx.get(result.schemas, 'Pet') as CodegenInterfaceSchema

	expect(isCodegenObjectSchema(child)).toBeTruthy()
	expect(isCodegenInterfaceSchema(parent)).toBeTruthy()

	expect(child.name).toEqual('Cat')
	expect(child.implements!.length).toBe(2)

	const abstractAnimal = child.implements![0]
	expect(abstractAnimal.schemaType).toEqual(CodegenSchemaType.INTERFACE)
	expect(abstractAnimal.name).toEqual('i_AbstractAnimal')
	expect(abstractAnimal.properties).toBeTruthy()
	expect(idx.has(abstractAnimal.properties!, 'petType')).toBeTruthy()

	expect(child.properties).toBeTruthy()
	expect(idx.has(child.properties!, 'petType')).toBeTruthy() /* The child must have it as it implements AbstractAnimal, which specifies it */

	expect(parent.name).toEqual('Pet')
	expect(parent.discriminator!.name).toEqual('petType')
	expect(parent.discriminator!.references.length).toEqual(3)
	expect(parent.children).toBeNull()
})

test('oneOf primitives (native)', async() => {
	const result = await createTestDocument('one-of/one-of-primitives.yml', {
		oneOfStrategy: CodegenOneOfStrategy.NATIVE,
	})
	expect(result).toBeDefined()

	const oneOf = result.schemas['OneOf'] as CodegenOneOfSchema
	expect(oneOf).toBeDefined()
	expect(isCodegenOneOfSchema(oneOf)).toBeTruthy()
	expect(oneOf.schemas).toBeNull() /* As our schemas are refs, even though they're primitive */
	
	expect(oneOf.composes).not.toBeNull()
	const customInteger = oneOf.composes![0] as CodegenNumericSchema
	expect(customInteger.schemaType).toEqual(CodegenSchemaType.INTEGER)
	expect(customInteger.name).toBeNull() /* An integer schema doesn't need a name */
})

test('oneOf primitives (object)', async() => {
	const result = await createTestDocument('one-of/one-of-primitives.yml', {
		oneOfStrategy: CodegenOneOfStrategy.INTERFACE,
	})
	expect(result).toBeDefined()

	const oneOf = result.schemas['OneOf'] as CodegenInterfaceSchema
	expect(oneOf).toBeDefined()
	expect(isCodegenInterfaceSchema(oneOf)).toBeTruthy()
	expect(oneOf.schemas).toBeNull() /* As our schemas are refs, even though they're primitive */

	expect(oneOf.implementors).not.toBeNull()
	const customInteger = oneOf.implementors![0] as CodegenWrapperSchema
	expect(customInteger.schemaType).toEqual(CodegenSchemaType.WRAPPER)
	expect(customInteger.name).toEqual('CustomInteger') /* Wrapper schemas can have names, and we want it to have the name we gave it in the spec */
	expect(customInteger.property).toBeDefined()
	expect(customInteger.property.schema.schemaType).toBe(CodegenSchemaType.INTEGER)
	expect(customInteger.property.nullable).toBeFalsy()
})

test('oneOf primitives with nullable', async() => {
	const result = await createTestDocument('one-of/one-of-primitives.yml', {
		oneOfStrategy: CodegenOneOfStrategy.INTERFACE,
	})
	expect(result).toBeDefined()

	const oneOf = result.schemas['OneOf'] as CodegenInterfaceSchema
	expect(isCodegenInterfaceSchema(oneOf)).toBeTruthy()

	expect(oneOf.implementors).not.toBeNull()
	const customIntegerNullable = oneOf.implementors![2] as CodegenWrapperSchema
	expect(customIntegerNullable.schemaType).toEqual(CodegenSchemaType.WRAPPER)
	expect(customIntegerNullable.name).toEqual('CustomIntegerNullable') /* Wrapper schemas can have names, and we want it to have the name we gave it in the spec */
	expect(customIntegerNullable.property).toBeDefined()
	expect(customIntegerNullable.property.nullable).toBeTruthy()
})

test('oneOf allOf (native)', async() => {
	const result = await createTestDocument('one-of/one-of-all-of.yml', {
		oneOfStrategy: CodegenOneOfStrategy.NATIVE,
		allOfStrategy: CodegenAllOfStrategy.NATIVE,
	})
	expect(result).toBeDefined()

	const propertyInfo = result.schemas['PropertyInfo'] as CodegenOneOfSchema
	expect(propertyInfo).toBeDefined()
	expect(isCodegenOneOfSchema(propertyInfo)).toBeTruthy()
	expect(propertyInfo.schemas).toBeNull() /* As our schemas are refs */
	
	expect(propertyInfo.composes).not.toBeNull()
	const integerProperty = propertyInfo.composes![0] as CodegenNumericSchema
	expect(integerProperty.schemaType).toEqual(CodegenSchemaType.ALLOF)
	expect(integerProperty.name).toEqual('IntegerProperty')
})

test('oneOf allOf (object)', async() => {
	const result = await createTestDocument('one-of/one-of-all-of.yml', {
		oneOfStrategy: CodegenOneOfStrategy.INTERFACE,
		allOfStrategy: CodegenAllOfStrategy.OBJECT,
		supportsInheritance: false,
	})
	expect(result).toBeDefined()

	const propertyInfo = result.schemas['PropertyInfo'] as CodegenInterfaceSchema
	expect(propertyInfo).toBeDefined()
	expect(isCodegenInterfaceSchema(propertyInfo)).toBeTruthy()
	expect(propertyInfo.schemas).toBeNull() /* As our schemas are refs */

	expect(propertyInfo.implementors).not.toBeNull()
	const integerProperty = propertyInfo.implementors![0] as CodegenObjectSchema
	expect(integerProperty.schemaType).toEqual(CodegenSchemaType.OBJECT)
	expect(integerProperty.name).toEqual('IntegerProperty')
	expect(integerProperty.implements).toBeTruthy()
	expect(integerProperty.implements?.length).toEqual(2)
	expect(integerProperty.properties).toBeTruthy()
	expect(idx.size(integerProperty.properties!)).toEqual(2)
	expect(idx.has(integerProperty.properties!, 'type')).toBeTruthy() /* Has the discriminator property as it needs it for interface conformance */

	const integerTypeProperty = idx.get(integerProperty.properties!, 'type')
	expect(integerTypeProperty).toBeTruthy()
	expect(integerTypeProperty?.discriminators).toBeTruthy()

	const objectProperty = propertyInfo.implementors![2] as CodegenObjectSchema
	expect(objectProperty.name).toEqual('ObjectProperty')
	expect(objectProperty.schemaType).toEqual(CodegenSchemaType.OBJECT)
	expect(objectProperty.implements).toBeTruthy()
	expect(objectProperty.implements?.length).toEqual(3) /* Extra interfaces as it couldn't use inheritance */
	expect(idx.has(objectProperty.properties!, 'type')).toBeTruthy() /* Has the discriminator property as it needs it for interface conformance */

	const objectTypeProperty = idx.get(objectProperty.properties!, 'type')
	expect(objectTypeProperty).toBeTruthy()
	expect(objectTypeProperty?.discriminators).toBeTruthy()
})

test('oneOf allOf (object with inheritance)', async() => {
	const result = await createTestDocument('one-of/one-of-all-of.yml', {
		oneOfStrategy: CodegenOneOfStrategy.INTERFACE,
		allOfStrategy: CodegenAllOfStrategy.OBJECT,
		supportsInheritance: true,
	})
	expect(result).toBeDefined()

	const propertyInfo = result.schemas['PropertyInfo'] as CodegenInterfaceSchema
	expect(propertyInfo).toBeDefined()
	expect(isCodegenInterfaceSchema(propertyInfo)).toBeTruthy()
	expect(propertyInfo.schemas).toBeNull() /* As our schemas are refs */

	expect(propertyInfo.implementors).not.toBeNull()

	const integerProperty = propertyInfo.implementors![0] as CodegenObjectSchema
	expect(integerProperty.name).toEqual('IntegerProperty')
	expect(integerProperty.schemaType).toEqual(CodegenSchemaType.OBJECT)
	expect(integerProperty.implements).toBeTruthy()
	expect(integerProperty.implements?.length).toEqual(1)
	expect(integerProperty.parents).toBeTruthy()
	expect(integerProperty.parents!.length).toEqual(1)
	expect(integerProperty.properties).toBeTruthy()
	expect(idx.size(integerProperty.properties!)).toEqual(1)
	expect(idx.has(integerProperty.properties!, 'type')).toBeFalsy() /* Doesn't have discriminator property as it doesn't need it for interface conformance */

	const objectProperty = propertyInfo.implementors![2] as CodegenObjectSchema
	expect(objectProperty.name).toEqual('ObjectProperty')
	expect(objectProperty.schemaType).toEqual(CodegenSchemaType.OBJECT)
	expect(objectProperty.implements).toBeTruthy()
	expect(objectProperty.implements?.length).toEqual(3) /* Extra interfaces as it couldn't use inheritance */
	expect(idx.has(objectProperty.properties!, 'type')).toBeTruthy() /* Has the discriminator property as it needs it for interface conformance */

	const objectTypeProperty = idx.get(objectProperty.properties!, 'type')
	expect(objectTypeProperty).toBeTruthy()
	expect(objectTypeProperty?.discriminators).toBeTruthy()
})

test('oneOf anonymous', async() => {
	const result = await createTestDocument('one-of/one-of-anonymous.yml', {
		oneOfStrategy: CodegenOneOfStrategy.INTERFACE,
		allOfStrategy: CodegenAllOfStrategy.OBJECT,
		supportsInheritance: true,
	})
	expect(result).toBeDefined()

	const subservice = idx.get(result.schemas, 'SubService') as CodegenObjectSchema
	expect(subservice.schemaType).toEqual(CodegenSchemaType.OBJECT)

	expect(subservice.schemas).not.toBeNull()
	expect(idx.size(subservice.schemas!)).toEqual(1)

	const regions = idx.get(subservice.schemas!, 'regions') as CodegenInterfaceSchema
	expect(regions.schemaType).toEqual(CodegenSchemaType.INTERFACE)
})

test('oneOf anonymous (native)', async() => {
	const result = await createTestDocument('one-of/one-of-anonymous.yml', {
		oneOfStrategy: CodegenOneOfStrategy.NATIVE,
		allOfStrategy: CodegenAllOfStrategy.OBJECT,
		supportsInheritance: true,
		supportsMultipleInheritance: true,
	})
	expect(result).toBeDefined()

	const subservice = idx.get(result.schemas, 'SubService') as CodegenObjectSchema
	expect(subservice.schemaType).toEqual(CodegenSchemaType.OBJECT)

	expect(subservice.schemas).not.toBeNull()
	expect(idx.size(subservice.schemas!)).toEqual(1)

	const regions = idx.get(subservice.schemas!, 'regions') as CodegenOneOfSchema
	expect(regions.schemaType).toEqual(CodegenSchemaType.ONEOF)
})
