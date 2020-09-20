// TODO: refactor player (& hostile?) bullets
// TODO: refactor player (& hostile?) weapons
// TODO: refactor player modules
// TODO: refactor hostiles

// TODO: Apply damage boosters.
// TODO: Apply fire rate boosters.

// TODO: collision radii
// TODO: balance HP
// TODO: balance damage
// TODO: balance speed
// TODO: bullet & divshard spawn placement

class HostileBullet extends Link {
	/** @param {Transform} position */
	constructor(position) {
		super(
			new Motion(position, Transform.angular(position.a, 800), Motion.removeOnEdges),

			new Collider(7, Tags.hostile | Tags.bullet),
			new RammingDamage(9, Tags.player | Tags.ship, RammingDamage.removeOnDamage),

			new Render(Sprites.cubeQuadBullet),
			new OnRemoveExplosion(7 /* Collider.radius */ / 15, [ Colors.light, /*TAIL*/, /*HEAD*/ ], 7 /* Collider.radius */ * 1.5)
		)
	}
}

class Hostile extends Link {
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
			new OnAddExplosion(1, [ Colors.white, Colors.light, /*EXTRA*/, /*CORE*/ ], 50),
			new OnRemoveExplosion(0.5, [ /*CORE*/, Colors.black, Colors.grey, /*EXTRA*/ ], 100)
		)
	}
}

class Turret extends Link {
	constructor(x = 400, y = 300) {
		super(
			new Motion(new Transform(x, y), undefined, Motion.ignoreEdges),

			new Collider(21, Tags.hostile | Tags.ship),
			new RammingDamage(13, Tags.player | Tags.ship, RammingDamage.bounceOtherOnDamage),

			new HpGauge(101),

			new AutoFieldModule(turret => new ShockShield(turret.get(Motion)[0].position), 3),

			new Render(Sprites.turretBase, Sprites.smartTurret),
			new OnAddExplosion(1, [ Colors.white, Colors.light, Colors.silver, Colors.purple ], 50),
			new OnRemoveExplosion(0.5, [ Colors.purple, Colors.black, Colors.grey, Colors.blue ], 100)
		)
	}
}

class TurretShield extends Link {
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

class ShockShield extends Link {
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
