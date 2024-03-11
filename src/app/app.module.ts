import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { EventsComponent } from './events/events.component';
import { OrderByPipe } from './orderBy.pipe';
import { BrowserModule } from '@angular/platform-browser';
import { SearchBarComponent } from './search-bar/search-bar.component';
import { EventService } from './events/event.service';
import { PopularEventsComponent } from './popular-events/popular-events.component';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { DetailsComponent } from './details/details.component'; // Import HttpClientModule
import { ModalModule } from 'ngx-bootstrap/modal';
import { MatTabsModule } from '@angular/material/tabs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DetailTabsComponent } from './detail-tabs/detail-tabs.component';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { DatePipe } from '@angular/common';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { RssFeedDisplayComponent } from './rss-feed-display/rss-feed-display.component';
import { CommonModule } from '@angular/common'; // Import CommonModule for common Angular directives.


@NgModule({
  declarations: [
    AppComponent,
    SearchBarComponent,
    EventsComponent,
    OrderByPipe,
    PopularEventsComponent,
    DetailsComponent,
    DetailTabsComponent,
    RssFeedDisplayComponent,

  ],

  imports: [
    AppRoutingModule,
    RouterModule.forRoot([]),
    FormsModule,
    BrowserAnimationsModule,
    BrowserModule,
    MatTabsModule,
    HttpClientModule,
    SlickCarouselModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    ModalModule.forRoot(),
    MatDatepickerModule,
    CommonModule,
    MatNativeDateModule
  ],

  providers: [EventService, DatePipe],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA] // Add this line
})
export class AppModule { }
