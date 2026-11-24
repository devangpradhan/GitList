import React from 'react';
import {
  Star,
  GitFork,
  ExternalLink,
  Edit2,
  Trash2,
  Pin,
  Folder,
  Hash,
  Scale,
} from 'lucide-react';
import { RepoBookmark, Category, Directory } from '../../types';

interface RepoCardProps {
  repo: RepoBookmark;
  category?: Category;
  directory?: Directory;
  isCmsMode: boolean;
  onEdit: (repo: RepoBookmark) => void;
  onDelete: (repoId: string) => void;
  onTogglePin: (repoId: string) => void;
  onTagClick: (tag: string) => void;
}

export const RepoCard: React.FC<RepoCardProps> = ({
  repo,
  category,
  directory,
  isCmsMode,
  onEdit,
  onDelete,
  onTogglePin,
  onTagClick,
}) => {
  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  const getStatusBadge = (status: RepoBookmark['status']) => {
    switch (status) {
      case 'production':
        return (
          <span className="flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Production
          </span>
        );
      case 'evaluating':
        return (
          <span className="flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Testing
          </span>
        );
      case 'archived':
        return (
          <span className="flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-500 border border-slate-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Archived
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Saved
          </span>
        );
    }
  };

  return (
    <div className="group relative flex flex-col justify-between rounded-lg border border-slate-200 dark:border-dark-750 bg-white dark:bg-dark-850 p-4 transition-all hover:border-slate-300 dark:hover:border-dark-600 shadow-sm">
      
      {/* Header */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={repo.avatarUrl || 'https://github.githubassets.com/favicons/favicon.svg'}
              alt={repo.owner}
              className="w-7 h-7 rounded border border-slate-200 dark:border-dark-700 bg-slate-100 dark:bg-dark-900 object-cover shrink-0"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="min-w-0">
              <a
                href={repo.url}
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-sm text-slate-900 dark:text-dark-100 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1.5 truncate group/link transition-colors"
              >
                <span className="truncate">{repo.fullName}</span>
                <ExternalLink className="w-3 h-3 opacity-0 group-hover/link:opacity-100 transition-opacity shrink-0" />
              </a>

              {/* Breadcrumb directory */}
              {(category || directory) && (
                <div className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-dark-500 truncate">
                  <Folder className="w-3 h-3 shrink-0" />
                  <span className="truncate">
                    {category?.name} {directory ? `/ ${directory.name}` : ''}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right badge & CMS controls */}
          <div className="flex items-center gap-1 shrink-0">
            {getStatusBadge(repo.status)}

            {repo.pinned && (
              <span className="text-amber-500 p-0.5" title="Pinned">
                <Pin className="w-3 h-3 fill-amber-500" />
              </span>
            )}

            {isCmsMode && (
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                <button
                  onClick={() => onTogglePin(repo.id)}
                  className={`p-1 rounded hover:bg-slate-100 dark:hover:bg-dark-750 transition-colors ${
                    repo.pinned ? 'text-amber-500' : 'text-slate-400'
                  }`}
                  title="Toggle pin"
                >
                  <Pin className="w-3 h-3" />
                </button>
                <button
                  onClick={() => onEdit(repo)}
                  className="p-1 rounded text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-dark-750 transition-colors"
                  title="Edit repository"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
                <button
                  onClick={() => onDelete(repo.id)}
                  className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-dark-750 transition-colors"
                  title="Delete repository"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-600 dark:text-dark-300 line-clamp-2 my-2 leading-relaxed">
          {repo.description || 'No description provided.'}
        </p>

        {/* Note */}
        {repo.notes && (
          <div className="my-2 border-l-2 border-slate-300 dark:border-dark-600 pl-2.5 py-0.5 text-[11px] text-slate-600 dark:text-dark-400">
            {repo.notes}
          </div>
        )}
      </div>

      {/* Footer info: tags & stats */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-dark-750 flex flex-col gap-2">
        
        {/* Tags */}
        {repo.tags && repo.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1">
            {repo.tags.map((tag) => (
              <button
                key={tag}
                onClick={() => onTagClick(tag)}
                className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-dark-800 text-slate-600 dark:text-dark-400 hover:text-slate-900 dark:hover:text-dark-200 transition-colors"
              >
                <Hash className="w-2 h-2 opacity-50" />
                <span>{tag}</span>
              </button>
            ))}
          </div>
        )}

        {/* Stats Row */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-dark-400 font-mono">
          <div className="flex items-center gap-3">
            {repo.language && (
              <div className="flex items-center gap-1.5 font-sans text-xs">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: repo.languageColor || '#7c8ba1' }}
                />
                <span className="text-slate-700 dark:text-dark-300">
                  {repo.language}
                </span>
              </div>
            )}

            <div className="flex items-center gap-1 tabular-nums">
              <Star className="w-3 h-3 text-amber-500" />
              <span>{formatNumber(repo.stars)}</span>
            </div>

            <div className="flex items-center gap-1 tabular-nums">
              <GitFork className="w-3 h-3" />
              <span>{formatNumber(repo.forks)}</span>
            </div>

            {repo.license && (
              <div className="hidden sm:flex items-center gap-1 text-[11px] font-sans truncate max-w-[90px]">
                <Scale className="w-3 h-3 shrink-0" />
                <span className="truncate">{repo.license}</span>
              </div>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <span
                key={s}
                className={`text-[11px] ${
                  s <= repo.rating
                    ? 'text-amber-500'
                    : 'text-slate-300 dark:text-dark-700'
                }`}
              >
                ★
              </span>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
