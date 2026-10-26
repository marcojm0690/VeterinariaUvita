
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 409) {
        const message =
          typeof error.error === 'string' && error.error
            ? error.error
            : error.error?.title ?? 'No se pudo completar la solicitud.';

        snackBar.open(message, 'Cerrar', { duration: 5000 });
      }

      return throwError(() => error);
    }),
  );
};
