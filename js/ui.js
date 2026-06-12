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
    const moodTxt = c.mood ? ` · ${c.mood.name}` : '';
    qs('#hdr-age').textContent  = `Age ${c.age} · ${c.country}${moodTxt}`;
    // Mood color on age line
    const ageEl = qs('#hdr-age');
    if (c.mood) ageEl.style.color = c.mood.color;
    else ageEl.style.color = '';
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
    setBar('mind',      c.mentalHealth ?? 80);

    qs('#ageup-next').textContent = c.age + 1;
    qs('#btn-age-up').disabled = false;

    // ── Notification badges ──────────────────────────────────
    const setBadge = (id, val) => { const el=qs(id); if(!el) return; if(val){ el.textContent=val>9?'!':val; el.style.display=''; } else el.style.display='none'; };
    // Activities: addiction active, jail, low mental health
    let actBadge = 0;
    if ((c.addictions||[]).length) actBadge++;
    if (c.inJail) actBadge++;
    if ((c.mentalHealth||80) < 30) actBadge++;
    if (c.activeStartup) actBadge++;
    setBadge('#badge-activities', actBadge);
    // Relationships: partner bond low, ex reached out, enemy
    const g2 = State.get();
    let relBadge = 0;
    const partnerRel = g2.relationships.find(r=>r.type==='partner'&&r.status==='active');
    if (partnerRel && partnerRel.relationship < 30) relBadge++;
    if (g2.relationships.some(r=>r.reachedOut)) relBadge++;
    if (g2.relationships.some(r=>r.type==='enemy'&&r.status==='active')) relBadge++;
    setBadge('#badge-relationships', relBadge);
    // Career: no job (age 18+), startup resolved
    setBadge('#badge-career', c.age>=18 && !c.career.jobId && !c.career.retired && !c.inMilitary ? 1 : 0);
    // Assets: loan outstanding, low money
    setBadge('#badge-assets', (c.personalLoan>0 || c.money<500) ? 1 : 0);

    // Life goal indicator
    const goalEl = qs('#hdr-lifegoal');
    if (goalEl) {
      if (c.lifeGoal) {
        const goalDef = Engine.LIFE_GOALS.find(gl => gl.id === c.lifeGoal);
        if (goalDef) {
          goalEl.textContent = c.lifeGoalCompleted ? `Goal: ${goalDef.label} ✓` : `Goal: ${goalDef.label}`;
          goalEl.style.color = c.lifeGoalCompleted ? 'var(--green)' : 'var(--accent)';
          goalEl.style.display = '';
        }
      } else {
        goalEl.style.display = 'none';
      }
    }

    // Energy dots
    const energy    = c.energy    ?? 0;
    const energyMax = c.energyMax ?? 3;
    const dotsEl = qs('#energy-dots');
    if (dotsEl) {
      dotsEl.innerHTML = '';
      for (let i = 0; i < Math.min(energyMax, 10); i++) {
        const d = document.createElement('span');
        d.className = 'e-dot' + (i < energy ? '' : ' e-empty');
        dotsEl.appendChild(d);
      }
    }
    const valEnergy = qs('#val-energy');
    if (valEnergy) valEnergy.textContent = `${energy}/${energyMax}`;
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

    // ── Family Finance (ask parents for money, age ≤ 30) ──────
    if (c.age <= 30) {
      const g = State.get();
      const livingParents = g.relationships.filter(r => (r.subtype==='father'||r.subtype==='mother') && r.status==='active');
      if (livingParents.length) {
        const famHdr = document.createElement('div'); famHdr.className = 'section-title'; famHdr.textContent = 'Family'; div.appendChild(famHdr);
        const alreadyAsked = c.askedParentsAge === c.age;
        const avgRel = livingParents.reduce((s,p)=>s+p.relationship,0)/livingParents.length;
        const parentCard = document.createElement('div');
        parentCard.className = 'item-card' + (alreadyAsked ? '' : ' clickable');
        parentCard.innerHTML = `
          <div class="item-top">
            <div class="item-icon ic-rose">$</div>
            <div class="item-info">
              <div class="item-name">Ask Parents for Money</div>
              <div class="item-sub">${alreadyAsked ? 'Already asked this year' : `Relationship ${Math.round(avgRel)}% · ${avgRel >= 70 ? 'They like you — good odds' : 'Improve the relationship first'}`}</div>
            </div>
          </div>`;
        if (!alreadyAsked) {
          parentCard.addEventListener('click', () => {
            const r = Engine.askParentsForMoney();
            showToast(r.msg, r.ok ? 'good' : 'bad');
            if (r.ok) updateDisplay();
            renderActivities();
          });
        }
        div.appendChild(parentCard);
      }
    }

    // ── Pets section ───────────────────────────────────────────
    const petHdr = document.createElement('div'); petHdr.className = 'section-title'; petHdr.textContent = 'Pet'; div.appendChild(petHdr);
    if (c.pet && c.pet.alive) {
      const def = DATA.getPet(c.pet.type);
      const petCard = document.createElement('div'); petCard.className = 'item-card';
      petCard.innerHTML = `
        <div class="item-top">
          <div class="item-icon ${def.iconClass}">${def.icon}</div>
          <div class="item-info">
            <div class="item-name">${c.pet.name} the ${def.name}</div>
            <div class="item-sub">Age ${c.pet.age} · Health ${c.pet.health}${c.pet.sick ? ' <span style="color:var(--red)">· Sick!</span>' : ''}</div>
          </div>
        </div>
        <div class="item-actions">
          <button class="btn btn-primary btn-sm" id="pet-play">Play</button>
          ${c.pet.sick || c.pet.health < 70 ? `<button class="btn btn-success btn-sm" id="pet-vet">Vet -${DATA.fmtMoney(def.vetCost)}</button>` : ''}
        </div>`;
      petCard.querySelector('#pet-play')?.addEventListener('click', () => {
        const r = Engine.playWithPet(); showToast(r.msg, r.ok ? 'good' : 'bad'); updateDisplay(); renderActivities();
      });
      petCard.querySelector('#pet-vet')?.addEventListener('click', () => {
        const r = Engine.vetPet(); showToast(r.msg, r.ok ? 'good' : 'bad'); updateDisplay(); renderActivities();
      });
      div.appendChild(petCard);
    } else if (!c.pet || !c.pet.alive) {
      const adoptBtn = document.createElement('button');
      adoptBtn.className = 'btn btn-secondary btn-full mb-8';
      adoptBtn.innerHTML = 'Adopt a Pet<br><small class="text-dim">Choose your companion</small>';
      adoptBtn.addEventListener('click', () => { closeModal('activities'); showAdoptPetModal(); });
      div.appendChild(adoptBtn);
    }

    // ── Nightlife & Partying (age 16+) ────────────────────────
    if (c.age >= 16) {
      const partyHdr = document.createElement('div'); partyHdr.className = 'section-title'; partyHdr.textContent = 'Nightlife'; div.appendChild(partyHdr);
      const partyTypes = [
        { id:'house', label:'House Party',   sub:'Free · meet people · 1 energy', age:16 },
        { id:'club',  label:'Night at the Club', sub:'$60–140 · wild fun · 1 energy', age:18 },
      ];
      partyTypes.forEach(pt => {
        if (c.age < pt.age) return;
        const btn = document.createElement('div'); btn.className = 'item-card clickable';
        btn.innerHTML = `<div class="item-top"><div class="item-icon ic-rose">Pt</div><div class="item-info"><div class="item-name">${pt.label}</div><div class="item-sub">${pt.sub}</div></div></div>`;
        btn.addEventListener('click', () => {
          const r = Engine.goParty(pt.id);
          showToast(r.msg, r.ok ? 'good' : 'bad');
          if (r.ok) { updateDisplay(); renderActivities(); }
        });
        div.appendChild(btn);
      });
    }

    // ── Substances (age 18+) ──────────────────────────────────
    if (c.age >= 18) {
      const subHdr = document.createElement('div'); subHdr.className = 'section-title'; subHdr.textContent = 'Substances'; div.appendChild(subHdr);
      const subs = Object.entries(Engine.SUBSTANCES);
      subs.forEach(([id, sub]) => {
        const canAff = c.money >= sub.cost;
        const card = document.createElement('div'); card.className = `item-card${canAff ? ' clickable' : ''}`;
        const addicted = (c.addictions||[]).find(a => a.id === id);
        const riskColor = sub.addictChance >= 0.2 ? 'var(--red)' : sub.addictChance >= 0.1 ? 'var(--yellow)' : 'var(--accent)';
        card.innerHTML = `
          <div class="item-top">
            <div class="item-icon" style="background:${riskColor};color:#fff;border-radius:8px;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:.65rem;font-weight:700">Sub</div>
            <div class="item-info">
              <div class="item-name">${sub.label}</div>
              <div class="item-sub">${DATA.fmtMoney(sub.cost)} · +${sub.happy} mood · ${sub.health} health</div>
              <div class="item-detail" style="color:${riskColor}">Addiction risk: ${Math.round(sub.addictChance*100)}%${addicted ? ` · <span style="color:var(--red)">ADDICTED (sev. ${addicted.severity})</span>` : ''}</div>
            </div>
          </div>`;
        if (canAff) {
          card.addEventListener('click', () => {
            const r = Engine.useSubstance(id);
            showToast(r.msg, r.ok ? 'good' : 'bad');
            if (r.ok) { updateDisplay(); renderActivities(); }
          });
        }
        div.appendChild(card);
      });
      // Rehab button if addicted
      if ((c.addictions||[]).length > 0) {
        const rehabCard = document.createElement('div'); rehabCard.className = 'item-card clickable';
        rehabCard.style.borderColor = 'var(--green)';
        rehabCard.innerHTML = `<div class="item-top"><div class="item-icon" style="background:var(--green);color:#fff;border-radius:8px;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:.65rem;font-weight:700">Rh</div><div class="item-info"><div class="item-name">Seek Rehab</div><div class="item-sub">$8,000 · chance to clear addictions</div><div class="item-detail text-dim">Addictions: ${c.addictions.map(a=>a.label).join(', ')}</div></div></div>`;
        rehabCard.addEventListener('click', () => {
          const r = Engine.seekRehab();
          showToast(r.msg, r.ok ? 'good' : 'bad');
          if (r.ok) { updateDisplay(); renderActivities(); }
        });
        div.appendChild(rehabCard);
      }
    }

    // ── Social Media (age 13+) ─────────────────────────────────
    if (c.age >= 13) {
      const smHdr = document.createElement('div'); smHdr.className = 'section-title'; smHdr.textContent = 'Social Media'; div.appendChild(smHdr);
      const postTypes = [
        { id:'general',  label:'Post a Selfie',       sub:'Looks-based. Could go viral · 1 energy' },
        { id:'art',      label:'Share Your Art',       sub:'Needs drawing hobby · 1 energy',   hobbyReq:'drawing' },
        { id:'music',    label:'Share Your Music',     sub:'Needs music hobby · 1 energy',     hobbyReq:'music' },
        { id:'video',    label:'Post a Video',         sub:'Needs filmmaking hobby · 1 energy', hobbyReq:'filmmaking' },
        { id:'writing',  label:'Share Your Writing',   sub:'Needs writing hobby · 1 energy',   hobbyReq:'writing' },
      ];
      postTypes.forEach(pt => {
        if (pt.hobbyReq && !c.hobbies.find(h => h.id === pt.hobbyReq)) return;
        const disabled = !Engine.hasEnergy();
        const card = document.createElement('div');
        card.className = `item-card${disabled ? ' locked' : ' clickable'}`;
        card.innerHTML = `<div class="item-top"><div class="item-icon ic-purple">Sm</div><div class="item-info"><div class="item-name">${pt.label}</div><div class="item-sub">${pt.sub}</div></div></div>`;
        if (!disabled) card.addEventListener('click', () => {
          const r = Engine.doSocialMedia(pt.id);
          showToast(r.msg, r.viral ? 'good' : r.ok ? 'info' : 'bad');
          updateDisplay(); closeModal('activities');
        });
        div.appendChild(card);
      });
    }

    // ── Therapy (age 16+) ────────────────────────────────────
    if (c.age >= 16) {
      const therapyHdr = document.createElement('div'); therapyHdr.className = 'section-title'; therapyHdr.textContent = 'Mental Health'; div.appendChild(therapyHdr);
      const therapyCard = document.createElement('div'); therapyCard.className = 'item-card clickable';
      const inTherapy = !!c.inTherapy;
      therapyCard.innerHTML = `
        <div class="item-top">
          <div class="item-icon" style="background:var(--blue);color:#fff;border-radius:8px;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:.65rem;font-weight:700">Th</div>
          <div class="item-info">
            <div class="item-name">${inTherapy ? 'In Therapy (active)' : 'Start Therapy'}</div>
            <div class="item-sub">$3,000/year · +Mental Health, helps addictions</div>
            <div class="item-detail" style="color:${inTherapy ? 'var(--green)' : 'var(--accent)'}">${inTherapy ? 'Ongoing — click to stop' : 'Mental Health: ' + (c.mentalHealth||80)}</div>
          </div>
        </div>`;
      therapyCard.addEventListener('click', () => {
        const r = inTherapy ? Engine.stopTherapy() : Engine.startTherapy();
        showToast(r.msg, r.ok ? 'good' : 'bad');
        updateDisplay(); renderActivities();
      });
      div.appendChild(therapyCard);
    }

    // ── Crime (age 14+) ──────────────────────────────────────
    if (c.age >= 14) {
      const crimeHdr = document.createElement('div'); crimeHdr.className = 'section-title'; crimeHdr.textContent = 'Illegal Activities'; div.appendChild(crimeHdr);
      if (c.inJail) {
        const jailCard = document.createElement('div'); jailCard.className = 'item-card';
        jailCard.style.borderColor = 'var(--red)';
        jailCard.innerHTML = `
          <div class="item-info">
            <div class="item-name" style="color:var(--red)">In Jail — ${c.jailYearsLeft} year(s) left</div>
            <div class="item-sub">Bail: ${DATA.fmtMoney(c.jailBail)}</div>
          </div>`;
        div.appendChild(jailCard);
        const bailBtn = document.createElement('button'); bailBtn.className = 'btn btn-danger btn-full mb-8';
        bailBtn.textContent = `Pay Bail — ${DATA.fmtMoney(c.jailBail)}`;
        bailBtn.disabled = c.money < (c.jailBail||0);
        bailBtn.addEventListener('click', () => { const r=Engine.payBail(); showToast(r.msg,r.ok?'good':'bad'); updateDisplay(); renderActivities(); });
        div.appendChild(bailBtn);
      } else {
        Object.entries(Engine.CRIMES).forEach(([id, crime]) => {
          if (c.age < crime.minAge) return;
          const card = document.createElement('div'); card.className = 'item-card clickable';
          const riskColor = crime.jailChance >= 0.25 ? 'var(--red)' : crime.jailChance >= 0.15 ? 'var(--yellow)' : 'var(--accent)';
          card.innerHTML = `
            <div class="item-top">
              <div class="item-icon" style="background:${riskColor};color:#fff;border-radius:8px;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:.6rem;font-weight:700">Cr</div>
              <div class="item-info">
                <div class="item-name">${crime.label}</div>
                <div class="item-sub">Reward: ${DATA.fmtMoney(crime.reward[0])}–${DATA.fmtMoney(crime.reward[1])}</div>
                <div class="item-detail" style="color:${riskColor}">Jail risk: ${Math.round(crime.jailChance*100)}% · ${crime.jailYears} yr sentence</div>
              </div>
            </div>`;
          card.addEventListener('click', () => { const r=Engine.commitCrime(id); showToast(r.msg,r.arrested?'bad':r.ok?'good':'bad'); updateDisplay(); renderActivities(); });
          div.appendChild(card);
        });
      }
    }

    // ── Startup / Business (age 18+) ─────────────────────────
    if (c.age >= 18) {
      const bizHdr = document.createElement('div'); bizHdr.className = 'section-title'; bizHdr.textContent = 'Business & Startup'; div.appendChild(bizHdr);
      if (c.activeStartup) {
        const startupCard = document.createElement('div'); startupCard.className = 'item-card';
        startupCard.style.borderColor = 'var(--accent)';
        startupCard.innerHTML = `<div class="item-info"><div class="item-name">${c.activeStartup.label}</div><div class="item-sub">Year ${c.activeStartup.yearsRunning} · Invested ${DATA.fmtMoney(c.activeStartup.invested)}</div><div class="item-detail text-dim">Results will come in ${Math.max(0, 2 - c.activeStartup.yearsRunning)}–${Math.max(1, 4 - c.activeStartup.yearsRunning)} years</div></div>`;
        div.appendChild(startupCard);
      } else {
        Engine.STARTUP_TYPES.forEach(biz => {
          const canAff = c.money >= biz.minInvest;
          const card = document.createElement('div'); card.className = `item-card${canAff ? ' clickable' : ''}`;
          card.innerHTML = `
            <div class="item-top">
              <div class="item-icon ic-teal" style="font-size:.6rem">Biz</div>
              <div class="item-info">
                <div class="item-name">${biz.label}</div>
                <div class="item-sub">Min ${DATA.fmtMoney(biz.minInvest)} · win ${biz.multWin}× / lose ${biz.multLose}×</div>
                <div class="item-detail text-dim">Fail rate: ${Math.round(biz.risk*100)}% · resolves in 2–4 years</div>
              </div>
            </div>`;
          if (canAff) {
            card.addEventListener('click', () => {
              const opts = [biz.minInvest, Math.round(biz.minInvest*2), Math.min(c.money, Math.round(biz.minInvest*5))].filter((v,i,a)=>a.indexOf(v)===i&&v<=c.money);
              const choiceDiv = document.createElement('div'); choiceDiv.style.marginTop='8px';
              opts.forEach(amt => {
                const b2 = document.createElement('button'); b2.className='btn btn-secondary btn-sm'; b2.style.marginRight='6px';
                b2.textContent = `Invest ${DATA.fmtMoney(amt)}`;
                b2.addEventListener('click', () => { const r=Engine.launchStartup(biz.id,amt); showToast(r.msg,r.ok?'good':'bad'); if(r.ok){updateDisplay();renderActivities();} });
                choiceDiv.appendChild(b2);
              });
              card.appendChild(choiceDiv);
            });
          }
          div.appendChild(card);
        });
      }
    }

    // ── Will & Estate (age 30+) ───────────────────────────────
    if (c.age >= 30) {
      const willHdr = document.createElement('div'); willHdr.className = 'section-title'; willHdr.textContent = 'Estate Planning'; div.appendChild(willHdr);
      if (c.will) {
        const willCard = document.createElement('div'); willCard.className = 'item-card';
        willCard.style.borderColor = 'var(--green)';
        willCard.innerHTML = `<div class="item-info"><div class="item-name">Will Written</div><div class="item-sub">${c.will.label}</div><div class="item-detail text-green">+${c.will.legacyBonus} legacy points on death</div></div>`;
        div.appendChild(willCard);
        const changeBtn = document.createElement('button'); changeBtn.className = 'btn btn-ghost btn-full mb-8';
        changeBtn.textContent = 'Change Will';
        changeBtn.addEventListener('click', () => { delete State.getChar().will; renderActivities(); });
        div.appendChild(changeBtn);
      } else {
        Engine.WILL_OPTIONS.forEach(opt => {
          const card = document.createElement('div'); card.className = 'item-card clickable';
          card.innerHTML = `<div class="item-info"><div class="item-name">${opt.label}</div><div class="item-sub">${opt.desc}</div><div class="item-detail text-accent">+${opt.legacyBonus} legacy pts</div></div>`;
          card.addEventListener('click', () => { const r=Engine.writeWill(opt.id); showToast(r.msg,r.ok?'good':'bad'); renderActivities(); });
          div.appendChild(card);
        });
      }
    }

    // ── Horoscope ─────────────────────────────────────────────
    { const h = Engine.getHoroscope(c);
      const hCard = document.createElement('div'); hCard.className = 'horoscope-card';
      hCard.innerHTML = `<div class="horoscope-sign">✨ ${h.sign}</div><div>${h.line}</div>`;
      div.appendChild(hCard); }

    // ── Health Care (age 5+) ──────────────────────────────────
    if (c.age >= 5) {
      const hcHdr = document.createElement('div'); hcHdr.className = 'section-title'; hcHdr.textContent = 'Health Care'; div.appendChild(hcHdr);
      const hasHealthIns = c.insurance?.health;
      const hcActions = [
        { id:'doctor',   label:'Doctor Visit',       sub:`${hasHealthIns?'$50 (insured)':'$200'} · +8 health` },
        { id:'dentist',  label:'Dentist',            sub:`${hasHealthIns?'$40 (insured)':'$300'} · +looks, +mood` },
        { id:'optometrist', label:'Optometrist',     sub:`${hasHealthIns?'$30 (insured)':'$150'} · +smarts` },
        { id:'gym',      label: c.gymMembership ? 'Cancel Gym ($600/yr active)' : 'Join Gym',   sub:'$600/yr · +2 health/year', action: c.gymMembership ? 'cancel_gym' : 'gym' },
        { id:'trainer',  label: c.personalTrainer ? 'Cancel Trainer ($2k/yr active)' : 'Personal Trainer', sub:'$2,000/yr · +5 health/year', action: c.personalTrainer ? 'cancel_trainer' : 'trainer' },
      ];
      hcActions.forEach(act => {
        const card = document.createElement('div'); card.className = 'item-card clickable';
        card.innerHTML = `<div class="item-top"><div class="item-icon" style="background:var(--health);color:#fff;border-radius:8px;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:.6rem;font-weight:700">+HP</div><div class="item-info"><div class="item-name">${act.label}</div><div class="item-sub">${act.sub}</div></div></div>`;
        card.addEventListener('click', () => { const r=Engine.healthCare(act.action||act.id); showToast(r.msg,r.ok?'good':'bad'); updateDisplay(); renderActivities(); });
        div.appendChild(card);
      });
      // Tattoo removal
      if ((c.tattoos||0) > 0) {
        const tatCard = document.createElement('div'); tatCard.className = 'item-card clickable';
        tatCard.innerHTML = `<div class="item-top"><div class="item-icon ic-rose" style="font-size:.6rem">Tat</div><div class="item-info"><div class="item-name">Remove a Tattoo</div><div class="item-sub">$800 · you have ${c.tattoos} tattoo(s)</div></div></div>`;
        tatCard.addEventListener('click', () => { const r=Engine.removeTattoo(); showToast(r.msg,r.ok?'good':'bad'); updateDisplay(); renderActivities(); });
        div.appendChild(tatCard);
      }
    }

    // ── Military (age 18–30) ──────────────────────────────────
    if (c.age >= 18 && c.age <= 30 && !c.militaryVeteran) {
      const milHdr = document.createElement('div'); milHdr.className = 'section-title'; milHdr.textContent = 'Military'; div.appendChild(milHdr);
      if (c.inMilitary) {
        const milCard = document.createElement('div'); milCard.className = 'item-card';
        milCard.style.borderColor = 'var(--green)';
        milCard.innerHTML = `<div class="item-info"><div class="item-name" style="color:var(--green)">Currently Serving</div><div class="item-sub">${c.militaryYearsLeft} year(s) remaining · $32,000/yr</div><div class="item-detail text-dim">GI Bill ($30k education benefit) on discharge</div></div>`;
        div.appendChild(milCard);
      } else {
        const enlBtn = document.createElement('div'); enlBtn.className = 'item-card clickable';
        enlBtn.innerHTML = `<div class="item-top"><div class="item-icon" style="background:#4a6fa5;color:#fff;border-radius:8px;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:.6rem;font-weight:700">Mil</div><div class="item-info"><div class="item-name">Enlist in Military</div><div class="item-sub">4 years · $32k/yr · +health · GI Bill on exit</div><div class="item-detail text-dim">Risk of deployment and PTSD</div></div></div>`;
        enlBtn.addEventListener('click', () => { const r=Engine.enlistMilitary(); showToast(r.msg,r.ok?'good':'bad'); updateDisplay(); renderActivities(); });
        div.appendChild(enlBtn);
      }
    }
    // Veteran badge
    if (c.militaryVeteran) {
      const vetCard = document.createElement('div'); vetCard.className = 'item-card';
      vetCard.style.borderColor = '#4a6fa5';
      vetCard.innerHTML = `<div class="item-info"><div class="item-name" style="color:#6a9fd8">🎖 Military Veteran</div><div class="item-sub">${c.giBill > 0 ? `GI Bill: ${DATA.fmtMoney(c.giBill)} available` : 'GI Bill used'}</div></div>`;
      div.appendChild(vetCard);
    }

    // ── Memoir (age 60+) ─────────────────────────────────────
    if (c.age >= 60) {
      const memHdr = document.createElement('div'); memHdr.className = 'section-title'; memHdr.textContent = 'Legacy'; div.appendChild(memHdr);
      const memCard = document.createElement('div'); memCard.className = c.wroteMemoir ? 'item-card' : 'item-card clickable';
      const advance = Math.round(10000 + (c.age-60)*500 + (c.fame||0)*300);
      memCard.innerHTML = `<div class="item-top"><div class="item-icon" style="background:var(--accent);color:#fff;border-radius:8px;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:.6rem;font-weight:700">📖</div><div class="item-info"><div class="item-name">${c.wroteMemoir ? 'Memoir Published ✓' : 'Write Your Memoir'}</div><div class="item-sub">${c.wroteMemoir ? 'Your story lives on.' : `Earn ~${DATA.fmtMoney(advance)} · 1 energy · once`}</div></div></div>`;
      if (!c.wroteMemoir) memCard.addEventListener('click', () => { const r=Engine.writeMemoirAction(); showToast(r.msg,r.ok?'good':'bad'); updateDisplay(); renderActivities(); });
      div.appendChild(memCard);
    }

    // ── Prison activities (overrides when in jail) ────────────
    if (c.inJail) {
      const prisonHdr = document.createElement('div'); prisonHdr.className = 'section-title'; prisonHdr.textContent = `In Jail — ${c.jailYearsLeft} yr(s) left`; prisonHdr.style.color='var(--red)'; div.appendChild(prisonHdr);
      [
        { id:'workout',     label:'Work Out in the Yard', sub:'+8 health · 1 energy' },
        { id:'read',        label:'Read in the Library',  sub:'+5 smarts, +mood · 1 energy' },
        { id:'meditate',    label:'Meditate',             sub:'+mental health · 1 energy' },
        { id:'make_friend', label:'Make a Friend Inside', sub:'+happiness · 1 energy' },
        { id:'fight',       label:'Pick a Fight',         sub:'Risky — could add time to sentence · 1 energy' },
      ].forEach(act => {
        const card = document.createElement('div'); card.className = 'item-card clickable';
        card.innerHTML = `<div class="item-info"><div class="item-name">${act.label}</div><div class="item-sub">${act.sub}</div></div>`;
        card.addEventListener('click', () => { const r=Engine.doPrisonActivity(act.id); showToast(r.msg,r.ok?'good':'bad'); updateDisplay(); renderActivities(); });
        div.appendChild(card);
      });
      if (c.money >= (c.jailBail||0)) {
        const bailCard = document.createElement('div'); bailCard.className = 'item-card clickable'; bailCard.style.borderColor='var(--green)';
        bailCard.innerHTML = `<div class="item-info"><div class="item-name" style="color:var(--green)">Pay Bail — ${DATA.fmtMoney(c.jailBail)}</div><div class="item-sub">Get out now</div></div>`;
        bailCard.addEventListener('click', () => { const r=Engine.payBail(); showToast(r.msg,r.ok?'good':'bad'); updateDisplay(); renderActivities(); });
        div.appendChild(bailCard);
      }
    }

    // ── Side Hustles (age 16+) ─────────────────────────────────
    if (c.age >= 16) {
      const shHdr = document.createElement('div'); shHdr.className = 'section-title'; shHdr.textContent = 'Side Hustles'; div.appendChild(shHdr);
      const available = DATA.getAvailableSideHustles(c);
      if (!available.length) {
        const note = document.createElement('p'); note.className = 'text-dim'; note.style.fontSize = '.8rem';
        note.textContent = 'Build hobby skills or raise your Smarts to unlock side hustles.';
        div.appendChild(note);
      }
      available.forEach(sh => {
        const disabled = !Engine.hasEnergy();
        const card = document.createElement('div'); card.className = `item-card${disabled ? ' locked' : ' clickable'}`;
        card.innerHTML = `
          <div class="item-top">
            <div class="item-icon ${sh.iconClass}">${sh.icon}</div>
            <div class="item-info">
              <div class="item-name">${sh.name}</div>
              <div class="item-sub">${sh.desc}</div>
              <div class="item-detail text-green">${DATA.fmtMoney(sh.incomeRange[0])}–${DATA.fmtMoney(sh.incomeRange[1])} · 1 energy</div>
            </div>
          </div>`;
        if (!disabled) card.addEventListener('click', () => {
          const r = Engine.doSideHustle(sh.id);
          showToast(r.msg, r.ok ? 'good' : 'bad');
          updateDisplay(); closeModal('activities');
        });
        div.appendChild(card);
      });
    }

    // ── Travel (age 18+) ──────────────────────────────────────
    if (c.age >= 18) {
      const tHdr = document.createElement('div'); tHdr.className = 'section-title';
      tHdr.textContent = `Travel${c.travelStamps?.length ? ` · ${c.travelStamps.length} stamp${c.travelStamps.length>1?'s':''}` : ''}`;
      div.appendChild(tHdr);
      DATA.TRAVEL_DESTINATIONS.forEach(dest => {
        const visited  = c.travelStamps?.includes(dest.id);
        const disabled = !Engine.hasEnergy(2) || c.money < dest.cost;
        const card = document.createElement('div'); card.className = `item-card${disabled ? ' locked' : ' clickable'}`;
        const effTxt = Object.entries(dest.effects).filter(([,v])=>v>0).map(([k,v])=>`+${v} ${ucFirst(k)}`).join(' · ');
        card.innerHTML = `
          <div class="item-top">
            <div class="item-icon ${dest.iconClass}">${dest.icon}</div>
            <div class="item-info">
              <div class="item-name">${dest.name}${visited ? ' <span class="badge badge-accent">Visited</span>' : ''}</div>
              <div class="item-sub">${dest.desc}</div>
              <div class="item-detail text-green">${effTxt}</div>
              <div class="item-detail text-red">${DATA.fmtMoney(dest.cost)} · 2 energy</div>
            </div>
          </div>`;
        if (!disabled) card.addEventListener('click', () => {
          const r = Engine.travel(dest.id);
          showToast(r.msg, r.ok ? 'good' : 'bad');
          updateDisplay(); closeModal('activities');
        });
        div.appendChild(card);
      });
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

    // ── Style & Tattoos (age 16+) ─────────────────────────────
    if (c.age >= 16) {
      const styleHdr = document.createElement('div'); styleHdr.className = 'section-title';
      styleHdr.textContent = `Style${c.tattoos > 0 ? ` · ${c.tattoos} tattoo${c.tattoos>1?'s':''}` : ''}`;
      div.appendChild(styleHdr);

      const currentStyle = DATA.STYLES.find(s => s.id === (c.style || 'casual'));
      const styleCard = document.createElement('div'); styleCard.className = 'item-card';
      styleCard.innerHTML = `
        <div class="item-top">
          <div class="item-icon ic-rose">St</div>
          <div class="item-info">
            <div class="item-name">Current: ${currentStyle?.name || 'Casual'}</div>
            <div class="item-sub">${currentStyle?.desc || ''}</div>
          </div>
        </div>
        <div class="item-actions" style="flex-wrap:wrap;gap:5px">
          ${DATA.STYLES.map(s => `<button class="btn btn-xs ${s.id===c.style?'btn-success':'btn-ghost'}" data-style="${s.id}">${s.name}</button>`).join('')}
        </div>`;
      styleCard.querySelectorAll('[data-style]').forEach(btn => {
        btn.addEventListener('click', () => {
          const r = Engine.changeStyle(btn.dataset.style);
          showToast(r.ok ? r.msg : r.msg, r.ok ? 'good' : 'bad');
          if (r.ok) { updateDisplay(); renderActivities(); }
        });
      });
      div.appendChild(styleCard);

      if (c.age >= 18) {
        const tatDesigns = ['geometric pattern','floral sleeve','meaningful quote','small minimalist','portrait','abstract art'];
        const tatCard = document.createElement('div'); tatCard.className = 'item-card clickable';
        tatCard.innerHTML = `
          <div class="item-top">
            <div class="item-icon ic-orange">Tt</div>
            <div class="item-info">
              <div class="item-name">Get a Tattoo</div>
              <div class="item-sub">$100–$500 · +Looks, +Happiness</div>
            </div>
          </div>`;
        tatCard.addEventListener('click', () => {
          const design = DATA.randomFrom(tatDesigns);
          const r = Engine.getTattoo(design);
          showToast(r.ok ? r.msg : r.msg, r.ok ? 'good' : 'bad');
          if (r.ok) { updateDisplay(); renderActivities(); }
        });
        div.appendChild(tatCard);
      }
    }

    // ── Health Conditions ──────────────────────────────────────
    if (c.conditions && c.conditions.length > 0) {
      const condHdr = document.createElement('div'); condHdr.className = 'section-title'; condHdr.textContent = 'Health Conditions'; div.appendChild(condHdr);
      c.conditions.forEach(condId => {
        const cond = DATA.getCondition(condId);
        if (!cond) return;
        const canAff = c.money >= cond.manageCost;
        const card = document.createElement('div'); card.className = 'item-card';
        card.innerHTML = `
          <div class="item-top">
            <div class="item-icon ic-red">Hc</div>
            <div class="item-info">
              <div class="item-name">${cond.name}</div>
              <div class="item-sub">${cond.desc}</div>
              <div class="item-detail text-red">Annual drain if unmanaged</div>
            </div>
          </div>
          <div class="item-actions">
            ${canAff ? `<button class="btn btn-success btn-sm" data-manage="${condId}">Manage -${DATA.fmtMoney(cond.manageCost)}</button>` : `<span class="text-red" style="font-size:.75rem">Need ${DATA.fmtMoney(cond.manageCost)}</span>`}
          </div>`;
        card.querySelector('[data-manage]')?.addEventListener('click', () => {
          const r = Engine.manageCondition(condId);
          showToast(r.msg, r.ok ? 'good' : 'bad');
          if (r.ok) { updateDisplay(); renderActivities(); }
        });
        div.appendChild(card);
      });
    }

    // ── Bucket List ────────────────────────────────────────────
    const blHdr = document.createElement('div'); blHdr.className = 'section-title';
    const blDone = (c.bucketList||[]).filter(b=>b.completed).length;
    blHdr.textContent = `Bucket List${c.bucketList?.length ? ` · ${blDone}/${c.bucketList.length} done` : ''}`;
    div.appendChild(blHdr);

    if (!c.bucketList || c.bucketList.length === 0) {
      const blBtn = document.createElement('button'); blBtn.className = 'btn btn-secondary btn-full mb-8';
      blBtn.innerHTML = 'Set Your Life Goals<br><small class="text-dim">Choose 3 bucket list goals</small>';
      blBtn.addEventListener('click', () => { closeModal('activities'); showBucketListModal(); });
      div.appendChild(blBtn);
    } else {
      c.bucketList.forEach(entry => {
        const goal = DATA.BUCKET_GOALS.find(g => g.id === entry.goalId);
        if (!goal) return;
        const card = document.createElement('div'); card.className = 'item-card';
        card.innerHTML = `
          <div class="item-top">
            <div class="item-icon ${entry.completed ? 'ic-green' : 'ic-amber'}">${goal.icon}</div>
            <div class="item-info">
              <div class="item-name">${goal.name} ${entry.completed ? '<span class="badge badge-accent">Done!</span>' : ''}</div>
              <div class="item-sub">${goal.desc}</div>
            </div>
          </div>`;
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

    // Online dating (age 18+, no partner, not asexual)
    if (c.age >= 18 && c.sexuality !== 'asexual' && !State.getPartner()) {
      const dtBtn = document.createElement('button');
      dtBtn.className = 'btn btn-secondary btn-full mb-8';
      dtBtn.innerHTML = 'Browse Dating Apps<br><small class="text-dim">Browse profiles and match · 1 energy</small>';
      dtBtn.disabled = !Engine.hasEnergy();
      dtBtn.addEventListener('click', () => {
        const r = Engine.browseOnlineDating();
        if (!r.ok) { showToast(r.msg, 'bad'); return; }
        closeModal('relationships');
        showOnlineDatingModal(r.profiles);
      });
      div.appendChild(dtBtn);
    }

    // Social Circle
    const circleMembers = c.socialCircle
      .map(id => g.relationships.find(r => r.id === id && r.status === 'active'))
      .filter(Boolean);

    if (circleMembers.length >= 2) {
      const circHdr = document.createElement('div'); circHdr.className = 'section-title';
      circHdr.textContent = `Your Circle (${circleMembers.length})`;
      div.appendChild(circHdr);

      const circleCard = document.createElement('div'); circleCard.className = 'item-card';
      circleCard.style.background = 'var(--accent-light)';
      circleCard.innerHTML = `
        <div class="item-info mb-8">
          <div class="item-name">Friends: ${circleMembers.map(r=>r.name.split(' ')[0]).join(', ')}</div>
        </div>
        <div class="item-actions" style="flex-wrap:wrap;gap:6px">
          <button class="btn btn-primary btn-sm" id="btn-group-hangout">Group Hangout</button>
          ${c.age >= 18 ? '<button class="btn btn-secondary btn-sm" id="btn-group-trip">Group Trip</button>' : ''}
        </div>`;
      circleCard.querySelector('#btn-group-hangout')?.addEventListener('click', () => {
        const r = Engine.groupHangout();
        showToast(r.msg, r.ok ? 'good' : 'bad');
        if (r.ok) { updateDisplay(); renderRelationships(); }
      });
      circleCard.querySelector('#btn-group-trip')?.addEventListener('click', () => {
        closeModal('relationships');
        showGroupTripModal();
      });
      div.appendChild(circleCard);
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
        const inCircle = c.socialCircle.includes(rel.id);
        const isRomantic = rel.type === 'partner';
        const loveLabel = (() => {
          if (!isRomantic || !active) return '';
          const r = rel.relationship;
          if (r >= 90) return { text:'Deeply in Love', color:'#e0558a' };
          if (r >= 75) return { text:'Very Happy', color:'#d4488a' };
          if (r >= 60) return { text:'In Love', color:'#c86e9a' };
          if (r >= 45) return { text:'Getting Closer', color:'#a07090' };
          if (r >= 30) return { text:'Rocky', color:'#a08060' };
          return { text:'On the Rocks', color:'var(--red)' };
        })();
        const loveBarColor = isRomantic && active
          ? (rel.relationship >= 60 ? '#e0558a' : rel.relationship >= 30 ? '#c88050' : 'var(--red)')
          : 'var(--accent)';
        card.innerHTML = `
          <div class="item-top">
            <div class="item-icon ic-rose">${icon}</div>
            <div class="item-info">
              <div class="item-name">${rel.name} <span class="text-dim">(${rel.age})</span>${inCircle?'<span class="badge badge-accent" style="margin-left:4px">Circle</span>':''}${rel.isBestFriend?'<span class="badge badge-accent" style="margin-left:4px;background:gold;color:#000">⭐ BFF</span>':''}${rel.type==='enemy'?'<span class="badge-enemy">Enemy</span>':''}${rel.reachedOut?'<span class="badge badge-accent" style="margin-left:4px;background:var(--pink)">👋 Reached Out</span>':''}</div>
              <div class="item-sub">${ucFirst(rel.subtype)}${!active ? ' · ' + rel.status : ''}</div>
              ${loveLabel ? `<div style="font-size:.72rem;font-weight:700;color:${loveLabel.color};margin-top:2px">${loveLabel.text}</div>` : ''}
            </div>
            <span class="text-dim" style="font-size:.78rem;font-weight:700">${rel.relationship}%</span>
          </div>
          <div class="rel-meter"><div class="rel-meter-bar"><div class="rel-meter-fill" style="width:${rel.relationship}%;background:${loveBarColor}"></div></div></div>
          ${active && rel.type==='friend' ? `<div class="item-actions" style="margin-top:6px"><button class="btn btn-xs ${inCircle?'btn-ghost':'btn-secondary'}" data-circle="${rel.id}">${inCircle?'Remove from Circle':'Add to Circle'}</button></div>` : ''}
        `;
        card.querySelector('[data-circle]')?.addEventListener('click', e => {
          e.stopPropagation();
          if (inCircle) { Engine.removeFromCircle(rel.id); showToast('Removed from circle.','info'); }
          else { const r = Engine.addToCircle(rel.id); showToast(r.msg, r.ok?'good':'bad'); }
          renderRelationships();
        });
        if (active) {
          if ((rel.subtype === 'father' || rel.subtype === 'mother') && rel.age >= 70) {
            card.addEventListener('click', () => showParentCareModal(rel));
          } else {
            card.addEventListener('click', () => showRelActionModal(rel));
          }
        }
        div.appendChild(card);
      });
    }
  }

  function showRelActionModal(rel) {
    const c = State.getChar();
    closeModal('relationships');
    qs('#relaction-title').textContent = rel.name;
    const div = qs('#relaction-content'); div.innerHTML = '';
    const hasE = Engine.hasEnergy();

    const actions = [
      { id:'spend_time', label:'Spend Time Together',   sub:'+Happiness, +Bond · 1 energy',    energy:true },
      { id:'compliment', label:'Give a Compliment',     sub:'+Bond · free',                    energy:false },
      { id:'gift',       label:'Give a Gift',           sub:'-$100, big bond boost · 1 energy', energy:true },
      { id:'argue',      label:'Pick a Fight',          sub:'Damages the relationship · free',  energy:false },
    ];

    if (rel.type === 'friend' && c.age >= 12 && c.sexuality !== 'asexual') {
      actions.push({ id:'ask_out', label:'Ask Them Out', sub:`${rel.relationship >= 60 ? 'Good chance!' : 'Low chance...'} · 1 energy`, energy:true, askOut:true });
    }
    if (rel.type === 'friend' && rel.status === 'active') {
      actions.push({ id:'_bestfriend', label: rel.isBestFriend ? '⭐ Best Friend (active)' : 'Make Best Friend', sub:'Need 60+ bond · permanent badge', energy:false, isBestFriend:true, disabled: rel.relationship < 60 || !!rel.isBestFriend });
      actions.push({ id:'_ghost', label:'Ghost Them', sub:'Slowly drop contact — no energy cost', energy:false, isGhost:true });
    }
    if (rel.type === 'ex' && rel.reachedOut) {
      actions.push({ id:'_rekindle', label:'Rekindle with ' + rel.name, sub:'Give the relationship another shot', energy:false, isRekindle:true });
      actions.push({ id:'_reject_ex', label:'Reject & Move On', sub:'Close this chapter for good', energy:false, isRejectEx:true });
    }

    if (rel.type === 'partner') {
      actions.push({ id:'date',           label:'Go on a Date',        sub:'-$80, boost mood and bond · 1 energy',       energy:true });
      actions.push({ id:'love_letter',    label:'Write a Love Letter', sub:'+Bond, +Happiness · 1 energy',               energy:true });
      actions.push({ id:'cook_dinner',    label:'Cook a Special Dinner',sub:'-$60, warm the heart · 1 energy',           energy:true });
      actions.push({ id:'serenade',       label:'Serenade Them',       sub:`Music hobby helps! · 1 energy`,              energy:true });
      actions.push({ id:'weekend_getaway',label:'Weekend Getaway',     sub:'-$400, big happiness boost · 1 energy',      energy:true });

      if (rel.subtype !== 'spouse') {
        actions.push({ id:'propose', label:'Propose', sub:'Need 60+ relationship, age 18+ · free', energy:false, disabled: rel.relationship < 60 || c.age < 18 });
      }
      actions.push({ id:'_cheat', label:'Have an Affair', sub:'35% chance of getting caught · 1 energy', energy:true, isCheat:true });
      if (rel.subtype === 'spouse') {
        actions.push({ id:'plan_wedding', label:'Plan the Wedding', sub:'Choose a venue and celebrate · free', energy:false, isWedding:true });
        if (c.age >= 18 && c.age <= 50) {
          actions.push({ id:'plan_child_btn', label:'Try for a Child', sub:'Choose name and gender · 1 energy', energy:true, isPlanChild:true });
        }
      }
    }

    // Child interactions — replace standard actions for children
    if (rel.subtype === 'child' && rel.status === 'active') {
      const childAge = rel.age || 0;
      const childActions = [
        { id:'play',           label:'Play Together',        sub:'+Bond, +Happiness · 1 energy' },
        { id:'park',           label:'Trip to the Park',     sub:'-$20, +Bond, +Health · 1 energy' },
        { id:'family_game_night', label:'Family Game Night', sub:'-$30, +Bond, +Happiness · 1 energy' },
        { id:'teach_skill',    label:'Teach Them Something', sub:'+Bond · 1 energy' },
        ...(childAge >= 6  ? [{ id:'homework', label:'Help with Homework', sub:'+Bond, +Happiness · 1 energy' }] : []),
        ...(childAge <= 10 ? [{ id:'bedtime_story', label:'Bedtime Story', sub:'+Bond, big happiness · 1 energy' }] : []),
        ...(childAge >= 13 ? [{ id:'heart_to_heart', label:'Heart-to-Heart Talk', sub:'+Bond, +Mental Health · 1 energy' }] : []),
        ...(childAge >= 13 ? [{ id:'ground', label:'Ground Them', sub:'-Bond, discipline · 1 energy' }] : []),
        { id:'spend_time',    label:'Spend Time Together',  sub:'+Bond, +Happiness · 1 energy' },
        { id:'gift',          label:'Give a Gift',          sub:'-$100, big bond boost · 1 energy' },
      ];
      childActions.forEach(act => {
        const btn = document.createElement('button');
        btn.className = 'btn btn-secondary btn-full mb-8';
        btn.disabled = !hasE;
        btn.innerHTML = `${act.label}<br><small class="text-dim">${act.sub}</small>`;
        btn.addEventListener('click', () => {
          const r = Engine.childAction(rel.id, act.id);
          if (!r.ok) { showToast(r.msg, 'bad'); return; }
          showToast(r.msg, 'good'); closeModal('relaction'); updateDisplay();
        });
        div.appendChild(btn);
      });
      if (rel.traits?.length) {
        const tl = document.createElement('p'); tl.className = 'text-dim'; tl.style.marginTop = '8px';
        tl.textContent = `Traits: ${rel.traits.join(', ')}`;
        div.appendChild(tl);
      }
      openModal('relaction'); return;
    }

    actions.forEach(act => {
      const disabled = (act.energy && !hasE) || !!act.disabled;
      const btn = document.createElement('button');
      btn.className = 'btn btn-secondary btn-full mb-8';
      btn.innerHTML = `${act.label}<br><small class="text-dim">${act.sub}</small>`;
      btn.disabled = disabled;

      if (act.askOut) {
        btn.addEventListener('click', () => {
          const r = Engine.askFriendOut(rel.id);
          showToast(r.msg, r.rejected ? 'bad' : 'good');
          closeModal('relaction'); updateDisplay(); renderRelationships();
        });
      } else if (act.isWedding) {
        btn.addEventListener('click', () => {
          closeModal('relaction');
          showWeddingPlannerModal(rel.id);
        });
      } else if (act.isPlanChild) {
        btn.addEventListener('click', () => {
          closeModal('relaction');
          showPlanChildModal();
        });
      } else if (act.isCheat) {
        btn.addEventListener('click', () => {
          const r = Engine.cheatOnPartner();
          showToast(r.msg, r.caught ? 'bad' : 'good');
          closeModal('relaction'); updateDisplay(); renderRelationships();
        });
      } else if (act.isBestFriend) {
        btn.addEventListener('click', () => {
          const r = Engine.setBestFriend(rel.id);
          showToast(r.msg, r.ok ? 'good' : 'bad');
          closeModal('relaction'); updateDisplay(); renderRelationships();
        });
      } else if (act.isGhost) {
        btn.addEventListener('click', () => {
          if (!confirm(`Ghost ${rel.name}? They will get the message.`)) return;
          const r = Engine.ghostPerson(rel.id);
          showToast(r.msg, 'info');
          closeModal('relaction'); updateDisplay(); renderRelationships();
        });
      } else if (act.isRekindle) {
        btn.addEventListener('click', () => {
          const g3 = State.get();
          const ex = g3.relationships.find(r3 => r3.id === rel.id);
          if (ex) { ex.type='partner'; ex.subtype='partner'; ex.status='active'; ex.reachedOut=false; ex.relationship=Math.min(100,ex.relationship+20); State.saveGame(); }
          showToast(`Back together with ${rel.name}!`, 'good');
          closeModal('relaction'); updateDisplay(); renderRelationships();
        });
      } else if (act.isRejectEx) {
        btn.addEventListener('click', () => {
          const g3 = State.get();
          const ex = g3.relationships.find(r3 => r3.id === rel.id);
          if (ex) { ex.reachedOut=false; State.saveGame(); }
          showToast(`You moved on from ${rel.name}.`, 'info');
          closeModal('relaction'); updateDisplay(); renderRelationships();
        });
      } else {
        btn.addEventListener('click', () => {
          const r = Engine.relationshipAction(rel.id, act.id);
          if (!r.ok) { showToast(r.msg, 'bad'); return; }
          showToast(r.msg, 'good'); closeModal('relaction'); updateDisplay();
        });
      }
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

  function showParentCareModal(rel) {
    const c = State.getChar();
    qs('#relaction-title').textContent = rel.name;
    const div = qs('#relaction-content'); div.innerHTML = '';
    const cost = rel.age >= 85 ? 12000 : 6000;
    const infoCard = document.createElement('div'); infoCard.className = 'item-card';
    infoCard.innerHTML = `<div class="item-info"><div class="item-name">${rel.name}, age ${rel.age}</div><div class="item-sub">${rel.caredFor ? 'Currently receiving care' : 'Elderly — may need support'}</div><div class="item-detail text-dim">Care costs ${DATA.fmtMoney(cost)}/year · improves bond</div></div>`;
    div.appendChild(infoCard);
    const careBtn = document.createElement('button'); careBtn.className = 'btn btn-primary btn-full mb-8';
    careBtn.textContent = `Arrange Care — ${DATA.fmtMoney(cost)}`;
    careBtn.disabled = c.money < cost;
    careBtn.addEventListener('click', () => { const r=Engine.careForParent(rel.id); showToast(r.msg,r.ok?'good':'bad'); closeModal('relaction'); updateDisplay(); renderRelationships(); });
    div.appendChild(careBtn);
    const visitBtn = document.createElement('button'); visitBtn.className = 'btn btn-secondary btn-full mb-8';
    visitBtn.textContent = 'Visit & Spend Time (free)';
    visitBtn.addEventListener('click', () => { const r=Engine.relationshipAction(rel.id,'spend_time'); showToast(r.msg,r.ok?'good':'bad'); closeModal('relaction'); updateDisplay(); renderRelationships(); });
    div.appendChild(visitBtn);
    const giftBtn = document.createElement('button'); giftBtn.className = 'btn btn-secondary btn-full mb-8';
    giftBtn.textContent = 'Give a Gift (-$100)';
    giftBtn.disabled = c.money < 100;
    giftBtn.addEventListener('click', () => { const r=Engine.relationshipAction(rel.id,'gift'); showToast(r.msg,r.ok?'good':'bad'); closeModal('relaction'); updateDisplay(); renderRelationships(); });
    div.appendChild(giftBtn);
    openModal('relaction');
  }

  function showWeddingPlannerModal(relId) {
    const c = State.getChar();
    const overlay = qs('#modal-event');
    qs('#evt-category').textContent = 'Wedding';
    qs('#evt-category').className = 'evt-category cat-social';
    qs('#evt-title').textContent = 'Plan Your Wedding';
    qs('#evt-desc').textContent = `Choose a venue for your big day. You have ${DATA.fmtMoney(c.money)}.`;
    const venues = [
      { id:'city_hall',    label:'City Hall',     sub:'Simple and sweet — free', cost:500    },
      { id:'garden',       label:'Garden Party',  sub:'Flowers and friends',      cost:5000   },
      { id:'beach',        label:'Beach Wedding', sub:'Romantic waves',           cost:8000   },
      { id:'luxury_hotel', label:'Luxury Hotel',  sub:'The full dream',           cost:20000  },
    ];
    const choicesDiv = qs('#evt-choices'); choicesDiv.innerHTML = '';
    venues.forEach(v => {
      const canAff = c.money >= v.cost;
      const btn = document.createElement('button');
      btn.className = 'evt-choice';
      btn.innerHTML = `${v.label}<div class="evt-choice-sub">${v.sub} — ${DATA.fmtMoney(v.cost)}</div>`;
      btn.disabled = !canAff;
      btn.style.opacity = canAff ? '1' : '0.4';
      btn.addEventListener('click', () => {
        overlay.classList.add('hidden');
        const r = Engine.planWedding(relId, v.id);
        showToast(r.msg, r.ok ? 'good' : 'bad');
        updateDisplay();
      });
      choicesDiv.appendChild(btn);
    });
    const cancel = document.createElement('button');
    cancel.className = 'evt-choice'; cancel.textContent = 'Later';
    cancel.addEventListener('click', () => overlay.classList.add('hidden'));
    choicesDiv.appendChild(cancel);
    overlay.classList.remove('hidden');
  }

  function showPlanChildModal() {
    const overlay = qs('#modal-event');
    qs('#evt-category').textContent = 'Family';
    qs('#evt-category').className = 'evt-category cat-family';
    qs('#evt-title').textContent = 'Welcome a New Life';
    qs('#evt-desc').textContent = 'Choose a name and gender for your child.';
    const choicesDiv = qs('#evt-choices'); choicesDiv.innerHTML = '';

    // Name input
    const nameWrap = document.createElement('div');
    nameWrap.style.cssText = 'margin-bottom:10px';
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'form-input';
    nameInput.placeholder = 'Name (leave blank for random)';
    nameInput.style.cssText = 'width:100%;margin-bottom:8px';
    nameWrap.appendChild(nameInput);
    choicesDiv.appendChild(nameWrap);

    const genders = [
      { id:'female', label:'Girl' },
      { id:'male',   label:'Boy'  },
      { id:'random', label:'Surprise!' },
    ];
    genders.forEach(g => {
      const btn = document.createElement('button');
      btn.className = 'evt-choice';
      btn.textContent = g.label;
      btn.addEventListener('click', () => {
        overlay.classList.add('hidden');
        const r = Engine.planChild(nameInput.value, g.id);
        showToast(r.msg, r.ok ? 'good' : 'bad');
        if (r.ok) { updateDisplay(); renderRelationships(); }
      });
      choicesDiv.appendChild(btn);
    });

    const cancel = document.createElement('button');
    cancel.className = 'evt-choice'; cancel.textContent = 'Not yet';
    cancel.addEventListener('click', () => overlay.classList.add('hidden'));
    choicesDiv.appendChild(cancel);
    overlay.classList.remove('hidden');
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
          <button class="btn btn-secondary btn-sm" id="btn-negotiate" ${c.negotiatedThisYear ? 'disabled' : ''}>Negotiate Raise</button>
          <button class="btn btn-danger btn-sm" id="btn-quit-job">Quit</button>
        </div>`;
      div.appendChild(card);
      qs('#btn-work-hard').addEventListener('click', () => { const r=Engine.workHard(); showToast(r.msg,'good'); updateDisplay(); closeModal('career'); });
      qs('#btn-slack').addEventListener('click', () => { const r=Engine.slackOff(); showToast(r.msg,r.ok?'info':'bad'); updateDisplay(); closeModal('career'); });
      qs('#btn-negotiate').addEventListener('click', () => { const r=Engine.negotiateSalary(); showToast(r.msg,r.ok?'good':'bad'); updateDisplay(); renderCareer(); });
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
        const firedLevel = (c.firedHistory || {})[career.id];
        const rehirePromo = firedLevel !== undefined && firedLevel > 0 ? career.promotions[Math.max(0, firedLevel-1)] : null;
        card.innerHTML = `
          <div class="item-top">
            <div class="item-icon ${career.iconClass}">${career.icon}</div>
            <div class="item-info">
              <div class="item-name">${career.name}</div>
              <div class="item-sub text-green">${DATA.fmtMoney(career.salary.base)} – ${DATA.fmtMoney(career.salary.max)}/yr</div>
              ${check.meets ? '' : `<div class="item-lock">Requires: ${check.missing.join(', ')}</div>`}
              ${totalB > 0 ? `<div class="item-detail text-accent">Bonus: +${Math.round(totalB*10)}% salary${hobbyB>0&&extB>0?' (hobby + school)':hobbyB>0?' (hobby)':' (school activity)'}</div>` : ''}
              ${rehirePromo ? `<div class="item-detail" style="color:var(--yellow)">Re-hire: start as ${rehirePromo.title}</div>` : ''}
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
    const hasE = Engine.hasEnergy();

    // ── School Life Study Actions (age 6–25) ──────────────────
    if (c.age >= 6 && (c.age <= 18 || edu.inSchool)) {
      const sHdr = document.createElement('div'); sHdr.className = 'section-title'; sHdr.textContent = 'School Actions'; div.appendChild(sHdr);

      const studyActions = [
        { label:'Study Hard',          sub:`+5–10 Smarts, a bit tiring · 1 energy`,        fn: () => Engine.studyHard(),          energy:true },
        { label:'Skip Class',          sub:`+Happiness, -Smarts · Might get caught! · free`,fn: () => Engine.skipClass(),          energy:false },
        { label:'Kiss Up to Teacher',  sub:`Random grade boost · 1 energy`,                 fn: () => Engine.kissUpTeacher(),      energy:true },
      ];
      if (c.age >= 12 && c.age <= 18) {
        studyActions.push({ label:'Flirt with a Classmate', sub:`Might spark a crush · 1 energy`, fn: () => Engine.flirtWithClassmate(), energy:true });
      }
      if (edu.inSchool && c.age >= 18) {
        studyActions.push({ label:'Cram All Night',   sub:`+10–18 Smarts, -Health & Happiness · 1 energy`, fn: () => Engine.cramAllNight(),      energy:true });
        studyActions.push({ label:'Seduce the Professor', sub:`Very risky. Could backfire badly · 1 energy`, fn: () => Engine.seduceProfessor(), energy:true });
        studyActions.push({ label:'Cheat on Exam',    sub:`Risky! Could get expelled · free`,    fn: () => Engine.cheatOnExam(),        energy:false });
      }
      // College social life
      if (edu.inSchool && edu.schoolType === 'university') {
        studyActions.push({ label: c.joinedFrat ? 'Frat/Sorority (joined)' : 'Join Frat / Sorority', sub:'Meet people, +Happiness · 1 energy', fn: () => Engine.collegeAction('frat'), energy:true, disabled:!!c.joinedFrat });
        studyActions.push({ label:'Pull an All-Nighter', sub:'+GPA, -Health · 1 energy', fn: () => Engine.collegeAction('all_nighter'), energy:true });
        studyActions.push({ label:'College Party',    sub:'+Happiness, chance to meet someone · 1 energy', fn: () => Engine.collegeAction('college_party'), energy:true });
        studyActions.push({ label:'Study Group',      sub:'+GPA, chance to make a friend · 1 energy',     fn: () => Engine.collegeAction('study_group'),   energy:true });
      }

      studyActions.forEach(act => {
        const disabled = act.energy && !hasE;
        const card = document.createElement('div');
        card.className = `item-card${disabled ? ' locked' : ' clickable'}`;
        card.innerHTML = `<div class="item-top"><div class="item-info"><div class="item-name">${act.label}</div><div class="item-sub">${act.sub}</div></div></div>`;
        if (!disabled) {
          card.addEventListener('click', () => {
            const r = act.fn();
            showToast(r.msg, r.caught || r.scandal || r.rejected ? 'bad' : 'good');
            if (r.ok) { updateDisplay(); renderEducation(); }
          });
        }
        div.appendChild(card);
      });
    }
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
      ${c.age >= 6 ? `<div class="mt-4"><span class="fw-700">GPA:</span> <span class="${edu.gpa>=3.5?'text-green':edu.gpa>=2.0?'':'text-red'}">${(edu.gpa||2.5).toFixed(2)}/4.00</span>${edu.gpa>=3.5?' — Scholarship eligible!':edu.gpa<2.0?' — Too low for university':''}</div>` : ''}
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

      // Scholarship section
      const schFunds = c.scholarshipFunds || 0;
      const alreadyApplied = c.scholarshipAppliedAge === c.age;
      const schCard = document.createElement('div');
      schCard.className = 'item-card' + (alreadyApplied ? '' : ' clickable');
      schCard.innerHTML = `
        <div class="flex-between">
          <span class="fw-700">Request Scholarship</span>
          <span class="${schFunds > 0 ? 'text-green' : 'text-dim'}">${schFunds > 0 ? DATA.fmtMoney(schFunds) + ' available' : 'None yet'}</span>
        </div>
        <div class="text-dim">GPA ${(edu.gpa||2.5).toFixed(2)} — ${alreadyApplied ? 'Applied this year' : 'Higher GPA = better odds'}</div>`;
      if (!alreadyApplied) {
        schCard.addEventListener('click', () => { const r=Engine.requestScholarship(); showToast(r.msg, r.ok?'good':'bad'); updateDisplay(); renderEducation(); });
      }
      div.appendChild(schCard);

      const targetMap = { else:'Bachelor', bachelor:'Master', master:'Doctorate' };
      const durationMap = { else:4, bachelor:2, master:4 };
      const baseCostMap = { else:50000, bachelor:40000, master:60000 };
      const key = lvl === 'bachelor' ? 'bachelor' : lvl === 'master' ? 'master' : 'else';
      const targetDeg = targetMap[key]; const duration = durationMap[key]; let baseCost = baseCostMap[key];
      if ((edu.gpa||2.5) >= 3.5) baseCost = Math.round(baseCost * 0.5);
      const schApplied = Math.min(schFunds, baseCost);
      const effectiveCost = baseCost - schApplied;

      const majorSel = document.createElement('select'); majorSel.className = 'form-input select-input mb-8';
      DATA.UNIVERSITY_MAJORS.forEach(m => { const o=document.createElement('option'); o.value=m; o.textContent=m; majorSel.appendChild(o); });
      div.appendChild(majorSel);

      [0, Math.round(effectiveCost*0.5), effectiveCost].forEach(loan => {
        const oop = Math.max(0, effectiveCost - loan);
        const canAff = c.money >= oop;
        const card = document.createElement('div');
        card.className = `item-card${canAff ? ' clickable' : ''}`;
        const schNote = schApplied > 0 ? ` <span class="text-green">(${DATA.fmtMoney(schApplied)} scholarship)</span>` : '';
        card.innerHTML = `
          <div class="flex-between">
            <span class="fw-700">${targetDeg} — ${loan>0?DATA.fmtMoney(loan)+' loan':'Self-funded'}</span>
            <span class="${canAff?'text-green':'text-red'}">${DATA.fmtMoney(oop)} upfront</span>
          </div>
          <div class="text-dim">${duration} years${schNote}</div>`;
        if (canAff) { card.addEventListener('click', () => { const r=Engine.enrollUniversity(majorSel.value,loan); showToast(r.msg,r.ok?'good':'bad'); if(r.ok){updateDisplay();renderEducation();} }); }
        div.appendChild(card);
      });
    }
  }

  // ── ASSETS modal ──────────────────────────────────────────────
  function renderAssets() {
    const c = State.getChar(); const div = qs('#assets-content'); div.innerHTML = '';
    const nw = Engine.getNetWorth(c);

    // ── Banking section ─────────────────────────────────────────
    mkSection(div, 'Bank Account');
    const bankCard = document.createElement('div'); bankCard.className = 'bank-card mb-8';
    const savings = c.bank?.savings || 0;
    const apy = ((c.bank?.apy || 0.035) * 100).toFixed(1);
    const totalDebt = (c.education.studentLoan || 0) + c.assets.houses.reduce((s,h)=>s+(h.mortgage||0),0);
    bankCard.innerHTML = `
      <div class="bank-row">
        <div>
          <div class="bank-label">Savings Account</div>
          <div class="bank-value text-green">${DATA.fmtMoney(savings)}</div>
          <div class="bank-sub">${apy}% APY · earns ${DATA.fmtMoney(Math.round(savings*(c.bank?.apy||0.035)))} next year</div>
        </div>
        <div>
          <div class="bank-label">Total Debt</div>
          <div class="bank-value text-red">${totalDebt>0?'-'+DATA.fmtMoney(totalDebt):'None'}</div>
        </div>
      </div>
      <div class="bank-actions" id="bank-actions"></div>`;
    div.appendChild(bankCard);

    const bAct = bankCard.querySelector('#bank-actions');
    // Deposit
    const depWrap = document.createElement('div'); depWrap.className = 'bank-input-row';
    const depInput = document.createElement('input'); depInput.type='number'; depInput.className='cheat-input'; depInput.placeholder='Amount'; depInput.style.cssText='flex:1;min-width:0';
    const depBtn = document.createElement('button'); depBtn.className='btn btn-success btn-sm'; depBtn.textContent='Deposit';
    const wdBtn = document.createElement('button'); wdBtn.className='btn btn-ghost btn-sm'; wdBtn.textContent='Withdraw';
    depWrap.append(depInput, depBtn, wdBtn); bAct.appendChild(depWrap);
    depBtn.addEventListener('click', () => { const r=Engine.depositSavings(parseFloat(depInput.value)||0); showToast(r.msg,r.ok?'good':'bad'); if(r.ok){updateDisplay();renderAssets();} });
    wdBtn.addEventListener('click', () => { const r=Engine.withdrawSavings(parseFloat(depInput.value)||0); showToast(r.msg,r.ok?'good':'bad'); if(r.ok){updateDisplay();renderAssets();} });

    // Pay off debts
    if (c.education.studentLoan > 0) {
      const slRow = document.createElement('div'); slRow.className = 'bank-debt-row';
      slRow.innerHTML = `<span class="text-red fw-700">Student Loan: ${DATA.fmtMoney(c.education.studentLoan)}</span>`;
      const payAmounts = [1000,5000,10000,c.education.studentLoan].filter((a,i,arr)=>a>0&&a<=c.money&&arr.indexOf(a)===i);
      payAmounts.forEach(amt => {
        const b=document.createElement('button'); b.className='btn btn-xs btn-danger';
        b.textContent=amt===c.education.studentLoan?'Pay All':`Pay ${DATA.fmtMoney(amt)}`;
        b.addEventListener('click', ()=>{const r=Engine.payDebt('student_loan',amt);showToast(r.msg,r.ok?'good':'bad');if(r.ok){updateDisplay();renderAssets();}});
        slRow.appendChild(b);
      });
      bAct.appendChild(slRow);
    }
    const housesWithMortgage = c.assets.houses.filter(h=>h.mortgage>0);
    housesWithMortgage.forEach(h => {
      const mRow = document.createElement('div'); mRow.className = 'bank-debt-row';
      mRow.innerHTML = `<span class="text-red fw-700">${h.name} mortgage: ${DATA.fmtMoney(h.mortgage)}</span>`;
      [5000,20000,h.mortgage].filter((a,i,arr)=>a>0&&a<=c.money&&arr.indexOf(a)===i).forEach(amt => {
        const b=document.createElement('button'); b.className='btn btn-xs btn-danger';
        b.textContent=amt===h.mortgage?'Pay Off':'Pay '+DATA.fmtMoney(amt);
        b.addEventListener('click',()=>{const r=Engine.payDebt('mortgage',amt);showToast(r.msg,r.ok?'good':'bad');if(r.ok){updateDisplay();renderAssets();}});
        mRow.appendChild(b);
      });
      bAct.appendChild(mRow);
    });

    const g2 = State.get();
    const spouse = g2.relationships.find(r => r.subtype==='spouse' && r.status==='active');
    const spouseNW = spouse ? (spouse.money||0)+(spouse.investments||0)+(spouse.houses||[]).reduce((s,h)=>s+(h.equity||h.value||0),0)+(spouse.cars||[]).reduce((s,v)=>s+(v.value||0),0) : 0;
    const sumCard = document.createElement('div'); sumCard.className = 'summary-card mb-8';
    sumCard.innerHTML = `
      <div class="flex-between">
        <span class="fw-700">Net Worth</span>
        <span class="text-green fw-700">${DATA.fmtMoney(nw)}</span>
      </div>
      <div class="text-dim">Cash: ${DATA.fmtMoney(c.money)} · Investments: ${DATA.fmtMoney(c.assets.investments)}</div>
      ${c.education.studentLoan>0?`<div class="text-red">Loan: -${DATA.fmtMoney(c.education.studentLoan)}</div>`:''}
      ${spouse ? `<div class="text-dim" style="margin-top:4px">Partner (${spouse.name}): ${DATA.fmtMoney(spouseNW)}</div>` : ''}
    `;
    div.appendChild(sumCard);

        // ── Taxes ──────────────────────────────────────────────────
    if (c.career.jobId && !c.career.retired) {
      mkSection(div, 'Taxes');
      const taxInfo = Engine.getTaxInfo(c);
      const taxCard = document.createElement('div'); taxCard.className = 'item-card';
      taxCard.innerHTML = `<div class="flex-between mb-8"><span class="fw-700">Income Tax</span><span class="text-red">${Math.round(taxInfo.rate*100)}% bracket</span></div><div class="text-dim">Paying ~${DATA.fmtMoney(taxInfo.annual)}/yr · Paid this life: ${DATA.fmtMoney(taxInfo.paid)}</div>`;
      div.appendChild(taxCard);
    }

    // ── Bank Loan ──────────────────────────────────────────────
    mkSection(div, 'Personal Loan');
    if (c.personalLoan > 0) {
      const loanCard = document.createElement('div'); loanCard.className = 'item-card';
      loanCard.innerHTML = `<div class="flex-between mb-8"><span class="fw-700">Outstanding Loan</span><span class="text-red">-${DATA.fmtMoney(c.personalLoan)}</span></div><div class="text-dim">9% interest/yr · ~${DATA.fmtMoney(Math.round(c.personalLoan*0.15+500))} paid/yr automatically</div>`;
      div.appendChild(loanCard);
    } else {
      const maxLoan = Math.max(5000, (c.career.salary||0) * 3);
      [Math.round(maxLoan*0.25), Math.round(maxLoan*0.5), maxLoan].filter(v=>v>=1000).forEach(amt => {
        const canAff = true;
        const row = document.createElement('div'); row.className = 'buy-item';
        row.innerHTML = `<div><div class="buy-item-name">Borrow ${DATA.fmtMoney(amt)}</div><div class="buy-item-sub">9% interest · repaid automatically</div></div><button class="btn btn-secondary btn-xs">Take Loan</button>`;
        row.querySelector('button').addEventListener('click', () => { const r=Engine.takeLoan(amt); showToast(r.msg,r.ok?'good':'bad'); if(r.ok){updateDisplay();renderAssets();} });
        div.appendChild(row);
      });
    }

    // ── Insurance ─────────────────────────────────────────────
    mkSection(div, 'Insurance');
    [{ id:'health',label:'Health Insurance',cost:500,desc:'Doctor/dentist visits discounted'}, {id:'home',label:'Home Insurance',cost:400,desc:'Protects property equity'}, {id:'car',label:'Car Insurance',cost:300,desc:'Protects vehicle value'}].forEach(ins => {
      const active = c.insurance?.[ins.id];
      const card = document.createElement('div'); card.className = 'item-card clickable';
      card.innerHTML = `<div class="flex-between"><span class="fw-700">${ins.label}</span><span class="${active?'text-green':'text-dim'}">${active?'Active':'Inactive'}</span></div><div class="text-dim">${DATA.fmtMoney(ins.cost)}/yr · ${ins.desc}</div>`;
      card.addEventListener('click', () => { const r=Engine.manageInsurance(ins.id,!active); showToast(r.msg,r.ok?'good':'info'); updateDisplay(); renderAssets(); });
      div.appendChild(card);
    });

    // Houses
    mkSection(div, 'Properties');
    if (!c.assets.houses.length) div.appendChild(makeEmpty('Ho', 'No properties owned.'));
    else c.assets.houses.forEach((h,idx) => {
      const card = document.createElement('div'); card.className = 'item-card';
      const rentAmt = Math.round(h.value * 0.06);
      card.innerHTML = `
        <div class="item-top">
          <div class="item-icon ic-teal">Ho</div>
          <div class="item-info">
            <div class="item-name">${h.name}${h.isRental?' <span class="badge badge-accent">Rental</span>':''}</div>
            <div class="item-sub text-green">${DATA.fmtMoney(h.value)}</div>
            ${h.mortgage>0?`<div class="item-detail text-red">Mortgage: -${DATA.fmtMoney(h.mortgage)}</div>`:'<div class="item-detail text-green">Fully owned</div>'}
            ${h.isRental?`<div class="item-detail text-green">Earns ~${DATA.fmtMoney(rentAmt)}/yr in rent</div>`:''}
          </div>
        </div>
        <div class="item-actions">
          <button class="btn btn-secondary btn-sm" data-rental-house="${idx}">${h.isRental?'Stop Renting':'Rent Out'}</button>
          <button class="btn btn-danger btn-sm" data-sell-house="${idx}">Sell</button>
        </div>`;
      card.querySelector(`[data-sell-house]`).addEventListener('click', () => { if(confirm('Sell property?')){Engine.sellHouse(idx);showToast('Property sold.','good');updateDisplay();renderAssets();} });
      card.querySelector(`[data-rental-house]`).addEventListener('click', () => { const r=Engine.toggleRental(idx); showToast(r.msg,'good'); updateDisplay(); renderAssets(); });
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

    // ── Items Shop ─────────────────────────────────────────────
    mkSection(div, 'Item Shop — Equipment');
    const equipItems = DATA.getAllItems().filter(i => i.category === 'equipment');
    equipItems.forEach(item => {
      const owned   = c.items.includes(item.id);
      const canAff  = c.money >= item.cost;
      const row = document.createElement('div'); row.className = 'buy-item';
      const hobbyName = item.hobbyBoost ? DATA.getHobby(item.hobbyBoost)?.name || item.hobbyBoost : null;
      row.innerHTML = `
        <div>
          <div class="buy-item-name">
            <span class="item-icon-tiny ${item.iconClass}">${item.icon}</span>
            ${item.name}${owned ? ' <span class="badge badge-accent">Owned</span>' : ''}
          </div>
          <div class="buy-item-sub">${item.desc}${hobbyName ? ` · Boosts ${hobbyName}` : ''}</div>
        </div>
        <div class="flex-row">
          <span class="buy-item-price">${DATA.fmtMoney(item.cost)}</span>
          ${!owned && canAff ? `<button class="btn btn-success btn-xs" data-buy-item="${item.id}">Buy</button>` : ''}
        </div>`;
      if (!owned && canAff) {
        row.querySelector('[data-buy-item]').addEventListener('click', () => {
          const r = Engine.buyItem(item.id);
          showToast(r.msg, r.ok ? 'good' : 'bad');
          if (r.ok) { updateDisplay(); renderAssets(); }
        });
      }
      div.appendChild(row);
    });

    mkSection(div, 'Books & Reading');
    const bookItems = DATA.getAllItems().filter(i => i.category === 'book');
    bookItems.forEach(item => {
      const canAff = c.money >= item.cost;
      const row = document.createElement('div'); row.className = 'buy-item';
      row.innerHTML = `
        <div>
          <div class="buy-item-name"><span class="item-icon-tiny ${item.iconClass}">${item.icon}</span>${item.name}</div>
          <div class="buy-item-sub">${item.desc}</div>
        </div>
        <div class="flex-row">
          <span class="buy-item-price">${DATA.fmtMoney(item.cost)}</span>
          ${canAff ? `<button class="btn btn-success btn-xs" data-buy-item="${item.id}">Read</button>` : ''}
        </div>`;
      if (canAff) {
        row.querySelector('[data-buy-item]').addEventListener('click', () => {
          const r = Engine.buyItem(item.id);
          showToast(r.msg, r.ok ? 'good' : 'bad');
          if (r.ok) { updateDisplay(); renderAssets(); }
        });
      }
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

  // ── Online Dating modal ───────────────────────────────────────
  function showOnlineDatingModal(profiles) {
    let idx = 0;
    function showProfile(i) {
      if (i >= profiles.length) {
        openModal('relationships');
        return;
      }
      const p = profiles[i];
      const overlay = qs('#modal-event');
      qs('#evt-category').textContent = 'Dating Apps';
      qs('#evt-category').className = 'evt-category cat-social';
      qs('#evt-title').textContent = `${p.name}, ${p.age}`;
      qs('#evt-desc').textContent = `"${p.bio}" · Interests: ${p.interests.join(', ')} · Compatibility: ${p.compatibility}%`;
      const choicesDiv = qs('#evt-choices'); choicesDiv.innerHTML = '';
      const connectBtn = document.createElement('button'); connectBtn.className = 'evt-choice';
      connectBtn.textContent = 'Connect';
      connectBtn.addEventListener('click', () => {
        overlay.classList.add('hidden');
        const r = Engine.connectWithMatch(p);
        showToast(r.msg, r.matched ? 'good' : 'info');
        updateDisplay();
        if (!r.matched && i + 1 < profiles.length) showProfile(i + 1);
        else openModal('relationships');
      });
      const passBtn = document.createElement('button'); passBtn.className = 'evt-choice';
      passBtn.textContent = `Pass${i+1 < profiles.length ? ' · See next' : ''}`;
      passBtn.addEventListener('click', () => { overlay.classList.add('hidden'); showProfile(i + 1); });
      choicesDiv.append(connectBtn, passBtn);
      overlay.classList.remove('hidden');
    }
    showProfile(0);
  }

  // ── Group Trip modal ──────────────────────────────────────────
  function showGroupTripModal() {
    const c = State.getChar();
    const overlay = qs('#modal-event');
    qs('#evt-category').textContent = 'Group Trip';
    qs('#evt-category').className = 'evt-category cat-adventure';
    qs('#evt-title').textContent = 'Plan a Group Trip';
    qs('#evt-desc').textContent = `Your circle adventure awaits. Group discount applies! You have ${DATA.fmtMoney(c.money)}.`;
    const choicesDiv = qs('#evt-choices'); choicesDiv.innerHTML = '';
    DATA.TRAVEL_DESTINATIONS.forEach(dest => {
      const groupCost = Math.round(dest.cost * 0.7);
      const canAff = c.money >= groupCost;
      const btn = document.createElement('button'); btn.className = 'evt-choice';
      btn.innerHTML = `${dest.name} — ${DATA.fmtMoney(groupCost)}<div class="evt-choice-sub">${dest.desc}</div>`;
      btn.disabled = !canAff; btn.style.opacity = canAff ? '1' : '0.4';
      btn.addEventListener('click', () => {
        overlay.classList.add('hidden');
        const r = Engine.groupTrip(dest.id);
        showToast(r.msg, r.ok ? 'good' : 'bad');
        updateDisplay();
      });
      choicesDiv.appendChild(btn);
    });
    const cancel = document.createElement('button'); cancel.className='evt-choice'; cancel.textContent='Cancel';
    cancel.addEventListener('click', () => { overlay.classList.add('hidden'); openModal('relationships'); });
    choicesDiv.appendChild(cancel);
    overlay.classList.remove('hidden');
  }

  // ── Bucket List modal ─────────────────────────────────────────
  function showBucketListModal() {
    const overlay = qs('#modal-event');
    qs('#evt-category').textContent = 'Bucket List';
    qs('#evt-category').className = 'evt-category cat-adventure';
    qs('#evt-title').textContent = 'Set Your Life Goals';
    qs('#evt-desc').textContent = 'Choose 3 things you want to accomplish before your life is over.';
    const choicesDiv = qs('#evt-choices'); choicesDiv.innerHTML = '';

    const selected = [];
    const goalBtns = [];
    DATA.BUCKET_GOALS.forEach(goal => {
      const btn = document.createElement('button'); btn.className = 'evt-choice';
      btn.innerHTML = `${goal.name}<div class="evt-choice-sub">${goal.desc}</div>`;
      btn.addEventListener('click', () => {
        const idx = selected.indexOf(goal.id);
        if (idx >= 0) {
          selected.splice(idx, 1);
          btn.style.background = '';
          btn.style.fontWeight = '';
        } else if (selected.length < 3) {
          selected.push(goal.id);
          btn.style.background = 'var(--accent-light)';
          btn.style.fontWeight = '700';
        }
        confirmBtn.textContent = `Set Goals (${selected.length}/3)`;
        confirmBtn.disabled = selected.length !== 3;
      });
      goalBtns.push(btn);
      choicesDiv.appendChild(btn);
    });

    const confirmBtn = document.createElement('button'); confirmBtn.className='btn btn-primary btn-full';
    confirmBtn.textContent = 'Set Goals (0/3)'; confirmBtn.disabled = true;
    confirmBtn.style.marginTop = '8px';
    confirmBtn.addEventListener('click', () => {
      overlay.classList.add('hidden');
      Engine.setBucketGoals(selected);
      showToast('Bucket list set! Good luck!', 'good');
      openModal('activities');
    });
    choicesDiv.appendChild(confirmBtn);
    const cancel = document.createElement('button'); cancel.className='evt-choice'; cancel.textContent='Later';
    cancel.addEventListener('click', () => { overlay.classList.add('hidden'); openModal('activities'); });
    choicesDiv.appendChild(cancel);
    overlay.classList.remove('hidden');
  }

  // ── Adopt pet modal ───────────────────────────────────────────
  function showAdoptPetModal() {
    const c = State.getChar();
    const overlay = qs('#modal-event');
    qs('#evt-category').textContent = 'Pets';
    qs('#evt-category').className = 'evt-category cat-social';
    qs('#evt-title').textContent = 'Adopt a Pet';
    qs('#evt-desc').textContent = 'Choose your new companion. They will bring joy to your life.';
    const choicesDiv = qs('#evt-choices'); choicesDiv.innerHTML = '';

    // Name input
    const nameInput = document.createElement('input');
    nameInput.type = 'text'; nameInput.className = 'form-input';
    nameInput.placeholder = 'Name your pet (leave blank for random)';
    nameInput.style.cssText = 'width:100%;margin-bottom:10px';
    choicesDiv.appendChild(nameInput);

    DATA.PETS.forEach(pet => {
      const canAff = c.money >= pet.adoptCost;
      const btn = document.createElement('button');
      btn.className = 'evt-choice';
      btn.innerHTML = `${pet.name} — ${DATA.fmtMoney(pet.adoptCost)}<div class="evt-choice-sub">Lifespan ~${pet.lifespan} yrs · ${pet.desc}</div>`;
      btn.disabled = !canAff;
      btn.style.opacity = canAff ? '1' : '0.4';
      btn.addEventListener('click', () => {
        overlay.classList.add('hidden');
        const r = Engine.adoptPet(pet.id, nameInput.value);
        showToast(r.msg, r.ok ? 'good' : 'bad');
        if (r.ok) { updateDisplay(); openModal('activities'); }
      });
      choicesDiv.appendChild(btn);
    });
    const cancel = document.createElement('button');
    cancel.className = 'evt-choice'; cancel.textContent = 'Maybe later';
    cancel.addEventListener('click', () => { overlay.classList.add('hidden'); openModal('activities'); });
    choicesDiv.appendChild(cancel);
    overlay.classList.remove('hidden');
  }

  // ── DEATH screen ──────────────────────────────────────────────
  function showDeathScreen() {
    const s = Engine.getLifeSummary();
    qs('#death-name').textContent  = s.name;
    qs('#death-years').textContent = `${s.birthYear} – ${s.birthYear+s.age} · Aged ${s.age} · ${s.country}`;
    qs('#death-cause').textContent = `Cause of death: ${s.cause}`;
    const ribbonEl = qs('#death-ribbon');
    if (ribbonEl && s.ribbon) {
      ribbonEl.innerHTML = `🎗 ${s.ribbon.ribbon} <span style="font-weight:400;font-size:.75rem;opacity:.85">— ${s.ribbon.desc}</span>`;
      ribbonEl.style.display = 'block';
    } else if (ribbonEl) ribbonEl.style.display = 'none';
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

    // Save legacy and show legacy info
    const legacyResult = Engine.saveLegacy(s);
    if (legacyResult) {
      const legEl = document.createElement('div');
      legEl.className = 'legacy-summary';
      const nextBonuses = Engine.getLegacyBonuses(legacyResult.total);
      const bonusTxt = Object.entries(nextBonuses).filter(([,v])=>v>0).map(([k,v])=>`+${k==='money'?DATA.fmtMoney(v):`${v} ${ucFirst(k)}`}`).join(', ');
      legEl.innerHTML = `
        <div class="legacy-title">Family Legacy</div>
        <div class="legacy-stats">Lives: ${legacyResult.lives} · Total Points: ${legacyResult.total.toLocaleString()}</div>
        ${bonusTxt ? `<div class="legacy-bonus">Next life starts with: ${bonusTxt}</div>` : ''}
        <div class="legacy-gained">+${legacyResult.gained} pts this life</div>`;
      qs('#death-achievements').after(legEl);
    }
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

    // Legacy bonus display
    const legacy = Engine.getLegacyInfo();
    const legEl  = qs('#preview-family');
    if (legacy.lives > 0) {
      const bonusTxt = Object.entries(legacy.bonuses).filter(([,v])=>v>0).map(([k,v])=>`+${k==='money'?DATA.fmtMoney(v):`${v} ${k}`}`).join(' · ');
      if (bonusTxt) {
        const legDiv = document.createElement('div');
        legDiv.style.cssText = 'margin-top:8px;font-size:.78rem;color:var(--accent);font-weight:600';
        legDiv.textContent = `Family legacy (${legacy.lives} lives): ${bonusTxt}`;
        legEl.after(legDiv);
      }
    }

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
