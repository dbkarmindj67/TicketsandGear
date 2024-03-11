export interface TicketEvent {
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
  },
  _embedded: {
    venues: any[],  // Assuming detailed structure would be provided elsewhere
    attractions: any[]  // Assuming detailed structure would be provided elsewhere
  },
  type: string,
  distance: number,
  units: string,
  location: {
    longitude: number,
    latitude: number,
  },
  id: string,
  locale: string,
  name: string,
  description: string,
  additionalInfo: string,
  url: string,
  images: {
    url: string,
    ratio: string,
    width: number,
    height: number,
    fallback: boolean,
    attribution: string
  }[],
  dates: {
    start: any,  // Assuming detailed structure would be provided elsewhere
    end: any,    // Assuming detailed structure would be provided elsewhere
    timezone: string,
    status: {
      code: string,
    },
    spanMultipleDays: boolean
  },
  sales: {
    public: {
      startDateTime: string,
      endDateTime: string,
      startTBD: boolean
    },
    presales: {
      name: string,
      description: string,
      url: string,
      startDateTime: string,
      endDateTime: string,
      info: string
    }[]
  },
  pleaseNote: string,
  priceRanges: {
    type: string,
    currency: string,
    min: number,
    max: number
  }[],
  promoter: {
    id: string,
    name: string,
    description: string
  },
  promoters: any[], // Assuming detailed structure would be provided elsewhere
  outlets: {
    productType: string
  }[],
  products: any[],  // Assuming detailed structure would be provided elsewhere
  seatmap: {
    staticUrl: string
  },
  accessibility: {
    info: string
  },
  ticketLimit: {
    infos: {
      info: string
    }
  },
  classifications: any[],  // Assuming detailed structure would be provided elsewhere
  place: {
    area: {
      name: string
    },
    address: any,  // Assuming detailed structure would be provided elsewhere
    city: {
      name: string
    },
    state: {
      stateCode: string,
      name: string
    },
    country: {
      countryCode: string,
      name: string
    },
    postalCode: string,
    location: {
      longitude: number,
      latitude: number
    },
    name: string
  },
  externalLinks: any,  // Assuming detailed structure would be provided elsewhere
  test: boolean,
  aliases: any[]  // Assuming detailed structure would be provided elsewhere
}
