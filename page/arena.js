import { black, white, red, grey, teal, purple, orange, silver, yellow } from "../asset/style/color.js"
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
import { Explosion } from "../game/explosion.js"
import { ParticleCloudRoutine } from "../game/particle.js"
import { EphemeralRoutine } from "../game/ephemeral.js"

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
		this.universe.register(new DynamicRoutine(this.universe.clock, gameCanvas.offsetWidth, gameCanvas.offsetHeight))
		this.universe.register(new EphemeralRoutine(this.universe))
		this.universe.register(new ParticleCloudRoutine(this.universe.clock))
		this.universe.register(new GatlingRoutine(this.universe, interactionCentral, this.parameters))
		this.universe.register(new RemoveOnEdgesRoutine(this.universe, gameCanvas.offsetWidth, gameCanvas.offsetHeight))
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
		this.universe.add(new Link([
			new Transform(gameCanvas.offsetWidth * 0.5 , gameCanvas.offsetHeight * 0.8),
			new Velocity(0, -200),
			new Acceleration(),
			new Friction(),
			new BounceOnEdges(0.5),

			new MouseAndKeyboardControl(1000, 1000),
			new TargetFacing({ Transform: interactionCentral.mousePosition }, TargetFacing.INSTANT),

			new Collision(
				new CircleCollider(28)
			),

			new Render(
				new SpriteRenderer("../asset/sprite.svg", 10, 10, 57, 63, -29, -32)
			),

			new Gatling()
		]))

		// Player pop-in FX.
		this.universe.add(new Explosion(
			new Transform(gameCanvas.offsetWidth * 0.5, gameCanvas.offsetHeight * 0.8),
			[ grey, black, orange, purple ],
			300,
			3
		))

		this.universe.start()
	}

	onExit() {
		this.universe.stop()

		this.universe = null
	}
}

class Gatling {
	constructor() {
		this.fireRate = 0.1
		this.timeEnlapsed = 0
	}
}

class GatlingRoutine extends MatchRoutine {
	constructor(/** @type {Universe} */ universe, /** @type {InteractionCentral} */ interactions, /** @type {ParameterCentral} */ parameters) {
		super([Gatling, Transform])

		this.universe = universe
		this.interactions = interactions
		this.parameters = parameters
	}

	/** @param {{ Gatling: Gatling, Transform: Transform }} */
	onSubStep({ Gatling, Transform }) {
		Gatling.timeEnlapsed += this.universe.clock.spf

		if (Gatling.fireRate < Gatling.timeEnlapsed && this.interactions.isPressed(this.parameters.keys.shoot)) {
			Gatling.timeEnlapsed = 0

			this.universe.add(new Link([
				Transform.copy.relativeOffset(35, 0),
				Velocity.angular(Transform.directionTo(this.interactions.mousePosition), 900),

				new RemoveOnEdges(),

				new Collision(
					new CircleCollider(7)
				),

				new Render(
					new SpriteRenderer("../asset/sprite.svg", 10, 96, 15.3, 14, -8.6, -7)
				)
			]))
		}
	}
}

class RemoveOnEdges {
}

class RemoveOnEdgesRoutine extends MatchRoutine {
	constructor(/** @type {Universe} */ universe, /** @type {number} */ canvasWidth, /** @type {number} */ canvasHeight) {
		super([ RemoveOnEdges, Transform ])

		this.universe = universe
		this.canvasWidth = canvasWidth
		this.canvasHeight = canvasHeight
	}

	onSubStep(/** @type {{ Transform: Transform }} */ link) {
		if (
			   link.Transform.y < 0 || this.canvasHeight < link.Transform.y
			|| link.Transform.x < 0 || this.canvasWidth < link.Transform.x
		) {
			this.universe.remove(link)

			this.universe.add(new Explosion(
				link.Transform,
				[ silver, yellow, orange ],
				10,
				1
			))
		}
	}
}
