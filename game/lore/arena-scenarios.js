import { Universe } from "../core/engine.js"
import { StagedArenaScenarioRoutine, SwarmStage, FightStage, WavesStage, CalmStage } from "./arena-stages.js"
import { Random } from "../math/random.js"
import { Crasher } from "./hostiles/crashers.js"
import { Motion } from "../physic/motion.js"
import { Transform } from "../math/transform.js"

const every = 1
const second = 1
const seconds = 1
const max = 1
const times = 1

function madSaw(x) {
	const c = new Crasher(new Transform(x, 0))
	const v = c.get(Motion)[0].velocity

	v.x = 0
	v.y = 150

	return c
}

/** @type {( (universe: Universe, onVictory: () => void, onDefeat: () => void) => import("../core/engine").Routine )[]} */
export const ArenaScenarios = [
	(universe, onVictory, onDefeat) => new StagedArenaScenarioRoutine(universe, [
		new SwarmStage(() => [ madSaw(universe.width * 0.5) ]),

		new CalmStage(0.3 * seconds), new SwarmStage(() => [ madSaw(universe.width * 0.45), madSaw(universe.width * 0.55) ]),
		new CalmStage(0.3 * seconds), new SwarmStage(() => [ madSaw(universe.width * 0.40), madSaw(universe.width * 0.60) ]),
		new CalmStage(0.3 * seconds), new SwarmStage(() => [ madSaw(universe.width * 0.35), madSaw(universe.width * 0.65) ]),
		new CalmStage(0.3 * seconds), new SwarmStage(() => [ madSaw(universe.width * 0.30), madSaw(universe.width * 0.70) ]),
		new CalmStage(0.3 * seconds), new SwarmStage(() => [ madSaw(universe.width * 0.25), madSaw(universe.width * 0.75) ]),
		new CalmStage(0.3 * seconds), new SwarmStage(() => [ madSaw(universe.width * 0.20), madSaw(universe.width * 0.80) ]),
		new CalmStage(0.3 * seconds), new SwarmStage(() => [ madSaw(universe.width * 0.15), madSaw(universe.width * 0.85) ]),
		new CalmStage(0.3 * seconds), new SwarmStage(() => [ madSaw(universe.width * 0.10), madSaw(universe.width * 0.90) ]),
		new CalmStage(0.3 * seconds), new SwarmStage(() => [ madSaw(universe.width * 0.05), madSaw(universe.width * 0.95) ]),

		new FightStage()

		// And then, turrets...
	], onVictory, onDefeat),
	/*
	(universe, onVictory, onDefeat) => new StagedArenaScenarioRoutine(universe, [
		new SwarmStage(() => [
			new Hostile(universe.width * 0.3, universe.height * 0.2, Random.between(-200, 200), Random.between(-200, 200)),
			new Hostile(universe.width * 0.7, universe.height * 0.2, Random.between(-200, 200), Random.between(-200, 200))
		]),
		new FightStage()
	], onVictory, onDefeat),

	(universe, onVictory, onDefeat) => new StagedArenaScenarioRoutine(universe, [
		new WavesStage(every * 0.3 * seconds, max * 2 * times, () => [
			//new Cube(universe.width * 0.5, universe.height * 0.2)
		]),
		new FightStage(),

		new CalmStage(3),

		new WavesStage(every * 0.3 * seconds, max * 2 * times, () => [
			//new Cube(universe.width * 0.3, universe.height * 0.2),
			//new Cube(universe.width * 0.7, universe.height * 0.2)
		]),
		new FightStage()
	], onVictory, onDefeat),

	(universe, onVictory, onDefeat) => new StagedArenaScenarioRoutine(universe, [
		new WavesStage(every * 0.3 * seconds, max * 2 * times, () => [
			//new Cube(universe.width * 0.3, universe.height * 0.2),
			//new Cube(universe.width * 0.7, universe.height * 0.2)
		]),
		new FightStage(),

		new CalmStage(3),

		new WavesStage(every * 0.3 * seconds, max * 2 * times, () => [
			//new Cube(universe.width * 0.3, universe.height * 0.2),
			//new Cube(universe.width * 0.5, universe.height * 0.2),
			//new Cube(universe.width * 0.7, universe.height * 0.2)
		]),
		new FightStage()
	], onVictory, onDefeat),

	(universe, onVictory, onDefeat) => new StagedArenaScenarioRoutine(universe, [
		new WavesStage(every * 0.3 * seconds, max * 3 * times, () => [
			//new Cube(universe.width * 0.5, universe.height * 0.2)
		]),

		new CalmStage(3),

		new WavesStage(every * 2 * seconds, max * 10 * times, () => [
			//new Cube(universe.width * 0.5, universe.height * 0.2)
		]),
		new FightStage()
	], onVictory, onDefeat),

	(universe, onVictory, onDefeat) => new StagedArenaScenarioRoutine(universe, [
		new WavesStage(every * 0.3 * seconds, max * 3 * times, () => [
			//new Cube(universe.width * 0.3, universe.height * 0.2),
			//new Cube(universe.width * 0.7, universe.height * 0.2)
		]),
		new FightStage(),

		new CalmStage(3),

		new SwarmStage(() => [
			//new CubeMissile(universe.width * 0.5, universe.height * 0.2, player)
		]),
		new FightStage()
	], onVictory, onDefeat),

	(universe, onVictory, onDefeat) => new StagedArenaScenarioRoutine(universe, [
		new SwarmStage(() => [
			//new CubeMissile(universe.width * 0.5, universe.height * 0.2, player)
		]),

		new CalmStage(3),

		new WavesStage(every * 0.3 * seconds, max * 2 * times, () => [
			//new Cube(universe.width * 0.3, universe.height * 0.2),
			//new Cube(universe.width * 0.7, universe.height * 0.2),
			//new CubeMissile(universe.width * 0.5, universe.height * 0.2, player)
		]),
		new FightStage()
	], onVictory, onDefeat),

	(universe, onVictory, onDefeat) => new StagedArenaScenarioRoutine(universe, [
		new WavesStage(every * 0.3 * seconds, max * 2 * times, () => [
			//new Cube(universe.width * 0.3, universe.height * 0.2),
			//new Cube(universe.width * 0.5, universe.height * 0.2),
			//new Cube(universe.width * 0.7, universe.height * 0.2)
		]),
		new FightStage(),

		new CalmStage(3),

		new SwarmStage(() => [
			//new CubeMissile(universe.width * 0.3, universe.height * 0.2, player),
			//new CubeMissile(universe.width * 0.5, universe.height * 0.2, player),
			//new CubeMissile(universe.width * 0.7, universe.height * 0.2, player)
		]),
		new FightStage()
	], onVictory, onDefeat),

	(universe, onVictory, onDefeat) => new StagedArenaScenarioRoutine(universe, [
		new WavesStage(every * 2 * seconds, max * 3 * times, () => [
			//new Cube(universe.width * 0.3, universe.height * 0.2),
			//new Cube(universe.width * 0.7, universe.height * 0.2)
		]),
		new FightStage(),

		new CalmStage(3),

		new WavesStage(every * 2 * seconds, max * 2 * times, () => [
			//new Cube(universe.width * 0.5, universe.height * 0.2),
			//new CubeMissile(universe.width * 0.3, universe.height * 0.2, player),
			//new CubeMissile(universe.width * 0.7, universe.height * 0.2, player)
		]),
		new FightStage()
	], onVictory, onDefeat)
	*/
]
