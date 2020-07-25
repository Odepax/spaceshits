import { Universe, Link } from "../core/engine.js"
import { SetRoutine } from "../core/routines.js"
import { Motion } from "../physic/motion.js"
import { Collider, CollisionDetector } from "../physic/collision.js"
import { HpGauge } from "./life-and-death.js"
import { Tags } from "../lore/tags.js"

export class RammingDamage {
	/** @param {number} damage @param {number} targetTag @param {number} damageReaction See static flags. */
	constructor(damage, targetTag, damageReaction = 0) {
		this.damage = damage
		this.targetTag = targetTag
		this.damageReaction = damageReaction
	}
}

RammingDamage.ignoreDamage = 0
RammingDamage.removeOnDamage = 1
RammingDamage.bounceOnDamage = 2
RammingDamage.bounceOtherOnDamage = 4

export class RammingDamageRoutine extends SetRoutine {
	/** @param {CollisionDetector} collisions @param {Universe} universe @param {(a: Link, b: Link) => void} onBounce */
	constructor(collisions, universe, onBounce = null) {
		super()

		this.collisions = collisions
		this.universe = universe
		this.onBounce = onBounce
	}

	/** @param {Link} link */
	accepts(link) {
		return link.has(Motion, Collider) && (
			   link.has(RammingDamage)
			|| link.has(HpGauge)
		)
	}

	onStep() {
		const links = Array.from(this.links)

		for (let i = 0; i < links.length; ++i) {
			const a = links[i]
			const [ motionA, colliderA, rammingDamageA, hpA ] = a.get(Motion, Collider, RammingDamage, HpGauge)

			for (let j = i + 1; j < links.length; ++j) {
				const b = links[j]
				const [ motionB, colliderB, rammingDamageB, hpB ] = b.get(Motion, Collider, RammingDamage, HpGauge)

				if ((
					   Tags.match(rammingDamageA?.targetTag, colliderB.tag)
					|| Tags.match(rammingDamageB?.targetTag, colliderA.tag) )
					&& this.collisions.areColliding(a, b)
				) {
					// Assuming that collisions don't go down here by accident,
					// therefore assuming (and not checking for) rammingDamageX.
					if (hpA) hpA.value -= rammingDamageB.damage
					if (hpB) hpB.value -= rammingDamageA.damage

					if (rammingDamageA.damageReaction == RammingDamage.removeOnDamage)
						this.universe.remove(a)

					if (rammingDamageB.damageReaction == RammingDamage.removeOnDamage)
						this.universe.remove(b)

					else if ((
						   rammingDamageA?.damageReaction == RammingDamage.bounceOnDamage
						&& rammingDamageB?.damageReaction == RammingDamage.bounceOnDamage
					) || (
						   rammingDamageA?.damageReaction == RammingDamage.bounceOnDamage
						&& rammingDamageB?.damageReaction == RammingDamage.bounceOtherOnDamage
					) || (
						   rammingDamageA?.damageReaction == RammingDamage.bounceOtherOnDamage
						&& rammingDamageB?.damageReaction == RammingDamage.bounceOnDamage
					)) {
						const averageSpeed = (motionA.velocity.l + motionB.velocity.l) / 2
						const bounceDirection = motionA.position.directionTo(motionB.position)
						const immediateBounceDistance = (
							  colliderA.radius
							+ colliderB.radius
							- motionA.position.lengthTo(motionB.position)
						) / (
							  (rammingDamageA.damageReaction == RammingDamage.bounceOnDamage)
							+ (rammingDamageB.damageReaction == RammingDamage.bounceOnDamage)
						)

						if (rammingDamageA.damageReaction == RammingDamage.bounceOnDamage) {
							motionA.position.angularOffsetBy({ d: bounceDirection, l: -immediateBounceDistance })

							if (rammingDamageB.damageReaction == RammingDamage.bounceOnDamage)
								motionA.velocity.l = averageSpeed

							motionA.velocity.d = bounceDirection + Math.PI
						}

						if (rammingDamageB.damageReaction == RammingDamage.bounceOnDamage) {
							motionB.position.angularOffsetBy({ d: bounceDirection, l: +immediateBounceDistance })

							if (rammingDamageA.damageReaction == RammingDamage.bounceOnDamage)
								motionB.velocity.l = averageSpeed

							motionB.velocity.d = bounceDirection
						}

						this.onBounce?.(a, b)
					}
				}
			}
		}
	}
}
