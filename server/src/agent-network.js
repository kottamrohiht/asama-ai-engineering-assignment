import fs from "node:fs";
import path from "node:path";

function id(prefix) { return `${prefix}_${Math.random().toString(36).slice(2, 10)}`; }
const aliases = { ml: "machine learning", ai: "artificial intelligence", cpu: "processor", ram: "memory", disk: "storage", linux: "operating system" };
function terms(text) { return new Set((text || "").toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, " ").split(/\s+/).filter(Boolean).flatMap((term) => [term, aliases[term] || ""])); }
function relevance(a, b) { const left = terms(a), right = terms(b); return [...left].filter((term) => term.length > 2 && right.has(term)).length; }

export function createAgentNetwork({ persistPath = null } = {}) {
  const agents = new Map(), posts = [], notes = [], subscriptions = new Map(), allComments = [];
  if (persistPath) { try { const saved = JSON.parse(fs.readFileSync(persistPath, "utf8")); for (const agent of saved.agents || []) agents.set(agent.id, agent); posts.push(...(saved.posts || [])); notes.push(...(saved.notes || [])); allComments.push(...(saved.comments || [])); for (const item of saved.subscriptions || []) subscriptions.set(item.agentId, new Set(item.targetAgentIds)); } catch { /* first run */ } }
  function save() { if (!persistPath) return; fs.mkdirSync(path.dirname(persistPath), { recursive: true }); fs.writeFileSync(persistPath, JSON.stringify({ agents: [...agents.values()], posts, notes, comments: allComments, subscriptions: [...subscriptions].map(([agentId, targetAgentIds]) => ({ agentId, targetAgentIds: [...targetAgentIds] })) }, null, 2)); }
  return {
    registerAgent(input = {}) { if (!String(input.name || "").trim() || !String(input.description || "").trim()) throw new Error("name and description are required"); const agent = { id: id("agent"), name: input.name.trim(), description: input.description.trim(), capabilities: input.capabilities || [], createdAt: new Date().toISOString() }; agents.set(agent.id, agent); save(); return agent; },
    listAgents() { return [...agents.values()]; },
    subscribe(input = {}) { if (!agents.has(input.agentId) || !agents.has(input.targetAgentId) || input.agentId === input.targetAgentId) throw new Error("two different registered agents are required"); const following = subscriptions.get(input.agentId) || new Set(); if (following.has(input.targetAgentId)) return { agentId: input.agentId, targetAgentId: input.targetAgentId, subscribed: true, alreadySubscribed: true }; following.add(input.targetAgentId); subscriptions.set(input.agentId, following); save(); return { agentId: input.agentId, targetAgentId: input.targetAgentId, subscribed: true, alreadySubscribed: false }; },
    subscriptions(agentId) { return [...(subscriptions.get(agentId) || [])]; },
    publishPost(input = {}) { const author = agents.get(input.agentId); if (!author || !String(input.content || "").trim()) throw new Error("registered agentId and non-empty content are required"); const post = { id: id("post"), agentId: author.id, author: author.name, content: input.content.trim(), comments: [], createdAt: new Date().toISOString() }; posts.unshift(post); for (const agent of agents.values()) { const followsAuthor = subscriptions.get(agent.id)?.has(author.id); if (agent.id !== author.id && (followsAuthor || relevance(agent.description, post.content) > 0)) { notes.unshift({ id: id("note"), agentId: agent.id, type: "relevant-post", message: `${author.name} posted something relevant to your interests.`, postId: post.id }); const comment = { id: id("comment"), postId: post.id, agentId: agent.id, author: agent.name, content: `Interesting update, ${author.name}. This connects with my focus on ${agent.description}.` }; allComments.unshift(comment); post.comments.push(comment); } } save(); return post; },
    listPosts() { return posts; }, comments(postId) { return allComments.filter((comment) => !postId || comment.postId === postId); }, notifications(agentId) { return notes.filter((note) => !agentId || note.agentId === agentId); }
  };
}
