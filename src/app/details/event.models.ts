export interface RssResponse {
  status: string;
  feed: Feed;
  items: NewsItem[]; // Array of news items
}

export interface Feed {
  url: string;
  title: string;
  link: string;
  author: string;
  description: string;
  image: string;
}

export interface NewsItem {
  title: string;
  pubDate: string;
  link: string;
  guid: string;
  author: string;
  thumbnail: string;
  description: string;
  content: string;
  enclosure: object;
  categories: string[];
}


export interface ImageDetail {
  ratio: string;
  url: string;
  width: number;
  height: number;
  fallback: boolean;
}

export interface LinkDetail {
  self: {
    href: string;
    templated?: boolean;
  };
}


export interface ImgDetail {
  type: string;
  id: string;
  images: ImageDetail[];
  _links: LinkDetail;
}

export interface AttractionResponse {
  _embedded?: {
    attractions: Attraction[];
  };
  // ... any other relevant fields from the response
}

export interface Classification {
  primary?: boolean;
  segment: {
    id: string;
    name: string;
  };
  genre: {
    id: string;
    name: string;
  };
  subGenre?: {
    id: string;
    name: string;
  };
}

export interface Attraction {
  name: string;
  type: string;
  id: string;
  test: boolean;
  url: string;
  locale?: string;
  images: ImgDetail[];
  classifications: Classification[];
}
export interface AttractionDetailWithVideos {
  attraction?: Attraction;
  videos: {
    etag: string;
    items: VideoItem[];
    kind: string;
    nextPageToken: string;
    pageInfo: {
      totalResults: number;
      resultsPerPage: number;
    };
    regionCode: string;
  };
  flickrImages?: any[]; // Optional, because not every attraction may have Flickr images.
}



interface VideoItem {
  // fill out the structure of a single video item based on your data model
  id: {
    videoId: string;
  };
  // ... other properties ...
}

export interface EventDetails {
  pagination: {
    total_pages: number;
  },
  _links: {
    self: {
      href: string;
      templated: boolean;
    },
    venues: {
      href: string;
      templated: boolean;
    }[],
    attractions: {
      href: string;
      templated: boolean;
    }[]
  };
  _embedded: {
    venues: any[];
    attractions: Attraction[];
  };
  type: string;
  distance: number;
  units: string;
  location: {
    longitude: number;
    latitude: number;
  };
  id: string;
  locale: string;
  name: string;
  description: string;
  additionalInfo: string;
  url: string;
  images: ImageDetail[];
  dates: {
    start: any;
    end: any;
    timezone: string;
    status: {
      code: string;
    };
    spanMultipleDays: boolean;
  };
  sales: {
    public: {
      startDateTime: string;
      endDateTime: string;
      startTBD: boolean;
    };
    presales: {
      name: string;
      description: string;
      url: string;
      startDateTime: string;
      endDateTime: string;
      info: string;
    }[];
  };
  pleaseNote: string;
  priceRanges: {
    type: string;
    currency: string;
    min: number;
    max: number;
  }[];
  promoter: {
    id: string;
    name: string;
    description: string;
  };
  promoters: any[];
  outlets: {
    productType: string;
  }[];
  products: any[];
  seatmap: {
    staticUrl: string;
  };
  accessibility: {
    info: string;
  };
  ticketLimit: {
    infos: {
      info: string;
    };
  };
  classifications: any[];
  place: {
    area: {
      name: string;
    },
    address: any;
    city: {
      name: string;
    },
    state: {
      stateCode: string;
      name: string;
    },
    country: {
      countryCode: string;
      name: string;
    },
    postalCode: string;
    location: {
      longitude: number;
      latitude: number;
    },
    name: string;
  };
  externalLinks: any;
  test: boolean;
  aliases: any[];
}

export interface PageDetails {
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
export interface AttractionDetailsWithVideos {
  attraction: Attraction;
  videos: any[]; // You can further refine this type if you know the shape of individual video objects
}

export interface MergedEventDetails extends EventDetails {
  youtubeVideos: any[];
}
export interface FlickrPhoto {
  farm: number;
  server: string;
  id: string;
  secret: string;
}
