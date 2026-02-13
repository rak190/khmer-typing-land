// js/app.js
import { KeyboardUI } from "./keyboard-ui.js";
import { gamePlatform, gameRunner, gameDefender } from "./games.js";
import { buildWorlds } from "./curriculum.js";
import { makeBadges, unlockBadgesByStars } from "./badges.js";

const view = document.querySelector("#view");

const keyboardRoot = document.querySelector("#keyboard");
const statePill = document.querySelector("#statePill");
const fingerPill = document.querySelector("#fingerPill");

const hudProfile = document.querySelector("#hudProfile");
const hudStars = document.querySelector("#hudStars");
const btnHome = document.querySelector("#btnHome");

const mascotBig = document.querySelector("#mascotBig");
const mascotSelect = document.querySelector("#mascotSelect");

const STORAGE_KEY = "KTL_NIDA_FULL_V1";

const BADGES = makeBadges();
const WORLDS = buildWorlds();

const DEFAULT_SAVE = {
  profile: { name:"Player" },
  progress: { starsByStage: {} },   // w1s1 -> 0..3
  badgesOwned: ["B001"],            // start badge
  selectedBadgeId: "B001"
};

let save = load();

const keyboardUI = new KeyboardUI(keyboardRoot, statePill, fingerPill);

btnHome.onclick = () => screenHome();

initBadgeSelector();
persist();
screenHome();

/* ---------- Storage + HUD ---------- */

function load(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return structuredClone(DEFAULT_SAVE);
    const parsed = JSON.parse(raw);
    return { ...structuredClone(DEFAULT_SAVE), ...parsed };
  }catch{
    return structuredClone(DEFAULT_SAVE);
  }
}

function persist(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(save));
  updateHUD();
}

function stageKey(worldId, stageId){ return `${worldId}${stageId}`; }

function totalStars(){
  return Object.values(save.progress.starsByStage).reduce((a,b)=>a+b,0);
}

function getSelectedBadge(){
  const b = BADGES.find(x=>x.id===save.selectedBadgeId);
  return b || BADGES[0];
}

function updateHUD(){
  const badge = getSelectedBadge();
  hudProfile.textContent = `${badge.icon} ${save.profile.name}`;
  hudStars.textContent = `⭐ ${totalStars()}`;
  mascotBig.textContent = badge.icon;
}

/* ---------- Unlock logic ---------- */

function worldUnlocked(world){
  return totalStars() >= world.unlockStars;
}

function applyBadgeUnlocks(){
  const newly = unlockBadgesByStars(BADGES, save.badgesOwned, totalStars());
  if(newly.length){
    save.badgesOwned.push(...newly);
    // auto-select newest (feels rewarding)
    save.selectedBadgeId = newly[newly.length - 1];
    persist();
    return newly;
  }
  return [];
}

/* ---------- UI Screens ---------- */

function screenHome(){
  keyboardUI.clearActive();
  updateHUD();

  const worldTiles = WORLDS.map(w=>{
    const unlocked = worldUnlocked(w);
    return `
      <div class="tile">
        <h3>${w.name}</h3>
        <div class="small">Unlock at ⭐ ${w.unlockStars}</div>
        <div style="margin-top:10px" class="row">
          <button class="btn ${unlocked?"":"secondary"}" data-world="${w.id}" ${unlocked?"":"disabled"}>
            ${unlocked ? "Enter" : "Locked"}
          </button>
        </div>
      </div>
    `;
  }).join("");

  view.innerHTML = `
    <div class="card">
      <h2>Home</h2>
      <p class="small">81 stages (9×9). Each stage = Platform → Runner → Defender. Collect 150 badges.</p>

      <div class="row" style="margin-top:10px">
        <label class="small">Player name:</label>
        <input id="name" value="${escapeHtml(save.profile.name)}"
          style="padding:8px 10px;border-radius:12px;border:1px solid rgba(255,255,255,.12);background:rgba(0,0,0,.2);color:var(--ink);width:220px" />
        <button id="saveName" class="btn">Save</button>

        <button id="badgesBtn" class="btn secondary">Badges (${save.badgesOwned.length}/150)</button>
        <button id="reset" class="btn secondary">Reset</button>
      </div>

      <div class="grid">${worldTiles}</div>
    </div>
  `;

  document.querySelector("#saveName").onclick = () => {
    const v = document.querySelector("#name").value.trim();
    save.profile.name = v || "Player";
    persist();
    screenHome();
  };

  document.querySelector("#badgesBtn").onclick = () => screenBadges();

  document.querySelector("#reset").onclick = () => {
    save = structuredClone(DEFAULT_SAVE);
    persist();
    initBadgeSelector();
    screenHome();
  };

  view.querySelectorAll("button[data-world]").forEach(btn=>{
    btn.onclick = () => screenStages(btn.dataset.world);
  });
}

function screenStages(worldId){
  keyboardUI.clearActive();
  updateHUD();

  const world = WORLDS.find(w=>w.id===worldId);
  if(!world) return screenHome();

  const stageTiles = world.stages.map(st=>{
    const k = stageKey(world.id, st.id);
    const stars = save.progress.starsByStage[k] ?? 0;
    return `
      <div class="tile">
        <h3>${st.name}</h3>
        <div class="small">Stars: ${"⭐".repeat(stars)}${"☆".repeat(3-stars)}</div>
        <div style="margin-top:10px">
          <button class="btn" data-stage="${st.id}">Play</button>
        </div>
      </div>
    `;
  }).join("");

  view.innerHTML = `
    <div class="card">
      <h2>${world.name}</h2>
      <p class="small">Complete stages to unlock more worlds + badges.</p>
      <div class="row">
        <button class="btn secondary" id="back">Back</button>
        <button class="btn secondary" id="badgesBtn">Badges (${save.badgesOwned.length}/150)</button>
      </div>
      <div class="grid">${stageTiles}</div>
    </div>
  `;

  document.querySelector("#back").onclick = () => screenHome();
  document.querySelector("#badgesBtn").onclick = () => screenBadges();

  view.querySelectorAll("button[data-stage]").forEach(btn=>{
    btn.onclick = () => playStage(worldId, btn.dataset.stage);
  });
}

async function playStage(worldId, stageId){
  keyboardUI.clearActive();
  updateHUD();

  const world = WORLDS.find(w=>w.id===worldId);
  const stage = world?.stages?.find(s=>s.id===stageId);
  if(!world || !stage) return screenHome();

  const badge = getSelectedBadge();
  const mascot = badge.icon;
  const pool = stage.pool;

  let hits=0, miss=0;

  // Tune difficulty by stage number a bit
  const stageNo = Number(stageId.replace("s","")) || 1;
  const platformCount = 10 + stageNo * 2;
  const runGoal = 16 + stageNo * 2;
  const killsGoal = 10 + stageNo * 2;

  // Platform → Runner → Defender
  let r1 = await gamePlatform({ view, keyboardUI, mascot, lessonPool: pool, count: platformCount });
  hits += r1.hits; miss += r1.miss;

  let r2 = await gameRunner({ view, keyboardUI, mascot, lessonPool: pool, distanceGoal: runGoal });
  hits += r2.hits; miss += r2.miss;

  let r3 = await gameDefender({ view, keyboardUI, mascot, lessonPool: pool, killsGoal });
  hits += r3.hits; miss += r3.miss;

  const acc = hits / Math.max(1, hits + miss);
  const stars = acc >= 0.95 ? 3 : acc >= 0.85 ? 2 : acc >= 0.70 ? 1 : 0;

  const k = stageKey(worldId, stageId);
  const prev = save.progress.starsByStage[k] ?? 0;
  save.progress.starsByStage[k] = Math.max(prev, stars);
  persist();

  const newly = applyBadgeUnlocks();

  screenResult(worldId, stageId, { stars, acc, hits, miss, newly });
}

function screenResult(worldId, stageId, { stars, acc, hits, miss, newly }){
  keyboardUI.clearActive();
  updateHUD();

  const newlyHtml = (newly && newly.length)
    ? `<div class="statline" style="margin-top:10px">
         <span class="badge">New badges unlocked: ${
           newly.slice(0,6).map(id => {
             const b = BADGES.find(x=>x.id===id);
             return b ? `${b.icon} ${b.name}` : id;
           }).join(" • ")
         }${newly.length>6 ? " • ..." : ""}</span>
       </div>`
    : "";

  view.innerHTML = `
    <div class="card">
      <h2>Stage Complete 🎉</h2>
      <div class="statline">
        <span class="badge">Accuracy: ${(acc*100).toFixed(1)}%</span>
        <span class="badge">Stars: ${"⭐".repeat(stars)}${"☆".repeat(3-stars)}</span>
        <span class="badge">Hits: ${hits}</span>
        <span class="badge">Miss: ${miss}</span>
      </div>
      ${newlyHtml}

      <div class="row" style="margin-top:12px">
        <button class="btn" id="again">Play Again</button>
        <button class="btn secondary" id="stages">Back to Stages</button>
        <button class="btn secondary" id="badgesBtn">Badges</button>
        <button class="btn secondary" id="home">Home</button>
      </div>
    </div>
  `;

  document.querySelector("#again").onclick = () => playStage(worldId, stageId);
  document.querySelector("#stages").onclick = () => screenStages(worldId);
  document.querySelector("#badgesBtn").onclick = () => screenBadges();
  document.querySelector("#home").onclick = () => screenHome();
}

function screenBadges(){
  keyboardUI.clearActive();
  updateHUD();

  const ownedSet = new Set(save.badgesOwned);

  const grid = BADGES.map(b=>{
    const owned = ownedSet.has(b.id);
    const selected = save.selectedBadgeId === b.id;
    const lockInfo = owned ? "" : ` (⭐ ${b.unlock.value})`;

    return `
      <button class="tile badgeBtn ${owned ? "" : "locked"} ${selected ? "selected" : ""}"
        data-id="${b.id}" ${owned ? "" : "disabled"}
        title="${owned ? "Select" : "Locked"}${lockInfo}">
        <div style="font-size:34px">${b.icon}</div>
        <div class="small" style="margin-top:6px;color:${owned?"var(--ink)":"var(--muted)"}">
          ${b.name}${owned ? "" : lockInfo}
        </div>
      </button>
    `;
  }).join("");

  view.innerHTML = `
    <div class="card">
      <h2>Badges (${save.badgesOwned.length}/150)</h2>
      <p class="small">Badges unlock automatically by total stars. Click an owned badge to set as your mascot/avatar.</p>
      <div class="row">
        <button class="btn secondary" id="back">Back</button>
      </div>
      <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(140px,1fr));margin-top:12px">
        ${grid}
      </div>
    </div>
  `;

  document.querySelector("#back").onclick = () => screenHome();

  view.querySelectorAll("button[data-id]").forEach(btn=>{
    btn.onclick = () => {
      const id = btn.dataset.id;
      if(!ownedSet.has(id)) return;
      save.selectedBadgeId = id;
      persist();
      initBadgeSelector();
      screenBadges();
    };
  });
}

/* ---------- Badge dropdown in header ---------- */

function initBadgeSelector(){
  // show only owned badges in dropdown
  const owned = new Set(save.badgesOwned);
  const ownedBadges = BADGES.filter(b=>owned.has(b.id));

  mascotSelect.innerHTML = ownedBadges
    .map(b => `<option value="${b.id}">${b.icon} ${b.name}</option>`)
    .join("");

  // fallback safety
  if(!owned.has(save.selectedBadgeId)){
    save.selectedBadgeId = ownedBadges[0]?.id || "B001";
  }
  mascotSelect.value = save.selectedBadgeId;

  mascotSelect.onchange = () => {
    save.selectedBadgeId = mascotSelect.value;
    persist();
  };

  updateHUD();
}

/* ---------- Helpers ---------- */

function escapeHtml(s){
  return (s ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;");
}
