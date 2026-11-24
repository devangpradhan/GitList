import { GitHubApiResponse, RepoBookmark } from '../types';
import { LANGUAGE_COLORS } from '../data/defaultData';

export interface RepoParsed {
  owner: string;
  repo: string;
}

/**
 * Parse various GitHub URL or repo formats:
 * - "facebook/react"
 * - "https://github.com/facebook/react"
 * - "https://github.com/facebook/react.git"
 * - "github.com/facebook/react/issues"
 */
export function parseGitHubRepo(input: string): RepoParsed | null {
  const clean = input.trim();
  if (!clean) return null;

  // Pattern 1: owner/repo
  const simpleMatch = clean.match(/^([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)$/);
  if (simpleMatch) {
    return { owner: simpleMatch[1], repo: simpleMatch[2].replace(/\.git$/, '') };
  }

  // Pattern 2: URL
  try {
    const url = clean.startsWith('http') ? clean : `https://${clean}`;
    const parsedUrl = new URL(url);
    if (parsedUrl.hostname.includes('github.com')) {
      const parts = parsedUrl.pathname.split('/').filter(Boolean);
      if (parts.length >= 2) {
        return {
          owner: parts[0],
          repo: parts[1].replace(/\.git$/, '')
        };
      }
    }
  } catch {
    // invalid URL format
  }

  return null;
}

/**
 * Fetch repository details from GitHub REST API
 */
export async function fetchGitHubRepoDetails(
  owner: string,
  repo: string,
  token?: string
): Promise<GitHubApiResponse> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
  };

  if (token) {
    headers.Authorization = `token ${token}`;
  }

  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers,
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Repository "${owner}/${repo}" not found or is private.`);
    }
    if (response.status === 403) {
      throw new Error('GitHub API rate limit exceeded. Please add a GitHub Personal Access Token in Settings.');
    }
    throw new Error(`GitHub API error (${response.status}): ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch latest release of a repository
 */
export async function fetchLatestRelease(
  owner: string,
  repo: string,
  token?: string
): Promise<{ tag: string; publishedAt: string; url: string } | null> {
  try {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
    };
    if (token) headers.Authorization = `token ${token}`;

    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases/latest`, { headers });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      tag: data.tag_name,
      publishedAt: data.published_at,
      url: data.html_url
    };
  } catch {
    return null;
  }
}

/**
 * Fetch all starred repositories of a user
 */
export async function fetchUserStarredRepos(
  username: string,
  page: number = 1,
  perPage: number = 30,
  token?: string
): Promise<GitHubApiResponse[]> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
  };
  if (token) headers.Authorization = `token ${token}`;

  const res = await fetch(
    `https://api.github.com/users/${username}/starred?page=${page}&per_page=${perPage}`,
    { headers }
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch stars for ${username}: ${res.statusText}`);
  }

  return res.json();
}

/**
 * Convert GitHub API response to a GitList RepoBookmark object
 */
export function createBookmarkFromGitHub(
  apiData: GitHubApiResponse,
  categoryId: string,
  directoryId: string,
  customTags: string[] = [],
  notes: string = '',
  rating: number = 5
): RepoBookmark {
  const language = apiData.language || 'Unknown';
  return {
    id: `${apiData.owner.login}-${apiData.name}`.toLowerCase(),
    owner: apiData.owner.login,
    name: apiData.name,
    fullName: apiData.full_name,
    url: apiData.html_url,
    description: apiData.description || 'No description provided.',
    stars: apiData.stargazers_count,
    forks: apiData.forks_count,
    openIssues: apiData.open_issues_count,
    language,
    languageColor: LANGUAGE_COLORS[language] || '#8b949e',
    license: apiData.license ? apiData.license.name : undefined,
    topics: apiData.topics || [],
    avatarUrl: apiData.owner.avatar_url,
    defaultBranch: apiData.default_branch,
    createdAt: apiData.created_at,
    updatedAt: apiData.pushed_at || apiData.updated_at,
    directoryId,
    categoryId,
    tags: Array.from(new Set([...customTags, ...(apiData.topics || []).slice(0, 3)])),
    notes,
    rating,
    status: 'bookmarked',
    addedAt: new Date().toISOString(),
    pinned: false
  };
}
