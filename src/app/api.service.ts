import { HttpClient, HttpParams } from '@angular/common/http';
import { ElementRef, Injectable, ViewChild } from '@angular/core';
import { delay, delayWhen, map, retry, switchMap, tap, timer, catchError } from 'rxjs';


export interface IParamStartUpload {
  fileName: string;
  fileType: string;
}


@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private Uploadurl = 'https://hru3pla4ak.execute-api.us-east-1.amazonaws.com/dev/multipart/create'
  private Uploadurl2 = 'https://hru3pla4ak.execute-api.us-east-1.amazonaws.com/dev/multipart/generate-url'
  private Uploadurl3 = 'https://hru3pla4ak.execute-api.us-east-1.amazonaws.com/dev/multipart/complete'

  upload_ID = ''

  @ViewChild("fileDropRef", { static: false })
  fileDropEl!: ElementRef;
  files: any[] = [];

  constructor(private http: HttpClient) { }
  

  /**
   * Initiate a multipart upload.
   *
   * @param params
   */
  
  genarateUploadId(payload: any) {
  //    this.files
  //    const httpParams = new HttpParams()
  //     .set('fileName', encodeURIComponent(params.fileName))
  //     .set('fileType', encodeURIComponent(params.fileType));
 
  //     return this.http.get((this.Uploadurl), {params: httpParams}).toPromise();
  //     /**
  //  * Upload MultiPart.
  //  *
  //  * @param file
  //  * @param tokenEmit
  //  */   
    
 return this.http.post(this.Uploadurl, payload).pipe(retry({delay: (value: any) => timer(1000)}));
    
  }

  saveParts(payload: any) {
    return this.http.post(this.Uploadurl2, payload).pipe(retry({delay: (value: any) => timer(1000)}));
  }

  completePartUpload(payload: any) {
    return this.http.post(this.Uploadurl3, payload)
    //.pipe(retry({delay: (value: any) => timer(1000)}));
  }

}
