import { Link, Universe } from "../../core/engine.js"
import { Colors } from "../../graphic/assets/colors.js"
import { Sprites } from "../../graphic/assets/sprites.js"
import { Render } from "../../graphic/render.js"
import { OnRemoveExplosion } from "../../graphic/vfx.js"
import { HostileShip } from "../../logic/hostile.js"
import { PlayerBullet, PlayerStuff, PlayerWeaponRoutine } from "../../logic/player.js"
import { RammingDamage } from "../../logic/ramming-damage.js"
import { Transform } from "../../math/transform.js"
import { Collider } from "../../physic/collision.js"
import { Motion } from "../../physic/motion.js"
import { UserInputRegistry } from "../../ux/user-input-capture.js"
import { GameKeeper } from "../game-keeper.js"

/** @param {Transform} position */
function chargerSBullet(position) {
	return new Link(
		PlayerStuff,
		PlayerBullet,

		new Motion(position, Transform.angular(position.a, Random.between(400, 800)), Motion.removeOnEdges),

		new Collider(7),
		new RammingDamage(9, HostileShip, RammingDamage.removeOnDamage),

		new Render(Sprites.playerChargerBulletS),
		new OnRemoveExplosion(0.5, [ Colors.black, Colors.grey, Colors.red, Colors.orange ], 15)
	)
}

/** @param {Transform} position */
function chargerLBullet(position) {
	return new Link(
		PlayerStuff,
		PlayerBullet,

		new Motion(position, Transform.angular(position.a, Random.between(500, 700)), Motion.removeOnEdges),

		new Collider(9),
		new RammingDamage(9, HostileShip, RammingDamage.removeOnDamage),

		new Render(Sprites.playerChargerBulletL),
		new OnRemoveExplosion(0.5, [ Colors.black, Colors.grey, Colors.red, Colors.orange ], 20)
	)
}

/** @implements {import("../../core/engine").Routine} */
export class ChargerPlayerWeaponRoutine extends PlayerWeaponRoutine {
	/** @param {UserInputRegistry} userInput @param {GameKeeper} game @param {Universe} universe */
	constructor(userInput, game, universe) {
		super(userInput, game, universe, 11, 0)

		this.largeBulletConsumption = 7
		this.smallBulletConsumption = 3

		this.charge = 0
	}

	onStep() {
		if (this.player) {
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
			)
				this.fire()

			else
				this.regenerate(playerEnergy)
		}
	}

	fire() {
		const playerPosition = this.player.get(Motion)[0].position

		while (this.smallBulletConsumption < this.charge) {
			if (0 <= this.charge - this.largeBulletConsumption) {
				this.charge -= this.largeBulletConsumption

				this.universe.add(chargerLBullet(
					playerPosition
						.copy
						.rotateBy(Random.between(-0.13, +0.13))
						.relativeOffsetBy({ x: 42.6, y: 0 })
				))
			}

			if (0 <= this.charge - this.smallBulletConsumption) {
				this.charge -= this.smallBulletConsumption

				this.universe.add(chargerSBullet(
					playerPosition
						.copy
						.rotateBy(Random.between(-0.26, +0.26))
						.relativeOffsetBy({ x: 38.2, y: 0 })
				))
			}
		}

		this.charge = 0
	}
}
