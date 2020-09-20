import { Sprites } from "../graphic/assets/sprites.js"
import { Random } from "../math/random.js"
import { ArenaScenarios } from "./arena-scenarios.js"
import { ShopItems } from "./shop-items.js"

/** Keeps track of key bindings, game settings and player's items and progresion; builds shop and arenas. */
export class GameKeeper {
	constructor() {
		this.keyBindings = {
			up: "KeyW",
			left: "KeyA",
			down: "KeyS",
			right: "KeyD",
			shoot: "MouseLeft",
			aux: "Space",
			pause: "Escape"
		}

		this.reset()
	}

	reset() {
		/** @private */
		this.arenaIndex = 0

		this.balance = 101

		this.damageBoosts = 0
		this.hullBoosts = 0
		this.fireRateBoosts = 0
		this.weaponEnergyCapBoosts = 0
		this.weaponEnergyRegenBoosts = 0
		this.auxEnergyCapBoosts = 0
		this.auxEnergyRegenBoosts = 0
	}

	get currentArena() {
		return this.arenaIndex % 5 + 1
	}

	get currentFloor() {
		return Math.floor(0.2 * this.arenaIndex + 1)
	}

	get isPristine() {
		return this.arenaIndex == 0
	}

	get isLastArena() {
		return this.arenaIndex == ArenaScenarios.length - 1
	}

	/** @param {number} arenaCompletionTime */
	completeArena(arenaCompletionTime) {
		this.balance += ~~(1500 * this.arenaIndex / arenaCompletionTime)
		++this.arenaIndex
	}

	load() {
		// TODO
	}

	save() {
		// TODO
	}

	buildShop() {
		const availableItems = Array.from(ShopItems)

		return [
			Random.pop(availableItems),
			Random.pop(availableItems),
			Random.pop(availableItems),
			Random.pop(availableItems)
		]
	}

	/**
	 * @param {HTMLCanvasElement} gameCanvas
	 * @param {HTMLProgressElement} hpProgress
	 * @param {HTMLProgressElement} energyProgress
	 * @param {HTMLProgressElement} moduleProgress
	 * @param {() => void} onVictory
	 * @param {() => void} onDefeat
	 */
	buildArena(gameCanvas, hpProgress, energyProgress, moduleProgress, onVictory, onDefeat) {
		return Sprites.import().then(spriteSource => {
			const game = this

			const arena = new ArenaScenarios[this.arenaIndex](
				gameCanvas,
				hpProgress, energyProgress, moduleProgress,
				spriteSource,
				game,
				onVictory, onDefeat
			)

			return arena.buildUniverse()
		})
	}
}
