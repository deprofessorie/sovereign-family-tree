import React, { useState } from 'react';
import { Scroll, Heart, Plus, Shield, Check, Sparkles, Filter, AlertCircle } from 'lucide-react';

export default function NoticeBoard({
  notices,
  house,
  userRole,
  onPostNotice,
  onApproveNotice,
  onLikeNotice
}) {
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'GLOBAL' | 'HOUSE'
  const [isPosting, setIsPosting] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState('ANNOUNCEMENT');
  const [isGlobal, setIsGlobal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const filteredNotices = (notices || []).filter(n => {
    if (filter === 'GLOBAL') return n.isGlobal;
    if (filter === 'HOUSE') return !n.isGlobal && n.houseId === house?.id;
    return true;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setSubmitting(true);
    try {
      await onPostNotice({
        houseId: house?.id || 'house-stirling',
        title,
        content,
        type,
        isGlobal: userRole === 'KEEPER' ? isGlobal : false,
        role: userRole
      });
      setTitle('');
      setContent('');
      setIsPosting(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const canPostGlobal = userRole === 'KEEPER';
  const canApprove = userRole === 'KEEPER' || userRole === 'HEAD';

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-3xl border border-amber-500/20 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Scroll className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold font-serif-heraldic text-white">
              The Grand Notice Board & Royal Scrolls
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Imperial decrees, clan announcements, genealogical discoveries & assemblies
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Filters */}
          <div className="flex items-center bg-slate-950/80 border border-slate-800 rounded-xl p-1 text-xs">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                filter === 'ALL' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Scrolls
            </button>
            <button
              onClick={() => setFilter('GLOBAL')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                filter === 'GLOBAL' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Global Decrees
            </button>
            <button
              onClick={() => setFilter('HOUSE')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                filter === 'HOUSE' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              House {house?.name?.replace('House ', '') || 'Family'}
            </button>
          </div>

          {userRole !== 'VISITOR' && (
            <button
              onClick={() => setIsPosting(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:brightness-110 shadow-lg shadow-amber-500/20"
            >
              <Plus className="w-4 h-4" /> Issue Notice
            </button>
          )}
        </div>
      </div>

      {/* Notices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredNotices.map((notice) => (
          <div
            key={notice.id}
            className={`relative p-5 rounded-3xl border transition-all duration-200 flex flex-col justify-between ${
              notice.isGlobal
                ? 'bg-gradient-to-b from-amber-950/20 to-slate-950 border-amber-500/40 shadow-lg shadow-amber-500/10'
                : 'bg-slate-900/60 border-slate-800 hover:border-amber-500/30'
            }`}
          >
            {/* Top Seal */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                    notice.isGlobal
                      ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  {notice.isGlobal ? '👑 Global Imperial Decree' : `📜 ${notice.type}`}
                </span>

                <span className="text-[11px] text-slate-500 font-mono">
                  {notice.date}
                </span>
              </div>

              <h3 className="text-base font-bold font-serif-heraldic text-white line-clamp-2">
                {notice.title}
              </h3>

              <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
                {notice.content}
              </p>
            </div>

            {/* Footer */}
            <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <div className="text-[11px] text-slate-400">
                <span>Herald: </span>
                <span className="text-slate-200 font-medium">{notice.authorName}</span>
              </div>

              <div className="flex items-center gap-2">
                {!notice.isApproved && canApprove && (
                  <button
                    onClick={() => onApproveNotice && onApproveNotice(notice.id)}
                    className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30"
                  >
                    <Check className="w-3 h-3" /> Approve
                  </button>
                )}

                <button
                  onClick={() => onLikeNotice && onLikeNotice(notice.id)}
                  className="flex items-center gap-1 px-2.5 py-1 text-[11px] rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-400 transition-colors"
                >
                  <Heart className="w-3 h-3 fill-rose-500/30" />
                  <span>{notice.likes || 0}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Post Notice Modal */}
      {isPosting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-3xl border border-amber-500/30 glass-panel-gold p-6 text-white shadow-2xl animate-in fade-in zoom-in-95">
            <button
              onClick={() => setIsPosting(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white text-lg w-8 h-8 rounded-full bg-slate-800/80 flex items-center justify-center"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 border-b border-amber-500/20 pb-4">
              <Scroll className="w-6 h-6 text-amber-400" />
              <h3 className="text-lg font-bold font-serif-heraldic">Inscribe Royal Notice</h3>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Notice Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Discovery of Ancestral Records"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-950/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Scroll Category</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white"
                  >
                    <option value="ANNOUNCEMENT">Announcement</option>
                    <option value="REMEMBRANCE">Remembrance</option>
                    <option value="MARRIAGE">Marriage Proclamation</option>
                    <option value="NEW_MEMBER">New Heir Born</option>
                  </select>
                </div>

                {canPostGlobal && (
                  <div className="flex flex-col justify-center">
                    <label className="flex items-center gap-2 text-xs text-amber-300 cursor-pointer pt-3">
                      <input
                        type="checkbox"
                        checked={isGlobal}
                        onChange={(e) => setIsGlobal(e.target.checked)}
                      />
                      <span>Imperial Global Decree</span>
                    </label>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Content / Decree Text *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Inscribe the words to be announced across the halls..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-950/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsPosting(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors"
                >
                  {submitting ? 'Inscribing...' : 'Seal & Proclaim'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
