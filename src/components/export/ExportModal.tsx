import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  FileText,
  Upload,
  Download,
  AlertCircle,
} from 'lucide-react';
import { GitListData } from '../../types';
import { generateAwesomeMarkdown } from '../../services/markdownExport';
import { GitStorageService } from '../../services/gitStorage';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: GitListData;
  onImportSuccess: (imported: GitListData) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  data,
  onImportSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'markdown' | 'json'>('markdown');
  const [copied, setCopied] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  if (!isOpen) return null;

  const markdownContent = generateAwesomeMarkdown(data);

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(markdownContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'README.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJson = () => {
    GitStorageService.exportJson(data);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setImportError(null);
      const imported = await GitStorageService.importJson(file);
      onImportSuccess(imported);
      onClose();
    } catch (err: any) {
      setImportError(err.message || 'Invalid JSON format.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-750 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-dark-750 flex items-center justify-between">
          <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
            Export and sync
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-dark-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-5 pt-3 flex gap-4 border-b border-slate-200 dark:border-dark-750 text-xs">
          <button
            onClick={() => setActiveTab('markdown')}
            className={`pb-2.5 font-medium border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'markdown'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Markdown (README.md)</span>
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`pb-2.5 font-medium border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'json'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>JSON backup</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-3 text-xs flex-1">
          {activeTab === 'markdown' ? (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-dark-400">
                  Standard markdown list organized by category and directory
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopyMarkdown}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 dark:bg-dark-800 hover:bg-slate-200 text-slate-700 dark:text-dark-300 font-medium"
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    onClick={handleDownloadMarkdown}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 text-white dark:bg-dark-100 dark:text-dark-950 font-medium"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download</span>
                  </button>
                </div>
              </div>

              <pre className="p-3 rounded-md bg-slate-100 dark:bg-dark-950 border border-slate-200 dark:border-dark-750 font-mono text-[11px] text-slate-800 dark:text-dark-300 max-h-80 overflow-y-auto whitespace-pre-wrap">
                {markdownContent}
              </pre>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-slate-500 dark:text-dark-400">
                Export or restore the full dataset including categories, directories, tags, and notes.
              </p>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleDownloadJson}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-900 text-white dark:bg-dark-100 dark:text-dark-950 font-medium"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download JSON</span>
                </button>

                <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-100 dark:bg-dark-800 hover:bg-slate-200 text-slate-700 dark:text-white font-medium cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Import JSON file</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {importError && (
                <div className="flex items-center gap-1.5 text-rose-500">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{importError}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-dark-750 flex justify-end">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-md text-slate-600 dark:text-dark-400 hover:bg-slate-100 dark:hover:bg-dark-800 font-medium"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
