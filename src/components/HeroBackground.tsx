import { useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';

export default function HeroBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = null;
    scene.fog = new THREE.FogExp2(0x000000, 0.03);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const particlesCount = isMobile ? 600 : 1000;

    const createParticleTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext('2d')!;
      ctx.beginPath();
      ctx.arc(16, 16, 14, 0, 2 * Math.PI);
      ctx.fillStyle = 'white';
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
      ctx.shadowBlur = 0;
      const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 14);
      gradient.addColorStop(0, 'rgba(255,255,255,1)');
      gradient.addColorStop(0.5, 'rgba(255,255,255,0.6)');
      gradient.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 32, 32);
      return new THREE.CanvasTexture(canvas);
    };

    const particleTexture = createParticleTexture();

    const positions = new Float32Array(particlesCount * 3);
    const colors = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 15 - 2;

      const hue = 0.55 + Math.random() * 0.25;
      const saturation = 0.6 + Math.random() * 0.4;
      const lightness = 0.5 + Math.random() * 0.4;
      const color = new THREE.Color().setHSL(hue, saturation, lightness);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.08,
      map: particleTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    camera.position.z = 5;
    camera.position.y = 0.5;

    const bigParticlesCount = isMobile ? 50 : 200;
    const bigPositions = new Float32Array(bigParticlesCount * 3);
    const bigColors = new Float32Array(bigParticlesCount * 3);

    for (let i = 0; i < bigParticlesCount; i++) {
      bigPositions[i * 3] = (Math.random() - 0.5) * 18;
      bigPositions[i * 3 + 1] = (Math.random() - 0.5) * 12;
      bigPositions[i * 3 + 2] = (Math.random() - 0.5) * 20 - 5;
      const hue = 0.6 + Math.random() * 0.2;
      const color = new THREE.Color().setHSL(hue, 0.8, 0.6);
      bigColors[i * 3] = color.r;
      bigColors[i * 3 + 1] = color.g;
      bigColors[i * 3 + 2] = color.b;
    }

    const bigGeometry = new THREE.BufferGeometry();
    bigGeometry.setAttribute('position', new THREE.BufferAttribute(bigPositions, 3));
    bigGeometry.setAttribute('color', new THREE.BufferAttribute(bigColors, 3));

    const bigMaterial = new THREE.PointsMaterial({
      size: 0.15,
      map: particleTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });

    const bigPoints = new THREE.Points(bigGeometry, bigMaterial);
    scene.add(bigPoints);

    let time = 0;
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = (event.clientY / window.innerHeight) * 2 - 1;
      targetRotationY = mouseX * 0.2;
      targetRotationX = mouseY * 0.1;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.005;

      points.rotation.y += 0.0005;
      points.rotation.x += 0.0003;
      bigPoints.rotation.y -= 0.0002;
      bigPoints.rotation.x += 0.0001;

      const scale = 0.8 + Math.sin(time * 2) * 0.1;
      material.size = 0.08 * scale;
      bigMaterial.size = 0.15 * scale;

      camera.position.x += (targetRotationY * 1.2 - camera.position.x) * 0.05;
      camera.position.y += (-targetRotationX * 0.8 - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      bigGeometry.dispose();
      bigMaterial.dispose();
      renderer.dispose();
      particleTexture.dispose();
    };
  }, []);

  return <div ref={containerRef} className="absolute inset-0 -z-10 pointer-events-none" />;
}