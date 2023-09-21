import { NextFunction, Response } from "express";

export const errorHandler = (
  error: Error,
  response: Response,
  next: NextFunction
) => {
  if (response.headersSent) {
    return next(error);
  }
  switch (error.message) {
    case "NameConflictError":
      return response.status(409).send({ Error: "Name already exists" });
    case "EmailConflictError":
      return response.status(409).send({ Error: "Email already exists" });
    case "EmailInvalidError":
      return response.status(400).send({ Error: "Email is invalid" });
    case "EmailNotExists":
      return response.status(401).send({ Error: "Email doesn't exist" });
    case "jwt expired":
      return response.status(401).send({ Error: "Authentication required" });
    case "NoToken":
      return response.status(401).send({ Error: "No token" });
    case "Socket authentication error":
      return response
        .status(401)
        .send({ Error: "Socket authentication error" });

    default:
      return response.status(500).json({ error: error.message });
  }
};
