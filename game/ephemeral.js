import { MatchSubRoutine } from "./routine.js"
import { Universe } from "./engine.js"

export class Ephemeral {
	constructor(/** @type {number} */ timeToLive) {
		this.timeToLive = timeToLive
		this.remainingTimeToLive = timeToLive
	}

	get decline() { return this.remainingTimeToLive / this.timeToLive }
	get progress() { return 1 - this.remainingTimeToLive / this.timeToLive }
}

export class EphemeralRoutine extends MatchSubRoutine {
	constructor(/** @type {Universe} */ universe) {
		super([ Ephemeral ])

		this.universe = universe
	}

	onSubStep(/** @type {{ Ephemeral: Ephemeral }} */ link) {
		if ((link.Ephemeral.remainingTimeToLive -= this.universe.clock.spf) < 0) {
			this.universe.remove(link)
		}
	}
}
