import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import * as dotenv from 'dotenv';
import { LoggerModule } from '../logger/logger.module';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { jwtConstants } from './enums/constants';
import { HeaderApiKeyStrategy } from './strategies/auth-header-api-key.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';

dotenv.config();

const { TOKEN_EXPIRES_IN } = process.env;

@Module({
  imports: [
    UsersModule,
    LoggerModule,
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: TOKEN_EXPIRES_IN },
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy, HeaderApiKeyStrategy],
  exports: [AuthService],
})
export class AuthModule {}
