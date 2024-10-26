/**
 * This is a simple WebGL program that draws a triangle with colors, based on the challenge here:
 * 
 * https://x.com/lynxluna/status/1849840886827581869
 * 
 * which is to draw a triangle as the example shown in the tweet, without using any libraries.
 * 
 * @author Arie M. Prasetyo
 * @version 0.1
 */

// get the canvas element, bruh
const canvas = document.getElementById('leCanvas')
if (!canvas) {
  console.error('Canvas not found :(')
}

// make sure we have WebGL support
const gl = canvas.getContext('webgl')
if (!gl) {
  console.error('WebGL not supported :(')
}

/**
 * Create a shader object
 * 
 * A shader is a program that runs on the GPU. It takes in vertex data and outputs a color for each pixel.
 * This function is used in createProgram() to create the vertex and fragment shaders.
 * 
 * @param {WebGLRenderingContext} gl The WebGL rendering context.
 * @param {number} type The type of shader (gl.VERTEX_SHADER or gl.FRAGMENT_SHADER).
 * @param {string} source The source code of the shader.
 * 
 * @returns {WebGLShader} The shader object.
 */
function createShader(gl, type, source) {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }

  return shader
}

/**
 * Create a program object
 * 
 * A program object is a combination of vertex and fragment shaders.
 * 
 * @param {WebGLRenderingContext} gl The WebGL rendering context.
 * @param {string} vertexShaderSource The source code of the vertex shader.
 * @param {string} fragmentShaderSource The source code of the fragment shader.
 * 
 * @returns {WebGLProgram} The program object.
 */
function createProgram(gl, vertexShaderSource, fragmentShaderSource) {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)
  const program = gl.createProgram()

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program)

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program))
    return null
  }

  return program;
}

// THE SHADERS!!!! ========================================

/**
 * The vertex shader receives the following inputs:
 * points: The position of the vertex.
 * 
 * The vertex shader outputs the following:
 * gl_Position: The position of the vertex in clip space.
 * */
const vertShader = `
attribute vec2 a_points;

attribute vec4 a_colors;
varying vec4 v_colors;

void main() {
  gl_Position = vec4(a_points, 0, 1);

  /* pass the colors attribute to the fragment */
  v_colors = a_colors;
}
`;

/**
 * The fragment shader receives the following inputs:
 * u_Color: The color passed from the program.
 * 
 * The fragment shader outputs the following:
 * gl_FragColor: The color of the fragment.
 * */
const fragShader = `
#ifdef GL_ES
precision mediump float;
#endif

varying vec4 v_colors;

void main() {
  gl_FragColor = v_colors;
}
`;


// Create a program object
// This program will use the vertex and fragment shaders defined in the HTML
const program = createProgram(gl, vertShader, fragShader)
if (!program) {
  console.error('Failed to create program :(');
}

// LET THE DRAWING BEGIN!

/**
 * Draw a triangle
 * 
 * The triangle is defined by the following points:
 * (-1, -1), (0, .5), (1, -1)
 * 
 *
                 (0, .5)
                    *
                  *   *
                *        *
              *            *
            *   *   *   *    *
        (-1, -1)           (1, -1)

 */
const points_arr = [-1., -1., 0., 0.5, 1., -1.]

/**
 * According to Pak Lynxluna, the colors should be:
 * red at (0, 0)
 * green at (.5, 1)
 * blue at (1, 0)
 */
const colors_arr = [
  1., 0., 0., 1., // Red full alpha
  0., 1., 0., 1., // Green full alpha
  0., 0., 1., 1., // Blue full alpha
]

// Create a buffer for the points attribute
const pointsBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, pointsBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points_arr), gl.STATIC_DRAW);

// Set the points attribute
const pointsLocation = gl.getAttribLocation(program, 'a_points');
gl.bindBuffer(gl.ARRAY_BUFFER, pointsBuffer);
gl.vertexAttribPointer(pointsLocation, 2, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(pointsLocation);

// Create a buffer for the colors
const colorsBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors_arr), gl.STATIC_DRAW);

// Set the colors attribute
/**
 * IMPORTANT NOTE
 * --------------
 * 
 * Since the colors are passed from the vertex shader to the fragment shader, we need to use the varying keyword in the vertex shader.
 * The varying keyword is used to pass data from the vertex shader to the fragment shader.
 * 
 * The reason is because somehow I cannot pass an array of colors using uniform, so I have to use varying instead.
 */
const colorLocation = gl.getAttribLocation(program, 'a_colors');
gl.bindBuffer(gl.ARRAY_BUFFER, colorsBuffer);
gl.vertexAttribPointer(colorLocation, 4, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(colorLocation);


// DRAW THE TRIANGLE !!!

// Clear the canvas
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
// Set the background color to black
gl.clearColor(0., 0., 0., 1.);
gl.clear(gl.COLOR_BUFFER_BIT);
// Use the program
gl.useProgram(program);
// Draw the triangle !
gl.drawArrays(gl.TRIANGLES, 0, 3);

// EOF