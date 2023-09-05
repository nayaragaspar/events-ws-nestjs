import DatabaseService from '../database/database.service';
import { CustomLogger } from '../logger/custom-logger.service';
import Utils from '../utils/utils';
import { CooperadoTagDto, FamiliarTagDto, PartnerTagDto, TagCopyDto, VisitantTagDto } from './tag.model';

const oracledb = require('oracledb');

oracledb.outFormat = oracledb.OUT_FORMAT_ARRAY;

export default class TagRepository {
  private logger = new CustomLogger();
  private databaseService: DatabaseService;

  constructor() {
    this.databaseService = new DatabaseService();
    this.logger.setContext('TagRepository');
  }

  async postCooperadoTag(cooperadoTag: CooperadoTagDto, username: string) {
    this.logger.debug('postCooperadoTag... ');

    let oracleConn;
    try {
      oracleConn = await this.databaseService.openPoolConnection();
      const result = await oracleConn.execute(
        `
        begin
          emitir_etiqueta_coop_prc(:p_nr_cpf_cnpj, :p_id_evento, :p_nm_usuario_criacao, :p_cd_matricula, :x_saida_json);
        end;
        `,
        {
          p_nr_cpf_cnpj: cooperadoTag.cpf_cnpj.replace(/\D/g, ''),
          p_id_evento: cooperadoTag.id_evento,
          p_nm_usuario_criacao: username.trim(),
          p_cd_matricula: cooperadoTag.cd_matricula,
          x_saida_json: {
            dir: oracledb.BIND_OUT,
            type: oracledb.DB_TYPE_NVARCHAR,
            maxSize: 50000,
          },
        }
      );

      this.logger.debug(`tag cooperado result: ${result.outBinds.x_saida_json}`);

      return JSON.parse(result.outBinds.x_saida_json);
    } catch (err) {
      throw err;
    } finally {
      if (oracleConn) {
        await oracleConn.close();
        this.logger.debug('postCooperadoTag - Oracle connection closed.');
      }
    }
  }

  async postPartnerTag(tag: PartnerTagDto, username: string) {
    this.logger.debug('postCooperadoTag... ');

    let oracleConn;
    try {
      oracleConn = await this.databaseService.openPoolConnection();
      const result = await oracleConn.execute(
        `
        begin
          emitir_etiqueta_socio_prc(:p_nr_cpf_cnpj_socio, :p_id_evento, :p_nm_usuario_criacao, :x_saida_json);
        end;
        `,
        {
          p_nr_cpf_cnpj_socio: tag.cpf_cnpj_socio.replace(/\D/g, ''),
          p_id_evento: tag.id_evento,
          p_nm_usuario_criacao: username.trim(),
          x_saida_json: {
            dir: oracledb.BIND_OUT,
            type: oracledb.DB_TYPE_NVARCHAR,
            maxSize: 50000,
          },
        }
      );

      this.logger.debug(`tag sócio result: ${result.outBinds.x_saida_json}`);

      return JSON.parse(result.outBinds.x_saida_json);
    } catch (err) {
      throw err;
    } finally {
      if (oracleConn) {
        await oracleConn.close();
        this.logger.debug('postPartnerTag - Oracle connection closed.');
      }
    }
  }

  async postFamiliarTag(tag: FamiliarTagDto, username: string) {
    this.logger.debug('postFamiliarTag... ');

    let oracleConn;
    try {
      oracleConn = await this.databaseService.openPoolConnection();
      const result = await oracleConn.execute(
        `
        begin
          emitir_etiqueta_familiar_prc(:p_nr_cpf_cnpj_familiar, :p_nr_cpf_cnpj_cooperado, :p_nm_familiar, :p_id_evento, :p_nm_usuario_criacao, :x_saida_json);
        end;
        `,
        {
          p_nr_cpf_cnpj_familiar: tag.cpf_cnpj_familiar ? tag.cpf_cnpj_familiar.replace(/\D/g, '') : '',
          p_nr_cpf_cnpj_cooperado: tag.cpf_cnpj_cooperado.replace(/\D/g, ''),
          p_nm_familiar: tag.nm_familiar,
          p_id_evento: tag.id_evento,
          p_nm_usuario_criacao: username.trim(),
          x_saida_json: {
            dir: oracledb.BIND_OUT,
            type: oracledb.DB_TYPE_NVARCHAR,
            maxSize: 50000,
          },
        }
      );

      this.logger.debug(`tag familiar result: ${result.outBinds.x_saida_json}`);

      return JSON.parse(result.outBinds.x_saida_json);
    } catch (err) {
      throw err;
    } finally {
      if (oracleConn) {
        await oracleConn.close();
        this.logger.debug('postFamiliarTag - Oracle connection closed.');
      }
    }
  }

  async postVisitantTag(tag: VisitantTagDto, username: string) {
    this.logger.debug('postCooperadoTag... ');

    let oracleConn;
    try {
      oracleConn = await this.databaseService.openPoolConnection();
      const result = await oracleConn.execute(
        `
        begin
          emitir_etiqueta_visitante_prc(:p_id_evento, :p_nm_visitante, :p_nr_cpf_cnpj_visitante, :p_nm_municipio_visitante, 
                                                              :p_nm_usuario_criacao, :x_saida_json);
        end;
        `,
        {
          p_id_evento: tag.id_evento,
          p_nm_visitante: tag.nm_visitante,
          p_nr_cpf_cnpj_visitante: tag.cpf_cnpj_visitante ? tag.cpf_cnpj_visitante.replace(/\D/g, '') : '',
          p_nm_municipio_visitante: tag.nm_municipio,
          p_nm_usuario_criacao: username.trim(),
          x_saida_json: {
            dir: oracledb.BIND_OUT,
            type: oracledb.DB_TYPE_NVARCHAR,
            maxSize: 50000,
          },
        }
      );

      this.logger.debug(`tag visitante result: ${result.outBinds.x_saida_json}`);

      return JSON.parse(result.outBinds.x_saida_json);
    } catch (err) {
      throw err;
    } finally {
      if (oracleConn) {
        await oracleConn.close();
        this.logger.debug('postEvent - Oracle connection closed.');
      }
    }
  }

  async getTagList(eventId: number) {
    this.logger.debug('getTagList... ');

    let oracleConn,
      retorno = [];
    try {
      oracleConn = await this.databaseService.openPoolConnection();
      const result = await oracleConn.execute(
        `
        begin
          listar_etiquetas_prc(:p_id_evento, :x_dados_retorno);
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

      this.logger.debug(`tag list result: ${JSON.stringify(rows)}`);

      rows.forEach((row) => {
        let index_row = retorno.map((e) => e.nr_cpf_cnpj).indexOf(Utils.getFormattedCpfCnpj(row[4]));
        if (index_row > -1 && row[2] == 'COOPERADO') {
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
        this.logger.debug('getTagList - Oracle connection closed.');
      }
    }
  }

  async getCooperadoTag(cpf_cnpj?: string, nm_cooperado?: string, cd_matricula?: string) {
    this.logger.debug('getCooperadoTag... ');
    let oracleConn,
      retorno = [];

    const cpfOrCnpjOnlyDigits = cpf_cnpj ? `${cpf_cnpj.replace(/\D/g, '')}` : '';
    try {
      oracleConn = await this.databaseService.openPoolConnection();
      const result = await oracleConn.execute(
        `
        begin
          encontrar_cooperado_prc(:p_nr_cpf_cnpj , :p_nm_cooperado, :p_cd_matricula, :x_dados_retorno);
        end;
        `,
        {
          p_nr_cpf_cnpj: cpfOrCnpjOnlyDigits,
          p_nm_cooperado: nm_cooperado,
          p_cd_matricula: cd_matricula,
          x_dados_retorno: {
            dir: oracledb.BIND_OUT,
            type: oracledb.DB_TYPE_CURSOR,
          },
        }
      );
      const rows = await result.outBinds.x_dados_retorno.getRows();

      this.logger.debug(`get cooperado result: ${JSON.stringify(rows)}`);

      if (cpf_cnpj) {
        let r = {
          cpf_cnpj,
          nm_cooperado: rows[0][0],
          matriculas: [],
        };
        rows.forEach((row) => {
          r.matriculas.push({
            cd_matricula: row[2],
            nm_filial: row[3],
          });
        });

        return r;
      } else {
        rows.forEach((row) => {
          retorno.push({
            nm_cooperado: row[0],
            cpf_cnpj: Utils.getFormattedCpfCnpj(row[1]),
            cd_matricula: row[2],
            nm_filial: row[3],
          });
        });

        return retorno;
      }
    } catch (err) {
      throw err;
    } finally {
      if (oracleConn) {
        await oracleConn.close();
        this.logger.debug('getCooperadoTag - Oracle connection closed.');
      }
    }
  }

  // TODO: ajustar função de acordo com PRC
  async getSocioTag(nm_socio?: string, cd_matricula?: string) {
    this.logger.debug('getCooperadoTag... ');
    let oracleConn,
      retorno = [];

    try {
      oracleConn = await this.databaseService.openPoolConnection();
      const result = await oracleConn.execute(
        `
        begin
          encontrar_socio_prc(:p_nr_cpf_cnpj, :p_nm_socio, :p_cd_matricula, :x_dados_retorno);
        end;
        `,
        {
          p_nr_cpf_cnpj: '',
          p_nm_socio: nm_socio,
          p_cd_matricula: cd_matricula,
          x_dados_retorno: {
            dir: oracledb.BIND_OUT,
            type: oracledb.DB_TYPE_CURSOR,
          },
        }
      );
      const rows = await result.outBinds.x_dados_retorno.getRows();

      this.logger.debug(`get cooperado result: ${JSON.stringify(rows)}`);

      rows.forEach((row) => {
        retorno.push({
          nm_socio: row[0],
          cpf_cnpj: Utils.getFormattedCpfCnpj(row[1]),
          cd_matricula: row[2],
          nm_filial: row[3],
        });
      });

      return retorno;
    } catch (err) {
      throw err;
    } finally {
      if (oracleConn) {
        await oracleConn.close();
        this.logger.debug('getCooperadoTag - Oracle connection closed.');
      }
    }
  }

  async getCooperadoSocioTag(id_evento: Number, tipo: string, cpf_cnpj: string) {
    this.logger.debug('getCooperadoSocioTag...');

    let oracleConn;
    try {
      oracleConn = await this.databaseService.openPoolConnection();
      const result = await oracleConn.execute(
        `
        begin
        busca_dados_etiqueta_prc(:p_id_evento, :p_tp_controle, :p_nr_cpf_cnpj, :x_saida_json);
        end;
        `,
        {
          p_id_evento: id_evento,
          p_tp_controle: tipo,
          p_nr_cpf_cnpj: `${cpf_cnpj.replace(/\D/g, '')}`,
          x_saida_json: {
            type: oracledb.VARCHAR,
            dir: oracledb.BIND_OUT,
            maxSize: 1000000,
          },
        }
      );

      this.logger.debug(`getCooperadoSocioTag result: ${result.outBinds.x_saida_json}`);

      return JSON.parse(result.outBinds.x_saida_json);
    } catch (error) {
      throw error;
    } finally {
      if (oracleConn) {
        try {
          await oracleConn.close();
          this.logger.debug('getCooperadoSocioTag - Oracle connection closed.');
        } catch (err) {
          this.logger.warn(`getCooperadoSocioTag - Error closing Oracle connection: ${err}`);
        }
      }
    }
  }

  async getMonitor(eventId: number) {
    this.logger.debug('getMonitor... ');

    let oracleConn;
    try {
      oracleConn = await this.databaseService.openPoolConnection();
      const result = await oracleConn.execute(
        `
        begin
          listar_monitor_publico_prc(:p_id_evento, :x_saida_json);
        end;
        `,
        {
          p_id_evento: eventId,
          x_saida_json: {
            dir: oracledb.BIND_OUT,
            type: oracledb.DB_TYPE_NVARCHAR,
            maxSize: 50000,
          },
        }
      );

      this.logger.debug(`get monitor result: ${result.outBinds.x_saida_json}`);

      return JSON.parse(result.outBinds.x_saida_json);
    } catch (err) {
      throw err;
    } finally {
      if (oracleConn) {
        await oracleConn.close();
        this.logger.debug('getMonitor - Oracle connection closed.');
      }
    }
  }

  async putCooperadoTagCopy(cooperadoTag: TagCopyDto, username: string) {
    this.logger.debug('putCooperadoTagCopy... ');

    let oracleConn, retorno;
    const cpfOrCnpjOnlyDigits = `${cooperadoTag.cpf_cnpj.replace(/\D/g, '')}`;

    try {
      oracleConn = await this.databaseService.openPoolConnection();
      const result = await oracleConn.execute(
        `
        begin
          emitir_segunda_via_coop_prc(:p_nr_cpf_cnpj, :p_id_evento, :p_nm_usuario, :x_saida_json);
        end;
        `,
        {
          p_nr_cpf_cnpj: cpfOrCnpjOnlyDigits,
          p_id_evento: cooperadoTag.id_evento,
          p_nm_usuario: username.trim(),
          x_saida_json: {
            dir: oracledb.BIND_OUT,
            type: oracledb.DB_TYPE_NVARCHAR,
            maxSize: 50000,
          },
        }
      );

      this.logger.debug(`tag 2ª via: ${result.outBinds.x_saida_json}`);

      retorno = JSON.parse(result.outBinds.x_saida_json);
      if (retorno.cd_status == true) {
        retorno.ds_cooperado.forEach((cooperado) => {
          cooperado.nr_cpf_cnpj_cooperado = Utils.getFormattedCpfCnpj(cooperado.nr_cpf_cnpj_cooperado.trim());
          if (cooperado.nr_cpf_cnpj_representante) {
            cooperado.nr_cpf_cnpj_representante = Utils.getFormattedCpfCnpj(cooperado.nr_cpf_cnpj_representante.trim());
          }
        });

        return retorno.ds_cooperado[0];
      }

      return retorno;
    } catch (err) {
      throw err;
    } finally {
      if (oracleConn) {
        await oracleConn.close();
        this.logger.debug('putCooperadoTagCopy - Oracle connection closed.');
      }
    }
  }

  async putSocioTagCopy(socioTagCopy: TagCopyDto, username: string) {
    this.logger.debug('putSocioTagCopy... ');

    let oracleConn, retorno;
    const cpfOrCnpjOnlyDigits = `${socioTagCopy.cpf_cnpj.replace(/\D/g, '')}`;

    try {
      oracleConn = await this.databaseService.openPoolConnection();
      const result = await oracleConn.execute(
        `
        begin
          emitir_segunda_via_socio_prc(:p_nr_cpf_cnpj, :p_id_evento, :p_nm_usuario, :x_saida_json);
        end;
        `,
        {
          p_nr_cpf_cnpj: cpfOrCnpjOnlyDigits,
          p_id_evento: socioTagCopy.id_evento,
          p_nm_usuario: username.trim(),
          x_saida_json: {
            dir: oracledb.BIND_OUT,
            type: oracledb.DB_TYPE_NVARCHAR,
            maxSize: 50000,
          },
        }
      );

      this.logger.debug(`put sócio result: ${result.outBinds.x_saida_json}`);

      retorno = JSON.parse(result.outBinds.x_saida_json);
      if (retorno.cd_status == true) {
        retorno.ds_socio.forEach((socio) => {
          socio.nr_cpf_cnpj_socio = Utils.getFormattedCpfCnpj(socio.nr_cpf_cnpj_socio.trim());
        });

        return retorno.ds_socio[0];
      }
      return retorno;
    } catch (err) {
      throw err;
    } finally {
      if (oracleConn) {
        await oracleConn.close();
        this.logger.debug('putSocioTagCopy - Oracle connection closed.');
      }
    }
  }

  async putFamiliarTagCopy(socioTagCopy: TagCopyDto, username: string) {
    this.logger.debug('putFamiliarTagCopy... ');

    let oracleConn, retorno;
    const cpfOrCnpjOnlyDigits = `${socioTagCopy.cpf_cnpj.replace(/\D/g, '')}`;

    try {
      oracleConn = await this.databaseService.openPoolConnection();
      const result = await oracleConn.execute(
        `
        begin
          emitir_segunda_via_familiar_prc(:p_nr_cpf_cnpj, :p_id_evento, :p_nm_usuario, :x_saida_json);
        end;
        `,
        {
          p_nr_cpf_cnpj: cpfOrCnpjOnlyDigits,
          p_id_evento: socioTagCopy.id_evento,
          p_nm_usuario: username.trim(),
          x_saida_json: {
            dir: oracledb.BIND_OUT,
            type: oracledb.DB_TYPE_NVARCHAR,
            maxSize: 50000,
          },
        }
      );

      this.logger.debug(`put familiar result: ${result.outBinds.x_saida_json}`);

      retorno = JSON.parse(result.outBinds.x_saida_json);
      if (retorno.cd_status == true) {
        retorno.ds_familiar.forEach((familiar) => {
          familiar.nr_cpf_cnpj_familiar = Utils.getFormattedCpfCnpj(familiar.nr_cpf_cnpj_familiar.trim());
        });

        return retorno.ds_familiar[0];
      }

      return retorno;
    } catch (err) {
      throw err;
    } finally {
      if (oracleConn) {
        await oracleConn.close();
        this.logger.debug('putFamiliarTagCopy - Oracle connection closed.');
      }
    }
  }

  async putVisitanteTagCopy(visitanteTagCopy: TagCopyDto, username: string) {
    this.logger.debug('putVisitanteTagCopy... ');

    let oracleConn, retorno;
    const cpfOrCnpjOnlyDigits = `${visitanteTagCopy.cpf_cnpj.replace(/\D/g, '')}`;

    try {
      oracleConn = await this.databaseService.openPoolConnection();
      const result = await oracleConn.execute(
        `
        begin
          emitir_segunda_via_visi_prc(:p_nr_cpf_cnpj, :p_id_evento, :p_nm_usuario, :x_saida_json);
        end;
        `,
        {
          p_nr_cpf_cnpj: cpfOrCnpjOnlyDigits,
          p_id_evento: visitanteTagCopy.id_evento,
          p_nm_usuario: username.trim(),
          x_saida_json: {
            dir: oracledb.BIND_OUT,
            type: oracledb.DB_TYPE_NVARCHAR,
            maxSize: 50000,
          },
        }
      );

      this.logger.debug(`put visitante result: ${result.outBinds.x_saida_json}`);

      retorno = JSON.parse(result.outBinds.x_saida_json);
      if (retorno.cd_status == true) {
        retorno.ds_visitante.forEach((visitante) => {
          visitante.nr_cpf_cnpj = Utils.getFormattedCpfCnpj(visitante.nr_cpf_cnpj.trim());
        });

        return retorno.ds_visitante[0];
      }
      return retorno;
    } catch (err) {
      throw err;
    } finally {
      if (oracleConn) {
        await oracleConn.close();
        this.logger.debug('putVisitanteTagCopy - Oracle connection closed.');
      }
    }
  }

  async getReportTag(eventId: number) {
    this.logger.debug('getReportTag... ');

    let oracleConn;
    try {
      oracleConn = await this.databaseService.openPoolConnection();
      const result = await oracleConn.execute(
        `
        begin
          relatorio_credenciamento_prc(:p_id_evento, :x_saida_json);
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

      this.logger.debug(`tag relatório result: ${result.outBinds.x_saida_json}`);

      return JSON.parse(result.outBinds.x_saida_json);
    } catch (err) {
      throw err;
    } finally {
      if (oracleConn) {
        await oracleConn.close();
        this.logger.debug('getReportTag - Oracle connection closed.');
      }
    }
  }
}
