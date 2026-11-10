/* The Elder Scrolls: Betrayal of the Second Era — inoffizieller True-Solo-Tagesassistent.
   Quelle: Offizielle deutsche Anleitung V1.0 (98 Seiten), unterstützende Checkliste, keine Spielregel-Engine.
   Offlinefähige PWA ohne externe Bibliotheken und ohne Datentransfer. */
(() => {
  'use strict';
  const KEY = 'second-era-rundenplan-v1';
  const STORAGE_VERSION = 5;
  const PHASES = [
    ['morgen','Morgen'],['provinz','Provinz'],['begegnung','Begegnung'],
    ['belohnung','Belohnung'],['abend','Abend']
  ];
  const ENCOUNTERS = [
    ['gildenquest','Gildenquest-Begegnung'],['nebenquest','Nebenquest-Begegnung'],['stadt','Stadtbegegnung'],
    ['friedlich','Friedlicher Ort'],['konfliktreich','Konfliktreicher Ort'],['riskant','Riskanter Ort'],['leer','Keine Begegnung']
  ];
  const BATTLE_PREP = [
    ['bprep1','Begegnung und Schlachtziel (Besiegt alle / Ziel-Einheit / Durchsuchen / Aufklärung / Speziell) sowie Sonderregeln lesen.'],
    ['bprep2','Schlachtkarte vorbereiten (Scharmützel / Gewölbe / Verlies): Matten, Eingang/Start-Matte, Gelände und Sonderregeln nach Vorgabe.'],
    ['bprep3','Kisten, Fallen, Marker und ggf. Quest-Einheiten nach Aufbauvorgabe bereitlegen.'],
    ['bprep4','Bei Scharmützel und Verlies: Gesamtstufe (KS) und Gegnerstapel (GS) nach Aufbauvorgabe ermitteln; Gegner platzieren. Gewölbe: später beim Erkunden.'],
    ['bprep5','Abenteurer mit aktuellen LP auf freiem Feld der Start-Matte platzieren und Kampfform wählen; danach Gefährten platzieren.'],
    ['bprep6','Rundenzähler auf 1 stellen; Effekte „zu Beginn der Schlacht“ und deren Zeitpunkt prüfen.']
  ].map(([id,txt])=>T(id,txt));
  const SKILL_TASKS = [
    ['skill1','1. Ermüdung: ab der zweiten Aktivierung je 1 Ermüdung (auf Experte 2).'],
    ['skill2','2. Kampfform wählen; Schwert-Pin setzen, mögliche Formwechsel-Effekte beachten.'],
    ['skill3','3. Ziel wählen (optional): in Reichweite und Sichtweite, normalerweise eine Einheit.'],
    ['skill4','4. Verfügbare passende Fertigkeitswürfel wählen und werfen; Grenzen für Ausdauer/Magicka getrennt, ggf. 1 passender Gegenstand.'],
    ['skill5','5. Würfel nutzen: Ergebnisse ggf. anpassen; gewählte Effekte in Reihenfolge ausführen, Schaden gemeinsam zufügen, Würfel ablegen/erschöpfen.'],
    ['skill6','6. Reaktionen der Einheiten durch diese Aktivierung vollständig auslösen.']
  ];
  const CITY_ACTIONS = [
    ['','Keine / noch nicht festgelegt'],['laden','Laden'],['lehrer','Lehrer'],
    ['gasthaus','Gasthaus'],['questtafel','Quest-Tafel'],['gildenkiosk','Gildenkiosk'],
    ['marktplatz','Marktplatz (1× je Abenteurer/Begegnung)'],['alchemietisch','Alchemietisch']
  ];
  const OLD_CITY = {haendler:'laden',ausbilder:'lehrer',anschlagbrett:'questtafel',stadtplatz:'marktplatz',alchemie:'alchemietisch'};
  const CHEST_STEPS = [
    T('ch1','Zahlenschloss vom Gegenstand oder Begegnungstext prüfen: Ziffern, max. Versuche und ggf. Schlüsselziffer.'),
    T('ch2','1. Würfeln: im ersten Versuch alle drei Dietrich-Würfel; danach nur nicht beiseitegelegte Würfel (Schlüsselziffer-Würfel erneut verwendbar).'),
    T('ch3','2. Ergebnisse anpassen: jede Erhöhung/Verringerung um 1 kostet 1 Ermüdung; 6 ↔ 1 kostet 5 Ermüdung.'),
    T('ch4','3. Versuch werten: Schlüsselziffer zuerst sichern; weitere passende Würfel beiseitelegen; jeder Würfel deckt nur eine Ziffer ab.'),
    T('ch5','Prüfen: alle geforderten Ziffern erreicht oder weiterer Versuch erlaubt? Bei letzter Chance Erfolg/Misserfolg festhalten.')
  ];
  const BATTLE_CLEAN = [
    ['bclean1','Schlacht endet nach Rundenende. Prüfreihenfolge: (1) alle Abenteurer besiegt, (2) Schlachtziel erreicht, (3) Rückzug. Aufklärung: Rückzug nach erforderlichen Himmelsscherben.'],
    ['bclean2','Bonus-LP und überschüssige LP entfernen; Abenteurer mit verbleibenden LP auf Volk-Bogen zurücklegen.'],
    ['bclean3','Gefährten nach Vorgabe zurücklegen; Zustände und überschüssige LP entfernen.'],
    ['bclean4','Alle Würfel in Aktiv-Slots erschöpfen und kraftlose Würfel erholen; erschöpfte Würfel bleiben in der Erschöpfungsleiste.'],
    ['bclean5','Gegner-Chips, Kisten und Matten in Vorrat; bei Gewölben Erkundungskarten mit -SP-Kennung getrennt behandeln.'],
    ['bclean6','Ggf. Kisten/Schlossknacken/Fallen und besondere Auswirkungen der Begegnung nachhalten.']
  ].map(([id,txt])=>T(id,txt));
  const DEFAULT = () => ({
    version: STORAGE_VERSION,
    session: 1, day: 1, difficulty: 'adept', completedDays: 0, startMode:'regulaer',
    phase: 'morgen', encounter: 'stadt', provinceScreen: 'encounter', encounterSelectionMade: true, fightDecision: '', riskOutcome: '', social: false, dungeon: 'scharmuetzel', battleGoal:'besiegt_alle',
    questCompleted: false, questFailed:false, forceBattle: false, battleDone: false, battleMode: 'setup', battleRound: 1,
    battleSkill: false, skillUses: 0, battleOutcome: '', dayChecks: {}, battleChecks: {},
    groupXP: 2, freeXP: 0, bonusXP: 0, focus: 0, focusMax: '', pendingFocus: 0,
    cityActions: ['', ''], freeCityAction:false, riskFocusGranted: false, exploring: false, friedlicheKarteHeute:false, shardCount:0, shardTarget:3, shardAlive:true, awardedShardXP:0,
    chestAttempt: 1, chestMaxAttempts:3, chestKind:'gewoehnlich', chestChecks: {}, chestOutcome: '', chestFinished: false,
    guildAssistUsed: false, notes: '', history: []
  });
  const validPhases = new Set([...PHASES.map(x => x[0]),'sitzungsende','frist','verloren','fertig']);
  function load(){
    try{
      const raw = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (!raw || ![2,3,4,5].includes(raw.version)) return DEFAULT();
      const d = DEFAULT();
      const copy = Object.assign(d,raw);
      if(raw.version<4){
        // Legacy saves: preserve the encounter and the selected battle branch.
        copy.provinceScreen = 'encounter';
        copy.encounterSelectionMade = true;
        copy.fightDecision = (raw.forceBattle || raw.encounter==='scharmuetzel' || (raw.encounter==='quest'&&raw.dungeon!=='none') || (raw.encounter==='riskant'&&raw.riskOutcome==='scharmuetzel'))?'ja':'nein';
      }
      if(raw.version<5){
        const mapping={quest:'gildenquest',scharmuetzel:'konfliktreich'};copy.encounter=mapping[copy.encounter]||copy.encounter;
        copy.riskOutcome={scharmuetzel:'konfliktreich',karawane:'haendler'}[copy.riskOutcome]||copy.riskOutcome;
        copy.dungeon={none:'scharmuetzel',battle:'scharmuetzel',explore:'gewoelbe',fixed:'verlies'}[copy.dungeon]||'scharmuetzel';
        copy.cityActions=Array.isArray(copy.cityActions)?copy.cityActions.map(x=>OLD_CITY[x]||x):['',''];
        if(copy.phase==='frist')copy.phase='verloren';
      }
      if(!['encounter','combat'].includes(copy.provinceScreen)) copy.provinceScreen='encounter';
      if(!['ja','nein',''].includes(copy.fightDecision)) copy.fightDecision='';
      copy.encounterSelectionMade=!!copy.encounterSelectionMade;
      if (!validPhases.has(copy.phase)) copy.phase = 'morgen';
      if (!copy.dayChecks || typeof copy.dayChecks !== 'object') copy.dayChecks = {};
      if (!copy.battleChecks || typeof copy.battleChecks !== 'object') copy.battleChecks = {};
      if (!copy.chestChecks || typeof copy.chestChecks !== 'object') copy.chestChecks = {};
      if (!Array.isArray(copy.cityActions)) copy.cityActions=['',''];
      copy.cityActions=[String(copy.cityActions[0]||''),String(copy.cityActions[1]||'')];
      for(const key of ['groupXP','freeXP','bonusXP','focus','pendingFocus','completedDays']){
        copy[key]=Number.isSafeInteger(copy[key])&&copy[key]>=0?Math.min(999999,copy[key]):0;
      }
      copy.session=Math.min(3,Math.max(1,Number(copy.session)||1));
      copy.day=Math.min(999,Math.max(1,Number(copy.day)||1));
      copy.battleRound=Math.min(6,Math.max(1,Number(copy.battleRound)||1));
      copy.chestAttempt=Math.min(999,Math.max(1,Number(copy.chestAttempt)||1));
      copy.chestMaxAttempts=Math.min(99,Math.max(1,Number(copy.chestMaxAttempts)||3));
      copy.shardCount=Math.min(999,Math.max(0,Number(copy.shardCount)||0));
      copy.shardTarget=Math.min(999,Math.max(1,Number(copy.shardTarget)||3));
      copy.awardedShardXP=Math.min(999,Math.max(0,Number(copy.awardedShardXP)||0));
      if(copy.session===3&&copy.phase==='verloren')copy.questFailed=true;
      copy.notes=String(copy.notes||'').slice(0,50000);
      copy.version=STORAGE_VERSION;
      if (!Array.isArray(copy.history)) copy.history = [];
      copy.history = copy.history.slice(0,40);
      return copy;
    }catch(e){return DEFAULT();}
  }
  let s = load();
  let tab = 'ablauf';
  let toastTimer = null;
  let resetTimer = null;
  const $ = (q) => document.querySelector(q);
  const esc = (x) => String(x ?? '').replace(/[&<>"']/g,c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function save(){try{localStorage.setItem(KEY,JSON.stringify(s));}catch(e){showToast('Speichern ist in diesem Browser nicht möglich.');}}
  function record(msg){s.history.unshift({at: new Date().toLocaleString('de-DE'),msg});s.history=s.history.slice(0,40);}
  function showToast(msg){
    const e=$('#toast'); if(!e) return;
    e.textContent=msg; e.hidden=false;
    if(toastTimer) clearTimeout(toastTimer);
    toastTimer=setTimeout(()=>{e.hidden=true},3200);
  }
  
  function T(id,txt,auto=false){return {id,txt,auto};}
  function isFinal(){return s.session === 3;}
  function isFirstCity(){return s.day === 1 && !isFinal();}
  function isCityEncounter(){return s.encounter==='stadt'||(s.encounter==='riskant'&&s.riskOutcome==='haendler');}
  function peacefulCardDrawn(){return s.encounter==='friedlich'||(s.encounter==='riskant'&&s.riskOutcome==='friedlich')||s.friedlicheKarteHeute;}
  function battleSetupTasks(){
    return [...BATTLE_PREP,
      ...(s.dungeon==='gewoelbe'?[T('bex','Gewölbe: zunächst nur Start-Matte auslegen. Weitere Matten, Gegner und Kisten folgen durch Erkunden.')]:[]),
      ...(s.dungeon==='verlies'?[T('bfix','Verlies: gesamten Plan und Gegner entsprechend der Gazette aufbauen; Aufbausymbole der Begegnung haben Vorrang.')]:[])];
  }
  function currentCityName(i){return (CITY_ACTIONS.find(a=>a[0]===s.cityActions[i])||CITY_ACTIONS[0])[1];}
  function battleNeeded(){return s.fightDecision==='ja';}
  function actualEncounter(){return s.encounter==='riskant'?s.riskOutcome:s.encounter;}
  function dayTasks(){
    switch(s.phase){
    case 'morgen':return [
      T('m1',s.day===1?'Tag 1: Tageszähler steht seit dem Aufbau auf 1 – in der ersten Morgenphase nicht erhöhen.':`Tageszähler auf ${s.day} einstellen (aus Tag ${s.day-1} um 1 erhöhen).`),
      ...(!isFinal()?[T('m2',`Gildenquest muss bis zum Ende von Tag 12 abgeschlossen sein.${s.day===12?' Heute letzte Gelegenheit!':''}`)]:[T('m2','Finale: Tagesgrenze und Begegnung der Gazette folgen (nicht auf 12 Tage beschränkt).')])];
    case 'provinz':return [
      T('p1','1. Beginn der Phase: alle Effekte „zu Beginn der Provinzphase“ auslösen.'),
      T('p2',isFinal()?'2. Finale: Gruppe nicht über Provinzkarte bewegen; nächste Finale-Begegnung der Gazette auswählen.':isFirstCity()?'2. Tag 1: am Startort bleiben. Keine Bewegung auf der Provinzkarte.':'2. Gruppe bewegen: Bewegungswert normalerweise 3, Provinzeffekte beachten.'),
      ...(!isFinal()&&!isFirstCity()?[T('p3','Erschöpfende Bewegung: je Zusatzfeld 1 Ermüdung, max. so viele Zusatzfelder wie Bewegungswert; bei voller Erschöpfungsleiste stoppen.')]:[]),
      T('p4','3. Begegnung starten: erste zutreffende Option der Hierarchie wählen; maximal eine Begegnung pro Tag.')];
    case 'begegnung':{
      if(s.encounter==='leer')return [T('e0','Keine Begegnung: Begegnungsphase überspringen, Belohnungsphase findet trotzdem statt.')];
      const arr=[T('e1','Begegnung nach Gazette oder Begegnungskarte lesen und genau eine zulässige Option wählen. Prüfe Ausgang: Friedlich oder Schlacht.')];
      if(['gildenquest','nebenquest'].includes(s.encounter))arr.push(T('eq','Quest-Abschnitt / Nebenquest prüfen; spezielle Regeln und Auswirkungen des Ausgangs beachten.'));
      if(isCityEncounter())arr.push(
        T('ec1','1. Stadteffekt der Gazette lesen; Zeitpunkt und passive Effekte beachten.'),
        T('ec2','2. Laden und Lehrer (sofern geöffnet) auslegen; bei Lehrern unpassende Konstellationen ersetzen.'),
        T('ec3','3. Abschließbare Nebenquests vor den Stadtaktionen erfüllen und belohnen.'),
        T('ec4','4. Bis zu 2 reguläre Stadtaktionen; freie Stadtaktionen kosten keinen Aktionsplatz.'),
        ...(s.freeCityAction?[T('ecfree','Zusätzliche freie Stadtaktion laut Gazette/Karte durchgeführt (ohne regulären Aktionsplatz).')]:[]),
        ...s.cityActions.flatMap((v,i)=>v?[T('ecaction'+i,`Stadtaktion ${i+1}: ${currentCityName(i)} durchgeführt.`)]:[]),
        T('ec5','Stadtbegegnung beenden: übrige Fertigkeitslinien zurück in den Beutel und Gegenstände abwerfen.'));
      if(s.encounter==='friedlich'||(s.encounter==='riskant'&&s.riskOutcome==='friedlich'))arr.push(T('ep','Friedliche Begegnungskarte aufbewahren: Provinzsymbol ist für die Abendphase nötig.'));
      if(s.encounter==='konfliktreich'||(s.encounter==='riskant'&&s.riskOutcome==='konfliktreich'))arr.push(T('es','Konfliktreiche Begegnungskarte lesen und eine darauf erlaubte Option wählen (nicht automatisch Scharmützel!).'));
      if(s.encounter==='riskant')arr.push(T('er','Begegnungswürfel-Ergebnis und die rot markierte riskante Option beachten; Riskant-Effekte der gewählten Option ausführen.'));
      if(s.social)arr.push(
        T('so1','Überzeugungsprobe nur wenn ausdrücklich gefordert, einmal versuchen; Schwierigkeit bestimmen.'),
        T('so2','Nur explizit erlaubte Fertigkeitswürfel (z. B. Redekunst) werfen und ausführen.'),
        T('so3','Fokus ausgeben, nach Würfeleffekten mit Schwierigkeit vergleichen; Würfel erschöpfen und Ergebnis-Effekte ausführen.'));
      if(battleNeeded())arr.push(T('ebattle','Schlacht (Scharmützel, Gewölbe oder Verlies) beenden und Schlachtfeld aufräumen.','battle'));
      arr.push(T('e2','Erfolg / Misserfolg / „Und immer“-Effekte, Beute und Sonderfolgen abwickeln.'),T('e3','Abgeschlossene Nebenquests, Karten und Quest-Stichworte nach Vorgabe nachhalten.'));
      return arr;
    }
    case 'belohnung':return [
      T('r1','1. Belohnungen erhalten: normale EP erhöhen Gruppen-EP und persönliche gesparte EP; Bonus-EP nur persönlich. Bei Misserfolg keine reguläre Begegnungsbelohnung, sofern nicht ausdrücklich anders. '),
      ...(s.battleGoal==='aufklaerung'&&battleNeeded()?[T('rsh','Aufklärung: EP für gesammelte Himmelsscherben auch bei gescheiterter Begegnung, sofern mindestens 1 Abenteurer unbesiegt (höchstens Zielmenge).')]:[]),
      ...(s.encounter==='riskant'&&s.riskOutcome?[T('r2','Riskanter Ort: nach Abschluss der Begegnung 2 Fokus erhalten (auch bei Misserfolg; Maximum beachten).')]:[]),
      T('r3','2. Verlernen (optional): Fertigkeitslinien, Fertigkeitswürfel oder Werte, ohne EP zurückzuerhalten.'),
      T('r4','3. Abenteurer verbessern (optional): EP ausgeben; danach maximal 3 persönliche EP sparen, Überschuss 1:1 in Fokus umwandeln soweit möglich.'),
      T('r5','4. Quests nachhalten: Fortschritt und (Haupt-/Neben-)Stichworte auf Kampagnenblatt vermerken.')];
    case 'abend':return [
      ...(!isFinal()?[T('a1',peacefulCardDrawn()?'1. Provinzregeln anwenden: Provinzsymbol der heute gezogenen friedlichen Begegnungskarte nutzen; anschließend Karte abwerfen.':'1. Provinzregeln anwenden: 1 friedliche Begegnungskarte nur für das Provinzsymbol ziehen; danach hinter den Stapel legen.')]:[T('a1','Finale: Provinzregeln anwenden überspringen, sofern Gazette nicht anders angibt; keine normalen Begegnungskarten ziehen.')]),
      T('a2',s.difficulty==='lehrling'?'2. Rasten (falls erlaubt): 2 LP heilen und 2 beliebige Würfel von der Erschöpfungsleiste entfernen.':s.difficulty==='experte'?'2. Rasten (Experte): zuerst 1 Gegenstand abwerfen, um rasten zu dürfen; dann 1 LP heilen und 1 beliebigen Würfel entfernen.':'2. Rasten (falls erlaubt): 1 LP heilen und 1 beliebigen Würfel von der Erschöpfungsleiste entfernen.'),
      T('a3','Während Rasten: Gegenstände nach Regellimit umorganisieren; auf Experte nur, wenn gerastet wurde.'),
      T('a4','3. Effekte der Abendphase auslösen (ggf. Gildenunterstützung während Rasten).')];
    case 'sitzungsende':return isFinal()?[
      T('zf1','Belohnungsphase abgeschlossen; die reguläre Abendphase entfällt.'),
      T('zf2','Epilog und Vorgaben des Finales lesen; Kampagnenausgang festhalten.')]:[
      T('z1','Epilog: Folge-Provinz und Folge-Gilde nach Questtext bestimmen (nach Partie 2 beginnt das Finale in derselben Provinz).'),
      T('z2','Gruppen-EP, (Haupt-)Stichwort und Fortschritt notieren; Gildenunterstützung ersetzt das Hauptstichwort der Partie.'),
      T('z3','Alle offenen Nebenquests und nur partiegültigen anhaltenden Effekte abwerfen; Ausnahmen nach Text beachten.'),
      T('z4','Abenteurer speichern: volle LP für nächste Partie; Bonus-LP, Erschöpfung, Zustände und verbrauchte Gegenstände entfernen; alle Würfel erholen.'),
      T('z5','Fokus für nächste Partie auf 0 setzen. Gesparte persönliche EP, Erholungswert, Klasse und zulässige Gegenstände behalten.')];
    default:return [];
    }
  }
  function checked(task, scope='day'){
    if(task.auto==='battle') return !!s.battleDone;
    if(task.auto==='risk') return !!s.riskOutcome;
    const dict=scope==='battle'?s.battleChecks:scope==='chest'?s.chestChecks:s.dayChecks;
    return !!dict[task.id];
  }
  function complete(tasks,scope='day'){return tasks.length>0&&tasks.every(t=>checked(t,scope));}
  function renderChecks(tasks,scope='day'){
    return `<div class="checks">${tasks.map(task=>`<label class="check ${checked(task,scope)?'done':''}">
      <input type="checkbox" data-scope="${scope}" data-check="${esc(task.id)}" ${checked(task,scope)?'checked':''} ${task.auto?'disabled':''} aria-label="${esc(task.txt)}" />
      <span>${esc(task.txt)}</span></label>`).join('')}</div>`;
  }
  function resetDay(){
    s.dayChecks={};s.battleChecks={};s.phase='morgen';s.questCompleted=false;s.questFailed=false;
    s.social=false;s.dungeon='scharmuetzel';s.battleGoal='besiegt_alle';s.forceBattle=false;s.riskOutcome='';s.battleDone=false;s.battleMode='setup';
    s.battleRound=1;s.battleOutcome='';s.battleSkill=false;s.skillUses=0;s.exploring=false;
    s.cityActions=['',''];s.freeCityAction=false;s.riskFocusGranted=false;s.friedlicheKarteHeute=false;
    s.shardCount=0;s.shardTarget=3;s.shardAlive=true;s.awardedShardXP=0;
    s.chestChecks={};s.chestAttempt=1;s.chestMaxAttempts=3;s.chestKind='gewoehnlich';s.chestOutcome='';s.chestFinished=false;
    s.encounter=isFinal()?'gildenquest':isFirstCity()?'stadt':'leer';
    s.provinceScreen='encounter';s.encounterSelectionMade=isFinal()||isFirstCity();s.fightDecision='';
  }
  function finishDay(){
    // Explicitly finishing a day is allowed even if some advisory checkboxes remain open.
    if(!complete(dayTasks()) && !confirm('In der Abendphase sind noch Punkte offen. Tag trotzdem abschließen und die Häkchen für den nächsten Tag zurücksetzen?'))return;
    clearTimeout(resetTimer); resetTimer=null;
    record(`Tag ${s.day} / Partie ${s.session} beendet`);
    if(s.day>=12&&!isFinal()){
      s.phase='verloren';s.questFailed=true;record('Questfrist Tag 12: Kampagne verloren');save();render();showToast('Tag 12: Gildenquest nicht abgeschlossen – Kampagne verloren.');return;
    }
    s.completedDays++;s.day++;
    resetDay();save();tab='ablauf';render();window.scrollTo(0,0);
    showToast(`Tag ${s.day} begonnen · Checklisten zurückgesetzt`);
  }
  function finishSession(){
    if(!complete(dayTasks()) && !confirm('Beim Partieende sind noch Punkte offen. Partie trotzdem abschließen?'))return;
    if(s.pendingFocus>0){showToast('Offene EP/Fokus-Umwandlung im Tracker klären.');return;}
    clearTimeout(resetTimer);resetTimer=null;
    record(`Partie ${s.session} erfolgreich abgeschlossen`);
    if(s.session===3){s.phase='fertig';save();render();showToast('Finale abgeschlossen.');return;}
    s.session++;s.day=1;s.focus=0;s.pendingFocus=0;s.completedDays++;
    resetDay();save();tab='ablauf';render();window.scrollTo(0,0);
    showToast(`Partie ${s.session} gestartet · Fortschritt/EP erhalten`);
  }
  function autoIfFinalCheck(){
    if(s.phase!=='abend'&&s.phase!=='sitzungsende')return;
    if(!complete(dayTasks()))return;
    if(resetTimer)clearTimeout(resetTimer);
    const atPhase=s.phase;
    resetTimer=setTimeout(()=>{
      if(s.phase!==atPhase||!complete(dayTasks()))return;
      if(atPhase==='abend')finishDay(); else finishSession();
    },950);
  }
  function applyEpCap(){
    if(s.freeXP<=3)return;
    const extra=s.freeXP-3;
    s.freeXP=3;
    if(s.focusMax===''){
      s.pendingFocus+=extra;
      record(`${extra} freie EP zur Fokus-Umwandlung vorgemerkt (Fokusmaximum fehlt)`);
      showToast('Fokusmaximum fehlt: Überhang unter „Tracker“ vorgemerkt.');
    }else{
      const converted=Math.min(extra,Math.max(0,Number(s.focusMax)-s.focus));
      s.focus+=converted;
      const lost=extra-converted;
      record(`${extra} EP Überhang: ${converted} in Fokus, ${lost} über Fokusmaximum`);
      if(lost)showToast(`${converted} Fokus erhalten; ${lost} EP über dem Fokusmaximum.`);
    }
  }
  function goNext(){
    const tasks=dayTasks();
    // Checklist entries are reminders, not a navigation lock.
    const next={morgen:'provinz',begegnung:'belohnung'};
    if(s.phase==='provinz'){provinceContinue();return;}
    if(next[s.phase])s.phase=next[s.phase];
    else if(s.phase==='belohnung'){
      if((s.freeXP>3||s.pendingFocus>0)&&s.focusMax===''){
        tab='tracker';render();showToast('Fokusmaximum eintragen, bevor EP-Überhang umgewandelt wird.');return;
      }
      if(s.pendingFocus>0){
        const gained=Math.min(s.pendingFocus,Math.max(0,Number(s.focusMax)-s.focus));
        s.focus+=gained;s.pendingFocus=0;record(`Offener EP-Überhang in ${gained} Fokus umgewandelt`);
      }
      applyEpCap();s.phase=s.questFailed?'verloren':s.questCompleted?'sitzungsende':'abend';
      if(s.questFailed)record('Gildenquest gescheitert – Kampagne verloren');
    }else if(s.phase==='abend'){finishDay();return;}
    else if(s.phase==='sitzungsende'){finishSession();return;}
    save();render();window.scrollTo(0,0);autoIfFinalCheck();
  }
  function phaseHeading(){
    return ({morgen:['01','Morgenphase','Partie, Tag und Gildenquest-Frist prüfen.'],
      provinz:['02','Provinzphase','Offizielle Begegnungshierarchie; nach Text Option und Schlachtausgang wählen.'],
      begegnung:['03','Begegnungsphase','Nur die tatsächlich ausgelöste Begegnung abwickeln.'],
      belohnung:['04','Belohnungsphase','EP, Fokus, Verbesserungen und Questfortschritt.'],
      abend:['05','Abendphase','Provinzeffekt, Rast und Tagesabschluss.'],
      sitzungsende:['06','Partieabschluss','Gildenquest abgeschlossen – keine Abendphase.']})[s.phase]||['','Sonderfall',''];
  }
  function encounterChoices(){
    return [
      ['gildenquest','1 · Gildenquest-Begegnung','Erfüllte Voraussetzung der Gildenquest in der Gazette hat Vorrang.','◆'],
      ['nebenquest','2 · Nebenquest-Begegnung','Nur wenn keine Gildenquest-Begegnung ausgelöst wird.','◇'],
      ['stadt','3 · Stadtbegegnung','Auf Stadtfeld; Gazette der Stadt lesen.','⌂'],
      ['friedlich','4a · Friedlicher Ort','Friedliche Begegnungskarte ziehen; Riskant-Effekte ignorieren.','✧'],
      ['konfliktreich','4b · Konfliktreicher Ort','Konfliktreiche Begegnungskarte ziehen; Schlacht ist nicht zwingend.','⚔'],
      ['riskant','4c · Riskanter Ort','Begegnungswürfel; passende Karte oder Fahrende Händler.','⚄'],
      ['leer','5 · Keine Begegnung','Feld ohne Symbol: Begegnungsphase überspringen.','–']
    ];
  }
  function provinceContinue(){
    if(s.provinceScreen==='encounter'){
      if(!s.encounterSelectionMade){showToast('Bitte eine Begegnungsart wählen oder „Keine Begegnung“ auswählen.');return;}
      if(s.encounter==='leer'){s.fightDecision='nein';s.phase='begegnung';tab='ablauf';save();render();window.scrollTo(0,0);return;}
      s.provinceScreen='combat';save();render();window.scrollTo(0,0);return;
    }
    if(s.provinceScreen==='combat'){
      if(s.encounter==='riskant'&&!s.riskOutcome){showToast('Bitte Ergebnis des Begegnungswürfels auswählen.');return;}
      if(!s.fightDecision){showToast('Bitte zuerst „Ja“ oder „Nein“ zur Schlachtfrage wählen.');return;}
      s.phase='begegnung';
      if(s.fightDecision==='ja')tab='kampf';else tab='ablauf';
      save();render();window.scrollTo(0,0);
    }
  }
  function chooseFight(value){
    if(value!=='ja'&&value!=='nein')return;
    if(s.fightDecision!==value){
      clearBattle();delete s.dayChecks.ebattle;
      s.fightDecision=value;s.forceBattle=(value==='ja');s.dungeon='scharmuetzel';
    }
    save();render();
  }
  function renderProvinceWizard(){
    const tasks=dayTasks();
    const done=tasks.filter(t=>checked(t)).length;
    const selectScreen=s.provinceScreen==='encounter';
    const opts=isFirstCity()?encounterChoices().filter(x=>x[0]==='stadt'):isFinal()?encounterChoices().filter(x=>x[0]==='gildenquest'):encounterChoices();
    const chosen=encounterChoices().find(x=>x[0]===s.encounter);
    return `<div class="stepper" aria-label="Phasenfolge">${PHASES.map(([id,label],i)=>`<div class="step ${id==='provinz'?'active':i<1?'past':''}">${esc(label)}</div>`).join('')}</div>
      <section class="panel" id="province-wizard">
      <p class="eyebrow">Provinzphase · Schritt ${selectScreen?'1':'2'} von 2</p>
      <h2>${selectScreen?'Welche Begegnung findet statt?':'Führt die gewählte Option zu einer Schlacht?'}</h2>
      <p class="lead">${selectScreen?'Wähle die erste zutreffende Begegnung in der offiziellen Hierarchie (Gildenquest vor Nebenquest vor Stadt vor Provinzort). Offene Häkchen blockieren nicht.':'Lies erst Begegnungstext und Optionen. Wähle eine zulässige Option; deren Ausgang ist friedlich oder eine Schlacht. Die App entscheidet das nicht automatisch.'}</p>
      <div class="wizard-steps"><span class="${selectScreen?'on':'done'}">1 · Begegnung</span><span class="${!selectScreen?'on':''}">2 · Ausgang</span></div>
      ${selectScreen?`<div class="encounter-choices" role="group" aria-label="Begegnungsart wählen">
        ${opts.map(([value,label,description,icon])=>`<button type="button" class="encounter-option ${s.encounterSelectionMade&&s.encounter===value?'chosen':''}" data-encounter-choice="${value}" aria-pressed="${s.encounterSelectionMade&&s.encounter===value}"><span class="enc-icon" aria-hidden="true">${icon}</span><span class="enc-text"><strong>${esc(label)}</strong><small>${esc(description)}</small></span><span aria-hidden="true">${s.encounterSelectionMade&&s.encounter===value?'✓':'›'}</span></button>`).join('')}
      </div>${isFirstCity()?'<div class="hint">Tag 1 der Partie: Am Startort bleiben; dort Stadtbegegnung starten (siehe Gildenquest-Sonderregeln).</div>':''}
      ${isFinal()?'<div class="hint">Im Finale folgt automatisch die nächste Finale-Begegnung; es gibt keine normale Provinzbewegung.</div>':''}`:
      `<div class="sublist"><p class="small muted">Ausgewählt: <b>${esc(chosen?.[1]||'Begegnung')}</b></p></div>
      ${s.encounter==='riskant'?`<label class="field"><span>Begegnungswürfel am riskanten Ort (2× friedlich, 3× konfliktreich, 1× Stadt)</span><select data-setting="riskOutcome"><option value="">Bitte Würfelergebnis wählen</option>${[['friedlich','Friedliche Begegnungskarte'],['konfliktreich','Konfliktreiche Begegnungskarte'],['haendler','Fahrende Händler (Stadtbegegnung)']].map(([v,t])=>`<option value="${v}" ${s.riskOutcome===v?'selected':''}>${t}</option>`).join('')}</select></label>`:''}<div class="hint">Zuerst Ereignis und gewählte Option auf der Karte/Gazette lesen. Falls die Option rot als riskant gekennzeichnet ist, musst du diese wählen (bei mehreren rot gekennzeichneten Optionen wählst du eine davon).</div>
      <div class="fight-options" role="group" aria-label="Schlachtentscheidung">
       <button type="button" class="fight-option ${s.fightDecision==='ja'?'chosen':''}" data-fight-choice="ja" aria-pressed="${s.fightDecision==='ja'}"><strong>⚔ Ja, Schlacht</strong><small>Schlachtaufbau, Schlachtrunden und Aufräumen öffnen.</small></button>
       <button type="button" class="fight-option ${s.fightDecision==='nein'?'chosen':''}" data-fight-choice="nein" aria-pressed="${s.fightDecision==='nein'}"><strong>○ Nein, friedlicher Ausgang</strong><small>Ohne Schlacht durch die Begegnungs- und Belohnungsphase.</small></button>
      </div>
      <button class="btn subtle" data-action="province-back" style="margin-top:8px">← Begegnungsart ändern</button>`}
      <details class="province-details" ${selectScreen?'open':''}>
        <summary>Bewegung & Provinz-Kontrollpunkte <span class="muted">${done}/${tasks.length}</span></summary>
        ${renderChecks(tasks)}
      </details>
      <button class="btn primary wizard-next" data-action="province-continue" ${selectScreen&&!s.encounterSelectionMade||!selectScreen&&(!s.fightDecision||(s.encounter==='riskant'&&!s.riskOutcome))?'disabled':''}>${selectScreen?(s.encounter==='leer'?'Ohne Begegnung weiter':'Weiter: Begegnungsausgang wählen'):s.fightDecision==='ja'?'Schlachtablauf öffnen →':'Weiter ohne Schlacht →'}</button>
      ${!selectScreen&&s.fightDecision==='nein'?'<p class="small muted">Als Nächstes folgt die Begegnungskontrolle; danach Belohnungs- und Abendphase. Diese werden nicht übersprungen.</p>':''}
      </section>`;
  }
  function renderPhaseControls(){
    if(s.phase==='verloren'||s.phase==='frist')return `<section class="panel"><p class="eyebrow">Kampagne verloren</p><h2>Gildenquest gescheitert</h2>
      <div class="hint warning">Laut offizieller Anleitung endet die Kampagne bei gescheitertem Quest-Abschnitt oder nicht abgeschlossener Gildenquest am Ende von Tag 12 (sofern der Questtext keine Ausnahme angibt). Im Finale führen gescheiterte Ziele ebenfalls zur Niederlage.</div>
      <p class="small muted">Dein Spielstand und die EP bleiben für eine Prüfung oder einen Export erhalten.</p>
      <div class="btn-row"><button class="btn" data-action="reopen-reward">Zur letzten Belohnungsphase</button><button class="btn danger" data-action="reset-campaign">Neue Kampagne beginnen</button></div></section>`;
    
  if(s.phase==='fertig')return `<section class="panel"><p class="eyebrow">Kampagne</p><h2>Finale abgeschlossen</h2>
      <p>Die Kampagne ist abgeschlossen. Deine EP und Notizen bleiben erhalten.</p>
      <div class="btn-row"><button class="btn danger" data-action="reset-campaign">Neue Kampagne beginnen</button></div></section>`;
    if(s.phase==='provinz')return renderProvinceWizard();
    const [n,name,lead]=phaseHeading();
    const tasks=dayTasks();
    const done=tasks.filter(t=>checked(t)).length;
    const pct=Math.round(done*100/Math.max(1,tasks.length));
    const isTerminal=s.phase==='abend'||s.phase==='sitzungsende';
    return `<div class="stepper" aria-label="Phasenfolge">${PHASES.map(([id,label],i)=>`<div class="step ${s.phase===id?'active':PHASES.findIndex(p=>p[0]===s.phase)>i?'past':''}">${esc(label)}</div>`).join('')}</div>
      <section class="panel" id="phase-panel"><p class="eyebrow">Phase ${n} · ${done} von ${tasks.length} erledigt</p><h2>${name}</h2><p class="lead">${lead}</p>
      <div class="progress" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="Phasenfortschritt"><div class="bar" style="width:${pct}%"></div></div>
      ${renderExtrasForPhase()}
      ${renderChecks(tasks)}
      <p class="small muted">Du kannst jederzeit weitergehen, auch wenn noch Punkte offen sind. Abhaken bleibt eine Kontrollhilfe.</p>
      ${isTerminal?`<div class="hint success">Wenn alle Punkte abgehakt sind, ${s.phase==='abend'?'beginnt der nächste Tag automatisch; die Häkchen werden gelöscht, EP und Notizen bleiben erhalten.':'startet die nächste Partie automatisch mit Tageszähler 1 und erhaltenen EP.'}</div>`:''}
      ${!isTerminal?`<button class="btn primary" style="width:100%" data-action="next">${esc(s.phase==='belohnung'?(s.questCompleted?'Partieabschluss öffnen':'Weiter zur Abendphase'):'Nächste Phase')} →</button>`:
        `<button class="btn primary" style="width:100%" data-action="next">${s.phase==='abend'?'Tag abschließen':'Partie abschließen'}</button>`}
      </section>`;
  }
  function renderExtrasForPhase(){
    let html='';
    if(s.phase==='morgen'&&s.day===12&&!isFinal())html+='<div class="hint warning">Letzter Tag: Gildenquest muss bis zum Ende von Tag 12 erfolgreich abgeschlossen werden. Sonst Kampagne verloren.</div>';
    if(s.phase==='begegnung'){
      html+=`<p class="small muted">Gewählt: <b>${esc((ENCOUNTERS.find(x=>x[0]===s.encounter)||['','Finale-Begegnung'])[1])}</b>${s.encounter==='riskant'?' · '+esc(({friedlich:'Friedliche Karte',konfliktreich:'Konfliktreiche Karte',haendler:'Fahrende Händler'})[s.riskOutcome]||'') :''}</p>`;
      if(s.encounter!=='leer')html+=`<label class="check ${s.social?'done':''}"><input type="checkbox" data-setting-bool="social" ${s.social?'checked':''}/><span>Die Begegnung fordert ausdrücklich eine Überzeugungsprobe</span></label>`;
      if(s.encounter==='friedlich'||s.encounter==='riskant'||s.encounter==='konfliktreich'||s.encounter==='gildenquest'||s.encounter==='nebenquest')html+=`<label class="check ${s.friedlicheKarteHeute?'done':''}"><input type="checkbox" data-setting-bool="friedlicheKarteHeute" ${s.friedlicheKarteHeute?'checked':''}/><span>Zusätzlich friedliche Begegnungskarte gezogen (für die Abendphase)</span></label>`;
      html+=`<div class="sublist"><p class="small"><b>Ausgang der gewählten Option:</b> ${s.fightDecision==='ja'?'Schlacht':s.fightDecision==='nein'?'Friedlich / ohne Schlacht':'Noch offen'}</p><button class="btn subtle" data-action="change-fight">Begegnungsausgang ändern</button></div>`;
      if(battleNeeded())html+=`<label class="field"><span>Schlacht-Typ (nach Karte/Gazette)</span><select data-setting="dungeon">${[['scharmuetzel','Scharmützel'],['gewoelbe','Gewölbe'],['verlies','Verlies']].map(([v,t])=>`<option value="${v}" ${s.dungeon===v?'selected':''}>${t}</option>`).join('')}</select></label>
      <label class="field"><span>Schlachtziel</span><select data-setting="battleGoal">${[['besiegt_alle','Besiegt alle'],['ziel_einheit','Besiegt Ziel-Einheit'],['durchsuchen','Durchsuchen'],['aufklaerung','Aufklärung'],['speziell','Speziell – Kartentext beachten']].map(([v,t])=>`<option value="${v}" ${s.battleGoal===v?'selected':''}>${t}</option>`).join('')}</select></label>
      <div class="hint">Die Schlacht endet erst am Rundenende. Bei Aufklärung ist der Rückzug nach erfüllter Scherbenzahl Teil des Erfolgs.</div><button class="btn" data-action="open-battle">⚔ Schlacht-Checkliste öffnen</button>`;
      if(isCityEncounter())html+=`<div class="sublist"><p class="small"><b>Stadtaktionen:</b> 0–2 reguläre Aktionen je Abenteurer und Begegnung. Freie Stadtaktionen kosten keinen Aktionsplatz. Wähle nur Angebote aus der Gazette, sofern geöffnet.</p>
        ${[0,1].map(i=>`<label class="field"><span>Reguläre Stadtaktion ${i+1}</span><select data-setting="cityAction${i}">${CITY_ACTIONS.map(([v,t])=>`<option value="${v}" ${s.cityActions[i]===v?'selected':''}>${esc(t)}</option>`).join('')}</select></label>`).join('')}
        <label class="check"><input type="checkbox" data-setting-bool="freeCityAction" ${s.freeCityAction?'checked':''}/><span>Freie Stadtaktion laut Gazette/Karte durchgeführt</span></label>
        <p class="small muted">Marktplatz nur 1× pro Abenteurer/Besuch. Gildenkiosk kann – sofern verfügbar – erneut genutzt werden. Maximal 4 aktive Nebenquests.</p></div>`;
    }
    if(s.phase==='belohnung'){
      html+=`<label class="check ${s.questCompleted?'done':''}"><input type="checkbox" data-setting-bool="questCompleted" ${s.questCompleted?'checked':''}/><span>${isFinal()?'Finale vollständig erfolgreich abgeschlossen':'Gildenquest erfolgreich abgeschlossen: Abendphase entfällt'}</span></label>
        <label class="check ${s.questFailed?'done':''}"><input type="checkbox" data-setting-bool="questFailed" ${s.questFailed?'checked':''}/><span>${isFinal()?'Finale gescheitert – Kampagne verloren':'Gildenquest-Abschnitt gescheitert – Kampagne verloren (sofern keine Quest-Ausnahme)'}</span></label>
        <div class="sublist"><p class="small"><b>EP:</b> Gruppe ${s.groupXP} · Gespart ${s.freeXP} · Fokus ${s.focus}${s.focusMax!==''?'/'+s.focusMax:''}</p><button class="btn" data-action="open-tracker">EP und Fokus eintragen</button></div>`;
      if(s.encounter==='riskant'&&s.riskOutcome)html+=`<div class="sublist"><p class="small">Riskanter Ort: nach Abschluss der Begegnung +2 Fokus auch bei Misserfolg (max. Fokuswert).</p><button class="btn ${s.riskFocusGranted?'subtle':'primary'}" data-action="risk-focus" ${s.riskFocusGranted?'disabled':''}>${s.riskFocusGranted?'✓ Fokus aus riskantem Ort eingetragen':'+2 Fokus aus riskantem Ort eintragen'}</button></div>`;
      if(battleNeeded()&&s.dungeon==='gewoelbe'&&s.battleGoal==='aufklaerung')html+=`<div class="sublist"><h3>Aufklärung · Himmelsscherben-EP</h3><p class="small muted">1 Gruppen-EP und 1 persönliche EP je gesammelter Himmelsscherbe, höchstens bis zur nötigen Zahl. Auch bei Misserfolg, solange mindestens ein Abenteurer unbesiegt bleibt. Nicht doppelt buchen.</p>
        <label class="field"><span>Gesammelte Himmelsscherben</span><input type="number" data-setting="shardCount" min="0" max="999" inputmode="numeric" value="${s.shardCount}" /></label>
        <label class="field"><span>Für Aufklärung nötige Himmelsscherben (normalerweise 3)</span><input type="number" data-setting="shardTarget" min="1" max="999" inputmode="numeric" value="${s.shardTarget}" /></label>
        <label class="check"><input type="checkbox" data-setting-bool="shardAlive" ${s.shardAlive?'checked':''}/><span>Mindestens 1 Abenteurer ist unbesiegt</span></label>
        <p class="small">Bereits gebucht: ${s.awardedShardXP} EP</p><button class="btn primary" data-action="shard-xp" ${!s.shardAlive||Math.min(s.shardCount,s.shardTarget)<=s.awardedShardXP?'disabled':''}>Himmelsscherben-EP gutschreiben</button></div>`;
      if(s.freeXP>3)html+='<div class="hint warning">Mehr als 3 gesparte EP: vor dem Abschluss umwandeln oder ausgeben. Überschuss verfällt (wird soweit möglich 1:1 in Fokus umgewandelt).</div>';
    }
    return html;
  }
  function renderAblauf(){
    return `${renderPhaseControls()}
      <section class="panel slim"><div class="split-title"><h3 style="margin:0">Wichtigste Kontrollpunkte</h3><span class="tag">Anleitung V1.0</span></div>
      <p class="small muted">Timing-Auslöser · LP/Fokus/Erschöpfung · Questmarker · Inventar (max. 8) · EP getrennt. Konkrete Karten- und Questtexte haben Vorrang.</p>
      <div class="btn-row"><button class="btn subtle" data-action="restart-day">Nur Checklisten des Tages leeren</button></div></section>`;
  }
  function roundTasks(){
    return [
      T('ba1','1. Rundenbeginn: Rundenzähler (1–5; ab 6 Übermüdungsrunde), danach alle Beginn-der-Runde-Effekte.'),
      ...(s.battleRound>=6?[T('ba2','Übermüdungsrunde: 1 Übermüdung erhalten, dann Daedrischen Schaden entsprechend der Übermüdungswürfel in der Erschöpfungsleiste. Zähler bleibt auf 6.')]:[]),
      T('bb1','2. Abenteurerzug: Beginn-des-Zuges-Effekte ausführen.'),
      T('bb2','Erholen: Würfel von links entsprechend Erholungswert entfernen; Übermüdungswürfel nach eigener Regel wieder in freie Stelle legen.'),
      T('bb3','Aktionen frei kombinieren: Bewegen (1–2×), Aktivieren (beliebig oft), Klassenfähigkeit (je 1×), Erkunden (1× nur Gewölbe); Einschränkungen beachten.'),
      ...(s.dungeon==='gewoelbe'&&s.exploring?[
        T('be1','Erkunden auslösen: Feld betreten / darauf Zug beginnen oder 1 Erkunden-Aktion innerhalb Sichtweite und Bewegungsreichweite; Gefährten können nicht erkunden.'),
        T('be2','Erkundungskarte ziehen und passende Matte; Platz prüfen. Fehlt Matte: Scherbe erhalten. Passt Matte nicht: Erkundung endet.'),
        T('be3','Karten-Effekte beim Aufbau, Matte anlegen, Kisten und Gegner nach Priorität platzieren, Karte ggf. auslegen.'),
        T('be4','Himmelsscherben, Fallen, Umgebungseffekte und Anzahl ausliegender/gesammelter Scherben prüfen.')]:[]),
      ...(s.battleSkill?SKILL_TASKS.map(([id,txt])=>T(id,txt)):[]),
      T('bb4','Ende des Abenteurerzuges: entsprechende Effekte ausführen.'),
      T('bc1','3. Gefährtenzüge: alle vorhandenen Gefährten in gewählter Reihenfolge handeln lassen (ggf. zuvor platzieren).'),
      T('bc2','4. Gegnerzüge: Quest-Einheiten (höchste Stufe) zuerst, dann Gegner nach Stufe absteigend. Gleichstand: Gruppe wählt.'),
      T('bc3','Jeder Gegner: Zugbeginn, ggf. Bewegung bis 2 Felder (nur wenn er kein Ziel anzielen kann), Aktivieren/Ziele/Würfel/Schaden/Reaktionen, Zugende.'),
      T('bd1','5. Rundenende: Effekte, Rückzugsmöglichkeit und Schlachtende prüfen; Priorität Niederlage vor Zielerfüllung vor Rückzug.')
    ];
  }
  function renderBattle(){
    if(!battleNeeded()&&s.battleMode==='setup'&&!s.battleDone){
      return `<section class="panel"><h2>Aktuell keine Schlacht</h2><p>Die Schlacht-Checkliste ist verfügbar, wenn eine Begegnungsoption eine Schlacht auslöst.</p>
      <button class="btn" data-action="open-flow">Zum Tagesablauf</button></section>${renderChest()}`;
    }
    if(s.battleDone)return `<section class="panel"><p class="eyebrow">Schlacht abgeschlossen</p><h2>Zur Begegnung zurück</h2><p>Das Ergebnis wurde gespeichert. Der Schlachtpunkt der Begegnungsphase gilt als erledigt.</p><button class="btn primary" data-action="open-flow">Begegnung fortsetzen</button></section>${renderChest()}`;
    const modes=[['setup','Aufbau'],['round','Schlachtrunde'],['cleanup','Aufräumen']];
    const current=s.battleMode;
    const tasks=current==='setup'?battleSetupTasks():current==='round'?roundTasks():BATTLE_CLEAN;
    const done=tasks.filter(t=>checked(t,'battle')).length;
    let actions='';
    if(current==='setup')actions=`<button class="btn primary" data-action="battle-to-round">Schlacht beginnen</button>`;
    if(current==='round')actions=`<div class="hint">Bewegung: bis Ausdauer-Hex, max. 2×. Zwei Bewegungsaktionen können nicht mit Aktivieren kombiniert werden. Erkunden und Bewegen schließen sich aus.</div>
      ${s.battleSkill?`<div class="small muted">Weitere Aktivierungen erneut durchlaufen: ${s.skillUses}</div><button class="btn subtle" data-action="skill-repeat" ${!SKILL_TASKS.every(([id])=>s.battleChecks[id])?'disabled':''}>Weitere Aktivierung → Prüfschritte zurücksetzen</button>`:''}
      <div class="btn-row"><button class="btn" data-action="battle-next-round">Nächste Schlachtrunde</button>
      <button class="btn primary" data-action="battle-to-cleanup">Schlacht beenden</button></div>`;
    if(current==='cleanup')actions=`<label class="field"><span>Schlachtausgang</span><select data-setting="battleOutcome"><option value="">Bitte auswählen</option>
      ${[['sieg','Schlachtziel erreicht / Erfolg'],['aufklaerung','Aufklärung: nach Scherben zurückgezogen (Erfolg)'],['rueckzug','Rückzug ohne erfülltes Ziel (Misserfolg)'],['niederlage','Alle Abenteurer besiegt (Niederlage)']].map(([v,t])=>`<option value="${v}" ${s.battleOutcome===v?'selected':''}>${t}</option>`).join('')}</select></label>
      <button class="btn primary" data-action="battle-finish" ${!s.battleOutcome?'disabled':''}>Schlacht abschließen und zurück</button>`;
    return `<section class="panel"><p class="eyebrow">Schlacht · True Solo</p><h2>${current==='round'?`${s.battleRound>=6?'Übermüdungsrunde · Zähler 6':'Schlachtrunde '+s.battleRound}`:current==='setup'?'Schlacht vorbereiten':'Nach der Schlacht'}</h2>
        ${current==='round'?`<label class="field"><span>Rundenzähler setzen (Gildenunterstützung: beliebige Zahl 1–6)</span><input data-setting="battleRound" aria-label="Schlachtrundenzähler" type="number" min="1" max="6" inputmode="numeric" value="${s.battleRound}" /></label>`:''}
        <div class="stepper">${modes.map(([id,label])=>`<div class="step ${current===id?'active':''}">${label}</div>`).join('')}</div>
        ${current==='setup'?`<label class="field"><span>Schlacht-Typ nach Begegnungstext</span><select data-setting="dungeon">${[['scharmuetzel','Scharmützel'],['gewoelbe','Gewölbe'],['verlies','Verlies']].map(([v,t])=>`<option value="${v}" ${s.dungeon===v?'selected':''}>${t}</option>`).join('')}</select></label>
        <label class="field"><span>Schlachtziel nach Begegnungstext</span><select data-setting="battleGoal">${[['besiegt_alle','Besiegt alle'],['ziel_einheit','Besiegt Ziel-Einheit'],['durchsuchen','Durchsuchen'],['aufklaerung','Aufklärung'],['speziell','Speziell']].map(([v,t])=>`<option value="${v}" ${s.battleGoal===v?'selected':''}>${t}</option>`).join('')}</select></label>`:''}
        <p class="lead">${done} von ${tasks.length} Kontrollpunkten erledigt. Die Schlachtrunde wird nicht vorzeitig erhöht.</p>
        ${current==='round'&&s.dungeon==='gewoelbe'?`<label class="check"><input type="checkbox" data-setting-bool="exploring" ${s.exploring?'checked':''}/><span>In dieser Schlachtrunde ein Kartenteil erkunden – Zusatzschritte anzeigen</span></label>`:''}
        ${current==='round'?`<label class="check ${s.battleSkill?'done':''}"><input type="checkbox" data-setting-bool="battleSkill" ${s.battleSkill?'checked':''}/><span>In dieser Runde mindestens eine Fertigkeit einsetzen – die 6 Prüfschritte anzeigen</span></label>`:''}
        ${s.battleRound>=6&&current==='round'?'<div class="hint warning">Übermüdungsrunde: Zähler bleibt auf 6. Jede weitere Runde mit Übermüdungsfolgen abhandeln.</div>':''}
        ${renderChecks(tasks,'battle')}
        <p class="small muted">Auch mit offenen Häkchen kannst du den nächsten Schlachtschritt wählen. Für einen noch nicht vollständig abgehakten Abschluss wirst du gefragt.</p>
        ${actions}</section>${renderChest()}
      <details class="ref-details"><summary>Erkunden, Kisten und Kampfregeln</summary><div class="ref-body">
        <p><b>Gewölbe:</b> Erkunden über erkundbares Feld oder Erkunden-Aktion in Sicht- und Bewegungsreichweite. Nach Erkunden-Aktion ist Bewegen im selben Zug ausgeschlossen. Befolge Karten-/Matten-/Platz-/Kisten-/Gegner-Reihenfolge.</p>
        <p><b>Aktivieren:</b> Ab dem zweiten Aktivieren im selben Zug 1 Ermüdung, auf Experte 2. Nicht-anhaltende Klassenfähigkeiten 1× pro Zug.</p>
        <p><b>Kisten:</b> Drei Dietrich-Würfel im ersten Versuch; danach Würfel beiseitelegen. Die Rückseite des Gegenstands gibt die Zahl der Versuche an. Bei endgültigem Misserfolg Kistenchip abwerfen und Zahlenschloss-Karte verdeckt hinter ihren Stapel legen.</p>
        </div></details>`;
  }
  function renderChest(){
    return `<section class="panel" id="chest-panel"><p class="eyebrow">Optionaler Sonderablauf · Regelbuch S. 69–70</p><h3>Schlossknacken · Kisten / Fallen</h3>
      <p class="small muted">Würfelergebnisse werden am Spieltisch ermittelt. Die App begleitet die offizielle Abfolge und begrenzt die Versuche.</p>
      <label class="field"><span>Art des Zahlenschlosses</span><select data-setting="chestKind">${[['gewoehnlich','Gewöhnliche Kiste (3 Ziffern)'],['legendaer','Legendäre Kiste (4 Ziffern, Schlüsselziffer)'],['falle','Falle / anderes Zahlenschloss (Text)']].map(([v,t])=>`<option value="${v}" ${s.chestKind===v?'selected':''}>${t}</option>`).join('')}</select></label>
      <label class="field"><span>Maximale Versuche laut Zahlenschloss / Text</span><input type="number" data-setting="chestMaxAttempts" min="1" max="99" inputmode="numeric" value="${s.chestMaxAttempts}" /></label>
      ${s.chestFinished?`<div class="hint success">Ausgang: ${s.chestOutcome==='erfolg'?'Erfolg':'Misserfolg'}. Bei Kisten: Chip ablegen, Gegenstand nehmen oder passende Karte verdeckt unter den Stapel legen.</div>
        <button class="btn" data-action="chest-reset">Neues Schloss beginnen</button>`:
      `<p class="lead">Versuch ${s.chestAttempt} von ${s.chestMaxAttempts}. ${s.chestKind==='legendaer'?'Sichere die Schlüsselziffer zuerst, danach dürfen weitere Ergebnisse gesichert werden.':''}</p>
        ${renderChecks(CHEST_STEPS,'chest')}
        <div class="btn-row"><button class="btn" data-action="chest-repeat" ${s.chestAttempt>=s.chestMaxAttempts?'disabled':''}>Nächster Versuch</button>
          <button class="btn primary" data-action="chest-win">Erfolg</button>
          <button class="btn" data-action="chest-fail">Misserfolg / Abbruch</button></div>
        <p class="small muted">Nach dem letzten Versuch kannst du nur Erfolg oder Misserfolg festhalten. Beiseitegelegte Würfel bleiben liegen; Schlüsselziffer-Würfel wird im Folgeversuch erneut geworfen.</p>`}
      </section>`;
  }
  function renderTracker(){
    return `<section class="panel"><p class="eyebrow">Kampagnenressourcen</p><h2>Erfahrung & Fokus</h2>
      <div class="stats-grid"><div class="stat-card"><div class="stat" id="stat-group">${s.groupXP}</div><div class="stat-label">Gruppen-EP</div></div>
      <div class="stat-card"><div class="stat" id="stat-free">${s.freeXP}</div><div class="stat-label">Persönliche freie EP</div></div><div class="stat-card"><div class="stat">${s.bonusXP}</div><div class="stat-label">Erhaltene Bonus-EP gesamt (in freien EP enthalten)</div></div>
      <div class="stat-card"><div class="stat" id="stat-focus">${s.focus}</div><div class="stat-label">Fokus ${s.focusMax!==''?'/ '+s.focusMax:'(Limit offen)'}</div></div>
      <div class="stat-card"><div class="stat">${s.pendingFocus}</div><div class="stat-label">Umwandlung offen</div></div></div>
      <div class="hint">Normale EP erhöhen <b>Gruppen-EP und persönliche EP</b>. Bonus-EP erhöhen nur persönliche EP. EP-Ausgaben verringern niemals Gruppen-EP.</div>
      <label class="field"><span>EP-Menge</span><input id="ep-amount" aria-label="EP-Menge" inputmode="numeric" type="number" min="1" max="999" step="1" value="1" /></label>
      <div class="tracker-actions"><button class="btn primary" data-action="xp-normal">+ Normale EP</button><button class="btn" data-action="xp-bonus">+ Bonus-EP</button>
      <button class="btn" data-action="xp-spend">− EP ausgeben</button><button class="btn" data-action="xp-correct">− Normale EP korrigieren</button></div>
      <div class="divider"></div>
      <label class="field"><span>Fokusmaximum (laut deinem Charakterbogen)</span><input type="number" min="0" max="999" step="1" inputmode="numeric" id="focus-max" data-setting="focusMax" placeholder="Bitte eintragen" value="${esc(s.focusMax)}" /></label>
      <div class="ministepper"><span>Aktueller Fokus: <strong>${s.focus}</strong></span>
      <div class="btn-row" style="margin:0"><button class="btn" aria-label="Fokus minus eins" data-action="focus-minus">−</button><button class="btn" aria-label="Fokus plus eins" data-action="focus-plus">+</button></div></div>
      ${s.pendingFocus>0?`<div class="hint warning">${s.pendingFocus} EP Überhang warten auf Fokus-Umwandlung. Trage das Fokusmaximum ein.</div>
      <button class="btn" data-action="resolve-pending" ${s.focusMax===''?'disabled':''}>Vorgemerkten Überhang umwandeln</button>`:''}
      <div class="divider"></div><h3>Gildenunterstützung · Regelbuch S. 50</h3><p class="small muted">Einmal pro Kampagne in Partie 1 oder 2; nur während einer Schlacht oder beim Rasten. Voll heilen, Erschöpfung/Zustände entfernen, Würfel erholen und je 1 gewöhnlichen + 1 legendären Gegenstand ziehen. In Schlacht Rundenzähler frei setzen, während Rasten Gruppenmarker bis zu 6 Felder bewegen. Hauptstichwort eintragen; reguläres Hauptstichwort der Partie entfällt.</p>
      <div class="hint ${s.guildAssistUsed?'success':''}">${s.guildAssistUsed?'✓ Gildenunterstützung wurde verwendet':'Noch nicht eingesetzt'}</div>
      <button class="btn" data-action="guild-assist" ${s.guildAssistUsed||isFinal()?'disabled':''}>Gildenunterstützung einsetzen</button>
      <p class="small muted">Nur während einer laufenden Schlacht oder beim Rasten in der Abendphase auslösen.</p></section>
      <section class="panel"><h2>Notizen</h2><label class="field"><span>Questfortschritt, Stichwörter und Ausrüstung</span>
      <textarea id="notes" data-setting="notes" placeholder="Hier kannst du deinen Kampagnenfortschritt notieren …">${esc(s.notes)}</textarea></label>
      <p class="small muted">Notizen werden während des Schreibens gespeichert und beim Tageswechsel nicht gelöscht.</p></section>
      <section class="panel"><h2>Letzte Änderungen</h2>${s.history.length?s.history.slice(0,8).map(x=>`<div class="log-item">${esc(x.at)} · ${esc(x.msg)}</div>`).join(''):'<p class="muted">Noch keine Einträge.</p>'}</section>`;
  }
  const REF = [
    ['Phasen und Begegnungshierarchie · S. 34–36',`<p>Morgenphase → Provinzphase → Begegnungsphase → Belohnungsphase → Abendphase.</p><p>Begegnung in Reihenfolge prüfen: 1. Gildenquest 2. Nebenquest 3. Stadt 4. Provinzort (friedlich, konfliktreich, riskant) 5. kein Symbol → keine Begegnung.</p><p>Am riskanten Ort: Begegnungswürfel (2× friedlich, 3× konfliktreich, 1× Fahrende Händler). Rot markierte riskante Option muss gewählt werden.</p>`],
    ['Stadtaktionen · S. 39–40',`<p>Bis 2 reguläre Aktionen je Abenteurer, freie Stadtaktionen kosten keinen Aktionsplatz. Laden, Lehrer, Gasthaus, Quest-Tafel, Gildenkiosk, Marktplatz, Alchemietisch. Marktplatz 1× je Abenteurer/Begegnung. Nur geöffnete Dienste nutzen.</p>`],
    ['Überzeugungsprobe · S. 86',`<p>Nur wenn ausdrücklich verlangt und nur einmal: erlaubte Fertigkeitswürfel (etwa Redekunst) werfen, danach Fokus ausgeben, mit Schwierigkeitswert vergleichen, Würfel erschöpfen. „Erfolgreich?“ / „Nicht erfolgreich?“ / „Und immer:“ beachten.</p>`],
    ['Schlacht / Aktivieren · S. 57–65',`<p>Abenteurer → Gefährten → Gegner, dazwischen zeitlich passende Effekte. Der Zähler bleibt ab Übermüdungsrunde auf 6. Jeder dieser Runden 1 Übermüdung, danach Daedrischer Schaden gemäß Übermüdungswürfeln.</p><p>Aktivieren: Ermüdung → Kampfform → Ziel → Würfel wählen/werfen → Würfel nutzen → Reaktionen. Ab 2. Aktivierung 1 Ermüdung (Experte 2).</p>`],
    ['Gewölbe, Schlachtziele · S. 74–84',`<p>Gewölbe: erkundbare Felder, Erkundungskarte, Matte ziehen/Platz prüfen, Effekte, Matte, Kisten, Gegner, Karte auslegen. Ziele: Besiegt alle; Ziel-Einheit; Durchsuchen; Aufklärung; Speziell. Bei Aufklärung wird nach genügenden Scherben erfolgreich zurückgezogen; Scherben geben EP auch bei vorzeitigem Misserfolg, wenn ein Abenteurer unbesiegt ist.</p>`],
    ['Schlossknacken · S. 69–70',`<p>Erster Versuch: 3 Dietrich-Würfel. Schlüsselziffer zuerst sichern (legendär). Würfel beiseitelegen; Schlüsselziffer-Würfel darf beim nächsten Versuch erneut geworfen werden. 1 Ermüdung pro ±1, Sprung 6↔1 kostet 5 Ermüdung. Versuche laut Zahlenschloss begrenzt.</p>`],
    ['EP, Rasten, Partiewechsel · S. 42–51',`<p>Normale EP gleichzeitig auf Gruppen-Zähler und gesparte persönliche EP; Bonus-EP nur persönlich. Maximal 3 persönliche EP nach der Belohnungsphase, Überschuss verfallen lassen und soweit möglich 1:1 in Fokus umwandeln. Rasten nach Schwierigkeit; Gildenunterstützung nur in Partie 1/2.</p><p>Gildenquest scheitert nach erfolglosem Tag 12 oder gescheitertem Abschnitt (sofern kein Ausnahme-Text). Finale hat Gazette-eigene Länge und keine Provinzbewegung.</p>`]
  ];
  const ENEMY_POINTS = {lehrling:[13,27,32],adept:[16,29,34],experte:[18,33,37]};
  function renderReference(){
    return `<section class="panel"><p class="eyebrow">Nachschlagewerk</p><h2>Regeln · offizielle Anleitung V1.0</h2>
      <p class="lead">Inoffizielle Spielhilfe. Die konkreten Karten-, Quest- und Provinztexte sowie offizielle Errata haben Vorrang.</p>
      <div class="stat-card"><div class="stat">${ENEMY_POINTS[s.difficulty][s.session-1]}</div><div class="stat-label">Partieende-KS für ${s.difficulty} · Partie ${s.session} · 1 Abenteurer</div></div>
      <div class="hint">Dieser feste Partieende-KS gilt nur für die <b>letzte Schlacht der jeweiligen Partie</b>, nicht für gewöhnliche Schlachten.</div>
      ${REF.map(([title,body])=>`<details class="ref-details"><summary>${esc(title)}</summary><div class="ref-body">${body}</div></details>`).join('')}
      <h3>Finalkampf-Tabelle (True Solo)</h3><div class="sublist"><p>Lehrling: 13 / 27 / 32</p><p>Adept: 16 / 29 / 34</p><p>Experte: 18 / 33 / 37</p></div>
      <p class="small muted">Quelle: Offizielle deutsche Anleitung Version 1.0, S. 13, 34–51, 57–86. Quest- und Gazette-Texte sowie Errata haben Vorrang.</p></section>
      <section class="panel"><h2>Einstellungen</h2>
      <label class="field"><span>Startmodus (für neuen Spielstand)</span><select data-setting="startMode"><option value="regulaer" ${s.startMode==='regulaer'?'selected':''}>Regulär: 2 Gruppen-EP</option><option value="intro" ${s.startMode==='intro'?'selected':''}>Intro Gefängnisausbruch: 1 Gruppen-EP</option></select></label><p class="small muted">Neue Kampagnen beginnen mit dem angegebenen Gruppen-EP-Stand; persönliche gesparte EP beginnen bei 0.</p><label class="field"><span>Schwierigkeitsgrad</span><select data-setting="difficulty">${[['lehrling','Lehrling'],['adept','Adept'],['experte','Experte']].map(([id,n])=>`<option value="${id}" ${s.difficulty===id?'selected':''}>${n}</option>`).join('')}</select></label>
      <label class="field"><span>Partie (1–3)</span><select data-setting="session">${[1,2,3].map(n=>`<option value="${n}" ${s.session===n?'selected':''}>Partie ${n}</option>`).join('')}</select></label>
      <label class="field"><span>Tag korrigieren</span><input type="number" min="1" max="99" value="${s.day}" data-setting="day" inputmode="numeric" /></label>
      <div class="btn-row"><button class="btn subtle" data-action="restart-day">Aktuelle Häkchen löschen</button>
      <button class="btn danger" data-action="reset-campaign">Gesamte Kampagne zurücksetzen</button></div>
      <div class="divider"></div><h3>Datensicherung</h3>
      <p class="small muted">Exportiere gelegentlich einen vollständigen Spielstand als JSON. So kannst du ihn bei einem Gerätewechsel wieder importieren.</p>
      <div class="btn-row"><button class="btn" data-action="export-save">Spielstand exportieren</button>
      <button class="btn" data-action="open-import">Spielstand importieren</button></div>
      <input id="import-save" type="file" accept=".json,application/json" hidden />
      <p class="small muted">Alle Angaben werden ausschließlich auf diesem Gerät im Browser gespeichert. Es findet keine Synchronisierung statt. Daten können beim Löschen von Safari-Websitedaten verloren gehen.</p></section>`;
  }
  function header(){
    return `<header class="topbar"><div class="brand">The Elder Scrolls · True Solo</div>
      <div class="h1">Rundenassistent</div><div class="status-row">
        <div class="status-cell"><small>Partie</small><strong>${s.session} / 3</strong></div>
        <div class="status-cell"><small>Tag</small><strong>${s.day}${!isFinal()?'/12':''}</strong></div>
        <div class="status-cell"><small>Gruppen-EP</small><strong>${s.groupXP}</strong></div>
      </div></header>`;
  }
  function nav(){
    return `<nav class="nav" aria-label="Hauptnavigation">${[['ablauf','◷','Ablauf'],['kampf','⚔','Schlacht'],['tracker','✦','EP & Fokus'],['regeln','☷','Regeln']].map(([id,icon,name])=>`<button data-tab="${id}" class="${tab===id?'active':''}" aria-current="${tab===id?'page':'false'}"><span class="navicon" aria-hidden="true">${icon}</span><span>${name}</span></button>`).join('')}</nav>`;
  }
  function render(){
    const page=({ablauf:renderAblauf,kampf:renderBattle,tracker:renderTracker,regeln:renderReference})[tab]();
    $('#app').innerHTML=header()+`<main class="shell">${page}<p class="footerline">Inoffizieller Begleiter · Offizielle deutsche Anleitung V1.0 als Grundlage · Spielmaterial/Gazette/Errata haben Vorrang</p></main>`+nav();
  }
  function num(v,def=0){const n=Number(v);return Number.isSafeInteger(n)&&n>=0&&n<=999999?n:def;}
  function clearBattle(){s.battleChecks={};s.battleDone=false;s.battleRound=1;s.battleMode='setup';s.battleOutcome='';s.battleSkill=false;s.skillUses=0;s.exploring=false;}
  function changeEncounter(next){
    if(isFirstCity()||isFinal())return;
    if(!ENCOUNTERS.some(([v])=>v===next))return;
    s.encounter=next;s.encounterSelectionMade=true;s.fightDecision=next==='leer'?'nein':'';s.riskOutcome='';s.riskFocusGranted=false;s.social=false;s.dungeon='scharmuetzel';s.battleGoal='besiegt_alle';s.forceBattle=false;s.cityActions=['',''];s.freeCityAction=false;s.friedlicheKarteHeute=false;clearBattle();
    for(const k of Object.keys(s.dayChecks))if(k.startsWith('e')||k.startsWith('so')||k.startsWith('r'))delete s.dayChecks[k];
    save();render();
  }
  function doAction(act){
    switch(act){
      case 'next':goNext();return;
      case 'province-continue':provinceContinue();return;
      case 'province-back':s.provinceScreen='encounter';save();render();return;
      case 'change-fight':s.phase='provinz';s.provinceScreen='combat';tab='ablauf';save();render();return;
      case 'open-battle':tab='kampf';render();return;
      case 'open-tracker':tab='tracker';render();return;
      case 'open-flow':tab='ablauf';render();return;
      case 'restart-day':{
        if(!confirm('Nur die Abhaklisten für diesen Tag löschen? Tag, EP, Fokus und Notizen bleiben erhalten.'))return;
        s.dayChecks={};clearBattle();save();render();showToast('Häkchen dieses Tages zurückgesetzt.');return;
      }
      case 'reset-campaign':{
        if(!confirm('Wirklich die gesamte Kampagne inklusive EP, Fokus, Notizen und Tageszähler löschen?'))return;
        const mode=s.startMode;s=DEFAULT();s.startMode=mode;s.groupXP=mode==='intro'?1:2;save();tab='ablauf';render();showToast('Neue Kampagne gestartet.');return;
      }
      case 'reopen-reward':s.phase='belohnung';save();tab='ablauf';render();return;
      case 'battle-to-round':{if(!complete(battleSetupTasks(),'battle')&&!confirm('Im Schlachtaufbau sind noch Punkte offen. Schlachtrunde trotzdem beginnen?'))return;s.battleMode='round';s.battleChecks={};save();render();return;}
      case 'skill-repeat':{
        if(!s.battleSkill||!SKILL_TASKS.every(([id])=>s.battleChecks[id]))return;
        s.skillUses++;for(const [id] of SKILL_TASKS)delete s.battleChecks[id];
        save();render();showToast('Aktivieren-Schritte zurückgesetzt – erneute Aktivierung prüfen.');return;
      }
      case 'battle-next-round':{if(!complete(roundTasks(),'battle')&&!confirm('In dieser Schlachtrunde sind noch Punkte offen. Trotzdem zur nächsten Schlachtrunde wechseln?'))return;s.battleRound=Math.min(6,s.battleRound+1);s.battleChecks={};s.battleSkill=false;s.exploring=false;s.skillUses=0;save();render();showToast(`${s.battleRound>=6?'Übermüdungsrunde · Zähler 6':'Schlachtrunde '+s.battleRound}`);return;}
      case 'battle-to-cleanup':{if(!complete(roundTasks(),'battle')&&!confirm('In der Schlachtrunde sind noch Punkte offen. Trotzdem zum Schlachtabschluss wechseln?'))return;s.battleMode='cleanup';s.battleChecks={};save();render();return;}
      case 'battle-finish':{if(!s.battleOutcome)return;if(s.battleOutcome==='aufklaerung'&&s.battleGoal!=='aufklaerung'){showToast('Aufklärung ist nur beim gleichnamigen Schlachtziel möglich.');return;}if(!complete(BATTLE_CLEAN,'battle')&&!confirm('Im Schlachtabschluss sind noch Punkte offen. Schlacht trotzdem als beendet markieren?'))return;s.battleDone=true;record(`Schlacht beendet: ${s.battleOutcome}, Runde ${s.battleRound}`);save();tab='ablauf';render();showToast('Schlachtabschluss übernommen.');return;}
      case 'chest-repeat':if(s.chestAttempt<s.chestMaxAttempts){s.chestAttempt++;s.chestChecks={};save();render();}return;
      case 'chest-win':case 'chest-fail':{
        s.chestOutcome=act==='chest-win'?'erfolg':'misserfolg';s.chestFinished=true;
        record(`Schlossknacken: ${s.chestOutcome} (Versuch ${s.chestAttempt})`);save();render();}return;
      case 'chest-reset':s.chestChecks={};s.chestAttempt=1;s.chestFinished=false;s.chestOutcome='';save();render();return;
      case 'risk-focus':{
        if(s.riskFocusGranted||s.encounter!=='riskant'||!s.riskOutcome||s.phase!=='belohnung')return;
        if(s.focusMax===''){tab='tracker';render();showToast('Zuerst Fokusmaximum eintragen.');return;}
        const earned=Math.min(2,Math.max(0,Number(s.focusMax)-s.focus));s.focus+=earned;s.riskFocusGranted=true;
        record(`Riskanter Ort: +${earned} Fokus (max. +2)`);save();render();return;
      }
      case 'shard-xp':{
        if(!s.shardAlive||s.battleGoal!=='aufklaerung'||!battleNeeded())return;
        const v=Math.max(0,Math.min(s.shardCount,s.shardTarget)-s.awardedShardXP);if(!v)return;
        s.groupXP+=v;s.freeXP+=v;s.awardedShardXP+=v;record(`Aufklärung: +${v} EP aus Himmelsscherben`);save();render();return;
      }
      case 'guild-assist':{
        if(s.guildAssistUsed||isFinal())return;
        const inBattle=s.phase==='begegnung'&&battleNeeded()&&s.battleMode==='round'&&!s.battleDone;
        const inRest=s.phase==='abend';
        if(!inBattle&&!inRest){showToast('Nur während einer Schlacht oder während Rasten einsetzbar.');return;}
        if(!confirm(`Gildenunterstützung jetzt ${inBattle?'während der Schlacht':'während Rasten'} einmalig verwenden? Hauptstichwort dieser Partie entfällt.`))return;
        s.guildAssistUsed=true;record(`Gildenunterstützung eingesetzt ${inBattle?'in Schlacht':'beim Rasten'} (Hauptstichwort)`);save();render();
        showToast(inBattle?'Abenteurer heilen/erholen, je 1 GEW+LEG ziehen und Rundenzähler frei setzen.':'Heilen/erholen, je 1 GEW+LEG ziehen und Gruppenmarker bis 6 Felder bewegen.');return;
      }
      case 'export-save':{
        const blob=new Blob([JSON.stringify(s,null,2)],{type:'application/json'});
        const href=URL.createObjectURL(blob);const a=document.createElement('a');a.href=href;
        a.download=`second-era-partie-${s.session}-tag-${s.day}.json`;document.body.appendChild(a);
        a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(href),3000);showToast('Spielstand als JSON bereitgestellt.');return;
      }
      case 'open-import':$('#import-save')?.click();return;
      case 'focus-minus':s.focus=Math.max(0,s.focus-1);record('Fokus −1');save();render();return;
      case 'focus-plus':{
        if(s.focusMax!==''&&s.focus>=Number(s.focusMax)){showToast('Fokusmaximum erreicht.');return;}
        s.focus++;record('Fokus +1');save();render();return;
      }
      case 'resolve-pending':{
        if(s.focusMax==='')return;
        const transfer=Math.min(s.pendingFocus,Math.max(0,Number(s.focusMax)-s.focus));
        const lost=s.pendingFocus-transfer;
        s.focus+=transfer;s.pendingFocus=0;
        record(`Vorgemerkt: ${transfer} Fokus erhalten, ${lost} nicht mehr umwandelbar`);save();render();return;
      }
      case 'xp-normal':case 'xp-bonus':case 'xp-spend':case 'xp-correct':{
        const v=num($('#ep-amount')?.value,0);
        if(v<1||v>999){showToast('Bitte eine EP-Menge von 1 bis 999 eingeben.');return;}
        if(act==='xp-spend'&&v>s.freeXP){showToast('Nicht genügend persönliche EP.');return;}
        if(act==='xp-correct'&&v>s.groupXP){showToast('Nicht genügend Gruppen-EP für die Korrektur.');return;}
        if(act==='xp-normal'){s.groupXP+=v;s.freeXP+=v;record(`+${v} normale EP (Gruppe + Persönlich)`);}
        if(act==='xp-bonus'){s.freeXP+=v;s.bonusXP+=v;record(`+${v} Bonus-EP (nur Persönlich)`);}
        if(act==='xp-spend'){s.freeXP-=v;record(`−${v} persönliche EP ausgegeben`);}
        if(act==='xp-correct'){
          s.groupXP-=v;s.freeXP=Math.max(0,s.freeXP-v);
          record(`Korrektur −${v} Gruppen-EP; persönliche EP soweit verfügbar korrigiert`);
        }
        save();render();showToast('EP-Stand gespeichert.');return;
      }
      default:return;
    }
  }
  document.addEventListener('click',e=>{
    const b=e.target.closest('button');if(!b)return;
    if(b.dataset.tab){tab=b.dataset.tab;render();return;}
    if(b.dataset.encounterChoice){changeEncounter(b.dataset.encounterChoice);return;}
    if(b.dataset.fightChoice){chooseFight(b.dataset.fightChoice);return;}
    if(b.dataset.action)doAction(b.dataset.action);
  });
  document.addEventListener('change',e=>{
    const el=e.target;
    if(el.dataset.check){
      if(el.dataset.scope==='battle')s.battleChecks[el.dataset.check]=!!el.checked;
      else if(el.dataset.scope==='chest')s.chestChecks[el.dataset.check]=!!el.checked;
      else s.dayChecks[el.dataset.check]=!!el.checked;
      save();render();autoIfFinalCheck();return;
    }
    if(el.id==='encounter-select'){changeEncounter(el.value);return;}
    if(el.dataset.settingBool){
      const key=el.dataset.settingBool;
      s[key]=!!el.checked;
      if(key==='battleSkill'){for(let i=1;i<=6;i++)delete s.battleChecks['skill'+i];s.skillUses=0;}
      if(key==='exploring'){for(let i=1;i<=4;i++)delete s.battleChecks['be'+i];}
      if(key==='questCompleted'&&el.checked)s.questFailed=false;
      if(key==='questFailed'&&el.checked)s.questCompleted=false;
      if(key==='forceBattle'){s.fightDecision=s.forceBattle?'ja':'nein';clearBattle();delete s.dayChecks.ebattle;}
      save();render();return;
    }
    const key=el.dataset.setting;
    if(!key)return;
    if(key==='notes'){s.notes=String(el.value).slice(0,50000);save();return;}
    if(key==='cityAction0'||key==='cityAction1'){
      const i=Number(key.slice(-1));const value=el.value;
      if(!CITY_ACTIONS.some(a=>a[0]===value))return;
      if(value==='marktplatz'&&s.cityActions[1-i]==='marktplatz'){
        showToast('Marktplatz ist nur einmal je Stadtbegegnung erlaubt.');render();return;
      }
      s.cityActions[i]=value;delete s.dayChecks['ecaction'+i];save();render();return;
    }
    if(key==='riskOutcome'){
      s.riskOutcome=el.value;s.riskFocusGranted=false;s.fightDecision='';s.dungeon='scharmuetzel';clearBattle();
      for(const k of Object.keys(s.dayChecks))if(k.startsWith('e')||k.startsWith('so')||k.startsWith('r'))delete s.dayChecks[k];
    } else if(key==='dungeon'){
      if(['scharmuetzel','gewoelbe','verlies'].includes(el.value)){s.dungeon=el.value;clearBattle();delete s.dayChecks.ebattle;}
    } else if(key==='battleGoal'){
      if(['besiegt_alle','ziel_einheit','durchsuchen','aufklaerung','speziell'].includes(el.value))s.battleGoal=el.value;
    } else if(key==='chestKind'){s.chestKind=el.value;s.chestAttempt=1;s.chestFinished=false;s.chestChecks={};
    } else if(key==='chestMaxAttempts'){s.chestMaxAttempts=Math.min(99,Math.max(1,num(el.value,3)));
    } else if(key==='shardCount'){s.shardCount=Math.min(999,num(el.value,0));
    } else if(key==='shardTarget'){s.shardTarget=Math.min(999,Math.max(1,num(el.value,3)));
    } else if(key==='startMode'){
      const old=s.startMode;s.startMode=el.value==='intro'?'intro':'regulaer';
      if(s.session===1&&s.day===1&&s.completedDays===0&&s.groupXP===(old==='intro'?1:2))s.groupXP=s.startMode==='intro'?1:2;
    } else if(key==='difficulty'){
      if(['lehrling','adept','experte'].includes(el.value))s.difficulty=el.value;
    }else if(key==='session'){
      s.session=Math.min(3,Math.max(1,num(el.value,1)));
      if(isFirstCity())s.encounter='stadt';if(isFinal())s.encounter='gildenquest';
    }else if(key==='battleRound'){
      const newRound=Math.min(6,Math.max(1,num(el.value,1)));
      if(newRound!==s.battleRound){s.battleRound=newRound;s.battleChecks={};s.battleSkill=false;s.skillUses=0;}
    }else if(key==='day'){
      s.day=Math.max(1,num(el.value,1));if(isFirstCity())s.encounter='stadt';
    }else if(key==='focusMax'){
      const raw=String(el.value).trim();s.focusMax=raw===''?'':Math.min(999,num(raw,0));
      if(s.focusMax!==''&&s.focus>Number(s.focusMax))s.focus=Number(s.focusMax);
    }else if(key==='notes')s.notes=el.value;
    else if(key==='battleOutcome')s.battleOutcome=el.value;
    save();render();
  });
  document.addEventListener('input',e=>{
    if(e.target?.dataset?.setting==='notes'){
      s.notes=String(e.target.value).slice(0,50000);save();
    }
  });
  document.addEventListener('change',async e=>{
    if(e.target?.id!=='import-save')return;
    const file=e.target.files?.[0];if(!file)return;
    try{
      if(file.size>1000000)throw new Error('Datei zu groß');
      const raw=JSON.parse(await file.text());
      if(!raw||![2,3,4,5].includes(raw.version)||!validPhases.has(raw.phase)||
        !Number.isInteger(raw.session)||raw.session<1||raw.session>3||
        !Number.isInteger(raw.day)||raw.day<1||raw.day>999||
        !Number.isSafeInteger(raw.groupXP)||raw.groupXP<0||
        !Number.isSafeInteger(raw.freeXP)||raw.freeXP<0){
        throw new Error('Ungültiges Spielstandformat');
      }
      if(!confirm('Gespeicherten Spielstand durch die ausgewählte Datei ersetzen?'))return;
      localStorage.setItem(KEY,JSON.stringify({...DEFAULT(),...raw,version:STORAGE_VERSION}));
      s=load();tab='ablauf';render();showToast('Spielstand importiert.');
    }catch(err){showToast('Import fehlgeschlagen: '+String(err.message||err));}
  });
  if('serviceWorker' in navigator && (location.protocol==='https:'||location.hostname==='localhost'||location.hostname==='127.0.0.1')){
    window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
  }
  render();
  // Nur für lokal automatisierte E2E-Tests. Keine Änderung von Appzuständen ohne echte UI-Aktion.
  window.__appDebug = {getState:()=>JSON.parse(JSON.stringify(s))};
})();
