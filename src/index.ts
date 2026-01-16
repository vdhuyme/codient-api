import 'dotenv/config'
import 'reflect-metadata'
import '@controllers/index'
import express from 'express'
import { errorHandler } from '@middlewares/error.handler'
import cors from 'cors'
import { notFound } from '@middlewares/not.found'
import logger from '@config/logging'
import { database } from './data-source'
import helmet from 'helmet'
import compression from 'compression'
import { container } from './inversify-config'
import { config } from '@config/app'
import { ClassValidationPipe } from '@inversifyjs/class-validation'
import { InversifyExpressHttpAdapter } from '@inversifyjs/http-express'
import { InversifyValidationErrorFilter } from '@inversifyjs/http-validation'

async function bootstrap(): Promise<void> {
  await database()

  const adapter: InversifyExpressHttpAdapter = new InversifyExpressHttpAdapter(container)
  const application: express.Application = await adapter.build()

  adapter.useGlobalFilters(InversifyValidationErrorFilter)
  adapter.useGlobalPipe(new ClassValidationPipe())

  application.use(cors())
  application.use(helmet())
  application.use(compression())
  application.use(express.json())
  application.use(express.urlencoded({ extended: true }))
  application.use(notFound)
  application.use(errorHandler)

  application.listen(config.app.port, () => {
    const { host, port, env } = config.app

    logger.info('🚀 Application started successfully')
    logger.info(`🌐 Environment : ${env}`)
    logger.info(`📡 Listening   : ${host}:${port}`)
  })
}

bootstrap()
