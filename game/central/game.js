import { ParameterCentral } from "./parameter.js"
import { InteractionCentral, InteractionRoutine } from "./interaction.js"
import { Universe, Link, Routine } from "../engine.js"
import { GatlingPlayer, PlayerGaugesRoutine, MouseAndKeyboardWeaponControlRoutine } from "../universe/player.js"
import { MouseAndKeyboardControlRoutine } from "../control.js"
import { TargetFacingRoutine, ForwardChasingRoutine } from "../movement.js"
import { DynamicRoutine } from "../dynamic.js"
import { EphemeralRoutine } from "../ephemeral.js"
import { WeaponRoutine, ProjectileDamageRoutine, RammingImpactDamageRoutine, HpRoutine } from "../universe/combat.js"
import { LoopRoutine, WaitRoutine, wait, second, seconds, loop, times } from "../schedule.js"
import { ExplosionOnAddRoutine, ExplosionOnRemoveRoutine } from "../universe/explosion.js"
import { ParticleCloudRoutine } from "../universe/particle.js"
import { RenderRoutine } from "../render.js"
import { MatchSubRoutine } from "../routine.js"
import { Cube, CubeQuad, CubeMissile } from "../universe/hostile/cube.js"
import { white } from "../../asset/style/color.js"

/** Save & restore, run progression. */
export class GameCentral {
	constructor(/** @type {ParameterCentral} */ parameters) {
		this.parameters = parameters
		this.floor = 1
		this.arena = 1
		this.player = {
			sholdCount: 0,
			/** @type {Set<Item>} */ items: new Set()
		}
	}

	buildArena(/** @type {HTMLCanvasElement} */ gameCanvas, /** @type {HTMLProgressElement} */ hpBar, /** @type {HTMLProgressElement} */ energyBar) {
		const interactionCentral = new InteractionCentral(gameCanvas)

		const universe = new Universe()

		const player = new GatlingPlayer(
			gameCanvas.offsetWidth * 0.5,
			gameCanvas.offsetHeight * 0.8,
			interactionCentral.mousePosition
		)

		universe.register(new InteractionRoutine(interactionCentral))
		universe.register(new MouseAndKeyboardControlRoutine(interactionCentral, this.parameters))
		universe.register(new MouseAndKeyboardWeaponControlRoutine(interactionCentral, this.parameters))
		universe.register(new TargetFacingRoutine(universe.clock))
		universe.register(new ForwardChasingRoutine(universe.clock))
		universe.register(new DynamicRoutine(universe, gameCanvas.offsetWidth, gameCanvas.offsetHeight))
		universe.register(new EphemeralRoutine(universe))
		universe.register(new WeaponRoutine(universe))
		universe.register(new ProjectileDamageRoutine(universe))
		universe.register(new RammingImpactDamageRoutine(universe))
		universe.register(new HpRoutine(universe))
		universe.register(new LoopRoutine(universe))
		universe.register(new WaitRoutine(universe))
		universe.register(new ExplosionOnAddRoutine(universe))
		universe.register(new ExplosionOnRemoveRoutine(universe))
		universe.register(new ParticleCloudRoutine(universe.clock))
		universe.register(new RenderRoutine(gameCanvas))
		universe.register(new PlayerGaugesRoutine(player, hpBar, energyBar)) // TODO: Implement with a renderer?

		// FPS counter.
		class Debug {}

		universe.register(MatchSubRoutine.onSubStep(({ Debug }) => {
			/** @type {CanvasRenderingContext2D} */ const graphics = gameCanvas.getContext("2d")

			graphics.font = "16px Alte DIN 1451 Mittelschrift"
			graphics.fillStyle = white

			let i = 0
			graphics.fillText(~~(1 / universe.clock.spf) + " FPS", 50, 30 + 20 * ++i)
			graphics.fillText(interactionCentral.mousePosition.x + ", " + interactionCentral.mousePosition.y, 50, 30 + 20 * ++i)
			graphics.fillText(Array.from(interactionCentral.currentlyPressedKeys).join(", "), 50, 30 + 20 * ++i)
		}))

		universe.add(new Link([
			new Debug()
		]))

		return new Arena(interactionCentral, universe, player, gameCanvas)

		// player = build player
		//    foreach item: item.apply(this, player)
	}

	buildShop() {
		return new Shop()
	}
}

export class Arena {
	constructor(/** @type {InteractionCentral} */ interactions, /** @type {Universe} */ universe, /** @type {GatlingPlayer} */ player, /** @type {HTMLCanvasElement} */ gameCanvas) {
		this.interactions = interactions
		this.universe = universe
		this.player = player
		this.gameCanvas = gameCanvas
	}

	start(/** @type {() => void} */ victoryCallback, /** @type {() => void} */ defeatCallback) {
		const { universe, player, gameCanvas } = this

		// Player ship.
		wait(this.universe, 0.1 * second, () => {
			this.universe.add(this.player)
		})

		// Hostiles
		const hostileList = []

		wait(universe, 3 * seconds, () => {
			loop(universe, 0.3 * seconds, 3 * times, () => {
				const hostile = new Cube(gameCanvas.offsetWidth * 0.5, gameCanvas.offsetHeight * 0.2)
				hostileList.push(hostile)
				universe.add(hostile)
			})
		})

		wait(universe, 12 * seconds, () => {
			loop(universe, 0.3 * seconds, 3 * times, () => {
				const hostile = new CubeQuad(gameCanvas.offsetWidth * 0.3, gameCanvas.offsetHeight * 0.2)
				hostileList.push(hostile)
				universe.add(hostile)
			})
		})

		wait(universe, 21 * seconds, () => {
			loop(universe, 0.3 * seconds, 3 * times, () => {
				const hostile = new CubeMissile(gameCanvas.offsetWidth * 0.7, gameCanvas.offsetHeight * 0.2, player)
				hostileList.push(hostile)
				universe.add(hostile)
			})
		})

		// Victory.
		let hostiles = 9 // TODO: Remove hard-coded value.
		const self = this

		this.universe.register(new (class extends Routine {
			test(link) {
				return hostileList.includes(link)
			}

			onRemove() {
				if (--hostiles == 0) {
					wait(self.universe, 3 * seconds, victoryCallback)
				}
			}
		})())

		// Defeat.
		wait(this.universe, () => this.player.Hp.value < 0, () => {
			wait(this.universe, 3 * seconds, defeatCallback)
		})

		this.universe.start()
	}

	stop() {
		this.universe.stop()
	}
}

/**
 * @typedef {object} Item
 *
 * @property {string} name
 * @property {string} description
 * @property {int} price
 * @property {string} icon
 * @property {string} colorName
 *
 * @method install(GameCentral, Player)
 */

export class Shop {
	constructor() {
		this.items = []
	}
}
