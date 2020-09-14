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

// declare interface Token<T> {}
//
//declare class Link {
//	constructor<T>(...traits: [ Token<T>, T ][])

//	mark(mark: Mark): this
//	add(trait: Trait): this
//	set<T>(token: Token<T>, trait: T): this

//	has(...traits: Token<any>[]): boolean
//	get<T extends Token<any>[]>(...traits: T): { [i in keyof T]: T[i] extends Token<infer X> ? X : any }
//}

//class A {}
//class B {}

//const At: Token<A> = Symbol()
//const Bt: Token<B> = Symbol()
//const Ct: Token<boolean> = Symbol()

//const [ a, b, c ] = (new Link()).get(At, Bt, Ct)
