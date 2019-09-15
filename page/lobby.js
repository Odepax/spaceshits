import { orange, teal, purple, red} from "../asset/style/color.js"
import { Universe, Link } from "../game/engine.js"
import { MatchRoutine } from "../game/routine.js"
import { Transform, DynamicRoutine, Velocity, BounceOnEdges, Acceleration } from "../game/dynamic.js"
import { Collision, CircleCollider, testCollision } from "../game/collision.js"
import { Render, Renderer, RenderRoutine } from "../game/render.js"
import { InteractionCentral, InteractionRoutine } from "../game/central/interaction.js"
import { NavigationCentral, SpaceshitsPage } from "../game/central/navigation.js"
import { MainPage } from "./main.js"
import { ArenaPage } from "./arena.js"
import { MouseAndKeyboardControl, MouseAndKeyboardControlRoutine } from "../game/control.js"
import { ParameterCentral } from "../game/central/parameter.js"

const { PI } = Math

export class LobbyPage extends SpaceshitsPage {
	constructor(/** @type {NavigationCentral} */ navigation) {
		super()

		this.navigation = navigation
	}

	onInstall() {
		const gameCanvas = this.$.gameCanvas

		gameCanvas.focus()
		gameCanvas.addEventListener("mouseenter", () => gameCanvas.focus(), false)
		gameCanvas.addEventListener("mousedown", () => gameCanvas.focus(), false)
	}

	onEnter() {
		const gameCanvas = this.$.gameCanvas

		const universe = new Universe()
		const interactionCentral = new InteractionCentral(gameCanvas)

		universe.register(new InteractionRoutine(interactionCentral))
		universe.register(new MouseAndKeyboardControlRoutine(interactionCentral, new ParameterCentral()))
		universe.register(new CollisionRoutine())
		universe.register(new DynamicRoutine(universe, gameCanvas.offsetWidth, gameCanvas.offsetHeight))
		universe.register(new RenderRoutine(gameCanvas))

		universe.add(new Link([
			new Transform(gameCanvas.offsetWidth * 0.2, gameCanvas.offsetHeight * 0.2),
			new Velocity(),
			new Acceleration(),
			new MouseAndKeyboardControl(100, 100),
			new BounceOnEdges(),
			new Collision(new CircleCollider(12)),
			new Render(new BallRenderer(orange))
		]))

		universe.add(new Link([
			new Transform(gameCanvas.offsetWidth * 0.8, gameCanvas.offsetHeight * 0.8),
			new Velocity(-111, 76),
			new BounceOnEdges(),
			new Collision(new CircleCollider(5)),
			new Render(new BallRenderer(teal))
		]))

		universe.add(new Link([
			new Transform(gameCanvas.offsetWidth * 0.2, gameCanvas.offsetHeight * 0.8),
			new Velocity(107, -83),
			new BounceOnEdges(),
			new Collision(new CircleCollider(15)),
			new Render(new BallRenderer(purple))
		]))

		universe.add(new Link([
			new Transform(gameCanvas.offsetWidth * 0.2, gameCanvas.offsetHeight * 0.8),
			new Velocity(137, -79),
			new BounceOnEdges(),
			new Collision(new CircleCollider(20)),
			new Render(new BallRenderer(red))
		]))

		universe.start()

		this.universe = universe
	}

	onExit() {
		this.universe.stop()
	}

	fleeArena() { this.navigation.enter(MainPage) }
	fightArena() { this.navigation.enter(ArenaPage) }
}

class CollisionRoutine extends MatchRoutine {
	constructor() {
		super([ Transform, Velocity, Collision ])
	}

	onStep(/** @type {Iterable<Link>} */ links) {
		links = Array.from(links)

		for (let i = 0; i < links.length; ++i) {
			const a = links[i]

			for (let j = i + 1; j < links.length; ++j) {
				const b = links[j]

				if (testCollision(a, b)) {
					const overlapDistance = a.Collision.collider.radius
						+ b.Collision.collider.radius
						- a.Transform.lengthTo(b.Transform)

					const direction = a.Transform.directionTo(b.Transform)

					a.Transform.angularOffset(direction, -overlapDistance / 2)
					b.Transform.angularOffset(direction, +overlapDistance / 2)

					const formerA = a.Velocity.l

					a.Velocity.d = direction
					a.Velocity.l = -b.Velocity.l

					b.Velocity.d = direction
					b.Velocity.l = +formerA
				}
			}
		}
	}
}

class BallRenderer extends Renderer {
	constructor(/** @type {import("../asset/style/color.js").Color} */ color) {
		super()

		this.color = color
	}

	render(/** @type {CanvasRenderingContext2D} */ graphics, /** @type {Link} */ link) {
		graphics.beginPath()
		graphics.arc(0, 0, link.Collision.collider.radius, 0, 2 * PI)

		graphics.fillStyle = this.color
		graphics.fill()

		graphics.rotate(link.Velocity.d)

		graphics.beginPath()
		graphics.moveTo(0, 0)
		graphics.lineTo(link.Collision.collider.radius * 2, 0)

		graphics.lineWidth = 2
		graphics.strokeStyle = this.color
		graphics.stroke()
	}
}
