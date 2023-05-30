import { Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation } from '@nestjs/swagger';
import { AuthService } from '../auth/auth.service';
import { Resource } from '../auth/decorators/resource.decorator';
import { CustomLogger } from '../logger/custom-logger.service';

@Controller()
export class UsersController {
  constructor(private authService: AuthService, private logger: CustomLogger) {
    this.logger.setContext('UsersController');
  }

  @ApiOperation({
    summary: 'Retorna Token',
    description: `Retorna Token a partir de login no EBS usando a package/procedure xcxp_sca_validar_usuario_pkg.validar_usuario_sca_prc`,
  })
  @Resource('login')
  @UseGuards(AuthGuard(['local']))
  @Post('login')
  async login(@Request() req) {
    const token = await this.authService.generateToken(req.user);

    return {
      username: req.body.username,
      roles: req.user.roles,
      access_token: token.access_token,
    };
  }
}
