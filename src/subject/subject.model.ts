import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class SubjectDto {
  @IsNumber()
  @IsNotEmpty()
  id_evento: number;
  @IsString()
  @IsNotEmpty()
  nm_assunto: string;
}

export class UpdateSubject extends SubjectDto {
  @IsNumber()
  @IsNotEmpty()
  id_assunto: number;
  @IsString()
  @IsNotEmpty()
  nm_status: string;
}
