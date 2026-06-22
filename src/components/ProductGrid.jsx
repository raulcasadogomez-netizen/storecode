import { useState, useMemo } from 'react';
import ProductCard from './ProductCard';
import { SlidersHorizontal } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';

export default function ProductGrid({ products, categories = [], searchQuery, onQuickView, onAddToCart }) {
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [sortBy, setSortBy] = useState('recommended');
  const { t } = useTranslation();

  const categoryTabs = useMemo(() => {
    return [
      { id: 'todos', name: t('cat_all') },
      ...categories
    ];
  }, [categories, t]);

  const getCategoryName = (catId) => {
    const cat = categories.find((c) => c.id === catId);
    const dbName = cat ? cat.name : '';
    const fallbackName = 
      catId === 'vapers' ? 'Vapers' : 
      catId === 'oxido-nitroso' ? 'Óxido Nitroso' : 
      catId === 'coleccionismo' ? 'Coleccionismo' : 
      (catId ? catId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : '');
      
    return t('cat_' + catId, {}, dbName || fallbackName);
  };

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
          {t('catalog_title')} <span className="text-neon-cyan">{t('catalog_subtitle_cyan')}</span>
        </h2>
        <p className="section-subtitle">
          {t('catalog_desc')}
        </p>
      </div>

      {/* Filters and Controls Bar */}
      <div className="catalog-controls">
        {/* Category Chips */}
        <div className="category-chips">
          {categoryTabs.map((cat) => (
            <button
              key={cat.id}
              className={`chip ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.id === 'todos' ? t('cat_all') : t('cat_' + cat.id, {}, cat.name)}
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
            <option value="recommended">{t('sort_recommended')}</option>
            <option value="price-asc">{t('sort_price_asc')}</option>
            <option value="price-desc">{t('sort_price_desc')}</option>
            <option value="rating">{t('sort_rating')}</option>
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
              categoryName={getCategoryName(product.category)}
              onQuickView={onQuickView}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      ) : (
        <div className="no-results">
          <h3>{t('no_results_title')}</h3>
          <p>{t('no_results_desc')}</p>
          <button className="btn-primary-neon reset-btn" onClick={handleResetFilters}>
            {t('btn_reset')}
          </button>
        </div>
      )}
    </section>
  );
}

