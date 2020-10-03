import { AutoWeaponModuleRoutine } from "../../logic/auto-weapon.js"
import { Transform } from "../../math/transform.js"
import { CalmStage, FightStage, StagedArenaScenarioRoutine, SwarmStage } from "../arena-stages.js"
import { smartTurret, SmartTurretAimRoutine, turret, TurretAimRoutine } from "../hostiles/turrets.js"
import { Floor2 } from "./floor-2.js"

export class Floor2Arena4 extends Floor2 {
	registerPlayerWeapon() {
		super.registerPlayerWeapon()

		this.game.weaponUpgrade = null
	}

	registerHostiles() {
		this.universe.register(new TurretAimRoutine())
		this.universe.register(new SmartTurretAimRoutine(this.universe))
		this.universe.register(new AutoWeaponModuleRoutine(this.universe))
	}

	registerScenario() {
		this.universe.register(new StagedArenaScenarioRoutine(this.universe, [
			new SwarmStage(() => [
				turret(new Transform(0.5 * this.universe.width, 0.3 * this.universe.height))
			]),
			new FightStage(),

			new CalmStage(2),
			new SwarmStage(() => [
				smartTurret(new Transform(0.5 * this.universe.width, 0.3 * this.universe.height))
			]),
			new FightStage(),

			// new CalmStage(2),
			new SwarmStage(() => [
				smartTurret(new Transform(0.15 * this.universe.width, 0.15 * this.universe.height)),
				smartTurret(new Transform(0.85 * this.universe.width, 0.15 * this.universe.height))
			]),
			new CalmStage(0.3),
			new SwarmStage(() => [
				turret(new Transform(0.25 * this.universe.width, 0.15 * this.universe.height)),
				turret(new Transform(0.75 * this.universe.width, 0.15 * this.universe.height)),
				turret(new Transform(0.15 * this.universe.width, 0.25 * this.universe.height)),
				turret(new Transform(0.85 * this.universe.width, 0.25 * this.universe.height))
			]),
			new FightStage(),

			new CalmStage(2),
			new SwarmStage(() => [
				smartTurret(new Transform(0.10 * this.universe.width, 0.10 * this.universe.height)),
				smartTurret(new Transform(0.90 * this.universe.width, 0.10 * this.universe.height)),
				smartTurret(new Transform(0.10 * this.universe.width, 0.90 * this.universe.height)),
				smartTurret(new Transform(0.90 * this.universe.width, 0.90 * this.universe.height))
			]),
			new CalmStage(2),
			new SwarmStage(() => [
				turret(new Transform(0.17 * this.universe.width, 0.17 * this.universe.height)),
				turret(new Transform(0.83 * this.universe.width, 0.17 * this.universe.height)),
				turret(new Transform(0.17 * this.universe.width, 0.83 * this.universe.height)),
				turret(new Transform(0.83 * this.universe.width, 0.83 * this.universe.height))
			]),
			new FightStage()
		], this.onVictory, this.onDefeat))
	}
}
