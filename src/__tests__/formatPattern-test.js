import expect from 'expect'
import { formatPattern } from '../matcher'

describe('formatPattern', () => {
  describe('when a pattern does not have dynamic segments', () => {
    const pattern = '/a/b/c'

    it('returns the pattern', () => {
      expect(formatPattern(pattern, {})).toEqual(pattern)
    })
  })

  describe('when a pattern has dynamic segments', () => {
    const pattern = '/comments/:id/edit'

    describe('and a param is missing', () => {
      it('throws an Error', () => {
        expect(() => {
          formatPattern(pattern, {})
        }).toThrow(Error)
      })
    })

    describe('and a param is optional', () => {
      const pattern = '/comments/(:id)/edit'

      it('returns the correct path when param is supplied', () => {
        expect(formatPattern(pattern, { id:'123' })).toEqual('/comments/123/edit')
      })

      it('returns the correct path when param is not supplied', () => {
        expect(formatPattern(pattern, {})).toEqual('/comments/edit')
      })
    })

    describe('and a param and forward slash are optional', () => {
      const pattern = '/comments(/:id)/edit'

      it('returns the correct path when param is supplied', () => {
        expect(formatPattern(pattern, { id:'123' })).toEqual('/comments/123/edit')
      })

      it('returns the correct path when param is not supplied', () => {
        expect(formatPattern(pattern, {})).toEqual('/comments/edit')
      })
    })

    describe('and all params are present', () => {
      it('returns the correct path', () => {
        expect(formatPattern(pattern, { id: 'abc' })).toEqual('/comments/abc/edit')
      })

      it('returns the correct path when the value is 0', () => {
        expect(formatPattern(pattern, { id: 0 })).toEqual('/comments/0/edit')
      })
    })

    describe('and some params have special URL encoding', () => {
      it('returns the correct path', () => {
        expect(formatPattern(pattern, { id: 'one, two' })).toEqual('/comments/one%2C%20two/edit')
      })
    })

    describe('and a param has a forward slash', () => {
      it('preserves the forward slash', () => {
        expect(formatPattern(pattern, { id: 'the/id' })).toEqual('/comments/the%2Fid/edit')
      })
    })

    describe('and some params contain dots', () => {
      it('returns the correct path', () => {
        expect(formatPattern(pattern, { id: 'alt.black.helicopter' })).toEqual('/comments/alt.black.helicopter/edit')
      })
    })

    describe('and some params contain special characters', () => {
      it('returns the correct path', () => {
        expect(formatPattern(pattern, { id: '?not=confused&with=query#string' })).toEqual('/comments/%3Fnot%3Dconfused%26with%3Dquery%23string/edit')
      })
    })
  })

  describe('when a pattern has one splat', () => {
    it('returns the correct path', () => {
      expect(formatPattern('/a/*/d', { splat: 'b/c' })).toEqual('/a/b/c/d')
    })
  })

  describe('when a pattern has multiple splats', () => {
    it('returns the correct path', () => {
      expect(formatPattern('/a/*/c/*', { splat: [ 'b', 'd' ] })).toEqual('/a/b/c/d')
    })

    it('complains if not given enough splat values', () => {
      expect(() => {
        formatPattern('/a/*/c/*', { splat: [ 'b' ] })
      }).toThrow(Error)
    })
  })

  describe('when a pattern has a greedy splat', () => {
    it('returns the correct path', () => {
      expect(formatPattern('/a/**/d', { splat: 'b/c/d' })).toEqual('/a/b/c/d/d')
      expect(formatPattern('/a/**/d/**', { splat: [ 'b/c/d', 'e' ] })).toEqual('/a/b/c/d/d/e')
    })

    it('complains if not given enough splat values', () => {
      expect(() => {
        formatPattern('/a/**/d/**', { splat: [ 'b/c/d' ] })
      }).toThrow(Error)
    })
  })

  describe('when a pattern has dots', () => {
    it('returns the correct path', () => {
      expect(formatPattern('/foo.bar.baz')).toEqual('/foo.bar.baz')
    })
  })
})
