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
  Sparkles
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
      label: '👑 Site Owner / Archive Keeper',
      desc: 'Absolute command: edit, add, delete all houses, members, roles & seals',
      color: 'text-amber-300'
    },
    {
      role: 'HEAD',
      label: '🛡️ House Head (Lord Alistair)',
      desc: 'Sovereign of House Stirling: manage house, approve submissions & bonds',
      color: 'text-blue-300'
    },
    {
      role: 'MEMBER',
      label: '👤 House Member (Jane Stirling)',
      desc: 'Authenticated kinsman: modify profile, submit children, spouse & notices',
      color: 'text-emerald-300'
    },
    {
      role: 'VISITOR',
      label: '🌐 Global Public Visitor',
      desc: 'Unauthenticated explorer: view public globe, house summaries & join links',
      color: 'text-slate-300'
    }
  ];

  const currentPersona = personas.find(p => p.role === userRole) || personas[0];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-amber-500/20 bg-slate-950/90 backdrop-blur-xl">
      {/* Topmost Persona Simulator Ribbon */}
      <div className="bg-slate-900/90 border-b border-slate-800/80 px-4 py-1.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-slate-400 hidden sm:inline">Active Access Role:</span>
          
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-semibold transition-all"
            >
              <span>{currentPersona.label}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {roleDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-80 rounded-2xl bg-slate-900 border border-amber-500/30 shadow-2xl p-2 z-50 text-left">
                <div className="px-2 py-1 text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                  Switch Active Perspective
                </div>
                {personas.map(p => (
                  <button
                    key={p.role}
                    onClick={() => {
                      setUserRole(p.role);
                      setRoleDropdownOpen(false);
                    }}
                    className={`w-full p-2.5 rounded-xl text-left hover:bg-slate-800/90 transition-all flex flex-col ${
                      userRole === p.role ? 'bg-amber-500/10 border border-amber-500/30' : ''
                    }`}
                  >
                    <span className={`font-bold text-xs ${p.color}`}>{p.label}</span>
                    <span className="text-[10px] text-slate-400 mt-0.5 leading-snug">{p.desc}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Referral & Found family actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenReferralModal}
            className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[11px] font-medium"
          >
            <KeyRound className="w-3 h-3 text-amber-400" />
            <span>Join with Code</span>
          </button>

          <button
            onClick={onOpenFoundModal}
            className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-[11px] font-semibold"
          >
            <Plus className="w-3 h-3" />
            <span>Found Family</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div
          onClick={() => setActiveTab('GLOBE')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <Landmark className="w-5 h-5 font-black" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-black tracking-wider font-serif-heraldic text-white">
                SOVEREIGN TREE
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                REALM
              </span>
            </div>
            <p className="text-[10px] text-slate-400 tracking-wide font-sans">
              Worldwide Archive of Noble Houses
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('GLOBE')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all ${
              activeTab === 'GLOBE'
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>World Globe & Stats</span>
          </button>

          <button
            onClick={() => setActiveTab('HOUSES')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all ${
              activeTab === 'HOUSES'
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>House Registry</span>
          </button>

          <button
            onClick={() => setActiveTab('TREE')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all ${
              activeTab === 'TREE'
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <span className="text-sm">🌳</span>
            <span>Family Tree</span>
          </button>

          <button
            onClick={() => setActiveTab('NOTICES')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all ${
              activeTab === 'NOTICES'
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Scroll className="w-3.5 h-3.5" />
            <span>Notice Board</span>
          </button>

          <button
            onClick={() => setActiveTab('EVENTS')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all ${
              activeTab === 'EVENTS'
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Event Board</span>
          </button>

          <button
            onClick={() => setActiveTab('BONDS')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all ${
              activeTab === 'BONDS'
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-rose-400" />
            <span>Marriage Seals</span>
          </button>

          {userRole === 'KEEPER' && (
            <button
              onClick={() => setActiveTab('SANCTUM')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all ${
                activeTab === 'SANCTUM'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-amber-400 hover:bg-amber-500/10'
              }`}
            >
              <Crown className="w-3.5 h-3.5" />
              <span>Archive Sanctum</span>
            </button>
          )}
        </nav>

        {/* Current House Emblem Badge */}
        {currentHouse && (
          <div className="flex items-center gap-2 pl-3 border-l border-slate-800">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-sm shadow"
              style={{ backgroundColor: `${currentHouse.heraldicColor}25` }}
            >
              {currentHouse.badgeIcon || '🛡️'}
            </div>
            <div className="hidden lg:block text-left">
              <span className="block text-xs font-bold text-white font-serif-heraldic leading-tight">
                {currentHouse.name}
              </span>
              <span className="block text-[10px] text-amber-400/90 font-mono">
                {currentHouse.originCountry}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Tabs Row */}
      <div className="md:hidden flex items-center justify-around px-2 py-2 border-t border-slate-800 text-[11px] overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab('GLOBE')}
          className={`px-2 py-1 rounded-lg ${activeTab === 'GLOBE' ? 'text-amber-300 font-bold' : 'text-slate-400'}`}
        >
          Globe
        </button>
        <button
          onClick={() => setActiveTab('HOUSES')}
          className={`px-2 py-1 rounded-lg ${activeTab === 'HOUSES' ? 'text-amber-300 font-bold' : 'text-slate-400'}`}
        >
          Houses
        </button>
        <button
          onClick={() => setActiveTab('TREE')}
          className={`px-2 py-1 rounded-lg ${activeTab === 'TREE' ? 'text-amber-300 font-bold' : 'text-slate-400'}`}
        >
          Tree
        </button>
        <button
          onClick={() => setActiveTab('NOTICES')}
          className={`px-2 py-1 rounded-lg ${activeTab === 'NOTICES' ? 'text-amber-300 font-bold' : 'text-slate-400'}`}
        >
          Notices
        </button>
        <button
          onClick={() => setActiveTab('EVENTS')}
          className={`px-2 py-1 rounded-lg ${activeTab === 'EVENTS' ? 'text-amber-300 font-bold' : 'text-slate-400'}`}
        >
          Events
        </button>
        <button
          onClick={() => setActiveTab('BONDS')}
          className={`px-2 py-1 rounded-lg ${activeTab === 'BONDS' ? 'text-amber-300 font-bold' : 'text-slate-400'}`}
        >
          Seals
        </button>
        {userRole === 'KEEPER' && (
          <button
            onClick={() => setActiveTab('SANCTUM')}
            className={`px-2 py-1 rounded-lg ${activeTab === 'SANCTUM' ? 'text-amber-300 font-bold' : 'text-slate-400'}`}
          >
            Sanctum
          </button>
        )}
      </div>
    </header>
  );
}
