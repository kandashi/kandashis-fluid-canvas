let KFCSocket
const KFC = "kandashis-fluid-canvas"
Hooks.once("socketlib.ready", () => {
    KFCSocket = socketlib.registerModule(KFC);
    KFCSocket.register("earthquake", FluidCanvas.earthquake)
    KFCSocket.register("heartbeat", FluidCanvas.heartBeat)
    KFCSocket.register("drug", FluidCanvas.drug)
    KFCSocket.register("spin", FluidCanvas.spin)
    KFCSocket.register("filters", FluidCanvas.updateFilters)
    KFCSocket.register("fade", FluidCanvas.fade)

});

Hooks.on("init", () => {
    CONFIG.Canvas.layers = foundry.utils.mergeObject(CONFIG.Canvas.layers, {
        fluidCanvas: KFCLayer
    });
    if (!Object.is(Canvas.layers, CONFIG.Canvas.layers)) {
        console.error('Possible incomplete layer injection by other module detected! Trying workaround...')

        const layers = Canvas.layers
        Object.defineProperty(Canvas, 'layers', {
            get: function () {
                return foundry.utils.mergeObject(layers, CONFIG.Canvas.layers)
            }
        })
    }
})


Hooks.on("canvasReady", () => {
    FluidCanvas.updateFilters()
})

Hooks.on('getSceneControlButtons', (controls) => {
    const FluidEffects = [
        {
            name: "earthquake",
            title: game.i18n.localize("KFC.earthquake"),
            icon: "fas fa-mountain",
            onClick: () => {
                FluidCanvas.keyCheck("earthquake")
            },
            button: true
        },
        {
            name: "heartbeat",
            title: game.i18n.localize("KFC.HeartBeat"),
            icon: "fas fa-heartbeat",
            onClick: () => {
                FluidCanvas.keyCheck("heartbeat")
            },
            button: true
        },
        {
            name: "spin",
            title: game.i18n.localize("KFC.Spin"),
            icon: "fas fa-undo",
            onClick: () => {
                FluidCanvas.keyCheck("spin")
            },
            button: true
        },
        {
            name: "sepia",
            title: game.i18n.localize("KFC.Sepia"),
            icon: "fas fa-film",
            onClick: () => {
                FluidCanvas.sepia()
            },
            button: true,
            toggle: true
        },
        {
            name: "negative",
            title: game.i18n.localize("KFC.Negative"),
            icon: "fas fa-photo-video",
            onClick: () => {
                FluidCanvas.negative()
            },
            button: true,
            toggle: true
        },
        {
            name: "blur",
            title: game.i18n.localize("KFC.Blur"),
            icon: "fas fa-braille",
            onClick: () => {
                const k = game.keyboard
                let intensity = k._downKeys.has("=") ? 2 : k._downKeys.has("-") ? 0.5 : 1
                FluidCanvas.blur(intensity)
            },
            button: true,
            toggle: true
        },
        {
            name: "fade",
            title: game.i18n.localize("KFC.Fade"),
            icon: "fas fa-low-vision",
            onClick: () => {
                FluidCanvas.keyCheck("fade")
            },
            button: true,
            toggle: true
        },
        {
            name: "drugged",
            title: game.i18n.localize("KFC.Drugged"),
            icon: "fas fa-syringe",
            onClick: () => {
                FluidCanvas.keyCheck("drug")
            },
            button: true,
            toggle: true
        },
    
    
    ]
    controls.push({
        name: "fluidCanvas",
        title: "FluidCanvas",
        icon: "fas fa-wind",
        layer: "fluidCanvas",
        visible: game.user.isGM,
        tools: FluidEffects
    })
});

class KFCLayer extends CanvasLayer {
    constructor() {
        super();
        this.loader = new PIXI.Loader();

        this.mouseInteractionManager = null;

        this._interactiveChildren = false;
        this._dragging = false;

        this.options = this.constructor.layerOptions;

    }
}

class FluidCanvas {

    static keyCheck(type) {
        this.type = type
        const k = game.keyboard
        const dialog = k._downKeys.has("Shift") ? true : false
        this.intensity = k._downKeys.has("=") || k._downKeys.has("+") ? 2 : k._downKeys.has("-") || k._downKeys.has("_") ? 0.5 : 1
        if (dialog) {
            this.fluidDialog()
        }
        else (KFCSocket.executeForEveryone(this.type, this.intensity))
    }
    static fluidDialog() {
        let mouse = canvas.app.renderer.plugins.interaction.mouse.originalEvent;
        let playerList = game.users.contents.reduce((a, v) => { if (v.active) { return a += `<div><input type="checkbox" id="name" checked value="${v.id}">${v.name}</input></div>` } else return a }, "")
        let contents = `<form> 
            <div class="flexcol"> 
                ${playerList}
            </div>
        </form>`
        new Dialog({
            title: game.i18n.localize("KFC.PlayerChoice"),
            content: contents,
            buttons: {
                one: {
                    label: game.i18n.localize("KFC.Launch"),
                    icon: `<i class="fas fa-wind"></i>`,
                    callback: (html) => {
                        var users = $('input[type="checkbox"]:checked').map(function () {
                            return $(this).val();
                        }).get()
                        KFCSocket.executeForUsers(this.type, users, this.intensity)
                    }
                }
            }
        }, { left: mouse.clientX + 15, top: mouse.clientY - 20 }).render(true,)
    }

    static earthquake(intensity) {
        let a = 1 * intensity
        let b = 2 * intensity
        let c = 3 * intensity
        document.getElementById("board").animate([
            // keyframes
            { transform: `translate(${a}px, ${a}px) rotate(0deg)` },
            { transform: `translate(-${a}px, -${b}px) rotate(-${a}deg)` },
            { transform: `translate(-${c}px, 0px) rotate(${a}deg)` },
            { transform: `translate(${c}px, ${b}px) rotate(0deg)` },
            { transform: `translate(${a}px, -${a}px) rotate(${a}deg)` },
            { transform: `translate(-${a}px, ${b}px) rotate(-${a}deg)` },
            { transform: `translate(-${c}px, ${a}px) rotate(0deg)` },
            { transform: `translate(${c}px, ${a}px) rotate(-${a}deg)` },
            { transform: `translate(-${a}px, -${a}px) rotate(${a}deg)` },
            { transform: `translate(${a}px, ${b}px) rotate(0de)` },
            { transform: `translate(${a}px, -${b}px) rotate(-${a}deg)` }

        ], {
            // timing options
            duration: 500,
            iterations: 3
        });
    }

    static heartBeat(intensity) {
        let a = intensity > 1 ? 1.2 : intensity < 1 ? 1.05 : 1.1
        let b = intensity > 1 ? 1.1 : intensity < 1 ? 1.025 : 1.05
        document.getElementById("board").animate([
            // keyframes
            { transform: `scale(1)` },
            { transform: `scale(${a})` },
            { transform: `scale(1)` },
            { transform: `scale(${b})` },
            { transform: `scale(1)` },
        ], {
            // timing options
            duration: 1500,
            iterations: 3,
            ease: "ease",
        });
    }

    static spin(intensity) {
        document.getElementById("board").animate([
            // keyframes
            { transform: `rotate(0deg)` },
            { transform: `rotate(360deg)` },
        ], {
            // timing options
            duration: 400 / intensity,
            iterations: 3
        });
    }

    static drug(intensity) {
        let a = 1 * intensity
        let b = 2 * intensity
        let c = 3 * intensity
        const board = document.getElementById("board")
        const currentAnim = board.getAnimations().find(i => i.id === "drugged")
        if (currentAnim) currentAnim.cancel()
        else {
            board.animate([
                // keyframes
                { filter: `hue-rotate(45deg) blur(${a}px)`, transform: `rotate(${a}deg)` },
                { filter: `hue-rotate(-45deg) blur(${a}px)`, transform: `rotate(-${a}deg)` },
                { filter: `hue-rotate(45deg) blur(${a}px)`, transform: `rotate(${a}deg)` },
            ], {
                // timing options
                duration: 10000,
                iterations: Infinity,
                id: "drugged"
            });
        }
    }

    static fade() {
        const board = document.getElementById("board")
        board.classList.toggle("fade")
    }

    static async sepia() {
        let toggle = canvas.scene.getFlag(KFC, "sepia")?.active
        await canvas.scene.setFlag(KFC, "sepia", { active: !toggle, value: "sepia(1)" })
        KFCSocket.executeForEveryone("filters")
    }
    static async blur(intensity) {
        let b = 2 * intensity
        let toggle = canvas.scene.getFlag(KFC, "blur")?.active
        await canvas.scene.setFlag(KFC, "blur", { active: !toggle, value: `blur(${b}px)` })
        KFCSocket.executeForEveryone("filters")
    }

    static async negative() {
        let toggle = canvas.scene.getFlag(KFC, "negative")?.active
        await canvas.scene.setFlag(KFC, "negative", { active: !toggle, value: "invert(100%)" })
        KFCSocket.executeForEveryone("filters")
    }

    static async black() {
        let toggle = canvas.scene.getFlag(KFC, "black")?.active
        await canvas.scene.setFlag(KFC, "black", { active: !toggle, value: "brightness(0)" })
        KFCSocket.executeForEveryone("filters")
    }


    static customFilter(frames, duration, iterations) {
        document.getElementById("board").animate(frames, {
            // timing options
            duration: duration,
            iterations: iterations
        });
    }

    static updateFilters() {
        let filters = canvas.scene.data.flags[KFC]
        let filter
        if (filters) {
            filter = Object.values(filters).reduce((a, { active, value }) => { if (active) return a += value; else return a }, "")
        }
        else filter = ""
        document.getElementById("board").style.filter = filter
    }

}
