// Template Optimizer - Convert long comments to 450-500 character optimized versions
class TemplateOptimizer {
    constructor() {
        this.targetLength = { min: 450, max: 500 };
    }

    optimizeTemplate(originalComment, title) {
        // Remove excessive words and optimize sentence structure
        let optimized = originalComment
            // Replace verbose expressions with concise ones
            .replace(/çok başarılı bir şekilde/g, 'başarıyla')
            .replace(/oldukça/g, 'çok')
            .replace(/gözlemlenmektedir/g, 'gözlemleniyor')
            .replace(/göstermektedir/g, 'gösteriyor')
            .replace(/sağlamaktadır/g, 'sağlıyor')
            .replace(/bulunmaktadır/g, 'bulunuyor')
            .replace(/yapmaktadır/g, 'yapıyor')
            .replace(/etmektedir/g, 'ediyor')
            .replace(/olmaktadır/g, 'oluyor')
            .replace(/vermektedir/g, 'veriyor')
            .replace(/almaktadır/g, 'alıyor')
            .replace(/konusunda/g, 'için')
            .replace(/açısından/g, 'yönünden')
            .replace(/bakımından/g, 'için')
            .replace(/dolayısıyla/g, 'bu yüzden')
            .replace(/bundan dolayı/g, 'bu nedenle')
            .replace(/bu sebeple/g, 'bu nedenle')
            .replace(/çok büyük/g, 'büyük')
            .replace(/oldukça yüksek/g, 'yüksek')
            .replace(/çok fazla/g, 'fazla')
            .replace(/son derece/g, 'çok')
            // Remove redundant phrases
            .replace(/bizleri mutlu ediyor.*?şayandır\./g, 'takdire şayan.')
            .replace(/eminim.*?duyuyorsunuz\./g, '')
            .replace(/bu konuda.*?katkı sağlayacaktır\./g, 'bu konuda destek önemli.')
            .replace(/birlikte.*?başarabiliriz\./g, 'birlikte başaracağız.')
            // Shorten common educational phrases
            .replace(/akademik başarısının temelini oluşturuyor/g, 'akademik başarısını destekliyor')
            .replace(/gelecekteki başarısına katkı sağlayacaktır/g, 'gelecek başarısını destekleyecek')
            .replace(/öğrenme sürecinde/g, 'öğrenmede')
            .replace(/gelişim göstermesi/g, 'gelişmesi')
            .replace(/performansını etkileyebiliyor/g, 'performansını etkiliyor')
            // Remove excessive conjunctions and transitions
            .replace(/; ayrıca,/g, ',')
            .replace(/; bunun yanı sıra,/g, ',')
            .replace(/; öte yandan,/g, ',')
            .replace(/; fakat,/g, ', ancak')
            .replace(/; lakin,/g, ', ancak')
            // Simplify complex sentences
            .replace(/bu durumun.*?gözlemlenmektedir/g, 'bu durum gözlemleniyor')
            .replace(/söz konusu.*?bahsedilebilir/g, 'bu konuda')
            // Remove redundant words
            .replace(/\s+/g, ' ')
            .trim();

        // If still too long, apply more aggressive optimization
        if (optimized.length > this.targetLength.max) {
            optimized = this.aggressiveOptimization(optimized);
        }

        // If too short, add educational value
        if (optimized.length < this.targetLength.min) {
            optimized = this.enhanceContent(optimized, title);
        }

        return optimized;
    }

    aggressiveOptimization(text) {
        return text
            // Remove detailed explanations
            .replace(/Bu özelliği.*?sağlıyor\./g, '')
            .replace(/Evde.*?olacaktır\./g, 'Evde destek önemli.')
            .replace(/Ailesi olarak.*?katkı sağlayacaktır\./g, 'Aile desteği gerekli.')
            // Combine similar sentences
            .replace(/\.\s*Bu/g, ', bu')
            .replace(/\.\s*Onun/g, ', onun')
            .replace(/\.\s*Öğrenci/g, ', öğrenci')
            // Simplify endings
            .replace(/çok değerli olacaktır\./g, 'önemli.')
            .replace(/faydalı olacaktır\./g, 'faydalı.')
            .replace(/katkı sağlayacaktır\./g, 'yardımcı olacak.')
            .trim();
    }

    enhanceContent(text, title) {
        // Add educational suggestions based on title
        const suggestions = {
            'uyum': 'Sosyal aktivitelere katılımı teşvik edilmeli.',
            'lider': 'Liderlik becerilerini geliştirme fırsatları verilmeli.',
            'sorumluluk': 'Sorumluluk alma konusunda desteklenmeye devam edilmeli.',
            'sanat': 'Sanatsal yetenekleri farklı alanlarda geliştirilmeli.',
            'spor': 'Fiziksel aktiviteler akademik dengeyle birleştirilmeli.',
            'okuma': 'Okuma alışkanlığı çeşitli türlerle desteklenmeli.',
            'gelişim': 'Kişisel gelişim programları uygulanabilir.',
            'akademik': 'Akademik hedefler net şekilde belirlenebilir.'
        };

        const lowerTitle = title.toLowerCase();
        for (let keyword in suggestions) {
            if (lowerTitle.includes(keyword) && text.length < this.targetLength.min) {
                text += ' ' + suggestions[keyword];
                break;
            }
        }

        return text;
    }

    validateLength(text) {
        return {
            length: text.length,
            isValid: text.length >= this.targetLength.min && text.length <= this.targetLength.max,
            status: text.length < this.targetLength.min ? 'too_short' : 
                   text.length > this.targetLength.max ? 'too_long' : 'optimal'
        };
    }

    batchOptimize(commentsData) {
        const optimized = {};
        let processedCount = 0;
        let optimizedCount = 0;

        for (let grade in commentsData) {
            optimized[grade] = {};
            for (let term in commentsData[grade]) {
                optimized[grade][term] = [];
                
                commentsData[grade][term].forEach(comment => {
                    processedCount++;
                    const originalLength = comment.comment.length;
                    
                    if (originalLength > this.targetLength.max || originalLength < this.targetLength.min) {
                        const optimizedComment = this.optimizeTemplate(comment.comment, comment.title);
                        optimized[grade][term].push({
                            ...comment,
                            comment: optimizedComment,
                            originalLength: originalLength,
                            optimizedLength: optimizedComment.length,
                            optimized: true
                        });
                        optimizedCount++;
                    } else {
                        optimized[grade][term].push({
                            ...comment,
                            optimized: false
                        });
                    }
                });
            }
        }

        return {
            data: optimized,
            stats: {
                total: processedCount,
                optimized: optimizedCount,
                unchanged: processedCount - optimizedCount
            }
        };
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TemplateOptimizer;
} else {
    window.TemplateOptimizer = TemplateOptimizer;
}