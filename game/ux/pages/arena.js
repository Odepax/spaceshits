import { Page, PageRegistry } from "../page-registry.js"
import { GameKeeper } from "../../lore/game-keeper.js"
import { Universe, Link } from "../../core/engine.js"
import { UserInputCapturer, UserInputCaptureRoutine } from "../user-input-capture.js"
import { PlayerControlRoutine } from "../../logic/player-control.js"
import { MotionRoutine, Motion } from "../../physic/motion.js"
import { Player, Hostile, Turret } from "../../lore/player.js"
import { Sprites } from "../../graphic/assets/sprites.js"
import { CollisionDetectionRoutine, CollisionDetector } from "../../physic/collision.js"
import { RammingDamageRoutine } from "../../logic/ramming-damage.js"
import { VfxRegistry } from "../../graphic/vfx.js"
import { Colors } from "../../graphic/assets/colors.js"
import { LifeAndDeathRoutine } from "../../logic/life-and-death.js"
import { GatlingPlayerWeaponRoutine, ShockgunPlayerWeaponRoutine, ChargerPlayerWeaponRoutine } from "../../lore/player-weapons.js"
import { RenderRoutine } from "../../graphic/render.js"
import { Random } from "../../math/random.js"
import { DamageColorizationRoutine, PlayerStatsVisualizationRoutine } from "../../graphic/hud.js"
import { AutoFieldModuleRoutine } from "../../logic/auto-field.js"
import { ArenaScenarios } from "../../lore/arena-scenarios.js"

export class ArenaPage extends Page {
	/** @param {PageRegistry} navigation @param {GameKeeper} game */
	constructor(navigation, game) {
		super()

		this.navigation = navigation
		this.game = game
	}

	onInstall() {
		const gameCanvas = this.$.gameCanvas

		gameCanvas.focus()
		gameCanvas.addEventListener("mouseenter", () => gameCanvas.focus(), false)
		gameCanvas.addEventListener("mousedown", () => gameCanvas.focus(), false)

		this.$.floorNumber.textContent = this.game.currentFloor
		this.$.arenaNumber.textContent = this.game.currentArena

		//this.arena = this.game.buildArena(this.$.gameCanvas, this.$.hpBar, this.$.energyBar)
	}

	onEnter() {
		//this.arena.wait(
		//	() => {
		//		if (this.game.arena == 7) { // TODO: Remove hard-coded value.
		//			this.navigation.enter(VictoryPage)
		//		} else {
		//			this.game.stepArena()
		//			this.navigation.enter(ShopPage)
		//		}
		//	},
		//	() => {
		//		this.navigation.enter(DefeatPage)
		//	}
		//)

		Sprites.import().then(spriteSource => {
			const universe = new Universe(this.$.gameCanvas.offsetWidth, this.$.gameCanvas.offsetHeight)

			const userInput = new UserInputCapturer(this.$.gameCanvas)
			const collisions = new CollisionDetector()
			const vfx = new VfxRegistry(universe)

			// User input capture.
			universe.register(new UserInputCaptureRoutine(userInput))
			// TODO: Move CollisionDetectionRoutine up here, i.e. in the capture stage?

			// Decision making --- logic 1.
			universe.register(new PlayerControlRoutine(userInput, this.game, universe))
			universe.register(new ChargerPlayerWeaponRoutine(userInput, this.game, universe))

			//universe.register(ArenaScenarios[n](universe))

			// Motion dynamics & collision detection.
			universe.register(new MotionRoutine(universe))
			universe.register(new CollisionDetectionRoutine(collisions))

			// Collision reactions -- logic 2.
			const rammingDamage = new RammingDamageRoutine(collisions, universe)

			universe.register(rammingDamage)
			universe.register(new LifeAndDeathRoutine(universe))
			universe.register(new AutoFieldModuleRoutine(universe))

			// Render.
			/** @param {Link} a @param {Link} b */
			rammingDamage.onBounce = (a, b) => {
				const { x: ax, y: ay } = a.get(Motion)[0].position
				const { x: bx, y: by } = b.get(Motion)[0].position

				vfx.spawnParticleBurst(20, (ax + bx) / 2, (ay + by) / 2, 100, 200, 1, [ Colors.white, Colors.silver, Colors.grey, Colors.black ], 2, 10)
			}

			universe.register(new DamageColorizationRoutine(universe))
			universe.register(new RenderRoutine(this.$.gameCanvas, spriteSource, universe, userInput, vfx))
			universe.register(new PlayerStatsVisualizationRoutine(this.$.hpProgress))

			universe.add(new Turret(300, 400))
			universe.add(new Turret(400, 300))

			universe.add(new Player())

			for (let i = 0; i < 3; ++i)
				universe.add(new Hostile(
					Random.between(300, 700),
					Random.between(300, 700),
					Random.between(-200, 200),
					Random.between(-200, 200)
				))

			this.u = universe
			this.u.start()
		})
	}

	onExit() {
		this.u?.stop()
		//this.arena.complete()
	}
}
