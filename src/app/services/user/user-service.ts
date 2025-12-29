import { Injectable } from '@angular/core';
import { IUser } from '../../core/model/user/user-model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  // store logged in user data here
  userData: IUser | null = null;

  // set user data after login successfull
  setUserData(data: IUser | null) {
    this.userData = data;
  }

  // remove user data on logout
  removeUserData() {
    this.userData = null;
  }

}
