import { Octokit } from "@octokit/rest";
import { NextResponse } from "next/server";

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    //edge case: basic url validation
    if (!url || !url.includes("github.com/")) {
      return NextResponse.json({ error: "Invalid GitHub URL" }, { status: 400 });
    }

    const path = url.replace("https://github.com/", "").replace(/\/$/, "");
    const [owner, repo] = path.split("/");

    if (!owner || !repo) {
      return NextResponse.json({ error: "Could not parse owner/repo" }, { status: 400 });
    }

    //fetching data from github
    const [{ data: repoData }, { data: languages }] = await Promise.all([
      octokit.repos.get({ owner, repo }),
      octokit.repos.listLanguages({ owner, repo }),
    ]);

    // Activity Score (A)
    // formula: (Stars * 0.1) + (Forks * 0.2) + (Open Issues * 0.5)
    // weigh issues higher because they represent current community engagement
    const activityScore = (
      repoData.stargazers_count * 0.1 +
      repoData.forks_count * 0.2 +
      repoData.open_issues_count * 0.5
    ).toFixed(2);

    // Complexity Estimation (C)
    // formula: (Size / 1000) + (Language Count * 10)
    const langCount = Object.keys(languages).length;
    const complexityScore = (repoData.size / 1000 + langCount * 10).toFixed(2);

    // Difficulty Classification
    // Logic: Points based on size, variety of languages, and popularity
    let difficulty = "Beginner";
    const difficultyPoints = 
      (repoData.size > 50000 ? 2 : 0) + 
      (langCount > 3 ? 2 : 0) + 
      (repoData.forks_count > 500 ? 1 : 0);

    if (difficultyPoints >= 4) difficulty = "Advanced";
    else if (difficultyPoints >= 2) difficulty = "Intermediate";

    return NextResponse.json({
      name: repoData.name,
      description: repoData.description,
      stars: repoData.stargazers_count,
      forks: repoData.forks_count,
      issues: repoData.open_issues_count,
      languages: Object.keys(languages).slice(0, 3), // Top 3 languages
      activityScore,
      complexityScore,
      difficulty,
    });

  } catch (error: any) {
    console.error(error);
    if (error.status === 404) return NextResponse.json({ error: "Repo not found. Please try again." }, { status: 404 });
    return NextResponse.json({ error: "Analysis failed. Please try again." }, { status: 500 });
  }
}