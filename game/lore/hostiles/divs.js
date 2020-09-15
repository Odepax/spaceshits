import { Link } from "../../core/engine.js"
import { Transform } from "../../math/transform.js"
import { Motion } from "../../physic/motion.js"
import { Random } from "../../math/random.js"
import { Collider } from "../../physic/collision.js"
import { Tags } from "../tags.js"
import { RammingDamage } from "../../logic/ramming-damage.js"
import { HpGauge } from "../../logic/life-and-death.js"
import { Render } from "../../graphic/render.js"
import { Sprites } from "../../graphic/assets/sprites.js"
import { OnAddExplosion, OnRemoveExplosion } from "../../graphic/vfx.js"
import { Colors } from "../../graphic/assets/colors.js"
import { Universe } from "../../core/engine.js"

export class Div extends Link {
	/** @param {Transform} position */
	constructor(position) {
		super(
			new Motion(position, Transform.angular(Random.angle(), Random.between(100, 200), Random.sign() * 0.2), 1),

			new Collider(21, Tags.hostile | Tags.ship),
			new RammingDamage(13, Tags.player | Tags.ship, RammingDamage.bounceOnDamage),

			new HpGauge(101),

			new Render(Sprites.div),
			new OnAddExplosion(1, [ Colors.white, Colors.light, Colors.orange, Colors.teal ], 50),
			new OnRemoveExplosion(0.5, [ Colors.teal, Colors.black, Colors.grey, Colors.orange ], 100)
		)
	}
}

export class DivShard extends Link {
	/** @param {Transform} position */
	constructor(position) {
		super(
			new Motion(position, Transform.angular(position.a, Random.between(100, 200), Random.sign() * Math.PI), 1),

			new Collider(21, Tags.hostile | Tags.ship),
			new RammingDamage(13, Tags.player | Tags.ship, RammingDamage.bounceOnDamage),

			new HpGauge(101),

			new Render(Sprites.divShard),
			new OnRemoveExplosion(0.5, [ Colors.yellow, Colors.black, Colors.grey, Colors.silver ], 100)
		)
	}
}

/** @implements {import("../../core/engine").Routine */
export class DivDivisionRoutine {
	/** @param {Universe} universe */
	constructor(universe) {
		this.universe = universe
	}

	/** @param {Link} link */
	onRemove(link) {
		if (link instanceof Div)
			for (const i of [ 1, 2, 3, 4, 6, 5 ])
				this.universe.add(new DivShard(
					link.get(Motion)[0]
						.position
						.copy
						.rotateBy(i * Math.PI / 3)
						.relativeOffsetBy({ x: 37, y: 0 })
				))
	}

	onAdd() {} // Nothing to do here...
	onStep() {}
}
