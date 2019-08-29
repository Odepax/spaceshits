import { black, white} from "../asset/style/color.js"
import { Universe, Link } from "../game/engine.js"
import { MatchRoutine } from "../game/routine.js"
import { Transform } from "../game/dynamic.js"
import { Collision, CircleCollider, testCollision } from "../game/collision.js"
import { Render, Renderer, RenderRoutine } from "../game/render.js"
import { InteractionCentral, InteractionRoutine } from "../game/central/interaction.js"
import { NavigationCentral, SpaceshitsPage } from "../game/central/navigation.js"
import { MainPage } from "./main.js"

const { PI } = Math

class CircleRenderer extends Renderer {
	render(/** @type {CanvasRenderingContext2D} */ graphics, /** @type {Link} */ link) {
		graphics.beginPath()
		graphics.arc(0, 0, link.Collision.collider.radius, 0, 2 * PI)

		graphics.fillStyle = black
		graphics.fill()
	}
}

class Debug {}

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
		universe.register(new RenderRoutine(gameCanvas))

		const fix = new Link([
			new Debug(),
			interactionCentral.mousePosition,
			new Collision(new CircleCollider(30)),
			new Render(new CircleRenderer())
		])

		const moving = new Link([
			new Transform(200, 200),
			new Collision(new CircleCollider(30)),
			new Render(new CircleRenderer())
		])

		universe.register(MatchRoutine.infer(({ Debug }) => {
			/** @type {CanvasRenderingContext2D} */ const graphics = gameCanvas.getContext("2d")

			graphics.font = "16px Roboto Mono"
			graphics.fillStyle = white

			let i = 0
			graphics.fillText("FPS: " + ~~(1 / universe.clock.spf), 50, 30 + 20 * ++i)
			graphics.fillText("Mouse: ( " + interactionCentral.mousePosition.x + " , " + interactionCentral.mousePosition.y + " )", 50, 30 + 20 * ++i)
			graphics.fillText("Keys: [ " + Array.from(interactionCentral.currentlyPressedKeys).join(", ") + " ]", 50, 30 + 20 * ++i)
			graphics.fillText("Collision: " + testCollision(fix, moving) + " / " + testCollision(moving, fix), 50, 30 + 20 * ++i)
		}))

		universe.add(fix)
		universe.add(moving)

		universe.start()
	}

	fleeArena() { this.navigation.enter(MainPage) }
	fightArena() { /*this.navigation.enter(InGamePage)*/ }
}
