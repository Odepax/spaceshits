import { ArenaScenario } from "./arena-scenario.js"
import { PlayerAimRoutine } from "../../logic/player-control.js"
import { BerzerkPlayerAuxRoutine } from "../player-modules/berzerk.js"
import { Transform } from "../../math/transform.js"
import { BossDrone, BossDroneAimRoutine } from "../hostiles/turret-boss.js"
import { FightStage, StagedArenaScenarioRoutine, WavesStage } from "../arena-stages.js"
import { spawnBerzerkParticles } from "../known-particles.js"
import { Player } from "../player.js"
import { Sprites } from "../../graphic/assets/sprites.js"
import { RammingDamage } from "../../logic/ramming-damage.js"
import { TurretPlayerWeaponRoutine } from "../player-weapons/turret-boss.js"
import { AutoWeaponModuleRoutine } from "../../logic/auto-weapon.js"

export class Floor0Arena0 extends ArenaScenario {
	registerPlayerMovement() {
		this.universe.register(new PlayerAimRoutine(this.userInput, this.game))
	}

	registerPlayerWeapon() {
		this.universe.register(new TurretPlayerWeaponRoutine(this.userInput, this.game, this.universe))
	}

	registerPlayerModule() {
		this.universe.register(new BerzerkPlayerAuxRoutine(this.userInput, this.game, this.universe, spawnBerzerkParticles(this.vfx)))
	}

	registerHostiles() {
		this.universe.register(new BossDroneAimRoutine(this.universe))
		this.universe.register(new AutoWeaponModuleRoutine(this.universe))
	}

	registerScenario() {
		this.universe.register(new StagedArenaScenarioRoutine(this.universe, [
			new WavesStage(0.3, 10, () => [ new BossDrone(new Transform(this.universe.width * 0.5, this.universe.height * 0.95, -Math.PI / 4)) ]),
			new FightStage()
		], this.onVictory, this.onDefeat))
	}

	addPlayer() {
		this.universe.add(new Player(
			new Transform(700 * 0.5, 700 * 0.8),
			undefined,
			[ Sprites.turretBossBase, Sprites.turretBoss ],
			RammingDamage.bounceOtherOnDamage
		))
	}
}
