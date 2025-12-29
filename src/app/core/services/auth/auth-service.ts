import { Injectable, inject } from '@angular/core';
import { IUser } from '../../model/user/user-model';
import { APP_CONSTANT } from '../../constant/appConstant';
import { API_CONSTANT } from '../../constant/apiConstant';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  http = inject(HttpClient);

  private baseUrl = environment.API_URL;

  // login user from here
  login(data: IUser) {
    const url = this.baseUrl + API_CONSTANT.CONTROLLER_TYPES.BATCH_USER + API_CONSTANT.BATCH_USER_APIS.LOGIN;
    return this.http.post(url, data);
  }

  // check if user is logged in
  isUserLoggedIn(): boolean {
    const userData = localStorage.getItem(APP_CONSTANT.USER_DATA.TOKEN);
    return userData !== null;
  }

}
