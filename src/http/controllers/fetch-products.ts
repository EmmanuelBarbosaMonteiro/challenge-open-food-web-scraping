import { makeSearchProducts } from '@/use-cases/steps-web-scraping/make-search-products'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export async function fetchProducts(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const searchProductsQueryNutritionAndNovaSchema = z.object({
    nutrition: z.string(),
    nova: z.string(),
  })

  try {
    const { nutrition, nova } = searchProductsQueryNutritionAndNovaSchema.parse(
      request.query,
    )
    const products = await makeSearchProducts(nova, nutrition)
    return reply.status(200).send({ products })
  } catch (error) {
    return reply.status(400)
  }
}
