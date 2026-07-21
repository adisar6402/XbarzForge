import { Router, type IRouter } from "express";
import { getAuth } from "@clerk/express";
import multer from "multer";
import { db } from "@workspace/db";
import {
  projectsTable,
  analysesTable,
  documentsTable,
} from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import {
  CreateProjectBody,
  CreateProjectResponse,
  GetProjectParams,
  GetProjectResponse,
  UpdateProjectParams,
  UpdateProjectBody,
  UpdateProjectResponse,
  DeleteProjectParams,
  AnalyzeProjectParams,
  AnalyzeProjectResponse,
  GetProjectAnalysisParams,
  GetProjectAnalysisResponse,
  ListProjectDocsParams,
  ListProjectDocsResponse,
  CreateProjectDocParams,
  CreateProjectDocBody,
  CreateProjectDocResponse,
  GetProjectDocParams,
  GetProjectDocResponse,
  DeleteProjectDocParams,
  ListProjectsResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../../middlewares/auth";
import { parseId } from "../../lib/parse-id";
import {
  getOpenAIClient,
  hasOpenAIKey,
  fetchGitHubContext,
  ANALYSIS_SYSTEM_PROMPT,
  DOC_PROMPTS,
} from "../../lib/openai";

const router: IRouter = Router();

// multer instance for file uploads (memory storage, max 30 MB per file, max 20 files)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 30 * 1024 * 1024, files: 20 },
});

// Binary-file extensions to skip during ZIP extraction
const BINARY_EXTENSIONS = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".bmp", ".ico", ".webp", ".svg",
  ".mp3", ".mp4", ".wav", ".ogg", ".avi", ".mov", ".mkv",
  ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx",
  ".zip", ".tar", ".gz", ".rar", ".7z",
  ".exe", ".dll", ".so", ".dylib", ".bin",
  ".woff", ".woff2", ".ttf", ".eot",
  ".lock", ".yarn",
  ".map",
]);

function isBinaryPath(filePath: string): boolean {
  const ext = filePath.substring(filePath.lastIndexOf(".")).toLowerCase();
  return BINARY_EXTENSIONS.has(ext);
}

function shouldSkipPath(filePath: string): boolean {
  const parts = filePath.split("/");
  const skipDirs = new Set([
    "node_modules", ".git", "dist", "build", ".next", "out",
    "__pycache__", ".venv", "venv", ".env", "vendor",
    ".cache", "coverage", ".nyc_output",
  ]);
  return parts.some((p) => skipDirs.has(p));
}

async function extractZipContent(buffer: Buffer): Promise<{ content: string; fileNames: string[] }> {
  // Dynamic import for unzipper to avoid ESM issues
  const unzipper = await import("unzipper");
  const zip = await unzipper.Open.buffer(buffer);
  const fileNames: string[] = [];
  const parts: string[] = [];

  for (const entry of zip.files) {
    if (entry.type !== "File") continue;
    if (shouldSkipPath(entry.path)) continue;
    if (isBinaryPath(entry.path)) continue;
    if (entry.uncompressedSize > 500_000) continue; // skip very large files

    try {
      const content = await entry.buffer();
      const text = content.toString("utf-8");
      // Basic UTF-8 sanity check
      if (text.includes("\u0000")) continue;
      fileNames.push(entry.path);
      parts.push(`\n// ===== ${entry.path} =====\n${text.slice(0, 15000)}`);
      if (parts.join("").length > 80_000) break; // stay within token budget
    } catch {
      // skip unreadable entries
    }
  }

  return { content: parts.join("\n"), fileNames };
}

// ─── Projects CRUD ─────────────────────────────────────────────────────────

router.get("/projects", requireAuth, async (req, res): Promise<void> => {
  const { userId } = getAuth(req);
  const projects = await db
    .select()
    .from(projectsTable)
    .where(eq(projectsTable.userId, userId!))
    .orderBy(desc(projectsTable.createdAt));
  res.json(ListProjectsResponse.parse(projects));
});

router.post("/projects", requireAuth, async (req, res): Promise<void> => {
  const { userId } = getAuth(req);
  const parsed = CreateProjectBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { name, description, type, githubUrl, codeContent } = parsed.data;

  const [project] = await db
    .insert(projectsTable)
    .values({
      userId: userId!,
      name,
      description,
      type,
      githubUrl,
      codeContent,
      status: "pending",
    })
    .returning();

  res.status(201).json(CreateProjectResponse.parse(project));
});

router.get("/projects/:id", requireAuth, async (req, res): Promise<void> => {
  const { userId } = getAuth(req);
  const params = GetProjectParams.safeParse({ id: parseId(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid project ID" });
    return;
  }

  const [project] = await db
    .select()
    .from(projectsTable)
    .where(
      and(
        eq(projectsTable.id, params.data.id),
        eq(projectsTable.userId, userId!),
      ),
    );

  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  res.json(GetProjectResponse.parse(project));
});

router.patch("/projects/:id", requireAuth, async (req, res): Promise<void> => {
  const { userId } = getAuth(req);
  const params = UpdateProjectParams.safeParse({ id: parseId(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid project ID" });
    return;
  }
  const body = UpdateProjectBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [project] = await db
    .update(projectsTable)
    .set({ ...body.data, updatedAt: new Date() })
    .where(
      and(
        eq(projectsTable.id, params.data.id),
        eq(projectsTable.userId, userId!),
      ),
    )
    .returning();

  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  res.json(UpdateProjectResponse.parse(project));
});

router.delete("/projects/:id", requireAuth, async (req, res): Promise<void> => {
  const { userId } = getAuth(req);
  const params = DeleteProjectParams.safeParse({ id: parseId(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid project ID" });
    return;
  }

  const [deleted] = await db
    .delete(projectsTable)
    .where(
      and(
        eq(projectsTable.id, params.data.id),
        eq(projectsTable.userId, userId!),
      ),
    )
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  res.sendStatus(204);
});

// ─── File Upload ────────────────────────────────────────────────────────────

router.post(
  "/projects/:id/upload",
  requireAuth,
  upload.array("files", 20),
  async (req, res): Promise<void> => {
    const { userId } = getAuth(req);
    const rawId = parseId(req.params.id);

    const [project] = await db
      .select()
      .from(projectsTable)
      .where(
        and(
          eq(projectsTable.id, rawId),
          eq(projectsTable.userId, userId!),
        ),
      );

    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      res.status(400).json({ error: "No files uploaded" });
      return;
    }

    const allParts: string[] = [];
    const allFileNames: string[] = [];

    for (const file of files) {
      const isZip =
        file.mimetype === "application/zip" ||
        file.mimetype === "application/x-zip-compressed" ||
        file.originalname.toLowerCase().endsWith(".zip");

      if (isZip) {
        try {
          const { content, fileNames } = await extractZipContent(file.buffer);
          allParts.push(`// ===== [ZIP: ${file.originalname}] =====\n${content}`);
          allFileNames.push(...fileNames);
        } catch (err) {
          allParts.push(`// ===== ${file.originalname} (ZIP extraction failed) =====`);
          allFileNames.push(file.originalname);
        }
      } else {
        if (isBinaryPath(file.originalname)) continue;
        const text = file.buffer.toString("utf-8");
        if (!text.includes("\u0000")) {
          allParts.push(`// ===== ${file.originalname} =====\n${text.slice(0, 30000)}`);
          allFileNames.push(file.originalname);
        }
      }
    }

    const combinedContent = allParts.join("\n\n").slice(0, 100_000);

    const [updated] = await db
      .update(projectsTable)
      .set({
        type: "upload",
        codeContent: combinedContent,
        fileNames: allFileNames,
        status: "pending",
        updatedAt: new Date(),
      })
      .where(eq(projectsTable.id, rawId))
      .returning();

    res.json(updated);
  },
);

// ─── Analysis ──────────────────────────────────────────────────────────────

router.post(
  "/projects/:id/analyze",
  requireAuth,
  async (req, res): Promise<void> => {
    const { userId } = getAuth(req);
    const params = AnalyzeProjectParams.safeParse({
      id: parseId(req.params.id),
    });
    if (!params.success) {
      res.status(400).json({ error: "Invalid project ID" });
      return;
    }

    const [project] = await db
      .select()
      .from(projectsTable)
      .where(
        and(
          eq(projectsTable.id, params.data.id),
          eq(projectsTable.userId, userId!),
        ),
      );

    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    if (!hasOpenAIKey()) {
      res.status(503).json({
        error: "AI features are currently unavailable because no AI provider has been configured. Configure a valid OpenAI API key in the application's environment variables to enable AI-powered analysis.",
      });
      return;
    }

    await db
      .update(projectsTable)
      .set({ status: "analyzing" })
      .where(eq(projectsTable.id, project.id));

    try {
      let codeContext = "";
      if (project.type === "github" && project.githubUrl) {
        codeContext = await fetchGitHubContext(project.githubUrl);
      } else if (project.codeContent) {
        codeContext = project.codeContent.slice(0, 60000);
      } else {
        codeContext = `Project name: ${project.name}\nDescription: ${project.description || "No description provided"}\nNo code content or GitHub URL provided.`;
      }

      const openai = getOpenAIClient();
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: ANALYSIS_SYSTEM_PROMPT },
          {
            role: "user",
            content: `Analyze this codebase for project "${project.name}":\n\n${codeContext}`,
          },
        ],
        response_format: { type: "json_object" },
        max_tokens: 5000,
      });

      const raw = completion.choices[0]?.message?.content ?? "{}";
      let analysisData: Record<string, unknown>;
      try {
        analysisData = JSON.parse(raw);
      } catch {
        analysisData = {};
      }

      const [analysis] = await db
        .insert(analysesTable)
        .values({
          projectId: project.id,
          summary: String(analysisData.summary ?? "Analysis complete."),
          languages: Array.isArray(analysisData.languages)
            ? (analysisData.languages as string[])
            : [],
          frameworks: Array.isArray(analysisData.frameworks)
            ? (analysisData.frameworks as string[])
            : [],
          architectureOverview: analysisData.architectureOverview
            ? String(analysisData.architectureOverview)
            : null,
          importantFiles: Array.isArray(analysisData.importantFiles)
            ? (analysisData.importantFiles as string[])
            : [],
          codingPatterns: Array.isArray(analysisData.codingPatterns)
            ? (analysisData.codingPatterns as string[])
            : [],
          setupInstructions: analysisData.setupInstructions
            ? String(analysisData.setupInstructions)
            : null,
          suggestedImprovements: Array.isArray(analysisData.suggestedImprovements)
            ? (analysisData.suggestedImprovements as string[])
            : [],
          codeQualityScore:
            typeof analysisData.codeQualityScore === "number"
              ? Math.min(10, Math.max(1, Math.round(analysisData.codeQualityScore)))
              : null,
          bugDetection: analysisData.bugDetection
            ? String(analysisData.bugDetection)
            : null,
          securityAnalysis: analysisData.securityAnalysis
            ? String(analysisData.securityAnalysis)
            : null,
          performanceSuggestions: Array.isArray(analysisData.performanceSuggestions)
            ? (analysisData.performanceSuggestions as string[])
            : [],
          bestPractices: Array.isArray(analysisData.bestPractices)
            ? (analysisData.bestPractices as string[])
            : [],
        })
        .returning();

      await db
        .update(projectsTable)
        .set({ status: "analyzed" })
        .where(eq(projectsTable.id, project.id));

      res.json(AnalyzeProjectResponse.parse(analysis));
    } catch (err) {
      await db
        .update(projectsTable)
        .set({ status: "error" })
        .where(eq(projectsTable.id, project.id));
      throw err;
    }
  },
);

router.get(
  "/projects/:id/analysis",
  requireAuth,
  async (req, res): Promise<void> => {
    const { userId } = getAuth(req);
    const params = GetProjectAnalysisParams.safeParse({
      id: parseId(req.params.id),
    });
    if (!params.success) {
      res.status(400).json({ error: "Invalid project ID" });
      return;
    }

    const [project] = await db
      .select()
      .from(projectsTable)
      .where(
        and(
          eq(projectsTable.id, params.data.id),
          eq(projectsTable.userId, userId!),
        ),
      );

    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    const [analysis] = await db
      .select()
      .from(analysesTable)
      .where(eq(analysesTable.projectId, params.data.id))
      .orderBy(desc(analysesTable.createdAt))
      .limit(1);

    if (!analysis) {
      res.status(404).json({ error: "No analysis found. Run analysis first." });
      return;
    }

    res.json(GetProjectAnalysisResponse.parse(analysis));
  },
);

// ─── Documents ─────────────────────────────────────────────────────────────

router.get(
  "/projects/:id/docs",
  requireAuth,
  async (req, res): Promise<void> => {
    const { userId } = getAuth(req);
    const params = ListProjectDocsParams.safeParse({
      id: parseId(req.params.id),
    });
    if (!params.success) {
      res.status(400).json({ error: "Invalid project ID" });
      return;
    }

    const [project] = await db
      .select()
      .from(projectsTable)
      .where(
        and(
          eq(projectsTable.id, params.data.id),
          eq(projectsTable.userId, userId!),
        ),
      );

    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    const docs = await db
      .select()
      .from(documentsTable)
      .where(eq(documentsTable.projectId, params.data.id))
      .orderBy(desc(documentsTable.createdAt));

    res.json(ListProjectDocsResponse.parse(docs));
  },
);

router.post(
  "/projects/:id/docs",
  requireAuth,
  async (req, res): Promise<void> => {
    const { userId } = getAuth(req);
    const params = CreateProjectDocParams.safeParse({
      id: parseId(req.params.id),
    });
    if (!params.success) {
      res.status(400).json({ error: "Invalid project ID" });
      return;
    }
    const body = CreateProjectDocBody.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ error: body.error.message });
      return;
    }

    const [project] = await db
      .select()
      .from(projectsTable)
      .where(
        and(
          eq(projectsTable.id, params.data.id),
          eq(projectsTable.userId, userId!),
        ),
      );

    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    if (!hasOpenAIKey()) {
      res.status(503).json({
        error: "AI features are currently unavailable because no AI provider has been configured. Configure a valid OpenAI API key in the application's environment variables to enable AI-powered analysis.",
      });
      return;
    }

    const [analysis] = await db
      .select()
      .from(analysesTable)
      .where(eq(analysesTable.projectId, params.data.id))
      .orderBy(desc(analysesTable.createdAt))
      .limit(1);

    const docConfig = DOC_PROMPTS[body.data.type];
    if (!docConfig) {
      res.status(400).json({ error: "Invalid document type" });
      return;
    }

    const projectContext = analysis
      ? `Project: ${project.name}
Description: ${project.description || "N/A"}
Summary: ${analysis.summary}
Languages: ${analysis.languages.join(", ")}
Frameworks: ${analysis.frameworks.join(", ")}
Architecture: ${analysis.architectureOverview || "N/A"}
Key Files: ${analysis.importantFiles.join(", ")}
Coding Patterns: ${analysis.codingPatterns.join(", ")}
Setup: ${analysis.setupInstructions || "N/A"}
Improvements: ${analysis.suggestedImprovements.join(", ")}`
      : `Project: ${project.name}\nDescription: ${project.description || "N/A"}\nType: ${project.type}\n${project.githubUrl ? `GitHub: ${project.githubUrl}` : ""}`;

    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a technical writer who produces clear, professional documentation for software projects.",
        },
        {
          role: "user",
          content: `${docConfig.prompt}\n\nProject context:\n${projectContext}`,
        },
      ],
      max_tokens: 4000,
    });

    const content =
      completion.choices[0]?.message?.content ??
      "Documentation generation failed.";

    const [doc] = await db
      .insert(documentsTable)
      .values({
        projectId: params.data.id,
        type: body.data.type,
        title: docConfig.title,
        content,
      })
      .returning();

    res.status(201).json(CreateProjectDocResponse.parse(doc));
  },
);

router.get(
  "/projects/:id/docs/:docId",
  requireAuth,
  async (req, res): Promise<void> => {
    const { userId } = getAuth(req);
    const params = GetProjectDocParams.safeParse({
      id: parseId(req.params.id),
      docId: parseId(req.params.docId),
    });
    if (!params.success) {
      res.status(400).json({ error: "Invalid parameters" });
      return;
    }

    const [project] = await db
      .select()
      .from(projectsTable)
      .where(
        and(
          eq(projectsTable.id, params.data.id),
          eq(projectsTable.userId, userId!),
        ),
      );

    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    const [doc] = await db
      .select()
      .from(documentsTable)
      .where(
        and(
          eq(documentsTable.id, params.data.docId),
          eq(documentsTable.projectId, params.data.id),
        ),
      );

    if (!doc) {
      res.status(404).json({ error: "Document not found" });
      return;
    }

    res.json(GetProjectDocResponse.parse(doc));
  },
);

router.delete(
  "/projects/:id/docs/:docId",
  requireAuth,
  async (req, res): Promise<void> => {
    const { userId } = getAuth(req);
    const params = DeleteProjectDocParams.safeParse({
      id: parseId(req.params.id),
      docId: parseId(req.params.docId),
    });
    if (!params.success) {
      res.status(400).json({ error: "Invalid parameters" });
      return;
    }

    const [project] = await db
      .select()
      .from(projectsTable)
      .where(
        and(
          eq(projectsTable.id, params.data.id),
          eq(projectsTable.userId, userId!),
        ),
      );

    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    const [deleted] = await db
      .delete(documentsTable)
      .where(
        and(
          eq(documentsTable.id, params.data.docId),
          eq(documentsTable.projectId, params.data.id),
        ),
      )
      .returning();

    if (!deleted) {
      res.status(404).json({ error: "Document not found" });
      return;
    }

    res.sendStatus(204);
  },
);

export default router;
