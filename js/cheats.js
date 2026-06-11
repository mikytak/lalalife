/* ═══════════════════════════════════════════════════════════════
   CHEATS.JS — God mode panel
   Stat sliders · Money injection · Immortality · Console
   ═══════════════════════════════════════════════════════════════ */

const Cheats = (() => {

  let consoleLog = [];

  function markCheatsUsed() {
    const g = State.get();
    if (g && !g.cheatsUsed) {
      g.cheatsUsed = true;
      State.saveGame();
    }
  }

  function print(msg, type = 'ok') {
    const prefix = type === 'err' ? '✗ ' : type === 'warn' ? '⚠ ' : '✓ ';
    consoleLog.push(prefix + msg);
    if (consoleLog.length > 80) consoleLog.shift();
    const el = document.querySelector('.console-output');
    if (el) {
      el.textContent = consoleLog.join('\n');
      el.scrollTop = el.scrollHeight;
    }
  }

  // ── Set a stat ─────────────────────────────────────────────────
  function setStat(stat, value) {
    const c = State.getChar();
    const clamped = State.clampStat(Number(value));
    c[stat] = clamped;
    markCheatsUsed();
    State.saveGame();
    UI.updateDisplay();
    print(`${stat} set to ${clamped}`);
  }

  function maxAllStats() {
    const c = State.getChar();
    c.health = c.happiness = c.smarts = c.looks = 100;
    markCheatsUsed();
    State.saveGame();
    UI.updateDisplay();
    print('All stats maxed!');
    UI.showToast('All stats maxed!', 'good');
  }

  function addMoney(amount) {
    const c = State.getChar();
    c.money += Number(amount);
    markCheatsUsed();
    State.saveGame();
    UI.updateDisplay();
    print(`Added ${DATA.fmtMoney(amount)}. New balance: ${DATA.fmtMoney(c.money)}`);
    UI.showToast(`+${DATA.fmtMoney(amount)} added!`, 'good');
  }

  function setMoney(amount) {
    const c = State.getChar();
    c.money = Number(amount);
    markCheatsUsed();
    State.saveGame();
    UI.updateDisplay();
    print(`Money set to ${DATA.fmtMoney(amount)}`);
  }

  function setAge(age) {
    const c = State.getChar();
    c.age = Math.max(0, Math.min(120, Number(age)));
    markCheatsUsed();
    State.saveGame();
    UI.updateDisplay();
    print(`Age set to ${c.age}`);
  }

  function setImmortal(val) {
    const g = State.get();
    g.immortal = !!val;
    markCheatsUsed();
    State.saveGame();
    print(`Immortal: ${g.immortal}`);
    UI.showToast(g.immortal ? 'Immortal mode ON' : 'Immortal mode off', 'info');
  }

  function grantDegree(level) {
    const c = State.getChar();
    const levels = ['none','elementary','middleschool','highschool','tradeschool','some_college','bachelor','master','doctorate'];
    if (!levels.includes(level)) { print(`Unknown level. Use: ${levels.join('|')}`, 'err'); return; }
    c.education.level = level;
    markCheatsUsed();
    State.saveGame();
    print(`Education level set to ${level}`);
    UI.showToast(`Education: ${level}`, 'good');
  }

  function grantMajor(major) {
    const c = State.getChar();
    c.education.major = major;
    markCheatsUsed();
    State.saveGame();
    print(`Major set to ${major}`);
  }

  function grantCertificate(certId) {
    const c = State.getChar();
    const cert = DATA.TRADE_CERTIFICATES.find(t => t.id === certId);
    if (!cert) { print(`Unknown cert. Available: ${DATA.TRADE_CERTIFICATES.map(t=>t.id).join(', ')}`, 'err'); return; }
    if (!c.education.certificates.includes(certId)) {
      c.education.certificates.push(certId);
    }
    if (c.education.level === 'none' || c.education.level === 'elementary' || c.education.level === 'middleschool') {
      c.education.level = 'tradeschool';
    }
    markCheatsUsed();
    State.saveGame();
    print(`Certificate granted: ${cert.name}`);
    UI.showToast(`Certificate: ${cert.name}!`, 'good');
  }

  function boostRelationship(relId) {
    const g = State.get();
    const rel = g.relationships.find(r => r.id === relId || r.name.toLowerCase().includes(relId.toLowerCase()));
    if (!rel) { print(`Relationship not found: ${relId}`, 'err'); return; }
    rel.relationship = 100;
    rel.status = 'active';
    markCheatsUsed();
    State.saveGame();
    print(`${rel.name}'s relationship maxed!`);
    UI.showToast(`${rel.name} loves you!`, 'good');
  }

  function forcePromotion() {
    const c = State.getChar();
    if (!c.career.jobId) { print('No current job.', 'err'); return; }
    const career = DATA.getCareer(c.career.jobId);
    const nextLevel = c.career.promotionLevel + 1;
    if (nextLevel >= career.promotions.length) { print('Already at top level!', 'warn'); return; }
    c.career.promotionLevel = nextLevel;
    c.career.title = career.promotions[nextLevel].title;
    c.career.salary = Math.round(career.salary.base * career.promotions[nextLevel].salaryMult);
    markCheatsUsed();
    State.saveGame();
    UI.updateDisplay();
    print(`Promoted to ${c.career.title}! Salary: ${DATA.fmtMoney(c.career.salary)}`);
    UI.showToast(`Promoted to ${c.career.title}!`, 'good');
  }

  function forceJob(jobId) {
    const career = DATA.getCareer(jobId);
    if (!career) { print(`Unknown job: ${jobId}`, 'err'); return; }
    const c = State.getChar();
    c.career.jobId = jobId;
    c.career.title = career.promotions[0].title;
    c.career.salary = career.salary.base;
    c.career.yearsAtJob = 0;
    c.career.promotionLevel = 0;
    c.career.performance = 70;
    markCheatsUsed();
    State.saveGame();
    UI.updateDisplay();
    print(`Career set to ${career.name}`);
    UI.showToast(`Now working as ${career.name}!`, 'good');
  }

  function forceEvent(eventId) {
    const event = DATA.EVENTS.find(e => e.id === eventId);
    if (!event) {
      const ids = DATA.EVENTS.map(e => e.id).join(', ');
      print(`Event not found. IDs: ${ids}`, 'err');
      return;
    }
    UI.showEventModal(event).then(() => {
      markCheatsUsed();
      UI.updateDisplay();
      print(`Event triggered: ${event.title}`);
    });
  }

  function setFame(val) {
    const c = State.getChar();
    c.fame = State.clampStat(Number(val));
    markCheatsUsed();
    State.saveGame();
    UI.updateDisplay();
    print(`Fame set to ${c.fame}`);
  }

  function editCharacterName(firstName, lastName) {
    const c = State.getChar();
    if (firstName) c.firstName = firstName;
    if (lastName) c.lastName = lastName;
    markCheatsUsed();
    State.saveGame();
    UI.updateDisplay();
    print(`Name set to ${c.firstName} ${c.lastName}`);
  }

  function killCharacter() {
    const g = State.get();
    g.isAlive = false;
    g.deathAge = g.character.age;
    g.deathCause = 'Dev console execution';
    State.saveGame();
    UI.showDeathScreen();
    print('Character killed.', 'warn');
  }

  function listJobs() {
    const jobs = DATA.getAllCareers().map(c => `${c.id} (${c.name})`).join('\n');
    print('Available jobs:\n' + jobs);
  }

  function listEvents() {
    const evts = DATA.EVENTS.map(e => e.id).join(', ');
    print('Events: ' + evts);
  }

  function listCerts() {
    const certs = DATA.TRADE_CERTIFICATES.map(c => `${c.id}: ${c.name}`).join('\n');
    print('Certificates:\n' + certs);
  }

  // ── Console command parser ─────────────────────────────────────
  function execCommand(cmd) {
    cmd = cmd.trim();
    print('> ' + cmd);
    const parts = cmd.split(/\s+/);
    const op = parts[0].toLowerCase();

    try {
      switch(op) {
        case 'help':
          print([
            'Commands:',
            'stat <health|happiness|smarts|looks|fame> <0-100>',
            'money <amount>  |  setmoney <amount>',
            'age <number>',
            'immortal <on|off>',
            'degree <level>  |  major <major>  |  cert <id>',
            'promote  |  job <id>  |  listjobs',
            'event <id>  |  listevents',
            'boost <name or rel_id>',
            'max  |  fame <0-100>',
            'name <first> [last]  |  kill',
            'listcerts'
          ].join('\n'));
          break;
        case 'stat': setStat(parts[1], parts[2]); break;
        case 'money': addMoney(parts[1]); break;
        case 'setmoney': setMoney(parts[1]); break;
        case 'age': setAge(parts[1]); break;
        case 'immortal': setImmortal(parts[1] === 'on'); break;
        case 'degree': grantDegree(parts[1]); break;
        case 'major': grantMajor(parts.slice(1).join(' ')); break;
        case 'cert': grantCertificate(parts[1]); break;
        case 'promote': forcePromotion(); break;
        case 'job': forceJob(parts[1]); break;
        case 'listjobs': listJobs(); break;
        case 'event': forceEvent(parts[1]); break;
        case 'listevents': listEvents(); break;
        case 'listcerts': listCerts(); break;
        case 'boost': boostRelationship(parts.slice(1).join(' ')); break;
        case 'max': maxAllStats(); break;
        case 'fame': setFame(parts[1]); break;
        case 'name': editCharacterName(parts[1], parts[2]); break;
        case 'kill': killCharacter(); break;
        default: print(`Unknown command: ${op}. Type 'help' for commands.`, 'err');
      }
    } catch(e) {
      print('Error: ' + e.message, 'err');
    }
  }

  // ── Render cheat panel ─────────────────────────────────────────
  function render() {
    const g = State.get();
    const c = g.character;
    const div = document.querySelector('#cheats-content');
    if (!div) return;

    div.innerHTML = `
      <p class="text-dim mb-8">Cheat codes for a life well-lived. Achievements still unlock but the life summary will be marked.</p>

      <div class="cheat-group">
        <h4>Stats</h4>
        ${['health','happiness','smarts','looks'].map(stat => `
          <div class="cheat-row">
            <label>${{ health:'Health', happiness:'Happiness', smarts:'Smarts', looks:'Looks' }[stat]}</label>
            <input type="range" class="cheat-slider" id="cs-${stat}" min="0" max="100" value="${c[stat]}">
            <span class="cheat-val" id="cv-${stat}">${c[stat]}</span>
          </div>
        `).join('')}
        <div class="cheat-row" style="margin-top:8px">
          <label>Fame</label>
          <input type="range" class="cheat-slider" id="cs-fame" min="0" max="100" value="${c.fame||0}">
          <span class="cheat-val" id="cv-fame">${c.fame||0}</span>
        </div>
        <button class="btn btn-primary btn-full" id="cc-max" style="margin-top:8px">Max All Stats</button>
      </div>

      <div class="cheat-group">
        <h4>Money</h4>
        <div class="cheat-row">
          <label>Add Amount</label>
          <input type="number" class="cheat-input" id="cc-money-add" value="10000" style="width:100px">
          <button class="btn btn-success btn-sm" id="cc-add-btn">Add</button>
        </div>
        <div class="cheat-row">
          <label>Set Exactly</label>
          <input type="number" class="cheat-input" id="cc-money-set" value="${c.money}" style="width:100px">
          <button class="btn btn-secondary btn-sm" id="cc-set-btn">Set</button>
        </div>
        <div class="cheat-row" style="flex-wrap:wrap;gap:6px">
          <button class="btn btn-success btn-xs" data-quick-money="1000000">+$1M</button>
          <button class="btn btn-success btn-xs" data-quick-money="1000000000">+$1B</button>
          <button class="btn btn-danger btn-xs" data-quick-money="-50000">-$50K</button>
        </div>
      </div>

      <div class="cheat-group">
        <h4>Character</h4>
        <div class="cheat-row">
          <label>Age</label>
          <input type="number" class="cheat-input" id="cc-age" value="${c.age}" min="0" max="120">
          <button class="btn btn-secondary btn-sm" id="cc-age-btn">Set</button>
        </div>
        <div class="cheat-row">
          <label>First Name</label>
          <input type="text" class="cheat-input" id="cc-fname" value="${c.firstName}" style="width:110px">
        </div>
        <div class="cheat-row">
          <label>Last Name</label>
          <input type="text" class="cheat-input" id="cc-lname" value="${c.lastName}" style="width:110px">
        </div>
        <button class="btn btn-secondary btn-sm" id="cc-name-btn" style="width:100%;margin-top:6px">Update Name</button>
      </div>

      <div class="cheat-group">
        <h4>Death</h4>
        <div class="cheat-row">
          <label>Immortal Mode</label>
          <div class="cheat-toggle${g.immortal ? ' on' : ''}" id="cc-immortal"></div>
        </div>
      </div>

      <div class="cheat-group">
        <h4>Education</h4>
        <div class="cheat-row">
          <label>Education Level</label>
          <select class="cheat-input" id="cc-edu-level" style="width:140px">
            ${['none','highschool','tradeschool','some_college','bachelor','master','doctorate'].map(l =>
              `<option value="${l}"${c.education.level===l?' selected':''}>${l}</option>`
            ).join('')}
          </select>
        </div>
        <div class="cheat-row">
          <label>Major / Field</label>
          <input type="text" class="cheat-input" id="cc-major" value="${c.education.major||''}" style="width:140px">
        </div>
        <button class="btn btn-success btn-sm" id="cc-edu-btn" style="width:100%;margin-top:6px">Apply Education</button>
        <div class="section-title" style="margin-top:10px">Trade Certificates</div>
        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:6px">
          ${DATA.TRADE_CERTIFICATES.map(cert => {
            const owned = c.education.certificates.includes(cert.id);
            return `<button class="btn btn-xs ${owned ? 'btn-success' : 'btn-ghost'}" data-cert="${cert.id}">${cert.id}${owned?' +':''}</button>`;
          }).join('')}
        </div>
      </div>

      <div class="cheat-group">
        <h4>Career</h4>
        <div class="cheat-row">
          <label>Force Promotion</label>
          <button class="btn btn-success btn-sm" id="cc-promote">Promote</button>
        </div>
        <div class="cheat-row">
          <label>Set Job</label>
          <select class="cheat-input" id="cc-job-sel" style="width:150px">
            <option value="">Unemployed</option>
            ${DATA.getAllCareers().map(car => `<option value="${car.id}"${c.career.jobId===car.id?' selected':''}>${car.name}</option>`).join('')}
          </select>
        </div>
        <button class="btn btn-secondary btn-sm" id="cc-job-btn" style="width:100%;margin-top:6px">Apply Job</button>
      </div>

      <div class="cheat-group">
        <h4>Hobbies</h4>
        ${c.hobbies.length === 0 ? '<p class="text-dim">No hobbies yet.</p>' :
          c.hobbies.map(h => {
            const hDef = DATA.getHobby(h.id);
            return `<div class="cheat-row"><label style="font-size:.78rem">${hDef?.name||h.id} (${h.skillLevel})</label><button class="btn btn-xs btn-success" data-boost-hobby="${h.id}">Max skill</button></div>`;
          }).join('')}
        <div class="cheat-row" style="margin-top:6px">
          <select class="cheat-input" id="cc-hobby-sel" style="flex:1">
            ${DATA.getAllHobbies().map(h=>`<option value="${h.id}">${h.name}</option>`).join('')}
          </select>
          <button class="btn btn-success btn-sm" id="cc-start-hobby">Start</button>
        </div>
      </div>

      <div class="cheat-group">
        <h4>Relationships</h4>
        ${g.relationships.filter(r => r.status === 'active').length === 0
          ? '<p class="text-dim">No active relationships.</p>'
          : g.relationships.filter(r => r.status === 'active').map(rel => `
          <div class="cheat-row">
            <label style="font-size:.78rem">${rel.name}</label>
            <button class="btn btn-xs btn-success" data-boost-rel="${rel.id}">Max</button>
          </div>`).join('')
        }
      </div>

      <div class="cheat-group">
        <h4>Force Event</h4>
        <div class="cheat-row">
          <select class="cheat-input" id="cc-event-sel" style="flex:1">
            ${DATA.EVENTS.map(e => `<option value="${e.id}">${e.title}</option>`).join('')}
          </select>
          <button class="btn btn-primary btn-sm" id="cc-event-btn">Fire</button>
        </div>
      </div>

      <div class="cheat-group">
        <h4>Dev Console</h4>
        <div class="console-area">
          <div class="console-output">${consoleLog.join('\n') || 'Type "help" for commands.'}</div>
          <div class="console-input-row">
            <input type="text" class="console-input" id="cc-console" placeholder="> command..." autocomplete="off">
            <button class="btn btn-success btn-sm" id="cc-console-run">Run</button>
          </div>
        </div>
      </div>
    `;

    // Wire up stat sliders
    ['health','happiness','smarts','looks','fame'].forEach(stat => {
      const slider = document.getElementById(`cs-${stat}`);
      const valEl  = document.getElementById(`cv-${stat}`);
      if (!slider) return;
      slider.addEventListener('input', () => { valEl.textContent = slider.value; });
      slider.addEventListener('change', () => setStat(stat, slider.value));
    });

    // Money buttons
    qs('#cc-add-btn').addEventListener('click', () => addMoney(parseFloat(qs('#cc-money-add').value)));
    qs('#cc-set-btn').addEventListener('click', () => setMoney(parseFloat(qs('#cc-money-set').value)));
    div.querySelectorAll('[data-quick-money]').forEach(btn => {
      btn.addEventListener('click', () => addMoney(parseInt(btn.dataset.quickMoney)));
    });

    // Max stats
    qs('#cc-max').addEventListener('click', maxAllStats);

    // Character
    qs('#cc-age-btn').addEventListener('click', () => setAge(qs('#cc-age').value));
    qs('#cc-name-btn').addEventListener('click', () => editCharacterName(qs('#cc-fname').value, qs('#cc-lname').value));

    // Immortal toggle
    qs('#cc-immortal').addEventListener('click', () => {
      const g = State.get();
      setImmortal(!g.immortal);
      qs('#cc-immortal').classList.toggle('on', g.immortal);
    });

    // Education
    qs('#cc-edu-btn').addEventListener('click', () => {
      grantDegree(qs('#cc-edu-level').value);
      grantMajor(qs('#cc-major').value);
    });
    div.querySelectorAll('[data-cert]').forEach(btn => {
      btn.addEventListener('click', () => { grantCertificate(btn.dataset.cert); render(); });
    });

    // Career
    qs('#cc-promote').addEventListener('click', forcePromotion);
    qs('#cc-job-btn').addEventListener('click', () => {
      const sel = qs('#cc-job-sel').value;
      if (sel) forceJob(sel);
      else { Engine.quitJob(false); UI.showToast('Unemployed.', 'info'); }
    });

    // Hobbies
    div.querySelectorAll('[data-boost-hobby]').forEach(btn => {
      btn.addEventListener('click', () => {
        const c = State.getChar();
        const h = c.hobbies.find(h => h.id === btn.dataset.boostHobby);
        if (h) { h.skillLevel = 100; markCheatsUsed(); State.saveGame(); print(`Hobby ${h.id} maxed!`); render(); }
      });
    });
    qs('#cc-start-hobby')?.addEventListener('click', () => {
      const sel = qs('#cc-hobby-sel')?.value;
      if (sel) { const c = State.getChar(); if (!c.hobbies.find(h=>h.id===sel)) { c.hobbies.push({id:sel,skillLevel:50,yearsPracticed:0}); markCheatsUsed(); State.saveGame(); print(`Started hobby: ${sel} at skill 50`); UI.showToast('Hobby started!','good'); render(); } else print('Already have this hobby.','warn'); }
    });

    // Relationships
    div.querySelectorAll('[data-boost-rel]').forEach(btn => {
      btn.addEventListener('click', () => boostRelationship(btn.dataset.boostRel));
    });

    // Force event
    qs('#cc-event-btn').addEventListener('click', () => {
      const sel = qs('#cc-event-sel').value;
      UI.closeModal('cheats');
      forceEvent(sel);
    });

    // Console
    const runConsole = () => {
      const input = qs('#cc-console');
      if (input.value.trim()) {
        execCommand(input.value);
        input.value = '';
      }
    };
    qs('#cc-console-run').addEventListener('click', runConsole);
    qs('#cc-console').addEventListener('keydown', e => { if (e.key === 'Enter') runConsole(); });
  }

  function qs(sel) { return document.querySelector(sel); }

  return {
    render,
    setStat, maxAllStats, addMoney, setMoney, setAge, setImmortal,
    grantDegree, grantMajor, grantCertificate, boostRelationship,
    forcePromotion, forceJob, forceEvent, setFame, editCharacterName, killCharacter,
    execCommand,
  };
})();
