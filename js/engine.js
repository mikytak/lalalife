/* ═══════════════════════════════════════════════════════════════
   ENGINE.JS — Core game logic
   Character creation · Age up · Events · Hobbies · Death
   ═══════════════════════════════════════════════════════════════ */

const Engine = (() => {

  // ── City tier assignment ──────────────────────────────────────
  function assignCityTier(wealthId) {
    const r = Math.random();
    if (wealthId === 'ultra-rich' || wealthId === 'wealthy') return r < 0.6 ? 'metropolis' : 'big_city';
    if (wealthId === 'upper-middle') return r < 0.5 ? 'big_city' : 'medium';
    if (wealthId === 'middle') return r < 0.4 ? 'big_city' : r < 0.75 ? 'medium' : 'small_town';
    return r < 0.4 ? 'medium' : 'small_town';
  }

  // ── Energy helpers ────────────────────────────────────────────
  function getEnergyMax(age) {
    if (age < 6)  return 2;
    if (age < 13) return 3;
    if (age < 18) return 4;
    if (age < 30) return 6;
    if (age < 50) return 7;
    if (age < 65) return 5;
    return 4;
  }

  function hasEnergy(amount = 1) {
    return (State.getChar().energy || 0) >= amount;
  }

  function spendEnergy(amount = 1) {
    const c = State.getChar();
    c.energy = Math.max(0, (c.energy || 0) - amount);
    State.saveGame();
  }

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

    // Apply legacy bonuses
    const legacy  = loadLegacy();
    const legBonus = getLegacyBonuses(legacy.totalPoints);

    const characterData = {
      firstName: childFirst,
      lastName: nameData.childSurname,
      gender: resolvedGender,
      age: 0,
      birthYear: new Date().getFullYear(),
      country: resolvedCountry.name,
      countryFlag: resolvedCountry.flag,
      wealthClass: wealth.id,
      health:    State.clampStat(health    + (legBonus.health    || 0)),
      happiness: State.clampStat(happiness + (legBonus.happiness || 0)),
      smarts:    State.clampStat(smarts    + (legBonus.smarts    || 0)),
      looks:     State.clampStat(looks     + (legBonus.looks     || 0)),
      fame: 0,
      money: Math.round(wealth.startMoney * (0.8 + Math.random() * 0.4) * resolvedCountry.wealthMod) + (legBonus.money || 0),
      education: { level:'none', major:null, institution:null, gpa:2.5, studentLoan:0, certificates:[], inSchool:false, schoolType:null, schoolYear:0, schoolDuration:0, pendingCert:null },
      career: { jobId:null, title:null, salary:0, yearsAtJob:0, promotionLevel:0, performance:70, retired:false },
      assets: { houses:[], cars:[], investments:0 },
      hobbies: [],
      extracurriculars: [],
      items: [],
      energy: getEnergyMax(0),
      energyMax: getEnergyMax(0),
      mentalHealth: 80,
      pet: null,
      travelStamps: [],
      mood: null,
      reputation: 50,
      conditions: [],
      socialCircle: [],
      bucketList: [],
      cityTier: assignCityTier(wealth.id),
      style: 'casual',
      tattoos: 0,
      bank: { savings: 0, apy: 0.035 },
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

    // Refill energy each birthday
    c.energyMax = getEnergyMax(c.age);
    c.energy = c.energyMax;

    applyStatDrift(c);
    applyMentalHealthDrift(c, g);
    applyMoodDrift(c);
    applyPassiveEffects(c, g);
    applySubscriptionPassive(c);
    processConditions(c);
    processAddictions(c);
    updateEducation(c, g);
    updateCareerPerformance(c);
    applyHobbyPassiveGains(c);
    applyExtracurricularPassiveGains(c);
    processPetAging(c, g);
    checkParentHealth(c, g);
    checkBucketList(g);
    checkAnniversary(c, g);
    checkMidlifeCrisis(c);
    checkLifeGoal(c, g);
    checkFameEvents(c, g);
    processStartup(c);
    processJail(c);
    applyTherapyPassive(c);
    checkStockMarket(c);
    checkExReturns(c, g);
    checkFriendEnemy(g);
    processMilitary(c);
    c.negotiatedThisYear = false; // reset each year

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
      // Income tax
      const sal = c.career.salary;
      const taxRate = sal > 160000 ? 0.37 : sal > 80000 ? 0.30 : sal > 40000 ? 0.22 : 0.10;
      const tax = Math.round(sal * taxRate);
      c.money -= tax;
      if (!c.taxesPaid) c.taxesPaid = 0;
      c.taxesPaid += tax;
      c.career.yearsAtJob++;
    }
    // Personal loan interest & repayment
    if (c.personalLoan > 0) {
      const interest = Math.round(c.personalLoan * 0.09);
      const pay = Math.min(c.personalLoan + interest, Math.round((c.personalLoan + interest) * 0.15) + 500);
      c.money -= pay;
      c.personalLoan = Math.max(0, c.personalLoan + interest - pay);
    }
    // Gym membership passive health
    if (c.gymMembership) {
      if (c.money >= 600) { c.money -= 600; c.health = State.clampStat(c.health + 2); }
      else c.gymMembership = false;
    }
    // Personal trainer passive health
    if (c.personalTrainer) {
      if (c.money >= 2000) { c.money -= 2000; c.health = State.clampStat(c.health + 5); }
      else c.personalTrainer = false;
    }
    // Insurance premiums
    if (c.insurance?.health && c.money >= 500)  c.money -= 500;
    else if (c.insurance?.health) c.insurance.health = false;
    if (c.insurance?.home && c.assets.houses.length > 0 && c.money >= 400)  c.money -= 400;
    else if (c.insurance?.home) c.insurance.home = false;
    if (c.insurance?.car && c.assets.cars.length > 0 && c.money >= 300)  c.money -= 300;
    else if (c.insurance?.car) c.insurance.car = false;
    // Social media passive income (fame 30+ = micro-influencer)
    if ((c.fame||0) >= 30 && c.socialMediaActive) {
      const income = Math.round(((c.fame||0) - 28) * 80 * (1 + Math.random()*0.4));
      c.money += income;
    }
    // Rental income from extra properties
    c.assets.houses.forEach(h => {
      if (h.isRental) {
        const rent = Math.round(h.value * (0.05 + Math.random() * 0.03));
        c.money += rent;
      }
    });
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
    // Bank savings interest
    if (c.bank?.savings > 0) {
      const interest = Math.round(c.bank.savings * (c.bank.apy || 0.035));
      c.bank.savings += interest;
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
      c.career.salary = Math.round(career.salary.base * next.salaryMult * (1 + (hobbyBonus + extraBonus) * 0.1));
      State.addLog(c.age, `Promoted to ${next.title} — now earning ${DATA.fmtMoney(c.career.salary)}/yr!`, 'career');
      UI.showToast(`🎉 Promoted to ${next.title}! Now earning ${DATA.fmtMoney(c.career.salary)}/yr`, 'good');
      UI.updateDisplay();
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
    if (c.militaryVeteran) highlights.push('Served in the military');
    if (c.wroteMemoir) highlights.push('Published a memoir');
    if (c.will) highlights.push(`Left a will: ${c.will.label}`);
    const cause = g.deathCause || 'Unknown';
    const ribbon = getDeathRibbon(c, g, cause);
    return {
      name: `${c.firstName} ${c.lastName}`,
      age: g.deathAge || c.age,
      cause,
      highlights,
      netWorth: nw,
      achievements: g.achievements.map(id=>DATA.ACHIEVEMENTS.find(a=>a.id===id)).filter(Boolean),
      cheatsUsed: g.cheatsUsed,
      finalStats: { health:c.health, happiness:c.happiness, smarts:c.smarts, looks:c.looks },
      birthYear: c.birthYear,
      country: c.country,
      ribbon,
    };
  }

  function getNetWorth(c) {
    let w = c.money + c.assets.investments;
    c.assets.houses.forEach(h => w += (h.equity || h.value));
    c.assets.cars.forEach(car => w += car.value);
    w -= (c.education.studentLoan || 0);
    // Include spouse's finances
    const g = State.get();
    const spouse = g.relationships.find(r => r.subtype === 'spouse' && r.status === 'active');
    if (spouse) {
      w += (spouse.money || 0);
      w += (spouse.investments || 0);
      (spouse.houses || []).forEach(h => w += (h.equity || h.value || 0));
      (spouse.cars || []).forEach(car => w += (car.value || 0));
    }
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
        if (p) { p.subtype = 'spouse'; p.marriedAge = c.age; _assignSpouseWealth(p, c); State.addLog(c.age, `Married ${p.name}!`, 'rel'); UI.showToast(`Married ${p.name}!`, 'good'); }
      }
      if (choice.breakUp) {
        const p = State.getPartner();
        if (p) { p.status = 'broken_up'; p.type = 'ex'; State.addLog(c.age, `Broke up with ${p.name}.`, 'rel'); }
      }
      if (choice.divorce) {
        const p = State.getPartner();
        if (p) { _applyDivorceSettlement(c, p); p.status = 'divorced'; p.type = 'ex'; State.addLog(c.age, `Divorced ${p.name}.`, 'bad'); }
      }
      if (choice.marry) { triggerMood('in_love', 4); }
      if (choice.breakUp || choice.divorce) { triggerMood('heartbroken', 3); }
      if (choice.retire) { triggerMood('content', 3); }
      if (choice.addPartner) { triggerMood('in_love', 3); }
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
      if (event.fireSelf) { quitJob(true); triggerMood('anxious', 2); }
      // Market crash — tank investments
      if (event.sellInvestments) { const lost = Math.round(c.assets.investments * 0.6); c.assets.investments -= lost; State.addLog(c.age, `Sold investments at a loss: -${DATA.fmtMoney(lost)}.`, 'bad'); }
      if (event.buyDip) { c.assets.investments += 5000; }
      // Condition events
      if (event.id === 'diagnosed_anxiety' && !c.conditions.includes('anxiety')) c.conditions.push('anxiety');
      if (event.id === 'back_injury' && !c.conditions.includes('back_pain')) c.conditions.push('back_pain');
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
    // If previously fired from this job, re-hire at same promotion level (one step down as penalty)
    const firedLevel = (c.firedHistory || {})[careerId];
    const startLevel = firedLevel !== undefined ? Math.max(0, firedLevel - 1) : 0;
    const promo = career.promotions[startLevel];
    const hobbyBonus = DATA.getHobbyCareerBonus(c.hobbies, careerId);
    const extraBonus2 = DATA.getExtracurricularCareerBonus(c.extracurriculars, careerId);
    c.career.title = promo.title;
    c.career.salary = Math.round(career.salary.base * promo.salaryMult * (1 + (hobbyBonus + extraBonus2) * 0.1));
    c.career.yearsAtJob = 0; c.career.promotionLevel = startLevel; c.career.performance = 70 + Math.round(hobbyBonus * 15); c.career.retired = false;
    if (firedLevel !== undefined) delete c.firedHistory[careerId];
    if (!g.jobHistory.includes(careerId)) g.jobHistory.push(careerId);
    const rehireNote = startLevel > 0 ? ` (rehired at ${promo.title})` : '';
    State.addLog(c.age, `Started career: ${career.name} — ${promo.title}`, 'career');
    State.saveGame();
    return { ok:true, msg:`You are now a ${promo.title}!${rehireNote}` };
  }

  function quitJob(fired = false) {
    const c = State.getChar();
    if (!c.career.jobId) return;
    const career = DATA.getCareer(c.career.jobId);
    State.addLog(c.age, fired ? `Fired from ${career?.name||'job'}.` : `Left ${career?.name||'job'}.`, fired?'bad':'event');
    if (fired) {
      // Remember the promotion level so player can re-apply at same tier
      c.firedHistory = c.firedHistory || {};
      c.firedHistory[c.career.jobId] = c.career.promotionLevel;
    }
    c.career.jobId=null; c.career.title=null; c.career.salary=0; c.career.yearsAtJob=0; c.career.promotionLevel=0;
    State.saveGame();
  }

  function workHard() {
    const c = State.getChar();
    if (!c.career.jobId) return { ok:false, msg:'No job!' };
    if (!hasEnergy()) return { ok:false, msg:'No energy to work hard. Age up to rest.' };
    spendEnergy();
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

  // ── Spouse wealth generation (called once on marriage) ───────
  function _assignSpouseWealth(spouse, char) {
    if (spouse.money !== undefined) return; // already assigned
    const wealthTiers = { impoverished:[500,5000], lower_class:[5000,30000], middle_class:[20000,120000], upper_class:[80000,500000], wealthy:[300000,2000000] };
    const tier = char.wealthClass || 'middle_class';
    const [lo, hi] = wealthTiers[tier] || wealthTiers.middle_class;
    spouse.money = Math.round(lo + Math.random() * (hi - lo));
    spouse.investments = Math.random() > 0.5 ? Math.round(spouse.money * (Math.random() * 0.4)) : 0;
    spouse.houses = Math.random() > 0.7 ? [{ name:'Partner\'s Home', value: Math.round(100000 + Math.random()*200000), equity: Math.round(20000 + Math.random()*80000) }] : [];
    spouse.cars = Math.random() > 0.4 ? [{ name:'Partner\'s Car', value: Math.round(5000 + Math.random()*25000) }] : [];
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
    if ((c.education.gpa || 2.5) < 2.0) return { ok:false, msg:'GPA too low for university (need 2.0+). Study hard first.' };
    // Scholarship: 4.0 GPA = fully funded; 3.5+ = 50% off
    const gpa = c.education.gpa || 2.5;
    if (gpa >= 4.0) {
      baseCost = 0;
      State.addLog(c.age, 'Perfect GPA — full scholarship awarded!', 'edu');
      UI.showToast('4.0 GPA — full scholarship! Tuition free.', 'good');
    } else if (gpa >= 3.5) {
      baseCost = Math.round(baseCost * 0.5);
    }
    // Apply any scholarship funds earned via requestScholarship()
    // Apply GI Bill if available
    if (c.giBill > 0) { c.scholarshipFunds = (c.scholarshipFunds||0) + c.giBill; c.giBill = 0; }
    const schFunds = Math.min(c.scholarshipFunds || 0, baseCost);
    if (schFunds > 0) { baseCost -= schFunds; c.scholarshipFunds = (c.scholarshipFunds || 0) - schFunds; }
    const institutions = ['State University','City College','Northern University','Westbrook College','Pacific University'];
    c.education.inSchool = true; c.education.schoolType = 'university';
    c.education.schoolYear = 0; c.education.schoolDuration = duration;
    c.education.major = major; c.education.institution = DATA.randomFrom(institutions);
    c.education.studentLoan += loanAmount;
    c.money -= Math.max(0, baseCost - loanAmount);
    const schNote = schFunds > 0 ? ` (${DATA.fmtMoney(schFunds)} scholarship applied)` : '';
    State.addLog(c.age, `Enrolled at ${c.education.institution} to study ${major} (${duration} yrs)${schNote}`, 'edu');
    State.saveGame();
    return { ok:true, msg:`Enrolled! ${duration} years to graduation.${schNote}` };
  }

  function requestScholarship() {
    const c = State.getChar();
    if (c.education.inSchool) return { ok:false, msg:'Already enrolled in school.' };
    if (c.age < 17) return { ok:false, msg:'Must be at least 17.' };
    if (c.education.level === 'doctorate') return { ok:false, msg:'Already have the highest degree.' };
    if (c.scholarshipAppliedAge === c.age) return { ok:false, msg:'Already applied for a scholarship this year.' };
    const gpa = c.education.gpa || 2.5;
    const smarts = c.smarts || 50;
    // Chance: 10% base + GPA contribution + smarts contribution
    const chance = Math.min(0.95, 0.10 + Math.max(0, gpa - 2.0) * 0.15 + smarts * 0.003);
    c.scholarshipAppliedAge = c.age;
    if (Math.random() < chance) {
      const lvl = c.education.level;
      const amounts = { none: 25000, some_college: 20000, bachelor: 18000, master: 25000 };
      const award = amounts[lvl] || 20000;
      c.scholarshipFunds = (c.scholarshipFunds || 0) + award;
      State.addLog(c.age, `Scholarship awarded! ${DATA.fmtMoney(award)} toward education.`, 'edu');
      State.saveGame();
      return { ok:true, msg:`Scholarship awarded! ${DATA.fmtMoney(award)} will be applied when you enroll.` };
    } else {
      State.addLog(c.age, 'Applied for a scholarship — not selected this time.', 'edu');
      State.saveGame();
      return { ok:false, msg:`Scholarship application denied. GPA ${gpa.toFixed(2)} — study harder to improve your odds.` };
    }
  }

  function askParentsForMoney() {
    const g = State.get(); const c = g.character;
    if (c.age > 30) return { ok:false, msg:'Your parents expect you to be independent by now.' };
    if (c.askedParentsAge === c.age) return { ok:false, msg:'Already asked parents for money this year.' };
    const parents = g.relationships.filter(r => (r.subtype === 'father' || r.subtype === 'mother') && r.status === 'active');
    if (!parents.length) return { ok:false, msg:'No living parents to ask.' };
    c.askedParentsAge = c.age;
    const avgRel = parents.reduce((s, p) => s + p.relationship, 0) / parents.length;
    const wealthMod = { impoverished:0.2, lower_class:0.5, middle_class:1.0, upper_class:2.0, wealthy:5.0 }[c.wealthClass] || 1.0;
    const chance = Math.min(0.9, 0.3 + (avgRel - 50) * 0.01);
    if (Math.random() < chance) {
      const base = Math.round((500 + Math.random() * 4500) * wealthMod);
      const amount = Math.max(100, base);
      c.money += amount;
      parents.forEach(p => { p.relationship = Math.max(0, p.relationship - 5); });
      State.addLog(c.age, `Parents gave you ${DATA.fmtMoney(amount)}.`, 'good');
      State.saveGame();
      return { ok:true, msg:`Your parents came through! Received ${DATA.fmtMoney(amount)}.` };
    } else {
      parents.forEach(p => { p.relationship = Math.max(0, p.relationship - 3); });
      State.addLog(c.age, 'Asked parents for money — they said no.', 'event');
      State.saveGame();
      return { ok:false, msg:'Parents said no. Maybe try improving your relationship first.' };
    }
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
    // Gambling addiction tracking
    c.casinoVisits = (c.casinoVisits || 0) + 1;
    if (c.casinoVisits >= 4 && !(c.addictions||[]).find(a=>a.id==='gambling')) {
      const addictChance = 0.08 * (c.casinoVisits - 3);
      if (Math.random() < addictChance) {
        c.addictions = c.addictions || [];
        c.addictions.push({ id:'gambling', label:'Gambling Addiction', severity:1 });
        State.addLog(c.age, 'Developed a gambling addiction.', 'bad');
        UI.showToast('Gambling addiction developed. The casino calls you back...', 'bad');
      }
    }
    State.addLog(c.age, msg, win?'good':'bad'); State.saveGame();
    return { ok:true, win, amount: win ? amt : bet };
  }

  // ── Relationship actions ──────────────────────────────────────
  function relationshipAction(relId, action) {
    const g = State.get(); const c = g.character;
    const rel = g.relationships.find(r => r.id === relId);
    if (!rel || rel.status !== 'active') return { ok:false, msg:'Not available.' };
    // Energy check for social actions
    const energyFreeActions = ['argue', 'compliment'];
    if (!energyFreeActions.includes(action) && !hasEnergy()) {
      return { ok:false, msg:'No energy left. Age up to rest.' };
    }
    let msg = '';
    switch(action) {
      case 'spend_time':
        rel.relationship = Math.min(100, rel.relationship + 10);
        State.applyEffects({ happiness:8 });
        spendEnergy();
        msg = `Spent quality time with ${rel.name}.`; break;
      case 'compliment':
        rel.relationship = Math.min(100, rel.relationship + 8);
        msg = `Complimented ${rel.name}.`; break;
      case 'gift':
        if (c.money < 100) return { ok:false, msg:'Need $100 for a gift.' };
        c.money -= 100; rel.relationship = Math.min(100, rel.relationship + 15);
        spendEnergy();
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
        State.applyEffects({ happiness:10 }); spendEnergy();
        msg = `Had a wonderful date with ${rel.name}.`; break;
      case 'weekend_getaway':
        if (rel.type !== 'partner') return { ok:false, msg:'Not a partner.' };
        if (c.money < 400) return { ok:false, msg:'Need $400 for a getaway.' };
        c.money -= 400; rel.relationship = Math.min(100, rel.relationship + 22);
        State.applyEffects({ happiness:18 }); spendEnergy();
        msg = `Had a magical weekend getaway with ${rel.name}.`; break;
      case 'love_letter':
        if (rel.type !== 'partner' && rel.subtype !== 'crush') return { ok:false, msg:'Only for romantic interests.' };
        rel.relationship = Math.min(100, rel.relationship + 14);
        State.applyEffects({ happiness:8 }); spendEnergy();
        msg = `Wrote a heartfelt love letter to ${rel.name}.`; break;
      case 'cook_dinner':
        if (rel.type !== 'partner') return { ok:false, msg:'Not a partner.' };
        if (c.money < 60) return { ok:false, msg:'Need $60 for ingredients.' };
        c.money -= 60; rel.relationship = Math.min(100, rel.relationship + 16);
        State.applyEffects({ happiness:12 }); spendEnergy();
        msg = `Cooked a special dinner for ${rel.name}. They loved it.`; break;
      case 'serenade':
        if (rel.type !== 'partner' && rel.subtype !== 'crush') return { ok:false, msg:'Only for romantic interests.' };
        const hasMusicHobby = c.hobbies.find(h => h.id === 'music');
        const serenadeBoost = hasMusicHobby ? 20 : 10;
        rel.relationship = Math.min(100, rel.relationship + serenadeBoost);
        State.applyEffects({ happiness:10 + (hasMusicHobby ? 5 : 0) }); spendEnergy();
        msg = hasMusicHobby ? `Serenaded ${rel.name} beautifully — music skill shone through!` : `Serenaded ${rel.name}. Charming effort!`; break;
      case 'propose':
        if (rel.type !== 'partner') return { ok:false, msg:'Not a partner.' };
        if (rel.relationship < 60) return { ok:false, msg:'Relationship too low (need 60).' };
        if (c.age < 18) return { ok:false, msg:'Must be 18 to propose.' };
        rel.subtype = 'spouse'; rel.marriedAge = c.age;
        _assignSpouseWealth(rel, c);
        State.applyEffects({ happiness:25 });
        msg = `Proposed to ${rel.name} — they said yes!`;
        State.unlockAchievement('happily_ever_after'); break;
      case 'plan_wedding':
        return { ok:true, showWeddingPlanner:true, rel }; // handled by UI
      default: return { ok:false, msg:'Unknown action.' };
    }
    State.addLog(c.age, msg, 'rel'); State.saveGame();
    return { ok:true, msg };
  }

  function planWedding(relId, venue) {
    const VENUES = {
      city_hall:    { name:'City Hall',     cost:500,    happiness:15 },
      garden:       { name:'Garden Party',  cost:5000,   happiness:25 },
      beach:        { name:'Beach Wedding', cost:8000,   happiness:30 },
      luxury_hotel: { name:'Luxury Hotel',  cost:20000,  happiness:40 },
    };
    const g = State.get(); const c = g.character;
    const v = VENUES[venue];
    if (!v) return { ok:false, msg:'Unknown venue.' };
    if (c.money < v.cost) return { ok:false, msg:`Need ${DATA.fmtMoney(v.cost)} for this venue.` };
    c.money -= v.cost;
    const rel = g.relationships.find(r => r.id === relId);
    const name = rel ? rel.name : 'your partner';
    if (rel) rel.marriedWedding = true; // prevent re-doing
    State.applyEffects({ happiness:v.happiness });
    State.addLog(c.age, `Wedding at ${v.name} with ${name}. Beautiful day.`, 'rel');
    State.saveGame();
    return { ok:true, msg:`Married at ${v.name}!` };
  }

  // ── Ask a friend out ──────────────────────────────────────────
  function askFriendOut(relId) {
    const g = State.get(); const c = g.character;
    const rel = g.relationships.find(r => r.id === relId);
    if (!rel || rel.status !== 'active') return { ok:false, msg:'Not available.' };
    if (rel.type !== 'friend') return { ok:false, msg:'Only for friends.' };
    if (c.age < 12) return { ok:false, msg:'Too young for romance.' };
    if (c.sexuality === 'asexual') return { ok:false, msg:'Romance is not really your thing.' };
    if (!hasEnergy()) return { ok:false, msg:'No energy left. Age up to rest.' };
    // Success chance based on relationship level
    const chance = rel.relationship / 100 * 0.7 + 0.1;
    const success = Math.random() < chance;
    spendEnergy();
    if (success) {
      rel.type = 'partner'; rel.subtype = 'partner';
      State.applyEffects({ happiness:18 });
      State.addLog(c.age, `Asked ${rel.name} out — they said yes!`, 'rel');
      State.saveGame();
      return { ok:true, msg:`${rel.name} said yes! You are now together.` };
    } else {
      rel.relationship = Math.max(0, rel.relationship - 10);
      State.applyEffects({ happiness:-8 });
      State.addLog(c.age, `Asked ${rel.name} out — they said no. Awkward.`, 'rel');
      State.saveGame();
      return { ok:true, msg:`${rel.name} said no. Things are a bit awkward now.`, rejected:true };
    }
  }

  // ── Plan a child (explicit choice) ───────────────────────────
  function planChild(name, gender) {
    const g = State.get(); const c = g.character;
    const partner = State.getPartner();
    if (!partner) return { ok:false, msg:'Need a partner.' };
    if (c.age < 18 || c.age > 50) return { ok:false, msg:'Not the right time.' };
    if (!hasEnergy()) return { ok:false, msg:'No energy left. Age up to rest.' };
    const resolvedGender = (gender === 'random' || !gender) ? (Math.random() < 0.5 ? 'female' : 'male') : gender;
    const autoName = resolvedGender === 'female'
      ? DATA.randomFrom(DATA.FEMALE_NAMES)
      : DATA.randomFrom(DATA.MALE_NAMES);
    const childName = (name && name.trim()) ? name.trim() : autoName;
    const fullName  = `${childName} ${c.lastName}`;
    const rel = State.addRelationship({ name:fullName, type:'family', subtype:'child', age:0, relationship:80, traits:DATA.randomTraits(2), status:'active' });
    State.applyEffects({ happiness:20, money:-5000 });
    spendEnergy();
    State.addLog(c.age, `${rel.name} was born! Welcome to the world.`, 'rel');
    State.unlockAchievement('parent');
    State.saveGame();
    return { ok:true, msg:`${rel.name} is born!`, name:rel.name };
  }

  // ── Items ─────────────────────────────────────────────────────
  function buyItem(itemId) {
    const c = State.getChar();
    const item = DATA.getItem(itemId);
    if (!item) return { ok:false, msg:'Unknown item.' };
    if (!item.consumable && c.items.includes(itemId)) return { ok:false, msg:'You already own this.' };
    if (c.money < item.cost) return { ok:false, msg:`Need ${DATA.fmtMoney(item.cost)}.` };
    c.money -= item.cost;
    // Consumable: apply stat boosts immediately, don't keep in inventory
    if (item.consumable) {
      if (item.statBoost) State.applyEffects(item.statBoost);
      State.addLog(c.age, `Read/used ${item.name}.${Object.keys(item.statBoost||{}).length ? ' Gained stats!' : ''}`, 'activity');
    } else {
      c.items.push(itemId);
      if (item.statBoost && Object.keys(item.statBoost).length) State.applyEffects(item.statBoost);
      State.addLog(c.age, `Bought ${item.name}.${item.hobbyBoost ? ` Boosts ${DATA.getHobby(item.hobbyBoost)?.name} practice.` : ''}`, 'activity');
    }
    State.saveGame();
    return { ok:true, msg: item.consumable ? `Used ${item.name}!` : `Bought ${item.name}!` };
  }

  // ── Study actions (Education modal) ──────────────────────────
  function studyHard() {
    const c = State.getChar();
    if (c.age < 6 || c.age > 25) return { ok:false, msg:'Not in school.' };
    if (!hasEnergy()) return { ok:false, msg:'No energy left. Age up to rest.' };
    const smartsGain = 5 + Math.floor(Math.random() * 5);
    State.applyEffects({ smarts:smartsGain, happiness:-3, health:-2 });
    c.education.gpa = Math.min(4.0, +(((c.education.gpa || 2.5) + 0.15).toFixed(2)));
    spendEnergy();
    State.addLog(c.age, `Studied hard. Smarts +${smartsGain}. GPA ${c.education.gpa.toFixed(2)}.`, 'edu');
    State.saveGame();
    return { ok:true, msg:`Studied hard. +${smartsGain} Smarts. GPA now ${c.education.gpa.toFixed(2)}.` };
  }

  function skipClass() {
    const c = State.getChar();
    if (c.age < 6 || c.age > 18) return { ok:false, msg:'Only during school years.' };
    // No energy cost — you are doing nothing!
    const caught = Math.random() < 0.3;
    if (caught) {
      State.applyEffects({ happiness:-8, smarts:-3 });
      c.education.gpa = Math.max(0, +(((c.education.gpa || 2.5) - 0.3).toFixed(2)));
      State.addLog(c.age, `Skipped class and got caught. Detention. GPA ${c.education.gpa.toFixed(2)}.`, 'bad');
      State.saveGame();
      return { ok:true, msg:`Got caught! Detention. GPA dropped to ${c.education.gpa.toFixed(2)}.`, caught:true };
    }
    State.applyEffects({ happiness:10, smarts:-3 });
    c.education.gpa = Math.max(0, +(((c.education.gpa || 2.5) - 0.15).toFixed(2)));
    State.addLog(c.age, `Skipped class. Freedom! GPA ${c.education.gpa.toFixed(2)}.`, 'activity');
    State.saveGame();
    return { ok:true, msg:'Got away with it! Happiness up but smarts took a hit.' };
  }

  function kissUpTeacher() {
    const c = State.getChar();
    if (c.age < 6 || c.age > 18) return { ok:false, msg:'Only during school years.' };
    if (!hasEnergy()) return { ok:false, msg:'No energy left. Age up to rest.' };
    const roll = Math.random();
    spendEnergy();
    if (roll < 0.5) {
      State.applyEffects({ smarts:4, happiness:3 });
      State.addLog(c.age, 'Made a good impression on the teacher. Grade boosted.', 'edu');
      State.saveGame();
      return { ok:true, msg:'Teacher liked you! Smarts and happiness up.' };
    } else {
      State.applyEffects({ happiness:-5 });
      State.addLog(c.age, 'Tried to impress the teacher. Classmates were not impressed.', 'event');
      State.saveGame();
      return { ok:true, msg:'Classmates side-eye you for being a teacher\'s pet. Happiness down a little.', embarrassing:true };
    }
  }

  function flirtWithClassmate() {
    const c = State.getChar();
    if (c.age < 12 || c.age > 18) return { ok:false, msg:'Only during school teen years.' };
    if (c.sexuality === 'asexual') return { ok:false, msg:'Not really your thing.' };
    if (!hasEnergy()) return { ok:false, msg:'No energy left. Age up to rest.' };
    const gen = DATA.getAttractedGender(c.gender, c.sexuality) || (c.gender === 'male' ? 'female' : 'male');
    const nm  = DATA.randomName(gen);
    const roll = Math.random();
    spendEnergy();
    if (roll < 0.55) {
      const rel = State.addRelationship({ name:nm.full, type:'friend', subtype:'crush', age:c.age, relationship:60, traits:DATA.randomTraits(2), status:'active' });
      State.applyEffects({ happiness:12 });
      State.addLog(c.age, `Flirted with ${rel.name} in class. Sparks!`, 'rel');
      State.saveGame();
      return { ok:true, msg:`${rel.name} seems interested! New crush added.` };
    } else {
      State.applyEffects({ happiness:-5 });
      State.addLog(c.age, 'Tried flirting in class. Crashed and burned.', 'event');
      State.saveGame();
      return { ok:true, msg:'Did not go well. Happiness down a bit.', rejected:true };
    }
  }

  function cramAllNight() {
    const c = State.getChar();
    if (c.age < 18 || !c.education.inSchool) return { ok:false, msg:'Only while at university.' };
    if (!hasEnergy()) return { ok:false, msg:'No energy left. Age up to rest.' };
    const gain = 10 + Math.floor(Math.random() * 8);
    State.applyEffects({ smarts:gain, health:-8, happiness:-5 });
    spendEnergy();
    State.addLog(c.age, `Crammed all night. Smarts +${gain} but exhausted.`, 'edu');
    State.saveGame();
    return { ok:true, msg:`+${gain} Smarts! But your health and mood took a hit.` };
  }

  function seduceProfessor() {
    const c = State.getChar();
    if (c.age < 18 || !c.education.inSchool) return { ok:false, msg:'Only at university.' };
    if (!hasEnergy()) return { ok:false, msg:'No energy left. Age up to rest.' };
    const roll = Math.random();
    spendEnergy();
    if (roll < 0.2) {
      // Big success — inappropriate but game
      State.applyEffects({ smarts:5, happiness:10 });
      State.addLog(c.age, 'The professor was... receptive. Grade improved significantly.', 'event');
      State.saveGame();
      return { ok:true, msg:'It worked. Questionably, but it worked. Grade boosted!' };
    } else if (roll < 0.6) {
      State.applyEffects({ happiness:-10, smarts:-5 });
      State.addLog(c.age, 'Professor rejected the advance and reported it. Scandalous.', 'bad');
      State.saveGame();
      return { ok:true, msg:'Complete disaster. Reported to the dean. Happiness and smarts way down.', scandal:true };
    } else {
      State.applyEffects({ happiness:-5 });
      State.addLog(c.age, 'Tried to charm the professor. They pretended not to notice.', 'event');
      State.saveGame();
      return { ok:true, msg:'They pretended it did not happen. Awkward.' };
    }
  }

  function cheatOnExam() {
    const c = State.getChar();
    if (c.age < 6 || !c.education.inSchool) return { ok:false, msg:'Only while enrolled in school.' };
    const roll = Math.random();
    if (roll < 0.35) {
      // Caught
      State.applyEffects({ smarts:-10, happiness:-15 });
      if (Math.random() < 0.4) c.education.inSchool = false; // expelled
      State.addLog(c.age, 'Caught cheating on an exam. Serious consequences.', 'bad');
      State.saveGame();
      return { ok:true, msg:'Caught cheating! Suspension or worse. Big smarts and happiness hit.', caught:true };
    }
    State.applyEffects({ smarts:8, happiness:5 });
    State.addLog(c.age, 'Cheated on the exam. Got away with it.', 'event');
    State.saveGame();
    return { ok:true, msg:'Got away with it. For now.' };
  }

  // ── Activity actions ──────────────────────────────────────────
  function doActivity(actId) {
    const c = State.getChar();
    const act = DATA.ACTIVITIES.find(a => a.id === actId);
    if (!act) return { ok:false, msg:'Unknown activity.' };
    if (c.age < (act.minAge||0)) return { ok:false, msg:`Must be ${act.minAge}+.` };
    if (!hasEnergy()) return { ok:false, msg:'No energy left. Age up to rest and recharge.' };
    if (act.casino) return { ok:true, casino:true };
    if (act.stocks) { if(c.money<500) return{ok:false,msg:'Need $500 to invest.'}; return invest(Math.min(c.money,Math.round(c.money*0.3)),'stocks'); }
    if (act.crypto) { if(c.money<200) return{ok:false,msg:'Need $200.'}; return invest(Math.min(c.money,Math.round(c.money*0.2)),'crypto'); }
    if (act.cost > 0 && c.money < act.cost) return { ok:false, msg:`Need ${DATA.fmtMoney(act.cost)}.` };
    if (act.cost > 0) c.money -= act.cost;
    spendEnergy();
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
    if (!hasEnergy()) return { ok:false, msg:'No energy left. Age up to rest.' };
    c.hobbies.push({ id:hobbyId, skillLevel:0, yearsPracticed:0 });
    spendEnergy();
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
    if (!hasEnergy()) return { ok:false, msg:'No energy left. Age up to rest.' };
    // Item boost: owning the matching item gives +40% skill gain
    const matchItem = DATA.ITEMS.find(it => it.hobbyBoost === hobbyId && c.items.includes(it.id));
    const baseGain  = 8 + Math.floor(Math.random() * 7);
    const gain      = matchItem ? Math.round(baseGain * 1.4) : baseGain;
    hEntry.skillLevel = Math.min(100, hEntry.skillLevel + gain);
    spendEnergy();
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
    const itemNote = matchItem ? ` (${DATA.getItem(matchItem.id)?.name} boost!)` : '';
    State.addLog(c.age, `Practiced ${hDef.name}. Skill: ${hEntry.skillLevel}.${itemNote}`, 'activity');
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
    if (!hasEnergy()) return { ok:false, msg:'No energy left. Age up to rest.' };
    c.extracurriculars.push({ id:extId, skillLevel:0, yearsParticipated:0 });
    spendEnergy();
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
    if (!hasEnergy()) return { ok:false, msg:'No energy left. Age up to rest.' };
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
    spendEnergy();
    State.saveGame();
    return { ok:true, skillLevel:entry.skillLevel, hobbyBoost:!!hobbyMatch };
  }

  // ── School socializing ────────────────────────────────────────
  function socializeAtSchool() {
    const c = State.getChar();
    if (c.age < 6 || c.age > 18) return { ok:false, msg:'Only available during school years.' };
    if (!hasEnergy()) return { ok:false, msg:'No energy left. Age up to rest.' };
    const fg  = Math.random() < 0.5 ? 'female' : 'male';
    const fnm = DATA.randomName(fg);
    const rel = State.addRelationship({ name:fnm.full, type:'friend', subtype:'friend', age:c.age + Math.floor(Math.random()*3)-1, relationship:55, traits:DATA.randomTraits(2), status:'active' });
    State.applyEffects({ happiness:6 });
    spendEnergy();
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
    if (!hasEnergy()) return { ok:false, msg:'No energy left. Age up to rest.' };
    const gen = DATA.getAttractedGender(c.gender, c.sexuality) || (c.gender === 'male' ? 'female' : 'male');
    const nm  = DATA.randomName(gen);
    const isTeen = c.age < 18;
    const rel = State.addRelationship({
      name:nm.full, type:'friend', subtype: isTeen ? 'crush' : 'partner',
      age:c.age + Math.floor(Math.random()*4)-2, relationship:55, traits:DATA.randomTraits(2), status:'active'
    });
    const msg = isTeen ? `Developed a crush on ${rel.name}.` : `Started seeing ${rel.name}.`;
    State.applyEffects({ happiness:10 });
    spendEnergy();
    State.addLog(c.age, msg, 'rel');
    State.saveGame();
    return { ok:true, msg, name:rel.name };
  }

  // ── Mental health drift ───────────────────────────────────────
  function applyMentalHealthDrift(c, g) {
    let drift = (75 - (c.mentalHealth ?? 80)) * 0.04; // pulls toward 75
    // Positive: active relationships, high happiness
    if (c.happiness > 70) drift += 1;
    if (g.relationships.filter(r => r.type==='friend'&&r.status==='active').length > 2) drift += 0.5;
    if (c.hobbies.length > 0) drift += 0.5;
    if (c.pet?.alive) drift += 1;
    // Negative: isolation, low happiness, old age stress
    if (c.happiness < 30) drift -= 3;
    if (c.age > 60 && c.health < 40) drift -= 1;
    // Career burnout
    if (c.career.jobId && c.career.performance < 30) drift -= 1;
    c.mentalHealth = State.clampStat((c.mentalHealth ?? 80) + drift + (Math.random() * 4 - 2));
  }

  // ── Pets ─────────────────────────────────────────────────────
  function adoptPet(petTypeId, petName) {
    const c = State.getChar();
    if (c.pet && c.pet.alive) return { ok:false, msg:'You already have a pet.' };
    const def = DATA.getPet(petTypeId);
    if (!def) return { ok:false, msg:'Unknown pet type.' };
    if (c.money < def.adoptCost) return { ok:false, msg:`Need ${DATA.fmtMoney(def.adoptCost)} to adopt.` };
    const name = (petName && petName.trim()) ? petName.trim() : `Little ${def.name}`;
    c.money -= def.adoptCost;
    c.pet = { type: petTypeId, name, age: 0, health: 100, alive: true, sick: false };
    State.applyEffects({ happiness:8, mentalHealth:5 });
    State.addLog(c.age, `Adopted ${name} the ${def.name}.`, 'activity');
    State.saveGame();
    return { ok:true, msg:`Welcome home, ${name}!` };
  }

  function vetPet() {
    const c = State.getChar();
    if (!c.pet || !c.pet.alive) return { ok:false, msg:'No pet to take to the vet.' };
    const def = DATA.getPet(c.pet.type);
    if (!c.pet.sick && c.pet.health >= 80) return { ok:false, msg:`${c.pet.name} is healthy!` };
    if (c.money < def.vetCost) return { ok:false, msg:`Need ${DATA.fmtMoney(def.vetCost)} for the vet.` };
    c.money -= def.vetCost;
    c.pet.health = Math.min(100, c.pet.health + 40);
    c.pet.sick = false;
    State.addLog(c.age, `Took ${c.pet.name} to the vet. They are feeling better.`, 'activity');
    State.saveGame();
    return { ok:true, msg:`${c.pet.name} is feeling much better!` };
  }

  function playWithPet() {
    const c = State.getChar();
    if (!c.pet || !c.pet.alive) return { ok:false, msg:'No pet to play with.' };
    if (!hasEnergy()) return { ok:false, msg:'No energy left.' };
    const def = DATA.getPet(c.pet.type);
    State.applyEffects({ happiness: def.happinessBonus + 3, mentalHealth: 3 });
    spendEnergy();
    State.addLog(c.age, `Played with ${c.pet.name}. Pure joy.`, 'activity');
    State.saveGame();
    return { ok:true, msg:`Quality time with ${c.pet.name}. Happiness up!` };
  }

  function processPetAging(c, g) {
    if (!c.pet || !c.pet.alive) return;
    const def = DATA.getPet(c.pet.type);
    c.pet.age++;
    // Passive happiness boost each year
    State.applyEffects({ happiness: Math.round(def.happinessBonus * 0.3), mentalHealth: 0.5 });
    // Chance of illness
    const sickChance = 0.08 + (c.pet.age / def.lifespan) * 0.1;
    if (!c.pet.sick && Math.random() < sickChance) {
      c.pet.sick = true;
      c.pet.health = Math.max(10, c.pet.health - 30);
      State.addLog(c.age, `${c.pet.name} is not feeling well. Consider visiting the vet.`, 'bad');
      UI.showToast(`${c.pet.name} is sick! Visit the vet.`, 'bad');
    }
    // Death check
    const deathChance = c.pet.age >= def.lifespan ? 0.4 + (c.pet.age - def.lifespan) * 0.2 : (c.pet.sick && c.pet.health < 20) ? 0.2 : 0;
    if (Math.random() < deathChance) {
      c.pet.alive = false;
      State.applyEffects({ happiness:-15, mentalHealth:-12 });
      State.addLog(c.age, `${c.pet.name} passed away. You grieve deeply.`, 'bad');
      UI.showToast(`${c.pet.name} has passed. They will be missed.`, 'bad');
    }
  }

  // ── Social media ──────────────────────────────────────────────
  function doSocialMedia(postType) {
    const c = State.getChar();
    if (c.age < 13) return { ok:false, msg:'Too young for social media.' };
    if (!hasEnergy()) return { ok:false, msg:'No energy left. Age up to rest.' };
    const roll = Math.random();
    let fameGain = 0, happGain = 0, msg = '';
    if (roll < 0.08) {
      // Viral
      const bonus = postType === 'art' || postType === 'music' ? 15 : 8;
      fameGain = 10 + bonus; happGain = 18;
      msg = 'Your post went completely viral! Follower count exploding.';
    } else if (roll < 0.3) {
      fameGain = 4; happGain = 8;
      msg = 'Post got a lot of attention. Nice engagement!';
    } else if (roll < 0.85) {
      fameGain = 1; happGain = 3;
      msg = 'Decent engagement. A few likes and comments.';
    } else {
      fameGain = 0; happGain = -5;
      msg = 'Post got some negative comments. Scrolled too long. Happiness down.';
    }
    State.applyEffects({ fame:fameGain, happiness:happGain });
    spendEnergy();
    State.addLog(c.age, `Social media: ${msg}`, 'activity');
    State.saveGame();
    return { ok:true, msg, viral: fameGain >= 10 };
  }

  // ── Side hustles ──────────────────────────────────────────────
  function doSideHustle(hustleId) {
    const c = State.getChar();
    if (c.age < 16) return { ok:false, msg:'Must be 16+ for side work.' };
    if (!hasEnergy()) return { ok:false, msg:'No energy left. Age up to rest.' };
    const sh = DATA.getSideHustle(hustleId);
    if (!sh) return { ok:false, msg:'Unknown hustle.' };
    if (sh.minSmarts && c.smarts < sh.minSmarts) return { ok:false, msg:`Need ${sh.minSmarts} Smarts.` };
    const hobby = sh.hobbyReq ? c.hobbies.find(h => h.id === sh.hobbyReq) : null;
    if (sh.hobbyReq && (!hobby || hobby.skillLevel < sh.minSkill)) {
      return { ok:false, msg:`Need ${sh.hobbyReq} hobby at skill ${sh.minSkill}+.` };
    }
    const skillFactor = hobby ? hobby.skillLevel / 100 : 0.3;
    const [minI, maxI] = sh.incomeRange;
    const income = Math.round((minI + (maxI - minI) * skillFactor) * (0.7 + Math.random() * 0.6));
    c.money += income;
    spendEnergy();
    State.addLog(c.age, `${sh.name}: earned ${DATA.fmtMoney(income)}.`, 'career');
    State.saveGame();
    return { ok:true, msg:`Earned ${DATA.fmtMoney(income)} from ${sh.name}!`, income };
  }

  // ── Travel ────────────────────────────────────────────────────
  function travel(destinationId) {
    const c = State.getChar();
    if (c.age < 18) return { ok:false, msg:'Must be 18+ to travel abroad.' };
    if (!hasEnergy(2)) return { ok:false, msg:'Need 2 energy for a trip.' };
    const dest = DATA.getTravelDest(destinationId);
    if (!dest) return { ok:false, msg:'Unknown destination.' };
    if (c.money < dest.cost) return { ok:false, msg:`Need ${DATA.fmtMoney(dest.cost)} for this trip.` };
    c.money -= dest.cost;
    State.applyEffects(dest.effects);
    spendEnergy(2);
    if (!c.travelStamps.includes(destinationId)) c.travelStamps.push(destinationId);
    const firstTime = c.travelStamps.length === 1;
    State.addLog(c.age, `Traveled to ${dest.name}. Life-changing.`, 'activity');
    if (firstTime) State.addLog(c.age, 'First trip abroad! The world is bigger than you imagined.', 'good');
    State.saveGame();
    return { ok:true, msg:`Incredible trip to ${dest.name}!${firstTime ? ' First stamp in your passport!' : ''}`, stamps: c.travelStamps.length };
  }

  // ── Parent health checks ──────────────────────────────────────
  function checkParentHealth(c, g) {
    g.relationships.forEach(rel => {
      if ((rel.subtype !== 'father' && rel.subtype !== 'mother') || rel.status !== 'active') return;
      // Chance of parent dying based on age
      const pAge = rel.age;
      if (pAge < 65) return;
      const deathChance = pAge < 75 ? 0.02 : pAge < 85 ? 0.06 : pAge < 95 ? 0.14 : 0.28;
      if (Math.random() < deathChance) {
        rel.status = 'deceased';
        // Inheritance scales with wealth class
        const inhRanges = { impoverished:[500,5000], lower_class:[2000,15000], middle_class:[10000,80000], upper_class:[50000,300000], wealthy:[200000,1500000] };
        const [inhLo, inhHi] = inhRanges[c.wealthClass] || inhRanges.middle_class;
        const inheritance = Math.round(inhLo + Math.random() * (inhHi - inhLo));
        c.money += inheritance;
        State.applyEffects({ happiness:-20, mentalHealth:-15 });
        State.addLog(c.age, `${rel.name} passed away at age ${pAge}. You inherited ${DATA.fmtMoney(inheritance)}.`, 'bad');
        UI.showToast(`${rel.name} has passed away. They will always be in your heart.`, 'bad');
      }
    });
  }

  // ── Mood system ───────────────────────────────────────────────
  function triggerMood(moodId, duration = 2) {
    const c = State.getChar();
    const mood = DATA.getMood(moodId);
    if (!mood) return;
    c.mood = { id:moodId, name:mood.name, color:mood.color, desc:mood.desc, turnsLeft:duration };
    State.saveGame();
  }

  function applyMoodDrift(c) {
    if (!c.mood) return;
    c.mood.turnsLeft--;
    if (c.mood.turnsLeft <= 0) { c.mood = null; return; }
    const moodDef = DATA.getMood(c.mood.id);
    if (!moodDef) return;
    for (const [stat, mod] of Object.entries(moodDef.statMod)) {
      const delta = mod * 3; // mood nudges stats by up to ~3 per year
      if (stat === 'mentalHealth') c.mentalHealth = State.clampStat((c.mentalHealth || 80) + delta);
      else if (stat in c) c[stat] = State.clampStat(c[stat] + delta);
    }
  }

  // ── Addiction passive drain ───────────────────────────────────
  function processAddictions(c) {
    if (!c.addictions || !c.addictions.length) return;
    c.addictions.forEach(a => {
      const drain = a.severity;
      c.health      = State.clampStat(c.health      - drain * 2);
      c.happiness   = State.clampStat(c.happiness   - drain * 3);
      c.mentalHealth= State.clampStat(c.mentalHealth - drain * 2);
      if (drain >= 3) c.money = Math.max(0, c.money - 500 * drain); // feeding the habit
    });
  }

  // ── Health conditions ─────────────────────────────────────────
  function processConditions(c) {
    c.conditions.forEach(condId => {
      const cond = DATA.getCondition(condId);
      if (!cond) return;
      // Drain stats (managed = 70% reduction, not tracked here — manage is active)
      for (const [stat, val] of Object.entries(cond.drain)) {
        if (stat === 'mentalHealth') c.mentalHealth = State.clampStat((c.mentalHealth || 80) + val);
        else if (stat in c) c[stat] = State.clampStat(c[stat] + val);
      }
    });
  }

  function manageCondition(condId) {
    const c = State.getChar();
    const cond = DATA.getCondition(condId);
    if (!cond) return { ok:false, msg:'Unknown condition.' };
    if (!c.conditions.includes(condId)) return { ok:false, msg:'You do not have this condition.' };
    if (c.money < cond.manageCost) return { ok:false, msg:`Need ${DATA.fmtMoney(cond.manageCost)} for treatment.` };
    c.money -= cond.manageCost;
    // Restore the drained stats for this year
    for (const [stat, val] of Object.entries(cond.drain)) {
      const restore = Math.abs(val) * 1.5;
      if (stat === 'mentalHealth') c.mentalHealth = State.clampStat((c.mentalHealth || 80) + restore);
      else if (stat in c) c[stat] = State.clampStat(c[stat] + restore);
    }
    State.addLog(c.age, `Managed ${cond.name}. Feeling better this year.`, 'activity');
    State.saveGame();
    return { ok:true, msg:`Managed ${cond.name}. Stats restored for this year.` };
  }

  // ── Social Circles ────────────────────────────────────────────
  function addToCircle(relId) {
    const c = State.getChar();
    const rel = State.get().relationships.find(r => r.id === relId);
    if (!rel || rel.status !== 'active') return { ok:false, msg:'Not available.' };
    if (c.socialCircle.includes(relId)) return { ok:false, msg:'Already in your circle.' };
    if (c.socialCircle.length >= 6) return { ok:false, msg:'Circle is full (max 6).' };
    c.socialCircle.push(relId);
    State.addLog(c.age, `Added ${rel.name} to your social circle.`, 'rel');
    State.saveGame();
    return { ok:true, msg:`${rel.name} is now in your circle!` };
  }

  function removeFromCircle(relId) {
    const c = State.getChar();
    c.socialCircle = c.socialCircle.filter(id => id !== relId);
    State.saveGame();
    return { ok:true };
  }

  function groupHangout() {
    const g = State.get(); const c = g.character;
    const members = c.socialCircle
      .map(id => g.relationships.find(r => r.id === id && r.status === 'active'))
      .filter(Boolean);
    if (members.length < 2) return { ok:false, msg:'Need at least 2 active people in your circle.' };
    if (!hasEnergy()) return { ok:false, msg:'No energy left. Age up to rest.' };
    // Boost all circle relationships
    members.forEach(rel => { rel.relationship = Math.min(100, rel.relationship + 8); });
    const happBoost = 10 + members.length * 2;
    State.applyEffects({ happiness: happBoost, mentalHealth: 5 });
    spendEnergy();
    triggerMood('content', 1);
    State.addLog(c.age, `Group hangout with ${members.map(r=>r.name.split(' ')[0]).join(', ')}. Great time!`, 'rel');
    State.saveGame();
    return { ok:true, msg:`Hung out with ${members.length} friends. Everyone's closer now!` };
  }

  function familyHangout() {
    const g = State.get(); const c = g.character;
    const family = g.relationships.filter(r => r.type === 'family' && r.status === 'active');
    if (!family.length) return { ok:false, msg:'No living family members.' };
    if (!hasEnergy()) return { ok:false, msg:'No energy left. Age up to rest.' };
    spendEnergy();
    family.forEach(rel => { rel.relationship = Math.min(100, rel.relationship + 10); });
    const happBoost = 12 + family.length * 2;
    State.applyEffects({ happiness: happBoost, mentalHealth: 8 });
    triggerMood('content', 2);
    const names = family.slice(0,3).map(r=>r.name.split(' ')[0]).join(', ');
    State.addLog(c.age, `Family hangout with ${names}${family.length>3?' and more':''}. Warm and wonderful.`, 'rel');
    State.saveGame();
    return { ok:true, msg:`Family time with ${family.length} loved one${family.length>1?'s':''}. Everyone's bond grew!` };
  }

  function groupTrip(destinationId) {
    const g = State.get(); const c = g.character;
    const members = c.socialCircle
      .map(id => g.relationships.find(r => r.id === id && r.status === 'active'))
      .filter(Boolean);
    if (members.length < 2) return { ok:false, msg:'Need at least 2 people in your circle for a group trip.' };
    if (c.age < 18) return { ok:false, msg:'Must be 18+ to plan a group trip.' };
    if (!hasEnergy(2)) return { ok:false, msg:'Need 2 energy for a trip.' };
    const dest = DATA.getTravelDest(destinationId);
    if (!dest) return { ok:false, msg:'Unknown destination.' };
    const groupCost = Math.round(dest.cost * 0.7); // discount for group
    if (c.money < groupCost) return { ok:false, msg:`Need ${DATA.fmtMoney(groupCost)} (group rate).` };
    c.money -= groupCost;
    // Bigger effects than solo travel
    const groupEffects = {};
    for (const [k,v] of Object.entries(dest.effects)) groupEffects[k] = Math.round(v * 1.5);
    State.applyEffects(groupEffects);
    members.forEach(rel => { rel.relationship = Math.min(100, rel.relationship + 15); });
    spendEnergy(2);
    if (!c.travelStamps.includes(destinationId)) c.travelStamps.push(destinationId);
    triggerMood('adventurous', 2);
    State.addLog(c.age, `Group trip to ${dest.name} with ${members.map(r=>r.name.split(' ')[0]).join(', ')}!`, 'activity');
    State.saveGame();
    return { ok:true, msg:`Epic group trip to ${dest.name}! Friendships deepened.` };
  }

  // ── Online Dating ─────────────────────────────────────────────
  function generateDatingProfile(c) {
    const gen = DATA.getAttractedGender(c.gender, c.sexuality) || (c.gender === 'male' ? 'female' : 'male');
    const nm  = DATA.randomName(gen);
    const age = c.age + Math.floor(Math.random() * 9) - 4;
    const interests = DATA.randomTraits(3);
    const sharedInterests = interests.filter(t => DATA.randomTraits(5).includes(t)).length;
    const compatibility = Math.round(40 + sharedInterests * 15 + (c.looks / 10) * 5 + Math.random() * 20);
    const bios = [
      'Looking for something real.',
      'Dog parent. Coffee enthusiast. Part-time adventurer.',
      'Here for good conversations and maybe more.',
      'Lover of music, travel, and long walks.',
      'Optimist with occasional realist tendencies.',
      'Big on authenticity. Small on drama.',
    ];
    return { name: nm.full, age: Math.max(18, age), interests, compatibility, bio: DATA.randomFrom(bios), gender: gen };
  }

  function browseOnlineDating() {
    const c = State.getChar();
    if (c.age < 18) return { ok:false, msg:'Must be 18+ for dating apps.' };
    if (c.sexuality === 'asexual') return { ok:false, msg:'Not really your thing.' };
    if (!hasEnergy()) return { ok:false, msg:'No energy left. Age up to rest.' };
    const profiles = [generateDatingProfile(c), generateDatingProfile(c), generateDatingProfile(c)];
    return { ok:true, profiles };
  }

  function connectWithMatch(profile) {
    const c = State.getChar();
    const alreadyHasPartner = State.getPartner();
    if (alreadyHasPartner) return { ok:false, msg:'Already in a relationship.' };
    // Success based on looks + compatibility
    const successChance = (c.looks / 100) * 0.4 + (profile.compatibility / 100) * 0.4 + 0.2;
    if (Math.random() < successChance) {
      const rel = State.addRelationship({ name:profile.name, type:'partner', subtype:'partner', age:profile.age, relationship:60, traits:profile.interests, status:'active' });
      State.applyEffects({ happiness:15 });
      spendEnergy();
      triggerMood('excited', 2);
      State.addLog(c.age, `Matched with ${rel.name} on a dating app!`, 'rel');
      State.saveGame();
      return { ok:true, matched:true, msg:`Matched with ${profile.name}! You are now connected.` };
    } else {
      State.applyEffects({ happiness:-3 });
      spendEnergy();
      State.saveGame();
      return { ok:true, matched:false, msg:`${profile.name} did not match back. Better luck next time.` };
    }
  }

  // ── Style & Tattoos ───────────────────────────────────────────
  function changeStyle(styleId) {
    const c = State.getChar();
    const styleDef = DATA.STYLES.find(s => s.id === styleId);
    if (!styleDef) return { ok:false, msg:'Unknown style.' };
    const cost = 200;
    if (c.money < cost) return { ok:false, msg:`Need ${DATA.fmtMoney(cost)} for a wardrobe update.` };
    const prevStyle = DATA.STYLES.find(s => s.id === (c.style || 'casual'));
    c.money -= cost;
    c.style = styleId;
    // Remove old style looks bonus, apply new one
    const looksDelta = (styleDef.looks || 0) - (prevStyle?.looks || 0);
    if (looksDelta !== 0) State.applyEffects({ looks: looksDelta });
    State.addLog(c.age, `Changed style to ${styleDef.name}. Refreshing.`, 'activity');
    State.saveGame();
    return { ok:true, msg:`Looking ${styleDef.name.toLowerCase()}! ${looksDelta > 0 ? `Looks +${looksDelta}` : ''}` };
  }

  function getTattoo(design) {
    const c = State.getChar();
    if (c.age < 18) return { ok:false, msg:'Must be 18+.' };
    const cost = 100 + Math.floor(Math.random() * 400);
    if (c.money < cost) return { ok:false, msg:`Need ${DATA.fmtMoney(cost)} for this tattoo.` };
    c.money -= cost;
    c.tattoos = (c.tattoos || 0) + 1;
    State.applyEffects({ happiness:8, looks:1 });
    State.addLog(c.age, `Got a tattoo: ${design}. ${DATA.fmtMoney(cost)}.`, 'activity');
    State.saveGame();
    return { ok:true, msg:`New tattoo! +1 to your story.` };
  }

  // ── Banking ───────────────────────────────────────────────────
  function depositSavings(amount) {
    const c = State.getChar();
    const amt = Math.min(Number(amount), c.money);
    if (amt <= 0) return { ok:false, msg:'Nothing to deposit.' };
    c.money -= amt;
    c.bank.savings = (c.bank.savings || 0) + amt;
    State.addLog(c.age, `Deposited ${DATA.fmtMoney(amt)} to savings.`, 'career');
    State.saveGame();
    return { ok:true, msg:`${DATA.fmtMoney(amt)} moved to savings. Earning ${((c.bank.apy||0.035)*100).toFixed(1)}% APY.` };
  }

  function withdrawSavings(amount) {
    const c = State.getChar();
    const amt = Math.min(Number(amount), c.bank.savings || 0);
    if (amt <= 0) return { ok:false, msg:'Nothing to withdraw.' };
    c.bank.savings -= amt;
    c.money += amt;
    State.addLog(c.age, `Withdrew ${DATA.fmtMoney(amt)} from savings.`, 'career');
    State.saveGame();
    return { ok:true, msg:`${DATA.fmtMoney(amt)} withdrawn to cash.` };
  }

  function payDebt(type, amount) {
    const c = State.getChar();
    const amt = Number(amount);
    if (c.money < amt) return { ok:false, msg:'Not enough cash.' };
    if (type === 'student_loan') {
      if (!c.education.studentLoan) return { ok:false, msg:'No student loan.' };
      const pay = Math.min(amt, c.education.studentLoan);
      c.money -= pay;
      c.education.studentLoan -= pay;
      if (c.education.studentLoan < 0) c.education.studentLoan = 0;
      State.addLog(c.age, `Paid ${DATA.fmtMoney(pay)} toward student loan. Remaining: ${DATA.fmtMoney(c.education.studentLoan)}.`, 'career');
      State.saveGame();
      return { ok:true, msg:`Paid ${DATA.fmtMoney(pay)} off your student loan!${c.education.studentLoan===0?' Fully paid off!':''}` };
    }
    if (type === 'mortgage') {
      const house = c.assets.houses.find(h => h.mortgage > 0);
      if (!house) return { ok:false, msg:'No active mortgage.' };
      const pay = Math.min(amt, house.mortgage);
      c.money -= pay;
      house.mortgage -= pay;
      house.equity += pay;
      if (house.mortgage < 0) house.mortgage = 0;
      State.addLog(c.age, `Paid ${DATA.fmtMoney(pay)} extra on mortgage. Remaining: ${DATA.fmtMoney(house.mortgage)}.`, 'career');
      State.saveGame();
      return { ok:true, msg:`Paid ${DATA.fmtMoney(pay)} off your mortgage!${house.mortgage===0?' Fully paid off!':''}` };
    }
    return { ok:false, msg:'Unknown debt type.' };
  }

  // ── Bucket List ───────────────────────────────────────────────
  function setBucketGoals(goalIds) {
    const c = State.getChar();
    c.bucketList = goalIds.slice(0, 3).map(id => ({ goalId:id, completed:false }));
    State.addLog(c.age, `Set your bucket list: ${goalIds.map(id => DATA.BUCKET_GOALS.find(g=>g.id===id)?.name || id).join(', ')}.`, 'activity');
    State.saveGame();
    return { ok:true };
  }

  function checkBucketList(g) {
    const c = g.character;
    if (!c.bucketList || c.bucketList.length === 0) return;
    c.bucketList.forEach(entry => {
      if (entry.completed) return;
      const goal = DATA.BUCKET_GOALS.find(bg => bg.id === entry.goalId);
      if (!goal) return;
      let completed = false;
      switch(goal.id) {
        case 'find_love':       completed = g.relationships.some(r=>r.subtype==='spouse'); break;
        case 'travel_5':        completed = (c.travelStamps?.length||0) >= 5; break;
        case 'millionaire':     completed = getNetWorth(c) >= 1000000; break;
        case 'famous':          completed = (c.fame||0) >= 80; break;
        case 'child':           completed = g.relationships.some(r=>r.subtype==='child'); break;
        case 'doctorate':       completed = c.education.level === 'doctorate'; break;
        case 'own_home':        completed = c.assets.houses.length > 0; break;
        case 'live_to_90':      completed = c.age >= 90; break;
        case 'hobby_master':    completed = c.hobbies.some(h => h.skillLevel >= 90); break;
        case 'world_traveler':  completed = (c.travelStamps?.length||0) >= 7; break;
        case 'top_career':      const car = DATA.getCareer(c.career.jobId||''); completed = !!(car && c.career.promotionLevel >= car.promotions.length-1); break;
        case 'social_butterfly':completed = c.socialCircle.length >= 3; break;
      }
      if (completed) {
        entry.completed = true;
        State.addLog(c.age, `Bucket list goal completed: ${goal.name}!`, 'good');
        UI.showToast(`Bucket list: ${goal.name} done!`, 'good');
        State.applyEffects({ happiness:15, mentalHealth:8 });
        triggerMood('grateful', 2);
      }
    });
  }

  // ── Legacy system ─────────────────────────────────────────────
  const LEGACY_KEY = 'lalalife_legacy';

  function loadLegacy() {
    try {
      const raw = localStorage.getItem(LEGACY_KEY);
      if (!raw) return { lives:0, totalPoints:0, allAchievements:[] };
      return JSON.parse(raw);
    } catch(e) { return { lives:0, totalPoints:0, allAchievements:[] }; }
  }

  function saveLegacy(summary) {
    try {
      const legacy = loadLegacy();
      legacy.lives++;
      let pts = 100; // base per life
      summary.achievements.forEach(a => {
        pts += 50;
        if (!legacy.allAchievements.includes(a.id)) {
          legacy.allAchievements.push(a.id);
          pts += 30; // bonus for first-time unlock
        }
      });
      if (summary.netWorth >= 1e9) pts += 300;
      else if (summary.netWorth >= 1e6) pts += 150;
      if (summary.age >= 100) pts += 200;
      if (summary.age >= 80) pts += 80;
      const c = State.getChar();
      if ((c.travelStamps?.length || 0) >= 5) pts += 100;
      // Bucket list completions
      const bucketCompleted = (c.bucketList || []).filter(b => b.completed).length;
      pts += bucketCompleted * 75;
      if (c.will) pts += c.will.legacyBonus || 0;
      if (c.lifeGoalCompleted) pts += 120;
      legacy.totalPoints = (legacy.totalPoints || 0) + pts;
      localStorage.setItem(LEGACY_KEY, JSON.stringify(legacy));
      return { gained: pts, total: legacy.totalPoints, lives: legacy.lives };
    } catch(e) { return null; }
  }

  function getLegacyBonuses(totalPoints) {
    const bonuses = { smarts:0, happiness:0, health:0, looks:0, money:0 };
    if (totalPoints >= 100)  bonuses.happiness += 3;
    if (totalPoints >= 300)  bonuses.smarts    += 3;
    if (totalPoints >= 500)  bonuses.money     += 1000;
    if (totalPoints >= 750)  bonuses.health    += 3;
    if (totalPoints >= 1000) bonuses.smarts    += 4;
    if (totalPoints >= 1500) bonuses.money     += 2000;
    if (totalPoints >= 2000) bonuses.looks     += 5;
    if (totalPoints >= 3000) bonuses.happiness += 5;
    if (totalPoints >= 5000) { bonuses.health += 5; bonuses.money += 5000; }
    return bonuses;
  }

  function getLegacyInfo() {
    const legacy = loadLegacy();
    const bonuses = getLegacyBonuses(legacy.totalPoints);
    return { ...legacy, bonuses };
  }

  // ── Kid interactions ──────────────────────────────────────────
  function childAction(relId, actionId) {
    const g = State.get(); const c = g.character;
    const child = g.relationships.find(r => r.id === relId && r.subtype === 'child');
    if (!child) return { ok:false, msg:'Child not found.' };
    if (!hasEnergy()) return { ok:false, msg:'No energy left. Age up to rest.' };
    spendEnergy();
    let msg = '';
    const childAge = child.age || 0;
    switch (actionId) {
      case 'play':
        child.relationship = Math.min(100, child.relationship + 10);
        State.applyEffects({ happiness: 12 });
        msg = `Played with ${child.name}. Both of you had a great time.`; break;
      case 'homework':
        if (childAge < 6) return { ok:false, msg:`${child.name} is too young for homework.` };
        child.relationship = Math.min(100, child.relationship + 8);
        State.applyEffects({ happiness: 8 });
        msg = `Helped ${child.name} with homework. Bond strengthened.`; break;
      case 'bedtime_story':
        if (childAge > 10) return { ok:false, msg:`${child.name} is too old for bedtime stories.` };
        child.relationship = Math.min(100, child.relationship + 12);
        State.applyEffects({ happiness: 15 });
        msg = `Read ${child.name} a bedtime story. A precious memory.`; break;
      case 'park':
        child.relationship = Math.min(100, child.relationship + 9);
        State.applyEffects({ happiness: 10, health: 3 });
        c.money -= 20; if (c.money < 0) c.money = 0;
        msg = `Took ${child.name} to the park. Fresh air for everyone.`; break;
      case 'heart_to_heart':
        if (childAge < 13) return { ok:false, msg:`${child.name} is too young for a heart-to-heart.` };
        child.relationship = Math.min(100, child.relationship + 15);
        State.applyEffects({ happiness: 10, mentalHealth: 5 });
        msg = `Had a heart-to-heart with ${child.name}. You feel closer than ever.`; break;
      case 'teach_skill': {
        if (childAge < 5) return { ok:false, msg:`${child.name} is too young.` };
        const skills = ['cooking', 'music', 'sports', 'art', 'reading'];
        const skill = DATA.randomFrom(skills);
        child.relationship = Math.min(100, child.relationship + 7);
        State.applyEffects({ happiness: 8 });
        msg = `Taught ${child.name} about ${skill}. They loved it!`; break;
      }
      case 'family_game_night':
        child.relationship = Math.min(100, child.relationship + 11);
        State.applyEffects({ happiness: 14 });
        c.money -= 30; if (c.money < 0) c.money = 0;
        msg = `Family game night with ${child.name}! Laughter all around.`; break;
      case 'ground':
        if (childAge < 13) return { ok:false, msg:`${child.name} is too young to ground.` };
        child.relationship = Math.max(0, child.relationship - 10);
        State.applyEffects({ happiness: -5 });
        msg = `Grounded ${child.name}. They're furious, but it had to be done.`; break;
      default:
        return { ok:false, msg:'Unknown action.' };
    }
    State.addLog(c.age, msg, 'rel');
    State.saveGame();
    return { ok:true, msg };
  }

  // ── Partying ──────────────────────────────────────────────────
  function goParty(type) {
    const c = State.getChar();
    if (c.age < 16) return { ok:false, msg:'Too young to party.' };
    if (type === 'club' && c.age < 18) return { ok:false, msg:'Must be 18+ for clubs.' };
    if (!hasEnergy()) return { ok:false, msg:'No energy left. Age up to rest.' };
    spendEnergy();
    if (type === 'club') {
      const cost = 60 + Math.floor(Math.random() * 80);
      if (c.money < cost) return { ok:false, msg:`Need at least ${DATA.fmtMoney(cost)} for a night out.` };
      c.money -= cost;
      const wildNight = Math.random() < 0.25;
      State.applyEffects({ happiness: wildNight ? 25 : 15, health: wildNight ? -8 : -3 });
      const msg = wildNight ? `Wild night out at the club! Spent ${DATA.fmtMoney(cost)}, memories made.` : `Night at the club. Danced, laughed, spent ${DATA.fmtMoney(cost)}.`;
      State.addLog(c.age, msg, 'activity');
      State.saveGame();
      return { ok:true, msg };
    } else {
      // house party — free, younger allowed
      State.applyEffects({ happiness: 12, health: -2 });
      const metSomeone = Math.random() < 0.3 && !State.getPartner() && c.age >= 16 && c.sexuality !== 'asexual';
      let msg = 'Fun house party! Good vibes.';
      if (metSomeone) {
        const gen = DATA.getAttractedGender(c.gender, c.sexuality) || (c.gender === 'male' ? 'female' : 'male');
        const nm  = DATA.randomName(gen);
        State.addRelationship({ name:nm.full, type:'partner', subtype:'crush', age:c.age+Math.floor(Math.random()*4)-2, relationship:40, traits:DATA.randomTraits(2), status:'active' });
        msg = `Met someone cute at a party — ${nm.full}. Sparks flew!`;
      }
      State.addLog(c.age, msg, 'activity');
      State.saveGame();
      return { ok:true, msg };
    }
  }

  // ── Substances ────────────────────────────────────────────────
  const SUBSTANCES = {
    alcohol:  { label:'Drink Alcohol',   minAge:18, cost:30,  happy:12, health:-4,  mental:-2,  addictChance:0.08, addictLabel:'Alcohol Dependence' },
    weed:     { label:'Smoke Weed',      minAge:18, cost:40,  happy:15, health:-3,  mental:3,   addictChance:0.06, addictLabel:'Cannabis Habit' },
    pills:    { label:'Take Party Pills',minAge:18, cost:60,  happy:22, health:-8,  mental:-5,  addictChance:0.15, addictLabel:'Pill Dependency' },
    cocaine:  { label:'Try Cocaine',     minAge:18, cost:150, happy:28, health:-15, mental:-10, addictChance:0.30, addictLabel:'Cocaine Addiction' },
  };

  function useSubstance(substanceId) {
    const c = State.getChar();
    const sub = SUBSTANCES[substanceId];
    if (!sub) return { ok:false, msg:'Unknown substance.' };
    if (c.age < sub.minAge) return { ok:false, msg:`Must be ${sub.minAge}+.` };
    if (!hasEnergy()) return { ok:false, msg:'No energy left. Age up to rest.' };
    if (c.money < sub.cost) return { ok:false, msg:`Need ${DATA.fmtMoney(sub.cost)}.` };
    spendEnergy();
    c.money -= sub.cost;
    State.applyEffects({ happiness: sub.happy, health: sub.health, mentalHealth: sub.mental });
    // Addiction check
    c.substances = c.substances || {};
    c.substances[substanceId] = (c.substances[substanceId] || 0) + 1;
    const timesUsed = c.substances[substanceId];
    const addictRoll = Math.random() < (sub.addictChance * (1 + timesUsed * 0.05));
    c.addictions = c.addictions || [];
    const alreadyAddicted = c.addictions.find(a => a.id === substanceId);
    if (addictRoll && !alreadyAddicted) {
      c.addictions.push({ id:substanceId, label:sub.addictLabel, severity:1 });
      State.addLog(c.age, `Developed ${sub.addictLabel}.`, 'bad');
      UI.showToast(`You developed ${sub.addictLabel}. This could get out of hand.`, 'bad');
    } else if (alreadyAddicted && Math.random() < 0.2) {
      alreadyAddicted.severity = Math.min(3, alreadyAddicted.severity + 1);
    }
    const msg = `Used ${sub.label.toLowerCase()}.`;
    State.addLog(c.age, msg, 'activity');
    State.saveGame();
    return { ok:true, msg, addicted: addictRoll && !alreadyAddicted };
  }

  function seekRehab() {
    const c = State.getChar();
    if (!c.addictions || !c.addictions.length) return { ok:false, msg:'No addictions to treat.' };
    const cost = 8000;
    if (c.money < cost) return { ok:false, msg:`Rehab costs ${DATA.fmtMoney(cost)}.` };
    c.money -= cost;
    const cleared = c.addictions.filter(a => Math.random() < (0.6 / a.severity));
    const remaining = c.addictions.filter(a => !cleared.find(cl => cl.id === a.id));
    c.addictions = remaining;
    remaining.forEach(a => { a.severity = Math.max(1, a.severity - 1); });
    const msg = cleared.length
      ? `Rehab cleared ${cleared.map(a=>a.label).join(', ')}.${remaining.length ? ' Still working on the rest.' : ' Clean!'}`
      : 'Rehab helped but the addiction persists. Consider trying again.';
    State.applyEffects({ mentalHealth: 15, happiness: cleared.length ? 10 : 0 });
    State.addLog(c.age, msg, 'good');
    State.saveGame();
    return { ok:true, msg };
  }

  // ── Subscriptions ─────────────────────────────────────────────
  const SUBSCRIPTIONS = [
    { id:'library',    label:'Library Card',         cost:120,  desc:'+3 smarts/yr',           effects:{ smarts:3 } },
    { id:'gym_sub',    label:'Gym Membership',       cost:600,  desc:'+3 health/yr',           effects:{ health:3 } },
    { id:'streaming',  label:'Streaming Services',   cost:240,  desc:'+4 happiness/yr',        effects:{ happiness:4 } },
    { id:'meditation', label:'Meditation App',       cost:100,  desc:'+4 mental health/yr',    effects:{ mentalHealth:4 } },
    { id:'meal_kit',   label:'Meal Kit Delivery',    cost:800,  desc:'+2 health, +2 happiness/yr', effects:{ health:2, happiness:2 } },
    { id:'news',       label:'News Subscription',    cost:150,  desc:'+2 smarts, +1 happiness/yr', effects:{ smarts:2, happiness:1 } },
    { id:'beauty_box', label:'Beauty/Grooming Box',  cost:300,  desc:'+3 looks/yr',            effects:{ looks:3 } },
    { id:'audiobooks', label:'Audiobook Service',    cost:180,  desc:'+2 smarts, +2 happiness/yr', effects:{ smarts:2, happiness:2 } },
  ];

  function toggleSubscription(subId) {
    const c = State.getChar();
    const sub = SUBSCRIPTIONS.find(s => s.id === subId);
    if (!sub) return { ok:false, msg:'Unknown subscription.' };
    // gym_sub and gymMembership share the same slot
    if (subId === 'gym_sub') {
      if (c.gymMembership) { c.gymMembership = false; State.saveGame(); return { ok:true, msg:'Gym membership cancelled.' }; }
      if (c.money < sub.cost) return { ok:false, msg:`Need ${DATA.fmtMoney(sub.cost)}.` };
      c.money -= sub.cost; c.gymMembership = true; State.saveGame();
      return { ok:true, msg:'Gym membership active! +3 health/year.' };
    }
    c.subscriptions = c.subscriptions || {};
    if (c.subscriptions[subId]) {
      c.subscriptions[subId] = false;
      State.addLog(c.age, `Cancelled ${sub.label}.`, 'event');
      State.saveGame();
      return { ok:true, msg:`${sub.label} cancelled.` };
    }
    if (c.money < sub.cost) return { ok:false, msg:`Need ${DATA.fmtMoney(sub.cost)}.` };
    c.money -= sub.cost;
    c.subscriptions[subId] = true;
    State.addLog(c.age, `Subscribed to ${sub.label}.`, 'activity');
    State.saveGame();
    return { ok:true, msg:`${sub.label} active! ${sub.desc}` };
  }

  function applySubscriptionPassive(c) {
    c.subscriptions = c.subscriptions || {};
    let totalCost = 0;
    SUBSCRIPTIONS.forEach(sub => {
      if (sub.id === 'gym_sub') return; // handled by gymMembership
      if (!c.subscriptions[sub.id]) return;
      if (c.money < sub.cost) { c.subscriptions[sub.id] = false; State.addLog(c.age, `Could not afford ${sub.label} — cancelled.`, 'bad'); return; }
      c.money -= sub.cost;
      totalCost += sub.cost;
      Object.entries(sub.effects).forEach(([stat, val]) => {
        if (stat === 'mentalHealth') c.mentalHealth = State.clampStat((c.mentalHealth||80) + val);
        else if (stat in c) c[stat] = State.clampStat(c[stat] + val);
      });
    });
  }

  // ── Taxes info ───────────────────────────────────────────────
  function getTaxInfo(c) {
    const sal = c.career.salary || 0;
    const rate = sal > 160000 ? 0.37 : sal > 80000 ? 0.30 : sal > 40000 ? 0.22 : 0.10;
    return { rate, annual: Math.round(sal * rate), paid: c.taxesPaid || 0 };
  }

  // ── Bank loan ─────────────────────────────────────────────────
  function takeLoan(amount) {
    const c = State.getChar();
    if (c.personalLoan > 0) return { ok:false, msg:'Already have an outstanding personal loan.' };
    const maxLoan = Math.max(5000, (c.career.salary||0) * 3);
    if (amount > maxLoan) return { ok:false, msg:`Max loan based on income: ${DATA.fmtMoney(maxLoan)}.` };
    c.personalLoan = amount;
    c.money += amount;
    State.addLog(c.age, `Took a personal loan of ${DATA.fmtMoney(amount)} at 9% interest.`, 'event');
    State.saveGame();
    return { ok:true, msg:`Loan approved! ${DATA.fmtMoney(amount)} deposited. 9% annual interest.` };
  }

  // ── Health care ───────────────────────────────────────────────
  function healthCare(action) {
    const c = State.getChar();
    switch (action) {
      case 'doctor': {
        const cost = c.insurance?.health ? 50 : 200;
        if (c.money < cost) return { ok:false, msg:`Doctor visit costs ${DATA.fmtMoney(cost)}.` };
        c.money -= cost;
        c.health = State.clampStat(c.health + 8);
        State.applyEffects({ happiness: 3 });
        State.addLog(c.age, `Doctor visit. Health improved.`, 'good');
        State.saveGame();
        return { ok:true, msg:`Doctor visit: health restored. Cost ${DATA.fmtMoney(cost)}.` };
      }
      case 'dentist': {
        const cost = c.insurance?.health ? 40 : 300;
        if (c.money < cost) return { ok:false, msg:`Dentist costs ${DATA.fmtMoney(cost)}.` };
        c.money -= cost;
        c.looks = State.clampStat(c.looks + 2);
        State.applyEffects({ happiness: 4 });
        State.addLog(c.age, 'Dental check-up.', 'good');
        State.saveGame();
        return { ok:true, msg:`Dentist done. Smile improved! Cost ${DATA.fmtMoney(cost)}.` };
      }
      case 'optometrist': {
        const cost = c.insurance?.health ? 30 : 150;
        if (c.money < cost) return { ok:false, msg:`Optometrist costs ${DATA.fmtMoney(cost)}.` };
        c.money -= cost;
        c.smarts = State.clampStat(c.smarts + 2);
        State.applyEffects({ happiness: 2 });
        State.addLog(c.age, 'Eye check-up.', 'good');
        State.saveGame();
        return { ok:true, msg:`Eyes checked. Vision clear! Cost ${DATA.fmtMoney(cost)}.` };
      }
      case 'gym': {
        if (c.gymMembership) return { ok:false, msg:'Already have a gym membership ($600/yr).' };
        if (c.money < 600) return { ok:false, msg:'Need $600 to start.' };
        c.money -= 600;
        c.gymMembership = true;
        State.addLog(c.age, 'Joined the gym. $600/yr.', 'good');
        State.saveGame();
        return { ok:true, msg:'Gym membership active! +2 health/year.' };
      }
      case 'cancel_gym':
        c.gymMembership = false;
        State.saveGame();
        return { ok:true, msg:'Gym membership cancelled.' };
      case 'trainer': {
        if (c.personalTrainer) return { ok:false, msg:'Already have a personal trainer ($2,000/yr).' };
        if (c.money < 2000) return { ok:false, msg:'Need $2,000 to start.' };
        c.money -= 2000;
        c.personalTrainer = true;
        State.addLog(c.age, 'Hired a personal trainer. $2,000/yr.', 'good');
        State.saveGame();
        return { ok:true, msg:'Personal trainer hired! +5 health/year.' };
      }
      case 'cancel_trainer':
        c.personalTrainer = false;
        State.saveGame();
        return { ok:true, msg:'Personal trainer cancelled.' };
      default: return { ok:false, msg:'Unknown action.' };
    }
  }

  // ── Insurance ─────────────────────────────────────────────────
  function manageInsurance(type, buy) {
    const c = State.getChar();
    c.insurance = c.insurance || {};
    const costs = { health:500, home:400, car:300 };
    if (buy) {
      if (c.insurance[type]) return { ok:false, msg:`Already have ${type} insurance.` };
      if (c.money < costs[type]) return { ok:false, msg:`Need ${DATA.fmtMoney(costs[type])} to start.` };
      c.money -= costs[type];
      c.insurance[type] = true;
      State.addLog(c.age, `Got ${type} insurance. $${costs[type]}/yr.`, 'good');
    } else {
      c.insurance[type] = false;
      State.addLog(c.age, `Cancelled ${type} insurance.`, 'event');
    }
    State.saveGame();
    return { ok:true, msg: buy ? `${type} insurance active.` : `${type} insurance cancelled.` };
  }

  // ── Tattoo removal ────────────────────────────────────────────
  function removeTattoo() {
    const c = State.getChar();
    if (!c.tattoos || c.tattoos < 1) return { ok:false, msg:'No tattoos to remove.' };
    const cost = 800;
    if (c.money < cost) return { ok:false, msg:`Tattoo removal costs ${DATA.fmtMoney(cost)}.` };
    c.money -= cost;
    c.tattoos--;
    State.addLog(c.age, 'Had a tattoo removed.', 'activity');
    State.saveGame();
    return { ok:true, msg:'Tattoo removed. Painful but worth it.' };
  }

  // ── Write memoir ──────────────────────────────────────────────
  function writeMemoirAction() {
    const c = State.getChar();
    if (c.age < 60) return { ok:false, msg:'Memoirs are for people with a life to look back on (60+).' };
    if (c.wroteMemoir) return { ok:false, msg:'Already wrote your memoir.' };
    if (!hasEnergy()) return { ok:false, msg:'No energy.' };
    spendEnergy();
    c.wroteMemoir = true;
    const advance = Math.round(10000 + (c.age - 60) * 500 + (c.fame||0) * 300);
    c.money += advance;
    State.applyEffects({ happiness: 20 });
    State.addLog(c.age, `Wrote memoir: earned ${DATA.fmtMoney(advance)}.`, 'good');
    State.saveGame();
    return { ok:true, msg:`Memoir published! Earned ${DATA.fmtMoney(advance)}.` };
  }

  // ── Best friend ───────────────────────────────────────────────
  function setBestFriend(relId) {
    const g = State.get(); const c = g.character;
    const rel = g.relationships.find(r => r.id === relId && r.type === 'friend' && r.status === 'active');
    if (!rel) return { ok:false, msg:'Must be an active friend.' };
    if (rel.relationship < 60) return { ok:false, msg:'Need 60+ bond to be best friends.' };
    g.relationships.forEach(r => { if (r.isBestFriend) r.isBestFriend = false; });
    rel.isBestFriend = true;
    State.applyEffects({ happiness: 10 });
    State.addLog(c.age, `${rel.name} is now your best friend.`, 'rel');
    State.saveGame();
    return { ok:true, msg:`${rel.name} is your best friend!` };
  }

  // ── Ghosting ──────────────────────────────────────────────────
  function ghostPerson(relId) {
    const g = State.get(); const c = g.character;
    const rel = g.relationships.find(r => r.id === relId && r.status === 'active');
    if (!rel) return { ok:false, msg:'Person not found.' };
    rel.relationship = Math.max(0, rel.relationship - 25);
    if (rel.relationship === 0) { rel.status = 'ghosted'; rel.type = 'ex'; }
    State.addLog(c.age, `Ghosted ${rel.name}.`, 'event');
    State.saveGame();
    return { ok:true, msg:`Ghosted ${rel.name}. They got the message.` };
  }

  // ── Toggle rental status on a house ─────────────────────────
  function toggleRental(houseIdx) {
    const c = State.getChar();
    const h = c.assets.houses[houseIdx];
    if (!h) return { ok:false, msg:'House not found.' };
    h.isRental = !h.isRental;
    const msg = h.isRental ? `${h.name} set as rental. Earns ~${DATA.fmtMoney(Math.round(h.value*0.06))}/yr.` : `${h.name} no longer rented out.`;
    State.addLog(c.age, msg, 'career');
    State.saveGame();
    return { ok:true, msg };
  }

  // ── Military service ──────────────────────────────────────────
  function enlistMilitary() {
    const c = State.getChar();
    if (c.age < 18 || c.age > 30) return { ok:false, msg:'Enlistment open age 18–30.' };
    if (c.inMilitary) return { ok:false, msg:'Already serving.' };
    if (c.education.inSchool) return { ok:false, msg:'Finish school first.' };
    c.inMilitary = true;
    c.militaryYearsLeft = 4;
    if (c.career.jobId) quitJob(false);
    State.applyEffects({ health: 10, happiness: -5 });
    State.addLog(c.age, 'Enlisted in the military. 4-year service commitment.', 'career');
    State.saveGame();
    return { ok:true, msg:'Enlisted! 4 years of service. Health boost, good pay, GI Bill on exit.' };
  }

  function processMilitary(c) {
    if (!c.inMilitary) return;
    const salary = 32000;
    const tax = Math.round(salary * 0.10);
    c.money += salary - tax;
    c.health = State.clampStat(c.health + 3);
    c.militaryYearsLeft--;
    if (Math.random() < 0.05) { // deployment/PTSD risk
      State.applyEffects({ mentalHealth: -15, happiness: -10 });
      State.addLog(c.age, 'Deployed overseas. Tough year mentally.', 'bad');
    }
    if (c.militaryYearsLeft <= 0) {
      c.inMilitary = false;
      c.militaryVeteran = true;
      c.giBill = 30000; // education benefit
      State.applyEffects({ happiness: 15 });
      State.addLog(c.age, 'Honorably discharged. GI Bill education benefit: $30,000 unlocked.', 'good');
      UI.showToast('Military service complete! GI Bill unlocked.', 'good');
    }
  }

  // ── Prison activities ─────────────────────────────────────────
  function doPrisonActivity(actId) {
    const c = State.getChar();
    if (!c.inJail) return { ok:false, msg:'Not in jail.' };
    if (!hasEnergy()) return { ok:false, msg:'No energy.' };
    spendEnergy();
    const acts = {
      workout:     { msg:'Worked out in the yard. Health up.', effects:{ health:8, happiness:-2 } },
      read:        { msg:'Read books in the library. Smarts up.', effects:{ smarts:5, happiness:3 } },
      meditate:    { msg:'Meditated in your cell. Mental health up.', effects:{ mentalHealth:8, happiness:5 } },
      make_friend: { msg:'Made a friend inside.', effects:{ happiness:8 }, addFriend:true },
      fight:       { msg:'Got in a prison fight.', effects:{ health:-5, happiness:-5 }, risk:true },
    };
    const act = acts[actId];
    if (!act) return { ok:false, msg:'Unknown activity.' };
    if (act.risk && Math.random() < 0.3) {
      c.jailYearsLeft++;
      State.applyEffects({ health:-10, happiness:-10 });
      State.addLog(c.age, 'Prison fight — got extra time added to sentence.', 'bad');
      State.saveGame();
      return { ok:true, msg:'Lost the fight and got extra time. Bad idea.' };
    }
    State.applyEffects(act.effects);
    if (act.addFriend) {
      const nm = DATA.randomName(Math.random()<0.5?'female':'male');
      State.addRelationship({ name:nm.full, type:'friend', subtype:'friend', age:c.age+Math.floor(Math.random()*10)-5, relationship:45, traits:DATA.randomTraits(2), status:'active' });
    }
    State.addLog(c.age, `Prison: ${act.msg}`, 'event');
    State.saveGame();
    return { ok:true, msg: act.msg };
  }

  // ── Stock market events ───────────────────────────────────────
  function checkStockMarket(c) {
    if (c.assets.investments <= 0) return;
    const roll = Math.random();
    if (roll < 0.06) { // crash
      const loss = Math.round(c.assets.investments * (0.25 + Math.random()*0.3));
      c.assets.investments = Math.max(0, c.assets.investments - loss);
      State.applyEffects({ happiness:-12 });
      State.addLog(c.age, `Stock market crash! Lost ${DATA.fmtMoney(loss)} in investments.`, 'bad');
      UI.showToast(`Market crash! -${DATA.fmtMoney(loss)}`, 'bad');
    } else if (roll < 0.12) { // boom
      const gain = Math.round(c.assets.investments * (0.2 + Math.random()*0.3));
      c.assets.investments += gain;
      State.applyEffects({ happiness: 8 });
      State.addLog(c.age, `Market boom! Investments grew by ${DATA.fmtMoney(gain)}.`, 'good');
      UI.showToast(`Market boom! +${DATA.fmtMoney(gain)}`, 'good');
    }
  }

  // ── Ex returns ────────────────────────────────────────────────
  function checkExReturns(c, g) {
    if (State.getPartner()) return; // already with someone
    if (c.sexuality === 'asexual') return;
    const exes = g.relationships.filter(r => r.type === 'ex' && r.status !== 'rekindled');
    if (!exes.length) return;
    if (Math.random() > 0.08) return;
    const ex = DATA.randomFrom(exes);
    ex.status = 'rekindled';
    State.addLog(c.age, `${ex.name} reached out. Old feelings surfaced.`, 'rel');
    UI.showToast(`${ex.name} is back in your life. Check Relationships.`, 'info');
    ex.reachedOut = true;
  }

  // ── Friends → enemies ─────────────────────────────────────────
  function checkFriendEnemy(g) {
    g.relationships.forEach(rel => {
      if (rel.type === 'friend' && rel.status === 'active' && rel.relationship <= 10) {
        rel.type = 'enemy';
        rel.subtype = 'enemy';
        State.addLog(0, `${rel.name} has become an enemy.`, 'bad');
        // Enemies occasionally cause negative events passively
      }
    });
    // Enemy passive damage
    const enemies = g.relationships.filter(r => r.type === 'enemy' && r.status === 'active');
    if (enemies.length > 0 && Math.random() < 0.2) {
      const enemy = DATA.randomFrom(enemies);
      State.applyEffects({ happiness:-5, reputation:-3 });
      State.addLog(g.character.age, `${enemy.name} (enemy) caused trouble for you.`, 'bad');
    }
  }

  // ── Special death ribbons ────────────────────────────────────
  function getDeathRibbon(c, g, cause) {
    if (c.age >= 100) return { ribbon:'Centenarian', desc:'Lived a full century.' };
    if (c.age >= 90)  return { ribbon:'Elder', desc:'Lived a long, full life.' };
    if ((c.addictions||[]).some(a=>a.severity>=3) && c.health < 20) return { ribbon:'Lost to Addiction', desc:'Substance abuse cut life short.' };
    if (c.criminalRecord && c.inJail) return { ribbon:'Behind Bars', desc:'Died while incarcerated.' };
    if (cause === 'Sudden accident') return { ribbon:'Gone Too Soon', desc:'A tragic accident ended it all.' };
    if (g.relationships.filter(r=>r.subtype==='child').length >= 5) return { ribbon:'Legacy Builder', desc:'Left a large family behind.' };
    if (Engine.getNetWorth(c) >= 10000000) return { ribbon:'Mogul', desc:'Died with immense wealth.' };
    if ((c.fame||0) >= 80) return { ribbon:'Legend', desc:'Left a mark on the world.' };
    if (c.militaryVeteran) return { ribbon:'Veteran', desc:'Served with honour.' };
    if (c.wroteMemoir) return { ribbon:'Author', desc:'Told their story.' };
    if (c.will) return { ribbon:'Prepared', desc:'Left the world in order.' };
    return null;
  }

  // ── Horoscope ────────────────────────────────────────────────
  const ZODIAC = ['Capricorn','Aquarius','Pisces','Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius'];
  const HOROSCOPE_LINES = [
    'The stars favour bold decisions this year.','Unexpected financial opportunity ahead.',
    'A relationship deepens in surprising ways.','Guard your health — pace yourself.',
    'Your creative energy is at its peak.','Someone from the past re-enters your orbit.',
    'A risk taken now pays off later.','Stay patient — your time is coming.',
    'Trust your instincts more than logic today.','Romance is in the air.',
    'Hard work this year plants seeds for the future.','Let go of what no longer serves you.',
  ];

  function getHoroscope(c) {
    const sign = ZODIAC[(c.birthYear || 1990) % 12];
    const line = HOROSCOPE_LINES[Math.floor(Math.random() * HOROSCOPE_LINES.length)];
    return { sign, line };
  }

  // ── Therapy ───────────────────────────────────────────────────
  function startTherapy() {
    const c = State.getChar();
    if (c.inTherapy) return { ok:false, msg:'Already in therapy.' };
    const cost = 3000;
    if (c.money < cost) return { ok:false, msg:`Therapy costs ${DATA.fmtMoney(cost)}/year.` };
    c.inTherapy = true;
    c.money -= cost;
    State.addLog(c.age, 'Started therapy.', 'good');
    State.saveGame();
    return { ok:true, msg:'Started therapy. Mental health will improve over time.' };
  }

  function stopTherapy() {
    const c = State.getChar();
    if (!c.inTherapy) return { ok:false, msg:'Not in therapy.' };
    c.inTherapy = false;
    State.addLog(c.age, 'Stopped therapy.', 'event');
    State.saveGame();
    return { ok:true, msg:'Stopped attending therapy.' };
  }

  function applyTherapyPassive(c) {
    if (!c.inTherapy) return;
    const cost = 3000;
    if (c.money < cost) { c.inTherapy = false; State.addLog(c.age, 'Could not afford therapy — sessions cancelled.', 'bad'); return; }
    c.money -= cost;
    c.mentalHealth = State.clampStat((c.mentalHealth || 80) + 12);
    c.happiness    = State.clampStat(c.happiness + 4);
    // Mild addiction help
    if (c.addictions && c.addictions.length) {
      c.addictions.forEach(a => {
        if (Math.random() < 0.15) a.severity = Math.max(0, a.severity - 1);
      });
      c.addictions = c.addictions.filter(a => a.severity > 0);
    }
  }

  // ── College social life ───────────────────────────────────────
  function collegeAction(actionId) {
    const c = State.getChar();
    const edu = c.education;
    if (!edu.inSchool || edu.schoolType !== 'university') return { ok:false, msg:'Must be enrolled in university.' };
    if (!hasEnergy()) return { ok:false, msg:'No energy left. Age up to rest.' };
    spendEnergy();
    switch (actionId) {
      case 'frat': {
        if (c.joinedFrat) return { ok:false, msg:'Already in a frat/sorority.' };
        c.joinedFrat = true;
        State.applyEffects({ happiness: 15 });
        const nm = DATA.randomName(DATA.getAttractedGender(c.gender, c.sexuality) || 'male');
        State.addRelationship({ name:nm.full, type:'friend', subtype:'friend', age:c.age+Math.floor(Math.random()*3)-1, relationship:55, traits:DATA.randomTraits(2), status:'active' });
        State.addLog(c.age, `Joined a frat/sorority. Made new friends.`, 'activity');
        State.saveGame();
        return { ok:true, msg:'Pledged! Instant social life boost and a new friend.' };
      }
      case 'all_nighter': {
        State.applyEffects({ health:-8, happiness:-5 });
        edu.gpa = Math.min(4.0, +(((edu.gpa||2.5) + 0.2).toFixed(2)));
        State.addLog(c.age, `Pulled an all-nighter. GPA up to ${edu.gpa.toFixed(2)}.`, 'edu');
        State.saveGame();
        return { ok:true, msg:`Exhausting but worth it. GPA now ${edu.gpa.toFixed(2)}.` };
      }
      case 'college_party': {
        State.applyEffects({ happiness: 18, health:-3 });
        const metSomeone = Math.random() < 0.35 && !State.getPartner() && c.sexuality !== 'asexual';
        if (metSomeone) {
          const gen = DATA.getAttractedGender(c.gender, c.sexuality) || (c.gender==='male'?'female':'male');
          const nm = DATA.randomName(gen);
          State.addRelationship({ name:nm.full, type:'partner', subtype:'crush', age:c.age+Math.floor(Math.random()*3)-1, relationship:45, traits:DATA.randomTraits(2), status:'active' });
          State.addLog(c.age, `Wild college party! Met ${nm.full}.`, 'activity');
          State.saveGame();
          return { ok:true, msg:`Great party — and you met someone: ${nm.full}!` };
        }
        State.addLog(c.age, 'Wild college party! Great night.', 'activity');
        State.saveGame();
        return { ok:true, msg:'Wild night. Happiness way up, health a bit down.' };
      }
      case 'study_group': {
        edu.gpa = Math.min(4.0, +(((edu.gpa||2.5) + 0.1).toFixed(2)));
        State.applyEffects({ happiness: 5 });
        const nm = DATA.randomName(Math.random()<0.5?'female':'male');
        if (Math.random() < 0.25) {
          State.addRelationship({ name:nm.full, type:'friend', subtype:'friend', age:c.age+Math.floor(Math.random()*3)-1, relationship:45, traits:DATA.randomTraits(2), status:'active' });
          State.addLog(c.age, `Study group. GPA up. Made a friend: ${nm.full}.`, 'edu');
          State.saveGame();
          return { ok:true, msg:`Studied in a group. GPA now ${edu.gpa.toFixed(2)} and made a new friend!` };
        }
        State.addLog(c.age, `Study group. GPA up to ${edu.gpa.toFixed(2)}.`, 'edu');
        State.saveGame();
        return { ok:true, msg:`Study group paid off. GPA now ${edu.gpa.toFixed(2)}.` };
      }
      default: return { ok:false, msg:'Unknown action.' };
    }
  }

  // ── Cheating ──────────────────────────────────────────────────
  function cheatOnPartner() {
    const g = State.get(); const c = g.character;
    const partner = g.relationships.find(r => r.type==='partner' && r.status==='active');
    if (!partner) return { ok:false, msg:'No partner to cheat on.' };
    if (!hasEnergy()) return { ok:false, msg:'No energy left. Age up to rest.' };
    spendEnergy();
    const caughtChance = 0.35;
    const caught = Math.random() < caughtChance;
    const gen = DATA.getAttractedGender(c.gender, c.sexuality) || (c.gender==='male'?'female':'male');
    const nm = DATA.randomName(gen);
    c.cheatedCount = (c.cheatedCount || 0) + 1;
    if (caught) {
      partner.relationship = Math.max(0, partner.relationship - 40);
      State.applyEffects({ happiness:-15, mentalHealth:-10 });
      if (partner.relationship < 20) {
        _applyDivorceSettlement(c, partner);
        partner.status='divorced'; partner.type='ex';
        State.addLog(c.age, `Cheated with ${nm.full} and got caught. ${partner.name} left you.`, 'bad');
        State.saveGame();
        return { ok:true, caught:true, divorced:true, msg:`Caught cheating! ${partner.name} found out and left you.` };
      }
      State.addLog(c.age, `Cheated with ${nm.full}. Got caught — relationship badly damaged.`, 'bad');
      State.saveGame();
      return { ok:true, caught:true, msg:`Caught! ${partner.name} is furious. Relationship tanked.` };
    }
    State.applyEffects({ happiness: 10 });
    State.addLog(c.age, `Had an affair with ${nm.full}. Got away with it... for now.`, 'event');
    State.saveGame();
    return { ok:true, caught:false, msg:`Secret affair with ${nm.full}. Nobody knows... yet.` };
  }

  // ── Business / Startup ────────────────────────────────────────
  const STARTUP_TYPES = [
    { id:'tech',    label:'Tech Startup',       minInvest:20000,  risk:0.55, multWin:4.0, multLose:0.1 },
    { id:'food',    label:'Restaurant / Café',  minInvest:15000,  risk:0.45, multWin:2.5, multLose:0.3 },
    { id:'retail',  label:'Retail Store',       minInvest:8000,   risk:0.40, multWin:2.0, multLose:0.4 },
    { id:'online',  label:'Online Business',    minInvest:2000,   risk:0.50, multWin:3.0, multLose:0.2 },
    { id:'realestate', label:'Real Estate Flip',minInvest:30000,  risk:0.45, multWin:2.0, multLose:0.5 },
  ];

  function launchStartup(typeId, investAmount) {
    const c = State.getChar();
    const biz = STARTUP_TYPES.find(b => b.id === typeId);
    if (!biz) return { ok:false, msg:'Unknown business type.' };
    if (c.activeStartup) return { ok:false, msg:'Already running a startup. Wait for it to resolve.' };
    if (investAmount < biz.minInvest) return { ok:false, msg:`Minimum investment: ${DATA.fmtMoney(biz.minInvest)}.` };
    if (c.money < investAmount) return { ok:false, msg:'Not enough money.' };
    c.money -= investAmount;
    c.activeStartup = { typeId, label:biz.label, invested:investAmount, yearsRunning:0 };
    State.addLog(c.age, `Launched ${biz.label} with ${DATA.fmtMoney(investAmount)} investment.`, 'career');
    State.saveGame();
    return { ok:true, msg:`${biz.label} launched! Results in 2–4 years.` };
  }

  function processStartup(c) {
    if (!c.activeStartup) return;
    c.activeStartup.yearsRunning++;
    const biz = STARTUP_TYPES.find(b => b.id === c.activeStartup.typeId);
    if (!biz) { c.activeStartup = null; return; }
    if (c.activeStartup.yearsRunning < 2) return; // minimum 2 years
    const resolveChance = c.activeStartup.yearsRunning >= 4 ? 0.7 : 0.35;
    if (Math.random() > resolveChance) return;
    const success = Math.random() > biz.risk;
    const invested = c.activeStartup.invested;
    const mult = success ? biz.multWin : biz.multLose;
    const payout = Math.round(invested * mult);
    c.money += payout;
    const profit = payout - invested;
    c.activeStartup = null;
    if (success) {
      State.applyEffects({ happiness:20 });
      State.addLog(c.age, `${biz.label} took off! Earned ${DATA.fmtMoney(payout)} (profit: ${DATA.fmtMoney(profit)}).`, 'good');
      UI.showToast(`Business success! +${DATA.fmtMoney(profit)} profit.`, 'good');
    } else {
      State.applyEffects({ happiness:-15 });
      State.addLog(c.age, `${biz.label} failed. Recovered only ${DATA.fmtMoney(payout)} of ${DATA.fmtMoney(invested)}.`, 'bad');
      UI.showToast(`Business failed. Lost ${DATA.fmtMoney(invested - payout)}.`, 'bad');
    }
  }

  // ── Crime ─────────────────────────────────────────────────────
  const CRIMES = {
    petty_theft:    { label:'Petty Theft',     minAge:16, reward:[100,800],   jailChance:0.12, jailYears:1, bail:500   },
    shoplifting:    { label:'Shoplifting',      minAge:14, reward:[20,200],    jailChance:0.08, jailYears:1, bail:200   },
    fraud:          { label:'Fraud',            minAge:18, reward:[3000,15000],jailChance:0.22, jailYears:3, bail:5000  },
    money_launder:  { label:'Money Laundering', minAge:21, reward:[10000,50000],jailChance:0.30, jailYears:5, bail:20000 },
    drug_dealing:   { label:'Drug Dealing',     minAge:16, reward:[500,3000],  jailChance:0.25, jailYears:2, bail:3000  },
  };

  function commitCrime(crimeId) {
    const g = State.get(); const c = g.character;
    const crime = CRIMES[crimeId];
    if (!crime) return { ok:false, msg:'Unknown crime.' };
    if (c.age < crime.minAge) return { ok:false, msg:`Must be ${crime.minAge}+.` };
    if (c.inJail) return { ok:false, msg:'Already in jail.' };
    if (!hasEnergy()) return { ok:false, msg:'No energy left.' };
    spendEnergy();
    if (Math.random() < crime.jailChance) {
      c.inJail = true;
      c.jailYearsLeft = crime.jailYears;
      c.jailBail = crime.bail;
      // Lose job
      if (c.career.jobId) quitJob(true);
      State.applyEffects({ happiness:-25, mentalHealth:-15 });
      State.addLog(c.age, `Arrested for ${crime.label}! Sentenced to ${crime.jailYears} year(s).`, 'bad');
      UI.showToast(`Busted! Arrested for ${crime.label}.`, 'bad');
      State.saveGame();
      return { ok:true, arrested:true, msg:`Arrested! ${crime.jailYears} year sentence.` };
    }
    const reward = crime.reward[0] + Math.floor(Math.random() * (crime.reward[1] - crime.reward[0]));
    c.money += reward;
    c.criminalRecord = true;
    State.applyEffects({ happiness: 8 });
    State.addLog(c.age, `${crime.label}: got away with ${DATA.fmtMoney(reward)}.`, 'event');
    State.saveGame();
    return { ok:true, arrested:false, msg:`Got away with it. +${DATA.fmtMoney(reward)}.` };
  }

  function payBail() {
    const c = State.getChar();
    if (!c.inJail) return { ok:false, msg:'Not in jail.' };
    if (c.money < c.jailBail) return { ok:false, msg:`Bail is ${DATA.fmtMoney(c.jailBail)}.` };
    c.money -= c.jailBail;
    c.inJail = false; c.jailYearsLeft = 0;
    State.addLog(c.age, `Paid bail (${DATA.fmtMoney(c.jailBail)}) and released.`, 'event');
    State.saveGame();
    return { ok:true, msg:'Bailed out. Back on the streets.' };
  }

  function processJail(c) {
    if (!c.inJail) return;
    State.applyEffects({ happiness:-10, mentalHealth:-8 });
    c.jailYearsLeft--;
    if (c.jailYearsLeft <= 0) {
      c.inJail = false;
      c.criminalRecord = true;
      State.addLog(c.age, 'Released from jail. Criminal record follows you.', 'event');
      UI.showToast('Released from jail.', 'info');
    }
  }

  // ── Fame perks & problems ─────────────────────────────────────
  function checkFameEvents(c, g) {
    const fame = c.fame || 0;
    if (fame < 40) return;
    const roll = Math.random();
    if (fame >= 60 && roll < 0.12) {
      // Perk: free VIP access / gift
      const bonus = Math.round(500 + Math.random() * 2000);
      c.money += bonus;
      State.applyEffects({ happiness:10 });
      State.addLog(c.age, `VIP perks of fame: received freebies worth ${DATA.fmtMoney(bonus)}.`, 'good');
      return;
    }
    if (fame >= 50 && roll < 0.22) {
      // Problem: tabloid scandal
      const effects = Math.random() < 0.5;
      if (effects) {
        State.applyEffects({ happiness:-12, mentalHealth:-8 });
        c.fame = Math.max(0, c.fame - 8);
        State.addLog(c.age, 'Tabloid scandal! Fake rumours everywhere. Fame took a hit.', 'bad');
        UI.showToast('Tabloid scandal! Mental health and fame hit.', 'bad');
      } else {
        c.fame = Math.min(100, c.fame + 5);
        State.addLog(c.age, 'Tabloid story — any publicity is good publicity. Fame up!', 'event');
      }
      return;
    }
    if (fame >= 70 && roll < 0.30) {
      // Problem: paparazzi / stalker
      State.applyEffects({ happiness:-8, mentalHealth:-10 });
      State.addLog(c.age, 'Paparazzi won\'t leave you alone. Privacy gone, mental health hit.', 'bad');
    }
  }

  // ── Aging parent care ─────────────────────────────────────────
  function careForParent(relId) {
    const g = State.get(); const c = g.character;
    const parent = g.relationships.find(r => r.id === relId && (r.subtype==='father'||r.subtype==='mother') && r.status==='active');
    if (!parent) return { ok:false, msg:'Parent not found.' };
    if (parent.age < 70) return { ok:false, msg:`${parent.name} is not elderly yet.` };
    const cost = parent.age >= 85 ? 12000 : 6000;
    if (c.money < cost) return { ok:false, msg:`Care costs ${DATA.fmtMoney(cost)}/year.` };
    c.money -= cost;
    parent.relationship = Math.min(100, parent.relationship + 15);
    parent.caredFor = true;
    State.applyEffects({ happiness: 10, mentalHealth: 5 });
    State.addLog(c.age, `Arranged care for ${parent.name}. Bond deepened.`, 'rel');
    State.saveGame();
    return { ok:true, msg:`${parent.name} is cared for. Bond strengthened.` };
  }

  // ── Will / estate planning ────────────────────────────────────
  const WILL_OPTIONS = [
    { id:'family',   label:'Leave everything to family',   desc:'Assets split among spouse & children', legacyBonus:60 },
    { id:'charity',  label:'Donate to charity',            desc:'Most assets go to charity', legacyBonus:100 },
    { id:'children', label:'Leave to children only',       desc:'Children each inherit equally', legacyBonus:50 },
    { id:'spouse',   label:'Leave everything to spouse',   desc:'Spouse inherits all assets', legacyBonus:40 },
    { id:'trust',    label:'Set up a trust fund',          desc:'Wealth preserved across generations +big legacy bonus', legacyBonus:150 },
  ];

  function writeWill(optionId) {
    const c = State.getChar();
    if (c.age < 30) return { ok:false, msg:'A bit early to write a will. Come back at 30+.' };
    const opt = WILL_OPTIONS.find(w => w.id === optionId);
    if (!opt) return { ok:false, msg:'Unknown will option.' };
    c.will = { optionId, label:opt.label, legacyBonus:opt.legacyBonus };
    State.addLog(c.age, `Wrote a will: ${opt.label}.`, 'activity');
    State.saveGame();
    return { ok:true, msg:`Will written: ${opt.label}.` };
  }

  // ── Divorce settlement ────────────────────────────────────────
  function _applyDivorceSettlement(c, spouse) {
    const rel = spouse.relationship || 50;
    // Higher relationship = more amicable = keep more; messy divorce = lose half
    const keepFraction = rel >= 70 ? 0.75 : rel >= 40 ? 0.55 : 0.4;
    const spousePool = (spouse.money || 0) + (spouse.investments || 0);
    // Player pays out a share of combined cash to spouse (or gains from rich spouse)
    const combined = c.money + spousePool;
    const playerShare = Math.round(combined * keepFraction);
    const lost = c.money - playerShare;
    c.money = Math.max(0, playerShare);
    const settlementDesc = lost > 0
      ? `Settlement: paid ${DATA.fmtMoney(Math.abs(lost))} to ${spouse.name}.`
      : `Settlement: received ${DATA.fmtMoney(Math.abs(lost))} from ${spouse.name}.`;
    State.addLog(c.age, settlementDesc, 'bad');
    UI.showToast(settlementDesc, lost > 0 ? 'bad' : 'info');
    // Lose a house if messy divorce
    if (rel < 40 && c.assets.houses.length > 0) {
      const lost_house = c.assets.houses.splice(0, 1)[0];
      State.addLog(c.age, `Lost ${lost_house.name} in the divorce.`, 'bad');
    }
    triggerMood('heartbroken', 4);
  }

  // ── Negotiate salary ──────────────────────────────────────────
  function negotiateSalary() {
    const c = State.getChar();
    if (!c.career.jobId) return { ok:false, msg:'You need a job first.' };
    if (c.career.retired) return { ok:false, msg:'You are retired.' };
    if (c.negotiatedThisYear) return { ok:false, msg:'Already negotiated this year.' };
    c.negotiatedThisYear = true;
    const perf = c.career.performance;
    const chance = perf >= 80 ? 0.7 : perf >= 60 ? 0.45 : 0.2;
    if (Math.random() < chance) {
      const raise = Math.round(c.career.salary * (0.05 + Math.random() * 0.1));
      c.career.salary += raise;
      State.applyEffects({ happiness: 8 });
      State.addLog(c.age, `Negotiated a raise: +${DATA.fmtMoney(raise)}/yr. New salary: ${DATA.fmtMoney(c.career.salary)}.`, 'career');
      State.saveGame();
      return { ok:true, msg:`Raise approved! +${DATA.fmtMoney(raise)}/yr.` };
    } else {
      State.applyEffects({ happiness:-5 });
      // Risky: if perf very low, boss gets annoyed
      const annoyed = perf < 40 && Math.random() < 0.3;
      if (annoyed) c.career.performance = Math.max(0, c.career.performance - 10);
      State.addLog(c.age, 'Requested a raise — denied.', 'career');
      State.saveGame();
      return { ok:false, msg: annoyed ? 'Denied — and the boss is irritated.' : 'Request denied. Keep performing well and try again.' };
    }
  }

  // ── Anniversary events ────────────────────────────────────────
  function checkAnniversary(c, g) {
    const spouse = g.relationships.find(r => r.subtype === 'spouse' && r.status === 'active');
    if (!spouse || !spouse.marriedAge) return;
    const years = c.age - spouse.marriedAge;
    const milestones = { 1:'1st', 5:'5th', 10:'10th', 25:'25th', 50:'50th' };
    if (!milestones[years]) return;
    const label = milestones[years];
    const happBoost = years >= 25 ? 20 : years >= 10 ? 15 : 10;
    State.applyEffects({ happiness: happBoost });
    State.addLog(c.age, `${label} wedding anniversary with ${spouse.name}! Celebrated together.`, 'rel');
    UI.showToast(`Happy ${label} anniversary with ${spouse.name}!`, 'good');
    triggerMood('in_love', 3);
  }

  // ── Midlife crisis ────────────────────────────────────────────
  function checkMidlifeCrisis(c) {
    if (c.hadMidlifeCrisis) return;
    if (c.age < 40 || c.age > 55) return;
    if (c.happiness > 65) return; // only triggers if not super happy
    if (Math.random() > 0.25) return;
    c.hadMidlifeCrisis = true;
    const outcomes = [
      { msg:'You buy a flashy sports car on impulse.', money:-25000, happiness:15, addCar:{ name:'Sports Car', value:22000 } },
      { msg:'You quit your job to "find yourself."', fireSelf:true, happiness:10, mentalHealth:5 },
      { msg:'You book an extravagant solo trip around the world.', money:-8000, happiness:20 },
      { msg:'You start an impulsive new hobby and blow your savings on equipment.', money:-3000, happiness:12 },
      { msg:'You dye your hair, get a tattoo, and reinvent your look.', happiness:18, tattoo:true },
    ];
    const o = DATA.randomFrom(outcomes);
    if (o.money) c.money = Math.max(0, c.money + o.money);
    if (o.fireSelf && c.career.jobId) quitJob(false);
    if (o.addCar) c.assets.cars.push(o.addCar);
    if (o.tattoo) c.tattoos = (c.tattoos || 0) + 1;
    State.applyEffects({ happiness: o.happiness || 0, mentalHealth: o.mentalHealth || 0 });
    State.addLog(c.age, `Midlife crisis! ${o.msg}`, 'event');
    UI.showToast(`Midlife crisis: ${o.msg}`, 'info');
    triggerMood('anxious', 2);
  }

  // ── Life goal ─────────────────────────────────────────────────
  const LIFE_GOALS = [
    { id:'rich',      label:'Get Rich',         desc:'Accumulate $1M+ net worth',         check: (c,g) => Engine.getNetWorth(c) >= 1000000 },
    { id:'family',    label:'Build a Family',   desc:'Marry and have 3+ children',        check: (c,g) => g.relationships.some(r=>r.subtype==='spouse'&&r.status==='active') && g.relationships.filter(r=>r.subtype==='child').length >= 3 },
    { id:'career',    label:'Reach the Top',    desc:'Reach the top promotion in any job',check: (c,g) => { const car=DATA.getCareer(c.career.jobId||''); return car && c.career.promotionLevel===car.promotions.length-1; } },
    { id:'educated',  label:'Scholar',          desc:'Earn a doctorate',                  check: (c,g) => c.education.level==='doctorate' },
    { id:'travel',    label:'World Traveler',   desc:'Visit 10+ countries',               check: (c,g) => (c.travelStamps||[]).length >= 10 },
    { id:'famous',    label:'Fame & Glory',     desc:'Reach 80+ fame',                    check: (c,g) => c.fame >= 80 },
    { id:'happy',     label:'Simple Happiness', desc:'Maintain 80+ happiness at age 60+', check: (c,g) => c.age >= 60 && c.happiness >= 80 },
  ];

  function setLifeGoal(goalId) {
    const c = State.getChar();
    if (!LIFE_GOALS.find(g => g.id === goalId)) return { ok:false, msg:'Unknown goal.' };
    c.lifeGoal = goalId;
    const goal = LIFE_GOALS.find(g => g.id === goalId);
    State.addLog(c.age, `Set your life goal: ${goal.label} — ${goal.desc}`, 'activity');
    State.saveGame();
    return { ok:true, msg:`Life goal set: ${goal.label}!` };
  }

  function checkLifeGoal(c, g) {
    if (!c.lifeGoal || c.lifeGoalCompleted) return;
    const goal = LIFE_GOALS.find(gl => gl.id === c.lifeGoal);
    if (!goal) return;
    try {
      if (goal.check(c, g)) {
        c.lifeGoalCompleted = true;
        State.applyEffects({ happiness: 25 });
        State.addLog(c.age, `Life goal achieved: ${goal.label}! A dream fulfilled.`, 'good');
        UI.showToast(`Life goal achieved: ${goal.label}!`, 'good');
        triggerMood('content', 5);
      }
    } catch(e) {}
  }

  return {
    createCharacter, ageUp, applyEventChoice,
    applyJob, quitJob, workHard, slackOff, negotiateSalary,
    enrollUniversity, enrollTrade, requestScholarship, askParentsForMoney,
    setLifeGoal, LIFE_GOALS,
    buyHouse, sellHouse, buyCar, sellCar, invest, casino,
    relationshipAction, planWedding, askFriendOut, planChild,
    doActivity, buyItem, goParty, useSubstance, seekRehab, childAction, SUBSTANCES,
    startTherapy, stopTherapy, collegeAction, cheatOnPartner,
    launchStartup, STARTUP_TYPES, commitCrime, payBail, CRIMES,
    careForParent, writeWill, WILL_OPTIONS,
    SUBSCRIPTIONS, toggleSubscription,
    getTaxInfo, takeLoan, healthCare, manageInsurance,
    removeTattoo, writeMemoirAction, setBestFriend, ghostPerson,
    toggleRental, enlistMilitary, doPrisonActivity,
    getHoroscope, ZODIAC,
    startHobby, practiceHobby,
    joinExtracurricular, participateExtracurricular,
    socializeAtSchool, meetRomanticInterest,
    studyHard, skipClass, kissUpTeacher, flirtWithClassmate,
    cramAllNight, seduceProfessor, cheatOnExam,
    adoptPet, vetPet, playWithPet,
    doSocialMedia, doSideHustle, travel,
    triggerMood, manageCondition,
    addToCircle, removeFromCircle, groupHangout, familyHangout, groupTrip,
    browseOnlineDating, connectWithMatch,
    changeStyle, getTattoo,
    depositSavings, withdrawSavings, payDebt,
    setBucketGoals, checkBucketList,
    getEnergyMax, hasEnergy, spendEnergy,
    getLegacyInfo, saveLegacy, loadLegacy, getLegacyBonuses,
    getLifeSummary, getNetWorth, checkPromotion,
  };
})();
