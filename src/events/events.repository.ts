import DatabaseService from '../database/database.service';
import { CustomLogger } from '../logger/custom-logger.service';
import { EventsDto, UpdateEventsDto } from './events.model';

const oracledb = require('oracledb');

oracledb.outFormat = oracledb.OUT_FORMAT_ARRAY;

export default class EventRepository {
  private logger = new CustomLogger();
  private databaseService: DatabaseService;

  constructor() {
    this.databaseService = new DatabaseService();
    this.logger.setContext('EventsRepository');
  }

  async getEvents() {
    this.logger.debug('getEvents... ');

    let oracleConn;
    try {
      oracleConn = await this.databaseService.openPoolConnection();
      const result = await oracleConn.execute(
        `
        begin
          xcxp_sca_controle_pkg.listar_eventos_prc(:x_saida_json);
        end;
        `,
        {
          x_saida_json: {
            dir: oracledb.BIND_OUT,
            type: oracledb.DB_TYPE_NVARCHAR,
            maxSize: 50000,
          },
        },
      );

      this.logger.debug(`get events result: ${result.outBinds.x_saida_json}`);

      return JSON.parse(result.outBinds.x_saida_json);
    } catch (err) {
      throw err;
    } finally {
      if (oracleConn) {
        await oracleConn.close();
        this.logger.debug('getEvents - Oracle connection closed.');
      }
    }
  }

  async postEvent(newEvent: EventsDto, username: string) {
    this.logger.info(`postEvent(${JSON.stringify(newEvent)})`);

    let oracleConn;

    console.log(`${newEvent.dt_evento} ${newEvent.dt_primeira_chamada}`);
    try {
      oracleConn = await this.databaseService.openPoolConnection();
      const result = await oracleConn.execute(
        `
        begin
          xcxp_sca_controle_pkg.criar_evento_prc(:p_nm_evento, :p_dt_evento, :p_nm_local, :p_dt_corte_votacao, :p_dt_primeira_chamada, 
                                                 :p_dt_segunda_chamada, :p_dt_terceira_chamada,:p_nm_usuario_criacao, :x_saida_json);
        end;
        `,
        {
          p_nm_evento: newEvent.nm_evento,
          p_dt_evento: newEvent.dt_evento,
          p_nm_local: newEvent.nm_local,
          p_dt_corte_votacao: newEvent.dt_corte,
          p_dt_primeira_chamada: newEvent.dt_primeira_chamada
            ? `${newEvent.dt_evento} ${newEvent.dt_primeira_chamada}`
            : '',
          p_dt_segunda_chamada: newEvent.dt_segunda_chamada
            ? `${newEvent.dt_evento} ${newEvent.dt_segunda_chamada}`
            : '',
          p_dt_terceira_chamada: newEvent.dt_terceira_chamada
            ? `${newEvent.dt_evento} ${newEvent.dt_terceira_chamada}`
            : '',
          p_nm_usuario_criacao: username.trim(),
          x_saida_json: {
            dir: oracledb.BIND_OUT,
            type: oracledb.DB_TYPE_NVARCHAR,
            maxSize: 32000,
          },
        },
      );

      this.logger.debug(`post events result: ${result.outBinds.x_saida_json}`);

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

  async putEvent(newEvent: UpdateEventsDto, username: string) {
    this.logger.debug('putEvent... ');

    let oracleConn;
    try {
      oracleConn = await this.databaseService.openPoolConnection();
      const result = await oracleConn.execute(
        `
        begin
          xcxp_sca_controle_pkg.atualizar_evento_prc(:p_id_evento, :p_nm_evento, :p_dt_evento, :p_nm_local, :p_nm_status, 
                                                     :p_dt_corte_votacao, :p_dt_primeira_chamada, :p_dt_segunda_chamada, 
                                                     :p_dt_terceira_chamada, :p_nm_usuario_alteracao, :x_saida_json);
        end;
        `,
        {
          p_id_evento: newEvent.id_evento,
          p_nm_evento: newEvent.nm_evento,
          p_dt_evento: newEvent.dt_evento,
          p_nm_local: newEvent.nm_local,
          p_nm_status: newEvent.nm_status,
          p_dt_corte_votacao: newEvent.dt_corte,
          p_dt_primeira_chamada: newEvent.dt_primeira_chamada
            ? `${newEvent.dt_evento} ${newEvent.dt_primeira_chamada}`
            : '',
          p_dt_segunda_chamada: newEvent.dt_segunda_chamada
            ? `${newEvent.dt_evento} ${newEvent.dt_segunda_chamada}`
            : '',
          p_dt_terceira_chamada: newEvent.dt_terceira_chamada
            ? `${newEvent.dt_evento} ${newEvent.dt_terceira_chamada}`
            : '',
          p_nm_usuario_alteracao: username.trim(),
          x_saida_json: {
            dir: oracledb.BIND_OUT,
            type: oracledb.DB_TYPE_NVARCHAR,
            maxSize: 32000,
          },
        },
      );

      this.logger.debug(`put events result: ${result.outBinds.x_saida_json}`);

      return JSON.parse(result.outBinds.x_saida_json);
    } catch (err) {
      throw err;
    } finally {
      if (oracleConn) {
        await oracleConn.close();
        this.logger.debug('putEvent - Oracle connection closed.');
      }
    }
  }
}
