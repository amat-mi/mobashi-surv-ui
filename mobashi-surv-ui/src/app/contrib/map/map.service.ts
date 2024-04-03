import { Inject, Injectable } from '@angular/core';


const DEFAULT_STYLE_DEFS = [
  {
    name: 'osm',
    label: 'OpenStreetMap',
    style: {
      "version": 8,
      "center": [9.0953314, 45.4627042],      //lng, lat
      "zoom": 12,
      "sources": {
        "osm": {
          "type": "raster",
          "tiles": ["https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"],
          "tileSize": 256,
          "attribution": "&copy; OpenStreetMap Contributors",
          "maxzoom": 19
        }
      },
      "layers": [
        {
          "id": "osm",
          "type": "raster",
          "source": "osm" // This must match the source key above
        }
      ]
    }
  }
];

const DEFAULT_GEOCODE = {
  forwardUrl: (config: any) => `https://nominatim.openstreetmap.org/search?q=${config.query}&format=geojson&polygon_geojson=1&addressdetails=1`,
  reverseUrl: (config: any) => `https://nominatim.openstreetmap.org/search?q=${config.query}&format=geojson&polygon_geojson=1&addressdetails=1`,
};

const DEFAULT_ROUTING = {
  directionsUrl: (config: any) => `http://localhost:4001/rout/directions?service=pgrouting&profile=${config.profile}&lat_from=${config.lat_from}&lng_from=${config.lng_from}&lat_to=${config.lat_to}&lng_to=${config.lng_to}`,
};


@Injectable()
export class MapServiceOptions {
  styleDefs?: any[];
  geocode?: {
    forwardUrl: (config: any) => string,
    reverseUrl: (config: any) => string,
  };
  routing?: {
    directionsUrl: (config: any) => string,
  };
}


type MapServiceConfig = {
  styleDefs: any[];
  geocode: {
    forwardUrl: (config: any) => string,
    reverseUrl: (config: any) => string,
  };
  routing: {
    directionsUrl: (config: any) => string,
  };
}


@Injectable({
  providedIn: 'root'
})
export class MapService {
  private readonly config: MapServiceConfig;

  constructor(
    @Inject(MapServiceOptions) private options?: MapServiceOptions
  ) {
    this.config = {
      styleDefs: this.options?.styleDefs?.length ? this.options?.styleDefs : DEFAULT_STYLE_DEFS,
      geocode: this.options?.geocode ?? DEFAULT_GEOCODE,
      routing: this.options?.routing ?? DEFAULT_ROUTING
    };
  }

  public getStyle(styleName?: string) {
    const styleDef = styleName ?
      this.config.styleDefs.find((styleDef) => styleDef.name == styleName) :
      this.config.styleDefs[0];

    return styleDef.style;
  }

  public get geocode() {
    return this.config.geocode;
  }

  public get routing() {
    return this.config.routing;
  }
}

export const provideMapService = (options?: MapServiceOptions) => {
  return {
    provide: MapService,
    useFactory: (
    ) => new MapService(options),
    deps: [
    ]
  }
};
