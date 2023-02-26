let map;

function initMap() {
    const center = { lat: 58.37998567828405, lng: 12.324005380902785 };

    map = new google.maps.Map(document.getElementById("map"), {
        center,
        zoom: 12,
    });

    const markers = [];

    for(let index = 0; index < 20; index++) {
        markers.push(new google.maps.Marker({
            map,
            position: {
                lat: center.lat + ((Math.random() - 0.5) / 10),
                lng: center.lng + ((Math.random() - 0.5) / 10)
            }
        }));
    }
    
    const polygon = new google.maps.Polygon({
        map,

        clickable: false,
        
        strokeColor: "#FF0000",
        strokeOpacity: 0.8,
        strokeWeight: 2,

        fillColor: "#FF0000",
        fillOpacity: 0.35,
    });

    function createBoundsFromPath() {
        const bounds = new google.maps.LatLngBounds();

        brushPolygon.forEach((coordinate) => bounds.extend(coordinate));

        return bounds;
    };

    function getMarkersInPath() {
        const bounds = createBoundsFromPath();

        return markers.filter((marker) => {
            const position = marker.getPosition();

            if(!bounds.contains(position))
                return false;

            if(!google.maps.geometry.poly.containsLocation(position, polygon))
                return false;

            return true;
        });
    };

    let brushPolygon = [], brushListeners = [], brushInfoWindows = [];

    let brushEnabled = false;
    
    const brushControl = document.createElement("button");
    brushControl.className = "custom-control";
    brushControl.type = "button";

    function setBrushState(state) {
        brushEnabled = state;

        if(!brushEnabled) {
            brushControl.textContent = "Enable brush selection";
            brushControl.title = "Click to enable selecting markers by drawing"

            map.setOptions({
                gestureHandling: "auto",
                keyboardShortcuts: true
            });

            brushListeners.forEach((listener) => {
                google.maps.event.removeListener(listener);
            });
        }
        else {
            brushControl.textContent = "Disable brush selection";
            brushControl.title = "Click to disable selecting markers by drawing"

            map.setOptions({
                gestureHandling: "none",
                keyboardShortcuts: false
            });

            let mousedown = false;

            brushListeners.push(map.addListener("mousedown", (event) => {
                mousedown = true;

                brushPolygon = [ event.latLng ];
                polygon.setPaths(brushPolygon);

                brushInfoWindows.forEach((infoWindow) => {
                    infoWindow.close();
                });

                brushInfoWindows = [];
            }));

            brushListeners.push(map.addListener("mousemove", (event) => {
                if(!mousedown)
                    return;

                brushPolygon.push(event.latLng);
                polygon.setPaths(brushPolygon);
            }));

            brushListeners.push(map.addListener("mouseup", (event) => {
                mousedown = false;

                brushPolygon.push(event.latLng);
                polygon.setPaths(brushPolygon);

                const selectedMarkers = getMarkersInPath();

                selectedMarkers.forEach((marker) => {
                    const infoWindow = new google.maps.InfoWindow({
                        content: "I'm selected!"
                    });

                    infoWindow.open({
                        map,
                        anchor: marker
                    });

                    brushInfoWindows.push(infoWindow);
                });

                setBrushState(false);
            }));
        }
    };

    setBrushState(false);

    brushControl.addEventListener("click", () => {
        setBrushState(!brushEnabled);
    });

    const centerControl = document.createElement("div");
    centerControl.appendChild(brushControl);
  
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(centerControl);
}

window.initMap = initMap;
