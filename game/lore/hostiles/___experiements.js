// TODO: balance HPs, damages, and speeds
// TODO: logic to apply * boosters.

// TODO: refactor player modules => wait for more factors

// TODO: more scenarii

// TODO: collision radii
//   Remaining:
//     - crasher boss: 32
//     - crasher boss bullet: 7
//     - charger boss: 28
//     - charger boss bullet: 13, 9, 8, 7 from Lelf -> Right in sprite.svg
//     - charger boss shard: 15

// TODO: bullet spawn placement
//  Remaining:
//    - Crasher boss bullets: offset x by 39.9, rotate every PI / 4 (8)
//    - Charger boss bullets: WIP

class Floor0Arena0 extends ArenaScenario {
	registerPlayerMovement() {
		this.universe.register(new PlayerAimRoutine(this.userInput, this.game))
	}

	registerPlayerWeapon() {
		this.universe.register(new TurretPlayerWeaponRoutine(this.userInput, this.game, this.universe))
	}

	registerPlayerModule() {
		this.universe.register(new BerzerkPlayerAuxRoutine(this.userInput, this.game, this.universe, Particles.spawnBerzerk(this.vfx)))
	}

	registerHostiles() {
		this.universe.register(new DroneAimRoutine(this.universe))
		this.universe.register(new AutoWeaponModuleRoutine(this.universe))
	}

	registerScenario() {
		this.universe.register(new StagedArenaScenarioRoutine(this.universe, [
			new WavesStage(0.3, 10, () => [ bossDrone(new Transform(0.5 * this.universe.width, 0.95 * this.universe.height, -Math.PI / 4)) ]),
			new FightStage()
		], this.onVictory, this.onDefeat))
	}

	addPlayer() {
		this.universe.add(turretPlayer(
			new Transform(0.5 * this.universe.width, 0.8 * this.universe.height)
		))
	}
}

class HostileBullet extends Link {
	/** @param {Transform} position */
	constructor(position) {
		super(
			new Motion(position, Transform.angular(position.a, 800), Motion.removeOnEdges),

			new Collider(7, Tags.hostile | Tags.bullet),
			new RammingDamage(9, Tags.player | Tags.ship, RammingDamage.removeOnDamage),

			new Render(Sprites.cubeQuadBullet),
			new OnRemoveExplosion(0.5, [ Colors.light, /*TAIL*/, /*HEAD*/ ], 10)
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
