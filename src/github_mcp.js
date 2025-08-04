import { GoogleGenerativeAI } from '@google/generative-ai';

class GitHubMCP {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
    this.githubToken = process.env.GITHUB_TOKEN;
    this.githubApiBase = 'https://api.github.com';
  }

  async fetchPullRequest(owner, repo, prNumber) {
    try {
      const headers = {
        'Authorization': `token ${this.githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'GitHub-MCP'
      };

      // Fetch PR details
      const prResponse = await fetch(`${this.githubApiBase}/repos/${owner}/${repo}/pulls/${prNumber}`, {
        headers
      });
      
      if (!prResponse.ok) {
        throw new Error(`Failed to fetch PR: ${prResponse.statusText}`);
      }
      
      const prData = await prResponse.json();

      // Fetch PR files (changes)
      const filesResponse = await fetch(`${this.githubApiBase}/repos/${owner}/${repo}/pulls/${prNumber}/files`, {
        headers
      });
      
      if (!filesResponse.ok) {
        throw new Error(`Failed to fetch PR files: ${filesResponse.statusText}`);
      }
      
      const filesData = await filesResponse.json();

      // Fetch PR comments
      const commentsResponse = await fetch(`${this.githubApiBase}/repos/${owner}/${repo}/pulls/${prNumber}/comments`, {
        headers
      });
      
      if (!commentsResponse.ok) {
        throw new Error(`Failed to fetch PR comments: ${commentsResponse.statusText}`);
      }
      
      const commentsData = await commentsResponse.json();

      return {
        pr: prData,
        files: filesData,
        comments: commentsData
      };
    } catch (error) {
      console.error('Error fetching GitHub PR:', error);
      throw error;
    }
  }

  async processGitHubPR(owner, repo, prNumber) {
    try {
      console.log(`Fetching GitHub PR: ${owner}/${repo}#${prNumber}`);
      
      // Fetch all PR data
      const { pr, files, comments } = await this.fetchPullRequest(owner, repo, prNumber);
      
      return {
        success: true,
        prNumber,
        repository: `${owner}/${repo}`,
        metadata: {
          title: pr.title,
          author: pr.user.login,
          state: pr.state,
          filesChanged: files.length,
          commentsCount: comments.length,
          additions: files.reduce((sum, file) => sum + file.additions, 0),
          deletions: files.reduce((sum, file) => sum + file.deletions, 0)
        },
        // Raw data for combined analysis
        rawData: {
          pr,
          files,
          comments
        }
      };
    } catch (error) {
      console.error('Error processing GitHub PR:', error);
      return {
        success: false,
        error: error.message,
        prNumber,
        repository: `${owner}/${repo}`
      };
    }
  }
}

export default GitHubMCP; 