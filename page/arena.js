import { white } from "../asset/style/color.js"
import { Universe, Link } from "../game/engine.js"
import { MatchSubRoutine } from "../game/routine.js"
import { DynamicRoutine } from "../game/dynamic.js"
import { RenderRoutine } from "../game/render.js"
import { InteractionCentral, InteractionRoutine } from "../game/central/interaction.js"
import { NavigationCentral, SpaceshitsPage } from "../game/central/navigation.js"
import { MouseAndKeyboardControlRoutine } from "../game/control.js"
import { ParameterCentral } from "../game/central/parameter.js"
import { TargetFacingRoutine, ForwardChasingRoutine } from "../game/movement.js"
import { ExplosionOnRemoveRoutine, ExplosionOnAddRoutine } from "../game/universe/explosion.js"
import { ParticleCloudRoutine } from "../game/universe/particle.js"
import { EphemeralRoutine } from "../game/ephemeral.js"
import { GatlingPlayer, MouseAndKeyboardWeaponControlRoutine, PlayerGaugesRoutine } from "../game/universe/player.js"
import { CubeQuad, Cube, CubeMissile } from "../game/universe/hostile/cube.js"
import { WeaponRoutine, HpRoutine, ProjectileDamageRoutine } from "../game/universe/combat.js"

class Debug {}

export class ArenaPage extends SpaceshitsPage {
	constructor(/** @type {NavigationCentral} */ navigation, /** @type {ParameterCentral} */ parameters) {
		super()

		this.navigation = navigation
		this.parameters = parameters
	}

	onInstall() {
		const gameCanvas = this.$.gameCanvas

		gameCanvas.focus()
		gameCanvas.addEventListener("mouseenter", () => gameCanvas.focus(), false)
		gameCanvas.addEventListener("mousedown", () => gameCanvas.focus(), false)
	}

	onEnter() {
		/** @type HTMLCanvasElement */ const gameCanvas = this.$.gameCanvas

		this.universe = new Universe()

		const interactionCentral = new InteractionCentral(gameCanvas)

		const player = new GatlingPlayer(
			gameCanvas.offsetWidth * 0.5,
			gameCanvas.offsetHeight * 0.8,
			interactionCentral.mousePosition
		)

		this.universe.register(new InteractionRoutine(interactionCentral))
		this.universe.register(new MouseAndKeyboardControlRoutine(interactionCentral, this.parameters))
		this.universe.register(new MouseAndKeyboardWeaponControlRoutine(interactionCentral, this.parameters))
		this.universe.register(new TargetFacingRoutine(this.universe.clock))
		this.universe.register(new ForwardChasingRoutine(this.universe.clock))
		this.universe.register(new DynamicRoutine(this.universe, gameCanvas.offsetWidth, gameCanvas.offsetHeight))
		this.universe.register(new EphemeralRoutine(this.universe))
		this.universe.register(new WeaponRoutine(this.universe))
		this.universe.register(new ProjectileDamageRoutine(this.universe))
		this.universe.register(new HpRoutine(this.universe))
		this.universe.register(new ExplosionOnAddRoutine(this.universe))
		this.universe.register(new ExplosionOnRemoveRoutine(this.universe))
		this.universe.register(new ParticleCloudRoutine(this.universe.clock))
		this.universe.register(new RenderRoutine(gameCanvas))
		this.universe.register(new PlayerGaugesRoutine(player, this.$.hpBar, this.$.energyBar))

		// FPS counter.
		this.universe.register(MatchSubRoutine.onSubStep(({ Debug }) => {
			/** @type {CanvasRenderingContext2D} */ const graphics = gameCanvas.getContext("2d")

			graphics.font = "16px Roboto Mono"
			graphics.fillStyle = white

			let i = 0
			graphics.fillText("FPS: " + ~~(1 / this.universe.clock.spf), 50, 30 + 20 * ++i)
			graphics.fillText("Mouse: ( " + interactionCentral.mousePosition.x + " , " + interactionCentral.mousePosition.y + " )", 50, 30 + 20 * ++i)
			graphics.fillText("Keys: [ " + Array.from(interactionCentral.currentlyPressedKeys).join(", ") + " ]", 50, 30 + 20 * ++i)
		}))

		// FPS counter.
		this.universe.add(new Link([
			new Debug()
		]))

		// Player ship.
		this.universe.add(player)
		
		for (const t of [ 3.0, 3.3, 3.6 ]) {
			setTimeout(() => this.universe.add(new Cube(gameCanvas.offsetWidth * 0.5, gameCanvas.offsetHeight * 0.2)), t * 1000)
		}
		
		for (const t of [ 12.0, 12.3, 12.6 ]) {
			setTimeout(() => this.universe.add(new CubeQuad(gameCanvas.offsetWidth * 0.3, gameCanvas.offsetHeight * 0.2)), t * 1000)
		}

		for (const t of [ 21.0, 21.3, 21.6 ]) {
			setTimeout(() => this.universe.add(new CubeMissile(gameCanvas.offsetWidth * 0.7, gameCanvas.offsetHeight * 0.2, player)), t * 1000)
		}

		this.universe.start()
	}

	onExit() {
		this.universe.stop()

		this.universe = null
	}
}
