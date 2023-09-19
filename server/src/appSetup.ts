import cors from "cors";
import { errorHandler } from "./errorHandler";
import { Express } from "express-serve-static-core";
import express, { NextFunction, Request, Response, Router } from "express";



export async function appSetup(app: Express, router: Router) {
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use("/api", router);
    app.use(
      (
        error: Error,
        _request: Request,
        response: Response,
        next: NextFunction
      ) => {
        errorHandler(error, response, next);
      }
    );
  }