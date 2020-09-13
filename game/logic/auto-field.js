import { Link, Universe } from "../core/engine.js"
import { AutoIteratingRoutine } from "../core/routines.js"

export class AutoFieldModule {
	/** @param {(parent: Link) => Link} factory */
	constructor(factory, respawnDelay = -1) {
		this.factory = factory
		this.respawnDelay = respawnDelay

		/** @private @type {Link} */
		this.field = null

		/** @private */
		this.nextRespawnTime = -1
	}
}

AutoFieldModule.noRespawn = -1

export class AutoFieldModuleRoutine extends AutoIteratingRoutine {
	/** @param {Universe} universe */
	constructor(universe) {
		super()

		this.universe = universe

		/** @private @type {WeakMap<Link, Link>} */
		this.fields = new WeakMap() // [Field] => Spawner.
	}

	/** @param {Link} link */
	accepts(link) {
		return link.has(AutoFieldModule)
	}

	/** @param {Link} link */
	onAdded(link) {
		const [ fieldModule ] = link.get(AutoFieldModule)

		fieldModule.field = fieldModule.factory(link)

		this.fields.set(fieldModule.field, link)
		this.universe.add(fieldModule.field)
	}

	/** @param {Link} link */
	onRemove(link) {
		if (this.fields.has(link)) {
			const parent = this.fields.get(link)
			const [ fieldModule ] = parent.get(AutoFieldModule)

			fieldModule.field = null

			if (fieldModule.respawnDelay != AutoFieldModule.noRespawn)
				fieldModule.nextRespawnTime = this.universe.clock.time + fieldModule.respawnDelay
		}

		super.onRemove(link)
	}

	/** @param {Link} link */
	onRemoved(link) {
		const [ { field } ] = link.get(AutoFieldModule)

		if (field)
			this.universe.remove(field)
	}

	/** @param {Link} link */
	onSubStep(link) {
		const [ fieldModule ] = link.get(AutoFieldModule)

		if (!fieldModule.field && fieldModule.nextRespawnTime <= this.universe.clock.time) {
			fieldModule.field = fieldModule.factory(link)

			this.fields.set(fieldModule.field, link)
			this.universe.add(fieldModule.field)
		}
	}
}
