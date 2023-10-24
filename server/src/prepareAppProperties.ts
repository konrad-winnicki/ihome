import { v4 } from "uuid";
import { collectUserData } from "./prompt/prompts";
import { propertyWriter } from "./propertyWriter";

export async function prepareAppProperties() {
  return collectUserData()
    .then((response) => {
      const responseKeys = Object.keys(response);
      responseKeys.forEach((key) => propertyWriter(key, response[key]));
      propertyWriter("JWT_SECRET", v4());
      return Promise.resolve("Success");
    })
    .catch((err) => {
      console.log("err", err);
      process.exit(1);
    });
}
