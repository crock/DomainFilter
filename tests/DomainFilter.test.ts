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
]

describe("Filter", () => {
	const df = new DomainFilter()

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

	})
})
