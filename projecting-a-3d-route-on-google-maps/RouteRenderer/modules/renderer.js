import { Projection } from "./projection.js";
import { RendererGridModel } from "./renderer/models/grid.js";
import { RendererPathModel } from "./renderer/models/path.js";
import { RendererScene } from "./renderer/scene.js";
import { RendererWebGL } from "./renderer/webgl.js";
export default class Renderer {
    options;
    programInfo;
    paths = [];
    bufferers = [];
    animations = null;
    previousAnimationsLength = 0;
    deltaX = 0;
    deltaY = 0;
    previous = 0;
    constructor(options) {
        this.options = options;
        //window.requestAnimationFrame(this.render.bind(this));
    }
    ;
    setOptions(options) {
        this.options = { ...this.options, ...options };
    }
    ;
    setupContext(context) {
        this.programInfo = RendererWebGL.initializeProgram(context);
    }
    ;
    setPaths(paths, animations = null, project = true, projectionFunction) {
        let startLeft = NaN;
        let startTop = NaN;
        let minimumLeft = NaN;
        let maximumLeft = NaN;
        let minimumTop = NaN;
        let maximumTop = NaN;
        let minimumAltitude = NaN;
        let maximumAltitude = NaN;
        for (let path of paths)
            for (let coordinate of path) {
                if (!project) {
                    coordinate.projection = {
                        x: coordinate.x,
                        y: coordinate.y,
                        z: coordinate.z
                    };
                }
                else {
                    coordinate.projection = (projectionFunction ?? Projection.projectToPixelCoordinate).call(projectionFunction ?? Projection, coordinate, this.options);
                }
                if (window.isNaN(minimumAltitude) || coordinate.projection.z < minimumAltitude)
                    minimumAltitude = coordinate.projection.z;
                if (window.isNaN(maximumAltitude) || coordinate.projection.z > maximumAltitude)
                    maximumAltitude = coordinate.projection.z;
                if (window.isNaN(startLeft))
                    startLeft = coordinate.projection.x;
                if (window.isNaN(startTop))
                    startTop = coordinate.projection.y;
                if (window.isNaN(minimumLeft) || coordinate.projection.x < minimumLeft)
                    minimumLeft = coordinate.projection.x;
                if (window.isNaN(maximumLeft) || coordinate.projection.x > maximumLeft)
                    maximumLeft = coordinate.projection.x;
                if (window.isNaN(minimumTop) || coordinate.projection.y < minimumTop)
                    minimumTop = coordinate.projection.y;
                if (window.isNaN(maximumTop) || coordinate.projection.y > maximumTop)
                    maximumTop = coordinate.projection.y;
            }
        const centerLeft = (maximumLeft - minimumLeft) / 2;
        const centerTop = (maximumTop - minimumTop) / 2;
        const green = [0, 1, 0, 1];
        const red = [1, 0, 0, 1];
        if (this.options.keepMinimumAltitude)
            minimumAltitude = 0;
        this.paths = paths.map((path) => {
            const points = [];
            let fullDistance = 0;
            path.forEach((coordinate, index) => {
                const colorMultiplier = (coordinate.projection.z - minimumAltitude) / (maximumAltitude - minimumAltitude);
                let x = coordinate.projection.x;
                let y = coordinate.projection.y;
                if (!(this.options.keepMinimumPositions ?? false) && this.options.center) {
                    x = ((startLeft > coordinate.projection.x) ? (startLeft - coordinate.projection.x) : (coordinate.projection.x - startLeft));
                    y = ((startTop < coordinate.projection.y) ? (startTop - coordinate.projection.y) : (coordinate.projection.y - startTop));
                }
                else if (!(this.options.keepMinimumPositions ?? false)) {
                    x = coordinate.projection.x - startLeft;
                    y = startTop - coordinate.projection.y;
                }
                if (this.options.center ?? true) {
                    x -= centerLeft;
                    y += centerTop;
                }
                const z = (coordinate.projection.z - minimumAltitude);
                const distanceX = (index === 0) ? (0) : (Math.abs(x - points[index - 1].x));
                const distanceY = (index === 0) ? (0) : (Math.abs(y - points[index - 1].y));
                const distance = Math.sqrt(Math.pow(distanceX, 2) + Math.pow(distanceY, 2));
                const point = {
                    x, y, z,
                    distanceX,
                    distanceY,
                    distance,
                    distanceStart: fullDistance,
                    verticles: null,
                    color: (!this.options.elevationGradient) ? (coordinate.color?.map((index) => index / 255)) : ((this.options.elevationGradientColors) ? ([
                        ((this.options.elevationGradientColors[0][0] + (this.options.elevationGradientColors[1][0] - this.options.elevationGradientColors[0][0]) * colorMultiplier)) / 255,
                        ((this.options.elevationGradientColors[0][1] + (this.options.elevationGradientColors[1][1] - this.options.elevationGradientColors[0][1]) * colorMultiplier)) / 255,
                        ((this.options.elevationGradientColors[0][2] + (this.options.elevationGradientColors[1][2] - this.options.elevationGradientColors[0][2]) * colorMultiplier)) / 255,
                        ((this.options.elevationGradientColors[0][3] + (this.options.elevationGradientColors[1][3] - this.options.elevationGradientColors[0][3]) * colorMultiplier)) / 255
                    ]) : ([
                        (green[0] + (red[0] - green[0]) * colorMultiplier),
                        (green[1] + (red[1] - green[1]) * colorMultiplier),
                        (green[2] + (red[2] - green[2]) * colorMultiplier),
                        1.0
                    ]))
                };
                points.push(point);
                fullDistance += distance;
            });
            return {
                points,
                fullDistance
            };
        });
        this.animations = animations;
        this.bufferers = [];
    }
    ;
    getAnimationFrame(now = 0) {
        const frame = {
            distanceFraction: 1,
            elevationFraction: 1
        };
        if (this.animations) {
            const delta = now - this.previous;
            this.previous = now;
            for (let index = 0; index < this.animations.length; index++) {
                const animation = this.animations[index];
                if (!animation.progress) {
                    animation.progress = {
                        elapsed: 0
                    };
                }
                animation.progress.elapsed += delta;
                let fraction = Math.max(Math.min(animation.progress.elapsed / animation.interval, 1), 0);
                if (!animation.forwards)
                    fraction = 1 - fraction;
                if (fraction === ((animation.forwards) ? (1) : (0))) {
                    if (!animation.repeat) {
                        this.animations.splice(index, 1);
                        index--;
                    }
                    else {
                        animation.forwards = !animation.forwards;
                        delete animation.progress;
                    }
                }
                switch (animation.type) {
                    case "distance": {
                        frame.distanceFraction = fraction;
                        break;
                    }
                    case "elevation": {
                        frame.elevationFraction = fraction;
                        break;
                    }
                }
            }
        }
        return frame;
    }
    ;
    registerMouseEvents(canvas) {
        let mouseDown = false;
        let lastMouseX = null;
        let lastMouseY = null;
        canvas.addEventListener("mousedown", (event) => {
            mouseDown = true;
            lastMouseX = event.pageX;
            lastMouseY = event.pageY;
        });
        document.body.addEventListener("mouseup", (event) => {
            mouseDown = false;
        });
        document.body.addEventListener("mousemove", (event) => {
            if (!mouseDown || lastMouseX === null || lastMouseY === null) {
                return;
            }
            const newX = event.pageX;
            const newY = event.pageY;
            this.deltaX += newX - lastMouseX;
            this.deltaY += newY - lastMouseY;
            lastMouseX = newX;
            lastMouseY = newY;
        });
    }
    ;
    render(context, now, matrix) {
        if (!this.programInfo)
            throw new Error("Program info is not set up yet, you must call setupContext before rendering!");
        const animations = this.animations?.length ?? 0;
        if (this.bufferers.length !== this.paths.length || this.animations?.length || this.animations?.length !== this.previousAnimationsLength)
            this.bufferers = this.createBuffers(context, now);
        RendererScene.drawScene(context, this.programInfo, this.bufferers, this.options, {
            x: this.deltaX,
            y: this.deltaY
        }, matrix);
        this.previousAnimationsLength = animations;
        //window.requestAnimationFrame((now) => this.render(now, animations));
    }
    ;
    createBuffers(context, now) {
        const buffers = [];
        const animationFrame = this.getAnimationFrame(now);
        buffers.push(...this.paths.map((path) => RendererPathModel.createBuffers(context, path, this.options, animationFrame)));
        if (this.options.grid)
            buffers.push(RendererGridModel.createBuffers(context, this.options, animationFrame, this.paths));
        return buffers;
    }
    ;
}
;
//# sourceMappingURL=renderer.js.map