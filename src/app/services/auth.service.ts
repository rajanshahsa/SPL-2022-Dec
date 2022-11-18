import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from './api.service';
import { LOCAL_STORAGE_KEYS } from './constants';
import { LocalStorageService } from './local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  constructor(
    private apiService: ApiService,
    private localStorageService: LocalStorageService
  ) { }

  async getUserAuthenticate() {
    const userFound = await this.localStorageService.getDataFromIndexedDB(LOCAL_STORAGE_KEYS.TOKEN);
    return userFound;
  }

  async login(data: any) {
    return this.apiService.post('/auth/sign-in', data, false);
  }

  async forgotPassword(data: any) {
    return this.apiService.post('/staffs/forgot-password', data, false);
  }

  async changePassword(data: any) {
    return this.apiService.post('/staffs/change-password', data, true);
  }

  async resetPassword(data: any) {
    return this.apiService.post('/staffs/reset-password', data, false);
  }

}
