import { Link, Universe } from "../core/engine.js"
import { Transform } from "../math/transform.js"
import { Force } from "../math/force.js"
import { AutoIteratingRoutine } from "../core/routines.js"

export class Motion {
	/** @param edgeBounceFactor Strictly positive, 0 to remove on edges (default), -1 to ignore. */
	constructor(position = new Transform(), velocity = new Transform(), edgeBounceFactor = 0) {
		this.position = position
		this.velocity = velocity
		this.edgeBounceFactor = edgeBounceFactor
	}

	get bouncesOnEdges() {
		return 0 < this.edgeBounceFactor
	}

	get isRemovedOnEdges() {
		return this.edgeBounceFactor == 0
	}
}

Motion.removeOnEdges = 0
Motion.ignoreEdges = -1

export class MotionRoutine extends AutoIteratingRoutine {
	/** @param {Universe} universe @param {HTMLCanvasElement} canvas */
	constructor(universe, canvas) {
		super()

		this.universe = universe
		this.canvas = canvas
	}

	/** @param {Link} link */
	accepts(link) {
		return link.has(Motion)
	}

	/** @param {Link} link */
	onSubStep(link) {
		const [ motion ] = link.get(Motion)

		Force.apply(motion.velocity, motion.position, Math.min(this.universe.clock.spf, 10))

		if (motion.isRemovedOnEdges && (
			   motion.position.x < 0 || this.canvas.offsetWidth < motion.position.x
			|| motion.position.y < 0 || this.canvas.offsetHeight < motion.position.y
		))
			this.universe.remove(link)

		else if (motion.bouncesOnEdges) {
			if (motion.position.x < 0) {
				motion.position.x = 0
				motion.velocity.x *= -motion.edgeBounceFactor
			}

			else if (this.canvas.offsetWidth < motion.position.x) {
				motion.position.x = this.canvas.offsetWidth
				motion.velocity.x *= -motion.edgeBounceFactor
			}

			if (motion.position.y < 0) {
				motion.position.y = 0
				motion.velocity.y *= -motion.edgeBounceFactor
			}

			else if (this.canvas.offsetHeight < motion.position.y) {
				motion.position.y = this.canvas.offsetHeight
				motion.velocity.y *= -motion.edgeBounceFactor
			}
		}
	}
}
