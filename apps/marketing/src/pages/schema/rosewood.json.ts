import type { APIRoute } from "astro";

import { buildRosewoodProjectFileJsonSchema } from "@rosewood/shared/rosewoodProjectFile";

export const GET: APIRoute = () =>
  new Response(`${JSON.stringify(buildRosewoodProjectFileJsonSchema(), null, 2)}\n`, {
    headers: { "Content-Type": "application/json" },
  });
