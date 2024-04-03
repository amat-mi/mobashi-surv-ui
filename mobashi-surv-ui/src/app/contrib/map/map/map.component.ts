import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewContainerRef } from '@angular/core';

import { LngLat, Map, StyleSpecification } from 'maplibre-gl';

// @ts-ignore
import * as MaplibreGeocoder from '@maplibre/maplibre-gl-geocoder';
import maplibregl from "maplibre-gl";
import { MapService } from '../map.service';


export type ConfirmEvent = {
  address: string;
  lng: number;
  lat: number;
}


@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit, AfterViewInit {
  _style!: StyleSpecification | string;

  private geocoderApi: any;
  private routingApi: any;
  private geocoder?: MaplibreGeocoder;
  private map?: Map;          // MapLibre GL Map object (MapLibre is ran outside angular zone)

  @Input() style?: StyleSpecification | string;
  @Input() styleName?: string;
  @Input() coords?: [number, number];         //lng, lat
  @Input() address?: string;
  @Input() bounds?: [number, number, number, number];         //[west lng, south lat, east lng, north lat]
  @Input() interactive?: boolean = true;
  @Input() fromTo?: [number, number, number, number];         //[from lng, from lat, to lng, to lat]
  @Output() confirmation = new EventEmitter<ConfirmEvent>();

  constructor(
    private viewContainerRef: ViewContainerRef,
    private service: MapService
  ) {
    this.geocoderApi = {
      forwardGeocode: async (config: { query: any; }) => {
        const features = [];
        try {
          const request = this.service.geocode.forwardUrl(config);
          const response = await fetch(request);
          const geojson = await response.json();
          for (const feature of geojson.features) {
            const center = feature.bbox ? [
              feature.bbox[0] +
              (feature.bbox[2] - feature.bbox[0]) / 2,
              feature.bbox[1] +
              (feature.bbox[3] - feature.bbox[1]) / 2
            ] : feature.geometry.coordinates;
            const point = {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: center
              },
              place_name: feature.properties.display_name ?? feature.properties.label,
              properties: feature.properties,
              text: feature.properties.display_name ?? feature.properties.label,
              place_type: ['place'],
              center
            };
            features.push(point);
          }
        } catch (e) {
          console.error(`Failed to forwardGeocode with error: ${e}`);
        }

        return {
          features
        };
      },
      reverseGeocode: async (config: { query: any; }) => {
        const features = [];
        try {
          const request = this.service.geocode.reverseUrl(config);
          const response = await fetch(request);
          const geojson = await response.json();
          for (const feature of geojson.features) {
            const center = feature.bbox ? [
              feature.bbox[0] +
              (feature.bbox[2] - feature.bbox[0]) / 2,
              feature.bbox[1] +
              (feature.bbox[3] - feature.bbox[1]) / 2
            ] : feature.geometry.coordinates;
            const point = {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: center
              },
              place_name: feature.properties.display_name ?? feature.properties.label,
              properties: feature.properties,
              text: feature.properties.display_name ?? feature.properties.label,
              place_type: ['place'],
              center
            };
            features.push(point);
          }
        } catch (e) {
          console.error(`Failed to forwardGeocode with error: ${e}`);
        }

        return {
          features
        };
      }
    }

    this.routingApi = {
      directions: async (config: { query: any; }) => {
        try {
          const request = this.service.routing.directionsUrl(config);
          const response = await fetch(request);
          const json = await response.json();
          const coordinates: any[] = [];
          for (const part of json.result.path) {
            coordinates.push([part[1], part[2]]);
          }

          const ls = {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: coordinates
            },
          }

          return ls;
        } catch (e) {
          console.error(`Failed directions with error: ${e}`);
          throw (e);
        }
      },
    }
  }

  ngOnInit() {
    this._style = this.style ?? this.service.getStyle(this.styleName);
  }

  public showDirections(lng_from: number, lat_from: number, lng_to: number, lat_to: number) {
    const ls = this.routingApi.directions({
      profile: 'car',
      service: 'pgrouting',
      lng_from, lat_from, lng_to, lat_to
    });

    const map = this.map!;          //avoid using "!" all the time
    map.addSource('route', {
      'type': 'geojson',
      'data': {
        'type': 'Feature',
        'properties': {},
        'geometry': ls
      }
    });

    map.addLayer({
      'id': 'route',
      'type': 'line',
      'source': 'route',
      'layout': {
        'line-join': 'round',
        'line-cap': 'round'
      },
      'paint': {
        'line-color': '#888',
        'line-width': 8
      }
    });
  }

  public confirm() {
    const lngLat: LngLat = this.map!.getCenter();
    console.log(lngLat);
    if (!!this.geocoder) {
      this.geocoder.query(`${lngLat.lng}, ${lngLat.lat}`);
    }
  }

  private _preventEnter(ev: any) {
    if (ev.keyCode === 13) {
      ev.preventDefault();
    }
  }

  ngAfterViewInit(): void {
    const form = this.viewContainerRef.element.nativeElement.closest('form');
    if (!!form) {
      form.removeEventListener('keypress', this._preventEnter);
      form.addEventListener('keypress', this._preventEnter);
    }
  }

  mapLoad(maplibreMap: any) {
    this.map = maplibreMap;
    const map = this.map!;          //avoid using "!" all the time

    map.setMaxZoom(19);             //do not zoom in too much (needed when geocoder fits map to results bounds)

    // remove coords if empty
    if (this.coords?.length != 2)
      this.coords = undefined;
    else
      if (this.coords[0] == null || this.coords[1] == null)
        this.coords = undefined;


    if (!!this.fromTo) {
      this.showDirections(...this.fromTo);
    }

    //if a static map was requested, do not create the geocoder, but nonetheless show what was requested
    if (this.interactive === false) {
      if (!!this.coords) {
        map.flyTo({ center: this.coords, zoom: 19 });
      } else
        if (!!this.bounds) {
          map.fitBounds(this.bounds);
        }

      return;                                   //nothing more to do
    }

    //could this happens more than once???
    this.geocoder = new MaplibreGeocoder(this.geocoderApi, {
      maplibregl,
      showResultsWhileTyping: false,
      popup: false,                //avoid the popup (it is not styled nicely)
      reverseGeocode: true,
      marker: {
        className: "geocoder_result_marker",
        draggable: true
      }
    });

    this.geocoder.on("result", (selected: any) => {
      console.log(selected);
      const result = selected?.result;
      if (!!result?.place_name && !!result?.center)
        this.confirmation.emit({
          address: result.place_name,
          lng: result.center[0],
          lat: result.center[1],
        });
    });

    map.addControl(this.geocoder);

    if (!!this.address && !this.coords) {
      this.geocoder.setInput(this.address);
      this.geocoder.query(this.address);
    } else
      if (!this.address && !!this.coords) {
        this.geocoder.query(`${this.coords[0]}, ${this.coords[1]}`);      //lng, lat
      } else
        if (!!this.address && !!this.coords) {
          map.flyTo({ center: this.coords, zoom: 19 });
          this.confirmation.emit({
            address: this.address,
            lng: this.coords[0],
            lat: this.coords[1],
          });
        } else
          if (!!this.bounds) {
            map.fitBounds(this.bounds);
          }
  }
}
