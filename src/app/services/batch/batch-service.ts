import { Injectable, inject } from '@angular/core';
import { IBatch } from '../../core/model/batch/batch-model';
import { HttpClient } from '@angular/common/http';
import { APP_CONSTANT } from '../../core/constant/appConstant';
import { API_CONSTANT } from '../../core/constant/apiConstant';
import { environment } from '../../../environments/environment.development';
import { map, delay } from 'rxjs/operators';


@Injectable({
  providedIn: 'root',
})
export class BatchService {
  
  baseUrl: string = environment.API_URL;

  // Inject HttpClient
  http = inject(HttpClient);

  // Method to get all batches
  getBatches() {
    const url = `${this.baseUrl}${API_CONSTANT.CONTROLLER_TYPES.BATCHES}`;
    return this.http.get<IBatch[]>(url).pipe(
      delay(2000),
      map((res: any) => res.data as IBatch[])
    );
  }

  // add new batch method 
  addBatch(batch: IBatch) {
    const url = `${this.baseUrl}${API_CONSTANT.CONTROLLER_TYPES.BATCHES}`;
    return this.http.post<IBatch>(url, batch).pipe(
      delay(2000),
      map((res: any) => res.data as IBatch)
    );
  }

  // update batch method
  updateBatch(batch: IBatch) {
    const url = `${this.baseUrl}${API_CONSTANT.CONTROLLER_TYPES.BATCHES}/${batch.batchId}`;
    return this.http.put<IBatch>(url, batch).pipe(
      delay(2000),
      map((res: any) => res.data as IBatch)
    );
  }

  // delete batch method using id
  deleteBatch(batchId: number) {
    const url = `${this.baseUrl}${API_CONSTANT.CONTROLLER_TYPES.BATCHES}/${batchId}`;
    return this.http.delete<void>(url);
  }


}
