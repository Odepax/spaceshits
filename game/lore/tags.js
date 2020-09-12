import { Flag } from "../math/flag.js"

export const Tags = {
	player:  0b01_000,
	hostile: 0b10_000,

	ship:    0b00_001,
	bullet:  0b00_010,
	field:   0b00_100,

	contains: Flag.contains, // TODO: remove those
	match: Flag.matches
}
