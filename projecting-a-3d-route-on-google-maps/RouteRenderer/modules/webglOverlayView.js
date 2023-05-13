export default class RouteWebGLOverlayView {
    constructor(renderer, paths) {
        const overlay = new google.maps.WebGLOverlayView();
        overlay.onAdd = overlay.onStateUpdate = overlay.onContextLost = overlay.onRemove = () => { };
        overlay.onContextRestored = ({ gl }) => {
            renderer.setOptions({
                autoClear: false,
                center: false,
                keepPerspectiveProjection: false
            });
            renderer.setupContext(gl);
        };
        overlay.onDraw = ({ gl, transformer }) => {
            if (!renderer.paths.length) {
                renderer.setPaths(paths, null, true, (point, options) => {
                    const matrix = transformer.fromLatLngAltitude({
                        lat: point.latitude,
                        lng: point.longitude,
                        altitude: 0,
                    });
                    const inverseMatrix = mat4.create();
                    const homogeneousCoord = vec4.fromValues(0, 0, 0, 1);
                    const result = vec4.create();
                    mat4.invert(inverseMatrix, matrix);
                    vec4.transformMat4(result, homogeneousCoord, inverseMatrix);
                    return {
                        x: result[1] / 3 * 2,
                        y: result[0] / 3 * 2,
                        z: point.altitude * 20
                    };
                });
            }
            // Render objects.
            const matrix = transformer.fromLatLngAltitude({
                lat: paths[0][0].latitude,
                lng: paths[0][0].longitude,
                altitude: 0,
            });
            overlay.requestRedraw();
            renderer.render(gl, performance.now(), matrix);
        };
        return overlay;
    }
    ;
}
;
//# sourceMappingURL=webglOverlayView.js.map