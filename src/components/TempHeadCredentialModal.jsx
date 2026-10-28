import React, { useState } from 'react';
import { Copy, Check, Shield, Key, Mail, Sparkles, Crown } from 'lucide-react';

export default function TempHeadCredentialModal({ credentials, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!credentials) return null;

  const handleCopy = () => {
    const text = `SOVEREIGN TREE - TEMPORARY HOUSE HEAD CREDENTIALS\n` +
      `Chartered House: ${credentials.houseName}\n` +
      `Temporary Head: ${credentials.spouseName}\n` +
      `Email: ${credentials.email}\n` +
      `Temporary Password: ${credentials.password}\n` +
      `Claim Token: ${credentials.claimToken}\n` +
      `Notice: Use these credentials to claim, rename, and decorate your sovereign house.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-3xl border-2 border-amber-500/40 glass-panel-gold p-6 md:p-8 text-white shadow-2xl animate-in fade-in zoom-in-95">
        {/* Heraldic Crown Icon */}
        <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mx-auto mb-4 shadow-lg shadow-amber-500/10">
          <Crown className="w-8 h-8" />
        </div>

        <div className="text-center">
          <span className="text-[11px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
            Royal Dispatch & Imperial Patent
          </span>
          <h3 className="text-2xl font-bold font-serif-heraldic text-white mt-2">
            New House Chartered!
          </h3>
          <p className="text-sm text-slate-300 mt-1 max-w-md mx-auto">
            <span className="text-amber-300 font-semibold">{credentials.spouseName}</span> has been appointed <span className="text-amber-300 font-semibold">Temporary Head</span> of newly founded <span className="text-amber-300 font-semibold">{credentials.houseName}</span>!
          </p>
        </div>

        {/* Credentials Parchment Box */}
        <div className="mt-6 p-4 rounded-2xl bg-slate-950/90 border border-amber-500/30 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-slate-400 flex items-center gap-1.5 font-sans">
              <Mail className="w-3.5 h-3.5 text-amber-400" /> Temporary Login Email:
            </span>
            <span className="text-amber-300 font-bold">{credentials.email}</span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-slate-400 flex items-center gap-1.5 font-sans">
              <Key className="w-3.5 h-3.5 text-amber-400" /> Generated Password:
            </span>
            <span className="text-emerald-400 font-bold tracking-wider">{credentials.password}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5 font-sans">
              <Shield className="w-3.5 h-3.5 text-amber-400" /> Sovereign Claim Token:
            </span>
            <span className="text-purple-300 font-bold">{credentials.claimToken}</span>
          </div>
        </div>

        {/* Dispatch Notification */}
        <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed">
          <p>
            ✨ <strong>Dispatched to Member:</strong> These credentials have been recorded in the royal archives and dispatched to the logged-in member. The newly added spouse can log in with these credentials to claim, rename, and decorate their sovereign hall.
          </p>
        </div>

        {/* Modal Buttons */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-amber-400" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Credentials'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-slate-950 shadow-lg shadow-amber-500/20 transition-all"
          >
            Enter Lineage Roll
          </button>
        </div>
      </div>
    </div>
  );
}
