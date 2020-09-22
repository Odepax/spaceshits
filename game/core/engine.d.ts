export declare interface Constructor<T> {
	new(...parameters: any[]): T
}

export declare type Mark = symbol
export declare type Trait = object

export declare class Link {
	constructor(...traits: (Mark | Trait)[])

	has(...traits: (Mark | Constructor<Trait>)[]): boolean
	get<T extends (Mark | Constructor<Trait>)[]>(...traits: T): { [i in keyof T]: T[i] extends Mark ? Mark : InstanceType<T[i]> }
}

export declare interface Routine {
	onAdd(link: Link): void
	onRemove(link: Link): void
	onStep(): void
}

export declare interface Clock {
	spf: number
	time: number
	timeFactor: number
}

export declare class Universe {
	constructor(public width: number, public height: number)

	clock: Clock

	register(routine: Routine)
	add(link: Link)
	remove(link: Link)

	start()
	stop()
}
