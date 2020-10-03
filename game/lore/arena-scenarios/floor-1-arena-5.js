import { AutoWeaponModuleRoutine, HostileMissileRoutine } from "../../logic/auto-weapon.js"
import { Random } from "../../math/random.js"
import { Transform } from "../../math/transform.js"
import { CalmStage, FightStage, StagedArenaScenarioRoutine, SwarmStage, WavesStage } from "../arena-stages.js"
import { duoCube, missileCube } from "../hostiles/cubes.js"
import { missileBoss, MissileBossRoutine } from "../hostiles/missile-boss.js"
import { Floor1 } from "./floor-1.js"

export class Floor1Arena5 extends Floor1 {
	registerPlayerWeapon() {
		super.registerPlayerWeapon()

		this.game.weaponUpgrade = null
	}

	registerHostiles() {
		this.universe.register(new AutoWeaponModuleRoutine(this.universe))
		this.universe.register(new MissileBossRoutine(this.universe))
		this.universe.register(new HostileMissileRoutine(this.universe))
	}

	registerScenario() {
		this.universe.register(new StagedArenaScenarioRoutine(this.universe, [
			new SwarmStage(() => [
				duoCube(new Transform(0.5 * this.universe.width, 0.3 * this.universe.height, Random.angle()))
			]),
			new FightStage(),

			new CalmStage(2),
			new SwarmStage(() => [
				missileCube(new Transform(0.5 * this.universe.width, 0.3 * this.universe.height, Random.angle()))
			]),
			new FightStage(),

			new CalmStage(2),
			new SwarmStage(() => [
				missileBoss(new Transform(0.5 * this.universe.width, 0.3 * this.universe.height, Random.angle()))
			]),
			new FightStage()
		], this.onVictory, this.onDefeat))
	}
}
