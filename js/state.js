/* ═══════════════════════════════════════════════════════════════
   STATE.JS — Game state management + save/load
   ═══════════════════════════════════════════════════════════════ */

const State = (() => {

  const STORAGE_KEY = 'lalalife_save';

  function blankGame() {
    return {
      version: '1.1',
      character: {
        firstName: '', lastName: '', gender: 'female',
        age: 0, birthYear: new Date().getFullYear(),
        country: '', countryFlag: '', wealthClass: 'middle',
        health: 80, happiness: 80, smarts: 50, looks: 50, fame: 0,
        money: 1000,
        sexuality: 'straight',       // straight|gay|bisexual|pansexual|asexual
        genderIdentity: 'cis',       // cis|trans|nonbinary|genderfluid
        sexualityKnown: true,        // false = will be revealed via event
        education: {
          level: 'none',
          major: null, institution: null, gpa: 0,
          studentLoan: 0, certificates: [],
          inSchool: false, schoolType: null,
          schoolYear: 0, schoolDuration: 0, pendingCert: null,
        },
        career: {
          jobId: null, title: null, salary: 0,
          yearsAtJob: 0, promotionLevel: 0, performance: 70, retired: false,
        },
        assets: { houses: [], cars: [], investments: 0 },
        // Hobbies: [{ id, skillLevel, yearsPracticed }]
        hobbies: [],
        // Extracurriculars: [{ id, skillLevel, yearsParticipated }]
        extracurriculars: [],
        // Items owned: [itemId, ...]
        items: [],
        // Energy
        energy: 3,
        energyMax: 3,
        // Mental health
        mentalHealth: 80,
        // Pet: null or { type, name, age, health, alive, sick }
        pet: null,
        // Travel stamps: ['europe','east_asia',...]
        travelStamps: [],
        // Mood: null or { id, name, color, turnsLeft }
        mood: null,
        // Reputation 0-100 (community standing, separate from fame)
        reputation: 50,
        // Health conditions: [conditionId, ...]
        conditions: [],
        // Social circle: [relId, ...] — close friend group
        socialCircle: [],
        // Bucket list: [{ goalId, completed }, ...]
        bucketList: [],
        // City size (affects school quality, job variety)
        cityTier: 'medium',
        // Personal style
        style: 'casual',
        tattoos: 0,
        // Bank account
        bank: { savings: 0, apy: 0.035 },
      },
      relationships: [],
      log: [],
      achievements: [],
      usedOnceEvents: [],
      jobHistory: [],
      cheatsUsed: false,
      immortal: false,
      isAlive: true,
      deathAge: null,
      deathCause: null,
      currentYear: new Date().getFullYear(),
      relationshipIdCounter: 0,
    };
  }

  let _game = null;

  const get     = () => _game;
  const getChar = () => _game.character;
  const getRels = () => _game.relationships;

  function init(characterData) {
    _game = blankGame();
    Object.assign(_game.character, characterData);
    _game.currentYear = _game.character.birthYear;
    _save();
    return _game;
  }

  function _save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(_game)); } catch(e) {}
  }

  function saveGame() { _save(); }

  function loadGame() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      _game = JSON.parse(raw);
      // Migrate: ensure hobbies array exists
      if (!_game.character.hobbies) _game.character.hobbies = [];
      if (!_game.character.extracurriculars) _game.character.extracurriculars = [];
      if (!_game.character.sexuality) _game.character.sexuality = 'straight';
      if (!_game.character.genderIdentity) _game.character.genderIdentity = 'cis';
      if (_game.character.sexualityKnown === undefined) _game.character.sexualityKnown = true;
      if (!_game.character.items) _game.character.items = [];
      if (_game.character.energy === undefined) _game.character.energy = 3;
      if (_game.character.energyMax === undefined) _game.character.energyMax = 3;
      if (_game.character.mentalHealth === undefined) _game.character.mentalHealth = 80;
      if (_game.character.pet === undefined) _game.character.pet = null;
      if (!_game.character.travelStamps) _game.character.travelStamps = [];
      if (_game.character.education.gpa === undefined || _game.character.education.gpa === 0) _game.character.education.gpa = 2.5;
      if (_game.character.mood === undefined) _game.character.mood = null;
      if (_game.character.reputation === undefined) _game.character.reputation = 50;
      if (!_game.character.conditions) _game.character.conditions = [];
      if (!_game.character.socialCircle) _game.character.socialCircle = [];
      if (!_game.character.bucketList) _game.character.bucketList = [];
      if (!_game.character.cityTier) _game.character.cityTier = 'medium';
      if (!_game.character.style) _game.character.style = 'casual';
      if (_game.character.tattoos === undefined) _game.character.tattoos = 0;
      if (!_game.character.bank) _game.character.bank = { savings: 0, apy: 0.035 };
      return true;
    } catch(e) { return false; }
  }

  function exportGame() {
    if (!_game) return;
    const blob = new Blob([JSON.stringify(_game, null, 2)], { type:'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `lalalife_${_game.character.firstName}_age${_game.character.age}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function importGame(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => {
        try {
          const data = JSON.parse(e.target.result);
          if (!data.character.hobbies) data.character.hobbies = [];
          _game = data;
          _save();
          resolve(data);
        } catch(err) { reject(err); }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  function addLog(age, text, type = 'event') {
    _game.log.push({ age, text, type });
    _save();
  }

  function addRelationship(rel) {
    rel.id = 'rel_' + (++_game.relationshipIdCounter);
    _game.relationships.push(rel);
    _save();
    return rel;
  }

  function getPartner() {
    return _game.relationships.find(r => r.type === 'partner' && r.status === 'active') || null;
  }

  function markEventUsed(id) {
    if (!_game.usedOnceEvents.includes(id)) _game.usedOnceEvents.push(id);
  }

  function usedOnceSet() { return new Set(_game.usedOnceEvents); }

  function unlockAchievement(id) {
    if (!_game.achievements.includes(id)) {
      _game.achievements.push(id);
      return true;
    }
    return false;
  }

  function hasAchievement(id) { return _game.achievements.includes(id); }

  function clampStat(val) { return Math.max(0, Math.min(100, Math.round(val))); }

  function applyEffects(effects) {
    if (!effects) return;
    const c = _game.character;
    if (effects.health       !== undefined) c.health       = clampStat(c.health       + effects.health);
    if (effects.happiness    !== undefined) c.happiness    = clampStat(c.happiness    + effects.happiness);
    if (effects.smarts       !== undefined) c.smarts       = clampStat(c.smarts       + effects.smarts);
    if (effects.looks        !== undefined) c.looks        = clampStat(c.looks        + effects.looks);
    if (effects.money        !== undefined) c.money        = Math.max(-999999, c.money + effects.money);
    if (effects.fame         !== undefined) c.fame         = clampStat((c.fame || 0)  + effects.fame);
    if (effects.mentalHealth !== undefined) c.mentalHealth = clampStat((c.mentalHealth ?? 80) + effects.mentalHealth);
    _save();
  }

  const hasSave  = () => { try { return !!localStorage.getItem(STORAGE_KEY); } catch(e) { return false; } };
  const clearSave = () => { try { localStorage.removeItem(STORAGE_KEY); } catch(e) {} _game = null; };

  return {
    get, getChar, getRels,
    init, saveGame, loadGame, exportGame, importGame,
    addLog, addRelationship, getPartner,
    markEventUsed, usedOnceSet,
    unlockAchievement, hasAchievement,
    applyEffects, clampStat,
    hasSave, clearSave,
  };
})();
