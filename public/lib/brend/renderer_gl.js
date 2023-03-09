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
		this.vertexShaderSource = `
			attribute vec4 a_Pos;
			attribute vec4 a_Colour;
			varying vec4 v_Colour;
			
			void main()
			{
				v_Colour = a_Colour;
				gl_Position = a_Pos;
			}
		`;
		this.fragmentShaderSource = `
			precision mediump float;
			varying vec4 v_Colour;
			
			void main()
			{
				gl_FragColor = v_Colour;
			}
		`;
		this.vertexShaderID = -1;
		this.fragmentShaderID = -1;
		this.shaderProgramID = -1;
		this.rectVertexBuffer = 
		[
			// Vertex						// Colour
			-0.5,	 0.5,	0.0,			1.0, 0.0, 0.0, 1.0, // Top left, White
			 0.5,	 0.5,	0.0,			0.0, 1.0, 0.0, 1.0,	// Top right, White
			-0.5,	-0.5,	0.0,			0.0, 0.0, 1.0, 1.0, // Bottom left, White
			 0.5,	-0.5,	0.0,			1.0, 1.0, 0.0, 1.0, // Bottom right, White
			
		];
		this.rectIndexBuffer =
		[
			0, 1, 3,
			0, 2, 3
		];
		this.gl.viewport(0, 0, this.width, this.height);
		this.gl.clearColor(0.2, 0.2, 0.2, 1.0);
		this.gl.clear(this.gl.COLOR_BUFFER_BIT);
		
		// init shaders
		this.__createShaderProgram();
		this.gl.useProgram(this.shaderProgramID);
		
		// craate the vertex buffer
		this.vboID = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vboID);
		this.gl.bufferData(
			this.gl.ARRAY_BUFFER, 
			new Float32Array(this.rectVertexBuffer),
			this.gl.DYNAMIC_DRAW
		);
		
		// create the index buffer
		this.eboID = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.eboID);
		this.gl.bufferData(
			this.gl.ELEMENT_ARRAY_BUFFER,
			new Uint16Array(this.rectIndexBuffer),
			this.gl.STATIC_DRAW
		);
		
		// configure the attributes for each buffer
		this.vertexAttribLoc = this.gl.getAttribLocation(this.shaderProgramID, "a_Pos");
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vboID);
		this.gl.vertexAttribPointer(
			this.vertexAttribLoc,
			3,
			this.gl.FLOAT,
			false,
			7 * 4,
			0
		);
		this.gl.enableVertexAttribArray(this.vertexAttribLoc);
		
		// configure attributes for the colour
		this.colourAttribLoc = this.gl.getAttribLocation(this.shaderProgramID, "a_Colour");
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vboID);
		this.gl.vertexAttribPointer(
			this.colourAttribLoc,
			3,
			this.gl.FLOAT,
			false,
			7 * 4,
			3 * 4
		);
		this.gl.enableVertexAttribArray(this.colourAttribLoc);
		
        return this.canvas;
    }

    clear()
    {
		this.gl.clearDepth(1.0);
		this.gl.enable(this.gl.DEPTH_TEST);
		this.gl.depthFunc(this.gl.LEQUAL);
		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    }

    renderRect(x = 0, y = 0, w = 1, h = 1, colour = "#ffffff")
    {
		const normX = x / this.width;
		const normY = y / this.height;
		
		const normColour = __renderer_gl__internals.hexToNormRgb(colour);
		
		const x1 = x / (this.width / 2) - 1;
		const x2 = (x + w) / (this.width / 2) - 1;
		const y1 = -y / (this.height / 2) + 1;
		const y2 = -(y + h) / (this.height / 2) + 1;
		this.rectVertexBuffer = 
		[
			// Vertex						// Colour
			x1,  y1, 	0.0,               normColour.r, normColour.g, normColour.b, 1.0, // Top left
			x2,  y1, 	0.0,               normColour.r, normColour.g, normColour.b, 1.0, // Top right
			x1,  y2, 	0.0,               normColour.r, normColour.g, normColour.b, 1.0, // Bottom left
			x2,  y2, 	0.0,               normColour.r, normColour.g, normColour.b, 1.0  // Bottom right
		];
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vboID);
		this.gl.bufferData(
			this.gl.ARRAY_BUFFER, 
			new Float32Array(this.rectVertexBuffer),
			this.gl.DYNAMIC_DRAW
		);
		
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