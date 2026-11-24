import React, { useState } from 'react';
import {
  X,
  UploadCloud,
  GitCommit,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { GitListData } from '../../types';
import { GitStorageService } from '../../services/gitStorage';

interface CommitModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: GitListData;
  onCommitSuccess: () => void;
}

export const CommitModal: React.FC<CommitModalProps> = ({
  isOpen,
  onClose,
  data,
  onCommitSuccess,
}) => {
  const [commitMessage, setCommitMessage] = useState(
    `chore: update bookmarks (${data.repos.length} repositories)`
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<{
    commitUrl?: string;
    message: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleCommit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessResult(null);

    try {
      const result = await GitStorageService.commitToGitHub(data, commitMessage);
      setSuccessResult(result);
      onCommitSuccess();
    } catch (err: any) {
      setError(
        err.message || 'Failed to commit changes to GitHub.'
      );
    } finally {
      setLoading(false);
    }
  };

  const hasToken = !!GitStorageService.getGitHubToken();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-750 shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-dark-750 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UploadCloud className="w-4 h-4 text-blue-500" />
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
              Commit to GitHub repository
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-dark-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleCommit} className="p-5 space-y-3.5 text-xs">
          
          <div className="p-3 rounded-md bg-slate-100 dark:bg-dark-850 border border-slate-200 dark:border-dark-750 text-slate-600 dark:text-dark-300">
            Target repository: <span className="font-mono font-medium text-slate-900 dark:text-white">{data.config.githubRepo}</span> ({data.config.githubBranch})
          </div>

          {!hasToken && (
            <div className="p-3 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                A GitHub personal access token with repo scope is required to commit. Set it in Settings.
              </div>
            </div>
          )}

          <div>
            <label className="block font-medium text-slate-700 dark:text-dark-300 mb-1">
              Commit message
            </label>
            <input
              type="text"
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              required
              className="w-full px-2.5 py-1.5 rounded-md bg-slate-100 dark:bg-dark-850 border border-slate-200 dark:border-dark-750 text-slate-900 dark:text-white focus:outline-none font-mono text-xs"
            />
          </div>

          <div className="text-slate-500 dark:text-dark-400 space-y-1 font-mono text-[11px]">
            <div className="flex justify-between">
              <span>Repositories:</span>
              <span className="text-slate-900 dark:text-white">{data.repos.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Categories:</span>
              <span className="text-slate-900 dark:text-white">{data.categories.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Directories:</span>
              <span className="text-slate-900 dark:text-white">{data.directories.length}</span>
            </div>
          </div>

          {error && (
            <div className="p-2.5 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-start gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successResult && (
            <div className="p-2.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 space-y-1">
              <div className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Commit pushed</span>
              </div>
              {successResult.commitUrl && (
                <a
                  href={successResult.commitUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 underline"
                >
                  <span>View commit on GitHub</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="pt-3 border-t border-slate-200 dark:border-dark-750 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-md text-slate-600 dark:text-dark-400 hover:bg-slate-100 dark:hover:bg-dark-800 font-medium"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={loading || !hasToken}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-medium disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <GitCommit className="w-3.5 h-3.5" />
              )}
              <span>Commit and push</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
