import { Link, Universe } from "../../core/engine.js"
import { Transform } from "../../math/transform.js"
import { Motion } from "../../physic/motion.js"
import { Collider, CollisionRegistry } from "../../physic/collision.js"
import { Tags } from "../tags.js"
import { RammingDamage } from "../../logic/ramming-damage.js"
import { AuraFx } from "../../graphic/vfx.js"
import { Colors } from "../../graphic/assets/colors.js"
import { UserInputRegistry } from "../../ux/user-input-capture.js"
import { GameKeeper } from "../game-keeper.js"
import { Player, PlayerEnergy } from "../player.js"
import { Ratio } from "../../math/ratio.js"
import { Flag } from "../../math/flag.js"

class WaveGrowth {
	/** @param {number} spawnTime @param {number} deathTime @param {number} maxRadius */
	constructor(spawnTime, deathTime, maxRadius) {
		this.spawnTime = spawnTime
		this.deathTime = deathTime
		this.maxRadius = maxRadius
	}
}

class Shockwave extends Link {
	/** @param {Transform} position @param {number} time */
	constructor(position, time) {
		super(
			new Motion(position, undefined, Motion.ignoreEdges),

			new Collider(0, Tags.player | Tags.field),
			new RammingDamage(19, Tags.hostile | Tags.ship/* | Tags.bullet*/, RammingDamage.ignoreDamage),

			new WaveGrowth(time, time + 0.7, 307),

			new AuraFx(0, Colors.orange)
		)
	}
}

export class ShockwavePlayerAuxRoutine {
	/** @param {UserInputRegistry} userInput @param {CollisionRegistry} collisions @param {GameKeeper} game @param {Universe} universe */
	constructor(userInput, collisions, game, universe) {
		this.userInput = userInput
		this.collisions = collisions
		this.game = game
		this.universe = universe

		/** @private @type {Link} */
		this.player = null

		/** @private @type {Set<Link>} */
		this.waves = new Set()
		
		/** @private @type {Set<Link>} */
		this.hostiles = new Set()
	}

	/** @param {Link} link */
	onAdd(link) {
		if (link instanceof Shockwave)
			this.waves.add(link)

		else if (Flag.contains(link.get(Collider)[0]?.tag, Tags.hostile | Tags.ship/* | Tags.bullet*/))
			this.hostiles.add(link)

		else if (!this.player && link instanceof Player) {
			this.player = link
			this.player.get(PlayerEnergy)[0].auxConsumption = 17
		}
	}

	/** @param {Link} link */
	onRemove(link) {
		if (link == this.player)
			this.player = null

		else
			this.waves.delete(link) || this.hostiles.delete(link)
	}

	onStep() {
		if (this.player) {
			const [ playerEnergy ] = this.player.get(PlayerEnergy)

			if (
				   playerEnergy.auxConsumption <= playerEnergy.aux // Has energy?
				&& this.userInput.wasPressed(this.game.keyBindings.aux) // Has order?
			) {
				playerEnergy.aux -= playerEnergy.auxConsumption

				this.universe.add(new Shockwave(
					this.player.get(Motion)[0].position.copy,
					this.universe.clock.time
				))
			}

			if (playerEnergy.aux < playerEnergy.auxMax)
				playerEnergy.aux += playerEnergy.auxRegen * this.universe.clock.spf
		}

		for (const wave of this.waves) {
			const [ { position: wavePosition } , waveCollider, waveAura, { spawnTime, deathTime, maxRadius } ] = wave.get(Motion, Collider, AuraFx, WaveGrowth)

			if (deathTime < this.universe.clock.time)
				this.universe.remove(wave)

			else {
				const progress = Ratio.progressBetween(this.universe.clock.time, spawnTime, deathTime)

				waveAura.radius = waveCollider.radius = maxRadius * progress
				waveAura.opacityFactor = 1 - progress
			}

			const waveSpeed = maxRadius / (deathTime - spawnTime)

			for (const hostile of this.hostiles)
				if (this.collisions.startedColliding(wave, hostile)) {
					const [ motion, rammingDamage ] = hostile.get(Motion, RammingDamage)

					if (rammingDamage?.damageReaction == RammingDamage.bounceOnDamage) {
						const waveDirection = wavePosition.directionTo(motion.position)

						motion.velocity.d = waveDirection
						motion.velocity.l = waveSpeed
					}
				}
		}
	}
}
