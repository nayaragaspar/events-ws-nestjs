import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import * as dotenv from 'dotenv';
import Strategy from 'passport-headerapikey';
import { CustomLogger } from '../../logger/custom-logger.service';

const { API_KEY } = process.env;
dotenv.config();
@Injectable()
export class HeaderApiKeyStrategy extends PassportStrategy(
  Strategy,
  'api-key',
) {
  private logger = new CustomLogger();

  constructor() {
    super({ header: 'x-api-key', prefix: '' }, true, async (apiKey, done) => {
      return await this.validate(apiKey, done);
    });
    this.logger.setContext('HeaderApiKeyStrategy');
  }

  public validate = async (
    apiKey: string,
    done: (error: Error, data) => {},
  ) => {
    if (!apiKey) {
      done(new UnauthorizedException(), null);
    }
    const apiKeySecret = API_KEY;
    if (apiKeySecret === apiKey) {
      done(null, true);
    } else {
      this.logger.info('Error - Invalid API-KEY');
      done(new UnauthorizedException(), null);
    }
  };
}
