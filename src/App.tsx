import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

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
      const light = new THREE.PointLight(COLORS.WHITE, 1000, 200)
      const ambientLight = new THREE.AmbientLight(COLORS.WHITE)

      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({
        antialias: true
      });

      renderer.setSize(window.innerWidth, window.innerHeight);

      camera.position.set(5, 20, 10);

      document.getElementById("three")?.appendChild(renderer.domElement);

      /* center sphere */

      const centerSphere = makeSphere(COLORS.WHITE, new THREE.Vector3(0.5, 0.5, 0.5), new THREE.Vector3(0, 0, 0), 0.5)
      scene.add(centerSphere)

      /* adding blue orbital */
      const centerOrbitBlue = makeCenter()
      const outerSphereBlue = makeSphere(COLORS.BLUE, new THREE.Vector3(1, 1, 1))

      centerRef.current?.push(centerOrbitBlue)

      centerOrbitBlue.add(outerSphereBlue)
      outerSphereBlue.position.set(10, 0, 0)
      scene.add(centerOrbitBlue)

      /* adding green orbital */
      const centerOrbitGreen = makeCenter()
      const outerSphereGreen = makeSphere(COLORS.GREEN, new THREE.Vector3(1, 1, 1))

      centerOrbitGreen.add(outerSphereGreen)
      outerSphereGreen.position.set(10, 0, 10)
      scene.add(centerOrbitGreen)

      centerRef.current?.push(centerOrbitGreen)

      /* scene final preparations */
      camera.lookAt(centerOrbitBlue.position)
      scene.add(light)
      scene.add(ambientLight)

      renderer.setAnimationLoop(() => {
        renderer.render(scene, camera)
        if (centerRef.current) {
          /* rotating every orbital at different speed */
          centerRef.current.forEach((node, i) => {
            node.rotation.y += (0.01 * (i + 1))
          })
        }
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
              <p>Circular orbit</p>
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

function makeCenter(): THREE.Object3D {
  return new THREE.Object3D()
}

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