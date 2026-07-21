import { Router, type IRouter } from "express";
import { getAuth } from "@clerk/express";
import { db } from "@workspace/db";
import {
  conversationsTable,
  messagesTable,
  projectsTable,
  analysesTable,
} from "@workspace/db";
import { eq, and, desc, asc } from "drizzle-orm";
import {
  CreateOpenaiConversationBody,
  CreateOpenaiConversationResponse,
  GetOpenaiConversationParams,
  GetOpenaiConversationResponse,
  DeleteOpenaiConversationParams,
  ListOpenaiMessagesParams,
  ListOpenaiMessagesResponse,
  SendOpenaiMessageParams,
  SendOpenaiMessageBody,
  ListOpenaiConversationsResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../../middlewares/auth";
import { parseId } from "../../lib/parse-id";
import { getOpenAIClient } from "../../lib/openai";

const router: IRouter = Router();

// ─── Conversations ──────────────────────────────────────────────────────────

router.get("/openai/conversations", requireAuth, async (req, res): Promise<void> => {
  const { userId } = getAuth(req);
  const conversations = await db
    .select()
    .from(conversationsTable)
    .where(eq(conversationsTable.userId, userId!))
    .orderBy(desc(conversationsTable.createdAt));
  res.json(ListOpenaiConversationsResponse.parse(conversations));
});

router.post("/openai/conversations", requireAuth, async (req, res): Promise<void> => {
  const { userId } = getAuth(req);
  const body = CreateOpenaiConversationBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [conversation] = await db
    .insert(conversationsTable)
    .values({
      userId: userId!,
      title: body.data.title,
      projectId: body.data.projectId ?? null,
    })
    .returning();

  res.status(201).json(CreateOpenaiConversationResponse.parse(conversation));
});

router.get("/openai/conversations/:id", requireAuth, async (req, res): Promise<void> => {
  const { userId } = getAuth(req);
  const params = GetOpenaiConversationParams.safeParse({ id: parseId(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid conversation ID" });
    return;
  }

  const [conversation] = await db
    .select()
    .from(conversationsTable)
    .where(and(eq(conversationsTable.id, params.data.id), eq(conversationsTable.userId, userId!)));

  if (!conversation) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }

  const messages = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.conversationId, params.data.id))
    .orderBy(asc(messagesTable.createdAt));

  res.json(GetOpenaiConversationResponse.parse({ ...conversation, messages }));
});

router.delete("/openai/conversations/:id", requireAuth, async (req, res): Promise<void> => {
  const { userId } = getAuth(req);
  const params = DeleteOpenaiConversationParams.safeParse({ id: parseId(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid conversation ID" });
    return;
  }

  const [deleted] = await db
    .delete(conversationsTable)
    .where(and(eq(conversationsTable.id, params.data.id), eq(conversationsTable.userId, userId!)))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }

  res.sendStatus(204);
});

// ─── Messages ───────────────────────────────────────────────────────────────

router.get("/openai/conversations/:id/messages", requireAuth, async (req, res): Promise<void> => {
  const { userId } = getAuth(req);
  const params = ListOpenaiMessagesParams.safeParse({ id: parseId(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid conversation ID" });
    return;
  }

  const [conversation] = await db
    .select()
    .from(conversationsTable)
    .where(and(eq(conversationsTable.id, params.data.id), eq(conversationsTable.userId, userId!)));

  if (!conversation) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }

  const messages = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.conversationId, params.data.id))
    .orderBy(asc(messagesTable.createdAt));

  res.json(ListOpenaiMessagesResponse.parse(messages));
});

// SSE streaming endpoint for chat
router.post("/openai/conversations/:id/messages", requireAuth, async (req, res): Promise<void> => {
  const { userId } = getAuth(req);
  const params = SendOpenaiMessageParams.safeParse({ id: parseId(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid conversation ID" });
    return;
  }
  const body = SendOpenaiMessageBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  if (!process.env.OPENAI_API_KEY) {
    res.status(503).json({ error: "AI features are currently unavailable because no AI provider has been configured. Configure a valid OpenAI API key in the application's environment variables to enable AI-powered analysis." });
    return;
  }

  const [conversation] = await db
    .select()
    .from(conversationsTable)
    .where(and(eq(conversationsTable.id, params.data.id), eq(conversationsTable.userId, userId!)));

  if (!conversation) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }

  // Save user message
  await db.insert(messagesTable).values({
    conversationId: conversation.id,
    role: "user",
    content: body.data.content,
  });

  // Build system prompt with optional project context
  let systemPrompt =
    "You are XbarzForge AI, an expert software engineering assistant with deep knowledge of codebases, architecture, debugging, and best practices. Be concise, technical, and helpful. Use code blocks for code examples.";

  if (conversation.projectId) {
    const [project] = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.id, conversation.projectId));

    if (project) {
      const [analysis] = await db
        .select()
        .from(analysesTable)
        .where(eq(analysesTable.projectId, project.id))
        .orderBy(desc(analysesTable.createdAt))
        .limit(1);

      systemPrompt += `\n\nYou are helping with the project: "${project.name}".`;
      if (project.description) systemPrompt += `\nDescription: ${project.description}`;

      if (analysis) {
        systemPrompt += `\n\nProject Analysis:
Summary: ${analysis.summary}
Languages: ${analysis.languages.join(", ")}
Frameworks: ${analysis.frameworks.join(", ")}
Architecture: ${analysis.architectureOverview || "N/A"}
Key Files: ${analysis.importantFiles.join(", ")}
Coding Patterns: ${analysis.codingPatterns.join(", ")}`;
      }
    }
  }

  // Load message history
  const history = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.conversationId, conversation.id))
    .orderBy(asc(messagesTable.createdAt))
    .limit(50);

  const chatMessages = [
    { role: "system" as const, content: systemPrompt },
    ...history.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  ];

  // Set SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");

  const openai = getOpenAIClient();
  let fullResponse = "";

  const stream = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: chatMessages,
    stream: true,
    max_tokens: 4000,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      fullResponse += content;
      res.write(`data: ${JSON.stringify({ content })}\n\n`);
    }
  }

  // Save assistant response
  await db.insert(messagesTable).values({
    conversationId: conversation.id,
    role: "assistant",
    content: fullResponse,
  });

  res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
  res.end();
});

export default router;
