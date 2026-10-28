import React, { useState, useMemo } from 'react';
import {
  Heart,
  Plus,
  Trash2,
  Shield,
  User,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export default function AddMemberModal({
  house,
  houses,
  allMembers,
  onClose,
  onSubmit
}) {
  const [name, setName] = useState('');
  const [gender, setGender] = useState('Male');
  const [title, setTitle] = useState('');
  const [birthDate, setBirthDate] = useState('1990-01-01');
  const [isLiving, setIsLiving] = useState(true);
  const [deathDate, setDeathDate] = useState('');
  const [avatar, setAvatar] = useState('');
  const [bio, setBio] = useState('');

  // Parents:
  // Father: ONLY Males
  // Mother: ONLY Females
  const [fatherId, setFatherId] = useState('');
  const [motherId, setMotherId] = useState('');

  // Marital Status: Single | Married | Widowed | Divorced | Engaged
  const [maritalStatus, setMaritalStatus] = useState('Single');

  // If not Single -> Spouse House Selection
  const [selectedSpouseHouseId, setSelectedSpouseHouseId] = useState('');

  // If selectedSpouseHouseId === 'NEW_HOUSE'
  const [newHouseName, setNewHouseName] = useState('');
  const [newHouseCountry, setNewHouseCountry] = useState('');
  const [newHouseCity, setNewHouseCity] = useState('');
  const [newHouseMotto, setNewHouseMotto] = useState('');
  const [newHouseColor, setNewHouseColor] = useState('#8b5cf6');
  const [newHouseBadge, setNewHouseBadge] = useState('👑');
  const [newHouseSpouseName, setNewHouseSpouseName] = useState('');

  // If selected existing house -> select member of opposite sex
  const [selectedOppositeSexMemberId, setSelectedOppositeSexMemberId] = useState('');
  const [manualSpouseName, setManualSpouseName] = useState('');
  const [marriageDate, setMarriageDate] = useState('2015-06-20');
  const [spouseStatus, setSpouseStatus] = useState('Living');

  // Male members: Multiple Wives radio question [Yes / No]
  const [hasMultipleWives, setHasMultipleWives] = useState('No');
  const [additionalWives, setAdditionalWives] = useState([]);

  // Female members: Multiple Husbands options ONLY if Widowed or Divorced
  const [hasMultipleHusbands, setHasMultipleHusbands] = useState('No');
  const [multipleHusbandNotes, setMultipleHusbandNotes] = useState({
    deceasedHusbandName: '',
    deceasedHusbandHouseId: '',
    divorcedHusbandName: '',
    divorcedHusbandHouseId: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const eligibleFathers = useMemo(() => {
    return allMembers.filter(m => m.gender === 'Male');
  }, [allMembers]);

  const eligibleMothers = useMemo(() => {
    return allMembers.filter(m => m.gender === 'Female');
  }, [allMembers]);

  const oppositeSexMembersOfSelectedHouse = useMemo(() => {
    if (!selectedSpouseHouseId || selectedSpouseHouseId === 'NEW_HOUSE') return [];
    const targetGender = gender === 'Male' ? 'Female' : 'Male';
    return allMembers.filter(m => m.houseId === selectedSpouseHouseId && m.gender === targetGender);
  }, [allMembers, selectedSpouseHouseId, gender]);

  const handleAddWifeRow = () => {
    setAdditionalWives([
      ...additionalWives,
      {
        spouseName: '',
        spouseHouseId: house.id,
        marriageDate: '',
        status: 'Living',
        notes: ''
      }
    ]);
  };

  const handleRemoveWifeRow = (index) => {
    setAdditionalWives(additionalWives.filter((_, i) => i !== index));
  };

  const handleWifeChange = (index, field, value) => {
    const updated = [...additionalWives];
    updated[index][field] = value;
    setAdditionalWives(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Member name is required.');
      return;
    }

    setLoading(true);

    try {
      let spouses = [];
      let newSpouseFoundingHouse = null;

      if (maritalStatus !== 'Single') {
        if (selectedSpouseHouseId === 'NEW_HOUSE') {
          if (!newHouseName.trim() || !newHouseSpouseName.trim()) {
            throw new Error('Please provide both the new house name and spouse name.');
          }
          newSpouseFoundingHouse = {
            name: newHouseName,
            originCountry: newHouseCountry || 'International',
            originCity: newHouseCity,
            motto: newHouseMotto,
            heraldicColor: newHouseColor,
            badgeIcon: newHouseBadge,
            spouseName: newHouseSpouseName
          };
        } else if (selectedSpouseHouseId) {
          let spouseName = manualSpouseName;
          let spouseId = null;

          if (selectedOppositeSexMemberId && selectedOppositeSexMemberId !== 'MANUAL') {
            const foundOpposite = allMembers.find(m => m.id === selectedOppositeSexMemberId);
            if (foundOpposite) {
              spouseName = foundOpposite.name;
              spouseId = foundOpposite.id;
            }
          }

          if (!spouseName) {
            throw new Error('Please select or specify the spouse name.');
          }

          const spouseHouse = houses.find(h => h.id === selectedSpouseHouseId);

          let primaryNotes = '';
          if (gender === 'Female') {
            if (maritalStatus === 'Widowed') {
              primaryNotes = `Widow of ${spouseName}`;
            } else if (maritalStatus === 'Divorced') {
              primaryNotes = `Divorced of ${spouseName}`;
            }
          }

          spouses.push({
            spouseId,
            spouseName,
            spouseHouseId: selectedSpouseHouseId,
            spouseHouseName: spouseHouse?.name || 'Allied House',
            marriageDate,
            status: spouseStatus,
            bondSealStatus: 'PENDING',
            notes: primaryNotes
          });
        }

        if (gender === 'Male' && hasMultipleWives === 'Yes') {
          additionalWives.forEach((w, idx) => {
            if (w.spouseName.trim()) {
              const spHouse = houses.find(h => h.id === w.spouseHouseId);
              spouses.push({
                spouseId: null,
                spouseName: w.spouseName,
                spouseHouseId: w.spouseHouseId,
                spouseHouseName: spHouse?.name || 'House',
                marriageDate: w.marriageDate,
                status: w.status,
                bondSealStatus: 'PENDING',
                notes: `Wife #${idx + 2} (${w.status})`
              });
            }
          });
        }

        if (gender === 'Female' && (maritalStatus === 'Widowed' || maritalStatus === 'Divorced') && hasMultipleHusbands === 'Yes') {
          if (multipleHusbandNotes.deceasedHusbandName) {
            const hHouse = houses.find(h => h.id === multipleHusbandNotes.deceasedHusbandHouseId);
            spouses.push({
              spouseId: null,
              spouseName: multipleHusbandNotes.deceasedHusbandName,
              spouseHouseId: multipleHusbandNotes.deceasedHusbandHouseId,
              spouseHouseName: hHouse?.name || 'Allied House',
              marriageDate: '',
              status: 'Deceased',
              bondSealStatus: 'SEALED',
              notes: `Widow of ${multipleHusbandNotes.deceasedHusbandName}`
            });
          }
          if (multipleHusbandNotes.divorcedHusbandName) {
            const hHouse = houses.find(h => h.id === multipleHusbandNotes.divorcedHusbandHouseId);
            spouses.push({
              spouseId: null,
              spouseName: multipleHusbandNotes.divorcedHusbandName,
              spouseHouseId: multipleHusbandNotes.divorcedHusbandHouseId,
              spouseHouseName: hHouse?.name || 'Allied House',
              marriageDate: '',
              status: 'Divorced',
              bondSealStatus: 'SEALED',
              notes: `Divorced of ${multipleHusbandNotes.divorcedHusbandName}`
            });
          }
        }
      }

      await onSubmit({
        houseId: house.id,
        name,
        gender,
        title,
        birthDate,
        isLiving,
        deathDate: isLiving ? null : deathDate,
        avatar,
        bio,
        fatherId: fatherId || null,
        motherId: motherId || null,
        maritalStatus,
        hasMultipleWives: gender === 'Male' && hasMultipleWives === 'Yes',
        hasMultipleHusbands: gender === 'Female' && (maritalStatus === 'Widowed' || maritalStatus === 'Divorced') && hasMultipleHusbands === 'Yes',
        spouses,
        newSpouseFoundingHouse
      });

      onClose();
    } catch (err) {
      setError(err.message || 'Error adding member.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl apple-liquid-glass p-6 md:p-8 text-white shadow-2xl my-8 animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
        {/* Grabber */}
        <div className="w-12 h-1.5 rounded-full bg-white/20 mx-auto mb-4" />

        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-300 hover:text-white text-sm w-9 h-9 rounded-full bg-white/10 hover:bg-white/15 flex items-center justify-center apple-touch-target"
          aria-label="Dismiss sheet"
        >
          ✕
        </button>

        {/* Sheet Header */}
        <div className="flex items-center gap-3.5 border-b border-white/10 pb-5">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow border border-white/15"
            style={{
              backgroundColor: `${house.heraldicColor}20`,
              borderColor: `${house.heraldicColor}50`,
              color: house.heraldicColor
            }}
          >
            {house.badgeIcon || '🛡️'}
          </div>
          <div>
            <h3 className="text-xl font-bold font-serif-heraldic text-white">
              Enroll Member into {house.name}
            </h3>
            <p className="text-xs text-slate-300">
              Heraldic registration with gender lineage filters, multi-spouse protocols & house founding
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3.5 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-xs text-rose-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* SECTION 1: Personal Identity */}
          <div className="bg-black/30 p-4 rounded-2xl border border-white/10 space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> 1. Personal Identity & Heraldry
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                  Full Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lady Genevieve Stirling"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-950/90 border border-white/15 rounded-xl text-white focus:outline-none focus:border-amber-400 min-h-[42px]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                  Noble Title / Family Role
                </label>
                <input
                  type="text"
                  placeholder="e.g. Warden of the Archive, Physician"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-950/90 border border-white/15 rounded-xl text-white focus:outline-none focus:border-amber-400 min-h-[42px]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                  Gender / Sex <span className="text-rose-400">*</span>
                </label>
                <select
                  value={gender}
                  onChange={(e) => {
                    setGender(e.target.value);
                    setSelectedOppositeSexMemberId('');
                  }}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-950/90 border border-white/15 rounded-xl text-white focus:outline-none focus:border-amber-400 min-h-[42px]"
                >
                  <option value="Male">♂ Male</option>
                  <option value="Female">♀ Female</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                  Birth Date
                </label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-950/90 border border-white/15 rounded-xl text-white focus:outline-none focus:border-amber-400 min-h-[42px]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                  Status in Realm
                </label>
                <div className="flex items-center gap-3 pt-2">
                  <label className="flex items-center gap-1.5 text-xs text-emerald-300 font-medium cursor-pointer apple-touch-target min-h-[36px]">
                    <input
                      type="radio"
                      name="isLiving"
                      checked={isLiving === true}
                      onChange={() => setIsLiving(true)}
                    />
                    <span>Living</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-slate-300 font-medium cursor-pointer apple-touch-target min-h-[36px]">
                    <input
                      type="radio"
                      name="isLiving"
                      checked={isLiving === false}
                      onChange={() => setIsLiving(false)}
                    />
                    <span>Deceased</span>
                  </label>
                </div>
              </div>
            </div>

            {!isLiving && (
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                  Date of Passing (†)
                </label>
                <input
                  type="date"
                  value={deathDate}
                  onChange={(e) => setDeathDate(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-950/90 border border-white/15 rounded-xl text-white focus:outline-none focus:border-amber-400 min-h-[42px]"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                Portrait URL (Optional)
              </label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-950/90 border border-white/15 rounded-xl text-white focus:outline-none focus:border-amber-400 min-h-[42px]"
              />
            </div>
          </div>

          {/* SECTION 2: Parents Lineage (Strict Gender Filtering) */}
          <div className="bg-black/30 p-4 rounded-2xl border border-white/10 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" /> 2. Parents of Lineage (Strict Gender Filtering)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Father: ONLY Males */}
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                  Biological Father <span className="text-[10px] text-sky-400 font-mono">(Males Only)</span>
                </label>
                <select
                  value={fatherId}
                  onChange={(e) => setFatherId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-950/90 border border-white/15 rounded-xl text-white focus:outline-none focus:border-amber-400 min-h-[42px]"
                >
                  <option value="">-- No Father / Founding Root Patriarch --</option>
                  {eligibleFathers.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.houseId.replace('house-', '').toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              {/* Mother: ONLY Females */}
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                  Biological Mother <span className="text-[10px] text-pink-400 font-mono">(Females Only)</span>
                </label>
                <select
                  value={motherId}
                  onChange={(e) => setMotherId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-950/90 border border-white/15 rounded-xl text-white focus:outline-none focus:border-amber-400 min-h-[42px]"
                >
                  <option value="">-- No Mother / Founding Root Matriarch --</option>
                  {eligibleMothers.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.houseId.replace('house-', '').toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 3: Marital Status & Detailed Routing */}
          <div className="bg-black/30 p-4 rounded-2xl border border-white/10 space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5" /> 3. Marital Status & Spousal Alliance
            </h4>

            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                Marital Status <span className="text-rose-400">*</span>
              </label>
              <select
                value={maritalStatus}
                onChange={(e) => setMaritalStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-950/90 border border-white/15 rounded-xl text-white focus:outline-none focus:border-amber-400 min-h-[42px]"
              >
                <option value="Single">Single (Hides all spouse fields)</option>
                <option value="Married">Married</option>
                <option value="Widowed">Widowed</option>
                <option value="Divorced">Divorced</option>
                <option value="Engaged">Betrothed / Engaged</option>
              </select>
            </div>

            {/* IF SINGLE: Prompt explicitly says "don't show fields related to married members" */}
            {maritalStatus === 'Single' ? (
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 italic">
                Member registered as Single. No spouse fields displayed.
              </div>
            ) : (
              /* IF NOT SINGLE: Show spouse information fields as specified */
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-amber-300 mb-1.5">
                    Select Spouse's House from Archive:
                  </label>
                  <select
                    value={selectedSpouseHouseId}
                    onChange={(e) => {
                      setSelectedSpouseHouseId(e.target.value);
                      setSelectedOppositeSexMemberId('');
                    }}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-950/90 border border-white/15 rounded-xl text-white focus:outline-none focus:border-amber-400 min-h-[42px]"
                  >
                    <option value="">-- Choose Existing House from Archive --</option>
                    {houses.map(h => (
                      <option key={h.id} value={h.id}>
                        {h.badgeIcon || '🛡️'} {h.name} ({h.originCountry})
                      </option>
                    ))}
                    <option value="NEW_HOUSE">➕ [House not in archive? Found New House for Spouse]</option>
                  </select>
                </div>

                {/* CONDITION 1: IF NEW HOUSE */}
                {selectedSpouseHouseId === 'NEW_HOUSE' && (
                  <div className="p-4 rounded-2xl bg-purple-950/50 border border-purple-500/40 space-y-3">
                    <div className="flex items-center gap-2 text-purple-200 font-semibold text-xs">
                      <Sparkles className="w-4 h-4 text-purple-300" />
                      <span>Founding New House for Spouse</span>
                    </div>
                    <p className="text-[11px] text-purple-200 leading-relaxed">
                      ⚡ <em>Sovereign Protocol:</em> The added spouse will automatically be appointed <strong>Temporary Head</strong> of this newly chartered house! Auto-generated login credentials will be dispatched to your archive.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-200 mb-1">Spouse Full Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="Spouse Name"
                          value={newHouseSpouseName}
                          onChange={(e) => setNewHouseSpouseName(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-slate-950 border border-purple-500/40 rounded-xl text-white min-h-[38px]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-200 mb-1">New House Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. House Lancaster"
                          value={newHouseName}
                          onChange={(e) => setNewHouseName(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-slate-950 border border-purple-500/40 rounded-xl text-white min-h-[38px]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-200 mb-1">Origin Country</label>
                        <input
                          type="text"
                          placeholder="e.g. England, Italy, Canada"
                          value={newHouseCountry}
                          onChange={(e) => setNewHouseCountry(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-slate-950 border border-purple-500/40 rounded-xl text-white min-h-[38px]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-200 mb-1">House Motto</label>
                        <input
                          type="text"
                          placeholder="e.g. Courage and Honor"
                          value={newHouseMotto}
                          onChange={(e) => setNewHouseMotto(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-slate-950 border border-purple-500/40 rounded-xl text-white min-h-[38px]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* CONDITION 2: IF EXISTING HOUSE SELECTED */}
                {selectedSpouseHouseId && selectedSpouseHouseId !== 'NEW_HOUSE' && (
                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                        Select Spouse ({gender === 'Male' ? '♀ Females of House' : '♂ Males of House'}):
                      </label>
                      <select
                        value={selectedOppositeSexMemberId}
                        onChange={(e) => setSelectedOppositeSexMemberId(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-950/90 border border-white/15 rounded-xl text-white focus:outline-none focus:border-amber-400 min-h-[42px]"
                      >
                        <option value="">-- Choose registered opposite-sex kinsman --</option>
                        {oppositeSexMembersOfSelectedHouse.map(opp => (
                          <option key={opp.id} value={opp.id}>
                            {opp.name} ({opp.title || 'Kinsman'})
                          </option>
                        ))}
                        <option value="MANUAL">✍️ Enter Custom Spouse Name for this House</option>
                      </select>
                    </div>

                    {(!selectedOppositeSexMemberId || selectedOppositeSexMemberId === 'MANUAL') && (
                      <div>
                        <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                          Custom Spouse Name:
                        </label>
                        <input
                          type="text"
                          placeholder="Enter spouse name"
                          value={manualSpouseName}
                          onChange={(e) => setManualSpouseName(e.target.value)}
                          className="w-full px-3.5 py-2.5 text-xs bg-slate-950/90 border border-white/15 rounded-xl text-white focus:outline-none focus:border-amber-400 min-h-[42px]"
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-200 mb-1.5">Marriage Date</label>
                        <input
                          type="date"
                          value={marriageDate}
                          onChange={(e) => setMarriageDate(e.target.value)}
                          className="w-full px-3.5 py-2 text-xs bg-slate-950/90 border border-white/15 rounded-xl text-white min-h-[42px]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-200 mb-1.5">Spouse Status</label>
                        <select
                          value={spouseStatus}
                          onChange={(e) => setSpouseStatus(e.target.value)}
                          className="w-full px-3.5 py-2.5 text-xs bg-slate-950/90 border border-white/15 rounded-xl text-white min-h-[42px]"
                        >
                          <option value="Living">Living</option>
                          <option value="Divorced">Divorced</option>
                          <option value="Deceased">Deceased</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* FOR MALE MEMBERS: Multiple Wives */}
                {gender === 'Male' && (
                  <div className="pt-3 border-t border-white/10 space-y-3">
                    <label className="block text-xs font-semibold text-amber-300">
                      Does this male member have multiple wives? (Living, Divorced, Deceased)
                    </label>
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 text-xs text-slate-200 font-medium cursor-pointer apple-touch-target min-h-[36px]">
                        <input
                          type="radio"
                          name="multipleWivesRadio"
                          value="No"
                          checked={hasMultipleWives === 'No'}
                          onChange={() => setHasMultipleWives('No')}
                        />
                        <span>No (Single union)</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs text-amber-300 font-bold cursor-pointer apple-touch-target min-h-[36px]">
                        <input
                          type="radio"
                          name="multipleWivesRadio"
                          value="Yes"
                          checked={hasMultipleWives === 'Yes'}
                          onChange={() => setHasMultipleWives('Yes')}
                        />
                        <span>Yes (Support Multiple Wives)</span>
                      </label>
                    </div>

                    {hasMultipleWives === 'Yes' && (
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-300 font-medium">Additional Wives Register:</span>
                          <button
                            type="button"
                            onClick={handleAddWifeRow}
                            className="px-3 py-1.5 text-xs rounded-xl bg-white/10 text-amber-300 border border-white/15 hover:bg-white/15 flex items-center gap-1 apple-touch-target min-h-[36px]"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add Wife
                          </button>
                        </div>

                        {additionalWives.map((wife, index) => (
                          <div
                            key={index}
                            className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2 text-xs"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-amber-400">Wife #{index + 2}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveWifeRow(index)}
                                className="text-rose-400 hover:text-rose-300 p-1 apple-touch-target min-w-[32px] min-h-[32px]"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                              <input
                                type="text"
                                placeholder="Wife's Full Name"
                                value={wife.spouseName}
                                onChange={(e) => handleWifeChange(index, 'spouseName', e.target.value)}
                                className="px-3 py-2 bg-slate-900 border border-white/15 rounded-xl text-white min-h-[38px]"
                              />
                              <select
                                value={wife.spouseHouseId}
                                onChange={(e) => handleWifeChange(index, 'spouseHouseId', e.target.value)}
                                className="px-3 py-2 bg-slate-900 border border-white/15 rounded-xl text-white min-h-[38px]"
                              >
                                {houses.map(h => (
                                  <option key={h.id} value={h.id}>{h.name}</option>
                                ))}
                              </select>
                              <select
                                value={wife.status}
                                onChange={(e) => handleWifeChange(index, 'status', e.target.value)}
                                className="px-3 py-2 bg-slate-900 border border-white/15 rounded-xl text-white min-h-[38px]"
                              >
                                <option value="Living">Living</option>
                                <option value="Divorced">Divorced</option>
                                <option value="Deceased">Deceased</option>
                              </select>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* FOR FEMALE MEMBERS: Multiple Husbands ONLY if Widowed or Divorced */}
                {gender === 'Female' && (maritalStatus === 'Widowed' || maritalStatus === 'Divorced') && (
                  <div className="pt-3 border-t border-white/10 space-y-3">
                    <label className="block text-xs font-semibold text-amber-300">
                      Record prior marriages? (Widow of whom / Divorced of whom)
                    </label>
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 text-xs text-slate-200 font-medium cursor-pointer apple-touch-target min-h-[36px]">
                        <input
                          type="radio"
                          name="femaleMultipleRadio"
                          value="No"
                          checked={hasMultipleHusbands === 'No'}
                          onChange={() => setHasMultipleHusbands('No')}
                        />
                        <span>No</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs text-amber-300 font-bold cursor-pointer apple-touch-target min-h-[36px]">
                        <input
                          type="radio"
                          name="femaleMultipleRadio"
                          value="Yes"
                          checked={hasMultipleHusbands === 'Yes'}
                          onChange={() => setHasMultipleHusbands('Yes')}
                        />
                        <span>Yes (Detail prior husbands)</span>
                      </label>
                    </div>

                    {hasMultipleHusbands === 'Yes' && (
                      <div className="space-y-3 p-3.5 rounded-2xl bg-black/40 border border-white/10">
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">
                            🕊️ "Widow of whom":
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              placeholder="Late Husband's Name"
                              value={multipleHusbandNotes.deceasedHusbandName}
                              onChange={(e) => setMultipleHusbandNotes({
                                ...multipleHusbandNotes,
                                deceasedHusbandName: e.target.value
                              })}
                              className="px-3 py-2 text-xs bg-slate-900 border border-white/15 rounded-xl text-white min-h-[38px]"
                            />
                            <select
                              value={multipleHusbandNotes.deceasedHusbandHouseId}
                              onChange={(e) => setMultipleHusbandNotes({
                                ...multipleHusbandNotes,
                                deceasedHusbandHouseId: e.target.value
                              })}
                              className="px-3 py-2 text-xs bg-slate-900 border border-white/15 rounded-xl text-white min-h-[38px]"
                            >
                              <option value="">-- Husband's House --</option>
                              {houses.map(h => (
                                <option key={h.id} value={h.id}>{h.name}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">
                            💔 "Divorced of whom":
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              placeholder="Former Husband's Name"
                              value={multipleHusbandNotes.divorcedHusbandName}
                              onChange={(e) => setMultipleHusbandNotes({
                                ...multipleHusbandNotes,
                                divorcedHusbandName: e.target.value
                              })}
                              className="px-3 py-2 text-xs bg-slate-900 border border-white/15 rounded-xl text-white min-h-[38px]"
                            />
                            <select
                              value={multipleHusbandNotes.divorcedHusbandHouseId}
                              onChange={(e) => setMultipleHusbandNotes({
                                ...multipleHusbandNotes,
                                divorcedHusbandHouseId: e.target.value
                              })}
                              className="px-3 py-2 text-xs bg-slate-900 border border-white/15 rounded-xl text-white min-h-[38px]"
                            >
                              <option value="">-- Former House --</option>
                              {houses.map(h => (
                                <option key={h.id} value={h.id}>{h.name}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Apple HIG Form Actions */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 apple-touch-target min-h-[44px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition-all disabled:opacity-50 apple-touch-target min-h-[44px]"
            >
              {loading ? 'Enrolling...' : 'Enroll Kinsman into Roll'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
