import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UserDto {
  @ApiProperty({ example: 'rhuansouza' })
  @IsNotEmpty()
  username: string;
  @ApiProperty({ example: 'Mudar123' })
  @IsNotEmpty()
  password: string;
}

export class UserToken {
  username: string;
  roles: string[];
}
