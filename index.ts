/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

// This example requires the Drawing library. Include the libraries=drawing
// parameter when you first load the API. For example:
// <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=drawing">
let infoWindow: google.maps.InfoWindow;

function initMap(): void {
  const map = new google.maps.Map(
    document.getElementById("map") as HTMLElement,
    {
      center: { lat: 3.092516, lng: 101.579998 },
      zoom: 8,
    }
  );

  const drawingManager = new google.maps.drawing.DrawingManager({
    drawingMode: google.maps.drawing.OverlayType.MARKER,
    drawingControl: true,
    drawingControlOptions: {
      position: google.maps.ControlPosition.TOP_CENTER,
      drawingModes: [
        google.maps.drawing.OverlayType.MARKER,
        google.maps.drawing.OverlayType.CIRCLE,
        google.maps.drawing.OverlayType.POLYGON,
        google.maps.drawing.OverlayType.POLYLINE,
        google.maps.drawing.OverlayType.RECTANGLE,
      ],
    },
    polygonOptions: { editable: true },
    circleOptions: { editable: true,
      fillColor: "#ffff00",
      fillOpacity: 1,
      strokeWeight: 5,
      clickable: false,
      zIndex: 1,},
    polylineOptions: { editable: true },
    rectangleOptions: { editable: true },
    markerOptions: {
      icon: "https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png",
    },
    
  });

  
  drawingManager.setMap(map);
  google.maps.event.addListener(
    drawingManager,
    "polygoncomplete",
    function(polygon) {
      let polygonCoordsArray: string[] = [];
      let coords = polygon.getPath().getArray();

      for (let i = 0; i < coords.length; i++) {
        // console.log(coords[i].lat() + "," + coords[i].lng());
        polygonCoordsArray.push(
          coords[i].lat() + "," + coords[i].lng()
        );
      }
      console.log(polygonCoordsArray);
    }
  );

  google.maps.event.addListener(
    drawingManager,
    "circlecomplete",
    function showNewCir(circle) {
      const r = circle.getBounds()!.getCenter();
      const contentString =
      "<b>Circle created.</b><br>" +
      "Center of the circle: " +
      r.lat() +
      ", " +
      r.lng() 
      console.log(contentString);
    }
    );

  google.maps.event.addListener(
    drawingManager,
    "polylinecomplete",
    function(polyline) {
      let polylineCoordsArray: string[] = [];
      let coords = polyline.getPath().getArray();

      for (let i = 0; i < coords.length; i++) {
        // console.log(coords[i].lat() + "," + coords[i].lng());
        polylineCoordsArray.push(
          coords[i].lat() + "," + coords[i].lng()
        );
      }
      console.log(polylineCoordsArray);
    }
  );

  google.maps.event.addListener(
    drawingManager,
    "rectanglecomplete",
    function showNewReact(rectangle) {
      const ne = rectangle.getBounds()!.getNorthEast();
      const sw = rectangle.getBounds()!.getSouthWest();

      const contentString =
      "<b>Rectangle created.</b><br>" +
      "Upper-Left corner: " +
      ne.lat() +
      ", " +
      ne.lng() +
      "<br>" +
      "Lower_Right corner: " +
      sw.lat() +
      ", " +
      sw.lng();
      console.log(contentString);
    }
  );
}



declare global {
  interface Window {
    initMap: () => void;
  }
}
window.initMap = initMap;
export {};
