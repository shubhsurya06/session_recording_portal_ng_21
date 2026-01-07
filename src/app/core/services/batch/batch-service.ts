import { Injectable, inject } from '@angular/core';
import { IBatch } from '../../model/interfaces/batch/batch-model';
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
export class BatchService {
  
  baseUrl: string = environment.API_URL;

  // Inject HttpClient
  http = inject(HttpClient);

  // Method to get all batches
  getBatches() : Observable<ICommonApiResponse>{
    const url = `${this.baseUrl}${API_CONSTANT.CONTROLLER_TYPES.BATCHES}`;
    return this.http.get<ICommonApiResponse>(url).pipe(
      delay(2000)
    );
  }

  // add new batch method 
  addBatch(batch: IBatch): Observable<ICommonApiResponse> {
    const url = `${this.baseUrl}${API_CONSTANT.CONTROLLER_TYPES.BATCHES}`;
    return this.http.post<ICommonApiResponse>(url, batch).pipe(
      delay(2000)
    );
  }

  // update batch method
  updateBatch(batch: IBatch): Observable<ICommonApiResponse> {
    const url = `${this.baseUrl}${API_CONSTANT.CONTROLLER_TYPES.BATCHES}/${batch.batchId}`;
    return this.http.put<ICommonApiResponse>(url, batch).pipe(
      delay(2000)
    );
  }

  // delete batch method using id
  deleteBatch(batchId: number): Observable<ICommonApiResponse> {
    const url = `${this.baseUrl}${API_CONSTANT.CONTROLLER_TYPES.BATCHES}/${batchId}`;
    return this.http.delete<ICommonApiResponse>(url);
  }


}
