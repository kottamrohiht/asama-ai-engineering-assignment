import { handle } from "../server/src/index.js";

export default async function apiHandler(request, response) {
  try {
    await handle(request, response);
  } catch (error) {
    response.statusCode = 500;
    response.setHeader("content-type", "application/json; charset=utf-8");
    response.end(JSON.stringify({ error: error.message }));
  }
}
