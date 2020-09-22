import { Link } from "../../core/engine.js"
import { Transform } from "../../math/transform.js"
import { Motion } from "../../physic/motion.js"
import { Random } from "../../math/random.js"
import { Collider } from "../../physic/collision.js"
import { RammingDamage } from "../../logic/ramming-damage.js"
import { HpGauge } from "../../logic/life-and-death.js"
import { Render } from "../../graphic/render.js"
import { Sprites } from "../../graphic/assets/sprites.js"
import { OnAddExplosion, OnRemoveExplosion } from "../../graphic/vfx.js"
import { Colors } from "../../graphic/assets/colors.js"
import { AutoWeaponModule } from "../../logic/auto-weapon.js"
import { Universe } from "../../core/engine.js"
import { TargetFacing } from "../../math/target-facing.js"
import { PlayerShip } from "../../logic/player.js"
import { HostileBullet, HostileDrone, HostileShip, HostileStuff } from "../../logic/hostile.js"

/** @param {Transform} position */
export function drone(position) {
	return new Link(
		HostileStuff,
		HostileShip,
		HostileDrone,

		new Motion(position, Transform.angular(Random.angle(), Random.between(100, 200)), 1),

		new Collider(21),
		new RammingDamage(13, PlayerShip, RammingDamage.bounceOtherOnDamage),

		new HpGauge(101),

		new Render(Sprites.drone),
		new OnAddExplosion(1, [ Colors.white, Colors.light, Colors.silver, Colors.blue ], 50),
		new OnRemoveExplosion(0.5, [ Colors.blue, Colors.black, Colors.grey, Colors.silver ], 100)
	)
}

/** @param {Transform} position */
export function combatDrone(position) {
	return new Link(
		HostileStuff,
		HostileShip,
		HostileDrone,

		new Motion(position, Transform.angular(Random.angle(), Random.between(100, 200)), 1),

		new Collider(21),
		new RammingDamage(13, PlayerShip, RammingDamage.bounceOtherOnDamage),

		new HpGauge(101),

		new AutoWeaponModule(),
		new AutoWeaponModule(3, drone => {
			const dronePosition = drone.get(Motion)[0].position

			return [ -10, +10 ].map(i =>
				combatDroneBullet(dronePosition.copy.relativeOffsetBy({ x: 37, y: i }))
			)
		}),

		new Render(Sprites.combatDrone),
		new OnAddExplosion(1, [ Colors.white, Colors.light, Colors.blue, Colors.purple ], 50),
		new OnRemoveExplosion(0.5, [ Colors.purple, Colors.black, Colors.grey, Colors.pink ], 100)
	)
}

/** @param {Transform} position */
function combatDroneBullet(position) {
	return new Link(
		HostileStuff,
		HostileBullet,

		new Motion(position, Transform.angular(position.a, 800), Motion.removeOnEdges),

		new Collider(7),
		new RammingDamage(9, PlayerShip, RammingDamage.removeOnDamage),

		new Render(Sprites.combatDroneBullet),
		new OnRemoveExplosion(0.5, [ Colors.light, Colors.purple, Colors.blue ], 10)
	)
}

/** @implements {import("../../core/engine").Routine */
export class DroneAimRoutine {
	/** @param {Universe} universe */
	constructor(universe) {
		this.universe = universe
		/** @private @type {Link} */
		this.player = null

		/** @private @type {Set<Link>} */
		this.drones = new Set()
	}

	/** @param {Link} link */
	onAdd(link) {
		if (link.has(PlayerShip))
			this.player = link

		else if (link.has(HostileDrone))
			this.drones.add(link)
	}

	/** @param {Link} link */
	onRemove(link) {
		if (link == this.player)
			this.player = null

		else
			this.drones.delete(link)
	}

	onStep() {
		if (this.player)
		for (const drone of this.drones) {
			const [ { position: dronePosition, velocity: droneVelocity } ] = drone.get(Motion)
			const [ { position: playerPosition } ] = this.player.get(Motion)

			if (dronePosition.squaredLengthTo(playerPosition) < 400 ** 2)
				TargetFacing.smooth(
					dronePosition,
					droneVelocity,
					playerPosition,
					2 * Math.PI,
					this.universe.clock.spf
				)

			else
				droneVelocity.a = Math.PI / 4
		}
	}
}
