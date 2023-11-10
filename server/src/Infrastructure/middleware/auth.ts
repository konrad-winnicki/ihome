// middleware/authenticate.ts
import jwt, { JwtPayload } from "jsonwebtoken";
import Koa, { Next } from "koa";
//import appConfiguration from "../../../config/sanitizedProperties";

const authenticate = async (ctx: Koa.Context, next: Next) => {
  const data = ctx.request.headers["authorization"];
  const token = data?.replace("Bearer ", "");
  if (!token) {
    ctx.status = 401;
    return (ctx.body = {"Error": "Token reqired"});
  }
  return tokenValidation(token)
    .then(() => next())
    .catch((error) => {
      console.log('errr', error)
      ctx.status = 401;
      return (ctx.body = {"Token validation error": error});
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
  console.log('tonenvalidation', token)
  
  return new Promise<string>((resolve) => {
    jwt.verify(token, appConfiguration.JWT_SECRET, {
      ignoreExpiration: false,
    }) as JwtPayload;
    console.log('resolve')
    resolve("access granted");
  }).catch((error:Error) => 
   error.message === "jwt expired"
      ? Promise.reject('jwt expired')
      : Promise.reject(`During token verification error occured: ${error}`)
);
};
export default authenticate;
