const traitTokens = new Map()

export class Link extends Map {
	constructor(...traits) {
		super()

		for (const trait of traits)
			super.set(traitTokens.get(trait) ?? (
				typeof trait == "symbol"
					? (traitTokens.set(trait, trait), trait)
					: (traitTokens.set(trait, trait.constructor), trait.constructor)
			), trait)
	}

	has(...traits) {
		for (const trait of traits)
			if (!super.has(trait))
				return false

		return true
	}

	get(...traits) {
		return traits.map(it => super.get(it))
	}
}

const MILLI_SECONDS = 0.001

export class Universe extends Set {
	constructor(width, height) {
		super()

		this.width = width
		this.height = height

		this.clock = {
			spf: 0,
			time: 0,
			timeFactor: 1,
			isRunning: false,
			lastTimestamp: 0
		}
	}

	register(routine) {
		super.add(routine)
	}

	add(link) {
		for (const routine of this)
			routine.onAdd(link)
	}

	remove(link) {
		for (const routine of this)
			routine.onRemove(link)
	}

	start() {
		this.clock.isRunning = true

		requestAnimationFrame(timestamp => {
			this.clock.lastTimestamp = timestamp

			requestAnimationFrame(timestamp => this.step(timestamp))
		})
	}

	stop() {
		this.clock.isRunning = false
	}

	/** @private @param {number} timestamp */
	step(timestamp) {
		this.clock.spf = (timestamp - this.clock.lastTimestamp) * MILLI_SECONDS * this.clock.timeFactor
		this.clock.time += this.clock.spf
		this.clock.lastTimestamp = timestamp

		for (const routine of this)
			routine.onStep()

		if (this.clock.isRunning)
			requestAnimationFrame(timestamp => this.step(timestamp))
	}
}
