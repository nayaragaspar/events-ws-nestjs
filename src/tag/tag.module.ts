import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { EventsService } from '../events/events.service';
import { LoggerModule } from '../logger/logger.module';
import { UsersModule } from '../users/users.module';
import { TagController } from './tag.controller';
import { TagGateway } from './tag.gateway';
import { TagService } from './tag.service';

@Module({
  controllers: [TagController],
  providers: [TagService, TagGateway, EventsService],
  imports: [AuthModule, LoggerModule, UsersModule],
  exports: [TagService],
})
export class TagModule {}
