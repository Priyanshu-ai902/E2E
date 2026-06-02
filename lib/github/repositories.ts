import { getOctokit } from './octokit';
import { GitHubRepo } from '@/types/github';

export const fetchUserRepos = async (accessToken: string): Promise<GitHubRepo[]> => {
  const octokit = getOctokit(accessToken);
  const { data } = await octokit.repos.listForAuthenticatedUser({
    sort: 'updated',
    per_page: 100,
  });
  
  return data as GitHubRepo[];
};

export const fetchFileContent = async (
  accessToken: string,
  owner: string,
  repo: string,
  path: string,
  ref: string
): Promise<string> => {
  const octokit = getOctokit(accessToken);
  try {
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path,
      ref,
    });
    
    if (Array.isArray(data)) return '';
    
    if ('content' in data && data.content) {
      return Buffer.from(data.content, 'base64').toString();
    }
    return '';
  } catch (error) {
    console.error(`Error fetching file content for ${path}:`, error);
    return '';
  }
};
