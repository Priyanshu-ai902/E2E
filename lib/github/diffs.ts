import { getOctokit } from './octokit';
import { isFileExcluded } from './filters';

export interface PRFileDiff {
  filename: string;
  patch: string;
  status: string;
}

export const fetchPRFiles = async (
  accessToken: string,
  owner: string,
  repo: string,
  pullNumber: number
): Promise<PRFileDiff[]> => {
  const octokit = getOctokit(accessToken);
  
  const { data: files } = await octokit.pulls.listFiles({
    owner,
    repo,
    pull_number: pullNumber,
    per_page: 100,
  });

  return files
    .filter((file) => !isFileExcluded(file.filename) && !!file.patch)
    .map(file => ({
      filename: file.filename,
      patch: file.patch!,
      status: file.status,
    }));
};

export const fetchPRDiff = async (
  accessToken: string,
  owner: string,
  repo: string,
  pullNumber: number
): Promise<string> => {
  const files = await fetchPRFiles(accessToken, owner, repo, pullNumber);

  return files
    .map((file) => `File: ${file.filename}\n${file.patch}`)
    .join('\n\n');
};
