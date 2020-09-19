import { ArenaScenario } from "./arena-scenarios/arena-scenario.js"
import { Floor0Arena0 } from "./arena-scenarios/floor-0-arena-0.js"

/** @type {ArenaScenario[]} */
export const ArenaScenarios = [
	Floor0Arena0,
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
