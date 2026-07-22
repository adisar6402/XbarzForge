import { Router, type IRouter } from "express";
import healthRouter from "./health";
import dashboardRouter from "./dashboard";
import projectsRouter from "./projects";
import openaiRouter from "./openai";
import searchRouter from "./search";
import { hasOpenAIKey } from "../lib/openai";

const router: IRouter = Router();

// Public status endpoint — lets the frontend check AI availability on load.
router.get("/status", (_req, res) => {
  res.json({ ok: true, aiEnabled: hasOpenAIKey() });
});

router.use(healthRouter);
router.use(dashboardRouter);
router.use(searchRouter);
router.use(projectsRouter);
router.use(openaiRouter);

export default router;
