import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import config from './config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
