import { Request, Response, NextFunction } from "express";
import { Injectable, NestMiddleware, Logger } from "@nestjs/common";
import {requestBodyLog, HttpEndpointLog} from '../config/logger'

@Injectable()
export class LoggerMiddleware implements NestMiddleware {

  use(request: Request, response: Response, next: NextFunction): void {
    const { ip, method, originalUrl, body } = request;
    const userAgent = request.get("user-agent") || "";

    requestBodyLog(body)

    response.on("finish", () => {
      const { statusCode } = response;
      const contentLength = response.get("content-length");

      HttpEndpointLog({
        method,
        originalUrl,
        statusCode,
        contentLength,
        userAgent,
        ip,
      })

    });

    next();
  }
}