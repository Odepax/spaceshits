import { Link, Universe } from "../../core/engine.js"
import { Colors } from "../../graphic/assets/colors.js"
import { Sprites } from "../../graphic/assets/sprites.js"
import { Render } from "../../graphic/render.js"
import { OnAddExplosion, OnRemoveExplosion } from "../../graphic/vfx.js"
import { HostileShip, HostileStuff } from "../../logic/hostile.js"
import { HpGauge } from "../../logic/life-and-death.js"
import { PlayerShip } from "../../logic/player.js"
import { RammingDamage } from "../../logic/ramming-damage.js"
import { Angle } from "../../math/angle.js"
import { Random } from "../../math/random.js"
import { Transform } from "../../math/transform.js"
import { Collider } from "../../physic/collision.js"
import { Motion } from "../../physic/motion.js"

/** @param {Transform} position */
export function crasher(position) {
	return new Link(
		HostileStuff,
		HostileShip,

		new Motion(position, Transform.angular(Random.angle(), Random.between(100, 200), Random.sign() * 2 * Math.PI), 1),

		new Collider(25.5),
		new RammingDamage(17, PlayerShip, RammingDamage.bounceOnDamage),

		new HpGauge(101),

		new Render(Sprites.crasher),
		new OnAddExplosion(1, [ Colors.white, Colors.light, Colors.silver, Colors.orange ], 80),
		new OnRemoveExplosion(0.5, [ Colors.orange, Colors.black, Colors.grey, Colors.silver ], 150)
	)
}

const HostileSmartCrasher = Symbol()

/** @param {Transform} position */
export function smartCrasher(position) {
	return new Link(
		HostileStuff,
		HostileShip,
		HostileSmartCrasher,

		new Motion(position, Transform.angular(Random.angle(), Random.between(100, 200), Random.sign() * 2 * Math.PI), 1),

		new Collider(25.5),
		new RammingDamage(17, PlayerShip, RammingDamage.bounceOnDamage),

		new HpGauge(101),

		new Render(Sprites.smartCrasher),
		new OnAddExplosion(1, [ Colors.white, Colors.light, Colors.purple, Colors.pink ], 80),
		new OnRemoveExplosion(0.5, [ Colors.pink, Colors.black, Colors.grey, Colors.purple ], 150)
	)
}

/** @implements {import("../../core/engine").Routine */
export class SmartCrasherAttractionRoutine {
	/** @param {Universe} universe */
	constructor(universe) {
		this.universe = universe

		/** @private @type {Link} */
		this.player = null

		/** @private @type {Set<Link>} */
		this.crashers = new Set()
	}

	/** @param {Link} link */
	onAdd(link) {
		if (!this.player && link.has(PlayerShip))
			this.player = link

		else if (link.has(HostileSmartCrasher))
			this.crashers.add(link)
	}

	/** @param {Link} link */
	onRemove(link) {
		if (link == this.player)
			this.player = null

		else
			this.crashers.delete(link)
	}

	onStep() {
		const steeringSpeed = Math.PI / 4

		if (this.player)
		for (const crasher of this.crashers) {
			const [ { position: crasherPosition, velocity: crasherVelocity } ] = crasher.get(Motion)
			const [ { position: playerPosition } ] = this.player.get(Motion)

			const directionAngle = Angle.shortArcBetween(crasherVelocity.d, crasherPosition.directionTo(playerPosition))

			if (Math.abs(directionAngle) < steeringSpeed * this.universe.clock.spf)
				crasherVelocity.d += directionAngle

			else
				crasherVelocity.d += Math.sign(directionAngle) * steeringSpeed * this.universe.clock.spf
		}
	}
}
