import { getOctokit } from './octokit';
import { GitHubPR } from '@/types/github';

export const fetchPullRequests = async (
  accessToken: string,
  owner: string,
  repo: string
): Promise<GitHubPR[]> => {
  const octokit = getOctokit(accessToken);
  const { data } = await octokit.pulls.list({
    owner,
    repo,
    state: 'open',
    sort: 'updated',
    direction: 'desc',
    per_page: 50,
  });

  return data as GitHubPR[];
};

export const fetchPullRequest = async (
  accessToken: string,
  owner: string,
  repo: string,
  pullNumber: number
) => {
  const octokit = getOctokit(accessToken);
  const { data } = await octokit.pulls.get({
    owner,
    repo,
    pull_number: pullNumber,
  });

  return data;
};

