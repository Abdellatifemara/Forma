import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, tap } from 'rxjs';

const CACHE_TTL_KEY = 'http_cache_ttl';

/**
 * Decorator to set Cache-Control max-age on a route.
 * Usage: @HttpCacheTTL(3600) // 1 hour
 */
export const HttpCacheTTL = (seconds: number) =>
  SetMetadata(CACHE_TTL_KEY, seconds);

@Injectable()
export class CacheControlInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ttl = this.reflector.get<number>(CACHE_TTL_KEY, context.getHandler());

    if (!ttl) return next.handle();

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        response.setHeader(
          'Cache-Control',
          `public, max-age=${ttl}, s-maxage=${ttl}, stale-while-revalidate=${Math.floor(ttl / 2)}`,
        );
      }),
    );
  }
}
