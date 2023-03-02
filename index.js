/*
 * @Author: lvy lvy
 * @Date: 2023-03-01 13:50:06
 * @LastEditors: lvy lvy
 * @LastEditTime: 2023-03-02 15:27:07
 * @FilePath: /WebGl_fork/index.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
  //精度限定符 precision 默认精度
  // 涉及到三种变量类型 uniform 外部变量 attribute 只能在 vertex 里使用哦 
  // 主要来表示一些顶点的数据 （顶点坐标，法线，纹理，坐标，顶点颜色） 
  // varying shi 顶点着色器 跟 片段着色器之间做数据传递的
    // 顶点的坐标是一个四元数，我们现在只取一个二维向量去填充;
  
    var vertexShaderText = `
    precision mediump float;

    attribute vec2 vertPosition;
    attribute vec3 vertColor;
    varying vec3 fragColor;

    void main()
    {
      fragColor = vertColor;
      gl_Position = vec4(vertPosition, 0.0, 1.0);
    }
    `

var fragmentShaderText = `
  precision mediump float;
  varying vec3 fragColor;
   void main ()
   {
    gl_FragColor = vec4(fragColor, 1.0);
   }
`


// 声明创建函数
let initWebgl = function () {
    let canvas = document.getElementById('game-surface');
    let gl = canvas.getContext('webgl')
    if(!gl) {
      gl = canvas.getContext('experimentl-webgl')
    }
    if(!gl) {
      alert('not webgl')
    } 
    // 这里清除一下帧缓冲区 frame Buffer  (Color buffer and Depth buffer)
    // 像素颜色 rgb的三个分量来表示颜色 每个分量采用8bits来表示
    // bit 为数据存储的最小单位 在二进制中 0 1 就是一个bit （位）
    // 一个字节等于 2 bit  一个汉字 等于 8哥字节（Byte） 16 bit mb/kb 一千个比特

    gl.clearColor(0.8,0.8,0.8,1.0)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

	gl.shaderSource(vertexShader, vertexShaderText);
	gl.shaderSource(fragmentShader, fragmentShaderText);

	gl.compileShader(vertexShader);
	if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
		console.error('ERROR compiling vertex shader!', gl.getShaderInfoLog(vertexShader));
		return;
	}
  //编译shader
	gl.compileShader(fragmentShader);
	if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
		console.error('ERROR compiling fragment shader!', gl.getShaderInfoLog(fragmentShader));
		return;
	}

	var program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
    // 判断是否link成功
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('ERROR linking program!', gl.getProgramInfoLog(program));
      return;
    }
    gl.validateProgram(program)
  

    //创建缓冲区
    var vects = [
      0.0,0.0,
      -0.5,-0.5,
      0.5,-0.5
    ]
    // new Float32Array(vects) 

    var VertObject =  gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,VertObject)
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vects) ,gl.STATIC_DRAW)
    //上面shader 的变量 vertPosition 位置信息 xy
    var positionAttribLocation =  gl.getAttribLocation(program,'vertPosition')
    /**
     * @description: 
     * @return {*}
     */
    /
    gl.vertexAttribPointer(
      positionAttribLocation,
      2,
      gl.FLOAT,
      gl.FALSE,
      2 * Float32Array.BYTES_PER_ELEMENT,
      0
    )
    gl.enableVertexAttribArray(positionAttribLocation)
    gl.useProgram(program)
    gl.drawArrays(gl.TRIANGLES,0,3)
}