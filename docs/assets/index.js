// GitHub Pages static deployment - Client-side only app
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

// Simple static app for GitHub Pages
const App = () => {
  return React.createElement('div', {
    className: 'min-h-screen bg-background text-foreground p-8'
  }, [
    React.createElement('div', {
      key: 'container',
      className: 'max-w-4xl mx-auto'
    }, [
      React.createElement('h1', {
        key: 'title',
        className: 'text-4xl font-bold mb-8 text-center'
      }, 'Karne Asistanı - Öğretmen Yardımcısı'),
      React.createElement('div', {
        key: 'content',
        className: 'bg-card p-8 rounded-lg shadow-lg'
      }, [
        React.createElement('h2', {
          key: 'subtitle',
          className: 'text-2xl font-semibold mb-4'
        }, 'GitHub Pages\'de Başarıyla Deploy Edildi!'),
        React.createElement('p', {
          key: 'description',
          className: 'text-muted-foreground mb-6'
        }, 'Bu uygulama GitHub Pages üzerinde çalışacak şekilde optimize edilmiştir. Öğretmenlerin karne yorumlarını kolayca oluşturabilmeleri için tasarlanmıştır.'),
        React.createElement('div', {
          key: 'features',
          className: 'grid grid-cols-1 md:grid-cols-2 gap-4'
        }, [
          React.createElement('div', {
            key: 'feature1',
            className: 'p-4 bg-secondary rounded-lg'
          }, [
            React.createElement('h3', {
              key: 'f1-title',
              className: 'font-semibold mb-2'
            }, '📝 Öğrenci Yönetimi'),
            React.createElement('p', {
              key: 'f1-desc',
              className: 'text-sm text-muted-foreground'
            }, 'Sınıf ve bölüm bazında öğrenci ekleme/düzenleme')
          ]),
          React.createElement('div', {
            key: 'feature2',
            className: 'p-4 bg-secondary rounded-lg'
          }, [
            React.createElement('h3', {
              key: 'f2-title',
              className: 'font-semibold mb-2'
            }, '💬 Yorum Sistemi'),
            React.createElement('p', {
              key: 'f2-desc',
              className: 'text-sm text-muted-foreground'
            }, 'Pozitif, nötr, negatif tonlarda yorumlar')
          ]),
          React.createElement('div', {
            key: 'feature3',
            className: 'p-4 bg-secondary rounded-lg'
          }, [
            React.createElement('h3', {
              key: 'f3-title',
              className: 'font-semibold mb-2'
            }, '📋 Şablon Kütüphanesi'),
            React.createElement('p', {
              key: 'f3-desc',
              className: 'text-sm text-muted-foreground'
            }, 'Hazır yorum şablonları')
          ]),
          React.createElement('div', {
            key: 'feature4',
            className: 'p-4 bg-secondary rounded-lg'
          }, [
            React.createElement('h3', {
              key: 'f4-title',
              className: 'font-semibold mb-2'
            }, '💾 Veri Yönetimi'),
            React.createElement('p', {
              key: 'f4-desc',
              className: 'text-sm text-muted-foreground'
            }, 'Tarayıcınızda güvenli saklama')
          ])
        ])
      ])
    ])
  ]);
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App));