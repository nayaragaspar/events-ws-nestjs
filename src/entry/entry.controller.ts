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
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation } from '@nestjs/swagger';
import { Resource } from '../auth/decorators/resource.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ResourceGuard } from '../auth/guards/resource.guards';
import { EventsService } from '../events/events.service';
import { CustomLogger } from '../logger/custom-logger.service';
import { EntryGateway } from './entry.gateway';
import { EntryDto } from './entry.model';
import { EntryService } from './entry.service';

@Controller()
export class EntryController {
  constructor(
    private entryService: EntryService,
    private entryGateway: EntryGateway,
    private logger: CustomLogger,
    private eventService: EventsService,
  ) {
    this.logger.setContext('EntryController');
  }

  @ApiOperation({
    summary: 'Cadastra entrada',
  })
  @Resource('post/entry')
  @UseGuards(AuthGuard(['api-key']), JwtAuthGuard, ResourceGuard)
  @Post('entry')
  async postEntry(@Request() req, @Body() entry: EntryDto) {
    const eventStatus = await this.eventService.verifyOngoingEvent(
      entry.id_evento,
    );
    if (eventStatus == false) {
      throw new BadRequestException('O evento não está em andamento!');
    }

    let result;
    try {
      result = await this.entryService.postEntry(entry, req.user.username);
    } catch (err) {
      this.logger.error(`postEntry: ${err}`);
      throw new BadRequestException(err.message);
    }

    if (result.cd_status == false) {
      if (result.ds_mensagem.includes('dados não encontrados')) {
        throw new NotFoundException('Participante não encontrado');
      } else {
        throw new BadRequestException(result.ds_mensagem);
      }
    }

    this.entryGateway.notifyMonitors(entry.id_evento);
    return result;
  }

  @ApiOperation({
    summary: 'Busca lista de entradas',
  })
  @Resource('get/entries')
  @UseGuards(AuthGuard(['api-key']), JwtAuthGuard, ResourceGuard)
  @Get('entries')
  async getEntryList(@Query('id_evento', ParseIntPipe) eventId: number) {
    let result;
    try {
      result = await this.entryService.getEntryList(eventId);
    } catch (err) {
      this.logger.error(`getEntryList: ${err}`);
      throw new BadRequestException(err.message);
    }

    return result;
  }

  @ApiOperation({
    summary: 'Busca entrada',
  })
  @Resource('get/entry')
  @UseGuards(AuthGuard(['api-key']), JwtAuthGuard, ResourceGuard)
  @Get('entry')
  async getEntry(
    @Query('tipo') tipo: string,
    @Query('cpf_cnpj') cpf_cnpj: string,
    @Query('id_evento', ParseIntPipe) eventId: number,
  ) {
    let result;
    try {
      result = await this.entryService.getEntry(tipo, cpf_cnpj, eventId);
    } catch (err) {
      this.logger.error(`getEntry: ${err}`);
      throw new BadRequestException(err.message);
    }

    return result;
  }

  @ApiOperation({
    summary: 'Busca histórico de entrada',
  })
  @Resource('get/entry/history')
  @UseGuards(AuthGuard(['api-key']), JwtAuthGuard, ResourceGuard)
  @Get('entry/history')
  async getEntryHistory(
    @Query('cpf_cnpj') cpf_cnpj: string,
    @Query('id_evento', ParseIntPipe) eventId: number,
  ) {
    let result;
    try {
      result = await this.entryService.getEntryHistory(cpf_cnpj, eventId);
    } catch (err) {
      this.logger.error(`getEntryHistory: ${err}`);
      throw new BadRequestException(err.message);
    }

    if (!result) {
      throw new NotFoundException('Nenhum dado encontrado!');
    }

    return result;
  }

  @ApiOperation({
    summary: 'Relatório de entrada',
  })
  @Resource('get/entry/report')
  @UseGuards(AuthGuard(['api-key']), JwtAuthGuard, ResourceGuard)
  @Get('entry/report')
  async getEntryReport(@Query('id_evento', ParseIntPipe) eventId: number) {
    let result;
    try {
      result = await this.entryService.getEntryReport(eventId);
    } catch (err) {
      this.logger.error(`getEntryReport: ${err}`);
      throw new BadRequestException(err.message);
    }

    if (!result) {
      throw new NotFoundException('Nenhum dado encontrado!');
    }

    return result;
  }

  @ApiOperation({
    summary: 'Relatório de entrada',
  })
  @Resource('get/entry/record-report')
  @UseGuards(AuthGuard(['api-key']), JwtAuthGuard, ResourceGuard)
  @Get('entry/record-report')
  async getRecordReport(@Query('id_evento', ParseIntPipe) eventId: number) {
    let result;
    try {
      result = await this.entryService.getRecordReport(eventId);
    } catch (err) {
      this.logger.error(`getRecordReport: ${err}`);
      throw new BadRequestException(err.message);
    }

    if (!result) {
      throw new NotFoundException('Nenhum dado encontrado!');
    }

    return result;
  }
}
