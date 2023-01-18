import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ProcessComponent } from './Floder/process/process.component';
import { DragonDirective } from './Directives/dragon.directive';
import { Ng7LargeFilesUploadLibModule, Ng7LargeFilesUploadLibComponent } from 'ng7-large-files-upload-lib';



@NgModule({
  declarations: [
    AppComponent,
    ProcessComponent,
    DragonDirective,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
