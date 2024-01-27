import { UniqueEntityId } from './unique-entity-id'

export abstract class Entity<TProps> {
  private readonly _id: UniqueEntityId
  protected readonly _props: TProps

  get id(): UniqueEntityId {
    return this._id
  }

  constructor(props: TProps, _id?: UniqueEntityId | string) {
    this._props = props
    this._id = _id instanceof UniqueEntityId ? _id : new UniqueEntityId(_id)
  }

  equals(object: unknown): boolean {
    if (object === null || object === undefined) {
      return false
    }

    if (this === object) {
      return true
    }

    if (object instanceof Entity) {
      return this._id.equals(object.id)
    }

    return false
  }
}
