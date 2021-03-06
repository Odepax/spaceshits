import { Link } from "../core/engine.js"
import { Motion } from "./motion.js"
import { Collision } from "../math/collision.js"

export class Collider {
	/** @param {number} radius */
	constructor(radius) {
		this.radius = radius
	}
}

/** @private @type { WeakMap<object, number>} */
const ids = new WeakMap()

let nextId = 0

/** @private @param {object} a @param {object} b */
function unorderedPairingHash(a, b) {
	a = ids.get(a) || (ids.set(a, ++nextId), nextId)
	b = ids.get(b) || (ids.set(b, ++nextId), nextId)

	// Cantor pairing function.
	// Stolen from [https://stackoverflow.com/a/13871379].
	// https://stackoverflow.com/questions/919612/mapping-two-integers-to-one-in-a-unique-and-deterministic-way/13871379#13871379
	// https://math.stackexchange.com/questions/23503/create-unique-number-from-2-numbers
	// https://gist.github.com/ma11hew28/9457506
	const n = Math.min(a, b)
	const m = Math.max(a, b)

	return 0.5 * (n + m) * (n + m + 1) + n
}

export class CollisionRegistry {
	constructor() {
		/** @private @type {Set<number>} */
		this.ongoingCollisions = new Set()

		/** @private @type {Set<number>} */
		this.newCollisions = new Set()

		/** @private @type {Set<number>} */
		this.endedCollisions = new Set()
	}

	/** @param {Link} a @param {Link} b */
	areColliding(a, b) {
		return this.ongoingCollisions.has(unorderedPairingHash(a, b))
	}

	/** @param {Link} a @param {Link} b */
	startedColliding(a, b) {
		return this.newCollisions.has(unorderedPairingHash(a, b))
	}

	/** @param {Link} a @param {Link} b */
	stopedColliding(a, b) {
		return this.endedCollisions.has(unorderedPairingHash(a, b))
	}
}

/** @implements {import("../core/engine").Routine} */
export class CollisionDetectionRoutine {
	/** @param {CollisionRegistry} collisions */
	constructor(collisions) {
		this.collisions = collisions

		/** @private @type {Set<Link>} */
		this.links = new Set()
	}

	/** @param {Link} link */
	onAdd(link) {
		if (link.has(Motion, Collider))
			this.links.add(link)
	}

	/** @param {Link} link */
	onRemove(link) {
		this.links.delete(link)
	}

	onStep() {
		for (const collision of this.collisions.newCollisions)
			this.collisions.ongoingCollisions.add(collision)

		this.collisions.newCollisions.clear()
		this.collisions.endedCollisions.clear()

		const links = Array.from(this.links)

		for (let i = 0; i < links.length; ++i)
		for (let j = i + 1; j < links.length; ++j) {
			const collision = unorderedPairingHash(links[i], links[j])

			if (this.testCollision(links[i], links[j])) {
				if (!this.collisions.ongoingCollisions.has(collision))
					this.collisions.newCollisions.add(collision)
			}

			else {
				if (this.collisions.ongoingCollisions.has(collision))
					this.collisions.endedCollisions.add(collision)
			}
		}

		for (const collision of this.collisions.endedCollisions)
			this.collisions.ongoingCollisions.delete(collision)
	}

	/** @private @param {Link} a @param {Link} b */
	testCollision(a, b) {
		const [ { position: { x: ax, y: ay } }, { radius: ar } ] = a.get(Motion, Collider)
		const [ { position: { x: bx, y: by } }, { radius: br } ] = b.get(Motion, Collider)

		return Collision.testCircles(ax, ay, ar, bx, by, br)
	}
}
