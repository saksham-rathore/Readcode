// Keep landing page copy in one place so the product language stays consistent.
export const brand = { name: "readcode", tagline: "an AI coding workspace for your projects" };

export const nav = [
  { label: "Features", href: "#features" },
  { label: "Models", href: "#models" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export const hero = {
  title: "A clear path from idea to code",
  sub: "an AI coding workspace for your projects. Ask questions in plain language, explore a change, and get a clear next step—with you in control before anything is applied.",
  primary: { label: "try the prototype", href: "#demo" },
  secondary: { label: "star on github", href: "https://github.com/saksham-rathore/Readcode" },
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
  { q: "Does my code leave my machine?", a: "Repository files are not connected to the current prototype. Prompts sent through the chat API go to the AI provider configured on the backend." },
  { q: "Which models can I use?", a: "The backend currently calls an OpenAI-compatible chat API. The model name and API base URL are configurable on the server." },
  { q: "Can the assistant edit or push code?", a: "Not yet. The current chat endpoint returns text only; file editing, terminal access, and Git operations still need to be implemented." },
  { q: "Is pricing available?", a: "No. The project is a prototype and has no published paid plans or pricing yet." },
];

export const footer = {
  columns: [
    { title: "Product", links: ["Features", "Pricing", "Roadmap", "Preview"] },
    { title: "Learn", links: ["How it works", "Models", "FAQ"] },
    { title: "Project", links: ["Readcode repository", "Privacy", "Contact"] },
  ],
};
