import { InteractionCentral } from "../central/interaction.js"
import { Transform, Velocity, Acceleration, Friction, BounceOnEdges, RemoveOnEdges } from "../dynamic.js"
import { MouseAndKeyboardControl } from "../control.js"
import { TargetFacing } from "../movement.js"
import { Collision, CircleCollider } from "../collision.js"
import { Render } from "../render.js"
import { Link, Universe } from "../engine.js"
import { MatchSubRoutine } from "../routine.js"
import { ParameterCentral } from "../central/parameter.js"
import { ExplosionOnRemove, ExplosionOnAdd } from "../explosion.js"
import { black, grey, yellow, orange, purple } from "../../asset/style/color.js"
import { playerGatlingSprite, playerGatlingBulletSprite } from "../../asset/sprite.js"

export class GatlingPlayer extends Link {
	constructor(/** @type {number} */ x, /** @type {number} */ y, /** @type {Transform} */ mousePosition) {
		super([
			new Transform(x, y),
			new Velocity(0, -200),
			new Acceleration(),
			new Friction(),
			new BounceOnEdges(0.5),

			new ExplosionOnAdd([ black, grey, orange, purple ], 300, 2),

			new MouseAndKeyboardControl(1000, 1000),
			new TargetFacing({ Transform: mousePosition }, TargetFacing.INSTANT),

			new Collision(
				new CircleCollider(28)
			),

			new Render(
				playerGatlingSprite
			),

			new Gatling()
		])
	}
}

export class Gatling {
	constructor() {
		this.fireRate = 0.1
		this.timeEnlapsed = 0
	}
}

export class GatlingBullet extends Link {
	constructor(/** @type {Transform} */ transform, /** @type {number} */ direction) {
		super([
			transform,
			Velocity.angular(direction, 900),

			new RemoveOnEdges(),
			new ExplosionOnRemove([ black, grey, yellow, orange ], 10, 0.5),

			new Collision(
				new CircleCollider(7)
			),

			new Render(
				playerGatlingBulletSprite
			)
		])
	}
}

export class GatlingRoutine extends MatchSubRoutine {
	constructor(/** @type {Universe} */ universe, /** @type {InteractionCentral} */ interactions, /** @type {ParameterCentral} */ parameters) {
		super([ Gatling, Transform ])

		this.universe = universe
		this.interactions = interactions
		this.parameters = parameters
	}

	/** @param {{ Gatling: Gatling, Transform: Transform }} */
	onSubStep({ Gatling, Transform }) {
		Gatling.timeEnlapsed += this.universe.clock.spf

		if (Gatling.fireRate < Gatling.timeEnlapsed && this.interactions.isPressed(this.parameters.keys.shoot)) {
			Gatling.timeEnlapsed = 0

			this.universe.add(new GatlingBullet(
				Transform.copy.relativeOffset(35, 0),
				Transform.directionTo(this.interactions.mousePosition)
			))
		}
	}
}
