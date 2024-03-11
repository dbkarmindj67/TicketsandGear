import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment'; // Import environment

@Injectable({
  providedIn: 'root'
})
export class FlickerService {
  private flicker_API_KEY = environment.flicker_API_KEY;
  private API_URL = 'https://api.flickr.com/services/rest/';

  constructor(private http: HttpClient) { }

  getImages(artistName: string, tags: string[] = [], perPage: number = 10): Observable<any> {
    console.log(`[FlickerService] - Initiating image fetch for artist: ${artistName} with ${perPage} results per page.`);

    // Combine artist name and tags into the search query
    const searchText = artistName + ' ' + tags.join(' ');

    const params = new HttpParams()
      .set('method', 'flickr.photos.search')
      .set('api_key', this.flicker_API_KEY)
      .set('text', searchText)
      .set('format', 'json')
      .set('nojsoncallback', '1')
      .set('per_page', perPage.toString())
      .set('page', '1');

    return this.http.get<any>(this.API_URL, { params }).pipe(
      tap(images => {
        if (images?.photos?.photo) {
          console.log(`[FlickerService] - Fetched ${images.photos.photo.length} images for artist: ${artistName}.`);
        } else {
          console.error(`[FlickerService] - No images received for artist: ${artistName}. Response:`, images);
        }
      }),
      catchError(error => {
        console.error(`[FlickerService] - Error fetching images for artist ${artistName}:`, error);
        return throwError(() => new Error(error));
      })
    );
  }
}
