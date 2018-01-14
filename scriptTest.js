var startTime	= Date.now();
var container;
var camera, scene, renderer, stats;
var skyboxMesh;

init();

animate();

function init() {

camera = new THREE.Camera( 70, window.innerWidth / window.innerHeight, 1, 100000 );

scene = new THREE.Scene();

var urlPrefix	= "textures/test/";
var urls = [ urlPrefix + "posx.jpg", urlPrefix + "negx.jpg",
    urlPrefix + "posy.jpg", urlPrefix + "negy.jpg",
    urlPrefix + "posz.jpg", urlPrefix + "negz.jpg" ];
var textureCube	= THREE.ImageUtils.loadTextureCube( urls );


var shader	= THREE.ShaderUtils.lib["cube"];
shader.uniforms["tCube"].texture = textureCube;
var material = new THREE.MeshShaderMaterial({
  fragmentShader	: shader.fragmentShader,
  vertexShader	: shader.vertexShader,
  uniforms	: shader.uniforms
});


skyboxMesh	= new THREE.Mesh( new THREE.CubeGeometry( 100000, 100000, 100000, 1, 1, 1, null, true ), material );


scene.addObject( skyboxMesh );


container = document.createElement( 'div' );
document.body.appendChild( container );

renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
container.appendChild( renderer.domElement );

stats = new Stats();
stats.domElement.style.position = 'absolute';
stats.domElement.style.top = '0px';
container.appendChild( stats.domElement );
}


function animate() {

render();

requestAnimationFrame( animate );

stats.update();
}

function render() {

var timer = - new Date().getTime() * 0.0002;
camera.position.x = 1000 * Math.cos( timer );
camera.position.z = 1000 * Math.sin( timer );


renderer.render( scene, camera );
}
