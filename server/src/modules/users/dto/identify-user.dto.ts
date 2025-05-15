import { ApiProperty } from '@nestjs/swagger';

export class IdentifyUserDto {
  @ApiProperty({
    description: '用户唯一标识符',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  uuid: string;
}
