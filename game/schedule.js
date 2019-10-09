import { Universe, Link } from "./engine.js"
import { MatchSubRoutine } from "./routine.js"

export const second = 1
export const seconds = 1

export const time = 1
export const times = 1

export function loop(
	/** @type {Universe} */ universe,
	/** @type {number} */ interval,
	/** @type {number|(() => boolean)} */ predicate,
	/** @type {(i: number) => void} */ action
) {
	const link = new Link([
		new Loop(interval, predicate, action)
	])

	universe.add(link)

	return {
		stop() {
			universe.remove(link)
		}
	}
}

class Loop {
	constructor(/** @type {number} */ interval, /** @type {number|(() => boolean)} */ predicate, /** @type {(i: number) => void} */ action) {
		this.interval = interval
		this.predicate = predicate
		this.action = action
		this.nextIterationTime = 0
		this.i = 0
	}
}

export class LoopRoutine extends MatchSubRoutine {
	constructor(/** @type {Universe} */ universe) {
		super([ Loop ])

		this.universe = universe
	}

	/** @param {{ Loop: Loop } */
	onAdd({ Loop }) {
		Loop.nextIterationTime = this.universe.clock.time
	}

	onSubStep(/** @type {{ Loop: Loop }} */ link) {
		const { Loop } = link

		if (Loop.nextIterationTime < this.universe.clock.time) {
			if ((typeof Loop.predicate == "function" && Loop.predicate()) || Loop.i < Loop.predicate) {
				Loop.action(Loop.i)
				++Loop.i
				Loop.nextIterationTime = this.universe.clock.time + Loop.interval
			} else {
				this.universe.remove(link)
			}
		}
	}
}

export function wait(
	/** @type {Universe} */ universe,
	/** @type {number|(() => boolean)} */ event,
	/** @type {() => void} */ action
) {
	const link = new Link([
		new Wait(event, action)
	])

	universe.add(link)

	return {
		stop() {
			universe.remove(link)
		}
	}
}

class Wait {
	constructor(/** @type {number|(() => boolean)} */ event, /** @type {() => void} */ action) {
		this.event = event
		this.action = action
	}
}

export class WaitRoutine extends MatchSubRoutine {
	constructor(/** @type {Universe} */ universe) {
		super([ Wait ])

		this.universe = universe
	}

	/** @param {{ Wait: Wait } */
	onAdd({ Wait }) {
		if (typeof Wait.event == "number") {
			Wait.event = this.universe.clock.time + Wait.event
		}
	}

	onSubStep(/** @type {{ Wait: Wait }} */ link) {
		const { Wait } = link

		if ((typeof Wait.event == "function" && Wait.event()) || Wait.event < this.universe.clock.time) {
			Wait.action()

			this.universe.remove(link)
		}
	}
}

export function watch(
	/** @type {Universe} */ universe,
	/** @type {() => boolean} */ event,
	/** @type {() => void} */ action
) {
	const link = new Link([
		new Watch(event, action)
	])

	universe.add(link)

	return {
		stop() {
			universe.remove(link)
		}
	}
}

class Watch {
	constructor(/** @type {() => boolean} */ event, /** @type {() => void} */ action) {
		this.event = event
		this.action = action
	}
}

export class WatchRoutine extends MatchSubRoutine {
	constructor() {
		super([ Watch ])
	}

	onSubStep(/** @type {{ Watch: Watch }} */ link) {
		const { Watch } = link

		if (Watch.event()) {
			Watch.action()
		}
	}
}

export function throttle(/** @type {number} */ interval, /** @type {() => void} */ action) {
	let last = 0
	let timer = 0

	return () => {
		const now = +new Date()

		if (last + interval * 1000 < now ) {
			last = now
			action()
		} else {
			clearTimeout(timer)

			timer = setTimeout(() => {
				last = now
				action()
			}, interval * 1000)
		}
	}
}
