import { AutoWeaponModuleRoutine } from "../../logic/auto-weapon.js"
import { Random } from "../../math/random.js"
import { Transform } from "../../math/transform.js"
import { CalmStage, FightStage, StagedArenaScenarioRoutine, SwarmStage, WavesStage } from "../arena-stages.js"
import { duoCube } from "../hostiles/cubes.js"
import { turret, TurretAimRoutine } from "../hostiles/turrets.js"
import { Floor2 } from "./floor-2.js"

export class Floor2Arena2 extends Floor2 {
	registerHostiles() {
		this.universe.register(new TurretAimRoutine())
		this.universe.register(new AutoWeaponModuleRoutine(this.universe))
	}

	registerScenario() {
		this.universe.register(new StagedArenaScenarioRoutine(this.universe, [
			new SwarmStage(() => [
				turret(new Transform(0.15 * this.universe.width, 0.15 * this.universe.height)),
				turret(new Transform(0.85 * this.universe.width, 0.15 * this.universe.height))
			]),
			new CalmStage(2),
			new SwarmStage(() => [
				turret(new Transform(0.15 * this.universe.width, 0.25 * this.universe.height)),
				turret(new Transform(0.25 * this.universe.width, 0.15 * this.universe.height)),
				turret(new Transform(0.75 * this.universe.width, 0.15 * this.universe.height)),
				turret(new Transform(0.85 * this.universe.width, 0.25 * this.universe.height))
			]),
			new FightStage(),

			new SwarmStage(() => [
				turret(new Transform(0.15 * this.universe.width, 0.15 * this.universe.height)),
				turret(new Transform(0.85 * this.universe.width, 0.15 * this.universe.height))
			]),
			new CalmStage(2),
			new SwarmStage(() => [
				turret(new Transform(0.15 * this.universe.width, 0.25 * this.universe.height)),
				turret(new Transform(0.25 * this.universe.width, 0.15 * this.universe.height)),
				turret(new Transform(0.75 * this.universe.width, 0.15 * this.universe.height)),
				turret(new Transform(0.85 * this.universe.width, 0.25 * this.universe.height))
			]),
			new CalmStage(2),
			new WavesStage(4, 4, () => [
				duoCube(new Transform(0.5 * this.universe.width, 0.15 * this.universe.height, Random.angle()))
			]),
			new FightStage()
		], this.onVictory, this.onDefeat))
	}
}
