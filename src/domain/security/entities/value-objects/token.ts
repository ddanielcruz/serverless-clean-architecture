export interface TokenProps {
  value: string
  expiresAt: Date
}

export class Token {
  private readonly _value: string
  private readonly _expiresAt: Date

  get value(): string {
    return this._value
  }

  get expiresAt(): Date {
    return this._expiresAt
  }

  get isExpired(): boolean {
    return this.expiresAt.getTime() < new Date().getTime()
  }

  constructor(props: TokenProps) {
    this._value = props.value
    this._expiresAt = props.expiresAt
  }

  equals(token: unknown): boolean {
    return (
      token instanceof Token &&
      this.value === token.value &&
      this.expiresAt.getTime() === token.expiresAt.getTime()
    )
  }
}
