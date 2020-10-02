import { Link } from "../core/engine.js"
import { Colors } from "../graphic/assets/colors.js"
import { Sprites } from "../graphic/assets/sprites.js"
import { Render, Sprite } from "../graphic/render.js"
import { OnAddExplosion, OnRemoveExplosion } from "../graphic/vfx.js"
import { HostileShip } from "../logic/hostile.js"
import { HpGauge } from "../logic/life-and-death.js"
import { PlayerEnergy, PlayerShip, PlayerStuff } from "../logic/player.js"
import { RammingDamage } from "../logic/ramming-damage.js"
import { Transform } from "../math/transform.js"
import { Collider } from "../physic/collision.js"
import { Motion } from "../physic/motion.js"
import { PLAYER_COLLISION_DAMAGE, PLAYER_ENERGY_AUX, PLAYER_ENERGY_AUX_REGEN, PLAYER_ENERGY_WEAPON, PLAYER_ENERGY_WEAPON_REGEN, PLAYER_HP, PLAYER_TURRET_COLLISION_DAMAGE, PLAYER_TURRET_ENERGY_AUX, PLAYER_TURRET_ENERGY_AUX_REGEN, PLAYER_TURRET_ENERGY_WEAPON, PLAYER_TURRET_ENERGY_WEAPON_REGEN, PLAYER_TURRET_HP } from "./game-balance.js"

/** @param {Transform} position @param {Transform} velocity @param {Sprite} sprite */
export function player(position, velocity, sprite) {
	return new Link(
		PlayerStuff,
		PlayerShip,

		new Motion(position, velocity, 0.6),

		new Collider(28),
		new RammingDamage(PLAYER_COLLISION_DAMAGE, HostileShip, RammingDamage.bounceOnDamage),

		new HpGauge(PLAYER_HP),
		new PlayerEnergy(PLAYER_ENERGY_WEAPON, PLAYER_ENERGY_WEAPON_REGEN, PLAYER_ENERGY_AUX, PLAYER_ENERGY_AUX_REGEN),

		new Render(sprite),
		new OnAddExplosion(2, [ Colors.black, Colors.grey, Colors.orange, Colors.purple ], 300),
		new OnRemoveExplosion(1, [ Colors.light, Colors.grey, Colors.orange, Colors.purple ], 600)
	)
}

/** @param {Transform} position */
export function turretPlayer(position) {
	return new Link(
		PlayerStuff,
		PlayerShip,

		new Motion(position, undefined, Motion.ignoreEdges),

		new Collider(18),
		new RammingDamage(PLAYER_TURRET_COLLISION_DAMAGE, HostileShip, RammingDamage.bounceOtherOnDamage),

		new HpGauge(PLAYER_TURRET_HP),
		new PlayerEnergy(PLAYER_TURRET_ENERGY_WEAPON, PLAYER_TURRET_ENERGY_WEAPON_REGEN, PLAYER_TURRET_ENERGY_AUX, PLAYER_TURRET_ENERGY_AUX_REGEN),

		new Render(Sprites.turretBossBase, Sprites.turretBoss),
		new OnAddExplosion(2, [ Colors.black, Colors.grey, Colors.orange, Colors.purple ], 300),
		new OnRemoveExplosion(1, [ Colors.light, Colors.grey, Colors.orange, Colors.purple ], 600)
	)
}
