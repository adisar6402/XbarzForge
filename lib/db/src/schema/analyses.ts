import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const analysesTable = pgTable("analyses", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  summary: text("summary").notNull().default(""),
  languages: text("languages").array().notNull().default([]),
  frameworks: text("frameworks").array().notNull().default([]),
  architectureOverview: text("architecture_overview"),
  importantFiles: text("important_files").array().notNull().default([]),
  codingPatterns: text("coding_patterns").array().notNull().default([]),
  setupInstructions: text("setup_instructions"),
  suggestedImprovements: text("suggested_improvements").array().notNull().default([]),
  // Extended analysis fields
  codeQualityScore: integer("code_quality_score"),
  bugDetection: text("bug_detection"),
  securityAnalysis: text("security_analysis"),
  performanceSuggestions: text("performance_suggestions").array().notNull().default([]),
  bestPractices: text("best_practices").array().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAnalysisSchema = createInsertSchema(analysesTable).omit({
  id: true,
  createdAt: true,
});
export type InsertAnalysis = z.infer<typeof insertAnalysisSchema>;
export type Analysis = typeof analysesTable.$inferSelect;
