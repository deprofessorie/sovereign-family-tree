import React, { useState } from 'react';
import { KeyRound, Shield, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

export default function ReferralJoinModal({ onClose, onJoinHouse, api }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [matchedHouse, setMatchedHouse] = useState(null);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await api.verifyReferralCode(code);
      setMatchedHouse(res.house);
    } catch (err) {
      setError(err.message || 'Invalid or unknown referral code.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmJoin = () => {
    if (matchedHouse) {
      onJoinHouse(matchedHouse.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-md rounded-3xl border-2 border-amber-500/30 glass-panel-gold p-6 md:p-8 text-white shadow-2xl animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white text-lg w-8 h-8 rounded-full bg-slate-800/80 flex items-center justify-center"
        >
          ✕
        </button>

        <div className="flex items-center gap-3 border-b border-amber-500/20 pb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold font-serif-heraldic text-white">
              Join Family by Referral Code
            </h3>
            <p className="text-xs text-slate-400">
              Enter the unique invite code issued by your House Head or Steward
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!matchedHouse ? (
          <form onSubmit={handleVerify} className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Enter Referral Invite Code:
              </label>
              <input
                type="text"
                required
                placeholder="e.g. STIRLING-7421"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2.5 text-center font-mono font-bold tracking-widest text-sm bg-slate-950 border border-amber-500/40 rounded-xl text-amber-300 focus:outline-none focus:border-amber-400"
              />
              <p className="text-[11px] text-slate-500 mt-1 text-center">
                Try demo codes: <code className="text-amber-400">STIRLING-7421</code>, <code className="text-amber-400">TAKAHASHI-9182</code>
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-5 space-y-4">
            {/* Matched House Heraldry Card */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/40 text-center space-y-2">
              <div className="text-3xl">{matchedHouse.badgeIcon || '🛡️'}</div>
              <h4 className="text-lg font-bold font-serif-heraldic text-white">
                {matchedHouse.name}
              </h4>
              <p className="text-xs text-amber-400 font-serif italic">"{matchedHouse.motto}"</p>
              <p className="text-xs text-slate-400">{matchedHouse.originCountry}</p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setMatchedHouse(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 text-slate-300"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleConfirmJoin}
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shadow-lg shadow-emerald-500/20"
              >
                <span>Enter Family Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
