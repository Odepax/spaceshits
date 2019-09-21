import { white } from "../asset/style/color.js"
import { Universe, Link, Routine } from "../game/engine.js"
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
import { WeaponRoutine, HpRoutine, ProjectileDamageRoutine, RammingImpactDamageRoutine } from "../game/universe/combat.js"
import { LoopRoutine, WaitRoutine, loop, seconds, times, wait, second } from "../game/schedule.js"
import { DefeatPage } from "./defeat.js"
import { VictoryPage } from "./victory.js"

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
		this.universe.register(new RammingImpactDamageRoutine(this.universe))
		this.universe.register(new HpRoutine(this.universe))
		this.universe.register(new LoopRoutine(this.universe))
		this.universe.register(new WaitRoutine(this.universe))
		this.universe.register(new ExplosionOnAddRoutine(this.universe))
		this.universe.register(new ExplosionOnRemoveRoutine(this.universe))
		this.universe.register(new ParticleCloudRoutine(this.universe.clock))
		this.universe.register(new RenderRoutine(gameCanvas))

		// TODO: Implement with a renderer?
		this.universe.register(new PlayerGaugesRoutine(player, this.$.hpBar, this.$.energyBar))

		// FPS counter.
		this.universe.register(MatchSubRoutine.onSubStep(({ Debug }) => {
			/** @type {CanvasRenderingContext2D} */ const graphics = gameCanvas.getContext("2d")

			graphics.font = "16px Alte DIN 1451 Mittelschrift"
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
		wait(this.universe, 0.1 * second, () => {
			this.universe.add(player)
		})

		// Hostiles
		const hostileList = []

		wait(this.universe, 3 * seconds, () => {
			loop(this.universe, 0.3 * seconds, 3 * times, () => {
				const hostile = new Cube(gameCanvas.offsetWidth * 0.5, gameCanvas.offsetHeight * 0.2)
				hostileList.push(hostile)
				this.universe.add(hostile)
			})
		})

		wait(this.universe, 12 * seconds, () => {
			loop(this.universe, 0.3 * seconds, 3 * times, () => {
				const hostile = new CubeQuad(gameCanvas.offsetWidth * 0.3, gameCanvas.offsetHeight * 0.2)
				hostileList.push(hostile)
				this.universe.add(hostile)
			})
		})

		wait(this.universe, 21 * seconds, () => {
			loop(this.universe, 0.3 * seconds, 3 * times, () => {
				const hostile = new CubeMissile(gameCanvas.offsetWidth * 0.7, gameCanvas.offsetHeight * 0.2, player)
				hostileList.push(hostile)
				this.universe.add(hostile)
			})
		})

		// Victory.
		let hostiles = 9
		const self = this

		this.universe.register(new (class extends Routine {
			test(link) {
				return hostileList.includes(link)
			}

			onRemove() {
				if (--hostiles == 0) {
					wait(self.universe, 3 * seconds, () => self.navigation.enter(VictoryPage))
				}
			}
		})())

		// Defeat.
		wait(this.universe, () => player.Hp.value < 0, () => {
			wait(this.universe, 3 * seconds, () => this.navigation.enter(DefeatPage))
		})

		this.universe.start()
	}

	onExit() {
		this.universe.stop()
	}
}
