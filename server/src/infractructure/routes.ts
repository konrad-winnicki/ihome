import { Router } from "express";
import authenticate from "./middleware/auth";
import { ChatRoomRootControllers, UserRootControllers } from "../types";

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
  router.get("/auth/google/callback", userRootControllers.handleGoogleCallback);
}
