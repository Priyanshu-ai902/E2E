export type RepositoryVisibility = 'public' | 'private';

export interface GitHubRepository {
  id: string;
  name: string;
  owner: {
    login: string;
    avatarUrl: string;
  };
  description: string | null;
  visibility: RepositoryVisibility;
  defaultBranch: string;
  language: string | null;
  stars: number;
  pullRequestCount: number;
  lastUpdated: string;
  url: string;
}

export interface RepositoryListResponse {
  repositories: GitHubRepository[];
  totalCount: number;
}
