import Router from "koa-router";

import authenticate from "./middleware/auth";
import { addDeviceGuardMiddleware } from "./middleware/guardMiddleware/addDeviceGuard";
import { addTaskGuardMiddleware } from "./middleware/guardMiddleware/addTaskGuard";
import { runDeviceGuardMiddleware } from "./middleware/guardMiddleware/runDeviceGuard";
import { DeviceController } from "../controllers/DeviceController";
import { RunDeviceController } from "../controllers/DeviceRunController";
import { TaskController } from "../controllers/TaskController";
import { LoginController } from "../controllers/LoginController";

export function initAppRouter(
  deviceController: DeviceController,
  deviceRunController: RunDeviceController,
  taskController: TaskController,
  loginController: LoginController
) {
  const appRouter = new Router();
  appRouter.post("/login", loginController.loginHandler);
  appRouter.get("/renew", authenticate, loginController.refreshToken);

  appRouter.post(
    "/devices/run/:id",
    authenticate,
    runDeviceGuardMiddleware,
    deviceRunController.runDevice
  );

  appRouter.post(
    "/tasks",
    authenticate,
    addTaskGuardMiddleware,
    taskController.createTask
  );
  appRouter.delete("/tasks/:id", authenticate, taskController.deleteTask);

  appRouter.post(
    "/devices",
    authenticate,
    addDeviceGuardMiddleware,
    deviceController.addDevice
  );
  appRouter.delete(
    "/devices/:id",
    authenticate,
    deviceController.deleteDevice
  );

  appRouter.get("/sensors", authenticate, deviceController.getSensors);
  appRouter.get("/switches", authenticate, deviceController.getSwitches);
  appRouter.get(
    "/tasks/device/:id",
    authenticate,
    taskController.getTasksForDevice
  );
  return appRouter;
}
