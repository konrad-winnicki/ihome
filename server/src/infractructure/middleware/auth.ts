import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import sanitizedConfig from "../../../config/config";

const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new Error("NoToken");
  }
  try {
    jwt.verify(token, sanitizedConfig.JWT_SECRET, {
      ignoreExpiration: false,
    });
    next();
  } catch (error) {
    if (error === "jwt expired") {
      next(error);
    }
    next(error);
  }
};

export default authenticate;
