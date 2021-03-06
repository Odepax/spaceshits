import { Link, Universe } from "../core/engine.js"
import { UserInputRegistry } from "../ux/user-input-capture.js"
import { GameKeeper } from "../lore/game-keeper.js"

export const PlayerStuff = Symbol()
export const PlayerShip = Symbol()
export const PlayerBullet = Symbol()
export const PlayerMissile = Symbol()

export class PlayerEnergy {
	/** @param {number} weapon @param {number} weaponRegen @param {number} aux @param {number} auxRegen */
	constructor(weapon, weaponRegen, aux, auxRegen) {
		this.weapon = this.weaponMax = weapon
		this.weaponRegen = weaponRegen
		this.weaponConsumption = 0

		this.weaponReloadTime = 0

		this.aux = this.auxMax = aux
		this.auxRegen = auxRegen
		this.auxConsumption = 0
	}
}

/** @abstract @implements {import("../core/engine").Routine} */
export class PlayerWeaponRoutine {
	/** @param {UserInputRegistry} userInput @param {GameKeeper} game @param {Universe} universe @param {number} reloadTime @param {number} shotConsumption */
	constructor(userInput, game, universe, reloadTime, shotConsumption) {
		this.userInput = userInput
		this.game = game
		this.universe = universe
		this.reloadTime = reloadTime
		this.shotConsumption = shotConsumption

		/** @protected @type {Link} */
		this.player = null

		/** @private */
		this.nextShotTime = Number.NEGATIVE_INFINITY
	}

	/** @param {Link} link */
	onAdd(link) {
		if (link.has(PlayerShip)) {
			this.player = link

			const [ playerEnergy ] = this.player.get(PlayerEnergy)

			playerEnergy.weaponReloadTime = this.reloadTime
			playerEnergy.weaponConsumption = this.shotConsumption
		}
	}

	/** @param {Link} link */
	onRemove(link) {
		if (link == this.player)
			this.player = null
	}

	onStep() {
		if (this.player) {
			const [ playerEnergy ] = this.player.get(PlayerEnergy)

			if (
				   this.nextShotTime < this.universe.clock.time // Has reloaded?
				&& playerEnergy.weaponConsumption <= playerEnergy.weapon // Has energy?
				&& this.userInput.isPressed(this.game.keyBindings.shoot) // Has order?
			) {
				this.nextShotTime = this.universe.clock.time + playerEnergy.weaponReloadTime
				playerEnergy.weapon -= playerEnergy.weaponConsumption

				this.fire()
			}

			this.regenerate(playerEnergy)
		}
	}

	/** @abstract @protected */
	fire() {}

	/** @protected @param {PlayerEnergy} playerEnergy */
	regenerate(playerEnergy) {
		if (playerEnergy.weapon < playerEnergy.weaponMax)
			playerEnergy.weapon += playerEnergy.weaponRegen * this.universe.clock.spf
	}
}
