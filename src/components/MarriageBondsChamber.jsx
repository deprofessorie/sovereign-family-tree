import React from 'react';
import { Heart, Shield, Check, Clock, Sparkles, Award } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function MarriageBondsChamber({
  bonds,
  houses,
  userRole,
  userHouseId,
  onSealBond
}) {
  const handleSeal = async (bondId) => {
    // Trigger royal celebratory confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#f43f5e', '#ec4899', '#fbbf24', '#ffffff']
    });

    await onSealBond(bondId);
  };

  const getHouseInfo = (houseId) => {
    return houses.find(h => h.id === houseId) || { name: 'Noble House', badgeIcon: '🛡️', heraldicColor: '#f59e0b' };
  };

  const canUserApprove = (bond) => {
    if (userRole === 'KEEPER') return true;
    if (userRole === 'HEAD') {
      if (userHouseId === bond.husbandHouseId && !bond.approvedByHouseA) return true;
      if (userHouseId === bond.wifeHouseId && !bond.approvedByHouseB) return true;
    }
    return false;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-3xl border border-rose-500/20 bg-gradient-to-r from-slate-900 via-rose-950/20 to-slate-900 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <Heart className="w-6 h-6 fill-rose-500/20" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold font-serif-heraldic text-white">
              Chamber of Diplomatic Alliances & Marriage Seals
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Ratification of inter-house marital unions by House Heads or the Sovereign Archive Keeper
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
          <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
          <span className="text-slate-300 font-medium">Bilateral Consensual Treaties</span>
        </div>
      </div>

      {/* Bonds List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {(bonds || []).map(bond => {
          const houseA = getHouseInfo(bond.husbandHouseId);
          const houseB = getHouseInfo(bond.wifeHouseId);
          const isSealed = bond.status === 'SEALED';
          const canApproveThis = canUserApprove(bond);

          return (
            <div
              key={bond.id}
              className={`p-6 rounded-3xl border transition-all ${
                isSealed
                  ? 'bg-gradient-to-b from-slate-900/90 to-slate-950 border-rose-500/30 shadow-lg shadow-rose-950/20'
                  : 'bg-slate-900/60 border-slate-800 hover:border-amber-500/30'
              }`}
            >
              {/* Status Header */}
              <div className="flex items-center justify-between mb-4">
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${
                    isSealed
                      ? 'bg-rose-950/70 text-rose-300 border-rose-500/40'
                      : 'bg-amber-950/70 text-amber-300 border-amber-500/40'
                  }`}
                >
                  {isSealed ? (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-rose-400" /> Sealed Bond of Marriage
                    </>
                  ) : (
                    <>
                      <Clock className="w-3.5 h-3.5 text-amber-400" /> Pending Ratification
                    </>
                  )}
                </span>

                <span className="text-xs text-slate-500 font-mono">
                  {isSealed ? `Sealed: ${bond.sealedDate}` : `Proposed: ${bond.proposedDate}`}
                </span>
              </div>

              {/* Inter-house Crest Banner */}
              <div className="flex items-center justify-between bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80 my-3">
                {/* Husband Side */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow"
                    style={{ backgroundColor: `${houseA.heraldicColor}25` }}
                  >
                    {houseA.badgeIcon || '🦁'}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">{bond.husbandName}</h4>
                    <p className="text-[11px] text-amber-400 font-medium">{houseA.name}</p>
                  </div>
                </div>

                {/* Love Seal in Middle */}
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-md border ${
                    isSealed ? 'bg-rose-600/30 border-rose-500 text-rose-400' : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}>
                    {isSealed ? '❤️' : '💍'}
                  </div>
                </div>

                {/* Wife Side */}
                <div className="flex items-center gap-3 text-right">
                  <div>
                    <h4 className="font-bold text-sm text-white">{bond.wifeName}</h4>
                    <p className="text-[11px] text-amber-400 font-medium">{houseB.name}</p>
                  </div>
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow"
                    style={{ backgroundColor: `${houseB.heraldicColor}25` }}
                  >
                    {houseB.badgeIcon || '🌸'}
                  </div>
                </div>
              </div>

              {/* Treaty Details */}
              <div className="mt-3 text-xs text-slate-300">
                <p className="font-semibold text-amber-300">{bond.pactTitle}</p>
                <p className="text-slate-400 mt-1 italic leading-relaxed">{bond.notes}</p>
              </div>

              {/* Approval Ledger */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3 text-[11px]">
                  <span className={`flex items-center gap-1 ${bond.approvedByHouseA ? 'text-emerald-400' : 'text-slate-500'}`}>
                    <Check className="w-3 h-3" /> {houseA.name}
                  </span>
                  <span className="text-slate-700">•</span>
                  <span className={`flex items-center gap-1 ${bond.approvedByHouseB ? 'text-emerald-400' : 'text-slate-500'}`}>
                    <Check className="w-3 h-3" /> {houseB.name}
                  </span>
                  {bond.approvedByKeeper && (
                    <>
                      <span className="text-slate-700">•</span>
                      <span className="text-amber-400 font-semibold flex items-center gap-1">
                        <Award className="w-3 h-3" /> Keeper
                      </span>
                    </>
                  )}
                </div>

                {!isSealed && canApproveThis && (
                  <button
                    onClick={() => handleSeal(bond.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:brightness-110 text-white shadow-lg shadow-rose-500/25 transition-all"
                  >
                    <Heart className="w-3.5 h-3.5 fill-white" /> Seal Marriage Bond
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
