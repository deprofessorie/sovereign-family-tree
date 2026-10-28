import React, { useState } from 'react';
import { Landmark, Sparkles, AlertCircle, Shield } from 'lucide-react';

export default function FoundHouseModal({ onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [motto, setMotto] = useState('');
  const [originCountry, setOriginCountry] = useState('');
  const [originCity, setOriginCity] = useState('');
  const [foundedYear, setFoundedYear] = useState(new Date().getFullYear().toString());
  const [crestSymbol, setCrestSymbol] = useState('Crown & Oak Tree');
  const [heraldicColor, setHeraldicColor] = useState('#f59e0b');
  const [badgeIcon, setBadgeIcon] = useState('🏰');
  const [description, setDescription] = useState('');
  const [headName, setHeadName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const badges = ['🏰', '🦁', '🦅', '🌸', '⚜️', '🐉', '☘️', '👑', '🐺', '⚔️', '🌊', '🌙'];
  const colors = ['#f59e0b', '#ec4899', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4', '#84cc16'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !originCountry.trim()) {
      setError('House name and country of origin are required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onSubmit({
        name,
        motto,
        originCountry,
        originCity,
        foundedYear,
        crestSymbol,
        heraldicColor,
        badgeIcon,
        description,
        headName
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to found house.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-3xl border-2 border-amber-500/30 glass-panel-gold p-6 md:p-8 text-white shadow-2xl my-8 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white text-lg w-8 h-8 rounded-full bg-slate-800/80 flex items-center justify-center"
        >
          ✕
        </button>

        <div className="flex items-center gap-3 border-b border-amber-500/20 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-2xl">
            {badgeIcon}
          </div>
          <div>
            <h3 className="text-xl font-bold font-serif-heraldic text-white">
              Found a New Sovereign House
            </h3>
            <p className="text-xs text-slate-400">
              Establish your family in the Worldwide Sovereign Roll with unique heraldry and referral code
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                House / Family Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. House Lancaster"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-950/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Founding Head / Patriarch
              </label>
              <input
                type="text"
                placeholder="e.g. Lord John Lancaster"
                value={headName}
                onChange={(e) => setHeadName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-950/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Nation of Origin *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Scotland, Italy, Canada"
                value={originCountry}
                onChange={(e) => setOriginCountry(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-950/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Ancestral Seat / City
              </label>
              <input
                type="text"
                placeholder="e.g. Edinburgh Castle"
                value={originCity}
                onChange={(e) => setOriginCity(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-950/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              House Motto
            </label>
            <input
              type="text"
              placeholder="e.g. Forward in Honor, Unbroken in Faith"
              value={motto}
              onChange={(e) => setMotto(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-950/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Badge & Color Picker */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Crest Emblem Icon
              </label>
              <div className="flex flex-wrap gap-2">
                {badges.map(b => (
                  <button
                    type="button"
                    key={b}
                    onClick={() => setBadgeIcon(b)}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg border transition-all ${
                      badgeIcon === b
                        ? 'border-amber-400 bg-amber-500/20 scale-110'
                        : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Heraldic Livery Color
              </label>
              <div className="flex flex-wrap gap-2">
                {colors.map(c => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setHeraldicColor(c)}
                    className={`w-9 h-9 rounded-xl border-2 transition-all ${
                      heraldicColor === c ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-80'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Family Chronicle & History
            </label>
            <textarea
              rows={3}
              placeholder="Brief summary of the lineage, ancestral deeds, and traditions..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-950/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="pt-4 border-t border-amber-500/20 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-slate-800 text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-slate-950 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
            >
              {loading ? 'Chartering House...' : 'Charter House into Roll'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
