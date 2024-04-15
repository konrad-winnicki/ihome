import jwt, { JwtPayload } from "jsonwebtoken";
import Koa, { Next } from "koa";

const authenticate = async (ctx: Koa.Context, next: Next) => {
  const data = ctx.request.headers["authorization"];
  const token = data?.replace("Bearer ", "");
  if (!token) {
    ctx.status = 401;
    return (ctx.body = { Error: "Token required" });
  }
  return tokenValidation(token)
    .then(() => next())
    .catch((error) => {
      ctx.status = 401;
      return (ctx.body = { "Token validation error": error });
    });
};

const tokenValidation = (token: string) =>
  new Promise<string>((resolve) => {
    jwt.verify(token, appConfiguration.JWT_SECRET, {
      ignoreExpiration: false,
    }) as JwtPayload;
    resolve("access granted");
  }).catch((error: Error) =>
    error.message === "jwt expired"
      ? Promise.reject("jwt expired")
      : Promise.reject(`During token verification error occured: ${error}`)
  );
export default authenticate;
