/* =========================================================
   GHYDANIMATE
   EDITOR DE ANIMAÇÃO 2D
   V1.0
========================================================= */


/* =========================================================
   ELEMENTOS
========================================================= */

const homeScreen =
    document.getElementById("homeScreen");

const editor =
    document.getElementById("editor");

const createButton =
    document.getElementById("createButton");

const loadButton =
    document.getElementById("loadButton");

const canvas =
    document.getElementById("animationCanvas");

const ctx =
    canvas.getContext("2d");

const canvasContainer =
    document.getElementById("canvasContainer");

const timelineFrames =
    document.getElementById("timelineFrames");

const currentFrameLabel =
    document.getElementById("currentFrameLabel");

const durationLabel =
    document.getElementById("durationLabel");

const jointInfo =
    document.getElementById("jointInfo");

const message =
    document.getElementById("message");

const captureBox =
    document.getElementById("captureBox");


/* =========================================================
   BOTÕES
========================================================= */

const undoButton =
    document.getElementById("undoButton");

const redoButton =
    document.getElementById("redoButton");

const saveButton =
    document.getElementById("saveButton");

const fullscreenButton =
    document.getElementById("fullscreenButton");

const backHomeButton =
    document.getElementById("backHomeButton");

const clearButton =
    document.getElementById("clearButton");

const gridButton =
    document.getElementById("gridButton");

const onionButton =
    document.getElementById("onionButton");

const captureButton =
    document.getElementById("captureButton");

const playButton =
    document.getElementById("playButton");

const firstFrameButton =
    document.getElementById("firstFrameButton");

const previousFrameButton =
    document.getElementById("previousFrameButton");

const nextFrameButton =
    document.getElementById("nextFrameButton");

const lastFrameButton =
    document.getElementById("lastFrameButton");

const addFrameButton =
    document.getElementById("addFrameButton");

const deleteFrameButton =
    document.getElementById("deleteFrameButton");

const fpsInput =
    document.getElementById("fpsInput");

const brushSize =
    document.getElementById("brushSize");

const brushSizeLabel =
    document.getElementById("brushSizeLabel");

const brushColor =
    document.getElementById("brushColor");


/* =========================================================
   CONFIGURAÇÃO
========================================================= */

const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 720;

const MAX_FRAMES = 240;


/* =========================================================
   ESTADO
========================================================= */

let currentFrame = 0;

let fps = 24;

let playing = false;

let animationTimer = null;

let currentTool = "draw";

let drawing = false;

let lastPoint = null;

let showGrid = false;

let onionSkin = false;

let captureMode = false;

let selectedJoint = null;

let draggingJoint = false;


/* =========================================================
   FRAMES
========================================================= */

let frames = [];


/*
    Cada frame possui:

    strokes:
        desenhos feitos pelo usuário

    joints:
        articulações

    duration:
        duração daquele frame
*/

function createEmptyFrame() {

    return {

        strokes: [],

        joints: [],

        duration: 1

    };

}


function initializeFrames() {

    frames = [];

    for (
        let i = 0;
        i < 12;
        i++
    ) {

        frames.push(
            createEmptyFrame()
        );

    }

}


initializeFrames();


/* =========================================================
   HISTÓRICO
========================================================= */

let undoStack = [];

let redoStack = [];


function saveHistory() {

    undoStack.push(
        JSON.stringify(frames)
    );

    if (
        undoStack.length > 50
    ) {

        undoStack.shift();

    }

    redoStack = [];

}


function undo() {

    if (
        undoStack.length === 0
    ) {

        showMessage(
            "Nada para desfazer."
        );

        return;

    }

    redoStack.push(
        JSON.stringify(frames)
    );

    frames =
        JSON.parse(
            undoStack.pop()
        );

    renderTimeline();

    drawFrame();

}


function redo() {

    if (
        redoStack.length === 0
    ) {

        showMessage(
            "Nada para refazer."
        );

        return;

    }

    undoStack.push(
        JSON.stringify(frames)
    );

    frames =
        JSON.parse(
            redoStack.pop()
        );

    renderTimeline();

    drawFrame();

}


/* =========================================================
   ENTRAR NO EDITOR
========================================================= */

createButton.addEventListener(
    "click",
    function () {

        homeScreen.classList.add(
            "hidden"
        );

        editor.classList.remove(
            "hidden"
        );

        resizeCanvas();

        renderTimeline();

        drawFrame();

    }
);


/* =========================================================
   VOLTAR
========================================================= */

backHomeButton.addEventListener(
    "click",
    function () {

        if (
            confirm(
                "Voltar ao menu? Salve o projeto antes."
            )
        ) {

            stopAnimation();

            editor.classList.add(
                "hidden"
            );

            homeScreen.classList.remove(
                "hidden"
            );

        }

    }
);


/* =========================================================
   CANVAS
========================================================= */

function resizeCanvas() {

    canvas.width =
        CANVAS_WIDTH;

    canvas.height =
        CANVAS_HEIGHT;

    drawFrame();

}


window.addEventListener(
    "resize",
    resizeCanvas
);


/* =========================================================
   COORDENADAS
========================================================= */

function getCanvasPoint(event) {

    const rect =
        canvas.getBoundingClientRect();

    let clientX;
    let clientY;

    if (
        event.touches &&
        event.touches.length > 0
    ) {

        clientX =
            event.touches[0].clientX;

        clientY =
            event.touches[0].clientY;

    } else {

        clientX =
            event.clientX;

        clientY =
            event.clientY;

    }

    return {

        x:
            (clientX - rect.left) *
            (CANVAS_WIDTH / rect.width),

        y:
            (clientY - rect.top) *
            (CANVAS_HEIGHT / rect.height)

    };

}


/* =========================================================
   DESENHO — MOUSE
========================================================= */

canvas.addEventListener(
    "mousedown",
    startDrawing
);

canvas.addEventListener(
    "mousemove",
    drawMove
);

window.addEventListener(
    "mouseup",
    stopDrawing
);


/* =========================================================
   DESENHO — TOUCH
========================================================= */

canvas.addEventListener(
    "touchstart",
    function (event) {

        event.preventDefault();

        startDrawing(event);

    },
    { passive: false }
);

canvas.addEventListener(
    "touchmove",
    function (event) {

        event.preventDefault();

        drawMove(event);

    },
    { passive: false }
);

canvas.addEventListener(
    "touchend",
    function (event) {

        event.preventDefault();

        stopDrawing();

    },
    { passive: false }
);


/* =========================================================
   COMEÇAR DESENHO
========================================================= */

function startDrawing(event) {

    if (playing) {
        return;
    }

    const point =
        getCanvasPoint(event);

    /*
        ARTICULAÇÃO
    */

    if (
        currentTool === "joint"
    ) {

        saveHistory();

        createJoint(
            point.x,
            point.y
        );

        drawFrame();

        return;

    }


    /*
        MOVER
    */

    if (
        currentTool === "move"
    ) {

        const joint =
            findJoint(
                point.x,
                point.y
            );

        if (joint) {

            selectedJoint =
                joint;

            draggingJoint = true;

            updateJointInfo();

        }

        return;

    }


    /*
        BORRACHA
    */

    if (
        currentTool === "erase"
    ) {

        saveHistory();

        eraseAt(
            point.x,
            point.y
        );

        drawFrame();

        return;

    }


    /*
        DESENHO
    */

    if (
        currentTool !== "draw"
    ) {

        return;

    }

    saveHistory();

    drawing = true;

    lastPoint = point;

    const stroke = {

        color:
            brushColor.value,

        size:
            Number(
                brushSize.value
            ),

        points: [
            point
        ]

    };

    frames[currentFrame]
        .strokes
        .push(stroke);

    drawFrame();

}


/* =========================================================
   MOVIMENTO DO DESENHO
========================================================= */

function drawMove(event) {

    if (playing) {
        return;
    }

    const point =
        getCanvasPoint(event);


    /*
        MOVENDO ARTICULAÇÃO
    */

    if (
        currentTool === "move" &&
        draggingJoint &&
        selectedJoint
    ) {

        selectedJoint.x =
            point.x;

        selectedJoint.y =
            point.y;

        drawFrame();

        updateJointInfo();

        return;

    }


    /*
        DESENHANDO
    */

    if (
        !drawing ||
        currentTool !== "draw"
    ) {

        return;

    }

    const stroke =
        frames[currentFrame]
            .strokes[
                frames[currentFrame]
                    .strokes.length - 1
            ];

    if (!stroke) {
        return;
    }

    stroke.points.push(
        point
    );

    drawFrame();

}


function stopDrawing() {

    drawing = false;

    draggingJoint = false;

    lastPoint = null;

}


/* =========================================================
   CRIAR ARTICULAÇÃO
========================================================= */

function createJoint(
    x,
    y
) {

    const joints =
        frames[currentFrame].joints;

    const id =
        Date.now() +
        Math.random();

    let parent = null;

    /*
        Se existir uma articulação
        próxima, ela vira o pai.
    */

    let nearest = null;

    let nearestDistance = 80;

    for (
        const joint of joints
    ) {

        const distance =
            Math.hypot(
                joint.x - x,
                joint.y - y
            );

        if (
            distance < nearestDistance
        ) {

            nearest =
                joint;

            nearestDistance =
                distance;

        }

    }

    if (nearest) {

        parent =
            nearest.id;

    }

    joints.push({

        id,

        x,

        y,

        parent,

        rotation: 0,

        name:
            `Articulação ${joints.length + 1}`

    });

    selectedJoint =
        joints[
            joints.length - 1
        ];

    updateJointInfo();

}


/* =========================================================
   ENCONTRAR ARTICULAÇÃO
========================================================= */

function findJoint(
    x,
    y
) {

    const joints =
        frames[currentFrame].joints;

    let nearest = null;

    let distanceMin = 30;

    for (
        const joint of joints
    ) {

        const distance =
            Math.hypot(
                joint.x - x,
                joint.y - y
            );

        if (
            distance < distanceMin
        ) {

            distanceMin =
                distance;

            nearest =
                joint;

        }

    }

    return nearest;

}


/* =========================================================
   APAGAR
========================================================= */

function eraseAt(
    x,
    y
) {

    const frame =
        frames[currentFrame];

    const eraseRadius =
        Number(
            brushSize.value
        ) * 3;


    frame.strokes =
        frame.strokes.filter(
            stroke => {

                return !stroke.points.some(
                    point => {

                        return (
                            Math.hypot(
                                point.x - x,
                                point.y - y
                            ) <
                            eraseRadius
                        );

                    }
                );

            }
        );

}


/* =========================================================
   DESENHAR FRAME
========================================================= */

function drawFrame() {

    ctx.clearRect(
        0,
        0,
        CANVAS_WIDTH,
        CANVAS_HEIGHT
    );


    /*
        FUNDO
    */

    ctx.fillStyle =
        "#181a1f";

    ctx.fillRect(
        0,
        0,
        CANVAS_WIDTH,
        CANVAS_HEIGHT
    );


    /*
        GRADE
    */

    if (showGrid) {

        drawGrid();

    }


    /*
        ONION SKIN
    */

    if (
        onionSkin &&
        currentFrame > 0
    ) {

        drawStrokes(
            frames[
                currentFrame - 1
            ].strokes,
            true
        );

    }


    /*
        DESENHO ATUAL
    */

    drawStrokes(
        frames[currentFrame].strokes,
        false
    );


    /*
        ARTICULAÇÕES
    */

    drawSkeleton();


    /*
        ÁREA DE CAPTURA
        É HTML, então permanece
        sobre o canvas.
    */

}


/* =========================================================
   DESENHAR TRAÇOS
========================================================= */

function drawStrokes(
    strokes,
    onion
) {

    for (
        const stroke of strokes
    ) {

        if (
            stroke.points.length === 0
        ) {

            continue;

        }

        ctx.beginPath();

        ctx.lineCap =
            "round";

        ctx.lineJoin =
            "round";

        ctx.lineWidth =
            stroke.size;

        ctx.strokeStyle =
            onion
                ? "rgba(80,150,255,0.25)"
                : stroke.color;

        ctx.moveTo(
            stroke.points[0].x,
            stroke.points[0].y
        );

        for (
            let i = 1;
            i < stroke.points.length;
            i++
        ) {

            ctx.lineTo(
                stroke.points[i].x,
                stroke.points[i].y
            );

        }

        ctx.stroke();

    }

}


/* =========================================================
   GRADE
========================================================= */

function drawGrid() {

    ctx.save();

    ctx.strokeStyle =
        "rgba(255,255,255,0.07)";

    ctx.lineWidth = 1;

    const size = 50;

    for (
        let x = 0;
        x < CANVAS_WIDTH;
        x += size
    ) {

        ctx.beginPath();

        ctx.moveTo(
            x,
            0
        );

        ctx.lineTo(
            x,
            CANVAS_HEIGHT
        );

        ctx.stroke();

    }

    for (
        let y = 0;
        y < CANVAS_HEIGHT;
        y += size
    ) {

        ctx.beginPath();

        ctx.moveTo(
            0,
            y
        );

        ctx.lineTo(
            CANVAS_WIDTH,
            y
        );

        ctx.stroke();

    }

    ctx.restore();

}


/* =========================================================
   ESQUELETO
========================================================= */

function drawSkeleton() {

    const joints =
        frames[currentFrame]
            .joints;

    /*
        Primeiro desenhamos as conexões.
    */

    for (
        const joint of joints
    ) {

        if (
            joint.parent === null
        ) {

            continue;

        }

        const parent =
            joints.find(
                j =>
                    j.id === joint.parent
            );

        if (!parent) {
            continue;
        }

        ctx.beginPath();

        ctx.moveTo(
            parent.x,
            parent.y
        );

        ctx.lineTo(
            joint.x,
            joint.y
        );

        ctx.lineWidth = 8;

        ctx.strokeStyle =
            "rgba(255,255,255,0.35)";

        ctx.stroke();

    }


    /*
        Depois os pontos.
    */

    for (
        const joint of joints
    ) {

        ctx.beginPath();

        ctx.arc(
            joint.x,
            joint.y,
            selectedJoint === joint
                ? 10
                : 7,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            selectedJoint === joint
                ? "#ffffff"
                : "#888";

        ctx.fill();

        ctx.strokeStyle =
            "#000";

        ctx.lineWidth = 2;

        ctx.stroke();

    }

}


/* =========================================================
   INFORMAÇÃO DA ARTICULAÇÃO
========================================================= */

function updateJointInfo() {

    if (!selectedJoint) {

        jointInfo.textContent =
            "Nenhuma articulação selecionada.";

        return;

    }

    jointInfo.innerHTML = `
        <strong>${selectedJoint.name}</strong><br><br>
        X: ${Math.round(selectedJoint.x)}<br>
        Y: ${Math.round(selectedJoint.y)}<br>
        Rotação: ${Math.round(selectedJoint.rotation)}°
    `;

}


/* =========================================================
   FERRAMENTAS
========================================================= */

document
    .querySelectorAll(".tool")
    .forEach(
        button => {

            button.addEventListener(
                "click",
                function () {

                    const tool =
                        this.dataset.tool;

                    if (!tool) {
                        return;
                    }

                    currentTool =
                        tool;

                    document
                        .querySelectorAll(".tool")
                        .forEach(
                            b =>
                                b.classList.remove(
                                    "active"
                                )
                        );

                    this.classList.add(
                        "active"
                    );

                    updateCursor();

                }
            );

        }
    );


function updateCursor() {

    if (
        currentTool === "draw"
    ) {

        canvas.style.cursor =
            "crosshair";

    }

    else if (
        currentTool === "erase"
    ) {

        canvas.style.cursor =
            "cell";

    }

    else if (
        currentTool === "joint"
    ) {

        canvas.style.cursor =
            "copy";

    }

    else if (
        currentTool === "move"
    ) {

        canvas.style.cursor =
            "grab";

    }

    else {

        canvas.style.cursor =
            "default";

    }

}


/* =========================================================
   TIMELINE
========================================================= */

function renderTimeline() {

    timelineFrames.innerHTML =
        "";

    frames.forEach(
        (frame, index) => {

            const element =
                document.createElement(
                    "div"
                );

            element.className =
                "frame";

            if (
                index === currentFrame
            ) {

                element.classList.add(
                    "active"
                );

            }

            if (
                frame.strokes.length > 0 ||
                frame.joints.length > 0
            ) {

                element.classList.add(
                    "has-content"
                );

            }

            if (
                frame.strokes.length > 0 ||
                frame.joints.length > 0
            ) {

                element.classList.add(
                    "keyframe"
                );

            }

            element.innerHTML = `
                <span class="frame-number-label">
                    ${index}
                </span>

                <div class="frame-content"></div>
            `;

            element.addEventListener(
                "click",
                function () {

                    currentFrame =
                        index;

                    selectedJoint =
                        null;

                    updateJointInfo();

                    renderTimeline();

                    drawFrame();

                }
            );

            timelineFrames.appendChild(
                element
            );

        }
    );

    currentFrameLabel.textContent =
        `FRAME ${currentFrame}`;

    durationLabel.textContent =
        `${frames.length} frames`;

}


/* =========================================================
   ADICIONAR FRAME
========================================================= */

addFrameButton.addEventListener(
    "click",
    function () {

        if (
            frames.length >= MAX_FRAMES
        ) {

            showMessage(
                "Limite de frames atingido."
            );

            return;

        }

        saveHistory();

        /*
            O novo frame começa vazio.
        */

        frames.splice(
            currentFrame + 1,
            0,
            createEmptyFrame()
        );

        currentFrame++;

        renderTimeline();

        drawFrame();

    }
);


/* =========================================================
   EXCLUIR FRAME
========================================================= */

deleteFrameButton.addEventListener(
    "click",
    function () {

        if (
            frames.length <= 1
        ) {

            return;

        }

        saveHistory();

        frames.splice(
            currentFrame,
            1
        );

        if (
            currentFrame >= frames.length
        ) {

            currentFrame =
                frames.length - 1;

        }

        renderTimeline();

        drawFrame();

    }
);


/* =========================================================
   NAVEGAÇÃO
========================================================= */

firstFrameButton.addEventListener(
    "click",
    function () {

        currentFrame = 0;

        renderTimeline();

        drawFrame();

    }
);


previousFrameButton.addEventListener(
    "click",
    function () {

        if (
            currentFrame > 0
        ) {

            currentFrame--;

            renderTimeline();

            drawFrame();

        }

    }
);


nextFrameButton.addEventListener(
    "click",
    function () {

        if (
            currentFrame <
            frames.length - 1
        ) {

            currentFrame++;

            renderTimeline();

            drawFrame();

        }

    }
);


lastFrameButton.addEventListener(
    "click",
    function () {

        currentFrame =
            frames.length - 1;

        renderTimeline();

        drawFrame();

    }
);


/* =========================================================
   REPRODUÇÃO
========================================================= */

playButton.addEventListener(
    "click",
    function () {

        if (playing) {

            stopAnimation();

        } else {

            startAnimation();

        }

    }
);


function startAnimation() {

    playing = true;

    playButton.textContent =
        "❚❚";

    let frameDuration =
        1000 / fps;

    let lastTime =
        performance.now();

    function loop(time) {

        if (!playing) {
            return;
        }

        if (
            time - lastTime >=
            frameDuration
        ) {

            currentFrame++;

            if (
                currentFrame >=
                frames.length
            ) {

                currentFrame = 0;

            }

            renderTimeline();

            drawFrame();

            lastTime = time;

        }

        animationTimer =
            requestAnimationFrame(
                loop
            );

    }

    animationTimer =
        requestAnimationFrame(
            loop
        );

}


function stopAnimation() {

    playing = false;

    playButton.textContent =
        "▶";

    if (
        animationTimer
    ) {

        cancelAnimationFrame(
            animationTimer
        );

        animationTimer =
            null;

    }

}


/* =========================================================
   FPS
========================================================= */

fpsInput.addEventListener(
    "change",
    function () {

        fps =
            Math.max(
                1,
                Math.min(
                    60,
                    Number(
                        this.value
                    )
                )
            );

        this.value =
            fps;

    }
);


/* =========================================================
   TAMANHO DO PINCEL
========================================================= */

brushSize.addEventListener(
    "input",
    function () {

        brushSizeLabel.textContent =
            `${this.value}px`;

    }
);


/* =========================================================
   LIMPAR
========================================================= */

clearButton.addEventListener(
    "click",
    function () {

        if (
            !confirm(
                "Apagar todo o desenho deste frame?"
            )
        ) {

            return;

        }

        saveHistory();

        frames[currentFrame]
            .strokes = [];

        frames[currentFrame]
            .joints = [];

        selectedJoint =
            null;

        updateJointInfo();

        drawFrame();

        renderTimeline();

    }
);


/* =========================================================
   GRADE
========================================================= */

gridButton.addEventListener(
    "click",
    function () {

        showGrid =
            !showGrid;

        gridButton.textContent =
            showGrid
                ? "⊞ Grade ON"
                : "⊞ Grade";

        drawFrame();

    }
);


/* =========================================================
   ONION SKIN
========================================================= */

onionButton.addEventListener(
    "click",
    function () {

        onionSkin =
            !onionSkin;

        onionButton.textContent =
            onionSkin
                ? "👻 Onion ON"
                : "👻 Onion Skin";

        drawFrame();

    }
);


/* =========================================================
   ÁREA DE CAPTURA
========================================================= */

captureButton.addEventListener(
    "click",
    function () {

        captureMode =
            !captureMode;

        if (captureMode) {

            captureBox.classList.remove(
                "hidden"
            );

            captureButton.textContent =
                "🎥 Captura ON";

            showMessage(
                "Área de captura ativada."
            );

        } else {

            captureBox.classList.add(
                "hidden"
            );

            captureButton.textContent =
                "🎥 Área de captura";

        }

    }
);


/* =========================================================
   SALVAR
========================================================= */

saveButton.addEventListener(
    "click",
    saveProject
);


function saveProject() {

    const project = {

        version:
            "1.0",

        width:
            CANVAS_WIDTH,

        height:
            CANVAS_HEIGHT,

        fps,

        frames

    };

    localStorage.setItem(
        "ghydanimate_project",
        JSON.stringify(
            project
        )
    );

    showMessage(
        "💾 Projeto salvo!"
    );

}


/* =========================================================
   CARREGAR
========================================================= */

loadButton.addEventListener(
    "click",
    function () {

        const saved =
            localStorage.getItem(
                "ghydanimate_project"
            );

        if (!saved) {

            showMessage(
                "Nenhum projeto salvo."
            );

            return;

        }

        try {

            const project =
                JSON.parse(saved);

            frames =
                project.frames ||
                [];

            fps =
                project.fps ||
                24;

            fpsInput.value =
                fps;

            currentFrame = 0;

            homeScreen.classList.add(
                "hidden"
            );

            editor.classList.remove(
                "hidden"
            );

            resizeCanvas();

            renderTimeline();

            drawFrame();

            showMessage(
                "💾 Projeto carregado!"
            );

        } catch (error) {

            console.error(error);

            showMessage(
                "Erro ao carregar projeto."
            );

        }

    }
);


/* =========================================================
   DESFAZER / REFAZER
========================================================= */

undoButton.addEventListener(
    "click",
    undo
);

redoButton.addEventListener(
    "click",
    redo
);


/* =========================================================
   TELA CHEIA
========================================================= */

fullscreenButton.addEventListener(
    "click",
    function () {

        if (
            !document.fullscreenElement
        ) {

            document
                .documentElement
                .requestFullscreen();

        } else {

            document.exitFullscreen();

        }

    }
);


/* =========================================================
   MENSAGENS
========================================================= */

let messageTimer = null;


function showMessage(
    text
) {

    message.textContent =
        text;

    message.classList.remove(
        "hidden"
    );

    clearTimeout(
        messageTimer
    );

    messageTimer =
        setTimeout(
            function () {

                message.classList.add(
                    "hidden"
                );

            },
            2000
        );

}


/* =========================================================
   TECLADO
========================================================= */

document.addEventListener(
    "keydown",
    function (event) {

        /*
            CTRL + Z
        */

        if (
            event.ctrlKey &&
            event.key.toLowerCase() === "z"
        ) {

            event.preventDefault();

            undo();

        }


        /*
            CTRL + Y
        */

        if (
            event.ctrlKey &&
            event.key.toLowerCase() === "y"
        ) {

            event.preventDefault();

            redo();

        }


        /*
            ESPAÇO
        */

        if (
            event.code === "Space" &&
            !event.target.matches("input")
        ) {

            event.preventDefault();

            if (playing) {

                stopAnimation();

            } else {

                startAnimation();

            }

        }


        /*
            SETA DIREITA
        */

        if (
            event.key === "ArrowRight"
        ) {

            if (
                currentFrame <
                frames.length - 1
            ) {

                currentFrame++;

                renderTimeline();

                drawFrame();

            }

        }


        /*
            SETA ESQUERDA
        */

        if (
            event.key === "ArrowLeft"
        ) {

            if (
                currentFrame > 0
            ) {

                currentFrame--;

                renderTimeline();

                drawFrame();

            }

        }

    }
);


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

renderTimeline();

resizeCanvas();

updateCursor();

console.log(
    "GhydAnimate V1.0 carregado."
);