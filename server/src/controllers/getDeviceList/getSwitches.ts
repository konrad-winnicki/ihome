import Koa from "koa";
import { deviceService } from "../../dependencias";

export async function getSwitches(ctx: Koa.Context) {
    return deviceService
      .getSwitchList()
      .then((response) => {
        ctx.status = 200;
        ctx.body = response;
      })
      .catch((error) => {
        ctx.status = 500;
        ctx.body = error;
      });
  }

  