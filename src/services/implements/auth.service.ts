import { googleOAuth2Client } from '@config/google.oauth2'
import { Hash } from '@config/hash'
import { BASE_STATUS } from '@constants/base.status'
import { TYPES } from '@constants/types'
import { User } from '@entities/user'
import BadRequestException from '@exceptions/bad-request.exception'
import UnauthorizedException from '@exceptions/unauthorized.exception'
import { IUserResponse, UserResource } from '@mappers/user.mapper'
import { IUserRepository } from '@repositories/contracts/user.repository.interface'
import { IAuthResponse, IAuthService } from '@services/contracts/auth.service.interface'
import { inject, injectable } from 'inversify'
import { DeepPartial } from 'typeorm'
import jwt from 'jsonwebtoken'
import { config } from '@config/app'

@injectable()
export default class AuthService implements IAuthService {
  constructor(@inject(TYPES.UserRepository) private readonly userRepository: IUserRepository) {
    this.userRepository = userRepository
  }

  async updateProfile(id: string | number, data: DeepPartial<User>): Promise<User> {
    const { name, phoneNumber, dob, avatar } = data
    const user = await this.userRepository.findById(id)
    if (!user) {
      throw new BadRequestException(`Not found user ${id}`)
    }
    Object.assign(user, { name, phoneNumber, dob, avatar })

    return this.userRepository.save(user)
  }

  async register(name: string, email: string, password: string): Promise<IAuthResponse> {
    const existingUser = await this.userRepository.findOneBy({ email })
    if (existingUser) {
      throw new BadRequestException('This email has been already taken')
    }
    const hashedPassword = Hash.make(password)
    const user = this.userRepository.create({ name, email, password: hashedPassword })
    await this.userRepository.save(user)
    return this.generateTokens(user)
  }

  private generateTokens(user: User): IAuthResponse {
    const accessToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        status: user.status
      },
      config.jwt.accessTokenSecretKey
    )
    const refreshToken = jwt.sign(
      { userId: user.id, email: user.email, status: user.status },
      config.jwt.refreshTokenSecretKey
    )
    return { accessToken, refreshToken }
  }

  private validateUser(user: User | null) {
    if (!user || user.status === BASE_STATUS.BLOCKED) {
      throw new UnauthorizedException('Invalid credentials or blocked account')
    }
  }

  async login(email: string, password: string): Promise<IAuthResponse> {
    const user = await this.userRepository.findOneBy({ email })
    this.validateUser(user)

    if (!Hash.check(password, user?.password as string)) {
      throw new UnauthorizedException('Invalid credentials')
    }

    return this.generateTokens(user!)
  }

  async getUserInfo(userId: number): Promise<IUserResponse> {
    const user = await this.userRepository.findById(userId)
    if (!user) {
      throw new UnauthorizedException('User not found')
    }

    return UserResource.fromEntity(user)
  }

  redirect(): string {
    const scope: string[] = ['https://www.googleapis.com/auth/userinfo.profile', 'email']
    const url: string = googleOAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope,
      prompt: 'consent'
    })

    return url
  }

  private async getTokenIdFromCode(code: string): Promise<string> {
    const responseToken = await googleOAuth2Client.getToken(code)
    const tokenId = responseToken.tokens.id_token
    if (!tokenId) {
      throw new UnauthorizedException('Token is invalid.')
    }
    return tokenId
  }

  private async getSocialAccountFromToken(tokenId: string) {
    const verifiedPayload = await googleOAuth2Client.verifyIdToken({ idToken: tokenId })
    const socialAccount = verifiedPayload.getPayload()
    if (!socialAccount) {
      throw new UnauthorizedException('Cannot extract user information.')
    }
    return socialAccount
  }

  async callback(code: string): Promise<IAuthResponse> {
    const tokenId = await this.getTokenIdFromCode(code)
    const account = await this.getSocialAccountFromToken(tokenId)
    const { email } = account

    const user =
      (await this.userRepository.findOneBy({ email })) ??
      (await this.userRepository.save(this.userRepository.create(account)))

    return this.generateTokens(user)
  }

  refreshAccessToken(refreshToken: string): string {
    try {
      const decoded = jwt.verify(refreshToken, config.jwt.refreshTokenSecretKey) as {
        userId: number
        email: string
        status: string
      }
      const { userId, email, status } = decoded
      const token = jwt.sign({ userId, email, status }, config.jwt.accessTokenSecretKey)
      return token
    } catch (error: unknown) {
      const messages: Record<string, string> = {
        JsonWebTokenError: 'Invalid token',
        TokenExpiredError: 'Token has expired'
      }
      const name = (error as { name: string }).name
      const message = messages[name] || 'Exception from refresh access token service'

      throw new UnauthorizedException(message)
    }
  }

  async changePassword(
    userId: number | string,
    oldPassword: string,
    newPassword: string
  ): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: Number(userId) } })
    if (!user) {
      throw new BadRequestException(`Not found user ${userId}`)
    }

    const matchedPassword = Hash.check(oldPassword, user.password!)
    if (!matchedPassword) {
      throw new BadRequestException('Password does not match')
    }

    if (oldPassword === newPassword) {
      throw new BadRequestException('New password must be different from the old password')
    }

    user.password = Hash.make(newPassword)
    return this.userRepository.save(user)
  }
}
