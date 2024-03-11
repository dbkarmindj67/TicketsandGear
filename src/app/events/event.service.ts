import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { DatePipe } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private apiKey = environment.apiKey;
  private apiUrl = 'https://app.ticketmaster.com/discovery/v2';

  constructor(private http: HttpClient, private datePipe: DatePipe) {
    console.log('EventService instantiated');
    if (!this.http) {
      console.error('HttpClient not injected into EventService');
    } else {
      console.log('HttpClient injected into EventService');
    }
  }

  private addDays(date: Date, days: number): Date {
    let result = new Date(date);
    result.setDate(result.getDate() + days);
    console.log(`EventService: Added ${days} days`, result);
    return result;
  }

  getEventsFromCustomUrl(url: string): Observable<any> {
    console.log('EventService: Fetching events from custom URL', url);
    return this.http.get<any>(url).pipe(
      map(response => {
        console.log('EventService: Received response from custom URL', response);
        return response._embedded?.events || [];
      }),
      catchError(error => {
        console.error('EventService: Error fetching events from custom URL', error);
        return throwError(() => error);
      })
    );
  }

  getEventsByCityAndCategory(
    keyword: string,
    city: string,
    sort: string = 'date,asc',
    page: string = '0',
    startDateTime?: Date // startDateTime is now optional
  ): Observable<{ events: any[]; page: any }> {
    const radius = '75'; // Ensure radius is a string
    const size = '10'; // Number of events to fetch per request

    let params = new HttpParams()
      .set('apikey', this.apiKey)
      .set('keyword', keyword)
      .set('sort', sort)
      .set('page', page)
      .set('radius', radius)
      .set('size', size) // Add size parameter
      .set('unit', 'miles')
      .set('locale', '*');

    if (city) {
      params = params.set('city', city);
    }

    // Format startDateTime and endDateTime if they are provided
    if (startDateTime) {
      const formattedStartDateTime = this.datePipe.transform(startDateTime, "yyyy-MM-dd'T'HH:mm:ss'Z'", 'UTC') || '';
      params = params.set('startDateTime', formattedStartDateTime);
    }

    return this.http.get<any>(`${this.apiUrl}/events`, { params }).pipe(
      map(response => {
        return {
          events: response._embedded?.events || [],
          page: response.page || {}
        };
      }),
      catchError(error => {
        console.error('Error in getEventsByCityAndCategory:', error);
        return throwError(() => error);
      })
    );
  }

  getTrendingEvents(geoHash: string, size: string = '10'): Observable<any> {
    let params = new HttpParams()
      .set('apikey', this.apiKey)
      .set('geoPoint', geoHash)
      .set('size', size);

    return this.http.get<any>(`${this.apiUrl}/suggest`, { params }).pipe(
      map(response => {
        return response;
      }),
      catchError(error => {
        console.error('Error in getTrendingEvents:', error);
        return throwError(() => error);
      })
    );
  }

  private generateGeohash(lat: number, lon: number): string {
    return lat.toFixed(2) + ',' + lon.toFixed(2);
  }
}

  /*getEventsByCityAndCategory(
    keyword: string = 'music',
    location: string = 'Sacramento',
    sort: string = 'name,asc',
    page: string = '0',
    radius: string = '75',
  //  startDateTime: string = new Date().toISOString(),
 // endDateTime: string = this.calculateEndDate(new Date())
    startDate: string,
    endDate: string
  ): Observable<{ events: any[]; page: any }> {
    // ... (logging each parameter)
    console.log('Parameters:', { keyword, location, sort, page, radius, startDate, endDate });

    let params = new HttpParams()
      .set('keyword', keyword)
      .set('city', location)
      .set('size', '10')
      .set('sort', sort)
      .set('page', page)
      .set('radius', radius)
      .set('startDate', startDate) //; Using 'sdate' instead of 'startDateTime'
      .set('endDate', endDate) // Using 'edate' instead of 'endDateTim
      .set('apikey', this.apiKey);
    const url = `${this.apiUrl}/events.json`;

    return this.http.get<any>(url, { params }).pipe(
      map(response => {
        // Handle response
        console.log('Response:', response);
        return {
          events: response._embedded?.events || [],
          page: response.page || {}
        };
      }),
      catchError(error => {
        console.error('Error in getEventsByCityAndCategory:', error);
        return of({ events: [], page: {} }); // Handle error
      })
    );
  }

  // ... (other methods)
}

*/
  /* getEventsByCityAndCategory(
    keyword: string,
    location: string,
    sort: string,
    page: string,
    radius: string,
    startDate: string,
    endDate: string 
  ): Observable<{ events: any[]; page: any }> {
    let params = new HttpParams()
      .set('apikey', this.apiKey)
      .set('keyword', keyword)
      .set('city', location)
      .set('size', '10')
      .set('sort', sort)
      .set('page', page)
      .set('radius', radius)
      .set('startDateTime', startDate) // Changed parameter name from 'startDate' to 'startDateTime'
      .set('endDateTime', endDate); // Added 'endDateTime' parameter
    const url = `${this.apiUrl}/events.json`;

    const fullUrlWithParams = `${url}?${params.toString()}`;
    console.log('Making request to:', fullUrlWithParams);

    return this.http.get<any>(url, { params }).pipe(
      map(response => {
        console.log('Raw API Response:', response._embedded?.events);

        if (response._embedded) {
          return {
            events: response._embedded.events || [],
            page: response.page || {}
          };
        } else {
          return {
            events: [],
            page: response.page || {}
          };
        }
      }),
      catchError(error => {
        console.error('Error in getEventsByCityAndCategory:', error);
        return throwError(() => error);
      })
    );
  }
}
*/
