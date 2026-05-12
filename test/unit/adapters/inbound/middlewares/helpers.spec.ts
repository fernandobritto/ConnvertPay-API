import { friendlyHttpStatus } from 'src/adapters/inbound/middlewares/helpers'

describe('friendlyHttpStatus', () => {
  it('should map 200 to "OK"', () => {
    expect(friendlyHttpStatus[200]).toBe('OK')
  })

  it('should map 201 to "Created"', () => {
    expect(friendlyHttpStatus[201]).toBe('Created')
  })

  it('should map 204 to "No Content"', () => {
    expect(friendlyHttpStatus[204]).toBe('No Content')
  })

  it('should map 400 to "Bad Request"', () => {
    expect(friendlyHttpStatus[400]).toBe('Bad Request')
  })

  it('should map 401 to "Unauthorized"', () => {
    expect(friendlyHttpStatus[401]).toBe('Unauthorized')
  })

  it('should map 403 to "Forbidden"', () => {
    expect(friendlyHttpStatus[403]).toBe('Forbidden')
  })

  it('should map 404 to "Not Found"', () => {
    expect(friendlyHttpStatus[404]).toBe('Not Found')
  })

  it('should map 409 to "Conflict"', () => {
    expect(friendlyHttpStatus[409]).toBe('Conflict')
  })

  it('should map 500 to "Internal Server Error"', () => {
    expect(friendlyHttpStatus[500]).toBe('Internal Server Error')
  })

  it('should map 501 to "Not Implemented"', () => {
    expect(friendlyHttpStatus[501]).toBe('Not Implemented')
  })

  it('should map 503 to "Service Unavailable"', () => {
    expect(friendlyHttpStatus[503]).toBe('Service Unavailable')
  })

  it('should map 429 to "Too Many Requests"', () => {
    expect(friendlyHttpStatus[429]).toBe('Too Many Requests')
  })

  it('should map 418 to "I\'m a teapot"', () => {
    expect(friendlyHttpStatus[418]).toBe("I'm a teapot")
  })
})
