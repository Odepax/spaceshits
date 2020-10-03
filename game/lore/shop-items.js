import { GameKeeper } from "./game-keeper.js"

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
		price: 279,
		icon: "hull-booster",
		colorName: "green",

		/** @param {GameKeeper} game */
		apply(game) {
			++game.hullBoosts
		}
	},
	{
		name: "Bigger Bullets",
		description: "Increases weapon damages",
		isUnique: false,
		price: 339,
		icon: "damage-booster",
		colorName: "red",

		/** @param {GameKeeper} game */
		apply(game) {
			++game.damageBoosts
		}
	},
	{
		name: "Bullet Rain",
		description: "Increases weapon fire rate",
		isUnique: false,
		price: 666,
		icon: "fire-rate-booster",
		colorName: "red",

		/** @param {GameKeeper} game */
		apply(game) {
			++game.fireRateBoosts
		}
	},
	{
		name: "Mountains of Bullets",
		description: "Increases weapon energy capacity",
		isUnique: false,
		price: 399,
		icon: "weapon-cap-booster",
		colorName: "red",

		/** @param {GameKeeper} game */
		apply(game) {
			++game.weaponEnergyCapBoosts
		}
	},
	{
		name: "Bullet Semen",
		description: "Increases weapon energy regeneration rate",
		isUnique: false,
		price: 479,
		icon: "weapon-regen-booster",
		colorName: "red",

		/** @param {GameKeeper} game */
		apply(game) {
			++game.weaponEnergyRegenBoosts
		}
	},
	{
		name: "Unlimited Power",
		description: "Increases AUX module energy capacity",
		isUnique: false,
		price: 339,
		icon: "aux-cap-booster",
		colorName: "blue",

		/** @param {GameKeeper} game */
		apply(game) {
			++game.auxEnergyCapBoosts
		}
	},
	{
		name: "Electro-Slug",
		description: "Increases AUX module energy regeneration rate",
		isUnique: false,
		price: 449,
		icon: "aux-regen-booster",
		colorName: "blue",

		/** @param {GameKeeper} game */
		apply(game) {
			++game.auxEnergyRegenBoosts
		}
	}
]

/** @type {ShopItem[]} */
export const ShopUpgrades = {
	gatling: {
		name: "Double Gatling",
		description: "Sacrifices longevity for higher damage",
		isUnique: true,
		price: 889,
		icon: "double-gatling",
		colorName: "yellow",

		/** @param {GameKeeper} game */
		apply(game) {
			game.isWeaponUpgraded = true
		}
	},
	missile: {
		name: "Quad AGML",
		description: "Sacrifices damage for higher fire rate",
		isUnique: true,
		price: 889,
		icon: "double-missile",
		colorName: "pink",

		/** @param {GameKeeper} game */
		apply(game) {
			game.isWeaponUpgraded = true
		}
	}
}
