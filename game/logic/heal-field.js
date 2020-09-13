import { CollisionRegistry, Collider } from "../physic/collision.js"
import { Universe, Link } from "../core/engine.js"
import { HpGauge } from "./life-and-death.js"
import { Flag } from "../math/flag.js"

export class HealField {
	/** @param {number} healRate @param {number} targetTag */
	constructor(healRate, targetTag) {
		this.healRate = healRate
		this.targetTag = targetTag
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
				const [ targetCollider, targetHp ] = target.get(Collider, HpGauge)

				if (
					   Flag.contains(targetCollider.tag, fieldHeal.targetTag)
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
