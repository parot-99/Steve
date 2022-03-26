let program
let canvas
let gl

const numVertices = 36

let pointsArray = []
let normalsArray = []

// lightning and shading:

let lightScene = 2
let lightPosition
let lightXposition = 1.0
let lightFlag = 1

// colors, view, and transparency:

let color
let viewAs
let rColor
let gColor
let bColor
let transparency = 1.0
let colorFlag = 0

// moving:

let yRotation = -20.0
let rotation = [0.0, 0.0, 0.0, -13.0, 0.0, -13.0, 4.0, 4.0, -4.0, -4.0]
let moveX = 0.0
let moveY = 0.0
let moveZ = 0.0
let xTeta = 0
let yTeta = 0
let zTeta = 0

// object letiables:

let figure = []

const numNodes = 10
const bodyIds = {
  torso: 0,
  head: 1,
  leftUpperArm: 2,
  leftLowerArm: 3,
  rightUpperArm: 4,
  rightLowerArm: 5,
  leftUpperLeg: 6,
  leftLowerLeg: 7,
  rightUpperLeg: 8,
  rightLowerLeg: 9,
}

let torsoHeight = 5.0
let torsoWidth = 2.0
let headHeight = 2.0
let headWidth = 2.0

// texture:

let texCoord = [vec2(0, 0), vec2(0, 1), vec2(1, 1), vec2(1, 0)]
let texCoordsArray = []
let texSize = 64
let textureFlag = 0

let image1 = new Array()
for (let i = 0; i < texSize; i++) image1[i] = new Array()
for (let i = 0; i < texSize; i++)
  for (let j = 0; j < texSize; j++) image1[i][j] = new Float32Array(4)
for (let i = 0; i < texSize; i++)
  for (let j = 0; j < texSize; j++) {
    let c = ((i & 0x8) == 0) ^ ((j & 0x8) == 0)
    image1[i][j] = [c, c, c, 1]
  }

let image2 = new Uint8Array(4 * texSize * texSize)

for (let i = 0; i < texSize; i++) {
  for (let j = 0; j < texSize; j++) {
    for (let k = 0; k < 4; k++) {
      image2[4 * texSize * i + 4 * j + k] = 255 * image1[i][j][k]
    }
  }
}

// functions:

const quad = (a, b, c, d) => {
  const vertices = [
    vec4(-0.28152, -0.5, 0.28152, 1.0),
    vec4(-0.28152, 0.5, 0.28152, 1.0),
    vec4(0.28152, 0.5, 0.28152, 1.0),
    vec4(0.28152, -0.5, 0.28152, 1.0),
    vec4(-0.28152, -0.5, -0.28152, 1.0),
    vec4(-0.28152, 0.5, -0.28152, 1.0),
    vec4(0.28152, 0.5, -0.28152, 1.0),
    vec4(0.28152, -0.5, -0.28152, 1.0),
  ]

  let t1 = subtract(vertices[b], vertices[a])
  let t2 = subtract(vertices[c], vertices[b])
  let normal = cross(t1, t2)
  normal = vec3(normal)

  pointsArray.push(vertices[a])
  normalsArray.push(normal)
  texCoordsArray.push(texCoord[0])
  pointsArray.push(vertices[b])
  normalsArray.push(normal)
  texCoordsArray.push(texCoord[1])
  pointsArray.push(vertices[c])
  normalsArray.push(normal)
  texCoordsArray.push(texCoord[2])
  pointsArray.push(vertices[a])
  normalsArray.push(normal)
  texCoordsArray.push(texCoord[0])
  pointsArray.push(vertices[c])
  normalsArray.push(normal)
  texCoordsArray.push(texCoord[2])
  pointsArray.push(vertices[d])
  normalsArray.push(normal)
  texCoordsArray.push(texCoord[3])
}

const cube = () => {
  quad(1, 0, 3, 2)
  quad(2, 3, 7, 6)
  quad(3, 0, 4, 7)
  quad(6, 5, 1, 2)
  quad(4, 5, 6, 7)
  quad(5, 4, 0, 1)
}

const myModelViewTranslation = (thisTx, thisTy, thisTz) => {
  gl.uniform1f(gl.getUniformLocation(program, 'modelTx'), thisTx)
  gl.uniform1f(gl.getUniformLocation(program, 'modelTy'), thisTy)
  gl.uniform1f(gl.getUniformLocation(program, 'modelTz'), thisTz)
}

const myTranslation = (thisTx, thisTy, thisTz) => {
  gl.uniform1f(gl.getUniformLocation(program, 'tx'), thisTx)
  gl.uniform1f(gl.getUniformLocation(program, 'ty'), thisTy)
  gl.uniform1f(gl.getUniformLocation(program, 'tz'), thisTz)
}

const myScale = (thisSx, thisSy, thisSz) => {
  gl.uniform1f(gl.getUniformLocation(program, 'sx'), thisSx)
  gl.uniform1f(gl.getUniformLocation(program, 'sy'), thisSy)
  gl.uniform1f(gl.getUniformLocation(program, 'sz'), thisSz)
}

const myRotation = (teta, axis) => {
  xTeta
  yTeta
  zTeta

  if (axis === 'x') {
    xTeta = teta
    gl.uniform3fv(gl.getUniformLocation(program, 'omega'), [
      xTeta,
      yTeta,
      zTeta,
    ])
  } else if (axis === 'y') {
    yTeta = teta
    gl.uniform3fv(gl.getUniformLocation(program, 'omega'), [
      xTeta,
      yTeta,
      zTeta,
    ])
  } else if (axis === 'z') {
    zTeta = teta
    gl.uniform3fv(gl.getUniformLocation(program, 'omega'), [
      xTeta,
      yTeta,
      zTeta,
    ])
  }
}

const setColor = (r, g, b) => {
  rColor = r
  gColor = g
  bColor = b
}

const createNode = (render, sibling, child, father, translation) => {
  const node = {
    render: render,
    sibling: sibling,
    child: child,
    father: father,
    translation: translation,
  }

  return node
}

const traverse = (id) => {
  if (id == null) {
    return
  }

  myRotation(yRotation, 'y')

  figure[id].render()

  if (figure[id].child != null) {
    traverse(figure[id].child)
  }

  if (figure[id].sibling != null) {
    traverse(figure[id].sibling)
  }
}

const configureTexture = (image) => {
  let texture = gl.createTexture()
  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    texSize,
    texSize,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    image
  )
  gl.generateMipmap(gl.TEXTURE_2D)
  gl.texParameteri(
    gl.TEXTURE_2D,
    gl.TEXTURE_MIN_FILTER,
    gl.NEAREST_MIPMAP_LINEAR
  )
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
}

const torso = () => {
  myRotation(rotation[bodyIds['torso']], 'x')
  myModelViewTranslation(
    figure[bodyIds['torso']].translation[0],
    figure[bodyIds['torso']].translation[1],
    figure[bodyIds['torso']].translation[2]
  )
  myScale(torsoWidth, torsoHeight, 1.0)

  switch (colorFlag) {
    case 0:
      setColor(0.0, 1.0, 1.0)
      break

    case 1:
      setColor(1.0, 0.0, 0.0)
      break

    case 2:
      setColor(0.0, 0.0, 0.0)
      break
  }

  color = vec3(rColor, gColor, bColor)
  gl.uniform3fv(gl.getUniformLocation(program, 'vColor'), color)
  gl.drawArrays(viewAs, 0, numVertices)
}

const head = () => {
  myRotation(rotation[bodyIds['head']], 'x')
  myModelViewTranslation(
    figure[bodyIds['head']].translation[0],
    figure[bodyIds['head']].translation[1],
    figure[bodyIds['head']].translation[2]
  )
  myScale(headWidth, headHeight, headWidth)
  setColor(1.0, 0.89, 0.77)
  color = vec3(rColor, gColor, bColor)
  gl.uniform3fv(gl.getUniformLocation(program, 'vColor'), color)
  gl.drawArrays(viewAs, 0, numVertices)
}

const leftUpperArm = () => {
  myRotation(rotation[bodyIds['leftUpperArm']], 'x')
  myModelViewTranslation(
    figure[bodyIds['leftUpperArm']].translation[0],
    figure[bodyIds['leftUpperArm']].translation[1],
    figure[bodyIds['leftUpperArm']].translation[2]
  )
  myScale(1.0, 1.0, 1.0)
  switch (colorFlag) {
    case 0:
      setColor(0.0, 1.0, 1.0)
      break
    case 1:
      setColor(1.0, 0.0, 0.0)
      break
    case 2:
      setColor(0.0, 0.0, 0.0)
      break
  }
  color = vec3(rColor, gColor, bColor)
  gl.uniform3fv(gl.getUniformLocation(program, 'vColor'), color)
  gl.drawArrays(viewAs, 0, numVertices)
}

const leftLowerArm = () => {
  myRotation(rotation[bodyIds['leftLowerArm']], 'x')
  myModelViewTranslation(
    figure[bodyIds['leftLowerArm']].translation[0],
    figure[bodyIds['leftLowerArm']].translation[1],
    figure[bodyIds['leftLowerArm']].translation[2]
  )
  myScale(1.0, 2.0, 1.0)
  setColor(1.0, 0.89, 0.77)
  color = vec3(rColor, gColor, bColor)
  gl.uniform3fv(gl.getUniformLocation(program, 'vColor'), color)
  gl.drawArrays(viewAs, 0, numVertices)
}

const rightUpperArm = () => {
  myRotation(rotation[bodyIds['rightUpperArm']], 'x')
  myModelViewTranslation(
    figure[bodyIds['rightUpperArm']].translation[0],
    figure[bodyIds['rightUpperArm']].translation[1],
    figure[bodyIds['rightUpperArm']].translation[2]
  )
  myScale(1.0, 1.0, 1.0)
  switch (colorFlag) {
    case 0:
      setColor(0.0, 1.0, 1.0)
      break
    case 1:
      setColor(1.0, 0.0, 0.0)
      break
    case 2:
      setColor(0.0, 0.0, 0.0)
      break
  }
  color = vec3(rColor, gColor, bColor)
  gl.uniform3fv(gl.getUniformLocation(program, 'vColor'), color)
  gl.drawArrays(viewAs, 0, numVertices)
}

const rightLowerArm = () => {
  myRotation(rotation[bodyIds['rightLowerArm']], 'x')
  myModelViewTranslation(
    figure[bodyIds['rightLowerArm']].translation[0],
    figure[bodyIds['rightLowerArm']].translation[1],
    figure[bodyIds['rightLowerArm']].translation[2]
  )
  myScale(1.0, 2.0, 1.0)
  setColor(1.0, 0.89, 0.77)
  color = vec3(rColor, gColor, bColor)
  gl.uniform3fv(gl.getUniformLocation(program, 'vColor'), color)
  gl.drawArrays(viewAs, 0, numVertices)
}

const leftUpperLeg = () => {
  myRotation(rotation[bodyIds['leftUpperLeg']], 'x')
  myModelViewTranslation(
    figure[bodyIds['leftUpperLeg']].translation[0],
    figure[bodyIds['leftUpperLeg']].translation[1],
    figure[bodyIds['leftUpperLeg']].translation[2]
  )
  myScale(1.0, 2.0, 1.0)
  switch (colorFlag) {
    case 1:
      setColor(0.0, 0.0, 0.0)
      break
    default:
      setColor(0.0, 0.0, 1.0)
      break
  }
  color = vec3(rColor, gColor, bColor)
  gl.uniform3fv(gl.getUniformLocation(program, 'vColor'), color)
  gl.drawArrays(viewAs, 0, numVertices)
}

const leftLowerLeg = () => {
  myRotation(rotation[bodyIds['leftLowerLeg']], 'x')
  myModelViewTranslation(
    figure[bodyIds['leftLowerLeg']].translation[0],
    figure[bodyIds['leftLowerLeg']].translation[1],
    figure[bodyIds['leftLowerLeg']].translation[2]
  )
  myScale(1.0, 1.0, 1.0)
  setColor(0.5, 0.5, 0.5)
  color = vec3(rColor, gColor, bColor)
  gl.uniform3fv(gl.getUniformLocation(program, 'vColor'), color)
  gl.drawArrays(viewAs, 0, numVertices)
}

const rightUpperLeg = () => {
  myRotation(rotation[bodyIds['rightUpperLeg']], 'x')
  myModelViewTranslation(
    figure[bodyIds['rightUpperLeg']].translation[0],
    figure[bodyIds['rightUpperLeg']].translation[1],
    figure[bodyIds['rightUpperLeg']].translation[2]
  )
  myScale(1.0, 2.0, 1.0)
  switch (colorFlag) {
    case 1:
      setColor(0.0, 0.0, 0.0)
      break
    default:
      setColor(0.0, 0.0, 1.0)
      break
  }
  color = vec3(rColor, gColor, bColor)
  gl.uniform3fv(gl.getUniformLocation(program, 'vColor'), color)
  gl.drawArrays(viewAs, 0, numVertices)
}

const rightLowerLeg = () => {
  myRotation(rotation[bodyIds['rightLowerLeg']], 'x')
  myModelViewTranslation(
    figure[bodyIds['rightLowerLeg']].translation[0],
    figure[bodyIds['rightLowerLeg']].translation[1],
    figure[bodyIds['rightLowerLeg']].translation[2]
  )
  myScale(1.0, 1.0, 1.0)
  setColor(0.5, 0.5, 0.5)
  color = vec3(rColor, gColor, bColor)
  gl.uniform3fv(gl.getUniformLocation(program, 'vColor'), color)
  gl.drawArrays(viewAs, 0, numVertices)
}

const initNodes = (id) => {
  switch (id) {
    case bodyIds['torso']:
      figure[bodyIds['torso']] = createNode(
        torso,
        null,
        bodyIds['head'],
        null,
        [0.0, 0.0, 0.0]
      )
      break

    case bodyIds['head']:
      figure[bodyIds['head']] = createNode(
        head,
        bodyIds['leftUpperArm'],
        null,
        bodyIds['torso'],
        [0.0, torsoHeight * 0.5 + 1.0, 0.0]
      )
      break

    case bodyIds['leftUpperArm']:
      figure[bodyIds['leftUpperArm']] = createNode(
        leftUpperArm,
        bodyIds['rightUpperArm'],
        bodyIds['leftLowerArm'],
        bodyIds['torso'],
        [-(torsoWidth * 0.28152) - 0.28152, torsoHeight * 0.5 - 0.5, 0.0]
      )
      break

    case bodyIds['leftLowerArm']:
      figure[bodyIds['leftLowerArm']] = createNode(
        leftLowerArm,
        null,
        null,
        bodyIds['leftUpperArm'],
        [0.0, -1.5, 0.0]
      )
      break

    case bodyIds['rightUpperArm']:
      figure[bodyIds['rightUpperArm']] = createNode(
        rightUpperArm,
        bodyIds['leftUpperLeg'],
        bodyIds['rightLowerArm'],
        bodyIds['torso'],
        [torsoWidth * 0.28152 + 0.28152, torsoHeight * 0.5 - 0.5, 0.0]
      )
      break

    case bodyIds['rightLowerArm']:
      figure[bodyIds['rightLowerArm']] = createNode(
        rightLowerArm,
        null,
        null,
        bodyIds['rightUpperArm'],
        [0.0, -1.5, 0.0]
      )
      break

    case bodyIds['leftUpperLeg']:
      figure[bodyIds['leftUpperLeg']] = createNode(
        leftUpperLeg,
        bodyIds['rightUpperLeg'],
        bodyIds['leftLowerLeg'],
        bodyIds['torso'],
        [-(torsoWidth * 0.28152) + 0.28152, -(0.5 * torsoHeight) - 1.0, 0.0]
      )
      break

    case bodyIds['leftLowerLeg']:
      figure[bodyIds['leftLowerLeg']] = createNode(
        leftLowerLeg,
        null,
        null,
        bodyIds['leftUpperLeg'],
        [0.0, -1.5, 0.0]
      )
      break

    case bodyIds['rightUpperLeg']:
      figure[bodyIds['rightUpperLeg']] = createNode(
        rightUpperLeg,
        null,
        bodyIds['rightLowerLeg'],
        bodyIds['torso'],
        [torsoWidth * 0.28152 - 0.28152, -(0.5 * torsoHeight) - 1.0, 0.0]
      )
      break

    case bodyIds['rightLowerLeg']:
      figure[bodyIds['rightLowerLeg']] = createNode(
        rightLowerLeg,
        null,
        null,
        bodyIds['rightUpperLeg'],
        [0.0, -1.5, 0.0]
      )
      break
  }
}

window.addEventListener('load', () => {
  let lightAmbient = vec4(0.2, 0.2, 0.3, 1.0)
  let lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0)
  let lightSpecular = vec4(0.0, 0.0, 0.0, 1.0)
  let materialAmbient = vec4(1.0, 0.0, 1.0, 1.0)
  let materialDiffuse = vec4(1.0, 0.5, 0.0, 1.0)
  let materialSpecular = vec4(0.0, 0.0, 0.0, 1.0)
  let lightPosition = vec4(lightXposition, 1.5, 5.0, 0.0)
  let ambientProduct = mult(lightAmbient, materialAmbient)
  let diffuseProduct = mult(lightDiffuse, materialDiffuse)
  let specularProduct = mult(lightSpecular, materialSpecular)
  let materialShininess = 100
  let projection
  let projectionFlag = 1
  let projectionFlat_Glsl = 1

  canvas = document.getElementById('gl-canvas')

  //uncomment the next line if "webgl-utils.js" file is not included
  //gl = canvas.getContext("webgl");

  //comment the next line if "webgl-utils.js" file is not included
  gl = WebGLUtils.setupWebGL(canvas)

  if (!gl) {
    alert("WebGL isn't available")
  }

  gl.viewport(0, 0, canvas.width, canvas.height)

  //changing canvas location
  // canvas.style.left="400px";
  // canvas.style.top="100px";
  // canvas.style.position = "absolute";

  gl.clearColor(1.0, 1.0, 1.0, 1.0)

  //enabling hidden surface removal
  gl.enable(gl.DEPTH_TEST)

  program = initShaders(gl, 'vertex-shader', 'fragment-shader')
  gl.useProgram(program)

  cube()

  // normals buffer
  let nBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW)

  let vNormal = gl.getAttribLocation(program, 'vNormal')
  gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0)
  gl.enableVertexAttribArray(vNormal)

  // vertices buffer
  let vBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW)

  let vPosition = gl.getAttribLocation(program, 'vPosition')
  gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0)
  gl.enableVertexAttribArray(vPosition)

  // texture buffer
  let tBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW)

  let vTexCoord = gl.getAttribLocation(program, 'vTexCoord')
  gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0)
  gl.enableVertexAttribArray(vTexCoord)

  // menus:
  let colorListener = document.getElementById('colorMenu')
  colorListener.addEventListener('click', () => {
    switch (colorListener.selectedIndex) {
      case 0:
        colorFlag = 0
        console.log('Outfit 1')
        break
      case 1:
        colorFlag = 1
        console.log('Outfit 2')
        break
      case 2:
        colorFlag = 2
        console.log('Outfit 3')
        break
    }
  })

  let viewListener = document.getElementById('viewAsMenu')
  viewListener.addEventListener('click', () => {
    switch (viewListener.selectedIndex) {
      case 0:
        viewAs = gl.LINES
        textureFlag = 0
        console.log('Viewing as Wireframe')
        break
      case 2:
        textureFlag = 1
        console.log('Vieng as textures')
        break
      default:
        viewAs = gl.TRIANGLES
        textureFlag = 0
        console.log('Vieng as surfaces')
        break
    }
    gl.uniform1i(gl.getUniformLocation(program, 'textureFlag'), textureFlag)
  })

  const lightListener = document.getElementById('lightMenu')
  lightListener.addEventListener('click', () => {
    switch (lightListener.selectedIndex) {
      case 0:
        lightScene = 0

        lightAmbient = vec4(0.2, 0.2, 0.3, 1.0)
        lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0)
        lightSpecular = vec4(0.0, 0.0, 0.0, 1.0)

        materialAmbient = vec4(1.0, 0.0, 1.0, 1.0)
        materialDiffuse = vec4(1.0, 0.5, 0.0, 1.0)
        materialSpecular = vec4(0.0, 0.0, 0.0, 1.0)

        lightPosition = vec4(lightXposition, 1.0, 1.0, 0.0)

        materialShininess = 100

        ambientProduct = mult(lightAmbient, materialAmbient)
        diffuseProduct = mult(lightDiffuse, materialDiffuse)
        specularProduct = mult(lightSpecular, materialSpecular)

        console.log('Lightning scene 1')
        break

      case 1:
        lightScene = 1

        lightAmbient = vec4(0.3, 0.1, 0.1, 1.0)
        lightDiffuse = vec4(0.3, 0.3, 1.0, 1.0)
        lightSpecular = vec4(0.0, 0.0, 0.0, 1.0)

        materialAmbient = vec4(1.0, 1.0, 1.0, 1.0)
        materialDiffuse = vec4(1.0, 0.5, 0.0, 1.0)
        materialSpecular = vec4(0.0, 0.0, 0.0, 1.0)

        lightPosition = vec4(lightXposition, 1.0, 1.0, 0.0)

        materialShininess = 100

        ambientProduct = mult(lightAmbient, materialAmbient)
        diffuseProduct = mult(lightDiffuse, materialDiffuse)
        specularProduct = mult(lightSpecular, materialSpecular)

        console.log('Lightning scene 2')
        break

      case 2:
        lightScene = 2

        lightAmbient = vec4(0.2, 0.2, 0.3, 1.0)
        lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0)
        lightSpecular = vec4(0.0, 0.0, 0.0, 1.0)

        materialAmbient = vec4(1.0, 0.0, 1.0, 1.0)
        materialDiffuse = vec4(1.0, 0.5, 0.0, 1.0)
        materialSpecular = vec4(0.0, 0.0, 0.0, 1.0)

        lightPosition = vec4(lightXposition, 1.5, 5.0, 0.0)

        ambientProduct = mult(lightAmbient, materialAmbient)
        diffuseProduct = mult(lightDiffuse, materialDiffuse)
        specularProduct = mult(lightSpecular, materialSpecular)

        materialShininess = 100

        console.log('Lightning scene 3')
        break
    }
    gl.uniform4fv(
      gl.getUniformLocation(program, 'ambientProduct'),
      flatten(ambientProduct)
    )
    gl.uniform4fv(
      gl.getUniformLocation(program, 'diffuseProduct'),
      flatten(diffuseProduct)
    )
    gl.uniform4fv(
      gl.getUniformLocation(program, 'specularProduct'),
      flatten(specularProduct)
    )
    gl.uniform4fv(
      gl.getUniformLocation(program, 'lightPosition'),
      flatten(lightPosition)
    )
    gl.uniform1f(gl.getUniformLocation(program, 'shininess'), materialShininess)
  })

  // sliders:
  document
    .getElementById('yRotationSlider')
    .addEventListener('change', (e) => {
      yRotation = e.target.value
    })
  document.getElementById('Transparency').onchange = function () {
    transparency = this.value / 10
    gl.uniform1f(gl.getUniformLocation(program, 'transparency'), transparency)
  }
  document.getElementById('lowerArmsRotationSlider').onchange = function () {
    rotation[bodyIds['leftLowerArm']] = this.value
    rotation[bodyIds['rightLowerArm']] = this.value
  }
  document.getElementById('lowerLegsRotationSlider').onchange = function () {
    rotation[bodyIds['leftUpperLeg']] = this.value
    rotation[bodyIds['rightUpperLeg']] = -this.value
    rotation[bodyIds['leftLowerLeg']] = this.value
    rotation[bodyIds['rightLowerLeg']] = -this.value
  }
  document.getElementById('lightLocation').addEventListener('change', (e) => {
    switch (lightScene) {
      case 0:
        lightPosition = vec4(e.traget.value, 1.0, 1.0, 0.0)
        lightXposition = e.target.value
        break

      case 1:
        lightPosition = vec4(e.target.value, 1.0, 1.0, 0.0)
        lightXposition = e.target.value
        break

      case 2:
        lightPosition = vec4(e.target.value, 1.5, 5.0, 0.0)
        lightXposition = e.target.value
        break
    }

    gl.uniform4fv(
      gl.getUniformLocation(program, 'lightPosition'),
      flatten(lightPosition)
    )
  })

  // key events:
  window.addEventListener('keydown', (event) => {
    switch (event.key) {
      case 'a':
        moveX -= 0.1
        break
      case 'w':
        moveY += 0.1
        break
      case 'd':
        moveX += 0.1
        break
      case 's':
        moveY -= 0.1
        break
      case 'e':
        moveZ += 0.1
        break
      case 'q':
        moveZ -= 0.1
        break
    }
    myTranslation(moveX, moveY, moveZ)
  })

  // buttons:
  document.getElementById('Button1').addEventListener('click', () => {
    projectionFlag = projectionFlag === 1 ? 0 : 1
    projectionFlat_Glsl = projectionFlag
    gl.uniform1f(
      gl.getUniformLocation(program, 'projectionFlag'),
      projectionFlat_Glsl
    )
    if (projectionFlag === 0) {
      projection = ortho(-7.0, 7.0, -7.0, 7.0, -100.0, 100.0)
      console.log('Projection is orthogonal')
    } else {
      projection = perspective(45.0, canvas.width / canvas.height, 1.0, 40.0)
      console.log('Projection is perspective')
    }

    gl.uniformMatrix4fv(
      gl.getUniformLocation(program, 'projection'),
      false,
      flatten(projection)
    )
  })

  document.getElementById('Button2').onclick = function () {
    lightFlag = lightFlag == 1 ? 0 : 1
    gl.uniform1i(gl.getUniformLocation(program, 'lightFlag'), lightFlag)
    if (lightFlag === 0) {
      console.log('Light off')
    } else {
      console.log('Light on')
    }
  }

  document.getElementById('Button3').onclick = function () {
    torsoWidth = torsoWidth === 2.0 ? 5.0 : 2.0

    for (let i = 0; i < numNodes; i++) {
      initNodes(i)

      if (figure[i].father != null) {
        figure[i].translation[0] += figure[figure[i].father].translation[0]
        figure[i].translation[1] += figure[figure[i].father].translation[1]
        figure[i].translation[2] += figure[figure[i].father].translation[2]
      }
    }
  }

  viewAs = gl.TRIANGLES

  for (let i = 0; i < numNodes; i++) {
    initNodes(i)

    if (figure[i].father != null) {
      figure[i].translation[0] += figure[figure[i].father].translation[0]
      figure[i].translation[1] += figure[figure[i].father].translation[1]
      figure[i].translation[2] += figure[figure[i].father].translation[2]
    }
  }

  gl.uniform4fv(
    gl.getUniformLocation(program, 'ambientProduct'),
    flatten(ambientProduct)
  )
  gl.uniform4fv(
    gl.getUniformLocation(program, 'diffuseProduct'),
    flatten(diffuseProduct)
  )
  gl.uniform4fv(
    gl.getUniformLocation(program, 'specularProduct'),
    flatten(specularProduct)
  )
  gl.uniform4fv(
    gl.getUniformLocation(program, 'lightPosition'),
    flatten(lightPosition)
  )
  gl.uniform1f(gl.getUniformLocation(program, 'shininess'), materialShininess)

  gl.uniform1f(
    gl.getUniformLocation(program, 'projectionFlag'),
    projectionFlat_Glsl
  )

  transparency = 1.0
  gl.uniform1f(gl.getUniformLocation(program, 'transparency'), transparency)

  projection = perspective(45.0, canvas.width / canvas.height, 1.0, 40.0)

  gl.uniformMatrix4fv(
    gl.getUniformLocation(program, 'projection'),
    false,
    flatten(projection)
  )

  gl.uniform1i(gl.getUniformLocation(program, 'lightFlag'), lightFlag)

  let image = document.getElementById('texImage')

  configureTexture(image2)

  render()
})

const render = () => {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  traverse(bodyIds['torso'])

  requestAnimFrame(render)
}
