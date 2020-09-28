import { AutoWeaponModuleRoutine } from "../../logic/auto-weapon.js"
import { Random } from "../../math/random.js"
import { Transform } from "../../math/transform.js"
import { CalmStage, FightStage, StagedArenaScenarioRoutine, SwarmStage, WavesStage } from "../arena-stages.js"
import { duoCube } from "../hostiles/cubes.js"
import { Floor1 } from "./floor-1.js"

export class Floor1Arena1 extends Floor1 {
	registerHostiles() {
		this.universe.register(new AutoWeaponModuleRoutine(this.universe))
	}

	registerScenario() {
		this.universe.register(new StagedArenaScenarioRoutine(this.universe, [
			new SwarmStage(() => [
				duoCube(new Transform(0.5 * this.universe.width, 0.3 * this.universe.height, Random.angle()))
			]),
			new FightStage(),

			new CalmStage(2),
			new SwarmStage(() => [
				duoCube(new Transform(0.4 * this.universe.width, 0.3 * this.universe.height, Random.angle())),
				duoCube(new Transform(0.6 * this.universe.width, 0.3 * this.universe.height, Random.angle()))
			]),
			new FightStage(),

			new CalmStage(2),
			new SwarmStage(() => [
				duoCube(new Transform(0.3 * this.universe.width, 0.3 * this.universe.height, Random.angle())),
				duoCube(new Transform(0.5 * this.universe.width, 0.3 * this.universe.height, Random.angle())),
				duoCube(new Transform(0.7 * this.universe.width, 0.3 * this.universe.height, Random.angle()))
			]),
			new FightStage(),

			new CalmStage(2),
			new WavesStage(0.3, 3, () => [
				duoCube(new Transform(Random.between(0.2, 0.8) * this.universe.width, Random.between(0.2, 0.5) * this.universe.height, Random.angle())),
				duoCube(new Transform(Random.between(0.2, 0.8) * this.universe.width, Random.between(0.2, 0.5) * this.universe.height, Random.angle()))
			]),
			new FightStage()
		], this.onVictory, this.onDefeat))
	}
}
