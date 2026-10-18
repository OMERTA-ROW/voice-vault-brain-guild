// Demo command interpreter. Pure, deterministic, no network. Every action is simulated.
export type Risk = "safe" | "sensitive" | "blocked";

export interface CommandResult {
  intent: string;
  risk: Risk;
  agent: string;
  reply: string;
  /** For sensitive actions: exact phrase the user must type to confirm. */
  confirmPhrase?: string;
}

const has = (t: string, words: string[]) => words.some((w) => new RegExp(`\\b${w}`, "i").test(t));

export function interpretCommand(input: string): CommandResult {
  const t = input.trim();
  if (!t) return { intent: "empty", risk: "safe", agent: "Nova", reply: "I'm listening whenever you're ready." };

  if (has(t, ["password", "api key", "credential", "secret", "pin", "card number", "ssn"])) {
    return {
      intent: "credential",
      risk: "blocked",
      agent: "Sentinel",
      reply:
        "I'll stop you right there, kindly. Cyber Race never stores passwords or keys in the app. In a future release they'd live in a secure vault on the server, never here.",
    };
  }
  if (has(t, ["light", "thermostat", "door", "lock", "garage", "camera", "alarm"])) {
    return {
      intent: "smart_home",
      risk: "blocked",
      agent: "Atlas",
      reply:
        "No smart home devices are connected — this is a demo. When they are, unlocking or disabling security will always need your explicit approval.",
    };
  }
  if (has(t, ["buy", "purchase", "order", "pay", "checkout", "subscribe", "transfer"])) {
    return {
      intent: "purchase",
      risk: "sensitive",
      agent: "Ledger",
      reply: "That involves money, so I've drafted it for your approval. Nothing will be charged — payments aren't connected in this demo.",
      confirmPhrase: "APPROVE PURCHASE",
    };
  }
  if (has(t, ["send", "email", "post", "publish", "share", "message", "text"])) {
    return {
      intent: "outbound_message",
      risk: "sensitive",
      agent: "Echo",
      reply: "Speaking on your behalf needs your say-so. I've drafted it and it's waiting for approval. Nothing will actually be sent.",
      confirmPhrase: "APPROVE SEND",
    };
  }
  if (has(t, ["delete", "erase", "wipe", "revoke all"])) {
    return {
      intent: "destructive",
      risk: "sensitive",
      agent: "Sentinel",
      reply: "Deleting is permanent, so I want to be sure it's really you asking. Please confirm below.",
      confirmPhrase: "APPROVE DELETE",
    };
  }
  if (has(t, ["remind", "remember", "note", "save"])) {
    return { intent: "memory", risk: "safe", agent: "Nova", reply: `Got it — I've tucked that into your demo brain: "${t}".` };
  }
  if (has(t, ["schedule", "plan", "calendar", "meeting", "agenda"])) {
    return { intent: "planning", risk: "safe", agent: "Atlas", reply: "Here's a simulated plan: focus block 9–11, check-ins after lunch, wind-down at 6. No real calendar is linked yet." };
  }
  if (has(t, ["idea", "write", "caption", "script", "create", "draft"])) {
    return { intent: "creative", risk: "safe", agent: "Muse", reply: "Ooh, love this. Three angles: a behind-the-scenes story, a quick how-to, and a bold hot take. Want me to expand one?" };
  }
  return { intent: "chat", risk: "safe", agent: "Nova", reply: "I hear you. In this demo I can remember notes, sketch plans, brainstorm, and draft sensitive actions for your approval." };
}
