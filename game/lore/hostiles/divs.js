import { Link, Universe } from "../../core/engine.js"
import { Colors } from "../../graphic/assets/colors.js"
import { Sprites } from "../../graphic/assets/sprites.js"
import { Render } from "../../graphic/render.js"
import { OnAddExplosion, OnRemoveExplosion } from "../../graphic/vfx.js"
import { HostileShip, HostileStuff } from "../../logic/hostile.js"
import { HpGauge } from "../../logic/life-and-death.js"
import { PlayerShip } from "../../logic/player.js"
import { RammingDamage } from "../../logic/ramming-damage.js"
import { Random } from "../../math/random.js"
import { Transform } from "../../math/transform.js"
import { Collider } from "../../physic/collision.js"
import { Motion } from "../../physic/motion.js"
import { DIV_COLLISION_DAMAGE, DIV_HP, DIV_SHARD_COLLISION_DAMAGE, DIV_SHARD_HP, DIV_SHARD_SPEED_MAX, DIV_SHARD_SPEED_MIN, DIV_SHARD_SPIN_MAX, DIV_SHARD_SPIN_MIN, DIV_SPEED_MAX, DIV_SPEED_MIN, DIV_SPIN_MAX, DIV_SPIN_MIN } from "../game-balance.js"

const HostileDiv = Symbol

/** @param {Transform} position */
export function div(position) {
	return new Link(
		HostileStuff,
		HostileShip,
		HostileDiv,

		new Motion(position, Transform.angular(Random.angle(), Random.between(DIV_SPEED_MIN, DIV_SPEED_MAX), Random.sign() * Random.between(DIV_SPIN_MIN, DIV_SPIN_MAX)), 1),

		new Collider(25.5),
		new RammingDamage(DIV_COLLISION_DAMAGE, PlayerShip, RammingDamage.bounceOnDamage),

		new HpGauge(DIV_HP),

		new Render(Sprites.div),
		new OnAddExplosion(1, [ Colors.white, Colors.light, Colors.orange, Colors.teal ], 80),
		new OnRemoveExplosion(0.5, [ Colors.teal, Colors.black, Colors.grey, Colors.orange, Colors.yellow ], 200)
	)
}

/** @param {Transform} position */
export function divShard(position) {
	return new Link(
		HostileStuff,
		HostileShip,

		new Motion(position, Transform.angular(position.a + Math.PI, Random.between(DIV_SHARD_SPEED_MIN, DIV_SHARD_SPEED_MAX), Random.sign() * Random.between(DIV_SHARD_SPIN_MIN, DIV_SHARD_SPIN_MAX)), 1),

		new Collider(11),
		new RammingDamage(DIV_SHARD_COLLISION_DAMAGE, PlayerShip, RammingDamage.bounceOnDamage),

		new HpGauge(DIV_SHARD_HP),

		new Render(Sprites.divShard),
		new OnRemoveExplosion(0.5, [ Colors.yellow, Colors.black, Colors.grey, Colors.light ], 100)
	)
}

/** @implements {import("../../core/engine").Routine */
export class DivDivisionRoutine {
	/** @param {Universe} universe */
	constructor(universe) {
		this.universe = universe
	}

	/** @param {Link} link */
	onRemove(link) {
		if (link.has(HostileDiv)) {
			const divPosition = link.get(Motion)[0].position

			for (const i of [ 1, 2, 3, 4, 6, 5 ])
				this.universe.add(divShard(
					divPosition
						.copy
						.rotateBy(i * Math.PI / 3)
						.relativeOffsetBy({ x: -17.8, y: 0 })
				))
		}
	}

	onAdd() {} // Nothing to do here...
	onStep() {}
}
