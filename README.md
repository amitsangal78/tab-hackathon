# Practice AI - GitHub & Jira MCP Integration

This project provides Model Context Protocol (MCP) integration for GitHub and Jira requirements, allowing you to analyze pull requests against manual Jira requirements and create concise summaries using Google's Gemini AI.

## Features

- **GitHub PR Analysis**: Fetch pull request data and create comprehensive summaries
- **Jira Requirements Analysis**: Process manual Jira requirements (title, description, acceptance criteria)
- **Combined Analysis**: Connect Jira requirements with related GitHub PRs for concise workflow analysis
- **AI-Powered Summaries**: Uses Google Gemini AI to generate intelligent summaries (max 250 tokens for combined analysis)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Copy the example environment file and configure your API keys:

```bash
cp env.example .env
```

Fill in the required environment variables:

- `GEMINI_API_KEY`: Your Google Gemini API key
- `GITHUB_TOKEN`: Your GitHub Personal Access Token

### 3. Start the Server

```bash
npm start
```

The server will run on `http://localhost:3000`

## API Endpoints

### Health Check
```
GET /health
```
Check if the server and Gemini AI are working properly.

### Basic Query
```
POST /api/ask-query
Content-Type: application/json

{
  "query": "Your question here"
}
```

### GitHub PR Analysis
```
POST /api/analyze-github-pr
Content-Type: application/json

{
  "owner": "repository-owner",
  "repo": "repository-name",
  "prNumber": 123
}
```

**Response:**
```json
{
  "success": true,
  "prNumber": 123,
  "repository": "owner/repo",
  "summary": "AI-generated summary of the PR...",
  "metadata": {
    "title": "PR Title",
    "author": "username",
    "state": "open",
    "filesChanged": 5,
    "commentsCount": 3,
    "additions": 150,
    "deletions": 25
  }
}
```

### Jira Requirements Analysis
```
POST /api/analyze-jira-requirements
Content-Type: application/json

{
  "title": "Feature Title",
  "description": "Detailed description of the feature",
  "acceptanceCriteria": "List of acceptance criteria"
}
```

**Response:**
```json
{
  "success": true,
  "summary": "AI-generated summary of the requirements...",
  "metadata": {
    "title": "Feature Title",
    "hasDescription": true,
    "hasAcceptanceCriteria": true
  }
}
```

### Combined Analysis
```
POST /api/analyze-combined
Content-Type: application/json

{
  "jiraRequirements": {
    "title": "Feature Title",
    "description": "Detailed description",
    "acceptanceCriteria": "Acceptance criteria"
  },
  "githubOwner": "repository-owner",
  "githubRepo": "repository-name",
  "githubPRNumber": 123
}
```

**Response:**
```json
{
  "success": true,
  "jiraRequirements": { /* Jira analysis result */ },
  "githubPR": { /* GitHub analysis result */ },
  "combinedSummary": "Concise analysis (max 250 tokens) connecting requirements with PR implementation..."
}
```

## MCP Files

### github_mcp.js
- Fetches PR details, files changed, and comments
- Creates comprehensive summaries using Gemini AI
- Provides metadata about the PR

### jira_mcp.js
- Processes manual Jira requirements (title, description, acceptance criteria)
- Creates concise summaries using Gemini AI
- Can create combined summaries linking requirements with PRs (max 250 tokens)

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200`: Success
- `400`: Bad Request (missing parameters)
- `500`: Internal Server Error

Error responses include:
```json
{
  "error": "Error description",
  "details": "Additional error details"
}
```

## Example Usage

### Using curl

```bash
# Analyze a GitHub PR
curl -X POST http://localhost:3000/api/analyze-github-pr \
  -H "Content-Type: application/json" \
  -d '{
    "owner": "facebook",
    "repo": "react",
    "prNumber": 12345
  }'

# Analyze Jira requirements
curl -X POST http://localhost:3000/api/analyze-jira-requirements \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Add user authentication",
    "description": "Implement user login and registration functionality",
    "acceptanceCriteria": "1. Users can register\n2. Users can login\n3. Session management works"
  }'

# Combined analysis
curl -X POST http://localhost:3000/api/analyze-combined \
  -H "Content-Type: application/json" \
  -d '{
    "jiraRequirements": {
      "title": "Add user authentication",
      "description": "Implement user login and registration functionality",
      "acceptanceCriteria": "1. Users can register\n2. Users can login\n3. Session management works"
    },
    "githubOwner": "facebook",
    "githubRepo": "react",
    "githubPRNumber": 12345
  }'
```

## Requirements

- Node.js 16+
- Valid API keys for Gemini and GitHub
- Network access to GitHub API

## Troubleshooting

1. **Gemini API Error**: Check your `GEMINI_API_KEY` is valid
2. **GitHub API Error**: Ensure your `GITHUB_TOKEN` has appropriate permissions
3. **Network Issues**: Check your internet connection and firewall settings 