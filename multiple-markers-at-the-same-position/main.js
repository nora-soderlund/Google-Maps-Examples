import MarkerBundle from "./MarkerBundle.js";

const loader = new google.maps.plugins.loader.Loader({
    apiKey: new URLSearchParams(window.location.search).get("key"),
    version: "weekly"
});

await loader.load();

new class MultipleMarkersAtTheSamePositionMap {
    element = document.getElementById("map");
    center = { lat: 58.3797077874133, lng: 12.324640529544448 };

    constructor() {
        this.map = new google.maps.Map(this.element, {
            center: this.center,
        
            zoom: 12
        });

        MarkerBundle.getMarkerImage().then((image) => {
            this.image = image;
            
            this.createMarkers();
        });
    };

    createMarkers() {
        const bundle = new MarkerBundle(this.map, this.center, this.image);

        const infowindow = new google.maps.InfoWindow({});

        for(let index = 0; index < 4; index++) {
            const marker = new google.maps.Marker({
                map: this.map,
                position: this.center
            });

            marker.addListener("click", (event) => {
                infowindow.setContent("Marker " + (index + 1));

                infowindow.open({
                    map: this.map,
                    anchor: bundle.marker
                });
            });
    
            bundle.addMarker(marker);
        }
    };
};
