import { load } from 'ts-dotenv';

export const env = load({
  PORT: Number,  
  MAYA_PK: String,
  MAYA_SK: String
}); 
