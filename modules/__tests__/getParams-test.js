import expect from 'expect'
import { getParams } from '../matcher'

describe('getParams', () => {
  describe('when a pattern does not have dynamic segments', () => {
    const pattern = '/a/b/c'

    describe('and the path matches', () => {
      it('returns an empty object', () => {
        expect(getParams(pattern, pattern)).toEqual({})
      })
    })

    describe('and the path does not match', () => {
      it('returns null', () => {
        expect(getParams(pattern, '/d/e/f')).toBe(null)
      })
    })
  })

  describe('when a pattern has dynamic segments', () => {
    const pattern = '/comments/:id.:ext/edit'

    describe('and the path matches', () => {
      it('returns an object with the params', () => {
        expect(getParams(pattern, '/comments/abc.js/edit')).toEqual({ id: 'abc', ext: 'js' })
      })
    })

    describe('and the pattern is optional', () => {
      const pattern = '/comments/(:id)/edit'

      describe('and the path matches with supplied param', () => {
        it('returns an object with the params', () => {
          expect(getParams(pattern, '/comments/123/edit')).toEqual({ id: '123' })
        })
      })

      describe('and the path matches without supplied param', () => {
        it('returns an object with an undefined param', () => {
          expect(getParams(pattern, '/comments//edit')).toEqual({ id: undefined })
        })
      })
    })

    describe('and the pattern and forward slash are optional', () => {
      const pattern = '/comments(/:id)/edit'

      describe('and the path matches with supplied param', () => {
        it('returns an object with the params', () => {
          expect(getParams(pattern, '/comments/123/edit')).toEqual({ id: '123' })
        })
      })

      describe('and the path matches without supplied param', () => {
        it('returns an object with an undefined param', () => {
          expect(getParams(pattern, '/comments/edit')).toEqual({ id: undefined })
        })
      })
    })

    describe('and the path does not match', () => {
      it('returns null', () => {
        expect(getParams(pattern, '/users/123')).toBe(null)
      })
    })

    describe('and the path matches with a segment containing a .', () => {
      it('returns an object with the params', () => {
        expect(getParams(pattern, '/comments/foo.bar/edit')).toEqual({ id: 'foo', ext: 'bar' })
      })
    })
  })

  describe('when a pattern has characters that have special URL encoding', () => {
    const pattern = '/one, two'

    describe('and the path matches', () => {
      it('returns an empty object', () => {
        expect(getParams(pattern, '/one, two')).toEqual({})
      })
    })

    describe('and the path does not match', () => {
      it('returns null', () => {
        expect(getParams(pattern, '/one two')).toBe(null)
      })
    })
  })

  describe('when a pattern has dynamic segments and characters that have special URL encoding', () => {
    const pattern = '/comments/:id/edit now'

    describe('and the path matches', () => {
      it('returns an object with the params', () => {
        expect(getParams(pattern, '/comments/abc/edit now')).toEqual({ id: 'abc' })
      })
    })

    describe('and the path does not match', () => {
      it('returns null', () => {
        expect(getParams(pattern, '/users/123')).toBe(null)
      })
    })

    describe('and the path contains multiple special URL encoded characters', () => {
      const pattern = '/foo/:component'

      describe('and the path matches', () => {
        it('returns the correctly decoded characters', () => {
          expect(getParams(pattern, '/foo/%7Bfoo%24bar')).toEqual({ component: '{foo$bar' })
        })
      })
    })
  })

  describe('when a pattern has a *', () => {
    describe('and the path matches', () => {
      it('returns an object with the params', () => {
        expect(getParams('/files/*', '/files/my/photo.jpg')).toEqual({ splat: 'my/photo.jpg' })
        expect(getParams('/files/*', '/files/my/photo.jpg.zip')).toEqual({ splat: 'my/photo.jpg.zip' })
        expect(getParams('/files/*.jpg', '/files/my/photo.jpg')).toEqual({ splat: 'my/photo' })
        expect(getParams('/files/*.jpg', '/files/my/new\nline.jpg')).toEqual({ splat: 'my/new\nline' })
      })
    })

    describe('and the path does not match', () => {
      it('returns null', () => {
        expect(getParams('/files/*.jpg', '/files/my/photo.png')).toBe(null)
      })
    })
  })

  describe('when a pattern has a **', () => {
    describe('and the path matches', () => {
      it('return an object with the params', () => {
        expect(getParams('/**/f', '/foo/bar/f')).toEqual({ splat: 'foo/bar' })
      })
    })

    describe('and the path does not match', () => {
      it('returns null', () => {
        expect(getParams('/**/f', '/foo/bar/')).toBe(null)
      })
    })
  })

  describe('when a pattern has an optional group', () => {
    const pattern = '/archive(/:name)'

    describe('and the path matches', () => {
      it('returns an object with the params', () => {
        expect(getParams(pattern, '/archive/foo')).toEqual({ name: 'foo' })
        expect(getParams(pattern, '/archive')).toEqual({ name: undefined })
      })
    })

    describe('and the path does not match', () => {
      it('returns null', () => {
        expect(getParams(pattern, '/archiv')).toBe(null)
      })
    })
  })

  describe('when a param has dots', () => {
    const pattern = '/:query/with/:domain'

    describe('and the path matches', () => {
      it('returns an object with the params', () => {
        expect(getParams(pattern, '/foo/with/foo.app')).toEqual({ query: 'foo', domain: 'foo.app' })
        expect(getParams(pattern, '/foo.ap/with/foo')).toEqual({ query: 'foo.ap', domain: 'foo' })
        expect(getParams(pattern, '/foo.ap/with/foo.app')).toEqual({ query: 'foo.ap', domain: 'foo.app' })
      })
    })

    describe('and the path does not match', () => {
      it('returns null', () => {
        expect(getParams(pattern, '/foo.ap')).toBe(null)
      })
    })
  })
})
