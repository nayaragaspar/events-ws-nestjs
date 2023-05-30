import { Injectable } from '@nestjs/common';
import Utils from 'src/utils/utils';
import { EntryService } from '../entry/entry.service';
import { TagService } from '../tag/tag.service';
import { VoteDto, VoterDto, VoterSheetDto } from './vote.model';
import VoteRepository from './vote.repository';

@Injectable()
export class VoteService {
  constructor(
    private repository: VoteRepository,
    private tagService: TagService,
    private entryService: EntryService,
  ) {}

  async createVote(vote: VoteDto, username: string) {
    try {
      let result = [];
      for (const mat of vote.cd_matriculas) {
        result.push(await this.repository.createVote(vote, mat, username));
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
        nm_evento: result.nm_evento,
        cooperados: result.cooperados,
        assuntos: result.assuntos,
      };
    } catch (err) {
      throw err;
    }
  }

  async getVote(eventId: number, subjectId: number, cpf_cnpj: string) {
    try {
      let tag = await this.tagService.getCooperadoTag(eventId, cpf_cnpj);
      let entry = await this.entryService.hasEntry(eventId, cpf_cnpj);

      if (entry) {
        let votes = await this.repository.getVotes(subjectId, cpf_cnpj);
        votes = [...new Set(votes.flat())];

        for (const m of tag.ds_matricula) {
          if (votes.includes(m.cd_matricula)) {
            m.in_voto = 'V';
          }
        }
      } else {
        for (const m of tag.ds_matricula) {
          m.in_voto = 'E';
        }
      }

      return tag;
    } catch (err) {
      throw err;
    }
  }

  async createSheetVoter(eventId, voters: VoterSheetDto[], username: string) {
    try {
      // deletar dados da tabela votante antes de inserir novos dados
      const del = await this.repository.deleteSheet(eventId);
      if (!del.includes('Sucesso')) {
        throw del;
      }

      let result = [];
      for (const voter of voters) {
        if (Utils.validateCpfCnpj(`${voter.NR_CPF_CNPJ}`)) {
          if (
            (voter.NOME_REPRESENTANTE && !voter.NR_CPF_CNPJ_REPRESENTANTE) ||
            (!voter.NOME_REPRESENTANTE && voter.NR_CPF_CNPJ_REPRESENTANTE)
          ) {
            result.push({
              ds_mensagem: 'Representante informado incompleto!',
              cooperado: voter,
            });
          } else {
            const v: VoterDto = {
              id_evento: eventId,
              cd_matricula: `${voter.MATRICULA}`,
              nr_cpf_cnpj: `${voter.NR_CPF_CNPJ}`,
              nr_cpf_cnpj_representante: voter.NR_CPF_CNPJ_REPRESENTANTE
                ? `${voter.NR_CPF_CNPJ_REPRESENTANTE}`
                : '',
              nm_representante: voter.NOME_REPRESENTANTE
                ? voter.NOME_REPRESENTANTE
                : '',
              ds_justificativa: '',
            };
            const insert = await this.repository.createSheetVoter(v, username);

            if (insert.cd_status == false) {
              result.push({
                ds_mensagem: insert.ds_mensagem,
                cooperado: voter,
              });
            }
          }
        } else {
          result.push({ ds_mensagem: 'CPF/CNPJ inválido!', cooperado: voter });
        }
      }
      return result;
    } catch (err) {
      throw err;
    }
  }

  async createVoter(voter: VoterDto, username: string) {
    try {
      if (Utils.validateCpfCnpj(`${voter.nr_cpf_cnpj}`)) {
        const insert = await this.repository.createVoter(voter, username);

        if (!insert.includes('Sucesso')) {
          throw insert;
        }

        const entrada = await this.tagService.getCooperadoTag(
          voter.id_evento,
          voter.nr_cpf_cnpj,
        );

        return entrada;
      } else {
        throw 'CPF/CNPJ inválido!';
      }
    } catch (err) {
      throw err;
    }
  }

  async lastUpload(eventId: number) {
    try {
      let result = await this.repository.lastUpload(eventId);

      return result[0][0] ? { lastUpdate: result[0][0] } : null;
    } catch (err) {
      throw err;
    }
  }

  async exportSheet(eventId: number) {
    try {
      let rows = await this.repository.exportSheet(eventId);
      let result = [];

      rows.forEach((row) => {
        result.push({
          NOME_COOPERADO: row[0],
          NR_CPF_CNPJ: row[1],
          MATRICULA: row[2],
          NOME_REPRESENTANTE: row[3],
          NR_CPF_CNPJ_REPRESENTANTE: row[4],
          STATUS_CONTA: row[5],
          DATA_ADMISSAO: row[6],
        });
      });

      return result;
    } catch (err) {
      throw err;
    }
  }

  async getExceptionReport(eventId: number) {
    try {
      let result = await this.repository.getExceptionReport(eventId);

      if (!result.cd_status) throw result.ds_mensagem;

      return result.ds_relatorio[0];
    } catch (err) {
      throw err;
    }
  }

  async getVoteReport(eventId: number, subjectId: number) {
    try {
      let result = await this.repository.getVoteReport(eventId, subjectId);

      if (result.cd_status == false) {
        throw result.ds_mensagem;
      }

      return result.ds_relatorio[0];
    } catch (err) {
      throw err;
    }
  }
}
