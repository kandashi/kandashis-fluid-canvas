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
    KFCSocket.register("sepia", FluidCanvas.sepia)
    KFCSocket.register("drug", FluidCanvas.drug)
    KFCSocket.register("negative", FluidCanvas.negative)
    KFCSocket.register("blur", FluidCanvas.blur)
    window.KFC = KFCSocket
});




Hooks.on("canvasReady", () => {
    FluidCanvas.updateFilters()
})

Hooks.on('getSceneControlButtons', (controls, a, b) => {
    if (!canvas.scene) return;
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
            title: game.i18n.localize("KFC.heartBeat"),
            icon: "fas fa-heartbeat",
            onClick: () => {
                FluidCanvas.keyCheck("heartbeat")
            },
            button: true
        },
        {
            name: "spin",
            title: game.i18n.localize("KFC.spin"),
            icon: "fas fa-undo",
            onClick: () => {
                FluidCanvas.keyCheck("spin")
            },
            button: true
        },
        {
            name: "sepia",
            title: game.i18n.localize("KFC.sepia"),
            icon: "fas fa-film",
            onClick: () => {
                FluidCanvas.keyCheck("sepia", true)
            },
            button: true,
            toggle: true,
            active: canvas.scene.getFlag(KFC, "sepia")?.active

        },
        {
            name: "negative",
            title: game.i18n.localize("KFC.negative"),
            icon: "fas fa-photo-video",
            onClick: () => {
                FluidCanvas.keyCheck("negative", true)
            },
            button: true,
            toggle: true,
            active: canvas.scene.getFlag(KFC, "negative")?.active
        },
        {
            name: "blur",
            title: game.i18n.localize("KFC.blur"),
            icon: "fas fa-braille",
            onClick: () => {
                FluidCanvas.keyCheck("blur", true)
            },
            button: true,
            toggle: true,
            active: canvas.scene.getFlag(KFC, "blur")?.active

        },
        {
            name: "fade",
            title: game.i18n.localize("KFC.fade"),
            icon: "fas fa-low-vision",
            onClick: () => {
                FluidCanvas.keyCheck("fade", true)
            },
            button: true,
            toggle: true,
            active: canvas.scene.getFlag(KFC, "fade")?.active

        },
        {
            name: "drugged",
            title: game.i18n.localize("KFC.drug"),
            icon: "fas fa-syringe",
            onClick: () => {
                FluidCanvas.keyCheck("drug", true)
            },
            button: true,
            toggle: true,
            active: canvas.scene.getFlag(KFC, "drug")?.active

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


class KFCLayerv10 extends InteractionLayer {
    constructor() {
        super();
        this.loader = new PIXI.Loader();

        this.mouseInteractionManager = null;

        this._interactiveChildren = false;
        this._dragging = false;

        this.options = this.constructor.layerOptions;

    }

    async _draw(options) {
    }
}

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

    static keyCheck(type, toggle) {
        let inc = ["Equal", "AltLeft"]
        let dec = ["Minus", "ControlLeft"]
        this.type = type
        this.toggle = toggle
        const k = game.keyboard
        const dialog = game.release.generation >= 10 ? k.downKeys.has("ShiftLeft") : k.downKeys.has("Shift")
        const dK = Array.from(k.downKeys)
        this.intensity = inc.some(i => dK.includes(i)) ? 2 : dec.some(i => dK.includes(i)) ? 0.5 : 1
        console.log(dialog)
        if (dialog) {
            this.fluidDialog()
        }   
        else if(toggle) {
            let users = game.users.map(i => i.id)
            KFCSocket.executeAsGM(this.type, users, this.intensity)
        }
        else if (!toggle) (KFCSocket.executeForEveryone(this.type, this.intensity))

    }
    static fluidDialog() {
        let mouse = canvas.app.renderer.plugins.interaction.mouse.originalEvent;
        let current = canvas.scene.getFlag(KFC, this.type)
        let playerList = game?.users?.contents.reduce((a, v) => {
            let effActive = current?.users?.includes(v.id) && current.active
            if (v.active) {
                return a += `<div><input type="checkbox" id="name" checked value="${v.id}">${v.name}${effActive ? "(Active)" : ""}</input></div>`
            } else return a
        }
            , "")
        let contents = `<form> 
            <div class="flexcol"> 
                ${playerList}
            </div>
        </form>`
        new Dialog({
            title: `${game.i18n.localize("KFC.PlayerChoice")}, ${game.i18n.localize(`KFC.${this.type}`)}`,
            content: contents,
            buttons: {
                one: {
                    label: `${game.i18n.localize("KFC.Launch")}`,
                    icon: `<i class="fas fa-wind"></i>`,
                    callback: (html) => {
                        let users = $('input[type="checkbox"]:checked').map(function () {
                            return $(this).val();
                        }).get()
                        if (this.toggle) {
                            KFCSocket.executeAsGM(this.type, users, this.intensity)
                        }
                        else {
                            KFCSocket.executeForUsers(this.type, users, this.intensity)
                        }
                    }
                }
            }
        }, { left: mouse.clientX + 15, top: mouse.clientY - 20 }).render(true,)
    }

    static earthquake(intensity, duration = 500, iteration = 3) {
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
            { transform: `translate(${a}px, ${b}px) rotate(0deg)` },
            { transform: `translate(${a}px, -${b}px) rotate(-${a}deg)` }

        ], {
            // timing options
            duration: duration,
            iterations: iteration
        });
    }

    static heartBeat(intensity, duration = 1500, iteration = 3) {
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
            duration: duration,
            iterations: iteration,
            ease: "ease",
        });
    }

    static spin(intensity, duration = 400, iteration = 3) {
        document.getElementById("board").animate([
            // keyframes
            { transform: `rotate(0deg)` },
            { transform: `rotate(360deg)` },
        ], {
            // timing options
            duration: duration / intensity,
            iterations: iteration
        });
    }

    static async drugged(userID, active, intensity, duration = 10000, iteration = Infinity, ) {
        let a = 1 * intensity
        let b = 2 * intensity
        let c = 3 * intensity
        const board = document.getElementById("board")
        const currentAnim = board.getAnimations().find(i => i.id === "drugged")
        if (currentAnim && (!active || !userID.includes(game.user.id))) {
            currentAnim.cancel()
        }
        else if (userID.includes(game.user.id) && active) {
            board.animate([
                // keyframes
                { filter: `hue-rotate(45deg) blur(${a}px)`, transform: `rotate(${a}deg)` },
                { filter: `hue-rotate(-45deg) blur(${a}px)`, transform: `rotate(-${a}deg)` },
                { filter: `hue-rotate(45deg) blur(${a}px)`, transform: `rotate(${a}deg)` },
            ], {
                // timing options
                duration: duration,
                iterations: iteration,
                id: "drugged"
            });
        }
    }

    static fade() {
        const board = document.getElementById("board")
        board.classList.toggle("fade")
    }

    static async drug(userID, intensity, duration = 10000, iteration = Infinity){
        let toggle = canvas.scene.getFlag(KFC, "drug")?.active
        await canvas.scene.setFlag(KFC, "drug", { active: !toggle, intensity: intensity, duration: duration, iteration: iteration, users: userID })
        KFCSocket.executeForEveryone("filters")
    }

    static async sepia(userID) {
        let toggle = canvas.scene.getFlag(KFC, "sepia")?.active
        await canvas.scene.setFlag(KFC, "sepia", { active: !toggle, value: "sepia(1)", users: userID })
        KFCSocket.executeForEveryone("filters")
    }
    static async blur(userID, intensity,) {
        let b = 2 * intensity
        let toggle = canvas.scene.getFlag(KFC, "blur")?.active
        await canvas.scene.setFlag(KFC, "blur", { active: !toggle, value: `blur(${b}px)`, users: userID })
        KFCSocket.executeForEveryone("filters")
    }

    static async negative(userID) {
        let toggle = canvas.scene.getFlag(KFC, "negative")?.active
        await canvas.scene.setFlag(KFC, "negative", { active: !toggle, value: "invert(100%)", users: userID })
        KFCSocket.executeForEveryone("filters")
    }

    static async black(userID) {
        let toggle = canvas.scene.getFlag(KFC, "black")?.active
        await canvas.scene.setFlag(KFC, "black", { active: !toggle, value: "brightness(0)", users: userID })
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
        let drug = filters?.drug
        let filter
        if (filters) {
            filter = Object.values(filters).reduce((a, { active, value, users }) => { if (active && !!value && users.includes(game.user.id)) return a += value; else return a }, "")
        }
        else {
            filter = ""
        }
        document.getElementById("board").style.filter = filter
        if (drug) {
            drug.iteration = drug.iteration || "Infinity"
            FluidCanvas.drugged(drug.users, drug.active, drug.intensity, drug.duration, drug.iteration, false)
        }
    }

}
Hooks.on("init", () => {
    CONFIG.Canvas.layers["fluidCanvas"] = {group: `${game.release.generation >= 10 ? 'interface' : 'effects'}`, layerClass: (game.release.generation >= 10 ? KFCLayerv10 : KFCLayer)}

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
window.FluidCanvas = FluidCanvas
