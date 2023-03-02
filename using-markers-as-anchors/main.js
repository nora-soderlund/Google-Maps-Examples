const loader = new google.maps.plugins.loader.Loader({
    apiKey: new URLSearchParams(window.location.search).get("key"),
    version: "weekly"
});

await loader.load();

new class UsingMarkersAsAnchorsMap {
    element = document.getElementById("map");

    constructor() {
        this.map = new google.maps.Map(this.element, {
            center: {
                lat: 52.36994132457453,
                lng: 4.8998902330155545
            },
        
            zoom: 12
        });

        this.createMarker();
        this.addMarkerEvents();
    };

    createMarker() {
        this.marker = new google.maps.Marker({
            map: this.map,

            title: "Click for directions to Amsterdam.",
            
            position: {
                lat: 52.36994132457453,
                lng: 4.8998902330155545
            }
        });
    };

    addMarkerEvents() {
        this.marker.addListener("mouseover", () => {
            this.element.setAttribute("href", "https://www.google.com/maps/dir/?api=1&destination=Amsterdam");
        });
        
        this.marker.addListener("mouseout", () => {
            this.element.removeAttribute("href");
        });
    };
};
