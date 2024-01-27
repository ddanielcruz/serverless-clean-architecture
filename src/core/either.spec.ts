import type { Either } from './either'
import { left, right } from './either'

function doWork(shouldSucceed: boolean): Either<'error', 'success'> {
  if (shouldSucceed) {
    return right('success')
  } else {
    return left('error')
  }
}

describe('Left', () => {
  it('returns false for isRight', () => {
    const result = doWork(false)
    expect(result.isRight()).toBe(false)
  })

  it('returns true for isLeft', () => {
    const result = doWork(false)
    expect(result.isLeft()).toBe(true)
  })

  it('returns the value', () => {
    const result = doWork(false)
    expect(result.value).toBe('error')
  })
})

describe('Right', () => {
  it('returns true for isRight', () => {
    const result = doWork(true)
    expect(result.isRight()).toBe(true)
  })

  it('returns false for isLeft', () => {
    const result = doWork(true)
    expect(result.isLeft()).toBe(false)
  })

  it('returns the value', () => {
    const result = doWork(true)
    expect(result.value).toBe('success')
  })
})
