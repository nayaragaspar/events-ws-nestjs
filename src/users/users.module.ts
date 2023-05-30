import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from '../auth/auth.service';
import { LoggerModule } from '../logger/logger.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  providers: [UsersService, AuthService],
  exports: [UsersService],
  controllers: [UsersController],
  imports: [LoggerModule, JwtModule],
})
export class UsersModule {}
