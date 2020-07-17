export declare interface Constructor<T> {
	new(...parameters: any[]): T
}

export declare type Trait = object

export declare class Link {
	constructor(...traits: Trait[])

	set(trait: Trait): this
	has(...traits: Constructor<Trait>[]): boolean
	get<T extends Trait[]>(...traits: T): { [i in keyof T]: InstanceType<T[i]> }
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
