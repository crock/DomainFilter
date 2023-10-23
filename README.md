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

## Node Usage

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

## Browser Usage

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dropfilter - Browser Usage Example</title>
</head>
<body>
    <div id="results"></div>

    <script src="/dist/DomainFilter.umd.js"></script>
    <script>
        const DomainFilter = window["DomainFilter"].default
        const resultsEl = document.getElementById("results");

        document.addEventListener("DOMContentLoaded", function() {
            
            const df = new DomainFilter({
                keywords: [
                    {
                        value: 'admin',
                        selected: true,
                        position: "start"
                    }
                ]
            });

            const results = df.filter([
                'admintuts.com',
                'google.com',
                'sysadmin.com'
            ])

            resultsEl.innerText = results.join("\n");
        })
    </script>
</body>
</html>
```

## Tests

A complete set of unit tests are implemented using [Jest](https://jestjs.io). 
To run the tests, simply run `npm run test` in the root directory.

## Contributing

Let me know of any issues or feature requests by opening an issue on [GitHub](https://github.com/crock/DomainFilter.git).

### Roadmap

| Completed  | Feature  |
|---|---|
| ✅  |  `IFilterConfig.domainLength` |
| ✅  |  `IFilterConfig.domainHacks` |
| ✅  | `IFilterConfig.hyphens`  |
| ✅  |  `IFilterConfig.numbers` |
| ✅  |  `IFilterConfig.keywords` |
| ✅  |  `IFilterConfig.extensions` |
| ❌  | `IFilterConfig.idn` - Allow filtering of IDN domains  |
| ❌  | `IFilterConfig.adult` - Allow filtering of adult-oriented domains  |