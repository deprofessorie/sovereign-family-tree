const API_BASE = '/api';

export const api = {
  // Stats
  async getStats() {
    const res = await fetch(`${API_BASE}/stats`);
    return res.json();
  },

  // Houses
  async getHouses() {
    const res = await fetch(`${API_BASE}/houses`);
    return res.json();
  },

  async getHouse(id) {
    const res = await fetch(`${API_BASE}/houses/${id}`);
    return res.json();
  },

  async foundHouse(data) {
    const res = await fetch(`${API_BASE}/houses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to found house');
    }
    return res.json();
  },

  async updateHouse(id, data) {
    const res = await fetch(`${API_BASE}/houses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async deleteHouse(id) {
    const res = await fetch(`${API_BASE}/houses/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  // Members
  async getMembers(houseId) {
    const url = houseId ? `${API_BASE}/members?houseId=${houseId}` : `${API_BASE}/members`;
    const res = await fetch(url);
    return res.json();
  },

  async addMember(data) {
    const res = await fetch(`${API_BASE}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to add member');
    }
    return res.json();
  },

  async updateMember(id, data) {
    const res = await fetch(`${API_BASE}/members/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async deleteMember(id) {
    const res = await fetch(`${API_BASE}/members/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  // Marriage Bonds
  async getMarriageBonds() {
    const res = await fetch(`${API_BASE}/marriage-bonds`);
    return res.json();
  },

  async sealMarriageBond(id, { role, userHouseId }) {
    const res = await fetch(`${API_BASE}/marriage-bonds/${id}/seal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, userHouseId })
    });
    return res.json();
  },

  // Notices
  async getNotices(houseId) {
    const url = houseId ? `${API_BASE}/notices?houseId=${houseId}` : `${API_BASE}/notices`;
    const res = await fetch(url);
    return res.json();
  },

  async postNotice(data) {
    const res = await fetch(`${API_BASE}/notices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async approveNotice(id) {
    const res = await fetch(`${API_BASE}/notices/${id}/approve`, {
      method: 'PUT'
    });
    return res.json();
  },

  async likeNotice(id) {
    const res = await fetch(`${API_BASE}/notices/${id}/like`, {
      method: 'POST'
    });
    return res.json();
  },

  // Events
  async getEvents(houseId) {
    const url = houseId ? `${API_BASE}/events?houseId=${houseId}` : `${API_BASE}/events`;
    const res = await fetch(url);
    return res.json();
  },

  async createEvent(data) {
    const res = await fetch(`${API_BASE}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async rsvpEvent(id) {
    const res = await fetch(`${API_BASE}/events/${id}/rsvp`, {
      method: 'POST'
    });
    return res.json();
  },

  // Auth & Referrals
  async verifyReferralCode(referralCode) {
    const res = await fetch(`${API_BASE}/auth/join-by-referral`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ referralCode })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Invalid code');
    }
    return res.json();
  },

  async claimHouse(claimData) {
    const res = await fetch(`${API_BASE}/auth/claim-house`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(claimData)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to claim house');
    }
    return res.json();
  },

  async resetData() {
    const res = await fetch(`${API_BASE}/system/reset`, {
      method: 'POST'
    });
    return res.json();
  }
};
