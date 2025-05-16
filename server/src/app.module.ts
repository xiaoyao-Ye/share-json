import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import config from './config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './modules/users/users.module';
import { FilesModule } from './modules/files/files.module';
import { SharesModule } from './modules/shares/shares.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 1000 * 60, limit: 20 }]),
    ConfigModule.forRoot({
      // isGlobal: true,
      expandVariables: true,
      envFilePath: ['.env', `.env.${process.env.NODE_ENV || 'development'}`],
      load: [...config],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get('mysql.host'),
        port: config.get('mysql.port'),
        username: config.get('mysql.user'),
        password: config.get('mysql.pass'),
        database: config.get('mysql.db'),
        synchronize: config.get('mysql.sync'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        timezone: '+08:00',
        dateStrings: true,
      }),
    }),
    UsersModule,
    FilesModule,
    SharesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
