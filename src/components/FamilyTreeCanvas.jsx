import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Heart,
  Plus,
  Shield,
  User,
  Sparkles,
  Info,
  Calendar,
  ExternalLink,
  ChevronRight,
  Eye,
  Filter
} from 'lucide-react';

export default function FamilyTreeCanvas({
  members,
  house,
  allHouses,
  onAddMember,
  onEditMember,
  userRole,
  canEdit
}) {
  const containerRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const [selectedMember, setSelectedMember] = useState(null);
  const [filterGen, setFilterGen] = useState('ALL'); // 'ALL' | 'DIRECT' | 'G1' | 'G2' | 'G3'
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate generational levels and positions
  const { nodeLayouts, loveConnections, parentChildConnections } = useMemo(() => {
    if (!members || members.length === 0) {
      return { nodeLayouts: [], loveConnections: [], parentChildConnections: [] };
    }

    // Determine generation tiers based on ancestry
    const memberMap = new Map(members.map(m => [m.id, m]));
    const genMap = new Map();

    const getGeneration = (id, visited = new Set()) => {
      if (visited.has(id)) return 1;
      visited.add(id);
      if (genMap.has(id)) return genMap.get(id);

      const mem = memberMap.get(id);
      if (!mem) return 1;

      // If has parents
      let maxParentGen = 0;
      if (mem.fatherId && memberMap.has(mem.fatherId)) {
        maxParentGen = Math.max(maxParentGen, getGeneration(mem.fatherId, new Set(visited)));
      }
      if (mem.motherId && memberMap.has(mem.motherId)) {
        maxParentGen = Math.max(maxParentGen, getGeneration(mem.motherId, new Set(visited)));
      }

      const gen = maxParentGen > 0 ? maxParentGen + 1 : 1;
      genMap.set(id, gen);
      return gen;
    };

    members.forEach(m => getGeneration(m.id));

    // Group members by generation
    const tiers = {};
    members.forEach(m => {
      const g = genMap.get(m.id) || 1;
      if (!tiers[g]) tiers[g] = [];
      tiers[g].push(m);
    });

    // Layout configuration
    const NODE_WIDTH = 240;
    const NODE_HEIGHT = 160;
    const HORIZONTAL_GAP = 90;
    const VERTICAL_GAP = 180;
    const SPOUSE_GAP = 50;

    const layouts = [];
    const positions = new Map();
    const sortedGens = Object.keys(tiers).map(Number).sort((a, b) => a - b);

    sortedGens.forEach((gen, genIndex) => {
      const tierMembers = tiers[gen];
      const tierY = genIndex * (NODE_HEIGHT + VERTICAL_GAP) + 80;

      // To keep spouses adjacent, arrange clusters
      let currentX = 60;

      // Group members that are couples
      const placedInTier = new Set();
      const clusters = [];

      tierMembers.forEach(mem => {
        if (placedInTier.has(mem.id)) return;

        const cluster = [mem];
        placedInTier.add(mem.id);

        // Find spouses also present in this tier
        if (mem.spouses && mem.spouses.length > 0) {
          mem.spouses.forEach(sp => {
            const spouseMem = tierMembers.find(m => m.id === sp.spouseId && !placedInTier.has(m.id));
            if (spouseMem) {
              cluster.push(spouseMem);
              placedInTier.add(spouseMem.id);
            }
          });
        }
        clusters.push(cluster);
      });

      // Position clusters
      clusters.forEach((cluster) => {
        cluster.forEach((mem, idx) => {
          const x = currentX;
          const y = tierY;
          positions.set(mem.id, { x, y, width: NODE_WIDTH, height: NODE_HEIGHT, member: mem, gen });
          layouts.push({
            id: mem.id,
            x,
            y,
            width: NODE_WIDTH,
            height: NODE_HEIGHT,
            member: mem,
            gen
          });

          // If next member in cluster is spouse, smaller gap
          if (idx < cluster.length - 1) {
            currentX += NODE_WIDTH + SPOUSE_GAP;
          } else {
            currentX += NODE_WIDTH + HORIZONTAL_GAP;
          }
        });
      });
    });

    // Generate Love-styled connections between spouses
    const loveLines = [];
    const processedCouples = new Set();

    members.forEach(mem => {
      if (!mem.spouses || mem.spouses.length === 0) return;

      mem.spouses.forEach((sp, spIdx) => {
        const coupleKey = [mem.id, sp.spouseId].sort().join('___');
        if (processedCouples.has(coupleKey)) return;
        processedCouples.add(coupleKey);

        const posA = positions.get(mem.id);
        const posB = positions.get(sp.spouseId);

        if (posA && posB) {
          // Romantic Love connection line between spouses on the tree
          const startX = posA.x + posA.width;
          const startY = posA.y + posA.height * 0.45;
          const endX = posB.x;
          const endY = posB.y + posB.height * 0.45;

          const midX = (startX + endX) / 2;
          const midY = (startY + endY) / 2 - 25; // upward heart curve

          loveLines.push({
            id: `love-${coupleKey}`,
            startX,
            startY,
            endX,
            endY,
            midX,
            midY,
            status: sp.status || 'Living',
            sealStatus: sp.bondSealStatus || 'SEALED',
            notes: sp.notes || 'Married Bond',
            partnerName: sp.spouseName,
            partnerHouse: sp.spouseHouseName,
            memberA: mem,
            memberB: posB.member,
            isMultiple: mem.hasMultipleWives || mem.hasMultipleHusbands
          });
        }
      });
    });

    // Parent to Child connection lines
    const parentChildLines = [];
    members.forEach(child => {
      if (child.fatherId || child.motherId) {
        const childPos = positions.get(child.id);
        if (!childPos) return;

        const fatherPos = child.fatherId ? positions.get(child.fatherId) : null;
        const motherPos = child.motherId ? positions.get(child.motherId) : null;

        let originX, originY;

        if (fatherPos && motherPos) {
          // Drops down from the love connection center between parents!
          originX = (fatherPos.x + fatherPos.width / 2 + motherPos.x + motherPos.width / 2) / 2;
          originY = Math.max(fatherPos.y, motherPos.y) + fatherPos.height;
        } else if (fatherPos) {
          originX = fatherPos.x + fatherPos.width / 2;
          originY = fatherPos.y + fatherPos.height;
        } else if (motherPos) {
          originX = motherPos.x + motherPos.width / 2;
          originY = motherPos.y + motherPos.height;
        }

        if (originX !== undefined) {
          const targetX = childPos.x + childPos.width / 2;
          const targetY = childPos.y;

          parentChildLines.push({
            id: `pc-${child.id}`,
            originX,
            originY,
            targetX,
            targetY,
            childId: child.id
          });
        }
      }
    });

    return {
      nodeLayouts: layouts,
      loveConnections: loveLines,
      parentChildConnections: parentChildLines
    };
  }, [members]);

  // Center tree initially or on reset
  const handleReset = () => {
    setZoom(0.85);
    setPan({ x: 50, y: 30 });
  };

  useEffect(() => {
    handleReset();
  }, [house?.id]);

  // Panning handlers
  const handleMouseDown = (e) => {
    if (e.target.closest('.tree-node-card') || e.target.closest('.interactive-control')) return;
    setIsPanning(true);
    panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e) => {
    if (!isPanning) return;
    setPan({
      x: e.clientX - panStartRef.current.x,
      y: e.clientY - panStartRef.current.y
    });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Zoom handlers
  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    setZoom(prev => Math.min(2.5, Math.max(0.35, prev * zoomFactor)));
  };

  // Filtered layouts
  const visibleNodes = useMemo(() => {
    return nodeLayouts.filter(node => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesName = node.member.name.toLowerCase().includes(q);
        const matchesTitle = (node.member.title || '').toLowerCase().includes(q);
        if (!matchesName && !matchesTitle) return false;
      }
      if (filterGen === 'G1' && node.gen !== 1) return false;
      if (filterGen === 'G2' && node.gen !== 2) return false;
      if (filterGen === 'G3' && node.gen !== 3) return false;
      return true;
    });
  }, [nodeLayouts, searchQuery, filterGen]);

  return (
    <div className="relative w-full h-[760px] bg-slate-950 rounded-3xl border border-amber-500/20 overflow-hidden shadow-2xl flex flex-col select-none">
      {/* Heraldic Controls Header */}
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-slate-900/90 backdrop-blur-md border-b border-amber-500/20">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-md border"
            style={{
              backgroundColor: `${house?.heraldicColor || '#f59e0b'}20`,
              borderColor: `${house?.heraldicColor || '#f59e0b'}50`,
              color: house?.heraldicColor || '#f59e0b'
            }}
          >
            {house?.badgeIcon || '🦁'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg md:text-xl font-bold font-serif-heraldic text-white">
                {house?.name || 'Ancestral Lineage'} Tree
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 font-medium">
                Dynamic Responsive Pan & Zoom
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Couples bonded with romance arcs • Male polygyny supported • Inter-house alliances sealed
            </p>
          </div>
        </div>

        {/* Search, Filter & Zoom Toolbar */}
        <div className="flex items-center flex-wrap gap-2 interactive-control">
          {/* Quick Search */}
          <input
            type="text"
            placeholder="Search kinsman..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-950/80 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 w-36 md:w-44"
          />

          {/* Generation Filter */}
          <select
            value={filterGen}
            onChange={(e) => setFilterGen(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-950/80 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">All Generations</option>
            <option value="G1">Gen 1: Patriarchs</option>
            <option value="G2">Gen 2: Current Era</option>
            <option value="G3">Gen 3 & 4: Heirs</option>
          </select>

          {/* Add Member Button (For Head or Site Owner) */}
          {canEdit && (
            <button
              onClick={() => onAddMember && onAddMember()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:brightness-110 shadow-lg shadow-amber-500/20 transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Enroll Kinsman
            </button>
          )}

          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-slate-950/80 border border-slate-700/80 rounded-xl p-1">
            <button
              onClick={() => setZoom(prev => Math.min(2.5, prev + 0.15))}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono text-slate-400 px-1">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom(prev => Math.max(0.35, prev - 0.15))}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleReset}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-amber-400"
              title="Reset View"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Canvas Viewport with Pan & Zoom */}
      <div
        ref={containerRef}
        className="relative flex-1 w-full h-full cursor-grab active:cursor-grabbing overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        {/* Subtle Heraldic Grid Wallpaper */}
        <div
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage: `radial-gradient(rgba(245, 158, 11, 0.3) 1px, transparent 1px)`,
            backgroundSize: `${32 * zoom}px ${32 * zoom}px`,
            backgroundPosition: `${pan.x}px ${pan.y}px`
          }}
        />

        {/* Transformed Stage */}
        <div
          className="absolute inset-0 origin-top-left transition-transform duration-75"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`
          }}
        >
          {/* SVG Overlay for Connections */}
          <svg className="absolute top-0 left-0 w-[5000px] h-[5000px] pointer-events-none overflow-visible">
            <defs>
              {/* Romantic Love Gradient for Married Couples */}
              <linearGradient id="loveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="50%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#fb7185" />
              </linearGradient>

              {/* Alliance Gold Gradient */}
              <linearGradient id="allianceGoldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#fbbf24" />
              </linearGradient>

              {/* Parent-Child Dropdown Gradient */}
              <linearGradient id="lineageGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.5" />
              </linearGradient>

              {/* Glowing Heart Filter */}
              <filter id="heartGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#f43f5e" floodOpacity="0.8" />
              </filter>
            </defs>

            {/* 1. Parent to Child Lineage Paths */}
            {parentChildConnections.map(line => {
              const deltaY = line.targetY - line.originY;
              const curveMidY = line.originY + deltaY * 0.5;

              // Orthogonal curved path from parent bond down to child
              const pathD = `M ${line.originX} ${line.originY}
                             C ${line.originX} ${curveMidY},
                               ${line.targetX} ${curveMidY},
                               ${line.targetX} ${line.targetY}`;

              return (
                <g key={line.id}>
                  <path
                    d={pathD}
                    fill="none"
                    stroke="url(#lineageGradient)"
                    strokeWidth="2.5"
                    strokeDasharray="5,3"
                    className="opacity-70"
                  />
                  {/* Branch junction bead */}
                  <circle cx={line.targetX} cy={line.targetY} r="3.5" fill="#38bdf8" />
                </g>
              );
            })}

            {/* 2. Love-Styled Connection Lines for Married / Bonded Couples */}
            {loveConnections.map(love => {
              const dx = love.endX - love.startX;
              // Arc curvature
              const pathD = `M ${love.startX} ${love.startY}
                             C ${love.startX + dx * 0.25} ${love.midY},
                               ${love.endX - dx * 0.25} ${love.midY},
                               ${love.endX} ${love.endY}`;

              const isDivorced = love.status === 'Divorced';
              const strokeColor = isDivorced ? '#94a3b8' : 'url(#loveGradient)';

              return (
                <g key={love.id} className="cursor-pointer">
                  {/* Glowing Romantic Path */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={isDivorced ? '2' : '3.5'}
                    strokeDasharray={isDivorced ? '6,4' : 'none'}
                    filter={isDivorced ? 'none' : 'url(#heartGlow)'}
                    className="transition-all"
                  />

                  {/* Romantic Heart Badge in the middle of the couple connection */}
                  <g transform={`translate(${love.midX}, ${love.midY})`}>
                    <circle
                      cx="0"
                      cy="0"
                      r="16"
                      fill={isDivorced ? '#1e293b' : '#881337'}
                      stroke={isDivorced ? '#64748b' : '#f43f5e'}
                      strokeWidth="2"
                      className="shadow-xl"
                    />
                    <text
                      x="0"
                      y="4"
                      textAnchor="middle"
                      fontSize="13"
                      className={isDivorced ? '' : 'heart-pulse'}
                    >
                      {isDivorced ? '💔' : '❤️'}
                    </text>
                  </g>

                  {/* Status Banner above heart */}
                  <g transform={`translate(${love.midX}, ${love.midY - 24})`}>
                    <rect
                      x="-55"
                      y="-11"
                      width="110"
                      height="20"
                      rx="10"
                      fill="rgba(15, 23, 42, 0.9)"
                      stroke={isDivorced ? '#64748b' : '#f43f5e'}
                      strokeWidth="1"
                    />
                    <text
                      x="0"
                      y="3"
                      textAnchor="middle"
                      fill={isDivorced ? '#94a3b8' : '#fbcfe8'}
                      fontSize="9.5"
                      fontFamily="sans-serif"
                      fontWeight="600"
                    >
                      {love.status === 'Divorced' ? 'Divorced' : (love.isMultiple ? '💍 Sovereign Wife' : '❤️ Sealed Bond')}
                    </text>
                  </g>
                </g>
              );
            })}
          </svg>

          {/* Member Node Cards */}
          {visibleNodes.map(node => {
            const m = node.member;
            const isMale = m.gender === 'Male';
            const isDeceased = !m.isLiving;
            const hasMultipleWives = m.hasMultipleWives;
            const hasMultipleHusbands = m.hasMultipleHusbands;

            return (
              <div
                key={node.id}
                style={{
                  left: `${node.x}px`,
                  top: `${node.y}px`,
                  width: `${node.width}px`
                }}
                className={`tree-node-card absolute rounded-2xl p-4 transition-all duration-200 select-none cursor-pointer group shadow-xl ${
                  isDeceased
                    ? 'bg-slate-900/90 border border-slate-700/70 hover:border-slate-500'
                    : 'glass-panel-gold hover:border-amber-400 hover:shadow-amber-500/20'
                }`}
                onClick={() => setSelectedMember(m)}
              >
                {/* Generation Pill */}
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[10px] font-mono tracking-widest uppercase px-2 py-0.5 rounded-full bg-slate-950/80 text-amber-400 border border-amber-500/20">
                    Gen {node.gen}
                  </span>

                  {/* Living / Deceased indicator */}
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      isDeceased
                        ? 'bg-slate-800 text-slate-400 border border-slate-600'
                        : 'bg-emerald-950/70 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isDeceased ? 'bg-slate-400' : 'bg-emerald-400 animate-pulse'
                      }`}
                    />
                    {isDeceased ? 'Deceased' : 'Living'}
                  </span>
                </div>

                {/* Member Identity Header */}
                <div className="flex items-start gap-3">
                  {/* Portrait with Heraldic Border */}
                  <div className="relative">
                    <img
                      src={m.avatar || (isMale ? 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' : 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150')}
                      alt={m.name}
                      className="w-12 h-12 rounded-xl object-cover border-2 border-amber-500/40 shadow-md group-hover:border-amber-400 transition-colors"
                    />
                    <div
                      className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow ${
                        isMale ? 'bg-blue-600' : 'bg-pink-600'
                      }`}
                    >
                      {isMale ? '♂' : '♀'}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold font-serif-heraldic text-white group-hover:text-amber-300 transition-colors truncate">
                      {m.name}
                    </h3>
                    <p className="text-xs text-amber-400/90 truncate font-medium">
                      {m.title || 'Noble Kinsman'}
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {m.birthDate?.slice(0, 4)} {isDeceased ? `— ${m.deathDate?.slice(0, 4) || '†'}` : '— Present'}
                    </p>
                  </div>
                </div>

                {/* Marital Status & Spouses Overview */}
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-col gap-1 text-[11px]">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1 font-medium">
                      <Heart className="w-3 h-3 text-rose-400" />
                      <span>{m.maritalStatus || 'Single'}</span>
                    </span>

                    {/* Multiple Spouses Badge */}
                    {hasMultipleWives && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                        Multiple Wives
                      </span>
                    )}

                    {hasMultipleHusbands && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                        Widowed / Remarried
                      </span>
                    )}
                  </div>

                  {/* List spouses mini-tags if any */}
                  {m.spouses && m.spouses.length > 0 && (
                    <div className="flex flex-col gap-1 mt-1">
                      {m.spouses.map((s, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between px-2 py-1 rounded-lg bg-slate-950/70 text-[10px] text-slate-300 border border-slate-800"
                        >
                          <span className="truncate max-w-[120px] font-medium">
                            {s.status === 'Divorced' ? '💔' : '💍'} {s.spouseName}
                          </span>
                          <span className="text-slate-500 text-[9px] font-mono">
                            {s.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Widowed / Divorced notes for Females */}
                  {!isMale && m.maritalStatus !== 'Single' && m.spouses?.some(s => s.notes) && (
                    <div className="text-[10px] text-amber-300/80 italic mt-0.5 truncate">
                      {m.spouses[0]?.notes}
                    </div>
                  )}
                </div>

                {/* Action Footer */}
                <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                  <span className="text-[10px] text-amber-500/80 group-hover:text-amber-400 flex items-center gap-1">
                    <Info className="w-3 h-3" /> Inspect Lineage
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Member Detail Modal Drawer */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-3xl border border-amber-500/30 glass-panel-gold p-6 text-white shadow-2xl animate-in fade-in zoom-in-95">
            <button
              onClick={() => setSelectedMember(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white text-lg w-8 h-8 rounded-full bg-slate-800/80 flex items-center justify-center"
            >
              ✕
            </button>

            <div className="flex items-start gap-4 border-b border-amber-500/20 pb-5">
              <img
                src={selectedMember.avatar}
                alt={selectedMember.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-500 shadow-lg"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold font-serif-heraldic text-amber-300">
                    {selectedMember.name}
                  </h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700">
                    {selectedMember.gender}
                  </span>
                </div>
                <p className="text-sm text-slate-300 font-medium">{selectedMember.title}</p>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  Born: {selectedMember.birthDate} {!selectedMember.isLiving && `• Deceased: ${selectedMember.deathDate}`}
                </p>
              </div>
            </div>

            <div className="py-4 space-y-4">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400">Biography & Chronicle</h4>
                <p className="text-sm text-slate-300 mt-1 leading-relaxed">
                  {selectedMember.bio || 'Honored records and lineage deeds kept within the Sovereign Hall.'}
                </p>
              </div>

              {/* Parents */}
              <div className="grid grid-cols-2 gap-3 bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
                <div>
                  <span className="text-[11px] text-slate-400 font-medium">Biological Father</span>
                  <p className="text-xs font-semibold text-slate-200 mt-0.5">
                    {members.find(m => m.id === selectedMember.fatherId)?.name || 'Root Patriarch / Unlisted'}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-medium">Biological Mother</span>
                  <p className="text-xs font-semibold text-slate-200 mt-0.5">
                    {members.find(m => m.id === selectedMember.motherId)?.name || 'Root Matriarch / Unlisted'}
                  </p>
                </div>
              </div>

              {/* Spouses List */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5" /> Marital Bonds & Alliances
                </h4>
                {selectedMember.spouses && selectedMember.spouses.length > 0 ? (
                  <div className="mt-2 space-y-2">
                    {selectedMember.spouses.map((s, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between"
                      >
                        <div>
                          <div className="text-sm font-semibold text-white flex items-center gap-1.5">
                            <span>{s.status === 'Divorced' ? '💔' : '💍'}</span>
                            <span>{s.spouseName}</span>
                          </div>
                          <p className="text-xs text-amber-400/90">
                            {s.spouseHouseName || 'Allied House'} • Married: {s.marriageDate || 'Historic'}
                          </p>
                          {s.notes && (
                            <p className="text-xs text-slate-400 italic mt-0.5">{s.notes}</p>
                          )}
                        </div>
                        <span className="text-xs px-2.5 py-1 rounded-full bg-slate-950 font-mono text-amber-300 border border-amber-500/20">
                          {s.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 mt-1 italic">Single / No registered marital bond.</p>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-amber-500/20 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedMember(null)}
                className="px-4 py-2 text-xs font-medium rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                Close Chronicle
              </button>
              {canEdit && (
                <button
                  onClick={() => {
                    const mem = selectedMember;
                    setSelectedMember(null);
                    onEditMember && onEditMember(mem);
                  }}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors"
                >
                  Edit Information
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
