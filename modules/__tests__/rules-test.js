import expect from 'expect'
import { matchPattern, _clearCache } from '../matcher'
import * as rules from '../rules'

describe('custom Rules', () => {

  beforeEach(_clearCache)

  function assertMatch(route, pathname, remainingPathname, paramNames, paramValues) {
    const match = matchPattern(route, pathname)
    expect(match.remainingPathname).toEqual(remainingPathname)
    expect(match.paramNames).toEqual(paramNames)
    expect(match.paramValues).toEqual(paramValues)
  }

  function assertNotMatch(route, pathname) {
    const match = matchPattern(route, pathname)
    expect(match).toBe(undefined)
  }

  describe('when there is no param rule', () => {
    const routeDef = {
      pattern: '/users/:userId'
    }

    it('treats the parameter as string', () => {
      assertMatch(routeDef, '/users/xyz', '', [ 'userId' ], [ 'xyz' ])
    })

  })

  describe('int rule', () => {
    const routeDef = {
      pattern: '/users/:userId',
      rules: { userId: rules.int() }
    }

    it('doesn\'t validate non-integers', () => {
      assertNotMatch(routeDef, '/users/xyz')
    })

    it('converts the parameter to integer', () => {
      assertMatch(routeDef, '/users/1234', '', [ 'userId' ], [ 1234 ])
      expect(matchPattern(routeDef, '/users/1234').paramValues[0])
        .toBe(1234)
    })

    describe('when the `max` argument is set', () => {
      const routeDef = {
        pattern: '/users/:userId',
        rules: { userId: rules.int({ max: 100 }) }
      }

      it('validates only values lower than max', () => {
        assertNotMatch(routeDef, '/users/200')
        assertMatch(routeDef, '/users/88', '', [ 'userId' ], [ 88 ])
      })

    })

    describe('when the `min` argument is set', () => {
      const routeDef = {
        pattern: '/users/:userId',
        rules: { userId: rules.int({ min: 100 }) }
      }

      it('validates only values higher than max', () => {
        assertNotMatch(routeDef, '/users/88')
        assertMatch(routeDef, '/users/200', '', [ 'userId' ], [ 200 ])
      })

    })

    describe('when the `fixedLength` argument is set', () => {
      const routeDef = {
        pattern: '/users/:userId',
        rules: { userId: rules.int({ fixedLength: 4 }) }
      }

      it('validates only values with the specified length', () => {
        assertNotMatch(routeDef, '/users/883')
        assertNotMatch(routeDef, '/users/61012')
        assertMatch(routeDef, '/users/2004', '', [ 'userId' ], [ 2004 ])
      })

    })

  })

  describe('string rule', () => {

    describe('when the `maxLength` argument is set', () => {
      const routeDef = {
        pattern: 'search/:query',
        rules: { query: rules.string({ maxLength: 8 }) }
      }

      it('accepts only values shorter than `maxLength`', () => {
        assertNotMatch(routeDef, '/search/loooooong')
        assertMatch(routeDef, '/search/short', '', [ 'query' ], [ 'short' ])
      })
    })

    describe('when the `minLength` argument is set', () => {
      const routeDef = {
        pattern: 'search/:query',
        rules: { query: rules.string({ minLength: 8 }) }
      }

      it('accepts only values longer than `minLength`', () => {
        assertMatch(routeDef, '/search/loooooong', '', [ 'query' ], [ 'loooooong' ])
        assertNotMatch(routeDef, '/search/short')
      })
    })

    describe('when the `length` argument is set', () => {
      const routeDef = {
        pattern: 'search/:query',
        rules: { query: rules.string({ length: 6 }) }
      }

      it('accepts only values with the specified length', () => {
        assertMatch(routeDef, '/search/normal', '', [ 'query' ], [ 'normal' ])
        assertNotMatch(routeDef, '/search/short')
        assertNotMatch(routeDef, '/search/loooooong')
      })
    })

  })

  describe('greedySplat rule', () => {
    const routeDef = {
      pattern: '/:location/g',
      rules: { location: rules.greedySplat() }
    }

    it('behaves like "**"', () => {
      assertMatch(routeDef, '/greedy/is/good/g', '', [ 'location' ], [ 'greedy/is/good' ])
    })

  })

  describe('splat rule', () => {
    const routeDef = {
      pattern: '/:location/:file.jpg',
      rules: { location: rules.greedySplat(), file: rules.splat() }
    }

    it('behaves like "*"', () => {
      assertMatch(routeDef, '/files/path/to/file.jpg', '', [ 'location', 'file' ], [ 'files/path/to', 'file' ])
    })

  })

  describe('any rule', () => {
    const routeDef = {
      pattern: 'images/:file.:extension',
      rules: { extension: rules.any('jpg', 'png', 'gif') }
    }

    it('validates only valid options', () => {
      assertNotMatch(routeDef, 'images/foo.bar')
      assertMatch(routeDef, 'images/foo.jpg', '',[ 'file', 'extension' ], [ 'foo', 'jpg' ])
      assertMatch(routeDef, 'images/bar.png', '',[ 'file', 'extension' ], [ 'bar', 'png' ])
      assertMatch(routeDef, 'images/bar.gif', '',[ 'file', 'extension' ], [ 'bar', 'gif' ])
    })
  })

  describe('UUID rule', () => {
    const routeDef = {
      pattern: 'users/:userId',
      rules: { userId: rules.uuid() }
    }

    it('validates only valid UUIDs', () => {
      assertMatch(routeDef, 'users/a63ed95a-8061-11e5-8bcf-feff819cdc9f', '', [ 'userId' ], [ 'a63ed95a-8061-11e5-8bcf-feff819cdc9f' ])
      assertNotMatch(routeDef, 'users/a63ed95a-8061-11e5-8bcf-feff819cdc9o')
    })
  })

})
