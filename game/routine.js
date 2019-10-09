import { Routine, Link } from "./engine.js"

export class SubRoutine extends Routine {
	onStep(/** @type {Iterable<Link>} */ links) {
		for (const link of links) {
			this.onSubStep(link)
		}
	}

	onSubStep(/** @type {Link} */ link) {
		throw (this.constructor.name || SubRoutine.name) + "#onSubStep(Link) was not implemented."
	}
}

export class MatchSubRoutine extends SubRoutine {
	/**
	 * Infers MatchSubRoutine's required traits from lambda parameters names.
	 *
	 * @example
	 * MatchSubRoutine.onSubStep(({ Transform, Velocity, Acceleration = null }) => {
	 *    if (Acceleration) {
	 *       Velocity.x += Acceleration.x * clock.spf
	 *       Velocity.y += Acceleration.y * clock.spf
	 *    }
	 *
	 *    Transform.x += Velocity.x * clock.spf
	 *    Transform.y += Velocity.y * clock.spf
	 * })
	 */
	static onSubStep(/** @type {(link: Link) => void} */ lambda) {
		const routine = new MatchSubRoutine(getRequiredTraits(lambda))

		routine.onSubStep = lambda

		return routine
	}

	constructor(/** @type {import("./engine.js").Constructor<any>[]} */ requiredTraits = []) {
		super()

		this.test = link => testRequiredTraits(requiredTraits.map(it => it.name), link)
	}
}

export class MatchRoutine extends Routine {
	/** @see MatchSubRoutine.onSubStep */
	static onAdd(/** @type {(link: Link) => void} */ lambda) {
		const routine = new MatchRoutine(getRequiredTraits(lambda))

		routine.onAdd = lambda

		return routine
	}

	/** @see MatchSubRoutine.onSubStep */
	static onRemove(/** @type {(link: Link) => void} */ lambda) {
		const routine = new MatchRoutine(getRequiredTraits(lambda))

		routine.onAdd = lambda

		return routine
	}

	constructor(/** @type {import("./engine.js").Constructor<any>[]} */ requiredTraits = []) {
		super()

		this.test = link => testRequiredTraits(requiredTraits.map(it => it.name), link)
	}
}

function testRequiredTraits(/** @type {string[]} */ requiredTraits, /** @type {Link} */ link) {
	for (const trait of requiredTraits) {
		if (!(trait in link)) {
			return false
		}
	}

	return true
}

function getRequiredTraits(/** @type {(link: Link) => void} */ lambda) {
	// Adapted from:
	// https://stackoverflow.com/a/31194949
	// https://stackoverflow.com/questions/1007981/how-to-get-function-parameter-names-values-dynamically#answer-31194949
	return lambda.toString()
		.replace(/\/\/.*$/mg, "") // Single-line comments.
		.replace(/\s+/g, "") // White spaces.
		.replace(/\/\*\*?[^/*]*\*\//g, "") // Multi-line comments.
		.split(/\}\)\{|\}\)?=>\{?/, 1)
		[0]
		.replace(/^[^(]*\(\{/, "")
		.replace(/:[^,=]+/, "")
		.replace(/[^,]+=[^,]+/g, "")
		.split(",")
		.filter(it => it)
		.map(name => { return { name } })
}
