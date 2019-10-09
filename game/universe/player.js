import { InteractionCentral } from "../central/interaction.js"
import { Transform, Velocity, Acceleration, Friction, BounceOnEdges } from "../dynamic.js"
import { MouseAndKeyboardControl } from "../control.js"
import { TargetFacing } from "../movement.js"
import { Collision, CircleCollider } from "../collision.js"
import { Render } from "../render.js"
import { Link, Routine } from "../engine.js"
import { MatchSubRoutine } from "../routine.js"
import { ParameterCentral } from "../central/parameter.js"
import { ExplosionOnAdd, ExplosionOnRemove } from "./explosion.js"
import { black, grey, yellow, orange, purple, light } from "../../asset/style/color.js"
import { playerGatlingSprite, playerGatlingBulletSprite } from "../../asset/sprite.js"
import { Bullet, Weapon, ProjectileTarget, DamageTargetTypes, Hp, HpRenderer, WeaponEnergy, RammingImpact, RammingImpactTarget } from "./combat.js"

export class PlayerTag {}

export class GatlingPlayer extends Link {
	constructor(/** @type {number} */ x, /** @type {number} */ y, /** @type {Transform} */ mousePosition) {
		super([
			new Transform(x, y),
			new Velocity(0, -200),
			new Acceleration(),
			new Friction(),
			new BounceOnEdges(0.5),

			new MouseAndKeyboardControl(1000, 1000),
			new TargetFacing({ Transform: mousePosition }, TargetFacing.INSTANT),

			new Hp(),
			new ProjectileTarget(DamageTargetTypes.player),
			new RammingImpactTarget(DamageTargetTypes.player),
			new PlayerTag(),

			new WeaponEnergy(5),
			new Weapon(0.1, [
				{ type: GatlingBullet, x: 37, y: 0, a: 0 }
			]),
			new RammingImpact(DamageTargetTypes.hostile, 23),

			new MouseAndKeyboardWeaponControl(),

			new Collision(
				new CircleCollider(28)
			),

			new ExplosionOnAdd([ black, grey, orange, purple ], 300, 2),
			new ExplosionOnRemove([ light, grey, orange, purple ], 600, 1),
			new Render(
				new HpRenderer(playerGatlingSprite)
			)
		])
	}
}

export class GatlingBullet extends Bullet {
	constructor(/** @type {Transform} */ transform) {
		super(transform, 900, DamageTargetTypes.hostile, 9, 7, [ black, grey, yellow, orange ], playerGatlingBulletSprite)
	}
}

export class MouseAndKeyboardWeaponControl {}

export class MouseAndKeyboardWeaponControlRoutine extends MatchSubRoutine {
	constructor(/** @type {InteractionCentral} */ interactionCentral, /** @type {ParameterCentral} */ parameterCentral) {
		super([ MouseAndKeyboardWeaponControl, Weapon ])

		this.interactionCentral = interactionCentral
		this.parameterCentral = parameterCentral
	}

	/** @param {{ Weapon: Weapon }} */
	onSubStep({ Weapon }) {
		Weapon.canFire = this.interactionCentral.isPressed(this.parameterCentral.keys.shoot)
	}
}

export class PlayerGaugesRoutine extends Routine {
	constructor(
		/** @type {{ Hp: Hp, WeaponEnergy: WeaponEnergy }} */ player,
		/** @type {HTMLProgressElement} */ hpBar,
		/** @type {HTMLProgressElement} */ energyBar
	) {
		super()

		this.player = player
		this.hpBar = hpBar
		this.energyBar = energyBar
	}

	onStep() {
		this.hpBar.value = this.player.Hp.progress
		this.energyBar.value = this.player.WeaponEnergy.progress
	}
}
