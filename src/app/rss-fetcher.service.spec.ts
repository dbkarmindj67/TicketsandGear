import { TestBed } from '@angular/core/testing';

import { RssFetcherService } from './rss-fetcher.service';

describe('RssFetcherService', () => {
  let service: RssFetcherService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RssFetcherService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
