import { Template } from "@shared/schema";

export const class5Semester1Templates: Template[] = [
  // Olumlu Yorumlar
  {
    id: "5-1-pos-1",
    text: "{name} bu dönem matematik dersinde çok başarılı. Sayılarla işlemleri hızlı ve doğru yapıyor. Ders çalışma alışkanlığı gelişmiş durumda.",
    tone: "positive",
    tags: ["matematik", "başarılı", "sayı-işlemleri", "çalışma-alışkanlığı"],
    category: "matematik"
  },
  {
    id: "5-1-pos-2",
    text: "{name} Türkçe derslerinde okuma becerisi çok gelişti. Metinleri anlayarak okuyor ve sorulara doğru cevaplar veriyor.",
    tone: "positive",
    tags: ["türkçe", "okuma", "anlama", "başarılı"],
    category: "türkçe"
  },
  {
    id: "5-1-pos-3",
    text: "{name} fen bilgisi dersinde çok meraklı ve aktif. Deneylere katılım gösteriyor ve sorular soruyor.",
    tone: "positive",
    tags: ["fen-bilgisi", "meraklı", "aktif-katılım", "deneyler"],
    category: "fen"
  },
  {
    id: "5-1-pos-4",
    text: "{name} sosyal bilgiler dersinde tarih konularına ilgi gösteriyor. Araştırma ödevlerini özenle hazırlıyor.",
    tone: "positive",
    tags: ["sosyal-bilgiler", "tarih", "araştırma", "özenli"],
    category: "sosyal"
  },
  // Nötr Yorumlar
  {
    id: "5-1-neu-1",
    text: "{name} matematik dersinde normal seviyede performans gösteriyor. Biraz daha pratik yapması faydalı olacaktır.",
    tone: "neutral",
    tags: ["matematik", "normal-performans", "pratik-ihtiyacı"],
    category: "matematik"
  },
  {
    id: "5-1-neu-2",
    text: "{name} Türkçe derslerinde orta seviyede başarı gösteriyor. Yazım kurallarına daha çok dikkat etmesi gerekiyor.",
    tone: "neutral",
    tags: ["türkçe", "orta-seviye", "yazım-kuralları"],
    category: "türkçe"
  },
  {
    id: "5-1-neu-3",
    text: "{name} fen bilgisi dersinde konuları anlıyor ancak daha aktif katılım gösterebilir.",
    tone: "neutral",
    tags: ["fen-bilgisi", "anlama", "katılım-artırma"],
    category: "fen"
  },
  // Olumsuz Yorumlar
  {
    id: "5-1-neg-1",
    text: "{name} matematik dersinde zorlanıyor. Temel işlemlerde daha fazla çalışma yapması gerekiyor.",
    tone: "negative",
    tags: ["matematik", "zorluk", "temel-işlemler", "çalışma-ihtiyacı"],
    category: "matematik"
  },
  {
    id: "5-1-neg-2",
    text: "{name} Türkçe dersinde okuma hızı yavaş. Düzenli okuma alışkanlığı geliştirmesi önemli.",
    tone: "negative",
    tags: ["türkçe", "okuma-hızı", "alışkanlık-geliştirme"],
    category: "türkçe"
  },
  {
    id: "5-1-neg-3",
    text: "{name} fen bilgisi dersinde dikkati dağınık. Dersi daha dikkatli takip etmesi gerekiyor.",
    tone: "negative",
    tags: ["fen-bilgisi", "dikkat-dağınıklığı", "takip-sorunu"],
    category: "fen"
  }
];