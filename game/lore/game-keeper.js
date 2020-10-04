import { Sprites } from "../graphic/assets/sprites.js"
import { Random } from "../math/random.js"
import { ArenaScenarios } from "./arena-scenarios.js"
import { ArenaScenario } from "./arena-scenarios/arena-scenario.js"
import { PLAYER_BALANCE_START } from "./game-balance.js"
import { ShopBoosters, ShopModules } from "./shop-items.js"

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

		this.balance = PLAYER_BALANCE_START

		this.hullBoosts = 0
		this.rammingDamageBoosts = 0
		this.weaponDamageBoosts = 0
		this.fireRateBoosts = 0
		this.weaponEnergyCapBoosts = 0
		this.weaponEnergyRegenBoosts = 0
		this.auxEnergyCapBoosts = 0
		this.auxEnergyRegenBoosts = 0

		/** @type {import("./shop-items").ShopItem} */
		this.weaponUpgrade = null
		this.isWeaponUpgraded = false

		/** @type {import("./shop-items").ShopItem} */
		this.currentModule = null

		/** @type {import("./shop-items").ShopItem} */
		this.moduleUpgrade = null

		/** @type {(arena: ArenaScenario) => void} */
		this.registerModule = null
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
		this.balance += ~~(3000 * this.arenaIndex / arenaCompletionTime)
		++this.arenaIndex
	}

	load() {
		// TODO
	}

	save() {
		// TODO
	}

	buildShop() {
		const availableBoosters = Array.from(ShopBoosters)
		const availableModules = Array.from(ShopModules).filter(it => it != this.currentModule)

		const boosters = [
			Random.pop(availableBoosters),
			Random.pop(availableBoosters),
			Random.pop(availableBoosters),
			Random.pop(availableBoosters)
		]

		const modules = [
			Random.pop(availableModules),
			Random.pop(availableModules)
		]

		/** @type {import("./shop-items").ShopItem[]} */
		const upgrades = []

		if (this.weaponUpgrade && !this.isWeaponUpgraded)
			upgrades.push(this.weaponUpgrade)

		if (this.moduleUpgrade)
			upgrades.push(this.moduleUpgrade)

		return { boosters, upgrades, modules }
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
