import React from 'react';
import {
  Plus,
  Github,
  UploadCloud,
  FileDown,
  Settings,
  Sun,
  Moon,
  Search,
  Lock,
  Unlock,
  Download,
} from 'lucide-react';

interface NavbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isCmsMode: boolean;
  setIsCmsMode: (val: boolean) => void;
  onOpenAddRepo: () => void;
  onOpenStarImporter: () => void;
  onOpenCommit: () => void;
  onOpenExport: () => void;
  onOpenSettings: () => void;
  isDark: boolean;
  toggleTheme: () => void;
  hasUncommittedChanges: boolean;
  repoCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  setSearchQuery,
  isCmsMode,
  setIsCmsMode,
  onOpenAddRepo,
  onOpenStarImporter,
  onOpenCommit,
  onOpenExport,
  onOpenSettings,
  isDark,
  toggleTheme,
  hasUncommittedChanges,
  repoCount,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 dark:border-dark-750 bg-white/90 dark:bg-dark-900/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-dark-800 dark:bg-dark-800 border border-slate-300 dark:border-dark-700 flex items-center justify-center text-slate-900 dark:text-white shadow-sm">
            <Github className="w-4 h-4" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-semibold text-sm text-slate-900 dark:text-white tracking-tight">
              GitList
            </span>
            <span className="text-xs font-mono text-slate-500 dark:text-dark-400">
              {repoCount} repos
            </span>
          </div>
        </div>

        {/* Center: Command Search Input */}
        <div className="flex-1 max-w-sm mx-4 relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-dark-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search repositories, tags, languages..."
            className="w-full pl-8 pr-8 py-1.5 text-xs rounded-md bg-slate-100 dark:bg-dark-850 text-slate-900 dark:text-dark-200 border border-slate-200 dark:border-dark-750 placeholder-slate-400 dark:placeholder-dark-500 focus:outline-none focus:border-dark-600 focus:ring-1 focus:ring-dark-600 transition-all font-mono"
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-dark-300"
            >
              ✕
            </button>
          ) : (
            <kbd className="hidden sm:inline-block absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 dark:text-dark-500 bg-slate-200 dark:bg-dark-750 rounded border border-slate-300 dark:border-dark-700">
              /
            </kbd>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5">
          
          {/* Segmented Mode Control */}
          <button
            onClick={() => setIsCmsMode(!isCmsMode)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
              isCmsMode
                ? 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400'
                : 'bg-slate-100 dark:bg-dark-800 border-slate-200 dark:border-dark-700 text-slate-600 dark:text-dark-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {isCmsMode ? (
              <>
                <Unlock className="w-3 h-3" />
                <span>Admin</span>
              </>
            ) : (
              <>
                <Lock className="w-3 h-3" />
                <span>Reader</span>
              </>
            )}
          </button>

          {isCmsMode && (
            <>
              <button
                onClick={onOpenAddRepo}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-900 text-white dark:bg-dark-100 dark:text-dark-950 hover:bg-slate-800 dark:hover:bg-white transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Add repo</span>
              </button>

              <button
                onClick={onOpenStarImporter}
                className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-slate-700 dark:text-dark-300 hover:bg-slate-100 dark:hover:bg-dark-800 border border-slate-200 dark:border-dark-700 transition-colors"
                title="Import GitHub stars"
              >
                <Download className="w-3 h-3" />
                <span>Import stars</span>
              </button>

              <button
                onClick={onOpenCommit}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                  hasUncommittedChanges
                    ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                    : 'text-slate-700 dark:text-dark-300 hover:bg-slate-100 dark:hover:bg-dark-800 border-slate-200 dark:border-dark-700'
                }`}
                title="Commit data to GitHub"
              >
                <UploadCloud className="w-3 h-3" />
                <span className="hidden sm:inline">Commit</span>
              </button>
            </>
          )}

          {/* Export */}
          <button
            onClick={onOpenExport}
            className="p-1.5 rounded-md text-slate-500 dark:text-dark-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-dark-800 transition-colors"
            title="Export to Markdown or JSON"
          >
            <FileDown className="w-3.5 h-3.5" />
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded-md text-slate-500 dark:text-dark-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-dark-800 transition-colors"
            title="Settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-md text-slate-500 dark:text-dark-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-dark-800 transition-colors"
            title="Toggle theme"
          >
            {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

        </div>
      </div>
    </header>
  );
};
