import { Link, Routine } from "./engine"

const link = Link.new()

class A { }
class B { }
const C = Symbol()
const get = link.get(A)
const getall = link.getAll(A, B, C)
const x = {} as { a: A, b: B, c: typeof C }
const pik = link.pick({ a: A, b: B, c: C }, x)

class R extends Routine {
	private a: A
	private b: B
	private c: typeof C

	onAdd(link: Link) {
		if (link.hasAll(A, B, C)) {
			link.pick({ a: A, b: B, c: C }, this as any) // as any necessary for private members
			this.onAdd = () => {} // Migh be good to have a global no-op constant
		}
	}
}

class Vector {
	x: number
	y: number
}

class Position extends Vector {
	a: number
}

const Player = Symbol()

link.add(new Vector())
link.add(new Position())

link.set(Vector, new Vector())
link.set(Position, new Vector()) // Should error.
link.set(Vector, new Position())
