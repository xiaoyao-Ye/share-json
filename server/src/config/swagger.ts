import { registerAs } from '@nestjs/config';

export default registerAs('swagger', () => ({
  enable: process.env.SWAGGER_ENABLE,
  version: process.env.SWAGGER_VERSION,
  path: process.env.SWAGGER_PATH,
  title: process.env.SWAGGER_TITLE,
  desc: process.env.SWAGGER_DESC,
}));
