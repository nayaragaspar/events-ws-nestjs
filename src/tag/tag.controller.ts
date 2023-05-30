import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation } from '@nestjs/swagger';
import { CpfOrCnpjValidationPipe } from 'src/validators/cpf-cnpj-validation.pipe';
import { Resource } from '../auth/decorators/resource.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ResourceGuard } from '../auth/guards/resource.guards';
import { EventsService } from '../events/events.service';
import { CustomLogger } from '../logger/custom-logger.service';
import Utils from '../utils/utils';
import { TagGateway } from './tag.gateway';
import {
  CooperadoTagDto,
  FamiliarTagDto,
  PartnerTagDto,
  TagCopyDto,
  VisitantTagDto,
} from './tag.model';
import { TagService } from './tag.service';

@Controller('tag')
export class TagController {
  constructor(
    private tagService: TagService,
    private tagGateway: TagGateway,
    private logger: CustomLogger,
    private eventService: EventsService,
  ) {
    this.logger.setContext('TagController');
  }

  @ApiOperation({
    summary: 'Emite etiqueta de cooperado',
  })
  @Resource('post/tag/cooperado')
  @UseGuards(AuthGuard(['api-key']), JwtAuthGuard, ResourceGuard)
  @Post('cooperado')
  async cooperadoTag(@Request() req, @Body() cooperadoTag: CooperadoTagDto) {
    if (Utils.valida_cpf_cnpj(cooperadoTag.cpf_cnpj) == false) {
      this.logger.info(`Invalid CPF/CNPJ:  ${cooperadoTag.cpf_cnpj}`);
      throw new BadRequestException('CPF/CNPJ inválido!');
    }

    const eventStatus = await this.eventService.verifyOngoingEvent(
      cooperadoTag.id_evento,
    );
    if (eventStatus == false) {
      throw new BadRequestException('O evento não está em andamento!');
    }

    let result;
    try {
      result = await this.tagService.postCooperadoTag(
        cooperadoTag,
        req.user.username,
      );
    } catch (err) {
      this.logger.error(`cooperadoTag: ${err}`);
      throw new BadRequestException(err);
    }

    if (result.cd_status == false) {
      if (result.ds_mensagem == 'Erro - Cooperado não encontrado') {
        throw new NotFoundException('Cooperado não encontrado');
      } else if (
        result.ds_mensagem == 'Erro - CPF/CNPJ já realizou inscrição'
      ) {
        throw new BadRequestException(
          'Já existe etiqueta gerada para este CPF/CNPJ!',
        );
      } else {
        throw new BadRequestException(
          result.ds_mensagem.replace('Erro - ', ''),
        );
      }
    }

    this.tagGateway.notifyMonitors(cooperadoTag.id_evento);
    return result;
  }

  @ApiOperation({
    summary: 'Emite etiqueta de sócior',
  })
  @Resource('post/tag/partner')
  @UseGuards(AuthGuard(['api-key']), JwtAuthGuard, ResourceGuard)
  @Post('partner')
  async partnerTag(@Request() req, @Body() partnerTag: PartnerTagDto) {
    if (Utils.valida_cpf_cnpj(partnerTag.cpf_cnpj_socio) == false) {
      this.logger.info(`Invalid CPF/CNPJ:  ${partnerTag.cpf_cnpj_socio}`);
      throw new BadRequestException('CPF/CNPJ inválido!');
    }

    const eventStatus = await this.eventService.verifyOngoingEvent(
      partnerTag.id_evento,
    );
    if (eventStatus == false) {
      throw new BadRequestException('O evento não está em andamento!');
    }

    if (!partnerTag.cpf_cnpj_socio)
      throw new BadRequestException('CPF/CNPJ do sócio deve ser informado!');

    let result;
    try {
      result = await this.tagService.postPartnerTag(
        partnerTag,
        req.user.username,
      );
    } catch (err) {
      this.logger.error(`partnerTag: ${err}`);
      throw new BadRequestException(err);
    }

    if (result.cd_status == false) {
      if (result.ds_mensagem == 'Erro - Sociedade não encontrada') {
        throw new NotFoundException(result.ds_mensagem.replace('Erro - ', ''));
      } else {
        throw new BadRequestException(
          result.ds_mensagem.replace('Erro - ', ''),
        );
      }
    }

    this.tagGateway.notifyMonitors(partnerTag.id_evento);
    return result;
  }

  @ApiOperation({
    summary: 'Emite etiqueta de familiar',
  })
  @Resource('post/tag/familiar')
  @UseGuards(AuthGuard(['api-key']), JwtAuthGuard, ResourceGuard)
  @Post('familiar')
  async familiarTag(@Request() req, @Body() familiarTag: FamiliarTagDto) {
    if (Utils.valida_cpf_cnpj(familiarTag.cpf_cnpj_cooperado) == false) {
      this.logger.info(`Invalid CPF/CNPJ!`);
      throw new BadRequestException('CPF/CNPJ inválido!');
    }

    const eventStatus = await this.eventService.verifyOngoingEvent(
      familiarTag.id_evento,
    );
    if (eventStatus == false) {
      throw new BadRequestException('O evento não está em andamento!');
    }
    if (!familiarTag.cpf_cnpj_familiar && !familiarTag.cpf_cnpj_cooperado)
      throw new BadRequestException(
        'CPF/CNPJ do cooperado / familiar deve ser informado!',
      );

    let result;
    try {
      result = await this.tagService.postFamiliarTag(
        familiarTag,
        req.user.username,
      );
    } catch (err) {
      this.logger.error(`partnerTag: ${err}`);
      throw new BadRequestException(err);
    }

    if (result.cd_status == false) {
      if (result.ds_mensagem == 'Erro - Familiaridade não encontrada') {
        throw new NotFoundException(result.ds_mensagem.replace('Erro - ', ''));
      } else {
        throw new BadRequestException(
          result.ds_mensagem.replace('Erro - ', ''),
        );
      }
    }

    this.tagGateway.notifyMonitors(familiarTag.id_evento);
    return result;
  }

  @ApiOperation({
    summary: 'Emite etiqueta de visitantes',
  })
  @Resource('post/tag/visitant')
  @UseGuards(AuthGuard(['api-key']), JwtAuthGuard, ResourceGuard)
  @Post('visitant')
  async visitantTag(@Request() req, @Body() visitantTag: VisitantTagDto) {
    const eventStatus = await this.eventService.verifyOngoingEvent(
      visitantTag.id_evento,
    );
    if (eventStatus == false) {
      throw new BadRequestException('O evento não está em andamento!');
    }

    let result;
    try {
      result = await this.tagService.postVisitantTag(
        visitantTag,
        req.user.username,
      );

      if (result.cd_status == false) throw result.ds_mensagem;
    } catch (err) {
      this.logger.error(`visitantTag: ${err}`);
      throw new BadRequestException(err);
    }

    this.tagGateway.notifyMonitors(visitantTag.id_evento);
    return result;
  }

  @ApiOperation({
    summary: 'Lista público',
  })
  @Resource('get/tag')
  @UseGuards(AuthGuard(['api-key']), JwtAuthGuard, ResourceGuard)
  @Get()
  async getTagList(@Query('id_evento', ParseIntPipe) eventId: number) {
    let result;
    try {
      result = await this.tagService.getTagList(eventId);
    } catch (err) {
      this.logger.error(`getTagList: ${err}`);
      throw new BadRequestException(err);
    }

    return result;
  }

  @ApiOperation({
    summary: 'Busca cooperados',
  })
  @Resource('get/tag/cooperado')
  @UseGuards(AuthGuard(['api-key']), JwtAuthGuard, ResourceGuard)
  @Get('cooperado')
  async getCooperadoTag(
    @Query('id_evento') id_evento: Number,
    @Query('cpf_cnpj', CpfOrCnpjValidationPipe) cpf_cnpj?: string,
    @Query('nm_cooperado') nm_cooperado?: string,
    @Query('cd_matricula') cd_matricula?: string,
  ) {
    let result;

    if (!cpf_cnpj && !nm_cooperado && !cd_matricula) {
      throw new BadRequestException(
        'A consulta não pode ser realizada sem parametros',
      );
    }

    try {
      result = await this.tagService.getCooperadoTag(
        id_evento,
        cpf_cnpj,
        nm_cooperado,
        cd_matricula,
      );

      return result;
    } catch (err) {
      if (err == 'Erro - Dados não encontrados') {
        throw new NotFoundException('Cooperado não encontrado!');
      }

      this.logger.error(`cooperadoTag: ${err}`);
      throw new BadRequestException(err);
    }
  }

  @ApiOperation({
    summary: 'Busca sócio',
  })
  @Resource('get/tag/partner')
  @UseGuards(AuthGuard(['api-key']), JwtAuthGuard, ResourceGuard)
  @Get('partner')
  async getSocioTag(
    @Query('cpf_cnpj', CpfOrCnpjValidationPipe) cpf_cnpj: string,
    @Query('nm_socio') nm_socio?: string,
    @Query('cd_matricula') cd_matricula?: string,
  ) {
    let result;

    if (!cpf_cnpj && !nm_socio && !cd_matricula) {
      throw new BadRequestException(
        'A consulta não pode ser realizada sem parametros',
      );
    }

    try {
      result = await this.tagService.getSocioTag(
        cpf_cnpj,
        nm_socio,
        cd_matricula,
      );
      return result;
    } catch (err) {
      if (err == 'Erro - Sociedade não encontrada') {
        throw new NotFoundException('Sociedade não encontrada');
      } else {
        this.logger.error(`socioTag: ${err}`);
        throw new BadRequestException(err);
      }
    }
  }

  @ApiOperation({
    summary: 'Emite etiqueta segunda via',
  })
  @Resource('put/tag/copy')
  @UseGuards(AuthGuard(['api-key']), JwtAuthGuard, ResourceGuard)
  @Put('copy')
  async tagCopy(@Request() req, @Body() tagCopy: TagCopyDto) {
    let result;
    try {
      result = await this.tagService.putTagCopy(tagCopy, req.user.username);
    } catch (err) {
      throw new BadRequestException(err);
    }
    return result;
  }

  @ApiOperation({
    summary: 'Relatório de credenciamento',
  })
  @Resource('get/tag/report')
  @UseGuards(AuthGuard(['api-key']), JwtAuthGuard, ResourceGuard)
  @Get('report')
  async getReportTag(@Query('id_evento') eventId: number) {
    let result;
    try {
      result = await this.tagService.getReportTag(eventId);
    } catch (err) {
      this.logger.error(`getReportTag: ${err}`);
      throw new BadRequestException(err);
    }

    if (!result) {
      throw new BadRequestException('Nenhum dado encontrado!');
    }
    return result;
  }
}
