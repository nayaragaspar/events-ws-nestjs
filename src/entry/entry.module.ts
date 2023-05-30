import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { EventsService } from '../events/events.service';
import { LoggerModule } from '../logger/logger.module';
import { UsersModule } from '../users/users.module';
import { EntryController } from './entry.controller';
import { EntryGateway } from './entry.gateway';
import { EntryService } from './entry.service';

@Module({
  controllers: [EntryController],
  providers: [EntryService, EntryGateway, EventsService],
  imports: [AuthModule, LoggerModule, UsersModule],
})
export class EntryModule {}
