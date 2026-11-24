import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  ArrowUpDown,
  BookMarked,
  UploadCloud,
} from 'lucide-react';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/directories/Sidebar';
import { RepoCard } from './components/repos/RepoCard';
import { RepoModal } from './components/repos/RepoModal';
import { StarImporterModal } from './components/repos/StarImporterModal';
import { CommitModal } from './components/cms/CommitModal';
import { SettingsModal } from './components/cms/SettingsModal';
import { ExportModal } from './components/export/ExportModal';
import { CategoryModal } from './components/directories/CategoryModal';
import { GitStorageService } from './services/gitStorage';
import { RepoBookmark, Category, Directory, GitListConfig, GitListData } from './types';

export const App: React.FC = () => {
  const [data, setData] = useState<GitListData>(() => GitStorageService.loadData());
  const [hasUncommittedChanges, setHasUncommittedChanges] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDirectory, setSelectedDirectory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [onlyPinned, setOnlyPinned] = useState(false);
  const [sortBy, setSortBy] = useState<'stars' | 'name' | 'rating' | 'updated'>('stars');

  // UI Modes
  const [isCmsMode, setIsCmsMode] = useState(true);
  const [isDark, setIsDark] = useState(true);

  // Modals
  const [isRepoModalOpen, setIsRepoModalOpen] = useState(false);
  const [editingRepo, setEditingRepo] = useState<RepoBookmark | null>(null);
  const [isStarImporterOpen, setIsStarImporterOpen] = useState(false);
  const [isCommitModalOpen, setIsCommitModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryModalIsFolder, setCategoryModalIsFolder] = useState(false);
  const [categoryModalTargetCat, setCategoryModalTargetCat] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const updateData = (newData: GitListData) => {
    setData(newData);
    GitStorageService.saveDataLocally(newData);
    setHasUncommittedChanges(true);
  };

  const repoCountByCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    data.repos.forEach((r) => {
      counts[r.categoryId] = (counts[r.categoryId] || 0) + 1;
    });
    return counts;
  }, [data.repos]);

  const repoCountByDirectory = useMemo(() => {
    const counts: Record<string, number> = {};
    data.repos.forEach((r) => {
      if (r.directoryId) {
        counts[r.directoryId] = (counts[r.directoryId] || 0) + 1;
      }
    });
    return counts;
  }, [data.repos]);

  const existingRepoIds = useMemo(() => {
    return new Set(data.repos.map((r) => r.id));
  }, [data.repos]);

  const filteredRepos = useMemo(() => {
    let list = [...data.repos];

    if (selectedCategory) {
      list = list.filter((r) => r.categoryId === selectedCategory);
    }

    if (selectedDirectory) {
      list = list.filter((r) => r.directoryId === selectedDirectory);
    }

    if (selectedTag) {
      list = list.filter((r) => r.tags && r.tags.includes(selectedTag));
    }

    if (selectedStatus) {
      list = list.filter((r) => r.status === selectedStatus);
    }

    if (onlyPinned) {
      list = list.filter((r) => r.pinned);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.fullName.toLowerCase().includes(q) ||
          r.description?.toLowerCase().includes(q) ||
          r.language?.toLowerCase().includes(q) ||
          r.notes?.toLowerCase().includes(q) ||
          r.tags?.some((t) => t.toLowerCase().includes(q.replace(/^#/, '')))
      );
    }

    list.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;

      switch (sortBy) {
        case 'stars':
          return b.stars - a.stars;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'updated':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        default:
          return 0;
      }
    });

    return list;
  }, [
    data.repos,
    selectedCategory,
    selectedDirectory,
    selectedTag,
    selectedStatus,
    onlyPinned,
    searchQuery,
    sortBy,
  ]);

  const currentCategory = data.categories.find((c) => c.id === selectedCategory);
  const currentDirectory = data.directories.find((d) => d.id === selectedDirectory);

  const handleSaveRepo = (repo: RepoBookmark) => {
    const exists = data.repos.some((r) => r.id === repo.id);
    let nextRepos: RepoBookmark[];
    if (exists) {
      nextRepos = data.repos.map((r) => (r.id === repo.id ? repo : r));
    } else {
      nextRepos = [repo, ...data.repos];
    }
    updateData({ ...data, repos: nextRepos });
  };

  const handleDeleteRepo = (repoId: string) => {
    if (window.confirm('Delete this repository from the index?')) {
      const nextRepos = data.repos.filter((r) => r.id !== repoId);
      updateData({ ...data, repos: nextRepos });
    }
  };

  const handleTogglePin = (repoId: string) => {
    const nextRepos = data.repos.map((r) =>
      r.id === repoId ? { ...r, pinned: !r.pinned } : r
    );
    updateData({ ...data, repos: nextRepos });
  };

  const handleBulkImportStars = (importedRepos: RepoBookmark[]) => {
    const merged = [...importedRepos, ...data.repos];
    updateData({ ...data, repos: merged });
  };

  const handleAddNewTag = (tagName: string) => {
    const tagId = tagName.toLowerCase();
    if (!data.tags.some((t) => t.name.toLowerCase() === tagId)) {
      const newTag = {
        id: tagId,
        name: tagName,
        color: '#3b82f6',
      };
      updateData({ ...data, tags: [...data.tags, newTag] });
    }
  };

  const handleSaveCategory = (cat: Category) => {
    updateData({ ...data, categories: [...data.categories, cat] });
  };

  const handleSaveDirectory = (dir: Directory) => {
    updateData({ ...data, directories: [...data.directories, dir] });
  };

  const handleSaveConfig = (newConfig: GitListConfig) => {
    updateData({ ...data, config: newConfig });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-dark-950 text-slate-900 dark:text-dark-200 bg-radial-glow transition-colors">
      
      {/* Navigation Bar */}
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isCmsMode={isCmsMode}
        setIsCmsMode={setIsCmsMode}
        onOpenAddRepo={() => {
          setEditingRepo(null);
          setIsRepoModalOpen(true);
        }}
        onOpenStarImporter={() => setIsStarImporterOpen(true)}
        onOpenCommit={() => setIsCommitModalOpen(true)}
        onOpenExport={() => setIsExportModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        isDark={isDark}
        toggleTheme={() => setIsDark(!isDark)}
        hasUncommittedChanges={hasUncommittedChanges}
        repoCount={data.repos.length}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        
        {/* Sidebar */}
        <Sidebar
          categories={data.categories}
          directories={data.directories}
          tags={data.tags}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedDirectory={selectedDirectory}
          setSelectedDirectory={setSelectedDirectory}
          selectedTag={selectedTag}
          setSelectedTag={setSelectedTag}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          onlyPinned={onlyPinned}
          setOnlyPinned={setOnlyPinned}
          isCmsMode={isCmsMode}
          onAddCategory={() => {
            setCategoryModalIsFolder(false);
            setIsCategoryModalOpen(true);
          }}
          onAddDirectory={(catId) => {
            setCategoryModalIsFolder(true);
            setCategoryModalTargetCat(catId);
            setIsCategoryModalOpen(true);
          }}
          repoCountByCategory={repoCountByCategory}
          repoCountByDirectory={repoCountByDirectory}
          totalReposCount={data.repos.length}
        />

        {/* Content area */}
        <main className="flex-1 p-5 flex flex-col gap-4 overflow-y-auto">
          
          {/* Header row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-dark-750">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-semibold text-slate-900 dark:text-white">
                  {currentDirectory
                    ? currentDirectory.name
                    : currentCategory
                    ? currentCategory.name
                    : selectedTag
                    ? `Tag: #${selectedTag}`
                    : selectedStatus
                    ? `Status: ${selectedStatus}`
                    : 'All repositories'}
                </h1>
                <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-slate-200 dark:bg-dark-800 text-slate-600 dark:text-dark-400">
                  {filteredRepos.length}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-dark-400 mt-0.5">
                {currentDirectory?.description ||
                  currentCategory?.description ||
                  data.config.siteDescription}
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-dark-400">
                <ArrowUpDown className="w-3 h-3" />
                <span>Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-2 py-1 rounded bg-white dark:bg-dark-850 border border-slate-200 dark:border-dark-750 text-slate-900 dark:text-white text-xs focus:outline-none"
                >
                  <option value="stars">Stars</option>
                  <option value="rating">Rating</option>
                  <option value="updated">Updated</option>
                  <option value="name">Name</option>
                </select>
              </div>

              {isCmsMode && (
                <button
                  onClick={() => {
                    setEditingRepo(null);
                    setIsRepoModalOpen(true);
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 text-white dark:bg-dark-100 dark:text-dark-950 font-medium transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add repo</span>
                </button>
              )}
            </div>
          </div>

          {/* Uncommitted changes banner */}
          {hasUncommittedChanges && isCmsMode && (
            <div className="flex items-center justify-between p-2.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-xs text-blue-600 dark:text-blue-400">
              <div className="flex items-center gap-2">
                <UploadCloud className="w-3.5 h-3.5 text-blue-500" />
                <span>Uncommitted changes in local storage.</span>
              </div>
              <button
                onClick={() => setIsCommitModalOpen(true)}
                className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors"
              >
                Commit changes
              </button>
            </div>
          )}

          {/* Repos Grid */}
          {filteredRepos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredRepos.map((repo) => {
                const category = data.categories.find((c) => c.id === repo.categoryId);
                const directory = data.directories.find((d) => d.id === repo.directoryId);

                return (
                  <RepoCard
                    key={repo.id}
                    repo={repo}
                    category={category}
                    directory={directory}
                    isCmsMode={isCmsMode}
                    onEdit={(r) => {
                      setEditingRepo(r);
                      setIsRepoModalOpen(true);
                    }}
                    onDelete={handleDeleteRepo}
                    onTogglePin={handleTogglePin}
                    onTagClick={(t) => setSelectedTag(t)}
                  />
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-slate-300 dark:border-dark-750 rounded-lg p-6 bg-slate-50/50 dark:bg-dark-900/20 text-xs">
              <BookMarked className="w-8 h-8 text-slate-400 dark:text-dark-600 mb-2" />
              <p className="font-medium text-slate-700 dark:text-dark-300">
                No repositories match the current filter
              </p>
              <p className="text-slate-400 dark:text-dark-500 mt-0.5 mb-3">
                Change search terms or add a new repository.
              </p>
              {isCmsMode && (
                <button
                  onClick={() => {
                    setEditingRepo(null);
                    setIsRepoModalOpen(true);
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded bg-slate-900 text-white dark:bg-dark-100 dark:text-dark-950 font-medium"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add repository</span>
                </button>
              )}
            </div>
          )}

        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-dark-800 py-3 px-6 text-center text-[11px] text-slate-500 dark:text-dark-500 bg-white dark:bg-dark-950">
        GitList repository index. Hostable directly on GitHub Pages.
      </footer>

      {/* Modals */}
      <RepoModal
        isOpen={isRepoModalOpen}
        onClose={() => setIsRepoModalOpen(false)}
        onSave={handleSaveRepo}
        editingRepo={editingRepo}
        categories={data.categories}
        directories={data.directories}
        tags={data.tags}
        onAddNewTag={handleAddNewTag}
      />

      <StarImporterModal
        isOpen={isStarImporterOpen}
        onClose={() => setIsStarImporterOpen(false)}
        onImportBulk={handleBulkImportStars}
        categories={data.categories}
        directories={data.directories}
        existingRepoIds={existingRepoIds}
      />

      <CommitModal
        isOpen={isCommitModalOpen}
        onClose={() => setIsCommitModalOpen(false)}
        data={data}
        onCommitSuccess={() => setHasUncommittedChanges(false)}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        config={data.config}
        onSaveConfig={handleSaveConfig}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        data={data}
        onImportSuccess={(imported) => {
          setData(imported);
          setHasUncommittedChanges(false);
        }}
      />

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={data.categories}
        targetCategoryId={categoryModalTargetCat}
        isFolderMode={categoryModalIsFolder}
        onSaveCategory={handleSaveCategory}
        onSaveDirectory={handleSaveDirectory}
      />

    </div>
  );
};
