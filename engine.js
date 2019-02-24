const Hook = {
	afterClockTicks: Symbol("Hook/Universe: After a universe lives a cycle"),
	afterUniverseInstanciatesLink: Symbol("Hook/Link: After a universe instanciates an link"),
	afterLinkInstantiatesTrait: Symbol("Hook/Trait: After an link instantiates a trait"),
	beforeUniverseAddsTrait: Symbol("Hook/Trait: Before a universe adds a trait"),
	afterUniverseAddsTrait: Symbol("Hook/Trait: After a universe adds a trait"),
	afterUniverseUpdatesTrait: Symbol("Hook/Trait: After a universe updates a trait"),
	afterUniverseRemovesTrait: Symbol("Hook/Trait: After a universe removes a trait"),
}

const Poll = {
	traitHasBehavior: Symbol("Poll/Trait: Determines if a trait has update or removal hooks"),
	lastUniverseTimestamp: Symbol("Poll/Universe: Gets the last timestamp in milli-seconds")
}

class Universe {
	constructor() {
		this.links = new Set()
		this.traits = new Set()

		this.isRunning = false
		this.tickTime = 0

		this[Poll.lastUniverseTimestamp] = 0
	}

	add(linkConstructor, ...linkParameters) {
		const link = new linkConstructor(this)

		link[Hook.afterUniverseInstanciatesLink](...linkParameters)

		for (const trait of link.traits) {
			if (!this.traits.has(trait)) {
				trait[Hook.beforeUniverseAddsTrait]()

				if (trait[Poll.traitHasBehavior]) {
					this.traits.add(trait)
				}

				trait[Hook.afterUniverseAddsTrait]()
			}
		}

		this.links.add(link)

		return link
	}

	remove(link) {
		if (this.links.has(link)) {

			for (const trait of link.traits) {
				this.traits.delete(trait)
				trait[Hook.afterUniverseRemovesTrait]()
			}

			this.links.delete(link)
		}
	}

	update() {
		for (const trait of this.traits) {
			trait[Hook.afterUniverseUpdatesTrait]()
		}
	}

	run() {
		this.isRunning = true

		requestAnimationFrame(timestamp => {
			this[Poll.lastUniverseTimestamp] = timestamp

			requestAnimationFrame(timestamp => this[Hook.afterClockTicks](timestamp))
		})
	}

	freeze() {
		this.isRunning = false
	}

	[Hook.afterClockTicks](timestamp) {
		this.tickTime = (timestamp - this[Poll.lastUniverseTimestamp]) * MILLI_SECONDS
		this[Poll.lastUniverseTimestamp] = timestamp

		this.update()

		if (this.isRunning) {
			requestAnimationFrame(timestamp => this[Hook.afterClockTicks](timestamp))
		}
	}
}

class Link {
	constructor(universe) {
		this.universe = universe
		this.traits = new Set()
	}

	add(traitConstructor, ...traitParameters) {
		if (traitConstructor.prototype instanceof Trait || traitConstructor === Trait) {
			if (!this.traits.has(traitConstructor)) {
				const trait = new traitConstructor(this)

				trait[Hook.afterLinkInstantiatesTrait](...traitParameters)

				this.traits.add(trait)

				return this[traitConstructor.name] = trait
			}
		} else {
			return this[traitConstructor.name] = new traitConstructor(...traitParameters)
		}
	}

	onInitialize() {}

	[Hook.afterUniverseInstanciatesLink]() { this.onInitialize(...arguments) }
}

class Trait {
	constructor(link) {
		this.link = link
		this.universe = link.universe

		this[Poll.traitHasBehavior] = !!(this.onUpdate || this.onRemoving || this.onRemoved)
	}

	onInitialize() {}
	onAdding() {}
	onAdded() {}
	// onUpdate() {}
	// onRemoving() {}
	// onRemoved() {}

	[Hook.afterLinkInstantiatesTrait]() { this.onInitialize(...arguments) }
	[Hook.beforeUniverseAddsTrait]() { this.onAdding() }
	[Hook.afterUniverseAddsTrait]() { this.onAdded() }
	[Hook.afterUniverseRemovesTrait]() { this.onRemoved && this.onRemoved() }
	[Hook.afterUniverseUpdatesTrait]() {
		this.onUpdate && this.onUpdate()

		if (this.onRemoving && this.onRemoving()) {
			this.universe.remove(this.link)
		}
	}
}
