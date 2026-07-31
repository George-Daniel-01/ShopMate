import { Request, Response } from "express";
import { database } from "../database/db.js";
import { createTables } from "../utils/createTables.js";

export const healthCheck = async (_req: Request, res: Response) => {
  try {
    await database.query("SELECT 1");
  } catch (error) {
    res.status(503).json({
      success: false,
      service: "shopmate-api",
      db: "down",
      error: (error as Error).message,
    });
    return;
  }

  try {
    await createTables();
    await database.query("SELECT 1 FROM products LIMIT 1");
  } catch (error) {
    let tables: string[] = [];
    try {
      const res = await database.query(
        `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`
      );
      tables = res.rows.map((r) => r.table_name);
    } catch {
      // ignore inventory failure
    }
    res.status(503).json({
      success: false,
      service: "shopmate-api",
      db: "up",
      schema: "incomplete",
      tables,
      error: (error as Error).message,
    });
    return;
  }

  res.status(200).json({
    success: true,
    service: "shopmate-api",
    db: "up",
    schema: "ready",
    uptime: Math.round(process.uptime()),
  });
};
