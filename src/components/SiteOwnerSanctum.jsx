import React, { useState } from 'react';
import { Crown, Shield, Trash2, Edit3, Plus, RotateCcw, Check, Heart, Sparkles, AlertTriangle } from 'lucide-react';

export default function SiteOwnerSanctum({
  houses,
  members,
  bonds,
  onDeleteHouse,
  onDeleteMember,
  onSealBondDirect,
  onResetDatabase,
  onAddHouse,
  onSelectHouse
}) {
  const [activeTab, setActiveTab] = useState('HOUSES'); // 'HOUSES' | 'MEMBERS' | 'BONDS'
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div className="space-y-6">
      {/* Imperial Sanctum Header */}
      <div className="p-6 md:p-8 rounded-3xl border-2 border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-slate-950 to-slate-900 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Crown className="w-64 h-64 text-amber-400" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border-2 border-amber-400/50 flex items-center justify-center text-amber-300 shadow-lg shadow-amber-500/20">
              <Crown className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold uppercase tracking-widest">
                  Omnipotent Sovereign Control
                </span>
                <span className="text-xs text-slate-400">Arch-Custodian Protocol</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black font-serif-heraldic text-white mt-1">
                Sanctum of the Whole Archive Keeper
              </h2>
              <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-2xl">
                Absolute command over all worldwide houses, lineages, royal marriage seals, imperial decrees, and database registers.
              </p>
            </div>
          </div>

          {/* Reset Database Button */}
          <div className="flex items-center gap-2">
            {!confirmReset ? (
              <button
                onClick={() => setConfirmReset(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-rose-950/80 text-rose-300 border border-rose-500/30 transition-all"
                title="Restore default worldwide houses & seed genealogies"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset Archive
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-rose-950 p-1.5 rounded-xl border border-rose-600 animate-in fade-in">
                <span className="text-xs text-rose-200 px-2 font-medium">Reset all to canonical seed?</span>
                <button
                  onClick={() => {
                    onResetDatabase();
                    setConfirmReset(false);
                  }}
                  className="px-2.5 py-1 text-xs font-bold bg-rose-600 text-white rounded-lg hover:bg-rose-500"
                >
                  Yes, Reset
                </button>
                <button
                  onClick={() => setConfirmReset(false)}
                  className="px-2.5 py-1 text-xs text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tab Controls */}
        <div className="mt-8 flex items-center gap-2 border-b border-amber-500/20 pb-3 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('HOUSES')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'HOUSES'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            Manage All Houses ({houses?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('MEMBERS')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'MEMBERS'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            All Registered Kinsmen ({members?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('BONDS')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'BONDS'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            Sovereign Marriage Seals ({bonds?.length || 0})
          </button>
        </div>
      </div>

      {/* TAB 1: ALL HOUSES OVERRIDE */}
      {activeTab === 'HOUSES' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {(houses || []).map(h => (
            <div
              key={h.id}
              className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{h.badgeIcon || '🛡️'}</span>
                    <div>
                      <h4 className="font-bold text-white font-serif-heraldic">{h.name}</h4>
                      <p className="text-xs text-slate-400">{h.originCountry}</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-amber-400">{h.referralCode}</span>
                </div>

                <p className="text-xs text-slate-300 italic mt-3">"{h.motto}"</p>
                <div className="mt-2 text-xs text-slate-400">
                  <span>Enrolled members: </span>
                  <span className="text-white font-semibold">{h.memberCount || 0}</span>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => onSelectHouse(h.id)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300"
                >
                  Inspect Lineage
                </button>

                <button
                  onClick={() => {
                    if (confirm(`Erase ${h.name} from the sovereign archive?`)) {
                      onDeleteHouse(h.id);
                    }
                  }}
                  className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-950 hover:text-rose-300 transition-colors"
                  title="Delete House & Roll"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: ALL REGISTERED KINSMEN */}
      {activeTab === 'MEMBERS' && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-serif-heraldic uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-4">Kinsman</th>
                  <th className="p-4">House</th>
                  <th className="p-4">Sex</th>
                  <th className="p-4">Title</th>
                  <th className="p-4">Marital Status</th>
                  <th className="p-4">Life Status</th>
                  <th className="p-4 text-right">Sanctum Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {(members || []).map(m => (
                  <tr key={m.id} className="hover:bg-slate-800/40">
                    <td className="p-4 flex items-center gap-3">
                      <img
                        src={m.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'}
                        alt={m.name}
                        className="w-8 h-8 rounded-lg object-cover border border-amber-500/30"
                      />
                      <span className="font-bold text-white">{m.name}</span>
                    </td>
                    <td className="p-4 font-mono text-amber-400">
                      {m.houseId.replace('house-', '').toUpperCase()}
                    </td>
                    <td className="p-4">
                      <span className={m.gender === 'Male' ? 'text-blue-400' : 'text-pink-400'}>
                        {m.gender}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400">{m.title || 'Noble'}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-rose-300">
                        {m.maritalStatus}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={m.isLiving ? 'text-emerald-400' : 'text-slate-500'}>
                        {m.isLiving ? 'Living' : 'Deceased'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => {
                          if (confirm(`Remove ${m.name} from the lineage roll?`)) {
                            onDeleteMember(m.id);
                          }
                        }}
                        className="text-rose-400 hover:text-rose-300 p-1 rounded hover:bg-rose-950"
                        title="Remove Kinsman"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: SOVEREIGN MARRIAGE BONDS */}
      {activeTab === 'BONDS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {(bonds || []).map(b => (
            <div
              key={b.id}
              className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                  b.status === 'SEALED' ? 'bg-rose-950 text-rose-300 border border-rose-600' : 'bg-amber-950 text-amber-300'
                }`}>
                  {b.status === 'SEALED' ? '❤️ Sealed Marriage' : '⏳ Pending Ratification'}
                </span>
                <span className="text-xs text-slate-500 font-mono">{b.id}</span>
              </div>

              <div className="text-sm font-semibold text-white">
                {b.husbandName} & {b.wifeName}
              </div>

              <p className="text-xs text-slate-400 italic">"{b.pactTitle}"</p>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-amber-400">Direct Keeper Authority</span>
                {b.status !== 'SEALED' && (
                  <button
                    onClick={() => onSealBondDirect(b.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow"
                  >
                    <Heart className="w-3.5 h-3.5 fill-white" /> Direct Imperial Seal
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
