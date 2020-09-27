import { Link } from "../../core/engine.js"
import { Transform } from "../../math/transform.js"
import { Motion } from "../../physic/motion.js"
import { Collider } from "../../physic/collision.js"
import { RammingDamage } from "../../logic/ramming-damage.js"
import { Render } from "../../graphic/render.js"
import { Sprites } from "../../graphic/assets/sprites.js"
import { OnRemoveExplosion, OnAddExplosion } from "../../graphic/vfx.js"
import { Colors } from "../../graphic/assets/colors.js"
import { HpGauge } from "../../logic/life-and-death.js"
import { AutoWeaponModule } from "../../logic/auto-weapon.js"
import { HostileShip, HostileDrone, HostileBullet, HostileStuff } from "../../logic/hostile.js"
import { PlayerShip } from "../../logic/player.js"

/** @param {Transform} position */
export function bossDrone(position) {
	return new Link(
		HostileStuff,
		HostileShip,
		HostileDrone,

		new Motion(position, Transform.angular(position.a, 200), 1),

		new Collider(16),
		new RammingDamage(13, PlayerShip, RammingDamage.bounceOtherOnDamage),

		new HpGauge(101),

		new AutoWeaponModule(3, drone => {
			const dronePosition = drone.get(Motion)[0].position

			return [ -10, +10 ].map(i =>
				bossDroneBullet(dronePosition.copy.relativeOffsetBy({ x: 37, y: i }))
			)
		}),

		new Render(Sprites.turretBossDrone),
		new OnAddExplosion(1, [ Colors.white, Colors.light, Colors.blue, Colors.red ], 50),
		new OnRemoveExplosion(0.5, [ Colors.red, Colors.black, Colors.grey, Colors.pink ], 100)
	)
}

/** @param {Transform} position */
function bossDroneBullet(position) {
	return new Link(
		HostileStuff,
		HostileBullet,

		new Motion(position, Transform.angular(position.a, 800), Motion.removeOnEdges),

		new Collider(7),
		new RammingDamage(9, PlayerShip, RammingDamage.removeOnDamage),

		new Render(Sprites.turretBossDroneBullet),
		new OnRemoveExplosion(0.5, [ Colors.light, Colors.red, Colors.blue ], 10)
	)
}
