import { Link, Routine } from "./core.js"

export class SubRoutine extends Routine {
	onStep(/** @type {Link[]} */ links) {
		for (const link of links) {
			if (this.test(link)) {
				this.onSubStep(link)
			}
		}
	}

	onSubStep(/** @type {Link} */ link) {}
}

export class MatchRoutine extends SubRoutine {
	/**
	 * @example
	 * MatchRoutine.infer(({ Transform, Velocity, Acceleration = null }) => {
	 *    if (Acceleration) {
	 *       Velocity.x += Acceleration.x * clock.spf
	 *       Velocity.y += Acceleration.y * clock.spf
	 *    }
	 *
	 *    Transform.x += Velocity.x * clock.spf
	 *    Transform.y += Velocity.y * clock.spf
	 * })
	 */
	static infer(/** @type {(link: Link) => void} */ lambda) {
		const routine = new MatchRoutine(
			// Adapted from:
			// https://stackoverflow.com/a/31194949
			// https://stackoverflow.com/questions/1007981/how-to-get-function-parameter-names-values-dynamically#answer-31194949
			lambda.toString()
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
		)

		routine.onSubStep = lambda

		return routine
	}

	constructor(/** @type {Function[]} */ requiredTraits = []) {
		super()

		this.requiredTraits = requiredTraits.map(it => it.name)
	}

	test(/** @type {Link} */ link) {
		for (const trait of this.requiredTraits) {
			if (!(trait in link)) {
				return false
			}
		}

		return true
	}
}
