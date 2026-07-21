import OpenAI from "openai";
import { logger } from "./logger";

let client: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error(
      "OPENAI_API_KEY environment variable is not set. Please add it to your Replit Secrets.",
    );
  }
  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return client;
}

export function hasOpenAIKey(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

export async function fetchGitHubContext(githubUrl: string): Promise<string> {
  const match = githubUrl.match(/github\.com\/([^/]+)\/([^/\s]+)/);
  if (!match)
    return `GitHub URL provided: ${githubUrl} (unable to parse owner/repo)`;

  const [, owner, repo] = match;
  const cleanRepo = repo.replace(/\.git$/, "");
  const baseUrl = `https://api.github.com/repos/${owner}/${cleanRepo}`;

  try {
    const [repoRes, readmeRes, contentsRes] = await Promise.all([
      fetch(baseUrl, { headers: { Accept: "application/vnd.github.v3+json" } }),
      fetch(`${baseUrl}/readme`, {
        headers: { Accept: "application/vnd.github.v3+json" },
      }),
      fetch(`${baseUrl}/contents`, {
        headers: { Accept: "application/vnd.github.v3+json" },
      }),
    ]);

    type RepoData = {
      full_name?: string;
      description?: string;
      language?: string;
      stargazers_count?: number;
      topics?: string[];
      open_issues_count?: number;
      default_branch?: string;
    };
    type ReadmeData = { content?: string };

    const repoData: RepoData = repoRes.ok
      ? ((await repoRes.json()) as RepoData)
      : {};

    let readmeContent = "";
    if (readmeRes.ok) {
      const readmeData = (await readmeRes.json()) as ReadmeData;
      if (readmeData.content) {
        readmeContent = Buffer.from(readmeData.content, "base64")
          .toString("utf-8")
          .slice(0, 6000);
      }
    }

    let fileList = "";
    let packageJson = "";
    if (contentsRes.ok) {
      const contents = await contentsRes.json();
      if (Array.isArray(contents)) {
        fileList = contents
          .map(
            (f: { name: string; type: string }) =>
              `${f.type === "dir" ? "📁" : "📄"} ${f.name}`,
          )
          .join("\n");
        const pkgFile = contents.find(
          (f: { name: string; download_url?: string }) =>
            f.name === "package.json",
        );
        if (pkgFile?.download_url) {
          try {
            const pkgRes = await fetch(pkgFile.download_url);
            packageJson = pkgRes.ok ? (await pkgRes.text()).slice(0, 3000) : "";
          } catch {
            packageJson = "";
          }
        }
      }
    }

    return `
Repository: ${repoData.full_name || `${owner}/${cleanRepo}`}
Description: ${repoData.description || "No description"}
Primary Language: ${repoData.language || "Unknown"}
Stars: ${repoData.stargazers_count ?? 0}
Topics: ${(repoData.topics || []).join(", ") || "none"}
Open Issues: ${repoData.open_issues_count ?? 0}
Default Branch: ${repoData.default_branch || "main"}

Root Files:
${fileList || "Unable to fetch file list"}

README:
${readmeContent || "No README found"}

package.json:
${packageJson || "Not found"}
    `.trim();
  } catch (err) {
    logger.error({ err, githubUrl }, "Failed to fetch GitHub context");
    return `GitHub repository: ${githubUrl}\nUnable to fetch repository details automatically.`;
  }
}

export const ANALYSIS_SYSTEM_PROMPT = `You are an expert software architect and senior developer. Analyze the provided codebase and return ONLY a valid JSON object (no markdown, no extra text) with this exact structure:
{
  "summary": "2-3 paragraph comprehensive overview of what this project does, its purpose, and target users",
  "languages": ["programming languages detected"],
  "frameworks": ["frameworks, libraries, and major tools"],
  "architectureOverview": "Detailed explanation of the architecture, design patterns, component relationships, and data flow",
  "importantFiles": ["file.ts - what it does", "folder/file.ts - its role"],
  "codingPatterns": ["pattern 1 observed", "pattern 2 observed"],
  "setupInstructions": "Clear step-by-step instructions to install dependencies and run this project locally",
  "suggestedImprovements": ["specific actionable improvement 1", "specific actionable improvement 2"],
  "codeQualityScore": 7,
  "bugDetection": "Description of potential bugs, edge cases, error handling issues, and reliability risks found in the codebase. Be specific about file locations if possible.",
  "securityAnalysis": "Security vulnerabilities, authentication gaps, input validation issues, secrets exposure risks, OWASP top-10 considerations, and concrete remediation recommendations.",
  "performanceSuggestions": ["specific performance improvement 1 with reasoning", "specific improvement 2"],
  "bestPractices": ["best practice violation or recommendation 1", "convention or pattern that should be adopted"]
}

For codeQualityScore: rate from 1-10 where 1=unusable, 5=adequate, 10=exemplary production code. Consider: test coverage, error handling, documentation, code organization, and maintainability.`;

export const DOC_PROMPTS: Record<string, { title: string; prompt: string }> = {
  readme: {
    title: "README.md",
    prompt:
      "Generate a comprehensive README.md in Markdown format. Include: project title with badges, description, features list, tech stack, prerequisites, installation steps, usage examples, API overview (if applicable), contributing guide, and license section. Make it professional and developer-friendly.",
  },
  api: {
    title: "API Documentation",
    prompt:
      "Generate comprehensive API documentation in Markdown format. Include: overview, base URL, authentication, all endpoints with HTTP methods/paths/descriptions/request+response examples, error codes, and rate limiting info. Use clear formatting with code blocks.",
  },
  architecture: {
    title: "Architecture Documentation",
    prompt:
      "Generate a detailed architecture documentation in Markdown format. Include: system overview, component diagram (ASCII art), data flow explanation, technology decisions and rationale, database schema (if applicable), API layer, frontend structure, deployment architecture, and scalability considerations.",
  },
  setup: {
    title: "Setup Guide",
    prompt:
      "Generate a detailed setup guide in Markdown format. Include: prerequisites with version requirements, environment variables setup (.env example), database setup, running in development mode, running tests, building for production, common issues and solutions (troubleshooting), and deployment steps.",
  },
  onboarding: {
    title: "Developer Onboarding Guide",
    prompt:
      "Generate a developer onboarding guide in Markdown format. Include: project overview for new developers, codebase structure explanation, key concepts and domain knowledge, where to find things (code map), local development workflow, testing strategy, code review process, common tasks with examples, and team conventions.",
  },
};
