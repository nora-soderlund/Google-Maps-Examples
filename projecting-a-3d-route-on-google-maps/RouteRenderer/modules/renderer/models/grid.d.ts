import { RendererOptions } from "../../renderer.js";
import { AnimationFrame } from "../animation.js";
export declare class RendererGridModel {
    static createBuffers(gl: WebGLRenderingContext, options: RendererOptions, animationFrame: AnimationFrame, paths: any[]): {
        verticles: number;
        position: WebGLBuffer | null;
        color: WebGLBuffer | null;
        indices: WebGLBuffer | null;
    };
}
//# sourceMappingURL=grid.d.ts.map