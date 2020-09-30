import { AutoWeaponModuleRoutine } from "../../logic/auto-weapon.js"
import { Transform } from "../../math/transform.js"
import { CalmStage, FightStage, StagedArenaScenarioRoutine, SwarmStage } from "../arena-stages.js"
import { turret, TurretAimRoutine } from "../hostiles/turrets.js"
import { Floor2 } from "./floor-2.js"

export class Floor2Arena1 extends Floor2 {
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
			new CalmStage(5),
			new SwarmStage(() => [
				turret(new Transform(0.15 * this.universe.width, 0.85 * this.universe.height)),
				turret(new Transform(0.85 * this.universe.width, 0.85 * this.universe.height))
			]),
			new CalmStage(10),
			new SwarmStage(() => [
				turret(new Transform(0.15 * this.universe.width, 0.50 * this.universe.height)),
				turret(new Transform(0.50 * this.universe.width, 0.15 * this.universe.height)),
				turret(new Transform(0.85 * this.universe.width, 0.50 * this.universe.height)),
				turret(new Transform(0.50 * this.universe.width, 0.85 * this.universe.height))
			]),
			new FightStage()
		], this.onVictory, this.onDefeat))
	}
}
