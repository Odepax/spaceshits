import { Link } from "../../core/engine.js"
import { Transform } from "../../math/transform.js"
import { Motion } from "../../physic/motion.js"
import { Collider } from "../../physic/collision.js"
import { Tags } from "../tags.js"
import { RammingDamage } from "../../logic/ramming-damage.js"
import { Render } from "../../graphic/render.js"
import { Sprites } from "../../graphic/assets/sprites.js"
import { OnRemoveExplosion, OnAddExplosion, AuraFx } from "../../graphic/vfx.js"
import { Colors } from "../../graphic/assets/colors.js"
import { HpGauge } from "../../logic/life-and-death.js"
import { AutoWeaponModule } from "../../logic/auto-weapon.js"
import { Player } from "../player.js"
import { Universe } from "../../core/engine.js"
import { TargetFacing } from "../../math/target-facing.js"

export class BossDrone extends Link {
	/** @param {Transform} position */
	constructor(position) {
		super(
			new Motion(position, Transform.angular(position.a, 200), 1),

			new Collider(21, Tags.hostile | Tags.ship),
			new RammingDamage(13, Tags.player | Tags.ship, RammingDamage.bounceOtherOnDamage),

			new HpGauge(101),

			new AutoWeaponModule(3, drone => [ -10, +10 ].map(i =>
				new BossDroneBullet(
					drone.get(Motion)[0]
						.position
						.copy
						.relativeOffsetBy({ x: 37, y: i })
				)
			)),

			new Render(Sprites.turretBossDrone),
			new OnAddExplosion(1, [ Colors.white, Colors.light, Colors.pink, Colors.red ], 50),
			new OnRemoveExplosion(0.5, [ Colors.red, Colors.black, Colors.grey, Colors.blue ], 100)
		)
	}
}

class BossDroneBullet extends Link {
	/** @param {Transform} position */
	constructor(position) {
		const r = 7

		super(
			new Motion(position, Transform.angular(position.a, 800), Motion.removeOnEdges),

			new Collider(r, Tags.hostile | Tags.bullet),
			new RammingDamage(9, Tags.player | Tags.ship, RammingDamage.removeOnDamage),

			new Render(Sprites.turretBossDroneBullet),
			new OnRemoveExplosion(r / 15, [ Colors.light, Colors.red, Colors.blue ], r * 1.5)
		)
	}
}

/** @implements {import("../../core/engine").Routine */
export class BossDroneAimRoutine {
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
		if (!this.player && link instanceof Player)
			this.player = link

		else if (link instanceof BossDrone)
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
