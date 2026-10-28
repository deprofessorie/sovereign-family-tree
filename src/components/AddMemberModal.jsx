import React, { useState, useMemo } from 'react';
import {
  Heart,
  Plus,
  Trash2,
  Shield,
  User,
  Sparkles,
  Building,
  Info,
  Calendar,
  AlertCircle
} from 'lucide-react';

export default function AddMemberModal({
  house,
  houses,
  allMembers,
  onClose,
  onSubmit
}) {
  // Personal Info Form
  const [name, setName] = useState('');
  const [gender, setGender] = useState('Male'); // 'Male' | 'Female'
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
  // value can be an existing house ID or 'NEW_HOUSE'
  const [selectedSpouseHouseId, setSelectedSpouseHouseId] = useState('');

  // If selectedSpouseHouseId === 'NEW_HOUSE', fields for founding new house:
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
  const [spouseStatus, setSpouseStatus] = useState('Living'); // Living | Divorced | Deceased

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

  // Filter father candidates: ONLY males from this house or all houses
  const eligibleFathers = useMemo(() => {
    return allMembers.filter(m => m.gender === 'Male');
  }, [allMembers]);

  // Filter mother candidates: ONLY females from this house or all houses
  const eligibleMothers = useMemo(() => {
    return allMembers.filter(m => m.gender === 'Female');
  }, [allMembers]);

  // When selecting existing house for spouse:
  // Take gender/sex into consideration and show list of members of opposite sex!
  const oppositeSexMembersOfSelectedHouse = useMemo(() => {
    if (!selectedSpouseHouseId || selectedSpouseHouseId === 'NEW_HOUSE') return [];
    const targetGender = gender === 'Male' ? 'Female' : 'Male';
    return allMembers.filter(m => m.houseId === selectedSpouseHouseId && m.gender === targetGender);
  }, [allMembers, selectedSpouseHouseId, gender]);

  // Helper for adding extra wife row for males
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
      // Build spouses array
      let spouses = [];
      let newSpouseFoundingHouse = null;

      if (maritalStatus !== 'Single') {
        if (selectedSpouseHouseId === 'NEW_HOUSE') {
          if (!newHouseName.trim() || !newHouseSpouseName.trim()) {
            throw new Error('Please provide the new house name and spouse name.');
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
          // Existing house selected
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

        // Additional wives for Male if multiple wives = Yes
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

        // Additional husbands for Female if Widowed / Divorced and hasMultipleHusbands = Yes
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl border-2 border-amber-500/30 glass-panel-gold p-6 md:p-8 text-white shadow-2xl my-8 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white text-lg w-8 h-8 rounded-full bg-slate-800/80 flex items-center justify-center"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-amber-500/20 pb-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-md border"
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
            <p className="text-xs text-slate-400">
              Heraldic registration with gender lineage filters, multi-spouse protocols & house founding
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* SECTION 1: Personal Identification */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> 1. Personal Identity & Heraldry
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Full Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lady Genevieve Stirling"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-950/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Noble Title / Family Role
                </label>
                <input
                  type="text"
                  placeholder="e.g. Warden of the Archive, Physician"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-950/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Gender Selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Gender / Sex <span className="text-rose-400">*</span>
                </label>
                <select
                  value={gender}
                  onChange={(e) => {
                    setGender(e.target.value);
                    setSelectedOppositeSexMemberId('');
                  }}
                  className="w-full px-3.5 py-2 text-xs bg-slate-950/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Male">♂ Male</option>
                  <option value="Female">♀ Female</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Birth Date
                </label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-950/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Status in the Realm
                </label>
                <div className="flex items-center gap-3 pt-1.5">
                  <label className="flex items-center gap-1.5 text-xs text-emerald-400 cursor-pointer">
                    <input
                      type="radio"
                      name="isLiving"
                      checked={isLiving === true}
                      onChange={() => setIsLiving(true)}
                    />
                    <span>Living</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
                    <input
                      type="radio"
                      name="isLiving"
                      checked={isLiving === false}
                      onChange={() => setIsLiving(false)}
                    />
                    <span>Deceased Ancestor</span>
                  </label>
                </div>
              </div>
            </div>

            {!isLiving && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Date of Passing (†)
                </label>
                <input
                  type="date"
                  value={deathDate}
                  onChange={(e) => setDeathDate(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-950/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Portrait / Avatar URL
              </label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-950/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* SECTION 2: Parents Lineage Filtering */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" /> 2. Parents of Lineage (Strict Gender Filtering)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Father: ONLY Males displayed */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Father <span className="text-[10px] text-blue-400 font-mono">(Males Only)</span>
                </label>
                <select
                  value={fatherId}
                  onChange={(e) => setFatherId(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-950/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="">-- No Father / Founding Root Patriarch --</option>
                  {eligibleFathers.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.houseId.replace('house-', '').toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              {/* Mother: ONLY Females displayed */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Mother <span className="text-[10px] text-pink-400 font-mono">(Females Only)</span>
                </label>
                <select
                  value={motherId}
                  onChange={(e) => setMotherId(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-950/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
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

          {/* SECTION 3: Marital Status & Detailed Spouse Routing */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5" /> 3. Marital Status & Alliance Bonds
              </h4>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Marital Status <span className="text-rose-400">*</span>
              </label>
              <select
                value={maritalStatus}
                onChange={(e) => setMaritalStatus(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-950/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Single">Single (No Spouse Fields)</option>
                <option value="Married">Married</option>
                <option value="Widowed">Widowed</option>
                <option value="Divorced">Divorced</option>
                <option value="Engaged">Betrothed / Engaged</option>
              </select>
            </div>

            {/* IF SINGLE: Prompt explicitly says "don't show fields related to married members" */}
            {maritalStatus === 'Single' ? (
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 italic">
                Member registered as Single. No spouse fields displayed.
              </div>
            ) : (
              /* IF NOT SINGLE: Show spouse information fields as specified */
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-rose-500/30 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider">
                    Spouse House Selection
                  </span>
                </div>

                {/* Select Spouse House */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Select Spouse's House from Archive:
                  </label>
                  <select
                    value={selectedSpouseHouseId}
                    onChange={(e) => {
                      setSelectedSpouseHouseId(e.target.value);
                      setSelectedOppositeSexMemberId('');
                    }}
                    className="w-full px-3.5 py-2 text-xs bg-slate-950/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
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

                {/* CONDITION 1: IF HOUSE NOT IN ARCHIVE -> PROMPT TO FOUND NEW HOUSE */}
                {selectedSpouseHouseId === 'NEW_HOUSE' && (
                  <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/40 space-y-3">
                    <div className="flex items-center gap-2 text-purple-300 font-semibold text-xs">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      <span>Founding New House for Spouse</span>
                    </div>
                    <p className="text-[11px] text-purple-200/80">
                      ⚡ <em>Important Protocol:</em> When a new family is founded here, the added spouse will be appointed <strong>Temporary Head</strong> of that house! Auto-generated login details will be issued to your archives dispatch.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-slate-300 mb-1">Spouse Full Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="Spouse Name"
                          value={newHouseSpouseName}
                          onChange={(e) => setNewHouseSpouseName(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-purple-700/60 rounded-lg text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-300 mb-1">New House Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. House Lancaster"
                          value={newHouseName}
                          onChange={(e) => setNewHouseName(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-purple-700/60 rounded-lg text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-slate-300 mb-1">Origin Country</label>
                        <input
                          type="text"
                          placeholder="e.g. England, Italy, Canada"
                          value={newHouseCountry}
                          onChange={(e) => setNewHouseCountry(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-purple-700/60 rounded-lg text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-300 mb-1">House Motto</label>
                        <input
                          type="text"
                          placeholder="e.g. Courage and Honor"
                          value={newHouseMotto}
                          onChange={(e) => setNewHouseMotto(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-purple-700/60 rounded-lg text-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* CONDITION 2: IF EXISTING HOUSE SELECTED -> SHOW OPPOSITE-SEX MEMBERS OF THAT HOUSE */}
                {selectedSpouseHouseId && selectedSpouseHouseId !== 'NEW_HOUSE' && (
                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Select Spouse ({gender === 'Male' ? '♀ Females of House' : '♂ Males of House'}):
                      </label>
                      <select
                        value={selectedOppositeSexMemberId}
                        onChange={(e) => setSelectedOppositeSexMemberId(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs bg-slate-950/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
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
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          Custom Spouse Name:
                        </label>
                        <input
                          type="text"
                          placeholder="Enter spouse name"
                          value={manualSpouseName}
                          onChange={(e) => setManualSpouseName(e.target.value)}
                          className="w-full px-3.5 py-2 text-xs bg-slate-950/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Marriage Date</label>
                        <input
                          type="date"
                          value={marriageDate}
                          onChange={(e) => setMarriageDate(e.target.value)}
                          className="w-full px-3.5 py-2 text-xs bg-slate-950/80 border border-slate-700 rounded-xl text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Spouse Status</label>
                        <select
                          value={spouseStatus}
                          onChange={(e) => setSpouseStatus(e.target.value)}
                          className="w-full px-3.5 py-2 text-xs bg-slate-950/80 border border-slate-700 rounded-xl text-white"
                        >
                          <option value="Living">Living</option>
                          <option value="Divorced">Divorced</option>
                          <option value="Deceased">Deceased</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* FOR MALE MEMBERS: Multiple Wives radio question [Yes / No] */}
                {gender === 'Male' && (
                  <div className="pt-3 border-t border-slate-800 space-y-3">
                    <label className="block text-xs font-semibold text-amber-300">
                      Does this male member have multiple wives? (Living, Divorced, Deceased)
                    </label>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-1.5 text-xs text-slate-200 cursor-pointer">
                        <input
                          type="radio"
                          name="multipleWivesRadio"
                          value="No"
                          checked={hasMultipleWives === 'No'}
                          onChange={() => setHasMultipleWives('No')}
                        />
                        <span>No (Single union)</span>
                      </label>
                      <label className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold cursor-pointer">
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

                    {/* Dynamic repeater for multiple wives */}
                    {hasMultipleWives === 'Yes' && (
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-300 font-medium">Additional Wives Register:</span>
                          <button
                            type="button"
                            onClick={handleAddWifeRow}
                            className="px-2.5 py-1 text-xs rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" /> Add Wife
                          </button>
                        </div>

                        {additionalWives.map((wife, index) => (
                          <div
                            key={index}
                            className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2 text-xs"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-amber-400">Wife #{index + 2}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveWifeRow(index)}
                                className="text-rose-400 hover:text-rose-300"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                              <input
                                type="text"
                                placeholder="Wife's Full Name"
                                value={wife.spouseName}
                                onChange={(e) => handleWifeChange(index, 'spouseName', e.target.value)}
                                className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                              />
                              <select
                                value={wife.spouseHouseId}
                                onChange={(e) => handleWifeChange(index, 'spouseHouseId', e.target.value)}
                                className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                              >
                                {houses.map(h => (
                                  <option key={h.id} value={h.id}>
                                    {h.name}
                                  </option>
                                ))}
                              </select>
                              <select
                                value={wife.status}
                                onChange={(e) => handleWifeChange(index, 'status', e.target.value)}
                                className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
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
                  <div className="pt-3 border-t border-slate-800 space-y-3">
                    <label className="block text-xs font-semibold text-amber-300">
                      Record prior or subsequent marriages? (Widow of whom / Divorced of whom)
                    </label>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-1.5 text-xs text-slate-200 cursor-pointer">
                        <input
                          type="radio"
                          name="femaleMultipleRadio"
                          value="No"
                          checked={hasMultipleHusbands === 'No'}
                          onChange={() => setHasMultipleHusbands('No')}
                        />
                        <span>No</span>
                      </label>
                      <label className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold cursor-pointer">
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
                      <div className="space-y-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <div>
                          <label className="block text-[11px] text-slate-300 mb-1">
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
                              className="px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white"
                            />
                            <select
                              value={multipleHusbandNotes.deceasedHusbandHouseId}
                              onChange={(e) => setMultipleHusbandNotes({
                                ...multipleHusbandNotes,
                                deceasedHusbandHouseId: e.target.value
                              })}
                              className="px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white"
                            >
                              <option value="">-- Husband's House --</option>
                              {houses.map(h => (
                                <option key={h.id} value={h.id}>{h.name}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-300 mb-1">
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
                              className="px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white"
                            />
                            <select
                              value={multipleHusbandNotes.divorcedHusbandHouseId}
                              onChange={(e) => setMultipleHusbandNotes({
                                ...multipleHusbandNotes,
                                divorcedHusbandHouseId: e.target.value
                              })}
                              className="px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white"
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

          {/* Form Submission */}
          <div className="pt-4 border-t border-amber-500/20 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-slate-950 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
            >
              {loading ? 'Inscribing in Sovereign Roll...' : 'Enroll Kinsman into Roll'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
