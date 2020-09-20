import { Link } from "../../core/engine.js"
import { Transform } from "../../math/transform.js"
import { Collider } from "../../physic/collision.js"
import { Motion } from "../../physic/motion.js"
import { Tags } from "../tags.js"
import { RammingDamage } from "../../logic/ramming-damage.js"
import { Render } from "../../graphic/render.js"
import { Sprites } from "../../graphic/assets/sprites.js"
import { OnRemoveExplosion } from "../../graphic/vfx.js"
import { Colors } from "../../graphic/assets/colors.js"
import { UserInputRegistry } from "../../ux/user-input-capture.js"
import { GameKeeper } from "../game-keeper.js"
import { Universe } from "../../core/engine.js"
import { Player, PlayerEnergy } from "../player.js"

class GatlingBullet extends Link {
	/** @param {Transform} position */
	constructor(position) {
		const r = 7

		super(
			new Motion(position, Transform.angular(position.a, 800), Motion.removeOnEdges), 

			new Collider(r, Tags.player | Tags.bullet),
			new RammingDamage(9, Tags.hostile | Tags.ship, RammingDamage.removeOnDamage),

			new Render(Sprites.playerGatlingBullet),
			new OnRemoveExplosion(r / 15, [ Colors.black, Colors.grey, Colors.yellow, Colors.orange ], r * 1.5)
		)
	}
}

/** @implements {import("../../core/engine").Routine} */
export class GatlingPlayerWeaponRoutine {
	/** @param {UserInputRegistry} userInput @param {GameKeeper} game @param {Universe} universe */
	constructor(userInput, game, universe) {
		this.userInput = userInput
		this.game = game
		this.universe = universe

		/** @private @type {Player} */
		this.player = null

		this.nextShotTime = Number.NEGATIVE_INFINITY
		this.reloadTime = 0.13
	}

	/** @param {Link} link */
	onAdd(link) {
		if (!this.player && link instanceof Player) {
			this.player = link
			this.player.get(PlayerEnergy)[0].weaponConsumption = 5
		}
	}

	/** @param {Link} link */
	onRemove(link) {
		if (link == this.player)
			this.player = null
	}

	onStep() {
		if (!this.player)
			return

		const [ playerEnergy ] = this.player.get(PlayerEnergy)

		if (
			   this.nextShotTime < this.universe.clock.time // Has reloaded?
			&& playerEnergy.weaponConsumption <= playerEnergy.weapon // Has energy?
			&& this.userInput.isPressed(this.game.keyBindings.shoot) // Has order?
		) {
			this.nextShotTime = this.universe.clock.time + this.reloadTime
			playerEnergy.weapon -= playerEnergy.weaponConsumption

			const bullet = new GatlingBullet(
				this.player.get(Motion)[0]
					.position
					.copy
					.relativeOffsetBy({ x: 37, y: 0 })
			)

			this.universe.add(bullet)
		}

		if (playerEnergy.weapon < playerEnergy.weaponMax)
			playerEnergy.weapon += playerEnergy.weaponRegen * this.universe.clock.spf
	}
}

/** @implements {import("../../core/engine").Routine} */
export class DoubleGatlingPlayerWeaponRoutine {
	/** @param {UserInputRegistry} userInput @param {GameKeeper} game @param {Universe} universe */
	constructor(userInput, game, universe) {
		this.userInput = userInput
		this.game = game
		this.universe = universe

		/** @private @type {Player} */
		this.player = null

		this.nextShotTime = Number.NEGATIVE_INFINITY
		this.reloadTime = 0.13
	}

	/** @param {Link} link */
	onAdd(link) {
		if (!this.player && link instanceof Player) {
			this.player = link
			this.player.get(PlayerEnergy)[0].weaponConsumption = 10
		}
	}

	/** @param {Link} link */
	onRemove(link) {
		if (link == this.player)
			this.player = null
	}

	onStep() {
		if (!this.player)
			return

		const [ playerEnergy ] = this.player.get(PlayerEnergy)

		if (
			   this.nextShotTime < this.universe.clock.time // Has reloaded?
			&& playerEnergy.weaponConsumption <= playerEnergy.weapon // Has energy?
			&& this.userInput.isPressed(this.game.keyBindings.shoot) // Has order?
		) {
			this.nextShotTime = this.universe.clock.time + this.reloadTime
			playerEnergy.weapon -= playerEnergy.weaponConsumption

			this.universe.add(new GatlingBullet(
				this.player.get(Motion)[0]
					.position
					.copy
					.relativeOffsetBy({ x: 39, y: +5 })
			))

			this.universe.add(new GatlingBullet(
				this.player.get(Motion)[0]
					.position
					.copy
					.relativeOffsetBy({ x: 35, y: -5 })
			))
		}

		if (playerEnergy.weapon < playerEnergy.weaponMax)
			playerEnergy.weapon += playerEnergy.weaponRegen * this.universe.clock.spf
	}
}
