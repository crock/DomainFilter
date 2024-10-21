(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.DomainFilter = {}));
})(this, (function (exports) { 'use strict';

    const { toASCII } = require('punycode/');
    const defaultConfig = {
        domainLength: [1, 63],
        domainHacks: false,
        hyphens: false,
        numbers: false,
        extensions: [],
        keywords: [],
        idn: false,
        adult: false,
    };
    class DomainFilter {
        constructor(partialConfig, options) {
            this.config = Object.assign({}, defaultConfig);
            this.options = {
                adultTerms: []
            };
            if (partialConfig)
                this.updateConfig(partialConfig);
            if (options)
                this.options = Object.assign(Object.assign({}, this.options), options);
        }
        updateConfig(partialConfig) {
            Object.assign(this.config, partialConfig);
        }
        resetConfig() {
            Object.assign(this.config, defaultConfig);
        }
        is_select_tld(domain) {
            if (!this.config.extensions.length || this.config.domainHacks)
                return true;
            const selectedTlds = this.config.extensions
                .filter(ext => ext.selected)
                .map(ext => ext.value);
            if (selectedTlds.length === 0)
                return true;
            const domainParts = domain.split(".");
            if (domainParts.length > 2) {
                const tld = `.${domainParts[1]}.${domainParts[2]}`; // matches tlds in the format .co.uk 
                return selectedTlds.includes(tld);
            }
            else {
                const tld = `.${domainParts[1]}`;
                return selectedTlds.includes(tld);
            }
        }
        is_proper_length(domain) {
            const domainLength = domain.split(".")[0].length;
            const lessThanCheck = domainLength <= this.config.domainLength[1];
            const greaterThanCheck = domainLength >= this.config.domainLength[0];
            return lessThanCheck && greaterThanCheck;
        }
        contains_hyphens(domain) {
            if (domain.startsWith('xn--')) {
                // Always allow hyphens for IDN domains
                return true;
            }
            const hasHyphen = domain.includes("-");
            return this.config.hyphens ? true : !hasHyphen;
        }
        contains_numbers(domain) {
            const hasNumber = /[0-9]+/.test(domain);
            return this.config.numbers ? true : !hasNumber;
        }
        contains_keywords(domain) {
            if (!this.config.keywords.length)
                return true;
            const results = this.config.keywords
                .filter((keyword) => keyword.selected)
                .map((keyword) => {
                const sld = domain.split(".")[0];
                let pattern = new RegExp(`${keyword.value}`, "gi");
                if (keyword.position === "start" /* KeywordPosition.start */)
                    pattern = new RegExp(`^${keyword.value}`, "gi");
                if (keyword.position === "end" /* KeywordPosition.end */)
                    pattern = new RegExp(`${keyword.value}$`, "gi");
                if (keyword.position === "anywhere" /* KeywordPosition.anywhere */)
                    pattern = new RegExp(`${keyword.value}`, "gi");
                if (this.config.domainHacks) {
                    const tld = domain
                        .replace(sld, "")
                        .replace(/\.+/, "");
                    pattern = new RegExp(`${keyword.value}`, "gi");
                    return pattern.test(`${sld}${tld}`);
                }
                return pattern.test(sld);
            }).filter(Boolean);
            return results.length > 0;
        }
        contains_adult_terms(domain) {
            if (this.config.adult)
                return true;
            const terms = this.options.adultTerms || [];
            if (!terms.length)
                return true;
            const sld = domain.split(".")[0];
            const tld = domain
                .replace(sld, "")
                .replace(/\.+/, "");
            const pattern = new RegExp(`(${terms.join("|")})`, "gi");
            return !pattern.test(`${sld}${tld}`);
        }
        contains_idn(domain) {
            if (this.config.idn)
                return true;
            const punycodeString = toASCII(domain);
            return domain === punycodeString;
        }
        filter(domains) {
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

    exports.default = DomainFilter;
    exports.defaultConfig = defaultConfig;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=DomainFilter.umd.js.map
