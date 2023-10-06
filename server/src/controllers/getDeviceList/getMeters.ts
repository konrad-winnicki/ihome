import Koa from "koa";
import { deviceService } from "../../server";

export async function getMeters(ctx: Koa.Context) {
    return deviceService
      .getMeterList()
      .then((response) => {
        ctx.status = 200;
        ctx.body = response;
      })
      .catch((error) => {
        ctx.status = 500;
        ctx.body = error;
      });
  }