import { inject, Injectable } from '@angular/core';
import { C_Candidate } from '../../model/classes/candidate.class';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';
import { APP_CONSTANT } from '../../constant/appConstant';
import { API_CONSTANT } from '../../constant/apiConstant';
import { delay, Observable } from 'rxjs';
import { ICommonApiResponse } from '../../model/interfaces/common/common.model';

@Injectable({
  providedIn: 'root',
})
export class CandidateService {

  http = inject(HttpClient);
  baseUrl = environment.API_URL;

  getAllCandidates(): Observable<ICommonApiResponse> {
    let url = `${this.baseUrl}${API_CONSTANT.CONTROLLER_TYPES.CANDIDATES}`;
    return this.http.get<ICommonApiResponse>(url).pipe(
      delay(500)
    );
  }

  addCandidate(candidate: C_Candidate): Observable<ICommonApiResponse> {
    const url = `${this.baseUrl}${API_CONSTANT.CONTROLLER_TYPES.CANDIDATES}`;
    return this.http.post<ICommonApiResponse>(url, candidate).pipe(
      delay(500)
    );
  }


  // update batch method
  updateCandidate(candidate: C_Candidate): Observable<ICommonApiResponse> {
    const url = `${this.baseUrl}${API_CONSTANT.CONTROLLER_TYPES.CANDIDATES}/${candidate.candidateId}`;
    return this.http.put<ICommonApiResponse>(url, candidate).pipe(
      delay(500)
    );
  }

  // delete candidate method using id
  deleteCandidate(candidateId: number) {
    const url = `${this.baseUrl}${API_CONSTANT.CONTROLLER_TYPES.CANDIDATES}/${candidateId}`;
    return this.http.delete<ICommonApiResponse>(url).pipe(
      delay(1000)
    );
  }

}
