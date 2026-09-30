let sangue = 0;
let poderColeta = 1;
let nivelAsas = 1;
let custoUpgrade = 10;
let velocidadeVoo = 0.1;
let jogoIniciado = false;

const txtSangue = document.getElementById("contador-sangue");
const txtPoder = document.getElementById("poder-clique");
const txtNivelAsas = document.getElementById("nivel-asas");
const txtCusto = document.getElementById("custo-upgrade");
const btnEvoluir = document.getElementById("btn-evoluir");
const container3D = document.getElementById("webgl-container");

function atualizarTela() {
    txtSangue.innerText = sangue;
    txtPoder.innerText = poderColeta;
    txtNivelAsas.innerText = nivelAsas;
    txtCusto.innerText = custoUpgrade;
}

// --- MENU INICIAL ---
const menuInicial = document.createElement("div");
menuInicial.id = "menu-inicial";
menuInicial.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
    background: rgba(10, 10, 22, 0.95); display: flex; flex-direction: column;
    justify-content: center; align-items: center; z-index: 99999; color: white;
    font-family: sans-serif; text-align: center;
`;
menuInicial.innerHTML = `
    <h1 style="font-size: 3rem; color: #ff0044; margin-bottom: 10px;">Mosquito 3D Simulator</h1>
    <p style="margin-bottom: 25px; color: #aaa; font-size: 1.1rem;">Explore o mundo aberto, colete sangue e evolua!</p>
    <p style="margin-bottom: 25px; color: #66ff99; font-size: 0.9rem;">Controles: Mouse para olhar | W / S para voar | ESC para pausar</p>
    <button id="btn-jogar" style="padding: 15px 40px; font-size: 1.3rem; background: #ff0044; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; box-shadow: 0 4px 15px rgba(255,0,68,0.4);">JOGAR</button>
`;
document.body.appendChild(menuInicial);

const btnJogar = document.getElementById("btn-jogar");

// --- MUNDO ABERTO 3D ---
const cena = new THREE.Scene();
cena.background = new THREE.Color(0x0a0a16);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderizador = new THREE.WebGLRenderer({ antialias: true });
renderizador.setSize(window.innerWidth, window.innerHeight);
container3D.appendChild(renderizador.domElement);

// Iluminação
cena.add(new THREE.AmbientLight(0xffffff, 0.8));
const luz = new THREE.DirectionalLight(0xffffff, 1);
luz.position.set(10, 20, 10);
cena.add(luz);

// Chão do mundo aberto
const chaoGeo = new THREE.PlaneGeometry(60, 60);
const chaoMat = new THREE.MeshStandardMaterial({ color: 0x1b1b2f, roughness: 0.9 });
const chao = new THREE.Mesh(chaoGeo, chaoMat);
chao.rotation.x = -Math.PI / 2;
chao.position.y = -5;
cena.add(chao);

// Alvo de sangue espalhado pelo mapa
const alvoGeo = new THREE.SphereGeometry(0.5, 16, 16);
const alvoMat = new THREE.MeshStandardMaterial({ color: 0xff0044, emissive: 0x66001a });
const fonteSangue = new THREE.Mesh(alvoGeo, alvoMat);
fonteSangue.position.set(5, 2, -5);
cena.add(fonteSangue);

// --- CONSTRUINDO O MODELO 3D DO MOSQUITO ---
const mosquitoGrupo = new THREE.Group();

const matCorpo = new THREE.MeshStandardMaterial({ color: 0x2b2b2b, roughness: 0.5 });
const matabdomen = new THREE.MeshStandardMaterial({ color: 0x3d2323, roughness: 0.6 });
const matOlhos = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.1 });
const matBico = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
const matAsa = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.3, side: THREE.DoubleSide });
const matPernas = new THREE.MeshStandardMaterial({ color: 0x151515 });

// 1. Abdômen
const abdomen = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.9, 8), matabdomen);
abdomen.rotation.x = -Math.PI / 2;
abdomen.position.set(0, 0, -0.45);
mosquitoGrupo.add(abdomen);

// 2. Tórax
const torax = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 10), matCorpo);
torax.scale.set(1, 1.2, 1.3);
torax.position.set(0, 0, 0.05);
mosquitoGrupo.add(torax);

// 3. Cabeça
const cabeca = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), matCorpo);
cabeca.position.set(0, 0.02, -0.18);
mosquitoGrupo.add(cabeca);

// 4. Olhos Compostos
const olhoE = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), matOlhos);
olhoE.position.set(0.07, 0.04, -0.19);
mosquitoGrupo.add(olhoE);

const olhoD = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), matOlhos);
olhoD.position.set(-0.07, 0.04, -0.19);
mosquitoGrupo.add(olhoD);

// 5. Probóscide (Bico apontado para a frente)
const bico = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.002, 0.6, 6), matBico);
bico.rotation.x = -Math.PI / 2.1;
bico.position.set(0, -0.01, -0.52);
mosquitoGrupo.add(bico);

// 6. Asas
const asaE = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.005, 0.2), matAsa);
asaE.position.set(0.3, 0.12, 0.05);
asaE.rotation.y = Math.PI / 12;
mosquitoGrupo.add(asaE);

const asaD = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.005, 0.2), matAsa);
asaD.position.set(-0.3, 0.12, 0.05);
asaD.rotation.y = -Math.PI / 12;
mosquitoGrupo.add(asaD);

// 7. Pernas Finas
function criarPernaLonga(zPos) {
    const pernaGrupo = new THREE.Group();
    const seg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.7, 4), matPernas);
    seg1.rotation.z = Math.PI / 3;
    seg1.position.set(0.2, -0.2, 0);
    pernaGrupo.add(seg1);

    const seg2 = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.003, 0.8, 4), matPernas);
    seg2.rotation.z = -Math.PI / 6;
    seg2.position.set(0.5, -0.5, 0);
    pernaGrupo.add(seg2);

    pernaGrupo.position.set(0, -0.05, zPos);
    return pernaGrupo;
}

const pernaEsq1 = criarPernaLonga(-0.1);
const pernaDir1 = criarPernaLonga(-0.1);
pernaDir1.scale.x = -1;
const pernaEsq2 = criarPernaLonga(0.1);
const pernaDir2 = criarPernaLonga(0.1);
pernaDir2.scale.x = -1;

mosquitoGrupo.add(pernaEsq1);
mosquitoGrupo.add(pernaDir1);
mosquitoGrupo.add(pernaEsq2);
mosquitoGrupo.add(pernaDir2);

cena.add(mosquitoGrupo);

// --- CONTROLES E MOUSE ---
let anguloRotacaoY = 0; 
let anguloRotacaoX = 0; 

const teclas = {};
window.addEventListener("keydown", (e) => teclas[e.key.toLowerCase()] = true);
window.addEventListener("keyup", (e) => teclas[e.key.toLowerCase()] = false);

btnJogar.addEventListener("click", () => {
    container3D.requestPointerLock();
});

document.addEventListener("pointerlockchange", () => {
    if (document.pointerLockElement === container3D) {
        jogoIniciado = true;
        menuInicial.style.display = "none";
    } else {
        jogoIniciado = false;
        menuInicial.style.display = "flex";
    }
});

container3D.addEventListener("mousemove", (e) => {
    if (!jogoIniciado) return;

    let sensibilidade = 0.003;
    anguloRotacaoY += e.movementX * sensibilidade; // Invertido para o lado certo
    anguloRotacaoX -= e.movementY * sensibilidade;

    let limiteVertical = Math.PI / 2.5;
    if (anguloRotacaoX > limiteVertical) anguloRotacaoX = limiteVertical;
    if (anguloRotacaoX < -limiteVertical) anguloRotacaoX = -limiteVertical;
});

let tempo = 0;

function animar() {
    requestAnimationFrame(animar);

    renderizador.render(cena, camera);
    if (!jogoIniciado) return;

    tempo += 0.8;

    asaE.rotation.z = Math.sin(tempo * 8) * 0.5;
    asaD.rotation.z = -Math.sin(tempo * 8) * 0.5;

    // Rotação invertida em 180 graus para que a frente (bico) aponte para onde o mouse olha
    mosquitoGrupo.rotation.y = anguloRotacaoY + Math.PI;
    mosquitoGrupo.rotation.x = anguloRotacaoX * 0.5;

    let direcaoFrenteX = Math.sin(anguloRotacaoY) * Math.cos(anguloRotacaoX);
    let direcaoFrenteY = Math.sin(anguloRotacaoX);
    let direcaoFrenteZ = Math.cos(anguloRotacaoY) * Math.cos(anguloRotacaoX);

    // Tecla W avança na direção certa do bico
    if (teclas['w'] || teclas['arrowup']) {
        mosquitoGrupo.position.x += direcaoFrenteX * velocidadeVoo;
        mosquitoGrupo.position.y += direcaoFrenteY * velocidadeVoo;
        mosquitoGrupo.position.z += direcaoFrenteZ * velocidadeVoo;
    }
    if (teclas['s'] || teclas['arrowdown']) {
        mosquitoGrupo.position.x -= direcaoFrenteX * velocidadeVoo;
        mosquitoGrupo.position.y -= direcaoFrenteY * velocidadeVoo;
        mosquitoGrupo.position.z -= direcaoFrenteZ * velocidadeVoo;
    }

    // --- CÂMERA EM 3ª PESSOA NAS COSTAS (Posicionada atrás do inseto) ---
    let distanciaCamera = 3.0;
    let alturaCamera = 0.8;

    camera.position.x = mosquitoGrupo.position.x - Math.sin(anguloRotacaoY) * Math.cos(anguloRotacaoX) * distanciaCamera;
    camera.position.y = (mosquitoGrupo.position.y + alturaCamera) - Math.sin(anguloRotacaoX) * distanciaCamera;
    camera.position.z = mosquitoGrupo.position.z - Math.cos(anguloRotacaoY) * Math.cos(anguloRotacaoX) * distanciaCamera;

    camera.lookAt(mosquitoGrupo.position.x, mosquitoGrupo.position.y, mosquitoGrupo.position.z);

    // Colisão com o sangue
    let distancia = mosquitoGrupo.position.distanceTo(fonteSangue.position);
    if (distancia < 1.0) {
        sangue += poderColeta;
        atualizarTela();
        
        fonteSangue.position.set(
            (Math.random() - 0.5) * 40,
            (Math.random() - 0.5) * 6,
            (Math.random() - 0.5) * 40
        );
    }
}
animar();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderizador.setSize(window.innerWidth, window.innerHeight);
});

btnEvoluir.addEventListener("click", function() {
    if (sangue >= custoUpgrade) {
        sangue -= custoUpgrade;
        nivelAsas++;
        poderColeta += 1;
        velocidadeVoo += 0.02;
        custoUpgrade = Math.floor(custoUpgrade * 1.5);
        atualizarTela();
    } else {
        alert("Sangue insuficiente! Explore o mapa para coletar mais.");
    }
});

atualizarTela();