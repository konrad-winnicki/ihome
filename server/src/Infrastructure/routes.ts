import Router from "koa-router";
import { runMeter } from "../controllers/runDevices/runMeter";
import { createTask } from "../controllers/addTask/addTask";
import { deleteTask } from "../controllers/deleteTask/deleteTask";
import { runSwitch } from "../controllers/runDevices/runSwitch";
import { addDevice } from "../controllers/addDevice/addDevice";
import { getMeters } from "../controllers/getDeviceList/getMeters";
import { deleteDevice } from "../controllers/deleteDevice/deleteDevice";
import { getSwitches } from "../controllers/getDeviceList/getSwitches";
import { getTasksForDevice } from "../controllers/getTasks/getTasks";

import { handleLogin } from "../controllers/handleLogin/handleLogin";
import authenticate from "./middleware/auth";
import { renewSession } from "../controllers/handleLogin/renewSession";
import { addDeviceGuardMiddleware } from "./middleware/guardMiddleware/addDeviceGuard";
import { addTaskGuardMiddleware } from "./middleware/guardMiddleware/addTaskGuard";
import { runSwitchGuardMiddleware } from "./middleware/guardMiddleware/runSwitchGuard";

export const appRouter = new Router();
appRouter.post("/login", handleLogin);
appRouter.get("/renew", authenticate, renewSession);

appRouter.post("/meters/run/:id", authenticate, runMeter);
appRouter.post(
  "/switches/run/:id",
  authenticate,
  runSwitchGuardMiddleware,
  runSwitch
);

appRouter.post("/tasks", authenticate, addTaskGuardMiddleware, createTask);
appRouter.delete("/tasks/:id", authenticate, deleteTask);

appRouter.post("/devices", authenticate, addDeviceGuardMiddleware, addDevice);
appRouter.delete("/devices/:id", authenticate, deleteDevice);

appRouter.get("/meters", authenticate, getMeters);
appRouter.get("/switches", authenticate, getSwitches);
appRouter.get("/tasks/device/:id", authenticate, getTasksForDevice);
