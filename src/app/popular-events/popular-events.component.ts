import { Component, ChangeDetectorRef, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // For common directives
import { MatFormFieldModule } from '@angular/material/form-field'; // For Material form fields
import { MatInputModule } from '@angular/material/input'; // If using matInput within mat-form-field
import { Subscription } from 'rxjs';
import { CommonService } from '../common-service.service';
import { EventService } from '../events/event.service';
import { RssFetcherService } from '../rss-fetcher.service';
import { EventDetails, NewsItem } from '../details/event.models';
import { throttle } from 'lodash';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-popular-events',
  templateUrl: './popular-events.component.html',
  styleUrls: ['./popular-events.component.scss']
})
export class PopularEventsComponent implements OnInit, OnDestroy {
  // Initialized arrays to avoid "property has no initializer" errors
  musicEvents: EventDetails[] = [];
  sportsEvents: EventDetails[] = [];
  artsEvents: EventDetails[] = [];
  relatedNews: NewsItem[] = [];
  private eventSub: Subscription | undefined;
  public sort: string = 'date,asc'; // Default sort order
  private totalMusicPages = 1;
  private totalSportsPages = 1;
  private totalArtsPages = 1;
  city: string = ''; // Initialize to empty string to avoid "Type 'null' is not assignable to type 'string'".
  currentPageMusic: string = '0';
  currentPageSports: string = '0';
  currentPageArts: string = '0';
  currentPage: string = '0';
  radius: string = '75';
  moreMusicEventsAvailable: boolean = true;
  moreSportsEventsAvailable: boolean = false;
  moreArtsEventsAvailable: boolean = false;
  selectedStartDate: string | null = null;
  selectedEndDate: string | null = null;
  selectedDate: string | null = null;

  // Ensure latitude and longitude are properly initialized
  latitude: number = 0; // Default value; consider updating based on your logic
  longitude: number = 0; // Default value; consider updating based on your logic
  private rssFeedUrls = {
    music: ['https://pitchfork.com/feed/feed-album-reviews/rss', 'https://pitchfork.com/feed/feed-video/rss'],
    sports: ['https://www.espn.com/espn/rss/news', 'https://deadspin.com/rss'],
    arts: ['https://www.theartnewspaper.com/rss.xml', 'http://rss.cnn.com/rss/cnn_showbiz.rss'],
  };

  constructor(
    private eventService: EventService,
    private commonService: CommonService,
    private datePipe: DatePipe,
    private router: Router,
    private rssFetcherService: RssFetcherService, // Inject the RssFetcherService
    private changeDetectorRef: ChangeDetectorRef
  ) {
    console.log('PopularEventsComponent: constructor called');
  }

  ngOnInit(): void {
    this.commonService.getCurrentCity().subscribe({
      next: (city: string) => {
        this.city = city;
        console.log('Geolocation retrieved successfully');
        console.log('City found:', city);
        console.log('Loading initial events for city:', city);

        // Load initial events for different categories
        Promise.all([
          this.loadInitialCategoryEvents(this.city, 'music'),
          this.loadInitialCategoryEvents(this.city, 'sports'),
          this.loadInitialCategoryEvents(this.city, 'arts')
        ])
          .then(() => {
            // After all events have been loaded, match them with news
            this.matchEventsWithNews([...this.musicEvents, ...this.sportsEvents, ...this.artsEvents]);
          })
          .catch(err => {
            // Handle any errors that occurred during event loading
            console.error('Error loading events:', err);
            this.LoadTrendingEvents(); // Assuming this is a fallback method
          });

      },
      error: (err: any) => {
        // Handle any errors that occurred while retrieving the city
        console.error('Error getting city:', err);
      }
    });
  }



  private matchEventsWithNews(events: EventDetails[]): void {
    events.forEach(event => {
      // Assuming the category determination and keyword extraction are separate
      const keywords = this.extractKeywords(event.name);
      // Now, fetch and filter news for each event based on its keywords
      // Note: Adjust the logic to pass categories if necessary
      this.fetchAndFilterNews(keywords);
    });
  }


  private extractKeywords(eventName: string): string[] {
    // Simple keyword extraction logic, can be improved
    return eventName.split(' ').filter(word => word.length > 3); // Filter out short words
  }


  private fetchAndFilterNews(keywords: string[]): void {
    // Example assuming a single category; adjust as necessary for your app's logic
    const category = 'music'; // Example category
    this.rssFetcherService.fetchFeedsByCategory(category).subscribe(rssResponses => {
      rssResponses.forEach(response => {
        const matchedNews = response.items.filter(item =>
          keywords.some(keyword => item.title.includes(keyword) || item.description.includes(keyword))
        );
        // Process matched news here
        this.relatedNews.push(...matchedNews);
      });
      this.changeDetectorRef.detectChanges();
    }, error => console.error('Fetching RSS feeds failed:', error));
  }



LoadTrendingEvents() {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(position => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        this.loadTrendingEvents(latitude, longitude).then(resolve).catch(reject);
      }, geoError => {
        console.error('Geolocation error:', geoError);
        reject(geoError);
      });
    });
  }
 

  private loadTrendingEvents(latitude: number, longitude: number): Promise<EventDetails[]> {
    const apiKey = environment.apiKey;
    const suggestUrl = `https://app.ticketmaster.com/discovery/v2/suggest?apikey=${apiKey}&latlong=${latitude},${longitude}&locale=*`;

    return new Promise((resolve, reject) => {
      this.eventService.getEventsFromCustomUrl(suggestUrl).subscribe(trendingEvents => {
        console.log('Trending events data:', trendingEvents); // Log to inspect the structure

        // Assuming trendingEvents is an array of EventDetails
        this.musicEvents = trendingEvents;
        this.sportsEvents = [];
        this.artsEvents = [];
        resolve(trendingEvents);
      }, error => {
        console.error('Error fetching trending events:', error);
        reject(error);
      });
    });
  }


    // Method to fetch and update category events
  private async fetchAndUpdateCategoryEvents(city: string, category: string): Promise<void> {
    // Generate current date and set time to zeros
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Set time to midnight

    try {
      // Fetch events using throttleGetEvents
      const response = await this.throttleGetEvents(
        [category], city, this.sort, '0', '75', currentDate
      );

      // Update events based on category
      this.updateCategoryEvents(response.events, category);
    } catch (error) {
      console.error(`Error fetching and updating ${category} events:`, error);
    }
  }




  async loadInitialEvents(city: string): Promise<void> {
    console.log(`Loading initial events for city: ${city}`);
    const musicPromise = this.loadInitialCategoryEvents(city, 'music');
    const sportsPromise = this.loadInitialCategoryEvents(city, 'sports');
    const artsPromise = this.loadInitialCategoryEvents(city, 'arts');

    try {
      await Promise.all([musicPromise, sportsPromise, artsPromise]);
    //  console.log('All initial events loaded');
      // Additional logic after all events are loaded
    } catch (error) {
      console.error('Error loading initial events:', error);
    }
  }

  private async loadInitialCategoryEvents(city: string, category: string): Promise<void> {
    // Generate current date and set time to zeros
    const startDateTime = new Date(); // Create a Date object
    startDateTime.setHours(0, 0, 0, 0); // Set time to midnight
    // Use DatePipe to format the date
    const formattedStartDate = this.datePipe.transform(startDateTime, "yyyy-MM-dd'T'HH:mm:ss") + 'Z';
    console.log(`Loading initial events for ${category} in ${city} from ${formattedStartDate}`);

    try {
      const response = await this.eventService.getEventsByCityAndCategory(
        category, city, this.sort, this.currentPage, startDateTime
      ).toPromise();

      // Ensure 'response' is defined and has 'events' before calling updateCategoryEvents
      if (response && response.events) {
        this.updateCategoryEvents(response.events, category);
      } else {
        // Handle the case where 'response' or 'response.events' is undefined
        console.log(`No events found for ${category} in ${city}`);
        // You might want to clear or reset the events for this category since no data was returned
        this.updateCategoryEvents([], category);
      }
    } catch (error) {
      console.error(`Error loading ${category} events:`, error);
    }
  }



  // Method to update category events based on response
  private updateCategoryEvents(events: EventDetails[], category: string): void {
    switch (category) {
      case 'music':
        this.musicEvents = events;
        this.moreMusicEventsAvailable = events.length > 0; // Update availability flag
        break;
      case 'sports':
        this.sportsEvents = events;
        this.moreSportsEventsAvailable = events.length > 0;
        break;
      case 'arts':
        this.artsEvents = events;
        this.moreArtsEventsAvailable = events.length > 0;
        break;
      default:
        console.error('Unknown category:', category);
    }
  }


  

  // Marked as async to use await within
  async onSortChange(): Promise<void> {
    try {
      console.log('Sort changed to:', this.sort); // Log the new sort value

      // Attempt to fetch the city, but fall back to an empty string if undefined
      // This ensures that 'city' is always a string, as expected by the updateEvents method.
      // The 'await' is used with the 'toPromise()' method to convert the observable returned by 'getCurrentCity()' to a promise.
      // This is necessary because 'await' can only be used with promises, not observables.
      const city: string = this.city || await this.commonService.getCurrentCity().toPromise() || '';

      // Reset pagination and flags for all categories
      this.currentPageMusic = '0';
      this.currentPageSports = '0';
      this.currentPageArts = '0';
      this.moreMusicEventsAvailable = true;
      this.moreSportsEventsAvailable = true;
      this.moreArtsEventsAvailable = true;

      // Fetch the sorted data from the first page for all categories
      // The 'city' variable is used here as a parameter for 'updateEvents' function.
      // This function presumably makes a new request to the Ticketmaster API using the provided city and current sort parameters.
      await this.updateEvents(city);
    } catch (error) {
      console.error('Error on sort change:', error); // Log any errors that occur during the sort change process.
    }
  }


  // Modify the onStartDateChange method to pass the required parameters
  onStartDateChange(date: Date | null): void {
    if (date) {
      // Updated date format
      const selectedDate = this.datePipe.transform(date, "yyyy-MM-dd'T'HH:mm:ss") + 'Z';
      this.filterEventsByDate(selectedDate, this.city, this.sort, this.currentPage);
    } else {
      this.resetEventFilters();
    }
  }

  async filterEventsByDate(selectedDate: string | null, city: string, sort: string, page: string): Promise<void> {
    // Check if the city is received correctly
    console.log(`Received city: ${city}`);

    const effectiveCity = city || 'Los Angeles'; // Fallback to default if city is not set
    console.log(`Using city: ${effectiveCity}`);
    const effectiveSort = sort || 'name,asc';
    const effectivePage = page || '0';

    // Convert selectedDate from 'string | null' to 'string' by providing a default value if it's null
    // Assuming '1970-01-01' as default date, you can change this as needed
    const effectiveDate = selectedDate || '1970-01-01';

    console.log(`Filtering events for date: ${effectiveDate} in city: ${effectiveCity} with sort: ${effectiveSort} and page: ${effectivePage}`);

    try {
      // Combine all event category requests into a single Promise.all for efficiency
      // Note: We're now using effectiveDate which is guaranteed to be a string
      const responses = await Promise.all([
        this.eventService.getEventsByCityAndCategory('music', effectiveCity, effectiveSort, effectivePage, new Date(effectiveDate)).toPromise(),
        this.eventService.getEventsByCityAndCategory('sports', effectiveCity, effectiveSort, effectivePage, new Date(effectiveDate)).toPromise(),
        this.eventService.getEventsByCityAndCategory('arts', effectiveCity, effectiveSort, effectivePage, new Date(effectiveDate)).toPromise()
      ]);

      this.musicEvents = responses[0]?.events ?? [];
      this.sportsEvents = responses[1]?.events ?? [];
      this.artsEvents = responses[2]?.events ?? [];
    } catch (error) {
      console.error(`Error filtering events by date:`, error);
      // Optionally, add user feedback here
    }
  }


  resetEventFilters(): void {
    // Reset filters to default state and fetch all events
    this.updateEvents(this.city);
  }


  async updateEvents(city: string): Promise<void> {
    console.log(`Updating events for city: ${city}, Sort: ${this.sort}`);
    try {
      let dateForThrot: Date;

      if (typeof this.selectedDate === 'string') {
        // Convert the string to a Date object
        dateForThrot  = new Date(this.selectedDate);
      } else if (this.selectedDate) {
        // Use the selectedDate directly if it's already a Date object
        dateForThrot = this.selectedDate;
      } else {
        // Fallback to current date if selectedDate is not defined
        dateForThrot = new Date();
      }
      // Fetch Music Events
      const musicResponse = await this.throttleGetEvents(['music'], city, this.sort, this.currentPageMusic, this.radius, dateForThrot);
      if (musicResponse && musicResponse.events) {
        this.musicEvents = [...musicResponse.events];
        this.moreMusicEventsAvailable = !musicResponse.noMoreEvents;
      } else {
        this.musicEvents = [];
        this.moreMusicEventsAvailable = false;
      }

      // Fetch Sports Events
      const sportsResponse = await this.throttleGetEvents(['sports'], city, this.sort, this.currentPageSports, this.radius, dateForThrot); // Include currentDate here
      if (sportsResponse && sportsResponse.events) {
        this.sportsEvents = [...sportsResponse.events];
        this.moreSportsEventsAvailable = !sportsResponse.noMoreEvents;
      } else {
        this.sportsEvents = [];
        this.moreSportsEventsAvailable = false;
      }

      // Fetch Arts Events
      const artsResponse = await this.throttleGetEvents(['arts'], city, this.sort, this.currentPageArts, this.radius, dateForThrot); // Include currentDate here
      if (artsResponse && artsResponse.events) {
        this.artsEvents = [...artsResponse.events];
        this.moreArtsEventsAvailable = !artsResponse.noMoreEvents;
      } else {
        this.artsEvents = [];
        this.moreArtsEventsAvailable = false;
      }
    } catch (error) {
      console.error('Error updating events:', error);
    }
  }
  
  async loadMoreMusicEvents(): Promise<void> {
    console.log('loadMoreMusicEvents called');
    let currentPageNum = parseInt(this.currentPageMusic);
    if (currentPageNum < this.totalMusicPages) {
      this.currentPageMusic = (++currentPageNum).toString();
      console.log(`Loading more music events for page: ${this.currentPageMusic}`);

      // Generate the startDateTime
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0); // Resetting time to 00:00:00

      // Use DatePipe to format the startDateTime
      const formattedStartDate = this.datePipe.transform(currentDate, "yyyy-MM-ddTHH:mm:ss'Z'");
      console.log("Formatted startDateTime using DatePipe:", formattedStartDate);

      // Ensure the city is obtained correctly from the service, convert Observable to Promise, 
      // and provide a fallback value ('' or a default city name) to handle potential undefined values.
      const city: string = await this.commonService.getCurrentCity().toPromise() || '';

      // Make API call using the formatted start date
      // Here, 'city' is ensured to be a string, either from the service or the fallback value.
      const newMusicEvents = await this.throttleGetEvents(
        ['music'],
        city,  // Use the city obtained above
        this.sort,
        this.currentPageMusic,
        this.radius,
        currentDate  // Use the actual Date object, not formattedStartDate
      );
      console.log('New music events:', newMusicEvents);
      this.musicEvents = [...this.musicEvents, ...newMusicEvents.events];
      this.updatePaginationInfo('music', newMusicEvents.page);
    } else {
      console.log('No more music events to load');
    }
  }


  
  async loadMoreSportsEvents(): Promise<void> {
    console.log('loadMoreSportsEvents called');
    let currentPageNum = parseInt(this.currentPageSports);
    if (currentPageNum < this.totalSportsPages) {
      currentPageNum++;
      this.currentPageSports = currentPageNum.toString();
      console.log(`Loading more sports events for page: ${this.currentPageSports}`);

      // Resetting time to 00:00:00 for the current date
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);

      // Format the startDateTime using DatePipe
      const formattedStartDate = this.datePipe.transform(currentDate, "yyyy-MM-ddTHH:mm:ss'Z'");
      console.log("Formatted startDateTime using DatePipe:", formattedStartDate);

      // Convert Observable to Promise and provide a fallback for city
      const city: string = await this.commonService.getCurrentCity().toPromise() || '';

      // Make API call with the resolved city value
      const newSportsEvents = await this.throttleGetEvents(
        ['sports'],
        city, // Fixed: Use resolved city value
        this.sort,
        this.currentPageSports,
        this.radius,
        currentDate // Note: Use actual Date object if required by API, otherwise use formattedStartDate
      );
      console.log('New sports events:', newSportsEvents);
      this.sportsEvents = [...this.sportsEvents, ...newSportsEvents.events];
      this.updatePaginationInfo('sports', newSportsEvents.page);
    } else {
      console.log('No more sports events to load');
    }
  }


  async loadMoreArtsEvents(): Promise<void> {
    console.log('loadMoreArtsEvents called');
    let currentPageNum = parseInt(this.currentPageArts);
    if (currentPageNum < this.totalArtsPages) {
      currentPageNum++;
      this.currentPageArts = currentPageNum.toString();
      console.log(`Loading more arts events for page: ${this.currentPageArts}`);

      // Resetting time to 00:00:00 for the current date
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);

      // Format the startDateTime using DatePipe
      const formattedStartDate = this.datePipe.transform(currentDate, "yyyy-MM-ddTHH:mm:ss'Z'");
      console.log("Formatted startDateTime using DatePipe:", formattedStartDate);

      // Convert Observable to Promise and provide a fallback for city
      const city: string = await this.commonService.getCurrentCity().toPromise() || '';

      // Make API call with the resolved city value
      const newArtsEvents = await this.throttleGetEvents(
        ['arts'],
        city, // Fixed: Use resolved city value
        this.sort,
        this.currentPageArts,
        this.radius,
        currentDate // Note: Use actual Date object if required by API, otherwise use formattedStartDate
      );
      console.log('New arts events:', newArtsEvents);
      this.artsEvents = [...this.artsEvents, ...newArtsEvents.events];
      this.updatePaginationInfo('arts', newArtsEvents.page);
    } else {
      console.log('No more arts events to load');
    }
  }


  updatePaginationInfo(category: string, pagination: any): void {
    console.log(`Updating pagination info for ${category}`, pagination);
    if (!pagination) return;
    const totalPageNumber = pagination.totalPages || 0;
    const currentPageNumber = parseInt(pagination.number) || 0;
    switch (category) {
      case 'music':
        this.totalMusicPages = totalPageNumber;
        this.currentPageMusic = (currentPageNumber + 1).toString();
        this.moreMusicEventsAvailable = currentPageNumber < this.totalMusicPages;
        break;
      case 'sports':
        this.totalSportsPages = totalPageNumber;
        this.currentPageSports = (currentPageNumber + 1).toString();
        this.moreSportsEventsAvailable = currentPageNumber < this.totalSportsPages;
        break;
      case 'arts':
        this.totalArtsPages = totalPageNumber;
        this.currentPageArts = (currentPageNumber + 1).toString();
        this.moreArtsEventsAvailable = currentPageNumber < this.totalArtsPages;
        break;
      // ...
    }
  }


  getBestQualityImage(images: any[]): string | null {
    if (!images || images.length === 0) {
      return null; // Correctly allowed as the function can return string or null
    }

    const largestImage = images.reduce((largest, current) => {
      return (largest.width * largest.height > current.width * current.height) ? largest : current;
    });

    return largestImage.url; // Assuming url is always a string, otherwise this line might need a check too.
  }


  openEventDetails(eventId: string, selectedEvent: EventDetails): void {
    console.log('Navigating with event:', selectedEvent);
    this.router.navigate(['/details', eventId], {
      state: { event: selectedEvent }
    });
  }

  ngOnDestroy(): void {
    if (this.eventSub) {
      this.eventSub.unsubscribe();
    }
  }

  // Custom function to format time
  formatTime(time: string | null): string {
    // Check if the time is defined
    if (!time) {
      return 'Not Available'; // Return a default value if time is null or undefined
    }

    // If time is not null, split it into hours, minutes, and seconds
    const [hours, minutes, seconds] = time.split(':');

    // Create a date object with a dummy date (01-01-2000) and the time
    const dummyDate = new Date(`2000-01-01T${time}`);

    // Use DatePipe to format the time part
    return this.datePipe.transform(dummyDate, 'h:mm a') || 'Not Available'; // Add a fallback in case transform returns null
  }


  // Inside your Angular Component
  throttleGetEvents(
    keywords: string[],
    city: string,
    sort: string,
    page: string,
    radius: string = '75',
    startDate?: Date // Ensuring startDate is a Date object
  ): Promise<{ events: EventDetails[], page?: any, noMoreEvents: boolean }> {
    return new Promise((resolve, reject) => {
      throttle(() => {
        // Format startDateTime using DatePipe, handle null or undefined startDate
        let formattedStartDate = null;
        if (startDate) {
          formattedStartDate = this.datePipe.transform(startDate, 'yyyy-MM-ddTHH:mm:ss', 'UTC') + 'Z';
        }

        // Joining keywords array into a single string
        const keywordString = keywords.join(',');

        // Making API call
        this.eventService.getEventsByCityAndCategory(
          keywordString, city, sort, page, startDate // Use formattedStartDate here
        ).subscribe({
          next: (response) => {
            if (response && Array.isArray(response.events) && response.events.length > 0) {
              resolve({ events: response.events, page: response.page, noMoreEvents: false });
            } else {
              resolve({ events: [], page: {}, noMoreEvents: true });
            }
          },
          error: (error) => {
            console.error(`Error fetching events for ${keywordString}:`, error);
            reject(error);
          }
        });
      }, 1000); // Throttle time to prevent rapid API calls
    });
  }

  // ... [other methods in the component]


}
