import { oneOf } from "../game/math/random.js"
import { NavigationCentral, SpaceshitsPage } from "../game/central/navigation.js"
import { MainPage } from "./main.js"

const quotations = [
	"There exists one god that is everywhere and part of all: the universe; the universe won't come, nor stand to save anyone.",
	"The circumstances of their death will influence the value of their life.",
	"One cannot possibly enjoy anything they don't have full knowledge of.",
	"Three. Three? Weren't there four of them?",
	"Paradize and hell are not places they go, but space to fill in the memories of those who will outlive them.",
	"A suicide a day keeps the pressure away!",
	"Alone in the darkness, it shines...",
	"Snakes appear strait under a bent ruler...",
	"When the conquerors come in, the mountain perspires by the tiger's ass, and the dragon fucks the weasel.",
	"The fact we have the luxury to to complain about inanities is an indicator that we feel safe enough otherwise to do so.",
	"Could they have alleviated the part of the report about undergone physical sufferings?",
	"It likes to see their hope vanish...",
	"Life is not beautiful by nature, it becomes what they make of it.",
	"Life doesn't diverge from the existence of death, but rather death arises from the concept of life.",
	"Those who try to mine gold out of it, they shall receive nothing but dirt.",
	"It was ridiculous, it seems dangerous, it might become obvious...",
	"By the time of their disgrace, it shall awake...",
	"In its long agony, its knowledge is lost.",
	"It bites those who try to break its chains.",
	"They will be gnawed by what they demanded; they shall simply receive what they earned.",
	"When asked what it wanted to do once grown up, it answered that it wanted to do...",
	"They deplorably still can't accept the idea of infinity, clinging to the idea that all thing begins and ends...",
	"Yet being finite, they claim to be a fragment of its infinity; their logic is erroneous.",
	"To launch the program, launch the program by following the prefered program launching method of the platform.",
	"What they take for granted had once to be invented..."
]

function quotationDisplayDuration(/** @type {string} */ quotation) {
	return quotation.length * 80 // ms
}

export class QuotationPage extends SpaceshitsPage {
	constructor(/** @type {NavigationCentral} */ navigation) {
		super()

		this.navigation = navigation
		this.randomQuote = oneOf(quotations)
	}

	onInstall() {
		this.$.quote.textContent = this.randomQuote
	}

	onEnter() {
		setTimeout(() => this.navigation.enter(MainPage), quotationDisplayDuration(this.randomQuote))
	}
}
