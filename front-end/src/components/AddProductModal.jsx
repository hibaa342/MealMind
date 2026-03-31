import React, { useState, useEffect } from 'react';

const TIME_OPTIONS = ['10 min', '15 min', '20 min', '25 min', '30 min', '40 min', '55 min', '1h+'];
const CATEGORY_OPTIONS = ['Breakfast', 'Lunch', 'Dinner', 'Healthy', 'Mexican', 'Italian', 'Keto', 'Protein', 'Dessert', 'Comfort'];
const TAG_OPTIONS = ['Heart-healthy', 'Weight loss', 'Vegetarian', 'High protein', 'Burn Fat', 'Low carb', 'Vegan'];

const AddProductModal = ({ isOpen, onClose, onAdd, initialData = null }) => {
  const [formData, setFormData] = useState({
    title: '',
    time: '',
    rating: 4.5,
    accent: 'green'
  });
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [otherCategory, setOtherCategory] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const resetForm = () => {
    setFormData({ title: '', time: '', rating: 4.5, accent: 'green' });
    setSelectedCategories([]);
    setSelectedTags([]);
    setOtherCategory('');
    setImage(null);
    setPreview(null);
  };

  const toggleItem = (item, list, setList) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        time: initialData.time || '',
        rating: initialData.rating || 4.5,
        accent: initialData.accent || 'green'
      });
      
      const cats = initialData.categories ? initialData.categories.split(', ') : [];
      const standardCats = cats.filter(c => CATEGORY_OPTIONS.includes(c));
      const others = cats.filter(c => !CATEGORY_OPTIONS.includes(c));
      
      setSelectedCategories(standardCats);
      setOtherCategory(others.join(', '));
      setSelectedTags(Array.isArray(initialData.tags) ? initialData.tags : []);
      setPreview(initialData.image || null);
    } else {
      resetForm();
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('title', formData.title);
    data.append('time', formData.time);
    
    let cats = [...selectedCategories];
    if (otherCategory.trim()) cats.push(otherCategory.trim());
    data.append('categories', cats.join(', '));
    
    data.append('rating', formData.rating);
    data.append('tags', selectedTags.join(','));
    data.append('accent', formData.accent);
    if (image) {
      data.append('image', image);
    }
    
    onAdd(data, initialData?._id);
    resetForm();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        <h2>{initialData ? 'Edit Recipe' : 'Add New Recipe'}</h2>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-form__group">
            <label>Title</label>
            <input 
              name="title" 
              value={formData.title} 
              onChange={(e) => setFormData({...formData, title: e.target.value})} 
              placeholder="e.g. Avocado Toast" 
              required 
            />
          </div>

          <div className="modal-form__group">
            <label>Preparation Time</label>
            <div className="time-grid">
              {TIME_OPTIONS.map(t => (
                <button
                  key={t}
                  type="button"
                  className={`selectable-chip ${formData.time === t ? 'selectable-chip--active' : ''}`}
                  onClick={() => setFormData({...formData, time: t})}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="modal-form__group">
            <label>Categories</label>
            <div className="chip-group">
              {CATEGORY_OPTIONS.map(c => (
                <button
                  key={c}
                  type="button"
                  className={`selectable-chip ${selectedCategories.includes(c) ? 'selectable-chip--active' : ''}`}
                  onClick={() => toggleItem(c, selectedCategories, setSelectedCategories)}
                >
                  {c}
                </button>
              ))}
            </div>
            <input 
              className="other-input"
              placeholder="Other category..." 
              value={otherCategory}
              onChange={(e) => setOtherCategory(e.target.value)}
            />
          </div>

          <div className="modal-form__group">
            <label>Tags</label>
            <div className="chip-group">
              {TAG_OPTIONS.map(t => (
                <button
                  key={t}
                  type="button"
                  className={`selectable-chip ${selectedTags.includes(t) ? 'selectable-chip--active' : ''}`}
                  onClick={() => toggleItem(t, selectedTags, setSelectedTags)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="modal-form__group">
            <label>Recipe Image</label>
            <div 
              className={`dropzone ${isDragging ? 'dropzone--active' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
              onClick={() => document.getElementById('fileInput').click()}
            >
              {preview ? (
                <img src={preview} alt="Preview" className="dropzone__preview" />
              ) : (
                <>
                  <div className="dropzone__icon">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                    </svg>
                  </div>
                  <p className="dropzone__text">Drag and drop or <strong>click to upload</strong></p>
                </>
              )}
              <input 
                id="fileInput"
                type="file" 
                style={{ display: 'none' }}
                onChange={(e) => handleFile(e.target.files[0])}
                accept="image/*"
              />
            </div>
          </div>

          <div className="modal-form__group">
            <label>Accent Color Theme</label>
            <div className="chip-group">
              {['green', 'orange', 'pink', 'yellow', 'purple'].map(color => (
                <button
                  key={color}
                  type="button"
                  className={`selectable-chip ${formData.accent === color ? 'selectable-chip--active' : ''} accent-${color}`}
                  onClick={() => setFormData({...formData, accent: color})}
                  style={{ textTransform: 'capitalize' }}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="modal-btn modal-btn--cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="modal-btn modal-btn--save" disabled={!formData.time || (!image && !initialData)}>
              {initialData ? 'Update Recipe' : 'Add Recipe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;
