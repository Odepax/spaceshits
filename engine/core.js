const MILLI_SECONDS = 0.001

export class Universe {
	constructor(/** @type {LinkDefinition[]} */ links = []) {
		this.clock = {
			spf: 0,
			time: 0,
			timeFactor: 1,

			/** @private */ isRunning: false,
			/** @private */ lastTimestamp: 0
		}

		/** @private @type {Set<Routine>} */ this.routines = new Set()
		/** @private @type {Set<LinkDefinition>} */ this.links = new Set()

		for (const link of links) {
			this.add(link)
		}
	}

	add(/** @type {LinkDefinition} */ linkDefinition) {
		const link = {}

		for (const traitDefinition of linkDefinition) {
			const [traitName, trait] = traitDefinition instanceof Array
				? [traitDefinition[0].name, traitDefinition[1]]
				: [traitDefinition.constructor.name, traitDefinition]

			link[traitName] = trait
		}

		this.links.add(link)

		for (const routine of this.routines) {
			if (routine.test(link)) {
				const order = routine.onAdd(link)

				if (order == Order.removeLink) {
					this.remove(link)
					break
				} else if (order == Order.unregisterRoutine) {
					this.unregister(routine)
					continue
				}
			}
		}
	}

	remove(/** @type {Link} */ link) {
		this.links.delete(link)

		for (const routine of this.routines) {
			if (routine.test(link)) {
				const order = routine.onRemove(link)

				if (order == Order.unregisterRoutine) {
					this.unregister(routine)
					continue
				}
			}
		}
	}

	register(/** @type {Routine} */ routine) {
		this.routines.add(routine)
	}

	unregister(/** @type {Routine} */ routine) {
		this.routines.delete(routine)
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

		for (const routine of this.routines) {
			for (const link of this.links) {
				if (routine.test(link)) {
					const order = routine.onStep(link)

					if (order == Order.removeLink) {
						this.remove(link)
						continue
					} else if (order == Order.unregisterRoutine) {
						this.unregister(routine)
						break
					} else if (order == Order.skipRoutine) {
						break
					}
				}
			}
		}

		if (this.clock.isRunning) {
			requestAnimationFrame(timestamp => this.step(timestamp))
		}
	}
}

/** @typedef {TraitDefinition[]} LinkDefinition */
/** @typedef {object} Link */

/** @typedef {Trait|[ { name: string }, Trait ]} TraitDefinition */
/** @typedef {object} Trait */

/** @typedef {{ name: string }} TraitFilter */

export class Routine {
	static infer(/** @type {(link : Link) => Order?} */ routine) {
		const outputRoutine = new Routine(Routine.requiredTraits(routine).map(name => { return { name } }))

		outputRoutine.onStep = routine

		return outputRoutine
	}

	/** @private */ static requiredTraits(/** @type {Function} */ routine) {
		// Adapted from:
		// https://stackoverflow.com/a/31194949
		// https://stackoverflow.com/questions/1007981/how-to-get-function-parameter-names-values-dynamically#answer-31194949
		const parameters = routine.toString()
			.replace(/\/\/.*$/mg, "") // Single-line comments.
			.replace(/\s+/g, "") // White spaces.
			.replace(/\/\*\*?[^/*]*\*\//g, "") // Multi-line comments.
			.split(/\}\)\{|\}\)?=>\{?/, 1)
		[0]
			.replace(/^[^(]*\(\{/, "")
			.replace(/:[^,=]+/, "")
			.replace(/=[^,]+/g, "=")
			.split(",")
			.filter(it => it)

		/** @type {string[]} */ const required = []

		for (const parameter of parameters) {
			if (parameter.endsWith("=")) {
				continue
			} else {
				required.push(parameter)
			}
		}

		return required
	}

	constructor(/** @type {TraitFilter[]} */ requiredTraits = []) {
		this.requiredTraits = requiredTraits
	}

	/** @returns {boolean} */ test(/** @type {Link} */ link) {
		for (const trait of this.requiredTraits) {
			if (!(trait.name in link)) {
				return false
			}
		}

		return true
	}

	/** @abstract @returns {Order?} */ onAdd(/** @type {Link} */ link) { }
	/** @abstract @returns {Order?} */ onStep(/** @type {Link} */ link) { }
	/** @abstract @returns {Order?} */ onRemove(/** @type {Link} */ link) { }
}

export const Order = {
	/** @typedef {Symbol} Order */

	/** @type {Order} */ removeLink: Symbol(),
	/** @type {Order} */ unregisterRoutine: Symbol(),
	/** @type {Order} */ skipRoutine: Symbol()
}
