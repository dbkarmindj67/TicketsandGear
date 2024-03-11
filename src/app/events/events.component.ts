import { Component, OnInit, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from '../events/event.service';
import { TicketEvent } from './ticket-event.model';
import { DatePipe } from '@angular/common';
import { CommonService } from '../common-service.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common'; // For common directives
import { MatFormFieldModule } from '@angular/material/form-field'; // For Material form fields
import { MatInputModule } from '@angular/material/input'; // If using matInput within mat-form-field
import { RssFetcherService } from '../rss-fetcher.service';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class EventsComponent implements OnInit {
  events: TicketEvent[] = [];
  keyword: string = '';
  location: string = '';
  radius: string = '75';
  page: string = '0';
  currentPage: string = '0';
  itemsPerPage = 10;
  totalPages = 1;
  public sort: string = 'date,asc';
  initialEventsToLoad = 10;
  eventsToLoadPerClick = 10;
  totalLoadedEvents = this.initialEventsToLoad;
  private isLoadMore: boolean = false;
  loading: boolean = false;
  city: string = '';
  moreEventsAvailable: boolean = true;
  private subscriptions = new Subscription();
  displayedEventCount: number = 0;
  totalEventCount: number = 0;
  selectedDate?: Date;

  constructor(
    private route: ActivatedRoute,
    private eventService: EventService,
    private datePipe: DatePipe,
    private changeDetectorRef: ChangeDetectorRef,
    private commonService: CommonService,
    private router: Router
    
  ) { }

  ngOnInit(): void {
    console.log('Component initialized');
    this.route.queryParams.subscribe(params => {
      console.log('Query Params:', params); // Log all parameters
      const newSelectedDate = params['date'] ? new Date(params['date']) : undefined;
      const dateChanged = this.selectedDate?.toISOString() !== newSelectedDate?.toISOString();

      if (params['keyword'] !== this.keyword || params['location'] !== this.location || dateChanged) {
        console.log('Changes detected in keyword, location, or date');
        this.keyword = params['keyword'] ?? '';
        this.location = params['location'] ?? '';
        this.selectedDate = newSelectedDate;

        this.currentPage = '0';
        this.events = [];
        console.log('Before fetching events', {
          keyword: this.keyword,
          location: this.location,
          date: this.selectedDate
        });
        this.fetchEvents();
      }
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onDateChange(event: any): void {
    console.log('Date change event:', event);
    if (event instanceof Date) {
      this.selectedDate = event;
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { date: this.datePipe.transform(event, 'yyyy-MM-dd'), keyword: this.keyword, location: this.location },
        queryParamsHandling: 'merge'
      });
    }
  }

  async fetchEvents(): Promise<void> {
    console.log('fetchEvents called with', {
      keyword: this.keyword,
      location: this.location,
      sort: this.sort,
      currentPage: this.currentPage,
      selectedDate: this.selectedDate
    });

    let dateToUse = this.selectedDate || new Date();
    dateToUse.setHours(0, 0, 0, 0); // Set time to midnight

    const formattedStartDate = this.datePipe.transform(dateToUse, "yyyy-MM-dd'T'HH:mm:ss'Z'", 'UTC');
    console.log(`Formatted Start Date for API call: ${formattedStartDate}`);

    if (formattedStartDate) {
      this.loading = true;
      try {
        const response = await this.eventService.getEventsByCityAndCategory(
          this.keyword, this.location, this.sort, this.currentPage, dateToUse
        ).toPromise();

        console.log('API call successful, response:', response);

        this.totalEventCount = response?.page?.totalElements || 0;
        this.displayedEventCount = response?.events?.length || 0;
        this.events = this.isLoadMore ? [...this.events, ...(response?.events || [])] : [...(response?.events || [])];
        this.totalPages = response?.page?.totalPages || 0;
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        this.loading = false;
      }
    } else {
      console.error('Formatted start date is invalid');
    }
  }

  openEventDetails(eventId: string, selectedEvent: TicketEvent): void {
    console.log(`Navigating to event details for ID: ${eventId}, Event:`, selectedEvent);
    this.router.navigate(['/details', eventId], {
      state: { event: selectedEvent },
    });
  }

  formatTime(time: string | null | undefined): string {
    console.log('Original time:', time); // Log the input
    if (!time) {
      return 'N/A'; // Return 'N/A' if time is null or undefined
    }
    const dummyDate = new Date(`1970-01-01T${time}Z`); // Use dummy date to create a date object
    console.log('Converted Time:', this.datePipe.transform(dummyDate, 'shortTime')); // Log the converted time
    return this.datePipe.transform(dummyDate, 'shortTime') || ''; // Return the formatted time
  }
}
