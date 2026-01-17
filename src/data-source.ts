import 'dotenv/config';
import path from 'path';

import logger from '@config/logging';
import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from '@config/app';
import { tryCatch } from '@utils/try-catch';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

import { NodeEnvironment } from '@domain/environment';

const env = config.app.env as NodeEnvironment;
const basePath: string = __dirname;

const databaseConfig: Record<NodeEnvironment, DataSourceOptions> = {
  development: {
    type: 'postgres',
    host: config.database.host,
    port: config.database.port,
    username: config.database.username,
    password: config.database.password,
    database: config.database.database,
    synchronize: config.database.synchronize,
    logging: config.database.logging,
    entities: [path.join(basePath, 'entities', '**', '*{.ts,.js}')],
    migrations: [path.join(basePath, 'migrations', '**', '*{.ts,.js}')],
    namingStrategy: new SnakeNamingStrategy(),
  },
  production: {
    type: 'postgres',
    host: config.database.host,
    port: config.database.port,
    username: config.database.username,
    password: config.database.password,
    database: config.database.database,
    synchronize: config.database.synchronize,
    logging: config.database.logging,
    ssl: config.database.ssl,
    entities: [path.join(basePath, 'entities', '**', '*{.ts,.js}')],
    migrations: [path.join(basePath, 'migrations', '**', '*{.ts,.js}')],
    namingStrategy: new SnakeNamingStrategy(),
  },
  test: {
    type: 'postgres',
    host: config.database.host,
    port: config.database.port,
    username: config.database.username,
    password: config.database.password,
    database: config.database.database,
    synchronize: config.database.synchronize,
    logging: config.database.logging,
    entities: [path.join(basePath, 'entities', '**', '*{.ts,.js}')],
    migrations: [],
    namingStrategy: new SnakeNamingStrategy(),
  },
};

export const dataSource = new DataSource(databaseConfig[env]);

export const database = async (): Promise<void> => {
  const [err, _] = await tryCatch(dataSource.initialize());
  if (err) {
    logger.error(
      `❌ Failed to connect with ${config.database.connection}: ${err.message}`,
    );
    logger.error(`Stack trace: ${err.stack}`);
  }

  logger.info(
    `📂 [${env.toUpperCase()}] Connected to ${config.database.connection.toUpperCase()} → ${databaseConfig[env].database}`,
  );
};
