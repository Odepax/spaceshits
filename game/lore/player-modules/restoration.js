import { Link, Universe } from "../../core/engine.js"
import { HpGauge } from "../../logic/life-and-death.js"
import { PlayerEnergy, PlayerShip } from "../../logic/player.js"
import { UserInputRegistry } from "../../ux/user-input-capture.js"
import { PLAYER_RESTORATION_ENERGY, PLAYER_RESTORATION_REGEN, PLAYER_RESTORATION_DURATION } from "../game-balance.js"
import { GameKeeper } from "../game-keeper.js"

export class RestorationPlayerAuxRoutine {
	/** @param {UserInputRegistry} userInput @param {GameKeeper} game @param {Universe} universe @param {(link: Link) => void} onHeal */
	constructor(userInput, game, universe, onHeal = null) {
		this.userInput = userInput
		this.game = game
		this.universe = universe
		this.onHeal = onHeal

		/** @private @type {Link} */
		this.player = null

		/** @type {number} */
		this.activationEndTime = null
	}

	/** @param {Link} link */
	onAdd(link) {
		if (!this.player && link.has(PlayerShip)) {
			this.player = link
			this.player.get(PlayerEnergy)[0].auxConsumption = PLAYER_RESTORATION_ENERGY
		}
	}

	/** @param {Link} link */
	onRemove(link) {
		if (link == this.player)
			this.player = null
	}

	onStep() {
		if (this.player) {
			const [ playerHp, playerEnergy ] = this.player.get(HpGauge, PlayerEnergy)

			if (
				   playerEnergy.auxConsumption <= playerEnergy.aux // Has energy?
				&& this.userInput.wasPressed(this.game.keyBindings.aux) // Has order?
			) {
				playerEnergy.aux -= playerEnergy.auxConsumption
				playerHp.regen = PLAYER_RESTORATION_REGEN

				this.activationEndTime = this.universe.clock.time + PLAYER_RESTORATION_DURATION
			}

			if (this.universe.clock.time < this.activationEndTime)
				this.onHeal(this.player)

			else
				playerHp.regen = 0

			this.regenerate(playerEnergy)
		}
	}

	/** @protected @param {PlayerEnergy} playerEnergy */
	regenerate(playerEnergy) {
		if (playerEnergy.aux < playerEnergy.auxMax)
			playerEnergy.aux += playerEnergy.auxRegen * this.universe.clock.spf
	}
}
