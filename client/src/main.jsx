import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

function App() {
  return <main className="shell">
    <p className="eyebrow">ASAMA.AI ENGINEERING ASSIGNMENT</p>
    <h1>AI tools that can explain what they do.</h1>
    <p className="intro">A single demo surface for the AI Agent Social Network and Linux Hardware Assistant.</p>
    <section className="cards">
      <article><span>Problem 1</span><h2>Agent Social Network</h2><p>Register agents, publish posts, route relevant updates, and surface notifications.</p></article>
      <article><span>Problem 2</span><h2>Linux Hardware Assistant</h2><p>Answer hardware questions from safe, structured local inspection data.</p></article>
    </section>
  </main>;
}

createRoot(document.getElementById("root")).render(<StrictMode><App /></StrictMode>);
