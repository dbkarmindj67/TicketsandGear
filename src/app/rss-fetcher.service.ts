import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../environments/environment'; // Ensure correct path
import { RssResponse } from './details/event.models'; // Ensure correct path

@Injectable({
  providedIn: 'root'
})
export class RssFetcherService {
  private backendProxyBaseUrl: string = environment.backendProxyBaseUrl; // Use environment variable

  // Assuming the categoryFeedUrls remain unchanged
  private categoryFeedUrls: { [category: string]: string[] } = {
    music: ['https://pitchfork.com/feed/feed-album-reviews/rss', 'https://pitchfork.com/feed/feed-video/rss'],
    sports: ['https://www.espn.com/espn/rss/news', 'https://deadspin.com/rss'],
    arts: ['https://www.theartnewspaper.com/rss.xml', 'http://rss.cnn.com/rss/cnn_showbiz.rss'],
  };

  constructor(private http: HttpClient) { }

  // Fetch feeds based on a category
  fetchFeedsByCategory(category: string): Observable<RssResponse[]> {
    if (!this.categoryFeedUrls[category]) {
      throw new Error(`No RSS feeds defined for category: ${category}`);
    }
    // Accessing the object with a string index after updating type definitions
    const feeds = this.categoryFeedUrls[category].map(url => this.transformFeedUrl(url));
    return this.fetchMultipleFeeds(feeds);
  }

  // Transform the RSS feed URL to align with the rss2json API requirements
  // Added type annotation to parameter

  // Transform the RSS feed URL to align with the rss2json API requirements
  private transformFeedUrl(feedUrl: string): string {
    // Assuming your backendProxyBaseUrl is configured to handle requests to the rss2json API
    // Transform the feed URL to match the rss2json API request structure
    const rssUrlParam = encodeURIComponent(feedUrl);
    // Adjust this URL if your backend requires a different structure for rss2json requests
    return `${this.backendProxyBaseUrl}?rss_url=${rssUrlParam}`;
  }

  // Fetch multiple feeds
  public fetchMultipleFeeds(feedUrls: string[]): Observable<RssResponse[]> {
    const feedRequests = feedUrls.map(feedUrl => this.fetchSingleFeed(feedUrl));
    return forkJoin(feedRequests); // Combine multiple observables
  }

  // Fetch a single feed through the proxy
  // Added type annotation to parameter
  private fetchSingleFeed(proxiedFeedUrl: string): Observable<RssResponse> {
    console.log(`Fetching RSS feed from: ${proxiedFeedUrl}`); // Log the request URL
    return this.http.get<RssResponse>(proxiedFeedUrl).pipe(
      tap({
        next: response => {
          console.log(`Received RSS feed data from: ${proxiedFeedUrl}`, response);
        },
        error: error => {
          console.error(`Failed to fetch RSS feed from: ${proxiedFeedUrl}`, {
            message: error.message,
            status: error.status,
            error: error.error,
          });
        }
      })
    );
  }

  // Determine feed URL by keyword (implementation remains the same)
  // Added type annotation to parameter
  private determineFeedUrlForKeyword(keyword: string): string {
    // Example implementation
    if (keyword === "Beyonce") return this.transformFeedUrl("https://beyonce-rss-feed-url.com/feed");
    return this.transformFeedUrl("https://default-rss-feed-url.com/feed");
  }

  // Other methods remain unchanged...
}
