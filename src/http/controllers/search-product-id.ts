import { ProductNotFoundError } from '@/use-cases/errors/product-not-found-error'
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

    return reply.status(200).send(JSON.stringify(productDetails, null, 2))
  } catch (error) {
    if (error instanceof ProductNotFoundError) {
      return reply.status(404).send({ messege: error.message })
    }

    throw error
  }
}
