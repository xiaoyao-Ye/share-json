import { Controller, Get, Headers } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiHeader, ApiResponse } from '@nestjs/swagger'
import { UsersService } from './users.service'
import { User } from '../../entities/user.entity'

@ApiTags('用户')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('identify')
  @ApiOperation({ summary: '识别用户', description: '根据请求头获取或创建用户' })
  @ApiHeader({
    name: 'X-User-ID',
    description: '客户端生成的用户UUID',
    required: true,
  })
  @ApiResponse({ status: 200, description: '用户信息', type: User })
  async identifyUser(@Headers('X-User-ID') uuid: string): Promise<User> {
    return this.usersService.getOrCreateUser(uuid)
  }
}
