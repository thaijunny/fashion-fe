'use client';

import React, { useState, useCallback, useRef, useEffect, Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import {
  fetchStudioColors,
  fetchStudioAssets,
  fetchGarmentTemplates,
  fetchSizes,
  fetchMaterials,
  createProject,
  updateProject,
  fetchUserProjectById,
  fetchProjectByIdAdmin,
  fetchUserProjects,
  deleteProject,
  createDesignOrder,
  uploadFile,
  getImageUrl,
  formatPrice
} from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ChevronRight,
  AlertTriangle,
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
  StickyNote as Sticker,
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
  Unlock,
  Plus,
  FolderOpen,
  MapPin,
  Phone,
  User as UserIcon
} from 'lucide-react';

// Initial empty state
const initialProductTypes: any[] = [];

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

function StudioPageContent() {
  const { user, token, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlProjectId = searchParams.get('projectId');

  const [productTypes, setProductTypes] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [viewSide, setViewSide] = useState<'front' | 'back'>('front');
  const [selectedSize, setSelectedSize] = useState<string>('L');
  const [sizeOptions, setSizeOptions] = useState<any[]>([]);
  const [selectedProductColor, setSelectedProductColor] = useState<'white' | 'black'>('white');
  const [colorPalette, setColorPalette] = useState<string[]>([]);
  const [stickers, setStickers] = useState<any[]>([]);
  const [icons, setIcons] = useState<any[]>([]);
  const [shapes, setShapes] = useState<any[]>([]);
  const [fontOptions, setFontOptions] = useState<any[]>([]);
  const [textTemplates, setTextTemplates] = useState<any[]>([]);

  const [activeTab, setActiveTab] = useState<'templates' | 'text' | 'shapes' | 'images' | 'stickers' | 'ai-gallery' | 'my-projects'>('templates');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showExitWarning, setShowExitWarning] = useState(false);
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiPersona, setAiPersona] = useState({
    personality: '',
    birthday: '',
    zodiac: '',
    style: 'hiphop',
    customVibe: ''
  });
  const [projectId, setProjectId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [myProjects, setMyProjects] = useState<any[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderForm, setOrderForm] = useState({
    quantity: 1,
    full_name: '',
    phone_number: '',
    shipping_address: '',
    note: '',
  });
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
    isAlert?: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { },
  });
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [userUploads, setUserUploads] = useState<string[]>(() => {
    // Restore from localStorage on mount
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('studio_userUploads');
        return saved ? JSON.parse(saved) : [];
      } catch { return []; }
    }
    return [];
  });

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
  const currentView = selectedProduct?.variants?.[viewSide];

  // Calculate pixel to cm ratio for real size display
  const getPixelToCm = useCallback(() => {
    if (!currentView?.designArea || !selectedProduct) return 1;
    const designAreaWidthPercent = 100 - currentView.designArea.left - currentView.designArea.right;
    const designAreaWidthPx = selectedProduct.width * designAreaWidthPercent / 100;
    const sizeData = sizeOptions.find((s: any) => s.name === selectedSize)?.measurements;
    if (!sizeData?.printArea?.width || !designAreaWidthPx) return 1;
    return sizeData.printArea.width / designAreaWidthPx; // cm per pixel
  }, [selectedProduct, currentView, selectedSize, sizeOptions]);

  const pixelToCm = selectedProduct ? getPixelToCm() : 1;
  const currentSizeData = sizeOptions.find((s: any) => s.name === selectedSize)?.measurements;

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

  // Initial data loading
  useEffect(() => {
    if (authLoading) return;
    if (!token) {
      router.push('/login?redirect=/studio');
      return;
    }

    const loadData = async () => {
      try {
        const [colors, dbStickers, dbIcons, dbShapes, dbFonts, templates, sizes] = await Promise.all([
          fetchStudioColors(),
          fetchStudioAssets('sticker'),
          fetchStudioAssets('icon'),
          fetchStudioAssets('shape'),
          fetchStudioAssets('font'),
          fetchGarmentTemplates(),
          fetchSizes()
        ]);

        if (colors.length) setColorPalette(colors.map((c: any) => c.hex_code));
        if (dbStickers.length) setStickers(dbStickers);
        if (dbIcons.length) setIcons(dbIcons);
        if (dbShapes.length) setShapes(dbShapes);
        if (dbFonts.length) setFontOptions(dbFonts);
        if (sizes.length) setSizeOptions(sizes);

        // Map garment templates to studio format
        if (templates.length) {
          const designables = templates.map((t: any) => ({
            id: t.id,
            name: t.name,
            icon: t.icon || '👕',
            width: t.width || 400,
            height: t.height || 500,
            base_price: t.base_price || 0,
            size_prices: t.size_prices || {},
            variants: {
              front: {
                name: 'Mặt Trước',
                image: t.front_image,
                designArea: t.front_design_area || { left: 25, top: 20, right: 25, bottom: 30 }
              },
              back: {
                name: 'Mặt Sau',
                image: t.back_image,
                designArea: t.back_design_area || { left: 25, top: 15, right: 25, bottom: 25 }
              }
            }
          }));
          setProductTypes(designables);
          setSelectedProduct(designables[0]);

          // Load existing project if projectId is in URL
          if (urlProjectId && token) {
            try {
              const isAdmin = user?.role === 'admin';
              const project = isAdmin
                ? await fetchProjectByIdAdmin(urlProjectId, token)
                : await fetchUserProjectById(urlProjectId, token);

              if (project) {
                console.log('[Studio] Loaded project:', project.id, project.name);
                setProjectId(project.id);
                setDesignName(project.name || 'Thiết kế mới');
                if (project.garment_color) setSelectedProductColor(project.garment_color);
                if (project.garment_size) setSelectedSize(project.garment_size);

                // Restore template selection
                const templateId = project.garment_template_id || project.design_data?.templateId;
                if (templateId) {
                  const matchingTemplate = designables.find((d: any) => d.id === templateId);
                  if (matchingTemplate) setSelectedProduct(matchingTemplate);
                }

                // Restore design elements
                if (project.design_data) {
                  if (project.design_data.front) setFrontElements(project.design_data.front);
                  if (project.design_data.back) setBackElements(project.design_data.back);
                  if (project.design_data.viewSide) setViewSide(project.design_data.viewSide);
                  if (project.design_data.userUploads) setUserUploads(project.design_data.userUploads);
                  if (project.design_data.generatedImages) setGeneratedImages(project.design_data.generatedImages);
                }
              } else {
                console.warn('[Studio] Failed to load project:', urlProjectId);
              }
            } catch (err) {
              console.error('[Studio] Error loading project:', err);
            }
          }
        }
      } catch (error) {
        console.error('Error loading studio data:', error);
      }
    };

    loadData();
  }, [authLoading, token, router, urlProjectId]);

  // Persist userUploads to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('studio_userUploads', JSON.stringify(userUploads));
    }
  }, [userUploads]);

  const loadMyProjects = useCallback(async () => {
    if (!token) return;
    setLoadingProjects(true);
    try {
      const projects = await fetchUserProjects(token);
      setMyProjects(projects);
    } catch (err) {
      console.error('Error loading my projects:', err);
    } finally {
      setLoadingProjects(false);
    }
  }, [token]);

  useEffect(() => {
    if (activeTab === 'my-projects') {
      loadMyProjects();
    }
  }, [activeTab, loadMyProjects]);

  const handlePlaceOrder = async () => {
    if (!user || !token || !projectId || !selectedProduct) return;
    setIsOrdering(true);
    try {
      // Calculate price based on size
      const sizePrice = selectedProduct.size_prices?.[selectedSize] || selectedProduct.base_price || 0;
      const totalAmount = sizePrice * orderForm.quantity;

      const { quantity, ...restOfForm } = orderForm;
      const orderData = {
        project_id: projectId,
        garment_template_id: selectedProduct.id,
        garment_size: selectedSize,
        garment_color: selectedProductColor,
        quantity: quantity,
        ...restOfForm,
        total_amount: totalAmount,
      };

      await createDesignOrder(orderData, token);
      setShowOrderModal(false);
      showToast('Đặt hàng thành công! Chúng tôi sẽ sớm liên hệ với bạn.', 'success');
      router.push('/design-orders');
    } catch (error: any) {
      console.error('Error placing design order:', error);
      showToast(error.message || 'Không thể đặt hàng. Vui lòng thử lại.', 'error');
    } finally {
      setIsOrdering(false);
    }
  };

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

  // Image upload handler — uploads to server
  const addImageElement = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file || !token) return;
      try {
        const serverPath = await uploadFile(file, token);
        if (!serverPath) {
          showToast('Tải ảnh thất bại', 'error');
          return;
        }
        // Add to user uploads gallery
        setUserUploads(prev => [serverPath, ...prev]);
        // Create image to get natural dimensions
        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const maxWidth = 200;
          const scale = img.width > maxWidth ? maxWidth / img.width : 1;
          const newElement: DesignElement = {
            id: `image-${Date.now()}`,
            type: 'image',
            x: 100,
            y: 150,
            width: img.width * scale,
            height: img.height * scale,
            content: serverPath,
            opacity: 100,
          };
          setElements([...elements, newElement]);
          setSelectedElementIds([newElement.id]);
        };
        img.src = getImageUrl(serverPath);
      } catch (err) {
        console.error('Upload error:', err);
        showToast('Tải ảnh thất bại', 'error');
      }
    };
    input.click();
  };

  // Add an already-uploaded image to canvas
  const addUploadedImageToCanvas = (serverPath: string) => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const maxWidth = 200;
      const scale = img.width > maxWidth ? maxWidth / img.width : 1;
      const newElement: DesignElement = {
        id: `image-${Date.now()}`,
        type: 'image',
        x: 100,
        y: 150,
        width: img.width * scale,
        height: img.height * scale,
        content: serverPath,
        opacity: 100,
      };
      setElements([...elements, newElement]);
      setSelectedElementIds([newElement.id]);
    };
    img.src = getImageUrl(serverPath);
  };

  // AI Generation Mock with Persona
  const generateAIImage = async () => {
    setIsGenerating(true);
    // Simulate complex AI reasoning based on persona
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Mock results curated based on style
    const styleGallery: { [key: string]: string[] } = {
      hiphop: [
        'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=400&h=400&fit=crop', // Abstract Dark
        'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=400&h=400&fit=crop', // Cyber gradient
      ],
      luxury: [
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=400&fit=crop', // Clean minimalist
        'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=400&fit=crop', // Tech logo
      ],
      simple: [
        'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?w=400&h=400&fit=crop', // Geometric
        'https://images.unsplash.com/photo-1614851012115-59269bb0d6e6?w=400&h=400&fit=crop', // Minimalist
      ],
      cyberpunk: [
        'https://images.unsplash.com/photo-1635776062127-d379bfcbb9c8?w=400&h=400&fit=crop', // Glitch art
        'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=400&h=400&fit=crop', // Neon abstract
      ]
    };

    const results = styleGallery[aiPersona.style] || styleGallery.hiphop;
    setGeneratedImages(results);
    setIsGenerating(false);
  };

  const addAIElement = (url: string) => {
    // Create image to get natural dimensions
    const img = new Image();
    img.crossOrigin = 'anonymous';
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
        content: url,
        opacity: 100,
      };
      setElements([...elements, newElement]);
      setSelectedElementIds([newElement.id]);
    };
    img.src = url;
    setShowAIModal(false);
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

  // ── GENERATE PREVIEW IMAGE ─────────────────────────────────────────
  const generatePreview = (side: 'front' | 'back'): string | null => {
    try {
      const canvas = document.createElement('canvas');
      const w = selectedProduct?.width || 400;
      const h = selectedProduct?.height || 500;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      // Fill background with garment color
      ctx.fillStyle = selectedProductColor === 'black' ? '#1a1a1a' : '#ffffff';
      ctx.fillRect(0, 0, w, h);

      // Draw elements
      const elements = side === 'front' ? frontElements : backElements;
      for (const el of elements) {
        ctx.save();
        ctx.globalAlpha = (el.opacity ?? 100) / 100;
        if (el.rotation) {
          ctx.translate(el.x + el.width / 2, el.y + el.height / 2);
          ctx.rotate((el.rotation * Math.PI) / 180);
          ctx.translate(-(el.x + el.width / 2), -(el.y + el.height / 2));
        }
        if (el.type === 'text') {
          ctx.fillStyle = el.color || '#000000';
          ctx.font = `${el.fontWeight || 'normal'} ${el.fontSize || 24}px ${el.fontFamily || 'Arial'}`;
          ctx.textAlign = (el.textAlign as CanvasTextAlign) || 'left';
          const textX = el.textAlign === 'center' ? el.x + el.width / 2 : el.textAlign === 'right' ? el.x + el.width : el.x;
          ctx.fillText(el.content, textX, el.y + (el.fontSize || 24));
        } else if (el.type === 'shape') {
          ctx.fillStyle = el.color || '#000000';
          if (el.content === 'circle') {
            ctx.beginPath();
            ctx.ellipse(el.x + el.width / 2, el.y + el.height / 2, el.width / 2, el.height / 2, 0, 0, Math.PI * 2);
            ctx.fill();
          } else if (el.content === 'triangle') {
            ctx.beginPath();
            ctx.moveTo(el.x + el.width / 2, el.y);
            ctx.lineTo(el.x + el.width, el.y + el.height);
            ctx.lineTo(el.x, el.y + el.height);
            ctx.closePath();
            ctx.fill();
          } else {
            ctx.fillRect(el.x, el.y, el.width, el.height);
          }
        }
        // Note: images/stickers would need async loading — we skip them for the preview thumbnail
        ctx.restore();
      }

      return canvas.toDataURL('image/png', 0.7);
    } catch {
      return null;
    }
  };

  // ── SAVE DESIGN ───────────────────────────────────────────────────
  const handleSaveDesign = async () => {
    if (!user || isSaving) return;
    setIsSaving(true);
    try {
      const previewFront = generatePreview('front');
      const previewBack = generatePreview('back');

      const templateId = selectedProduct?.id || null;
      console.log('[Studio Save] templateId:', templateId, '| projectId:', projectId, '| name:', designName);

      const designData = {
        name: designName,
        garment_template_id: templateId,
        garment_color: selectedProductColor,
        garment_size: selectedSize,
        design_data: {
          front: frontElements,
          back: backElements,
          templateId: templateId,
          templateName: selectedProduct?.name,
          viewSide,
          userUploads,
          generatedImages,
        },
        preview_front: previewFront,
        preview_back: previewBack,
      };

      if (projectId) {
        const result = await updateProject(projectId, designData, token!);
        console.log('[Studio Save] Updated project:', projectId, result ? 'OK' : 'FAILED');
        if (!result) {
          showToast('Cập nhật thất bại, thử lại...', 'error');
          return;
        }
      } else {
        const saved = await createProject(designData, token!);
        console.log('[Studio Save] Created project:', saved);
        if (saved?.id) {
          setProjectId(saved.id);
          console.log('[Studio Save] Set projectId to:', saved.id);
        } else {
          showToast('Lưu thất bại — không nhận được ID dự án.', 'error');
          return;
        }
      }
      setHasUnsavedChanges(false);
      showToast('Đã lưu thiết kế thành công!');
    } catch (error) {
      console.error('Error saving design:', error);
      showToast('Không thể lưu thiết kế. Vui lòng thử lại.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Save and then navigate away
  const handleSaveAndExit = async () => {
    if (!user || isSaving) return;
    await handleSaveDesign();
    setShowExitWarning(false);
    router.push(pendingPath || '/');
  };

  const handleExit = (path: string = '/') => {
    if (hasUnsavedChanges) {
      setPendingPath(path);
      setShowExitWarning(true);
    } else {
      router.push(path);
    }
  };

  // Detect changes for unsaved warning (deep compare)
  useEffect(() => {
    const isDifferent = (
      JSON.stringify(frontElements) !== JSON.stringify(frontHistory[0]) ||
      JSON.stringify(backElements) !== JSON.stringify(backHistory[0])
    );
    if (isDifferent) setHasUnsavedChanges(true);
  }, [frontElements, backElements, frontHistory, backHistory]);

  // ── EARLY RETURN GUARDS (must be AFTER all hooks) ──────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#e60012]/20 border-t-[#e60012] rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  if (!selectedProduct) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-[#e60012]/20 border-t-[#e60012] rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Đang tải dữ liệu studio...</p>
      </div>
    );
  }

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

  // Export print data with real dimensions for print shop
  const exportPrintData = () => {
    const printData = {
      designName,
      product: {
        id: selectedProduct.id,
        name: selectedProduct.name,
        size: selectedSize,
        realWidth: currentSizeData?.realWidth,
        realHeight: currentSizeData?.realHeight,
        printArea: currentSizeData?.printArea,
      },
      front: {
        elements: frontElements.map(el => ({
          id: el.id,
          type: el.type,
          content: el.type === 'text' ? el.content : (el.type === 'image' ? '[BASE64_IMAGE]' : el.content),
          position: {
            x: (el.x * pixelToCm).toFixed(2) + ' cm',
            y: (el.y * pixelToCm).toFixed(2) + ' cm',
          },
          size: {
            width: (el.width * pixelToCm).toFixed(2) + ' cm',
            height: (el.height * pixelToCm).toFixed(2) + ' cm',
          },
          rotation: el.rotation || 0,
          color: el.color,
          fontSize: el.fontSize ? (el.fontSize * pixelToCm * 10).toFixed(1) + ' pt' : undefined,
          fontFamily: el.fontFamily,
          opacity: el.opacity ?? 100,
        })),
      },
      back: {
        elements: backElements.map(el => ({
          id: el.id,
          type: el.type,
          content: el.type === 'text' ? el.content : (el.type === 'image' ? '[BASE64_IMAGE]' : el.content),
          position: {
            x: (el.x * pixelToCm).toFixed(2) + ' cm',
            y: (el.y * pixelToCm).toFixed(2) + ' cm',
          },
          size: {
            width: (el.width * pixelToCm).toFixed(2) + ' cm',
            height: (el.height * pixelToCm).toFixed(2) + ' cm',
          },
          rotation: el.rotation || 0,
          color: el.color,
          fontSize: el.fontSize ? (el.fontSize * pixelToCm * 10).toFixed(1) + ' pt' : undefined,
          fontFamily: el.fontFamily,
          opacity: el.opacity ?? 100,
        })),
      },
      exportedAt: new Date().toISOString(),
    };

    // Download JSON file
    const dataStr = JSON.stringify(printData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${designName.replace(/\s+/g, '_')}_print_data.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Download design as PNG image
  const downloadDesign = async () => {
    if (!canvasRef.current) return;

    try {
      // Create a canvas element for drawing
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas size based on product
      const scale = 3; // Higher resolution for print
      canvas.width = selectedProduct.width * scale;
      canvas.height = selectedProduct.height * scale;

      // Draw gray background
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Load and draw product image
      const productImg = new Image();
      productImg.crossOrigin = 'anonymous';
      await new Promise((resolve, reject) => {
        productImg.onload = resolve;
        productImg.onerror = reject;
        productImg.src = getImageUrl(currentView.image);
      });

      ctx.save();
      if (selectedProductColor === 'black') {
        ctx.filter = 'invert(1) grayscale(1) brightness(0.15)';
      } else {
        ctx.filter = 'none';
      }
      ctx.drawImage(productImg, 0, 0, canvas.width, canvas.height);
      ctx.restore();
      ctx.filter = 'none'; // Reset for elements

      // Calculate design area
      const designAreaLeft = (currentView.designArea.left / 100) * canvas.width;
      const designAreaTop = (currentView.designArea.top / 100) * canvas.height;
      const designAreaWidth = canvas.width * (100 - currentView.designArea.left - currentView.designArea.right) / 100;
      const designAreaHeight = canvas.height * (100 - currentView.designArea.top - currentView.designArea.bottom) / 100;

      // Draw elements
      for (const element of elements) {
        const x = designAreaLeft + (element.x / selectedProduct.width) * designAreaWidth * (100 / (100 - currentView.designArea.left - currentView.designArea.right));
        const y = designAreaTop + (element.y / selectedProduct.height) * designAreaHeight * (100 / (100 - currentView.designArea.top - currentView.designArea.bottom));
        const w = (element.width / selectedProduct.width) * designAreaWidth * (100 / (100 - currentView.designArea.left - currentView.designArea.right));
        const h = (element.height / selectedProduct.height) * designAreaHeight * (100 / (100 - currentView.designArea.top - currentView.designArea.bottom));

        ctx.save();
        ctx.globalAlpha = (element.opacity ?? 100) / 100;

        if (element.rotation) {
          ctx.translate(x + w / 2, y + h / 2);
          ctx.rotate((element.rotation * Math.PI) / 180);
          ctx.translate(-(x + w / 2), -(y + h / 2));
        }

        if (element.type === 'text') {
          ctx.fillStyle = element.color || '#ffffff';
          ctx.font = `${element.fontWeight || 'bold'} ${(element.fontSize || 24) * scale}px ${element.fontFamily || 'Arial'}`;
          ctx.textAlign = (element.textAlign as CanvasTextAlign) || 'center';
          ctx.textBaseline = 'middle';
          const textX = element.textAlign === 'left' ? x : element.textAlign === 'right' ? x + w : x + w / 2;
          ctx.fillText(element.content || '', textX, y + h / 2);
        } else if (element.type === 'shape') {
          ctx.fillStyle = element.color || '#e60012';
          ctx.fillRect(x, y, w, h);
        } else if (element.type === 'image' && element.content) {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          await new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
            img.src = element.content!;
          });
          ctx.drawImage(img, x, y, w, h);
        } else if (element.type === 'sticker') {
          ctx.font = `${Math.min(w, h) * 0.8}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(element.content || '', x + w / 2, y + h / 2);
        }

        ctx.restore();
      }

      // Download
      const link = document.createElement('a');
      link.download = `${designName.replace(/\s+/g, '_')}_${viewSide}_${selectedSize}.png`;
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Đang tải thiết kế về máy...');
    } catch (error) {
      console.error('Download failed:', error);
      setConfirmModal({
        isOpen: true,
        title: 'Lỗi tải xuống',
        message: 'Không thể tải xuống thiết kế. Vui lòng thử lại sau.',
        isAlert: true,
        onConfirm: () => setConfirmModal(prev => ({ ...prev, isOpen: false })),
        confirmText: 'Đóng'
      });
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
          <button
            onClick={() => handleExit('/')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
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
                    className={`w-full px-4 py-1.5 text-sm text-left hover:bg-[#2a2a2a] transition-colors ${zoom === preset ? 'text-[#e60012]' : 'text-gray-300'
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
          <button
            onClick={handleSaveDesign}
            disabled={isSaving}
            className={`px-4 py-2 text-gray-300 hover:text-white transition-colors flex items-center gap-2 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Save size={16} className={isSaving ? 'animate-pulse' : ''} />
            {isSaving ? 'Đang lưu...' : 'Lưu'}
          </button>
          <button
            onClick={downloadDesign}
            className="px-4 py-2 text-gray-300 hover:text-white transition-colors flex items-center gap-2"
          >
            <Download size={16} />
            Tải xuống
          </button>
          <button
            onClick={() => {
              setShowAIModal(true);
              setGeneratedImages([]);
            }}
            className="px-4 py-2 bg-[#e60012] text-white hover:bg-[#ff1a1a] transition-colors flex items-center gap-2 rounded"
          >
            <Sparkles size={16} />
            Sáng tạo AI
          </button>

          <button onClick={() => {
            if (!projectId) { showToast('Vui lòng lưu thiết kế trước khi đặt hàng', 'error'); return; }
            setOrderForm(f => ({ ...f, full_name: user?.full_name || '', quantity: 1 }));
            setShowOrderModal(true);
          }} className="px-4 py-2 bg-[#e60012] text-white hover:bg-[#ff1a1a] transition-colors flex items-center gap-2 rounded">
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
            { id: 'my-projects', icon: FolderOpen, label: 'Projects' },
            { id: 'ai-gallery', icon: Sparkles, label: 'AI' },
            { id: 'text', icon: Type, label: 'Text' },
            { id: 'shapes', icon: Square, label: 'Shapes' },
            { id: 'images', icon: ImageIcon, label: 'Upload' },
            { id: 'stickers', icon: Sticker, label: 'Stickers' },
          ].map((tool) => (
            <button
              key={tool.id}
              onClick={() => setActiveTab(tool.id as typeof activeTab)}
              className={`w-12 h-12 flex flex-col items-center justify-center rounded transition-colors ${activeTab === tool.id
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
                      className={`p-2 rounded-lg border transition-all ${selectedProduct.id === product.id
                        ? 'border-[#e60012] bg-[#e60012]/10'
                        : 'border-[#2a2a2a] hover:border-[#e60012]/50'
                        }`}
                    >
                      <img
                        src={getImageUrl(product.variants.front.image)}
                        alt={product.name}
                        className="w-full h-20 object-contain mb-2"
                      />
                      <span className="text-xs text-gray-300 block truncate">{product.name}</span>
                      {product.base_price > 0 && (
                        <span className="text-[10px] text-[#e60012] font-bold">{Number(product.base_price).toLocaleString('vi-VN')}đ</span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Size Selector */}
                <h3 className="text-white font-bold mb-3">Chọn size</h3>
                <div className="flex flex-wrap gap-2 mb-2">
                  {sizeOptions.map((size: any) => (
                    <button
                      key={size.id || size.name}
                      onClick={() => setSelectedSize(size.name)}
                      className={`px-3 py-1.5 rounded text-sm font-bold transition-all ${selectedSize === size.name
                        ? 'bg-[#e60012] text-white'
                        : 'bg-[#1a1a1a] text-gray-400 hover:text-white hover:bg-[#2a2a2a]'
                        }`}
                    >
                      {size.name}
                    </button>
                  ))}
                </div>
                <div className="mb-4 p-2 bg-[#1a1a1a] rounded text-xs text-gray-400">
                  📐 Vùng in: <span className="text-white font-bold">{currentSizeData?.printArea?.width ?? '—'}×{currentSizeData?.printArea?.height ?? '—'} cm</span>
                </div>

                {/* Garment Color Selector */}
                <h3 className="text-white font-bold mb-3">Màu áo</h3>
                <div className="flex gap-2 mb-6">
                  <button
                    onClick={() => setSelectedProductColor('white')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded border transition-all ${selectedProductColor === 'white'
                      ? 'border-white bg-white text-black'
                      : 'border-[#2a2a2a] text-gray-400 hover:border-white'
                      }`}
                  >
                    <div className="w-4 h-4 rounded-full border border-gray-300 bg-white" />
                    Trắng
                  </button>
                  <button
                    onClick={() => setSelectedProductColor('black')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded border transition-all ${selectedProductColor === 'black'
                      ? 'border-white bg-[#1a1a1a] text-white'
                      : 'border-[#2a2a2a] text-gray-400 hover:border-white'
                      }`}
                  >
                    <div className="w-4 h-4 rounded-full border border-gray-600 bg-black" />
                    Đen
                  </button>
                </div>

                {/* Front/Back Toggle */}
                <h3 className="text-white font-bold mb-3">Góc nhìn</h3>
                <div className="flex gap-2 bg-[#1a1a1a] p-1 rounded-lg">
                  <button
                    onClick={() => handleViewSideChange('front')}
                    className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${viewSide === 'front'
                      ? 'bg-[#e60012] text-white'
                      : 'text-gray-400 hover:text-white'
                      }`}
                  >
                    Mặt Trước
                  </button>
                  <button
                    onClick={() => handleViewSideChange('back')}
                    className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${viewSide === 'back'
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
                      onClick={() => addTextElement(font.url || font)}
                      className="w-full p-2 bg-[#1a1a1a] text-left hover:bg-[#2a2a2a] transition-colors rounded flex justify-between items-center"
                    >
                      <span
                        className="text-white"
                        style={{ fontFamily: font.url || font }}
                      >
                        {font.name || font}
                      </span>
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
                      onClick={() => addShapeElement(shape.url || shape)}
                      className="aspect-square flex items-center justify-center bg-[#1a1a1a] hover:bg-[#2a2a2a] transition-colors rounded"
                    >
                      {(shape.url || shape) === 'rect' && <Square size={28} className="text-gray-300" />}
                      {(shape.url || shape) === 'circle' && <Circle size={28} className="text-gray-300" />}
                      {(shape.url || shape) === 'triangle' && <Triangle size={28} className="text-gray-300" />}
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
                <h3 className="text-white font-bold mb-4">Ảnh của bạn</h3>
                <button
                  onClick={addImageElement}
                  className="w-full p-6 border border-dashed border-[#2a2a2a] text-gray-400 hover:border-[#e60012] hover:text-[#e60012] transition-colors rounded-lg flex flex-col items-center gap-2"
                >
                  <Upload size={24} />
                  <span>Tải ảnh lên</span>
                </button>
                <p className="text-gray-500 text-xs mt-2 text-center">
                  Hỗ trợ: JPG, PNG, SVG — ảnh được lưu trên server
                </p>
                {userUploads.length > 0 && (
                  <>
                    <h4 className="text-gray-300 text-sm font-medium mt-4 mb-2">Đã tải lên</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {userUploads.map((url, i) => (
                        <button
                          key={i}
                          onClick={() => addUploadedImageToCanvas(url)}
                          className="aspect-square bg-[#1a1a1a] rounded overflow-hidden border border-[#2a2a2a] hover:border-[#e60012] transition-colors"
                        >
                          <img src={getImageUrl(url)} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}


            {activeTab === 'ai-gallery' && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-bold">AI</h3>
                  <button
                    onClick={() => setShowAIModal(true)}
                    className="text-[10px] bg-[#e60012] text-white px-2 py-1 rounded font-bold uppercase italic"
                  >
                    Tạo mới AI
                  </button>
                </div>

                <div className="space-y-6">
                  {/* AI Generated Section */}
                  <div>
                    <h4 className="text-gray-500 text-[10px] uppercase font-bold mb-3 tracking-widest">Thiết kế AI</h4>
                    {(user?.ai_images?.length || 0) + generatedImages.length === 0 ? (
                      <div className="py-8 bg-[#1a1a1a] rounded border border-dashed border-[#2a2a2a] text-center">
                        <p className="text-gray-600 text-[10px] uppercase">Chưa có ảnh AI</p>
                        <p className="text-gray-700 text-[10px] mt-1">Bấm "Tạo mới AI" để bắt đầu</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {[...(user?.ai_images || []), ...generatedImages].map((url, idx) => (
                          <button
                            key={idx}
                            onClick={() => addStickerElement(url)}
                            className="group relative aspect-square bg-[#1a1a1a] border border-[#2a2a2a] rounded overflow-hidden hover:border-[#e60012] transition-all"
                          >
                            <img src={url} alt="AI" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center">
                              <Plus className="text-white" size={16} />
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 p-3 bg-[#e60012]/5 border border-[#e60012]/20 rounded text-[10px] text-gray-400 italic leading-relaxed">
                  Ảnh AI được lưu tự động khi bạn lưu thiết kế.
                </div>
              </>
            )}

            {activeTab === 'stickers' && (
              <>
                <h3 className="text-white font-bold mb-4">Stickers & Icons</h3>
                <div className="grid grid-cols-4 gap-2">
                  {stickers.map((sticker, index) => {
                    const stickerVal = sticker.url || sticker;
                    const isImage = typeof stickerVal === 'string' && (stickerVal.startsWith('/') || stickerVal.startsWith('http'));
                    return (
                      <button
                        key={index}
                        onClick={() => addStickerElement(stickerVal)}
                        className="aspect-square flex items-center justify-center text-2xl bg-[#1a1a1a] hover:bg-[#2a2a2a] transition-colors rounded overflow-hidden"
                      >
                        {isImage ? <img src={getImageUrl(stickerVal)} alt={sticker.name || 'sticker'} className="w-full h-full object-contain p-1" /> : stickerVal}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
            {activeTab === 'my-projects' && (
              <>
                <h3 className="text-white font-bold mb-4">Dự án của tôi</h3>
                {loadingProjects ? (
                  <div className="flex justify-center py-8">
                    <div className="w-6 h-6 border-2 border-[#e60012]/30 border-t-[#e60012] rounded-full animate-spin" />
                  </div>
                ) : myProjects.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-8">Chưa có dự án nào</p>
                ) : (
                  <div className="space-y-2">
                    {myProjects.map(p => (
                      <div key={p.id} className={`group bg-[#1a1a1a] border rounded-lg overflow-hidden hover:border-[#e60012]/50 transition-all ${p.id === projectId ? 'border-[#e60012]' : 'border-[#2a2a2a]'}`}>
                        <div className="flex items-center gap-3 p-2">
                          <div className="w-12 h-14 bg-[#111] rounded overflow-hidden flex-shrink-0">
                            {p.preview_front ? (
                              <img src={p.preview_front.startsWith('data:') ? p.preview_front : getImageUrl(p.preview_front)} alt="" className="w-full h-full object-contain" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center"><Layers size={16} className="text-gray-600" /></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium truncate">{p.name || 'Chưa đặt tên'}</p>
                            <p className="text-gray-500 text-[10px]">{new Date(p.updated_at || p.created_at).toLocaleDateString('vi-VN')}</p>
                          </div>
                        </div>
                        <div className="flex border-t border-[#2a2a2a]">
                          <button
                            onClick={() => router.push(`/studio?projectId=${p.id}`)}
                            className="flex-1 text-[10px] font-bold text-gray-400 hover:text-white hover:bg-[#2a2a2a] py-1.5 transition-colors uppercase tracking-wider"
                          >
                            Mở
                          </button>
                          <button
                            onClick={() => {
                              setConfirmModal({
                                isOpen: true,
                                title: 'Xác nhận xóa',
                                message: `Bạn có chắc chắn muốn xóa dự án "${p.name || 'Chưa đặt tên'}" không? Thao tác này không thể hoàn tác.`,
                                confirmText: 'Xóa dự án',
                                cancelText: 'Bỏ qua',
                                onConfirm: async () => {
                                  try {
                                    await deleteProject(p.id, token!);
                                    setMyProjects(prev => prev.filter(x => x.id !== p.id));
                                    if (projectId === p.id) setProjectId(null);
                                    showToast('Đã xóa dự án thành công');
                                  } catch (err) {
                                    showToast('Xóa dự án thất bại. Vui lòng thử lại.', 'error');
                                  }
                                  setConfirmModal(prev => ({ ...prev, isOpen: false }));
                                }
                              });
                            }}
                            className="flex-1 text-[10px] font-bold text-gray-400 hover:text-red-500 hover:bg-red-500/10 py-1.5 transition-colors uppercase tracking-wider border-l border-[#2a2a2a]"
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </aside>

        {/* Canvas Area */}
        <main
          ref={mainAreaRef}
          className="flex-1 bg-[#1a1a1a] flex items-center justify-center p-8 overflow-auto"
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
              src={getImageUrl(currentView.image)}
              alt={`${selectedProduct.name} - ${currentView.name}`}
              className="absolute inset-0 w-full h-full object-contain pointer-events-none"
              style={{
                opacity: 1,
                filter: selectedProductColor === 'black'
                  ? 'invert(1) grayscale(1) brightness(0.15)'
                  : 'none'
              }}
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
                  className={`absolute transition-shadow select-none ${selectedElementIds.includes(element.id)
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
                      {(element.content.startsWith('/') || element.content.startsWith('http')) ? <img src={getImageUrl(element.content)} alt="sticker" className="w-full h-full object-contain" draggable={false} /> : element.content}
                    </div>
                  )}
                  {element.type === 'image' && (
                    <img
                      src={getImageUrl(element.content)}
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
                      className={`p-2 bg-[#1a1a1a] transition-colors rounded text-xs flex flex-col items-center gap-1 ${selectedElement.isLocked ? 'text-gray-600 grayscale' : 'text-gray-400 hover:text-white hover:bg-[#2a2a2a]'
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
                      className={`p-2 bg-[#1a1a1a] transition-colors rounded text-xs flex flex-col items-center gap-1 ${selectedElement.isLocked ? 'text-gray-600 grayscale' : 'text-gray-400 hover:text-white hover:bg-[#2a2a2a]'
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
                      className={`p-2 bg-[#1a1a1a] transition-colors rounded text-xs flex flex-col items-center gap-1 ${selectedElement.isLocked ? 'text-gray-600 grayscale' : 'text-gray-400 hover:text-white hover:bg-[#2a2a2a]'
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
                      className={`p-2 bg-[#1a1a1a] transition-colors rounded text-xs flex flex-col items-center gap-1 ${selectedElement.isLocked ? 'text-gray-600 grayscale' : 'text-gray-400 hover:text-white hover:bg-[#2a2a2a]'
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
                      className={`flex-1 p-2 bg-[#1a1a1a] rounded transition-colors ${selectedElement.isLocked ? 'text-gray-600 grayscale' : 'text-gray-400 hover:text-white hover:bg-[#2a2a2a]'
                        }`}
                      title="Căn trái"
                    >
                      <AlignLeft size={16} className="mx-auto" />
                    </button>
                    <button
                      onClick={alignElementCenter}
                      disabled={selectedElement.isLocked}
                      className={`flex-1 p-2 bg-[#1a1a1a] rounded transition-colors ${selectedElement.isLocked ? 'text-gray-600 grayscale' : 'text-gray-400 hover:text-white hover:bg-[#2a2a2a]'
                        }`}
                      title="Căn giữa"
                    >
                      <AlignCenter size={16} className="mx-auto" />
                    </button>
                    <button
                      onClick={alignElementRight}
                      disabled={selectedElement.isLocked}
                      className={`flex-1 p-2 bg-[#1a1a1a] rounded transition-colors ${selectedElement.isLocked ? 'text-gray-600 grayscale' : 'text-gray-400 hover:text-white hover:bg-[#2a2a2a]'
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
                    className={`w-full h-2 bg-[#2a2a2a] rounded-lg appearance-none cursor-pointer accent-[#e60012] ${selectedElement.isLocked ? 'opacity-50 cursor-not-allowed grayscale' : ''
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
                        className={`flex-1 p-2 transition-colors rounded ${selectedElement.textAlign === 'left'
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
                        className={`flex-1 p-2 transition-colors rounded ${(selectedElement.textAlign === 'center' || !selectedElement.textAlign)
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
                        className={`flex-1 p-2 transition-colors rounded ${selectedElement.textAlign === 'right'
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
                {/* Real size in cm */}
                <div className="mb-4 p-2 bg-[#0a0a0a] rounded border border-[#2a2a2a]">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-[#e60012] font-bold">📐 Kích thước in:</span>
                    <span className="text-white">
                      {(selectedElement.width * pixelToCm).toFixed(1)} × {(selectedElement.height * pixelToCm).toFixed(1)} cm
                    </span>
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
                          className={`w-6 h-6 rounded border transition-colors ${selectedElement.color === color
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
                        className={`w-full input-street text-sm py-2 bg-[#1a1a1a] text-white border border-[#2a2a2a] rounded cursor-pointer ${selectedElement.isLocked ? 'opacity-50 cursor-not-allowed grayscale' : ''
                          }`}
                      >
                        {fontOptions.map((font) => (
                          <option
                            key={font.id}
                            value={font.url || font}
                            style={{ fontFamily: font.url || font }}
                          >
                            {font.name || font}
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
                        className={`w-full h-2 bg-[#2a2a2a] rounded-lg appearance-none cursor-pointer accent-[#e60012] ${selectedElement.isLocked ? 'opacity-50 cursor-not-allowed grayscale' : ''
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
                          className={`px-2 py-1 text-xs rounded transition-colors ${selectedElement.textBgColor
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
                            className={`w-10 h-10 rounded cursor-pointer border-2 border-[#2a2a2a] ${selectedElement.isLocked ? 'opacity-50 cursor-not-allowed grayscale' : ''
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
                          className={`px-2 py-1 text-xs rounded transition-colors ${selectedElement.textShadow
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
                              className={`w-full h-2 bg-[#2a2a2a] rounded-lg appearance-none cursor-pointer accent-[#e60012] ${selectedElement.isLocked ? 'opacity-50 cursor-not-allowed grayscale' : ''
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
                              className={`w-6 h-6 rounded cursor-pointer border-0 ${selectedElement.isLocked ? 'opacity-50 cursor-not-allowed grayscale' : ''
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
                          className={`px-2 py-1 text-xs rounded transition-colors ${selectedElement.textOutline
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
                              className={`w-full h-2 bg-[#2a2a2a] rounded-lg appearance-none cursor-pointer accent-[#e60012] ${selectedElement.isLocked ? 'opacity-50 cursor-not-allowed grayscale' : ''
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
                              className={`w-6 h-6 rounded cursor-pointer border-0 ${selectedElement.isLocked ? 'opacity-50 cursor-not-allowed grayscale' : ''
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
                      className={`w-full p-2 flex items-center gap-2 text-left text-sm rounded transition-colors ${selectedElementIds.includes(element.id)
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
                          src={getImageUrl(selectedProduct.variants.front.image)}
                          alt="Front"
                          className="max-h-[450px] object-contain"
                          style={{
                            filter: selectedProductColor === 'black'
                              ? 'invert(1) grayscale(1) brightness(0.15)'
                              : 'none'
                          }}
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
                                  className="w-full h-full"
                                  style={{
                                    backgroundColor: element.color,
                                    borderRadius: element.content === 'circle' ? '50%' : '0',
                                    clipPath: element.content === 'triangle'
                                      ? 'polygon(50% 0%, 0% 100%, 100% 100%)'
                                      : undefined,
                                  }}
                                />
                              )}
                              {element.type === 'sticker' && (
                                <div className="w-full h-full flex items-center justify-center text-2xl">
                                  {(element.content.startsWith('/') || element.content.startsWith('http')) ? <img src={getImageUrl(element.content)} alt="" className="w-full h-full object-contain" /> : element.content}
                                </div>
                              )}
                              {element.type === 'image' && (
                                <img
                                  src={getImageUrl(element.content)}
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
                          src={getImageUrl(selectedProduct.variants.back.image)}
                          alt="Back"
                          className="max-h-[450px] object-contain"
                          style={{
                            filter: selectedProductColor === 'black'
                              ? 'invert(1) grayscale(1) brightness(0.15)'
                              : 'none'
                          }}
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
                                  className="w-full h-full"
                                  style={{
                                    backgroundColor: element.color,
                                    borderRadius: element.content === 'circle' ? '50%' : '0',
                                    clipPath: element.content === 'triangle'
                                      ? 'polygon(50% 0%, 0% 100%, 100% 100%)'
                                      : undefined,
                                  }}
                                />
                              )}
                              {element.type === 'sticker' && (
                                <div className="w-full h-full flex items-center justify-center text-2xl">
                                  {(element.content.startsWith('/') || element.content.startsWith('http')) ? <img src={getImageUrl(element.content)} alt="" className="w-full h-full object-contain" /> : element.content}
                                </div>
                              )}
                              {element.type === 'image' && (
                                <img
                                  src={getImageUrl(element.content)}
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
                    className={`px-6 py-3 rounded-lg font-medium transition-all ${isAutoRotating
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
      {/* AI Design Modal */}
      {showAIModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowAIModal(false)} />
          <div className="relative bg-[#111] border border-[#2a2a2a] w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl">
            <div className="sticky top-0 bg-[#111] border-b border-[#2a2a2a] p-6 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#e60012]/20 rounded-full flex items-center justify-center">
                  <Sparkles className="text-[#e60012]" size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white uppercase">AI Personal Studio</h2>
                  <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mt-1">Sáng tạo họa tiết theo chất riêng</p>
                </div>
              </div>
              <button
                onClick={() => setShowAIModal(false)}
                className="text-gray-500 hover:text-white p-2 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-8 space-y-8">
              {/* Persona Fields */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Tính cách bản thân</label>
                  <input
                    type="text"
                    placeholder="VD: Nổi loạn, Tinh tế, Năng động..."
                    value={aiPersona.personality}
                    onChange={(e) => setAiPersona({ ...aiPersona, personality: e.target.value })}
                    className="input-street w-full !py-3"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Ngày sinh / Cung hoàng đạo</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="12/05/2000"
                      value={aiPersona.birthday}
                      onChange={(e) => setAiPersona({ ...aiPersona, birthday: e.target.value })}
                      className="input-street w-full !py-3 !px-3"
                    />
                    <select
                      value={aiPersona.zodiac}
                      onChange={(e) => setAiPersona({ ...aiPersona, zodiac: e.target.value })}
                      className="input-street w-full !py-3 !px-3 bg-[#0a0a0a]"
                    >
                      <option value="">Chọn cung</option>
                      <option value="Aries">Bạch Dương</option>
                      <option value="Taurus">Kim Ngưu</option>
                      <option value="Gemini">Song Tử</option>
                      <option value="Cancer">Cự Giải</option>
                      <option value="Leo">Sư Tử</option>
                      <option value="Virgo">Xử Nữ</option>
                      <option value="Libra">Thiên Bình</option>
                      <option value="Scorpio">Bọ Cạp</option>
                      <option value="Sagittarius">Nhân Mã</option>
                      <option value="Capricorn">Ma Kết</option>
                      <option value="Aquarius">Bảo Bình</option>
                      <option value="Pisces">Song Ngư</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Style Selector */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Phong cách mong muốn</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { id: 'hiphop', label: 'Hiphop 🎤' },
                    { id: 'luxury', label: 'Luxury 💎' },
                    { id: 'simple', label: 'Simple ⚪' },
                    { id: 'cyberpunk', label: 'Cyber ⚡' }
                  ].map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setAiPersona({ ...aiPersona, style: style.id })}
                      className={`py-3 rounded text-xs font-bold uppercase transition-all border-2 ${aiPersona.style === style.id
                        ? 'border-[#e60012] bg-[#e60012]/10 text-white'
                        : 'border-[#2a2a2a] text-gray-500 hover:text-white hover:border-[#444]'
                        }`}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Vibe */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Thông điệp muốn truyền tải</label>
                <textarea
                  placeholder="Kể cho AI nghe thêm về màu sắc riêng của bạn..."
                  value={aiPersona.customVibe}
                  onChange={(e) => setAiPersona({ ...aiPersona, customVibe: e.target.value })}
                  className="input-street w-full !py-4 h-24 resize-none"
                />
              </div>

              {/* Generation Button */}
              <button
                onClick={generateAIImage}
                disabled={isGenerating}
                className="btn-street w-full py-5 text-xl font-bold text-gray-400 uppercase tracking-widest block flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                    AI Đang phân tích cá tính...
                  </>
                ) : (
                  <>
                    Xác nhận tạo họa tiết riêng
                    <Sparkles size={24} />
                  </>
                )}
              </button>

              {/* Safety Disclaimer */}
              <div className="bg-[#1a0a0a] border border-[#ff4d4d]/20 p-4 rounded-lg flex gap-3">
                <div className="shink-0 text-red-500 mt-0.5 font-bold">⚠️</div>
                <p className="text-[10px] text-gray-400 leading-relaxed">
                  <span className="text-red-500 font-bold uppercase tracking-wider">Lưu ý quan trọng:</span> UNTYPED cam kết tự do sáng tạo, tuy nhiên chúng tôi <span className="text-white font-bold">nghiêm cấm tuyệt đối</span> các họa tiết liên quan đến <span className="text-white">phân biệt chủng tộc, tôn giáo, bạo lực hoặc nội dung nhạy cảm</span>. Các thiết kế vi phạm sẽ bị hủy đơn tự động.
                </p>
              </div>

              {/* Gallery Results */}
              {generatedImages.length > 0 && !isGenerating && (
                <div className="pt-8 border-t border-[#2a2a2a] animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h3 className="text-white font-black uppercase italic tracking-tighter text-xl mb-6">Họa tiết dành riêng cho bạn:</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {generatedImages.map((url, idx) => (
                      <button
                        key={idx}
                        onClick={() => addAIElement(url)}
                        className="group relative aspect-square bg-[#0a0a0a] border border-[#2a2a2a] rounded overflow-hidden hover:border-[#e60012] transition-all"
                      >
                        <img src={url} alt="AI Result" className="w-full h-full object-cover transition-transform group-hover:scale-110 opacity-70 group-hover:opacity-100" />
                        <div className="absolute inset-0 bg-[#e60012]/20 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all">
                          <Plus className="text-white mb-2" size={32} />
                          <span className="text-white text-[10px] font-black uppercase italic">Chọn họa tiết</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Exit Warning Modal */}
      {showExitWarning && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" />
          <div className="relative bg-[#111] border border-[#e60012]/30 p-8 max-w-md w-full rounded-2xl shadow-2xl text-center">
            <div className="w-20 h-20 bg-[#e60012]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <X className="text-[#e60012]" size={40} />
            </div>
            <h2 className="text-2xl font-black text-white uppercase italic mb-4">Chưa lưu thiết kế!</h2>
            <p className="text-gray-400 mb-8 leading-relaxed">
              Bạn có thay đổi chưa được lưu. Nếu thoát bây giờ, quá trình sáng tạo của bạn sẽ bị mất.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleSaveAndExit}
                className="btn-street w-full py-4 text-sm"
              >
                LƯU VÀ THOÁT
              </button>
              <button
                onClick={() => {
                  setShowExitWarning(false);
                  router.push(pendingPath || '/');
                }}
                className="w-full py-4 text-sm text-gray-500 hover:text-white transition-colors uppercase font-bold"
              >
                HỦY BỎ THAY ĐỔI
              </button>
              <button
                onClick={() => setShowExitWarning(false)}
                className="w-full py-4 text-sm text-gray-400 hover:text-white transition-colors uppercase font-bold"
              >
                TIẾP TỤC CHỈNH SỬA
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Design Order Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setShowOrderModal(false)} />
          <div className="relative bg-[#0f0f0f] border border-[#2a2a2a] w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-none shadow-2xl flex flex-col md:flex-row">
            {/* Left: Preview */}
            <div className="md:w-1/2 bg-[#111] p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-[#2a2a2a]">
              <div className="relative aspect-[3/4] w-full max-w-[240px] bg-[#0a0a0a] border border-[#2a2a2a] mb-4">
                <img
                  src={generatePreview('front') || ''}
                  alt="Preview Front"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-center">
                <p className="text-white font-bold uppercase tracking-widest text-xs mb-1">{designName}</p>
                <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">
                  {selectedProduct?.name} · {selectedProductColor} · Size {selectedSize}
                </p>
              </div>
            </div>

            {/* Right: Form */}
            <div className="md:w-1/2 p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Đặt hàng <span className="text-[#e60012]">Thiết kế</span></h2>
                <button onClick={() => setShowOrderModal(false)} className="text-gray-500 hover:text-white transition-colors"><X size={20} /></button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Số lượng</label>
                    <div className="flex items-center bg-[#1a1a1a] border border-[#2a2a2a]">
                      <button
                        onClick={() => setOrderForm(f => ({ ...f, quantity: Math.max(1, f.quantity - 1) }))}
                        className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white"
                      >-</button>
                      <span className="flex-1 text-center text-white font-bold">{orderForm.quantity}</span>
                      <button
                        onClick={() => setOrderForm(f => ({ ...f, quantity: f.quantity + 1 }))}
                        className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white"
                      >+</button>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Tổng tạm tính</label>
                    <div className="h-10 flex items-center text-[#e60012] font-black italic text-lg">
                      {formatPrice((selectedProduct?.size_prices?.[selectedSize] || selectedProduct?.base_price || 0) * orderForm.quantity)}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <UserIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Họ và tên người nhận"
                      value={orderForm.full_name}
                      onChange={e => setOrderForm(f => ({ ...f, full_name: e.target.value }))}
                      className="w-full bg-[#1a1a1a] border border-[#2a2a2a] pl-10 pr-4 py-3 text-white text-sm focus:border-[#e60012] transition-colors outline-none"
                    />
                  </div>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Số điện thoại"
                      value={orderForm.phone_number}
                      onChange={e => setOrderForm(f => ({ ...f, phone_number: e.target.value }))}
                      className="w-full bg-[#1a1a1a] border border-[#2a2a2a] pl-10 pr-4 py-3 text-white text-sm focus:border-[#e60012] transition-colors outline-none"
                    />
                  </div>
                  <div className="relative">
                    <MapPin size={14} className="absolute left-3 top-3 text-gray-500" />
                    <textarea
                      placeholder="Địa chỉ giao hàng chi tiết"
                      value={orderForm.shipping_address}
                      onChange={e => setOrderForm(f => ({ ...f, shipping_address: e.target.value }))}
                      rows={2}
                      className="w-full bg-[#1a1a1a] border border-[#2a2a2a] pl-10 pr-4 py-3 text-white text-sm focus:border-[#e60012] transition-colors outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Ghi chú thêm</label>
                    <textarea
                      placeholder="Ví dụ: Lưu ý vị trí in, lời nhắn..."
                      value={orderForm.note}
                      onChange={e => setOrderForm(f => ({ ...f, note: e.target.value }))}
                      rows={2}
                      className="w-full bg-[#1a1a1a] border border-[#2a2a2a] px-4 py-3 text-white text-sm focus:border-[#e60012] transition-colors outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handlePlaceOrder}
                  disabled={isOrdering || !orderForm.full_name || !orderForm.phone_number || !orderForm.shipping_address}
                  className="btn-street w-full py-4 text-sm flex items-center justify-center gap-2 group"
                >
                  {isOrdering ? (
                    <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  ) : (
                    <>
                      XÁC NHẬN ĐẶT HÀNG
                      <ChevronRight size={18} className="transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
                <p className="text-[10px] text-gray-500 text-center mt-4 uppercase font-bold tracking-widest">
                  Nhân viên sẽ liên hệ xác nhận trong vòng 24h
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Global Dialog Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => !confirmModal.isAlert && setConfirmModal(prev => ({ ...prev, isOpen: false }))} />
          <div className="relative bg-[#0f0f0f] border border-white/10 p-8 max-w-md w-full rounded-2xl shadow-2xl text-center animate-in zoom-in-95 duration-200">
            <div className={`w-20 h-20 ${confirmModal.isAlert ? 'bg-yellow-500/10' : 'bg-[#e60012]/10'} rounded-full flex items-center justify-center mx-auto mb-6`}>
              {confirmModal.isAlert ? <AlertTriangle className="text-yellow-500" size={40} /> : <Trash2 className="text-[#e60012]" size={40} />}
            </div>
            <h2 className="text-2xl font-black text-white uppercase italic mb-4">{confirmModal.title}</h2>
            <p className="text-gray-400 mb-8 leading-relaxed">
              {confirmModal.message}
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={confirmModal.onConfirm}
                className={`btn-street w-full py-4 text-sm ${confirmModal.isAlert ? 'bg-yellow-600 hover:bg-yellow-700' : ''}`}
              >
                {confirmModal.confirmText || 'XÁC NHẬN'}
              </button>
              {!confirmModal.isAlert && (
                <button
                  onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                  className="w-full py-2 text-sm text-gray-500 hover:text-white transition-colors uppercase font-bold"
                >
                  {confirmModal.cancelText || 'HỦY BỎ'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StudioPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center"><div className="text-white text-lg">Đang tải Studio...</div></div>}>
      <StudioPageContent />
    </Suspense>
  );
}
