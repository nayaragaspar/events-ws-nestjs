import DatabaseService from '../database/database.service';
import { CustomLogger } from '../logger/custom-logger.service';
import Utils from '../utils/utils';
import { EntryDto } from './entry.model';

const oracledb = require('oracledb');

oracledb.outFormat = oracledb.OUT_FORMAT_ARRAY;

export default class EntryRepository {
  private logger = new CustomLogger();
  private databaseService: DatabaseService;

  constructor() {
    this.databaseService = new DatabaseService();
    this.logger.setContext('EntryRepository');
  }

  async postVisitantEntry(entry: EntryDto, username: string) {
    this.logger.debug('postVisitantEntry... ');

    let oracleConn;
    try {
      oracleConn = await this.databaseService.openPoolConnection();
      const result = await oracleConn.execute(
        `
        begin
          cadastrar_entrada_visitante_prc(:p_id_evento, :p_cpf_cnpj_visitante, :p_nm_usuario, :x_retorno);
        end;
        `,
        {
          p_id_evento: entry.id_evento,
          p_cpf_cnpj_visitante: entry.cpf_cnpj.replace(/\D/g, ''),
          p_nm_usuario: username.trim(),
          x_retorno: {
            dir: oracledb.BIND_OUT,
            type: oracledb.DB_TYPE_NVARCHAR,
            maxSize: 50000,
          },
        }
      );

      this.logger.debug(`entry visitante result: ${result.outBinds.x_retorno}`);

      return JSON.parse(result.outBinds.x_retorno);
    } catch (err) {
      throw err;
    } finally {
      if (oracleConn) {
        await oracleConn.close();
        this.logger.debug('postVisitantEntry - Oracle connection closed.');
      }
    }
  }

  async postEntry(entry: EntryDto, username: string) {
    this.logger.debug('postEntry... ');

    let oracleConn;
    try {
      oracleConn = await this.databaseService.openPoolConnection();
      const result = await oracleConn.execute(
        `
        begin
          cadastrar_entrada_prc(:p_nr_cpf_cnpj, :p_id_evento, :p_nm_usuario_criacao, :x_retorno);
        end;
        `,
        {
          p_id_evento: entry.id_evento,
          p_nr_cpf_cnpj: entry.cpf_cnpj.replace(/\D/g, ''),
          p_nm_usuario_criacao: username.trim(),
          x_retorno: {
            dir: oracledb.BIND_OUT,
            type: oracledb.DB_TYPE_NVARCHAR,
            maxSize: 50000,
          },
        }
      );

      this.logger.debug(`post entry result: ${result.outBinds.x_retorno}`);

      return JSON.parse(result.outBinds.x_retorno);
    } catch (err) {
      throw err;
    } finally {
      if (oracleConn) {
        await oracleConn.close();
        this.logger.debug('postEntry - Oracle connection closed.');
      }
    }
  }

  async getEntryList(eventId: number) {
    this.logger.debug('getEntryList... ');

    let oracleConn,
      retorno = [];
    try {
      oracleConn = await this.databaseService.openPoolConnection();
      const result = await oracleConn.execute(
        `
        begin
          listar_entradas_prc(:p_id_evento, :x_dados_retorno);
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

      this.logger.debug(`entry list result: ${JSON.stringify(rows)}`);

      rows.forEach((row) => {
        let index_row = retorno.map((e) => e.nr_cpf_cnpj).indexOf(Utils.getFormattedCpfCnpj(row[4]));
        if (index_row > -1) {
          retorno[index_row]['cd_matricula'] = `${retorno[index_row]['cd_matricula']}, ${row[0]}`;
          retorno[index_row]['filial'] = retorno[index_row]['filial'].includes(row[3])
            ? retorno[index_row]['filial']
            : `${retorno[index_row]['filial']}, ${row[3]}`;
        } else {
          retorno.push({
            cd_matricula: row[0],
            nm_participante: row[1],
            tipo_participante: row[2],
            filial: row[3],
            nr_cpf_cnpj: Utils.getFormattedCpfCnpj(row[4]),
            dt_etiqueta: row[5],
            qt_vias: row[6],
          });
        }
      });

      return retorno;
    } catch (err) {
      throw err;
    } finally {
      if (oracleConn) {
        await oracleConn.close();
        this.logger.debug('getEntryList - Oracle connection closed.');
      }
    }
  }

  async getEntry(tipo: string, cpf_cnpj: string, eventId: number) {
    this.logger.debug('getEntry... ');

    let oracleConn;
    try {
      oracleConn = await this.databaseService.openPoolConnection();
      const result = await oracleConn.execute(
        `
        begin
          busca_dados_entrada_prc(:p_tp_controle, :p_nr_cpf_cnpj, :p_id_evento, :x_saida_json);
        end;
        `,
        {
          p_tp_controle: tipo,
          p_nr_cpf_cnpj: `${cpf_cnpj.replace(/\D/g, '')}`,
          p_id_evento: eventId,
          x_saida_json: {
            dir: oracledb.BIND_OUT,
            type: oracledb.DB_TYPE_NVARCHAR,
            maxSize: 50000,
          },
        }
      );

      this.logger.debug(`get entry result: ${result.outBinds.x_saida_json}`);

      return JSON.parse(result.outBinds.x_saida_json);
    } catch (err) {
      throw err;
    } finally {
      if (oracleConn) {
        await oracleConn.close();
        this.logger.debug('getEntry - Oracle connection closed.');
      }
    }
  }

  async getEntryHistory(cpf_cnpj: string, eventId: number) {
    this.logger.debug('getEntryHistory... ');

    let oracleConn;
    try {
      oracleConn = await this.databaseService.openPoolConnection();
      const result = await oracleConn.execute(
        `
        begin
          listar_hist_entradas_prc(:p_id_evento, :p_nr_cpf_cnpj, :x_dados_retorno);
        end;
        `,
        {
          p_id_evento: eventId,
          p_nr_cpf_cnpj: `${cpf_cnpj.replace(/\D/g, '')}`,
          x_dados_retorno: {
            dir: oracledb.BIND_OUT,
            type: oracledb.DB_TYPE_CURSOR,
          },
        }
      );

      const rows = await result.outBinds.x_dados_retorno.getRows();

      this.logger.debug(`entry history result: ${JSON.stringify(rows)}`);

      if (rows.length > 0) {
        let retorno = {
          tp_participante: rows[0][1],
          nm_participante: rows[0][2],
          entradas: [],
        };

        rows.forEach((row) => {
          retorno.entradas.push(row[0]);
        });

        return retorno;
      }

      return;
    } catch (err) {
      throw err;
    } finally {
      if (oracleConn) {
        await oracleConn.close();
        this.logger.debug('getEntryHistory - Oracle connection closed.');
      }
    }
  }

  async getEntryReport(eventId: number) {
    this.logger.debug('getEntryReport... ');

    let oracleConn;
    try {
      oracleConn = await this.databaseService.openPoolConnection();
      const result = await oracleConn.execute(
        `
        begin
          relatorio_presenca_prc(:p_id_evento, :x_saida_json);
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

      this.logger.debug(`entry report result: ${result.outBinds.x_saida_json}`);

      return JSON.parse(result.outBinds.x_saida_json);
    } catch (err) {
      throw err;
    } finally {
      if (oracleConn) {
        await oracleConn.close();
        this.logger.debug('getEntryReport - Oracle connection closed.');
      }
    }
  }

  async getRecordReport(eventId: number) {
    this.logger.debug('getRecordReport... ');

    let oracleConn;
    try {
      oracleConn = await this.databaseService.openPoolConnection();
      const result = await oracleConn.execute(
        `
        begin
          relatorio_livro_prc(:p_id_evento, :x_saida_json);
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

      this.logger.debug(`entry record report: ${result.outBinds.x_saida_json}`);

      return JSON.parse(result.outBinds.x_saida_json);
    } catch (err) {
      throw err;
    } finally {
      if (oracleConn) {
        await oracleConn.close();
        this.logger.debug('getRecordReport - Oracle connection closed.');
      }
    }
  }

  async countEntries(eventId: number, cpf_cnpj: string) {
    this.logger.debug(`countEntries: ${cpf_cnpj}`);

    let oracleConn, result;

    try {
      oracleConn = await this.databaseService.openPoolConnection();

      result = await oracleConn.execute(
        `select count(*) 
            from xcxp_sca_entrada_participante xsep
            where xsep.nr_cpf_cnpj_participante = :cpf_cnpj
            and xsep.id_evento = :evento
            and xsep.dt_entrada_partic IS NOT NULL`,
        [`${cpf_cnpj.replace(/\D/g, '')}`, eventId]
      );
      this.logger.debug(`countEntries: ${result.rows}`);

      return result.rows;
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      if (oracleConn) {
        await oracleConn.close();
        this.logger.debug('countEntries - Oracle connection closed.');
      }
    }
  }
}
