import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { delay, delayWhen, map, retry, switchMap, tap, timer, catchError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private Uploadurl = 'https://hru3pla4ak.execute-api.us-east-1.amazonaws.com/dev/multipart/create'
  private Uploadurl2 = 'https://hru3pla4ak.execute-api.us-east-1.amazonaws.com/dev/multipart/generate-url'
  private Uploadurl3 = 'https://hru3pla4ak.execute-api.us-east-1.amazonaws.com/dev/multipart/complete'

  upload_ID = ''

  constructor(private http: HttpClient) { }


  genarateUploadId(payload: any) {
    return this.http.post(this.Uploadurl, payload).pipe(retry({delay: (value: any) => timer(1000)}));
    
  }

  saveParts(payload: any) {
    return this.http.post(this.Uploadurl2, payload).pipe(retry({delay: (value: any) => timer(1000)}));
  }

  completePartUpload(payload: any) {
    return this.http.post(this.Uploadurl3, payload).pipe(retry({delay: (value: any) => timer(1000)}));
  }

}
