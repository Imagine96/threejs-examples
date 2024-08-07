import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const COLORS = {
  BLUE: "#7dd3fc",
  GRAY_1: "#f3f4f6"
} as const

function App() {

  const hasInit = useRef<boolean>(false)

  useEffect(() => {
    if (!hasInit.current) {

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(COLORS.GRAY_1)

      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

      const renderer = new THREE.WebGLRenderer();

      renderer.setSize(window.innerWidth, window.innerHeight);

      camera.position.z = 5;
      camera.position.x = 1;
      camera.position.y = 5;


      document.getElementById("three")?.appendChild(renderer.domElement);

      const sphere = makeSphere(COLORS.BLUE, new THREE.Vector3(0.5, 0.5, 0.5))
      scene.add(sphere)

      camera.lookAt(sphere.position)

      renderer.setAnimationLoop(() => {
        sphere.rotation.y += 0.01;
        renderer.render(scene, camera)
      });

      hasInit.current = true
    }
  }, [])


  return (
    <div id="three"></div>
  )
}

export default App

function makeSphere(color: string, size?: THREE.Vector3, initialPosition?: THREE.Vector3): THREE.Mesh {
  const material = new THREE.MeshBasicMaterial({
    color: color,
    wireframe: true
  })

  const geometry = new THREE.SphereGeometry()
  geometry.scale(size?.x || 1, size?.y || 1, size?.z || 1)

  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.x = initialPosition?.x || 0
  mesh.position.y = initialPosition?.y || 0
  mesh.position.z = initialPosition?.z || 0

  return mesh
}
