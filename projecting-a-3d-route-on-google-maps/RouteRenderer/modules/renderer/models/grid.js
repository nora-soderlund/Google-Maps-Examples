import { RendererBuffers } from "../buffers.js";
export class RendererGridModel {
    static createBuffers(gl, options, animationFrame, paths) {
        let minX = NaN;
        let maxX = NaN;
        let minY = NaN;
        let maxY = NaN;
        for (let path of paths)
            for (let point of path.points) {
                if (window.isNaN(minX) || point.x < minX)
                    minX = point.x;
                if (window.isNaN(maxX) || point.x > maxX)
                    maxX = point.x;
                if (window.isNaN(minY) || point.y < minY)
                    minY = point.y;
                if (window.isNaN(maxY) || point.y > maxY)
                    maxY = point.y;
            }
        const padding = options.gridPadding ?? 1;
        const positions = [
            minY - padding,
            -0.002,
            maxX + padding,
            maxY + padding,
            -0.002,
            maxX + padding,
            maxY + padding,
            -0.002,
            minX - padding,
            minY - padding,
            -0.002,
            minX - padding // back left X
        ];
        const faceColors = [
            options.gridColor?.map((index) => index / 255) ?? [.5, 0, 0, 1]
        ];
        const indices = [
            0, 1, 2,
            0, 2, 3, // bottom
        ];
        const positionBuffer = RendererBuffers.initPositionBuffer(gl, positions);
        const colorBuffer = RendererBuffers.initColorBuffer(gl, faceColors);
        const indexBuffer = RendererBuffers.initIndexBuffer(gl, indices);
        return {
            verticles: positions.length / 2,
            position: positionBuffer,
            color: colorBuffer,
            indices: indexBuffer,
        };
    }
    ;
}
;
//# sourceMappingURL=grid.js.map