import { Link, Universe } from "../../core/engine.js"
import { Colors } from "../../graphic/assets/colors.js"
import { AuraFx } from "../../graphic/vfx.js"
import { HostileShip } from "../../logic/hostile.js"
import { PlayerEnergy, PlayerShip } from "../../logic/player.js"
import { RammingDamage } from "../../logic/ramming-damage.js"
import { Ratio } from "../../math/ratio.js"
import { Transform } from "../../math/transform.js"
import { Collider, CollisionRegistry } from "../../physic/collision.js"
import { Motion } from "../../physic/motion.js"
import { UserInputRegistry } from "../../ux/user-input-capture.js"
import { PLAYER_SHOCKWAVE_DAMAGE, PLAYER_SHOCKWAVE_ENERGY, PLAYER_SHOCKWAVE_RADIUS, PLAYER_SHOCKWAVE_TTL } from "../game-balance.js"
import { GameKeeper } from "../game-keeper.js"

class WaveGrowth {
	/** @param {number} spawnTime @param {number} deathTime @param {number} maxRadius */
	constructor(spawnTime, deathTime, maxRadius) {
		this.spawnTime = spawnTime
		this.deathTime = deathTime
		this.maxRadius = maxRadius
	}
}

/** @param {Transform} position @param {number} time */
function shockwave(position, time) {
	return new Link(
		new Motion(position, undefined, Motion.ignoreEdges),

		new Collider(0),
		new RammingDamage(PLAYER_SHOCKWAVE_DAMAGE, HostileShip/* bullet*/, RammingDamage.ignoreDamage),

		new WaveGrowth(time, time + PLAYER_SHOCKWAVE_TTL, PLAYER_SHOCKWAVE_RADIUS),

		new AuraFx(0, Colors.orange)
	)
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
		if (link.has(HostileShip))
			this.hostiles.add(link)

		else if (link.has(WaveGrowth))
			this.waves.add(link)

		else if (link.has(PlayerShip)) {
			this.player = link
			this.player.get(PlayerEnergy)[0].auxConsumption = PLAYER_SHOCKWAVE_ENERGY
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

				this.universe.add(shockwave(
					this.player.get(Motion)[0].position.copy,
					this.universe.clock.time
				))
			}

			this.regenerate(playerEnergy)
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

	/** @protected @param {PlayerEnergy} playerEnergy */
	regenerate(playerEnergy) {
		if (playerEnergy.aux < playerEnergy.auxMax)
			playerEnergy.aux += playerEnergy.auxRegen * this.universe.clock.spf
	}
}
