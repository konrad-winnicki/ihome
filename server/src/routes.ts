import { Router } from "express";
import { ChatRoomRootControllers, UserRootControllers } from "./app";
import authenticate from "./infractructure/middleware/auth";

export async function initRoutes(
  router: Router,
  userRootControllers: UserRootControllers,
  chatRoomRootControllers: ChatRoomRootControllers
) {
  router.post("/login", userRootControllers.handleLogin);
  router.post("/users", userRootControllers.postUser);
  router.post("/chatrooms", authenticate, chatRoomRootControllers.postChatRoom);

  router.get(
    "/chatrooms",
    authenticate,
    chatRoomRootControllers.getChatRoomList
  );

  router.get("/auth/google/callback", userRootControllers.handleGoogleLogin);
}
