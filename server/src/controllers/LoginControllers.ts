import Koa from "koa";
import sanitizedConfig from "../../config/config";
/*
export type DeviceControllers = {
  addDevice: (ctx: Koa.Context) => Promise<void>;
};
*/

interface LoginControllersType {
  password: string;
}
export class LoginControllers {
  private tokenGenerator: () => Promise<string>;
  constructor(tokenGenerator: () => Promise<string>) {
    this.tokenGenerator = tokenGenerator;
    this.handleLogin = this.handleLogin.bind(this);
    this.renewSession = this.renewSession.bind(this);
  }

  async handleLogin(ctx: Koa.Context) {
    const requestBody = await ctx.request.body;
    const serverPassword = sanitizedConfig.PAIR_PASSWORD;
    const incomingPassword = (requestBody as LoginControllersType).password;
    if (serverPassword !== incomingPassword) {
      ctx.status = 401;
      return (ctx.body = { Error: "Wrong password" });
    }

    return this.tokenGenerator()
      .then((token) => {
        ctx.status = 200;
        ctx.body = { token };
      })
      .catch((error) => {
        ctx.status = 500;
        ctx.body = { "Erroro occurred:": error };
      });
  }

  async renewSession(ctx: Koa.Context) {
    return this.tokenGenerator()
      .then((token) => {
        ctx.status = 200;
        ctx.body = { token };
      })
      .catch((error) => {
        ctx.status = 500;
        ctx.body = `Eroro occurred: ${error}`;
      });
  }
}