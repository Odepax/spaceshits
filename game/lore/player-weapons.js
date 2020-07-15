import { UserInputCapturer } from "../ux/user-input-capture.js"
import { GameKeeper } from "./game-keeper.js"
import { Universe, Link } from "../core/engine.js"
import { Player } from "./player.js"
import { Motion } from "../physic/motion.js"
import { Transform } from "../math/transform.js"
import { Tags } from "./tags.js"
import { Sprites } from "../graphic/assets/sprites.js"
import { OnRemoveExplosion } from "../graphic/vfx.js"
import { Collider } from "../physic/collision.js"
import { RammingDamage } from "../logic/ramming-damage.js"
import { Colors } from "../graphic/assets/colors.js"
import { Render } from "../graphic/render.js"

// TODO: Should we have one file per weapon?

class GaltingBullet extends Link {
	/** @param {Transform} position */
	constructor(position) {
		// TODO: refactor player bullets (wait for other factors...)
		super(
			new Motion(position, Transform.angular(position.a, 800), Motion.removeOnEdges), 

			new Collider(7, Tags.player | Tags.bullet),
			new RammingDamage(9, Tags.hostile | Tags.ship, RammingDamage.removeOnDamage),

			new Render(Sprites.playerGatlingBullet),
			new OnRemoveExplosion(7 /* Collider.radius */ / 15, [ Colors.black, Colors.grey, Colors.yellow, Colors.orange ], 7 /* Collider.radius */ * 1.5)
		)
	}
}

/** @implements {import("../core/engine").Routine} */
export class GatlingPlayerWeaponRoutine {
	/** @param {UserInputCapturer} userInput @param {GameKeeper} game @param {Universe} universe */
	constructor(userInput, game, universe) {
		this.userInput = userInput
		this.game = game
		this.universe = universe

		/** @private @type {Player} */
		this.player = null

		this.nextShotTime = Number.NEGATIVE_INFINITY
		this.reloadTime = 0.13

		this.energy = this.energyMax = 113
		this.energyRegen = 23
		this.energyConsumption = 5
	}

	/** @param {Link} link */
	onAdd(link) {
		if (!this.player && link instanceof Player)
			this.player = link
	}

	/** @param {Link} link */
	onRemove(link) {
		if (link == this.player)
			this.player = null
	}

	onStep() {
		if (!this.player)
			return

		if (
			   this.nextShotTime < this.universe.clock.time // Has reloaded?
			&& this.energyConsumption <= this.energy // Has energy?
			&& this.userInput.isPressed(this.game.keyBindings.shoot) // Has order?
		) {
			this.nextShotTime = this.universe.clock.time + this.reloadTime
			this.energy -= this.energyConsumption

			const bullet = new GaltingBullet(
				this.player.get(Motion)[0]
					.position
					.copy
					.relativeOffsetBy({ x: 37, y: 0 })
			)

			// TODO: rotate bullet (if needed).
			// TODO: Apply damage boosters.

			this.universe.add(bullet)
		}

		if (this.energy < this.energyMax)
			this.energy += this.energyRegen * this.universe.clock.spf
	}
}
