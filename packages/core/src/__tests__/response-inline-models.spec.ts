import { createTestDocument } from './common'
import * as idx from '../indexed-type'

test('inline response model', async() => {
	const result = await createTestDocument('response-inline-models-v2.yml')

	const group1 = result.groups[0]
	const op1 = group1.operations[0]

	expect(op1.returnType).toEqual('object')
	expect(op1.returnNativeType?.toString()).toEqual('getTest1_200_response_model')

	expect(idx.size(result.models)).toEqual(1)

	const models = idx.values(result.models)
	const model1 = models[0]
	expect(model1.name).toEqual('getTest1_200_response_model')
})
