import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface HolographicCardProps {
  title: string;
  subtitle?: string;
  content: string;
  color?: string;
  height?: number;
  width?: number;
  className?: string;
}

const HolographicCard: React.FC<HolographicCardProps> = ({
  title,
  subtitle,
  content,
  color = '#05D9E8',
  height = 200,
  width = 300,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 5;
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true,
      antialias: true 
    });
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create a group for the card
    const cardGroup = new THREE.Group();
    scene.add(cardGroup);

    // Card geometry
    const cardGeometry = new THREE.PlaneGeometry(4, 3, 20, 20);
    
    // Custom shader material
    const cardMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color: { value: new THREE.Color(color) }
      },
      vertexShader: `
        uniform float time;
        varying vec2 vUv;
        varying float noise;
        
        // Simplex noise function
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
        vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
        float snoise(vec3 v) {
          const vec2 C = vec2(1.0/6.0, 1.0/3.0);
          const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
          
          // First corner
          vec3 i = floor(v + dot(v, C.yyy));
          vec3 x0 = v - i + dot(i, C.xxx);
          
          // Other corners
          vec3 g = step(x0.yzx, x0.xyz);
          vec3 l = 1.0 - g;
          vec3 i1 = min(g.xyz, l.zxy);
          vec3 i2 = max(g.xyz, l.zxy);
          
          vec3 x1 = x0 - i1 + C.xxx;
          vec3 x2 = x0 - i2 + C.yyy;
          vec3 x3 = x0 - D.yyy;
          
          // Permutations
          i = mod289(i);
          vec4 p = permute(permute(permute(
                    i.z + vec4(0.0, i1.z, i2.z, 1.0))
                  + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                + i.x + vec4(0.0, i1.x, i2.x, 1.0));
                
          // Gradients
          float n_ = 0.142857142857;
          vec3 ns = n_ * D.wyz - D.xzx;
          
          vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
          
          vec4 x_ = floor(j * ns.z);
          vec4 y_ = floor(j - 7.0 * x_);
          
          vec4 x = x_ *ns.x + ns.yyyy;
          vec4 y = y_ *ns.x + ns.yyyy;
          vec4 h = 1.0 - abs(x) - abs(y);
          
          vec4 b0 = vec4(x.xy, y.xy);
          vec4 b1 = vec4(x.zw, y.zw);
          
          vec4 s0 = floor(b0)*2.0 + 1.0;
          vec4 s1 = floor(b1)*2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));
          
          vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
          vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
          
          vec3 p0 = vec3(a0.xy, h.x);
          vec3 p1 = vec3(a0.zw, h.y);
          vec3 p2 = vec3(a1.xy, h.z);
          vec3 p3 = vec3(a1.zw, h.w);
          
          // Normalise gradients
          vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
          p0 *= norm.x;
          p1 *= norm.y;
          p2 *= norm.z;
          p3 *= norm.w;
          
          // Mix final noise value
          vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
          m = m * m;
          return 42.0 * dot(m*m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
        }
        
        void main() {
          vUv = uv;
          
          // Calculate noise based on position and time
          float noiseFreq = 2.0;
          float noiseAmp = 0.05;
          vec3 noisePos = vec3(position.x * noiseFreq + time, position.y * noiseFreq + time, time);
          noise = snoise(noisePos) * noiseAmp;
          
          // Apply the noise to the vertex position
          vec3 pos = position;
          pos.z += noise;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        uniform float time;
        varying vec2 vUv;
        varying float noise;
        
        void main() {
          // Base holographic color
          vec3 baseColor = color;
          
          // Add scanlines
          float scanline = sin(vUv.y * 50.0 + time * 5.0) * 0.04 + 0.04;
          
          // Add noise-based color variation
          vec3 finalColor = baseColor * (1.0 + noise * 2.0);
          
          // Add edge glow
          float edgeGlow = 0.05 / (distance(vUv, vec2(0.5, 0.5)) - 0.3);
          finalColor += baseColor * edgeGlow * 0.05;
          
          // Add scanlines
          finalColor += vec3(scanline);
          
          // Alpha based on scanlines and position - make it more transparent
          float alpha = 0.4 + scanline * 0.3;
          
          // Set the final color with transparency
          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      transparent: true
    });

    const card = new THREE.Mesh(cardGeometry, cardMaterial);
    cardGroup.add(card);

    // Add a wireframe overlay
    const wireframeGeometry = new THREE.PlaneGeometry(4.1, 3.1, 8, 8);
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(color),
      wireframe: true,
      transparent: true,
      opacity: 0.15
    });
    
    const wireframe = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
    wireframe.position.z = 0.01;
    cardGroup.add(wireframe);

    // Animation
    const animate = () => {
      const time = performance.now() * 0.001; // Convert to seconds
      
      if (cardMaterial.uniforms) {
        cardMaterial.uniforms.time.value = time;
      }
      
      // Make the card float and rotate slightly
      cardGroup.rotation.x = Math.sin(time * 0.5) * 0.1;
      cardGroup.rotation.y = Math.cos(time * 0.5) * 0.1;
      cardGroup.position.y = Math.sin(time) * 0.1;
      
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    
    animate();

    // Handle mouse movement for parallax effect
    const handleMouseMove = (event: MouseEvent) => {
      if (!cardRef.current) return;
      
      const rect = cardRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Calculate normalized mouse position relative to card center
      const mouseX = (event.clientX - centerX) / (rect.width / 2);
      const mouseY = (event.clientY - centerY) / (rect.height / 2);
      
      // Apply rotation based on mouse position
      cardGroup.rotation.y = mouseX * 0.2;
      cardGroup.rotation.x = -mouseY * 0.2;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Store ref values for cleanup
    const containerElement = containerRef.current;
    const rendererElement = rendererRef.current;

    // Clean up
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (containerElement && rendererElement) {
        containerElement.removeChild(rendererElement.domElement);
      }
    };
  }, [color, height, width]);

  return (
    <div className={`relative ${className}`} style={{ height, width }} ref={cardRef}>
      <div ref={containerRef} className="absolute inset-0 z-10" />
      
      <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-center items-center text-white p-4">
        <h3 className="font-bold text-xl mb-1 text-white drop-shadow-[0_0_8px_rgba(0,0,0,0.8)] uppercase">{title}</h3>
        {subtitle && <p className="text-sm opacity-90 mb-3 text-white drop-shadow-[0_0_5px_rgba(0,0,0,0.8)]">{subtitle}</p>}
        <div className="text-center bg-black/40 px-3 py-1 rounded backdrop-blur-sm border border-white/20">
          <p className="text-white font-mono drop-shadow-[0_0_2px_rgba(255,255,255,0.7)]">{content}</p>
        </div>
      </div>
    </div>
  );
};

export default HolographicCard; 