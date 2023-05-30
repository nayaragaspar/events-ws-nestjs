import { Injectable } from '@nestjs/common';
import { EventsDto, UpdateEventsDto } from './events.model';
import EventRepository from './events.repository';

@Injectable()
export class EventsService {
  private readonly repository: EventRepository;

  constructor() {
    this.repository = new EventRepository();
  }

  async getEvent(status?: string) {
    try {
      let events = await this.repository.getEvents();

      if (status) {
        let result = [];
        events.ds_eventos.forEach((item) => {
          if (item.nm_status == status) {
            result.push(item);
          }
        });
        return result;
      }

      return events;
    } catch (err) {
      throw err;
    }
  }

  async verifyOngoingEvent(eventId: number, status: string = 'ANDAMENTO') {
    try {
      let events = await this.repository.getEvents();
      let result;

      if (events.cd_status == false) return false;

      events.ds_eventos.forEach((item) => {
        if (item.id_evento == eventId) {
          result = item;
          return;
        }
      });

      return !result ? false : result.nm_status.toUpperCase() == status;
    } catch (err) {
      throw err;
    }
  }

  async postEvent(newEvent: EventsDto, username: string) {
    try {
      const event = await this.repository.postEvent(newEvent, username);

      return event;
    } catch (err) {
      throw err;
    }
  }

  async putEvent(newEvent: UpdateEventsDto, username: string) {
    try {
      const event = await this.repository.putEvent(newEvent, username);

      return event;
    } catch (err) {
      throw err;
    }
  }
}
