import Koa from "koa";
//import appConfiguration from "../../config/sanitizedProperties";



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
    const serverPassword = appConfiguration.PASSWORD
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
    console.log('RENEWING SESSION')
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
