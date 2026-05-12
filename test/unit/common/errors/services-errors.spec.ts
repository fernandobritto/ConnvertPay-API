import {
  ServiceNotFoundError,
  ServiceInvalidArgumentError,
  ServiceInvalidRequestError,
  ServiceAlreadyExistsError,
  ServiceUnImplementedError,
  ServiceUnauthorizedError,
  ServiceInternalServerError,
  ServiceTimeoutError
} from 'src/common/errors/services-errors'
import { BaseError } from 'src/common/errors/base-error'

describe('Service Errors', () => {
  // ──────────────────────────────────────────────────────────────────────────
  // ServiceNotFoundError
  // ──────────────────────────────────────────────────────────────────────────
  describe('ServiceNotFoundError', () => {
    it('should extend BaseError', () => {
      expect(new ServiceNotFoundError('msg')).toBeInstanceOf(BaseError)
    })

    it('should have code "NotFound"', () => {
      const error = new ServiceNotFoundError('Resource not found')
      expect(error.code).toBe('NotFound')
    })

    it('should store parameters when provided', () => {
      const error = new ServiceNotFoundError('not found', { id: 'uuid-123' })
      expect(error.parameters).toEqual({ id: 'uuid-123' })
    })

    it('should set the message', () => {
      const error = new ServiceNotFoundError('Resource not found')
      expect(error.message).toBe('Resource not found')
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // ServiceInvalidArgumentError
  // ──────────────────────────────────────────────────────────────────────────
  describe('ServiceInvalidArgumentError', () => {
    it('should have code "InvalidArgument"', () => {
      expect(new ServiceInvalidArgumentError('bad arg').code).toBe(
        'InvalidArgument'
      )
    })

    it('should store parameters', () => {
      const error = new ServiceInvalidArgumentError('bad', { param: 'name' })
      expect(error.parameters).toEqual({ param: 'name' })
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // ServiceInvalidRequestError
  // ──────────────────────────────────────────────────────────────────────────
  describe('ServiceInvalidRequestError', () => {
    it('should have code "InvalidRequest"', () => {
      expect(new ServiceInvalidRequestError('bad req').code).toBe('InvalidRequest')
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // ServiceAlreadyExistsError
  // ──────────────────────────────────────────────────────────────────────────
  describe('ServiceAlreadyExistsError', () => {
    it('should have code "AlreadyExists"', () => {
      expect(new ServiceAlreadyExistsError('exists').code).toBe('AlreadyExists')
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // ServiceUnImplementedError
  // ──────────────────────────────────────────────────────────────────────────
  describe('ServiceUnImplementedError', () => {
    it('should have code "UnImplemented"', () => {
      expect(new ServiceUnImplementedError('not impl').code).toBe('UnImplemented')
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // ServiceUnauthorizedError
  // ──────────────────────────────────────────────────────────────────────────
  describe('ServiceUnauthorizedError', () => {
    it('should have code "Unauthorized"', () => {
      expect(new ServiceUnauthorizedError('unauth').code).toBe('Unauthorized')
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // ServiceInternalServerError
  // ──────────────────────────────────────────────────────────────────────────
  describe('ServiceInternalServerError', () => {
    it('should have code "InternalServer"', () => {
      expect(new ServiceInternalServerError('server err').code).toBe(
        'InternalServer'
      )
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // ServiceTimeoutError
  // ──────────────────────────────────────────────────────────────────────────
  describe('ServiceTimeoutError', () => {
    it('should have code "ServiceTimeoutError"', () => {
      expect(new ServiceTimeoutError('timeout').code).toBe('ServiceTimeoutError')
    })

    it('should store the status when provided', () => {
      const error = new ServiceTimeoutError('timed out', 408)
      expect(error.status).toBe(408)
    })

    it('should have status undefined when not provided', () => {
      const error = new ServiceTimeoutError('timed out')
      expect(error.status).toBeUndefined()
    })

    it('should store parameters', () => {
      const error = new ServiceTimeoutError('timed out', 408, {
        operation: 'db-query'
      })
      expect(error.parameters).toEqual({ operation: 'db-query' })
    })

    it('should extend BaseError', () => {
      expect(new ServiceTimeoutError('msg')).toBeInstanceOf(BaseError)
    })
  })
})
