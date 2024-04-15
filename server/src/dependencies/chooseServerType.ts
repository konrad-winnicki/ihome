import { AppServer } from "../Infrastructure/AppServer";

export async function chooseServerType(
  environment: string,
  appServer: AppServer,
  port: number
) {
  if (appConfiguration.SERVER_TYPE === "https") {
    return appServer
      .startHttpsServer(port)
      .then(() => console.log("Https server started"))
      .catch((err) => console.log("Error during starting https server:", err));
  }
  if (
    appConfiguration.SERVER_TYPE === "http" ||
    environment.includes("test_api_") ||
    environment.includes("dev_")
  ) {
    return appServer
      .startHttpServer(port)
      .then(() => console.log("Http server started"))
      .catch((err) => console.log("Error during starting http server:", err));
  }

  throw new Error("Imposible to choose server type");
}
