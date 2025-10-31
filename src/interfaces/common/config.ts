import { NodeEnvironment } from '@app-types/environment'

export interface AppConfig {
  env: NodeEnvironment
  host: string
  port: number
}

export interface GoogleConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
}

export interface DatabaseConfig {
  connection: string
  host: string
  port: number
  username: string
  password: string
  database: string
  synchronize: boolean
  logging: boolean
  ssl: boolean
}

export interface Hash {
  salt: number
}

export interface JWTConfig {
  accessTokenSecretKey: string
  refreshTokenSecretKey: string
  accessTokenExpirationTime: number
  refreshTokenExpirationTime: number
}

export interface GA4 {
  propertyId: number
  credentials: string
}

export interface ImageKit {
  urlEndpoint: string
  publicKey: string
  privateKey: string
}

export interface Config {
  app: AppConfig
  google: GoogleConfig
  database: DatabaseConfig
  hash: Hash
  jwt: JWTConfig
  ga4: GA4
  imagekit: ImageKit
}
