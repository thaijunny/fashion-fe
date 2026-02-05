'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Save, 
  Download, 
  Undo, 
  Redo, 
  ZoomIn, 
  ZoomOut,
  Type,
  Image as ImageIcon,
  Square,
  Circle,
  Triangle,
  Palette,
  Layers,
  Settings,
  ShoppingBag,
  Sparkles,
  Upload,
  Trash2,
  Copy,
  Move,
  RotateCw,
  RotateCcw,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  Eye,
  X,
  Lock,
  Unlock
} from 'lucide-react';

// Product templates with actual images (grouped by product type)
const productTypes = [
  {
    id: 'tshirt',
    name: 'Áo Thun',
    icon: '👕',
    width: 400,
    height: 500,
    variants: {
      front: {
        name: 'Mặt Trước',
        image: '/images/tshirt-front.png',
        designArea: { left: 25, top: 20, right: 25, bottom: 30 }
      },
      back: {
        name: 'Mặt Sau', 
        image: '/images/tshirt-back.png',
        designArea: { left: 25, top: 15, right: 25, bottom: 25 }
      }
    }
  },
  {
    id: 'hoodie',
    name: 'Hoodie',
    icon: '🧥',
    width: 450,
    height: 550,
    variants: {
      front: {
        name: 'Mặt Trước',
        image: '/images/hoodie-front.png',
        designArea: { left: 28, top: 25, right: 28, bottom: 35 }
      },
      back: {
        name: 'Mặt Sau',
        image: '/images/hoodie-back.png',
        designArea: { left: 25, top: 18, right: 25, bottom: 28 }
      }
    }
  },
];

// Sample shapes
const shapes = [
  { id: 'rect', name: 'Hình vuông', icon: Square },
  { id: 'circle', name: 'Hình tròn', icon: Circle },
  { id: 'triangle', name: 'Tam giác', icon: Triangle },
];

// Sample colors
const colorPalette = [
  '#e60012', '#f0ff00', '#ffffff', '#000000', 
  '#1a1a1a', '#ff6b00', '#00ff88', '#0088ff',
  '#ff00ff', '#8b00ff', '#00ffff', '#ffff00'
];

// Sample stickers/graphics
const stickers = [
  '🔥', '⚡', '💀', '🎸', '🎤', '🏀', '🎯', '💎',
  '🦅', '🐉', '🌟', '💥', '🎨', '🎭', '🎪', '🎲'
];

// Fonts (Google Fonts with Vietnamese support)
const fontOptions = [
  { id: 'be-vietnam', name: 'Be Vietnam Pro', value: "'Be Vietnam Pro', sans-serif", style: 'Hiện đại' },
  { id: 'roboto', name: 'Roboto', value: "'Roboto', sans-serif", style: 'Sạch sẽ' },
  { id: 'montserrat', name: 'Montserrat', value: "'Montserrat', sans-serif", style: 'Đậm' },
  { id: 'oswald', name: 'Oswald', value: "'Oswald', sans-serif", style: 'Condensed' },
  { id: 'playfair', name: 'Playfair Display', value: "'Playfair Display', serif", style: 'Sang trọng' },
  { id: 'dancing', name: 'Dancing Script', value: "'Dancing Script', cursive", style: 'Script' },
  { id: 'permanent-marker', name: 'Permanent Marker', value: "'Permanent Marker', cursive", style: 'Graffiti' },
  { id: 'bangers', name: 'Bangers', value: "'Bangers', cursive", style: 'Comic' },
  { id: 'archivo-black', name: 'Archivo Black', value: "'Archivo Black', sans-serif", style: 'Heavy' },
  { id: 'anton', name: 'Anton', value: "'Anton', sans-serif", style: 'Impact' },
  { id: 'righteous', name: 'Righteous', value: "'Righteous', cursive", style: 'Retro' },
  { id: 'russo-one', name: 'Russo One', value: "'Russo One', sans-serif", style: 'Tech' },
];

// Street-style text templates
const textTemplates = [
  { 
    id: 'street-1', 
    content: 'STREET VIBES', 
    fontSize: 36, 
    fontFamily: "'Anton', sans-serif",
    fontWeight: '400',
    color: '#ffffff',
    preview: 'STREET VIBES'
  },
  { 
    id: 'street-2', 
    content: 'KHÔNG GIỚI HẠN', 
    fontSize: 32, 
    fontFamily: "'Be Vietnam Pro', sans-serif",
    fontWeight: '900',
    color: '#e60012',
    preview: 'KHÔNG GIỚI HẠN'
  },
  { 
    id: 'street-3', 
    content: 'BORN TO BE WILD', 
    fontSize: 28, 
    fontFamily: "'Permanent Marker', cursive",
    fontWeight: '400',
    color: '#f0ff00',
    preview: 'BORN TO BE WILD'
  },
  { 
    id: 'street-4', 
    content: 'URBAN STYLE', 
    fontSize: 40, 
    fontFamily: "'Oswald', sans-serif",
    fontWeight: '700',
    color: '#ffffff',
    preview: 'URBAN STYLE'
  },
  { 
    id: 'street-5', 
    content: 'REBEL SOUL', 
    fontSize: 34, 
    fontFamily: "'Bangers', cursive",
    fontWeight: '400',
    color: '#00ff88',
    preview: 'REBEL SOUL'
  },
  { 
    id: 'street-6', 
    content: 'PHÁ CÁCH', 
    fontSize: 38, 
    fontFamily: "'Archivo Black', sans-serif",
    fontWeight: '400',
    color: '#ff6b00',
    preview: 'PHÁ CÁCH'
  },
  { 
    id: 'street-7', 
    content: 'NO RULES', 
    fontSize: 30, 
    fontFamily: "'Russo One', sans-serif",
    fontWeight: '400',
    color: '#0088ff',
    preview: 'NO RULES'
  },
  { 
    id: 'street-8', 
    content: 'TỰ DO', 
    fontSize: 42, 
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: '900',
    color: '#ff00ff',
    preview: 'TỰ DO'
  },
];

interface DesignElement {
  id: string;
  type: 'text' | 'shape' | 'image' | 'sticker';
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  color?: string;
  fontSize?: number;
  fontWeight?: string;
  fontFamily?: string;
  rotation?: number;
  opacity?: number; // 0-100
  textAlign?: 'left' | 'center' | 'right';
  // Advanced text styling
  textBgColor?: string;
  textShadow?: { x: number; y: number; blur: number; color: string };
  textOutline?: { width: number; color: string };
  autoResize?: boolean;
  isLocked?: boolean;
}

// Helper function to get rotated cursor for resize handles
const getRotatedCursor = (handle: string, rotation: number = 0): string => {
  // Normalize rotation to 0-360
  const normalizedRotation = ((rotation % 360) + 360) % 360;
  
  // Define cursor order (clockwise from north)
  const cursors = ['n-resize', 'ne-resize', 'e-resize', 'se-resize', 's-resize', 'sw-resize', 'w-resize', 'nw-resize'];
  
  // Map handle to starting index
  const handleMap: { [key: string]: number } = {
    'n': 0, 'ne': 1, 'e': 2, 'se': 3, 's': 4, 'sw': 5, 'w': 6, 'nw': 7
  };
  
  const startIndex = handleMap[handle] ?? 0;
  
  // Calculate how many 45-degree steps to rotate
  const steps = Math.round(normalizedRotation / 45) % 8;
  
  // Get new cursor index
  const newIndex = (startIndex + steps) % 8;
  
  return cursors[newIndex];
};

export default function StudioPage() {
  const [selectedProduct, setSelectedProduct] = useState(productTypes[0]);
  const [viewSide, setViewSide] = useState<'front' | 'back'>('front');
  const [activeTab, setActiveTab] = useState<'templates' | 'text' | 'shapes' | 'images' | 'stickers'>('templates');
  
  // Separate elements for front and back
  const [frontElements, setFrontElements] = useState<DesignElement[]>([]);
  const [backElements, setBackElements] = useState<DesignElement[]>([]);
  
  // Get current elements based on view side
  const elements = viewSide === 'front' ? frontElements : backElements;
  const setElements = viewSide === 'front' ? setFrontElements : setBackElements;
  
  const [selectedElementIds, setSelectedElementIds] = useState<string[]>([]);
  const [zoom, setZoom] = useState(100);
  const [designName, setDesignName] = useState('Thiết kế mới');
  const canvasRef = useRef<HTMLDivElement>(null);
  const mainAreaRef = useRef<HTMLElement>(null);
  
  // Preview modal state
  const [showPreview, setShowPreview] = useState(false);
  const [previewMode, setPreviewMode] = useState<'3d' | '2d'>('3d');
  const [previewRotation, setPreviewRotation] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(true);

  // Get current view data
  const currentView = selectedProduct.variants[viewSide];

  // Handle product change - reset all elements
  const handleProductChange = (product: typeof productTypes[0]) => {
    setSelectedProduct(product);
    setFrontElements([]);
    setBackElements([]);
    setSelectedElementIds([]);
    setViewSide('front');
  };

  // Clear selection when switching sides
  const handleViewSideChange = (side: 'front' | 'back') => {
    setViewSide(side);
    setSelectedElementIds([]);
  };

  // History stacks for undo/redo (separate for front and back)
  const [frontHistory, setFrontHistory] = useState<DesignElement[][]>([[]]);
  const [frontHistoryIndex, setFrontHistoryIndex] = useState(0);
  const [backHistory, setBackHistory] = useState<DesignElement[][]>([[]]);
  const [backHistoryIndex, setBackHistoryIndex] = useState(0);

  const history = viewSide === 'front' ? frontHistory : backHistory;
  const setHistory = viewSide === 'front' ? setFrontHistory : setBackHistory;
  const historyIndex = viewSide === 'front' ? frontHistoryIndex : backHistoryIndex;
  const setHistoryIndex = viewSide === 'front' ? setFrontHistoryIndex : setBackHistoryIndex;

  // Save to history when elements change (debounced approach)
  const saveToHistory = (newElements: DesignElement[]) => {
    const currentHistory = viewSide === 'front' ? frontHistory : backHistory;
    const currentIndex = viewSide === 'front' ? frontHistoryIndex : backHistoryIndex;
    
    // Slice history up to current index and add new state
    const newHistory = [...currentHistory.slice(0, currentIndex + 1), newElements];
    // Limit history to 50 steps
    const limitedHistory = newHistory.slice(-50);
    
    if (viewSide === 'front') {
      setFrontHistory(limitedHistory);
      setFrontHistoryIndex(limitedHistory.length - 1);
    } else {
      setBackHistory(limitedHistory);
      setBackHistoryIndex(limitedHistory.length - 1);
    }
  };

  // Undo function
  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      isUndoRedoingRef.current = true;
      setElements(history[newIndex]);
      setSelectedElementIds([]);
    }
  };

  // Redo function
  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      isUndoRedoingRef.current = true;
      setElements(history[newIndex]);
      setSelectedElementIds([]);
    }
  };

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;
  
  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const designAreaRef = useRef<HTMLDivElement>(null);
  
  // Text editing state
  const [editingTextId, setEditingTextId] = useState<string | null>(null);

  // Track if change is from undo/redo
  const isUndoRedoingRef = useRef(false);
  
  // Clipboard for copy/paste
  const [clipboard, setClipboard] = useState<DesignElement | null>(null);

  // Auto-save to history when elements change
  React.useEffect(() => {
    if (isUndoRedoingRef.current) {
      isUndoRedoingRef.current = false;
      return;
    }
    // Save to history on element changes (but not from undo/redo)
    const currentElements = viewSide === 'front' ? frontElements : backElements;
    const currentHistory = viewSide === 'front' ? frontHistory : backHistory;
    const lastHistoryState = currentHistory[currentHistory.length - 1];
    
    // Only save if actually different
    if (JSON.stringify(currentElements) !== JSON.stringify(lastHistoryState)) {
      saveToHistory(currentElements);
    }
  }, [frontElements, backElements]);

  // Resize & Rotate state
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  
  const [isRotating, setIsRotating] = useState(false);
  const [rotateStart, setRotateStart] = useState({ angle: 0, centerX: 0, centerY: 0 });

  // Auto-rotation for 3D preview
  useEffect(() => {
    if (!showPreview || !isAutoRotating) return;
    
    const interval = setInterval(() => {
      setPreviewRotation(r => r + 180);
    }, 3000); // Flip every 3 seconds
    
    return () => clearInterval(interval);
  }, [showPreview, isAutoRotating]);

  // Zoom with mouse wheel
  React.useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -10 : 10;
        setZoom(z => Math.min(300, Math.max(25, z + delta)));
      }
    };

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      if (canvas) {
        canvas.removeEventListener('wheel', handleWheel);
      }
    };
  }, []);

  // Zoom presets
  const zoomPresets = [25, 50, 75, 100, 125, 150, 200, 300];
  const [showZoomMenu, setShowZoomMenu] = useState(false);

  // Handle keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if user is typing in an input
      const activeElement = document.activeElement;
      const tagName = activeElement?.tagName.toLowerCase();
      const isTyping = tagName === 'input' || tagName === 'textarea' || 
                       activeElement?.getAttribute('contenteditable') === 'true' ||
                       editingTextId !== null;

      // Undo: Ctrl+Z
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }

      // Redo: Ctrl+Y or Ctrl+Shift+Z
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
        return;
      }

      // Duplicate: Ctrl+D
      if ((e.ctrlKey || e.metaKey) && e.key === 'd' && selectedElementIds.length > 0 && !isTyping) {
        e.preventDefault();
        duplicateSelectedElement();
        return;
      }

      // Copy: Ctrl+C
      if ((e.ctrlKey || e.metaKey) && e.key === 'c' && selectedElementIds.length > 0 && !isTyping) {
        e.preventDefault();
        copySelectedElement();
        return;
      }

      // Paste: Ctrl+V
      if ((e.ctrlKey || e.metaKey) && e.key === 'v' && !isTyping) {
        e.preventDefault();
        pasteElement();
        return;
      }

      // Delete element
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElementIds.length > 0 && !isTyping) {
        e.preventDefault();
        deleteSelectedElement();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElementIds, editingTextId, historyIndex, history]);

  // Mouse move handler for dragging
  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || selectedElementIds.length === 0 || !designAreaRef.current) return;

      const rect = designAreaRef.current.getBoundingClientRect();
      const scale = zoom / 100;
      
      const deltaX = (e.clientX - dragOffset.x) / scale;
      const deltaY = (e.clientY - dragOffset.y) / scale;

      if (deltaX === 0 && deltaY === 0) return;

      setElements(prev => prev.map(el =>
        selectedElementIds.includes(el.id) && !el.isLocked
          ? { ...el, x: Math.max(0, el.x + deltaX), y: Math.max(0, el.y + deltaY) }
          : el
      ));

      setDragOffset({
        x: e.clientX,
        y: e.clientY,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, selectedElementIds, dragOffset, zoom]);

  // Resize mouse move handler
  React.useEffect(() => {
    const handleResizeMove = (e: MouseEvent) => {
      if (!isResizing || selectedElementIds.length === 0 || !resizeHandle) return;

      const element = elements.find(el => el.id === selectedElementIds[0]);
      if (!element) return;

      const scale = zoom / 100;
      const rawDeltaX = (e.clientX - resizeStart.x) / scale;
      const rawDeltaY = (e.clientY - resizeStart.y) / scale;

      // Transform delta based on element rotation
      const rotation = element.rotation || 0;
      const radians = -rotation * (Math.PI / 180);
      const cos = Math.cos(radians);
      const sin = Math.sin(radians);
      
      // Rotate the delta to align with element's local coordinates
      const deltaX = rawDeltaX * cos - rawDeltaY * sin;
      const deltaY = rawDeltaX * sin + rawDeltaY * cos;

      let newWidth = resizeStart.width;
      let newHeight = resizeStart.height;

      if (resizeHandle.includes('e')) newWidth = Math.max(30, resizeStart.width + deltaX);
      if (resizeHandle.includes('w')) newWidth = Math.max(30, resizeStart.width - deltaX);
      if (resizeHandle.includes('s')) newHeight = Math.max(30, resizeStart.height + deltaY);
      if (resizeHandle.includes('n')) newHeight = Math.max(30, resizeStart.height - deltaY);

      setElements(prev => prev.map(el =>
        el.id === selectedElementIds[0]
          ? { ...el, width: newWidth, height: newHeight }
          : el
      ));
    };

    const handleResizeUp = () => {
      setIsResizing(false);
      setResizeHandle(null);
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleResizeMove);
      window.addEventListener('mouseup', handleResizeUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleResizeMove);
      window.removeEventListener('mouseup', handleResizeUp);
    };
  }, [isResizing, selectedElementIds, resizeHandle, resizeStart, zoom, elements]);

  // Rotate mouse move handler
  React.useEffect(() => {
    const handleRotateMove = (e: MouseEvent) => {
      if (!isRotating || selectedElementIds.length === 0) return;

      const dx = e.clientX - rotateStart.centerX;
      const dy = e.clientY - rotateStart.centerY;
      const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;

      setElements(prev => prev.map(el =>
        el.id === selectedElementIds[0]
          ? { ...el, rotation: Math.round(angle) }
          : el
      ));
    };

    const handleRotateUp = () => {
      setIsRotating(false);
    };

    if (isRotating) {
      window.addEventListener('mousemove', handleRotateMove);
      window.addEventListener('mouseup', handleRotateUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleRotateMove);
      window.removeEventListener('mouseup', handleRotateUp);
    };
  }, [isRotating, selectedElementIds, rotateStart]);

  // Start resizing
  const handleResizeStart = (e: React.MouseEvent, handle: string) => {
    e.stopPropagation();
    const element = elements.find(el => el.id === selectedElementIds[0]);
    if (!element) return;

    setIsResizing(true);
    setResizeHandle(handle);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: element.width,
      height: element.height,
    });
  };

  // Start rotating
  const handleRotateStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    const element = elements.find(el => el.id === selectedElementIds[0]);
    if (!element || !designAreaRef.current) return;

    const rect = designAreaRef.current.getBoundingClientRect();
    const scale = zoom / 100;
    const centerX = rect.left + (element.x + element.width / 2) * scale;
    const centerY = rect.top + (element.y + element.height / 2) * scale;

    setIsRotating(true);
    setRotateStart({
      angle: element.rotation || 0,
      centerX,
      centerY,
    });
  };

  // Start dragging an element
  const handleMouseDown = (e: React.MouseEvent, elementId: string) => {
    e.stopPropagation();
    const element = elements.find(el => el.id === elementId);
    if (!element || !designAreaRef.current || element.isLocked) return;

    const rect = designAreaRef.current.getBoundingClientRect();
    const scale = zoom / 100;
    
    // Multi-select with Shift key
    if (e.shiftKey) {
      if (selectedElementIds.includes(elementId)) {
        setSelectedElementIds(selectedElementIds.filter(id => id !== elementId));
      } else {
        setSelectedElementIds([...selectedElementIds, elementId]);
      }
    } else {
      // If element is not already selected, select only it
      if (!selectedElementIds.includes(elementId)) {
        setSelectedElementIds([elementId]);
      }
    }

    setIsDragging(true);
    setDragOffset({
      x: e.clientX,
      y: e.clientY,
    });
  };

  const addTextElement = (fontFamily?: string) => {
    const newElement: DesignElement = {
      id: `text-${Date.now()}`,
      type: 'text',
      x: 80,
      y: 120,
      width: 200,
      height: 50,
      content: 'Nhập text...',
      color: '#ffffff',
      fontSize: 24,
      fontWeight: 'bold',
      fontFamily: fontFamily || "'Be Vietnam Pro', sans-serif",
    };
    setElements([...elements, newElement]);
    setSelectedElementIds([newElement.id]);
  };

  const addTextFromTemplate = (template: typeof textTemplates[0]) => {
    const newElement: DesignElement = {
      id: `text-${Date.now()}`,
      type: 'text',
      x: 50,
      y: 100,
      width: 250,
      height: 60,
      content: template.content,
      color: template.color,
      fontSize: template.fontSize,
      fontWeight: template.fontWeight,
      fontFamily: template.fontFamily,
    };
    setElements([...elements, newElement]);
    setSelectedElementIds([newElement.id]);
  };

  const addShapeElement = (shapeType: string) => {
    const newElement: DesignElement = {
      id: `shape-${Date.now()}`,
      type: 'shape',
      x: 150,
      y: 200,
      width: 100,
      height: 100,
      content: shapeType,
      color: '#e60012',
    };
    setElements([...elements, newElement]);
    setSelectedElementIds([newElement.id]);
  };

  const addStickerElement = (sticker: string) => {
    const newElement: DesignElement = {
      id: `sticker-${Date.now()}`,
      type: 'sticker',
      x: 180,
      y: 220,
      width: 60,
      height: 60,
      content: sticker,
    };
    setElements([...elements, newElement]);
    setSelectedElementIds([newElement.id]);
  };

  // Image upload handler
  const addImageElement = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const dataUrl = event.target?.result as string;
          // Create image to get natural dimensions
          const img = new Image();
          img.onload = () => {
            // Scale down if too large, max 200px width
            const maxWidth = 200;
            const scale = img.width > maxWidth ? maxWidth / img.width : 1;
            const newElement: DesignElement = {
              id: `image-${Date.now()}`,
              type: 'image',
              x: 100,
              y: 150,
              width: img.width * scale,
              height: img.height * scale,
              content: dataUrl,
              opacity: 100,
            };
            setElements([...elements, newElement]);
            setSelectedElementIds([newElement.id]);
          };
          img.src = dataUrl;
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const deleteSelectedElement = () => {
    if (selectedElementIds.length > 0) {
      setElements(elements.filter(el => !selectedElementIds.includes(el.id)));
      setSelectedElementIds([]);
    }
  };

  const duplicateSelectedElement = () => {
    if (selectedElementIds.length > 0) {
      const selectedElements = elements.filter(el => selectedElementIds.includes(el.id));
      const newElements = selectedElements.map(element => ({
        ...element,
        id: `${element.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        x: element.x + 20,
        y: element.y + 20,
      }));
      setElements([...elements, ...newElements]);
      setSelectedElementIds(newElements.map(el => el.id));
    }
  };

  // Copy/Paste functions
  // Clipboard for multi-copy
  const [multiClipboard, setMultiClipboard] = useState<DesignElement[]>([]);

  const copySelectedElement = () => {
    if (selectedElementIds.length > 0) {
      const selectedElements = elements.filter(el => selectedElementIds.includes(el.id));
      setMultiClipboard(selectedElements.map(el => ({ ...el })));
    }
  };

  const pasteElement = () => {
    if (multiClipboard.length > 0) {
      const newElements = multiClipboard.map(el => ({
        ...el,
        id: `${el.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        x: el.x + 30,
        y: el.y + 30,
      }));
      setElements([...elements, ...newElements]);
      setSelectedElementIds(newElements.map(el => el.id));
    }
  };

  // Layer ordering functions
  const bringToFront = () => {
    if (selectedElementIds.length === 0) return;
    const selected = elements.filter(el => selectedElementIds.includes(el.id));
    const others = elements.filter(el => !selectedElementIds.includes(el.id));
    setElements([...others, ...selected]);
  };

  const sendToBack = () => {
    if (selectedElementIds.length === 0) return;
    const selected = elements.filter(el => selectedElementIds.includes(el.id));
    const others = elements.filter(el => !selectedElementIds.includes(el.id));
    setElements([...selected, ...others]);
  };

  const bringForward = () => {
    if (selectedElementIds.length === 0) return;
    const index = elements.findIndex(el => el.id === selectedElementIds[0]);
    if (index === -1 || index === elements.length - 1) return;
    const newElements = [...elements];
    [newElements[index], newElements[index + 1]] = [newElements[index + 1], newElements[index]];
    setElements(newElements);
  };

  const sendBackward = () => {
    if (selectedElementIds.length === 0) return;
    const index = elements.findIndex(el => el.id === selectedElementIds[0]);
    if (index <= 0) return;
    const newElements = [...elements];
    [newElements[index], newElements[index - 1]] = [newElements[index - 1], newElements[index]];
    setElements(newElements);
  };

  // Alignment functions (relative to design area)
  const alignElementLeft = () => {
    if (selectedElementIds.length === 0) return;
    setElements(elements.map(el => 
      selectedElementIds.includes(el.id) ? { ...el, x: 0 } : el
    ));
  };

  const alignElementCenter = () => {
    if (selectedElementIds.length === 0 || !designAreaRef.current) return;
    const designAreaWidth = designAreaRef.current.clientWidth / (zoom / 100);
    setElements(elements.map(el => {
      if (selectedElementIds.includes(el.id)) {
        return { ...el, x: (designAreaWidth - el.width) / 2 };
      }
      return el;
    }));
  };

  const alignElementRight = () => {
    if (selectedElementIds.length === 0 || !designAreaRef.current) return;
    const designAreaWidth = designAreaRef.current.clientWidth / (zoom / 100);
    setElements(elements.map(el => {
      if (selectedElementIds.includes(el.id)) {
        return { ...el, x: designAreaWidth - el.width };
      }
      return el;
    }));
  };

  // Update functions
  const updateElementColor = (color: string) => {
    if (selectedElementIds.length > 0) {
      setElements(elements.map(el => 
        selectedElementIds.includes(el.id) ? { ...el, color } : el
      ));
    }
  };

  const updateElementOpacity = (opacity: number) => {
    if (selectedElementIds.length > 0) {
      setElements(elements.map(el => 
        selectedElementIds.includes(el.id) ? { ...el, opacity } : el
      ));
    }
  };

  const updateTextAlign = (textAlign: 'left' | 'center' | 'right') => {
    if (selectedElementIds.length > 0) {
      setElements(elements.map(el => 
        selectedElementIds.includes(el.id) ? { ...el, textAlign } : el
      ));
    }
  };

  const selectedElement = elements.find(el => el.id === selectedElementIds[0]);

  return (
    <div className="fixed inset-0 bg-[#0a0a0a] flex flex-col" style={{ marginTop: 0, paddingTop: 0 }}>
      {/* Studio Header */}
      <header className="h-14 bg-[#1a1a1a] border-b border-[#2a2a2a] flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="h-6 w-px bg-[#2a2a2a]" />
          <input
            type="text"
            value={designName}
            onChange={(e) => setDesignName(e.target.value)}
            className="bg-transparent text-white font-medium focus:outline-none focus:bg-[#2a2a2a] px-2 py-1 rounded"
          />
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={undo}
            disabled={!canUndo}
            className={`p-2 transition-colors ${canUndo ? 'text-gray-400 hover:text-white' : 'text-gray-600 cursor-not-allowed'}`}
            title="Hoàn tác (Ctrl+Z)"
          >
            <Undo size={18} />
          </button>
          <button 
            onClick={redo}
            disabled={!canRedo}
            className={`p-2 transition-colors ${canRedo ? 'text-gray-400 hover:text-white' : 'text-gray-600 cursor-not-allowed'}`}
            title="Làm lại (Ctrl+Y)"
          >
            <Redo size={18} />
          </button>
          <div className="h-6 w-px bg-[#2a2a2a] mx-2" />
          <button 
            onClick={() => setZoom(z => Math.max(25, z - 10))}
            className="p-2 text-gray-400 hover:text-white transition-colors" 
            title="Zoom Out (hoặc Ctrl + Scroll)"
          >
            <ZoomOut size={18} />
          </button>
          
          {/* Zoom dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowZoomMenu(!showZoomMenu)}
              className="text-gray-400 hover:text-white text-sm w-16 text-center py-1 px-2 rounded hover:bg-[#2a2a2a] transition-colors"
            >
              {zoom}%
            </button>
            {showZoomMenu && (
              <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg shadow-xl z-50 py-1">
                {zoomPresets.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => {
                      setZoom(preset);
                      setShowZoomMenu(false);
                    }}
                    className={`w-full px-4 py-1.5 text-sm text-left hover:bg-[#2a2a2a] transition-colors ${
                      zoom === preset ? 'text-[#e60012]' : 'text-gray-300'
                    }`}
                  >
                    {preset}%
                  </button>
                ))}
                <div className="border-t border-[#2a2a2a] mt-1 pt-1">
                  <button
                    onClick={() => {
                      setZoom(100);
                      setShowZoomMenu(false);
                    }}
                    className="w-full px-4 py-1.5 text-sm text-left text-gray-400 hover:bg-[#2a2a2a] hover:text-white transition-colors"
                  >
                    Fit to Screen
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <button 
            onClick={() => setZoom(z => Math.min(300, z + 10))}
            className="p-2 text-gray-400 hover:text-white transition-colors" 
            title="Zoom In (hoặc Ctrl + Scroll)"
          >
            <ZoomIn size={18} />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              setShowPreview(true);
              setPreviewRotation(0);
              setIsAutoRotating(true);
            }}
            className="px-4 py-2 text-gray-300 hover:text-white transition-colors flex items-center gap-2 bg-[#2a2a2a] rounded"
          >
            <Eye size={16} />
            Xem trước
          </button>
          <button className="px-4 py-2 text-gray-300 hover:text-white transition-colors flex items-center gap-2">
            <Save size={16} />
            Lưu
          </button>
          <button className="px-4 py-2 text-gray-300 hover:text-white transition-colors flex items-center gap-2">
            <Download size={16} />
            Tải xuống
          </button>
          <button className="btn-street text-sm py-2 flex items-center gap-2">
            <ShoppingBag size={16} />
            Đặt hàng
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Tools */}
        <aside className="w-16 bg-[#1a1a1a] border-r border-[#2a2a2a] flex flex-col items-center py-4 gap-2">
          {[
            { id: 'templates', icon: Layers, label: 'Templates' },
            { id: 'text', icon: Type, label: 'Text' },
            { id: 'shapes', icon: Square, label: 'Shapes' },
            { id: 'images', icon: ImageIcon, label: 'Images' },
            { id: 'stickers', icon: Sparkles, label: 'Stickers' },
          ].map((tool) => (
            <button
              key={tool.id}
              onClick={() => setActiveTab(tool.id as typeof activeTab)}
              className={`w-12 h-12 flex flex-col items-center justify-center rounded transition-colors ${
                activeTab === tool.id
                  ? 'bg-[#e60012] text-white'
                  : 'text-gray-400 hover:bg-[#2a2a2a] hover:text-white'
              }`}
              title={tool.label}
            >
              <tool.icon size={20} />
            </button>
          ))}
        </aside>

        {/* Left Panel - Options */}
        <aside className="w-72 bg-[#0f0f0f] border-r border-[#2a2a2a] overflow-y-auto">
          <div className="p-4">
            {activeTab === 'templates' && (
              <>
                <h3 className="text-white font-bold mb-4">Chọn sản phẩm</h3>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {productTypes.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => handleProductChange(product)}
                      className={`p-2 rounded-lg border transition-all ${
                        selectedProduct.id === product.id
                          ? 'border-[#e60012] bg-[#e60012]/10'
                          : 'border-[#2a2a2a] hover:border-[#e60012]/50'
                      }`}
                    >
                      <img 
                        src={product.variants.front.image} 
                        alt={product.name}
                        className="w-full h-20 object-contain mb-2"
                      />
                      <span className="text-xs text-gray-300 block truncate">{product.name}</span>
                    </button>
                  ))}
                </div>

                {/* Front/Back Toggle */}
                <h3 className="text-white font-bold mb-3">Góc nhìn</h3>
                <div className="flex gap-2 bg-[#1a1a1a] p-1 rounded-lg">
                  <button
                    onClick={() => handleViewSideChange('front')}
                    className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                      viewSide === 'front'
                        ? 'bg-[#e60012] text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Mặt Trước
                  </button>
                  <button
                    onClick={() => handleViewSideChange('back')}
                    className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                      viewSide === 'back'
                        ? 'bg-[#e60012] text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Mặt Sau
                  </button>
                </div>
              </>
            )}

            {activeTab === 'text' && (
              <>
                <h3 className="text-white font-bold mb-3">Mẫu Text Street</h3>
                <div className="space-y-2 mb-6 max-h-[300px] overflow-auto">
                  {textTemplates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => addTextFromTemplate(template)}
                      className="w-full p-3 bg-[#1a1a1a] text-left hover:bg-[#2a2a2a] transition-colors rounded-lg border border-[#2a2a2a] hover:border-[#e60012]"
                    >
                      <span 
                        style={{ 
                          color: template.color, 
                          fontFamily: template.fontFamily,
                          fontWeight: template.fontWeight,
                          fontSize: '16px'
                        }}
                      >
                        {template.preview}
                      </span>
                    </button>
                  ))}
                </div>

                <h3 className="text-white font-bold mb-3">Thêm Text Trống</h3>
                <button
                  onClick={() => addTextElement()}
                  className="w-full p-4 border border-dashed border-[#2a2a2a] text-gray-400 hover:border-[#e60012] hover:text-[#e60012] transition-colors rounded-lg mb-4"
                >
                  + Thêm tiêu đề mới
                </button>

                <h3 className="text-white font-bold mb-3">Fonts</h3>
                <div className="space-y-1 max-h-[200px] overflow-auto">
                  {fontOptions.map((font) => (
                    <button
                      key={font.id}
                      onClick={() => addTextElement(font.value)}
                      className="w-full p-2 bg-[#1a1a1a] text-left hover:bg-[#2a2a2a] transition-colors rounded flex justify-between items-center"
                    >
                      <span 
                        className="text-white"
                        style={{ fontFamily: font.value }}
                      >
                        {font.name}
                      </span>
                      <span className="text-xs text-gray-500">{font.style}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {activeTab === 'shapes' && (
              <>
                <h3 className="text-white font-bold mb-4">Hình dạng</h3>
                <div className="grid grid-cols-3 gap-2">
                  {shapes.map((shape) => (
                    <button
                      key={shape.id}
                      onClick={() => addShapeElement(shape.id)}
                      className="aspect-square flex items-center justify-center bg-[#1a1a1a] hover:bg-[#2a2a2a] transition-colors rounded"
                    >
                      <shape.icon size={28} className="text-gray-300" />
                    </button>
                  ))}
                </div>
                
                <h3 className="text-white font-bold mt-6 mb-4">Màu sắc</h3>
                <div className="grid grid-cols-6 gap-2">
                  {colorPalette.map((color) => (
                    <button
                      key={color}
                      onClick={() => updateElementColor(color)}
                      className="w-8 h-8 rounded border-2 border-[#2a2a2a] hover:border-white transition-colors"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </>
            )}

            {activeTab === 'images' && (
              <>
                <h3 className="text-white font-bold mb-4">Hình ảnh</h3>
                <button 
                  onClick={addImageElement}
                  className="w-full p-6 border border-dashed border-[#2a2a2a] text-gray-400 hover:border-[#e60012] hover:text-[#e60012] transition-colors rounded-lg flex flex-col items-center gap-2"
                >
                  <Upload size={24} />
                  <span>Tải ảnh lên</span>
                </button>
                <p className="text-gray-500 text-xs mt-2 text-center">
                  Hỗ trợ: JPG, PNG, SVG
                </p>
              </>
            )}

            {activeTab === 'stickers' && (
              <>
                <h3 className="text-white font-bold mb-4">Stickers & Icons</h3>
                <div className="grid grid-cols-4 gap-2">
                  {stickers.map((sticker, index) => (
                    <button
                      key={index}
                      onClick={() => addStickerElement(sticker)}
                      className="aspect-square flex items-center justify-center text-2xl bg-[#1a1a1a] hover:bg-[#2a2a2a] transition-colors rounded"
                    >
                      {sticker}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </aside>

        {/* Canvas Area */}
        <main 
          ref={mainAreaRef}
          className="flex-1 bg-[#0a0a0a] flex items-center justify-center p-8 overflow-auto"
        >
          <div 
            ref={canvasRef}
            className="relative bg-[#1a1a1a] shadow-2xl flex-shrink-0"
            style={{ 
              width: selectedProduct.width * (zoom / 100), 
              height: selectedProduct.height * (zoom / 100),
              minWidth: selectedProduct.width * (zoom / 100),
              minHeight: selectedProduct.height * (zoom / 100),
            }}
          >
            {/* Product Template Background Image */}
            <img 
              src={currentView.image} 
              alt={`${selectedProduct.name} - ${currentView.name}`}
              className="absolute inset-0 w-full h-full object-contain pointer-events-none"
              style={{ opacity: 1 }}
            />

            {/* Design Area */}
            <div 
              ref={designAreaRef}
              className="absolute"
              style={{
                left: `${currentView.designArea?.left || 15}%`,
                top: `${currentView.designArea?.top || 15}%`,
                right: `${currentView.designArea?.right || 15}%`,
                bottom: `${currentView.designArea?.bottom || 25}%`,
              }}
              onClick={() => setSelectedElementIds([])}
            >
              {/* Render Elements */}
              {elements.map((element) => (
                <div
                  key={element.id}
                  onMouseDown={(e) => {
                    if (editingTextId === element.id || element.isLocked) return; 
                    handleMouseDown(e, element.id);
                  }}
                  onClick={(e) => {
                    e.stopPropagation(); 
                  }}
                  onDoubleClick={() => {
                    if (element.type === 'text' && !element.isLocked) {
                      setEditingTextId(element.id);
                      setSelectedElementIds([element.id]);
                    }
                  }}
                  className={`absolute transition-shadow select-none ${
                    selectedElementIds.includes(element.id) 
                      ? 'ring-2 ring-[#e60012] ring-offset-2 ring-offset-[#1a1a1a]' 
                      : 'hover:ring-1 hover:ring-[#e60012]/50'
                  } ${element.isLocked ? 'cursor-not-allowed' : 'cursor-move'}
                  ${isDragging && selectedElementIds.includes(element.id) && !element.isLocked ? 'cursor-grabbing' : ''}
                  ${editingTextId === element.id ? 'cursor-text' : ''}`}
                  style={{
                    left: element.x * (zoom / 100),
                    top: element.y * (zoom / 100),
                    width: element.width * (zoom / 100),
                    height: element.height * (zoom / 100),
                    transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
                    userSelect: editingTextId === element.id ? 'text' : 'none',
                    opacity: (element.opacity ?? 100) / 100,
                  }}
                >
                  {element.type === 'text' && (
                    editingTextId === element.id ? (
                      <input
                        type="text"
                        autoFocus
                        value={element.content}
                        onChange={(e) => {
                          setElements(prev => prev.map(el => 
                            el.id === element.id ? { ...el, content: e.target.value } : el
                          ));
                        }}
                        onBlur={() => setEditingTextId(null)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === 'Escape') {
                            setEditingTextId(null);
                          }
                        }}
                        className="w-full h-full bg-transparent outline-none border-none"
                        style={{
                          color: element.color,
                          fontSize: (element.fontSize || 24) * (zoom / 100),
                          fontWeight: element.fontWeight,
                          fontFamily: element.fontFamily || "'Be Vietnam Pro', sans-serif",
                          textAlign: element.textAlign || 'center',
                          backgroundColor: element.textBgColor || 'transparent',
                          textShadow: element.textShadow 
                            ? `${element.textShadow.x}px ${element.textShadow.y}px ${element.textShadow.blur}px ${element.textShadow.color}` 
                            : undefined,
                          WebkitTextStroke: element.textOutline 
                            ? `${element.textOutline.width}px ${element.textOutline.color}` 
                            : undefined,
                          padding: element.textBgColor ? '4px 8px' : undefined,
                          borderRadius: element.textBgColor ? '4px' : undefined,
                        }}
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center outline-none pointer-events-none"
                        style={{
                          color: element.color,
                          fontSize: (element.fontSize || 24) * (zoom / 100),
                          fontWeight: element.fontWeight,
                          fontFamily: element.fontFamily || "'Be Vietnam Pro', sans-serif",
                          textAlign: element.textAlign || 'center',
                          justifyContent: element.textAlign === 'left' ? 'flex-start' : 
                                          element.textAlign === 'right' ? 'flex-end' : 'center',
                          backgroundColor: element.textBgColor || 'transparent',
                          textShadow: element.textShadow 
                            ? `${element.textShadow.x}px ${element.textShadow.y}px ${element.textShadow.blur}px ${element.textShadow.color}` 
                            : undefined,
                          WebkitTextStroke: element.textOutline 
                            ? `${element.textOutline.width}px ${element.textOutline.color}` 
                            : undefined,
                          padding: element.textBgColor ? '4px 8px' : undefined,
                          borderRadius: element.textBgColor ? '4px' : undefined,
                        }}
                      >
                        {element.content}
                      </div>
                    )
                  )}
                  {element.type === 'shape' && (
                    <div 
                      className="w-full h-full pointer-events-none"
                      style={{
                        backgroundColor: element.color,
                        borderRadius: element.content === 'circle' ? '50%' : 
                                      element.content === 'triangle' ? '0' : '0',
                        clipPath: element.content === 'triangle' 
                          ? 'polygon(50% 0%, 0% 100%, 100% 100%)' 
                          : undefined,
                      }}
                    />
                  )}
                  {element.type === 'sticker' && (
                    <div className="w-full h-full flex items-center justify-center text-4xl pointer-events-none">
                      {element.content}
                    </div>
                  )}
                  {element.type === 'image' && (
                    <img 
                      src={element.content} 
                      alt="Uploaded"
                      className="w-full h-full object-contain pointer-events-none"
                      draggable={false}
                    />
                  )}

                  {/* Resize Handles (show when ONLY ONE is selected and NOT locked) */}
                  {selectedElementIds.length === 1 && selectedElementIds[0] === element.id && !editingTextId && !element.isLocked && (
                    <>
                      {/* Corner handles */}
                      <div
                        onMouseDown={(e) => handleResizeStart(e, 'nw')}
                        className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-[#e60012] z-10"
                        style={{ cursor: getRotatedCursor('nw', element.rotation) }}
                      />
                      <div
                        onMouseDown={(e) => handleResizeStart(e, 'ne')}
                        className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-[#e60012] z-10"
                        style={{ cursor: getRotatedCursor('ne', element.rotation) }}
                      />
                      <div
                        onMouseDown={(e) => handleResizeStart(e, 'sw')}
                        className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-[#e60012] z-10"
                        style={{ cursor: getRotatedCursor('sw', element.rotation) }}
                      />
                      <div
                        onMouseDown={(e) => handleResizeStart(e, 'se')}
                        className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-[#e60012] z-10"
                        style={{ cursor: getRotatedCursor('se', element.rotation) }}
                      />
                      
                      {/* Side handles */}
                      <div
                        onMouseDown={(e) => handleResizeStart(e, 'n')}
                        className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-2 bg-white border border-[#e60012] z-10"
                        style={{ cursor: getRotatedCursor('n', element.rotation) }}
                      />
                      <div
                        onMouseDown={(e) => handleResizeStart(e, 's')}
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-2 bg-white border border-[#e60012] z-10"
                        style={{ cursor: getRotatedCursor('s', element.rotation) }}
                      />
                      <div
                        onMouseDown={(e) => handleResizeStart(e, 'w')}
                        className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-4 bg-white border border-[#e60012] z-10"
                        style={{ cursor: getRotatedCursor('w', element.rotation) }}
                      />
                      <div
                        onMouseDown={(e) => handleResizeStart(e, 'e')}
                        className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-4 bg-white border border-[#e60012] z-10"
                        style={{ cursor: getRotatedCursor('e', element.rotation) }}
                      />

                      {/* Rotation handle */}
                      <div
                        onMouseDown={handleRotateStart}
                        className="absolute -top-8 left-1/2 -translate-x-1/2 w-5 h-5 bg-[#e60012] rounded-full cursor-grab flex items-center justify-center z-10 hover:bg-[#ff1a2e] transition-colors"
                        title="Xoay"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                          <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
                        </svg>
                      </div>
                      {/* Line connecting to rotation handle */}
                      <div className="absolute -top-6 left-1/2 w-px h-4 bg-[#e60012] -translate-x-1/2" />
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Template Label */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-gray-500">
              {selectedProduct.name} ({currentView.name}) • {selectedProduct.width}x{selectedProduct.height}
            </div>
          </div>
        </main>

        {/* Right Sidebar - Element Properties */}
        <aside className="w-64 bg-[#0f0f0f] border-l border-[#2a2a2a] overflow-y-auto">
          <div className="p-4">
            {selectedElement ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-bold">Thuộc tính</h3>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setElements(elements.map(el => 
                          selectedElementIds.includes(el.id) ? { ...el, isLocked: !el.isLocked } : el
                        ));
                      }}
                      className={`p-2 transition-colors ${selectedElement.isLocked ? 'text-[#e60012]' : 'text-gray-400 hover:text-white'}`}
                      title={selectedElement.isLocked ? 'Mở khóa' : 'Khóa'}
                    >
                      {selectedElement.isLocked ? <Lock size={16} /> : <Unlock size={16} />}
                    </button>
                    <button
                      onClick={duplicateSelectedElement}
                      className="p-2 text-gray-400 hover:text-white transition-colors"
                      disabled={selectedElement.isLocked}
                      title="Nhân bản"
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      onClick={deleteSelectedElement}
                      className="p-2 text-gray-400 hover:text-[#e60012] transition-colors"
                      disabled={selectedElement.isLocked}
                      title="Xóa"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Layer Ordering */}
                <div className="mb-4">
                  <label className="text-gray-400 text-sm mb-2 block">Sắp xếp lớp</label>
                  <div className="grid grid-cols-4 gap-1">
                    <button
                      onClick={bringToFront}
                      disabled={selectedElement.isLocked}
                      className={`p-2 bg-[#1a1a1a] transition-colors rounded text-xs flex flex-col items-center gap-1 ${
                        selectedElement.isLocked ? 'text-gray-600 grayscale' : 'text-gray-400 hover:text-white hover:bg-[#2a2a2a]'
                      }`}
                      title="Lên trên cùng"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 5l0 14M5 12l7-7 7 7" />
                      </svg>
                      <span>Top</span>
                    </button>
                    <button
                      onClick={bringForward}
                      disabled={selectedElement.isLocked}
                      className={`p-2 bg-[#1a1a1a] transition-colors rounded text-xs flex flex-col items-center gap-1 ${
                        selectedElement.isLocked ? 'text-gray-600 grayscale' : 'text-gray-400 hover:text-white hover:bg-[#2a2a2a]'
                      }`}
                      title="Lên một lớp"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 8l0 8M8 12l4-4 4 4" />
                      </svg>
                      <span>Up</span>
                    </button>
                    <button
                      onClick={sendBackward}
                      disabled={selectedElement.isLocked}
                      className={`p-2 bg-[#1a1a1a] transition-colors rounded text-xs flex flex-col items-center gap-1 ${
                        selectedElement.isLocked ? 'text-gray-600 grayscale' : 'text-gray-400 hover:text-white hover:bg-[#2a2a2a]'
                      }`}
                      title="Xuống một lớp"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 16l0-8M8 12l4 4 4-4" />
                      </svg>
                      <span>Down</span>
                    </button>
                    <button
                      onClick={sendToBack}
                      disabled={selectedElement.isLocked}
                      className={`p-2 bg-[#1a1a1a] transition-colors rounded text-xs flex flex-col items-center gap-1 ${
                        selectedElement.isLocked ? 'text-gray-600 grayscale' : 'text-gray-400 hover:text-white hover:bg-[#2a2a2a]'
                      }`}
                      title="Xuống dưới cùng"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 19l0-14M5 12l7 7 7-7" />
                      </svg>
                      <span>Bottom</span>
                    </button>
                  </div>
                </div>

                {/* Element Alignment */}
                <div className="mb-4">
                  <label className="text-gray-400 text-sm mb-2 block">Căn chỉnh</label>
                  <div className="flex gap-1">
                    <button
                      onClick={alignElementLeft}
                      disabled={selectedElement.isLocked}
                      className={`flex-1 p-2 bg-[#1a1a1a] rounded transition-colors ${
                        selectedElement.isLocked ? 'text-gray-600 grayscale' : 'text-gray-400 hover:text-white hover:bg-[#2a2a2a]'
                      }`}
                      title="Căn trái"
                    >
                      <AlignLeft size={16} className="mx-auto" />
                    </button>
                    <button
                      onClick={alignElementCenter}
                      disabled={selectedElement.isLocked}
                      className={`flex-1 p-2 bg-[#1a1a1a] rounded transition-colors ${
                        selectedElement.isLocked ? 'text-gray-600 grayscale' : 'text-gray-400 hover:text-white hover:bg-[#2a2a2a]'
                      }`}
                      title="Căn giữa"
                    >
                      <AlignCenter size={16} className="mx-auto" />
                    </button>
                    <button
                      onClick={alignElementRight}
                      disabled={selectedElement.isLocked}
                      className={`flex-1 p-2 bg-[#1a1a1a] rounded transition-colors ${
                        selectedElement.isLocked ? 'text-gray-600 grayscale' : 'text-gray-400 hover:text-white hover:bg-[#2a2a2a]'
                      }`}
                      title="Căn phải"
                    >
                      <AlignRight size={16} className="mx-auto" />
                    </button>
                  </div>
                </div>

                {/* Opacity */}
                <div className="mb-4">
                  <label className="text-gray-400 text-sm mb-2 block">
                    Độ trong suốt: {selectedElement.opacity ?? 100}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={selectedElement.opacity ?? 100}
                    disabled={selectedElement.isLocked}
                    onChange={(e) => updateElementOpacity(parseInt(e.target.value))}
                    className={`w-full h-2 bg-[#2a2a2a] rounded-lg appearance-none cursor-pointer accent-[#e60012] ${
                      selectedElement.isLocked ? 'opacity-50 cursor-not-allowed grayscale' : ''
                    }`}
                  />
                </div>

                {/* Text Alignment (for text elements only) */}
                {selectedElement.type === 'text' && (
                  <div className="mb-4">
                    <label className="text-gray-400 text-sm mb-2 block">Căn chữ</label>
                    <div className="flex gap-1">
                      <button
                        onClick={() => updateTextAlign('left')}
                        disabled={selectedElement.isLocked}
                        className={`flex-1 p-2 transition-colors rounded ${
                          selectedElement.textAlign === 'left' 
                            ? 'bg-[#e60012] text-white' 
                            : 'bg-[#1a1a1a] text-gray-400 hover:text-white hover:bg-[#2a2a2a]'
                        } ${selectedElement.isLocked ? 'grayscale opacity-50' : ''}`}
                        title="Căn trái"
                      >
                        <AlignLeft size={16} className="mx-auto" />
                      </button>
                      <button
                        onClick={() => updateTextAlign('center')}
                        disabled={selectedElement.isLocked}
                        className={`flex-1 p-2 transition-colors rounded ${
                          (selectedElement.textAlign === 'center' || !selectedElement.textAlign)
                            ? 'bg-[#e60012] text-white' 
                            : 'bg-[#1a1a1a] text-gray-400 hover:text-white hover:bg-[#2a2a2a]'
                        } ${selectedElement.isLocked ? 'grayscale opacity-50' : ''}`}
                        title="Căn giữa"
                      >
                        <AlignCenter size={16} className="mx-auto" />
                      </button>
                      <button
                        onClick={() => updateTextAlign('right')}
                        disabled={selectedElement.isLocked}
                        className={`flex-1 p-2 transition-colors rounded ${
                          selectedElement.textAlign === 'right' 
                            ? 'bg-[#e60012] text-white' 
                            : 'bg-[#1a1a1a] text-gray-400 hover:text-white hover:bg-[#2a2a2a]'
                        } ${selectedElement.isLocked ? 'grayscale opacity-50' : ''}`}
                        title="Căn phải"
                      >
                        <AlignRight size={16} className="mx-auto" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Position */}
                <div className="mb-4">
                  <label className="text-gray-400 text-sm mb-2 block">Vị trí</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-xs text-gray-500">X</span>
                      <input
                        type="number"
                        disabled={selectedElement.isLocked}
                        value={Math.round(selectedElement.x)}
                        onChange={(e) => {
                          const x = parseInt(e.target.value) || 0;
                          setElements(elements.map(el => 
                            selectedElementIds.includes(el.id) ? { ...el, x } : el
                          ));
                        }}
                        className={`input-street w-full text-sm py-1 ${selectedElement.isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                      />
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Y</span>
                      <input
                        type="number"
                        disabled={selectedElement.isLocked}
                        value={Math.round(selectedElement.y)}
                        onChange={(e) => {
                          const y = parseInt(e.target.value) || 0;
                          setElements(elements.map(el => 
                            selectedElementIds.includes(el.id) ? { ...el, y } : el
                          ));
                        }}
                        className={`input-street w-full text-sm py-1 ${selectedElement.isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                      />
                    </div>
                  </div>
                </div>

                {/* Size */}
                <div className="mb-4">
                  <label className="text-gray-400 text-sm mb-2 block">Kích thước</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-xs text-gray-500">W</span>
                      <input
                        type="number"
                        disabled={selectedElement.isLocked}
                        value={Math.round(selectedElement.width)}
                        onChange={(e) => {
                          const width = parseInt(e.target.value) || 50;
                          setElements(elements.map(el => 
                            selectedElementIds.includes(el.id) ? { ...el, width } : el
                          ));
                        }}
                        className={`input-street w-full text-sm py-1 ${selectedElement.isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                      />
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">H</span>
                      <input
                        type="number"
                        disabled={selectedElement.isLocked}
                        value={Math.round(selectedElement.height)}
                        onChange={(e) => {
                          const height = parseInt(e.target.value) || 50;
                          setElements(elements.map(el => 
                            selectedElementIds.includes(el.id) ? { ...el, height } : el
                          ));
                        }}
                        className={`input-street w-full text-sm py-1 ${selectedElement.isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                      />
                    </div>
                  </div>
                </div>

                {/* Color */}
                {(selectedElement.type === 'text' || selectedElement.type === 'shape') && (
                  <div className="mb-4">
                    <label className="text-gray-400 text-sm mb-2 block">Màu sắc</label>
                    <div className="grid grid-cols-6 gap-2 mb-2">
                      {colorPalette.map((color) => (
                        <button
                          key={color}
                          disabled={selectedElement.isLocked}
                          onClick={() => updateElementColor(color)}
                          className={`w-6 h-6 rounded border transition-colors ${
                            selectedElement.color === color 
                              ? 'border-white' 
                              : 'border-[#2a2a2a] hover:border-white'
                          } ${selectedElement.isLocked ? 'grayscale opacity-50 cursor-not-allowed' : ''}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    {/* HEX Color Input */}
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        disabled={selectedElement.isLocked}
                        value={selectedElement.color || '#ffffff'}
                        onChange={(e) => updateElementColor(e.target.value)}
                        className={`w-8 h-8 rounded cursor-pointer border-0 bg-transparent ${selectedElement.isLocked ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                        title="Chọn màu"
                      />
                      <input
                        type="text"
                        disabled={selectedElement.isLocked}
                        value={selectedElement.color || '#ffffff'}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                            updateElementColor(value);
                          }
                        }}
                        placeholder="#ffffff"
                        className={`flex-1 input-street text-sm py-1 font-mono uppercase ${selectedElement.isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                        maxLength={7}
                      />
                    </div>
                  </div>
                )}

                {/* Text specific options */}
                {selectedElement.type === 'text' && (
                  <>
                    {/* Font Family */}
                    <div className="mb-4">
                      <label className="text-gray-400 text-sm mb-2 block">Font chữ</label>
                      <select
                        value={selectedElement.fontFamily || "'Be Vietnam Pro', sans-serif"}
                        disabled={selectedElement.isLocked}
                        onChange={(e) => {
                          setElements(elements.map(el =>
                            selectedElementIds.includes(el.id) ? { ...el, fontFamily: e.target.value } : el
                          ));
                        }}
                        className={`w-full input-street text-sm py-2 bg-[#1a1a1a] text-white border border-[#2a2a2a] rounded cursor-pointer ${
                          selectedElement.isLocked ? 'opacity-50 cursor-not-allowed grayscale' : ''
                        }`}
                      >
                        {fontOptions.map((font) => (
                          <option 
                            key={font.id} 
                            value={font.value}
                            style={{ fontFamily: font.value }}
                          >
                            {font.name} - {font.style}
                          </option>
                        ))}
                      </select>
                      {/* Font Preview */}
                      <div 
                        className="mt-2 p-2 bg-[#1a1a1a] rounded text-center text-lg"
                        style={{ 
                          fontFamily: selectedElement.fontFamily || "'Be Vietnam Pro', sans-serif",
                          color: selectedElement.color || '#ffffff'
                        }}
                      >
                        {selectedElement.content?.substring(0, 15) || 'Preview'}
                      </div>
                    </div>

                    {/* Font Size */}
                    <div className="mb-4">
                      <label className="text-gray-400 text-sm mb-2 block">Cỡ chữ: {selectedElement.fontSize || 24}px</label>
                      <input
                        type="range"
                        min="12"
                        max="72"
                        value={selectedElement.fontSize || 24}
                        disabled={selectedElement.isLocked}
                        onChange={(e) => {
                          const fontSize = parseInt(e.target.value);
                          setElements(elements.map(el => 
                            selectedElementIds.includes(el.id) ? { ...el, fontSize } : el
                          ));
                        }}
                        className={`w-full h-2 bg-[#2a2a2a] rounded-lg appearance-none cursor-pointer accent-[#e60012] ${
                          selectedElement.isLocked ? 'opacity-50 cursor-not-allowed grayscale' : ''
                        }`}
                      />
                    </div>

                    

                    {/* Text Background */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-gray-400 text-sm">Nền chữ</label>
                        <button
                          onClick={() => {
                            setElements(elements.map(el =>
                              selectedElementIds.includes(el.id) 
                                ? { ...el, textBgColor: el.textBgColor ? undefined : '#000000' } 
                                : el
                            ));
                          }}
                          disabled={selectedElement.isLocked}
                          className={`px-2 py-1 text-xs rounded transition-colors ${
                            selectedElement.textBgColor 
                              ? 'bg-[#e60012] text-white' 
                              : 'bg-[#2a2a2a] text-gray-400 hover:text-white'
                          } ${selectedElement.isLocked ? 'grayscale opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {selectedElement.textBgColor ? 'ON' : 'OFF'}
                        </button>
                      </div>
                      {selectedElement.textBgColor && (
                        <div className="flex gap-2 items-center">
                          <input
                            type="color"
                            value={selectedElement.textBgColor || '#000000'}
                            disabled={selectedElement.isLocked}
                            onChange={(e) => {
                              setElements(elements.map(el =>
                                selectedElementIds.includes(el.id) ? { ...el, textBgColor: e.target.value } : el
                              ));
                            }}
                            className={`w-10 h-10 rounded cursor-pointer border-2 border-[#2a2a2a] ${
                              selectedElement.isLocked ? 'opacity-50 cursor-not-allowed grayscale' : ''
                            }`}
                          />
                          <span className="text-gray-400 text-sm uppercase">{selectedElement.textBgColor}</span>
                        </div>
                      )}
                    </div>

                    {/* Text Shadow */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-gray-400 text-sm">Đổ bóng</label>
                        <button
                          onClick={() => {
                            setElements(elements.map(el =>
                              selectedElementIds.includes(el.id) 
                                ? { ...el, textShadow: el.textShadow ? undefined : { x: 2, y: 2, blur: 4, color: '#000000' } } 
                                : el
                            ));
                          }}
                          disabled={selectedElement.isLocked}
                          className={`px-2 py-1 text-xs rounded transition-colors ${
                            selectedElement.textShadow 
                              ? 'bg-[#e60012] text-white' 
                              : 'bg-[#2a2a2a] text-gray-400 hover:text-white'
                          } ${selectedElement.isLocked ? 'grayscale opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {selectedElement.textShadow ? 'ON' : 'OFF'}
                        </button>
                      </div>
                      {selectedElement.textShadow && (
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <span className="text-xs text-gray-500">X</span>
                              <input
                                type="number"
                                value={selectedElement.textShadow.x}
                                onChange={(e) => {
                                  const x = parseInt(e.target.value) || 0;
                                  setElements(elements.map(el =>
                                    selectedElementIds.includes(el.id) 
                                      ? { ...el, textShadow: { ...el.textShadow!, x } } 
                                      : el
                                  ));
                                }}
                                className="input-street w-full text-sm py-1"
                              />
                            </div>
                            <div>
                              <span className="text-xs text-gray-500">Y</span>
                              <input
                                type="number"
                                value={selectedElement.textShadow.y}
                                onChange={(e) => {
                                  const y = parseInt(e.target.value) || 0;
                                  setElements(elements.map(el =>
                                    selectedElementIds.includes(el.id) 
                                      ? { ...el, textShadow: { ...el.textShadow!, y } } 
                                      : el
                                  ));
                                }}
                                className="input-street w-full text-sm py-1"
                              />
                            </div>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">Blur: {selectedElement.textShadow.blur}px</span>
                            <input
                              type="range"
                              min="0"
                              max="20"
                              value={selectedElement.textShadow.blur}
                              disabled={selectedElement.isLocked}
                              onChange={(e) => {
                                const blur = parseInt(e.target.value);
                                setElements(elements.map(el =>
                                  selectedElementIds.includes(el.id) 
                                    ? { ...el, textShadow: { ...el.textShadow!, blur } } 
                                    : el
                                ));
                              }}
                              className={`w-full h-2 bg-[#2a2a2a] rounded-lg appearance-none cursor-pointer accent-[#e60012] ${
                                selectedElement.isLocked ? 'opacity-50 cursor-not-allowed grayscale' : ''
                              }`}
                            />
                          </div>
                          <div className="flex gap-2 items-center">
                            <input
                              type="color"
                              value={selectedElement.textShadow.color}
                              disabled={selectedElement.isLocked}
                              onChange={(e) => {
                                setElements(elements.map(el =>
                                  selectedElementIds.includes(el.id) 
                                    ? { ...el, textShadow: { ...el.textShadow!, color: e.target.value } } 
                                    : el
                                ));
                              }}
                              className={`w-6 h-6 rounded cursor-pointer border-0 ${
                                selectedElement.isLocked ? 'opacity-50 cursor-not-allowed grayscale' : ''
                              }`}
                            />
                            <span className="text-xs text-gray-400">Màu bóng</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Text Outline */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-gray-400 text-sm">Viền chữ</label>
                        <button
                          onClick={() => {
                            setElements(elements.map(el =>
                              selectedElementIds.includes(el.id) 
                                ? { ...el, textOutline: el.textOutline ? undefined : { width: 2, color: '#000000' } } 
                                : el
                            ));
                          }}
                          disabled={selectedElement.isLocked}
                          className={`px-2 py-1 text-xs rounded transition-colors ${
                            selectedElement.textOutline 
                              ? 'bg-[#e60012] text-white' 
                              : 'bg-[#2a2a2a] text-gray-400 hover:text-white'
                          } ${selectedElement.isLocked ? 'grayscale opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {selectedElement.textOutline ? 'ON' : 'OFF'}
                        </button>
                      </div>
                      {selectedElement.textOutline && (
                        <div className="space-y-2">
                          <div>
                            <span className="text-xs text-gray-500">Độ dày: {selectedElement.textOutline.width}px</span>
                            <input
                              type="range"
                              min="1"
                              max="10"
                              value={selectedElement.textOutline.width}
                              disabled={selectedElement.isLocked}
                              onChange={(e) => {
                                const width = parseInt(e.target.value);
                                setElements(elements.map(el =>
                                  selectedElementIds.includes(el.id) 
                                    ? { ...el, textOutline: { ...el.textOutline!, width } } 
                                    : el
                                ));
                              }}
                              className={`w-full h-2 bg-[#2a2a2a] rounded-lg appearance-none cursor-pointer accent-[#e60012] ${
                                selectedElement.isLocked ? 'opacity-50 cursor-not-allowed grayscale' : ''
                              }`}
                            />
                          </div>
                          <div className="flex gap-2 items-center">
                            <input
                              type="color"
                              value={selectedElement.textOutline.color}
                              disabled={selectedElement.isLocked}
                              onChange={(e) => {
                                setElements(elements.map(el =>
                                  selectedElementIds.includes(el.id) 
                                    ? { ...el, textOutline: { ...el.textOutline!, color: e.target.value } } 
                                    : el
                                ));
                              }}
                              className={`w-6 h-6 rounded cursor-pointer border-0 ${
                                selectedElement.isLocked ? 'opacity-50 cursor-not-allowed grayscale' : ''
                              }`}
                            />
                            <span className="text-xs text-gray-400">Màu viền</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Layers size={32} className="mx-auto mb-3 opacity-50" />
                <p>Chọn một phần tử để chỉnh sửa</p>
              </div>
            )}

            {/* Layers */}
            <div className="mt-6 pt-6 border-t border-[#2a2a2a]">
              <h3 className="text-white font-bold mb-3">Layers ({elements.length})</h3>
              {elements.length > 0 ? (
                <div className="space-y-1">
                  {[...elements].reverse().map((element) => (
                    <button
                      key={element.id}
                      onClick={() => setSelectedElementIds([element.id])}
                      className={`w-full p-2 flex items-center gap-2 text-left text-sm rounded transition-colors ${
                        selectedElementIds.includes(element.id)
                          ? 'bg-[#e60012] text-white'
                          : 'text-gray-400 hover:bg-[#1a1a1a]'
                      }`}
                    >
                      {element.type === 'text' && <Type size={14} />}
                      {element.type === 'shape' && <Square size={14} />}
                      {element.type === 'sticker' && <span>{element.content}</span>}
                      {element.type === 'image' && <ImageIcon size={14} />}
                      <span className="truncate">{element.type === 'sticker' ? 'Sticker' : element.content.slice(0, 15)}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Chưa có layer nào</p>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-8">
          <div className="bg-[#1a1a1a] rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#2a2a2a]">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold text-white">Xem trước thiết kế</h2>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 text-gray-400 hover:text-white transition-colors hover:bg-[#2a2a2a] rounded-lg"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-8">
              {/* 3D Rotating View */}
              <div className="flex flex-col items-center">
                  {/* 3D Container */}
                  <div 
                    className="relative w-[400px] h-[500px] mb-6"
                    style={{ perspective: '1000px' }}
                  >
                    <div
                      className="relative w-full h-full transition-transform duration-700 ease-in-out"
                      style={{
                        transformStyle: 'preserve-3d',
                        transform: `rotateY(${previewRotation}deg)`,
                      }}
                    >
                      {/* Front Side */}
                      <div
                        className="absolute inset-0 flex items-center justify-center"
                        style={{
                          backfaceVisibility: 'hidden',
                        }}
                      >
                        <div className="relative">
                          <img
                            src={selectedProduct.variants.front.image}
                            alt="Front"
                            className="max-h-[450px] object-contain"
                          />
                          {/* Front Design Overlay */}
                          <div
                            className="absolute"
                            style={{
                              left: selectedProduct.variants.front.designArea.left + '%',
                              top: selectedProduct.variants.front.designArea.top + '%',
                              width: (100 - selectedProduct.variants.front.designArea.left - selectedProduct.variants.front.designArea.right) + '%',
                              height: (100 - selectedProduct.variants.front.designArea.top - selectedProduct.variants.front.designArea.bottom) + '%',
                            }}
                          >
                            {frontElements.map((element) => (
                              <div
                                key={element.id}
                                className="absolute"
                                style={{
                                  left: `${(element.x / (selectedProduct.width * (100 - selectedProduct.variants.front.designArea.left - selectedProduct.variants.front.designArea.right) / 100)) * 100}%`,
                                  top: `${(element.y / (selectedProduct.height * (100 - selectedProduct.variants.front.designArea.top - selectedProduct.variants.front.designArea.bottom) / 100)) * 100}%`,
                                  width: `${(element.width / (selectedProduct.width * (100 - selectedProduct.variants.front.designArea.left - selectedProduct.variants.front.designArea.right) / 100)) * 100}%`,
                                  height: `${(element.height / (selectedProduct.height * (100 - selectedProduct.variants.front.designArea.top - selectedProduct.variants.front.designArea.bottom) / 100)) * 100}%`,
                                  transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
                                  opacity: (element.opacity ?? 100) / 100,
                                }}
                              >
                                {element.type === 'text' && (
                                  <div
                                    className="w-full h-full flex items-center"
                                    style={{
                                      color: element.color,
                                      fontSize: 'inherit',
                                      fontWeight: element.fontWeight,
                                      fontFamily: element.fontFamily,
                                      textAlign: element.textAlign || 'center',
                                      justifyContent: element.textAlign === 'left' ? 'flex-start' : 
                                                      element.textAlign === 'right' ? 'flex-end' : 'center',
                                      backgroundColor: element.textBgColor,
                                      textShadow: element.textShadow 
                                        ? `${element.textShadow.x * 0.5}px ${element.textShadow.y * 0.5}px ${element.textShadow.blur * 0.5}px ${element.textShadow.color}` 
                                        : undefined,
                                      WebkitTextStroke: element.textOutline 
                                        ? `${element.textOutline.width * 0.5}px ${element.textOutline.color}` 
                                        : undefined,
                                    }}
                                  >
                                    {element.content}
                                  </div>
                                )}
                                {element.type === 'shape' && (
                                  <div 
                                    className="w-full h-full rounded" 
                                    style={{ backgroundColor: element.color }}
                                  />
                                )}
                                {element.type === 'sticker' && (
                                  <div className="w-full h-full flex items-center justify-center text-2xl">
                                    {element.content}
                                  </div>
                                )}
                                {element.type === 'image' && (
                                  <img 
                                    src={element.content} 
                                    alt="Uploaded"
                                    className="w-full h-full object-contain"
                                    draggable={false}
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-[#e60012] px-3 py-1 rounded text-xs font-bold text-white">
                            MẶT TRƯỚC
                          </div>
                        </div>
                      </div>

                      {/* Back Side */}
                      <div
                        className="absolute inset-0 flex items-center justify-center"
                        style={{
                          backfaceVisibility: 'hidden',
                          transform: 'rotateY(180deg)',
                        }}
                      >
                        <div className="relative">
                          <img
                            src={selectedProduct.variants.back.image}
                            alt="Back"
                            className="max-h-[450px] object-contain"
                          />
                          {/* Back Design Overlay */}
                          <div
                            className="absolute"
                            style={{
                              left: selectedProduct.variants.back.designArea.left + '%',
                              top: selectedProduct.variants.back.designArea.top + '%',
                              width: (100 - selectedProduct.variants.back.designArea.left - selectedProduct.variants.back.designArea.right) + '%',
                              height: (100 - selectedProduct.variants.back.designArea.top - selectedProduct.variants.back.designArea.bottom) + '%',
                            }}
                          >
                            {backElements.map((element) => (
                              <div
                                key={element.id}
                                className="absolute"
                                style={{
                                  left: `${(element.x / (selectedProduct.width * (100 - selectedProduct.variants.back.designArea.left - selectedProduct.variants.back.designArea.right) / 100)) * 100}%`,
                                  top: `${(element.y / (selectedProduct.height * (100 - selectedProduct.variants.back.designArea.top - selectedProduct.variants.back.designArea.bottom) / 100)) * 100}%`,
                                  width: `${(element.width / (selectedProduct.width * (100 - selectedProduct.variants.back.designArea.left - selectedProduct.variants.back.designArea.right) / 100)) * 100}%`,
                                  height: `${(element.height / (selectedProduct.height * (100 - selectedProduct.variants.back.designArea.top - selectedProduct.variants.back.designArea.bottom) / 100)) * 100}%`,
                                  transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
                                  opacity: (element.opacity ?? 100) / 100,
                                }}
                              >
                                {element.type === 'text' && (
                                  <div
                                    className="w-full h-full flex items-center"
                                    style={{
                                      color: element.color,
                                                                            fontSize: 'inherit',
                                      fontWeight: element.fontWeight,
                                      fontFamily: element.fontFamily,
                                      textAlign: element.textAlign || 'center',
                                      justifyContent: element.textAlign === 'left' ? 'flex-start' : 
                                                      element.textAlign === 'right' ? 'flex-end' : 'center',
                                      backgroundColor: element.textBgColor,
                                      textShadow: element.textShadow 
                                        ? `${element.textShadow.x * 0.5}px ${element.textShadow.y * 0.5}px ${element.textShadow.blur * 0.5}px ${element.textShadow.color}` 
                                        : undefined,
                                      WebkitTextStroke: element.textOutline 
                                        ? `${element.textOutline.width * 0.5}px ${element.textOutline.color}` 
                                        : undefined,
                                    }}
                                  >
                                    {element.content}
                                  </div>
                                )}
                                {element.type === 'shape' && (
                                  <div 
                                    className="w-full h-full rounded" 
                                    style={{ backgroundColor: element.color }}
                                  />
                                )}
                                {element.type === 'sticker' && (
                                  <div className="w-full h-full flex items-center justify-center text-2xl">
                                    {element.content}
                                  </div>
                                )}
                                {element.type === 'image' && (
                                  <img 
                                    src={element.content} 
                                    alt="Uploaded"
                                    className="w-full h-full object-contain"
                                    draggable={false}
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-[#2a2a2a] px-3 py-1 rounded text-xs font-bold text-white">
                            MẶT SAU
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3D Controls */}
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => {
                        setIsAutoRotating(false);
                        setPreviewRotation(r => r - 180);
                      }}
                      className="p-3 bg-[#2a2a2a] text-gray-300 hover:text-white rounded-lg transition-colors"
                      title="Xoay trái"
                    >
                      <RotateCcw size={20} />
                    </button>
                    <button
                      onClick={() => setIsAutoRotating(!isAutoRotating)}
                      className={`px-6 py-3 rounded-lg font-medium transition-all ${
                        isAutoRotating 
                          ? 'bg-[#e60012] text-white' 
                          : 'bg-[#2a2a2a] text-gray-300 hover:text-white'
                      }`}
                    >
                      {isAutoRotating ? '⏸ Dừng' : '▶ Tự động xoay'}
                    </button>
                    <button
                      onClick={() => {
                        setIsAutoRotating(false);
                        setPreviewRotation(r => r + 180);
                      }}
                      className="p-3 bg-[#2a2a2a] text-gray-300 hover:text-white rounded-lg transition-colors"
                      title="Xoay phải"
                    >
                      <RotateCw size={20} />
                    </button>
                  </div>
                  <p className="text-gray-500 text-sm mt-3">
                    Click vào mũi tên hoặc bật tự động xoay để xem cả 2 mặt
                  </p>
                </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-[#2a2a2a]">
              <div className="text-gray-400 text-sm">
                Sản phẩm: <span className="text-white font-medium">{selectedProduct.name}</span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPreview(false)}
                  className="px-6 py-2 bg-[#2a2a2a] text-gray-300 hover:text-white rounded-lg transition-colors"
                >
                  Đóng
                </button>
                <button className="px-6 py-2 bg-[#e60012] text-white rounded-lg hover:bg-[#ff1a1a] transition-colors flex items-center gap-2">
                  <ShoppingBag size={16} />
                  Đặt hàng ngay
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
