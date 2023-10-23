(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.DomainFilter = {}));
})(this, (function (exports) { 'use strict';

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
        constructor(partialConfig) {
            this.config = Object.assign({}, defaultConfig);
            if (partialConfig)
                this.updateConfig(partialConfig);
        }
        updateConfig(partialConfig) {
            Object.assign(this.config, partialConfig);
        }
        resetConfig() {
            this.config = Object.assign({}, defaultConfig);
        }
        is_select_tld(domain) {
            if (!this.config.extensions.length || this.config.domainHacks)
                return true;
            return (this.config.extensions.filter((ext) => domain.toLowerCase().includes(ext.value.toLowerCase())).length > 0);
        }
        is_proper_length(domain) {
            const domainLength = domain.split(".")[0].length;
            const lessThanCheck = domainLength <= this.config.domainLength[1];
            const greaterThanCheck = domainLength >= this.config.domainLength[0];
            return lessThanCheck && greaterThanCheck;
        }
        contains_hyphens(domain) {
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
        filter(domains) {
            const filteredDomains = domains
                .filter(this.is_proper_length, this)
                .filter(this.contains_hyphens, this)
                .filter(this.contains_numbers, this)
                .filter(this.is_select_tld, this)
                .filter(this.contains_keywords, this);
            return filteredDomains;
        }
    }

    exports.default = DomainFilter;
    exports.defaultConfig = defaultConfig;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
