import { RendererOptions } from "./renderer";
export declare class Projection {
    static getTileSize(zoomLevel: number): number;
    static getMercatorWorldCoordinateProjection(zoomLevel: number, latitude: number, longitude: number): {
        left: number;
        top: number;
    };
    static getPixelCoordinates(zoomLevel: number, leftWorldCoordinate: number, topWorldCoordinate: number): {
        left: number;
        top: number;
    };
    static projectToPixelCoordinate(point: {
        latitude: number;
        longitude: number;
        altitude: number;
    }, options: RendererOptions): {
        x: number;
        y: number;
        z: number;
    };
}
//# sourceMappingURL=projection.d.ts.map