
export interface IExtension {
	id?: string
	value: string
	selected: boolean
}

export const enum KeywordPosition {
	start = 'start',
	end = 'end',
	anywhere = 'anywhere'
}

export interface IKeyword {
	id?: string
	value: string
	position: KeywordPosition
	selected: boolean
}

export interface IFilterConfig {
	domainLength: number[]
	domainHacks: boolean
	hyphens: boolean
	numbers: boolean
	extensions: IExtension[]
	keywords: IKeyword[]
	idn: boolean
	adult: boolean
}

export const defaultConfig: IFilterConfig = {
	domainLength: [1, 63],
	domainHacks: false,
	hyphens: false,
	numbers: false,
	extensions: [],
	keywords: [],
	idn: false,
	adult: false,
}

class DomainFilter {
	config: IFilterConfig = { ...defaultConfig }

	constructor(partialConfig?: Partial<IFilterConfig>) {
		if (partialConfig) this.updateConfig(partialConfig)
	}

	updateConfig(partialConfig: Partial<IFilterConfig>) {
		Object.assign(this.config, partialConfig)
	}

	resetConfig() {
		this.config = { ...defaultConfig }
	}

	is_select_tld(domain: string) {
		if (!this.config.extensions.length || this.config.domainHacks)
			return true
		return (
			this.config.extensions.filter((ext) =>
				domain.toLowerCase().includes(ext.value.toLowerCase())
			).length > 0
		)
	}

	is_proper_length(domain: string) {
		const domainLength = domain.split(".")[0].length
		const lessThanCheck = domainLength <= this.config.domainLength[1]
		const greaterThanCheck = domainLength >= this.config.domainLength[0]
		return lessThanCheck && greaterThanCheck
	}

	contains_hyphens(domain: string) {
		const hasHyphen = domain.includes("-");
		return this.config.hyphens ? true : !hasHyphen;
	}
	
	contains_numbers(domain: string) {
		const hasNumber = /[0-9]+/.test(domain);
		return this.config.numbers ? true : !hasNumber;
	}

	contains_keywords(domain: string) {
		if (!this.config.keywords.length) return true

		const results = this.config.keywords
			.filter((keyword) => keyword.selected)
			.map((keyword) => {
				const sld = domain.split(".")[0]
				let pattern: RegExp =  new RegExp(`${keyword.value}`, "gi")

				if (keyword.position === KeywordPosition.start)
					pattern = new RegExp(`^${keyword.value}`, "gi")
				if (keyword.position === KeywordPosition.end)
					pattern = new RegExp(`${keyword.value}$`, "gi")
				if (keyword.position === KeywordPosition.anywhere)
					pattern = new RegExp(`${keyword.value}`, "gi")


				if (this.config.domainHacks) {
					const tld = domain
						.replace(sld, "")
						.replace(/\.+/, "")
					pattern = new RegExp(`${keyword.value}`, "gi")
					
					return pattern.test(`${sld}${tld}`)
				}

				return pattern.test(sld)
			}).filter(Boolean)

		return results.length > 0
	}

	filter(domains: string[]) {
		const filteredDomains = domains
			.filter(this.is_proper_length, this)
			.filter(this.contains_hyphens, this)
			.filter(this.contains_numbers, this)
			.filter(this.is_select_tld, this)
			.filter(this.contains_keywords, this)

		return filteredDomains
	}
}

export default DomainFilter
