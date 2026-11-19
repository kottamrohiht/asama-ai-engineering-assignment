import http from "node:http";
import { URL } from "node:url";

import { getHardwareSnapshot } from "./hardware.js";
import { createAgentNetwork } from "./agent-network.js";
import { answerHardwareQuestion } from "./assistant.js";

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../client"); 
const dataPath = process.env.VERCEL ? null : path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../data/network.json"); 
export const network = createAgentNetwork({ persistPath: dataPath });





function send(response, status, data, type = "application/json") { 
  response.writeHead(status, { "content-type": `${type}; charset=utf-8`, "access-control-allow-origin": "*" }); 
  response.end(type === "application/json" ? JSON.stringify(data) : data); 
}

async function body(request) { 
  let raw = ""; 
  for await (const chunk of request) raw += chunk; 
  return raw ? JSON.parse(raw) : {}; 
}

export async function handle(request, response) { 
  const url = new URL(request.url, "http://localhost"); 
  
  if (request.method === "OPTIONS") return send(response, 204, "", "text/plain"); 
  if (url.pathname === "/api/health") return send(response, 200, { ok: true, service: "asama-ai-assignment" }); 
  if (url.pathname === "/api/hardware" && request.method === "GET") 
    return send(response, 200, await getHardwareSnapshot({ mode: url.searchParams.get("mode") === "simulated" ? "simulated" : "auto" })); 
  if (url.pathname === "/api/hardware/ask" && request.method === "POST") { 
    const input = await body(request); 
    const snapshot = await getHardwareSnapshot({ mode: input.mode === "simulated" ? "simulated" : "auto" }); 
    return send(response, 200, answerHardwareQuestion(input.question || "", snapshot)); } 

  // Agents 
  if (url.pathname === "/api/agents" && request.method === "GET") return send(response, 200, network.listAgents()); 
  if (url.pathname === "/api/agents" && request.method === "POST") return send(response, 201, network.registerAgent(await body(request))); 
  if (url.pathname === "/api/posts" && request.method === "GET") return send(response, 200, network.listPosts()); 
  if (url.pathname === "/api/posts" && request.method === "POST") return send(response, 201, network.publishPost(await body(request))); 
  if (url.pathname === "/api/subscriptions" && request.method === "POST") return send(response, 201, network.subscribe(await body(request))); 
  if (url.pathname === "/api/comments" && request.method === "GET") return send(response, 200, network.comments(url.searchParams.get("postId"))); 
  if (url.pathname === "/api/notifications" && request.method === "GET") return send(response, 200, network.notifications(url.searchParams.get("agentId"))); 
  if (url.pathname === "/" || url.pathname === "/index.html") return send(response, 200, await fs.readFile(path.join(root, "index.html"), "utf8"), "text/html"); 
  
  return send(response, 404, { error: "Not found" }); 
}
  
if (!process.env.VERCEL && process.env.NODE_ENV !== "test") { 
  const port = Number(process.env.PORT || 3000); 
  http.createServer((request, response) => 
    handle(request, response)
    .catch((error) => send(response, 500, { error: error.message })))
    .listen(port, () => console.log(`Asama demo: http://localhost:${port}`)); 
}




















