import { Module } from '@nestjs/common';
import { LoggerModule } from '../logger/logger.module';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';

@Module({
  controllers: [EventsController],
  providers: [EventsService],
  imports: [LoggerModule],
})
export class EventsModule {}
