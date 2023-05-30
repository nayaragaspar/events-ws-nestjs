import DatabaseService from '../database/database.service';
import { CustomLogger } from '../logger/custom-logger.service';

const oracledb = require('oracledb');

oracledb.outFormat = oracledb.OUT_FORMAT_ARRAY;

export default class UserRepository {
  private logger = new CustomLogger();
  private databaseService: DatabaseService;

  constructor() {
    this.databaseService = new DatabaseService();
    this.logger.setContext('UsersRepository');
  }

  async getLoginEBS(username: string, password: string) {
    this.logger.debug('getLoginEBS... ');

    let oracleConn;
    try {
      oracleConn = await this.databaseService.openPoolConnection();
      const result = await oracleConn.execute(
        `
        begin
          xcxp_sca_util_pkg.validar_usuario_sca_prc(:p_usuario, :p_senha, :x_saida_json);
        end;
        `,
        {
          p_usuario: username.trim(),
          p_senha: password,
          x_saida_json: {
            dir: oracledb.BIND_OUT,
            type: oracledb.DB_TYPE_NVARCHAR,
          },
        },
      );
      return result.outBinds.x_saida_json;
    } catch (err) {
      this.logger.error(`getLoginEBS: ${err} | username: ${username}`);
    } finally {
      if (oracleConn) {
        await oracleConn.close();
        this.logger.debug('getLoginEBS - Oracle connection closed.');
      }
    }
  }
}
