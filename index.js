/*
 * @Author: lvy lvy
 * @Date: 2023-03-01 13:50:06
 * @LastEditors: lvy lvy
 * @LastEditTime: 2023-03-01 22:00:09
 * @FilePath: /WebGl_fork/index.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
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

    
}