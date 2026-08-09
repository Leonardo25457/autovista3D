import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

export type JeepWranglerRig = {
  group: THREE.Group;
  paintMaterials: THREE.MeshPhysicalMaterial[];
  headlightMaterials: THREE.MeshStandardMaterial[];
  tailLightMaterials: THREE.MeshStandardMaterial[];
};

type JeepMaterials = {
  paint: THREE.MeshPhysicalMaterial;
  paintDark: THREE.MeshPhysicalMaterial;
  blackPlastic: THREE.MeshStandardMaterial;
  roof: THREE.MeshStandardMaterial;
  glass: THREE.MeshPhysicalMaterial;
  chrome: THREE.MeshStandardMaterial;
  rim: THREE.MeshStandardMaterial;
  tire: THREE.MeshStandardMaterial;
  interior: THREE.MeshStandardMaterial;
  seat: THREE.MeshStandardMaterial;
  brake: THREE.MeshStandardMaterial;
  headlight: THREE.MeshStandardMaterial;
  headlightLens: THREE.MeshPhysicalMaterial;
  tailLight: THREE.MeshStandardMaterial;
  amber: THREE.MeshStandardMaterial;
  white: THREE.MeshStandardMaterial;
};

const castAndReceive = (object: THREE.Object3D) => {
  object.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  return object;
};

function roundedBox(
  name: string,
  width: number,
  height: number,
  depth: number,
  radius: number,
  material: THREE.Material,
) {
  const geometry = new RoundedBoxGeometry(width, height, depth, 4, radius);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = name;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function createMaterials(accent: string): JeepMaterials {
  const bodyColor = new THREE.Color(accent);
  const darker = bodyColor.clone().offsetHSL(0, 0, -0.075);

  const paint = new THREE.MeshPhysicalMaterial({
    name: "BodyPaint",
    color: bodyColor,
    metalness: 0.68,
    roughness: 0.2,
    clearcoat: 1,
    clearcoatRoughness: 0.085,
    envMapIntensity: 1.45,
  });

  const paintDark = new THREE.MeshPhysicalMaterial({
    name: "BodyPaintDark",
    color: darker,
    metalness: 0.62,
    roughness: 0.24,
    clearcoat: 0.92,
    clearcoatRoughness: 0.12,
    envMapIntensity: 1.35,
  });

  return {
    paint,
    paintDark,
    blackPlastic: new THREE.MeshStandardMaterial({
      name: "BlackPlastic",
      color: 0x111418,
      roughness: 0.54,
      metalness: 0.08,
      envMapIntensity: 0.65,
    }),
    roof: new THREE.MeshStandardMaterial({
      name: "HardTop",
      color: 0x171a1e,
      roughness: 0.38,
      metalness: 0.12,
      envMapIntensity: 0.85,
    }),
    glass: new THREE.MeshPhysicalMaterial({
      name: "AutomotiveGlass",
      color: 0x91b5c7,
      metalness: 0,
      roughness: 0.075,
      transmission: 0.72,
      thickness: 0.035,
      ior: 1.45,
      transparent: true,
      opacity: 0.46,
      side: THREE.DoubleSide,
      depthWrite: false,
      envMapIntensity: 1.2,
    }),
    chrome: new THREE.MeshStandardMaterial({
      name: "Chrome",
      color: 0xdde2e7,
      roughness: 0.14,
      metalness: 0.98,
      envMapIntensity: 1.55,
    }),
    rim: new THREE.MeshStandardMaterial({
      name: "AlloyWheel",
      color: 0x8a929b,
      roughness: 0.23,
      metalness: 0.9,
      envMapIntensity: 1.25,
    }),
    tire: new THREE.MeshStandardMaterial({
      name: "TireRubber",
      color: 0x090b0e,
      roughness: 0.86,
      metalness: 0.01,
    }),
    interior: new THREE.MeshStandardMaterial({
      name: "InteriorPlastic",
      color: 0x17191d,
      roughness: 0.66,
      metalness: 0.04,
    }),
    seat: new THREE.MeshStandardMaterial({
      name: "SeatFabric",
      color: 0x25282e,
      roughness: 0.82,
      metalness: 0,
    }),
    brake: new THREE.MeshStandardMaterial({
      name: "BrakeDisc",
      color: 0x666b72,
      roughness: 0.4,
      metalness: 0.82,
    }),
    headlight: new THREE.MeshStandardMaterial({
      name: "HeadlightEmitter",
      color: 0xfff5d7,
      emissive: 0xffe8a5,
      emissiveIntensity: 1.35,
      roughness: 0.16,
      metalness: 0.12,
    }),
    headlightLens: new THREE.MeshPhysicalMaterial({
      name: "HeadlightLens",
      color: 0xf7fbff,
      transmission: 0.62,
      transparent: true,
      opacity: 0.7,
      roughness: 0.055,
      thickness: 0.02,
      ior: 1.46,
      envMapIntensity: 1.3,
    }),
    tailLight: new THREE.MeshStandardMaterial({
      name: "TailLight",
      color: 0x9d0c14,
      emissive: 0xe41622,
      emissiveIntensity: 0.7,
      roughness: 0.22,
      metalness: 0.08,
    }),
    amber: new THREE.MeshStandardMaterial({
      name: "AmberLight",
      color: 0xe59713,
      emissive: 0xff9d1e,
      emissiveIntensity: 0.62,
      roughness: 0.2,
    }),
    white: new THREE.MeshStandardMaterial({
      name: "WhitePlastic",
      color: 0xf1f4f6,
      roughness: 0.28,
      metalness: 0.16,
    }),
  };
}

function createMainBody(materials: JeepMaterials) {
  const body = new THREE.Group();
  body.name = "WranglerBody";

  const shape = new THREE.Shape();
  shape.moveTo(-2.58, 0.43);
  shape.lineTo(-2.34, 0.43);
  shape.lineTo(-2.34, 0.59);

  const appendArch = (centerX: number, radius: number) => {
    for (let index = 0; index <= 18; index += 1) {
      const angle = Math.PI - (index / 18) * Math.PI;
      shape.lineTo(centerX + Math.cos(angle) * radius, 0.59 + Math.sin(angle) * radius);
    }
  };

  appendArch(-1.67, 0.67);
  shape.lineTo(-0.98, 0.43);
  shape.lineTo(0.96, 0.43);
  shape.lineTo(0.96, 0.59);
  appendArch(1.64, 0.67);
  shape.lineTo(2.34, 0.43);
  shape.lineTo(2.62, 0.53);
  shape.lineTo(2.59, 1.02);
  shape.lineTo(2.42, 1.31);
  shape.lineTo(1.84, 1.49);
  shape.lineTo(1.18, 1.51);
  shape.lineTo(0.88, 1.44);
  shape.lineTo(-2.42, 1.4);
  shape.lineTo(-2.58, 1.21);
  shape.closePath();

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 1.94,
    bevelEnabled: true,
    bevelSegments: 3,
    bevelSize: 0.045,
    bevelThickness: 0.045,
    curveSegments: 16,
  });
  geometry.translate(0, 0, -0.97);
  geometry.computeVertexNormals();

  const shell = new THREE.Mesh(geometry, materials.paint);
  shell.name = "BodyShell";
  shell.castShadow = true;
  shell.receiveShadow = true;
  body.add(shell);

  const rockerLeft = roundedBox("RockerPanel_L", 2.0, 0.16, 0.11, 0.04, materials.blackPlastic);
  rockerLeft.position.set(-0.02, 0.49, 1.02);
  body.add(rockerLeft);
  const rockerRight = rockerLeft.clone();
  rockerRight.name = "RockerPanel_R";
  rockerRight.position.z = -1.02;
  body.add(rockerRight);

  const hood = roundedBox("Hood", 1.53, 0.17, 1.92, 0.075, materials.paint);
  hood.position.set(1.66, 1.48, 0);
  hood.rotation.z = -0.025;
  body.add(hood);

  const hoodBulge = roundedBox("HoodPowerDome", 0.98, 0.09, 0.84, 0.055, materials.paintDark);
  hoodBulge.position.set(1.52, 1.585, 0);
  hoodBulge.rotation.z = -0.025;
  body.add(hoodBulge);

  for (const z of [-0.78, 0.78]) {
    const latch = roundedBox("HoodLatch", 0.16, 0.11, 0.07, 0.025, materials.blackPlastic);
    latch.position.set(1.09, 1.51, z);
    body.add(latch);
  }

  const rearGate = roundedBox("RearGate", 0.13, 0.86, 1.72, 0.06, materials.paint);
  rearGate.position.set(-2.57, 1.03, 0);
  body.add(rearGate);

  const fuelDoor = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.018, 32), materials.paintDark);
  fuelDoor.name = "FuelDoor";
  fuelDoor.rotation.x = Math.PI / 2;
  fuelDoor.position.set(-1.95, 1.15, 0.993);
  body.add(fuelDoor);

  return body;
}

function createSidePanel(
  name: string,
  points: Array<[number, number]>,
  z: number,
  thickness: number,
  material: THREE.Material,
) {
  const shape = new THREE.Shape();
  shape.moveTo(points[0][0], points[0][1]);
  points.slice(1).forEach(([x, y]) => shape.lineTo(x, y));
  shape.closePath();

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: Math.min(0.018, thickness * 0.4),
    bevelThickness: Math.min(0.012, thickness * 0.3),
  });
  geometry.translate(0, 0, -thickness / 2);
  geometry.computeVertexNormals();

  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = name;
  mesh.position.z = z;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function createCabin(materials: JeepMaterials) {
  const cabin = new THREE.Group();
  cabin.name = "Cabin";

  const roof = roundedBox("FreedomTop", 2.94, 0.19, 2.07, 0.075, materials.roof);
  roof.position.set(-0.43, 2.39, 0);
  cabin.add(roof);

  const roofFrontLine = roundedBox("RoofPanelSeam", 0.025, 0.015, 2.0, 0.007, materials.blackPlastic);
  roofFrontLine.position.set(0.32, 2.49, 0);
  cabin.add(roofFrontLine);

  const roofCenterLine = roundedBox("RoofCenterSeam", 2.35, 0.015, 0.025, 0.007, materials.blackPlastic);
  roofCenterLine.position.set(-0.23, 2.49, 0);
  cabin.add(roofCenterLine);

  const windshieldFrame = roundedBox("WindshieldFrame", 0.13, 0.96, 2.03, 0.055, materials.roof);
  windshieldFrame.position.set(0.9, 1.97, 0);
  windshieldFrame.rotation.z = 0.235;
  cabin.add(windshieldFrame);

  const windshield = roundedBox("WindshieldGlass", 0.045, 0.77, 1.78, 0.022, materials.glass);
  windshield.position.set(0.89, 1.98, 0);
  windshield.rotation.z = 0.235;
  cabin.add(windshield);

  const rearFrame = roundedBox("RearWindowFrame", 0.13, 0.88, 2.02, 0.055, materials.roof);
  rearFrame.position.set(-1.74, 1.98, 0);
  rearFrame.rotation.z = -0.055;
  cabin.add(rearFrame);

  const rearGlass = roundedBox("RearWindowGlass", 0.045, 0.69, 1.72, 0.02, materials.glass);
  rearGlass.position.set(-1.735, 1.99, 0);
  rearGlass.rotation.z = -0.055;
  cabin.add(rearGlass);

  const sides: Array<{ suffix: "L" | "R"; z: number }> = [
    { suffix: "L", z: 1.005 },
    { suffix: "R", z: -1.005 },
  ];

  for (const side of sides) {
    const outward = Math.sign(side.z);
    const frameZ = side.z - outward * 0.008;
    const glassZ = side.z + outward * 0.018;

    const frontFrame = createSidePanel(
      `FrontWindowFrame_${side.suffix}`,
      [[0.72, 1.56], [0.53, 2.29], [-0.19, 2.29], [-0.2, 1.56]],
      frameZ,
      0.055,
      materials.roof,
    );
    cabin.add(frontFrame);
    const frontGlass = createSidePanel(
      `FrontWindowGlass_${side.suffix}`,
      [[0.64, 1.64], [0.47, 2.21], [-0.12, 2.21], [-0.13, 1.64]],
      glassZ,
      0.022,
      materials.glass,
    );
    cabin.add(frontGlass);

    const rearFrameSide = createSidePanel(
      `RearWindowFrame_${side.suffix}`,
      [[-0.22, 1.56], [-0.2, 2.29], [-1.02, 2.29], [-1.04, 1.56]],
      frameZ,
      0.055,
      materials.roof,
    );
    cabin.add(rearFrameSide);
    const rearGlassSide = createSidePanel(
      `RearWindowGlass_${side.suffix}`,
      [[-0.15, 1.64], [-0.14, 2.21], [-0.95, 2.21], [-0.97, 1.64]],
      glassZ,
      0.022,
      materials.glass,
    );
    cabin.add(rearGlassSide);

    const quarterFrame = createSidePanel(
      `QuarterWindowFrame_${side.suffix}`,
      [[-1.07, 1.56], [-1.05, 2.29], [-1.6, 2.29], [-1.72, 1.62]],
      frameZ,
      0.055,
      materials.roof,
    );
    cabin.add(quarterFrame);
    const quarterGlass = createSidePanel(
      `QuarterWindowGlass_${side.suffix}`,
      [[-1.12, 1.64], [-1.11, 2.21], [-1.53, 2.21], [-1.63, 1.68]],
      glassZ,
      0.022,
      materials.glass,
    );
    cabin.add(quarterGlass);

    const frontDoor = createSidePanel(
      `FrontDoor_${side.suffix}`,
      [[0.72, 0.83], [0.71, 1.55], [-0.2, 1.55], [-0.23, 0.81]],
      side.z + outward * 0.022,
      0.06,
      materials.paint,
    );
    cabin.add(frontDoor);

    const rearDoor = createSidePanel(
      `RearDoor_${side.suffix}`,
      [[-0.23, 0.81], [-0.2, 1.55], [-1.06, 1.55], [-1.11, 0.8]],
      side.z + outward * 0.022,
      0.06,
      materials.paint,
    );
    cabin.add(rearDoor);

    for (const x of [0.02, -0.79]) {
      const handle = roundedBox(`DoorHandle_${side.suffix}_${x}`, 0.28, 0.065, 0.065, 0.025, materials.blackPlastic);
      handle.position.set(x, 1.34, side.z + outward * 0.073);
      cabin.add(handle);
    }

    for (const x of [0.64, -0.29]) {
      for (const y of [1.08, 1.38]) {
        const hinge = roundedBox(`DoorHinge_${side.suffix}`, 0.095, 0.08, 0.075, 0.018, materials.blackPlastic);
        hinge.position.set(x, y, side.z + outward * 0.075);
        cabin.add(hinge);
      }
    }

    const mirrorArm = roundedBox(`MirrorArm_${side.suffix}`, 0.26, 0.055, 0.055, 0.02, materials.blackPlastic);
    mirrorArm.position.set(0.74, 1.87, side.z + outward * 0.13);
    mirrorArm.rotation.y = outward * -0.3;
    cabin.add(mirrorArm);

    const mirror = roundedBox(`Mirror_${side.suffix}`, 0.28, 0.2, 0.12, 0.065, materials.blackPlastic);
    mirror.position.set(0.78, 1.88, side.z + outward * 0.29);
    cabin.add(mirror);

    const mirrorGlass = roundedBox(`MirrorGlass_${side.suffix}`, 0.22, 0.15, 0.012, 0.045, materials.chrome);
    mirrorGlass.position.set(0.78, 1.88, side.z + outward * 0.354);
    cabin.add(mirrorGlass);
  }

  const wiperMaterial = materials.blackPlastic;
  for (const z of [-0.42, 0.42]) {
    const wiper = roundedBox("WindshieldWiper", 0.52, 0.025, 0.028, 0.008, wiperMaterial);
    wiper.position.set(0.985, 1.66, z);
    wiper.rotation.z = -0.12;
    wiper.rotation.y = z > 0 ? -0.08 : 0.08;
    cabin.add(wiper);
  }

  return cabin;
}

function createWheel(materials: JeepMaterials, outward: 1 | -1) {
  const wheel = new THREE.Group();
  wheel.name = outward > 0 ? "WheelLeft" : "WheelRight";

  const tireCore = new THREE.Mesh(new THREE.TorusGeometry(0.425, 0.155, 18, 56), materials.tire);
  tireCore.name = "Tire";
  tireCore.castShadow = true;
  tireCore.receiveShadow = true;
  wheel.add(tireCore);

  const sideWall = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.28, 56), materials.tire);
  sideWall.name = "TireSideWall";
  sideWall.rotation.x = Math.PI / 2;
  sideWall.castShadow = true;
  wheel.add(sideWall);

  const treadGeometry = new RoundedBoxGeometry(0.13, 0.075, 0.31, 3, 0.018);
  for (let index = 0; index < 24; index += 1) {
    const angle = (index / 24) * Math.PI * 2;
    const tread = new THREE.Mesh(treadGeometry, materials.tire);
    tread.name = "Tread";
    tread.position.set(Math.cos(angle) * 0.56, Math.sin(angle) * 0.56, 0);
    tread.rotation.z = angle;
    tread.rotation.y = index % 2 === 0 ? 0.11 : -0.11;
    tread.castShadow = true;
    tread.receiveShadow = true;
    wheel.add(tread);
  }

  const brakeDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.275, 0.275, 0.055, 48), materials.brake);
  brakeDisc.name = "BrakeDisc";
  brakeDisc.rotation.x = Math.PI / 2;
  brakeDisc.position.z = outward * 0.115;
  wheel.add(brakeDisc);

  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.095, 0.12, 32), materials.chrome);
  hub.name = "WheelHub";
  hub.rotation.x = Math.PI / 2;
  hub.position.z = outward * 0.17;
  wheel.add(hub);

  const rimRing = new THREE.Mesh(new THREE.TorusGeometry(0.275, 0.04, 12, 48), materials.rim);
  rimRing.name = "RimRing";
  rimRing.position.z = outward * 0.175;
  wheel.add(rimRing);

  const spokeGeometry = new RoundedBoxGeometry(0.075, 0.29, 0.055, 3, 0.018);
  for (let index = 0; index < 5; index += 1) {
    const angle = (index / 5) * Math.PI * 2;
    const spoke = new THREE.Mesh(spokeGeometry, materials.rim);
    spoke.name = "RimSpoke";
    spoke.position.set(Math.cos(angle) * 0.115, Math.sin(angle) * 0.115, outward * 0.18);
    spoke.rotation.z = angle - Math.PI / 2;
    spoke.castShadow = true;
    wheel.add(spoke);
  }

  const caliper = roundedBox("BrakeCaliper", 0.12, 0.2, 0.06, 0.025, materials.amber);
  caliper.position.set(-0.21, 0.03, outward * 0.13);
  wheel.add(caliper);

  return castAndReceive(wheel);
}

function createFenderFlares(materials: JeepMaterials) {
  const flares = new THREE.Group();
  flares.name = "FenderFlares";

  const wheelCenters = [-1.67, 1.64];
  for (const centerX of wheelCenters) {
    for (const z of [-1.045, 1.045]) {
      const points: THREE.Vector3[] = [];
      for (let index = 0; index <= 22; index += 1) {
        const angle = Math.PI - (index / 22) * Math.PI;
        points.push(new THREE.Vector3(
          centerX + Math.cos(angle) * 0.73,
          0.59 + Math.sin(angle) * 0.73,
          z,
        ));
      }
      const path = new THREE.CatmullRomCurve3(points);
      const geometry = new THREE.TubeGeometry(path, 48, 0.065, 8, false);
      const flare = new THREE.Mesh(geometry, materials.blackPlastic);
      flare.name = "WheelArchFlare";
      flare.castShadow = true;
      flares.add(flare);

      const horizontalFront = roundedBox("FlareExtension", 0.34, 0.085, 0.12, 0.035, materials.blackPlastic);
      horizontalFront.position.set(centerX + 0.85, 0.6, z);
      flares.add(horizontalFront);
      const horizontalRear = horizontalFront.clone();
      horizontalRear.position.x = centerX - 0.85;
      flares.add(horizontalRear);
    }
  }

  return flares;
}

function createFront(materials: JeepMaterials, headlights: THREE.MeshStandardMaterial[]) {
  const front = new THREE.Group();
  front.name = "FrontEnd";

  const grilleFrame = roundedBox("SevenSlotGrille", 0.16, 0.72, 1.69, 0.075, materials.paintDark);
  grilleFrame.position.set(2.57, 1.13, 0);
  front.add(grilleFrame);

  const slotMaterial = materials.blackPlastic;
  for (let index = 0; index < 7; index += 1) {
    const z = -0.48 + index * 0.16;
    const slot = roundedBox(`GrilleSlot_${index + 1}`, 0.06, 0.46, 0.082, 0.035, slotMaterial);
    slot.position.set(2.665, 1.12, z);
    front.add(slot);
  }

  for (const z of [-0.69, 0.69]) {
    const bezel = new THREE.Mesh(new THREE.CylinderGeometry(0.255, 0.255, 0.12, 48), materials.blackPlastic);
    bezel.name = "HeadlightBezel";
    bezel.rotation.z = Math.PI / 2;
    bezel.position.set(2.655, 1.16, z);
    front.add(bezel);

    const emitter = materials.headlight.clone();
    headlights.push(emitter);
    const lamp = new THREE.Mesh(new THREE.CylinderGeometry(0.198, 0.198, 0.125, 48), emitter);
    lamp.name = "Headlight";
    lamp.rotation.z = Math.PI / 2;
    lamp.position.set(2.708, 1.16, z);
    front.add(lamp);

    const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.205, 0.205, 0.02, 48), materials.headlightLens);
    lens.name = "HeadlightLens";
    lens.rotation.z = Math.PI / 2;
    lens.position.set(2.782, 1.16, z);
    front.add(lens);

    const turn = roundedBox("FrontTurnSignal", 0.09, 0.15, 0.27, 0.06, materials.amber);
    turn.position.set(2.66, 1.44, z > 0 ? 0.91 : -0.91);
    front.add(turn);
  }

  const bumper = roundedBox("FrontBumper", 0.36, 0.25, 2.15, 0.08, materials.blackPlastic);
  bumper.position.set(2.8, 0.56, 0);
  front.add(bumper);

  for (const z of [-0.91, 0.91]) {
    const endCap = roundedBox("FrontBumperEnd", 0.48, 0.23, 0.38, 0.08, materials.blackPlastic);
    endCap.position.set(2.69, 0.58, z);
    endCap.rotation.y = z > 0 ? -0.12 : 0.12;
    front.add(endCap);

    const fogBezel = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.1, 36), materials.blackPlastic);
    fogBezel.rotation.z = Math.PI / 2;
    fogBezel.position.set(2.9, 0.72, z * 0.78);
    front.add(fogBezel);
    const fog = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.11, 36), materials.headlight);
    fog.rotation.z = Math.PI / 2;
    fog.position.set(2.95, 0.72, z * 0.78);
    front.add(fog);
  }

  const skid = roundedBox("FrontSkidPlate", 0.62, 0.11, 1.28, 0.035, materials.brake);
  skid.position.set(2.36, 0.31, 0);
  skid.rotation.z = -0.23;
  front.add(skid);

  for (const z of [-0.43, 0.43]) {
    const hook = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.027, 10, 28, Math.PI * 1.55), materials.amber);
    hook.name = "TowHook";
    hook.position.set(2.99, 0.48, z);
    hook.rotation.y = Math.PI / 2;
    front.add(hook);
  }

  return castAndReceive(front);
}

function createRear(materials: JeepMaterials, tailLights: THREE.MeshStandardMaterial[]) {
  const rear = new THREE.Group();
  rear.name = "RearEnd";

  const bumper = roundedBox("RearBumper", 0.34, 0.25, 2.15, 0.075, materials.blackPlastic);
  bumper.position.set(-2.76, 0.55, 0);
  rear.add(bumper);

  for (const z of [-0.77, 0.77]) {
    const housing = roundedBox("TailLightHousing", 0.16, 0.43, 0.3, 0.06, materials.blackPlastic);
    housing.position.set(-2.66, 1.22, z);
    rear.add(housing);

    const material = materials.tailLight.clone();
    tailLights.push(material);
    const lamp = roundedBox("TailLight", 0.075, 0.35, 0.23, 0.045, material);
    lamp.position.set(-2.755, 1.22, z);
    rear.add(lamp);

    const reverseLamp = roundedBox("ReverseLamp", 0.08, 0.09, 0.19, 0.025, materials.white);
    reverseLamp.position.set(-2.8, 1.19, z);
    rear.add(reverseLamp);
  }

  const plateFrame = roundedBox("RearPlateFrame", 0.08, 0.24, 0.52, 0.035, materials.blackPlastic);
  plateFrame.position.set(-2.79, 0.79, -0.45);
  rear.add(plateFrame);
  const plate = roundedBox("RearLicensePlate", 0.025, 0.18, 0.43, 0.018, materials.white);
  plate.position.set(-2.84, 0.79, -0.45);
  rear.add(plate);

  const spare = createWheel(materials, 1);
  spare.name = "SpareWheel";
  spare.rotation.y = Math.PI / 2;
  spare.scale.setScalar(0.96);
  spare.position.set(-2.77, 1.31, 0.04);
  rear.add(spare);

  const spareHub = roundedBox("SpareWheelMount", 0.18, 0.22, 0.22, 0.05, materials.blackPlastic);
  spareHub.position.set(-2.64, 1.31, 0.04);
  rear.add(spareHub);

  return castAndReceive(rear);
}

function createSeat(materials: JeepMaterials, name: string) {
  const seat = new THREE.Group();
  seat.name = name;

  const cushion = roundedBox(`${name}_Cushion`, 0.62, 0.18, 0.52, 0.1, materials.seat);
  cushion.position.y = 0.04;
  seat.add(cushion);

  const back = roundedBox(`${name}_Back`, 0.24, 0.72, 0.52, 0.1, materials.seat);
  back.position.set(-0.2, 0.43, 0);
  back.rotation.z = -0.13;
  seat.add(back);

  const headrest = roundedBox(`${name}_Headrest`, 0.18, 0.22, 0.32, 0.075, materials.seat);
  headrest.position.set(-0.28, 0.88, 0);
  seat.add(headrest);

  return seat;
}

function createInterior(materials: JeepMaterials) {
  const interior = new THREE.Group();
  interior.name = "Interior";

  const floor = roundedBox("InteriorFloor", 2.55, 0.12, 1.72, 0.05, materials.interior);
  floor.position.set(-0.38, 0.88, 0);
  interior.add(floor);

  for (const z of [-0.52, 0.52]) {
    const frontSeat = createSeat(materials, `FrontSeat_${z > 0 ? "L" : "R"}`);
    frontSeat.position.set(0.28, 1.04, z);
    interior.add(frontSeat);

    const rearSeat = createSeat(materials, `RearSeat_${z > 0 ? "L" : "R"}`);
    rearSeat.scale.setScalar(0.88);
    rearSeat.position.set(-0.85, 1.03, z);
    interior.add(rearSeat);
  }

  const dashboard = roundedBox("Dashboard", 0.33, 0.25, 1.74, 0.09, materials.interior);
  dashboard.position.set(0.63, 1.49, 0);
  interior.add(dashboard);

  const instrumentCluster = roundedBox("InstrumentCluster", 0.16, 0.2, 0.42, 0.06, materials.blackPlastic);
  instrumentCluster.position.set(0.47, 1.68, 0.47);
  interior.add(instrumentCluster);

  const display = roundedBox("CenterDisplay", 0.08, 0.24, 0.33, 0.04, materials.blackPlastic);
  display.position.set(0.48, 1.67, 0);
  interior.add(display);

  const steering = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.034, 12, 36), materials.interior);
  steering.name = "SteeringWheel";
  steering.rotation.y = Math.PI / 2;
  steering.position.set(0.47, 1.55, 0.5);
  interior.add(steering);

  const steeringHub = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.08, 24), materials.interior);
  steeringHub.rotation.z = Math.PI / 2;
  steeringHub.position.copy(steering.position);
  interior.add(steeringHub);

  const console = roundedBox("CenterConsole", 0.7, 0.24, 0.25, 0.075, materials.interior);
  console.position.set(-0.05, 1.03, 0);
  interior.add(console);

  const rollBarMain = new THREE.Mesh(
    new THREE.TorusGeometry(0.85, 0.045, 10, 40, Math.PI),
    materials.blackPlastic,
  );
  rollBarMain.name = "RollBar";
  rollBarMain.rotation.x = Math.PI / 2;
  rollBarMain.rotation.z = Math.PI / 2;
  rollBarMain.position.set(-0.62, 1.55, 0);
  interior.add(rollBarMain);

  return castAndReceive(interior);
}

function createUnderbody(materials: JeepMaterials) {
  const underbody = new THREE.Group();
  underbody.name = "Underbody";

  for (const z of [-0.58, 0.58]) {
    const rail = roundedBox("ChassisRail", 4.25, 0.14, 0.14, 0.035, materials.blackPlastic);
    rail.position.set(-0.02, 0.36, z);
    underbody.add(rail);
  }

  for (const x of [-1.67, 1.64]) {
    const axle = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 2.14, 20), materials.blackPlastic);
    axle.name = "SolidAxle";
    axle.rotation.x = Math.PI / 2;
    axle.position.set(x, 0.48, 0);
    underbody.add(axle);

    const differential = new THREE.Mesh(new THREE.SphereGeometry(0.16, 24, 16), materials.blackPlastic);
    differential.scale.set(1.2, 0.85, 1);
    differential.position.set(x, 0.48, 0);
    underbody.add(differential);
  }

  const exhaust = new THREE.Mesh(
    new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(1.25, 0.34, -0.52),
        new THREE.Vector3(0.35, 0.28, -0.55),
        new THREE.Vector3(-0.85, 0.3, -0.61),
        new THREE.Vector3(-2.35, 0.4, -0.72),
      ]),
      52,
      0.035,
      8,
      false,
    ),
    materials.chrome,
  );
  exhaust.name = "Exhaust";
  underbody.add(exhaust);

  return castAndReceive(underbody);
}

function createSideDetails(materials: JeepMaterials) {
  const details = new THREE.Group();
  details.name = "SideDetails";

  for (const z of [-1.12, 1.12]) {
    const step = roundedBox("SideStep", 2.7, 0.12, 0.16, 0.05, materials.blackPlastic);
    step.position.set(-0.18, 0.48, z);
    details.add(step);

    for (const x of [-0.85, 0, 0.72]) {
      const bracket = roundedBox("StepBracket", 0.12, 0.22, 0.08, 0.025, materials.blackPlastic);
      bracket.position.set(x, 0.49, z * 0.94);
      bracket.rotation.x = z > 0 ? -0.18 : 0.18;
      details.add(bracket);
    }

    const beltLine = roundedBox("BeltLineTrim", 3.24, 0.035, 0.04, 0.015, materials.blackPlastic);
    beltLine.position.set(-0.45, 1.54, z > 0 ? 1.045 : -1.045);
    details.add(beltLine);
  }

  return details;
}

export function createJeepWranglerProcedural(accent: string): JeepWranglerRig {
  const materials = createMaterials(accent);
  const jeep = new THREE.Group();
  jeep.name = "JeepWranglerSaharaProcedural";
  jeep.rotation.y = -0.04;

  const headlightMaterials: THREE.MeshStandardMaterial[] = [];
  const tailLightMaterials: THREE.MeshStandardMaterial[] = [];

  jeep.add(createUnderbody(materials));
  jeep.add(createMainBody(materials));
  jeep.add(createFenderFlares(materials));
  jeep.add(createSideDetails(materials));
  jeep.add(createInterior(materials));
  jeep.add(createCabin(materials));
  jeep.add(createFront(materials, headlightMaterials));
  jeep.add(createRear(materials, tailLightMaterials));

  const wheelPositions: Array<{ x: number; z: number; outward: 1 | -1; name: string }> = [
    { x: 1.64, z: 1.07, outward: 1, name: "Wheel_FL" },
    { x: 1.64, z: -1.07, outward: -1, name: "Wheel_FR" },
    { x: -1.67, z: 1.07, outward: 1, name: "Wheel_RL" },
    { x: -1.67, z: -1.07, outward: -1, name: "Wheel_RR" },
  ];

  const leftWheelTemplate = createWheel(materials, 1);
  const rightWheelTemplate = createWheel(materials, -1);

  for (const wheelData of wheelPositions) {
    const wheel = (wheelData.outward > 0 ? leftWheelTemplate : rightWheelTemplate).clone(true);
    wheel.name = wheelData.name;
    wheel.position.set(wheelData.x, 0.59, wheelData.z);
    jeep.add(wheel);
  }

  castAndReceive(jeep);

  return {
    group: jeep,
    paintMaterials: [materials.paint, materials.paintDark],
    headlightMaterials,
    tailLightMaterials,
  };
}
