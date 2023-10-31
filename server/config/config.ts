import path from "path";
import dotenv from "dotenv";


dotenv.config({ path: path.resolve(process.cwd(), '.env') });
console.log(dotenv.config({ path: path.resolve(process.cwd(), '.env') }))

interface ENV {
  NODE_ENV: string | undefined;
}

interface Config {
  NODE_ENV: string;
}

const getConfig = (): ENV => {
  return {
    NODE_ENV: process.env.NODE_ENV,
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
