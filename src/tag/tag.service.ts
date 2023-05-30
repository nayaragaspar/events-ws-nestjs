import { BadRequestException, Injectable } from '@nestjs/common';
import Utils from 'src/utils/utils';
import { TypeTag } from './tag.enum';
import {
  CooperadoTagDto,
  FamiliarTagDto,
  PartnerTagDto,
  TagCopyDto,
  VisitantTagDto,
} from './tag.model';
import TagRepository from './tag.repository';

@Injectable()
export class TagService {
  private readonly repository: TagRepository;

  constructor() {
    this.repository = new TagRepository();
  }

  async postCooperadoTag(tag: CooperadoTagDto, username: string) {
    try {
      let result = await this.repository.postCooperadoTag(tag, username);

      return result;
    } catch (err) {
      throw err;
    }
  }

  async postPartnerTag(tag: PartnerTagDto, username: string) {
    try {
      let result = await this.repository.postPartnerTag(tag, username);

      return result;
    } catch (err) {
      throw err;
    }
  }

  async postFamiliarTag(tag: FamiliarTagDto, username: string) {
    try {
      let result = await this.repository.postFamiliarTag(tag, username);

      return result;
    } catch (err) {
      throw err;
    }
  }

  async postVisitantTag(tag: VisitantTagDto, username: string) {
    try {
      let result = await this.repository.postVisitantTag(tag, username);

      return result;
    } catch (err) {
      throw err;
    }
  }

  async getTagList(eventId: number) {
    try {
      let result;

      result = await this.repository.getTagList(eventId);

      return result;
    } catch (err) {
      throw err;
    }
  }

  async getCooperadoTag(
    id_evento: Number,
    cpf_cnpj?: string,
    nm_cooperado?: string,
    cd_matricula?: string,
  ) {
    try {
      let result;
      if (cpf_cnpj) {
        result = await this.repository.getCooperadoSocioTag(
          id_evento,
          'cooperado',
          cpf_cnpj,
        );

        if (!result.cd_status) throw result.ds_mensagem;
        else {
          result = result.ds_cooperado[0];
          result.nr_cpf_cnpj_cooperado = Utils.getFormattedCpfCnpj(
            result.nr_cpf_cnpj_cooperado,
          );

          if (result.nr_cpf_cnpj_representante)
            result.nr_cpf_cnpj_representante = Utils.getFormattedCpfCnpj(
              result.nr_cpf_cnpj_representante,
            );
        }
      } else {
        result = await this.repository.getCooperadoTag(
          cpf_cnpj,
          nm_cooperado,
          cd_matricula,
        );
      }

      return result;
    } catch (err) {
      throw err;
    }
  }

  async getSocioTag(
    cpf_cnpj?: string,
    nm_socio?: string,
    cd_matricula?: string,
  ) {
    let result;

    try {
      if (cpf_cnpj) {
        result = await this.repository.getCooperadoSocioTag(
          0,
          'socio',
          cpf_cnpj,
        );

        if (!result.cd_status) throw result.ds_mensagem;
        else {
          result = result.ds_socio[0];
          result.nr_cpf_cnpj = Utils.getFormattedCpfCnpj(result.nr_cpf_cnpj);
        }
      } else {
        result = await this.repository.getSocioTag(nm_socio, cd_matricula);
      }

      return result;
    } catch (err) {
      throw err;
    }
  }

  async getMonitor(eventId: number) {
    try {
      let result = await this.repository.getMonitor(eventId);

      return {
        eventId,
        total: result.qt_publico_credenciado,
        cooperado: result.ds_credenciais[0].qt_cooperados,
        partner: result.ds_credenciais[0].qt_socio,
        familiar: result.ds_credenciais[0].qt_familiar,
        visitant: result.ds_credenciais[0].qt_visitantes,
      };
    } catch (err) {
      throw err;
    }
  }

  async putTagCopy(tagCopy: TagCopyDto, username: string) {
    try {
      let result;
      switch (tagCopy.tipo.toLowerCase()) {
        case TypeTag.COOPERADO:
        case TypeTag.REPRESENTANTE:
          result = await this.repository.putCooperadoTagCopy(tagCopy, username);
          break;
        case TypeTag.SOCIO:
          result = await this.repository.putSocioTagCopy(tagCopy, username);
          break;
        case TypeTag.FAMILIAR:
          result = await this.repository.putFamiliarTagCopy(tagCopy, username);
          break;
        case TypeTag.VISITANTE:
          result = await this.repository.putVisitanteTagCopy(tagCopy, username);
          break;
        default:
          throw new BadRequestException('Tipo de etiqueta inválido !');
      }
      return result;
    } catch (err) {
      throw err;
    }
  }

  async getReportTag(eventId: number) {
    try {
      let result = await this.repository.getReportTag(eventId);

      if (!result.cd_status) throw result.ds_mensagem;

      return result.ds_relatorio[0];
    } catch (err) {
      throw err;
    }
  }
}
