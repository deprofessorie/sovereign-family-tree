import React, { useState } from 'react';
import {
  Landmark,
  Globe,
  Scroll,
  Calendar,
  Heart,
  Crown,
  KeyRound,
  Plus,
  Shield,
  ChevronDown,
  User,
  Check
} from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  userRole,
  setUserRole,
  currentHouse,
  onOpenReferralModal,
  onOpenFoundModal
}) {
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const personas = [
    {
      role: 'KEEPER',
      label: '👑 Archive Keeper (Site Owner)',
      badge: 'Omnipotent',
      desc: 'Absolute command: edit/remove any house, member, and seal marriages',
      color: 'text-amber-300'
    },
    {
      role: 'HEAD',
      label: '🛡️ House Head (Lord Alistair)',
      badge: 'Sovereign',
      desc: 'House Stirling Head: manage house, approve submissions & alliances',
      color: 'text-sky-300'
    },
    {
      role: 'MEMBER',
      label: '👤 House Member (Jane Stirling)',
      badge: 'Kinsman',
      desc: 'Verified kinsman: modify profile, submit children, spouse & notices',
      color: 'text-emerald-300'
    },
    {
      role: 'VISITOR',
      label: '🌐 Global Public Visitor',
      badge: 'Public',
      desc: 'Explore public 3D globe and directory summaries; join or found family',
      color: 'text-slate-300'
    }
  ];

  const currentPersona = personas.find(p => p.role === userRole) || personas[0];

  return (
    <>
      {/* Desktop & Tablet Floating Header */}
      <header className="sticky top-0 z-40 w-full apple-liquid-glass">
        {/* Topmost Persona Selector Ribbon */}
        <div className="border-b border-white/10 px-4 sm:px-6 py-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <span className="text-slate-400 font-medium hidden sm:inline">Active Persona:</span>

            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium border border-white/10 transition-all apple-touch-target min-h-[34px]"
                aria-expanded={roleDropdownOpen}
                aria-label="Select User Role Persona"
              >
                <span className="font-semibold text-xs">{currentPersona.label}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {roleDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-84 rounded-2xl apple-liquid-glass p-2 z-50 shadow-2xl text-left animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                    Switch Active Perspective
                  </div>
                  {personas.map(p => (
                    <button
                      key={p.role}
                      onClick={() => {
                        setUserRole(p.role);
                        setRoleDropdownOpen(false);
                      }}
                      className={`w-full p-2.5 rounded-xl text-left hover:bg-white/10 transition-all flex items-start justify-between ${
                        userRole === p.role ? 'bg-white/15 border border-white/20' : ''
                      }`}
                    >
                      <div>
                        <div className={`font-semibold text-xs ${p.color}`}>{p.label}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">{p.desc}</div>
                      </div>
                      {userRole === p.role && <Check className="w-4 h-4 text-amber-400 shrink-0 ml-2" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions (Apple HIG: Clear verbs, min 44pt touch targets) */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenReferralModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 border border-white/10 text-xs font-medium transition-all"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>Join with Code</span>
            </button>

            <button
              onClick={onOpenFoundModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Found House</span>
            </button>
          </div>
        </div>

        {/* Main Desktop Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Identity */}
          <div
            onClick={() => setActiveTab('GLOBE')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/25 group-hover:scale-105 transition-transform">
              <Landmark className="w-5 h-5 font-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold font-serif-heraldic text-white tracking-wide">
                  SOVEREIGN TREE
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                  REALM
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans">
                Worldwide Archive of Noble Houses
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs (Apple HIG Segmented Style) */}
          <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold apple-segmented-control p-1">
            <button
              onClick={() => setActiveTab('GLOBE')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                activeTab === 'GLOBE' ? 'apple-segmented-item-active' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>Globe & Stats</span>
            </button>

            <button
              onClick={() => setActiveTab('HOUSES')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                activeTab === 'HOUSES' ? 'apple-segmented-item-active' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Registry</span>
            </button>

            <button
              onClick={() => setActiveTab('TREE')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                activeTab === 'TREE' ? 'apple-segmented-item-active' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="text-sm">🌳</span>
              <span>Family Tree</span>
            </button>

            <button
              onClick={() => setActiveTab('NOTICES')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                activeTab === 'NOTICES' ? 'apple-segmented-item-active' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Scroll className="w-4 h-4" />
              <span>Notices</span>
            </button>

            <button
              onClick={() => setActiveTab('EVENTS')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                activeTab === 'EVENTS' ? 'apple-segmented-item-active' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Events</span>
            </button>

            <button
              onClick={() => setActiveTab('BONDS')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                activeTab === 'BONDS' ? 'apple-segmented-item-active' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Heart className="w-4 h-4 text-rose-400" />
              <span>Marriage Seals</span>
            </button>

            {userRole === 'KEEPER' && (
              <button
                onClick={() => setActiveTab('SANCTUM')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                  activeTab === 'SANCTUM'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-amber-400 hover:bg-amber-500/10'
                }`}
              >
                <Crown className="w-4 h-4" />
                <span>Sanctum</span>
              </button>
            )}
          </nav>

          {/* Current House Heraldic Pill */}
          {currentHouse && (
            <div className="flex items-center gap-3 pl-3 border-l border-white/10">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-base shadow border border-white/15"
                style={{ backgroundColor: `${currentHouse.heraldicColor}25` }}
              >
                {currentHouse.badgeIcon || '🛡️'}
              </div>
              <div className="hidden xl:block text-left">
                <span className="block text-xs font-bold text-white font-serif-heraldic leading-tight">
                  {currentHouse.name}
                </span>
                <span className="block text-[11px] text-amber-300 font-mono">
                  {currentHouse.originCountry}
                </span>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Standard Bottom Tab Bar (Apple HIG tab-bars.md) */}
      <nav
        aria-label="Mobile Navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 apple-liquid-glass border-t border-white/15 px-2 py-1 pb-safe flex items-center justify-around text-[10px] font-semibold"
      >
        <button
          onClick={() => setActiveTab('GLOBE')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all apple-touch-target min-w-[50px] min-h-[48px] ${
            activeTab === 'GLOBE' ? 'text-amber-400' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Globe className="w-5 h-5 mb-0.5" />
          <span>Globe</span>
        </button>

        <button
          onClick={() => setActiveTab('HOUSES')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all apple-touch-target min-w-[50px] min-h-[48px] ${
            activeTab === 'HOUSES' ? 'text-amber-400' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Shield className="w-5 h-5 mb-0.5" />
          <span>Houses</span>
        </button>

        <button
          onClick={() => setActiveTab('TREE')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all apple-touch-target min-w-[50px] min-h-[48px] ${
            activeTab === 'TREE' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <span className="text-lg leading-none mb-0.5">🌳</span>
          <span>Tree</span>
        </button>

        <button
          onClick={() => setActiveTab('NOTICES')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all apple-touch-target min-w-[50px] min-h-[48px] ${
            activeTab === 'NOTICES' ? 'text-amber-400' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Scroll className="w-5 h-5 mb-0.5" />
          <span>Notices</span>
        </button>

        <button
          onClick={() => setActiveTab('EVENTS')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all apple-touch-target min-w-[50px] min-h-[48px] ${
            activeTab === 'EVENTS' ? 'text-amber-400' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Calendar className="w-5 h-5 mb-0.5" />
          <span>Events</span>
        </button>

        <button
          onClick={() => setActiveTab('BONDS')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all apple-touch-target min-w-[50px] min-h-[48px] ${
            activeTab === 'BONDS' ? 'text-amber-400' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Heart className="w-5 h-5 mb-0.5 text-rose-400" />
          <span>Seals</span>
        </button>

        {userRole === 'KEEPER' && (
          <button
            onClick={() => setActiveTab('SANCTUM')}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all apple-touch-target min-w-[50px] min-h-[48px] ${
              activeTab === 'SANCTUM' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Crown className="w-5 h-5 mb-0.5" />
            <span>Sanctum</span>
          </button>
        )}
      </nav>
    </>
  );
}
