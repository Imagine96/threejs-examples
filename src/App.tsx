import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { DragControls } from 'three/addons/controls/DragControls.js';


const COLORS = {
  BLUE: "#4f46e5",
  GRAY_1: "#f3f4f6",
  WHITE: "#fff",
  GREEN: "#22c55e"
} as const

function App() {

  const hasInit = useRef<boolean>(false)
  const [started, setStart] = useState<boolean>(false)
  const centerRef = useRef<THREE.Object3D<THREE.Object3DEventMap>[] | null>(null)

  useEffect(() => {
    if (!hasInit.current && started) {
      centerRef.current = []
      const scene = new THREE.Scene();
      const raycaster = new THREE.Raycaster();
      const ambientLight = new THREE.PointLight(COLORS.WHITE, 1000, 500)
      ambientLight.position.set(5, 20, 0);

      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({
        antialias: true
      });

      renderer.setSize(window.innerWidth, window.innerHeight);

      camera.position.set(5, 20, 0);

      document.getElementById("three")?.appendChild(renderer.domElement);

      const sphere = makeSphere(COLORS.BLUE)
      scene.add(sphere)

      const box = makeBox(COLORS.GREEN, new THREE.Vector3(1, 1, 1), new THREE.Vector3(5, 1, 5))
      scene.add(box)

      /* scene final preparations */
      const gridHelper = new THREE.GridHelper(50)
      scene.add(gridHelper)

      const orbitControls = new OrbitControls(camera, renderer.domElement)
      orbitControls.update()

      const dragControls = new DragControls([sphere, box], camera, renderer.domElement)

      dragControls.addEventListener('dragstart', function (event) {
        (event.object as THREE.Mesh<THREE.BufferGeometry<THREE.NormalBufferAttributes>, THREE.Material, THREE.Object3DEventMap>).material.opacity = 0.5
      });

      dragControls.addEventListener('dragend', function (event) {
        orbitControls.enabled = true;
        (event.object as THREE.Mesh<THREE.BufferGeometry<THREE.NormalBufferAttributes>, THREE.Material, THREE.Object3DEventMap>).material.opacity = 1
      });

      renderer.domElement.addEventListener("pointerdown", (event) => {
        const x = (event.clientX / window.innerWidth) * 2 - 1;
        const y = -(event.clientY / window.innerHeight) * 2 + 1;

        // Raycast from the camera to the mouse position
        raycaster.setFromCamera(new THREE.Vector2(x, y), camera);

        // Check for intersections with the draggable elements to disable orbit controls
        if (raycaster.intersectObjects(dragControls.getObjects()).length) {
          orbitControls.enabled = false
        } else {
          orbitControls.enabled = true
        }
      })

      camera.lookAt(new THREE.Vector3(0, 0, 0))
      scene.add(ambientLight)

      renderer.setAnimationLoop(() => {
        orbitControls.update()
        renderer.render(scene, camera)
      });

      hasInit.current = true

      return () => {

      }
    }
  }, [started])

  const onStart = () => {
    setStart(true)
  }

  const onRestart = () => {
    if (centerRef.current) {
      centerRef.current.forEach(node => {
        node.rotation.set(0, 0, 0)
      })
    }
  }

  return (
    <>
      {
        started ? (
          <>
            <div id="three"></div>
            <button className='restart-button' onClick={onRestart} >
              Restart
            </button>
          </>
        ) : (
          <div className='start-screen' >
            <div className='card' >
              <p>Drag and Drop</p>
              <p>Orbit controls enabled also!</p>
              <button className='start-button' onClick={onStart} >
                Start
              </button>
            </div>
          </div>
        )
      }
    </>
  )
}

export default App

function makeSphere(color: string, size?: THREE.Vector3, initialPosition?: THREE.Vector3, opacity?: number): THREE.Mesh {
  const material = new THREE.MeshStandardMaterial({
    color: color,
    opacity: opacity
  })

  const geometry = new THREE.SphereGeometry()
  geometry.scale(size?.x || 1, size?.y || 1, size?.z || 1)

  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.x = initialPosition?.x || 0
  mesh.position.y = initialPosition?.y || 0
  mesh.position.z = initialPosition?.z || 0

  return mesh
}

function makeBox(color: string, size?: THREE.Vector3, initialPosition?: THREE.Vector3, opacity: number = 1): THREE.Mesh {
  const material = new THREE.MeshStandardMaterial({
    color: color,
    opacity: opacity
  })

  const geometry = new THREE.BoxGeometry()
  geometry.scale(size?.x || 1, size?.y || 1, size?.z || 1)

  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.x = initialPosition?.x || 0
  mesh.position.y = initialPosition?.y || 0
  mesh.position.z = initialPosition?.z || 0

  return mesh
}