import { HttpException } from '@nestjs/common';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

/**
 * Operador RxJS para las rutas del gateway que reenvían mensajes TCP.
 *
 * Los microservicios (con su `RpcAllExceptionsFilter`) emiten los errores como
 * `{ statusCode, message, error }`. Sin este re-mapeo, cualquier error de negocio
 * (403, 400, 404, 401…) llegaría al frontend como un 500 genérico. Aquí lo
 * convertimos de vuelta en una `HttpException` con el código y mensaje correctos.
 */
export function rpcCatch() {
  return catchError((err: any) => {
    const statusCode =
      typeof err?.statusCode === 'number' ? err.statusCode : 500;
    const message = err?.message ?? 'Error interno del servidor';
    return throwError(
      () =>
        new HttpException(
          { statusCode, message, error: err?.error },
          statusCode,
        ),
    );
  });
}
