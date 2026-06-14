/* ═══════════════════════════════════════════════════════════════
   MAIN.JS — Entry point, wiring, personalization flow
   ═══════════════════════════════════════════════════════════════ */

const Game = (() => {

  let pendingCharData = null;
  let selectedGender  = 'female';

  function init() {
    UI.populateCountrySelect();
    wireGenderButtons();
    wireCountryRoyalToggle();
    wireButtons();
    wireModalClose();
    wireNavButtons();
    wireFileImport();
    wireKonami();

    if (State.hasSave()) {
      document.getElementById('btn-continue').classList.remove('hidden');
    }
  }

  // ── Country → royalty toggle ──────────────────────────────────
  function wireCountryRoyalToggle() {
    const countrySel = document.getElementById('custom-country');
    const royalOpt   = document.getElementById('royal-option');
    const birthSel   = document.getElementById('custom-special-birth');
    if (!countrySel || !royalOpt) return;
    countrySel.addEventListener('change', () => {
      const countryName = countrySel.value;
      const country = DATA.COUNTRIES.find(c => c.name === countryName);
      const hasRoyalty = !!(country && country.hasRoyalty);
      royalOpt.disabled = !hasRoyalty;
      royalOpt.textContent = hasRoyalty
        ? `Born Royal — ${country.royalMaleName || 'Prince'}/${country.royalFemaleName || 'Princess'} of ${country.name}`
        : 'Born Royal — select a monarchy first';
      if (!hasRoyalty && birthSel.value === 'royal') birthSel.value = '';
    });
  }

  // ── Personalization form ──────────────────────────────────────
  function wireGenderButtons() {
    document.querySelectorAll('.gender-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.gender-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedGender = btn.dataset.gender;
      });
    });
  }

  function getCustomization() {
    const firstName = document.getElementById('custom-firstname').value.trim() || '';
    const lastName  = document.getElementById('custom-lastname').value.trim()  || '';
    const countryName = document.getElementById('custom-country').value;
    const country = countryName ? DATA.COUNTRIES.find(c => c.name === countryName) || null : null;
    const gender  = selectedGender;
    const sexualityVal  = document.getElementById('custom-sexuality')?.value || 'discover';
    const specialBirth  = document.getElementById('custom-special-birth')?.value || '';
    return { firstName: firstName || null, lastName: lastName || null, country, gender, sexuality: sexualityVal, specialBirth: specialBirth || null };
  }

  function generateCharacter() {
    const opts = getCustomization();
    pendingCharData = Engine.createCharacter(opts);
    UI.showCharacterPreview(pendingCharData);
  }

  function rerollCharacter() {
    const opts = getCustomization();
    pendingCharData = Engine.createCharacter(opts);
    UI.showCharacterPreview(pendingCharData);
  }

  function backToCustomize() {
    document.getElementById('char-preview').classList.add('hidden');
    document.getElementById('preview-actions').classList.add('hidden');
    document.getElementById('step-customize').classList.remove('hidden');
    document.getElementById('initial-actions').classList.remove('hidden');
    pendingCharData = null;
  }

  function startNewLife() {
    if (!pendingCharData) return;
    const { characterData, relationships, initCounter } = pendingCharData;
    State.init(characterData);
    const g = State.get();
    relationships.forEach(rel => { rel.id = 'rel_' + (++g.relationshipIdCounter); g.relationships.push(rel); });
    g.relationshipIdCounter = initCounter;
    // Apply life goal chosen at creation
    const goalSel = document.getElementById('custom-lifegoal');
    if (goalSel && goalSel.value) Engine.setLifeGoal(goalSel.value);
    State.saveGame();
    State.addLog(0, `Born as ${characterData.firstName} ${characterData.lastName} in ${characterData.country}.`, 'birth');
    State.addLog(0, `Parents: ${relationships.filter(r=>r.subtype==='father'||r.subtype==='mother').map(r=>r.name).join(' & ')}`, 'family');
    UI.rebuildFeed();
    UI.updateDisplay();
    UI.showScreen('game');
    UI.showToast(`Welcome to the world, ${characterData.firstName}!`, 'good');
    if (characterData.isRoyal) {
      setTimeout(() => UI.showLifeMoment('👑', `${characterData.royalTitle} ${characterData.firstName}!`, `Born into the royal family of ${characterData.country}. Long may you reign.`, 'royal'), 600);
    } else if (characterData.isNepobaby) {
      setTimeout(() => UI.showLifeMoment('⭐', 'Born Famous!', 'The cameras are already rolling. Welcome to the spotlight.', 'nepo'), 600);
    }
    pendingCharData = null;
  }

  function continueGame() {
    if (!State.loadGame()) { UI.showToast('No save found.', 'bad'); return; }
    const g = State.get();
    if (!g.isAlive) { UI.showDeathScreen(); return; }
    UI.rebuildFeed(); UI.updateDisplay(); UI.showScreen('game');
    UI.showToast(`Welcome back, ${g.character.firstName}.`, 'good');
  }

  function newGame() {
    State.clearSave(); pendingCharData = null;
    document.getElementById('char-preview').classList.add('hidden');
    document.getElementById('preview-actions').classList.add('hidden');
    document.getElementById('step-customize').classList.remove('hidden');
    document.getElementById('initial-actions').classList.remove('hidden');
    document.getElementById('btn-continue').classList.add('hidden');
    // Reset form
    document.getElementById('custom-firstname').value = '';
    document.getElementById('custom-lastname').value  = '';
    document.getElementById('custom-country').value   = '';
    document.querySelectorAll('.gender-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('.gender-btn[data-gender="female"]').classList.add('active');
    selectedGender = 'female';
    UI.showScreen('intro');
  }

  // ── Button wiring ─────────────────────────────────────────────
  function wireButtons() {
    document.getElementById('btn-generate').addEventListener('click', generateCharacter);
    document.getElementById('btn-reroll').addEventListener('click', rerollCharacter);
    document.getElementById('btn-start').addEventListener('click', startNewLife);
    document.getElementById('btn-back-customize').addEventListener('click', backToCustomize);
    document.getElementById('btn-continue').addEventListener('click', continueGame);
    document.getElementById('btn-import-btn').addEventListener('click', () => document.getElementById('import-file').click());
    document.getElementById('btn-new-life-2').addEventListener('click', newGame);

    document.getElementById('btn-age-up').addEventListener('click', async () => {
      const g = State.get(); if (!g || !g.isAlive) return;
      const btn = document.getElementById('btn-age-up'); btn.disabled = true;
      // Birthday flash
      const flash = document.getElementById('birthday-flash');
      if (flash) {
        const age = g.character.age + 1;
        flash.textContent = `🎂 Age ${age}`;
        flash.style.display = 'flex';
        flash.classList.add('bday-flash-active');
        setTimeout(() => { flash.style.display = 'none'; flash.classList.remove('bday-flash-active'); }, 1400);
      }
      try { await Engine.ageUp(); } catch(e) { console.error(e); UI.showToast('Something went wrong.', 'bad'); }
      finally { if (State.get()?.isAlive) btn.disabled = false; }
    });
  }

  function wireNavButtons() {
    document.querySelectorAll('[data-modal]').forEach(btn => {
      btn.addEventListener('click', () => { if (!State.get()) return; UI.openModal(btn.dataset.modal); });
    });
  }

  function wireModalClose() {
    document.querySelectorAll('.close-btn[data-close]').forEach(btn => {
      btn.addEventListener('click', () => UI.closeModal(btn.dataset.close));
    });
    document.querySelectorAll('.overlay').forEach(overlay => {
      overlay.addEventListener('click', e => {
        if (e.target === overlay && overlay.id !== 'modal-event') {
          UI.closeModal(overlay.id.replace('modal-', ''));
        }
      });
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        const open = document.querySelector('.overlay:not(.hidden)');
        if (open) UI.closeModal(open.id.replace('modal-', ''));
      }
    });
  }

  function wireFileImport() {
    document.getElementById('import-file').addEventListener('change', async e => {
      const file = e.target.files[0]; if (!file) return;
      try {
        await State.importGame(file);
        const g = State.get();
        if (!g.isAlive) { UI.showDeathScreen(); }
        else { UI.rebuildFeed(); UI.updateDisplay(); UI.showScreen('game'); UI.showToast(`Loaded ${g.character.firstName}'s life.`, 'good'); }
      } catch(err) { UI.showToast('Failed to load save file.', 'bad'); }
      e.target.value = '';
    });
  }

  // ── Konami code + "iddqd" typing ─────────────────────────────
  function wireKonami() {
    const KONAMI = [38,38,40,40,37,39,37,39,66,65];
    let kIdx = 0; let buf = '';
    document.addEventListener('keydown', e => {
      if (e.keyCode === KONAMI[kIdx]) { kIdx++; if (kIdx === KONAMI.length) { kIdx=0; triggerCheat(); } }
      else kIdx = 0;
      if (e.key.length === 1) { buf = (buf+e.key).slice(-5).toLowerCase(); if (buf==='iddqd') { buf=''; triggerCheat(); } }
    });
  }

  function triggerCheat() {
    if (!State.get()) { UI.showToast('Start a life first!', 'info'); return; }
    UI.showToast('Cheat panel unlocked.', 'good');
    UI.openModal('cheats');
  }

  return { init, newGame, startNewLife, continueGame };
})();

document.addEventListener('DOMContentLoaded', () => Game.init());
