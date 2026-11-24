export interface RepoBookmark {
  id: string;                         // Unique ID (e.g. "facebook-react" or uuid)
  owner: string;                      // Repo owner (e.g. "facebook")
  name: string;                       // Repo name (e.g. "react")
  fullName: string;                   // "owner/name"
  url: string;                        // GitHub URL
  description: string;                // Repository description
  stars: number;                      // Star count
  forks: number;                      // Fork count
  openIssues?: number;                // Open issues count
  language: string;                   // Primary language (e.g. "TypeScript", "Python")
  languageColor?: string;             // Color badge for language
  license?: string;                   // License name (e.g. "MIT License", "Apache-2.0")
  topics: string[];                   // GitHub topics
  avatarUrl: string;                  // Owner avatar
  defaultBranch: string;              // "main" or "master"
  createdAt: string;                  // Created date
  updatedAt: string;                  // Last commit / update date
  latestRelease?: {
    tag: string;
    publishedAt: string;
    url: string;
  };
  
  // GitList Custom CMS Fields:
  directoryId: string;                // Parent directory ID (e.g. "frontend-frameworks")
  categoryId: string;                 // Top-level Category ID (e.g. "web-development")
  tags: string[];                     // Custom tags (e.g. ["#react", "#ui", "#production"])
  notes?: string;                     // Personal Markdown notes & impressions
  rating: number;                     // 1 to 5 star personal rating
  status: 'bookmarked' | 'evaluating' | 'production' | 'archived'; // Workflow status
  customLinks?: { label: string; url: string }[];
  addedAt: string;                    // Date added to GitList
  pinned?: boolean;                   // Pinned to top of category/list
}

export interface Directory {
  id: string;                         // Directory ID (slug)
  name: string;                       // Display name (e.g. "Agent Frameworks")
  slug: string;
  description?: string;
  icon?: string;                      // Lucide icon name or emoji
  categoryId: string;                 // Parent category ID
  parentId?: string;                  // Optional parent directory for nesting
  order: number;
}

export interface Category {
  id: string;                         // Category ID (slug)
  name: string;                       // Display name (e.g. "Artificial Intelligence & ML")
  slug: string;
  description?: string;
  icon: string;                       // Icon name
  color: string;                      // Accent color (e.g. "emerald", "blue", "purple")
  order: number;
}

export interface Tag {
  id: string;
  name: string;                       // e.g. "llm", "cli", "backend", "fast"
  color: string;                      // Hex or tailwind color class
  description?: string;
}

export interface GitListConfig {
  siteTitle: string;
  siteDescription: string;
  authorName: string;
  authorGithub: string;
  authorTwitter?: string;
  authorWebsite?: string;
  githubRepo: string;                 // e.g. "username/gitlist"
  githubBranch: string;               // e.g. "main"
  dataFile: string;                   // Path in repo: "data/gitlist.json"
  autoSyncWithStars: boolean;
  theme: 'dark' | 'light' | 'system';
}

export interface GitListData {
  version: string;
  lastUpdated: string;
  config: GitListConfig;
  categories: Category[];
  directories: Directory[];
  tags: Tag[];
  repos: RepoBookmark[];
}

export interface GitHubApiResponse {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    avatar_url: string;
    html_url: string;
  };
  html_url: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string | null;
  license: {
    key: string;
    name: string;
    spdx_id: string;
  } | null;
  topics: string[];
  default_branch: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
}
