import { Router } from "express";
import { ChatRoomRootControllers, UserRootControllers } from "./app";
import authenticate from "./infractructure/middleware/auth";


export async function initRoutes(
  router: Router,
  userRootControllers: UserRootControllers,
  chatRoomRootControllers: ChatRoomRootControllers
) {
  router.post("/login", userRootControllers.handleLogin);

  // POST /players: crea un jugador/a.
  router.post("/users", userRootControllers.postUser);
  router.post("/chatrooms", chatRoomRootControllers.postChatRoom);

  router.get(
    "/chatrooms",
    authenticate,
    chatRoomRootControllers.getChatRoomList
  );
  // PUT /players/{id}: modifica el nom del jugador/a.

  router.get("/auth/google/callback", userRootControllers.handleGoogleLogin);

}


