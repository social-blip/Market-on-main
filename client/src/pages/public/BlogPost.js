import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/client';

const BlogPost = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await api.get(`/blog/${slug}`);
        setPost(response.data);
      } catch (err) {
        console.error('Error fetching blog post:', err);
        if (err.response?.status === 404) {
          setError('Post not found');
        } else {
          setError('Failed to load post');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span className="spinner"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', textAlign: 'center' }}>
        <h1 style={{ marginBottom: '16px' }}>404</h1>
        <p style={{ fontSize: '18px', color: 'var(--gray)', marginBottom: '32px' }}>{error}</p>
        <Link to="/" className="btn-pill btn-pill-yellow">Back to Home</Link>
      </div>
    );
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div style={{ background: 'var(--light)', minHeight: '100vh' }}>
      {/* Hero */}
      <section className="vendors-page__hero">
        {post.tag && (
          <span className="badge" style={{ background: 'var(--yellow)', color: '#000', marginBottom: '20px', display: 'inline-block' }}>
            {post.tag}
          </span>
        )}
        <h1 className="vendors-page__title">{post.title}</h1>
        <p className="vendors-page__subtitle">{formatDate(post.created_at)}</p>
      </section>

      {/* Image */}
      {post.image_url && (
        <div style={{ maxWidth: '900px', margin: '-40px auto 0', padding: '0 20px' }}>
          <img
            src={post.image_url}
            alt={post.title}
            style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', borderRadius: '8px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}
          />
        </div>
      )}

      {/* Content */}
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '60px 20px 100px' }}>
        <Link to="/blog" style={{ fontSize: '14px', color: 'var(--gray)', textDecoration: 'none', display: 'inline-block', marginBottom: '40px' }}>
          &larr; Back to Blog
        </Link>

        <style>{`
          .blog-content ul, .blog-content ol { padding-left: 2em; margin-bottom: 24px; }
          .blog-content li { margin-bottom: 8px; }
        `}</style>
        <article
          className="blog-content"
          style={{ fontSize: '18px', lineHeight: '1.8', color: 'var(--dark)' }}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <div style={{ marginTop: '60px', paddingTop: '40px', borderTop: '2px solid var(--border)' }}>
          <p style={{ fontSize: '14px', color: 'var(--gray)', marginBottom: '20px' }}>
            Thanks for reading! See you at the market.
          </p>
          <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
            <Link to="/find-us" className="btn-pill btn-pill-yellow">Find Us</Link>
            <Link to="/vendors" className="btn-pill btn-pill-white" style={{ border: '1px solid var(--border)' }}>Meet Vendors</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPost;
