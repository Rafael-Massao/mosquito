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
    pixel:      { nome: "8-bit pixelado",     corpo: 0xffffff, abd: 0xffffff, brilho: 0x33ff66, ei: 0, pixel: true, dica: "Um código clássico de videogame: ↑ ↑ ↓ ↓ ← → ← → B A" },
    dengue:     { nome: "Aedes aegypti",      corpo: 0x121212, abd: 0x121212, perna: 0x121212, brilho: 0xffffff, ei: 0, listras: true, dica: "Digite o nome da doença mais famosa que o mosquito transmite" },
    relojoeiro: { nome: "Relojoeiro dourado", corpo: 0xffd84d, abd: 0xc9a227, brilho: 0xffaa00, ei: 0.35, metal: true, dica: "O tempo voa... encoste no relógio da aula de Biologia" },
    radioativo: { nome: "Radioativo",         corpo: 0x1a3a1a, abd: 0x39ff14, brilho: 0x39ff14, ei: 0.9, asa: 0xb6ffb0, dica: "Pouse 1 s em cima do galão radioativo do laboratório" },
    jogador:    { nome: "Craque da quadra",   corpo: 0xff7a1a, abd: 0x1a1a1a, brilho: 0xff7a1a, ei: 0.3,  dica: "Faça uma cesta: atravesse um aro do ginásio de cima para baixo" },
    fantasma:   { nome: "Fantasma", neblina: true,           corpo: 0xdff4ff, abd: 0xbfe6ff, brilho: 0x88ccff, ei: 0.6, alfa: 0.35, asa: 0xffffff, dica: "Encare seu reflexo no espelho do banheiro" },
    vampiro:    { nome: "Conde Drácula",      corpo: 0x14000a, abd: 0x8b0000, brilho: 0xff0033, ei: 0.7,  dica: "Pique 10 humanos" },
    mosquito:   { nome: "Mosquitão da rua",   corpo: 0x8a8f2a, abd: 0x6b7220, brilho: 0xc9d13a, ei: 0.2,  dica: "Encare o Mosquitão da rua: a estátua sobre o palco do auditório" },
    carreta:    { nome: "Caminhão de som",    corpo: 0x15151f, abd: 0x1b1b2b, perna: 0x0a0a12, brilho: 0xff44cc, ei: 1.0, asa: 0xffd9f5, rig: true, dica: "Fique parado 3 s diante do telão do auditório (a moldura muda de cor)" },
    eletrizado: { nome: "Eletrizado",         corpo: 0x1a2030, abd: 0x24304a, perna: 0x0e1220, brilho: 0x4fd0ff, ei: 0.8, asa: 0xcfefff, metal: true, raios: true, fumaca: true, dica: "No laboratório há uma tomada ligada ao projeto de eletricidade. Encoste nela" },
    pintado:    { nome: "Meio pintado",       corpo: 0x1c1c22, abd: 0x2a1a20, perna: 0x0b0b0e, brilho: 0xd01020, ei: 0.15, meia: 0xd01020, goticulas: true, dica: "Na sala de artes alguém derrubou tinta vermelha. Encoste na poça" },
    extintor:   { nome: "Bombeiro",           corpo: 0x111111, abd: 0xc0182a, perna: 0x0b0b0b, brilho: 0xff2a2a, ei: 0.3, asa: 0xffd0d0, faixas: true, espuma: true, dica: "Encoste em um extintor de incêndio (há um escondido na cozinha da cantina)" },
    cadeado:    { nome: "Mosquito Cadeado", corpo: 0x3c424e, abd: 0x2c313b, perna: 0x181b21, brilho: 0xffc933, ei: 0.2, metal: true, asa: 0xcfd6e2, cadeado: true, dica: "Há um armário trancado e amassado no corredor, entre as salas 1 e 2. Segure F perto dele para arrombar" },
    tusk:       { nome: "Tusk", corpo: 0xf59ab8, abd: 0xef7fa6, perna: 0xc2527f, brilho: 0xff8ac0, ei: 0.18, tusk: true, dica: "Há 4 partes de um louva-a-deus espalhadas pela escola (brilho verde). Cada uma evolui o Tusk de Ato, como o stand do JoJo" },
    mosquito8000: { nome: "Mosquito 8000", corpo: 0x8f9bb0, abd: 0x6c7890, perna: 0x3b4252, brilho: 0x00e5ff, ei: 0.9, metal: true, asa: 0x9be9ff, robo: true, dica: "O quadro de matemática da Sala 1 aceita respostas (tecla Q). A certa dá conquista... mas e se você pensar bem maior?" },
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
const SKIN_ICO = { pixel: "👾", dengue: "🦟", relojoeiro: "⏳", radioativo: "☢️", jogador: "🏀", fantasma: "👻", vampiro: "🧛", mosquito: "🪰", carreta: "🔊", eletrizado: "⚡", pintado: "🎨", extintor: "🧯", cadeado: "🔒", tusk: "🦗", mosquito8000: "🤖" };

// ---- Habilidades especiais (tecla R): cada skin tem a sua; "padrao" vale para quem está sem skin. usar(g) recebe o GameManager e pode devolver false para cancelar a recarga ----
const HABS = {
  padrao:     { nome: "Impulso", ico: "💨", cd: 6, dur: 0, desc: "Dispara um impulso veloz para a frente.", usar(g) { g.jogador.vel.addScaledVector(g.jogador.frente, 26); g.mundo.emitir(g.jogador.pos, 0xffffff, 16, 4, "espuma"); } },
  pixel:      { nome: "Glitch", ico: "👾", cd: 6, dur: 0, desc: "Teletransporta 14 unidades para a frente, parando antes das paredes.", usar(g) { const j = g.jogador; g.mundo.emitir(j.pos, 0x33ff66, 20, 5); for (let i = 0; i < 14; i++) { j.pos.addScaledVector(j.frente, 1); g.mundo.resolver(j.pos, 0.18); } g.mundo.emitir(j.pos, 0x33ff66, 20, 5); } },
  dengue:     { nome: "Surto", ico: "🦟", cd: 22, dur: 8, desc: "Por 8 s todo sangue (gotas e picadas) vale em dobro.", usar(g) { g.buff.sangue = 8; g.ui.flash("rgba(255,60,60,.4)"); } },
  relojoeiro: { nome: "Tempo Parado", ico: "⏳", cd: 25, dur: 5, desc: "Por 5 s humanos e nuvens de gás quase congelam.", usar(g) { g.buff.tempo = 5; g.ui.flash("rgba(255,216,77,.55)"); } },
  radioativo: { nome: "Aura Radioativa", ico: "☢️", cd: 20, dur: 8, desc: "Por 8 s nenhum humano consegue te dar tapa.", usar(g) { g.buff.radio = 8; g.mundo.emitir(g.jogador.pos, 0x39ff14, 30, 6); } },
  jogador:    { nome: "Arrancada", ico: "🏀", cd: 14, dur: 4, desc: "Por 4 s velocidade +70% e stamina infinita.", usar(g) { g.buff.vel = 4; g.buff.stamInf = 4; } },
  fantasma:   { nome: "Invisibilidade", ico: "👻", cd: 18, dur: 6, desc: "Por 6 s os humanos não te veem: picar não os irrita.", usar(g) { g.buff.invis = 6; g.mundo.emitir(g.jogador.pos, 0xbfe6ff, 24, 3, "fumaca"); } },
  vampiro:    { nome: "Frenesi", ico: "🧛", cd: 28, dur: 8, desc: "Por 8 s: sangue em dobro, cura 30 de vida por picada e humanos picados voltam em 3 s.", usar(g) { g.buff.frenesi = 8; g.ui.flash("rgba(200,0,40,.5)"); } },
  mosquito:   { nome: "Chamado do Enxame", ico: "🪰", cd: 30, dur: 0, desc: "Faz surgir 12 gotas de sangue ao seu redor.", usar(g) { g.mundo.gotasPerto(g.jogador.pos, 12); } },
  carreta:    { nome: "Grave Ensurdecedor", ico: "🔊", cd: 20, dur: 6, desc: "Humanos num raio de 22 dançam por 6 s (sem tapas) e rendem +50% por picada.", usar(g) { g.atordoar(22, 6); g.audio.tom(70, 30, 0.7, "sawtooth", 0.5); g.jogador.shake = 1; g.mundo.emitir(g.jogador.pos, 0xff44cc, 30, 7); } },
  eletrizado: { nome: "Descarga", ico: "⚡", cd: 18, dur: 0, desc: "Coleta na hora as gotas num raio de 14 e paralisa humanos próximos por 4 s.", usar(g) { g.mundo.coletarRaio(g.jogador.pos, 14, g); g.atordoar(10, 4); g.ui.flash("rgba(120,200,255,.6)"); g.mundo.emitir(g.jogador.pos, 0x9fe0ff, 40, 8); } },
  pintado:    { nome: "Poça de Cura", ico: "🎨", cd: 24, dur: 8, desc: "Cria uma poça de tinta que cura 12 de vida por segundo e recarrega a stamina por 8 s.", usar(g) { g.zona = { x: g.jogador.pos.x, z: g.jogador.pos.z, r: 5, t: 8 }; } },
  extintor:   { nome: "Extinção", ico: "🧯", cd: 22, dur: 8, desc: "Apaga as nuvens de gás num raio de 22, dá imunidade a gás e poças por 8 s e assusta humanos próximos por 3 s.", usar(g) { g.mundo.apagarGas(g.jogador.pos, 22); g.buff.gas = 8; g.atordoar(8, 3); g.mundo.emitir(g.jogador.pos, 0xffffff, 40, 7, "espuma"); } },
  cadeado:    { nome: "Cadeado Fechado", ico: "🔒", cd: 20, dur: 5, desc: "Por 5 s você é invulnerável, mas anda 55% mais devagar.", usar(g) { g.jogador.escudo = 5; g.buff.pesado = 5; } },
  tusk:       { nome: "Rajada de Unhas", ico: "🦗", cd: 10, dur: 0, desc: "Dispara unhas douradas que picam humanos à distância sem irritá-los. Ato 1: 1 alvo, Ato 2: 2, Ato 3: 3, Ato 4: todos no raio de 25 (e a recarga cai de 10 para 4 s).", usar(g) { return g.rajadaTusk(); } },
  mosquito8000: { nome: "Scanner 8000", ico: "🤖", cd: 22, dur: 10, desc: "Por 10 s o alcance de coleta fica 2,5x maior e as gotas ficam realçadas.", usar(g) { g.buff.scan = 10; } },
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
    this.conq = []; this.salas = []; this.carteiras = 0; this.mantis = []; this.habs = [];
    try {
      const s = JSON.parse(localStorage.getItem(CFG.SAVE));
      if (s && s.nv) { this.sangue = +s.sangue || 0; for (const k in this.nv) this.nv[k] = +s.nv[k] || 0; }
      if (s) { const mig = (k) => (k === "arcoiris" ? "pixel" : k); this.skins = Array.isArray(s.skins) ? s.skins.map(mig).filter((k) => CFG.SKINS[k]) : []; this.skin = CFG.SKINS[mig(s.skin)] ? mig(s.skin) : null; this.picadas = +s.picadas || 0; this.conq = Array.isArray(s.conq) ? s.conq.filter((id) => CFG.CONQ.some((c) => c.id === id)) : []; this.salas = Array.isArray(s.salas) ? s.salas : []; this.carteiras = +s.carteiras || 0; this.habs = Array.isArray(s.habs) ? s.habs : []; this.mantis = Array.isArray(s.mantis) ? s.mantis.filter((i) => ["cabeca", "foices", "torax", "abdomen"].includes(i)) : []; }
    } catch (e) { /* sem save */ }
  }
  salvar() { try { localStorage.setItem(CFG.SAVE, JSON.stringify({ sangue: this.sangue, nv: this.nv, skins: this.skins, skin: this.skin, picadas: this.picadas, conq: this.conq, salas: this.salas, carteiras: this.carteiras, mantis: this.mantis, habs: this.habs })); } catch (e) {} }
  get total() { return this.nv.asas + this.nv.tromba + this.nv.estomago + this.nv.corpo; }
  get estagio() { let e = CFG.ESTAGIOS[0]; for (const x of CFG.ESTAGIOS) if (this.total >= x.min) e = x; return e; }
  custo(k) { return Math.floor(CFG.UPS[k].base * Math.pow(CFG.CRESCE, this.nv[k])); }
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
.hx-up.pode{opacity:1;border-color:#ff4d6d;box-shadow:0 0 18px rgba(232,41,75,.4)}.hx-up-fill{position:absolute;left:0;bottom:0;height:3px;background:#ff4d6d;width:0}
.hx-pips{display:flex;gap:2px;flex-wrap:wrap}.hx-pips i{width:7px;height:7px;border-radius:2px;background:rgba(255,255,255,.14)}.hx-pips i.on{background:#ffd84d}
.hx-sala{position:absolute;right:16px;bottom:16px;text-align:right;padding:10px 14px}.hx-sala b{font:800 .95rem Syne,sans-serif;display:block}.hx-sala small{color:#98a0af;font-size:.68rem}
#hx-toast{position:absolute;left:50%;top:68%;transform:translateX(-50%);font:700 1.05rem Syne,sans-serif;color:#ffd0d8;background:rgba(14,12,24,.8);border:1px solid rgba(255,255,255,.14);border-radius:999px;padding:7px 18px;opacity:0;white-space:nowrap;max-width:92vw;overflow:hidden;text-overflow:ellipsis}
#hx-toast.mostra{animation:hxsobe 1.6s ease-out forwards}@keyframes hxsobe{0%{opacity:0;transform:translate(-50%,10px)}12%{opacity:1}80%{opacity:1}100%{opacity:0;transform:translate(-50%,-26px)}}
#hx-evo{position:absolute;inset:0;display:grid;place-content:center;text-align:center;opacity:0;background:radial-gradient(circle,rgba(232,41,75,.35),transparent 62%)}
#hx-evo b{font:800 clamp(2rem,7vw,5rem) Syne,sans-serif;text-shadow:0 0 30px #e8294b}#hx-evo span{font:700 1.2rem Syne,sans-serif;color:#ffd84d}
#hx-evo.mostra{animation:hxevo 2.2s ease-out forwards}@keyframes hxevo{0%{opacity:0;transform:scale(.8)}18%{opacity:1;transform:scale(1.05)}80%{opacity:1}100%{opacity:0;transform:scale(1.15)}}
#hx-menu{position:fixed;inset:0;z-index:12;display:grid;place-items:center;overflow:auto;font-family:Figtree,system-ui,sans-serif;color:#eef2f8;background:radial-gradient(ellipse at 20% 10%,rgba(232,41,75,.28),transparent 55%),radial-gradient(ellipse at 90% 90%,rgba(90,60,200,.25),transparent 55%),#080610}
.hxm-fundo{position:absolute;inset:0;pointer-events:none;overflow:hidden}.hxm-fundo i{position:absolute;font-style:normal;opacity:.12;animation:hxvoa linear infinite}
@keyframes hxvoa{from{transform:translate(-10vw,0) rotate(0)}to{transform:translate(110vw,-30vh) rotate(40deg)}}
.hxm-painel{position:relative;width:min(940px,94vw);margin:18px;padding:30px 34px;border-radius:22px;background:rgba(18,14,32,.88);border:1px solid rgba(232,41,75,.35);box-shadow:0 20px 70px rgba(0,0,0,.6)}
.hxm-painel h1{margin:0;font:800 clamp(2.4rem,7vw,4rem)/1 Syne,sans-serif;color:#ff4d6d}.hxm-painel header p{margin:6px 0 22px;color:#98a0af}
.hxm-grid{display:grid;grid-template-columns:1.1fr 1fr;gap:26px}@media(max-width:760px){.hxm-grid{grid-template-columns:1fr}.hx-status{min-width:0;left:8px;top:8px}.hx-barras{width:200px;right:8px;top:8px}.hx-ups{gap:6px}.hx-up{width:92px;padding:8px}.hx-sala{display:none}}
.hx-btn{width:100%;padding:15px;border-radius:12px;border:0;font:800 1.15rem Syne,sans-serif;cursor:pointer;color:#fff;background:#e8294b;transition:transform .15s,background .15s}.hx-btn:hover{background:#ff3d5f;transform:translateY(-2px)}
.hxm-atalhos{display:flex;gap:8px;margin:10px 0 16px}.hxm-atalhos button{flex:1;padding:11px;border-radius:11px;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.06);color:#eef2f8;font:700 .9rem Figtree,sans-serif;cursor:pointer}.hxm-atalhos button:hover{background:rgba(255,255,255,.12)}
.hxm-res{display:grid;grid-template-columns:1fr 1fr;gap:8px}.hxm-res div{background:rgba(255,255,255,.05);border-radius:10px;padding:9px 12px}.hxm-res b{display:block;font:800 1.05rem Syne,sans-serif}.hxm-res small{color:#98a0af;font-size:.72rem}
.hxm-col h3{margin:0 0 10px;font:800 .95rem Syne,sans-serif;color:#ffd84d}.hxm-ctrl{display:grid;grid-template-columns:auto 1fr;gap:7px 12px;font-size:.84rem;align-items:center}.hxm-ctrl span{color:#b6bdcb}
.hxm-save{margin:12px 0 0;color:#7f8798;font-size:.78rem;min-height:1em}
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
.sk-eq{margin-top:6px;padding:11px;border:0;border-radius:11px;font:800 .9rem Syne,sans-serif;cursor:pointer;background:#ffd84d;color:#0e0c18}.sk-eq:disabled{background:rgba(255,255,255,.1);color:#98a0af;cursor:default}
`;
    document.head.appendChild(s);
  }
  montarHud() {
    const h = document.createElement("div"); h.id = "hx";
    const UP = { asas: ["🪽", "+0,5 de velocidade por nível"], tromba: ["💉", "+0,15 de alcance de coleta por nível"], estomago: ["🩸", "+2 de sangue por gota por nível"], corpo: ["🛡️", "+15 de stamina e +12 de vida por nível"] };
    const ups = Object.keys(CFG.UPS).map((k, i) => `<button class="hx-up" data-up="${k}" title="${UP[k][1]}"><kbd>${i + 1}</kbd><span class="hx-up-ico">${UP[k][0]}</span><span class="hx-up-nome">${CFG.UPS[k].nome}</span><span class="hx-pips" data-pips="${k}"></span><span class="hx-up-custo">🩸 <b data-custo="${k}">0</b></span><i class="hx-up-fill" data-fill="${k}"></i></button>`).join("");
    h.innerHTML = `
<div class="hx-card hx-status"><div class="hx-skin" id="hx-skin-ico">🦟</div><div class="hx-info"><b id="hx-estagio">Larva voadora</b><small>Nível <span id="hx-nivel">0</span> · <span id="hx-skin-nome">Sem skin</span></small><div class="hx-prog"><i id="hx-prog"></i></div><small id="hx-prox"></small></div><div class="hx-sangue"><span id="hx-sangue">0</span><small>sangue</small></div></div>
<div class="hx-combo" id="hx-combo" hidden><b id="hx-combo-n">×1</b><span id="hx-combo-txt">combo</span><div class="hx-prog"><i id="hx-combo-f"></i></div></div>
<div class="hx-card hx-barras"><div class="hx-barra"><span>❤️</span><div class="hx-trilho"><i id="hx-vida"></i></div><em id="hx-vida-n"></em></div><div class="hx-barra"><span>⚡</span><div class="hx-trilho"><i id="hx-stam"></i></div><em id="hx-stam-n"></em></div></div>
<div class="hx-card hx-hab" id="hx-hab"><div class="hx-hab-ring" id="hx-hab-ring"><span class="hx-hab-ico" id="hx-hab-ico">💨</span></div><div><b id="hx-hab-nome">Impulso</b><small><kbd>R</kbd> <span id="hx-hab-cd">pronta!</span></small></div></div>
<div class="hx-ups">${ups}</div>
<div class="hx-card hx-sala"><b id="hx-sala">Corredor</b><small>E picar · R poder · K skins · C conquistas · H dica</small></div>
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
    const ctrl = [["W A S D", "mover"], ["Mouse", "olhar"], ["Espaço / Ctrl", "subir / descer"], ["Shift", "sprint"], ["1 2 3 4", "evoluir"], ["E", "picar um humano"], ["R", "habilidade da skin"], ["K / C", "skins / conquistas"], ["F", "arrombar armário"], ["Q", "responder o quadro"], ["B", "devolver carteira"], ["H · M · =", "dica · som · tour"]]
      .map(([a, b]) => `<kbd>${a}</kbd><span>${b}</span>`).join("");
    m.innerHTML = `<div class="hxm-fundo">${voa}</div><section class="hxm-painel"><header><h1 id="hx-menu-titulo">MOSQUITO</h1><p>Evolução noturna · escola assombrada de humanos</p></header>
<div class="hxm-grid"><div class="hxm-col"><button class="hx-btn" id="hx-btn-jogar">Jogar</button><div class="hxm-atalhos"><button id="hx-btn-skins">🎨 Skins <kbd>K</kbd></button><button id="hx-btn-conq">🏆 Conquistas <kbd>C</kbd></button></div><div class="hxm-res" id="hx-resumo"></div><p class="hxm-save" id="hx-save"></p></div>
<div class="hxm-col"><h3>Controles</h3><div class="hxm-ctrl">${ctrl}</div></div></div></section>`;
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
      ct.textContent = c.toLocaleString("pt-BR"); bt.classList.toggle("pode", S.sangue >= c); fill.style.width = Math.min(100, (S.sangue / c) * 100) + "%";
      const chave = k + S.nv[k]; if (this.cache["p" + k] !== chave) { this.cache["p" + k] = chave; pips.innerHTML = Array.from({ length: 12 }, (_, i) => `<i class="${i < S.nv[k] ? "on" : ""}"></i>`).join("") + (S.nv[k] > 12 ? ` <small>nv ${S.nv[k]}</small>` : ""); }
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
  alerta(txt, cor = "#ffd84d") { const ch = txt + cor; if (this._al === ch) return; this._al = ch; this.alertaEl.textContent = txt || ""; this.alertaEl.style.color = cor; this.alertaEl.style.opacity = txt ? 1 : 0; }
  flash(cor) { this.vinheta.style.boxShadow = `inset 0 0 160px 50px ${cor}`; this.flashV = 1; this._pc = null; }
  perigo(cor, v) { if (v > 0 && this._pc !== cor) { this._pc = cor; this.vinheta.style.boxShadow = `inset 0 0 160px 40px ${cor}`; } this.base = v; }
  atualizar(dt) {
    this.flashV = Math.max(0, this.flashV - dt * 2.5);
    this.vinheta.style.opacity = Math.max(this.flashV, this.base).toFixed(2);
  }
  retrigger(el, c) { el.classList.remove(c); void el.offsetWidth; el.classList.add(c); }
  toast(txt) { const t = this.e.toast; t.textContent = txt; this.retrigger(t, "mostra"); }
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
<button class="sk-eq" id="sk-eq" ${!liberada || uso ? "disabled" : ""}>${uso ? "Em uso" : liberada ? "Equipar" : "Bloqueada"}</button></aside></div>`;
    const c = this.colConteudo;
    c.querySelectorAll("[data-sk]").forEach((b) => { b.addEventListener("click", () => { this.skSel = b.dataset.sk || null; this.skAto = this.skSel === "tusk" ? Math.max(1, S.mantis.length) : 0; this.renderSkins(S, api); }); b.addEventListener("dblclick", () => { if (tem(b.dataset.sk || null)) api.escolher(b.dataset.sk || null); }); });
    c.querySelectorAll("[data-ato]").forEach((b) => b.addEventListener("click", () => { this.skAto = +b.dataset.ato; this.renderSkins(S, api); }));
    const eq = c.querySelector("#sk-eq"); if (eq) eq.addEventListener("click", () => { if (liberada && !uso) api.escolher(sel); });
    const pv = this.previewIniciar(), vista = c.querySelector("#sk-vista");
    if (pv.erro) { vista.insertAdjacentHTML("afterbegin", '<p style="padding:20px">Preview 3D indisponível neste navegador.</p>'); return; }
    vista.prepend(pv.canvas);
    const chave = [sel, ato, liberada, S.mantis.length].join("|");
    if (pv.chave !== chave) { pv.chave = chave; this.previewMostrar(S, sel, ato, !liberada); } else this.previewLoop(true);
  }
  // Motor do preview: um segundo renderizador pequeno, com um mosquito próprio montado com a skin escolhida
  previewIniciar() {
    if (this.pv) return this.pv;
    const canvas = document.createElement("canvas"); let r = null;
    try { r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true }); } catch (e) { return (this.pv = { erro: true, canvas }); }
    r.setPixelRatio(Math.min(devicePixelRatio, 2)); r.setClearColor(0x000000, 0);
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
    const m = construirMosquito(pe); m.aplicar(); pv.modelo = m; pv.raiz.add(m.mosquito); m.mosquito.position.set(0, 0, 0); m.mosquito.rotation.set(0.25, 0, 0);
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
      pv.r.render(pv.cena, pv.cam);
    };
    pv.raf = requestAnimationFrame(f);
  }
  previewParar() { this.previewLoop(false); }

  // ---- Pergunta do quadro de matemática: caixa com campo de texto ----
  pergunta(titulo, enunciado, aoResponder, aoFechar) {
    if (!this.perg) {
      const e = document.createElement("div"); e.id = "hud-pergunta";
      e.style.cssText = "position:fixed;inset:0;display:none;align-items:center;justify-content:center;background:rgba(6,4,14,.85);z-index:21;font-family:Syne,Figtree,system-ui,sans-serif";
      e.innerHTML = '<div style="width:min(460px,92vw);background:#123524;border:6px solid #8a5a2e;border-radius:12px;padding:24px;color:#f4f1e6;text-align:center"><b style="font:800 1rem Syne,sans-serif;color:#ffd84d"></b><div style="font:800 2.6rem Syne,sans-serif;margin:14px 0"></div><input autocomplete="off" style="width:60%;font:800 1.6rem Syne,sans-serif;text-align:center;border-radius:8px;border:2px solid #e8e0c8;background:#0c2418;color:#fff;padding:6px"><p style="min-height:1.4em;margin:12px 0 4px;font:700 .85rem Figtree,sans-serif"></p><small style="color:#a9c9b6">Enter responde · Esc fecha</small></div>';
      document.body.appendChild(e); this.perg = e;
    }
    const c = this.perg.children[0].children, inp = c[2], fb = c[3];
    c[0].textContent = titulo; c[1].textContent = enunciado; inp.value = ""; fb.textContent = ""; this.perg.style.display = "flex"; document.exitPointerLock?.();
    inp.onkeydown = (ev) => {
      if (ev.key === "Escape") { aoFechar(); return; }
      if (ev.key !== "Enter") return;
      const r = aoResponder(inp.value); fb.textContent = r.msg; fb.style.color = r.fechar ? "#7dff9a" : "#ff9a9a";
      if (r.fechar) setTimeout(aoFechar, 1400); else inp.select();
    };
    document.exitPointerLock?.(); setTimeout(() => inp.focus(), 30);
  }
  fecharPergunta() { if (this.perg) this.perg.style.display = "none"; }

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
  menu(titulo, botao) { this.menuEl.hidden = false; $("hx-menu-titulo").textContent = titulo; $("hx-btn-jogar").textContent = botao; if (this.ultimoS) this.saveInfo(this.ultimoS); }
  esconderMenu() { this.menuEl.hidden = true; }
  saveInfo(S) {
    const R = (b, s) => `<div><b>${b}</b><small>${s}</small></div>`;
    $("hx-resumo").innerHTML = R(S.estagio.nome, "estágio atual") + R(Math.floor(S.sangue).toLocaleString("pt-BR"), "sangue") + R(`${S.skins.length}/${Object.keys(CFG.SKINS).length}`, "skins") + R(`${S.conq.length}/${CFG.CONQ.length}`, "conquistas") + R(`${S.salas.length}/${CFG.SALAS.length}`, "salas visitadas") + R(S.picadas, "picadas");
    $("hx-save").textContent = S.total > 0 ? "Progresso salvo automaticamente neste navegador." : "Nova partida: evolua com as teclas 1 a 4 e explore a escola.";
  }
  ligar(aoEvoluir, aoJogar) {
    this.hx.querySelectorAll("[data-up]").forEach((b) => b.addEventListener("click", () => aoEvoluir(b.dataset.up)));
    $("hx-btn-jogar").addEventListener("click", aoJogar);
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
const roboG = new THREE.Group(); roboG.visible = false; corpoG.add(roboG);
const matVisor = new THREE.MeshBasicMaterial({ color: 0x00e5ff }), matAco2 = mat(0x6c7890, { metalness: 0.85, roughness: 0.3 });
{ const v = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.05, 0.12), matVisor); v.position.set(0, 0.04, -0.34); roboG.add(v);
  const an = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.22, 6), matAco2); an.position.set(0.07, 0.2, -0.24); roboG.add(an);
  for (const l of [1, -1]) { const pl = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.2, 0.38), matAco2); pl.position.set(l * 0.18, 0.06, 0.05); roboG.add(pl); } }
const antenaLed = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 6), new THREE.MeshBasicMaterial({ color: 0xff3366 })); antenaLed.position.set(0.07, 0.32, -0.24); roboG.add(antenaLed);
const jatos = []; for (const l of [1, -1]) { const j = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.3, 8), new THREE.MeshBasicMaterial({ color: 0xff8a2a })); j.rotation.x = Math.PI / 2; j.position.set(l * 0.13, -0.1, 0.62); roboG.add(j); jatos.push(j); }
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
  luzCorpo.color.setHex(est.cor); luzCorpo.intensity = Math.min(n * 0.12, 1.6) + Math.max(0, idx - 9) * 0.4;

  // SKIN (easter egg): sobrescreve cores e materiais, sem mudar tamanhos
  matCorpo.transparent = matAbd.transparent = matPerna.transparent = false; matCorpo.opacity = matAbd.opacity = matPerna.opacity = 1;
  matCorpo.metalness = 0; matCorpo.roughness = 0.5; matPerna.color.setHex(0x0b0b0e);
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
    if (sk.alfa) { matCorpo.transparent = matAbd.transparent = matPerna.transparent = true; matCorpo.opacity = matAbd.opacity = matPerna.opacity = sk.alfa; }
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
  // Skins com visual próprio: meio pintado, faixas de bombeiro, caminhão de som e raios
  if (sk && sk.meia) { const kc = sk.corpo + "-" + sk.meia; matCorpo.map = cacheTex[kc] = cacheTex[kc] || texMeia(sk.corpo, sk.meia); matAbd.map = cacheTex[kc + "a"] = cacheTex[kc + "a"] || texMeia(sk.abd, sk.meia); matCorpo.color.setHex(0xffffff); matAbd.color.setHex(0xffffff); }
  if (sk && sk.faixas) { matAbd.map = cacheTex.faixas = cacheTex.faixas || texFaixas(); matAbd.color.setHex(0xffffff); }
  rigG.visible = !!(sk && sk.rig); raiosG.visible = !!(sk && sk.raios);
  cadG.visible = cadC.visible = !!(sk && sk.cadeado);
  { const ato = sk && sk.tusk ? Math.max(1, S.mantis.length) : 0;   // Tusk: cada Ato mostra o seu próprio visual; o Ato 4 ganha a órbita dourada
    tA.forEach((t, i) => { t.c.visible = t.a.visible = ato === i + 1; }); orbG.visible = ato >= 4; olhos.forEach((o) => { o.visible = ato < 2; }); }
  roboG.visible = !!(sk && sk.robo);
  if (sk && sk.robo) { matCorpo.map = cacheTex.roboC = cacheTex.roboC || texRobo(sk.corpo, ""); matAbd.map = cacheTex.roboA = cacheTex.roboA || texRobo(sk.abd, "8000"); matCorpo.color.setHex(0xffffff); matAbd.color.setHex(0xffffff); matCorpo.roughness = 0.3; }
  matCorpo.needsUpdate = matAbd.needsUpdate = true;

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
let rayT = 0, beatV = 0, tPrev = 0;
function tickSkin(t) {
  const dt = Math.min(0.05, Math.max(0, t - tPrev)); tPrev = t;
  const sk = S.skin && CFG.SKINS[S.skin];
  if (sk && sk.alfa) { const o = sk.alfa + 0.1 * Math.sin(t * 3); matCorpo.opacity = matAbd.opacity = matPerna.opacity = o; }   // fantasma oscila
  if (sk && sk.tusk && orbG.visible) { orbG.rotation.y += dt * 3.2; aneis[0].rotation.z += dt * 2; aneis[1].rotation.z -= dt * 2.6; }
  if (sk && sk.robo) { const f = 0.8 + Math.random() * 0.6; for (const j of jatos) j.scale.set(1, f, 1); antenaLed.visible = Math.sin(t * 7) > 0; }
  if (S.skin === "pixel") { const k = Math.floor(t * 4) % 2; matOlho.emissiveIntensity = k ? 1.8 : 0.9; return; }
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
    this.construirCenario(); this.criarGotas(); this.criarParticulas(); this.criarPerigos(); this.criarHumanos(); this.criarCarteira(); this.criarPingos();
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
    const { MX, MZ, MN, MS, YMIN: F, YMAX } = CFG;
    const M = (c, r = 0.7, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: r, ...o }), B = (c) => new THREE.MeshBasicMaterial({ color: c });
    const tela = (w, h) => { const c = document.createElement("canvas"); c.width = w; c.height = h; return [c, c.getContext("2d")]; };
    const tex = (c) => new THREE.CanvasTexture(c);
    const caixa = (w, h, d, mt, x, y, z) => this.fixo(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mt), x, y, z);
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
      const zFace = z + (lado < 0 ? 0.56 : -0.56);
      const frente = lado < 0 ? 0 : Math.PI;
      this.deco(new THREE.Mesh(new THREE.PlaneGeometry(8.8, 1.7),
        new THREE.MeshBasicMaterial({ map: tex(c), side: THREE.DoubleSide })),
        x, F + 10.55, zFace, frente);
    };
    const m = { piso: M(0xffffff, 0.55, { map: tPiso }), par: M(0x6f8f7a, 0.9), teto: M(0xcfd3d8, 0.9), mad: M(0x8a5a2e, 0.6), metal: M(0x4a5560, 0.4), cad: M(0x2f6fb5, 0.6),
      l1: M(0x3a5f8a), l2: M(0x2e4d70), tampo: M(0xd9c7a0, 0.5), estante: M(0xffffff, 0.8, { map: tex(cb) }), mesa: M(0xc9a36a, 0.6), banco: M(0xa0522d, 0.7),
      azul: M(0xe3edf2, 0.4), porc: M(0xf4f4f4, 0.2), bancada: M(0x2d3b44, 0.4), vidro: M(0x66ffaa, 0.2, { emissive: 0x22aa66, transparent: true, opacity: 0.4 }), laranja: M(0xff7a1a, 0.5) };
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
    this.cena.add(new THREE.AmbientLight(0x8a8fb0, 0.85));
    this.cena.add(new THREE.HemisphereLight(0xdfe8ff, 0x4a4540, 0.75));
    const lua = new THREE.DirectionalLight(0x7692ff, 0.5); lua.position.set(-30, 30, 10); this.cena.add(lua);
    [[0, 0], [28, -54], [94, -54], [-64, 56], [17, 56], [94, 70]].forEach(([x, z], i) => {
      const l = new THREE.PointLight(0xdff0ff, i ? 1.1 : 1.6, 70); l.position.set(x, YMAX - 2, z); this.cena.add(l); if (!i) this.luz = l;
    });


    // Casca externa: piso, teto e 4 paredes
    const cy = (YMAX + F) / 2, H = YMAX - F + 4, T = 1;
    caixa(MX * 2, 2, MZ * 2, m.piso, 0, F - 1, 0); caixa(MX * 2 + 4, 2, MZ * 2 + 4, m.teto, 0, YMAX + 1, 0);
    caixa(MX * 2 + 4, H, 4, m.par, 0, cy, -MZ - 2); caixa(MX * 2 + 4, H, 4, m.par, 0, cy, MZ + 2);
    caixa(2, H, MZ * 2, m.par, -MX - 1, cy, 0); caixa(2, H, MZ * 2, m.par, MX + 1, cy, 0);

    // Planta: corredor central (z -8..8) com 10 portas reais; divisórias terminam nas paredes do corredor
    const parede = (eixo, fixo, ini, fim, portas = []) => {
      const altura = YMAX - F, portaH = 9.5, larg = 10;
      const seg = (a, b, h, y) => { if (b - a < 0.02 || h <= 0) return; if (eixo === "x") caixa(b - a, h, T, m.par, (a + b) / 2, y, fixo); else caixa(T, h, b - a, m.par, fixo, y, (a + b) / 2); };
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
    for (const [x, z] of [...PN.map((x) => [x, -8]), ...PS.map((x) => [x, 8])]) for (const dx of [-5.2, 5.2]) caixa(0.28, 9.5, 0.34, m.metal, x + dx, F + 4.75, z);   // batentes
    ["ARTES", "SALA 1", "SALA 2", "BIBLIOTECA", "LABORATÓRIO", "ENFERMARIA"].forEach((t, i) => placa(t, PN[i], -8, -1));
    ["CANTINA", "GINÁSIO", "BANHEIRO", "AUDITÓRIO"].forEach((t, i) => placa(t, PS[i], 8, 1));

    // Corredor: armários (pulando as portas), janelas nas pontas e lâmpadas
    for (let x = -MX + 5; x <= MX - 5; x += 5) {
      const livre = (portas) => portas.every((p) => Math.abs(x - p) >= 8.5);
      if (livre(PN) && x !== -23) caixa(3.4, 7, 1.1, m.l1, x, F + 3.5, -6.85);   // x = -23: armário trancado (easter egg)
      if (livre(PS)) caixa(3.4, 7, 1.1, m.l2, x, F + 3.5, 6.85);
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
    const carteira = (x, z) => {
      caixa(5.4, 0.35, 3.1, m.tampo, x, F + 3.05, z);
      for (const l of [-1, 1]) caixa(0.3, 2.9, 2.8, m.metal, x + l * 2.3, F + 1.45, z);
      caixa(3.3, 0.35, 2.7, m.cad, x, F + 1.9, z + 3.15); caixa(3.3, 2.5, 0.35, m.cad, x, F + 3.15, z + 4.35); caixa(2.2, 1.7, 2.2, m.metal, x, F + 0.85, z + 3.15);
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
    // Biblioteca (x 14..42): estantes com lombadas, mesas de leitura e balcão (o carpete cobre a sala toda)
    for (const x of [18, 38]) for (const z of [-90, -70, -50, -30]) caixa(2.4, 10, 16, m.estante, x, F + 5, z);
    for (const z of [-84, -60, -36]) { caixa(8, 0.5, 5, m.mad, 28, F + 3.3, z); for (const l of [-1, 1]) caixa(0.4, 3, 4.4, m.mad, 28 + l * 3.2, F + 1.5, z); }
    caixa(7, 3.2, 2.6, m.mad, 37, F + 1.6, -17);


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
    // Quadra de vôlei: marcações e rede entre postes.
    chao(35, 25, M(0x276b83, 0.7), 17.5, 65);
    const linhaV = M(0xffffff, 0.6);
    for (const z of [52.5, 77.5, 60, 70]) caixa(35, 0.035, 0.18, linhaV, 17.5, F + 0.095, z);
    for (const x of [0, 35]) caixa(0.18, 0.035, 25, linhaV, x, F + 0.095, 65);
    for (const x of [-1, 36]) cil(0.16, 0.16, 7, m.metal, x, F + 3.5, 65);
    const rede = new THREE.Mesh(new THREE.PlaneGeometry(35, 5.5), M(0xe8f4ff, 0.7, { transparent:true, opacity:0.35, side:THREE.DoubleSide, wireframe:true }));
    rede.position.set(17.5, F + 5, 65); this.cena.add(rede);
    // Bebedouro e suporte de bolas na lateral do ginásio.
    caixa(2.5, 4.5, 2, m.metal, 40, F + 2.25, 81);
    cil(1.0, 1.0, 0.35, m.porc, 40, F + 4.7, 81);
    for (const z of [82, 85]) this.deco(new THREE.Mesh(new THREE.SphereGeometry(0.9, 14, 10), m.laranja), -5, F + 0.9, z);
    for (const [x, z] of [[10, 25], [22, 33], [30, 22]]) this.deco(new THREE.Mesh(new THREE.SphereGeometry(0.9, 14, 10), m.laranja), x, F + 0.9, z);

    // Banheiro ampliado: ocupa toda a faixa x=45..71, z=8..100.
    // Cabines e lavatórios distribuidos ao longo da sala, sem corredor vazio no fundo.
    const pisoBanheiro = M(0xc5d7df, 0.78);
    chao(24.5, 89, pisoBanheiro, 58, 54);
    const divisoriaBanheiro = M(0x8daab8, 0.65);
    const portaBanheiro = M(0xb3cbd3, 0.65);
    // Oito cabines na parede leste; entrada aberta para o corredor central do banheiro.
    for (let i = 0; i < 8; i++) {
      const z = 18 + i * 10;
      caixa(7.5, 7, 0.32, divisoriaBanheiro, 66.5, F + 3.5, z - 4.6);
      caixa(0.3, 7, 9.1, divisoriaBanheiro, 70.1, F + 3.5, z);
      // Porta da cabine na lateral interna, deixando passagem livre.
      caixa(0.28, 6.3, 5.0, portaBanheiro, 62.8, F + 3.15, z + 2.0);
      cil(1, 0.8, 2, m.porc, 67.4, F + 1, z);
      caixa(1.2, 2.5, 2.4, m.porc, 69.1, F + 3.2, z);
    }
    // Bancada de pias do lado oposto, com espelhos e torneiras.
    for (const z of [20, 32, 44, 56, 68, 80]) {
      caixa(3.2, 0.45, 4.8, m.bancada, 48.2, F + 3.2, z);
      caixa(2.2, 0.25, 2.7, m.porc, 48.2, F + 3.5, z);
      cil(0.14, 0.14, 0.8, m.metal, 48.8, F + 4, z);
    }
    // Espelho contínuo preserva o easter egg nas coordenadas originais (z=36).
    this.deco(new THREE.Mesh(new THREE.PlaneGeometry(68, 5), B(0x9bb8c8)), 45.55, F + 7.5, 51, Math.PI / 2);
    // Armário de limpeza e bancos próximos ao fundo, sem bloquear as cabines.
    caixa(3, 8, 7, m.azul, 48.2, F + 4, 91);
    caixa(4.5, 1.6, 2.2, m.metal, 56, F + 0.8, 93);
    

    // ENFERMARIA (x 71..118): 8 camas junto às paredes com cortinas, armário de remédios, cruz e mesa da enfermeira
    { const lencol = M(0xf4f6ff, 0.8), manta = M(0x6aa0d8, 0.8), trava = M(0xffffff, 0.9), cort = M(0xbfe0d8, 0.9, { transparent: true, opacity: 0.8 });
      for (const z of [-30, -50, -70, -90]) for (const x of [79, 110]) {
        caixa(5, 1.6, 9, m.metal, x, F + 0.8, z); caixa(4.8, 0.6, 8.8, lencol, x, F + 1.9, z);
        dbox(3.6, 0.5, 1.8, trava, x, F + 2.4, z - 3.4); dbox(4.9, 0.25, 5.5, manta, x, F + 2.3, z + 1.4); caixa(5, 3, 0.4, m.metal, x, F + 1.5, z - 4.5);
        dbox(0.2, 9, 9, cort, x + (x < 94 ? 3.4 : -3.4), F + 6, z);
      }
      caixa(14, 8, 2.5, M(0xf2f2f2, 0.4), 94.5, F + 4, -MZ + 1.3);
      { const [cc, gc] = tela(128, 128); gc.fillStyle = "#fff"; gc.fillRect(0, 0, 128, 128); gc.fillStyle = "#e0202a"; gc.fillRect(48, 16, 32, 96); gc.fillRect(16, 48, 96, 32);
        this.deco(new THREE.Mesh(new THREE.PlaneGeometry(3, 3), new THREE.MeshBasicMaterial({ map: tex(cc) })), 94.5, F + 10, -MZ + 2.7); }
      caixa(9, 3.4, 3, m.mad, 104, F + 1.7, -16);
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
    { const M2 = M(0x4a5a3a, 0.85), mm = new THREE.Group(); mm.position.set(111, F + 2.8, 93);
      this.cena.add(mm); caixa(3, 0.8, 3, m.mad, 111, F + 2.4, 93);
      // "Cápsula" feita à mão: o Three.js r128 não tem CapsuleGeometry
      const pernaEst = (raiz, mt, x, y, z, rx, ry, rz, raio, comp) => {
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
      // Estátua de enfeite no canto do auditório (~3 unidades de altura).
      mm.scale.setScalar(0.1);
      this.mosquito = { g: mm, olhos: [1, -1].map((l) => mm.children.find((c) => c.geometry && c.geometry.type === "SphereGeometry" && c.position.z < -4)), trompa, centro: V(111, F + 2.8 + 1.0, 93) };
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
      const faceZ = zParede + (norte ? 0.56 : -0.56);
      const [c, g] = tela(256, 256);
      g.fillStyle = cor; g.fillRect(0, 0, 256, 256);
      g.strokeStyle = '#f4e8cb'; g.lineWidth = 8; g.strokeRect(9, 9, 238, 238);
      g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.font = 'bold 31px sans-serif'; g.fillText(titulo, 128, 104, 228);
      g.font = 'bold 19px sans-serif'; g.fillText(subtitulo, 128, 152, 230);
      this.deco(new THREE.Mesh(new THREE.PlaneGeometry(3.8, 3.8),
        new THREE.MeshBasicMaterial({ map: tex(c), side: THREE.DoubleSide })),
        x, F + 6.3, faceZ, norte ? 0 : Math.PI);
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

    // PARTES DO LOUVA-A-DEUS (easter egg Tusk): 4 peças verdes brilhantes escondidas; cada uma evolui o Tusk em um Ato
    this.pontos.mantis = [];
    { const verde = M(0x6bd93a, 0.35, { emissive: 0x2a8a10, emissiveIntensity: 0.9 }), verde2 = M(0x3a9a1a, 0.4, { emissive: 0x18600a, emissiveIntensity: 0.7 }), asaV = M(0xcff5a8, 0.2, { transparent: true, opacity: 0.55, side: THREE.DoubleSide });
      const esf = (r, sx, sy, sz, mt, x, y, z) => { const o = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 10), mt); o.scale.set(sx, sy, sz); o.position.set(x, y, z); return o; };
      const hast = (r, h, mt, x, y, z, rx = 0, rz = 0) => { const o = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 6), mt); o.position.set(x, y, z); o.rotation.set(rx, 0, rz); return o; };
      const cria = (id, x, y, z, monta) => {
        const g = new THREE.Group(), forma = new THREE.Group(); monta(forma);
        g.add(forma, new THREE.Mesh(new THREE.SphereGeometry(1.5, 12, 10), new THREE.MeshBasicMaterial({ color: 0x66ff33, transparent: true, opacity: 0.13, depthWrite: false })));
        g.position.set(x, y, z); this.cena.add(g); this.pontos.mantis.push({ id, g, forma, base: y, pos: g.position });
      };
      cria("cabeca", 38, F + 10.7, -70, (f) => { f.add(esf(0.45, 1.3, 0.9, 0.8, verde, 0, 0, 0)); for (const l of [1, -1]) { f.add(esf(0.2, 1, 1.2, 1, verde2, l * 0.5, 0.12, 0.15)); f.add(hast(0.02, 0.8, verde2, l * 0.2, 0.55, 0, 0, -l * 0.3)); } });
      cria("foices", 65, F + 5.2, -92, (f) => { for (const l of [1, -1]) { const t = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.07, 6, 14, Math.PI * 0.9), verde); t.position.x = l * 0.5; t.rotation.z = l > 0 ? 0.3 : Math.PI - 0.3; f.add(t); for (let i = 0; i < 4; i++) f.add(esf(0.06, 1, 1.6, 1, verde2, l * (0.5 + 0.3 * i * 0.3), 0.2 + i * 0.12, 0)); } });
      cria("torax", 17, F + 12.5, 78, (f) => { f.add(hast(0.22, 1.7, verde, 0, 0, 0, Math.PI / 2, 0)); for (const l of [1, -1]) { const a = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.55), asaV); a.position.set(l * 0.7, 0.2, 0.3); a.rotation.set(-Math.PI / 2 + 0.3, 0, l * 0.3); f.add(a); } });
      cria("abdomen", 65, F + 2.5, 86, (f) => { f.add(esf(0.4, 1, 0.9, 2.1, verde, 0, 0, 0)); for (const l of [1, -1]) for (const z of [-0.4, 0.4]) f.add(hast(0.03, 0.9, verde2, l * 0.4, -0.25, z, 0, l * 0.9)); });
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
  iniciarPontos(S) {   // estado salvo: armário já arrombado fica aberto
    const A = this.armario; if (A && S.skins.includes("cadeado")) { A.aberto = true; A.cad.visible = false; A.pivo.rotation.y = -1.75; A.led.visible = false; }
  }
  limitar(p) { p.x = clamp(p.x, -CFG.MX + 1, CFG.MX - 1); p.z = clamp(p.z, -CFG.MZ + 1, CFG.MZ - 1); p.y = clamp(p.y, CFG.YMIN + 0.3, CFG.YMAX - 0.3); }   // fantasma: só os limites do prédio

  // ---- Carteira perdida no corredor (B perto dela devolve e rende sangue; até 3 vezes) ----
  criarCarteira() {
    const g = new THREE.Group(), M = (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.6 });
    const corpo = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.3, 0.9), M(0x6b3a1a)), botao = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.34, 0.2), M(0xffd84d));
    const halo = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.06, 6, 24), new THREE.MeshBasicMaterial({ color: 0xffd84d, transparent: true, opacity: 0.6 }));
    halo.rotation.x = Math.PI / 2; halo.position.y = 0.1; botao.position.set(0.5, 0.02, 0); g.add(corpo, botao, halo); this.cena.add(g);
    this.carteira = { g, halo, visivel: false, spots: [[-20, 3], [35, -3], [-55, 2], [75, 2], [100, -2], [-95, -2]] };
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
      if (h.atord > 0) {   // atordoado ou dançando: não anda, não se irrita e rende mais sangue
        h.atord -= dt; h.raiva = 0; h.tapa = Math.max(h.tapa, 0.6);
        h.g.position.y = F + h.yo + Math.abs(Math.sin(jogo.t * 9 + h.passo)) * 0.35; h.g.rotation.y += dt * 2.2;
      } else if (h.raiva > 0) {
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
      if ((h.pronto <= 0 || jogo.buff.frenesi > 0) && d2 < melhor) { melhor = d2; this.humanoPerto = h; }
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
  emitir(pos, cor, n = 12, forca = 3, tipo = "") {   // tipo: "" faíscas · "fumaca" sobe e cresce · "espuma" cai devagar
    for (let i = 0; i < n; i++) {
      const p = this.parts.pegar(); if (!p) return; const u = p.userData;
      p.position.copy(pos); p.material.color.setHex(cor); p.material.opacity = 1; p.visible = true;
      u.mode = tipo === "fumaca" ? 1 : tipo === "espuma" ? 2 : 0; u.g = u.mode === 1 ? -1.4 : u.mode === 2 ? 1.2 : 4; u.dec = u.mode === 1 ? 0.7 : u.mode === 2 ? 0.9 : 1.4;
      p.scale.setScalar(u.mode === 1 ? 6 : u.mode === 2 ? 3 : 1);
      u.v.set((Math.random() - 0.5) * forca, Math.random() * forca * (u.mode === 1 ? 0.5 : 0.8), (Math.random() - 0.5) * forca); u.vida = 1;
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
    this.luz.intensity = Math.sin(jogo.t * 3.1) * Math.sin(jogo.t * 17.3) > 0.93 ? 0.5 : 1.6;   // lâmpada falhando
    this.atualizarHumanos(dt * jogo.escalaTempo, jogo);   // tempo parado deixa humanos em câmera lenta
    if (this.relogio) { const d = new Date(), s = d.getSeconds() + d.getMilliseconds() / 1000, mi = d.getMinutes() + s / 60, h = (d.getHours() % 12) + mi / 60;
      this.relogio.s.rotation.z = -s / 60 * Math.PI * 2; this.relogio.m.rotation.z = -mi / 60 * Math.PI * 2; this.relogio.h.rotation.z = -h / 12 * Math.PI * 2; }
    if (this.luzGalao) this.luzGalao.intensity = 1.1 + Math.sin(jogo.t * 3) * 0.4;
    if (this.pontos.tomada) { if (Math.random() < dt * 4) this.emitir(this.pontos.tomada, 0x9fe0ff, 5, 3); if (this.luzTomada) this.luzTomada.intensity = Math.random() < 0.3 ? 2.2 : 0.4; }   // faíscas na tomada
    if (this.moldTelao) { this.moldTelao.opacity = 0.55 + 0.4 * Math.sin(jogo.t * (3 + this.telaoProg * 12)); this.moldTelao.color.setHex(this.telaoProg > 0 ? 0x66ff99 : 0xff44cc); }
    if (this.carteira && this.carteira.visivel) this.carteira.halo.scale.setScalar(1 + Math.sin(jogo.t * 4) * 0.15);
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
    this.egg = { tanque: 0, espelho: 0, tela: 0, yAnt: 0, dica: 0, tour: false, fala: false, morte: 0, vida: 0 };
    this.menuAberto = false; this.aba = "skins"; this.eggMsg = "";
    this.buff = { sangue: 0, tempo: 0, radio: 0, vel: 0, stamInf: 0, invis: 0, frenesi: 0, gas: 0, scan: 0, pesado: 0 }; this.hab = { cd: 0, cdTotal: 1, ativo: 0 }; this.escalaTempo = 1; this.zona = null; this.kills = { tapasRecebidos: 0, gas: 0 }; this.tmpEgg = V(0, 0, 0); this.buf = ""; this.letras = "";
    this.ligar();
    this.ui.atalhos(() => this.abrirColecao("skins"), () => this.abrirColecao("conq")); this.mundo.posicionarCarteira(this.estado); this.mundo.iniciarPontos(this.estado);
    this.jogador.modelo.aplicar(); this.jogador.zoomV = this.jogador.modelo.zoom; this.ui.hud(this.estado); this.ui.saveInfo(this.estado); this.ui.habilidade(this.estado.skin, 0, 1, 0);
    this.laco();
  }

  ligar() {
    const cv = this.render.domElement, T = this.teclas;
    addEventListener("keydown", (e) => {
      if (e.target && e.target.tagName === "INPUT") return;   // digitando no quadro de matemática
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
      if (k === "q") this.abrirPergunta();
      if (k === "r") this.usarHabilidade();
      if (k === "=" && this.jogando) this.tour();
      if (k === "b" && this.jogando && !this.buf.endsWith("|arrowright|b")) this.pegarCarteira();
      if (k === "m") this.ui.toast(this.audio.alternarMudo() ? "Som desligado" : "Som ligado");
    });
    document.addEventListener("visibilitychange", () => { if (document.hidden) this.audio.pausarMusica(); });
    addEventListener("blur", () => this.audio.pausarMusica());
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
    if (!this.dicaInicial) { this.dicaInicial = true; this.ui.toast("E pica · R habilidade · K skins · C conquistas · H dica · = tour"); }
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
    const cd = id === "tusk" ? [10, 8, 6, 4][Math.max(1, S.mantis.length) - 1] : H.cd;
    this.hab.cd = this.hab.cdTotal = cd; this.hab.ativo = H.dur || 0;
    this.audio.tom(520, 880, 0.18, "triangle", 0.18); this.audio.tom(880, 1320, 0.2, "sine", 0.12, 0.08);
    this.ui.toast(`${H.ico} ${H.nome}!`); this.jogador.modelo.punch = 0.6;
    if (!S.habs.includes(id)) { S.habs.push(id); S.salvar(); this.ganhar("poder1"); if (S.habs.length >= Object.keys(HABS).length) this.ganhar("poderes"); }
  }
  atualizarHab(dt) {   // recargas, duração dos efeitos, poça de cura e stamina infinita
    for (const k in this.buff) if (this.buff[k] > 0) this.buff[k] = Math.max(0, this.buff[k] - dt);
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
  multSangue() { return (this.boost > 0 ? 2 : 1) * (this.buff.sangue > 0 ? 2 : 1) * (this.buff.frenesi > 0 ? 2 : 1); }
  fatorGas() { return this.buff.gas > 0 ? 0 : this.estado.attr.gas; }
  fatorColeta() { return this.buff.scan > 0 ? 2.5 : 1; }
  atordoar(r, seg) { const p = this.jogador.pos; for (const h of this.mundo.humanos) if (h.alvo.distanceTo(p) < r) { h.atord = seg; h.raiva = 0; } }
  rajadaTusk() {   // Tusk: pica humanos à distância sem irritá-los; o Ato define quantos
    const S = this.estado, ato = Math.max(1, S.mantis.length), p = this.jogador.pos, alcance = ato >= 4 ? 25 : 22;
    const alvos = this.mundo.humanos.filter((h) => h.pronto <= 0 && h.alvo.distanceTo(p) < alcance).sort((a, b) => a.alvo.distanceTo(p) - b.alvo.distanceTo(p)).slice(0, ato >= 4 ? 99 : ato);
    if (!alvos.length) { this.ui.toast("🦗 Nenhum humano ao alcance (22 unidades)"); return false; }
    for (const h of alvos) {
      S.sangue += Math.round((25 + S.valorGota * 6) * 0.7 * this.multSangue()); S.picadas++; h.pronto = 12;
      for (let i = 1; i <= 8; i++) this.mundo.emitir(V(0, 0, 0).lerpVectors(p, h.alvo, i / 8), 0xffd24a, 1, 0.5);
      this.mundo.emitir(h.alvo, 0xff1744, 10, 3); if (ato >= 4) h.atord = Math.max(h.atord || 0, 3);
    }
    this.ui.toast(`🦗 ${alvos.length} humano(s) picado(s) à distância!`); this.ui.hud(S); this.salvarT = 3;
  }

  picar() {
    const h = this.mundo.humanoPerto; if (!this.jogando || this.menuAberto || !h) return;
    const S = this.estado;
    this.combo = this.comboT > 0 ? Math.min(this.combo + 1, 5) : 1; this.comboT = CFG.COMBO_T * this.estado.attr.combo;
    const ganho = Math.round((25 + S.valorGota * 6) * this.combo * this.multSangue() * (h.atord > 0 ? 1.5 : 1));
    S.sangue += ganho; S.picadas++;
    if (S.attr.cura) this.jogador.vida = Math.min(S.vidaMax, this.jogador.vida + S.attr.cura);   // skins vampíricas curam ao picar
    h.pronto = this.buff.frenesi > 0 ? 3 : 18; h.raiva = this.buff.invis > 0 ? 0 : 4; h.tapa = 0.6;
    if (this.buff.frenesi > 0) this.jogador.vida = Math.min(S.vidaMax, this.jogador.vida + 30);   // 0,6 s de vantagem pra fugir
    this.mundo.emitir(h.alvo, 0xff1744, 26, 4); this.audio.picada(); this.ui.flash("rgba(255,23,68,.35)");
    this.ui.toast(`🩸 Picou ${h.nome}! +${ganho} sangue — fuja do tapa!`); this.ui.hud(S); this.salvarT = 3;
    if (S.picadas >= 10) this.desbloquear("vampiro");
  }
  tapa(h) {
    if (this.estado.attr.intang) { this.ui.toast("👻 O tapa atravessou você!"); return; }   // fantasma é intangível
    if (this.buff.radio > 0 || this.buff.invis > 0 || this.jogador.escudo > 0) { this.ui.toast(this.buff.radio > 0 ? "☢️ A aura impediu o tapa!" : this.buff.invis > 0 ? "👻 Ele não te viu!" : "🔒 O cadeado bloqueou o tapa!"); return; }
    const j = this.jogador;
    j.vel.add(this.tmpEgg.copy(j.pos).sub(h.alvo).setY(0.3).normalize().multiplyScalar(14)); j.shake = 1;
    this.combo = 0; this.comboT = 0; this.kills.tapasRecebidos++; this.audio.tapa(); this.ui.toast(`👋 ${h.nome} te deu um tapa!`);
    this.dano(30);
  }

  // ---- Easter eggs e skins ----
  // ---- Skins e menu de coleção (K = skins, C = conquistas): a simulação pausa enquanto está aberto ----
  apiColecao() { return { escolher: (id) => this.escolherSkin(id), progresso: (id) => this.progresso(id), aba: (a) => this.abrirColecao(a, true), fechar: () => this.fecharColecao() }; }
  abrirColecao(aba, trocar = false) {
    if (!trocar && this.menuAberto && this.aba === aba) { this.fecharColecao(); return; }
    if (!this.menuAberto) this.audio.clique();
    this.aba = aba; this.menuAberto = true; this.audio.silenciar();
    this.ui.abrirColecao(this.estado, aba, this.apiColecao());
  }
  fecharColecao() {
    this.ui.fecharColecao(); this.ui.fecharPergunta(); this.menuAberto = false; this.audio.clique();
    if (this.jogando) this.render.domElement.requestPointerLock?.();
  }
  ajustarLimites() { const S = this.estado, j = this.jogador; j.vida = Math.min(j.vida, S.vidaMax); j.stamina = Math.min(j.stamina, S.staminaMax); }   // bônus de skin podem diminuir os máximos
  escolherSkin(id) {
    const S = this.estado;
    if (id && !S.skins.includes(id)) return;
    S.skin = id; this.jogador.modelo.aplicar(); this.jogador.modelo.punch = 0.6; this.ajustarLimites(); this.audio.clique();
    this.ui.toast(id ? `Skin: ${CFG.SKINS[id].nome}` : "Skin: padrão"); S.salvar();
    if (this.menuAberto) this.ui.abrirColecao(S, this.aba, this.apiColecao());
  }
  desbloquear(id) {
    const S = this.estado, sk = CFG.SKINS[id]; if (!sk || S.skins.includes(id)) return;
    S.skins.push(id); S.skin = id; this.jogador.modelo.aplicar(); this.jogador.modelo.punch = 1; this.ajustarLimites();
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
    if (perto && this.teclas.f) {
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
    this.menuAberto = true; this.audio.silenciar();
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
      if (sk.neblina) w.emitir(mo.traseira(o), 0xbfe6ff, 1, 0.6, "fumaca");
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
    e.style.cssText = `position:fixed;right:22px;top:${80 + (pos - 1) * 76}px;display:flex;gap:12px;align-items:center;background:rgba(12,10,22,.95);border:1px solid ${r.cor};border-left:5px solid ${r.cor};border-radius:12px;padding:12px 16px;z-index:7;font-family:Syne,Figtree,system-ui,sans-serif;color:#eef2f8;pointer-events:none;box-shadow:0 0 22px ${r.cor}55`;
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
      "CORREDOR CENTRAL: armários, bebedouros, extintores e uma carteira perdida (B)\n" +
      "NORTE: Artes · Sala 1 · Sala 2 · Biblioteca · Laboratório · Enfermaria\n" +
      "SUL: Cantina · Ginásio · Banheiro · Auditório (palco, telão e a estátua do Mosquitão)\n\n" +
      "E pica humanos · R habilidade da skin · K skins · C conquistas · H dica de easter egg\n" +
      "Há 15 skins para achar, algumas evoluem (o Tusk) e têm atributos próprios, e cada uma rende uma conquista secreta.",
      "Feche com = ou clique aqui", 12000);
  }

  dano(v, continuo = false) {
    v *= 1 - this.estado.attr.def;   // redução de dano da skin
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
    this.atualizarHab(dt);
    j.fator = (w.emPerigo === "gas" ? 0.65 : 1) * (this.buff.vel > 0 ? 1.7 : 1) * (this.buff.pesado > 0 ? 0.45 : 1);
    j.update(dt, this.teclas);
    w.update(dt, this);
    this.eggMsg = ""; this.checarEggs(dt); this.fxSkin(dt);
    if (this.comboT > 0 && (this.comboT -= dt) <= 0) this.combo = 0;
    if (this.boost > 0) this.boost -= dt;
    this.ui.combo(this.combo, this.comboT, this.boost);
    this.ui.barras(j.stamina, S.staminaMax, j.vida, S.vidaMax);
    this.ui.alerta(w.emPerigo === "gas" ? "☣ GÁS TÓXICO — saia!" : w.emPerigo === "poca" ? "☣ Poça tóxica — suba!" : w.avisoGas ? "⚠ INSETICIDA a caminho!" : w.humanoPerto ? `🩸 Aperte E para picar ${w.humanoPerto.nome}` : this.eggMsg ? this.eggMsg : (w.carteira && w.carteira.visivel && j.pos.distanceToSquared(w.carteira.g.position) < 36) ? "🎒 Aperte B para pegar a carteira" : "",
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
    this.jogador.modelo.tick(this.t, dt); this.jogador.camera3p(dt); this.ui.atualizar(dt);
    this.render.render(this.cena, this.camera);
  }
}

new GameManager();
})();
