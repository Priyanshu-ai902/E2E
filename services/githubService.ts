import { GitHubRepository } from '@/types/repository';

const MOCK_REPOS: GitHubRepository[] = [
  {
    id: 'repo_1',
    name: 'ai-code-reviewer',
    owner: {
      login: 'agent-labs',
      avatarUrl: 'https://github.com/identicons/agent.png',
    },
    description: 'Automated AI code review agent for GitHub PRs',
    visibility: 'public',
    defaultBranch: 'main',
    language: 'TypeScript',
    stars: 1250,
    pullRequestCount: 12,
    lastUpdated: '2024-05-10T14:30:00Z',
    url: 'https://github.com/agent-labs/ai-code-reviewer',
  },
  {
    id: 'repo_2',
    name: 'saas-dashboard-template',
    owner: {
      login: 'agent-labs',
      avatarUrl: 'https://github.com/identicons/agent.png',
    },
    description: 'A modern SaaS dashboard template built with Next.js and TailwindCSS',
    visibility: 'private',
    defaultBranch: 'develop',
    language: 'TypeScript',
    stars: 450,
    pullRequestCount: 5,
    lastUpdated: '2024-05-09T10:15:00Z',
    url: 'https://github.com/agent-labs/saas-dashboard-template',
  },
  {
    id: 'repo_3',
    name: 'react-agent-ui',
    owner: {
      login: 'agent-labs',
      avatarUrl: 'https://github.com/identicons/agent.png',
    },
    description: 'Agentic UI components for React applications',
    visibility: 'public',
    defaultBranch: 'main',
    language: 'TypeScript',
    stars: 890,
    pullRequestCount: 8,
    lastUpdated: '2024-05-11T09:00:00Z',
    url: 'https://github.com/agent-labs/react-agent-ui',
  },
];

export const githubService = {
  /**
   * Fetches repositories for the authenticated user
   * Initially returns mock data
   */
  async getRepositories(): Promise<GitHubRepository[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...MOCK_REPOS]);
      }, 1000); // Simulate network delay
    });
  },

  /**
   * Fetches a single repository by ID
   */
  async getRepository(id: string): Promise<GitHubRepository | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const repo = MOCK_REPOS.find((r) => r.id === id);
        resolve(repo ? { ...repo } : null);
      }, 500);
    });
  },

  /**
   * Placeholder for real GitHub API authenticated fetch
   */
  async authenticatedFetch(endpoint: string, session: any) {
    // This will be implemented when we connect live GitHub API
    console.log(`Fetching ${endpoint} with session token...`);
    return null;
  },
};
