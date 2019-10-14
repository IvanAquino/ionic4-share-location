import { Component } from '@angular/core';

import mapbox from 'mapbox-gl'
import { mykey } from '../../settings/mapbox'

import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Socket } from 'ngx-socket-io';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  private map: any;
  private center: any;
  // private myPositionMarker: any;
  private clientsMarkers: Array<any> = [];

  constructor(private geolocation: Geolocation, private socket: Socket) {
  }

  ionViewDidEnter(){
    this.geolocation.getCurrentPosition({enableHighAccuracy: true })
      .then(resp => {
        this.center = {
          latitude: resp.coords.latitude,
          longitude: resp.coords.longitude,
        }
        this.renderMap()
        this.socket.emit("set_position", this.center)
      })
  }

  listenPositionUser () {
    this.geolocation.watchPosition({ enableHighAccuracy: true })
      .subscribe(resp => {
        this.center.latitude = resp.coords.latitude;
        this.center.longitude = resp.coords.longitude;

        // this.myPositionMarker.setLngLat([ this.center.longitude, this.center.latitude ])
        this.socket.emit("set_position", this.center)
      })
  }
  listenClientsConnected () {
    this.socket.on("clients_update", clients => {
      
      clients.forEach(client => {
        let index = this.clientsMarkers.map(item => item.ref).indexOf(client.ref)
        if ( index == -1 ) {
          let marker = new mapbox.Marker().setLngLat([client.location.longitude, client.location.latitude]).addTo(this.map)
          this.clientsMarkers.push({
            ref: client.ref,
            marker: marker
          })
        } else {
          this.clientsMarkers[index].marker.setLngLat([client.location.longitude, client.location.latitude])
        }
      });

    })
  }

  renderMap ()
  {
    mapbox.accessToken = mykey

    this.map = new mapbox.Map({
      container: "map",
      style: 'mapbox://styles/lethans/ck171gqvt0wcd1clwjcgfaxfc',
      center: [this.center.longitude, this.center.latitude],
      zoom: 16
    })
    // this.myPositionMarker = new mapbox.Marker().setLngLat([this.center.longitude, this.center.latitude]).addTo(this.map)

    setTimeout(() => {
      this.listenPositionUser()
      this.listenClientsConnected()
    }, 1000)
  }

}
