import React, { useState, useEffect } from 'react';
import {
  X,
  Tag,
  Folder,
  Layers,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { RepoBookmark, Category, Directory, Tag as TagType } from '../../types';
import { parseGitHubRepo, fetchGitHubRepoDetails } from '../../services/githubApi';
import { GitStorageService } from '../../services/gitStorage';

interface RepoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (repo: RepoBookmark) => void;
  editingRepo?: RepoBookmark | null;
  categories: Category[];
  directories: Directory[];
  tags: TagType[];
  onAddNewTag: (tagName: string) => void;
}

export const RepoModal: React.FC<RepoModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingRepo,
  categories,
  directories,
  tags,
  onAddNewTag,
}) => {
  const [repoInput, setRepoInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [fullName, setFullName] = useState('');
  const [description, setDescription] = useState('');
  const [stars, setStars] = useState(0);
  const [forks, setForks] = useState(0);
  const [language, setLanguage] = useState('');
  const [license, setLicense] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [directoryId, setDirectoryId] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [notes, setNotes] = useState('');
  const [rating, setRating] = useState(5);
  const [status, setStatus] = useState<RepoBookmark['status']>('bookmarked');
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    if (editingRepo) {
      setRepoInput(editingRepo.fullName);
      setFullName(editingRepo.fullName);
      setDescription(editingRepo.description);
      setStars(editingRepo.stars);
      setForks(editingRepo.forks);
      setLanguage(editingRepo.language);
      setLicense(editingRepo.license || '');
      setAvatarUrl(editingRepo.avatarUrl);
      setCategoryId(editingRepo.categoryId);
      setDirectoryId(editingRepo.directoryId);
      setSelectedTags(editingRepo.tags || []);
      setNotes(editingRepo.notes || '');
      setRating(editingRepo.rating || 5);
      setStatus(editingRepo.status || 'bookmarked');
      setPinned(editingRepo.pinned || false);
      setError(null);
    } else {
      setRepoInput('');
      setFullName('');
      setDescription('');
      setStars(0);
      setForks(0);
      setLanguage('');
      setLicense('');
      setAvatarUrl('');
      setCategoryId(categories[0]?.id || '');
      const firstDirs = directories.filter((d) => d.categoryId === (categories[0]?.id || ''));
      setDirectoryId(firstDirs[0]?.id || '');
      setSelectedTags([]);
      setNotes('');
      setRating(5);
      setStatus('bookmarked');
      setPinned(false);
      setError(null);
    }
  }, [editingRepo, isOpen, categories, directories]);

  if (!isOpen) return null;

  const handleFetchDetails = async () => {
    const parsed = parseGitHubRepo(repoInput);
    if (!parsed) {
      setError('Enter a valid repository path (owner/repo or GitHub URL).');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = GitStorageService.getGitHubToken();
      const data = await fetchGitHubRepoDetails(parsed.owner, parsed.repo, token);

      setFullName(data.full_name);
      setDescription(data.description || '');
      setStars(data.stargazers_count);
      setForks(data.forks_count);
      setLanguage(data.language || 'Unknown');
      setLicense(data.license ? data.license.name : '');
      setAvatarUrl(data.owner.avatar_url);

      if (data.topics && data.topics.length > 0) {
        const newTags = Array.from(new Set([...selectedTags, ...data.topics.slice(0, 4)]));
        setSelectedTags(newTags);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch repository metadata.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleAddCustomTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTagInput.trim()) {
      e.preventDefault();
      const formatted = newTagInput.trim().toLowerCase().replace(/^#/, '');
      if (!selectedTags.includes(formatted)) {
        setSelectedTags([...selectedTags, formatted]);
        onAddNewTag(formatted);
      }
      setNewTagInput('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName) {
      setError('Repository name is required.');
      return;
    }

    const [owner, name] = fullName.split('/');
    const repo: RepoBookmark = {
      id: editingRepo ? editingRepo.id : `${owner}-${name}`.toLowerCase(),
      owner: owner || 'unknown',
      name: name || fullName,
      fullName,
      url: `https://github.com/${fullName}`,
      description,
      stars,
      forks,
      language: language || 'Unknown',
      license: license || undefined,
      topics: selectedTags,
      avatarUrl: avatarUrl || 'https://github.githubassets.com/favicons/favicon.svg',
      defaultBranch: editingRepo ? editingRepo.defaultBranch : 'main',
      createdAt: editingRepo ? editingRepo.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      directoryId,
      categoryId,
      tags: selectedTags,
      notes,
      rating,
      status,
      addedAt: editingRepo ? editingRepo.addedAt : new Date().toISOString(),
      pinned,
    };

    onSave(repo);
    onClose();
  };

  const filteredDirectories = directories.filter((d) => d.categoryId === categoryId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-750 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-dark-750 flex items-center justify-between">
          <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
            {editingRepo ? 'Edit repository' : 'Add repository'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-dark-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-3.5 text-xs">
          
          {/* URL fetch input */}
          <div>
            <label className="block font-medium text-slate-700 dark:text-dark-300 mb-1">
              GitHub repository (owner/name or URL)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={repoInput}
                onChange={(e) => setRepoInput(e.target.value)}
                placeholder="astral-sh/uv"
                className="flex-1 px-3 py-1.5 rounded-md bg-slate-100 dark:bg-dark-850 border border-slate-200 dark:border-dark-750 text-slate-900 dark:text-white focus:outline-none focus:border-dark-600 font-mono text-xs"
              />
              <button
                type="button"
                onClick={handleFetchDetails}
                disabled={loading}
                className="px-3 py-1.5 rounded-md bg-slate-900 text-white dark:bg-dark-100 dark:text-dark-950 font-medium hover:bg-slate-800 dark:hover:bg-white disabled:opacity-50 transition-colors"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Fetch'}
              </button>
            </div>
            {error && (
              <div className="flex items-center gap-1.5 text-rose-500 mt-1">
                <AlertCircle className="w-3 h-3" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Full name and language */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-600 dark:text-dark-400 mb-1">
                Repository path
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-2.5 py-1.5 rounded-md bg-slate-100 dark:bg-dark-850 border border-slate-200 dark:border-dark-750 text-slate-900 dark:text-white focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 dark:text-dark-400 mb-1">
                Language
              </label>
              <input
                type="text"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-md bg-slate-100 dark:bg-dark-850 border border-slate-200 dark:border-dark-750 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-600 dark:text-dark-400 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-md bg-slate-100 dark:bg-dark-850 border border-slate-200 dark:border-dark-750 text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          {/* Category & Directory */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-600 dark:text-dark-400 mb-1 flex items-center gap-1">
                <Layers className="w-3 h-3" />
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  const relatedDirs = directories.filter((d) => d.categoryId === e.target.value);
                  setDirectoryId(relatedDirs[0]?.id || '');
                }}
                className="w-full px-2.5 py-1.5 rounded-md bg-slate-100 dark:bg-dark-850 border border-slate-200 dark:border-dark-750 text-slate-900 dark:text-white focus:outline-none"
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
                Directory
              </label>
              <select
                value={directoryId}
                onChange={(e) => setDirectoryId(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-md bg-slate-100 dark:bg-dark-850 border border-slate-200 dark:border-dark-750 text-slate-900 dark:text-white focus:outline-none"
              >
                {filteredDirectories.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status, Rating, Pin */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-slate-600 dark:text-dark-400 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-2.5 py-1.5 rounded-md bg-slate-100 dark:bg-dark-850 border border-slate-200 dark:border-dark-750 text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="bookmarked">Bookmarked</option>
                <option value="evaluating">Testing</option>
                <option value="production">Production</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-600 dark:text-dark-400 mb-1">
                Rating
              </label>
              <div className="flex items-center gap-1 mt-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => setRating(s)}
                    className="p-0.5 text-xs text-amber-500"
                  >
                    {s <= rating ? '★' : '☆'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center pt-4">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pinned}
                  onChange={(e) => setPinned(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                />
                <span className="font-medium text-slate-700 dark:text-dark-300">
                  Pin item
                </span>
              </label>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block font-medium text-slate-600 dark:text-dark-400 mb-1 flex items-center gap-1">
              <Tag className="w-3 h-3" />
              Tags
            </label>
            <div className="flex flex-wrap gap-1 mb-1.5">
              {tags.map((t) => {
                const isSelected = selectedTags.includes(t.name);
                return (
                  <button
                    type="button"
                    key={t.id}
                    onClick={() => handleToggleTag(t.name)}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-dark-800 text-slate-600 dark:text-dark-400 hover:bg-slate-200'
                    }`}
                  >
                    #{t.name}
                  </button>
                );
              })}
            </div>
            <input
              type="text"
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              onKeyDown={handleAddCustomTag}
              placeholder="Type tag and press Enter"
              className="w-full px-2.5 py-1 rounded-md bg-slate-100 dark:bg-dark-850 border border-slate-200 dark:border-dark-750 text-slate-900 dark:text-white focus:outline-none font-mono text-[11px]"
            />
          </div>

          {/* Personal Notes */}
          <div>
            <label className="block font-medium text-slate-600 dark:text-dark-400 mb-1">
              Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Use cases, alternatives, or benchmarks"
              className="w-full px-2.5 py-1.5 rounded-md bg-slate-100 dark:bg-dark-850 border border-slate-200 dark:border-dark-750 text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-200 dark:border-dark-750 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-md text-slate-600 dark:text-dark-400 hover:bg-slate-100 dark:hover:bg-dark-800 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-md bg-slate-900 text-white dark:bg-dark-100 dark:text-dark-950 font-medium hover:bg-slate-800 dark:hover:bg-white transition-colors"
            >
              Save
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
