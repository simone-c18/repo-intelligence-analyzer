import { Octokit } from "@octokit/rest";
import { NextResponse } from "next/server";

//using secret token 
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

//fetching data from github API using octokit
//calculating score, and sending final output to user
export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    
    // 1. Extracts owner and repo from the URL (e.g., https://github.com/facebook/react)
    const urlParts = url.replace("https://github.com/", "").split("/");
    const owner = urlParts[0];
    const repo = urlParts[1];

    // 2. Fetch the data using Octokit
    const { data } = await octokit.repos.get({
      owner,
      repo,
    });

    // 3. Formula to calculate repo's score
    const activityScore = (data.stargazers_count * 0.1) + (data.forks_count * 0.2);
    
    let difficulty = "Beginner";
    if (data.size > 50000 || data.forks_count > 1000) difficulty = "Advanced";
    else if (data.size > 10000) difficulty = "Intermediate";

    // 4. Send the insights back to your frontend
    return NextResponse.json({
      name: data.name,
      description: data.description,
      stars: data.stargazers_count,
      forks: data.forks_count,
      activityScore: activityScore.toFixed(2),
      difficulty: difficulty,
      language: data.language
    });

  } catch (error) {
    return NextResponse.json({ error: "Failed to analyze repository" }, { status: 500 });
  }
}