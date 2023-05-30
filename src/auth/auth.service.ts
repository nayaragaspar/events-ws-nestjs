import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CustomLogger } from '../logger/custom-logger.service';
import { UserToken } from '../users/dto/users.dto';
import { UsersService } from '../users/users.service';
import { jwtConstants } from './enums/constants';
const roles = require('./enums/resources.enum');

const { TOKEN_EXPIRES_IN } = process.env;
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtTokenService: JwtService,
    private logger: CustomLogger,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findOne(username, password);

    if (user.permissoes && user.permissoes.length > 0) {
      return {
        username: user.nm_usuario,
        roles: user.permissoes,
      };
    } else {
      if (user.ds_erro != 'Nao possui perfil de acesso ou usuario nao existe.')
        this.logger.error(`validateUser: ${user.ds_erro}`);
    }
    return null;
  }

  async generateToken(payload: UserToken) {
    return {
      access_token: this.jwtTokenService.sign(payload, {
        secret: jwtConstants.secret,
        expiresIn: TOKEN_EXPIRES_IN,
      }),
    };
  }

  async validateToken(token: string, resource: string) {
    try {
      if (token) {
        let payload;
        payload = this.jwtTokenService.verify(token, {
          secret: jwtConstants.secret,
          
        }) as any;

        const now = ~~(new Date().getTime() / 1000);
        if (payload.exp >= now) {
          let resources = payload?.roles.map((role) => {
            return roles[role];
          });
          resources = [...new Set(resources.flat())];

          return resources.includes(resource)
            ? { username: payload.username, roles: payload.roles }
            : false;
        } else {
          return false;
        }
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }
}
