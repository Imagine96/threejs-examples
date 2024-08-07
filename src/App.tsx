import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const COLORS = {
  BLUE: "#7dd3fc",
  GRAY_1: "#f3f4f6"
} as const

let Z_SPHERE_CONSTANT_SPEED = 0.002
let X_SPHERE_CONSTANT_SPEED = 0;

function App() {

  const hasInit = useRef<boolean>(false)
  const [started, setStart] = useState<boolean>(false)
  const sphereRef = useRef<THREE.Mesh | null>(null)

  useEffect(() => {
    if (!hasInit.current && started) {

      const loader = new THREE.TextureLoader();

      const scene = new THREE.Scene();
      loader.load('/bathroom-floor.svg', function (texture) {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(4, 4); // Adjust these values to scale the background
        scene.background = texture;
        scene.backgroundIntensity = 0.2
      });
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

      const renderer = new THREE.WebGLRenderer();

      renderer.setSize(window.innerWidth, window.innerHeight);

      camera.position.z = 5;
      camera.position.x = 1;
      camera.position.y = 5;


      document.getElementById("three")?.appendChild(renderer.domElement);

      const sphere = controlledSphere(COLORS.BLUE, new THREE.Vector3(0.5, 0.5, 0.5))
      scene.add(sphere)
      sphereRef.current = sphere

      camera.lookAt(sphere.position)

      renderer.setAnimationLoop(() => {
        sphere.position.z += -Z_SPHERE_CONSTANT_SPEED
        sphere.position.x += -X_SPHERE_CONSTANT_SPEED
        renderer.render(scene, camera)
      });

      hasInit.current = true
    }
  }, [started])

  const onStart = () => {
    setStart(true)
  }

  const onRestart = () => {
    if (sphereRef.current) {
      Z_SPHERE_CONSTANT_SPEED = 0;
      X_SPHERE_CONSTANT_SPEED = 0;
      sphereRef.current.position.x = 0
      sphereRef.current.position.y = 0
      sphereRef.current.position.z = 0
    }
  }

  return (
    <>
      {
        started ? (
          <>
            <div id="three" ></div>
            <button className='restart-button' onClick={onRestart} >
              Restart
            </button>
          </>
        ) : (
          <div className='start-screen' >
            <div className='card' >
              <p>Move with the arrow keys</p>
              <p>Stops with space bar</p>
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

function makeSphere(color: string, size?: THREE.Vector3, initialPosition?: THREE.Vector3): THREE.Mesh {
  const material = new THREE.MeshBasicMaterial({
    color: color,
  })

  const geometry = new THREE.SphereGeometry()
  geometry.scale(size?.x || 1, size?.y || 1, size?.z || 1)

  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.x = initialPosition?.x || 0
  mesh.position.y = initialPosition?.y || 0
  mesh.position.z = initialPosition?.z || 0

  return mesh
}

function controlledSphere(color: string, size?: THREE.Vector3, initialPosition?: THREE.Vector3, fn: typeof makeSphere = makeSphere): THREE.Mesh {
  const sphere = fn(color, size, initialPosition)

  /* arrow keys to control, stop with space bar */

  document.addEventListener("keydown", (e) => {
    console.log(e.key)

    if (e.key === "ArrowUp") {
      Z_SPHERE_CONSTANT_SPEED = Math.min(0.1, Z_SPHERE_CONSTANT_SPEED + 0.01)
    }
    if (e.key === "ArrowDown") {
      Z_SPHERE_CONSTANT_SPEED = Math.max(-0.1, Z_SPHERE_CONSTANT_SPEED - 0.01)
    }
    if (e.key === "ArrowLeft") {
      X_SPHERE_CONSTANT_SPEED = Math.min(0.1, X_SPHERE_CONSTANT_SPEED + 0.01)
    }
    if (e.key === "ArrowRight") {
      X_SPHERE_CONSTANT_SPEED = Math.max(-0.1, X_SPHERE_CONSTANT_SPEED - 0.01)
    }

    if (e.key === " ") {
      X_SPHERE_CONSTANT_SPEED = 0
      Z_SPHERE_CONSTANT_SPEED = 0
    }

  })

  return sphere
}