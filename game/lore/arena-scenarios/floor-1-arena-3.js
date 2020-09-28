import { AutoWeaponModuleRoutine, HostileMissileRoutine } from "../../logic/auto-weapon.js"
import { Random } from "../../math/random.js"
import { Transform } from "../../math/transform.js"
import { CalmStage, FightStage, StagedArenaScenarioRoutine, SwarmStage, WavesStage } from "../arena-stages.js"
import { duoCube, missileCube } from "../hostiles/cubes.js"
import { Floor1 } from "./floor-1.js"

export class Floor1Arena3 extends Floor1 {
	registerHostiles() {
		this.universe.register(new AutoWeaponModuleRoutine(this.universe))
		this.universe.register(new HostileMissileRoutine(this.universe))
	}

	registerScenario() {
		this.universe.register(new StagedArenaScenarioRoutine(this.universe, [
			new SwarmStage(() => [
				missileCube(new Transform(0.4 * this.universe.width, 0.3 * this.universe.height, Random.angle())),
				missileCube(new Transform(0.6 * this.universe.width, 0.3 * this.universe.height, Random.angle()))
			]),
			new FightStage(),

			new CalmStage(2),
			new SwarmStage(() => [
				missileCube(new Transform(0.3 * this.universe.width, 0.3 * this.universe.height, Random.angle())),
				missileCube(new Transform(0.5 * this.universe.width, 0.3 * this.universe.height, Random.angle())),
				missileCube(new Transform(0.7 * this.universe.width, 0.3 * this.universe.height, Random.angle()))
			]),
			new FightStage(),
			new WavesStage(3, 6, () => [
				duoCube(new Transform(Random.in([ 0.05, 0.95 ]) * this.universe.width, Random.in([ 0.05, 0.95 ]) * this.universe.height, Random.angle()))
			]),
			new FightStage()
		], this.onVictory, this.onDefeat))
	}
}
