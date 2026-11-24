import React, { useState } from 'react';
import {
  X,
  Star,
  Loader2,
  Folder,
  Layers,
  AlertCircle,
  CheckSquare,
  Square,
} from 'lucide-react';
import { Category, Directory, GitHubApiResponse, RepoBookmark } from '../../types';
import { fetchUserStarredRepos, createBookmarkFromGitHub } from '../../services/githubApi';
import { GitStorageService } from '../../services/gitStorage';

interface StarImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportBulk: (repos: RepoBookmark[]) => void;
  categories: Category[];
  directories: Directory[];
  existingRepoIds: Set<string>;
}

export const StarImporterModal: React.FC<StarImporterModalProps> = ({
  isOpen,
  onClose,
  onImportBulk,
  categories,
  directories,
  existingRepoIds,
}) => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [starredRepos, setStarredRepos] = useState<GitHubApiResponse[]>([]);
  const [selectedRepoIds, setSelectedRepoIds] = useState<Set<number>>(new Set());

  // Destination
  const [targetCategory, setTargetCategory] = useState(categories[0]?.id || '');
  const [targetDirectory, setTargetDirectory] = useState(directories[0]?.id || '');

  if (!isOpen) return null;

  const handleFetchStars = async () => {
    if (!username.trim()) {
      setError('Enter a GitHub username.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const token = GitStorageService.getGitHubToken();
      const repos = await fetchUserStarredRepos(username.trim(), 1, 50, token);
      setStarredRepos(repos);
      const newIds = new Set<number>();
      repos.forEach((r) => {
        const bookmarkId = `${r.owner.login}-${r.name}`.toLowerCase();
        if (!existingRepoIds.has(bookmarkId)) {
          newIds.add(r.id);
        }
      });
      setSelectedRepoIds(newIds);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch starred repositories.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSelectAll = () => {
    if (selectedRepoIds.size === starredRepos.length) {
      setSelectedRepoIds(new Set());
    } else {
      setSelectedRepoIds(new Set(starredRepos.map((r) => r.id)));
    }
  };

  const handleToggleRepo = (id: number) => {
    const next = new Set(selectedRepoIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedRepoIds(next);
  };

  const handleConfirmImport = () => {
    const toImport = starredRepos.filter((r) => selectedRepoIds.has(r.id));
    const bookmarks = toImport.map((r) =>
      createBookmarkFromGitHub(r, targetCategory, targetDirectory)
    );
    onImportBulk(bookmarks);
    onClose();
  };

  const filteredDirs = directories.filter((d) => d.categoryId === targetCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-750 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-dark-750 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
              Import GitHub stars
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-dark-400">
              Fetch starred repositories from a user profile and save them to a directory
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-dark-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-3.5 text-xs">
          
          <div>
            <label className="block font-medium text-slate-700 dark:text-dark-300 mb-1">
              GitHub username
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="torvalds"
                className="flex-1 px-3 py-1.5 rounded-md bg-slate-100 dark:bg-dark-850 border border-slate-200 dark:border-dark-750 text-slate-900 dark:text-white focus:outline-none font-mono text-xs"
              />
              <button
                type="button"
                onClick={handleFetchStars}
                disabled={loading}
                className="px-3 py-1.5 rounded-md bg-slate-900 text-white dark:bg-dark-100 dark:text-dark-950 font-medium hover:bg-slate-800 dark:hover:bg-white disabled:opacity-50 transition-colors"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Fetch stars'}
              </button>
            </div>
            {error && (
              <div className="flex items-center gap-1.5 text-rose-500 mt-1">
                <AlertCircle className="w-3 h-3" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {starredRepos.length > 0 && (
            <div className="grid grid-cols-2 gap-3 p-3 rounded-md bg-slate-50 dark:bg-dark-850 border border-slate-200 dark:border-dark-750">
              <div>
                <label className="block font-medium text-slate-600 dark:text-dark-400 mb-1 flex items-center gap-1">
                  <Layers className="w-3 h-3" />
                  Target category
                </label>
                <select
                  value={targetCategory}
                  onChange={(e) => {
                    setTargetCategory(e.target.value);
                    const dirs = directories.filter((d) => d.categoryId === e.target.value);
                    setTargetDirectory(dirs[0]?.id || '');
                  }}
                  className="w-full px-2 py-1 rounded bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-750 text-slate-900 dark:text-white"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-600 dark:text-dark-400 mb-1 flex items-center gap-1">
                  <Folder className="w-3 h-3" />
                  Target directory
                </label>
                <select
                  value={targetDirectory}
                  onChange={(e) => setTargetDirectory(e.target.value)}
                  className="w-full px-2 py-1 rounded bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-750 text-slate-900 dark:text-white"
                >
                  {filteredDirs.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {starredRepos.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-[11px] text-slate-500 dark:text-dark-400">
                  {starredRepos.length} repositories ({selectedRepoIds.size} selected)
                </span>
                <button
                  type="button"
                  onClick={handleToggleSelectAll}
                  className="text-[11px] text-blue-500 hover:underline"
                >
                  {selectedRepoIds.size === starredRepos.length ? 'Deselect all' : 'Select all'}
                </button>
              </div>

              <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
                {starredRepos.map((repo) => {
                  const bookmarkId = `${repo.owner.login}-${repo.name}`.toLowerCase();
                  const alreadyImported = existingRepoIds.has(bookmarkId);
                  const isSelected = selectedRepoIds.has(repo.id);

                  return (
                    <div
                      key={repo.id}
                      onClick={() => !alreadyImported && handleToggleRepo(repo.id)}
                      className={`flex items-center justify-between p-2 rounded border text-xs cursor-pointer transition-colors ${
                        alreadyImported
                          ? 'opacity-40 bg-slate-100 dark:bg-dark-900 border-transparent cursor-not-allowed'
                          : isSelected
                          ? 'bg-blue-500/10 border-blue-500/30 text-slate-900 dark:text-white'
                          : 'bg-white dark:bg-dark-850 border-slate-200 dark:border-dark-750 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {isSelected ? (
                          <CheckSquare className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        ) : (
                          <Square className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        )}
                        <img
                          src={repo.owner.avatar_url}
                          alt={repo.owner.login}
                          className="w-5 h-5 rounded object-cover"
                        />
                        <div className="truncate">
                          <span className="font-medium font-mono text-[11px]">{repo.full_name}</span>
                          <p className="text-slate-500 dark:text-dark-400 truncate text-[10px]">
                            {repo.description || 'No description'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 font-mono text-[10px]">
                        <span className="flex items-center gap-0.5 text-slate-500">
                          <Star className="w-3 h-3 text-amber-500" />
                          {repo.stargazers_count}
                        </span>
                        {alreadyImported && (
                          <span className="px-1 py-0.5 rounded bg-slate-200 dark:bg-dark-750 text-slate-500">
                            Imported
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-dark-750 flex justify-end gap-2 bg-slate-50 dark:bg-dark-900">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-md text-slate-600 dark:text-dark-400 hover:bg-slate-200 dark:hover:bg-dark-800 font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={selectedRepoIds.size === 0}
            onClick={handleConfirmImport}
            className="px-4 py-1.5 rounded-md bg-slate-900 text-white dark:bg-dark-100 dark:text-dark-950 font-medium disabled:opacity-50 transition-colors"
          >
            Import {selectedRepoIds.size} repositories
          </button>
        </div>

      </div>
    </div>
  );
};
