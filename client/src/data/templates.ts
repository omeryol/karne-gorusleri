import { Template } from "@shared/schema";

export const defaultTemplates: Template[] = [
  {
    id: "1",
    text: "Bu dönem matematik dersinde oldukça başarılı bir performans sergiledi. Ödevlerini düzenli olarak yapıyor ve sınıf içi etkinliklere aktif katılım gösteriyor.",
    tone: "positive",
    tags: ["matematik", "başarılı", "aktif-katılım", "ödev-düzenli"],
    category: "matematik"
  },
  {
    id: "2",
    text: "Ders boyunca dikkatli ve anlayışlı bir öğrenci. Problem çözme becerilerini geliştirmek için daha fazla pratik yapması faydalı olacaktır.",
    tone: "neutral",
    tags: ["dikkatli", "problem-çözme", "pratik"],
    category: "matematik"
  },
  {
    id: "3",
    text: "Bu dönem matematik dersinde beklenen performansı gösteremedi. Ödev yapma konusunda daha düzenli olması ve ders çalışma alışkanlığı geliştirmesi gerekiyor.",
    tone: "negative",
    tags: ["ödev", "çalışma-alışkanlığı", "performans"],
    category: "matematik"
  },
  {
    id: "4",
    text: "Türkçe derslerinde yaratıcı yazılar kaleme alıyor. Okuma alışkanlığı gelişmiş ve sınıf tartışmalarına değerli katkılar sağlıyor.",
    tone: "positive",
    tags: ["türkçe", "yaratıcı", "okuma", "tartışma"],
    category: "türkçe"
  },
  {
    id: "5",
    text: "Fen bilgisi derslerinde meraklı ve araştırmacı bir yaklaşım sergiliyor. Deney süreçlerinde dikkatli ve sorumluluk sahibi.",
    tone: "positive",
    tags: ["fen-bilgisi", "meraklı", "araştırmacı", "deney", "sorumluluk"],
    category: "fen"
  }
];
