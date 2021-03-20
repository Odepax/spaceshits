type Constructor<T> = new (...args: any[]) => T
type Trait = object
type Mark = symbol
type Token = Constructor<Trait> | Mark
type Value<T> = T extends Constructor<infer X> ? X : Mark

export class Link {
	static new() { return new Link() } // Sealed/final class.
	private constructor() {}

	private inner = new Map<Token, Value<any>>()

	add<T extends Token>(trait: Value<T>) {
		const token = typeof trait == "symbol"
			? trait
			: trait.constructor as Token

		this.inner.set(token, trait)
	}

	set<T extends Token>(trait: T, value: Value<T>) {
		this.inner.set(trait, value)
	}

	has<T extends Token>(trait: T): boolean {
		return this.inner.has(trait)
	}

	hasAll<T extends Token[]>(...traits: T): boolean {
		for (const trait of traits)
			if (!this.inner.has(trait))
				return false

		return true
	}

	hasAny<T extends Token[]>(...traits: T): boolean {
		for (const trait of traits)
			if (this.inner.has(trait))
				return true

		return false
	}

	get<T extends Token>(trait: T): Value<T> {
		return this.inner.get(trait) as any
	}

	getAll<T extends Token[]>(...traits: T): { [i in keyof T]: Value<T[i]> } {
		return traits.map(it => this.inner.get(it)) as any
	}

	pick<T extends { [property: string]: Token }, S extends { [i in keyof T]: Value<T[i]> }>(traits: T, target: S = {} as S): S {
		for (const i in traits)
			target[i] = this.inner.get(traits[i]) as any

		return target
	}
}

export class Universe {
	clock = {
		/** Seconds-Per-Frame, i.e. enlapsed time, in seconds, since the last step. */
		spf: 0,
		/** Enlapsed time, in seconds, since this universe first started. */
		time: 0,
		timeFactor: 1
	}

	private isRunning = false
	private lastTimestamp = 0

	private routines: Routine[] = []

	constructor() {
		this.step = this.step.bind(this)
	}

	register(routine: Routine) {
		this.routines.push(routine)

		routine.onRegistered(this)
	}

	add(link: Link) {
		for (const routine of this.routines)
			routine.onAdd(link)
	}

	remove(link: Link) {
		for (const routine of this.routines)
			routine.onRemove(link)
	}

	start() {
		this.isRunning = true

		for (const routine of this.routines)
			routine.onStart()

		requestAnimationFrame(timestamp => {
			this.lastTimestamp = timestamp

			requestAnimationFrame(this.step) // Bound in the constructor.
		})
	}

	step(timestamp: number) {
		this.clock.spf = 0.001 * (timestamp - this.lastTimestamp) * this.clock.timeFactor
		this.clock.time += this.clock.spf
		this.lastTimestamp = timestamp

		for (const routine of this.routines)
			routine.onStep()

		if (this.isRunning)
			requestAnimationFrame(this.step) // Bound in the constructor.
	}

	stop() {
		this.isRunning = false

		for (const routine of this.routines)
			routine.onStop()
	}
}

export abstract class Routine {
	protected universe: Universe

	/**
	 * Called whenever this routine is registered in a universe.
	 * @param universe The universe in which this routine has been registered.
	 */
	onRegistered(universe: Universe) {
		this.universe = universe
	}

	/**
	 * Called whenever a link is added to the universe in which this routine is registered.
	 * @param link The link that has been added.
	 */
	onAdd(link: Link) {}

	/**
	 * Called whenever a link is removed from the universe in which this routine is registered.
	 * @param link The link that has been removed.
	 */
	onRemove(link: Link) {}

	/**
	 * Called whenever the universe in which this routine is registered starts.
	 */
	onStart() {}

	/**
	 * Called whenever the universe in which this routine is registered steps forward in time.
	 */
	onStep() {}

	/**
	 * Called whenever the universe in which this routine is registered stops.
	 */
	onStop() {}
}
