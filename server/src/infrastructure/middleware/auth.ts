import jwt, { JwtPayload } from "jsonwebtoken";
import Koa, { Next } from "koa";
import { sessionStore } from "../sessions/sessionStorage";
import { DecodedToken
 } from "../../controllers/LoginController";
const authenticate = async (ctx: Koa.Context, next: Next) => {
  const data = ctx.request.headers["authorization"];
  const token = data?.replace("Bearer ", "");
  if (!token) {
    ctx.status = 401;
    return (ctx.body = { Error: "Token required" });
  }
  return tokenValidation(token)
    .then((response) => {
      ctx.token = token;
      console.log('Token validation:', response)
    })
    .then(() => next())
    .catch((error) => {
      ctx.status = 401;
      console.log("Token validation error", error);
      return (ctx.body = "Access not granted");
    });
};

const tokenValidation = (token: string) =>
  new Promise<string>((resolve, reject) => {
    jwt.verify(token, appConfiguration.JWT_SECRET, {
      ignoreExpiration: false,
    }) as JwtPayload;
    return checkIfSessionExists(token)
      .then((response) => resolve(`Session validation ${response} - access granted`))
      .catch((err) => reject(err));
  }).catch((error: Error) =>
    error.message === "jwt expired"
      ? Promise.reject("jwt expired")
      : Promise.reject(`During token verification error occured: ${error}`)
  );


  export const checkIfSessionExists = (token: string) => {
    return new Promise((resolve, reject) => {
      const sessionId = (jwt.decode(token) as DecodedToken).sessionId;
      sessionStore.get(sessionId, (err, session) => {
        if (err) {
          reject(err);
        }
        if (!session) {
          reject(`Session with ${sessionId} does not exist`);
        } else {
          resolve('Session exists')
        }
      });
    });
  };


export default authenticate;
