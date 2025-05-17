import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SharesController } from './shares.controller'
import { SharesService } from './shares.service'
import { Share } from '../../entities/share.entity'
import { UsersModule } from '../users/users.module'
import { FilesModule } from '../files/files.module'

@Module({
  imports: [TypeOrmModule.forFeature([Share]), UsersModule, FilesModule],
  controllers: [SharesController],
  providers: [SharesService],
  exports: [SharesService],
})
export class SharesModule {}
