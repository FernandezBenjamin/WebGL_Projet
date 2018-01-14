
// On fait "e" pour ajouter un os du squelette sur blender
//Lensflars - Pour source lumineuse
//Particles - particles/sprites pour un coté "magique"
//Go faire des recherches en modes "smoke threejs"




var camera, scene, renderer, controls;

var objects = [];

var raycaster;

var blocker = document.getElementById( 'blocker' );
var instructions = document.getElementById( 'instructions' );


  var parameters = {
    oceanSide: 1000,
    size: 4.0,
    distortionScale: 3.7,
    alpha: 1.0
  };


var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

if ( havePointerLock ) {

  var element = document.body;

  var pointerlockchange = function ( event ) {

    if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {

      controlsEnabled = true;
      controls.enabled = true;

      blocker.style.display = 'none';

    } else {

      controls.enabled = false;

      blocker.style.display = 'block';

      instructions.style.display = '';

    }

  };

  var pointerlockerror = function ( event ) {

    instructions.style.display = '';

  };

  // Hook pointer lock state change events
  document.addEventListener( 'pointerlockchange', pointerlockchange, false );
  document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
  document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );

  document.addEventListener( 'pointerlockerror', pointerlockerror, false );
  document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
  document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );

  instructions.addEventListener( 'click', function ( event ) {

    instructions.style.display = 'none';

    // Ask the browser to lock the pointer
    element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
    element.requestPointerLock();

  }, false );

} else {

  instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';

}

init();
animate();

var controlsEnabled = false;

var moveForward = false;
var moveBackward = false;
var moveLeft = false;
var moveRight = false;
var canJump = false;

var prevTime = performance.now();
var velocity = new THREE.Vector3();
var direction = new THREE.Vector3();

function init() {

  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );
  camera.position.set(0, 50, 100);
  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0xffffff );
  scene.fog = new THREE.Fog( 0xffffff, 0, 750 );


  /*==============================================
                    SOUND
================================================*/

    var listener = new THREE.AudioListener();
    camera.add( listener );

    var sound = new THREE.Audio( listener );

    var audioLoader = new THREE.AudioLoader();

    audioLoader.load( 'sound/pluie.ogg', function( buffer ) {
      sound.setBuffer( buffer );
      sound.setLoop( true );
      sound.setVolume( 0.5 );
      sound.play();
    });

  var light = new THREE.HemisphereLight( 0xeeeeff, 0x777788, 0.75 );
  light.position.set( 0.5, 1, 0.75 );
//  scene.add( light );

  controls = new THREE.PointerLockControls( camera );
  scene.add( controls.getObject() );



  var onKeyDown = function ( event ) {

    switch ( event.keyCode ) {

      case 38: // up
      case 90: // z
      case 15:
        moveForward = true;
        break;

      case 37: // left
      case 81: // q
        moveLeft = true;
        break;

      case 40: // down
      case 83: // s
        moveBackward = true;
        break;

      case 39: // right
      case 68: // d
        moveRight = true;
        break;

      case 32: // space
        if ( canJump === true ) velocity.y += 350;
        canJump = false;
        break;

    }

  };

  var onKeyUp = function ( event ) {

    switch( event.keyCode ) {

      case 38: // up
      case 90: // z
      case 15:
        moveForward = false;
        break;

      case 37: // left
      case 81: // q
        moveLeft = false;
        break;

      case 40: // down
      case 83: // s
        moveBackward = false;
        break;

      case 39: // right
      case 68: // d
        moveRight = false;
        break;

    }

  };

  document.addEventListener( 'keydown', onKeyDown, false );
  document.addEventListener( 'keyup', onKeyUp, false );

  raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, -1, 0), 0, 10 );





  var textureSBO = 'textures/salle/patronv5.png';
  var textureFinale = 'textures/salle/patronfin.png';

  setSkybox(0, 150, 0, textureSBO);

  setSkybox(1200, 150, -2300, textureSBO);
  setSkybox(-1200, 150, -2300, textureSBO);

  // setSkybox(4000, 150, -4600, textureSBO);
  // setSkybox(1200, 150, -4600, textureSBO);
  // setSkybox(-1200, 150, -4600, textureSBO);
  // setSkybox(-4000, 150, -4600, textureSBO);


//NANI ????????
  // setSkybox(0, 150, -8000, textureFinale);




  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  window.addEventListener( 'resize', onWindowResize, false );

}


// ______ Fonctions ______ //

  function setSkybox(a, b, c, d) {
    cubeMap = new THREE.CubeTexture( [] );
    cubeMap.format = THREE.RGBFormat;
    var loader = new THREE.ImageLoader();
    loader.load( d, function ( image ) {
      var getSide = function ( x, y ) {
        var size = 1770;
        // 2220 - 1770
        var canvas = document.createElement( 'canvas' );
        canvas.width = size;
        canvas.height = size;
        var context = canvas.getContext( '2d' );
        context.drawImage( image, - x * size, - y * size);
        return canvas;
      };
      // Ici, la premiere valeur sera le x et la deuxieme sera y. y partant du haut-gauche
      cubeMap.images[ 0 ] = getSide( 0, 1 ); // px //entrée
      cubeMap.images[ 1 ] = getSide( 2, 1 ); // nx //fond

      cubeMap.images[ 2 ] = getSide( 1, 0 ); // pz - plafond
      cubeMap.images[ 3 ] = getSide( 1, 2 ); // nz - sol

      cubeMap.images[ 4 ] = getSide( 3, 1 ); // py - mur
      cubeMap.images[ 5 ] = getSide( 1, 1 ); // ny - mur


      cubeMap.needsUpdate = true;
    } );
    var cubeShader = THREE.ShaderLib[ 'cube' ];
    cubeShader.uniforms[ 'tCube' ].value = cubeMap;
    var skyBoxMaterial = new THREE.ShaderMaterial( {
      fragmentShader: cubeShader.fragmentShader,
      vertexShader: cubeShader.vertexShader,
      uniforms: cubeShader.uniforms,
      side: THREE.BackSide
    } );
    var skyBox = new THREE.Mesh(
      new THREE.BoxGeometry( parameters.oceanSide, parameters.oceanSide, parameters.oceanSide),
      skyBoxMaterial
    );
    skyBox.position.set(a, b+200, c);
    scene.add( skyBox );
  }

//---------------- NEIGE --------------------

var SNOW_Picture = 'textures/particle2.png';
var SNOW_no = 15;

var SNOW_browser_IE_NS = (document.body.clientHeight) ? 1 : 0;
var SNOW_browser_MOZ = (self.innerWidth) ? 1 : 0;
var SNOW_browser_IE7 = (document.documentElement.clientHeight) ? 1 : 0;

var SNOW_Time;
var SNOW_dx, SNOW_xp, SNOW_yp;
var SNOW_am, SNOW_stx, SNOW_sty;
var i, SNOW_Browser_Width, SNOW_Browser_Height;

if (SNOW_browser_IE_NS)
{
    SNOW_Browser_Width = document.body.clientWidth;
    SNOW_Browser_Height = document.body.clientHeight;
}
else if (SNOW_browser_MOZ)
{
    SNOW_Browser_Width = self.innerWidth - 20;
    SNOW_Browser_Height = self.innerHeight;
}
else if (SNOW_browser_IE7)
{
    SNOW_Browser_Width = document.documentElement.clientWidth;
    SNOW_Browser_Height = document.documentElement.clientHeight;
}

SNOW_dx = new Array();
SNOW_xp = new Array();
SNOW_yp = new Array();
SNOW_am = new Array();
SNOW_stx = new Array();
SNOW_sty = new Array();

for (i = 0; i < SNOW_no; ++ i)
{
    SNOW_dx[i] = 0;
    SNOW_xp[i] = Math.random()*(SNOW_Browser_Width-50);
    SNOW_yp[i] = Math.random()*SNOW_Browser_Height;
    SNOW_am[i] = Math.random()*20;
    SNOW_stx[i] = 0.02 + Math.random()/10;
    SNOW_sty[i] = 0.7 + Math.random();
    if (i == 0) document.write("<\div id=\"SNOW_flake"+ i +"\" style=\"position: absolute; z-index: "+ i +"; visibility: visible; top: 15px; left: 15px;\"><a href=\"http://www.peters1.dk\" target=\"_blank\"><\img src=\""+SNOW_Picture+"\" border=\"0\"></a><\/div>");
    else document.write("<\div id=\"SNOW_flake"+ i +"\" style=\"position: absolute; z-index: "+ i +"; visibility: visible; top: 15px; left: 15px;\"><\img src=\""+SNOW_Picture+"\" border=\"0\"><\/div>");
}

function SNOW_Weather()
{

for (i = 0; i < SNOW_no; ++ i)
{
    SNOW_yp[i] += SNOW_sty[i];

    if (SNOW_yp[i] > SNOW_Browser_Height-50)
    {
        SNOW_xp[i] = Math.random()*(SNOW_Browser_Width-SNOW_am[i]-30);
        SNOW_yp[i] = 0;
        SNOW_stx[i] = 0.02 + Math.random()/10;
        SNOW_sty[i] = 0.7 + Math.random();
    }

    SNOW_dx[i] += SNOW_stx[i];

    document.getElementById("SNOW_flake"+i).style.top=SNOW_yp[i]+"px";
    document.getElementById("SNOW_flake"+i).style.left=SNOW_xp[i] + SNOW_am[i]*Math.sin(SNOW_dx[i])+"px";
}

SNOW_Time = setTimeout("SNOW_Weather()", 10);

}

SNOW_Weather();


    var pageColors = function() {
        this.backgroundColor = '#091a28';
        this.accentColor = '#91b8d9';
        this.paragraphColor = '#e6e6e6';
        };

    window.onload = function() {
        // add the control panel
        var gui = new dat.GUI();





    };


//------------------------------------








function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

  requestAnimationFrame( animate );

  if ( controlsEnabled === true ) {

    raycaster.ray.origin.copy( controls.getObject().position );
    raycaster.ray.origin.y -= 10;

    var intersections = raycaster.intersectObjects( objects );

    var onObject = intersections.length > 0;

    var time = performance.now();
    var delta = ( time - prevTime ) / 100; //Change la vitesse (par défaut c'etait à 1000)

    velocity.x -= velocity.x * 7.0 * delta;
    velocity.z -= velocity.z * 7.0 * delta;

    velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

    direction.z = Number( moveForward ) - Number( moveBackward );
    direction.x = Number( moveLeft ) - Number( moveRight );
    direction.normalize(); // this ensures consistent movements in all directions



    // if ( controls.getObject().position.x > 250 ) {
    //   velocity.x = 0;
    //   moveRight = false;
    // }
    //
    // if ( controls.getObject().position.x < -250 ) {
    //
    //   velocity.x = 0;
    //   moveLeft = false;
    // }
    //
    // if ( controls.getObject().position.z < -400 ) {
    //   velocity.z = 0;
    //   moveForward = false;
    // }
    // if ( controls.getObject().position.z < -450 ) {
    //   velocity.z = 0;
    //   moveBackward = false;
    // }




    if ( moveForward || moveBackward ) velocity.z -= direction.z * 10.0 * delta;
    if ( moveLeft || moveRight ) velocity.x -= direction.x * 10.0 * delta;

    if ( onObject === true ) {

      velocity.y = Math.max( 0, velocity.y );
      canJump = true;

    }

    controls.getObject().translateX( velocity.x * delta );
    controls.getObject().translateY( velocity.y * delta );
    controls.getObject().translateZ( velocity.z * delta );

    if ( controls.getObject().position.y < 10 ) {

      velocity.y = 0;
      controls.getObject().position.y = 10;

      canJump = true;

    }

    prevTime = time;

  }

  renderer.render( scene, camera );

}
