/* =========================================================
   GHYDAWAY
   EPISÓDIO 01 — O CAMINHO PARA YALHES
========================================================= */


/* =========================================================
   ELEMENTOS
========================================================= */

const menuScreen = document.getElementById("menuScreen");
const animeScreen = document.getElementById("animeScreen");

const episode1 = document.getElementById("episode1");

const canvas = document.getElementById("animeCanvas");
const ctx = canvas.getContext("2d");

const episodeTitle = document.getElementById("episodeTitle");

const subtitleBox = document.getElementById("subtitleBox");
const subtitleText = document.getElementById("subtitleText");

const startEpisode = document.getElementById("startEpisode");
const startButton = document.getElementById("startButton");

const pausedScreen = document.getElementById("pausedScreen");
const resumeButton = document.getElementById("resumeButton");

const loadingScreen = document.getElementById("loadingScreen");

const pauseButton = document.getElementById("pauseButton");
const muteButton = document.getElementById("muteButton");

const backButton = document.getElementById("backButton");
const pausedBackButton = document.getElementById("pausedBackButton");


/* =========================================================
   CANVAS
========================================================= */

function resizeCanvas() {

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

}

window.addEventListener("resize", resizeCanvas);

resizeCanvas();


/* =========================================================
   ESTADO
========================================================= */

let episodeTime = 0;

let playing = false;

let paused = false;

let muted = false;

let animationFrame = null;

let lastFrameTime = 0;


/*
    O episódio possui 15 minutos.

    O tempo é acelerado durante o desenvolvimento
    para podermos testar.

    1 = tempo normal.
*/

const TIME_SCALE = 1;

const EPISODE_LENGTH = 900;


/* =========================================================
   ÁUDIO
========================================================= */

let audioContext = null;

let masterGain = null;


function initializeAudio() {

    if (audioContext) {
        return;
    }

    try {

        audioContext =
            new (window.AudioContext || window.webkitAudioContext)();

        masterGain =
            audioContext.createGain();

        masterGain.gain.value = muted ? 0 : 0.04;

        masterGain.connect(audioContext.destination);

    } catch (error) {

        console.log("Áudio não disponível.");

    }

}


function playTone(
    frequency = 440,
    duration = 0.15,
    type = "sine"
) {

    if (!audioContext || muted) {
        return;
    }

    const oscillator =
        audioContext.createOscillator();

    const gain =
        audioContext.createGain();

    oscillator.type = type;

    oscillator.frequency.value = frequency;

    gain.gain.setValueAtTime(
        0.0001,
        audioContext.currentTime
    );

    gain.gain.exponentialRampToValueAtTime(
        0.08,
        audioContext.currentTime + 0.02
    );

    gain.gain.exponentialRampToValueAtTime(
        0.0001,
        audioContext.currentTime + duration
    );

    oscillator.connect(gain);

    gain.connect(masterGain);

    oscillator.start();

    oscillator.stop(
        audioContext.currentTime + duration
    );
}


/* =========================================================
   EPISÓDIO 01
========================================================= */

episode1.addEventListener("click", function () {

    console.log("EPISÓDIO 01 CLICADO");

    menuScreen.classList.add("hidden");

    animeScreen.classList.remove("hidden");

    startEpisode.classList.remove("hidden");

    pausedScreen.classList.add("hidden");

    loadingScreen.classList.add("hidden");

    episodeTitle.style.opacity = "0";

    subtitleBox.style.opacity = "0";

    episodeTime = 0;

    playing = false;

    paused = false;

    startButton.textContent = "▶ COMEÇAR";

    drawCurrentScene();

});


/* =========================================================
   COMEÇAR
========================================================= */

startButton.addEventListener("click", function () {

    initializeAudio();

    if (audioContext) {

        audioContext.resume();

    }

    startEpisode.classList.add("hidden");

    pausedScreen.classList.add("hidden");

    playing = true;

    paused = false;

    episodeTime = 0;

    lastFrameTime = performance.now();

    playTone(220, 0.5, "sine");

    requestAnimationFrame(episodeLoop);

});


/* =========================================================
   PAUSA
========================================================= */

pauseButton.addEventListener("click", function () {

    if (!playing) {
        return;
    }

    paused = !paused;

    if (paused) {

        pausedScreen.classList.remove("hidden");

        pauseButton.textContent = "▶";

    } else {

        pausedScreen.classList.add("hidden");

        pauseButton.textContent = "❚❚";

        lastFrameTime = performance.now();

    }

});


/* =========================================================
   CONTINUAR
========================================================= */

resumeButton.addEventListener("click", function () {

    paused = false;

    pausedScreen.classList.add("hidden");

    pauseButton.textContent = "❚❚";

    lastFrameTime = performance.now();

});


/* =========================================================
   SOM
========================================================= */

muteButton.addEventListener("click", function () {

    muted = !muted;

    muteButton.textContent =
        muted ? "🔇" : "🔊";

    if (masterGain) {

        masterGain.gain.value =
            muted ? 0 : 0.04;

    }

});


/* =========================================================
   VOLTAR
========================================================= */

function returnToMenu() {

    playing = false;

    paused = false;

    episodeTime = 0;

    if (animationFrame) {

        cancelAnimationFrame(animationFrame);

        animationFrame = null;

    }

    animeScreen.classList.add("hidden");

    menuScreen.classList.remove("hidden");

    startEpisode.classList.remove("hidden");

    pausedScreen.classList.add("hidden");

    loadingScreen.classList.add("hidden");

    episodeTitle.style.opacity = "0";

    subtitleBox.style.opacity = "0";

}


backButton.addEventListener(
    "click",
    returnToMenu
);

pausedBackButton.addEventListener(
    "click",
    returnToMenu
);


/* =========================================================
   LOOP PRINCIPAL
========================================================= */

function episodeLoop(currentTime) {

    if (!playing) {
        return;
    }

    animationFrame =
        requestAnimationFrame(episodeLoop);

    if (paused) {

        lastFrameTime = currentTime;

        return;

    }

    const delta =
        (currentTime - lastFrameTime) / 1000;

    lastFrameTime = currentTime;

    episodeTime +=
        delta * TIME_SCALE;

    if (episodeTime >= EPISODE_LENGTH) {

        episodeTime = EPISODE_LENGTH;

        playing = false;

        showEpisodeEnd();

        return;

    }

    drawCurrentScene();

}


/* =========================================================
   FINAL DO EPISÓDIO
========================================================= */

function showEpisodeEnd() {

    subtitleText.textContent =
        "FIM DO EPISÓDIO 01";

    subtitleBox.style.opacity = "1";

    episodeTitle.style.opacity = "0";

    setTimeout(function () {

        returnToMenu();

    }, 5000);

}


/* =========================================================
   DESENHO BÁSICO
========================================================= */

function clearScreen(color = "#000") {

    ctx.fillStyle = color;

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

}


function rect(
    x,
    y,
    width,
    height,
    color
) {

    ctx.fillStyle = color;

    ctx.fillRect(
        x,
        y,
        width,
        height
    );

}


function circle(
    x,
    y,
    radius,
    color
) {

    ctx.fillStyle = color;

    ctx.beginPath();

    ctx.arc(
        x,
        y,
        radius,
        0,
        Math.PI * 2
    );

    ctx.fill();

}


function line(
    x1,
    y1,
    x2,
    y2,
    color,
    width = 2
) {

    ctx.strokeStyle = color;

    ctx.lineWidth = width;

    ctx.beginPath();

    ctx.moveTo(x1, y1);

    ctx.lineTo(x2, y2);

    ctx.stroke();

}


function text(
    value,
    x,
    y,
    size,
    color = "white",
    align = "center"
) {

    ctx.fillStyle = color;

    ctx.font =
        `${size}px Arial`;

    ctx.textAlign = align;

    ctx.fillText(
        value,
        x,
        y
    );

}


/* =========================================================
   GRADIENTE
========================================================= */

function skyGradient(
    top,
    bottom
) {

    const gradient =
        ctx.createLinearGradient(
            0,
            0,
            0,
            canvas.height
        );

    gradient.addColorStop(
        0,
        top
    );

    gradient.addColorStop(
        1,
        bottom
    );

    ctx.fillStyle = gradient;

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

}


/* =========================================================
   CENA 1 — ABERTURA
   0:00 — 0:40
========================================================= */

function sceneOpening() {

    clearScreen("#020204");

    const alpha =
        Math.min(
            1,
            episodeTime / 3
        );

    ctx.globalAlpha = alpha;

    text(
        "GHYDAWAY",
        canvas.width / 2,
        canvas.height / 2 - 20,
        Math.min(80, canvas.width * 0.1),
        "#ffffff"
    );

    text(
        "UMA HISTÓRIA DE MANA, GUERRA E SOBREVIVÊNCIA",
        canvas.width / 2,
        canvas.height / 2 + 30,
        14,
        "#777"
    );

    ctx.globalAlpha = 1;

}


/* =========================================================
   CENA 2 — MUNDO
   0:40 — 2:00
========================================================= */

function sceneWorld() {

    skyGradient(
        "#080d18",
        "#11141a"
    );

    drawStars();

    text(
        "GHYDAWAY",
        canvas.width / 2,
        canvas.height * 0.27,
        48,
        "#ffffff"
    );

    text(
        "Um continente dividido pelo poder da mana.",
        canvas.width / 2,
        canvas.height * 0.34,
        18,
        "#aaa"
    );

    drawWorldMap();

}


/* =========================================================
   MAPA
========================================================= */

function drawWorldMap() {

    const cx =
        canvas.width / 2;

    const cy =
        canvas.height * 0.62;

    ctx.fillStyle = "#252a30";

    ctx.beginPath();

    ctx.moveTo(cx - 400, cy - 100);

    ctx.lineTo(cx - 300, cy - 170);

    ctx.lineTo(cx - 150, cy - 140);

    ctx.lineTo(cx - 60, cy - 220);

    ctx.lineTo(cx + 80, cy - 180);

    ctx.lineTo(cx + 230, cy - 120);

    ctx.lineTo(cx + 390, cy - 60);

    ctx.lineTo(cx + 300, cy + 100);

    ctx.lineTo(cx + 120, cy + 150);

    ctx.lineTo(cx - 20, cy + 120);

    ctx.lineTo(cx - 160, cy + 180);

    ctx.lineTo(cx - 330, cy + 120);

    ctx.closePath();

    ctx.fill();

    text(
        "YALHES",
        cx + 100,
        cy - 20,
        22,
        "#fff"
    );

    circle(
        cx + 100,
        cy - 30,
        5,
        "#fff"
    );

}


/* =========================================================
   CENA 3 — YALHES
   2:00 — 4:00
========================================================= */

function sceneYalhes() {

    skyGradient(
        "#131720",
        "#303238"
    );

    drawMountains();

    drawCity();

    text(
        "YALHES",
        canvas.width / 2,
        canvas.height * 0.18,
        50,
        "#ffffff"
    );

    text(
        "O país mais poderoso de Ghydaway.",
        canvas.width / 2,
        canvas.height * 0.24,
        16,
        "#aaa"
    );

}


/* =========================================================
   MONTANHAS
========================================================= */

function drawMountains() {

    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = "#17191e";

    ctx.beginPath();

    ctx.moveTo(0, h * 0.65);

    ctx.lineTo(w * 0.15, h * 0.35);

    ctx.lineTo(w * 0.27, h * 0.6);

    ctx.lineTo(w * 0.43, h * 0.3);

    ctx.lineTo(w * 0.6, h * 0.58);

    ctx.lineTo(w * 0.75, h * 0.38);

    ctx.lineTo(w, h * 0.62);

    ctx.lineTo(w, h);

    ctx.lineTo(0, h);

    ctx.closePath();

    ctx.fill();

}


/* =========================================================
   CIDADE
========================================================= */

function drawCity() {

    const w = canvas.width;
    const h = canvas.height;

    const baseY =
        h * 0.76;

    for (
        let x = -20;
        x < w;
        x += 55
    ) {

        const buildingHeight =
            60 + Math.random() * 140;

        rect(
            x,
            baseY - buildingHeight,
            45,
            buildingHeight,
            "#202228"
        );

        for (
            let y = baseY - buildingHeight + 15;
            y < baseY - 10;
            y += 20
        ) {

            if (Math.random() > 0.4) {

                rect(
                    x + 10,
                    y,
                    8,
                    6,
                    "#777"
                );

            }

        }

    }

    rect(
        0,
        baseY,
        w,
        h - baseY,
        "#0b0c0f"
    );

}


/* =========================================================
   CENA 4 — ACADEMIA
   4:00 — 6:00
========================================================= */

function sceneAcademy() {

    skyGradient(
        "#1b1e25",
        "#090a0d"
    );

    drawAcademy();

    text(
        "ACADEMIA MILITAR DE YALHES",
        canvas.width / 2,
        canvas.height * 0.13,
        28,
        "#fff"
    );

    text(
        "Aqui são treinados os guerreiros mágicos.",
        canvas.width / 2,
        canvas.height * 0.19,
        15,
        "#999"
    );

}


/* =========================================================
   ACADEMIA
========================================================= */

function drawAcademy() {

    const w = canvas.width;
    const h = canvas.height;

    const center =
        w / 2;

    rect(
        center - 300,
        h * 0.3,
        600,
        300,
        "#292d34"
    );

    rect(
        center - 390,
        h * 0.52,
        780,
        100,
        "#1c1f24"
    );

    ctx.fillStyle = "#3a3e45";

    ctx.beginPath();

    ctx.moveTo(center - 220, h * 0.3);

    ctx.lineTo(center, h * 0.08);

    ctx.lineTo(center + 220, h * 0.3);

    ctx.closePath();

    ctx.fill();

    text(
        "Y",
        center,
        h * 0.27,
        80,
        "#ddd"
    );

}


/* =========================================================
   CENA 5 — SALA DE AULA
   6:00 — 7:30
========================================================= */

function sceneClassroom() {

    clearScreen("#0b0c0f");

    rect(
        0,
        0,
        canvas.width,
        canvas.height * 0.7,
        "#15171c"
    );

    rect(
        0,
        canvas.height * 0.7,
        canvas.width,
        canvas.height * 0.3,
        "#090a0c"
    );

    text(
        "A MANA NÃO É APENAS UMA ARMA.",
        canvas.width / 2,
        canvas.height * 0.25,
        28,
        "#ddd"
    );

    text(
        "É aquilo que mantém um reino de pé.",
        canvas.width / 2,
        canvas.height * 0.32,
        19,
        "#777"
    );

    drawStudents();

}


/* =========================================================
   ALUNOS
========================================================= */

function drawStudents() {

    const baseY =
        canvas.height * 0.75;

    for (
        let i = 0;
        i < 7;
        i++
    ) {

        const x =
            canvas.width / 2 -
            300 +
            i * 100;

        circle(
            x,
            baseY - 70,
            22,
            "#aaa"
        );

        rect(
            x - 30,
            baseY - 45,
            60,
            70,
            "#555"
        );

    }

}


/* =========================================================
   CENA 6 — EXÉRCITO
   7:30 — 9:00
========================================================= */

function sceneMilitary() {

    skyGradient(
        "#15171c",
        "#050507"
    );

    rect(
        0,
        canvas.height * 0.72,
        canvas.width,
        canvas.height * 0.28,
        "#08090b"
    );

    text(
        "COMANDO MILITAR DE YALHES",
        canvas.width / 2,
        canvas.height * 0.17,
        30,
        "#fff"
    );

    text(
        "Há sinais de magia antiga no norte.",
        canvas.width / 2,
        canvas.height * 0.26,
        19,
        "#999"
    );

    drawCommander();

}


/* =========================================================
   COMANDANTE
========================================================= */

function drawCommander() {

    const x =
        canvas.width / 2;

    const y =
        canvas.height * 0.62;

    circle(
        x,
        y - 110,
        35,
        "#aaa"
    );

    rect(
        x - 55,
        y - 75,
        110,
        160,
        "#383b42"
    );

    line(
        x - 30,
        y - 20,
        x - 100,
        y + 30,
        "#aaa",
        8
    );

    line(
        x + 30,
        y - 20,
        x + 100,
        y + 30,
        "#aaa",
        8
    );

}


/* =========================================================
   CENA 7 — FLORESTA
   9:00 — 10:30
========================================================= */

function sceneForest() {

    skyGradient(
        "#07100b",
        "#020403"
    );

    drawForest();

    text(
        "AO NORTE...",
        canvas.width / 2,
        canvas.height * 0.18,
        35,
        "#bbb"
    );

}


/* =========================================================
   FLORESTA
========================================================= */

function drawForest() {

    const w = canvas.width;
    const h = canvas.height;

    rect(
        0,
        h * 0.75,
        w,
        h * 0.25,
        "#030504"
    );

    for (
        let x = -20;
        x < w + 100;
        x += 90
    ) {

        const height =
            250 + Math.random() * 180;

        rect(
            x,
            h * 0.75 - height,
            45,
            height,
            "#111813"
        );

        circle(
            x + 20,
            h * 0.75 - height,
            70,
            "#101810"
        );

    }

}


/* =========================================================
   CENA 8 — LENDA
   10:30 — 11:30
========================================================= */

function sceneLegend() {

    clearScreen("#030305");

    text(
        "UMA LENDA ESQUECIDA",
        canvas.width / 2,
        canvas.height * 0.2,
        32,
        "#ddd"
    );

    text(
        "Dizem que existia uma vila escondida.",
        canvas.width / 2,
        canvas.height * 0.4,
        20,
        "#999"
    );

    text(
        "Uma vila onde a mana corria pelo sangue.",
        canvas.width / 2,
        canvas.height * 0.47,
        20,
        "#999"
    );

    text(
        "Depois... ninguém mais ouviu falar dela.",
        canvas.width / 2,
        canvas.height * 0.54,
        20,
        "#999"
    );

}


/* =========================================================
   CENA 9 — FRAGMENTO
   11:30 — 12:10
========================================================= */

function sceneFragment() {

    clearScreen("#030304");

    const cx =
        canvas.width / 2;

    const cy =
        canvas.height / 2;

    rect(
        cx - 150,
        cy - 200,
        300,
        400,
        "#111217"
    );

    line(
        cx - 110,
        cy - 130,
        cx + 110,
        cy - 130,
        "#555",
        2
    );

    line(
        cx - 100,
        cy - 70,
        cx + 100,
        cy - 70,
        "#444",
        2
    );

    line(
        cx - 90,
        cy - 10,
        cx + 80,
        cy - 10,
        "#333",
        2
    );

    text(
        "?",
        cx,
        cy + 100,
        70,
        "#aaa"
    );

}


/* =========================================================
   CENA 10 — ESTRADA
   12:10 — 13:50
========================================================= */

function sceneRoad() {

    skyGradient(
        "#38404a",
        "#11151b"
    );

    drawRoad();

    drawProtagonist(
        canvas.width * 0.43,
        canvas.height * 0.69
    );

    drawOldMan(
        canvas.width * 0.58,
        canvas.height * 0.68
    );

}


/* =========================================================
   ESTRADA
========================================================= */

function drawRoad() {

    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = "#15171b";

    ctx.beginPath();

    ctx.moveTo(w * 0.42, h * 0.52);

    ctx.lineTo(w * 0.58, h * 0.52);

    ctx.lineTo(w * 0.9, h);

    ctx.lineTo(w * 0.1, h);

    ctx.closePath();

    ctx.fill();

    line(
        w * 0.5,
        h * 0.55,
        w * 0.5,
        h,
        "#555",
        3
    );

}


/* =========================================================
   PROTAGONISTA
========================================================= */

function drawProtagonist(
    x,
    y
) {

    /*
        Cabeça
    */

    circle(
        x,
        y - 130,
        25,
        "#b7b7b7"
    );


    /*
        Capuz
    */

    ctx.fillStyle = "#0c0d10";

    ctx.beginPath();

    ctx.moveTo(
        x - 38,
        y - 145
    );

    ctx.lineTo(
        x,
        y - 185
    );

    ctx.lineTo(
        x + 38,
        y - 145
    );

    ctx.lineTo(
        x + 32,
        y - 105
    );

    ctx.lineTo(
        x - 32,
        y - 105
    );

    ctx.closePath();

    ctx.fill();


    /*
        Corpo
    */

    rect(
        x - 30,
        y - 105,
        60,
        120,
        "#17191e"
    );


    /*
        Braços
    */

    line(
        x - 25,
        y - 80,
        x - 65,
        y - 5,
        "#202229",
        15
    );

    line(
        x + 25,
        y - 80,
        x + 65,
        y - 5,
        "#202229",
        15
    );


    /*
        Pernas
    */

    line(
        x - 15,
        y + 15,
        x - 25,
        y + 110,
        "#101114",
        18
    );

    line(
        x + 15,
        y + 15,
        x + 25,
        y + 110,
        "#101114",
        18
    );


    /*
        Katana
    */

    line(
        x + 40,
        y - 30,
        x + 100,
        y + 45,
        "#777",
        5
    );

    line(
        x + 35,
        y - 35,
        x + 95,
        y + 40,
        "#ddd",
        2
    );


    /*
        Pequeno brilho de mana
    */

    if (
        Math.floor(episodeTime * 2) % 2 === 0
    ) {

        circle(
            x - 28,
            y - 55,
            3,
            "#d7d7d7"
        );

    }

}


/* =========================================================
   HOMEM DE 55 ANOS
========================================================= */

function drawOldMan(
    x,
    y
) {

    circle(
        x,
        y - 125,
        28,
        "#8e8e8e"
    );

    /*
        Cabelo
    */

    circle(
        x - 20,
        y - 135,
        12,
        "#555"
    );

    circle(
        x + 20,
        y - 135,
        12,
        "#555"
    );


    /*
        Corpo
    */

    rect(
        x - 38,
        y - 98,
        76,
        125,
        "#30333a"
    );


    /*
        Braços
    */

    line(
        x - 25,
        y - 75,
        x - 80,
        y + 20,
        "#292c32",
        18
    );

    line(
        x + 25,
        y - 75,
        x + 80,
        y + 20,
        "#292c32",
        18
    );


    /*
        Bengala
    */

    line(
        x + 70,
        y - 10,
        x + 70,
        y + 125,
        "#777",
        5
    );

}


/* =========================================================
   CENA 11 — APROXIMAÇÃO DE YALHES
   13:50 — 15:00
========================================================= */

function sceneYalhesApproach() {

    skyGradient(
        "#18202a",
        "#06080c"
    );

    drawDistantCity();

    drawProtagonist(
        canvas.width * 0.42,
        canvas.height * 0.68
    );

    drawOldMan(
        canvas.width * 0.57,
        canvas.height * 0.67
    );

}


/* =========================================================
   CIDADE AO LONGE
========================================================= */

function drawDistantCity() {

    const w = canvas.width;
    const h = canvas.height;

    const horizon =
        h * 0.61;

    rect(
        0,
        horizon,
        w,
        h - horizon,
        "#0a0c10"
    );

    for (
        let x = 0;
        x < w;
        x += 45
    ) {

        const height =
            40 + Math.random() * 80;

        rect(
            x,
            horizon - height,
            35,
            height,
            "#20242b"
        );

    }

    /*
        Torre central
    */

    rect(
        w / 2 - 35,
        horizon - 260,
        70,
        260,
        "#383d45"
    );

    ctx.fillStyle = "#464b53";

    ctx.beginPath();

    ctx.moveTo(
        w / 2 - 60,
        horizon - 260
    );

    ctx.lineTo(
        w / 2,
        horizon - 350
    );

    ctx.lineTo(
        w / 2 + 60,
        horizon - 260
    );

    ctx.closePath();

    ctx.fill();

    text(
        "YALHES",
        w / 2,
        horizon - 375,
        25,
        "#ddd"
    );

}


/* =========================================================
   ESTRELAS
========================================================= */

function drawStars() {

    const w = canvas.width;

    const h = canvas.height;

    for (
        let i = 0;
        i < 80;
        i++
    ) {

        const x =
            (i * 97) % w;

        const y =
            (i * 53) % (h * 0.65);

        const size =
            (i % 3) + 1;

        circle(
            x,
            y,
            size,
            "#777"
        );

    }

}


/* =========================================================
   LEGENDAS / DIÁLOGOS
========================================================= */

const dialogues = [

    {
        start: 0,
        end: 8,
        text: "Há lugares onde a força de um homem é medida pela lâmina que carrega."
    },

    {
        start: 8,
        end: 16,
        text: "Em Ghydaway, não."
    },

    {
        start: 16,
        end: 27,
        text: "Aqui, desde os tempos antigos, a mana passou a definir o destino dos homens."
    },

    {
        start: 45,
        end: 58,
        text: "Aqueles que aprenderam a dominá-la construíram reinos."
    },

    {
        start: 58,
        end: 70,
        text: "Aqueles que não conseguiram... perderam os seus."
    },

    {
        start: 130,
        end: 142,
        text: "Yalhes se tornou o país mais poderoso de Ghydaway."
    },

    {
        start: 142,
        end: 154,
        text: "Seu exército é formado pelos guerreiros mágicos mais fortes do continente."
    },

    {
        start: 255,
        end: 270,
        text: "Mana não serve apenas para lançar feitiços."
    },

    {
        start: 270,
        end: 283,
        text: "Ela pode fortalecer o corpo, proteger uma cidade ou destruir um exército."
    },

    {
        start: 283,
        end: 297,
        text: "E alguém sem mana?"
    },

    {
        start: 297,
        end: 312,
        text: "Pode ser um excelente ferreiro. Um comerciante. Um agricultor."
    },

    {
        start: 312,
        end: 325,
        text: "Mas no campo de batalha..."
    },

    {
        start: 325,
        end: 340,
        text: "Yalhes não envia homens para uma guerra esperando que voltem em caixões."
    },

    {
        start: 455,
        end: 470,
        text: "Há sinais de uma magia antiga no norte."
    },

    {
        start: 470,
        end: 484,
        text: "Não sabemos quem deixou aquilo lá."
    },

    {
        start: 484,
        end: 498,
        text: "Mas alguém está procurando por alguma coisa."
    },

    {
        start: 540,
        end: 555,
        text: "Dizem que existia uma vila escondida."
    },

    {
        start: 555,
        end: 570,
        text: "Uma vila onde a mana corria pelo sangue."
    },

    {
        start: 570,
        end: 585,
        text: "Depois... ninguém mais ouviu falar dela."
    },

    {
        start: 730,
        end: 742,
        text: "Quanto falta?"
    },

    {
        start: 742,
        end: 754,
        text: "Se continuar perguntando, vai parecer mais longe."
    },

    {
        start: 754,
        end: 766,
        text: "Não respondeu."
    },

    {
        start: 766,
        end: 778,
        text: "Dois dias."
    },

    {
        start: 778,
        end: 790,
        text: "Você já esteve lá?"
    },

    {
        start: 790,
        end: 802,
        text: "Já."
    },

    {
        start: 802,
        end: 814,
        text: "Quantas vezes?"
    },

    {
        start: 814,
        end: 827,
        text: "Mais do que gostaria."
    },

    {
        start: 827,
        end: 840,
        text: "Você não gosta de Yalhes?"
    },

    {
        start: 840,
        end: 854,
        text: "Eu gosto da cidade. Só não gosto das pessoas que mandam nela."
    },

    {
        start: 854,
        end: 867,
        text: "Por que você está indo comigo?"
    },

    {
        start: 867,
        end: 879,
        text: "Porque alguém precisa."
    },

    {
        start: 879,
        end: 891,
        text: "Isso não é resposta."
    },

    {
        start: 891,
        end: 900,
        text: "É a única que você vai receber hoje."
    }

];


/* =========================================================
   ATUALIZAÇÃO DAS LEGENDAS
========================================================= */

function updateDialogue() {

    let activeDialogue = null;

    for (
        const dialogue of dialogues
    ) {

        if (
            episodeTime >= dialogue.start &&
            episodeTime < dialogue.end
        ) {

            activeDialogue =
                dialogue;

            break;

        }

    }

    if (activeDialogue) {

        subtitleText.textContent =
            activeDialogue.text;

        subtitleBox.style.opacity = "1";

    } else {

        subtitleText.textContent = "";

        subtitleBox.style.opacity = "0";

    }

}


/* =========================================================
   CENA ATUAL
========================================================= */

function drawCurrentScene() {

    updateDialogue();

    /*
        0:00 - 0:40
    */

    if (
        episodeTime < 40
    ) {

        sceneOpening();

    }

    /*
        0:40 - 2:00
    */

    else if (
        episodeTime < 120
    ) {

        sceneWorld();

    }

    /*
        2:00 - 4:00
    */

    else if (
        episodeTime < 240
    ) {

        sceneYalhes();

    }

    /*
        4:00 - 6:00
    */

    else if (
        episodeTime < 360
    ) {

        sceneAcademy();

    }

    /*
        6:00 - 7:30
    */

    else if (
        episodeTime < 450
    ) {

        sceneClassroom();

    }

    /*
        7:30 - 9:00
    */

    else if (
        episodeTime < 540
    ) {

        sceneMilitary();

    }

    /*
        9:00 - 10:30
    */

    else if (
        episodeTime < 630
    ) {

        sceneForest();

    }

    /*
        10:30 - 11:30
    */

    else if (
        episodeTime < 690
    ) {

        sceneLegend();

    }

    /*
        11:30 - 12:10
    */

    else if (
        episodeTime < 730
    ) {

        sceneFragment();

    }

    /*
        12:10 - 13:50
        PROTAGONISTA APARECE
    */

    else if (
        episodeTime < 830
    ) {

        sceneRoad();

    }

    /*
        13:50 - 15:00
    */

    else {

        sceneYalhesApproach();

    }


    /*
        Título inicial
    */

    if (
        episodeTime >= 2 &&
        episodeTime <= 15
    ) {

        episodeTitle.style.opacity = "1";

    } else {

        episodeTitle.style.opacity = "0";

    }

}


/* =========================================================
   DESENHO INICIAL
========================================================= */

drawCurrentScene();


/* =========================================================
   TESTE NO CONSOLE
========================================================= */

console.log(
    "GHYDAWAY carregado corretamente."
);

console.log(
    "Episódio 01 pronto."
);