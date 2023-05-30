import * as dotenv from 'dotenv';
dotenv.config();
const { TOKEN_SECRET_KEY } = process.env;

export const jwtConstants = {
  secret: TOKEN_SECRET_KEY,
};
