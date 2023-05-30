import { Injectable } from '@nestjs/common';
import { CustomLogger } from '../logger/custom-logger.service';
import { SubjectRepository } from '../subject/subject.repository';
import { SubjectDto, UpdateSubject } from './subject.model';

@Injectable()
export class SubjectService {
  private repository: SubjectRepository;

  constructor(private logger: CustomLogger) {
    this.repository = new SubjectRepository();
    this.logger.setContext(this.constructor.name);
  }
  async createSubject(newSubject: SubjectDto, username: string) {
    try {
      const subject = await this.repository.createSubject(newSubject, username);
      return subject;
    } catch (error) {
      throw error;
    }
  }

  async getSubjects(eventId: number, subjectId?: number, subject?: string) {
    try {
      const result = await this.repository.getSubjects(
        eventId,
        subjectId,
        subject,
      );

      return result.assuntos;
    } catch (error) {
      throw error;
    }
  }

  async getSubject(eventId: number, subjectId: number) {
    try {
      const result = await this.repository.getSubject(eventId, subjectId);

      return result;
    } catch (error) {
      throw error;
    }
  }

  async subjectVerify(eventId: number, subjectId: number) {
    try {
      let result;
      let subjects = await this.repository.getSubjects(eventId, subjectId);

      this.logger.debug(`Subject: ${subjects}`);

      if (subjects.cd_status == false) return false;
      subjects.assuntos.forEach((item) => {
        if (item.id_assunto == subjectId) {
          result = item;
          return;
        }
      });

      if (!result) return false;

      return result.nm_status.toUpperCase() != 'ANDAMENTO';
    } catch (err) {
      throw err;
    }
  }

  async putSubject(updateSubject: UpdateSubject, username: string) {
    try {
      const result = await this.repository.putSubject(updateSubject, username);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async deleteSubject(subjectId: number) {
    try {
      const result = await this.repository.deleteSubject(subjectId);
      return result;
    } catch (error) {
      throw error;
    }
  }
}
