import { pgTable, text, serial, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  walletAddress: text("wallet_address").unique(),
});

export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  team: text("team").notNull(),
  position: text("position").notNull(),
  points: integer("points").default(0),
  imageUrl: text("image_url"),
});

export const drafts = pgTable("drafts", {
  id: serial("id").primaryKey(),
  contractId: integer("contract_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  entryFee: text("entry_fee").notNull(), // Store as string to handle big numbers
  deadline: timestamp("deadline").notNull(),
  isActive: boolean("is_active").default(true),
  totalPool: text("total_pool").default("0"),
  participants: integer("participants").default(0),
  maxParticipants: integer("max_participants").default(100),
});

export const draftEntries = pgTable("draft_entries", {
  id: serial("id").primaryKey(),
  draftId: integer("draft_id").notNull(),
  userAddress: text("user_address").notNull(),
  playerIds: text("player_ids").array(), // Array of player IDs as strings
  score: integer("score").default(0),
  txHash: text("tx_hash"),
});

export const leaderboard = pgTable("leaderboard", {
  id: serial("id").primaryKey(),
  userAddress: text("user_address").notNull().unique(),
  totalWins: integer("total_wins").default(0),
  totalEarnings: text("total_earnings").default("0"),
  gamesPlayed: integer("games_played").default(0),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  walletAddress: true,
});

export const insertPlayerSchema = createInsertSchema(players).omit({
  id: true,
});

export const insertDraftSchema = createInsertSchema(drafts).omit({
  id: true,
});

export const insertDraftEntrySchema = createInsertSchema(draftEntries).omit({
  id: true,
});

export const insertLeaderboardSchema = createInsertSchema(leaderboard).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type Player = typeof players.$inferSelect;
export type InsertDraft = z.infer<typeof insertDraftSchema>;
export type Draft = typeof drafts.$inferSelect;
export type InsertDraftEntry = z.infer<typeof insertDraftEntrySchema>;
export type DraftEntry = typeof draftEntries.$inferSelect;
export type InsertLeaderboard = z.infer<typeof insertLeaderboardSchema>;
export type LeaderboardEntry = typeof leaderboard.$inferSelect;
