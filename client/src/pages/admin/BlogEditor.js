import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/client';

const AdminBlogEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    image_url: '',
    tag: '',
    is_featured: false,
    is_published: false
  });

  useEffect(() => {
    if (isEditing) {
      fetchPost();
    }
  }, [id]);

  const fetchPost = async () => {
    try {
      const response = await api.get(`/blog/admin/${id}`);
      setFormData(response.data);
    } catch (err) {
      console.error('Error fetching post:', err);
      setMessage({ type: 'error', text: 'Failed to load post.' });
    } finally {
      setLoading(false);
    }
  };

  const handleTitleChange = (e) => {
    const title = e.target.value;
    setFormData(prev => ({
      ...prev,
      title,
      slug: prev.slug === '' || prev.slug === generateSlug(prev.title)
        ? generateSlug(title)
        : prev.slug
    }));
  };

  const generateSlug = (title) => {
    return title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setSaving(true);

    try {
      if (isEditing) {
        await api.put(`/blog/admin/${id}`, formData);
        setMessage({ type: 'success', text: 'Post updated successfully!' });
      } else {
        const response = await api.post('/blog/admin', formData);
        setMessage({ type: 'success', text: 'Post created successfully!' });
        navigate(`/admin/blog/${response.data.id}/edit`, { replace: true });
      }
    } catch (err) {
      console.error('Error saving post:', err);
      setMessage({
        type: 'error',
        text: err.response?.data?.error || 'Failed to save post.'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setMessage({ type: '', text: '' });

    const data = new FormData();
    data.append('image', file);

    try {
      const response = await api.post(`/blog/admin/${id}/image`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData(prev => ({ ...prev, image_url: response.data.image_url }));
      setMessage({ type: 'success', text: 'Image uploaded!' });
    } catch (err) {
      console.error('Error uploading image:', err);
      setMessage({ type: 'error', text: 'Failed to upload image.' });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleImageDelete = async () => {
    if (!window.confirm('Delete this image?')) return;

    try {
      const response = await api.delete(`/blog/admin/${id}/image`);
      setFormData(prev => ({ ...prev, image_url: response.data.image_url || '' }));
      setMessage({ type: 'success', text: 'Image deleted.' });
    } catch (err) {
      console.error('Error deleting image:', err);
      setMessage({ type: 'error', text: 'Failed to delete image.' });
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <span className="spinner"></span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex-between mb-3" style={{ flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <div>
          <Link to="/admin/blog" style={{ fontSize: '14px', color: 'var(--gray)', display: 'block', marginBottom: '8px' }}>
            &larr; Back to Blog
          </Link>
          <h1>{isEditing ? 'Edit Post' : 'New Post'}</h1>
        </div>
      </div>

      {message.text && (
        <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'} mb-3`}>
          {message.text}
        </div>
      )}

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={handleTitleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Slug (URL)</label>
            <div className="flex gap-1" style={{ alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: 'var(--gray)' }}>/blog/</span>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-2 form-group">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Tag</label>
              <input
                type="text"
                value={formData.tag}
                onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                placeholder="e.g., Music, Vendors, Community"
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Image</label>
              {isEditing ? (
                <div className="flex gap-1">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? 'Uploading...' : 'Upload Image'}
                  </button>
                  {formData.image_url && (
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={handleImageDelete}
                    >
                      Delete Image
                    </button>
                  )}
                </div>
              ) : (
                <input
                  type="text"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="Save post first to upload an image"
                />
              )}
            </div>
          </div>

          {formData.image_url && (
            <div className="mb-2">
              <img
                src={formData.image_url}
                alt="Preview"
                style={{ maxWidth: '300px', maxHeight: '200px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border)' }}
                onError={(e) => e.target.style.display = 'none'}
              />
            </div>
          )}

          <div className="form-group">
            <label>Excerpt (short summary for cards)</label>
            <textarea
              rows={2}
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Content * <span style={{ fontWeight: 400, fontSize: '13px', color: 'var(--gray)' }}>(supports HTML)</span></label>
            <textarea
              rows={12}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              required
              style={{ fontFamily: 'monospace', fontSize: '14px' }}
            />
          </div>

          <div className="card mb-3" style={{ background: 'var(--light)', display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.is_published}
                onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
              <span>
                <strong>Published</strong>
                <span style={{ color: 'var(--gray)', marginLeft: '8px' }}>(visible on the website)</span>
              </span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.is_featured}
                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
              <span>
                <strong>Featured</strong>
                <span style={{ color: 'var(--gray)', marginLeft: '8px' }}>(show on homepage news section)</span>
              </span>
            </label>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary"
              style={{ opacity: saving ? 0.7 : 1 }}
            >
              {saving ? 'Saving...' : (isEditing ? 'Update Post' : 'Create Post')}
            </button>

            {isEditing && formData.is_published && (
              <a
                href={`/blog/${formData.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                View Post &rarr;
              </a>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminBlogEditor;
