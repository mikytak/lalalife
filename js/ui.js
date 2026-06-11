/* ═══════════════════════════════════════════════════════════════
   UI.JS — All rendering. No emoji in the main UI.
   ═══════════════════════════════════════════════════════════════ */

const UI = (() => {

  function qs(sel) { return document.querySelector(sel); }

  // ── Screens ───────────────────────────────────────────────────
  function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const el = qs('#screen-' + id);
    if (el) el.classList.add('active');
  }

  // ── Stats display ─────────────────────────────────────────────
  function updateDisplay() {
    const g = State.get();
    if (!g) return;
    const c = g.character;

    qs('#hdr-name').textContent = `${c.firstName} ${c.lastName}`;
    qs('#hdr-age').textContent  = `Age ${c.age} · ${c.country}`;
    qs('#hdr-money').textContent = DATA.fmtMoney(c.money);

    const jobEl = qs('#hdr-job');
    if (c.career.retired)  jobEl.textContent = 'Retired';
    else if (c.career.jobId) { const car = DATA.getCareer(c.career.jobId); jobEl.textContent = c.career.title || car?.name || ''; }
    else if (c.education.inSchool) jobEl.textContent = c.education.schoolType === 'trade' ? 'Trade School' : 'University';
    else if (c.age <= 5)   jobEl.textContent = 'Baby';
    else if (c.age <= 12)  jobEl.textContent = 'Elementary School';
    else if (c.age <= 17)  jobEl.textContent = 'High School';
    else                   jobEl.textContent = 'Unemployed';

    setBar('health',    c.health);
    setBar('happiness', c.happiness);
    setBar('smarts',    c.smarts);
    setBar('looks',     c.looks);

    qs('#ageup-next').textContent = c.age + 1;
    qs('#btn-age-up').disabled = false;
  }

  function setBar(stat, val) {
    const bar = qs(`#bar-${stat}`);
    const num = qs(`#val-${stat}`);
    if (bar) bar.style.width = val + '%';
    if (num) num.textContent = val;
  }

  // ── Category dot colour from event category ──────────────────
  const CAT_COLORS = {
    health:    'var(--red)',
    career:    'var(--blue)',
    family:    'var(--pink)',
    school:    'var(--green)',
    social:    'var(--yellow)',
    adventure: 'var(--orange)',
    default:   'var(--accent)',
  };

  function catColor(cat) { return CAT_COLORS[cat] || CAT_COLORS.default; }
  function typeDot(type) {
    const map = { event:'var(--accent)', career:'var(--blue)', edu:'var(--green)', rel:'var(--pink)', activity:'var(--orange)', birth:'var(--yellow)', good:'var(--green)', bad:'var(--red)' };
    return map[type] || 'var(--accent)';
  }

  // ── Feed ──────────────────────────────────────────────────────
  function addFeedEntry({ text, type, effects, age, category }) {
    const feed = qs('#feed-inner');
    const markerAge = age !== undefined ? age : State.getChar().age;

    let ageMarker = feed.querySelector(`[data-age="${markerAge}"]`);
    if (!ageMarker) {
      ageMarker = document.createElement('div');
      ageMarker.className = 'feed-year-marker';
      ageMarker.dataset.age = markerAge;
      ageMarker.textContent = `AGE ${markerAge}`;
      feed.insertBefore(ageMarker, feed.firstChild);
    }

    let effectsHtml = '';
    if (effects) {
      const chips = [];
      const labels = { health:'Health', happiness:'Happy', smarts:'Smarts', looks:'Looks', money:'Money', fame:'Fame' };
      for (const [k, v] of Object.entries(effects)) {
        if (!v) continue;
        const sign  = v > 0 ? '+' : '';
        const label = k === 'money' ? DATA.fmtMoney(v) : `${sign}${v}`;
        chips.push(`<span class="effect-chip ${v > 0 ? 'effect-pos' : 'effect-neg'}">${labels[k]||k} ${label}</span>`);
      }
      if (chips.length) effectsHtml = `<div class="feed-effects">${chips.join('')}</div>`;
    }

    const card = document.createElement('div');
    card.className = `feed-card type-${type || 'event'}`;
    const dotColor = category ? catColor(category) : typeDot(type);
    card.innerHTML = `
      <div class="feed-card-top">
        <span class="feed-cat-dot" style="background:${dotColor}"></span>
        <span class="feed-text">${text}</span>
      </div>
      ${effectsHtml}
    `;

    ageMarker.insertAdjacentElement('afterend', card);

    const cards = feed.querySelectorAll('.feed-card');
    if (cards.length > 80) cards[cards.length - 1].remove();
  }

  function rebuildFeed() {
    const g = State.get(); if (!g) return;
    const feed = qs('#feed-inner');
    feed.innerHTML = '';
    const recent = [...g.log].slice(-30).reverse();
    const seenAges = new Set();
    recent.forEach(entry => {
      if (!seenAges.has(entry.age)) {
        seenAges.add(entry.age);
        const m = document.createElement('div');
        m.className = 'feed-year-marker'; m.dataset.age = entry.age;
        m.textContent = `AGE ${entry.age}`; feed.appendChild(m);
      }
      const card = document.createElement('div');
      card.className = `feed-card type-${entry.type||'event'}`;
      card.innerHTML = `
        <div class="feed-card-top">
          <span class="feed-cat-dot" style="background:${typeDot(entry.type)}"></span>
          <span class="feed-text">${entry.text}</span>
        </div>`;
      feed.appendChild(card);
    });
  }

  // ── Event modal (Promise-based) ───────────────────────────────
  function showEventModal(event) {
    return new Promise(resolve => {
      const c = State.getChar();
      const overlay = qs('#modal-event');

      // Category badge
      const catEl = qs('#evt-category');
      catEl.textContent = ucFirst(event.category || 'Life Event');
      catEl.className = `evt-category cat-${event.category || 'default'}`;

      qs('#evt-title').textContent = event.title;
      qs('#evt-desc').textContent  = event.desc || '';

      const choicesDiv = qs('#evt-choices');
      choicesDiv.innerHTML = '';

      if (event.choices && event.choices.length > 0) {
        event.choices.forEach((ch, idx) => {
          const btn = document.createElement('button');
          btn.className = 'evt-choice';
          btn.innerHTML = `${ch.text}${ch.sub ? `<div class="evt-choice-sub">${ch.sub}</div>` : ''}`;
          btn.addEventListener('click', () => {
            overlay.classList.add('hidden');
            Engine.applyEventChoice(event, idx);
            addFeedEntry({ text:`${event.title} — ${ch.text}`, type:'event', effects:ch.effects, age:c.age, category:event.category });
            updateDisplay();
            resolve(idx);
          });
          choicesDiv.appendChild(btn);
        });
      } else {
        Engine.applyEventChoice(event, -1);
        addFeedEntry({ text:event.log || event.title, type:'event', effects:event.effects, age:c.age, category:event.category });
        updateDisplay();
        const btn = document.createElement('button');
        btn.className = 'evt-choice';
        btn.textContent = 'Continue';
        btn.addEventListener('click', () => { overlay.classList.add('hidden'); resolve(-1); });
        choicesDiv.appendChild(btn);
      }

      overlay.classList.remove('hidden');
    });
  }

  // ── Toast ─────────────────────────────────────────────────────
  function showToast(msg, type = 'info') {
    const zone  = qs('#toast-zone');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = msg;
    zone.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 2800);
  }

  // ── Modal system ──────────────────────────────────────────────
  function openModal(name) {
    const el = qs(`#modal-${name}`);
    if (!el) return;
    const renderers = {
      activities: renderActivities, relationships: renderRelationships,
      career: renderCareer, education: renderEducation,
      assets: renderAssets, cheats: Cheats.render, log: renderLog,
    };
    if (renderers[name]) renderers[name]();
    el.classList.remove('hidden');
    const body = el.querySelector('.modal-body');
    if (body) body.scrollTop = 0;
  }

  function closeModal(name) {
    const el = qs(`#modal-${name}`);
    if (el) el.classList.add('hidden');
  }

  // ── ACTIVITIES modal ──────────────────────────────────────────
  function renderActivities() {
    const c = State.getChar();
    const div = qs('#activities-content');
    div.innerHTML = '';

    // ── School Life (age 6–18) ──────────────────────────────────
    if (c.age >= 6 && c.age <= 18) {
      const schoolHdr = document.createElement('div');
      schoolHdr.className = 'section-title';
      schoolHdr.textContent = 'School Life';
      div.appendChild(schoolHdr);

      // Socialize at school button
      const socialCard = document.createElement('div');
      socialCard.className = 'item-card clickable';
      socialCard.innerHTML = `
        <div class="item-top">
          <div class="item-icon ic-rose">So</div>
          <div class="item-info">
            <div class="item-name">Socialize with Classmates</div>
            <div class="item-sub">Hang out and make new friends at school.</div>
          </div>
        </div>`;
      socialCard.addEventListener('click', () => {
        const r = Engine.socializeAtSchool();
        showToast(r.ok ? r.msg : r.msg, r.ok ? 'good' : 'bad');
        if (r.ok) { updateDisplay(); closeModal('activities'); }
      });
      div.appendChild(socialCard);

      // Extracurriculars
      const extHdr = document.createElement('div');
      extHdr.className = 'section-title';
      extHdr.textContent = 'Extracurriculars';
      div.appendChild(extHdr);

      const allExt = DATA.getAllExtracurriculars();
      const myExtIds = new Set(c.extracurriculars.map(e => e.id));

      // Current extracurriculars
      c.extracurriculars.forEach(entry => {
        const def = DATA.getExtracurricular(entry.id);
        if (!def) return;
        const hobbyMatch = c.hobbies.find(h => def.hobbyBoost.includes(h.id));
        const card = document.createElement('div');
        card.className = 'item-card';
        card.innerHTML = `
          <div class="item-top">
            <div class="item-icon ${def.iconClass}">${def.icon}</div>
            <div class="item-info">
              <div class="item-name">${def.name}</div>
              <div class="item-sub">${def.desc}</div>
              <div class="hobby-skill-wrap">
                <div class="hobby-skill-label"><span>Skill</span><span>${entry.skillLevel}/100</span></div>
                <div class="hobby-skill-bar"><div class="hobby-skill-fill" style="width:${entry.skillLevel}%"></div></div>
              </div>
              ${hobbyMatch ? `<div class="item-detail text-accent">Boosted by ${DATA.getHobby(hobbyMatch.id)?.name} hobby</div>` : ''}
            </div>
          </div>
          <div class="item-actions">
            <button class="btn btn-primary btn-sm" data-participate="${entry.id}">Participate</button>
          </div>`;
        card.querySelector('[data-participate]').addEventListener('click', () => {
          const r = Engine.participateExtracurricular(entry.id);
          if (r.ok) {
            const msg = r.hobbyBoost ? `${def.name} — skill ${r.skillLevel} (hobby bonus!)` : `${def.name} — skill ${r.skillLevel}`;
            showToast(msg, 'good');
            updateDisplay(); renderActivities();
          }
        });
        div.appendChild(card);
      });

      // Available to join
      const available = allExt.filter(e => !myExtIds.has(e.id) && c.age >= e.minAge && c.age <= e.maxAge);
      if (available.length > 0) {
        const joinHdr = document.createElement('div');
        joinHdr.className = 'section-title';
        joinHdr.style.marginTop = '2px';
        joinHdr.textContent = 'Join an Extracurricular';
        div.appendChild(joinHdr);

        available.forEach(def => {
          const hobbyMatch = c.hobbies.find(h => def.hobbyBoost.includes(h.id));
          const boostCareers = def.careerBoost.length
            ? `Boosts: ${def.careerBoost.map(id => DATA.getCareer(id)?.name || id).slice(0,2).join(', ')}`
            : '';
          const card = document.createElement('div');
          card.className = 'item-card clickable';
          card.innerHTML = `
            <div class="item-top">
              <div class="item-icon ${def.iconClass}">${def.icon}</div>
              <div class="item-info">
                <div class="item-name">${def.name}</div>
                <div class="item-sub">${def.desc}</div>
                ${hobbyMatch ? `<div class="item-detail text-accent">Your ${DATA.getHobby(hobbyMatch.id)?.name} hobby will give you a head start!</div>` : ''}
                ${boostCareers ? `<div class="item-detail text-dim">${boostCareers}</div>` : ''}
              </div>
            </div>`;
          card.addEventListener('click', () => {
            const r = Engine.joinExtracurricular(def.id);
            showToast(r.msg, r.ok ? 'good' : 'bad');
            if (r.ok) { updateDisplay(); renderActivities(); }
          });
          div.appendChild(card);
        });
      }
    }

    // Hobbies section
    const hobbyHeader = document.createElement('div');
    hobbyHeader.className = 'section-title';
    hobbyHeader.textContent = 'Hobbies';
    div.appendChild(hobbyHeader);

    const allHobbies   = DATA.getAllHobbies();
    const myHobbies    = c.hobbies;
    const myHobbyIds   = new Set(myHobbies.map(h => h.id));

    // Current hobbies — practice buttons
    if (myHobbies.length === 0) {
      const note = document.createElement('p');
      note.className = 'text-dim mb-8';
      note.style.fontSize = '.8rem';
      note.textContent = 'No hobbies yet. Start one below — skills build over time and boost your artistic and physical careers.';
      div.appendChild(note);
    }

    myHobbies.forEach(hEntry => {
      const hDef = DATA.getHobby(hEntry.id);
      if (!hDef) return;
      const card = document.createElement('div');
      card.className = 'item-card';
      card.innerHTML = `
        <div class="item-top">
          <div class="item-icon ${hDef.iconClass}">${hDef.icon}</div>
          <div class="item-info">
            <div class="item-name">${hDef.name}</div>
            <div class="item-sub">${hDef.desc}</div>
            <div class="hobby-skill-wrap">
              <div class="hobby-skill-label">
                <span>Skill</span><span>${hEntry.skillLevel}/100</span>
              </div>
              <div class="hobby-skill-bar"><div class="hobby-skill-fill" style="width:${hEntry.skillLevel}%"></div></div>
            </div>
          </div>
        </div>
        <div class="item-actions">
          <button class="btn btn-primary btn-sm" data-practice="${hEntry.id}">Practice</button>
        </div>
      `;
      card.querySelector(`[data-practice]`).addEventListener('click', () => {
        const result = Engine.practiceHobby(hEntry.id);
        if (result.ok) {
          showToast(`${hDef.name} practice — skill now ${result.skillLevel}!`, 'good');
          updateDisplay();
          renderActivities();
        }
      });
      div.appendChild(card);
    });

    // Available hobbies to start
    const availableHobbies = allHobbies.filter(h => !myHobbyIds.has(h.id) && c.age >= h.minAge);
    if (availableHobbies.length > 0) {
      const newHeader = document.createElement('div');
      newHeader.className = 'section-title';
      newHeader.style.marginTop = myHobbies.length ? '4px' : '0';
      newHeader.textContent = 'Start a Hobby';
      div.appendChild(newHeader);

      availableHobbies.forEach(hDef => {
        const boostLabel = hDef.careerBoost.length ? `Boosts: ${hDef.careerBoost.map(id=>DATA.getCareer(id)?.name||id).slice(0,3).join(', ')}` : '';
        const card = document.createElement('div');
        card.className = 'item-card clickable';
        card.innerHTML = `
          <div class="item-top">
            <div class="item-icon ${hDef.iconClass}">${hDef.icon}</div>
            <div class="item-info">
              <div class="item-name">${hDef.name}</div>
              <div class="item-sub">${hDef.desc}</div>
              ${boostLabel ? `<div class="item-detail text-accent">${boostLabel}</div>` : ''}
            </div>
          </div>`;
        card.addEventListener('click', () => {
          const result = Engine.startHobby(hDef.id);
          showToast(result.msg, result.ok ? 'good' : 'bad');
          if (result.ok) { updateDisplay(); renderActivities(); }
        });
        div.appendChild(card);
      });
    }

    // Activities section
    const actHeader = document.createElement('div');
    actHeader.className = 'section-title';
    div.appendChild(actHeader);
    actHeader.textContent = 'Activities';

    DATA.getActivities().forEach(act => {
      const locked = c.age < (act.minAge || 0);
      const card = document.createElement('div');
      card.className = `item-card${locked ? ' locked' : ' clickable'}`;
      card.innerHTML = `
        <div class="item-top">
          <div class="item-icon ${act.iconClass}">${act.icon}</div>
          <div class="item-info">
            <div class="item-name">${act.name}</div>
            <div class="item-sub">${act.desc}</div>
            ${act.cost ? `<div class="item-detail text-red">-${DATA.fmtMoney(act.cost)}</div>` : ''}
          </div>
        </div>`;
      if (!locked) {
        card.addEventListener('click', () => {
          if (act.casino) { closeModal('activities'); showCasinoModal(); return; }
          const r = Engine.doActivity(act.id);
          if (!r.ok) { showToast(r.msg, 'bad'); return; }
          showToast(`${act.name} done.`, 'good');
          addFeedEntry({ text:act.name, type:'activity', effects:act.effects, age:c.age });
          updateDisplay(); closeModal('activities');
        });
      }
      div.appendChild(card);
    });
  }

  function showCasinoModal() {
    const c = State.getChar();
    const bets = [100, 500, 1000, 5000, 10000].filter(b => b <= c.money);
    if (!bets.length) { showToast('Need at least $100 to gamble.', 'bad'); return; }
    const overlay = qs('#modal-event');
    qs('#evt-category').textContent = 'Adventure';
    qs('#evt-category').className = 'evt-category cat-adventure';
    qs('#evt-title').textContent = 'Casino Night';
    qs('#evt-desc').textContent  = `You have ${DATA.fmtMoney(c.money)}. How much do you bet?`;
    const choicesDiv = qs('#evt-choices'); choicesDiv.innerHTML = '';
    bets.forEach(amt => {
      const btn = document.createElement('button');
      btn.className = 'evt-choice'; btn.textContent = `Bet ${DATA.fmtMoney(amt)}`;
      btn.addEventListener('click', () => { overlay.classList.add('hidden'); doCasinoBet(amt); });
      choicesDiv.appendChild(btn);
    });
    const cancel = document.createElement('button');
    cancel.className = 'evt-choice'; cancel.textContent = 'Leave casino';
    cancel.addEventListener('click', () => overlay.classList.add('hidden'));
    choicesDiv.appendChild(cancel);
    overlay.classList.remove('hidden');
  }

  function doCasinoBet(amount) {
    const r = Engine.casino(amount);
    showToast(r.win ? `Won ${DATA.fmtMoney(r.amount)}!` : `Lost ${DATA.fmtMoney(r.amount)}.`, r.win ? 'good' : 'bad');
    updateDisplay();
  }

  // ── RELATIONSHIPS modal ───────────────────────────────────────
  function renderRelationships() {
    const g = State.get(); const c = g.character;
    const div = qs('#relationships-content'); div.innerHTML = '';

    // Meet someone / socialize actions at top
    const actHdr = document.createElement('div'); actHdr.className = 'section-title'; actHdr.textContent = 'Connect'; div.appendChild(actHdr);

    // Make a school friend (age 6–18)
    if (c.age >= 6 && c.age <= 18) {
      const scBtn = document.createElement('button');
      scBtn.className = 'btn btn-secondary btn-full mb-8';
      scBtn.innerHTML = 'Meet a Classmate<br><small class="text-dim">Make a new friend at school</small>';
      scBtn.addEventListener('click', () => {
        const r = Engine.socializeAtSchool();
        showToast(r.msg, r.ok ? 'good' : 'bad');
        if (r.ok) { updateDisplay(); renderRelationships(); }
      });
      div.appendChild(scBtn);
    }

    // Meet a romantic interest (age 12+)
    if (c.age >= 12 && c.sexuality !== 'asexual' && !State.getPartner()) {
      const romBtn = document.createElement('button');
      romBtn.className = 'btn btn-secondary btn-full mb-8';
      const romLabel = c.age < 18 ? 'Develop a Crush' : 'Meet Someone Romantically';
      const romSub   = c.age < 18 ? 'A school crush' : 'Start a potential relationship';
      romBtn.innerHTML = `${romLabel}<br><small class="text-dim">${romSub}</small>`;
      romBtn.addEventListener('click', () => {
        const r = Engine.meetRomanticInterest();
        showToast(r.msg, r.ok ? 'good' : 'bad');
        if (r.ok) { updateDisplay(); renderRelationships(); }
      });
      div.appendChild(romBtn);
    }

    if (!g.relationships.length) {
      const empty = document.createElement('div'); empty.className = 'empty-state';
      empty.innerHTML = '<div class="empty-icon">?</div>No relationships yet.';
      div.appendChild(empty); return;
    }
    const groups = { partner:'Romantic', family:'Family', friend:'Friends', ex:'Former Partners & Exes' };
    for (const [type, label] of Object.entries(groups)) {
      const rels = g.relationships.filter(r => r.type === type);
      if (!rels.length) continue;
      const hdr = document.createElement('div'); hdr.className = 'section-title'; hdr.textContent = label; div.appendChild(hdr);
      rels.forEach(rel => {
        const active = rel.status === 'active';
        const card = document.createElement('div');
        card.className = `item-card${active ? ' clickable' : ' rel-dead'}`;
        const iconMap = { father:'Fa', mother:'Mo', sibling:'Si', child:'Ch', friend:'Fr', crush:'Cr', partner:'Pa', spouse:'Sp', ex:'Ex' };
        const icon = iconMap[rel.subtype] || '??';
        card.innerHTML = `
          <div class="item-top">
            <div class="item-icon ic-rose">${icon}</div>
            <div class="item-info">
              <div class="item-name">${rel.name} <span class="text-dim">(${rel.age})</span></div>
              <div class="item-sub">${ucFirst(rel.subtype)}${!active ? ' · ' + rel.status : ''}</div>
            </div>
            <span class="text-dim" style="font-size:.78rem;font-weight:700">${rel.relationship}%</span>
          </div>
          <div class="rel-meter"><div class="rel-meter-bar"><div class="rel-meter-fill" style="width:${rel.relationship}%"></div></div></div>
        `;
        if (active) card.addEventListener('click', () => showRelActionModal(rel));
        div.appendChild(card);
      });
    }
  }

  function showRelActionModal(rel) {
    const c = State.getChar();
    closeModal('relationships');
    qs('#relaction-title').textContent = rel.name;
    const div = qs('#relaction-content'); div.innerHTML = '';

    const actions = [
      { id:'spend_time', label:'Spend Time Together', sub:'Bond and boost happiness.' },
      { id:'compliment', label:'Give a Compliment',   sub:'Boost relationship quality.' },
      { id:'gift',       label:'Give a Gift',          sub:'-$100, big boost.' },
      { id:'argue',      label:'Pick a Fight',         sub:'Damages the relationship.' },
    ];
    if (rel.type === 'partner') {
      actions.push({ id:'date', label:'Go on a Date', sub:'-$80, boost mood and bond.' });
      if (rel.subtype !== 'spouse') actions.push({ id:'propose', label:'Propose', sub:'Need 60+ relationship.', disabled: rel.relationship < 60 });
    }
    actions.forEach(act => {
      const btn = document.createElement('button');
      btn.className = 'btn btn-secondary btn-full mb-8';
      btn.innerHTML = `${act.label}<br><small class="text-dim">${act.sub}</small>`;
      btn.disabled = !!act.disabled;
      btn.addEventListener('click', () => {
        const r = Engine.relationshipAction(rel.id, act.id);
        if (!r.ok) { showToast(r.msg, 'bad'); return; }
        showToast(r.msg, 'good'); closeModal('relaction'); updateDisplay();
      });
      div.appendChild(btn);
    });
    if (rel.traits?.length) {
      const tl = document.createElement('p');
      tl.className = 'text-dim'; tl.style.marginTop = '8px';
      tl.textContent = `Traits: ${rel.traits.join(', ')}`;
      div.appendChild(tl);
    }
    openModal('relaction');
  }

  // ── CAREER modal ──────────────────────────────────────────────
  function renderCareer() {
    const g = State.get(); const c = g.character; const div = qs('#career-content'); div.innerHTML = '';

    // Current job
    const hdr = document.createElement('div'); hdr.className = 'section-title'; hdr.textContent = 'Current Position'; div.appendChild(hdr);
    if (c.career.retired) {
      div.appendChild(makeEmpty('Re', 'Enjoying retirement.'));
    } else if (c.career.jobId) {
      const career = DATA.getCareer(c.career.jobId);
      const next   = career.promotions[c.career.promotionLevel + 1];
      const card   = document.createElement('div');
      card.className = 'item-card active-item';
      card.innerHTML = `
        <div class="item-top">
          <div class="item-icon ${career.iconClass}">${career.icon}</div>
          <div class="item-info">
            <div class="item-name">${career.name}</div>
            <div class="item-sub">${c.career.title}</div>
            <div class="item-detail text-green">${DATA.fmtMoney(c.career.salary)}/yr · Perf. ${c.career.performance}</div>
            <div class="item-detail">${next ? `Next: ${next.title} (${next.yearsMin} yrs min)` : 'Top of career ladder'}</div>
          </div>
        </div>
        <div class="item-actions">
          <button class="btn btn-success btn-sm" id="btn-work-hard">Work Hard</button>
          <button class="btn btn-ghost btn-sm" id="btn-slack">Slack Off</button>
          <button class="btn btn-danger btn-sm" id="btn-quit-job">Quit</button>
        </div>`;
      div.appendChild(card);
      qs('#btn-work-hard').addEventListener('click', () => { const r=Engine.workHard(); showToast(r.msg,'good'); updateDisplay(); closeModal('career'); });
      qs('#btn-slack').addEventListener('click', () => { const r=Engine.slackOff(); showToast(r.msg,r.ok?'info':'bad'); updateDisplay(); closeModal('career'); });
      qs('#btn-quit-job').addEventListener('click', () => { if(confirm(`Quit as ${c.career.title}?`)){Engine.quitJob(false);showToast('Left job.','info');updateDisplay();renderCareer();} });
    } else {
      if (c.age < 16) { div.appendChild(makeEmpty('Jr', 'Too young to work. Focus on school!')); }
      else { div.appendChild(makeEmpty('?', 'Unemployed. Browse the job board below.')); }
    }

    // Hobby + extracurricular bonuses summary
    if (c.hobbies.length > 0 || c.extracurriculars.length > 0) {
      const hbHdr = document.createElement('div'); hbHdr.className = 'section-title'; hbHdr.textContent = 'Career Bonuses'; div.appendChild(hbHdr);
      const hbCard = document.createElement('div'); hbCard.className = 'item-card'; hbCard.style.background = 'var(--accent-light)';
      const hobbyLines = c.hobbies.map(h => {
        const hDef = DATA.getHobby(h.id);
        return hDef ? `Hobby: ${hDef.name} (skill ${h.skillLevel})${hDef.careerBoost.length ? ' — boosts ' + hDef.careerBoost.map(id=>DATA.getCareer(id)?.name||id).slice(0,2).join(', ') : ''}` : '';
      }).filter(Boolean);
      const extLines = c.extracurriculars.map(e => {
        const def = DATA.getExtracurricular(e.id);
        return def ? `School: ${def.name} (skill ${e.skillLevel})${def.careerBoost.length ? ' — boosts ' + def.careerBoost.map(id=>DATA.getCareer(id)?.name||id).slice(0,2).join(', ') : ''}` : '';
      }).filter(Boolean);
      hbCard.innerHTML = `<div class="text-dim" style="font-size:.8rem;line-height:1.7">${[...hobbyLines,...extLines].join('<br>')}</div>`;
      div.appendChild(hbCard);
    }

    // Job board
    const jobBoardHdr = document.createElement('div'); jobBoardHdr.className = 'section-title'; jobBoardHdr.textContent = 'Job Board'; div.appendChild(jobBoardHdr);

    const cats = [
      { id:'entry', label:'Entry Level' }, { id:'trade', label:'Trade & Vocational' },
      { id:'business', label:'Business & Finance' }, { id:'professional', label:'Professional' },
      { id:'medical', label:'Medical' }, { id:'legal', label:'Legal' },
      { id:'education', label:'Education' }, { id:'tech', label:'Technology' }, { id:'artistic', label:'Arts & Creative' },
    ];

    cats.forEach(cat => {
      const careers = DATA.getAllCareers().filter(car => car.category === cat.id && car.id !== c.career.jobId);
      if (!careers.length) return;
      const catHdr = document.createElement('div'); catHdr.className = 'section-title'; catHdr.style.cssText='margin-top:10px;font-size:.67rem'; catHdr.textContent = cat.label; div.appendChild(catHdr);
      careers.forEach(career => {
        const check = DATA.meetsCareerReqs(career, c);
        const hobbyB = DATA.getHobbyCareerBonus(c.hobbies, career.id);
        const extB   = DATA.getExtracurricularCareerBonus(c.extracurriculars, career.id);
        const totalB = hobbyB + extB;
        const card = document.createElement('div');
        card.className = `item-card${check.meets ? ' clickable' : ' locked'}`;
        card.innerHTML = `
          <div class="item-top">
            <div class="item-icon ${career.iconClass}">${career.icon}</div>
            <div class="item-info">
              <div class="item-name">${career.name}</div>
              <div class="item-sub text-green">${DATA.fmtMoney(career.salary.base)} – ${DATA.fmtMoney(career.salary.max)}/yr</div>
              ${check.meets ? '' : `<div class="item-lock">Requires: ${check.missing.join(', ')}</div>`}
              ${totalB > 0 ? `<div class="item-detail text-accent">Bonus: +${Math.round(totalB*10)}% salary${hobbyB>0&&extB>0?' (hobby + school)':hobbyB>0?' (hobby)':' (school activity)'}</div>` : ''}
            </div>
          </div>`;
        if (check.meets) {
          card.addEventListener('click', () => {
            const r = Engine.applyJob(career.id);
            showToast(r.msg, r.ok ? 'good' : 'bad'); if(r.ok){updateDisplay();renderCareer();}
          });
        }
        div.appendChild(card);
      });
    });
  }

  // ── EDUCATION modal ───────────────────────────────────────────
  function renderEducation() {
    const c = State.getChar(); const div = qs('#education-content'); div.innerHTML = '';
    const edu = c.education;
    const levelLabels = { none:'No formal education', elementary:'Elementary School', middleschool:'Middle School', highschool:'High School Diploma', tradeschool:'Trade School', some_college:'Some College', bachelor:"Bachelor's Degree", master:"Master's Degree", doctorate:'Doctorate' };

    const statusHdr = document.createElement('div'); statusHdr.className = 'section-title'; statusHdr.textContent = 'Current Education'; div.appendChild(statusHdr);
    const statusCard = document.createElement('div'); statusCard.className = 'item-card';
    const certs = edu.certificates.map(id => { const c2=DATA.TRADE_CERTIFICATES.find(t=>t.id===id); return c2?c2.name:id; }).join(', ');
    statusCard.innerHTML = `
      <div class="flex-between mb-8">
        <span class="fw-700">${levelLabels[edu.level]||edu.level}</span>
        ${edu.major ? `<span class="badge badge-accent">${edu.major}</span>` : ''}
      </div>
      ${edu.institution ? `<div class="text-dim">${edu.institution}</div>` : ''}
      ${certs ? `<div class="text-dim mt-4">Certificates: ${certs}</div>` : ''}
      ${edu.studentLoan > 0 ? `<div class="text-red mt-4">Loan: -${DATA.fmtMoney(edu.studentLoan)}</div>` : ''}
      ${edu.inSchool ? `<div class="text-accent mt-4">In school — Year ${edu.schoolYear}/${edu.schoolDuration}</div>` : ''}
    `;
    div.appendChild(statusCard);

    if (edu.inSchool) { const n=document.createElement('p'); n.className='text-dim'; n.textContent='Currently enrolled. Age up to progress.'; div.appendChild(n); return; }
    if (c.age < 17)   { const n=document.createElement('p'); n.className='text-dim'; n.textContent='Education options unlock at 17.'; div.appendChild(n); return; }

    // Trade certificates
    const tradeHdr = document.createElement('div'); tradeHdr.className = 'section-title'; tradeHdr.textContent = 'Trade School'; div.appendChild(tradeHdr);
    DATA.TRADE_CERTIFICATES.forEach(cert => {
      const owned = edu.certificates.includes(cert.id);
      const canAff = c.money >= cert.cost;
      const card = document.createElement('div');
      card.className = `item-card${!owned && canAff ? ' clickable' : owned ? ' good-item' : ''}`;
      card.innerHTML = `
        <div class="flex-between">
          <span class="fw-700">${cert.name}</span>
          <span class="${owned ? 'text-green' : 'text-dim'}">${owned ? 'Owned' : DATA.fmtMoney(cert.cost)}</span>
        </div>
        <div class="text-dim">${cert.duration}-year program</div>`;
      if (!owned && canAff) {
        card.addEventListener('click', () => { const r=Engine.enrollTrade(cert.id); showToast(r.msg,r.ok?'good':'bad'); if(r.ok){updateDisplay();renderEducation();} });
      }
      div.appendChild(card);
    });

    // University
    if (c.age >= 18) {
      const uniHdr = document.createElement('div'); uniHdr.className = 'section-title'; uniHdr.textContent = 'University'; div.appendChild(uniHdr);
      const lvl = edu.level;
      if (lvl === 'doctorate') { const n=document.createElement('p'); n.className='text-green'; n.textContent='You hold the highest available degree.'; div.appendChild(n); return; }
      const targetMap = { else:'Bachelor', bachelor:'Master', master:'Doctorate' };
      const durationMap = { else:4, bachelor:2, master:4 };
      const baseCostMap = { else:50000, bachelor:40000, master:60000 };
      const key = lvl === 'bachelor' ? 'bachelor' : lvl === 'master' ? 'master' : 'else';
      const targetDeg = targetMap[key]; const duration = durationMap[key]; const baseCost = baseCostMap[key];

      const majorSel = document.createElement('select'); majorSel.className = 'form-input select-input mb-8';
      DATA.UNIVERSITY_MAJORS.forEach(m => { const o=document.createElement('option'); o.value=m; o.textContent=m; majorSel.appendChild(o); });
      div.appendChild(majorSel);

      [0, Math.round(baseCost*0.5), baseCost].forEach(loan => {
        const oop = Math.max(0, baseCost - loan);
        const canAff = c.money >= oop;
        const card = document.createElement('div');
        card.className = `item-card${canAff ? ' clickable' : ''}`;
        card.innerHTML = `
          <div class="flex-between">
            <span class="fw-700">${targetDeg} — ${loan>0?DATA.fmtMoney(loan)+' loan':'Self-funded'}</span>
            <span class="${canAff?'text-green':'text-red'}">${DATA.fmtMoney(oop)} upfront</span>
          </div>
          <div class="text-dim">${duration} years</div>`;
        if (canAff) { card.addEventListener('click', () => { const r=Engine.enrollUniversity(majorSel.value,loan); showToast(r.msg,r.ok?'good':'bad'); if(r.ok){updateDisplay();renderEducation();} }); }
        div.appendChild(card);
      });
    }
  }

  // ── ASSETS modal ──────────────────────────────────────────────
  function renderAssets() {
    const c = State.getChar(); const div = qs('#assets-content'); div.innerHTML = '';
    const nw = Engine.getNetWorth(c);

    const sumCard = document.createElement('div'); sumCard.className = 'summary-card mb-8';
    sumCard.innerHTML = `
      <div class="flex-between">
        <span class="fw-700">Net Worth</span>
        <span class="text-green fw-700">${DATA.fmtMoney(nw)}</span>
      </div>
      <div class="text-dim">Cash: ${DATA.fmtMoney(c.money)} · Investments: ${DATA.fmtMoney(c.assets.investments)}</div>
      ${c.education.studentLoan>0?`<div class="text-red">Loan: -${DATA.fmtMoney(c.education.studentLoan)}</div>`:''}
    `;
    div.appendChild(sumCard);

    // Houses
    mkSection(div, 'Properties');
    if (!c.assets.houses.length) div.appendChild(makeEmpty('Ho', 'No properties owned.'));
    else c.assets.houses.forEach((h,idx) => {
      const card = document.createElement('div'); card.className = 'item-card';
      card.innerHTML = `
        <div class="item-top">
          <div class="item-icon ic-teal">Ho</div>
          <div class="item-info">
            <div class="item-name">${h.name}</div>
            <div class="item-sub text-green">${DATA.fmtMoney(h.value)}</div>
            ${h.mortgage>0?`<div class="item-detail text-red">Mortgage: -${DATA.fmtMoney(h.mortgage)}</div>`:'<div class="item-detail text-green">Fully owned</div>'}
          </div>
        </div>
        <div class="item-actions"><button class="btn btn-danger btn-sm" data-sell-house="${idx}">Sell</button></div>`;
      card.querySelector(`[data-sell-house]`).addEventListener('click', () => { if(confirm('Sell property?')){Engine.sellHouse(idx);showToast('Property sold.','good');updateDisplay();renderAssets();} });
      div.appendChild(card);
    });

    mkSection(div, 'Buy Property');
    [{ name:'Studio Apartment',price:80000},{ name:'Small House',price:200000},{ name:'Family Home',price:400000},{ name:'Luxury Condo',price:800000},{ name:'Mansion',price:3000000}].forEach(h => {
      const down = Math.round(h.price*0.2); const canAff = c.money >= down;
      const row = document.createElement('div'); row.className = 'buy-item';
      row.innerHTML = `<div><div class="buy-item-name">${h.name}</div><div class="buy-item-sub">Down: ${DATA.fmtMoney(down)}</div></div><div class="flex-row"><span class="buy-item-price">${DATA.fmtMoney(h.price)}</span>${canAff?`<button class="btn btn-success btn-xs">Buy</button>`:''}</div>`;
      if (canAff) row.querySelector('.btn-success').addEventListener('click', () => { const r=Engine.buyHouse(h); showToast(r.ok?'Property purchased!':r.msg,r.ok?'good':'bad'); updateDisplay();renderAssets(); });
      div.appendChild(row);
    });

    mkSection(div, 'Vehicles');
    if (!c.assets.cars.length) div.appendChild(makeEmpty('Ca', 'No vehicles.'));
    else c.assets.cars.forEach((car,idx) => {
      const card = document.createElement('div'); card.className='item-card';
      card.innerHTML = `<div class="item-top"><div class="item-icon ic-blue">Ca</div><div class="item-info"><div class="item-name">${car.name}</div><div class="item-sub text-green">${DATA.fmtMoney(car.value)}</div></div></div><div class="item-actions"><button class="btn btn-danger btn-sm" data-sell-car="${idx}">Sell</button></div>`;
      card.querySelector(`[data-sell-car]`).addEventListener('click', () => { Engine.sellCar(idx);showToast('Sold.','good');updateDisplay();renderAssets(); });
      div.appendChild(card);
    });

    mkSection(div, 'Buy a Vehicle');
    [{ name:'Used Hatchback',price:5000},{ name:'Sedan',price:25000},{ name:'SUV',price:45000},{ name:'Sports Car',price:80000},{ name:'Luxury Car',price:150000},{ name:'Supercar',price:500000}].forEach(car => {
      const canAff = c.money >= car.price;
      const row = document.createElement('div'); row.className='buy-item';
      row.innerHTML = `<div class="buy-item-name">${car.name}</div><div class="flex-row"><span class="buy-item-price">${DATA.fmtMoney(car.price)}</span>${canAff?`<button class="btn btn-success btn-xs">Buy</button>`:''}</div>`;
      if (canAff) row.querySelector('.btn-success').addEventListener('click', () => { const r=Engine.buyCar(car);showToast(r.ok?`Bought the ${car.name}!`:r.msg,r.ok?'good':'bad');updateDisplay();renderAssets(); });
      div.appendChild(row);
    });

    mkSection(div, 'Investments');
    const invCard = document.createElement('div'); invCard.className='item-card';
    invCard.innerHTML=`<div class="flex-between mb-8"><span class="fw-700">Portfolio</span><span class="text-green fw-700">${DATA.fmtMoney(c.assets.investments)}</span></div><div class="item-actions"><button class="btn btn-success btn-sm" id="inv-stocks">Buy Stocks</button><button class="btn btn-secondary btn-sm" id="inv-crypto">Buy Crypto</button></div>`;
    div.appendChild(invCard);
    qs('#inv-stocks').addEventListener('click', () => { if(c.money<500){showToast('Need $500.','bad');return;} const r=Engine.invest(Math.min(c.money,Math.round(c.money*0.3)),'stocks');showToast('Invested in stocks.','good');updateDisplay();renderAssets(); });
    qs('#inv-crypto').addEventListener('click', () => { if(c.money<200){showToast('Need $200.','bad');return;} Engine.invest(Math.min(c.money,Math.round(c.money*0.2)),'crypto');updateDisplay();renderAssets(); });
  }

  // ── LIFE LOG modal ────────────────────────────────────────────
  function renderLog() {
    const g = State.get(); const div = qs('#log-content'); div.innerHTML='';
    if (!g?.log.length) { div.innerHTML='<div class="empty-state"><div class="empty-icon">?</div>Your story is just beginning.</div>'; return; }
    [...g.log].reverse().forEach(entry => {
      const el = document.createElement('div'); el.className='log-entry';
      el.innerHTML=`<div class="log-age">Age ${entry.age}</div><div>${entry.text}</div>`;
      div.appendChild(el);
    });
  }

  // ── DEATH screen ──────────────────────────────────────────────
  function showDeathScreen() {
    const s = Engine.getLifeSummary();
    qs('#death-name').textContent  = s.name;
    qs('#death-years').textContent = `${s.birthYear} – ${s.birthYear+s.age} · Aged ${s.age} · ${s.country}`;
    qs('#death-cause').textContent = `Cause of death: ${s.cause}`;
    qs('#death-stats').innerHTML = [
      { label:'Net Worth',       value:DATA.fmtMoney(s.netWorth) },
      { label:'Final Health',    value:s.finalStats.health+'%' },
      { label:'Final Happiness', value:s.finalStats.happiness+'%' },
      { label:'Final Smarts',    value:s.finalStats.smarts+'%' },
    ].map(x=>`<div class="death-stat-card"><div class="dsc-label">${x.label}</div><div class="dsc-value">${x.value}</div></div>`).join('');
    qs('#death-highlights').innerHTML = s.highlights.length
      ? `<h4>Life Highlights</h4>${s.highlights.map(h=>`<div class="highlight-item">· ${h}</div>`).join('')}` : '';
    qs('#death-achievements').innerHTML = s.achievements.map(a=>`<div class="ach-badge">${a.name}</div>`).join('');
    if (s.cheatsUsed) qs('#cheats-watermark').classList.remove('hidden');
    showScreen('death');
  }

  // ── Character preview ─────────────────────────────────────────
  function showCharacterPreview({ characterData, relationships }) {
    const c  = characterData;
    const wc = DATA.WEALTH_CLASSES.find(w => w.id === c.wealthClass);
    const parents   = relationships.filter(r => r.subtype==='father'||r.subtype==='mother');
    const siblings  = relationships.filter(r => r.subtype==='sibling');

    qs('#preview-name').textContent = `${c.firstName} ${c.lastName}`;
    const sexLabel = c.sexualityKnown && c.sexuality !== 'straight'
      ? ` · ${DATA.SEXUALITIES.find(s=>s.id===c.sexuality)?.label || ''}`
      : '';
    qs('#preview-meta').textContent = `${ucFirst(c.gender)} · ${c.country} · ${wc?.label||c.wealthClass}${sexLabel}`;
    qs('#preview-stats').innerHTML = [
      { label:'Health',    val:c.health,    color:'var(--health)' },
      { label:'Happiness', val:c.happiness, color:'var(--happiness)' },
      { label:'Smarts',    val:c.smarts,    color:'var(--smarts)' },
      { label:'Looks',     val:c.looks,     color:'var(--looks)' },
    ].map(s => `
      <div class="preview-stat">
        <div class="ps-label"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${s.color}"></span>${s.label}</div>
        <div class="ps-val">${s.val}</div>
      </div>`).join('');
    qs('#preview-family').innerHTML =
      `Parents: ${parents.map(p=>p.name).join(' &amp; ')}<br>` +
      (siblings.length ? `Siblings: ${siblings.map(s=>s.name).join(', ')}` : 'Only child');

    qs('#char-preview').classList.remove('hidden');
    qs('#preview-actions').classList.remove('hidden');
    qs('#step-customize').classList.add('hidden');
    qs('#initial-actions').classList.add('hidden');
  }

  // ── Populate country selector ─────────────────────────────────
  function populateCountrySelect() {
    const sel = qs('#custom-country');
    DATA.COUNTRIES.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.name; opt.textContent = c.name;
      sel.appendChild(opt);
    });
  }

  // ── Helpers ───────────────────────────────────────────────────
  function ucFirst(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }

  function mkSection(parent, label) {
    const hdr = document.createElement('div'); hdr.className = 'section-title'; hdr.textContent = label; parent.appendChild(hdr);
  }

  function makeEmpty(iconText, text) {
    const el = document.createElement('div'); el.className = 'empty-state';
    el.innerHTML = `<div class="empty-icon">${iconText}</div>${text}`;
    return el;
  }

  return {
    showScreen, updateDisplay, addFeedEntry, rebuildFeed,
    showEventModal, showToast, openModal, closeModal,
    renderActivities, renderRelationships, renderCareer, renderEducation, renderAssets, renderLog,
    showDeathScreen, showCharacterPreview, populateCountrySelect,
  };
})();
