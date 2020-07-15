import { Link } from "../core/engine.js"
import { Collision } from "../math/collision.js"
import { Motion } from "./motion.js"
import { SetRoutine } from "../core/routines.js"

export class Collider {
	/** @param {number} radius @param {number} tag */
	constructor(radius, tag) {
		this.radius = radius
		this.tag = tag
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

// TODO: just fix that horrible stinky crap.

/** @private */
class LazyCollisionMap {
	//constructor() {
	//	/** @private @type {Map<number, boolean>} */
	//	this.cache = new Map()
	//}

	///** @param {Link} a @param {Link} b */
	//get(a, b) {
	//	const key = unorderedPairingHash(a, b)

	//	return this.cache.get(key)
	//}

	///** @param {Link} a @param {Link} b */
	//getOrCheck(a, b) {
	//	const key = unorderedPairingHash(a, b)
	//	let collision

	//	return this.cache.get(key) ?? (this.cache.set(key, collision = this.testCollision(a, b)), collision)
	//}

	//clear() {
	//	return this.cache.clear()
	//}

	/** @private @param {Link} a @param {Link} b */
	static testCollision(a, b) {
		const [ { position: { x: ax, y: ay } }, { radius: ar } ] = a.get(Motion, Collider)
		const [ { position: { x: bx, y: by } }, { radius: br } ] = b.get(Motion, Collider)

		return Collision.testCircles(ax, ay, ar, bx, by, br)
	}
}

export class CollisionDetector { // TODO: rename to "CollisionRegistry" ?
	constructor() {
		/** @private @type {Set<number>} */
		this.cache = new Set()

	//	this.ongoingCollisions = new LazyCollisionMap()
	//	this.previousCollisions = new LazyCollisionMap()
	}

	/** @param {Link} a @param {Link} b */
	areColliding(a, b) {
		//return this.ongoingCollisions.getOrCheck(a, b)
		return this.cache.has(unorderedPairingHash(a, b))
	}

	///** @param {Link} a @param {Link} b */
	//startedColliding(a, b) {
	//	return this.ongoingCollisions.getOrCheck(a, b) && !this.previousCollisions.get(a, b)
	//}

	///** @param {Link} a @param {Link} b */
	//stopedColliding(a, b) {
	//	return this.previousCollisions.get(a, b) && !this.ongoingCollisions.getOrCheck(a, b)
	//}

	///** @private */
	//step() {
	//	const previous = this.previousCollisions

	//	this.previousCollisions = this.ongoingCollisions
	//	this.ongoingCollisions = (previous.clear(), previous)
	//}
}

/** @implements {import("../core/engine").Routine} */
export class CollisionDetectionRoutine extends SetRoutine {
	/** @param {CollisionDetector} collisions */
	constructor(collisions) {
		super()

		this.collisions = collisions
	}

	/** @param {Link} link */
	accepts(link) {
		return link.has(Motion, Collider)
	}

	onStep() {
		this.collisions.cache.clear()

		for (const a of this.links) // TODO: are we double-testing double-looping?
		for (const b of this.links)
			if (a != b && LazyCollisionMap.testCollision(a, b))
				this.collisions.cache.add(unorderedPairingHash(a, b))
	}

	//onStep() {
	//	this.collisions.step()
	//}

	// Nothing to do here...
	//onAdd() {}
	//onRemove() {}
}
