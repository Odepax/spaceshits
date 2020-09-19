import { Universe } from "../../core/engine.js"
import { DamageColorizationRoutine, PlayerStatsVisualizationRoutine } from "../../graphic/hud.js"
import { RenderRoutine } from "../../graphic/render.js"
import { VfxRegistry } from "../../graphic/vfx.js"
import { LifeAndDeathRoutine } from "../../logic/life-and-death.js"
import { PlayerControlRoutine } from "../../logic/player-control.js"
import { RammingDamageRoutine } from "../../logic/ramming-damage.js"
import { CollisionDetectionRoutine, CollisionRegistry } from "../../physic/collision.js"
import { MotionRoutine } from "../../physic/motion.js"
import { UserInputCaptureRoutine, UserInputRegistry } from "../../ux/user-input-capture.js"
import { GameKeeper } from "../game-keeper.js"
import { spawDamageParticles } from "../known-particles.js"

/** @abstract */
export class ArenaScenario {
	/**
	 * @param {HTMLCanvasElement} gameCanvas
	 * @param {HTMLProgressElement} hpProgress
	 * @param {HTMLProgressElement} energyProgress
	 * @param {HTMLProgressElement} moduleProgress
	 * @param {ImageBitmap} spriteSource
	 * @param {GameKeeper} game
	 * @param {() => void} onVictory
	 * @param {() => void} onDefeat
	 */
	constructor(gameCanvas, hpProgress, energyProgress, moduleProgress, spriteSource, game, onVictory, onDefeat) {
		this.gameCanvas = gameCanvas
		this.hpProgress = hpProgress
		this.energyProgress = energyProgress
		this.moduleProgress = moduleProgress
		this.spriteSource = spriteSource
		this.game = game
		this.onVictory = onVictory
		this.onDefeat = onDefeat

		this.universe = new Universe(this.gameCanvas.offsetWidth, this.gameCanvas.offsetHeight)
		this.userInput = new UserInputRegistry(this.gameCanvas)
		this.collisions = new CollisionRegistry()
		this.vfx = new VfxRegistry(this.universe)
	}

	buildUniverse() {
		// 1. User input capture.
		this.universe.register(new UserInputCaptureRoutine(this.userInput))

		// 2. Decision making.
		this.registerPlayerMovement()
		this.registerPlayerWeapon()
		this.registerPlayerModule()

		this.registerHostiles()
		this.registerScenario()

		// 3. Motion dynamics.
		this.universe.register(new MotionRoutine(this.universe))
		this.universe.register(new CollisionDetectionRoutine(this.collisions))

		// 4. Collision reactions.
		this.universe.register(new RammingDamageRoutine(this.collisions, this.universe, spawDamageParticles(this.vfx)))
		this.registerFields()
		this.universe.register(new LifeAndDeathRoutine(this.universe))

		// 5. Render.
		this.universe.register(new DamageColorizationRoutine(this.universe))
		this.universe.register(new RenderRoutine(this.gameCanvas, this.spriteSource, this.universe, this.userInput, this.vfx))
		this.universe.register(new PlayerStatsVisualizationRoutine(this.hpProgress, this.energyProgress, this.moduleProgress))

		this.addPlayer()

		return this.universe
	}

	/** @protected */
	registerPlayerMovement() {
		this.universe.register(new PlayerControlRoutine(this.userInput, this.game, this.universe))
	}

	/** @protected */ registerPlayerWeapon() {}
	/** @protected */ registerPlayerModule() {}
	/** @protected */ registerHostiles() {}
	/** @protected */ registerScenario() {}
	/** @protected */ registerFields() {}
	/** @protected */ addPlayer() {}
}
