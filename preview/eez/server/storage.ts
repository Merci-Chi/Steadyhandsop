import { 
  type User, 
  type InsertUser, 
  type Channel, 
  type InsertChannel,
  type Message,
  type InsertMessage,
  type Document,
  type InsertDocument,
  type OnlineUser
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface StoredMessage extends Message {
  userDisplayName: string;
  userAvatarColor: string;
  userUsername: string;
}

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getChannels(): Promise<Channel[]>;
  getChannel(id: string): Promise<Channel | undefined>;
  createChannel(channel: InsertChannel): Promise<Channel>;
  
  getMessages(channelId: string): Promise<StoredMessage[]>;
  createMessage(message: InsertMessage, user: OnlineUser): Promise<StoredMessage>;
  
  getDocument(id: string): Promise<Document | undefined>;
  getDocumentByChannel(channelId: string): Promise<Document | undefined>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: string, content: string): Promise<Document | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private channels: Map<string, Channel>;
  private messages: Map<string, StoredMessage>;
  private documents: Map<string, Document>;

  constructor() {
    this.users = new Map();
    this.channels = new Map();
    this.messages = new Map();
    this.documents = new Map();

    this.channels.set("general", {
      id: "general",
      name: "general",
      description: "General discussion",
    });
    this.channels.set("random", {
      id: "random",
      name: "random",
      description: "Random topics",
    });
    this.channels.set("collaboration", {
      id: "collaboration",
      name: "collaboration",
      description: "Work together",
    });

    this.documents.set("shared", {
      id: "shared",
      channelId: "general",
      title: "Shared Notes",
      content: "",
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      id,
      username: insertUser.username,
      password: insertUser.password,
      displayName: insertUser.displayName || insertUser.username,
      avatarColor: insertUser.avatarColor || "#0ea5e9",
    };
    this.users.set(id, user);
    return user;
  }

  async getChannels(): Promise<Channel[]> {
    return Array.from(this.channels.values());
  }

  async getChannel(id: string): Promise<Channel | undefined> {
    return this.channels.get(id);
  }

  async createChannel(insertChannel: InsertChannel): Promise<Channel> {
    const id = randomUUID();
    const channel: Channel = {
      id,
      name: insertChannel.name,
      description: insertChannel.description || null,
    };
    this.channels.set(id, channel);
    return channel;
  }

  async getMessages(channelId: string): Promise<StoredMessage[]> {
    return Array.from(this.messages.values())
      .filter((m) => m.channelId === channelId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  async createMessage(insertMessage: InsertMessage, user: OnlineUser): Promise<StoredMessage> {
    const id = randomUUID();
    const message: StoredMessage = {
      id,
      channelId: insertMessage.channelId,
      userId: insertMessage.userId,
      content: insertMessage.content,
      timestamp: new Date(),
      parentId: insertMessage.parentId || null,
      userDisplayName: user.displayName,
      userAvatarColor: user.avatarColor,
      userUsername: user.username,
    };
    this.messages.set(id, message);
    return message;
  }

  async getDocument(id: string): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async getDocumentByChannel(channelId: string): Promise<Document | undefined> {
    return Array.from(this.documents.values()).find(
      (doc) => doc.channelId === channelId
    );
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = randomUUID();
    const document: Document = {
      id,
      channelId: insertDocument.channelId,
      title: insertDocument.title,
      content: insertDocument.content || "",
    };
    this.documents.set(id, document);
    return document;
  }

  async updateDocument(id: string, content: string): Promise<Document | undefined> {
    const doc = this.documents.get(id);
    if (doc) {
      doc.content = content;
      this.documents.set(id, doc);
      return doc;
    }
    return undefined;
  }
}

export const storage = new MemStorage();
