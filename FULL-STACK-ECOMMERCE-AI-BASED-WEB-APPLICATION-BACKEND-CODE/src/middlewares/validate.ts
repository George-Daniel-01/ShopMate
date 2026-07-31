import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";

/**
 * Zod validation middleware. Parses req.body against the given schema and
 * replaces req.body with the validated (typed) result. Responds with a 400
 * and the first validation messages when the payload is invalid.
 */
export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        success: false,
        message: result.error.issues.map((issue) => issue.message).join(", "),
      });
      return;
    }
    req.body = result.data;
    next();
  };
};
