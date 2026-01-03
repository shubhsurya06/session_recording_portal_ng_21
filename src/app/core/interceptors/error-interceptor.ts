import { HttpInterceptorFn } from '@angular/common/http';
import { catchError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error) => {

      const { message, status } = error;
      console.error('we got error:', error.status, req);

      switch (status) {
        case 400:
          console.error(`Error status code is ${status} and its a ${message}`);
          break;
        case 500:
          console.error(`Error status code is ${status} and its a ${message}`);
          break;
        case 401:
          console.error(`Error status code is ${status} and its a ${message}`);
          break;
        case 404:
          console.error(`Error status code is ${status} and its a ${message}`);
          break;
        case 409:
          console.error(`Error status code is ${status} and its a ${message}`);
          break;
        default:
          console.error(`Some different error we got here, with message ${message}`)
          break;
      }

      throw error;
    })
  )
};
