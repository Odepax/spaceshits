import { AutoFieldModuleRoutine } from "../../logic/auto-field.js"
import { AutoWeaponModuleRoutine } from "../../logic/auto-weapon.js"
import { Random } from "../../math/random.js"
import { Transform } from "../../math/transform.js"
import { CalmStage, FightStage, StagedArenaScenarioRoutine, SwarmStage, WavesStage } from "../arena-stages.js"
import { shieldAura } from "../hostiles/auras.js"
import { duoCube } from "../hostiles/cubes.js"
import { turret, TurretAimRoutine } from "../hostiles/turrets.js"
import { Floor2 } from "./floor-2.js"

export class Floor2Arena3 extends Floor2 {
	registerHostiles() {
		this.universe.register(new TurretAimRoutine())
		this.universe.register(new AutoWeaponModuleRoutine(this.universe))
		this.universe.register(new AutoFieldModuleRoutine(this.universe))
	}

	registerScenario() {
		this.universe.register(new StagedArenaScenarioRoutine(this.universe, [
			new SwarmStage(() => [
				shieldAura(new Transform(0.5 * this.universe.width, 0.2 * this.universe.height)),
				turret(new Transform(0.5 * this.universe.width, 0.3 * this.universe.height))
			]),
			new FightStage(),

			new CalmStage(2),
			new SwarmStage(() => [
				shieldAura(new Transform(0.5 * this.universe.width, 0.3 * this.universe.height)),
				turret(new Transform(0.4 * this.universe.width, 0.3 * this.universe.height)),
				turret(new Transform(0.6 * this.universe.width, 0.3 * this.universe.height))
			]),
			new FightStage(),

			new CalmStage(2),
			new SwarmStage(() => [
				shieldAura(new Transform(0.3 * this.universe.width, 0.3 * this.universe.height)),
				shieldAura(new Transform(0.7 * this.universe.width, 0.3 * this.universe.height))
			]),
			new CalmStage(2),
			new SwarmStage(() => [
				turret(new Transform(0.23 * this.universe.width, 0.37 * this.universe.height)),
				turret(new Transform(0.77 * this.universe.width, 0.37 * this.universe.height))
			]),
			new CalmStage(10),
			new WavesStage(0.3, 6, () => [
				duoCube(new Transform(0.5 * this.universe.width, 0.3 * this.universe.height, Random.angle()))
			]),
			new FightStage()
		], this.onVictory, this.onDefeat))
	}
}
