import { Link } from "../../core/engine.js"
import { Colors } from "../../graphic/assets/colors.js"
import { Sprites } from "../../graphic/assets/sprites.js"
import { Render } from "../../graphic/render.js"
import { OnAddExplosion, OnRemoveExplosion } from "../../graphic/vfx.js"
import { AutoWeaponModule } from "../../logic/auto-weapon.js"
import { HostileBullet, HostileDrone, HostileShip, HostileStuff } from "../../logic/hostile.js"
import { HpGauge } from "../../logic/life-and-death.js"
import { PlayerShip } from "../../logic/player.js"
import { RammingDamage } from "../../logic/ramming-damage.js"
import { Transform } from "../../math/transform.js"
import { Collider } from "../../physic/collision.js"
import { Motion } from "../../physic/motion.js"
import { DRONE_BOSS_BULLET_DAMAGE, DRONE_BOSS_BULLET_SPEED, DRONE_BOSS_COLLISION_DAMAGE, DRONE_BOSS_GUN_RELOAD, DRONE_BOSS_HP, DRONE_BOSS_SPEED } from "../game-balance.js"

/** @param {Transform} position */
export function bossDrone(position) {
	return new Link(
		HostileStuff,
		HostileShip,
		HostileDrone,

		new Motion(position, Transform.angular(position.a, DRONE_BOSS_SPEED), 1),

		new Collider(16),
		new RammingDamage(DRONE_BOSS_COLLISION_DAMAGE, PlayerShip, RammingDamage.bounceOnDamage),

		new HpGauge(DRONE_BOSS_HP),

		new AutoWeaponModule(DRONE_BOSS_GUN_RELOAD, drone => {
			const dronePosition = drone.get(Motion)[0].position

			return [ -9, +9 ].map(i => bossDroneBullet(
				dronePosition
					.copy
					.relativeOffsetBy({ x: 30.6, y: i })
			))
		}),

		new Render(Sprites.turretBossDrone),
		new OnAddExplosion(1, [ Colors.white, Colors.light, Colors.blue, Colors.red ], 60),
		new OnRemoveExplosion(0.5, [ Colors.red, Colors.black, Colors.grey, Colors.pink ], 120)
	)
}

/** @param {Transform} position */
function bossDroneBullet(position) {
	return new Link(
		HostileStuff,
		HostileBullet,

		new Motion(position, Transform.angular(position.a, DRONE_BOSS_BULLET_SPEED), Motion.removeOnEdges),

		new Collider(7),
		new RammingDamage(DRONE_BOSS_BULLET_DAMAGE, PlayerShip, RammingDamage.removeOnDamage),

		new Render(Sprites.turretBossDroneBullet),
		new OnRemoveExplosion(0.5, [ Colors.light, Colors.red, Colors.blue ], 15)
	)
}
