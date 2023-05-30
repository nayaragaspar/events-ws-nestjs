import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CooperadoTagDto {
  @IsString()
  @IsNotEmpty()
  cpf_cnpj: string;
  @IsNumber()
  @IsNotEmpty()
  id_evento: number;
  @IsString()
  cd_matricula: string;
}

export class PartnerTagDto {
  @IsString()
  cpf_cnpj_socio: string;
  @IsNumber()
  @IsNotEmpty()
  id_evento: number;
}

export class FamiliarTagDto {
  @IsString()
  @IsOptional()
  cpf_cnpj_familiar: string;
  @IsString()
  @IsNotEmpty()
  cpf_cnpj_cooperado: string;
  @IsString()
  @IsNotEmpty()
  nm_familiar: string;
  @IsNumber()
  @IsNotEmpty()
  id_evento: number;
}

export class VisitantTagDto {
  @IsString()
  nm_municipio: string;
  @IsString()
  nm_visitante: string;
  @IsString()
  @IsOptional()
  cpf_cnpj_visitante: string;
  @IsNumber()
  @IsNotEmpty()
  id_evento: number;
}

export class TagCopyDto {
  @IsString()
  @IsNotEmpty()
  cpf_cnpj: string;
  @IsNumber()
  @IsNotEmpty()
  id_evento: number;
  @IsString()
  @IsNotEmpty()
  tipo: string;
}
