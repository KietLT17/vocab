'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  BookmarkCheck,
  Search,
  Filter,
  Download,
  Upload,
  Clock,
  Sparkles,
  Plus
} from 'lucide-react';
import { UserVocabItem, VocabStatus } from '../../lib/types';
import {
  getStoredUserVocab,
  deleteWordFromBank,
  saveStoredUserVocab,
} from '../../lib/storage';
import VocabCard from '../../components/VocabCard';

export default function VocabularyPage() {
  const [items, setItems] = useState<UserVocabItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'DUE' | VocabStatus>('ALL');
  const [visibleLimit, setVisibleLimit] = useState(24);

  const loadData = () => {
    setItems(getStoredUserVocab());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('vocabflow_storage_updated', loadData);
    window.addEventListener('vocabflow_account_changed', loadData);
    return () => {
      window.removeEventListener('vocabflow_storage_updated', loadData);
      window.removeEventListener('vocabflow_account_changed', loadData);
    };
  }, []);

  useEffect(() => {
    setVisibleLimit(24);
  }, [searchTerm, statusFilter]);

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa từ này khỏi kho lưu trữ?')) {
      deleteWordFromBank(id);
      loadData();
    }
  };

  const filteredItems = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const now = Date.now();

    return items.filter((item) => {
      // Search matching
      const matchesSearch =
        !term ||
        item.word.toLowerCase().includes(term) ||
        item.definition.toLowerCase().includes(term) ||
        (item.vietnameseMeaning && item.vietnameseMeaning.toLowerCase().includes(term));

      if (!matchesSearch) return false;

      // Status matching
      if (statusFilter === 'ALL') return true;
      if (statusFilter === 'DUE') {
        return new Date(item.nextReviewAt).getTime() <= now;
      }
      return item.status === statusFilter;
    });
  }, [items, searchTerm, statusFilter]);

  // Export JSON backup
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(items, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `vocabflow_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON backup
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) {
          saveStoredUserVocab(imported);
          loadData();
          alert(`Đã khôi phục thành công ${imported.length} từ vựng!`);
        }
      } catch (err) {
        alert('File không hợp lệ hoặc bị lỗi định dạng JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <BookmarkCheck size={28} className="text-blue-600" />
            <span>Kho từ vựng của bạn ({items.length})</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Quản lý toàn bộ danh sách từ, tra cứu nhanh và theo dõi lộ trình ôn tập.
          </p>
        </div>

        {/* Backup / Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportJSON}
            title="Xuất file JSON sao lưu"
            className="p-2 sm:px-3 sm:py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Download size={16} />
            <span className="hidden sm:inline">Sao lưu</span>
          </button>

          <label
            title="Khôi phục từ file JSON"
            className="cursor-pointer p-2 sm:px-3 sm:py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Upload size={16} />
            <span className="hidden sm:inline">Khôi phục</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportJSON}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm từ tiếng Anh, nghĩa tiếng Việt hoặc định nghĩa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium shadow-sm"
          />
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold scrollbar-none">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition ${
              statusFilter === 'ALL'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            Tất cả ({items.length})
          </button>

          <button
            onClick={() => setStatusFilter('DUE')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition flex items-center gap-1 ${
              statusFilter === 'DUE'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50'
            }`}
          >
            <Clock size={12} /> Cần ôn tập
          </button>

          <button
            onClick={() => setStatusFilter('NEW')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition ${
              statusFilter === 'NEW'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-900/60 hover:bg-purple-50'
            }`}
          >
            Từ mới
          </button>

          <button
            onClick={() => setStatusFilter('LEARNING')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition ${
              statusFilter === 'LEARNING'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60 hover:bg-amber-50'
            }`}
          >
            Đang học
          </button>

          <button
            onClick={() => setStatusFilter('REVIEWING')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition ${
              statusFilter === 'REVIEWING'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/60 hover:bg-blue-50'
            }`}
          >
            Đang ôn
          </button>

          <button
            onClick={() => setStatusFilter('MASTERED')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition ${
              statusFilter === 'MASTERED'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/60 hover:bg-emerald-50'
            }`}
          >
            Thuộc lòng
          </button>
        </div>
      </div>

      {/* Grid of Cards */}
      {filteredItems.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <Search size={36} className="mx-auto text-slate-300" />
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            Không tìm thấy từ vựng nào khớp với bộ lọc.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.slice(0, visibleLimit).map((item) => (
              <VocabCard
                key={item.id}
                item={item}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {visibleLimit < filteredItems.length && (
            <div className="text-center pt-2">
              <button
                onClick={() => setVisibleLimit((prev) => prev + 24)}
                className="px-6 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-bold transition"
              >
                Hiển thị thêm ({filteredItems.length - visibleLimit} từ còn lại)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

