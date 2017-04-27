/**
 * get all the matches of the given string against the regex
 */
export function getAllMatches(regex, string) {
  let match, result = []
  while((match = regex.exec(string))) {
    result.push(match)
  }
  return result
}

export function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function escapeSource(string) {
  return escapeRegExp(string).replace(/\/+/g, '/+')
}
