/* ═══════════════════════════════════════════════════════════════
   ENGINE.JS — Core game logic
   Character creation · Age up · Events · Hobbies · Death
   ═══════════════════════════════════════════════════════════════ */

const Engine = (() => {

  // ── Create a character with optional customization ─────────────
  function createCharacter({ firstName, lastName, country, gender, sexuality } = {}) {
    const resolvedGender  = (gender === 'random' || !gender) ? (Math.random() < 0.5 ? 'female' : 'male') : gender;
    const resolvedCountry = country || DATA.randomCountry();
    const wealth          = DATA.randomWealthClass();

    const rnd = (base, spread) => State.clampStat(base + (Math.random() * spread * 2) - spread);
    const smarts    = rnd(50, 20) + wealth.startBonus;
    const looks     = rnd(50, 20);
    const health    = rnd(80, 10);
    const happiness = rnd(75, 10) + wealth.startBonus;

    // Resolve family names according to country tradition
    const nameData = DATA.generateFamilyNames(lastName || null, resolvedCountry);
    const childFirst = firstName || DATA.randomFrom(resolvedGender === 'female' ? DATA.FEMALE_NAMES : DATA.MALE_NAMES);

    const characterData = {
      firstName: childFirst,
      lastName: nameData.childSurname,
      gender: resolvedGender,
      age: 0,
      birthYear: new Date().getFullYear(),
      country: resolvedCountry.name,
      countryFlag: resolvedCountry.flag,
      wealthClass: wealth.id,
      health: State.clampStat(health),
      happiness: State.clampStat(happiness),
      smarts: State.clampStat(smarts),
      looks: State.clampStat(looks),
      fame: 0,
      money: Math.round(wealth.startMoney * (0.8 + Math.random() * 0.4) * resolvedCountry.wealthMod),
      education: { level:'none', major:null, institution:null, gpa:0, studentLoan:0, certificates:[], inSchool:false, schoolType:null, schoolYear:0, schoolDuration:0, pendingCert:null },
      career: { jobId:null, title:null, salary:0, yearsAtJob:0, promotionLevel:0, performance:70, retired:false },
      assets: { houses:[], cars:[], investments:0 },
      hobbies: [],
      extracurriculars: [],
      sexuality: (sexuality === 'discover' || !sexuality)
        ? DATA.randomFrom(['straight','straight','straight','gay','bisexual','pansexual','asexual'])
        : sexuality,
      genderIdentity: 'cis',
      sexualityKnown: sexuality !== 'discover',
    };

    // Parents and siblings share the family surname
    const dadFirst   = DATA.randomFrom(DATA.MALE_NAMES);
    const momFirst   = DATA.randomFrom(DATA.FEMALE_NAMES);
    const dadName    = `${dadFirst} ${nameData.fatherSurname}`;
    const momName    = `${momFirst} ${nameData.motherSurname}`;
    const dadAge     = 25 + Math.floor(Math.random() * 15);
    const momAge     = 22 + Math.floor(Math.random() * 14);

    const relationships = [];
    const counter = { val: 0 };
    const add = r => { r.id = 'rel_' + (++counter.val); relationships.push(r); };

    add({ name:dadName, type:'family', subtype:'father', age:dadAge, relationship:70, traits:DATA.randomTraits(2), status:'active' });
    add({ name:momName, type:'family', subtype:'mother', age:momAge, relationship:75, traits:DATA.randomTraits(2), status:'active' });

    if (Math.random() < 0.6) {
      const sibGender = Math.random() < 0.5 ? 'male' : 'female';
      const sibFirst  = DATA.randomFrom(sibGender === 'female' ? DATA.FEMALE_NAMES : DATA.MALE_NAMES);
      add({ name:`${sibFirst} ${nameData.siblingSurname}`, type:'family', subtype:'sibling', age:Math.floor(Math.random()*8)+1, relationship:60, traits:DATA.randomTraits(2), status:'active' });
    }

    return { characterData, relationships, initCounter: counter.val, nameData };
  }

  // ── Main age-up loop ──────────────────────────────────────────
  async function ageUp() {
    const g = State.get();
    const c = g.character;

    c.age++;
    g.currentYear++;
    g.relationships.forEach(r => { if (r.status === 'active') r.age++; });

    applyStatDrift(c);
    applyPassiveEffects(c, g);
    updateEducation(c, g);
    updateCareerPerformance(c);
    applyHobbyPassiveGains(c);
    applyExtracurricularPassiveGains(c);

    const stage = DATA.getStage(c.age);
    const maxEv = stage === 'infant' ? 1 : stage === 'child' ? 2 : 3;
    const evCount = Math.floor(Math.random() * (maxEv + 1));
    const events = DATA.filterEvents(g, State.usedOnceSet(), evCount);

    for (const event of events) {
      if (event.once) State.markEventUsed(event.id);
      await UI.showEventModal(event);
    }

    checkEducationMilestones(c, g);
    checkAchievements(g);

    const death = checkDeath(c, g);
    if (death) {
      g.isAlive = false; g.deathAge = c.age; g.deathCause = death.cause;
      State.addLog(c.age, `Died: ${death.cause}`, 'bad');
      State.saveGame();
      UI.showDeathScreen();
      return;
    }

    State.saveGame();
    UI.updateDisplay();
  }

  // ── Stat drift ────────────────────────────────────────────────
  function applyStatDrift(c) {
    const a = c.age;
    let hDrift  = a > 60 ? -(2 + Math.random()*3) : a > 40 ? -(0.5 + Math.random()*1.5) : (Math.random()*1.5 - 0.5);
    let lDrift  = a < 22 ? (1 + Math.random()*2) : a < 30 ? 0 : a < 50 ? -(0.5 + Math.random()) : -(1 + Math.random()*2);
    let haDrift = (50 - c.happiness) * 0.04 + (Math.random() * 6 - 3);
    let sDrift  = a < 20 ? (0.5 + Math.random()*1.5) : a < 40 ? Math.random()*0.5 : a > 65 ? -(Math.random()) : 0;

    c.health    = State.clampStat(c.health    + hDrift);
    c.looks     = State.clampStat(c.looks     + lDrift);
    c.happiness = State.clampStat(c.happiness + haDrift);
    c.smarts    = State.clampStat(c.smarts    + sDrift);
  }

  // ── Passive effects (salary, loans, investments) ──────────────
  function applyPassiveEffects(c, g) {
    if (c.career.jobId && !c.career.retired) {
      c.money += c.career.salary;
      c.career.yearsAtJob++;
    }
    if (c.education.studentLoan > 0) {
      const pay = Math.min(c.education.studentLoan, Math.round(c.education.studentLoan * 0.1) + 1000);
      c.education.studentLoan -= pay;
      c.money -= pay;
      if (c.education.studentLoan < 0) c.education.studentLoan = 0;
    }
    c.assets.houses.forEach(h => {
      if (h.mortgage > 0) {
        const pay = Math.round(h.mortgage * 0.04);
        h.mortgage -= pay; h.equity = h.value - h.mortgage;
        c.money -= pay;
        h.value = Math.round(h.value * (1.02 + Math.random() * 0.05));
        if (h.mortgage < 0) h.mortgage = 0;
      }
    });
    if (c.assets.investments > 0) {
      c.assets.investments = Math.round(c.assets.investments * (1 + Math.random() * 0.2 - 0.05));
    }
  }

  // ── Extracurricular passive gains each year ───────────────────
  function applyExtracurricularPassiveGains(c) {
    const inSchool = c.age >= 6 && c.age <= 18;
    c.extracurriculars.forEach(entry => {
      const def = DATA.getExtracurricular(entry.id);
      if (!def) return;
      entry.yearsParticipated = (entry.yearsParticipated || 0) + 1;
      if (!inSchool) return; // no gains after school age
      // Passive slow skill gain
      entry.skillLevel = Math.min(100, entry.skillLevel + 1);
      // Hobby boost: if character has a matching hobby, gain more
      const hobbyMatch = c.hobbies.find(h => def.hobbyBoost.includes(h.id));
      const mult = hobbyMatch ? 0.6 : 0.3;
      const gains = def.statGains;
      if (gains.health)    c.health    = State.clampStat(c.health    + gains.health    * mult);
      if (gains.happiness) c.happiness = State.clampStat(c.happiness + gains.happiness * mult);
      if (gains.smarts)    c.smarts    = State.clampStat(c.smarts    + gains.smarts    * mult);
      if (gains.looks)     c.looks     = State.clampStat(c.looks     + gains.looks     * mult);
    });
  }

  // ── Hobby passive gains each year ─────────────────────────────
  function applyHobbyPassiveGains(c) {
    c.hobbies.forEach(hEntry => {
      const hDef = DATA.getHobby(hEntry.id);
      if (!hDef) return;
      hEntry.yearsPracticed++;
      // Passive slow gain from just having the hobby
      hEntry.skillLevel = Math.min(100, hEntry.skillLevel + 1);
      // Small stat gains each year
      const gains = hDef.statGains;
      const mult  = 0.3; // passive is 30% of active practice
      if (gains.health)    c.health    = State.clampStat(c.health    + gains.health    * mult);
      if (gains.happiness) c.happiness = State.clampStat(c.happiness + gains.happiness * mult);
      if (gains.smarts)    c.smarts    = State.clampStat(c.smarts    + gains.smarts    * mult);
      if (gains.looks)     c.looks     = State.clampStat(c.looks     + gains.looks     * mult);
    });
  }

  // ── Career performance & promotion ───────────────────────────
  function updateCareerPerformance(c) {
    if (!c.career.jobId) return;
    const drift = (70 - c.career.performance) * 0.05 + (Math.random() * 10 - 5);
    c.career.performance = State.clampStat(c.career.performance + drift);
    checkPromotion(c);
  }

  function checkPromotion(c) {
    if (!c.career.jobId) return;
    const career = DATA.getCareer(c.career.jobId);
    if (!career) return;
    const next = career.promotions[c.career.promotionLevel + 1];
    if (!next || c.career.yearsAtJob < next.yearsMin) return;
    const hobbyBonus = DATA.getHobbyCareerBonus(c.hobbies, c.career.jobId);
    const extraBonus = DATA.getExtracurricularCareerBonus(c.extracurriculars, c.career.jobId);
    const chance = (c.career.performance / 100) * 0.3 + (hobbyBonus + extraBonus) * 0.1;
    if (Math.random() < chance) {
      c.career.promotionLevel++;
      c.career.title  = next.title;
      c.career.salary = Math.round(career.salary.base * next.salaryMult);
      State.addLog(c.age, `Promoted to ${next.title} — ${DATA.fmtMoney(c.career.salary)}/yr`, 'career');
      UI.showToast(`Promoted to ${next.title}!`, 'good');
    }
  }

  // ── Education progress ────────────────────────────────────────
  function updateEducation(c, g) {
    if (!c.education.inSchool) return;
    c.education.schoolYear++;
    if (c.education.schoolYear >= c.education.schoolDuration) {
      c.education.inSchool = false;
      if (c.education.schoolType === 'trade') {
        State.addLog(c.age, `Completed trade school: ${c.education.pendingCert}`, 'edu');
        UI.showToast('Trade school complete!', 'good');
        c.education.pendingCert = null;
      } else {
        const lvlMap = { some_college:'bachelor', bachelor:'master', master:'doctorate' };
        c.education.level = lvlMap[c.education.level] || 'bachelor';
        State.addLog(c.age, `Graduated with a degree in ${c.education.major} (${c.education.level})`, 'edu');
        UI.showToast(`Graduated! ${c.education.level} degree earned.`, 'good');
      }
    }
  }

  function checkEducationMilestones(c, g) {
    const a = c.age; const edu = c.education;
    if (a === 6  && edu.level === 'none')          { edu.level = 'elementary';   State.addLog(a, 'Started elementary school.', 'edu'); }
    if (a === 12 && edu.level === 'elementary')    { edu.level = 'middleschool'; State.addLog(a, 'Started middle school.', 'edu'); }
    if (a === 14 && edu.level === 'middleschool')  { edu.level = 'highschool';   State.addLog(a, 'Started high school.', 'edu'); }
    if (a === 18 && edu.level === 'highschool')    { g.hasGraduatedHighSchool = true; State.addLog(a, 'Graduated high school!', 'edu'); UI.showToast('High school graduate!', 'good'); }
  }

  // ── Death check ───────────────────────────────────────────────
  function checkDeath(c, g) {
    if (g.immortal) return null;
    const a = c.age;
    let chance = 0;
    if (a >= 65)  chance += 0.02 + (a - 65) * 0.015;
    if (a >= 85)  chance += 0.1;
    if (a >= 100) chance += 0.3;
    if (c.health < 20) chance += 0.25;
    else if (c.health < 40) chance += 0.1;
    if (Math.random() < 0.003 && a > 10) return { cause:'Sudden accident' };
    if (Math.random() < chance) {
      if (c.health < 20) return { cause:'Illness and health complications' };
      if (a >= 100) return { cause:'Extreme old age' };
      if (a >= 85)  return { cause:'Natural causes' };
      const causes = ['Heart disease','Stroke','Cancer','Natural causes'];
      return { cause: DATA.randomFrom(causes) };
    }
    return null;
  }

  // ── Achievement checks ────────────────────────────────────────
  function checkAchievements(g) {
    const c = g.character;
    const ul = id => { if (State.unlockAchievement(id)) { const a = DATA.ACHIEVEMENTS.find(x=>x.id===id); if(a) UI.showToast(`Achievement: ${a.name}`, 'good'); } };
    if (c.age >= 100)  ul('centenarian');
    if (c.money >= 1e6) ul('millionaire');
    if (c.money >= 1e9) ul('billionaire');
    if (c.smarts >= 95) ul('smart_cookie');
    if (c.health >= 95) ul('health_nut');
    if ((c.fame||0) >= 50) ul('famous');
    if ((c.fame||0) >= 90) ul('super_famous');
    if (g.relationships.some(r=>r.subtype==='spouse')) ul('happily_ever_after');
    if (g.relationships.some(r=>r.subtype==='child'))  ul('parent');
    if (c.education.level === 'doctorate') ul('scholar');
    if (c.career.jobId === 'doctor')  ul('doctor_life');
    if (c.career.jobId === 'lawyer')  ul('law_of_the_land');
    if (g.jobHistory.length >= 5) ul('polyglot_career');
    if (c.wealthClass === 'impoverished' && c.money >= 500000) ul('self_made');
    const career = DATA.getCareer(c.career.jobId||'');
    if (career && c.career.promotionLevel === career.promotions.length-1) ul('top_of_career');
    if (career?.category === 'artistic' && c.career.yearsAtJob >= 10) ul('creative_spirit');
    const spouse = g.relationships.find(r=>r.subtype==='spouse'&&r.status==='active');
    if (spouse && c.age >= (spouse.marriedAge||0)+50) ul('long_marriage');
    // Hobby achievements
    const topHobby = c.hobbies.find(h => h.skillLevel >= 80);
    if (topHobby) ul('hobby_master');
    const masterHobbies = c.hobbies.filter(h => h.skillLevel >= 50);
    if (masterHobbies.length >= 3) ul('renaissance');
  }

  // ── Life summary ──────────────────────────────────────────────
  function getLifeSummary() {
    const g = State.get(); const c = g.character;
    const highlights = [];
    if (c.career.jobId) { const car = DATA.getCareer(c.career.jobId); if(car) highlights.push(`Worked as ${c.career.title || car.name}`); }
    if (c.career.retired) highlights.push('Enjoyed a peaceful retirement');
    const eduMap = { bachelor:"bachelor's degree", master:"master's degree", doctorate:'doctorate', tradeschool:'trade certificate' };
    if (eduMap[c.education.level]) highlights.push(`Earned a ${eduMap[c.education.level]}`);
    if (c.education.major) highlights.push(`Studied ${c.education.major}`);
    const spouse = g.relationships.find(r=>r.subtype==='spouse'&&r.status==='active');
    if (spouse) highlights.push(`Married to ${spouse.name}`);
    const children = g.relationships.filter(r=>r.subtype==='child');
    if (children.length) highlights.push(`Had ${children.length} child${children.length>1?'ren':''}`);
    if ((c.fame||0) >= 80) highlights.push(`World-famous celebrity (Fame ${c.fame})`);
    else if ((c.fame||0) >= 40) highlights.push(`Notable fame (Fame ${c.fame})`);
    const nw = getNetWorth(c);
    highlights.push(`Final net worth: ${DATA.fmtMoney(nw)}`);
    if (c.assets.houses.length) highlights.push(`Owned ${c.assets.houses.length} propert${c.assets.houses.length>1?'ies':'y'}`);
    if (c.hobbies.length) highlights.push(`Hobbies: ${c.hobbies.map(h=>DATA.getHobby(h.id)?.name||h.id).join(', ')}`);
    return {
      name: `${c.firstName} ${c.lastName}`,
      age: g.deathAge || c.age,
      cause: g.deathCause || 'Unknown',
      highlights,
      netWorth: nw,
      achievements: g.achievements.map(id=>DATA.ACHIEVEMENTS.find(a=>a.id===id)).filter(Boolean),
      cheatsUsed: g.cheatsUsed,
      finalStats: { health:c.health, happiness:c.happiness, smarts:c.smarts, looks:c.looks },
      birthYear: c.birthYear,
      country: c.country,
    };
  }

  function getNetWorth(c) {
    let w = c.money + c.assets.investments;
    c.assets.houses.forEach(h => w += (h.equity || h.value));
    c.assets.cars.forEach(car => w += car.value);
    w -= (c.education.studentLoan || 0);
    return w;
  }

  // ── Event application ─────────────────────────────────────────
  function applyEventChoice(event, choiceIdx) {
    const g = State.get(); const c = g.character;
    const partnerName = () => { const p = State.getPartner(); return p ? p.name : 'your partner'; };

    if (event.choices && choiceIdx >= 0) {
      const choice = event.choices[choiceIdx];
      if (!choice) return;
      if (choice.effects) State.applyEffects(choice.effects);
      if (choice.moneyGamble) {
        const mg = choice.moneyGamble;
        const win = Math.random() < mg.chance;
        const amt = Math.round(c.money * (win ? mg.win - 1 : mg.lose - 1));
        c.money = Math.max(0, c.money + amt);
        const msg = win ? `Won ${DATA.fmtMoney(Math.abs(amt))}!` : `Lost ${DATA.fmtMoney(Math.abs(amt))}.`;
        UI.showToast(msg, win ? 'good' : 'bad');
        State.addLog(c.age, msg, win ? 'good' : 'bad');
      }
      if (choice.marry) {
        const p = State.getPartner();
        if (p) { p.subtype = 'spouse'; p.marriedAge = c.age; State.addLog(c.age, `Married ${p.name}!`, 'rel'); UI.showToast(`Married ${p.name}!`, 'good'); }
      }
      if (choice.breakUp) {
        const p = State.getPartner();
        if (p) { p.status = 'broken_up'; p.type = 'ex'; State.addLog(c.age, `Broke up with ${p.name}.`, 'rel'); }
      }
      if (choice.divorce) {
        const p = State.getPartner();
        if (p) { p.status = 'divorced'; p.type = 'ex'; State.addLog(c.age, `Divorced ${p.name}.`, 'bad'); }
      }
      if (choice.addPartner) {
        const gen = DATA.getAttractedGender(c.gender, c.sexuality) || (c.gender === 'male' ? 'female' : 'male');
        const nm  = DATA.randomName(gen);
        const rel = State.addRelationship({ name:nm.full, type:'partner', subtype:'partner', age:c.age+Math.floor(Math.random()*5)-2, relationship:70, traits:DATA.randomTraits(2), status:'active' });
        State.addLog(c.age, `Started dating ${rel.name}.`, 'rel');
        UI.showToast(`Now dating ${rel.name}!`, 'good');
      }
      if (choice.haveChild) {
        const cg  = Math.random() < 0.5 ? 'female' : 'male';
        const cnm = DATA.randomFrom(cg === 'female' ? DATA.FEMALE_NAMES : DATA.MALE_NAMES);
        const rel = State.addRelationship({ name:`${cnm} ${c.lastName}`, type:'family', subtype:'child', age:0, relationship:80, traits:DATA.randomTraits(2), status:'active' });
        State.addLog(c.age, `${rel.name} was born!`, 'rel');
        UI.showToast(`${rel.name} is born!`, 'good');
      }
      if (choice.addCrush || event.addCrush) {
        const cg = DATA.getAttractedGender(c.gender, c.sexuality) || (c.gender === 'male' ? 'female' : 'male');
        const cn = DATA.randomName(cg);
        State.addRelationship({ name:cn.full, type:'friend', subtype:'crush', age:c.age, relationship:55, traits:DATA.randomTraits(2), status:'active' });
      }
      if (choice.retire) {
        c.career.retired = true;
        State.addLog(c.age, `Retired after ${c.career.yearsAtJob} years of work.`, 'career');
      }
      State.addLog(c.age, `${event.title}: ${choice.text}`, 'event');

    } else {
      // Auto event
      if (event.effects) State.applyEffects(event.effects);
      if (event.smartsCheck) {
        const s = c.smarts;
        if (s >= 70)      { State.applyEffects({ smarts:5, happiness:10 }); State.addLog(c.age, 'Report card: excellent grades!', 'good'); }
        else if (s >= 40) { State.addLog(c.age, 'Report card: average grades.', 'event'); }
        else              { State.applyEffects({ happiness:-8 }); State.addLog(c.age, 'Report card: poor grades.', 'bad'); }
        return;
      }
      if (event.lottery) {
        const win = Math.random() < 0.02;
        if (win) { const p = Math.floor(Math.random()*1000000)+10000; c.money+=p; UI.showToast(`Won the lottery! +${DATA.fmtMoney(p)}`, 'good'); State.addLog(c.age, `Won the lottery! ${DATA.fmtMoney(p)}`, 'good'); }
        else { c.money -= 20; State.addLog(c.age, 'Lottery ticket was a dud.', 'event'); }
        return;
      }
      if (event.fireSelf) { quitJob(true); }
      if (event.addFriend) {
        const fg  = Math.random() < 0.5 ? 'female' : 'male';
        const fnm = DATA.randomName(fg);
        const rel = State.addRelationship({ name:fnm.full, type:'friend', subtype:'friend', age:c.age, relationship:60, traits:DATA.randomTraits(2), status:'active' });
        State.addLog(c.age, event.log || `Made friends with ${rel.name}.`, 'event');
        return;
      }
      if (event.log) State.addLog(c.age, event.log, 'event');
      else State.addLog(c.age, event.title, 'event');
    }

    if (c.career.jobId && !g.jobHistory.includes(c.career.jobId)) g.jobHistory.push(c.career.jobId);
  }

  // ── Career actions ────────────────────────────────────────────
  function applyJob(careerId) {
    const g = State.get(); const c = g.character;
    const career = DATA.getCareer(careerId);
    if (!career) return { ok:false, msg:'Unknown career.' };
    const check = DATA.meetsCareerReqs(career, c);
    if (!check.meets) return { ok:false, msg:'Missing: ' + check.missing.join(', ') };
    if (c.career.jobId) quitJob(false);

    c.career.jobId = careerId;
    c.career.title = career.promotions[0].title;
    // Apply hobby start bonus (up to +10% salary)
    const hobbyBonus = DATA.getHobbyCareerBonus(c.hobbies, careerId);
    const extraBonus2 = DATA.getExtracurricularCareerBonus(c.extracurriculars, careerId);
    c.career.salary = Math.round(career.salary.base * career.promotions[0].salaryMult * (1 + (hobbyBonus + extraBonus2) * 0.1));
    c.career.yearsAtJob = 0; c.career.promotionLevel = 0; c.career.performance = 70 + Math.round(hobbyBonus * 15); c.career.retired = false;
    if (!g.jobHistory.includes(careerId)) g.jobHistory.push(careerId);
    State.addLog(c.age, `Started career: ${career.name} — ${career.promotions[0].title}`, 'career');
    State.saveGame();
    return { ok:true, msg:`You are now a ${career.promotions[0].title}!` };
  }

  function quitJob(fired = false) {
    const c = State.getChar();
    if (!c.career.jobId) return;
    const career = DATA.getCareer(c.career.jobId);
    State.addLog(c.age, fired ? `Fired from ${career?.name||'job'}.` : `Left ${career?.name||'job'}.`, fired?'bad':'event');
    c.career.jobId=null; c.career.title=null; c.career.salary=0; c.career.yearsAtJob=0; c.career.promotionLevel=0;
    State.saveGame();
  }

  function workHard() {
    const c = State.getChar();
    if (!c.career.jobId) return { ok:false, msg:'No job!' };
    c.career.performance = State.clampStat(c.career.performance + 15);
    State.applyEffects({ health:-5, happiness:-5 });
    State.addLog(c.age, 'Worked extra hard this year.', 'career');
    checkPromotion(c);
    State.saveGame();
    return { ok:true, msg:'Performance boosted. Health and happiness took a hit.' };
  }

  function slackOff() {
    const c = State.getChar();
    if (!c.career.jobId) return { ok:false, msg:'No job!' };
    c.career.performance = State.clampStat(c.career.performance - 20);
    State.applyEffects({ happiness:10 });
    if (c.career.performance < 20 && Math.random() < 0.3) { quitJob(true); return { ok:true, msg:'Slacked off too much and got fired.' }; }
    State.addLog(c.age, 'Took it easy at work.', 'career');
    State.saveGame();
    return { ok:true, msg:'Happiness up, performance down.' };
  }

  // ── Education actions ─────────────────────────────────────────
  function enrollUniversity(major, loanAmount) {
    const c = State.getChar();
    if (c.education.inSchool) return { ok:false, msg:'Already enrolled.' };
    if (c.age < 18) return { ok:false, msg:'Must be 18+.' };
    const lvl = c.education.level;
    let nextLevel = 'some_college', duration = 4, baseCost = 50000;
    if (lvl === 'bachelor') { nextLevel = 'master';   duration = 2; baseCost = 40000; }
    if (lvl === 'master')   { nextLevel = 'doctorate'; duration = 4; baseCost = 60000; }
    if (lvl === 'doctorate') return { ok:false, msg:'Already have the highest degree.' };
    const institutions = ['State University','City College','Northern University','Westbrook College','Pacific University'];
    c.education.inSchool = true; c.education.schoolType = 'university';
    c.education.schoolYear = 0; c.education.schoolDuration = duration;
    c.education.major = major; c.education.institution = DATA.randomFrom(institutions);
    c.education.studentLoan += loanAmount;
    c.money -= Math.max(0, baseCost - loanAmount);
    State.addLog(c.age, `Enrolled at ${c.education.institution} to study ${major} (${duration} yrs)`, 'edu');
    State.saveGame();
    return { ok:true, msg:`Enrolled! ${duration} years to graduation.` };
  }

  function enrollTrade(certId) {
    const c = State.getChar();
    if (c.education.inSchool) return { ok:false, msg:'Already enrolled.' };
    if (c.age < 17) return { ok:false, msg:'Must be 17+.' };
    const cert = DATA.TRADE_CERTIFICATES.find(t => t.id === certId);
    if (!cert) return { ok:false, msg:'Unknown certificate.' };
    if (c.money < cert.cost) return { ok:false, msg:`Need ${DATA.fmtMoney(cert.cost)}.` };
    c.money -= cert.cost;
    c.education.inSchool = true; c.education.schoolType = 'trade';
    c.education.level = 'tradeschool'; c.education.schoolYear = 0;
    c.education.schoolDuration = cert.duration; c.education.pendingCert = cert.name;
    if (!c.education.certificates.includes(cert.id)) c.education.certificates.push(cert.id);
    State.addLog(c.age, `Enrolled in ${cert.name} (${cert.duration} yrs)`, 'edu');
    State.saveGame();
    return { ok:true, msg:`Enrolled! ${cert.duration} years to certificate.` };
  }

  // ── Asset actions ─────────────────────────────────────────────
  function buyHouse(house) {
    const c = State.getChar();
    const down = Math.round(house.price * 0.2);
    if (c.money < down) return { ok:false, msg:`Need ${DATA.fmtMoney(down)} down payment.` };
    c.money -= down;
    c.assets.houses.push({ name:house.name, value:house.price, mortgage:house.price-down, equity:down, purchaseYear:State.get().currentYear });
    State.addLog(c.age, `Bought a ${house.name} for ${DATA.fmtMoney(house.price)}.`, 'career');
    State.saveGame(); return { ok:true };
  }

  function sellHouse(idx) {
    const c = State.getChar();
    const h = c.assets.houses[idx];
    const proceeds = Math.max(0, h.value - (h.mortgage||0));
    c.money += proceeds;
    State.addLog(c.age, `Sold property for ${DATA.fmtMoney(h.value)}. Net: ${DATA.fmtMoney(proceeds)}`, 'career');
    c.assets.houses.splice(idx, 1); State.saveGame();
  }

  function buyCar(car) {
    const c = State.getChar();
    if (c.money < car.price) return { ok:false, msg:`Need ${DATA.fmtMoney(car.price)}.` };
    c.money -= car.price;
    c.assets.cars.push({ name:car.name, value:Math.round(car.price*0.85) });
    State.addLog(c.age, `Bought a ${car.name}.`, 'career'); State.saveGame(); return { ok:true };
  }

  function sellCar(idx) {
    const c = State.getChar(); const car = c.assets.cars[idx];
    c.money += car.value;
    State.addLog(c.age, `Sold the ${car.name} for ${DATA.fmtMoney(car.value)}.`, 'event');
    c.assets.cars.splice(idx, 1); State.saveGame();
  }

  function invest(amount, type) {
    const c = State.getChar();
    if (c.money < amount) return { ok:false, msg:'Not enough money.' };
    c.money -= amount;
    if (type === 'stocks') {
      c.assets.investments += amount;
      State.addLog(c.age, `Invested ${DATA.fmtMoney(amount)} in stocks.`, 'career');
    } else {
      const mult = Math.random() < 0.4 ? (2 + Math.random()*8) : (Math.random()*0.6);
      const res  = Math.round(amount * mult);
      c.money += res;
      const profit = res - amount;
      const msg = profit >= 0 ? `Crypto paid off! +${DATA.fmtMoney(profit)}` : `Crypto crashed. Lost ${DATA.fmtMoney(-profit)}`;
      UI.showToast(msg, profit >= 0 ? 'good' : 'bad');
      State.addLog(c.age, msg, profit >= 0 ? 'good' : 'bad');
    }
    State.saveGame(); return { ok:true };
  }

  function casino(bet) {
    const c = State.getChar();
    if (c.money < bet) return { ok:false, msg:'Not enough money.' };
    c.money -= bet;
    const win = Math.random() < 0.45;
    const amt = win ? Math.round(bet * (1.5 + Math.random()*2)) : 0;
    if (win) c.money += amt;
    const msg = win ? `Won ${DATA.fmtMoney(amt)} at the casino!` : `Lost ${DATA.fmtMoney(bet)} at the casino.`;
    State.addLog(c.age, msg, win?'good':'bad'); State.saveGame();
    return { ok:true, win, amount: win ? amt : bet };
  }

  // ── Relationship actions ──────────────────────────────────────
  function relationshipAction(relId, action) {
    const g = State.get(); const c = g.character;
    const rel = g.relationships.find(r => r.id === relId);
    if (!rel || rel.status !== 'active') return { ok:false, msg:'Not available.' };
    let msg = '';
    switch(action) {
      case 'spend_time':
        rel.relationship = Math.min(100, rel.relationship + 10);
        State.applyEffects({ happiness:8 });
        msg = `Spent quality time with ${rel.name}.`; break;
      case 'compliment':
        rel.relationship = Math.min(100, rel.relationship + 8);
        msg = `Complimented ${rel.name}.`; break;
      case 'gift':
        if (c.money < 100) return { ok:false, msg:'Need $100 for a gift.' };
        c.money -= 100; rel.relationship = Math.min(100, rel.relationship + 15);
        msg = `Gave ${rel.name} a gift. They were touched.`; break;
      case 'argue':
        rel.relationship = Math.max(0, rel.relationship - 15);
        msg = `Had a big argument with ${rel.name}.`;
        if (rel.relationship === 0) { rel.status = 'ended'; if (rel.type==='partner') { rel.type='ex'; rel.status='broken_up'; } }
        break;
      case 'date':
        if (rel.type !== 'partner') return { ok:false, msg:'Not a partner.' };
        if (c.money < 80) return { ok:false, msg:'Need $80 for a date.' };
        c.money -= 80; rel.relationship = Math.min(100, rel.relationship + 12);
        State.applyEffects({ happiness:10 }); msg = `Had a wonderful date with ${rel.name}.`; break;
      case 'propose':
        if (rel.type !== 'partner') return { ok:false, msg:'Not a partner.' };
        if (rel.relationship < 60) return { ok:false, msg:'Relationship too low (need 60).' };
        rel.subtype = 'spouse'; rel.marriedAge = c.age;
        State.applyEffects({ happiness:25 });
        msg = `Proposed to ${rel.name} — they said yes!`;
        State.unlockAchievement('happily_ever_after'); break;
      default: return { ok:false, msg:'Unknown action.' };
    }
    State.addLog(c.age, msg, 'rel'); State.saveGame();
    return { ok:true, msg };
  }

  // ── Activity actions ──────────────────────────────────────────
  function doActivity(actId) {
    const c = State.getChar();
    const act = DATA.ACTIVITIES.find(a => a.id === actId);
    if (!act) return { ok:false, msg:'Unknown activity.' };
    if (c.age < (act.minAge||0)) return { ok:false, msg:`Must be ${act.minAge}+.` };
    if (act.casino) return { ok:true, casino:true };
    if (act.stocks) { if(c.money<500) return{ok:false,msg:'Need $500 to invest.'}; return invest(Math.min(c.money,Math.round(c.money*0.3)),'stocks'); }
    if (act.crypto) { if(c.money<200) return{ok:false,msg:'Need $200.'}; return invest(Math.min(c.money,Math.round(c.money*0.2)),'crypto'); }
    if (act.cost > 0 && c.money < act.cost) return { ok:false, msg:`Need ${DATA.fmtMoney(act.cost)}.` };
    if (act.cost > 0) c.money -= act.cost;
    const eff = { ...act.effects };
    if (act.artisticBonus && DATA.getCareer(c.career.jobId||'')?.category === 'artistic') {
      c.fame = State.clampStat((c.fame||0) + 3); eff.happiness = (eff.happiness||0) + 5;
    }
    State.applyEffects(eff);
    State.addLog(c.age, `${act.name}.`, 'activity'); State.saveGame();
    return { ok:true, msg:`${act.name} done.` };
  }

  // ── Hobby actions ─────────────────────────────────────────────
  function startHobby(hobbyId) {
    const c = State.getChar();
    const hDef = DATA.getHobby(hobbyId);
    if (!hDef) return { ok:false, msg:'Unknown hobby.' };
    if (c.age < hDef.minAge) return { ok:false, msg:`Must be ${hDef.minAge}+ to start this hobby.` };
    if (c.hobbies.find(h => h.id === hobbyId)) return { ok:false, msg:'Already doing this hobby.' };
    c.hobbies.push({ id:hobbyId, skillLevel:0, yearsPracticed:0 });
    State.addLog(c.age, `Started hobby: ${hDef.name}.`, 'activity');
    State.saveGame();
    return { ok:true, msg:`Started ${hDef.name}!` };
  }

  function practiceHobby(hobbyId) {
    const c = State.getChar();
    const hEntry = c.hobbies.find(h => h.id === hobbyId);
    if (!hEntry) return { ok:false, msg:'You do not have this hobby yet.' };
    const hDef = DATA.getHobby(hobbyId);
    if (!hDef) return { ok:false, msg:'Unknown hobby.' };
    const gain = 8 + Math.floor(Math.random() * 7); // 8–14 per session
    hEntry.skillLevel = Math.min(100, hEntry.skillLevel + gain);
    hEntry.yearsPracticed++;
    // Apply stat gains (active practice = full amount)
    const gains = hDef.statGains;
    if (gains.health)    c.health    = State.clampStat(c.health    + gains.health);
    if (gains.happiness) c.happiness = State.clampStat(c.happiness + gains.happiness);
    if (gains.smarts)    c.smarts    = State.clampStat(c.smarts    + gains.smarts);
    if (gains.looks)     c.looks     = State.clampStat(c.looks     + gains.looks);
    // Artistic career fame bonus if practicing related career
    const career = DATA.getCareer(c.career.jobId||'');
    if (career?.category === 'artistic' && hDef.careerBoost.includes(c.career.jobId||'')) {
      c.fame = State.clampStat((c.fame||0) + 2);
    }
    State.addLog(c.age, `Practiced ${hDef.name}. Skill: ${hEntry.skillLevel}.`, 'activity');
    State.saveGame();
    return { ok:true, skillLevel: hEntry.skillLevel };
  }

  // ── Extracurricular actions ───────────────────────────────────
  function joinExtracurricular(extId) {
    const c = State.getChar();
    const def = DATA.getExtracurricular(extId);
    if (!def) return { ok:false, msg:'Unknown activity.' };
    if (c.age < def.minAge || c.age > def.maxAge) return { ok:false, msg:`Available ages ${def.minAge}–${def.maxAge}.` };
    if (c.extracurriculars.find(e => e.id === extId)) return { ok:false, msg:'Already joined.' };
    c.extracurriculars.push({ id:extId, skillLevel:0, yearsParticipated:0 });
    State.addLog(c.age, `Joined ${def.name}.`, 'activity');
    State.saveGame();
    return { ok:true, msg:`Joined ${def.name}!` };
  }

  function participateExtracurricular(extId) {
    const c = State.getChar();
    const entry = c.extracurriculars.find(e => e.id === extId);
    if (!entry) return { ok:false, msg:'Not in this activity.' };
    const def = DATA.getExtracurricular(extId);
    if (!def) return { ok:false, msg:'Unknown activity.' };
    // Skill gain — bigger if matching hobby exists
    const hobbyMatch = c.hobbies.find(h => def.hobbyBoost.includes(h.id));
    const skillGain = hobbyMatch ? 12 + Math.floor(Math.random()*8) : 7 + Math.floor(Math.random()*6);
    entry.skillLevel = Math.min(100, entry.skillLevel + skillGain);
    // Full stat gains (active participation)
    const gains = def.statGains;
    if (gains.health)    c.health    = State.clampStat(c.health    + gains.health);
    if (gains.happiness) c.happiness = State.clampStat(c.happiness + gains.happiness);
    if (gains.smarts)    c.smarts    = State.clampStat(c.smarts    + gains.smarts);
    if (gains.looks)     c.looks     = State.clampStat(c.looks     + gains.looks);
    const note = hobbyMatch ? ` (hobby bonus from ${DATA.getHobby(hobbyMatch.id)?.name}!)` : '';
    State.addLog(c.age, `Participated in ${def.name}. Skill: ${entry.skillLevel}.${note}`, 'activity');
    State.saveGame();
    return { ok:true, skillLevel:entry.skillLevel, hobbyBoost:!!hobbyMatch };
  }

  // ── School socializing ────────────────────────────────────────
  function socializeAtSchool() {
    const c = State.getChar();
    if (c.age < 6 || c.age > 18) return { ok:false, msg:'Only available during school years.' };
    const fg  = Math.random() < 0.5 ? 'female' : 'male';
    const fnm = DATA.randomName(fg);
    const rel = State.addRelationship({ name:fnm.full, type:'friend', subtype:'friend', age:c.age + Math.floor(Math.random()*3)-1, relationship:55, traits:DATA.randomTraits(2), status:'active' });
    State.applyEffects({ happiness:6 });
    State.addLog(c.age, `Made a new friend at school: ${rel.name}.`, 'rel');
    State.saveGame();
    return { ok:true, msg:`Met ${rel.name}!` };
  }

  function meetRomanticInterest() {
    const c = State.getChar();
    if (c.age < 12) return { ok:false, msg:'Too young for romance.' };
    if (c.sexuality === 'asexual') return { ok:false, msg:'Romance is not really your thing.' };
    const alreadyHasPartner = State.getPartner();
    if (alreadyHasPartner) return { ok:false, msg:'Already in a relationship.' };
    const gen = DATA.getAttractedGender(c.gender, c.sexuality) || (c.gender === 'male' ? 'female' : 'male');
    const nm  = DATA.randomName(gen);
    const isTeen = c.age < 18;
    const rel = State.addRelationship({
      name:nm.full, type:'friend', subtype: isTeen ? 'crush' : 'partner',
      age:c.age + Math.floor(Math.random()*4)-2, relationship:55, traits:DATA.randomTraits(2), status:'active'
    });
    const msg = isTeen ? `Developed a crush on ${rel.name}.` : `Started seeing ${rel.name}.`;
    State.applyEffects({ happiness:10 });
    State.addLog(c.age, msg, 'rel');
    State.saveGame();
    return { ok:true, msg, name:rel.name };
  }

  return {
    createCharacter, ageUp, applyEventChoice,
    applyJob, quitJob, workHard, slackOff,
    enrollUniversity, enrollTrade,
    buyHouse, sellHouse, buyCar, sellCar, invest, casino,
    relationshipAction, doActivity,
    startHobby, practiceHobby,
    joinExtracurricular, participateExtracurricular,
    socializeAtSchool, meetRomanticInterest,
    getLifeSummary, getNetWorth, checkPromotion,
  };
})();
