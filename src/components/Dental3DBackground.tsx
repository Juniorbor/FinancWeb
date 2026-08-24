import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import LOGO_BASE64 from '../assets/logoData';

export const Dental3DBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Cena 3D, Câmera e Renderizador WebGL
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020617, 0.035); // Fundo escuro Slate-950

    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 13);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 2. Luzes Estúdio 3D para destacar a Logo OdontoWeb
    const ambientLight = new THREE.AmbientLight(0x06b6d4, 1.4);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 2.8);
    mainLight.position.set(6, 10, 10);
    scene.add(mainLight);

    const tealLight = new THREE.PointLight(0x06b6d4, 5, 20);
    tealLight.position.set(-6, -4, 5);
    scene.add(tealLight);

    const goldLight = new THREE.PointLight(0xf59e0b, 3, 18);
    goldLight.position.set(6, 4, 4);
    scene.add(goldLight);

    // 3. Carregamento da Textura da Logo Oficial OdontoWeb
    const textureLoader = new THREE.TextureLoader();
    const logoTexture = textureLoader.load(LOGO_BASE64);
    logoTexture.colorSpace = THREE.SRGBColorSpace;
    logoTexture.minFilter = THREE.LinearFilter;
    logoTexture.magFilter = THREE.LinearFilter;

    // 4. Construtor de Medalhas/Emblemas 3D da Logo OdontoWeb
    const createLogoMedalMesh = (radius = 1.8, thickness = 0.22) => {
      const medalGroup = new THREE.Group();

      // Material da Face com a Logo Oficial
      const logoFaceMaterial = new THREE.MeshStandardMaterial({
        map: logoTexture,
        roughness: 0.15,
        metalness: 0.1,
        transparent: false
      });

      // Material Metálico Dourado/Ciano para a Borda da Medalha
      const rimMaterial = new THREE.MeshStandardMaterial({
        color: 0x06b6d4,
        metalness: 0.9,
        roughness: 0.25,
        wireframe: false
      });

      // Material Traseiro com Brasão Metalizado
      const backMaterial = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        metalness: 0.8,
        roughness: 0.3
      });

      // Geometria de Cilindro (Medalha 3D)
      const medalGeo = new THREE.CylinderGeometry(radius, radius, thickness, 64);

      // Aplica materiais diferentes para as faces (lados, topo, fundo)
      const materials = [
        rimMaterial,       // Lateral cilindro (Borda Metálica)
        logoFaceMaterial,  // Face Frontal (Logo OdontoWeb)
        backMaterial       // Face Traseira (Verso Metálico)
      ];

      const medalMesh = new THREE.Mesh(medalGeo, materials);
      // Rotaciona para ficar de frente para a câmera
      medalMesh.rotation.x = Math.PI / 2;
      medalGroup.add(medalMesh);

      // Anel Neon Externo de Destaque 3D
      const outerRingGeo = new THREE.TorusGeometry(radius + 0.18, 0.04, 16, 64);
      const outerRingMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      const outerRingMesh = new THREE.Mesh(outerRingGeo, outerRingMat);
      outerRingMesh.position.z = 0;
      medalGroup.add(outerRingMesh);

      return medalGroup;
    };

    // 5. Lista de Elementos 3D em Movimento
    const animatedItems: { group: THREE.Group; rotX: number; rotY: number; rotZ: number; floatOffset: number; basePos: THREE.Vector3 }[] = [];

    // Emblema Central 3D "HERO" da Logo OdontoWeb
    const heroMedal = createLogoMedalMesh(2.2, 0.28);
    heroMedal.position.set(0, 0.2, 1.5);
    scene.add(heroMedal);
    animatedItems.push({
      group: heroMedal,
      rotX: 0.002,
      rotY: 0.008,
      rotZ: 0.001,
      floatOffset: 0,
      basePos: new THREE.Vector3(0, 0.2, 1.5)
    });

    // Emblemas 3D Secundários Flutuando em Várias Posições e Ângulos
    const backgroundMedalsConfig = [
      { pos: new THREE.Vector3(-5.2, 2.8, -2), radius: 1.2, rX: 0.004, rY: 0.01, rZ: 0.003, offset: 1.2 },
      { pos: new THREE.Vector3(5.5, 2.2, -3), radius: 1.1, rX: -0.003, rY: 0.009, rZ: -0.002, offset: 2.4 },
      { pos: new THREE.Vector3(-4.8, -3.2, -1.5), radius: 1.3, rX: 0.005, rY: -0.008, rZ: 0.004, offset: 3.6 },
      { pos: new THREE.Vector3(5.0, -3.5, -2.5), radius: 1.0, rX: -0.004, rY: 0.011, rZ: -0.003, offset: 4.8 },
      { pos: new THREE.Vector3(0, 4.2, -4), radius: 0.9, rX: 0.003, rY: 0.007, rZ: 0.002, offset: 5.5 }
    ];

    backgroundMedalsConfig.forEach((cfg) => {
      const medal = createLogoMedalMesh(cfg.radius, 0.18);
      medal.position.copy(cfg.pos);
      scene.add(medal);
      animatedItems.push({
        group: medal,
        rotX: cfg.rX,
        rotY: cfg.rY,
        rotZ: cfg.rZ,
        floatOffset: cfg.offset,
        basePos: cfg.pos.clone()
      });
    });

    // 6. Anéis Geométricos 3D Orbitantes com a Cor da Marca OdontoWeb
    const createOrbitRing = (radius: number, color: number) => {
      const ringGeo = new THREE.TorusGeometry(radius, 0.03, 16, 100);
      const ringMat = new THREE.MeshStandardMaterial({
        color: color,
        metalness: 0.9,
        roughness: 0.2
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      const ringGroup = new THREE.Group();
      ringGroup.add(ringMesh);
      return ringGroup;
    };

    const ring1 = createOrbitRing(4.5, 0x06b6d4);
    ring1.rotation.x = Math.PI / 3;
    scene.add(ring1);
    animatedItems.push({
      group: ring1,
      rotX: 0.001,
      rotY: 0.003,
      rotZ: 0.005,
      floatOffset: 0.5,
      basePos: new THREE.Vector3(0, 0, 0)
    });

    const ring2 = createOrbitRing(6.0, 0x38bdf8);
    ring2.rotation.y = Math.PI / 4;
    scene.add(ring2);
    animatedItems.push({
      group: ring2,
      rotX: -0.002,
      rotY: 0.004,
      rotZ: -0.003,
      floatOffset: 1.8,
      basePos: new THREE.Vector3(0, 0, -1)
    });

    // 7. Sistema de Partículas Cintilantes 3D
    const particleCount = 200;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePos[i] = (Math.random() - 0.5) * 32;
      particlePos[i + 1] = (Math.random() - 0.5) * 22;
      particlePos[i + 2] = (Math.random() - 0.5) * 20;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));

    const canvasParticle = document.createElement('canvas');
    canvasParticle.width = 64;
    canvasParticle.height = 64;
    const ctx = canvasParticle.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, 'rgba(6, 182, 212, 1)');
      grad.addColorStop(0.4, 'rgba(56, 189, 248, 0.6)');
      grad.addColorStop(1, 'rgba(2, 6, 23, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 64, 64);
    }
    const particleTex = new THREE.CanvasTexture(canvasParticle);

    const particleMat = new THREE.PointsMaterial({
      size: 0.4,
      map: particleTex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // 8. Interatividade de Paralaxe 3D com o Mouse
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // 9. Loop de Animação 3D contínua a 60 FPS
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Suavização da movimentação do mouse (Lerp)
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      // Câmera reage suavemente à posição do ponteiro do mouse
      camera.position.x = mouseX * 1.8;
      camera.position.y = -mouseY * 1.8;
      camera.lookAt(0, 0, 0);

      // Anima cada Medalha e Anel da Logo em 3D
      animatedItems.forEach((item) => {
        item.group.rotation.x += item.rotX;
        item.group.rotation.y += item.rotY;
        item.group.rotation.z += item.rotZ;

        // Efeito de levitação flutuante suave (Senoide)
        item.group.position.y = item.basePos.y + Math.sin(elapsedTime * 1.4 + item.floatOffset) * 0.25;
      });

      // Rotação sutil da nuvem de partículas
      particleSystem.rotation.y = elapsedTime * 0.02;
      particleSystem.rotation.x = mouseY * 0.15;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
    />
  );
};
