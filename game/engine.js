const MILLI_SECONDS = 0.001

/**
 * @typedef {object} Clock
 * @property {number} spf
 * @property {number} time
 * @property {number} timeFactor
 */

/**
 * @template T
 * @typedef {{new(): T, prototype: T}} Constructor
 */

/**
 * @template T
 * @typedef {{[property: string]: T}} Bag
 */

export class Universe {
	constructor() {
		/** @type {Clock} */ this.clock = {
			spf: 0,
			time: 0,
			timeFactor: 1,

			/** @private */ isRunning: false,
			/** @private */ lastTimestamp: 0
		}

		/** @private @type {Map<Routine, Set<Link>>} */ this.routines = new Map()
	}

	register(/** @type {Routine} */ routine) {
		this.routines.set(routine, new Set())
	}

	unregister(/** @type {Routine} */ routine) {
		this.routines.delete(routine)
	}

	add(/** @type {Link} */ link) {
		for (const [ routine, associatedLinks ] of this.routines) {
			if (routine.test(link) && !associatedLinks.has(link)) {
				associatedLinks.add(link)
				routine.onAdd(link)
			}
		}
	}

	remove(/** @type {Link} */ link) {
		for (const [ routine, associatedLinks ] of this.routines) {
			if (associatedLinks.has(link)) {
				associatedLinks.delete(link)
				routine.onRemove(link)
			}
		}
	}

	start() {
		this.clock.isRunning = true

		requestAnimationFrame(timestamp => {
			this.clock.spf = (timestamp - this.clock.lastTimestamp) * MILLI_SECONDS * this.clock.timeFactor
			this.clock.time += this.clock.spf
			this.clock.lastTimestamp = timestamp

			requestAnimationFrame(timestamp => this.step(timestamp))
		})
	}

	stop() {
		this.clock.isRunning = false
	}

	step(timestamp) {
		this.clock.spf = (timestamp - this.clock.lastTimestamp) * MILLI_SECONDS * this.clock.timeFactor
		this.clock.time += this.clock.spf
		this.clock.lastTimestamp = timestamp

		for (const [ routine, associatedLinks ] of this.routines) {
			routine.onStep(associatedLinks)
		}

		if (this.clock.isRunning) {
			requestAnimationFrame(timestamp => this.step(timestamp))
		}
	}
}

export class Link {
	constructor(/** @type {Trait[]} */ traits = []) {
		for (const trait of traits) {
			this[trait.constructor.name] = trait
		}
	}
}

/** @typedef {object} Trait */

export class Routine {
	test(/** @type {Link} */ link) {
		return false
	}

	onAdd(/** @type {Link} */ link) {}
	onStep(/** @type {Iterable<Link>} */ links) {}
	onRemove(/** @type {Link} */ link) {}
}
