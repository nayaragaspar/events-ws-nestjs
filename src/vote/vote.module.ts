import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { EntryService } from '../entry/entry.service';
import { EventsService } from '../events/events.service';
import { LoggerModule } from '../logger/logger.module';
import { TagModule } from '../tag/tag.module';
import { VoteController } from './vote.controller';
import { VoteGateway } from './vote.gateway';
import VoteRepository from './vote.repository';
import { VoteService } from './vote.service';

@Module({
  controllers: [VoteController],
  providers: [
    VoteService,
    VoteGateway,
    VoteRepository,
    EventsService,
    EntryService,
  ],
  imports: [LoggerModule, AuthModule, TagModule],
  exports: [VoteGateway],
})
export class VoteModule {}
