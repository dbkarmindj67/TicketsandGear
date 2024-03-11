import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, throwError, tap, forkJoin, map } from 'rxjs';
import { ImgDetail, EventDetails } from '../details/event.models';
import { FlickerService } from '../services/flicker.service';
import { environment } from '../../environments/environment'; // Import environment

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  private apiKey = environment.apiKey;
  private apiUrl = 'https://app.ticketmaster.com/discovery/v2/';
  private apiUrlImages = 'https://app.ticketmaster.com/discovery/v2/events/';
  private apiUrlAttractions = 'https://app.ticketmaster.com/discovery/v2/attractions/';
  private youtubeAPIKey = environment.youtubeAPIKey;
  private youtubeBaseURL = 'https://www.googleapis.com/youtube/v3';

  constructor(private http: HttpClient, private flickerService: FlickerService) { }

  getEventDetailsById(eventId: string, artistName: string, distance: number, artistTags: string[]): Observable<any> {
    const eventurl = `${this.apiUrl}events.json?apikey=${this.apiKey}&eventId=${eventId}&distance=${distance}`;
    const imagesurl = `${this.apiUrlImages}${eventId}/images.json?apikey=${this.apiKey}`;
    console.log('Fetching event details from:', eventurl);
    console.log('Fetching image details from:', imagesurl);
    const getEventDetails = this.http.get<EventDetails>(eventurl).pipe(
      catchError((error) => {
        console.error('Error fetching event details:', error);
        return throwError(() => new Error(error));
      })
    );

    const getImgDetail = this.http.get<ImgDetail>(imagesurl).pipe(
      catchError((error) => {
        console.error('Error fetching image details:', error);
        return throwError(() => new Error(error));
      })
    );

    const getArtistVideos = this.getArtistVideosFromYoutube(artistName, artistTags).pipe(
      catchError((error) => {
        console.error('Error fetching artist videos:', error);
        return throwError(() => new Error(error));
      })
    );

    const getFlickrImages = this.flickerService.getImages(artistName, artistTags).pipe(
      catchError((error) => {
        console.error('Error fetching Flickr images:', error);
        return throwError(() => new Error(error));
      })
    );

    return forkJoin({
      eventDetail: getEventDetails,
      imgDetail: getImgDetail,
      artistVideos: getArtistVideos,
      flickrImages: getFlickrImages
    }).pipe(
      tap((data) => {
        console.log('Raw API Responses:', data);
        if (!data.flickrImages) {
          console.warn('Flickr Images data is missing or undefined.');
        }
      }),
      map((resp) => ({
        eventDetail: resp.eventDetail,
        imgDetail: resp.imgDetail.images,
        artistVideos: (resp.artistVideos as any)?.items,
        flickrImages: (resp.flickrImages as any)?.photos?.photo
      }))
    );
  }

  getEventDetails(eventId: string, page: number = 0): Observable<EventDetails> {
    const url = `${this.apiUrl}events/${eventId}?page=${page}&apikey=${this.apiKey}`;
    return this.http.get<EventDetails>(url).pipe(
      tap((data) => console.log('HttpService - Event Details Data for Page:', page, data)),
      catchError(this.handleError)
    );
  }

  getEventsForPage(page: number): Observable<any> {
    const url = `${this.apiUrl}events.json?page=${page}&apikey=${this.apiKey}`;
    return this.http.get(url).pipe(
      tap((data) => console.log('HttpService - Events for Page Data:', page, data)),
      catchError(this.handleError)
    );
  }

  getArtistVideosFromYoutube(artistName: string, artistTags: string[]): Observable<any> {
    console.log('getArtistVideosFromYoutube called with artistName:', artistName);

    // Construct the URL using the updated youtubeBaseURL
    const tags = artistTags.join(' ');
    const url = `${this.youtubeBaseURL}/search?q=${artistName} ${tags}&type=video&part=snippet&key=${this.youtubeAPIKey}`;
    return this.http.get(url).pipe(
      tap((data) => console.log('HttpService - Artist Videos from Youtube Data:', data)),
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    console.error('Error occurred:', error);
    if (error.error instanceof ErrorEvent) {
      console.error('An error occurred:', error.error.message);
    } else {
      console.error(`Backend returned code ${error.status}, body was:`, error.error);
    }
    return throwError(() => new Error(error));
  }
}
