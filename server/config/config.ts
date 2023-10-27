import path from "path";
import dotenv from "dotenv";

let env = "";
switch (process.env.NODE_ENV) {
  case "test":
    env = "test.env";
    break;
  case "dev_database":
    env = "development.env";
    break;
    case "dev_file":
    env = "development.env";
    break
  case "production":
      env = "development.env";
    break;
}
dotenv.config({ path: path.resolve(process.cwd(), env) });
console.log('fffffff',  path.resolve(process.cwd(), env), 'ggg')
interface ENV {
  PAIR_PASSWORD: string | undefined;
  NODE_ENV: string | undefined;
  PORT: number | undefined;
  MONGO_URI: string | undefined;
  DATABASE: string | undefined;
  JWT_SECRET: string | undefined;
}

interface Config {
  PAIR_PASSWORD: string;
  NODE_ENV: string;
  PORT: number;
  MONGO_URI: string;
  DATABASE: string;
  JWT_SECRET: string;
}

const getConfig = (): ENV => {
  return {
    PAIR_PASSWORD: process.env.PAIR_PASSWORD,
    DATABASE: process.env.DATABASE,
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT ? Number(process.env.PORT) : undefined,
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET,
  };
};

const getSanitizedConfig = (config: ENV): Config => {
  for (const [key, value] of Object.entries(config)) {
    if (value === undefined) {
      throw new Error(`Missing key ${key} in .env`);
    }
  }
  return config as Config;
};

const config = getConfig();

const sanitizedConfig = getSanitizedConfig(config);

export default sanitizedConfig;
