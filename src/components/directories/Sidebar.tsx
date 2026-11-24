import React from 'react';
import {
  Folder,
  Plus,
  Hash,
  Pin,
  Layers,
  ChevronRight,
  Brain,
  Globe,
  Terminal,
  Wrench,
  Cpu,
  Bot,
  Box,
  Palette,
  TerminalSquare,
} from 'lucide-react';
import { Category, Directory, Tag } from '../../types';

interface SidebarProps {
  categories: Category[];
  directories: Directory[];
  tags: Tag[];
  selectedCategory: string | null;
  setSelectedCategory: (id: string | null) => void;
  selectedDirectory: string | null;
  setSelectedDirectory: (id: string | null) => void;
  selectedTag: string | null;
  setSelectedTag: (tag: string | null) => void;
  selectedStatus: string | null;
  setSelectedStatus: (status: string | null) => void;
  onlyPinned: boolean;
  setOnlyPinned: (val: boolean) => void;
  isCmsMode: boolean;
  onAddCategory: () => void;
  onAddDirectory: (categoryId?: string) => void;
  repoCountByCategory: Record<string, number>;
  repoCountByDirectory: Record<string, number>;
  totalReposCount: number;
}

const ICON_MAP: Record<string, any> = {
  Brain,
  Globe,
  Terminal,
  Wrench,
  Bot,
  Cpu,
  Layers,
  Palette,
  Box,
  TerminalSquare,
};

export const Sidebar: React.FC<SidebarProps> = ({
  categories,
  directories,
  tags,
  selectedCategory,
  setSelectedCategory,
  selectedDirectory,
  setSelectedDirectory,
  selectedTag,
  setSelectedTag,
  selectedStatus,
  setSelectedStatus,
  onlyPinned,
  setOnlyPinned,
  isCmsMode,
  onAddCategory,
  onAddDirectory,
  repoCountByCategory,
  repoCountByDirectory,
  totalReposCount,
}) => {
  return (
    <aside className="w-60 shrink-0 flex flex-col gap-5 p-3.5 border-r border-slate-200 dark:border-dark-750 bg-slate-50/50 dark:bg-dark-900/40 text-xs min-h-[calc(100vh-3.5rem)]">
      
      {/* Navigation Filter Section */}
      <div>
        <p className="font-semibold text-slate-400 dark:text-dark-500 uppercase tracking-wider text-[10px] px-2 mb-1.5">
          Views
        </p>
        <div className="flex flex-col gap-0.5">
          <button
            onClick={() => {
              setSelectedCategory(null);
              setSelectedDirectory(null);
              setSelectedTag(null);
              setSelectedStatus(null);
              setOnlyPinned(false);
            }}
            className={`w-full flex items-center justify-between px-2 py-1.5 rounded-md font-medium transition-colors ${
              selectedCategory === null &&
              selectedDirectory === null &&
              selectedTag === null &&
              selectedStatus === null &&
              !onlyPinned
                ? 'bg-slate-200 dark:bg-dark-800 text-slate-900 dark:text-white'
                : 'text-slate-600 dark:text-dark-400 hover:bg-slate-100 dark:hover:bg-dark-850 hover:text-slate-900 dark:hover:text-dark-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <Layers className="w-3.5 h-3.5" />
              <span>All repositories</span>
            </div>
            <span className="font-mono text-[11px] text-slate-400 dark:text-dark-500">
              {totalReposCount}
            </span>
          </button>

          <button
            onClick={() => setOnlyPinned(!onlyPinned)}
            className={`w-full flex items-center justify-between px-2 py-1.5 rounded-md font-medium transition-colors ${
              onlyPinned
                ? 'bg-slate-200 dark:bg-dark-800 text-slate-900 dark:text-white'
                : 'text-slate-600 dark:text-dark-400 hover:bg-slate-100 dark:hover:bg-dark-850 hover:text-slate-900 dark:hover:text-dark-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <Pin className="w-3.5 h-3.5" />
              <span>Pinned</span>
            </div>
          </button>
        </div>
      </div>

      {/* Categories & Directories Tree */}
      <div>
        <div className="flex items-center justify-between px-2 mb-1.5">
          <p className="font-semibold text-slate-400 dark:text-dark-500 uppercase tracking-wider text-[10px]">
            Directories
          </p>
          {isCmsMode && (
            <button
              onClick={onAddCategory}
              className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              title="Add category"
            >
              <Plus className="w-3 h-3" />
            </button>
          )}
        </div>

        <div className="flex flex-col gap-0.5">
          {categories.map((cat) => {
            const isCatActive = selectedCategory === cat.id;
            const catDirs = directories.filter((d) => d.categoryId === cat.id);
            const count = repoCountByCategory[cat.id] || 0;
            const IconComponent = ICON_MAP[cat.icon] || Folder;

            return (
              <div key={cat.id} className="flex flex-col">
                {/* Category button */}
                <button
                  onClick={() => {
                    setSelectedCategory(isCatActive ? null : cat.id);
                    setSelectedDirectory(null);
                  }}
                  className={`w-full flex items-center justify-between px-2 py-1.5 rounded-md font-medium transition-colors group ${
                    isCatActive && selectedDirectory === null
                      ? 'bg-slate-200 dark:bg-dark-800 text-slate-900 dark:text-white'
                      : 'text-slate-700 dark:text-dark-300 hover:bg-slate-100 dark:hover:bg-dark-850'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <IconComponent className="w-3.5 h-3.5 shrink-0 opacity-70" />
                    <span className="truncate">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[10px] text-slate-400 dark:text-dark-500">
                      {count}
                    </span>
                    <ChevronRight
                      className={`w-3 h-3 text-slate-400 transition-transform ${
                        isCatActive ? 'rotate-90' : ''
                      }`}
                    />
                  </div>
                </button>

                {/* Subdirectories */}
                {isCatActive && (
                  <div className="pl-4 pr-1 py-0.5 flex flex-col gap-0.5 border-l border-slate-200 dark:border-dark-750 ml-3.5 my-0.5">
                    {catDirs.map((dir) => {
                      const isDirActive = selectedDirectory === dir.id;
                      const dirCount = repoCountByDirectory[dir.id] || 0;

                      return (
                        <button
                          key={dir.id}
                          onClick={() => setSelectedDirectory(isDirActive ? null : dir.id)}
                          className={`w-full flex items-center justify-between px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                            isDirActive
                              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                              : 'text-slate-600 dark:text-dark-400 hover:text-slate-900 dark:hover:text-dark-200 hover:bg-slate-100 dark:hover:bg-dark-850'
                          }`}
                        >
                          <span className="truncate">{dir.name}</span>
                          <span className="font-mono text-[10px] text-slate-400 dark:text-dark-500">
                            {dirCount}
                          </span>
                        </button>
                      );
                    })}

                    {isCmsMode && (
                      <button
                        onClick={() => onAddDirectory(cat.id)}
                        className="w-full flex items-center gap-1 px-2 py-1 rounded text-[10px] text-slate-400 hover:text-slate-800 dark:hover:text-dark-200 transition-colors"
                      >
                        <Plus className="w-2.5 h-2.5" />
                        <span>Add directory</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Workflow Status Filter */}
      <div>
        <p className="font-semibold text-slate-400 dark:text-dark-500 uppercase tracking-wider text-[10px] px-2 mb-1.5">
          Status
        </p>
        <div className="flex flex-col gap-0.5">
          {[
            { id: 'production', label: 'Production', dot: 'bg-emerald-500' },
            { id: 'evaluating', label: 'Testing', dot: 'bg-blue-500' },
            { id: 'bookmarked', label: 'Bookmarked', dot: 'bg-amber-500' },
            { id: 'archived', label: 'Archived', dot: 'bg-slate-400' },
          ].map((st) => {
            const isActive = selectedStatus === st.id;
            return (
              <button
                key={st.id}
                onClick={() => setSelectedStatus(isActive ? null : st.id)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-200 dark:bg-dark-800 text-slate-900 dark:text-white'
                    : 'text-slate-600 dark:text-dark-400 hover:bg-slate-100 dark:hover:bg-dark-850 hover:text-slate-900 dark:hover:text-dark-200'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                <span>{st.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tags Section */}
      <div className="mt-auto pt-3 border-t border-slate-200 dark:border-dark-750">
        <div className="flex items-center justify-between px-2 mb-1.5">
          <p className="font-semibold text-slate-400 dark:text-dark-500 uppercase tracking-wider text-[10px]">
            Tags
          </p>
          {selectedTag && (
            <button
              onClick={() => setSelectedTag(null)}
              className="text-[10px] text-blue-500 hover:underline"
            >
              Reset
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1 px-1">
          {tags.map((tag) => {
            const isTagActive = selectedTag === tag.name;
            return (
              <button
                key={tag.id}
                onClick={() => setSelectedTag(isTagActive ? null : tag.name)}
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-mono transition-colors ${
                  isTagActive
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-200/70 dark:bg-dark-800 text-slate-600 dark:text-dark-400 hover:text-slate-900 dark:hover:text-dark-200 hover:bg-slate-300 dark:hover:bg-dark-750'
                }`}
              >
                <Hash className="w-2.5 h-2.5 opacity-40" />
                <span>{tag.name}</span>
              </button>
            );
          })}
        </div>
      </div>

    </aside>
  );
};
