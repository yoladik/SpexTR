export const CPU_OPTIONS = [
  // Intel - Pentium/Celeron
  "Intel Pentium G4560",
  "Intel Celeron G5905",
  // Intel Core i3
  "Intel Core i3-10100",
  "Intel Core i3-12100",
  "Intel Core i3-13100",
  // Intel Core i5
  "Intel Core i5-4460",
  "Intel Core i5-7400",
  "Intel Core i5-9400",
  "Intel Core i5-10400",
  "Intel Core i5-11400",
  "Intel Core i5-12400",
  "Intel Core i5-13400",
  "Intel Core i5-13600K",
  "Intel Core i5-14400",
  "Intel Core i5-14600K",
  // Intel Core i7
  "Intel Core i7-4770",
  "Intel Core i7-7700",
  "Intel Core i7-9700",
  "Intel Core i7-10700",
  "Intel Core i7-11700",
  "Intel Core i7-12700",
  "Intel Core i7-13700",
  "Intel Core i7-13700K",
  "Intel Core i7-14700K",
  // Intel Core i9
  "Intel Core i9-9900K",
  "Intel Core i9-10900K",
  "Intel Core i9-12900K",
  "Intel Core i9-13900K",
  "Intel Core i9-14900K",
  // AMD - Athlon / FX
  "AMD Athlon 200GE",
  "AMD FX-8350",
  // AMD Ryzen 3
  "AMD Ryzen 3 3200G",
  "AMD Ryzen 3 4100",
  // AMD Ryzen 5
  "AMD Ryzen 5 1600",
  "AMD Ryzen 5 2600",
  "AMD Ryzen 5 3600",
  "AMD Ryzen 5 5600",
  "AMD Ryzen 5 5600X",
  "AMD Ryzen 5 7600",
  "AMD Ryzen 5 7600X",
  // AMD Ryzen 7
  "AMD Ryzen 7 2700X",
  "AMD Ryzen 7 3700X",
  "AMD Ryzen 7 5700X",
  "AMD Ryzen 7 5800X",
  "AMD Ryzen 7 5800X3D",
  "AMD Ryzen 7 7700X",
  "AMD Ryzen 7 7800X3D",
  // AMD Ryzen 9
  "AMD Ryzen 9 3900X",
  "AMD Ryzen 9 5900X",
  "AMD Ryzen 9 5950X",
  "AMD Ryzen 9 7900X",
  "AMD Ryzen 9 7950X",
  "AMD Ryzen 9 7950X3D",
  // Apple Silicon
  "Apple M1",
  "Apple M2",
  "Apple M3",
  "Apple M4",
];

export const GPU_OPTIONS = [
  // Integrated
  "Intel UHD Graphics 630",
  "Intel Iris Xe Graphics",
  "AMD Radeon Vega 8 (integrovaná)",
  // NVIDIA GTX/GT
  "NVIDIA GT 1030",
  "NVIDIA GTX 1050",
  "NVIDIA GTX 1050 Ti",
  "NVIDIA GTX 1060 3GB",
  "NVIDIA GTX 1060 6GB",
  "NVIDIA GTX 1070",
  "NVIDIA GTX 1070 Ti",
  "NVIDIA GTX 1080",
  "NVIDIA GTX 1080 Ti",
  "NVIDIA GTX 1650",
  "NVIDIA GTX 1650 Super",
  "NVIDIA GTX 1660",
  "NVIDIA GTX 1660 Super",
  "NVIDIA GTX 1660 Ti",
  // NVIDIA RTX 20/30/40/50
  "NVIDIA RTX 2060",
  "NVIDIA RTX 2060 Super",
  "NVIDIA RTX 2070",
  "NVIDIA RTX 2070 Super",
  "NVIDIA RTX 2080",
  "NVIDIA RTX 2080 Ti",
  "NVIDIA RTX 3050",
  "NVIDIA RTX 3060",
  "NVIDIA RTX 3060 Ti",
  "NVIDIA RTX 3070",
  "NVIDIA RTX 3070 Ti",
  "NVIDIA RTX 3080",
  "NVIDIA RTX 3080 Ti",
  "NVIDIA RTX 3090",
  "NVIDIA RTX 3090 Ti",
  "NVIDIA RTX 4060",
  "NVIDIA RTX 4060 Ti",
  "NVIDIA RTX 4070",
  "NVIDIA RTX 4070 Super",
  "NVIDIA RTX 4070 Ti",
  "NVIDIA RTX 4070 Ti Super",
  "NVIDIA RTX 4080",
  "NVIDIA RTX 4080 Super",
  "NVIDIA RTX 4090",
  "NVIDIA RTX 5060",
  "NVIDIA RTX 5070",
  "NVIDIA RTX 5070 Ti",
  "NVIDIA RTX 5080",
  "NVIDIA RTX 5090",
  // AMD Radeon RX
  "AMD RX 570",
  "AMD RX 580",
  "AMD RX 590",
  "AMD RX 5500 XT",
  "AMD RX 5600 XT",
  "AMD RX 5700",
  "AMD RX 5700 XT",
  "AMD RX 6600",
  "AMD RX 6600 XT",
  "AMD RX 6650 XT",
  "AMD RX 6700 XT",
  "AMD RX 6750 XT",
  "AMD RX 6800",
  "AMD RX 6800 XT",
  "AMD RX 6900 XT",
  "AMD RX 6950 XT",
  "AMD RX 7600",
  "AMD RX 7700 XT",
  "AMD RX 7800 XT",
  "AMD RX 7900 GRE",
  "AMD RX 7900 XT",
  "AMD RX 7900 XTX",
  // Intel Arc
  "Intel Arc A380",
  "Intel Arc A750",
  "Intel Arc A770",
  "Intel Arc B580",
  // Apple Silicon
  "Apple M1 GPU",
  "Apple M2 GPU",
  "Apple M3 GPU",
  "Apple M4 GPU",
];

export const RAM_OPTIONS_GB = [4, 6, 8, 12, 16, 24, 32, 48, 64, 128];

export const OS_OPTIONS = ["Windows 10", "Windows 11", "macOS", "Linux (SteamOS/Proton)"];

export interface PcPreset {
  id: string;
  label: string;
  cpu: string;
  gpu: string;
  ramGB: number;
}

// Typical component pairings by tier, not real store SKUs - useful for someone who knows
// roughly "what kind of PC" they have but not the exact model names. Everything here reuses the
// exact strings from CPU_OPTIONS/GPU_OPTIONS/RAM_OPTIONS_GB so scoring picks them up the same as
// a manual pick would.
export const PC_PRESETS: PcPreset[] = [
  {
    id: "office",
    label: "Kancelářské / lehké PC (integrovaná grafika)",
    cpu: "Intel Core i3-12100",
    gpu: "Intel UHD Graphics 630",
    ramGB: 8,
  },
  {
    id: "entry-gaming",
    label: "Vstupní herní PC",
    cpu: "AMD Ryzen 5 5600",
    gpu: "NVIDIA GTX 1660 Super",
    ramGB: 16,
  },
  {
    id: "mid-gaming",
    label: "Střední herní PC",
    cpu: "AMD Ryzen 5 7600",
    gpu: "NVIDIA RTX 4060",
    ramGB: 16,
  },
  {
    id: "high-gaming",
    label: "Vyšší herní PC",
    cpu: "AMD Ryzen 7 7700X",
    gpu: "NVIDIA RTX 4070",
    ramGB: 32,
  },
  {
    id: "enthusiast",
    label: "High-end herní PC",
    cpu: "AMD Ryzen 9 7900X",
    gpu: "NVIDIA RTX 4080 Super",
    ramGB: 32,
  },
  {
    id: "extreme",
    label: "Extrémní / enthusiast PC",
    cpu: "AMD Ryzen 9 7950X3D",
    gpu: "NVIDIA RTX 4090",
    ramGB: 32,
  },
  {
    id: "macbook",
    label: "MacBook (Apple Silicon)",
    cpu: "Apple M2",
    gpu: "Apple M2 GPU",
    ramGB: 16,
  },
];
