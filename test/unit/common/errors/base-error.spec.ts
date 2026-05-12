import { BaseError } from 'src/common/errors/base-error'

// Concrete implementation to test the abstract-like BaseError
class ConcreteError extends BaseError {
  constructor(
    message: string,
    code: string,
    parameters?: Record<string, unknown>
  ) {
    super(message, code, parameters)
  }
}

describe('BaseError', () => {
  it('should extend the built-in Error class', () => {
    const error = new ConcreteError('something went wrong', 'ERR_001')
    expect(error).toBeInstanceOf(Error)
  })

  it('should set the message property', () => {
    const error = new ConcreteError('test message', 'CODE')
    expect(error.message).toBe('test message')
  })

  it('should set the code property', () => {
    const error = new ConcreteError('msg', 'MY_CODE')
    expect(error.code).toBe('MY_CODE')
  })

  it('should set parameters when provided', () => {
    const params = { field: 'name', value: 'test' }
    const error = new ConcreteError('msg', 'CODE', params)
    expect(error.parameters).toEqual(params)
  })

  it('should leave parameters undefined when not provided', () => {
    const error = new ConcreteError('msg', 'CODE')
    expect(error.parameters).toBeUndefined()
  })

  it('should be catchable as an Error', () => {
    expect(() => {
      throw new ConcreteError('thrown', 'THROW_CODE')
    }).toThrow('thrown')
  })
})
