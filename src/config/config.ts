import { load } from 'ts-dotenv';

export const env = load({
  PORT: Number,
  DB_HOST: String,
  DB_USER: String,
  DB_PASSWORD: String,
  DATABASE: String,
  AWS_ACCESS_KEY_ID: String,
  AWS_SECRET_ACCESS_KEY: String,  
  MAYA_PK: String,
  MAYA_SK: String,
  TOKEN_SECRET: String,
  MAILER_API_KEY: String,
  EMAIL: String,
  EMAIL_PASS: String,
  CRYPTO_KEY: String,
  IV: String
}); 
