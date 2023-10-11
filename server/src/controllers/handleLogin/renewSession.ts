import Koa from "koa";
import { generateToken } from "./generateToken";

export async function renewSession(ctx: Koa.Context) {
  return generateToken()
    .then((token) => {
      ctx.status = 200;
      ctx.body = { token };
    })
    .catch((error) => {
      ctx.status = 500;
      ctx.body = `Eroro occurred: ${error}`;
    });
}
