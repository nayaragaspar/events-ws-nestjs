import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class VoteDto {
  @IsNumber()
  @IsNotEmpty()
  id_evento: number;
  @IsNumber()
  @IsNotEmpty()
  id_assunto: number;
  @IsString()
  @IsNotEmpty()
  nr_cpf_cnpj: string;
  @IsArray()
  cd_matriculas: string[];
}

export class VoterDto {
  @IsNumber()
  @IsNotEmpty()
  id_evento: number;
  @IsString()
  @IsNotEmpty()
  nr_cpf_cnpj: string;
  @IsString()
  @IsNotEmpty()
  cd_matricula: string;
  @IsString()
  nm_representante: string;
  @IsString()
  nr_cpf_cnpj_representante: string;
  @IsString()
  @IsNotEmpty()
  ds_justificativa: string;
}

export class VoterSheetDto {
  @IsString()
  @IsNotEmpty()
  NR_CPF_CNPJ: string;
  @IsString()
  @IsNotEmpty()
  MATRICULA: string;
  @IsString()
  NOME_REPRESENTANTE: string;
  @IsString()
  NR_CPF_CNPJ_REPRESENTANTE: string;
}
