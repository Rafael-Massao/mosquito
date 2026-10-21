"use strict";
// ============================================================
// MOSQUITO EVOLUTION — arquitetura modular (Three.js r128)
// GameManager · PlayerController · WorldManager · AudioSystem · UIManager
// Tudo encapsulado: nenhuma variável global além do próprio escopo da IIFE.
// ============================================================
(() => {

const CFG = {
  MX: 70, MZ: 50, YMIN: -3.5, YMAX: 12, SAVE: "mosquito-evolucao-v1", CRESCE: 1.3, COMBO_T: 4,
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
  ],
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
    try {
      const s = JSON.parse(localStorage.getItem(CFG.SAVE));
      if (s && s.nv) { this.sangue = +s.sangue || 0; for (const k in this.nv) this.nv[k] = +s.nv[k] || 0; }
    } catch (e) { /* sem save */ }
  }
  salvar() { try { localStorage.setItem(CFG.SAVE, JSON.stringify({ sangue: this.sangue, nv: this.nv })); } catch (e) {} }
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
class AudioSystem {
  constructor() { this.ctx = null; this.mudo = false; }
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
  alternarMudo() { this.mudo = !this.mudo; if (this.mudo && this.ctx) this.zum.gain.value = 0; return this.mudo; }
  zumbir(v, sprint) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime, f = 190 + v * 70 + (sprint ? 90 : 0);
    this.o1.frequency.setTargetAtTime(f, t, 0.08); this.o2.frequency.setTargetAtTime(f * 2.01, t, 0.08);
    this.zum.gain.setTargetAtTime(this.mudo ? 0 : 0.03 + v * 0.035, t, 0.1);
  }
  silenciar() { if (this.ctx) this.zum.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05); }
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
  menu(titulo, botao) { const m = $("menu"); m.hidden = false; m.querySelector("h1").textContent = titulo; $("btn-jogar").textContent = botao; }
  esconderMenu() { $("menu").hidden = true; }
  saveInfo(S) { const e = $("save-info"); if (e) e.textContent = S.total > 0 ? `Progresso salvo: ${S.estagio.nome}, ${Math.floor(S.sangue)} de sangue.` : ""; }
  ligar(aoEvoluir, aoJogar) {
    document.querySelectorAll(".up").forEach((b) => b.addEventListener("click", () => aoEvoluir(b.dataset.up)));
    $("btn-jogar").addEventListener("click", aoJogar);
  }
}

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
const V = (x, y, z) => new THREE.Vector3(x, y, z);

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

const luzCorpo = new THREE.PointLight(0xffb45c, 0, 5);
mosquito.add(luzCorpo);

mosquito.position.set(0, 2, 0);

let escalaBase = 1.2, punch = 0;

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

  zoom = medir(cs, comp, c, abz) / RAIO_BASE;
}


return { mosquito, asas, abdomen, pernas, aplicar: aplicarEvolucaoVisual,
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
    this.construirCenario(); this.criarGotas(); this.criarParticulas(); this.criarPerigos();
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

  // ESCOLA COMPLETA (140×100): corredor central, 2 salas, biblioteca, laboratório, cantina, ginásio e banheiro
  construirCenario() {
    const { MX, MZ, YMIN: F, YMAX } = CFG;
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
    const tPiso = tex(cp); tPiso.wrapS = tPiso.wrapT = THREE.RepeatWrapping; tPiso.repeat.set(MX / 4, MZ / 4);
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

    // Luzes: ambiente, luar e 6 lâmpadas (a do corredor pisca)
    this.cena.add(new THREE.AmbientLight(0x8a8fb0, 0.95));
    const lua = new THREE.DirectionalLight(0x7692ff, 0.5); lua.position.set(-30, 30, 10); this.cena.add(lua);
    [[0, 0], [-49, -28], [-7, -28], [56, -28], [-40, 29], [17, 29]].forEach(([x, z], i) => {
      const l = new THREE.PointLight(0xdff0ff, i ? 1.2 : 1.6, 60); l.position.set(x, YMAX - 2, z); this.cena.add(l); if (!i) this.luz = l;
    });

    // Casca externa
    const cy = (YMAX + F) / 2, H = YMAX - F + 4, T = 1;
    caixa(MX * 2, 2, MZ * 2, m.piso, 0, F - 1, 0); caixa(MX * 2 + 4, 2, MZ * 2 + 4, m.teto, 0, YMAX + 1, 0);
    caixa(MX * 2 + 4, H, 2, m.par, 0, cy, -MZ - 1); caixa(MX * 2 + 4, H, 2, m.par, 0, cy, MZ + 1);
    caixa(2, H, MZ * 2, m.par, -MX - 1, cy, 0); caixa(2, H, MZ * 2, m.par, MX + 1, cy, 0);

    // Paredes internas com vãos de porta (10 de largura, 9.5 de altura)
    const parede = (eixo, fixo, ini, fim, portas = []) => {
      const seg = (a, b, h, y) => { if (b - a < 0.01) return; if (eixo === "x") caixa(b - a, h, T, m.par, (a + b) / 2, y, fixo); else caixa(T, h, b - a, m.par, fixo, y, (a + b) / 2); };
      let cur = ini;
      for (const p of [...portas].sort((a, b) => a - b)) { seg(cur, p - 5, H, cy); seg(p - 5, p + 5, YMAX - F - 9.5, (YMAX + F + 9.5) / 2); cur = p + 5; }
      seg(cur, fim, H, cy);
    };
    const PN = [-49, -7, 28, 56], PS = [-40, 17, 57];
    parede("x", -8, -MX, MX, PN); parede("x", 8, -MX, MX, PS);
    for (const x of [-28, 14, 42]) parede("z", x, -MZ, -8);
    for (const x of [-10, 45]) parede("z", x, 8, MZ);
    ["SALA 1", "SALA 2", "BIBLIOTECA", "LABORATÓRIO"].forEach((t, i) => placa(t, PN[i], 0, -1));
    ["CANTINA", "GINÁSIO", "BANHEIRO"].forEach((t, i) => placa(t, PS[i], 0, 1));

    // Corredor: armários nas duas paredes (pulando as portas), janelas nas pontas, lâmpadas
    for (let x = -67; x <= 67; x += 5) {
      if (!PN.some((p) => Math.abs(x - p) < 7)) caixa(4.4, 9.5, 2.6, (x / 5) % 2 ? m.l1 : m.l2, x, F + 4.75, -6.2);
      if (!PS.some((p) => Math.abs(x - p) < 7)) caixa(4.4, 9.5, 2.6, (x / 5) % 2 ? m.l2 : m.l1, x, F + 4.75, 6.2);
    }
    janela(-MX + 0.05, 0, Math.PI / 2); janela(MX - 0.05, 0, -Math.PI / 2);
    for (let x = -60; x <= 60; x += 20) dbox(14, 0.3, 1.6, B(0xeaf6ff), x, YMAX - 0.15, 0);

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
    this.deco(new THREE.Mesh(new THREE.CircleGeometry(1.5, 24), B(0xeeeeee)), 9, F + 11, -MZ + 0.12);
    janela(-MX + 0.05, -30, Math.PI / 2);

    // Biblioteca: estantes com lombadas, mesas de leitura e carpete
    chao(26, 38, B(0x34425f), 28, -29);
    for (const x of [19.5, 36.5]) for (const z of [-39, -20]) caixa(2.4, 10, 16, m.estante, x, F + 5, z);
    for (const z of [-42, -30, -18]) { caixa(8, 0.5, 5, m.mad, 28, F + 3.3, z); for (const l of [-1, 1]) caixa(0.4, 3, 4.4, m.mad, 28 + l * 3.2, F + 1.5, z); }

    // Laboratório: bancadas, frascos e tanque de larvas
    for (const z of [-42, -30, -18]) {
      caixa(20, 0.8, 5, m.bancada, 56, F + 3.6, z); caixa(19, 3.2, 4.4, m.metal, 56, F + 1.6, z);
      for (let i = 0; i < 4; i++) this.deco(new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.8, 1.4, 12), M([0x66ffaa, 0xff6688, 0x66ccff, 0xffe066][i], 0.2, { emissive: [0x22aa66, 0xaa2244, 0x2266aa, 0xaa9922][i], emissiveIntensity: 0.6 })), 49 + i * 4.5, F + 4.7, z);
    }
    cil(2.5, 2.5, 6, m.vidro, 66, F + 3, -45); janela(MX - 0.05, -30, -Math.PI / 2);

    // Cantina: mesas com bancos, balcão e placa
    for (const x of [-58, -40, -22]) for (const z of [20, 29, 38]) {
      caixa(14, 0.5, 4.2, m.mesa, x, F + 3.3, z); caixa(1.2, 3, 3.6, m.metal, x, F + 1.5, z);
      for (const l of [-1, 1]) caixa(14, 0.4, 1.6, m.banco, x, F + 1.9, z + l * 3.4);
    }
    caixa(30, 5, 3, m.mad, -40, F + 2.5, MZ - 2.5);
    { const [c, g] = tela(256, 64); g.fillStyle = "#7a2a1a"; g.fillRect(0, 0, 256, 64); g.fillStyle = "#ffd84d"; g.font = "bold 38px sans-serif"; g.textAlign = "center"; g.fillText("CANTINA", 128, 46);
      this.deco(new THREE.Mesh(new THREE.PlaneGeometry(12, 3), new THREE.MeshBasicMaterial({ map: tex(c) })), -40, F + 9, MZ - 0.55, Math.PI); }
    janela(-MX + 0.05, 30, Math.PI / 2);

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
    janela(MX - 0.05, 30, -Math.PI / 2);

    // Lâmpadas do teto nas salas
    for (const [x, z] of [[-49, -28], [-7, -28], [28, -28], [56, -28], [-40, 29], [17, 29], [57, 29]]) dbox(14, 0.3, 1.6, B(0xeaf6ff), x, YMAX - 0.15, z);
  }

  livre(p, margem) { for (const c of this.col) if (c.box.distanceToPoint(p) < margem) return false; return true; }
  sorteio(alvo, yMin = CFG.YMIN + 1, yMax = CFG.YMAX - 1) {
    for (let i = 0; i < 10; i++) {
      alvo.set((Math.random() - 0.5) * CFG.MX * 1.8, yMin + Math.random() * (yMax - yMin), (Math.random() - 0.5) * CFG.MZ * 1.8);
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
    this.pocas = [[-40, 0, 4.5], [40, 0, 4.5], [-6, 30, 3.5], [55, 40, 3], [-30, 13, 3]].map(([x, z, r]) => {
      const m = new THREE.Mesh(new THREE.CircleGeometry(r, 32), new THREE.MeshBasicMaterial({ color: 0x7dff3a, transparent: true, opacity: 0.35, depthWrite: false }));
      m.rotation.x = -Math.PI / 2; m.position.set(x, CFG.YMIN + 0.08, z); this.cena.add(m); return { m, x, z, r };
    });
  }
  iniciarGas(n) {
    const u = n.userData; this.sorteio(n.position, CFG.YMIN + 1.5, 7);
    u.fase = "aviso"; u.t = 2.2; u.raio = 4.5 + Math.random() * 1.5;
    u.miolo.visible = false; u.rede.material.color.setHex(0xffcc33); n.scale.setScalar(u.raio); n.visible = true;
    this.gasAtivos.push(n); this.audio.alerta();
  }

  update(dt, jogo) {
    const p = jogo.jogador.pos, S = jogo.estado;
    this.emPerigo = null; this.avisoGas = false;
    this.luz.intensity = Math.sin(jogo.t * 3.1) * Math.sin(jogo.t * 17.3) > 0.93 ? 0.5 : 1.6;   // lâmpada falhando

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
          this.emPerigo = "gas"; jogo.dano(16 * dt, true); jogo.jogador.stamina = Math.max(0, jogo.jogador.stamina - 30 * dt);
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
    this.ligar();
    this.jogador.modelo.aplicar(); this.jogador.zoomV = this.jogador.modelo.zoom; this.ui.hud(this.estado); this.ui.saveInfo(this.estado);
    this.laco();
  }

  ligar() {
    const cv = this.render.domElement, T = this.teclas;
    addEventListener("keydown", (e) => {
      const k = e.key.toLowerCase(); T[k] = true;
      if ([" ", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(k)) e.preventDefault();
      if (e.repeat) return;
      const mapa = { 1: "asas", 2: "tromba", 3: "estomago", 4: "corpo" };
      if (mapa[k]) this.evoluir(mapa[k]);
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
      if (!this.travado && this.jogando) { this.jogando = false; this.audio.silenciar(); this.ui.menu("Pausado", "Continuar"); }
    });
    document.addEventListener("pointerlockerror", () => { this.jogando = true; this.ui.esconderMenu(); });
    addEventListener("resize", () => {
      this.camera.aspect = innerWidth / innerHeight; this.camera.updateProjectionMatrix(); this.render.setSize(innerWidth, innerHeight);
    });
  }

  iniciar() {
    this.jogando = true; this.ui.esconderMenu(); this.audio.iniciar(); this.audio.clique();
    this.render.domElement.requestPointerLock?.();
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

  dano(v, continuo = false) {
    if (this.jogador.tomarDano(v)) return this.morrer();
    if (!continuo) { this.ui.flash("rgba(232,41,75,.8)"); this.audio.dano(); }
  }
  morrer() {
    const S = this.estado, perda = Math.floor(S.sangue * 0.25); S.sangue -= perda;
    this.combo = 0; this.comboT = 0; this.boost = 0; this.jogador.reaparecer();
    this.audio.dano(); this.ui.flash("rgba(232,41,75,.9)"); this.ui.toast(`Você foi pego! −${perda} sangue`); this.ui.hud(S); S.salvar();
  }

  evoluir(k) {
    if (!this.jogando) return;
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
    if (this.comboT > 0 && (this.comboT -= dt) <= 0) this.combo = 0;
    if (this.boost > 0) this.boost -= dt;
    this.ui.combo(this.combo, this.comboT, this.boost);
    this.ui.barras(j.stamina, S.staminaMax, j.vida, S.vidaMax);
    this.ui.alerta(w.emPerigo === "gas" ? "☣ GÁS TÓXICO — saia!" : w.emPerigo === "poca" ? "☣ Poça tóxica — suba!" : w.avisoGas ? "⚠ INSETICIDA a caminho!" : "",
      w.emPerigo ? "#8dff6a" : "#ffd84d");
    this.ui.perigo("rgba(120,255,80,.7)", w.emPerigo ? 0.35 : 0);
    this.audio.zumbir(clamp(j.vel.length() / (S.velMax * 2), 0, 1), j.corre);
    if (this.salvarT > 0 && (this.salvarT -= dt) <= 0) S.salvar();
  }

  laco() {
    requestAnimationFrame(() => this.laco());
    const dt = Math.min(this.relogio.getDelta(), 0.05); this.t += dt;
    if (this.jogando) this.atualizar(dt);
    this.jogador.animar(dt, this.t, this.jogando);
    this.jogador.camera3p(dt); this.ui.atualizar(dt);
    this.render.render(this.cena, this.camera);
  }
}

new GameManager();
})();