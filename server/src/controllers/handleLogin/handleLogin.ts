import Koa from "koa";
import sanitizedConfig from "../../../config/config";
import { generateToken } from "./generateToken";
interface LoginRequest {
  password: string;
}

export async function handleLogin(ctx: Koa.Context) {
  const requestBody = await ctx.request.body;
  const serverPassword = sanitizedConfig.PAIR_PASSWORD;
  const incomingPassword = (requestBody as LoginRequest).password;
  if (serverPassword !== incomingPassword) {
    ctx.status = 401;
    return (ctx.body = "Wrong password");
  }

  return generateToken()
    .then((token) => {
      ctx.status = 200;
      ctx.body = { token };
    })
    .catch((error) => {
      ctx.status = 500;
      ctx.body = `Erroro occurred: ${error}`;
    });
}
