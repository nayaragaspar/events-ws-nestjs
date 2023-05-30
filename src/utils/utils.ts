import { CustomLogger } from '../logger/custom-logger.service';

const logger = new CustomLogger();
/**
 * Class responsible for defining useful methods for application
 */
export default class Utils {
  static getFormattedCpfCnpj(documentOnlyDigits: string): string {
    documentOnlyDigits = `${documentOnlyDigits.replace(/\D/g, '')}`;
    let cpfOrCnpjFull = '';

    if (documentOnlyDigits.length === 11) {
      //CPF
      cpfOrCnpjFull = `${documentOnlyDigits.substr(
        0,
        3,
      )}.${documentOnlyDigits.substr(3, 3)}.${documentOnlyDigits.substr(
        6,
        3,
      )}-${documentOnlyDigits.substr(9, 2)}`;
    } else if (documentOnlyDigits.length === 14) {
      //CNPJ
      cpfOrCnpjFull = `${documentOnlyDigits.substr(
        0,
        2,
      )}.${documentOnlyDigits.substr(2, 3)}.${documentOnlyDigits.substr(
        5,
        3,
      )}/${documentOnlyDigits.substr(8, 4)}-${documentOnlyDigits.substr(
        12,
        2,
      )}`;
    } else {
      logger.error(`Documento inválido: ${documentOnlyDigits}`);
    }
    return cpfOrCnpjFull;
  }

  static validateDate(dateStr: string) {
    const regex = /^\d{2}\/\d{2}\/\d{4}$/;

    if (dateStr.match(regex) === null) {
      return false;
    }

    const [day, month, year] = dateStr.split('/');

    const isoFormattedStr = `${year}-${month}-${day}`;
    const date = new Date(isoFormattedStr);
    const timestamp = date.getTime();

    if (typeof timestamp !== 'number' || Number.isNaN(timestamp)) {
      return false;
    }

    return date.toISOString().startsWith(isoFormattedStr);
  }

  static validateTime(timeStr: string) {
    const regex = /^(?:[01]\d|2[0123]):(?:[012345]\d):(?:[012345]\d)$/;

    if (timeStr.match(regex) === null) {
      return false;
    }

    return true;
  }

  static validateCpfCnpj(cpfOrCnpj) {
    const cpfOrCnpjOnlyDigits = `${cpfOrCnpj.replace(/\D/g, '')}`;

    const CPF_OR_CNPJ_REGEX = /(^[0-9]{11}$)|(^[0-9]{14}$)/;

    if (!cpfOrCnpjOnlyDigits.match(CPF_OR_CNPJ_REGEX)) {
      return false;
    }

    return true;
  }

  // FUNÇÕES PARA VALIDAÇÃO DE CPF / CNPJ
  // Valida o CPF ou CNPJ
  static valida_cpf_cnpj(valor) {
    // Verifica se é CPF ou CNPJ
    var valida = this.verifica_cpf_cnpj(valor);

    valor = valor.toString();
    valor = valor.replace(/[^0-9]/g, '');

    if (valida === 'CPF') {
      return this.valida_cpf(valor);
    } else if (valida === 'CNPJ') {
      return this.valida_cnpj(valor);
    } else {
      return false;
    }
  }

  // Verifica se é CPF ou CNPJ
  static verifica_cpf_cnpj(valor) {
    valor = valor.toString();
    valor = valor.replace(/[^0-9]/g, '');

    if (valor.length === 11) {
      return 'CPF';
    } else if (valor.length === 14) {
      return 'CNPJ';
    } else {
      return false;
    }
  }

  /*
    Multiplica dígitos vezes posições => dígito verificador

    @param string digitos Os digitos desejados
    @param string posicoes A posição que vai iniciar a regressão
    @param string soma_digitos A soma das multiplicações entre posições e dígitos
    @return string Os dígitos enviados concatenados com o último dígito
  */
  static calc_digitos_posicoes(digitos, posicoes = 10, soma_digitos = 0) {
    digitos = digitos.toString();

    // Faz a soma dos dígitos com a posição
    // Ex. para 10 posições:
    //   0    2    5    4    6    2    8    8   4
    // x10   x9   x8   x7   x6   x5   x4   x3  x2
    //   0 + 18 + 40 + 28 + 36 + 10 + 32 + 24 + 8 = 196
    for (var i = 0; i < digitos.length; i++) {
      // Preenche a soma com o dígito vezes a posição
      soma_digitos = soma_digitos + digitos[i] * posicoes;

      // Subtrai 1 da posição
      posicoes--;

      // Parte específica para CNPJ
      // Ex.: 5-4-3-2-9-8-7-6-5-4-3-2
      if (posicoes < 2) {
        // Retorno a posição para 9
        posicoes = 9;
      }
    }

    // Captura o resto da divisão entre soma_digitos dividido por 11
    // Ex.: 196 % 11 = 9
    soma_digitos = soma_digitos % 11;

    // Verifica se soma_digitos é menor que 2
    if (soma_digitos < 2) {
      // soma_digitos agora será zero
      soma_digitos = 0;
    } else {
      // Se for maior que 2, o resultado é 11 menos soma_digitos
      // Ex.: 11 - 9 = 2
      // Nosso dígito procurado é 2
      soma_digitos = 11 - soma_digitos;
    }

    // Concatena mais um dígito aos primeiro nove dígitos
    // Ex.: 025462884 + 2 = 0254628842
    var cpf = digitos + soma_digitos;

    return cpf;
  }

  // Valida CPF
  static valida_cpf(valor) {
    valor = valor.toString();
    valor = valor.replace(/[^0-9]/g, '');
    var digitos = valor.substr(0, 9);

    // Faz o cálculo dos 9 primeiros dígitos do CPF para obter o primeiro dígito
    var novo_cpf = this.calc_digitos_posicoes(digitos);
    // Faz o cálculo dos 10 dígitos do CPF para obter o último dígito
    var novo_cpf = this.calc_digitos_posicoes(novo_cpf, 11);

    // Verifica se o novo CPF gerado é idêntico ao CPF enviado
    if (novo_cpf === valor) {
      // CPF válido
      return true;
    } else {
      return false;
    }
  }

  // Valida Cnpj
  static valida_cnpj(valor) {
    valor = valor.toString();
    valor = valor.replace(/[^0-9]/g, '');

    var cnpj_original = valor;
    var primeiros_numeros_cnpj = valor.substr(0, 12);

    // Faz o primeiro cálculo
    var primeiro_calculo = this.calc_digitos_posicoes(
      primeiros_numeros_cnpj,
      5,
    );

    // O segundo cálculo é a mesma coisa do primeiro, porém, começa na posição 6
    var segundo_calculo = this.calc_digitos_posicoes(primeiro_calculo, 6);

    // Concatena o segundo dígito ao CNPJ
    var cnpj = segundo_calculo;

    // Verifica se o CNPJ gerado é idêntico ao enviado
    if (cnpj === cnpj_original) {
      return true;
    }

    return false;
  }
  // FIM FUNÇÕES PARA VALIDAÇÃO DE CPF / CNPJ
}
