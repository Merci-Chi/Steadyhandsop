import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name").notNull(),
  avatarColor: text("avatar_color").notNull().default("#0ea5e9"),
});

export const channels = pgTable("channels", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  channelId: varchar("channel_id").notNull(),
  userId: varchar("user_id").notNull(),
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  parentId: varchar("parent_id"),
});

export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  channelId: varchar("channel_id").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull().default(""),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  displayName: true,
  avatarColor: true,
});

export const insertChannelSchema = createInsertSchema(channels).pick({
  name: true,
  description: true,
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  channelId: true,
  userId: true,
  content: true,
  parentId: true,
});

export const insertDocumentSchema = createInsertSchema(documents).pick({
  channelId: true,
  title: true,
  content: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertChannel = z.infer<typeof insertChannelSchema>;
export type Channel = typeof channels.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;

export interface OnlineUser {
  id: string;
  username: string;
  displayName: string;
  avatarColor: string;
  isTyping: boolean;
  typingContent: string;
  cursorPosition?: { line: number; column: number };
}

export interface TypingIndicator {
  userId: string;
  username: string;
  displayName: string;
  avatarColor: string;
  content: string;
  channelId: string;
}

export interface MediaMessage {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  avatarColor: string;
  channelId: string;
  type: "image" | "video" | "file";
  url: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  timestamp: Date;
}

export interface CursorPosition {
  userId: string;
  displayName: string;
  avatarColor: string;
  documentId: string;
  position: number;
  selection?: { start: number; end: number };
}

export type WebSocketMessage =
  | { type: "join"; user: OnlineUser; channelId: string }
  | { type: "leave"; userId: string }
  | { type: "message"; message: Message & { user: OnlineUser } }
  | { type: "media"; media: MediaMessage }
  | { type: "typing"; indicator: TypingIndicator }
  | { type: "typing_stop"; userId: string; channelId: string }
  | { type: "presence_update"; users: OnlineUser[] }
  | { type: "document_update"; documentId: string; content: string; userId: string }
  | { type: "cursor_update"; cursor: CursorPosition }
  | { type: "history"; messages: (Message & { user: OnlineUser })[] }
  | { type: "channels"; channels: Channel[] }
  | { type: "document"; document: Document }
  | { type: "error"; message: string };
