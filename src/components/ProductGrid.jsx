import { useState, useMemo } from 'react';
import ProductCard from './ProductCard';
import { SlidersHorizontal } from 'lucide-react';

export default function ProductGrid({ products, searchQuery, onQuickView, onAddToCart }) {
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [sortBy, setSortBy] = useState('recommended');

  const categories = [
    { id: 'todos', label: 'Todos' },
    { id: 'vapers', label: 'Vapers' },
    { id: 'oxido-nitroso', label: 'Óxido Nitroso (Alimentación)' },
    { id: 'coleccionismo', label: 'Coleccionismo' },
  ];

  // Filtering & Sorting logic
  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    // Filter by Search Query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.brand.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          (p.details.flavor && p.details.flavor.toLowerCase().includes(query))
      );
    }

    // Filter by Category
    if (selectedCategory !== 'todos') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Sort products
    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } // 'recommended' uses natural database order

    return result;
  }, [products, searchQuery, selectedCategory, sortBy]);

  const handleResetFilters = () => {
    setSelectedCategory('todos');
    setSortBy('recommended');
  };

  return (
    <section id="catalogo" className="catalog-section">
      <div className="catalog-header">
        <h2 className="section-title">
          Catálogo <span className="text-neon-cyan">Exclusivo de Importación</span>
        </h2>
        <p className="section-subtitle">
          Explora marcas internacionales líderes en vapeo, gastronomía gourmet y piezas exclusivas.
        </p>
      </div>

      {/* Filters and Controls Bar */}
      <div className="catalog-controls">
        {/* Category Chips */}
        <div className="category-chips">
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`chip ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Sort Dropdown */}
        <div className="sort-wrapper">
          <SlidersHorizontal size={16} className="sort-icon" />
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="recommended">Recomendados</option>
            <option value="price-asc">Precio: Menor a Mayor</option>
            <option value="price-desc">Precio: Mayor a Menor</option>
            <option value="rating">Más Valorados</option>
          </select>
        </div>
      </div>

      {/* Product List Grid */}
      {filteredAndSortedProducts.length > 0 ? (
        <div className="products-grid">
          {filteredAndSortedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={onQuickView}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      ) : (
        <div className="no-results">
          <h3>No se encontraron resultados</h3>
          <p>Prueba ajustando los filtros o buscando otro término.</p>
          <button className="btn-primary-neon reset-btn" onClick={handleResetFilters}>
            Restablecer Filtros
          </button>
        </div>
      )}
    </section>
  );
}
