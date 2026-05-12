import {
  IntegrationExternalServiceError,
  IntegrationServiceUnauthorizedError,
  ProviderInternalValidationError
} from 'src/common/errors/integrations-errors'
import { BaseError } from 'src/common/errors/base-error'

describe('Integration Errors', () => {
  // ──────────────────────────────────────────────────────────────────────────
  // IntegrationExternalServiceError
  // ──────────────────────────────────────────────────────────────────────────
  describe('IntegrationExternalServiceError', () => {
    it('should extend BaseError', () => {
      expect(new IntegrationExternalServiceError('ext err')).toBeInstanceOf(
        BaseError
      )
    })

    it('should have code "IntegrationExternalService"', () => {
      const error = new IntegrationExternalServiceError('failed')
      expect(error.code).toBe('IntegrationExternalService')
    })

    it('should store the HTTP status when provided', () => {
      const error = new IntegrationExternalServiceError('gateway error', 502)
      expect(error.status).toBe(502)
    })

    it('should have status undefined when not provided', () => {
      const error = new IntegrationExternalServiceError('error')
      expect(error.status).toBeUndefined()
    })

    it('should store parameters', () => {
      const error = new IntegrationExternalServiceError('err', 503, {
        service: 'payment-gateway'
      })
      expect(error.parameters).toEqual({ service: 'payment-gateway' })
    })

    it('should set the message', () => {
      const error = new IntegrationExternalServiceError('External service failed')
      expect(error.message).toBe('External service failed')
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // IntegrationServiceUnauthorizedError
  // ──────────────────────────────────────────────────────────────────────────
  describe('IntegrationServiceUnauthorizedError', () => {
    it('should extend BaseError', () => {
      expect(
        new IntegrationServiceUnauthorizedError('unauthorized')
      ).toBeInstanceOf(BaseError)
    })

    it('should have code "IntegrationServiceUnauthorized"', () => {
      const error = new IntegrationServiceUnauthorizedError('unauthorized')
      expect(error.code).toBe('IntegrationServiceUnauthorized')
    })

    it('should set the message', () => {
      const error = new IntegrationServiceUnauthorizedError('API key invalid')
      expect(error.message).toBe('API key invalid')
    })

    it('should store parameters when provided', () => {
      const error = new IntegrationServiceUnauthorizedError('unauth', {
        reason: 'expired key'
      })
      expect(error.parameters).toEqual({ reason: 'expired key' })
    })
  })

  // ──────────────────────────────────────────────────────────────────────────
  // ProviderInternalValidationError
  // ──────────────────────────────────────────────────────────────────────────
  describe('ProviderInternalValidationError', () => {
    it('should extend BaseError', () => {
      expect(
        new ProviderInternalValidationError('validation err')
      ).toBeInstanceOf(BaseError)
    })

    it('should have code "ProviderInternalValidation"', () => {
      const error = new ProviderInternalValidationError('invalid')
      expect(error.code).toBe('ProviderInternalValidation')
    })

    it('should store the HTTP status when provided', () => {
      const error = new ProviderInternalValidationError('bad request', 400)
      expect(error.status).toBe(400)
    })

    it('should have status undefined when not provided', () => {
      const error = new ProviderInternalValidationError('error')
      expect(error.status).toBeUndefined()
    })

    it('should store parameters when provided', () => {
      const error = new ProviderInternalValidationError('err', 422, {
        field: 'email'
      })
      expect(error.parameters).toEqual({ field: 'email' })
    })
  })
})
