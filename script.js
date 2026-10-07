
// ============================================================
// 🦟 MOSQUITO 3D SIMULATOR
// Versão melhorada
// ============================================================

// ============================================================
// CONFIGURAÇÕES GERAIS
// ============================================================

let sangue = 0;
let poderColeta = 1;
let nivelAsas = 1;
let custoUpgrade = 10;

let velocidadeVoo = 4.0;
let velocidadeMaxima = 4.0;
let aceleracao = 12.0;
let desaceleracao = 8.0;

let jogoIniciado = false;
let jogoPausado = false;

const TAMANHO_MUNDO = 30;
const ALTURA_MINIMA = -3;
const ALTURA_MAXIMA = 10;

// ============================================================
// ELEMENTOS HTML
// ============================================================

const txtSangue = document.getElementById("contador-sangue");
const txtPoder = document.getElementById("poder-clique");
const txtNivelAsas = document.getElementById("nivel-asas");
const txtCusto = document.getElementById("custo-upgrade");
const btnEvoluir = document.getElementById("btn-evoluir");
const container3D = document.getElementById("webgl-container");

// ============================================================
// FUNÇÕES DO HUD
// ============================================================

function atualizarTela() {
    if (txtSangue) txtSangue.innerText = Math.floor(sangue);
    if (txtPoder) txtPoder.innerText = poderColeta;
    if (txtNivelAsas) txtNivelAsas.innerText = nivelAsas;
    if (txtCusto) txtCusto.innerText = custoUpgrade;
}

// ============================================================
// MENU INICIAL
// ============================================================

const menuInicial = document.createElement("div");

menuInicial.id = "menu-inicial";

menuInicial.style.cssText = `
    position: fixed;
    inset: 0;
    width: 100vw;
    height: 100vh;

    background:
        radial-gradient(circle at center, rgba(80, 0, 30, 0.35), transparent 45%),
        rgba(5, 5, 15, 0.96);

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    z-index: 99999;

    color: white;
    font-family: Arial, sans-serif;
    text-align: center;

    backdrop-filter: blur(8px);
`;

menuInicial.innerHTML = `
    <div style="
        padding: 45px;
        border: 1px solid rgba(255, 0, 68, 0.25);
        border-radius: 20px;
        background: rgba(20, 10, 25, 0.75);
        box-shadow: 0 0 60px rgba(255, 0, 68, 0.15);
        max-width: 650px;
    ">

        <h1 style="
            font-size: 3.5rem;
            margin: 0 0 12px;
            color: #ff0044;
            text-shadow: 0 0 25px rgba(255,0,68,0.7);
        ">
            🦟 Mosquito 3D Simulator
        </h1>

        <p style="
            margin-bottom: 28px;
            color: #aaa;
            font-size: 1.15rem;
        ">
            Explore o mundo, sugue sangue e evolua seu mosquito.
        </p>

        <div style="
            margin-bottom: 28px;
            padding: 18px;
            border-radius: 12px;
            background: rgba(255,255,255,0.04);
            color: #bbb;
            line-height: 1.8;
        ">
            <strong style="color:#66ff99;">CONTROLES</strong><br>
            🖱️ Mouse — olhar<br>
            ⬆️ W / S — voar para frente/trás<br>
            ⬅️ A / D — virar<br>
            ESC — pausar
        </div>

        <button id="btn-jogar" style="
            padding: 16px 55px;
            font-size: 1.25rem;

            background: linear-gradient(
                135deg,
                #ff0044,
                #c40036
            );

            color: white;
            border: none;
            border-radius: 10px;

            cursor: pointer;
            font-weight: bold;

            box-shadow:
                0 5px 25px rgba(255,0,68,0.4);

            transition: 0.2s;
        ">
            JOGAR
        </button>

    </div>
`;

document.body.appendChild(menuInicial);

const btnJogar = document.getElementById("btn-jogar");

btnJogar.addEventListener("mouseenter", () => {
    btnJogar.style.transform = "scale(1.06)";
});

btnJogar.addEventListener("mouseleave", () => {
    btnJogar.style.transform = "scale(1)";
});

// ============================================================
// CENA THREE.JS
// ============================================================

const cena = new THREE.Scene();

cena.background = new THREE.Color(0x080811);

cena.fog = new THREE.Fog(
    0x080811,
    25,
    100
);

// ============================================================
// CÂMERA
// ============================================================

const camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

camera.position.set(0, 2, 5);

// ============================================================
// RENDERIZADOR
// ============================================================

const renderizador = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: "high-performance"
});

renderizador.setSize(
    window.innerWidth,
    window.innerHeight
);

renderizador.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
);

container3D.appendChild(
    renderizador.domElement
);

// ============================================================
// ILUMINAÇÃO
// ============================================================

const luzAmbiente = new THREE.AmbientLight(
    0xffffff,
    1.1
);

cena.add(luzAmbiente);

const luzPrincipal = new THREE.DirectionalLight(
    0xffffff,
    1.5
);

luzPrincipal.position.set(
    10,
    20,
    10
);

cena.add(luzPrincipal);

const luzVermelha = new THREE.PointLight(
    0xff0044,
    2,
    30
);

luzVermelha.position.set(
    0,
    5,
    0
);

cena.add(luzVermelha);

// ============================================================
// CHÃO
// ============================================================

const chaoGeo = new THREE.PlaneGeometry(
    TAMANHO_MUNDO * 2,
    TAMANHO_MUNDO * 2
);

const chaoMat = new THREE.MeshStandardMaterial({
    color: 0x151522,
    roughness: 0.95,
    metalness: 0
});

const chao = new THREE.Mesh(
    chaoGeo,
    chaoMat
);

chao.rotation.x = -Math.PI / 2;
chao.position.y = -5;

cena.add(chao);

// ============================================================
// GRID DO MUNDO
// ============================================================

const grid = new THREE.GridHelper(
    TAMANHO_MUNDO * 2,
    30,
    0x442233,
    0x20202d
);

grid.position.y = -4.95;

cena.add(grid);

// ============================================================
// 🦟 MODELO 3D DO MOSQUITO — VERSÃO CORRIGIDA
// ============================================================

const mosquitoGrupo = new THREE.Group();

// ============================================================
// MATERIAIS
// ============================================================

const matCorpo = new THREE.MeshStandardMaterial({
    color: 0x18181c,
    roughness: 0.48,
    metalness: 0.05
});

const matCabeca = new THREE.MeshStandardMaterial({
    color: 0x222228,
    roughness: 0.4
});

const matAbdomen = new THREE.MeshStandardMaterial({
    color: 0x3b2025,
    roughness: 0.55
});

const matFaixa = new THREE.MeshStandardMaterial({
    color: 0x111116,
    roughness: 0.65
});

const matOlhos = new THREE.MeshStandardMaterial({
    color: 0x030305,
    roughness: 0.08,
    metalness: 0.25
});

const matPernas = new THREE.MeshStandardMaterial({
    color: 0x0b0b0e,
    roughness: 0.75
});

const matBico = new THREE.MeshStandardMaterial({
    color: 0x070709,
    roughness: 0.25,
    metalness: 0.15
});

const matAsa = new THREE.MeshStandardMaterial({
    color: 0xd8e9ef,
    transparent: true,
    opacity: 0.38,
    side: THREE.DoubleSide,
    roughness: 0.2
});


// ============================================================
// FUNÇÃO PARA CRIAR UM TUBO ENTRE DOIS PONTOS
// ============================================================

function criarSegmento(
    inicio,
    fim,
    raio,
    material
) {
    const direcao = new THREE.Vector3()
        .subVectors(fim, inicio);

    const comprimento = direcao.length();

    const geometria = new THREE.CylinderGeometry(
        raio,
        raio * 0.85,
        comprimento,
        6
    );

    const mesh = new THREE.Mesh(
        geometria,
        material
    );

    const meio = new THREE.Vector3()
        .addVectors(inicio, fim)
        .multiplyScalar(0.5);

    mesh.position.copy(meio);

    mesh.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        direcao.normalize()
    );

    return mesh;
}


// ============================================================
// TÓRAX
// ============================================================

const torax = new THREE.Mesh(
    new THREE.SphereGeometry(
        0.17,
        18,
        14
    ),
    matCorpo
);

torax.scale.set(
    1.0,
    0.9,
    1.35
);

torax.position.set(
    0,
    0,
    0.05
);

mosquitoGrupo.add(torax);


// ============================================================
// CABEÇA
// ============================================================

const cabeca = new THREE.Mesh(
    new THREE.SphereGeometry(
        0.125,
        16,
        12
    ),
    matCabeca
);

cabeca.scale.set(
    1.1,
    0.95,
    1.0
);

cabeca.position.set(
    0,
    0.02,
    -0.25
);

mosquitoGrupo.add(cabeca);


// ============================================================
// OLHOS
// ============================================================

const olhoE = new THREE.Mesh(
    new THREE.SphereGeometry(
        0.09,
        14,
        12
    ),
    matOlhos
);

olhoE.scale.set(
    0.72,
    1.0,
    0.8
);

olhoE.position.set(
    0.105,
    0.045,
    -0.29
);

mosquitoGrupo.add(olhoE);


const olhoD = olhoE.clone();

olhoD.position.x = -0.105;

mosquitoGrupo.add(olhoD);


// ============================================================
// PEQUENO BRILHO DOS OLHOS
// ============================================================

const brilhoE = new THREE.Mesh(
    new THREE.SphereGeometry(
        0.015,
        8,
        8
    ),
    new THREE.MeshBasicMaterial({
        color: 0xff6688
    })
);

brilhoE.position.set(
    0.13,
    0.075,
    -0.35
);

mosquitoGrupo.add(brilhoE);


const brilhoD = brilhoE.clone();

brilhoD.position.x = -0.13;

mosquitoGrupo.add(brilhoD);


// ============================================================
// ABDÔMEN — CORPO CONTÍNUO
// ============================================================

const abdomenGrupo = new THREE.Group();

abdomenGrupo.position.set(
    0,
    0,
    0.38
);

mosquitoGrupo.add(
    abdomenGrupo
);


// Corpo principal usando vários elipsoides
// sobrepostos para não criar buracos.

const abdomen1 = new THREE.Mesh(
    new THREE.SphereGeometry(
        0.22,
        16,
        12
    ),
    matAbdomen
);

abdomen1.scale.set(
    0.82,
    0.82,
    1.35
);

abdomen1.position.z = 0.15;

abdomenGrupo.add(
    abdomen1
);


const abdomen2 = new THREE.Mesh(
    new THREE.SphereGeometry(
        0.18,
        16,
        12
    ),
    matAbdomen
);

abdomen2.scale.set(
    0.72,
    0.72,
    1.5
);

abdomen2.position.z = 0.42;

abdomenGrupo.add(
    abdomen2
);


const abdomen3 = new THREE.Mesh(
    new THREE.SphereGeometry(
        0.12,
        14,
        10
    ),
    matAbdomen
);

abdomen3.scale.set(
    0.65,
    0.65,
    1.45
);

abdomen3.position.z = 0.68;

abdomenGrupo.add(
    abdomen3
);


// ============================================================
// FAIXAS DO ABDÔMEN
// ============================================================

const faixasAbdomen = [
    0.12,
    0.30,
    0.48,
    0.64
];

for (const z of faixasAbdomen) {

    const faixa = new THREE.Mesh(
        new THREE.TorusGeometry(
            0.14,
            0.012,
            6,
            18
        ),
        matFaixa
    );

    faixa.rotation.x =
        Math.PI / 2;

    faixa.scale.set(
        0.9,
        0.9,
        1
    );

    faixa.position.z = z;

    abdomenGrupo.add(
        faixa
    );
}


// ============================================================
// PONTA DO ABDÔMEN
// ============================================================

const pontaAbdomen = new THREE.Mesh(
    new THREE.SphereGeometry(
        0.09,
        12,
        10
    ),
    matAbdomen
);

pontaAbdomen.scale.set(
    0.7,
    0.7,
    1.5
);

pontaAbdomen.position.z =
    0.87;

abdomenGrupo.add(
    pontaAbdomen
);


// ============================================================
// PROBÓSCIDE
// ============================================================

const proboscideInicio =
    new THREE.Vector3(
        0,
        -0.005,
        -0.32
    );

const proboscideFim =
    new THREE.Vector3(
        0,
        -0.015,
        -1.0
    );

const proboscide =
    criarSegmento(
        proboscideInicio,
        proboscideFim,
        0.009,
        matBico
    );

mosquitoGrupo.add(
    proboscide
);


// ============================================================
// ANTENAS
// ============================================================

function criarAntena(lado) {

    const grupo =
        new THREE.Group();

    const base =
        new THREE.Vector3(
            lado * 0.055,
            0.08,
            -0.31
        );

    const meio =
        new THREE.Vector3(
            lado * 0.13,
            0.23,
            -0.34
        );

    const ponta =
        new THREE.Vector3(
            lado * 0.22,
            0.38,
            -0.43
        );

    grupo.add(
        criarSegmento(
            base,
            meio,
            0.006,
            matPernas
        )
    );

    grupo.add(
        criarSegmento(
            meio,
            ponta,
            0.003,
            matPernas
        )
    );

    return grupo;
}

mosquitoGrupo.add(
    criarAntena(1),
    criarAntena(-1)
);


// ============================================================
// PALPOS
// ============================================================

function criarPalpo(lado) {

    const inicio =
        new THREE.Vector3(
            lado * 0.065,
            -0.005,
            -0.32
        );

    const fim =
        new THREE.Vector3(
            lado * 0.11,
            -0.12,
            -0.43
        );

    return criarSegmento(
        inicio,
        fim,
        0.005,
        matPernas
    );
}

mosquitoGrupo.add(
    criarPalpo(1),
    criarPalpo(-1)
);


// ============================================================
// ASAS
// ============================================================

function criarAsa(lado) {

    const grupo =
        new THREE.Group();

    grupo.position.set(
        lado * 0.14,
        0.13,
        0.0
    );

    const forma =
        new THREE.Shape();

    forma.moveTo(0, 0);

    forma.quadraticCurveTo(
        0.30,
        0.10,
        0.72,
        0.04
    );

    forma.quadraticCurveTo(
        0.90,
        0.01,
        0.98,
        -0.06
    );

    forma.quadraticCurveTo(
        0.72,
        -0.15,
        0.35,
        -0.10
    );

    forma.quadraticCurveTo(
        0.12,
        -0.07,
        0,
        0
    );

    const asa = new THREE.Mesh(
        new THREE.ShapeGeometry(
            forma
        ),
        matAsa
    );

    // IMPORTANTE:
    // espelhamos apenas no eixo X
    // sem inverter a geometria inteira.

    asa.scale.x = lado;

    asa.rotation.z =
        lado * 0.08;

    grupo.add(
        asa
    );


    // Veia central
    const veiaInicio =
        new THREE.Vector3(
            lado * 0.02,
            0.002,
            0
        );

    const veiaFim =
        new THREE.Vector3(
            lado * 0.75,
            0.002,
            0
        );

    const veia =
        criarSegmento(
            veiaInicio,
            veiaFim,
            0.0025,
            new THREE.MeshBasicMaterial({
                color: 0x9caeb5,
                transparent: true,
                opacity: 0.35
            })
        );

    grupo.add(
        veia
    );

    return grupo;
}

const asaE =
    criarAsa(1);

const asaD =
    criarAsa(-1);

mosquitoGrupo.add(
    asaE,
    asaD
);


// ============================================================
// PERNAS — 6 PERNAS REAIS
// ============================================================

const pernas = [];

function criarPerna(
    lado,
    z,
    tipo
) {

    const grupo =
        new THREE.Group();

    grupo.position.set(
        lado * 0.10,
        -0.07,
        z
    );

    let joelho;
    let ponta;

    // Perna dianteira
    if (tipo === 0) {

        joelho =
            new THREE.Vector3(
                lado * 0.28,
                -0.18,
                z + 0.03
            );

        ponta =
            new THREE.Vector3(
                lado * 0.48,
                -0.10,
                z - 0.18
            );

    }

    // Perna do meio
    else if (tipo === 1) {

        joelho =
            new THREE.Vector3(
                lado * 0.32,
                -0.28,
                z
            );

        ponta =
            new THREE.Vector3(
                lado * 0.62,
                -0.48,
                z
            );

    }

    // Perna traseira
    else {

        joelho =
            new THREE.Vector3(
                lado * 0.28,
                -0.20,
                z - 0.02
            );

        ponta =
            new THREE.Vector3(
                lado * 0.55,
                -0.08,
                z + 0.20
            );
    }

    const inicio =
        new THREE.Vector3(
            0,
            0,
            0
        );

    grupo.add(
        criarSegmento(
            inicio,
            joelho,
            0.008,
            matPernas
        )
    );

    grupo.add(
        criarSegmento(
            joelho,
            ponta,
            0.005,
            matPernas
        )
    );

    mosquitoGrupo.add(
        grupo
    );

    pernas.push(
        grupo
    );
}


// Três pares
criarPerna(1, 0.16, 0);
criarPerna(-1, 0.16, 0);

criarPerna(1, 0.00, 1);
criarPerna(-1, 0.00, 1);

criarPerna(1, -0.16, 2);
criarPerna(-1, -0.16, 2);


// ============================================================
// ✨ BRILHO DE EVOLUÇÃO DO MOSQUITO
// ============================================================

let evolucaoBrilhando = false;
let tempoBrilho = 0;
let luzEvolucao = null;

// Guarda as cores normais
const coresNormais = {
    corpo: matCorpo.color.clone(),
    cabeca: matCabeca.color.clone(),
    abdomen: matAbdomen.color.clone()
};


// ============================================================
// LUZ QUE FICA DENTRO DO MOSQUITO
// ============================================================

luzEvolucao = new THREE.PointLight(
    0xff0044,
    0,
    5
);

luzEvolucao.position.set(
    0,
    0,
    0
);

mosquitoGrupo.add(
    luzEvolucao
);


// ============================================================
// COMEÇAR BRILHO
// ============================================================

function iniciarBrilhoEvolucao() {

    evolucaoBrilhando = true;
    tempoBrilho = 0;

    // Luz começa forte
    luzEvolucao.intensity = 5;

    // Cor do corpo fica vermelha
    matCorpo.color.setHex(
        0xff174f
    );

    matCabeca.color.setHex(
        0xff174f
    );

    matAbdomen.color.setHex(
        0xff174f
    );

    // Emissive deixa o material realmente emitir luz
    matCorpo.emissive.setHex(
        0xff003c
    );

    matCabeca.emissive.setHex(
        0xff003c
    );

    matAbdomen.emissive.setHex(
        0xff003c
    );

    matCorpo.emissiveIntensity = 2.5;
    matCabeca.emissiveIntensity = 2.5;
    matAbdomen.emissiveIntensity = 2.5;

    // Começa pequeno para dar efeito de transformação
    mosquitoGrupo.scale.multiplyScalar(
        0.85
    );
}


// ============================================================
// ATUALIZAR BRILHO
// ============================================================

function atualizarBrilhoEvolucao(delta) {

    if (!evolucaoBrilhando) {
        return;
    }

    tempoBrilho += delta;

    // Duração total
    const duracao = 1.5;

    const progresso =
        tempoBrilho / duracao;

    // --------------------------------------------
    // PULSAÇÃO DA LUZ
    // --------------------------------------------

    const pulso =
        Math.sin(
            tempoBrilho * 18
        );

    luzEvolucao.intensity =
        4.5 +
        pulso * 2.5;


    // --------------------------------------------
    // PULSAÇÃO DO MOSQUITO
    // --------------------------------------------

    const escalaBase =
        1.0 +
        (nivelAsas - 1) * 0.08;

    const escalaPulso =
        escalaBase +
        Math.sin(
            tempoBrilho * 14
        ) * 0.08;

    mosquitoGrupo.scale.set(
        escalaPulso,
        escalaPulso,
        escalaPulso
    );


    // --------------------------------------------
    // FIM DO BRILHO
    // --------------------------------------------

    if (
        tempoBrilho >= duracao
    ) {

        evolucaoBrilhando = false;

        luzEvolucao.intensity = 0;

        // Restaurar cores
        matCorpo.color.copy(
            coresNormais.corpo
        );

        matCabeca.color.copy(
            coresNormais.cabeca
        );

        matAbdomen.color.copy(
            coresNormais.abdomen
        );

        // Remover emissive
        matCorpo.emissive.setHex(
            0x000000
        );

        matCabeca.emissive.setHex(
            0x000000
        );

        matAbdomen.emissive.setHex(
            0x000000
        );

        matCorpo.emissiveIntensity = 0;
        matCabeca.emissiveIntensity = 0;
        matAbdomen.emissiveIntensity = 0;

        // Voltar para o tamanho normal
        mosquitoGrupo.scale.set(
            escalaBase,
            escalaBase,
            escalaBase
        );
    }
}


// ============================================================
// ESCALA FINAL
// ============================================================

mosquitoGrupo.scale.set(
    1.15,
    1.15,
    1.15
);


// ============================================================
// POSIÇÃO INICIAL
// ============================================================

mosquitoGrupo.position.set(
    0,
    2,
    5
);

cena.add(
    mosquitoGrupo
);

// ============================================================
// 🦟 SISTEMA DE EVOLUÇÃO VISUAL
// ============================================================

function atualizarEvolucaoMosquito() {

    // --------------------------------------------
    // ESCALA GERAL DO CORPO
    // --------------------------------------------

    const escalaCorpo =
        1.0 + (nivelAsas - 1) * 0.08;

    mosquitoGrupo.scale.set(
        escalaCorpo,
        escalaCorpo,
        escalaCorpo
    );


    // --------------------------------------------
    // TAMANHO DAS ASAS
    // --------------------------------------------

    const escalaAsas =
        1.0 + (nivelAsas - 1) * 0.18;

    asaE.scale.set(
        escalaAsas,
        escalaAsas,
        escalaAsas
    );

    asaD.scale.set(
        escalaAsas,
        escalaAsas,
        escalaAsas
    );


    // --------------------------------------------
    // COR DAS ASAS
    // --------------------------------------------

    if (nivelAsas >= 4) {

        matAsa.color.setHex(
            0xffb3c7
        );

        matAsa.opacity = 0.48;

    } else if (nivelAsas >= 2) {

        matAsa.color.setHex(
            0xe6f5ff
        );

        matAsa.opacity = 0.42;

    } else {

        matAsa.color.setHex(
            0xd8e9ef
        );

        matAsa.opacity = 0.38;

    }


    // --------------------------------------------
    // ABDÔMEN
    // --------------------------------------------

    const escalaAbdomen =
        1.0 +
        Math.min(
            nivelAsas - 1,
            8
        ) * 0.08;

    abdomenGrupo.scale.set(
        1,
        1,
        escalaAbdomen
    );


    // --------------------------------------------
    // OLHOS
    // --------------------------------------------

    const tamanhoOlhos =
        1.0 +
        Math.min(
            nivelAsas - 1,
            6
        ) * 0.08;

    olhoE.scale.set(
        0.72 * tamanhoOlhos,
        tamanhoOlhos,
        0.8 * tamanhoOlhos
    );

    olhoD.scale.copy(
        olhoE.scale
    );


    // --------------------------------------------
    // FERRÃO / PROBÓSCIDE
    // --------------------------------------------

    const tamanhoBico =
        1.0 +
        Math.min(
            nivelAsas - 1,
            10
        ) * 0.07;

    proboscide.scale.z =
        tamanhoBico;


    // --------------------------------------------
    // PERNAS
    // --------------------------------------------

    const tamanhoPernas =
        1.0 +
        Math.min(
            nivelAsas - 1,
            8
        ) * 0.06;

    for (const perna of pernas) {

        perna.scale.set(
            tamanhoPernas,
            tamanhoPernas,
            tamanhoPernas
        );

    }


    // --------------------------------------------
    // EVOLUÇÕES ESPECIAIS
    // --------------------------------------------

    atualizarEfeitosEvolucao();
}

// ============================================================
// ✨ EFEITOS ESPECIAIS DA EVOLUÇÃO
// ============================================================

// ============================================================
// 🦟 AURA EVOLUTIVA DO MOSQUITO
// ============================================================

let grupoAura = null;

const auraMateriais = [];

function criarAuraMosquito() {

    // Se já existir, remove
    if (grupoAura) {
        mosquitoGrupo.remove(grupoAura);
    }

    grupoAura = new THREE.Group();

    grupoAura.position.set(
        0,
        0,
        0
    );

    // ========================================================
    // ANEL 1
    // ========================================================

    const material1 =
        new THREE.MeshBasicMaterial({
            color: 0xff174f,
            transparent: true,
            opacity: 0.22,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

    auraMateriais.push(material1);

    const anel1 =
        new THREE.Mesh(
            new THREE.TorusGeometry(
                0.48,
                0.018,
                8,
                40
            ),
            material1
        );

    anel1.rotation.x =
        Math.PI / 2;

    grupoAura.add(
        anel1
    );


    // ========================================================
    // ANEL 2
    // ========================================================

    const material2 =
        new THREE.MeshBasicMaterial({
            color: 0xff003c,
            transparent: true,
            opacity: 0.16,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

    auraMateriais.push(material2);

    const anel2 =
        new THREE.Mesh(
            new THREE.TorusGeometry(
                0.62,
                0.012,
                8,
                40
            ),
            material2
        );

    anel2.rotation.x =
        Math.PI / 3;

    grupoAura.add(
        anel2
    );


    // ========================================================
    // ANEL 3
    // ========================================================

    const material3 =
        new THREE.MeshBasicMaterial({
            color: 0xff6688,
            transparent: true,
            opacity: 0.12,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

    auraMateriais.push(material3);

    const anel3 =
        new THREE.Mesh(
            new THREE.TorusGeometry(
                0.75,
                0.009,
                8,
                40
            ),
            material3
        );

    anel3.rotation.x =
        -Math.PI / 4;

    grupoAura.add(
        anel3
    );


    // ========================================================
    // NÚCLEO DA AURA
    // ========================================================

    const materialNucleo =
        new THREE.MeshBasicMaterial({
            color: 0xff003c,
            transparent: true,
            opacity: 0.045,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

    auraMateriais.push(
        materialNucleo
    );

    const nucleo =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.48,
                16,
                16
            ),
            materialNucleo
        );

    grupoAura.add(
        nucleo
    );


    // Aura começa desligada
    grupoAura.visible =
        nivelAsas >= 2;

    mosquitoGrupo.add(
        grupoAura
    );
}

// ============================================================
// ✨ ANIMAR AURA
// ============================================================

function animarAura(delta) {

    if (!grupoAura) return;

    if (nivelAsas < 2) {
        grupoAura.visible = false;
        return;
    }

    grupoAura.visible = true;

    const tempoAura =
        performance.now() * 0.001;

    // ========================================================
    // PULSAÇÃO
    // ========================================================

    const pulso =
        1 +
        Math.sin(
            tempoAura * 4
        ) * 0.08;

    grupoAura.scale.set(
        pulso,
        pulso,
        pulso
    );


    // ========================================================
    // ROTAÇÃO DOS ANÉIS
    // ========================================================

    if (grupoAura.children[0]) {

        grupoAura.children[0].rotation.z +=
            delta * 1.8;

    }

    if (grupoAura.children[1]) {

        grupoAura.children[1].rotation.y +=
            delta * 2.4;

    }

    if (grupoAura.children[2]) {

        grupoAura.children[2].rotation.x +=
            delta * 1.5;

    }


    // ========================================================
    // INTENSIDADE NORMAL
    // ========================================================

    let intensidade =
        1 +
        (nivelAsas - 2) * 0.12;


    // ========================================================
    // SHIFT = AURA MAIS FORTE
    // ========================================================

    if (sprintAtivo) {

        intensidade *= 1.8;

    }


    // ========================================================
    // PULSO DE LUZ
    // ========================================================

    for (
        const material of auraMateriais
    ) {

        material.opacity =
            material.userData?.opacidadeBase
                ? material.userData.opacidadeBase *
                  intensidade
                : material.opacity;

    }

}

function atualizarEfeitosEvolucao() {

    // Remove aura anterior
    if (auraMosquito) {

        mosquitoGrupo.remove(
            auraMosquito
        );

        auraMosquito.geometry.dispose();
        auraMosquito.material.dispose();

        auraMosquito = null;
    }


    // --------------------------------------------
    // NÍVEL 4+ → AURA
    // --------------------------------------------

    if (nivelAsas >= 4) {

        const tamanhoAura =
            0.35 +
            (nivelAsas - 4) * 0.08;

        auraMosquito =
            new THREE.Mesh(

                new THREE.SphereGeometry(
                    tamanhoAura,
                    16,
                    16
                ),

                new THREE.MeshBasicMaterial({
                    color:
                        nivelAsas >= 7
                            ? 0xff0044
                            : 0xff3355,

                    transparent: true,

                    opacity: 0.12,

                    wireframe: true
                })

            );

        mosquitoGrupo.add(
            auraMosquito
        );
    }
}



// ============================================================
// ESCALA GERAL DO MOSQUITO
// ============================================================

mosquitoGrupo.scale.set(
    1.15,
    1.15,
    1.15
);

// ============================================================
// POSIÇÃO INICIAL
// ============================================================

mosquitoGrupo.position.set(
    0,
    2,
    5
);

cena.add(
    mosquitoGrupo
);

// ============================================================
// POSIÇÃO INICIAL
// ============================================================

mosquitoGrupo.position.set(
    0,
    2,
    5
);

cena.add(
    mosquitoGrupo
);

// ============================================================
// CONTROLES
// ============================================================

const teclas = {};

window.addEventListener(
    "keydown",
    (e) => {

        const tecla =
            e.key.toLowerCase();

        teclas[tecla] = true;

        // ====================================================
        // 🦟 TECLA E — EVOLUIR
        // ====================================================

        if (
            tecla === "e" &&
            !e.repeat &&
            jogoIniciado &&
            !jogoPausado
        ) {

            evoluirMosquito();

        }

        // ====================================================
        // ESC — PAUSAR
        // ====================================================

        if (e.key === "Escape") {

            if (jogoIniciado) {

                jogoPausado =
                    !jogoPausado;

                if (jogoPausado) {

                    document.exitPointerLock();

                } else {

                    container3D.requestPointerLock();

                }

            }

        }

    }
);

window.addEventListener(
    "keyup",
    (e) => {

        teclas[
            e.key.toLowerCase()
        ] = false;

    }
);

// ============================================================
// MOUSE / CÂMERA
// ============================================================

let anguloRotacaoY = 0;
let anguloRotacaoX = 0;

const sensibilidade = 0.0025;

container3D.addEventListener(
    "mousemove",
    (e) => {

        if (!jogoIniciado) return;
        if (jogoPausado) return;

        anguloRotacaoY -=
            e.movementX *
            sensibilidade;

        anguloRotacaoX -=
            e.movementY *
            sensibilidade;

        const limiteVertical =
            Math.PI / 2.4;

        anguloRotacaoX =
            THREE.MathUtils.clamp(
                anguloRotacaoX,
                -limiteVertical,
                limiteVertical
            );

    }
);

// ============================================================
// POINTER LOCK
// ============================================================

btnJogar.addEventListener(
    "click",
    () => {

        container3D.requestPointerLock();

    }
);

document.addEventListener(
    "pointerlockchange",
    () => {

        if (
            document.pointerLockElement ===
            container3D
        ) {

            jogoIniciado = true;
            jogoPausado = false;

            menuInicial.style.display =
                "none";

        } else {

            if (jogoIniciado) {

                jogoPausado = true;

            }

            menuInicial.style.display =
                "flex";

        }

    }
);

// ============================================================
// FONTES DE SANGUE
// ============================================================

const fontesSangue = [];

const sangueGeo =
    new THREE.SphereGeometry(
        0.45,
        16,
        16
    );

const sangueMat =
    new THREE.MeshStandardMaterial({
        color: 0xff003c,
        emissive: 0x660018,
        emissiveIntensity: 1.8,
        roughness: 0.3
    });

function criarFonteSangue(
    x,
    y,
    z
) {

    const fonte =
        new THREE.Mesh(
            sangueGeo,
            sangueMat.clone()
        );

    fonte.position.set(
        x,
        y,
        z
    );

    fonte.userData.velocidade =
        1 + Math.random();

    fonte.userData.offset =
        Math.random() * Math.PI * 2;

    cena.add(fonte);

    fontesSangue.push(
        fonte
    );
}

// Criar várias fontes
for (let i = 0; i < 15; i++) {

    criarFonteSangue(
        (Math.random() - 0.5) *
            TAMANHO_MUNDO * 2,

        -2 +
            Math.random() * 10,

        (Math.random() - 0.5) *
            TAMANHO_MUNDO * 2
    );

}

// ============================================================
// PARTÍCULAS DE COLETA
// ============================================================

const particulas = [];

function criarParticulas(
    posicao
) {

    for (let i = 0; i < 12; i++) {

        const particula =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    0.025,
                    6,
                    6
                ),
                new THREE.MeshBasicMaterial({
                    color: 0xff174f
                })
            );

        particula.position.copy(
            posicao
        );

        particula.userData.velocidade =
            new THREE.Vector3(
                (Math.random() - 0.5) * 3,
                (Math.random() - 0.5) * 3,
                (Math.random() - 0.5) * 3
            );

        particula.userData.vida =
            1;

        cena.add(
            particula
        );

        particulas.push(
            particula
        );

    }

}

function atualizarParticulas(
    delta
) {

    for (
        let i = particulas.length - 1;
        i >= 0;
        i--
    ) {

        const p =
            particulas[i];

        p.position.x +=
            p.userData.velocidade.x *
            delta;

        p.position.y +=
            p.userData.velocidade.y *
            delta;

        p.position.z +=
            p.userData.velocidade.z *
            delta;

        p.userData.vida -=
            delta * 1.5;

        p.scale.setScalar(
            Math.max(
                p.userData.vida,
                0
            )
        );

        if (
            p.userData.vida <= 0
        ) {

            cena.remove(p);

            p.geometry.dispose();
            p.material.dispose();

            particulas.splice(
                i,
                1
            );

        }

    }

}

// ============================================================
// COLETA DE SANGUE
// ============================================================

function coletarSangue(
    fonte
) {

    sangue +=
        poderColeta;

    criarParticulas(
        fonte.position
    );

    fonte.position.set(
        (Math.random() - 0.5) *
            TAMANHO_MUNDO * 2,

        ALTURA_MINIMA +
            Math.random() *
            (ALTURA_MAXIMA -
                ALTURA_MINIMA),

        (Math.random() - 0.5) *
            TAMANHO_MUNDO * 2
    );

    atualizarTela();

}

// ============================================================
// EVOLUÇÃO DAS ASAS
// ============================================================

function atualizarVisualAsas() {

    const escala =
        1 +
        (nivelAsas - 1) *
        0.12;

    asaE.scale.set(
        escala,
        escala,
        escala
    );

    asaD.scale.set(
        escala,
        escala,
        escala
    );

    const opacidade =
        Math.min(
            0.65,
            0.35 +
            (nivelAsas - 1) *
            0.02
        );

    matAsa.opacity =
        opacidade;

}

// ============================================================
// MOVIMENTO
// ============================================================

const velocidadeAtual =
    new THREE.Vector3();

function atualizarMovimento(
    delta
) {

    let frente = 0;
    let lateral = 0;

    if (
        teclas["w"] ||
        teclas["arrowup"]
    ) {

        frente += 1;

    }

    if (
        teclas["s"] ||
        teclas["arrowdown"]
    ) {

        frente -= 1;

    }

    if (teclas["a"]) {

        lateral += 1;

    }

    if (teclas["d"]) {

        lateral -= 1;

    }

    // ----------------------------------------
    // DIREÇÃO
    // ----------------------------------------

    const direcaoFrente =
        new THREE.Vector3(
            -Math.sin(
                anguloRotacaoY
            ),
            Math.sin(
                anguloRotacaoX
            ),
            -Math.cos(
                anguloRotacaoY
            )
        );

    const direcaoLateral =
        new THREE.Vector3(
            Math.cos(
                anguloRotacaoY
            ),
            0,
            -Math.sin(
                anguloRotacaoY
            )
        );

    const movimento =
        new THREE.Vector3();

    movimento.addScaledVector(
        direcaoFrente,
        frente
    );

    movimento.addScaledVector(
        direcaoLateral,
        lateral
    );

    if (
        movimento.lengthSq() > 0
    ) {

        movimento.normalize();

        const velocidadeDesejada =
            velocidadeMaxima;

        velocidadeAtual.lerp(
            movimento.multiplyScalar(
                velocidadeDesejada
            ),
            Math.min(
                1,
                aceleracao * delta
            )
        );

    } else {

        velocidadeAtual.lerp(
            new THREE.Vector3(0, 0, 0),
            Math.min(
                1,
                desaceleracao * delta
            )
        );

    }

    mosquitoGrupo.position.addScaledVector(
        velocidadeAtual,
        delta
    );

    // ----------------------------------------
    // LIMITES DO MAPA
    // ----------------------------------------

    mosquitoGrupo.position.x =
        THREE.MathUtils.clamp(
            mosquitoGrupo.position.x,
            -TAMANHO_MUNDO,
            TAMANHO_MUNDO
        );

    mosquitoGrupo.position.y =
        THREE.MathUtils.clamp(
            mosquitoGrupo.position.y,
            ALTURA_MINIMA,
            ALTURA_MAXIMA
        );

    mosquitoGrupo.position.z =
        THREE.MathUtils.clamp(
            mosquitoGrupo.position.z,
            -TAMANHO_MUNDO,
            TAMANHO_MUNDO
        );

}

// ============================================================
// ANIMAÇÃO DO MOSQUITO
// ============================================================

let tempo = 0;

function animarMosquito(
    delta
) {

    tempo += delta;

    const intensidadeVoo =
        velocidadeAtual.length() > 0.2
            ? 1
            : 0.35;

    // Asas
    const baterAsas =
        Math.sin(
            tempo * 45
        ) *
        0.65 *
        intensidadeVoo;

    asaE.rotation.z =
        baterAsas;

    asaD.rotation.z =
        -baterAsas;

    // Pequena oscilação do corpo
    mosquitoGrupo.position.y +=
        Math.sin(
            tempo * 5
        ) *
        0.003;

    // Inclinação durante movimento
    const inclinacao =
        -velocidadeAtual.length() *
        0.025;

    mosquitoGrupo.rotation.z =
        THREE.MathUtils.lerp(
            mosquitoGrupo.rotation.z,
            inclinacao,
            5 * delta
        );

}

// ============================================================
// ROTAÇÃO DO MOSQUITO
// ============================================================

function atualizarRotacao(
    delta
) {

    const rotacaoAlvo =
        anguloRotacaoY;

    mosquitoGrupo.rotation.y =
        THREE.MathUtils.lerp(
            mosquitoGrupo.rotation.y,
            rotacaoAlvo,
            10 * delta
        );

}

// ============================================================
// CÂMERA DE TERCEIRA PESSOA
// ============================================================

const posicaoCameraDesejada =
    new THREE.Vector3();

const alvoCamera =
    new THREE.Vector3();

function atualizarCamera(
    delta
) {

    const distancia =
        3.5;

    const altura =
        1.1;

    const frenteX =
        -Math.sin(
            anguloRotacaoY
        );

    const frenteZ =
        -Math.cos(
            anguloRotacaoY
        );

    posicaoCameraDesejada.set(
        mosquitoGrupo.position.x -
            frenteX * distancia,

        mosquitoGrupo.position.y +
            altura -
            Math.sin(
                anguloRotacaoX
            ) * distancia,

        mosquitoGrupo.position.z -
            frenteZ * distancia
    );

    camera.position.lerp(
        posicaoCameraDesejada,
        Math.min(
            1,
            8 * delta
        )
    );

    alvoCamera.set(
        mosquitoGrupo.position.x +
            frenteX * 2,

        mosquitoGrupo.position.y +
            Math.sin(
                anguloRotacaoX
            ) * 2,

        mosquitoGrupo.position.z +
            frenteZ * 2
    );

    camera.lookAt(
        alvoCamera
    );

}

// ============================================================
// ANIMAÇÃO DAS FONTES DE SANGUE
// ============================================================

function atualizarFontesSangue(
    delta
) {

    for (
        const fonte of fontesSangue
    ) {

        const offset =
            fonte.userData.offset;

        const velocidade =
            fonte.userData.velocidade;

        fonte.rotation.y +=
            delta * velocidade;

        fonte.rotation.x +=
            delta *
            velocidade *
            0.5;

        const escala =
            1 +
            Math.sin(
                tempo * 3 +
                offset
            ) *
            0.15;

        fonte.scale.setScalar(
            escala
        );

        fonte.position.y +=
            Math.sin(
                tempo * 2 +
                offset
            ) *
            0.002;

    }

}

// ============================================================
// VERIFICAR COLETA
// ============================================================

function verificarColeta() {

    for (
        const fonte of fontesSangue
    ) {

        const distancia =
            mosquitoGrupo.position.distanceTo(
                fonte.position
            );

        if (
            distancia < 1.15
        ) {

            coletarSangue(
                fonte
            );

        }

    }

}

// ============================================================
// 🩸 TEXTO DE EVOLUÇÃO
// ============================================================

const textoEvolucao = document.createElement("div");

textoEvolucao.id = "texto-evolucao";

textoEvolucao.innerHTML = `
    <div class="evolucao-titulo">
        EVOLUÇÃO!
    </div>

    <div class="evolucao-nivel">
        NÍVEL <span id="evolucao-nivel">2</span>
    </div>
`;

textoEvolucao.style.cssText = `
    position: fixed;
    left: 50%;
    top: 50%;

    transform: translate(-50%, -50%) scale(0.3);

    z-index: 100000;

    pointer-events: none;

    text-align: center;

    font-family: Arial, sans-serif;

    opacity: 0;

    transition:
        opacity 0.2s ease,
        transform 0.45s cubic-bezier(.17,.67,.3,1.4);

    display: none;
`;

document.body.appendChild(
    textoEvolucao
);


// ============================================================
// ANIMAÇÃO DO TEXTO
// ============================================================

function mostrarEvolucao() {

    const nivelTexto =
        document.getElementById(
            "evolucao-nivel"
        );

    nivelTexto.innerText =
        nivelAsas;

    textoEvolucao.style.display =
        "block";

    // Força o navegador a reconhecer o estado inicial
    textoEvolucao.offsetHeight;

    textoEvolucao.style.opacity =
        "1";

    textoEvolucao.style.transform =
        "translate(-50%, -50%) scale(1.15)";


    // Pequeno atraso para voltar ao tamanho normal
    setTimeout(() => {

        textoEvolucao.style.transform =
            "translate(-50%, -50%) scale(1)";

    }, 350);


    // Depois desaparece
    setTimeout(() => {

        textoEvolucao.style.opacity =
            "0";

        textoEvolucao.style.transform =
            "translate(-50%, -50%) scale(1.4)";

    }, 1600);


    // Remove visualmente depois da animação
    setTimeout(() => {

        textoEvolucao.style.display =
            "none";

    }, 2100);

    const estiloEvolucao =
    document.createElement("style");

    estiloEvolucao.textContent = `

        #texto-evolucao {

            filter:
                drop-shadow(
                    0 0 10px rgba(255, 0, 68, 0.9)
                )
                drop-shadow(
                    0 0 30px rgba(255, 0, 68, 0.6)
                );

        }


        .evolucao-titulo {

            color: #ff174f;

            font-size: clamp(
                45px,
                7vw,
                100px
            );

            font-weight: 900;

            letter-spacing: 8px;

            text-shadow:
                0 0 5px #ffffff,
                0 0 15px #ff0044,
                0 0 35px #ff0044,
                0 0 70px #ff0044;

        }


        .evolucao-nivel {

            margin-top: 8px;

            color: white;

            font-size: clamp(
                18px,
                2vw,
                30px
            );

            font-weight: bold;

            letter-spacing: 5px;

            text-shadow:
                0 0 10px #ff0044;

        }

    `;

    document.head.appendChild(
        estiloEvolucao
    );
}

// ============================================================
// 🦟 EVOLUIR MOSQUITO
// ============================================================

function evoluirMosquito() {

    if (sangue >= custoUpgrade) {

        sangue -= custoUpgrade;

        nivelAsas++;

        poderColeta += 1;

        velocidadeMaxima += 0.45;

        velocidadeVoo =
            velocidadeMaxima;

        custoUpgrade =
            Math.floor(
                custoUpgrade * 1.5
            );

        atualizarEvolucaoMosquito();

        iniciarBrilhoEvolucao();

        mostrarEvolucao();

        atualizarTela();

    } else {

        console.log(
            `🩸 Sangue insuficiente! Você precisa de ${custoUpgrade}.`
        );

    }
}

// ============================================================
// LOOP PRINCIPAL
// ============================================================

const relogio =
    new THREE.Clock();

function animar() {

    requestAnimationFrame(
        animar
    );

    const delta =
        Math.min(
            relogio.getDelta(),
            0.05
        );

    // Mesmo pausado, mantém a renderização
    renderizador.render(
        cena,
        camera
    );

    if (
        !jogoIniciado ||
        jogoPausado
    ) {

        return;

    }

    // Movimento
    atualizarMovimento(delta);

    // Animações
    animarMosquito(delta);

    atualizarRotacao(delta);

    atualizarCamera(delta);

    atualizarFontesSangue(delta);

    atualizarParticulas(delta);

    atualizarBrilhoEvolucao(delta);

    verificarColeta();

}

// ============================================================
// RESIZE
// ============================================================

window.addEventListener(
    "resize",
    () => {

        camera.aspect =
            window.innerWidth /
            window.innerHeight;

        camera.updateProjectionMatrix();

        renderizador.setSize(
            window.innerWidth,
            window.innerHeight
        );

    }
);

// ============================================================
// INICIALIZAÇÃO
// ============================================================

atualizarTela();

atualizarVisualAsas();

animar();