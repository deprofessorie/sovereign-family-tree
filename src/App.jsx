import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import WorldGlobe from './components/WorldGlobe';
import FamilyTreeCanvas from './components/FamilyTreeCanvas';
import NoticeBoard from './components/NoticeBoard';
import EventBoard from './components/EventBoard';
import MarriageBondsChamber from './components/MarriageBondsChamber';
import HousesDirectory from './components/HousesDirectory';
import AddMemberModal from './components/AddMemberModal';
import FoundHouseModal from './components/FoundHouseModal';
import ReferralJoinModal from './components/ReferralJoinModal';
import TempHeadCredentialModal from './components/TempHeadCredentialModal';
import SiteOwnerSanctum from './components/SiteOwnerSanctum';
import { api } from './services/api';
import { Landmark, Shield, Sparkles, Heart } from 'lucide-react';

export default function App() {
  const [stats, setStats] = useState(null);
  const [houses, setHouses] = useState([]);
  const [currentHouseId, setCurrentHouseId] = useState('house-stirling');
  const [currentHouseData, setCurrentHouseData] = useState(null);
  const [allMembers, setAllMembers] = useState([]);
  const [allBonds, setAllBonds] = useState([]);
  const [notices, setNotices] = useState([]);
  const [events, setEvents] = useState([]);
  
  // Navigation & Personas
  const [activeTab, setActiveTab] = useState('TREE'); // 'GLOBE' | 'HOUSES' | 'TREE' | 'NOTICES' | 'EVENTS' | 'BONDS' | 'SANCTUM'
  const [userRole, setUserRole] = useState('HEAD'); // 'KEEPER' | 'HEAD' | 'MEMBER' | 'VISITOR'

  // Modals
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isFoundHouseOpen, setIsFoundHouseOpen] = useState(false);
  const [isReferralOpen, setIsReferralOpen] = useState(false);
  const [tempCredentials, setTempCredentials] = useState(null);
  const [editingMember, setEditingMember] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load all foundational data
  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [statsRes, housesRes, membersRes, bondsRes] = await Promise.all([
        api.getStats(),
        api.getHouses(),
        api.getMembers(),
        api.getMarriageBonds()
      ]);
      setStats(statsRes);
      setHouses(housesRes);
      setAllMembers(membersRes);
      setAllBonds(bondsRes);
    } catch (err) {
      console.error('Error fetching initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load house specific details when currentHouseId changes
  const loadHouseDetails = async (houseId) => {
    try {
      const houseData = await api.getHouse(houseId);
      setCurrentHouseData(houseData);
      setNotices(houseData.notices || []);
      setEvents(houseData.events || []);
    } catch (err) {
      console.error('Error fetching house details:', err);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (currentHouseId) {
      loadHouseDetails(currentHouseId);
    }
  }, [currentHouseId]);

  // Handlers
  const handleSelectHouse = (houseId) => {
    setCurrentHouseId(houseId);
    setActiveTab('TREE');
  };

  const handleAddMemberSubmit = async (memberData) => {
    const res = await api.addMember(memberData);
    
    // If a new house was founded and credentials generated for the spouse:
    if (res.generatedSpouseCredentials) {
      setTempCredentials(res.generatedSpouseCredentials);
    }

    // Refresh data
    await loadInitialData();
    await loadHouseDetails(currentHouseId);
  };

  const handleFoundHouseSubmit = async (houseData) => {
    const newHouse = await api.foundHouse(houseData);
    await loadInitialData();
    setCurrentHouseId(newHouse.id);
    setActiveTab('TREE');
  };

  const handleSealBond = async (bondId) => {
    await api.sealMarriageBond(bondId, {
      role: userRole,
      userHouseId: currentHouseId
    });
    const updatedBonds = await api.getMarriageBonds();
    setAllBonds(updatedBonds);
    await loadInitialData();
    await loadHouseDetails(currentHouseId);
  };

  const handlePostNotice = async (noticeData) => {
    await api.postNotice(noticeData);
    await loadHouseDetails(currentHouseId);
  };

  const handleApproveNotice = async (noticeId) => {
    await api.approveNotice(noticeId);
    await loadHouseDetails(currentHouseId);
  };

  const handleLikeNotice = async (noticeId) => {
    await api.likeNotice(noticeId);
    await loadHouseDetails(currentHouseId);
  };

  const handleCreateEvent = async (eventData) => {
    await api.createEvent(eventData);
    await loadHouseDetails(currentHouseId);
  };

  const handleRsvpEvent = async (eventId) => {
    await api.rsvpEvent(eventId);
    await loadHouseDetails(currentHouseId);
  };

  const handleDeleteHouse = async (houseId) => {
    await api.deleteHouse(houseId);
    await loadInitialData();
    if (currentHouseId === houseId) {
      setCurrentHouseId('house-stirling');
    }
  };

  const handleDeleteMember = async (memberId) => {
    await api.deleteMember(memberId);
    await loadInitialData();
    await loadHouseDetails(currentHouseId);
  };

  const handleResetDatabase = async () => {
    await api.resetData();
    await loadInitialData();
    await loadHouseDetails('house-stirling');
  };

  const currentHouse = houses.find(h => h.id === currentHouseId) || houses[0];
  const canEdit = userRole === 'KEEPER' || (userRole === 'HEAD' && currentHouseId === 'house-stirling') || userRole === 'MEMBER';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userRole={userRole}
        setUserRole={setUserRole}
        currentHouse={currentHouse}
        onOpenReferralModal={() => setIsReferralOpen(true)}
        onOpenFoundModal={() => setIsFoundHouseOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* TAB 1: 3D WORLD GLOBE & ATLAS */}
        {activeTab === 'GLOBE' && (
          <WorldGlobe
            houses={houses}
            stats={stats}
            onSelectHouse={handleSelectHouse}
          />
        )}

        {/* TAB 2: HOUSES REGISTRY */}
        {activeTab === 'HOUSES' && (
          <HousesDirectory
            houses={houses}
            userRole={userRole}
            userHouseId={currentHouseId}
            onSelectHouse={handleSelectHouse}
            onFoundHouse={() => setIsFoundHouseOpen(true)}
          />
        )}

        {/* TAB 3: DYNAMIC FAMILY TREE CANVAS */}
        {activeTab === 'TREE' && currentHouseData && (
          <div className="space-y-6">
            <FamilyTreeCanvas
              members={currentHouseData.members || []}
              house={currentHouse}
              allHouses={houses}
              onAddMember={() => setIsAddMemberOpen(true)}
              onEditMember={(mem) => setEditingMember(mem)}
              userRole={userRole}
              canEdit={canEdit}
            />

            {/* Quick Allied Houses Bar */}
            {currentHouseData.alliedHousesData && currentHouseData.alliedHousesData.length > 0 && (
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-amber-500/15 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <Heart className="w-4 h-4 text-rose-400" />
                  <span className="font-semibold text-amber-300">Connected Allied Houses:</span>
                  <span>Families united through sovereign marriage bonds and mutual treaties:</span>
                </div>
                <div className="flex items-center gap-2">
                  {currentHouseData.alliedHousesData.map(allied => (
                    <button
                      key={allied.id}
                      onClick={() => handleSelectHouse(allied.id)}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950 border border-slate-700 hover:border-amber-400 text-slate-200 transition-colors"
                    >
                      <span>{allied.badgeIcon || '🛡️'}</span>
                      <span className="font-bold">{allied.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: NOTICE BOARD */}
        {activeTab === 'NOTICES' && (
          <NoticeBoard
            notices={notices}
            house={currentHouse}
            userRole={userRole}
            onPostNotice={handlePostNotice}
            onApproveNotice={handleApproveNotice}
            onLikeNotice={handleLikeNotice}
          />
        )}

        {/* TAB 5: EVENT BOARD */}
        {activeTab === 'EVENTS' && (
          <EventBoard
            events={events}
            house={currentHouse}
            userRole={userRole}
            onCreateEvent={handleCreateEvent}
            onRsvpEvent={handleRsvpEvent}
          />
        )}

        {/* TAB 6: MARRIAGE BONDS & ALLIANCES */}
        {activeTab === 'BONDS' && (
          <MarriageBondsChamber
            bonds={allBonds}
            houses={houses}
            userRole={userRole}
            userHouseId={currentHouseId}
            onSealBond={handleSealBond}
          />
        )}

        {/* TAB 7: SITE OWNER / ARCHIVE KEEPER SANCTUM */}
        {activeTab === 'SANCTUM' && userRole === 'KEEPER' && (
          <SiteOwnerSanctum
            houses={houses}
            members={allMembers}
            bonds={allBonds}
            onDeleteHouse={handleDeleteHouse}
            onDeleteMember={handleDeleteMember}
            onSealBondDirect={handleSealBond}
            onResetDatabase={handleResetDatabase}
            onAddHouse={() => setIsFoundHouseOpen(true)}
            onSelectHouse={handleSelectHouse}
          />
        )}
      </main>

      {/* Add Member Modal */}
      {isAddMemberOpen && currentHouse && (
        <AddMemberModal
          house={currentHouse}
          houses={houses}
          allMembers={allMembers}
          onClose={() => setIsAddMemberOpen(false)}
          onSubmit={handleAddMemberSubmit}
        />
      )}

      {/* Found House Modal */}
      {isFoundHouseOpen && (
        <FoundHouseModal
          onClose={() => setIsFoundHouseOpen(false)}
          onSubmit={handleFoundHouseSubmit}
        />
      )}

      {/* Referral Join Modal */}
      {isReferralOpen && (
        <ReferralJoinModal
          onClose={() => setIsReferralOpen(false)}
          onJoinHouse={(houseId) => {
            setCurrentHouseId(houseId);
            setActiveTab('TREE');
          }}
          api={api}
        />
      )}

      {/* Temporary Head Credential Modal */}
      {tempCredentials && (
        <TempHeadCredentialModal
          credentials={tempCredentials}
          onClose={() => setTempCredentials(null)}
        />
      )}

      {/* Royal Footer */}
      <footer className="mt-16 border-t border-slate-800/80 bg-slate-950 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif-heraldic font-bold text-slate-300">Sovereign Tree Realm</span>
            <span>•</span>
            <span>Worldwide Family & House Lineage Archives</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Sealed Alliances</span>
            <span>•</span>
            <span>Heraldic Lineages</span>
            <span>•</span>
            <span>Polygynous & Remarriage Protocols</span>
            <span>•</span>
            <span>Global Conclaves</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
