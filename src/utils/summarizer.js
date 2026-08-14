/**
 * Client-side NLP summarization utilities.
 * Uses TF-IDF-like scoring, keyword extraction, and sentence ranking.
 */

// Stop words for filtering
const STOP_WORDS = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'from', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do',
    'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'shall',
    'this', 'that', 'these', 'those', 'it', 'its', 'i', 'we', 'you', 'he', 'she', 'they',
    'me', 'him', 'her', 'us', 'them', 'my', 'our', 'your', 'his', 'their', 'what', 'which',
    'who', 'whom', 'when', 'where', 'why', 'how', 'not', 'no', 'nor', 'as', 'if', 'then',
    'than', 'too', 'very', 'just', 'about', 'above', 'after', 'again', 'all', 'also',
    'am', 'any', 'because', 'before', 'between', 'both', 'each', 'few', 'further',
    'here', 'into', 'more', 'most', 'other', 'out', 'over', 'own', 'same', 'so', 'some',
    'such', 'through', 'under', 'until', 'up', 'while', 'during', 'only', 'once', 's', 't'
]);

const METHOD_KEYWORDS = [
    'experiment', 'survey', 'simulation', 'case study', 'interview', 'regression',
    'classification', 'clustering', 'deep learning', 'machine learning', 'neural network',
    'cnn', 'rnn', 'transformer', 'bert', 'gpt', 'attention', 'reinforcement learning',
    'supervised', 'unsupervised', 'semi-supervised', 'cross-validation', 'ablation',
    'benchmark', 'dataset', 'evaluation', 'metric', 'precision', 'recall', 'f1',
    'accuracy', 'loss', 'optimization', 'gradient', 'backpropagation', 'fine-tuning',
    'transfer learning', 'pre-training', 'embedding', 'feature extraction',
    'random forest', 'svm', 'support vector', 'decision tree', 'ensemble',
    'meta-analysis', 'systematic review', 'qualitative', 'quantitative', 'mixed methods'
];

/**
 * Tokenize text into words.
 */
function tokenize(text) {
    return text.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 2 && !STOP_WORDS.has(w));
}

/**
 * Compute word frequencies from an array of tokens.
 */
function wordFrequency(tokens) {
    const freq = {};
    tokens.forEach(t => { freq[t] = (freq[t] || 0) + 1; });
    return freq;
}

/**
 * Extract top keywords using TF-IDF-like scoring across multiple documents.
 */
export function extractKeywords(texts, topN = 15) {
    const allFreqs = texts.map(t => wordFrequency(tokenize(t)));
    const df = {};
    allFreqs.forEach(freq => {
        Object.keys(freq).forEach(word => {
            df[word] = (df[word] || 0) + 1;
        });
    });

    const tfidf = {};
    const totalDocs = texts.length || 1;
    allFreqs.forEach(freq => {
        Object.entries(freq).forEach(([word, tf]) => {
            const idf = Math.log(totalDocs / (df[word] || 1)) + 1;
            tfidf[word] = (tfidf[word] || 0) + tf * idf;
        });
    });

    return Object.entries(tfidf)
        .sort((a, b) => b[1] - a[1])
        .slice(0, topN)
        .map(([word, score]) => ({ word, score: Math.round(score * 100) / 100 }));
}

/**
 * Split text into sentences.
 */
function splitSentences(text) {
    return text
        .replace(/([.!?])\s+/g, '$1|')
        .split('|')
        .map(s => s.trim())
        .filter(s => s.length > 20);
}

/**
 * Rank sentences by importance based on keyword overlap.
 */
function rankSentences(sentences, keywords) {
    const keywordSet = new Set(keywords.map(k => k.word));
    return sentences.map((sentence, idx) => {
        const tokens = tokenize(sentence);
        const overlap = tokens.filter(t => keywordSet.has(t)).length;
        const positionScore = idx < 3 ? 1.5 : (idx < 6 ? 1.2 : 1.0);
        const lengthPenalty = tokens.length > 40 ? 0.8 : 1.0;
        return {
            sentence,
            score: overlap * positionScore * lengthPenalty,
            index: idx
        };
    }).sort((a, b) => b.score - a.score);
}

/**
 * Detect methods mentioned in text.
 */
export function detectMethods(text) {
    const lower = text.toLowerCase();
    return METHOD_KEYWORDS.filter(m => lower.includes(m));
}

/**
 * Generate a structured summary from a set of papers.
 */
export function generateSummary(papers) {
    if (!papers.length) return null;

    const abstracts = papers.map(p => p.abstract || '').filter(Boolean);
    if (!abstracts.length) {
        return {
            overview: 'No abstracts available for summarization.',
            keywords: [],
            methods: [],
            keySentences: [],
            stats: {
                totalPapers: papers.length, yearRange: '', avgCitations: 0, fieldsOfStudy: []
            }
        };
    }

    const combinedText = abstracts.join(' ');
    const keywords = extractKeywords(abstracts);
    const sentences = abstracts.flatMap(splitSentences);
    const rankedSentences = rankSentences(sentences, keywords);
    const keySentences = rankedSentences.slice(0, Math.min(5, sentences.length));

    const methods = detectMethods(combinedText);

    const years = papers.map(p => p.year).filter(Boolean).sort();
    const yearRange = years.length ? `${years[0]} - ${years[years.length - 1]}` : 'N/A';
    const avgCitations = papers.reduce((sum, p) => sum + (p.citationCount || 0), 0) / papers.length;

    const allFields = new Set();
    papers.forEach(p => {
        (p.fieldsOfStudy || []).forEach(f => allFields.add(f));
    });

    const overview = keySentences
        .sort((a, b) => a.index - b.index)
        .slice(0, 3)
        .map(s => s.sentence)
        .join(' ');

    return {
        overview,
        keywords,
        methods,
        keySentences: keySentences.map(s => s.sentence),
        stats: {
            totalPapers: papers.length,
            yearRange,
            avgCitations: Math.round(avgCitations),
            fieldsOfStudy: [...allFields]
        }
    };
}
