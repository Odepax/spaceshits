import { Universe } from "../core/engine.js"
import { StagedArenaScenarioRoutine, SwarmStage, FightStage, WavesStage, CalmStage } from "./arena-stages.js"
import { Hostile } from "./player.js"
import { Random } from "../math/random.js"

const every = 1
const second = 1
const seconds = 1
const max = 1
const times = 1

/** @type {( (universe: Universe) => import("../core/engine").Routine )[]} */
export const ArenaScenarios = [
	universe => new StagedArenaScenarioRoutine(universe, [
		new SwarmStage(() => [
			new Hostile(universe.width * 0.3, universe.height * 0.2, Random.between(-200, 200), Random.between(-200, 200)),
			new Hostile(universe.width * 0.7, universe.height * 0.2, Random.between(-200, 200), Random.between(-200, 200))
		]),
		new FightStage()
	]),

	universe => new StagedArenaScenarioRoutine(universe, [
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
	]),

	universe => new StagedArenaScenarioRoutine(universe, [
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
	]),

	universe => new StagedArenaScenarioRoutine(universe, [
		new WavesStage(every * 0.3 * seconds, max * 3 * times, () => [
			//new Cube(universe.width * 0.5, universe.height * 0.2)
		]),

		new CalmStage(3),

		new WavesStage(every * 2 * seconds, max * 10 * times, () => [
			//new Cube(universe.width * 0.5, universe.height * 0.2)
		]),
		new FightStage()
	]),

	universe => new StagedArenaScenarioRoutine(universe, [
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
	]),

	universe => new StagedArenaScenarioRoutine(universe, [
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
	]),

	universe => new StagedArenaScenarioRoutine(universe, [
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
	]),

	universe => new StagedArenaScenarioRoutine(universe, [
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
	])
]
