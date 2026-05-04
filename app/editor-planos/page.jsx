"use client";

import { Fragment, useRef, useState, useEffect, useCallback } from "react";
import {
  MousePointer2, Pencil, Type, Minus, Square, Circle, Highlighter,
  Ruler, ZoomIn, ZoomOut, RotateCcw, Download, Trash2, Layers,
  MessageSquare, Triangle, ArrowRight, X, FileUp, Loader2, Hand,
  Pipette, ScanLine, Crop, Stamp, Eraser, AreaChart, Spline, Hexagon,
  Save, RefreshCw, ChevronDown, ChevronRight, ChevronLeft, Hash,
  AlignLeft, Grid, Magnet, List, Settings, HelpCircle, Eye, EyeOff,
  Copy, Clipboard, RotateCw, FlipHorizontal, Maximize2, Minimize2,
  PanelLeft, PanelRight, PanelBottom, FileText, Plus, Minus as MinusIcon,
  BookOpen, Ruler as RulerIcon, Move, Lock, Unlock, Star, Flag,
  MessageCircle, Search, Filter, SortAsc, Edit3, Check, AlertTriangle,
  Radius, Sigma, Crosshair, Slash, Baseline, User, Clock, ChevronUp,
  MousePointer, Pen, Shapes, Pencil as PencilIcon, FlipVertical,
  CornerDownRight, Maximize, BoxSelect, Regex, Binary, Brackets,
  Dumbbell, Footprints, Navigation, Compass, Target, Activity,
  Table, FileDown, Printer, FolderOpen, Info, Keyboard
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const STAMPS = ["APPROVED", "REJECTED", "REVIEWED", "IN REVIEW", "PENDING", "FOR CONSTRUCTION", "VOID"];
const STAMP_COLORS = {
  "APPROVED": "#22C55E", "REJECTED": "#EF4444", "REVIEWED": "#F97316",
  "IN REVIEW": "#3B82F6", "PENDING": "#6B7280", "FOR CONSTRUCTION": "#8B5CF6", "VOID": "#DC2626",
};

const COLORS = ["#000000","#EF4444","#F97316","#EAB308","#22C55E","#06B6D4","#3B82F6","#8B5CF6","#EC4899","#6B7280","#FFFFFF","#1E293B"];
const STROKE_SIZES = [0.5, 1, 2, 3, 4, 6, 8, 10];
const FONT_SIZES   = [8, 10, 12, 14, 16, 18, 24, 32, 48];
const OPACITY_STEPS = [25, 50, 75, 100];

const TOOL_GROUPS = [
  {
    id: "select", label: "Select", icon: MousePointer2,
    tools: [
      { id: "select", icon: MousePointer2, label: "Select", shortcut: "V" },
      { id: "pan",    icon: Hand,          label: "Pan",    shortcut: "H" },
    ],
  },
  {
    id: "markup", label: "Markup", icon: Pencil,
    tools: [
      { id: "pen",      icon: Pencil,      label: "Freehand",     shortcut: "P" },
      { id: "line",     icon: Minus,       label: "Line",         shortcut: "L" },
      { id: "arrow",    icon: ArrowRight,  label: "Arrow",        shortcut: "A" },
      { id: "spline",   icon: Spline,      label: "Polyline",     shortcut: "Y" },
      { id: "callout",  icon: MessageCircle, label: "Callout",    shortcut: "U" },
      { id: "eraser",   icon: Eraser,      label: "Eraser",       shortcut: "E" },
    ],
  },
  {
    id: "shapes", label: "Shapes", icon: Square,
    tools: [
      { id: "rect",     icon: Square,   label: "Rectangle",   shortcut: "R" },
      { id: "circle",   icon: Circle,   label: "Ellipse",     shortcut: "C" },
      { id: "triangle", icon: Triangle, label: "Triangle",    shortcut: "G" },
      { id: "hexagon",  icon: Hexagon,  label: "Polygon",     shortcut: "O" },
      { id: "cloud",    icon: Crop,     label: "Cloud",       shortcut: "N" },
    ],
  },
  {
    id: "measure", label: "Measure", icon: Ruler,
    tools: [
      { id: "measure",      icon: Ruler,        label: "Linear Dim",    shortcut: "M" },
      { id: "dim_horiz",    icon: Minus,        label: "Horizontal Dim",shortcut: "J" },
      { id: "dim_vert",     icon: Activity,     label: "Vertical Dim",  shortcut: "Z" },
      { id: "area",         icon: AreaChart,    label: "Area",          shortcut: "Q" },
      { id: "perimeter",    icon: ScanLine,     label: "Perimeter",     shortcut: "W" },
      { id: "radius_dim",   icon: Target,       label: "Radius Dim",    shortcut: "R" },
      { id: "diameter_dim", icon: Compass,      label: "Diameter Dim",  shortcut: "D" },
      { id: "count",        icon: Hash,         label: "Count",         shortcut: "K" },
      { id: "calibrate",    icon: Pipette,      label: "Calibrate",     shortcut: "B" },
    ],
  },
  {
    id: "annotate", label: "Annotate", icon: Type,
    tools: [
      { id: "text",      icon: Type,          label: "Text",       shortcut: "T" },
      { id: "highlight", icon: Highlighter,   label: "Highlight",  shortcut: "I" },
      { id: "comment",   icon: MessageSquare, label: "Note",       shortcut: "D" },
      { id: "stamp",     icon: Stamp,         label: "Stamp",      shortcut: "X" },
      { id: "flag",      icon: Flag,          label: "Flag",       shortcut: "F" },
    ],
  },
];

const MENU_ITEMS = [
  { label: "File",    items: [
    { label:"New",              action:"New",             shortcut:"Ctrl+N" },
    { label:"Open PDF...",      action:"Open PDF",        shortcut:"Ctrl+O" },
    { label:"Open Recent",      action:"Open Recent",     shortcut:"" },
    "---",
    { label:"Save",             action:"Save",            shortcut:"Ctrl+S" },
    { label:"Save As...",       action:"Save As",         shortcut:"Ctrl+Shift+S" },
    "---",
    { label:"Export PNG",       action:"Export PNG",      shortcut:"" },
    { label:"Export PDF...",    action:"Export PDF",      shortcut:"" },
    "---",
    { label:"Send by Email...", action:"Send Email",      shortcut:"" },
    { label:"Print...",         action:"Print",           shortcut:"Ctrl+P" },
    "---",
    { label:"Combine Files...", action:"Combine Files",   shortcut:"" },
    "---",
    { label:"Close",            action:"Close",           shortcut:"Ctrl+W" },
    { label:"Close All",        action:"Close All",       shortcut:"" },
  ]},
  { label: "Edit",    items: [
    { label:"Undo",       action:"Undo",        shortcut:"Ctrl+Z" },
    { label:"Redo",       action:"Redo",        shortcut:"Ctrl+Y" },
    "---",
    { label:"Delete",     action:"Delete",      shortcut:"Del" },
    { label:"Select All", action:"Select All",  shortcut:"Ctrl+A" },
    { label:"Deselect",   action:"Deselect",    shortcut:"Esc" },
    "---",
    { label:"Clear All Markups", action:"Clear All", shortcut:"" },
  ]},
  { label: "View",    items: [
    { label:"Zoom In",       action:"Zoom In",       shortcut:"+" },
    { label:"Zoom Out",      action:"Zoom Out",       shortcut:"-" },
    { label:"Fit Page",      action:"Fit Page",       shortcut:"0" },
    { label:"Fit Width",     action:"Fit Width",      shortcut:"" },
    "---",
    { label:"Show Grid",     action:"Show Grid",      shortcut:"" },
    { label:"Snap to Grid",  action:"Snap to Grid",   shortcut:"" },
    { label:"Rulers",        action:"Rulers",         shortcut:"" },
    "---",
    { label:"Left Panel",    action:"Left Panel",     shortcut:"" },
    { label:"Right Panel",   action:"Right Panel",    shortcut:"" },
    { label:"Markups List",  action:"Markups List",   shortcut:"" },
  ]},
  { label: "Markup",  items: [
    { label:"Select",     action:"tool:select",    shortcut:"V" },
    { label:"Pan",        action:"tool:pan",        shortcut:"H" },
    "---",
    { label:"Freehand",   action:"tool:pen",        shortcut:"P" },
    { label:"Line",       action:"tool:line",       shortcut:"L" },
    { label:"Arrow",      action:"tool:arrow",      shortcut:"A" },
    { label:"Polyline",   action:"tool:spline",     shortcut:"Y" },
    { label:"Callout",    action:"tool:callout",    shortcut:"U" },
    { label:"Eraser",     action:"tool:eraser",     shortcut:"E" },
    "---",
    { label:"Rectangle",  action:"tool:rect",       shortcut:"R" },
    { label:"Ellipse",    action:"tool:circle",     shortcut:"C" },
    { label:"Triangle",   action:"tool:triangle",   shortcut:"G" },
    { label:"Cloud",      action:"tool:cloud",      shortcut:"N" },
    "---",
    { label:"Text",       action:"tool:text",       shortcut:"T" },
    { label:"Highlight",  action:"tool:highlight",  shortcut:"I" },
    { label:"Note",       action:"tool:comment",    shortcut:"D" },
    { label:"Stamp",      action:"tool:stamp",      shortcut:"X" },
  ]},
  { label: "Measure", items: [
    { label:"Linear Dim",     action:"tool:measure",      shortcut:"M" },
    { label:"Horizontal Dim", action:"tool:dim_horiz",    shortcut:"J" },
    { label:"Vertical Dim",   action:"tool:dim_vert",     shortcut:"Z" },
    { label:"Area",           action:"tool:area",         shortcut:"Q" },
    { label:"Perimeter",      action:"tool:perimeter",    shortcut:"W" },
    { label:"Radius",         action:"tool:radius_dim",   shortcut:"" },
    { label:"Diameter",       action:"tool:diameter_dim", shortcut:"" },
    { label:"Count",          action:"tool:count",        shortcut:"K" },
    "---",
    { label:"Calibrate Scale",action:"Calibrate Scale",   shortcut:"B" },
  ]},
  { label: "Tools",   items: [
    { label:"Select PDF Text", action:"Toggle Text Select", shortcut:"" },
    "---",
    { label:"Tool Chest",    action:"Tool Chest",     shortcut:"" },
    { label:"Layers",        action:"Layers",         shortcut:"" },
    { label:"Pages",         action:"Pages",          shortcut:"" },
  ]},
  { label: "Help",    items: [
    { label:"Keyboard Shortcuts", action:"Keyboard Shortcuts", shortcut:"" },
    "---",
    { label:"About Project Center", action:"About", shortcut:"" },
  ]},
];

// ─── PDF.js loader ────────────────────────────────────────────────────────────

async function loadPdfJs() {
  if (window.pdfjsLib) return window.pdfjsLib;
  await new Promise((res, rej) => {
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    s.onload = res; s.onerror = rej;
    document.head.appendChild(s);
  });
  window.pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  return window.pdfjsLib;
}

let currentRenderTask = null;

async function renderPage(pdf, pageNum, pdfCanvas, scale = 2.5) {
  const page     = await pdf.getPage(pageNum);
  const dpr      = window.devicePixelRatio || 1;
  const viewport = page.getViewport({ scale: scale * dpr });
  pdfCanvas.width  = viewport.width;
  pdfCanvas.height = viewport.height;
  pdfCanvas.style.width  = (viewport.width  / dpr) + "px";
  pdfCanvas.style.height = (viewport.height / dpr) + "px";
  if (currentRenderTask) { currentRenderTask.cancel(); currentRenderTask = null; }
  const ctx = pdfCanvas.getContext("2d");
  ctx.clearRect(0, 0, pdfCanvas.width, pdfCanvas.height);
  currentRenderTask = page.render({ canvasContext: ctx, viewport });
  await currentRenderTask.promise;
  currentRenderTask = null;
  return { width: viewport.width / dpr, height: viewport.height / dpr };
}

// ─── Text layer renderer ──────────────────────────────────────────────────────
async function renderTextLayer(pdf, pageNum, textLayerDiv, viewport) {
  if (!textLayerDiv) return;
  textLayerDiv.innerHTML = "";
  try {
    const page    = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const dpr = window.devicePixelRatio || 1;
    content.items.forEach(item => {
      if (!item.str?.trim()) return;
      const span = document.createElement("span");
      span.textContent = item.str;
      const tx = window.pdfjsLib.Util.transform(viewport.transform, item.transform);
      const [a,,, d, e, f] = tx;
      span.style.cssText = `
        position: absolute;
        left: ${e / dpr}px;
        top: ${(viewport.height - f) / dpr}px;
        font-size: ${Math.abs(d) / dpr}px;
        font-family: sans-serif;
        color: transparent;
        white-space: pre;
        cursor: text;
        user-select: text;
        transform-origin: 0% 0%;
        transform: scaleX(${a / Math.abs(d)});
        line-height: 1;
      `;
      textLayerDiv.appendChild(span);
    });
  } catch(e) { /* silent fail */ }
}

// ─── Draw helpers ─────────────────────────────────────────────────────────────

function drawShape(ctx, shape, isSel) {
  ctx.save();
  ctx.globalAlpha  = shape.opacity ?? 1;
  ctx.strokeStyle  = shape.color  || "#000";
  ctx.fillStyle    = shape.fill   || "transparent";
  ctx.lineWidth    = shape.size   || 2;
  ctx.lineCap = "round"; ctx.lineJoin = "round";
  if (isSel) { ctx.shadowColor = "#06B6D4"; ctx.shadowBlur = 10; ctx.setLineDash([6, 3]); }

  switch (shape.type) {
    case "pen": case "spline": {
      if (!shape.points?.length) break;
      ctx.setLineDash([]);
      ctx.beginPath(); ctx.moveTo(shape.points[0].x, shape.points[0].y);
      if (shape.type === "spline" && shape.points.length > 2) {
        for (let i = 1; i < shape.points.length - 1; i++) {
          const mx = (shape.points[i].x + shape.points[i+1].x) / 2;
          const my = (shape.points[i].y + shape.points[i+1].y) / 2;
          ctx.quadraticCurveTo(shape.points[i].x, shape.points[i].y, mx, my);
        }
        ctx.lineTo(shape.points[shape.points.length-1].x, shape.points[shape.points.length-1].y);
      } else {
        shape.points.forEach(p => ctx.lineTo(p.x, p.y));
      }
      ctx.stroke();
      if (shape.type === "spline" && shape.scale && shape.points.length > 1) {
        let total = 0;
        for (let i = 1; i < shape.points.length; i++) {
          const dx = shape.points[i].x - shape.points[i-1].x;
          const dy = shape.points[i].y - shape.points[i-1].y;
          total += Math.sqrt(dx*dx + dy*dy);
        }
        const last = shape.points[shape.points.length-1];
        ctx.setLineDash([]);
        ctx.font = "bold 11px monospace"; ctx.fillStyle = shape.color; ctx.globalAlpha = 1;
        ctx.fillText(`${(total/40*shape.scale*3.28084).toFixed(1)} ft`, last.x+6, last.y-6);
      }
      break;
    }
    case "line": {
      ctx.setLineDash([]);
      ctx.beginPath(); ctx.moveTo(shape.x1, shape.y1); ctx.lineTo(shape.x2, shape.y2); ctx.stroke(); break;
    }
    case "arrow": {
      ctx.setLineDash([]);
      const ang = Math.atan2(shape.y2-shape.y1, shape.x2-shape.x1), L = 14;
      ctx.beginPath(); ctx.moveTo(shape.x1, shape.y1); ctx.lineTo(shape.x2, shape.y2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(shape.x2, shape.y2);
      ctx.lineTo(shape.x2-L*Math.cos(ang-0.4), shape.y2-L*Math.sin(ang-0.4));
      ctx.lineTo(shape.x2-L*Math.cos(ang+0.4), shape.y2-L*Math.sin(ang+0.4));
      ctx.closePath(); ctx.fillStyle = shape.color; ctx.fill(); break;
    }
    case "rect": {
      ctx.setLineDash([]);
      const w = shape.x2-shape.x1, h = shape.y2-shape.y1;
      if (shape.fill !== "transparent") ctx.fillRect(shape.x1, shape.y1, w, h);
      ctx.strokeRect(shape.x1, shape.y1, w, h); break;
    }
    case "circle": {
      ctx.setLineDash([]);
      const rx = Math.abs(shape.x2-shape.x1)/2, ry = Math.abs(shape.y2-shape.y1)/2;
      const cx = (shape.x1+shape.x2)/2, cy = (shape.y1+shape.y2)/2;
      ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI*2);
      if (shape.fill !== "transparent") ctx.fill(); ctx.stroke(); break;
    }
    case "triangle": {
      ctx.setLineDash([]);
      const mx = (shape.x1+shape.x2)/2;
      ctx.beginPath(); ctx.moveTo(mx, shape.y1); ctx.lineTo(shape.x2, shape.y2); ctx.lineTo(shape.x1, shape.y2);
      ctx.closePath(); if (shape.fill !== "transparent") ctx.fill(); ctx.stroke(); break;
    }
    case "hexagon": {
      ctx.setLineDash([]);
      const cx2 = (shape.x1+shape.x2)/2, cy2 = (shape.y1+shape.y2)/2;
      const rr  = Math.min(Math.abs(shape.x2-shape.x1), Math.abs(shape.y2-shape.y1))/2;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) { const a = Math.PI/180*(60*i-30); ctx.lineTo(cx2+rr*Math.cos(a), cy2+rr*Math.sin(a)); }
      ctx.closePath(); if (shape.fill !== "transparent") ctx.fill(); ctx.stroke(); break;
    }
    case "cloud": {
      ctx.setLineDash([]);
      const ccx = (shape.x1+shape.x2)/2, ccy = (shape.y1+shape.y2)/2;
      const rx2 = Math.abs(shape.x2-shape.x1)/2, ry2 = Math.abs(shape.y2-shape.y1)/2;
      ctx.strokeStyle = shape.color || "#3B82F6"; ctx.lineWidth = shape.size || 2;
      ctx.beginPath();
      for (let i = 0; i <= 12; i++) {
        const t = (i/12)*Math.PI*2, bump = (i%2===0?1:-0.4)*Math.min(rx2,ry2)*0.18;
        ctx.lineTo(ccx+(rx2+bump)*Math.cos(t), ccy+(ry2+bump)*Math.sin(t));
      }
      ctx.closePath(); if (shape.fill !== "transparent") { ctx.fillStyle = shape.fill; ctx.fill(); } ctx.stroke(); break;
    }
    case "highlight": {
      ctx.setLineDash([]);
      ctx.globalAlpha = 0.35; ctx.fillStyle = shape.color;
      ctx.fillRect(shape.x1, shape.y1, shape.x2-shape.x1, shape.y2-shape.y1); break;
    }
    case "text_highlight": {
      ctx.setLineDash([]);
      ctx.globalAlpha = shape.opacity ?? 0.4;
      ctx.fillStyle = shape.color || "#EAB308";
      ctx.fillRect(shape.x1, shape.y1, shape.x2-shape.x1, shape.y2-shape.y1);
      if (isSel && shape.text) {
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(shape.x1, shape.y1-18, Math.min(shape.text.length*6+12, 200), 16);
        ctx.fillStyle = "#f8fafc";
        ctx.font = "10px sans-serif";
        const preview = shape.text.length>30 ? shape.text.slice(0,30)+"…" : shape.text;
        ctx.fillText(preview, shape.x1+4, shape.y1-6);
      }
      break;
    }
    case "text_strikeout": {
      ctx.setLineDash([]);
      ctx.globalAlpha = shape.opacity ?? 1;
      ctx.strokeStyle = shape.color || "#EF4444";
      ctx.lineWidth   = shape.size  || 2;
      const midY = (shape.y1 + shape.y2) / 2;
      ctx.beginPath(); ctx.moveTo(shape.x1, midY); ctx.lineTo(shape.x2, midY); ctx.stroke();
      break;
    }
    case "text_underline": {
      ctx.setLineDash([]);
      ctx.globalAlpha = shape.opacity ?? 1;
      ctx.strokeStyle = shape.color || "#3B82F6";
      ctx.lineWidth   = shape.size  || 2;
      ctx.beginPath(); ctx.moveTo(shape.x1, shape.y2); ctx.lineTo(shape.x2, shape.y2); ctx.stroke();
      break;
    }
    case "text": {
      ctx.setLineDash([]);
      const fs = (shape.fontSize || 14);
      ctx.font = `${shape.bold?"bold ":""}${shape.italic?"italic ":""}${fs}px ${shape.fontFamily||"sans-serif"}`;
      ctx.fillStyle = shape.color; ctx.globalAlpha = shape.opacity ?? 1;
      (shape.text||"").split("\n").forEach((line, i) => ctx.fillText(line, shape.x1, shape.y1 + i*(fs+4)));
      break;
    }
    case "callout": {
      ctx.setLineDash([]);
      const bx = shape.x1, by = shape.y1, bw = 140, bh = 40;
      ctx.strokeStyle = shape.color; ctx.lineWidth = shape.size||2;
      ctx.fillStyle = shape.fill !== "transparent" ? shape.fill : "#FFFDE7";
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(bx, by, bw, bh, 6) : ctx.rect(bx, by, bw, bh);
      ctx.fill(); ctx.stroke();
      if (shape.x2 && shape.y2) {
        ctx.beginPath();
        ctx.moveTo(bx+bw/2, by+bh);
        ctx.lineTo(shape.x2, shape.y2);
        ctx.stroke();
      }
      ctx.font = `${shape.fontSize||12}px sans-serif`; ctx.fillStyle = shape.color; ctx.globalAlpha = 1;
      ctx.fillText(shape.text||"Callout", bx+8, by+bh/2+5);
      break;
    }
    case "measure":
    case "dim_horiz":
    case "dim_vert": {
      ctx.setLineDash([]);
      const rawDist = Math.sqrt((shape.x2-shape.x1)**2+(shape.y2-shape.y1)**2);
      const lineDist = shape.type==="dim_horiz" ? Math.abs(shape.x2-shape.x1)
                     : shape.type==="dim_vert"  ? Math.abs(shape.y2-shape.y1)
                     : rawDist;
      const ft = (lineDist/40*(shape.scale||1)*3.28084).toFixed(2);
      const m  = (lineDist/40*(shape.scale||1)).toFixed(2);
      const OFF = 20;
      ctx.strokeStyle = "#F97316"; ctx.lineWidth = 1;
      ctx.setLineDash([3,3]);
      if (shape.type==="dim_horiz") {
        ctx.beginPath(); ctx.moveTo(shape.x1,shape.y1); ctx.lineTo(shape.x1,shape.y1-OFF); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(shape.x2,shape.y1); ctx.lineTo(shape.x2,shape.y1-OFF); ctx.stroke();
        ctx.setLineDash([]);
        ctx.lineWidth=1.5;
        ctx.beginPath(); ctx.moveTo(shape.x1,shape.y1-OFF); ctx.lineTo(shape.x2,shape.y1-OFF); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(shape.x1,shape.y1-OFF); ctx.lineTo(shape.x1+8,shape.y1-OFF-3); ctx.lineTo(shape.x1+8,shape.y1-OFF+3); ctx.closePath(); ctx.fillStyle="#F97316"; ctx.fill();
        ctx.beginPath(); ctx.moveTo(shape.x2,shape.y1-OFF); ctx.lineTo(shape.x2-8,shape.y1-OFF-3); ctx.lineTo(shape.x2-8,shape.y1-OFF+3); ctx.closePath(); ctx.fill();
        ctx.font="bold 11px monospace"; ctx.fillStyle="#F97316"; ctx.globalAlpha=1; ctx.textAlign="center";
        ctx.fillText(`${ft} ft`, (shape.x1+shape.x2)/2, shape.y1-OFF-6);
        ctx.textAlign="start";
      } else if (shape.type==="dim_vert") {
        ctx.beginPath(); ctx.moveTo(shape.x1,shape.y1); ctx.lineTo(shape.x1-OFF,shape.y1); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(shape.x1,shape.y2); ctx.lineTo(shape.x1-OFF,shape.y2); ctx.stroke();
        ctx.setLineDash([]);
        ctx.lineWidth=1.5;
        ctx.beginPath(); ctx.moveTo(shape.x1-OFF,shape.y1); ctx.lineTo(shape.x1-OFF,shape.y2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(shape.x1-OFF,shape.y1); ctx.lineTo(shape.x1-OFF-3,shape.y1+8); ctx.lineTo(shape.x1-OFF+3,shape.y1+8); ctx.closePath(); ctx.fillStyle="#F97316"; ctx.fill();
        ctx.beginPath(); ctx.moveTo(shape.x1-OFF,shape.y2); ctx.lineTo(shape.x1-OFF-3,shape.y2-8); ctx.lineTo(shape.x1-OFF+3,shape.y2-8); ctx.closePath(); ctx.fill();
        ctx.save(); ctx.translate(shape.x1-OFF-8,(shape.y1+shape.y2)/2); ctx.rotate(-Math.PI/2);
        ctx.font="bold 11px monospace"; ctx.fillStyle="#F97316"; ctx.textAlign="center";
        ctx.fillText(`${ft} ft`,0,0); ctx.restore();
      } else {
        ctx.setLineDash([6,4]); ctx.strokeStyle="#F97316"; ctx.lineWidth=1.5;
        ctx.beginPath(); ctx.moveTo(shape.x1,shape.y1); ctx.lineTo(shape.x2,shape.y2); ctx.stroke();
        ctx.setLineDash([]);
        const ang2=Math.atan2(shape.y2-shape.y1,shape.x2-shape.x1);
        [[shape.x1,shape.y1],[shape.x2,shape.y2]].forEach(([x,y])=>{
          ctx.beginPath(); ctx.moveTo(x-8*Math.sin(ang2),y+8*Math.cos(ang2));
          ctx.lineTo(x+8*Math.sin(ang2),y-8*Math.cos(ang2)); ctx.stroke();
        });
        ctx.font="bold 11px monospace"; ctx.fillStyle="#F97316"; ctx.globalAlpha=1;
        ctx.textAlign="center";
        ctx.fillText(`${ft} ft (${m} m)`,(shape.x1+shape.x2)/2,(shape.y1+shape.y2)/2-12);
        ctx.textAlign="start";
      }
      break;
    }
    case "radius_dim":
    case "diameter_dim": {
      ctx.setLineDash([]);
      const cx=(shape.x1+shape.x2)/2, cy=(shape.y1+shape.y2)/2;
      const r=Math.sqrt((shape.x2-shape.x1)**2+(shape.y2-shape.y1)**2)/2;
      const ft=(r*(shape.type==="diameter_dim"?2:1)/40*(shape.scale||1)*3.28084).toFixed(2);
      const prefix=shape.type==="diameter_dim"?"Ø":"R";
      ctx.strokeStyle="#06B6D4"; ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.stroke();
      ctx.setLineDash([5,3]);
      ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(shape.x2,shape.y2); ctx.stroke();
      ctx.setLineDash([]);
      ctx.font="bold 12px monospace"; ctx.fillStyle="#06B6D4"; ctx.globalAlpha=1;
      ctx.fillText(`${prefix} ${ft} ft`, cx+r/2+4, cy-6); break;
    }
    case "area": {
      ctx.setLineDash([4,3]); ctx.strokeStyle = "#22C55E"; ctx.lineWidth = 1.5;
      const aw = Math.abs(shape.x2-shape.x1), ah = Math.abs(shape.y2-shape.y1);
      const sqft = ((aw/40*(shape.scale||1))*(ah/40*(shape.scale||1))*10.7639).toFixed(1);
      const m2   = ((aw/40*(shape.scale||1))*(ah/40*(shape.scale||1))).toFixed(2);
      ctx.fillStyle = "rgba(34,197,94,0.08)";
      ctx.fillRect(Math.min(shape.x1,shape.x2), Math.min(shape.y1,shape.y2), aw, ah);
      ctx.strokeRect(Math.min(shape.x1,shape.x2), Math.min(shape.y1,shape.y2), aw, ah);
      ctx.setLineDash([]);
      ctx.font = "bold 11px monospace"; ctx.fillStyle = "#22C55E"; ctx.globalAlpha = 1;
      ctx.fillText(`${sqft} ft² (${m2} m²)`, (shape.x1+shape.x2)/2-50, (shape.y1+shape.y2)/2); break;
    }
    case "perimeter": {
      if (!shape.points?.length) break;
      ctx.setLineDash([5,3]); ctx.strokeStyle = "#8B5CF6"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(shape.points[0].x, shape.points[0].y);
      shape.points.forEach(p => ctx.lineTo(p.x, p.y)); ctx.stroke();
      ctx.setLineDash([]);
      let total = 0;
      for (let i = 1; i < shape.points.length; i++) {
        const dx = shape.points[i].x-shape.points[i-1].x, dy = shape.points[i].y-shape.points[i-1].y;
        total += Math.sqrt(dx*dx+dy*dy);
      }
      const lp = shape.points[shape.points.length-1];
      ctx.font = "bold 10px monospace"; ctx.fillStyle = "#8B5CF6"; ctx.globalAlpha = 1;
      ctx.fillText(`P: ${(total/40*(shape.scale||1)*3.28084).toFixed(1)} ft`, lp.x+6, lp.y-6); break;
    }
    case "count": {
      const r = 14;
      ctx.setLineDash([]);
      ctx.fillStyle = shape.color || "#06B6D4"; ctx.globalAlpha = 0.9;
      ctx.beginPath(); ctx.arc(shape.x1, shape.y1, r, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = "#fff"; ctx.font = "bold 11px sans-serif"; ctx.textAlign = "center";
      ctx.fillText(shape.countNum||"1", shape.x1, shape.y1+4);
      ctx.textAlign = "start"; break;
    }
    case "stamp": {
      const sw = 130, sh = 40, sx = shape.x1-sw/2, sy = shape.y1-sh/2;
      const sc = STAMP_COLORS[shape.text] || "#06B6D4";
      ctx.setLineDash([]);
      ctx.strokeStyle = sc; ctx.lineWidth = 2.5; ctx.globalAlpha = 0.9;
      ctx.strokeRect(sx, sy, sw, sh);
      ctx.font = "bold 13px monospace"; ctx.fillStyle = sc; ctx.globalAlpha = 0.92;
      ctx.textAlign = "center"; ctx.fillText(shape.text||"REVIEWED", shape.x1, shape.y1+5);
      ctx.textAlign = "start"; break;
    }
    case "flag": {
      ctx.setLineDash([]);
      ctx.strokeStyle = shape.color; ctx.fillStyle = shape.color; ctx.globalAlpha = 0.85;
      ctx.beginPath(); ctx.moveTo(shape.x1, shape.y1);
      ctx.lineTo(shape.x1, shape.y1-40);
      ctx.lineTo(shape.x1+20, shape.y1-32);
      ctx.lineTo(shape.x1, shape.y1-24);
      ctx.fill(); ctx.stroke();
      ctx.font = "bold 9px sans-serif"; ctx.fillStyle = "#fff";
      ctx.fillText(shape.text||"", shape.x1+3, shape.y1-28); break;
    }
  }
  ctx.restore();
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function EditorPage() {
  // Refs
  const canvasRef    = useRef(null);
  const pdfCanvasRef = useRef(null);
  const textLayerRef = useRef(null);
  const fileInputRef = useRef(null);
  const textInputRef = useRef(null);
  const containerRef = useRef(null);
  const rulerHRef    = useRef(null);
  const rulerVRef    = useRef(null);

  // Text selection popup
  const [textSelectionPopup, setTextSelectionPopup] = useState(null);

  // PDF state
  const [pdfDoc,     setPdfDoc]     = useState(null);
  const [pageNum,    setPageNum]    = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pageThumb,  setPageThumb]  = useState([]);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [pdfLoaded,  setPdfLoaded]  = useState(false);
  const [editorInfo, setEditorInfo] = useState(null);

  // Tool state
  const [tool,       setTool]       = useState("select");
  const [openGroup,  setOpenGroup]  = useState(null);
  const [textSelectMode, setTextSelectMode] = useState(false);
  const [stampMode,  setStampMode]  = useState("APPROVED");
  const [color,      setColor]      = useState("#EF4444");
  const [strokeSize, setStroke]     = useState(2);
  const [fillColor,  setFill]       = useState("transparent");
  const [opacity,    setOpacity]    = useState(1);
  const [fontSize,   setFontSize]   = useState(14);
  const [fontFamily, setFontFamily] = useState("sans-serif");
  const [bold,       setBold]       = useState(false);
  const [italic,     setItalic]     = useState(false);

  // Canvas / view state
  const [zoom,      setZoom]      = useState(1);
  const [pan,       setPan]       = useState({ x: 0, y: 0 });
  const [panStart,  setPanStart]  = useState(null);
  const [snapGrid,  setSnapGrid]  = useState(false);
  const [showGrid,  setShowGrid]  = useState(true);
  const [showRuler, setShowRuler] = useState(true);
  const [mousePos,  setMousePos]  = useState({ x: 0, y: 0 });
  const [canvasSize] = useState({ w: 2000, h: 1400 });

  // Shapes state
  const [shapes,   setShapes]   = useState([]);
  const [selected, setSelected] = useState(null);
  const [history,  setHistory]  = useState([[]]);
  const [histIdx,  setHistIdx]  = useState(0);
  const [drawing,  setDrawing]  = useState(false);
  const [current,  setCurrent]  = useState(null);
  const [textEdit, setTextEdit] = useState(null);
  const [countNum, setCountNum] = useState(1);
  const [scale,    setScale]    = useState(1);

  // UI panels
  const [showLeftPanel,   setShowLeftPanel]   = useState(true);
  const [showRightPanel,  setShowRightPanel]  = useState(true);
  const [showBottomPanel, setShowBottomPanel] = useState(true);
  const [leftTab,  setLeftTab]  = useState("pages");
  const [rightTab, setRightTab] = useState("layers");
  const [markupSearch, setMarkupSearch] = useState("");
  const [markupFilter, setMarkupFilter] = useState("all");

  // Saving
  const [saving,  setSaving]  = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  // Author / session
  const [authorName, setAuthorName] = useState("Me");

  // Menu
  const [openMenu, setOpenMenu] = useState(null);

  // Recent files
  const [recentFiles, setRecentFiles] = useState(() => {
    try { return JSON.parse(localStorage.getItem("pc_recent_files")||"[]"); } catch { return []; }
  });

  // Modals
  const [showCombineModal,  setShowCombineModal]  = useState(false);
  const [showRecentModal,   setShowRecentModal]   = useState(false);
  const combineFileInputRef = useRef(null);
  const [combineFiles, setCombineFiles] = useState([]);
  const [combineOpts, setCombineOpts] = useState({
    bookmarks: true, attachments: false, docProps: true,
    layers: true, fileLabel: true,
  });
  const [combining, setCombining] = useState(false);

  // ── Print Modal State ────────────────────────────────────────────────────────
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printSettings, setPrintSettings] = useState({
    printerName: "Microsoft Print to PDF",
    toFile: false,
    pageRange: "all",
    customRange: "",
    paperSize: "letter",
    orientation: "portrait",
    autoRotate: true,
    printContent: "doc-markup",
    copies: 1,
    collate: true,
    reverse: false,
    rotation: "auto-90",
    pageScaling: "fit",
    scalePercent: 100,
    center: true,
    centerX: 0,
    centerY: 0,
    dimPageContent: false,
    dimFilteredMarkups: true,
    printSpaces: false,
    printHyperlinks: true,
    printGrayscale: false,
  });

  // Tool chest
  const [toolChest, setToolChest] = useState([
  {
    id: "my-tools",
    title: "My Tools",
    items: [
      { id: "mt-1", tool: "highlight", color: "#FDE047", size: 4, label: "Highlight 1", badge: "1" },
      { id: "mt-2", tool: "text", color: "#111827", size: 2, label: "Text Box", badge: "2" },
      { id: "mt-3", tool: "line", color: "#3B82F6", size: 2, label: "Blue Line", badge: "3" },
      { id: "mt-4", tool: "arrow", color: "#111827", size: 2, label: "Arrow", badge: "4" },
      { id: "mt-5", tool: "callout", color: "#EF4444", size: 2, label: "Callout", badge: "5" },
      { id: "mt-6", tool: "cloud", color: "#EF4444", size: 2, label: "Cloud", badge: "6" },
      { id: "mt-7", tool: "circle", color: "#3B82F6", size: 2, label: "Circle", badge: "7" },
      { id: "mt-8", tool: "comment", color: "#111827", size: 2, label: "Note", badge: "8" },
      { id: "mt-9", tool: "rect", color: "#6366F1", size: 2, label: "Rectangle", badge: "" },
    ],
  },
  {
    id: "recents",
    title: "Recents",
    items: [],
  },
  {
    id: "arquitecto",
    title: "Arquitecto revisor",
    items: [
      { id: "arq-1", tool: "callout", color: "#EF4444", size: 2, label: "Callout", badge: "" },
      { id: "arq-2", tool: "text", color: "#111827", size: 2, label: "Text", badge: "" },
      { id: "arq-3", tool: "highlight", color: "#FACC15", size: 4, label: "Highlight", badge: "" },
      { id: "arq-4", tool: "arrow", color: "#111827", size: 2, label: "Arrow", badge: "" },
      { id: "arq-5", tool: "stamp", color: "#EF4444", size: 2, label: "Stamp", badge: "1" },
      { id: "arq-6", tool: "cloud", color: "#EF4444", size: 2, label: "Cloud", badge: "" },
      { id: "arq-7", tool: "comment", color: "#111827", size: 2, label: "Note", badge: "" },
      { id: "arq-8", tool: "measure", color: "#EF4444", size: 2, label: "Measure", badge: "" },
      { id: "arq-9", tool: "spline", color: "#EF4444", size: 2, label: "Polyline", badge: "" },
    ],
  },
  {
    id: "contratista",
    title: "Contratista revisor",
    items: [
      { id: "con-1", tool: "callout", color: "#FACC15", size: 2, label: "Callout", badge: "" },
      { id: "con-2", tool: "text", color: "#111827", size: 2, label: "Text", badge: "" },
      { id: "con-3", tool: "highlight", color: "#FDE047", size: 4, label: "Highlight", badge: "" },
      { id: "con-4", tool: "measure", color: "#8B5CF6", size: 2, label: "Measure", badge: "" },
      { id: "con-5", tool: "stamp", color: "#FACC15", size: 2, label: "Stamp", badge: "" },
      { id: "con-6", tool: "cloud", color: "#F59E0B", size: 2, label: "Cloud", badge: "" },
      { id: "con-7", tool: "comment", color: "#111827", size: 2, label: "Note", badge: "" },
      { id: "con-8", tool: "arrow", color: "#F59E0B", size: 2, label: "Arrow", badge: "" },
      { id: "con-9", tool: "spline", color: "#8B5CF6", size: 2, label: "Polyline", badge: "" },
    ],
  },
  {
    id: "ingeniero",
    title: "Ingeniero revisor",
    items: [
      { id: "ing-1", tool: "callout", color: "#38BDF8", size: 2, label: "Callout", badge: "" },
      { id: "ing-2", tool: "text", color: "#111827", size: 2, label: "Text", badge: "" },
      { id: "ing-3", tool: "highlight", color: "#FDE047", size: 4, label: "Highlight", badge: "" },
      { id: "ing-4", tool: "measure", color: "#6366F1", size: 2, label: "Measure", badge: "" },
      { id: "ing-5", tool: "stamp", color: "#3B82F6", size: 2, label: "Stamp", badge: "1" },
      { id: "ing-6", tool: "cloud", color: "#3B82F6", size: 2, label: "Cloud", badge: "" },
      { id: "ing-7", tool: "comment", color: "#111827", size: 2, label: "Note", badge: "" },
      { id: "ing-8", tool: "spline", color: "#F97316", size: 2, label: "Polyline", badge: "" },
      { id: "ing-9", tool: "line", color: "#4F46E5", size: 2, label: "Line", badge: "" },
    ],
  },
]);

const [toolChestOpen, setToolChestOpen] = useState({
  "my-tools": true,
  "recents": true,
  "arquitecto": true,
  "contratista": true,
  "ingeniero": true,
});

function applyToolChestItem(item) {
  setTool(item.tool);
  setColor(item.color || "#EF4444");
  setStroke(item.size || 2);

  if (item.tool === "stamp") {
    setStampMode("REVIEWED");
  }
}



  // ── Snap helper ──────────────────────────────────────────────────────────────
  function snap(val) {
    if (!snapGrid) return val;
    const gs = 20;
    return Math.round(val / gs) * gs;
  }

  // ── Load PDF ─────────────────────────────────────────────────────────────────
  async function loadPdfFromUrl(url) {
    setLoadingPdf(true);
    setPageThumb([]);
    setPdfLoaded(false);
    try {
      const lib = await loadPdfJs();
      const pdf = await lib.getDocument(url).promise;
      const numPgs = pdf.numPages;
      setPdfDoc(pdf);
      setTotalPages(numPgs);
      setPageNum(1);
      const { width: pw, height: ph } = await renderPage(pdf, 1, pdfCanvasRef.current);
      const pg1   = await pdf.getPage(1);
      const dpr1  = window.devicePixelRatio || 1;
      const vp1   = pg1.getViewport({ scale: 2.5 * dpr1 });
      await renderTextLayer(pdf, 1, textLayerRef.current, vp1);
      setPdfLoaded(true);
      setZoom(1); setPan({ x: 0, y: 0 });
      if (editorInfo) addRecentFile(editorInfo);

      const thumbs = [];
      const limit  = Math.min(numPgs, 30);
      for (let i = 1; i <= limit; i++) {
        const pg = await pdf.getPage(i);
        const vp = pg.getViewport({ scale: 0.12 });
        const c  = document.createElement("canvas");
        c.width = vp.width; c.height = vp.height;
        await pg.render({ canvasContext: c.getContext("2d"), viewport: vp }).promise;
        thumbs.push(c.toDataURL());
      }
      setPageThumb(thumbs.slice(0, numPgs));
    } catch(e) { console.error("PDF error:", e); }
    finally { setLoadingPdf(false); }
  }

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("plano_editor");
      if (!raw) return;
      const info = JSON.parse(raw);
      setEditorInfo(info);
      if (info.urlArchivo) loadPdfFromUrl(info.urlArchivo);
    } catch(e) { console.error(e); }
  }, []);

  // ── Page navigation ──────────────────────────────────────────────────────────
  async function goToPage(n) {
    if (!pdfDoc || n < 1 || n > totalPages) return;
    setPageNum(n);
    setLoadingPdf(true);
    await renderPage(pdfDoc, n, pdfCanvasRef.current);
    const pgN  = await pdfDoc.getPage(n);
    const dprN = window.devicePixelRatio || 1;
    const vpN  = pgN.getViewport({ scale: 2.5 * dprN });
    await renderTextLayer(pdfDoc, n, textLayerRef.current, vpN);
    setLoadingPdf(false);
  }

  // ── Redraw ───────────────────────────────────────────────────────────────────
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (showGrid) {
      ctx.save();
      ctx.strokeStyle = "#1e293b"; ctx.lineWidth = 0.4;
      const gs = 40*zoom, ox = pan.x%gs, oy = pan.y%gs;
      for (let x = ox; x < canvas.width;  x += gs) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,canvas.height); ctx.stroke(); }
      for (let y = oy; y < canvas.height; y += gs) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(canvas.width,y);  ctx.stroke(); }
      ctx.restore();
    }

    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);
    [...shapes, current].filter(Boolean).forEach(s => drawShape(ctx, s, selected === s.id));
    ctx.restore();

    if (showRuler) drawRulers();
  }, [shapes, current, zoom, pan, selected, showGrid, showRuler]);

  useEffect(() => { redraw(); }, [redraw]);

  function drawRulers() {
    const hc = rulerHRef.current, vc = rulerVRef.current;
    if (!hc || !vc) return;
    const hCtx = hc.getContext("2d"), vCtx = vc.getContext("2d");
    hCtx.clearRect(0,0,hc.width,hc.height);
    vCtx.clearRect(0,0,vc.width,vc.height);
    hCtx.fillStyle = "#1e293b"; vCtx.fillStyle = "#1e293b";
    const step = 40 * zoom;
    const startX = -(pan.x / step) * step + pan.x % step;

    hCtx.fillStyle = "#334155"; hCtx.font = "9px monospace"; hCtx.textAlign = "center";
    for (let x = startX; x < hc.width; x += step) {
      const label = Math.round((x - pan.x) / zoom / 40);
      hCtx.fillStyle = "#94a3b8";
      hCtx.fillRect(x, hc.height-6, 1, 6);
      if (label % 2 === 0) { hCtx.fillStyle = "#64748b"; hCtx.fillText(label, x, hc.height-8); }
    }
    vCtx.fillStyle = "#94a3b8"; vCtx.font = "9px monospace"; vCtx.textAlign = "right";
    for (let y = startX; y < vc.height; y += step) {
      const label = Math.round((y - pan.y) / zoom / 40);
      vCtx.fillRect(vc.width-6, y, 6, 1);
      if (label % 2 === 0) { vCtx.save(); vCtx.translate(10, y); vCtx.rotate(-Math.PI/2); vCtx.fillStyle="#64748b"; vCtx.fillText(label,0,0); vCtx.restore(); }
    }
  }

  // ── Coords ───────────────────────────────────────────────────────────────────
  function getCoords(e) {
    const r = canvasRef.current.getBoundingClientRect();
    return {
      x: snap((e.clientX - r.left - pan.x) / zoom),
      y: snap((e.clientY - r.top  - pan.y) / zoom),
    };
  }

  // ── Mouse handlers ───────────────────────────────────────────────────────────
  function onMouseDown(e) {
    if (e.button !== 0) return;
    setOpenMenu(null); setOpenGroup(null);
    setTextSelectionPopup(null);
    window.getSelection()?.removeAllRanges();
    const { x, y } = getCoords(e);

    if (tool === "pan") { setPanStart({ x: e.clientX-pan.x, y: e.clientY-pan.y }); return; }
    if (tool === "comment") {
      const text = prompt("Note text:");
      if (text) pushShape({ id: Date.now(), type:"comment", x1:x, y1:y, text, color, opacity });
      return;
    }
    if (tool === "stamp") {
      pushShape({ id: Date.now(), type:"stamp", x1:x, y1:y, text:stampMode, color, opacity });
      return;
    }
    if (tool === "count") {
      pushShape({ id: Date.now(), type:"count", x1:x, y1:y, color, opacity, countNum, scale });
      setCountNum(n => n+1);
      return;
    }
    if (tool === "calibrate") {
      const v = prompt("Enter scale (meters per grid square):", scale);
      if (v && !isNaN(v)) setScale(Number(v));
      return;
    }
    if (tool === "eraser") {
      const hit = shapes.slice().reverse().find(s => hitTest(s, x, y));
      if (hit) { const ns = shapes.filter(s=>s.id!==hit.id); setShapes(ns); pushHistory(ns); }
      return;
    }
    if (tool === "text") { setTextEdit({x,y}); setTimeout(()=>textInputRef.current?.focus(),50); return; }
    if (tool === "flag") {
      const text = prompt("Flag label (optional):", "");
      pushShape({ id:Date.now(), type:"flag", x1:x, y1:y, text:text||"", color, opacity });
      return;
    }
    if (tool === "select") {
      const hit = shapes.slice().reverse().find(s => hitTest(s, x, y));
      setSelected(hit?.id || null);
      return;
    }
    if (tool === "callout") {
      const text = prompt("Callout text:", "");
      if (text !== null) {
        setDrawing(true);
        setCurrent({ id:Date.now(), type:"callout", x1:x, y1:y, x2:x+60, y2:y+40, text, color, fill:"#FFFDE7", size:strokeSize, opacity, fontSize });
      }
      return;
    }

    setDrawing(true);
    const base = { id:Date.now(), color, fill:fillColor, size:strokeSize, opacity, scale, fontSize, fontFamily, bold, italic };
    if (["pen","perimeter","spline"].includes(tool))
      setCurrent({ ...base, type:tool, points:[{x,y}] });
    else
      setCurrent({ ...base, type:tool, x1:x, y1:y, x2:x, y2:y });
    if (["dim_horiz","dim_vert","radius_dim","diameter_dim"].includes(tool))
      setCurrent({ ...base, type:tool, x1:x, y1:y, x2:x, y2:y });
  }

  function onMouseMove(e) {
    const r = canvasRef.current?.getBoundingClientRect();
    if (r) setMousePos({ x: Math.round((e.clientX-r.left-pan.x)/zoom), y: Math.round((e.clientY-r.top-pan.y)/zoom) });

    if (tool === "pan" && panStart) { setPan({ x:e.clientX-panStart.x, y:e.clientY-panStart.y }); return; }
    if (!drawing || !current) return;
    const {x,y} = getCoords(e);
    if (["pen","perimeter","spline"].includes(tool))
      setCurrent(c => ({ ...c, points:[...c.points,{x,y}] }));
    else
      setCurrent(c => ({ ...c, x2:x, y2:y }));
  }

  function onMouseUp() {
    if (tool === "pan") { setPanStart(null); return; }
    if (!drawing || !current) return;
    setDrawing(false);
    pushShape(current);
    setCurrent(null);
  }

  function pushShape(shape) {
    const enriched = { ...shape, author: authorName, createdAt: new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"}), page: pageNum };
    const ns = [...shapes, enriched];
    setShapes(ns); pushHistory(ns);
  }

  function pushHistory(ns) {
    const nh = history.slice(0, histIdx+1);
    setHistory([...nh, ns]); setHistIdx(nh.length);
  }

  // ── PDF Text layer ───────────────────────────────────────────────────────────
  function handleTextLayerMouseUp(e) {
    setTimeout(() => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || !sel.toString().trim()) {
        setTextSelectionPopup(null);
        return;
      }
      const selectedText = sel.toString().trim();
      const range = sel.getRangeAt(0);
      const rect  = range.getBoundingClientRect();
      setTextSelectionPopup({
        x: rect.left + rect.width / 2,
        y: rect.top - 8,
        text: selectedText,
        rect,
      });
    }, 10);
  }

  function createTextHighlight(selText, action) {
    if (!textSelectionPopup) return;
    const sel   = window.getSelection();
    const range = sel?.getRangeAt(0);
    const rect  = range ? range.getBoundingClientRect() : textSelectionPopup.rect;
    const container = containerRef.current?.getBoundingClientRect();
    if (!container) return;
    const rulerOff = showRuler ? 18 : 0;

    const x1 = (rect.left  - container.left - pan.x - rulerOff) / zoom;
    const y1 = (rect.top   - container.top  - pan.y - rulerOff) / zoom;
    const x2 = (rect.right - container.left - pan.x - rulerOff) / zoom;
    const y2 = (rect.bottom- container.top  - pan.y - rulerOff) / zoom;

    if (action === "highlight") {
      pushShape({ id: Date.now(), type: "text_highlight", x1, y1, x2, y2, text: selText, color, opacity: 0.4, size: 1 });
    } else if (action === "strikeout") {
      pushShape({ id: Date.now(), type: "text_strikeout", x1, y1, x2, y2, text: selText, color: "#EF4444", opacity: 1, size: 2 });
    } else if (action === "underline") {
      pushShape({ id: Date.now(), type: "text_underline", x1, y1, x2, y2, text: selText, color, opacity: 1, size: 2 });
    } else if (action === "note") {
      pushShape({ id: Date.now(), type: "comment", x1, y1, x2: x1, y2: y1, text: selText, color: "#F59E0B", opacity: 1, size: 2 });
    } else if (action === "copy") {
      navigator.clipboard.writeText(selText).catch(()=>{});
    }

    window.getSelection()?.removeAllRanges();
    setTextSelectionPopup(null);
  }

  function undo() { if (histIdx<=0) return; const i=histIdx-1; setHistIdx(i); setShapes(history[i]); }
  function redo() { if (histIdx>=history.length-1) return; const i=histIdx+1; setHistIdx(i); setShapes(history[i]); }

  function deleteSelected() {
    if (!selected) return;
    const ns = shapes.filter(s=>s.id!==selected);
    setShapes(ns); pushHistory(ns); setSelected(null);
  }

  function hitTest(s, x, y) {
    const pad = 12;
    if (s.type==="pen"||s.type==="spline"||s.type==="perimeter")
      return s.points?.some(p=>Math.hypot(p.x-x,p.y-y)<pad);
    if (s.type==="count"||s.type==="stamp"||s.type==="comment"||s.type==="flag")
      return Math.hypot((s.x1||0)-x,(s.y1||0)-y)<24;
    return x>=Math.min(s.x1||0,s.x2||0)-pad && x<=Math.max(s.x1||0,s.x2||0)+pad &&
           y>=Math.min(s.y1||0,s.y2||0)-pad && y<=Math.max(s.y1||0,s.y2||0)+pad;
  }

  function submitText(text) {
    if (!text?.trim()||!textEdit) { setTextEdit(null); return; }
    pushShape({ id:Date.now(), type:"text", x1:textEdit.x, y1:textEdit.y, text, color, size:strokeSize, opacity, fontSize, fontFamily, bold, italic });
    setTextEdit(null);
  }

  // ── Export ───────────────────────────────────────────────────────────────────
  function exportPNG() {
    const m = document.createElement("canvas");
    m.width = canvasSize.w; m.height = canvasSize.h;
    const ctx = m.getContext("2d");
    if (pdfLoaded) ctx.drawImage(pdfCanvasRef.current, 0, 0);
    ctx.drawImage(canvasRef.current, 0, 0);
    const a = document.createElement("a");
    a.download = `${editorInfo?.fileName||"blueprint"}-annotated.png`;
    a.href = m.toDataURL(); a.click();
  }

  async function saveAnnotations() {
    if (!editorInfo?.fileId) { setSaveMsg("No file linked"); setTimeout(()=>setSaveMsg(""),2500); return; }
    setSaving(true);
    try {
      const m = document.createElement("canvas");
      m.width = canvasSize.w; m.height = canvasSize.h;
      const ctx = m.getContext("2d");
      if (pdfLoaded) ctx.drawImage(pdfCanvasRef.current,0,0);
      ctx.drawImage(canvasRef.current,0,0);
      const blob = await new Promise(res=>m.toBlob(res,"image/png"));
      const form = new FormData();
      form.append("anotaciones",blob,`blueprint-${Date.now()}.png`);
      form.append("shapes",JSON.stringify(shapes));
      const res = await fetch(`/api/planes/documentos/${editorInfo.fileId}/anotaciones`,{method:"POST",body:form});
      setSaveMsg(res.ok?"✓ Saved":"Save failed");
    } catch(e) { setSaveMsg("Error: "+e.message); }
    finally { setSaving(false); setTimeout(()=>setSaveMsg(""),3000); }
  }

  function saveAs() {
    const merged = document.createElement("canvas");
    merged.width = canvasSize.w; merged.height = canvasSize.h;
    const ctx = merged.getContext("2d");
    if (pdfLoaded) ctx.drawImage(pdfCanvasRef.current, 0, 0);
    ctx.drawImage(canvasRef.current, 0, 0);
    const name = prompt("Save file as:", editorInfo?.fileName?.replace(/\.pdf$/i,"") || "blueprint");
    if (!name) return;
    const a = document.createElement("a");
    a.download = `${name}-annotated.png`;
    a.href = merged.toDataURL(); a.click();
    setSaveMsg("✓ Saved as " + name);
    setTimeout(() => setSaveMsg(""), 3000);
  }

  async function exportPDF() {
    setSaveMsg("Preparing export...");
    await new Promise(r => setTimeout(r, 100));
    exportPNG();
    setSaveMsg("✓ Exported (PNG format)");
    setTimeout(() => setSaveMsg(""), 3000);
  }

  async function sendEmail() {
    const merged = document.createElement("canvas");
    merged.width = canvasSize.w; merged.height = canvasSize.h;
    const ctx = merged.getContext("2d");
    if (pdfLoaded) ctx.drawImage(pdfCanvasRef.current, 0, 0);
    ctx.drawImage(canvasRef.current, 0, 0);
    const fileName = editorInfo?.fileName || "blueprint-annotated.png";
    const subject  = encodeURIComponent(`Blueprint: ${editorInfo?.projectName || fileName}`);
    const body     = encodeURIComponent(
      `Please find attached the annotated blueprint: ${fileName}\n\nProject: ${editorInfo?.projectName || "—"}\nMarkups: ${shapes.length}\nExported from Project Center Blueprint Editor`
    );
    merged.toBlob(blob => {
      const url = URL.createObjectURL(blob);
      const a   = document.createElement("a");
      a.href = url; a.download = fileName.replace(/\.pdf$/i,"")+"-annotated.png";
      a.click();
      URL.revokeObjectURL(url);
      setTimeout(() => { window.location.href = `mailto:?subject=${subject}&body=${body}`; }, 500);
    }, "image/png");
    setSaveMsg("✓ File downloaded — attach it to your email");
    setTimeout(() => setSaveMsg(""), 4000);
  }

  // ── Print ─────────────────────────────────────────────────────────────────────
  function printDocument() {
    setShowPrintModal(true);
  }

  function executePrint() {
    const PAPER_SIZES_MAP = {
      "letter":  { w: 215.9, h: 279.4 },
      "legal":   { w: 215.9, h: 355.6 },
      "tabloid": { w: 279.4, h: 431.8 },
      "arch-c":  { w: 457.2, h: 609.6 },
      "arch-d":  { w: 609.6, h: 914.4 },
      "arch-e":  { w: 914.4, h: 1219.2 },
      "a4":      { w: 210,   h: 297 },
      "a3":      { w: 297,   h: 420 },
      "a2":      { w: 420,   h: 594 },
      "a1":      { w: 594,   h: 841 },
      "a0":      { w: 841,   h: 1189 },
    };

    const merged = document.createElement("canvas");
    merged.width  = canvasSize.w;
    merged.height = canvasSize.h;
    const ctx = merged.getContext("2d");
    if (printSettings.printGrayscale) ctx.filter = "grayscale(1)";
    if (pdfLoaded) ctx.drawImage(pdfCanvasRef.current, 0, 0);
    if (printSettings.printContent !== "doc-only") ctx.drawImage(canvasRef.current, 0, 0);

    const imgData = merged.toDataURL("image/png");
    const paper   = PAPER_SIZES_MAP[printSettings.paperSize] || PAPER_SIZES_MAP["letter"];
    const isLand  = printSettings.orientation === "landscape";
    const pw = isLand ? paper.h : paper.w;
    const ph = isLand ? paper.w : paper.h;

    const scaleCss = printSettings.pageScaling === "fit"
      ? "max-width:100%; max-height:100vh; object-fit:contain;"
      : printSettings.pageScaling === "custom"
        ? `width:${printSettings.scalePercent}%;`
        : "max-width:100%; height:auto;";

    const win = window.open("", "_blank");
    if (!win) { alert("Allow popups to print."); return; }

    win.document.write(`<!DOCTYPE html><html>
      <head>
        <title>${editorInfo?.fileName || "Blueprint"} — Print</title>
        <style>
          @page { size: ${pw}mm ${ph}mm; margin: ${printSettings.center ? "auto" : "10mm"}; }
          body { margin:0; padding:0; background:#fff; display:flex; align-items:center; justify-content:center; min-height:100vh; }
          img  { ${scaleCss} ${printSettings.printGrayscale ? "filter:grayscale(1);" : ""} display:block; }
          @media print { body { margin:0; } }
        </style>
      </head>
      <body>
        <img src="${imgData}" onload="window.print(); window.close();"/>
      </body>
    </html>`);
    win.document.close();
    setShowPrintModal(false);
    setSaveMsg("✓ Sent to printer");
    setTimeout(() => setSaveMsg(""), 3000);
  }

  // ── Add recent file ───────────────────────────────────────────────────────────
  function addRecentFile(info) {
    if (!info?.fileName) return;
    const entry = { fileName: info.fileName, projectName: info.projectName, urlArchivo: info.urlArchivo, fileId: info.fileId, openedAt: new Date().toLocaleString() };
    const updated = [entry, ...recentFiles.filter(f => f.fileId !== info.fileId)].slice(0, 10);
    setRecentFiles(updated);
    try { localStorage.setItem("pc_recent_files", JSON.stringify(updated)); } catch {}
  }

  // ── Combine files ─────────────────────────────────────────────────────────────
  function combineAddFiles(files) {
    const newEntries = Array.from(files).map(f => ({
      id: Date.now() + Math.random(),
      file: f, name: f.name, path: f.name, pages: "—",
      size: (f.size / 1024).toFixed(1) + " KB",
    }));
    newEntries.forEach(async entry => {
      try {
        const url = URL.createObjectURL(entry.file);
        const lib = await loadPdfJs();
        const pdf = await lib.getDocument(url).promise;
        entry.pages = pdf.numPages;
        URL.revokeObjectURL(url);
        setCombineFiles(cf => cf.map(f => f.id === entry.id ? { ...f, pages: pdf.numPages } : f));
      } catch {}
    });
    setCombineFiles(cf => [...cf, ...newEntries]);
  }

  function combineRemove(id) { setCombineFiles(cf => cf.filter(f => f.id !== id)); }

  function combineMove(id, dir) {
    setCombineFiles(cf => {
      const idx = cf.findIndex(f => f.id === id);
      if (idx < 0) return cf;
      const newIdx = idx + dir;
      if (newIdx < 0 || newIdx >= cf.length) return cf;
      const arr = [...cf];
      [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
      return arr;
    });
  }

  async function combineOK() {
    if (combineFiles.length < 2) { alert("Add at least 2 PDF files to combine."); return; }
    setCombining(true);
    setSaveMsg("Combining files...");
    try {
      const lib = await loadPdfJs();
      const merged = document.createElement("canvas");
      const ctx = merged.getContext("2d");
      let totalW = 0, totalH = 0;
      const rendered = [];

      for (const entry of combineFiles) {
        const url = URL.createObjectURL(entry.file);
        const pdf = await lib.getDocument(url).promise;
        for (let p = 1; p <= pdf.numPages; p++) {
          const page = await pdf.getPage(p);
          const vp = page.getViewport({ scale: 1.5 });
          const c = document.createElement("canvas");
          c.width = vp.width; c.height = vp.height;
          await page.render({ canvasContext: c.getContext("2d"), viewport: vp }).promise;
          rendered.push({ canvas: c, label: combineOpts.fileLabel ? entry.name : null });
          totalW = Math.max(totalW, vp.width);
          totalH += vp.height + (combineOpts.fileLabel ? 24 : 0);
        }
        URL.revokeObjectURL(url);
      }

      merged.width = totalW; merged.height = totalH;
      ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, totalW, totalH);
      let y = 0;
      rendered.forEach(({ canvas, label }) => {
        if (label) {
          ctx.fillStyle = "#1e293b"; ctx.fillRect(0, y, totalW, 22);
          ctx.fillStyle = "#94a3b8"; ctx.font = "11px monospace";
          ctx.fillText(label, 8, y + 15); y += 24;
        }
        ctx.drawImage(canvas, 0, y); y += canvas.height;
      });

      const a = document.createElement("a");
      a.download = "combined-document.png";
      a.href = merged.toDataURL("image/png"); a.click();
      setSaveMsg("✓ Combined file downloaded");
      setShowCombineModal(false);
    } catch(e) { setSaveMsg("Combine error: " + e.message); }
    finally { setCombining(false); setTimeout(() => setSaveMsg(""), 4000); }
  }

  function newDocument() {
    if (shapes.length > 0 && !confirm("Discard current markups and start new?")) return;
    setShapes([]); pushHistory([]);
    setPdfLoaded(false); setPdfDoc(null); setTotalPages(0); setPageThumb([]);
    setEditorInfo(null); setZoom(1); setPan({ x: 0, y: 0 });
    if (pdfCanvasRef.current) {
      const ctx = pdfCanvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, pdfCanvasRef.current.width, pdfCanvasRef.current.height);
    }
    setSaveMsg("New document created");
    setTimeout(() => setSaveMsg(""), 2000);
  }

  // ── Keyboard ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName==="INPUT"||e.target.tagName==="TEXTAREA") return;
      if (e.ctrlKey&&e.key==="z") { e.preventDefault(); undo(); }
      if (e.ctrlKey&&e.key==="y") { e.preventDefault(); redo(); }
      if (e.ctrlKey&&e.key==="s") { e.preventDefault(); saveAnnotations(); }
      if (e.ctrlKey&&e.key==="p") { e.preventDefault(); setShowPrintModal(true); }
      if (e.key==="Delete"||e.key==="Backspace") deleteSelected();
      if (e.key==="v"||e.key==="V") setTool("select");
      if (e.key==="h"||e.key==="H") setTool("pan");
      if (e.key==="p"||e.key==="P") setTool("pen");
      if (e.key==="l"||e.key==="L") setTool("line");
      if (e.key==="r"||e.key==="R") setTool("rect");
      if (e.key==="c"||e.key==="C") setTool("circle");
      if (e.key==="t"||e.key==="T") setTool("text");
      if (e.key==="m"||e.key==="M") setTool("measure");
      if (e.key==="e"||e.key==="E") setTool("eraser");
      if (e.key==="x"||e.key==="X") setTool("stamp");
      if (e.key==="a"||e.key==="A") setTool("arrow");
      if (e.key==="i"||e.key==="I") setTool("highlight");
      if (e.key==="y"||e.key==="Y") setTool("spline");
      if (e.key==="k"||e.key==="K") setTool("count");
      if (e.key==="u"||e.key==="U") setTool("callout");
      if (e.key==="f"||e.key==="F") setTool("flag");
      if (e.key==="=" || e.key==="+") setZoom(z=>Math.min(8,z+0.25));
      if (e.key==="-") setZoom(z=>Math.max(0.1,z-0.25));
      if (e.key==="0") { setZoom(1); setPan({x:0,y:0}); }
      if (e.key==="Escape") { setSelected(null); setTextEdit(null); setOpenMenu(null); setShowPrintModal(false); }
    };
    window.addEventListener("keydown",handler);
    return ()=>window.removeEventListener("keydown",handler);
  },[selected,shapes,histIdx,history]);

  // ── Wheel ────────────────────────────────────────────────────────────────────
  useEffect(()=>{
    const el = canvasRef.current; if (!el) return;
    const h = (e)=>{
      e.preventDefault();
      if (e.ctrlKey||e.metaKey) setZoom(z=>Math.min(8,Math.max(0.1,z*(e.deltaY>0?0.9:1.1))));
      else setPan(p=>({ x:p.x-(e.shiftKey?e.deltaY:e.deltaX), y:p.y-(e.shiftKey?0:e.deltaY) }));
    };
    el.addEventListener("wheel",h,{passive:false});
    return ()=>el.removeEventListener("wheel",h);
  },[]);
  useEffect(()=>{
    const h=(e)=>{ if(e.ctrlKey||e.metaKey) e.preventDefault(); };
    window.addEventListener("wheel",h,{passive:false});
    return ()=>window.removeEventListener("wheel",h);
  },[]);

  async function handlePDF(e) {
    const file = e.target.files[0];
    if (!file||file.type!=="application/pdf") return;
    const url = URL.createObjectURL(file);
    await loadPdfFromUrl(url);
  }

  function handleMenuAction(action) {
    setOpenMenu(null);
    if (action?.startsWith("tool:")) { setTool(action.replace("tool:","")); return; }
    if (action==="New")             newDocument();
    if (action==="Open PDF")        fileInputRef.current?.click();
    if (action==="Open Recent")     setShowRecentModal(true);
    if (action==="Save")            saveAnnotations();
    if (action==="Save As")         saveAs();
    if (action==="Export PNG")      exportPNG();
    if (action==="Export PDF")      exportPDF();
    if (action==="Send Email")      sendEmail();
    if (action==="Print")           setShowPrintModal(true);
    if (action==="Combine Files")   setShowCombineModal(true);
    if (action==="Close")           window.close();
    if (action==="Close All")       { if(confirm("Close all and exit?")) window.close(); }
    if (action==="Undo")            undo();
    if (action==="Redo")            redo();
    if (action==="Delete")          deleteSelected();
    if (action==="Select All")      setSelected(shapes[shapes.length-1]?.id);
    if (action==="Deselect")        setSelected(null);
    if (action==="Clear All")       { if(confirm("Delete all markups?")){ setShapes([]); pushHistory([]); } }
    if (action==="Zoom In")         setZoom(z=>Math.min(8,z+0.25));
    if (action==="Zoom Out")        setZoom(z=>Math.max(0.1,z-0.25));
    if (action==="Fit Page")        { setZoom(1); setPan({x:0,y:0}); }
    if (action==="Fit Width")       { setZoom(1.2); setPan({x:0,y:0}); }
    if (action==="Show Grid")       setShowGrid(v=>!v);
    if (action==="Snap to Grid")    setSnapGrid(v=>!v);
    if (action==="Rulers")          setShowRuler(v=>!v);
    if (action==="Left Panel")      setShowLeftPanel(v=>!v);
    if (action==="Right Panel")     setShowRightPanel(v=>!v);
    if (action==="Markups List")    setShowBottomPanel(v=>!v);
    if (action==="Tool Chest")      { setShowLeftPanel(true); setLeftTab("toolchest"); }
    if (action==="Layers")          { setShowRightPanel(true); setRightTab("layers"); }
    if (action==="Pages")           { setShowLeftPanel(true); setLeftTab("pages"); }
    if (action==="Toggle Text Select") setTextSelectMode(v=>!v);
    if (action==="Calibrate Scale") { const v=prompt("Meters per grid square:",scale); if(v&&!isNaN(v)) setScale(Number(v)); }
    if (action==="Keyboard Shortcuts") alert(
      "V = Select  H = Pan  P = Pen  L = Line  A = Arrow\n" +
      "R = Rectangle  C = Ellipse  T = Text  I = Highlight\n" +
      "M = Linear Dim  J = Horiz Dim  Z = Vert Dim\n" +
      "Q = Area  W = Perimeter  K = Count  X = Stamp\n" +
      "U = Callout  E = Eraser  F = Flag  Y = Polyline\n" +
      "Ctrl+Z = Undo  Ctrl+Y = Redo  Ctrl+S = Save  Ctrl+P = Print\n" +
      "Del = Delete selected  Esc = Deselect\n" +
      "Ctrl+Scroll = Zoom  Scroll = Pan"
    );
    if (action==="About") alert("Project Center Blueprint Editor\nBuilt with PDF.js + React\n© Project Center");
  }

  const cursorStyle = tool==="pan"?"grab": tool==="text"?"text": tool==="eraser"?"cell":"crosshair";
  const selectedShape = shapes.find(s=>s.id===selected);
  const filteredMarkups = shapes.filter(s => {
    const matchSearch = markupSearch ? (s.type+s.text||"").toLowerCase().includes(markupSearch.toLowerCase()) : true;
    const matchFilter = markupFilter==="all" || s.type===markupFilter;
    return matchSearch && matchFilter;
  });
  const MARKUP_TYPES = ["all",...new Set(shapes.map(s=>s.type))];

  // ── Print Modal helpers ──────────────────────────────────────────────────────
  const PRINT_PAPER_SIZES = [
    { value: "letter",  label: 'Letter (8.5" × 11")',   sub: "21,59 × 27,94 cm" },
    { value: "legal",   label: 'Legal (8.5" × 14")',    sub: "21,59 × 35,56 cm" },
    { value: "tabloid", label: 'Tabloid (11" × 17")',   sub: "27,94 × 43,18 cm" },
    { value: "arch-c",  label: 'Arch C (18" × 24")',    sub: "45,72 × 60,96 cm" },
    { value: "arch-d",  label: 'Arch D (24" × 36")',    sub: "60,96 × 91,44 cm" },
    { value: "arch-e",  label: 'Arch E (36" × 48")',    sub: "91,44 × 121,92 cm" },
    { value: "a4",      label: "A4 (210 × 297 mm)",     sub: "21,0 × 29,7 cm" },
    { value: "a3",      label: "A3 (297 × 420 mm)",     sub: "29,7 × 42,0 cm" },
    { value: "a2",      label: "A2 (420 × 594 mm)",     sub: "42,0 × 59,4 cm" },
    { value: "a1",      label: "A1 (594 × 841 mm)",     sub: "59,4 × 84,1 cm" },
    { value: "a0",      label: "A0 (841 × 1189 mm)",    sub: "84,1 × 118,9 cm" },
  ];
  const PRINT_ROTATIONS = [
    { value: "none",    label: "None" },
    { value: "auto-90", label: "Auto Rotate 90" },
    { value: "auto",    label: "Auto Rotate" },
    { value: "cw-90",   label: "Rotate 90° CW" },
    { value: "ccw-90",  label: "Rotate 90° CCW" },
    { value: "180",     label: "Rotate 180°" },
  ];
  const PRINT_SCALINGS = [
    { value: "fit",     label: "Fit to Paper" },
    { value: "shrink",  label: "Shrink to Paper" },
    { value: "none",    label: "Actual Size" },
    { value: "custom",  label: "Custom Scale" },
    { value: "tile",    label: "Tile Large Pages" },
    { value: "booklet", label: "Booklet" },
  ];
  const PRINT_PRINTERS = [
    "Microsoft Print to PDF",
    "Adobe PDF",
    "HP LaserJet",
    "Brother Printer",
    "Fax",
  ];
  const setPrint = (key, val) => setPrintSettings(p => ({ ...p, [key]: val }));

  return (
    <div className="flex flex-col h-screen bg-[#1a1f2e] overflow-hidden select-none text-slate-200">

      {/* Loading overlay */}
      {loadingPdf && (
        <div className="absolute inset-0 z-50 bg-[#1a1f2e]/90 flex flex-col items-center justify-center gap-3">
          <Loader2 size={36} className="animate-spin text-cyan-500"/>
          <p className="text-slate-300 text-sm">Loading PDF...</p>
        </div>
      )}

      {/* ── Menu bar ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center h-8 bg-[#0f1117] border-b border-slate-800 px-2 shrink-0 z-40"
        onClick={()=>setOpenMenu(null)}>
        <div className="flex items-center gap-1.5 px-2 mr-2 border-r border-slate-700">
          <div className="w-4 h-4 bg-cyan-600 rounded-sm flex items-center justify-center">
            <FileText size={10} className="text-white"/>
          </div>
          <span className="text-[11px] font-bold text-cyan-400 tracking-wide">REVU</span>
        </div>

        {MENU_ITEMS.map(menu => (
          <div key={menu.label} className="relative">
            <button onClick={e=>{ e.stopPropagation(); setOpenMenu(openMenu===menu.label?null:menu.label); }}
              className={`px-3 h-8 text-xs hover:bg-slate-700 transition ${openMenu===menu.label?"bg-slate-700 text-white":"text-slate-300"}`}>
              {menu.label}
            </button>
            {openMenu===menu.label && (
              <div className="absolute top-8 left-0 bg-[#1e2535] border border-slate-700 rounded-lg shadow-2xl py-1 z-50 min-w-[180px]"
                onClick={e=>e.stopPropagation()}>
                {menu.items.map((item,i) =>
                  item==="---"
                    ? <div key={i} className="border-t border-slate-700 my-1"/>
                    : <button key={item.action||i} onClick={()=>handleMenuAction(item.action)}
                        className={`w-full text-left px-4 py-1.5 text-xs hover:bg-slate-600 hover:text-white transition flex items-center justify-between gap-6
                          ${item.action?.startsWith("tool:") && tool===item.action.replace("tool:","") ? "text-cyan-400 bg-slate-700/40" : "text-slate-300"}
                          ${item.action==="Toggle Text Select" && textSelectMode ? "text-cyan-400" : ""}
                          ${item.action==="Print" ? "font-medium" : ""}
                        `}>
                        <span>{item.label}</span>
                        {item.shortcut && <kbd className="text-[9px] text-slate-600 bg-slate-800 px-1.5 py-0.5 rounded font-mono">{item.shortcut}</kbd>}
                      </button>
                )}
              </div>
            )}
          </div>
        ))}

        <div className="flex-1"/>
        <div className="text-[11px] text-slate-400 mr-3 truncate max-w-xs">
          {editorInfo?.fileName || "Blueprint Editor"} {editorInfo?.projectName ? `— ${editorInfo.projectName}` : ""}
        </div>
        {pdfLoaded && <span className="text-[10px] bg-cyan-900/50 text-cyan-400 px-2 py-0.5 rounded border border-cyan-800 mr-2">PDF ✓ {totalPages}p</span>}
        {saveMsg && <span className="text-xs text-emerald-400 mr-2">{saveMsg}</span>}
        <button onClick={()=>window.close()} className="text-slate-500 hover:text-red-400 px-2 h-8 text-xs transition">✕ Close</button>
      </div>

      {/* ── Ribbon Toolbar ────────────────────────────────────────────────────── */}
      <div className="flex flex-col shrink-0">
        <div className="flex items-center h-9 bg-[#161b27] border-b border-slate-800/50 px-2 gap-0.5">
          {/* File group */}
          <div className="flex items-center gap-0.5 px-1 border-r border-slate-800 mr-1">
            <button onClick={()=>fileInputRef.current?.click()} title="Open PDF (Ctrl+O)"
              className="flex flex-col items-center gap-0.5 px-2 py-1 hover:bg-slate-700 rounded text-slate-300 hover:text-cyan-400 transition group">
              <FolderOpen size={15} className="group-hover:text-cyan-400"/>
              <span className="text-[9px] text-slate-500 group-hover:text-slate-400">Open</span>
            </button>
            <button onClick={saveAnnotations} disabled={saving} title="Save (Ctrl+S)"
              className="flex flex-col items-center gap-0.5 px-2 py-1 hover:bg-emerald-900/40 rounded text-slate-300 hover:text-emerald-400 transition disabled:opacity-40 group">
              {saving?<RefreshCw size={15} className="animate-spin"/>:<Save size={15} className="group-hover:text-emerald-400"/>}
              <span className="text-[9px] text-slate-500 group-hover:text-emerald-400">{saving?"Saving":"Save"}</span>
            </button>
            <button onClick={exportPNG} title="Export PNG"
              className="flex flex-col items-center gap-0.5 px-2 py-1 hover:bg-slate-700 rounded text-slate-300 hover:text-white transition group">
              <Download size={15}/>
              <span className="text-[9px] text-slate-500 group-hover:text-slate-400">Export</span>
            </button>
            <button onClick={()=>setShowPrintModal(true)} title="Print (Ctrl+P)"
              className="flex flex-col items-center gap-0.5 px-2 py-1 hover:bg-slate-700 rounded text-slate-300 hover:text-white transition group">
              <Printer size={15}/>
              <span className="text-[9px] text-slate-500 group-hover:text-slate-400">Print</span>
            </button>
          </div>
          {/* Edit group */}
          <div className="flex items-center gap-0.5 px-1 border-r border-slate-800 mr-1">
            <button onClick={undo} title="Undo (Ctrl+Z)"
              className="flex flex-col items-center gap-0.5 px-2 py-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition group">
              <RotateCcw size={15}/>
              <span className="text-[9px] text-slate-500 group-hover:text-slate-400">Undo</span>
            </button>
            <button onClick={redo} title="Redo (Ctrl+Y)"
              className="flex flex-col items-center gap-0.5 px-2 py-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition group">
              <RotateCw size={15}/>
              <span className="text-[9px] text-slate-500 group-hover:text-slate-400">Redo</span>
            </button>
            {selected&&<button onClick={deleteSelected} title="Delete selected"
              className="flex flex-col items-center gap-0.5 px-2 py-1 hover:bg-red-900/40 rounded text-slate-400 hover:text-red-400 transition group">
              <Trash2 size={15}/>
              <span className="text-[9px] text-slate-500 group-hover:text-red-400">Delete</span>
            </button>}
          </div>
          {/* View group */}
          <div className="flex items-center gap-0.5 px-1 border-r border-slate-800 mr-1">
            <button onClick={()=>setSnapGrid(v=>!v)} title="Snap to Grid"
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded transition group ${snapGrid?"bg-cyan-900/50 text-cyan-300":"text-slate-400 hover:bg-slate-700 hover:text-white"}`}>
              <Magnet size={15}/>
              <span className="text-[9px]">Snap</span>
            </button>
            <button onClick={()=>setShowGrid(v=>!v)} title="Show Grid"
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded transition group ${showGrid?"bg-slate-600 text-white":"text-slate-400 hover:bg-slate-700 hover:text-white"}`}>
              <Grid size={15}/>
              <span className="text-[9px]">Grid</span>
            </button>
            <button onClick={()=>setShowRuler(v=>!v)} title="Show Rulers"
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded transition ${showRuler?"bg-slate-600 text-white":"text-slate-400 hover:bg-slate-700 hover:text-white"}`}>
              <RulerIcon size={15}/>
              <span className="text-[9px]">Rulers</span>
            </button>
          </div>
          {/* Zoom group */}
          <div className="flex items-center gap-0.5 px-1 border-r border-slate-800 mr-1">
            <button onClick={()=>setZoom(z=>Math.max(0.1,z-0.25))} title="Zoom Out"
              className="flex flex-col items-center gap-0.5 px-2 py-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition group">
              <ZoomOut size={15}/>
              <span className="text-[9px] text-slate-500">Out</span>
            </button>
            <button onClick={()=>{setZoom(1);setPan({x:0,y:0});}}
              className="px-2 py-1 text-xs text-slate-400 hover:text-white hover:bg-slate-700 rounded transition font-mono min-w-[44px] text-center">
              {Math.round(zoom*100)}%
            </button>
            <button onClick={()=>setZoom(z=>Math.min(8,z+0.25))} title="Zoom In"
              className="flex flex-col items-center gap-0.5 px-2 py-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition group">
              <ZoomIn size={15}/>
              <span className="text-[9px] text-slate-500">In</span>
            </button>
            <button onClick={()=>{setZoom(1);setPan({x:0,y:0});}} title="Fit Page"
              className="flex flex-col items-center gap-0.5 px-2 py-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition group">
              <Maximize2 size={15}/>
              <span className="text-[9px] text-slate-500">Fit</span>
            </button>
          </div>
          {/* Pages */}
          {totalPages > 1 && (
            <div className="flex items-center gap-0.5 px-1 border-r border-slate-800 mr-1">
              <button onClick={()=>goToPage(pageNum-1)} disabled={pageNum<=1}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded disabled:opacity-30 transition"><ChevronLeft size={14}/></button>
              <span className="text-[11px] text-slate-400 font-mono px-1">{pageNum}/{totalPages}</span>
              <button onClick={()=>goToPage(pageNum+1)} disabled={pageNum>=totalPages}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded disabled:opacity-30 transition"><ChevronRight size={14}/></button>
            </div>
          )}
          {/* Author */}
          <div className="flex items-center gap-1.5 px-2 border-r border-slate-800 mr-1">
            <User size={12} className="text-slate-500"/>
            <input value={authorName} onChange={e=>setAuthorName(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-xs text-slate-300 rounded px-2 py-0.5 outline-none w-24 focus:border-cyan-700"
              placeholder="Your name"/>
          </div>
          {/* PDF Text Select */}
          <div className="flex items-center gap-0.5 px-1 border-r border-slate-800 mr-1">
            <button onClick={()=>setTextSelectMode(v=>!v)} title="Select PDF Text"
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded transition group
                ${textSelectMode?"bg-amber-900/50 text-amber-300 ring-1 ring-amber-600":"text-slate-400 hover:bg-slate-700 hover:text-white"}`}>
              <Type size={15}/>
              <span className="text-[9px]">PDF Text</span>
            </button>
          </div>
          <div className="flex-1"/>
          {saveMsg && <span className="text-xs text-emerald-400 mr-2 font-medium">{saveMsg}</span>}
          {pdfLoaded && <span className="text-[10px] bg-cyan-900/50 text-cyan-400 px-2 py-0.5 rounded border border-cyan-800 mr-2">PDF ✓ {totalPages}p</span>}
          <button onClick={()=>setShowLeftPanel(v=>!v)} className={`p-1.5 rounded transition ${showLeftPanel?"text-cyan-400 bg-cyan-900/20":"text-slate-500 hover:text-white"}`} title="Pages/Tool Chest"><PanelLeft size={14}/></button>
          <button onClick={()=>setShowRightPanel(v=>!v)} className={`p-1.5 rounded transition ${showRightPanel?"text-cyan-400 bg-cyan-900/20":"text-slate-500 hover:text-white"}`} title="Properties/Layers"><PanelRight size={14}/></button>
          <button onClick={()=>setShowBottomPanel(v=>!v)} className={`p-1.5 rounded transition ${showBottomPanel?"text-cyan-400 bg-cyan-900/20":"text-slate-500 hover:text-white"}`} title="Markups List"><PanelBottom size={14}/></button>
        </div>
      </div>
      <input ref={fileInputRef} type="file" accept="application/pdf" className="hidden" onChange={handlePDF}/>

      {/* ── Properties bar ────────────────────────────────────────────────────── */}
      <div className="flex items-center h-10 bg-[#1a2030] border-b border-slate-800 px-3 gap-3 shrink-0 overflow-x-auto">
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-[10px] text-slate-500 uppercase">Color</span>
          {COLORS.map(c=>(
            <button key={c} onClick={()=>setColor(c)}
              className={`w-4 h-4 rounded-full border-2 transition shrink-0 ${color===c?"border-white scale-125":"border-transparent hover:border-slate-500"}`}
              style={{background:c}}/>
          ))}
        </div>
        <div className="w-px h-5 bg-slate-700 shrink-0"/>
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-[10px] text-slate-500 uppercase">Width</span>
          <select value={strokeSize} onChange={e=>setStroke(Number(e.target.value))}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded px-1.5 py-0.5 outline-none">
            {STROKE_SIZES.map(s=><option key={s} value={s}>{s}px</option>)}
          </select>
        </div>
        <div className="w-px h-5 bg-slate-700 shrink-0"/>
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-[10px] text-slate-500 uppercase">Fill</span>
          <button onClick={()=>setFill("transparent")}
            className={`w-4 h-4 rounded border transition ${fillColor==="transparent"?"border-white":"border-slate-600"}`}
            style={{background:"repeating-linear-gradient(45deg,#334155 0,#334155 1px,transparent 0,transparent 50%)",backgroundSize:"4px 4px"}}/>
          {COLORS.slice(0,8).map(c=>(
            <button key={c} onClick={()=>setFill(c)}
              className={`w-4 h-4 rounded-full border-2 transition shrink-0 ${fillColor===c?"border-white":"border-transparent"}`}
              style={{background:c,opacity:0.8}}/>
          ))}
        </div>
        <div className="w-px h-5 bg-slate-700 shrink-0"/>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[10px] text-slate-500 uppercase">Opacity</span>
          <input type="range" min="0.1" max="1" step="0.05" value={opacity}
            onChange={e=>setOpacity(Number(e.target.value))} className="w-16 accent-cyan-500"/>
          <span className="text-[10px] text-slate-400 w-8">{Math.round(opacity*100)}%</span>
        </div>
        <div className="w-px h-5 bg-slate-700 shrink-0"/>
        {["text","callout"].includes(tool) && (<>
          <select value={fontFamily} onChange={e=>setFontFamily(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded px-1.5 py-0.5 outline-none">
            {["sans-serif","serif","monospace","Arial","Georgia","Courier New"].map(f=><option key={f}>{f}</option>)}
          </select>
          <select value={fontSize} onChange={e=>setFontSize(Number(e.target.value))}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded px-1.5 py-0.5 outline-none w-14">
            {FONT_SIZES.map(s=><option key={s} value={s}>{s}pt</option>)}
          </select>
          <button onClick={()=>setBold(v=>!v)} className={`px-2 py-0.5 rounded text-xs font-bold transition ${bold?"bg-slate-600 text-white":"text-slate-500 hover:bg-slate-700"}`}>B</button>
          <button onClick={()=>setItalic(v=>!v)} className={`px-2 py-0.5 rounded text-xs italic transition ${italic?"bg-slate-600 text-white":"text-slate-500 hover:bg-slate-700"}`}>I</button>
          <div className="w-px h-5 bg-slate-700 shrink-0"/>
        </>)}
        {tool==="stamp" && (<>
          <span className="text-[10px] text-slate-500 uppercase">Stamp</span>
          <select value={stampMode} onChange={e=>setStampMode(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-xs rounded px-2 py-0.5 outline-none"
            style={{color: STAMP_COLORS[stampMode]}}>
            {STAMPS.map(s=><option key={s} value={s} style={{color:STAMP_COLORS[s]}}>{s}</option>)}
          </select>
          <div className="w-px h-5 bg-slate-700 shrink-0"/>
        </>)}
        <div className="flex items-center gap-1.5 shrink-0">
          <RulerIcon size={11} className="text-slate-500"/>
          <span className="text-[10px] text-slate-500">Scale</span>
          <input type="number" value={scale} onChange={e=>setScale(Number(e.target.value))} min="0.01" step="0.1"
            className="w-14 bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded px-1.5 py-0.5 outline-none"/>
          <span className="text-[10px] text-slate-500">m/grid</span>
        </div>
        <div className="flex-1"/>
        {selected && (
          <button onClick={deleteSelected} className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-red-950 transition shrink-0">
            <Trash2 size={12}/> Delete
          </button>
        )}
      </div>

      {/* ── Body ──────────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Left Panel ──────────────────────────────────────────────────────── */}
        {showLeftPanel && (
          <div className="w-52 bg-[#161b27] border-r border-slate-800 flex flex-col shrink-0 overflow-hidden">
            <div className="flex border-b border-slate-800">
              {[{id:"pages",label:"Pages",icon:BookOpen},{id:"toolchest",label:"Tool Chest",icon:Star}].map(t=>(
                <button key={t.id} onClick={()=>setLeftTab(t.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs transition ${leftTab===t.id?"bg-[#1a2030] text-cyan-400 border-b-2 border-cyan-500":"text-slate-500 hover:text-slate-300"}`}>
                  <t.icon size={12}/>{t.label}
                </button>
              ))}
            </div>
            {leftTab==="pages" && (
              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {!pdfLoaded && <p className="text-xs text-slate-600 text-center py-6">No PDF loaded</p>}
                {pageThumb.map((src,i)=>(
                  <button key={i} onClick={()=>goToPage(i+1)}
                    className={`w-full rounded-lg overflow-hidden border-2 transition ${pageNum===i+1?"border-cyan-500":"border-transparent hover:border-slate-600"}`}>
                    <img src={src} alt={`Page ${i+1}`} className="w-full"/>
                    <p className="text-[10px] text-slate-500 text-center py-0.5 bg-[#1a2030]">Page {i+1}</p>
                  </button>
                ))}
              </div>
            )}
            {leftTab==="toolchest" && (
  <div className="flex-1 overflow-y-auto bg-[#d6d5cd] text-black">
    {/* Header */}
    <div className="flex items-center gap-2 px-2 py-2 bg-[#2f2f2f] text-white border-b border-black/30">
      <span className="text-lg leading-none">▦</span>
      <span className="text-sm font-semibold flex-1">Tool Chest</span>
      <button className="text-white/80 hover:text-white text-xs">▾</button>
    </div>

    {/* Search */}
    <div className="p-2 border-b border-black/10 bg-[#3a3a3a]">
      <div className="flex items-center bg-[#2a2a2a] border border-black/40 rounded px-2 h-8">
        <Search size={14} className="text-slate-400" />
        <input
          type="text"
          placeholder="Search"
          className="flex-1 bg-transparent outline-none text-xs text-white px-2 placeholder:text-slate-400"
        />
      </div>
    </div>

    {/* Sections */}
    <div className="pb-3">
      {toolChest.map((section) => {
        const isOpen = toolChestOpen[section.id];

        return (
          <div key={section.id} className="border-b border-black/10">
            {/* Section header */}
            <div className="flex items-center px-2 py-2 bg-[#2e2e2e] text-white">
              <button
                onClick={() =>
                  setToolChestOpen((prev) => ({
                    ...prev,
                    [section.id]: !prev[section.id],
                  }))
                }
                className="mr-2 text-xs hover:text-cyan-300"
              >
                {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>

              <span className="text-sm flex-1">{section.title}</span>

              <button className="text-slate-300 hover:text-white">
                <Settings size={14} />
              </button>
            </div>

            {/* Section content */}
            {isOpen && (
              <div className="bg-[#d6d5cd] px-2 py-2">
                {section.items.length === 0 ? (
                  <div className="h-10 bg-[#d6d5cd]" />
                ) : (
                  <div className="grid grid-cols-6 gap-2">
                    {section.items.map((item) => {
                      const isActive = tool === item.tool;

                      return (
                        <button
                          key={item.id}
                          onClick={() => applyToolChestItem(item)}
                          title={item.label}
                          className={`relative w-8 h-8 flex items-center justify-center rounded-sm border transition
                            ${isActive
                              ? "bg-white border-cyan-500 shadow-sm"
                              : "bg-[#d6d5cd] border-transparent hover:bg-white/70 hover:border-slate-400"
                            }`}
                        >
                          {/* Icono según herramienta */}
                          {item.tool === "highlight" && (
                            <div className="relative">
                              <div
                                className="w-5 h-2 rounded-sm"
                                style={{ background: item.color }}
                              />
                              <div className="w-5 h-0.5 bg-black mt-1 opacity-70" />
                            </div>
                          )}

                          {item.tool === "text" && (
                            <div className="relative flex items-center justify-center">
                              <div className="w-5 h-5 border border-black bg-[#f8f8f8] flex items-center justify-center text-[11px] font-bold">
                                A
                              </div>
                              <span className="absolute -bottom-2 text-[9px] text-cyan-700">a</span>
                            </div>
                          )}

                          {item.tool === "line" && (
                            <div className="w-5 h-0.5 rotate-[-20deg]" style={{ background: item.color }} />
                          )}

                          {item.tool === "arrow" && (
                            <div className="relative w-5 h-5">
                              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-0.5 bg-black rotate-[-30deg]" />
                              <div className="absolute right-0 top-[8px] w-0 h-0 border-l-[5px] border-l-black border-t-[3px] border-t-transparent border-b-[3px] border-b-transparent rotate-[-30deg]" />
                            </div>
                          )}

                          {item.tool === "callout" && (
                            <div className="relative w-5 h-5">
                              <div className="absolute top-0 left-0 w-4 h-3 border border-black bg-white" />
                              <div className="absolute left-1 top-3 w-2 h-2 border-l border-b border-black rotate-45 bg-white" />
                              <div className="absolute -bottom-1 -right-1 text-[10px]" style={{ color: item.color }}>↶</div>
                            </div>
                          )}

                          {item.tool === "cloud" && (
                            <div className="text-[18px] leading-none" style={{ color: item.color }}>☁</div>
                          )}

                          {item.tool === "circle" && (
                            <div className="w-4 h-4 rounded-full border-2" style={{ borderColor: item.color }} />
                          )}

                          {item.tool === "rect" && (
                            <div className="w-4 h-4 border-2" style={{ borderColor: item.color }} />
                          )}

                          {item.tool === "comment" && (
                            <div className="relative w-5 h-5">
                              <div className="absolute top-0 left-0 w-4 h-4 border border-black bg-[#fff9c4]" />
                              <div className="absolute bottom-0 right-0 text-[9px] text-black">a</div>
                            </div>
                          )}

                          {item.tool === "measure" && (
                            <div className="relative w-5 h-5">
                              <div className="absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2" style={{ background: item.color }} />
                              <div className="absolute left-0 top-[7px] w-0 h-0 border-r-[4px] border-r-transparent border-l-[4px] border-l-transparent border-b-[5px]" style={{ borderBottomColor: item.color }} />
                              <div className="absolute right-0 top-[7px] w-0 h-0 border-r-[4px] border-r-transparent border-l-[4px] border-l-transparent border-b-[5px]" style={{ borderBottomColor: item.color }} />
                            </div>
                          )}

                          {item.tool === "stamp" && (
                            <div className="relative">
                              <div
                                className="w-6 h-6 rounded-full border-[3px] flex items-center justify-center text-[8px] font-bold"
                                style={{ borderColor: item.color, color: item.color }}
                              >
                                1
                              </div>
                              <div className="absolute right-0 bottom-0 w-2 h-2 bg-black/30 rounded-full" />
                            </div>
                          )}

                          {item.tool === "spline" && (
                            <div className="relative w-5 h-5">
                              <svg viewBox="0 0 20 20" className="w-5 h-5">
                                <path
                                  d="M2 15 C5 5, 10 18, 18 6"
                                  fill="none"
                                  stroke={item.color}
                                  strokeWidth="2"
                                />
                              </svg>
                            </div>
                          )}

                          {/* Badge */}
                          {item.badge && (
                            <span className="absolute -top-1 -right-1 min-w-[12px] h-3 px-0.5 rounded-sm bg-[#4b4b4b] text-white text-[8px] leading-3 border border-black/30">
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>

    {/* Save current tool */}
    <div className="px-2 pb-3">
      <button
        onClick={() => {
          const name = prompt("Nombre de la herramienta:", tool + " - " + color);
          if (!name) return;

          const newItem = {
            id: `mt-${Date.now()}`,
            tool,
            color,
            size: strokeSize,
            label: name,
            badge: "",
          };

          setToolChest((prev) =>
            prev.map((section) =>
              section.id === "my-tools"
                ? { ...section, items: [...section.items, newItem] }
                : section
            )
          );
        }}
        className="w-full mt-2 h-9 rounded border border-dashed border-slate-500 text-xs text-slate-700 hover:bg-white/60 transition"
      >
        + Guardar herramienta actual
      </button>
    </div>
  </div>
)}
          </div>
        )}

        {/* ── Tools sidebar ───────────────────────────────────────────────────── */}
        <div className="w-12 bg-[#0f1117] border-r border-slate-800 flex flex-col items-center py-2 gap-0.5 z-20 shrink-0"
          onClick={()=>setOpenGroup(null)}>
          {TOOL_GROUPS.map(group => {
            const activeT = group.tools.find(t=>t.id===tool);
            const ActiveIcon = activeT?.icon || group.icon;
            const isGroupActive = group.tools.some(t=>t.id===tool);
            const isOpen = openGroup===group.id;
            return (
              <div key={group.id} className="relative w-full flex justify-center">
                <button title={group.label}
                  onClick={e=>{e.stopPropagation(); setOpenGroup(isOpen?null:group.id);}}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition relative
                    ${isGroupActive?"bg-cyan-700 text-white":"text-slate-500 hover:text-slate-200 hover:bg-slate-800"}`}>
                  <ActiveIcon size={16}/>
                  <span className="absolute bottom-0.5 right-0.5 w-1 h-1 rounded-full bg-current opacity-40"/>
                </button>
                {isOpen && (
                  <div className="absolute left-12 top-0 bg-[#1e2535] border border-slate-700 rounded-xl shadow-2xl py-1.5 z-50 min-w-max"
                    onClick={e=>e.stopPropagation()}>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest px-3 pb-1.5 border-b border-slate-700 mb-1">{group.label}</p>
                    {group.tools.map(t=>{
                      const Icon=t.icon;
                      return (
                        <button key={t.id} onClick={()=>{setTool(t.id);setOpenGroup(null);}}
                          className={`w-full flex items-center gap-3 px-3 py-2 text-xs transition hover:bg-slate-700
                            ${tool===t.id?"text-cyan-400 bg-slate-700/50":"text-slate-300"}`}>
                          <Icon size={14} className="shrink-0"/>
                          <span className="flex-1">{t.label}</span>
                          <kbd className="text-[10px] text-slate-600 bg-slate-800 px-1 rounded">{t.shortcut}</kbd>
                          {tool===t.id&&<span className="w-1.5 h-1.5 rounded-full bg-cyan-400 ml-1"/>}
                        </button>
                      );
                    })}
                    {group.id==="annotate" && tool==="stamp" && (
                      <div className="border-t border-slate-700 mt-1 pt-1.5 px-3 pb-2">
                        <p className="text-[10px] text-slate-500 uppercase mb-1.5">Stamp Type</p>
                        {STAMPS.map(s=>(
                          <button key={s} onClick={()=>setStampMode(s)}
                            className={`w-full flex items-center gap-2 px-2 py-1 rounded text-xs mb-0.5 transition
                              ${stampMode===s?"bg-slate-600 text-white":"text-slate-400 hover:bg-slate-700"}`}>
                            <span className="w-2 h-2 rounded-full" style={{background:STAMP_COLORS[s]}}/>
                            {s} {stampMode===s&&<Check size={10} className="ml-auto text-cyan-400"/>}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          <div className="flex-1"/>
          <div className="mb-1 flex flex-col items-center gap-0.5">
            <div className="w-7 h-7 rounded-lg border-2 border-slate-600 shrink-0" style={{background:color}}/>
            <div className="w-4 h-4 rounded border border-slate-700 -mt-2 ml-2"
              style={{background:fillColor==="transparent"?"transparent":fillColor,
                backgroundImage:fillColor==="transparent"?"repeating-linear-gradient(45deg,#475569 0,#475569 1px,transparent 0,transparent 50%)":"none",
                backgroundSize:"4px 4px"}}/>
          </div>
        </div>

        {/* ── Canvas ──────────────────────────────────────────────────────────── */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <div ref={containerRef} className="flex-1 relative overflow-hidden bg-[#111827]" style={{cursor:cursorStyle}}>

            {showRuler && (<>
              <canvas ref={rulerHRef} height={18} className="absolute top-0 left-0 right-0 z-10 bg-[#0f1117]" style={{width:"100%",height:18}}/>
              <canvas ref={rulerVRef} width={18} className="absolute top-0 left-0 bottom-0 z-10 bg-[#0f1117]" style={{width:18,height:"100%"}}/>
            </>)}

            {!pdfLoaded && !loadingPdf && (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
                <div className="border-2 border-dashed border-slate-800 rounded-3xl p-16 flex flex-col items-center gap-4 opacity-50">
                  <FileUp size={48} className="text-slate-700"/>
                  <p className="text-slate-600 text-sm font-medium">Open a PDF blueprint using File → Open PDF</p>
                  <p className="text-slate-700 text-xs font-mono">Ctrl+Scroll to zoom · Scroll to pan · Shift+Scroll horizontal</p>
                </div>
              </div>
            )}

            <canvas ref={pdfCanvasRef} className="absolute"
              style={{
                transform:`translate(${pan.x + (showRuler?18:0)}px, ${pan.y + (showRuler?18:0)}px) scale(${zoom})`,
                transformOrigin:"0 0",
              }}/>

            <div ref={textLayerRef}
              className="absolute"
              onMouseUp={textSelectMode ? handleTextLayerMouseUp : undefined}
              style={{
                transform:`translate(${pan.x + (showRuler?18:0)}px, ${pan.y + (showRuler?18:0)}px) scale(${zoom})`,
                transformOrigin:"0 0",
                pointerEvents: textSelectMode ? "all" : "none",
                userSelect: textSelectMode ? "text" : "none",
                zIndex: textSelectMode ? 25 : 0,
                cursor: textSelectMode ? "text" : "default",
              }}/>

            {textSelectionPopup && (
              <div className="fixed z-[100] flex flex-col items-center"
                style={{ left: textSelectionPopup.x, top: textSelectionPopup.y, transform:"translate(-50%,-100%)" }}>
                <div className="flex bg-[#1e2535] border border-slate-600 rounded-xl shadow-2xl overflow-hidden text-xs divide-x divide-slate-700">
                  <button onClick={()=>createTextHighlight(textSelectionPopup.text,"highlight")}
                    className="flex flex-col items-center gap-0.5 px-3 py-2 hover:bg-yellow-900/40 text-yellow-300 transition">
                    <Highlighter size={14}/><span className="text-[10px]">Highlight</span>
                  </button>
                  <button onClick={()=>createTextHighlight(textSelectionPopup.text,"underline")}
                    className="flex flex-col items-center gap-0.5 px-3 py-2 hover:bg-blue-900/40 text-blue-300 transition">
                    <Baseline size={14}/><span className="text-[10px]">Underline</span>
                  </button>
                  <button onClick={()=>createTextHighlight(textSelectionPopup.text,"strikeout")}
                    className="flex flex-col items-center gap-0.5 px-3 py-2 hover:bg-red-900/40 text-red-300 transition">
                    <Slash size={14}/><span className="text-[10px]">Strikeout</span>
                  </button>
                  <button onClick={()=>createTextHighlight(textSelectionPopup.text,"note")}
                    className="flex flex-col items-center gap-0.5 px-3 py-2 hover:bg-amber-900/40 text-amber-300 transition">
                    <MessageSquare size={14}/><span className="text-[10px]">Note</span>
                  </button>
                  <button onClick={()=>createTextHighlight(textSelectionPopup.text,"copy")}
                    className="flex flex-col items-center gap-0.5 px-3 py-2 hover:bg-slate-700 text-slate-300 transition">
                    <Copy size={14}/><span className="text-[10px]">Copy</span>
                  </button>
                  <button onClick={()=>{window.getSelection()?.removeAllRanges();setTextSelectionPopup(null);}}
                    className="flex flex-col items-center gap-0.5 px-2 py-2 hover:bg-slate-700 text-slate-500 transition">
                    <X size={12}/>
                  </button>
                </div>
                <div className="mt-1 bg-[#0f1117] border border-slate-700 rounded-lg px-3 py-1.5 max-w-xs">
                  <p className="text-[11px] text-slate-400 truncate">
                    <span className="text-slate-600 mr-1">Selected:</span>
                    <span className="text-slate-200 font-medium">"{textSelectionPopup.text.slice(0,60)}{textSelectionPopup.text.length>60?"…":""}"</span>
                  </p>
                </div>
              </div>
            )}

            <canvas ref={canvasRef} width={canvasSize.w} height={canvasSize.h}
              className="absolute"
              style={{left: showRuler?18:0, top: showRuler?18:0}}
              onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp}/>

            {textEdit && (
              <input ref={textInputRef}
                className="absolute bg-transparent border border-cyan-500 text-cyan-200 text-sm px-2 py-1 outline-none rounded z-30"
                style={{
                  left: textEdit.x*zoom+pan.x+(showRuler?18:0),
                  top:  textEdit.y*zoom+pan.y+(showRuler?18:0)-10,
                  minWidth:160, fontSize:`${fontSize}px`,
                  fontFamily, fontWeight:bold?"bold":"normal", fontStyle:italic?"italic":"normal"
                }}
                placeholder="Type here..."
                onKeyDown={e=>{ if(e.key==="Enter"&&!e.shiftKey)submitText(e.target.value); if(e.key==="Escape")setTextEdit(null); }}
                onBlur={e=>submitText(e.target.value)}/>
            )}
          </div>

          {/* ── Markups List ─────────────────────────────────────────────────── */}
          {showBottomPanel && (
            <div className="h-56 bg-[#161b27] border-t border-slate-800 flex flex-col shrink-0">
              <div className="flex items-center gap-3 px-4 py-2 border-b border-slate-800 shrink-0">
                <List size={13} className="text-slate-500"/>
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Markups List</span>
                <span className="text-xs text-slate-600">({shapes.length} items)</span>
                <div className="flex-1"/>
                <div className="relative">
                  <Search size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500"/>
                  <input value={markupSearch} onChange={e=>setMarkupSearch(e.target.value)}
                    placeholder="Search markups..."
                    className="bg-slate-800 border border-slate-700 text-xs text-slate-300 rounded pl-6 pr-3 py-1 outline-none focus:border-cyan-700 w-36"/>
                </div>
                <select value={markupFilter} onChange={e=>setMarkupFilter(e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-xs text-slate-300 rounded px-2 py-1 outline-none">
                  {MARKUP_TYPES.map(t=><option key={t} value={t}>{t==="all"?"All types":t}</option>)}
                </select>
                <button onClick={()=>setShowBottomPanel(false)} className="text-slate-600 hover:text-slate-400"><X size={13}/></button>
              </div>
              <div className="flex-1 overflow-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-[#0f1117] sticky top-0">
                      <th className="text-left px-3 py-1.5 text-slate-500 font-medium w-8">#</th>
                      <th className="text-left px-2 py-1.5 text-slate-500 font-medium">Type</th>
                      <th className="text-left px-2 py-1.5 text-slate-500 font-medium w-40">Label / Text</th>
                      <th className="text-left px-2 py-1.5 text-slate-500 font-medium">Color</th>
                      <th className="text-left px-2 py-1.5 text-slate-500 font-medium">Author</th>
                      <th className="text-left px-2 py-1.5 text-slate-500 font-medium">Time</th>
                      <th className="text-left px-2 py-1.5 text-slate-500 font-medium">Page</th>
                      <th className="text-left px-2 py-1.5 text-slate-500 font-medium">Comment</th>
                      <th className="px-2 py-1.5 w-10"/>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMarkups.length===0 && (
                      <tr><td colSpan={9} className="text-center text-slate-600 py-6">No markups yet — start drawing on the canvas</td></tr>
                    )}
                    {filteredMarkups.map((s,i)=>(
                      <tr key={s.id} onClick={()=>setSelected(s.id)}
                        className={`border-b border-slate-800/50 cursor-pointer transition ${selected===s.id?"bg-cyan-900/30 text-cyan-300":"hover:bg-slate-800/50 text-slate-300"}`}>
                        <td className="px-3 py-1.5 text-slate-600 font-mono text-[10px]">{i+1}</td>
                        <td className="px-2 py-1.5">
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded capitalize
                            ${s.type==="measure"||s.type==="area"||s.type==="dim_horiz"||s.type==="dim_vert"||s.type==="radius_dim"||s.type==="diameter_dim"?"bg-orange-900/40 text-orange-400"
                            :s.type==="stamp"?"bg-purple-900/40 text-purple-400"
                            :s.type==="text"||s.type==="callout"?"bg-blue-900/40 text-blue-400"
                            :s.type==="text_highlight"?"bg-yellow-900/40 text-yellow-300"
                            :s.type==="text_strikeout"?"bg-red-900/40 text-red-400"
                            :s.type==="text_underline"?"bg-blue-900/30 text-blue-300"
                            :"bg-slate-700/50 text-slate-400"}`}>
                            {s.type==="text_highlight"?"Highlight":s.type==="text_strikeout"?"Strikeout":s.type==="text_underline"?"Underline":s.type.replace("_"," ")}
                          </span>
                        </td>
                        <td className="px-2 py-1.5 text-slate-300 max-w-[160px] truncate text-xs">{s.text||"—"}</td>
                        <td className="px-2 py-1.5">
                          <div className="flex items-center gap-1.5">
                            <div className="w-3.5 h-3.5 rounded-full border border-slate-700 shrink-0" style={{background:s.color}}/>
                          </div>
                        </td>
                        <td className="px-2 py-1.5">
                          <div className="flex items-center gap-1 text-[11px] text-slate-400">
                            <div className="w-5 h-5 rounded-full bg-cyan-800 flex items-center justify-center text-[9px] text-cyan-200 font-bold shrink-0">
                              {(s.author||"Me")[0].toUpperCase()}
                            </div>
                            {s.author||"Me"}
                          </div>
                        </td>
                        <td className="px-2 py-1.5 text-slate-600 font-mono text-[10px]">{s.createdAt||"—"}</td>
                        <td className="px-2 py-1.5 text-slate-600 text-[10px] text-center">{s.page||1}</td>
                        <td className="px-2 py-1.5">
                          <input
                            className="bg-transparent border-b border-slate-700 text-slate-400 text-[11px] outline-none focus:border-cyan-600 w-24 placeholder-slate-700"
                            placeholder="Add comment..."
                            value={s.comment||""}
                            onClick={e=>e.stopPropagation()}
                            onChange={e=>{e.stopPropagation();setShapes(sh=>sh.map(x=>x.id===s.id?{...x,comment:e.target.value}:x));}}
                          />
                        </td>
                        <td className="px-2 py-1.5">
                          <button onClick={e=>{e.stopPropagation();const ns=shapes.filter(x=>x.id!==s.id);setShapes(ns);pushHistory(ns);}}
                            className="text-slate-700 hover:text-red-400 transition p-0.5 rounded hover:bg-red-950/50"><Trash2 size={11}/></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* ── Right Panel ─────────────────────────────────────────────────────── */}
        {showRightPanel && (
          <div className="w-60 bg-[#161b27] border-l border-slate-800 flex flex-col shrink-0 overflow-hidden">
            <div className="flex border-b border-slate-800">
              {[{id:"layers",label:"Layers",icon:Layers},{id:"properties",label:"Props",icon:Settings}].map(t=>(
                <button key={t.id} onClick={()=>setRightTab(t.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs transition ${rightTab===t.id?"bg-[#1a2030] text-cyan-400 border-b-2 border-cyan-500":"text-slate-500 hover:text-slate-300"}`}>
                  <t.icon size={12}/>{t.label}
                </button>
              ))}
            </div>

            {rightTab==="layers" && (
              <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
                {shapes.length===0 && <p className="text-[11px] text-slate-600 text-center py-6">No markups yet</p>}
                {[...shapes].reverse().map(s=>(
                  <div key={s.id} onClick={()=>setSelected(s.id===selected?null:s.id)}
                    className={`flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer transition text-xs
                      ${selected===s.id?"bg-cyan-900/30 border border-cyan-800 text-cyan-300":"hover:bg-slate-800 text-slate-400"}`}>
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{background:STAMP_COLORS[s.text]||s.color||"#6B7280"}}/>
                    <span className="flex-1 capitalize truncate">{s.type}{s.text?` "${s.text}"`:"" }</span>
                    <button onClick={e=>{e.stopPropagation();const ns=shapes.filter(x=>x.id!==s.id);setShapes(ns);pushHistory(ns);}}
                      className="text-slate-700 hover:text-red-400"><X size={10}/></button>
                  </div>
                ))}
              </div>
            )}

            {rightTab==="properties" && (
              <div className="flex-1 overflow-y-auto p-3 space-y-4">
                {!selectedShape ? (
                  <p className="text-xs text-slate-600 text-center py-6">Select a markup to see its properties</p>
                ) : (
                  <>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-2">Selected: <span className="text-cyan-400 capitalize">{selectedShape.type}</span></p>
                    </div>
                    {[
                      {label:"Color", key:"color", type:"color"},
                      {label:"Stroke", key:"size", type:"number"},
                      {label:"Opacity", key:"opacity", type:"range"},
                    ].map(f=>(
                      <div key={f.key}>
                        <label className="block text-[10px] text-slate-500 uppercase mb-1">{f.label}</label>
                        {f.type==="color"&&(
                          <div className="flex flex-wrap gap-1">
                            {COLORS.map(c=>(
                              <button key={c} onClick={()=>setShapes(sh=>sh.map(s=>s.id===selected?{...s,color:c}:s))}
                                className={`w-5 h-5 rounded-full border-2 ${selectedShape.color===c?"border-white":"border-transparent"}`}
                                style={{background:c}}/>
                            ))}
                          </div>
                        )}
                        {f.type==="number"&&(
                          <input type="number" value={selectedShape[f.key]||2}
                            onChange={e=>setShapes(sh=>sh.map(s=>s.id===selected?{...s,[f.key]:Number(e.target.value)}:s))}
                            className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded px-2 py-1 outline-none"/>
                        )}
                        {f.type==="range"&&(
                          <div className="flex items-center gap-2">
                            <input type="range" min="0.1" max="1" step="0.05" value={selectedShape[f.key]||1}
                              onChange={e=>setShapes(sh=>sh.map(s=>s.id===selected?{...s,[f.key]:Number(e.target.value)}:s))}
                              className="flex-1 accent-cyan-500"/>
                            <span className="text-xs text-slate-400">{Math.round((selectedShape[f.key]||1)*100)}%</span>
                          </div>
                        )}
                      </div>
                    ))}
                    {selectedShape.text!==undefined && (
                      <div>
                        <label className="block text-[10px] text-slate-500 uppercase mb-1">Text</label>
                        <textarea value={selectedShape.text||""} rows={2}
                          onChange={e=>setShapes(sh=>sh.map(s=>s.id===selected?{...s,text:e.target.value}:s))}
                          className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded px-2 py-1 outline-none resize-none"/>
                      </div>
                    )}
                    <button onClick={deleteSelected}
                      className="w-full flex items-center justify-center gap-1.5 py-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded-lg text-xs transition">
                      <Trash2 size={12}/> Delete Markup
                    </button>
                  </>
                )}
              </div>
            )}

            <div className="border-t border-slate-800 p-3 space-y-2 shrink-0">
              <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Price Summary</h3>
              <textarea
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 resize-none outline-none focus:border-cyan-700 placeholder-slate-600"
                rows={3} placeholder={"Area: 1,200 sq ft\nMaterials: $12,000\nLabor: $6,000\nTotal: $18,000"}/>
              <button className="w-full bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold py-2 rounded-lg transition">
                Send Quote to Client
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════
          ── PRINT MODAL ────────────────────────────────────────────────────────
      ══════════════════════════════════════════════════════════════════════════ */}
      {showPrintModal && (() => {
        const selPaper = PRINT_PAPER_SIZES.find(p => p.value === printSettings.paperSize) || PRINT_PAPER_SIZES[0];
        const isLand   = printSettings.orientation === "landscape";
        const [dimA, dimB] = selPaper.sub.split(" × ");
        const paperW = isLand ? dimB : dimA;
        const paperH = isLand ? dimA : dimB;

        return (
          <div
            className="fixed inset-0 z-[300] flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.55)" }}
            onClick={e => { if (e.target === e.currentTarget) setShowPrintModal(false); }}>

            <div
              className="flex flex-col shadow-2xl"
              style={{
                background: "#f0f0f0",
                color: "#1a1a1a",
                fontFamily: "Segoe UI, Arial, sans-serif",
                fontSize: 13,
                borderRadius: 4,
                width: 880,
                maxHeight: "95vh",
                overflow: "hidden",
                border: "1px solid #999",
              }}>

              {/* Title bar */}
              <div style={{ background: "#2b5fa4", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 12px" }}>
                <span style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>Print</span>
                <button
                  onClick={() => setShowPrintModal(false)}
                  style={{ color: "#fff", background: "none", border: "none", cursor: "pointer", fontSize: 18, lineHeight: 1, padding: "0 4px" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
                  onMouseLeave={e => e.currentTarget.style.background = "none"}>
                  ×
                </button>
              </div>

              {/* File info header */}
              <div style={{ background: "#e4e4e4", borderBottom: "1px solid #ccc", padding: "5px 14px", fontSize: 12, color: "#555", display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontWeight: 600, color: "#222" }}>{editorInfo?.fileName || "Document.pdf"}</span>
                <span style={{ color: "#888" }}>{paperW} × {paperH}</span>
              </div>

              {/* Body */}
              <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

                {/* Left – Preview */}
                <div style={{ width: 240, background: "#d8d8d8", borderRight: "1px solid #bbb", display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 12px", gap: 10, flexShrink: 0 }}>
                  {/* Paper preview */}
                  <div style={{
                    background: "#fff",
                    border: "1px solid #999",
                    boxShadow: "2px 2px 6px rgba(0,0,0,0.2)",
                    width: isLand ? 200 : 140,
                    height: isLand ? 100 : 190,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    position: "relative",
                  }}>
                    {pdfLoaded ? (
                      <canvas
                        ref={el => {
                          if (!el || !pdfCanvasRef.current) return;
                          const c2 = el.getContext("2d");
                          const W = isLand ? 200 : 140;
                          const H = isLand ? 100 : 190;
                          el.width = W; el.height = H;
                          c2.fillStyle = "#fff"; c2.fillRect(0, 0, W, H);
                          if (printSettings.printGrayscale) c2.filter = "grayscale(1)";
                          c2.drawImage(pdfCanvasRef.current, 0, 0, W, H);
                          if (printSettings.printContent !== "doc-only")
                            c2.drawImage(canvasRef.current, 0, 0, W, H);
                        }}
                        style={{ width: "100%", height: "100%" }}
                      />
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, color: "#bbb" }}>
                        <FileText size={28}/>
                        <span style={{ fontSize: 11 }}>No PDF</span>
                      </div>
                    )}
                  </div>

                  {/* Page navigation */}
                  <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                    {[
                      { label: "⏮", action: () => goToPage(1),             disabled: pageNum <= 1 },
                      { label: "◀", action: () => goToPage(pageNum - 1),    disabled: pageNum <= 1 },
                      { label: "▶", action: () => goToPage(pageNum + 1),    disabled: pageNum >= totalPages },
                      { label: "⏭", action: () => goToPage(totalPages),     disabled: pageNum >= totalPages },
                    ].map((btn, idx) => idx === 1
                      ? <Fragment key={idx}>
                          <button onClick={btn.action} disabled={btn.disabled}
                            style={{ padding: "2px 6px", fontSize: 12, cursor: btn.disabled ? "default" : "pointer", opacity: btn.disabled ? 0.3 : 1, background: "#d0d0d0", border: "1px solid #bbb", borderRadius: 2 }}>
                            {btn.label}
                          </button>
                          <input readOnly value={`${pageNum} (${pageNum} of ${totalPages || 1})`}
                            style={{ width: 90, textAlign: "center", border: "1px solid #bbb", borderRadius: 2, padding: "2px 4px", fontSize: 11, background: "#fff" }}/>
                          <button onClick={[...[]].concat(btn)[0]?.action} disabled={false} style={{ display: "none" }}/>
                        </Fragment>
                      : <button key={idx} onClick={btn.action} disabled={btn.disabled}
                          style={{ padding: "2px 6px", fontSize: 12, cursor: btn.disabled ? "default" : "pointer", opacity: btn.disabled ? 0.3 : 1, background: "#d0d0d0", border: "1px solid #bbb", borderRadius: 2 }}>
                          {btn.label}
                        </button>
                    )}
                  </div>

                  {/* Simplified nav row */}
                  <div style={{ display: "flex", alignItems: "center", gap: 3, marginTop: -6 }}>
                    <button onClick={() => goToPage(1)} disabled={pageNum <= 1}
                      style={{ padding: "2px 5px", fontSize: 11, cursor: pageNum <= 1 ? "default" : "pointer", opacity: pageNum <= 1 ? 0.3 : 1, background: "#d0d0d0", border: "1px solid #bbb", borderRadius: 2 }}>⏮</button>
                    <button onClick={() => goToPage(pageNum - 1)} disabled={pageNum <= 1}
                      style={{ padding: "2px 5px", fontSize: 11, cursor: pageNum <= 1 ? "default" : "pointer", opacity: pageNum <= 1 ? 0.3 : 1, background: "#d0d0d0", border: "1px solid #bbb", borderRadius: 2 }}>◀</button>
                    <input readOnly value={`${pageNum} (${pageNum} of ${totalPages || 1})`}
                      style={{ width: 88, textAlign: "center", border: "1px solid #bbb", borderRadius: 2, padding: "2px 4px", fontSize: 11, background: "#fff" }}/>
                    <button onClick={() => goToPage(pageNum + 1)} disabled={pageNum >= totalPages}
                      style={{ padding: "2px 5px", fontSize: 11, cursor: pageNum >= totalPages ? "default" : "pointer", opacity: pageNum >= totalPages ? 0.3 : 1, background: "#d0d0d0", border: "1px solid #bbb", borderRadius: 2 }}>▶</button>
                    <button onClick={() => goToPage(totalPages)} disabled={pageNum >= totalPages}
                      style={{ padding: "2px 5px", fontSize: 11, cursor: pageNum >= totalPages ? "default" : "pointer", opacity: pageNum >= totalPages ? 0.3 : 1, background: "#d0d0d0", border: "1px solid #bbb", borderRadius: 2 }}>⏭</button>
                  </div>
                </div>

                {/* Right – Settings */}
                <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>

                  {/* ── Printer ── */}
                  <fieldset style={{ border: "1px solid #bbb", borderRadius: 3, padding: "6px 12px 10px" }}>
                    <legend style={{ fontSize: 11, fontWeight: 600, color: "#555", padding: "0 4px" }}>Printer</legend>
                    <div style={{ display: "grid", gridTemplateColumns: "72px 1fr auto", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <label style={{ fontSize: 12, color: "#444" }}>Name:</label>
                      <select value={printSettings.printerName} onChange={e => setPrint("printerName", e.target.value)}
                        style={{ border: "1px solid #aaa", borderRadius: 2, padding: "3px 6px", fontSize: 12, background: "#fff", outline: "none" }}>
                        {PRINT_PRINTERS.map(p => <option key={p}>{p}</option>)}
                      </select>
                      <button style={{ padding: "3px 10px", background: "#e0e0e0", border: "1px solid #bbb", borderRadius: 2, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap" }}>
                        Properties
                      </button>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 20, paddingLeft: 80, fontSize: 12, color: "#555" }}>
                      <span>Status: <span style={{ color: "#16a34a", fontWeight: 600 }}>Ready</span></span>
                      <label style={{ display: "flex", alignItems: "center", gap: 5, cursor: "pointer" }}>
                        <input type="checkbox" checked={printSettings.toFile} onChange={e => setPrint("toFile", e.target.checked)} style={{ accentColor: "#2b5fa4" }}/>
                        To File
                      </label>
                    </div>
                  </fieldset>

                  {/* ── Pages ── */}
                  <fieldset style={{ border: "1px solid #bbb", borderRadius: 3, padding: "6px 12px 10px" }}>
                    <legend style={{ fontSize: 11, fontWeight: 600, color: "#555", padding: "0 4px" }}>Pages ({totalPages || 1})</legend>
                    <div style={{ display: "grid", gridTemplateColumns: "72px 1fr auto", alignItems: "center", gap: 8 }}>
                      <label style={{ fontSize: 12, color: "#444" }}>Page Range:</label>
                      <select value={printSettings.pageRange} onChange={e => setPrint("pageRange", e.target.value)}
                        style={{ border: "1px solid #aaa", borderRadius: 2, padding: "3px 6px", fontSize: 12, background: "#fff", outline: "none" }}>
                        <option value="all">All Pages (1 - {totalPages || 1})</option>
                        <option value="current">Current Page ({pageNum})</option>
                        <option value="custom">Custom Range...</option>
                      </select>
                      <button style={{ padding: "3px 10px", background: "#e0e0e0", border: "1px solid #bbb", borderRadius: 2, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap" }}>
                        Get Window
                      </button>
                    </div>
                    {printSettings.pageRange === "custom" && (
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6, paddingLeft: 80 }}>
                        <input placeholder="e.g. 1-3, 5, 7" value={printSettings.customRange}
                          onChange={e => setPrint("customRange", e.target.value)}
                          style={{ border: "1px solid #aaa", borderRadius: 2, padding: "3px 6px", fontSize: 12, background: "#fff", outline: "none", flex: 1 }}/>
                        <span style={{ fontSize: 11, color: "#888" }}>pages</span>
                      </div>
                    )}
                  </fieldset>

                  {/* ── Options ── */}
                  <fieldset style={{ border: "1px solid #bbb", borderRadius: 3, padding: "6px 12px 12px" }}>
                    <legend style={{ fontSize: 11, fontWeight: 600, color: "#555", padding: "0 4px" }}>Options</legend>
                    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>

                      {/* Size + Auto */}
                      <div style={{ display: "grid", gridTemplateColumns: "72px 1fr auto", alignItems: "center", gap: 8 }}>
                        <label style={{ fontSize: 12, color: "#444" }}>Size:</label>
                        <select value={printSettings.paperSize} onChange={e => setPrint("paperSize", e.target.value)}
                          style={{ border: "1px solid #aaa", borderRadius: 2, padding: "3px 6px", fontSize: 12, background: "#fff", outline: "none" }}>
                          {PRINT_PAPER_SIZES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                        </select>
                        <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap" }}>
                          <input type="checkbox" checked={printSettings.autoRotate} onChange={e => setPrint("autoRotate", e.target.checked)} style={{ accentColor: "#2b5fa4" }}/>
                          Auto
                        </label>
                      </div>

                      {/* Orientation */}
                      <div style={{ display: "flex", alignItems: "center", gap: 24, paddingLeft: 80, fontSize: 12 }}>
                        {["portrait", "landscape"].map(o => (
                          <label key={o} style={{ display: "flex", alignItems: "center", gap: 5, cursor: "pointer" }}>
                            <input type="radio" name="pm_orientation" value={o}
                              checked={printSettings.orientation === o}
                              onChange={() => setPrint("orientation", o)}
                              style={{ accentColor: "#2b5fa4" }}/>
                            {o.charAt(0).toUpperCase() + o.slice(1)}
                          </label>
                        ))}
                      </div>

                      {/* Print content */}
                      <div style={{ display: "grid", gridTemplateColumns: "72px 1fr", alignItems: "center", gap: 8 }}>
                        <label style={{ fontSize: 12, color: "#444" }}>Print:</label>
                        <select value={printSettings.printContent} onChange={e => setPrint("printContent", e.target.value)}
                          style={{ border: "1px solid #aaa", borderRadius: 2, padding: "3px 6px", fontSize: 12, background: "#fff", outline: "none" }}>
                          <option value="doc-markup">Document &amp; Markup</option>
                          <option value="doc-only">Document Only</option>
                          <option value="markup-only">Markup Only</option>
                          <option value="form-fields">Form Fields Only</option>
                        </select>
                      </div>

                      {/* Copies */}
                      <div style={{ display: "grid", gridTemplateColumns: "72px 1fr", alignItems: "center", gap: 8 }}>
                        <label style={{ fontSize: 12, color: "#444" }}>Copies:</label>
                        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                          <div style={{ display: "flex", border: "1px solid #aaa", borderRadius: 2, overflow: "hidden", background: "#fff" }}>
                            <button onClick={() => setPrint("copies", Math.max(1, printSettings.copies - 1))}
                              style={{ padding: "3px 8px", fontSize: 13, cursor: "pointer", background: "#e8e8e8", border: "none", borderRight: "1px solid #aaa" }}>−</button>
                            <input type="number" min={1} value={printSettings.copies}
                              onChange={e => setPrint("copies", Math.max(1, Number(e.target.value)))}
                              style={{ width: 40, textAlign: "center", fontSize: 12, border: "none", outline: "none", background: "#fff" }}/>
                            <button onClick={() => setPrint("copies", printSettings.copies + 1)}
                              style={{ padding: "3px 8px", fontSize: 13, cursor: "pointer", background: "#e8e8e8", border: "none", borderLeft: "1px solid #aaa" }}>+</button>
                          </div>
                          {[
                            { key: "collate", label: "Collate" },
                            { key: "reverse", label: "Reverse" },
                          ].map(opt => (
                            <label key={opt.key} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, cursor: "pointer" }}>
                              <input type="checkbox" checked={printSettings[opt.key]} onChange={e => setPrint(opt.key, e.target.checked)} style={{ accentColor: "#2b5fa4" }}/>
                              {opt.label}
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Rotation */}
                      <div style={{ display: "grid", gridTemplateColumns: "72px 1fr", alignItems: "center", gap: 8 }}>
                        <label style={{ fontSize: 12, color: "#444" }}>Rotation:</label>
                        <select value={printSettings.rotation} onChange={e => setPrint("rotation", e.target.value)}
                          style={{ border: "1px solid #aaa", borderRadius: 2, padding: "3px 6px", fontSize: 12, background: "#fff", outline: "none" }}>
                          {PRINT_ROTATIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                        </select>
                      </div>

                      {/* Page Scaling */}
                      <div style={{ display: "grid", gridTemplateColumns: "72px 1fr", alignItems: "center", gap: 8 }}>
                        <label style={{ fontSize: 12, color: "#444" }}>Page Scaling:</label>
                        <select value={printSettings.pageScaling} onChange={e => setPrint("pageScaling", e.target.value)}
                          style={{ border: "1px solid #aaa", borderRadius: 2, padding: "3px 6px", fontSize: 12, background: "#fff", outline: "none" }}>
                          {PRINT_SCALINGS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                      </div>

                      {/* Scale % */}
                      <div style={{ display: "grid", gridTemplateColumns: "72px 1fr", alignItems: "center", gap: 8 }}>
                        <label style={{ fontSize: 12, color: "#444" }}>Scale:</label>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ display: "flex", border: "1px solid #aaa", borderRadius: 2, overflow: "hidden", background: "#fff" }}>
                            <button onClick={() => setPrint("scalePercent", Math.max(10, printSettings.scalePercent - 5))}
                              style={{ padding: "2px 6px", fontSize: 13, cursor: "pointer", background: "#e8e8e8", border: "none", borderRight: "1px solid #aaa" }}>−</button>
                            <input type="number" min={10} max={1000} value={printSettings.scalePercent}
                              onChange={e => setPrint("scalePercent", Number(e.target.value))}
                              disabled={printSettings.pageScaling !== "custom"}
                              style={{ width: 52, textAlign: "center", fontSize: 12, border: "none", outline: "none", background: "#fff", opacity: printSettings.pageScaling !== "custom" ? 0.5 : 1 }}/>
                            <button onClick={() => setPrint("scalePercent", Math.min(1000, printSettings.scalePercent + 5))}
                              style={{ padding: "2px 6px", fontSize: 13, cursor: "pointer", background: "#e8e8e8", border: "none", borderLeft: "1px solid #aaa" }}>+</button>
                          </div>
                          <span style={{ fontSize: 12, color: "#555" }}>%</span>
                        </div>
                      </div>

                      {/* Center + X + Y */}
                      <div style={{ display: "grid", gridTemplateColumns: "72px 1fr", alignItems: "center", gap: 8 }}>
                        <div/>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", fontSize: 12 }}>
                          <label style={{ display: "flex", alignItems: "center", gap: 5, cursor: "pointer" }}>
                            <input type="checkbox" checked={printSettings.center} onChange={e => setPrint("center", e.target.checked)} style={{ accentColor: "#2b5fa4" }}/>
                            Center
                          </label>
                          {["centerX", "centerY"].map(k => (
                            <label key={k} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                              {k === "centerX" ? "X:" : "Y:"}
                              <div style={{ display: "flex", border: "1px solid #aaa", borderRadius: 2, overflow: "hidden", background: "#fff", marginLeft: 2 }}>
                                <button onClick={() => setPrint(k, printSettings[k] - 1)}
                                  style={{ padding: "1px 5px", fontSize: 12, cursor: "pointer", background: "#e8e8e8", border: "none", borderRight: "1px solid #aaa" }}>−</button>
                                <input type="number" value={printSettings[k]}
                                  onChange={e => setPrint(k, Number(e.target.value))}
                                  disabled={printSettings.center}
                                  style={{ width: 36, textAlign: "center", fontSize: 11, border: "none", outline: "none", background: "#fff", opacity: printSettings.center ? 0.5 : 1 }}/>
                                <button onClick={() => setPrint(k, printSettings[k] + 1)}
                                  style={{ padding: "1px 5px", fontSize: 12, cursor: "pointer", background: "#e8e8e8", border: "none", borderLeft: "1px solid #aaa" }}>+</button>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Checkboxes */}
                      <div style={{ paddingLeft: 80, display: "flex", flexDirection: "column", gap: 5, marginTop: 2 }}>
                        {[
                          { key: "dimPageContent",    label: "Dim Page Content" },
                          { key: "dimFilteredMarkups", label: "Dim Filtered Markups" },
                          { key: "printSpaces",        label: "Print Spaces" },
                          { key: "printHyperlinks",    label: "Print Visible Hyperlinks" },
                          { key: "printGrayscale",     label: "Print in Grayscale" },
                        ].map(opt => (
                          <label key={opt.key} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, cursor: "pointer" }}>
                            <input type="checkbox" checked={printSettings[opt.key]} onChange={e => setPrint(opt.key, e.target.checked)} style={{ accentColor: "#2b5fa4" }}/>
                            <span style={{ color: "#333" }}>{opt.label}</span>
                          </label>
                        ))}
                      </div>

                    </div>
                  </fieldset>
                </div>
              </div>

              {/* ── Footer ── */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", background: "#e4e4e4", borderTop: "1px solid #ccc" }}>
                {/* Left buttons */}
                <div style={{ display: "flex", gap: 6 }}>
                  {/* Defaults */}
                  <div style={{ display: "flex" }}>
                    <button
                      onClick={() => setPrintSettings(p => ({ ...p, paperSize:"letter", orientation:"portrait", pageScaling:"fit", scalePercent:100, copies:1, collate:true, reverse:false, rotation:"auto-90", center:true, centerX:0, centerY:0, dimPageContent:false, dimFilteredMarkups:true, printSpaces:false, printHyperlinks:true, printGrayscale:false }))}
                      style={{ padding: "4px 10px", background: "#d8d8d8", border: "1px solid #bbb", borderRight: "none", borderRadius: "2px 0 0 2px", fontSize: 12, cursor: "pointer", fontWeight: 500 }}>
                      Defaults
                    </button>
                    <button style={{ padding: "4px 6px", background: "#d8d8d8", border: "1px solid #bbb", borderRadius: "0 2px 2px 0", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center" }}>
                      <ChevronDown size={12}/>
                    </button>
                  </div>
                  {/* Advanced */}
                  <button style={{ padding: "4px 10px", background: "#d8d8d8", border: "1px solid #bbb", borderRadius: 2, fontSize: 12, cursor: "pointer", fontWeight: 500 }}>
                    Advanced
                  </button>
                  {/* Add Files */}
                  <div style={{ display: "flex" }}>
                    <label style={{ padding: "4px 10px", background: "#d8d8d8", border: "1px solid #bbb", borderRight: "none", borderRadius: "2px 0 0 2px", fontSize: 12, cursor: "pointer", fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}>
                      Add Files
                      <input type="file" accept="application/pdf" multiple style={{ display: "none" }}
                        onChange={e => { if (e.target.files?.length) { combineAddFiles(e.target.files); setShowCombineModal(true); setShowPrintModal(false); } e.target.value = ""; }}/>
                    </label>
                    <button style={{ padding: "4px 6px", background: "#d8d8d8", border: "1px solid #bbb", borderRadius: "0 2px 2px 0", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center" }}>
                      <ChevronDown size={12}/>
                    </button>
                  </div>
                </div>

                {/* Right: Print + Cancel */}
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={executePrint}
                    style={{ padding: "5px 28px", background: "#2b5fa4", color: "#fff", border: "none", borderRadius: 2, fontSize: 13, fontWeight: 600, cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.25)" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#1e4a8a"}
                    onMouseLeave={e => e.currentTarget.style.background = "#2b5fa4"}>
                    Print
                  </button>
                  <button onClick={() => setShowPrintModal(false)}
                    style={{ padding: "5px 16px", background: "#d8d8d8", border: "1px solid #bbb", borderRadius: 2, fontSize: 12, cursor: "pointer", fontWeight: 500 }}
                    onMouseEnter={e => e.currentTarget.style.background = "#c8c8c8"}
                    onMouseLeave={e => e.currentTarget.style.background = "#d8d8d8"}>
                    Cancel
                  </button>
                </div>
              </div>

            </div>
          </div>
        );
      })()}

      {/* ── Combine Files Modal ─────────────────────────────────────────────── */}
      {showCombineModal && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1a1f2e] border border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-cyan-600 rounded flex items-center justify-center">
                  <Layers size={13} className="text-white"/>
                </div>
                <h2 className="font-bold text-slate-100 text-sm">Combine PDF Files</h2>
              </div>
              <button onClick={()=>setShowCombineModal(false)} className="text-slate-500 hover:text-slate-200 transition"><X size={18}/></button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <div className="border border-slate-700 rounded-xl overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-[#0f1117] border-b border-slate-700">
                      <th className="text-left px-3 py-2 text-slate-400 font-semibold">#</th>
                      <th className="text-left px-3 py-2 text-slate-400 font-semibold">File</th>
                      <th className="text-left px-3 py-2 text-slate-400 font-semibold">Path / Name</th>
                      <th className="text-left px-3 py-2 text-slate-400 font-semibold w-16">Pages</th>
                      <th className="text-left px-3 py-2 text-slate-400 font-semibold w-16">Size</th>
                      <th className="px-3 py-2 w-20"/>
                    </tr>
                  </thead>
                  <tbody>
                    {combineFiles.length === 0 && (
                      <tr><td colSpan={6} className="text-center text-slate-600 py-8">
                        No files added yet — click <span className="text-cyan-400">Add Files</span> below
                      </td></tr>
                    )}
                    {combineFiles.map((f, i) => (
                      <tr key={f.id} className={`border-b border-slate-800/60 ${i%2===0?"bg-[#161b27]":"bg-[#1a1f2e]"}`}>
                        <td className="px-3 py-2 text-slate-600 font-mono">{i+1}</td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <FileText size={13} className="text-cyan-500 shrink-0"/>
                            <span className="text-slate-200 font-medium truncate max-w-[160px]">{f.name}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-slate-500 truncate max-w-[140px]">{f.path}</td>
                        <td className="px-3 py-2 text-center">
                          <span className="bg-slate-700 text-slate-300 px-2 py-0.5 rounded font-mono">{f.pages}</span>
                        </td>
                        <td className="px-3 py-2 text-slate-500">{f.size}</td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-0.5">
                            <button onClick={()=>combineMove(f.id,-1)} disabled={i===0}
                              className="p-1 text-slate-600 hover:text-white hover:bg-slate-700 rounded disabled:opacity-20 transition"><ChevronUp size={12}/></button>
                            <button onClick={()=>combineMove(f.id,1)} disabled={i===combineFiles.length-1}
                              className="p-1 text-slate-600 hover:text-white hover:bg-slate-700 rounded disabled:opacity-20 transition"><ChevronDown size={12}/></button>
                            <button onClick={()=>combineRemove(f.id)}
                              className="p-1 text-slate-600 hover:text-red-400 hover:bg-red-950/40 rounded transition ml-1"><X size={12}/></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <label className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-medium cursor-pointer transition">
                  <Plus size={13}/> Add Files
                  <input ref={combineFileInputRef} type="file" accept="application/pdf" multiple className="hidden"
                    onChange={e=>{ if(e.target.files?.length) combineAddFiles(e.target.files); e.target.value=""; }}/>
                </label>
                {pdfLoaded && editorInfo && (
                  <button
                    onClick={()=>{
                      if (!editorInfo) return;
                      setCombineFiles(cf=>[...cf,{ id:Date.now(), name:editorInfo.fileName||"current.pdf", path:editorInfo.fileName||"current.pdf", pages:totalPages||"—", size:"open" }]);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-xs font-medium transition">
                    <FolderOpen size={13}/> Add Open File
                  </button>
                )}
                {combineFiles.length > 0 && (
                  <button onClick={()=>setCombineFiles([])}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-red-900/40 text-slate-400 hover:text-red-300 rounded-lg text-xs transition ml-auto">
                    <Trash2 size={12}/> Remove All
                  </button>
                )}
              </div>
              <div className="mt-4 p-4 bg-[#0f1117] rounded-xl border border-slate-800">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-3 font-semibold">Combine Options</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key:"bookmarks",  label:"Include Bookmarks" },
                    { key:"attachments",label:"Include File Attachments" },
                    { key:"docProps",   label:"Merge Document Properties" },
                    { key:"layers",     label:"Merge Layers" },
                    { key:"fileLabel",  label:"Use Filename as Page Label" },
                  ].map(opt=>(
                    <label key={opt.key} className="flex items-center gap-2 cursor-pointer group">
                      <div onClick={()=>setCombineOpts(o=>({...o,[opt.key]:!o[opt.key]}))}
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center transition shrink-0
                          ${combineOpts[opt.key]?"bg-cyan-600 border-cyan-600":"border-slate-600 group-hover:border-slate-400"}`}>
                        {combineOpts[opt.key]&&<Check size={10} className="text-white"/>}
                      </div>
                      <span className="text-xs text-slate-400 group-hover:text-slate-200 transition">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-5 py-4 border-t border-slate-700 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                {combineFiles.length} file{combineFiles.length!==1?"s":""} · {combineFiles.reduce((s,f)=>s+(typeof f.pages==="number"?f.pages:0),0)} total pages
              </span>
              <div className="flex gap-3">
                <button onClick={()=>setShowCombineModal(false)}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-white transition">Cancel</button>
                <button onClick={combineOK} disabled={combining||combineFiles.length<2}
                  className="flex items-center gap-2 px-5 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white rounded-xl text-sm font-semibold transition">
                  {combining?<><RefreshCw size={14} className="animate-spin"/>Combining...</>:<><Check size={14}/>Combine &amp; Download</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Recent Files Modal ────────────────────────────────────────────────── */}
      {showRecentModal && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1a1f2e] border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
              <h2 className="font-bold text-slate-100 text-sm flex items-center gap-2"><Clock size={15} className="text-cyan-400"/>Open Recent</h2>
              <button onClick={()=>setShowRecentModal(false)} className="text-slate-500 hover:text-slate-200"><X size={18}/></button>
            </div>
            <div className="p-4 space-y-1 max-h-80 overflow-y-auto">
              {recentFiles.length===0 && <p className="text-slate-600 text-sm text-center py-6">No recent files</p>}
              {recentFiles.map((f,i)=>(
                <div key={i} onClick={()=>{ if (f.urlArchivo) { loadPdfFromUrl(f.urlArchivo); setEditorInfo(f); } setShowRecentModal(false); }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-700/50 cursor-pointer transition group">
                  <FileText size={16} className="text-cyan-500 shrink-0"/>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-200 font-medium truncate">{f.fileName}</p>
                    <p className="text-[11px] text-slate-500 truncate">{f.projectName||"—"} · {f.openedAt}</p>
                  </div>
                  <ChevronRight size={14} className="text-slate-700 group-hover:text-slate-400 shrink-0"/>
                </div>
              ))}
            </div>
            {recentFiles.length>0&&(
              <div className="px-5 py-3 border-t border-slate-700">
                <button onClick={()=>{setRecentFiles([]);localStorage.removeItem("pc_recent_files");}}
                  className="text-xs text-slate-600 hover:text-red-400 transition">Clear Recent Files</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Status bar ────────────────────────────────────────────────────────── */}
      <div className="h-6 bg-[#0f1117] border-t border-slate-800 flex items-center px-4 gap-4 shrink-0">
        <span className="text-[10px] text-slate-600 font-mono">X: {mousePos.x} Y: {mousePos.y}</span>
        <div className="w-px h-3 bg-slate-800"/>
        <span className="text-[10px] text-slate-600 font-mono">Zoom: {Math.round(zoom*100)}%</span>
        <div className="w-px h-3 bg-slate-800"/>
        <span className="text-[10px] text-slate-600 font-mono">Scale: {scale}m/grid</span>
        <div className="w-px h-3 bg-slate-800"/>
        <span className={`text-[10px] font-mono ${snapGrid?"text-cyan-500":"text-slate-600"}`}>
          {snapGrid?"⊞ SNAP ON":"⊟ SNAP OFF"}
        </span>
        <div className="w-px h-3 bg-slate-800"/>
        <span className="text-[10px] text-slate-600 font-mono">Tool: <span className="text-slate-400 capitalize">{tool}</span></span>
        <div className="w-px h-3 bg-slate-800"/>
        <span className="text-[10px] text-slate-600 font-mono">Markups: {shapes.length}</span>
        {pdfLoaded && (<>
          <div className="w-px h-3 bg-slate-800"/>
          <span className="text-[10px] text-slate-600 font-mono">Page: {pageNum}/{totalPages}</span>
        </>)}
        <div className="flex-1"/>
        <span className="text-[10px] text-slate-700">Project Center Blueprint Editor</span>
      </div>
    </div>
  );
}