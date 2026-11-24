import { GitListData } from '../types';
import { INITIAL_GITLIST_DATA } from '../data/defaultData';

const STORAGE_KEY = 'gitlist_data_v1';
const TOKEN_KEY = 'gitlist_github_token';

/**
 * GitStorage manages both local browser state and Direct Git commits to GitHub repository.
 * Zero-database architecture: The GitHub repository IS the database!
 */
export class GitStorageService {
  /**
   * Load GitList data: checks localStorage first, falls back to default seed data
   */
  static loadData(): GitListData {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.repos && parsed.categories) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading from localStorage, using initial data:', e);
    }
    return INITIAL_GITLIST_DATA;
  }

  /**
   * Save GitList data to localStorage
   */
  static saveDataLocally(data: GitListData): void {
    data.lastUpdated = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data, null, 2));
  }

  /**
   * GitHub Personal Access Token management (stored securely in browser localStorage)
   */
  static getGitHubToken(): string {
    return localStorage.getItem(TOKEN_KEY) || '';
  }

  static setGitHubToken(token: string): void {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token.trim());
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }

  /**
   * Commit data directly to the user's GitHub repository via GitHub REST Contents API
   * PUT /repos/{owner}/{repo}/contents/{path}
   */
  static async commitToGitHub(
    data: GitListData,
    commitMessage: string = 'chore(gitlist): update repository bookmarks and categories'
  ): Promise<{ success: boolean; commitUrl?: string; message: string }> {
    const token = this.getGitHubToken();
    if (!token) {
      throw new Error('GitHub Personal Access Token is required to commit to repository. Please set your token in Settings.');
    }

    const repoPath = data.config.githubRepo; // e.g. "username/gitlist"
    const [owner, repo] = repoPath.split('/');
    if (!owner || !repo) {
      throw new Error(`Invalid GitHub repository "${repoPath}". Please format as "owner/repository".`);
    }

    const filePath = data.config.dataFile || 'data/gitlist.json';
    const branch = data.config.githubBranch || 'main';

    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
    const headers: Record<string, string> = {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    };

    // 1. Fetch current file SHA if it already exists
    let sha: string | undefined;
    try {
      const getFileRes = await fetch(`${apiUrl}?ref=${branch}`, { headers });
      if (getFileRes.ok) {
        const fileInfo = await getFileRes.json();
        sha = fileInfo.sha;
      }
    } catch {
      // file might not exist yet, which is fine
    }

    // 2. Prepare payload
    data.lastUpdated = new Date().toISOString();
    const contentString = JSON.stringify(data, null, 2);
    // Base64 encode for GitHub API (handles Unicode properly)
    const base64Content = btoa(unescape(encodeURIComponent(contentString)));

    const body: Record<string, any> = {
      message: commitMessage,
      content: base64Content,
      branch: branch,
    };
    if (sha) {
      body.sha = sha;
    }

    // 3. Commit to GitHub
    const putRes = await fetch(apiUrl, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    });

    if (!putRes.ok) {
      const err = await putRes.json();
      throw new Error(err.message || `Failed to commit to GitHub (${putRes.status})`);
    }

    const result = await putRes.json();
    const commitUrl = result.commit?.html_url || `https://github.com/${owner}/${repo}/commits/${branch}`;

    // Also update local storage cache
    this.saveDataLocally(data);

    return {
      success: true,
      commitUrl,
      message: `Successfully committed ${data.repos.length} repos to ${repoPath} on branch ${branch}!`,
    };
  }

  /**
   * Export GitList database as a downloadable JSON file
   */
  static exportJson(data: GitListData): void {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gitlist-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Import GitList database from a JSON file
   */
  static async importJson(file: File): Promise<GitListData> {
    const text = await file.text();
    const parsed = JSON.parse(text);
    if (!parsed.repos || !parsed.categories) {
      throw new Error('Invalid GitList JSON structure. Missing repos or categories.');
    }
    this.saveDataLocally(parsed);
    return parsed;
  }
}
