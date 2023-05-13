const searchParams = new URLSearchParams(window.location.search);

const loader = new google.maps.plugins.loader.Loader({
    apiKey: searchParams.get("key"),
    version: "weekly"
});

await loader.load();

new class ProjectingA3DRouteOnGoogleMaps {
    element = document.getElementById("map");
    bounds = new google.maps.LatLngBounds();

    constructor() {
        this.map = new google.maps.Map(this.element, {
            mapId: searchParams.get("mapId")
        });
        
        this.loadRoute("routes/activities_70300cf5-614d-4597-9b23-b57fa0426fa2.json").then((sessions) => {
            const paths = this.createPathsFromSessions(sessions);

            const renderer = new RouteRenderer.Renderer({
                topColor: [ 187, 135, 252, 255 ],
                wallColor: [ 23, 26, 35, 255 ],

                elevationGradient: true,
                
                cameraRotation: [ 0, 90 * (Math.PI / 180), 0 ],
                cameraTranslation: [ 0, 0, 0 ],

                wallWidth: 300,

                grid: false,
                gridPadding: 10000
            });
            
            const webglOverlayView = new RouteRenderer.WebGLOverlayView(renderer, paths);

            webglOverlayView.setMap(this.map);

            this.map.fitBounds(this.bounds);

            this.map.setTilt(45);
            this.map.setHeading(-30);
        });
    };

    async loadRoute(route) {
        const response = await fetch(route);
        const result = await response.json();

        return result;
    };

    createPathsFromSessions(sessions) {
        return sessions.map((session) => session.locations.map((location, index) => {
            this.bounds.extend({
                lat: location.coords.latitude,
                lng: location.coords.longitude
            });

            return {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                altitude: location.coords.altitude + (index * .5)
            };
        }));
    };
};
