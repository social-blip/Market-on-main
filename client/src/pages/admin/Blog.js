import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';

const AdminBlog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await api.get('/blog/admin/all');
      setPosts(response.data);
    } catch (err) {
      console.error('Error fetching blog posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (id) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      await api.delete(`/blog/admin/${id}`);
      fetchPosts();
    } catch (err) {
      console.error('Error deleting post:', err);
    }
  };

  const filteredPosts = posts.filter(p => {
    if (filter === 'published' && !p.is_published) return false;
    if (filter === 'drafts' && p.is_published) return false;
    if (filter === 'featured' && !p.is_featured) return false;

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        p.title?.toLowerCase().includes(search) ||
        p.tag?.toLowerCase().includes(search)
      );
    }

    return true;
  });

  const publishedCount = posts.filter(p => p.is_published).length;
  const draftsCount = posts.filter(p => !p.is_published).length;
  const featuredCount = posts.filter(p => p.is_featured).length;

  if (loading) {
    return (
      <div className="text-center mt-4">
        <span className="spinner"></span>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex-between mb-3">
        <div>
          <h1 className="mb-1">Blog</h1>
          <p style={{ color: 'var(--gray-dark)' }}>{posts.length} total posts</p>
        </div>
        <Link to="/admin/blog/new" className="btn btn-primary">
          + New Post
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-4 mb-4" style={{ gap: '16px' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '36px', fontWeight: 700, color: 'var(--maroon)' }}>{posts.length}</div>
          <div style={{ fontSize: '12px', color: 'var(--gray-dark)', textTransform: 'uppercase' }}>Total Posts</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '36px', fontWeight: 700, color: 'var(--success)' }}>{publishedCount}</div>
          <div style={{ fontSize: '12px', color: 'var(--gray-dark)', textTransform: 'uppercase' }}>Published</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '36px', fontWeight: 700, color: 'var(--gray)' }}>{draftsCount}</div>
          <div style={{ fontSize: '12px', color: 'var(--gray-dark)', textTransform: 'uppercase' }}>Drafts</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '36px', fontWeight: 700, color: 'var(--yellow)' }}>{featuredCount}</div>
          <div style={{ fontSize: '12px', color: 'var(--gray-dark)', textTransform: 'uppercase' }}>Featured</div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="card mb-3">
        <div className="flex-between" style={{ flexWrap: 'wrap', gap: '12px' }}>
          <div className="flex gap-1">
            {[
              { key: 'all', label: 'All', count: posts.length },
              { key: 'published', label: 'Published', count: publishedCount },
              { key: 'drafts', label: 'Drafts', count: draftsCount },
              { key: 'featured', label: 'Featured', count: featuredCount }
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={filter === key ? 'btn btn-primary' : 'btn btn-secondary'}
                style={{ fontSize: '13px', padding: '8px 14px' }}
              >
                {label} ({count})
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '6px', minWidth: '200px' }}
          />
        </div>
      </div>

      {/* Posts Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: '60px' }}>Image</th>
              <th>Title</th>
              <th>Tag</th>
              <th>Status</th>
              <th>Featured</th>
              <th>Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredPosts.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center" style={{ padding: '40px', color: 'var(--gray)' }}>
                  No posts found.
                </td>
              </tr>
            ) : (
              filteredPosts.map(post => (
                <tr key={post.id} style={{ background: !post.is_published ? '#fff9e6' : undefined }}>
                  <td>
                    {post.image_url ? (
                      <img
                        src={post.image_url}
                        alt=""
                        style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                      />
                    ) : (
                      <div style={{ width: '50px', height: '50px', background: 'var(--light)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'var(--gray)' }}>
                        No img
                      </div>
                    )}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{post.title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--gray)' }}>/{post.slug}</div>
                  </td>
                  <td>
                    {post.tag && (
                      <span style={{ fontSize: '11px', fontWeight: 600, padding: '4px 8px', background: 'var(--light)', borderRadius: '4px', textTransform: 'uppercase' }}>
                        {post.tag}
                      </span>
                    )}
                  </td>
                  <td>
                    {post.is_published ? (
                      <span className="badge badge-success">Published</span>
                    ) : (
                      <span className="badge badge-warning">Draft</span>
                    )}
                  </td>
                  <td>
                    {post.is_featured && (
                      <span className="badge" style={{ background: 'var(--yellow)', color: 'var(--dark)' }}>Featured</span>
                    )}
                  </td>
                  <td style={{ fontSize: '13px', color: 'var(--gray)' }}>
                    {new Date(post.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    <div className="flex gap-1">
                      <Link to={`/admin/blog/${post.id}/edit`} className="btn btn-secondary" style={{ fontSize: '12px', padding: '6px 12px' }}>
                        Edit
                      </Link>
                      <button onClick={() => deletePost(post.id)} className="btn btn-danger" style={{ fontSize: '12px', padding: '6px 12px' }}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminBlog;
