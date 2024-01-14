import DomainFilter, { KeywordPosition, defaultConfig } from "../src/DomainFilter"

const testDomains = [
	"123.xyz",
	"2f6l6-6h.dev",
	"404.page",
	"abc.xyz",
	"adm.in",
	"admintuts.com",
	"affinitytuts.com",
	"copy.sh",
	"example.org",
	"fibrescopetele.com",
	"geekburst.com",
	"icup.com",
	"iloveba.sh",
	"porcupine.app",
	"porcupines.app",
	"pot.sh",
	"sn.app",
	"system.tuts",
	"systemadminjobs.com",
	"tutsplus.com",
	"wallflower.net",
	"x-clip.com",
	"cumdump.com",
	"bitch.com",
	"bit.ch",
	"molasses.com",
	"ass420.com",
	"UKTea.co.uk"
]

describe("Filter", () => {
	const df = new DomainFilter({}, {
		adultTerms: require("../data/adult_terms.json")
	})

	beforeEach(() => {
		df.resetConfig()
	})

	describe("when a modified config is passed to the constructor", () => {
		it("has the correct config after instantiation", () => {
			const userConfig = { hyphens: true }
			df.updateConfig(userConfig)
			expect(df.config).toEqual(Object.assign(defaultConfig, userConfig))
		})
	})

	describe(".filter", () => {
		describe("with second-level domain extensions included in config", () => {
			it("it returns domains with second-level extensions", () => {
				df.updateConfig({ adult: true, extensions: [
					{ value: ".co.uk", selected: true }
				] })
				
				const results = df.filter(testDomains)

				expect(results.length).toEqual(1)
				expect(results).toContain("UKTea.co.uk")
			})
		})

		describe("with min and max length set", () => {
			it("excludes domains with length outside the selected range", () => {
				df.updateConfig({ domainLength: [7, 15] })
				const results = df.filter(testDomains)
				const lengths = results.map(
					(domain) => domain.split(".")[0].length
				)
				const max = lengths.reduce(
					(length, max) => Math.max(length, max),
					1
				)
				const min = lengths.reduce(
					(length, min) => Math.min(length, min),
					63
				)
				expect(max).toBeLessThanOrEqual(15)
				expect(min).toBeGreaterThanOrEqual(7)
			})
		})

		describe("with domain hacks enabled", () => {
			it("includes the tld when matching keywords", () => {
				df.updateConfig({
					domainHacks: true,
					keywords: [
						{
							value: "bash",
							selected: true,
							position: KeywordPosition.end
						},
						{
							value: "telecom",
							selected: true,
							position: KeywordPosition.end
						}
					],
				})
				const results = df.filter(testDomains)
				expect(results).toContain("iloveba.sh")
				expect(results).toContain("fibrescopetele.com")
			})
		})

		describe("with hyphens not excluded", () => {
			it("should include domains with hyphens in the result", () => {
				df.updateConfig({ hyphens: true })

				expect(df.filter(testDomains)).toContain("x-clip.com")
			})
		})

		describe("with numbers not excluded", () => {
			it("should include domains with numbers in the result", () => {
				df.updateConfig({ numbers: true })

				expect(df.filter(testDomains)).toContain("404.page")
			})
		})

		describe("with some extensions selected", () => {
			it("should only include domains with those extensions in the result", () => {
				df.updateConfig({ extensions: [
					{
						value: ".com",
						selected: true,
					},
					{
						value: ".net",
						selected: true,
					}
				] })

				const result = df.filter(testDomains)

				expect(result).toContain("geekburst.com")
				expect(result).toContain("wallflower.net")
				expect(result).not.toContain("porcupine.app")
				expect(result).not.toContain("example.org")
			})
		})

		describe("with some keywords specified", () => {
			describe("with hacks disabled", () => {
				it("should only return domains with the keywords in the name", () => {
					df.updateConfig({ domainHacks: false, keywords: [
						{
							value: "ts",
							selected: true,
							position: KeywordPosition.anywhere
						}
					] })
					const results = df.filter(testDomains)

					expect(results).toContain("admintuts.com")
					expect(results).not.toContain("pot.sh")
				})

			})

			describe("with hacks enabled", () => {
				it("should return domains with the keywords in the whole domain including the extension", () => {
					df.updateConfig({
						adult: true,
						domainHacks: true,
						keywords: [
							{
								value: "ts",
								selected: true,
								position: KeywordPosition.anywhere
							},
							{
								value: "telecom",
								selected: false,
								position: KeywordPosition.anywhere
							}
						],
						extensions: [
							{
								value: ".com",
								selected: true,
							},
							{
								value: ".sh",
								selected: true,
							}
						]
					})
					const results = df.filter(testDomains)

					expect(results).toContain("admintuts.com")
					expect(results).toContain("pot.sh")
					expect(results).not.toContain("fibrescopetele.com")
				})
			})
		})

		describe("with adult filter enabled", () => {
			describe("with hacks disabled", () => {
				it("should include domains with adult terms", () => {
					df.updateConfig({ domainHacks: false, adult: true, keywords: [
						{
							value: "bit",
							selected: true,
							position: KeywordPosition.anywhere,
						},
						{
							value: "cum",
							selected: true,
							position: KeywordPosition.anywhere,
						}
					] })
					const results = df.filter(testDomains)
					
					expect(results).toContain("bitch.com")
					expect(results).toContain("cumdump.com")
					expect(results).toContain("bit.ch")
				})
			})

			describe("with hacks enabled", () => {
				it("should include domains with adult terms", () => {
					df.updateConfig({ domainHacks: true, adult: true, keywords: [
						{
							value: "bit",
							selected: true,
							position: KeywordPosition.anywhere,
						},
						{
							value: "cum",
							selected: true,
							position: KeywordPosition.anywhere,
						}
					] })
					const results = df.filter(testDomains)
					
					expect(results).toContain("bitch.com")
					expect(results).toContain("cumdump.com")
					expect(results).toContain("bit.ch")
				})
			})
		})

		describe("with adult filter disabled", () => {
			describe("with hacks disabled", () => {
				it("should exclude domains with adult terms", () => {
					df.updateConfig({ domainHacks: false, adult: false, keywords: [
						{
							value: "bit",
							selected: true,
							position: KeywordPosition.anywhere,
						},
						{
							value: "cum",
							selected: true,
							position: KeywordPosition.anywhere,
						}
					] })
					const results = df.filter(testDomains)

					expect(results).not.toContain("bit.ch")
					expect(results).not.toContain("cumdump.com")
					expect(results).not.toContain("bitch.com")
				})
			})

			describe("with hacks enabled", () => {
				it("should exclude domains with adult terms", () => {
					df.updateConfig({ domainHacks: false, adult: false, keywords: [
						{
							value: "bit",
							selected: true,
							position: KeywordPosition.anywhere,
						},
						{
							value: "cum",
							selected: true,
							position: KeywordPosition.anywhere,
						}
					] })
					const results = df.filter(testDomains)

					expect(results).not.toContain("bit.ch")
					expect(results).not.toContain("cumdump.com")
					expect(results).not.toContain("bitch.com")
				})
			})
		})

	})
})
