import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';

// Debug

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();
//Textures
const textureLoader = new THREE.TextureLoader();
const pointTexture = textureLoader.load('/3.png');

// Objects
const pointGeometry = new THREE.BufferGeometry();
const count = 5000;
const pointsArray = new Float32Array(count * 3);
for (let i = 0; i < count; i++) {
	const i3 = i * 3;
	pointsArray[i3] = (Math.random() - 0.5) * 10;
	pointsArray[i3 + 1] = (Math.random() - 0.5) * 10;
	pointsArray[i3 + 2] = (Math.random() - 1) * 10;
}
const pointsAttribute = new THREE.BufferAttribute(pointsArray, 3);
pointGeometry.setAttribute('position', pointsAttribute);
const pointmaterial = new THREE.PointsMaterial({ size: 0.1 });
pointmaterial.alphaMap = pointTexture;
pointmaterial.transparent = true;
pointmaterial.alphaTest = 0.01;

const points = new THREE.Points(pointGeometry, pointmaterial);
scene.add(points);

/**
 * Sizes
 */
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
};

window.addEventListener('resize', () => {
	// Update sizes
	sizes.width = window.innerWidth;
	sizes.height = window.innerHeight;

	// Update camera
	camera.aspect = sizes.width / sizes.height;
	camera.updateProjectionMatrix();

	// Update renderer
	renderer.setSize(sizes.width, sizes.height);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

//Loaders
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/');
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);
let mixer = null;

gltfLoader.load('/earth/scene.gltf', (gltf) => {
	scene.add(gltf.scene);
	gltf.scene.scale.set(0.0005, 0.0005, 0.0005);
	gltf.scene.position.x = 3;

	mixer = new THREE.AnimationMixer(gltf.scene);
	const actions = mixer.clipAction(gltf.animations[0]);
	actions.play();
	console.log(gltf);
});

/**Lights */
const ambientLight = new THREE.AmbientLight(0xffffff, 5);
scene.add(ambientLight);

const directionalLight1 = new THREE.DirectionalLight(0xffffff, 3);
directionalLight1.position.x = -2;
scene.add(directionalLight1);
const directionalLight2 = new THREE.DirectionalLight(0xffffff, 3);
directionalLight2.position.set(0, 0, 2);
scene.add(directionalLight2);

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
	75,
	sizes.width / sizes.height,
	0.1,
	100
);
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 3;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

controls.maxDistance = 3;
controls.minDistance = 1;
controls.enableRotate = false;
/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
	canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.physicallyCorrectLights = true;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
// renderer.toneMappingExposure = 3;
/**
 * Animate
 */

const clock = new THREE.Clock();

let currentTime = 0;

const tick = () => {
	const elapsedTime = clock.getElapsedTime();
	let deltaTime = elapsedTime - currentTime;
	currentTime = elapsedTime;

	// Update objects
	points.rotation.z = elapsedTime * 0.1;

	//animation of model r
	if (mixer) {
		mixer.update(deltaTime);
	}
	// Update Orbital Controls
	controls.update();

	// Render
	renderer.render(scene, camera);

	// Call tick again on the next frame
	window.requestAnimationFrame(tick);
};

tick();
