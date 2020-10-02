import { ArenaScenario } from "./arena-scenarios/arena-scenario.js"
import { Floor1Arena1 } from "./arena-scenarios/floor-1-arena-1.js"
import { Floor1Arena2 } from "./arena-scenarios/floor-1-arena-2.js"
import { Floor1Arena3 } from "./arena-scenarios/floor-1-arena-3.js"
import { Floor1Arena4 } from "./arena-scenarios/floor-1-arena-4.js"
import { Floor1Arena5 } from "./arena-scenarios/floor-1-arena-5.js"
import { Floor2Arena1 } from "./arena-scenarios/floor-2-arena-1.js"
import { Floor2Arena2 } from "./arena-scenarios/floor-2-arena-2.js"
import { Floor2Arena3 } from "./arena-scenarios/floor-2-arena-3.js"
import { Floor2Arena4 } from "./arena-scenarios/floor-2-arena-4.js"
import { Floor2Arena5 } from "./arena-scenarios/floor-2-arena-5.js"

/** @type {import("../core/engine").Constructor<ArenaScenario>[]} */
export const ArenaScenarios = [
	Floor1Arena1,
	Floor1Arena2,
	Floor1Arena3,
	Floor1Arena4,
	Floor1Arena5,

	Floor2Arena1,
	Floor2Arena2,
	Floor2Arena3,
	Floor2Arena4,
	Floor2Arena5,
]
