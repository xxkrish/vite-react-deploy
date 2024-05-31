// Home.jsx
import React, { useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Suspense } from 'react';
import Loader from '../components/Loader';
import Obj from '../models/Obj';

const Home = () => {
  const cameraRef = useRef();
  const [selectedView, setSelectedView] = useState('Y');
  const [modEnabled, setModEnabled] = useState(false);
  const [resetTrigger, setResetTrigger] = useState(false);
  const [animateTrigger, setAnimateTrigger] = useState(false);

  const zoomSpeed = 0.01;

  useEffect(() => {
    if (cameraRef.current) {
      switch (selectedView) {
        case 'X':
          cameraRef.current.position.set(0, 0, 10);
          break;
        case 'Y':
          cameraRef.current.position.set(14, 6, 0);
          break;
        case 'Z':
          cameraRef.current.position.set(0, 10, 0);
          break;
        default:
          cameraRef.current.position.set(10, 0, 0);
          break;
      }
    }
  }, [selectedView]);

  const handleWheel = (event) => {
    event.preventDefault();
    const deltaY = -event.deltaY;
    const newZoom = cameraRef.current.position.z + deltaY * zoomSpeed;
    cameraRef.current.position.z = Math.min(-2, Math.max(-20, newZoom));
  };

  const toggleMod = () => {
    setModEnabled(!modEnabled);
  };

  const resetModel = () => {
    setResetTrigger((prev) => !prev);
  };

  const animateModel = () => {
    setAnimateTrigger((prev) => !prev);
  };

  return (
    <section className='w-full h-screen relative pt-16' onWheel={handleWheel}>
      <Canvas
        className="w-full h-screen"
        camera={{ position: [14, 6, 0], near: 0.1, far: 1000 }}
        onCreated={({ camera }) => {
          cameraRef.current = camera;
        }}
      >
        <Suspense fallback={<Loader />}>
          <directionalLight position={[10, 10, 10]} intensity={4} />
          <ambientLight intensity={0.5} />
          <hemisphereLight groundColor='#000000' intensity={1} />
          <Obj modEnabled={modEnabled} resetModelTrigger={resetTrigger} animateTrigger={animateTrigger} />
        </Suspense>
        <OrbitControls enabled={!modEnabled} />
      </Canvas>
      <div className="fixed top-20 right-4 flex flex-col space-y-2">
        <button onClick={() => setSelectedView('X')} className="p-2 bg-blue-500 text-white rounded">X</button>
        <button onClick={() => setSelectedView('Y')} className="p-2 bg-blue-500 text-white rounded">Y</button>
        <button onClick={() => setSelectedView('Z')} className="p-2 bg-blue-500 text-white rounded">Z</button>
        <button onClick={toggleMod} className={`p-2 rounded ${modEnabled ? 'bg-green-500' : 'bg-gray-500'} text-white`}>
          Mod
        </button>
        <button onClick={resetModel} className="p-2 bg-red-500 text-white rounded">Reset</button>
        <button onClick={animateModel} className="p-2 bg-purple-500 text-white rounded">Animate</button>
      </div>
    </section>
  );
};

export default Home;
