import { Sprites } from "../graphic/assets/sprites.js"
import { ArenaScenarios } from "./arena-scenarios.js"

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

		/** @private */
		this.arenaIndex = 0
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

	reset() {
		this.arenaIndex = 0
	}

	load() {
		// TODO
	}

	save() {
		// TODO
	}

	buildShop() {
		// TODO
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
