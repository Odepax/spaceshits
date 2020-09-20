import { Page, PageRegistry } from "../page-registry.js"
import { GameKeeper } from "../../lore/game-keeper.js"
import { UserInputCaptureRoutine, UserInputRegistry } from "../user-input-capture.js"
import { RenderRoutine } from "../../graphic/render.js"
import { ShockwavePlayerAuxRoutine } from "../../lore/player-modules/shockwave.js"
import { GatlingPlayerWeaponRoutine } from "../../lore/player-weapons.js"
import { Universe } from "../../core/engine.js"
import { Player } from "../../lore/player.js"
import { Transform } from "../../math/transform.js"
import { Sprites } from "../../graphic/assets/sprites.js"
import { PlayerControlRoutine } from "../../logic/player-control.js"
import { MotionRoutine } from "../../physic/motion.js"
import { MainPage } from "./main.js"

export class SettingsPage extends Page {
	/** @param {PageRegistry} navigation @param {GameKeeper} game */
	constructor(navigation, game) {
		super()

		this.navigation = navigation
		this.game = game

		/** @private */
		this.originalKeyBindings = Object.assign({}, this.game.keyBindings)

		/** @private */
		this.keyLabels = {
			up: "Move up",
			left: "Move left",
			down: "Move down",
			right: "Move right",
			shoot: "Shoot",
			aux: "Use AUX module",
			pause: "Toggle pause"
		}

		/** @private */
		this.isPaused = false

		/** @private */
		this.togglePause = event => {
			if (event.code == this.game.keyBindings.pause) {
				event.preventDefault()

				this.isPaused
					? this.universe.then(u => u.start())
					: this.universe.then(u => u.stop())

				this.isPaused = !this.isPaused
			}
		}
	}

	onInstall() {
		for (const key of Object.getOwnPropertyNames(this.game.keyBindings)) {
			const binder = this.$["key-" + key]

			binder.addEventListener("mouseenter", () => {
				binder.focus()

				this.syncLegend(key)
			}, false)

			binder.addEventListener("mouseleave", () => {
				binder.blur()

				this.syncLegend(null)
			}, false)

			binder.addEventListener("keydown", ({ code }) => this.setBinding(key, code), false)
			binder.addEventListener("mousedown", ({ button }) => this.setBinding(key, UserInputRegistry.mouseButtonLabels[button]), false)
		}

		const testCanvas = this.$.testCanvas

		testCanvas.focus()
		testCanvas.addEventListener("mouseenter", () => testCanvas.focus(), false)
		testCanvas.addEventListener("mousedown", () => testCanvas.focus(), false)

		this.syncLegend(null)
	}

	/** @private @param {string} key @param {string} binding */
	setBinding(key, binding) {
		this.game.keyBindings[key] = binding
		this.syncLegend(key)
	}

	/** @private @param {string} key */
	syncLegend(key = null) {
		this.$.bindingLegend.innerHTML = key ? this.keyLabels[key] : "Hover over the fields <br/> and press keys to edit the bindings"
		this.$.bindingKey.textContent = key ? this.formatKey(this.game.keyBindings[key]) : null

		this.$.upKeyTooltip.textContent = this.formatKey(this.game.keyBindings.up)
		this.$.leftKeyTooltip.textContent = this.formatKey(this.game.keyBindings.left)
		this.$.downKeyTooltip.textContent = this.formatKey(this.game.keyBindings.down)
		this.$.rightKeyTooltip.textContent = this.formatKey(this.game.keyBindings.right)
		this.$.shootKeyTooltip.textContent = this.formatKey(this.game.keyBindings.shoot)
		this.$.auxKeyTooltip.textContent = this.formatKey(this.game.keyBindings.aux)
		this.$.pauseKeyTooltip.textContent = this.formatKey(this.game.keyBindings.pause)
	}

	/** @private @param {string} key */
	formatKey(key) {
		return key
			.replace("Key", "")
			.replace("Mouse", "Mouse ")
			.replace("Arrow", "")
			.replace("Numpad", "Numpad ")
	}

	onEnter() {
		this.universe = this.buildTestUniverse()

		this.universe.then(u => u.start())
		document.addEventListener("keydown", this.togglePause, false)
	}

	onExit() {
		document.removeEventListener("keydown", this.togglePause, false)
		this.universe?.then(u => u.stop())
	}

	discardChanges() {
		Object.assign(this.game.keyBindings, this.originalKeyBindings)

		this.navigation.enter(MainPage)
	}

	saveChanges() {
		this.navigation.enter(MainPage)
	}

	/** @private */
	buildTestUniverse() {
		return Sprites.import().then(spriteSource => {
			/** @type HTMLCanvasElement */
			const testCanvas = this.$.testCanvas
			const userInput = new UserInputRegistry(testCanvas)
			const collisions = null
			const vfx = { particles: [], blasts: [], spawnExplosion() {} }

			const universe = new Universe(testCanvas.offsetWidth, testCanvas.offsetHeight)

			universe.register(new UserInputCaptureRoutine(userInput))
			universe.register(new PlayerControlRoutine(userInput, this.game, universe))
			universe.register(new GatlingPlayerWeaponRoutine(userInput, this.game, universe))
			universe.register(new ShockwavePlayerAuxRoutine(userInput, collisions, this.game, universe))
			universe.register(new MotionRoutine(universe))
			universe.register(new RenderRoutine(testCanvas, spriteSource, universe, userInput, vfx))

			universe.add(new Player(
				new Transform(0.5 * universe.width, 0.5 * universe.height),
				undefined,
				[ Sprites.playerGatling ]
			))

			return universe
		})
	}
}
