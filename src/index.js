import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import GitHubMCP from './github_mcp.js';
import JiraMCP from './jira_mcp.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const port = 3000;

app.use(express.json());

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

// Initialize MCP instances
const githubMCP = new GitHubMCP();
const jiraMCP = new JiraMCP();

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Test Gemini API connection
    const result = await model.generateContent('Hello');
    const response = await result.response;
    res.json({ status: 'healthy', model: 'gemini-pro' });
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', error: error.message });
  }
});

const router = express.Router();

// Basic query endpoint
router.post('/ask-query', async (req, res) => {
  const { query } = req.body;
  try {
    const result = await model.generateContent(query);
    const response = await result.response;
    res.json({ reply: response.text() });
  } catch (error) {
    res.status(500).send({ error: 'Error interacting with Gemini model' });
  }
});

// GitHub PR analysis endpoint
router.post('/analyze-github-pr', async (req, res) => {
  const { owner, repo, prNumber } = req.body;
  
  if (!owner || !repo || !prNumber) {
    return res.status(400).json({ 
      error: 'Missing required parameters: owner, repo, prNumber' 
    });
  }

  try {
    const result = await githubMCP.processGitHubPR(owner, repo, prNumber);
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      error: 'Error analyzing GitHub PR', 
      details: error.message 
    });
  }
});

// Jira requirements analysis endpoint
router.post('/analyze-jira-requirements', async (req, res) => {
  const { title, description, acceptanceCriteria } = req.body;
  
  if (!title) {
    return res.status(400).json({ 
      error: 'Missing required parameter: title' 
    });
  }

  try {
    const jiraRequirements = { title, description, acceptanceCriteria };
    const result = await jiraMCP.processJiraRequirements(jiraRequirements);
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      error: 'Error analyzing Jira requirements', 
      details: error.message 
    });
  }
});

// Combined analysis endpoint
router.post('/analyze-combined', async (req, res) => {
  const { jiraRequirements, githubOwner, githubRepo, githubPRNumber } = req.body;
  
  if (!jiraRequirements || !jiraRequirements.title || !githubOwner || !githubRepo || !githubPRNumber) {
    return res.status(400).json({ 
      error: 'Missing required parameters: jiraRequirements (with title), githubOwner, githubRepo, githubPRNumber' 
    });
  }

  try {
    // Process Jira requirements
    // const jiraResult = await jiraMCP.processJiraRequirements(jiraRequirements);
    const githubResult = await githubMCP.processGitHubPR(githubOwner, githubRepo, githubPRNumber);

    if (!githubResult.success) {
      return res.status(500).json({
        error: 'Failed to process data',
        githubError: githubResult.error
      });
    }

    // Create combined summary
    const combinedSummary = await jiraMCP.createCombinedSummary(jiraRequirements, githubResult);

    res.json({
      success: true,
      jiraRequirements,
      githubPR: githubResult,
      combinedSummary
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Error creating combined analysis', 
      details: error.message 
    });
  }
});

app.use('/api', router);

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

// async function chatWithGemini() {
//   console.log('Chatting with Gemini...');
//   try {
//     const result = await model.generateContent('What is the meaning of life?');
//     const response = await result.response;
//     console.log(response.text());
//   } catch (error) {
//     console.error('Error interacting with Gemini:', error);
//   }
// }

// chatWithGemini();