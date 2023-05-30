import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

const { ALLOWED_HOSTS } = process.env;

@Injectable()
export class AllowedHostMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log('ip de entrada ', req.ip);
    let listIp = ALLOWED_HOSTS.split('|');
    for (let i = 0; i < listIp.length; i++) {
      if (req.ip.includes(listIp[i])) {
        next();
        return;
      }
    }
    res.status(403);
    res.send('Você não tem permissão de acesso!');
    return;
  }
}
