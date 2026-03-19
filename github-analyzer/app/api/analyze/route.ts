import { Octokit } from "@octokit/rest";
import { NextResponse } from "next/server";

// initializes octokit with secret token
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    // edge case handling: URL validation
    if (!url || !url.includes("github.com/")) {
      return NextResponse.json({ error: "Invalid GitHub URL" }, { status: 400 });
    }

    // parses owner and repo from various URL formats
    const path = url.replace("https://github.com/", "").replace(/\/$/, "");
    const [owner, repo] = path.split("/");

    if (!owner || !repo) {
      return NextResponse.json({ error: "Could not parse owner/repo from URL" }, { status: 400 });
    }

    // fetches general repo info
    // promise.all runs these requests in parallel to save time
    const [{ data: repoData }, { data: languages }] = await Promise.all([
      octokit.repos.get({ owner, repo }),
      octokit.repos.listLanguages({ owner, repo }),
    ]);

    // custom activity score formula
    // formula: (stars * 0.1) + (forks * 0.2) + (open issues * 0.5)
    // higher weigh for open issues, often indicates higher immediate engagement/maintenance needs
    const activityScore = (
      repoData.stargazers_count * 0.1 +
      repoData.forks_count * 0.2 +
      repoData.open_issues_count * 0.5
    ).toFixed(2);

    // complexity formula
    // combined file size (converted from KB to MB) + diversity of languages used
    const langList = Object.keys(languages);
    const complexityScore = (repoData.size / 1024 + langList.length * 15).toFixed(2);

    // learning difficulty classification
    // point-based heuristic system
    let difficulty = "Beginner";
    const difficultyPoints = 
      (repoData.size > 50000 ? 2 : 0) + // large codebase
      (langList.length > 3 ? 2 : 0) +  // multiple languages used in codebase
      (repoData.forks_count > 1000 ? 1 : 0); // high community volume

    if (difficultyPoints >= 4) difficulty = "Advanced";
    else if (difficultyPoints >= 2) difficulty = "Intermediate";

    // structured output for intelligence insights
    // evaluates ratios and booleans to generate insights
    const insights = [];
    if (repoData.stargazers_count > 50 && (repoData.forks_count / repoData.stargazers_count > 0.4)) insights.push("Exceptional contribution interest relative to reach.");
    if (langList.length > 4) insights.push("High tech-stack diversity; requires broad domain knowledge.");
    if (repoData.open_issues_count > 1000) insights.push("Significant maintenance backlog; active but heavy overhead.");
    if (repoData.forks_count > repoData.stargazers_count * 0.4) insights.push("Exceptional contribution interest relative to reach.");
    if (repoData.has_wiki === false) insights.push("Limited internal documentation; may rely on external docs.");
    
    if (insights.length === 0) insights.push("Stable, focused repository with standard maintenance.");

    // return structured report via JSON
    return NextResponse.json({
      name: repoData.name,
      description: repoData.description,
      stars: repoData.stargazers_count,
      forks: repoData.forks_count,
      issues: repoData.open_issues_count,
      subscribers: repoData.subscribers_count,
      watchers: repoData.subscribers_count,
      size: (repoData.size / 1024).toFixed(2), // KB to MB
      languages: langList.slice(0, 3), // Top 3 languages
      activityScore,
      complexityScore,
      difficulty,
      insights,
    });

  } catch (error: any) {
    console.error("API Error:", error);
    // edge case handling for missing or private repos
    if (error.status === 404) {
      return NextResponse.json({ error: "Repository not found or private." }, { status: 404 });
    }
    return NextResponse.json({ error: "GitHub API failed to respond." }, { status: 500 });
  }
}