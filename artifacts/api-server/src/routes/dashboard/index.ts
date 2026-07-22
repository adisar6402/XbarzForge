import { Router, type IRouter } from "express";
import { getAuth } from "@clerk/express";
import { db } from "@workspace/db";
import {
  projectsTable,
  analysesTable,
  documentsTable,
  conversationsTable,
} from "@workspace/db";
import { eq, desc, count } from "drizzle-orm";
import { GetDashboardResponse } from "@workspace/api-zod";
import { requireAuth } from "../../middlewares/auth";

const router: IRouter = Router();

router.get("/dashboard", requireAuth, async (req, res): Promise<void> => {
  const { userId } = getAuth(req);

  // Run all queries in parallel
  const [projectsResult, analysesResult, docsResult, conversationsResult, recentProjects, recentAnalyses] =
    await Promise.all([
      db
        .select({ count: count() })
        .from(projectsTable)
        .where(eq(projectsTable.userId, userId!)),
      db
        .select({ count: count() })
        .from(analysesTable)
        .innerJoin(projectsTable, eq(analysesTable.projectId, projectsTable.id))
        .where(eq(projectsTable.userId, userId!)),
      db
        .select({ count: count() })
        .from(documentsTable)
        .innerJoin(projectsTable, eq(documentsTable.projectId, projectsTable.id))
        .where(eq(projectsTable.userId, userId!)),
      db
        .select({ count: count() })
        .from(conversationsTable)
        .where(eq(conversationsTable.userId, userId!)),
      db
        .select()
        .from(projectsTable)
        .where(eq(projectsTable.userId, userId!))
        .orderBy(desc(projectsTable.createdAt))
        .limit(5),
      db
        .select({
          id: analysesTable.id,
          projectId: analysesTable.projectId,
          projectName: projectsTable.name,
          summary: analysesTable.summary,
          createdAt: analysesTable.createdAt,
        })
        .from(analysesTable)
        .innerJoin(projectsTable, eq(analysesTable.projectId, projectsTable.id))
        .where(eq(projectsTable.userId, userId!))
        .orderBy(desc(analysesTable.createdAt))
        .limit(5),
    ]);

  const dashboard = {
    projectCount: projectsResult[0]?.count ?? 0,
    analysisCount: analysesResult[0]?.count ?? 0,
    docCount: docsResult[0]?.count ?? 0,
    conversationCount: conversationsResult[0]?.count ?? 0,
    recentProjects,
    recentAnalyses,
  };

  res.json(GetDashboardResponse.parse(dashboard));
});

export default router;
