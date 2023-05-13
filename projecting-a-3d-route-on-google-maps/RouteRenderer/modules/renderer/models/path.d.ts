import { RendererOptions } from "../../renderer.js";
import { AnimationFrame } from "../animation.js";
export declare class RendererPathModel {
    static createBuffers(gl: WebGLRenderingContext, path: any, options: RendererOptions, animationFrame: AnimationFrame): {
        verticles: number;
        position: WebGLBuffer | null;
        color: WebGLBuffer | null;
        indices: WebGLBuffer | null;
    };
}
//# sourceMappingURL=path.d.ts.map