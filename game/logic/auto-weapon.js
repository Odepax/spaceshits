import { Link, Universe } from "../core/engine.js"
import { AutoIteratingRoutine } from "../core/routines.js"
import { Player } from "../lore/player.js"
import { Motion } from "../physic/motion.js"
import { Angle } from "../math/angle.js"
import { Tags } from "../lore/tags.js"
import { Collider } from "../physic/collision.js"

export class AutoWeaponModule {
	/** @param {number} reloadTime @param {(parent: Link) => Link[]} factory */
	constructor(reloadTime, factory) {
		this.reloadTime = reloadTime
		this.factory = factory

		/** @private */
		this.nextShotTime = -1
	}
}

export class AutoWeaponModuleRoutine extends AutoIteratingRoutine {
	/** @param {Universe} universe */
	constructor(universe) {
		super()

		this.universe = universe
	}

	/** @param {Link} link */
	accepts(link) {
		return link.has(AutoWeaponModule)
	}

	/** @param {Link} link */
	onAdded(link) {
		const [ weaponModule ] = link.get(AutoWeaponModule)

		weaponModule.nextShotTime = this.universe.clock.time + weaponModule.reloadTime
	}

	/** @param {Link} link */
	onSubStep(link) {
		const [ weaponModule ] = link.get(AutoWeaponModule)

		if (weaponModule.nextShotTime < this.universe.clock.time) {
			weaponModule.nextShotTime = this.universe.clock.time + weaponModule.reloadTime

			for (const bullet of weaponModule.factory(link))
				this.universe.add(bullet)

			// TODO: Apply damage boosters.
		}
	}
}

export class HostileMissileRoutine extends AutoIteratingRoutine {
	/** @param {Universe} universe */
	constructor(universe) {
		super()

		this.universe = universe

		/** @private @type {Player} */
		this.player = null

		/** @private */
		this.maxMissileSteerSpeed = Math.PI
	}

	/** @param {Link} link */
	onAdd(link) {
		if (!this.player && link instanceof Player) // TODO: review the way we distinguish the player
			this.player = link

		else
			super.onAdd(link)
	}

	/** @param {Link} link */
	onRemove(link) {
		if (link == this.player)
			this.player = null

		else
			super.onRemove(link)
	}

	/** @param {Link} link */
	accepts(link) {
		const [ collider ] = link.get(Collider)

		return collider && Tags.match(collider.tag, Tags.hostile | Tags.missile)
	}

	onStep() {
		if (this.player)
			super.onStep()
	}

	/** @param {Link} link */
	onSubStep(link) {
		const [ missileMotion ] = link.get(Motion)
		const [ playerMotion ] = this.player.get(Motion)

		// Target facing.
		const directionAngle = Angle.shortArcBetween(missileMotion.position.a, missileMotion.position.directionTo(playerMotion.position))

		if (Math.abs(directionAngle) < this.maxMissileSteerSpeed * this.universe.clock.spf) {
			missileMotion.velocity.a = 0
			missileMotion.position.a += directionAngle
		}

		else
			missileMotion.velocity.a = Math.sign(directionAngle) * this.maxMissileSteerSpeed

		// Forward chasing.
		missileMotion.velocity.d = missileMotion.position.a
	}
}
