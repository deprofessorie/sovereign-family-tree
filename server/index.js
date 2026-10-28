import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { store } from './data/store.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Helper to generate referral code
function generateReferralCode(houseName) {
  const prefix = houseName.replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 8) || 'HOUSE';
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${rand}`;
}

// -------------------------------------------------------------
// STATS & WORLDWIDE OVERVIEW
// -------------------------------------------------------------
app.get('/api/stats', (req, res) => {
  const data = store.get();
  const totalHouses = data.houses.length;
  const totalMembers = data.members.length;
  const livingSouls = data.members.filter(m => m.isLiving).length;
  const deceasedAncestors = totalMembers - livingSouls;
  const sealedBonds = data.marriageBonds.filter(b => b.status === 'SEALED').length;
  const pendingBonds = data.marriageBonds.filter(b => b.status === 'PENDING').length;
  const totalNotices = data.notices.length;
  const totalEvents = data.events.length;
  const nations = new Set(data.houses.map(h => h.originCountry.split(',').pop().trim()));

  res.json({
    totalHouses,
    totalMembers,
    livingSouls,
    deceasedAncestors,
    sealedBonds,
    pendingBonds,
    totalNotices,
    totalEvents,
    nationsCount: nations.size
  });
});

// -------------------------------------------------------------
// HOUSES
// -------------------------------------------------------------
app.get('/api/houses', (req, res) => {
  const data = store.get();
  // enrich with member count
  const housesWithCounts = data.houses.map(h => {
    const memberCount = data.members.filter(m => m.houseId === h.id).length;
    return {
      ...h,
      memberCount
    };
  });
  res.json(housesWithCounts);
});

app.get('/api/houses/:id', (req, res) => {
  const data = store.get();
  const house = data.houses.find(h => h.id === req.params.id);
  if (!house) {
    return res.status(404).json({ error: 'House not found' });
  }
  const members = data.members.filter(m => m.houseId === house.id);
  const alliedHouseDetails = data.houses.filter(h => (house.alliedHouses || []).includes(h.id));
  const houseNotices = data.notices.filter(n => n.houseId === house.id || n.isGlobal);
  const houseEvents = data.events.filter(e => e.houseId === house.id || e.isGlobal);
  const houseKeyFigures = data.keyFigures.filter(kf => kf.houseId === house.id);
  const houseBonds = data.marriageBonds.filter(b => b.husbandHouseId === house.id || b.wifeHouseId === house.id);

  res.json({
    ...house,
    memberCount: members.length,
    members,
    alliedHousesData: alliedHouseDetails,
    notices: houseNotices,
    events: houseEvents,
    keyFigures: houseKeyFigures,
    marriageBonds: houseBonds
  });
});

// Found a new House
app.post('/api/houses', (req, res) => {
  const data = store.get();
  const { name, motto, originCountry, originCity, foundedYear, crestSymbol, heraldicColor, badgeIcon, description, headName } = req.body;

  if (!name || !originCountry) {
    return res.status(400).json({ error: 'House name and origin country are required' });
  }

  const id = `house-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`;
  const referralCode = generateReferralCode(name);

  const newHouse = {
    id,
    name,
    motto: motto || 'Wisdom, Honor and Endurance',
    originCountry,
    originCity: originCity || originCountry,
    foundedYear: parseInt(foundedYear, 10) || new Date().getFullYear(),
    crestSymbol: crestSymbol || 'Shield & Laurel',
    heraldicColor: heraldicColor || '#f59e0b',
    badgeIcon: badgeIcon || '🛡️',
    headMemberId: null,
    headRoleTitle: 'Founder & Patriarch',
    referralCode,
    description: description || `Newly registered sovereign house founded in ${originCountry}.`,
    coordinates: {
      lat: 20 + Math.random() * 40 * (Math.random() > 0.5 ? 1 : -1),
      lng: -20 + Math.random() * 120 * (Math.random() > 0.5 ? 1 : -1)
    },
    isApproved: true,
    alliedHouses: []
  };

  // If headName provided, create founder member
  if (headName) {
    const founderId = `m-${id}-founder`;
    const founderMember = {
      id: founderId,
      houseId: id,
      name: headName,
      gender: 'Male',
      title: 'Founding Lord',
      birthDate: '1980-01-01',
      deathDate: null,
      isLiving: true,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&fit=crop&q=80',
      bio: `Founding patriarch of ${name}.`,
      fatherId: null,
      motherId: null,
      maritalStatus: 'Single',
      spouses: [],
      isTemporaryHead: false
    };
    newHouse.headMemberId = founderId;
    data.members.push(founderMember);
  }

  data.houses.push(newHouse);
  store.save();

  res.status(201).json(newHouse);
});

// Update House (House Head or Site Owner)
app.put('/api/houses/:id', (req, res) => {
  const data = store.get();
  const index = data.houses.findIndex(h => h.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'House not found' });
  }

  data.houses[index] = {
    ...data.houses[index],
    ...req.body
  };
  store.save();
  res.json(data.houses[index]);
});

// Delete House (Site Owner / Keeper of Archive only)
app.delete('/api/houses/:id', (req, res) => {
  const data = store.get();
  const houseId = req.params.id;
  data.houses = data.houses.filter(h => h.id !== houseId);
  data.members = data.members.filter(m => m.houseId !== houseId);
  data.notices = data.notices.filter(n => n.houseId !== houseId);
  data.events = data.events.filter(e => e.houseId !== houseId);
  data.keyFigures = data.keyFigures.filter(kf => kf.houseId !== houseId);
  data.marriageBonds = data.marriageBonds.filter(b => b.husbandHouseId !== houseId && b.wifeHouseId !== houseId);
  store.save();
  res.json({ success: true, message: 'House and associated archives erased.' });
});

// -------------------------------------------------------------
// MEMBERS & DETAILED MARITAL STATUS LOGIC
// -------------------------------------------------------------
app.get('/api/members', (req, res) => {
  const data = store.get();
  const { houseId } = req.query;
  if (houseId) {
    return res.json(data.members.filter(m => m.houseId === houseId));
  }
  res.json(data.members);
});

app.post('/api/members', (req, res) => {
  const data = store.get();
  const {
    houseId,
    name,
    gender,
    title,
    birthDate,
    deathDate,
    isLiving,
    avatar,
    bio,
    fatherId,
    motherId,
    maritalStatus,
    hasMultipleWives,
    hasMultipleHusbands,
    spouses,
    newSpouseFoundingHouse
  } = req.body;

  if (!houseId || !name || !gender) {
    return res.status(400).json({ error: 'House, name, and gender are required.' });
  }

  // Validate father is male if provided
  if (fatherId) {
    const father = data.members.find(m => m.id === fatherId);
    if (father && father.gender !== 'Male') {
      return res.status(400).json({ error: 'Father must be Male.' });
    }
  }

  // Validate mother is female if provided
  if (motherId) {
    const mother = data.members.find(m => m.id === motherId);
    if (mother && mother.gender !== 'Female') {
      return res.status(400).json({ error: 'Mother must be Female.' });
    }
  }

  const newMemberId = `m-${houseId.replace('house-', '')}-${Date.now().toString().slice(-5)}`;
  let generatedSpouseCredentials = null;
  let createdNewHouse = null;

  // Process Marital Status Logic
  let processedSpouses = [];

  if (maritalStatus !== 'Single' && (Array.isArray(spouses) || newSpouseFoundingHouse)) {
    // If the member added a spouse and founded a new house for them:
    if (newSpouseFoundingHouse && newSpouseFoundingHouse.name) {
      const newHouseId = `house-${newSpouseFoundingHouse.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`;
      const refCode = generateReferralCode(newSpouseFoundingHouse.name);

      const tempPassword = `House${Math.floor(100000 + Math.random() * 900000)}!`;
      const tempEmail = `spouse.${newSpouseFoundingHouse.name.toLowerCase().replace(/[^a-z]/g, '')}@sovereigntree.realm`;
      const claimToken = `CLAIM-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

      // Create new House with newly added spouse as Temporary Head
      createdNewHouse = {
        id: newHouseId,
        name: newSpouseFoundingHouse.name,
        motto: newSpouseFoundingHouse.motto || 'Honor Above All',
        originCountry: newSpouseFoundingHouse.originCountry || 'International',
        originCity: newSpouseFoundingHouse.originCity || 'Ancestral Seat',
        foundedYear: new Date().getFullYear(),
        crestSymbol: newSpouseFoundingHouse.crestSymbol || 'Laurel Wreath & Star',
        heraldicColor: newSpouseFoundingHouse.heraldicColor || '#8b5cf6',
        badgeIcon: newSpouseFoundingHouse.badgeIcon || '👑',
        headMemberId: null, // will be set to spouse member
        headRoleTitle: 'Temporary House Head',
        referralCode: refCode,
        description: `Newly chartered house founded upon alliance with House ${houseId}. Managed by Temporary Head awaiting sovereign decoration.`,
        coordinates: {
          lat: 10 + Math.random() * 50,
          lng: -30 + Math.random() * 100
        },
        isApproved: true,
        alliedHouses: [houseId]
      };

      // Create member entry for the spouse in that new house
      const spouseGender = gender === 'Male' ? 'Female' : 'Male';
      const spouseMemberId = `m-${newHouseId.replace('house-', '')}-temphead`;
      const spouseMember = {
        id: spouseMemberId,
        houseId: newHouseId,
        name: newSpouseFoundingHouse.spouseName || 'Spouse & Consort',
        gender: spouseGender,
        title: 'Temporary Head of House',
        birthDate: '1990-01-01',
        deathDate: null,
        isLiving: true,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&fit=crop&q=80',
        bio: `Temporary head and spouse allied with ${name}. Received credentials to claim and decorate the house.`,
        fatherId: null,
        motherId: null,
        maritalStatus: 'Married',
        spouses: [
          {
            spouseId: newMemberId,
            spouseName: name,
            spouseHouseId: houseId,
            spouseHouseName: data.houses.find(h => h.id === houseId)?.name || 'House',
            marriageDate: new Date().toISOString().split('T')[0],
            status: 'Living',
            bondSealStatus: 'SEALED',
            notes: 'Marriage Bond Sealed at Founding'
          }
        ],
        isTemporaryHead: true,
        tempCredentials: {
          email: tempEmail,
          password: tempPassword,
          claimToken
        }
      };

      createdNewHouse.headMemberId = spouseMemberId;
      data.houses.push(createdNewHouse);
      data.members.push(spouseMember);

      // Record temporary house claim dispatch
      generatedSpouseCredentials = {
        houseId: newHouseId,
        houseName: createdNewHouse.name,
        spouseName: spouseMember.name,
        email: tempEmail,
        password: tempPassword,
        claimToken,
        recipientNotice: `Auto-generated login details prepared for ${spouseMember.name}. Forwarded to ${name}'s verified archives dispatch.`
      };

      data.temporaryHouseClaims.push({
        ...generatedSpouseCredentials,
        createdAt: new Date().toISOString()
      });

      // Also create Marriage Bond record
      const bondRecord = {
        id: `bond-${Date.now().toString().slice(-6)}`,
        husbandId: gender === 'Male' ? newMemberId : spouseMemberId,
        husbandName: gender === 'Male' ? name : spouseMember.name,
        husbandHouseId: gender === 'Male' ? houseId : newHouseId,
        wifeId: gender === 'Female' ? newMemberId : spouseMemberId,
        wifeName: gender === 'Female' ? name : spouseMember.name,
        wifeHouseId: gender === 'Female' ? houseId : newHouseId,
        proposedDate: new Date().toISOString().split('T')[0],
        sealedDate: new Date().toISOString().split('T')[0],
        status: 'SEALED',
        approvedByHouseA: true,
        approvedByHouseB: true,
        approvedByKeeper: true,
        pactTitle: `Founding Alliance: ${createdNewHouse.name} & ${data.houses.find(h => h.id === houseId)?.name}`,
        notes: 'Alliance sealed during house founding.'
      };
      data.marriageBonds.push(bondRecord);

      // Add as spouse to the newly created member
      processedSpouses.push({
        spouseId: spouseMemberId,
        spouseName: spouseMember.name,
        spouseHouseId: newHouseId,
        spouseHouseName: createdNewHouse.name,
        marriageDate: new Date().toISOString().split('T')[0],
        status: 'Living',
        bondSealStatus: 'SEALED',
        notes: 'Temporary Head of newly founded House'
      });
    } else {
      // Normal existing spouses
      for (const sp of spouses) {
        if (!sp.spouseName) continue;
        processedSpouses.push({
          spouseId: sp.spouseId || `sp-${Date.now().toString().slice(-4)}`,
          spouseName: sp.spouseName,
          spouseHouseId: sp.spouseHouseId || houseId,
          spouseHouseName: sp.spouseHouseName || data.houses.find(h => h.id === sp.spouseHouseId)?.name || 'Allied House',
          marriageDate: sp.marriageDate || '',
          status: sp.status || 'Living',
          bondSealStatus: sp.bondSealStatus || 'PENDING',
          notes: sp.notes || ''
        });

        // If from another house, create marriage bond if not existing
        if (sp.spouseHouseId && sp.spouseHouseId !== houseId && sp.spouseId) {
          const exists = data.marriageBonds.some(b => 
            (b.husbandId === newMemberId && b.wifeId === sp.spouseId) ||
            (b.husbandId === sp.spouseId && b.wifeId === newMemberId)
          );
          if (!exists) {
            data.marriageBonds.push({
              id: `bond-${Date.now().toString().slice(-6)}`,
              husbandId: gender === 'Male' ? newMemberId : sp.spouseId,
              husbandName: gender === 'Male' ? name : sp.spouseName,
              husbandHouseId: gender === 'Male' ? houseId : sp.spouseHouseId,
              wifeId: gender === 'Female' ? newMemberId : sp.spouseId,
              wifeName: gender === 'Female' ? name : sp.spouseName,
              wifeHouseId: gender === 'Female' ? houseId : sp.spouseHouseId,
              proposedDate: new Date().toISOString().split('T')[0],
              sealedDate: null,
              status: 'PENDING',
              approvedByHouseA: true,
              approvedByHouseB: false,
              approvedByKeeper: false,
              pactTitle: `Inter-House Alliance: House ${houseId} & ${sp.spouseHouseName}`,
              notes: 'Pending confirmation by both house heads or archive keeper.'
            });
          }
        }
      }
    }
  }

  const newMember = {
    id: newMemberId,
    houseId,
    name,
    gender,
    title: title || 'Honored Kinsman',
    birthDate: birthDate || '1995-01-01',
    deathDate: isLiving ? null : (deathDate || null),
    isLiving: isLiving !== undefined ? isLiving : true,
    avatar: avatar || (gender === 'Male' 
      ? 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&fit=crop&q=80'
      : 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&fit=crop&q=80'),
    bio: bio || `Dedicated member of House ${houseId}.`,
    fatherId: fatherId || null,
    motherId: motherId || null,
    maritalStatus: maritalStatus || 'Single',
    hasMultipleWives: gender === 'Male' && hasMultipleWives ? true : false,
    hasMultipleHusbands: gender === 'Female' && (maritalStatus === 'Widowed' || maritalStatus === 'Divorced') && hasMultipleHusbands ? true : false,
    spouses: maritalStatus === 'Single' ? [] : processedSpouses,
    isTemporaryHead: false
  };

  data.members.push(newMember);
  store.save();

  res.status(201).json({
    member: newMember,
    createdNewHouse,
    generatedSpouseCredentials
  });
});

app.put('/api/members/:id', (req, res) => {
  const data = store.get();
  const index = data.members.findIndex(m => m.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Member not found' });
  }

  data.members[index] = {
    ...data.members[index],
    ...req.body
  };
  store.save();
  res.json(data.members[index]);
});

app.delete('/api/members/:id', (req, res) => {
  const data = store.get();
  const memberId = req.params.id;
  data.members = data.members.filter(m => m.id !== memberId);
  // Remove reference as father/mother in children
  data.members.forEach(m => {
    if (m.fatherId === memberId) m.fatherId = null;
    if (m.motherId === memberId) m.motherId = null;
    if (Array.isArray(m.spouses)) {
      m.spouses = m.spouses.filter(s => s.spouseId !== memberId);
    }
  });
  store.save();
  res.json({ success: true, message: 'Member roll updated.' });
});

// -------------------------------------------------------------
// MARRIAGE BONDS & ALLIANCES
// -------------------------------------------------------------
app.get('/api/marriage-bonds', (req, res) => {
  const data = store.get();
  res.json(data.marriageBonds);
});

// Seal a marriage bond (Approved by Head of House A, House B, or Keeper)
app.post('/api/marriage-bonds/:id/seal', (req, res) => {
  const data = store.get();
  const bond = data.marriageBonds.find(b => b.id === req.params.id);
  if (!bond) {
    return res.status(404).json({ error: 'Marriage bond not found.' });
  }

  const { role, userHouseId } = req.body; // e.g. 'KEEPER' or 'HEAD'

  if (role === 'KEEPER') {
    bond.approvedByKeeper = true;
    bond.approvedByHouseA = true;
    bond.approvedByHouseB = true;
    bond.status = 'SEALED';
    bond.sealedDate = new Date().toISOString().split('T')[0];
  } else if (role === 'HEAD') {
    if (userHouseId === bond.husbandHouseId) {
      bond.approvedByHouseA = true;
    }
    if (userHouseId === bond.wifeHouseId) {
      bond.approvedByHouseB = true;
    }
    if (bond.approvedByHouseA && bond.approvedByHouseB) {
      bond.status = 'SEALED';
      bond.sealedDate = new Date().toISOString().split('T')[0];
    }
  }

  // Update corresponding spouse entries in members
  data.members.forEach(m => {
    if (m.id === bond.husbandId || m.id === bond.wifeId) {
      m.spouses.forEach(s => {
        if (s.spouseId === bond.husbandId || s.spouseId === bond.wifeId) {
          s.bondSealStatus = bond.status;
        }
      });
    }
  });

  store.save();
  res.json({ bond, message: bond.status === 'SEALED' ? 'The Bond of Marriage is Sealed and Proclaimed!' : 'House approval recorded.' });
});

// -------------------------------------------------------------
// NOTICE BOARD & PROCLAMATIONS
// -------------------------------------------------------------
app.get('/api/notices', (req, res) => {
  const data = store.get();
  const { houseId } = req.query;
  let notices = data.notices;
  if (houseId) {
    notices = notices.filter(n => n.houseId === houseId || n.isGlobal);
  }
  res.json(notices.sort((a, b) => new Date(b.date) - new Date(a.date)));
});

app.post('/api/notices', (req, res) => {
  const data = store.get();
  const { houseId, authorId, authorName, title, content, type, isGlobal, role } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required.' });
  }

  // If posted by regular member, requires head approval unless posted by Head or Keeper
  const isApproved = (role === 'KEEPER' || role === 'HEAD' || isGlobal);

  const newNotice = {
    id: `notice-${Date.now().toString().slice(-6)}`,
    houseId: isGlobal ? 'GLOBAL' : (houseId || 'house-stirling'),
    authorId: authorId || 'user-1',
    authorName: authorName || 'House Steward',
    title,
    content,
    type: type || 'ANNOUNCEMENT',
    date: new Date().toISOString().split('T')[0],
    isGlobal: Boolean(isGlobal),
    isApproved,
    likes: 0
  };

  data.notices.unshift(newNotice);
  store.save();
  res.status(201).json(newNotice);
});

app.put('/api/notices/:id/approve', (req, res) => {
  const data = store.get();
  const notice = data.notices.find(n => n.id === req.params.id);
  if (!notice) return res.status(404).json({ error: 'Notice not found.' });
  notice.isApproved = true;
  store.save();
  res.json(notice);
});

app.post('/api/notices/:id/like', (req, res) => {
  const data = store.get();
  const notice = data.notices.find(n => n.id === req.params.id);
  if (!notice) return res.status(404).json({ error: 'Notice not found.' });
  notice.likes = (notice.likes || 0) + 1;
  store.save();
  res.json(notice);
});

// -------------------------------------------------------------
// EVENT BOARD
// -------------------------------------------------------------
app.get('/api/events', (req, res) => {
  const data = store.get();
  const { houseId } = req.query;
  let events = data.events;
  if (houseId) {
    events = events.filter(e => e.houseId === houseId || e.isGlobal);
  }
  res.json(events);
});

app.post('/api/events', (req, res) => {
  const data = store.get();
  const { houseId, title, description, date, location, type, isGlobal } = req.body;

  const newEvent = {
    id: `event-${Date.now().toString().slice(-6)}`,
    houseId: isGlobal ? 'GLOBAL' : (houseId || 'house-stirling'),
    title,
    description,
    date: date || new Date().toISOString().split('T')[0],
    location: location || 'Ancestral Hall',
    type: type || 'REUNION',
    rsvpCount: 1,
    isGlobal: Boolean(isGlobal),
    isApproved: true
  };

  data.events.push(newEvent);
  store.save();
  res.status(201).json(newEvent);
});

app.post('/api/events/:id/rsvp', (req, res) => {
  const data = store.get();
  const ev = data.events.find(e => e.id === req.params.id);
  if (!ev) return res.status(404).json({ error: 'Event not found.' });
  ev.rsvpCount = (ev.rsvpCount || 0) + 1;
  store.save();
  res.json(ev);
});

// -------------------------------------------------------------
// REFERRAL CODE VERIFICATION
// -------------------------------------------------------------
app.post('/api/auth/join-by-referral', (req, res) => {
  const data = store.get();
  const { referralCode } = req.body;
  if (!referralCode) {
    return res.status(400).json({ error: 'Referral code is required.' });
  }

  const codeClean = referralCode.trim().toUpperCase();
  const house = data.houses.find(h => h.referralCode.toUpperCase() === codeClean);
  if (!house) {
    return res.status(404).json({ error: 'Invalid or expired House referral code.' });
  }

  res.json({
    valid: true,
    house: {
      id: house.id,
      name: house.name,
      originCountry: house.originCountry,
      motto: house.motto,
      badgeIcon: house.badgeIcon,
      heraldicColor: house.heraldicColor
    }
  });
});

// -------------------------------------------------------------
// CLAIM TEMPORARY HOUSE
// -------------------------------------------------------------
app.post('/api/auth/claim-house', (req, res) => {
  const data = store.get();
  const { claimToken, email, newPassword, newHouseName, newMotto } = req.body;

  const claim = data.temporaryHouseClaims.find(c => c.claimToken === claimToken.trim());
  if (!claim) {
    return res.status(400).json({ error: 'Invalid claim token.' });
  }

  const house = data.houses.find(h => h.id === claim.houseId);
  const member = data.members.find(m => m.houseId === claim.houseId && m.isTemporaryHead);

  if (house) {
    if (newHouseName) house.name = newHouseName;
    if (newMotto) house.motto = newMotto;
    house.headRoleTitle = 'Lord Sovereign & Master';
  }

  if (member) {
    member.isTemporaryHead = false;
    member.title = 'Head of House';
  }

  data.temporaryHouseClaims = data.temporaryHouseClaims.filter(c => c.claimToken !== claimToken.trim());
  store.save();

  res.json({
    success: true,
    message: `House ${house?.name} is claimed! Welcome Sovereign Head.`,
    house
  });
});

// -------------------------------------------------------------
// RESET DATABASE TO SEED
// -------------------------------------------------------------
app.post('/api/system/reset', (req, res) => {
  const resetData = store.reset();
  res.json({ success: true, message: 'Database reset to canonical seed data.', data: resetData });
});

// Serve client build if available
const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🏰 Sovereign Tree Server heralds on port ${PORT}`);
});
