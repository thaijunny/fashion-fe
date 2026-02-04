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
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline
} from 'lucide-react';

// Product templates
const productTemplates = [
  { id: 'tshirt', name: 'Áo Thun', icon: '👕', width: 400, height: 500 },
  { id: 'hoodie', name: 'Hoodie', icon: '🧥', width: 450, height: 550 },
  { id: 'totebag', name: 'Tote Bag', icon: '👜', width: 400, height: 450 },
  { id: 'cap', name: 'Nón', icon: '🧢', width: 350, height: 250 },
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
}

export default function StudioPage() {
  const [selectedTemplate, setSelectedTemplate] = useState(productTemplates[0]);
  const [activeTab, setActiveTab] = useState<'templates' | 'text' | 'shapes' | 'images' | 'stickers'>('templates');
  const [elements, setElements] = useState<DesignElement[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  const [designName, setDesignName] = useState('Thiết kế mới');
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const designAreaRef = useRef<HTMLDivElement>(null);
  
  // Text editing state
  const [editingTextId, setEditingTextId] = useState<string | null>(null);

  // Resize & Rotate state
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  
  const [isRotating, setIsRotating] = useState(false);
  const [rotateStart, setRotateStart] = useState({ angle: 0, centerX: 0, centerY: 0 });

  // Handle keyboard shortcuts (Delete key)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElementId) {
        // Don't delete if user is editing text (check for input, textarea, or contenteditable)
        const activeElement = document.activeElement;
        const tagName = activeElement?.tagName.toLowerCase();
        if (
          tagName === 'input' || 
          tagName === 'textarea' || 
          activeElement?.getAttribute('contenteditable') === 'true' ||
          editingTextId !== null
        ) {
          return;
        }
        e.preventDefault();
        setElements(prev => prev.filter(el => el.id !== selectedElementId));
        setSelectedElementId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElementId, editingTextId]);

  // Mouse move handler for dragging
  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !selectedElementId || !designAreaRef.current) return;

      const rect = designAreaRef.current.getBoundingClientRect();
      const scale = zoom / 100;
      
      const newX = (e.clientX - rect.left - dragOffset.x) / scale;
      const newY = (e.clientY - rect.top - dragOffset.y) / scale;

      setElements(prev => prev.map(el =>
        el.id === selectedElementId
          ? { ...el, x: Math.max(0, newX), y: Math.max(0, newY) }
          : el
      ));
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
  }, [isDragging, selectedElementId, dragOffset, zoom]);

  // Resize mouse move handler
  React.useEffect(() => {
    const handleResizeMove = (e: MouseEvent) => {
      if (!isResizing || !selectedElementId || !resizeHandle) return;

      const element = elements.find(el => el.id === selectedElementId);
      if (!element) return;

      const scale = zoom / 100;
      const deltaX = (e.clientX - resizeStart.x) / scale;
      const deltaY = (e.clientY - resizeStart.y) / scale;

      let newWidth = resizeStart.width;
      let newHeight = resizeStart.height;

      if (resizeHandle.includes('e')) newWidth = Math.max(30, resizeStart.width + deltaX);
      if (resizeHandle.includes('w')) newWidth = Math.max(30, resizeStart.width - deltaX);
      if (resizeHandle.includes('s')) newHeight = Math.max(30, resizeStart.height + deltaY);
      if (resizeHandle.includes('n')) newHeight = Math.max(30, resizeStart.height - deltaY);

      setElements(prev => prev.map(el =>
        el.id === selectedElementId
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
  }, [isResizing, selectedElementId, resizeHandle, resizeStart, zoom, elements]);

  // Rotate mouse move handler
  React.useEffect(() => {
    const handleRotateMove = (e: MouseEvent) => {
      if (!isRotating || !selectedElementId) return;

      const dx = e.clientX - rotateStart.centerX;
      const dy = e.clientY - rotateStart.centerY;
      const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;

      setElements(prev => prev.map(el =>
        el.id === selectedElementId
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
  }, [isRotating, selectedElementId, rotateStart]);

  // Start resizing
  const handleResizeStart = (e: React.MouseEvent, handle: string) => {
    e.stopPropagation();
    const element = elements.find(el => el.id === selectedElementId);
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
    const element = elements.find(el => el.id === selectedElementId);
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
    if (!element || !designAreaRef.current) return;

    const rect = designAreaRef.current.getBoundingClientRect();
    const scale = zoom / 100;
    
    setSelectedElementId(elementId);
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - rect.left - element.x * scale,
      y: e.clientY - rect.top - element.y * scale,
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
    setSelectedElementId(newElement.id);
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
    setSelectedElementId(newElement.id);
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
    setSelectedElementId(newElement.id);
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
    setSelectedElementId(newElement.id);
  };

  const deleteSelectedElement = () => {
    if (selectedElementId) {
      setElements(elements.filter(el => el.id !== selectedElementId));
      setSelectedElementId(null);
    }
  };

  const duplicateSelectedElement = () => {
    if (selectedElementId) {
      const element = elements.find(el => el.id === selectedElementId);
      if (element) {
        const newElement = {
          ...element,
          id: `${element.type}-${Date.now()}`,
          x: element.x + 20,
          y: element.y + 20,
        };
        setElements([...elements, newElement]);
        setSelectedElementId(newElement.id);
      }
    }
  };

  const updateElementColor = (color: string) => {
    if (selectedElementId) {
      setElements(elements.map(el => 
        el.id === selectedElementId ? { ...el, color } : el
      ));
    }
  };

  const selectedElement = elements.find(el => el.id === selectedElementId);

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
          <button className="p-2 text-gray-400 hover:text-white transition-colors" title="Undo">
            <Undo size={18} />
          </button>
          <button className="p-2 text-gray-400 hover:text-white transition-colors" title="Redo">
            <Redo size={18} />
          </button>
          <div className="h-6 w-px bg-[#2a2a2a] mx-2" />
          <button 
            onClick={() => setZoom(z => Math.max(50, z - 10))}
            className="p-2 text-gray-400 hover:text-white transition-colors" 
            title="Zoom Out"
          >
            <ZoomOut size={18} />
          </button>
          <span className="text-gray-400 text-sm w-12 text-center">{zoom}%</span>
          <button 
            onClick={() => setZoom(z => Math.min(200, z + 10))}
            className="p-2 text-gray-400 hover:text-white transition-colors" 
            title="Zoom In"
          >
            <ZoomIn size={18} />
          </button>
        </div>

        <div className="flex items-center gap-3">
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
                <div className="grid grid-cols-2 gap-3">
                  {productTemplates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplate(template)}
                      className={`p-4 rounded-lg border transition-all ${
                        selectedTemplate.id === template.id
                          ? 'border-[#e60012] bg-[#e60012]/10'
                          : 'border-[#2a2a2a] hover:border-[#e60012]/50'
                      }`}
                    >
                      <span className="text-3xl block mb-2">{template.icon}</span>
                      <span className="text-sm text-gray-300">{template.name}</span>
                    </button>
                  ))}
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
                <button className="w-full p-6 border border-dashed border-[#2a2a2a] text-gray-400 hover:border-[#e60012] hover:text-[#e60012] transition-colors rounded-lg flex flex-col items-center gap-2">
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
        <main className="flex-1 bg-[#0a0a0a] flex items-center justify-center p-8 overflow-auto">
          <div 
            ref={canvasRef}
            className="relative bg-[#1a1a1a] shadow-2xl"
            style={{ 
              width: selectedTemplate.width * (zoom / 100), 
              height: selectedTemplate.height * (zoom / 100),
              transform: `scale(1)`,
            }}
          >
            {/* Product Template Background */}
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
              <span className="text-8xl">{selectedTemplate.icon}</span>
            </div>

            {/* Design Area */}
            <div 
              ref={designAreaRef}
              className="absolute border-2 border-dashed border-[#e60012]/30"
              style={{
                left: '15%',
                top: '15%',
                right: '15%',
                bottom: '25%',
              }}
              onClick={() => setSelectedElementId(null)}
            >
              {/* Render Elements */}
              {elements.map((element) => (
                <div
                  key={element.id}
                  onMouseDown={(e) => {
                    if (editingTextId === element.id) return; // Don't drag while editing
                    handleMouseDown(e, element.id);
                  }}
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent deselecting when clicking on element
                  }}
                  onDoubleClick={() => {
                    if (element.type === 'text') {
                      setEditingTextId(element.id);
                      setSelectedElementId(element.id);
                    }
                  }}
                  className={`absolute cursor-move transition-shadow select-none ${
                    selectedElementId === element.id 
                      ? 'ring-2 ring-[#e60012] ring-offset-2 ring-offset-[#1a1a1a]' 
                      : 'hover:ring-1 hover:ring-[#e60012]/50'
                  } ${isDragging && selectedElementId === element.id ? 'cursor-grabbing' : ''}
                  ${editingTextId === element.id ? 'cursor-text' : ''}`}
                  style={{
                    left: element.x * (zoom / 100),
                    top: element.y * (zoom / 100),
                    width: element.width * (zoom / 100),
                    height: element.height * (zoom / 100),
                    transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
                    userSelect: editingTextId === element.id ? 'text' : 'none',
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
                        className="w-full h-full bg-transparent text-center outline-none border-none"
                        style={{
                          color: element.color,
                          fontSize: (element.fontSize || 24) * (zoom / 100),
                          fontWeight: element.fontWeight,
                          fontFamily: element.fontFamily || "'Be Vietnam Pro', sans-serif",
                        }}
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center outline-none pointer-events-none"
                        style={{
                          color: element.color,
                          fontSize: (element.fontSize || 24) * (zoom / 100),
                          fontWeight: element.fontWeight,
                          fontFamily: element.fontFamily || "'Be Vietnam Pro', sans-serif",
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

                  {/* Resize Handles (show when selected) */}
                  {selectedElementId === element.id && !editingTextId && (
                    <>
                      {/* Corner handles */}
                      <div
                        onMouseDown={(e) => handleResizeStart(e, 'nw')}
                        className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-[#e60012] cursor-nw-resize z-10"
                      />
                      <div
                        onMouseDown={(e) => handleResizeStart(e, 'ne')}
                        className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-[#e60012] cursor-ne-resize z-10"
                      />
                      <div
                        onMouseDown={(e) => handleResizeStart(e, 'sw')}
                        className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-[#e60012] cursor-sw-resize z-10"
                      />
                      <div
                        onMouseDown={(e) => handleResizeStart(e, 'se')}
                        className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-[#e60012] cursor-se-resize z-10"
                      />
                      
                      {/* Side handles */}
                      <div
                        onMouseDown={(e) => handleResizeStart(e, 'n')}
                        className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-2 bg-white border border-[#e60012] cursor-n-resize z-10"
                      />
                      <div
                        onMouseDown={(e) => handleResizeStart(e, 's')}
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-2 bg-white border border-[#e60012] cursor-s-resize z-10"
                      />
                      <div
                        onMouseDown={(e) => handleResizeStart(e, 'w')}
                        className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-4 bg-white border border-[#e60012] cursor-w-resize z-10"
                      />
                      <div
                        onMouseDown={(e) => handleResizeStart(e, 'e')}
                        className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-4 bg-white border border-[#e60012] cursor-e-resize z-10"
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
              {selectedTemplate.name} • {selectedTemplate.width}x{selectedTemplate.height}
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
                  <div className="flex gap-2">
                    <button
                      onClick={duplicateSelectedElement}
                      className="p-2 text-gray-400 hover:text-white transition-colors"
                      title="Nhân bản"
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      onClick={deleteSelectedElement}
                      className="p-2 text-gray-400 hover:text-[#e60012] transition-colors"
                      title="Xóa"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Position */}
                <div className="mb-4">
                  <label className="text-gray-400 text-sm mb-2 block">Vị trí</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-xs text-gray-500">X</span>
                      <input
                        type="number"
                        value={Math.round(selectedElement.x)}
                        onChange={(e) => {
                          const x = parseInt(e.target.value) || 0;
                          setElements(elements.map(el => 
                            el.id === selectedElementId ? { ...el, x } : el
                          ));
                        }}
                        className="input-street w-full text-sm py-1"
                      />
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Y</span>
                      <input
                        type="number"
                        value={Math.round(selectedElement.y)}
                        onChange={(e) => {
                          const y = parseInt(e.target.value) || 0;
                          setElements(elements.map(el => 
                            el.id === selectedElementId ? { ...el, y } : el
                          ));
                        }}
                        className="input-street w-full text-sm py-1"
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
                        value={Math.round(selectedElement.width)}
                        onChange={(e) => {
                          const width = parseInt(e.target.value) || 50;
                          setElements(elements.map(el => 
                            el.id === selectedElementId ? { ...el, width } : el
                          ));
                        }}
                        className="input-street w-full text-sm py-1"
                      />
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">H</span>
                      <input
                        type="number"
                        value={Math.round(selectedElement.height)}
                        onChange={(e) => {
                          const height = parseInt(e.target.value) || 50;
                          setElements(elements.map(el => 
                            el.id === selectedElementId ? { ...el, height } : el
                          ));
                        }}
                        className="input-street w-full text-sm py-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Color */}
                {(selectedElement.type === 'text' || selectedElement.type === 'shape') && (
                  <div className="mb-4">
                    <label className="text-gray-400 text-sm mb-2 block">Màu sắc</label>
                    <div className="grid grid-cols-6 gap-2">
                      {colorPalette.map((color) => (
                        <button
                          key={color}
                          onClick={() => updateElementColor(color)}
                          className={`w-6 h-6 rounded border transition-colors ${
                            selectedElement.color === color 
                              ? 'border-white' 
                              : 'border-[#2a2a2a] hover:border-white'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Text specific options */}
                {selectedElement.type === 'text' && (
                  <>
                    <div className="mb-4">
                      <label className="text-gray-400 text-sm mb-2 block">Font Size</label>
                      <input
                        type="range"
                        min="12"
                        max="72"
                        value={selectedElement.fontSize || 24}
                        onChange={(e) => {
                          const fontSize = parseInt(e.target.value);
                          setElements(elements.map(el => 
                            el.id === selectedElementId ? { ...el, fontSize } : el
                          ));
                        }}
                        className="w-full"
                      />
                      <span className="text-gray-400 text-sm">{selectedElement.fontSize || 24}px</span>
                    </div>

                    <div className="flex gap-2 mb-4">
                      <button className="p-2 bg-[#1a1a1a] text-gray-400 hover:text-white transition-colors">
                        <Bold size={16} />
                      </button>
                      <button className="p-2 bg-[#1a1a1a] text-gray-400 hover:text-white transition-colors">
                        <Italic size={16} />
                      </button>
                      <button className="p-2 bg-[#1a1a1a] text-gray-400 hover:text-white transition-colors">
                        <Underline size={16} />
                      </button>
                      <div className="w-px bg-[#2a2a2a]" />
                      <button className="p-2 bg-[#1a1a1a] text-gray-400 hover:text-white transition-colors">
                        <AlignLeft size={16} />
                      </button>
                      <button className="p-2 bg-[#1a1a1a] text-gray-400 hover:text-white transition-colors">
                        <AlignCenter size={16} />
                      </button>
                      <button className="p-2 bg-[#1a1a1a] text-gray-400 hover:text-white transition-colors">
                        <AlignRight size={16} />
                      </button>
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
                      onClick={() => setSelectedElementId(element.id)}
                      className={`w-full p-2 flex items-center gap-2 text-left text-sm rounded transition-colors ${
                        selectedElementId === element.id
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
    </div>
  );
}
