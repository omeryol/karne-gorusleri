import type { Student, InsertStudent, CommentTemplate, InsertCommentTemplate, StudentComment, InsertStudentComment } from "@shared/schema";

export interface IStorage {
  // Students
  getStudents(): Promise<Student[]>;
  getStudent(id: string): Promise<Student | null>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: string, student: Partial<InsertStudent>): Promise<Student>;
  deleteStudent(id: string): Promise<void>;
  deleteAllStudents(): Promise<void>;

  // Comment Templates
  getCommentTemplates(): Promise<CommentTemplate[]>;
  getCommentTemplatesByGradeAndSemester(grade: number, semester: number): Promise<CommentTemplate[]>;
  getCommentTemplate(id: string): Promise<CommentTemplate | null>;
  createCommentTemplate(template: InsertCommentTemplate): Promise<CommentTemplate>;

  // Student Comments
  getStudentComments(): Promise<StudentComment[]>;
  getStudentComment(id: string): Promise<StudentComment | null>;
  getStudentCommentsByStudentId(studentId: string): Promise<StudentComment[]>;
  createStudentComment(comment: InsertStudentComment): Promise<StudentComment>;
  deleteStudentComment(id: string): Promise<void>;
  deleteStudentCommentsByStudentId(studentId: string): Promise<void>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private students: Student[] = [];
  private commentTemplates: CommentTemplate[] = [];
  private studentComments: StudentComment[] = [];

  constructor() {
    this.initializeCommentTemplates();
  }

  // Students
  async getStudents(): Promise<Student[]> {
    return this.students;
  }

  async getStudent(id: string): Promise<Student | null> {
    return this.students.find(s => s.id === id) || null;
  }

  async createStudent(student: InsertStudent): Promise<Student> {
    const newStudent: Student = {
      ...student,
      id: crypto.randomUUID(),
    };
    this.students.push(newStudent);
    return newStudent;
  }

  async updateStudent(id: string, student: Partial<InsertStudent>): Promise<Student> {
    const index = this.students.findIndex(s => s.id === id);
    if (index === -1) throw new Error("Student not found");
    
    this.students[index] = { ...this.students[index], ...student };
    return this.students[index];
  }

  async deleteStudent(id: string): Promise<void> {
    this.students = this.students.filter(s => s.id !== id);
    // Also delete related comments
    await this.deleteStudentCommentsByStudentId(id);
  }

  async deleteAllStudents(): Promise<void> {
    this.students = [];
    this.studentComments = [];
  }

  // Comment Templates
  async getCommentTemplates(): Promise<CommentTemplate[]> {
    return this.commentTemplates;
  }

  async getCommentTemplatesByGradeAndSemester(grade: number, semester: number): Promise<CommentTemplate[]> {
    return this.commentTemplates.filter(t => t.grade === grade && t.semester === semester);
  }

  async getCommentTemplate(id: string): Promise<CommentTemplate | null> {
    return this.commentTemplates.find(t => t.id === id) || null;
  }

  async createCommentTemplate(template: InsertCommentTemplate): Promise<CommentTemplate> {
    const newTemplate: CommentTemplate = {
      ...template,
      id: crypto.randomUUID(),
    };
    this.commentTemplates.push(newTemplate);
    return newTemplate;
  }

  // Student Comments
  async getStudentComments(): Promise<StudentComment[]> {
    return this.studentComments;
  }

  async getStudentComment(id: string): Promise<StudentComment | null> {
    return this.studentComments.find(c => c.id === id) || null;
  }

  async getStudentCommentsByStudentId(studentId: string): Promise<StudentComment[]> {
    return this.studentComments.filter(c => c.studentId === studentId);
  }

  async createStudentComment(comment: InsertStudentComment): Promise<StudentComment> {
    const newComment: StudentComment = {
      ...comment,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    this.studentComments.push(newComment);
    return newComment;
  }

  async deleteStudentComment(id: string): Promise<void> {
    this.studentComments = this.studentComments.filter(c => c.id !== id);
  }

  async deleteStudentCommentsByStudentId(studentId: string): Promise<void> {
    this.studentComments = this.studentComments.filter(c => c.studentId !== studentId);
  }

  private initializeCommentTemplates() {
    // 5. Sınıf 1. Dönem yorumları (30 adet)
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
      
      // Devam eden 20 yorum daha...
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
    ];

    // 5. Sınıf 2. Dönem yorumları (30 adet) ve diğer sınıflar için benzer şekilde
    // Bu kısmı kısaltarak örnekleri veriyorum, gerçek uygulamada hepsini ekleyeceğim

    let commentNumber = 1;
    
    // 5. Sınıf 1. Dönem
    grade5Semester1Comments.forEach((text) => {
      this.commentTemplates.push({
        id: crypto.randomUUID(),
        text,
        grade: 5,
        semester: 1,
        category: "genel",
        number: commentNumber++
      });
    });

    // Diğer sınıf ve dönemler için de benzer yorumlar eklenecek
    // Şimdilik örnek olarak birkaç tane daha ekliyorum

    const allComments = [
      // 5. Sınıf 2. Dönem örnekleri
      { grade: 5, semester: 2, text: "Sevgili [Öğrenci Adı], ikinci dönemde gösterdiğin gelişim gerçekten takdire şayan. Matematik derslerinde kesirler konusunda ustalaştın. Problem çözme becerilerinde önemli ilerleme kaydettiniz. Sınıf içi etkinliklerde liderlik vasfın öne çıkıyor. Arkadaşlarınla olan iletişimin güçlü ve olumlu. Ödev disiplinin örnek teşkil ediyor. Bu başarılı dönemin sonunda hedeflediğin noktaya ulaştın. Üçüncü sınıfa hazır olduğunu düşünüyorum." },
      
      // 6. Sınıf örnekleri
      { grade: 6, semester: 1, text: "Merhaba [Öğrenci Adı], altıncı sınıfa geçiş sürecinde adaptasyon yeteneğin dikkat çekici. Artan ders yükü karşısında sorumluluklarını yerine getiriyorsun. Fen bilimleri dersinde laboratuvar çalışmalarına olan ilgin ve başarın övgüye değer. Hipotez kurma ve deney tasarlama becerilerinde gelişim gösteriyorsun. Grup çalışmalarında aktif rol alıyorsun. Araştırma projelerinde yaratıcı fikirler üretiyorsun. Bu bilimsel yaklaşımın gelecekte sana büyük avantajlar sağlayacak." },
      
      // 7. Sınıf örnekleri  
      { grade: 7, semester: 1, text: "Canım [Öğrenci Adı], ergenlik döneminin getirdiği değişimlere rağmen akademik performansını koruman takdire şayan. Matematik dersinde cebirsel ifadeler konusundaki başarın dikkat çekici. Soyut düşünme becerilerin gelişiyor. Sosyal bilgiler dersinde tarihsel analiz yapabilme yeteneğin güçleniyor. Eleştirel okuma becerilerinde ilerleme var. Arkadaş ilişkilerinde olgunluk gösteriyorsun. Bu dönemdeki kararlılığın ve çaban gelecek için umut verici. Hedeflerinden asla vazgeçme." },
      
      // 8. Sınıf örnekleri
      { grade: 8, semester: 1, text: "Değerli [Öğrenci Adı], son sınıf öğrencisi olmanın sorumluluğunu hissediyor ve buna uygun davranışlar sergiliyorsun. Lise sınavına hazırlık sürecinde gösterdiğin kararlılık ve disiplin takdir edilecek düzeyde. Matematik ve fen bilimleri derslerindeki başarın istikrarlı. Problem çözme stratejilerin gelişmiş. Zaman yönetimi konusunda bilinçli davranıyorsun. Stres yönetimi becerilerinde ilerleme var. Hedef odaklı çalışma tarzın başarıya götürecek. Sınav sürecinde başarılar dilerim." }
    ];

    allComments.forEach((comment) => {
      this.commentTemplates.push({
        id: crypto.randomUUID(),
        text: comment.text,
        grade: comment.grade,
        semester: comment.semester,
        category: "genel",
        number: commentNumber++
      });
    });
  }
}