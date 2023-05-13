import { RendererBuffers } from "../buffers.js";
export class RendererPathModel {
    static createBuffers(gl, path, options, animationFrame) {
        const positions = [];
        const faceColors = [];
        const indices = [];
        let indexForIndices = 0;
        let distance = 0;
        const breakingPoint = path.fullDistance * animationFrame.distanceFraction;
        for (let index = 1; index < path.points.length; index++) {
            const from = path.points[index - 1];
            const to = path.points[index];
            const fromElevation = from.z * animationFrame.elevationFraction;
            const toElevation = to.z * animationFrame.elevationFraction;
            let pointFraction = 1.0;
            distance = to.distanceStart;
            const leftWallColor = to.color ?? (options.leftWallColor ?? options.wallColor)?.map((index) => index / 255) ?? [0, 1, 0, 1];
            const rightWallColor = to.color ?? (options.rightWallColor ?? options.wallColor)?.map((index) => index / 255) ?? [0, 0, 1, 1];
            const topColor = options.topColor?.map((index) => index / 255) ?? [1, 0, 0, 1];
            const bottomColor = options.bottomColor?.map((index) => index / 255) ?? [0, 0, 0, 1];
            const endBlockColor = to.color ?? (options.endBlockColor ?? options.wallColor)?.map((index) => index / 255) ?? [0, 0, 0, 1];
            const startBlockColor = to.color ?? (options.startBlockColor ?? options.wallColor)?.map((index) => index / 255) ?? [0, 0, 0, 1];
            if (distance > breakingPoint)
                break;
            if (breakingPoint < (distance + to.distance))
                pointFraction = Math.max(0, Math.min((breakingPoint - to.distanceStart) / to.distance, 1));
            const difference = {
                x: (to.x - from.x),
                y: (to.y - from.y)
            };
            const from3 = vec3.fromValues(from.y, from.x, fromElevation);
            const to3 = vec3.fromValues(from.y + (difference.y * pointFraction), from.x + (difference.x * pointFraction), toElevation);
            const direction = vec3.sub(vec3.create(), to3, from3);
            const perpendicular = vec3.normalize(vec3.create(), [-direction[1], direction[0], 0]);
            const halfWidth = (options.wallWidth ?? .1) / 2;
            const topVertices = [
                vec3.add(vec3.create(), from3, vec3.scale(vec3.create(), perpendicular, halfWidth)),
                vec3.add(vec3.create(), to3, vec3.scale(vec3.create(), perpendicular, halfWidth))
            ];
            const bottomVertices = [
                vec3.sub(vec3.create(), from3, vec3.scale(vec3.create(), perpendicular, halfWidth)),
                vec3.sub(vec3.create(), to3, vec3.scale(vec3.create(), perpendicular, halfWidth))
            ];
            // the main tunnel
            {
                // left wall
                positions.push(bottomVertices[0][0], // back left Y (bottom)
                0.0, bottomVertices[0][1], // back left X (bottom)
                bottomVertices[0][0], // back left Y (top)
                fromElevation, bottomVertices[0][1], // back left X (top)
                bottomVertices[1][0], // front left Y (top)
                toElevation, bottomVertices[1][1], // front left X (top)
                bottomVertices[1][0], // front left Y (bottom)
                0.0, bottomVertices[1][1] // front left X (bottom)
                );
                // right wall
                positions.push(topVertices[0][0], // back right Y (bottom)
                0.0, topVertices[0][1], // back right X (bottom)
                topVertices[0][0], // back right Y (top)
                fromElevation, topVertices[0][1], // back right X (top)
                topVertices[1][0], // front right Y (top)
                toElevation, topVertices[1][1], // front right X (top)
                topVertices[1][0], // front right Y (bottom)
                0.0, topVertices[1][1] // front right X (bottom)
                );
                // top face
                positions.push(topVertices[0][0], // back right Y
                topVertices[0][2], topVertices[0][1], // back right X
                topVertices[1][0], // top right Y
                topVertices[1][2], topVertices[1][1], // top right X
                bottomVertices[1][0], // top left Y
                bottomVertices[1][2], bottomVertices[1][1], // top left X,
                bottomVertices[0][0], // back left Y
                bottomVertices[0][2], bottomVertices[0][1] // back left X
                );
                // bottom face
                positions.push(topVertices[0][0], // back right Y
                -0.001, topVertices[0][1], // back right X
                topVertices[1][0], // top right Y
                -0.001, topVertices[1][1], // top right X
                bottomVertices[1][0], // top left Y
                -0.001, bottomVertices[1][1], // top left X,
                bottomVertices[0][0], // back left Y
                -0.001, bottomVertices[0][1] // back left X
                );
                faceColors.push(...[
                    leftWallColor,
                    rightWallColor,
                    topColor,
                    bottomColor // bottom face
                ]);
                indices.push(...([
                    0, 1, 2,
                    0, 2, 3,
                    4, 5, 6,
                    4, 6, 7,
                    8, 9, 10,
                    8, 10, 11,
                    12, 13, 14,
                    12, 14, 15, // bottom
                ].map((number) => indexForIndices + number)));
                indexForIndices += 16;
            }
            to.verticles = {
                frontRightX: topVertices[1][1],
                frontRightY: topVertices[1][0],
                frontRightZ: topVertices[1][2],
                frontLeftX: bottomVertices[1][1],
                frontLeftY: bottomVertices[1][0],
                frontLeftZ: bottomVertices[1][2]
            };
            // the connecting tunnel
            if (from.verticles) {
                positions.push(
                // left face
                from.verticles.frontLeftY, // back left Y (bottom)
                0.0, from.verticles.frontLeftX, // back left X (bottom)
                from.verticles.frontLeftY, // back left Y (top)
                from.verticles.frontLeftZ, from.verticles.frontLeftX, // back left X (top)
                bottomVertices[0][0], // front left Y (top)
                bottomVertices[0][2], bottomVertices[0][1], // front left X (top)
                bottomVertices[0][0], // front left Y (bottom)
                0.0, bottomVertices[0][1] // front left X (bottom)
                );
                positions.push(
                // right face
                from.verticles.frontRightY, // back right Y (bottom)
                0.0, from.verticles.frontRightX, // back right X (bottom)
                from.verticles.frontRightY, // back right Y (top)
                from.verticles.frontRightZ, from.verticles.frontRightX, // back right X (top)
                topVertices[0][0], // front right Y (top)
                topVertices[0][2], topVertices[0][1], // front right X (top)
                topVertices[0][0], // front right Y (bottom)
                0.0, topVertices[0][1] // front right X (bottom)
                );
                positions.push(from.verticles.frontRightY, // back right Y
                from.verticles.frontRightZ, from.verticles.frontRightX, // back right X
                topVertices[0][0], // top right Y
                topVertices[0][2], topVertices[0][1], // top right X
                bottomVertices[0][0], // top left Y
                bottomVertices[0][2], bottomVertices[0][1], // top left X,
                from.verticles.frontLeftY, // back left Y
                from.verticles.frontLeftZ, from.verticles.frontLeftX // back left X
                );
                // bottom face
                positions.push(from.verticles.frontRightY, // back right Y
                -0.001, from.verticles.frontRightX, // back right X
                topVertices[0][0], // top right Y
                -0.001, topVertices[0][1], // top right X
                bottomVertices[0][0], // top left Y
                -0.001, bottomVertices[0][1], // top left X,
                from.verticles.frontLeftY, // back left Y
                -0.001, from.verticles.frontLeftX // back left X
                );
                faceColors.push(...[
                    leftWallColor,
                    rightWallColor,
                    topColor,
                    bottomColor // bottom face
                ]);
                indices.push(...([
                    0, 1, 2,
                    0, 2, 3,
                    4, 5, 6,
                    4, 6, 7,
                    8, 9, 10,
                    8, 10, 11,
                    12, 13, 14,
                    12, 14, 15, // bottom
                ].map((number) => indexForIndices + number)));
                indexForIndices += 16;
            }
            if (index === path.points.length - 1) {
                // final wall
                positions.push(
                // left face
                topVertices[1][0], // back left Y (bottom)
                0.0, topVertices[1][1], // back left X (bottom)
                topVertices[1][0], // back left Y (top)
                toElevation, topVertices[1][1], // back left X (top)
                bottomVertices[1][0], // front left Y (top)
                toElevation, bottomVertices[1][1], // front left X (top)
                bottomVertices[1][0], // front left Y (bottom)
                0.0, bottomVertices[1][1] // front left X (bottom)
                );
                faceColors.push(...[
                    endBlockColor
                ]);
                indices.push(...([
                    0, 1, 2,
                    0, 2, 3, // front
                ].map((number) => indexForIndices + number)));
                indexForIndices += 4;
            }
            else if (index === 1) {
                // initial wall
                positions.push(
                // left face
                bottomVertices[0][0], // back left Y (bottom)
                0.0, bottomVertices[0][1], // back left X (bottom)
                bottomVertices[0][0], // back left Y (top)
                from.z, bottomVertices[0][1], // back left X (top)
                topVertices[0][0], // front left Y (top)
                from.z, topVertices[0][1], // front left X (top)
                topVertices[0][0], // front left Y (bottom)
                0.0, topVertices[0][1] // front left X (bottom)
                );
                faceColors.push(...[
                    startBlockColor
                ]);
                indices.push(...([
                    0, 1, 2,
                    0, 2, 3, // front
                ].map((number) => indexForIndices + number)));
                indexForIndices += 4;
            }
        }
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
}
;
//# sourceMappingURL=path.js.map