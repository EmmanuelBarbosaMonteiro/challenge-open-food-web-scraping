import { ProductNotFoundError } from './errors/product-not-found-error'
import {
  ProductDetails,
  makeSearchProductsById,
} from './steps-web-scraping/make-search-product-by-id'

export class SearchProductByIdUseCase {
  async execute(idProduct: string): Promise<ProductDetails> {
    const productDetails = await makeSearchProductsById(idProduct)

    if (!productDetails) {
      throw new ProductNotFoundError()
    }

    return productDetails
  }
}
