import { GoogleGenerativeAI } from '@google/generative-ai';

class JiraMCP {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
  }

  async createJiraSummary(jiraRequirements) {
    try {
      const { title, description, acceptanceCriteria } = jiraRequirements;
      const summaryPrompt = `
        Create a concise summary of this Jira requirement (max 100 words):
        
        Title: ${title}
        Description: ${description || 'No description provided'}
        Acceptance Criteria: ${acceptanceCriteria || 'No acceptance criteria provided'}
        
        Provide:
        1. Brief summary of the requirement
        2. Key deliverables
        3. Success criteria
      `;

      const result = await this.model.generateContent(summaryPrompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error creating Jira summary:', error);
      throw error;
    }
  }

  async processJiraRequirements(jiraRequirements) {
    try {
      console.log(`Processing Jira requirements: ${jiraRequirements.title}`);
      
      // Create descriptive summary
      const summary = await this.createJiraSummary(jiraRequirements);
      
      return {
        success: true,
        summary,
        metadata: {
          title: jiraRequirements.title,
          hasDescription: !!jiraRequirements.description,
          hasAcceptanceCriteria: !!jiraRequirements.acceptanceCriteria
        }
      };
    } catch (error) {
      console.error('Error processing Jira requirements:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async createCombinedSummary(jiraRequirements, githubPRData) {
    try {
      const combinedPrompt = `
        Create a concise analysis connecting the Jira requirement with the GitHub PR. STRICTLY limit to 250 tokens maximum:
        
        JIRA REQUIREMENT:
        Title: ${jiraRequirements.title}
        Description: ${jiraRequirements.description || 'No description'}
        Acceptance Criteria: ${jiraRequirements.acceptanceCriteria || 'No criteria'}
        
        GITHUB PR:
        Repository: ${githubPRData.repository}
        PR Number: ${githubPRData.prNumber}
        Title: ${githubPRData.metadata.title}
        Author: ${githubPRData.metadata.author}
        Files Changed: ${githubPRData.metadata.filesChanged}
        Changes: +${githubPRData.metadata.additions} -${githubPRData.metadata.deletions}
        
        Provide a BRIEF analysis (max 250 tokens) covering:
        1. Implementation alignment with requirements
        2. Key gaps or missing elements
        3. Risk level
        4. Recommendation (approve/reject/needs changes)
        5. Please add one summary for every file that is changed in the PR.
        
        Keep response under 650 tokens. Be concise and direct.
      `;

      const result = await this.model.generateContent(combinedPrompt);
      const response = await result.response;
      const summary = response.text();
      
      // Additional check to ensure token limit
      const tokenCount = summary.split(/\s+/).length;
      if (tokenCount > 250) {
        return summary.split(/\s+/).slice(0, 250).join(' ') + '...';
      }
      
      return summary;
    } catch (error) {
      console.error('Error creating combined summary:', error);
      throw error;
    }
  }
}

export default JiraMCP; 