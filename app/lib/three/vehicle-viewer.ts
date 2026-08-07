import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { GLTFLoader, type GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { createJeepWranglerProcedural, type JeepWranglerRig } from "./jeep-wrangler-procedural";

THREE.Cache.enabled = true;

export type ViewerCallbacks = {
  onLoading?: (loading: boolean) => void;
  onProgress?: (progress: number | null) => void;
  onFallback?: (fallback: boolean) => void;
};

export type ProceduralVehicle = "jeep-wrangler";

type LightMaterialState = {
  material: THREE.MeshStandardMaterial;
  onIntensity: number;
  offIntensity: number;
};

export class VehicleScene {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(34, 1, 0.1, 120);
  private controls: OrbitControls;
  private loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  private root = new THREE.Group();
  private resizeObserver: ResizeObserver;
  private animationFrame = 0;
  private disposed = false;
  private callbacks: ViewerCallbacks;
  private environmentTexture?: THREE.Texture;
  private currentJeepRig?: JeepWranglerRig;
  private paintMaterials: THREE.MeshStandardMaterial[] = [];
  private loadedLightMaterials: LightMaterialState[] = [];
  private lightsEnabled = true;
  private defaultCameraPosition = new THREE.Vector3(7.2, 3.25, 8.4);
  private defaultTarget = new THREE.Vector3(0, 1.03, 0);
  private vehicleLongitudinalAxis: "x" | "z" = "x";
  private vehicleFrontSign: 1 | -1 = 1;
  private contactShadow?: THREE.Mesh;
  private shadowCatcher?: THREE.Mesh;
  private backgroundTexture?: THREE.CanvasTexture;
  private vehicleBounds = new THREE.Box3();
  private isVisible = true;
  private intersectionObserver?: IntersectionObserver;
  private loadedFrontSignIsActual = false;
  private corvetteRefinementGroup?: THREE.Group;
  private supraRefinementGroup?: THREE.Group;
  private disableDirectionalGroundShadow = false;

  constructor(private container: HTMLElement, callbacks: ViewerCallbacks = {}) {
    this.callbacks = callbacks;
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    const pixelRatioCap = window.innerWidth < 768 ? 1.25 : 1.5;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, pixelRatioCap));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.setClearColor(0xf2f4f7, 1);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.96;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.container.appendChild(this.renderer.domElement);

    this.camera.position.copy(this.defaultCameraPosition);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.065;
    this.controls.minDistance = 4.3;
    this.controls.maxDistance = 16;
    this.controls.minPolarAngle = 0.03;
    this.controls.maxPolarAngle = Math.PI - 0.03;
    this.controls.target.copy(this.defaultTarget);
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 0.48;

    this.scene.add(this.root);
    this.buildEnvironment();

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.container);
    this.intersectionObserver = new IntersectionObserver(([entry]) => {
      this.isVisible = entry?.isIntersecting ?? true;
    }, { rootMargin: "180px" });
    this.intersectionObserver.observe(this.container);
    this.resize();
    this.animate();
  }

  private buildEnvironment() {
    // Fondo uniforme de estudio. Evita bandas/seams verticales visibles
    // que podían aparecer al proyectar una textura Canvas como background.
    this.backgroundTexture?.dispose();
    this.backgroundTexture = undefined;
    this.scene.background = new THREE.Color(0xf2f4f7);

    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    const room = new RoomEnvironment();
    this.environmentTexture = pmremGenerator.fromScene(room, 0.04).texture;
    this.scene.environment = this.environmentTexture;
    room.dispose();
    pmremGenerator.dispose();

    const hemi = new THREE.HemisphereLight(0xffffff, 0x8b9199, 0.62);
    this.scene.add(hemi);

    const key = new THREE.DirectionalLight(0xffffff, 2.15);
    key.position.set(5.5, 9.5, 7.5);
    key.castShadow = true;
    key.shadow.mapSize.set(1536, 1536);
    key.shadow.camera.left = -8;
    key.shadow.camera.right = 8;
    key.shadow.camera.top = 8;
    key.shadow.camera.bottom = -8;
    key.shadow.bias = -0.00012;
    key.shadow.normalBias = 0.025;
    key.shadow.radius = 3;
    this.scene.add(key);

    const fill = new THREE.DirectionalLight(0xeaf2ff, 0.72);
    fill.position.set(-6, 4.5, 6);
    this.scene.add(fill);

    const rim = new THREE.DirectionalLight(0xfff5e2, 0.92);
    rim.position.set(-6.5, 5.5, -6.5);
    this.scene.add(rim);

    // Captura únicamente las sombras; no crea una tarjeta ni un horizonte visible.
    const shadowCatcher = new THREE.Mesh(
      new THREE.PlaneGeometry(80, 80),
      new THREE.ShadowMaterial({ color: 0x1b2430, opacity: 0.13 }),
    );
    shadowCatcher.rotation.x = -Math.PI / 2;
    shadowCatcher.position.y = -0.018;
    shadowCatcher.receiveShadow = true;
    this.shadowCatcher = shadowCatcher;
    this.scene.add(shadowCatcher);

    const contactTexture = this.createContactShadowTexture();
    const contactShadow = new THREE.Mesh(
      new THREE.PlaneGeometry(6.7, 3.2),
      new THREE.MeshBasicMaterial({
        map: contactTexture,
        transparent: true,
        depthWrite: false,
        opacity: 0.32,
        blending: THREE.MultiplyBlending,
        // MultiplyBlending usa alfa premultiplicado. Sin esta bandera,
        // Three.js emite una advertencia en cada frame del render loop.
        premultipliedAlpha: true,
      }),
    );
    contactShadow.rotation.x = -Math.PI / 2;
    contactShadow.position.y = 0.003;
    this.contactShadow = contactShadow;
    this.scene.add(contactShadow);
  }

  private createContactShadowTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 256;
    const context = canvas.getContext("2d");

    if (context) {
      const gradient = context.createRadialGradient(256, 128, 15, 256, 128, 230);
      gradient.addColorStop(0, "rgba(0,0,0,.38)");
      gradient.addColorStop(0.42, "rgba(0,0,0,.17)");
      gradient.addColorStop(1, "rgba(0,0,0,0)");
      context.fillStyle = gradient;
      context.fillRect(0, 0, canvas.width, canvas.height);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  async setVehicle(
    modelUrl: string | undefined,
    accent: string,
    proceduralModel?: ProceduralVehicle,
  ) {
    this.callbacks.onLoading?.(true);
    this.callbacks.onProgress?.(0);
    this.clearRoot();
    this.currentJeepRig = undefined;
    this.paintMaterials = [];
    this.loadedLightMaterials = [];
    this.vehicleLongitudinalAxis = "x";
    this.vehicleFrontSign = 1;
    this.loadedFrontSignIsActual = false;
    if (this.contactShadow) {
      this.contactShadow.rotation.y = 0;
      this.contactShadow.visible = true;
    }
    if (this.shadowCatcher) this.shadowCatcher.visible = true;
    this.corvetteRefinementGroup = undefined;
    this.supraRefinementGroup = undefined;
    this.disableDirectionalGroundShadow = false;

    if (proceduralModel === "jeep-wrangler") {
      const rig = createJeepWranglerProcedural(accent);
      this.currentJeepRig = rig;
      this.root.add(rig.group);
      this.setLights(this.lightsEnabled);
      this.callbacks.onFallback?.(false);
      this.callbacks.onLoading?.(false);
      return;
    }

    if (modelUrl) {
      try {
        const gltf = await new Promise<GLTF>((resolve, reject) => {
          this.loader.load(
            modelUrl,
            (loadedGltf) => {
              this.callbacks.onProgress?.(null);
              resolve(loadedGltf);
            },
            (event) => {
              const total = event.total || 0;
              this.callbacks.onProgress?.(total > 0 ? Math.min(100, (event.loaded / total) * 100) : null);
            },
            reject,
          );
        });
        const model = gltf.scene;
        this.prepareLoadedModel(model, accent);
        this.root.add(model);
        this.renderer.compile(this.scene, this.camera);
        this.setLights(this.lightsEnabled);
        this.callbacks.onProgress?.(100);
        this.callbacks.onFallback?.(false);
        this.callbacks.onLoading?.(false);
        return;
      } catch (error) {
        console.error("No se pudo cargar el modelo GLB", error);
      }
    }

    this.root.add(this.createGenericVehicle(accent));
    this.callbacks.onFallback?.(true);
    this.callbacks.onLoading?.(false);
  }

  private prepareLoadedModel(model: THREE.Object3D, accent: string) {
    const maxAnisotropy = Math.min(8, this.renderer.capabilities.getMaxAnisotropy());
    let isCorvetteModel = false;
    let isToyota4RunnerModel = false;
    let isFordBroncoModel = false;
    let isToyotaSupraModel = false;
    let isJeepLoadedModel = false;
    let supraLightGlassMesh: THREE.Mesh | undefined;

    model.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;

      const triangleCount = child.geometry.index
        ? child.geometry.index.count / 3
        : (child.geometry.getAttribute("position")?.count ?? 0) / 3;
      child.castShadow = triangleCount > 220 && !`${child.name}`.toLowerCase().includes("glass");
      child.receiveShadow = triangleCount > 220;
      child.frustumCulled = true;

      const sourceMaterials = Array.isArray(child.material) ? child.material : [child.material];
      const clonedMaterials = sourceMaterials.map((material) => material.clone());
      child.material = Array.isArray(child.material) ? clonedMaterials : clonedMaterials[0];

      clonedMaterials.forEach((material) => {
        if (!(material instanceof THREE.MeshStandardMaterial)) return;

        const descriptor = `${child.name} ${material.name}`.toLowerCase();
        const materialName = material.name.toLowerCase();
        material.envMapIntensity = 1.22;

        [material.map, material.emissiveMap].forEach((texture) => {
          if (!texture) return;
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.anisotropy = maxAnisotropy;
          texture.needsUpdate = true;
        });
        [material.normalMap, material.roughnessMap, material.metalnessMap, material.aoMap].forEach((texture) => {
          if (!texture) return;
          texture.anisotropy = maxAnisotropy;
          texture.needsUpdate = true;
        });

        const isTeslaPaint = materialName === "carpaint";
        const isCorvettePaint = materialName === "meshesrevampcorvettepaint0051mtl" || materialName === "paint1mtl";
        const isToyota4RunnerPaint = materialName === "main_paint";
        const isFordBroncoPaint = materialName === "brchassis_xzsg1";
        const isToyotaSupraPaint = [
          "toyota_db06_2025_a90_final_edition_body_n_ref_blend",
          "toyota_db06_2025_a90_final_edition_body_n",
          "toyota_db06_2025_a90_final_edition_bonnet_n_ref_blend",
          "toyota_db06_2025_a90_final_edition_bonnet_n",
        ].includes(materialName);
        if (material.name === "JMI_1355060001_004") isJeepLoadedModel = true;
        if (isCorvettePaint) isCorvetteModel = true;
        if (isToyota4RunnerPaint) isToyota4RunnerModel = true;
        if (materialName.startsWith("br")) isFordBroncoModel = true;
        if (materialName.startsWith("toyota_db06_2025_a90_final_edition")) isToyotaSupraModel = true;
        const isBodyPaint = material.name === "JMI_1355060001_004" || isTeslaPaint || isCorvettePaint || isToyota4RunnerPaint || isFordBroncoPaint || isToyotaSupraPaint;
        const isRoofSection = descriptor.includes("roof") || descriptor.includes("hardtop");
        const isFenderSection = descriptor.includes("fender");
        const isBumperSection = descriptor.includes("bumper");
        const isSideSkirtSection = descriptor.includes("sideskirts");
        const isBodySection = descriptor.includes("body");
        const isSpareRim = descriptor.includes("trunk") && material.name === "JMI_Rim_002";

        if (isBodyPaint) {
          material.map = null;
          material.aoMap = null;
          material.roughnessMap = null;
          material.metalnessMap = null;

          if (isTeslaPaint) {
            // Model 3: azul gris más oscuro y menos reflectante, siguiendo
            // la fotografía real compartida. Reducimos el efecto plateado.
            material.color.set(accent);
            material.metalness = 0.38;
            material.roughness = 0.38;
            material.envMapIntensity = 0.82;
            if (material instanceof THREE.MeshPhysicalMaterial) {
              material.clearcoat = 0.56;
              material.clearcoatRoughness = 0.3;
            }
            this.paintMaterials.push(material);
          } else if (isCorvettePaint) {
            // Corvette C7: rojo más cercano a la unidad real, con brillo vivo,
            // menos saturación tipo CGI y reflejo más controlado.
            material.color.set(accent);
            material.metalness = 0.26;
            material.roughness = 0.34;
            material.envMapIntensity = 0.92;
            if (material instanceof THREE.MeshPhysicalMaterial) {
              material.clearcoat = 0.66;
              material.clearcoatRoughness = 0.24;
            }
            this.paintMaterials.push(material);
          } else if (isToyota4RunnerPaint) {
            // 4Runner de referencia: negro grafito muy oscuro, con reflejo azul
            // sutil bajo luz fuerte. Evitamos un negro puro para conservar las
            // líneas de la carrocería y el acabado brillante de las fotos.
            material.color.set(accent);
            material.metalness = 0.28;
            material.roughness = 0.25;
            material.envMapIntensity = 1.02;
            if (material instanceof THREE.MeshPhysicalMaterial) {
              material.clearcoat = 0.78;
              material.clearcoatRoughness = 0.2;
            }
            this.paintMaterials.push(material);
          } else if (isFordBroncoPaint) {
            // Bronco de referencia: azul vivo metálico, con reflejos limpios y
            // suficiente roughness para evitar el aspecto plástico del render.
            material.map = null;
            material.color.set(accent);
            material.metalness = 0.3;
            material.roughness = 0.31;
            material.envMapIntensity = 0.98;
            if (material instanceof THREE.MeshPhysicalMaterial) {
              material.clearcoat = 0.62;
              material.clearcoatRoughness = 0.24;
            }
            this.paintMaterials.push(material);
          } else if (isToyotaSupraPaint) {
            // Supra real: azul profundo, menos brillante que el primer ajuste.
            // La carrocería conserva el clearcoat sin verse azul cielo.
            material.map = null;
            material.color.set(accent);
            material.metalness = 0.28;
            material.roughness = 0.34;
            material.envMapIntensity = 0.88;
            if (material instanceof THREE.MeshPhysicalMaterial) {
              material.clearcoat = 0.64;
              material.clearcoatRoughness = 0.26;
            }
            this.paintMaterials.push(material);
          } else if (isRoofSection) {
            material.color.set(0x17191c);
            material.metalness = 0.08;
            material.roughness = 0.58;
            material.envMapIntensity = 0.72;
            if (material instanceof THREE.MeshPhysicalMaterial) {
              material.clearcoat = 0.22;
              material.clearcoatRoughness = 0.34;
            }
          } else if (isBumperSection) {
            material.color.set(0x15181b);
            material.metalness = 0.03;
            material.roughness = 0.9;
            material.envMapIntensity = 0.24;
            if (material instanceof THREE.MeshPhysicalMaterial) {
              material.clearcoat = 0.02;
              material.clearcoatRoughness = 0.74;
            }
          } else {
            // Jeep Willys High Velocity: tono amarillo-lima vivo, con reflejo
            // de pintura automotriz pero sin el aspecto metálico excesivo.
            material.color.set(accent);
            material.metalness = 0.2;
            material.roughness = 0.32;
            material.envMapIntensity = 0.92;
            if (material instanceof THREE.MeshPhysicalMaterial) {
              material.clearcoat = 0.62;
              material.clearcoatRoughness = 0.25;
            }
            this.paintMaterials.push(material);
          }
        }

        if (material.name === "Glass") {
          material.color.set(0x2c3540);
          material.transparent = true;
          material.opacity = 0.56;
          material.depthWrite = false;
          material.roughness = 0.2;
          material.metalness = 0;
          material.envMapIntensity = 0.62;
          if (material instanceof THREE.MeshPhysicalMaterial) {
            material.transmission = 0.03;
            material.ior = 1.45;
            material.thickness = 0.03;
          }
        }

        if (materialName === "glass" || materialName === "glassdark") {
          const isDarkGlass = materialName === "glassdark";
          material.color.set(isDarkGlass ? 0x1f2731 : 0x33414f);
          material.transparent = true;
          material.opacity = isDarkGlass ? 0.62 : 0.5;
          material.depthWrite = false;
          material.roughness = isDarkGlass ? 0.24 : 0.18;
          material.metalness = 0;
          material.envMapIntensity = isDarkGlass ? 0.58 : 0.68;
          if (material instanceof THREE.MeshPhysicalMaterial) {
            material.transmission = isDarkGlass ? 0.015 : 0.03;
            material.ior = 1.45;
            material.thickness = 0.026;
          }
        }

        if (materialName === "blackwash") {
          material.color.set(0x111417);
          material.metalness = 0.08;
          material.roughness = 0.56;
          material.envMapIntensity = 0.52;
        }

        if (materialName === "tire_rims") {
          material.color.set(0xb5bcc3);
          material.metalness = 0.9;
          material.roughness = 0.28;
          material.envMapIntensity = 0.98;
        }

        if (materialName === "tirerubber") {
          material.color.set(0x111315);
          material.metalness = 0.02;
          material.roughness = 0.9;
          material.envMapIntensity = 0.22;
        }

        if (materialName === "breaks") {
          material.color.set(0x3b3f44);
          material.metalness = 0.66;
          material.roughness = 0.4;
          material.envMapIntensity = 0.68;
        }

        if (materialName === "carbrand") {
          material.color.set(0xc8cdd1);
          material.metalness = 0.9;
          material.roughness = 0.18;
          material.envMapIntensity = 1.0;
        }

        if (materialName === "mirror") {
          material.color.set(0xb9bec3);
          material.metalness = 0.92;
          material.roughness = 0.14;
          material.envMapIntensity = 1.16;
        }

        if (materialName === "silver") {
          material.color.set(0x8e969e);
          material.metalness = 0.84;
          material.roughness = 0.3;
          material.envMapIntensity = 0.88;
        }

        // Toyota 4Runner: materiales dedicados del GLB stock.
        if (isToyota4RunnerModel && materialName === "black") {
          material.color.set(0x101317);
          material.metalness = 0.08;
          material.roughness = 0.58;
          material.envMapIntensity = 0.5;
        }

        if (isToyota4RunnerModel && materialName === "glass") {
          material.color.set(0x25323c);
          material.transparent = true;
          material.opacity = 0.48;
          material.depthWrite = false;
          material.metalness = 0;
          material.roughness = 0.2;
          material.envMapIntensity = 0.62;
          if (material instanceof THREE.MeshPhysicalMaterial) {
            material.transmission = 0.025;
            material.ior = 1.45;
            material.thickness = 0.03;
          }
        }

        if (isToyota4RunnerModel && materialName === "chrome") {
          material.color.set(0xc3c8cd);
          material.metalness = 0.94;
          material.roughness = 0.2;
          material.envMapIntensity = 1.1;
        }

        if (isToyota4RunnerModel && materialName === "rims") {
          material.color.set(0xb8bec4);
          material.metalness = 0.9;
          material.roughness = 0.27;
          material.envMapIntensity = 0.98;
        }

        if (isToyota4RunnerModel && materialName === "tyres") {
          material.color.set(0x111315);
          material.metalness = 0.01;
          material.roughness = 0.92;
          material.envMapIntensity = 0.2;
        }

        if (isToyota4RunnerModel && materialName === "mirrors") {
          material.color.set(0x151a1f);
          material.metalness = 0.5;
          material.roughness = 0.24;
          material.envMapIntensity = 0.88;
        }

        if (isToyota4RunnerModel && materialName === "hub_lock") {
          material.color.set(0x6e7479);
          material.metalness = 0.82;
          material.roughness = 0.32;
          material.envMapIntensity = 0.82;
        }

        if (isToyota4RunnerModel && materialName === "tail_lights") {
          material.color.set(0x77151a);
          material.roughness = 0.27;
          material.envMapIntensity = 0.7;
        }

        if (isToyota4RunnerModel && materialName === "indicators") {
          material.color.set(0xb35a16);
          material.roughness = 0.28;
          material.envMapIntensity = 0.74;
        }

        // Ford Bronco 2021: techo, plásticos, cristales y detalles oscuros.
        if (isFordBroncoModel) {
          if (materialName === "brroof_xsg1" || materialName === "brroof_xsg3") {
            material.color.set(0x111417);
            material.metalness = 0.05;
            material.roughness = 0.68;
            material.envMapIntensity = 0.44;
          }
          if (["brbumperfront_xsg3", "brbumperfront_xsg7", "brbumperrear_xsg1", "brchassis_xzsg3"].includes(materialName)) {
            material.color.set(0x22272c);
            material.metalness = 0.08;
            material.roughness = 0.62;
            material.envMapIntensity = 0.46;
          }
          if (materialName === "brmirrors_xsg3") {
            material.color.set(0x15191d);
            material.metalness = 0.22;
            material.roughness = 0.42;
            material.envMapIntensity = 0.62;
          }
          if (materialName === "brtrunk_xsg5" || materialName === "brdoors_xsg1") {
            material.color.set(0x27343f);
            material.transparent = true;
            material.opacity = 0.52;
            material.depthWrite = false;
            material.metalness = 0;
            material.roughness = 0.2;
            material.envMapIntensity = 0.62;
          }
          if (materialName === "brbumperfront_xsg9") {
            material.color.set(0x50565b);
            material.metalness = 0.7;
            material.roughness = 0.34;
            material.envMapIntensity = 0.76;
          }
        }

        // Toyota GR Supra A90: carrocería azul, rines/alerón/difusor negros y
        // cristales oscurecidos, siguiendo las fotografías de referencia.
        if (isToyotaSupraModel) {
          if (materialName === "window" || materialName === "glass") {
            material.color.set(0x27333e);
            material.transparent = true;
            material.opacity = materialName === "window" ? 0.58 : 0.46;
            material.depthWrite = false;
            material.metalness = 0;
            material.roughness = 0.18;
            material.envMapIntensity = 0.62;
          }
          if (materialName === "toyota_db06_2025_a90_final_edition_wh" || materialName === "toyota_db06_2025_a90_final_edition_wh_ref_unblend") {
            material.color.set(0x171a1e);
            material.metalness = 0.7;
            material.roughness = 0.36;
            material.envMapIntensity = 0.7;
          }
          if (materialName === "toyota_db06_2025_a90_final_edition_wh_brake") {
            material.color.set(0x282c31);
            material.metalness = 0.72;
            material.roughness = 0.34;
            material.envMapIntensity = 0.76;
          }
          if ([
            "toyota_db06_2025_a90_final_edition_body_n_matte_unblend",
            "toyota_db06_2025_a90_final_edition_punch_n_alpha_plating",
            "toyota_db06_2025_a90_final_edition_punch_n_alpha",
            "toyota_db06_2025_a90_final_edition_punch_n_add",
          ].includes(materialName)) {
            material.color.set(0x111418);
            material.metalness = 0.12;
            material.roughness = 0.58;
            material.envMapIntensity = 0.5;
          }
          if (materialName === "toyota_db06_2025_a90_final_edition_chrome") {
            material.color.set(0x22262b);
            material.metalness = 0.78;
            material.roughness = 0.3;
            material.envMapIntensity = 0.82;
          }
          if (materialName === "lightglasss") {
            // Ópticas del Supra con las luces apagadas: carcasa ahumada.
            // Las micas traseras rojas se reconstruyen como una capa separada
            // usando la geometría original del GLB (ver applySupraRearLightLenses).
            supraLightGlassMesh = child;
            material.color.set(0x22282f);
            material.transparent = true;
            material.opacity = 0.48;
            material.depthWrite = false;
            material.metalness = 0;
            material.roughness = 0.28;
            material.envMapIntensity = 0.5;
            material.emissive.set(0x000000);
            material.emissiveIntensity = 0;
          }
        }

        // Chevrolet Corvette C7 Stingray Z51.
        if (materialName === "meshes1windowsglass1mtl") {
          material.color.set(0x20262c);
          material.transparent = true;
          material.opacity = 0.42;
          material.depthWrite = false;
          material.metalness = 0;
          material.roughness = 0.2;
          material.envMapIntensity = 0.56;
          if (material instanceof THREE.MeshPhysicalMaterial) {
            material.transmission = 0.02;
            material.ior = 1.46;
            material.thickness = 0.03;
          }
        }

        if (materialName === "leathermain11mtl" || materialName === "seatleather21mtl") {
          material.color.set(0x8e1720);
          material.metalness = 0.01;
          material.roughness = 0.62;
          material.envMapIntensity = 0.34;
        }

        if (materialName === "meshesvehiclelights017rim1mtl") {
          material.color.set(0x17191d);
          material.metalness = 0.72;
          material.roughness = 0.38;
          material.envMapIntensity = 0.72;
        }

        if (materialName === "meshesvehiclelights016rotor1mtl") {
          material.color.set(0x9da2a8);
          material.metalness = 0.92;
          material.roughness = 0.28;
          material.envMapIntensity = 0.96;
        }

        if (materialName === "meshes13tyre1mtl") {
          material.color.set(0x121416);
          material.metalness = 0.01;
          material.roughness = 0.92;
          material.envMapIntensity = 0.18;
        }

        if (materialName.startsWith("caliper") && materialName.endsWith("mtl")) {
          material.color.set(0xb3121b);
          material.metalness = 0.38;
          material.roughness = 0.34;
          material.envMapIntensity = 0.76;
        }

        if (materialName === "meshes1chrome0011mtl") {
          material.color.set(0xb9bec2);
          material.metalness = 0.96;
          material.roughness = 0.2;
          material.envMapIntensity = 1.1;
        }

        if (materialName === "meshescarbon20011mtl" || materialName === "meshescarbon20021mtl") {
          material.color.set(0x17191c);
          material.metalness = 0.12;
          material.roughness = 0.46;
          material.envMapIntensity = 0.48;
        }

        // Alerón trasero original del Corvette.
        // Usamos la geometría nativa del GLB (R1Mtl / Rr1Mtl), no cajas
        // añadidas. Eliminamos sus texturas claras y le damos el acabado
        // negro satinado que aparece en la unidad real.
        if (materialName === "r1mtl" || materialName === "rr1mtl") {
          material.map = null;
          material.emissiveMap = null;
          material.aoMap = null;
          material.normalMap = null;
          material.roughnessMap = null;
          material.metalnessMap = null;
          material.color.set(0x111316);
          material.emissive.set(0x000000);
          material.metalness = 0.08;
          material.roughness = 0.62;
          material.envMapIntensity = 0.42;
          material.transparent = false;
          material.opacity = 1;
          material.side = THREE.DoubleSide;
        }

        if (materialName === "part1mtl") {
          material.color.set(0x15171b);
          material.metalness = 0.12;
          material.roughness = 0.64;
          material.envMapIntensity = 0.46;
        }

        if (materialName === "meshes1blacktex0151mtl" || materialName === "meshes1blacktex0171mtl") {
          material.color.set(0x121417);
          material.metalness = 0.1;
          material.roughness = 0.58;
          material.envMapIntensity = 0.48;
        }

        if (material.name === "JMI_Rim_002") {
          material.color.set(isSpareRim ? 0x17191c : 0x26292d);
          material.metalness = 0.56;
          material.roughness = 0.48;
          material.envMapIntensity = 0.72;
        }

        if (isFenderSection && material.name === "JMI_Grid_A1") {
          material.color.set(0x17191c);
          material.metalness = 0.02;
          material.roughness = 0.9;
          material.envMapIntensity = 0.26;
        }

        if (isFenderSection && (material.name === "JMI_Logo_008" || material.name === "JMI_Exhaust1")) {
          material.color.set(0x17191c);
          material.metalness = 0.04;
          material.roughness = 0.9;
          material.envMapIntensity = 0.24;
        }

        if (isBumperSection && (material.name === "JMI_Logo_008" || material.name === "JMI_Exhaust1" || material.name === "JMI_Grid_B1")) {
          material.color.set(0x15181b);
          material.metalness = 0.02;
          material.roughness = 0.9;
          material.envMapIntensity = 0.28;
        }

        if (isSideSkirtSection && (material.name === "JMI_Exhaust1" || material.name === "JMI_Logo_008" || material.name === "JMI_1355060001_004")) {
          material.color.set(0x15181b);
          material.metalness = 0.03;
          material.roughness = 0.92;
          material.envMapIntensity = 0.24;
        }

        if (isBodySection && (material.name === "JMI_Exhaust1" || material.name === "JMI_Logo_008")) {
          material.color.set(0x15181b);
          material.metalness = 0.03;
          material.roughness = 0.9;
          material.envMapIntensity = 0.24;
        }

        // Jeep Willys: el panel de carrocería que rodea las luces traseras
        // pertenece al portón y debe conservar el amarillo-lima. El material
        // original JMI_Logo_008 también se usa en piezas negras, por eso este
        // caso se limita explícitamente a SK_Trunk ... Light4.
        if (descriptor.includes("sk_trunk") && descriptor.includes("light4") && material.name === "JMI_Logo_008") {
          material.map = null;
          material.aoMap = null;
          material.roughnessMap = null;
          material.metalnessMap = null;
          material.color.set(accent);
          material.metalness = 0.22;
          material.roughness = 0.34;
          material.envMapIntensity = 0.86;
          if (material instanceof THREE.MeshPhysicalMaterial) {
            material.clearcoat = 0.48;
            material.clearcoatRoughness = 0.28;
          }
          this.paintMaterials.push(material);
        }

        if (material.name === "JMI_Logo_008" &&
            !descriptor.includes("sk_trunk") &&
            (descriptor.includes("hood") || descriptor.includes("body") || descriptor.includes("door"))) {
          material.color.set(0x111317);
          material.metalness = 0.02;
          material.roughness = 0.72;
          material.envMapIntensity = 0.3;
        }

        if (material.name === "JMI_Plastic1" || material.name === "JMI_Grid_B1" || material.name === "JMI_Grid_A1") {
          if (material.name === "JMI_Plastic1" && isFenderSection) {
            material.color.set(0x17191c);
            material.roughness = 0.92;
            material.envMapIntensity = 0.26;
          } else if (material.name === "JMI_Plastic1" && isBumperSection) {
            material.color.set(0x15181b);
            material.roughness = 0.9;
            material.envMapIntensity = 0.28;
          } else if (material.name === "JMI_Grid_A1" && isFenderSection) {
            material.color.set(0x17191c);
            material.roughness = 0.92;
            material.envMapIntensity = 0.24;
          } else if (material.name === "JMI_Grid_B1" && isBumperSection) {
            material.color.set(0x15181b);
            material.roughness = 0.9;
            material.envMapIntensity = 0.26;
          } else {
            material.color.set(0x131517);
            material.roughness = 0.84;
            material.envMapIntensity = 0.34;
          }
          material.metalness = 0.02;
        }

        const isCorvetteFrontLight = [
          "meshesvehiclelights0011mtl",
          "meshesvehiclelights0031mtl",
          "meshesvehiclelights0041mtl",
          "meshesvehiclelights0051mtl",
          "meshesvehiclelights1mtl",
        ].includes(materialName);
        const isCorvetteRearLight = [
          "meshesvehiclelights0061mtl",
          "meshesvehiclelights0071mtl",
          "meshesvehiclelights0081mtl",
          "meshesvehiclelights0091mtl",
          "meshesvehiclelights0121mtl",
          "meshesvehiclelights0131mtl",
        ].includes(materialName);
        const isCorvetteAmberLight = [
          "meshesvehiclelights0141mtl",
          "meshesvehiclelights0151mtl",
          "meshesvehiclelights0181mtl",
          "meshesvehiclelights0191mtl",
        ].includes(materialName);

        const isToyotaRearLight = isToyota4RunnerModel && materialName === "tail_lights";
        const isToyotaAmberLight = isToyota4RunnerModel && materialName === "indicators";
        const isBroncoFrontLight = isFordBroncoModel && (materialName === "brheadlights_xsg1" || materialName === "brheadlights_xsg3");
        const isBroncoRearLight = isFordBroncoModel && descriptor.includes("taillights");
        const isFrontLight = descriptor.includes("sm_light_f") ||
          (descriptor.includes("bumper_f") && material.name === "JMI_Light_010") ||
          materialName === "innerlights" || isCorvetteFrontLight || isBroncoFrontLight;
        const isRearLight = descriptor.includes("sm_light_b") ||
          descriptor.includes("red_glass") ||
          (descriptor.includes("trunk") && material.name === "JMI_Light_010") ||
          materialName === "redlight" || isCorvetteRearLight || isToyotaRearLight || isBroncoRearLight;
        const isAmberLight = descriptor.includes("orange_glass") || materialName === "orangelights" || isCorvetteAmberLight || isToyotaAmberLight;

        if (isFrontLight || isRearLight || isAmberLight) {
          if (isCorvetteRearLight) {
            // Las micas traseras del Corvette real se ven rojas incluso
            // cuando las luces no están encendidas.
            material.color.set(0x8f151c);
            material.roughness = Math.max(material.roughness, 0.28);
            material.envMapIntensity = 0.7;
          }

          material.emissive = new THREE.Color(
            isRearLight ? 0xff1b12 : isAmberLight ? 0xff8b18 : 0xfff5d8,
          );
          const isTeslaLamp = materialName === "innerlights" || materialName === "redlight" || materialName === "orangelights";
          const isCorvetteLamp = isCorvetteFrontLight || isCorvetteRearLight || isCorvetteAmberLight;
          const isToyotaLamp = isToyotaRearLight || isToyotaAmberLight;
          const onIntensity = isTeslaLamp
            ? (isRearLight ? 1.7 : isAmberLight ? 1.35 : 2.25)
            : isCorvetteLamp
              ? (isRearLight ? 1.45 : isAmberLight ? 1.05 : 1.9)
              : isToyotaLamp
                ? (isRearLight ? 1.35 : 1.05)
                : (isFrontLight ? 3.3 : isRearLight ? 2.25 : 1.9);
          this.loadedLightMaterials.push({ material, onIntensity, offIntensity: 0.03 });
        }

        material.needsUpdate = true;
      });
    });

    // Ajuste fino del alerón original del Corvette: conserva su silueta
    // real y solo aumenta ligeramente presencia/altura para que se parezca
    // a las fotos. La geometría original usa X=ancho, Y=largo y Z=alto.
    if (isCorvetteModel) {
      model.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        const spoilerMaterial = materials.find((item) => {
          const name = item.name.toLowerCase();
          return name === "r1mtl" || name === "rr1mtl";
        });
        if (!spoilerMaterial) return;

        object.geometry = object.geometry.clone();
        object.geometry.computeBoundingBox();
        const box = object.geometry.boundingBox;
        if (!box) return;

        const center = box.getCenter(new THREE.Vector3());
        const isMainWing = spoilerMaterial.name.toLowerCase() === "rr1mtl";
        const scaleX = isMainWing ? 1.025 : 1.05;
        const scaleY = isMainWing ? 1.10 : 1.06;
        const scaleZ = isMainWing ? 1.12 : 1.08;

        object.geometry.translate(-center.x, -center.y, -center.z);
        object.geometry.scale(scaleX, scaleY, scaleZ);
        object.geometry.translate(center.x, center.y + (isMainWing ? 0.045 : 0.025), center.z + (isMainWing ? 0.035 : 0.02));
        object.geometry.computeBoundingBox();
        object.geometry.computeBoundingSphere();
      });
    }

    const initialBox = new THREE.Box3().setFromObject(model);
    const initialSize = initialBox.getSize(new THREE.Vector3());
    const initialCenter = initialBox.getCenter(new THREE.Vector3());
    this.vehicleLongitudinalAxis = initialSize.z > initialSize.x ? "z" : "x";

    const frontWheel = model.getObjectByName("FL") ?? model.getObjectByName("FR");
    if (frontWheel) {
      const wheelCenter = new THREE.Box3().setFromObject(frontWheel).getCenter(new THREE.Vector3());
      const wheelAxisValue = this.vehicleLongitudinalAxis === "z" ? wheelCenter.z : wheelCenter.x;
      const centerAxisValue = this.vehicleLongitudinalAxis === "z" ? initialCenter.z : initialCenter.x;
      this.vehicleFrontSign = wheelAxisValue < centerAxisValue ? -1 : 1;
      this.loadedFrontSignIsActual = true;
    } else {
      // Algunos modelos (como el Tesla) no nombran las ruedas FL/FR. En ese
      // caso localizamos la geometría del faro trasero y usamos el extremo
      // opuesto como frente para que los presets Frontal/Trasera sean correctos.
      let rearLightObject: THREE.Mesh | undefined;
      model.traverse((object) => {
        if (rearLightObject || !(object instanceof THREE.Mesh)) return;
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        if (materials.some((item) => {
          const name = item.name.toLowerCase();
          return name === "redlight" ||
            name === "tail_lights" ||
            name.startsWith("brbumperrear_") ||
            name === "meshesvehiclelights0061mtl" ||
            name === "meshesvehiclelights0071mtl" ||
            name === "meshesvehiclelights0081mtl" ||
            name === "meshesvehiclelights0091mtl";
        })) {
          rearLightObject = object;
        }
      });

      if (!rearLightObject && isFordBroncoModel) {
        model.traverse((object) => {
          if (rearLightObject || !(object instanceof THREE.Mesh)) return;
          const name = object.name.toLowerCase();
          if (name.includes("taillights") || name.includes("bumperrear")) rearLightObject = object;
        });
      }

      if (rearLightObject) {
        const rearCenter = new THREE.Box3().setFromObject(rearLightObject).getCenter(new THREE.Vector3());
        const rearAxisValue = this.vehicleLongitudinalAxis === "z" ? rearCenter.z : rearCenter.x;
        const centerAxisValue = this.vehicleLongitudinalAxis === "z" ? initialCenter.z : initialCenter.x;
        // rearLightObject identifica la parte trasera; el signo del frente es
        // necesariamente el opuesto. Esto también permite colocar correctamente
        // el alerón auxiliar del Corvette sobre la zaga, no sobre el frontal.
        this.vehicleFrontSign = rearAxisValue < centerAxisValue ? 1 : -1;
        this.loadedFrontSignIsActual = true;
      }
    }

    if (isJeepLoadedModel && this.loadedFrontSignIsActual) {
      this.vehicleFrontSign = this.vehicleFrontSign === 1 ? -1 : 1;
    }

    if (isToyotaSupraModel && supraLightGlassMesh) {
      this.applySupraRearLightLenses(supraLightGlassMesh, initialCenter);
    }

    if (this.contactShadow) {
      this.contactShadow.rotation.y = this.vehicleLongitudinalAxis === "z" ? Math.PI / 2 : 0;
    }

    const horizontalLength = Math.max(initialSize.x, initialSize.z, 0.001);
    const scale = 6.15 / horizontalLength;
    model.scale.multiplyScalar(scale);
    model.updateMatrixWorld(true);

    const scaledBox = new THREE.Box3().setFromObject(model);
    const scaledCenter = scaledBox.getCenter(new THREE.Vector3());
    model.position.x -= scaledCenter.x;
    model.position.z -= scaledCenter.z;
    model.position.y += 0.075 - scaledBox.min.y;
    model.updateMatrixWorld(true);

    const finalBox = new THREE.Box3().setFromObject(model);
    this.vehicleBounds.copy(finalBox);
    const finalSize = finalBox.getSize(new THREE.Vector3());
    const finalCenter = finalBox.getCenter(new THREE.Vector3());
    const targetHeight = finalBox.min.y + finalSize.y * 0.46;

    this.defaultTarget.set(finalCenter.x, targetHeight, finalCenter.z);
    this.defaultCameraPosition.set(7.15, Math.max(3.0, finalSize.y * 1.32), 8.0);
    if (isToyota4RunnerModel) {
      this.defaultTarget.set(finalCenter.x, finalBox.min.y + finalSize.y * 0.43, finalCenter.z);
      this.defaultCameraPosition.set(7.45, Math.max(3.45, finalSize.y * 1.25), 8.25);
    }
    this.controls.target.copy(this.defaultTarget);
    this.camera.position.copy(this.defaultCameraPosition);
    this.controls.minDistance = Math.max(3.8, finalSize.length() * 0.55);
    this.controls.maxDistance = Math.max(15, finalSize.length() * 2.2);

    if (isCorvetteModel) {
      // La sombra direccional del catcher producía una banda vertical visible
      // en este modelo. Para el Corvette dejamos únicamente la sombra de
      // contacto suave, evitando la raya central sin perder sensación de apoyo.
      this.disableDirectionalGroundShadow = true;
      if (this.shadowCatcher) this.shadowCatcher.visible = false;
      if (this.contactShadow) {
        this.contactShadow.visible = true;
        const shadowMaterial = this.contactShadow.material as THREE.MeshBasicMaterial;
        shadowMaterial.opacity = 0.19;
      }

      this.corvetteRefinementGroup = this.createCorvetteReferenceRefinements(accent);
      // vehicleBounds ya está en coordenadas del root. Añadir aquí evita
      // aplicar de nuevo la escala/traslación del GLB.
      this.root.add(this.corvetteRefinementGroup);
    }

    if (isToyotaSupraModel) {
      this.supraRefinementGroup = this.createSupraRearRefinements(accent);
      this.root.add(this.supraRefinementGroup);
    }

    this.controls.update();
  }

  private applySupraRearLightLenses(mesh: THREE.Mesh, modelCenter: THREE.Vector3) {
    mesh.updateWorldMatrix(true, false);
    const source = mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry.clone();
    const position = source.getAttribute("position");
    const normal = source.getAttribute("normal");
    if (!position) {
      source.dispose();
      return;
    }

    const rearSign = -this.vehicleFrontSign;
    const centerAxis = this.vehicleLongitudinalAxis === "z" ? modelCenter.z : modelCenter.x;
    const positions: number[] = [];
    const normals: number[] = [];
    const a = new THREE.Vector3();
    const b = new THREE.Vector3();
    const c = new THREE.Vector3();
    const worldCentroid = new THREE.Vector3();

    for (let index = 0; index < position.count; index += 3) {
      a.fromBufferAttribute(position, index);
      b.fromBufferAttribute(position, index + 1);
      c.fromBufferAttribute(position, index + 2);
      worldCentroid.copy(a).add(b).add(c).multiplyScalar(1 / 3).applyMatrix4(mesh.matrixWorld);
      const axisValue = this.vehicleLongitudinalAxis === "z" ? worldCentroid.z : worldCentroid.x;
      if ((axisValue - centerAxis) * rearSign <= 0.45) continue;

      [a, b, c].forEach((vertex) => positions.push(vertex.x, vertex.y, vertex.z));
      if (normal) {
        for (let offset = 0; offset < 3; offset += 1) {
          normals.push(
            normal.getX(index + offset),
            normal.getY(index + offset),
            normal.getZ(index + offset),
          );
        }
      }
    }

    source.dispose();
    if (!positions.length) return;

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    if (normals.length === positions.length) {
      geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
    } else {
      geometry.computeVertexNormals();
    }
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();

    const material = new THREE.MeshPhysicalMaterial({
      color: 0x7e1018,
      emissive: 0x250205,
      emissiveIntensity: 0.08,
      transparent: true,
      opacity: 0.82,
      metalness: 0,
      roughness: 0.3,
      clearcoat: 0.55,
      clearcoatRoughness: 0.22,
      envMapIntensity: 0.72,
      depthWrite: false,
      side: THREE.DoubleSide,
    });

    const lens = new THREE.Mesh(geometry, material);
    lens.name = "SupraRearRedLensOverlay";
    lens.position.copy(mesh.position);
    lens.quaternion.copy(mesh.quaternion);
    lens.scale.copy(mesh.scale);
    lens.renderOrder = mesh.renderOrder + 1;
    mesh.parent?.add(lens);
  }

  private createToyotaEmblemTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 300;
    const context = canvas.getContext("2d");
    if (!context) return new THREE.CanvasTexture(canvas);

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.lineCap = "round";
    context.lineJoin = "round";

    const ellipse = (
      x: number,
      y: number,
      rx: number,
      ry: number,
      rotation = 0,
    ) => {
      context.beginPath();
      context.ellipse(x, y, rx, ry, rotation, 0, Math.PI * 2);
      context.stroke();
    };

    // Borde oscuro muy fino para que el emblema plateado conserve definición
    // sobre la carrocería azul, como en la referencia real.
    context.strokeStyle = "rgba(36, 40, 44, .82)";
    context.lineWidth = 39;
    ellipse(256, 150, 202, 103);
    ellipse(256, 148, 69, 101);
    ellipse(256, 139, 137, 52);

    context.strokeStyle = "#c8ccd0";
    context.lineWidth = 27;
    ellipse(256, 150, 202, 103);
    ellipse(256, 148, 69, 101);
    ellipse(256, 139, 137, 52);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(8, this.renderer.capabilities.getMaxAnisotropy());
    texture.needsUpdate = true;
    return texture;
  }

  private createSupraRearRefinements(accent: string) {
    const group = new THREE.Group();
    const size = this.vehicleBounds.getSize(new THREE.Vector3());
    const center = this.vehicleBounds.getCenter(new THREE.Vector3());
    const rearSign = -this.vehicleFrontSign;
    const length = this.vehicleLongitudinalAxis === "z" ? size.z : size.x;
    const width = this.vehicleLongitudinalAxis === "z" ? size.x : size.z;

    // El emblema original del GLB se representa como un círculo oscuro en la
    // tapa. En lugar de ubicar una placa en el extremo total del bounding box
    // (donde quedaba flotando), tomamos la superficie real de la tapa trasera:
    // aproximadamente 43.2 % del largo desde el centro hacia la zaga.
    const rearSurfaceAxis =
      (this.vehicleLongitudinalAxis === "z" ? center.z : center.x) +
      rearSign * length * 0.432;
    const emblemY = this.vehicleBounds.min.y + size.y * 0.695;

    // Normal aproximada de la tapa del Supra: apunta hacia atrás y ligeramente
    // hacia arriba porque la superficie no es completamente vertical.
    const surfaceNormal = this.vehicleLongitudinalAxis === "z"
      ? new THREE.Vector3(0, 0.43, rearSign * 0.903).normalize()
      : new THREE.Vector3(rearSign * 0.903, 0.43, 0).normalize();

    const surfacePoint = this.vehicleLongitudinalAxis === "z"
      ? new THREE.Vector3(center.x, emblemY, rearSurfaceAxis)
      : new THREE.Vector3(rearSurfaceAxis, emblemY, center.z);

    const planeNormal = new THREE.Vector3(0, 0, 1);
    const surfaceQuaternion = new THREE.Quaternion().setFromUnitVectors(
      planeNormal,
      surfaceNormal,
    );

    // Cubre exactamente el círculo negro del GLB con el mismo acabado de la
    // carrocería. El offset es de milímetros, no centímetros, para que quede
    // integrado en la tapa y no parezca una pieza superpuesta.
    const coverMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(accent),
      metalness: 0.28,
      roughness: 0.34,
      clearcoat: 0.64,
      clearcoatRoughness: 0.26,
      envMapIntensity: 0.88,
      side: THREE.DoubleSide,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
    });
    this.paintMaterials.push(coverMaterial);

    const cover = new THREE.Mesh(
      new THREE.CircleGeometry(width * 0.041, 64),
      coverMaterial,
    );
    cover.position.copy(surfacePoint).addScaledVector(surfaceNormal, 0.0035);
    cover.quaternion.copy(surfaceQuaternion);
    cover.renderOrder = 7;
    group.add(cover);

    const logoMaterial = new THREE.MeshBasicMaterial({
      map: this.createToyotaEmblemTexture(),
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      toneMapped: false,
      polygonOffset: true,
      polygonOffsetFactor: -4,
      polygonOffsetUnits: -4,
    });

    // Tamaño similar al emblema real; queda contenido dentro del área circular
    // que existía en el modelo, en vez de sobresalir a un costado.
    const logo = new THREE.Mesh(
      new THREE.PlaneGeometry(width * 0.078, size.y * 0.052),
      logoMaterial,
    );
    logo.position.copy(surfacePoint).addScaledVector(surfaceNormal, 0.0065);
    logo.quaternion.copy(surfaceQuaternion);
    logo.renderOrder = 8;
    group.add(logo);

    return group;
  }

  private createCorvetteReferenceRefinements(accent: string) {
    const refinements = new THREE.Group();
    const size = this.vehicleBounds.getSize(new THREE.Vector3());
    const center = this.vehicleBounds.getCenter(new THREE.Vector3());
    const frontSign = this.vehicleFrontSign;
    const length = this.vehicleLongitudinalAxis === "x" ? size.x : size.z;
    const width = this.vehicleLongitudinalAxis === "x" ? size.z : size.x;
    const frontAxis = (this.vehicleLongitudinalAxis === "x" ? center.x : center.z) + frontSign * (length * 0.39);
    const rearAxis = (this.vehicleLongitudinalAxis === "x" ? center.x : center.z) - frontSign * (length * 0.466);
    const hoodY = this.vehicleBounds.min.y + size.y * 0.645;
    const rearDeckY = this.vehicleBounds.min.y + size.y * 0.692;

    const paint = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(accent),
      metalness: 0.24,
      roughness: 0.34,
      clearcoat: 0.62,
      clearcoatRoughness: 0.24,
      envMapIntensity: 0.94,
    });
    this.paintMaterials.push(paint);

    const matteBlack = new THREE.MeshStandardMaterial({
      color: 0x0f1114,
      metalness: 0.12,
      roughness: 0.58,
      envMapIntensity: 0.48,
    });

    // Cofre ligeramente levantado para mantener el ajuste respecto a la foto.
    const hoodLength = length * 0.26;
    const hoodPanel = new THREE.Mesh(
      this.vehicleLongitudinalAxis === "x"
        ? new THREE.BoxGeometry(hoodLength, size.y * 0.015, width * 0.56)
        : new THREE.BoxGeometry(width * 0.56, size.y * 0.015, hoodLength),
      paint,
    );
    if (this.vehicleLongitudinalAxis === "x") {
      hoodPanel.position.set(frontAxis - frontSign * (hoodLength * 0.56), hoodY, center.z);
      hoodPanel.rotation.z = -frontSign * 0.09;
    } else {
      hoodPanel.position.set(center.x, hoodY, frontAxis - frontSign * (hoodLength * 0.56));
      hoodPanel.rotation.x = frontSign * 0.09;
    }
    hoodPanel.castShadow = true;
    refinements.add(hoodPanel);

    const hoodGap = new THREE.Mesh(
      this.vehicleLongitudinalAxis === "x"
        ? new THREE.BoxGeometry(length * 0.22, size.y * 0.0045, width * 0.58)
        : new THREE.BoxGeometry(width * 0.58, size.y * 0.0045, length * 0.22),
      matteBlack,
    );
    if (this.vehicleLongitudinalAxis === "x") {
      hoodGap.position.set(frontAxis - frontSign * (length * 0.18), hoodY - size.y * 0.018, center.z);
      hoodGap.rotation.z = -frontSign * 0.018;
    } else {
      hoodGap.position.set(center.x, hoodY - size.y * 0.018, frontAxis - frontSign * (length * 0.18));
      hoodGap.rotation.x = frontSign * 0.018;
    }
    refinements.add(hoodGap);

    // El alerón trasero se resuelve con las mallas nativas R1Mtl/Rr1Mtl.
    // No añadimos primitivas BoxGeometry: las cajas auxiliares deformaban
    // la silueta del C7 y sobresalían de la carrocería.

    return refinements;
  }

  setPaintColor(color: string) {
    const next = new THREE.Color(color);
    this.paintMaterials.forEach((material) => {
      material.color.copy(next);
      material.needsUpdate = true;
    });
  }

  private createGenericVehicle(accent: string) {
    const vehicle = new THREE.Group();
    vehicle.rotation.y = -0.35;

    const paint = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(accent),
      metalness: 0.62,
      roughness: 0.24,
      clearcoat: 0.92,
      clearcoatRoughness: 0.15,
    });
    const dark = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.34, metalness: 0.35 });
    const glass = new THREE.MeshPhysicalMaterial({
      color: 0x6f8fa7,
      roughness: 0.08,
      metalness: 0.08,
      transparent: true,
      opacity: 0.72,
      transmission: 0.22,
    });
    const chrome = new THREE.MeshStandardMaterial({ color: 0xd8dde4, roughness: 0.18, metalness: 0.95 });
    const light = new THREE.MeshStandardMaterial({ color: 0xfaf3c0, emissive: 0xfff1a6, emissiveIntensity: 1.2 });
    const redLight = new THREE.MeshStandardMaterial({ color: 0x8c1111, emissive: 0xef2525, emissiveIntensity: 0.75 });

    const body = new THREE.Mesh(new THREE.BoxGeometry(5.65, 0.82, 2.45, 4, 2, 2), paint);
    body.position.y = 0.9;
    body.castShadow = true;
    vehicle.add(body);

    const hood = new THREE.Mesh(new THREE.BoxGeometry(1.78, 0.42, 2.32), paint);
    hood.position.set(1.78, 1.38, 0);
    hood.rotation.z = -0.03;
    hood.castShadow = true;
    vehicle.add(hood);

    const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.65, 1.22, 2.14), paint);
    cabin.position.set(-0.42, 1.76, 0);
    cabin.scale.set(1, 1, 0.98);
    cabin.castShadow = true;
    vehicle.add(cabin);

    const windshield = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.83, 1.9), glass);
    windshield.position.set(0.92, 1.83, 0);
    windshield.rotation.z = -0.28;
    vehicle.add(windshield);

    const rearGlass = windshield.clone();
    rearGlass.position.x = -1.72;
    rearGlass.rotation.z = 0.24;
    vehicle.add(rearGlass);

    for (const z of [-1.08, 1.08]) {
      const sideGlass = new THREE.Mesh(new THREE.BoxGeometry(1.78, 0.72, 0.06), glass);
      sideGlass.position.set(-0.42, 1.92, z);
      vehicle.add(sideGlass);
    }

    const bumperFront = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.32, 2.35), dark);
    bumperFront.position.set(2.95, 0.66, 0);
    vehicle.add(bumperFront);
    const bumperRear = bumperFront.clone();
    bumperRear.position.x = -2.95;
    vehicle.add(bumperRear);

    for (const z of [-0.82, 0.82]) {
      const headlamp = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.28, 0.5), light);
      headlamp.position.set(2.98, 1.02, z);
      vehicle.add(headlamp);
      const tail = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.31, 0.47), redLight);
      tail.position.set(-2.98, 1.04, z);
      vehicle.add(tail);
    }

    const grille = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.46, 1.25), chrome);
    grille.position.set(3.02, 0.94, 0);
    vehicle.add(grille);

    const wheelPositions = [
      [1.72, -1.18], [1.72, 1.18], [-1.75, -1.18], [-1.75, 1.18],
    ] as const;
    wheelPositions.forEach(([x, z]) => {
      const wheel = new THREE.Group();
      wheel.position.set(x, 0.54, z);
      const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.58, 0.34, 40), dark);
      tire.rotation.x = Math.PI / 2;
      tire.castShadow = true;
      wheel.add(tire);
      const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.36, 24), chrome);
      rim.rotation.x = Math.PI / 2;
      wheel.add(rim);
      vehicle.add(wheel);
    });

    return vehicle;
  }

  setAutoRotate(enabled: boolean) {
    this.controls.autoRotate = enabled;
  }

  toggleLights() {
    this.lightsEnabled = !this.lightsEnabled;
    this.setLights(this.lightsEnabled);
    return this.lightsEnabled;
  }

  private setLights(enabled: boolean) {
    if (this.currentJeepRig) {
      this.currentJeepRig.headlightMaterials.forEach((material) => {
        material.emissiveIntensity = enabled ? 2.4 : 0.08;
        material.needsUpdate = true;
      });
      this.currentJeepRig.tailLightMaterials.forEach((material) => {
        material.emissiveIntensity = enabled ? 1.25 : 0.06;
        material.needsUpdate = true;
      });
    }

    this.loadedLightMaterials.forEach(({ material, onIntensity, offIntensity }) => {
      material.emissiveIntensity = enabled ? onIntensity : offIntensity;
      material.needsUpdate = true;
    });
  }

  setView(view: "front" | "side" | "rear" | "bottom") {
    const distance = 9.6;
    const height = Math.max(2.7, this.defaultCameraPosition.y * 0.86);
    // En los GLB cargados vehicleFrontSign representa el lado real del frente.
    // El Jeep procedural conserva la convención histórica del prototipo.
    const frontSideSign = this.loadedFrontSignIsActual ? this.vehicleFrontSign : -this.vehicleFrontSign;
    const frontDistance = frontSideSign * distance;
    const min = this.vehicleBounds.min;
    const size = this.vehicleBounds.getSize(new THREE.Vector3());
    const bottomY = min.y - Math.max(2.8, size.y * 0.95);
    const bottomOffset = Math.max(0.55, size.z * 0.06);
    const positions = this.vehicleLongitudinalAxis === "z"
      ? {
          front: new THREE.Vector3(0, height, frontDistance),
          side: new THREE.Vector3(distance, height + 0.2, 0),
          rear: new THREE.Vector3(0, height, -frontDistance),
          bottom: new THREE.Vector3(0, bottomY, bottomOffset),
        }
      : {
          front: new THREE.Vector3(frontDistance, height, 0),
          side: new THREE.Vector3(0, height + 0.2, distance),
          rear: new THREE.Vector3(-frontDistance, height, 0),
          bottom: new THREE.Vector3(bottomOffset, bottomY, 0),
        };
    this.camera.position.copy(positions[view]);
    this.controls.target.copy(this.defaultTarget);
    this.updateGroundVisibility();
    this.controls.update();
  }

  zoom(direction: number) {
    const offset = this.camera.position.clone().sub(this.controls.target);
    offset.multiplyScalar(direction > 0 ? 0.82 : 1.18);
    offset.clampLength(this.controls.minDistance, this.controls.maxDistance);
    this.camera.position.copy(this.controls.target).add(offset);
    this.controls.update();
  }

  reset() {
    this.camera.position.copy(this.defaultCameraPosition);
    this.controls.target.copy(this.defaultTarget);
    this.updateGroundVisibility();
    this.controls.update();
  }

  private updateGroundVisibility() {
    const isBelowVehicle = this.camera.position.y < this.defaultTarget.y - 0.35;
    if (this.shadowCatcher) {
      this.shadowCatcher.visible = !isBelowVehicle && !this.disableDirectionalGroundShadow;
    }
    if (this.contactShadow) this.contactShadow.visible = !isBelowVehicle;
  }

  private resize() {
    const width = Math.max(1, this.container.clientWidth);
    const height = Math.max(1, this.container.clientHeight);
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  private animate = () => {
    if (this.disposed) return;
    this.controls.update();
    this.updateGroundVisibility();
    if (this.isVisible) this.renderer.render(this.scene, this.camera);
    this.animationFrame = requestAnimationFrame(this.animate);
  };

  private clearRoot() {
    const geometries = new Set<THREE.BufferGeometry>();
    const materials = new Set<THREE.Material>();

    while (this.root.children.length) {
      const child = this.root.children.pop();
      child?.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        geometries.add(object.geometry);
        const objectMaterials = Array.isArray(object.material) ? object.material : [object.material];
        objectMaterials.forEach((material) => materials.add(material));
      });
    }

    geometries.forEach((geometry) => geometry.dispose());
    materials.forEach((material) => material.dispose());
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.animationFrame);
    this.resizeObserver.disconnect();
    this.intersectionObserver?.disconnect();
    this.controls.dispose();
    this.clearRoot();
    this.environmentTexture?.dispose();
    this.backgroundTexture?.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
