import React, { useState } from 'react';
import {
  X,
  Key,
  Github,
  Database,
  Check,
} from 'lucide-react';
import { GitListConfig } from '../../types';
import { GitStorageService } from '../../services/gitStorage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: GitListConfig;
  onSaveConfig: (newConfig: GitListConfig) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) => {
  const [token, setToken] = useState(GitStorageService.getGitHubToken());
  const [siteTitle, setSiteTitle] = useState(config.siteTitle);
  const [siteDescription, setSiteDescription] = useState(config.siteDescription);
  const [githubRepo, setGithubRepo] = useState(config.githubRepo);
  const [githubBranch, setGithubBranch] = useState(config.githubBranch);
  const [dataFile, setDataFile] = useState(config.dataFile);
  const [authorName, setAuthorName] = useState(config.authorName);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    GitStorageService.setGitHubToken(token);

    const updated: GitListConfig = {
      ...config,
      siteTitle,
      siteDescription,
      githubRepo: githubRepo.trim(),
      githubBranch: githubBranch.trim(),
      dataFile: dataFile.trim(),
      authorName,
    };

    onSaveConfig(updated);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-750 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-dark-750 flex items-center justify-between">
          <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
            Settings
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-dark-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} className="p-5 overflow-y-auto space-y-3.5 text-xs">
          
          {/* GitHub Token */}
          <div className="p-3 rounded-md bg-slate-50 dark:bg-dark-850 border border-slate-200 dark:border-dark-750 space-y-1.5">
            <div className="flex items-center gap-1.5 font-medium text-slate-900 dark:text-white">
              <Key className="w-3.5 h-3.5 text-amber-500" />
              <span>GitHub personal access token</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-dark-400">
              Used to bypass rate limits (5,000 requests per hour) and commit directly to the repository. Stored locally in browser localStorage.
            </p>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="ghp_..."
              className="w-full px-2.5 py-1.5 rounded bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-750 text-slate-900 dark:text-white focus:outline-none font-mono text-xs"
            />
          </div>

          {/* Repo & branch */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-600 dark:text-dark-400 mb-1 flex items-center gap-1">
                <Github className="w-3 h-3" />
                Repository
              </label>
              <input
                type="text"
                value={githubRepo}
                onChange={(e) => setGithubRepo(e.target.value)}
                placeholder="username/gitlist"
                required
                className="w-full px-2.5 py-1.5 rounded-md bg-slate-100 dark:bg-dark-850 border border-slate-200 dark:border-dark-750 text-slate-900 dark:text-white focus:outline-none font-mono text-xs"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-600 dark:text-dark-400 mb-1">
                Branch
              </label>
              <input
                type="text"
                value={githubBranch}
                onChange={(e) => setGithubBranch(e.target.value)}
                placeholder="main"
                required
                className="w-full px-2.5 py-1.5 rounded-md bg-slate-100 dark:bg-dark-850 border border-slate-200 dark:border-dark-750 text-slate-900 dark:text-white focus:outline-none font-mono text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-600 dark:text-dark-400 mb-1 flex items-center gap-1">
              <Database className="w-3 h-3" />
              Data file path
            </label>
            <input
              type="text"
              value={dataFile}
              onChange={(e) => setDataFile(e.target.value)}
              placeholder="data/gitlist.json"
              required
              className="w-full px-2.5 py-1.5 rounded-md bg-slate-100 dark:bg-dark-850 border border-slate-200 dark:border-dark-750 text-slate-900 dark:text-white focus:outline-none font-mono text-xs"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-600 dark:text-dark-400 mb-1">
              Site title
            </label>
            <input
              type="text"
              value={siteTitle}
              onChange={(e) => setSiteTitle(e.target.value)}
              required
              className="w-full px-2.5 py-1.5 rounded-md bg-slate-100 dark:bg-dark-850 border border-slate-200 dark:border-dark-750 text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-600 dark:text-dark-400 mb-1">
              Site description
            </label>
            <textarea
              rows={2}
              value={siteDescription}
              onChange={(e) => setSiteDescription(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-md bg-slate-100 dark:bg-dark-850 border border-slate-200 dark:border-dark-750 text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-600 dark:text-dark-400 mb-1">
              Author name
            </label>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-md bg-slate-100 dark:bg-dark-850 border border-slate-200 dark:border-dark-750 text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-200 dark:border-dark-750 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-md text-slate-600 dark:text-dark-400 hover:bg-slate-100 dark:hover:bg-dark-800 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1 px-4 py-1.5 rounded-md bg-slate-900 text-white dark:bg-dark-100 dark:text-dark-950 font-medium hover:bg-slate-800 dark:hover:bg-white transition-colors"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Saved</span>
                </>
              ) : (
                <span>Save settings</span>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
