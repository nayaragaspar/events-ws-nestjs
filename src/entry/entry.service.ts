import { Injectable } from '@nestjs/common';
import Utils from 'src/utils/utils';
import TagRepository from '../tag/tag.repository';
import { EntryDto } from './entry.model';
import EntryRepository from './entry.repository';

@Injectable()
export class EntryService {
  private readonly entryRepository: EntryRepository;
  private readonly tagRepository: TagRepository;

  constructor() {
    this.tagRepository = new TagRepository();
    this.entryRepository = new EntryRepository();
  }

  async postEntry(entry: EntryDto, username: string) {
    try {
      let result;

      if (entry.tipo == 'visitante') {
        result = await this.entryRepository.postVisitantEntry(entry, username);
      } else {
        result = await this.entryRepository.postEntry(entry, username);
      }

      return result;
    } catch (err) {
      throw err;
    }
  }

  async getEntryList(eventId: number) {
    try {
      let result;

      result = await this.entryRepository.getEntryList(eventId);

      return result;
    } catch (err) {
      throw err;
    }
  }

  async getEntry(tipo: string, cpf_cnpj: string, eventId: number) {
    try {
      let result;

      result = await this.entryRepository.getEntry(tipo, cpf_cnpj, eventId);
      if (result.cd_status == false) {
        throw result.ds_mensagem;
      }

      if (
        tipo.toUpperCase() == 'COOPERADO' ||
        tipo.toUpperCase() == 'REPRESENTANTE'
      ) {
        result = result.ds_cooperado[0];
        result.nr_cpf_cnpj_cooperado = Utils.getFormattedCpfCnpj(
          result.nr_cpf_cnpj_cooperado,
        );

        if (result.nr_cpf_cnpj_representante)
          result.nr_cpf_cnpj_representante = Utils.getFormattedCpfCnpj(
            result.nr_cpf_cnpj_representante,
          );
      } else {
        result = result.ds_participante[0];
        result.nr_cpf_cnpj = Utils.getFormattedCpfCnpj(result.nr_cpf_cnpj);
      }

      return result;
    } catch (err) {
      throw err;
    }
  }

  async getEntryHistory(cpf_cnpj: string, eventId: number) {
    try {
      let result;

      result = await this.entryRepository.getEntryHistory(cpf_cnpj, eventId);

      return result;
    } catch (err) {
      throw err;
    }
  }

  async getEntryReport(eventId: number) {
    try {
      let result;

      result = await this.entryRepository.getEntryReport(eventId);

      if (!result.cd_status) throw result.ds_mensagem;

      return result.ds_relatorio[0];
    } catch (err) {
      throw err;
    }
  }

  async getRecordReport(eventId: number) {
    try {
      let result;

      result = await this.entryRepository.getRecordReport(eventId);

      if (!result.cd_status) throw result.ds_mensagem;

      return result.ds_relatorio[0];
    } catch (err) {
      throw err;
    }
  }

  async getMonitor(eventId: number) {
    try {
      let result = await this.tagRepository.getMonitor(eventId);

      return {
        eventId,
        total: result.qt_publico_presente,
        cooperado: result.ds_presentes[0].qt_cooperados,
        partner: result.ds_presentes[0].qt_socio,
        familiar: result.ds_presentes[0].qt_familiar,
        visitant: result.ds_presentes[0].qt_visitantes,
      };
    } catch (err) {
      throw err;
    }
  }

  async hasEntry(eventId: number, cpf_cnpj: string): Promise<boolean> {
    try {
      let result = await this.entryRepository.countEntries(eventId, cpf_cnpj);

      return result > 0;
    } catch (err) {
      throw err;
    }
  }
}
