import { ArenaScenario } from "./arena-scenario.js"
import { PlayerControlRoutine } from "../../logic/player-control.js"
import { MissilePlayerWeaponRoutine } from "../player-weapons.js"
import { BerzerkPlayerAuxRoutine } from "../player-modules/berzerk.js"
import { Transform } from "../../math/transform.js"
import { Motion } from "../../physic/motion.js"
import { Crasher } from "../hostiles/crashers.js"
import { CalmStage, FightStage, StagedArenaScenarioRoutine, SwarmStage } from "../arena-stages.js"
import { spawnBerzerkParticles } from "../known-particles.js"
import { Player } from "../player.js"
import { Sprites } from "../../graphic/assets/sprites.js"

export class Floor0Arena0 extends ArenaScenario {
	registerPlayerMovement() {
		this.universe.register(new PlayerControlRoutine(this.userInput, this.game, this.universe))
	}

	registerPlayerWeapon() {
		this.universe.register(new MissilePlayerWeaponRoutine(this.userInput, this.game, this.universe))
	}

	registerPlayerModule() {
		this.universe.register(new BerzerkPlayerAuxRoutine(this.userInput, this.game, this.universe, spawnBerzerkParticles(this.vfx)))
	}

	registerScenario() {
		function madSaw(x) {
			const c = new Crasher(new Transform(x, 0))
			const v = c.get(Motion)[0].velocity

			v.x = 0
			v.y = 150

			return c
		}

		this.universe.register(new StagedArenaScenarioRoutine(this.universe, [
			new SwarmStage(() => [ madSaw(this.universe.width * 0.5) ]),

			new CalmStage(0.3), new SwarmStage(() => [ madSaw(this.universe.width * 0.45), madSaw(this.universe.width * 0.55) ]),
			new CalmStage(0.3), new SwarmStage(() => [ madSaw(this.universe.width * 0.40), madSaw(this.universe.width * 0.60) ]),
			new CalmStage(0.3), new SwarmStage(() => [ madSaw(this.universe.width * 0.35), madSaw(this.universe.width * 0.65) ]),
			new CalmStage(0.3), new SwarmStage(() => [ madSaw(this.universe.width * 0.30), madSaw(this.universe.width * 0.70) ]),
			new CalmStage(0.3), new SwarmStage(() => [ madSaw(this.universe.width * 0.25), madSaw(this.universe.width * 0.75) ]),
			new CalmStage(0.3), new SwarmStage(() => [ madSaw(this.universe.width * 0.20), madSaw(this.universe.width * 0.80) ]),
			new CalmStage(0.3), new SwarmStage(() => [ madSaw(this.universe.width * 0.15), madSaw(this.universe.width * 0.85) ]),
			new CalmStage(0.3), new SwarmStage(() => [ madSaw(this.universe.width * 0.10), madSaw(this.universe.width * 0.90) ]),
			new CalmStage(0.3), new SwarmStage(() => [ madSaw(this.universe.width * 0.05), madSaw(this.universe.width * 0.95) ]),

			new FightStage()
		], this.onVictory, this.onDefeat))
	}

	addPlayer() {
		this.universe.add(new Player(
			new Transform(700 * 0.5, 700 * 0.8),
			undefined,
			[ Sprites.playerMissile ]
		))
	}
}
