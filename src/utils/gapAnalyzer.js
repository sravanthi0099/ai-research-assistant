/**
 * Research gap analysis engine.
 * Identifies topical, methodological, temporal, and empirical gaps.
 */

import { extractKeywords } from './summarizer';

/**
 * Analyze topic frequency across papers.
 */
export function analyzeTopicFrequency(papers) {
    const abstracts = papers.map(p => p.abstract || '').filter(Boolean);
    if (!abstracts.length) return [];

    const keywords = extractKeywords(abstracts, 25);
    const maxScore = keywords[0]?.score || 1;

    return keywords.map(k => ({
        topic: k.word,
        frequency: k.score,
        percentage: Math.round((k.score / maxScore) * 100),
        papers: papers.filter(p => {
            const text = ((p.abstract || '') + ' ' + (p.title || '')).toLowerCase();
            return text.includes(k.word);
        }).length
    }));
}

/**
 * Identify temporal trends and gaps.
 */
function analyzeTemporalGaps(papers) {
    const gaps = [];
    const years = papers.map(p => p.year).filter(Boolean).sort();

    if (years.length < 2) return gaps;

    const minYear = years[0];
    const maxYear = years[years.length - 1];

    // Find years with no papers
    const yearCounts = {};
    years.forEach(y => { yearCounts[y] = (yearCounts[y] || 0) + 1; });

    for (let y = minYear; y <= maxYear; y++) {
        if (!yearCounts[y]) {
            gaps.push({
                type: 'temporal',
                title: `No publications found in ${y}`,
                description: `There appears to be a gap in research output during ${y}. This may represent an interruption in research continuity or a period where the field's focus shifted elsewhere.`,
                severity: 'medium',
                year: y
            });
        }
    }

    // Recent research declining?
    const currentYear = new Date().getFullYear();
    if (maxYear < currentYear - 2) {
        gaps.push({
            type: 'temporal',
            title: 'Limited recent research',
            description: `The most recent paper in the collection is from ${maxYear}. This suggests potential for new research to update and extend existing findings with more recent data and methods.`,
            severity: 'high'
        });
    }

    return gaps;
}

/**
 * Identify methodological gaps.
 */
function analyzeMethodologicalGaps(papers) {
    const gaps = [];
    const text = papers.map(p => p.abstract || '').join(' ').toLowerCase();

    const methodCategories = {
        'Quantitative Methods': ['regression', 'statistical', 'correlation', 'anova', 'chi-square', 'hypothesis testing'],
        'Qualitative Methods': ['interview', 'ethnography', 'grounded theory', 'thematic analysis', 'case study', 'phenomenology'],
        'Machine Learning': ['neural network', 'deep learning', 'machine learning', 'classification', 'clustering', 'random forest'],
        'Formal Methods': ['proof', 'theorem', 'formal verification', 'model checking', 'specification'],
        'Simulation': ['simulation', 'monte carlo', 'agent-based', 'discrete event'],
        'Survey/Meta-Analysis': ['survey', 'meta-analysis', 'systematic review', 'literature review', 'meta study']
    };

    const presentMethods = {};
    const absentMethods = {};

    Object.entries(methodCategories).forEach(([category, keywords]) => {
        const found = keywords.some(k => text.includes(k));
        if (found) {
            presentMethods[category] = true;
        } else {
            absentMethods[category] = keywords;
        }
    });

    Object.keys(absentMethods).forEach(category => {
        gaps.push({
            type: 'methodological',
            title: `${category} not represented`,
            description: `None of the reviewed papers appear to employ ${category.toLowerCase()}. Applying these approaches could provide new perspectives and strengthen the evidence base.`,
            severity: 'medium'
        });
    });

    // Check for single-method dominance
    const presentList = Object.keys(presentMethods);
    if (presentList.length === 1) {
        gaps.push({
            type: 'methodological',
            title: 'Limited methodological diversity',
            description: `The reviewed papers primarily use ${presentList[0]}. A mixed-methods approach combining different research methodologies could yield more comprehensive insights.`,
            severity: 'high'
        });
    }

    return gaps;
}

/**
 * Identify topical gaps.
 */
function analyzeTopicalGaps(papers) {
    const gaps = [];
    const topics = analyzeTopicFrequency(papers);

    if (topics.length < 3) return gaps;

    // Find topics with low coverage
    const avgFreq = topics.reduce((s, t) => s + t.papers, 0) / topics.length;
    const underExplored = topics.filter(t => t.papers <= Math.ceil(avgFreq * 0.3) && t.papers >= 1);

    underExplored.slice(0, 3).forEach(topic => {
        gaps.push({
            type: 'topical',
            title: `Under-explored: "${topic.topic}"`,
            description: `The topic "${topic.topic}" appears in only ${topic.papers} paper(s) but is mentioned in the research area. This represents an opportunity for deeper investigation.`,
            severity: topic.papers === 1 ? 'high' : 'medium'
        });
    });

    // Check field diversity
    const fields = new Set();
    papers.forEach(p => (p.fieldsOfStudy || []).forEach(f => fields.add(f)));

    if (fields.size === 1) {
        gaps.push({
            type: 'topical',
            title: 'Single-discipline focus',
            description: `All papers are from the field of ${[...fields][0]}. Interdisciplinary approaches combining insights from other fields could reveal new research opportunities.`,
            severity: 'medium'
        });
    }

    return gaps;
}

/**
 * Identify empirical gaps.
 */
function analyzeEmpiricalGaps(papers) {
    const gaps = [];
    const text = papers.map(p => p.abstract || '').join(' ').toLowerCase();

    // Check for lack of real-world validation
    const realWorldKeywords = ['real-world', 'production', 'deployed', 'clinical trial', 'field study', 'industry', 'practice'];
    const hasRealWorld = realWorldKeywords.some(k => text.includes(k));

    if (!hasRealWorld && papers.length >= 3) {
        gaps.push({
            type: 'empirical',
            title: 'Limited real-world validation',
            description: 'The reviewed papers appear to lack real-world validation or deployment studies. Research that bridges the gap between theoretical findings and practical application would be valuable.',
            severity: 'high'
        });
    }

    // Check for reproducibility indicators
    const reproducibilityKeywords = ['open source', 'reproducible', 'replication', 'dataset available', 'code available'];
    const hasReproducibility = reproducibilityKeywords.some(k => text.includes(k));

    if (!hasReproducibility && papers.length >= 3) {
        gaps.push({
            type: 'empirical',
            title: 'Reproducibility concerns',
            description: 'Few or no papers mention open-source code, available datasets, or replication studies. There is an opportunity for research focused on reproducibility and open science practices.',
            severity: 'medium'
        });
    }

    // Check for sample size diversity
    const scaleKeywords = ['large-scale', 'large scale', 'million', 'billion', 'massive'];
    const smallKeywords = ['small sample', 'limited sample', 'case study', 'pilot study'];
    const hasLarge = scaleKeywords.some(k => text.includes(k));
    const hasSmall = smallKeywords.some(k => text.includes(k));

    if (hasSmall && !hasLarge) {
        gaps.push({
            type: 'empirical',
            title: 'Scale validation needed',
            description: 'Current research primarily involves small-scale or pilot studies. Large-scale validation would strengthen the generalizability of findings.',
            severity: 'medium'
        });
    }

    return gaps;
}

/**
 * Generate future research suggestions based on identified gaps.
 */
function generateSuggestions(gaps, papers) {
    const suggestions = [];

    const topicalGaps = gaps.filter(g => g.type === 'topical');
    const methodGaps = gaps.filter(g => g.type === 'methodological');
    const temporalGaps = gaps.filter(g => g.type === 'temporal');
    const empiricalGaps = gaps.filter(g => g.type === 'empirical');

    if (topicalGaps.length > 0) {
        suggestions.push({
            title: 'Expand topical coverage',
            description: `Investigate under-explored aspects such as ${topicalGaps.map(g => g.title.replace('Under-explored: ', '').replace(/"/g, '')).join(', ')}. These areas have limited coverage in the current literature.`,
            priority: 'high'
        });
    }

    if (methodGaps.length > 0) {
        suggestions.push({
            title: 'Diversify methodological approaches',
            description: `Consider applying ${methodGaps.map(g => g.title.replace(' not represented', '')).slice(0, 2).join(' and ')} to provide complementary evidence and new perspectives.`,
            priority: 'high'
        });
    }

    if (temporalGaps.length > 0) {
        suggestions.push({
            title: 'Update with recent research',
            description: 'Conduct new studies that build upon earlier findings with current data, technologies, and methodologies to ensure the field remains relevant.',
            priority: 'medium'
        });
    }

    if (empiricalGaps.length > 0) {
        suggestions.push({
            title: 'Strengthen empirical evidence',
            description: 'Focus on real-world validation, large-scale studies, and reproducible research to bridge the gap between theory and practice.',
            priority: 'high'
        });
    }

    // Cross-pollination suggestion
    const fields = new Set();
    papers.forEach(p => (p.fieldsOfStudy || []).forEach(f => fields.add(f)));
    if (fields.size > 0) {
        suggestions.push({
            title: 'Cross-disciplinary collaboration',
            description: `The current work is primarily in ${[...fields].slice(0, 2).join(' and ')}. Collaborating across disciplines could bring fresh insights and methodologies.`,
            priority: 'medium'
        });
    }

    return suggestions;
}

/**
 * Perform complete gap analysis on a set of papers.
 */
export function performGapAnalysis(papers) {
    if (!papers.length) return null;

    const topicalGaps = analyzeTopicalGaps(papers);
    const methodGaps = analyzeMethodologicalGaps(papers);
    const temporalGaps = analyzeTemporalGaps(papers);
    const empiricalGaps = analyzeEmpiricalGaps(papers);

    const allGaps = [...topicalGaps, ...methodGaps, ...temporalGaps, ...empiricalGaps];
    allGaps.sort((a, b) => {
        const severityOrder = { high: 0, medium: 1, low: 2 };
        return (severityOrder[a.severity] || 1) - (severityOrder[b.severity] || 1);
    });

    const suggestions = generateSuggestions(allGaps, papers);
    const topicFrequency = analyzeTopicFrequency(papers);

    return {
        gaps: allGaps,
        suggestions,
        topicFrequency,
        summary: {
            totalGaps: allGaps.length,
            highSeverity: allGaps.filter(g => g.severity === 'high').length,
            mediumSeverity: allGaps.filter(g => g.severity === 'medium').length,
            gapTypes: {
                topical: topicalGaps.length,
                methodological: methodGaps.length,
                temporal: temporalGaps.length,
                empirical: empiricalGaps.length
            }
        }
    };
}
