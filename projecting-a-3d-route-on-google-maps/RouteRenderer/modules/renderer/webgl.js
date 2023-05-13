export class RendererWebGL {
    static initializeProgram(context) {
        // Vertex shader program
        const vsSource = `
            attribute vec4 aVertexPosition;
            attribute vec4 aVertexColor;

            uniform mat4 uModelViewMatrix;
            uniform mat4 uProjectionMatrix;

            varying lowp vec4 vColor;

            void main(void) {
                gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
                vColor = aVertexColor;
            }
        `;
        // Fragment shader program
        const fsSource = `
            varying lowp vec4 vColor;

            void main(void) {
                gl_FragColor = vColor;
            }
        `;
        // Initialize a shader program; this is where all the lighting
        // for the vertices and so forth is established.
        const shaderProgram = RendererWebGL.initShaderProgram(context, vsSource, fsSource);
        if (!shaderProgram)
            throw new Error("shader program");
        // Collect all the info needed to use the shader program.
        // Look up which attributes our shader program is using
        // for aVertexPosition, aVertexColor and also
        // look up uniform locations.
        return {
            program: shaderProgram,
            attribLocations: {
                vertexPosition: context.getAttribLocation(shaderProgram, "aVertexPosition"),
                vertexColor: context.getAttribLocation(shaderProgram, "aVertexColor"),
            },
            uniformLocations: {
                projectionMatrix: context.getUniformLocation(shaderProgram, "uProjectionMatrix"),
                modelViewMatrix: context.getUniformLocation(shaderProgram, "uModelViewMatrix"),
            },
        };
    }
    ;
    static initShaderProgram(gl, vsSource, fsSource) {
        const vertexShader = this.loadShader(gl, gl.VERTEX_SHADER, vsSource);
        if (!vertexShader)
            throw new Error("vertex shader");
        const fragmentShader = this.loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
        if (!fragmentShader)
            throw new Error("fragment shader");
        // Create the shader program
        const shaderProgram = gl.createProgram();
        if (!shaderProgram)
            throw new Error("shader program");
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);
        // If creating the shader program failed, alert
        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            alert(`Unable to initialize the shader program: ${gl.getProgramInfoLog(shaderProgram)}`);
            return null;
        }
        return shaderProgram;
    }
    static loadShader(gl, type, source) {
        const shader = gl.createShader(type);
        if (!shader)
            throw new Error("shader");
        // Send the source to the shader object
        gl.shaderSource(shader, source);
        // Compile the shader program
        gl.compileShader(shader);
        // See if it compiled successfully
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert(`An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`);
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }
}
;
//# sourceMappingURL=webgl.js.map