import { randomUUID } from 'node:crypto'

export class UniqueEntityId {
  private readonly _value: string

  get value(): string {
    return this._value
  }

  constructor(value?: string) {
    this._value = value?.trim() || randomUUID()
  }

  public toString(): string {
    return this.value
  }

  public equals(id: unknown): boolean {
    if (id === null || id === undefined) {
      return false
    }

    if (id instanceof UniqueEntityId) {
      return id.value === this.value
    }

    if (typeof id === 'string') {
      return id === this.value
    }

    return false
  }
}
