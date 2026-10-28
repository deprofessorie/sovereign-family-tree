import React, { useState } from 'react';
import { Landmark, Shield, Users, Globe, ExternalLink, Plus, Lock, CheckCircle2 } from 'lucide-react';

export default function HousesDirectory({
  houses,
  userRole,
  userHouseId,
  onSelectHouse,
  onFoundHouse
}) {
  const [search, setSearch] = useState('');

  const filteredHouses = (houses || []).filter(h => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      h.name.toLowerCase().includes(q) ||
      h.originCountry.toLowerCase().includes(q) ||
      (h.motto && h.motto.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-3xl border border-amber-500/20 bg-slate-900/90 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold font-serif-heraldic text-white">
              Worldwide Sovereign House Registry
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Public heraldic rolls of families around the globe • Enter to inspect genealogical trees
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search house by name or nation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3.5 py-2 text-xs bg-slate-950/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 w-full md:w-64"
          />

          <button
            onClick={onFoundHouse}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:brightness-110 shadow-lg shadow-amber-500/20 shrink-0"
          >
            <Plus className="w-4 h-4" /> Found a Family
          </button>
        </div>
      </div>

      {/* Directory Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHouses.map(house => {
          // Check access privilege:
          // Visitor: summary view only, but can view tree preview.
          // Member: default own house, can view allied houses or houses granted privilege.
          // Keeper: omnipotent access to all!
          const isOwnHouse = userHouseId === house.id;
          const isAllied = userHouseId && (house.alliedHouses || []).includes(userHouseId);
          const hasFullAccess = userRole === 'KEEPER' || isOwnHouse || isAllied;

          return (
            <div
              key={house.id}
              className="p-6 rounded-3xl border border-slate-800 bg-slate-900/60 hover:border-amber-500/40 transition-all flex flex-col justify-between group shadow-xl"
            >
              <div>
                {/* Crest & Origin */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3.5">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg border-2"
                      style={{
                        backgroundColor: `${house.heraldicColor}18`,
                        borderColor: `${house.heraldicColor}55`,
                        color: house.heraldicColor
                      }}
                    >
                      {house.badgeIcon || '🛡️'}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold font-serif-heraldic text-white group-hover:text-amber-300 transition-colors">
                        {house.name}
                      </h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <Globe className="w-3.5 h-3.5 text-amber-400" />
                        <span>{house.originCountry}</span>
                        <span>•</span>
                        <span>Est. {house.foundedYear}</span>
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-slate-950 text-amber-300 border border-amber-500/20">
                    {house.memberCount || 0} Souls
                  </span>
                </div>

                {/* Motto */}
                <div className="mt-4 p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80">
                  <p className="text-xs text-amber-300/90 italic font-serif leading-relaxed">
                    "{house.motto}"
                  </p>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-400 mt-3 line-clamp-3 leading-relaxed">
                  {house.description}
                </p>

                {/* Referral Code Badge */}
                <div className="mt-3.5 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500">Referral Join Code:</span>
                  <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    {house.referralCode}
                  </span>
                </div>
              </div>

              {/* Action */}
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <div className="text-[11px]">
                  {hasFullAccess ? (
                    <span className="text-emerald-400 flex items-center gap-1 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Full Lineage Access
                    </span>
                  ) : (
                    <span className="text-slate-400 flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-amber-400" /> Public Summary View
                    </span>
                  )}
                </div>

                <button
                  onClick={() => onSelectHouse(house.id)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-amber-300 border border-amber-500/30 transition-all"
                >
                  <span>Explore Tree</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
