import Router from "koa-router";

import authenticate from "./middleware/auth";
import { addDeviceGuardMiddleware } from "./middleware/guardMiddleware/addDeviceGuard";
import { addTaskGuardMiddleware } from "./middleware/guardMiddleware/addTaskGuard";
import { runSwitchGuardMiddleware } from "./middleware/guardMiddleware/runSwitchGuard";
import { DeviceControllers } from "../controllers/DeviceControllers";
import { RunDeviceControllers } from "../controllers/runDeviceControllers";
import { TaskControllers } from "../controllers/TaskControllers";
import { LoginControllers } from "../controllers/LoginControllers";

export function initAppRouter(
  deviceControllers: DeviceControllers,
  deviceRunControllers: RunDeviceControllers,
  taskControllers: TaskControllers,
  loginController: LoginControllers
) {
  const appRouter = new Router();
  appRouter.post("/login", loginController.handleLogin);
  appRouter.get("/renew", authenticate, loginController.renewSession);

  appRouter.post(
    "/meters/run/:id",
    authenticate,
    deviceRunControllers.runMeter
  );
  appRouter.post(
    "/switches/run/:id",
    authenticate,
    runSwitchGuardMiddleware,
    deviceRunControllers.runSwitch
  );

  appRouter.post(
    "/tasks",
    authenticate,
    addTaskGuardMiddleware,
    taskControllers.createTask
  );
  appRouter.delete("/tasks/:id", authenticate, taskControllers.deleteTask);

  appRouter.post(
    "/devices",
    authenticate,
    addDeviceGuardMiddleware,
    deviceControllers.addDevice
  );
  appRouter.delete(
    "/devices/:id",
    authenticate,
    deviceControllers.deleteDevice
  );

  appRouter.get("/meters", authenticate, deviceControllers.getMeters);
  appRouter.get("/switches", authenticate, deviceControllers.getSwitches);
  appRouter.get(
    "/tasks/device/:id",
    authenticate,
    taskControllers.getTasksForDevice
  );
  return appRouter;
}
