import { Router, type IRouter } from "express";
import { getAuth } from "@clerk/express";
import { db } from "@workspace/db";
import {
  projectsTable,
  documentsTable,
  conversationsTable,
} from "@workspace/db";
import { eq, and, or, ilike } from "drizzle-orm";
import { requireAuth } from "../../middlewares/auth";

const router: IRouter = Router();

router.get("/search", requireAuth, async (req, res): Promise<void> => {
  const { userId } = getAuth(req);
  const q = String(req.query.q ?? "").trim();

  if (!q || q.length < 1) {
    res.json({ projects: [], docs: [], conversations: [] });
    return;
  }

  const term = `%${q}%`;

  const [projects, conversations, docsJoin] = await Promise.all([
    db
      .select()
      .from(projectsTable)
      .where(
        and(
          eq(projectsTable.userId, userId!),
          or(
            ilike(projectsTable.name, term),
            ilike(projectsTable.description, term),
          ),
        ),
      )
      .limit(10),

    db
      .select()
      .from(conversationsTable)
      .where(
        and(
          eq(conversationsTable.userId, userId!),
          ilike(conversationsTable.title, term),
        ),
      )
      .limit(10),

    db
      .select({
        id: documentsTable.id,
        projectId: documentsTable.projectId,
        type: documentsTable.type,
        title: documentsTable.title,
        content: documentsTable.content,
        createdAt: documentsTable.createdAt,
        updatedAt: documentsTable.updatedAt,
      })
      .from(documentsTable)
      .innerJoin(
        projectsTable,
        eq(documentsTable.projectId, projectsTable.id),
      )
      .where(
        and(
          eq(projectsTable.userId, userId!),
          or(
            ilike(documentsTable.title, term),
            ilike(documentsTable.content, term),
          ),
        ),
      )
      .limit(10),
  ]);

  res.json({ projects, docs: docsJoin, conversations });
});

export default router;
