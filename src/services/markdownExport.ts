import { GitListData } from '../types';

/**
 * Generates a clean Markdown document from the curated repositories,
 * categories, and directories.
 */
export function generateAwesomeMarkdown(data: GitListData): string {
  const { config, categories, directories, repos } = data;
  const now = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  let md = `# ${config.siteTitle}\n\n`;
  md += `> ${config.siteDescription}\n\n`;
  md += `Maintained with [GitList](https://github.com/${config.githubRepo}).  \n`;
  md += `Last updated: ${now}. Total repositories: ${repos.length}.\n\n`;

  // Table of Contents
  md += `## Table of contents\n\n`;
  categories.forEach((cat) => {
    md += `- [${cat.name}](#${slugify(cat.name)})\n`;
    const catDirs = directories.filter((d) => d.categoryId === cat.id);
    catDirs.forEach((dir) => {
      md += `  - [${dir.name}](#${slugify(dir.name)})\n`;
    });
  });
  md += `\n---\n\n`;

  // Content Sections
  categories.forEach((cat) => {
    md += `## ${cat.name}\n\n`;
    if (cat.description) {
      md += `_${cat.description}_\n\n`;
    }

    const catDirs = directories.filter((d) => d.categoryId === cat.id);
    if (catDirs.length === 0) {
      const directRepos = repos.filter((r) => r.categoryId === cat.id);
      md += renderRepoList(directRepos);
    } else {
      catDirs.forEach((dir) => {
        md += `### ${dir.name}\n\n`;
        if (dir.description) {
          md += `> ${dir.description}\n\n`;
        }
        const dirRepos = repos.filter((r) => r.directoryId === dir.id);
        md += renderRepoList(dirRepos);
      });
    }

    md += `\n`;
  });

  md += `---\n\n`;
  md += `## About GitList\n\n`;
  md += `Generated using GitList. Repositories, directories, and tags are stored in \`${config.dataFile}\`.\n`;

  return md;
}

function renderRepoList(repos: any[]): string {
  if (repos.length === 0) {
    return `_No repositories in this section._\n\n`;
  }

  let text = '';
  repos.forEach((repo) => {
    const starStr = repo.stars >= 1000 ? `${(repo.stars / 1000).toFixed(1)}k` : `${repo.stars}`;
    const tagBadges = (repo.tags || [])
      .map((t: string) => `\`#${t}\``)
      .join(' ');

    text += `- [${repo.fullName}](${repo.url}) (${starStr} stars) - ${repo.description}\n`;
    if (repo.notes) {
      text += `  - Note: ${repo.notes}\n`;
    }
    if (tagBadges) {
      text += `  - Tags: ${tagBadges} | Language: ${repo.language}`;
      if (repo.status && repo.status !== 'bookmarked') {
        text += ` | Status: ${repo.status}`;
      }
      text += `\n`;
    }
    text += `\n`;
  });

  return text;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
