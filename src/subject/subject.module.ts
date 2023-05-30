import { Module } from '@nestjs/common';
import { VoteModule } from 'src/vote/vote.module';
import { EventsService } from '../events/events.service';
import { LoggerModule } from '../logger/logger.module';
import { SubjectController } from './subject.controller';
import { SubjectService } from './subject.service';

@Module({
  controllers: [SubjectController],
  providers: [SubjectService, EventsService],
  imports: [LoggerModule, VoteModule],
})
export class SubjectModule {}
