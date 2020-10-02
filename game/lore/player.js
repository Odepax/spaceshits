import { Link } from "../core/engine.js"
import { Colors } from "../graphic/assets/colors.js"
import { Sprites } from "../graphic/assets/sprites.js"
import { Render, Sprite } from "../graphic/render.js"
import { OnAddExplosion, OnRemoveExplosion } from "../graphic/vfx.js"
import { HostileShip } from "../logic/hostile.js"
import { HpGauge } from "../logic/life-and-death.js"
import { PlayerBullet, PlayerEnergy, PlayerShip, PlayerStuff } from "../logic/player.js"
import { RammingDamage } from "../logic/ramming-damage.js"
import { Transform } from "../math/transform.js"
import { Collider } from "../physic/collision.js"
import { Motion } from "../physic/motion.js"
import { PLAYER_BOOST_AUX, PLAYER_BOOST_AUX_REGEN, PLAYER_BOOST_DAMAGE_PERCENT, PLAYER_BOOST_HP, PLAYER_BOOST_WEAPON, PLAYER_BOOST_WEAPON_REGEN, PLAYER_BOOST_WEAPON_RELOAD_PERCENT, PLAYER_COLLISION_DAMAGE, PLAYER_ENERGY_AUX, PLAYER_ENERGY_AUX_REGEN, PLAYER_ENERGY_WEAPON, PLAYER_ENERGY_WEAPON_REGEN, PLAYER_HP, PLAYER_TURRET_COLLISION_DAMAGE, PLAYER_TURRET_ENERGY_AUX, PLAYER_TURRET_ENERGY_AUX_REGEN, PLAYER_TURRET_ENERGY_WEAPON, PLAYER_TURRET_ENERGY_WEAPON_REGEN, PLAYER_TURRET_HP } from "./game-balance.js"
import { GameKeeper } from "./game-keeper.js"

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

/** @implements {import("../core/engine").Routine} */
export class PlayerBoostRoutine {
	/** @param {GameKeeper} game */
	constructor(game) {
		this.game = game
	}

	/** @param {Link} link */
	onAdd(link) {
		if (link.has(PlayerBullet))
			link.get(RammingDamage)[0].damage *= 1 + PLAYER_BOOST_DAMAGE_PERCENT * this.game.damageBoosts

		else if (link.has(PlayerShip)) {
			const [ hp, energy ] = link.get(HpGauge, PlayerEnergy)

			hp.value = hp.max += PLAYER_BOOST_HP * this.game.hullBoosts
			energy.weapon = energy.weaponMax += PLAYER_BOOST_WEAPON * this.game.weaponEnergyCapBoosts
			energy.aux = energy.auxMax += PLAYER_BOOST_AUX * this.game.auxEnergyCapBoosts

			energy.weaponRegen += PLAYER_BOOST_WEAPON_REGEN * this.game.weaponEnergyRegenBoosts
			energy.auxRegen += PLAYER_BOOST_AUX_REGEN * this.game.auxEnergyRegenBoosts

			energy.weaponReloadTime *= 1 - PLAYER_BOOST_WEAPON_RELOAD_PERCENT * this.game.fireRateBoosts
		}
	}

	// Nothing to do here...
	onRemove() {}
	onStep() {}
}
