import { Component, OnDestroy, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { ImgDetail, AttractionResponse, EventDetails, Attraction, AttractionDetailWithVideos, ImageDetail } from '../details/event.models';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Input } from '@angular/core';

@Component({
  selector: 'app-detail-tabs',
  templateUrl: './detail-tabs.component.html',
  styleUrls: ['./detail-tabs.component.scss'],
})
export class DetailTabsComponent implements OnInit, OnDestroy, OnChanges {
  @Input() eventDetail?: EventDetails;
  @Input() attDetail?: AttractionResponse;
  @Input() imgDetail?: ImgDetail;
  @Input() artistVideos?: any;
  @Input() attraction?: Attraction;
  @Input() allAttractionDetailsWithVideos: AttractionDetailWithVideos[] = [];
  @Input() flickrImageUrls: string[] = [];

  eventImages: any[] = [];
  private subscriptions: Subscription[] = [];

  constructor(private sanitizer: DomSanitizer) {
    console.log("DetailTabsComponent Constructor");
  }

  ngOnInit() {
    if (this.imgDetail?.images && this.imgDetail.images.length > 0) {
      // Filter out low-resolution images
      const highResImages = this.getHighestResolutionImages(this.imgDetail.images);
      this.eventImages = highResImages;
    } else {
      this.eventImages = [];
    }

    console.log("DetailTabsComponent ngOnInit");
    console.log({
      allAttraction: this.allAttractionDetailsWithVideos,
      attDetail: this.attDetail,
      artistVideos: this.artistVideos,
      imgDetail: this.imgDetail,
      eventDetail: this.eventDetail,
      eventImages: this.eventImages // Log the eventImages array
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('DetailTabsComponent data changed:', changes);
  }

  ngOnDestroy() {
    console.log("DetailTabsComponent ngOnDestroy");
    // Unsubscribe from all stored subscriptions
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  private getHighestResolutionImages(images: ImageDetail[]): ImageDetail[] {
    // Sort images based on resolution (width x height) and return all the highest resolution ones
    const sortedImages = images.sort((a, b) => (b.width * b.height) - (a.width * a.height));
    const highestResolution = sortedImages[0].width * sortedImages[0].height;

    return sortedImages.filter(image => image.width * image.height === highestResolution);
  }

  isImage(url: string): boolean {
    // Check if the URL ends with a common image file extension (you can add more extensions if needed)
    return /\.(jpeg|jpg|png|gif|bmp)$/i.test(url);
  }

  private getUniqueHighestResolutionImages(images: ImageDetail[]): ImageDetail[] {
    const seenUrls = new Set<string>();
    const uniqueHighResImages: ImageDetail[] = [];

    images
      .sort((a, b) => (b.width * b.height) - (a.width * a.height))
      .forEach(image => {
        const imageUrl = image.url;

        if (!seenUrls.has(imageUrl)) {
          seenUrls.add(imageUrl);
          uniqueHighResImages.push(image);
        }
      });

    return uniqueHighResImages;
  }

  getYouTubeEmbedURL(videoURL: string): SafeResourceUrl {
    // Extract the video ID from the YouTube video URL
    const videoId = this.extractVideoId(videoURL);

    // Construct the embeddable URL with the extracted video ID
    const embedURL = 'https://www.youtube.com/embed/' + videoId;

    return this.sanitizer.bypassSecurityTrustResourceUrl(embedURL);
  }

  private isBlankImage(image: ImageDetail): boolean {
    // Define your criteria for a blank image. For example, check if the image has an empty URL.
    return !image.url || image.url.trim() === '';
  }

  // Helper function to extract video ID from YouTube video URL
  private extractVideoId(videoURL: string): string {
    const videoIdMatch = videoURL.match(/[?&]v=([a-zA-Z0-9_-]+)/);
    if (videoIdMatch) {
      return videoIdMatch[1];
    }
    return '';
  }
}
