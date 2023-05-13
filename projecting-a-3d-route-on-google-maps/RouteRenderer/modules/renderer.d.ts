import { Animation } from "./renderer/animation.js";
export type RendererOptions = {
    topColor?: number[];
    bottomColor?: number[];
    startBlockColor?: number[];
    endBlockColor?: number[];
    leftWallColor?: number[];
    rightWallColor?: number[];
    wallColor?: number[];
    wallWidth?: number;
    elevationGradient?: boolean;
    elevationGradientColors?: number[][];
    center?: boolean;
    autoClear?: boolean;
    keepMinimumAltitude?: boolean;
    keepPerspectiveProjection?: boolean;
    keepMinimumPositions?: boolean;
    projectionZoomLevel?: number;
    cameraFov?: number;
    cameraTranslation?: number[];
    cameraRotation?: number[];
    grid?: boolean;
    gridColor?: number[];
    gridPadding?: number;
};
export default class Renderer {
    private options;
    private programInfo;
    paths: any[];
    private bufferers;
    private animations;
    private previousAnimationsLength;
    private deltaX;
    private deltaY;
    private previous;
    constructor(options: RendererOptions);
    setOptions(options: RendererOptions): void;
    setupContext(context: WebGLRenderingContext): void;
    setPaths(paths: any[][], animations?: Animation[] | null, project?: boolean, projectionFunction?: (point: {
        latitude: number;
        longitude: number;
        altitude: number;
    }, options: RendererOptions) => {
        x: number;
        y: number;
        z: number;
    }): void;
    private getAnimationFrame;
    registerMouseEvents(canvas: HTMLCanvasElement): void;
    render(context: WebGLRenderingContext, now: number, matrix?: Float64Array): void;
    private createBuffers;
}
//# sourceMappingURL=renderer.d.ts.map