// Obj.jsx
import React, { useRef, useState, useEffect } from 'react';
import { useLoader, useThree, extend, useFrame } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader';
import { Vector2, Raycaster, Clock, Color, MeshBasicMaterial } from 'three';
import reflexarc from '../assets/reflexarc.gltf';

extend({ EffectComposer, RenderPass, OutlinePass, ShaderPass });

const Obj = ({ modEnabled, resetModelTrigger, animateTrigger }) => {
  const gltf = useLoader(GLTFLoader, reflexarc);
  const [hoveredPart, setHoveredPart] = useState(null);
  const [clickedPart, setClickedPart] = useState(null);
  const { scene, gl, camera, size } = useThree();
  const composer = useRef();
  const outlinePass = useRef();
  const raycaster = useRef(new Raycaster());
  const mouse = useRef(new Vector2());
  const dragging = useRef(false);
  const initialPositions = useRef({});
  const clock = new Clock();
  const [animationActive, setAnimationActive] = useState(false);

  // Logs the hierarchy of the model to the console for debugging
  const logModelHierarchy = (object, depth = 0) => {
    console.log(`${'  '.repeat(depth)}${object.name || 'Unnamed'} (${object.type})`);
    if (object.children) {
      object.children.forEach((child) => logModelHierarchy(child, depth + 1));
    }
  };

  useEffect(() => {
    // Set up post-processing effects
    const effectComposer = new EffectComposer(gl);
    effectComposer.addPass(new RenderPass(scene, camera));

    const outlinePassInstance = new OutlinePass(new Vector2(size.width, size.height), scene, camera);
    outlinePassInstance.edgeStrength = 2.5;
    outlinePassInstance.edgeGlow = 0.0;
    outlinePassInstance.edgeThickness = 1.0;
    outlinePassInstance.pulsePeriod = 0;
    outlinePassInstance.visibleEdgeColor.set('#ffffff');
    outlinePassInstance.hiddenEdgeColor.set('#000000');
    effectComposer.addPass(outlinePassInstance);

    const effectFXAA = new ShaderPass(FXAAShader);
    effectFXAA.uniforms['resolution'].value.set(1 / size.width, 1 / size.height);
    effectComposer.addPass(effectFXAA);

    composer.current = effectComposer;
    outlinePass.current = outlinePassInstance;

    // Store initial positions of all mesh objects
    gltf.scene.traverse((child) => {
      if (child.isMesh) {
        initialPositions.current[child.uuid] = child.position.clone();
      }
    });

    logModelHierarchy(gltf.scene);
  }, [gl, scene, camera, size, gltf]);

  useEffect(() => {
    // Update outline pass selection based on hovered or clicked part
    if (hoveredPart) {
      outlinePass.current.selectedObjects = [hoveredPart];
    } else if (clickedPart) {
      outlinePass.current.selectedObjects = [clickedPart];
    } else {
      outlinePass.current.selectedObjects = [];
    }
  }, [hoveredPart, clickedPart]);

  useEffect(() => {
    if (resetModelTrigger) {
      resetModel();
    }
  }, [resetModelTrigger]);

  useEffect(() => {
    if (animateTrigger) {
      setAnimationActive(true);
    }
  }, [animateTrigger]);

  useFrame(() => {
    composer.current.render();

    const time = clock.getElapsedTime();
    const organ = scene.getObjectByName('BezierCurve.001'); 
    const arm = scene.getObjectByName('11535_arm_V3_'); 
    const nerve = scene.getObjectByName('BezierCurve.004'); 

    // Animate the organ's vertical position
    if (organ) {
      organ.position.y = Math.sin(time) * 0.5;
    }

    // Trigger animation when animationActive is true
    if (animationActive) {
      if (arm) {
        const arm1 = scene.getObjectByName('11535_arm_V3__1');
        const arm2 = scene.getObjectByName('11535_arm_V3__2');
        if (arm1) arm1.rotation.z = Math.sin(time * 2) * 0.1;
        if (arm2) arm2.rotation.z = Math.sin(time * 2) * 0.1;
      }

      if (nerve) {
        nerve.traverse((child) => {
          if (child.isMesh) {
            if (!child.material.isMeshBasicMaterial) {
              child.material = new MeshBasicMaterial({ color: child.material.color, emissive: new Color(0xff0000), emissiveIntensity: Math.abs(Math.sin(time * 2)) });
            } else {
              child.material.emissiveIntensity = Math.abs(Math.sin(time * 2));
            }
          }
        });
      }
    }

    // Handle dragging of clicked parts
    if (dragging.current && clickedPart) {
      raycaster.current.setFromCamera(mouse.current, camera);
      const intersects = raycaster.current.intersectObject(scene, true);
      if (intersects.length > 0) {
        const intersect = intersects[0];
        clickedPart.position.copy(intersect.point);
      }
    }
  }, 1);

  const handlePointerOver = (event) => {
    event.stopPropagation();
    if (modEnabled && event.object) {
      setHoveredPart(event.object);
    }
  };

  const handlePointerOut = (event) => {
    event.stopPropagation();
    setHoveredPart(null);
  };

  const handlePointerDown = (event) => {
    event.stopPropagation();
    if (modEnabled && event.object) {
      setClickedPart(event.object);
      dragging.current = true;
    }
  };

  const handlePointerMove = (event) => {
    if (modEnabled && dragging.current) {
      mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }
  };

  const handlePointerUp = () => {
    if (modEnabled) {
      dragging.current = false;
    }
  };

  const resetModel = () => {
    gltf.scene.traverse((child) => {
      if (child.isMesh && initialPositions.current[child.uuid]) {
        child.position.copy(initialPositions.current[child.uuid]);
      }
    });
    setClickedPart(null);
    setHoveredPart(null);
    dragging.current = false;
    setAnimationActive(false);
  };

  return (
    <group
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <primitive object={gltf.scene} />
    </group>
  );
};

export default Obj;
