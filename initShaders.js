const initShaders = (gl, vertexShaderId, fragmentShaderId) => {
  let vertShdr
  let fragShdr

  const vertElem = document.getElementById(vertexShaderId)

  if (!vertElem) {
    alert('Unable to load vertex shader ' + vertexShaderId)
    return -1
  } else {
    vertShdr = gl.createShader(gl.VERTEX_SHADER)
    gl.shaderSource(vertShdr, vertElem.textContent.replace(/^\s+|\s+$/g, ''))
    gl.compileShader(vertShdr)
    if (!gl.getShaderParameter(vertShdr, gl.COMPILE_STATUS)) {
      alert(
        'Vertex shader failed to compile.  The error log is:' +
        '<pre>' +
        gl.getShaderInfoLog(vertShdr) +
        '</pre>'
      )

      return -1
    }
  }

  const fragElem = document.getElementById(fragmentShaderId)

  if (!fragElem) {
    alert('Unable to load vertex shader ' + fragmentShaderId)
    return -1

  } else {
    fragShdr = gl.createShader(gl.FRAGMENT_SHADER)
    gl.shaderSource(fragShdr, fragElem.textContent.replace(/^\s+|\s+$/g, ''))
    gl.compileShader(fragShdr)
    if (!gl.getShaderParameter(fragShdr, gl.COMPILE_STATUS)) {
      alert(
        'Fragment shader failed to compile.  The error log is:' +
        '<pre>' +
        gl.getShaderInfoLog(fragShdr) +
        '</pre>'
      )

      return -1
    }
  }

  const program = gl.createProgram()
  gl.attachShader(program, vertShdr)
  gl.attachShader(program, fragShdr)
  gl.linkProgram(program)

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    alert(
      'Shader program failed to link.  The error log is:' +
      '<pre>' +
      gl.getProgramInfoLog(program) +
      '</pre>'
    )
    return -1
  }

  return program
}
