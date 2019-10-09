﻿import { ParameterCentral } from "./parameter.js"
import { InteractionCentral, InteractionRoutine } from "./interaction.js"
import { Universe, Link, Routine } from "../engine.js"
import { GatlingPlayer, PlayerGaugesRoutine, MouseAndKeyboardWeaponControlRoutine } from "../universe/player.js"
import { MouseAndKeyboardControlRoutine } from "../control.js"
import { TargetFacingRoutine, ForwardChasingRoutine } from "../movement.js"
import { DynamicRoutine } from "../dynamic.js"
import { EphemeralRoutine } from "../ephemeral.js"
import { WeaponRoutine, ProjectileDamageRoutine, RammingImpactDamageRoutine, HpRoutine } from "../universe/combat.js"
import { LoopRoutine, WaitRoutine, wait, second, loop, seconds, } from "../schedule.js"
import { ExplosionOnAddRoutine, ExplosionOnRemoveRoutine } from "../universe/explosion.js"
import { ParticleCloudRoutine } from "../universe/particle.js"
import { RenderRoutine } from "../render.js"
import { MatchSubRoutine } from "../routine.js"
import { Cube, CubeQuad, CubeMissile, HostileTag } from "../universe/hostile/cube.js"
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

		// player = build player
		//    foreach item: item.apply(this, player)
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

		return new Arena(gameCanvas, universe, player, [
			new SwarmStage(() => [ new Cube(gameCanvas.offsetWidth * 0.5, gameCanvas.offsetHeight * 0.2) ]),
			new CalmStage(0.3 * second),
			new SwarmStage(() => [ new Cube(gameCanvas.offsetWidth * 0.5, gameCanvas.offsetHeight * 0.2) ]),
			new CalmStage(0.3 * second),
			new SwarmStage(() => [ new Cube(gameCanvas.offsetWidth * 0.5, gameCanvas.offsetHeight * 0.2) ]),

			new CalmStage(9 * seconds),
		
			new SwarmStage(() => [ new CubeQuad(gameCanvas.offsetWidth * 0.3, gameCanvas.offsetHeight * 0.2) ]),
			new CalmStage(0.3 * second),
			new SwarmStage(() => [ new CubeQuad(gameCanvas.offsetWidth * 0.3, gameCanvas.offsetHeight * 0.2) ]),
			new CalmStage(0.3 * second),
			new SwarmStage(() => [ new CubeQuad(gameCanvas.offsetWidth * 0.3, gameCanvas.offsetHeight * 0.2) ]),

			new CalmStage(9 * seconds),

			new SwarmStage(() => [ new CubeMissile(gameCanvas.offsetWidth * 0.7, gameCanvas.offsetHeight * 0.2, player) ]),
			new CalmStage(0.3 * second),
			new SwarmStage(() => [ new CubeMissile(gameCanvas.offsetWidth * 0.7, gameCanvas.offsetHeight * 0.2, player) ]),
			new CalmStage(0.3 * second),
			new SwarmStage(() => [ new CubeMissile(gameCanvas.offsetWidth * 0.7, gameCanvas.offsetHeight * 0.2, player) ]),

			new FightStage()
		])
	}

	buildShop() {
		return new Shop()
	}
}

export class Arena {
	constructor(
		/** @type {HTMLCanvasElement} */ gameCanvas,
		/** @type {Universe} */ universe,
		/** @type {GatlingPlayer} */ player,
		/** @type {Iterable<ArenaStage>} */ stages
	) {
		this.gameCanvas = gameCanvas
		this.universe = universe
		this.player = player
		this.stages = stages
		/** @type {Set<Link>} */ this.hostiles = new Set()
	}

	add(/** @type {{ HostileTag: HostileTag }} */ hostile) {
		this.universe.add(hostile)
	}

	wait(/** @type {() => void} */ victoryCallback, /** @type {() => void} */ defeatCallback) {
		const arena = this
		this.universe.register(new (class extends Routine {
			test({ HostileTag = null }) {
				return HostileTag
			}

			onAdd(/** @type {Link} */ hostile) {
				arena.hostiles.add(hostile)
			}

			onRemove(/** @type {Link} */ hostile) {
				arena.hostiles.delete(hostile)
			}
		})())

		this.universe.add(this.player)
		this.universe.start()

		wait(this.universe, 3 * seconds, async () => {
			for (const stage of this.stages) {
				if (!(await stage.wait(this))) {
					wait(this.universe, 3 * seconds, defeatCallback)
					return
				}
			}

			wait(this.universe, 3 * seconds, victoryCallback)
		})
	}

	complete() {
		this.universe.stop()
	}
}

export /** @abstract */ class ArenaStage {
	/** @returns {Promise<boolean>} */ wait(/** @type {Arena} */ arena) {
		throw (this.constructor.name || ArenaStage.name) + "#wait(Arena) was not implemented."
	}
}

/** Nothing happens for a certain time. */
export class CalmStage extends ArenaStage {
	constructor(/** @type {number} */ calmTime) {
		super()

		this.calmTime = calmTime
	}

	wait(/** @type {Arena} */ arena) {
		return new Promise(resolve => {
			wait(arena.universe, this.calmTime, () => {
				resolve(true)
			})

			wait(arena.universe, () => arena.player.Hp.value < 0, () => {
				resolve(false)
			})
		})
	}
}

/** A batch of hostiles burst in. */
export class SwarmStage extends ArenaStage {
	constructor(/** @type {(arena: Arena) => Iterable<{ HostileTag: HostileTag }>} */ buildHostiles) {
		super()

		this.buildHostiles = buildHostiles
	}

	wait(/** @type {Arena} */ arena) {
		for (const hostile of this.buildHostiles(arena)) {
			arena.add(hostile)
		}

		return Promise.resolve(true)
	}
}

/** Hostiles spawn regularly until no hostile is left. */
export class WavesStage extends ArenaStage {
	constructor(/** @type {number} */ spawnInterval, /** @type {(arena: Arena) => Iterable<{ HostileTag: HostileTag }>} */ buildHostiles) {
		super()

		this.spawnInterval = spawnInterval
		this.buildHostiles = buildHostiles
	}

	wait(/** @type {Arena} */ arena) {
		loop(arena.universe, this.spawnInterval, 9999, () => {
			for (const hostile of this.buildHostiles(arena)) {
				arena.add(hostile)
			}
		})

		return new Promise(resolve => {
			wait(arena.universe, () => arena.hostiles.size == 0, () => {
				resolve(true)
			})

			wait(arena.universe, () => arena.player.Hp.value < 0, () => {
				resolve(false)
			})
		})
	}
}

/** Nothing happens until no hostile is left. */
export class FightStage extends ArenaStage {
	wait(/** @type {Arena} */ arena) {
		return new Promise(resolve => {
			wait(arena.universe, () => arena.hostiles.size == 0, () => {
				resolve(true)
			})

			wait(arena.universe, () => arena.player.Hp.value < 0, () => {
				resolve(false)
			})
		})
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
