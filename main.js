import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as dat from 'lil-gui'

/**
 * Base
 */
// Debug GUI
const gui = new dat.GUI()
gui.add(gui, 'reset')

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight({
  color: 0xffffff,
  intensity: .4
})
scene.add(ambientLight)

const addHelperToGui = (value, helperObj) => {
  const {help} = helperObj
  value ? scene.add(help) : scene.remove(help)
  window.requestAnimationFrame(() => spotLightHelper.help.update())
}

const spotLight = new THREE.SpotLight(0xffffff, .5, 10, Math.PI * .1, .05, 1)
spotLight.position.y = 1
scene.add(spotLight)
// spotLight.target.position.x = -.2
scene.add(spotLight.target)
const spotLightFolder = gui.addFolder('Spot')
spotLightFolder.add(spotLight, 'intensity', 0, 1, .001)
spotLightFolder.add(spotLight, 'distance', 0, 100, 1)
spotLightFolder.add(spotLight, 'angle', 0, Math.PI, .001)
spotLightFolder.add(spotLight, 'penumbra', 0, 1, .001)
spotLightFolder.add(spotLight, 'decay', 0, 5, .01)
const spotLightHelper = {
  help: new THREE.SpotLightHelper(spotLight),
  helper: false
}
spotLightFolder.add(spotLightHelper, 'helper').onChange(v => addHelperToGui(v, spotLightHelper))
window.requestAnimationFrame(() => spotLightHelper.help.update())
// scene.add(spotLightHelper)

/**
 * Objects
 */
// Material
const material = new THREE.MeshStandardMaterial({color: 0xff0000})
material.roughness = .4
material.metalness = .8

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