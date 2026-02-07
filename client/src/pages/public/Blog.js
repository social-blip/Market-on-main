import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await api.get('/blog');
        setPosts(response.data);
      } catch (err) {
        console.error('Error fetching blog posts:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span className="spinner"></span>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--light)', minHeight: '100vh' }}>
      {/* Hero */}
      <section className="vendors-page__hero">
        <h1 className="vendors-page__title">Market News</h1>
        <p className="vendors-page__subtitle">
          Stories, announcements, and updates from Market on Main
        </p>
      </section>

      {/* Posts Grid */}
      <div className="container" style={{ padding: '60px 20px 100px' }}>
        {posts.length === 0 ? (
          <div className="text-center" style={{ padding: '60px 20px' }}>
            <p style={{ fontSize: '18px', color: 'var(--gray)' }}>
              No posts yet. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '32px' }}>
            {posts.map(post => (
              <Link
                key={post.id}
                to={`/blog/${post.slug}`}
                className="card"
                style={{ textDecoration: 'none', color: 'inherit', padding: 0, overflow: 'hidden' }}
              >
                {post.image_url && (
                  <div style={{ aspectRatio: '16/9', overflow: 'hidden' }}>
                    <img src={post.image_url} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                <div style={{ padding: '24px' }}>
                  {post.tag && (
                    <span className="badge badge-danger" style={{ marginBottom: '8px', display: 'inline-block' }}>
                      {post.tag}
                    </span>
                  )}
                  <h3 style={{ margin: '8px 0 12px', lineHeight: '1.2' }}>{post.title}</h3>
                  <p style={{ fontSize: '14px', color: 'var(--gray)', lineHeight: '1.6', margin: '0 0 16px' }}>
                    {post.excerpt}
                  </p>
                  <div className="flex-between">
                    <span style={{ fontSize: '12px', color: 'var(--gray-muted)' }}>
                      {formatDate(post.created_at)}
                    </span>
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>Read more →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="text-center mt-4">
          <Link to="/" className="btn-pill btn-pill-yellow">Back to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default Blog;
