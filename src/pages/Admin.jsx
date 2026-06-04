import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { LogOut, Trash2, Edit2, Check, RefreshCw, AlertCircle, Home, Database } from 'lucide-react';
import { products as localBackupProducts } from '../data/products';

export default function Admin() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Auth Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // CRUD Product State
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [crudError, setCrudError] = useState('');
  
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

  // 2. Fetch products if session is active
  const fetchProducts = async () => {
    setProductsLoading(true);
    try {
      if (!supabase) {
        setProducts(localBackupProducts);
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
      setCrudError("No se pudieron cargar los productos de Supabase. Mostrando mockups locales.");
      setProducts(localBackupProducts);
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchProducts();
    }
  }, [session]);

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

    // Populate specs
    setPuffs(product.details.puffs || 'N/A');
    setCapacity(product.details.capacity || '');
    setFlavor(product.details.flavor || '');
    setBattery(product.details.battery || 'N/A');
    setNicotineStr(product.details.nicotine ? product.details.nicotine.join(', ') : '0');
    
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
    setCategory('vapers');
    setPrice('');
    setStockCount('');
    setInStock(true);
    setDescription('');
    setImage('/images/vape_mango_peach.png');
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

    // Parse nicotine strengths
    const nicotine = category === 'vapers'
      ? nicotineStr.split(',').map((n) => parseFloat(n.trim())).filter((n) => !isNaN(n))
      : [0];

    const productDetails = {
      puffs: puffs || 'N/A',
      nicotine: nicotine.length > 0 ? nicotine : [0],
      flavor: flavor || 'N/A',
      battery: battery || 'N/A',
      capacity: capacity || 'N/A'
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
      image,
      details: productDetails,
      // Default placeholder metrics for new products
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

        {/* Dashboard Grid */}
        <div className="dashboard-grid-layout">
          
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
                    {products.map((prod) => (
                      <tr key={prod.id} className={editingId === prod.id ? 'row-editing' : ''}>
                        <td>{prod.id}</td>
                        <td>
                          <img src={prod.image} alt={prod.name} className="table-product-img" />
                        </td>
                        <td>
                          <div className="table-prod-title">{prod.name}</div>
                          <div className="table-prod-brand">{prod.brand}</div>
                        </td>
                        <td className="table-category">{prod.category}</td>
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
                    ))}
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
                    <option value="vapers">Vapers / Vapeo</option>
                    <option value="oxido-nitroso">Óxido Nitroso (Alimentación)</option>
                    <option value="coleccionismo">Coleccionismo</option>
                  </select>
                </div>
                <div className="form-input-wrapper">
                  <label>Ruta Imagen (Assets) *</label>
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

        </div>
      </main>
    </div>
  );
}
