import { Router } from "express";
import { UserRootControllers} from "./app";
//import auth from "./infrastructure/middleware/auth";
export async function initRoutes(router: Router, userRootControllers: UserRootControllers) {
  router.post("/login", userRootControllers.handleLogin);

  // POST /players: crea un jugador/a.
  router.post("/users", userRootControllers.postUser);

  // PUT /players/{id}: modifica el nom del jugador/a.

  
}
