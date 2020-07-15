import { Sprite } from "../render.js"

export const Sprites = {
	import() {
		const image = new Image()

		image.src = new URL("./sprites.svg", import.meta.url).href

		return image
			.decode()
			.then(() => createImageBitmap(image, {
				resizeWidth: image.width * window.devicePixelRatio,
				resizeHeight: image.height * window.devicePixelRatio
			}))
	},

	playerGatling: new Sprite(10, 10, 57, 63, 29, 32),
	playerGatlingBullet: new Sprite(10, 96, 16, 14, 8.6, 7),

	playerDoubleGatling: new Sprite(96, 10, 57, 63, 29, 32),

	playerBlaster: new Sprite(182, 10, 62, 63, 29, 32),
	playerBlasterBullet: new Sprite(182, 96, 19, 17, 11, 8.4),

	playerShockgun: new Sprite(268, 10, 55, 63, 29, 32),
	playerShockgunBullet: new Sprite(268, 96, 16, 14, 6.6, 7),

	playerMissile: new Sprite(354, 10, 56, 63, 29, 32),
	playerMissileBullet: new Sprite(354, 96, 19, 17, 8.2, 8.4),

	playerDoubleMissile: new Sprite(440, 10, 54, 63, 29, 32),
	playerDoubleMissileBullet: new Sprite(440, 96, 16, 14, 6.6, 7),

	playerCharger: new Sprite(526, 10, 60, 63, 29, 32),
	playerChargerBulletL: new Sprite(526, 96, 22, 20, 13, 10),
	playerChargerBulletS: new Sprite(568, 96, 16, 14, 8.6, 7),

	missileBoss: new Sprite(10, 138, 65, 58, 33.5, 29),
	missileBossBulletL: new Sprite(10, 216, 32, 28, 18.4, 14),
	missileBossBulletM: new Sprite(52, 216, 22, 20, 13, 10),
	missileBossBulletS: new Sprite(94, 216, 16, 14, 6.6, 7),

	crasherBoss: new Sprite(136, 138, 67, 67, 33.4, 33.4),
	crasherBossBullet: new Sprite(136, 216, 16, 14, 6.6, 7),

	chargerBoss: new Sprite(214, 138, 80, 101, 29.3, 50.5),
	chargerBossBulletX: new Sprite(214, 268, 32, 28, 18.4, 14),
	chargerBossBulletL: new Sprite(256, 268, 22, 20, 13, 10),
	chargerBossBulletM: new Sprite(298, 268, 19, 17, 11, 8.4),
	chargerBossBulletS: new Sprite(340, 268, 16, 14, 8.6, 7),
	chargerBossShard: new Sprite(344, 138, 32, 32, 16, 16),

	turretBossBase: new Sprite(394, 138, 53, 55, 24.4, 27.3, false),
	turretBoss: new Sprite(468, 138, 49, 40, 21, 20),
	turretBossBullet: new Sprite(468, 212, 19, 17, 11, 8.4),
	turretBossDrone: new Sprite(542, 138, 38, 32, 16, 16),
	turretBossDroneBullet: new Sprite(542, 188, 16, 14, 8.6, 7),

	auraShield: new Sprite(10, 258, 42, 42, 21, 21),
	auraMedic: new Sprite(84, 258, 42, 42, 21, 21),

	crasher: new Sprite(10, 332, 60, 60, 29.7, 29.7),
	smartCrasher: new Sprite(84, 332, 60, 60, 29.7, 29.7),

	cube: new Sprite(10, 406, 42, 54, 21, 27),
	cubeBullet: new Sprite(10, 480, 16, 14, 8.6, 7),
	cubeQuad: new Sprite(84, 406, 54, 54, 27, 27),
	cubeQuadBullet: new Sprite(84, 480, 16, 14, 8.6, 7),
	cubeMissile: new Sprite(158, 406, 42, 54, 21, 27),
	cubeMissileBullet: new Sprite(158, 480, 16, 14, 8.6, 7),

	drone: new Sprite(10, 522, 32, 32, 16, 16),
	combatDrone: new Sprite(84, 522, 38, 32, 16, 16),
	combatDroneBullet: new Sprite(84, 596, 16, 14, 8.6, 7),

	turretBase: new Sprite(10, 638, 53, 55, 24.4, 27.3, false),
	turret: new Sprite(84, 638, 49, 40, 21, 20),
	turretBullet: new Sprite(84, 712,  19, 17, 11, 8.4),
	smartTurret: new Sprite(158, 638, 49, 40, 21, 20),
	smartTurretBullet: new Sprite(158, 712,  19, 17, 11, 8.4),

	div: new Sprite(10, 754, 59, 51, 29.4, 25.5),
	divShard: new Sprite(84, 754, 23, 27, 7.7, 13.3)
}
