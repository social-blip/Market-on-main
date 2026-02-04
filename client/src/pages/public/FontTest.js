import React from 'react';

const fonts = [
  { name: 'Sora', family: "'Sora', sans-serif", description: 'Neo-Grotesque Sans Serif - crisp, fresh, modern' },
  { name: 'Epilogue', family: "'Epilogue', sans-serif", description: 'Geometric Sans Serif - killer "g", 9 weights' },
  { name: 'Syne', family: "'Syne', sans-serif", description: 'Geometric Sans Serif - gets wider as it gets heavier' },
  { name: 'Bricolage Grotesque', family: "'Bricolage Grotesque', sans-serif", description: 'Neo Grotesque - playful ascenders & descenders' },
  { name: 'Plus Jakarta Sans', family: "'Plus Jakarta Sans', sans-serif", description: 'Geometric Sans Serif - inspired by 1930s grotesques' },
  { name: 'Darker Grotesque', family: "'Darker Grotesque', sans-serif", description: 'Contemporary Sans Serif - postmodern brutalist vibes' },
];

const FontTest = () => {
  return (
    <div style={{ padding: '40px', background: '#FFD700', minHeight: '100vh' }}>
      <h1 style={{
        fontFamily: "'Archivo Black', sans-serif",
        fontSize: '24px',
        marginBottom: '40px',
        textTransform: 'uppercase'
      }}>
        Neobrutalist Font Comparison
      </h1>

      {fonts.map((font) => (
        <div
          key={font.name}
          style={{
            marginBottom: '40px',
            padding: '30px',
            background: '#fff',
            border: '5px solid #000',
            boxShadow: '6px 6px 0px #000'
          }}
        >
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '20px'
          }}>
            <div>
              <h2 style={{
                fontFamily: font.family,
                fontWeight: 800,
                fontSize: '64px',
                color: '#E30613',
                textTransform: 'uppercase',
                lineHeight: 0.9,
                margin: 0,
                WebkitTextStroke: '1px #000',
                paintOrder: 'stroke fill'
              }}>
                2025 WAS LOUD.
              </h2>
              <h2 style={{
                fontFamily: font.family,
                fontWeight: 800,
                fontSize: '64px',
                color: '#0056b3',
                lineHeight: 0.9,
                margin: '20px 0 0 0',
                WebkitTextStroke: '1px #000',
                paintOrder: 'stroke fill'
              }}>
                2025 Was Loud.
              </h2>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{
                fontFamily: "'Archivo Black', sans-serif",
                fontSize: '18px',
                textTransform: 'uppercase',
                marginBottom: '8px'
              }}>
                {font.name}
              </div>
              <div style={{
                fontSize: '14px',
                color: '#666',
                maxWidth: '300px'
              }}>
                {font.description}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FontTest;
