
var program;
var canvas;
var gl;

var numVertices  = 36;

var pointsArray = [];
var normalsArray = [];

// lightning and shading:

var ambientProduct;
var diffuseProduct;
var specularProduct;

var lightScene=2;

var lightPosition;

var lightXposition=1.0;

var lightAmbient;
var lightDiffuse;
var lightSpecular;

var materialAmbient;
var materialDiffuse;
var materialSpecular;

var materialShininess;

var lightFlag=1;

// colors, view, and transparency:

var color;

var viewAs;

var rColor;
var gColor;
var bColor;

var transparency=1.0;

var colorFlag=0;

// projection:

var projection;
var projectionFlag=1;
var projectionFlat_Glsl=1;

// moving:

var yRotation=-20.0;

var rotation=[0.0,0.0,0.0,-13.0,0.0,-13.0,4.0,4.0,-4.0,-4.0];

var moveX=0.0;
var moveY=0.0;
var moveZ=0.0;

var xTeta=0;
var yTeta=0;
var zTeta=0;

// object variables:

var figure = [];

var numNodes=10;

var torsoId = 0;
var headId  = 1;
var leftUpperArmId = 2;
var leftLowerArmId = 3;
var rightUpperArmId = 4;
var rightLowerArmId = 5;
var leftUpperLegId = 6;
var leftLowerLegId = 7;
var rightUpperLegId = 8;
var rightLowerLegId = 9;

var torsoHeight=5.0;
var torsoWidth=2.0;
var headHeight=2.0;
var headWidth=2.0;

// cube vertices:

var vertices = [

  vec4( -0.28152, -0.5,  0.28152, 1.0 ),
  vec4( -0.28152,  0.5,  0.28152, 1.0 ),
  vec4( 0.28152,  0.5,  0.28152, 1.0 ),
  vec4( 0.28152, -0.5,  0.28152, 1.0 ),
  vec4( -0.28152, -0.5, -0.28152, 1.0 ),
  vec4( -0.28152,  0.5, -0.28152, 1.0 ),
  vec4( 0.28152,  0.5, -0.28152, 1.0 ),
  vec4( 0.28152, -0.5, -0.28152, 1.0 )

];


// texture:

var texCoord =[
  vec2(0,0),
  vec2(0,1),
  vec2(1,1),
  vec2(1,0)
];

var texCoordsArray=[];

var texSize = 64;

var textureFlag=0;

var image1 = new Array()
    for (var i =0; i<texSize; i++)  image1[i] = new Array();
    for (var i =0; i<texSize; i++)
        for ( var j = 0; j < texSize; j++)
           image1[i][j] = new Float32Array(4);
    for (var i =0; i<texSize; i++) for (var j=0; j<texSize; j++) {
        var c = (((i & 0x8) == 0) ^ ((j & 0x8)  == 0));
        image1[i][j] = [c, c, c, 1];
    }

var image2 = new Uint8Array(4*texSize*texSize);

    for ( var i = 0; i < texSize; i++ )
        for ( var j = 0; j < texSize; j++ )
           for(var k =0; k<4; k++)
                image2[4*texSize*i+4*j+k] = 255*image1[i][j][k];

// functions:

function quad(a, b, c, d) {

  var t1 = subtract(vertices[b], vertices[a]);
  var t2 = subtract(vertices[c], vertices[b]);
  var normal = cross(t1, t2);
  var normal = vec3(normal);

  pointsArray.push(vertices[a]);
  normalsArray.push(normal);
  texCoordsArray.push(texCoord[0]);
  pointsArray.push(vertices[b]);
  normalsArray.push(normal);
  texCoordsArray.push(texCoord[1]);
  pointsArray.push(vertices[c]);
  normalsArray.push(normal);
  texCoordsArray.push(texCoord[2]);
  pointsArray.push(vertices[a]);
  normalsArray.push(normal);
  texCoordsArray.push(texCoord[0]);
  pointsArray.push(vertices[c]);
  normalsArray.push(normal);
  texCoordsArray.push(texCoord[2]);
  pointsArray.push(vertices[d]);
  normalsArray.push(normal);
  texCoordsArray.push(texCoord[3]);

}


function cube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}

function myModelViewTranslation(thisTx,thisTy,thisTz) {

  gl.uniform1f(gl.getUniformLocation(program,"modelTx"),thisTx);
  gl.uniform1f(gl.getUniformLocation(program,"modelTy"),thisTy);
  gl.uniform1f(gl.getUniformLocation(program,"modelTz"),thisTz);

}

function myTranslation(thisTx,thisTy,thisTz) {

  gl.uniform1f(gl.getUniformLocation(program,"tx"),thisTx);
  gl.uniform1f(gl.getUniformLocation(program,"ty"),thisTy);
  gl.uniform1f(gl.getUniformLocation(program,"tz"),thisTz);

}

function myScale(thisSx,thisSy,thisSz) {

  gl.uniform1f(gl.getUniformLocation(program,"sx"),thisSx);
  gl.uniform1f(gl.getUniformLocation(program,"sy"),thisSy);
  gl.uniform1f(gl.getUniformLocation(program,"sz"),thisSz);

}

function myRotation(teta,axis) {

   xTeta;
   yTeta;
   zTeta;

   if(axis==='x') {

     xTeta=teta;
     gl.uniform3fv(gl.getUniformLocation(program,"omega"),[xTeta,yTeta,zTeta]);

   }
   else if (axis==='y') {

     yTeta=teta;
     gl.uniform3fv(gl.getUniformLocation(program,"omega"),[xTeta,yTeta,zTeta]);

   }
   else if (axis==='z') {

     zTeta=teta;
     gl.uniform3fv(gl.getUniformLocation(program,"omega"),[xTeta,yTeta,zTeta]);

   }

}

function setColor(thisRcolor,thisGcolor,thisBcolor) {

  rColor=thisRcolor;
  gColor=thisGcolor;
  bColor=thisBcolor;

}

function createNode(render, sibling, child, father, translation) {

    var node = {
    render: render,
    sibling: sibling,
    child: child,
    father: father,
    translation: translation,
    }

    return node;
}

function traverse(Id) {

   if(Id == null) return;

   myRotation(yRotation,'y');

   figure[Id].render();

   if(figure[Id].child != null) traverse(figure[Id].child);
   if(figure[Id].sibling != null) traverse(figure[Id].sibling);

}

function configureTexture(image) {
    var texture = gl.createTexture();
    gl.activeTexture( gl.TEXTURE0 );
    gl.bindTexture( gl.TEXTURE_2D, texture );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0,
        gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
        gl.NEAREST_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
}

function torso() {

  myRotation(rotation[torsoId],'x');
  myModelViewTranslation(figure[torsoId].translation[0],figure[torsoId].translation[1],figure[torsoId].translation[2]);
  myScale(torsoWidth,torsoHeight,1.0);
  switch(colorFlag) {
    case 0:
    setColor(0.0,1.0,1.0);
    break;
    case 1:
    setColor(1.0,0.0,0.0);
    break;
    case 2:
    setColor(0.0,0.0,0.0);
    break;
  }
  color=vec3(rColor,gColor,bColor);
  gl.uniform3fv(gl.getUniformLocation(program,"vColor"),color);
  gl.drawArrays( viewAs, 0, numVertices );

}

function head() {

  myRotation(rotation[headId],'x');
  myModelViewTranslation(figure[headId].translation[0],figure[headId].translation[1],figure[headId].translation[2]);
  myScale(headWidth,headHeight,headWidth);
  setColor(1.0,0.89,0.77);
  color=vec3(rColor,gColor,bColor);
  gl.uniform3fv(gl.getUniformLocation(program,"vColor"),color);
  gl.drawArrays(viewAs, 0, numVertices );

}

function leftUpperArm() {

  myRotation(rotation[leftUpperArmId],'x');
  myModelViewTranslation(figure[leftUpperArmId].translation[0],figure[leftUpperArmId].translation[1],figure[leftUpperArmId].translation[2]);
  myScale(1.0,1.0,1.0);
  switch(colorFlag) {
    case 0:
    setColor(0.0,1.0,1.0);
    break;
    case 1:
    setColor(1.0,0.0,0.0);
    break;
    case 2:
    setColor(0.0,0.0,0.0);
    break;
  }
  color=vec3(rColor,gColor,bColor);
  gl.uniform3fv(gl.getUniformLocation(program,"vColor"),color);
  gl.drawArrays( viewAs, 0, numVertices );

}

function leftLowerArm() {

  myRotation(rotation[leftLowerArmId],'x');
  myModelViewTranslation(figure[leftLowerArmId].translation[0],figure[leftLowerArmId].translation[1],figure[leftLowerArmId].translation[2]);
  myScale(1.0,2.0,1.0);
  setColor(1.0,0.89,0.77);
  color=vec3(rColor,gColor,bColor);
  gl.uniform3fv(gl.getUniformLocation(program,"vColor"),color);
  gl.drawArrays( viewAs, 0, numVertices );

}

function rightUpperArm() {

  myRotation(rotation[rightUpperArmId],'x');
  myModelViewTranslation(figure[rightUpperArmId].translation[0],figure[rightUpperArmId].translation[1],figure[rightUpperArmId].translation[2]);
  myScale(1.0,1.0,1.0);
  switch(colorFlag) {
    case 0:
    setColor(0.0,1.0,1.0);
    break;
    case 1:
    setColor(1.0,0.0,0.0);
    break;
    case 2:
    setColor(0.0,0.0,0.0);
    break;
  }
  color=vec3(rColor,gColor,bColor);
  gl.uniform3fv(gl.getUniformLocation(program,"vColor"),color);
  gl.drawArrays( viewAs, 0, numVertices );

}

function rightLowerArm() {

  myRotation(rotation[rightLowerArmId],'x');
  myModelViewTranslation(figure[rightLowerArmId].translation[0],figure[rightLowerArmId].translation[1],figure[rightLowerArmId].translation[2]);
  myScale(1.0,2.0,1.0);
  setColor(1.0,0.89,0.77);
  color=vec3(rColor,gColor,bColor);
  gl.uniform3fv(gl.getUniformLocation(program,"vColor"),color);
  gl.drawArrays( viewAs, 0, numVertices );

}

function  leftUpperLeg() {

  myRotation(rotation[leftUpperLegId],'x');
  myModelViewTranslation(figure[leftUpperLegId].translation[0],figure[leftUpperLegId].translation[1],figure[leftUpperLegId].translation[2]);
  myScale(1.0,2.0,1.0);
  switch(colorFlag) {
    case 1:
    setColor(0.0,0.0,0.0);
    break;
    default:
    setColor(0.0,0.0,1.0);
    break;
  }
  color=vec3(rColor,gColor,bColor);
  gl.uniform3fv(gl.getUniformLocation(program,"vColor"),color);
  gl.drawArrays( viewAs, 0, numVertices );

}

function leftLowerLeg() {

  myRotation(rotation[leftLowerLegId],'x');
  myModelViewTranslation(figure[leftLowerLegId].translation[0],figure[leftLowerLegId].translation[1],figure[leftLowerLegId].translation[2]);
  myScale(1.0,1.0,1.0);
  setColor(0.5,0.5,0.5);
  color=vec3(rColor,gColor,bColor);
  gl.uniform3fv(gl.getUniformLocation(program,"vColor"),color);
  gl.drawArrays( viewAs, 0, numVertices );

}

function rightUpperLeg() {

  myRotation(rotation[rightUpperLegId],'x');
  myModelViewTranslation(figure[rightUpperLegId].translation[0],figure[rightUpperLegId].translation[1],figure[rightUpperLegId].translation[2]);
  myScale(1.0,2.0,1.0);
  switch(colorFlag) {
    case 1:
    setColor(0.0,0.0,0.0);
    break;
    default:
    setColor(0.0,0.0,1.0);
    break;
  }
  color=vec3(rColor,gColor,bColor);
  gl.uniform3fv(gl.getUniformLocation(program,"vColor"),color);
  gl.drawArrays( viewAs, 0, numVertices );

}

function rightLowerLeg() {

  myRotation(rotation[rightLowerLegId],'x');
  myModelViewTranslation(figure[rightLowerLegId].translation[0],figure[rightLowerLegId].translation[1],figure[rightLowerLegId].translation[2]);
  myScale(1.0,1.0,1.0);
  setColor(0.5,0.5,0.5);
  color=vec3(rColor,gColor,bColor);
  gl.uniform3fv(gl.getUniformLocation(program,"vColor"),color);
  gl.drawArrays( viewAs, 0, numVertices );

}

function initNodes(Id) {

    switch(Id) {

    case torsoId:
    figure[torsoId] = createNode(torso, null, headId, null, [0.0,0.0,0.0]);
    break;

    case headId:
    figure[headId] = createNode(head,leftUpperArmId,null,torsoId,[0.0,(torsoHeight*0.5)+1.0,0.0]);
    break;

    case leftUpperArmId:
    figure[leftUpperArmId] = createNode(leftUpperArm, rightUpperArmId,leftLowerArmId,torsoId,[-(torsoWidth*0.28152)-0.28152,(torsoHeight*0.5)-0.5,0.0]);
    break;

    case leftLowerArmId:
    figure[leftLowerArmId] = createNode(leftLowerArm, null,null,leftUpperArmId,[0.0,-1.5,0.0]);
    break;

    case rightUpperArmId:
    figure[rightUpperArmId] = createNode(rightUpperArm, leftUpperLegId,rightLowerArmId,torsoId,[(torsoWidth*0.28152)+0.28152,(torsoHeight*0.5)-0.5,0.0]);
    break;

    case rightLowerArmId:
    figure[rightLowerArmId] = createNode(rightLowerArm, null,null,rightUpperArmId,[0.0,-1.5,0.0]);
    break;

    case leftUpperLegId:
    figure[leftUpperLegId] = createNode(leftUpperLeg,rightUpperLegId,leftLowerLegId,torsoId,[-(torsoWidth*0.28152)+0.28152,-(0.5*torsoHeight)-1.0,0.0]);
    break;

    case leftLowerLegId:
    figure[leftLowerLegId] = createNode(leftLowerLeg, null,null,leftUpperLegId,[0.0,-1.5,0.0]);
    break;

    case rightUpperLegId:
    figure[rightUpperLegId] = createNode(rightUpperLeg,null,rightLowerLegId,torsoId,[(torsoWidth*0.28152)-0.28152,-(0.5*torsoHeight)-1.0,0.0]);
    break;

    case rightLowerLegId:
    figure[rightLowerLegId] = createNode(rightLowerLeg, null,null,rightUpperLegId,[0.0,-1.5,0.0]);
    break;

    }
}

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );

    //uncomment the next line if "webgl-utils.js" file is not included
    //gl = canvas.getContext("webgl");

    //comment the next line if "webgl-utils.js" file is not included
    gl = WebGLUtils.setupWebGL( canvas );

    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );

    //changing canvas location
    // canvas.style.left="400px";
    // canvas.style.top="100px";
    // canvas.style.position = "absolute";

    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //enabling hidden surface removal
    gl.enable(gl.DEPTH_TEST);

    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    cube();

    // normals buffer
    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );

    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal );

    // vertices buffer
    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    // texture buffer
    var tBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW );

    var vTexCoord = gl.getAttribLocation( program, "vTexCoord" );
    gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vTexCoord );

    // menus:
    var colorListener = document.getElementById("colorMenu");
    colorListener.addEventListener("click",function(){
      switch(colorListener.selectedIndex) {
        case 0:
        colorFlag=0;
        console.log("Outfit 1");
        break;
        case 1:
        colorFlag=1;
        console.log("Outfit 2");
        break;
        case 2:
        colorFlag=2;
        console.log("Outfit 3");
        break;
      }
    });

    var viewListener = document.getElementById("viewAsMenu");
    viewListener.addEventListener("click",function(){
      switch(viewListener.selectedIndex) {
        case 0:
        viewAs=gl.LINES;
        textureFlag=0;
        console.log("Viewing as Wireframe");
        break;
        case 2:
        textureFlag=1;
        console.log("Vieng as textures");
        break;
        default:
        viewAs=gl.TRIANGLES;
        textureFlag=0;
        console.log("Vieng as surfaces");
        break;
      }
      gl.uniform1i(gl.getUniformLocation(program,"textureFlag"),textureFlag);
    });

    var lightListener = document.getElementById("lightMenu");
    lightListener.addEventListener("click",function(){
      switch(lightListener.selectedIndex) {
        case 0:
        lightScene=0;

        lightAmbient = vec4(0.2, 0.2, 0.3, 1.0 );
        lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
        lightSpecular = vec4( 0.0, 0.0, 0.0, 1.0 );

        materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
        materialDiffuse = vec4( 1.0, 0.5, 0.0, 1.0);
        materialSpecular = vec4( 0.0, 0.0, 0.0, 1.0 );

        lightPosition = vec4(lightXposition, 1.0, 1.0, 0.0 );

        materialShininess=100;

        ambientProduct = mult(lightAmbient, materialAmbient);
        diffuseProduct = mult(lightDiffuse, materialDiffuse);
        specularProduct = mult(lightSpecular, materialSpecular);

        console.log("Lightning scene 1");
        break;
        case 1:
        lightScene=1;

        lightAmbient = vec4(0.3, 0.1, 0.1, 1.0 );
        lightDiffuse = vec4( 0.3, 0.3, 1.0, 1.0 );
        lightSpecular = vec4( 0.0, 0.0, 0.0, 1.0 );

        materialAmbient = vec4( 1.0, 1.0, 1.0, 1.0 );
        materialDiffuse = vec4( 1.0, 0.5, 0.0, 1.0);
        materialSpecular = vec4( 0.0, 0.0, 0.0, 1.0 );

        lightPosition = vec4(lightXposition, 1.0, 1.0, 0.0 );

        materialShininess=100;

        ambientProduct = mult(lightAmbient, materialAmbient);
        diffuseProduct = mult(lightDiffuse, materialDiffuse);
        specularProduct = mult(lightSpecular, materialSpecular);

        console.log("Lightning scene 2");
        break;
        case 2:
        lightScene=2;

        lightAmbient = vec4(0.2, 0.2, 0.3, 1.0 );
        lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
        lightSpecular = vec4( 0.0, 0.0, 0.0, 1.0 );

        materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
        materialDiffuse = vec4( 1.0, 0.5, 0.0, 1.0);
        materialSpecular = vec4( 0.0, 0.0, 0.0, 1.0 );

        lightPosition = vec4(lightXposition,1.5,5.0,0.0);

        ambientProduct = mult(lightAmbient, materialAmbient);
        diffuseProduct = mult(lightDiffuse, materialDiffuse);
        specularProduct = mult(lightSpecular, materialSpecular);

        materialShininess=100;

        console.log("Lightning scene 3");
        break;
      }
      gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),
         flatten(ambientProduct));
      gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),
         flatten(diffuseProduct) );
      gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"),
         flatten(specularProduct) );
      gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"),
         flatten(lightPosition) );
      gl.uniform1f(gl.getUniformLocation(program,
        "shininess"),materialShininess);
    });


    // sliders:
    document.getElementById("yRotationSlider").onchange = function() {
      yRotation=event.target.value;
    }
    document.getElementById("Transparency").onchange = function() {
      transparency=this.value/10;
      gl.uniform1f(gl.getUniformLocation(program,"transparency"),transparency);
    }
    document.getElementById("lowerArmsRotationSlider").onchange = function() {
      rotation[leftLowerArmId]=this.value;
      rotation[rightLowerArmId]=this.value;
    }
    document.getElementById("lowerLegsRotationSlider").onchange = function() {
      rotation[leftUpperLegId]=this.value;
      rotation[rightUpperLegId]=-this.value;
      rotation[leftLowerLegId]=this.value;
      rotation[rightLowerLegId]=-this.value;

    }
    document.getElementById("lightLocation").onchange = function() {
      switch(lightScene) {
        case 0:
        lightPosition = vec4(this.value, 1.0, 1.0, 0.0 );
        lightXposition=this.value;
        break;
        case 1:
        lightPosition = vec4(this.value, 1.0, 1.0, 0.0 );
        lightXposition=this.value;
        break;
        case 2:
        lightPosition = vec4(this.value,1.5,5.0,0.0);
        lightXposition=this.value;
        break;
      }
      gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"),
         flatten(lightPosition) );
    }

    // key events:
    window.addEventListener("keydown", function() {
      switch(event.keyCode) {
        case 65:
        moveX-=0.1;
        break;
        case 87:
        moveY+=0.1;
        break;
        case 68:
        moveX+=0.1;
        break;
        case 83:
        moveY-=0.1;
        break;
        case 69:
        moveZ+=0.1;
        break;
        case 81:
        moveZ-=0.1;
        break;
      }
      myTranslation(moveX,moveY,moveZ);
    });

    // buttons:
    document.getElementById("Button1").onclick = function(){
      projectionFlag=projectionFlag===1?0:1;
      projectionFlat_Glsl=projectionFlag;
      gl.uniform1f(gl.getUniformLocation(program,"projectionFlag"),projectionFlat_Glsl);
      if(projectionFlag===0) {
          projection=ortho(-7.0,7.0,-7.0,7.0,-100.0,100.0);
          console.log("Projection is orthogonal");

      }
      else {

          projection=perspective(45.0,canvas.width/canvas.height,1.0,40.0);
          console.log("Projection is perspective");

      }

      gl.uniformMatrix4fv(gl.getUniformLocation(program,"projection"),false,flatten(projection));

    };

    document.getElementById("Button2").onclick = function(){

      lightFlag=lightFlag==1?0:1;
      gl.uniform1i(gl.getUniformLocation(program,"lightFlag"),lightFlag);
      if(lightFlag===0) {
        console.log("Light off");
      }
      else {
        console.log("Light on");
      }

    };

    document.getElementById("Button3").onclick = function(){

      torsoWidth=torsoWidth===2.0?5.0:2.0;

      for(var i=0; i<numNodes; i++) {

      initNodes(i);

      if(figure[i].father!=null) {
      figure[i].translation[0]+=figure[figure[i].father].translation[0];
      figure[i].translation[1]+=figure[figure[i].father].translation[1];
      figure[i].translation[2]+=figure[figure[i].father].translation[2];
      }

     }
    }

    viewAs=gl.TRIANGLES;

    for(var i=0; i<numNodes; i++) {

    initNodes(i);

    if(figure[i].father!=null) {
    figure[i].translation[0]+=figure[figure[i].father].translation[0];
    figure[i].translation[1]+=figure[figure[i].father].translation[1];
    figure[i].translation[2]+=figure[figure[i].father].translation[2];
    }

   }

   lightAmbient = vec4(0.2, 0.2, 0.3, 1.0 );
   lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
   lightSpecular = vec4( 0.0, 0.0, 0.0, 1.0 );

   materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
   materialDiffuse = vec4( 1.0, 0.5, 0.0, 1.0);
   materialSpecular = vec4( 0.0, 0.0, 0.0, 1.0 );

   lightPosition = vec4(lightXposition,1.5,5.0,0.0);

   ambientProduct = mult(lightAmbient, materialAmbient);
   diffuseProduct = mult(lightDiffuse, materialDiffuse);
   specularProduct = mult(lightSpecular, materialSpecular);

   materialShininess=100;

   gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),
      flatten(ambientProduct));
   gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),
      flatten(diffuseProduct) );
   gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"),
      flatten(specularProduct) );
   gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"),
      flatten(lightPosition) );
   gl.uniform1f(gl.getUniformLocation(program,
     "shininess"),materialShininess);

   gl.uniform1f(gl.getUniformLocation(program,"projectionFlag"),projectionFlat_Glsl);

   transparency=1.0;
   gl.uniform1f(gl.getUniformLocation(program,"transparency"),transparency);

   projection=perspective(45.0,canvas.width/canvas.height,1.0,40.0);

   gl.uniformMatrix4fv(gl.getUniformLocation(program,"projection"),false,flatten(projection));

   gl.uniform1i(gl.getUniformLocation(program,"lightFlag"),lightFlag);

   var image = document.getElementById("texImage");

   configureTexture(image2);

   render();

}

var render = function(){

  gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  traverse(torsoId);

  requestAnimFrame(render);

}
