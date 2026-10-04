/* =========================================================
   GHYDAWAY
   EPISÓDIO 01 - O CAMINHO PARA YALHES
   Motor cinematográfico em Canvas
========================================================= */

const canvas = document.getElementById("animeCanvas");
const ctx = canvas.getContext("2d");

const menu = document.getElementById("episodeMenu");
const animeScreen = document.getElementById("animeScreen");

const episode1 = document.getElementById("episode1");

const startEpisode = document.getElementById("startEpisode");
const startButton = document.getElementById("startButton");
const returnButton = document.getElementById("returnButton");

const pauseButton = document.getElementById("pauseButton");
const muteButton = document.getElementById("muteButton");
const backButton = document.getElementById("backButton");

const pausedScreen = document.getElementById("pausedScreen");
const resumeButton = document.getElementById("resumeButton");
const pauseBackButton = document.getElementById("pauseBackButton");

const subtitleText = document.getElementById("subtitleText");
const episodeTitle = document.getElementById("episodeTitle");

const loadingScreen = document.getElementById("loadingScreen");
const loadingProgress = document.getElementById("loadingProgress");


/* =========================================================
   CANVAS
========================================================= */

let W = 0;
let H = 0;

function resizeCanvas() {

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    W = window.innerWidth;
    H = window.innerHeight;

    canvas.width = W * dpr;
    canvas.height = H * dpr;

    canvas.style.width = W + "px";
    canvas.style.height = H + "px";

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

window.addEventListener("resize", resizeCanvas);

resizeCanvas();


/* =========================================================
   ESTADO
========================================================= */

let playing = false;
let paused = false;
let muted = false;

let episodeTime = 0;
let lastFrame = performance.now();

const EPISODE_DURATION = 900;


/* =========================================================
   ÁUDIO
========================================================= */

let audioContext = null;
let masterGain = null;

function initAudio() {

    if (audioContext) return;

    audioContext =
        new (window.AudioContext || window.webkitAudioContext)();

    masterGain = audioContext.createGain();

    masterGain.gain.value = 0.08;

    masterGain.connect(audioContext.destination);
}


function sound(freq, duration = 0.2, type = "sine") {

    if (muted) return;

    initAudio();

    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.type = type;
    osc.frequency.value = freq;

    gain.gain.setValueAtTime(
        0.0001,
        audioContext.currentTime
    );

    gain.gain.exponentialRampToValueAtTime(
        0.2,
        audioContext.currentTime + 0.02
    );

    gain.gain.exponentialRampToValueAtTime(
        0.0001,
        audioContext.currentTime + duration
    );

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start();

    osc.stop(
        audioContext.currentTime + duration
    );
}


/* =========================================================
   MENU
========================================================= */

episode1.addEventListener("click", function () {

    console.log("EPISÓDIO 01 CLICADO");

    menu.classList.add("hidden");
    animeScreen.classList.remove("hidden");

    startEpisode.style.display = "flex";
    pausedScreen.style.display = "none";
    loadingScreen.style.display = "none";

    episodeTitle.style.opacity = "0";

    episodeTime = 0;
    playing = false;
    paused = false;

    startButton.textContent = "▶ COMEÇAR";

    startEpisode.querySelector("span").textContent =
        "EPISÓDIO 01";

    startEpisode.querySelector("h1").textContent =
        "O CAMINHO PARA YALHES";

    drawCurrentScene();
});


returnButton.addEventListener("click", returnToMenu);

backButton.addEventListener("click", returnToMenu);

pauseBackButton.addEventListener("click", returnToMenu);


function returnToMenu() {

    playing = false;
    paused = false;

    animeScreen.classList.add("hidden");
    menu.classList.remove("hidden");

    pausedScreen.style.display = "none";

    startEpisode.style.display = "flex";

    episodeTime = 0;
}


/* =========================================================
   COMEÇAR
========================================================= */

startButton.addEventListener("click", () => {

    initAudio();

    if (audioContext.state === "suspended") {
        audioContext.resume();
    }

    startEpisode.style.display = "none";

    loadingScreen.style.display = "flex";

    fakeLoading();
});


function fakeLoading() {

    let progress = 0;

    const timer = setInterval(() => {

        progress += Math.random() * 7;

        if (progress >= 100) {

            progress = 100;

            clearInterval(timer);

            loadingScreen.style.display = "none";

            startEpisode.style.display = "none";

            playing = true;
            paused = false;

            episodeTime = 0;

            sound(220, .5);

        }

        loadingProgress.style.width =
            progress + "%";

    }, 100);
}


/* =========================================================
   PAUSA
========================================================= */

pauseButton.addEventListener("click", togglePause);

resumeButton.addEventListener("click", togglePause);

function togglePause() {

    if (!playing) return;

    paused = !paused;

    if (paused) {

        pausedScreen.style.display = "flex";

        pauseButton.textContent = "▶";

    } else {

        pausedScreen.style.display = "none";

        pauseButton.textContent = "❚❚";

        lastFrame = performance.now();
    }
}


/* =========================================================
   MUTE
========================================================= */

muteButton.addEventListener("click", () => {

    muted = !muted;

    muteButton.textContent =
        muted ? "🔇" : "🔊";
});


/* =========================================================
   ESC / ESPAÇO
========================================================= */

window.addEventListener("keydown", e => {

    if (e.code === "Escape") {

        if (!animeScreen.classList.contains("hidden")) {
            returnToMenu();
        }
    }

    if (e.code === "Space") {

        if (playing) {
            togglePause();
        }
    }
});


/* =========================================================
   FUNÇÕES GRÁFICAS
========================================================= */

function rect(x, y, w, h, color) {

    ctx.fillStyle = color;

    ctx.fillRect(x, y, w, h);
}


function circle(x, y, r, color) {

    ctx.beginPath();

    ctx.arc(
        x,
        y,
        r,
        0,
        Math.PI * 2
    );

    ctx.fillStyle = color;

    ctx.fill();
}


function line(x1, y1, x2, y2, color, width = 1) {

    ctx.beginPath();

    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);

    ctx.strokeStyle = color;
    ctx.lineWidth = width;

    ctx.stroke();
}


function text(txt, x, y, size, color = "white", align = "center") {

    ctx.font = `${size}px Arial`;

    ctx.textAlign = align;

    ctx.fillStyle = color;

    ctx.fillText(txt, x, y);
}


/* =========================================================
   CÉU
========================================================= */

function sky(top, bottom) {

    const gradient =
        ctx.createLinearGradient(
            0,
            0,
            0,
            H
        );

    gradient.addColorStop(0, top);
    gradient.addColorStop(1, bottom);

    ctx.fillStyle = gradient;

    ctx.fillRect(
        0,
        0,
        W,
        H
    );
}


/* =========================================================
   MONTANHAS
========================================================= */

function mountains(offset = 0, color = "#151b23") {

    ctx.beginPath();

    ctx.moveTo(-100, H * .72);

    for (
        let x = -100;
        x < W + 200;
        x += 160
    ) {

        const peak =
            H * .48 +
            Math.sin(x * .012 + offset) * 80;

        ctx.lineTo(
            x,
            peak
        );

        ctx.lineTo(
            x + 80,
            H * .72
        );
    }

    ctx.lineTo(W + 200, H);
    ctx.lineTo(-100, H);

    ctx.closePath();

    ctx.fillStyle = color;

    ctx.fill();
}


/* =========================================================
   ESTRELAS
========================================================= */

function stars(amount = 100) {

    for (let i = 0; i < amount; i++) {

        const x =
            (i * 7919) % W;

        const y =
            (i * 3571) % (H * .65);

        const size =
            1 + ((i * 13) % 2);

        circle(
            x,
            y,
            size,
            "rgba(255,255,255,.55)"
        );
    }
}


/* =========================================================
   LUA
========================================================= */

function moon(x, y, r) {

    circle(
        x,
        y,
        r,
        "#d8dde4"
    );

    circle(
        x + r * .25,
        y - r * .1,
        r * .9,
        "#080b10"
    );
}


/* =========================================================
   PERSONAGEM
========================================================= */

function character(
    x,
    y,
    scale,
    cloak = "#171a20",
    skin = "#b98468"
) {

    /* cabeça */

    circle(
        x,
        y - 55 * scale,
        14 * scale,
        skin
    );

    /* capuz */

    ctx.beginPath();

    ctx.moveTo(
        x - 18 * scale,
        y - 55 * scale
    );

    ctx.lineTo(
        x,
        y - 82 * scale
    );

    ctx.lineTo(
        x + 18 * scale,
        y - 55 * scale
    );

    ctx.closePath();

    ctx.fillStyle = cloak;

    ctx.fill();

    /* corpo */

    ctx.beginPath();

    ctx.moveTo(
        x - 22 * scale,
        y - 42 * scale
    );

    ctx.lineTo(
        x - 30 * scale,
        y + 45 * scale
    );

    ctx.lineTo(
        x + 30 * scale,
        y + 45 * scale
    );

    ctx.lineTo(
        x + 22 * scale,
        y - 42 * scale
    );

    ctx.closePath();

    ctx.fillStyle = cloak;

    ctx.fill();

    /* pernas */

    rect(
        x - 18 * scale,
        y + 40 * scale,
        14 * scale,
        45 * scale,
        "#0b0c10"
    );

    rect(
        x + 4 * scale,
        y + 40 * scale,
        14 * scale,
        45 * scale,
        "#0b0c10"
    );

    /* braço */

    line(
        x - 18 * scale,
        y - 30 * scale,
        x - 35 * scale,
        y + 15 * scale,
        cloak,
        9 * scale
    );

    line(
        x + 18 * scale,
        y - 30 * scale,
        x + 34 * scale,
        y + 15 * scale,
        cloak,
        9 * scale
    );

}


/* =========================================================
   KATANA
========================================================= */

function katana(x, y, scale) {

    line(
        x,
        y,
        x + 5 * scale,
        y - 70 * scale,
        "#d8dce0",
        3 * scale
    );

    line(
        x - 7 * scale,
        y - 8 * scale,
        x + 7 * scale,
        y - 8 * scale,
        "#b38b48",
        4 * scale
    );
}


/* =========================================================
   YALHES
========================================================= */

function yalhesCity() {

    rect(
        0,
        H * .6,
        W,
        H * .4,
        "#171a1e"
    );

    const buildings = 20;

    for (let i = 0; i < buildings; i++) {

        const bw =
            35 + ((i * 37) % 70);

        const bh =
            80 + ((i * 71) % 180);

        const x =
            i * (W / buildings);

        rect(
            x,
            H * .6 - bh,
            bw,
            bh,
            i % 2
                ? "#20252b"
                : "#292f36"
        );

        for (
            let wy = H * .6 - bh + 20;
            wy < H * .6 - 10;
            wy += 25
        ) {

            rect(
                x + 10,
                wy,
                6,
                8,
                "rgba(220,220,180,.4)"
            );
        }
    }

    /* torre */

    rect(
        W * .7,
        H * .27,
        100,
        H * .33,
        "#343a42"
    );

    rect(
        W * .67,
        H * .27,
        160,
        15,
        "#4b535c"
    );

    text(
        "YALHES",
        W * .7 + 50,
        H * .4,
        20,
        "#c7ccd1"
    );
}


/* =========================================================
   ACADEMIA
========================================================= */

function academy() {

    rect(
        0,
        H * .65,
        W,
        H * .35,
        "#11151a"
    );

    /* prédio */

    rect(
        W * .25,
        H * .25,
        W * .5,
        H * .4,
        "#30363d"
    );

    /* telhado */

    ctx.beginPath();

    ctx.moveTo(
        W * .18,
        H * .25
    );

    ctx.lineTo(
        W * .5,
        H * .08
    );

    ctx.lineTo(
        W * .82,
        H * .25
    );

    ctx.closePath();

    ctx.fillStyle = "#1c2229";

    ctx.fill();

    /* torre central */

    rect(
        W * .44,
        H * .05,
        W * .12,
        H * .55,
        "#3c434c"
    );

    /* janelas */

    for (let i = 0; i < 6; i++) {

        rect(
            W * .3 + i * W * .07,
            H * .35,
            25,
            35,
            "#aeb8c2"
        );
    }

    text(
        "ACADEMIA DE GUERREIROS",
        W / 2,
        H * .73,
        20,
        "#adb5be"
    );
}


/* =========================================================
   FLORESTA
========================================================= */

function forest() {

    sky(
        "#071016",
        "#182017"
    );

    for (let i = 0; i < 20; i++) {

        const x =
            (i * 137) % W;

        const height =
            100 + ((i * 73) % 180);

        rect(
            x,
            H * .65 - height,
            18,
            height,
            "#101712"
        );

        circle(
            x + 9,
            H * .65 - height,
            45,
            "#142018"
        );
    }

    rect(
        0,
        H * .65,
        W,
        H * .35,
        "#0c120e"
    );
}


/* =========================================================
   ESTRADA
========================================================= */

function roadScene() {

    sky(
        "#405264",
        "#a98f72"
    );

    mountains(
        episodeTime * .0005,
        "#39434a"
    );

    rect(
        0,
        H * .68,
        W,
        H * .32,
        "#5a594d"
    );

    ctx.beginPath();

    ctx.moveTo(
        W * .42,
        H
    );

    ctx.lineTo(
        W * .48,
        H * .68
    );

    ctx.lineTo(
        W * .52,
        H * .68
    );

    ctx.lineTo(
        W * .62,
        H
    );

    ctx.closePath();

    ctx.fillStyle = "#3f403a";

    ctx.fill();

    /* árvores */

    for (let i = 0; i < 8; i++) {

        const x =
            i * W / 7;

        const h =
            70 + (i % 3) * 30;

        rect(
            x,
            H * .68 - h,
            15,
            h,
            "#282f2b"
        );

        circle(
            x + 7,
            H * .68 - h,
            35,
            "#28332e"
        );
    }
}


/* =========================================================
   CENA DE VILAREJO
========================================================= */

function village() {

    sky(
        "#1b2027",
        "#59616a"
    );

    mountains(
        1,
        "#272d34"
    );

    rect(
        0,
        H * .67,
        W,
        H * .33,
        "#242a26"
    );

    for (let i = 0; i < 8; i++) {

        const x =
            50 + i * 120;

        rect(
            x,
            H * .48,
            80,
            H * .2,
            "#3b3530"
        );

        ctx.beginPath();

        ctx.moveTo(
            x - 10,
            H * .48
        );

        ctx.lineTo(
            x + 40,
            H * .38
        );

        ctx.lineTo(
            x + 90,
            H * .48
        );

        ctx.closePath();

        ctx.fillStyle = "#29251f";

        ctx.fill();
    }
}


/* =========================================================
   MANÁ
========================================================= */

function mana(x, y, radius, power = 1) {

    const pulse =
        Math.sin(episodeTime * 6) * 4;

    ctx.beginPath();

    ctx.arc(
        x,
        y,
        radius + pulse,
        0,
        Math.PI * 2
    );

    ctx.strokeStyle =
        `rgba(180,210,255,${.4 * power})`;

    ctx.lineWidth = 3;

    ctx.stroke();

    for (let i = 0; i < 12; i++) {

        const angle =
            episodeTime * 1.5 + i;

        const distance =
            radius + 10 + Math.sin(
                episodeTime * 3 + i
            ) * 10;

        circle(
            x + Math.cos(angle) * distance,
            y + Math.sin(angle) * distance,
            2,
            "rgba(210,230,255,.8)"
        );
    }
}


/* =========================================================
   CENAS
========================================================= */

function sceneIntro() {

    sky(
        "#030508",
        "#10151c"
    );

    stars(120);

    moon(
        W * .75,
        H * .25,
        65
    );

    text(
        "GHYDAWAY",
        W / 2,
        H * .48,
        Math.min(80, W / 7),
        "#e2e5e8"
    );

    text(
        "UM MUNDO ONDE A MANA DECIDE QUEM SOBREVIVE",
        W / 2,
        H * .55,
        14,
        "#89929c"
    );
}


function sceneWorld() {

    sky(
        "#15202b",
        "#5d6872"
    );

    mountains(
        episodeTime * .1,
        "#303a44"
    );

    rect(
        0,
        H * .72,
        W,
        H * .28,
        "#242a2c"
    );

    text(
        "GHYDAWAY",
        W / 2,
        H * .28,
        50,
        "#e0e3e6"
    );

    text(
        "CONTINENTE DOS REINOS DE MANA",
        W / 2,
        H * .35,
        14,
        "#c1c7cd"
    );
}


function sceneYalhes() {

    sky(
        "#101923",
        "#47525d"
    );

    yalhesCity();

    text(
        "YALHES",
        W / 2,
        H * .16,
        60,
        "#e0e4e8"
    );

    text(
        "A NAÇÃO DOS GUERREIROS MÁGICOS",
        W / 2,
        H * .22,
        14,
        "#a9b2bb"
    );
}


function sceneAcademy() {

    sky(
        "#10161c",
        "#53606b"
    );

    academy();

    /* estudantes */

    for (let i = 0; i < 5; i++) {

        character(
            W * .35 + i * 80,
            H * .66,
            .55,
            "#202731"
        );
    }

    mana(
        W / 2,
        H * .42,
        40,
        1
    );
}


function sceneMilitary() {

    sky(
        "#050608",
        "#0c1116"
    );

    rect(
        0,
        H * .7,
        W,
        H * .3,
        "#11151a"
    );

    rect(
        W * .18,
        H * .18,
        W * .64,
        H * .52,
        "#1c232a"
    );

    rect(
        W * .23,
        H * .25,
        W * .54,
        4,
        "#56606a"
    );

    /* mapa */

    ctx.globalAlpha = .35;

    rect(
        W * .32,
        H * .34,
        W * .36,
        H * .25,
        "#77807f"
    );

    ctx.globalAlpha = 1;

    character(
        W * .45,
        H * .7,
        .8,
        "#171b20"
    );

    character(
        W * .6,
        H * .7,
        .8,
        "#20252c"
    );
}


function sceneAncient() {

    forest();

    circle(
        W / 2,
        H * .5,
        100,
        "rgba(80,120,100,.1)"
    );

    mana(
        W / 2,
        H * .48,
        60,
        1.8
    );

    text(
        "MAGIA ANTIGA",
        W / 2,
        H * .22,
        35,
        "#c8d5cc"
    );
}


function sceneLegend() {

    village();

    text(
        "UMA VILA QUE DESAPARECEU",
        W / 2,
        H * .2,
        35,
        "#d5d8da"
    );

    text(
        "NENHUM MAPA REGISTRA SUA LOCALIZAÇÃO",
        W / 2,
        H * .27,
        13,
        "#a5a9ad"
    );
}


function sceneFragment() {

    sky(
        "#020304",
        "#111820"
    );

    rect(
        W * .35,
        H * .3,
        W * .3,
        H * .4,
        "#20262c"
    );

    /* fragmento */

    ctx.save();

    ctx.translate(
        W / 2,
        H / 2
    );

    ctx.rotate(
        Math.sin(episodeTime) * .05
    );

    ctx.beginPath();

    ctx.moveTo(-40, -70);
    ctx.lineTo(45, -50);
    ctx.lineTo(35, 65);
    ctx.lineTo(-35, 70);
    ctx.closePath();

    ctx.fillStyle = "#dad4c2";

    ctx.fill();

    ctx.restore();

    mana(
        W / 2,
        H / 2,
        75,
        .7
    );
}


function sceneRoad() {

    roadScene();

    const progress =
        Math.min(
            1,
            Math.max(
                0,
                (episodeTime - 660) / 30
            )
        );

    /* velho */

    character(
        W * .47,
        H * .73,
        .85,
        "#35332f",
        "#9c735e"
    );

    /* garoto */

    character(
        W * (.32 + progress * .05),
        H * .76,
        .65,
        "#10141a",
        "#ad7b62"
    );

    katana(
        W * (.32 + progress * .05) + 22,
        H * .72,
        .65
    );

    /* capa/vento */

    line(
        W * (.32 + progress * .05) - 20,
        H * .58,
        W * (.32 + progress * .05) - 70,
        H * .55,
        "rgba(20,25,30,.8)",
        8
    );
}


function sceneYalhesApproach() {

    sky(
        "#2e4250",
        "#b69b7b"
    );

    mountains(
        .5,
        "#3b454c"
    );

    rect(
        0,
        H * .7,
        W,
        H * .3,
        "#555247"
    );

    yalhesCity();

    character(
        W * .42,
        H * .75,
        .7,
        "#11151b"
    );

    character(
        W * .5,
        H * .74,
        .9,
        "#36332e",
        "#9c735e"
    );

    katana(
        W * .44,
        H * .73,
        .7
    );
}


/* =========================================================
   TIMELINE
========================================================= */

const scenes = [

    {
        start: 0,
        end: 60,
        draw: sceneIntro
    },

    {
        start: 60,
        end: 150,
        draw: sceneWorld
    },

    {
        start: 150,
        end: 240,
        draw: sceneYalhes
    },

    {
        start: 240,
        end: 360,
        draw: sceneAcademy
    },

    {
        start: 360,
        end: 470,
        draw: sceneMilitary
    },

    {
        start: 470,
        end: 560,
        draw: sceneAncient
    },

    {
        start: 560,
        end: 630,
        draw: sceneLegend
    },

    {
        start: 630,
        end: 670,
        draw: sceneFragment
    },

    {
        start: 670,
        end: 810,
        draw: sceneRoad
    },

    {
        start: 810,
        end: 900,
        draw: sceneYalhesApproach
    }

];


/* =========================================================
   LEGENDAS / DIÁLOGOS
========================================================= */

const dialogue = [

    {
        start: 5,
        end: 13,
        text:
            "Há lugares onde a força de um homem é medida pela lâmina que carrega."
    },

    {
        start: 14,
        end: 23,
        text:
            "Em Ghydaway, não."
    },

    {
        start: 24,
        end: 34,
        text:
            "Aqui, desde os tempos antigos, a mana passou a definir o destino dos homens."
    },

    {
        start: 35,
        end: 45,
        text:
            "Aqueles que aprenderam a dominá-la construíram reinos."
    },

    {
        start: 46,
        end: 55,
        text:
            "Aqueles que não conseguiram... perderam os seus."
    },


    {
        start: 155,
        end: 165,
        text:
            "Yalhes. A mais poderosa nação de guerreiros mágicos."
    },

    {
        start: 175,
        end: 187,
        text:
            "Em suas fronteiras, apenas aqueles capazes de controlar mana são enviados para a guerra."
    },


    {
        start: 250,
        end: 263,
        text:
            "Mana não serve apenas para lançar feitiços."
    },

    {
        start: 265,
        end: 278,
        text:
            "Ela pode fortalecer o corpo, acelerar os sentidos e transformar um homem comum em uma arma."
    },

    {
        start: 290,
        end: 302,
        text:
            "E alguém sem mana?"
    },

    {
        start: 304,
        end: 319,
        text:
            "Pode ser um excelente ferreiro. Um comerciante. Um agricultor."
    },

    {
        start: 320,
        end: 335,
        text:
            "Mas no campo de batalha... Yalhes não envia homens esperando que voltem em caixões."
    },


    {
        start: 365,
        end: 378,
        text:
            "Encontramos vestígios de uma magia que não pertence a nenhum reino conhecido."
    },

    {
        start: 385,
        end: 397,
        text:
            "De onde?"
    },

    {
        start: 398,
        end: 410,
        text:
            "Do norte."
    },

    {
        start: 412,
        end: 425,
        text:
            "Então alguém sobreviveu."
    },


    {
        start: 475,
        end: 490,
        text:
            "Existem magias que até mesmo Yalhes prefere fingir que não existem."
    },


    {
        start: 565,
        end: 580,
        text:
            "Dizem que havia uma vila escondida entre as montanhas."
    },

    {
        start: 581,
        end: 595,
        text:
            "Uma vila onde crianças nasciam com uma quantidade absurda de mana."
    },

    {
        start: 596,
        end: 610,
        text:
            "Um dia, ela simplesmente desapareceu."
    },


    {
        start: 680,
        end: 690,
        text:
            "Quanto falta?"
    },

    {
        start: 691,
        end: 702,
        text:
            "Se continuar perguntando, vai parecer mais longe."
    },

    {
        start: 703,
        end: 711,
        text:
            "Não respondeu."
    },

    {
        start: 712,
        end: 723,
        text:
            "Dois dias."
    },


    {
        start: 730,
        end: 740,
        text:
            "Você já esteve lá?"
    },

    {
        start: 741,
        end: 750,
        text:
            "Já."
    },

    {
        start: 751,
        end: 760,
        text:
            "Quantas vezes?"
    },

    {
        start: 761,
        end: 771,
        text:
            "Mais do que gostaria."
    },


    {
        start: 780,
        end: 793,
        text:
            "Por que você está indo comigo?"
    },

    {
        start: 794,
        end: 804,
        text:
            "Porque alguém precisa."
    },

    {
        start: 805,
        end: 813,
        text:
            "Isso não é resposta."
    },

    {
        start: 814,
        end: 824,
        text:
            "É a única que você vai receber hoje."
    },


    {
        start: 830,
        end: 842,
        text:
            "Quando chegarmos... não conte a ninguém sobre sua vila."
    },

    {
        start: 843,
        end: 852,
        text:
            "Por quê?"
    },

    {
        start: 853,
        end: 865,
        text:
            "Porque algumas pessoas em Yalhes sabem mais sobre ela do que deveriam."
    }

];


/* =========================================================
   ATUALIZAR LEGENDA
========================================================= */

function updateDialogue() {

    const current =
        dialogue.find(d =>
            episodeTime >= d.start &&
            episodeTime <= d.end
        );

    if (!current) {

        subtitleText.style.opacity = "0";

        return;
    }

    if (subtitleText.textContent !== current.text) {

        subtitleText.textContent =
            current.text;

        subtitleText.style.opacity = "1";
    }
}


/* =========================================================
   DESENHAR CENA
========================================================= */

function drawCurrentScene() {

    ctx.clearRect(
        0,
        0,
        W,
        H
    );

    const scene =
        scenes.find(s =>
            episodeTime >= s.start &&
            episodeTime < s.end
        );

    if (scene) {
        scene.draw();
    }

    /* vinheta */

    const vignette =
        ctx.createRadialGradient(
            W / 2,
            H / 2,
            H * .2,
            W / 2,
            H / 2,
            H * .8
        );

    vignette.addColorStop(
        0,
        "rgba(0,0,0,0)"
    );

    vignette.addColorStop(
        1,
        "rgba(0,0,0,.7)"
    );

    ctx.fillStyle = vignette;

    ctx.fillRect(
        0,
        0,
        W,
        H
    );
}


/* =========================================================
   FINAL
========================================================= */

function finishEpisode() {

    playing = false;

    subtitleText.style.opacity = "0";

    episodeTitle.style.opacity = "0";

    startEpisode.style.display = "flex";

    startButton.textContent =
        "↻ RECOMEÇAR";

    startEpisode.querySelector("span").textContent =
        "FIM DO EPISÓDIO 01";

    startEpisode.querySelector("h1").textContent =
        "O CAMINHO PARA YALHES";

    sound(120, 1);
}


/* =========================================================
   LOOP PRINCIPAL
========================================================= */

function loop(now) {

    requestAnimationFrame(loop);

    const delta =
        (now - lastFrame) / 1000;

    lastFrame = now;

    if (!playing || paused) {

        drawCurrentScene();

        return;
    }

    episodeTime += delta;

    drawCurrentScene();

    updateDialogue();

    /* título */

    if (episodeTime > 2) {
        episodeTitle.style.opacity = "1";
    }

    /* fim */

    if (episodeTime >= EPISODE_DURATION) {

        episodeTime =
            EPISODE_DURATION;

        finishEpisode();
    }
}


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

requestAnimationFrame(loop);