import bodyParser from "koa-bodyparser";
import Router from "koa-router";
import Koa from "koa";
import cors from "koa-cors";
import * as httpLibrary from "http";

export class AppServer {
  public serverConfig: Koa;
  private appRouter: Router;
  public server: httpLibrary.Server | undefined;

  constructor(appRouter: Router) {
    this.appRouter = appRouter;
    this.serverConfig = this.initServer();
    this.server = undefined;
  }

  private initServer(): Koa {
    const app = new Koa();

    app.use(cors());
    app.use(bodyParser());
    app.use(this.appRouter.routes());

    return app;
  }

   startServer(port:number) {
    return new Promise((resolve, reject)=>{
      const server = this.serverConfig.listen(port, () => {
        console.log(`Server listen at port ${port}`);
        this.server = server
        resolve(this.server)

      });
      server.on('error', (error)=>{reject(error)})

    })
    
    
  }

  public stopServer() {
    return new Promise((resolve)=>{
      this.server?.close(() => {
        console.log(`Server stops listen`);
        this.server = undefined
        resolve('Server closed')

      });

    })

   
    
  }
}
