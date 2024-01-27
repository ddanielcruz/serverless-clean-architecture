import { UniqueEntityId } from './unique-entity-id'

describe('UniqueEntityId', () => {
  describe('constructor', () => {
    it('creates a new id', () => {
      const id = new UniqueEntityId()
      expect(id).toBeDefined()
      expect(id.value).toBeDefined()
    })

    it('creates a new id with a defined value', () => {
      const id = new UniqueEntityId('123')
      expect(id).toBeDefined()
      expect(id.value).toBe('123')
    })

    it.each([undefined, ''])(
      'creates a new id with a value when the value is falsy: %j',
      (value) => {
        const id = new UniqueEntityId(value)
        expect(id).toBeDefined()
        expect(id.value).toBeDefined()
      },
    )
  })

  describe('toString', () => {
    it('returns the value as string', () => {
      const id = new UniqueEntityId('123')
      expect(id.toString()).toBe('123')
    })
  })

  describe('equals', () => {
    it('returns true when the id is equal to another id', () => {
      const id = new UniqueEntityId('123')
      const id2 = new UniqueEntityId('123')
      expect(id.equals(id2)).toBeTruthy()
    })

    it('returns false when the id is not equal to another id', () => {
      const id = new UniqueEntityId('123')
      const id2 = new UniqueEntityId('1234')
      expect(id.equals(id2)).toBeFalsy()
    })

    it('returns true when the id is equal to another id as string', () => {
      const id = new UniqueEntityId('123')
      expect(id.equals('123')).toBeTruthy()
    })

    it('returns false when the id is not equal to another id as string', () => {
      const id = new UniqueEntityId('123')
      expect(id.equals('1234')).toBeFalsy()
    })

    it('returns false when compared value is not a string nor an UniqueEntityId', () => {
      const id = new UniqueEntityId('123')
      expect(id.equals({})).toBeFalsy()
    })

    it.each([null, undefined])('returns false when the id is %s', () => {
      const id = new UniqueEntityId('123')
      expect(id.equals(null)).toBeFalsy()
    })
  })
})
