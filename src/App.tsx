/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { jsPDF } from "jspdf";
import {
  Trophy,
  Sparkles,
  Droplets,
  Camera,
  CheckSquare,
  AlertTriangle,
  Send,
  Package,
  MapPin,
  ChevronRight,
  Shield,
  Volume2,
  VolumeX,
  RefreshCw,
  Plus,
  Minus,
  CheckCircle2,
  Share2,
  Copy,
  Clock,
  User,
  Sliders,
  Filter,
  Check,
  Flame,
  Info,
  X,
  ExternalLink,
  History,
  Calendar,
  FileText,
  Eye,
  ArrowRight,
  Save,
  CheckCheck,
  Download
} from "lucide-react";

// ==========================================
// 8-BIT AUDIO SYNTHESIZER (Native Web Audio API)
// ==========================================
const play8BitAudio = (type = "coin") => {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (type === "coin") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(987.77, ctx.currentTime); // B5
      osc.frequency.setValueAtTime(1318.51, ctx.currentTime + 0.08); // E6
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } else if (type === "complete") {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "square";
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.09 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.09);
        osc.stop(ctx.currentTime + idx * 0.09 + 0.25);
      });
    } else if (type === "damage") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(70, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.28, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } else if (type === "click") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(540, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    }
  } catch {
    // Audio context may require initial user gesture
  }
};

// ==========================================
// TYPES & DATA STRUCTURES
// ==========================================
export interface Task {
  id: string;
  label: string;
  done: boolean;
  xp: number;
}

export interface ChemicalDose {
  name: string;
  amount: string;
}

export interface MaintenanceRecord {
  id: string;
  date: string;
  technician: string;
  tasksCompleted: string[];
  chemicalsUsed: ChemicalDose[];
  ph: number;
  cloro: number;
  clarity: number;
  bossDefeated: boolean;
  beforePhotoUrl?: string;
  afterPhotoUrl?: string;
  notes?: string;
  serviceType: "Mantenimiento Rutina" | "Tratamiento Choque" | "Servicio VIP";
}

export interface PoolLevel {
  id: number;
  name: string;
  zone: string;
  difficulty: string;
  urgency: "green" | "yellow" | "red";
  status: string;
  bossDefeated: boolean;
  bossHp: number;
  ph: number;
  cloro: number;
  clarity: number; // 0 to 100%
  volumeM3: number;
  tasks: Task[];
  beforePhotoUrl?: string;
  afterPhotoUrl?: string;
  photoUrl?: string; // current active photo
  lastUpdated?: string;
  history: MaintenanceRecord[];
}

export interface InventoryItem {
  id: string;
  name: string;
  qty: number;
  unit: string;
  icon: string;
  minReq: number;
}

// ==========================================
// INITIAL SEED DATA WITH COMPLETE HISTORIES
// ==========================================
const DEFAULT_POOLS: PoolLevel[] = [
  {
    id: 1,
    name: "VILLA DEL MAR #4",
    zone: "Pedregal, Cabo San Lucas",
    difficulty: "★☆☆ NORMAL",
    urgency: "green",
    status: "¡100% CRISTALINA!",
    bossDefeated: true,
    bossHp: 0,
    ph: 7.4,
    cloro: 2.5,
    clarity: 100,
    volumeM3: 60,
    beforePhotoUrl: "https://images.unsplash.com/photo-1572331165267-854da2b10ccc?w=600&auto=format&fit=crop&q=80",
    afterPhotoUrl: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=600&auto=format&fit=crop&q=80",
    photoUrl: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=600&auto=format&fit=crop&q=80",
    lastUpdated: "Hoy 09:15 AM",
    tasks: [
      { id: "t1", label: "Espumar hojas y superficie", done: true, xp: 20 },
      { id: "t2", label: "Cepillar paredes y fondo", done: true, xp: 25 },
      { id: "t3", label: "Dosificar Cloro de mantenimiento", done: true, xp: 30 },
      { id: "t4", label: "Nivelar pH óptimo (7.4)", done: true, xp: 25 },
      { id: "t5", label: "Limpiar trampa de cabello y filtro", done: true, xp: 20 },
      { id: "t6", label: "Foto de Misión Cumplida", done: true, xp: 50 },
    ],
    history: [
      {
        id: "rec_1_01",
        date: "02 Nov 2026 • 09:15 AM",
        technician: "Carlos V. (Lv. 5)",
        serviceType: "Mantenimiento Rutina",
        tasksCompleted: [
          "Espumado de superficie",
          "Cepillado de paredes",
          "Dosificación de Cloro",
          "Nivelación de pH",
          "Lavado de filtro",
        ],
        chemicalsUsed: [
          { name: "Tricloro en Polvo", amount: "200g" },
          { name: "Clarificador Esmeralda", amount: "150ml" },
        ],
        ph: 7.4,
        cloro: 2.5,
        clarity: 100,
        bossDefeated: true,
        beforePhotoUrl: "https://images.unsplash.com/photo-1572331165267-854da2b10ccc?w=600&auto=format&fit=crop&q=80",
        afterPhotoUrl: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=600&auto=format&fit=crop&q=80",
        notes: "Agua cristalina, parámetros perfectos para fin de semana de huéspedes.",
      },
      {
        id: "rec_1_02",
        date: "28 Oct 2026 • 11:30 AM",
        technician: "Mario R. (Lv. 3)",
        serviceType: "Tratamiento Choque",
        tasksCompleted: [
          "Aspirado profundo de arena del desierto",
          "Retrolavado de filtro de arena",
          "Supercloración preventiva",
        ],
        chemicalsUsed: [
          { name: "Tricloro en Polvo", amount: "350g" },
          { name: "Ácido Muriático", amount: "200ml" },
        ],
        ph: 7.5,
        cloro: 2.2,
        clarity: 95,
        bossDefeated: true,
        beforePhotoUrl: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&fit=crop&q=80",
        afterPhotoUrl: "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=600&auto=format&fit=crop&q=80",
        notes: "Se limpió exceso de polvo tras vientos de Santa Ana.",
      },
    ],
  },
  {
    id: 2,
    name: "RESIDENCIAL DIAMANTE",
    zone: "San José del Cabo",
    difficulty: "★★☆ MEDIO",
    urgency: "yellow",
    status: "REQUIERE CLORO Y CEPILLADO",
    bossDefeated: false,
    bossHp: 50,
    ph: 7.8,
    cloro: 0.8,
    clarity: 70,
    volumeM3: 75,
    beforePhotoUrl: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&fit=crop&q=80",
    afterPhotoUrl: "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=600&auto=format&fit=crop&q=80",
    photoUrl: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&fit=crop&q=80",
    lastUpdated: "Hoy 11:30 AM",
    tasks: [
      { id: "t1", label: "Espumar arena y follaje del desierto", done: true, xp: 20 },
      { id: "t2", label: "Cepillar líneas de algas incipientes", done: false, xp: 30 },
      { id: "t3", label: "Nivelar Cloro (+250g Cloro Shock)", done: false, xp: 35 },
      { id: "t4", label: "Ajustar pH con 200ml Ácido", done: false, xp: 25 },
      { id: "t5", label: "Revisar presión del manómetro", done: true, xp: 20 },
      { id: "t6", label: "Captura de Foto de Servicio", done: false, xp: 50 },
    ],
    history: [
      {
        id: "rec_2_01",
        date: "31 Oct 2026 • 10:00 AM",
        technician: "Tú (Operador Cabo Lv. 4)",
        serviceType: "Mantenimiento Rutina",
        tasksCompleted: [
          "Espumado general",
          "Cepillado de fondo",
          "Reemplazo de pastilla de tricloro en desnatador",
        ],
        chemicalsUsed: [
          { name: "Pastillas 3 Pulgadas", amount: "1 pieza" },
          { name: "Ácido Muriático", amount: "150ml" },
        ],
        ph: 7.6,
        cloro: 1.8,
        clarity: 85,
        bossDefeated: true,
        beforePhotoUrl: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&fit=crop&q=80",
        afterPhotoUrl: "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=600&auto=format&fit=crop&q=80",
        notes: "Bomba trabajando a 15 PSI, se programó timer a 8 horas diarias.",
      },
    ],
  },
  {
    id: 3,
    name: "MANSIÓN CORREDOR 09",
    zone: "Corredor Turístico Cabo",
    difficulty: "★★★ BOSS FIGHT",
    urgency: "red",
    status: "ALERTA: JEFE ALGA VERDE ACTIVO",
    bossDefeated: false,
    bossHp: 100,
    ph: 8.2,
    cloro: 0.2,
    clarity: 35,
    volumeM3: 95,
    beforePhotoUrl: "https://images.unsplash.com/photo-1572331165267-854da2b10ccc?w=600&auto=format&fit=crop&q=80",
    photoUrl: "https://images.unsplash.com/photo-1572331165267-854da2b10ccc?w=600&auto=format&fit=crop&q=80",
    lastUpdated: "Pendiente",
    tasks: [
      { id: "t1", label: "Supercloración de Choque (500g)", done: false, xp: 45 },
      { id: "t2", label: "Cepillado Agresivo de paredes y fondo", done: false, xp: 40 },
      { id: "t3", label: "Aplicar Alguicida Black Algae Cabo", done: false, xp: 40 },
      { id: "t4", label: "Dosificar Clarificador y Aspirar fondo", done: false, xp: 45 },
      { id: "t5", label: "Retrolavado (Backwash) de filtro de arena", done: false, xp: 30 },
      { id: "t6", label: "Foto de Misión Terminada", done: false, xp: 50 },
    ],
    history: [
      {
        id: "rec_3_01",
        date: "25 Oct 2026 • 04:00 PM",
        technician: "Juan P. (Lv. 3)",
        serviceType: "Tratamiento Choque",
        tasksCompleted: [
          "Supercloración de choque",
          "Cepillado de algas en esquinas profundas",
        ],
        chemicalsUsed: [
          { name: "Tricloro en Polvo", amount: "500g" },
          { name: "Alguicida Concentrado", amount: "250ml" },
        ],
        ph: 8.0,
        cloro: 0.5,
        clarity: 45,
        bossDefeated: false,
        beforePhotoUrl: "https://images.unsplash.com/photo-1572331165267-854da2b10ccc?w=600&auto=format&fit=crop&q=80",
        notes: "Alga resistente en junta de azulejos. Se requiere tratamiento continuo.",
      },
    ],
  },
  {
    id: 4,
    name: "PALMILLA BAY OASIS",
    zone: "Punta Palmilla",
    difficulty: "★☆☆ NORMAL",
    urgency: "green",
    status: "¡100% CRISTALINA!",
    bossDefeated: true,
    bossHp: 0,
    ph: 7.3,
    cloro: 2.8,
    clarity: 100,
    volumeM3: 50,
    beforePhotoUrl: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&fit=crop&q=80",
    afterPhotoUrl: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=600&auto=format&fit=crop&q=80",
    photoUrl: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=600&auto=format&fit=crop&q=80",
    lastUpdated: "Ayer 04:20 PM",
    tasks: [
      { id: "t1", label: "Espumar superficie", done: true, xp: 20 },
      { id: "t2", label: "Cepillado suave", done: true, xp: 20 },
      { id: "t3", label: "Cloro y salinidad balanceados", done: true, xp: 30 },
      { id: "t4", label: "Verificar pH 7.3", done: true, xp: 25 },
      { id: "t5", label: "Foto de entrega", done: true, xp: 50 },
    ],
    history: [
      {
        id: "rec_4_01",
        date: "03 Nov 2026 • 03:45 PM",
        technician: "Roberto M. (Lv. 3)",
        serviceType: "Servicio VIP",
        tasksCompleted: [
          "Calibración de clorador salino",
          "Aspirado robótico",
          "Inspección de iluminación subacuática",
        ],
        chemicalsUsed: [
          { name: "Sal Marina Especial", amount: "1 bulto (25kg)" },
        ],
        ph: 7.3,
        cloro: 2.8,
        clarity: 100,
        bossDefeated: true,
        beforePhotoUrl: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&fit=crop&q=80",
        afterPhotoUrl: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=600&auto=format&fit=crop&q=80",
        notes: "Cliente dejó propina de 500 MXN. Alberca lista para eventos.",
      },
    ],
  },
];

const DEFAULT_INVENTORY: InventoryItem[] = [
  { id: "chem1", name: "Tricloro en Polvo 90%", qty: 16, unit: "kg", icon: "🧪", minReq: 10 },
  { id: "chem2", name: "Ácido Muriático 30%", qty: 9, unit: "L", icon: "⚗️", minReq: 5 },
  { id: "chem3", name: "Clarificador Esmeralda", qty: 4, unit: "L", icon: "💧", minReq: 3 },
  { id: "chem4", name: "Alguicida Concentrado", qty: 3, unit: "botellas", icon: "🌿", minReq: 2 },
  { id: "chem5", name: "Pastillas 3 Pulgadas", qty: 28, unit: "piezas", icon: "⚪", minReq: 15 },
  { id: "chem6", name: "Sal Marina Especial", qty: 5, unit: "bultos", icon: "🧂", minReq: 2 },
];

export default function App() {
  // Estado principal con LocalStorage
  const [pools, setPools] = useState<PoolLevel[]>(() => {
    const saved = localStorage.getItem("poolquest64_pools");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_POOLS;
      }
    }
    return DEFAULT_POOLS;
  });

  const [selectedPoolId, setSelectedPoolId] = useState<number>(2);
  const [activeTab, setActiveTab] = useState<"mision" | "quimica" | "historial" | "mapa" | "bodega" | "ranking">("mision");

  const [playerXP, setPlayerXP] = useState<number>(() => {
    return Number(localStorage.getItem("poolquest64_xp") || "1420");
  });
  const [playerCoins, setPlayerCoins] = useState<number>(() => {
    return Number(localStorage.getItem("poolquest64_coins") || "52");
  });
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showScanlines, setShowScanlines] = useState<boolean>(true);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [floatingBonus, setFloatingBonus] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [filterUrgency, setFilterUrgency] = useState<"ALL" | "RED" | "YELLOW" | "GREEN">("ALL");
  const [showNewPoolModal, setShowNewPoolModal] = useState<boolean>(false);
  const [newPoolName, setNewPoolName] = useState("");
  const [newPoolZone, setNewPoolZone] = useState("");

  // Visualizador modal de fotos en alta resolución
  const [photoViewerUrl, setPhotoViewerUrl] = useState<string | null>(null);
  const [photoViewerTitle, setPhotoViewerTitle] = useState<string>("");

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem("poolquest64_inventory");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_INVENTORY;
      }
    }
    return DEFAULT_INVENTORY;
  });

  // Target photo slot being uploaded: "before" | "after"
  const [photoUploadTarget, setPhotoUploadTarget] = useState<"before" | "after">("after");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Guardar cambios automáticamente
  useEffect(() => {
    localStorage.setItem("poolquest64_pools", JSON.stringify(pools));
  }, [pools]);

  useEffect(() => {
    localStorage.setItem("poolquest64_inventory", JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem("poolquest64_xp", playerXP.toString());
    localStorage.setItem("poolquest64_coins", playerCoins.toString());
  }, [playerXP, playerCoins]);

  // Nivel del técnico basado en XP (cada 500 XP = 1 nivel)
  const playerLevel = Math.floor(playerXP / 500) + 1;
  const currentLevelXP = playerXP % 500;
  const xpPercent = Math.min(100, Math.round((currentLevelXP / 500) * 100));

  const currentPool = pools.find((p) => p.id === selectedPoolId) || pools[0];

  const triggerSound = (type: "coin" | "complete" | "damage" | "click") => {
    if (soundEnabled) {
      play8BitAudio(type);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // 1-Botón: Toggle de Tarea con cálculo instantáneo de vida de jefe y XP
  const handleToggleTask = (taskId: string) => {
    const task = currentPool.tasks.find((t) => t.id === taskId);
    if (!task) return;

    const newDoneState = !task.done;
    const xpChange = newDoneState ? task.xp : -task.xp;
    const coinGain = newDoneState ? 10 : 0;

    if (newDoneState) {
      triggerSound("coin");
      setPlayerXP((prev) => prev + xpChange);
      setPlayerCoins((prev) => prev + coinGain);

      // Si el jefe aún tiene vida, suena daño retro
      if (currentPool.bossHp > 0) {
        setTimeout(() => triggerSound("damage"), 120);
      }

      setFloatingBonus(`+${task.xp} XP / +10 🪙`);
      setTimeout(() => setFloatingBonus(null), 1600);
    } else {
      triggerSound("click");
      setPlayerXP((prev) => Math.max(0, prev + xpChange));
    }

    setPools((prevPools) =>
      prevPools.map((p) => {
        if (p.id !== currentPool.id) return p;

        const updatedTasks = p.tasks.map((t) =>
          t.id === taskId ? { ...t, done: newDoneState } : t
        );
        const completedCount = updatedTasks.filter((t) => t.done).length;
        const totalCount = updatedTasks.length;
        const allCompleted = completedCount === totalCount;

        // Vida del Jefe restante
        const remainingHp = Math.max(
          0,
          Math.round(100 - (completedCount / totalCount) * 100)
        );

        if (allCompleted && p.bossHp > 0) {
          triggerSound("complete");
        }

        return {
          ...p,
          tasks: updatedTasks,
          bossHp: remainingHp,
          bossDefeated: remainingHp === 0,
          clarity: Math.min(100, 30 + Math.round((completedCount / totalCount) * 70)),
          urgency: allCompleted ? "green" : remainingHp > 45 ? "red" : "yellow",
          status: allCompleted
            ? "¡NIVEL LIMPIO! AGUA CRISTALINA"
            : remainingHp > 45
            ? "ALERTA: JEFE ALGA ACTIVO"
            : "TRABAJANDO EN MISIÓN",
          lastUpdated: "Hace un momento",
        };
      })
    );
  };

  // Quick Adjustment de Químicos (pH & Cloro)
  const adjustChemical = (type: "ph" | "cloro", delta: number) => {
    triggerSound("click");
    setPools((prevPools) =>
      prevPools.map((p) => {
        if (p.id !== currentPool.id) return p;
        const currentVal = p[type];
        let newVal = parseFloat((currentVal + delta).toFixed(1));
        if (type === "ph") {
          newVal = Math.min(8.6, Math.max(6.6, newVal));
        } else {
          newVal = Math.min(6.0, Math.max(0.0, newVal));
        }
        return { ...p, [type]: newVal };
      })
    );
  };

  const setChemicalDirect = (type: "ph" | "cloro", value: number) => {
    setPools((prevPools) =>
      prevPools.map((p) => (p.id === currentPool.id ? { ...p, [type]: value } : p))
    );
  };

  // Laboratorio Químico: Diagnóstico y Prescripción inmediata
  const getChemicalDiagnosis = (ph: number, cloro: number, volumeM3: number) => {
    const actions: { text: string; action: string; chemical: string; dose: string }[] = [];

    // Cloro (Ideal 2.0 - 3.0 ppm)
    if (cloro < 1.0) {
      const doseGrams = Math.round(volumeM3 * 4); // ~4g por m3
      actions.push({
        text: "¡CLORO CRÍTICO! RIESGO DE ALGAS",
        action: `Agregar ${doseGrams}g de Tricloro Shock granular disuelto en cubeta`,
        chemical: "Tricloro en Polvo",
        dose: `${doseGrams}g`,
      });
    } else if (cloro < 2.0) {
      const doseGrams = Math.round(volumeM3 * 2.5);
      actions.push({
        text: "CLORO BAJO: MANTENIMIENTO",
        action: `Agregar ${doseGrams}g de Cloro o 1 pastilla al clorador flotante`,
        chemical: "Pastilla / Polvo",
        dose: `${doseGrams}g`,
      });
    } else if (cloro > 3.5) {
      actions.push({
        text: "CLORO ELEVADO: VENTILAR",
        action: "No agregar cloro. Abrir cascada o esperar fotólisis solar.",
        chemical: "Ninguno",
        dose: "0g",
      });
    }

    // pH (Ideal 7.2 - 7.6)
    if (ph < 7.2) {
      const doseGrams = Math.round(volumeM3 * 5);
      actions.push({
        text: "pH ÁCIDO: CORROE EQUIPOS",
        action: `Agregar ${doseGrams}g de Carbonato de Sodio (pH Up)`,
        chemical: "Carbonato de Sodio",
        dose: `${doseGrams}g`,
      });
    } else if (ph > 7.6) {
      const doseMl = Math.round(volumeM3 * 4.5);
      actions.push({
        text: "pH ALCALINO: AGUA TURBIA",
        action: `Agregar ${doseMl}ml de Ácido Muriático por las orillas`,
        chemical: "Ácido Muriático",
        dose: `${doseMl}ml`,
      });
    }

    const isPerfect = actions.length === 0;

    return {
      isPerfect,
      badge: isPerfect ? "¡PERFECTO!" : "ACCIONES REQUERIDAS",
      actions,
      summary: isPerfect
        ? "¡PARAMETROS DE CAMPEÓN! Agua 100% segura para huéspedes y residentes de Cabo."
        : actions.map((a) => a.action).join(" • "),
    };
  };

  const diagnosis = getChemicalDiagnosis(currentPool.ph, currentPool.cloro, currentPool.volumeM3);

  // Manejo de toma de foto o subida (para antes o después)
  const triggerCameraInput = (target: "before" | "after") => {
    setPhotoUploadTarget(target);
    triggerSound("click");
    fileInputRef.current?.click();
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const url = reader.result as string;
        setPools((prevPools) =>
          prevPools.map((p) => {
            if (p.id !== currentPool.id) return p;
            if (photoUploadTarget === "before") {
              return { ...p, beforePhotoUrl: url };
            } else {
              return { ...p, afterPhotoUrl: url, photoUrl: url };
            }
          })
        );
        triggerSound("complete");
        showToast(
          photoUploadTarget === "before"
            ? "📸 ¡Foto ANTES guardada en cartucho!"
            : "📸 ¡Foto DESPUÉS guardada en cartucho!"
        );
      };
      reader.readAsDataURL(file);
    }
  };

  // Fotos de demostración rápidas
  const handleSetDemoPhotos = () => {
    const sampleBefore = "https://images.unsplash.com/photo-1572331165267-854da2b10ccc?w=600&auto=format&fit=crop&q=80";
    const sampleAfter = "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=600&auto=format&fit=crop&q=80";

    setPools((prevPools) =>
      prevPools.map((p) =>
        p.id === currentPool.id
          ? { ...p, beforePhotoUrl: sampleBefore, afterPhotoUrl: sampleAfter, photoUrl: sampleAfter }
          : p
      )
    );
    triggerSound("coin");
    showToast("📸 ¡Fotos Antes/Después asignadas!");
  };

  // Generar PDF estilo retro
  const generatePDFReport = (record: MaintenanceRecord) => {
    const doc = new jsPDF();
    
    // Retro Style Config
    doc.setFont("courier");
    doc.setFontSize(18);
    doc.text("ALBERCAS CABO - REPORTE OFICIAL", 10, 20);
    doc.setFontSize(12);
    doc.text(`ALBERCA: ${currentPool.name}`, 10, 30);
    doc.text(`FECHA: ${record.date}`, 10, 40);
    doc.text(`TÉCNICO: ${record.technician}`, 10, 50);
    doc.text(`TIPO: ${record.serviceType}`, 10, 60);

    doc.line(10, 65, 200, 65);

    doc.text("TAREAS REALIZADAS:", 10, 75);
    record.tasksCompleted.forEach((task, i) => {
      doc.text(`- ${task}`, 15, 85 + i * 10);
    });

    doc.text("QUÍMICOS UTILIZADOS:", 10, 150);
    record.chemicalsUsed.forEach((chem, i) => {
      doc.text(`- ${chem.name}: ${chem.amount}`, 15, 160 + i * 10);
    });

    doc.text(`pH: ${record.ph.toFixed(1)} | CLORO: ${record.cloro.toFixed(1)} ppm`, 10, 200);
    
    doc.save(`reporte_${currentPool.name.replace(/\s+/g, '_')}_${record.date.replace(/\s+/g, '_')}.pdf`);
  };

  // Registrar el servicio actual en el Historial de la alberca
  const handleSaveToHistory = () => {
    const now = new Date();
    const formattedDate = now.toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const completedTasksList = currentPool.tasks.filter((t) => t.done).map((t) => t.label);

    // Calcular químicos dosificados según el estado
    const dosedChemicals: ChemicalDose[] = [];
    if (diagnosis.actions.length > 0) {
      diagnosis.actions.forEach((act) => {
        dosedChemicals.push({ name: act.chemical, amount: act.dose });
      });
    } else {
      dosedChemicals.push({ name: "Tricloro de Mantenimiento", amount: "150g" });
    }

    const newRecord: MaintenanceRecord = {
      id: `rec_${currentPool.id}_${Date.now()}`,
      date: formattedDate,
      technician: `Tú (Operador Cabo Lv.${playerLevel})`,
      serviceType: currentPool.bossDefeated ? "Mantenimiento Rutina" : "Tratamiento Choque",
      tasksCompleted:
        completedTasksList.length > 0
          ? completedTasksList
          : ["Inspección y medición de parámetros"],
      chemicalsUsed: dosedChemicals,
      ph: currentPool.ph,
      cloro: currentPool.cloro,
      clarity: currentPool.clarity,
      bossDefeated: currentPool.bossDefeated,
      beforePhotoUrl: currentPool.beforePhotoUrl,
      afterPhotoUrl: currentPool.afterPhotoUrl || currentPool.photoUrl,
      notes: currentPool.bossDefeated
        ? "Servicio 100% completado. Agua cristalina nivel hotel de lujo."
        : "Servicio en proceso. Requiere seguimiento de químico.",
    };

    setPools((prevPools) =>
      prevPools.map((p) => {
        if (p.id !== currentPool.id) return p;
        return {
          ...p,
          history: [newRecord, ...(p.history || [])],
          lastUpdated: "Hoy " + now.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }),
        };
      })
    );

    setPlayerXP((prev) => prev + 60);
    setPlayerCoins((prev) => prev + 15);
    setFloatingBonus("+60 XP / +15 🪙 ¡BITÁCORA!");
    setTimeout(() => setFloatingBonus(null), 1800);

    triggerSound("complete");
    showToast("💾 ¡Servicio registrado en el Historial 64!");
  };

  // Inventario: sumar o restar químicos
  const handleInventoryChange = (id: string, delta: number) => {
    triggerSound("coin");
    setInventory((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, qty: Math.max(0, item.qty + delta) } : item
      )
    );
  };

  // Filtrado de albercas para el mapa
  const filteredPools = pools.filter((p) => {
    if (filterUrgency === "RED") return p.urgency === "red";
    if (filterUrgency === "YELLOW") return p.urgency === "yellow";
    if (filterUrgency === "GREEN") return p.urgency === "green";
    return true;
  });

  // Copiar reporte al portapapeles
  const handleCopyReport = () => {
    const text = `🏆 ALBERCAS CABO - POOL QUEST 64 🏆
Misión: ${currentPool.name} (${currentPool.zone})
Estado: ${currentPool.bossDefeated ? "ALGA ELIMINADA - 100% CRISTALINA" : "SERVICIO EN PROCESO"}
Química: pH: ${currentPool.ph} | Cloro: ${currentPool.cloro} ppm | Claridad: ${currentPool.clarity}%
Tareas Cumplidas: ${currentPool.tasks.filter((t) => t.done).length}/${currentPool.tasks.length}
Técnico: Operador Cabo Level ${playerLevel}
¡Tu alberca está en manos de campeones!`;

    navigator.clipboard.writeText(text);
    triggerSound("coin");
    showToast("📋 ¡Reporte 64-bit copiado al portapapeles!");
  };

  // Crear nueva alberca rápida
  const handleCreatePool = () => {
    if (!newPoolName.trim()) return;
    const newId = Date.now();
    const newPool: PoolLevel = {
      id: newId,
      name: newPoolName.toUpperCase(),
      zone: newPoolZone.trim() || "Los Cabos, BCS",
      difficulty: "★★☆ NUEVO RETO",
      urgency: "yellow",
      status: "NUEVO NIVEL DESBLOQUEADO",
      bossDefeated: false,
      bossHp: 80,
      ph: 7.6,
      cloro: 1.0,
      clarity: 60,
      volumeM3: 50,
      history: [],
      tasks: [
        { id: `t1_${newId}`, label: "Espumar superficie", done: false, xp: 20 },
        { id: `t2_${newId}`, label: "Cepillar paredes y escalones", done: false, xp: 25 },
        { id: `t3_${newId}`, label: "Dosificar Cloro", done: false, xp: 30 },
        { id: `t4_${newId}`, label: "Ajustar pH", done: false, xp: 25 },
        { id: `t5_${newId}`, label: "Foto de Misión Cumplida", done: false, xp: 50 },
      ],
    };
    setPools([newPool, ...pools]);
    setSelectedPoolId(newId);
    setNewPoolName("");
    setNewPoolZone("");
    setShowNewPoolModal(false);
    triggerSound("complete");
    showToast("🎮 ¡Nuevo nivel agregado al mapa!");
  };

  return (
    <div className="min-h-screen bg-[#070b19] text-white flex flex-col items-center justify-start pb-8 selection:bg-[#FFD700] selection:text-black">
      {/* CONTENEDOR PRINCIPAL MOBILE-FIRST (Estilo Consola Portátil N64 / Arcade) */}
      <div className="w-full max-w-md bg-[#0047BB] min-h-screen border-x-4 border-black flex flex-col relative shadow-[0_0_50px_rgba(0,180,255,0.25)]">
        {/* Efecto Scanlines Retro (opcional con toggle) */}
        {showScanlines && <div className="absolute inset-0 scanlines-overlay z-40" />}

        {/* ============================================================
            1. HUD SUPERIOR 64-BIT (MARIO 64 HUD STYLE)
        ============================================================ */}
        <header className="bg-[#002766] border-b-4 border-black p-3 sticky top-0 z-50 shadow-lg">
          <div className="flex items-center justify-between">
            {/* Título & Badge N64 */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-black border-2 border-[#FFD700] rounded-sm flex items-center justify-center font-pixel text-[#FFD700] text-[10px] shadow-sm transform rotate-[-3deg]">
                64
              </div>
              <div>
                <h1 className="text-[#FFD700] font-pixel text-[11px] tracking-wide flex items-center gap-1.5 drop-shadow-[2px_2px_0_#000]">
                  ALBERCAS CABO
                </h1>
                <div className="flex items-center gap-2">
                  <span className="text-[#00FF88] font-retro-alt text-base tracking-widest leading-none drop-shadow-[1px_1px_0_#000]">
                    POOL QUEST 64
                  </span>
                  <span className="bg-[#00B4FF] text-black text-[7px] font-pixel px-1 py-0.2 border border-black rounded">
                    PRO
                  </span>
                </div>
              </div>
            </div>

            {/* Acciones Rápidas del HUD: Mute & Scanlines */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  setShowScanlines(!showScanlines);
                  triggerSound("click");
                }}
                className={`p-1.5 border-2 border-black rounded font-pixel text-[8px] pixel-btn ${
                  showScanlines ? "bg-[#00B4FF] text-black" : "bg-black text-gray-400"
                }`}
                title="CRT Scanlines"
              >
                CRT
              </button>
              <button
                onClick={() => {
                  setSoundEnabled(!soundEnabled);
                  if (!soundEnabled) triggerSound("coin");
                }}
                className="p-1.5 bg-black border-2 border-white/60 rounded text-[#FFD700] hover:text-white pixel-btn"
                title="Sonido 8-Bit ON/OFF"
              >
                {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>
            </div>
          </div>

          {/* STATS DE GAMIFICACIÓN: NIVEL, EXP BAR, MONEDAS 🪙 */}
          <div className="mt-2.5 pt-2 border-t-2 border-black/60 grid grid-cols-3 gap-1.5">
            {/* Nivel */}
            <div className="bg-[#001740] p-1.5 border-2 border-black rounded flex flex-col items-center justify-center">
              <span className="text-gray-400 font-pixel text-[7px]">TÉCNICO</span>
              <span className="text-[#00B4FF] font-pixel text-[10px] font-bold">
                LV.{playerLevel}
              </span>
            </div>

            {/* Barra de XP */}
            <div className="bg-[#001740] p-1.5 border-2 border-black rounded flex flex-col justify-center">
              <div className="flex justify-between items-center text-[7px] font-pixel mb-1">
                <span className="text-gray-400">EXP</span>
                <span className="text-[#00FF88]">{playerXP}</span>
              </div>
              <div className="w-full bg-black h-2 border border-black rounded-sm overflow-hidden p-[1px]">
                <div
                  className="bg-[#00FF88] h-full transition-all duration-300"
                  style={{ width: `${xpPercent}%` }}
                />
              </div>
            </div>

            {/* Monedas */}
            <div className="bg-[#001740] p-1.5 border-2 border-black rounded flex items-center justify-center gap-1.5">
              <span className="text-[#FFD700] text-sm animate-pulse">🪙</span>
              <div className="flex flex-col items-start leading-tight">
                <span className="text-gray-400 font-pixel text-[6px]">MONEDAS</span>
                <span className="text-[#FFD700] font-pixel text-[10px] font-bold">
                  {playerCoins}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* FEEDBACK FLOTANTE +XP / +🪙 */}
        {floatingBonus && (
          <div className="absolute top-28 left-1/2 -translate-x-1/2 z-50 bg-[#FFD700] text-black font-pixel text-xs px-4 py-2 border-4 border-black pixel-box-gold animate-bounce shadow-2xl">
            {floatingBonus}
          </div>
        )}

        {/* TOAST DE SISTEMA RETRO */}
        {toastMessage && (
          <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-black text-[#00FF88] font-pixel text-[9px] px-4 py-2.5 border-2 border-[#00FF88] pixel-box shadow-2xl max-w-xs text-center">
            {toastMessage}
          </div>
        )}

        {/* ============================================================
            2. SELECTOR DE MISIONES (WORLD CAROUSEL - SUPER MARIO 64)
        ============================================================ */}
        <section className="bg-[#003380] p-3 border-b-4 border-black">
          <div className="flex items-center justify-between mb-2">
            <span className="font-pixel text-[9px] text-[#FFD700] flex items-center gap-1">
              <MapPin size={12} className="text-[#FFD700]" /> MUNDOS DE HOY:
            </span>
            <button
              onClick={() => setShowNewPoolModal(true)}
              className="bg-[#00B4FF] text-black font-pixel text-[7px] px-2 py-1 border-2 border-black rounded pixel-btn flex items-center gap-1 font-bold"
            >
              <Plus size={10} /> AGREGAR
            </button>
          </div>

          {/* Carrusel de Albercas / Mundos */}
          <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-none">
            {pools.map((p, idx) => {
              const isSelected = p.id === currentPool.id;
              let dotBg = "bg-[#00FF88]";
              if (p.urgency === "yellow") dotBg = "bg-[#FFD700]";
              if (p.urgency === "red") dotBg = "bg-[#FF3366] animate-ping";

              return (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedPoolId(p.id);
                    triggerSound("coin");
                  }}
                  className={`flex-shrink-0 w-36 text-left p-2.5 border-4 border-black rounded transition-all pixel-btn ${
                    isSelected
                      ? "bg-[#00B4FF] text-black scale-105 pixel-box-cyan font-bold"
                      : "bg-[#001f54] text-white opacity-85 hover:opacity-100 pixel-box"
                  }`}
                >
                  <div className="flex items-center justify-between text-[7px] font-pixel mb-1">
                    <span>NIVEL 0{idx + 1}</span>
                    <div className="flex items-center gap-1">
                      <span className={`w-2.5 h-2.5 rounded-full border border-black ${dotBg}`} />
                    </div>
                  </div>
                  <p className="text-[9px] font-pixel truncate drop-shadow-[1px_1px_0_rgba(0,0,0,0.5)]">
                    {p.name}
                  </p>
                  <p className="text-[8px] font-retro-alt text-gray-200 truncate mt-0.5">
                    {p.zone}
                  </p>
                  <div className="mt-1 flex items-center justify-between text-[7px] font-pixel">
                    <span>{p.bossDefeated ? "★ CLEAR" : `${p.bossHp}% HP`}</span>
                    <span>{p.clarity}% 💧</span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* ============================================================
            3. JEFE FINAL CABO: "ALGA VERDE" (BOSS HEALTH BAR)
        ============================================================ */}
        <section className="p-3 bg-[#001740] border-b-4 border-black">
          <div className="bg-[#000d2b] p-3 border-4 border-black rounded pixel-box">
            <div className="flex items-center justify-between text-[8px] font-pixel mb-1.5">
              <span className="text-[#00FF88] flex items-center gap-1.5">
                <span className="text-base">👾</span>
                JEFE: {currentPool.bossDefeated ? "ALGA EXTERMINADA" : "ALGA VERDE CABO"}
              </span>
              <span
                className={`px-1.5 py-0.5 rounded border border-black font-bold ${
                  currentPool.bossHp > 50
                    ? "bg-[#FF3366] text-white"
                    : currentPool.bossHp > 0
                    ? "bg-[#FFD700] text-black"
                    : "bg-[#00FF88] text-black"
                }`}
              >
                HP: {currentPool.bossHp}%
              </span>
            </div>

            {/* Barra de Vida del Jefe */}
            <div className="w-full h-5 bg-black border-2 border-black p-0.5 relative overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  currentPool.bossHp > 50
                    ? "bg-[#FF3366]"
                    : currentPool.bossHp > 20
                    ? "bg-[#FFD700]"
                    : "bg-[#00FF88]"
                }`}
                style={{ width: `${currentPool.bossHp}%` }}
              />

              {/* Texto dentro de la barra */}
              <div className="absolute inset-0 flex items-center justify-center font-pixel text-[7px] font-bold text-white drop-shadow-[1px_1px_0_#000]">
                {currentPool.bossDefeated
                  ? "★ ¡VICTORIA! AGUA ESMERALDA ★"
                  : `DAÑO RESTANTE: ${currentPool.bossHp}%`}
              </div>
            </div>

            {/* Sub-barras: pH, Cloro, Cristalinidad */}
            <div className="grid grid-cols-3 gap-1.5 mt-2.5 pt-2 border-t border-white/20 text-center font-pixel text-[7px]">
              <div className="bg-[#001f54] p-1 border border-black rounded">
                <span className="text-gray-400 block">pH</span>
                <span
                  className={
                    currentPool.ph >= 7.2 && currentPool.ph <= 7.6
                      ? "text-[#00FF88] font-bold"
                      : "text-[#FF3366] font-bold"
                  }
                >
                  {currentPool.ph.toFixed(1)}
                </span>
              </div>
              <div className="bg-[#001f54] p-1 border border-black rounded">
                <span className="text-gray-400 block">CLORO</span>
                <span
                  className={
                    currentPool.cloro >= 2.0 && currentPool.cloro <= 3.0
                      ? "text-[#00FF88] font-bold"
                      : "text-[#FFD700] font-bold"
                  }
                >
                  {currentPool.cloro.toFixed(1)} ppm
                </span>
              </div>
              <div className="bg-[#001f54] p-1 border border-black rounded">
                <span className="text-gray-400 block">CRISTAL</span>
                <span className="text-[#00B4FF] font-bold">{currentPool.clarity}%</span>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================
            4. TABS PRINCIPALES (BARRA DE CONTROL)
        ============================================================ */}
        <nav className="grid grid-cols-6 bg-[#001740] border-b-4 border-black text-[7px] font-pixel">
          <button
            onClick={() => {
              setActiveTab("mision");
              triggerSound("click");
            }}
            className={`py-3 text-center border-r-2 border-black transition-colors ${
              activeTab === "mision" ? "bg-[#00B4FF] text-black font-bold" : "text-gray-300"
            }`}
          >
            📋 MISIÓN
          </button>
          <button
            onClick={() => {
              setActiveTab("quimica");
              triggerSound("click");
            }}
            className={`py-3 text-center border-r-2 border-black transition-colors ${
              activeTab === "quimica" ? "bg-[#00B4FF] text-black font-bold" : "text-gray-300"
            }`}
          >
            🧪 QUÍMICA
          </button>
          <button
            onClick={() => {
              setActiveTab("historial");
              triggerSound("click");
            }}
            className={`py-3 text-center border-r-2 border-black transition-colors relative ${
              activeTab === "historial" ? "bg-[#FFD700] text-black font-bold" : "text-[#FFD700]"
            }`}
          >
            📜 LOG
            {currentPool.history && currentPool.history.length > 0 && (
              <span className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-3.5 h-3.5 flex items-center justify-center text-[6px] border border-black font-sans font-bold">
                {currentPool.history.length}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              setActiveTab("mapa");
              triggerSound("click");
            }}
            className={`py-3 text-center border-r-2 border-black transition-colors ${
              activeTab === "mapa" ? "bg-[#00B4FF] text-black font-bold" : "text-gray-300"
            }`}
          >
            🗺️ MAPA
          </button>
          <button
            onClick={() => {
              setActiveTab("bodega");
              triggerSound("click");
            }}
            className={`py-3 text-center border-r-2 border-black transition-colors ${
              activeTab === "bodega" ? "bg-[#00B4FF] text-black font-bold" : "text-gray-300"
            }`}
          >
            📦 BODEGA
          </button>
          <button
            onClick={() => {
              setActiveTab("ranking");
              triggerSound("click");
            }}
            className={`py-3 text-center transition-colors ${
              activeTab === "ranking" ? "bg-[#00B4FF] text-black font-bold" : "text-gray-300"
            }`}
          >
            🏆 TOP
          </button>
        </nav>

        {/* ============================================================
            5. CONTENIDO DINÁMICO SEGÚN TAB
        ============================================================ */}
        <main className="p-4 flex-1">
          {/* ---------------- TAB 1: MISIÓN / CHECKLIST ---------------- */}
          {activeTab === "mision" && (
            <div className="space-y-3.5">
              {/* Header de Misión Activa con Acceso Directo a Historial */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-pixel text-[11px] text-[#FFD700] drop-shadow-[1px_1px_0_#000]">
                    CHECKLIST DE BATALLA
                  </h2>
                  <p className="font-retro-alt text-base text-gray-200">
                    {currentPool.name} • {currentPool.zone}
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setActiveTab("historial");
                      triggerSound("coin");
                    }}
                    className="bg-[#FFD700] text-black font-pixel text-[7px] px-2 py-1 rounded border-2 border-black font-bold pixel-btn flex items-center gap-1 shadow-sm"
                    title="Ver Historial de Mantenimientos"
                  >
                    <History size={10} />
                    HISTORIAL ({currentPool.history?.length || 0})
                  </button>
                </div>
              </div>

              {/* Lista de Tareas Ultra-Fácil (1 Botón = 1 Acción) */}
              <div className="space-y-2.5">
                {currentPool.tasks.map((task) => (
                  <button
                    key={task.id}
                    onClick={() => handleToggleTask(task.id)}
                    className={`w-full text-left p-3.5 border-4 border-black rounded transition-all flex items-center justify-between pixel-btn ${
                      task.done
                        ? "bg-[#00FF88] text-black pixel-box-green"
                        : "bg-[#002f80] hover:bg-[#003899] text-white pixel-box"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 border-2 border-black flex items-center justify-center font-pixel text-sm font-bold ${
                          task.done ? "bg-black text-[#00FF88]" : "bg-white text-black"
                        }`}
                      >
                        {task.done ? "✓" : ""}
                      </div>
                      <span
                        className={`text-[9px] font-pixel leading-relaxed ${
                          task.done ? "line-through opacity-85 font-bold" : ""
                        }`}
                      >
                        {task.label}
                      </span>
                    </div>

                    <div className="flex-shrink-0 ml-2">
                      <span
                        className={`text-[8px] font-pixel px-2 py-1 rounded border-2 border-black font-bold ${
                          task.done
                            ? "bg-black text-[#FFD700]"
                            : "bg-[#FFD700] text-black shadow-sm"
                        }`}
                      >
                        +{task.xp} XP
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {/* FOTOS EVIDENCIA ANTES Y DESPUÉS (Comparativa 64-Bit) */}
              <div className="mt-4 p-3.5 bg-[#001740] border-4 border-black rounded pixel-box space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-pixel text-[8px] text-[#FFD700] flex items-center gap-1.5">
                    <Camera size={13} /> EVIDENCIA ANTES / DESPUÉS
                  </span>
                  <button
                    onClick={handleSetDemoPhotos}
                    className="font-pixel text-[7px] text-[#00B4FF] hover:underline"
                  >
                    [FOTOS DEMO]
                  </button>
                </div>

                {/* Grid con Fotos de Antes y Después */}
                <div className="grid grid-cols-2 gap-2">
                  {/* Foto ANTES */}
                  <div className="border-2 border-black bg-black rounded p-1 flex flex-col justify-between">
                    <div className="font-pixel text-[6px] text-[#FF3366] mb-1 font-bold flex items-center justify-between">
                      <span>▶ ANTES:</span>
                      {currentPool.beforePhotoUrl && <span className="text-[#00FF88]">✓</span>}
                    </div>
                    {currentPool.beforePhotoUrl ? (
                      <div
                        onClick={() => {
                          setPhotoViewerUrl(currentPool.beforePhotoUrl!);
                          setPhotoViewerTitle(`ANTES: ${currentPool.name}`);
                        }}
                        className="relative h-24 rounded overflow-hidden cursor-pointer group"
                      >
                        <img
                          src={currentPool.beforePhotoUrl}
                          alt="Antes"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Eye size={16} className="text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="h-24 bg-gray-900 border border-dashed border-gray-600 rounded flex flex-col items-center justify-center text-center p-1">
                        <span className="text-gray-500 font-pixel text-[6px]">SIN FOTO INICIAL</span>
                      </div>
                    )}
                    <button
                      onClick={() => triggerCameraInput("before")}
                      className="mt-1 py-1.5 bg-[#FF3366] text-white font-pixel text-[7px] border border-black rounded pixel-btn font-bold flex items-center justify-center gap-1"
                    >
                      <Camera size={10} /> TOMAR ANTES
                    </button>
                  </div>

                  {/* Foto DESPUÉS */}
                  <div className="border-2 border-black bg-black rounded p-1 flex flex-col justify-between">
                    <div className="font-pixel text-[6px] text-[#00FF88] mb-1 font-bold flex items-center justify-between">
                      <span>▶ DESPUÉS:</span>
                      {(currentPool.afterPhotoUrl || currentPool.photoUrl) && (
                        <span className="text-[#00FF88]">✓</span>
                      )}
                    </div>
                    {currentPool.afterPhotoUrl || currentPool.photoUrl ? (
                      <div
                        onClick={() => {
                          const src = currentPool.afterPhotoUrl || currentPool.photoUrl!;
                          setPhotoViewerUrl(src);
                          setPhotoViewerTitle(`DESPUÉS: ${currentPool.name}`);
                        }}
                        className="relative h-24 rounded overflow-hidden cursor-pointer group"
                      >
                        <img
                          src={currentPool.afterPhotoUrl || currentPool.photoUrl}
                          alt="Después"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Eye size={16} className="text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="h-24 bg-gray-900 border border-dashed border-gray-600 rounded flex flex-col items-center justify-center text-center p-1">
                        <span className="text-gray-500 font-pixel text-[6px]">SIN FOTO FINAL</span>
                      </div>
                    )}
                    <button
                      onClick={() => triggerCameraInput("after")}
                      className="mt-1 py-1.5 bg-[#00FF88] text-black font-pixel text-[7px] border border-black rounded pixel-btn font-bold flex items-center justify-center gap-1"
                    >
                      <Camera size={10} /> TOMAR DESPUÉS
                    </button>
                  </div>
                </div>

                {/* Input de archivo oculto */}
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>

              {/* ACCIONES CLAVE: GUARDAR EN BITÁCORA & ENVIAR REPORTE */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={handleSaveToHistory}
                  className="w-full py-3 bg-[#00FF88] hover:bg-green-300 text-black font-pixel text-[9px] border-4 border-black rounded pixel-box-green pixel-btn flex items-center justify-center gap-2 font-bold transition-transform"
                >
                  <Save size={16} /> GUARDAR EN BITÁCORA HISTÓRICA (+60 XP)
                </button>

                <button
                  onClick={() => {
                    triggerSound("complete");
                    setShowReportModal(true);
                  }}
                  className="w-full py-3.5 bg-[#FFD700] hover:bg-yellow-300 text-black font-pixel text-xs border-4 border-black rounded pixel-box-gold pixel-btn flex items-center justify-center gap-2 font-bold shadow-2xl transition-transform"
                >
                  <Send size={16} /> ENVIAR REPORTE 64-BIT AL CLIENTE
                </button>
              </div>
            </div>
          )}

          {/* ---------------- TAB 2: LABORATORIO QUÍMICO ---------------- */}
          {activeTab === "quimica" && (
            <div className="space-y-4">
              <div className="bg-[#001740] p-3 border-4 border-black rounded pixel-box">
                <div className="flex items-center justify-between">
                  <h3 className="font-pixel text-[10px] text-[#FFD700] flex items-center gap-1.5">
                    <Droplets size={14} className="text-[#00B4FF]" /> LABORATORIO QUÍMICO
                  </h3>
                  <span className="text-[8px] font-pixel bg-black px-2 py-0.5 rounded text-[#00B4FF] border border-black">
                    {currentPool.volumeM3} m³ ESTIMADOS
                  </span>
                </div>
                <p className="text-xs font-retro-alt text-gray-300 mt-1">
                  Ingresa las lecturas de pH y Cloro. La app prescribirá la dosis exacta en 5 segundos.
                </p>
              </div>

              {/* Selector de Volumen de la Alberca */}
              <div className="bg-[#002466] p-2.5 border-4 border-black rounded flex items-center justify-between text-[8px] font-pixel">
                <span className="text-gray-300">TAMAÑO:</span>
                <div className="flex gap-1.5">
                  {[40, 60, 80, 100].map((vol) => (
                    <button
                      key={vol}
                      onClick={() => {
                        triggerSound("click");
                        setPools((prevPools) =>
                          prevPools.map((p) =>
                            p.id === currentPool.id ? { ...p, volumeM3: vol } : p
                          )
                        );
                      }}
                      className={`px-2 py-1 border-2 border-black rounded font-bold ${
                        currentPool.volumeM3 === vol
                          ? "bg-[#00FF88] text-black"
                          : "bg-black text-gray-300"
                      }`}
                    >
                      {vol}m³
                    </button>
                  ))}
                </div>
              </div>

              {/* CONTROL 1: pH */}
              <div className="bg-[#002f80] p-3.5 border-4 border-black rounded pixel-box space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="font-pixel text-[9px] text-white">⚗️ pH DEL AGUA:</span>
                  <div
                    className={`font-pixel text-base px-3 py-1 rounded border-2 border-black font-bold ${
                      currentPool.ph >= 7.2 && currentPool.ph <= 7.6
                        ? "bg-[#00FF88] text-black"
                        : "bg-[#FF3366] text-white"
                    }`}
                  >
                    {currentPool.ph.toFixed(1)}
                  </div>
                </div>

                {/* Botones Grandes */}
                <div className="grid grid-cols-4 gap-2 pt-1">
                  <button
                    onClick={() => adjustChemical("ph", -0.2)}
                    className="py-2.5 bg-red-600 text-white font-pixel text-xs border-2 border-black rounded pixel-btn font-bold flex items-center justify-center gap-1"
                  >
                    <Minus size={14} /> 0.2
                  </button>
                  <button
                    onClick={() => adjustChemical("ph", -0.1)}
                    className="py-2.5 bg-red-500 text-white font-pixel text-xs border-2 border-black rounded pixel-btn font-bold flex items-center justify-center"
                  >
                    -0.1
                  </button>
                  <button
                    onClick={() => adjustChemical("ph", 0.1)}
                    className="py-2.5 bg-[#00FF88] text-black font-pixel text-xs border-2 border-black rounded pixel-btn font-bold flex items-center justify-center"
                  >
                    +0.1
                  </button>
                  <button
                    onClick={() => adjustChemical("ph", 0.2)}
                    className="py-2.5 bg-green-500 text-black font-pixel text-xs border-2 border-black rounded pixel-btn font-bold flex items-center justify-center gap-1"
                  >
                    <Plus size={14} /> 0.2
                  </button>
                </div>

                <input
                  type="range"
                  min="6.6"
                  max="8.4"
                  step="0.1"
                  value={currentPool.ph}
                  onChange={(e) => setChemicalDirect("ph", parseFloat(e.target.value))}
                  className="w-full accent-[#00B4FF] cursor-pointer h-2 bg-black rounded"
                />

                <div className="flex justify-between text-[7px] font-pixel text-gray-300">
                  <span className="text-red-400">6.6 (Ácido)</span>
                  <span className="text-[#00FF88] font-bold">7.2 - 7.6 IDEAL CABO</span>
                  <span className="text-red-400">8.4 (Alcalino)</span>
                </div>
              </div>

              {/* CONTROL 2: CLORO */}
              <div className="bg-[#002f80] p-3.5 border-4 border-black rounded pixel-box space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="font-pixel text-[9px] text-white">🧪 CLORO LIBRE:</span>
                  <div
                    className={`font-pixel text-base px-3 py-1 rounded border-2 border-black font-bold ${
                      currentPool.cloro >= 2.0 && currentPool.cloro <= 3.0
                        ? "bg-[#00FF88] text-black"
                        : "bg-[#FFD700] text-black"
                    }`}
                  >
                    {currentPool.cloro.toFixed(1)} PPM
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 pt-1">
                  <button
                    onClick={() => adjustChemical("cloro", -0.5)}
                    className="py-2.5 bg-amber-600 text-white font-pixel text-xs border-2 border-black rounded pixel-btn font-bold flex items-center justify-center"
                  >
                    -0.5
                  </button>
                  <button
                    onClick={() => adjustChemical("cloro", -0.1)}
                    className="py-2.5 bg-yellow-600 text-white font-pixel text-xs border-2 border-black rounded pixel-btn font-bold flex items-center justify-center"
                  >
                    -0.1
                  </button>
                  <button
                    onClick={() => adjustChemical("cloro", 0.1)}
                    className="py-2.5 bg-[#FFD700] text-black font-pixel text-xs border-2 border-black rounded pixel-btn font-bold flex items-center justify-center"
                  >
                    +0.1
                  </button>
                  <button
                    onClick={() => adjustChemical("cloro", 0.5)}
                    className="py-2.5 bg-yellow-400 text-black font-pixel text-xs border-2 border-black rounded pixel-btn font-bold flex items-center justify-center"
                  >
                    +0.5
                  </button>
                </div>

                <input
                  type="range"
                  min="0.0"
                  max="5.0"
                  step="0.1"
                  value={currentPool.cloro}
                  onChange={(e) => setChemicalDirect("cloro", parseFloat(e.target.value))}
                  className="w-full accent-[#FFD700] cursor-pointer h-2 bg-black rounded"
                />

                <div className="flex justify-between text-[7px] font-pixel text-gray-300">
                  <span className="text-[#FF3366]">0.0 (Sin Cloro)</span>
                  <span className="text-[#00FF88] font-bold">2.0 - 3.0 PPM IDEAL</span>
                  <span className="text-yellow-400">5.0 (Exceso)</span>
                </div>
              </div>

              {/* DICTAMEN PIXEL ART */}
              <div
                className={`p-4 border-4 border-black rounded pixel-box ${
                  diagnosis.isPerfect
                    ? "bg-[#00FF88] text-black pixel-box-green"
                    : "bg-[#FFD700] text-black pixel-box-gold"
                }`}
              >
                <div className="font-pixel text-[11px] font-bold text-center mb-1.5 drop-shadow-[1px_1px_0_rgba(255,255,255,0.4)]">
                  [{diagnosis.badge}]
                </div>

                {diagnosis.isPerfect ? (
                  <p className="font-pixel text-[8px] text-center leading-relaxed">
                    ¡AGUA CRISTALINA TIPO HOTEL DE LUJO! No requiere adición de químicos.
                  </p>
                ) : (
                  <div className="space-y-2 mt-2">
                    {diagnosis.actions.map((act, i) => (
                      <div
                        key={i}
                        className="bg-black text-white p-2 border-2 border-black rounded font-pixel text-[8px]"
                      >
                        <div className="text-[#FFD700] mb-0.5 font-bold">▶ {act.text}</div>
                        <div className="text-[#00FF88]">{act.action}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ---------------- TAB 3: HISTORIAL DE MANTENIMIENTO 64 ---------------- */}
          {activeTab === "historial" && (
            <div className="space-y-3.5">
              {/* Header del Historial */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-pixel text-[11px] text-[#FFD700] flex items-center gap-1.5">
                    <History size={14} className="text-[#FFD700]" /> BITÁCORA HISTÓRICA
                  </h2>
                  <p className="font-retro-alt text-base text-gray-200">
                    {currentPool.name} • {currentPool.history?.length || 0} SERVICIOS REGISTRADOS
                  </p>
                </div>
                <button
                  onClick={handleSaveToHistory}
                  className="bg-[#00FF88] text-black font-pixel text-[7px] px-2 py-1.5 border-2 border-black rounded pixel-btn font-bold flex items-center gap-1 shadow-sm"
                >
                  <Plus size={10} /> REGISTRAR HOY
                </button>
              </div>

              {/* Resumen de Salud Histórica de la Alberca */}
              <div className="bg-[#001740] p-3 border-4 border-black rounded pixel-box grid grid-cols-3 gap-2 text-center font-pixel text-[7px]">
                <div className="bg-black/40 p-2 border border-black rounded">
                  <span className="text-gray-400 block mb-0.5">ESTADO</span>
                  <span className="text-[#00FF88] font-bold">
                    {currentPool.bossDefeated ? "ÓPTIMO" : "EN ATENCIÓN"}
                  </span>
                </div>
                <div className="bg-black/40 p-2 border border-black rounded">
                  <span className="text-gray-400 block mb-0.5">ÚLTIMO SERVICIO</span>
                  <span className="text-[#FFD700] font-bold truncate block">
                    {currentPool.history?.[0]?.date.split("•")[0] || "Hoy"}
                  </span>
                </div>
                <div className="bg-black/40 p-2 border border-black rounded">
                  <span className="text-gray-400 block mb-0.5">VOLUMEN</span>
                  <span className="text-[#00B4FF] font-bold">{currentPool.volumeM3} m³</span>
                </div>
              </div>

              {/* Lista de Registros de Servicios Anteriores */}
              {currentPool.history && currentPool.history.length > 0 ? (
                <div className="space-y-3">
                  {currentPool.history.map((record) => (
                    <div
                      key={record.id}
                      className="bg-[#002f80] border-4 border-black rounded pixel-box p-3.5 space-y-2.5"
                    >
                      {/* Cabecera del Registro */}
                      <div className="flex items-center justify-between border-b-2 border-black/50 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-base">📜</span>
                          <div>
                            <div className="font-pixel text-[8px] text-[#FFD700] font-bold">
                              {record.date}
                            </div>
                            <div className="font-retro-alt text-base text-gray-200">
                              Téc: {record.technician}
                            </div>
                          </div>
                        </div>

                        <span className="font-pixel text-[7px] bg-[#00FF88] text-black px-2 py-0.5 rounded border border-black font-bold">
                          {record.serviceType}
                        </span>
                      </div>

                      {/* Parámetros Químicos Registrados en este servicio */}
                      <div className="grid grid-cols-3 gap-1.5 font-pixel text-[7px] text-center">
                        <div className="bg-black/60 p-1.5 border border-black rounded">
                          <span className="text-gray-400 block">pH</span>
                          <span className="text-[#00FF88] font-bold">{record.ph.toFixed(1)}</span>
                        </div>
                        <div className="bg-black/60 p-1.5 border border-black rounded">
                          <span className="text-gray-400 block">CLORO</span>
                          <span className="text-[#FFD700] font-bold">{record.cloro.toFixed(1)} ppm</span>
                        </div>
                        <div className="bg-black/60 p-1.5 border border-black rounded">
                          <span className="text-gray-400 block">CLARIDAD</span>
                          <span className="text-[#00B4FF] font-bold">{record.clarity}%</span>
                        </div>
                      </div>

                      {/* Tareas Realizadas */}
                      <div>
                        <span className="font-pixel text-[7px] text-gray-300 block mb-1">
                          TAREAS REALIZADAS:
                        </span>
                        <div className="grid grid-cols-1 gap-1">
                          {record.tasksCompleted.map((t, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-1.5 font-pixel text-[7px] text-white"
                            >
                              <span className="text-[#00FF88] font-bold">✓</span>
                              <span className="truncate">{t}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Químicos Utilizados */}
                      {record.chemicalsUsed && record.chemicalsUsed.length > 0 && (
                        <div className="bg-[#001d54] p-2 border-2 border-black rounded">
                          <span className="font-pixel text-[7px] text-[#FFD700] block mb-1">
                            ⚗️ QUÍMICOS DOSIFICADOS:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {record.chemicalsUsed.map((chem, idx) => (
                              <span
                                key={idx}
                                className="bg-black px-2 py-0.5 rounded border border-black font-pixel text-[7px] text-[#00FF88]"
                              >
                                {chem.name}: <span className="text-white">{chem.amount}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Comparativa de Fotos Antes y Después si existen */}
                      {(record.beforePhotoUrl || record.afterPhotoUrl) && (
                        <div className="pt-1">
                          <span className="font-pixel text-[7px] text-gray-300 block mb-1.5">
                            📸 REGISTRO FOTOGRÁFICO:
                          </span>
                          <div className="grid grid-cols-2 gap-2">
                            {record.beforePhotoUrl && (
                              <div
                                onClick={() => {
                                  setPhotoViewerUrl(record.beforePhotoUrl!);
                                  setPhotoViewerTitle(`ANTES • ${record.date}`);
                                }}
                                className="relative h-20 border-2 border-black rounded overflow-hidden cursor-pointer group"
                              >
                                <img
                                  src={record.beforePhotoUrl}
                                  alt="Antes"
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                                <span className="absolute bottom-0 inset-x-0 bg-black/80 font-pixel text-[6px] text-red-400 text-center py-0.5">
                                  ANTES
                                </span>
                              </div>
                            )}

                            {record.afterPhotoUrl && (
                              <div
                                onClick={() => {
                                  setPhotoViewerUrl(record.afterPhotoUrl!);
                                  setPhotoViewerTitle(`DESPUÉS • ${record.date}`);
                                }}
                                className="relative h-20 border-2 border-black rounded overflow-hidden cursor-pointer group"
                              >
                                <img
                                  src={record.afterPhotoUrl}
                                  alt="Después"
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                                <span className="absolute bottom-0 inset-x-0 bg-black/80 font-pixel text-[6px] text-[#00FF88] text-center py-0.5">
                                  DESPUÉS
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Botón Descargar PDF */}
                      <button
                        onClick={() => generatePDFReport(record)}
                        className="w-full mt-3 py-2 bg-[#FFD700] text-black font-pixel text-[7px] border-2 border-black rounded font-bold pixel-btn flex items-center justify-center gap-2"
                      >
                        <Download size={12} /> DESCARGAR PDF OFICIAL
                      </button>

                      {/* Notas de Servicio */}
                      {record.notes && (
                        <p className="font-pixel text-[7px] text-gray-300 italic bg-black/30 p-2 rounded border border-black/40 mt-2">
                          "{record.notes}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-[#001f54] border-4 border-black rounded pixel-box space-y-2">
                  <span className="text-3xl block">📜</span>
                  <p className="font-pixel text-[8px] text-gray-300">
                    AÚN NO HAY REGISTROS HISTÓRICOS PARA ESTA ALBERCA.
                  </p>
                  <button
                    onClick={handleSaveToHistory}
                    className="py-2.5 px-4 bg-[#00FF88] text-black font-pixel text-[8px] border-2 border-black rounded font-bold pixel-btn"
                  >
                    GUARDAR PRIMER SERVICIO
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ---------------- TAB 4: MAPA / DASHBOARD ---------------- */}
          {activeTab === "mapa" && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-pixel text-[11px] text-[#FFD700]">
                    MAPA DE MUNDOS CABO
                  </h2>
                  <p className="font-retro-alt text-base text-gray-300">
                    Selecciona una alberca para entrar a su nivel o consultar su bitácora.
                  </p>
                </div>
                <button
                  onClick={() => setShowNewPoolModal(true)}
                  className="bg-[#00FF88] text-black font-pixel text-[7px] px-2 py-1.5 border-2 border-black rounded pixel-btn font-bold flex items-center gap-1"
                >
                  <Plus size={12} /> NUEVA
                </button>
              </div>

              {/* Filtros Rápidos (Verde / Amarillo / Rojo) */}
              <div className="grid grid-cols-4 gap-1 font-pixel text-[7px]">
                <button
                  onClick={() => setFilterUrgency("ALL")}
                  className={`py-1.5 border-2 border-black rounded ${
                    filterUrgency === "ALL"
                      ? "bg-[#00B4FF] text-black font-bold"
                      : "bg-[#001740] text-gray-300"
                  }`}
                >
                  TODAS ({pools.length})
                </button>
                <button
                  onClick={() => setFilterUrgency("RED")}
                  className={`py-1.5 border-2 border-black rounded ${
                    filterUrgency === "RED"
                      ? "bg-[#FF3366] text-white font-bold"
                      : "bg-[#001740] text-red-300"
                  }`}
                >
                  URGENTES
                </button>
                <button
                  onClick={() => setFilterUrgency("YELLOW")}
                  className={`py-1.5 border-2 border-black rounded ${
                    filterUrgency === "YELLOW"
                      ? "bg-[#FFD700] text-black font-bold"
                      : "bg-[#001740] text-yellow-300"
                  }`}
                >
                  EN CURSO
                </button>
                <button
                  onClick={() => setFilterUrgency("GREEN")}
                  className={`py-1.5 border-2 border-black rounded ${
                    filterUrgency === "GREEN"
                      ? "bg-[#00FF88] text-black font-bold"
                      : "bg-[#001740] text-green-300"
                  }`}
                >
                  LISTAS
                </button>
              </div>

              {/* Lista Completa de Albercas */}
              <div className="space-y-2.5">
                {filteredPools.map((pool, idx) => {
                  const isCurrent = pool.id === currentPool.id;
                  let badgeColor = "bg-[#00FF88] text-black";
                  if (pool.urgency === "yellow") badgeColor = "bg-[#FFD700] text-black";
                  if (pool.urgency === "red") badgeColor = "bg-[#FF3366] text-white";

                  return (
                    <div
                      key={pool.id}
                      className={`p-3.5 border-4 border-black rounded pixel-btn transition-all ${
                        isCurrent
                          ? "bg-[#003899] border-[#FFD700] pixel-box-gold"
                          : "bg-[#002266] pixel-box hover:bg-[#002f80]"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div
                          onClick={() => {
                            setSelectedPoolId(pool.id);
                            setActiveTab("mision");
                            triggerSound("coin");
                          }}
                          className="flex items-center gap-2 cursor-pointer flex-1"
                        >
                          <span className="font-pixel text-[8px] text-[#00B4FF]">
                            W-0{idx + 1}
                          </span>
                          <span className="font-pixel text-[10px] text-white font-bold">
                            {pool.name}
                          </span>
                        </div>
                        <span
                          className={`font-pixel text-[7px] px-2 py-0.5 rounded border border-black font-bold ${badgeColor}`}
                        >
                          {pool.urgency === "green"
                            ? "LISTA"
                            : pool.urgency === "red"
                            ? "URGENTE"
                            : "PENDIENTE"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[8px] text-gray-300 font-retro-alt text-base">
                        <span>📍 {pool.zone}</span>
                        <span>{pool.difficulty}</span>
                      </div>

                      {/* Progreso de la alberca & Acceso Directo a Historial */}
                      <div className="mt-2.5 flex items-center justify-between text-[7px] font-pixel pt-2 border-t border-black/40">
                        <div
                          onClick={() => {
                            setSelectedPoolId(pool.id);
                            setActiveTab("mision");
                            triggerSound("click");
                          }}
                          className="cursor-pointer"
                        >
                          <span className="text-[#00FF88]">
                            pH: {pool.ph} • Cl: {pool.cloro}ppm
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedPoolId(pool.id);
                              setActiveTab("historial");
                              triggerSound("coin");
                            }}
                            className="bg-[#FFD700] text-black px-2 py-1 rounded border border-black font-bold flex items-center gap-1 pixel-btn"
                          >
                            <History size={10} />
                            LOG ({pool.history?.length || 0})
                          </button>

                          <button
                            onClick={() => {
                              setSelectedPoolId(pool.id);
                              setActiveTab("mision");
                              triggerSound("coin");
                            }}
                            className="bg-[#00B4FF] text-black px-2 py-1 rounded border border-black font-bold pixel-btn"
                          >
                            ENTRAR
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ---------------- TAB 5: BODEGA / CAMIONETA ---------------- */}
          {activeTab === "bodega" && (
            <div className="space-y-3.5">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="font-pixel text-[11px] text-[#FFD700]">
                    INVENTARIO CAMIONETA
                  </h2>
                  <p className="font-retro-alt text-base text-gray-300">
                    Stock en vehículo oficial Albercas Cabo.
                  </p>
                </div>
                <span className="text-[8px] font-pixel bg-[#001740] px-2 py-1 rounded border border-black text-[#00FF88]">
                  CABO STOCK
                </span>
              </div>

              {/* Items con botones gigantes +/- */}
              <div className="space-y-2.5">
                {inventory.map((item) => {
                  const isLow = item.qty <= item.minReq;

                  return (
                    <div
                      key={item.id}
                      className="p-3 bg-[#002f80] border-4 border-black rounded pixel-box flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{item.icon}</span>
                        <div>
                          <div className="font-pixel text-[9px] text-white font-bold">
                            {item.name}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-retro-alt text-lg text-[#00FF88] font-bold">
                              {item.qty} {item.unit}
                            </span>
                            {isLow && (
                              <span className="font-pixel text-[6px] bg-[#FF3366] text-white px-1 rounded border border-black font-bold">
                                RESURTIR
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Botones Grandes de 1-toque */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleInventoryChange(item.id, -1)}
                          className="w-9 h-9 bg-red-600 text-white font-pixel text-sm border-2 border-black rounded pixel-btn flex items-center justify-center font-bold"
                          title="Restar 1"
                        >
                          -
                        </button>
                        <button
                          onClick={() => handleInventoryChange(item.id, 1)}
                          className="w-9 h-9 bg-[#00FF88] text-black font-pixel text-sm border-2 border-black rounded pixel-btn flex items-center justify-center font-bold"
                          title="Sumar 1"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pedir resurtido */}
              <div className="pt-2">
                <button
                  onClick={() => {
                    triggerSound("complete");
                    showToast("📦 ¡Solicitud de resurtido enviada a Bodega Central Cabo!");
                  }}
                  className="w-full py-3.5 bg-[#00B4FF] hover:bg-cyan-300 text-black font-pixel text-[9px] border-4 border-black rounded pixel-box-cyan pixel-btn font-bold flex items-center justify-center gap-2"
                >
                  <Package size={16} /> PEDIR RESURTIDO A BASE CABO
                </button>
              </div>
            </div>
          )}

          {/* ---------------- TAB 6: RANKING SEMANAL ---------------- */}
          {activeTab === "ranking" && (
            <div className="space-y-3.5">
              <div className="text-center">
                <h2 className="font-pixel text-[11px] text-[#FFD700] flex items-center justify-center gap-1.5">
                  <Trophy size={16} className="text-[#FFD700]" /> RANKING SEMANAL CABO
                </h2>
                <p className="font-retro-alt text-base text-gray-300">
                  Tabla de líderes de operadores de albercas en Los Cabos.
                </p>
              </div>

              {/* Leaderboard Retro */}
              <div className="bg-[#001740] border-4 border-black p-3 rounded pixel-box space-y-2">
                <div className="flex items-center justify-between p-2.5 bg-[#FFD700] text-black font-pixel text-[9px] border-2 border-black rounded font-bold shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-base">👑</span>
                    <span>1. CARLOS V. (CABO SAN LUCAS)</span>
                  </div>
                  <span>4,890 XP</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-[#00FF88] text-black font-pixel text-[9px] border-2 border-black rounded font-bold shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🥈</span>
                    <span>2. TÚ (OPERADOR CABO)</span>
                  </div>
                  <span>{playerXP} XP</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-amber-700 text-white font-pixel text-[9px] border-2 border-black rounded font-bold">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🥉</span>
                    <span>3. MARIO R. (SAN JOSÉ)</span>
                  </div>
                  <span>1,820 XP</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-[#002f80] text-gray-200 font-pixel text-[8px] border-2 border-black rounded">
                  <div className="flex items-center gap-2">
                    <span>4.</span>
                    <span>JUAN P. (CORREDOR)</span>
                  </div>
                  <span>1,410 XP</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-[#002f80] text-gray-200 font-pixel text-[8px] border-2 border-black rounded">
                  <div className="flex items-center gap-2">
                    <span>5.</span>
                    <span>ROBERTO M. (TODOS SANTOS)</span>
                  </div>
                  <span>960 XP</span>
                </div>
              </div>

              {/* Bono de Desempeño */}
              <div className="p-3.5 bg-black/60 border-4 border-[#FFD700] text-center rounded pixel-box-gold">
                <span className="font-pixel text-[8px] text-[#FFD700] block mb-1">
                  ⭐ PREMIO SEMANAL DEL JEFE:
                </span>
                <p className="font-retro-alt text-2xl text-[#00FF88] font-bold">
                  $1,500 MXN BONO EN EFECTIVO
                </p>
                <p className="font-pixel text-[7px] text-gray-400 mt-1">
                  Corte: Domingos 8:00 PM • ¡Continúa completando misiones!
                </p>
              </div>
            </div>
          )}
        </main>

        {/* ============================================================
            6. SECCIÓN OBLIGATORIA: LOGOS OFICIALES (BARRA BLANCA FOOTER)
        ============================================================ */}
        <footer className="mt-auto bg-white text-black border-t-4 border-black p-3">
          <div className="text-center font-pixel text-[8px] text-gray-800 tracking-wider mb-2 font-bold uppercase">
            Químicos y Equipos Oficiales:
          </div>

          <div className="grid grid-cols-3 gap-2 items-stretch justify-center">
            {/* LOGO 1: Azul Piscinas */}
            <div className="h-16 border-2 border-black bg-white flex flex-col items-center justify-center p-1 rounded shadow-xs hover:scale-105 transition-transform text-center">
              <img
                src="/assets/aistudio/azul_piscinas_logo_transparente_d3bd52cb.png"
                alt="Azul Piscinas"
                className="max-h-9 max-w-full object-contain"
              />
              <span className="text-[7px] font-sans font-bold text-blue-900 tracking-tight mt-1 truncate w-full text-center">
                AZUL PISCINAS
              </span>
            </div>

            {/* LOGO 2: RAAL Productos y Servicios */}
            <div className="h-16 border-2 border-black bg-white flex flex-col items-center justify-center p-1 rounded shadow-xs hover:scale-105 transition-transform text-center">
              <img
                src="/assets/aistudio/RAAL_logo_mejorado_transparente_dbf8da39.png"
                alt="RAAL Productos y Servicios"
                className="max-h-9 max-w-full object-contain"
              />
              <span className="text-[7px] font-sans font-bold text-blue-900 tracking-tight mt-1 truncate w-full text-center">
                RAAL PRODUCTOS
              </span>
            </div>

            {/* LOGO 3: Academia de Albercas Los Cabos */}
            <div className="h-16 border-2 border-black bg-[#001740] flex flex-col items-center justify-center p-1 rounded shadow-xs hover:scale-105 transition-transform text-center">
              <img
                src="/assets/aistudio/Meta_AI_academia_logo_blanco_20261102_170052_c7285e6d.png"
                alt="Academia de Albercas Los Cabos"
                className="max-h-9 max-w-full object-contain filter drop-shadow-[0_0_2px_rgba(255,255,255,0.7)]"
              />
              <span className="text-[7px] font-sans font-bold text-[#FFD700] tracking-tight mt-1 truncate w-full text-center">
                ACADEMIA CABO
              </span>
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-gray-200 text-center font-pixel text-[6px] text-gray-500">
            ALBERCAS CABO POOL QUEST 64 • LOS CABOS B.C.S. • VERSIÓN OPERATIVA 2026
          </div>
        </footer>

        {/* ============================================================
            7. MODAL: CERTIFICADO DE VICTORIA / REPORTE 64-BIT AL CLIENTE
        ============================================================ */}
        {showReportModal && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-3">
            <div className="bg-[#002b75] border-4 border-[#FFD700] w-full max-w-sm p-4 rounded text-white font-pixel pixel-box-gold relative max-h-[92vh] overflow-y-auto">
              <button
                onClick={() => setShowReportModal(false)}
                className="absolute top-2 right-2 bg-black border-2 border-white text-white p-1 rounded hover:bg-red-600"
              >
                <X size={14} />
              </button>

              <div className="text-center space-y-1 mb-3 pt-1">
                <span className="text-3xl animate-bounce block">🏆</span>
                <h3 className="text-xs text-[#FFD700] font-bold drop-shadow-[1px_1px_0_#000]">
                  ¡STAGE CLEAR! REPORTE 64-BIT
                </h3>
                <p className="text-[7px] text-[#00FF88] font-bold">
                  CERTIFICADO DIGITAL DE ALBERCA CRISTALINA
                </p>
              </div>

              <div className="bg-black/75 p-3 border-2 border-black rounded text-[8px] space-y-2 mb-3">
                <div className="flex justify-between border-b border-white/20 pb-1">
                  <span className="text-gray-400">PROPIEDAD:</span>
                  <span className="text-[#00B4FF] font-bold">{currentPool.name}</span>
                </div>
                <div className="flex justify-between border-b border-white/20 pb-1">
                  <span className="text-gray-400">UBICACIÓN:</span>
                  <span className="text-white">{currentPool.zone}</span>
                </div>
                <div className="flex justify-between border-b border-white/20 pb-1">
                  <span className="text-gray-400">NIVEL DE pH:</span>
                  <span className="text-[#00FF88] font-bold">
                    {currentPool.ph.toFixed(1)} (BALANCEADO)
                  </span>
                </div>
                <div className="flex justify-between border-b border-white/20 pb-1">
                  <span className="text-gray-400">CLORO LIBRE:</span>
                  <span className="text-[#00FF88] font-bold">
                    {currentPool.cloro.toFixed(1)} PPM (DESINFECTADA)
                  </span>
                </div>
                <div className="flex justify-between border-b border-white/20 pb-1">
                  <span className="text-gray-400">CRISTALINIDAD:</span>
                  <span className="text-[#FFD700] font-bold">{currentPool.clarity}% ÓPTIMA</span>
                </div>
                <div className="flex justify-between border-b border-white/20 pb-1">
                  <span className="text-gray-400">JEFE VENCIDO:</span>
                  <span className="text-[#00FF88] font-bold">
                    {currentPool.bossDefeated ? "ALGA ELIMINADA ✓" : "EN TRATAMIENTO"}
                  </span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-gray-400">TÉCNICO A CARGO:</span>
                  <span className="text-yellow-300">OPERADOR CABO LV.{playerLevel}</span>
                </div>
              </div>

              {/* Vista previa de las fotos antes/después */}
              {(currentPool.beforePhotoUrl || currentPool.afterPhotoUrl || currentPool.photoUrl) && (
                <div className="mb-3 grid grid-cols-2 gap-1.5 border-2 border-black rounded p-1 bg-black">
                  {currentPool.beforePhotoUrl && (
                    <div className="relative h-20 rounded overflow-hidden">
                      <img
                        src={currentPool.beforePhotoUrl}
                        alt="Antes"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-0 inset-x-0 bg-black/80 font-pixel text-[6px] text-red-400 text-center">
                        ANTES
                      </span>
                    </div>
                  )}
                  {(currentPool.afterPhotoUrl || currentPool.photoUrl) && (
                    <div className="relative h-20 rounded overflow-hidden">
                      <img
                        src={currentPool.afterPhotoUrl || currentPool.photoUrl}
                        alt="Después"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-0 inset-x-0 bg-black/80 font-pixel text-[6px] text-[#00FF88] text-center">
                        DESPUÉS
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Aval Oficial y Proveedores */}
              <div className="bg-white text-black p-2 rounded border-2 border-black mb-3">
                <div className="text-[6px] font-pixel text-center text-gray-700 uppercase font-bold mb-1">
                  Certificado y Respaldado por:
                </div>
                <div className="grid grid-cols-3 gap-1.5 items-center justify-center">
                  <div className="h-7 flex items-center justify-center">
                    <img
                      src="/assets/aistudio/azul_piscinas_logo_transparente_d3bd52cb.png"
                      alt="Azul Piscinas"
                      className="max-h-6 max-w-full object-contain"
                    />
                  </div>
                  <div className="h-7 flex items-center justify-center">
                    <img
                      src="/assets/aistudio/RAAL_logo_mejorado_transparente_dbf8da39.png"
                      alt="RAAL"
                      className="max-h-6 max-w-full object-contain"
                    />
                  </div>
                  <div className="h-7 bg-[#001740] rounded flex items-center justify-center px-1">
                    <img
                      src="/assets/aistudio/Meta_AI_academia_logo_blanco_20261102_170052_c7285e6d.png"
                      alt="Academia de Albercas"
                      className="max-h-6 max-w-full object-contain filter drop-shadow-[0_0_1px_rgba(255,255,255,0.8)]"
                    />
                  </div>
                </div>
              </div>

              {/* Acciones de Envío / Compartir */}
              <div className="space-y-2">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `🌊 ALBERCAS CABO - POOL QUEST 64 🌊\n\nEstimado cliente, tu alberca en *${currentPool.name}* ha sido tratada con éxito:\n\n• pH: ${currentPool.ph.toFixed(1)} (Óptimo)\n• Cloro: ${currentPool.cloro.toFixed(1)} ppm (Sanitizada)\n• Cristalinidad: 100%\n• Estado: Lista para disfrutar bajo el sol de Los Cabos.\n\nServicio realizado por Técnico Certificado Albercas Cabo.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    handleSaveToHistory();
                    triggerSound("coin");
                  }}
                  className="w-full py-3 bg-[#00FF88] text-black text-[9px] border-2 border-black font-pixel font-bold flex items-center justify-center gap-2 hover:bg-green-300 pixel-btn"
                >
                  <Send size={14} /> ENVIAR POR WHATSAPP Y REGISTRAR
                </a>

                <button
                  onClick={handleCopyReport}
                  className="w-full py-2.5 bg-[#00B4FF] text-black text-[8px] border-2 border-black font-pixel font-bold flex items-center justify-center gap-2 hover:bg-cyan-300 pixel-btn"
                >
                  <Copy size={13} /> COPIAR TEXTO DEL REPORTE
                </button>

                <button
                  onClick={() => setShowReportModal(false)}
                  className="w-full py-2 bg-gray-800 text-gray-300 text-[8px] border-2 border-black font-pixel pixel-btn"
                >
                  VOLVER A LA MISIÓN
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
            8. MODAL: VISOR DE FOTO EXPANDIDA 64-BIT
        ============================================================ */}
        {photoViewerUrl && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#001740] border-4 border-[#00B4FF] w-full max-w-sm p-3 rounded pixel-box-cyan text-white space-y-3">
              <div className="flex justify-between items-center border-b-2 border-black pb-2">
                <span className="font-pixel text-[8px] text-[#FFD700] truncate">
                  {photoViewerTitle || "EVIDENCIA FOTOGRÁFICA"}
                </span>
                <button
                  onClick={() => setPhotoViewerUrl(null)}
                  className="text-white hover:text-red-400 p-1"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="border-2 border-black rounded overflow-hidden bg-black max-h-[60vh] flex items-center justify-center">
                <img
                  src={photoViewerUrl}
                  alt="Evidencia Ampliada"
                  className="w-full h-auto object-contain max-h-[58vh]"
                />
              </div>

              <div className="text-center font-pixel text-[7px] text-[#00FF88]">
                ALBERCAS CABO POOL QUEST 64 • ARCHIVO DIGITAL CERTIFICADO
              </div>

              <button
                onClick={() => setPhotoViewerUrl(null)}
                className="w-full py-2 bg-[#00B4FF] text-black font-pixel text-[8px] border-2 border-black rounded font-bold"
              >
                CERRAR VISOR
              </button>
            </div>
          </div>
        )}

        {/* ============================================================
            9. MODAL: AGREGAR NUEVA ALBERCA / NIVEL
        ============================================================ */}
        {showNewPoolModal && (
          <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
            <div className="bg-[#002f80] border-4 border-[#00B4FF] w-full max-w-sm p-4 rounded text-white font-pixel pixel-box-cyan space-y-3">
              <div className="flex justify-between items-center border-b-2 border-black pb-2">
                <span className="text-[10px] text-[#FFD700]">🎮 NUEVO NIVEL / ALBERCA</span>
                <button
                  onClick={() => setShowNewPoolModal(false)}
                  className="text-white hover:text-red-400"
                >
                  <X size={16} />
                </button>
              </div>

              <div>
                <label className="text-[8px] text-gray-300 block mb-1">
                  NOMBRE DE LA VILLA O CASA:
                </label>
                <input
                  type="text"
                  placeholder="Ej. CASA CHILENO #12"
                  value={newPoolName}
                  onChange={(e) => setNewPoolName(e.target.value)}
                  className="w-full bg-black border-2 border-white p-2 text-[9px] text-[#00FF88] font-pixel uppercase outline-hidden"
                />
              </div>

              <div>
                <label className="text-[8px] text-gray-300 block mb-1">
                  ZONA EN LOS CABOS:
                </label>
                <input
                  type="text"
                  placeholder="Ej. Palmilla, Cabo del Sol, etc."
                  value={newPoolZone}
                  onChange={(e) => setNewPoolZone(e.target.value)}
                  className="w-full bg-black border-2 border-white p-2 text-[9px] text-white font-pixel outline-hidden"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={handleCreatePool}
                  disabled={!newPoolName.trim()}
                  className="flex-1 py-3 bg-[#00FF88] text-black font-pixel text-[8px] border-2 border-black rounded disabled:opacity-50 font-bold"
                >
                  CREAR NIVEL
                </button>
                <button
                  onClick={() => setShowNewPoolModal(false)}
                  className="py-3 px-4 bg-gray-700 text-white font-pixel text-[8px] border-2 border-black rounded"
                >
                  CANCELAR
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
