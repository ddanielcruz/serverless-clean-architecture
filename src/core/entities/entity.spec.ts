import { Entity } from './entity'
import { UniqueEntityId } from './unique-entity-id'

class EntityStub extends Entity<{ name: string }> {
  get name(): string {
    return this._props.name
  }
}

describe('Entity', () => {
  describe('constructor', () => {
    it('creates a new entity', () => {
      const entity = new EntityStub({ name: 'test' })
      expect(entity).toBeDefined()
      expect(entity.id.value).toBeTruthy()
      expect(entity.name).toBe('test')
    })

    it.each(['123', new UniqueEntityId('123')])(
      'creates a new entity with a defined id: %s',
      (id) => {
        const entity = new EntityStub({ name: 'test' }, id)
        expect(entity).toBeDefined()
        expect(entity.id.value).toBe('123')
      },
    )

    it.each([undefined, ''])(
      'creates a new entity with a value when the value is falsy: %j',
      (value) => {
        const entity = new EntityStub({ name: 'test' }, value)
        expect(entity).toBeDefined()
        expect(entity.id).toBeTruthy()
      },
    )
  })

  describe('equals', () => {
    it('returns true when compared to itself', () => {
      const entity = new EntityStub({ name: 'test' })
      expect(entity.equals(entity)).toBeTruthy()
    })

    it('returns false when entity is not an instance of Entity', () => {
      const entity = new EntityStub({ name: 'test' })
      expect(entity.equals({})).toBeFalsy()
    })

    it('returns true when the entity ids match', async () => {
      const id = '123'
      const entity1 = new EntityStub({ name: 'test' }, id)
      const entity2 = new EntityStub({ name: 'test' }, id)
      expect(entity1.equals(entity2)).toBeTruthy()
    })

    it('returns false when the entity ids do not match', async () => {
      const entity1 = new EntityStub({ name: 'test' }, '123')
      const entity2 = new EntityStub({ name: 'test' }, '1234')
      expect(entity1.equals(entity2)).toBeFalsy()
    })

    it.each([null, undefined])(
      'returns false when the entity is %s',
      (value) => {
        const entity = new EntityStub({ name: 'test' })
        expect(entity.equals(value)).toBeFalsy()
      },
    )
  })
})
