import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation } from '@nestjs/swagger';
import { Resource } from '../auth/decorators/resource.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ResourceGuard } from '../auth/guards/resource.guards';
import { CustomLogger } from '../logger/custom-logger.service';
import Utils from '../utils/utils';
import { EventsDto, UpdateEventsDto } from './events.model';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {
  constructor(
    private eventsService: EventsService,
    private logger: CustomLogger,
  ) {
    this.logger.setContext('EventsController');
  }

  @ApiOperation({
    summary: 'Lista assembleias',
  })
  @Resource('get/events')
  @UseGuards(AuthGuard(['api-key']), JwtAuthGuard, ResourceGuard)
  @Get()
  async getEvents(@Query('status') status?: string) {
    try {
      const events = await this.eventsService.getEvent(status);

      return events;
    } catch (err) {
      this.logger.error(`getEvents: ${err}`);
      throw new BadRequestException(err.message);
    }
  }

  @ApiOperation({
    summary: 'Cadastra assembleia',
  })
  @Resource('post/event')
  @UseGuards(AuthGuard(['api-key']), JwtAuthGuard, ResourceGuard)
  @Post()
  async postEvent(@Request() req, @Body() newEvent: EventsDto) {
    if (
      !Utils.validateDate(newEvent.dt_evento) ||
      !Utils.validateDate(newEvent.dt_corte)
    ) {
      throw new BadRequestException('Data inválida!');
    } else if (
      (newEvent.dt_primeira_chamada &&
        !Utils.validateTime(newEvent.dt_primeira_chamada)) ||
      (newEvent.dt_segunda_chamada &&
        !Utils.validateTime(newEvent.dt_segunda_chamada)) ||
      (newEvent.dt_terceira_chamada &&
        !Utils.validateTime(newEvent.dt_terceira_chamada))
    ) {
      throw new BadRequestException('Hora inválida!');
    }

    try {
      const event = await this.eventsService.postEvent(
        newEvent,
        req.user.username,
      );

      return event;
    } catch (err) {
      this.logger.error(`postEvent: ${err}`);
      throw new BadRequestException(err.message);
    }
  }

  @ApiOperation({
    summary: 'Atualiza assembleia',
  })
  @Resource('put/event')
  @UseGuards(AuthGuard(['api-key']), JwtAuthGuard, ResourceGuard)
  @Put()
  async putEvent(@Request() req, @Body() newEvent: UpdateEventsDto) {
    if (
      !Utils.validateDate(newEvent.dt_evento) ||
      !Utils.validateDate(newEvent.dt_corte)
    ) {
      throw new BadRequestException('Data inválida!');
    } else if (
      (newEvent.dt_primeira_chamada &&
        !Utils.validateTime(newEvent.dt_primeira_chamada)) ||
      (newEvent.dt_segunda_chamada &&
        !Utils.validateTime(newEvent.dt_segunda_chamada)) ||
      (newEvent.dt_terceira_chamada &&
        !Utils.validateTime(newEvent.dt_terceira_chamada))
    ) {
      throw new BadRequestException('Hora inválida!');
    }

    let event;
    try {
      event = await this.eventsService.putEvent(newEvent, req.user.username);
    } catch (err) {
      this.logger.error(`putEvent: ${err}`);
      throw new BadRequestException(err.message);
    }

    if (event.cd_status == false) {
      if (
        event.ds_mensagem ==
        'Erro - Não foi possível atualizar o evento pois já existe um evento em andamento '
      ) {
        throw new BadRequestException('Já existe uma assembleia em andamento!');
      }
      throw new BadRequestException(event.ds_mensagem);
    }
    return event;
  }
}
