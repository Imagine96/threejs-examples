import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const COLORS = {
  BLUE: "#7dd3fc",
  GRAY_1: "#f3f4f6",
  WHITE: "#fff"
} as const

function App() {

  const hasInit = useRef<boolean>(false)
  const [started, setStart] = useState<boolean>(false)
  const boxRef = useRef<THREE.Mesh | null>(null)

  useEffect(() => {
    if (!hasInit.current && started) {

      const loader = new THREE.TextureLoader();

      const scene = new THREE.Scene();
      const light = new THREE.DirectionalLight(COLORS.WHITE, 1)
      light.position.z = 1
      scene.add(light)

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

      const box = makeBox(COLORS.BLUE, new THREE.Vector3(1, 1, 1))
      scene.add(box)
      boxRef.current = box

      camera.lookAt(box.position)

      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();
      let isDragging = false;

      const previousMousePosition = {
        x: 0,
        y: 0
      };

      const onMouseDown = (event: MouseEvent) => {
        // Update the mouse variable with normalized coordinates
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // Raycast from the camera to the mouse position
        raycaster.setFromCamera(mouse, camera);

        // Check for intersections with the box
        const intersects = raycaster.intersectObject(box);

        // If the mouse down event intersects the box, start dragging
        if (intersects.length > 0) {
          isDragging = true;
          previousMousePosition.x = event.clientX;
          previousMousePosition.y = event.clientY;
        }
      }

      // Function to handle mouse move event
      const onMouseMove = (event: MouseEvent) => {
        if (isDragging) {
          // Calculate the change in mouse position
          const deltaX = event.clientX - previousMousePosition.x;
          const deltaY = event.clientY - previousMousePosition.y;

          // Update the box rotation based on mouse movement
          box.rotation.y += deltaX * 0.01;
          box.rotation.x += deltaY * 0.01;

          // Update the last mouse position
          previousMousePosition.x = event.clientX;
          previousMousePosition.y = event.clientY;
        }
      }

      const onMouseUp = () => {
        isDragging = false;
      }

      window.addEventListener('mousedown', onMouseDown);
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);

      renderer.setAnimationLoop(() => {
        renderer.render(scene, camera)
      });

      hasInit.current = true

      return () => {
        window.removeEventListener('mousedown', onMouseDown);
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      }
    }
  }, [started])

  const onStart = () => {
    setStart(true)
  }

  const onRestart = () => {
    if (boxRef.current) {
      boxRef.current.rotation.set(0, 0, 0)
      boxRef.current.position.set(0, 0, 0)
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
              <p>Drag the Box for rotating it</p>
              <p>Resets with space bar</p>
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

function makeBox(color: string, size?: THREE.Vector3, initialPosition?: THREE.Vector3): THREE.Mesh {
  const material = new THREE.MeshStandardMaterial({
    color: color,
  })

  const geometry = new THREE.BoxGeometry()
  geometry.scale(size?.x || 1, size?.y || 1, size?.z || 1)

  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.x = initialPosition?.x || 0
  mesh.position.y = initialPosition?.y || 0
  mesh.position.z = initialPosition?.z || 0

  return mesh
}

/* function makeSphere(color: string, size?: THREE.Vector3, initialPosition?: THREE.Vector3): THREE.Mesh {
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
} */
/* function controlledSphere(color: string, size?: THREE.Vector3, initialPosition?: THREE.Vector3, fn: typeof makeSphere = makeSphere): THREE.Mesh {
  const sphere = fn(color, size, initialPosition)

  // arrow keys to control, stop with space bar 

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
} */