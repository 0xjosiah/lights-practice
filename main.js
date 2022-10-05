import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as dat from 'lil-gui'

const guiContainer = document.querySelector("#gui")

/**
 * Base
 */
// Debug GUI
const gui = new dat.GUI( { container: guiContainer } )

// let mySaves = {
//   presets: {}
// }

// let preset = {}

const addToMySaves = (obj, preset) => {
  const {value, mySaves} = obj
  return {
    ...mySaves,
    [value]: preset
  }
}

const updatePrevs = () => {
  prevs = presetsFolder.add(settingsObj, 'mySaves', settingsObj.mySaves).show()
}

const settingsObj = {
  value: '',
  savePreset() {
    prevs.destroy()
    let preset = gui.save();
    console.log(preset)
    settingsObj.mySaves = addToMySaves(settingsObj, preset);
    updatePrevs()
    loadButton.enable().show()
    console.log(settingsObj.mySaves)
  },
  loadPreset() {
    gui.load( preset );
  },
  mySaves: {}
}
const presetsFolder = gui.addFolder("Saves")
presetsFolder.add(settingsObj, 'value')
presetsFolder.add(settingsObj, 'savePreset')

let prevs = presetsFolder.add(settingsObj, 'mySaves', settingsObj.mySaves)
const loadButton = presetsFolder.add( settingsObj, 'loadPreset' ).disable()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()


/**
 * Lights
 */
// Spot Lights
const spotLight = new THREE.SpotLight(0xff0000, 1, 10, Math.PI * .3, .5, 0)
spotLight.position.x = 0
spotLight.position.y = 5
spotLight.position.z = 2.5
scene.add(spotLight)
scene.add(spotLight.target)

const spotLight2 = new THREE.SpotLight(0x00ff00, 1, 10, Math.PI * .3, .5, 0)
spotLight2.position.x = 1.8
spotLight2.position.y = 5
spotLight2.position.z = -1.8
scene.add(spotLight2)
scene.add(spotLight2.target)

const spotLight3 = new THREE.SpotLight(0x0000ff, 1, 10, Math.PI * .3, .5, 0)
spotLight3.position.x = -1.8
spotLight3.position.y = 5
spotLight3.position.z = -1.8
scene.add(spotLight3)
scene.add(spotLight3.target)

// Bottom Spot Light
const bottomSpot = new THREE.SpotLight(0xffffff, 1, 5, Math.PI * .6, 0.75, .5)
bottomSpot.castShadow = true
bottomSpot.position.y = -2
bottomSpot.shadow.mapSize.width = 1024
bottomSpot.shadow.mapSize.height = 1024
bottomSpot.shadow.camera.fov = 50
bottomSpot.shadow.camera.near = .5
bottomSpot.shadow.camera.far = 5
scene.add(bottomSpot)
scene.add(bottomSpot.target)

/**
 * Objects
 */
// Material
const material = new THREE.MeshStandardMaterial()
material.roughness = .4
material.metalness = .8

const materialFolder = gui.addFolder('Adjust Material')
materialFolder.add(material, 'roughness', 0, 1, .001)
materialFolder.add(material, 'metalness', 0, 1, .001)

// Container or 'room'
const room = new THREE.Mesh(
  new THREE.SphereGeometry(10),
  material
)
room.material.side = THREE.DoubleSide
room.receiveShadow = true
room.castShadow = true

// Objects in scene
// Geometries
const sphere = new THREE.SphereGeometry(1, 64, 64);
const octahedron = new THREE.OctahedronGeometry();
const torusKnot = new THREE.TorusKnotGeometry(1, .3, 300, 200, 2, 3);
const dodecahedron = new THREE.DodecahedronGeometry()
const capsule = new THREE.CapsuleGeometry(.75, 1, 64, 64)
const cube = new THREE.BoxGeometry()

// Mesh
const mesh = new THREE.Mesh( octahedron, material )
mesh.castShadow = true

scene.add(mesh, room)


/**
 * Fetch Colors GUI and logic
 */
// Fetch Colors
let colorObj = {
  scheme: 'monochrome',
  color: 0xff0000
}

const colorFolder = gui.addFolder('Select Color')
colorFolder.add(colorObj, 'scheme', ['monochrome', 'monochrome-dark', 'monochrome-light', 'analogic', 'complement', 'analogic-complement', 'triad', 'quad'])
  .onChange(v => {
    colorObj.scheme = v
    fetchColorData(colorObj)
});
colorFolder.addColor(colorObj, 'color').onChange(v => {
  colorObj.color = v
  spotLight.color = new THREE.Color(colorObj.color)
  fetchColorData(colorObj)
});

function fetchColorData(colorObj) {
  let {scheme, color} = colorObj
  color = color.toString(16)
  fetch(`https://www.thecolorapi.com/scheme?hex=${color}&mode=${scheme}&count=2`)
      .then(response => response.json())
      .then(data => {
        const {colors} = data
        spotLight2.color = new THREE.Color(colors[0].hex.value)
        spotLight3.color = new THREE.Color(colors[1].hex.value)
      })
}

// Change Object shape
let centerObj = {
  shape: octahedron,
  shapes: {
    octahedron,
    sphere,
    torusKnot,
    dodecahedron,
    capsule,
    cube
  }
}

const centerObjFolder = gui.addFolder('Select Shape')
centerObjFolder.add(centerObj, 'shape', centerObj.shapes).onChange(v => {
  centerObj.shape = v
  mesh.geometry = centerObj.shape
})

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
camera.position.x = -1
camera.position.y = 2
camera.position.z = 6
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.minDistance = 2
controls.maxDistance = 10

/**
 * Renderer
 */
const renderer = new THREE.WebGL1Renderer({canvas})
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.render(scene, camera)

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
  const elapsedTime = clock.getElapsedTime()

  // Update controls
  controls.update()

  // Renderer
  renderer.render(scene, camera)

  // call tick again on next frame
  window.requestAnimationFrame(tick)
}

gui.add(gui, 'reset')

tick()