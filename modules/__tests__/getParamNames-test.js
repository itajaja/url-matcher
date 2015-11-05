import expect from 'expect'
import { getRoute } from '../matcher'

describe('getParamNames', () => {
  describe('when a pattern contains no dynamic segments', () => {
    it('returns an empty array', () => {
      expect(getRoute('a/b/c').paramNames).toEqual([])
    })
  })

  describe('when a pattern contains :a and :b dynamic segments', () => {
    it('returns the correct names', () => {
      expect(getRoute('/comments/:a/:b/edit').paramNames).toEqual([ 'a', 'b' ])
    })
  })

  describe('when a pattern has a *', () => {
    it('uses the name "splat"', () => {
      expect(getRoute('/files/*.jpg').paramNames).toEqual([ 'splat' ])
    })
  })
})
