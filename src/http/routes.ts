import { FastifyInstance } from 'fastify'
import { fetchProducts } from './controllers/fetch-products'
import { fetchProductDetails } from './controllers/search-product-id'

export async function appRoutes(app: FastifyInstance) {
  app.get('/products', fetchProducts)
  app.get('/products/:idProduct', fetchProductDetails)
}
