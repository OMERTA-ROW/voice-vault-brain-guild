export interface Agent {
  id: string; name: string; role: string; personality: string; greeting: string;
  hue: "gold" | "cyan"; capabilities: string[]; risk: "low" | "medium" | "high";
}

export const agents: Agent[] = [
  { id: "nova", name: "Nova", role: "Personal brain companion", hue: "cyan", risk: "low",
    personality: "Warm, curious, remembers the little things. Talks like a friend who's genuinely glad you're here.",
    greeting: "Hey you. What's on your mind today?", capabilities: ["memory.write", "memory.recall", "chat"] },
  { id: "atlas", name: "Atlas", role: "Planner & home steward", hue: "gold", risk: "medium",
    personality: "Calm and steady. Breaks big days into small, doable steps without lecturing.",
    greeting: "Let's make today feel lighter. Where shall we start?", capabilities: ["calendar.read", "planning", "home.devices (future)"] },
  { id: "muse", name: "Muse", role: "CreatorLife collaborator", hue: "cyan", risk: "low",
    personality: "Playful, energetic, generous with ideas — and honest when one isn't landing.",
    greeting: "Okay, I'm buzzing. What are we making?", capabilities: ["drafting", "ideation", "social.post (approval)"] },
  { id: "echo", name: "Echo", role: "Communications", hue: "gold", risk: "high",
    personality: "Polished and tactful. Matches your voice and always checks before speaking for you.",
    greeting: "Want me to draft something? I'll never send without you.", capabilities: ["email.draft", "message.send (approval)"] },
  { id: "ledger", name: "Ledger", role: "Money & purchases", hue: "gold", risk: "high",
    personality: "Careful, transparent, a little protective. Explains costs plainly before anything moves.",
    greeting: "Happy to help budget. Every cent waits for your OK.", capabilities: ["budget.view", "purchase (strong approval)"] },
  { id: "sentinel", name: "Sentinel", role: "Privacy guardian", hue: "cyan", risk: "low",
    personality: "Quietly vigilant and kind. Explains every permission in plain words.",
    greeting: "Your data, your rules. I'm keeping watch.", capabilities: ["audit.read", "permissions.review"] },
];

export type ServiceStatus = "mock" | "planned";
export const services: { id: string; name: string; category: string; status: ServiceStatus; scopes: string[] }[] = [
  { id: "cal", name: "Calendar", category: "WorkLife", status: "mock", scopes: ["read events", "propose events"] },
  { id: "mail", name: "Email", category: "WorkLife", status: "mock", scopes: ["read drafts", "send (approval)"] },
  { id: "docs", name: "Docs & Notes", category: "WorkLife", status: "mock", scopes: ["read", "write"] },
  { id: "social", name: "Social Channels", category: "CreatorLife", status: "mock", scopes: ["draft posts", "publish (approval)"] },
  { id: "video", name: "Video Studio", category: "CreatorLife", status: "planned", scopes: ["upload (approval)"] },
  { id: "pay", name: "Payments", category: "Commerce", status: "planned", scopes: ["purchase (strong approval)"] },
  { id: "home", name: "Smart Home", category: "Home", status: "planned", scopes: ["device control (approval)"] },
  { id: "health", name: "Wellbeing", category: "Life", status: "planned", scopes: ["read summaries"] },
];
