const __renderer_gl__internals =
{
	// Credit: https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
	hexToNormRgb: function (hex) 
	{
		// Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
		var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
		hex = hex.replace(shorthandRegex, function(m, r, g, b) {
		return r + r + g + g + b + b;
	});

	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? {
			r: parseInt(result[1], 16) / 255,
			g: parseInt(result[2], 16) / 255,
			b: parseInt(result[3], 16) / 255
		} : null;
	},
	compileShader: function (gl, shaderSource, shaderType)
	{
		const shader = gl.createShader(shaderType);
		gl.shaderSource(shader, shaderSource);
		gl.compileShader(shader);
		
		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
		{
			alert(`ERROR: Failed to compile shader source!\n\tOpenGL Error: ${gl.getShaderInfoLog(shader)}`);
			gl.deleteShader(shader);
			return null;
		}
		return shader;
	}
};

class GLRenderer
{
    constructor()
    {
        this.width = 0;
        this.height = 0;
        this.canvas = null;
        this.gl = null;
    }
	
	__createShaderProgram()
	{
		this.vertexShaderID = __renderer_gl__internals.compileShader(
			this.gl,
			this.vertexShaderSource,
			this.gl.VERTEX_SHADER
		);
		
		this.fragmentShaderID = __renderer_gl__internals.compileShader(
			this.gl,
			this.fragmentShaderSource,
			this.gl.FRAGMENT_SHADER
		);
		
		this.shaderProgramID = this.gl.createProgram();
		this.gl.attachShader(this.shaderProgramID, this.vertexShaderID);
		this.gl.attachShader(this.shaderProgramID, this.fragmentShaderID);
		this.gl.linkProgram(this.shaderProgramID);
		
		if (!this.gl.getProgramParameter(this.shaderProgramID, this.gl.LINK_STATUS))
		{
			alert(`ERROR: Failed to link shader program!\n\tOpenGL Error: ${this.gl.getProgramInfoLog(this.shaderProgramID)}`);
		}
	}

    createCanvas(width, height)
    {
        this.width = width;
        this.height = height;
        this.canvas = document.createElement("canvas");
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.gl = this.canvas.getContext("webgl");

		if (!this.gl)
		{
			alert("ERROR: OpenGL is not supported on this browser!");
			return null;
		}

		this.gl.viewport(0, 0, this.width, this.height);
		this.gl.clearColor(0.2, 0.2, 0.2, 1.0);
		this.gl.clear(this.gl.COLOR_BUFFER_BIT);

		this.vertexShaderSource = `
			attribute vec2 a_Pos;

            uniform vec2 u_Viewport;
            uniform vec2 u_Translation;
            uniform mat4 u_ViewMatrix;
            uniform vec2 u_Scale;
			
			void main()
			{
                vec2 clipSpace = ((u_ViewMatrix * vec4(a_Pos * u_Scale, 0, 1)).xy / u_Viewport * 2.0) - 1.0;
                gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
				//gl_Position = vec4(a_Pos + u_Translation, 0.0, 1.0);
			}
		`;
		this.fragmentShaderSource = `
			precision mediump float;
			
            uniform vec4 u_Colour;

			void main()
			{
				gl_FragColor = u_Colour;
			}
		`;

		this.vertexShaderID = -1;
		this.fragmentShaderID = -1;
		this.shaderProgramID = -1;

		this.vertexBuffer = 
		[
			// Vertex
			0.0,    0.0,    // Top left, White
			1.0,    0.0,    // Top right, White
			0.0,    1.0,    // Bottom left, White
			1.0,    1.0     // Bottom right, White
			
		];
		this.indexBuffer =
		[
			0, 1, 3,
            3, 2, 0
		];
		
		// init shaders
		this.__createShaderProgram();
		this.gl.useProgram(this.shaderProgramID);
		
		// craate the vertex buffer and push our array
		this.vboID = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vboID);
		this.gl.bufferData(
			this.gl.ARRAY_BUFFER, 
			new Float32Array(this.vertexBuffer),
			this.gl.STATIC_DRAW
		);
		
		// create the index buffer and push our array
		this.eboID = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.eboID);
		this.gl.bufferData(
			this.gl.ELEMENT_ARRAY_BUFFER,
			new Uint16Array(this.indexBuffer),
			this.gl.STATIC_DRAW
		);
		
		// configure the attributes for each buffer
		this.vertexAttribLoc = this.gl.getAttribLocation(this.shaderProgramID, "a_Pos");
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vboID);
		this.gl.vertexAttribPointer(
			this.vertexAttribLoc,
			2,
			this.gl.FLOAT,
			false,
			2 * 4,
			0
		);
		this.gl.enableVertexAttribArray(this.vertexAttribLoc);

        // Get our uniforms and their IDs
        this.colourUniformLoc       = this.gl.getUniformLocation(this.shaderProgramID, "u_Colour");
        this.translationUniformLoc  = this.gl.getUniformLocation(this.shaderProgramID, "u_Translation");
        this.viewportUniformLoc     = this.gl.getUniformLocation(this.shaderProgramID, "u_Viewport");
        this.scaleUniformLoc        = this.gl.getUniformLocation(this.shaderProgramID, "u_Scale");

        if (this.viewportUniformLoc != -1) this.gl.uniform2i(this.viewportUniformLoc, this.width, this.height);

        return this.canvas;
    }

    clear()
    {
		//this.gl.clearDepth(1.0);
		//this.gl.enable(this.gl.DEPTH_TEST);
		//this.gl.depthFunc(this.gl.LEQUAL);
		//this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    }

    renderRect(x = 0, y = 0, w = 1, h = 1, colour = "#ffffff")
    {
        this.gl.uniformMatrix4fv(
            this.viewportUniformLoc,
            false,
            this.modelViewMatrix
        );

		/*const normX = x / (this.width   / 2) - 1;
		const normY = y / (this.height  / 2) - 1;
        const normW = w * 2 / this.width;
        const normH = h * 2 / this.height;

		//const normColour = __renderer_gl__internals.hexToNormRgb(colour);
        this.gl.uniform4f(this.colourUniformLoc, 1.0, 0.0, 0.0, 1.0);
        this.gl.uniform2i(this.translationUniformLoc, x, y);
        this.vertexBuffer =
        [
            normX,          normY,          0.0,    // Top left
            normX + normW,  normY,          0.0,    // Top right
            normX,          normY - normH,  0.0,    // Bottom left
            normX + normW,  normY - normH,  0.0     // Bottom right
        ];*/
		
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.eboID);
		this.gl.drawElements(this.gl.TRIANGLES, 6, this.gl.UNSIGNED_SHORT, 0);
    }

    setClearColour(colour)
    {
        this.mClearColour = colour;
		const c = __renderer_gl__internals.hexToNormRgb(colour);
		this.gl.clearColor(c.r, c.g, c.b, 1.0);
    }

    attachEvent(type, callbackFunction)
    {
        this.canvas.addEventListener(type, callbackFunction);
    }

    setID(id)
    {
        this.canvas.id = id;
    }

    addClassList(className)
    {
        this.canvas.classList.add(className);
    }
	
	dispose()
	{
		this.gl.deleteProgram(this.shaderProgramID);
		this.gl.deleteBuffer(this.vboID);
		this.gl.deleteBuffer(this.eboID);
	}
}