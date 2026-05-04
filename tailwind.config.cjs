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
        'grade-5': '#2980b9',
        'grade-6': '#27ae60',
        'grade-7': '#8e44ad',
        'grade-8': '#2c3e50',
        positive: '#2ecc71',
        neutral: '#f1c40f',
        negative: '#e74c3c',
        primary: '#5f27cd',
        glass: 'rgba(255,255,255,0.2)'
      },
      backdropBlur: {
        glass: '10px'
      }
    }
  }
};
