/*
 * @Author: lvy lvy
 * @Date: 2023-03-01 13:50:06
 * @LastEditors: lvy lvy
 * @LastEditTime: 2023-04-09 21:47:22
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

    attribute vec3 vertPosition;
    attribute vec3 vertColor;
    attribute vec2 vertTexCoord;
    varying vec2 fragTexCoord;
    uniform mat4 mWorld; // 世界矩阵
    uniform mat4 mView; //视图矩阵
    uniform mat4 mProj; //投影矩阵

    void main()
    {
      fragTexCoord = vertTexCoord;
      gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);
      // gl_Position =  vec4(vertPosition, 1.0);
    }
    `

var fragmentShaderText = `
  precision mediump float;
  varying vec3 fragColor;
  varying vec2 fragTexCoord;
  uniform sampler2D sampler;
   void main ()
   {
    gl_FragColor = texture2D(sampler, fragTexCoord);
   }
`
/**
 * @param gl-当前gl
 * @param type-是片段着色器还是顶点着色器
 * @param source-着色器资源
 */
function createShader (gl, type, source) {
  var shader = gl.createShader(type) //首先创建shader指定shader类型
  gl.shaderSource(shader, source) //加载资源()
  gl.compileShader(shader)
  //getShaderParameter
  console.log(gl.getShaderParameter(shader, gl.SHADER_TYPE), '当前shader类型')
  console.log(gl.getShaderParameter(shader, gl.DELETE_STATUS), '当前shader类型')
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    return shader
  }
  gl.deleteShader(shader)

  console.log(
    gl.getShaderParameter(shader, gl.DELETE_STATUS),
    '是否删除掉该报错shader'
  )
}
/**
 * @param gl-gl
 * @param vertexShader-顶点着色器
 * @param fragmentShader-片段着色器
 */
function createProgram (gl, vertexShader, fragmentShader) {
  var program = gl.createProgram()
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)
  var success = gl.getProgramParameter(program, gl.LINK_STATUS)
  if (success) {
    return program
  }

  console.log(gl.getProgramInfoLog(program))
  gl.deleteProgram(program)
}
function getBufferType(t,gl){
  const _ = {
    object:gl.ARRAY_BUFFER,
    index:gl.ELEMENT_ARRAY_BUFFER
  }
  return _[t]
}

/**
 * 
 * @param {*} type 
 * @param {*} bufferType 
 * @returns 
 * @description 
 * bufferData(ArrayBuffer)
 *    第一个参数指 这个buffer的类型 
 * - `gl.UNIFORM_BUFFER`：存储 uniform 数据。
  - `gl.TEXTURE_BUFFER`：存储纹理数据。
  - `gl.PIXEL_PACK_BUFFER` 和 `gl.PIXEL_UNPACK_BUFFER`：用于像素读取和写入操作。
  - `gl.ARRAY_BUFFER` 存储顶点数据，如顶点位置、颜色、法线、纹理坐标等。
  - `gl.ELEMENT_ARRAY_BUFFER` 存储索引数据，用于描述如何组成三角形或其他图元。   
  这里看到three 写了不同的class 

 * 
 *    第二个参数缓冲区的数据的渲染力度吧应该是？
 *    - `gl.STATIC_DRAW`：缓冲区数据不会或几乎不会改变。
      - `gl.DYNAMIC_DRAW`：缓冲区数据会被改变很多。
      - `gl.STREAM_DRAW`：缓冲区数据每次绘制时都会改变。
      缓冲区的意义 ？ 
      答： 创建缓冲区对象的目的是为了在 GPU 中存储数据，以便进行图形渲染。写入缓冲区的目的是为了将数据从 CPU 传输到 GPU，
      以便在 GPU 中进行处理和渲染。在 WebGL 中，使用缓冲区对象来存储顶点数据、索引数据、纹理数据等，
      然后通过绑定缓冲区对象，将这些数据传输到 GPU 中。这样可以大大提高图形渲染的效率，
      因为数据在 GPU 中的处理速度比在 CPU 中快得多。

     这里的 `6 * Float32Array.BYTES_PER_ELEMENT` 表示每个顶点的数据大小为 6 个 `Float32` 类型的数据，即 3 个坐标和 3 个颜色分量，每个 `Float32` 类型的数据占用 4 个字节，所以总大小为 24 个字节。
     第一个 `gl.vertexAttribPointer` 函数用来指定顶点位置属性的数据格式，其中 `positionAttribLocation` 是位置属性的索引，`3` 表示每个顶点有 3 个坐标，`gl.FLOAT` 表示每个坐标是一个浮点数，`gl.FALSE` 表示不需要归一化，`6 * Float32Array.BYTES_PER_ELEMENT` 表示每个顶点的数据大小，`0` 表示从缓冲区的起始位置开始读取数据。
      第二个 `gl.vertexAttribPointer` 函数用来指定顶点颜色属性的数据格式，其中 `colorAttribLocation` 是颜色属性的索引，`3` 表示每个顶点有 3 个颜色分量，`gl.FLOAT` 表示每个颜色分量是一个浮点数，`gl.FALSE` 表示不需要归一化，`6 * Float32Array.BYTES_PER_ELEMENT` 表示每个顶点的数据大小，`3 * Float32Array.BYTES_PER_ELEMENT` 表示从缓冲区的第 12 个字节开始读取数据，因为前面有 3 个坐标，每个坐标占用 4 个字节。
     
 */
function createBuffer (type,bufferType,enble = true) {
  const t = (e) => ({
    'unit16': new Uint16Array(e),
    'float32': new Float32Array(e),
  })
  const _v = c => t(c)[type]
  return (gl, Vertices, program, name, offset, element,size) => {
    var triangleVertexBufferObject = gl.createBuffer()
    gl.bindBuffer( getBufferType(bufferType,gl), triangleVertexBufferObject)
    gl.bufferData( getBufferType(bufferType,gl), type == 'unit16' ? new Uint16Array(Vertices) : new Float32Array(Vertices), gl.STATIC_DRAW)
    if(!enble) return
    var positionAttribLocation = gl.getAttribLocation(program, name)
    gl.vertexAttribPointer(
      positionAttribLocation,
      element, //参数表示每个顶点属性由三个浮点数组成，这里是顶点的位置属性。 取得是 // X, Y, z 所以是三个
      gl.FLOAT,
      gl.FALSE, //是否归一化处理
      size * Float32Array.BYTES_PER_ELEMENT,
      offset == 0 ? offset : offset * Float32Array.BYTES_PER_ELEMENT //offset 从 索引0开始 //offset 从 索引0开始
    )
    gl.enableVertexAttribArray(positionAttribLocation)

  }

}
/**
 * 
 * @param {*} gl 
 * @param {*} url 
 * @returns 
 * /**
 *   // - `REPEAT`：超出纹理坐标范围的部分会被重复填充纹理图像。
  // - `MIRRORED_REPEAT`：超出纹理坐标范围的部分会被镜像重复填充纹理图像。
  // - `CLAMP_TO_BORDER`：超出纹理坐标范围的部分会被截取并填充到用户指定的边框颜色上。
  // - `CLAMP_TO_EDGE` : 超出纹理坐标范围的部分会被截取并填充到最边缘的纹理像素上
   - `gl.bindTexture(gl.TEXTURE_2D, boxTexture)` 绑定 WebGL 纹理对象到当前
       的纹理单元，以便后续对该纹理的操作能够生效。
      - `gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)`
      和 `gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)`
      设置纹理的水平和垂直方向的边缘处理方式为“边缘拉伸”（CLAMP_TO_EDGE）
      ，即超出纹理边界的部分采用边缘颜色填充。
      - `gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)` 
      和 `gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)` 
      设置纹理的缩小过滤和放大过滤方式为“线性过滤”（LINEAR），–
      即使用纹理像素周围的像素的加权平均值来计算纹理像素的颜色，以实现更加平滑的纹理映射效果。
      这里使用的是线性过滤，还有其他过滤方式，例如最近邻过滤（NEAREST）
      和双线性过滤（LINEAR_MIPMAP_LINEAR）
 */
function loadTexture(gl, url) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // 设置纹理参数
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  // 加载图片并绑定纹理
  const image = new Image();
  image.onload = function() {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  };
  image.src = url;

  return texture;
}
/**
 * 
 * @param {*} file 
 * @returns 
 * - cameras：相机信息。
- flags：标记信息。
- lights：灯光信息。
- materials：材质信息。
- meshes：「
    `vertices`: 顶点坐标数组，每个顶点有3个坐标分别表示x、y、z。
    - `normals`: 法向量数组，每个法向量有3个分量表示x、y、z。
    - `colors`: 颜色数组，每个颜色有4个分量表示RGBA。
    - `texturecoords`: 纹理坐标数组，每个纹理坐标有2个分量表示u、v。
    - `tangents`: 切线向量数组，每个切线向量有3个分量表示x、y、z。
    - `bitangents`: 双切线向量数组，每个双切线向量有3个分量表示x、y、z。
    - `faces`: 面数组，每个面由3个索引组成，表示该面的三个顶点在`vertices`数组中的索引。
    - `primitivetypes`: 几何体的基本类型，如三角形、四边形等。
    - `materialindex`: 几何体使用的材质在`materials`数组中的索引。
    - `numuvcomponents`: 纹理坐标的分量个数，如2表示二维纹理坐标，3表示三维纹理坐标。
    - `name`: 几何体的名称。
」
- rootnode：根节点信息。

 * 
 */
function loadJSON(url) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.responseType = 'json';
    xhr.onload = () => {
      if (xhr.status === 200) {
        resolve(xhr.response);
      } else {
        reject(new Error(`Failed to load JSON file from ${url}. Status code: ${xhr.status}`));
      }
    };
    xhr.onerror = () => {
      reject(new Error(`Failed to load JSON file from ${url}.`));
    };
    xhr.send();
  });
}
/**
 *
 * @param {*} gl
 * @param {*} program
 * @param {*} obj - unifroms
 */
function setUniform (gl, program, obj) {
  for (const iterator in obj) {
    gl.uniformMatrix4fv(
      gl.getUniformLocation(program, iterator),
      false,
      obj[iterator]
    )
    console.log(iterator, 'iterator')
  }
}


// 声明创建函数
let initWebgl = async function  () {
  let canvas = document.getElementById('game-surface')
  let gl = canvas.getContext('webgl')
  if (!gl) {
    gl = canvas.getContext('experimentl-webgl')
  }
  if (!gl) {
    alert('not webgl')
  }
  // 这里清除一下帧缓冲区 frame Buffer  (Color buffer and Depth buffer)
  // 像素颜色 rgb的三个分量来表示颜色 每个分量采用8bits来表示
  // bit 为数据存储的最小单位 在二进制中 0 1 就是一个bit （位）
  // 一个字节等于 2 bit  一个汉字 等于 8哥字节（Byte） 16 bit mb/kb 一千个bit

  gl.clearColor(0.8, 0.8, 0.8, 1.0)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  // - 深度测试（Depth Test）：在绘制 3D 场景时，不同的物体会有重叠的情况，深度测试可以保证只有最前面的物体才会被渲染到屏幕上，从而避免了后面的物体遮挡前面的物体的情况。
  // - 面剔除（Face Culling）：在绘制 3D 场景时，有些物体的背面是看不到的，如立方体的背面。为了提高渲染效率，可以启用面剔除功能，剔除掉不可见的背面，只渲染可见的正面。
  gl.enable(gl.DEPTH_TEST)
  gl.enable(gl.CULL_FACE)
  var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderText)
  var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderText)
  var program = createProgram(gl, vertexShader, fragmentShader)

  gl.validateProgram(program)

  //创建缓冲区
  /**
   * TODO:23/4/9 这里增加了z轴
   */
  const _json = await loadJSON('../public/Susan.json')
  console.log(_json.meshes)
  var triangleVertices = [
    // X, Y, z      R, G, B
    0.0, 0.5, 0.0, 1.0, 1.0, 0.0, -0.5, -0.5, 0.0, 0.7, 0.0, 1.1, 0.5, -0.5,
    0.0, 0.1, 1.0, 0.6,
  ]
  var boxVertices = _json.meshes[0].vertices

  var boxIndices = [].concat.apply([],_json.meshes[0].faces)
  var susanTexCoords = _json.meshes[0].texturecoords[0];

  const createUni16Buffer = createBuffer('unit16', 'index');
  const createFloat32Buffer = createBuffer('float32', 'object');
  const createFloat32BufferTexture = createBuffer('float32', 'object',false);
  createFloat32Buffer(gl,boxVertices,program,'vertPosition',0,3,3)
  createFloat32BufferTexture(gl,susanTexCoords,program)
  createUni16Buffer(gl,boxIndices,program,'vertTexCoord', 0,2,2)

  var boxTexture = loadTexture(gl,'../public/SusanTexture.png')
 
  //
  // Main render loop
  //
  gl.useProgram(program)

  var worldMatrix = new Float32Array(16)

  setUniform(gl, program, {
    mWorld: mat4.identity(worldMatrix),
    mView: mat4.lookAt(new Float32Array(16), [10, 0, -15], [0, 0, 0], [0, 1, 0]),
    mProj: mat4.perspective(
      new Float32Array(16),
      glMatrix.toRadian(45),
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      1000.0
    ),
  })

  var angle = 0
  var loop = function () {
    angle = (performance.now() / 100 / 6) * 2 * Math.PI
    // mat4.rotate(worldMatrix, identityMatrix, angle, [0, 1, 0])
    //[1,0,0] x轴转动
    const router = mat4.rotate(worldMatrix, mat4.identity(new Float32Array(16)), angle / 4, [1, 0, 0])
    // mat4.rotate(worldMatrix, identityMatrix, angle /2, [0, 0, 1]);
    // console.log(worldMatrix,'initWebgl')
    gl.uniformMatrix4fv(gl.getUniformLocation(program, 'mWorld'), gl.FALSE, mat4.rotate(worldMatrix, mat4.identity(new Float32Array(16)), angle / 4, [1, 0, 0]))
    gl.clearColor(0.75, 0.85, 0.8, 1.0)
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT)
    // gl.drawArrays(gl.TRIANGLES, 0, );
    gl.bindTexture(gl.TEXTURE_2D, boxTexture);
    gl.activeTexture(gl.TEXTURE0);
    gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0)
    requestAnimationFrame(loop)
  }
  requestAnimationFrame(loop)
}
