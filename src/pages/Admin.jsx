import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { LogOut, Trash2, Edit2, Check, RefreshCw, AlertCircle, Home, Database, UploadCloud, X } from 'lucide-react';

// Utility to compress image files client-side before uploading or saving as Base64
const compressImage = (file, maxWidth = 800, maxHeight = 800, quality = 0.75) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Keep aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas to Blob (for storage) and DataURL (for base64 fallback)
        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            const dataUrl = canvas.toDataURL('image/jpeg', quality);
            resolve({ file: compressedFile, dataUrl });
          } else {
            reject(new Error("Canvas toBlob failed"));
          }
        }, 'image/jpeg', quality);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD') // separate accents from letters
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/\s+/g, '-') // replace spaces with -
    .replace(/[^\w\-]+/g, '') // remove all non-word chars
    .replace(/\-\-+/g, '-') // replace multiple - with single -
    .trim();
};

export default function Admin() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Auth Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Navigation State
  const [activeTab, setActiveTab] = useState('products'); // 'products' or 'categories'

  // CRUD Product State
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [crudError, setCrudError] = useState('');

  // CRUD Categories State
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoryError, setCategoryError] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  
  // Form Product State
  const [editingId, setEditingId] = useState(null); // If null, we are in CREATE mode. Else EDIT mode.
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('vapers');
  const [price, setPrice] = useState('');
  const [stockCount, setStockCount] = useState('');
  const [inStock, setInStock] = useState(true);
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('/images/vape_mango_peach.png');
  
  // Image Upload/URL/Preset States
  const [imageType, setImageType] = useState('preset'); // preset, url, upload
  const [imageUrl, setImageUrl] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedFilePreview, setUploadedFilePreview] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Custom Tags State
  const [tagsList, setTagsList] = useState([]);
  const [tagInput, setTagInput] = useState('');

  // Specs Sub-Form (JSON details)
  const [puffs, setPuffs] = useState('');
  const [capacity, setCapacity] = useState('');
  const [flavor, setFlavor] = useState('');
  const [battery, setBattery] = useState('');
  const [nicotineStr, setNicotineStr] = useState('0, 10, 20'); // Comma-separated to parse

  // 1. Session check on mount
  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const defaultCategories = [
    { id: 'vapers', name: 'Vapers' },
    { id: 'oxido-nitroso', name: 'Óxido Nitroso' },
    { id: 'coleccionismo', name: 'Coleccionismo' }
  ];

  // 2. Fetch products if session is active
  const fetchProducts = async () => {
    setProductsLoading(true);
    try {
      if (!supabase) {
        setProducts([]);
        return;
      }
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;

      if (data) {
        const mapped = data.map((item) => ({
          ...item,
          inStock: item.in_stock !== undefined ? item.in_stock : item.inStock,
          stockCount: item.stock_count !== undefined ? item.stock_count : item.stockCount,
          details: typeof item.details === 'string' ? JSON.parse(item.details) : item.details
        }));
        setProducts(mapped);
      }
    } catch (err) {
      console.error("Error fetching products in Admin:", err);
      setCrudError("No se pudieron cargar los productos de Supabase.");
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      if (!supabase) {
        const savedCats = localStorage.getItem('vapex-categories');
        if (savedCats) {
          setCategories(JSON.parse(savedCats));
        } else {
          setCategories(defaultCategories);
          localStorage.setItem('vapex-categories', JSON.stringify(defaultCategories));
        }
        return;
      }

      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      if (data) {
        setCategories(data);
        if (!category && data.length > 0) {
          setCategory(data[0].id);
        }
      }
    } catch (err) {
      console.error("Error fetching categories in Admin:", err);
      const savedCats = localStorage.getItem('vapex-categories');
      if (savedCats) {
        setCategories(JSON.parse(savedCats));
      } else {
        setCategories(defaultCategories);
      }
    } finally {
      setCategoriesLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchProducts();
      fetchCategories();
    }
  }, [session]);

  // 2.5. Category Save / Delete handlers
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    setCategoryError('');
    setIsSavingCategory(true);

    const trimmedName = newCategoryName.trim();
    if (!trimmedName) {
      setCategoryError("El nombre de la categoría no puede estar vacío.");
      setIsSavingCategory(false);
      return;
    }

    const newId = slugify(trimmedName);
    if (!newId) {
      setCategoryError("El nombre de la categoría contiene caracteres no válidos.");
      setIsSavingCategory(false);
      return;
    }

    const exists = categories.some((c) => c.id === newId);
    if (exists) {
      setCategoryError("Ya existe una categoría con este nombre o identificador.");
      setIsSavingCategory(false);
      return;
    }

    const payload = {
      id: newId,
      name: trimmedName
    };

    try {
      if (!supabase) {
        const updatedCats = [...categories, payload];
        localStorage.setItem('vapex-categories', JSON.stringify(updatedCats));
        setCategories(updatedCats);
        setNewCategoryName('');
      } else {
        const { error } = await supabase
          .from('categories')
          .insert([payload]);

        if (error) throw error;
        
        fetchCategories();
        setNewCategoryName('');
      }
    } catch (err) {
      console.error("Error saving category:", err);
      setCategoryError(err.message || "Error al crear la categoría.");
    } finally {
      setIsSavingCategory(false);
    }
  };

  const handleDeleteCategory = async (catId) => {
    if (['vapers', 'oxido-nitroso', 'coleccionismo'].includes(catId)) {
      alert("Las categorías del sistema no se pueden eliminar.");
      return;
    }

    const associatedProducts = products.filter((p) => p.category === catId);
    if (associatedProducts.length > 0) {
      alert(`No se puede eliminar la categoría porque tiene ${associatedProducts.length} producto(s) asociado(s). Cambia la categoría de estos productos o elimínalos antes de continuar.`);
      return;
    }

    if (!window.confirm("¿Estás seguro de que deseas eliminar esta categoría?")) {
      return;
    }

    setCategoryError('');

    try {
      if (!supabase) {
        const updatedCats = categories.filter((c) => c.id !== catId);
        localStorage.setItem('vapex-categories', JSON.stringify(updatedCats));
        setCategories(updatedCats);
      } else {
        const { error } = await supabase
          .from('categories')
          .delete()
          .eq('id', catId);

        if (error) throw error;

        fetchCategories();
      }
    } catch (err) {
      console.error("Error deleting category:", err);
      setCategoryError(err.message || "Error al eliminar la categoría.");
    }
  };

  // 3. Login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    
    if (!supabase) {
      setAuthError('Supabase no está configurado. Revisa tu archivo .env');
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (err) {
      console.error("Auth error:", err);
      setAuthError(err.message || 'Error al iniciar sesión.');
    }
  };

  // 4. Logout handler
  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setSession(null);
  };

  // 4.5. Image drag-and-drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        setUploadedFile(file);
        setUploadedFilePreview(URL.createObjectURL(file));
      } else {
        alert("Por favor, sube solo archivos de imagen.");
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith('image/')) {
        setUploadedFile(file);
        setUploadedFilePreview(URL.createObjectURL(file));
      } else {
        alert("Por favor, sube solo archivos de imagen.");
      }
    }
  };

  // 5. Populate form for editing
  const handleEditClick = (product) => {
    setEditingId(product.id);
    setName(product.name);
    setBrand(product.brand);
    setCategory(product.category);
    setPrice(product.price.toString());
    setStockCount(product.stockCount.toString());
    setInStock(product.inStock);
    setDescription(product.description);
    setImage(product.image);

    // Determine image type
    const presetImages = [
      '/images/vape_mango_peach.png',
      '/images/vape_pod_kit.png',
      '/images/vape_eliquid_bottle.png',
      '/images/vape_mod_cyber.png',
      '/images/vape_blueberry.png',
      '/images/vape_mint_bottle.png',
      '/images/n2o_charger.png',
      '/images/collectible_dragon.png'
    ];
    if (presetImages.includes(product.image)) {
      setImageType('preset');
      setImage(product.image);
      setImageUrl('');
    } else {
      setImageType('url');
      setImageUrl(product.image || '');
    }
    setUploadedFile(null);
    setUploadedFilePreview('');

    // Populate specs
    setPuffs(product.details.puffs || 'N/A');
    setCapacity(product.details.capacity || '');
    setFlavor(product.details.flavor || '');
    setBattery(product.details.battery || 'N/A');
    setNicotineStr(product.details.nicotine ? product.details.nicotine.join(', ') : '0');
    
    // Populate Custom Tags
    setTagsList(product.details.tags || []);
    setTagInput('');
    
    // Scroll to form
    const formElement = document.getElementById('product-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // 6. Reset form
  const handleResetForm = () => {
    setEditingId(null);
    setName('');
    setBrand('');
    setCategory(categories.length > 0 ? categories[0].id : 'vapers');
    setPrice('');
    setStockCount('');
    setInStock(true);
    setDescription('');
    setImage('/images/vape_mango_peach.png');
    
    setImageType('preset');
    setImageUrl('');
    setUploadedFile(null);
    setUploadedFilePreview('');
    setIsUploadingImage(false);
    setDragActive(false);

    setTagsList([]);
    setTagInput('');

    setPuffs('');
    setCapacity('');
    setFlavor('');
    setBattery('');
    setNicotineStr('0, 10, 20');
    setCrudError('');
  };

  // 7. CRUD Save (Create or Update)
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setCrudError('');

    // Determine final image string
    let finalImageUrl = image;
    if (imageType === 'url') {
      if (!imageUrl.trim()) {
        setCrudError("Por favor ingresa una URL de imagen válida.");
        return;
      }
      finalImageUrl = imageUrl.trim();
    } else if (imageType === 'upload') {
      if (uploadedFile) {
        setIsUploadingImage(true);
        try {
          // 1. Compress image client-side (max 800x800, JPEG 75% quality)
          const { file: compressedFile, dataUrl: compressedDataUrl } = await compressImage(uploadedFile, 800, 800, 0.75);

          // 2. Try uploading to Supabase Storage
          try {
            if (supabase) {
              const fileName = `${Math.random().toString(36).substring(2, 15)}.jpg`;
              const filePath = `uploads/${fileName}`;

              const { data, error } = await supabase.storage
                .from('products')
                .upload(filePath, compressedFile, { upsert: true });

              if (error) throw error;

              const { data: { publicUrl } } = supabase.storage
                .from('products')
                .getPublicUrl(filePath);

              finalImageUrl = publicUrl;
            } else {
              // Offline mode: use compressed base64 directly
              finalImageUrl = compressedDataUrl;
            }
          } catch (uploadError) {
            console.warn("Supabase Storage upload failed, using compressed Base64 fallback:", uploadError);
            finalImageUrl = compressedDataUrl;
          }
        } catch (compressError) {
          console.error("Compression or processing failed:", compressError);
          setCrudError("Error al procesar y comprimir la imagen cargada.");
          setIsUploadingImage(false);
          return;
        } finally {
          setIsUploadingImage(false);
        }
      } else if (editingId && image) {
        finalImageUrl = image;
      } else {
        setCrudError("Por favor selecciona o sube una imagen.");
        return;
      }
    }

    // Parse nicotine strengths
    const nicotine = category === 'vapers'
      ? nicotineStr.split(',').map((n) => parseFloat(n.trim())).filter((n) => !isNaN(n))
      : [0];

    const productDetails = {
      puffs: puffs || 'N/A',
      nicotine: nicotine.length > 0 ? nicotine : [0],
      flavor: flavor || 'N/A',
      battery: battery || 'N/A',
      capacity: capacity || 'N/A',
      tags: tagsList
    };

    const parsedPrice = parseFloat(price);
    const parsedStock = parseInt(stockCount);

    if (isNaN(parsedPrice) || isNaN(parsedStock)) {
      setCrudError("Por favor ingresa un precio y stock válidos.");
      return;
    }

    const payload = {
      name,
      brand,
      category,
      price: parsedPrice,
      in_stock: inStock,
      stock_count: parsedStock,
      description,
      image: finalImageUrl,
      details: productDetails,
      rating: 5.0,
      reviews: 0
    };

    try {
      if (!supabase) {
        setCrudError("Offline Mode: No se puede guardar en Supabase.");
        return;
      }

      if (editingId) {
        // Edit Mode
        const { error } = await supabase
          .from('products')
          .update(payload)
          .eq('id', editingId);

        if (error) throw error;
      } else {
        // Create Mode
        const { error } = await supabase
          .from('products')
          .insert([payload]);

        if (error) throw error;
      }

      // Success
      handleResetForm();
      fetchProducts();
    } catch (err) {
      console.error("Save product error:", err);
      setCrudError(err.message || "Error al guardar el producto.");
    }
  };

  // 8. CRUD Delete
  const handleDeleteProduct = async (id) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este producto?")) return;
    setCrudError('');

    try {
      if (!supabase) {
        setCrudError("Offline Mode: No se puede eliminar de Supabase.");
        return;
      }

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // If deleting the product we were currently editing, reset the form
      if (editingId === id) {
        handleResetForm();
      }

      fetchProducts();
    } catch (err) {
      console.error("Delete product error:", err);
      setCrudError(err.message || "Error al eliminar el producto.");
    }
  };

  // 9. Render Loading Session Screen
  if (authLoading) {
    return (
      <div className="admin-page-loading">
        <div className="spinner-glow"></div>
        <h3>Verificando Sesión de Administrador...</h3>
      </div>
    );
  }

  // 10. Render LOGIN PANEL if not authenticated
  if (!session) {
    return (
      <div className="admin-login-overlay">
        <a href="/" className="back-home-btn">
          <Home size={18} /> Volver a la Tienda
        </a>

        <div className="admin-login-card">
          <div className="login-logo">
            <span className="logo-neon-text">VAPEX</span>
            <span className="badge-admin">ADMIN</span>
          </div>

          <h2>Acceso a Consola</h2>
          <p className="login-subtitle">Introduce tus credenciales de administrador para gestionar la tienda.</p>

          <form onSubmit={handleLogin} className="login-form">
            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="admin@vapex.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="input-group">
              <label>Contraseña</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {authError && (
              <div className="auth-error-box">
                <AlertCircle size={16} />
                <span>{authError}</span>
              </div>
            )}

            <button type="submit" className="btn-primary-neon login-btn">
              Entrar a Consola
            </button>
          </form>

          <div className="supabase-help-note">
            <Database size={14} className="text-cyan" />
            <p>
              <strong>Nota:</strong> Consola de administración privada. Los usuarios autorizados deben gestionarse internamente en el panel de control de Supabase.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 11. Render AUTHENTICATED ADMIN DASHBOARD
  return (
    <div className="admin-dashboard-container">
      {/* Top Header */}
      <header className="admin-dashboard-header">
        <div className="header-logo-wrapper">
          <span className="logo-neon-text">VAPEX</span>
          <span className="badge-admin">CONSOLE</span>
        </div>
        
        <div className="header-actions-wrapper">
          <a href="/" className="btn-secondary-outline back-btn-admin">
            <Home size={16} /> Ver Web
          </a>
          <button className="btn-logout" onClick={handleLogout}>
            <LogOut size={16} /> Salir
          </button>
        </div>
      </header>

      <main className="admin-dashboard-main">
        {/* Error message */}
        {crudError && (
          <div className="crud-error-banner">
            <AlertCircle size={20} />
            <span>{crudError}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="admin-nav-tabs">
          <button 
            type="button"
            className={`admin-nav-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            Productos
          </button>
          <button 
            type="button"
            className={`admin-nav-tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
            onClick={() => setActiveTab('categories')}
          >
            Categorías
          </button>
        </div>

        {/* Dashboard Grid */}
        <div className="dashboard-grid-layout">
          {activeTab === 'products' ? (
            <>
              {/* LEFT: PRODUCTS LIST */}
              <div className="dashboard-column list-column">
                <div className="panel-header">
                  <h2>Catálogo de Productos ({products.length})</h2>
                  <button className="btn-refresh" onClick={fetchProducts} title="Recargar">
                    <RefreshCw size={16} />
                  </button>
                </div>

                {productsLoading ? (
                  <div className="panel-loading">
                    <div className="spinner-glow small-spinner"></div>
                    <p>Cargando catálogo...</p>
                  </div>
                ) : (
                  <div className="admin-table-wrapper">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Imagen</th>
                          <th>Nombre</th>
                          <th>Categoría</th>
                          <th>Precio</th>
                          <th>Stock</th>
                          <th>Estado</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((prod) => {
                          const catName = categories.find(c => c.id === prod.category)?.name || prod.category;
                          return (
                            <tr key={prod.id} className={editingId === prod.id ? 'row-editing' : ''}>
                              <td>{prod.id}</td>
                              <td>
                                <img src={prod.image} alt={prod.name} className="table-product-img" />
                              </td>
                              <td>
                                <div className="table-prod-title">{prod.name}</div>
                                <div className="table-prod-brand">{prod.brand}</div>
                              </td>
                              <td className="table-category">{catName}</td>
                              <td className="table-price">{prod.price.toFixed(2)} €</td>
                              <td>{prod.stockCount} uds</td>
                              <td>
                                <span className={`table-stock-tag ${prod.inStock ? 'in-stock' : 'no-stock'}`}>
                                  {prod.inStock ? 'En Stock' : 'Sin Stock'}
                                </span>
                              </td>
                              <td>
                                <div className="table-action-btns">
                                  <button 
                                    className="action-btn btn-edit" 
                                    onClick={() => handleEditClick(prod)}
                                    title="Editar"
                                  >
                                    <Edit2 size={14} />
                                  </button>
                                  <button 
                                    className="action-btn btn-delete" 
                                    onClick={() => handleDeleteProduct(prod.id)}
                                    title="Eliminar"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* RIGHT: SAVE / EDIT FORM */}
              <div className="dashboard-column form-column" id="product-form">
                <div className="panel-header">
                  <h2>{editingId ? 'Editar Producto' : 'Añadir Nuevo Producto'}</h2>
                  {editingId && (
                    <button className="btn-cancel-edit" onClick={handleResetForm}>
                      Cancelar Edición
                    </button>
                  )}
                </div>

                <form onSubmit={handleSaveProduct} className="admin-product-form">
                  {/* Common Fields */}
                  <div className="form-group-row">
                    <div className="form-input-wrapper">
                      <label>Nombre del Producto *</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ej. Mango Peach Ice"
                        required
                      />
                    </div>
                    <div className="form-input-wrapper">
                      <label>Marca *</label>
                      <input
                        type="text"
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                        placeholder="Ej. VAPEX"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group-row">
                    <div className="form-input-wrapper">
                      <label>Categoría *</label>
                      <select value={category} onChange={(e) => setCategory(e.target.value)} required>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name} {['vapers', 'oxido-nitroso', 'coleccionismo'].includes(cat.id) ? '(Sistema)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-input-wrapper">
                      <label>Imagen del Producto *</label>
                      <div className="image-selector-tabs">
                        <button 
                          type="button" 
                          className={`image-tab-btn ${imageType === 'preset' ? 'active' : ''}`}
                          onClick={() => setImageType('preset')}
                        >
                          Predeterminada
                        </button>
                        <button 
                          type="button" 
                          className={`image-tab-btn ${imageType === 'url' ? 'active' : ''}`}
                          onClick={() => setImageType('url')}
                        >
                          URL Externa
                        </button>
                        <button 
                          type="button" 
                          className={`image-tab-btn ${imageType === 'upload' ? 'active' : ''}`}
                          onClick={() => setImageType('upload')}
                        >
                          Subir Archivo
                        </button>
                      </div>

                      {imageType === 'preset' && (
                        <select value={image} onChange={(e) => setImage(e.target.value)} required>
                          <option value="/images/vape_mango_peach.png">Mango Peach (Cian/Morado)</option>
                          <option value="/images/vape_pod_kit.png">AeroPod Kit (Azul)</option>
                          <option value="/images/vape_eliquid_bottle.png">E-Liquid Strawberry (Rojo)</option>
                          <option value="/images/vape_mod_cyber.png">Cyber Mod Box (Oro/Carbono)</option>
                          <option value="/images/vape_blueberry.png">Blueberry Sour (Lila/Azul)</option>
                          <option value="/images/vape_mint_bottle.png">Mint Frost (Verde)</option>
                          <option value="/images/n2o_charger.png">N2O Charger (Gas Plata/Negro)</option>
                          <option value="/images/collectible_dragon.png">Zippo Dragon (Latón Cepillado)</option>
                        </select>
                      )}

                      {imageType === 'url' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <input
                            type="url"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            placeholder="https://ejemplo.com/imagen.jpg"
                            required={imageType === 'url'}
                          />
                          {imageUrl && (
                            <div className="image-preview-container">
                              <img src={imageUrl} alt="Vista previa URL" onError={(e) => { e.target.src = 'https://placehold.co/400?text=Error+Cargando+Imagen'; }} />
                            </div>
                          )}
                        </div>
                      )}

                      {imageType === 'upload' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {isUploadingImage ? (
                            <div className="image-upload-loading">
                              <RefreshCw size={24} className="animate-spin text-cyan" />
                              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Procesando imagen...</p>
                            </div>
                          ) : uploadedFilePreview || (editingId && image && !image.startsWith('/images/')) ? (
                            <div className="image-preview-container">
                              <img src={uploadedFilePreview || image} alt="Vista previa de subida" />
                              <button 
                                type="button" 
                                className="btn-remove-preview"
                                onClick={() => {
                                  setUploadedFile(null);
                                  setUploadedFilePreview('');
                                  if (editingId) {
                                    setImage('/images/vape_mango_peach.png');
                                  }
                                }}
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ) : (
                            <div 
                              className={`image-upload-zone ${dragActive ? 'drag-active' : ''}`}
                              onDragEnter={handleDrag}
                              onDragOver={handleDrag}
                              onDragLeave={handleDrag}
                              onDrop={handleDrop}
                              onClick={() => document.getElementById('file-upload-input').click()}
                            >
                              <input
                                id="file-upload-input"
                                type="file"
                                style={{ display: 'none' }}
                                accept="image/*"
                                onChange={handleFileChange}
                              />
                              <div className="upload-icon-wrapper">
                                <UploadCloud size={32} />
                              </div>
                              <div className="upload-texts">
                                <h4>Haz clic o arrastra una imagen</h4>
                                <p>PNG, JPG o WEBP (máx. 5MB)</p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="form-group-row">
                    <div className="form-input-wrapper">
                      <label>Precio (€) *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="Ej. 12.99"
                        required
                      />
                    </div>
                    <div className="form-input-wrapper">
                      <label>Cantidad en Stock *</label>
                      <input
                        type="number"
                        value={stockCount}
                        onChange={(e) => setStockCount(e.target.value)}
                        placeholder="Ej. 15"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-input-wrapper checkbox-wrapper">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={inStock}
                        onChange={(e) => setInStock(e.target.checked)}
                      />
                      <span>Producto Activo / En Stock</span>
                    </label>
                  </div>

                  <div className="form-input-wrapper">
                    <label>Descripción detallada *</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Escribe la descripción para los clientes..."
                      rows={3}
                      required
                    />
                  </div>

                  {/* TAGS GESTION */}
                  <div className="form-input-wrapper tags-input-container">
                    <label>Etiquetas Personalizadas</label>
                    <div className="tags-input-field-wrapper">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ',') {
                            e.preventDefault();
                            const cleanTag = tagInput.trim().replace(/,$/, '');
                            if (cleanTag && !tagsList.includes(cleanTag)) {
                              setTagsList([...tagsList, cleanTag]);
                              setTagInput('');
                            }
                          }
                        }}
                        placeholder="Escribe una etiqueta y pulsa Enter o coma (Ej: 8000 caladas, 14ml...)"
                      />
                      <button
                        type="button"
                        className="btn-add-tag"
                        onClick={(e) => {
                          e.preventDefault();
                          const cleanTag = tagInput.trim();
                          if (cleanTag && !tagsList.includes(cleanTag)) {
                            setTagsList([...tagsList, cleanTag]);
                            setTagInput('');
                          }
                        }}
                      >
                        Añadir
                      </button>
                    </div>
                    {tagsList.length > 0 && (
                      <div className="tags-chips-wrapper">
                        {tagsList.map((tag, idx) => (
                          <span key={idx} className="tag-chip">
                            {tag}
                            <button
                              type="button"
                              className="btn-remove-tag"
                              onClick={() => setTagsList(tagsList.filter((_, i) => i !== idx))}
                            >
                              <X size={12} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* TECHNICAL DETAILS SUBFORM */}
                  <div className="form-specs-sub-panel">
                    <h3>Especificaciones Técnicas (JSON detalles)</h3>
                    
                    <div className="form-group-row">
                      <div className="form-input-wrapper">
                        <label>
                          {category === 'vapers' ? 'Autonomía (Puffs/Caladas)' : 'Autonomía (Opcional)'}
                        </label>
                        <input
                          type="text"
                          value={puffs}
                          onChange={(e) => setPuffs(e.target.value)}
                          placeholder="Ej. 8000 Caladas (o N/A)"
                        />
                      </div>
                      <div className="form-input-wrapper">
                        <label>
                          {category === 'coleccionismo' ? 'Mecanismo / Tipo' : 'Batería'}
                        </label>
                        <input
                          type="text"
                          value={battery}
                          onChange={(e) => setBattery(e.target.value)}
                          placeholder="Ej. 650mAh (o N/A)"
                        />
                      </div>
                    </div>

                    <div className="form-group-row">
                      <div className="form-input-wrapper">
                        <label>
                          {category === 'oxido-nitroso' ? 'Contenido / Peso' : 'Capacidad'}
                        </label>
                        <input
                          type="text"
                          value={capacity}
                          onChange={(e) => setCapacity(e.target.value)}
                          placeholder="Ej. 14ml o 640g"
                        />
                      </div>
                      <div className="form-input-wrapper">
                        <label>
                          {category === 'oxido-nitroso' ? 'Pureza / Grado' : 
                           category === 'coleccionismo' ? 'Acabado / Material' : 'Sabor principal'}
                        </label>
                        <input
                          type="text"
                          value={flavor}
                          onChange={(e) => setFlavor(e.target.value)}
                          placeholder="Ej. Mango, Latón cepillado, Grado E942"
                        />
                      </div>
                    </div>

                    {category === 'vapers' && (
                      <div className="form-input-wrapper">
                        <label>Opciones de Nicotina (Separar con comas)</label>
                        <input
                          type="text"
                          value={nicotineStr}
                          onChange={(e) => setNicotineStr(e.target.value)}
                          placeholder="Ej. 0, 10, 20"
                        />
                        <p className="input-hint">Valores en mg/ml. Ej: 0, 10, 20</p>
                      </div>
                    )}
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn-primary-neon form-save-btn">
                      <Check size={18} />
                      <span>{editingId ? 'Guardar Cambios' : 'Crear Producto'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </>
          ) : (
            <>
              {/* LEFT: CATEGORIES LIST */}
              <div className="dashboard-column list-column">
                <div className="panel-header">
                  <h2>Gestión de Categorías ({categories.length})</h2>
                  <button className="btn-refresh" onClick={fetchCategories} title="Recargar">
                    <RefreshCw size={16} />
                  </button>
                </div>

                {categoriesLoading ? (
                  <div className="panel-loading">
                    <div className="spinner-glow small-spinner"></div>
                    <p>Cargando categorías...</p>
                  </div>
                ) : (
                  <div className="admin-table-wrapper">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Identificador (ID)</th>
                          <th>Nombre de la Categoría</th>
                          <th>Productos Asociados</th>
                          <th>Tipo</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {categories.map((cat) => {
                          const isSystem = ['vapers', 'oxido-nitroso', 'coleccionismo'].includes(cat.id);
                          const prodCount = products.filter(p => p.category === cat.id).length;
                          return (
                            <tr key={cat.id}>
                              <td><code>{cat.id}</code></td>
                              <td><strong>{cat.name}</strong></td>
                              <td>{prodCount} productos</td>
                              <td>
                                {isSystem ? (
                                  <span className="lock-badge">Sistema</span>
                                ) : (
                                  <span className="table-stock-tag in-stock">Personalizada</span>
                                )}
                              </td>
                              <td>
                                {!isSystem && (
                                  <button 
                                    className="action-btn btn-delete" 
                                    onClick={() => handleDeleteCategory(cat.id)}
                                    title="Eliminar Categoría"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* RIGHT: CREATE CATEGORY FORM */}
              <div className="dashboard-column form-column">
                <div className="panel-header">
                  <h2>Añadir Nueva Categoría</h2>
                </div>

                {categoryError && (
                  <div className="crud-error-banner" style={{ marginBottom: '1.5rem' }}>
                    <AlertCircle size={20} />
                    <span>{categoryError}</span>
                  </div>
                )}

                <form onSubmit={handleSaveCategory} className="admin-product-form">
                  <div className="form-input-wrapper">
                    <label>Nombre de la Categoría *</label>
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Ej. Cachimbas"
                      required
                    />
                  </div>

                  <div className="form-input-wrapper">
                    <label>Identificador sugerido (ID generado)</label>
                    <input
                      type="text"
                      value={slugify(newCategoryName)}
                      readOnly
                      disabled
                      placeholder="ej-cachimbas"
                      style={{ opacity: 0.7, background: 'rgba(255,255,255,0.02)', fontFamily: 'monospace' }}
                    />
                    <p className="input-hint">El identificador se genera automáticamente en minúsculas y sin acentos.</p>
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn-primary-neon form-save-btn" disabled={isSavingCategory}>
                      {isSavingCategory ? (
                        <RefreshCw size={18} className="animate-spin" style={{ marginRight: '8px' }} />
                      ) : (
                        <Check size={18} style={{ marginRight: '8px' }} />
                      )}
                      <span>Crear Categoría</span>
                    </button>
                  </div>
                </form>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
