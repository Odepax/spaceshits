import { Sprites } from "../../graphic/assets/sprites.js"
import { PlayerControlRoutine } from "../../logic/player-control.js"
import { Transform } from "../../math/transform.js"
import { MissilePlayerWeaponRoutine, PlayerMissileControlRoutine } from "../player-weapons/missile.js"
import { player } from "../player.js"
import { ArenaScenario } from "./arena-scenario.js"

export class Floor2 extends ArenaScenario {
	registerPlayerMovement() {
		this.universe.register(new PlayerControlRoutine(this.userInput, this.game, this.universe))
	}

	registerPlayerWeapon() {
		this.universe.register(new MissilePlayerWeaponRoutine(this.userInput, this.game, this.universe))
		this.universe.register(new PlayerMissileControlRoutine(this.userInput, this.universe))
	}

	addPlayer() {
		this.universe.add(player(
			new Transform(0.5 * this.universe.width, 0.95 * this.universe.height),
			new Transform(0, -60),
			Sprites.playerMissile
		))
	}
}
