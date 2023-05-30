import { IsIn, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class EntryDto {
  @IsString()
  @IsNotEmpty()
  cpf_cnpj: string;
  @IsNumber()
  @IsNotEmpty()
  id_evento: number;
  @IsString()
  @IsIn(['cooperado', 'socio', 'visitante', 'familiar', 'representante'])
  tipo: string;
}
