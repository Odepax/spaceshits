import { Link, Universe } from "../../core/engine.js"
import { Colors } from "../../graphic/assets/colors.js"
import { AuraFx } from "../../graphic/vfx.js"
import { HostileBullet, HostileStuff } from "../../logic/hostile.js"
import { HpGauge } from "../../logic/life-and-death.js"
import { PlayerEnergy, PlayerShip, PlayerStuff } from "../../logic/player.js"
import { RammingDamage } from "../../logic/ramming-damage.js"
import { Transform } from "../../math/transform.js"
import { Collider } from "../../physic/collision.js"
import { Motion } from "../../physic/motion.js"
import { UserInputRegistry } from "../../ux/user-input-capture.js"
import { PLAYER_SHIELD_RADIUS, PLAYER_SHIELD_HP, PLAYER_SHIELD_HP_REGEN, PLAYER_SHIELD_ENERGY, PLAYER_SHIELD_DURATION } from "../game-balance.js"
import { GameKeeper } from "../game-keeper.js"

/** @param {Transform} position */
function playerShield(position) {
	return new Link(
		PlayerStuff,

		new Motion(position, undefined, Motion.ignoreEdges),

		new Collider(PLAYER_SHIELD_RADIUS),
		new RammingDamage(0, HostileBullet, RammingDamage.ignoreDamage),

		new HpGauge(PLAYER_SHIELD_HP, PLAYER_SHIELD_HP_REGEN),

		new AuraFx(PLAYER_SHIELD_RADIUS, Colors.blue)
	)
}

export class ShieldPlayerAuxRoutine {
	/** @param {UserInputRegistry} userInput @param {GameKeeper} game @param {Universe} universe */
	constructor(userInput, game, universe) {
		this.userInput = userInput
		this.game = game
		this.universe = universe

		/** @private @type {Link} */
		this.player = null

		/** @private @type {Link} */
		this.shield = null

		/** @type {number} */
		this.activationEndTime = null
	}

	/** @param {Link} link */
	onAdd(link) {
		if (link.has(PlayerShip)) {
			this.player = link
			this.player.get(PlayerEnergy)[0].auxConsumption = PLAYER_SHIELD_ENERGY
		}
	}

	/** @param {Link} link */
	onRemove(link) {
		if (link == this.shield)
			this.shield = null

		else if (link == this.player)
			this.player = null
	}

	onStep() {
		if (this.player) {
			const [ playerEnergy, { position: playerPosition} ] = this.player.get(PlayerEnergy, Motion)

			if (
				   !this.shield // Has no shield already?
				&& playerEnergy.auxConsumption <= playerEnergy.aux // Has energy?
				&& this.userInput.wasPressed(this.game.keyBindings.aux) // Has order?
			) {
				playerEnergy.aux -= playerEnergy.auxConsumption

				this.activationEndTime = this.universe.clock.time + PLAYER_SHIELD_DURATION

				this.universe.add(this.shield = playerShield(playerPosition))
			}

			else if (this.shield && this.activationEndTime < this.universe.clock.time)
				this.universe.remove(this.shield)

			this.regenerate(playerEnergy)
		}
	}

	/** @protected @param {PlayerEnergy} playerEnergy */
	regenerate(playerEnergy) {
		if (playerEnergy.aux < playerEnergy.auxMax)
			playerEnergy.aux += playerEnergy.auxRegen * this.universe.clock.spf
	}
}
