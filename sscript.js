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

// ============================================================
// 🏃 SPRINT
// ============================================================

let sprintAtivo = false;

const multiplicadorSprint = 2.2;
const aceleracaoSprint = 22.0;

let jogoIniciado = false;
let jogoPausado = false;

const TAMANHO_MUNDO = 30;
const ALTURA_MINIMA = -3;
const ALTURA_MAXIMA = 10;

// ============================================================
// ELEMENTOS HTML
// ============================================================

const txtSangue =
    document.getElementById("contador-sangue");

const txtPoder =
    document.getElementById("poder-clique");

const txtNivelAsas =
    document.getElementById("nivel-asas");

const txtCusto =
    document.getElementById("custo-upgrade");

const btnEvoluir =
    document.getElementById("btn-evoluir");

const container3D =
    document.getElementById("webgl-container");

// ============================================================
// FUNÇÕES DO HUD
// ============================================================

function atualizarTela() {

    if (txtSangue) {
        txtSangue.innerText =
            Math.floor(sangue);
    }

    if (txtPoder) {
        txtPoder.innerText =
            poderColeta;
    }

    if (txtNivelAsas) {
        txtNivelAsas.innerText =
            nivelAsas;
    }

    if (txtCusto) {
        txtCusto.innerText =
            custoUpgrade;
    }
}

// ============================================================
// MENU INICIAL
// ============================================================

const menuInicial =
    document.createElement("div");

menuInicial.id =
    "menu-inicial";

menuInicial.style.cssText = `
    position: fixed;
    inset: 0;
    width: 100vw;
    height: 100vh;

    background:
        radial-gradient(
            circle at center,
            rgba(80, 0, 30, 0.35),
            transparent 45%
        ),
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
        box-shadow:
            0 0 60px rgba(255, 0, 68, 0.15);
        max-width: 650px;
    ">

        <h1 style="
            font-size: 3.5rem;
            margin: 0 0 12px;
            color: #ff0044;
            text-shadow:
                0 0 25px rgba(255,0,68,0.7);
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
            <strong style="color:#66ff99;">
                CONTROLES
            </strong><br>

            🖱️ Mouse — olhar<br>
            ⬆️ W / S — voar para frente/trás<br>
            ⬅️ A / D — virar<br>
            ⚡ SHIFT — sprint<br>
            E — evoluir<br>
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

document.body.appendChild(
    menuInicial
);

const btnJogar =
    document.getElementById("btn-jogar");

btnJogar.addEventListener(
    "mouseenter",
    () => {
        btnJogar.style.transform =
            "scale(1.06)";
    }
);

btnJogar.addEventListener(
    "mouseleave",
    () => {
        btnJogar.style.transform =
            "scale(1)";
    }
);

// ============================================================
// CENA THREE.JS
// ============================================================

const cena =
    new THREE.Scene();

cena.background =
    new THREE.Color(0x080811);

cena.fog =
    new THREE.Fog(
        0x080811,
        25,
        100
    );

// ============================================================
// CÂMERA
// ============================================================

const camera =
    new THREE.PerspectiveCamera(
        70,
        window.innerWidth /
            window.innerHeight,
        0.1,
        1000
    );

camera.position.set(
    0,
    2,
    5
);

// ============================================================
// RENDERIZADOR
// ============================================================

const renderizador =
    new THREE.WebGLRenderer({
        antialias: true,
        powerPreference:
            "high-performance"
    });

renderizador.setSize(
    window.innerWidth,
    window.innerHeight
);

renderizador.setPixelRatio(
    Math.min(
        window.devicePixelRatio,
        2
    )
);

container3D.appendChild(
    renderizador.domElement
);

// ============================================================
// ILUMINAÇÃO
// ============================================================

const luzAmbiente =
    new THREE.AmbientLight(
        0xffffff,
        1.1
    );

cena.add(
    luzAmbiente
);

const luzPrincipal =
    new THREE.DirectionalLight(
        0xffffff,
        1.5
    );

luzPrincipal.position.set(
    10,
    20,
    10
);

cena.add(
    luzPrincipal
);

const luzVermelha =
    new THREE.PointLight(
        0xff0044,
        2,
        30
    );

luzVermelha.position.set(
    0,
    5,
    0
);

cena.add(
    luzVermelha
);

// ============================================================
// CHÃO
// ============================================================

const chaoGeo =
    new THREE.PlaneGeometry(
        TAMANHO_MUNDO * 2,
        TAMANHO_MUNDO * 2
    );

const chaoMat =
    new THREE.MeshStandardMaterial({
        color: 0x151522,
        roughness: 0.95,
        metalness: 0
    });

const chao =
    new THREE.Mesh(
        chaoGeo,
        chaoMat
    );

chao.rotation.x =
    -Math.PI / 2;

chao.position.y =
    -5;

cena.add(
    chao
);

// ============================================================
// GRID DO MUNDO
// ============================================================

const grid =
    new THREE.GridHelper(
        TAMANHO_MUNDO * 2,
        30,
        0x442233,
        0x20202d
    );

grid.position.y =
    -4.95;

cena.add(
    grid
);

// ============================================================
// 🦟 MODELO 3D DO MOSQUITO
// ============================================================

const mosquitoGrupo =
    new THREE.Group();

let asaE = null;
let asaD = null;

let pernas = [];

// ============================================================
// MATERIAIS
// ============================================================

const matCorpo =
    new THREE.MeshStandardMaterial({
        color: 0x18181c,
        roughness: 0.48,
        metalness: 0.05
    });

const matCabeca =
    new THREE.MeshStandardMaterial({
        color: 0x222228,
        roughness: 0.4
    });

const matAbdomen =
    new THREE.MeshStandardMaterial({
        color: 0x3b2025,
        roughness: 0.55
    });

const matFaixa =
    new THREE.MeshStandardMaterial({
        color: 0x111116,
        roughness: 0.65
    });

const matOlhos =
    new THREE.MeshStandardMaterial({
        color: 0x030305,
        roughness: 0.08,
        metalness: 0.25
    });

const matPernas =
    new THREE.MeshStandardMaterial({
        color: 0x0b0b0e,
        roughness: 0.75
    });

const matBico =
    new THREE.MeshStandardMaterial({
        color: 0x070709,
        roughness: 0.25,
        metalness: 0.15
    });

const matAsa =
    new THREE.MeshStandardMaterial({
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

    const direcao =
        new THREE.Vector3()
            .subVectors(
                fim,
                inicio
            );

    const comprimento =
        direcao.length();

    const geometria =
        new THREE.CylinderGeometry(
            raio,
            raio * 0.85,
            comprimento,
            6
        );

    const mesh =
        new THREE.Mesh(
            geometria,
            material
        );

    const meio =
        new THREE.Vector3()
            .addVectors(
                inicio,
                fim
            )
            .multiplyScalar(0.5);

    mesh.position.copy(
        meio
    );

    mesh.quaternion
        .setFromUnitVectors(
            new THREE.Vector3(
                0,
                1,
                0
            ),
            direcao.normalize()
        );

    return mesh;
}

// ============================================================
// TÓRAX
// ============================================================

const torax =
    new THREE.Mesh(
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

mosquitoGrupo.add(
    torax
);

// ============================================================
// CABEÇA
// ============================================================

const cabeca =
    new THREE.Mesh(
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

mosquitoGrupo.add(
    cabeca
);

// ============================================================
// OLHOS
// ============================================================

const olhoE =
    new THREE.Mesh(
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

mosquitoGrupo.add(
    olhoE
);

const olhoD =
    olhoE.clone();

olhoD.position.x =
    -0.105;

mosquitoGrupo.add(
    olhoD
);

// ============================================================
// BRILHO DOS OLHOS
// ============================================================

const brilhoE =
    new THREE.Mesh(
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

mosquitoGrupo.add(
    brilhoE
);

const brilhoD =
    brilhoE.clone();

brilhoD.position.x =
    -0.13;

mosquitoGrupo.add(
    brilhoD
);

// ============================================================
// ABDÔMEN
// ============================================================

const abdomenGrupo =
    new THREE.Group();

abdomenGrupo.position.set(
    0,
    0,
    0.38
);

mosquitoGrupo.add(
    abdomenGrupo
);

const abdomen1 =
    new THREE.Mesh(
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

abdomen1.position.z =
    0.15;

abdomenGrupo.add(
    abdomen1
);

const abdomen2 =
    new THREE.Mesh(
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

abdomen2.position.z =
    0.42;

abdomenGrupo.add(
    abdomen2
);

const abdomen3 =
    new THREE.Mesh(
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

abdomen3.position.z =
    0.68;

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

for (
    const z
    of faixasAbdomen
) {

    const faixa =
        new THREE.Mesh(
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

    faixa.position.z =
        z;

    abdomenGrupo.add(
        faixa
    );
}

// ============================================================
// PONTA DO ABDÔMEN
// ============================================================

const pontaAbdomen =
    new THREE.Mesh(
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
// 🪽 ASAS
// ============================================================

asaE =
    new THREE.Mesh(
        new THREE.BufferGeometry()
            .setFromPoints([
                new THREE.Vector3(
                    0, 0, 0
                ),
                new THREE.Vector3(
                    0.75,
                    0.18,
                    0.05
                ),
                new THREE.Vector3(
                    1.25,
                    0.05,
                    0.12
                ),
                new THREE.Vector3(
                    0.65,
                    -0.05,
                    0.08
                )
            ]),
        matAsa
    );

asaE.geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(
        [
            0, 0, 0,
            0.75, 0.18, 0.05,
            1.25, 0.05, 0.12,
            0.65, -0.05, 0.08
        ],
        3
    )
);

asaE.geometry.setIndex([
    0, 1, 2,
    0, 2, 3
]);

asaE.geometry.computeVertexNormals();

asaE.position.set(
    0.12,
    0.08,
    0.02
);

asaE.rotation.y =
    0.15;

mosquitoGrupo.add(
    asaE
);

// ============================================================
// ASA DIREITA
// ============================================================

asaD =
    asaE.clone();

asaD.position.x =
    -0.12;

asaD.scale.x =
    -1;

mosquitoGrupo.add(
    asaD
);

// ============================================================
// 🦵 PERNAS — 6 PERNAS ARTICULADAS
// ============================================================

pernas = [];


// ============================================================
// CRIAR UMA PERNA
// ============================================================

function criarPerna(
    lado,
    z,
    tipo
) {

    const grupo =
        new THREE.Group();

    // --------------------------------------------------------
    // PONTO DE SAÍDA DO TÓRAX
    // --------------------------------------------------------

    grupo.position.set(
        lado * 0.135,
        -0.04,
        z
    );

    // --------------------------------------------------------
    // CONFIGURAÇÃO DE CADA PAR
    // --------------------------------------------------------

    let joelho;
    let tornozelo;
    let ponta;

    // --------------------------------------------------------
    // PERNA DIANTEIRA
    // --------------------------------------------------------

    if (tipo === 0) {

        joelho =
            new THREE.Vector3(
                lado * 0.25,
                -0.13,
                -0.04
            );

        tornozelo =
            new THREE.Vector3(
                lado * 0.42,
                -0.25,
                -0.14
            );

        ponta =
            new THREE.Vector3(
                lado * 0.58,
                -0.30,
                -0.30
            );

    }

    // --------------------------------------------------------
    // PERNA CENTRAL
    // --------------------------------------------------------

    else if (tipo === 1) {

        joelho =
            new THREE.Vector3(
                lado * 0.30,
                -0.16,
                0
            );

        tornozelo =
            new THREE.Vector3(
                lado * 0.48,
                -0.30,
                0.02
            );

        ponta =
            new THREE.Vector3(
                lado * 0.68,
                -0.34,
                -0.02
            );

    }

    // --------------------------------------------------------
    // PERNA TRASEIRA
    // --------------------------------------------------------

    else {

        joelho =
            new THREE.Vector3(
                lado * 0.28,
                -0.12,
                0.04
            );

        tornozelo =
            new THREE.Vector3(
                lado * 0.47,
                -0.26,
                0.18
            );

        ponta =
            new THREE.Vector3(
                lado * 0.72,
                -0.30,
                0.36
            );

    }


    // ========================================================
    // COXA
    // ========================================================

    const coxa =
        criarSegmento(
            new THREE.Vector3(
                0,
                0,
                0
            ),
            joelho,
            0.014,
            matPernas
        );

    grupo.add(
        coxa
    );


    // ========================================================
    // JOELHO
    // ========================================================

    const esferaJoelho =
        new THREE.Mesh(

            new THREE.SphereGeometry(
                0.018,
                8,
                6
            ),

            matPernas
        );

    esferaJoelho.position.copy(
        joelho
    );

    grupo.add(
        esferaJoelho
    );


    // ========================================================
    // CANELA
    // ========================================================

    const canela =
        criarSegmento(
            joelho,
            tornozelo,
            0.010,
            matPernas
        );

    grupo.add(
        canela
    );


    // ========================================================
    // TARSO / PONTA
    // ========================================================

    const tarso =
        criarSegmento(
            tornozelo,
            ponta,
            0.006,
            matPernas
        );

    grupo.add(
        tarso
    );


    // ========================================================
    // PEQUENA PONTA DA PERNA
    // ========================================================

    const pontaFinal =
        ponta.clone();

    pontaFinal.x +=
        lado * 0.08;

    pontaFinal.y -=
        0.015;


    const pe =
        criarSegmento(
            ponta,
            pontaFinal,
            0.004,
            matPernas
        );

    grupo.add(
        pe
    );


    // ========================================================
    // ADICIONAR AO MOSQUITO
    // ========================================================

    mosquitoGrupo.add(
        grupo
    );

    pernas.push(
        grupo
    );

}


// ============================================================
// 🦵 TRÊS PARES
// ============================================================

// Frente
criarPerna(
    1,
    -0.13,
    0
);

criarPerna(
    -1,
    -0.13,
    0
);


// Meio
criarPerna(
    1,
    0.00,
    1
);

criarPerna(
    -1,
    0.00,
    1
);


// Trás
criarPerna(
    1,
    0.13,
    2
);

criarPerna(
    -1,
    0.13,
    2
);


// ============================================================
// 🦵 ANIMAÇÃO MAIS NATURAL DAS PERNAS
// ============================================================

let tempoPernas =
    0;

function animarPernas(
    delta
) {

    tempoPernas +=
        delta;

    if (
        !Array.isArray(pernas) ||
        pernas.length === 0
    ) {

        return;

    }


    const movimento =
        Math.sin(
            tempoPernas * 7
        );


    for (
        let i = 0;
        i < pernas.length;
        i++
    ) {

        const perna =
            pernas[i];

        if (!perna) {

            continue;

        }


        const lado =
            i % 2 === 0
                ? 1
                : -1;


        const par =
            Math.floor(
                i / 2
            );


        // ----------------------------------------------------
        // CADA PAR TEM UM MOVIMENTO DIFERENTE
        // ----------------------------------------------------

        const fase =
            par *
            0.8;


        const movimentoPerna =
            Math.sin(
                tempoPernas * 7 +
                fase
            );


        // ----------------------------------------------------
        // MOVIMENTO PARA FRENTE/TRÁS
        // ----------------------------------------------------

        perna.rotation.z =
            movimentoPerna *
            0.10 *
            lado;


        // ----------------------------------------------------
        // PEQUENA OSCILAÇÃO VERTICAL
        // ----------------------------------------------------

        perna.rotation.x =
            Math.cos(
                tempoPernas * 7 +
                fase
            ) *
            0.035;


        // ----------------------------------------------------
        // PEQUENA VARIAÇÃO LATERAL
        // ----------------------------------------------------

        perna.rotation.y =
            movimento *
            0.025 *
            lado;

    }

}

// ============================================================
// ✨ AURA DO MOSQUITO
// ============================================================

let grupoAura = null;

let luzEvolucao = null;

const auraMateriais = [];

// ============================================================
// CRIAR AURA
// ============================================================

function criarAuraMosquito() {

    // Remove aura anterior
    if (grupoAura) {
        mosquitoGrupo.remove(grupoAura);

        grupoAura.traverse(obj => {
            if (obj.geometry) obj.geometry.dispose();

            if (obj.material) {
                obj.material.dispose();
            }
        });

        grupoAura = null;
    }

    auraMateriais.length = 0;

    if (nivelAsas < 2) return;

    grupoAura = new THREE.Group();

    grupoAura.position.set(
        0,
        -0.7,
        0
    );

    const corAura =
        nivelAsas === 2 ? 0x00ffff :
        nivelAsas === 3 ? 0x7c4dff :
        nivelAsas === 4 ? 0xff00ff :
        0xffd700;

    // Quanto maior o nível, mais fumaça
    const quantidade =
        nivelAsas === 2 ? 8 :
        nivelAsas === 3 ? 10 :
        nivelAsas === 4 ? 12 :
        14;

    for (let i = 0; i < quantidade; i++) {

    const tamanho =
        0.035 + Math.random() * 0.06;

    const geometria =
        new THREE.SphereGeometry(
            tamanho,
            8,
            8
        );

    const material =
        new THREE.MeshBasicMaterial({
            color: corAura,
            transparent: true,
            opacity: 0.08 + Math.random() * 0.10,
            depthWrite: false
        });

    const fumaça =
        new THREE.Mesh(
            geometria,
            material
        );

    const angulo =
        Math.random() * Math.PI * 2;

    const distancia =
        0.35 + Math.random() * 0.55;

    fumaça.position.set(
        Math.cos(angulo) * distancia,
        -0.3 + Math.random() * 1.2,
        Math.sin(angulo) * distancia
    );

    fumaça.userData.velocidade =
        0.08 + Math.random() * 0.12;

    fumaça.userData.offset =
        Math.random() * Math.PI * 2;

    fumaça.userData.tamanho =
        tamanho;

    grupoAura.add(fumaça);
    auraMateriais.push(material);
}

    mosquitoGrupo.add(grupoAura);
}

// ============================================================
// ATUALIZAR EFEITOS DA EVOLUÇÃO
// ============================================================

function atualizarEfeitosEvolucao() {

    if (
        nivelAsas >= 2 &&
        !grupoAura
    ) {

        criarAuraMosquito();

    }

    // --------------------------------------------------------
    // COR DOS EFEITOS
    // --------------------------------------------------------

    let cor;

    if (nivelAsas >= 10) {

        cor = 0xffd84d;

    } else if (nivelAsas >= 7) {

        cor = 0x39d9ff;

    } else if (nivelAsas >= 4) {

        cor = 0xd83cff;

    } else if (nivelAsas >= 2) {

        cor = 0xff174f;

    }

    // --------------------------------------------------------
    // LUZ DE EVOLUÇÃO
    // --------------------------------------------------------

    if (luzEvolucao) {

        luzEvolucao.color.setHex(
            cor || 0xff0044
        );

    }
}


// ============================================================
// ANIMAÇÃO DA AURA
// ============================================================

function animarAura(delta) {

    if (!grupoAura) return;

    const tempo =
        performance.now() * 0.001;

    grupoAura.children.forEach((fumaça) => {

        const dados = fumaça.userData;

        // Sobe lentamente
        fumaça.position.y +=
            delta * dados.velocidade;

        // Movimento suave de fumaça
        fumaça.position.x +=
            Math.sin(
                tempo * 0.8 +
                dados.offset
            ) * delta * 0.08;

        fumaça.position.z +=
            Math.cos(
                tempo * 0.7 +
                dados.offset
            ) * delta * 0.08;

        // Pulsa suavemente
        const escala =
            1 +
            Math.sin(
                tempo * 1.5 +
                dados.offset
            ) * 0.25;

        fumaça.scale.set(
            escala,
            escala,
            escala
        );

        // Quando sobe demais, volta para baixo
        if (fumaça.position.y > 2.0) {

            fumaça.position.y = -0.5;

            fumaça.position.x =
                (Math.random() - 0.5) * 2.5;

            fumaça.position.z =
                (Math.random() - 0.5) * 2.5;
        }
    });
}


// ============================================================
// INICIALIZAR AURA
// ============================================================

criarAuraMosquito();

atualizarEfeitosEvolucao();


// ============================================================
// EVOLUIR MOSQUITO
// ============================================================

function evoluirMosquito() {

    // --------------------------------------------------------
    // VERIFICA SANGUE
    // --------------------------------------------------------

    if (
        sangue < custoUpgrade
    ) {

        mostrarMensagem(
            "❌ Sangue insuficiente!"
        );

        return;
    }

    // --------------------------------------------------------
    // GASTA SANGUE
    // --------------------------------------------------------

    sangue -= custoUpgrade;

    // --------------------------------------------------------
    // AUMENTA NÍVEL
    // --------------------------------------------------------

    nivelAsas++;

    // --------------------------------------------------------
    // AUMENTA PODER DE COLETA
    // --------------------------------------------------------

    poderColeta += 1;

    // --------------------------------------------------------
    // AUMENTA VELOCIDADE
    // --------------------------------------------------------

    velocidadeMaxima +=
        0.35;

    velocidadeVoo =
        velocidadeMaxima;

    // --------------------------------------------------------
    // AUMENTA CUSTO
    // --------------------------------------------------------

    custoUpgrade =
        Math.floor(
            custoUpgrade * 1.7
        );

    // --------------------------------------------------------
    // ATUALIZA VISUAL
    // --------------------------------------------------------

    atualizarEvolucaoMosquito();

    atualizarEfeitosEvolucao();

    // --------------------------------------------------------
    // BRILHO
    // --------------------------------------------------------

    iniciarBrilhoEvolucao();

    // --------------------------------------------------------
    // MENSAGEM
    // --------------------------------------------------------

    mostrarEvolucao();

    // --------------------------------------------------------
    // HUD
    // --------------------------------------------------------

    atualizarTela();
}


// ============================================================
// BOTÃO DE EVOLUÇÃO
// ============================================================

if (btnEvoluir) {

    btnEvoluir.addEventListener(
        "click",
        evoluirMosquito
    );

}


// ============================================================
// TECLA E — EVOLUIR
// ============================================================

document.addEventListener(
    "keydown",
    event => {

        if (
            event.repeat
        ) {
            return;
        }

        if (
            event.key.toLowerCase() === "e"
        ) {

            if (
                jogoIniciado &&
                !jogoPausado
            ) {

                evoluirMosquito();

            }

        }

    }
);


// ============================================================
// MENSAGEM TEMPORÁRIA
// ============================================================

function mostrarMensagem(
    texto
) {

    const mensagem =
        document.createElement(
            "div"
        );

    mensagem.style.cssText = `
        position: fixed;

        left: 50%;
        top: 75%;

        transform:
            translate(-50%, -50%);

        padding:
            12px 24px;

        background:
            rgba(10, 10, 15, 0.9);

        border:
            1px solid
            rgba(255, 0, 68, 0.5);

        border-radius:
            10px;

        color:
            white;

        font-family:
            Arial, sans-serif;

        font-size:
            16px;

        z-index:
            100000;

        pointer-events:
            none;

        box-shadow:
            0 0 25px
            rgba(255, 0, 68, 0.2);

        opacity:
            0;

        transition:
            opacity 0.2s ease;
    `;

    mensagem.innerText =
        texto;

    document.body.appendChild(
        mensagem
    );

    requestAnimationFrame(
        () => {

            mensagem.style.opacity =
                "1";

        }
    );

    setTimeout(
        () => {

            mensagem.style.opacity =
                "0";

            setTimeout(
                () => {

                    mensagem.remove();

                },
                250
            );

        },
        1600
    );
}


// ============================================================
// MOSTRAR EVOLUÇÃO
// ============================================================

function mostrarEvolucao() {

    const antigo =
        document.getElementById(
            "overlay-evolucao"
        );

    if (antigo) {
        antigo.remove();
    }

    // --------------------------------------------------------
    // CSS
    // --------------------------------------------------------

    if (
        !document.getElementById(
            "css-evolucao"
        )
    ) {

        const style =
            document.createElement(
                "style"
            );

        style.id =
            "css-evolucao";

        style.textContent = `

            @keyframes evolucaoEntrada {

                0% {
                    opacity: 0;

                    transform:
                        translate(-50%, -50%)
                        scale(0.5);
                }

                70% {
                    opacity: 1;

                    transform:
                        translate(-50%, -50%)
                        scale(1.08);
                }

                100% {
                    opacity: 1;

                    transform:
                        translate(-50%, -50%)
                        scale(1);
                }
            }

            @keyframes evolucaoBrilho {

                0% {
                    text-shadow:
                        0 0 10px
                        rgba(255,0,68,0.3);
                }

                50% {
                    text-shadow:
                        0 0 40px
                        rgba(255,0,68,1);
                }

                100% {
                    text-shadow:
                        0 0 10px
                        rgba(255,0,68,0.3);
                }
            }

        `;

        document.head.appendChild(
            style
        );
    }

    // --------------------------------------------------------
    // OVERLAY
    // --------------------------------------------------------

    const overlay =
        document.createElement(
            "div"
        );

    overlay.id =
        "overlay-evolucao";

    overlay.style.cssText = `
        position: fixed;

        left: 50%;
        top: 45%;

        transform:
            translate(-50%, -50%);

        z-index:
            100001;

        pointer-events:
            none;

        text-align:
            center;

        font-family:
            Arial, sans-serif;

        animation:
            evolucaoEntrada
            0.45s ease-out
            forwards;
    `;

    overlay.innerHTML = `

        <div style="
            font-size: 4.2rem;

            font-weight: 900;

            color: #ff174f;

            animation:
                evolucaoBrilho
                0.7s
                ease-in-out
                infinite;
        ">
            EVOLUÇÃO!
        </div>

        <div style="
            margin-top: 8px;

            font-size: 1.4rem;

            color: white;

            text-shadow:
                0 0 15px
                rgba(255,255,255,0.5);
        ">
            Nível ${nivelAsas}
        </div>

    `;

    document.body.appendChild(
        overlay
    );

    // --------------------------------------------------------
    // REMOVE DEPOIS
    // --------------------------------------------------------

    setTimeout(
        () => {

            overlay.style.opacity =
                "0";

            overlay.style.transition =
                "opacity 0.4s ease";

            setTimeout(
                () => {

                    overlay.remove();

                },
                450
            );

        },
        1800
    );
}


// ============================================================
// CONTROLES DE MOVIMENTO
// ============================================================

const teclas = {};


// ============================================================
// VELOCIDADE ATUAL
// ============================================================

const velocidadeAtual =
    new THREE.Vector3();


// ============================================================
// DIREÇÃO TEMPORÁRIA
// ============================================================

const direcaoMovimento =
    new THREE.Vector3();


// ============================================================
// TECLADO — KEYDOWN
// ============================================================

document.addEventListener(
    "keydown",
    event => {

        teclas[
            event.key.toLowerCase()
        ] = true;

        // ----------------------------------------------------
        // SPRINT
        // ----------------------------------------------------

        if (
            event.key === "Shift"
        ) {

            sprintAtivo = true;

        }

        // ----------------------------------------------------
        // EVITAR SCROLL
        // ----------------------------------------------------

        if (
            [
                "w",
                "a",
                "s",
                "d",
                "arrowup",
                "arrowdown",
                "arrowleft",
                "arrowright",
                " "
            ].includes(
                event.key.toLowerCase()
            )
        ) {

            event.preventDefault();

        }

    },
    {
        passive: false
    }
);


// ============================================================
// TECLADO — KEYUP
// ============================================================

document.addEventListener(
    "keyup",
    event => {

        teclas[
            event.key.toLowerCase()
        ] = false;

        if (
            event.key === "Shift"
        ) {

            sprintAtivo = false;

        }

    }
);


// ============================================================
// 🦟 MOVIMENTO 3D DO MOSQUITO
// ============================================================

function atualizarMovimento(
    delta
) {

    if (
        !jogoIniciado ||
        jogoPausado
    ) {

        velocidadeAtual.multiplyScalar(
            0
        );

        return;

    }


    // ========================================================
    // DIREÇÃO DO MOVIMENTO
    // ========================================================

    direcaoMovimento.set(
        0,
        0,
        0
    );


    // --------------------------------------------------------
    // FRENTE / TRÁS
    // --------------------------------------------------------

    if (
        teclas["w"] ||
        teclas["arrowup"]
    ) {

        direcaoMovimento.z -= 1;

    }


    if (
        teclas["s"] ||
        teclas["arrowdown"]
    ) {

        direcaoMovimento.z += 1;

    }


    // --------------------------------------------------------
    // ESQUERDA / DIREITA
    // --------------------------------------------------------

    if (
        teclas["a"] ||
        teclas["arrowleft"]
    ) {

        direcaoMovimento.x -= 1;

    }


    if (
        teclas["d"] ||
        teclas["arrowright"]
    ) {

        direcaoMovimento.x += 1;

    }


    // ========================================================
    // NORMALIZAR
    // ========================================================

    if (
        direcaoMovimento.lengthSq() > 0
    ) {

        direcaoMovimento.normalize();

    }


    // ========================================================
    // DIREÇÃO 3D BASEADA NO MOUSE
    // ========================================================

    const direcaoFrente =
        new THREE.Vector3(
            0,
            0,
            -1
        );


    // --------------------------------------------------------
    // APLICA HORIZONTAL + VERTICAL DO MOUSE
    // --------------------------------------------------------

    direcaoFrente.applyEuler(
        new THREE.Euler(
            anguloRotacaoX,
            anguloRotacaoY,
            0,
            "YXZ"
        )
    );


    // --------------------------------------------------------
    // DIREÇÃO LATERAL
    // --------------------------------------------------------

    const direcaoDireita =
        new THREE.Vector3(
            1,
            0,
            0
        );


    direcaoDireita.applyAxisAngle(
        new THREE.Vector3(
            0,
            1,
            0
        ),
        anguloRotacaoY
    );


    // ========================================================
    // MONTAR MOVIMENTO
    // ========================================================

    const movimento3D =
        new THREE.Vector3();


    // --------------------------------------------------------
    // FRENTE / TRÁS
    // --------------------------------------------------------

    if (
        direcaoMovimento.z < 0
    ) {

        movimento3D.add(
            direcaoFrente
        );

    }

    else if (
        direcaoMovimento.z > 0
    ) {

        movimento3D.sub(
            direcaoFrente
        );

    }


    // --------------------------------------------------------
    // LATERAL
    // --------------------------------------------------------

    if (
        direcaoMovimento.x > 0
    ) {

        movimento3D.add(
            direcaoDireita
        );

    }

    else if (
        direcaoMovimento.x < 0
    ) {

        movimento3D.sub(
            direcaoDireita
        );

    }


    // ========================================================
    // NORMALIZAR MOVIMENTO 3D
    // ========================================================

    if (
        movimento3D.lengthSq() > 0
    ) {

        movimento3D.normalize();

    }


    // ========================================================
    // VELOCIDADE
    // ========================================================

    const velocidadeDesejada =
        velocidadeMaxima *
        (
            sprintAtivo
                ? multiplicadorSprint
                : 1
        );


    const velocidadeAlvo =
        movimento3D.clone()
        .multiplyScalar(
            velocidadeDesejada
        );


    // ========================================================
    // ACELERAÇÃO
    // ========================================================

    const fatorAceleracao =
        Math.min(
            1,
            (
                sprintAtivo
                    ? aceleracaoSprint
                    : aceleracao
            ) * delta
        );


    velocidadeAtual.lerp(
        velocidadeAlvo,
        fatorAceleracao
    );


    // ========================================================
    // DESACELERAÇÃO
    // ========================================================

    if (
        movimento3D.lengthSq() === 0
    ) {

        const fatorDesaceleracao =
            Math.max(
                0,
                1 -
                desaceleracao *
                delta
            );


        velocidadeAtual.multiplyScalar(
            fatorDesaceleracao
        );

    }


    // ========================================================
    // APLICAR MOVIMENTO
    // ========================================================

    mosquitoGrupo.position.addScaledVector(
        velocidadeAtual,
        delta
    );


    // ========================================================
    // LIMITES DO MUNDO
    // ========================================================

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
// 🖱️ MOUSE / CÂMERA
// ============================================================

let mouseBloqueado = false;

let sensibilidadeMouse =
    0.0025;


// ============================================================
// ÂNGULOS DA CÂMERA
// ============================================================

let anguloRotacaoY = 0;

let anguloRotacaoX = 0;


// ============================================================
// ATIVAR POINTER LOCK
// ============================================================

function ativarMouse() {

    if (
        !jogoIniciado ||
        jogoPausado
    ) {

        return;

    }

    if (
        document.pointerLockElement !==
        renderizador.domElement
    ) {

        renderizador.domElement
            .requestPointerLock();

    }

}


// ============================================================
// CLIQUE NO JOGO
// ============================================================

renderizador.domElement.addEventListener(
    "click",
    () => {

        ativarMouse();

    }
);


// ============================================================
// MOVIMENTO DO MOUSE
// ============================================================

document.addEventListener(
    "mousemove",
    (event) => {

        if (
            document.pointerLockElement !==
            renderizador.domElement
        ) {

            return;

        }

        if (
            !jogoIniciado ||
            jogoPausado
        ) {

            return;

        }


        // ----------------------------------------------------
        // HORIZONTAL
        // ----------------------------------------------------

        anguloRotacaoY -=
            event.movementX *
            sensibilidadeMouse;


        // ----------------------------------------------------
        // VERTICAL
        // ----------------------------------------------------

        anguloRotacaoX -=
            event.movementY *
            sensibilidadeMouse;


        // ----------------------------------------------------
        // LIMITAR OLHAR PARA CIMA/BAIXO
        // ----------------------------------------------------

        anguloRotacaoX =
            THREE.MathUtils.clamp(

                anguloRotacaoX,

                -1.2,

                1.2

            );

    }
);


// ============================================================
// POINTER LOCK
// ============================================================

document.addEventListener(
    "pointerlockchange",
    () => {

        mouseBloqueado =
            document.pointerLockElement ===
            renderizador.domElement;


        if (
            mouseBloqueado
        ) {

            console.log(
                "🖱️ Mouse ativado"
            );

        } else {

            console.log(
                "🖱️ Mouse liberado"
            );

            sprintAtivo =
                false;

        }

    }
);


// ============================================================
// ERRO DO POINTER LOCK
// ============================================================

document.addEventListener(
    "pointerlockerror",
    () => {

        console.warn(
            "⚠️ Não foi possível ativar o controle do mouse."
        );

    }
);

// ============================================================
// ESC — PAUSAR
// ============================================================

window.addEventListener(
    "keydown",
    (e) => {

        const tecla =
            e.key.toLowerCase();

        // ====================================================
        // ESC — PAUSAR
        // ====================================================

        if (
            tecla === "escape" &&
            jogoIniciado
        ) {

            e.preventDefault();

            alternarPausa();

        }

    }
);


// ============================================================
// PAUSA
// ============================================================

let overlayPausa = null;


function alternarPausa() {

    if (!jogoIniciado) {
        return;
    }

    jogoPausado =
        !jogoPausado;

    if (jogoPausado) {

        sprintAtivo = false;

        velocidadeAtual.set(
            0,
            0,
            0
        );

        mostrarPausa();

        if (
            document.pointerLockElement
        ) {

            document.exitPointerLock();

        }

    } else {

        esconderPausa();

    }

}


// ============================================================
// MOSTRAR PAUSA
// ============================================================

function mostrarPausa() {

    if (overlayPausa) {
        return;
    }

    overlayPausa =
        document.createElement(
            "div"
        );

    overlayPausa.id =
        "overlay-pausa";

    overlayPausa.style.cssText = `
        position: fixed;

        inset: 0;

        width: 100vw;
        height: 100vh;

        display: flex;

        align-items: center;
        justify-content: center;

        flex-direction: column;

        background:
            rgba(0, 0, 0, 0.72);

        backdrop-filter:
            blur(8px);

        z-index: 99998;

        color: white;

        font-family:
            Arial, sans-serif;

        text-align: center;
    `;

    overlayPausa.innerHTML = `

        <div style="
            font-size: 4rem;
            font-weight: 900;

            color: #ff174f;

            text-shadow:
                0 0 25px
                rgba(255,0,68,0.7);

            margin-bottom: 12px;
        ">
            PAUSADO
        </div>

        <div style="
            color: #aaa;
            font-size: 1.1rem;
        ">
            Pressione ESC para continuar
        </div>

    `;

    document.body.appendChild(
        overlayPausa
    );
}


// ============================================================
// ESCONDER PAUSA
// ============================================================

function esconderPausa() {

    if (!overlayPausa) {
        return;
    }

    overlayPausa.remove();

    overlayPausa = null;

}


// ============================================================
// INICIAR JOGO
// ============================================================

// ============================================================
// 🎮 INICIAR JOGO
// ============================================================

btnJogar.addEventListener(
    "click",
    () => {

        jogoIniciado =
            true;

        jogoPausado =
            false;


        menuInicial.style.display =
            "none";


        atualizarTela();


        // ----------------------------------------------------
        // ATIVA O MOUSE
        // ----------------------------------------------------

        renderizador.domElement
            .requestPointerLock();


        mostrarMensagem(
            "🦟 Boa caça!"
        );

    }
);


// ============================================================
// 🪽 ANIMAÇÃO DAS ASAS
// ============================================================

let tempoAsas = 0;

function animarAsas(
    delta
) {

    tempoAsas +=
        delta;

    if (
        !asaE ||
        !asaD
    ) {

        return;

    }

    const velocidadeAsas =
        28 +
        nivelAsas * 2;

    const movimento =
        Math.sin(
            tempoAsas *
            velocidadeAsas
        );

    const abertura =
        0.25 +
        Math.abs(
            movimento
        ) * 0.35;

    asaE.rotation.y =
        abertura;

    asaD.rotation.y =
        -abertura;

    asaE.rotation.z =
        0.08 +
        movimento *
        0.025;

    asaD.rotation.z =
        -0.08 -
        movimento *
        0.025;

}

// ============================================================
// 🫀 MOVIMENTO NATURAL DO ABDÔMEN
// ============================================================

let tempoCorpo = 0;

function animarCorpo(
    delta
) {

    tempoCorpo +=
        delta;

    const respiracao =
        1 +
        Math.sin(
            tempoCorpo * 4
        ) *
        0.018;

    abdomenGrupo.scale.y =
        respiracao;

}


// ============================================================
// 🦟 ROTAÇÃO DO MOSQUITO
// ============================================================

function atualizarRotacaoMosquito(
    delta
) {

    // ========================================================
    // ROTAÇÃO HORIZONTAL
    // ========================================================

    const rotacaoY =
        anguloRotacaoY;


    mosquitoGrupo.rotation.y =
        THREE.MathUtils.lerp(
            mosquitoGrupo.rotation.y,
            rotacaoY,
            Math.min(
                1,
                delta * 10
            )
        );


    // ========================================================
    // ROTAÇÃO VERTICAL
    // ========================================================

    const rotacaoX =
        anguloRotacaoX;


    mosquitoGrupo.rotation.x =
        THREE.MathUtils.lerp(
            mosquitoGrupo.rotation.x,
            rotacaoX,
            Math.min(
                1,
                delta * 8
            )
        );

}


// ============================================================
// 🎥 CÂMERA DE TERCEIRA PESSOA
// ============================================================

function atualizarCamera(
    delta
) {

    // ========================================================
    // DISTÂNCIA
    // ========================================================

    const distanciaCamera =
        3.8;


    const alturaCamera =
        0.8;


    // ========================================================
    // OFFSET
    // ========================================================

    const offsetCamera =
        new THREE.Vector3(
            0,
            alturaCamera,
            distanciaCamera
        );


    // ========================================================
    // ROTAÇÃO DA VISÃO
    // ========================================================

    offsetCamera.applyEuler(
        new THREE.Euler(
            anguloRotacaoX * 0.75,
            anguloRotacaoY,
            0,
            "YXZ"
        )
    );


    // ========================================================
    // POSIÇÃO DA CÂMERA
    // ========================================================

    const posicaoDesejada =
        mosquitoGrupo.position
            .clone()
            .add(
                offsetCamera
            );


    camera.position.lerp(
        posicaoDesejada,
        Math.min(
            1,
            delta * 8
        )
    );


    // ========================================================
    // PONTO PARA ONDE A CÂMERA OLHA
    // ========================================================

    const alvo =
        mosquitoGrupo.position
            .clone();


    // A câmera olha para frente
    // na mesma direção do mouse.

    const direcaoOlhar =
        new THREE.Vector3(
            0,
            0,
            -1
        );


    direcaoOlhar.applyEuler(
        new THREE.Euler(
            anguloRotacaoX * 0.75,
            anguloRotacaoY,
            0,
            "YXZ"
        )
    );


    alvo.add(
        direcaoOlhar.multiplyScalar(
            8
        )
    );


    alvo.y +=
        0.15;


    camera.lookAt(
        alvo
    );

}


// ============================================================
// 🩸 COLETA DE SANGUE
// ============================================================

function coletarSangue(
    fonte
) {

    sangue +=
        poderColeta;

    criarParticulas(
        fonte.position
    );

    // ============================================
    // REAPARECER A FONTE DE SANGUE
    // ============================================

    fonte.position.set(

        (Math.random() - 0.5) *
            TAMANHO_MUNDO * 2,

        -2 +
            Math.random() * 10,

        (Math.random() - 0.5) *
            TAMANHO_MUNDO * 2
    );

    fonte.userData.offset =
        Math.random() *
        Math.PI * 2;

    fonte.userData.velocidade =
        1 +
        Math.random();

    atualizarTela();

    mostrarMensagem(
        `🩸 +${poderColeta} sangue`
    );
}


// ============================================================
// CLIQUE PARA COLETAR
// ============================================================

renderizador.domElement.addEventListener(
    "mousedown",
    (event) => {

        if (
            !jogoIniciado ||
            jogoPausado
        ) {

            return;

        }

        if (
            event.button === 0
        ) {

            coletarSangue();

        }

    }
);


// ============================================================
// SISTEMA DE VOO
// ============================================================

function atualizarLimitesAltura() {

    if (
        mosquitoGrupo.position.y <
        ALTURA_MINIMA
    ) {

        mosquitoGrupo.position.y =
            ALTURA_MINIMA;

    }

    if (
        mosquitoGrupo.position.y >
        ALTURA_MAXIMA
    ) {

        mosquitoGrupo.position.y =
            ALTURA_MAXIMA;

    }

}


// ============================================================
// MOVIMENTO VERTICAL
// ============================================================

function atualizarMovimentoVertical(
    delta
) {

    if (
        !jogoIniciado ||
        jogoPausado
    ) {

        return;

    }

    let movimentoVertical =
        0;

    // --------------------------------------------------------
    // ESPAÇO / Q — SUBIR
    // --------------------------------------------------------

    if (
        teclas[" "] ||
        teclas["q"]
    ) {

        movimentoVertical +=
            1;

    }

    // --------------------------------------------------------
    // CTRL / Z — DESCER
    // --------------------------------------------------------

    if (
        teclas["control"] ||
        teclas["z"]
    ) {

        movimentoVertical -=
            1;

    }

    if (
        movimentoVertical !== 0
    ) {

        const velocidadeVertical =
            velocidadeMaxima *
            (
                sprintAtivo
                    ? multiplicadorSprint
                    : 1
            );

        mosquitoGrupo.position.y +=
            movimentoVertical *
            velocidadeVertical *
            delta;

    }

    atualizarLimitesAltura();

}


// ============================================================
// ⚡ EFEITO DE VELOCIDADE
// ============================================================

let velocidadeVisual = 0;

function atualizarEfeitoVelocidade(
    delta
) {

    const velocidadeAtualValor =
        velocidadeAtual.length();

    velocidadeVisual =
        THREE.MathUtils.lerp(
            velocidadeVisual,
            velocidadeAtualValor,
            Math.min(
                1,
                delta * 6
            )
        );

    // --------------------------------------------------------
    // INCLINAÇÃO DURANTE SPRINT
    // --------------------------------------------------------

    if (
        sprintAtivo &&
        velocidadeVisual > 0.2
    ) {

        const inclinacao =
            -0.12;

        mosquitoGrupo.rotation.z =
            THREE.MathUtils.lerp(
                mosquitoGrupo.rotation.z,
                inclinacao,
                Math.min(
                    1,
                    delta * 5
                )
            );

    } else {

        mosquitoGrupo.rotation.z =
            THREE.MathUtils.lerp(
                mosquitoGrupo.rotation.z,
                0,
                Math.min(
                    1,
                    delta * 5
                )
            );

    }

}


// ============================================================
// 🩸 SISTEMA DE PARTÍCULAS DE SANGUE
// ============================================================

const particulasSangue = [];


function criarParticulaSangue(
    posicao
) {

    const geometria =
        new THREE.SphereGeometry(
            0.025,
            6,
            6
        );

    const material =
        new THREE.MeshBasicMaterial({
            color: 0xff1744
        });

    const particula =
        new THREE.Mesh(
            geometria,
            material
        );

    particula.position.copy(
        posicao
    );

    particula.userData.velocidade =
        new THREE.Vector3(
            (Math.random() - 0.5) * 1.5,
            Math.random() * 1.5,
            (Math.random() - 0.5) * 1.5
        );

    particula.userData.tempo =
        0;

    cena.add(
        particula
    );

    particulasSangue.push(
        particula
    );

}


// ============================================================
// ATUALIZAR PARTÍCULAS
// ============================================================

function atualizarParticulas(
    delta
) {

    for (
        let i =
            particulasSangue.length - 1;

        i >= 0;

        i--
    ) {

        const particula =
            particulasSangue[i];

        particula.userData.tempo +=
            delta;

        particula.position
            .addScaledVector(
                particula.userData.velocidade,
                delta
            );

        particula.userData.velocidade.y -=
            2.5 *
            delta;

        particula.scale.multiplyScalar(
            0.98
        );

        if (
            particula.userData.tempo >
            0.8
        ) {

            cena.remove(
                particula
            );

            particula.geometry.dispose();

            particula.material.dispose();

            particulasSangue.splice(
                i,
                1
            );

        }

    }

}


// ============================================================
// ✨ EFEITO VISUAL DA COLETA
// ============================================================

function criarEfeitoColeta() {

    const posicao =
        mosquitoGrupo.position
            .clone();

    posicao.y -=
        0.15;

    for (
        let i = 0;
        i < 5;
        i++
    ) {

        criarParticulaSangue(
            posicao
        );

    }

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

        renderizador.setPixelRatio(
            Math.min(
                window.devicePixelRatio,
                2
            )
        );

    }
);


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


    // ========================================================
    // CÂMERA
    // ========================================================

    atualizarCamera(
        delta
    );

    // ========================================================
    // RENDER
    // ========================================================

    renderizador.render(
        cena,
        camera
    );

}

// ============================================================
// 🩸 FONTES DE SANGUE
// ============================================================

const fontesSangue = [];


// ============================================================
// CRIAR FONTE DE SANGUE
// ============================================================

function criarFonteSangue(
    x,
    y,
    z,
    quantidade = 1
) {

    const grupo =
        new THREE.Group();

    grupo.position.set(
        x,
        y,
        z
    );

    // --------------------------------------------------------
    // BOLHA PRINCIPAL
    // --------------------------------------------------------

    const materialBolha =
        new THREE.MeshStandardMaterial({

            color: 0xff1744,

            emissive: 0x550010,

            emissiveIntensity: 1.5,

            transparent: true,

            opacity: 0.82,

            roughness: 0.18,

            metalness: 0.05

        });

    const bolha =
        new THREE.Mesh(

            new THREE.SphereGeometry(
                0.18,
                16,
                12
            ),

            materialBolha
        );

    grupo.add(
        bolha
    );

    // --------------------------------------------------------
    // PEQUENAS BOLHAS
    // --------------------------------------------------------

    const bolhasPequenas = [];

    for (
        let i = 0;
        i < 4;
        i++
    ) {

        const bolhaPequena =
            new THREE.Mesh(

                new THREE.SphereGeometry(
                    0.035 +
                    Math.random() * 0.025,
                    8,
                    8
                ),

                materialBolha.clone()
            );

        bolhaPequena.position.set(

            (Math.random() - 0.5) *
                0.55,

            Math.random() *
                0.55,

            (Math.random() - 0.5) *
                0.55

        );

        grupo.add(
            bolhaPequena
        );

        bolhasPequenas.push(
            bolhaPequena
        );
    }

    // --------------------------------------------------------
    // AURA DA FONTE
    // --------------------------------------------------------

    const auraFonteMaterial =
        new THREE.MeshBasicMaterial({

            color: 0xff1744,

            transparent: true,

            opacity: 0.12,

            side:
                THREE.DoubleSide

        });

    const auraFonte =
        new THREE.Mesh(

            new THREE.SphereGeometry(
                0.38,
                16,
                12
            ),

            auraFonteMaterial
        );

    grupo.add(
        auraFonte
    );

    // --------------------------------------------------------
    // DADOS
    // --------------------------------------------------------

    grupo.userData.quantidade =
        quantidade;

    grupo.userData.tempo =
        Math.random() *
        Math.PI * 2;

    grupo.userData.coletado =
        false;

    grupo.userData.bolhas =
        bolhasPequenas;

    grupo.userData.aura =
        auraFonte;

    grupo.userData.bolhaPrincipal =
        bolha;

    cena.add(
        grupo
    );

    fontesSangue.push(
        grupo
    );

    return grupo;
}


// ============================================================
// GERAR FONTES DE SANGUE NO MAPA
// ============================================================

function gerarFontesSangue() {

    // --------------------------------------------------------
    // LIMPA FONTES ANTIGAS
    // --------------------------------------------------------

    for (
        const fonte
        of fontesSangue
    ) {

        cena.remove(
            fonte
        );

    }

    fontesSangue.length =
        0;

    // --------------------------------------------------------
    // POSIÇÕES
    // --------------------------------------------------------

    const posicoes = [

        [-8, -3.7, -8],

        [7, -3.7, -7],

        [-12, -3.2, 4],

        [11, -2.8, 5],

        [-4, -1.5, 11],

        [4, -2.0, 13],

        [-15, -1.0, -1],

        [15, -0.5, -3],

        [0, 1.5, -14],

        [0, 3.5, 14],

        [-10, 2.5, 10],

        [10, 4, 10]

    ];

    for (
        const posicao
        of posicoes
    ) {

        criarFonteSangue(

            posicao[0],

            posicao[1],

            posicao[2],

            1

        );

    }

}


// ============================================================
// ANIMAR FONTES DE SANGUE
// ============================================================

function animarFontesSangue(
    delta
) {

    const tempo =
        performance.now() *
        0.002;

    for (
        const fonte
        of fontesSangue
    ) {

        if (
            fonte.userData.coletado
        ) {

            continue;

        }

        fonte.userData.tempo +=
            delta;

        // ----------------------------------------------------
        // FLUTUAÇÃO
        // ----------------------------------------------------

        const flutuacao =
            Math.sin(
                tempo * 2 +
                fonte.userData.tempo
            ) *
            0.08;

        fonte.userData.bolhaPrincipal
            .position.y =
            flutuacao;

        // ----------------------------------------------------
        // ROTAÇÃO
        // ----------------------------------------------------

        fonte.rotation.y +=
            delta * 0.8;

        // ----------------------------------------------------
        // BOLHAS MENORES
        // ----------------------------------------------------

        const bolhas =
            fonte.userData.bolhas;

        for (
            let i = 0;
            i < bolhas.length;
            i++
        ) {

            const bolha =
                bolhas[i];

            bolha.position.y +=
                delta *
                (
                    0.12 +
                    i * 0.025
                );

            if (
                bolha.position.y >
                0.55
            ) {

                bolha.position.y =
                    0;

            }

        }

        // ----------------------------------------------------
        // PULSAÇÃO DA AURA
        // ----------------------------------------------------

        const escalaAura =
            1 +
            Math.sin(
                tempo * 3 +
                fonte.userData.tempo
            ) *
            0.12;

        fonte.userData.aura
            .scale.setScalar(
                escalaAura
            );

    }

}


// ============================================================
// COLETAR FONTE DE SANGUE
// ============================================================

function coletarFonteSangue(
    fonte
) {

    if (
        fonte.userData.coletado
    ) {

        return;

    }

    fonte.userData.coletado =
        true;

    const quantidade =
        fonte.userData.quantidade;

    // --------------------------------------------------------
    // SANGUE
    // --------------------------------------------------------

    sangue +=
        quantidade *
        poderColeta;

    // --------------------------------------------------------
    // EFEITO
    // --------------------------------------------------------

    const posicao =
        fonte.position
            .clone();

    for (
        let i = 0;
        i < 12;
        i++
    ) {

        criarParticulaSangue(
            posicao
        );

    }

    // --------------------------------------------------------
    // REMOVE
    // --------------------------------------------------------

    cena.remove(
        fonte
    );

    // --------------------------------------------------------
    // HUD
    // --------------------------------------------------------

    atualizarTela();

    mostrarMensagem(
        `🩸 +${quantidade * poderColeta} sangue`
    );

}


// ============================================================
// DETECTAR FONTES PRÓXIMAS
// ============================================================

function verificarColetaSangue() {

    if (
        !jogoIniciado ||
        jogoPausado
    ) {

        return;

    }

    for (
        const fonte
        of fontesSangue
    ) {

        if (
            fonte.userData.coletado
        ) {

            continue;

        }

        const distancia =
            mosquitoGrupo.position
                .distanceTo(
                    fonte.position
                );

        // ----------------------------------------------------
        // RAIO DE COLETA
        // ----------------------------------------------------

        if (
            distancia < 0.65
        ) {

            coletarFonteSangue(
                fonte
            );

        }

    }

}


// ============================================================
// 🦟 EVOLUÇÃO VISUAL DO MOSQUITO
// ============================================================

function atualizarEvolucaoMosquito() {

    // --------------------------------------------------------
    // ESCALA GERAL
    // --------------------------------------------------------

    const crescimento =
        1 +
        Math.min(
            nivelAsas - 1,
            15
        ) *
        0.055;

    mosquitoGrupo.scale.setScalar(
        crescimento
    );

    // --------------------------------------------------------
    // TAMANHO DAS ASAS
    // --------------------------------------------------------

    const escalaAsa =
        1 +
        Math.min(
            nivelAsas - 1,
            15
        ) *
        0.075;

    if (asaE) {

        asaE.scale.set(
            escalaAsa,
            escalaAsa,
            escalaAsa
        );

    }

    if (asaD) {

        asaD.scale.set(
            -escalaAsa,
            escalaAsa,
            escalaAsa
        );

    }

    // --------------------------------------------------------
    // VELOCIDADE DAS ASAS
    // --------------------------------------------------------

    // A animação das asas usa o nível
    // automaticamente.

    // --------------------------------------------------------
    // COR DO ABDÔMEN
    // --------------------------------------------------------

    if (
        nivelAsas >= 10
    ) {

        matAbdomen.color.setHex(
            0x5b241f
        );

    } else if (
        nivelAsas >= 7
    ) {

        matAbdomen.color.setHex(
            0x432035
        );

    } else if (
        nivelAsas >= 4
    ) {

        matAbdomen.color.setHex(
            0x3b2035
        );

    } else {

        matAbdomen.color.setHex(
            0x3b2025
        );

    }

    // --------------------------------------------------------
    // AURA
    // --------------------------------------------------------

    criarAuraMosquito();

    atualizarEfeitosEvolucao();

}


// ============================================================
// ✨ BRILHO DE EVOLUÇÃO
// ============================================================

let tempoBrilhoEvolucao =
    0;

let brilhoEvolucaoAtivo =
    false;


function iniciarBrilhoEvolucao() {

    brilhoEvolucaoAtivo =
        true;

    tempoBrilhoEvolucao =
        0;

    // --------------------------------------------------------
    // LUZ
    // --------------------------------------------------------

    if (!luzEvolucao) {

        luzEvolucao =
            new THREE.PointLight(
                0xff1744,
                0,
                8
            );

        cena.add(
            luzEvolucao
        );

    }

    luzEvolucao.position.copy(
        mosquitoGrupo.position
    );

    luzEvolucao.intensity =
        6;

}


// ============================================================
// ANIMAR BRILHO DE EVOLUÇÃO
// ============================================================

function animarBrilhoEvolucao(
    delta
) {

    if (
        !brilhoEvolucaoAtivo
    ) {

        return;

    }

    tempoBrilhoEvolucao +=
        delta;

    if (
        luzEvolucao
    ) {

        luzEvolucao.position.copy(
            mosquitoGrupo.position
        );

        luzEvolucao.intensity =
            Math.max(
                0,
                6 *
                (
                    1 -
                    tempoBrilhoEvolucao /
                    1.2
                )
            );

    }

    // --------------------------------------------------------
    // TERMINOU
    // --------------------------------------------------------

    if (
        tempoBrilhoEvolucao >=
        1.2
    ) {

        brilhoEvolucaoAtivo =
            false;

        if (
            luzEvolucao
        ) {

            luzEvolucao.intensity =
                0;

        }

    }

}


// ============================================================
// ADICIONAR ANIMAÇÕES EXTRAS AO LOOP
// ============================================================

const animarOriginal =
    animar;


// ============================================================
// SUBSTITUIR LOOP POR VERSÃO COMPLETA
// ============================================================

function animarCompleto() {

    requestAnimationFrame(
        animarCompleto
    );

    const delta =
        Math.min(
            relogio.getDelta(),
            0.05
        );

    // ========================================================
    // ANIMAÇÕES
    // ========================================================

    animarAsas(
        delta
    );

    animarPernas(
        delta
    );

    animarCorpo(
        delta
    );

    animarAura(
        delta
    );

    animarFontesSangue(
        delta
    );

    animarBrilhoEvolucao(
        delta
    );

    atualizarParticulas(
        delta
    );

    // ========================================================
    // MOVIMENTO
    // ========================================================

    atualizarMovimento(
        delta
    );

    atualizarMovimentoVertical(
        delta
    );

    atualizarRotacaoMosquito(
        delta
    );

    atualizarEfeitoVelocidade(
        delta
    );

    atualizarLimitesAltura();

    // ========================================================
    // COLETA
    // ========================================================

    verificarColetaSangue();

    // ========================================================
    // CÂMERA
    // ========================================================

    atualizarCamera(
        delta
    );

    // ========================================================
    // RENDER
    // ========================================================

    renderizador.render(
        cena,
        camera
    );

}


// ============================================================
// POSIÇÃO INICIAL DO MOSQUITO
// ============================================================

mosquitoGrupo.position.set(
    0,
    2,
    5
);


// ============================================================
// ADICIONAR MOSQUITO À CENA
// ============================================================

cena.add(
    mosquitoGrupo
);


// ============================================================
// CRIAR FONTES DE SANGUE
// ============================================================

gerarFontesSangue();


// ============================================================
// ATUALIZAR VISUAL INICIAL
// ============================================================

atualizarEvolucaoMosquito();

atualizarEfeitosEvolucao();

atualizarTela();


// ============================================================
// PERDE FOCO — RESETAR CONTROLES
// ============================================================

window.addEventListener(
    "blur",
    () => {

        sprintAtivo =
            false;

        for (
            const tecla
            in teclas
        ) {

            teclas[tecla] =
                false;

        }

        velocidadeAtual.set(
            0,
            0,
            0
        );

    }
);

// ============================================================
// COMEÇAR LOOP FINAL
// ============================================================

animarCompleto();


// ============================================================
// FIM
// ============================================================