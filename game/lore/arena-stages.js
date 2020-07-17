import { Universe, Link } from "../core/engine.js"
import { Collider } from "../physic/collision.js"
import { Tags } from "./tags.js"
import { Player } from "./player.js"

/** @abstract */
export class ArenaStage {
	constructor() {
		this.isOver = false

		/** @private @type {ArenaStage} */
		this.next = null
	}

	/** @abstract @param {Universe} universe */
	onEnter(universe) {}

	/** @abstract @param {Universe} universe @param {number} remainingHostileCount */
	onStep(universe, remainingHostileCount) {}
}

/** Nothing happens for a certain time. */
export class CalmStage extends ArenaStage {
	/** @param {number} delay */
	constructor(delay) {
		super()

		this.delay = delay

		/** @private */
		this.overTime = 0
	}

	/** @param {Universe} universe */
	onEnter(universe) {
		this.overTime = universe.clock.time + this.delay
	}

	/** @param {Universe} universe */
	onStep(universe) {
		if (this.overTime < universe.clock.time)
			this.isOver = true
	}
}

/** A batch of hostiles burst in. */
export class SwarmStage extends ArenaStage {
	/** @param {() => Iterable<Link>} hostilesFactory */
	constructor(hostilesFactory) {
		super()

		this.hostilesFactory = hostilesFactory
	}

	/** @param {Universe} universe */
	onEnter(universe) {
		for (const hostile of this.hostilesFactory())
			universe.add(hostile)

		this.isOver = true
	}
}

/** Hostiles spawn regularly until no hostile is left. */
export class WavesStage extends ArenaStage {
	/** @param {number} spawnInterval @param {number} maxSpawnCount @param {() => Iterable<Link>} hostilesFactory */
	constructor(spawnInterval, maxSpawnCount, hostilesFactory) {
		super()

		this.spawnInterval = spawnInterval
		this.maxSpawnCount = maxSpawnCount
		this.hostilesFactory = hostilesFactory

		/** @private */
		this.nextSpawnTime = 0
	}

	/** @param {Universe} universe */
	onStep(universe) {
		if (this.nextSpawnTime < universe.clock.time)
			if (--this.maxSpawnCount < 0)
				this.isOver = true

			else {
				this.nextSpawnTime = universe.clock.time + this.spawnInterval

				for (const hostile of this.hostilesFactory())
					universe.add(hostile)
			}
	}
}

/** Nothing happens until no hostile is left. */
export class FightStage extends ArenaStage {
	/** @param {number} remainingHostileCount */
	onStep(_, remainingHostileCount) {
		this.isOver = remainingHostileCount == 0
	}
}

/** @implements {import("../core/engine").Routine} */
export class StagedArenaScenarioRoutine {
	/** @param {Universe} universe @param {ArenaStage[]} stages */
	constructor(universe, stages) {
		this.universe = universe

		/** @type {() => void} */
		this.onVictory = () => console.log("Victory!")

		/** @type {() => void} */
		this.onDefeat = () => console.log("Defeat...")

		/** @private */
		this.remainingHostileCount = 0

		/** @private @type {ArenaStage} */
		this.currentStage = {
			onStep() {},
			isOver: true,
			next: null
		}

		stages.unshift(new CalmStage(3))
		stages.push(new CalmStage(3))

		for (let i = 0; i < stages.length; ++i)
			stages[i].next = stages[i + 1] || {
				onEnter: () => {
					this.currentStage = null
					this.onVictory?.()
				}
			}

		this.currentStage.next = stages[0]
	}

	onStep() {
		if (this.currentStage) {
			this.currentStage.onStep(this.universe, this.remainingHostileCount)

			if (this.currentStage.isOver) {
				this.currentStage = this.currentStage.next

				this.currentStage.onEnter(this.universe)
			}
		}
	}

	/** @param {Link} link */
	onAdd(link) {
		const [ collider ] = link.get(Collider)

		if (collider && Tags.match(collider.tag, Tags.hostile))
			++this.remainingHostileCount
	}

	/** @param {Link} link */
	onRemove(link) {
		if (link instanceof Player) {
			this.currentStage = new CalmStage(3)

			this.currentStage.next = {
				onEnter: () => {
					this.currentStage = null
					this.onDefeat?.()
				}
			}

			this.currentStage.onEnter(this.universe)
		}

		else {
			const [ collider ] = link.get(Collider)

			if (collider && Tags.match(collider.tag, Tags.hostile))
				--this.remainingHostileCount
		}
	}
}