"use strict";
// ============================================================
// MOSQUITO EVOLUTION — arquitetura modular (Three.js r128)
// GameManager · PlayerController · WorldManager · AudioSystem · UIManager
// Tudo encapsulado: nenhuma variável global além do próprio escopo da IIFE.
// ============================================================
(() => {

const CFG = {
  MX: 118, MZ: 100, PX: 118, PZ: 100, MN: 105, MS: 108, YMIN: -3.5, YMAX: 12, SAVE: "mosquito-evolucao-v1", CRESCE: 1.3, COMBO_T: 4,
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
    { min: 100, nome: "Pesadelo crepuscular",     cor: 0x111122 },
    { min: 110, nome: "Lorde da praga estelar",   cor: 0x00ffcc },
    { min: 120, nome: "Soberano do sangue eterno", cor: 0xff0000 },
  ],
  // EASTER EGGS: cada um desbloqueia uma skin (K troca, H mostra dicas)
  SKINS: {
    pixel:      { nome: "Mosquito 8-bit Voxel",     corpo: 0xffffff, abd: 0xffffff, brilho: 0x33ff66, ei: 0, pixel: true, dica: "Um código clássico de videogame: ↑ ↑ ↓ ↓ ← → ← → B A" },
    dengue:     { nome: "Aedes aegypti",      corpo: 0x121212, abd: 0x121212, perna: 0x121212, brilho: 0xffffff, ei: 0, listras: true, dica: "Digite o nome da doença mais famosa que o mosquito transmite" },
    relojoeiro: { nome: "Relojoeiro dourado", corpo: 0xffd84d, abd: 0xc9a227, brilho: 0xffaa00, ei: 0.35, metal: true, dica: "O tempo voa... encoste no relógio da aula de Biologia" },
    radioativo: { nome: "Radioativo",         corpo: 0x1a3a1a, abd: 0x39ff14, brilho: 0x39ff14, ei: 0.9, asa: 0xb6ffb0, dica: "Pouse 1 s em cima do galão radioativo do laboratório" },
    jogador:    { nome: "Craque da quadra",   corpo: 0xff7a1a, abd: 0x1a1a1a, brilho: 0xff7a1a, ei: 0.3,  dica: "Faça uma cesta: atravesse um aro do ginásio de cima para baixo" },
    fantasma:   { nome: "Fantasma", corpo: 0xdff4ff, abd: 0xbfe6ff, brilho: 0x88ccff, ei: 0.6, alfa: 0.35, asa: 0xffffff, dica: "Encare seu reflexo no espelho do banheiro" },
    vampiro:    { nome: "Conde Drácula",      corpo: 0x14000a, abd: 0x8b0000, brilho: 0xff0033, ei: 0.7,  dica: "Pique 10 humanos" },
    mosquito:   { nome: "Mosquitão da rua",   corpo: 0x5a7a22, abd: 0x42591a, perna: 0x2b3416, brilho: 0xb8ff4d, asa: 0xcfe98c, ei: 0.35, rua: true, dica: "Encare o Mosquitão da rua: a estátua sobre o palco do auditório" },
    carreta:    { nome: "Caminhão de som",    corpo: 0x15151f, abd: 0x1b1b2b, perna: 0x0a0a12, brilho: 0xff44cc, ei: 1.0, asa: 0xffd9f5, rig: true, dica: "Fique parado 3 s diante do telão do auditório (a moldura muda de cor)" },
    eletrizado: { nome: "Eletrizado",         corpo: 0x1a2030, abd: 0x24304a, perna: 0x0e1220, brilho: 0x4fd0ff, ei: 0.8, asa: 0xcfefff, metal: true, raios: true, fumaca: true, dica: "No laboratório há uma tomada ligada ao projeto de eletricidade. Encoste nela" },
    pintado:    { nome: "Meio pintado",       corpo: 0x1c1c22, abd: 0x2a1a20, perna: 0x0b0b0e, brilho: 0xd01020, ei: 0.15, meia: 0xd01020, goticulas: true, dica: "Na sala de artes alguém derrubou tinta vermelha. Encoste na poça" },
    extintor:   { nome: "Bombeiro",           corpo: 0x111111, abd: 0xc0182a, perna: 0x0b0b0b, brilho: 0xff2a2a, ei: 0.3, asa: 0xffd0d0, faixas: true, espuma: true, dica: "Encoste em um extintor de incêndio (há um escondido na cozinha da cantina)" },
    cadeado:    { nome: "Mosquito Cadeado", corpo: 0x3c424e, abd: 0x2c313b, perna: 0x181b21, brilho: 0xffc933, ei: 0.2, metal: true, asa: 0xcfd6e2, cadeado: true, dica: "Há um armário trancado e amassado no corredor, entre as salas 1 e 2. Segure F perto dele para arrombar" },
    tusk:       { nome: "Tusk", corpo: 0xf59ab8, abd: 0xef7fa6, perna: 0xc2527f, brilho: 0xff8ac0, ei: 0.18, tusk: true, dica: "Há 4 partes de um louva-a-deus espalhadas pela escola (brilho verde). Cada uma evolui o Tusk de Ato, como o stand do JoJo" },
    mosquito8000: { nome: "Mosquito 8000", corpo: 0x8f9bb0, abd: 0x6c7890, perna: 0x3b4252, brilho: 0x00e5ff, ei: 0.9, metal: true, asa: 0x9be9ff, robo: true, dica: "O quadro de matemática da Sala 1 aceita respostas (tecla Q). A certa dá conquista... mas e se você pensar bem maior?" },
    encadernado: { nome: "Mosquito Encadernado", corpo: 0x29365d, abd: 0x63528a, perna: 0x282646, brilho: 0xffd28b, olho: 0xf0d59d, asa: 0xffe9bf, ei: 0.12, livro: true, dica: "Alguém esqueceu um livro em uma mesa da cantina. Leve-o à estante marcada da biblioteca (tecla B)." },
  },
  // CONQUISTAS: cat = categoria · r = raridade (b/p/o) · premio = sangue · secreto = escondida até ser obtida
  RAR: { b: { nome: "Bronze", cor: "#cd7f32", pts: 10 }, p: { nome: "Prata", cor: "#c4ccdc", pts: 25 }, o: { nome: "Ouro", cor: "#ffd84d", pts: 50 } },
  TUSK: [   // o Tusk evolui a cada parte do louva-a-deus encontrada (Ato 1 a 4): visual e atributos
    { nome: "Ato 1", visual: { corpo: 0xf59ab8, abd: 0xef7fa6, perna: 0xc2527f, brilho: 0xff8ac0, ei: 0.18, asa: 0xffc8dc, olho: 0x8a4fd0 }, attr: { colhe: 1.1 } },
    { nome: "Ato 2", visual: { corpo: 0xf07cad, abd: 0xd95b90, perna: 0x9a4f9a, brilho: 0xff6fb0, ei: 0.2, asa: 0xffc8dc }, attr: { colhe: 1.25, sangue: 1.1 } },
    { nome: "Ato 3", visual: { corpo: 0xf28ab6, abd: 0x2a3580, perna: 0xc8d0dc, brilho: 0xff80b8, ei: 0.2, asa: 0xffc8dc }, attr: { colhe: 1.4, sangue: 1.2, vel: 1.1 } },
    { nome: "Ato 4", visual: { corpo: 0xf4a0c4, abd: 0xf08ab4, perna: 0xf4a0c4, brilho: 0xffd24a, ei: 0.25, asa: 0xfff0b0 }, attr: { colhe: 1.6, sangue: 1.4, vel: 1.2, def: 0.1, cura: 8 } },
  ],
  CONQ: [
    { id: "primeiro", nome: "Primeiro voo", ico: "🦟", desc: "Comece uma partida", cat: "Progresso", r: "b", premio: 20 },
    { id: "sangue500", nome: "Meio litro", ico: "🩸", desc: "Acumule 500 de sangue", cat: "Progresso", r: "b", premio: 50 },
    { id: "sangue5000", nome: "Banco de sangue", ico: "🧛", desc: "Acumule 5.000 de sangue", cat: "Progresso", r: "p", premio: 250 },
    { id: "nivel10", nome: "Crescendo", ico: "🌱", desc: "Chegue ao nível 10", cat: "Progresso", r: "b", premio: 60 },
    { id: "nivel40", nome: "Evoluído", ico: "🧬", desc: "Chegue ao nível 40", cat: "Progresso", r: "p", premio: 300 },
    { id: "asas10", nome: "Asas de anjo", ico: "🪽", desc: "Asas no nível 10", cat: "Progresso", r: "p", premio: 150 },
    { id: "tromba10", nome: "Lança viva", ico: "💉", desc: "Tromba no nível 10", cat: "Progresso", r: "p", premio: 150 },
    { id: "estomago10", nome: "Barriga de chope", ico: "🍺", desc: "Estômago no nível 10", cat: "Progresso", r: "p", premio: 150 },
    { id: "corpo10", nome: "Tanque de guerra", ico: "🛡️", desc: "Corpo no nível 10", cat: "Progresso", r: "p", premio: 150 },
    { id: "picada1", nome: "Primeira picada", ico: "💉", desc: "Pique um humano (tecla E)", cat: "Combate", r: "b", premio: 40 },
    { id: "picada25", nome: "Pesadelo da escola", ico: "😈", desc: "Pique 25 vezes", cat: "Combate", r: "p", premio: 200 },
    { id: "picada100", nome: "Flagelo", ico: "☠️", desc: "Pique 100 vezes", cat: "Combate", r: "o", premio: 800 },
    { id: "tapas", nome: "Casca grossa", ico: "👋", desc: "Leve 5 tapas", cat: "Combate", r: "b", premio: 60 },
    { id: "combo5", nome: "Combo máximo", ico: "🔥", desc: "Chegue ao combo ×5", cat: "Combate", r: "p", premio: 150 },
    { id: "dourada", nome: "Toque de Midas", ico: "✨", desc: "Colete uma gota dourada", cat: "Combate", r: "b", premio: 40 },
    { id: "gas3", nome: "Pulmão de aço", ico: "☣️", desc: "Atravesse 3 nuvens de inseticida", cat: "Combate", r: "b", premio: 80 },
    { id: "sobreviver", nome: "Sobrevivente", ico: "⏱️", desc: "Fique 3 minutos sem morrer", cat: "Combate", r: "p", premio: 200 },
    { id: "enfermaria", nome: "Dodói", ico: "🩹", desc: "Visite a enfermaria", cat: "Exploração", r: "b", premio: 30 },
    { id: "auditorio", nome: "Plateia", ico: "🎭", desc: "Visite o auditório", cat: "Exploração", r: "b", premio: 30 },
    { id: "artes", nome: "Alma de artista", ico: "🎨", desc: "Visite a sala de artes", cat: "Exploração", r: "b", premio: 30 },
    { id: "biblioteca", nome: "Rato de biblioteca", ico: "📚", desc: "Visite a biblioteca", cat: "Exploração", r: "b", premio: 30 },
    { id: "laboratorio", nome: "Cientista maluco", ico: "🧪", desc: "Visite o laboratório", cat: "Exploração", r: "b", premio: 30 },
    { id: "explorador", nome: "Explorador", ico: "🧭", desc: "Visite todas as salas da escola", cat: "Exploração", r: "p", premio: 250 },
    { id: "turista", nome: "Turista", ico: "🗺️", desc: "Faça o tour da escola (tecla =)", cat: "Exploração", r: "b", premio: 30 },
    { id: "carteira", nome: "Bom cidadão", ico: "🎒", desc: "Devolva uma carteira perdida (tecla B)", cat: "Exploração", r: "b", premio: 60 },
    { id: "livro_devolvido", nome: "Página Recuperada", ico: "📚", desc: "Ache o livro na cantina e devolva-o à estante da biblioteca (tecla B)", cat: "Exploração", r: "p", premio: 140 },
    { id: "fala", nome: "Bom ouvinte", ico: "💬", desc: "Escute o Mosquitão da rua", cat: "Exploração", r: "b", premio: 40 },
    { id: "matematica", nome: "Nota dez", ico: "📝", desc: "Responda a pergunta do quadro de matemática (tecla Q)", cat: "Exploração", r: "b", premio: 50 },
    { id: "mantis_cabeca", nome: "Mente Predadora", ico: "🧠", desc: "Encontre a cabeça do louva-a-deus", cat: "Segredos", r: "b", premio: 100 },
    { id: "mantis_foices", nome: "Garras Mortais", ico: "⚔️", desc: "Encontre as foices dianteiras do louva-a-deus", cat: "Segredos", r: "b", premio: 100 },
    { id: "mantis_torax", nome: "Asas do Caçador", ico: "🪽", desc: "Encontre o tórax e as asas do louva-a-deus", cat: "Segredos", r: "p", premio: 150 },
    { id: "mantis_abdomen", nome: "Corpo de Combate", ico: "🦗", desc: "Encontre o abdômen e as patas do louva-a-deus", cat: "Segredos", r: "p", premio: 150 },
    { id: "mantis", nome: "Entomólogo", ico: "🦗", desc: "Reúna as 4 partes do louva-a-deus (Tusk no Ato 4)", cat: "Segredos", r: "o", premio: 600 },
    { id: "poder1", nome: "Poder liberado", ico: "✨", desc: "Use uma habilidade especial (tecla R)", cat: "Combate", r: "b", premio: 40 },
    { id: "poderes", nome: "Arsenal completo", ico: "🧰", desc: "Use a habilidade de todas as skins (inclusive a de quem está sem skin)", cat: "Segredos", r: "o", premio: 800 },
    { id: "colecionador", nome: "Colecionador", ico: "🎨", desc: "Desbloqueie 5 skins", cat: "Segredos", r: "p", premio: 250 },
    { id: "todas", nome: "Guarda-roupa completo", ico: "👗", desc: "Desbloqueie todas as skins", cat: "Segredos", r: "o", premio: 1200 },
    { id: "dez", nome: "Caçador de conquistas", ico: "🥇", desc: "Conquiste 10 medalhas", cat: "Segredos", r: "p", premio: 200 },
  ],
  HUMANOS: [   // [nome, x1, z1, x2, z2, altura extra] — andam em linha reta entre os dois pontos, sempre por corredores livres
    ["a professora de Matemática", -56, -85, -42, -85],
    ["o professor de Biologia",    -14, -85,   0, -85],
    ["a professora de Artes",     -110, -52, -78, -52],
    ["um aluno no corredor",      -110,   2,  110,   2],
    ["uma aluna no corredor",       60,  -2,  -60,  -2],
    ["a bibliotecária",             23, -92,   23, -20],
    ["o técnico do laboratório",    46, -74,   62, -74],
    ["a merendeira",               -90,  93,  -42,  93],
    ["um aluno comendo",           -43.5, 80, -43.5, 16],
    ["o jogador de basquete",        5,  22,   30,  34],
    ["a enfermeira",                94, -92,   94, -20],
    ["o diretor no palco",          80,  92,  108,  92, 2],
    ["uma aluna no auditório",      94,  14,   94,  80],
    ["o zelador do corredor",      110,  -1,   62,  -1],
  ],
  // SALAS: [nome, x0, x1, z0, z1] — usadas em "salas visitadas" e na conquista Explorador
  SALAS: [["Corredor", -118, 118, -8, 8], ["Artes", -118, -70, -100, -8], ["Sala 1", -70, -28, -100, -8], ["Sala 2", -28, 14, -100, -8], ["Biblioteca", 14, 42, -100, -8], ["Laboratório", 42, 71, -100, -8],
    ["Enfermaria", 71, 118, -100, -8], ["Cantina", -118, -10, 8, 100], ["Ginásio", -10, 45, 8, 100], ["Banheiro", 45, 71, 8, 100], ["Auditório", 71, 118, 8, 100]],
  UP_MAX: 30,
  UPS: { asas: { base: 12, nome: "Asas" }, tromba: { base: 15, nome: "Tromba" }, estomago: { base: 20, nome: "Estômago" }, corpo: { base: 18, nome: "Corpo" } },
};
// Atributos de cada skin (multiplicadores; def = redução de dano; gas = dano de gás/poças; cura = vida por picada)
const ATRIB = {
  pixel: { vel: 1.08 }, 
  dengue: { sangue: 1.15, stam: 1.1 }, 
  relojoeiro: { combo: 1.5 }, 
  radioativo: { gas: 0.2, def: 0.1 }, 
  jogador: { vel: 1.1, stam: 1.3 },
  fantasma: { intang: true, gas: 0, vida: -30 }, 
  vampiro: { sangue: 1.25, cura: 15, vida: -20 }, 
  mosquito: { vida: 40, def: 0.15 }, 
  carreta: { combo: 1.4, stam: 1.25 },
  eletrizado: { vel: 1.12, def: 0.2 }, 
  pintado: { sangue: 1.2, vel: 0.95 }, 
  extintor: { gas: 0.4, def: 0.2 }, 
  cadeado: { def: 0.35, vida: 30, vel: 0.92 },
  tusk: CFG.TUSK[0].attr, 
  mosquito8000: { vel: 1.3, stam: 1.5, colhe: 1.2 },
  encadernado: { stam: 1.12, colhe: 1.10 },
};
for (const id in ATRIB) CFG.SKINS[id].attr = ATRIB[id];
const descAttr = (a = {}) => {   // texto dos atributos para o menu de skins
  const p = (v) => (v >= 1 ? "+" : "") + Math.round((v - 1) * 100) + "%", o = [];
  if (a.vel && a.vel !== 1) o.push(`⚡ ${p(a.vel)} velocidade`);
  if (a.colhe && a.colhe !== 1) o.push(`🧲 ${p(a.colhe)} alcance de coleta`);
  if (a.sangue && a.sangue !== 1) o.push(`🩸 ${p(a.sangue)} sangue`);
  if (a.stam && a.stam !== 1) o.push(`🔋 ${p(a.stam)} stamina`);
  if (a.combo && a.combo !== 1) o.push(`🔥 ${p(a.combo)} duração do combo`);
  if (a.def) o.push(`🛡️ −${Math.round(a.def * 100)}% de dano recebido`);
  if (a.vida) o.push(`❤️ ${a.vida > 0 ? "+" : ""}${a.vida} de vida`);
  if (a.gas !== undefined && a.gas !== 1) o.push(a.gas === 0 ? "☣️ imune a gás e poças" : `☣️ −${Math.round((1 - a.gas) * 100)}% dano de gás e poças`);
  if (a.cura) o.push(`💉 +${a.cura} de vida a cada picada`);
  if (a.intang) o.push("👻 intangível: atravessa paredes e móveis, imune a tapas");
  return o;
};
for (const id of Object.keys(CFG.SKINS)) CFG.CONQ.push({ id: "skin_" + id, nome: CFG.SKINS[id].nome, ico: "🥚", desc: "Desbloqueie a skin " + CFG.SKINS[id].nome, cat: "Segredos", r: "p", premio: 120, secreto: true });
{   // uma conquista para cada estágio de evolução (raridade e prêmio crescem com o estágio)
  const ICO = ["🦟", "🦟", "🌙", "🦇", "🧪", "🌿", "🌃", "👑", "👁️", "✨", "🌑", "🌌", "👑"];
  const lista = CFG.ESTAGIOS.map((e, i) => i && ({ id: "fase" + e.min, nome: e.nome, ico: ICO[i] || "🧬", desc: `Alcance o nível ${e.min} (${e.nome})`, cat: "Progresso",
    r: i <= 3 ? "b" : i <= 8 ? "p" : "o", premio: Math.round(30 * Math.pow(1.35, i)) })).filter(Boolean);
  CFG.CONQ.splice(CFG.CONQ.findIndex((c) => c.id === "corpo10") + 1, 0, ...lista);
}
const SKIN_ICO = { pixel: "👾", dengue: "🦟", relojoeiro: "⏳", radioativo: "☢️", jogador: "🏀", fantasma: "👻", vampiro: "🧛", mosquito: "🪰", carreta: "🔊", eletrizado: "⚡", pintado: "🎨", extintor: "🧯", cadeado: "🔒", tusk: "🦗", mosquito8000: "🤖", encadernado: "📖" };

// ---- Habilidades especiais (tecla R): cada skin tem a sua; "padrao" vale para quem está sem skin. usar(g) recebe o GameManager e pode devolver false para cancelar a recarga ----
const HABS = {
  padrao:     { nome: "Impulso", ico: "💨", cd: 6, dur: 0, desc: "Dispara um impulso veloz para a frente.", usar(g) { g.jogador.vel.addScaledVector(g.jogador.frente, 26); g.mundo.emitir(g.jogador.pos, 0xffffff, 16, 4, "espuma"); } },
  pixel:      { nome: "Glitch", ico: "👾", cd: 6, dur: 0, desc: "Teletransporta 14 unidades para a frente, parando antes das paredes.", usar(g) { const j = g.jogador; g.mundo.emitir(j.pos, 0x33ff66, 20, 5); for (let i = 0; i < 14; i++) { j.pos.addScaledVector(j.frente, 1); g.mundo.resolver(j.pos, 0.18); } g.mundo.emitir(j.pos, 0x33ff66, 20, 5); } },
  dengue:     { nome: "Surto", ico: "🦟", cd: 22, dur: 8, desc: "Por 8 s todo sangue (gotas e picadas) vale em dobro.", usar(g) { g.buff.sangue = 8; g.ui.flash("rgba(255,60,60,.4)"); } },
  relojoeiro: { nome: "Tempo Parado", ico: "⏳", cd: 25, dur: 5, desc: "Por 5 s humanos e nuvens de gás quase congelam.", usar(g) { g.buff.tempo = 5; g.ui.flash("rgba(255,216,77,.55)"); } },
  radioativo: { nome: "Aura Radioativa", ico: "☢️", cd: 20, dur: 8, desc: "Por 8 s nenhum humano consegue te dar tapa.", usar(g) { g.buff.radio = 8; g.mundo.emitir(g.jogador.pos, 0x39ff14, 30, 6); } },
  jogador:    { nome: "Arrancada", ico: "🏀", cd: 14, dur: 4, desc: "Por 4 s velocidade +70% e stamina infinita.", usar(g) { g.buff.vel = 4; g.buff.stamInf = 4; } },
  fantasma:   { nome: "Invisibilidade", ico: "👻", cd: 18, dur: 6, desc: "Por 6 s os humanos não te veem: picar não os irrita.", usar(g) { g.buff.invis = 6; } },
  vampiro:    { nome: "Frenesi", ico: "🧛", cd: 28, dur: 8, desc: "Por 8 s: sangue em dobro e +30 de vida por picada. Um humano pode levar a segunda picada após 3 s, mas apenas uma repetição por Frenesi.", usar(g) {
    g.finalizarFrenesi();
    g.alvosFrenesi = new Map(); // por humano: contador de picadas feitas na ativação
    // Quem já foi picado antes da ativação também recebe a chance da segunda picada,
    // respeitando 3 segundos desde a última picada (nunca imediatamente).
    for (const h of g.mundo.humanos) {
      if (h.pronto > 0 && Number.isFinite(h.ultimaPicada)) {
        g.alvosFrenesi.set(h, { qtd: 1, ultima: h.ultimaPicada });
        h.pronto = Math.min(h.pronto, Math.max(0, 3 - (g.t - h.ultimaPicada)));
      }
    }
    g.buff.frenesi = 8;
    g.ui.flash("rgba(200,0,40,.5)");
  } },
  mosquito:   { nome: "Chamado do Enxame", ico: "🪰", cd: 30, dur: 0, desc: "Faz surgir 12 gotas de sangue ao seu redor.", usar(g) { g.mundo.gotasPerto(g.jogador.pos, 12); } },
  carreta:    { nome: "Grave Ensurdecedor", ico: "🔊", cd: 20, dur: 6, desc: "Humanos num raio de 22 dançam por 6 s (sem tapas) e rendem +50% por picada.", usar(g) { g.atordoar(22, 6); g.audio.tom(70, 30, 0.7, "sawtooth", 0.5); g.jogador.shake = 1; g.mundo.emitir(g.jogador.pos, 0xff44cc, 30, 7); } },
  eletrizado: { nome: "Descarga", ico: "⚡", cd: 18, dur: 0, desc: "Coleta na hora as gotas num raio de 14 e paralisa humanos próximos por 4 s.", usar(g) { g.mundo.coletarRaio(g.jogador.pos, 14, g); g.atordoar(10, 4); g.ui.flash("rgba(120,200,255,.6)"); g.mundo.emitir(g.jogador.pos, 0x9fe0ff, 40, 8); } },
  pintado:    { nome: "Poça de Cura", ico: "🎨", cd: 24, dur: 8, desc: "Cria uma poça de tinta que cura 12 de vida por segundo e recarrega a stamina por 8 s.", usar(g) { g.zona = { x: g.jogador.pos.x, z: g.jogador.pos.z, r: 5, t: 8 }; } },
  extintor:   { nome: "Extinção", ico: "🧯", cd: 22, dur: 8, desc: "Apaga as nuvens de gás num raio de 22, dá imunidade a gás e poças por 8 s e assusta humanos próximos por 3 s.", usar(g) { g.mundo.apagarGas(g.jogador.pos, 22); g.buff.gas = 8; g.atordoar(8, 3); g.mundo.emitir(g.jogador.pos, 0xffffff, 40, 7, "espuma"); } },
  cadeado:    { nome: "Cadeado Fechado", ico: "🔒", cd: 20, dur: 5, desc: "Por 5 s você é invulnerável, mas anda 55% mais devagar.", usar(g) { g.jogador.escudo = 5; g.buff.pesado = 5; } },
  tusk:       { nome: "Rajada de Unhas", ico: "🦗", cd: 10, dur: 0, desc: "Dispara unhas douradas que picam humanos à distância sem irritá-los. Ato 1: 1 alvo, Ato 2: 2, Ato 3: 3, Ato 4: todos no raio de 25 (e a recarga cai de 10 para 4 s).", usar(g) { return g.rajadaTusk(); } },
  mosquito8000: { nome: "Scanner 8000", ico: "🤖", cd: 22, dur: 10, desc: "Por 10 s o alcance de coleta fica 2,5x maior e as gotas ficam realçadas.", usar(g) { g.buff.scan = 10; } },
  encadernado: { nome: "Páginas Vivas", ico: "📖", cd: 24, dur: 0, desc: "Enfeitiça os humanos num raio de 14 por 5 s e recupera 35 de stamina.", usar(g) {
    g.atordoar(14, 5);
    g.jogador.stamina = Math.min(g.estado.staminaMax, g.jogador.stamina + 35);
    return true;
  } },
};
const $ = (id) => document.getElementById(id);
const { clamp } = THREE.MathUtils;
const amort = (k, dt) => 1 - Math.exp(-k * dt);   // amortecimento independente de FPS
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const CONTROLES_KEY = "mosquito-evolution-controles-v1";
function lerControles() {
  try {
    const modo = localStorage.getItem(CONTROLES_KEY);
    if (modo === "mobile" || modo === "desktop") return modo;
  } catch (_) { /* armazenamento indisponível: detectar o dispositivo */ }
  return matchMedia("(pointer: coarse)").matches || navigator.maxTouchPoints > 0 ? "mobile" : "desktop";
}
const GRAF_KEY = 'mosquito-evolution-graficos-v1';
const GRAFICOS = Object.freeze({
  leve: { nome: 'Desempenho', resolucao: 0.7, particulas: 0.35, maxParticulas: 80, alcanceDecor: 34, distancia: 135, fps: 30, aneis: 1 },
  medio: { nome: 'Equilibrado', resolucao: 1, particulas: 0.7, maxParticulas: 160, alcanceDecor: 75, distancia: 230, fps: 60, aneis: 2 },
  alto: { nome: 'Qualidade', resolucao: 1.7, particulas: 1, maxParticulas: 260, alcanceDecor: Infinity, distancia: 500, fps: 0, aneis: 2 },
  ultra: { nome: 'Ultra · shaders V11', resolucao: 1.65, particulas: 1.2, maxParticulas: 330, alcanceDecor: Infinity, distancia: 500, fps: 0, aneis: 3 }
});
function lerGraficos() {
  try { const modo = localStorage.getItem(GRAF_KEY); return GRAFICOS[modo] ? modo : (lerControles() === 'mobile' ? 'leve' : 'medio'); }
  catch (_) { return lerControles() === 'mobile' ? 'leve' : 'medio'; }
}
const COR_PIXEL_PADRAO = "#8d86fc";  // cor original, preservada ao escolher "Original"
const corPixelValida = (valor) => typeof valor === "string" && /^#[0-9a-fA-F]{6}$/.test(valor);
const COR_PIXEL_OPCOES = [
  ["Original", "#8d86fc"], ["Vermelho", "#ff464f"], ["Azul", "#378dff"],
  ["Verde", "#38df79"], ["Rosa", "#ff64c4"], ["Amarelo", "#ffda40"],
  ["Laranja", "#ff9035"], ["Preto", "#333345"], ["Branco", "#eaf4ff"]
];

// ------------------------------------------------------------
// ESTADO + PERSISTÊNCIA
// ------------------------------------------------------------
class GameState {
  constructor() {
    this.sangue = 0;
    this.nv = { asas: 0, tromba: 0, estomago: 0, corpo: 0 };
    this.skins = []; this.skin = null; this.picadas = 0; this.auraTusk = true; this.pixelCor = COR_PIXEL_PADRAO;
    this.conq = []; this.salas = []; this.carteiras = 0; this.livroDevolvido = false; this.mantis = []; this.habs = [];
    try {
      const s = JSON.parse(localStorage.getItem(CFG.SAVE));
      if (s && s.nv) { this.sangue = +s.sangue || 0; for (const k in this.nv) this.nv[k] = clamp(Math.floor(Number(s.nv[k]) || 0), 0, CFG.UP_MAX); }
      if (s) { this.auraTusk = s.auraTusk !== false; this.pixelCor = corPixelValida(s.pixelCor) ? s.pixelCor.toLowerCase() : COR_PIXEL_PADRAO; const mig = (k) => (k === "arcoiris" ? "pixel" : k); this.skins = Array.isArray(s.skins) ? s.skins.map(mig).filter((k) => CFG.SKINS[k]) : []; this.skin = CFG.SKINS[mig(s.skin)] ? mig(s.skin) : null; this.picadas = +s.picadas || 0; this.conq = Array.isArray(s.conq) ? s.conq.filter((id) => CFG.CONQ.some((c) => c.id === id)) : []; this.salas = Array.isArray(s.salas) ? s.salas : []; this.carteiras = +s.carteiras || 0; this.livroDevolvido = s.livroDevolvido === true; this.habs = Array.isArray(s.habs) ? s.habs : []; this.mantis = Array.isArray(s.mantis) ? s.mantis.filter((i) => ["cabeca", "foices", "torax", "abdomen"].includes(i)) : []; }
    } catch (e) { /* sem save */ }
  }
  salvar() { try { localStorage.setItem(CFG.SAVE, JSON.stringify({ sangue: this.sangue, nv: this.nv, skins: this.skins, skin: this.skin, picadas: this.picadas, conq: this.conq, salas: this.salas, carteiras: this.carteiras, livroDevolvido: this.livroDevolvido, mantis: this.mantis, habs: this.habs, auraTusk: this.auraTusk, pixelCor: this.pixelCor })); } catch (e) {} }
  get total() { return this.nv.asas + this.nv.tromba + this.nv.estomago + this.nv.corpo; }
  get estagio() { let e = CFG.ESTAGIOS[0]; for (const x of CFG.ESTAGIOS) if (this.total >= x.min) e = x; return e; }
  custo(k) { return this.nv[k] >= CFG.UP_MAX ? Infinity : Math.floor(CFG.UPS[k].base * Math.pow(CFG.CRESCE, this.nv[k])); }
  get attr() {   // atributos da skin equipada (o Tusk muda a cada Ato); guardado em cache
    const k = this.skin + "|" + this.mantis.length; if (this._ak === k) return this._a;
    const sk = this.skin && CFG.SKINS[this.skin], extra = sk && (sk.tusk ? CFG.TUSK[Math.max(0, this.mantis.length - 1)].attr : sk.attr);
    this._ak = k; return (this._a = { vel: 1, colhe: 1, sangue: 1, stam: 1, combo: 1, def: 0, vida: 0, gas: 1, cura: 0, intang: false, ...(extra || {}) });
  }
  get velMax() { return (4 + this.nv.asas * 0.5) * this.attr.vel; }
  get raioColeta() { return (0.9 + this.nv.tromba * 0.15) * this.attr.colhe; }
  get valorGota() { return (1 + this.nv.estomago * 2) * this.attr.sangue; }
  get staminaMax() { return (100 + this.nv.corpo * 15) * this.attr.stam; }
  get regenStamina() { return 25 + this.nv.corpo * 4; }
  get vidaMax() { return Math.max(40, 100 + this.nv.corpo * 12 + this.attr.vida); }
}

// ------------------------------------------------------------
// ÁUDIO PROCEDURAL (Web Audio API, sem arquivos)
// ------------------------------------------------------------
class AudioSystem {
  constructor() {
    this.ctx = null; this.mudo = false;
    // Música exclusiva da skin "Caminhão de som": coloque o arquivo em sound/e_sexta.mp3
    this.musica = null; this.musicaOk = true; this.pedido = false; this.proxBatida = 0; this.passo = 0;
    try {
      this.musica = new Audio("sound/e_sexta.mp3"); this.musica.loop = true; this.musica.volume = 0.5;
      this.musica.addEventListener("error", () => { this.musicaOk = false; });   // sem o arquivo, entra o funk sintetizado
    } catch (e) { this.musicaOk = false; }
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
  alternarMudo() { this.mudo = !this.mudo; if (this.mudo) { if (this.ctx) this.zum.gain.value = 0; this.pausarMusica(); } return this.mudo; }
  pausarMusica() { if (this.musica && !this.musica.paused) this.musica.pause(); }
  pararMusica() { this.pausarMusica(); if (this.musica && this.musica.currentTime) this.musica.currentTime = 0; this.passo = 0; this.proxBatida = 0; }
  zumbir(v, sprint) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime, f = 190 + v * 70 + (sprint ? 90 : 0);
    this.o1.frequency.setTargetAtTime(f, t, 0.08); this.o2.frequency.setTargetAtTime(f * 2.01, t, 0.08);
    this.zum.gain.setTargetAtTime(this.mudo ? 0 : 0.03 + v * 0.035, t, 0.1);
  }
  silenciar() { if (this.ctx) this.zum.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05); this.pausarMusica(); }
  tom(f0, f1, dur, tipo = "sine", vol = 0.2, at = 0) {
    if (!this.ctx || this.mudo) return;
    const c = this.ctx, t = c.currentTime + at, o = c.createOscillator(), g = c.createGain();
    o.type = tipo; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(f1, 20), t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(this.mestre); o.start(t); o.stop(t + dur + 0.02);
  }
  sopro(dur, freq, vol, at = 0, ataque = 0.08) {
    if (!this.ctx || this.mudo) return;
    const c = this.ctx, t = c.currentTime + at, s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    s.buffer = this.ruido; f.type = "bandpass"; f.frequency.value = freq; f.Q.value = 0.8;
    g.gain.setValueAtTime(0.001, t); g.gain.linearRampToValueAtTime(vol, t + ataque); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    s.connect(f); f.connect(g); g.connect(this.mestre); s.start(t); s.stop(t + dur);
  }
  // Toca a música externa enquanto a skin Caminhão de som estiver ativa; se o arquivo não existir ou não carregar, toca um funk sintetizado (130 BPM)
  tocarMusicaCarreta(ativa, skinCarreta = ativa) {
    const m = this.musica, ligada = ativa && !this.mudo;
    if (m && this.musicaOk) {
      if (!ligada) { if (!skinCarreta) this.pararMusica(); else this.pausarMusica(); }
      else if (m.paused && !this.pedido) { this.pedido = true; m.play().then(() => { this.pedido = false; }).catch((e) => { this.pedido = false; if (!e || e.name !== "AbortError") this.musicaOk = false; }); }
      return;
    }
    if (!ligada || !this.ctx) { this.passo = 0; this.proxBatida = 0; return; }
    const c = this.ctx, dur = 60 / 130 / 2, baixo = [55, 55, 82.4, 55, 65.4, 55, 73.4, 82.4];
    if (this.proxBatida < c.currentTime) this.proxBatida = c.currentTime + 0.05;
    while (this.proxBatida < c.currentTime + 0.2) {
      const at = this.proxBatida - c.currentTime, k = this.passo % 8;
      if (k % 4 === 0) this.tom(130, 38, 0.2, "sine", 0.4, at);                    // bumbo
      if (k === 4) this.sopro(0.14, 1800, 0.16, at, 0.004);                         // caixa
      if (k % 2 === 1) this.sopro(0.05, 7000, 0.07, at, 0.004);                     // chimbal
      this.tom(baixo[k], baixo[k] * 0.97, 0.18, "sawtooth", 0.1, at);              // baixo
      this.proxBatida += dur; this.passo++;
    }
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
    this.graficoAtual = lerGraficos();
    this.legado(); this.css(); this.montarHud(); this.montarMenu();
    const mk = (id, css) => { let e = $(id); if (!e) { e = document.createElement("div"); e.id = id; e.style.cssText = css; document.body.appendChild(e); } return e; };
    this.alertaEl = mk("hud-alerta", "position:fixed;top:17%;left:50%;transform:translateX(-50%);font:800 1.3rem Syne,system-ui,sans-serif;color:#ffd84d;text-shadow:0 2px 12px #000;pointer-events:none;opacity:0;transition:opacity .2s;z-index:6;text-align:center;max-width:90vw");
    this.vinheta = mk("hud-vinheta", "position:fixed;inset:0;pointer-events:none;opacity:0;z-index:4");
    this.flashV = 0; this.base = 0; this.cache = {};
  }
  // Remove o HUD e o menu antigos que vinham do HTML: a interface nova é toda montada por aqui
  legado() {
    try {
      const web = $("webgl-container");
      const remover = (el) => { if (!el) return; let a = el; while (a.parentElement && a.parentElement !== document.body && !a.parentElement.contains(web)) a = a.parentElement; if (!a.contains(web) && a !== document.body) a.remove(); };
      ["sangue", "estagio", "nivel", "stamina", "combo-container", "combo", "toast", "evo", "menu"].forEach((id) => remover($(id)));
      document.querySelectorAll(".up, .upgrades, .stats-box").forEach(remover);
    } catch (e) { /* sem HTML antigo */ }
  }
  css() {
    if ($("ux-css")) return;
    const s = document.createElement("style"); s.id = "ux-css";
    s.textContent = `
#hx{position:fixed;inset:0;pointer-events:none;z-index:5;font-family:Figtree,system-ui,sans-serif;color:#eef2f8}
#hx [hidden],#hx-menu[hidden]{display:none!important}
.hx-card{background:rgba(14,12,24,.78);border:1px solid rgba(255,255,255,.12);border-radius:16px;backdrop-filter:blur(8px);box-shadow:0 10px 30px rgba(0,0,0,.4)}
.hx-status{position:absolute;top:16px;left:16px;display:flex;gap:14px;align-items:center;padding:12px 16px;min-width:340px}
.hx-skin{width:52px;height:52px;border-radius:14px;display:grid;place-items:center;font-size:1.7rem;background:linear-gradient(135deg,#2a2150,#4a1f3a);border:1px solid rgba(255,216,77,.35)}
.hx-info{flex:1;min-width:0}.hx-info b{display:block;font:800 1.05rem Syne,sans-serif}.hx-info small{color:#98a0af;font-size:.74rem;display:block}
.hx-prog{height:5px;border-radius:3px;background:rgba(255,255,255,.1);overflow:hidden;margin:6px 0 3px}.hx-prog i{display:block;height:100%;width:0;background:linear-gradient(90deg,#ff4d6d,#ffd84d);transition:width .3s}
.hx-sangue{text-align:right}.hx-sangue span{font:800 2.1rem/1 Syne,sans-serif;color:#ff7a90;display:block}.hx-sangue small{color:#98a0af;font-size:.7rem}
.hx-barras{position:absolute;top:16px;right:16px;width:270px;padding:12px 14px;display:grid;gap:9px}
.hx-barra{display:grid;grid-template-columns:22px 1fr 58px;gap:8px;align-items:center;font-size:.74rem}.hx-barra em{font-style:normal;color:#c9d0de;text-align:right}
.hx-trilho{height:10px;border-radius:5px;background:rgba(255,255,255,.1);overflow:hidden}.hx-trilho i{display:block;height:100%;width:100%;border-radius:5px;transition:width .15s}
#hx-vida{background:linear-gradient(90deg,#e8294b,#ff7a90)}#hx-stam{background:linear-gradient(90deg,#ff9f1c,#ffd84d)}
.hx-trilho i.baixa{animation:hxpisca .5s infinite alternate}@keyframes hxpisca{to{filter:brightness(1.8)}}
.hx-combo{position:absolute;top:18px;left:50%;transform:translateX(-50%);padding:8px 22px;text-align:center;border-radius:999px;background:rgba(14,12,24,.85);border:1px solid rgba(255,216,77,.55);min-width:140px}
.hx-combo b{font:800 1.6rem Syne,sans-serif;color:#ffd84d}.hx-combo span{display:block;font-size:.7rem;color:#c9d0de}
.hx-hab{position:absolute;left:16px;bottom:16px;display:flex;gap:12px;align-items:center;padding:10px 16px 10px 10px}
.hx-hab-ring{--p:100;width:58px;height:58px;border-radius:50%;display:grid;place-items:center;background:conic-gradient(#ffd84d calc(var(--p)*1%),rgba(255,255,255,.14) 0);position:relative}
.hx-hab-ring::before{content:"";position:absolute;inset:5px;border-radius:50%;background:#16122a}.hx-hab-ico{position:relative;font-size:1.6rem}
.hx-hab.pronto .hx-hab-ring{box-shadow:0 0 18px rgba(255,216,77,.6)}.hx-hab.ativa .hx-hab-ring{background:conic-gradient(#5ad7ff 100%,#5ad7ff 0);box-shadow:0 0 22px rgba(90,215,255,.85)}
.hx-hab b{display:block;font:800 .9rem Syne,sans-serif}.hx-hab small{color:#98a0af;font-size:.72rem}
kbd{font:700 .7rem Figtree,sans-serif;border:1px solid rgba(255,255,255,.25);border-radius:5px;padding:1px 6px;background:rgba(255,255,255,.07);color:#dfe5f1}
.hx-ups{position:absolute;bottom:16px;left:50%;transform:translateX(-50%);display:flex;gap:10px;pointer-events:auto}
.hx-up{position:relative;overflow:hidden;width:136px;padding:10px 12px;border-radius:14px;background:rgba(14,12,24,.85);border:1px solid rgba(255,255,255,.12);color:#eef2f8;cursor:pointer;display:grid;gap:4px;text-align:left;font-family:inherit;opacity:.78}
.hx-up kbd{position:absolute;top:8px;right:8px}.hx-up-ico{font-size:1.3rem}.hx-up-nome{font:800 .88rem Syne,sans-serif}.hx-up-custo{font-size:.78rem;color:#c9d0de}
.hx-up.pode{opacity:1;border-color:#ff4d6d;box-shadow:0 0 18px rgba(232,41,75,.4)}.hx-up.maximo{opacity:.83;border-color:#ffd84d;cursor:default}.hx-up.maximo .hx-up-custo{color:#ffd84d}.hx-up-fill{position:absolute;left:0;bottom:0;height:3px;background:#ff4d6d;width:0}
/* Sempre dez quadradinhos, preenchendo em tres etapas de dez niveis. */
.hx-pips{display:grid;grid-template-columns:repeat(10,minmax(0,1fr));gap:3px;width:100%;margin-top:2px}
.hx-pips i{display:block;min-width:0;height:9px;border-radius:2px;background:rgba(255,255,255,.13);border:1px solid rgba(255,255,255,.07);box-sizing:border-box}
.hx-pips i.on{background:#ffab58;box-shadow:0 0 5px rgba(255,171,88,.45)}
.hx-pips.etapa-2 i.on{background:#5ee1ff;box-shadow:0 0 5px rgba(94,225,255,.5)}
.hx-pips.etapa-3 i.on{background:#c98aff;box-shadow:0 0 6px rgba(201,138,255,.65)}
.hx-up-nivel{font:700 .72rem Figtree,sans-serif;color:#dce4f5;text-align:center;letter-spacing:.015em}
.hx-up-nivel strong{font-weight:800;color:#fff}
.hx-up.maximo .hx-up-nivel strong{color:#ffd84d}
.hx-sala{position:absolute;right:16px;bottom:16px;text-align:right;padding:10px 14px}.hx-sala b{font:800 .95rem Syne,sans-serif;display:block}.hx-sala small{color:#98a0af;font-size:.68rem}
#hx-toast{position:absolute;left:50%;top:68%;transform:translateX(-50%);font:700 1.05rem Syne,sans-serif;color:#ffd0d8;background:rgba(14,12,24,.8);border:1px solid rgba(255,255,255,.14);border-radius:999px;padding:7px 18px;opacity:0;white-space:nowrap;max-width:92vw;overflow:hidden;text-overflow:ellipsis}
#hx-toast.mostra{animation:hxsobe 1.6s ease-out forwards}@keyframes hxsobe{0%{opacity:0;transform:translate(-50%,10px)}12%{opacity:1}80%{opacity:1}100%{opacity:0;transform:translate(-50%,-26px)}}
#hx-evo{position:absolute;inset:0;display:grid;place-content:center;text-align:center;opacity:0;background:radial-gradient(circle,rgba(232,41,75,.35),transparent 62%)}
#hx-evo b{font:800 clamp(2rem,7vw,5rem) Syne,sans-serif;text-shadow:0 0 30px #e8294b}#hx-evo span{font:700 1.2rem Syne,sans-serif;color:#ffd84d}
#hx-evo.mostra{animation:hxevo 2.2s ease-out forwards}@keyframes hxevo{0%{opacity:0;transform:scale(.8)}18%{opacity:1;transform:scale(1.05)}80%{opacity:1}100%{opacity:0;transform:scale(1.15)}}
#hx-menu{position:fixed;inset:0;z-index:12;display:grid;place-items:center;overflow:auto;font-family:Figtree,system-ui,sans-serif;color:#eef2f8;background:radial-gradient(ellipse at 20% 10%,rgba(232,41,75,.28),transparent 55%),radial-gradient(ellipse at 90% 90%,rgba(90,60,200,.25),transparent 55%),#080610}
.hxm-fundo{position:absolute;inset:0;pointer-events:none;overflow:hidden}.hxm-fundo i{position:absolute;font-style:normal;opacity:.12;animation:hxvoa linear infinite}
@keyframes hxvoa{from{transform:translate(-10vw,0) rotate(0)}to{transform:translate(110vw,-30vh) rotate(40deg)}}
.hxm-painel{position:relative;width:min(880px,92vw);margin:12px;padding:24px 28px 20px;border-radius:20px;background:rgba(18,14,32,.9);border:1px solid rgba(232,41,75,.35);box-shadow:0 18px 60px rgba(0,0,0,.58)}
.hxm-painel h1{margin:0;font:800 clamp(2.3rem,6.4vw,3.8rem)/1 Syne,sans-serif;color:#ff4d6d}.hxm-painel header p{margin:6px 0 18px;color:#98a0af}
.hxm-grid{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,.95fr);gap:22px;align-items:start}@media(max-width:760px){.hxm-grid{grid-template-columns:1fr}.hx-status{min-width:0;left:8px;top:8px}.hx-barras{width:200px;right:8px;top:8px}.hx-ups{gap:6px}.hx-up{width:92px;padding:8px}.hx-sala{display:none}}
.hx-btn{width:100%;padding:15px;border-radius:12px;border:0;font:800 1.15rem Syne,sans-serif;cursor:pointer;color:#fff;background:#e8294b;transition:transform .15s,background .15s}.hx-btn:hover{background:#ff3d5f;transform:translateY(-2px)}
.hxm-atalhos{display:flex;gap:8px;margin:10px 0 16px}.hxm-atalhos button{flex:1;padding:11px;border-radius:11px;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.06);color:#eef2f8;font:700 .9rem Figtree,sans-serif;cursor:pointer}.hxm-atalhos button:hover{background:rgba(255,255,255,.12)}
.hxm-res{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:16px}.hxm-res div{background:rgba(255,255,255,.05);border-radius:12px;padding:10px 13px;min-height:74px;display:flex;flex-direction:column;justify-content:space-between}.hxm-res b{display:block;font:800 1.05rem Syne,sans-serif;line-height:1.05}.hxm-res small{color:#98a0af;font-size:.72rem}.hxm-col h3{margin:0 0 10px;font:800 .95rem Syne,sans-serif;color:#ffd84d}.hxm-ctrl{display:grid;grid-template-columns:auto 1fr;gap:7px 12px;font-size:.84rem;align-items:center}.hxm-ctrl span{color:#b6bdcb}.hxm-save{margin:12px 2px 0;color:#7f8798;font-size:.78rem;min-height:1em}.hxm-bottom{margin-top:14px}@media(max-width:760px){.hxm-res{grid-template-columns:1fr 1fr}}@media(max-width:520px){.hxm-res{grid-template-columns:1fr}}
.sk-wrap{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:18px}@media(max-width:820px){.sk-wrap{grid-template-columns:1fr}}
.sk-lista{display:grid;grid-template-columns:repeat(auto-fill,minmax(128px,1fr));gap:10px;align-content:start}
.sk-card{--c:#8a93a6;position:relative;display:grid;gap:5px;justify-items:center;text-align:center;padding:14px 8px;border-radius:14px;background:rgba(255,255,255,.05);border:2px solid rgba(255,255,255,.1);color:#eef2f8;cursor:pointer;font-family:inherit}
.sk-card:hover{background:rgba(255,255,255,.09)}.sk-card.sel{border-color:var(--c);box-shadow:0 0 18px color-mix(in srgb,var(--c) 45%,transparent)}.sk-card.trava{opacity:.65}
.sk-ico{font-size:1.9rem}.sk-card b{font:800 .8rem Syne,sans-serif}.sk-card em{position:absolute;top:6px;right:6px;font-style:normal;font-size:.58rem;font-weight:800;color:#0e0c18;background:#7dff9a;border-radius:6px;padding:1px 5px}
.sk-prev{display:flex;flex-direction:column;gap:7px;padding:14px;border-radius:16px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);align-self:start}
.sk-vista{position:relative;height:250px;border-radius:12px;overflow:hidden;background:radial-gradient(circle at 50% 40%,#2c2250,#0d0a1c)}.sk-vista canvas{position:absolute;inset:0;width:100%;height:100%}
.sk-atos{position:absolute;left:8px;bottom:8px;display:flex;gap:5px;z-index:2}.sk-atos button{border:1px solid rgba(255,255,255,.25);background:rgba(0,0,0,.55);color:#fff;border-radius:8px;padding:4px 9px;font:700 .7rem Figtree,sans-serif;cursor:pointer}.sk-atos button.on{background:#ffd84d;color:#0e0c18}
.sk-prev h3{margin:4px 0 0;font:800 1.15rem Syne,sans-serif}.sk-prev p{margin:0;font-size:.78rem;color:#98a0af;line-height:1.45}.sk-sec{margin-top:4px;font:800 .72rem Syne,sans-serif;color:#ffd84d;letter-spacing:.05em;text-transform:uppercase}
.sk-prev ul{margin:0;padding:0;list-style:none;display:grid;gap:3px;font:700 .76rem Figtree,sans-serif;color:#9fe6b5}.sk-hab{font:800 .9rem Syne,sans-serif}.sk-prev small{color:#7f8798;font-size:.72rem}
.sk-pixel-colors{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:7px;margin:8px 0 10px}
.sk-pixel-swatch{height:34px;border-radius:8px;cursor:pointer;border:2px solid rgba(255,255,255,.25);background:var(--cor);position:relative;transition:transform .12s}
.sk-pixel-swatch:hover{transform:translateY(-2px)}.sk-pixel-swatch[aria-pressed="true"]{outline:2px solid #fff;outline-offset:2px}
.sk-pixel-custom{display:flex;align-items:center;justify-content:space-between;gap:10px;background:rgba(255,255,255,.06);padding:8px 10px;border-radius:10px;font:700 .78rem Figtree,sans-serif}
.sk-pixel-custom input{border:0;background:transparent;padding:0;width:45px;height:36px;cursor:pointer}
.sk-pixel-custom output{font:800 .75rem monospace;color:#ffe8a0}
.sk-eq{margin-top:6px;padding:11px;border:0;border-radius:11px;font:800 .9rem Syne,sans-serif;cursor:pointer;background:#ffd84d;color:#0e0c18}.sk-eq:disabled{background:rgba(255,255,255,.1);color:#98a0af;cursor:default}
.hxm-graficos{margin-top:14px;padding:12px;border-radius:12px;border:1px solid rgba(255,255,255,.13);background:rgba(255,255,255,.04)}
.hxm-graficos b{font:800 .85rem Syne,sans-serif;color:#ffd84d}
.hxm-graf-botoes{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:9px}
.hxm-graf-botoes button{padding:10px 5px;border-radius:8px;font:700 .72rem Figtree,sans-serif;cursor:pointer;color:#dbe3ee;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.18)}
.hxm-graf-botoes button.ativo{background:#ffd84d;color:#14101e;border-color:#ffd84d;box-shadow:0 0 10px rgba(255,216,77,.25)}
.hxm-graficos small{display:block;font-size:.7rem;color:#a8b0bd;line-height:1.4;margin-top:9px}
#hx-fps{position:absolute;right:16px;top:110px;font:700 .75rem monospace;color:#d5ffe4;text-shadow:0 2px 7px #000;opacity:.85}
`;
    document.head.appendChild(s);
  }
  montarHud() {
    const h = document.createElement("div"); h.id = "hx";
    const UP = { asas: ["🪽", "+0,5 de velocidade por nível"], tromba: ["💉", "+0,15 de alcance de coleta por nível"], estomago: ["🩸", "+2 de sangue por gota por nível"], corpo: ["🛡️", "+15 de stamina e +12 de vida por nível"] };
    const ups = Object.keys(CFG.UPS).map((k, i) => `<button class="hx-up" data-up="${k}" title="${UP[k][1]}"><kbd>${i + 1}</kbd><span class="hx-up-ico">${UP[k][0]}</span><span class="hx-up-nome">${CFG.UPS[k].nome}</span><span class="hx-pips" data-pips="${k}"></span><span class="hx-up-nivel" data-nivel-up="${k}">Nível <strong>0</strong>/30</span><span class="hx-up-custo">🩸 <b data-custo="${k}">0</b></span><i class="hx-up-fill" data-fill="${k}"></i></button>`).join("");
    h.innerHTML = `
<div class="hx-card hx-status"><div class="hx-skin" id="hx-skin-ico">🦟</div><div class="hx-info"><b id="hx-estagio">Larva voadora</b><small>Nível <span id="hx-nivel">0</span> · <span id="hx-skin-nome">Sem skin</span></small><div class="hx-prog"><i id="hx-prog"></i></div><small id="hx-prox"></small></div><div class="hx-sangue"><span id="hx-sangue">0</span><small>sangue</small></div></div>
<div class="hx-combo" id="hx-combo" hidden><b id="hx-combo-n">×1</b><span id="hx-combo-txt">combo</span><div class="hx-prog"><i id="hx-combo-f"></i></div></div>
<div class="hx-card hx-barras"><div class="hx-barra"><span>❤️</span><div class="hx-trilho"><i id="hx-vida"></i></div><em id="hx-vida-n"></em></div><div class="hx-barra"><span>⚡</span><div class="hx-trilho"><i id="hx-stam"></i></div><em id="hx-stam-n"></em></div></div>
<div class="hx-card hx-hab" id="hx-hab"><div class="hx-hab-ring" id="hx-hab-ring"><span class="hx-hab-ico" id="hx-hab-ico">💨</span></div><div><b id="hx-hab-nome">Impulso</b><small><kbd>R</kbd> <span id="hx-hab-cd">pronta!</span></small></div></div>
<div class="hx-ups">${ups}</div>
<div class="hx-card hx-sala"><b id="hx-sala">Corredor</b><small>E picar · R poder · K skins · C conquistas · H dica</small></div>
<div id="hx-fps" hidden></div>
<div id="hx-toast"></div><div id="hx-evo"><b>Evolução</b><span id="hx-evo-txt"></span></div>`;
    document.body.appendChild(h); this.hx = h;
    const q = (id) => h.querySelector("#" + id);
    this.e = { skinIco: q("hx-skin-ico"), estagio: q("hx-estagio"), nivel: q("hx-nivel"), skinNome: q("hx-skin-nome"), prog: q("hx-prog"), prox: q("hx-prox"), sangue: q("hx-sangue"),
      combo: q("hx-combo"), comboN: q("hx-combo-n"), comboTxt: q("hx-combo-txt"), comboF: q("hx-combo-f"), vida: q("hx-vida"), vidaN: q("hx-vida-n"), stam: q("hx-stam"), stamN: q("hx-stam-n"),
      hab: q("hx-hab"), habRing: q("hx-hab-ring"), habIco: q("hx-hab-ico"), habNome: q("hx-hab-nome"), habCd: q("hx-hab-cd"), sala: q("hx-sala"), toast: q("hx-toast"), evo: q("hx-evo"), evoTxt: q("hx-evo-txt") };
  }
  montarMenu() {
    const m = document.createElement("div"); m.id = "hx-menu";
    const voa = Array.from({ length: 9 }, (_, i) => `<i style="left:${-5 - i * 7}vw;top:${8 + ((i * 37) % 80)}vh;font-size:${1.4 + (i % 3)}rem;animation-duration:${22 + i * 5}s;animation-delay:-${i * 4}s">🦟</i>`).join("");
    const ctrl = [["W A S D", "mover"], ["Mouse", "olhar"], ["Espaço / Ctrl", "subir / descer"], ["Shift", "sprint"], ["1 2 3 4", "evoluir"], ["E", "picar um humano"], ["R", "habilidade da skin"], ["K / C", "skins / conquistas"], ["F", "arrombar armário"], ["Q", "responder o quadro"], ["B", "carteira / livro"], ["H · M · =", "dica · som · tour"]]
      .map(([a, b]) => `<kbd>${a}</kbd><span>${b}</span>`).join("");
    m.innerHTML = `<div class="hxm-fundo">${voa}</div><section class="hxm-painel"><header><h1 id="hx-menu-titulo">MOSQUITO</h1><p>Evolução noturna · escola assombrada de humanos</p></header>
<div class="hxm-grid"><div class="hxm-col">
<fieldset class="hxm-dispositivo"><legend>Como você quer jogar?</legend><div>
<button type="button" data-controle="desktop" aria-pressed="false">💻 Computador</button>
<button type="button" data-controle="mobile" aria-pressed="false">📱 Celular / toque</button>
</div><small id="hx-controle-desc"></small></fieldset>
<button class="hx-btn" id="hx-btn-jogar">Jogar</button><div class="hxm-atalhos"><button id="hx-btn-skins">🎨 Skins <kbd>K</kbd></button><button id="hx-btn-conq">🏆 Conquistas <kbd>C</kbd></button></div>
<div class="hxm-graficos"><b>⚙️ Modo gráfico</b><div class="hxm-graf-botoes">
<button type="button" data-modo-grafico="leve">🚀 Leve</button><button type="button" data-modo-grafico="medio">⚖️ Normal</button><button type="button" data-modo-grafico="alto">✨ Alto</button><button type="button" data-modo-grafico="ultra">💎 Ultra</button></div>
<small id="hx-graf-desc">Escolha o desempenho ideal para o seu dispositivo.</small></div></div>
<div class="hxm-col"><h3>Controles</h3><div class="hxm-ctrl" id="hx-controles-pc">${ctrl}</div>
<div class="hxm-ctrl" id="hx-controles-mobile" hidden>
<b>Direcional</b><span>mover com o polegar esquerdo</span>
<b>Arrastar</b><span>olhar pelo cenário</span>
<b>Altitude</b><span>olhe para cima ou para baixo enquanto voa</span>
<b>Sprint</b><span>segurar para acelerar</span>
<b>Picar / Poder</b><span>atacar / usar habilidade</span>
<b>Pegar</b><span>pegar ou devolver objetos</span>
<b>Evoluções</b><span>cartões entre o direcional e as ações</span>
<b>Skins / Conquistas</b><span>botões sempre visíveis no topo</span>
<b>••• / Ⅱ</b><span>mais ações / pausar</span>
</div></div></div><div class="hxm-bottom"><div class="hxm-res" id="hx-resumo"></div><p class="hxm-save" id="hx-save"></p></div></section>`;
    document.body.appendChild(m); this.menuEl = m;
  }
  _w(el, pct) { const v = Math.round(clamp(pct, 0, 100)); if (this.cache[el.id || el] !== v) { this.cache[el.id || el] = v; el.style.width = v + "%"; } }
  hud(S) {
    this.ultimoS = S; const e = this.e, est = S.estagio, prox = CFG.ESTAGIOS.find((x) => x.min > S.total);
    e.sangue.textContent = Math.floor(S.sangue).toLocaleString("pt-BR");
    e.estagio.textContent = est.nome; e.nivel.textContent = S.total;
    e.prog.style.width = (prox ? ((S.total - est.min) / (prox.min - est.min)) * 100 : 100) + "%";
    e.prox.textContent = prox ? `Próximo: ${prox.nome} (nível ${prox.min})` : "Estágio máximo";
    e.skinIco.textContent = S.skin ? SKIN_ICO[S.skin] : "🦟";
    e.skinNome.textContent = S.skin ? (S.skin === "tusk" ? `Tusk · Ato ${Math.max(1, S.mantis.length)}` : CFG.SKINS[S.skin].nome) : "Sem skin";
    for (const k in CFG.UPS) {
      const bt = this.hx.querySelector(`[data-up="${k}"]`), ct = bt.querySelector(`[data-custo="${k}"]`), pips = bt.querySelector(`[data-pips="${k}"]`), fill = bt.querySelector(`[data-fill="${k}"]`), c = S.custo(k);
      const nv = S.nv[k], maximo = nv >= CFG.UP_MAX;
      ct.textContent = maximo ? "MÁXIMO" : c.toLocaleString("pt-BR");
      bt.classList.toggle("pode", !maximo && S.sangue >= c);
      bt.classList.toggle("maximo", maximo); bt.disabled = maximo;
      fill.style.width = maximo ? "100%" : Math.min(100, (S.sangue / c) * 100) + "%";
      const chave = k + nv;
      if (this.cache["p" + k] !== chave) {
        this.cache["p" + k] = chave;
        const etapa = nv <= 10 ? 1 : nv <= 20 ? 2 : 3;
        const preenchidos = nv === 0 ? 0 : ((nv - 1) % 10) + 1;
        pips.className = "hx-pips etapa-" + etapa;
        pips.innerHTML = Array.from({ length: 10 }, (_, i) => `<i class="${i < preenchidos ? "on" : ""}"></i>`).join("");
        bt.querySelector(`[data-nivel-up="${k}"]`).innerHTML = `Nível <strong>${nv}</strong>/${CFG.UP_MAX}`;
      }
    }
  }
  barras(stamina, staminaMax, vida, vidaMax) {
    const e = this.e; this._w(e.stam, (stamina / staminaMax) * 100); e.stam.classList.toggle("baixa", stamina < staminaMax * 0.25);
    this._w(e.vida, (vida / vidaMax) * 100); e.vida.classList.toggle("baixa", vida < vidaMax * 0.3);
    const a = Math.ceil(stamina) + "/" + Math.round(staminaMax), b = Math.ceil(vida) + "/" + Math.round(vidaMax);
    if (this._tn1 !== a) { this._tn1 = a; e.stamN.textContent = a; } if (this._tn2 !== b) { this._tn2 = b; e.vidaN.textContent = b; }
  }
  combo(combo, t, boost) {
    const e = this.e, on = combo >= 2 || boost > 0; e.combo.hidden = !on; if (!on) return;
    const n = "×" + Math.max(1, combo), tx = boost > 0 ? `XP×2 · ${Math.ceil(boost)}s` : "combo";
    if (this._cn !== n) { this._cn = n; e.comboN.textContent = n; } if (this._ct !== tx) { this._ct = tx; e.comboTxt.textContent = tx; }
    e.comboF.style.width = Math.min(100, Math.max(0, (t / CFG.COMBO_T) * 100)) + "%";
  }
  habilidade(id, cd, cdTotal, ativo) {   // botão da habilidade especial: ícone, nome, recarga em anel e brilho enquanto ativa
    const H = HABS[id || "padrao"], e = this.e, chave = id + "|" + Math.ceil(cd * 5) + "|" + Math.ceil(ativo * 5);
    if (this._hk === chave) return; this._hk = chave;
    const pronto = cd <= 0; e.habIco.textContent = H.ico; e.habNome.textContent = H.nome;
    e.hab.classList.toggle("pronto", pronto); e.hab.classList.toggle("ativa", ativo > 0);
    e.habCd.textContent = ativo > 0 ? `ativa ${Math.ceil(ativo)}s` : pronto ? "pronta!" : `${Math.ceil(cd)}s`;
    e.habRing.style.setProperty("--p", pronto ? 100 : ((cdTotal - cd) / Math.max(1, cdTotal)) * 100);
  }
  sala(nome) { if (this._sl !== nome) { this._sl = nome; this.e.sala.textContent = nome; } }
  alerta(txt, cor = "#ffd84d") { txt = this.textoControle(txt); const ch = txt + cor; if (this._al === ch) return; this._al = ch; this.alertaEl.textContent = txt || ""; this.alertaEl.style.color = cor; this.alertaEl.style.opacity = txt ? 1 : 0; }
  flash(cor) { this.vinheta.style.boxShadow = `inset 0 0 160px 50px ${cor}`; this.flashV = 1; this._pc = null; }
  perigo(cor, v) { if (v > 0 && this._pc !== cor) { this._pc = cor; this.vinheta.style.boxShadow = `inset 0 0 160px 40px ${cor}`; } this.base = v; }
  atualizar(dt) {
    this.flashV = Math.max(0, this.flashV - dt * 2.5);
    this.vinheta.style.opacity = Math.max(this.flashV, this.base).toFixed(2);
  }
  retrigger(el, c) { el.classList.remove(c); void el.offsetWidth; el.classList.add(c); }
  toast(txt) { const t = this.e.toast; t.textContent = this.textoControle(txt); this.retrigger(t, "mostra"); }
  evolucao(nome) { this.e.evoTxt.textContent = nome; this.retrigger(this.e.evo, "mostra"); }

  // ---- Menu de coleção: abas Skins (K) e Conquistas (C) ----
  construirColecao() {
    if (this.colBox) return this.colBox;
    const box = document.createElement("div"); box.id = "menu-colecao";
    box.style.cssText = "position:fixed;inset:0;display:none;align-items:center;justify-content:center;background:rgba(6,4,14,.9);z-index:20;font-family:Syne,Figtree,system-ui,sans-serif";
    box.innerHTML = '<section style="width:min(1120px,96vw);max-height:92vh;overflow:auto;background:rgba(14,12,24,.97);border:1px solid rgba(255,216,77,.3);border-radius:16px;padding:22px 26px;color:#eef2f8">'
      + '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:16px"><button data-aba="skins" class="col-aba"></button><button data-aba="conq" class="col-aba"></button><span style="flex:1"></span>'
      + '<button id="col-fechar" style="font:800 .85rem Syne,sans-serif;color:#0e0c18;background:#ffd84d;border:0;border-radius:10px;padding:9px 18px;cursor:pointer">Voltar ao jogo (Esc)</button></div><div id="col-conteudo"></div></section>';
    document.body.appendChild(box); this.colBox = box; this.colConteudo = box.querySelector("#col-conteudo"); this.filtro = { cat: "Todas", st: "Todas" };
    box.querySelector("#col-fechar").addEventListener("click", () => this.aoFechar && this.aoFechar());
    box.addEventListener("click", (e) => { if (e.target === box && this.aoFechar) this.aoFechar(); });
    return box;
  }
  abrirColecao(S, aba, api) {
    const box = this.construirColecao(); this.aoFechar = api.fechar;
    const hex = (c) => "#" + ((c || 0) >>> 0).toString(16).padStart(6, "0"), RAR = CFG.RAR, nSkins = Object.keys(CFG.SKINS).length;
    box.querySelectorAll(".col-aba").forEach((b) => {
      const ativa = b.dataset.aba === aba;
      b.textContent = b.dataset.aba === "skins" ? `🎨 Skins ${S.skins.length}/${nSkins}` : `🏆 Conquistas ${S.conq.length}/${CFG.CONQ.length}`;
      b.style.cssText = `font:800 .9rem Syne,sans-serif;border-radius:10px;padding:9px 16px;cursor:pointer;color:${ativa ? "#0e0c18" : "#eef2f8"};background:${ativa ? "#ffd84d" : "rgba(255,255,255,.07)"};border:1px solid rgba(255,216,77,.35)`;
      b.onclick = () => api.aba(b.dataset.aba);
    });
    const chip = (txt, ativo, attr) => `<button ${attr} style="cursor:pointer;font:700 .76rem Figtree,sans-serif;border-radius:999px;padding:6px 13px;color:${ativo ? "#0e0c18" : "#c9d0de"};background:${ativo ? "#ffd84d" : "rgba(255,255,255,.07)"};border:1px solid rgba(255,255,255,.14)">${txt}</button>`;
    if (aba === "skins") this.renderSkins(S, api);
    else {
      this.previewParar();
      const f = this.filtro, pts = (lista) => lista.reduce((a, c) => a + RAR[c.r].pts, 0), obtidas = CFG.CONQ.filter((c) => S.conq.includes(c.id));
      const cats = ["Todas", ...new Set(CFG.CONQ.map((c) => c.cat))], pct = Math.round((obtidas.length / CFG.CONQ.length) * 100);
      const stats = [["🩸", Math.floor(S.sangue), "sangue"], ["🧬", S.total, "nível"], ["🦟", S.picadas, "picadas"], ["🏫", S.salas.length + "/" + CFG.SALAS.length, "salas"], ["🎨", S.skins.length + "/" + nSkins, "skins"]]
        .map(([i, v, n]) => `<span style="background:rgba(255,255,255,.06);border-radius:10px;padding:8px 12px;font:600 .8rem Figtree,sans-serif"><b style="font:800 1rem Syne,sans-serif">${i} ${v}</b> <span style="color:#98a0af">${n}</span></span>`).join("");
      const lista = CFG.CONQ.filter((c) => (f.cat === "Todas" || c.cat === f.cat) && (f.st === "Todas" || (f.st === "Obtidas") === S.conq.includes(c.id)));
      const itens = lista.map((c) => {
        const tem = S.conq.includes(c.id), r = RAR[c.r], oculto = c.secreto && !tem, p = tem || oculto ? null : api.progresso(c.id);
        const barra = p ? `<div style="margin-top:8px;height:5px;border-radius:3px;background:rgba(255,255,255,.1);overflow:hidden"><i style="display:block;height:100%;width:${Math.round(p.v / p.max * 100)}%;background:${r.cor}"></i></div><small style="font:600 .68rem Figtree,sans-serif;color:#7f8798">${Math.floor(p.v)} / ${p.max}</small>` : "";
        return `<div style="display:flex;gap:12px;align-items:flex-start;background:rgba(255,255,255,${tem ? ".08" : ".025"});border:1px solid ${tem ? r.cor : "rgba(255,255,255,.1)"};border-left:4px solid ${r.cor};border-radius:12px;padding:12px 14px;opacity:${tem ? 1 : 0.8}">`
          + `<span style="font-size:1.7rem;filter:${tem ? "none" : "grayscale(1) brightness(.6)"}">${oculto ? "❔" : c.ico}</span><span style="flex:1"><b style="display:block;font:800 .92rem Syne,sans-serif;color:${tem ? r.cor : "#eef2f8"}">${oculto ? "???" : c.nome}</b>`
          + `<small style="font:600 .74rem/1.4 Figtree,sans-serif;color:#98a0af">${oculto ? "Conquista secreta: continue explorando a escola." : c.desc}</small>${barra}`
          + `<small style="display:block;margin-top:6px;font:700 .68rem Figtree,sans-serif;color:${r.cor}">${r.nome} · +${c.premio} sangue · ${r.pts} pts</small></span>${tem ? '<span style="color:#7dff9a;font-weight:800">✔</span>' : ""}</div>`;
      }).join("") || '<p style="color:#7f8798;font:600 .85rem Figtree,sans-serif">Nenhuma conquista neste filtro.</p>';
      this.colConteudo.innerHTML = `<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px">${stats}</div>`
        + `<div style="display:flex;justify-content:space-between;font:700 .8rem Figtree,sans-serif;margin-bottom:6px"><span>🏆 ${obtidas.length}/${CFG.CONQ.length} conquistas</span><span style="color:#ffd84d">${pts(obtidas)} / ${pts(CFG.CONQ)} pontos</span></div>`
        + `<div style="height:8px;border-radius:4px;background:rgba(255,255,255,.1);overflow:hidden;margin-bottom:14px"><i style="display:block;height:100%;width:${pct}%;background:linear-gradient(90deg,#cd7f32,#c4ccdc,#ffd84d)"></i></div>`
        + `<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px">${cats.map((c) => chip(c, f.cat === c, `data-cat="${c}"`)).join("")}</div>`
        + `<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px">${["Todas", "Obtidas", "Pendentes"].map((c) => chip(c, f.st === c, `data-st="${c}"`)).join("")}</div>`
        + `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:10px">${itens}</div>`;
      this.colConteudo.querySelectorAll("[data-cat]").forEach((b) => b.addEventListener("click", () => { f.cat = b.dataset.cat; api.aba("conq"); }));
      this.colConteudo.querySelectorAll("[data-st]").forEach((b) => b.addEventListener("click", () => { f.st = b.dataset.st; api.aba("conq"); }));
    }
    box.style.display = "flex"; document.exitPointerLock?.();
  }
  colecaoAberta() { return !!this.colBox && this.colBox.style.display === "flex"; }
  fecharColecao() { if (this.colBox) this.colBox.style.display = "none"; this.previewParar(); this.skSel = undefined; this.skAto = 0; }

  // ---- Aba de skins: lista + painel lateral com modelo 3D girando, atributos e habilidade ----
  renderSkins(S, api) {
    const ids = Object.keys(CFG.SKINS), tem = (id) => !id || S.skins.includes(id);
    if (this.skSel === undefined || (this.skSel && !CFG.SKINS[this.skSel])) this.skSel = S.skin || null;
    const sel = this.skSel, sk = sel ? CFG.SKINS[sel] : null, liberada = tem(sel);
    if (sel === "tusk" && !this.skAto) this.skAto = Math.max(1, S.mantis.length);
    const ato = sel === "tusk" ? this.skAto : 0, hex = (c) => "#" + ((c || 0) >>> 0).toString(16).padStart(6, "0");
    const card = (id) => {
      const k = id ? CFG.SKINS[id] : null, ok = tem(id), uso = (S.skin || null) === id, cor = k ? hex(k.brilho || k.abd) : "#8a93a6";
      return `<button class="sk-card${sel === id ? " sel" : ""}${ok ? "" : " trava"}" data-sk="${id || ""}" style="--c:${cor}"><span class="sk-ico">${ok ? (id ? SKIN_ICO[id] : "🦟") : "🔒"}</span><b>${ok ? (k ? k.nome : "Padrão") : "???"}</b>${uso ? "<em>EM USO</em>" : ""}</button>`;
    };
    const at = !sk ? [] : descAttr(sel === "tusk" ? CFG.TUSK[Math.max(0, ato - 1)].attr : sk.attr), H = HABS[sel || "padrao"];
    const cd = sel === "tusk" ? [10, 8, 6, 4][Math.max(1, ato) - 1] : H.cd, uso = (S.skin || null) === sel;
    const atos = sel === "tusk" && liberada ? `<div class="sk-atos">${[1, 2, 3, 4].map((n) => `<button data-ato="${n}" class="${n === ato ? "on" : ""}">Ato ${n}${n > S.mantis.length ? " 🔒" : ""}</button>`).join("")}</div>` : "";
    this.colConteudo.innerHTML = `<div class="sk-wrap"><div class="sk-lista">${["", ...ids].map((id) => card(id || null)).join("")}</div>
<aside class="sk-prev"><div class="sk-vista" id="sk-vista">${atos}</div><h3>${liberada ? (sk ? sk.nome : "Padrão") : "???"}${sel === "tusk" && liberada ? ` · Ato ${ato}` : ""}</h3>
<p>${liberada ? (sk ? "Gire para ver os detalhes. " + (sel === "tusk" ? "Atos não desbloqueados são só uma prévia." : "") : "O visual original do mosquito, sem bônus.") : "🔒 " + sk.dica}</p>
${liberada ? `<div class="sk-sec">Atributos</div>${at.length ? `<ul>${at.map((t) => `<li>${t}</li>`).join("")}</ul>` : "<p>Sem bônus de atributos.</p>"}
<div class="sk-sec">Habilidade <kbd>R</kbd></div><div class="sk-hab">${H.ico} ${H.nome}</div><p>${H.desc}</p><small>Recarga: ${cd}s${H.dur ? ` · duração: ${H.dur}s` : ""}</small>` : ""}
${sel === "pixel" && liberada ? `<div class="sk-sec">🎨 Cor do Mosquito 8-bit</div>
<div class="sk-pixel-colors">${COR_PIXEL_OPCOES.map(([nome, cor]) => `<button type="button" class="sk-pixel-swatch" data-pixel-cor="${cor}" style="--cor:${cor}" title="${nome}" aria-label="Cor ${nome}" aria-pressed="${S.pixelCor === cor}"></button>`).join("")}</div>
<label class="sk-pixel-custom" for="sk-pixel-custom"><span>Cor personalizada</span><input id="sk-pixel-custom" type="color" value="${S.pixelCor}"><output id="sk-pixel-hex">${S.pixelCor.toUpperCase()}</output></label>
<small>Muda os cubos do corpo, do abdômen e das asas. Salva automaticamente.</small>` : ""}
${sel === "tusk" && liberada ? `<button id="sk-aura-tusk" type="button" aria-pressed="${S.auraTusk !== false}" style="width:100%;padding:11px;border-radius:11px;border:1px solid rgba(255,216,77,.5);background:rgba(255,216,77,.12);color:#ffe8a0;font:800 .85rem Syne,sans-serif;cursor:pointer">✨ Aura do Tusk: ${S.auraTusk !== false ? "Ligada" : "Desligada"}</button><small>Opção visual: não muda os poderes ou os atributos. Fica salva.</small>` : ""}
<button class="sk-eq" id="sk-eq" ${!liberada || uso ? "disabled" : ""}>${uso ? "Em uso" : liberada ? "Equipar" : "Bloqueada"}</button></aside></div>`;
    const c = this.colConteudo;
    c.querySelectorAll("[data-sk]").forEach((b) => { b.addEventListener("click", () => { this.skSel = b.dataset.sk || null; this.skAto = this.skSel === "tusk" ? Math.max(1, S.mantis.length) : 0; this.renderSkins(S, api); }); b.addEventListener("dblclick", () => { if (tem(b.dataset.sk || null)) api.escolher(b.dataset.sk || null); }); });
    c.querySelectorAll("[data-ato]").forEach((b) => b.addEventListener("click", () => { this.skAto = +b.dataset.ato; this.renderSkins(S, api); }));
    const botaoAura = c.querySelector("#sk-aura-tusk");
    if (botaoAura) botaoAura.addEventListener("click", () => {
      api.alternarAuraTusk();
      this.renderSkins(S, api);
    });
    if (sel === "pixel" && liberada) {
      const custom = c.querySelector("#sk-pixel-custom"), valor = c.querySelector("#sk-pixel-hex");
      const pintar = (cor) => {
        if (!api.mudarCorPixel(cor)) return;
        custom.value = S.pixelCor;
        valor.textContent = S.pixelCor.toUpperCase();
        c.querySelectorAll("[data-pixel-cor]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.pixelCor === S.pixelCor)));
      };
      c.querySelectorAll("[data-pixel-cor]").forEach((b) => b.addEventListener("click", () => pintar(b.dataset.pixelCor)));
      custom.addEventListener("input", () => pintar(custom.value));
    }
    const eq = c.querySelector("#sk-eq"); if (eq) eq.addEventListener("click", () => { if (liberada && !uso) api.escolher(sel); });
    const pv = this.previewIniciar(), vista = c.querySelector("#sk-vista");
    if (pv.erro) { vista.insertAdjacentHTML("afterbegin", '<p style="padding:20px">Preview 3D indisponível neste navegador.</p>'); return; }
    vista.prepend(pv.canvas);
    const chave = [sel, ato, liberada, S.mantis.length, S.auraTusk !== false].join("|");
    if (pv.chave !== chave) { pv.chave = chave; this.previewMostrar(S, sel, ato, !liberada); } else this.previewLoop(true);
  }
  // Motor do preview: um segundo renderizador pequeno, com um mosquito próprio montado com a skin escolhida
  previewIniciar() {
    if (this.pv) return this.pv;
    const canvas = document.createElement("canvas"); let r = null;
    try { r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true }); } catch (e) { return (this.pv = { erro: true, canvas }); }
    r.setPixelRatio(Math.min(devicePixelRatio || 1, GRAFICOS[this.graficoAtual].resolucao)); r.setClearColor(0x000000, 0);
    const cena = new THREE.Scene(), cam = new THREE.PerspectiveCamera(32, 1, 0.1, 100), raiz = new THREE.Group();
    cena.add(new THREE.AmbientLight(0xbfc8ff, 0.9)); const d = new THREE.DirectionalLight(0xffffff, 1.1); d.position.set(3, 5, 4); cena.add(d);
    const d2 = new THREE.DirectionalLight(0xff9ab0, 0.5); d2.position.set(-4, 1, -3); cena.add(d2); cena.add(raiz);
    const disco = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.6, 0.08, 40), new THREE.MeshStandardMaterial({ color: 0x1b1730, roughness: 0.6, metalness: 0.4 })); disco.position.y = -1.5; cena.add(disco);
    return (this.pv = { canvas, r, cena, cam, raiz, modelo: null, t: 0, raf: 0, chave: "" });
  }
  previewMostrar(S, id, ato, bloqueada) {
    const pv = this.previewIniciar(); if (pv.erro) return;
    if (pv.modelo) { pv.raiz.remove(pv.modelo.mosquito); pv.modelo.mosquito.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) [].concat(o.material).forEach((m) => m.dispose()); }); pv.modelo = null; }
    const pe = Object.create(S); pe.skin = id; pe.mantis = id === "tusk" ? ["cabeca", "foices", "torax", "abdomen"].slice(0, Math.max(1, ato)) : S.mantis;   // estado só de preview: não altera o jogo
    const m = construirMosquito(pe); m.aplicar(); pv.modelo = m; pv.raiz.add(m.mosquito); m.mosquito.position.set(0, 0, 0); m.mosquito.rotation.set(0.25, id === "mosquito8000" ? Math.PI : 0, 0);
    if (bloqueada) m.mosquito.traverse((o) => { if (o.isLine) o.visible = false; });
    pv.cena.overrideMaterial = bloqueada ? new THREE.MeshBasicMaterial({ color: 0x0b0a14 }) : null;   // skin trancada aparece só como silhueta
    const z = m.zoom; pv.cam.position.set(0, 0.8 * z, 5.6 * Math.pow(z, 0.85)); pv.cam.lookAt(0, -0.2, 0);
    this.previewLoop(true);
  }
  previewLoop(ligar) {
    const pv = this.pv; if (!pv || pv.erro) return;
    if (!ligar) { if (pv.raf) cancelAnimationFrame(pv.raf); pv.raf = 0; pv.parado = true; return; }
    if (pv.raf && !pv.parado) return;
    pv.parado = false; let ult = performance.now();
    const f = (agora) => {
      if (pv.parado) return;
      pv.raf = requestAnimationFrame(f);
      if (!this.colecaoAberta()) { this.previewLoop(false); return; }
      const dt = Math.min(0.05, Math.max(0, (agora - ult) / 1000)); ult = agora; pv.t += dt;
      const m = pv.modelo;
      if (m) { pv.raiz.rotation.y += dt * 0.7; const b = Math.sin(pv.t * 40) * 0.55; m.asas[0].rotation.z = b; m.asas[1].rotation.z = -b; m.mosquito.position.y = Math.sin(pv.t * 2) * 0.08; m.mosquito.scale.setScalar(m.escala); m.tick(pv.t, dt); }
      const c = pv.canvas, w = c.clientWidth, h = c.clientHeight;
      if (w && h && c.width !== Math.round(w * pv.r.getPixelRatio())) { pv.r.setSize(w, h, false); pv.cam.aspect = w / h; pv.cam.updateProjectionMatrix(); }
      if (this.graficoAtual !== 'leve' || !pv.ultimoDesenho || agora - pv.ultimoDesenho >= 45) {
        pv.r.render(pv.cena, pv.cam); pv.ultimoDesenho = agora;
      }
    };
    pv.raf = requestAnimationFrame(f);
  }
  previewParar() { this.previewLoop(false); }

  // ---- Pergunta do quadro de matemática: caixa com campo de texto ----
  pergunta(titulo, enunciado, aoResponder, aoFechar) {
    if (!this.perg) {
      const e = document.createElement("div"); e.id = "hud-pergunta";
      e.style.cssText = "position:fixed;inset:0;display:none;align-items:center;justify-content:center;background:rgba(6,4,14,.85);z-index:21;font-family:Syne,Figtree,system-ui,sans-serif";
      e.innerHTML = '<div style="width:min(460px,92vw);background:#123524;border:6px solid #8a5a2e;border-radius:12px;padding:24px;color:#f4f1e6;text-align:center"><b style="font:800 1rem Syne,sans-serif;color:#ffd84d"></b><div style="font:800 2.6rem Syne,sans-serif;margin:14px 0"></div><input autocomplete="off" style="width:60%;font:800 1.6rem Syne,sans-serif;text-align:center;border-radius:8px;border:2px solid #e8e0c8;background:#0c2418;color:#fff;padding:6px"><p style="min-height:1.4em;margin:12px 0 4px;font:700 .85rem Figtree,sans-serif"></p><small style="color:#a9c9b6">Digite sua resposta</small><div class="hx-pergunta-acoes"><button type="button" data-pergunta="responder">Responder</button><button type="button" data-pergunta="fechar">Voltar</button></div></div>';
      document.body.appendChild(e); this.perg = e;
    }
    const c = this.perg.children[0].children, inp = c[2], fb = c[3];
    c[0].textContent = titulo; c[1].textContent = enunciado; inp.value = ""; fb.textContent = ""; this.perg.style.display = "flex"; document.exitPointerLock?.();
    const responder = () => {
      const r = aoResponder(inp.value); fb.textContent = r.msg; fb.style.color = r.fechar ? "#7dff9a" : "#ff9a9a";
      clearTimeout(this.perguntaT);
      if (r.fechar) this.perguntaT = setTimeout(aoFechar, 1400); else inp.select();
    };
    inp.onkeydown = (ev) => {
      if (ev.key === "Escape") { aoFechar(); return; }
      if (ev.key === "Enter") { ev.preventDefault(); responder(); }
    };
    this.perg.querySelector('[data-pergunta="responder"]').onclick = responder;
    this.perg.querySelector('[data-pergunta="fechar"]').onclick = aoFechar;
    document.exitPointerLock?.(); setTimeout(() => inp.focus(), 30);
  }
  fecharPergunta() { clearTimeout(this.perguntaT); if (this.perg) this.perg.style.display = "none"; }

  // ---- Caixa de diálogo grande (tour da escola) ----
  dialogo(titulo, texto, rodape, ms) {
    if (!this.dlg) {
      const e = document.createElement("div"); e.id = "hud-dialogo";
      e.style.cssText = "position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);width:min(580px,90vw);background:rgba(12,10,22,.96);border:1px solid rgba(255,216,77,.4);border-radius:14px;padding:20px 24px;z-index:8;color:#eef2f8;font-family:Figtree,system-ui,sans-serif;display:none";
      e.addEventListener("click", () => this.fecharDialogo()); document.body.appendChild(e); this.dlg = e;
    }
    this.dlg.innerHTML = '<b style="display:block;font:800 1.1rem Syne,sans-serif;color:#ffd84d;margin-bottom:10px"></b><div style="white-space:pre-line;font:600 .9rem/1.55 Figtree,sans-serif"></div><small style="display:block;margin-top:12px;color:#7f8798"></small>';
    this.dlg.children[0].textContent = titulo; this.dlg.children[1].textContent = texto; this.dlg.children[2].textContent = rodape || "";
    this.dlg.style.display = "block"; clearTimeout(this.dlgT); this.dlgT = setTimeout(() => this.fecharDialogo(), ms || 8000);
  }
  dialogoAberto() { return !!this.dlg && this.dlg.style.display === "block"; }
  fecharDialogo() { if (this.dlg) this.dlg.style.display = "none"; }

  // ---- Menu inicial e de pausa ----
  atalhos(aoSkins, aoConq) { $("hx-btn-skins").addEventListener("click", aoSkins); $("hx-btn-conq").addEventListener("click", aoConq); }
  exibirGraficos(modo) {
    this.graficoAtual = modo;
    const descricoes = {
      leve: 'Para celulares e PCs fracos: menos pixels, partículas e decoração distante; limite de 30 FPS.',
      medio: 'Equilíbrio entre visual e desempenho; limite de 60 FPS.',
      alto: 'Melhor imagem e efeitos completos; FPS livre.',
      ultra: 'Ultra natural: sombras reais, materiais mais definidos, luz equilibrada e bloom discreto.'
    };
    this.menuEl.querySelectorAll('[data-modo-grafico]').forEach(b => {
      const ativo = b.dataset.modoGrafico === modo;
      b.classList.toggle('ativo', ativo); b.setAttribute('aria-pressed', String(ativo));
    });
    const e = $('hx-graf-desc'); if (e) e.textContent = descricoes[modo];
  }
  menu(titulo, botao) { this.menuEl.hidden = false; $("hx-menu-titulo").textContent = titulo; $("hx-btn-jogar").textContent = botao; if (this.ultimoS) this.saveInfo(this.ultimoS); }
  esconderMenu() { this.menuEl.hidden = true; }
  exibirControles(modo) {
    this.controleAtual = modo;
    const mobile = modo === "mobile";
    document.body.classList.toggle("hx-mobile", mobile);
    this.menuEl.querySelectorAll("[data-controle]").forEach(b => {
      b.setAttribute("aria-pressed", String(b.dataset.controle === modo));
    });
    $("hx-controles-pc").hidden = mobile; $("hx-controles-mobile").hidden = !mobile;
    $("hx-controle-desc").textContent = mobile
      ? "Controles na tela. Vire o celular de lado para ampliar a visão."
      : "Jogue com mouse e teclado.";
    if (this.ultimoS) this.saveInfo(this.ultimoS);
  }
  textoControle(txt) {
    if (this.controleAtual !== "mobile" || !txt) return txt;
    return txt.replace(/Aperte E/g, "Toque em Picar").replace(/Aperte B/g, "Toque em Pegar")
      .replace(/segure F/gi, "segure Arrombar em •••").replace(/tecla Q/g, "botão Quadro em •••")
      .replace(/tecla B/g, "botão Pegar").replace(/tecla R/g, "botão Poder")
      .replace(/tecla E/g, "botão Picar").replace(/menu K/g, "menu Skins em •••")
      .replace(/K abre o menu de skins/g, "••• abre o menu de skins").replace(/\(B\)/g, "(Pegar)");
  }
  saveInfo(S) {
    const R = (b, s) => `<div><b>${b}</b><small>${s}</small></div>`;
    $("hx-resumo").innerHTML = R(S.estagio.nome, `estágio atual · nível ${S.total}`) + R(Math.floor(S.sangue).toLocaleString("pt-BR"), "sangue") + R(`${S.skins.length}/${Object.keys(CFG.SKINS).length}`, "skins") + R(`${S.conq.length}/${CFG.CONQ.length}`, "conquistas") + R(`${S.salas.length}/${CFG.SALAS.length}`, "salas visitadas") + R(S.picadas, "picadas");
    $("hx-save").textContent = S.total > 0 ? "Progresso salvo automaticamente neste navegador." : (this.controleAtual === "mobile" ? "Nova partida: toque nos cartões para evoluir e explore a escola." : "Nova partida: evolua com as teclas 1 a 4 e explore a escola.");
  }
  ligar(aoEvoluir, aoJogar) {
    this.hx.querySelectorAll("[data-up]").forEach((b) => b.addEventListener("click", () => aoEvoluir(b.dataset.up)));
    $("hx-btn-jogar").addEventListener("click", aoJogar);
    this.menuEl.querySelectorAll('[data-modo-grafico]').forEach((b) => b.addEventListener('click', () => {
      if (this.aoMudarGraficos) this.aoMudarGraficos(b.dataset.modoGrafico);
    }));
    this.menuEl.querySelectorAll("[data-controle]").forEach(b => b.addEventListener("click", () => {
      if (this.aoMudarControles) this.aoMudarControles(b.dataset.controle);
    }));
    this.exibirGraficos(this.graficoAtual);
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

// ---- Estruturas extras das skins: caminhão de som (rig) e raios elétricos ----
const cacheTex = {}, hexCss = (c) => "#" + (c >>> 0).toString(16).padStart(6, "0");
const texMeia = (base, tinta) => {   // textura dividida: u 0.25..0.75 = lado +x do corpo (esferas), coberto de tinta com escorridos
  const c = document.createElement("canvas"); c.width = 128; c.height = 64; const g = c.getContext("2d");
  g.fillStyle = hexCss(base); g.fillRect(0, 0, 128, 64); g.fillStyle = hexCss(tinta); g.fillRect(32, 0, 64, 64); g.fillRect(28, 0, 4, 22); g.fillRect(96, 0, 4, 30);
  for (let i = 0; i < 10; i++) g.fillRect(30 + Math.random() * 68, 40, 2 + Math.random() * 3, 12 + Math.random() * 22);
  g.fillStyle = "rgba(255,255,255,.22)"; g.fillRect(44, 6, 5, 40); return new THREE.CanvasTexture(c);
};
const texFaixas = () => {   // faixas diagonais vermelhas e pretas (bombeiro)
  const c = document.createElement("canvas"); c.width = 64; c.height = 64; const g = c.getContext("2d"); g.fillStyle = "#c0182a"; g.fillRect(0, 0, 64, 64); g.fillStyle = "#101010";
  for (let i = -4; i < 8; i++) { g.beginPath(); g.moveTo(i * 16, 0); g.lineTo(i * 16 + 8, 0); g.lineTo(i * 16 + 72, 64); g.lineTo(i * 16 + 64, 64); g.fill(); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
};
const rigG = new THREE.Group(); rigG.visible = false; abdomen.add(rigG);
const matLed = new THREE.MeshBasicMaterial({ color: 0xff44cc }), matCaixa = mat(0x0e0e16, { roughness: 0.55 }), matCone = mat(0x220018, { roughness: 0.4, emissive: 0xff44cc, emissiveIntensity: 0.9 });
const pec = (geo, mt, x, y, z) => { const o = new THREE.Mesh(geo, mt); o.position.set(x, y, z); rigG.add(o); return o; };
const woofers = [], sirenes = [];
pec(new THREE.BoxGeometry(1.55, 0.1, 1.75), matCaixa, 0, -0.36, 0.78);   // plataforma da carreta
for (const l of [1, -1]) {
  for (let i = 0; i < 3; i++) {   // torres de caixas com alto-falantes que pulsam
    pec(new THREE.BoxGeometry(0.36, 0.36, 0.5), matCaixa, l * 0.66, -0.16 + i * 0.38, 0.78);
    const w = pec(new THREE.CylinderGeometry(0.13, 0.13, 0.05, 16), matCone, l * 0.855, -0.16 + i * 0.38, 0.78); w.rotation.z = Math.PI / 2; woofers.push(w);
  }
  sirenes.push(pec(new THREE.SphereGeometry(0.08, 10, 8), new THREE.MeshBasicMaterial({ color: l > 0 ? 0xff2244 : 0x2266ff }), l * 0.2, 0.27, 1.62));
}
const led = pec(new THREE.BoxGeometry(0.08, 0.05, 1.5), matLed, 0, 0.2, 0.72);   // faixa de LED no dorso
pec(new THREE.BoxGeometry(0.55, 0.3, 0.7), matCaixa, 0, -0.42, -0.3); woofers.push(pec(new THREE.CylinderGeometry(0.2, 0.2, 0.05, 18), matCone, 0, -0.6, -0.3));   // subwoofer
const raiosG = new THREE.Group(); raiosG.visible = false; mosquito.add(raiosG);
const raios = [];
for (let i = 0; i < 5; i++) {
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(8 * 3), 3));
  const l = new THREE.Line(g, new THREE.LineBasicMaterial({ color: i % 2 ? 0xffffff : 0x7fdcff, transparent: true, opacity: 0.95, depthWrite: false })); l.frustumCulled = false; raiosG.add(l); raios.push(l);
}
const refazRaios = () => {   // 5 raios em zigue-zague, refeitos ~14 vezes por segundo
  for (const l of raios) {
    l.visible = Math.random() < 0.75; if (!l.visible) continue;
    const a = l.geometry.attributes.position.array, d = V(Math.random() - 0.5, Math.random() - 0.2, Math.random() - 0.5).normalize(), len = 1.1 + Math.random() * 1.3, o = V((Math.random() - 0.5) * 0.4, 0.05, (Math.random() - 0.3) * 0.9);
    for (let k = 0; k < 8; k++) { const t = k / 7, j = k && k < 7 ? 0.35 : 0; a[k * 3] = o.x + d.x * len * t + (Math.random() - 0.5) * j; a[k * 3 + 1] = o.y + d.y * len * t + (Math.random() - 0.5) * j; a[k * 3 + 2] = o.z + d.z * len * t + (Math.random() - 0.5) * j; }
    l.geometry.attributes.position.needsUpdate = true;
  }
};

const luzCorpo = new THREE.PointLight(0xffb45c, 0, 5);
mosquito.add(luzCorpo);

mosquito.position.set(0, 2, 0);

let escalaBase = 1.2, punch = 0;   // tamanho original do corpo

// ---- Skins novas: Cadeado (corrente + cadeado), Tusk (chifre, lançadores, espinhos e órbita de unhas por Ato) e Mosquito 8000 (visor, antena, propulsores) ----
const matOuroC = mat(0xd9a521, { metalness: 0.9, roughness: 0.3 }), matAcoC = mat(0x8a929e, { metalness: 0.9, roughness: 0.35 });
const cadG = new THREE.Group(), cadC = new THREE.Group(); cadG.visible = cadC.visible = false;
// Todo o conjunto do cadeado fica no mesmo grupo do abdômen: corrente e cadeado
// passam a acompanhar a escala/crescimento sem se separarem do mosquito.
abdomenCorpo.add(cadG, cadC);
for (let i = 0; i < 3; i++) { const e = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.022, 6, 12), matAcoC); e.position.set(0, -0.1 - i * 0.1, 1.05); e.rotation.y = i % 2 ? 0 : Math.PI / 2; cadG.add(e); }
{ const cc = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.26, 0.12), matOuroC); cc.position.set(0, -0.5, 1.05); cadG.add(cc);
  const ar = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.03, 8, 14, Math.PI), matAcoC); ar.position.set(0, -0.37, 1.05); cadG.add(ar); }
for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2, e = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.02, 6, 10), matAcoC); e.position.set(Math.cos(a) * 0.23, Math.sin(a) * 0.21, 0.12); e.rotation.set(i % 2 ? Math.PI / 2 : 0, 0, a); cadC.add(e); }   // corrente enrolada na base do abdômen
// Tusk (JoJo parte 7): Ato 1 bichinho de orelhas-asa e corações · Ato 2 capacete, vagens e bola com estrela · Ato 3 bípede de crista e pernas de garra · Ato 4 guerreiro de saia de placas
const matRosa = mat(0xf08ab4, { roughness: 0.45 }), matRosaC = mat(0xffc0d8, { roughness: 0.4 }), matRosaE = mat(0xc2527f, { roughness: 0.5 }), matRoxo = mat(0x9a4f9a, { roughness: 0.45 });
const matAzulT = mat(0x1f2a6b, { roughness: 0.35, metalness: 0.3 }), matAzulB = mat(0x2f6fd0, { roughness: 0.4 }), matPrataT = mat(0xc8d0dc, { roughness: 0.25, metalness: 0.85 }), matVermT = mat(0xd8202e, { roughness: 0.35 });
const matEstrela = new THREE.MeshBasicMaterial({ color: 0xffd84d, side: THREE.DoubleSide }), matCoracao = new THREE.MeshBasicMaterial({ color: 0xe0202a, side: THREE.DoubleSide });
const matFolha = new THREE.MeshStandardMaterial({ color: 0xf08ab4, roughness: 0.5, side: THREE.DoubleSide }), matViseira = mat(0x15152e, { roughness: 0.3 });
const matUnha = mat(0xffe29a, { roughness: 0.2, emissive: 0xffc233, emissiveIntensity: 0.8 });
const geoEstrela = (() => { const sh = new THREE.Shape(); for (let i = 0; i < 10; i++) { const an = -Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 0.45 : 1; if (i) sh.lineTo(Math.cos(an) * r, Math.sin(an) * r); else sh.moveTo(Math.cos(an) * r, Math.sin(an) * r); } return new THREE.ShapeGeometry(sh); })();
const geoCoracao = (() => { const h = new THREE.Shape(); h.moveTo(0, -0.5); h.bezierCurveTo(-0.9, 0.1, -0.5, 0.8, 0, 0.35); h.bezierCurveTo(0.5, 0.8, 0.9, 0.1, 0, -0.5); return new THREE.ShapeGeometry(h); })();
const estrela = (r, x, y, z, ry = 0, rx = 0) => { const e = new THREE.Mesh(geoEstrela, matEstrela); e.scale.setScalar(r); e.position.set(x, y, z); e.rotation.set(rx, ry, 0); return e; };
const caixaT = (w, h, d, mt, x, y, z) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mt); o.position.set(x, y, z); return o; };
const tA = [0, 1, 2, 3].map(() => ({ c: new THREE.Group(), a: new THREE.Group() }));   // c = no corpo, a = no abdômen
tA.forEach((t) => { t.c.visible = t.a.visible = false; corpoG.add(t.c); abdomenCorpo.add(t.a); });   // a = escala junto com o estômago
{ // ATO 1: bico prateado, orelhas-asa moles, antenas onduladas, estrelas e três corações pendurados na cauda
  const g = tA[0].c, bico = new THREE.Mesh(new THREE.ConeGeometry(0.065, 0.32, 10), mat(0xb9c4d8, { roughness: 0.3, metalness: 0.5 }));
  bico.rotation.x = -Math.PI / 2 - 0.12; bico.position.set(0, -0.03, -0.5); g.add(bico);
  const fs = new THREE.Shape(); fs.moveTo(0, 0.09); fs.quadraticCurveTo(0.3, 0.27, 0.66, 0.06); fs.quadraticCurveTo(0.48, -0.04, 0.58, -0.22); fs.quadraticCurveTo(0.26, -0.1, 0, -0.1); fs.closePath();
  const geoFolha = new THREE.ShapeGeometry(fs);
  for (const l of [1, -1]) {
    const o = new THREE.Group(), f = new THREE.Mesh(geoFolha, matFolha); f.rotation.x = -Math.PI / 2; o.add(f); o.position.set(l * 0.1, 0.06, -0.25); o.scale.x = l; o.rotation.z = -0.4 * l; g.add(o);
    const pts = [V(0, 0, 0), V(0.06 * l, 0.1, 0.02), V(-0.02 * l, 0.2, 0.06), V(0.07 * l, 0.3, 0.1), V(0, 0.4, 0.16)], tb = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 18, 0.014, 6), matRosaE);
    tb.position.set(l * 0.06, 0.1, -0.26); g.add(tb);
    g.add(estrela(0.055, l * 0.178, 0.03, 0.04, l * Math.PI / 2));
  }
  g.add(estrela(0.07, 0, 0.108, -0.3, 0, -1.1));
  const h = tA[0].a;
  // Os pingentes nascem na ponta real do abdômen. Como h é filho de
  // abdomenCorpo, eles acompanham tanto a posição quanto a escala do abdômen.
  h.position.set(0, 0, 0.76);
  for (const [x, len] of [[-0.12, 0.3], [0, 0.42], [0.12, 0.3]]) {
    const ancoraX = x === 0 ? 0 : x * 0.52;
    h.add(tubo(V(ancoraX, 0.035, 0.02), V(x, -len, 0.13), 0.008, matRosaE));
    const co = new THREE.Mesh(geoCoracao, matCoracao);
    co.scale.setScalar(0.11); co.position.set(x, -len - 0.04, 0.13); h.add(co);
  }
}
{ // ATO 2: capacete com viseira, vagens azul-marinho com estrela, braços de garra e a bola vermelha com estrela
  const g = tA[1].c;
  g.add(elipsoide(0.14, 1.08, 1.05, 1.08, matRosaC, 0, 0.02, -0.27)); g.add(caixaT(0.2, 0.06, 0.05, matViseira, 0, 0.0, -0.415));
  for (const dx of [-0.07, -0.035, 0, 0.035, 0.07]) g.add(caixaT(0.008, 0.07, 0.02, matPrataT, dx, 0.0, -0.435));
  for (const l of [1, -1]) {
    const pod = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.06, 20), matAzulT); pod.rotation.z = Math.PI / 2; pod.position.set(l * 0.28, 0.2, -0.25); g.add(pod);
    g.add(estrela(0.06, l * 0.312, 0.2, -0.25, l * Math.PI / 2)); g.add(tubo(V(l * 0.09, 0.12, -0.26), V(l * 0.22, 0.2, -0.25), 0.02, matRosaE));
    const a = V(l * 0.16, -0.05, -0.08), b = V(l * 0.3, -0.12, -0.38), c = V(l * 0.22, -0.2, -0.6);
    g.add(tubo(a, b, 0.035, matRoxo)); g.add(tubo(b, c, 0.03, matRosaE)); g.add(elipsoide(0.045, 1, 1, 1, matPrataT, b.x, b.y, b.z));
    for (const d of [-0.04, 0.04]) { const ga = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.18, 6), matPrataT); ga.position.set(c.x + d, c.y - 0.03, c.z - 0.08); ga.rotation.x = -Math.PI / 2 - 0.3; g.add(ga); }
  }
  g.add(elipsoide(0.19, 1, 0.9, 1, matVermT, 0, -0.32, 0.1)); g.add(estrela(0.08, 0, -0.515, 0.1, 0, Math.PI / 2)); g.add(estrela(0.075, 0, -0.32, -0.095, Math.PI, 0));
  const fx = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.02, 6, 24), matRosaC); fx.rotation.x = Math.PI / 2; fx.position.set(0, -0.32, 0.1); g.add(fx);
}
{ // ATO 3: capacete de crista pontuda, ombros redondos com estrela, pernas finas de garra tripla e barriga azul-marinho
  const g = tA[2].c;
  g.add(elipsoide(0.135, 1.05, 1.0, 1.1, matRosa, 0, 0.03, -0.27)); g.add(caixaT(0.16, 0.05, 0.04, matViseira, 0, 0.02, -0.415));
  const crista = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.38, 4), matRosaC); crista.scale.x = 0.45; crista.position.set(0, 0.25, -0.24); crista.rotation.x = -0.25; g.add(crista);
  for (const l of [1, -1]) {
    g.add(elipsoide(0.11, 1, 1, 1, matRosaC, l * 0.25, 0.1, 0.02));
    const d = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.03, 16), matAzulT); d.rotation.z = Math.PI / 2; d.position.set(l * 0.355, 0.1, 0.02); g.add(d); g.add(estrela(0.035, l * 0.372, 0.1, 0.02, l * Math.PI / 2));
    const q = V(l * 0.1, -0.1, 0.05), j = V(l * 0.34, -0.5, 0.05), p = V(l * 0.3, -1.05, 0.05);
    g.add(tubo(q, j, 0.022, matRosa)); g.add(tubo(j, p, 0.018, matPrataT)); g.add(elipsoide(0.04, 1, 1, 1, matPrataT, j.x, j.y, j.z));
    for (const dx of [-0.04, 0, 0.04]) { const pr = new THREE.Mesh(new THREE.ConeGeometry(0.012, 0.16, 5), matPrataT); pr.rotation.x = Math.PI; pr.position.set(p.x + dx, p.y - 0.08, p.z); g.add(pr); }
  }
  tA[2].a.add(elipsoide(0.17, 0.95, 0.55, 1.9, matAzulT, 0, -0.1, 0.6));
}
{ // ATO 4: guerreiro de ombreiras largas, mãos e botas azuis e saia de placas ovais
  const g = tA[3].c;
  g.add(elipsoide(0.13, 1.05, 1.0, 1.1, matRosa, 0, 0.03, -0.27)); g.add(caixaT(0.15, 0.045, 0.04, matViseira, 0, 0.02, -0.405));
  for (const l of [1, -1]) {
    g.add(elipsoide(0.13, 1.5, 0.75, 1.2, matRosaC, l * 0.25, 0.1, 0.02)); g.add(elipsoide(0.08, 1.4, 0.7, 1.1, matRosa, l * 0.3, 0.15, 0.02));
    const o = V(l * 0.24, 0, 0.02), m = V(l * 0.36, -0.28, 0), mao = V(l * 0.36, -0.52, 0.02);
    g.add(tubo(o, m, 0.055, matRosa)); g.add(tubo(m, mao, 0.045, matRosaC)); g.add(elipsoide(0.07, 1, 1.2, 0.8, matAzulB, mao.x, mao.y - 0.04, mao.z));
    const q = V(l * 0.1, -0.12, 0.1), j = V(l * 0.18, -0.55, 0.12), p = V(l * 0.16, -0.95, 0.1);
    g.add(tubo(q, j, 0.055, matRosa)); g.add(tubo(j, p, 0.045, matRosaC)); g.add(elipsoide(0.07, 1, 0.8, 1.5, matAzulB, p.x, p.y - 0.03, p.z - 0.04));
  }
  for (let k = 0; k < 6; k++) for (const x of [-0.14, 0, 0.14]) {   // saia: placas ovais sobrepostas penduradas sob o abdômen
    const pl = elipsoide(0.085, 1, 1.6, 0.35, (k + (x ? 1 : 0)) % 2 ? matRosaC : matRosa, x, -0.14 - Math.abs(x) * 0.5, 0.1 + k * 0.16); pl.rotation.set(0.3, 0, -x * 2.5); tA[3].a.add(pl);
  }
}
const orbG = new THREE.Group(); orbG.visible = false; mosquito.add(orbG);   // Ato 4: unhas e anéis dourados girando ("rotação infinita")
for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2, n = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.24, 8), matUnha); n.position.set(Math.cos(a) * 0.95, 0.1 * Math.sin(i * 2), Math.sin(a) * 0.95); n.rotation.set(Math.PI / 2, 0, -a); orbG.add(n); }
const aneis = []; for (const rx of [0.4, -0.4]) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.012, 6, 48), mat(0xffd24a, { emissive: 0xffc233, emissiveIntensity: 1 })); r.rotation.x = Math.PI / 2 + rx; orbG.add(r); aneis.push(r); }   // "rotação infinita"
// ============================================================
// MOSQUITO 8000 V2 — robô independente, sem sobreposição do
// mosquito biológico. Cabeça, tórax, asas, patas, abdômen e bico
// compartilham articulações/pivôs e escalam junto aos upgrades.
// ============================================================
const roboG = new THREE.Group(); roboG.visible = false; mosquito.add(roboG);
const roboAbdG = new THREE.Group(); roboAbdG.visible = false; abdomen.add(roboAbdG);
const roboBico = new THREE.Group(); roboBico.visible = false; mosquito.add(roboBico);
const roboAsas = [], roboMotores = [], roboLeds = [], roboRotores = [], roboArticulacoes = [];
const roboMetal = mat(0x92a7bb, { metalness: 0.85, roughness: 0.28 });
const roboTitanio = mat(0xd2e1e8, { metalness: 0.8, roughness: 0.22 });
const roboEscuro = mat(0x1a2434, { metalness: 0.72, roughness: 0.33 });
const roboJunta = mat(0x46586c, { metalness: 0.82, roughness: 0.3 });
const roboCiano = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
const roboVermelho = new THREE.MeshBasicMaterial({ color: 0xff4177 });
const roboAsaMetal = mat(0x6a8399, { metalness: 0.8, roughness: 0.26, side: THREE.DoubleSide });
const roboAsaVidro = new THREE.MeshBasicMaterial({ color: 0x43d7f6, transparent: true, opacity: 0.32, depthWrite: false, side: THREE.DoubleSide });
const roboFogo = new THREE.MeshBasicMaterial({ color: 0x21e6ff, transparent: true, opacity: 0.8, depthWrite: false });
function rBox(par, w, h, d, material, x, y, z) {
  const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  o.position.set(x, y, z); par.add(o); return o;
}
function rBola(par, raio, material, x, y, z, detalhes = 1) {
  const o = new THREE.Mesh(new THREE.IcosahedronGeometry(raio, detalhes), material);
  o.position.set(x, y, z); par.add(o); return o;
}
function rBarra(par, a, b, raio, material) { const o = tubo(a, b, raio, material); par.add(o); return o; }
// Tórax compacto e simétrico, todo em coordenadas locais do corpo.
rBola(roboG, 0.19, roboEscuro, 0, 0.01, 0.06, 1).scale.set(0.91, 0.83, 1.48);
rBox(roboG, 0.29, 0.13, 0.38, roboMetal, 0, 0.045, 0.06);
rBox(roboG, 0.21, 0.035, 0.3, roboTitanio, 0, 0.123, 0.045);
// Manga rígida até o primeiro segmento abdominal: sem espaço vazio ao evoluir.
rBox(roboG, 0.135, 0.12, 0.24, roboJunta, 0, -0.005, 0.25);
rBox(roboG, 0.052, 0.042, 0.28, roboCiano, 0, 0.148, 0.044);
for (const lado of [-1, 1]) {
  rBox(roboG, 0.072, 0.13, 0.31, roboEscuro, lado * 0.16, 0.04, 0.055);
  rBox(roboG, 0.045, 0.028, 0.17, roboCiano, lado * 0.19, 0.119, 0.058);
  rBola(roboG, 0.045, roboJunta, lado * 0.15, 0.0, 0.01, 1);
}
// Cabeça fixada a um pescoço metálico (sem sensores soltos).
rBarra(roboG, V(0, 0.028, -0.17), V(0, 0.035, -0.33), 0.052, roboJunta);
const roboCabeca = new THREE.Group(); roboCabeca.position.set(0, 0.037, -0.35); roboG.add(roboCabeca);
rBola(roboCabeca, 0.135, roboTitanio, 0, 0, 0, 1).scale.set(1.05, 0.86, 0.93);
rBox(roboCabeca, 0.2, 0.067, 0.032, roboEscuro, 0, 0.017, -0.13);
rBox(roboCabeca, 0.157, 0.024, 0.008, roboCiano, 0, 0.032, -0.151);
for (const l of [-1, 1]) {
  rBola(roboCabeca, 0.018, roboCiano, l * 0.085, -0.016, -0.13, 1);
  rBarra(roboCabeca, V(l * 0.06, 0.1, -0.03), V(l * 0.12, 0.23, -0.075), 0.012, roboJunta);
  rBarra(roboCabeca, V(l * 0.12, 0.23, -0.075), V(l * 0.16, 0.31, -0.11), 0.008, roboMetal);
  const sensor = rBola(roboCabeca, 0.032, l > 0 ? roboVermelho : roboCiano, l * 0.16, 0.31, -0.11, 1);
  roboLeds.push(sensor);
}
// Ferrão telescópico nasce na frente do rosto. Seu pivô acompanha
// o crescimento do corpo e o comprimento acompanha a tromba.
rBox(roboBico, 0.074, 0.064, 0.13, roboEscuro, 0, 0, -0.04);
rBarra(roboBico, V(0, 0, -0.06), V(0, 0, -0.52), 0.024, roboTitanio);
rBarra(roboBico, V(0, 0, -0.15), V(0, 0, -0.47), 0.009, roboCiano);
const rPonta = new THREE.Mesh(new THREE.ConeGeometry(0.028, 0.17, 8), roboTitanio);
rPonta.rotation.x = -Math.PI / 2; rPonta.position.z = -0.58; roboBico.add(rPonta);
// Seis pernas com anca, duas barras e joelho: nenhum trecho nasce no ar.
for (const lado of [-1, 1]) {
  for (let i = 0; i < 3; i++) {
    const z = -0.135 + 0.14 * i;
    const origem = V(lado * 0.145, -0.045, z);
    const joelho = V(lado * (0.34 + 0.04 * i), -0.135 - 0.025 * i, z + (i - 1) * 0.12);
    const ponta = V(lado * (0.55 + 0.07 * i), -0.34, z + (i - 1) * 0.27);
    rBola(roboG, 0.039, roboJunta, origem.x, origem.y, origem.z, 1);
    rBarra(roboG, origem, joelho, 0.025, roboMetal);
    rBola(roboG, 0.033, roboCiano, joelho.x, joelho.y, joelho.z, 1);
    rBarra(roboG, joelho, ponta, 0.015, roboEscuro);
    rBola(roboG, 0.017, roboTitanio, ponta.x, ponta.y, ponta.z, 1);
    const g = new THREE.Group(); g.position.copy(ponta); roboG.add(g); roboArticulacoes.push(g);
    rBarra(g, V(0, 0, 0), V(lado * 0.065, -0.045, (i - 1) * 0.11), 0.012, roboJunta);
  }
}
// Abdômen único, modular e encaixado no fim do tórax. Não recebe
// acessórios circulares soltos: os dois propulsores estão embutidos.
rBox(roboAbdG, 0.17, 0.14, 0.32, roboEscuro, 0, -0.01, 0.09);
for (let i = 0; i < 5; i++) {
  const z = 0.19 + i * 0.17;
  const w = 0.26 - i * 0.027, h = 0.2 - i * 0.018;
  rBox(roboAbdG, w, h, 0.21, i % 2 === 0 ? roboMetal : roboTitanio, 0, -i * 0.009, z);
  rBox(roboAbdG, w * 0.81, 0.013, 0.12, roboCiano, 0, h * 0.51 - i * 0.009, z);
  for (const lado of [-1, 1]) rBox(roboAbdG, 0.025, h * 0.55, 0.14, roboEscuro, lado * (w * 0.52), -i * 0.009, z);
}
const propulsorZ = 1.01;
for (const lado of [-1, 1]) {
  const x = lado * 0.065;
  const fix = rBox(roboAbdG, 0.09, 0.105, 0.17, roboEscuro, x, -0.025, 0.91);
  const tuboMotor = new THREE.Mesh(new THREE.CylinderGeometry(0.047, 0.064, 0.14, 10), roboJunta);
  tuboMotor.rotation.x = Math.PI / 2; tuboMotor.position.set(x, -0.025, propulsorZ); roboAbdG.add(tuboMotor);
  const aro = new THREE.Mesh(new THREE.TorusGeometry(0.049, 0.01, 6, 12), roboCiano);
  aro.position.set(x, -0.025, propulsorZ + 0.078); roboAbdG.add(aro);
  const chama = new THREE.Mesh(new THREE.ConeGeometry(0.039, 0.17, 8), roboFogo);
  chama.rotation.x = Math.PI / 2; chama.position.set(x, -0.025, propulsorZ + 0.15); roboAbdG.add(chama);
  roboMotores.push(chama);
}
// Asas rígidas de drone: só existem dentro dos pivôs originais,
// portanto herdam o mesmo bater de asas e os upgrades.
for (let i = 0; i < asas.length; i++) {
  const lado = asas[i].userData.lado;
  const asa = new THREE.Group(); asa.visible = false; asa.scale.x = lado;
  asas[i].add(asa); roboAsas.push(asa);
  const p = new THREE.Shape();
  p.moveTo(0, 0.005); p.lineTo(0.15, -0.12); p.lineTo(0.48, -0.18);
  p.lineTo(1.05, -0.065); p.lineTo(1.17, 0.02); p.lineTo(0.83, 0.13);
  p.lineTo(0.34, 0.16); p.lineTo(0.075, 0.065); p.closePath();
  const geo = new THREE.ShapeGeometry(p);
  const placa = new THREE.Mesh(geo, roboAsaMetal); placa.rotation.x = -Math.PI / 2; asa.add(placa);
  const vidro = new THREE.Mesh(geo, roboAsaVidro); vidro.rotation.x = -Math.PI / 2; vidro.position.y = 0.012; vidro.scale.set(0.9, 0.78, 1); vidro.position.x = 0.07; asa.add(vidro);
  const borda = new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({ color: 0x00dfff }));
  borda.rotation.x = -Math.PI / 2; borda.position.y = 0.017; asa.add(borda);
  rBarra(asa, V(0, 0.02, 0.00), V(0.94, 0.02, 0.015), 0.018, roboJunta);
  rBarra(asa, V(0.29, 0.023, -0.08), V(0.74, 0.023, -0.1), 0.009, roboCiano);
  const rotor = rBox(asa, 0.15, 0.012, 0.035, roboCiano, 0.61, 0.033, 0.015);
  roboRotores.push(rotor);
}
// Mosquitão da rua: visual mais bruto, com carapaça dorsal, mandíbulas,
// ombros mais largos e espinhos no abdômen, para não parecer só uma recoloração.
const ruaG = new THREE.Group(), ruaA = new THREE.Group(); ruaG.visible = ruaA.visible = false;
corpoG.add(ruaG); abdomenCorpo.add(ruaA);
const matRuaClara = mat(0x90b534, { roughness: 0.62 }), matRuaEscura = mat(0x3e4f16, { roughness: 0.7 }), matRuaOsso = mat(0xdad2a8, { roughness: 0.45 });
ruaG.add(elipsoide(0.2, 1.35, 0.95, 1.55, matRuaEscura, 0, 0.03, -0.03));
ruaG.add(elipsoide(0.15, 1.25, 0.78, 1.18, matRuaClara, 0, 0.11, -0.05));
for (let i = 0; i < 5; i++) { const z = -0.23 + i * 0.11; const sp = new THREE.Mesh(new THREE.ConeGeometry(0.028 + i * 0.002, 0.16 + i * 0.01, 6), matRuaClara); sp.position.set(0, 0.22 + i * 0.01, z); sp.rotation.x = -0.18; ruaG.add(sp); }
for (const l of [1, -1]) {
  ruaG.add(elipsoide(0.085, 1.4, 0.8, 1.2, matRuaEscura, l * 0.23, 0.06, -0.01));
  ruaG.add(elipsoide(0.06, 1.25, 0.62, 0.82, matRuaClara, l * 0.29, 0.14, -0.02));
  const presa = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.2, 6), matRuaOsso); presa.position.set(l * 0.085, -0.085, -0.36); presa.rotation.set(Math.PI * 0.92, 0, -l * 0.36); ruaG.add(presa);
  const chifre = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.18, 6), matRuaClara); chifre.position.set(l * 0.12, 0.18, -0.21); chifre.rotation.z = -l * 0.65; ruaG.add(chifre);
}
ruaG.add(elipsoide(0.055, 1.0, 0.7, 0.55, matRuaEscura, 0, -0.06, -0.26));
for (let i = 0; i < 6; i++) {
  const z = 0.05 + i * 0.16, w = 0.17 - i * 0.012;
  ruaA.add(elipsoide(w, 1.1, 0.82, 0.8, i % 2 ? matRuaClara : matRuaEscura, 0, -0.01 - i * 0.005, z));
  if (i < 5) { const an = new THREE.Mesh(new THREE.TorusGeometry(w * 0.88, 0.013, 6, 16), matRuaOsso); an.position.set(0, -0.01 - i * 0.005, z + 0.045); ruaA.add(an); }
  if (i >= 1 && i <= 4) for (const l of [1, -1]) { const esp = new THREE.Mesh(new THREE.ConeGeometry(0.015, 0.12, 5), matRuaClara); esp.position.set(l * (w * 0.9), -0.01 - i * 0.005, z); esp.rotation.z = l > 0 ? -Math.PI / 2 : Math.PI / 2; ruaA.add(esp); }
}
// MOSQUITO ENCADERNADO V15B — modelo caderno vivo com conexões reforçadas.
// Nada fica sobreposto ao corpo organico: cabeca, torax, patas, ferrão e
// abdomen de papel usam grupos proprios e os mesmos pivôs de voo.
const encG = new THREE.Group(), encAbd = new THREE.Group(), encFerrão = new THREE.Group();
const encDetalhes = new THREE.Group(), encDetalhesAbd = new THREE.Group(), encEspiral = new THREE.Group();
const encAsas = [], encAsasDetalhes = [], encPernas = [];
encG.visible = encAbd.visible = encFerrão.visible = false;
mosquito.add(encG, encFerrão); abdomen.add(encAbd);
const encCapa = mat(0x314779, { roughness: 0.82, metalness: 0.05 });
const encBordaCapa = mat(0x1d284a, { roughness: 0.85 });
const encPapel = mat(0xfff0c9, { roughness: 0.96, side: THREE.DoubleSide });
const encPapelSombra = mat(0xdbd0b3, { roughness: 0.97, side: THREE.DoubleSide });
const encOuro = mat(0xcda961, { roughness: 0.47, metalness: 0.26 });
const encTinta = mat(0x27314c, { roughness: 0.6 });
const encMetal = mat(0xd6dce7, { roughness: 0.29, metalness: 0.74 });
const encOlho = mat(0x3b284d, { roughness: 0.22, metalness: 0.04 });
const encCiano = mat(0x72c4d3, { roughness: 0.56 });
const encNovo = (pai, w, h, d, material, x, y, z, rz = 0) => {
  const obj = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  obj.position.set(x, y, z); obj.rotation.z = rz; pai.add(obj); return obj;
};
// Torax: caderno aberto como carapaca, com paginas dobradas e lombada central.
encG.add(elipsoide(0.19, 1.22, 0.91, 1.32, encBordaCapa, 0, 0.005, -0.03));
encG.add(elipsoide(0.145, 1.28, 0.84, 1.28, encPapelSombra, 0, 0.015, -0.075));
// Cintura verdadeira: a mesma peça atravessa o final do tórax e o início do abdômen.
// Como pertence ao encG, cresce com Corpo e continua conectada nos níveis altos.
const encCintura = elipsoide(0.115, 1.13, 0.9, 1.8, encBordaCapa, 0, -0.014, 0.176);
encG.add(encCintura);
encG.add(elipsoide(0.083, 1.12, 0.82, 1.35, encPapelSombra, 0, -0.005, 0.222));
// Ligação curta, interna, unindo a base do crânio ao tórax.
encG.add(elipsoide(0.091, 1.12, 0.91, 1.36, encBordaCapa, 0, 0.01, -0.195));
encNovo(encG, 0.39, 0.055, 0.46, encBordaCapa, 0, 0.166, 0.012);
for (const l of [-1, 1]) {
  // O vinco encontra o centro; capas permanecem presas ao torax.
  encNovo(encG, 0.235, 0.038, 0.47, encCapa, l * 0.118, 0.200, 0.007, l * 0.16);
  encNovo(encG, 0.215, 0.022, 0.44, encPapel, l * 0.109, 0.229, 0.008, l * 0.16);
  encNovo(encDetalhes, 0.195, 0.012, 0.028, encOuro, l * 0.11, 0.252, -0.19);
  encNovo(encDetalhes, 0.195, 0.012, 0.025, encOuro, l * 0.11, 0.250, 0.207);
  for (let i = 0; i < 3; i++) {
    encNovo(encDetalhes, 0.125, 0.008, 0.009, encCiano,
      l * 0.125, 0.254, -0.125 + i * 0.082);
  }
}
encNovo(encG, 0.035, 0.057, 0.5, encOuro, 0, 0.215, 0.008);
const encEmblema = new THREE.Mesh(new THREE.IcosahedronGeometry(0.035, 1), encOuro);
encEmblema.position.set(0, 0.265, -0.12); encG.add(encEmblema);
encG.add(encDetalhes);
for (const l of [-1, 1]) {
  // As asas são filhas dos pivôs globais; estas bases se encontram com eles
  // em todas as escalas de Corpo, sem alterar as animações de voo.
  encG.add(tubo(V(l * 0.078, 0.105, -0.02), V(l * 0.108, 0.165, 0), 0.023, encBordaCapa));
  encG.add(elipsoide(0.041, 1.0, 0.72, 1.0, encOuro, l * 0.105, 0.15, 0));
}
// Cabeca: borda de capa, rosto de papel, olhos de tinta e marcadores de pagina.
encG.add(elipsoide(0.125, 1.13, 0.92, 0.92, encBordaCapa, 0, 0.016, -0.287));
encG.add(elipsoide(0.112, 1.03, 0.87, 0.96, encPapel, 0, 0.013, -0.305));
encNovo(encG, 0.23, 0.025, 0.12, encCapa, 0, 0.107, -0.318);
for (const l of [-1, 1]) {
  encG.add(elipsoide(0.025, 0.9, 1.03, 0.62, encOlho, l * 0.057, 0.038, -0.405));
  encG.add(elipsoide(0.008, 1, 1, 1, encPapel, l * 0.06 - 0.005, 0.049, -0.419));
  // Antenas parecem clipes de papel, mas seguem a silhueta de mosquito.
  encG.add(tubo(V(l * 0.04, 0.105, -0.32), V(l * 0.11, 0.22, -0.42), 0.008, encMetal));
  encG.add(tubo(V(l * 0.11, 0.22, -0.42), V(l * 0.175, 0.28, -0.46), 0.006, encMetal));
  encG.add(elipsoide(0.013, 1, 1, 1, encCapa, l * 0.175, 0.28, -0.46));
}
// Seis pernas: duas hastes por perna com ponta de caneta, sempre ligadas ao torax.
for (const l of [-1, 1]) {
  for (let i = 0; i < 3; i++) {
    const perna = new THREE.Group();
    perna.position.set(l * 0.15, -0.080, -0.145 + i * 0.14);
    const joelho = V(l * (0.21 + i * 0.045), -0.17 - i * 0.017, -0.15 + i * 0.13);
    const ponta = V(l * (0.42 + i * 0.080), -0.32 - i * 0.015, -0.34 + i * 0.30);
    // A anca nasce dentro do tórax; articulação redonda mascara a transição.
    perna.add(elipsoide(0.041, 1.04, 1.04, 1.04, encBordaCapa, 0, 0, 0));
    perna.add(tubo(V(0, 0, 0), joelho, 0.020, encCapa));
    perna.add(tubo(joelho, ponta, 0.012, encTinta));
    perna.add(elipsoide(0.024, 1, 1, 1, encOuro, joelho.x, joelho.y, joelho.z));
    perna.add(elipsoide(0.014, 1.25, 1.05, 1.6, encMetal, ponta.x, ponta.y, ponta.z));
    encG.add(perna); encPernas.push(perna);
  }
}
// Ferrão em formato de pena de caneta, dimensionado com o upgrade de Tromba.
encFerrão.add(tubo(V(0, 0, 0), V(0, -0.018, -0.48), 0.026, encCapa));
encFerrão.add(tubo(V(0, -0.018, -0.48), V(0, -0.035, -0.68), 0.014, encMetal));
const encBico = new THREE.Mesh(new THREE.ConeGeometry(0.033, 0.16, 7), encTinta);
encBico.rotation.x = -Math.PI / 2; encBico.position.set(0, -0.035, -0.755); encFerrão.add(encBico);
encNovo(encFerrão, 0.053, 0.048, 0.08, encOuro, 0, -0.015, -0.20);
// Abdomen-caderno: folhas em blocos conectados, capas externas e espiral
// HELICOIDAL CONTINUA no dorso. Nenhum Torus isolado: nao parece corrente.
const encCentro = new THREE.Group(); encAbd.add(encCentro, encDetalhesAbd);
for (let i = 0; i < 9; i++) {
  const z = 0.06 + i * 0.112;
  const largura = 0.34 - i * 0.025;
  const altura = 0.115 - i * 0.006;
  const yc = -i * 0.009;
  const topo = yc + altura * 0.5;
  // Profundidade 0.135 > passo 0.112: os nove segmentos se interpenetram,
  // mantendo a superfície continua mesmo depois do upgrade de Estômago.
  encNovo(encCentro, largura, altura, 0.135, encPapel, 0, yc, z);
  encNovo(encCentro, 0.022, altura + 0.018, 0.136, encCapa, -largura * 0.5 + 0.009, yc, z);
  encNovo(encCentro, 0.022, altura + 0.018, 0.136, encCapa, largura * 0.5 - 0.009, yc, z);
  // A lombada segue a curva das folhas, em vez de flutuar reta sobre a cauda.
  encNovo(encAbd, 0.102 - i * 0.005, 0.024, 0.145, encBordaCapa, 0, topo + 0.005, z);
  encNovo(encDetalhesAbd, largura * 0.65, 0.009, 0.016, encPapelSombra, 0, topo + 0.004, z - 0.037);
}
encAbd.add(encEspiral);
// Curva helicoidal usando UM tubo ininterrupto, nao argolas separadas.
function encCriarMola(voltas, segmentos, faces, raioFio) {
  const pts = [];
  for (let i = 0; i <= segmentos; i++) {
    const f = i / segmentos, a = f * Math.PI * 2 * voltas;
    // raio ligeiramente menor na ponta do abdomen, como caderno afunilado.
    const r = 0.046 - f * 0.010;
    // A altura acompanha o afinamento/curvatura dos segmentos: sem mola no ar.
    pts.push(V(Math.cos(a) * r, 0.084 - 0.095 * f + Math.sin(a) * r, 0.045 + f * 0.94));
  }
  const curva = new THREE.CatmullRomCurve3(pts);
  return new THREE.Mesh(new THREE.TubeGeometry(curva, segmentos, raioFio, faces, false), encMetal);
}
const encMolaLeve = encCriarMola(7, 100, 4, 0.011);
const encMolaAlta = encCriarMola(11, 320, 6, 0.010);
encEspiral.add(encMolaLeve, encMolaAlta);
// Furos de encadernacao em ambos os lados do espiral, como em caderno.
for (let i = 0; i < 12; i++) {
  const z = 0.064 + i * 0.079;
  const f = i / 11;
  for (const l of [-1, 1]) {
    encNovo(encDetalhesAbd, 0.013, 0.012, 0.024, encTinta,
      l * (0.082 - f * 0.018), 0.068 - 0.095 * f, z);
  }
}
// Ultima folha afunila ate o ferrão traseiro.
const encCauda = new THREE.Mesh(new THREE.ConeGeometry(0.046, 0.17, 7), encCapa);
encCauda.rotation.x = Math.PI / 2; encCauda.position.set(0, -0.080, 1.105); encAbd.add(encCauda);
// Asas de papel: folhas delineadas, vinco e pautas discretas; acompanham a animacao original.
const encFormaAsa = new THREE.Shape();
encFormaAsa.moveTo(0, 0);
encFormaAsa.bezierCurveTo(0.30, 0.16, 0.78, 0.17, 1.10, 0.04);
encFormaAsa.quadraticCurveTo(1.24, -0.04, 1.14, -0.14);
encFormaAsa.bezierCurveTo(0.79, -0.22, 0.30, -0.11, 0, 0);
encFormaAsa.closePath();
const encGeoAsa = new THREE.ShapeGeometry(encFormaAsa);
const encBordaAsa = new THREE.LineBasicMaterial({ color: 0x9a7b50 });
const encPautaAsa = new THREE.LineBasicMaterial({ color: 0x9daac0 });
for (const pivo of asas) {
  const lado = pivo.userData.lado;
  const pagina = new THREE.Group(); pagina.visible = false; pivo.add(pagina);
  const folha = new THREE.Mesh(encGeoAsa, encPapel);
  folha.rotation.x = -Math.PI / 2; folha.scale.x = lado; pagina.add(folha);
  const margem = new THREE.LineSegments(new THREE.EdgesGeometry(encGeoAsa), encBordaAsa);
  margem.rotation.x = -Math.PI / 2; margem.scale.x = lado; margem.position.y = 0.014; pagina.add(margem);
  const linhas = new THREE.Group(); pagina.add(linhas); encAsasDetalhes.push(linhas);
  for (let i = 0; i < 4; i++) {
    const a = 0.19 + i * 0.19;
    const pts = [V(lado * a, 0.022, -0.055), V(lado * (a + 0.12), 0.022, 0.015)];
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    linhas.add(new THREE.Line(geo, encPautaAsa));
  }
  const vinco = new THREE.Line(new THREE.BufferGeometry().setFromPoints([
    V(0, 0.025, 0), V(lado * 0.96, 0.025, -0.045)
  ]), encBordaAsa);
  linhas.add(vinco);
  encAsas.push(pagina);
}
const texRobo = (base, texto) => {   // placas metálicas com circuito ciano (e "8000" no abdômen)
  const c = document.createElement("canvas"); c.width = 128; c.height = 64; const g = c.getContext("2d");
  g.fillStyle = hexCss(base); g.fillRect(0, 0, 128, 64); g.strokeStyle = "rgba(20,30,50,.55)"; g.lineWidth = 1;
  for (let x = 0; x <= 128; x += 16) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 64); g.stroke(); } for (let y = 0; y <= 64; y += 16) { g.beginPath(); g.moveTo(0, y); g.lineTo(128, y); g.stroke(); }
  g.strokeStyle = "#00e5ff"; g.lineWidth = 2; g.beginPath(); g.moveTo(0, 46); g.lineTo(30, 46); g.lineTo(40, 36); g.lineTo(88, 36); g.lineTo(98, 46); g.lineTo(128, 46); g.stroke();
  if (texto) { g.fillStyle = "#00e5ff"; g.font = "bold 20px monospace"; g.textAlign = "center"; g.fillText(texto, 64, 24); }
  return new THREE.CanvasTexture(c);
};
const medir = (cs, comp, c, ab) => Math.max(0.1 * cs + 1.1 * comp, 0.33 * cs + 0.75 * c, 0.3 * cs + 1.1 * ab, 0.85 * cs);
const RAIO_BASE = medir(1, 1, 1, 1);
// ============================================================
// SKIN PIXELADA REAL: geometria 100% voxel, com cubos e bordas
// ortogonais. Os meshes são INSTANCIADOS por cor: blocos custam
// poucos draw calls e rodam também no preview das skins.
// ============================================================
const voxelGeo = new THREE.BoxGeometry(1, 1, 1);
const pxCorpo = new THREE.Group(); mosquito.add(pxCorpo);
const pxAbdomen = new THREE.Group(); abdomen.add(pxAbdomen);
const pxTromba = new THREE.Group(); trompa.add(pxTromba);
const pxAsas = [], pxPernas = [], pxTintas = [];
const pxBloco = (a, x, y, z, sx, sy, sz, cor) => a.push({ x, y, z, sx, sy, sz, cor });

function pxEmpacotar(lista) {
  const g = new THREE.Group(), lotes = new Map();
  for (const b of lista) {
    if (!lotes.has(b.cor)) lotes.set(b.cor, []);
    lotes.get(b.cor).push(b);
  }
  const dummy = new THREE.Object3D();
  for (const [cor, blocos] of lotes) {
    const neon = cor === 0x39ff66 || cor === 0xffe27a || cor === 0xff527c;
    const m = new THREE.MeshLambertMaterial({
      color: cor, emissive: neon ? cor : 0x000000,
      emissiveIntensity: neon ? 0.20 : 0
    });
    pxTintas.push({ m, cor, neon });   // grupos separados para colorir sem recriar cubos
    const inst = new THREE.InstancedMesh(voxelGeo, m, blocos.length);
    for (let i = 0; i < blocos.length; i++) {
      const b = blocos[i];
      dummy.position.set(b.x, b.y, b.z);
      dummy.scale.set(b.sx, b.sy, b.sz);
      dummy.updateMatrix(); inst.setMatrixAt(i, dummy.matrix);
    }
    inst.instanceMatrix.needsUpdate = true;
    // Não depender da caixa de colisão de apenas um cubo para o culling.
    inst.frustumCulled = false;
    g.add(inst);
  }
  return g;
}

function pxVolume(a, cx, cy, cz, rx, ry, rz, passo, cores) {
  const nx = Math.ceil(rx / passo), ny = Math.ceil(ry / passo), nz = Math.ceil(rz / passo);
  for (let ix = -nx; ix <= nx; ix++) for (let iy = -ny; iy <= ny; iy++) for (let iz = -nz; iz <= nz; iz++) {
    const x = ix * passo, y = iy * passo, z = iz * passo;
    if ((x * x) / (rx * rx) + (y * y) / (ry * ry) + (z * z) / (rz * rz) > 1.12) continue;
    const cor = y > 0.08 ? cores[0] : Math.abs(x) > rx * 0.68 ? cores[2] : cores[1];
    pxBloco(a, cx + x, cy + y, cz + z, passo * 1.025, passo * 1.025, passo * 1.025, cor);
  }
}

function pxLinha(a, pontos, passo, cor, pontaCor = cor) {
  const usados = new Set();
  for (let j = 1; j < pontos.length; j++) {
    const de = pontos[j - 1], ate = pontos[j], delta = ate.clone().sub(de);
    const n = Math.max(1, Math.ceil(delta.length() / (passo * 0.58)));
    for (let i = 0; i <= n; i++) {
      const p = de.clone().addScaledVector(delta, i / n);
      const ix = Math.round(p.x / passo), iy = Math.round(p.y / passo), iz = Math.round(p.z / passo);
      const k = ix + ',' + iy + ',' + iz;
      if (usados.has(k)) continue;
      usados.add(k);
      pxBloco(a, ix * passo, iy * passo, iz * passo, passo * 1.05, passo * 1.05, passo * 1.05,
        j === pontos.length - 1 && i > n * 0.8 ? pontaCor : cor);
    }
  }
}

// Tórax e cabeça cúbicos, olhos quadrados e antenas serrilhadas.
{
  const b = [];
  pxVolume(b, 0, 0, 0.045, 0.225, 0.175, 0.265, 0.07, [0x786de3, 0x5144a7, 0x282661]);
  pxVolume(b, 0, 0.045, -0.278, 0.157, 0.137, 0.153, 0.055, [0x8d86fc, 0x6155ce, 0x332d82]);
  // Quadrados que avançam na direção -Z: nenhum olho é uma esfera.
  for (const l of [-1, 1]) {
    pxBloco(b, l * 0.075, 0.075, -0.442, 0.071, 0.075, 0.035, 0x101023);
    pxBloco(b, l * 0.069, 0.084, -0.465, 0.028, 0.030, 0.014, 0x39ff66);
    pxLinha(b, [V(l * 0.09, 0.155, -0.32), V(l * 0.13, 0.24, -0.39), V(l * 0.185, 0.32, -0.46)], 0.045, 0x2a205f, 0x39ff66);
  }
  pxBloco(b, 0, -0.078, -0.45, 0.055, 0.04, 0.045, 0xff527c); // base da tromba
  pxBloco(b, 0, 0.185, -0.006, 0.07, 0.035, 0.27, 0x39ff66);   // faixa dorsal de pixels
  pxCorpo.add(pxEmpacotar(b));
}

// Pernas com trajetórias em degraus, conectadas ao tórax pixelado.
for (const l of [-1, 1]) {
  const caminhos = [
    [[0.14, -0.07, -0.13], [0.31, -0.15, -0.25], [0.57, -0.38, -0.48]],
    [[0.16, -0.07,  0.015], [0.40, -0.19, 0.00], [0.74, -0.40, 0.015]],
    [[0.14, -0.07,  0.16], [0.35, -0.15, 0.32], [0.70, -0.38, 0.56]]
  ];
  for (const caminho of caminhos) {
    const p = new THREE.Group();
    p.position.set(l * caminho[0][0], caminho[0][1], caminho[0][2]);
    const base = V(...[0, 0, 0]);
    const pts = [base, ...caminho.slice(1).map((q) => V(l * (q[0] - caminho[0][0]), q[1] - caminho[0][1], q[2] - caminho[0][2]))];
    const dados = [];
    pxLinha(dados, pts, 0.05, 0x252247, 0x39ff66);
    p.add(pxEmpacotar(dados)); pxCorpo.add(p); pxPernas.push(p);
  }
}

// Abdômen com segmentos quadrados contínuos e faixas de cor, sem esferas.
{
  const b = [], p = 0.071;
  for (let iz = 0; iz <= 14; iz++) {
    const z = 0.035 + iz * p, t = iz / 14;
    const rx = 0.165 * (1 - 0.52 * Math.pow(t, 1.6));
    const ry = 0.15 * (1 - 0.50 * Math.pow(t, 1.6));
    const y = -0.08 * t * t;
    const nx = Math.ceil(rx / p), ny = Math.ceil(ry / p);
    for (let ix = -nx; ix <= nx; ix++) for (let iy = -ny; iy <= ny; iy++) {
      const x = ix * p, dy = iy * p;
      if ((x * x) / (rx * rx) + (dy * dy) / (ry * ry) > 1.14) continue;
      const cor = iz % 4 === 0 ? 0xffd56a : iy > 0 ? 0xff527c : (Math.abs(ix) > 1 ? 0x8c205a : 0xc33269);
      pxBloco(b, x, y + dy, z, p * 1.025, p * 1.025, p * 1.025, cor);
    }
  }
  pxAbdomen.add(pxEmpacotar(b));
}

// Tromba em degraus cúbicos (cresce com o upgrade de tromba).
{
  const b = [];
  for (let i = 0; i < 15; i++) {
    const z = -0.05 - i * 0.048;
    pxBloco(b, 0, -0.015 - Math.floor(i / 5) * 0.014, z,
      i < 5 ? 0.067 : 0.047, i < 5 ? 0.065 : 0.047, 0.051,
      i > 12 ? 0x39ff66 : i % 4 === 0 ? 0x9f8aff : 0x252247);
  }
  pxTromba.add(pxEmpacotar(b));
}

// Duas asas em pixel art: plaquinhas em degraus, nunca curvas suaves.
for (let wing = 0; wing < 2; wing++) {
  const lado = asas[wing].userData.lado, b = [];
  const faixas = [1, 1, 2, 2, 3, 3, 3, 3, 2, 2, 1, 1];
  for (let i = 0; i < faixas.length; i++) {
    const largura = faixas[i];
    for (let j = -largura; j <= largura; j++) {
      const borda = Math.abs(j) === largura;
      const cor = borda ? 0x3883be : (j === 0 ? 0x39ff66 : (i + j) % 3 === 0 ? 0xffffff : 0xa9eaff);
      pxBloco(b, lado * (0.05 + i * 0.085), 0, j * 0.074,
        0.084, 0.034, 0.073, cor);
    }
  }
  const g = pxEmpacotar(b); g.visible = false;
  asas[wing].add(g); pxAsas.push(g);
}

// Personalização: recolore materiais já existentes (sem alterar geometria nem criar draw calls).
let corPixelAplicada = null;
function aplicarCorPixel() {
  const hex = corPixelValida(S.pixelCor) ? S.pixelCor.toLowerCase() : COR_PIXEL_PADRAO;
  if (hex === corPixelAplicada) return;
  corPixelAplicada = hex;
  const base = new THREE.Color(hex), branca = new THREE.Color(0xffffff);
  const tom = (f) => base.clone().multiplyScalar(f);
  const claro = (f) => base.clone().lerp(branca, f);
  const hsl = {}; base.getHSL(hsl);
  const destaque = new THREE.Color().setHSL((hsl.h + 0.37) % 1, 0.92, 0.62);
  const paleta = new Map([
    [0x786de3, tom(0.82)], [0x5144a7, tom(0.55)], [0x282661, tom(0.27)],
    [0x8d86fc, tom(1.0)], [0x6155ce, tom(0.72)], [0x332d82, tom(0.38)],
    [0x2a205f, tom(0.32)], [0x9f8aff, claro(0.24)], [0x252247, tom(0.22)],
    [0xff527c, claro(0.14)], [0x8c205a, tom(0.46)], [0xc33269, tom(0.76)],
    [0x39ff66, destaque], [0x3883be, tom(0.66)], [0xa9eaff, claro(0.54)]
  ]);
  for (const { m, cor, neon } of pxTintas) {
    const final = hex === COR_PIXEL_PADRAO ? new THREE.Color(cor) : (paleta.get(cor) || new THREE.Color(cor));
    m.color.copy(final);
    if (neon) m.emissive.copy(final);
  }
}

let zoom = 1;   // tamanho atual relativo ao inicial (a câmera usa isto)
// Guarda a transição da habilidade na instância do mosquito (não afeta o preview).
let invisFantasmaAnterior = null, luzFantasmaBase = 0, brilhoOlhoFantasmaBase = 0;

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
  ponta.visible = tr >= 2 && S.skin !== "pixel"; laminas.visible = tr >= 5;

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
  luzCorpo.color.setHex(est.cor); luzCorpo.intensity = Math.min(n * 0.12, 1.6) + Math.max(0, idx - 9) * 0.4;

  // SKIN (easter egg): sobrescreve cores e materiais, sem mudar tamanhos
  // Restaura os materiais compartilhados ao trocar de skin (inclusive depois do Fantasma).
  for (const m of [matCorpo, matAbd, matPerna, matPale, matOlho, matBrilho, matEspinho, matOuro]) {
    m.transparent = false; m.opacity = 1; m.depthWrite = true;
  }
  matVeia.transparent = true; matVeia.opacity = 0.55; matVeia.depthWrite = true;
  matBordaAsa.transparent = false; matBordaAsa.opacity = 1; matBordaAsa.depthWrite = true;
  matBrilho.emissiveIntensity = 1.3; matOuro.emissiveIntensity = 0.6;
  matCorpo.opacity = matAbd.opacity = matPerna.opacity = 1;
  // Asas semitransparentes nas skins normais: não herdar aspecto sólido do robô.
  matAsa.transparent = true; matAsa.depthWrite = true; matAsa.opacity = Math.min(0.65, 0.4 + a * 0.03);
  matCorpo.metalness = matAbd.metalness = 0; matCorpo.roughness = matAbd.roughness = 0.5;
  matPerna.metalness = 0; matPerna.roughness = 0.55; matPerna.color.setHex(0x0b0b0e);
  matAsa.metalness = 0; matAsa.roughness = 0.2;
  if (!S.skin) matCorpo.color.setHex(0x1c1c22);
  const sk0 = S.skin && CFG.SKINS[S.skin], sk = sk0 && sk0.tusk ? { ...sk0, ...CFG.TUSK[Math.max(0, S.mantis.length - 1)].visual } : sk0;   // Tusk: visual muda a cada Ato
  if (sk) {
    matCorpo.color.setHex(sk.corpo); matAbd.color.setHex(sk.abd); matPerna.color.setHex(sk.perna ?? sk.corpo);
    matCorpo.emissive.setHex(sk.brilho); matCorpo.emissiveIntensity = sk.ei;
    matAbd.emissive.setHex(sk.brilho); matAbd.emissiveIntensity = sk.ei;
    matOlho.emissive.setHex(sk.olho ?? sk.brilho); matBordaAsa.color.setHex(sk.brilho);
    luzCorpo.color.setHex(sk.brilho); luzCorpo.intensity = Math.max(luzCorpo.intensity, 0.6);
    if (sk.asa) matAsa.color.setHex(sk.asa);
    if (sk.metal) { matCorpo.metalness = 0.7; matCorpo.roughness = 0.25; }
    if (sk.alfa) {
      // Estado normal da V16C: apenas corpo/abdômen/pernas translúcidos (35%).
      // Olhos, nervuras, detalhes e asas preservam o visual original fora da habilidade.
      for (const m of [matCorpo, matAbd, matPerna]) {
        m.transparent = true; m.opacity = sk.alfa; m.depthWrite = true;
      }
      luzFantasmaBase = luzCorpo.intensity;
      brilhoOlhoFantasmaBase = matOlho.emissiveIntensity;
    }
  }
  invisFantasmaAnterior = null; // evolução/troca de skin redefine todos os materiais
  // SKIN PIXEL: troca TODA a silhueta do mosquito por cubos 3D.
  // As outras skins seguem com a geometria original, sem modificação.
  const px = !!(sk && sk.pixel), robo = !!(sk && sk.robo), enc = !!(sk && sk.livro);
  corpoG.visible = !(px || robo || enc);
  abdomenCorpo.visible = !(px || robo || enc);
  hasteGrupo.visible = !(px || enc);
  trompa.visible = !(robo || enc);
  pxCorpo.visible = px;
  if (px) aplicarCorPixel();
  pxAbdomen.visible = px;
  pxTromba.visible = px;
  for (let i = 0; i < asas.length; i++) {
    asas[i].children[0].visible = !(px || robo || enc); // sem sobreposição nas asas especiais
    pxAsas[i].visible = px;
    encAsas[i].visible = enc;
  }
  pxCorpo.scale.setScalar(cs);
  pxAbdomen.scale.set(abx, abx, abz);
  pxTromba.scale.set(1 + (e - 1) * 0.35, 1 + (e - 1) * 0.35, c);
  matCorpo.map = matAbd.map = matPerna.map = matAsa.map = null;
  // DENGUE: listras brancas no abdômen, joelhos brancos e a "lira" prateada no tórax
  const lis = !!(sk && sk.listras);
  matPale.color.setHex(lis ? 0xffffff : 0xe8e2d6); matPale.emissive.setHex(lis ? 0x777777 : 0x000000);
  matAbd.map = lis ? texListras() : matAbd.map; matPerna.map = lis ? texListras(true) : matPerna.map;
  if (lis) { matAbd.color.setHex(0xffffff); matPerna.color.setHex(0xffffff); matCorpo.map = texLira(); matCorpo.color.setHex(0xffffff); }
  for (const mm of [matCorpo, matAbd, matPerna, matPale, matOlho, matBrilho, matEspinho, matOuro, matAsa, matVeia, matBordaAsa]) mm.needsUpdate = true;
  // Skins com visual próprio: meio pintado, faixas de bombeiro, caminhão de som e raios
  if (sk && sk.meia) { const kc = sk.corpo + "-" + sk.meia; matCorpo.map = cacheTex[kc] = cacheTex[kc] || texMeia(sk.corpo, sk.meia); matAbd.map = cacheTex[kc + "a"] = cacheTex[kc + "a"] || texMeia(sk.abd, sk.meia); matCorpo.color.setHex(0xffffff); matAbd.color.setHex(0xffffff); }
  if (sk && sk.faixas) { matAbd.map = cacheTex.faixas = cacheTex.faixas || texFaixas(); matAbd.color.setHex(0xffffff); }
  rigG.visible = !!(sk && sk.rig); raiosG.visible = !!(sk && sk.raios);
  cadG.visible = cadC.visible = !!(sk && sk.cadeado);
  encG.visible = encAbd.visible = encFerrão.visible = enc;
  if (enc) {
    encG.scale.setScalar(cs);
    // O abdômen normal começa em 0.30 * Corpo; isso separava as peças do
    // Encadernado ao subir os níveis. O modelo próprio usa uma ancoragem mais
    // curta, dentro da cintura, preservando a escala do Estômago.
    abdomen.position.z = 0.18 * cs;
    encAbd.scale.set(abx, abx, abz);
    encFerrão.position.set(0, -0.035 * cs, -0.34 * cs);
    encFerrão.scale.set(1 + (e - 1) * 0.15, 1 + (e - 1) * 0.15, c);
    // O Leve mantem a espiral reconhecivel com geometria reduzida.
    const simplificado = lerGraficos() === 'leve';
    encMolaLeve.visible = simplificado;
    encMolaAlta.visible = !simplificado;
    encDetalhes.visible = encDetalhesAbd.visible = !simplificado;
    encAsasDetalhes.forEach(g => { g.visible = !simplificado; });
    luzCorpo.intensity = Math.min(luzCorpo.intensity, 0.15);
  }
  ruaG.visible = ruaA.visible = !!(sk && sk.rua);
  if (sk && sk.rua) {
    matCorpo.roughness = 0.72; matAbd.roughness = 0.68; matPerna.roughness = 0.74;
    matCorpo.metalness = matAbd.metalness = 0.02;
    matAsa.color.setHex(sk.asa || 0xcfe98c); matAsa.opacity = 0.58; matAsa.transparent = true;
    matBordaAsa.color.setHex(0x9cd73d);
  }
  { const ato = sk && sk.tusk ? Math.max(1, S.mantis.length) : 0;   // Tusk: cada Ato mostra o seu próprio visual; o Ato 4 ganha a órbita dourada
    tA.forEach((t, i) => { t.c.visible = t.a.visible = ato === i + 1; }); orbG.visible = ato >= 4 && S.auraTusk !== false; olhos.forEach((o) => { o.visible = ato < 2; }); }
  roboG.visible = roboAbdG.visible = roboBico.visible = robo;
  roboAsas.forEach((g) => { g.visible = robo; });
  if (robo) {
    roboG.scale.setScalar(cs);
    const larguraAbdRobo = Math.max(abx, 0.72 * cs);
    roboAbdG.scale.set(larguraAbdRobo, larguraAbdRobo, abz);
    roboBico.position.set(0, 0.028 * cs, -0.48 * cs);
    roboBico.scale.set(1 + (e - 1) * 0.18, 1 + (e - 1) * 0.18, c);
    // A parte metálica possui seu próprio modelo, sem a malha orgânica sob ele.
    luzCorpo.color.setHex(0x00e5ff);
    luzCorpo.intensity = Math.max(luzCorpo.intensity, 1.1);
  }
  matCorpo.needsUpdate = matAbd.needsUpdate = true;

  zoom = medir(cs, comp, c, abz) / RAIO_BASE;
  // A orbita do Tusk Ato 4 nao e parte do corpoG: acompanha todas as
  // evolucoes independentes (corpo, asas, tromba e estomago) sem entrar na malha.
  // O raio base de 0.95 e convertido para o maior alcance visivel do modelo.
  const raioCorpo = 0.78 * cs;
  const raioAbdomen = 0.48 * abx + 0.45 * abz;
  const raioAsa = 0.35 + 0.42 * comp + 0.3 * larg;
  const raioTromba = 0.38 * cs + 0.8 * c;
  const raioOrbita = Math.max(1.22, raioCorpo, raioAbdomen, raioAsa, raioTromba) + 0.32;
  orbG.scale.setScalar(raioOrbita / 0.95);
  orbG.position.set(0, 0, 0);

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
function texListras(fino) {
  return texCanvas(fino ? "lis-f" : "lis", 64, 64, (g, w, h) => { g.fillStyle = "#121212"; g.fillRect(0, 0, w, h); g.fillStyle = "#f4f4f4"; const n = fino ? 6 : 7; for (let i = 0; i < n; i++) g.fillRect(0, (i + 0.65) * h / n, w, h / n * (fino ? 0.3 : 0.22)); });
}
function texLira() {
  return texCanvas("lira", 128, 64, (g, w, h) => { g.fillStyle = "#121212"; g.fillRect(0, 0, w, h); g.strokeStyle = "#f4f4f4"; g.lineWidth = 4;
    g.beginPath(); g.moveTo(52, 6); g.quadraticCurveTo(30, 32, 50, 58); g.moveTo(76, 6); g.quadraticCurveTo(98, 32, 78, 58); g.moveTo(60, 14); g.lineTo(60, 52); g.moveTo(68, 14); g.lineTo(68, 52); g.stroke(); });
}

// Animação das skins (chamada todo frame)
let rayT = 0, beatV = 0, tPrev = 0;
function tickSkin(t, _dt, invisAtiva = false) {
  const dt = Math.min(0.05, Math.max(0, t - tPrev)); tPrev = t;
  const sk = S.skin && CFG.SKINS[S.skin];
  if (sk && sk.alfa) {
    const ativa = !!invisAtiva;
    if (invisFantasmaAnterior !== ativa) {
      invisFantasmaAnterior = ativa;
      // Materiais extras só ficam transparentes durante os seis segundos da habilidade.
      for (const m of [matPale, matOlho, matBrilho, matEspinho, matOuro]) {
        m.transparent = ativa; m.depthWrite = !ativa; m.needsUpdate = true;
      }
      for (const m of [matCorpo, matAbd, matPerna]) {
        m.transparent = true; m.depthWrite = !ativa; m.needsUpdate = true;
      }
      matAsa.transparent = true; matAsa.depthWrite = !ativa;
      matVeia.depthWrite = !ativa;
      matBordaAsa.transparent = ativa; matBordaAsa.depthWrite = !ativa;
      for (const m of [matAsa, matVeia, matBordaAsa]) m.needsUpdate = true;
    }
    // Fora da habilidade: mesma opacidade pulsante da V16C (35% + oscilação).
    // Invisibilidade ativa: 11% no corpo; olhos, asas e detalhes também desaparecem.
    const op = ativa ? Math.max(0.08, 0.11 + 0.012 * Math.sin(t * 2)) : sk.alfa + 0.1 * Math.sin(t * 3);
    matCorpo.opacity = matAbd.opacity = matPerna.opacity = op;
    for (const m of [matPale, matOlho, matBrilho, matEspinho, matOuro]) m.opacity = ativa ? op * 0.8 : 1;
    matAsa.opacity = ativa ? 0.085 : Math.min(0.65, 0.4 + S.nv.asas * 0.03);
    matVeia.opacity = ativa ? 0.09 : 0.55;
    matBordaAsa.opacity = ativa ? 0.13 : 1;
    matCorpo.emissiveIntensity = matAbd.emissiveIntensity = ativa ? 0.025 : sk.ei;
    matOlho.emissiveIntensity = ativa ? 0.035 : brilhoOlhoFantasmaBase;
    matBrilho.emissiveIntensity = ativa ? 0.05 : 1.3;
    matOuro.emissiveIntensity = ativa ? 0.05 : 0.6;
    luzCorpo.intensity = ativa ? 0 : luzFantasmaBase;
  } else {
    invisFantasmaAnterior = null;
  }
  if (sk && sk.tusk && orbG.visible) { orbG.rotation.y += dt * 3.2; aneis[0].rotation.z += dt * 2; aneis[1].rotation.z -= dt * 2.6; }
  if (sk && sk.robo) {
    const pulso = 0.5 + 0.5 * Math.sin(t * 7.0);
    for (let i = 0; i < roboMotores.length; i++) {
      const chama = roboMotores[i];
      chama.scale.y = 0.7 + 0.28 * pulso + 0.12 * Math.sin(t * 17 + i);
      chama.material.opacity = 0.58 + 0.24 * pulso;
    }
    roboRotores.forEach((r, i) => { r.rotation.y = Math.sin(t * 25 + i * Math.PI) * 0.35; });
    roboLeds.forEach((led, i) => { led.scale.setScalar(0.95 + 0.08 * (0.5 + 0.5 * Math.sin(t * 7 + i))); });
    // As articulações flexionam pouco, sem soltar os membros.
    roboArticulacoes.forEach((g, i) => { g.rotation.z = Math.sin(t * 6 + i * 1.1) * 0.12; });
    luzCorpo.intensity = 1.0 + 0.55 * pulso;
  }
  if (S.skin === 'encadernado') {
    // Oscilacao discreta das pernas/canetas, sem soltar as articulacoes.
    encPernas.forEach((p, i) => {
      p.rotation.x = Math.sin(t * 7 + i * 1.37) * 0.045;
      p.rotation.z = Math.sin(t * 6.3 + i * 1.74) * 0.025;
    });
  }
  if (S.skin === "pixel") {
    for (let i = 0; i < pxPernas.length; i++) {
      pxPernas[i].rotation.x = Math.sin(t * 6 + i * 1.5) * 0.075;
      pxPernas[i].rotation.z = Math.sin(t * 7 + i * 1.2) * 0.055;
    }
    return;
  }
  if (sk && sk.raios) { rayT -= dt; if (rayT <= 0) { rayT = 0.07; refazRaios(); } luzCorpo.intensity = 0.6 + Math.random() * 1.8; }
  if (sk && sk.rig) {   // batida do som: alto-falantes pulsam, LED muda de cor, sirenes alternam
    beatV = Math.pow(Math.max(0, Math.sin(t * 14)), 6);
    for (const w of woofers) w.scale.setScalar(1 + beatV * 0.45);
    matLed.color.setHSL((t * 0.5) % 1, 1, 0.55); matCone.emissiveIntensity = 0.5 + beatV * 1.6; luzCorpo.intensity = 0.8 + beatV * 1.8;
    sirenes[0].visible = Math.sin(t * 9) > 0; sirenes[1].visible = Math.sin(t * 9) <= 0;
  } else beatV = 0;
}
function traseiraMundo(v) { return abdomen.localToWorld(v.set(0, 0, 1.7)); }


return { mosquito, asas, abdomen, pernas, aplicar: aplicarEvolucaoVisual, tick: tickSkin, traseira: traseiraMundo, get beat() { return beatV; },
  get escala() { return escalaBase; }, get zoom() { return zoom; }, get luzSkin() { return luzCorpo; }, get punch() { return punch; }, set punch(v) { punch = v; } };
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
    this.decoracoesPerformance = []; this.timerDecor = 0; this.ultimoAlcanceDecor = Infinity;
    this.qualidadeParticulas = 1; this.limiteParticulas = 260; this.anelsPorHabilidade = 2;
    this.alcanceHumanos = Infinity; this.alcanceGotas = Infinity;
    this.col = [];                  // { mesh, box } estáticos
    this.candidatosSombra = [];    // geometrias pequenas perto do jogador (somente Ultra)
    this.sombrasHumanos = null;
    this.perto = [];                // buffer reutilizável de malhas próximas
    this.raycaster = new THREE.Raycaster();
    this.dirs = [V(1, 0, 0), V(-1, 0, 0), V(0, 1, 0), V(0, -1, 0), V(0, 0, 1), V(0, 0, -1)];
    this.emPerigo = null; this.avisoGas = false;
    this.construirCenario(); this.criarGotas(); this.criarParticulas(); this.criarPerigos(); this.criarHumanos(); this.criarCarteira(); this.criarLivroPerdido(); this.criarPingos();
    this.efeitosHabilidade = []; this.unhasTusk = [];

  }

  // Registra malha estática: matriz congelada + AABB pré-calculada
  fixo(mesh, x, y, z, ry = 0, rx = 0) {
    mesh.position.set(x, y, z); mesh.rotation.set(rx, ry, 0);
    this.registrarSombra(mesh);
    this.cena.add(mesh); mesh.updateMatrix(); mesh.matrixAutoUpdate = false; mesh.updateMatrixWorld(true);
    this.col.push({ mesh, box: new THREE.Box3().setFromObject(mesh) });
    return mesh;
  }

  deco(mesh, x, y, z, ry = 0) {   // decoração sem colisão
    mesh.position.set(x, y, z); mesh.rotation.y = ry;
    this.registrarSombra(mesh);
    this.cena.add(mesh); mesh.updateMatrix(); mesh.matrixAutoUpdate = false;
    if (mesh.geometry) {
      if (!mesh.geometry.boundingSphere) mesh.geometry.computeBoundingSphere();
      const r = mesh.geometry.boundingSphere ? mesh.geometry.boundingSphere.radius : Infinity;
      if (r <= 4.5) this.decoracoesPerformance.push(mesh);
    }
    return mesh;
  }
  registrarSombra(mesh) {
    // Todo material opaco recebe sombra. Piso, teto e paredes grandes nao projetam:
    // o sol virtual entra pelo teto no modo Ultra, sem escurecer salas inteiras.
    if (mesh.userData.semSombraUltra) { mesh.castShadow = false; mesh.receiveShadow = false; return; }
    const mat = mesh.material, geo = mesh.geometry;
    if (!mat || !mat.isMeshStandardMaterial || mat.transparent || !geo) return;
    const p = geo.parameters || {};
    // Placas, cartazes, frisos decorativos e molduras não devem gerar nem
    // receber sombras fortes. Eles são quase planos e causavam manchas
    // artificiais nos letreiros das portas no modo Ultra.
    const superficieFina = geo.type === 'BoxGeometry' && p.width > 0 && p.height > 0 && p.depth > 0 && (
      (p.height > 2.4 && (p.width < 0.36 || p.depth < 0.36)) ||
      (p.height > 1.0 && p.width > 2.0 && p.depth < 0.52) ||
      (p.height > 1.0 && p.depth > 2.0 && p.width < 0.52) ||
      (p.height < 0.42 && p.depth < 0.4 && p.width > 2.2) ||
      (p.height < 0.42 && p.width < 0.4 && p.depth > 2.2)
    );
    if (geo.type === 'PlaneGeometry' || superficieFina) {
      mesh.castShadow = false; mesh.receiveShadow = false; return;
    }
    mesh.receiveShadow = true;
    if (geo.type !== 'BoxGeometry' || !(p.width > 0 && p.height > 0 && p.depth > 0)) return;
    if (p.width > 17 || p.height > 9 || p.depth > 17 || p.height < 0.22) return;
    if (p.width * p.depth < 0.14) return;
    this.candidatosSombra.push(mesh);
  }
  atualizarSombras(pos, ativo) {
    // Culling de casters por proximidade: reduz muito o custo do shadow map.
    const limite = 29 * 29;
    for (const mesh of this.candidatosSombra) {
      const dx = mesh.position.x - pos.x, dz = mesh.position.z - pos.z;
      mesh.castShadow = !!ativo && dx * dx + dz * dz < limite;
    }
    if (this.humanos) {
      if (!this.sombrasHumanos) {
        this.sombrasHumanos = this.humanos.map(h => {
          const malhas = [];
          h.g.traverse(o => {
            if (o.isMesh && o.material && !o.material.transparent && !o.material.isMeshBasicMaterial) {
              o.receiveShadow = true;
              malhas.push(o);
            }
          });
          return malhas;
        });
      }
      this.humanos.forEach((h, i) => {
        const perto = ativo && h.g.position.distanceToSquared(pos) < limite;
        for (const m of this.sombrasHumanos[i]) m.castShadow = !!perto;
      });
    }
  }
  atualizarDetalhesBanheiro(modo) {
    // Apenas detalhes opcionais mudam entre Leve, Normal, Alto e Ultra.
    // Bases das pias, divisórias, portas e colisões continuam ativas.
    if (this.detalhesBanheiro) this.detalhesBanheiro.visible = modo !== 'leve';
    if (this.detalhesBanheiroAvancados) this.detalhesBanheiroAvancados.visible = modo === 'alto' || modo === 'ultra';
  }
  atualizarDetalhesLouvaDeus(modo) {
    if (!this.pontos || !this.pontos.mantis) return;
    const detalhado = modo !== 'leve', completo = modo === 'alto' || modo === 'ultra';
    for (const item of this.pontos.mantis) {
      item.normal.visible = detalhado;
      item.extra.visible = completo;
    }
  }
  atualizarDecoracoes(pos, alcance, forcar = false) {
    if (alcance === Infinity) {
      if (this.ultimoAlcanceDecor !== Infinity || forcar) for (const e of this.decoracoesPerformance) e.visible = true;
    } else {
      const lim = alcance * alcance;
      for (const e of this.decoracoesPerformance) {
        const dx = e.position.x - pos.x, dy = (e.position.y - pos.y) * 0.45, dz = e.position.z - pos.z;
        e.visible = dx * dx + dy * dy + dz * dz <= lim;
      }
    }
    // Desenhar apenas NPCs próximos não interfere em movimento, detecção ou picadas.
    const rh = this.alcanceHumanos * this.alcanceHumanos;
    if (this.humanos) for (const h of this.humanos) {
      h.g.visible = rh === Infinity || h.g.position.distanceToSquared(pos) < rh;
    }
    this.ultimoAlcanceDecor = alcance;
  }

  // ESCOLA COMPLETA (140×100): corredor central, 2 salas, biblioteca, laboratório, cantina, ginásio e banheiro
  construirCenario() {
    const { MX, MZ, MN, MS, YMIN: F, YMAX } = CFG;
    const M = (c, r = 0.7, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: r, ...o }), B = (c) => new THREE.MeshBasicMaterial({ color: c });
    const tela = (w, h) => { const c = document.createElement("canvas"); c.width = w; c.height = h; return [c, c.getContext("2d")]; };
    const tex = (c) => new THREE.CanvasTexture(c);
    const caixa = (w, h, d, mt, x, y, z) => this.fixo(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mt), x, y, z);
    // Paredes, lintéis e molduras não podem gerar faixas/silhuetas no shadow-map do Ultra.
    // A marcação vem ANTES de fixo() registrar os candidatos a sombra.
    const caixaParede = (w, h, d, mt, x, y, z) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mt);
      mesh.userData.semSombraUltra = true;
      return this.fixo(mesh, x, y, z);
    };
    const dbox = (w, h, d, mt, x, y, z) => this.deco(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mt), x, y, z);
    const cil = (rt, rb, h, mt, x, y, z) => this.fixo(new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, 14), mt), x, y, z);
    const chao = (w, d, mt, x, z, dy = 0.06) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mt); p.rotation.x = -Math.PI / 2; return this.deco(p, x, F + dy, z); };
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
    // Identificação diretamente no lintel de cada porta, voltada ao corredor.
    const placa = (t, x, z, lado) => {
      const [c, g] = tela(512, 128);
      g.fillStyle = "#18334c"; g.fillRect(0, 0, 512, 128);
      g.strokeStyle = "#d7b76c"; g.lineWidth = 8; g.strokeRect(5, 5, 502, 118);
      g.fillStyle = "#ffffff"; g.font = "bold 51px sans-serif";
      g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(t, 256, 64, 485);
      // A porta tem 9.5 de altura: placa apoiada imediatamente acima dela.
      const zFace = z + (lado < 0 ? 0.72 : -0.72);
      const frente = lado < 0 ? 0 : Math.PI;
      const letreiro = this.deco(new THREE.Mesh(new THREE.PlaneGeometry(8.8, 1.7),
        new THREE.MeshBasicMaterial({ map: tex(c), side: THREE.DoubleSide, toneMapped: false,
          depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 })),
        x, F + 10.55, zFace, frente);
      letreiro.userData.semSombraUltra = true;
      letreiro.castShadow = false; letreiro.receiveShadow = false;
    };
    const m = { piso: M(0xffffff, 0.55, { map: tPiso }), par: M(0x6f8f7a, 0.9), teto: M(0xcfd3d8, 0.9), mad: M(0x8a5a2e, 0.6), metal: M(0x4a5560, 0.4), cad: M(0x2f6fb5, 0.6),
      l1: M(0x3a5f8a), l2: M(0x2e4d70), tampo: M(0xd9c7a0, 0.5), estante: M(0xffffff, 0.8, { map: tex(cb) }), mesa: M(0xc9a36a, 0.6), banco: M(0xa0522d, 0.7),
      azul: M(0xe3edf2, 0.4), porc: M(0xf4f4f4, 0.2), bancada: M(0x2d3b44, 0.4), vidro: M(0x66ffaa, 0.2, { emissive: 0x22aa66, transparent: true, opacity: 0.4 }), laranja: M(0xff7a1a, 0.5) };
    // Materiais compartilhados: o Ultra pode ajustar suas superficies sem
    // transformar as outras qualidades graficas.
    this.materiaisCenario = m;
    // Âncoras dos easter eggs: o jogo lê as posições daqui, então mover um objeto no cenário move a hitbox junto
    this.pontos = { extintores: [], aros: [V(-2.1, F + 7.6, 29), V(37.1, F + 7.6, 29)], relogio: V(9, F + 11, -MZ + 0.6),
      espelho: { x0: 45.6, x1: 51, z0: 20, z1: 82, y: F + 7.5 } };
    const cabo = (a, b, cor = 0x111111) => {   // cabo fino entre dois pontos
      const d = b.clone().sub(a), t = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, d.length(), 6), M(cor, 0.6));
      t.quaternion.setFromUnitVectors(V(0, 1, 0), d.clone().normalize()); t.position.copy(a).addScaledVector(d, 0.5);
      this.cena.add(t); t.updateMatrix(); t.matrixAutoUpdate = false;
    };
    const extintor = (x, z, destaque = false) => {   // extintor de chão; encostar nele libera a skin Bombeiro
      dbox(1.35, 0.18, 1.35, m.metal, x, F + 0.09, z);
      dbox(1.1, 2.6, 1.1, M(0xc0182a, 0.45, { metalness: 0.3 }), x, F + 1.48, z);
      dbox(0.4, 0.45, 0.4, m.metal, x, F + 3.0, z);
      this.deco(new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.5, 10), M(0x9a1420, 0.5)), x, F + 3.35, z);
      if (destaque) { const anel = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.05, 6, 24), new THREE.MeshBasicMaterial({ color: 0xff6644, transparent: true, opacity: 0.55 })); anel.rotation.x = Math.PI / 2; this.deco(anel, x, F + 0.2, z); }
      this.pontos.extintores.push(V(x, F + 1.7, z));
    };


    // Luzes: ambiente + hemisfério (cobrem as salas fundas) + poucas luzes pontuais (a do corredor pisca)
    this.luzAmbiente = new THREE.AmbientLight(0x8a8fb0, 0.85); this.cena.add(this.luzAmbiente);
    this.luzCeu = new THREE.HemisphereLight(0xdfe8ff, 0x4a4540, 0.75); this.cena.add(this.luzCeu);
    this.luzLua = new THREE.DirectionalLight(0x7692ff, 0.5); this.luzLua.position.set(-30, 30, 10); this.cena.add(this.luzLua);
    [[0, 0], [28, -54], [94, -54], [-64, 56], [17, 56], [94, 70]].forEach(([x, z], i) => {
      const l = new THREE.PointLight(0xdff0ff, i ? 1.1 : 1.6, 70); l.position.set(x, YMAX - 2, z); this.cena.add(l); if (!i) this.luz = l;
    });


    // Casca externa: piso, teto e 4 paredes
    const cy = (YMAX + F) / 2, H = YMAX - F + 4, T = 1;
    caixa(MX * 2, 2, MZ * 2, m.piso, 0, F - 1, 0); caixaParede(MX * 2 + 4, 2, MZ * 2 + 4, m.teto, 0, YMAX + 1, 0);
    caixaParede(MX * 2 + 4, H, 4, m.par, 0, cy, -MZ - 2); caixaParede(MX * 2 + 4, H, 4, m.par, 0, cy, MZ + 2);
    caixaParede(2, H, MZ * 2, m.par, -MX - 1, cy, 0); caixaParede(2, H, MZ * 2, m.par, MX + 1, cy, 0);

    // Planta: corredor central (z -8..8) com 10 portas reais; divisórias terminam nas paredes do corredor
    const parede = (eixo, fixo, ini, fim, portas = []) => {
      const altura = YMAX - F, portaH = 9.5, larg = 10;
      const seg = (a, b, h, y) => { if (b - a < 0.02 || h <= 0) return; if (eixo === "x") caixaParede(b - a, h, T, m.par, (a + b) / 2, y, fixo); else caixaParede(T, h, b - a, m.par, fixo, y, (a + b) / 2); };
      let cur = ini;
      for (const c of [...portas].sort((a, b) => a - b)) { const a = c - larg / 2, b = c + larg / 2; if (a < cur - 0.01 || b > fim + 0.01) continue; seg(cur, a, altura, cy); seg(a, b, altura - portaH, F + portaH + (altura - portaH) / 2); cur = b; }
      seg(cur, fim, altura, cy);
    };
    const PN = [-94, -49, -7, 28, 56, 94], PS = [-40, 17, 57, 94];   // artes, sala 1, sala 2, biblioteca, lab, enfermaria / cantina, ginásio, banheiro, auditório
    parede("x", -8, -MX, MX, PN); parede("x", 8, -MX, MX, PS);
    for (const x of [-70, -28, 14, 42, 71]) parede("z", x, -MZ, -8);
    for (const x of [-10, 45, 71]) parede("z", x, 8, MZ);
    const piso = (x1, x2, z1, z2, cor) => chao(x2 - x1 - 0.6, z2 - z1 - 0.6, M(cor, 0.85), (x1 + x2) / 2, (z1 + z2) / 2, 0.075);   // piso próprio de cada sala
    piso(-118, -70, -100, -8, 0xc9b99a); piso(-70, -28, -100, -8, 0xb9ad8f); piso(-28, 14, -100, -8, 0xa7b5a6); piso(14, 42, -100, -8, 0x34425f);
    piso(42, 71, -100, -8, 0xdde6ea); piso(71, 118, -100, -8, 0xc6dbd7); piso(71, 118, 8, 100, 0x4a1f30);
    for (const [x, z] of [...PN.map((x) => [x, -8]), ...PS.map((x) => [x, 8])]) for (const dx of [-5.2, 5.2]) caixaParede(0.28, 9.5, 0.34, m.metal, x + dx, F + 4.75, z);   // batentes sem sombra no Ultra
    ["ARTES", "SALA 1", "SALA 2", "BIBLIOTECA", "LABORATÓRIO", "ENFERMARIA"].forEach((t, i) => placa(t, PN[i], -8, -1));
    ["CANTINA", "GINÁSIO", "BANHEIRO", "AUDITÓRIO"].forEach((t, i) => placa(t, PS[i], 8, 1));

    // Corredor: portas sempre voltadas para o CENTRO do corredor.
    // O norte (z negativo) olha para +Z; o sul (z positivo) olha para -Z.
    // Colisores nao precisam ser desenhados e funcionam em todos os modos graficos.
    const geoColArmario = new THREE.BoxGeometry(3.42, 7, 1.16);
    const matColArmario = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });
    const armarioCorredor = (x, z, corpoMat, portaMat) => {
      const g = new THREE.Group();
      g.position.set(x, F, z);
      g.rotation.y = z > 0 ? Math.PI : 0;
      this.cena.add(g);
      const colArmario = new THREE.Mesh(geoColArmario, matColArmario);
      colArmario.position.set(x, F + 3.5, z);
      colArmario.updateMatrixWorld(true);
      // Collider sem adicao a cena: nao acrescenta chamadas de desenho no modo Leve.
      this.col.push({ mesh: colArmario, box: new THREE.Box3().setFromObject(colArmario) });
      const corpo = new THREE.Mesh(new THREE.BoxGeometry(3.4, 7, 1.08), corpoMat); corpo.position.set(0, 3.5, 0); g.add(corpo);
      const base = new THREE.Mesh(new THREE.BoxGeometry(3.46, 0.18, 1.14), M(0x334254, 0.55)); base.position.set(0, 0.09, 0); g.add(base);
      // A tampa antiga terminava em Y=7.00 exatamente como o casco,
      // provocando Z-FIGHTING na face superior. A nova tampa ultrapassa o
      // casco sem dividir plano com ele (superficie superior Y=7.12).
      const teto = new THREE.Mesh(new THREE.BoxGeometry(3.54, 0.16, 1.20),
        M(0x94a9c9, 0.52, { metalness: 0.18 }));
      teto.position.set(0, 7.04, 0); g.add(teto);
      for (const l of [-1, 1]) {
        const porta = new THREE.Mesh(new THREE.BoxGeometry(1.53, 6.55, 0.08), portaMat); porta.position.set(l * 0.79, 3.54, 0.57); g.add(porta);
        for (const yy of [5.55, 4.95, 4.35]) {
          const vent = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.06, 0.03), M(0x354b68, 0.65)); vent.position.set(l * 0.79, yy, 0.62); g.add(vent);
        }
        const pux = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.92, 0.08), M(0xd8e1ef, 0.18, { metalness: 0.88 })); pux.position.set(l * 0.40, 3.55, 0.63); g.add(pux);
        const fecho = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.16, 0.08), M(0x223347, 0.45)); fecho.position.set(l * 0.40, 2.95, 0.63); g.add(fecho);
        const plaqueta = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.22, 0.03), M(0xf3f8ff, 0.12)); plaqueta.position.set(l * 0.79, 1.12, 0.61); g.add(plaqueta);
      }
      const coluna = M(0x3d536f, 0.55, { metalness: 0.28 });
      for (const sx of [-1.63, 1.63]) { const c = new THREE.Mesh(new THREE.BoxGeometry(0.1, 6.9, 0.16), coluna); c.position.set(sx, 3.45, 0); g.add(c); }
      const divisao = new THREE.Mesh(new THREE.BoxGeometry(0.08, 6.75, 0.1), M(0x58718f, 0.52)); divisao.position.set(0, 3.46, 0.54); g.add(divisao);
      return g;
    };
    for (let x = -MX + 5; x <= MX - 5; x += 5) {
      const livre = (portas) => portas.every((p) => Math.abs(x - p) >= 8.5);
      if (livre(PN) && x !== -23) armarioCorredor(x, -6.85, M(0x7089aa, 0.55, { metalness: 0.16 }), M(0x87a0c2, 0.42, { metalness: 0.08 }));   // x = -23: armário trancado (easter egg)
      if (livre(PS)) armarioCorredor(x, 6.85, M(0x58729a, 0.56, { metalness: 0.18 }), M(0x7090bf, 0.42, { metalness: 0.08 }));
    }
    janela(-MX + 0.05, 0, Math.PI / 2); janela(MX - 0.05, 0, -Math.PI / 2);
    for (let x = -110; x <= 110; x += 20) dbox(14, 0.3, 1.6, B(0xeaf6ff), x, YMAX - 0.15, 0);

    // ARMÁRIO TRANCADO (easter egg Mosquito Cadeado): arrombe segurando F; a posição fica em this.armario
    { const X = -23, Z = -6.85, ouro = M(0xd9a521, 0.3, { metalness: 0.9 }), aco = M(0x8a929e, 0.35, { metalness: 0.9 });
      caixa(3.4, 7, 1.1, M(0x4a2222, 0.55), X, F + 3.5, Z);
      const pivo = new THREE.Group(); pivo.position.set(X - 1.65, F + 3.5, Z + 0.6); this.cena.add(pivo);   // dobradiça na borda esquerda
      const porta = new THREE.Mesh(new THREE.BoxGeometry(3.3, 6.8, 0.14), M(0x7a3030, 0.45, { emissive: 0x3a0808, emissiveIntensity: 0.6 })); porta.position.x = 1.65; pivo.add(porta);
      for (const dy of [-1.6, -0.8, 0, 0.8, 1.6]) { const v = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.12, 0.05), M(0x2a1010, 0.7)); v.position.set(1.65, dy + 1.2, 0.08); pivo.add(v); }
      this.deco(new THREE.Mesh(new THREE.PlaneGeometry(3.1, 6.6), B(0x6b5a1a)), X, F + 3.5, Z + 0.58);   // interior dourado, visto quando a porta abre
      const cad = new THREE.Group(); cad.position.set(X + 0.2, F + 3.4, Z + 0.78); this.cena.add(cad);
      cad.add(new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.55, 0.28), ouro));
      const arco = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.06, 8, 16, Math.PI), aco); arco.position.y = 0.27; cad.add(arco);
      const led = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), new THREE.MeshBasicMaterial({ color: 0xff2222 })); led.position.set(0, 0, 0.15); cad.add(led);
      for (let i = 0; i < 4; i++) { const e = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.05, 6, 12), aco); e.position.set(i < 2 ? -0.5 - i * 0.4 : 0.5 + (i - 2) * 0.4, 0, 0.02); e.rotation.y = i % 2 ? 0 : Math.PI / 2; cad.add(e); }   // corrente
      this.armario = { pivo, cad, led, pos: V(X, F + 3.4, Z + 1.3), prog: 0, aberto: false, vy: 0 };
    }


    // ARTES (x -118..-70): mesas de pintura, cavaletes com telas e a POÇA DE TINTA VERMELHA (easter egg)
    { const cx = -94, tintas = [0xe0202a, 0x2a6fe0, 0xf2c200, 0x2fb34a, 0x8a3fc0, 0xff7a1a];
      const tela2 = (k) => { const [c, g] = tela(128, 128); g.fillStyle = `hsl(${(k * 67) % 360},45%,82%)`; g.fillRect(0, 0, 128, 128);
        for (let i = 0; i < 7; i++) { g.fillStyle = `hsl(${(k * 67 + i * 51) % 360},75%,50%)`; g.beginPath(); g.arc(20 + ((i * 53 + k * 29) % 90), 20 + ((i * 37 + k * 17) % 90), 10 + ((i * 11) % 22), 0, 7); g.fill(); } return new THREE.MeshBasicMaterial({ map: tex(c) }); };
      for (const z of [-86, -72, -46]) for (const dx of [-14, 14]) {
        caixa(11, 0.5, 4.5, m.tampo, cx + dx, F + 3.2, z); for (const l of [-1, 1]) caixa(0.4, 3, 4, m.mad, cx + dx + l * 5, F + 1.5, z);
        for (let i = 0; i < 4; i++) this.deco(new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.6, 10), M(tintas[(i + Math.abs(z)) % 6], 0.3)), cx + dx - 3.6 + i * 2.4, F + 3.75, z);
        for (const l of [-1, 1]) caixa(2.2, 1.9, 2.2, m.cad, cx + dx + l * 3, F + 0.95, z + 3.6);   // banquinhos
      }
      [-108, -94, -80].forEach((x, i) => { caixa(4.4, 5.2, 0.3, M(0xe8e0d0, 0.8), x, F + 6.2, -94); caixa(0.3, 6, 0.3, m.mad, x - 1.6, F + 3, -92.6); caixa(0.3, 6, 0.3, m.mad, x + 1.6, F + 3, -92.6);
        this.deco(new THREE.Mesh(new THREE.PlaneGeometry(3.8, 4.6), tela2(i + 2)), x, F + 6.2, -93.82); });
      for (const z of [-40, -70]) this.deco(new THREE.Mesh(new THREE.PlaneGeometry(9, 5), tela2(z)), -MX + 0.1, F + 8, z, Math.PI / 2);
      // poça de tinta: balde tombado, respingos e rastro
      const P = this.pontos.tinta = V(-94, F + 0.1, -60), tinta = M(0xd01020, 0.18, { emissive: 0x400008, emissiveIntensity: 0.6 });
      const poca = new THREE.Mesh(new THREE.CircleGeometry(3.2, 40), tinta); poca.rotation.x = -Math.PI / 2; this.deco(poca, P.x, P.y, P.z);
      for (const [dx, dz, r] of [[3.6, 1, 0.9], [-3.2, 2.2, 0.7], [1.5, -3.6, 0.8], [-1.8, -3.4, 0.55], [4.4, -1.4, 0.45]]) { const s = new THREE.Mesh(new THREE.CircleGeometry(r, 20), tinta); s.rotation.x = -Math.PI / 2; this.deco(s, P.x + dx, P.y + 0.002, P.z + dz); }
      const balde = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 0.85, 1.7, 16, 1, true), M(0xd9d9d9, 0.4, { metalness: 0.5, side: THREE.DoubleSide }));
      balde.rotation.z = Math.PI / 2; this.deco(balde, P.x + 4.6, F + 0.95, P.z + 0.6, 0.4);
      this.deco(new THREE.Mesh(new THREE.CircleGeometry(1.0, 16), tinta), P.x + 3.78, F + 0.95, P.z + 0.6, 0.4 + Math.PI / 2);
      const goteira = new THREE.PointLight(0xff2030, 0.6, 12); goteira.position.set(P.x, F + 2.5, P.z); this.cena.add(goteira);
      janela(-MX + 0.05, -30, Math.PI / 2);
    }


    // Salas de aula: quadro no fundo, mesa do professor logo à frente e 15 carteiras em 5 fileiras
    // Carteira escolar com tampo, gaveta, estrutura tubular e cadeira independente.
    // Tudo é posicionado na mesma referência local (x,z); sem peças suspensas.
    const carteira = (x, z) => {
      const metal = M(0x505967, 0.33, { metalness: 0.67 });
      const escuro = M(0x252f40, 0.5, { metalness: 0.32 });
      const madeira = M(0xc18a57, 0.64);
      const madeiraBorda = M(0x82532f, 0.68);
      const plastico = M(0x385d80, 0.56);
      const parafuso = M(0xbfc6d2, 0.24, { metalness: 0.85 });
      // Mesa na metade frontal do conjunto; superfície 3D arredondada nos cantos.
      const t = new THREE.Mesh(new THREE.BoxGeometry(5.25, 0.32, 2.9), madeira);
      this.fixo(t, x, F + 3.05, z - 0.15);
      dbox(5.25, 0.11, 0.14, madeiraBorda, x, F + 2.87, z + 1.22);
      dbox(5.25, 0.11, 0.14, madeiraBorda, x, F + 2.87, z - 1.52);
      // Quatro pés reais: sempre conectados ao tampo.
      for (const l of [-1, 1]) for (const fz of [-1.16, 1.0]) {
        caixa(0.25, 2.86, 0.25, metal, x + l * 2.30, F + 1.43, z + fz);
        dbox(0.36, 0.13, 0.36, escuro, x + l * 2.30, F + 0.065, z + fz);
        dbox(0.13, 0.045, 0.13, parafuso, x + l * 2.30, F + 3.25, z + fz);
      }
      // Gaveta/porta-livros abaixo do tampo, presa por laterais e uma travessa.
      dbox(4.25, 0.14, 2.2, metal, x, F + 2.25, z - 0.15);
      for (const l of [-1, 1]) dbox(0.15, 0.58, 2.2, metal, x + l * 2.05, F + 2.52, z - 0.15);
      dbox(4.0, 0.37, 0.12, madeiraBorda, x, F + 2.52, z - 1.23);
      // Cadeira: assento, quatro pés, encosto e dois suportes de conexão.
      const cz = z + 3.17;
      caixa(3.3, 0.27, 2.35, plastico, x, F + 1.98, cz);
      for (const l of [-1, 1]) for (const dz of [-0.82, 0.82]) {
        caixa(0.22, 1.90, 0.22, metal, x + l * 1.37, F + 0.95, cz + dz);
        dbox(0.31, 0.10, 0.31, escuro, x + l * 1.37, F + 0.05, cz + dz);
      }
      // Prolongamento traseiro até o encosto (sem buraco entre as peças).
      for (const l of [-1, 1]) caixa(0.22, 2.52, 0.22, metal, x + l * 1.37, F + 3.13, cz + 0.82);
      caixa(3.24, 1.55, 0.28, plastico, x, F + 3.56, cz + 0.82);
      dbox(3.05, 0.08, 0.13, madeira, x, F + 4.33, cz + 0.70);
    };
    const sala = (cx, q) => {
      dbox(29, 9.2, 0.25, m.mad, cx, F + 8, -MZ + 0.45); caixa(28, 8.2, 0.3, q, cx, F + 8, -MZ + 0.75); caixa(26, 0.35, 0.7, m.mad, cx, F + 3.4, -MZ + 1.1);
      caixa(11, 0.55, 4.2, m.mad, cx, F + 3.2, -90); for (const l of [-1, 1]) caixa(0.4, 2.9, 3.7, m.mad, cx + l * 4.7, F + 1.45, -90);
      for (const dx of [-10, 0, 10]) for (const z of [-78, -66, -54, -42, -30]) carteira(cx + dx, z);
    };
    this.pontos.quadroMat = V(-49, F + 8, -MZ + 1);   // quadro interativo: aperte Q perto dele
    sala(-49, quadro("Matemática", "2 + 2 = ?")); sala(-7, quadro("Aula de Biologia", "Hoje: o ciclo do mosquito 🦟"));
    caixa(2.2, 7.5, 12, m.mad, -67.2, F + 3.75, -60);   // armário de materiais da Sala 1
    { const vidro = M(0x9ce5e8, 0.15, { transparent: true, opacity: 0.32, side: THREE.DoubleSide });   // Biologia: terrários (leste), aquários e microscópios (oeste)
      for (const z of [-90, -76]) {
        caixa(4, 3.2, 4, m.mad, 11.3, F + 1.6, z); caixa(3.7, 3.2, 3.6, vidro, 11.3, F + 4.8, z); caixa(3.6, 0.5, 3.5, M(0x346b47), 11.3, F + 3.5, z);
        for (const dz of [-1, 1]) cil(0.22, 0.4, 2, M(0x348a42), 11.3, F + 5, z + dz);
        caixa(3.6, 3, 3.6, m.metal, -25.6, F + 1.5, z); caixa(3.4, 3, 3.2, vidro, -25.6, F + 4.5, z); caixa(3.3, 1.4, 3.1, M(0x2279b8, 0.25, { transparent: true, opacity: 0.65 }), -25.6, F + 4.0, z);
        for (const dz of [-0.9, 0.9]) this.deco(new THREE.Mesh(new THREE.SphereGeometry(0.3, 10, 8), M(0xffaa33)), -25.6, F + 4.1, z + dz);
      }
      caixa(4, 2.9, 15, m.metal, -25.2, F + 1.45, -52); caixa(4.4, 0.45, 16, m.tampo, -25.2, F + 3.1, -52);
      for (const z of [-58, -52, -46]) { cil(0.5, 0.5, 0.25, m.metal, -25.2, F + 3.45, z); cil(0.16, 0.16, 1.7, m.metal, -25.2, F + 4.3, z); }
    }


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
    // Biblioteca (x 14..42): estantes mais ricas, livros separados, mesas de leitura e balcão
    {
      const madeira = M(0x6b4a2a, 0.82), escuro = M(0x43301d, 0.86), metal = M(0x5d6678, 0.38, { metalness: 0.42 });
      const capa = [0xb33652, 0x2f6cc3, 0x3da45d, 0xe0ab2f, 0x7f53b5, 0xe0783c, 0xd7d8df, 0x5b4030];
      this.estantesLivros = [];
      const estanteLivros = (x, z, rot = 0) => {
        const g = new THREE.Group(); g.position.set(x, F, z); g.rotation.y = rot; this.cena.add(g);
        const lateralMat = madeira, prateleiraMat = escuro, fundoMat = M(0x7b5a38, 0.9);
        const W = 14.2, H = 9.4, D = 2.45;
        const add = (w, h, d, mt, px, py, pz) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mt); o.position.set(px, py, pz); g.add(o); return o; };
        // Estrutura aberta: frente e costas acessíveis, lados ficam nas pontas compridas da estante.
        add(W, 0.3, D, escuro, 0, 0.15, 0); // base
        add(W, 0.24, D, lateralMat, 0, H - 0.12, 0); // topo
        add(0.26, H, D, lateralMat, -W * 0.5 + 0.13, H * 0.5, 0);
        add(0.26, H, D, lateralMat,  W * 0.5 - 0.13, H * 0.5, 0);
        add(W - 0.34, H - 0.5, 0.12, fundoMat, 0, H * 0.5 - 0.05, -D * 0.5 + 0.06); // costas finas
        for (const sx of [-W * 0.25, 0, W * 0.25]) add(0.12, H - 0.36, D - 0.24, lateralMat, sx, H * 0.5 - 0.02, 0);
        const prateleiras = [1.75, 3.5, 5.25, 7.0];
        for (const y of prateleiras) add(W - 0.28, 0.16, D - 0.1, prateleiraMat, 0, y, 0);
        // Livro por livro, porém em instâncias agrupadas: o Leve desenha menos,
        // o Ultra desenha prateleiras cheias, com pouquíssimos draw calls extras.
        const livrosVisuais = new THREE.Group(); g.add(livrosVisuais);
        this.estantesLivros.push({ grupo: g, livrosVisuais, x, z, devolucao: x === 18 && z === -30 });
        const escada = new THREE.Mesh(new THREE.BoxGeometry(0.26, 6.8, 0.32), metal); escada.position.set(W * 0.5 + 0.46, 3.4, 0.55); escada.rotation.z = -0.15; g.add(escada);
        // Colisão: corpo inteiro da estante bloqueia o jogador em todos os modos.
        const invisivel = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0 });
        this.fixo(new THREE.Mesh(new THREE.BoxGeometry(W + 0.12, H, D + 0.12), invisivel), x, F + H * 0.5, z, rot);
        return g;
      };
      let estanteDaDevolucao = null;
      for (const x of [18, 38]) for (const z of [-90, -70, -50, -30]) {
        // Os dois lados da biblioteca devem abrir para o corredor central.
        const g = estanteLivros(x, z, x === 18 ? Math.PI / 2 : -Math.PI / 2);
        if (x === 18 && z === -30) estanteDaDevolucao = g;
      }
      // Atualiza a densidade dos livros ao trocar a qualidade, sem mudar colisões.
      const geoLivroBib = new THREE.BoxGeometry(1, 1, 1);
      const matLivrosBib = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.74 });
      const matFaixaBib = M(0xe9dac2, 0.72);
      const coresLivrosBib = capa.map(c => new THREE.Color(c));
      this.ajustarLivrosBiblioteca = (modo) => {
        if (this.modoLivrosBiblioteca === modo) return;
        const colunas = modo === 'leve' ? 15 : modo === 'medio' ? 22 : modo === 'alto' ? 29 : 34;
        const linhas = (modo === 'leve' || modo === 'medio') ? 1 : 2;
        const matriz = new THREE.Object3D();
        this.estantesLivros.forEach(({ livrosVisuais, devolucao }, nEstante) => {
          // Os objetos anteriores são removidos; geometria e materiais são compartilhados.
          while (livrosVisuais.children.length) livrosVisuais.remove(livrosVisuais.children[0]);
          const modelos = [];
          let id = 0;
          for (const base of [0.28, 1.75, 3.5, 5.25, 7.0]) {
            for (let linha = 0; linha < linhas; linha++) {
              const pz = linhas === 1 ? 0.46 : (linha === 0 ? -0.38 : 0.55);
              for (let i = 0; i < colunas; i++) {
                const px = -6.46 + i * (12.92 / Math.max(1, colunas - 1));
                // Deixa um nicho real, vazio, na frente da estante de devolução.
                if (devolucao && base === 3.5 && linha === linhas - 1 && Math.abs(px - 0.95) < 0.83) continue;
                const alt = 1.02 + ((i * 3 + linha + nEstante) % 5) * 0.105;
                const esp = linhas === 1 ? 0.36 : 0.34;
                const largura = Math.min(0.49, 12.8 / colunas * 0.83);
                modelos.push({ px, py: base + 0.15 + alt / 2, pz, w: largura, h: alt, d: esp,
                                ang: ((i + nEstante) % 9 === 0) ? -0.055 : 0, cor: coresLivrosBib[(i + linha * 3 + nEstante * 2 + id) % coresLivrosBib.length] });
                id++;
              }
            }
          }
          if (!modelos.length) return;
          const livros = new THREE.InstancedMesh(geoLivroBib, matLivrosBib, modelos.length);
          const linhasDouradas = new THREE.InstancedMesh(geoLivroBib, matFaixaBib, modelos.length);
          modelos.forEach((b, i) => {
            matriz.position.set(b.px, b.py, b.pz); matriz.rotation.set(0, 0, b.ang);
            matriz.scale.set(b.w, b.h, b.d); matriz.updateMatrix(); livros.setMatrixAt(i, matriz.matrix);
            livros.setColorAt(i, b.cor);
            matriz.position.z = b.pz + b.d * 0.5 + 0.013;
            matriz.scale.set(b.w * 0.75, b.h * 0.08, 0.012);
            matriz.updateMatrix(); linhasDouradas.setMatrixAt(i, matriz.matrix);
          });
          livros.instanceMatrix.needsUpdate = true;
          if (livros.instanceColor) livros.instanceColor.needsUpdate = true;
          linhasDouradas.instanceMatrix.needsUpdate = true;
          livros.frustumCulled = false; linhasDouradas.frustumCulled = false;
          livros.castShadow = modo === 'ultra';
          livrosVisuais.add(livros, linhasDouradas);
        });
        this.modoLivrosBiblioteca = modo;
      };
      this.ajustarLivrosBiblioteca(lerGraficos());
      for (const z of [-84, -60, -36]) {
        caixa(8.6, 0.42, 5.2, m.mad, 28, F + 3.15, z);
        dbox(8.8, 0.08, 5.4, M(0xf0e4ca, 0.82), 28, F + 3.42, z);
        for (const l of [-1, 1]) caixa(0.45, 3.0, 4.6, m.mad, 28 + l * 3.35, F + 1.5, z);
        for (const l of [-1, 1]) {
          caixa(8.0, 0.32, 1.35, M(0xc47a4a, 0.7), 28, F + 1.72, z + l * 3.42);
          for (const dx of [-3.1, 3.1]) caixa(0.38, 1.55, 1.1, m.metal, 28 + dx, F + 0.78, z + l * 3.42);
        }
      }
      caixa(7.5, 3.2, 2.9, m.mad, 37, F + 1.6, -17); caixa(7.8, 0.28, 3.1, M(0xe2d7bf, 0.8), 37, F + 3.32, -17);
      for (const dx of [-2.6, 0, 2.6]) this.deco(new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.2, 0.55), M(capa[(dx + 10) % capa.length | 0], 0.72)), 37 + dx, F + 4.1, -17);
      // O ponto de devolução fica DENTRO DA ESTANTE, nunca no chão.
      // Mesma orientação da estante esquerda; sua frente aponta para o corredor.
      const slot = new THREE.Group();
      estanteDaDevolucao.updateMatrixWorld(true);
      slot.position.copy(estanteDaDevolucao.localToWorld(V(0.95, 4.26, 1.23)));
      slot.rotation.y = Math.PI / 2;
      const geomNicho = new THREE.BoxGeometry(0.70, 1.20, 0.095);
      const contorno = new THREE.LineSegments(new THREE.EdgesGeometry(geomNicho),
        new THREE.LineBasicMaterial({ color: 0x59f0ff, transparent: true, opacity: 0.9, depthTest: true }));
      slot.add(contorno);
      const miolo = new THREE.Mesh(new THREE.BoxGeometry(0.62, 1.13, 0.055),
        new THREE.MeshBasicMaterial({ color: 0x4be2ef, transparent: true, opacity: 0.14, depthWrite: false }));
      slot.add(miolo);
      const marca = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.035, 0.11),
        new THREE.MeshBasicMaterial({ color: 0xc9faff }));
      marca.position.y = -0.69; slot.add(marca);
      slot.visible = false;
      this.cena.add(slot); this.livroDevolucaoHalo = slot;
      // Livro azul ocupa a lacuna depois da devolução (inclusive após carregar save).
      const devolvido = new THREE.Group();
      // Capa fica encaixada para dentro da estante, não flutuando na frente.
      devolvido.position.copy(estanteDaDevolucao.localToWorld(V(0.95, 4.26, 0.77)));
      devolvido.rotation.y = slot.rotation.y;
      const capaLivro = new THREE.Mesh(new THREE.BoxGeometry(0.52, 1.18, 0.28), M(0x305d9c, 0.74)); devolvido.add(capaLivro);
      const faixaLivro = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.065, 0.03), M(0xd9c36a, 0.54));
      faixaLivro.position.set(0, 0.25, 0.16); devolvido.add(faixaLivro);
      devolvido.visible = false; this.cena.add(devolvido); this.livroDevolvidoVisual = devolvido;
    }


    // Laboratório (x 42..71): bancadas com frascos, galão radioativo e o PROJETO DE ELETRICIDADE (easter egg)
    for (const z of [-92, -82, -50, -40, -30, -20]) {
      caixa(20, 0.8, 5, m.bancada, 56, F + 3.6, z); caixa(19, 3.2, 4.4, m.metal, 56, F + 1.6, z);
      for (let i = 0; i < 4; i++) this.deco(new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.8, 1.4, 12), M([0x66ffaa, 0xff6688, 0x66ccff, 0xffe066][i], 0.2, { emissive: [0x22aa66, 0xaa2244, 0x2266aa, 0xaa9922][i], emissiveIntensity: 0.6 })), 49 + i * 4.5, F + 4.7, z);
    }
    { const TP = this.pontos.tomada = V(42.9, F + 4.2, -66);
      caixa(4.5, 0.8, 12, m.bancada, 46.5, F + 3.6, -66); caixa(4, 3.2, 11.4, m.metal, 46.5, F + 1.6, -66);
      cil(0.5, 0.9, 3.6, M(0x2a2f3a, 0.4, { metalness: 0.6 }), 46.5, F + 6.2, -69);   // bobina de Tesla
      for (const y of [0.8, 1.6, 2.4, 3.2]) { const a = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.09, 8, 24), M(0xb87333, 0.35, { metalness: 0.9 })); a.rotation.x = Math.PI / 2; this.deco(a, 46.5, F + 4.4 + y, -69); }
      this.deco(new THREE.Mesh(new THREE.SphereGeometry(0.75, 16, 12), M(0x99ddff, 0.2, { emissive: 0x44aaff, emissiveIntensity: 1.2 })), 46.5, F + 8.6, -69);
      for (const z of [-63.6, -62.6, -61.6]) dbox(0.6, 1, 0.7, M(0x222222, 0.5), 46.5, F + 4.5, z);   // pilhas
      this.deco(new THREE.Mesh(new THREE.SphereGeometry(0.55, 14, 10), M(0xfff2a0, 0.2, { emissive: 0xffdd55, emissiveIntensity: 1 })), 46.5, F + 5.2, -65.2);
      cabo(V(46.5, F + 4.2, -63.5), V(44.8, F + 2.9, -64.8)); cabo(V(44.8, F + 2.9, -64.8), V(TP.x + 0.1, TP.y - 0.4, TP.z + 0.3));   // fio até a tomada
      dbox(0.14, 1.9, 1.5, M(0xf2f2f2, 0.4), 42.58, TP.y, TP.z);                                    // espelho da tomada
      for (const dz of [-0.35, 0.35]) dbox(0.16, 0.55, 0.12, M(0x080808, 0.5), 42.62, TP.y, TP.z + dz);   // furos
      { const [cs, gs] = tela(256, 96); gs.fillStyle = "#f2c200"; gs.fillRect(0, 0, 256, 96); gs.fillStyle = "#111"; gs.font = "bold 34px sans-serif"; gs.textAlign = "center"; gs.fillText("⚡ ALTA TENSÃO", 128, 42); gs.font = "bold 20px sans-serif"; gs.fillText("projeto: ELETRICIDADE", 128, 74);
        this.deco(new THREE.Mesh(new THREE.PlaneGeometry(4.6, 1.7), new THREE.MeshBasicMaterial({ map: tex(cs) })), 42.57, F + 7.2, TP.z, Math.PI / 2); }
      this.luzTomada = new THREE.PointLight(0x66ccff, 1, 14); this.luzTomada.position.set(44, F + 4.5, TP.z); this.cena.add(this.luzTomada);
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
      const tambor = cil(2.4, 2.4, 5.6, M(0xffffff, 0.5, { map: tex(cz), metalness: 0.3 }), 65, F + 2.8, -67);
      for (const y of [0.4, 2.8, 5.2]) { const a = new THREE.Mesh(new THREE.TorusGeometry(2.42, 0.1, 8, 40), M(0x8a7a20, 0.4, { metalness: 0.7 })); a.rotation.x = Math.PI / 2; this.deco(a, 65, F + y, -67); }
      const tampa = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.45, 0.25, 40), M(0x333333, 0.4, { metalness: 0.6 })); this.deco(tampa, 65, F + 5.8, -67);
      const gosma = new THREE.Mesh(new THREE.CircleGeometry(1.7, 32), new THREE.MeshBasicMaterial({ color: 0x39ff14 })); gosma.rotation.x = -Math.PI / 2; this.deco(gosma, 65, F + 5.94, -67);
      for (let i = 0; i < 5; i++) { const a = i * 1.3; const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.05, 0.9 + Math.random(), 8), new THREE.MeshBasicMaterial({ color: 0x39ff14 })); this.deco(pin, 65 + Math.cos(a) * 2.42, F + 5.3, -67 + Math.sin(a) * 2.42); }
      const poca = new THREE.Mesh(new THREE.CircleGeometry(3.6, 32), new THREE.MeshBasicMaterial({ color: 0x39ff14, transparent: true, opacity: 0.45 })); poca.rotation.x = -Math.PI / 2; this.deco(poca, 65, F + 0.08, -67);
      const lg = new THREE.PointLight(0x39ff14, 1.4, 14); lg.position.set(65, F + 7, -67); this.cena.add(lg); this.luzGalao = lg;
    }
    this.pontos.galao = V(65, F + 6, -67);   // o easter egg lê a posição do galão por aqui

    // Cantina: ocupa a ala sudoeste (-118..-10, z 8..100).
    // Mesas distribuídas por toda a área, deixando a entrada em (-40,8) livre.
    const pisoCantina = M(0xd8c6a5, 0.86);
    const faixaCantina = M(0xb48354, 0.85);
    // Sobreposição de piso independente, sem mexer nas paredes ou na colisão.
    chao(106, 89, pisoCantina, -64, 54);
    for (const z of [19, 89]) caixa(102, 0.045, 0.35, faixaCantina, -64, F + 0.11, z);
    for (const x of [-112, -16]) caixa(0.35, 0.045, 70, faixaCantina, x, F + 0.11, 54);
    // Conjuntos de refeição com corredores de circulação entre as mesas.
    for (const x of [-101, -78, -55, -32]) for (const z of [29, 49, 69]) {
      caixa(12, 0.5, 4.2, m.mesa, x, F + 3.3, z);
      for (const dx of [-4.8, 4.8]) caixa(0.55, 3, 3.6, m.metal, x + dx, F + 1.5, z);
      for (const l of [-1, 1]) {
        caixa(12, 0.4, 1.6, m.banco, x, F + 1.9, z + l * 3.4);
        for (const dx of [-4.7, 4.7]) caixa(0.45, 1.7, 1.2, m.metal, x + dx, F + 0.85, z + l * 3.4);
      }
    }
    // Balcão de atendimento no fundo, com bandejas e área de serviço.
    caixa(66, 4.2, 5, m.mad, -65, F + 2.1, 87);
    caixa(67, 0.35, 5.5, m.tampo, -65, F + 4.4, 87);
    for (const x of [-90, -76, -62, -48, -34]) {
      caixa(5, 0.2, 3.1, m.metal, x, F + 4.7, 87);
      caixa(4, 0.3, 2.4, m.porc, x, F + 4.95, 87);
    }
    // Revestimento quente e iluminação distribuída na profundidade da cantina.
    for (const x of [-99, -65, -31]) for (const z of [32, 61, 83]) {
            dbox(9, 0.25, 2, B(0xfff2d2), x, YMAX - 0.25, z);
    }
    { const [c, g] = tela(512, 128);
      g.fillStyle = "#713d28"; g.fillRect(0, 0, 512, 128);
      g.fillStyle = "#ffe4a1"; g.textAlign = "center"; g.textBaseline = "middle";
      g.font = "bold 68px sans-serif"; g.fillText("CANTINA", 256, 64);
      this.deco(new THREE.Mesh(new THREE.PlaneGeometry(18, 4.5),
        new THREE.MeshBasicMaterial({ map: tex(c), side: THREE.DoubleSide })),
        -65, F + 9, 99.2, Math.PI);
    }
    janela(-MX + 0.05, 30, Math.PI / 2);
    extintor(-35, 95, true);   // extintor escondido na cozinha (easter egg Bombeiro)
    caixa(4, 8, 4, m.porc, -108, F + 4, 96); caixa(6, 3.4, 3, m.metal, -100, F + 1.7, 96.5);   // geladeira e fogão

    chao(54.4, 91.4, M(0xa8683a, 0.7), 17.5, 54, 0.04);   // piso de madeira do ginásio
    // Ginásio: quadra, tabelas, arquibancada e bolas
    chao(40, 26, new THREE.MeshBasicMaterial({ map: tex(cq) }), 17.5, 29);
    for (const x of [-3.5, 38.5]) {
      cil(0.35, 0.35, 8, m.metal, x, F + 4, 29); caixa(0.3, 4, 6, m.porc, x, F + 9, 29);
      const aro = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.1, 8, 20), m.laranja); aro.rotation.x = Math.PI / 2; this.deco(aro, x + (x < 0 ? 1.4 : -1.4), F + 7.6, 29);
    }
    // Arquibancada no fundo do ginásio, após as duas quadras.
    for (let i = 0; i < 4; i++) caixa(38, 1.8 * (i + 1), 2.4, m.mad, 17.5, F + 0.9 * (i + 1), 89 + i * 2.4);
    // QUADRA DE VÔLEI V3 — os lados LONGOS estão em Z=52.5 e Z=77.5.
    // A rede liga os PONTOS MÉDIOS desses dois lados: X=17.5, Z=52.5..77.5.
    // Isso separa o comprimento X=0..35 em duas metades iguais de 17.5.
    chao(35, 25, M(0x22a6ce, 0.7), 17.5, 65);
    const linhaV = M(0xf7ffff, 0.6);
    // Contorno do retângulo: os dois lados grandes são os segmentos com 35 no eixo X.
    for (const z of [52.5, 77.5]) caixa(35, 0.035, 0.18, linhaV, 17.5, F + 0.105, z);
    for (const x of [0, 35]) caixa(0.18, 0.035, 25, linhaV, x, F + 0.105, 65);
    // Linhas centrais e de ataque paralelas à rede, todas no eixo Z.
    for (const x of [8.75, 17.5, 26.25])
      caixa(x === 17.5 ? 0.2 : 0.13, 0.035, 25, linhaV, x, F + 0.107, 65);

    const REDE_X = 17.5, Z_NORTE = 52.5, Z_SUL = 77.5;
    const Z_MIN = Z_NORTE - 0.14, Z_MAX = Z_SUL + 0.14;
    const REDE_INF = F + 1.9, REDE_SUP = F + 4.85;
    const POSTE_Z_MIN = Z_NORTE - 0.65, POSTE_Z_MAX = Z_SUL + 0.65;
    const matPoste = M(0xb1c5d8, 0.31, { metalness: 0.78 });
    const matFaixa = M(0xffffff, 0.48);
    // Dois postes nas metades dos lados mais compridos do retângulo.
    for (const zPoste of [POSTE_Z_MIN, POSTE_Z_MAX]) {
      cil(0.14, 0.17, 5.85, matPoste, REDE_X, F + 2.925, zPoste);
      dbox(0.58, 0.16, 0.58, m.metal, REDE_X, F + 0.08, zPoste);
      // Pontas de apoio ligam apenas a faixa superior aos postes.
      const pontos = [REDE_X, REDE_SUP, zPoste < 65 ? Z_MIN : Z_MAX,
                      REDE_X, REDE_SUP, zPoste];
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(pontos, 3));
      this.cena.add(new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0xf3f6ff })));
    }
    // REDE VERTICAL EM X CONSTANTE — SEM rotação, SEM coordenada Y/Z trocada.
    // Todas as linhas de malha vivem no plano X=17.5, em paralelo aos lados curtos.
    const geometriaRede = new THREE.BufferGeometry(), verticesRede = [];
    const PASSO_Z = 0.68, PASSO_Y = 0.48;
    for (let z = Z_MIN; z < Z_MAX + 0.0001; z += PASSO_Z)
      verticesRede.push(REDE_X, REDE_INF, Math.min(z, Z_MAX), REDE_X, REDE_SUP, Math.min(z, Z_MAX));
    verticesRede.push(REDE_X, REDE_INF, Z_MAX, REDE_X, REDE_SUP, Z_MAX);
    for (let y = REDE_INF; y < REDE_SUP + 0.0001; y += PASSO_Y)
      verticesRede.push(REDE_X, Math.min(y, REDE_SUP), Z_MIN, REDE_X, Math.min(y, REDE_SUP), Z_MAX);
    verticesRede.push(REDE_X, REDE_SUP, Z_MIN, REDE_X, REDE_SUP, Z_MAX);
    geometriaRede.setAttribute('position', new THREE.Float32BufferAttribute(verticesRede, 3));
    this.cena.add(new THREE.LineSegments(geometriaRede, new THREE.LineBasicMaterial({
      color: 0xe9f2ff, transparent: true, opacity: 0.88, depthWrite: false
    })));
    // Moldura desenhada no mesmo plano da malha e dos postes.
    const tamanhoRede = Z_MAX - Z_MIN;
    for (const y of [REDE_INF, REDE_SUP])
      dbox(0.13, y === REDE_SUP ? 0.18 : 0.12, tamanhoRede + 0.12,
        matFaixa, REDE_X, y, (Z_MIN + Z_MAX) / 2);
    for (const z of [Z_MIN, Z_MAX])
      dbox(0.13, REDE_SUP - REDE_INF + 0.12, 0.12,
        matFaixa, REDE_X, (REDE_SUP + REDE_INF) / 2, z);
    // Bebedouro e suporte de bolas na lateral do ginásio.
    caixa(2.5, 4.5, 2, m.metal, 40, F + 2.25, 81);
    cil(1.0, 1.0, 0.35, m.porc, 40, F + 4.7, 81);
    for (const z of [82, 85]) this.deco(new THREE.Mesh(new THREE.SphereGeometry(0.9, 14, 10), m.laranja), -5, F + 0.9, z);
    for (const [x, z] of [[10, 25], [22, 33], [30, 22]]) this.deco(new THREE.Mesh(new THREE.SphereGeometry(0.9, 14, 10), m.laranja), x, F + 0.9, z);

    // BANHEIRO V16: seis pias sustentadas por pedestais reais e oito boxes
    // com divisórias, portas, puxadores, ferragens e vasos completos.
    // Os elementos interativos e as colisões ficam iguais nos quatro modos;
    // apenas acessórios decorativos mudam de densidade.
    {
      const pisoBanheiro = M(0xc5d7df, 0.86),
        divisoria = M(0x98b5c4, 0.69), porta = M(0xc1d5de, 0.65),
        aluminio = M(0x717f91, 0.34, { metalness: 0.55 }),
        porcelana = M(0xf1f4f6, 0.47), bacia = M(0xadc8d8, 0.45),
        metalCromado = M(0xc9d2de, 0.23, { metalness: 0.80 }),
        metalEscuro = M(0x4c5f74, 0.55);
      chao(24.5, 89, pisoBanheiro, 58, 54);
      this.detalhesBanheiro = new THREE.Group();
      this.detalhesBanheiroAvancados = new THREE.Group();
      this.cena.add(this.detalhesBanheiro, this.detalhesBanheiroAvancados);
      const detalhe = (grupo, w, h, d, mt, x, y, z) => {
        const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mt);
        o.position.set(x, y, z); o.castShadow = false; o.receiveShadow = false;
        grupo.add(o); return o;
      };
      // Cada box é um espaço de 9.5 no eixo Z; x=62.65 é a frente,
      // x=70 fica próximo da parede leste. A abertura é realmente transitável.
      for (let i = 0; i < 8; i++) {
        const z = 18 + i * 10;
        caixa(7.7, 7.05, 0.23, divisoria, 66.3, F + 3.525, z - 4.72);
        if (i === 7) caixa(7.7, 7.05, 0.23, divisoria, 66.3, F + 3.525, z + 4.72);
        // Pequeno painel fixo + porta: sobra passagem central de ~3 unidades.
        caixa(0.20, 6.95, 2.25, divisoria, 62.58, F + 3.525, z - 3.48);
        caixa(0.17, 6.10, 3.48, porta, 62.58, F + 3.50, z + 2.70);
        // Travessa metálica de topo e batente.
        dbox(0.24, 0.20, 9.34, aluminio, 62.58, F + 7.0, z);
        dbox(0.20, 6.25, 0.16, metalEscuro, 62.46, F + 3.54, z + 0.88);
        dbox(0.22, 0.48, 0.14, metalCromado, 62.40, F + 3.75, z + 1.12);
        // Base, cuba, assento e caixa de descarga do vaso sanitário.
        cil(0.75, 0.65, 1.24, porcelana, 67.55, F + 0.64, z);
        cil(1.02, 0.83, 0.36, porcelana, 67.55, F + 1.42, z);
        const vaso = new THREE.Mesh(new THREE.TorusGeometry(0.81, 0.10, 8, 20), porcelana);
        vaso.rotation.x = Math.PI / 2; this.deco(vaso, 67.55, F + 1.67, z);
        const agua = new THREE.Mesh(new THREE.CircleGeometry(0.57, 20), bacia);
        agua.rotation.x = -Math.PI / 2; this.deco(agua, 67.55, F + 1.57, z);
        caixa(1.45, 1.90, 2.0, porcelana, 69.30, F + 2.44, z);
        dbox(1.53, 0.16, 2.08, porcelana, 69.30, F + 3.45, z);
        // Ferragens e cartelas com numeração, visíveis no Normal e superiores.
        detalhe(this.detalhesBanheiro, 0.13, 0.28, 0.13, metalCromado, 62.35, F + 5.88, z + 4.30);
        detalhe(this.detalhesBanheiro, 0.11, 0.14, 0.38, metalCromado, 62.35, F + 3.40, z + 1.10);
        detalhe(this.detalhesBanheiro, 0.11, 0.50, 0.11, aluminio, 62.35, F + 2.35, z + 4.30);
        // Dispensador de papel higiênico fixado na divisória, nunca flutuando.
        detalhe(this.detalhesBanheiroAvancados, 0.36, 0.55, 0.58, porcelana, 64.15, F + 2.35, z - 4.49);
        detalhe(this.detalhesBanheiroAvancados, 0.39, 0.08, 0.62, metalCromado, 64.15, F + 2.68, z - 4.49);
      }
      // Lavatórios: parede real em X=45 (face interna em 45.5). O fundo de
      // cada gabinete vai até essa face e o tampo sobrepõe alguns centímetros.
      // Nada fica suspenso nem depende de detalhes gráficos opcionais.
      for (let i = 0; i < 6; i++) {
        const z = [20, 32, 44, 56, 68, 80][i], x = 47.60;
        // Gabinete traseiro X=45.43, discretamente dentro da parede X=45.5.
        // A pequena sobreposição também evita z-fighting da face posterior.
        caixa(4.34, 3.08, 4.42, porcelana, x, F + 1.54, z);
        // Tampo traseiro X=45.32, ligeiramente maior que o gabinete.
        caixa(4.56, 0.30, 4.70, m.bancada, x, F + 3.23, z);
        // Rodabanca traseira X=45.48, conectada à parede e ao tampo.
        caixa(0.24, 0.84, 4.70, porcelana, 45.60, F + 3.79, z);
        // Cuba apoiada, torneira junto à parede e bico projetado sobre a cuba.
        cil(1.08, 0.86, 0.18, porcelana, x, F + 3.46, z);
        const fundo = new THREE.Mesh(new THREE.CircleGeometry(0.74, 24), bacia);
        fundo.rotation.x = -Math.PI / 2; this.deco(fundo, x, F + 3.558, z);
        const borda = new THREE.Mesh(new THREE.TorusGeometry(0.86, 0.055, 7, 24), porcelana);
        borda.rotation.x = Math.PI / 2; this.deco(borda, x, F + 3.575, z);
        cil(0.080, 0.080, 0.74, metalCromado, x - 1.28, F + 3.83, z - 0.45);
        dbox(0.78, 0.09, 0.12, metalCromado, x - 0.88, F + 4.13, z - 0.45);
        const dreno = new THREE.Mesh(new THREE.CircleGeometry(0.095, 12), metalEscuro);
        dreno.rotation.x = -Math.PI / 2; this.deco(dreno, x, F + 3.586, z);
        // Acessórios opcionais; não alteram o contato do gabinete com a parede.
        detalhe(this.detalhesBanheiro, 0.28, 1.1, 0.28, aluminio, x, F + 0.6, z - 0.76);
        detalhe(this.detalhesBanheiro, 0.55, 0.15, 0.13, metalCromado, x - 1.12, F + 3.96, z + 0.85);
        detalhe(this.detalhesBanheiroAvancados, 0.25, 0.20, 0.16, M(0x3bc0ba, 0.5), x - 1.1, F + 4.12, z + 0.85);
      }
      // Espelho contínuo: mesma posição original, para não quebrar a skin Fantasma.
      const espelho = this.deco(new THREE.Mesh(new THREE.PlaneGeometry(68, 5),
        new THREE.MeshBasicMaterial({ color: 0xa5c2d0, toneMapped: false })),
        45.55, F + 7.5, 51, Math.PI / 2);
      espelho.castShadow = false; espelho.receiveShadow = false;
      espelho.userData.semSombraUltra = true;
      for (const z of [16.9, 85.1]) dbox(0.12, 5.12, 0.17, metalCromado, 45.59, F + 7.5, z);
      for (const y of [F + 4.94, F + 10.06]) dbox(0.12, 0.13, 68, metalCromado, 45.59, y, 51);
      // Armário de limpeza e banco no fundo — mantidos nos mesmos locais.
      caixa(3, 8, 7, m.azul, 48.2, F + 4, 91);
      caixa(4.5, 1.6, 2.2, m.metal, 56, F + 0.8, 93);
    }

    // ENFERMARIA (x 71..118): macas mais próximas às paredes, sem painéis de vidro soltos, com armário de remédios e equipamentos
    {
      const lencol = M(0xf6f8ff, 0.76), manta = M(0x82acd9, 0.78), trav = M(0xffffff, 0.85), metal = M(0x8f98a6, 0.35, { metalness: 0.5 }), roda = M(0x232a36, 0.4), caboM = M(0x5aa0c8, 0.42);
      const maca = (x, z, lado) => {
        caixa(4.8, 0.42, 8.6, metal, x, F + 1.38, z); dbox(4.55, 0.55, 8.15, lencol, x, F + 1.92, z);
        dbox(3.55, 0.44, 1.65, trav, x, F + 2.28, z - 3.05); dbox(4.55, 0.18, 5.3, manta, x, F + 2.17, z + 1.22);
        for (const lx of [-2.05, 2.05]) for (const lz of [-3.75, 3.75]) { caixa(0.18, 1.26, 0.18, metal, x + lx, F + 0.63, z + lz); cil(0.16, 0.16, 0.18, roda, x + lx, F + 0.09, z + lz); }
        caixa(4.75, 0.18, 0.26, metal, x, F + 2.72, z - 4.02);
        // criado-mudo pequeno encostado na lateral da maca
        caixa(1.35, 1.5, 1.2, M(0xdfe6ee, 0.48), x + lado * 3.0, F + 0.75, z + 2.35);
        dbox(1.1, 0.08, 1.0, M(0x89b4d6, 0.35), x + lado * 3.0, F + 1.56, z + 2.35);
        dbox(0.95, 0.04, 0.06, M(0x5c6b7c, 0.4), x + lado * 3.0, F + 1.0, z + 2.84);
        // soro preso na parede, em vez de painéis transparentes flutuando
        const haste = new THREE.Group(); haste.position.set(x + lado * 1.85, F, z - 2.0); this.cena.add(haste);
        const base = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.08, 12), metal); base.position.y = 0.04; haste.add(base);
        const coluna = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 5.2, 10), metal); coluna.position.y = 2.6; haste.add(coluna);
        const braco = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.08, 0.08), metal); braco.position.set(-lado * 0.42, 4.9, 0); haste.add(braco);
        const bolsa = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.95, 0.14), new THREE.MeshStandardMaterial({ color: 0xdff4ff, transparent: true, opacity: 0.78 })); bolsa.position.set(-lado * 0.74, 4.22, 0); haste.add(bolsa);
        const tubo = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 1.6, 8), M(0xb3dfff, 0.2, { transparent: true, opacity: 0.8 })); tubo.position.set(-lado * 0.74, 3.35, 0.28); haste.add(tubo);
      };
      for (const z of [-30, -50, -70, -90]) { maca(74.8, z, 1); maca(114.2, z, -1); }
      caixa(14, 8, 2.5, M(0xf2f2f2, 0.4), 94.5, F + 4, -MZ + 1.3);
      { const [cc, gc] = tela(128, 128); gc.fillStyle = "#fff"; gc.fillRect(0, 0, 128, 128); gc.fillStyle = "#e0202a"; gc.fillRect(48, 16, 32, 96); gc.fillRect(16, 48, 96, 32);
        this.deco(new THREE.Mesh(new THREE.PlaneGeometry(3, 3), new THREE.MeshBasicMaterial({ map: tex(cc) })), 94.5, F + 10, -MZ + 2.7); }
      // armário de remédios e bancada da enfermeira
      caixa(9, 3.4, 3, m.mad, 104, F + 1.7, -16); dbox(9.2, 0.16, 3.2, M(0xece2d2, 0.75), 104, F + 3.45, -16);
      for (const dx of [-2.8, 0, 2.8]) this.deco(new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.1, 0.55), M([0x7fd1ff, 0xff7fb0, 0x8ddc92][(dx + 3) % 3], 0.5)), 104 + dx, F + 4.05, -16);
      caixa(4.4, 7.6, 1.8, M(0xe5eef4, 0.4), 114.5, F + 3.8, -17);
      for (const y of [2.2, 4.1, 6.0]) dbox(4.0, 0.08, 1.56, M(0x9bb5c8, 0.35), 114.5, F + y, -17);
      janela(MX - 0.05, -40, -Math.PI / 2); janela(MX - 0.05, -75, -Math.PI / 2);
    }


    // AUDITÓRIO (x 71..118): palco, cortina, telão (easter egg), caixas de som e 64 poltronas instanciadas
    { const CXA = 94.5, vinho = M(0x8a0f1f, 0.9);
      caixa(46, 2, 12, m.mad, CXA, F + 1, MZ - 6); caixa(12, 1, 3, m.mad, CXA, F + 0.5, 86.5); caixa(3, 3.5, 2, m.mad, CXA, F + 3.75, 93);
      dbox(46, 9.5, 0.4, vinho, CXA, F + 7.7, MZ - 0.6); for (const l of [-1, 1]) dbox(3, 11, 1, vinho, CXA + l * 21, F + 6.5, MZ - 2);
      { const [ct, gt] = tela(512, 256); gt.fillStyle = "#0b1020"; gt.fillRect(0, 0, 512, 256); gt.fillStyle = "#ffd84d"; gt.font = "bold 48px sans-serif"; gt.textAlign = "center";
        gt.fillText("FEIRA DE CIÊNCIAS", 256, 110); gt.font = "32px sans-serif"; gt.fillStyle = "#fff"; gt.fillText("Tema: insetos 🦟", 256, 170);
        this.deco(new THREE.Mesh(new THREE.PlaneGeometry(20, 10), new THREE.MeshBasicMaterial({ map: tex(ct) })), CXA, F + 8, MZ - 1, Math.PI); }
      this.moldTelao = new THREE.MeshBasicMaterial({ color: 0xff44cc, transparent: true, opacity: 0.8 });   // moldura que pisca: o telão responde a quem fica parado diante dele
      for (const [w, h, dx, dy] of [[21, 0.4, 0, 5.2], [21, 0.4, 0, -5.2], [0.4, 10.4, 10.5, 0], [0.4, 10.4, -10.5, 0]]) dbox(w, h, 0.3, this.moldTelao, CXA + dx, F + 8 + dy, MZ - 1.1);
      this.pontos.telao = { x: CXA, y: F + 8, z: MZ - 1, hw: 11 }; this.telaoProg = 0;
      for (const l of [-1, 1]) { caixa(3, 6, 3.2, M(0x15151f, 0.6), CXA + l * 17, F + 5, 95); this.deco(new THREE.Mesh(new THREE.CircleGeometry(1, 20), B(0x333344)), CXA + l * 17, F + 6.2, 93.35, Math.PI); }
      const assentos = [], encostos = [], pes = [];
      for (let r = 0; r < 8; r++) for (let i = -4; i <= 4; i++) if (i) { const x = CXA + i * 4.4, z = 24 + r * 7; assentos.push([x, F + 1.85, z]); encostos.push([x, F + 3.1, z - 1.3]); pes.push([x, F + 0.8, z]); }
      const inst = (geo, mt, lista) => { const im = new THREE.InstancedMesh(geo, mt, lista.length), mx = new THREE.Matrix4();
        lista.forEach(([x, y, z], k) => { mx.makeTranslation(x, y, z); im.setMatrixAt(k, mx); }); im.instanceMatrix.needsUpdate = true; im.frustumCulled = false; this.cena.add(im); };
      const tecido = M(0xa0182c, 0.8);
      inst(new THREE.BoxGeometry(3, 0.45, 2.8), tecido, assentos); inst(new THREE.BoxGeometry(3, 2.5, 0.45), tecido, encostos); inst(new THREE.BoxGeometry(1, 1.6, 1), m.metal, pes);
      const invisivel = new THREE.MeshBasicMaterial({ visible: false });
      for (let r = 0; r < 8; r++) for (const cx of [CXA - 11, CXA + 11]) caixa(17.6, 4.7, 3.2, invisivel, cx, F + 2.35, 24 + r * 7);   // colisão por fileira
      const luzPalco = new THREE.PointLight(0xffd9a0, 1.1, 40); luzPalco.position.set(CXA, YMAX - 3, 92); this.cena.add(luzPalco);
      janela(MX - 0.05, 30, -Math.PI / 2); janela(MX - 0.05, 60, -Math.PI / 2);
    }


    // MOSQUITÃO DA RUA: estátua-gigante de enfeite no fundo do auditório (easter egg)
    { const M2 = M(0x5a6f3c, 0.88), M3 = M(0x8aad41, 0.82), OL = M(0x220000, 0.2, { emissive: 0xff2244, emissiveIntensity: 0.85 }), mm = new THREE.Group();
      mm.position.set(111, F + 2.8, 93); this.cena.add(mm); caixa(3.4, 0.9, 3.4, m.mad, 111, F + 2.45, 93);
      const parte = (geo, mt, x, y, z, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1, raiz = mm) => { const o = new THREE.Mesh(geo, mt); o.position.set(x, y, z); o.rotation.set(rx, ry, rz); o.scale.set(sx, sy, sz); raiz.add(o); return o; };
      // Geometria local: 'tubo' pertence a construirMosquito() e não existe em WorldManager.
      const haste = (a, b, raio, mt, raiz = mm) => {
        const vetor = new THREE.Vector3().subVectors(b, a), comprimento = vetor.length();
        if (comprimento < 0.0001) return null;
        const o = new THREE.Mesh(new THREE.CylinderGeometry(raio, raio * 0.88, comprimento, 8), mt);
        o.position.copy(a).addScaledVector(vetor, 0.5);
        o.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), vetor.normalize());
        raiz.add(o); return o;
      };
      const thorax = parte(new THREE.SphereGeometry(1.55, 20, 14), M2, 0, 6.2, 0, 0, 0, 0, 1.2, 0.95, 1.45);
      const head = parte(new THREE.SphereGeometry(1.05, 18, 12), M2, 0, 6.45, -2.35, 0, 0, 0, 1.0, 0.88, 0.92);
      parte(new THREE.CylinderGeometry(0.36, 0.48, 0.8, 10), M2, 0, 6.35, -1.2, Math.PI / 2, 0, 0);
      const abdomen = new THREE.Group(); abdomen.position.set(0, 5.95, 1.55); mm.add(abdomen);
      for (let i = 0; i < 6; i++) { const r = 1.18 - i * 0.12; const seg = parte(new THREE.SphereGeometry(r, 18, 12), i % 2 ? M3 : M2, 0, -i * 0.06, i * 0.92, 0, 0, 0, 1.0, 0.82, 1.08, abdomen); if (i < 5) { const aro = parte(new THREE.TorusGeometry(r * 0.82, 0.08, 6, 18), M3, 0, -i * 0.06, i * 0.92 - 0.36, Math.PI / 2, 0, 0, 1, 1, 1, abdomen); } }
      const ferrao = parte(new THREE.ConeGeometry(0.18, 0.85, 8), M2, 0, -0.22, 5.72, Math.PI / 2, 0, 0, 1, 1, 1, abdomen);
      const wingShape = new THREE.Shape(); wingShape.moveTo(0, 0); wingShape.quadraticCurveTo(1.1, 0.28, 2.3, 0.05); wingShape.quadraticCurveTo(2.55, -0.02, 2.8, -0.18); wingShape.quadraticCurveTo(1.9, -0.28, 0.55, -0.22); wingShape.quadraticCurveTo(0.08, -0.1, 0, 0); wingShape.closePath();
      for (const l of [1, -1]) {
        const baseX = l * 0.75;
        for (const [oy, oz, jx, jy, jz, px, py, pz, p2x, p2y, p2z] of [[-0.05, -0.75, 0.95, -0.55, -0.55, 2.1, -1.55, -1.35, 2.95, -2.15, -2.35], [-0.08, 0.0, 1.12, -0.65, 0.0, 2.42, -1.82, 0.0, 3.22, -2.35, 0.0], [-0.03, 0.75, 1.0, -0.48, 0.48, 2.22, -1.42, 1.2, 2.98, -2.02, 2.08]]) {
          haste(V(baseX, 5.75 + oy, oz), V(l * jx, jy + 5.75, jz), 0.11, M2);
          haste(V(l * jx, jy + 5.75, jz), V(l * px, py + 5.75, pz), 0.075, M2);
          haste(V(l * px, py + 5.75, pz), V(l * p2x, p2y + 5.75, p2z), 0.04, M2);
          parte(new THREE.SphereGeometry(0.17, 10, 8), M3, l * jx, jy + 5.75, jz);
          parte(new THREE.SphereGeometry(0.12, 10, 8), M3, l * p2x, p2y + 5.75, p2z, 0, 0, 0, 1, 1, 1.5);
        }
        const wing = parte(new THREE.ShapeGeometry(wingShape), new THREE.MeshStandardMaterial({ color: 0xc7d7a8, roughness: 0.4, transparent: true, opacity: 0.55, side: THREE.DoubleSide }), baseX, 7.0, -0.15, -Math.PI / 2, 0, 0, l, 1.0, 1.0);
        wing.position.x = baseX; wing.position.y = 7.0; wing.position.z = -0.15;
        const nerv = haste(V(baseX, 6.95, -0.1), V(l * 2.45, 6.96, -0.08), 0.04, M3);
        const nerv2 = haste(V(l * 0.95, 6.95, -0.08), V(l * 2.12, 7.12, 0.11), 0.03, M3);
        const nerv3 = haste(V(l * 0.85, 6.94, -0.08), V(l * 1.98, 6.76, -0.22), 0.03, M3);
      }
      const olhos = [];
      for (const l of [1, -1]) {
        olhos.push(parte(new THREE.SphereGeometry(0.32, 12, 10), OL, l * 0.52, 6.42, -3.08));
        haste(V(l * 0.18, 7.0, -2.55), V(l * 0.52, 8.25, -3.25), 0.05, M2);
        haste(V(l * 0.52, 8.25, -3.25), V(l * 0.82, 9.1, -3.85), 0.03, M3);
      }
      const trompa = parte(new THREE.CylinderGeometry(0.2, 0.055, 3.3, 8), M2, 0, 5.82, -4.72, Math.PI / 2.05);
      parte(new THREE.CylinderGeometry(0.075, 0.02, 1.1, 6), M3, 0, 5.22, -6.18, Math.PI / 2.08);
      for (let i = 0; i < 5; i++) { const esp = parte(new THREE.ConeGeometry(0.12 - i * 0.008, 0.58, 6), M3, 0, 7.55 + i * 0.1, -0.95 + i * 0.45); esp.rotation.x = -0.12; }
      mm.scale.setScalar(0.18);
      this.mosquito = { g: mm, olhos, trompa, centro: V(111, F + 2.8 + 1.25, 93) };
    }
    // Lâmpadas do teto nas salas
    for (const [x, z] of [[-94, -54], [-49, -54], [-7, -54], [28, -54], [56, -54], [94, -54], [17, 54], [58, 54], [94, 50], [94, 15]]) dbox(14, 0.3, 1.6, B(0xeaf6ff), x, YMAX - 0.15, z);
    // Cartazes ao lado das portas (nunca sobre o vão), bebedouros e extintores em trechos livres do corredor
    // Cartazes informativos presos a trechos SÓLIDOS das paredes, ao lado das portas.
    // A parede norte (z=-8) olha para +Z; a sul (z=8), para -Z.
    const posterPorta = (titulo, subtitulo, cor, centro, zParede, deslocamento = 7.7) => {
      const norte = zParede < 0;
      const x = centro + deslocamento;
      // Não ocupar nenhuma abertura de porta, que tem 10 unidades de largura.
      const portas = norte ? PN : PS;
      if (portas.some(p => Math.abs(x - p) < 7.2)) return;
      const faceZ = zParede + (norte ? 0.72 : -0.72);
      const [c, g] = tela(256, 256);
      g.fillStyle = cor; g.fillRect(0, 0, 256, 256);
      g.strokeStyle = '#f4e8cb'; g.lineWidth = 8; g.strokeRect(9, 9, 238, 238);
      g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.font = 'bold 31px sans-serif'; g.fillText(titulo, 128, 104, 228);
      g.font = 'bold 19px sans-serif'; g.fillText(subtitulo, 128, 152, 230);
      const poster = this.deco(new THREE.Mesh(new THREE.PlaneGeometry(3.8, 3.8),
        new THREE.MeshBasicMaterial({ map: tex(c), side: THREE.DoubleSide, toneMapped: false,
          depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 })),
        x, F + 6.3, faceZ, norte ? 0 : Math.PI);
      poster.userData.semSombraUltra = true;
      poster.castShadow = false; poster.receiveShadow = false;
    };
    posterPorta('ARTES', 'crie sem medo', '#a03070', -94, -8, -8);
    posterPorta('EVOLUA!', '1 2 3 4 = crescer', '#b5443a', -49, -8, -8); posterPorta('BIOLOGIA', 'cuide da natureza', '#0f7a4a', -7, -8, 8);
    posterPorta('BIBLIOTECA', 'silêncio, por favor', '#5a3fa0', 28, -8, -8); posterPorta('LABORATÓRIO', 'atenção aos reagentes', '#0f7a4a', 56, -8, 8);
    posterPorta('ENFERMARIA', 'primeiros socorros', '#1f6fb5', 94, -8, 8); posterPorta('LAVE AS MÃOS', 'antes de comer', '#1f6fb5', -40, 8, -8);
    posterPorta('GINÁSIO', 'educação física', '#0f7a4a', 17, 8, 8); posterPorta('BANHEIRO', 'mantenha limpo', '#c9861a', 57, 8, -8); posterPorta('AUDITÓRIO', 'feira de ciências', '#5a3fa0', 94, 8, 8);
    const bebedouro = (x, z, lado) => {
      caixa(2.4, 9, 1.6, m.porc, x, F + 4.5, z); dbox(1.6, 0.5, 1.1, m.metal, x, F + 4.1, z); dbox(0.6, 0.9, 0.5, m.metal, x, F + 3.3, z);
      this.deco(new THREE.Mesh(new THREE.SphereGeometry(0.35, 12, 10), B(0x66ccff)), x, F + 3.15, z + 0.5 * lado);
    };
    bebedouro(-100.5, -6.7, 1); bebedouro(-13, -6.7, 1); bebedouro(11, 6.7, -1); bebedouro(100.5, -6.7, 1);
    for (const [x, z] of [[-87.6, -6.9], [-42.6, -6.9], [34.4, -6.9], [62.4, -6.9], [-33.6, 6.9], [23.4, 6.9], [63.4, 6.9], [100.4, 6.9]]) extintor(x, z);

    // PARTES DO LOUVA-A-DEUS V17 (Tusk): quatro modelos anatômicos próprios.
    // Os modelos giram/flutuam como uma única peça, sem juntas desconectadas.
    // Núcleo sempre visível; detalhes opcionais seguem Leve/Normal/Alto/Ultra.
    this.pontos.mantis = [];
    {
      const verde = M(0x6baf31, 0.66), verdeClaro = M(0x9ac94a, 0.58),
        verdeEscuro = M(0x365c24, 0.79), articulacao = M(0x354e24, 0.62),
        olho = M(0x253b20, 0.31, { metalness: 0.12 }), brilhoOlho = M(0xa7e87a, 0.36),
        nervura = M(0x608d35, 0.62), garra = M(0xb6cf7b, 0.42),
        asa = M(0xa4d78b, 0.63, { transparent: true, opacity: 0.66, side: THREE.DoubleSide, depthWrite: false });
      const geoEsfera = new THREE.SphereGeometry(1, 12, 8);
      const modelos = this.pontos.mantis;
      const esferoide = (pai, x, y, z, rx, ry, rz, mt) => {
        const o = new THREE.Mesh(geoEsfera, mt);
        o.position.set(x, y, z); o.scale.set(rx, ry, rz); pai.add(o); return o;
      };
      const vareta = (pai, a, b, r, mt, lados = 7) => {
        const v0 = V(...a), v1 = V(...b), delta = v1.clone().sub(v0);
        const distancia = delta.length();
        if (distancia < 0.0001) return null;
        // Os cilindros penetram um pouco nas articulações para impedir lacunas.
        const m = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.86, r, distancia + 0.045, lados), mt);
        m.position.copy(v0).add(v1).multiplyScalar(0.5);
        m.quaternion.setFromUnitVectors(V(0, 1, 0), delta.normalize()); pai.add(m); return m;
      };
      const jun = (pai, p, r, mt = articulacao) => esferoide(pai, ...p, r, r, r, mt);
      const item = (id, x, y, z, construir) => {
        const g = new THREE.Group(), forma = new THREE.Group();
        const normal = new THREE.Group(), extra = new THREE.Group();
        // Os grupos de detalhes são filhos do modelo e acompanham seu giro e altura.
        forma.add(normal, extra); construir(forma, normal, extra);
        const aura = new THREE.Mesh(new THREE.SphereGeometry(1.10, 12, 8),
          new THREE.MeshBasicMaterial({ color: 0x72ed4a, transparent: true, opacity: 0.075, depthWrite: false, side: THREE.BackSide }));
        g.add(forma, aura); g.position.set(x, y, z); this.cena.add(g);
        modelos.push({ id, g, forma, normal, extra, base: y, pos: g.position });
      };

      // CABEÇA: crânio triangular, olhos compostos, mandíbulas e duas antenas.
      item('cabeca', 38, F + 10.7, -70, (f, normal, extra) => {
        const perfil = new THREE.Shape();
        perfil.moveTo(-0.55, 0.24); perfil.lineTo(0.55, 0.24);
        perfil.lineTo(0.35, -0.10); perfil.lineTo(0, -0.43);
        perfil.lineTo(-0.35, -0.10); perfil.closePath();
        const geo = new THREE.ExtrudeGeometry(perfil, {
          depth: 0.24, bevelEnabled: true, bevelThickness: 0.055, bevelSize: 0.045, bevelSegments: 1, steps: 1
        });
        geo.translate(0, 0, -0.12);
        f.add(new THREE.Mesh(geo, verde));
        esferoide(f, 0, -0.36, 0, 0.16, 0.20, 0.18, verdeEscuro);
        for (const l of [-1, 1]) {
          esferoide(f, l * 0.43, 0.16, 0.16, 0.26, 0.27, 0.25, olho);
          esferoide(normal, l * 0.48, 0.22, 0.36, 0.075, 0.085, 0.032, brilhoOlho);
          vareta(f, [l * 0.17, 0.28, 0], [l * 0.31, 0.57, -0.02], 0.034, verdeEscuro);
          vareta(f, [l * 0.31, 0.57, -0.02], [l * 0.44, 0.88, 0.03], 0.023, verdeEscuro);
          jun(normal, [l * 0.31, 0.57, -0.02], 0.042);
          vareta(normal, [l * 0.13, -0.31, 0.12], [l * 0.23, -0.49, 0.16], 0.035, garra);
          esferoide(extra, l * 0.30, 0.04, 0.18, 0.030, 0.058, 0.028, verdeClaro);
        }
        vareta(extra, [-0.16, -0.24, 0.19], [0.16, -0.24, 0.19], 0.025, articulacao);
      });

      // FOICES: dois braços predadores conectados a um único suporte central.
      item('foices', 65, F + 5.2, -92, (f, normal, extra) => {
        esferoide(f, 0, -0.18, 0, 0.34, 0.30, 0.30, verdeEscuro);
        esferoide(f, 0, -0.06, 0.12, 0.29, 0.18, 0.20, verde);
        for (const l of [-1, 1]) {
          const p0 = [l * 0.23, -0.12, 0.07];
          const p1 = [l * 0.50, -0.23, 0.14];
          const p2 = [l * 0.81, 0.20, 0.20];
          const p3 = [l * 0.82, 0.53, 0.22];
          const ponta = [l * 0.55, 0.82, 0.21];
          vareta(f, p0, p1, 0.105, verde);
          vareta(f, p1, p2, 0.084, verdeClaro);
          vareta(f, p2, p3, 0.090, verdeEscuro);
          // Foice encurvada e pontiaguda, tocando o antebraço.
          const curva = new THREE.CatmullRomCurve3([V(...p3), V(l * 0.84, 0.71, 0.22), V(...ponta)]);
          const lamina = new THREE.Mesh(new THREE.TubeGeometry(curva, 12, 0.055, 6, false), garra);
          f.add(lamina);
          jun(f, p0, 0.12, verdeEscuro); jun(f, p1, 0.105); jun(f, p2, 0.10, verde);
          for (let d = 0; d < 3; d++) {
            const yy = 0.16 + d * 0.105;
            vareta(normal, [l * 0.73, yy, 0.20], [l * (0.61 - d * 0.05), yy + 0.08, 0.24], 0.025, garra, 5);
          }
          esferoide(extra, l * 0.56, -0.17, 0.20, 0.08, 0.06, 0.08, verdeClaro);
        }
      });

      // TÓRAX + ASAS: segmento central rígido com par de asas em forma de folha.
      item('torax', 17, F + 12.5, 78, (f, normal, extra) => {
        esferoide(f, 0, 0.02, 0, 0.29, 0.31, 0.73, verde);
        esferoide(f, 0, 0.06, -0.49, 0.20, 0.22, 0.28, verdeEscuro);
        esferoide(f, 0, 0.09, 0.47, 0.21, 0.20, 0.25, verdeClaro);
        for (const l of [-1, 1]) {
          const formaAsa = new THREE.Shape();
          formaAsa.moveTo(0, 0);
          formaAsa.bezierCurveTo(0.34, -0.16, 0.85, -0.34, 1.22, -0.22);
          formaAsa.bezierCurveTo(1.36, -0.02, 0.99, 0.32, 0.25, 0.39);
          formaAsa.quadraticCurveTo(0.06, 0.18, 0, 0);
          const folha = new THREE.Mesh(new THREE.ShapeGeometry(formaAsa), asa);
          folha.rotation.x = -Math.PI / 2;
          folha.scale.x = l;
          folha.position.set(l * 0.17, 0.15, -0.03); f.add(folha);
          esferoide(f, l * 0.20, 0.14, -0.01, 0.11, 0.10, 0.16, verdeEscuro);
          vareta(normal, [l * 0.16, 0.155, -0.03], [l * 1.16, 0.16, 0.05], 0.018, nervura, 5);
          vareta(extra, [l * 0.39, 0.16, 0.02], [l * 0.81, 0.17, -0.20], 0.014, nervura, 5);
          vareta(extra, [l * 0.39, 0.16, 0.02], [l * 0.86, 0.17, 0.22], 0.014, nervura, 5);
        }
        vareta(normal, [0, 0.27, -0.36], [0, 0.28, 0.43], 0.035, verdeEscuro);
      });

      // ABDÔMEN + PATAS: segmentos contínuos com seis membros articulados.
      item('abdomen', 65, F + 2.5, 86, (f, normal, extra) => {
        for (let i = 0; i < 6; i++) {
          const z = -0.61 + i * 0.26, r = 0.40 - i * 0.045;
          // Cada segmento se sobrepõe ao vizinho; a carapaça não abre buracos.
          esferoide(f, 0, 0.10 - i * 0.018, z, r, r * 0.79, 0.27,
            i % 2 ? verde : verdeClaro);
          if (i > 0) esferoide(normal, 0, 0.27 - i * 0.016, z - 0.05,
            r * 0.80, 0.035, 0.08, verdeEscuro);
        }
        esferoide(f, 0, 0.01, 0.87, 0.13, 0.16, 0.22, verdeEscuro);
        for (const l of [-1, 1]) for (let i = 0; i < 3; i++) {
          const z = -0.47 + i * 0.43, spread = i === 1 ? 1.0 : 0.80;
          const raiz = [l * 0.29, 0.015, z];
          const joelho = [l * (0.66 * spread), -0.34, z + (i - 1) * 0.12];
          const pe = [l * (0.91 * spread), -0.78, z + (i - 1) * 0.22];
          vareta(f, raiz, joelho, 0.064, verdeEscuro);
          vareta(f, joelho, pe, 0.039, articulacao);
          jun(f, raiz, 0.072, verde); jun(f, joelho, 0.071);
          esferoide(normal, ...pe, 0.058, 0.052, 0.058, garra);
          vareta(extra, [l * 0.36, -0.08, z], [l * 0.51, -0.17, z - 0.07], 0.022, garra, 5);
        }
      });
      this.atualizarDetalhesLouvaDeus(lerGraficos());
    }
  }

  livre(p, margem) { for (const c of this.col) if (c.box.distanceToPoint(p) < margem) return false; return true; }
  sorteio(alvo, yMin = CFG.YMIN + 1, yMax = CFG.YMAX - 1) {
    for (let i = 0; i < 10; i++) {
      alvo.set((Math.random() - 0.5) * CFG.MX * 1.9, yMin + Math.random() * (yMax - yMin), (Math.random() - 0.5) * CFG.MZ * 1.9);
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

  // ---- Pingos de tinta (skin Meio pintado): caem do mosquito e deixam manchas permanentes no chão ----
  criarPingos() {
    const geo = new THREE.SphereGeometry(0.07, 8, 6), mt = new THREE.MeshStandardMaterial({ color: 0xc00818, roughness: 0.2, emissive: 0x300004, emissiveIntensity: 0.5 });
    this.pingos = Array.from({ length: 40 }, () => { const m = new THREE.Mesh(geo, mt); m.scale.set(1, 1.6, 1); m.visible = false; this.cena.add(m); return { m, vx: 0, vy: 0, vz: 0, on: false }; });
    const gm = new THREE.CircleGeometry(1, 14), mm = new THREE.MeshBasicMaterial({ color: 0xa00614, transparent: true, opacity: 0.92, depthWrite: false });
    this.manchas = Array.from({ length: 220 }, () => { const m = new THREE.Mesh(gm, mm); m.rotation.x = -Math.PI / 2; m.visible = false; this.cena.add(m); return m; }); this.manchaI = 0;
    this.zonaMesh = new THREE.Mesh(new THREE.CircleGeometry(1, 40), new THREE.MeshBasicMaterial({ color: 0xc00818, transparent: true, opacity: 0.3, depthWrite: false })); this.zonaMesh.rotation.x = -Math.PI / 2; this.zonaMesh.visible = false; this.cena.add(this.zonaMesh);
  }
  pingar(pos, vel) {
    const p = this.pingos.find((q) => !q.on); if (!p) return;
    p.on = true; p.m.visible = true; p.m.position.set(pos.x + (Math.random() - 0.5) * 0.5, pos.y - 0.1, pos.z + (Math.random() - 0.5) * 0.5);
    p.vx = vel.x * 0.3 + (Math.random() - 0.5) * 0.6; p.vy = -0.3; p.vz = vel.z * 0.3 + (Math.random() - 0.5) * 0.6;
  }
  atualizarPingos(dt) {
    const chao = CFG.YMIN + 0.1;
    for (const p of this.pingos) {
      if (!p.on) continue;
      p.vy -= 20 * dt; p.m.position.x += p.vx * dt; p.m.position.y += p.vy * dt; p.m.position.z += p.vz * dt;
      if (p.m.position.y <= chao) {   // bateu no chão: vira uma mancha que fica
        p.on = false; p.m.visible = false;
        const s = this.manchas[this.manchaI++ % this.manchas.length], r = 0.18 + Math.random() * 0.4;
        s.position.set(p.m.position.x, chao + (this.manchaI % 7) * 0.001, p.m.position.z); s.scale.set(r, r * (0.6 + Math.random() * 0.8), 1); s.rotation.z = Math.random() * 6.28; s.visible = true;
        if (Math.random() < 0.5) this.emitir(p.m.position, 0xc00818, 2, 1.2);
      }
    }
  }
  // ---- Apoio das habilidades ----
  gotasPerto(pos, n) { for (let i = 0; i < n; i++) this.nascerGota(pos); this.emitir(pos, 0xffd84d, 30, 6); }
  coletarRaio(pos, r, jogo) {   // coleta na hora as gotas (menos as venenosas) dentro do raio
    let n = 0;
    for (let i = this.ativas.length - 1; i >= 0; i--) {
      const g = this.ativas[i]; if (g.userData.tipo === "veneno" || g.position.distanceTo(pos) > r) continue;
      this.ativas[i] = this.ativas[this.ativas.length - 1]; this.ativas.pop(); g.visible = false; this.gotas.soltar(g); if (!g.userData.extra) this.fila.push(6); jogo.coletar(g); n++;
    }
    return n;
  }
  apagarGas(pos, r) { for (const n of this.gasAtivos) if (n.position.distanceTo(pos) < r) { n.userData.fase = "ativo"; n.userData.t = 0.01; } }   // encerra as nuvens no raio
  iniciarPontos(S) {   // estado salvo: armário arrombado e livro já devolvido
    const A = this.armario; if (A && S.skins.includes("cadeado")) { A.aberto = true; A.cad.visible = false; A.pivo.rotation.y = -1.75; A.led.visible = false; }
    const L = this.livroPerdido;
    if (L) {
      L.entregue = S.livroDevolvido === true;
      L.carregando = false; L.g.visible = !L.entregue;
      if (L.shelf) L.shelf.visible = false;
      if (this.livroDevolvidoVisual) this.livroDevolvidoVisual.visible = L.entregue;
    }
  }
  limitar(p) { p.x = clamp(p.x, -CFG.MX + 1, CFG.MX - 1); p.z = clamp(p.z, -CFG.MZ + 1, CFG.MZ - 1); p.y = clamp(p.y, CFG.YMIN + 0.3, CFG.YMAX - 0.3); }   // fantasma: só os limites do prédio

  // ---- Carteira perdida no corredor (B perto dela devolve e rende sangue; até 3 vezes) ----
  criarCarteira() {
    // CARTEIRA PERDIDA V3: carteira de couro ABERTA em "V", parecendo um livro.
    // Nenhum bloco fechado no centro; cada aba gira pelo próprio pivô da dobradiça.
    const g = new THREE.Group();
    const couro = new THREE.MeshStandardMaterial({ color: 0x63352a, roughness: 0.9 });
    const couroFriso = new THREE.MeshStandardMaterial({ color: 0xb87a52, roughness: 0.83 });
    const forro = new THREE.MeshStandardMaterial({ color: 0x241d20, roughness: 0.96 });
    const costura = new THREE.MeshStandardMaterial({ color: 0xe4c299, roughness: 0.9 });
    const metal = new THREE.MeshStandardMaterial({ color: 0xced7dd, metalness: 0.8, roughness: 0.3 });
    const ciano = new THREE.MeshStandardMaterial({ color: 0x35a8dc, roughness: 0.55 });
    const rosa = new THREE.MeshStandardMaterial({ color: 0xe46c76, roughness: 0.64 });
    const verde = new THREE.MeshStandardMaterial({ color: 0xa5d78b, roughness: 0.84 });
    const creme = new THREE.MeshStandardMaterial({ color: 0xf4deab, roughness: 0.92 });
    const escuro = new THREE.MeshStandardMaterial({ color: 0x31494f, roughness: 0.8 });
    const caixa = (pai, w, h, d, mt, x, y, z) => {
      const malha = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mt);
      malha.position.set(x, y, z); pai.add(malha); return malha;
    };
    const asa = (lado) => {
      const piv = new THREE.Group();
      // Cada metade sobe nas pontas, mas permanece conectada na dobradiça.
      piv.position.set(0, 0.15, 0);
      piv.rotation.z = lado * 0.43;
      g.add(piv);
      const cx = lado * 0.70;
      caixa(piv, 1.41, 0.075, 1.46, couro, cx, 0, 0);
      caixa(piv, 1.31, 0.018, 1.35, forro, cx, 0.048, 0);
      // Contorno de costura nas bordas interiores da aba.
      for (const ox of [-0.63, 0.63])
        caixa(piv, 0.015, 0.014, 1.33, costura, cx + ox, 0.065, 0);
      for (const oz of [-0.65, 0.65])
        caixa(piv, 1.27, 0.014, 0.015, costura, cx, 0.065, oz);
      // Bolso grande de couro claro. As peças continuam sobre a superfície da aba.
      caixa(piv, 1.06, 0.035, 0.58, couroFriso, cx, 0.092, 0.3);
      if (lado < 0) {
        // Três notas escapando do bolso, com faixa escura e denominação.
        for (let i = 0; i < 3; i++) {
          const z = -0.33 + i * 0.14;
          caixa(piv, 1.00 - i * 0.08, 0.02, 0.32, i === 1 ? creme : verde, cx, 0.12 + i * 0.024, z);
        }
        caixa(piv, 0.17, 0.018, 0.10, escuro, cx - 0.28, 0.183, -0.07);
        caixa(piv, 0.17, 0.018, 0.10, escuro, cx + 0.28, 0.183, -0.07);
      } else {
        // Três cartões parcialmente encaixados nos porta-cartões da aba direita.
        caixa(piv, 1.02, 0.027, 0.43, rosa, cx, 0.132, 0.17);
        caixa(piv, 1.04, 0.027, 0.43, ciano, cx, 0.159, -0.10);
        caixa(piv, 0.85, 0.028, 0.28, creme, cx, 0.19, -0.29);
        // Chip e faixas dos cartões tornam os materiais reconhecíveis à distância.
        caixa(piv, 0.18, 0.012, 0.13, metal, cx - 0.32, 0.212, -0.26);
        caixa(piv, 0.36, 0.013, 0.035, escuro, cx + 0.14, 0.213, -0.33);
      }
      return piv;
    };
    const esquerda = asa(-1), direita = asa(1);
    // Dobradiça em couro enrolado ligando as duas abas sem buracos na junção.
    const dobra = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 1.45, 12), couroFriso);
    dobra.rotation.x = Math.PI / 2; dobra.position.set(0, 0.13, 0); g.add(dobra);
    const costuraDobra = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.048, 1.49, 12), couro);
    costuraDobra.rotation.x = Math.PI / 2; costuraDobra.position.set(0, 0.2, 0); g.add(costuraDobra);
    // Aba de fecho curta presa na lateral da carteira e botão de pressão redondo.
    const fecho = caixa(direita, 0.28, 0.06, 0.40, couroFriso, 1.31, 0.1, 0.52);
    fecho.rotation.y = 0.15;
    const botao = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.025, 16), metal);
    botao.position.set(1.33, 0.16, 0.52); direita.add(botao);
    // Carteira de BOLSO: reduzida a aproximadamente 1 unidade de largura,
    // mais rasa que um livro (sem alterar o raio de coleta pela tecla B).
    g.scale.set(0.35, 0.40, 0.31);
    // Mostra a dobra, os cartões e as notas à câmera com ângulo oblíquo.
    g.rotation.y = 0.35;
    // O halo continua sendo indicador de coleta, não parte da carteira.
    const halo = new THREE.Mesh(new THREE.TorusGeometry(1.95, 0.065, 6, 48),
      new THREE.MeshBasicMaterial({ color: 0xffd84d, transparent: true, opacity: 0.62 }));
    halo.rotation.x = Math.PI / 2;
    halo.position.y = 0.055;
    g.add(halo);
    this.cena.add(g);
    this.carteira = { g, halo, visivel: false, spots: [[-20, 3], [35, -3], [-55, 2], [75, 2], [100, -2], [-95, -2]] };
  }
  posicionarCarteira(S) {
    const c = this.carteira; c.visivel = S.carteiras < 3; c.g.visible = c.visivel;
    if (c.visivel) { const [x, z] = c.spots[(Math.random() * c.spots.length) | 0]; c.g.position.set(x, CFG.YMIN + 0.035, z); }
  }
  criarLivroPerdido() {
    const g = new THREE.Group();
    const capa = new THREE.MeshStandardMaterial({ color: 0x305d9c, roughness: 0.76 });
    const folha = new THREE.MeshStandardMaterial({ color: 0xf3ead4, roughness: 0.92 });
    const detalhe = new THREE.MeshStandardMaterial({ color: 0xd9c36a, roughness: 0.6, metalness: 0.15 });
    const corpo = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.22, 1.15), capa); corpo.position.y = 0.11; g.add(corpo);
    const miolo = new THREE.Mesh(new THREE.BoxGeometry(1.38, 0.12, 1.0), folha); miolo.position.y = 0.18; g.add(miolo);
    const lombada = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.26, 1.15), detalhe); lombada.position.set(-0.70, 0.11, 0); g.add(lombada);
    const faixa = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.03, 0.18), detalhe); faixa.position.set(0.1, 0.235, 0); g.add(faixa);
    const halo = new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.06, 6, 36), new THREE.MeshBasicMaterial({ color: 0x8ae4ff, transparent: true, opacity: 0.55 }));
    halo.rotation.x = Math.PI / 2; halo.position.y = 0.05; g.add(halo);
    g.rotation.y = -0.45; this.cena.add(g);
    const shelf = this.livroDevolucaoHalo || null;
    // Em cima de uma mesa da cantina (x=-78, z=49), não dentro da biblioteca.
    // Tampo da mesa: F+3.55; livro começa a partir de F+3.57.
    this.livroPerdido = { g, halo, shelf, carregando: false, entregue: false,
      spot: V(-78, CFG.YMIN + 3.57, 49), reward: 180 };
    g.position.copy(this.livroPerdido.spot);
    if (shelf) shelf.visible = false;
  }

  atualizarHumanos(dt, jogo) {
    const p = jogo.jogador.pos, F = CFG.YMIN, rc = jogo.estado.raioColeta + 0.9;
    const virar = (g, ang, k) => { g.rotation.y += Math.atan2(Math.sin(ang - g.rotation.y), Math.cos(ang - g.rotation.y)) * amort(k, dt); };
    this.humanoPerto = null; let melhor = rc * rc;
    for (const h of this.humanos) {
      const g = h.g;
      h.pronto = Math.max(0, h.pronto - dt); h.raiva = Math.max(0, h.raiva - dt); h.tapa = Math.max(0, h.tapa - dt);
      if (h.atord > 0) {   // atordoado ou dançando: não anda, não se irrita e rende mais sangue
        h.atord -= dt; h.raiva = 0; h.tapa = Math.max(h.tapa, 0.6);
        h.g.position.y = F + h.yo + Math.abs(Math.sin(jogo.t * 9 + h.passo)) * 0.35; h.g.rotation.y += dt * 2.2;
      } else if (h.raiva > 0) {
        // Tempo parado: o humano fica travado, sem gesto de tapa e sem avançar na agressão.
        if (jogo.buff.tempo > 0) {
          h.bracos[0].rotation.x *= 0.72; h.bracos[1].rotation.x *= 0.72;
          h.bracos[0].userData.cotovelo.rotation.x += (-0.35 - h.bracos[0].userData.cotovelo.rotation.x) * 0.28;
          h.bracos[1].userData.cotovelo.rotation.x += (-0.35 - h.bracos[1].userData.cotovelo.rotation.x) * 0.28;
          h.cab.rotation.y *= 0.85;
          h.pernas.forEach((l) => { l.rotation.x *= 0.7; l.userData.joelho.rotation.x *= 0.7; });
          g.position.y = F + h.yo;
        } else {
          // Bravo: para, encara o mosquito e abana o braço
          virar(g, Math.atan2(p.x - g.position.x, p.z - g.position.z), 10);
          h.bracos[1].rotation.x = -2.4 + Math.sin(jogo.t * 16) * 0.7; h.bracos[0].rotation.x = 0; h.bracos[1].userData.cotovelo.rotation.x = -0.6; h.cab.rotation.y *= 0.9;
          h.pernas.forEach((l) => { l.rotation.x *= 0.8; l.userData.joelho.rotation.x *= 0.8; });
          const dx = p.x - g.position.x, dy = p.y - (F + 5.2 + h.yo), dz = p.z - g.position.z;
          if (h.tapa <= 0 && dx * dx + dy * dy + dz * dz < 2.8 * 2.8) { h.tapa = 1.2; jogo.tapa(h); }
        }
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
      const jaPicadasFrenesi = jogo.buff.frenesi > 0 ? (jogo.alvosFrenesi.get(h)?.qtd || 0) : 0;
      h.marca.visible = h.pronto <= 0 && jaPicadasFrenesi < 2;
      h.marca.rotation.z += dt * 2; h.marca.position.y = 6.75 + Math.sin(jogo.t * 3 + h.passo) * 0.1;
      h.alvo.set(g.position.x, F + 5.65 + h.yo, g.position.z);
      const d2 = h.alvo.distanceToSquared(p);
      if (h.pronto <= 0 && jaPicadasFrenesi < 2 && d2 < melhor) { melhor = d2; this.humanoPerto = h; }
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
    }, 100);
    for (let i = 0; i < 80; i++) this.nascerGota();
  }
  nascerGota(perto) {
    const g = this.gotas.pegar(); if (!g) return;
    const r = Math.random(), u = g.userData;
    u.tipo = r < 0.12 ? "veneno" : r < 0.27 ? "dourada" : "normal"; u.fase = Math.random() * 6.28;
    const c = this.cores[u.tipo];
    u.nucleo.material.color.setHex(c); u.nucleo.material.emissive.setHex(c); u.nucleo.material.emissiveIntensity = 0.9;
    u.halo.material.color.setHex(u.tipo === "veneno" ? 0x55ff55 : c);
    g.scale.setScalar(u.tipo === "dourada" ? 1.4 : 1);
    if (perto) g.position.set(clamp(perto.x + (Math.random() - 0.5) * 22, -CFG.MX + 2, CFG.MX - 2), clamp(perto.y + (Math.random() - 0.3) * 5, CFG.YMIN + 1, CFG.YMAX - 1), clamp(perto.z + (Math.random() - 0.5) * 22, -CFG.MZ + 2, CFG.MZ - 2)); else this.sorteio(g.position);
    g.userData.extra = !!perto; g.visible = true; this.ativas.push(g);
  }

  // ---- Partículas (pool) ----
  criarParticulas() {
    const geo = new THREE.SphereGeometry(0.03, 6, 6);
    this.ativasP = [];
    this.parts = new Pool(() => {
      const p = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ transparent: true }));
      p.visible = false; p.userData = { v: V(0, 0, 0), vida: 0, g: 4, dec: 1.4, mode: 0 }; this.cena.add(p); return p;
    }, 260);
  }
  emitir(pos, cor, n = 12, forca = 3, tipo = "") {   // partículas visuais; não muda recompensas, dano ou cooldown
    const quantidade = Math.max(0, Math.ceil(n * this.qualidadeParticulas));
    for (let i = 0; i < quantidade && this.ativasP.length < this.limiteParticulas; i++) {
      const p = this.parts.pegar(); if (!p) return; const u = p.userData;
      p.position.copy(pos); p.material.color.setHex(cor); p.material.opacity = 1; p.visible = true;
      u.mode = tipo === "fumaca" ? 1 : tipo === "espuma" ? 2 : 0; u.g = u.mode === 1 ? -1.4 : u.mode === 2 ? 1.2 : 4; u.dec = u.mode === 1 ? 0.7 : u.mode === 2 ? 0.9 : 1.4;
      p.scale.setScalar(u.mode === 1 ? 6 : u.mode === 2 ? 3 : 1);
      u.v.set((Math.random() - 0.5) * forca, Math.random() * forca * (u.mode === 1 ? 0.5 : 0.8), (Math.random() - 0.5) * forca); u.vida = 1;
      this.ativasP.push(p);
    }
  }

  // --- Efeitos 3D das habilidades (nao modifica modelos dos humanos) ---
  ondaHabilidade(pos, cor, raio = 4, tempo = 0.7, inclinacao = 0) {
    const g = new THREE.Group();
    const material = new THREE.MeshBasicMaterial({ color: cor, transparent: true, opacity: 0.85,
      depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
    const aro = new THREE.Mesh(new THREE.TorusGeometry(1, 0.045, 5, this.qualidadeParticulas < 0.5 ? 20 : this.qualidadeParticulas < 1 ? 32 : 48), material);
    aro.rotation.x = inclinacao || Math.PI / 2;
    g.position.copy(pos); g.add(aro); this.cena.add(g);
    this.efeitosHabilidade.push({ g, vida: tempo, max: tempo, raio, aro });
    return g;
  }
  fxHabilidade(id, jogo) {
    const p = jogo.jogador.pos, e = (cor, n=18, f=5, tipo='') => this.emitir(p, cor, n, f, tipo);
    const an = (cor, raio=5, dur=0.8) => { this.ondaHabilidade(p, cor, raio, dur); if (this.anelsPorHabilidade > 1) this.ondaHabilidade(p, cor, raio * 0.7, dur * 1.2, Math.PI / 3); };
    switch (id) {
      case 'padrao': e(0xf3ffff, 20, 8, 'espuma'); an(0xffffff, 4, 0.45); break;
      case 'pixel': e(0x33ff66, 32, 7); an(0x33ff66, 4, 0.45); break;
      case 'encadernado': e(0xffe6b9, 34, 6); an(0x627bc6, 11, 0.95); break;
      case 'dengue': e(0xff3044, 30, 5); an(0xff3344, 6, 1); break;
      case 'relojoeiro': e(0xffd84d, 40, 3); an(0xffd84d, 11, 1.5); break;
      case 'radioativo': e(0x39ff14, 32, 6); an(0x39ff14, 8, 1); break;
      case 'jogador': e(0xff9a22, 24, 9); an(0xffa320, 5, 0.6); break;
      case 'fantasma': an(0x99ddff, 3.5, 0.5); break; // pulso curto, sem fumaça
      case 'vampiro': e(0xff1744, 36, 6); an(0xdd0033, 8, 1.2); break;
      case 'mosquito': e(0xc9d13a, 26, 5); an(0xc9d13a, 6, 1); break;
      case 'carreta': e(0xff44cc, 38, 7); an(0xff44cc, 13, 1.25); an(0x44ddff, 10, 1); break;
      case 'eletrizado': e(0x9fe0ff, 48, 11); an(0x4fd0ff, 12, 0.7); break;
      case 'pintado': e(0xff2855, 26, 5); an(0xff2855, 5, 0.9); break;
      case 'extintor': e(0xffffff, 44, 7, 'espuma'); an(0xbfefff, 12, 1.15); break;
      case 'cadeado': e(0xffc933, 32, 5); an(0xffc933, 6, 1); break;
      case 'tusk': e(0xffd24a, 20, 5); an(0xffd24a, 6, 0.6); break;
      case 'mosquito8000': e(0x00e5ff, 32, 5); an(0x00e5ff, 11, 1.4); break;
    }
  }
  dispararUnhaTusk(jogo, humano, ato, atraso = 0) {
    const origem = jogo.jogador.pos.clone();
    const direcao = humano.alvo.clone().sub(origem).normalize();
    origem.addScaledVector(direcao, 0.65 * jogo.jogador.modelo.escala);
    origem.y += 0.12;
    const g = new THREE.Group();
    const ouro = new THREE.MeshStandardMaterial({color: 0xffe28a, metalness: 0.65, roughness: 0.18,
      emissive: 0xffb900, emissiveIntensity: 1.15});
    const unha = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.65, 10), ouro);
    const cauda = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.10, 0.4, 8),
      new THREE.MeshBasicMaterial({color: 0xffb900, transparent:true, opacity:0.75,
        blending: THREE.AdditiveBlending, depthWrite:false}));
    cauda.position.y = -0.4;
    g.add(unha, cauda);
    g.scale.setScalar(Math.min(2, 1 + (ato - 1) * 0.18));
    g.position.copy(origem);
    this.cena.add(g);
    humano.unhaPendente = true; // evita varios disparos contra o mesmo humano antes do impacto
    this.unhasTusk.push({g, humano, jogo, origem, ato, t: -atraso,
      dur: Math.max(0.32, Math.min(0.8, origem.distanceTo(humano.alvo) / 35))});
  }
  acertarUnhaTusk(proj) {
    const {humano:h, jogo, ato} = proj, S = jogo.estado;
    h.unhaPendente = false;
    if (h.pronto > 0) return;
    const ganho = Math.round((25 + S.valorGota * 6) * 0.7 * jogo.multSangue());
    S.sangue += ganho; S.picadas++; h.pronto = 12; h.raiva = 0;
    if (ato >= 4) h.atord = Math.max(h.atord || 0, 3);
    if (S.attr.cura) jogo.jogador.vida = Math.min(S.vidaMax, jogo.jogador.vida + S.attr.cura);
    this.emitir(h.alvo, 0xffd24a, 22, 5);
    this.emitir(h.alvo, 0xff1744, 13, 3);
    this.ondaHabilidade(h.alvo, 0xffd24a, 1.9, 0.4);
    jogo.audio.picada(); jogo.ui.hud(S); jogo.salvarT = 3;
    if (S.picadas >= 10) jogo.desbloquear('vampiro');
  }
  atualizarFXHabilidades(dt) {
    for (let i=this.efeitosHabilidade.length-1;i>=0;i--) {
      const x=this.efeitosHabilidade[i]; x.vida-=dt;
      const f=Math.max(0,1-x.vida/x.max);
      x.g.scale.setScalar(Math.max(0.02, x.raio*f));
      x.aro.material.opacity=0.85*(1-f);
      if (x.vida<=0) { this.cena.remove(x.g); x.aro.geometry.dispose(); x.aro.material.dispose(); this.efeitosHabilidade.splice(i,1); }
    }
    for (let i=this.unhasTusk.length-1;i>=0;i--) {
      const x=this.unhasTusk[i]; x.t+=dt;
      if (x.t<0) continue;
      const f=Math.min(1, x.t/x.dur);
      // O alvo se move: a unha acompanha a posicao atual dele ate o impacto.
      const destino=x.humano.alvo;
      x.g.position.lerpVectors(x.origem, destino, f);
      x.g.position.y+=Math.sin(f*Math.PI)*0.45;
      const d=destino.clone().sub(x.g.position);
      if (d.lengthSq()>0.0001) x.g.quaternion.setFromUnitVectors(V(0,1,0), d.normalize());
      if (Math.random()<0.6) this.emitir(x.g.position, 0xffd24a, 1, 0.4);
      if (f>=1) {
        this.acertarUnhaTusk(x);
        this.cena.remove(x.g);
        x.g.traverse(o => { if(o.isMesh) { o.geometry.dispose(); o.material.dispose(); } });
        this.unhasTusk.splice(i,1);
      }
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
    this.pocas = [[-40, 0, 4.5], [40, 0, 4.5], [-6, 30, 3.5], [55, 40, 3], [-30, 13, 3], [94, -40, 3.5], [94, 45, 2.8], [-94, -30, 3.5], [30, 75, 3.5]].map(([x, z, r]) => {
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
    this.luz.intensity = (Math.sin(jogo.t * 3.1) * Math.sin(jogo.t * 17.3) > 0.93 ? 0.5 : 1.6) * (jogo.modoGrafico === 'ultra' ? 0.68 : 1);   // lâmpada falhando
    this.atualizarHumanos(dt * jogo.escalaTempo, jogo);   // tempo parado deixa humanos em câmera lenta
    this.atualizarFXHabilidades(dt);
    if (this.relogio) { const d = new Date(), s = d.getSeconds() + d.getMilliseconds() / 1000, mi = d.getMinutes() + s / 60, h = (d.getHours() % 12) + mi / 60;
      this.relogio.s.rotation.z = -s / 60 * Math.PI * 2; this.relogio.m.rotation.z = -mi / 60 * Math.PI * 2; this.relogio.h.rotation.z = -h / 12 * Math.PI * 2; }
    if (this.luzGalao) this.luzGalao.intensity = 1.1 + Math.sin(jogo.t * 3) * 0.4;
    if (this.pontos.tomada) { if (Math.random() < dt * 4) this.emitir(this.pontos.tomada, 0x9fe0ff, 5, 3); if (this.luzTomada) this.luzTomada.intensity = Math.random() < 0.3 ? 2.2 : 0.4; }   // faíscas na tomada
    if (this.moldTelao) { this.moldTelao.opacity = 0.55 + 0.4 * Math.sin(jogo.t * (3 + this.telaoProg * 12)); this.moldTelao.color.setHex(this.telaoProg > 0 ? 0x66ff99 : 0xff44cc); }
    if (this.carteira && this.carteira.visivel) this.carteira.halo.scale.setScalar(1 + Math.sin(jogo.t * 4) * 0.15);
    if (this.livroPerdido && !this.livroPerdido.entregue) {
      const L = this.livroPerdido;
      if (!L.carregando) { L.halo.scale.setScalar(1 + Math.sin(jogo.t * 4.8) * 0.12); }
      if (L.shelf) { L.shelf.visible = L.carregando; L.shelf.scale.setScalar(1 + Math.sin(jogo.t * 4.2) * 0.06); }
    }
    this.atualizarPingos(dt);
    { const Z = jogo.zona; this.zonaMesh.visible = !!Z; if (Z) { this.zonaMesh.position.set(Z.x, CFG.YMIN + 0.12, Z.z); this.zonaMesh.scale.set(Z.r, Z.r, 1); this.zonaMesh.material.opacity = 0.25 + 0.1 * Math.sin(jogo.t * 4); } }   // poça de cura da skin Meio pintado
    for (const m of this.pontos.mantis) { const tem = jogo.estado.mantis.includes(m.id); m.g.visible = !tem; if (!tem) { m.forma.rotation.y += dt * 1.5; m.g.position.y = m.base + Math.sin(jogo.t * 2 + m.pos.x) * 0.15; } }
    const A = this.armario;   // armário trancado: treme enquanto é arrombado, abre e o cadeado cai
    if (A) {
      const alvo = A.aberto ? -1.75 : A.prog > 0 ? (Math.random() - 0.5) * 0.05 * A.prog : 0;
      A.pivo.rotation.y += (alvo - A.pivo.rotation.y) * (A.aberto ? amort(6, dt) : 0.6);
      if (A.aberto) { if (A.cad.visible) { A.vy += 14 * dt; A.cad.position.y -= A.vy * dt; A.cad.rotation.z += dt * 3; if (A.cad.position.y < CFG.YMIN + 0.4) A.cad.visible = false; } }
      else { A.cad.rotation.z = Math.sin(jogo.t * 40) * 0.25 * A.prog; A.led.visible = Math.sin(jogo.t * 6) > 0; }
    }

    // Gotas: anima só as próximas (<40u); coleta por distância ao quadrado
    const rc0 = S.raioColeta * jogo.fatorColeta(), r2 = rc0 * rc0;   // scanner aumenta o alcance
    for (let i = this.ativas.length - 1; i >= 0; i--) {
      const g = this.ativas[i], u = g.userData, d2 = g.position.distanceToSquared(p);
      // O objeto segue ativo e coletável mesmo quando sua representação 3D distante é ocultada.
      g.visible = d2 <= this.alcanceGotas * this.alcanceGotas;
      if (d2 < 1600) { u.fase += dt; u.nucleo.position.y = Math.sin(u.fase * 2) * 0.08; u.halo.scale.setScalar((1 + Math.sin(u.fase * 3) * 0.12) * (jogo.buff.scan > 0 ? 3 : 1)); }
      if (d2 < r2) {
        this.ativas[i] = this.ativas[this.ativas.length - 1]; this.ativas.pop();
        g.visible = false; this.gotas.soltar(g); if (!g.userData.extra) this.fila.push(6); jogo.coletar(g);
      }
    }
    for (let i = this.fila.length - 1; i >= 0; i--) {
      if ((this.fila[i] -= dt) <= 0) { this.fila[i] = this.fila[this.fila.length - 1]; this.fila.pop(); this.nascerGota(); }
    }

    // Partículas
    for (let i = this.ativasP.length - 1; i >= 0; i--) {
      const q = this.ativasP[i], u = q.userData;
      u.v.y -= u.g * dt; q.position.addScaledVector(u.v, dt);
      u.vida -= dt * u.dec; q.scale.setScalar(u.mode === 1 ? 6 + (1 - u.vida) * 9 : u.mode === 2 ? 3 + (1 - u.vida) * 4 : Math.max(u.vida, 0.01)); q.material.opacity = Math.max(u.vida, 0) * (u.mode === 1 ? 0.45 : 1);
      if (u.vida <= 0) { q.visible = false; this.ativasP[i] = this.ativasP[this.ativasP.length - 1]; this.ativasP.pop(); this.parts.soltar(q); }
    }

    // Nuvens de inseticida periódicas
    if ((this.proxGas -= dt * jogo.escalaTempo) <= 0) { const n = this.nuvens.pegar(); if (n) this.iniciarGas(n); this.proxGas = 10 + Math.random() * 8; }
    for (let i = this.gasAtivos.length - 1; i >= 0; i--) {
      const n = this.gasAtivos[i], u = n.userData; u.t -= dt * jogo.escalaTempo;
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
          this.emPerigo = "gas"; if (!u.tocou) { u.tocou = true; jogo.kills.gas++; } jogo.dano(16 * dt * jogo.fatorGas(), true); jogo.jogador.stamina = Math.max(0, jogo.jogador.stamina - 30 * dt);
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
        jogo.jogador.stamina = Math.max(0, jogo.jogador.stamina - 28 * dt); jogo.dano(5 * dt * jogo.fatorGas(), true);
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
    this.escudo = 0; this.escudoMesh = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), new THREE.MeshBasicMaterial({ color: 0xffd24a, transparent: true, opacity: 0.22, depthWrite: false })); this.escudoMesh.visible = false; this.obj.add(this.escudoMesh);
    this.eul = new THREE.Euler(0, 0, 0, "YXZ"); this.frente = V(0, 0, 0); this.dir = V(0, 0, 0); this.alvo = V(0, 0, 0);
    this.foco = this.obj.position.clone(); this.olhar = this.foco.clone(); this.tmp = V(0, 0, 0); this.tmp2 = V(0, 0, 0);
    this.rc = new THREE.Raycaster();
  }
  get pos() { return this.obj.position; }
  mirar(dx, dy) { this.yaw -= dx * 0.0025; this.pitch = clamp(this.pitch - dy * 0.0025, -1.2, 1.2); }
  tomarDano(v) { if (this.invul > 0 || this.escudo > 0) return false; this.vida = Math.max(0, this.vida - v); this.regenT = 5; return this.vida <= 0; }
  reaparecer() {
    this.pos.set(0, 2, 0); this.vel.set(0, 0, 0); this.vida = this.estado.vidaMax; this.stamina = this.estado.staminaMax;
    this.invul = 2.5; this.foco.copy(this.pos);
  }

  update(dt, k, toque) {
    const S = this.estado;
    this.eul.set(this.pitch, this.yaw, 0, "YXZ");
    this.frente.set(0, 0, -1).applyEuler(this.eul); this.dir.set(Math.cos(this.yaw), 0, -Math.sin(this.yaw));
    const a = this.alvo.set(0, 0, 0);
    if (k.w || k.arrowup) a.add(this.frente); if (k.s || k.arrowdown) a.sub(this.frente);
    if (k.d || k.arrowright) a.add(this.dir); if (k.a || k.arrowleft) a.sub(this.dir);
    const tk = toque ? toque.teclas : {};
    if (toque) { a.addScaledVector(this.frente, toque.eixos.y); a.addScaledVector(this.dir, toque.eixos.x); }
    if (k[" "] || tk[" "]) a.y += 1; if (k.control || tk.control) a.y -= 1;
    const mov = a.lengthSq() > 0; if (a.lengthSq() > 1) a.normalize();

    this.corre = !!(k.shift || tk.shift) && this.stamina > 5 && mov;
    this.stamina = clamp(this.stamina + (this.corre ? -35 : S.regenStamina) * dt, 0, S.staminaMax);
    a.multiplyScalar(S.velMax * (this.corre ? 2 : 1) * this.fator);
    this.vel.lerp(a, amort(mov ? 9 : 5, dt));

    // Integração em sub-passos: não atravessa paredes em alta velocidade
    const passos = Math.max(1, Math.ceil(this.vel.length() * dt / 0.12)), h = dt / passos;
    const fantasma = S.attr.intang;   // intangível: sem colisão, só os limites do prédio
    for (let i = 0; i < passos; i++) { this.pos.addScaledVector(this.vel, h); if (fantasma) this.mundo.limitar(this.pos); else this.mundo.resolver(this.pos, 0.18 * clamp(this.modelo.zoom, 1, 2.5)); }

    // Vida / invulnerabilidade
    this.invul = Math.max(0, this.invul - dt);
    this.escudo = Math.max(0, this.escudo - dt); this.escudoMesh.visible = this.escudo > 0; if (this.escudo > 0) this.escudoMesh.scale.setScalar(1.5 + Math.sin(performance.now() * 0.01) * 0.06); this.shake = Math.max(0, this.shake - dt * 3);
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
    if (ms.length && !this.estado.attr.intang) {
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
// ULTRA V11 — CINEMATIC: shaders com efeito visivel, mas SEM
// ULTRA NATURAL V12: sombras reais no Three.js; bloom comedido e sem SSAO.
// "tela lavada": bloom duplo (proximo + difuso), separacao de
// luzes por cor e contraste local, SSAO opcional (profundidade),
// FXAA conservador, color grading e vinheta de filme.
// Apenas para modo Ultra; HUD, colisoes e gameplay nao mudam.
// ------------------------------------------------------------
class UltraPostFX {
  constructor(renderer) {
    this.renderer = renderer;
    const mkTarget = () => new THREE.WebGLRenderTarget(1, 1, {
      minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat, depthBuffer: false, stencilBuffer: false,
      generateMipmaps: false
    });
    this.sceneTarget = new THREE.WebGLRenderTarget(1, 1, {
      minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat, depthBuffer: true, stencilBuffer: false,
      generateMipmaps: false
    });
    // Sem SSAO de profundidade: gera padroes em paredes lisas obliquas.
    // O Ultra usa shadow maps reais nos modelos 3D.
    this.hasDepth = false;
    this.bloomA = mkTarget(); this.bloomB = mkTarget();
    this.wideA = mkTarget(); this.wideB = mkTarget();
    this.cena = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const vs = `varying vec2 vUv;
      void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;
    const material = (uniforms, fragmentShader) => new THREE.ShaderMaterial({
      uniforms, vertexShader: vs, fragmentShader,
      depthTest: false, depthWrite: false, transparent: false,
      blending: THREE.NoBlending, toneMapped: false
    });
    // Dois tipos de emissivo: LED colorido OU luz branca local (lampada).
    // Em regioes muito extensas, como piso branco e teto, a mascara
    // praticamente zera; nao volta o estouro de luz da V9.
    this.extract = material({
      uScene: { value: this.sceneTarget.texture },
      uTexel: { value: new THREE.Vector2(1, 1) }
    }, `precision highp float;
      uniform sampler2D uScene;
      uniform vec2 uTexel;
      varying vec2 vUv;
      float lum(vec3 c) { return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
      void main() {
        vec2 uv = clamp(vUv, vec2(0.002), vec2(0.998));
        vec3 c = texture2D(uScene, uv).rgb;
        float hi = max(c.r, max(c.g, c.b));
        float lo = min(c.r, min(c.g, c.b));
        float L = lum(c);
        vec2 d = uTexel * 15.0;
        vec3 n1 = texture2D(uScene, clamp(uv + vec2(d.x, 0.0), vec2(0.0), vec2(1.0))).rgb;
        vec3 n2 = texture2D(uScene, clamp(uv - vec2(d.x, 0.0), vec2(0.0), vec2(1.0))).rgb;
        vec3 n3 = texture2D(uScene, clamp(uv + vec2(0.0, d.y), vec2(0.0), vec2(1.0))).rgb;
        vec3 n4 = texture2D(uScene, clamp(uv - vec2(0.0, d.y), vec2(0.0), vec2(1.0))).rgb;
        float entorno = 0.25 * (lum(n1) + lum(n2) + lum(n3) + lum(n4));
        float contraste = max(L - entorno, 0.0);
        // LEDs, auras, sangue brilhante, sensores, luzes coloridas.
        float saturado = smoothstep(0.28, 0.58, hi-lo) * smoothstep(0.81, 0.98, hi)
          * smoothstep(0.055, 0.24, contraste);
        // Pontos brancos so acendem se MUITO mais claros que seu entorno.
        // Uma area branca uniforme nunca vira bloom.
        float lampada = smoothstep(0.85, 0.99, L) * smoothstep(0.15, 0.42, contraste);
        // Evita iluminar paredes inteiras por micro-variações de brilho.
        float mascara = clamp(0.65 * saturado + 0.70 * lampada, 0.0, 1.0);
        gl_FragColor = vec4(c * mascara, 1.0);
      }`);
    this.blur = material({
      uInput: { value: this.bloomA.texture },
      uDirection: { value: new THREE.Vector2(1, 0) },
      uPixel: { value: new THREE.Vector2(1, 1) }
    }, `precision highp float;
      uniform sampler2D uInput;
      uniform vec2 uDirection;
      uniform vec2 uPixel;
      varying vec2 vUv;
      vec3 ler(vec2 uv) { return texture2D(uInput, clamp(uv, vec2(0.002), vec2(0.998))).rgb; }
      void main() {
        vec2 d = uDirection * uPixel;
        vec3 c = ler(vUv) * 0.227027;
        c += (ler(vUv+d*1.0)+ler(vUv-d*1.0)) * 0.1945946;
        c += (ler(vUv+d*2.0)+ler(vUv-d*2.0)) * 0.1216216;
        c += (ler(vUv+d*3.0)+ler(vUv-d*3.0)) * 0.0540540;
        c += (ler(vUv+d*4.0)+ler(vUv-d*4.0)) * 0.0162160;
        gl_FragColor = vec4(c, 1.0);
      }`);
    this.composite = material({
      uScene: { value: this.sceneTarget.texture },
      uBloomNear: { value: this.bloomA.texture },
      uBloomFar: { value: this.wideA.texture },
      uPixel: { value: new THREE.Vector2(1, 1) },
      uAspect: { value: 1.0 }, uTime: { value: 0 }
    }, `precision highp float;
      uniform sampler2D uScene;
      uniform sampler2D uBloomNear;
      uniform sampler2D uBloomFar;
      uniform vec2 uPixel;
      uniform float uAspect, uTime;
      varying vec2 vUv;
      vec3 sampleScene(vec2 uv) { return texture2D(uScene, clamp(uv, vec2(0.001), vec2(0.999))).rgb; }
      float lum(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }
      vec3 aa(vec2 uv) {
        vec3 m = sampleScene(uv);
        vec3 nw = sampleScene(uv + uPixel * vec2(-1.,-1.));
        vec3 ne = sampleScene(uv + uPixel * vec2( 1.,-1.));
        vec3 sw = sampleScene(uv + uPixel * vec2(-1., 1.));
        vec3 se = sampleScene(uv + uPixel * vec2( 1., 1.));
        float lm=lum(m), l0=lum(nw), l1=lum(ne), l2=lum(sw), l3=lum(se);
        float lmin=min(lm,min(min(l0,l1),min(l2,l3)));
        float lmax=max(lm,max(max(l0,l1),max(l2,l3)));
        if (lmax-lmin < max(0.035,lmax*0.12)) return m;
        vec2 dir=vec2(-((l0+l1)-(l2+l3)), (l0+l2)-(l1+l3));
        float reduction=max((l0+l1+l2+l3)*0.03,0.015625);
        dir=clamp(dir/(min(abs(dir.x),abs(dir.y))+reduction),vec2(-5.),vec2(5.))*uPixel;
        vec3 a=0.5*(sampleScene(uv+dir*(-0.167))+sampleScene(uv+dir*0.167));
        vec3 b=a*0.5+0.25*(sampleScene(uv-dir*0.5)+sampleScene(uv+dir*0.5));
        vec3 suav=(lum(b)<lmin||lum(b)>lmax)?a:b;
        // Conserva geometria solida: suavizacao limitada a 60%.
        return mix(m,suav,0.38);
      }
      void main() {
        vec3 scene=aa(vUv);
        // Sem SSAO de tela: luz e sombras sao calculadas pelas malhas 3D.
        // Dois raios de bloom: halo nitido e espalhamento cinematografico.
        vec3 b1=texture2D(uBloomNear,vUv).rgb;
        vec3 b2=texture2D(uBloomFar,vUv).rgb;
        vec3 c=scene+b1*0.22+b2*0.10;
        // Grades de cinema: contraste forte, tons frios nas sombras,
        // realces discretamente quentes e saturacao contida.
        c=max(c,vec3(0.0));
        float l=dot(c,vec3(0.2126,0.7152,0.0722));
        c=mix(vec3(l),c,1.11);
        c=(c-0.42)*1.065+0.42;
        float shade=1.0-smoothstep(0.14,0.72,l);
        c+=shade*vec3(-0.006,0.004,0.025);
        float warm=smoothstep(0.65,0.98,l);
        c*=mix(vec3(1.0),vec3(1.012,0.998,0.978),warm);
        // Soft shoulder HDR: preserve detalhes no branco e nos brilhos.
        c=max(c,vec3(0.0));
        c=c/(vec3(1.0)+max(c-vec3(0.86),vec3(0.0))*0.75);
        vec2 p=(vUv-0.5)*vec2(uAspect,1.0);
        c*=1.0-0.18*smoothstep(0.33,1.1,length(p));
        float grain=fract(sin(dot(vUv/uPixel+uTime*0.19,vec2(12.9898,78.233)))*43758.5453);
        c+=(grain-0.5)*0.0018;
        gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);
      }`);
    this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.extract);
    this.quad.frustumCulled = false;
    this.cena.add(this.quad);
    this.w=0; this.h=0; this.ajustarTamanho();
  }
  ajustarTamanho() {
    const w=Math.max(1,this.renderer.domElement.width);
    const h=Math.max(1,this.renderer.domElement.height);
    if (w===this.w && h===this.h) return;
    this.w=w; this.h=h;
    const bw=Math.max(1,Math.ceil(w/3)), bh=Math.max(1,Math.ceil(h/3));
    const fw=Math.max(1,Math.ceil(w/10)), fh=Math.max(1,Math.ceil(h/10));
    this.sceneTarget.setSize(w,h);
    this.bloomA.setSize(bw,bh); this.bloomB.setSize(bw,bh);
    this.wideA.setSize(fw,fh); this.wideB.setSize(fw,fh);
    this.extract.uniforms.uTexel.value.set(1/w,1/h);
    this.composite.uniforms.uPixel.value.set(1/w,1/h);
    this.composite.uniforms.uAspect.value=w/h;
  }
  render(scene,camera,t) {
    const r=this.renderer;
    this.composite.uniforms.uTime.value=t;
    this.ajustarTamanho();
    const pass=(material,target)=>{this.quad.material=material;r.setRenderTarget(target);r.clear();r.render(this.cena,this.camera);};
    try {
      r.setRenderTarget(this.sceneTarget);r.clear();r.render(scene,camera);
      pass(this.extract,this.bloomA);
      this.quad.material=this.blur;
      this.blur.uniforms.uInput.value=this.bloomA.texture;
      this.blur.uniforms.uDirection.value.set(1,0);
      this.blur.uniforms.uPixel.value.set(1/this.bloomA.width,1/this.bloomA.height);
      pass(this.blur,this.bloomB);
      this.blur.uniforms.uInput.value=this.bloomB.texture;
      this.blur.uniforms.uDirection.value.set(0,1);
      pass(this.blur,this.bloomA);
      // Segunda camada propositalmente mais ampla.
      this.blur.uniforms.uInput.value=this.bloomA.texture;
      this.blur.uniforms.uPixel.value.set(1/this.wideA.width,1/this.wideA.height);
      this.blur.uniforms.uDirection.value.set(1,0);
      pass(this.blur,this.wideA);
      this.blur.uniforms.uInput.value=this.wideA.texture;
      this.blur.uniforms.uDirection.value.set(0,1);
      pass(this.blur,this.wideB);
      this.blur.uniforms.uInput.value=this.wideB.texture;
      this.blur.uniforms.uDirection.value.set(1,0);
      pass(this.blur,this.wideA);
      pass(this.composite,null);
    } finally { r.setRenderTarget(null); }
  }
  dispose() {
    this.cena.remove(this.quad);
    this.quad.geometry.dispose();
    this.extract.dispose();this.blur.dispose();this.composite.dispose();
    this.sceneTarget.dispose();this.bloomA.dispose();this.bloomB.dispose();
    this.wideA.dispose();this.wideB.dispose();
  }
}

// ------------------------------------------------------------
// GAME MANAGER: orquestra tudo
// ------------------------------------------------------------
// Controles independentes por ponteiro: mover, olhar e segurar ações ao mesmo tempo.
class TouchControls {
  constructor(game) {
    this.game = game; this.eixos = { x: 0, y: 0 }; this.teclas = {};
    this.ponteiros = new Map(); this.movimento = null; this.olhar = null;
    const el = document.createElement("div"); el.id = "hx-touch"; el.hidden = true;
    el.innerHTML = `
<div class="mt-toolbar">
  <button type="button" data-action="skins" class="mt-collection"><span>🎨</span> Skins</button>
  <button type="button" data-action="conq" class="mt-collection"><span>🏆</span> Conquistas</button>
  <button type="button" id="mt-more" aria-label="Mais ações" aria-expanded="false" aria-controls="mt-panel">•••</button>
  <button type="button" id="mt-pause" aria-label="Pausar jogo"><span class="mt-pause-icon" aria-hidden="true"></span></button>
</div>
<div id="mt-panel" hidden aria-label="Mais ações">
  <button type="button" data-action="dica">💡 Dica</button>
  <button type="button" data-action="som">♫ Som</button>
  <button type="button" data-action="quadro">📝 Quadro</button>
  <button type="button" data-action="tour">🗺 Tour</button>
  <button type="button" data-hold="f" class="mt-lock">🔓 Arrombar · segure perto do armário</button>
</div>
<div id="mt-stick" aria-label="Direcional de movimento"><span id="mt-thumb"></span><small>MOVER</small></div>
<p id="mt-look-hint">Arraste no cenário para olhar</p>
<div class="mt-actions" aria-label="Ações do jogo">
  <button type="button" data-action="picar" class="mt-bite"><span>🩸</span>Picar</button>
  <button type="button" data-action="poder"><span>✦</span>Poder</button>
  <button type="button" data-hold="shift" aria-label="Sprint, segure"><span>»</span>Sprint</button>
  <button type="button" data-action="pegar" aria-label="Pegar ou devolver carteira ou livro"><span>✋</span>Pegar</button>
</div>`;
    document.body.appendChild(el); this.el = el;
    this.stick = $("mt-stick"); this.thumb = $("mt-thumb"); this.panel = $("mt-panel");
    $("mt-pause").addEventListener("click", () => game.pausar());
    $("mt-more").addEventListener("click", () => {
      if (!this.ativo()) return;
      this.panel.hidden = !this.panel.hidden;
      $("mt-more").setAttribute("aria-expanded", String(!this.panel.hidden));
    });
    const acoes = {
      picar: () => game.picar(), poder: () => game.usarHabilidade(),
      pegar: () => game.interagirComPerdidos(), quadro: () => game.abrirPergunta(),
      skins: () => game.abrirColecao("skins"), conq: () => game.abrirColecao("conq"),
      dica: () => game.dica(), tour: () => game.tour(),
      som: () => game.ui.toast(game.audio.alternarMudo() ? "Som desligado" : "Som ligado")
    };
    el.querySelectorAll("[data-action]").forEach(b => b.addEventListener("click", () => {
      if (this.ativo()) acoes[b.dataset.action]();
    }));
    this.stick.addEventListener("pointerdown", e => {
      if (!this.ativo() || this.movimento !== null || e.button > 0) return;
      e.preventDefault(); this.movimento = e.pointerId;
      this.capturar(e, this.stick, "mover"); this.mover(e);
    });
    this.stick.addEventListener("pointermove", e => {
      if (e.pointerId === this.movimento && this.ativo()) { e.preventDefault(); this.mover(e); }
    });
    el.querySelectorAll("[data-hold]").forEach(b => b.addEventListener("pointerdown", e => {
      if (!this.ativo() || e.button > 0) return;
      e.preventDefault(); this.capturar(e, b, b.dataset.hold);
      this.teclas[b.dataset.hold] = true; b.classList.add("pressed");
    }));
    const cv = game.render.domElement;
    cv.addEventListener("pointerdown", e => {
      if (!this.ativo() || this.olhar !== null || e.button > 0) return;
      e.preventDefault(); this.olhar = e.pointerId;
      this.ultimoX = e.clientX; this.ultimoY = e.clientY;
      this.capturar(e, cv, "olhar"); $("mt-look-hint").hidden = true;
    });
    cv.addEventListener("pointermove", e => {
      if (e.pointerId !== this.olhar || !this.ativo()) return;
      e.preventDefault();
      game.jogador.mirar((e.clientX - this.ultimoX) * 1.8, (e.clientY - this.ultimoY) * 1.8);
      this.ultimoX = e.clientX; this.ultimoY = e.clientY;
    });
    [this.stick, cv, ...el.querySelectorAll("[data-hold]")].forEach(b => {
      b.addEventListener("lostpointercapture", e => this.soltar(e.pointerId));
    });
    addEventListener("pointerup", e => this.soltar(e.pointerId));
    addEventListener("pointercancel", e => this.soltar(e.pointerId));
    el.addEventListener("contextmenu", e => e.preventDefault());
    cv.addEventListener("contextmenu", e => { if (this.ativo()) e.preventDefault(); });
  }
  ativo() { return this.game.modoControle === "mobile" && this.game.jogando && !this.game.menuAberto; }
  capturar(e, el, tipo) {
    this.ponteiros.set(e.pointerId, { el, tipo });
    el.setPointerCapture?.(e.pointerId);
  }
  mover(e) {
    const r = this.stick.getBoundingClientRect(), raio = r.width * 0.32;
    let x = (e.clientX - r.left - r.width / 2) / raio;
    let y = (e.clientY - r.top - r.height / 2) / raio;
    const tamanho = Math.hypot(x, y);
    if (tamanho > 1) { x /= tamanho; y /= tamanho; }
    // Zona morta evita deriva; a distância do centro regula a velocidade.
    const intensidade = Math.max(0, (Math.min(1, tamanho) - 0.12) / 0.88);
    this.eixos.x = tamanho ? x / Math.min(1, tamanho) * intensidade : 0;
    this.eixos.y = tamanho ? -y / Math.min(1, tamanho) * intensidade : 0;
    this.thumb.style.transform = `translate(${x * raio}px, ${y * raio}px)`;
  }
  soltar(id) {
    const p = this.ponteiros.get(id); if (!p) return;
    this.ponteiros.delete(id);
    if (id === this.movimento) { this.movimento = null; this.eixos.x = this.eixos.y = 0; this.thumb.style.transform = ""; }
    if (id === this.olhar) this.olhar = null;
    if (![...this.ponteiros.values()].some(outro => outro.tipo === p.tipo)) this.teclas[p.tipo] = false;
    if (![...this.ponteiros.values()].some(outro => outro.el === p.el)) p.el.classList.remove("pressed");
    if (p.el.hasPointerCapture?.(id)) p.el.releasePointerCapture(id);
  }
  limpar() {
    for (const id of [...this.ponteiros.keys()]) this.soltar(id);
    this.eixos.x = this.eixos.y = 0;
    for (const k in this.teclas) this.teclas[k] = false;
    this.panel.hidden = true; $("mt-more").setAttribute("aria-expanded", "false");
  }
  atualizar() { this.el.hidden = !this.ativo(); }
}


class GameManager {
  constructor() {
    this.modoControle = lerControles();
    this.estado = new GameState(); this.audio = new AudioSystem(); this.ui = new UIManager();
    this.cena = new THREE.Scene(); this.cena.background = new THREE.Color(0x0e0c18); this.cena.fog = new THREE.Fog(0x0e0c18, 60, 170);
    this.camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.1, 500);
    this.modoGrafico = lerGraficos();
    this.render = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'default' });
    this.ultraFX = null;
    this._tomOriginal = this.render.toneMapping;
    this._expOriginal = this.render.toneMappingExposure;
    this.render.setPixelRatio(Math.min(devicePixelRatio || 1, GRAFICOS[this.modoGrafico].resolucao));
    this.render.setSize(innerWidth, innerHeight);
    $("webgl-container").appendChild(this.render.domElement);
    console.info('[MOSQUITO EVOLUTION V17] Partes do louva-a-deus remodeladas e adaptadas aos modos graficos');
    this.mundo = new WorldManager(this.cena, this.audio);
    this.jogador = new PlayerController(this.cena, this.camera, this.estado, this.mundo);
    this.jogador.pos.set(0, 2, 0);
    // Fonte direcional suave de sombra real para a regiao proxima ao jogador.
    // Ativa apenas no Ultra; tetos/paredes nao bloqueiam a fonte virtual.
    this.luzUltra = new THREE.DirectionalLight(0xffebd7, 0);
    this.luzUltra.castShadow = true;
    this.luzUltra.shadow.mapSize.set(1536, 1536);
    this.luzUltra.shadow.camera.left = -27;
    this.luzUltra.shadow.camera.right = 27;
    this.luzUltra.shadow.camera.top = 27;
    this.luzUltra.shadow.camera.bottom = -27;
    this.luzUltra.shadow.camera.near = 0.5;
    this.luzUltra.shadow.camera.far = 88;
    this.luzUltra.shadow.bias = -0.00010;
    this.luzUltra.shadow.normalBias = 0.035;
    this.luzUltra.shadow.radius = 2.2;
    this.cena.add(this.luzUltra, this.luzUltra.target);
    this._sombraT = 0;
    this._ultimoRender = 0; this._ultimoFPS = 0; this._frames = 0; this._fpsStamp = 0;
    this._timerDecor = 0;
    this.ui.aoMudarGraficos = (modo) => this.aplicarGraficos(modo);
    this.aplicarGraficos(this.modoGrafico, false);
    this.teclas = {}; this.jogando = false; this.travado = false; this.arrastando = false;
    this.combo = 0; this.comboT = 0; this.boost = 0; this.t = 0; this.salvarT = 0; this.relogio = new THREE.Clock(); this.alvosFrenesi = new Map();
    this.egg = { tanque: 0, espelho: 0, tela: 0, yAnt: 0, dica: 0, tour: false, fala: false, morte: 0, vida: 0 };
    this.menuAberto = false; this.aba = "skins"; this.eggMsg = "";
    this.buff = { sangue: 0, tempo: 0, radio: 0, vel: 0, stamInf: 0, invis: 0, frenesi: 0, gas: 0, scan: 0, pesado: 0 }; this.hab = { cd: 0, cdTotal: 1, ativo: 0 }; this.escalaTempo = 1; this.zona = null; this.kills = { tapasRecebidos: 0, gas: 0 }; this.tmpEgg = V(0, 0, 0); this.buf = ""; this.letras = "";
    this.toque = new TouchControls(this);
    this.ui.aoMudarControles = modo => this.aplicarControles(modo);
    this.aplicarControles(this.modoControle, false);
    this.ligar();
    this.ui.atalhos(() => this.abrirColecao("skins"), () => this.abrirColecao("conq")); this.mundo.posicionarCarteira(this.estado); this.mundo.iniciarPontos(this.estado);
    // Migração do easter egg da V13C: jogador que já devolveu o livro
    // recebe a nova skin e conquista, sem alterar a skin equipada.
    if (this.estado.livroDevolvido) {
      let mudou = false;
      if (!this.estado.skins.includes('encadernado')) { this.estado.skins.push('encadernado'); mudou = true; }
      for (const id of ['skin_encadernado','livro_devolvido']) {
        if (!this.estado.conq.includes(id)) { this.estado.conq.push(id); mudou = true; }
      }
      if (mudou) this.estado.salvar();
    }
    this.jogador.modelo.aplicar(); this.jogador.zoomV = this.jogador.modelo.zoom; this.ui.hud(this.estado); this.ui.saveInfo(this.estado); this.ui.habilidade(this.estado.skin, 0, 1, 0);
    this.laco();
  }

  aplicarGraficos(modo, salvar = true) {
    if (!GRAFICOS[modo]) return;
    this.modoGrafico = modo;
    const opt = GRAFICOS[modo];
    // ACES mapeia o excesso de luz antes do bloom; outros modos nao mudam.
    this.render.toneMapping = modo === 'ultra' ? THREE.ACESFilmicToneMapping : this._tomOriginal;
    this.render.toneMappingExposure = modo === 'ultra' ? 0.82 : this._expOriginal;
    // Ultra usa supersampling real mesmo em monitores DPR 1; os demais preservam o ajuste anterior.
    this.render.setPixelRatio(modo === 'ultra' ? opt.resolucao : Math.min(devicePixelRatio || 1, opt.resolucao));
    this.render.setSize(innerWidth, innerHeight, false);
    // Sombras 3D de verdade. Nenhum shader de profundidade nas paredes.
    this.render.shadowMap.enabled = modo === 'ultra';
    this.render.shadowMap.type = THREE.PCFSoftShadowMap;
    this.render.shadowMap.needsUpdate = true;
    this.luzUltra.intensity = modo === 'ultra' ? 0.72 : 0;
    this.luzUltra.castShadow = modo === 'ultra';
    this.mundo.luzAmbiente.intensity = modo === 'ultra' ? 0.64 : 0.85;
    this.mundo.luzCeu.intensity = modo === 'ultra' ? 0.59 : 0.75;
    this.mundo.luzLua.intensity = modo === 'ultra' ? 0.28 : 0.5;
    this._sombraT = 0;
    this.mundo.atualizarSombras(this.jogador.pos, modo === 'ultra');
    this.mundo.atualizarDetalhesBanheiro(modo);
    this.mundo.atualizarDetalhesLouvaDeus(modo);
    // Sombras do personagem, inclusive InstancedMesh da skin voxel 8-bit.
    this.jogador.obj.traverse(o => {
      if (!o.isMesh || !o.material) return;
      const materiais = Array.isArray(o.material) ? o.material : [o.material];
      const solido = materiais.every(m => m && !m.transparent && !m.isMeshBasicMaterial);
      o.castShadow = modo === 'ultra' && solido;
      o.receiveShadow = modo === 'ultra' && solido;
    });
    const matMap = this.mundo.materiaisCenario;
    if (matMap) {
      // Roughness maior deixa madeira e pedra foscas, sem aspecto plastificado;
      // metal passa a refletir luz na medida certa. Restaura ao mudar de modo.
      const ajustes = [
        ['par','roughness',0.9,0.97], ['teto','roughness',0.9,0.97],
        ['mad','roughness',0.6,0.82], ['tampo','roughness',0.5,0.81],
        ['mesa','roughness',0.6,0.83], ['banco','roughness',0.7,0.86],
        ['metal','roughness',0.4,0.45], ['metal','metalness',0,0.38],
        ['bancada','roughness',0.4,0.72], ['porc','roughness',0.2,0.45],
        ['piso','roughness',0.55,0.93], ['laranja','roughness',0.5,0.8]
      ];
      for (const [nome, campo, normal, ultra] of ajustes) matMap[nome][campo] = modo === 'ultra' ? ultra : normal;
    }
    if (modo !== 'ultra') this.jogador.modelo.aplicar();
    if (modo === 'ultra') {
      if (!this.ultraFX) {
        try { this.ultraFX = new UltraPostFX(this.render); }
        catch (err) { console.warn('[MOSQUITO ULTRA] Shader indisponível, render normal.', err); this.ultraFX = null; }
      }
      if (this.ultraFX) this.ultraFX.ajustarTamanho();
    } else if (this.ultraFX) {
      this.ultraFX.dispose(); this.ultraFX = null;
    }
    this.camera.far = opt.distancia; this.camera.updateProjectionMatrix();
    this.cena.fog.near = modo === 'leve' ? 38 : modo === 'medio' ? 55 : 60;
    this.cena.fog.far = modo === 'leve' ? 132 : modo === 'medio' ? 200 : 170;
    this.mundo.qualidadeParticulas = opt.particulas;
    if (this.mundo.ajustarLivrosBiblioteca) this.mundo.ajustarLivrosBiblioteca(modo);
    this.mundo.limiteParticulas = opt.maxParticulas;
    this.mundo.anelsPorHabilidade = opt.aneis;
    this.mundo.alcanceHumanos = modo === 'leve' ? 52 : modo === 'medio' ? 105 : Infinity;
    this.mundo.alcanceGotas = modo === 'leve' ? 60 : modo === 'medio' ? 130 : Infinity;
    this._timerDecor = 0;
    this.mundo.atualizarDecoracoes(this.jogador.pos, opt.alcanceDecor, true);
    // Luzes de puzzles e o corredor continuam. No modo leve, dispensamos as demais luzes pontuais.
    if (!this._luzesOpcionais) this._luzesOpcionais = this.cena.children.filter(l =>
      l.isPointLight && l !== this.mundo.luz && l !== this.mundo.luzTomada && l !== this.mundo.luzGalao);
    for (const luz of this._luzesOpcionais) luz.visible = modo !== 'leve';
    if (this.ui.pv && this.ui.pv.r) {
      this.ui.pv.r.setPixelRatio(Math.min(devicePixelRatio || 1, opt.resolucao));
      const can = this.ui.pv.canvas;
      if (can.clientWidth && can.clientHeight) this.ui.pv.r.setSize(can.clientWidth, can.clientHeight, false);
    }
    this.ui.exibirGraficos(modo);
    const fps = $('hx-fps'); if (fps) fps.hidden = modo === 'alto' || modo === 'ultra';
    if (salvar) {
      try { localStorage.setItem(GRAF_KEY, modo); } catch (_) { /* modo em memória */ }
      this.ui.toast('⚙️ Gráficos: ' + opt.nome);
    }
    // Detalhes do Encadernado acompanham as configurações imediatamente.
    if (this.estado.skin === 'encadernado') this.jogador.modelo.aplicar();
    if (this.ui.pv && this.ui.pv.modelo && this.ui.skSel === 'encadernado') this.ui.pv.modelo.aplicar();
    this._ultimoRender = 0;
  }

  ligar() {
    const cv = this.render.domElement, T = this.teclas;
    addEventListener("keydown", (e) => {
      if (e.target && e.target.tagName === "INPUT") return;   // digitando no quadro de matemática
      const k = e.key.toLowerCase(); T[k] = true;
      if ([" ", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(k) && !this.menuAberto) e.preventDefault();
      if (e.repeat) return;
      if (k === "escape") {
        if (this.menuAberto) this.fecharColecao(); else if (this.jogando) this.pausar();
        return;
      }
      if (k === "k") { this.abrirColecao("skins"); return; }
      if (k === "c") { this.abrirColecao("conq"); return; }
      if (this.menuAberto) return;
      const mapa = { 1: "asas", 2: "tromba", 3: "estomago", 4: "corpo" };
      if (mapa[k]) this.evoluir(mapa[k]);
      // Easter eggs por teclado (Konami e a palavra "dengue")
            // Easter eggs por teclado (Konami e a palavra "dengue").
      // Aceita setas e WASD, inclusive sequências misturadas.

      const sequenciaKonami =
        "|arrowup|arrowup|arrowdown|arrowdown|arrowleft|arrowright|arrowleft|arrowright|b|a";

      const prefixoFinalKonami =
        "|arrowup|arrowup|arrowdown|arrowdown|arrowleft|arrowright|arrowleft|arrowright|b";

      // Se o B já foi digitado na sequência, o próximo A é o comando final.
      const comandoFinal = k === "a" && this.buf.endsWith(prefixoFinalKonami);

      // Converte WASD para as direções correspondentes.
      const mapaKonami = {
        w: "arrowup",
        s: "arrowdown",
        a: "arrowleft",
        d: "arrowright"
      };

      const teclaKonami = comandoFinal ? "a" : (mapaKonami[k] || k);

      this.buf = (this.buf + "|" + teclaKonami).slice(-160);

      this.letras = (
        this.letras + (k.length === 1 ? k : "")
      ).slice(-12);

      // Desbloqueia a conquista do código Konami.
      if (this.buf.endsWith(sequenciaKonami)) {
        this.desbloquear("pixel");
      }

      // Easter egg da palavra DENGUE.
      if (this.letras.endsWith("dengue")) {
        this.desbloquear("dengue");
      }
      if (k === "e") this.picar();
      if (k === "h") this.dica();
      if (k === "q") this.abrirPergunta();
      if (k === "r") this.usarHabilidade();
      if (k === "=" && this.jogando) this.tour();
      if (k === "b" && this.jogando && !this.buf.endsWith("|arrowright|b")) this.interagirComPerdidos();
      if (k === "m") this.ui.toast(this.audio.alternarMudo() ? "Som desligado" : "Som ligado");
    });
    document.addEventListener("visibilitychange", () => { if (document.hidden) this.pausar(); });
    addEventListener("blur", () => this.pausar());
    addEventListener("keyup", (e) => { T[e.key.toLowerCase()] = false; });
    addEventListener("blur", () => { for (const k in T) T[k] = false; });
    addEventListener("mousemove", (e) => { if (this.modoControle !== "mobile" && this.jogando && !this.menuAberto && (this.travado || this.arrastando)) this.jogador.mirar(e.movementX, e.movementY); });
    cv.addEventListener("mousedown", () => { if (this.modoControle !== "mobile" && this.jogando && !this.menuAberto && !this.travado) this.arrastando = true; });
    addEventListener("mouseup", () => { this.arrastando = false; });
    this.ui.ligar((k) => { this.audio.clique(); this.evoluir(k); }, () => this.iniciar());
    document.addEventListener("pointerlockchange", () => {
      this.travado = document.pointerLockElement === cv;
      if (this.modoControle !== "mobile" && !this.travado && this.jogando && !this.menuAberto) this.pausar();
    });
    document.addEventListener("pointerlockerror", () => {
      if (this.jogando && !this.menuAberto && this.modoControle !== "mobile") this.ui.toast("Arraste o mouse no cenário para olhar.");
    });
    addEventListener("resize", () => {
      this.limparEntrada();
      this.camera.aspect = innerWidth / innerHeight; this.camera.updateProjectionMatrix(); this.render.setSize(innerWidth, innerHeight);
      if (this.ultraFX) this.ultraFX.ajustarTamanho();
    });
  }

  aplicarControles(modo, salvar = true) {
    if (modo !== "mobile" && modo !== "desktop") return;
    this.limparEntrada(); this.modoControle = modo;
    this.ui.exibirControles(modo); this.toque.atualizar();
    if (modo === "mobile" && document.pointerLockElement) document.exitPointerLock?.();
    if (salvar) {
      try { localStorage.setItem(CONTROLES_KEY, modo); } catch (_) { /* opção mantida em memória */ }
      // Respeitar a qualidade escolhida anteriormente pelo jogador.
      try { if (modo === "mobile" && !localStorage.getItem(GRAF_KEY)) this.aplicarGraficos("leve", false); } catch (_) { /* sem armazenamento */ }
    }
  }
  limparEntrada() {
    for (const k in this.teclas) this.teclas[k] = false;
    this.arrastando = false;
    if (this.toque) this.toque.limpar();
  }
  pausar() {
    this.limparEntrada(); this.audio.silenciar(); this.audio.pausarMusica();
    if (!this.jogando) return;
    this.jogando = false; this.estado.salvar(); this.toque.atualizar();
    this.ui.menu("Pausado", "Continuar");
    if (document.pointerLockElement) document.exitPointerLock?.();
  }
  travarMouse() {
    if (this.modoControle === "mobile") return;
    try {
      const pedido = this.render.domElement.requestPointerLock?.();
      if (pedido && pedido.catch) pedido.catch(() => {}); // arraste continua disponível
    } catch (_) { /* navegador sem suporte: olhar por arraste */ }
  }
  iniciar() {
    this.limparEntrada();
    this.jogando = true; this.ui.esconderMenu(); this.audio.iniciar(); this.audio.clique();
    this.toque.atualizar(); this.travarMouse();
    this.ganhar("primeiro");
    if (!this.dicaInicial) {
      this.dicaInicial = true;
      this.ui.toast(this.modoControle === "mobile" ? "Direcional para voar · arraste para olhar · ••• para mais ações" : "E pica · R habilidade · K skins · C conquistas · H dica · = tour");
    }
  }

  coletar(g) {
    const u = g.userData, S = this.estado, j = this.jogador;
    if (u.tipo === "veneno") {
      const perda = Math.floor(S.sangue * 0.1); S.sangue -= perda; this.combo = 0; this.comboT = 0; j.stamina = 0;
      this.mundo.emitir(g.position, 0x9d33ff, 14, 3);
      this.audio.veneno(); this.ui.flash("rgba(120,255,80,.8)"); this.ui.toast(`☠ Gota venenosa! −${perda} sangue`); j.shake = 1;
      if (j.tomarDano(18)) this.morrer();
    } else {
      this.combo = this.comboT > 0 ? Math.min(this.combo + 1, 5) : 1; this.comboT = CFG.COMBO_T * this.estado.attr.combo;
      const dour = u.tipo === "dourada";
      if (dour) { this.boost = 10; this.ganhar("dourada"); }
      if (this.combo >= 5) this.ganhar("combo5");
      const ganho = Math.max(1, Math.round(S.valorGota * (dour ? 5 : 1) * this.combo * this.multSangue()));
      S.sangue += ganho;
      this.mundo.emitir(g.position, this.mundo.cores[u.tipo], dour ? 20 : 12);
      this.audio.slurp(dour); this.ui.toast(dour ? `✨ +${ganho} · XP×2 por 10s` : `+${ganho} sangue`);
    }
    this.ui.hud(S); this.salvarT = 3;
  }

  // ---- Picar humanos: muito sangue (pontos de evolução), mas eles revidam ----
  // ---- Habilidades especiais (tecla R) ----
  usarHabilidade() {
    if (!this.jogando || this.menuAberto) return;
    const S = this.estado, id = S.skin || "padrao", H = HABS[id];
    if (this.hab.cd > 0) { this.ui.toast(`⏳ ${H.nome} recarregando (${Math.ceil(this.hab.cd)}s)`); return; }
    if (H.usar(this) === false) return;
    this.mundo.fxHabilidade(id, this);
    const cd = id === "tusk" ? [10, 8, 6, 4][Math.max(1, S.mantis.length) - 1] : H.cd;
    this.hab.cd = this.hab.cdTotal = cd; this.hab.ativo = H.dur || 0;
    this.audio.tom(520, 880, 0.18, "triangle", 0.18); this.audio.tom(880, 1320, 0.2, "sine", 0.12, 0.08);
    this.ui.toast(`${H.ico} ${H.nome}!`); this.jogador.modelo.punch = 0.6;
    if (!S.habs.includes(id)) { S.habs.push(id); S.salvar(); this.ganhar("poder1"); if (S.habs.length >= Object.keys(HABS).length) this.ganhar("poderes"); }
  }
  atualizarHab(dt) {   // recargas, duração dos efeitos, poça de cura e stamina infinita
    for (const k in this.buff) if (this.buff[k] > 0) this.buff[k] = Math.max(0, this.buff[k] - dt);
    if (this.buff.frenesi <= 0 && this.alvosFrenesi.size) this.finalizarFrenesi();
    this.hab.cd = Math.max(0, this.hab.cd - dt); this.hab.ativo = Math.max(0, this.hab.ativo - dt);
    this.escalaTempo = this.buff.tempo > 0 ? 0.08 : 1;
    const j = this.jogador, S = this.estado;
    if (this.buff.stamInf > 0) j.stamina = S.staminaMax;
    if (this.zona) {
      this.zona.t -= dt; const dx = j.pos.x - this.zona.x, dz = j.pos.z - this.zona.z;
      if (dx * dx + dz * dz < this.zona.r * this.zona.r && j.pos.y < CFG.YMIN + 6) { j.vida = Math.min(S.vidaMax, j.vida + 12 * dt); j.stamina = Math.min(S.staminaMax, j.stamina + 40 * dt); }
      if (this.zona.t <= 0) this.zona = null;
    }
    this.ui.habilidade(S.skin, this.hab.cd, this.hab.cdTotal, this.hab.ativo);
  }
  multSangue() { return Math.min(4, (this.boost > 0 ? 2 : 1) * (this.buff.sangue > 0 ? 2 : 1) * (this.buff.frenesi > 0 ? 2 : 1)); } // limita empilhamento de bônus
  fatorGas() { return this.buff.gas > 0 ? 0 : this.estado.attr.gas; }
  fatorColeta() { return this.buff.scan > 0 ? 2.5 : 1; }
  atordoar(r, seg) { const p = this.jogador.pos; for (const h of this.mundo.humanos) if (h.alvo.distanceTo(p) < r) { h.atord = Math.max(h.atord || 0, seg); h.raiva = 0; } }
  rajadaTusk() {   // Unhas fisicas voam ate humanos e acertam so no impacto
    const S=this.estado, ato=Math.max(1,S.mantis.length), p=this.jogador.pos;
    const alcance=ato>=4?25:22;
    const alvos=this.mundo.humanos.filter(h => h.pronto<=0 && !h.unhaPendente && h.alvo.distanceTo(p)<alcance)
      .sort((a,b)=>a.alvo.distanceToSquared(p)-b.alvo.distanceToSquared(p))
      .slice(0,ato>=4?99:ato);
    if (!alvos.length) { this.ui.toast(`🦗 Nenhum humano ao alcance (${alcance} unidades)`); return false; }
    alvos.forEach((h,i)=>this.mundo.dispararUnhaTusk(this,h,ato,i*0.09));
    this.ui.toast(`🦗 ${alvos.length} unha(s) disparada(s)!`);
    return true;
  }

  // Restaura a recarga normal de quem recebeu apenas a primeira picada do Frenesi.
  // Assim o bônus de 3 segundos não permanece após a habilidade ou troca de skin.
  finalizarFrenesi() {
    for (const [h, dados] of this.alvosFrenesi) {
      if (dados.qtd === 1 && Number.isFinite(h.ultimaPicada)) {
        h.pronto = Math.max(h.pronto, Math.max(0, 18 - (this.t - h.ultimaPicada)));
      }
    }
    this.alvosFrenesi.clear();
  }

  picar() {
    const h = this.mundo.humanoPerto;
    if (!this.jogando || this.menuAberto || !h) return;
    const frenesiAtivo = this.buff.frenesi > 0;
    const feitas = frenesiAtivo ? (this.alvosFrenesi.get(h)?.qtd || 0) : 0;
    // A primeira picada libera outra após 3s. A segunda é a última nesta ativação.
    if (h.pronto > 0 || (frenesiAtivo && feitas >= 2)) return;
    const S = this.estado;
    if (frenesiAtivo) this.alvosFrenesi.set(h, { qtd: feitas + 1, ultima: this.t });
    h.ultimaPicada = this.t;
    this.combo = this.comboT > 0 ? Math.min(this.combo + 1, 5) : 1;
    this.comboT = CFG.COMBO_T * S.attr.combo;
    const ganho = Math.round((25 + S.valorGota * 6) * this.combo * this.multSangue() * (h.atord > 0 ? 1.5 : 1));
    S.sangue += ganho; S.picadas++;
    // Frenesi substitui, e nao soma, a cura passiva da skin.
    const cura = frenesiAtivo ? 30 : S.attr.cura;
    if (cura) this.jogador.vida = Math.min(S.vidaMax, this.jogador.vida + cura);
    h.pronto = frenesiAtivo && feitas === 0 ? 3 : 18;
    h.raiva = this.buff.invis > 0 ? 0 : 4; h.tapa = 0.6;
    this.mundo.emitir(h.alvo, 0xff1744, 26, 4); this.audio.picada(); this.ui.flash("rgba(255,23,68,.35)");
    const texto = frenesiAtivo && feitas === 0 ? " · segundo ataque em 3s" : frenesiAtivo ? " · 2/2 neste Frenesi" : " — fuja do tapa!";
    this.ui.toast(`🩸 Picou ${h.nome}! +${ganho} sangue${texto}`); this.ui.hud(S); this.salvarT = 3;
    if (S.picadas >= 10) this.desbloquear("vampiro");
  }
  tapa(h) {
    if (this.buff.tempo > 0) { this.ui.toast("⏳ O tempo está parado: ninguém consegue te acertar!"); return; }
    if (this.estado.attr.intang) { this.ui.toast("👻 O tapa atravessou você!"); return; }   // fantasma é intangível
    if (this.buff.radio > 0 || this.buff.invis > 0 || this.jogador.escudo > 0) { this.ui.toast(this.buff.radio > 0 ? "☢️ A aura impediu o tapa!" : this.buff.invis > 0 ? "👻 Ele não te viu!" : "🔒 O cadeado bloqueou o tapa!"); return; }
    const j = this.jogador;
    j.vel.add(this.tmpEgg.copy(j.pos).sub(h.alvo).setY(0.3).normalize().multiplyScalar(14)); j.shake = 1;
    this.combo = 0; this.comboT = 0; this.kills.tapasRecebidos++; this.audio.tapa(); this.ui.toast(`👋 ${h.nome} te deu um tapa!`);
    this.dano(30);
  }

  // ---- Easter eggs e skins ----
  // ---- Skins e menu de coleção (K = skins, C = conquistas): a simulação pausa enquanto está aberto ----
  mudarCorPixel(cor) {
    if (!corPixelValida(cor)) return false;
    const S = this.estado, nova = cor.toLowerCase();
    if (S.pixelCor !== nova) {
      S.pixelCor = nova;
      S.salvar();
      // Se equipada, o modelo em jogo atualiza na hora.
      if (S.skin === "pixel") this.jogador.modelo.aplicar();
      // A mesma escolha é herdada pelo estado exclusivo do preview.
      if (this.ui.pv && this.ui.pv.modelo && this.ui.skSel === "pixel") this.ui.pv.modelo.aplicar();
    }
    return true;
  }
  alternarAuraTusk() {
    const S = this.estado;
    S.auraTusk = S.auraTusk === false;
    S.salvar();
    this.jogador.modelo.aplicar();
    this.ui.toast(S.auraTusk ? "✨ Aura do Tusk ligada" : "✨ Aura do Tusk desligada");
  }
  apiColecao() { return { mudarCorPixel: (cor) => this.mudarCorPixel(cor), alternarAuraTusk: () => this.alternarAuraTusk(), escolher: (id) => this.escolherSkin(id), progresso: (id) => this.progresso(id), aba: (a) => this.abrirColecao(a, true), fechar: () => this.fecharColecao() }; }
  abrirColecao(aba, trocar = false) {
    if (!trocar && this.menuAberto && this.aba === aba) { this.fecharColecao(); return; }
    if (!this.menuAberto) this.audio.clique();
    this.limparEntrada();
    this.aba = aba; this.menuAberto = true; this.audio.silenciar(); this.toque.atualizar();
    this.ui.abrirColecao(this.estado, aba, this.apiColecao());
  }
  fecharColecao() {
    this.ui.fecharColecao(); this.ui.fecharPergunta(); this.menuAberto = false; this.audio.clique();
    this.limparEntrada(); this.toque.atualizar();
    if (this.jogando) this.travarMouse();
  }
  ajustarLimites() { const S = this.estado, j = this.jogador; j.vida = Math.min(j.vida, S.vidaMax); j.stamina = Math.min(j.stamina, S.staminaMax); }   // bônus de skin podem diminuir os máximos
  limparPoderAnterior() {
    this.finalizarFrenesi();
    for (const k in this.buff) this.buff[k] = 0;
    this.jogador.escudo = 0; this.zona = null; this.hab.ativo = 0;
    this.escalaTempo = 1;
  }
  escolherSkin(id) {
    const S = this.estado;
    if (id && !S.skins.includes(id)) return;
    if (S.skin !== id) this.limparPoderAnterior();
    S.skin = id; this.jogador.modelo.aplicar(); this.jogador.modelo.punch = 0.6; this.ajustarLimites(); this.audio.clique();
    this.ui.toast(id ? `Skin: ${CFG.SKINS[id].nome}` : "Skin: padrão"); S.salvar();
    if (this.menuAberto) this.ui.abrirColecao(S, this.aba, this.apiColecao());
  }
  desbloquear(id) {
    const S = this.estado, sk = CFG.SKINS[id]; if (!sk || S.skins.includes(id)) return;
    S.skins.push(id); if (S.skin !== id) this.limparPoderAnterior(); S.skin = id; this.jogador.modelo.aplicar(); this.jogador.modelo.punch = 1; this.ajustarLimites();
    this.audio.egg(); this.mundo.emitir(this.jogador.pos, sk.brilho || 0xffffff, 40, 6);
    if (id === "eletrizado") { this.ui.flash("rgba(120,200,255,.85)"); this.jogador.shake = 1; }
    if (id === "pintado") this.ui.flash("rgba(208,16,32,.7)");
    this.ui.evolucao(`🥚 Easter egg! Skin: ${sk.nome}`);
    this.ui.toast(`Skins ${S.skins.length}/${Object.keys(CFG.SKINS).length} — K abre o menu de skins`); S.salvar();
    this.ganhar("skin_" + id);
  }
  dica() {
    const S = this.estado, msgs = Object.keys(CFG.SKINS).filter((k) => !S.skins.includes(k)).map((k) => CFG.SKINS[k].dica);
    if (S.skins.includes("tusk") && S.mantis.length < 4) msgs.push(`Tusk Ato ${S.mantis.length}/4: faltam ${4 - S.mantis.length} partes do louva-a-deus (procure um brilho verde)`);
    if (!msgs.length) { this.ui.toast("🏆 Você achou todos os easter eggs!"); return; }
    this.ui.toast(`🔍 ${msgs[this.egg.dica++ % msgs.length]}`);
  }
  checarEggs(dt) {
    const p = this.jogador.pos, F = CFG.YMIN, e = this.egg, P = this.mundo.pontos, S = this.estado;
    // Relógio da sala de Biologia
    if (p.distanceToSquared(P.relogio) < 2.2 * 2.2) this.desbloquear("relojoeiro");
    // Pousar em cima do galão radioativo por 1 s (a posição vem do próprio galão no cenário)
    const g = P.galao;
    e.tanque = Math.hypot(p.x - g.x, p.z - g.z) < 2.6 && p.y > g.y && p.y < g.y + 2.4 ? e.tanque + dt : 0;
    if (e.tanque > 1) this.desbloquear("radioativo");
    // Cesta: cruzar o aro de cima para baixo
    for (const a of P.aros) if (Math.hypot(p.x - a.x, p.z - a.z) < 0.95 && e.yAnt > a.y && p.y <= a.y) this.desbloquear("jogador");
    e.yAnt = p.y;
    // Ficar 2 s diante do espelho do banheiro
    const es = P.espelho;
    e.espelho = p.x > es.x0 && p.x < es.x1 && p.z > es.z0 && p.z < es.z1 && Math.abs(p.y - es.y) < 2.5 ? e.espelho + dt : 0;
    if (e.espelho > 2) this.desbloquear("fantasma");
    // Telão do auditório: ficar parado 3 s diante dele (o progresso aparece na tela e a moldura muda de cor)
    const T = P.telao, perto = Math.abs(p.x - T.x) < T.hw && p.z > T.z - 14 && p.z < T.z - 1.2 && p.y > F + 3.5 && p.y < F + 12.2 && this.jogador.vel.length() < 3.5;
    e.tela = perto ? e.tela + dt : Math.max(0, e.tela - dt * 2);
    this.mundo.telaoProg = Math.min(1, e.tela / 3);
    if (perto && e.tela > 0.2 && !S.skins.includes("carreta")) this.eggMsg = `📺 O telão está ligando... ${Math.min(3, e.tela).toFixed(1)} / 3 s (fique parado)`;
    if (e.tela >= 3) { e.tela = 0; this.desbloquear("carreta"); }
    // Tomada do projeto de eletricidade, poça de tinta vermelha e extintores
    if (p.distanceToSquared(P.tomada) < 1.6 * 1.6) this.desbloquear("eletrizado");
    if (Math.hypot(p.x - P.tinta.x, p.z - P.tinta.z) < 3.4 && p.y < F + 3) this.desbloquear("pintado");
    for (const x of P.extintores) if (Math.hypot(p.x - x.x, p.z - x.z) < 1.5 && p.y < F + 4.2) { this.desbloquear("extintor"); break; }
    // Armário trancado (F), partes do louva-a-deus (Tusk) e quadro de matemática (Q)
    this.checarArmario(dt);
    for (const m of P.mantis) if (!S.mantis.includes(m.id) && p.distanceToSquared(m.pos) < 2.4 * 2.4) this.pegarParte(m.id);
    if (!this.eggMsg && !S.skins.includes("mosquito8000") && p.z < -78 && p.distanceToSquared(P.quadroMat) < 22 * 22) this.eggMsg = "📝 Quadro de matemática: aperte Q para responder";
    // Salas visitadas
    const sala = CFG.SALAS.find(([, x0, x1, z0, z1]) => p.x >= x0 && p.x < x1 && p.z >= z0 && p.z < z1);
    if (sala) this.ui.sala(sala[0]);
    if (sala && !S.salas.includes(sala[0])) {
      S.salas.push(sala[0]); S.salvar(); this.ui.toast(`📍 ${sala[0]} (${S.salas.length}/${CFG.SALAS.length} salas)`);
      const id = { "Enfermaria": "enfermaria", "Auditório": "auditorio", "Artes": "artes", "Biblioteca": "biblioteca", "Laboratório": "laboratorio" }[sala[0]];
      if (id) this.ganhar(id);
      if (S.salas.length >= CFG.SALAS.length) this.ganhar("explorador");
    }
  }

  checarArmario(dt) {
    const A = this.mundo.armario; if (!A || A.aberto) return;
    const perto = this.jogador.pos.distanceToSquared(A.pos) < 5.5 * 5.5;
    if (perto && (this.teclas.f || this.toque.teclas.f)) {
      A.prog = Math.min(1, A.prog + dt / 3.2); this.eggMsg = `🔓 Arrombando o armário... ${Math.round(A.prog * 100)}%`;
      this.fxT2 = (this.fxT2 || 0) - dt;
      if (this.fxT2 <= 0) { this.fxT2 = 0.14; this.mundo.emitir(A.cad.position, 0xffcc55, 4, 3); this.audio.tom(260 + Math.random() * 260, 120, 0.08, "square", 0.13); this.jogador.shake = Math.max(this.jogador.shake, 0.12); }
      if (A.prog >= 1) { A.aberto = true; A.vy = 0; this.mundo.emitir(A.cad.position, 0xffd84d, 40, 6); this.desbloquear("cadeado"); }
    } else {
      A.prog = Math.max(0, A.prog - dt * 0.6);
      if (perto) this.eggMsg = "🔒 Armário trancado e amassado... segure F para arrombar";
    }
  }
    pegarParte(id) {
    // Cada parte encontrada desbloqueia uma conquista individual
    const S = this.estado;

    const partes = {
      cabeca: {
        nome: "Cabeça",
        conquista: "mantis_cabeca"
      },
      foices: {
        nome: "Foices dianteiras",
        conquista: "mantis_foices"
      },
      torax: {
        nome: "Tórax e asas",
        conquista: "mantis_torax"
      },
      abdomen: {
        nome: "Abdômen e patas",
        conquista: "mantis_abdomen"
      }
    };

    const parte = partes[id];

    if (!parte || S.mantis.includes(id)) return;

    // Registra a parte coletada
    S.mantis.push(id);

    const n = S.mantis.length;

    // Efeitos da coleta
    this.audio.egg();
    this.mundo.emitir(this.jogador.pos, 0x7dff3a, 30, 5);

    // Salva o progresso
    S.salvar();

    // Notificação da parte encontrada
    this.ui.toast(`🦗 Parte encontrada: ${parte.nome} (${n}/4)`);

    // Desbloqueia a conquista individual
    this.ganhar(parte.conquista);

    // Primeira parte: desbloqueia a skin Tusk
    if (n === 1) {
      this.desbloquear("tusk");
    } else {
      // Evolução visual do Tusk
      if (S.skin === "tusk") {
        this.jogador.modelo.aplicar();
        this.jogador.modelo.punch = 1;
        this.ajustarLimites();
      } else {
        this.ui.toast(
          `🦗 O Tusk evoluiu para o Ato ${n}! Equipe no menu K`
        );
      }

      this.ui.evolucao(`TUSK — ATO ${n}`);
    }

    // Conquista especial ao completar todas as partes
    if (n >= 4) {
      this.ganhar("mantis");
      this.ui.evolucao("🦗 TUSK — ATO 4 COMPLETO!");
    }
  }
  abrirPergunta() {
    if (this.menuAberto || !this.jogando) return;
    if (this.jogador.pos.distanceToSquared(this.mundo.pontos.quadroMat) > 22 * 22) { this.ui.toast("Chegue perto do quadro de matemática (Sala 1)"); return; }
    this.limparEntrada(); this.menuAberto = true; this.audio.silenciar(); this.toque.atualizar();
    this.ui.pergunta("📝 Matemática — Sala 1", "2 + 2 = ?", (txt) => this.responderQuadro(txt), () => this.fecharColecao());
  }
  responderQuadro(txt) {
    const r = String(txt).trim().toLowerCase().replace(/[\s.]/g, "");
    if (r === "") return { msg: "Digite uma resposta." };
    if (r === "8000") { this.desbloquear("mosquito8000"); return { msg: "🤖 O quadro processou... 8000?! Sistema MOSQUITO-8000 online!", fechar: true }; }
    if (r === "4" || r === "quatro") { this.ganhar("matematica"); return { msg: "✔ Correto! 2 + 2 = 4.", fechar: true }; }
    return { msg: "✘ Resposta errada. Tente de novo!" };
  }

  // Efeitos contínuos das skins: fumaça, espuma, pingos de tinta e notas musicais
  fxSkin(dt) {
    const sk = this.estado.skin && CFG.SKINS[this.estado.skin]; if (!sk) return;
    const w = this.mundo, mo = this.jogador.modelo, o = this.tmpFx || (this.tmpFx = V(0, 0, 0));
    this.fxT = (this.fxT || 0) - dt;
    if (this.fxT <= 0) {
      this.fxT = 0.07;
      if (sk.fumaca) w.emitir(mo.traseira(o), 0x8a8f99, 1, 0.8, "fumaca");
      if (sk.espuma) w.emitir(mo.traseira(o), 0xffffff, 2, 2.2, "espuma");
      if (sk.goticulas && Math.random() < 0.85) w.pingar(mo.traseira(o), this.jogador.vel);   // pingos viram manchas no chão
    }
    this.fxBuffT = (this.fxBuffT || 0) - dt;
    if (this.fxBuffT <= 0) {
      this.fxBuffT = 0.25;
      const b = this.buff;
      const cor = b.radio>0 ? 0x39ff14 : b.tempo>0 ? 0xffd84d : b.frenesi>0 ? 0xff1744 :
        b.vel>0 ? 0xff9a22 : b.scan>0 ? 0x00e5ff :
        b.gas>0 ? 0xcfefff : this.jogador.escudo>0 ? 0xffc933 : null;
      if (cor!==null) w.emitir(this.jogador.pos,cor,3,1.7);
    }
    if (sk.rig) { const b = mo.beat; if (b > 0.9 && !this.fxBeat) { this.fxBeat = true; w.emitir(mo.traseira(o), Math.random() < 0.5 ? 0xff44cc : 0x44ddff, 6, 4); } else if (b < 0.5) this.fxBeat = false; }
  }

  // ---------------------------------------------------------
  // CONQUISTAS: categorias, raridade (bronze/prata/ouro), prêmio em sangue e segredos; aparecem no menu C
  // ---------------------------------------------------------
  ganhar(id) {
    const S = this.estado, c = CFG.CONQ.find((x) => x.id === id);
    if (!c || S.conq.includes(id)) return;
    S.conq.push(id); S.sangue += c.premio || 0; S.salvar(); this.ui.hud(S);
    this.audio.egg(); if (c.r === "o") this.ui.evolucao(`🏆 ${c.nome}`);
    this.ui.toast(`🏆 ${c.nome} · +${c.premio} sangue · ${S.conq.length}/${CFG.CONQ.length}`); this.mostrarConquista(c);
  }
  mostrarConquista(c) {
    const r = CFG.RAR[c.r], e = document.createElement("div"), pos = this.pilhaConq = (this.pilhaConq || 0) + 1;
    e.className = "hx-conquista";
    e.style.setProperty("--conquista-indice", String(pos - 1));
    e.style.cssText += `position:fixed;right:22px;top:${80 + (pos - 1) * 76}px;display:flex;gap:12px;align-items:center;background:rgba(12,10,22,.95);border:1px solid ${r.cor};border-left:5px solid ${r.cor};border-radius:12px;padding:12px 16px;z-index:7;font-family:Syne,Figtree,system-ui,sans-serif;color:#eef2f8;pointer-events:none;box-shadow:0 0 22px ${r.cor}55`;
    e.innerHTML = `<span style="font-size:1.6rem">${c.ico}</span><span><small style="display:block;font:800 .62rem Figtree,sans-serif;letter-spacing:.08em;color:${r.cor}">CONQUISTA · ${r.nome.toUpperCase()}</small><b style="display:block;font:800 .95rem Syne,sans-serif">${c.nome}</b><small style="font:600 .74rem Figtree,sans-serif;color:#a8b0c0">${c.desc} · +${c.premio}</small></span>`;
    document.body.appendChild(e);
    setTimeout(() => { e.style.transition = "opacity .5s"; e.style.opacity = "0"; setTimeout(() => { e.remove(); this.pilhaConq = Math.max(0, this.pilhaConq - 1); }, 600); }, 3600);
  }
  progresso(id) {
    if (/^fase\d+$/.test(id)) { const min = +id.slice(4); return { v: Math.min(this.estado.total, min), max: min }; }
    const S = this.estado, k = this.kills, n = Object.keys(CFG.SKINS).length;
    const m = { sangue500: [S.sangue, 500], sangue5000: [S.sangue, 5000], nivel10: [S.total, 10], nivel40: [S.total, 40], asas10: [S.nv.asas, 10], tromba10: [S.nv.tromba, 10], estomago10: [S.nv.estomago, 10], corpo10: [S.nv.corpo, 10],
      picada25: [S.picadas, 25], picada100: [S.picadas, 100], tapas: [k.tapasRecebidos, 5], gas3: [k.gas, 3], sobreviver: [this.egg.vida, 180],
      colecionador: [S.skins.length, 5], poderes: [S.habs.length, Object.keys(HABS).length], mantis: [S.mantis.length, 4], todas: [S.skins.length, n], dez: [S.conq.length, 10], explorador: [S.salas.length, CFG.SALAS.length] }[id];
    return m ? { v: Math.min(m[0], m[1]), max: m[1] } : null;
  }
  checarConquistas(dt) {
    const S = this.estado, e = this.egg, k = this.kills, n = Object.keys(CFG.SKINS).length;
    if (S.sangue >= 500) this.ganhar("sangue500");
    if (S.sangue >= 5000) this.ganhar("sangue5000");
    if (S.total >= 10) this.ganhar("nivel10");
    if (S.total >= 40) this.ganhar("nivel40");
    for (const e of CFG.ESTAGIOS) if (e.min && S.total >= e.min) this.ganhar("fase" + e.min);   // conquistas de estágio
    for (const u of ["asas", "tromba", "estomago", "corpo"]) if (S.nv[u] >= 10) this.ganhar(u + "10");
    if (S.picadas >= 1) this.ganhar("picada1");
    if (S.picadas >= 25) this.ganhar("picada25");
    if (S.picadas >= 100) this.ganhar("picada100");
    if (k.tapasRecebidos >= 5) this.ganhar("tapas");
    if (k.gas >= 3) this.ganhar("gas3");
    if (e.tour) this.ganhar("turista");
    if (e.fala) this.ganhar("fala");
    e.vida += dt; if (e.vida > 180) this.ganhar("sobreviver");   // morrer zera o relógio (veja morrer())
    if (S.skins.length >= 5) this.ganhar("colecionador");
    if (S.skins.length >= n) this.ganhar("todas");
    if (S.conq.length >= 10) this.ganhar("dez");
  }

  // ---- Itens perdidos do mapa (tecla B): carteira e livro perdido ----
  interagirComPerdidos() {
    const S = this.estado, p = this.jogador.pos, c = this.mundo.carteira, L = this.mundo.livroPerdido;
    if (L && !L.entregue) {
      if (!L.carregando && L.g.visible && p.distanceToSquared(L.g.position) <= 36) {
        L.carregando = true; L.g.visible = false; this.audio.egg(); this.ui.toast("📘 Livro da cantina encontrado! Leve-o à estante iluminada da biblioteca (B)."); return;
      }
      if (L.carregando && L.shelf && p.distanceToSquared(L.shelf.position) <= 49) {
        L.carregando = false; L.entregue = true; L.g.visible = false; if (L.shelf) L.shelf.visible = false;
        if (this.mundo.livroDevolvidoVisual) this.mundo.livroDevolvidoVisual.visible = true;
        S.livroDevolvido = true;
        S.sangue += L.reward; this.audio.egg();
        this.ui.toast(`📚 Livro devolvido! +${L.reward} sangue · Skin Mosquito Encadernado desbloqueada!`);
        this.desbloquear('encadernado'); this.ganhar('livro_devolvido');
        this.ui.hud(S); S.salvar(); return;
      }
    }
    if (!this.jogando || !c || !c.visivel || p.distanceToSquared(c.g.position) > 36) { this.ui.toast("Nenhuma carteira ou livro por perto"); return; }
    S.carteiras++; S.sangue += 250; this.jogador.modelo.punch = 0.8; this.mundo.posicionarCarteira(S);
    this.audio.egg(); this.ui.toast(`🎒 Carteira devolvida! +250 sangue (${S.carteiras}/3)`); this.ui.hud(S); S.salvar(); this.ganhar("carteira");
  }
  tour() {   // = abre/fecha o passeio guiado pela escola
    if (this.ui.dialogoAberto()) { this.ui.fecharDialogo(); return; }
    this.audio.clique(); this.egg.tour = true;
    this.ui.dialogo("TOUR DA ESCOLA",
      "CORREDOR CENTRAL: armários, bebedouros, extintores e uma carteira perdida (B)\n" +
      "NORTE: Artes · Sala 1 · Sala 2 · Biblioteca (estante de devolução, B) · Laboratório · Enfermaria\n" +
      "SUL: Cantina (livro perdido em uma mesa, B) · Ginásio · Banheiro · Auditório (palco e estátua)\n\n" +
      "E pica humanos · R habilidade · K skins · C conquistas · H dica\n" +
      `Há ${Object.keys(CFG.SKINS).length} skins para achar. Devolver o livro libera o Mosquito Encadernado.`,
      "Feche com = ou clique aqui", 12000);
  }

  dano(v, continuo = false) {
    v *= 1 - this.estado.attr.def;   // redução de dano da skin
    if (this.jogador.tomarDano(v)) return this.morrer();
    if (!continuo) { this.ui.flash("rgba(232,41,75,.8)"); this.audio.dano(); }
  }
  morrer() {
    this.limparEntrada();
    const S = this.estado, perda = Math.floor(S.sangue * 0.25); S.sangue -= perda;
    this.combo = 0; this.comboT = 0; this.boost = 0; this.egg.morte++; this.egg.vida = 0; this.jogador.reaparecer();
    this.audio.dano(); this.ui.flash("rgba(232,41,75,.9)"); this.ui.toast(`Você foi pego! −${perda} sangue`); this.ui.hud(S); S.salvar();
  }

  evoluir(k) {
    if (!this.jogando || this.menuAberto) return;
    const S = this.estado;
    if (!CFG.UPS[k]) return;
    if (S.nv[k] >= CFG.UP_MAX) { this.ui.toast(`${CFG.UPS[k].nome}: nível máximo ${CFG.UP_MAX}!`); return; }
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
    this.atualizarHab(dt);
    j.fator = (w.emPerigo === "gas" ? 0.65 : 1) * (this.buff.vel > 0 ? 1.7 : 1) * (this.buff.pesado > 0 ? 0.45 : 1);
    j.update(dt, this.teclas, this.modoControle === "mobile" ? this.toque : null);
    w.update(dt, this);
    this.eggMsg = ""; this.checarEggs(dt); this.fxSkin(dt);
    if (this.comboT > 0 && (this.comboT -= dt) <= 0) this.combo = 0;
    if (this.boost > 0) this.boost -= dt;
    this.ui.combo(this.combo, this.comboT, this.boost);
    this.ui.barras(j.stamina, S.staminaMax, j.vida, S.vidaMax);
    this.ui.alerta(w.emPerigo === "gas" ? "☣ GÁS TÓXICO — saia!" : w.emPerigo === "poca" ? "☣ Poça tóxica — suba!" : w.avisoGas ? "⚠ INSETICIDA a caminho!" : w.humanoPerto ? `🩸 Aperte E para picar ${w.humanoPerto.nome}` : this.eggMsg ? this.eggMsg : (w.livroPerdido && !w.livroPerdido.entregue && !w.livroPerdido.carregando && j.pos.distanceToSquared(w.livroPerdido.g.position) < 36) ? "📘 Aperte B para pegar o livro perdido" : (w.livroPerdido && w.livroPerdido.carregando && w.livroPerdido.shelf && j.pos.distanceToSquared(w.livroPerdido.shelf.position) < 49) ? "📚 Aperte B para devolver o livro à estante" : (w.carteira && w.carteira.visivel && j.pos.distanceToSquared(w.carteira.g.position) < 36) ? "🎒 Aperte B para pegar a carteira" : "",
      w.emPerigo ? "#8dff6a" : w.avisoGas ? "#ffd84d" : this.eggMsg ? "#ff8ad8" : "#ff6b8a");
    this.ui.perigo("rgba(120,255,80,.7)", w.emPerigo ? 0.35 : 0);
    this.audio.zumbir(clamp(j.vel.length() / (S.velMax * 2), 0, 1), j.corre);
    this.checarConquistas(dt);
    // Mosquitão da rua: falas conforme a distância
    const mo = w.mosquito;
    if (mo) {
      const d = j.pos.distanceTo(mo.g.position);
      if (d < 7) { this.falaT = (this.falaT || 0) - dt; if (this.falaT <= 0) { this.falaT = 9; w.falar(moFrases[(this.egg.falas = (this.egg.falas || 0) + 1) % moFrases.length]); } }
      mo.trompa.rotation.y = Math.sin(this.t * 0.8) * 0.25; mo.g.rotation.y = Math.sin(this.t * 0.25) * 0.08;
      if (d < 3.5) { this.egg.fala = true; if (!S.skins.includes("mosquito")) this.desbloquear("mosquito"); }
    }
    if (this.salvarT > 0 && (this.salvarT -= dt) <= 0) S.salvar();
  }

  laco() {
    requestAnimationFrame(() => this.laco());
    const dt = Math.min(this.relogio.getDelta(), 0.05); this.t += dt;
    if (this.jogando && !this.menuAberto) this.atualizar(dt);
    // A música do Caminhão de som só toca com a skin equipada, jogo rodando, sem menu aberto e com a aba visível
    this.audio.tocarMusicaCarreta(this.jogando && !this.menuAberto && !document.hidden && this.estado.skin === "carreta", this.estado.skin === "carreta");
    this.jogador.animar(dt, this.t, this.jogando);
    this.jogador.modelo.tick(this.t, dt, this.estado.skin === "fantasma" && this.buff.invis > 0); this.jogador.camera3p(dt); this.ui.atualizar(dt);
    if (this.modoGrafico === 'ultra') {
      // O mosquito mantem seus detalhes neon, mas nao ilumina o ambiente como um vaga-lume.
      this.jogador.modelo.luzSkin.intensity = Math.min(this.jogador.modelo.luzSkin.intensity, 0.10);
      // Fonte acompanha o jogador de forma suave; objetos que projetam
      // sombras sao filtrados em intervalos para economizar CPU/GPU.
      const p = this.jogador.pos;
      const x = Math.round(p.x * 16) / 16, z = Math.round(p.z * 16) / 16;
      this.luzUltra.position.set(x - 12, CFG.YMAX + 22, z - 12);
      this.luzUltra.target.position.set(x, CFG.YMIN + 1.2, z);
      this.luzUltra.target.updateMatrixWorld();
      this._sombraT -= dt;
      if (this._sombraT <= 0) {
        this._sombraT = 0.38;
        this.mundo.atualizarSombras(p, true);
      }
    }
    this._timerDecor -= dt;
    if (this._timerDecor <= 0 && this.jogando) {
      this._timerDecor = this.modoGrafico === 'leve' ? 0.7 : 1.2;
      this.mundo.atualizarDecoracoes(this.jogador.pos, GRAFICOS[this.modoGrafico].alcanceDecor);
    }
    const limiteFPS = GRAFICOS[this.modoGrafico].fps;
    const agora = performance.now();
    if (limiteFPS && this._ultimoRender && agora - this._ultimoRender < 1000 / limiteFPS - 1.5) return;
    this._ultimoRender = agora;
    if (this.modoGrafico === 'ultra' && this.ultraFX) {
      try { this.ultraFX.render(this.cena, this.camera, this.t); }
      catch (err) {
        console.warn('[MOSQUITO ULTRA] Desativando efeito por incompatibilidade:', err);
        this.ultraFX.dispose(); this.ultraFX = null;
        this.render.setRenderTarget(null);
        this.render.render(this.cena, this.camera);
      }
    } else this.render.render(this.cena, this.camera);
    this._frames++;
    if (!this._fpsStamp) this._fpsStamp = agora;
    if (agora - this._fpsStamp >= 1000) {
      const fps = $('hx-fps');
      if (fps && !fps.hidden) fps.textContent = `${Math.round(this._frames * 1000 / (agora - this._fpsStamp))} FPS · ${GRAFICOS[this.modoGrafico].nome}`;
      this._fpsStamp = agora; this._frames = 0;
    }
  }
}

console.info("[MOSQUITO EVOLUTION V15B] Encadernado conectado · Articulações e cintura corrigidas · Livro na cantina");
new GameManager();
})();
