const { toASCII } = require('punycode/');

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

export interface DFOptions {
	adultTerms?: string[]
}

class DomainFilter {
	config: IFilterConfig = { ...defaultConfig }
	options: DFOptions = {
		adultTerms: []
	}

	constructor(partialConfig?: Partial<IFilterConfig>, options?: Partial<DFOptions>) {
		if (partialConfig) this.updateConfig(partialConfig)
		if (options) this.options = { ...this.options, ...options }
	}

	updateConfig(partialConfig: Partial<IFilterConfig>) {
		Object.assign(this.config, partialConfig)
	}

	resetConfig() {
		Object.assign(this.config, defaultConfig)
	}

	is_select_tld(domain: string) {
		if (!this.config.extensions.length || this.config.domainHacks) return true

		const selectedTlds = this.config.extensions
			.filter(ext => ext.selected)
			.map(ext => ext.value)

		if (selectedTlds.length === 0) return true

		const domainParts = domain.split(".")

		if (domainParts.length > 2) {
			const tld = `.${domainParts[1]}.${domainParts[2]}` // matches tlds in the format .co.uk 
			return selectedTlds.includes(tld)
		} else {
			const tld = `.${domainParts[1]}`
			return selectedTlds.includes(tld)
		}
	}

	is_proper_length(domain: string) {
		const domainLength = domain.split(".")[0].length
		const lessThanCheck = domainLength <= this.config.domainLength[1]
		const greaterThanCheck = domainLength >= this.config.domainLength[0]
		return lessThanCheck && greaterThanCheck
	}

	contains_hyphens(domain: string) {
		if (domain.startsWith('xn--')) {
			// Always allow hyphens for IDN domains
			return true;
		}
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

	contains_adult_terms(domain: string) {
		if (this.config.adult) return true

		const terms = this.options.adultTerms || []

		if (!terms.length) return true

		const sld = domain.split(".")[0]
		const tld = domain
				.replace(sld, "")
				.replace(/\.+/, "")
		const pattern = new RegExp(`(${terms.join("|")})`, "gi")

		return !pattern.test(`${sld}${tld}`)
	}

	contains_idn(domain: string) {
		if (this.config.idn) return true;

		const punycodeString = toASCII(domain);
		return domain === punycodeString;
	}

	filter(domains: string[]) {
		
		return domains.filter(domain => {
			const isIDN = domain.startsWith('xn--');
			
			// If IDN is disabled and the domain is an IDN, filter it out
			if (!this.config.idn && isIDN) {
				return false;
			}

			// For IDN domains, only apply IDN-specific checks
			if (isIDN) {
				return this.is_select_tld(domain) &&
					   this.is_proper_length(domain) &&
					   this.contains_adult_terms(domain);
			}

			// For non-IDN domains, apply all checks
			return this.is_select_tld(domain) &&
				   this.is_proper_length(domain) &&
				   this.contains_hyphens(domain) &&
				   this.contains_numbers(domain) &&
				   this.contains_keywords(domain) &&
				   this.contains_adult_terms(domain);
		});
	}
}

export default DomainFilter
