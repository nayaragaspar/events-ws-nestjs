import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as jwt from 'jsonwebtoken';
import { ExtractJwt } from 'passport-jwt';
import { Observable } from 'rxjs';
import { jwtConstants } from '../enums/constants';
const roles = require('./../enums/resources.enum');

@Injectable()
export class ResourceGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const resource = this.reflector.get('resource', context.getHandler());

    if (resource) {
      const jwtToken = ExtractJwt.fromHeader('authorization')(
        context.switchToHttp().getRequest(),
      );
      const payload = jwt.verify(jwtToken, jwtConstants.secret) as any;

      let resources = payload?.roles.map((role) => {
        return roles[role];
      });
      resources = [...new Set(resources.flat())];

      return resources.includes(resource);
    }

    return false;
  }
}
