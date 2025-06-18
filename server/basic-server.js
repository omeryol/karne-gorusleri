const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = parseInt(process.env.PORT || "5000");

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// In-memory storage
let students = [];
let studentComments = [];
let commentTemplates = [];

// Initialize comment templates
function initializeTemplates() {
  const grade5Semester1Comments = [
    "Sevgili [Öğrenci Adı], ortaokul hayatına uyum sağlama konusunda oldukça başarılısın. Derslerine olan ilgin ve katılımın takdir edilecek düzeyde. Matematik derslerinde gösterdiğin performans seni öne çıkarıyor. Arkadaşlarınla olan ilişkilerin olumlu ve saygılı. Ev ödevlerini düzenli olarak yapıyor, sınıf kurallarına uyuyorsun. Bu dönemde gösterdiğin çaba ve başarı gelecek dönemler için umut verici. Devam et!",
    
    "Merhaba [Öğrenci Adı], bu dönem Türkçe derslerinde gösterdiğin gelişim gerçekten övgüye değer. Okuma becerilerin gelişiyor ve metinleri anlama konusunda ilerleyişin var. Sınıf içi etkinliklere aktif katılım gösteriyorsun. Yazılı anlatım becerilerinde daha da gelişebilirsin. Arkadaşlarınla işbirliği halinde çalışmayı seviyorsun. Disiplinli çalışma alışkanlığın devam etmeli. Başarılarının devamını diliyorum.",
    
    "Canım [Öğrenci Adı], fen bilimleri dersinde merakın ve sorguculuğun dikkat çekici. Deney ve gözlem etkinliklerinde gösterdiğin ilgi takdir edilecek düzeyde. Eleştirel düşünme becerilerin gelişiyor. Sınıf arkadaşlarınla bilgi paylaşımında bulunuyorsun. Ödev yapma konusunda biraz daha düzenli olmalısın. Araştırma yapmayı seviyorsun ve bu özelliğin seni başarıya götürecek. Çalışmalarının devamını bekliyorum.",
    
    "Değerli [Öğrenci Adı], sosyal bilgiler derslerinde gösterdiğin performans beğenilecek düzeyde. Tarihsel olayları anlama ve yorumlama becerilerin gelişiyor. Coğrafi kavramları öğrenmede isteklisin. Sınıf tartışmalarına katılım gösteriyorsun. Harita okuma becerilerinde ilerliyorsun. Grup çalışmalarında sorumluluklarını yerine getiriyorsun. Bu başarılı gidişatın devam etmesini diliyorum.",
    
    "Sevgili [Öğrenci Adı], İngilizce derslerinde kelime dağarcığın genişliyor. Dinleme becerilerinde gelişim gösteriyorsun. Yeni kelimeleri öğrenme konusunda isteklisin. Telaffuz çalışmalarında daha fazla pratik yapmalısın. Sınıf içi aktivitelere katılım gösteriyorsun. Ev ödevlerini düzenli yapıyorsun. Dil öğrenme sürecinde gösterdiğin sabır ve çaba takdire şayan. Devam et!",
    
    "Merhaba [Öğrenci Adı], matematik derslerinde problem çözme becerilerin gelişiyor. Dört işlem konularında başarılısın. Geometri konularına ilgin var. Sınıf içi etkinliklere aktif katılım gösteriyorsun. Mantıklı düşünme becerilerin güçleniyor. Ödev yapma alışkanlığın düzenli. Matematik dersindeki bu başarın diğer derslere de yansımalı. Çalışmalarının devamını bekliyorum.",
    
    "Canım [Öğrenci Adı], beden eğitimi derslerinde gösterdiğin enerji ve katılım takdir ediliyor. Takım sporlarında işbirliği yapabiliyorsun. Fair play kurallarına uyuyorsun. Hareket becerilerinde gelişim gösteriyorsun. Sporun önemini kavramışsın. Arkadaşlarınla saygılı ilişkiler kuruyorsun. Bu pozitif enerjini diğer derslerde de göstermen güzel olur. Başarılarının devamını diliyorum.",
    
    "Değerli [Öğrenci Adı], müzik derslerinde gösterdiğin ilgi ve yetenek dikkat çekici. Ritim duygunu geliştiriyorsun. Şarkı söyleme etkinliklerine katılım gösteriyorsun. Müzik aletlerine olan merakın güzel. Sınıf arkadaşlarınla uyum içinde çalışabiliyorsun. Sanatsal yeteneklerini keşfetme yolunda ilerliyorsun. Bu özel yeteneğini geliştirmeye devam etmelisin. Başarılar dilerim.",
    
    "Sevgili [Öğrenci Adı], görsel sanatlar dersinde yaratıcılığın öne çıkıyor. Renkleri kullanma konusunda yeteneklisin. Çizim etkinliklerinde dikkatli çalışıyorsun. Sanat eserlerini değerlendirme becerilerin gelişiyor. El becerilerinde ilerleyiş var. Hayal gücünü kullanarak güzel çalışmalar üretiyorsun. Bu sanatsal yeteneğin gelişmeye devam etmeli. Çalışmalarının devamını bekliyorum.",
    
    "Merhaba [Öğrenci Adı], teknoloji ve tasarım dersinde pratik zekân öne çıkıyor. Tasarım süreçlerini anlayabiliyorsun. El becerilerinde gelişim gösteriyorsun. Problem çözme yaklaşımın olumlu. Takım çalışmasında sorumluluklarını yerine getiriyorsun. Yaratıcı fikirler üretebiliyorsun. Bu yeteneklerini geliştirmeye devam etmen önemli. Başarılarının devamını diliyorum.",
    
    "Canım [Öğrenci Adı], bu dönem genel akademik performansın istikrarlı bir seyir izliyor. Derslere olan ilgin ve katılımın düzenli. Ödev yapma alışkanlığın gelişmiş durumda. Sınıf kurallarına uyum gösteriyorsun. Arkadaşlarınla olan ilişkilerin pozitif. Zaman yönetimi konusunda biraz daha gelişebilirsin. Başarı grafiğin yukarı yönlü. Bu güzel gidişatı sürdürmen dileğiyle.",
    
    "Değerli [Öğrenci Adı], sınıf içi etkinliklerde aktif rol alıyorsun. Liderlik özelliklerinin geliştiğini gözlemliyoruz. Arkadaşlarına yardım etme konusunda isteklisin. Sorumluluk sahibi bir öğrencisin. Derslerdeki başarın takdir edilecek düzeyde. Öz güvenin yüksek ve bu seni öne çıkarıyor. Bu olumlu özelliklerini geliştirmeye devam et. Başarılar dilerim.",
    
    "Sevgili [Öğrenci Adı], okuma alışkanlığın gelişiyor ve bu diğer derslerindeki başarına yansıyor. Kitap okumaya olan ilgin takdire şayan. Kelime dağarcığın genişliyor. Yazılı anlatım becerilerin güçleniyor. Araştırma yapmayı seviyorsun. Bu özelliğin seni diğer öğrencilerden ayırıyor. Okuma sevgini hiç kaybetme. Bilgi birikimine devam et.",
    
    "Merhaba [Öğrenci Adı], grup çalışmalarında sergilediğin işbirliği ruhu örnek teşkil ediyor. Takım halinde çalışma becerilerin gelişmiş. Farklı fikirlere saygı gösteriyorsun. Arkadaşlarınla olan iletişimin güçlü. Sosyal becerilerin öne çıkıyor. Empati kurma yeteneğin gelişmiş. Bu sosyal zekânı akademik başarınla birleştirmelisin. Devam et!",
    
    "Canım [Öğrenci Adı], dikkat ve odaklanma becerilerin bu dönem gelişim gösterdi. Dersleri takip etme konusunda daha başarılı oldun. Sınıf içi düzene uyum sağlıyorsun. Öğretmen açıklamalarını dikkatlice dinliyorsun. Not tutma alışkanlığın gelişiyor. Bu olumlu değişimin devam etmesini umuyoruz. Çalışmalarının meyvesini almaya başladın.",
    
    "Değerli [Öğrenci Adı], sanat ve estetik konularındaki duyarlılığın dikkat çekici. Güzel sanatlar derslerindeki başarın takdire şayan. Yaratıcı düşünce becerilerin gelişmiş. Renk ve form konularında yeteneklisin. Sanatsal ifade gücün güçlü. Bu özel yeteneğini keşfetmeye ve geliştirmeye devam etmelisin. Sanat alanındaki potansiyelin yüksek.",
    
    "Sevgili [Öğrenci Adı], spor aktivitelerindeki başarın ve fair play anlayışın takdire şayan. Takım ruhu konusunda örnek davranışlar sergiliyorsun. Fiziksel gelişimin yaşına uygun. Hareket koordinasyonun iyi. Rekabet ruhu sağlıklı düzeyde. Spora olan ilgin diğer alanlardaki disiplinine de yansımalı. Bu enerjini verimli kullanmaya devam et.",
    
    "Merhaba [Öğrenci Adı], teknoloji kullanımı konusundaki bilinçlin ve sorumlu yaklaşımın övgüye değer. Dijital okuryazarlık becerilerin gelişiyor. Araştırma yaparken güvenilir kaynakları tercih ediyorsun. Teknoloji araçlarını eğitim amaçlı kullanabiliyorsun. Bu konudaki bilgi ve farkındalığın yaşıtlarından öne çıkıyor. Teknoloji ile sağlıklı ilişkini sürdür.",
    
    "Canım [Öğrenci Adı], çevre bilinci ve doğa sevgin takdire şayan. Çevre koruma konularındaki duyarlılığın örnek teşkil ediyor. Geri dönüşüm konularında bilinçlisin. Doğal yaşamı koruma konusunda farkındalığın yüksek. Bu sosyal sorumluluk bilincin çok değerli. Çevrene olan bu duyarlılığını hiç kaybetme. Gelecek nesillere güzel bir dünya bırakma idealin övgüye değer.",
    
    "Değerli [Öğrenci Adı], araştırma ve sorgulama becerilerinin gelişimini memnuniyetle takip ediyoruz. Merak ettiğin konuları araştırma konusunda isteklisin. Eleştirel düşünme becerilerin güçleniyor. Farklı bakış açılarını değerlendirebiliyorsun. Bilimsel düşünce tarzın gelişiyor. Bu özelliğin seni akademik alanda başarıya götürecek. Araştırma tutkunu hiç kaybetme.",

    // 5. Sınıf 2. Dönem
    "Sevgili [Öğrenci Adı], ikinci dönemde gösterdiğin gelişim gerçekten takdire şayan. Matematik derslerinde kesirler konusunda ustalaştın. Problem çözme becerilerinde önemli ilerleme kaydettiniz. Sınıf içi etkinliklerde liderlik vasfın öne çıkıyor. Arkadaşlarınla olan iletişimin güçlü ve olumlu. Ödev disiplinin örnek teşkil ediyor. Bu başarılı dönemin sonunda hedeflediğin noktaya ulaştın. Yeni döneme hazır olduğunu düşünüyorum.",

    "Canım [Öğrenci Adı], ikinci dönem boyunca Fen Bilimleri dersindeki merakın ve keşfetme isteğin gerçekten etkileyici. Deneysel çalışmalarda gösterdiğin titizlik ve bilimsel yaklaşımın övgüye değer. Gözlem becerilerinde kaydettiğin ilerleme hem kendini hem de arkadaşlarını etkiledi. Hipotez kurma ve sonuç çıkarma aşamalarında mantıklı yaklaşımlar sergiliyorsun. Bu bilimsel bakış açını diğer derslerde de kullanmaya devam et.",

    "Değerli [Öğrenci Adı], Türkçe derslerinde ikinci dönemde gösterdiğin gelişim takip edilmeye değer. Okuma hızın ve anlama becerilerinde belirgin bir artış gözlemleniyor. Yazım kurallarına dikkat etme konusunda daha özenli davranıyorsun. Sözcük dağarcığının genişlediği kompozisyonlarından anlaşılıyor. Şiir dinleti etkinliklerindeki performansın da çok başarılıydı. Bu dil becerilerini geliştirmeye devam etmen gelecekte sana büyük avantajlar sağlayacak.",

    "Merhaba [Öğrenci Adı], Sosyal Bilgiler dersinde ikinci dönemde gösterdiğin ilgi ve başarı gerçekten değerli. Coğrafi kavramları öğrenme konusundaki istekliliğin ve harita okuma becerilerindeki gelişimin dikkat çekici. Tarihsel olayları günümüzle ilişkilendirme yeteneğin güçleniyor. Kültürel farklılıklara olan saygın ve hoşgörün örnek teşkil ediyor. Bu sosyal farkındalığını korumaya devam et.",

    "Sevgili [Öğrenci Adı], İngilizce derslerinde ikinci dönemde kaydettiğin ilerleme gerçekten sevindirici. Yeni kelime öğrenme konusundaki heveslilikğin ve bu kelimeleri günlük konuşmalarda kullanma çaban takdire şayan. Dinleme alıştırmalarında daha dikkatli olduğun ve telaffuz çalışmalarında gayret gösterdiğin gözlemleniyor. Bu dil öğrenme motivasyonunu kaybetmemen seni hedeflerine götürecek."
  ];

  let commentNumber = 1;
  
  // 5. Sınıf yorumları
  grade5Semester1Comments.forEach((text, index) => {
    const semester = index < 20 ? 1 : 2;
    commentTemplates.push({
      id: `template-${commentNumber}`,
      text,
      grade: 5,
      semester,
      category: "genel",
      number: commentNumber++
    });
  });

  // 6, 7, 8. sınıflar için benzer yorumlar ekle
  [6, 7, 8].forEach(grade => {
    [1, 2].forEach(semester => {
      for (let i = 1; i <= 30; i++) {
        commentTemplates.push({
          id: `template-${commentNumber}`,
          text: `Sevgili [Öğrenci Adı], ${grade}. sınıf ${semester}. dönem performansın takdire şayan. Yaşına uygun gelişim gösteriyorsun ve akademik hedeflerine ulaşmak için gerekli çabayı gösteriyorsun. Derslerine olan ilgin, arkadaşlarınla olan olumlu ilişkilerin ve sorumluluk sahibi yaklaşımın seni öne çıkarıyor. Bu dönemde elde ettiğin başarıları koruyarak devam etmen dileğiyle.`,
          grade,
          semester,
          category: "genel",
          number: commentNumber++
        });
      }
    });
  });
}

initializeTemplates();

// Helper function to generate unique ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// API Routes
app.get('/api/students', (req, res) => {
  res.json(students);
});

app.post('/api/students', (req, res) => {
  const student = {
    id: generateId(),
    ...req.body
  };
  students.push(student);
  res.status(201).json(student);
});

app.post('/api/students/bulk', (req, res) => {
  const { students: newStudents } = req.body;
  if (!Array.isArray(newStudents)) {
    return res.status(400).json({ error: "Students must be an array" });
  }

  const createdStudents = newStudents.map(studentData => {
    const student = {
      id: generateId(),
      ...studentData
    };
    students.push(student);
    return student;
  });

  res.status(201).json(createdStudents);
});

app.get('/api/comment-templates', (req, res) => {
  const { grade, semester } = req.query;
  let templates = commentTemplates;
  
  if (grade && semester) {
    templates = commentTemplates.filter(t => 
      t.grade === parseInt(grade) && t.semester === parseInt(semester)
    );
  }
  
  res.json(templates);
});

app.get('/api/student-comments', (req, res) => {
  const { studentId } = req.query;
  let comments = studentComments;
  
  if (studentId) {
    comments = studentComments.filter(c => c.studentId === studentId);
  }
  
  res.json(comments);
});

app.post('/api/student-comments', (req, res) => {
  const comment = {
    id: generateId(),
    createdAt: new Date().toISOString(),
    ...req.body
  };
  studentComments.push(comment);
  res.status(201).json(comment);
});

app.delete('/api/student-comments/:id', (req, res) => {
  const index = studentComments.findIndex(c => c.id === req.params.id);
  if (index !== -1) {
    studentComments.splice(index, 1);
  }
  res.status(204).send();
});

app.get('/api/statistics', (req, res) => {
  const totalStudents = students.length;
  const studentsWithComments = new Set(studentComments.map(c => c.studentId)).size;
  const studentsWithoutComments = totalStudents - studentsWithComments;
  
  const gradeStats = students.reduce((acc, student) => {
    const grade = student.grade;
    if (!acc[grade]) {
      acc[grade] = { total: 0, withComments: 0 };
    }
    acc[grade].total++;
    
    const hasComment = studentComments.some(c => c.studentId === student.id);
    if (hasComment) {
      acc[grade].withComments++;
    }
    
    return acc;
  }, {});

  res.json({
    totalStudents,
    studentsWithComments,
    studentsWithoutComments,
    completionRate: totalStudents > 0 ? Math.round((studentsWithComments / totalStudents) * 100) : 0,
    gradeStats
  });
});

// Serve static files
app.use(express.static('client'));

// Handle client-side routing
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.resolve(__dirname, '../client/index.html'));
  } else {
    res.status(404).json({ error: 'API endpoint not found' });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Karne Yorumları Yönetim Sistemi - Server running on port ${PORT}`);
});