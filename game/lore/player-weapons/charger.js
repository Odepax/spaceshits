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
import { Random } from "../../math/random.js"

class ChargerSBullet extends Link {
	/** @param {Transform} position */
	constructor(position) {
		const r = 7

		super(
			new Motion(position, Transform.angular(position.a, Random.between(400, 800)), Motion.removeOnEdges), 

			new Collider(r, Tags.player | Tags.bullet),
			new RammingDamage(9, Tags.hostile | Tags.ship, RammingDamage.removeOnDamage),

			new Render(Sprites.playerChargerBulletS),
			new OnRemoveExplosion(r / 15, [ Colors.black, Colors.grey, Colors.red, Colors.orange ], r * 1.5)
		)
	}
}

class ChargerLBullet extends Link {
	/** @param {Transform} position */
	constructor(position) {
		const r = 7

		super(
			new Motion(position, Transform.angular(position.a, Random.between(500, 700)), Motion.removeOnEdges),

			new Collider(r, Tags.player | Tags.bullet),
			new RammingDamage(9, Tags.hostile | Tags.ship, RammingDamage.removeOnDamage),

			new Render(Sprites.playerChargerBulletL),
			new OnRemoveExplosion(r / 15, [ Colors.black, Colors.grey, Colors.red, Colors.orange ], r * 1.5)
		)
	}
}

/** @implements {import("../../core/engine").Routine} */
export class ChargerPlayerWeaponRoutine {
	/** @param {UserInputRegistry} userInput @param {GameKeeper} game @param {Universe} universe */
	constructor(userInput, game, universe) {
		this.userInput = userInput
		this.game = game
		this.universe = universe

		/** @private @type {Player} */
		this.player = null

		this.charge = 0
	}

	/** @param {Link} link */
	onAdd(link) {
		if (!this.player && link instanceof Player) {
			this.player = link
			this.player.get(PlayerEnergy)[0].weaponConsumption = 23
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
			   this.userInput.isPressed(this.game.keyBindings.shoot) // Must charge?
			&& 0 < playerEnergy.weapon // Has energy?
		) {
			const transfer = Math.min(playerEnergy.weaponConsumption * this.universe.clock.spf, playerEnergy.weapon)

			this.charge += transfer
			playerEnergy.weapon -= transfer
		}

		else if (
			   this.userInput.wasReleased(this.game.keyBindings.shoot) // Must fire?
			&& 0 < this.charge // Has charged?
		) {
			const largeBulletCost = 7
			const smallBulletCost = 3

			const playerPosition = this.player.get(Motion)[0].position

			while (smallBulletCost < this.charge) {
				if (0 <= this.charge - largeBulletCost) {
					this.charge -= largeBulletCost

					this.universe.add(new ChargerLBullet(
						playerPosition
							.copy
							.rotateBy(Random.between(-0.22, +0.22))
							.relativeOffsetBy({ x: 37, y: 0 })
					))
				}

				if (0 <= this.charge - smallBulletCost) {
					this.charge -= smallBulletCost

					this.universe.add(new ChargerSBullet(
						playerPosition
							.copy
							.rotateBy(Random.between(-0.22, +0.22))
							.relativeOffsetBy({ x: 37, y: 0 })
					))
				}
			}

			this.charge = 0
		}

		else if (playerEnergy.weapon < playerEnergy.weaponMax)
			playerEnergy.weapon += playerEnergy.weaponRegen * this.universe.clock.spf
	}
}
