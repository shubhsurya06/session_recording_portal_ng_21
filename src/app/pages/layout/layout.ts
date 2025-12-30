import { Component, inject, signal } from '@angular/core';
import { APP_CONSTANT } from '../../core/constant/appConstant';
import { Router, RouterLinkActive, RouterLink, RouterOutlet } from '@angular/router';
import { UserService } from '../../services/user/user-service';
import { IUser } from '../../core/model/user/user-model';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, RouterOutlet, NgClass],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {

  // inject router
  router = inject(Router);

  // inject user service to access user data
  userService = inject(UserService);

  // user data from user service
  userData: IUser | null = null;

  // sidebar collapsed state
  isSidebarCollapsed = signal(false);

  constructor() {
    // Try to get user data from the service
    this.userData = this.userService.userData;

    // If no user data in service, try localStorage
    if (!this.userData) {
      const userDetails = localStorage.getItem(APP_CONSTANT.USER_DATA.USER_DETAILS);
      if (userDetails) {
        this.userData = JSON.parse(userDetails);
        this.userService.setUserData(this.userData);
      }
    }

    console.log('Logged in user data from layout:', this.userData);
  }

  // toggle sidebar collapsed state
  toggleSidebar() {
    this.isSidebarCollapsed.set(!this.isSidebarCollapsed());
  }

  /**
   * Logout the user
   */
  logout() {
    // Clear user data from local storage
    localStorage.removeItem(APP_CONSTANT.USER_DATA.TOKEN);
    localStorage.removeItem(APP_CONSTANT.USER_DATA.USER_DETAILS);
    // Clear user data from user service
    this.userService.removeUserData();
    // Navigate to login page
    this.router.navigate(['/login']);
  }

}
