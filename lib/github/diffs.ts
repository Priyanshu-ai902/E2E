import { getOctokit } from './octokit';
import { isFileExcluded } from './filters';

export const fetchPRDiff = async (
  accessToken: string,
  owner: string,
  repo: string,
  pullNumber: number
): Promise<string> => {
  const octokit = getOctokit(accessToken);
  
  // Use the Files API to get individual patches
  const { data: files } = await octokit.pulls.listFiles({
    owner,
    repo,
    pull_number: pullNumber,
    per_page: 100, // Limit to 100 files for now
  });

  const filteredFiles = files.filter((file) => {
    return !isFileExcluded(file.filename) && !!file.patch;
  });

  // Combine patches into a single string, with headers
  const fullDiff = filteredFiles
    .map((file) => `File: ${file.filename}\n${file.patch}`)
    .join('\n\n');

  return fullDiff;
};
