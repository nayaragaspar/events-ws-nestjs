import { Injectable } from '@nestjs/common';
import DatabaseService from '../database/database.service';
import { CustomLogger } from '../logger/custom-logger.service';
import { VoteDto, VoterDto } from './vote.model';

const oracledb = require('oracledb');
@Injectable()
export default class VoteRepository {
  private logger = new CustomLogger();
  private databaseService: DatabaseService;

  constructor() {
    this.databaseService = new DatabaseService();
    this.logger.setContext('VoteRepository');
  }

  async createVote(vote: VoteDto, matricula: string, username: string) {
    this.logger.debug('createVote... ');

    let oracleConn;
    const cpfOrCnpjOnlyDigits = `${vote.nr_cpf_cnpj.replace(/\D/g, '')}`;

    try {
      oracleConn = await this.databaseService.openPoolConnection();
      const result = await oracleConn.execute(
        `
          begin
            cadastrar_voto_prc(:p_id_evento, :p_id_assunto, :p_nr_cpf_cnpj, :p_cd_matricula, :p_nm_usuario, :x_retorno);
          end;
          `,
        {
          p_id_evento: vote.id_evento,
          p_id_assunto: vote.id_assunto,
          p_nr_cpf_cnpj: cpfOrCnpjOnlyDigits,
          p_cd_matricula: matricula,
          p_nm_usuario: username.trim(),
          x_retorno: {
            dir: oracledb.BIND_OUT,
            type: oracledb.DB_TYPE_NVARCHAR,
            maxSize: 50000,
          },
        }
      );

      this.logger.debug(`post vote result: ${result.outBinds.x_retorno}`);

      return JSON.parse(result.outBinds.x_retorno);
    } catch (err) {
      throw err;
    } finally {
      if (oracleConn) {
        await oracleConn.close();
        this.logger.debug('createVote - Oracle connection closed.');
      }
    }
  }

  async getMonitor(eventId: number) {
    this.logger.debug(`getVote: ${eventId}`);

    let oracleConn;
    try {
      oracleConn = await this.databaseService.openPoolConnection();
      const result = await oracleConn.execute(
        `
        begin
          listar_monitor_votacao_prc(:p_id_evento, :x_retorno);
        end;
        `,
        {
          p_id_evento: eventId,
          x_retorno: {
            dir: oracledb.BIND_OUT,
            type: oracledb.DB_TYPE_NVARCHAR,
            maxSize: 50000,
          },
        }
      );

      this.logger.debug(`get vote monitor result: ${result.outBinds.x_retorno}`);

      return JSON.parse(result.outBinds.x_retorno);
    } catch (err) {
      throw err;
    } finally {
      if (oracleConn) {
        await oracleConn.close();
        this.logger.debug('getVote - Oracle connection closed.');
      }
    }
  }

  async getVotes(subjectId: number, cpf_cnpj: string) {
    this.logger.debug(`getVotes: ${subjectId}, ${cpf_cnpj}`);

    let oracleConn, result;

    try {
      oracleConn = await this.databaseService.openPoolConnection();

      result = await oracleConn.execute(
        `select xsep.cd_matricula
            from xcxp_sca_votacao xsv 
            inner join xcxp_sca_entrada_participante xsep
              on xsv.id_entrada_participante = xsep.id_entrada_participante
            where xsv.id_assunto = :id_assunto
              and xsep.nr_cpf_cnpj_participante = :cpf_cnpj`,
        [subjectId, `${cpf_cnpj.replace(/\D/g, '')}`]
      );
      this.logger.debug(`getVotes: ${result.rows}`);

      return result.rows;
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      if (oracleConn) {
        await oracleConn.close();
        this.logger.debug('getVotes - Oracle connection closed.');
      }
    }
  }

  async createSheetVoter(voter: VoterDto, username: string) {
    this.logger.debug('createVoter... ');

    let oracleConn;
    try {
      oracleConn = await this.databaseService.openPoolConnection();
      const result = await oracleConn.execute(
        `
          begin
            importar_planilha_votante_prc(:p_id_evento, :p_nr_cpf_cnpj, :p_cd_matricula, :p_nm_representante, 
                                                                :p_nr_cpf_cnpj_representante, :p_ds_justificativa, :p_nm_usuario_criacao, :x_retorno);
          end;
          `,
        {
          p_id_evento: voter.id_evento,
          p_nr_cpf_cnpj: `${voter.nr_cpf_cnpj.replace(/\D/g, '')}`,
          p_cd_matricula: voter.cd_matricula,
          p_nm_representante: voter.nm_representante,
          p_nr_cpf_cnpj_representante: `${voter.nr_cpf_cnpj_representante.replace(/\D/g, '')}`,
          p_ds_justificativa: voter.ds_justificativa,
          p_nm_usuario_criacao: username.trim(),
          x_retorno: {
            dir: oracledb.BIND_OUT,
            type: oracledb.DB_TYPE_NVARCHAR,
            maxSize: 5000,
          },
        }
      );

      this.logger.debug(`planilha vote result: ${result.outBinds.x_retorno}`);

      return JSON.parse(result.outBinds.x_retorno);
    } catch (err) {
      throw err;
    } finally {
      if (oracleConn) {
        await oracleConn.close();
        this.logger.debug('createVoter - Oracle connection closed.');
      }
    }
  }

  async createVoter(voter: VoterDto, username: string) {
    this.logger.debug('createVoter... ');

    let oracleConn;
    try {
      oracleConn = await this.databaseService.openPoolConnection();
      const result = await oracleConn.execute(
        `
          begin
            inserir_votante_prc(:p_id_evento, :p_nr_cpf_cnpj, :p_cd_matricula, :p_nm_representante, 
                                                                :p_nr_cpf_cnpj_representante, :p_ds_justificativa, :p_nm_usuario_criacao, :x_retorno);
          end;
          `,
        {
          p_id_evento: voter.id_evento,
          p_nr_cpf_cnpj: `${voter.nr_cpf_cnpj.replace(/\D/g, '')}`,
          p_cd_matricula: voter.cd_matricula,
          p_nm_representante: voter.nm_representante,
          p_nr_cpf_cnpj_representante: `${voter.nr_cpf_cnpj_representante.replace(/\D/g, '')}`,
          p_ds_justificativa: voter.ds_justificativa,
          p_nm_usuario_criacao: username.trim(),
          x_retorno: {
            dir: oracledb.BIND_OUT,
            type: oracledb.DB_TYPE_NVARCHAR,
            maxSize: 5000,
          },
        }
      );

      this.logger.debug(`post voter result: ${result.outBinds.x_retorno}`);

      return result.outBinds.x_retorno;
    } catch (err) {
      throw err;
    } finally {
      if (oracleConn) {
        await oracleConn.close();
        this.logger.debug('createVoter - Oracle connection closed.');
      }
    }
  }

  async deleteSheet(eventId: number) {
    this.logger.debug('deleteSheet... ');

    let oracleConn;
    try {
      oracleConn = await this.databaseService.openPoolConnection();
      const result = await oracleConn.execute(
        `
          begin
            limpar_planilha_votante_prc(:p_id_evento, :x_retorno);
          end;
          `,
        {
          p_id_evento: eventId,
          x_retorno: {
            dir: oracledb.BIND_OUT,
            type: oracledb.DB_TYPE_NVARCHAR,
            maxSize: 500,
          },
        }
      );

      this.logger.debug(`delete planilha result: ${result.outBinds.x_retorno}`);

      return result.outBinds.x_retorno;
    } catch (err) {
      throw err;
    } finally {
      if (oracleConn) {
        await oracleConn.close();
        this.logger.debug('deleteSheet - Oracle connection closed.');
      }
    }
  }

  async getExceptionReport(eventId: number) {
    this.logger.debug('getExceptionReport... ');

    let oracleConn;
    try {
      oracleConn = await this.databaseService.openPoolConnection();
      const result = await oracleConn.execute(
        `
        begin
          relatorio_inserir_votante_prc(:p_id_evento, :x_saida_json);
        end;
        `,
        {
          p_id_evento: eventId,
          x_saida_json: {
            dir: oracledb.BIND_OUT,
            type: oracledb.DB_TYPE_NVARCHAR,
            maxSize: 10000000,
          },
        }
      );

      this.logger.debug(`getExceptionReport result: ${result.outBinds.x_saida_json}`);

      return JSON.parse(result.outBinds.x_saida_json);
    } catch (err) {
      throw err;
    } finally {
      if (oracleConn) {
        await oracleConn.close();
        this.logger.debug('getExceptionReport - Oracle connection closed.');
      }
    }
  }

  async getVoteReport(eventId: number, subjectId: number) {
    this.logger.debug('getVoteReport... ');

    let oracleConn, result;
    try {
      oracleConn = await this.databaseService.openPoolConnection();
      result = await oracleConn.execute(
        `
        begin
          relatorio_votacao_prc(:p_id_evento, :p_id_assunto, :x_saida_json);
        end;
        `,
        {
          p_id_evento: eventId,
          p_id_assunto: subjectId,
          x_saida_json: {
            dir: oracledb.BIND_OUT,
            type: oracledb.DB_TYPE_NVARCHAR,
            maxSize: 10000000,
          },
        }
      );
      this.logger.debug(`getVoteReport result: ${result.outBinds.x_saida_json}`);

      return JSON.parse(result.outBinds.x_saida_json);
    } catch (err) {
      throw err;
    } finally {
      if (oracleConn) {
        await oracleConn.close();
        this.logger.debug('getVoteReport - Oracle connection closed.');
      }
    }
  }

  async lastUpload(eventId: number) {
    this.logger.debug(`lastUpload(${eventId})`);

    let oracleConn, result;
    try {
      oracleConn = await this.databaseService.openPoolConnection();

      result = await oracleConn.execute(
        `select max(a.dt_criacao) from xcxp_sca_cooperado_votante a where a.id_evento = :id`,
        [eventId] // bind value for :id
      );
      this.logger.debug(`lastUpload: ${result.rows}`);

      return result.rows;
    } catch (err) {
      throw err;
    } finally {
      if (oracleConn) {
        await oracleConn.close();
        this.logger.debug('getVoteReport - Oracle connection closed.');
      }
    }
  }

  async exportSheet(eventId: number) {
    this.logger.debug(`exportSheet(${eventId})`);

    let oracleConn, result;
    try {
      oracleConn = await this.databaseService.openPoolConnection();

      result = await oracleConn.execute(
        `
        begin
          exportar_planilha_votante_prc(:p_id_evento, :x_dados_retorno);
        end;
        `,
        {
          p_id_evento: eventId,
          x_dados_retorno: {
            dir: oracledb.BIND_OUT,
            type: oracledb.DB_TYPE_CURSOR,
          },
        }
      );

      const rows = await result.outBinds.x_dados_retorno.getRows();

      this.logger.debug(`exportSheet result: ${JSON.stringify(rows)}`);

      return rows;
    } catch (err) {
      throw err;
    } finally {
      if (oracleConn) {
        await oracleConn.close();
        this.logger.debug('exportSheet - Oracle connection closed.');
      }
    }
  }
}
