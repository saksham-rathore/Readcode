// Keep landing page copy in one place so the product language stays consistent.
export const brand = { name: "readcode", tagline: "an AI coding workspace for your projects" };

export const nav = [
  { label: "features", href: "#features" },
  { label: "download", href: "#demo" },
  { label: "pricing", href: "#pricing" },
  { label: "FAQs", href: "#faq" },
];

export const navCta = { label: "sign in", href: "/sign-in" };

export const hero = {
  title: "A clear path from idea to code",
  sub: "an AI coding workspace for your projects. Ask questions in plain language, explore a change, and get a clear next step—with you in control before anything is applied.",
  primary: { label: "download for free", href: "#demo" },
  secondary: { label: "star on gitHub", href: "https://github.com/saksham-rathore/Readcode" },
  hint: "browser-based prototype · Python API in development",
};

export const features = [
  { title: "Keep projects organized", body: "Create and list project workspaces through the current API. Repository connection and file indexing are planned next." },
  { title: "Ask about your code", body: "Send a coding question to the configured AI provider and keep the exchange in a project conversation." },
  { title: "Plan before changing", body: "Work through an idea in plain language and review a suggested approach before implementation tools are added." },
  { title: "One thread per task", body: "Keep questions about a feature together so the project discussion is easier to follow." },
  { title: "Stay in control", body: "The current prototype returns assistant text. File edits, terminal runs, and approval cards are planned capabilities." },
  { title: "Build on a scalable API", body: "The Python backend uses PostgreSQL and can use Redis for rate limiting as the product grows." },
];

export const models = ["OpenAI-compatible API", "Configurable model", "Custom API base URL"];

export const steps = [
  { title: "Create a project", body: "Add a project workspace through the Python API." },
  { title: "Ask a coding question", body: "Send a prompt to the model provider configured on the backend." },
  { title: "Review the answer", body: "Use the response to plan your next step. Direct file edits are not connected yet." },
];

export const plans = [
  { name: "Prototype", price: "$0", note: "current development preview", items: ["Project create and list API", "OpenAI-compatible chat endpoint", "Responsive frontend prototype"], cta: "Explore the preview" },
  { name: "Individual", price: "Soon", note: "planned; pricing not set", items: ["Repository connection", "Codebase context", "Reviewable file changes"], cta: "See roadmap", featured: true },
  { name: "Team", price: "Soon", note: "planned; pricing not set", items: ["Shared projects", "Team access controls", "Usage and audit tools"], cta: "See roadmap" },
];

export const faq = [
  { q: "is readcode really free?", a: "The current prototype is free to explore. Paid Plus and Pro plans shown above are design concepts, not available subscriptions." },
  { q: "what is readcode?", a: "Readcode is an AI coding workspace prototype for organizing projects, asking questions, and reviewing a clear next step." },
  { q: "which AI does it use?", a: "The backend calls an OpenAI-compatible chat API. You can configure the model name and API base URL on the server." },
  { q: "can it work on my repository?", a: "Repository connection and file indexing are planned. The current prototype supports project workspaces and conversations." },
  { q: "where does my data go?", a: "Prompts sent through the chat API go to the AI provider configured on your backend. Repository files are not connected to the current prototype." },
  { q: "how is this different from a chatbot?", a: "The project workspace keeps each conversation tied to its project, so questions and answers stay together." },
  { q: "can it edit or push code?", a: "Not yet. The current chat endpoint returns text; file edits, terminal access, and Git actions are planned capabilities." },
  { q: "can I run it on my own server?", a: "The repository includes a Python backend and a Next.js frontend you can run yourself. Hosted plans are still being explored." },
];

const footerEmail = "hello@readcode.dev";

export const footer = {
  email: footerEmail,
  columns: [
    { title: "product", links: [
      { label: "workspace demo", href: "#demo" },
      { label: "features", href: "#features" },
      { label: "pricing", href: "#pricing" },
    ] },
    { title: "learn", links: [
      { label: "get started", href: "#getting-started" },
      { label: "model options", href: "#models" },
      { label: "questions", href: "#faq" },
    ] },
    { title: "guides", links: [
      { label: "run locally", href: `${hero.secondary.href}#run-locally` },
      { label: "Docker setup", href: `${hero.secondary.href}#postgres-and-redis` },
      { label: "API reference", href: `${hero.secondary.href}#api-surface` },
    ] },
    { title: "readcode", links: [
      { label: "GitHub", href: hero.secondary.href },
      { label: "report an issue", href: `${hero.secondary.href}/issues` },
      { label: "contact", href: `mailto:${footerEmail}` },
    ] },
  ],
};
