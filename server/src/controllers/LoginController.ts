import Koa from "koa";
//import appConfiguration from "../../config/sanitizedProperties";
import { sessionStore } from "../infrastructure/sessions/sessionStorage";
import { SessionData } from "express-session";
import jwt from "jsonwebtoken";

export interface DecodedToken {
  sessionId: string;
  iat: number;
  exp: number;
}

export interface ExtendedContext extends Koa.Context {
  token: string;
}
export type CustomSessionData = SessionData & {
  deviceIdentifier: string;
};

interface LoginRequestBody {
  deviceIdentifier: string;
  password: string;
}

export class LoginController {
  private tokenGenerator: (deviceIdentifier:string) => Promise<string>;
  constructor(tokenGenerator: (deviceIdentifier:string) => Promise<string>) {
    this.tokenGenerator = tokenGenerator;
    this.loginHandler = this.loginHandler.bind(this);
    this.refreshToken = this.refreshToken.bind(this);
  }

  async loginHandler(ctx: Koa.Context) {
    const requestBody = await ctx.request.body;
    const serverPassword = appConfiguration.PASSWORD;
    const incomingPassword = (requestBody as LoginRequestBody).password;
    const deviceIdentifier = (requestBody as LoginRequestBody).deviceIdentifier;
    if (serverPassword !== incomingPassword) {
      ctx.status = 401;
      return (ctx.body = { Error: "Wrong password" });
    }

    return this.tokenGenerator(deviceIdentifier)
      .then((token) => {
        ctx.status = 200;
        ctx.body = { token };
      })
      .catch((error) => {
        ctx.status = 500;
        ctx.body = { "Error occurred:": error };
      });
  }

  async refreshToken(ctx: Koa.Context) {
    const requestBody = await ctx.request.body;
    const deviceIdentifier = (requestBody as LoginRequestBody).deviceIdentifier;
    const token = (ctx as ExtendedContext).token;
    const decodedToken = (jwt.decode(token) as DecodedToken);

    if (!checkIfTokenExpiresInLessThenDesiredTime(decodedToken, 8)) {
      sessionStore.destroy(decodedToken.sessionId, (err) => {
        if (err) {
          console.log("Destoing session error", err);
        } else {
          console.log("Session destroyed due to premature renwe query:");
        }
      });      
      ctx.status = 401;
      ctx.body = `Access not granted`;
    } else {
      return checkIfDeviceInSession(token, deviceIdentifier).then(() => {
        return this.tokenGenerator(deviceIdentifier)
          .then((token) => {
            ctx.status = 200;
            ctx.body = { token };
          })
          .catch((error) => error);
    }).catch((error)=>{
      console.log(`Error occurred during token generation: ${error}`);
      ctx.status = 401;
      ctx.body = `Access not granted`;
    });
    }
  }
}

export const checkIfDeviceInSession = (
  token: string,
  deviceIdentifier: string
) => {
  return new Promise((resolve, reject) => {
    const sessionId = (jwt.decode(token) as DecodedToken).sessionId;
    sessionStore.get(sessionId, (err, session) => {
      if (err) {
        reject(err);
      }
      if (!session) {
        reject(`Session with ${sessionId} does not exist`);
      } else {
        (session as CustomSessionData).deviceIdentifier === deviceIdentifier
          ? resolve("Device in session")
          : reject("Device not in session");
      }
    });
  });
};

const checkIfTokenExpiresInLessThenDesiredTime = (token: DecodedToken, desiredTimeInMin:number) => {
  const currentTime = Math.floor(Date.now() / 1000);
  const tokenExpiration = token.exp;
  const expiresInLessThanDesiredTime =
    ((tokenExpiration ?? 0) - currentTime) / 60 < desiredTimeInMin
  return expiresInLessThanDesiredTime;
};
