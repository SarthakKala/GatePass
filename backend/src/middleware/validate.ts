import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";

type RequestSource = "body" | "query" | "params";

export const validate = (schema: ZodSchema, source: RequestSource = "body") => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      res.status(400).json({
        error: "Validation failed",
        details: result.error.flatten().fieldErrors,
      });
      return;
    }

    (req as any)[source] = result.data;
    next();
  };
};
