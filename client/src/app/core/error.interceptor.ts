import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';

/** Shows API errors in a snackbar so every page gets feedback for free. */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const message =
        typeof error.error === 'string' && error.error
          ? error.error
          : error.error?.title ?? 'No se pudo completar la solicitud.';
      snackBar.open(message, 'Cerrar', { duration: 5000 });
      return throwError(() => error);
    }),
  );
};
