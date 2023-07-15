# DomainFilter
A fully-typed class for filtering a list of domain names in various ways

## Installation

```
npm i domainfilter
```

or 

```
yarn add domainfilter
```

## Documentation

I've automatically generated basic documentation using [TypeDoc](https://typedoc.org). Some basic usage examples are below.

https://crock.github.io/DomainFilter/

## Usage

```typescript
import DomainFilter, { KeywordPosition } from 'domainfilter';

const df = new DomainFilter({
    keywords: [
        { value: "example", selected: true, position: KeywordPosition.anywhere },
        { value: "admin", selected: true, position: KeywordPosition.end },
        { value: "foobar", selected: false, position: KeywordPosition.anywhere },
    ]
});

const results = df.filter([
    "admintuts.com", 
    "example.com", 
    "sysadmin.com", 
    "foobar.org"
]);

print(results); // Logs ["sysadmin.com", "example.com"]
```

## Tests

A complete set of unit tests are implemented using [Jest](https://jestjs.io). 
To run the tests, simply run `npm run test` in the root directory.

## Contributing

Let me know of any issues or feature requests by opening an issue on GitHub.