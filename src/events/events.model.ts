import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class EventsDto {
  @IsString()
  @IsNotEmpty()
  nm_evento: string;
  @IsString()
  dt_evento: string;
  @IsString()
  nm_local: string;
  @IsString()
  @IsNotEmpty()
  dt_corte: string;
  @IsString()
  dt_primeira_chamada: string;
  @IsString()
  dt_segunda_chamada: string;
  @IsString()
  dt_terceira_chamada: string;
}

export class UpdateEventsDto extends EventsDto {
  @IsNumber()
  @IsNotEmpty()
  id_evento: number;
  @IsString()
  @IsNotEmpty()
  nm_status: string;
}
