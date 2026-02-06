import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';
import { CreateProgramDto } from './create-program.dto';

export enum ProgramStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
}

export class UpdateProgramDto extends PartialType(CreateProgramDto) {
  @IsOptional()
  @IsEnum(ProgramStatus)
  status?: ProgramStatus;
}
