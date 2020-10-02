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
import { PLAYER_SHOCK_GUN_BULLET_DAMAGE, PLAYER_SHOCK_GUN_BULLET_SPEED, PLAYER_SHOCK_GUN_ENERGY, PLAYER_SHOCK_GUN_RELOAD } from "../game-balance.js"
import { GameKeeper } from "../game-keeper.js"

/** @param {Transform} position */
function shockgunBullet(position) {
	return new Link(
		PlayerStuff,
		PlayerBullet,

		new Motion(position, Transform.angular(position.a, PLAYER_SHOCK_GUN_BULLET_SPEED), Motion.removeOnEdges),

		new Collider(7),
		new RammingDamage(PLAYER_SHOCK_GUN_BULLET_DAMAGE, HostileShip, RammingDamage.removeOnDamage),

		new Render(Sprites.playerShockgunBullet),
		new OnRemoveExplosion(0.5, [ Colors.black, Colors.grey, Colors.teal, Colors.green ], 10)
	)
}

/** @implements {import("../../core/engine").Routine} */
export class ShockgunPlayerWeaponRoutine extends PlayerWeaponRoutine {
	/** @param {UserInputRegistry} userInput @param {GameKeeper} game @param {Universe} universe */
	constructor(userInput, game, universe) {
		super(userInput, game, universe, PLAYER_SHOCK_GUN_RELOAD, PLAYER_SHOCK_GUN_ENERGY)
	}

	/** @protected */
	fire() {
		const playerPosition = this.player.get(Motion)[0].position

		for (const i of [ -0.39, -0.13, +0.13, +0.39 ])
			this.universe.add(shockgunBullet(
				playerPosition
					.copy
					.rotateBy(i)
					.relativeOffsetBy({ x: 33, y: 0 })
			))
	}
}
