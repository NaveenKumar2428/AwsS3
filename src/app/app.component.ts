import { Component, ElementRef, ViewChild } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { __param } from 'tslib';
import { ApiService } from './api.service';
import { Ng7LargeFilesUploadLibComponent } from 'ng7-large-files-upload-lib';
import { AnyArn } from 'aws-sdk/clients/groundstation';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'dragon-drop';

  @ViewChild("fileDropRef", { static: false }) fileDropEl!: ElementRef;

  // @ViewChild("splitFiles") 
  splitFiles!: Ng7LargeFilesUploadLibComponent;
  files: any;
  filesBlobs: any;
  uploadIDGenerated = false;
  file_name!: string;
  part = 0;
  parts: any = [];
  buttonDisabled = true;
  buttonDisabledComp = true;

  //multipart
  size: any = [];

  private Uploadurl = 'https://hru3pla4ak.execute-api.us-east-1.amazonaws.com/dev/multipart/create'

  constructor(private http: HttpClient, private apiService: ApiService) {

  }


  onFileDropped($event: any[]) {
    this.prepareFilesList($event);
  }

  fileBrowseHandler(event: any) {

    this.prepareFilesList(event.target.files);
    const body = { fileName: this.file_name }

    this.apiService.genarateUploadId(body).subscribe((res: any) => {
      this.apiService.upload_ID = res.data.upload_id;
      // let partNum = this.part;
      // this.uploadParts(this.file_name, partNum )
      this.buttonDisabled = false;
    })
  }


  onUpload() {
    for (let i = 1; i <= this.filesBlobs.length; i++) {
      // this.part++;
      // if (!this.uploadIDGenerated) {
      //   const body = { fileName: this.file_name}


      //   this.uploadIDGenerated = true;
      //   this.apiService.genarateUploadId(body).subscribe((res: any) => {
      //     this.apiService.upload_ID = res.data.upload_id;
      //     let partNum = this.part;
      //     this.uploadParts(this.file_name, partNum )
      //   });


      // } else {
      // let partNum = this.part
      this.uploadParts(this.file_name, i, this.filesBlobs[i - 1]);
      // }
    }
  }

  uploadParts(file_name: any, partNum: number, blob: any) {
    let part: any = partNum;
    let blobFile = blob;
    const payLoad = { filename: file_name, part_number: partNum, upload_id: this.apiService.upload_ID };
    // console.log(this.apiService.upload_ID)
    this.apiService.saveParts(payLoad).subscribe((res: any) => {
      // it should returns preSigned Url
      // console.log(partNum);
      this.gernarateEtag(res.data.url, { filename: file_name, part_number: part, upload_id: this.apiService.upload_ID }, blobFile)
    })
  }

  getSplittedData(file: any) {
    this.file_name = file[0].name;
    const FILE_CHUNK_SIZE = 10000000; // 10MB
    const fileSize = file[0].size;
    const NUM_CHUNKS = Math.floor(fileSize / FILE_CHUNK_SIZE) + 1;
    // console.log(FILE_CHUNK_SIZE, fileSize, NUM_CHUNKS)
    let start, end, blob;

    let uploadPartsArray = [];
    let countParts = 0;

    let orderData = [];

    for (let index = 1; index < NUM_CHUNKS + 1; index++) {
      start = (index - 1) * FILE_CHUNK_SIZE;
      end = (index) * FILE_CHUNK_SIZE;
      blob = (index < NUM_CHUNKS) ? file[0].slice(start, end) : file[0].slice(start);
      uploadPartsArray.push(blob);
    }
    console.log(uploadPartsArray);
    this.filesBlobs = uploadPartsArray;
  }

  gernarateEtag(url: any, payLoad: any, blob: any) {
    // const httpParams = new HttpParams()
    // .set('fileName', this.file_name)
    // .set('fileType', '')
    // .set('partNumber', payLoad.part_number)
    // .set('uploadId', this.apiService.upload_ID);
    let pay_load: any = {}
    pay_load = { ...payLoad, ...blob }
    // console.log( blob)
    this.http.put(url, blob, { observe: 'response' }).subscribe((res) => {
      let Etag: any = res.headers.get('Etag');
      this.part++;
      // Etag.substr(1, Etag.length-1)
      let eT: any = String(Etag).split('');
      eT.pop();
      eT.shift();
      eT = eT.join('');
      this.parts.push({ part_number: payLoad.part_number, etag: eT });
      if (this.part == this.filesBlobs.length) {
        this.buttonDisabledComp = false;
      }
      // console.log(Etag, eT, this.parts);
    })
  }
  
  completeUpload() {
    this.parts = this.parts.sort((a: any, b: any) => a.part_number - b.part_number);
    // console.log(this.parts);
    const payLoad = { filename: this.files[0].name, parts: this.parts, upload_id: this.apiService.upload_ID }
    this.apiService.completePartUpload(payLoad).subscribe((res) => {
      // complete upload
      // console.log(res);
      this.part = 0;
      this.uploadIDGenerated = false;
      this.apiService.upload_ID = '';
    });
  }

  /**
   * Delete file from files list
   * @param index (File index)
   */
  deleteFile(index: number) {
    if (this.files[index].process < 100) {
      // console.log("Upload in process.");
      return;
    }
    this.files.splice(index, 1);
  }

  uploadFilesSimulator(index: number) {
    setTimeout(() => {
      if (index === this.files.length) {
        return;
      } else {
        const processInterval = setInterval(() => {
          if (this.files[index].process === 100) {
            clearInterval(processInterval);
            this.uploadFilesSimulator(index + 1);
          } else {
            this.files[index].process += 5;
          }
        }, 200);
      }
    }, 1000);
  }

  /**
   * Convert Files list to normal array list
   * @param files (Files List)
   */
  prepareFilesList(files: Array<any>) {
    let fileList = [];
    for (let item of files) {
      item.process = 0;
      fileList.push(item);
      // console.log(item);
    }
    this.files = fileList;
    this.fileDropEl.nativeElement.value = "";
    this.getSplittedData(this.files);
    this.uploadFilesSimulator(0);
    // setTimeout(() => {
    // console.log(this.splitFiles);
    // });
    return this.files
  }

  /**
   * format bytes
   * @param bytes (File size in bytes)
   * @param decimals (Decimals point)
   */
  formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) {
      return "0 Bytes";
    }
    const k = 1024;
    const dm = decimals <= 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  }

}
function axios(arg0: { method: string; url: any; }) {
  throw new Error('Function not implemented.');

}
