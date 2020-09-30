import { AutoFieldModuleRoutine } from "../../logic/auto-field.js"
import { AutoWeaponModuleRoutine } from "../../logic/auto-weapon.js"
import { PlayerAimRoutine } from "../../logic/player-control.js"
import { Random } from "../../math/random.js"
import { Transform } from "../../math/transform.js"
import { CalmStage, FightStage, StagedArenaScenarioRoutine, SwarmStage, WavesStage } from "../arena-stages.js"
import { drone, DroneAimRoutine } from "../hostiles/drones.js"
import { bossDrone } from "../hostiles/turret-boss.js"
import { TurretPlayerWeaponRoutine } from "../player-weapons/turret-boss.js"
import { turretPlayer } from "../player.js"
import { Floor2 } from "./floor-2.js"

export class Floor2Arena5 extends Floor2 {
	registerPlayerMovement() {
		this.universe.register(new PlayerAimRoutine(this.userInput, this.game, this.universe))
	}

	registerPlayerWeapon() {
		this.universe.register(new TurretPlayerWeaponRoutine(this.userInput, this.game, this.universe))
	}

	addPlayer() {
		this.universe.add(turretPlayer(
			new Transform(0.5 * this.universe.width, 0.8 * this.universe.height)
		))
	}

	registerHostiles() {
		this.universe.register(new DroneAimRoutine(this.universe))
		this.universe.register(new AutoWeaponModuleRoutine(this.universe))
		this.universe.register(new AutoFieldModuleRoutine(this.universe))
	}

	registerScenario() {
		this.universe.register(new StagedArenaScenarioRoutine(this.universe, [
			new SwarmStage(() => [
				drone(new Transform(0.5 * this.universe.width, 0.05 * this.universe.height, Random.between(-1, +1) * Math.PI / 8 + Math.PI / 2))
			]),
			new FightStage(),

			new CalmStage(2),
			new SwarmStage(() => [
				drone(new Transform(0.5 * this.universe.width, 0.05 * this.universe.height, Random.between(-1, +1) * Math.PI / 8 + Math.PI / 2))
			]),
			new FightStage(),

			new CalmStage(2),
			new WavesStage(0.3, 5, () => [
				drone(new Transform(Random.between(0.2, 0.8) * this.universe.width, 0.05 * this.universe.height, Random.between(-1, +1) * Math.PI / 8 + Math.PI / 2))
			]),
			new FightStage(),

			new CalmStage(2),
			new WavesStage(0.3, 2, () => [
				bossDrone(new Transform(0.95 * this.universe.width, 0.05 * this.universe.height, 0.785 * Math.PI))
			]),
			new FightStage(),

			new CalmStage(2),
			new WavesStage(0.3, 2, () => [
				bossDrone(new Transform(0.05 * this.universe.width, 0.05 * this.universe.height, 0.215 * Math.PI))
			]),
			new FightStage(),

			new CalmStage(2),
			new WavesStage(0.3, 5, () => [
				drone(new Transform(Random.between(0.2, 0.8) * this.universe.width, 0.05 * this.universe.height, Random.between(-1, +1) * Math.PI / 8 + Math.PI / 2))
			]),
			new FightStage(),

			new CalmStage(2),
			new WavesStage(0.3, 4, () => [
				bossDrone(new Transform(0.95 * this.universe.width, 0.95 * this.universe.height, -0.717 * Math.PI))
			]),
			new FightStage(),

			new CalmStage(2),
			new WavesStage(0.3, 5, () => [
				bossDrone(new Transform(Random.between(0.2, 0.8) * this.universe.width, 0.05 * this.universe.height, Random.between(-1, +1) * Math.PI / 8 + Math.PI / 2))
			]),
			new FightStage(),

			new CalmStage(2),
			new WavesStage(0.3, 8, () => [
				bossDrone(new Transform(0.5 * this.universe.width, 0.95 * this.universe.height, -0.215 * Math.PI))
			]),
			new FightStage()
		], this.onVictory, this.onDefeat))
	}
}
