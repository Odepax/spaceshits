import { GameKeeper } from "./game-keeper.js"

/**
 * @typedef ShopItem
 * @property {string} name
 * @property {string} description
 * @property {number} price
 * @property {string} icon
 * @property {string} colorName
 * @property {(game: GameKeeper) => void} apply
 */

/** @type {ShopItem[]} */ 
export const ShopItems = [
	{
		name: "Hull Plate",
		description: "Increases hull resilience",
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
		price: 449,
		icon: "aux-regen-booster",
		colorName: "blue",

		/** @param {GameKeeper} game */
		apply(game) {
			++game.auxEnergyRegenBoosts
		}
	}
]
