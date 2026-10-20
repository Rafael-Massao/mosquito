"use strict";
// ============================================================
// MOSQUITO: EVOLUÇÃO NOTURNA  (Three.js r128)
// ============================================================

const MUNDO = 30, YMIN = -3.5, YMAX = 12;
const ESTAGIOS = [
  { min: 0,  nome: "Larva voadora",     cor: 0xffb45c },
  { min: 3,  nome: "Pernilongo",        cor: 0xff3355 },
  { min: 7,  nome: "Caçador noturno",   cor: 0xd83cff },
  { min: 12, nome: "Vampiro alado",     cor: 0x39d9ff },
  { min: 18, nome: "Mosquito de laboratório", cor: 0x55ff55 },
  { min: 25, nome: "Praga dos pântanos", cor: 0xff8833 },
  { min: 35, nome: "Terror da madrugada", cor: 0xff2266 },
  { min: 48, nome: "Rei do enxame",     cor: 0xffd84d },
  { min: 65, nome: "Sugador ancestral", cor: 0x9900ff },
  { min: 85, nome: "Deus carmesim",     cor: 0xffffff },
];
const UPS = { 
  asas: { base: 12 }, 
  tromba: { base: 15 }, 
  estomago: { base: 20 },
  corpo: { base: 18 }
};
const CHAVE_SAVE = "mosquito-evolucao-v1";

const $ = (id) => document.getElementById(id);
const clamp = THREE.MathUtils.clamp;

// ------------------------------------------------------------
// ESTADO E SAVE
// ------------------------------------------------------------
let S = {
  sangue: 0,
  nv: { asas: 0, tromba: 0, estomago: 0, corpo: 0 }
};
try {
  const salvo = JSON.parse(localStorage.getItem(CHAVE_SAVE));
  if (salvo && salvo.nv) S = salvo;
} catch (e) { /* sem save */ }

const salvar = () => { try { localStorage.setItem(CHAVE_SAVE, JSON.stringify(S)); } catch (e) {} };
const nivelTotal = () => S.nv.asas + S.nv.tromba + S.nv.estomago;
const estagioAtual = () => [...ESTAGIOS].reverse().find((e) => nivelTotal() >= e.min);
const custo = (k) => Math.floor(UPS[k].base * Math.pow(1.55, S.nv[k]));
const velMax = () => 4 + S.nv.asas * 0.5;
const raioColeta = () => 0.9 + S.nv.tromba * 0.15;
const valorGota = () => 1 + S.nv.estomago * 2;

let jogando = false, travado = false, arrastando = false;
let stamina = 100, combo = 0, comboT = 0;
const comboTempoMax = 4.0; // Tempo máximo do combo em segundos

// ------------------------------------------------------------
// HUD
// ------------------------------------------------------------
function atualizarHUD() {
  $("sangue").textContent = Math.floor(S.sangue);
  $("estagio").textContent = estagioAtual().nome;
  $("nivel").textContent = nivelTotal();
  for (const k in UPS) {
    document.querySelector(`[data-nv="${k}"]`).textContent = "nv " + S.nv[k];
    document.querySelector(`[data-custo="${k}"]`).textContent = custo(k);
    document.querySelector(`[data-up="${k}"]`).classList.toggle("pode", S.sangue >= custo(k));
  }
}

function retrigger(el, classe) {
  el.classList.remove(classe); void el.offsetWidth; el.classList.add(classe);
}
function toast(txt) { $("toast").textContent = txt; retrigger($("toast"), "mostra"); }

// ------------------------------------------------------------
// CENA E CENÁRIO (MALHAS REAIS PARA COLISÃO)
// ------------------------------------------------------------
const cena = new THREE.Scene();
cena.background = new THREE.Color(0x0e0c18);
cena.fog = new THREE.Fog(0x0e0c18, 30, 110);

const camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.1, 500);
const renderizador = new THREE.WebGLRenderer({ antialias: true });
renderizador.setSize(innerWidth, innerHeight);
renderizador.setPixelRatio(Math.min(devicePixelRatio, 2));
$("webgl-container").appendChild(renderizador.domElement);

// Iluminação
cena.add(new THREE.AmbientLight(0x6b5c7a, 0.8));

const luzAbajur = new THREE.PointLight(0xffa24c, 2.2, 45);
luzAbajur.position.set(-18, 5, -12);
cena.add(luzAbajur);

const lua = new THREE.DirectionalLight(0x7692ff, 0.7);
lua.position.set(20, 30, 15);
cena.add(lua);

// Lista global de malhas (Mesh) para colisão por polígonos reais
const malhasColisao = [];

function registrarMalhaColisao(mesh) {
  cena.add(mesh);
  malhasColisao.push(mesh);
  return mesh;
}

// Materiais do Cenário
const matPiso = new THREE.MeshStandardMaterial({ color: 0x3d2618, roughness: 0.6 });
const matParede = new THREE.MeshStandardMaterial({ color: 0x221d2b, roughness: 0.9 });
const matSofa = new THREE.MeshStandardMaterial({ color: 0x314659, roughness: 0.8 });
const matAlmofada = new THREE.MeshStandardMaterial({ color: 0xc25953, roughness: 0.7 });
const matMesa = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.5 });
const matCadeira = new THREE.MeshStandardMaterial({ color: 0x803d29, roughness: 0.7 });
const matTV = new THREE.MeshStandardMaterial({ color: 0x050508, roughness: 0.2 });
const matTapete = new THREE.MeshStandardMaterial({ color: 0x5c5468, roughness: 0.95 });

// 1. Piso e Paredes
const piso = new THREE.Mesh(new THREE.BoxGeometry(MUNDO * 2, 2, MUNDO * 2), matPiso);
piso.position.set(0, YMIN - 1, 0);
registrarMalhaColisao(piso);

const paredeFundo = new THREE.Mesh(new THREE.BoxGeometry(MUNDO * 2, YMAX - YMIN + 20, 2), matParede);
paredeFundo.position.set(0, (YMAX + YMIN) / 2, -MUNDO - 1);
registrarMalhaColisao(paredeFundo);

const paredeEsq = new THREE.Mesh(new THREE.BoxGeometry(2, YMAX - YMIN + 20, MUNDO * 2), matParede);
paredeEsq.position.set(-MUNDO - 1, (YMAX + YMIN) / 2, 0);
registrarMalhaColisao(paredeEsq);

const paredeDir = new THREE.Mesh(new THREE.BoxGeometry(2, YMAX - YMIN + 20, MUNDO * 2), matParede);
paredeDir.position.set(MUNDO + 1, (YMAX + YMIN) / 2, 0);
registrarMalhaColisao(paredeDir);

const paredeFrente = new THREE.Mesh(new THREE.BoxGeometry(MUNDO * 2, YMAX - YMIN + 20, 2), matParede);
paredeFrente.position.set(0, (YMAX + YMIN) / 2, MUNDO + 1);
registrarMalhaColisao(paredeFrente);

// 2. Tapete
const tapete = new THREE.Mesh(new THREE.BoxGeometry(24, 0.1, 18), matTapete);
tapete.position.set(0, YMIN + 0.05, 0);
cena.add(tapete);

// 3. Sofá (Modelagem com malhas individuais reais)
const sofaPos = new THREE.Vector3(0, YMIN + 1.6, -10);

const sofaAssento = new THREE.Mesh(new THREE.BoxGeometry(18, 3.2, 7.5), matSofa);
sofaAssento.position.copy(sofaPos);
registrarMalhaColisao(sofaAssento);

const sofaEncosto = new THREE.Mesh(new THREE.BoxGeometry(18, 6.5, 2.2), matSofa);
sofaEncosto.position.set(0, 3.2, -2.65).add(sofaPos);
registrarMalhaColisao(sofaEncosto);

const sofaBracoEsq = new THREE.Mesh(new THREE.BoxGeometry(2.8, 4.5, 7.8), matSofa);
sofaBracoEsq.position.set(-9.4, 0.8, 0).add(sofaPos);
registrarMalhaColisao(sofaBracoEsq);

const sofaBracoDir = new THREE.Mesh(new THREE.BoxGeometry(2.8, 4.5, 7.8), matSofa);
sofaBracoDir.position.set(9.4, 0.8, 0).add(sofaPos);
registrarMalhaColisao(sofaBracoDir);

const alm1 = new THREE.Mesh(new THREE.BoxGeometry(4, 3, 1.2), matAlmofada);
alm1.position.set(-5, 2, -1.5).add(sofaPos);
alm1.rotation.x = 0.2;
registrarMalhaColisao(alm1);

const alm2 = new THREE.Mesh(new THREE.BoxGeometry(4, 3, 1.2), matAlmofada);
alm2.position.set(5, 2, -1.5).add(sofaPos);
alm2.rotation.x = 0.2;
registrarMalhaColisao(alm2);

// 4. Mesa de Centro
const mesaPos = new THREE.Vector3(0, YMIN, 1);
const tampoMesa = new THREE.Mesh(new THREE.BoxGeometry(11, 0.6, 6), matMesa);
tampoMesa.position.set(0, 2.2, 0).add(mesaPos);
registrarMalhaColisao(tampoMesa);

[[-4.5, 1.1, -2.4], [4.5, 1.1, -2.4], [-4.5, 1.1, 2.4], [4.5, 1.1, 2.4]].forEach(([px, py, pz]) => {
  const pe = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 2.2, 8), matMesa);
  pe.position.set(px, py, pz).add(mesaPos);
  registrarMalhaColisao(pe);
});

// 5. Poltrona Inclinada
const cadPos = new THREE.Vector3(14, YMIN, 0);

const cadAssento = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.6, 4.5), matCadeira);
cadAssento.position.set(0, 1.8, 0).add(cadPos);
cadAssento.rotation.y = -Math.PI / 3;
registrarMalhaColisao(cadAssento);

const cadEncosto = new THREE.Mesh(new THREE.BoxGeometry(4.5, 3.5, 0.5), matCadeira);
cadEncosto.position.set(0, 3.8, -2.0).applyAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 3).add(cadPos);
cadEncosto.rotation.y = -Math.PI / 3;
cadEncosto.rotation.x = 0;
registrarMalhaColisao(cadEncosto);

[[-1.8, 0.9, -1.8], [1.8, 0.9, -1.8], [-1.8, 0.9, 1.8], [1.8, 0.9, 1.8]].forEach(([px, py, pz]) => {
  const pePerna = new THREE.Vector3(px, py, pz).applyAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 3).add(cadPos);
  const pernaCad = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.8, 8), matMesa);
  pernaCad.position.copy(pePerna);
  registrarMalhaColisao(pernaCad);
});

// 6. Rack e TV
const rackPos = new THREE.Vector3(0, YMIN, 20);
const corpoRack = new THREE.Mesh(new THREE.BoxGeometry(20, 4, 5.5), matMesa);
corpoRack.position.set(0, 2, 0).add(rackPos);
registrarMalhaColisao(corpoRack);

const tvTela = new THREE.Mesh(new THREE.BoxGeometry(15, 8.5, 0.6), matTV);
tvTela.position.set(0, 8.5, 0).add(rackPos);
registrarMalhaColisao(tvTela);

// 7. Abajur Cilíndrico
const abajurPos = new THREE.Vector3(-18, YMIN, -15);
const baseAbajur = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.8, 0.3, 16), matMesa);
baseAbajur.position.set(0, 0.15, 0).add(abajurPos);
registrarMalhaColisao(baseAbajur);

const hasteAbajur = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 11, 12), matMesa);
hasteAbajur.position.set(0, 5.5, 0).add(abajurPos);
registrarMalhaColisao(hasteAbajur);

const cupulaAbajur = new THREE.Mesh(
  new THREE.CylinderGeometry(1.8, 2.8, 3, 16, 1, true),
  new THREE.MeshStandardMaterial({ color: 0xffd8a8, roughness: 0.3, side: THREE.DoubleSide })
);
cupulaAbajur.position.set(0, 10, 0).add(abajurPos);
registrarMalhaColisao(cupulaAbajur);

// ------------------------------------------------------------
// MOSQUITO
// ------------------------------------------------------------
const mosquito = new THREE.Group();
const mat = (cor, extra = {}) => new THREE.MeshStandardMaterial({ color: cor, roughness: 0.5, ...extra });
const matCorpo = mat(0x1c1c22), matAbd = mat(0x3b2025), matPerna = mat(0x0b0b0e, { roughness: 0.8 });
const matOlho = new THREE.MeshStandardMaterial({ color: 0x050507, emissive: 0x000000, emissiveIntensity: 1.0, roughness: 0.1 });
const matAsa = new THREE.MeshStandardMaterial({ color: 0xd8e9ef, transparent: true, opacity: 0.45, side: THREE.DoubleSide });

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

const torax = elipsoide(0.17, 1, 0.9, 1.35, matCorpo, 0, 0, 0.05);
mosquito.add(torax);
mosquito.add(elipsoide(0.125, 1.1, 0.95, 1, matCorpo, 0, 0.02, -0.25));
const olhos = [1, -1].map((l) => {
  const o = elipsoide(0.09, 0.72, 1, 0.8, matOlho, l * 0.105, 0.045, -0.29);
  mosquito.add(o); return o;
});
const abdomen = new THREE.Group(); abdomen.position.z = 0.38; mosquito.add(abdomen);
abdomen.add(elipsoide(0.22, 0.82, 0.82, 1.35, matAbd, 0, 0, 0.15));
abdomen.add(elipsoide(0.18, 0.72, 0.72, 1.5, matAbd, 0, 0, 0.42));
abdomen.add(elipsoide(0.11, 0.65, 0.65, 1.45, matAbd, 0, 0, 0.68));
const probóscide = tubo(new THREE.Vector3(0, 0, -0.32), new THREE.Vector3(0, -0.015, -1), 0.009, matPerna);
mosquito.add(probóscide);

function criarAsa(lado) {
  const f = new THREE.Shape();
  f.moveTo(0, 0); f.quadraticCurveTo(0.3, 0.1, 0.72, 0.04); f.quadraticCurveTo(0.9, 0.01, 0.98, -0.06);
  f.quadraticCurveTo(0.72, -0.15, 0.35, -0.1); f.quadraticCurveTo(0.12, -0.07, 0, 0);
  const malha = new THREE.Mesh(new THREE.ShapeGeometry(f), matAsa);
  malha.rotation.x = -Math.PI / 2; malha.scale.x = lado;
  const pivo = new THREE.Group(); pivo.position.set(lado * 0.12, 0.13, 0.02); pivo.add(malha);
  mosquito.add(pivo); return pivo;
}
const asas = [criarAsa(1), criarAsa(-1)];

const pernas = [];
function criarPerna(lado, z, joelho, ponta) {
  const g = new THREE.Group(); g.position.set(lado * 0.12, -0.05, z);
  const j = new THREE.Vector3(lado * joelho[0], joelho[1], joelho[2]);
  const p = new THREE.Vector3(lado * ponta[0], ponta[1], ponta[2]);
  g.add(tubo(new THREE.Vector3(), j, 0.012, matPerna), tubo(j, p, 0.007, matPerna));
  mosquito.add(g); pernas.push(g);
}
for (const l of [1, -1]) {
  criarPerna(l, -0.13, [0.25, -0.13, -0.08], [0.55, -0.3, -0.3]);
  criarPerna(l, 0, [0.3, -0.16, 0], [0.68, -0.34, 0]);
  criarPerna(l, 0.13, [0.28, -0.12, 0.06], [0.72, -0.3, 0.36]);
}

mosquito.position.set(0, 2, 5);
cena.add(mosquito);

function aplicarEvolucaoVisual() {
  const n = nivelTotal();
  const est = estagioAtual();

  const escalaCorpo = 1 + S.nv.corpo * 0.12;
  torax.scale.set(escalaCorpo, escalaCorpo, escalaCorpo);

  const escalaAsas = 1 + S.nv.asas * 0.18;
  asas.forEach((asa) => asa.scale.set(escalaAsas, escalaAsas, escalaAsas));

  const escalaTromba = 1 + S.nv.tromba * 0.25;
  probóscide.scale.set(1, 1, escalaTromba);
  probóscide.position.z = -(1 * (escalaTromba)) / 5;

  abdomen.scale.set(
    1 + S.nv.estomago * 0.08,
    1 + S.nv.estomago * 0.08,
    1 + S.nv.estomago * 0.12
  );

  matOlho.emissive.setHex(est.cor);
  matAsa.color.setHex(n >= 10 ? 0xcfeaff : n >= 6 ? 0xf0d8ff : 0xd8e9ef);
  matAbd.color.setHex(n >= 10 ? 0x5b241f : n >= 6 ? 0x432035 : 0x3b2025);
}

// ------------------------------------------------------------
// GOTAS DE SANGUE E PARTÍCULAS
// ------------------------------------------------------------
const gotas = [];
const geoGota = new THREE.SphereGeometry(0.2, 16, 12);
const geoHalo = new THREE.SphereGeometry(0.42, 12, 10);

function posicaoAleatoria(alvo) {
  return alvo.set((Math.random() - 0.5) * MUNDO * 1.6, YMIN + 1 + Math.random() * (YMAX - YMIN - 2), (Math.random() - 0.5) * MUNDO * 1.6);
}
function criarGota() {
  const dourada = Math.random() < 0.15;
  const cor = dourada ? 0xffd84d : 0xff1744;
  const g = new THREE.Group();
  g.add(new THREE.Mesh(geoGota, new THREE.MeshStandardMaterial({ color: cor, emissive: cor, emissiveIntensity: 0.9, roughness: 0.2 })));
  g.add(new THREE.Mesh(geoHalo, new THREE.MeshBasicMaterial({ color: cor, transparent: true, opacity: 0.14, depthWrite: false })));
  g.userData = { dourada, fase: Math.random() * 6.28, volta: 0, ativa: true };
  if (dourada) g.scale.setScalar(1.4);
  posicaoAleatoria(g.position);
  cena.add(g); gotas.push(g);
}
for (let i = 0; i < 16; i++) criarGota();

const particulas = [];
const geoPart = new THREE.SphereGeometry(0.03, 6, 6);
function explodir(pos, cor) {
  for (let i = 0; i < 12; i++) {
    const p = new THREE.Mesh(geoPart, new THREE.MeshBasicMaterial({ color: cor, transparent: true }));
    p.position.copy(pos);
    p.userData = { v: new THREE.Vector3((Math.random() - 0.5) * 3, Math.random() * 2.5, (Math.random() - 0.5) * 3), vida: 1 };
    cena.add(p); particulas.push(p);
  }
}

function coletar(g) {
  const u = g.userData;
  combo = comboT > 0 ? Math.min(combo + 1, 5) : 1;
  comboT = comboTempoMax;
  const ganho = valorGota() * (u.dourada ? 5 : 1) * combo;
  S.sangue += ganho;
  explodir(g.position, u.dourada ? 0xffd84d : 0xff1744);
  u.ativa = false; g.visible = false; u.volta = 6;
  toast(`+${ganho} sangue`);
  atualizarHUD();
}

// ------------------------------------------------------------
// EVOLUIR
// ------------------------------------------------------------
function evoluir(k) {
  if (!jogando) return;
  if (S.sangue < custo(k)) { toast("Sangue insuficiente"); return; }
  const antes = estagioAtual();
  S.sangue -= custo(k);
  S.nv[k]++;
  aplicarEvolucaoVisual();
  atualizarHUD();
  salvar();
  const depois = estagioAtual();
  if (depois !== antes) {
    $("evo-txt").textContent = depois.nome;
    retrigger($("evo"), "mostra");
  } else {
    toast(`${{ asas: "Asas", tromba: "Tromba", estomago: "Estômago", corpo: "Corpo" }[k]} nv ${S.nv[k]}`);
  }
}
document.querySelectorAll(".up").forEach((b) => b.addEventListener("click", () => evoluir(b.dataset.up)));

// ------------------------------------------------------------
// CONTROLES E RAYCASTING DE SUPERFÍCIE REAL (360 GRAUS)
// ------------------------------------------------------------
const teclas = {};
let yaw = 0, pitch = 0;
const vel = new THREE.Vector3();

addEventListener("keydown", (e) => {
  const k = e.key.toLowerCase();
  teclas[k] = true;
  if ([" ", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(k)) e.preventDefault();
  if (e.repeat) return;
  if (k === "1") evoluir("asas");
  if (k === "2") evoluir("tromba");
  if (k === "3") evoluir("estomago");
  if (k === "4") evoluir("corpo");
});
addEventListener("keyup", (e) => { teclas[e.key.toLowerCase()] = false; });
addEventListener("blur", () => { for (const k in teclas) teclas[k] = false; });

addEventListener("mousemove", (e) => {
  if (!jogando || !(travado || arrastando)) return;
  yaw -= e.movementX * 0.0025;
  pitch = clamp(pitch - e.movementY * 0.0025, -1.2, 1.2);
});
renderizador.domElement.addEventListener("mousedown", () => {
  if (jogando && !travado) arrastando = true;
});
addEventListener("mouseup", () => { arrastando = false; });

function pausar(titulo) {
  $("menu").hidden = false;
  $("menu").querySelector("h1").textContent = titulo;
  $("btn-jogar").textContent = "Continuar";
}
function iniciar() {
  jogando = true;
  $("menu").hidden = true;
  renderizador.domElement.requestPointerLock?.();
}
$("btn-jogar").addEventListener("click", iniciar);

document.addEventListener("pointerlockchange", () => {
  travado = document.pointerLockElement === renderizador.domElement;
  if (!travado && jogando) { jogando = false; pausar("Pausado"); }
});
document.addEventListener("pointerlockerror", () => { jogando = true; $("menu").hidden = true; });

$("save-info").textContent = nivelTotal() > 0 ? `Progresso salvo: ${estagioAtual().nome}, ${Math.floor(S.sangue)} de sangue.` : "";

const euler = new THREE.Euler(0, 0, 0, "YXZ");
const frente = new THREE.Vector3(), direita = new THREE.Vector3(), alvoVel = new THREE.Vector3(), tmp = new THREE.Vector3();
let t = 0;

const raycaster = new THREE.Raycaster();
const RAIO_CORPO = 0.55;

const direcoesVarredura = [
  new THREE.Vector3(1, 0, 0),
  new THREE.Vector3(-1, 0, 0),
  new THREE.Vector3(0, 1, 0),
  new THREE.Vector3(0, -1, 0),
  new THREE.Vector3(0, 0, 1),
  new THREE.Vector3(0, 0, -1)
];

function resolverColisaoRaycast() {
  const raioFisico = 0.18;

  for (const dir of direcoesVarredura) {
    raycaster.set(mosquito.position, dir);
    raycaster.far = raioFisico;

    const intersecoes = raycaster.intersectObjects(malhasColisao, false);
    if (intersecoes.length > 0) {
      const toque = intersecoes[0];
      const penetracao = raioFisico - toque.distance;
      mosquito.position.addScaledVector(dir, -penetracao);
    }
  }
}

function mover(dt) {
  euler.set(pitch, yaw, 0, "YXZ");

  frente.set(0, 0, -1).applyEuler(euler);
  direita.set(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);

  alvoVel.set(0, 0, 0);

  if (teclas.w || teclas.arrowup) alvoVel.add(frente);
  if (teclas.s || teclas.arrowdown) alvoVel.sub(frente);
  if (teclas.d || teclas.arrowright) alvoVel.add(direita);
  if (teclas.a || teclas.arrowleft) alvoVel.sub(direita);

  if (teclas[" "]) alvoVel.y += 1;
  if (teclas.control) alvoVel.y -= 1;

  if (alvoVel.lengthSq() > 0) alvoVel.normalize();

  const correndo = teclas.shift && stamina > 5 && alvoVel.lengthSq() > 0;

  const staminaMaxima = 100 + S.nv.corpo * 15;
  const taxaRegen = 25 + S.nv.corpo * 4; 
  const taxaGasto = 35;

  stamina = clamp(stamina + (correndo ? -taxaGasto : taxaRegen) * dt, 0, staminaMaxima);
  
  $("stamina").style.width = (stamina / staminaMaxima) * 100 + "%";
  $("stamina").classList.toggle("baixa", stamina < (staminaMaxima * 0.25));

  alvoVel.multiplyScalar(velMax() * (correndo ? 2 : 1));

  vel.lerp(alvoVel, Math.min(1, (alvoVel.lengthSq() > 0 ? 10 : 6) * dt));

  mosquito.position.addScaledVector(vel, dt);
  resolverColisaoRaycast();

  mosquito.rotation.order = "YXZ";
  mosquito.rotation.y = yaw;

  const pitchDesejado = clamp(pitch * 0.6, -0.65, 0.65);
  mosquito.rotation.x += (pitchDesejado - mosquito.rotation.x) * Math.min(1, 8 * dt);

  const rollDesejado = correndo ? -0.18 : 0;
  mosquito.rotation.z += (rollDesejado - mosquito.rotation.z) * Math.min(1, 5 * dt);
}

function animarCorpo(dt, ativo) {
  const freq = 40 + nivelTotal() * 1.5;
  const bater = Math.sin(t * freq) * (ativo ? 0.7 : 0.35);
  asas[0].rotation.z = bater; asas[1].rotation.z = -bater;
  pernas.forEach((p, i) => { p.rotation.z = Math.sin(t * 7 + i) * 0.08 * (i % 2 ? -1 : 1); });
  abdomen.scale.y = 1 + Math.sin(t * 4) * 0.02;
  if (!ativo) mosquito.position.y += Math.sin(t * 2) * 0.002;
}

function camera3p(dt) {
  tmp.set(0, 0.9, 4);
  tmp.applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
  tmp.add(mosquito.position);

  camera.position.lerp(tmp, 1 - Math.exp(-8 * dt));

  const direcaoOlhar = new THREE.Vector3(0, 0, -1);
  direcaoOlhar.applyEuler(euler.set(pitch * 0.6, yaw, 0, "YXZ"));

  const alvo = mosquito.position.clone();
  alvo.addScaledVector(direcaoOlhar, 8);

  camera.lookAt(alvo);
}

function atualizarMundo(dt) {
  // Gestão da barra de combo e decaimento por tempo
  if (comboT > 0) {
    comboT -= dt;
    if (comboT <= 0) combo = 0;
  }

  // Atualiza a interface da barra de combo visual com verificação de segurança
  const containerCombo = $("combo-container");
  if (containerCombo) {
    containerCombo.hidden = combo < 2; // Exibe a partir do x2
    
    const comboNEl = $("combo-n");
    if (comboNEl) comboNEl.textContent = combo;

    const multEl = $("combo-multiplicador");
    if (multEl) multEl.textContent = "x" + combo;

    const fillEl = $("combo-barra-fill");
    if (fillEl) {
      const porcentagem = Math.max(0, (comboT / comboTempoMax) * 100);
      fillEl.style.width = porcentagem + "%";
    }
  }

  const raio = raioColeta();
  for (const g of gotas) {
    const u = g.userData;
    if (!u.ativa) {
      u.volta -= dt;
      if (u.volta <= 0) { posicaoAleatoria(g.position); g.visible = true; u.ativa = true; }
      continue;
    }
    u.fase += dt;
    g.children[0].position.y = Math.sin(u.fase * 2) * 0.08;
    g.children[1].scale.setScalar(1 + Math.sin(u.fase * 3) * 0.12);
    if (g.position.distanceTo(mosquito.position) < raio) coletar(g);
  }

  for (let i = particulas.length - 1; i >= 0; i--) {
    const p = particulas[i], u = p.userData;
    u.v.y -= 4 * dt; p.position.addScaledVector(u.v, dt);
    u.vida -= dt * 1.4; p.scale.setScalar(Math.max(u.vida, 0.01)); p.material.opacity = u.vida;
    if (u.vida <= 0) { cena.remove(p); p.material.dispose(); particulas.splice(i, 1); }
  }
}

const relogio = new THREE.Clock();
function laco() {
  requestAnimationFrame(laco);
  const dt = Math.min(relogio.getDelta(), 0.05);
  t += dt;
  if (jogando) { mover(dt); atualizarMundo(dt); }
  animarCorpo(dt, jogando);
  camera3p(dt);
  renderizador.render(cena, camera);
}

addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderizador.setSize(innerWidth, innerHeight);
});

// ------------------------------------------------------------
// INÍCIO
// ------------------------------------------------------------
aplicarEvolucaoVisual();
atualizarHUD();
laco();