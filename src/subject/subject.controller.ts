import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  ParseIntPipe,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Delete, Put } from '@nestjs/common/decorators';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation } from '@nestjs/swagger';
import { Resource } from '../auth/decorators/resource.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ResourceGuard } from '../auth/guards/resource.guards';
import { EventsService } from '../events/events.service';
import { CustomLogger } from '../logger/custom-logger.service';
import { SubjectService } from '../subject/subject.service';
import { VoteGateway } from '../vote/vote.gateway';
import { SubjectDto, UpdateSubject } from './subject.model';

@Controller('subject')
export class SubjectController {
  constructor(
    private logger: CustomLogger,
    private readonly subjectIntegrationData: SubjectService,
    private eventService: EventsService,
    private voteGateway: VoteGateway,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  @Resource('post/subject')
  @UseGuards(AuthGuard(['api-key']), JwtAuthGuard, ResourceGuard)
  @Post()
  async postSubject(@Request() req, @Body() newSubject: SubjectDto) {
    let subject = null;
    try {
      subject = await this.subjectIntegrationData.createSubject(
        newSubject,
        req.user.username,
      );
    } catch (error) {
      this.logger.error(`postSubject - ${error.message}`);

      throw new BadRequestException(
        `Erro ao salvar assunto - ${error.message}`,
      );
    }

    this.voteGateway.notifyMonitors(newSubject.id_evento);

    return subject;
  }

  @ApiOperation({
    summary: 'Lista de assuntos',
  })
  @Resource('get/subjects')
  @UseGuards(AuthGuard(['api-key']), JwtAuthGuard, ResourceGuard)
  @Get()
  async getSubjects(
    @Query('id_evento') eventId: number,
    @Query('id_assunto') subjectId: number,
    @Query('nm_assunto') subject?: string,
  ) {
    let subjects = null;

    try {
      if (subjectId) {
        subjects = await this.subjectIntegrationData.getSubject(
          eventId,
          subjectId,
        );
      } else {
        subjects = await this.subjectIntegrationData.getSubjects(
          eventId,
          subjectId,
          subject,
        );
      }
    } catch (error) {
      this.logger.error(`getSubjects ${eventId} - ${error.message}`);
      throw new BadRequestException(error.message);
    }

    if (!subjects) {
      throw new NotFoundException(
        !subject ? 'Nenhum assunto não encontrado' : 'Assunto não encontrado',
      );
    }
    return subjects;
  }

  @Resource('put/subject')
  @UseGuards(AuthGuard(['api-key']), JwtAuthGuard, ResourceGuard)
  @Put()
  async putSubject(@Request() req, @Body() updateSubject: UpdateSubject) {
    let subject = null;
    try {
      subject = await this.subjectIntegrationData.putSubject(
        updateSubject,
        req.user.username,
      );
    } catch (error) {
      this.logger.error(`putSubject - ${error.message}`);

      throw new BadRequestException(
        `Erro ao alterar assunto - ${error.message}`,
      );
    }

    this.voteGateway.notifyMonitors(updateSubject.id_evento);

    return subject;
  }

  @Resource('delete/subject')
  @UseGuards(AuthGuard(['api-key']), JwtAuthGuard, ResourceGuard)
  @Delete()
  async deleteSubject(
    @Query('id_evento', ParseIntPipe) eventId: number,
    @Query('id_assunto', ParseIntPipe) subjectId: number,
  ) {
    let subject = null;

    const subjectVerify = await this.subjectIntegrationData.subjectVerify(
      eventId,
      subjectId,
    );

    if (subjectVerify == false) {
      throw new BadRequestException(
        'Assunto em andamento não pode ser deletado!',
      );
    }
    try {
      subject = await this.subjectIntegrationData.deleteSubject(subjectId);
    } catch (error) {
      this.logger.error(`deleteSubject - ${error.message}`);

      throw new BadRequestException(
        `Erro ao deletar assunto - ${error.message}`,
      );
    }

    this.voteGateway.notifyMonitors(eventId);

    return subject;
  }
}
