import { registerAs } from '@nestjs/config';

export default registerAs('mysql', () => ({
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT,
  user: process.env.MYSQL_USERNAME,
  pass: process.env.MYSQL_PASSWORD,
  root_pass: process.env.MYSQL_ROOT_PASSWORD,
  db: process.env.MYSQL_DATABASE,
  sync: process.env.MYSQL_SYNCHRONIZE,
}));
