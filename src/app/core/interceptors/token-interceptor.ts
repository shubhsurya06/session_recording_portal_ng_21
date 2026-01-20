import { HttpInterceptorFn } from '@angular/common/http';
import { APP_CONSTANT } from '../constant/appConstant';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {

  const token = localStorage.getItem(APP_CONSTANT.USER_DATA.TOKEN);

  if (token) {
    // Clone the request to add the new header
    const clonedReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    // Pass the cloned request instead of the original request to the next handle
    return next(clonedReq);
  }

  return next(req);
};
