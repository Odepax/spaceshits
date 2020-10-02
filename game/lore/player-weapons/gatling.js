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
import { PLAYER_GATLING_ANY_GUN_BULLET_DAMAGE, PLAYER_GATLING_ANY_GUN_BULLET_SPEED, PLAYER_GATLING_DOUBLE_GUN_ENERGY, PLAYER_GATLING_DOUBLE_GUN_RELOAD, PLAYER_GATLING_GUN_ENERGY, PLAYER_GATLING_GUN_RELOAD } from "../game-balance.js"
import { GameKeeper } from "../game-keeper.js"

/** @param {Transform} position */
function gatlingBullet(position) {
	return new Link(
		PlayerStuff,
		PlayerBullet,

		new Motion(position, Transform.angular(position.a, PLAYER_GATLING_ANY_GUN_BULLET_SPEED), Motion.removeOnEdges),

		new Collider(7),
		new RammingDamage(PLAYER_GATLING_ANY_GUN_BULLET_DAMAGE, HostileShip, RammingDamage.removeOnDamage),

		new Render(Sprites.playerGatlingBullet),
		new OnRemoveExplosion(0.5, [ Colors.black, Colors.grey, Colors.orange, Colors.yellow ], 15)
	)
}

/** @implements {import("../../core/engine").Routine} */
export class GatlingPlayerWeaponRoutine extends PlayerWeaponRoutine {
	/** @param {UserInputRegistry} userInput @param {GameKeeper} game @param {Universe} universe */
	constructor(userInput, game, universe) {
		super(userInput, game, universe, PLAYER_GATLING_GUN_RELOAD, PLAYER_GATLING_GUN_ENERGY)
	}

	/** @protected */
	fire() {
		const playerPosition = this.player.get(Motion)[0].position

		this.universe.add(gatlingBullet(
			playerPosition
				.copy
				.relativeOffsetBy({ x: 36.5, y: 0 })
		))
	}
}

/** @implements {import("../../core/engine").Routine} */
export class DoubleGatlingPlayerWeaponRoutine extends PlayerWeaponRoutine {
	/** @param {UserInputRegistry} userInput @param {GameKeeper} game @param {Universe} universe */
	constructor(userInput, game, universe) {
		super(userInput, game, universe, PLAYER_GATLING_DOUBLE_GUN_RELOAD, PLAYER_GATLING_DOUBLE_GUN_ENERGY)
	}

	/** @protected */
	fire() {
		const playerPosition = this.player.get(Motion)[0].position

		for (const i of [ -9, +9 ])
			this.universe.add(gatlingBullet(
				playerPosition
					.copy
					.relativeOffsetBy({ x: 36.5, y: i })
			))
	}
}
