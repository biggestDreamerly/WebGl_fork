/*
 * @Author: lvy lvy
 * @Date: 2023-04-09 16:11:11
 * @LastEditors: lvy lvy
 * @LastEditTime: 2023-04-09 16:12:02
 * @FilePath: /WebGl_fork/utils.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
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

  console.log(gl.getShaderParameter(shader, gl.DELETE_STATUS), '是否删除掉该报错shader')
}
/**
 * @param gl-gl
 * @param vertexShader-顶点着色器
 * @param fragmentShader-片段着色器
 */
function createProgram (gl, vertexShader, fragmentShader) {
  var program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  var success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }

  console.log(gl.getProgramInfoLog(program));
  gl.deleteProgram(program)
}
/**
 * 
 * @param {*} gl 
 * @param {*} program 
 * @param {*} obj - unifroms
 */
function setUniform (gl, program, obj) {

  for (const iterator in obj) {
    gl.uniformMatrix4fv(gl.getUniformLocation(program, iterator), false, obj[iterator]);
    console.log(iterator, 'iterator')
  }
}
export{
  createProgram,
  createShader,
  setUniform
}