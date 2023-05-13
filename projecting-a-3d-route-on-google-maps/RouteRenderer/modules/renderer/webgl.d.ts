export declare class RendererWebGL {
    static initializeProgram(context: WebGLRenderingContext): {
        program: WebGLProgram;
        attribLocations: {
            vertexPosition: number;
            vertexColor: number;
        };
        uniformLocations: {
            projectionMatrix: WebGLUniformLocation | null;
            modelViewMatrix: WebGLUniformLocation | null;
        };
    };
    static initShaderProgram(gl: WebGLRenderingContext, vsSource: any, fsSource: any): WebGLProgram | null;
    static loadShader(gl: WebGLRenderingContext, type: any, source: any): WebGLShader | null;
}
//# sourceMappingURL=webgl.d.ts.map