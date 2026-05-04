module.exports = {
  darkMode: 'class',
  content: [
    './index.html',
    './assets/js/**/*.js'
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Bricolage Grotesque', 'sans-serif'],
        body: ['Manrope', 'sans-serif']
      },
      colors: {
        grade: {
          5: '#1d4ed8',
          6: '#15803d',
          7: '#7c3aed',
          8: '#0f766e'
        },
        'grade-5': '#1d4ed8',
        'grade-6': '#15803d',
        'grade-7': '#7c3aed',
        'grade-8': '#0f766e',
        tone: {
          positive: {
            50: '#ecfdf3',
            100: '#d1fae0',
            500: '#16a34a',
            600: '#15803d'
          },
          neutral: {
            50: '#fff7ed',
            100: '#ffedd5',
            500: '#d97706',
            600: '#b45309'
          },
          negative: {
            50: '#fef2f2',
            100: '#fee2e2',
            500: '#dc2626',
            600: '#b91c1c'
          }
        },
        positive: '#16a34a',
        neutral: '#d97706',
        negative: '#dc2626',
        primary: '#5f27cd',
        glass: 'rgba(255,255,255,0.2)'
      },
      backdropBlur: {
        glass: '10px'
      }
    }
  }
};
