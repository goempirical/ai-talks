import { IsNotEmpty, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNoteDto {
  @ApiProperty({
    description: 'The title of the note',
    example: 'Shopping List',
    minLength: 3,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(3, { message: 'Title must be at least 3 characters long' })
  title: string;

  @ApiProperty({
    description: 'The content of the note',
    example: 'Milk, eggs, bread',
    required: false,
  })
  @IsOptional()
  @IsString()
  content?: string;
}
