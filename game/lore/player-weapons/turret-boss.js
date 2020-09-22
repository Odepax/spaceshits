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
function turretBossBullet(position) {
	return new Link(
		PlayerStuff,
		PlayerBullet,

		new Motion(position, Transform.angular(position.a, 800), Motion.removeOnEdges),

		new Collider(7),
		new RammingDamage(9, HostileShip, RammingDamage.removeOnDamage),

		new Render(Sprites.turretBossBullet),
		new OnRemoveExplosion(0.5, [ Colors.black, Colors.grey, Colors.blue, Colors.purple ], 10)
	)
}

/** @implements {import("../../core/engine").Routine} */
export class TurretPlayerWeaponRoutine extends PlayerWeaponRoutine {
	/** @param {UserInputRegistry} userInput @param {GameKeeper} game @param {Universe} universe */
	constructor(userInput, game, universe) {
		super(userInput, game, universe, 0.19, 19)
	}

	/** @protected */
	fire() {
		const playerPosition = this.player.get(Motion)[0].position

		this.universe.add(turretBossBullet(
			playerPosition
				.copy
				.relativeOffsetBy({ x: 39, y: +5 })
		))

		this.universe.add(turretBossBullet(
			playerPosition
				.copy
				.relativeOffsetBy({ x: 35, y: -5 })
		))
	}
}
