/* eslint-disable @typescript-eslint/restrict-template-expressions */
import type { IncomingHttpHeaders } from 'http'

import type { NestMiddleware } from '@nestjs/common'
import { Injectable, Logger } from '@nestjs/common'
import type { NextFunction, Request, Response } from 'express'

import { friendlyHttpStatus } from './helpers'

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP')

  use(request: Request, response: Response, next: NextFunction): void {
    const startAt = process.hrtime()
    const { ip, method, originalUrl, headers } = request

    response.on('finish', () => {
      const { statusCode } = response

      const responseTime = this.getResponseTimeInSeconds(startAt)

      if (originalUrl !== '/') {
        this.logger.log(
          `${method}: ${originalUrl} [${responseTime}s] FROM ${this.getIp(
            headers,
            ip || ' - '
          )} -> ${statusCode} - ${friendlyHttpStatus[statusCode]}`
        )
      }
    })

    next()
  }

  private getIp(headers: IncomingHttpHeaders, ip: string) {
    return headers['cf-connecting-ip'] ?? ip
  }

  private getResponseTimeInSeconds(startAt: [number, number]) {
    const diff = process.hrtime(startAt)
    const responseTime = (diff[0] * 1e3 + diff[1] * 1e-6) * 1e-3

    return responseTime.toFixed(6)
  }
}
