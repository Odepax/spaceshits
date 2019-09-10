﻿import { black, white, red, grey, green, blue, teal, pink, purple, orange, silver, yellow } from "../asset/style/color.js"
import { Universe, Link } from "../game/engine.js"
import { MatchRoutine } from "../game/routine.js"
import { Transform, Velocity, Acceleration, Friction, BounceOnEdges, DynamicRoutine } from "../game/dynamic.js"
import { Collision, CircleCollider, testCollision } from "../game/collision.js"
import { Render, Renderer, RenderRoutine, SpriteRenderer, CompositeRenderer } from "../game/render.js"
import { InteractionCentral, InteractionRoutine } from "../game/central/interaction.js"
import { NavigationCentral, SpaceshitsPage } from "../game/central/navigation.js"
import { MouseAndKeyboardControl, MouseAndKeyboardControlRoutine } from "../game/control.js"
import { ParameterCentral } from "../game/central/parameter.js"
import { TargetFacing, TargetFacingRoutine } from "../game/movement.js"
import { Explosion, ExplosionOnRemoveRoutine } from "../game/explosion.js"
import { ParticleCloudRoutine } from "../game/particle.js"
import { EphemeralRoutine } from "../game/ephemeral.js"
import { GatlingPlayer, GatlingRoutine } from "../game/universe/player.js"

const { PI } = Math

class CircleRenderer extends Renderer {
	render(/** @type {CanvasRenderingContext2D} */ graphics, /** @type {Link} */ link) {
		graphics.beginPath()
		graphics.arc(0, 0, link.Collision.collider.radius, 0, 2 * PI)

		graphics.fillStyle = red
		graphics.fill()
	}
}

class Debug {}

export class ArenaPage extends SpaceshitsPage {
	constructor(/** @type {NavigationCentral} */ navigation, /** @type {ParameterCentral} */ parameters) {
		super()

		this.navigation = navigation
		this.parameters = parameters
	}

	onInstall() {
		const gameCanvas = this.$.gameCanvas

		gameCanvas.focus()
		gameCanvas.addEventListener("mouseenter", () => gameCanvas.focus(), false)
		gameCanvas.addEventListener("mousedown", () => gameCanvas.focus(), false)
	}

	onEnter() {
		/** @type HTMLCanvasElement */ const gameCanvas = this.$.gameCanvas

		this.universe = new Universe()

		const interactionCentral = new InteractionCentral(gameCanvas)

		this.universe.register(new InteractionRoutine(interactionCentral))
		this.universe.register(new MouseAndKeyboardControlRoutine(interactionCentral, this.parameters))
		this.universe.register(new TargetFacingRoutine(this.universe.clock))
		this.universe.register(new DynamicRoutine(this.universe, gameCanvas.offsetWidth, gameCanvas.offsetHeight))
		this.universe.register(new EphemeralRoutine(this.universe))
		this.universe.register(new ExplosionOnRemoveRoutine(this.universe))
		this.universe.register(new ParticleCloudRoutine(this.universe.clock))
		this.universe.register(new GatlingRoutine(this.universe, interactionCentral, this.parameters))
		this.universe.register(new RenderRoutine(gameCanvas))

		// FPS counter.
		this.universe.register(MatchRoutine.infer(({ Debug }) => {
			/** @type {CanvasRenderingContext2D} */ const graphics = gameCanvas.getContext("2d")

			graphics.font = "16px Roboto Mono"
			graphics.fillStyle = white

			let i = 0
			graphics.fillText("FPS: " + ~~(1 / this.universe.clock.spf), 50, 30 + 20 * ++i)
			graphics.fillText("Mouse: ( " + interactionCentral.mousePosition.x + " , " + interactionCentral.mousePosition.y + " )", 50, 30 + 20 * ++i)
			graphics.fillText("Keys: [ " + Array.from(interactionCentral.currentlyPressedKeys).join(", ") + " ]", 50, 30 + 20 * ++i)
		}))

		// FPS counter.
		this.universe.add(new Link([
			new Debug()
		]))

		// Player ship.
		this.universe.add(new GatlingPlayer(
			gameCanvas.offsetWidth * 0.5,
			gameCanvas.offsetHeight * 0.8,
			interactionCentral.mousePosition
		))

		// Player pop-in FX.
		this.universe.add(new Explosion(
			new Transform(gameCanvas.offsetWidth * 0.5, gameCanvas.offsetHeight * 0.8),
			[ black, grey, orange, purple ],
			300,
			2
		))

		this.universe.start()
	}

	onExit() {
		this.universe.stop()

		this.universe = null
	}
}