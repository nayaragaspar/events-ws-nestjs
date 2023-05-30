import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { EntryModule } from './entry/entry.module';
import { EventsModule } from './events/events.module';
import { SubjectModule } from './subject/subject.module';
import { TagModule } from './tag/tag.module';
import { UsersModule } from './users/users.module';
import { VoteModule } from './vote/vote.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    EventsModule,
    SubjectModule,
    TagModule,
    EntryModule,
    VoteModule,
  ],
  providers: [],
})
export class AppModule {}
