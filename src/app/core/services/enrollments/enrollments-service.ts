import { Injectable, inject } from '@angular/core';
import { EnrollmentClass } from '../../model/classes/enrollments.class';
import { HttpClient } from '@angular/common/http';
import { APP_CONSTANT } from '../../constant/appConstant';
import { API_CONSTANT } from '../../constant/apiConstant';
import { environment } from '../../../../environments/environment.development';
import { map, delay } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ICommonApiResponse } from '../../model/interfaces/common/common.model';

@Injectable({
  providedIn: 'root',
})
export class EnrollmentsService {
  baseUrl: string = environment.API_URL;

  // Inject HttpClient
  http = inject(HttpClient);

  // Method to get all enrollments
  getAllEnrollment() : Observable<ICommonApiResponse>{
    const url = `${this.baseUrl}${API_CONSTANT.CONTROLLER_TYPES.BATCH_ENROLLMENTS}${API_CONSTANT.BATCH_ENROLLMENTS_API.GET_ENROLLMENTS}`;
    return this.http.get<ICommonApiResponse>(url).pipe(
      delay(500)
    );
  }

  addEnrollment(enrollmentData: EnrollmentClass) : Observable<ICommonApiResponse>{
    const url = `${this.baseUrl}${API_CONSTANT.CONTROLLER_TYPES.BATCH_ENROLLMENTS}`;
    return this.http.post<ICommonApiResponse>(url, enrollmentData).pipe(
      map((response: ICommonApiResponse) => {
        return response;
      })
    );
  }

  updateEnrollment(enrollmentData: EnrollmentClass) : Observable<ICommonApiResponse>{
    const url = `${this.baseUrl}${API_CONSTANT.CONTROLLER_TYPES.BATCH_ENROLLMENTS}/${enrollmentData.enrollmentId}`;
    return this.http.put<ICommonApiResponse>(url, enrollmentData).pipe(
      map((response: ICommonApiResponse) => {
        return response;
      })
    );
  }

  deleteEnrollment(enrollmentId: number) : Observable<ICommonApiResponse>{
    const url = `${this.baseUrl}${API_CONSTANT.CONTROLLER_TYPES.BATCH_ENROLLMENTS}/${enrollmentId}`;
    return this.http.delete<ICommonApiResponse>(url).pipe(
      map((response: ICommonApiResponse) => {
        return response;
      })
    );  
  }

  getEnrollmentByCandidateId(candidateId: number) : Observable<ICommonApiResponse>{
    const url = `${this.baseUrl}${API_CONSTANT.CONTROLLER_TYPES.BATCH_ENROLLMENTS}${API_CONSTANT.BATCH_ENROLLMENTS_API.BY_CANDIDATE_ID}/${candidateId}`;
    return this.http.get<ICommonApiResponse>(url).pipe(
      delay(500)
    );
  }
}
