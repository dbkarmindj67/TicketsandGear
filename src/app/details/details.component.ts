import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpService } from '../services/http.service';
import { FlickerService } from '../services/flicker.service';
import { Subject } from 'rxjs';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter, takeUntil, switchMap, catchError } from 'rxjs/operators';
import { ImgDetail, EventDetails, Attraction, FlickrPhoto, AttractionDetailWithVideos, ImageDetail } from './event.models';
import { Observable, of } from 'rxjs';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit, OnDestroy {
  eventId?: string;
  attractionIds: string[] = [];
  eventDetail: EventDetails | null = null;
  imgDetail: ImgDetail[] = [];
  attDetail: Attraction[] = [];
  artistVideos: any[] = [];
  private eventDetailsCache: { [id: string]: EventDetails } = {};
  private lastRequestTime: Date | null = null;
  private requestInterval = 5000; // Set to 5 seconds
  private unsubscribe$ = new Subject<void>();
  allAttractionDetailsWithVideos: AttractionDetailWithVideos[] = [];
  flickrImageUrls: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef,
    private router: Router,
    private httpService: HttpService,
    private sanitizer: DomSanitizer,
    private flickerService: FlickerService
  
  ) {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(() => {
        const navigation = this.router.getCurrentNavigation();
        const state = navigation?.extras?.state;

        if (state && 'event' in state) {
          this.setEventFromState(state['event']);
        }
      });
  }

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.unsubscribe$)).subscribe(params => {
      this.eventId = params['eventId'];
      if (this.eventId) {
        if (this.eventDetail?.name) {
          this.getEventDetailsById(this.eventId, this.eventDetail.name, ['music', 'concert'], this.eventDetail.distance);
        } else {
          this.fetchBasicEventDetails();
        }
      }
    });
  }

  getHighestResolutionImage(images: ImageDetail[]): ImageDetail {
    return images.reduce((prev, current) => {
      return (prev.width * prev.height > current.width * current.height) ? prev : current;
    }, images[0]);
  }

  private fetchBasicEventDetails(): void {
    console.log('Fetching basic event details for eventId:', this.eventId);

    // Check if this.eventId is defined before making the API call
    if (typeof this.eventId === 'string') { // Ensure this.eventId is a string
      this.httpService.getEventDetails(this.eventId).subscribe(event => {
        console.log('Received event details from API:', event);

        if (event.images) {
          console.log('Event images:', event.images);
        }

        this.eventDetail = event;
        if (this.eventId && this.eventDetail.name) { // Additional check for this.eventId
          this.getEventDetailsById(this.eventId, this.eventDetail.name, ['music', 'concert'], this.eventDetail.distance);
        }
      });
    } else {
      console.error('eventId is undefined');
    }
  }


  private setEventFromState(event: EventDetails): void {
    console.log('Setting event from state:', event);

    if (event.images) {
      console.log('Event images:', event.images);
    }

    this.eventDetail = event;
    let fetchObservables: Observable<AttractionDetailWithVideos>[] = [];

    if (this.eventDetail._embedded?.attractions && this.eventDetail._embedded.attractions.length > 0) {
      console.log('Found attractions in event details:', this.eventDetail._embedded.attractions);

      fetchObservables = this.eventDetail._embedded.attractions.map(attraction => {
        return forkJoin({
          attraction: of(attraction),
          videos: this.getArtistVideos(attraction.name, ['music', 'concert']),
          flickrImages: this.fetchFlickerImagesForArtist(attraction.name, ['music', 'concert'])
        });
      });
    } else {
      console.log('No attractions found. Fetching videos for event:', this.eventDetail.name);
    }

    forkJoin(fetchObservables).subscribe(detailsArray => {
      this.allAttractionDetailsWithVideos = detailsArray;
      console.log('All Attraction Details with Videos and Images:', this.allAttractionDetailsWithVideos);
    });
  }

  isVideoURL(url: string): boolean {
    const videoFormats = ['.mp4', '.webm', '.ogg'];
    return videoFormats.some(format => url.endsWith(format));
  }

  private canMakeRequest(): boolean {
    if (!this.lastRequestTime) return true;

    const now = new Date();
    const timeSinceLastRequest = now.getTime() - this.lastRequestTime.getTime();

    if (timeSinceLastRequest < this.requestInterval) {
      console.warn(`Wait for ${this.requestInterval - timeSinceLastRequest}ms before making the next request.`);
      return false;
    }

    return true;
  }

  private getEventDetailsById(eventId: string, artistName: string, artistTags: string | string[], distance: number): void {
    if (!this.canMakeRequest()) return;
    this.lastRequestTime = new Date();

    if (this.eventDetailsCache[eventId]) {
      this.eventDetail = this.eventDetailsCache[eventId];
      this.cdRef.detectChanges();
      return;
    }

    if (typeof artistTags === 'string') {
      artistTags = [artistTags];
    }

    this.httpService.getEventDetailsById(eventId, artistName, distance, artistTags).pipe(takeUntil(this.unsubscribe$)).subscribe({
      next: (eventData) => {
        this.eventDetail = eventData;
        this.eventDetailsCache[eventId] = eventData;
        this.cdRef.detectChanges();
        console.log('Event Details Data in Parent Component:', this.eventDetail);

        if (eventData.images && eventData.images.length > 0) {
          const highResImage = this.getHighestResolutionImage(eventData.images);

          const highResImgDetail: ImgDetail = {
            type: 'image',
            id: 'highest-resolution',
            images: [highResImage],
            _links: {
              self: {
                href: 'mock-link-or-actual-link',
              },
            },
          };

          this.imgDetail = [highResImgDetail];
          console.log('Highest resolution event image from details fetched from http:', highResImage);
        } else {
          this.imgDetail = [];
          console.log('No event images found for the event from details fetched from http.');
        }

        this.attDetail = eventData._embedded?.attractions || [];
        console.log('All event attDetail from details fetched from http:', this.attDetail);
        this.artistVideos = eventData.youtubeVideos?.items || [];
        console.log('All event artistVs from details fetched from http:', this.artistVideos);
      },
      error: (error) => {
        if (error.status === 429) {
          console.error('Too Many Requests, please try again later.');
        } else {
          console.error("Error fetching event details by ID:", error);
        }
      },
    });

    this.getArtistVideos(artistName, artistTags);
  }


  getYouTubeEmbedURL(videoURL: string): SafeResourceUrl {
    const videoId = videoURL.split('v=')[1]?.split('&')[0];
    const embedURL = `https://www.youtube.com/embed/${videoId}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(embedURL);
  }

  private fetchFlickerImagesForArtist(artistName: string, artistTags: string[]): Observable<string[]> {
    return this.flickerService.getImages(artistName, artistTags).pipe(
      switchMap(response => {
        const flickrImages: FlickrPhoto[] = response?.photos?.photo || []; // Now explicitly typed as an array of FlickrPhoto

        const flickrImageUrls = flickrImages.map((photo: FlickrPhoto) => { // Explicitly type 'photo' as FlickrPhoto
          return `https://farm${photo.farm}.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}.jpg`;
        });

        this.flickrImageUrls = flickrImageUrls;
        return of(flickrImageUrls);
      }),
      catchError(error => {
        console.error("[DetailsComponent] - Error fetching Flickr images:", error);
        return of([]);
      })
    );
  }


  // Resolve TS6385 warning by using arrow functions
  private getArtistVideos(artistName: string, artistTags: string[]): Observable<any> {
    console.log(`[DetailsComponent] - Fetching videos for artist: ${artistName}`);

    return this.httpService.getArtistVideosFromYoutube(artistName, artistTags).pipe(
      catchError(error => {
        console.error(`[DetailsComponent] - Error fetching YouTube videos for artist: ${artistName}.`, error);
        return of(null);
      })
    );
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}


