import { Router } from "express";
import openapiSpec from "../docs/openapi.js";

/**
 * Interactive API documentation.
 *
 * Vercel-serverless friendly: instead of bundling swagger-ui-dist static
 * assets (which Vercel's nft file-tracing can miss), the docs page loads
 * Swagger UI from a CDN and points at the raw spec served as JSON.
 *
 * - UI:        GET /api/v1/docs
 * - Raw spec:  GET /api/v1/docs/swagger.json
 */
const docsRouter = Router();

docsRouter.get("/swagger.json", (_req, res) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.send(openapiSpec);
});

docsRouter.get("/", (_req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>ShopMate API — OpenAPI Docs</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css" />
  <style>
    .topbar { display: none; }
    body { background: #fafafa; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function () {
      window.ui = SwaggerUIBundle({
        url: "/api/v1/docs/swagger.json",
        dom_id: "#swagger-ui",
        deepLinking: true,
        persistAuthorization: true,
        docExpansion: "list",
        defaultModelsExpandDepth: 1,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        layout: "StandaloneLayout"
      });
    };
  </script>
</body>
</html>`);
});

export default docsRouter;
