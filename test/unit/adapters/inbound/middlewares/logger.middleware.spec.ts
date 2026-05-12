import { LoggerMiddleware } from 'src/adapters/inbound/middlewares/logger.middleware'
import { Request, Response, NextFunction } from 'express'

describe('LoggerMiddleware', () => {
  let middleware: LoggerMiddleware
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let nextFunction: NextFunction
  let finishCallback: (() => void) | undefined

  beforeEach(() => {
    middleware = new LoggerMiddleware()
    nextFunction = jest.fn()

    mockRequest = {
      ip: '127.0.0.1',
      method: 'GET',
      originalUrl: '/account',
      headers: {}
    }

    mockResponse = {
      statusCode: 200,
      on: jest.fn((event: string, cb: () => void) => {
        if (event === 'finish') {
          finishCallback = cb
        }
        return mockResponse as Response
      })
    }

    finishCallback = undefined
  })

  describe('use', () => {
    it('should call next()', () => {
      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      )

      expect(nextFunction).toHaveBeenCalledTimes(1)
    })

    it('should register a "finish" listener on the response', () => {
      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      )

      expect(mockResponse.on).toHaveBeenCalledWith(
        'finish',
        expect.any(Function)
      )
    })

    it('should log request details when the response finishes', () => {
      const logSpy = jest.spyOn((middleware as any).logger, 'log').mockImplementation()

      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      )

      // Trigger the finish event
      finishCallback!()

      expect(logSpy).toHaveBeenCalledTimes(1)
      const logArg: string = logSpy.mock.calls[0][0]
      expect(logArg).toContain('GET')
      expect(logArg).toContain('/account')
    })

    it('should not log when originalUrl is "/"', () => {
      mockRequest.originalUrl = '/'
      const logSpy = jest.spyOn((middleware as any).logger, 'log').mockImplementation()

      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      )
      finishCallback!()

      expect(logSpy).not.toHaveBeenCalled()
    })

    it('should use CF-Connecting-IP header over ip when present', () => {
      mockRequest.headers = { 'cf-connecting-ip': '1.2.3.4' }
      const logSpy = jest.spyOn((middleware as any).logger, 'log').mockImplementation()

      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      )
      finishCallback!()

      const logArg: string = logSpy.mock.calls[0][0]
      expect(logArg).toContain('1.2.3.4')
    })

    it('should include the status code in the log output', () => {
      mockResponse.statusCode = 404
      const logSpy = jest.spyOn((middleware as any).logger, 'log').mockImplementation()

      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      )
      finishCallback!()

      const logArg: string = logSpy.mock.calls[0][0]
      expect(logArg).toContain('404')
    })
  })
})
