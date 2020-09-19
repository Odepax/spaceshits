import { Sprites } from "../graphic/assets/sprites.js"
import { Universe } from "../core/engine.js"
import { UserInputCaptureRoutine, UserInputRegistry } from "../ux/user-input-capture.js"
import { CollisionDetectionRoutine, CollisionRegistry } from "../physic/collision.js"
import { VfxRegistry } from "../graphic/vfx.js"
import { PlayerControlRoutine } from "../logic/player-control.js"
import { MissilePlayerWeaponRoutine } from "./player-weapons.js"
import { BerzerkPlayerAuxRoutine } from "./player-modules/berzerk.js"
import { spawnBerzerkParticles, spawDamageParticles, spawnHealParticles } from "./known-particles.js"
import { ArenaScenarios } from "./arena-scenarios.js"
import { MotionRoutine } from "../physic/motion.js"
import { RammingDamageRoutine } from "../logic/ramming-damage.js"
import { HealFieldRoutine } from "../logic/heal-field.js"
import { LifeAndDeathRoutine } from "../logic/life-and-death.js"
import { DamageColorizationRoutine, PlayerStatsVisualizationRoutine } from "../graphic/hud.js"
import { RenderRoutine } from "../graphic/render.js"
import { Player } from "./player.js"

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
		return Sprites.import().then(spriteSource => this.buildUniverse(gameCanvas, spriteSource, hpProgress, energyProgress, moduleProgress, onVictory, onDefeat))
	}

	/**
	 * @private
	 * @param {HTMLCanvasElement} gameCanvas
	 * @param {ImageBitmap} spriteSource
	 * @param {HTMLProgressElement} hpProgress
	 * @param {HTMLProgressElement} energyProgress
	 * @param {HTMLProgressElement} moduleProgress
	 * @param {() => void} onVictory
	 * @param {() => void} onDefeat
	 */
	buildUniverse(gameCanvas, spriteSource, hpProgress, energyProgress, moduleProgress, onvictory, onDefeat) {
		const universe = new Universe(gameCanvas.offsetWidth, gameCanvas.offsetHeight)
		const userInput = new UserInputRegistry(gameCanvas)
		const collisions = new CollisionRegistry()
		const vfx = new VfxRegistry(universe)

		// 1. User input capture.
		universe.register(new UserInputCaptureRoutine(userInput))

		// 2. Decision making.
		// 2.A. Player movement.
		universe.register(new PlayerControlRoutine(userInput, this, universe))

		// 2.B. Player weapon.
		universe.register(new MissilePlayerWeaponRoutine(userInput, this, universe))

		// 2.C. Player module.
		universe.register(new BerzerkPlayerAuxRoutine(userInput, this, universe, spawnBerzerkParticles(vfx)))

		// 2.D. Hostiles.
		//universe.register(new TurretAimRoutine())
		//universe.register(new SmartTurretAimRoutine(universe))
		//universe.register(new DroneAimRoutine(universe))
		//universe.register(new SmartCrasherAttractionRoutine(universe))
		//universe.register(new DivDivisionRoutine(universe))
		//universe.register(new AutoWeaponModuleRoutine(universe))
		//universe.register(new AutoFieldModuleRoutine(universe))
		//universe.register(new MissileBossRoutine(universe))
		//universe.register(new HostileMissileRoutine(universe))

		// 2.E. Arena scenario.
		universe.register(ArenaScenarios[this.arenaIndex](universe, onvictory, onDefeat))

		// 3. Motion dynamics.
		universe.register(new MotionRoutine(universe))
		universe.register(new CollisionDetectionRoutine(collisions))

		// 4. Collision reactions.
		// 4.A. Damage.
		universe.register(new RammingDamageRoutine(collisions, universe, spawDamageParticles(vfx)))

		// 4.B. Fields.
		universe.register(new HealFieldRoutine(collisions, universe, spawnHealParticles(vfx, universe)))

		// 4.C. Death.
		universe.register(new LifeAndDeathRoutine(universe))

		// 5. Render.
		universe.register(new DamageColorizationRoutine(universe))
		universe.register(new RenderRoutine(gameCanvas, spriteSource, universe, userInput, vfx))
		universe.register(new PlayerStatsVisualizationRoutine(hpProgress, energyProgress, moduleProgress))

		universe.add(new Player())

		return universe
	}
}
