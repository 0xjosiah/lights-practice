import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as dat from 'lil-gui'


const gui = new dat.GUI()
gui.add(gui, 'reset')

const canvas = document.querySelector('canvas.webgl')

const scene = new THREE.Scene()

/**
 * Objects
 */
// Material
const material = new THREE.MeshBasicMaterial({color: 0xff0000})
// material.roughness = .4

// Object
const sphere = new THREE.Mesh(
  new THREE.SphereGeometry(.5, 32, 32),
  material
)

scene.add(sphere)

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  // Update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base Cam
const camera = new THREE.PerspectiveCamera( 75, sizes.width / sizes.height, 0.1, 100 );
// camera.position.x = 1
// camera.position.y = 1
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGL1Renderer({canvas})
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.render(scene, camera)

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
  const elapsedTime = clock.getElapsedTime()

  // Update objects

  // Update controls
  controls.update()

  // Renderer
  renderer.render(scene, camera)

  // call tick again on next frame
  window.requestAnimationFrame(tick)
}

tick()