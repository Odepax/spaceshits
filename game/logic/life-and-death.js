import { AutoIteratingRoutine } from "../core/routines.js"
import { Link } from "../core/engine.js"
import { Universe } from "../core/engine.js"

export class HpGauge {
	/** @param {number} max */
	constructor(max, regen = 0, value = max) {
		this.max = max
		this.regen = regen
		this.value = value
	}
}

export class LifeAndDeathRoutine extends AutoIteratingRoutine {
	/** @param {Universe} universe */
	constructor(universe) {
		super()

		this.universe = universe
	}
	/**@param {Link} link */
	accepts(link) {
		return link.has(HpGauge)
	}

	/** @param {Link} link */
	onSubStep(link) {
		const [ hp ] = link.get(HpGauge)

		if (hp.value < 0)
			this.universe.remove(link)

		else if (hp.value < hp.max)
			hp.value += hp.regen * this.universe.clock.spf
	}
}
