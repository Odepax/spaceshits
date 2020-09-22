import { CollisionRegistry, Collider } from "../physic/collision.js"
import { Universe, Link } from "../core/engine.js"
import { HpGauge } from "./life-and-death.js"

export class HealField {
	/** @param {number} healRate @param {number} targetMark */
	constructor(healRate, targetMark) {
		this.healRate = healRate
		this.targetMark = targetMark
	}
}

/** @implements {import("../../core/engine").Routine} */
export class HealFieldRoutine {
	/** @param {CollisionRegistry} collisions @param {Universe} universe @param {(link: Link) => void} onHeal */
	constructor(collisions, universe, onHeal = null) {
		this.collisions = collisions
		this.universe = universe
		this.onHeal = onHeal

		/** @private @type {Set<Link>} */
		this.fields = new Set()

		/** @private @type {Set<Link>} */
		this.targets = new Set()
	}

	/** @param {Link} link */
	onAdd(link) {
		if (link.has(HealField))
			this.fields.add(link)

		else if (link.has(Collider, HpGauge))
			this.targets.add(link)
	}

	/** @param {Link} link */
	onRemove(link) {
		this.fields.delete(link) || this.targets.delete(link)
	}

	onStep() {
		for (const field of this.fields) {
			const [ fieldHeal ] = field.get(HealField)

			for (const target of this.targets) {
				const [ targetHp ] = target.get(HpGauge)

				if (
					   target.has(fieldHeal.targetMark)
					&& this.collisions.areColliding(field, target)
					&& targetHp.value < targetHp.max
				) {
					targetHp.value += fieldHeal.healRate * this.universe.clock.spf

					this.onHeal?.(target)
				}
			}
		}
	}
}
