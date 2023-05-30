import { Injectable } from '@nestjs/common';
import DatabaseService from '../database/database.service';
import { CustomLogger } from '../logger/custom-logger.service';
import { SubjectDto, UpdateSubject } from './subject.model';
const oracledb = require('oracledb');

@Injectable()
export class SubjectRepository {
  private logger: CustomLogger;
  private databaseService: DatabaseService;

  constructor() {
    this.logger = new CustomLogger();
    this.databaseService = new DatabaseService();
  }
  async createSubject(newSubject: SubjectDto, username: string) {
    this.logger.debug('createSubjectEbs ...');

    let oracleConn;
    try {
      this.logger.debug(
        `Will call cadastrar_assunto_prc procedure integration: ${newSubject.nm_assunto} - ${username}`,
      );

      oracleConn = await this.databaseService.openPoolConnection();
      const result = await oracleConn.execute(
        `
            begin
           xcxp_sca_controle_pkg.cadastrar_assunto_prc(:p_id_evento, :p_nm_assunto, :p_nm_usuario, :x_retorno);
                end;
            `,
        {
          p_id_evento: newSubject.id_evento,
          p_nm_assunto: newSubject.nm_assunto,
          p_nm_usuario: username.trim(),
          x_retorno: {
            type: oracledb.STRING,
            dir: oracledb.BIND_OUT,
            maxSize: 70000,
          },
        },
      );

      this.logger.debug(`post subject result: ${result.outBinds.x_retorno}`);

      return result.outBinds.x_retorno;
    } catch (error) {
      this.logger.error(
        `createSubjectEbs - ${newSubject.nm_assunto}: ${error}`,
      );
      throw error;
    } finally {
      if (oracleConn) {
        try {
          await oracleConn.close();
          this.logger.debug(
            'createSubjectIntegrationEbs - Oracle connection closed.',
          );
        } catch (err) {
          this.logger.warn(
            `createSubjectIntegrationEbs - Error closing Oracle connection: ${err}`,
          );
        }
      }
    }
  }

  async getSubjects(eventId: number, subjectId?: number, subject?: string) {
    this.logger.debug('getSubjects...');

    let oracleConn;
    try {
      oracleConn = await this.databaseService.openPoolConnection();
      const result = await oracleConn.execute(
        `
        begin
        xcxp_sca_controle_pkg.buscar_assunto_prc(:p_id_evento, :p_id_assunto, :p_nm_assunto, :x_retorno);
        end;
        `,
        {
          p_id_evento: eventId,
          p_id_assunto: subjectId,
          p_nm_assunto: subject,
          x_retorno: {
            type: oracledb.STRING,
            dir: oracledb.BIND_OUT,
            maxSize: 70000,
          },
        },
      );

      this.logger.debug(`get subject result: ${result.outBinds.x_retorno}`);

      return JSON.parse(result.outBinds.x_retorno);
    } catch (error) {
      throw error;
    } finally {
      if (oracleConn) {
        try {
          await oracleConn.close();
          this.logger.debug('getSubjects - Oracle connection closed.');
        } catch (err) {
          this.logger.warn(
            `getSubjects - Error closing Oracle connection: ${err}`,
          );
        }
      }
    }
  }

  async getSubject(eventId: number, subjectId: number) {
    this.logger.debug(`getSubject...${eventId} - ${subjectId}`);

    let oracleConn;
    try {
      oracleConn = await this.databaseService.openPoolConnection();
      const result = await oracleConn.execute(
        `
        begin
        xcxp_sca_controle_pkg.listar_controle_votacao_prc(:p_id_evento, :p_id_assunto, :x_saida_json);
        end;
        `,
        {
          p_id_evento: eventId,
          p_id_assunto: subjectId,
          x_saida_json: {
            type: oracledb.STRING,
            dir: oracledb.BIND_OUT,
            maxSize: 70000,
          },
        },
      );

      this.logger.debug(`get subject result: ${result.outBinds.x_saida_json}`);

      return JSON.parse(result.outBinds.x_saida_json);
    } catch (error) {
      throw error;
    } finally {
      if (oracleConn) {
        try {
          await oracleConn.close();
          this.logger.debug('getSubject - Oracle connection closed.');
        } catch (err) {
          this.logger.warn(
            `getSubject - Error closing Oracle connection: ${err}`,
          );
        }
      }
    }
  }

  async putSubject(updateSubject: UpdateSubject, username: string) {
    this.logger.debug('putSubjectEbs ...');

    let oracleConn;
    try {
      this.logger.debug(
        `Will call atualizar_assunto_prc procedure integration: ${updateSubject.nm_assunto} - ${username}`,
      );

      oracleConn = await this.databaseService.openPoolConnection();
      const result = await oracleConn.execute(
        `
            begin
           xcxp_sca_controle_pkg.atualizar_assunto_prc(:p_id_evento, :p_id_assunto, :p_nm_assunto, :p_nm_status, :p_nm_usuario, :x_retorno);
                end;
            `,
        {
          p_id_evento: updateSubject.id_evento,
          p_id_assunto: updateSubject.id_assunto,
          p_nm_assunto: updateSubject.nm_assunto,
          p_nm_status: updateSubject.nm_status,
          p_nm_usuario: username.trim(),
          x_retorno: {
            type: oracledb.STRING,
            dir: oracledb.BIND_OUT,
            maxSize: 70000,
          },
        },
      );

      this.logger.debug(`put subject result: ${result.outBinds.x_retorno}`);

      return JSON.parse(result.outBinds.x_retorno);
    } catch (error) {
      throw error;
    } finally {
      if (oracleConn) {
        try {
          await oracleConn.close();
          this.logger.debug(
            'putSubjectIntegrationEbs - Oracle connection closed.',
          );
        } catch (err) {
          this.logger.warn(
            `putSubjectIntegrationEbs - Error closing Oracle connection: ${err}`,
          );
        }
      }
    }
  }

  async deleteSubject(subjectId: number) {
    this.logger.debug('putSubjectEbs ...');

    let oracleConn;
    try {
      this.logger.debug(
        `Will call deletar_assunto_prc procedure integration: ${subjectId}`,
      );

      oracleConn = await this.databaseService.openPoolConnection();
      const result = await oracleConn.execute(
        `
            begin
           xcxp_sca_controle_pkg.deletar_assunto_prc(:p_id_assunto, :x_retorno);
                end;
            `,
        {
          p_id_assunto: subjectId,
          x_retorno: {
            type: oracledb.STRING,
            dir: oracledb.BIND_OUT,
            maxSize: 70000,
          },
        },
      );

      this.logger.debug(`delete subject result: ${result.outBinds.x_retorno}`);

      return JSON.parse(result.outBinds.x_retorno);
    } catch (error) {
      throw error;
    } finally {
      if (oracleConn) {
        try {
          await oracleConn.close();
          this.logger.debug('deleteSubject - Oracle connection closed.');
        } catch (err) {
          this.logger.warn(
            `deleteSubject - Error closing Oracle connection: ${err}`,
          );
        }
      }
    }
  }
}
