"use strict";
// ============================================================
// MOSQUITO EVOLUTION — arquitetura modular (Three.js r128)
// GameManager · PlayerController · WorldManager · AudioSystem · UIManager
// Tudo encapsulado: nenhuma variável global além do próprio escopo da IIFE.
// ============================================================
(() => {

const CFG = {
  X0: -70, X1: 110, MZ: 50, YMIN: -3.5, YMAX: 12, SAVE: "mosquito-evolucao-v1", CRESCE: 1.3, COMBO_T: 4,
  ESTAGIOS: [
    { min: 0,  nome: "Larva voadora",           cor: 0xffb45c },
    { min: 3,  nome: "Pernilongo",              cor: 0xff3355 },
    { min: 7,  nome: "Caçador noturno",         cor: 0xd83cff },
    { min: 12, nome: "Vampiro alado",           cor: 0x39d9ff },
    { min: 18, nome: "Mosquito de laboratório", cor: 0x55ff55 },
    { min: 25, nome: "Praga dos pântanos",      cor: 0xff8833 },
    { min: 35, nome: "Terror da madrugada",     cor: 0xff2266 },
    { min: 48, nome: "Rei do enxame",           cor: 0xffd84d },
    { min: 65, nome: "Sugador ancestral",       cor: 0x9900ff },
    { min: 85, nome: "Deus carmesim",           cor: 0xffffff },
    { min: 100, nome: "Pesadelo crepuscular",      cor: 0x111122 },
    { min: 110, nome: "Lorde da praga estelar",    cor: 0x00ffcc },
    { min: 120, nome: "Soberano do sangue eterno", cor: 0xff0000 }
  ],
  // EASTER EGGS: cada um desbloqueia uma skin (K troca, H mostra dicas)
  SKINS: {
    pixel:      { nome: "8-bit pixelado",     corpo: 0xffffff, abd: 0xffffff, brilho: 0x33ff66, ei: 0, pixel: true, dica: "Um código clássico de videogame: ↑ ↑ ↓ ↓ ← → ← → B A" },
    dengue:     { nome: "Aedes aegypti",      corpo: 0x121212, abd: 0x121212, perna: 0x121212, brilho: 0xffffff, ei: 0, listras: true, dica: "Digite o nome da doença mais famosa que o mosquito transmite" },
    relojoeiro: { nome: "Relojoeiro dourado", corpo: 0xffd84d, abd: 0xc9a227, brilho: 0xffaa00, ei: 0.35, metal: true, dica: "O tempo voa... encoste no relógio da aula de Biologia" },
    radioativo: { nome: "Radioativo",         corpo: 0x1a3a1a, abd: 0x39ff14, brilho: 0x39ff14, ei: 0.9, asa: 0xb6ffb0, dica: "Pouse em cima do tanque de larvas do laboratório" },
    jogador:    { nome: "Craque da quadra",   corpo: 0xff7a1a, abd: 0x1a1a1a, brilho: 0xff7a1a, ei: 0.3,  dica: "Faça uma cesta: atravesse um aro do ginásio de cima para baixo" },
    fantasma:   { nome: "Fantasma",           corpo: 0xdff4ff, abd: 0xbfe6ff, brilho: 0x88ccff, ei: 0.6, alfa: 0.35, asa: 0xffffff, dica: "Encare seu reflexo no espelho do banheiro" },
    vampiro:    { nome: "Conde Drácula",      corpo: 0x14000a, abd: 0x8b0000, brilho: 0xff0033, ei: 0.7,  dica: "Pique 10 humanos" },
    mosquito:   { nome: "Mosquitão da rua",   corpo: 0x8a8f2a, abd: 0x6b7220, brilho: 0xc9d13a, ei: 0.2,  dica: "Encare o Mosquitão da rua: a estátua sobre o palco do auditório" },
    carreta:    { nome: "Caminhão de som",    corpo: 0x2b2b3a, abd: 0x2b2b3a, brilho: 0xff44aa, ei: 0.9, saia: true, pixel: true, dica: "Fique parado 3 s diante do telão do auditório e aperte ESPAÇO" },
  },
  // CONQUISTAS (persistem entre partidas)
  CONQ: [
    { id: "primeiro", nome: "Primeiro voo", ico: "🦟", desc: "Comece uma partida" },
    { id: "sangue500", nome: "Meio litro", ico: "🩸", desc: "Acumule 500 de sangue" },
    { id: "sangue5000", nome: "Banco de sangue", ico: "🧛", desc: "Acumule 5.000 de sangue" },
    { id: "nivel40", nome: "Evoluído", ico: "🧬", desc: "Chegue ao nível 40" },
    { id: "pernilongo", nome: "Pernilongo", ico: "🦟", desc: "Alcance o nível 3 (Pernilongo)" },
    { id: "cacadorNoturno", nome: "Caçador noturno", ico: "🌙", desc: "Alcance o nível 7 (Caçador noturno)" },
    { id: "vampiroAlado", nome: "Vampiro alado", ico: "🦇", desc: "Alcance o nível 12 (Vampiro alado)" },
    { id: "mosquitoLaboratorio", nome: "Mosquito de laboratório", ico: "🧪", desc: "Alcance o nível 18 (Mosquito de laboratório)" },
    { id: "pragaPantano", nome: "Praga dos pântanos", ico: "🌿", desc: "Alcance o nível 25 (Praga dos pântanos)" },
    { id: "terrorMadrugada", nome: "Terror da madrugada", ico: "🌃", desc: "Alcance o nível 35 (Terror da madrugada)" },
    { id: "reiEnxame", nome: "Rei do enxame", ico: "👑", desc: "Alcance o nível 48 (Rei do enxame)" },
    { id: "sugadorAncestral", nome: "Sugador ancestral", ico: "👁️", desc: "Alcance o nível 65 (Sugador ancestral)" },
    { id: "deusCarmesim", nome: "Deus carmesim", ico: "✨", desc: "Alcance o nível 85 (Deus carmesim)" },
    { id: "pesadeloCrepuscular", nome: "Pesadelo crepuscular", ico: "🌑", desc: "Alcance o nível 100 (Pesadelo crepuscular)" },
    { id: "lorde", nome: "Lorde da praga estelar", ico: "🌌", desc: "Alcance o nível 110 (Lorde da praga estelar)" },
    { id: "soberano", nome: "Soberano do sangue eterno", ico: "👑", desc: "Alcance o nível 120 (Soberano do sangue eterno)" },
    { id: "picada1", nome: "Primeira picada", ico: "🩸", desc: "Pique um humano" },
    { id: "picada25", nome: "Pesadelo da escola", ico: "😱", desc: "Pique 25 humanos" },
    { id: "tapas", nome: "Sobrevivente de tapas", ico: "👋", desc: "Leve 5 tapas e continue voando" },
    { id: "gas3", nome: "Nuvem venenosa", ico: "☣", desc: "Atravesse 3 nuvens de inseticida" },
    { id: "turista", nome: "Turista da escola", ico: "🗺", desc: "Faça o tour da escola com =" },
    { id: "fala", nome: "Bom ouvinte", ico: "🗣", desc: "Ouça o Mosquitão da rua" },
    { id: "sobreviver", nome: "Sobrevivente", ico: "⏱", desc: "Fique 3 minutos vivo numa partida" },
    { id: "colecionador", nome: "Colecionador", ico: "🎨", desc: "Desbloqueie 5 skins" },
    { id: "todas", nome: "Lenda do enxame", ico: "🏆", desc: "Desbloqueie todas as skins" },
    { id: "dez", nome: "Caçador de conquistas", ico: "🥇", desc: "Conquiste 10 medalhas" },
    { id: "enfermaria", nome: "Dodói", ico: "🩹", desc: "Visite a enfermaria" },
    { id: "auditorio", nome: "Plateia", ico: "🎭", desc: "Visite o auditório" },
    { id: "explorador", nome: "Explorador", ico: "🧭", desc: "Visite todas as salas da escola" },
    { id: "carteira", nome: "Bom cidadão", ico: "🎒", desc: "Devolva uma carteira perdida (tecla B)" },
  ],
  // HUMANOS: [nome, x1, z1, x2, z2] — andam entre os dois pontos
  HUMANOS: [
    ["a professora de Matemática", -55, -39.5, -43, -39.5],
    ["o professor de Biologia",    -13, -39.5,  -1, -39.5],
    ["um aluno no corredor",       -66,   2,   106,   2],
    ["uma aluna no corredor",       50,  -2,   -50,  -2],
    ["a bibliotecária",             23, -36,    23, -14],
    ["a merendeira",               -49,  14,   -49,  36],
    ["um aluno comendo",           -31,  36,   -31,  14],
    ["o jogador de basquete",        5,  22,    30,  34],
    ["a enfermeira",                90, -44,    90, -14],
    ["o diretor no palco",          80,  44,   101,  44, 2],
    ["uma aluna no auditório",      90,  14,    90,  34],
    ["o zelador do corredor",      105,   0,    62,   0],
  ],
  // SALAS: [nome, x0, x1, z0, z1] — usadas para "salas visitadas" e a conquista Explorador
  SALAS: [["Corredor", -70, 110, -8, 8], ["Sala 1", -70, -28, -50, -8], ["Sala 2", -28, 14, -50, -8], ["Biblioteca", 14, 42, -50, -8], ["Laboratório", 42, 71, -50, -8],
    ["Enfermaria", 71, 110, -50, -8], ["Cantina", -70, -10, 8, 50], ["Ginásio", -10, 45, 8, 50], ["Banheiro", 45, 71, 8, 50], ["Auditório", 71, 110, 8, 50]],
  UPS: { asas: { base: 12, nome: "Asas" }, tromba: { base: 15, nome: "Tromba" }, estomago: { base: 20, nome: "Estômago" }, corpo: { base: 18, nome: "Corpo" } },
};
const $ = (id) => document.getElementById(id);
const { clamp } = THREE.MathUtils;
const amort = (k, dt) => 1 - Math.exp(-k * dt);   // amortecimento independente de FPS
const V = (x, y, z) => new THREE.Vector3(x, y, z);

// ------------------------------------------------------------
// ESTADO + PERSISTÊNCIA
// ------------------------------------------------------------
class GameState {
  constructor() {
    this.sangue = 0;
    this.nv = { asas: 0, tromba: 0, estomago: 0, corpo: 0 };
    this.skins = []; this.skin = null; this.picadas = 0;
    this.conq = []; this.salas = []; this.carteiras = 0;
    try {
      const s = JSON.parse(localStorage.getItem(CFG.SAVE));
      if (s && s.nv) { this.sangue = +s.sangue || 0; for (const k in this.nv) this.nv[k] = +s.nv[k] || 0; }
      if (s) { const mig = (k) => (k === "arcoiris" ? "pixel" : k); this.skins = Array.isArray(s.skins) ? s.skins.map(mig).filter((k) => CFG.SKINS[k]) : []; this.skin = CFG.SKINS[mig(s.skin)] ? mig(s.skin) : null; this.picadas = +s.picadas || 0; this.conq = Array.isArray(s.conq) ? s.conq : []; this.salas = Array.isArray(s.salas) ? s.salas : []; this.carteiras = +s.carteiras || 0; }
    } catch (e) { /* sem save */ }
  }
  salvar() { try { localStorage.setItem(CFG.SAVE, JSON.stringify({ sangue: this.sangue, nv: this.nv, skins: this.skins, skin: this.skin, picadas: this.picadas, conq: this.conq, salas: this.salas, carteiras: this.carteiras })); } catch (e) {} }
  get total() { return this.nv.asas + this.nv.tromba + this.nv.estomago + this.nv.corpo; }
  get estagio() { let e = CFG.ESTAGIOS[0]; for (const x of CFG.ESTAGIOS) if (this.total >= x.min) e = x; return e; }
  custo(k) { return Math.floor(CFG.UPS[k].base * Math.pow(CFG.CRESCE, this.nv[k])); }
  get velMax() { return 4 + this.nv.asas * 0.5; }
  get raioColeta() { return 0.9 + this.nv.tromba * 0.15; }
  get valorGota() { return 1 + this.nv.estomago * 2; }
  get staminaMax() { return 100 + this.nv.corpo * 15; }
  get regenStamina() { return 25 + this.nv.corpo * 4; }
  get vidaMax() { return 100 + this.nv.corpo * 12; }
}

// ------------------------------------------------------------
// ÁUDIO PROCEDURAL (Web Audio API, sem arquivos)
// ------------------------------------------------------------
// ------------------------------------------------------------
// ÁUDIO PROCEDURAL (Web Audio API + Música Externa)
// ------------------------------------------------------------
// ------------------------------------------------------------
// ÁUDIO PROCEDURAL (Web Audio API + Música Externa)
// ------------------------------------------------------------
// ------------------------------------------------------------
// ÁUDIO PROCEDURAL (Web Audio API Avançada) + Música do Caminhão
// ------------------------------------------------------------
class AudioSystem {
  constructor() {
    this.ctx = null;
    this.mudo = false;
    
    // Áudio externo exclusivo para a skin "Caminhão de som"
    this.musicaCarreta = new Audio("sound/e_sexta.mp3");
    this.musicaCarreta.loop = true;
    this.musicaCarreta.volume = 0.5;
  }
  
  iniciar() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      const c = this.ctx = new AC();
      this.mestre = c.createGain(); this.mestre.gain.value = 0.4; this.mestre.connect(c.destination);
      const n = c.sampleRate; this.ruido = c.createBuffer(1, n, n);
      const d = this.ruido.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
      
      // Zumbido contínuo: dois osciladores + vibrato, filtrados
      this.zum = c.createGain(); this.zum.gain.value = 0;
      const f = c.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 1400;
      this.o1 = c.createOscillator(); this.o1.type = "sawtooth";
      this.o2 = c.createOscillator(); this.o2.type = "square"; this.o2.detune.value = 14;
      const lfo = c.createOscillator(), lg = c.createGain(); lfo.frequency.value = 7; lg.gain.value = 6;
      lfo.connect(lg); lg.connect(this.o1.frequency); lg.connect(this.o2.frequency);
      this.o1.connect(f); this.o2.connect(f); f.connect(this.zum); this.zum.connect(this.mestre);
      [this.o1, this.o2, lfo].forEach((o) => o.start());
    }
    if (this.ctx.state === "suspended") this.ctx.resume();
  }

  // Toca ou pausa a música externa consoante a skin selecionada e o estado do mudo
  tocarMúsicaCarreta(t, ativa) {
    if (this.mudo || !ativa) {
      if (!this.musicaCarreta.paused) this.musicaCarreta.pause();
      return;
    }
    if (this.musicaCarreta.paused) {
      this.musicaCarreta.play().catch(() => {});
    }
  }

  alternarMudo() { 
    this.mudo = !this.mudo; 
    if (this.mudo) {
      if (this.ctx) this.zum.gain.value = 0;
      if (!this.musicaCarreta.paused) this.musicaCarreta.pause();
    }
    return this.mudo; 
  }

  zumbir(v, sprint) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime, f = 190 + v * 70 + (sprint ? 90 : 0);
    this.o1.frequency.setTargetAtTime(f, t, 0.08); this.o2.frequency.setTargetAtTime(f * 2.01, t, 0.08);
    this.zum.gain.setTargetAtTime(this.mudo ? 0 : 0.03 + v * 0.035, t, 0.1);
  }

  silenciar() { 
    if (this.ctx) this.zum.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05); 
    if (!this.musicaCarreta.paused) this.musicaCarreta.pause();
  }

  tom(f0, f1, dur, tipo = "sine", vol = 0.2, at = 0) {
    if (!this.ctx || this.mudo) return;
    const c = this.ctx, t = c.currentTime + at, o = c.createOscillator(), g = c.createGain();
    o.type = tipo; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(f1, 20), t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(this.mestre); o.start(t); o.stop(t + dur + 0.02);
  }

  sopro(dur, freq, vol) {
    if (!this.ctx || this.mudo) return;
    const c = this.ctx, t = c.currentTime, s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    s.buffer = this.ruido; f.type = "bandpass"; f.frequency.value = freq; f.Q.value = 0.8;
    g.gain.setValueAtTime(0.001, t); g.gain.linearRampToValueAtTime(vol, t + 0.08); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    s.connect(f); f.connect(g); g.connect(this.mestre); s.start(t); s.stop(t + dur);
  }

  clique() { this.tom(660, 880, 0.06, "square", 0.07); }
  slurp(dourada) { this.tom(260, 720, 0.16, "sine", 0.3); this.tom(900, 400, 0.1, "triangle", 0.12, 0.1); if (dourada) this.tom(1200, 1800, 0.25, "sine", 0.12, 0.15); }
  veneno() { this.tom(220, 60, 0.5, "sawtooth", 0.25); }
  dano() { this.tom(150, 50, 0.3, "square", 0.22); this.sopro(0.2, 800, 0.2); }
  alerta() { this.tom(880, 660, 0.15, "square", 0.1); this.tom(880, 660, 0.15, "square", 0.1, 0.22); }
  spray() { this.sopro(1.4, 3200, 0.25); }
  picada() { this.tom(900, 300, 0.12, "sawtooth", 0.15); this.sopro(0.25, 600, 0.25); this.tom(200, 500, 0.2, "sine", 0.25, 0.1); }
  tapa() { this.sopro(0.15, 1500, 0.5); this.tom(120, 40, 0.2, "square", 0.3); }
  egg() { [523, 659, 784, 1047, 1319].forEach((f, i) => this.tom(f, f * 1.01, 0.3, "square", 0.08, i * 0.08)); }
  evolucao() { [440, 554, 659, 880].forEach((f, i) => this.tom(f, f * 1.01, 0.25, "triangle", 0.15, i * 0.1)); }
}

// ------------------------------------------------------------
// INTERFACE (usa o HTML existente; cria só o que faltar)
// ------------------------------------------------------------
class UIManager {
  constructor() {
    const mk = (id, css) => {
      let e = $(id);
      if (!e) { e = document.createElement("div"); e.id = id; e.style.cssText = css; document.body.appendChild(e); }
      return e;
    };
    this.vidaBox = mk("hud-vida", "position:fixed;top:36px;right:22px;width:150px;height:8px;border-radius:4px;background:rgba(255,255,255,.12);overflow:hidden;z-index:5");
    this.vidaFill = this.vidaBox.firstChild || this.vidaBox.appendChild(Object.assign(document.createElement("i"), {}));
    this.vidaFill.style.cssText = "display:block;height:100%;width:100%;background:#ff4d6d;transition:width .15s";
    this.alertaEl = mk("hud-alerta", "position:fixed;top:14%;left:50%;transform:translateX(-50%);font:800 1.3rem Syne,system-ui,sans-serif;color:#ffd84d;text-shadow:0 2px 12px #000;pointer-events:none;opacity:0;transition:opacity .2s;z-index:5");
    this.vinheta = mk("hud-vinheta", "position:fixed;inset:0;pointer-events:none;opacity:0;z-index:4");
    this.flashV = 0; this.base = 0; this.cache = {};
  }
  _w(el, pct) { const v = Math.round(clamp(pct, 0, 100)); if (this.cache[el.id || el] !== v) { this.cache[el.id || el] = v; el.style.width = v + "%"; } }
  hud(S) {
    $("sangue").textContent = Math.floor(S.sangue);
    $("estagio").textContent = S.estagio.nome;
    $("nivel").textContent = S.total;
    for (const k in CFG.UPS) {
      const nv = document.querySelector(`[data-nv="${k}"]`), ct = document.querySelector(`[data-custo="${k}"]`), bt = document.querySelector(`[data-up="${k}"]`);
      if (nv) nv.textContent = "nv " + S.nv[k];
      if (ct) ct.textContent = S.custo(k);
      if (bt) bt.classList.toggle("pode", S.sangue >= S.custo(k));
    }
  }
  barras(stamina, staminaMax, vida, vidaMax) {
    const st = $("stamina");
    if (st) { this._w(st, (stamina / staminaMax) * 100); st.classList.toggle("baixa", stamina < staminaMax * 0.25); }
    this._w(this.vidaFill, (vida / vidaMax) * 100);
  }
  combo(combo, t, boost) {
    const box = $("combo-container") || $("combo");
    if (!box) return;
    box.hidden = combo < 2 && boost <= 0;
    const n = $("combo-n"), m = $("combo-multiplicador"), f = $("combo-barra-fill");
    if (n) n.textContent = combo;
    if (m) m.textContent = "x" + combo + (boost > 0 ? " · XP×2" : "");
    if (f) f.style.width = Math.max(0, (t / CFG.COMBO_T) * 100) + "%";
  }
  alerta(txt, cor = "#ffd84d") { const ch = txt + cor; if (this._al === ch) return; this._al = ch; this.alertaEl.textContent = txt || ""; this.alertaEl.style.color = cor; this.alertaEl.style.opacity = txt ? 1 : 0; }
  flash(cor) { this.vinheta.style.boxShadow = `inset 0 0 160px 50px ${cor}`; this.flashV = 1; this._pc = null; }
  perigo(cor, v) { if (v > 0 && this._pc !== cor) { this._pc = cor; this.vinheta.style.boxShadow = `inset 0 0 160px 40px ${cor}`; } this.base = v; }
  atualizar(dt) {
    this.flashV = Math.max(0, this.flashV - dt * 2.5);
    this.vinheta.style.opacity = Math.max(this.flashV, this.base).toFixed(2);
  }
  retrigger(el, c) { el.classList.remove(c); void el.offsetWidth; el.classList.add(c); }
  toast(txt) { const e = $("toast"); if (!e) return; e.textContent = txt; this.retrigger(e, "mostra"); }
  evolucao(nome) { $("evo-txt").textContent = nome; this.retrigger($("evo"), "mostra"); }
  // ---- Menu de coleção: abas Skins (K) e Conquistas (C) ----
  construirColecao() {
    if (this.colBox) return this.colBox;
    const box = document.createElement("div"); box.id = "menu-colecao";
    box.style.cssText = "position:fixed;inset:0;display:none;align-items:center;justify-content:center;background:rgba(6,4,14,.88);z-index:20;font-family:Syne,Figtree,system-ui,sans-serif";
    box.innerHTML = '<section style="width:min(980px,95vw);max-height:90vh;overflow:auto;background:rgba(14,12,24,.97);border:1px solid rgba(255,216,77,.3);border-radius:16px;padding:22px 26px;color:#eef2f8">'
      + '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:16px">'
      + '<button data-aba="skins" class="col-aba"></button><button data-aba="conq" class="col-aba"></button><span style="flex:1"></span>'
      + '<button id="col-fechar" style="font:800 .85rem Syne,sans-serif;color:#0e0c18;background:#ffd84d;border:0;border-radius:10px;padding:9px 18px;cursor:pointer">Voltar ao jogo (Esc)</button></div>'
      + '<div id="col-conteudo"></div></section>';
    document.body.appendChild(box);
    this.colBox = box; this.colConteudo = box.querySelector("#col-conteudo");
    box.querySelector("#col-fechar").addEventListener("click", () => this.aoFechar && this.aoFechar());
    box.addEventListener("click", (e) => { if (e.target === box && this.aoFechar) this.aoFechar(); });
    return box;
  }
  abrirColecao(S, aba, api) {
    const box = this.construirColecao(); this.aoFechar = api.fechar;
    const hex = (c) => "#" + (c >>> 0).toString(16).padStart(6, "0");
    box.querySelectorAll(".col-aba").forEach((b) => {
      const ativa = b.dataset.aba === aba;
      b.textContent = b.dataset.aba === "skins" ? `🎨 Skins ${S.skins.length}/${Object.keys(CFG.SKINS).length}` : `🏆 Conquistas ${S.conq.length}/${CFG.CONQ.length}`;
      b.style.cssText = `font:800 .9rem Syne,sans-serif;border-radius:10px;padding:9px 16px;cursor:pointer;color:${ativa ? "#0e0c18" : "#eef2f8"};background:${ativa ? "#ffd84d" : "rgba(255,255,255,.07)"};border:1px solid rgba(255,216,77,.35)`;
      b.onclick = () => api.aba(b.dataset.aba);
    });
    const h = [];
    if (aba === "skins") {
      const card = (id, sk, tem) => {
        const cor = sk ? hex(sk.brilho) : "#555b66", dono = (S.skin || null) === id, pode = !sk || tem;
        const nota = !sk ? (dono ? "em uso" : "clique para usar") : tem ? (dono ? "em uso" : "clique para usar") : "🔒 " + sk.dica;
        return `<button data-skin="${id || ""}" ${pode ? "" : "disabled"} style="text-align:left;cursor:${pode ? "pointer" : "not-allowed"};background:rgba(255,255,255,${id && tem ? ".06" : ".02"});border:1px solid ${dono ? cor : "rgba(255,255,255,.12)"};border-radius:12px;padding:14px 16px;color:#eef2f8">`
          + `<span style="display:flex;align-items:center;gap:9px"><i style="width:14px;height:14px;border-radius:50%;background:${cor};display:inline-block;filter:${id && !tem ? "grayscale(1) brightness(.5)" : "none"}"></i>`
          + `<b style="font:800 .95rem Syne,sans-serif">${sk ? (tem ? sk.nome : "???") : "Skin padrão"}</b></span>`
          + `<small style="display:block;margin-top:6px;font:600 .74rem/1.45 Figtree,sans-serif;color:#98a0af">${nota}</small></button>`;
      };
      h.push(card(null, null, true)); for (const id of Object.keys(CFG.SKINS)) h.push(card(id, CFG.SKINS[id], S.skins.includes(id)));
      this.colConteudo.innerHTML = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:12px">' + h.join("") + "</div>"
        + '<p style="margin:16px 0 0;font:600 .78rem Figtree,sans-serif;color:#7f8798">Ache os easter eggs pela escola para liberar as skins escondidas. H dá uma dica.</p>';
      this.colConteudo.querySelectorAll("[data-skin]").forEach((b) => b.addEventListener("click", () => { if (!b.disabled) api.escolher(b.dataset.skin || null); }));
    } else {
      const pct = Math.round((S.conq.length / CFG.CONQ.length) * 100);
      const stats = [["🩸", Math.floor(S.sangue), "sangue"], ["🧬", S.total, "nível"], ["🦟", S.picadas, "picadas"], ["🏫", S.salas.length + "/" + CFG.SALAS.length, "salas"], ["🎨", S.skins.length + "/" + Object.keys(CFG.SKINS).length, "skins"]]
        .map(([i, v, n]) => `<span style="background:rgba(255,255,255,.06);border-radius:10px;padding:8px 12px;font:600 .8rem Figtree,sans-serif"><b style="font:800 1rem Syne,sans-serif">${i} ${v}</b> <span style="color:#98a0af">${n}</span></span>`).join("");
      const itens = CFG.CONQ.map((c) => {
        const tem = S.conq.includes(c.id), p = tem ? null : api.progresso(c.id);
        const barra = p ? `<div style="margin-top:8px;height:5px;border-radius:3px;background:rgba(255,255,255,.1);overflow:hidden"><i style="display:block;height:100%;width:${Math.round(p.v / p.max * 100)}%;background:#ffd84d"></i></div><small style="font:600 .68rem Figtree,sans-serif;color:#7f8798">${Math.floor(p.v)} / ${p.max}</small>` : "";
        return `<div style="display:flex;gap:12px;align-items:flex-start;background:rgba(255,255,255,${tem ? ".07" : ".025"});border:1px solid ${tem ? "rgba(255,216,77,.45)" : "rgba(255,255,255,.1)"};border-radius:12px;padding:12px 14px;opacity:${tem ? 1 : 0.78}">`
          + `<span style="font-size:1.7rem;filter:${tem ? "none" : "grayscale(1) brightness(.6)"}">${c.ico}</span><span style="flex:1"><b style="display:block;font:800 .92rem Syne,sans-serif;color:${tem ? "#ffd84d" : "#eef2f8"}">${c.nome}</b>`
          + `<small style="font:600 .74rem/1.4 Figtree,sans-serif;color:#98a0af">${c.desc}</small>${barra}</span>${tem ? '<span style="color:#7dff9a;font-weight:800">✔</span>' : ""}</div>`;
      }).join("");
      this.colConteudo.innerHTML = `<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px">${stats}</div>`
        + `<div style="height:8px;border-radius:4px;background:rgba(255,255,255,.1);overflow:hidden;margin-bottom:16px"><i style="display:block;height:100%;width:${pct}%;background:linear-gradient(90deg,#ffd84d,#ff8a3d)"></i></div>`
        + `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:10px">${itens}</div>`;
    }
    box.style.display = "flex";
    document.exitPointerLock?.();
  }
  colecaoAberta() { return !!this.colBox && this.colBox.style.display === "flex"; }
  fecharColecao() { if (this.colBox) this.colBox.style.display = "none"; }

  // ---- Caixa de diálogo grande (tour da escola) ----
  dialogo(titulo, texto, rodape, ms) {
    if (!this.dlg) {
      const e = document.createElement("div"); e.id = "hud-dialogo";
      e.style.cssText = "position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);width:min(560px,90vw);background:rgba(12,10,22,.96);border:1px solid rgba(255,216,77,.4);border-radius:14px;padding:20px 24px;z-index:8;color:#eef2f8;font-family:Figtree,system-ui,sans-serif;display:none";
      e.addEventListener("click", () => this.fecharDialogo()); document.body.appendChild(e); this.dlg = e;
    }
    this.dlg.innerHTML = `<b style="display:block;font:800 1.1rem Syne,sans-serif;color:#ffd84d;margin-bottom:10px"></b><div style="white-space:pre-line;font:600 .9rem/1.55 Figtree,sans-serif"></div><small style="display:block;margin-top:12px;color:#7f8798"></small>`;
    this.dlg.children[0].textContent = titulo; this.dlg.children[1].textContent = texto; this.dlg.children[2].textContent = rodape || "";
    this.dlg.style.display = "block"; clearTimeout(this.dlgT); this.dlgT = setTimeout(() => this.fecharDialogo(), ms || 8000);
  }
  dialogoAberto() { return !!this.dlg && this.dlg.style.display === "block"; }
  fecharDialogo() { if (this.dlg) this.dlg.style.display = "none"; }

  // Botões extras no menu inicial/pausa
  atalhos(aoSkins, aoConq) {
    const host = document.querySelector("#menu .painel") || $("menu"); if (!host || $("menu-atalhos")) return;
    const d = document.createElement("div"); d.id = "menu-atalhos"; d.style.cssText = "display:flex;gap:8px;margin-top:12px";
    for (const [t, f] of [["🎨 Skins (K)", aoSkins], ["🏆 Conquistas (C)", aoConq]]) {
      const b = document.createElement("button"); b.textContent = t; b.addEventListener("click", f);
      b.style.cssText = "flex:1;padding:10px;border-radius:10px;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.07);color:#efe6dc;font:inherit;font-weight:600;cursor:pointer";
      d.appendChild(b);
    }
    host.appendChild(d);
  }

  menu(titulo, botao) { const m = $("menu"); m.hidden = false; m.querySelector("h1").textContent = titulo; $("btn-jogar").textContent = botao; }
  esconderMenu() { $("menu").hidden = true; }
  saveInfo(S) { const e = $("save-info"); if (e) e.textContent = S.total > 0 ? `Progresso salvo: ${S.estagio.nome}, ${Math.floor(S.sangue)} de sangue.` : ""; }
  ligar(aoEvoluir, aoJogar) {
    document.querySelectorAll(".up").forEach((b) => b.addEventListener("click", () => aoEvoluir(b.dataset.up)));
    $("btn-jogar").addEventListener("click", aoJogar);
  }
}

// Frases do Mosquitão da rua (estátua do auditório)
const moFrases = [
  "Mosquitão da rua diz: AÇÚCAR! AÇÚCAR! AÇÚCAR!",
  "Mosquitão da rua diz: eu era de enfeite, agora sou seu ídolo.",
  "Mosquitão da rua diz: sangue de aluno é mais doce.",
  "Mosquitão da rua diz: repelente? nunca ouvi falar.",
  "Mosquitão da rua diz: picada em gente grande vale por dez gotas.",
  "Mosquitão da rua diz: cuidado com o tapa, eu já levei vários.",
];

// ------------------------------------------------------------
// MODELO DO MOSQUITO (morfologia muda com cada evolução)
// ------------------------------------------------------------
function construirMosquito(S) {
const nivelTotal = () => S.total, estagioAtual = () => S.estagio, ESTAGIOS = CFG.ESTAGIOS;
// ------------------------------------------------------------
// MOSQUITO
// ------------------------------------------------------------
const mosquito = new THREE.Group();
const corpoG = new THREE.Group(); mosquito.add(corpoG);   // tórax, cabeça, olhos, antenas, palpos, pernas
const mat = (cor, extra = {}) => new THREE.MeshStandardMaterial({ color: cor, roughness: 0.5, ...extra });
const matCorpo = mat(0x1c1c22), matAbd = mat(0x2a1a20), matPerna = mat(0x0b0b0e, { roughness: 0.8 });
const matPale = mat(0xe8e2d6, { roughness: 0.6 });
const matOlho = new THREE.MeshStandardMaterial({ color: 0x050507, emissive: 0xffb45c, emissiveIntensity: 0.5, roughness: 0.1 });
const matAsa = new THREE.MeshStandardMaterial({ color: 0xd8e9ef, transparent: true, opacity: 0.4, side: THREE.DoubleSide, roughness: 0.2 });
const matVeia = new THREE.MeshBasicMaterial({ color: 0x8fa3ab, transparent: true, opacity: 0.55 });
const matOuro = mat(0xffd84d, { metalness: 0.6, roughness: 0.3, emissive: 0xaa7700, emissiveIntensity: 0.6 });
const matBrilho = mat(0xff1744, { emissive: 0xff1744, emissiveIntensity: 1.3 });
const matEspinho = mat(0x2b1020, { roughness: 0.4 });
const matBordaAsa = new THREE.LineBasicMaterial({ color: 0xffb45c });

function tubo(a, b, r, m) {
  const d = new THREE.Vector3().subVectors(b, a);
  const t = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 0.85, d.length(), 6), m);
  t.position.copy(a).addScaledVector(d, 0.5);
  t.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
  return t;
}
function elipsoide(r, sx, sy, sz, m, x, y, z) {
  const e = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), m);
  e.scale.set(sx, sy, sz); e.position.set(x, y, z); return e;
}
function cone(r, h, m, x, y, z, rx = 0, rz = 0) {
  const c = new THREE.Mesh(new THREE.ConeGeometry(r, h, 8), m);
  c.position.set(x, y, z); c.rotation.set(rx, 0, rz); return c;
}

// O mosquito aponta para -Z (cabeça na frente)

// Tórax com giba e faixa clara nas costas
corpoG.add(elipsoide(0.18, 1, 0.95, 1.4, matCorpo, 0, 0.0, 0.05));
corpoG.add(elipsoide(0.13, 0.95, 1, 1.3, matCorpo, 0, 0.07, 0.02));
corpoG.add(elipsoide(0.05, 0.35, 0.25, 3, matPale, 0, 0.195, 0.03));

// Cabeça e olhos compostos
corpoG.add(elipsoide(0.11, 1.05, 0.95, 1, matCorpo, 0, 0, -0.26));
const olhos = [1, -1].map((l) => {
  const o = elipsoide(0.085, 0.75, 1, 0.85, matOlho, l * 0.09, 0.03, -0.28);
  corpoG.add(o); return o;
});

// Tromba (haste escalável + ponta), palpos e antenas
const trompa = new THREE.Group();
trompa.position.set(0, -0.03, -0.33); trompa.rotation.x = -0.1;
const hasteGrupo = new THREE.Group();
const haste = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.014, 0.7, 6), matPerna);
haste.rotation.x = -Math.PI / 2; haste.position.z = -0.35;
hasteGrupo.add(haste);
const laminas = new THREE.Group();
for (const l of [1, -1]) laminas.add(tubo(V(l * 0.035, 0, -0.05), V(l * 0.012, 0, -0.55), 0.006, matBrilho));
hasteGrupo.add(laminas);
const ponta = cone(0.02, 0.1, matBrilho, 0, 0, -0.73, -Math.PI / 2);
trompa.add(hasteGrupo, ponta);
mosquito.add(trompa);

for (const l of [1, -1]) {
  corpoG.add(tubo(V(l * 0.05, -0.01, -0.3), V(l * 0.07, -0.03, -0.52), 0.007, matPerna));
  const ant = new THREE.Group();
  ant.add(tubo(V(l * 0.04, 0.07, -0.32), V(l * 0.1, 0.17, -0.4), 0.006, matPerna),
          tubo(V(l * 0.1, 0.17, -0.4), V(l * 0.16, 0.3, -0.46), 0.004, matPerna));
  corpoG.add(ant);
}

// Abdômen segmentado com anéis claros e curva suave
const abdomen = new THREE.Group(); abdomen.position.z = 0.3; mosquito.add(abdomen);
const abdomenCorpo = new THREE.Group(); abdomen.add(abdomenCorpo);
for (let i = 0; i < 7; i++) {
  const r = 0.17 * (1 - i * 0.08), z = 0.08 + i * 0.13, y = -i * i * 0.0035;
  abdomenCorpo.add(elipsoide(r, 0.85, 0.85, 0.95, matAbd, 0, y, z));
  const anel = new THREE.Mesh(new THREE.TorusGeometry(r * 0.84, 0.011, 6, 18), matPale);
  anel.position.set(0, y, z - 0.055); abdomenCorpo.add(anel);
}
abdomenCorpo.add(cone(0.025, 0.1, matPerna, 0, -0.14, 1.02, Math.PI / 2));

// Asas finas com nervuras, contorno brilhante e halteres
const asas = [], brilhoAsas = [];
function criarAsa(lado) {
  const f = new THREE.Shape();
  f.moveTo(0, 0); f.quadraticCurveTo(0.35, 0.06, 0.8, 0.03); f.quadraticCurveTo(1.0, 0, 1.1, -0.04);
  f.quadraticCurveTo(0.8, -0.1, 0.4, -0.08); f.quadraticCurveTo(0.12, -0.05, 0, 0);
  const malha = new THREE.Mesh(new THREE.ShapeGeometry(f), matAsa);
  malha.rotation.x = -Math.PI / 2; malha.scale.x = lado;
  malha.add(tubo(V(0, 0, 0.002), V(1.0, -0.03, 0.002), 0.005, matVeia),
            tubo(V(0, 0, 0.002), V(0.75, 0.04, 0.002), 0.004, matVeia),
            tubo(V(0.1, 0, 0.002), V(0.65, -0.08, 0.002), 0.004, matVeia));
  const borda = new THREE.LineSegments(new THREE.EdgesGeometry(malha.geometry), matBordaAsa);
  borda.position.z = 0.004; malha.add(borda); brilhoAsas.push(borda);
  const pivo = new THREE.Group(); pivo.position.set(lado * 0.1, 0.17, 0.0); pivo.userData.lado = lado; pivo.add(malha);
  mosquito.add(pivo); asas.push(pivo);
  const halt = new THREE.Group(); halt.position.set(lado * 0.1, 0.05, 0.22);
  halt.add(tubo(V(0, 0, 0), V(lado * 0.07, 0, 0.07), 0.005, matPale), elipsoide(0.015, 1, 1, 1, matPale, lado * 0.07, 0, 0.07));
  corpoG.add(halt);
}
criarAsa(1); criarAsa(-1);

// Pernas longas: coxa, canela e tarso com articulações claras
const pernas = [];
function criarPerna(lado, z, joelho, ponta) {
  const g = new THREE.Group(); g.position.set(lado * 0.12, -0.05, z);
  const j = V(lado * joelho[0], joelho[1], joelho[2]), p = V(lado * ponta[0], ponta[1], ponta[2]);
  g.add(tubo(V(0, 0, 0), j, 0.011, matPerna), tubo(j, p, 0.006, matPerna),
        elipsoide(0.02, 1, 1, 1, matPale, j.x, j.y, j.z), elipsoide(0.015, 1, 1, 1.6, matPale, p.x, p.y, p.z));
  corpoG.add(g); pernas.push(g);
}
for (const l of [1, -1]) {
  criarPerna(l, -0.13, [0.28, -0.14, -0.1], [0.6, -0.34, -0.34]);
  criarPerna(l, 0, [0.34, -0.16, 0], [0.78, -0.4, 0]);
  criarPerna(l, 0.13, [0.3, -0.12, 0.08], [0.82, -0.34, 0.46]);
}

// Extras que surgem com os estágios
const espinhos = new THREE.Group();   // Caçador noturno
for (let i = 0; i < 5; i++) espinhos.add(cone(0.025, 0.13, matEspinho, 0, 0.25, -0.1 + i * 0.075));
for (const l of [1, -1]) espinhos.add(cone(0.02, 0.14, matEspinho, l * 0.05, 0.14, -0.3, -0.5, -l * 0.3));
const presas = new THREE.Group();     // Vampiro alado
for (const l of [1, -1]) presas.add(cone(0.014, 0.1, matPale, l * 0.03, -0.1, -0.37, Math.PI));
const coroa = new THREE.Group();      // Rei do enxame
coroa.position.set(0, 0.12, -0.26);
for (let i = 0; i < 6; i++) {
  const a = (i / 6) * Math.PI * 2;
  coroa.add(cone(0.02, 0.1, matOuro, Math.cos(a) * 0.07, 0.04, Math.sin(a) * 0.07));
}
corpoG.add(espinhos, presas, coroa);
const saiaG = new THREE.Group(); saiaG.visible = false;   // skin "Caminhão de som": caixas de som sob o corpo
saiaG.add(new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.3, 1.1), mat(0x15151f, { roughness: 0.6 })));
for (const l of [1, -1]) { const d = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.06, 16), mat(0xff44aa, { emissive: 0xff44aa, emissiveIntensity: 1 })); d.rotation.x = Math.PI / 2; d.position.set(l * 0.24, 0, -0.56); saiaG.add(d); }
saiaG.position.set(0, -0.3, 0.05); corpoG.add(saiaG);

const luzCorpo = new THREE.PointLight(0xffb45c, 0, 5);
mosquito.add(luzCorpo);

mosquito.position.set(0, 2, 0);

let escalaBase = 1.2, punch = 0;   // tamanho original do corpo

const medir = (cs, comp, c, ab) => Math.max(0.1 * cs + 1.1 * comp, 0.33 * cs + 0.75 * c, 0.3 * cs + 1.1 * ab, 0.85 * cs);
const RAIO_BASE = medir(1, 1, 1, 1);
let zoom = 1;   // tamanho atual relativo ao inicial (a câmera usa isto)

function aplicarEvolucaoVisual() {
  const n = nivelTotal(), est = estagioAtual(), idx = ESTAGIOS.indexOf(est);
  const a = S.nv.asas, tr = S.nv.tromba, es = S.nv.estomago, co = S.nv.corpo;

  // CORPO: só tórax, cabeça, olhos, antenas, palpos e pernas (e reposiciona o que se prende neles)
  const cs = 1 + Math.min(co, 20) * 0.15;
  corpoG.scale.setScalar(cs);
  abdomen.position.z = 0.3 * cs;
  trompa.position.set(0, -0.03 * cs, -0.33 * cs);
  asas.forEach((p) => p.position.set(p.userData.lado * 0.1 * cs, 0.17 * cs, 0));

  // ASAS: só as asas (mais longas e largas, mais opacas, contorno brilhante no nv 3)
  const comp = 1 + Math.min(a, 20) * 0.22, larg = 1 + Math.min(a, 20) * 0.12;
  asas.forEach((p) => p.scale.set(comp, 1, larg));
  matAsa.opacity = Math.min(0.65, 0.4 + a * 0.03);
  matAsa.color.setHex(a >= 6 ? 0xcfeaff : a >= 3 ? 0xf0d8ff : 0xd8e9ef);
  matBordaAsa.color.setHex(est.cor);
  brilhoAsas.forEach((l) => { l.visible = a >= 3; });

  // TROMBA: só a tromba (comprimento, espessura, ponta brilhante no nv 2, lâminas no nv 5)
  const c = 1 + Math.min(tr, 20) * 0.3, e = 1 + Math.min(tr, 20) * 0.08;
  hasteGrupo.scale.set(e, e, c);
  ponta.position.z = -0.7 * c - 0.04; ponta.scale.setScalar(e);
  ponta.visible = tr >= 2; laminas.visible = tr >= 5;

  // ESTÔMAGO: só o abdômen (incha e avermelha)
  const abz = 1 + Math.min(es, 20) * 0.2, abx = 1 + Math.min(es, 20) * 0.12;
  abdomenCorpo.scale.set(abx, abx, abz);
  const k = Math.min(es / 8, 1);
  matAbd.color.setRGB(0.16 + k * 0.6, 0.1 * (1 - k) + 0.02, 0.12 * (1 - k) + 0.04);
  matAbd.emissive.setHex(0xff1030); matAbd.emissiveIntensity = k * 0.5;

  // Cores e extras por estágio (não alteram tamanhos)
  matOlho.emissive.setHex(est.cor); matOlho.emissiveIntensity = 0.5 + idx * 0.25;
  matCorpo.emissive.setHex(est.cor); matCorpo.emissiveIntensity = idx >= 3 ? 0.12 : 0;
  espinhos.visible = idx >= 2; presas.visible = idx >= 3; coroa.visible = idx >= 7;
  luzCorpo.color.setHex(est.cor); luzCorpo.intensity = Math.min(n * 0.12, 1.6);

  // SKIN (easter egg): sobrescreve cores e materiais, sem mudar tamanhos
  matCorpo.transparent = matAbd.transparent = false; matCorpo.opacity = matAbd.opacity = 1;
  matCorpo.metalness = 0; matCorpo.roughness = 0.5; matPerna.color.setHex(0x0b0b0e);
  if (!S.skin) matCorpo.color.setHex(0x1c1c22);
  const sk = S.skin && CFG.SKINS[S.skin];
  if (sk) {
    matCorpo.color.setHex(sk.corpo); matAbd.color.setHex(sk.abd); matPerna.color.setHex(sk.perna ?? sk.corpo);
    matCorpo.emissive.setHex(sk.brilho); matCorpo.emissiveIntensity = sk.ei;
    matAbd.emissive.setHex(sk.brilho); matAbd.emissiveIntensity = sk.ei;
    matOlho.emissive.setHex(sk.brilho); matBordaAsa.color.setHex(sk.brilho);
    luzCorpo.color.setHex(sk.brilho); luzCorpo.intensity = Math.max(luzCorpo.intensity, 0.6);
    if (sk.asa) matAsa.color.setHex(sk.asa);
    if (sk.metal) { matCorpo.metalness = 0.7; matCorpo.roughness = 0.25; }
    if (sk.alfa) { matCorpo.transparent = matAbd.transparent = true; matCorpo.opacity = matAbd.opacity = sk.alfa; }
  }
  // PIXELADA: textura 8x8 sem filtro + sombreamento facetado (visual de jogo 8-bit)
  const px = !!(sk && sk.pixel);
  matCorpo.map = px ? texPixel("corpo") : null; matAbd.map = px ? texPixel("abd") : null; matPerna.map = px ? texPixel("perna") : null;
  matAsa.map = px ? texPixel("asa") : null;
  for (const mm of [matCorpo, matAbd, matPerna, matOlho, matAsa]) { mm.flatShading = px; mm.needsUpdate = true; }
  if (px) { matPerna.color.setHex(0xffffff); matAsa.color.setHex(0xffffff); matAsa.opacity = 0.75; matOlho.emissive.setHex(0xff2244); matOlho.emissiveIntensity = 1.5; }
  // DENGUE: listras brancas no abdômen, joelhos brancos e a "lira" prateada no tórax
  const lis = !!(sk && sk.listras);
  matPale.color.setHex(lis ? 0xffffff : 0xe8e2d6); matPale.emissive.setHex(lis ? 0x777777 : 0x000000);
  matAbd.map = lis ? texListras() : matAbd.map; matPerna.map = lis ? texListras(true) : matPerna.map;
  if (lis) { matAbd.color.setHex(0xffffff); matPerna.color.setHex(0xffffff); matCorpo.map = texLira(); matCorpo.color.setHex(0xffffff); }
  for (const mm of [matCorpo, matAbd, matPerna, matPale]) mm.needsUpdate = true;
  matCorpo.needsUpdate = matAbd.needsUpdate = true;
  saiaG.visible = !!(sk && sk.saia);

  zoom = medir(cs, comp, c, abz) / RAIO_BASE;
}

// Texturas das skins (feitas uma vez e reaproveitadas)
const texCache = {};
function texCanvas(chave, w, h, desenhar, pixel) {
  if (texCache[chave]) return texCache[chave];
  const c = document.createElement("canvas"); c.width = w; c.height = h; desenhar(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c);
  if (pixel) { t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; }
  t.wrapS = t.wrapT = THREE.RepeatWrapping; return (texCache[chave] = t);
}
function texPixel(parte) {
  const pal = { corpo: ["#1b1b3a", "#2e2e6e", "#5a3fc0", "#33ff66"], abd: ["#7a0f2a", "#c0143c", "#ff4d6d", "#ffd84d"], perna: ["#101010", "#2a2a2a", "#33ff66", "#101010"], asa: ["#9be7ff", "#ffffff", "#5ac8fa", "#c8f4ff"] }[parte];
  return texCanvas("px-" + parte, 8, 8, (g) => { for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { g.fillStyle = pal[((x * 7 + y * 3 + ((x ^ y) & 3)) >> 1) % 4]; g.fillRect(x, y, 1, 1); } }, true);
}
function texListras(fino) {
  return texCanvas(fino ? "lis-f" : "lis", 64, 64, (g, w, h) => { g.fillStyle = "#121212"; g.fillRect(0, 0, w, h); g.fillStyle = "#f4f4f4"; const n = fino ? 6 : 7; for (let i = 0; i < n; i++) g.fillRect(0, (i + 0.65) * h / n, w, h / n * (fino ? 0.3 : 0.22)); });
}
function texLira() {
  return texCanvas("lira", 128, 64, (g, w, h) => { g.fillStyle = "#121212"; g.fillRect(0, 0, w, h); g.strokeStyle = "#f4f4f4"; g.lineWidth = 4;
    g.beginPath(); g.moveTo(52, 6); g.quadraticCurveTo(30, 32, 50, 58); g.moveTo(76, 6); g.quadraticCurveTo(98, 32, 78, 58); g.moveTo(60, 14); g.lineTo(60, 52); g.moveTo(68, 14); g.lineTo(68, 52); g.stroke(); });
}

// Animação das skins (chamada todo frame)
function tickSkin(t) {
  if (S.skin === "pixel") { 
    const k = Math.floor(t * 4) % 2; 
    matOlho.emissiveIntensity = k ? 1.8 : 0.9; 
    return; 
  }
  if (S.skin === "carreta") {
    // Efeito visual de luzes a piscar com o grave
    luzCorpo.intensity = 0.8 + (Math.sin(t * 12) + 1) * 0.8;
  }
}


return { mosquito, asas, abdomen, pernas, aplicar: aplicarEvolucaoVisual, tick: tickSkin,
  get escala() { return escalaBase; }, get zoom() { return zoom; }, get punch() { return punch; }, set punch(v) { punch = v; } };
}

// ------------------------------------------------------------
// OBJECT POOL genérico (sem alocação durante o jogo)
// ------------------------------------------------------------
class Pool {
  constructor(fabrica, n) { this.livres = []; for (let i = 0; i < n; i++) this.livres.push(fabrica()); }
  pegar() { return this.livres.pop() || null; }
  soltar(o) { this.livres.push(o); }
}

// ------------------------------------------------------------
// MUNDO: cenário com colisão, gotas, partículas e perigos
// ------------------------------------------------------------
class WorldManager {
  constructor(cena, audio) {
    this.cena = cena; this.audio = audio;
    this.col = [];                  // { mesh, box } estáticos
    this.perto = [];                // buffer reutilizável de malhas próximas
    this.raycaster = new THREE.Raycaster();
    this.dirs = [V(1, 0, 0), V(-1, 0, 0), V(0, 1, 0), V(0, -1, 0), V(0, 0, 1), V(0, 0, -1)];
    this.emPerigo = null; this.avisoGas = false;
    this.construirCenario(); this.criarGotas(); this.criarParticulas(); this.criarPerigos(); this.criarHumanos(); this.criarCarteira();
  }

  // Registra malha estática: matriz congelada + AABB pré-calculada
  fixo(mesh, x, y, z, ry = 0, rx = 0) {
    mesh.position.set(x, y, z); mesh.rotation.set(rx, ry, 0);
    this.cena.add(mesh); mesh.updateMatrix(); mesh.matrixAutoUpdate = false; mesh.updateMatrixWorld(true);
    this.col.push({ mesh, box: new THREE.Box3().setFromObject(mesh) });
    return mesh;
  }

  deco(mesh, x, y, z, ry = 0) {   // decoração sem colisão
    mesh.position.set(x, y, z); mesh.rotation.y = ry; this.cena.add(mesh); mesh.updateMatrix(); mesh.matrixAutoUpdate = false; return mesh;
  }

  // ESCOLA COMPLETA (180×100): corredor central, 2 salas, biblioteca, laboratório, cantina, ginásio e banheiro
  construirCenario() {
    const { X0, X1, MZ, YMIN: F, YMAX } = CFG;
    const M = (c, r = 0.7, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: r, ...o }), B = (c) => new THREE.MeshBasicMaterial({ color: c });
    const tela = (w, h) => { const c = document.createElement("canvas"); c.width = w; c.height = h; return [c, c.getContext("2d")]; };
    const tex = (c) => new THREE.CanvasTexture(c);
    const caixa = (w, h, d, mt, x, y, z) => this.fixo(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mt), x, y, z);
    const dbox = (w, h, d, mt, x, y, z) => this.deco(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mt), x, y, z);
    const cil = (rt, rb, h, mt, x, y, z) => this.fixo(new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, 14), mt), x, y, z);
    const chao = (w, d, mt, x, z) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mt); p.rotation.x = -Math.PI / 2; return this.deco(p, x, F + 0.06, z); };
    const janela = (x, z, ry) => this.deco(new THREE.Mesh(new THREE.PlaneGeometry(7, 8), B(0x1b2750)), x, F + 8, z, ry);

    // Texturas desenhadas em canvas
    const [cp, gp] = tela(64, 64); gp.fillStyle = "#b9b29a"; gp.fillRect(0, 0, 64, 64); gp.fillStyle = "#8f8a76"; gp.fillRect(0, 0, 32, 32); gp.fillRect(32, 32, 32, 32);
    const tPiso = tex(cp); tPiso.wrapS = tPiso.wrapT = THREE.RepeatWrapping; tPiso.repeat.set((X1 - X0) / 8, MZ / 4);
    const [cb, gb] = tela(128, 128); gb.fillStyle = "#3a2a1c"; gb.fillRect(0, 0, 128, 128);
    for (let r = 0; r < 4; r++) for (let x = 0; x < 128; x += 6) { gb.fillStyle = `hsl(${(Math.random() * 360) | 0},55%,45%)`; gb.fillRect(x, r * 32 + 4 + Math.random() * 6, 5, 24 - Math.random() * 4); }
    const [cq, gq] = tela(400, 260); gq.fillStyle = "#c8782f"; gq.fillRect(0, 0, 400, 260); gq.strokeStyle = "#fff"; gq.lineWidth = 4; gq.strokeRect(6, 6, 388, 248);
    gq.beginPath(); gq.moveTo(200, 6); gq.lineTo(200, 254); gq.stroke(); gq.beginPath(); gq.arc(200, 130, 38, 0, 7); gq.stroke(); gq.strokeRect(6, 80, 70, 100); gq.strokeRect(324, 80, 70, 100);
    const quadro = (a, b) => {
      const [c, g] = tela(512, 160); g.fillStyle = "#16372b"; g.fillRect(0, 0, 512, 160); g.fillStyle = "#e8e8e8"; g.textAlign = "center";
      g.font = "bold 44px sans-serif"; g.fillText(a, 256, 70); g.font = "30px sans-serif"; g.fillText(b, 256, 122); return M(0xffffff, 0.9, { map: tex(c) });
    };
    const placa = (t, x, z, lado) => {   // placa de porta, no lado do corredor
      const [c, g] = tela(256, 64); g.fillStyle = "#1e3a5f"; g.fillRect(0, 0, 256, 64); g.fillStyle = "#fff"; g.font = "bold 34px sans-serif"; g.textAlign = "center"; g.fillText(t, 128, 45);
      this.deco(new THREE.Mesh(new THREE.PlaneGeometry(9, 2.25), new THREE.MeshBasicMaterial({ map: tex(c) })), x, F + 11, lado * (8 - 0.55), lado > 0 ? Math.PI : 0);
    };
    const m = { piso: M(0xffffff, 0.55, { map: tPiso }), par: M(0x6f8f7a, 0.9), teto: M(0xcfd3d8, 0.9), mad: M(0x8a5a2e, 0.6), metal: M(0x4a5560, 0.4), cad: M(0x2f6fb5, 0.6),
      l1: M(0x3a5f8a), l2: M(0x2e4d70), tampo: M(0xd9c7a0, 0.5), estante: M(0xffffff, 0.8, { map: tex(cb) }), mesa: M(0xc9a36a, 0.6), banco: M(0xa0522d, 0.7),
      azul: M(0xe3edf2, 0.4), porc: M(0xf4f4f4, 0.2), bancada: M(0x2d3b44, 0.4), vidro: M(0x66ffaa, 0.2, { emissive: 0x22aa66, transparent: true, opacity: 0.4 }), laranja: M(0xff7a1a, 0.5) };

    // Luzes: ambiente, luar e 8 lâmpadas (a do corredor pisca)
    this.cena.add(new THREE.AmbientLight(0x8a8fb0, 0.95));
    const lua = new THREE.DirectionalLight(0x7692ff, 0.5); lua.position.set(-30, 30, 10); this.cena.add(lua);
    [[0, 0], [-49, -28], [-7, -28], [56, -28], [-40, 29], [17, 29], [90, -28], [90, 26]].forEach(([x, z], i) => {
      const l = new THREE.PointLight(0xdff0ff, i ? 1.2 : 1.6, 60); l.position.set(x, YMAX - 2, z); this.cena.add(l); if (!i) this.luz = l;
    });


    // Casca externa: piso, teto e 4 paredes (prédio de X0 a X1; norte/sul em ±MZ)
    const cy = (YMAX + F) / 2, H = YMAX - F + 4, T = 1, LX = X1 - X0, CX = (X0 + X1) / 2;
    caixa(LX, 2, MZ * 2, m.piso, CX, F - 1, 0); caixa(LX + 4, 2, MZ * 2 + 4, m.teto, CX, YMAX + 1, 0);
    caixa(LX + 4, H, 4, m.par, CX, cy, -MZ - 2); caixa(LX + 4, H, 4, m.par, CX, cy, MZ + 2);
    caixa(2, H, MZ * 2, m.par, X0 - 1, cy, 0); caixa(2, H, MZ * 2, m.par, X1 + 1, cy, 0);

    // Paredes internas com vãos de porta (10 de largura, 9.5 de altura)
    const parede = (eixo, fixo, ini, fim, portas = []) => {
      const seg = (a, b, h, y) => { if (b - a < 0.01) return; if (eixo === "x") caixa(b - a, h, T, m.par, (a + b) / 2, y, fixo); else caixa(T, h, b - a, m.par, fixo, y, (a + b) / 2); };
      let cur = ini;
      for (const p of [...portas].sort((a, b) => a - b)) { seg(cur, p - 5, H, cy); seg(p - 5, p + 5, YMAX - F - 9.5, (YMAX + F + 9.5) / 2); cur = p + 5; }
      seg(cur, fim, H, cy);
    };
    const PN = [-49, -7, 28, 56, 90], PS = [-40, 17, 57, 90];   // portas (centro, em x) nas paredes do corredor
    parede("x", -8, X0, X1, PN); parede("x", 8, X0, X1, PS);
    for (const x of [-28, 14, 42, 71]) parede("z", x, -MZ, -8);   // divisórias das salas do norte
    for (const x of [-10, 45, 71]) parede("z", x, 8, MZ);         // divisórias das salas do sul
    ["SALA 1", "SALA 2", "BIBLIOTECA", "LABORATÓRIO", "ENFERMARIA"].forEach((t, i) => placa(t, PN[i], 0, -1));
    ["CANTINA", "GINÁSIO", "BANHEIRO", "AUDITÓRIO"].forEach((t, i) => placa(t, PS[i], 0, 1));

    // Corredor: armários nas duas paredes (pulando as portas), janelas nas pontas, lâmpadas
    for (let x = X0 + 3; x <= X1 - 3; x += 5) {
      if (!PN.some((p) => Math.abs(x - p) < 7)) caixa(4.4, 9.5, 2.6, Math.round(x / 5) % 2 ? m.l1 : m.l2, x, F + 4.75, -6.2);
      if (!PS.some((p) => Math.abs(x - p) < 7)) caixa(4.4, 9.5, 2.6, Math.round(x / 5) % 2 ? m.l2 : m.l1, x, F + 4.75, 6.2);
    }
    janela(X0 + 0.05, 0, Math.PI / 2); janela(X1 - 0.05, 0, -Math.PI / 2);
    for (let x = -60; x <= 100; x += 20) dbox(14, 0.3, 1.6, B(0xeaf6ff), x, YMAX - 0.15, 0);


    // Salas de aula (mesma planta, quadros diferentes)
    const carteira = (x, z) => {
      caixa(7.5, 0.4, 4, m.tampo, x, F + 3.2, z);
      for (const l of [-1, 1]) caixa(0.3, 3, 3.6, m.metal, x + l * 3.3, F + 1.5, z);
      caixa(3.2, 0.35, 3.2, m.cad, x, F + 1.9, z + 4.3); caixa(3.2, 2.6, 0.3, m.cad, x, F + 3.4, z + 5.8); caixa(2.4, 1.8, 2.4, m.metal, x, F + 0.9, z + 4.3);
    };
    const sala = (cx, q) => {
      dbox(31.4, 10.4, 0.3, m.mad, cx, F + 8, -MZ + 0.15); caixa(30, 9, 0.4, q, cx, F + 8, -MZ + 0.5); caixa(26, 0.4, 0.8, m.mad, cx, F + 3.3, -MZ + 1);
      caixa(13, 0.6, 5, m.mad, cx, F + 3.4, -44); for (const l of [-1, 1]) caixa(0.5, 3.1, 4.6, m.mad, cx + l * 6, F + 1.55, -44);
      for (const dx of [-16, -8, 8, 16]) for (const z of [-36, -26, -16]) carteira(cx + dx, z);
    };
    sala(-49, quadro("Matemática", "2 + 2 = ?")); sala(-7, quadro("Aula de Biologia", "Hoje: o ciclo do mosquito 🦟"));
    { // Relógio de parede: caixa, aro, mostrador com números, ponteiros animados e vidro
      const rel = new THREE.Group(); rel.position.set(9, F + 11, -MZ + 0.15); this.cena.add(rel);
      const caixaR = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 0.35, 40), M(0x2b2b33, 0.35, { metalness: 0.5 }));
      caixaR.rotation.x = Math.PI / 2; caixaR.position.z = 0.17; rel.add(caixaR);
      const aro = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.13, 12, 48), M(0xc9a227, 0.25, { metalness: 0.9 })); aro.position.z = 0.36; rel.add(aro);
      const [cr, gr] = tela(256, 256);
      gr.fillStyle = "#f6f1e3"; gr.beginPath(); gr.arc(128, 128, 126, 0, 7); gr.fill();
      gr.strokeStyle = "#222"; gr.fillStyle = "#222"; gr.textAlign = "center"; gr.textBaseline = "middle"; gr.font = "bold 30px serif";
      for (let i = 0; i < 60; i++) { const a = (i / 60) * Math.PI * 2, r1 = i % 5 ? 112 : 102; gr.lineWidth = i % 5 ? 2 : 5; gr.beginPath(); gr.moveTo(128 + Math.sin(a) * r1, 128 - Math.cos(a) * r1); gr.lineTo(128 + Math.sin(a) * 120, 128 - Math.cos(a) * 120); gr.stroke(); }
      for (let i = 1; i <= 12; i++) { const a = (i / 12) * Math.PI * 2; gr.fillText(String(i), 128 + Math.sin(a) * 82, 128 - Math.cos(a) * 82); }
      gr.font = "bold 13px sans-serif"; gr.fillStyle = "#a01020"; gr.fillText("ESCOLA", 128, 170);
      const face = new THREE.Mesh(new THREE.CircleGeometry(1.5, 48), new THREE.MeshStandardMaterial({ map: tex(cr), roughness: 0.6 })); face.position.z = 0.35; rel.add(face);
      const ponteiro = (w, h, cor, z) => { const p = new THREE.Group(); p.position.z = z; const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.03), M(cor, 0.4)); b.position.y = h / 2 - 0.12; p.add(b); rel.add(p); return p; };
      this.relogio = { h: ponteiro(0.1, 0.85, 0x111111, 0.38), m: ponteiro(0.07, 1.25, 0x111111, 0.4), s: ponteiro(0.03, 1.3, 0xd01020, 0.42) };
      const pino = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 8), M(0xc9a227, 0.3, { metalness: 0.9 })); pino.position.z = 0.44; rel.add(pino);
      const vidro = new THREE.Mesh(new THREE.SphereGeometry(1.5, 32, 12, 0, Math.PI * 2, 0, 0.5), new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.12, roughness: 0.05 }));
      vidro.rotation.x = Math.PI / 2; vidro.position.z = 0.0; vidro.scale.set(1, 0.3, 1); vidro.position.z = 0.35; rel.add(vidro);
    }
    janela(X0 + 0.05, -30, Math.PI / 2);

    // Biblioteca: estantes com lombadas, mesas de leitura e carpete
    chao(26, 38, B(0x34425f), 28, -29);
    for (const x of [19.5, 36.5]) for (const z of [-39, -20]) caixa(2.4, 10, 16, m.estante, x, F + 5, z);
    for (const z of [-42, -30, -18]) { caixa(8, 0.5, 5, m.mad, 28, F + 3.3, z); for (const l of [-1, 1]) caixa(0.4, 3, 4.4, m.mad, 28 + l * 3.2, F + 1.5, z); }

    // Laboratório: bancadas, frascos e tanque de larvas
    for (const z of [-42, -30, -18]) {
      caixa(20, 0.8, 5, m.bancada, 56, F + 3.6, z); caixa(19, 3.2, 4.4, m.metal, 56, F + 1.6, z);
      for (let i = 0; i < 4; i++) this.deco(new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.8, 1.4, 12), M([0x66ffaa, 0xff6688, 0x66ccff, 0xffe066][i], 0.2, { emissive: [0x22aa66, 0xaa2244, 0x2266aa, 0xaa9922][i], emissiveIntensity: 0.6 })), 49 + i * 4.5, F + 4.7, z);
    }
    { // Galão de lixo radioativo: tambor com aros, símbolo de radiação, tampa, gosma verde e luz
      const [cz, gz] = tela(512, 256);
      gz.fillStyle = "#e8b81a"; gz.fillRect(0, 0, 512, 256);
      for (let x = -256; x < 512; x += 40) { gz.fillStyle = "#1a1a1a"; gz.beginPath(); gz.moveTo(x, 0); gz.lineTo(x + 20, 0); gz.lineTo(x + 60, 34); gz.lineTo(x + 40, 34); gz.fill(); gz.beginPath(); gz.moveTo(x, 222); gz.lineTo(x + 20, 222); gz.lineTo(x + 60, 256); gz.lineTo(x + 40, 256); gz.fill(); }
      for (const cx of [128, 384]) {
        gz.fillStyle = "#1a1a1a"; gz.beginPath(); gz.arc(cx, 128, 70, 0, 7); gz.fill(); gz.fillStyle = "#e8b81a"; gz.beginPath(); gz.arc(cx, 128, 64, 0, 7); gz.fill();
        gz.fillStyle = "#1a1a1a";
        for (let k = 0; k < 3; k++) { const a = -Math.PI / 2 + k * (Math.PI * 2 / 3); gz.beginPath(); gz.moveTo(cx, 128); gz.arc(cx, 128, 56, a - 0.5, a + 0.5); gz.closePath(); gz.fill(); }
        gz.fillStyle = "#e8b81a"; gz.beginPath(); gz.arc(cx, 128, 14, 0, 7); gz.fill(); gz.fillStyle = "#1a1a1a"; gz.beginPath(); gz.arc(cx, 128, 9, 0, 7); gz.fill();
      }
      gz.fillStyle = "#3a8a1a"; for (let i = 0; i < 9; i++) { const x = Math.random() * 512; gz.fillRect(x, 34, 6 + Math.random() * 8, 30 + Math.random() * 70); }
      const tambor = cil(2.4, 2.4, 5.6, M(0xffffff, 0.5, { map: tex(cz), metalness: 0.3 }), 66, F + 2.8, -45);
      for (const y of [0.4, 2.8, 5.2]) { const a = new THREE.Mesh(new THREE.TorusGeometry(2.42, 0.1, 8, 40), M(0x8a7a20, 0.4, { metalness: 0.7 })); a.rotation.x = Math.PI / 2; this.deco(a, 66, F + y, -45); }
      const tampa = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.45, 0.25, 40), M(0x333333, 0.4, { metalness: 0.6 })); this.deco(tampa, 66, F + 5.8, -45);
      const gosma = new THREE.Mesh(new THREE.CircleGeometry(1.7, 32), new THREE.MeshBasicMaterial({ color: 0x39ff14 })); gosma.rotation.x = -Math.PI / 2; this.deco(gosma, 66, F + 5.94, -45);
      for (let i = 0; i < 5; i++) { const a = i * 1.3; const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.05, 0.9 + Math.random(), 8), new THREE.MeshBasicMaterial({ color: 0x39ff14 })); this.deco(pin, 66 + Math.cos(a) * 2.42, F + 5.3, -45 + Math.sin(a) * 2.42); }
      const poca = new THREE.Mesh(new THREE.CircleGeometry(3.6, 32), new THREE.MeshBasicMaterial({ color: 0x39ff14, transparent: true, opacity: 0.45 })); poca.rotation.x = -Math.PI / 2; this.deco(poca, 66, F + 0.08, -45);
      const lg = new THREE.PointLight(0x39ff14, 1.4, 14); lg.position.set(66, F + 7, -45); this.cena.add(lg); this.luzGalao = lg;
    }

    // Cantina: mesas com bancos, balcão e placa
    for (const x of [-58, -40, -22]) for (const z of [20, 29, 38]) {
      caixa(14, 0.5, 4.2, m.mesa, x, F + 3.3, z); caixa(1.2, 3, 3.6, m.metal, x, F + 1.5, z);
      for (const l of [-1, 1]) caixa(14, 0.4, 1.6, m.banco, x, F + 1.9, z + l * 3.4);
    }
    caixa(30, 5, 3, m.mad, -40, F + 2.5, MZ - 2.5);
    { const [c, g] = tela(256, 64); g.fillStyle = "#7a2a1a"; g.fillRect(0, 0, 256, 64); g.fillStyle = "#ffd84d"; g.font = "bold 38px sans-serif"; g.textAlign = "center"; g.fillText("CANTINA", 128, 46);
      this.deco(new THREE.Mesh(new THREE.PlaneGeometry(12, 3), new THREE.MeshBasicMaterial({ map: tex(c) })), -40, F + 9, MZ - 0.55, Math.PI); }
    janela(X0 + 0.05, 30, Math.PI / 2);

    // Ginásio: quadra, tabelas, arquibancada e bolas
    chao(40, 26, new THREE.MeshBasicMaterial({ map: tex(cq) }), 17.5, 29);
    for (const x of [-3.5, 38.5]) {
      cil(0.35, 0.35, 8, m.metal, x, F + 4, 29); caixa(0.3, 4, 6, m.porc, x, F + 9, 29);
      const aro = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.1, 8, 20), m.laranja); aro.rotation.x = Math.PI / 2; this.deco(aro, x + (x < 0 ? 1.4 : -1.4), F + 7.6, 29);
    }
    for (let i = 0; i < 4; i++) caixa(36, 1.8 * (i + 1), 2.4, m.mad, 17.5, F + 0.9 * (i + 1), 41 + i * 2.4);
    for (const [x, z] of [[10, 25], [22, 33], [30, 22]]) this.deco(new THREE.Mesh(new THREE.SphereGeometry(0.9, 14, 10), m.laranja), x, F + 0.9, z);

    // Banheiro: boxes, vasos e pia com espelho
    for (let i = 0; i < 6; i++) caixa(7, 7, 0.3, m.azul, 66, F + 3.5, 18 + i * 5.5);
    for (let i = 0; i < 5; i++) { cil(1, 0.8, 2, m.porc, 67.5, F + 1, 20.75 + i * 5.5); caixa(1.2, 2.5, 2.4, m.porc, 69.2, F + 3.2, 20.75 + i * 5.5); }
    caixa(3, 3.4, 16, m.azul, 47.5, F + 1.7, 36); this.deco(new THREE.Mesh(new THREE.PlaneGeometry(16, 5), B(0x9bb8c8)), 45.55, F + 7.5, 36, Math.PI / 2);
    

    janela(56, -MZ + 0.05, 0); janela(57, MZ - 0.05, Math.PI);   // janelas do laboratório e do banheiro

    // ENFERMARIA (norte, x 71..110): 6 camas com cortinas, armário de remédios, cruz e janela
    { const lencol = M(0xf4f6ff, 0.8), manta = M(0x6aa0d8, 0.8), trava = M(0xffffff, 0.9), cortina = M(0xbfe0d8, 0.9, { transparent: true, opacity: 0.8 });
      chao(38, 40, B(0xdbe9f2), 90.5, -29);
      for (const z of [-42, -30, -18]) for (const x of [77, 104]) {
        caixa(5, 1.6, 9, m.metal, x, F + 0.8, z); caixa(4.8, 0.6, 8.8, lencol, x, F + 1.9, z);
        dbox(3.6, 0.5, 1.8, trava, x, F + 2.4, z - 3.4); dbox(4.9, 0.25, 5.5, manta, x, F + 2.3, z + 1.4);
        caixa(5, 3, 0.4, m.metal, x, F + 1.5, z - 4.5);
        dbox(0.2, 9, 8, cortina, x + (x < 90 ? 3.4 : -3.4), F + 6, z);
      }
      caixa(14, 8, 2.5, M(0xf2f2f2, 0.4), 90.5, F + 4, -MZ + 1.3);
      dbox(13, 7, 0.1, M(0xaad0e0, 0.1, { transparent: true, opacity: 0.35 }), 90.5, F + 4.2, -MZ + 2.6);
      const [cc, gc] = tela(128, 128); gc.fillStyle = "#fff"; gc.fillRect(0, 0, 128, 128); gc.fillStyle = "#e0202a"; gc.fillRect(48, 16, 32, 96); gc.fillRect(16, 48, 96, 32);
      this.deco(new THREE.Mesh(new THREE.PlaneGeometry(3, 3), new THREE.MeshBasicMaterial({ map: tex(cc) })), 90.5, F + 10.5, -MZ + 2.7);
      janela(X1 - 0.05, -30, -Math.PI / 2);
    }

    // AUDITÓRIO (sul, x 71..110): palco, cortina, telão, caixas de som e 48 poltronas (instanciadas)
    { const vinho = M(0x8a0f1f, 0.9), CXA = 90.5;
      chao(38, 24, B(0x2a0c16), CXA, 22);
      caixa(37, 2, 12, m.mad, CXA, F + 1, MZ - 6); caixa(10, 1, 3, m.mad, CXA, F + 0.5, 36.5); caixa(3, 3.5, 2, m.mad, CXA, F + 3.75, 44);
      dbox(36, 9, 0.4, vinho, CXA, F + 7.5, MZ - 0.6);
      for (const l of [-1, 1]) { dbox(3, 11, 1, vinho, CXA + l * 17, F + 6.5, MZ - 2); caixa(3, 6, 3.2, M(0x15151f, 0.6), CXA + l * 15, F + 5, 45);
        this.deco(new THREE.Mesh(new THREE.CircleGeometry(1, 20), B(0x333344)), CXA + l * 15, F + 6.2, 43.35, Math.PI); }
      { const [ct, gt] = tela(512, 256); gt.fillStyle = "#0b1020"; gt.fillRect(0, 0, 512, 256); gt.fillStyle = "#ffd84d"; gt.font = "bold 48px sans-serif"; gt.textAlign = "center";
        gt.fillText("FEIRA DE CIÊNCIAS", 256, 110); gt.font = "32px sans-serif"; gt.fillStyle = "#fff"; gt.fillText("Tema: insetos 🦟", 256, 170);
        this.deco(new THREE.Mesh(new THREE.PlaneGeometry(18, 9), new THREE.MeshBasicMaterial({ map: tex(ct) })), CXA, F + 7.5, MZ - 1, Math.PI); }
      const assentos = [], encostos = [], pes = [];
      for (let r = 0; r < 6; r++) for (let i = -4; i <= 4; i++) if (i) { const x = CXA + i * 4.2, z = 12 + r * 3.8; assentos.push([x, F + 1.6, z]); encostos.push([x, F + 2.9, z - 1.4]); pes.push([x, F + 0.65, z]); }
      const inst = (geo, mt, lista) => { const im = new THREE.InstancedMesh(geo, mt, lista.length), mx = new THREE.Matrix4();
        lista.forEach(([x, y, z], k) => { mx.makeTranslation(x, y, z); im.setMatrixAt(k, mx); }); im.instanceMatrix.needsUpdate = true; im.frustumCulled = false; this.cena.add(im); };
      const poltrona = M(0xa0182c, 0.8);
      inst(new THREE.BoxGeometry(3.2, 0.6, 3), poltrona, assentos); inst(new THREE.BoxGeometry(3.2, 2.4, 0.5), poltrona, encostos); inst(new THREE.BoxGeometry(1, 1.3, 1), m.metal, pes);
      const invisivel = new THREE.MeshBasicMaterial({ visible: false });
      for (let r = 0; r < 6; r++) for (const cx of [80, 101]) caixa(15.8, 3.7, 3.2, invisivel, cx, F + 1.85, 12 + r * 3.8);   // colisão das fileiras
      const luzPalco = new THREE.PointLight(0xffd9a0, 1.1, 40); luzPalco.position.set(CXA, YMAX - 3, 43); this.cena.add(luzPalco);
      janela(X1 - 0.05, 30, -Math.PI / 2);
    }

    // MOSQUITÃO DA RUA: estátua-gigante no palco do auditório (easter egg)
    { const M2 = M(0x4a5a3a, 0.85), mm = new THREE.Group(), PX0 = 76, PZ0 = 44;
      caixa(5, 0.8, 5, m.mad, PX0, F + 2.4, PZ0);   // pedestal sobre o palco
      mm.position.set(PX0, F + 2.8, PZ0); this.cena.add(mm);
      const pernaEst = (raiz, mt, x, y, z, rx, ry, rz, raio, comp) => {   // "cápsula" feita à mão (r128 não tem CapsuleGeometry)
        const g2 = new THREE.Group(); g2.position.set(x, y, z); g2.rotation.set(rx, ry, rz); raiz.add(g2);
        g2.add(new THREE.Mesh(new THREE.CylinderGeometry(raio, raio * 0.9, comp, 10), mt));
        for (const s of [1, -1]) { const p = new THREE.Mesh(new THREE.SphereGeometry(raio, 10, 8), mt); p.position.y = s * comp / 2; g2.add(p); }
        return g2;
      };
      const parte = (geo, mt, x, y, z, rx = 0, ry = 0, rz = 0) => { const o = new THREE.Mesh(geo, mt); o.position.set(x, y, z); o.rotation.set(rx, ry, rz); mm.add(o); return o; };
      parte(new THREE.SphereGeometry(2.6, 20, 14), M2, 0, 6, 0).scale.set(1, 0.85, 1.6);
      parte(new THREE.SphereGeometry(1.7, 18, 12), M2, 0, 6.2, -3.4).scale.set(1, 0.95, 0.9);
      parte(new THREE.TorusGeometry(1.2, 0.22, 8, 20), M2, 0, 7.4, -3.5).rotation.x = Math.PI / 2;
      for (const l of [1, -1]) { pernaEst(mm, M2, l * 1.5, 4.6, 3.6, -1.1, 0, l * 0.5, 0.16, 5.5);
        pernaEst(mm, M2, l * 2.2, 4.2, -3.5, 1.1, 0, -l * 0.4, 0.14, 6.2);
        parte(new THREE.SphereGeometry(0.5, 12, 10), M(0x220000, 0.2, { emissive: 0xff2244, emissiveIntensity: 0.8 }), l * 0.7, 5.9, -4.7);
        parte(new THREE.CylinderGeometry(0.05, 0.02, 8, 6), M2, l * 0.5, 9, -4.2, 1.4, 0, l * 0.25); }
      const trompa = parte(new THREE.CylinderGeometry(0.22, 0.05, 7, 8), M2, 0, 4.2, -8.4, Math.PI / 2.1);
      mm.scale.setScalar(0.42);   // ~5,5 unidades de altura: estátua grande, mas que cabe no palco
      this.mosquito = { g: mm, trompa, centro: V(PX0, F + 2.8 + 2.6, PZ0 - 1.5) };
      this.deco(new THREE.Mesh(new THREE.CircleGeometry(4, 24), B(0x1b2a12)), PX0, F + 2.02, PZ0);
    }


    // Lâmpadas do teto nas salas
    for (const [x, z] of [[-49, -28], [-7, -28], [28, -28], [56, -28], [-40, 29], [17, 29], [57, 29], [90, -28], [90, 26]]) dbox(14, 0.3, 1.6, B(0xeaf6ff), x, YMAX - 0.15, z);

    // ---- Cartazes, bebedouros, extintores, caixas d'água e tubulação ----
    const cartazRaw = (a, b, cor, x, y, z, ry, esc = 1) => {
      const [c, g] = tela(256, 256); g.fillStyle = cor; g.fillRect(0, 0, 256, 256);
      g.fillStyle = "rgba(255,255,255,.14)"; for (let i = 0; i < 6; i++) g.fillRect(0, i * 44, 256, 3);
      g.fillStyle = "#fff"; g.textAlign = "center"; g.font = "bold 34px sans-serif"; g.fillText(a, 128, 104);
      g.font = "bold 22px sans-serif"; g.fillText(b, 128, 152);
      g.strokeStyle = "rgba(255,255,255,.5)"; g.lineWidth = 6; g.strokeRect(8, 8, 240, 240);
      return this.deco(new THREE.Mesh(new THREE.PlaneGeometry(4 * esc, 4 * esc), new THREE.MeshBasicMaterial({ map: tex(c) })), x, y, z, ry);
    };
    const cartaz = (a, b, cor, x, lado) => cartazRaw(a, b, cor, x, F + 11.8, lado > 0 ? -7.45 : 7.45, lado > 0 ? 0 : Math.PI);   // acima dos armários, virado para o corredor
    cartaz("MOSQUITO", "NÃO DEIXE ÁGUA PARADA", "#0f7a4a", 14, 1); cartaz("EVOLUA!", "1 2 3 4 = crescer", "#b5443a", -30, 1);
    cartaz("BIBLIOTECA", "silêncio, por favor", "#5a3fa0", 42, 1); cartaz("ENFERMARIA", "primeiros socorros", "#1f6fb5", 75, 1);
    cartaz("LAVE AS MÃOS", "antes de comer", "#1f6fb5", -20, -1); cartaz("PROVA", "sexta-feira", "#c9861a", 34, -1); cartaz("AUDITÓRIO", "feira de ciências", "#5a3fa0", 73, -1);
    cartazRaw("REPELENTE", "use com moderação", "#8a2a5a", -9.4, F + 7, 20, Math.PI / 2, 0.9);   // parede do ginásio

    const bebedouro = (x, z, lado) => {
      caixa(2.4, 9, 1.6, m.porc, x, F + 4.5, z);
      dbox(1.6, 0.5, 1.1, m.metal, x, F + 4.1, z); dbox(0.6, 0.9, 0.5, m.metal, x, F + 3.3, z);
      this.deco(new THREE.Mesh(new THREE.SphereGeometry(0.35, 12, 10), B(0x66ccff)), x, F + 3.15, z + 0.9 * lado);
    };
    bebedouro(-13, -6.7, 1); bebedouro(11, 6.7, -1); bebedouro(84, -6.7, 1);   // nas folgas ao lado das portas

    for (const [x, z] of [[-43, -6.9], [34, -6.9], [62, -6.9], [-34, 6.9], [23, 6.9], [63, 6.9], [96, 6.9]]) {   // extintores vermelhos (sem armário na frente)
      dbox(1.1, 2.6, 1.1, M(0xc0182a, 0.45, { metalness: 0.3 }), x, F + 4.6, z);
      dbox(0.4, 1.4, 0.4, m.metal, x, F + 6.4, z);
      this.deco(new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.7, 10), M(0x9a1420, 0.5)), x, F + 6.4, z);
    }
    for (const [x, z] of [[-62, -11], [108, -10]]) {   // caixas d'água
      for (const dx of [-1.3, 1.3]) cil(0.16, 0.16, YMAX + 2, m.metal, x + dx, F + (YMAX - F + 2) / 2 - 2, z);
      dbox(4.4, 4.2, 4.4, M(0x9aa7b5, 0.6, { metalness: 0.4 }), x, F + YMAX - 1.5, z);
      dbox(4.6, 0.4, 4.6, M(0x7f8b99, 0.6), x, F + YMAX + 0.7, z);
      dbox(0.5, 1.2, 0.5, m.metal, x, F + YMAX + 1.3, z);
    }
    for (let i = 0; i < 10; i++) {   // tubulação exposta, deitada ao longo do corredor
      const tubo = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 26, 10), m.metal); tubo.rotation.z = Math.PI / 2;
      this.deco(tubo, -60 + i * 18, YMAX - 1.2, -7.0);
    }
  }

  livre(p, margem) { for (const c of this.col) if (c.box.distanceToPoint(p) < margem) return false; return true; }
  sorteio(alvo, yMin = CFG.YMIN + 1, yMax = CFG.YMAX - 1) {
    for (let i = 0; i < 10; i++) {
      alvo.set(CFG.X0 + 1 + Math.random() * (CFG.X1 - CFG.X0 - 2), yMin + Math.random() * (yMax - yMin), (Math.random() - 0.5) * (CFG.MZ * 2 - 2));
      if (this.livre(alvo, 0.8)) break;
    }
    return alvo;
  }

  // Só raycasta contra malhas cuja AABB está perto (poda por bounding box)
  malhasPerto(p, r) { this.perto.length = 0; for (const c of this.col) if (c.box.distanceToPoint(p) < r) this.perto.push(c.mesh); return this.perto; }
  resolver(pos, raio = 0.18) {
    const ms = this.malhasPerto(pos, raio + 0.4);
    if (!ms.length) return;
    this.raycaster.far = raio;
    for (const d of this.dirs) {
      this.raycaster.set(pos, d);
      const h = this.raycaster.intersectObjects(ms, false);
      if (h.length) pos.addScaledVector(d, -(raio - h[0].distance));
    }
  }

  // ---- Seres humanos: andam pela escola; pique a cabeça (E) e fuja do tapa ----
  criarHumanos() {
    const F = CFG.YMIN, M = (c, r = 0.7) => new THREE.MeshStandardMaterial({ color: c, roughness: r });
    const peles = [0xf1c27d, 0xc68642, 0x8d5524, 0xe0ac69, 0xffdbac], roupas = [0x3a6ea5, 0xb5443a, 0x4a8a4a, 0x7a4fa0, 0xd9a400, 0x333344, 0xffffff, 0x1f6f6f];
    const calcas = [0x2a2a35, 0x3b4f7a, 0x5a4632, 0x1c1c1c], cabelos = [0x2b1b10, 0x0f0f0f, 0x6b4423, 0xd8b45a, 0x8a3b1a];
    const branco = new THREE.MeshBasicMaterial({ color: 0xffffff }), preto = new THREE.MeshBasicMaterial({ color: 0x151515 }), boca = M(0x8a2a2a), sapato = M(0x1a1a1a, 0.4);
    this.humanoPerto = null;
    this.humanos = CFG.HUMANOS.map(([nome, x1, z1, x2, z2, yo = 0], i) => {
      const pele = M(peles[i % peles.length], 0.6), roupa = M(roupas[i % roupas.length]), calca = M(calcas[i % calcas.length]), cab = M(cabelos[i % cabelos.length], 0.8);
      const g = new THREE.Group();
      const parte = (geo, m, x, y, z, pai = g) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); pai.add(o); return o; };
      const capsula = (r, h, m, x, y, z, pai) => { const c = new THREE.Group(); c.position.set(x, y, z); parte(new THREE.CylinderGeometry(r, r * 0.9, h, 14), m, 0, 0, 0, c); parte(new THREE.SphereGeometry(r, 14, 10), m, 0, h / 2, 0, c); parte(new THREE.SphereGeometry(r * 0.9, 14, 10), m, 0, -h / 2, 0, c); pai.add(c); return c; };
      // pernas articuladas (quadril -> joelho) com sapatos
      const pernas = [-0.3, 0.3].map((x) => {
        const p = new THREE.Group(); p.position.set(x, 2.65, 0); g.add(p);
        capsula(0.26, 1.0, calca, 0, -0.6, 0, p);
        const jo = new THREE.Group(); jo.position.y = -1.25; p.add(jo); capsula(0.22, 0.95, calca, 0, -0.55, 0, jo);
        const sp = parte(new THREE.BoxGeometry(0.42, 0.28, 0.75), sapato, 0, -1.2, 0.14, jo); sp.scale.set(1, 1, 1);
        p.userData.joelho = jo; return p;
      });
      // quadril, cinto, tronco afunilado e gola
      parte(new THREE.CylinderGeometry(0.68, 0.62, 0.55, 18), calca, 0, 2.75, 0).scale.z = 0.7;
      parte(new THREE.CylinderGeometry(0.7, 0.7, 0.12, 18), M(0x3a2414, 0.5), 0, 3.03, 0).scale.z = 0.72;
      const tronco = parte(new THREE.CylinderGeometry(0.82, 0.66, 1.75, 18), roupa, 0, 3.95, 0); tronco.scale.z = 0.62;
      parte(new THREE.SphereGeometry(0.82, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), roupa, 0, 4.82, 0).scale.set(1, 0.32, 0.62);
      parte(new THREE.TorusGeometry(0.24, 0.06, 8, 18), roupa, 0, 4.98, 0).rotation.x = Math.PI / 2;
      for (let b = 0; b < 3; b++) parte(new THREE.SphereGeometry(0.04, 6, 6), preto, 0, 4.5 - b * 0.35, 0.52);
      // braços articulados (ombro -> cotovelo) com mãos
      const bracos = [-0.98, 0.98].map((x) => {
        const p = new THREE.Group(); p.position.set(x, 4.72, 0); g.add(p);
        capsula(0.2, 0.75, roupa, 0, -0.45, 0, p);
        const co = new THREE.Group(); co.position.y = -0.95; p.add(co); capsula(0.16, 0.7, pele, 0, -0.42, 0, co);
        parte(new THREE.SphereGeometry(0.17, 10, 8), pele, 0, -0.9, 0.02, co).scale.set(0.9, 1.2, 0.7);
        p.userData.cotovelo = co; return p;
      });
      // pescoço e cabeça com rosto
      parte(new THREE.CylinderGeometry(0.19, 0.22, 0.35, 12), pele, 0, 5.1, 0);
      const cab3 = new THREE.Group(); cab3.position.y = 5.65; g.add(cab3);
      parte(new THREE.SphereGeometry(0.52, 20, 16), pele, 0, 0, 0, cab3).scale.set(0.92, 1.08, 0.98);
      parte(new THREE.SphereGeometry(0.5, 14, 10), pele, 0, -0.3, 0.06, cab3).scale.set(0.78, 0.5, 0.8);
      for (const x of [-0.18, 0.18]) {
        parte(new THREE.SphereGeometry(0.09, 10, 8), branco, x, 0.06, 0.43, cab3).scale.z = 0.5;
        parte(new THREE.SphereGeometry(0.05, 8, 6), preto, x, 0.06, 0.48, cab3);
        parte(new THREE.BoxGeometry(0.2, 0.04, 0.05), cab, x, 0.22, 0.46, cab3).rotation.z = x > 0 ? -0.15 : 0.15;
        parte(new THREE.SphereGeometry(0.11, 10, 8), pele, x * 2.75, 0, 0, cab3).scale.set(0.45, 0.9, 0.7);
      }
      parte(new THREE.ConeGeometry(0.08, 0.22, 8), pele, 0, -0.06, 0.52, cab3).rotation.x = Math.PI / 2;
      parte(new THREE.BoxGeometry(0.22, 0.04, 0.04), boca, 0, -0.26, 0.45, cab3);
      // cabelos variados: curto, comprido, coque, careca com boné
      const est = i % 4;
      if (est !== 3) parte(new THREE.SphereGeometry(0.56, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.55), cab, 0, 0.05, -0.03, cab3).scale.set(0.97, 1.05, 1.03);
      if (est === 1) parte(new THREE.CylinderGeometry(0.5, 0.42, 1.0, 16, 1, true, Math.PI * 0.6, Math.PI * 1.8), cab, 0, -0.35, -0.05, cab3);
      if (est === 2) parte(new THREE.SphereGeometry(0.22, 12, 10), cab, 0, 0.45, -0.38, cab3);
      if (est === 3) { const bone = M(roupas[(i + 3) % roupas.length], 0.6); parte(new THREE.SphereGeometry(0.56, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), bone, 0, 0.08, 0, cab3); parte(new THREE.CylinderGeometry(0.42, 0.42, 0.05, 16, 1, false, -Math.PI / 2 - 0.9, 1.8), bone, 0, 0.1, 0.25, cab3); }
      if (i % 3 === 0) { const ar = M(0x111111, 0.3); for (const x of [-0.18, 0.18]) parte(new THREE.TorusGeometry(0.11, 0.018, 6, 16), ar, x, 0.06, 0.5, cab3); }
      const marca = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.07, 8, 24), new THREE.MeshBasicMaterial({ color: 0xff1744 }));
      marca.rotation.x = Math.PI / 2; marca.position.y = 6.75; g.add(marca);
      g.position.set(x1, F + yo, z1); this.cena.add(g);
      return { nome, g, cab: cab3, pernas, bracos, marca, a: V(x1, F, z1), b: V(x2, F, z2), ida: true, passo: Math.random() * 6,
        vel: 1.6 + Math.random() * 0.6, pronto: 0, raiva: 0, tapa: 0, alvo: V(x1, F + 5.65 + yo, z1), yo };
    });
  }

  // ---- Carteira perdida no corredor (B perto dela devolve e rende sangue; até 3 vezes) ----
  criarCarteira() {
    const g = new THREE.Group(), M = (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.6 });
    const corpo = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.3, 0.9), M(0x6b3a1a)), botao = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.34, 0.2), M(0xffd84d));
    const halo = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.06, 6, 24), new THREE.MeshBasicMaterial({ color: 0xffd84d, transparent: true, opacity: 0.6 }));
    halo.rotation.x = Math.PI / 2; halo.position.y = 0.1; botao.position.set(0.5, 0.02, 0); g.add(corpo, botao, halo); this.cena.add(g);
    this.carteira = { g, halo, visivel: false, spots: [[-20, 3], [35, -3], [-55, 2], [75, 2], [100, -2]] };
  }
  posicionarCarteira(S) {
    const c = this.carteira; c.visivel = S.carteiras < 3; c.g.visible = c.visivel;
    if (c.visivel) { const [x, z] = c.spots[(Math.random() * c.spots.length) | 0]; c.g.position.set(x, CFG.YMIN + 0.2, z); }
  }

  atualizarHumanos(dt, jogo) {
    const p = jogo.jogador.pos, F = CFG.YMIN, rc = jogo.estado.raioColeta + 0.9;
    const virar = (g, ang, k) => { g.rotation.y += Math.atan2(Math.sin(ang - g.rotation.y), Math.cos(ang - g.rotation.y)) * amort(k, dt); };
    this.humanoPerto = null; let melhor = rc * rc;
    for (const h of this.humanos) {
      const g = h.g;
      h.pronto = Math.max(0, h.pronto - dt); h.raiva = Math.max(0, h.raiva - dt); h.tapa = Math.max(0, h.tapa - dt);
      if (h.raiva > 0) {
        // Bravo: para, encara o mosquito e abana o braço
        virar(g, Math.atan2(p.x - g.position.x, p.z - g.position.z), 10);
        h.bracos[1].rotation.x = -2.4 + Math.sin(jogo.t * 16) * 0.7; h.bracos[0].rotation.x = 0; h.bracos[1].userData.cotovelo.rotation.x = -0.6; h.cab.rotation.y *= 0.9;
        h.pernas.forEach((l) => { l.rotation.x *= 0.8; });
        const dx = p.x - g.position.x, dy = p.y - (F + 5.2 + h.yo), dz = p.z - g.position.z;
        if (h.tapa <= 0 && dx * dx + dy * dy + dz * dz < 2.8 * 2.8) { h.tapa = 1.2; jogo.tapa(h); }
      } else {
        const dest = h.ida ? h.b : h.a, dx = dest.x - g.position.x, dz = dest.z - g.position.z, d = Math.hypot(dx, dz);
        if (d < 0.2) h.ida = !h.ida;
        else { const s = Math.min(d, h.vel * dt); g.position.x += (dx / d) * s; g.position.z += (dz / d) * s; virar(g, Math.atan2(dx, dz), 6); }
        h.passo += dt * h.vel * 3.2;
        const sw = Math.sin(h.passo);
        h.pernas[0].rotation.x = sw * 0.5; h.pernas[1].rotation.x = -sw * 0.5;
        h.pernas[0].userData.joelho.rotation.x = Math.max(0, -sw) * 0.8; h.pernas[1].userData.joelho.rotation.x = Math.max(0, sw) * 0.8;
        h.bracos[0].rotation.x = -sw * 0.4; h.bracos[1].rotation.x = sw * 0.4;
        h.bracos[0].userData.cotovelo.rotation.x = -0.35; h.bracos[1].userData.cotovelo.rotation.x = -0.35;
        h.cab.rotation.y = Math.sin(jogo.t * 0.7 + h.passo * 0.1) * 0.3;
        g.position.y = F + h.yo + Math.abs(Math.cos(h.passo)) * 0.08;
      }
      h.marca.visible = h.pronto <= 0; h.marca.rotation.z += dt * 2; h.marca.position.y = 6.75 + Math.sin(jogo.t * 3 + h.passo) * 0.1;
      h.alvo.set(g.position.x, F + 5.65 + h.yo, g.position.z);
      const d2 = h.alvo.distanceToSquared(p);
      if (h.pronto <= 0 && d2 < melhor) { melhor = d2; this.humanoPerto = h; }
    }
  }

    // ---- Gotas (pool) ----
  criarGotas() {
    const geo = new THREE.SphereGeometry(0.2, 16, 12), halo = new THREE.SphereGeometry(0.42, 12, 10);
    this.cores = { normal: 0xff1744, dourada: 0xffd84d, veneno: 0x9d33ff };
    this.ativas = []; this.fila = [];
    this.gotas = new Pool(() => {
      const g = new THREE.Group(), nucleo = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ roughness: 0.2 })),
        h = new THREE.Mesh(halo, new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.14, depthWrite: false }));
      g.add(nucleo, h); g.visible = false; g.userData = { tipo: "normal", fase: 0, nucleo, halo: h };
      this.cena.add(g); return g;
    }, 48);
    for (let i = 0; i < 48; i++) this.nascerGota();
  }
  nascerGota() {
    const g = this.gotas.pegar(); if (!g) return;
    const r = Math.random(), u = g.userData;
    u.tipo = r < 0.12 ? "veneno" : r < 0.27 ? "dourada" : "normal"; u.fase = Math.random() * 6.28;
    const c = this.cores[u.tipo];
    u.nucleo.material.color.setHex(c); u.nucleo.material.emissive.setHex(c); u.nucleo.material.emissiveIntensity = 0.9;
    u.halo.material.color.setHex(u.tipo === "veneno" ? 0x55ff55 : c);
    g.scale.setScalar(u.tipo === "dourada" ? 1.4 : 1);
    this.sorteio(g.position); g.visible = true; this.ativas.push(g);
  }

  // ---- Partículas (pool) ----
  criarParticulas() {
    const geo = new THREE.SphereGeometry(0.03, 6, 6);
    this.ativasP = [];
    this.parts = new Pool(() => {
      const p = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ transparent: true }));
      p.visible = false; p.userData = { v: V(0, 0, 0), vida: 0 }; this.cena.add(p); return p;
    }, 160);
  }
  emitir(pos, cor, n = 12, forca = 3) {
    for (let i = 0; i < n; i++) {
      const p = this.parts.pegar(); if (!p) return;
      p.position.copy(pos); p.material.color.setHex(cor); p.material.opacity = 1; p.scale.setScalar(1); p.visible = true;
      p.userData.v.set((Math.random() - 0.5) * forca, Math.random() * forca * 0.8, (Math.random() - 0.5) * forca); p.userData.vida = 1;
      this.ativasP.push(p);
    }
  }

  // ---- Perigos: nuvens de inseticida + poças tóxicas no chão ----
  criarPerigos() {
    this.proxGas = 8; this.gasAtivos = [];
    const geo = new THREE.SphereGeometry(1, 20, 14);
    this.nuvens = new Pool(() => {
      const g = new THREE.Group(), miolo = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.2, depthWrite: false })),
        rede = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ wireframe: true, transparent: true, opacity: 0.3 }));
      g.add(miolo, rede); g.visible = false; g.userData = { fase: "off", t: 0, raio: 5, miolo, rede }; this.cena.add(g); return g;
    }, 3);
    this.pocas = [[-40, 0, 4.5], [40, 0, 4.5], [-6, 30, 3.5], [55, 40, 3], [-30, 13, 3], [90, -26, 3.5], [90, 35, 3]].map(([x, z, r]) => {
      const m = new THREE.Mesh(new THREE.CircleGeometry(r, 32), new THREE.MeshBasicMaterial({ color: 0x7dff3a, transparent: true, opacity: 0.35, depthWrite: false }));
      m.rotation.x = -Math.PI / 2; m.position.set(x, CFG.YMIN + 0.08, z); this.cena.add(m); return { m, x, z, r };
    });
  }
  iniciarGas(n) {
    const u = n.userData; this.sorteio(n.position, CFG.YMIN + 1.5, 7);
    u.fase = "aviso"; u.t = 2.2; u.raio = 4.5 + Math.random() * 1.5; u.tocou = false;
    u.miolo.visible = false; u.rede.material.color.setHex(0xffcc33); n.scale.setScalar(u.raio); n.visible = true;
    this.gasAtivos.push(n); this.audio.alerta();
  }

  // Fala do Mosquitão (aparece quando você chega perto dele)
  falar(texto, ms) {
    if (!this.fala) {
      const e = document.createElement("div"); e.id = "hud-fala";
      e.style.cssText = "position:fixed;left:50%;bottom:12%;transform:translateX(-50%);max-width:min(680px,86vw);font:800 1.05rem Syne,system-ui,sans-serif;color:#eaffd0;background:rgba(12,20,8,.9);border:1px solid rgba(200,255,150,.35);border-radius:12px;padding:12px 18px;z-index:6;pointer-events:none;text-align:center";
      document.body.appendChild(e); this.fala = e;
    }
    this.fala.textContent = texto; this.fala.style.display = "block";
    clearTimeout(this.falaT); this.falaT = setTimeout(() => { this.fala.style.display = "none"; }, ms || 4000);
  }

  update(dt, jogo) {
    const p = jogo.jogador.pos, S = jogo.estado;
    this.emPerigo = null; this.avisoGas = false;
    this.luz.intensity = Math.sin(jogo.t * 3.1) * Math.sin(jogo.t * 17.3) > 0.93 ? 0.5 : 1.6;   // lâmpada falhando
    this.atualizarHumanos(dt, jogo);
    if (this.relogio) { const d = new Date(), s = d.getSeconds() + d.getMilliseconds() / 1000, mi = d.getMinutes() + s / 60, h = (d.getHours() % 12) + mi / 60;
      this.relogio.s.rotation.z = -s / 60 * Math.PI * 2; this.relogio.m.rotation.z = -mi / 60 * Math.PI * 2; this.relogio.h.rotation.z = -h / 12 * Math.PI * 2; }
    if (this.luzGalao) this.luzGalao.intensity = 1.1 + Math.sin(jogo.t * 3) * 0.4;
    if (this.carteira && this.carteira.visivel) this.carteira.halo.scale.setScalar(1 + Math.sin(jogo.t * 4) * 0.15);

    // Gotas: anima só as próximas (<40u); coleta por distância ao quadrado
    const r2 = S.raioColeta * S.raioColeta;
    for (let i = this.ativas.length - 1; i >= 0; i--) {
      const g = this.ativas[i], u = g.userData, d2 = g.position.distanceToSquared(p);
      if (d2 < 1600) { u.fase += dt; u.nucleo.position.y = Math.sin(u.fase * 2) * 0.08; u.halo.scale.setScalar(1 + Math.sin(u.fase * 3) * 0.12); }
      if (d2 < r2) {
        this.ativas[i] = this.ativas[this.ativas.length - 1]; this.ativas.pop();
        g.visible = false; this.gotas.soltar(g); this.fila.push(6); jogo.coletar(g);
      }
    }
    for (let i = this.fila.length - 1; i >= 0; i--) {
      if ((this.fila[i] -= dt) <= 0) { this.fila[i] = this.fila[this.fila.length - 1]; this.fila.pop(); this.nascerGota(); }
    }

    // Partículas
    for (let i = this.ativasP.length - 1; i >= 0; i--) {
      const q = this.ativasP[i], u = q.userData;
      u.v.y -= 4 * dt; q.position.addScaledVector(u.v, dt);
      u.vida -= dt * 1.4; q.scale.setScalar(Math.max(u.vida, 0.01)); q.material.opacity = Math.max(u.vida, 0);
      if (u.vida <= 0) { q.visible = false; this.ativasP[i] = this.ativasP[this.ativasP.length - 1]; this.ativasP.pop(); this.parts.soltar(q); }
    }

    // Nuvens de inseticida periódicas
    if ((this.proxGas -= dt) <= 0) { const n = this.nuvens.pegar(); if (n) this.iniciarGas(n); this.proxGas = 10 + Math.random() * 8; }
    for (let i = this.gasAtivos.length - 1; i >= 0; i--) {
      const n = this.gasAtivos[i], u = n.userData; u.t -= dt;
      if (u.fase === "aviso") {
        this.avisoGas = true; u.rede.material.opacity = 0.3 + 0.25 * Math.sin(jogo.t * 14);
        if (u.t <= 0) {
          u.fase = "ativo"; u.t = 6.5; u.miolo.visible = true; u.miolo.material.color.setHex(0x66ff55); u.rede.material.color.setHex(0x66ff55);
          this.audio.spray(); this.emitir(n.position, 0x99ff77, 24, 8);
        }
      } else {
        const fade = Math.min(1, u.t / 0.8);
        n.scale.setScalar(u.raio * (0.9 + 0.1 * fade)); u.miolo.material.opacity = 0.22 * fade + 0.04 * Math.sin(jogo.t * 5);
        if (p.distanceToSquared(n.position) < (u.raio * 0.95) ** 2) {
          this.emPerigo = "gas"; if (!u.tocou) { u.tocou = true; jogo.kills.gas++; } jogo.dano(16 * dt, true); jogo.jogador.stamina = Math.max(0, jogo.jogador.stamina - 30 * dt);
        }
        if (u.t <= 0) { u.fase = "off"; n.visible = false; this.gasAtivos[i] = this.gasAtivos[this.gasAtivos.length - 1]; this.gasAtivos.pop(); this.nuvens.soltar(n); }
      }
    }

    // Poças tóxicas no chão: drenam stamina e vida
    for (const z of this.pocas) {
      z.m.material.opacity = 0.3 + 0.1 * Math.sin(jogo.t * 3 + z.x);
      const dx = p.x - z.x, dz = p.z - z.z;
      if (dx * dx + dz * dz < z.r * z.r && p.y < CFG.YMIN + 2.4) {
        if (!this.emPerigo) this.emPerigo = "poca";
        jogo.jogador.stamina = Math.max(0, jogo.jogador.stamina - 28 * dt); jogo.dano(5 * dt, true);
      }
    }
  }
}

// ------------------------------------------------------------
// JOGADOR: física amortecida, rolagem nas curvas, câmera com spring-arm
// ------------------------------------------------------------
class PlayerController {
  constructor(cena, camera, estado, mundo) {
    this.camera = camera; this.estado = estado; this.mundo = mundo;
    this.modelo = construirMosquito(estado); this.obj = this.modelo.mosquito; this.obj.rotation.order = "YXZ"; cena.add(this.obj);
    this.vel = V(0, 0, 0); this.yaw = 0; this.pitch = 0; this.yawPrev = 0; this.taxaYaw = 0;
    this.yawV = 0; this.pitchV = 0; this.rollV = 0; this.abV = 0; this.pernaV = 0;
    this.stamina = estado.staminaMax; this.vida = estado.vidaMax; this.regenT = 0; this.invul = 0; this.shake = 0;
    this.fator = 1; this.corre = false; this.zoomV = 1;
    this.eul = new THREE.Euler(0, 0, 0, "YXZ"); this.frente = V(0, 0, 0); this.dir = V(0, 0, 0); this.alvo = V(0, 0, 0);
    this.foco = this.obj.position.clone(); this.olhar = this.foco.clone(); this.tmp = V(0, 0, 0); this.tmp2 = V(0, 0, 0);
    this.rc = new THREE.Raycaster();
  }
  get pos() { return this.obj.position; }
  mirar(dx, dy) { this.yaw -= dx * 0.0025; this.pitch = clamp(this.pitch - dy * 0.0025, -1.2, 1.2); }
  tomarDano(v) { if (this.invul > 0) return false; this.vida = Math.max(0, this.vida - v); this.regenT = 5; return this.vida <= 0; }
  reaparecer() {
    this.pos.set(0, 2, 0); this.vel.set(0, 0, 0); this.vida = this.estado.vidaMax; this.stamina = this.estado.staminaMax;
    this.invul = 2.5; this.foco.copy(this.pos);
  }

  update(dt, k) {
    const S = this.estado;
    this.eul.set(this.pitch, this.yaw, 0, "YXZ");
    this.frente.set(0, 0, -1).applyEuler(this.eul); this.dir.set(Math.cos(this.yaw), 0, -Math.sin(this.yaw));
    const a = this.alvo.set(0, 0, 0);
    if (k.w || k.arrowup) a.add(this.frente); if (k.s || k.arrowdown) a.sub(this.frente);
    if (k.d || k.arrowright) a.add(this.dir); if (k.a || k.arrowleft) a.sub(this.dir);
    if (k[" "]) a.y += 1; if (k.control) a.y -= 1;
    const mov = a.lengthSq() > 0; if (mov) a.normalize();

    this.corre = !!k.shift && this.stamina > 5 && mov;
    this.stamina = clamp(this.stamina + (this.corre ? -35 : S.regenStamina) * dt, 0, S.staminaMax);
    a.multiplyScalar(S.velMax * (this.corre ? 2 : 1) * this.fator);
    this.vel.lerp(a, amort(mov ? 9 : 5, dt));

    // Integração em sub-passos: não atravessa paredes em alta velocidade
    const passos = Math.max(1, Math.ceil(this.vel.length() * dt / 0.12)), h = dt / passos;
    for (let i = 0; i < passos; i++) { this.pos.addScaledVector(this.vel, h); this.mundo.resolver(this.pos, 0.18 * clamp(this.modelo.zoom, 1, 2.5)); }

    // Vida / invulnerabilidade
    this.invul = Math.max(0, this.invul - dt); this.shake = Math.max(0, this.shake - dt * 3);
    if ((this.regenT -= dt) <= 0) this.vida = Math.min(S.vidaMax, this.vida + 4 * dt);

    // Rotação visual suave: yaw pelo menor arco, roll por curva e deslize lateral, pitch por subida
    const dy = Math.atan2(Math.sin(this.yaw - this.yawV), Math.cos(this.yaw - this.yawV));
    this.yawV += dy * amort(16, dt);
    const dY = Math.atan2(Math.sin(this.yaw - this.yawPrev), Math.cos(this.yaw - this.yawPrev)) / Math.max(dt, 1e-3);
    this.yawPrev = this.yaw; this.taxaYaw += (dY - this.taxaYaw) * amort(10, dt);
    const roll = clamp(-this.vel.dot(this.dir) * 0.045 + this.taxaYaw * 0.05, -0.55, 0.55);
    const pit = clamp(this.pitch * 0.6 + this.vel.y * 0.03, -0.7, 0.7);
    this.rollV += (roll - this.rollV) * amort(7, dt); this.pitchV += (pit - this.pitchV) * amort(9, dt);
    this.obj.rotation.set(this.pitchV, this.yawV, this.rollV);
    this.modelo.punch = Math.max(0, this.modelo.punch - dt * 2.2);
    this.obj.scale.setScalar(this.modelo.escala * (1 + this.modelo.punch * 0.3));
    this.obj.visible = this.invul <= 0 || Math.floor(this.invul * 12) % 2 === 0;
  }

  // Asas, abdômen e pernas reagem à velocidade e à aceleração
  animar(dt, t, jogando) {
    const m = this.modelo, S = this.estado, sp = clamp(this.vel.length() / (S.velMax * 2), 0, 1);
    const b = Math.sin(t * (40 + S.total * 1.5) * (this.corre ? 1.25 : 1)) * (jogando ? 0.55 + sp * 0.35 : 0.35);
    m.asas[0].rotation.z = b; m.asas[1].rotation.z = -b;
    this.abV += (clamp(this.vel.y * 0.04 + sp * 0.15, -0.35, 0.5) - this.abV) * amort(8, dt);
    m.abdomen.rotation.x = this.abV; m.abdomen.scale.y = 1 + Math.sin(t * 5) * 0.03; m.abdomen.scale.x = 1 + Math.sin(t * 5 + 1) * 0.015;
    this.pernaV += (-sp * 0.5 - this.pernaV) * amort(6, dt);
    m.pernas.forEach((p, i) => { p.rotation.z = Math.sin(t * 7 + i) * 0.08 * (i % 2 ? -1 : 1); p.rotation.x = this.pernaV; });
    if (!jogando) this.pos.y += Math.sin(t * 2) * 0.002;
  }

  // Câmera: foco suavizado (sem trepidação), spring-arm com colisão, FOV dinâmico
  camera3p(dt) {
    this.foco.lerp(this.pos, amort(20, dt));
    this.eul.set(this.pitch * 0.5, this.yaw, 0, "YXZ");
    this.zoomV += (this.modelo.zoom - this.zoomV) * amort(2.5, dt); const z = Math.pow(this.zoomV, 0.8);   // zoom suave conforme o mosquito cresce
    const dist = (4 + Math.min(this.vel.length() * 0.06, 1.2)) * z, desejo = this.tmp.set(0, 0.9 * z, dist).applyEuler(this.eul);
    const len = desejo.length(), dn = this.tmp2.copy(desejo).normalize();
    desejo.add(this.foco);
    const ms = this.mundo.malhasPerto(this.foco, len + 1);
    if (ms.length) {
      this.rc.set(this.foco, dn); this.rc.far = len;
      const h = this.rc.intersectObjects(ms, false);
      if (h.length) desejo.copy(this.foco).addScaledVector(dn, Math.max(0.8 * z, h[0].distance - 0.3 * z));
    }
    this.camera.position.lerp(desejo, amort(12, dt));
    if (this.shake > 0) this.camera.position.add(this.tmp2.set(Math.random() - 0.5, Math.random() - 0.5, 0).multiplyScalar(this.shake * 0.35));
    this.eul.set(this.pitch * 0.6, this.yaw, 0, "YXZ");
    this.olhar.lerp(this.tmp2.set(0, 0, -8 * z).applyEuler(this.eul).add(this.foco), amort(25, dt));
    this.camera.lookAt(this.olhar);
    const fov = 70 + (this.corre ? 12 : 0) + this.vel.length() * 0.3;
    if (Math.abs(fov - this.camera.fov) > 0.02) { this.camera.fov += (fov - this.camera.fov) * amort(6, dt); this.camera.updateProjectionMatrix(); }
  }
}

// ------------------------------------------------------------
// GAME MANAGER: orquestra tudo
// ------------------------------------------------------------
class GameManager {
  constructor() {
    this.estado = new GameState(); this.audio = new AudioSystem(); this.ui = new UIManager();
    this.cena = new THREE.Scene(); this.cena.background = new THREE.Color(0x0e0c18); this.cena.fog = new THREE.Fog(0x0e0c18, 60, 170);
    this.camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.1, 500);
    this.render = new THREE.WebGLRenderer({ antialias: true });
    this.render.setSize(innerWidth, innerHeight); this.render.setPixelRatio(Math.min(devicePixelRatio, 2));
    $("webgl-container").appendChild(this.render.domElement);
    this.mundo = new WorldManager(this.cena, this.audio);
    this.jogador = new PlayerController(this.cena, this.camera, this.estado, this.mundo);
    this.jogador.pos.set(0, 2, 0);
    this.teclas = {}; this.jogando = false; this.travado = false; this.arrastando = false;
    this.combo = 0; this.comboT = 0; this.boost = 0; this.t = 0; this.salvarT = 0; this.relogio = new THREE.Clock();
    this.egg = { tanque: 0, espelho: 0, yAnt: 0, dica: 0, tour: false, fala: false, morte: 0, vida: 0, carreta: 0, avisoTelao: false };
    this.menuAberto = false; this.aba = "skins";
    this.kills = { tapasRecebidos: 0, gas: 0 }; this.tmpEgg = V(0, 0, 0); this.buf = ""; this.letras = "";
    this.ligar();
    this.ui.atalhos(() => this.abrirColecao("skins"), () => this.abrirColecao("conq")); this.mundo.posicionarCarteira(this.estado);
    this.jogador.modelo.aplicar(); this.jogador.zoomV = this.jogador.modelo.zoom; this.ui.hud(this.estado); this.ui.saveInfo(this.estado);
    this.laco();
  }

  ligar() {
    const cv = this.render.domElement, T = this.teclas;
    addEventListener("keydown", (e) => {
      const k = e.key.toLowerCase(); T[k] = true;
      if ([" ", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(k) && !this.menuAberto) e.preventDefault();
      if (e.repeat) return;
      if (k === "escape" && this.menuAberto) { this.fecharColecao(); return; }
      if (k === "k") { this.abrirColecao("skins"); return; }
      if (k === "c") { this.abrirColecao("conq"); return; }
      if (this.menuAberto) return;
      const mapa = { 1: "asas", 2: "tromba", 3: "estomago", 4: "corpo" };
      if (mapa[k]) this.evoluir(mapa[k]);
      // Easter eggs por teclado (Konami e a palavra "dengue")
      this.buf = (this.buf + "|" + k).slice(-160); this.letras = (this.letras + (k.length === 1 ? k : "")).slice(-12);
      if (this.buf.endsWith("|arrowup|arrowup|arrowdown|arrowdown|arrowleft|arrowright|arrowleft|arrowright|b|a")) this.desbloquear("pixel");
      if (this.letras.endsWith("dengue")) this.desbloquear("dengue");
      if (k === "e") this.picar();
      if (k === "h") this.dica();
      if (k === "=" && this.jogando) this.tour();
      if (k === "b" && this.jogando && !this.buf.endsWith("|arrowright|b")) this.pegarCarteira();
      if (k === "m") this.ui.toast(this.audio.alternarMudo() ? "Som desligado" : "Som ligado");
    });
    addEventListener("keyup", (e) => { T[e.key.toLowerCase()] = false; });
    addEventListener("blur", () => { for (const k in T) T[k] = false; });
    addEventListener("mousemove", (e) => { if (this.jogando && (this.travado || this.arrastando)) this.jogador.mirar(e.movementX, e.movementY); });
    cv.addEventListener("mousedown", () => { if (this.jogando && !this.travado) this.arrastando = true; });
    addEventListener("mouseup", () => { this.arrastando = false; });
    this.ui.ligar((k) => { this.audio.clique(); this.evoluir(k); }, () => this.iniciar());
    document.addEventListener("pointerlockchange", () => {
      this.travado = document.pointerLockElement === cv;
      if (!this.travado && this.jogando && !this.menuAberto) { this.jogando = false; this.audio.silenciar(); this.ui.menu("Pausado", "Continuar"); }
    });
    document.addEventListener("pointerlockerror", () => { this.jogando = true; this.ui.esconderMenu(); });
    addEventListener("resize", () => {
      this.camera.aspect = innerWidth / innerHeight; this.camera.updateProjectionMatrix(); this.render.setSize(innerWidth, innerHeight);
    });
  }

  iniciar() {
    this.jogando = true; this.ui.esconderMenu(); this.audio.iniciar(); this.audio.clique();
    this.render.domElement.requestPointerLock?.();
    this.ganhar("primeiro");
    if (!this.dicaInicial) { this.dicaInicial = true; this.ui.toast("E pica humanos · K skins · C conquistas · H dica · = tour da escola"); }
  }

  coletar(g) {
    const u = g.userData, S = this.estado, j = this.jogador;
    if (u.tipo === "veneno") {
      const perda = Math.floor(S.sangue * 0.1); S.sangue -= perda; this.combo = 0; this.comboT = 0; j.stamina = 0;
      this.mundo.emitir(g.position, 0x9d33ff, 14, 3);
      this.audio.veneno(); this.ui.flash("rgba(120,255,80,.8)"); this.ui.toast(`☠ Gota venenosa! −${perda} sangue`); j.shake = 1;
      if (j.tomarDano(18)) this.morrer();
    } else {
      this.combo = this.comboT > 0 ? Math.min(this.combo + 1, 5) : 1; this.comboT = CFG.COMBO_T;
      const dour = u.tipo === "dourada";
      if (dour) this.boost = 10;
      const ganho = S.valorGota * (dour ? 5 : 1) * this.combo * (this.boost > 0 ? 2 : 1);
      S.sangue += ganho;
      this.mundo.emitir(g.position, this.mundo.cores[u.tipo], dour ? 20 : 12);
      this.audio.slurp(dour); this.ui.toast(dour ? `✨ +${ganho} · XP×2 por 10s` : `+${ganho} sangue`);
    }
    this.ui.hud(S); this.salvarT = 3;
  }

  // ---- Picar humanos: muito sangue (pontos de evolução), mas eles revidam ----
  picar() {
    const h = this.mundo.humanoPerto; if (!this.jogando || this.menuAberto || !h) return;
    const S = this.estado;
    this.combo = this.comboT > 0 ? Math.min(this.combo + 1, 5) : 1; this.comboT = CFG.COMBO_T;
    const ganho = Math.round((25 + S.valorGota * 6) * this.combo * (this.boost > 0 ? 2 : 1));
    S.sangue += ganho; S.picadas++;
    h.pronto = 18; h.raiva = 4; h.tapa = 0.6;   // 0,6 s de vantagem pra fugir
    this.mundo.emitir(h.alvo, 0xff1744, 26, 4); this.audio.picada(); this.ui.flash("rgba(255,23,68,.35)");
    this.ui.toast(`🩸 Picou ${h.nome}! +${ganho} sangue — fuja do tapa!`); this.ui.hud(S); this.salvarT = 3;
    if (S.picadas >= 10) this.desbloquear("vampiro");
  }
  tapa(h) {
    const j = this.jogador;
    j.vel.add(this.tmpEgg.copy(j.pos).sub(h.alvo).setY(0.3).normalize().multiplyScalar(14)); j.shake = 1;
    this.combo = 0; this.comboT = 0; this.kills.tapasRecebidos++; this.audio.tapa(); this.ui.toast(`👋 ${h.nome} te deu um tapa!`);
    this.dano(30);
  }

  // ---- Easter eggs e skins ----
  // ---- Menu de coleção (K = skins, C = conquistas): pausa a simulação enquanto está aberto ----
  apiColecao() { return { escolher: (id) => this.escolherSkin(id), progresso: (id) => this.progresso(id), aba: (a) => this.abrirColecao(a, true), fechar: () => this.fecharColecao() }; }
  abrirColecao(aba, trocar = false) {
    if (!trocar && this.menuAberto && this.aba === aba) { this.fecharColecao(); return; }
    if (!this.menuAberto) this.audio.clique();
    this.aba = aba; this.menuAberto = true; this.audio.silenciar();
    this.ui.abrirColecao(this.estado, aba, this.apiColecao());
  }
  fecharColecao() {
    this.ui.fecharColecao(); this.menuAberto = false; this.audio.clique();
    if (this.jogando) this.render.domElement.requestPointerLock?.();
  }
  escolherSkin(id) {
    const S = this.estado;
    if (id && !S.skins.includes(id)) return;
    S.skin = id; this.jogador.modelo.aplicar(); this.jogador.modelo.punch = 0.6; this.audio.clique();
    this.ui.toast(id ? `Skin: ${CFG.SKINS[id].nome}` : "Skin: padrão"); S.salvar();
    if (this.menuAberto) this.ui.abrirColecao(S, this.aba, this.apiColecao());
  }
  desbloquear(id) {
    const S = this.estado, sk = CFG.SKINS[id]; if (!sk || S.skins.includes(id)) return;
    S.skins.push(id); S.skin = id; this.jogador.modelo.aplicar(); this.jogador.modelo.punch = 1;
    this.audio.egg(); this.mundo.emitir(this.jogador.pos, sk.brilho, 40, 6);
    this.ui.evolucao(`🥚 Easter egg! Skin: ${sk.nome}`);
    this.ui.toast(`Skins ${S.skins.length}/${Object.keys(CFG.SKINS).length} — K abre o menu de skins`); S.salvar();
  }
  dica() {
    const falta = Object.keys(CFG.SKINS).filter((k) => !this.estado.skins.includes(k));
    if (!falta.length) { this.ui.toast("🏆 Você achou todos os easter eggs!"); return; }
    this.ui.toast(`🔍 ${CFG.SKINS[falta[this.egg.dica++ % falta.length]].dica}`);
  }
  checarEggs(dt) {
    const p = this.jogador.pos, F = CFG.YMIN, e = this.egg, S = this.estado;
    // Relógio da parede da sala de Biologia
    if (p.distanceToSquared(this.tmpEgg.set(9, F + 11, -CFG.MZ + 0.6)) < 2.2 * 2.2) this.desbloquear("relojoeiro");
    // Pousar em cima do tanque de larvas por 1 s
    e.tanque = Math.hypot(p.x - 66, p.z + 45) < 2.4 && p.y > F + 6 && p.y < F + 8 ? e.tanque + dt : 0;
    if (e.tanque > 1) this.desbloquear("radioativo");
    // Cesta: cruzar o aro de cima para baixo
    for (const x of [-2.1, 37.1]) if (Math.hypot(p.x - x, p.z - 29) < 0.95 && e.yAnt > F + 7.6 && p.y <= F + 7.6) this.desbloquear("jogador");
    e.yAnt = p.y;
    // Ficar 2 s diante do espelho do banheiro
    e.espelho = p.x > 45.6 && p.x < 50 && Math.abs(p.z - 36) < 8 && Math.abs(p.y - (F + 7.5)) < 2.5 ? e.espelho + dt : 0;
    if (e.espelho > 2) this.desbloquear("fantasma");
    // Caminhão de som: parado 3 s diante do telão do auditório, então aperte ESPAÇO
    const noTelao = Math.abs(p.x - 90.5) < 9 && p.z > 40 && p.z < 49 && p.y > F + 3 && p.y < F + 12 && this.jogador.vel.length() < 3;
    e.carreta = noTelao ? e.carreta + dt : 0;
    if (e.carreta > 3 && !S.skins.includes("carreta")) { if (!e.avisoTelao) { e.avisoTelao = true; this.ui.toast("🔊 O telão liga... aperte ESPAÇO!"); } if (this.teclas[" "]) this.desbloquear("carreta"); }
    if (!noTelao) e.avisoTelao = false;
    // Salas visitadas (mostra as alas novas e alimenta as conquistas)
    const sala = CFG.SALAS.find(([, x0, x1, z0, z1]) => p.x >= x0 && p.x < x1 && p.z >= z0 && p.z < z1);
    if (sala && !S.salas.includes(sala[0])) {
      S.salas.push(sala[0]); S.salvar(); this.ui.toast(`📍 ${sala[0]} (${S.salas.length}/${CFG.SALAS.length} salas)`);
      if (sala[0] === "Enfermaria") this.ganhar("enfermaria");
      if (sala[0] === "Auditório") this.ganhar("auditorio");
      if (S.salas.length >= CFG.SALAS.length) this.ganhar("explorador");
    }
  }

  // ---------------------------------------------------------
  // CONQUISTAS (persistem no save; aparecem no menu C)
  // ---------------------------------------------------------
  ganhar(id) {
    const S = this.estado, c = CFG.CONQ.find((x) => x.id === id);
    if (!c || S.conq.includes(id)) return;
    S.conq.push(id); S.salvar();
    this.audio.egg(); this.ui.evolucao(`🏆 Conquista: ${c.nome}`);
    this.ui.toast(`${c.desc} · ${S.conq.length}/${CFG.CONQ.length}`); this.mostrarConquista(c);
  }
  mostrarConquista(c) {
    const e = document.createElement("div"), pos = this.pilhaConq = (this.pilhaConq || 0) + 1;
    e.style.cssText = `position:fixed;right:22px;top:${80 + (pos - 1) * 72}px;display:flex;gap:12px;align-items:center;background:rgba(12,10,22,.95);border:1px solid rgba(255,216,77,.45);border-radius:12px;padding:12px 16px;z-index:7;font-family:Syne,Figtree,system-ui,sans-serif;color:#eef2f8;pointer-events:none`;
    e.innerHTML = `<span style="font-size:1.6rem">${c.ico}</span><span><b style="display:block;font:800 .95rem Syne,sans-serif;color:#ffd84d">${c.nome}</b><small style="font:600 .74rem Figtree,sans-serif;color:#a8b0c0">${c.desc}</small></span>`;
    document.body.appendChild(e);
    setTimeout(() => { e.style.transition = "opacity .5s"; e.style.opacity = "0"; setTimeout(() => { e.remove(); this.pilhaConq = Math.max(0, this.pilhaConq - 1); }, 600); }, 3200);
  }
  progresso(id) {
    const S = this.estado, k = this.kills, n = Object.keys(CFG.SKINS).length;
    const m = { sangue500: [S.sangue, 500], sangue5000: [S.sangue, 5000], nivel40: [S.total, 40], picada25: [S.picadas, 25], tapas: [k.tapasRecebidos, 5], gas3: [k.gas, 3],
      sobreviver: [this.egg.vida, 180], colecionador: [S.skins.length, 5], todas: [S.skins.length, n], dez: [S.conq.length, 10], explorador: [S.salas.length, CFG.SALAS.length] }[id];
    return m ? { v: Math.min(m[0], m[1]), max: m[1] } : null;
  }
  checarConquistas(dt) {
    const S = this.estado, e = this.egg, k = this.kills;
    if (S.sangue >= 500) this.ganhar("sangue500");
    if (S.sangue >= 5000) this.ganhar("sangue5000");
    if (S.total >= 40) this.ganhar("nivel40");
    
    // Conquistas baseadas nos estágios e níveis
    if (S.total >= 120) this.ganhar("soberano");
    if (S.total >= 110) this.ganhar("lorde");
    if (S.total >= 100) this.ganhar("pesadeloCrepuscular");
    if (S.total >= 85) this.ganhar("deusCarmesim");
    if (S.total >= 65) this.ganhar("sugadorAncestral");
    if (S.total >= 48) this.ganhar("reiEnxame");
    if (S.total >= 35) this.ganhar("terrorMadrugada");
    if (S.total >= 25) this.ganhar("pragaPantano");
    if (S.total >= 18) this.ganhar("mosquitoLaboratorio");
    if (S.total >= 12) this.ganhar("vampiroAlado");
    if (S.total >= 7) this.ganhar("cacadorNoturno");
    if (S.total >= 3) this.ganhar("pernilongo");

    if (S.picadas >= 1) this.ganhar("picada1");
    if (S.picadas >= 25) this.ganhar("picada25");
    if (k.tapasRecebidos >= 5) this.ganhar("tapas");
    if (k.gas >= 3) this.ganhar("gas3");
    if (e.tour) this.ganhar("turista");
    if (e.fala) this.ganhar("fala");
    e.vida += dt; if (e.vida > 180) this.ganhar("sobreviver");   
    if (S.skins.length >= 5) this.ganhar("colecionador");
    if (S.skins.length >= Object.keys(CFG.SKINS).length) this.ganhar("todas");
    if (S.conq.length >= 10) this.ganhar("dez");
  }

  // ---- Carteira perdida no corredor (aperte B perto dela): até 3 vezes, 250 de sangue cada ----
  pegarCarteira() {
    const c = this.mundo.carteira, S = this.estado;
    if (!this.jogando || !c || !c.visivel || this.jogador.pos.distanceToSquared(c.g.position) > 36) { this.ui.toast("Nenhuma carteira por perto"); return; }
    S.carteiras++; S.sangue += 250; this.jogador.modelo.punch = 0.8; this.mundo.posicionarCarteira(S);
    this.audio.egg(); this.ui.toast(`🎒 Carteira devolvida! +250 sangue (${S.carteiras}/3)`); this.ui.hud(S); S.salvar(); this.ganhar("carteira");
  }
  tour() {   // = abre/fecha o passeio guiado pela escola
    if (this.ui.dialogoAberto()) { this.ui.fecharDialogo(); return; }
    this.audio.clique(); this.egg.tour = true;
    this.ui.dialogo("TOUR DA ESCOLA",
      "CORREDOR CENTRAL: armários, bebedouros, extintores e a carteira perdida (B)\n" +
      "NORTE: Sala 1 · Sala 2 · Biblioteca · Laboratório · ENFERMARIA (camas, cortinas, cruz)\n" +
      "SUL: Cantina · Ginásio · Banheiro · AUDITÓRIO (palco, telão, 48 poltronas)\n\n" +
      "E pica humanos · K skins · C conquistas · H dica de easter egg\n" +
      "O Mosquitão da rua está sobre o palco do auditório.",
      "Feche com = ou clique aqui", 12000);
  }

  dano(v, continuo = false) {
    if (this.jogador.tomarDano(v)) return this.morrer();
    if (!continuo) { this.ui.flash("rgba(232,41,75,.8)"); this.audio.dano(); }
  }
  morrer() {
    const S = this.estado, perda = Math.floor(S.sangue * 0.25); S.sangue -= perda;
    this.combo = 0; this.comboT = 0; this.boost = 0; this.egg.morte++; this.egg.vida = 0; this.jogador.reaparecer();
    this.audio.dano(); this.ui.flash("rgba(232,41,75,.9)"); this.ui.toast(`Você foi pego! −${perda} sangue`); this.ui.hud(S); S.salvar();
  }

  evoluir(k) {
    if (!this.jogando || this.menuAberto) return;
    const S = this.estado;
    if (S.sangue < S.custo(k)) { this.ui.toast("Sangue insuficiente"); return; }
    const antes = S.estagio;
    S.sangue -= S.custo(k); S.nv[k]++;
    this.jogador.vida = S.vidaMax; this.jogador.modelo.aplicar(); this.jogador.modelo.punch = 1;
    this.mundo.emitir(this.jogador.pos, S.estagio.cor, 24, 5);
    this.audio.evolucao(); this.ui.hud(S); S.salvar();
    if (S.estagio !== antes) this.ui.evolucao(S.estagio.nome); else this.ui.toast(`${CFG.UPS[k].nome} nv ${S.nv[k]}`);
  }

  atualizar(dt) {
    const j = this.jogador, S = this.estado, w = this.mundo;
    j.fator = w.emPerigo === "gas" ? 0.65 : 1;
    j.update(dt, this.teclas);
    w.update(dt, this);
    this.checarEggs(dt);
    if (this.comboT > 0 && (this.comboT -= dt) <= 0) this.combo = 0;
    if (this.boost > 0) this.boost -= dt;
    this.ui.combo(this.combo, this.comboT, this.boost);
    this.ui.barras(j.stamina, S.staminaMax, j.vida, S.vidaMax);
    this.ui.alerta(w.emPerigo === "gas" ? "☣ GÁS TÓXICO — saia!" : w.emPerigo === "poca" ? "☣ Poça tóxica — suba!" : w.avisoGas ? "⚠ INSETICIDA a caminho!" : w.humanoPerto ? `🩸 Aperte E para picar ${w.humanoPerto.nome}` : (w.carteira && w.carteira.visivel && j.pos.distanceToSquared(w.carteira.g.position) < 36) ? "🎒 Aperte B para pegar a carteira" : "",
      w.emPerigo ? "#8dff6a" : w.avisoGas ? "#ffd84d" : "#ff6b8a");
    this.ui.perigo("rgba(120,255,80,.7)", w.emPerigo ? 0.35 : 0);
    this.audio.zumbir(clamp(j.vel.length() / (S.velMax * 2), 0, 1), j.corre);

    this.audio.tocarMúsicaCarreta(this.t, S.skin === "carreta");

    this.checarConquistas(dt);
    // Mosquitão da rua: falas conforme a distância
    const mo = w.mosquito;
    if (mo) {
      const d = j.pos.distanceTo(mo.centro);
      if (d < 7) { this.falaT = (this.falaT || 0) - dt; if (this.falaT <= 0) { this.falaT = 9; w.falar(moFrases[(this.egg.falas = (this.egg.falas || 0) + 1) % moFrases.length]); } }
      mo.trompa.rotation.y = Math.sin(this.t * 0.8) * 0.25; mo.g.rotation.y = Math.sin(this.t * 0.25) * 0.08;
      if (d < 5) { this.egg.fala = true; if (!S.skins.includes("mosquito")) this.desbloquear("mosquito"); }
    }
    if (this.salvarT > 0 && (this.salvarT -= dt) <= 0) S.salvar();
  }

  laco() {
    requestAnimationFrame(() => this.laco());
    const dt = Math.min(this.relogio.getDelta(), 0.05); this.t += dt;
    if (this.jogando && !this.menuAberto) this.atualizar(dt);
    this.jogador.animar(dt, this.t, this.jogando);
    this.jogador.modelo.tick(this.t); this.jogador.camera3p(dt); this.ui.atualizar(dt);
    this.render.render(this.cena, this.camera);
  }
}

new GameManager();
})();
