import { Particles } from "../graphic/assets/particles.js"
import { PLAYER_BERZERK_PRICE, PLAYER_BLINK_PRICE, PLAYER_BOOST_AUX_CAP_PRICE, PLAYER_BOOST_AUX_REGEN_PRICE, PLAYER_BOOST_DAMAGE_PRICE, PLAYER_BOOST_FIRE_RATE_PRICE, PLAYER_BOOST_HULL_PRICE, PLAYER_BOOST_RAMMING_DAMAGE_PRICE, PLAYER_BOOST_WEAPON_CAP_PRICE, PLAYER_BOOST_WEAPON_REGEN_PRICE, PLAYER_GATLING_DOUBLE_PRICE, PLAYER_MISSILE_DOUBLE_PRICE, PLAYER_RESTORATION_PRICE, PLAYER_SHIELD_PRICE, PLAYER_SHOCKWAVE_PRICE } from "./game-balance.js"
import { GameKeeper } from "./game-keeper.js"
import { BerzerkPlayerAuxRoutine } from "./player-modules/berzerk.js"
import { BlinkPlayerAuxRoutine } from "./player-modules/blink.js"
import { RestorationPlayerAuxRoutine } from "./player-modules/restoration.js"
import { ShieldPlayerAuxRoutine } from "./player-modules/shield.js"
import { ShockwavePlayerAuxRoutine } from "./player-modules/shockwave.js"

/**
 * @typedef ShopItem
 * @property {string} name
 * @property {string} description
 * @property {boolean} isUnique
 * @property {number} price
 * @property {string} icon
 * @property {string} colorName
 * @property {(game: GameKeeper) => void} apply
 */

/** @type {ShopItem[]} */
export const ShopBoosters = [
	{
		name: "Hull Plate",
		description: "Increases hull resilience",
		isUnique: false,
		price: PLAYER_BOOST_HULL_PRICE,
		icon: "hull-booster",
		colorName: "green",
		/** @param {GameKeeper} game */ apply(game) { ++game.hullBoosts }
	},
	{
		name: "Spiky Boi",
		description: "Increases ramming damage",
		isUnique: false,
		price: PLAYER_BOOST_RAMMING_DAMAGE_PRICE,
		icon: "ramming-damage-booster",
		colorName: "red",
		/** @param {GameKeeper} game */ apply(game) { ++game.rammingDamageBoosts }
	},
	{
		name: "Bigger Bullets",
		description: "Increases weapon damages",
		isUnique: false,
		price: PLAYER_BOOST_DAMAGE_PRICE,
		icon: "damage-booster",
		colorName: "red",
		/** @param {GameKeeper} game */ apply(game) { ++game.weaponDamageBoosts }
	},
	{
		name: "Bullet Rain",
		description: "Increases weapon fire rate",
		isUnique: false,
		price: PLAYER_BOOST_FIRE_RATE_PRICE,
		icon: "fire-rate-booster",
		colorName: "red",
		/** @param {GameKeeper} game */ apply(game) { ++game.fireRateBoosts }
	},
	{
		name: "Mountains of Bullets",
		description: "Increases weapon energy capacity",
		isUnique: false,
		price: PLAYER_BOOST_WEAPON_CAP_PRICE,
		icon: "weapon-cap-booster",
		colorName: "red",
		/** @param {GameKeeper} game */ apply(game) { ++game.weaponEnergyCapBoosts }
	},
	{
		name: "Bullet Semen",
		description: "Increases weapon energy regeneration rate",
		isUnique: false,
		price: PLAYER_BOOST_WEAPON_REGEN_PRICE,
		icon: "weapon-regen-booster",
		colorName: "red",
		/** @param {GameKeeper} game */ apply(game) { ++game.weaponEnergyRegenBoosts }
	},
	{
		name: "Unlimited Power",
		description: "Increases AUX module energy capacity",
		isUnique: false,
		price: PLAYER_BOOST_AUX_CAP_PRICE,
		icon: "aux-cap-booster",
		colorName: "blue",
		/** @param {GameKeeper} game */ apply(game) { ++game.auxEnergyCapBoosts }
	},
	{
		name: "Electro-Slug",
		description: "Increases AUX module energy regeneration rate",
		isUnique: false,
		price: PLAYER_BOOST_AUX_REGEN_PRICE,
		icon: "aux-regen-booster",
		colorName: "blue",
		/** @param {GameKeeper} game */ apply(game) { ++game.auxEnergyRegenBoosts }
	}
]

/** @type {ShopItem[]} */
export const ShopUpgrades = {
	gatling: {
		name: "Double Gatling",
		description: "Sacrifices longevity for higher damage",
		isUnique: true,
		price: PLAYER_GATLING_DOUBLE_PRICE,
		icon: "double-gatling",
		colorName: "yellow",
		/** @param {GameKeeper} game */ apply(game) { game.isWeaponUpgraded = true }
	},
	missile: {
		name: "Quad AGML",
		description: "Sacrifices damage for higher fire rate",
		isUnique: true,
		price: PLAYER_MISSILE_DOUBLE_PRICE,
		icon: "double-missile",
		colorName: "pink",
		/** @param {GameKeeper} game */ apply(game) { game.isWeaponUpgraded = true }
	}
}

/** @type {ShopItem[]} */
export const ShopModules = [
	{
		name: "Restoration",
		description: "Activate to heal over time",
		isUnique: true,
		price: PLAYER_RESTORATION_PRICE,
		icon: "restoration-module",
		colorName: "green",
		/** @param {GameKeeper} game */ apply(game) {
			game.currentModule = this
			game.moduleUpgrade = null
			game.registerModule = arena => arena.universe.register(new RestorationPlayerAuxRoutine(arena.userInput, arena.game, arena.universe, Particles.spawnHeal(arena.vfx, arena.universe)))
		}
	},
	{
		name: "Shield",
		description: "Activate to spawn a shield that absorbs bullets",
		isUnique: true,
		price: PLAYER_SHIELD_PRICE,
		icon: "shield-module",
		colorName: "green",
		/** @param {GameKeeper} game */ apply(game) {
			game.currentModule = this
			game.moduleUpgrade = null
			game.registerModule = arena => arena.universe.register(new ShieldPlayerAuxRoutine(arena.userInput, arena.game, arena.universe))
		}
	},
	{
		name: "Blink",
		description: "Activate to teleport to the aimed position",
		isUnique: true,
		price: PLAYER_BLINK_PRICE,
		icon: "blink-module",
		colorName: "blue",
		/** @param {GameKeeper} game */ apply(game) {
			game.currentModule = this
			game.moduleUpgrade = null
			game.registerModule = arena => arena.universe.register(new BlinkPlayerAuxRoutine(arena.userInput, arena.game, arena.universe, Particles.spawnBlink(arena.vfx)))
		}
	},
	{
		name: "Berzerk",
		description: "Activate to increase damage over time",
		isUnique: true,
		price: PLAYER_BERZERK_PRICE,
		icon: "berzerk-module",
		colorName: "red",
		/** @param {GameKeeper} game */ apply(game) {
			game.currentModule = this
			game.moduleUpgrade = null
			game.registerModule = arena => arena.universe.register(new BerzerkPlayerAuxRoutine(arena.userInput, arena.game, arena.universe, Particles.spawnBerzerk(arena.vfx)))
		}
	},
	{
		name: "Shockwave",
		description: "Activate to knock hostiles away",
		isUnique: true,
		price: PLAYER_SHOCKWAVE_PRICE,
		icon: "shockwave-module",
		colorName: "green",
		/** @param {GameKeeper} game */ apply(game) {
			game.currentModule = this
			game.moduleUpgrade = null
			game.registerModule = arena => arena.universe.register(new ShockwavePlayerAuxRoutine(arena.userInput, arena.collisions, arena.game, arena.universe))
		}
	// },
	// {
	// 	name: "Blastwave",
	// 	description: "Activate to knock hostiles away and inflict damage",
	// 	isUnique: true,
	// 	price: PLAYER_BLASTWAVE_PRICE,
	// 	icon: "blastwave-module",
	// 	colorName: "red",
	// 	/** @param {GameKeeper} game */ apply(game) {
	// 		game.currentModule = this
	// 		game.moduleUpgrade = null
	// 		game.registerModule = arena => arena.universe.register(new RestorationPlayerAuxRoutine(arena.userInput, arena.game, arena.universe, Particles.spawnHeal(arena.vfx, arena.universe)))
	// 	}
	}
]
