# url-matcher

[![NPM](https://nodei.co/npm/url-matcher.png?downloads=true)](https://nodei.co/npm/url-matcher/)

A pattern matcher library for route URLs with typed parameters.

## Usage

### Path Syntax

A route path is a string that is used to match a URL (or a portion of one). Route paths are interpreted literally, except for the following special symbols:

  - `:paramName` Matches a URL segment and captures a param. The matched segment depends on the **[parameter rule](#parameter-rules)**. If no rule is provided, it defaults to the string matcher (`[^/?#]+`). The matched string is called a **param**
  - `()` Wraps a portion of the URL that is optional
  - `*` Matches all characters (non-greedy) up to the next character in the pattern, or to the end of the URL if there is none, and creates a `splat` param
  - `**` Matches all characters (greedy) until the next `/`, `?`, or `#` and creates a `splat` param

```js
import { matchPattern } from 'url-matcher'

matchPattern('/hello/:name', '/hello/michael')          // WILL MATCH
matchPattern('/hello/:name', '/hello')                  // WILL NOT MATCH

matchPattern('/hello(/:name)', '/hello')                // WILL MATCH
matchPattern('/hello(/:name)', '/hello/ryan')           // WILL MATCH

matchPattern('/files/*.*', '/files/hello.jpg')          // WILL MATCH

matchPattern('/files/**/*.jpg', '/files/path/to/file')  // WILL MATCH
```

### Parameter Rules

If a parameter is defined in the form of `:parameterName` in the path, you might want to use specific parsing rules for it. You can achieve that by specifying parameter rules. If for example you want to match only integers for a specific parameter, you can declare your route like this:

````js
import { matchPattern } from 'url-matcher'
import { int } from 'url-matcher/rules'

var route = {
  pattern: 'users/:userId',
  rules: {
    userId: int()
  }
}

matchPattern(route, '/100') //WILL MATCH
matchPattern(route, '/abc') //WILL NOT MATCH
````

Not only the Route will match only the desired input, but the corresponding value in the `paramValues` list will be converted to an integer.

#### Existing rules

- `int({ max, min, fixedLength })`:  This rule matches non negative integers and returns the parsed string as a number. The following arguments can be specified to further refine the parameter matching:
  - `fixedLength` specifies the precise length of the argument
  - `max` specifies the minimum value assignable
  - `min` specifies the maximum value assignable
- `string({ maxLength, minLength, length })`: This rule matches any character except the forward slashes. This is the default rule when nothing else is specified. you can use the following arguments:
  - `length` specifies the precise length of the argument
  - `minLength` specifies the minimum length for the argument
  - `maxLength` specifies the maximum length for the argument
- `greedySplat()`: This rule behaves exactly like `**`. You might want to use this definition instead of `**` when you want to specify a different parameter name other than the default `splat` that is used with `**`
- `splat()` This rule behaves exactly like `*`
- `any(...values)`: This rule matches only if the parameter value is specified in the values list passed as argument
- `uuid()`: This rule matches only values that are valid UUIDs

#### Creating a custom rule

You can create your custom rules to validate parameters. Here is an example on how to do so:

````js
import { createRule } from 'url-matcher/rules'

var arrayRule = createRule({
  regex: '(\\[(?:\\w+,)*\\w*\\])',
  convert: (v) => {
    let result = []
    let matcher = /(\w+)/g
    let match
    while((match = matcher.exec(v))) result.push(match[1])
    return match
  }
})
````

The following rule will match paths that are specified as list of comma-separated values and it will return a list of values in the corresponding item of paramValues. Here is an example of how is used:

````js
import { matchPattern } from 'url-matcher'

var route = {
  pattern: 'images/:tags',
  rules: {
    'tags': arrayRule
  }  
}

matchPattern(route, '/images/[top, funny]') // WILL MATCH
// {
//  remainingPathname: '',
//  paramNames: [ 'tags' ],
//  paramValues: [ [ 'top', 'funny' ] ]
// }
````

`createRule` is a utility method that helps defining rules. if the object passed as parameter doesn't contain one of the following properties, a default will be used:

- `regex` defaults to `([^/?#]+)` (the string matcher)
- `validate` defaults to `(() => true)`
- `convert` defaults to `((val) => val)` (the identity function)

### APIs

#### `matchPattern(route, pathname)`

- `route`: The route can either be the string pattern or an object with the following types:
  - `pattern`: A string representing the [path syntax](#path-syntax) 
  - `rules`: A dictionary of [parameter rules](#parameter-rules) where the key is the parameter name and the value is the rule used
- `pathname` The string path to match against the route
- **Returns** If the pathname is matched, returns an object with the following properties, otherwise undefined:
  - `remainingPathname`: The remaining part of the path left outside of the match
  - `paramNames`: A list of parameter names in order of appearance
  - `paramValues`: A list of parameter values in order of appearance

#### `getRoute(route)`
- **Returns** an object with the following properties:
  - `tokens`: the list of tokens in which the route pattern is divided
  - `regexpSource`: the regular expression used to match the pathnames
  - `params`: a list of parameter objects containing `paramName` and `paramRule` in order of appearance.
  - `paramNames`: the list of parameter names in order of appearance

#### `formatPattern(route, params)`

- `params` a dictionary of `paramName: paramValue`
- **Returns** a version of the given pattern with params interpolated. Throws if there is a dynamic segment of the pattern for which there is no param

#### `getParams(route, pathname)`

- **Returns** a dictionary of `paramName: paramValue` if the pathname matches the route, otherwise null
