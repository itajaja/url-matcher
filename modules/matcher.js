import { escapeSource, getAllMatches } from './regexUtils'
import { string, splat, greedySplat } from './rules'
import invariant from 'invariant'

let routeCache = {}

// only for debug purposes
export function _clearCache() {
  routeCache = {}
}

function _createRoute({ pattern, rules }) {
  const regex = /:([a-zA-Z_$][a-zA-Z0-9_$]*)|\*\*|\*|\(|\)|[^:*()]+/g
  const tokens = [], params = []
  let regexpSource = ''

  // Make leading slashes consistent between pattern and pathname.
  if (pattern.charAt(0) !== '/') {
    pattern = `/${pattern}`
  }

  const matches = getAllMatches(regex, pattern)
  for( let [ token, paramName ] of matches) {
    let rule

    if(paramName) { // it matched a 'parameter'
      rule = rules[paramName] || string()
    } else if(token == '**') {
      rule = greedySplat()
      paramName = 'splat'
    } else if(token == '*') {
      rule = splat()
      paramName = 'splat'
    } else if (token === '(') {
      regexpSource += '(?:'
    } else if (token === ')') {
      regexpSource += ')?'
    } else { // anything else
      regexpSource += escapeSource(token)
    }

    if(paramName) {
      regexpSource += rule.regex
      params.push({ paramName, rule })
    }

    tokens.push(token)
  }

  // Special-case patterns like '*' for catch-all routes.
  const captureRemaining = tokens[tokens.length - 1] !== '*'
  let ending = captureRemaining ? '' : '$'

  regexpSource = new RegExp(`^${regexpSource}/*${ending}`, 'i')

  return {
    tokens,
    regexpSource,
    params
  }
}

function _getRoute(route) {
  if(!routeCache[route.pattern]) {
    routeCache[route.pattern] = _createRoute(route)
  }
  return routeCache[route.pattern]
}

function _validateRules(paramValues, params) {
  return paramValues.every((param, i) =>
    params[i].rule.validate(param))
}

function _normalizeRoute(route) {
  // if the route is of type string, convert it to a route object
  if(typeof(route) === 'string') {
    route = {
      pattern: route,
      rules: {}
    }
  }
  invariant(route.pattern, 'you cannot use an empty route pattern')
  // default rules to empty object
  route.rules = route.rules || {}
  return route
}

/**
 * Matches a pathname with a specified pattern
 */
export function matchPattern(route, pathname) {
  if (pathname.charAt(0) !== '/') pathname = `/${pathname}`
  route = _normalizeRoute(route)

  const { regexpSource, params } = _getRoute(route)
  const match = pathname.match(regexpSource)

  if(match == null) return

  const remainingPathname = pathname.slice(match[0].length)
  if(remainingPathname[0] == '/' || match[0][match[0].length]) {
    return
  }

  let paramValues = match.slice(1)
    .map(v => v != null ? decodeURIComponent(v) : v)

  if(!_validateRules(paramValues, params)) return

  // convert the parameters
  paramValues = paramValues.map((v, i) => params[i].rule.convert(v))

  return {
    remainingPathname,
    paramValues,
    paramNames: params.map(p => p.paramName)
  }
}

/**
 * Returns a version of the given pattern with params interpolated. Throws
 * if there is a dynamic segment of the pattern for which there is no param.
 */
export function formatPattern(route, params) {
  params = params || {}
  route = _normalizeRoute(route)

  const { tokens } = _getRoute(route)
  let parenCount = 0, pathname = '', splatIndex = 0

  let token, paramName, paramValue
  for (let i = 0, len = tokens.length; i < len; ++i) {
    token = tokens[i]

    if (token === '*' || token === '**') {
      paramValue = Array.isArray(params.splat) ? params.splat[splatIndex++] : params.splat

      invariant(
        paramValue != null || parenCount > 0,
        'Missing splat #%s for path "%s"',
        splatIndex, route.pattern
      )

      if (paramValue != null)
        pathname += encodeURI(paramValue)
    } else if (token === '(') {
      parenCount += 1
    } else if (token === ')') {
      parenCount -= 1
    } else if (token.charAt(0) === ':') {
      paramName = token.substring(1)
      paramValue = params[paramName]

      invariant(
        paramValue != null || parenCount > 0,
        'Missing "%s" parameter for path "%s"',
        paramName, route.pattern
      )

      if (paramValue != null)
        pathname += encodeURIComponent(paramValue)
    } else {
      pathname += token
    }
  }

  return pathname.replace(/\/+/g, '/')
}
