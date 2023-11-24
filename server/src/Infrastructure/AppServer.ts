import bodyParser from "koa-bodyparser";
import Router from "koa-router";
import Koa from "koa";
import cors from "@koa/cors";
import * as httpLibrary from "http";
import https from "https";
import fs from "fs/promises";

export class AppServer {
  public serverConfig: Koa;
  private appRouter: Router;
  public server: httpLibrary.Server | undefined;

  constructor(appRouter: Router) {
    this.appRouter = appRouter;
    this.serverConfig = this.initKoaServer();
    this.server = undefined;
  }

  private initKoaServer(): Koa {
    const app = new Koa();

    app.use(cors());
    app.use(bodyParser());
    app.use(this.appRouter.routes());
    return app;
  }

  startHttpServer(port: number) {
    return new Promise((resolve, reject) => {
      const server = this.serverConfig.listen(port, () => {
        console.log(`Server listen on port ${port}`);
        this.server = server;
        resolve(this.server);
      });
      server.on("error", (error) => {
        reject(error);
      });
    });
  }

  async startHttpsServer(port: number) {
    const sslData = await this.readSslFiles();
    const options = {
      key: sslData.privateKey,
      cert: sslData.certificate,
    };
    return new Promise((resolve, reject) => {
      const httpsServer = https.createServer(
        options,
        this.serverConfig.callback()
      );
      const server = httpsServer.listen(port, () => {
        console.log(`Server listen at port ${port}`);
        this.server = server;
        resolve(this.server);
      });
      server.on("error", (error) => {
        reject(error);
      });
    });
  }

  async readSslFiles(): Promise<{ privateKey: string; certificate: string }> {
    const privatKeyPromise = fs.readFile("./src/_ssl/iHome.key", "utf8");
    const certificatePromise = fs.readFile("./src/_ssl/iHome.crt", "utf8");
    return Promise.all([privatKeyPromise, certificatePromise]).then(
      (result) => {
        const [privateKey, certificate] = result;
        return { privateKey, certificate };
      }
    );
  }

  public stopServer() {
    return new Promise((resolve) => {
      this.server?.close(() => {
        console.log(`Server closed.`);
        this.server = undefined;
        resolve("Server closed");
      });
    });
  }
}
