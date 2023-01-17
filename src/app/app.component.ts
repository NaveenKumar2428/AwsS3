import { Component, ElementRef, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { __param } from 'tslib';
import { ApiService } from './api.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'dragon-drop';

  @ViewChild("fileDropRef", { static: false })
  fileDropEl!: ElementRef;
  files: any[] = [];
  
  uploadIDGenerated = false;
  part = 0;
  parts: any = [];


  constructor(private http: HttpClient, private apiService: ApiService) {

  }


  onFileDropped($event: any[]) {
    this.prepareFilesList($event);
  }

  fileBrowseHandler(event: any) {
    return this.prepareFilesList(event.target.files);

  }


  onUpload() {
    for (let i = 0; i < this.files.length; i++) {
      this.part++;
      if (!this.uploadIDGenerated) {
        const body = { fileName: this.files[i].name }
        this.uploadIDGenerated = true;
        this.apiService.genarateUploadId(body).subscribe((res: any) => {
          this.apiService.upload_ID = res.data.upload_id;
          let partNum = this.part;
          this.uploadParts(this.files[i].name, partNum )
        })
      } else {
        let partNum = this.part
        this.uploadParts(this.files[i].name, partNum);
      }
    }
  }

  uploadParts(file_name: any, partNum: number) {
    const payLoad = { filename: file_name, part_number: partNum, upload_id: this.apiService.upload_ID };
    // console.log(this.apiService.upload_ID)
    this.apiService.saveParts(payLoad).subscribe((res:any) => {
      // it should returns preSigned Url
      console.log(res);
      this.gernarateEtag(res.data.url,payLoad)
    })
  }

  gernarateEtag(url:any,payLoad:any){
    this.http.put(url, payLoad, {observe: 'response'}).subscribe((res)=>{
      let Etag: any = res.headers.get('Etag');
      // Etag.substr(1, Etag.length-1)
      let eT: any = String(Etag).split('');
      eT.pop();
      eT.shift();
      eT = eT.join('');
      this.parts.push({part_number: payLoad.part_number, etag: eT});
      console.log(Etag, eT, this.parts);
    })
  }

  completeUpload() {
    const payLoad = {filename: this.files[0].name, parts: this.parts, upload_id: this.apiService.upload_ID}
    this.apiService.completePartUpload(payLoad).subscribe((res) => {
    // complete upload
    console.log(res);
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
      console.log("Upload in process.");
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
    for (let item of files) {
      item.process = 0;
      this.files.push(item);
    }
    
    this.fileDropEl.nativeElement.value = "";
    this.uploadFilesSimulator(0);
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

