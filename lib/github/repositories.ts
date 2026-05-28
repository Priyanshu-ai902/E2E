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
