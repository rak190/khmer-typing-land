import { nidaFromEvent, findKeyForTarget } from "./nida-map.js";

function $(sel){ return document.querySelector(sel); }

function spark(box){
  const s = document.createElement("div");
  s.className = "spark";
  box.appendChild(s);
  setTimeout(()=>s.remove(), 260);
}

export async function gamePlatform({ view, keyboardUI, mascot, lessonPool, count=14 }){
  return new Promise((resolve)=>{
    view.innerHTML = `
      <div class="card">
        <h2>Platform (Pop Letters)</h2>
        <p class="small">Type the Khmer character shown. The keyboard highlights the correct key + finger.</p>
        <div class="row">
          <button class="btn secondary" id="quit">Quit</button>
        </div>
        <div class="gameBox" id="box">
          <div class="target" id="target"></div>
        </div>
        <div class="statline" id="stats"></div>
      </div>
    `;

    const box = $("#box");
    const targetEl = $("#target");
    const stats = $("#stats");
    const quit = $("#quit");

    let hits=0, miss=0, done=0;
    let target = pick(lessonPool);

    function setTarget(t){
      target = t;
      targetEl.textContent = t;

      const key = findKeyForTarget(t);
      keyboardUI.setActiveTarget(key?.code, key?.mod);

      stats.innerHTML = `
        <span class="badge">Target: <b style="color:var(--ink)">${t}</b></span>
        <span class="badge">Hits: ${hits}</span>
        <span class="badge">Miss: ${miss}</span>
        <span class="badge">Left: ${Math.max(0,count-done)}</span>
      `;
    }

    setTarget(target);

    function onKeyDown(e){
      // Track modifier state for keyboard label switching
      updateLayerFromEvent(e, keyboardUI);

      // Ignore if it's pure modifier key
      if(e.code.startsWith("Shift") || e.code === "AltRight" || e.code === "AltLeft" || e.code === "ControlLeft" || e.code === "ControlRight") return;

      const produced = nidaFromEvent(e);
      if(!produced) return;

      if(produced === target){
        hits++;
        done++;
        targetEl.classList.remove("flashBad");
        targetEl.classList.add("flashGood");
        keyboardUI.flashCorrect();
        spark(box);
        setTimeout(()=>targetEl.classList.remove("flashGood"), 180);

        if(done >= count){
          cleanup();
          keyboardUI.clearActive();
          resolve({ hits, miss });
          return;
        }
        setTarget(pick(lessonPool));
      }else{
        miss++;
        targetEl.classList.remove("flashGood");
        targetEl.classList.add("flashBad");
        keyboardUI.flashWrong(e.code);
        setTimeout(()=>targetEl.classList.remove("flashBad"), 180);
        setTarget(target); // refresh stats
      }
    }

    function onKeyUp(e){
      updateLayerFromEvent(e, keyboardUI);
    }

    function cleanup(){
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      quit.onclick = null;
    }

    quit.onclick = ()=>{ cleanup(); keyboardUI.clearActive(); resolve({ hits, miss }); };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
  });
}

export async function gameRunner({ view, keyboardUI, mascot, lessonPool, distanceGoal=22 }){
  return new Promise((resolve)=>{
    view.innerHTML = `
      <div class="card">
        <h2>Runner (Jump)</h2>
        <p class="small">Type the correct target to make the animal jump over obstacles.</p>
        <div class="row">
          <button class="btn secondary" id="quit">Quit</button>
        </div>
        <div class="gameBox" id="box">
          <div class="hero" id="hero">${mascot}</div>
          <div class="target" id="target" style="top:55px"></div>
        </div>
        <div class="statline" id="stats"></div>
      </div>
    `;

    const box = $("#box");
    const hero = $("#hero");
    const targetEl = $("#target");
    const stats = $("#stats");
    const quit = $("#quit");

    let hits=0, miss=0;
    let dist=0;
    let y=0, vy=0;
    let frames=0;

    let target = pick(lessonPool);
    setTarget(target);

    function setTarget(t){
      target=t;
      targetEl.textContent=t;
      const key = findKeyForTarget(t);
      keyboardUI.setActiveTarget(key?.code, key?.mod);

      stats.innerHTML = `
        <span class="badge">Type: <b style="color:var(--ink)">${t}</b></span>
        <span class="badge">Distance: ${dist}/${distanceGoal}</span>
        <span class="badge">Hits: ${hits}</span>
        <span class="badge">Miss: ${miss}</span>
      `;
    }

    function jump(){
      if(y === 0){
        vy = 11;
      }
    }

    function onKeyDown(e){
      updateLayerFromEvent(e, keyboardUI);

      if(e.code.startsWith("Shift") || e.code === "AltRight" || e.code === "AltLeft" || e.code.startsWith("Control")) return;
      const produced = nidaFromEvent(e);
      if(!produced) return;

      if(produced === target){
        hits++;
        jump();
        keyboardUI.flashCorrect();
        spark(box);
        setTarget(pick(lessonPool));
      }else{
        miss++;
        keyboardUI.flashWrong(e.code);
        setTarget(target);
      }
    }
    function onKeyUp(e){ updateLayerFromEvent(e, keyboardUI); }

    function tick(){
      frames++;

      // physics
      y = Math.max(0, y + vy);
      vy -= 0.85;
      if(y === 0) vy = Math.min(vy, 0);

      hero.style.transform = `translateY(${-y}px)`;

      if(frames % 12 === 0){
        dist++;
        if(dist >= distanceGoal){
          cleanup();
          keyboardUI.clearActive();
          resolve({ hits, miss });
          return;
        }
        setTarget(target);
      }

      requestAnimationFrame(tick);
    }

    function cleanup(){
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      quit.onclick = null;
    }

    quit.onclick = ()=>{ cleanup(); keyboardUI.clearActive(); resolve({ hits, miss }); };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    tick();
  });
}

export async function gameDefender({ view, keyboardUI, mascot, lessonPool, killsGoal=14 }){
  return new Promise((resolve)=>{
    view.innerHTML = `
      <div class="card">
        <h2>Defender (Blast)</h2>
        <p class="small">Enemies approach. Type the target to blast them before they hit you.</p>
        <div class="row">
          <button class="btn secondary" id="quit">Quit</button>
        </div>
        <div class="gameBox" id="box">
          <div class="hero" id="hero">🛡️</div>
        </div>
        <div class="statline" id="stats"></div>
      </div>
    `;

    const box = $("#box");
    const stats = $("#stats");
    const quit = $("#quit");

    let hits=0, miss=0;
    let hp=3;
    let kills=0;

    let enemy = spawnEnemy();

    function spawnEnemy(){
      const e = document.createElement("div");
      e.className = "enemy";
      e.dataset.x = "0";
      const t = pick(lessonPool);
      e.textContent = mascot;     // enemy shows mascot (cute)
      e.dataset.t = t;            // but target is Khmer char
      e.title = `Type: ${t}`;
      box.appendChild(e);

      // Show target in keyboard + stats
      const key = findKeyForTarget(t);
      keyboardUI.setActiveTarget(key?.code, key?.mod);
      refresh();
      return e;
    }

    function refresh(){
      const t = enemy?.dataset?.t ?? "";
      stats.innerHTML = `
        <span class="badge">HP: ${"❤️".repeat(hp)}</span>
        <span class="badge">Kills: ${kills}/${killsGoal}</span>
        <span class="badge">Hits: ${hits}</span>
        <span class="badge">Miss: ${miss}</span>
        <span class="badge">Target: <b style="color:var(--ink)">${t}</b></span>
      `;
    }

    function onKeyDown(e){
      updateLayerFromEvent(e, keyboardUI);

      if(e.code.startsWith("Shift") || e.code === "AltRight" || e.code === "AltLeft" || e.code.startsWith("Control")) return;
      const produced = nidaFromEvent(e);
      if(!produced) return;

      if(enemy && produced === enemy.dataset.t){
        hits++;
        kills++;
        keyboardUI.flashCorrect();
        spark(box);

        enemy.remove();
        enemy = null;

        if(kills >= killsGoal){
          cleanup();
          keyboardUI.clearActive();
          resolve({ hits, miss });
          return;
        }
        enemy = spawnEnemy();
      }else{
        miss++;
        keyboardUI.flashWrong(e.code);
        refresh();
      }
    }
    function onKeyUp(e){ updateLayerFromEvent(e, keyboardUI); }

    function tick(){
      if(!enemy){ requestAnimationFrame(tick); return; }

      let x = Number(enemy.dataset.x);
      x += 1.6; // speed
      enemy.dataset.x = String(x);
      enemy.style.transform = `translateX(${-x}px)`;

      // reaches hero zone
      if(x >= (box.clientWidth - 180)){
        hp--;
        enemy.remove();
        enemy = null;

        if(hp <= 0){
          cleanup();
          keyboardUI.clearActive();
          resolve({ hits, miss });
          return;
        }
        enemy = spawnEnemy();
      }
      refresh();
      requestAnimationFrame(tick);
    }

    function cleanup(){
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      quit.onclick = null;
    }

    quit.onclick = ()=>{ cleanup(); keyboardUI.clearActive(); resolve({ hits, miss }); };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    tick();
  });
}

function pick(pool){
  return pool[Math.floor(Math.random()*pool.length)];
}

function updateLayerFromEvent(e, keyboardUI){
  const altgr = e.getModifierState?.("AltGraph") || (e.ctrlKey && e.altKey);
  const shift = e.shiftKey;
  keyboardUI.setMod(altgr ? "ALTGR" : shift ? "SHIFT" : "BASE");
}
