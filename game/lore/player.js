import { Link } from "../core/engine.js"
import { Motion } from "../physic/motion.js"
import { Transform } from "../math/transform.js"
import { Sprites } from "../graphic/assets/sprites.js"
import { Collider } from "../physic/collision.js"
import { Tags } from "./tags.js"
import { RammingDamage } from "../logic/ramming-damage.js"
import { OnAddExplosion, OnRemoveExplosion, AuraFx } from "../graphic/vfx.js"
import { Colors } from "../graphic/assets/colors.js"
import { HpGauge } from "../logic/life-and-death.js"
import { Render } from "../graphic/render.js"
import { AutoFieldModule } from "../logic/auto-field.js"
import { AutoWeaponModule } from "../logic/auto-weapon.js"
import { MissileControl } from "../logic/missile-control.js"

export class Player extends Link {
	constructor() {
		super(
			new Motion(new Transform(700 * 0.5, 700 * 0.8), undefined, 0.6),

			new Collider(28, Tags.player | Tags.ship),
			new RammingDamage(23, Tags.hostile | Tags.ship, RammingDamage.bounceOnDamage),

			new HpGauge(101),

			new Render(Sprites.playerMissile),
			new OnAddExplosion(2, [ Colors.black, Colors.grey, Colors.orange, Colors.purple ], 300),
			new OnRemoveExplosion(1, [ Colors.light, Colors.grey, Colors.orange, Colors.purple ], 600)
		)
	}
}

// TODO: use PlayerEnergy trait
//class PlayerEnergy {
//	constructor() {
//		this.weapon = this.weaponMax = 113
//		this.weaponRegen = 23
//		this.weaponConsumption = 5

//		this.aux = this.auxMax = 113
//		this.auxRegen = 23
//		this.auxConsumption = 5
//	}
//}


class HostileBullet extends Link {
	/** @param {Transform} position */
	constructor(position) {
		// TODO: refactor hostile bullets (wait for other factors...)
		super(
			new Motion(position, Transform.angular(position.a, 800), Motion.removeOnEdges),

			new Collider(7, Tags.hostile | Tags.bullet),
			new RammingDamage(9, Tags.player | Tags.ship, RammingDamage.removeOnDamage),

			new Render(Sprites.cubeQuadBullet),
			new OnRemoveExplosion(7 /* Collider.radius */ / 15, [ Colors.light, Colors.yellow, Colors.orange ], 7 /* Collider.radius */ * 1.5)
		)
	}
}

class HostileMissile extends Link {
	/** @param {Transform} position */
	constructor(position) {
		// TODO: refactor hostile bullets (wait for other factors...)
		super(
			new Motion(position, Transform.angular(position.a, 800), Motion.removeOnEdges),
			new MissileControl(Math.PI),

			new Collider(7, Tags.hostile | Tags.bullet),
			new RammingDamage(9, Tags.player | Tags.ship, RammingDamage.removeOnDamage),

			new Render(Sprites.cubeMissileBullet),
			new OnRemoveExplosion(7 /* Collider.radius */ / 15, [ Colors.light, Colors.pink, Colors.purple ], 7 /* Collider.radius */ * 1.5)
		)
	}
}

export class Hostile extends Link {
	constructor(x = 300, y = 400, vx = 150, vy = 150) {
		super(
			new Motion(new Transform(x, y), new Transform(vx, vy, 0.2), 1),

			new Collider(21, Tags.hostile | Tags.ship),
			new RammingDamage(13, Tags.player | Tags.ship, RammingDamage.bounceOnDamage),

			new HpGauge(101),

			// new AutoFieldModule(turret => new ShockShield(turret.get(Motion)[0].position, 31), 5),
			new AutoWeaponModule(3, cube => [ 1, 3 ]
				.map(i => new HostileMissile(
					cube.get(Motion)[0]
						.position
						.copy
						.rotateBy(i * Math.PI / 2)
						.relativeOffsetBy({ x: 37, y: 0 })
				))
			),

			new Render(Sprites.cubeMissile),
			new OnAddExplosion(1, [ Colors.white, Colors.light, Colors.silver, Colors.orange ], 50),
			new OnRemoveExplosion(0.5, [ Colors.orange, Colors.black, Colors.grey, Colors.silver ], 100)
		)
	}
}

export class Turret extends Link {
	constructor(x = 400, y = 300) {
		super(
			new Motion(new Transform(x, y), undefined, Motion.ignoreEdges),

			new Collider(21, Tags.hostile | Tags.ship),
			new RammingDamage(13, Tags.player | Tags.ship, RammingDamage.bounceOtherOnDamage),

			new HpGauge(101),

			new AutoFieldModule(turret => new TurretShield(turret.get(Motion)[0].position), 3),

			new Render(Sprites.turretBase, Sprites.smartTurret),
			new OnAddExplosion(1, [ Colors.white, Colors.light, Colors.silver, Colors.purple ], 50),
			new OnRemoveExplosion(0.5, [ Colors.purple, Colors.black, Colors.grey, Colors.blue ], 100)
		)
	}
}

export class TurretShield extends Link {
	/** @param {Transform} position */
	constructor(position, radius = 101) {
		super(
			new Motion(position, undefined, Motion.ignoreEdges),

			new Collider(radius, Tags.hostile | Tags.field),
			new RammingDamage(0, Tags.player | Tags.bullet, RammingDamage.ignoreDamage),

			new HpGauge(123, 13),

			new AuraFx(radius, Colors.blue)
		)
	}
}

export class ShockShield extends Link {
	/** @param {Transform} position */
	constructor(position, radius = 101) {
		super(
			new Motion(position, undefined, Motion.ignoreEdges),

			new Collider(radius, Tags.hostile | Tags.field),
			new RammingDamage(11, Tags.player | Tags.ship/* | Tags.bullet*/, RammingDamage.bounceOtherOnDamage),

			new HpGauge(123, 13),

			new AuraFx(radius, Colors.orange)
		)
	}
}
