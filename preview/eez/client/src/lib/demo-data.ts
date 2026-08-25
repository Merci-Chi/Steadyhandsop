import type { OnlineUser, Message } from "@shared/schema";

export const DEMO_CONTACTS: OnlineUser[] = [
  {
    id: "demo-sarah",
    username: "sarah",
    displayName: "Sarah",
    avatarColor: "#ec4899",
    isTyping: false,
    typingContent: "",
  },
  {
    id: "demo-mike",
    username: "mike", 
    displayName: "Mike",
    avatarColor: "#3b82f6",
    isTyping: false,
    typingContent: "",
  },
  {
    id: "demo-emma",
    username: "emma",
    displayName: "Emma",
    avatarColor: "#10b981",
    isTyping: false,
    typingContent: "",
  },
  {
    id: "demo-alex",
    username: "alex",
    displayName: "Alex",
    avatarColor: "#f59e0b",
    isTyping: false,
    typingContent: "",
  },
];

export function getDemoMessages(userId: string): (Message & { user: OnlineUser })[] {
  const now = new Date();
  const contact = DEMO_CONTACTS.find(c => c.id === userId);
  if (!contact) return [];

  const messages: { content: string; fromContact: boolean; minutesAgo: number }[] = [];

  if (userId === "demo-sarah") {
    messages.push(
      { content: "Hey! Did you see that new movie?", fromContact: true, minutesAgo: 45 },
      { content: "Not yet! Is it good?", fromContact: false, minutesAgo: 42 },
      { content: "So good! We should watch it together", fromContact: true, minutesAgo: 40 },
    );
  } else if (userId === "demo-mike") {
    messages.push(
      { content: "Game night tomorrow?", fromContact: true, minutesAgo: 120 },
      { content: "I'm in! What time?", fromContact: false, minutesAgo: 115 },
      { content: "8pm at my place", fromContact: true, minutesAgo: 110 },
      { content: "Perfect, see you there", fromContact: false, minutesAgo: 108 },
    );
  } else if (userId === "demo-emma") {
    messages.push(
      { content: "Thanks for lunch today!", fromContact: true, minutesAgo: 180 },
      { content: "Anytime! That place was amazing", fromContact: false, minutesAgo: 175 },
    );
  } else if (userId === "demo-alex") {
    messages.push(
      { content: "Can you send me that file?", fromContact: true, minutesAgo: 300 },
    );
  }

  return messages.map((msg, i) => ({
    id: `demo-msg-${userId}-${i}`,
    channelId: "general",
    userId: msg.fromContact ? userId : "current-user",
    content: msg.content,
    timestamp: new Date(now.getTime() - msg.minutesAgo * 60000),
    parentId: null,
    user: msg.fromContact ? contact : {
      id: "current-user",
      username: "you",
      displayName: "You",
      avatarColor: "#6366f1",
      isTyping: false,
      typingContent: "",
    },
  }));
}

const BOT_RESPONSES = [
  "That's interesting! Tell me more",
  "I totally agree with you",
  "Haha, that's so funny!",
  "Nice! What else is new?",
  "Sounds great!",
  "I was just thinking the same thing",
  "Oh really? That's cool",
  "Makes sense to me",
  "Good point!",
  "I'll have to check that out",
];

export function getBotResponse(): string {
  return BOT_RESPONSES[Math.floor(Math.random() * BOT_RESPONSES.length)];
}
