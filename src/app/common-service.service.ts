import { HttpClient } from '@angular/common/http'; // Corrected import for HttpClient
import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { from, Observable, throwError } from 'rxjs'; // Combined imports from 'rxjs'
import { catchError, map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root' // This service is provided in the root level, making it available across the app.
})
export class CommonService {
  private googleApiKey: string;

  constructor(private http: HttpClient) { // Ensure HttpClient is correctly injected.
    this.googleApiKey = environment.googleApiKey;
  }

  getCurrentCity(): Observable<string> {
    return from(this.getLocation()).pipe(
      switchMap(({ latitude, longitude }) => {
        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${this.googleApiKey}`;
        return this.http.get<any>(url).pipe( // 'any' type used for response to bypass strict type checks. Consider defining a more specific type.
          map(response => {
            // Added type checks and property access checks for 'response' to ensure TypeScript type safety.
            if (response && response.results && Array.isArray(response.results) && response.results.length > 0) {
              // Explicitly typing 'component' as any inside find() method to avoid TS errors. Consider defining a more specific type.
              const city = response.results[0].address_components.find((component: any) =>
                component.types && component.types.includes('locality')
              );
              if (city) {
                return city.long_name;
              } else {
                throw new Error('City not found');
              }
            } else {
              throw new Error('No results found');
            }
          }),
          catchError(error => {
            console.error('Error while fetching geocoding data:', error);
            return throwError(() => new Error('Error while fetching city information'));
          })
        );
      })
    );
  }

  getLocation(): Promise<{ latitude: number, longitude: number }> {
    return new Promise((resolve, reject) => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(position => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        }, error => {
          reject(error);
        });
      } else {
        reject(new Error('Geolocation is not supported by this browser.'));
      }
    });
  }
}
