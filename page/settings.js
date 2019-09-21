import { ParameterCentral } from "../game/central/parameter.js"
import { mouseButtonLabels, InteractionCentral, InteractionRoutine } from "../game/central/interaction.js"
import { NavigationCentral, SpaceshitsPage } from "../game/central/navigation.js"
import { MainPage } from "./main.js"
import { GatlingBullet, MouseAndKeyboardWeaponControl, MouseAndKeyboardWeaponControlRoutine } from "../game/universe/player.js"
import { Link, Universe } from "../game/engine.js"
import { playerDoubleGatlingSprite } from "../asset/sprite.js"
import { Transform, Velocity, Acceleration, Friction, BounceOnEdges, DynamicRoutine } from "../game/dynamic.js"
import { MouseAndKeyboardControl, MouseAndKeyboardControlRoutine } from "../game/control.js"
import { TargetFacing, TargetFacingRoutine } from "../game/movement.js"
import { Weapon, WeaponRoutine } from "../game/universe/combat.js"
import { black, grey, orange, purple } from "../asset/style/color.js"
import { ExplosionOnAdd, ExplosionOnAddRoutine, ExplosionOnRemoveRoutine } from "../game/universe/explosion.js"
import { Render, RenderRoutine } from "../game/render.js"
import { ParticleCloudRoutine } from "../game/universe/particle.js"
import { EphemeralRoutine } from "../game/ephemeral.js"

export class SettingsPage extends SpaceshitsPage {
	constructor(/** @type {NavigationCentral} */ navigation, /** @type {ParameterCentral} */ parameters) {
		super()

		this.navigation = navigation
		this.parameters = parameters

		/** @private @type {import("../game/engine.js").Bag<string>} */
		this.backupKeys = Object.assign({}, this.parameters.keys)

		this.bindingLegends = {
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
		for (const key of Object.getOwnPropertyNames(this.parameters.keys)) {
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
			binder.addEventListener("mousedown", ({ button }) => this.setBinding(key, mouseButtonLabels[button]), false)
		}

		const testCanvas = this.$.testCanvas

		testCanvas.focus()
		testCanvas.addEventListener("mouseenter", () => testCanvas.focus(), false)
		testCanvas.addEventListener("mousedown", () => testCanvas.focus(), false)
	}

	/** @private */ setBinding(/** @type {string} */ key, /** @type {string} */ value) {
		this.parameters.keys[key] = value
		this.syncLegend(key)
	}

	/** @private */ syncLegend(/** @type {string} */ key = null) {
		if (!key) {
			this.$.bindingLegend.innerHTML = "Hover over the fields <br/> and press keys to edit the bindings"
			this.$.bindingKey.textContent = null
		} else {
			this.$.bindingLegend.textContent = this.bindingLegends[key]
			this.$.bindingKey.textContent = this.formatKey(key)
				.replace("Key", "")
				.replace("Mouse", "Mouse ")
		}

		this.$.settingsTooltip.innerHTML = `
			Move: ${ this.formatKey("up")} ${this.formatKey("left")} ${this.formatKey("down")} ${this.formatKey("right")} <br />
			Shoot: ${ this.formatKey("shoot")} <br />
			AUX Module: ${ this.formatKey("aux")} <br />
			Pause: ${ this.formatKey("pause")}
		`
	}

	/** @private */ formatKey(/** @type {string} */ key) {
		return this.parameters.keys[key]
			.replace("Key", "")
			.replace("Mouse", "Mouse ")
	}

	onEnter() {
		/** @type HTMLCanvasElement */ const testCanvas = this.$.testCanvas

		this.universe = new Universe()

		const interactionCentral = new InteractionCentral(testCanvas)

		this.universe.register(new InteractionRoutine(interactionCentral))
		this.universe.register(new MouseAndKeyboardControlRoutine(interactionCentral, this.parameters))
		this.universe.register(new MouseAndKeyboardWeaponControlRoutine(interactionCentral, this.parameters))
		this.universe.register(new TargetFacingRoutine(this.universe.clock))
		this.universe.register(new DynamicRoutine(this.universe, testCanvas.offsetWidth, testCanvas.offsetHeight))
		this.universe.register(new EphemeralRoutine(this.universe))
		this.universe.register(new WeaponRoutine(this.universe))
		this.universe.register(new ExplosionOnAddRoutine(this.universe))
		this.universe.register(new ExplosionOnRemoveRoutine(this.universe))
		this.universe.register(new ParticleCloudRoutine(this.universe.clock))
		this.universe.register(new RenderRoutine(testCanvas))
		
		// Test player.
		this.universe.add(new Link([
			new Transform(testCanvas.offsetWidth * 0.5, testCanvas.offsetHeight * 0.8),
			new Velocity(0, -50),
			new Acceleration(),
			new Friction(),
			new BounceOnEdges(0.5),

			new MouseAndKeyboardControl(500, 500),
			new TargetFacing({ Transform: interactionCentral.mousePosition }, TargetFacing.INSTANT),

			new Weapon(0.2, [
				{ type: GatlingBullet, x: 35, y: -10, a: 0 },
				{ type: GatlingBullet, x: 45, y: +10, a: 0 }
			]),

			new MouseAndKeyboardWeaponControl(),

			new ExplosionOnAdd([black, grey, orange, purple], 100, 1),
			new Render(playerDoubleGatlingSprite)
		]))

		this.universe.start()
	}

	onExit() {
		this.universe.stop()
	}

	discardChanges() {
		Object.assign(this.parameters.keys, this.backupKeys)

		this.navigation.enter(MainPage)
	}

	saveChanges() {
		this.navigation.enter(MainPage)
	}
}
