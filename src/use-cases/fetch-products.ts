import {
  ProductData,
  makeSearchProducts,
} from './steps-web-scraping/make-search-products'

export class FetchProductsUseCase {
  async execute(
    novaCriteria: string,
    nutritionCriteria: string,
  ): Promise<{ products: ProductData[] }> {
    const products = await makeSearchProducts(novaCriteria, nutritionCriteria)

    return { products }
  }
}
