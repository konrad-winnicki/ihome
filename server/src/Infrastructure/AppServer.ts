import bodyParser from "koa-bodyparser";
import Router from "koa-router";
import sanitizedConfig from "../../config/config";
import { appRouter } from "./routes";
import Koa from "koa";
import cors from "koa-cors";




export class AppServer {
  private server: Koa;
  appRouter: Router;
  constructor(appRouter: Router) {
    this.appRouter = appRouter;
    this.server = this.initServer();
  }

  initServer(): Koa {

    const app = new Koa(); 

    app.use(cors());
    app.use(bodyParser());
    app.use(appRouter.routes());
    return app;
  }

  startServer() {
    this.server.listen(sanitizedConfig.PORT, () => {
      console.log(`Server listen at port ${sanitizedConfig.PORT}`);
    });
  }
}
