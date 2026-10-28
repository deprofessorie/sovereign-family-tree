import React, { useState } from 'react';
import { Calendar, MapPin, Users, Plus, Clock, Sparkles } from 'lucide-react';

export default function EventBoard({
  events,
  house,
  userRole,
  onCreateEvent,
  onRsvpEvent
}) {
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('2026-12-25');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('REUNION');
  const [isGlobal, setIsGlobal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    await onCreateEvent({
      houseId: house?.id || 'house-stirling',
      title,
      description,
      date,
      location,
      type,
      isGlobal: userRole === 'KEEPER' ? isGlobal : false
    });

    setTitle('');
    setDescription('');
    setIsCreating(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-3xl border border-amber-500/20 bg-slate-900/90 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold font-serif-heraldic text-white">
              Sovereign Events & Conclaves
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Clan gatherings, royal weddings, ancestral memorials & biennial international congresses
            </p>
          </div>
        </div>

        {userRole !== 'VISITOR' && (
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:brightness-110 shadow-lg shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" /> Summon Conclave
          </button>
        )}
      </div>

      {/* Events List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {(events || []).map(event => (
          <div
            key={event.id}
            className="p-5 rounded-3xl border border-slate-800 bg-slate-900/60 hover:border-amber-500/40 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-800 text-amber-300 border border-slate-700">
                  {event.type}
                </span>

                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>{event.date}</span>
                </div>
              </div>

              <h3 className="text-base font-bold font-serif-heraldic text-white">
                {event.title}
              </h3>

              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                {event.description}
              </p>

              <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">{event.location}</span>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-semibold text-slate-200">{event.rsvpCount || 0}</span> Attendees
              </span>

              <button
                onClick={() => onRsvpEvent && onRsvpEvent(event.id)}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/20 transition-all"
              >
                RSVP Attendance
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Event Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-3xl border border-amber-500/30 glass-panel-gold p-6 text-white shadow-2xl">
            <button
              onClick={() => setIsCreating(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white text-lg w-8 h-8 rounded-full bg-slate-800/80 flex items-center justify-center"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 border-b border-amber-500/20 pb-4">
              <Calendar className="w-6 h-6 text-amber-400" />
              <h3 className="text-lg font-bold font-serif-heraldic">Summon New Conclave</h3>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Solstice Feast"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-950/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Conclave Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white"
                  >
                    <option value="REUNION">Clan Reunion</option>
                    <option value="WEDDING">Royal Wedding</option>
                    <option value="COUNCIL">Sovereign Council</option>
                    <option value="MEMORIAL">Ancestral Memorial</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Hall / Location</label>
                <input
                  type="text"
                  placeholder="e.g. Great Castle Hall / Streaming Room"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-950/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Description & Assembly Details</label>
                <textarea
                  rows={3}
                  placeholder="Summoning details, dress code, order of heralds..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-950/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors"
                >
                  Dispatch Summons
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
