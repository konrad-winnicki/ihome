// middleware/authenticate.ts
import jwt, { JwtPayload } from "jsonwebtoken";
import sanitizedConfig from "../../../config/config";
import Koa, { Next } from "koa";

const authenticate = async (ctx: Koa.Context, next: Next) => {
  const data = ctx.request.headers["authorization"];
  const token = data?.replace("Bearer ", "");
  if (!token) {
    ctx.status = 401;
    return (ctx.body = "Token reqired");
  }
  return tokenValidation(token)
    .then(() => next())
    .catch((error) => {
      console.log('token validation error:',  error)
      ctx.status = 401;
      return (ctx.body = error);
    });

  /*
  try {
    jwt.verify(token, sanitizedConfig.JWT_SECRET, {
      ignoreExpiration: false,
    }) as JwtPayload;
    await next();
  } catch (error) {
    if (error === "jwt expired") {
      await next();
    }
    await next();
  }

  */
};

const tokenValidation = (token: string) => {
  return new Promise<string>((resolve) => {
    jwt.verify(token, sanitizedConfig.JWT_SECRET, {
      ignoreExpiration: false,
    }) as JwtPayload;
    resolve("access granted");
  }).catch((error:Error) => 
   error.message === "jwt expired"
      ? Promise.reject('jwt expired')
      : Promise.reject(`During token verification error occured: ${error}`)
);
};
export default authenticate;
