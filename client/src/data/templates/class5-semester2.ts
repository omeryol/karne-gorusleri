import { Template } from "@shared/schema";

export const class5Semester2Templates: Template[] = [
  // Olumlu Yorumlar
  {
    id: "5-2-pos-1",
    text: "{name} ikinci dönemde matematik dersinde büyük ilerleme kaydetti. Çarpma ve bölme işlemlerini başarıyla yapıyor.",
    tone: "positive",
    tags: ["matematik", "ilerleme", "çarpma", "bölme", "başarılı"],
    category: "matematik"
  },
  {
    id: "5-2-pos-2",
    text: "{name} Türkçe yazma becerilerinde çok gelişti. Hikaye yazma etkinliklerinde yaratıcı fikirler ortaya koyuyor.",
    tone: "positive",
    tags: ["türkçe", "yazma", "hikaye", "yaratıcı"],
    category: "türkçe"
  },
  {
    id: "5-2-pos-3",
    text: "{name} fen bilgisi dersinde bitki ve hayvan konularında çok bilgili. Doğa gözlemleri yapıyor.",
    tone: "positive",
    tags: ["fen-bilgisi", "bitki-hayvan", "doğa-gözlemi", "bilgili"],
    category: "fen"
  },
  {
    id: "5-2-pos-4",
    text: "{name} sosyal bilgiler dersinde ülkemiz konularında başarılı. Harita çalışmalarını seviyor.",
    tone: "positive",
    tags: ["sosyal-bilgiler", "ülkemiz", "harita", "başarılı"],
    category: "sosyal"
  },
  // Nötr Yorumlar
  {
    id: "5-2-neu-1",
    text: "{name} matematik dersinde kesirler konusunda zorlanıyor. Daha fazla alıştırma yapması gerekiyor.",
    tone: "neutral",
    tags: ["matematik", "kesirler", "alıştırma", "zorluk"],
    category: "matematik"
  },
  {
    id: "5-2-neu-2",
    text: "{name} Türkçe dersinde noktalama işaretlerini öğreniyor. Dikkatli olması gerekiyor.",
    tone: "neutral",
    tags: ["türkçe", "noktalama", "dikkat", "öğrenme"],
    category: "türkçe"
  },
  {
    id: "5-2-neu-3",
    text: "{name} fen bilgisi dersinde madde konularında orta seviyede. Deneylere katılmalı.",
    tone: "neutral",
    tags: ["fen-bilgisi", "madde", "orta-seviye", "deney-katılımı"],
    category: "fen"
  },
  // Olumsuz Yorumlar
  {
    id: "5-2-neg-1",
    text: "{name} matematik dersinde problem çözme konusunda güçlük çekiyor. Ek çalışma yapması şart.",
    tone: "negative",
    tags: ["matematik", "problem-çözme", "güçlük", "ek-çalışma"],
    category: "matematik"
  },
  {
    id: "5-2-neg-2",
    text: "{name} Türkçe dersinde yazım hatalarını tekrarlıyor. Daha dikkatli yazması gerekiyor.",
    tone: "negative",
    tags: ["türkçe", "yazım-hatası", "tekrar", "dikkat"],
    category: "türkçe"
  },
  {
    id: "5-2-neg-3",
    text: "{name} fen bilgisi dersinde derse katılım az. Daha aktif olması gerekiyor.",
    tone: "negative",
    tags: ["fen-bilgisi", "katılım-az", "aktiflik"],
    category: "fen"
  }
];