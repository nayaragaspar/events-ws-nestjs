/**
 * Author: Amanda Provetti
 * Developed by: Inatel Competence Center
 * Copyright 2021
 * All rights are reserved. Reproduction in whole or part is prohibited without the written consent of the copyright owner.
 */

import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { CustomLogger } from '../logger/custom-logger.service';
import Utils from '../utils/utils';

/**
 * Responsible for validate CPF and CNPJ format.
 */
@Injectable()
export class CpfOrCnpjValidationPipe implements PipeTransform {
  private logger: CustomLogger = new CustomLogger();

  transform(cpfOrCnpj: string) {
    if (cpfOrCnpj && Utils.valida_cpf_cnpj(cpfOrCnpj) == false) {
      this.logger.info(`Invalid CPF/CNPJ:  ${cpfOrCnpj}`);
      throw new BadRequestException('CPF/CNPJ inválido!');
    }

    return cpfOrCnpj;
  }
}

export class MatriculaValidator implements PipeTransform {
  private logger: CustomLogger = new CustomLogger();
  transform(matricula: string) {
    if (matricula === '' || matricula === null || matricula === undefined) {
      this.logger.info('Registration is mandatory');
      throw new BadRequestException('Registration is mandatory');
    }
    return matricula;
  }
}
