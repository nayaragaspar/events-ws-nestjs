import { OnModuleDestroy } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { CustomLogger } from '../logger/custom-logger.service';

dotenv.config();

const oracledb = require('oracledb');

const { ORACLE_DB_CONNECT_STRING } = process.env;
const { ORACLE_DB_USER } = process.env;
const { ORACLE_DB_PWD } = process.env;

export default class DatabaseService implements OnModuleDestroy {
  private logger = new CustomLogger();

  constructor() {
    this.logger.setContext('DatabaseService');
  }

  async openOracleConnection() {
    try {
      const oracleConn = await oracledb.getConnection({
        user: ORACLE_DB_USER,
        password: ORACLE_DB_PWD,
        connectString: ORACLE_DB_CONNECT_STRING,
      });

      this.logger.debug(
        `DatabaseService - Oracle connection opened with ${ORACLE_DB_CONNECT_STRING} database.`,
      );

      return oracleConn;
    } catch (err) {
      this.logger.error(
        `DatabaseService - Error opening oracle connection: ${err}`,
      );
      throw err;
    }
  }

  async openPoolConnection() {
    let pool;

    pool = await oracledb
      .createPool({
        user: ORACLE_DB_USER,
        password: ORACLE_DB_PWD,
        connectString: ORACLE_DB_CONNECT_STRING,
        poolAlias: 'oraclePool',
        poolMax: 4,
        enableStatistics: false,
      })
      .catch(() => {
        pool = oracledb.getPool('oraclePool');

        return pool;
      });

    const oracleConn = pool.getConnection();

    //const statistics = pool.getStatistics();
    //this.logger.info(`PoolStatistics: ${JSON.stringify(statistics)}`);

    /* this.logger.debug(
      `DatabaseService - Oracle connection opened with ${ORACLE_DB_CONNECT_STRING} database.`,
    ); */

    return oracleConn;
  }

  async onModuleDestroy() {
    let pool = oracledb.getPool('oraclePool');
    await pool.close(0);

    this.logger.debug(`Oracle Pool closed.`);
  }

  async closeOracleConnection(oracleConn) {
    if (oracleConn) {
      try {
        await oracleConn.close();
        this.logger.debug('DatabaseService - Oracle connection closed.');
      } catch (err) {
        this.logger.error(
          `DatabaseService - Error closing Oracle connection: ${err}`,
        );
      }
    }
  }
}
