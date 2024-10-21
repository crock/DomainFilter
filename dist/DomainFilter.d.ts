export interface IExtension {
    id?: string;
    value: string;
    selected: boolean;
}
export declare const enum KeywordPosition {
    start = "start",
    end = "end",
    anywhere = "anywhere"
}
export interface IKeyword {
    id?: string;
    value: string;
    position: KeywordPosition;
    selected: boolean;
}
export interface IFilterConfig {
    domainLength: number[];
    domainHacks: boolean;
    hyphens: boolean;
    numbers: boolean;
    extensions: IExtension[];
    keywords: IKeyword[];
    idn: boolean;
    adult: boolean;
}
export declare const defaultConfig: IFilterConfig;
export interface DFOptions {
    adultTerms?: string[];
}
declare class DomainFilter {
    config: IFilterConfig;
    options: DFOptions;
    constructor(partialConfig?: Partial<IFilterConfig>, options?: Partial<DFOptions>);
    updateConfig(partialConfig: Partial<IFilterConfig>): void;
    resetConfig(): void;
    is_select_tld(domain: string): boolean;
    is_proper_length(domain: string): boolean;
    contains_hyphens(domain: string): boolean;
    contains_numbers(domain: string): boolean;
    contains_keywords(domain: string): boolean;
    contains_adult_terms(domain: string): boolean;
    contains_idn(domain: string): boolean;
    filter(domains: string[]): string[];
}
export default DomainFilter;
//# sourceMappingURL=DomainFilter.d.ts.map