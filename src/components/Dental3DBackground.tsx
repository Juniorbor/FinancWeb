import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const Dental3DBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Cena, Câmera e Renderizador
    const scene = new THREE.Scene();
    // Névoa suave de fundo
    scene.fog = new THREE.FogExp2(0x0f172a, 0.035);

    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 14);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    // Limpa qualquer canvas anterior
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 2. Iluminação 3D Avançada (Luz Odontológica & Estúdio Fotorrealista)
    const ambientLight = new THREE.AmbientLight(0x06b6d4, 1.2);
    scene.add(ambientLight);

    // Luz Principal Direcional (Luz Refletor Odontológico)
    const mainLight = new THREE.DirectionalLight(0xffffff, 2.5);
    mainLight.position.set(8, 12, 10);
    mainLight.castShadow = true;
    scene.add(mainLight);

    // Luz de Preenchimento Azul Turquesa (Teal Neon)
    const fillLight = new THREE.PointLight(0x06b6d4, 4, 25);
    fillLight.position.set(-8, -4, 6);
    scene.add(fillLight);

    // Luz de Recorte Traseira (Backlight Ciano Brilhante)
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 2);
    rimLight.position.set(0, -10, -8);
    scene.add(rimLight);

    // 3. Criação de Geometria 3D de Dente Molar Fotorrealista
    const createToothMesh = () => {
      const toothGroup = new THREE.Group();

      // Material do Esmalte Dental (Branco Pérola Glossy com Reflexo Ciano)
      const crownMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xf8fafc,
        roughness: 0.12,
        metalness: 0.05,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        transmission: 0.25, // Transparência sutil de esmalte natural
        thickness: 0.5,
        ior: 1.5,
        reflectivity: 0.9,
        sheen: 0.8,
        sheenColor: 0x06b6d4
      });

      // Material da Raiz Dental (Tom Marfim Levemente Mais Escuro)
      const rootMaterial = new THREE.MeshStandardMaterial({
        color: 0xf1f5f9,
        roughness: 0.35,
        metalness: 0.05
      });

      // Coroa Principal (Corpo do Dente)
      const crownGeo = new THREE.CylinderGeometry(1.2, 0.9, 1.4, 32, 16);
      // Deforma a coroa para dar o formato anatômico de molar
      const crownPositions = crownGeo.attributes.position;
      for (let i = 0; i < crownPositions.count; i++) {
        let x = crownPositions.getX(i);
        let y = crownPositions.getY(i);
        let z = crownPositions.getZ(i);

        // Suaviza o topo e alarga as laterais da coroa
        if (y > 0) {
          x *= 1.15 + Math.sin(x * 3) * 0.08;
          z *= 1.15 + Math.cos(z * 3) * 0.08;
        }
        crownPositions.setXYZ(i, x, y, z);
      }
      crownGeo.computeVertexNormals();
      const crownMesh = new THREE.Mesh(crownGeo, crownMaterial);
      crownMesh.position.y = 0.4;
      crownMesh.castShadow = true;
      crownMesh.receiveShadow = true;
      toothGroup.add(crownMesh);

      // Cúspides Occlusais (4 Pontas Anatômicas do Molar)
      const cuspGeo = new THREE.SphereGeometry(0.38, 16, 16);
      const cuspPositions = [
        [-0.55, 1.1, -0.55],
        [0.55, 1.1, -0.55],
        [-0.55, 1.1, 0.55],
        [0.55, 1.1, 0.55]
      ];
      cuspPositions.forEach(([cx, cy, cz]) => {
        const cusp = new THREE.Mesh(cuspGeo, crownMaterial);
        cusp.position.set(cx, cy, cz);
        cusp.scale.set(1, 0.65, 1);
        toothGroup.add(cusp);
      });

      // Raízes Anatômicas (Duas Raízes Curvadas: Mesial e Distal)
      const createRoot = (xOffset: number, curveDirection: number) => {
        const rootCurve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(xOffset * 0.6, -0.3, 0),
          new THREE.Vector3(xOffset * 0.9, -1.2, curveDirection * 0.2),
          new THREE.Vector3(xOffset * 0.4, -2.1, curveDirection * 0.4)
        ]);

        const rootGeo = new THREE.TubeGeometry(rootCurve, 20, 0.35, 16, false);
        const rootMesh = new THREE.Mesh(rootGeo, rootMaterial);
        rootMesh.castShadow = true;
        return rootMesh;
      };

      toothGroup.add(createRoot(-0.6, 1));
      toothGroup.add(createRoot(0.6, -1));

      return toothGroup;
    };

    // 4. Criação de Implante Dental 3D (Titânio e Anel de Led)
    const createImplantMesh = () => {
      const implantGroup = new THREE.Group();

      const titaniumMaterial = new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        metalness: 0.9,
        roughness: 0.2
      });

      const glowRingMaterial = new THREE.MeshBasicMaterial({
        color: 0x06b6d4
      });

      // Rosca do Implante
      const threadGeo = new THREE.CylinderGeometry(0.5, 0.3, 2.2, 24, 16);
      const threadMesh = new THREE.Mesh(threadGeo, titaniumMaterial);
      implantGroup.add(threadMesh);

      // Anel Neon de Led Odontológico
      const ringGeo = new THREE.TorusGeometry(0.55, 0.06, 16, 32);
      const ringMesh = new THREE.Mesh(ringGeo, glowRingMaterial);
      ringMesh.position.y = 1.0;
      ringMesh.rotation.x = Math.PI / 2;
      implantGroup.add(ringMesh);

      return implantGroup;
    };

    // 5. Instanciação dos Elementos Odontológicos 3D na Cena
    const teethList: { group: THREE.Group; rotSpeedX: number; rotSpeedY: number; floatOffset: number }[] = [];

    // Dente Principal Heroico Central Flutuante
    const heroTooth = createToothMesh();
    heroTooth.position.set(0, 0.5, 2);
    heroTooth.scale.set(1.5, 1.5, 1.5);
    scene.add(heroTooth);
    teethList.push({ group: heroTooth, rotSpeedX: 0.003, rotSpeedY: 0.006, floatOffset: 0 });

    // Dentes 3D Secundários Flutuando em Segundo Plano
    const backgroundPositions = [
      { pos: [-5, 3, -2], scale: 0.9, rX: 0.005, rY: 0.008, offset: 1 },
      { pos: [5.5, 2.5, -3], scale: 0.8, rX: 0.004, rY: 0.007, offset: 2 },
      { pos: [-4.5, -3, -1], scale: 0.85, rX: 0.006, rY: 0.005, offset: 3 },
      { pos: [4.8, -3.2, -2], scale: 0.95, rX: 0.003, rY: 0.009, offset: 4 },
      { pos: [0, 4.5, -4], scale: 0.7, rX: 0.002, rY: 0.006, offset: 5 }
    ];

    backgroundPositions.forEach((config) => {
      const tooth = createToothMesh();
      tooth.position.set(config.pos[0], config.pos[1], config.pos[2]);
      tooth.scale.set(config.scale, config.scale, config.scale);
      scene.add(tooth);
      teethList.push({
        group: tooth,
        rotSpeedX: config.rX,
        rotSpeedY: config.rY,
        floatOffset: config.offset
      });
    });

    // Implantes 3D Orbitantes
    const implant1 = createImplantMesh();
    implant1.position.set(-6, 0, -1);
    implant1.rotation.z = Math.PI / 6;
    scene.add(implant1);
    teethList.push({ group: implant1, rotSpeedX: 0.008, rotSpeedY: 0.012, floatOffset: 1.5 });

    const implant2 = createImplantMesh();
    implant2.position.set(6, 0.5, -1);
    implant2.rotation.z = -Math.PI / 5;
    scene.add(implant2);
    teethList.push({ group: implant2, rotSpeedX: 0.007, rotSpeedY: 0.01, floatOffset: 2.5 });

    // 6. Nuvem de Partículas 3D de Cuidado Dental & Brilho
    const particleCount = 180;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePos[i] = (Math.random() - 0.5) * 30;
      particlePos[i + 1] = (Math.random() - 0.5) * 20;
      particlePos[i + 2] = (Math.random() - 0.5) * 20;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));

    // Textura em Círculo Radiante
    const canvasParticle = document.createElement('canvas');
    canvasParticle.width = 64;
    canvasParticle.height = 64;
    const ctx = canvasParticle.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, 'rgba(6, 182, 212, 1)');
      grad.addColorStop(0.5, 'rgba(56, 189, 248, 0.5)');
      grad.addColorStop(1, 'rgba(15, 23, 42, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 64, 64);
    }
    const particleTexture = new THREE.CanvasTexture(canvasParticle);

    const particleMat = new THREE.PointsMaterial({
      size: 0.35,
      map: particleTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // 7. Interatividade 3D com o Mouse (Paralaxe Suave)
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Redimensionamento de Tela Responsivo
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // 8. Loop de Animação 3D a 60 FPS
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Suavização do movimento do mouse (Lerp)
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      // Movimento suave da Câmera conforme o Mouse
      camera.position.x = mouseX * 1.5;
      camera.position.y = -mouseY * 1.5;
      camera.lookAt(0, 0, 0);

      // Animação e Rotação 3D dos Dentes e Implantes
      teethList.forEach((item) => {
        item.group.rotation.x += item.rotSpeedX;
        item.group.rotation.y += item.rotSpeedY;

        // Efeito de levitação de ondas suaves (Biológico)
        item.group.position.y += Math.sin(elapsedTime * 1.5 + item.floatOffset) * 0.003;
      });

      // Rotação suave da Nuvem de Partículas
      particleSystem.rotation.y = elapsedTime * 0.03;
      particleSystem.rotation.x = mouseY * 0.2;

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup ao desmontar
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
