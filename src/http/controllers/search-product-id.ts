import { SearchProductByIdUseCase } from '@/use-cases/search-product-by-id'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export async function fetchProductDetails(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const productDetailsQuerySchema = z.object({
    idProduct: z.string(),
  })

  try {
    const { idProduct } = productDetailsQuerySchema.parse(request.params)

    const searchProductByIdUseCase = new SearchProductByIdUseCase()

    const productDetails = await searchProductByIdUseCase.execute(idProduct)

    return reply.status(200).send(productDetails)
  } catch (error) {
    console.error(error)

    if (error instanceof z.ZodError) {
      return reply
        .status(400)
        .send({ message: 'Invalid request data.', errors: error.errors })
    } else {
      return reply.status(500).send({ message: 'Internal server error.' })
    }
  }
}
