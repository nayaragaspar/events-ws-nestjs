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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOperation } from '@nestjs/swagger';
import { EventsService } from 'src/events/events.service';
import { CpfOrCnpjValidationPipe } from 'src/validators/cpf-cnpj-validation.pipe';
import { Resource } from '../auth/decorators/resource.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ResourceGuard } from '../auth/guards/resource.guards';
import { CustomLogger } from '../logger/custom-logger.service';
import { VoteGateway } from './vote.gateway';
import { VoteDto, VoterDto, VoterSheetDto } from './vote.model';
import { VoteService } from './vote.service';
var XLSX = require('xlsx');

@Controller('vote')
export class VoteController {
  constructor(
    private logger: CustomLogger,
    private voteGateway: VoteGateway,
    private voteService: VoteService,
    private eventService: EventsService,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  @ApiOperation({
    summary: 'Listagem de votação por assunto',
  })
  @Resource('get/vote')
  @UseGuards(AuthGuard(['api-key']), JwtAuthGuard, ResourceGuard)
  @Get()
  async getVote(
    @Query('id_evento', ParseIntPipe) eventId: number,
    @Query('id_assunto', ParseIntPipe) subjectId: number,
    @Query('cpf_cnpj', CpfOrCnpjValidationPipe) cpf_cnpj: string,
  ) {
    let result;
    try {
      result = await this.voteService.getVote(eventId, subjectId, cpf_cnpj);
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }

    if (!result) {
      throw new BadRequestException('Nenhum dado encontrado!');
    }
    return result;
  }

  @ApiOperation({
    summary: 'Cadastrar voto',
  })
  @Resource('post/vote')
  @UseGuards(AuthGuard(['api-key']), JwtAuthGuard, ResourceGuard)
  @Post()
  async postVote(@Request() req, @Body() vote: VoteDto) {
    let result;

    try {
      result = await this.voteService.createVote(vote, req.user.username);
    } catch (err) {
      this.logger.error(`postVote - ${err}`);

      throw new BadRequestException(`Erro cadastrar acesso ao voto - ${err}`);
    }

    if (!result[0]) {
      throw new BadRequestException('Nenhum dado encontrado!');
    } else if (
      result[0].cd_status == false &&
      result[0].ds_mensagem.includes('dados não encontrados')
    ) {
      throw new BadRequestException('Entrada não encontrada!');
    } else if (result[0].cd_status == false) {
      throw new BadRequestException('Não foi possível registrar voto!');
    }

    this.voteGateway.notifyMonitors(vote.id_evento);
    return result;
  }

  @ApiOperation({
    summary: 'Importar planilha de votação',
  })
  @Resource('post/vote/upload')
  @UseGuards(AuthGuard(['api-key']), JwtAuthGuard, ResourceGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Request() req,
    @Query('eventId') eventId: number,
    @UploadedFile()
    file: Express.Multer.File,
  ) {
    const eventStatus = await this.eventService.verifyOngoingEvent(eventId);
    const statusIniciada = await this.eventService.verifyOngoingEvent(
      eventId,
      'INICIADA',
    );
    if (eventStatus == true || statusIniciada == true) {
      throw new BadRequestException(
        'A assembleia já está em andamento, não será possível importar nova planilha!',
      );
    }

    let result = [];

    try {
      var workbook = XLSX.read(file.buffer);
      var sheet_name_list = workbook.SheetNames;
      const payload: VoterSheetDto[] = XLSX.utils.sheet_to_json(
        workbook.Sheets[sheet_name_list[0]],
      );

      result = await this.voteService.createSheetVoter(
        eventId,
        payload,
        req.user.username,
      );
    } catch (error) {
      this.logger.error(error.message);
      throw new BadRequestException(error.message);
    }

    if (result.length > 0) {
      this.logger.error(
        `Alguns cooperados não foram inseridos: ${JSON.stringify(result)}`,
      );
      throw new BadRequestException(`${JSON.stringify(result)}`);
    }

    return;
  }

  @ApiOperation({
    summary: 'Exportar planilha de votação',
  })
  @Resource('get/vote/download')
  @UseGuards(AuthGuard(['api-key']), JwtAuthGuard, ResourceGuard)
  @Get('download')
  @UseInterceptors(FileInterceptor('file'))
  async downloadFile(@Query('id_evento', ParseIntPipe) eventId: number) {
    let result;

    try {
      result = await this.voteService.exportSheet(eventId);
    } catch (error) {
      this.logger.error(error.message);
      throw new BadRequestException(error.message);
    }

    if (!result) {
      throw new NotFoundException('Nenhum dado encontrado!');
    }
    return result;
  }

  @ApiOperation({
    summary: 'Última importação de planilha',
  })
  @Resource('get/vote/last-upload')
  @UseGuards(AuthGuard(['api-key']), JwtAuthGuard, ResourceGuard)
  @Get('last-upload')
  @UseInterceptors(FileInterceptor('file'))
  async lastUpload(@Query('id_evento', ParseIntPipe) eventId: number) {
    let result;

    try {
      result = await this.voteService.lastUpload(eventId);
    } catch (error) {
      this.logger.error(error.message);
      throw new BadRequestException(error.message);
    }

    if (!result) {
      throw new NotFoundException('Nenhum dado encontrado!');
    }
    return result;
  }

  @ApiOperation({
    summary: 'Cadastro manual de votante',
  })
  @Resource('post/vote/voter')
  @UseGuards(AuthGuard(['api-key']), JwtAuthGuard, ResourceGuard)
  @Post('voter')
  async postVoter(@Request() req, @Body() voter: VoterDto) {
    /* const eventStatus = await this.eventService.verifyOngoingEvent(
      voter.id_evento,
    );
    if (eventStatus == false) {
      throw new BadRequestException('O evento não está em andamento!');
    } */

    let result;
    try {
      result = await this.voteService.createVoter(voter, req.user.username);
    } catch (error) {
      this.logger.error('postVoter: ' + error);
      throw new BadRequestException(error);
    }

    this.voteGateway.notifyMonitors(voter.id_evento);
    return result;
  }

  @ApiOperation({
    summary: 'Listagem de votação por assunto',
  })
  @Resource('get/vote/list')
  @UseGuards(AuthGuard(['api-key']), JwtAuthGuard, ResourceGuard)
  @Get('list')
  async getVoteList(@Query('id_evento', ParseIntPipe) eventId: number) {
    let result;
    try {
      result = await this.voteService.getMonitor(eventId);
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }

    if (!result) {
      throw new BadRequestException('Nenhum dado encontrado!');
    }
    return result;
  }

  @ApiOperation({
    summary: 'Relatório de votação',
  })
  @Resource('get/vote/report')
  @UseGuards(AuthGuard(['api-key']), JwtAuthGuard, ResourceGuard)
  @Get('report')
  async getVoteReport(
    @Query('id_evento', ParseIntPipe) eventId: number,
    @Query('id_assunto', ParseIntPipe) subjectId: number,
  ) {
    let result;
    try {
      result = await this.voteService.getVoteReport(eventId, subjectId);
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }

    if (!result) {
      throw new BadRequestException('Nenhum dado encontrado!');
    }
    return result;
  }

  @ApiOperation({
    summary: 'Relatório de tratamento manual',
  })
  @Resource('get/vote/exception-report')
  @UseGuards(AuthGuard(['api-key']), JwtAuthGuard, ResourceGuard)
  @Get('exception-report')
  async getExceptionReport(@Query('id_evento', ParseIntPipe) eventId: number) {
    let result;
    try {
      result = await this.voteService.getExceptionReport(eventId);
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }

    if (!result) {
      throw new BadRequestException('Nenhum dado encontrado!');
    }
    return result;
  }
}
