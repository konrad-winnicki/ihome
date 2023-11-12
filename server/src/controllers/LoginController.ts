import Koa from "koa";
//import appConfiguration from "../../config/sanitizedProperties";

interface LoginRequestBody {
  password: string;
}
export class LoginController {
  private tokenGenerator: () => Promise<string>;
  constructor(tokenGenerator: () => Promise<string>) {
    this.tokenGenerator = tokenGenerator;
    this.loginHandler = this.loginHandler.bind(this);
    this.refreshToken = this.refreshToken.bind(this);
  }

  async loginHandler(ctx: Koa.Context) {
    const requestBody = await ctx.request.body;
    const serverPassword = appConfiguration.PASSWORD;
    const incomingPassword = (requestBody as LoginRequestBody).password;
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

  async refreshToken(ctx: Koa.Context) {
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
