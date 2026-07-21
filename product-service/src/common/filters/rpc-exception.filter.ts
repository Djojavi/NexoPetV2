import {
  Catch,
  HttpException,
  Logger,
  RpcExceptionFilter,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';

/**
 * Filtro global del microservicio. En el transporte TCP, una HttpException lanzada
 * dentro de un handler NO conserva su código de estado: Nest la reporta como
 * "Internal server error". Este filtro la traduce a un payload serializable
 * `{ statusCode, message, error }` para que el API Gateway pueda re-mapearla al
 * código HTTP correcto (p. ej. `throw new HttpException(message, statusCode)`).
 */
@Catch()
export class RpcAllExceptionsFilter implements RpcExceptionFilter {
  private readonly logger = new Logger(RpcAllExceptionsFilter.name);

  catch(exception: unknown): Observable<never> {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      const payload =
        typeof response === 'object' && response !== null
          ? response
          : { message: response };
      return throwError(() => ({
        statusCode: exception.getStatus(),
        ...payload,
      }));
    }

    if (exception instanceof RpcException) {
      return throwError(() => exception.getError());
    }

    // Cualquier otra cosa: error inesperado -> 500 (se registra para depurar).
    this.logger.error(exception instanceof Error ? exception.stack : exception);
    return throwError(() => ({
      statusCode: 500,
      message: 'Error interno del servidor',
      error: 'InternalServerError',
    }));
  }
}
