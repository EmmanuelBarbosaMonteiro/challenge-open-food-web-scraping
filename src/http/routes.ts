import { FastifyInstance } from 'fastify'
import { fetchProducts } from './controllers/fetch-products'
import { fetchProductDetails } from './controllers/search-product-id'

export async function appRoutes(app: FastifyInstance) {
  app.get(
    '/products',
    {
      schema: {
        description: 'Fetch products based on nutrition and nova score',
        tags: ['Products'],
        summary: 'Get Products by Nutrition and Nova',
        querystring: {
          type: 'object',
          properties: {
            nutrition: { type: 'string', description: 'Nutrition grade' },
            nova: { type: 'string', description: 'NOVA group' },
          },
          required: ['nutrition', 'nova'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              products: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'string',
                      description: 'The unique identifier for a product.',
                    },
                    name: {
                      type: 'string',
                      description: 'The name of the product.',
                    },
                    nutrition: {
                      type: 'object',
                      properties: {
                        score: {
                          type: 'string',
                          description: 'The nutrition score of the product.',
                        },
                        title: {
                          type: 'string',
                          description:
                            'A description of the nutritional quality.',
                        },
                      },
                      description: 'Nutritional information of the product.',
                    },
                    nova: {
                      type: 'object',
                      properties: {
                        score: {
                          type: 'number',
                          description: 'The NOVA score of the product.',
                        },
                        title: {
                          type: 'string',
                          description: 'A description of the NOVA group.',
                        },
                      },
                      description: 'NOVA classification of the product.',
                    },
                  },
                },
                description: 'A list of products.',
              },
            },
            description: 'Successful response',
          },
        },
      },
    },
    fetchProducts,
  )
  app.get(
    '/products/:idProduct',
    {
      schema: {
        summary: 'Get product details',
        description: 'Returns product data',
        tags: ['Product'],
        params: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Product ID',
            },
          },
        },
        response: {
          200: {
            description: 'Returns product model',
            type: 'object',
            properties: {
              title: { type: 'string' },
              quantity: { type: 'string' },
              ingredients: {
                type: 'object',
                properties: {
                  hasPalmOil: { type: 'string' },
                  isVegan: { type: 'boolean' },
                  isVegetarian: { type: 'boolean' },
                  list: {
                    type: 'array',
                    items: { type: 'string' },
                  },
                },
              },
              nutrition: {
                type: 'object',
                properties: {
                  score: {
                    oneOf: [{ type: 'string' }, { type: 'null' }],
                  },
                  values: {
                    type: 'array',
                    items: {
                      oneOf: [{ type: 'string' }, { type: 'null' }],
                    },
                  },
                  servingSize: { type: 'string' },
                  data: { type: 'object' },
                  nova: { type: 'object' },
                },
              },
            },
          },
        },
      },
    },
    fetchProductDetails,
  )
}
