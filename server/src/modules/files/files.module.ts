import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { FilesController } from './files.controller'
import { FilesService } from './files.service'
import { JsonFile } from '../../entities/json-file.entity'
import { UsersModule } from '../users/users.module'
import { MulterModule } from '@nestjs/platform-express'

@Module({
  imports: [
    TypeOrmModule.forFeature([JsonFile]),
    UsersModule,
    MulterModule.register({
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  ],
  controllers: [FilesController],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}
