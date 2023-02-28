const loader = new google.maps.plugins.loader.Loader({
    apiKey: new URLSearchParams(window.location.search).get("key"),
    version: "weekly"
});

await loader.load();

new class CaptureMarkersWithDrawnPolygonsMap {
    element = document.getElementById("map");
    center = { lat: 58.3797077874133, lng: 12.324640529544448 };

    drawingEnabled = false;

    markers = [];
    selectedMarkers = [];
    eventListeners = [];
    coordinates = [];

    constructor() {
        this.map = new google.maps.Map(this.element, {
            center: this.center,
        
            zoom: 12
        });

        this.createCustomControl();

        this.createRandomMarkers();

        this.polygon = this.createPolygon();
    };

    createCustomControl() {
        this.brushControl = document.createElement("button");
        this.brushControl.className = "custom-control";
        this.brushControl.type = "button";

        this.setDrawingEnabled(false);
        
        this.brushControl.addEventListener("click", () => {
            this.setDrawingEnabled(!this.drawingEnabled);
        });
        
        const centerControl = document.createElement("div");
        centerControl.appendChild(this.brushControl);
        
        this.map.controls[google.maps.ControlPosition.TOP_CENTER].push(centerControl);
    };

    setDrawingEnabled(enabled) {
        this.drawingEnabled = enabled;
    
        if(!this.drawingEnabled) {
            this.map.setOptions({
                gestureHandling: "auto",
                keyboardShortcuts: true
            });
            
            this.brushControl.textContent = "Enable brush selection";
            this.brushControl.title = "Click to enable selecting markers by drawing";
    
            this.eventListeners.forEach((listener) => {
                google.maps.event.removeListener(listener);
            });
        }
        else {
            this.map.setOptions({
                gestureHandling: "none",
                keyboardShortcuts: false
            });
            
            this.brushControl.textContent = "Disable brush selection";
            this.brushControl.title = "Click to disable selecting markers by drawing";
    
            this.createDrawingEvents();
        }
    };

    createDrawingEvents() {
        let mousedown = false;
    
        this.eventListeners.push(this.map.addListener("mousedown", (event) => {
            mousedown = true;

            this.coordinates = [ event.latLng ];
            this.polygon.setPaths(this.coordinates);

            this.selectedMarkers.forEach((marker) => {
                marker.setAnimation(null);
            });
            
            this.selectedMarkers = [];
        }));

        this.eventListeners.push(this.map.addListener("mousemove", (event) => {
            if(!mousedown)
                return;

            this.coordinates.push(event.latLng);
            this.polygon.setPaths(this.coordinates);
        }));

        this.eventListeners.push(this.map.addListener("mouseup", (event) => {
            mousedown = false;

            this.coordinates.push(event.latLng);
            this.polygon.setPaths(this.coordinates);

            this.setDrawingEnabled(false);

            this.selectedMarkers = this.getMarkersInPolygon(this.polygon, this.markers);

            this.selectedMarkers.forEach((marker) => {
                marker.setAnimation(google.maps.Animation.BOUNCE);
            });
        }));
    };

    createRandomMarkers() {
        for(let index = 0; index < 20; index++) {
            this.markers.push(new google.maps.Marker({
                map: this.map,
                position: {
                    lat: this.center.lat + ((Math.random() - 0.5) / 10),
                    lng: this.center.lng + ((Math.random() - 0.5) / 10)
                }
            }));
        }
    };

    createPolygon() {
        return new google.maps.Polygon({
            map: this.map,
        
            clickable: false,
            
            strokeColor: "#4B91C3",
            strokeOpacity: 0.8,
            strokeWeight: 2,
        
            fillColor: "#4B91C3",
            fillOpacity: 0.5
        });
    };

    createBoundsFromPath(path) {
        const bounds = new google.maps.LatLngBounds();
    
        path.forEach((coordinate) => bounds.extend(coordinate));
    
        return bounds;
    };

    getMarkersInPolygon(polygon, markers) {
        const bounds = this.createBoundsFromPath(polygon.getPath());
    
        return markers.filter((marker) => {
            const position = marker.getPosition();
    
            if(!bounds.contains(position))
                return false;
    
            if(!google.maps.geometry.poly.containsLocation(position, polygon))
                return false;
    
            return true;
        });
    };
};
