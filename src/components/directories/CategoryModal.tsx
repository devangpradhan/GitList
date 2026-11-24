import React, { useState } from 'react';
import {
  X,
  FolderPlus,
  Check,
} from 'lucide-react';
import { Category, Directory } from '../../types';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  targetCategoryId?: string;
  isFolderMode?: boolean;
  onSaveCategory: (category: Category) => void;
  onSaveDirectory: (directory: Directory) => void;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  categories,
  targetCategoryId,
  isFolderMode = false,
  onSaveCategory,
  onSaveDirectory,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState(targetCategoryId || categories[0]?.id || '');
  const [color, setColor] = useState('#3b82f6');
  const [icon] = useState('Folder');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');

    if (isFolderMode) {
      const newDir: Directory = {
        id: slug,
        name: name.trim(),
        slug,
        description,
        categoryId,
        icon: 'Folder',
        order: Date.now(),
      };
      onSaveDirectory(newDir);
    } else {
      const newCat: Category = {
        id: slug,
        name: name.trim(),
        slug,
        description,
        icon: icon || 'Folder',
        color,
        order: categories.length + 1,
      };
      onSaveCategory(newCat);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-750 shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-dark-750 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderPlus className="w-4 h-4 text-slate-500" />
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
              {isFolderMode ? 'New directory' : 'New category'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-dark-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          
          {isFolderMode && (
            <div>
              <label className="block font-medium text-slate-600 dark:text-dark-400 mb-1">
                Parent category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-md bg-slate-100 dark:bg-dark-850 border border-slate-200 dark:border-dark-750 text-slate-900 dark:text-white"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block font-medium text-slate-700 dark:text-dark-300 mb-1">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isFolderMode ? 'CLI tools' : 'Frontend'}
              required
              className="w-full px-2.5 py-1.5 rounded-md bg-slate-100 dark:bg-dark-850 border border-slate-200 dark:border-dark-750 text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-600 dark:text-dark-400 mb-1">
              Description (optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Scope of repositories in this collection"
              className="w-full px-2.5 py-1.5 rounded-md bg-slate-100 dark:bg-dark-850 border border-slate-200 dark:border-dark-750 text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          {!isFolderMode && (
            <div>
              <label className="block font-medium text-slate-600 dark:text-dark-400 mb-1">
                Color
              </label>
              <div className="flex items-center gap-2">
                {['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className="w-6 h-6 rounded-full border flex items-center justify-center transition-transform"
                    style={{
                      backgroundColor: c,
                      borderColor: color === c ? '#ffffff' : 'transparent',
                    }}
                  >
                    {color === c && <Check className="w-3 h-3 text-white" />}
                  </button>
                ))}
              </div>
            </div>
          )}

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
