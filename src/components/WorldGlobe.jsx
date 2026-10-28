import React, { useEffect, useRef, useState } from 'react';
import { Globe, Users, Heart, Shield, Landmark, Sparkles, Navigation } from 'lucide-react';

export default function WorldGlobe({ houses, stats, onSelectHouse }) {
  const canvasRef = useRef(null);
  const [activeHouse, setActiveHouse] = useState(null);
  const [rotation, setRotation] = useState({ x: 0.2, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const [autoRotate, setAutoRotate] = useState(true);

  // Default house locations if not set
  const housePoints = (houses || []).map(h => ({
    ...h,
    lat: h.coordinates?.lat || 30,
    lng: h.coordinates?.lng || 0
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let currentRotationY = rotation.y;
    let currentRotationX = rotation.x;

    const render = () => {
      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;
      const radius = Math.min(width, height) * 0.38;
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Draw subtle starry background dots
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      for (let i = 0; i < 40; i++) {
        const sx = (Math.sin(i * 99) * 0.5 + 0.5) * width;
        const sy = (Math.cos(i * 33) * 0.5 + 0.5) * height;
        const sr = (i % 3 === 0) ? 1.5 : 0.8;
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw Globe Outer Atmospheric Glow
      const glowGrad = ctx.createRadialGradient(centerX, centerY, radius * 0.85, centerX, centerY, radius * 1.25);
      glowGrad.addColorStop(0, 'rgba(245, 158, 11, 0.12)');
      glowGrad.addColorStop(0.5, 'rgba(59, 130, 246, 0.08)');
      glowGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.25, 0, Math.PI * 2);
      ctx.fill();

      // Draw Globe Base (Ocean sphere)
      const oceanGrad = ctx.createRadialGradient(
        centerX - radius * 0.3,
        centerY - radius * 0.3,
        radius * 0.1,
        centerX,
        centerY,
        radius
      );
      oceanGrad.addColorStop(0, '#1e293b');
      oceanGrad.addColorStop(0.7, '#0f172a');
      oceanGrad.addColorStop(1, '#020617');

      ctx.fillStyle = oceanGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();

      // Clip inside sphere for lines
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.clip();

      if (autoRotate && !isDragging) {
        currentRotationY += 0.003;
      }

      // Draw Latitude & Longitude grid lines
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.1)';

      // Latitude circles
      for (let lat = -60; lat <= 60; lat += 30) {
        ctx.beginPath();
        for (let lng = -180; lng <= 180; lng += 10) {
          const phi = (90 - lat) * (Math.PI / 180);
          const theta = (lng * (Math.PI / 180)) + currentRotationY;

          // 3D coords
          const x3 = radius * Math.sin(phi) * Math.cos(theta);
          const y3 = radius * Math.cos(phi);
          const z3 = radius * Math.sin(phi) * Math.sin(theta);

          // Apply rotation X (tilt)
          const yRot = y3 * Math.cos(currentRotationX) - z3 * Math.sin(currentRotationX);
          const zRot = y3 * Math.sin(currentRotationX) + z3 * Math.cos(currentRotationX);

          if (zRot > 0) {
            const px = centerX + x3;
            const py = centerY + yRot;
            if (lng === -180) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
        }
        ctx.stroke();
      }

      // Longitude meridians
      for (let lng = -180; lng < 180; lng += 45) {
        ctx.beginPath();
        for (let lat = -90; lat <= 90; lat += 10) {
          const phi = (90 - lat) * (Math.PI / 180);
          const theta = (lng * (Math.PI / 180)) + currentRotationY;

          const x3 = radius * Math.sin(phi) * Math.cos(theta);
          const y3 = radius * Math.cos(phi);
          const z3 = radius * Math.sin(phi) * Math.sin(theta);

          const yRot = y3 * Math.cos(currentRotationX) - z3 * Math.sin(currentRotationX);
          const zRot = y3 * Math.sin(currentRotationX) + z3 * Math.cos(currentRotationX);

          if (zRot > -radius * 0.1) {
            const px = centerX + x3;
            const py = centerY + yRot;
            if (lat === -90) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
        }
        ctx.stroke();
      }

      // Draw Great Circles / Alliance trade & marriage routes between houses
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      for (let i = 0; i < housePoints.length; i++) {
        for (let j = i + 1; j < housePoints.length; j++) {
          const h1 = housePoints[i];
          const h2 = housePoints[j];
          if ((h1.alliedHouses || []).includes(h2.id)) {
            // Draw connecting arc
            const phi1 = (90 - h1.lat) * (Math.PI / 180);
            const theta1 = (h1.lng * (Math.PI / 180)) + currentRotationY;
            const x1 = radius * Math.sin(phi1) * Math.cos(theta1);
            const y1 = radius * Math.cos(phi1);
            const z1 = radius * Math.sin(phi1) * Math.sin(theta1);
            const zRot1 = y1 * Math.sin(currentRotationX) + z1 * Math.cos(currentRotationX);

            const phi2 = (90 - h2.lat) * (Math.PI / 180);
            const theta2 = (h2.lng * (Math.PI / 180)) + currentRotationY;
            const x2 = radius * Math.sin(phi2) * Math.cos(theta2);
            const y2 = radius * Math.cos(phi2);
            const z2 = radius * Math.sin(phi2) * Math.sin(theta2);
            const zRot2 = y2 * Math.sin(currentRotationX) + z2 * Math.cos(currentRotationX);

            if (zRot1 > 0 && zRot2 > 0) {
              const px1 = centerX + x1;
              const py1 = centerY + (y1 * Math.cos(currentRotationX) - z1 * Math.sin(currentRotationX));
              const px2 = centerX + x2;
              const py2 = centerY + (y2 * Math.cos(currentRotationX) - z2 * Math.sin(currentRotationX));

              ctx.strokeStyle = 'rgba(236, 72, 153, 0.4)';
              ctx.beginPath();
              ctx.moveTo(px1, py1);
              ctx.quadraticCurveTo((px1 + px2) / 2, (py1 + py2) / 2 - 25, px2, py2);
              ctx.stroke();
            }
          }
        }
      }
      ctx.setLineDash([]);

      // Draw House Pins / Crest Markers
      const renderedMarkers = [];
      housePoints.forEach(h => {
        const phi = (90 - h.lat) * (Math.PI / 180);
        const theta = (h.lng * (Math.PI / 180)) + currentRotationY;

        const x3 = radius * Math.sin(phi) * Math.cos(theta);
        const y3 = radius * Math.cos(phi);
        const z3 = radius * Math.sin(phi) * Math.sin(theta);

        const yRot = y3 * Math.cos(currentRotationX) - z3 * Math.sin(currentRotationX);
        const zRot = y3 * Math.sin(currentRotationX) + z3 * Math.cos(currentRotationX);

        if (zRot > 0) {
          const px = centerX + x3;
          const py = centerY + yRot;
          const scale = 0.7 + (zRot / radius) * 0.5;

          renderedMarkers.push({
            house: h,
            x: px,
            y: py,
            scale,
            z: zRot
          });

          // Outer pulse ring
          ctx.beginPath();
          ctx.arc(px, py, 10 * scale, 0, Math.PI * 2);
          ctx.strokeStyle = h.heraldicColor || '#f59e0b';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Inner solid core
          ctx.beginPath();
          ctx.arc(px, py, 5 * scale, 0, Math.PI * 2);
          ctx.fillStyle = h.heraldicColor || '#f59e0b';
          ctx.shadowColor = h.heraldicColor || '#f59e0b';
          ctx.shadowBlur = 10;
          ctx.fill();
          ctx.shadowBlur = 0;

          // Label
          ctx.font = `600 ${Math.max(10, Math.round(11 * scale))}px 'Cinzel', serif`;
          ctx.fillStyle = '#f8fafc';
          ctx.textAlign = 'center';
          ctx.fillText(h.name, px, py - 14 * scale);
        }
      });

      ctx.restore();

      // Atmospheric Rim Highlight
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.45)';
      ctx.stroke();
      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [houses, autoRotate, isDragging, rotation]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;

    setRotation(prev => ({
      x: Math.max(-0.8, Math.min(0.8, prev.x - dy * 0.005)),
      y: prev.y + dx * 0.005
    }));

    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 p-6 shadow-2xl">
      {/* Background Heraldic Watermark */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-5">
        <Landmark className="w-[600px] h-[600px] text-amber-500" />
      </div>

      {/* Top Header */}
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-amber-500/15 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Sparkles className="w-3.5 h-3.5" /> Worldwide Lineage Atlas
            </span>
            <span className="text-xs text-slate-400">Live Global Roll</span>
          </div>
          <h2 className="mt-2 text-2xl md:text-3xl font-bold tracking-tight font-serif-heraldic text-white">
            Houses Across The Continents
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            Spin the celestial globe to explore sovereign families, ancient clans, and diplomatic marriage treaties spanning across the globe.
          </p>
        </div>

        {/* Globe Controls */}
        <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-amber-500/20">
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
              autoRotate ? 'bg-amber-500 text-slate-950 font-semibold' : 'text-slate-300 hover:text-white'
            }`}
          >
            {autoRotate ? 'Auto-Orbiting' : 'Paused Orbit'}
          </button>
          <span className="text-xs text-slate-500">| Drag to Rotate</span>
        </div>
      </div>

      {/* Main Interactive Canvas & Quick Cards */}
      <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-6 items-center mt-6">
        {/* 3D Canvas */}
        <div
          className="lg:col-span-8 relative h-[360px] md:h-[480px] w-full flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <canvas ref={canvasRef} className="w-full h-full" />
          
          <div className="absolute bottom-3 left-4 text-xs text-slate-500 flex items-center gap-2 pointer-events-none">
            <Navigation className="w-3.5 h-3.5 text-amber-500" />
            <span>Interactive 3D Sphere Projection</span>
          </div>
        </div>

        {/* Featured Houses Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-3 max-h-[460px] overflow-y-auto pr-1">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" /> Notable Sovereign Houses
          </h3>

          {(houses || []).map(house => (
            <div
              key={house.id}
              onClick={() => onSelectHouse && onSelectHouse(house.id)}
              className="group relative p-3.5 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/40 transition-all cursor-pointer backdrop-blur-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-md border"
                    style={{
                      backgroundColor: `${house.heraldicColor}18`,
                      borderColor: `${house.heraldicColor}44`,
                      color: house.heraldicColor
                    }}
                  >
                    {house.badgeIcon || '🛡️'}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm font-serif-heraldic text-slate-100 group-hover:text-amber-300 transition-colors">
                      {house.name}
                    </h4>
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <span>{house.originCountry}</span>
                      <span>•</span>
                      <span>Est. {house.foundedYear}</span>
                    </p>
                  </div>
                </div>

                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-amber-300 border border-amber-500/20 font-mono">
                  {house.memberCount || 0} souls
                </span>
              </div>

              <p className="text-xs text-slate-400 mt-2 italic line-clamp-1 border-l-2 border-amber-500/30 pl-2">
                "{house.motto}"
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Sitewide Global Statistics Banner */}
      <div className="mt-8 pt-6 border-t border-amber-500/15 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-3.5 text-center">
          <div className="text-amber-400 mx-auto w-6 h-6 mb-1.5 flex items-center justify-center">
            <Landmark className="w-5 h-5" />
          </div>
          <div className="text-xl md:text-2xl font-bold font-serif-heraldic text-white">
            {stats?.totalHouses || 0}
          </div>
          <div className="text-xs text-slate-400 uppercase tracking-wider font-medium">Houses Enrolled</div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-3.5 text-center">
          <div className="text-emerald-400 mx-auto w-6 h-6 mb-1.5 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div className="text-xl md:text-2xl font-bold font-serif-heraldic text-emerald-400">
            {stats?.livingSouls || 0}
          </div>
          <div className="text-xs text-slate-400 uppercase tracking-wider font-medium">Living Kinfolk</div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-3.5 text-center">
          <div className="text-rose-400 mx-auto w-6 h-6 mb-1.5 flex items-center justify-center">
            <Heart className="w-5 h-5" />
          </div>
          <div className="text-xl md:text-2xl font-bold font-serif-heraldic text-rose-400">
            {stats?.sealedBonds || 0}
          </div>
          <div className="text-xs text-slate-400 uppercase tracking-wider font-medium">Sealed Marriages</div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-3.5 text-center">
          <div className="text-purple-400 mx-auto w-6 h-6 mb-1.5 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div className="text-xl md:text-2xl font-bold font-serif-heraldic text-purple-300">
            {stats?.deceasedAncestors || 0}
          </div>
          <div className="text-xs text-slate-400 uppercase tracking-wider font-medium">Revered Ancestors</div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-3.5 text-center">
          <div className="text-cyan-400 mx-auto w-6 h-6 mb-1.5 flex items-center justify-center">
            <Globe className="w-5 h-5" />
          </div>
          <div className="text-xl md:text-2xl font-bold font-serif-heraldic text-cyan-400">
            {stats?.nationsCount || 0}
          </div>
          <div className="text-xs text-slate-400 uppercase tracking-wider font-medium">Nations Connected</div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-3.5 text-center">
          <div className="text-amber-300 mx-auto w-6 h-6 mb-1.5 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="text-xl md:text-2xl font-bold font-serif-heraldic text-amber-300">
            {stats?.totalNotices || 0}
          </div>
          <div className="text-xs text-slate-400 uppercase tracking-wider font-medium">Proclamations</div>
        </div>
      </div>
    </div>
  );
}
