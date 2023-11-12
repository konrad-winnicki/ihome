import Router from "koa-router";

import authenticate from "./middleware/auth";
import { addDeviceGuardMiddleware } from "./middleware/guardMiddleware/addDeviceGuard";
import { addTaskGuardMiddleware } from "./middleware/guardMiddleware/addTaskGuard";
import { runSwitchGuardMiddleware } from "./middleware/guardMiddleware/runSwitchGuard";
import { DeviceController } from "../controllers/DeviceController";
import { RunDeviceControllers } from "../controllers/runDeviceControllers";
import { TaskControllers } from "../controllers/TaskControllers";
import { LoginController } from "../controllers/LoginController";

export function initAppRouter(
  deviceControllers: DeviceController,
  deviceRunControllers: RunDeviceControllers,
  taskControllers: TaskControllers,
  loginController: LoginController
) {
  const appRouter = new Router();
  appRouter.post("/login", loginController.loginHandler);
  appRouter.get("/renew", authenticate, loginController.refreshToken);

  appRouter.get(
    "/running",
    authenticate,
    deviceRunControllers.listActivatedSwitches
  );

  appRouter.post(
    "/meters/run/:id",
    authenticate,
    deviceRunControllers.activateMeter
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
