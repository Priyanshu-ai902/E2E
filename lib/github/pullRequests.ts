import { getOctokit } from './octokit';
import { GitHubPR } from '@/types/github';
import { fetchPRFiles } from './diffs';

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

  console.log(`[GITHUB_SERVICE] number of PRs returned: ${data.length}`);
  if (data.length > 0) {
    console.log(`[GITHUB_SERVICE] first PR: #${data[0].number} - ${data[0].title}`);
  }

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

export async function fetchPullRequestFiles(
  accessToken: string,
  owner: string,
  repo: string,
  pullNumber: number
) {
  return fetchPRFiles(accessToken, owner, repo, pullNumber);
}

