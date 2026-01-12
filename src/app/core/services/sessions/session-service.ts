import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, delay } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ICommonApiResponse } from '../../model/interfaces/common/common.model';
import { environment } from '../../../../environments/environment.development';
import { APP_CONSTANT } from '../../constant/appConstant';
import { API_CONSTANT } from '../../constant/apiConstant';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  
  baseUrl: string = environment.API_URL;

  http = inject(HttpClient);

  // Method to get all sessions
  getAllSessions() : Observable<ICommonApiResponse>{
    const url = `${this.baseUrl}${API_CONSTANT.CONTROLLER_TYPES.BATCH_SESSIONS}${API_CONSTANT.SESSION_APIS.GET_SESSIONS}`;
    return this.http.get<ICommonApiResponse>(url).pipe(
      delay(500)
    );
  }

  // create new session
  createSession(sessionData: any): Observable<ICommonApiResponse> {
    const url = `${this.baseUrl}${API_CONSTANT.CONTROLLER_TYPES.BATCH_SESSIONS}`;
    return this.http.post<ICommonApiResponse>(url, sessionData).pipe(
      delay(500)
    );
  }

  // edit session
  updateSession(sessionId: number, sessionData: any): Observable<ICommonApiResponse> {
    const url = `${this.baseUrl}${API_CONSTANT.CONTROLLER_TYPES.BATCH_SESSIONS}/${sessionId}`;
    return this.http.put<ICommonApiResponse>(url, sessionData).pipe(
      delay(500)
    );
  }

  // delete session
  deleteSession(sessionId: number): Observable<ICommonApiResponse> {
    const url = `${this.baseUrl}${API_CONSTANT.CONTROLLER_TYPES.BATCH_SESSIONS}/${sessionId}`;
    return this.http.delete<ICommonApiResponse>(url).pipe(
      delay(500)
    );
  }


}
