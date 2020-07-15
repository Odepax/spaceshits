import { Page, PageRegistry } from "../page-registry.js"
import { GameKeeper } from "../../lore/game-keeper.js"
import { UserInputCapturer } from "../user-input-capture.js"

export class SettingsPage extends Page {
	/** @param {PageRegistry} navigation @param {GameKeeper} game */
	constructor(navigation, game) {
		super()

		this.navigation = navigation
		this.game = game
		this.userInput = userInput

		/** @private */
		this.keyBindings = Object.assign({}, this.game.keyBindings)

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

		this.syncLegend(null)
	}

	onInstall() {
		for (const key of Object.getOwnPropertyNames(this.keyBindings)) {
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
			binder.addEventListener("mousedown", ({ button }) => this.setBinding(key, UserInputCapturer.mouseButtonLabels[button]), false)
		}

		const testCanvas = this.$.testCanvas

		testCanvas.focus()
		testCanvas.addEventListener("mouseenter", () => testCanvas.focus(), false)
		testCanvas.addEventListener("mousedown", () => testCanvas.focus(), false)
	}

	/** @private @param {string} key @param {string} binding */
	setBinding(key, binding) {
		this.keyBindings[key] = binding
		this.syncLegend(key)
	}

	/** @private @param {string} key */
	syncLegend(key = null) {
		this.$.bindingLegend.textContent = key ? this.keyLabels[key] : "Hover over the fields <br/> and press keys to edit the bindings"
		this.$.bindingKey.textContent = key ? this.formatKey(this.keyBindings[key]) : null

		this.$.upKeyTooltip.textContent = this.formatKey(this.keyBindings.up)
		this.$.leftKeyTooltip.textContent = this.formatKey(this.keyBindings.left)
		this.$.downKeyTooltip.textContent = this.formatKey(this.keyBindings.down)
		this.$.rightKeyTooltip.textContent = this.formatKey(this.keyBindings.right)
		this.$.shootKeyTooltip.textContent = this.formatKey(this.keyBindings.shoot)
		this.$.auxKeyTooltip.textContent = this.formatKey(this.keyBindings.aux)
		this.$.pauseKeyTooltip.textContent = this.formatKey(this.keyBindings.pause)
	}

	/** @private @param {string} key */
	formatKey(key) {
		return key
			.replace("Key", "")
			.replace("Mouse", "Mouse ")
	}

	onEnter() {
		///** @type HTMLCanvasElement */
		//const testCanvas = this.$.testCanvas

		//this.universe = new Universe()

		//const interactionCentral = new InteractionCentral(testCanvas)

		//this.universe.register(new InteractionRoutine(interactionCentral))
		//this.universe.register(new MouseAndKeyboardControlRoutine(interactionCentral, this.parameters))
		//this.universe.register(new MouseAndKeyboardWeaponControlRoutine(interactionCentral, this.parameters))
		//this.universe.register(new TargetFacingRoutine(this.universe.clock))
		//this.universe.register(new DynamicRoutine(this.universe, testCanvas.offsetWidth, testCanvas.offsetHeight))
		//this.universe.register(new EphemeralRoutine(this.universe))
		//this.universe.register(new WeaponRoutine(this.universe))
		//this.universe.register(new ExplosionOnAddRoutine(this.universe))
		//this.universe.register(new ExplosionOnRemoveRoutine(this.universe))
		//this.universe.register(new ParticleCloudRoutine(this.universe.clock))
		//this.universe.register(new RenderRoutine(testCanvas))
		
		//// Test player.
		//this.universe.add(new Link([
		//	new Transform(testCanvas.offsetWidth * 0.5, testCanvas.offsetHeight * 0.8),
		//	new Velocity(0, -50),
		//	new Acceleration(),
		//	new Friction(),
		//	new BounceOnEdges(0.5),

		//	new MouseAndKeyboardControl(500, 500),
		//	new TargetFacing({ Transform: interactionCentral.mousePosition }, TargetFacing.INSTANT),

		//	new Weapon(0.2, [
		//		{ type: GatlingBullet, x: 35, y: -10, a: 0 },
		//		{ type: GatlingBullet, x: 45, y: +10, a: 0 }
		//	]),

		//	new MouseAndKeyboardWeaponControl(),

		//	new ExplosionOnAdd([black, grey, orange, purple], 100, 1),
		//	new Render(playerDoubleGatlingSprite)
		//]))

		//this.universe.start()
	}

	onExit() {
		//this.universe.stop()
	}

	discardChanges() {
		//this.navigation.enter(MainPage)
	}

	saveChanges() {
		//Object.assign(this.game.keyBindings, this.keyBindings)

		//this.navigation.enter(MainPage)
	}
}
