import { googleOAuth2Client } from '@config/google.oauth2';
import { Hash } from '@config/hash';
import { User } from '@entities/user';
import BadRequestException from '@exceptions/bad-request.exception';
import UnauthorizedException from '@exceptions/unauthorized.exception';
import { inject, injectable } from 'inversify';
import jwt from 'jsonwebtoken';
import { config } from '@config/app';
import { TYPES } from '@constants/types';
import { tryCatch } from '@utils/try-catch';
import { UserRepository } from '@repositories/user-repository';

@injectable()
export default class AuthService {
  constructor(
    @inject(TYPES.UserRepository)
    private readonly userRepository: UserRepository,

    @inject(TYPES.Hash)
    private readonly hash: Hash,
  ) {}

  private async ensureEmailNotTaken(email: string): Promise<void> {
    const user = await this.userRepository.findOneBy({ email });
    if (user) {
      throw new BadRequestException('This email has been already taken');
    }
  }

  async register(name: string, email: string, password: string): Promise<void> {
    await this.ensureEmailNotTaken(email);
    const hashedPassword = await this.hash.make(password);
    const user = this.userRepository.create({
      name,
      email,
      password: hashedPassword,
    });

    await this.userRepository.save(user);
  }

  private generateTokens(user: User): Record<string, string> {
    const accessToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        status: user.status,
      },
      config.jwt.accessTokenSecretKey,
    );
    const refreshToken = jwt.sign(
      { userId: user.id, email: user.email, status: user.status },
      config.jwt.refreshTokenSecretKey,
    );
    return { accessToken, refreshToken };
  }

  async login(
    email: string,
    password: string,
  ): Promise<Record<string, string>> {
    const user = await this.userRepository.findOneBy({ email });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!(await this.hash.check(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(user!);
  }

  async getUserInfo(userId: string): Promise<Omit<User, 'password'>> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const { password: _, ...userWithoutPassword } = user;

    return userWithoutPassword;
  }

  redirect(): string {
    const scope: string[] = [
      'https://www.googleapis.com/auth/userinfo.profile',
      'email',
    ];
    const url: string = googleOAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope,
      prompt: 'consent',
    });

    return url;
  }

  private async getTokenIdFromCode(code: string): Promise<string> {
    const responseToken = await googleOAuth2Client.getToken(code);
    const tokenId = responseToken.tokens.id_token;
    if (!tokenId) {
      throw new UnauthorizedException('Token is invalid.');
    }
    return tokenId;
  }

  private async getSocialAccountFromToken(tokenId: string) {
    const verifiedPayload = await googleOAuth2Client.verifyIdToken({
      idToken: tokenId,
    });
    const socialAccount = verifiedPayload.getPayload();
    if (!socialAccount) {
      throw new UnauthorizedException('Cannot extract user information.');
    }
    return socialAccount;
  }

  async callback(code: string): Promise<Record<string, string>> {
    const tokenId = await this.getTokenIdFromCode(code);
    const account = await this.getSocialAccountFromToken(tokenId);
    const { email } = account;

    const user =
      (await this.userRepository.findOneBy({ email })) ??
      (await this.userRepository.save(this.userRepository.create(account)));

    return this.generateTokens(user);
  }

  refreshAccessToken(refreshToken: string): string {
    const [err, decoded] = tryCatch(() => {
      return jwt.verify(refreshToken, config.jwt.refreshTokenSecretKey) as {
        userId: number;
        email: string;
        status: string;
      };
    });

    if (err) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const { userId, email, status } = decoded!;
    const token = jwt.sign(
      { userId, email, status },
      config.jwt.accessTokenSecretKey,
    );
    return token;
  }

  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new BadRequestException(`Not found user ${userId}`);
    }

    const matchedPassword = await this.hash.check(oldPassword, user.password!);
    if (!matchedPassword) {
      throw new BadRequestException('Password does not match');
    }

    if (oldPassword === newPassword) {
      throw new BadRequestException(
        'New password must be different from the old password',
      );
    }

    user.password = await this.hash.make(newPassword);
  }
}
