import { AutoIteratingRoutine } from "../core/routines.js"
import { HpGauge } from "../logic/life-and-death.js"
import { Render } from "./render.js"
import { Universe, Link } from "../core/engine.js"
import { Colors } from "./assets/colors.js"
import { Player } from "../lore/player.js"
import { AuraFx } from "./vfx.js"
import { Ratio } from "../math/ratio.js"

// TODO: use PlayerEnergy trait

/** @implements {import("../core/engine").Routine} */
export class PlayerStatsVisualizationRoutine {
	/** @param {HTMLProgressElement} hpProgress */
	constructor(hpProgress) {
		this.hpProgress = hpProgress

		/** @private @type {Player} */
		this.player = null
	}

	/** @param {Link} link */
	onAdd(link) {
		if (!this.player && link instanceof Player)
			this.player = link
	}

	/** @param {Link} link */
	onRemove(link) {
		if (link == this.player)
			this.player = null
	}

	onStep() {
		if (this.player) {
			const [ { value, max } ] = this.player.get(HpGauge)

			this.hpProgress.value = Ratio.progress(value, max)
		}
	}
}

export class DamageColorizationRoutine extends AutoIteratingRoutine {
	/** @param {Universe} universe */
	constructor(universe) {
		super()

		this.universe = universe
	}

	/** @param {Link} link */
	accepts(link) {
		return link.has(HpGauge, Render) || link.has(HpGauge, AuraFx)
	}

	/** @param {Link} link */
	onSubStep(link) {
		const [ hp, render, aura ] = link.get(HpGauge, Render, AuraFx)

		const hpRatio = Math.min(Ratio.progress(hp.value, hp.max), 1)

		if (render) {
			const damageRatio = 1 - hpRatio
			const oscillator = 0.5 + Math.sin(this.universe.clock.time * damageRatio * 2 * Math.PI) / 2

			render.colorizationColor = Colors.red
			render.colorizationFactor = oscillator * damageRatio
		}

		else
			aura.opacityFactor = hpRatio
	}
}
