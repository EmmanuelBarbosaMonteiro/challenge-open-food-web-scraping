import fastify from 'fastify'
import { ZodError } from 'zod'
import { appRoutes } from './http/routes'
import { env } from './env'
import fastifySwaggerUi from '@fastify/swagger-ui'
import fastifySwagger from '@fastify/swagger'

export const app = fastify()

app.register(fastifySwagger, {
  swagger: {
    info: {
      title: 'Challenge Open Food Web Scraping',
      version: '0.1.0',
    },
    host: 'localhost',
    schemes: ['http'],
    consumes: ['application/json'],
    produces: ['application/json'],
  },
})
app.register(fastifySwaggerUi, {
  routePrefix: '/docs',
})

app.register(appRoutes)

app.setErrorHandler((error, _, reply) => {
  if (error instanceof ZodError) {
    return reply
      .status(400)
      .send({ message: 'Validation error.', issues: error.format() })
  }

  if (env.NODE_ENV !== 'production') {
    console.error(error)
  }

  return reply.status(500).send({ message: 'Internal server error.' })
})
