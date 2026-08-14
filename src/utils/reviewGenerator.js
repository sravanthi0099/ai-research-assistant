/**
 * Literature review generator.
 * Organizes papers by themes, generates narrative text, formats citations.
 */

import { extractKeywords, detectMethods } from './summarizer';

/**
 * Format authors for citation.
 */
function formatAuthors(authors, style = 'apa') {
    if (!authors || !authors.length) return 'Unknown';

    if (style === 'apa') {
        if (authors.length === 1) return authors[0].name || 'Unknown';
        if (authors.length === 2) return `${authors[0].name} & ${authors[1].name}`;
        return `${authors[0].name} et al.`;
    }

    if (style === 'mla') {
        if (authors.length === 1) return authors[0].name || 'Unknown';
        if (authors.length === 2) return `${authors[0].name} and ${authors[1].name}`;
        return `${authors[0].name}, et al.`;
    }

    if (style === 'chicago') {
        if (authors.length === 1) return authors[0].name || 'Unknown';
        return authors.map(a => a.name).join(', ');
    }

    return authors[0].name || 'Unknown';
}

/**
 * Generate a formatted citation string.
 */
export function formatCitation(paper, style = 'apa') {
    const authors = formatAuthors(paper.authors, style);
    const year = paper.year || 'n.d.';
    const title = paper.title || 'Untitled';
    const venue = paper.venue || '';

    if (style === 'apa') {
        return `${authors} (${year}). ${title}.${venue ? ` ${venue}.` : ''}`;
    }

    if (style === 'mla') {
        return `${authors}. "${title}."${venue ? ` ${venue},` : ''} ${year}.`;
    }

    if (style === 'chicago') {
        return `${authors}. "${title}."${venue ? ` ${venue}` : ''} (${year}).`;
    }

    return `${authors} (${year}). ${title}.`;
}

/**
 * Group papers into themes based on keyword clustering.
 */
export function groupByThemes(papers) {
    if (!papers.length) return [];

    const abstracts = papers.map(p => p.abstract || '').filter(Boolean);
    const keywords = extractKeywords(abstracts, 20);

    // Create theme clusters
    const themes = [];
    const assigned = new Set();

    keywords.forEach(keyword => {
        if (assigned.has(keyword.word)) return;

        const themePapers = papers.filter(p => {
            const text = ((p.abstract || '') + ' ' + (p.title || '')).toLowerCase();
            return text.includes(keyword.word);
        });

        if (themePapers.length >= 1) {
            const themeTitle = keyword.word.charAt(0).toUpperCase() + keyword.word.slice(1);
            themes.push({
                title: themeTitle,
                keyword: keyword.word,
                papers: themePapers,
                score: keyword.score
            });
            assigned.add(keyword.word);
        }
    });

    // Remove duplicates - keep each paper in its highest-scoring theme only
    const paperThemeMap = new Map();
    themes.forEach(theme => {
        theme.papers.forEach(paper => {
            if (!paperThemeMap.has(paper.paperId) || theme.score > paperThemeMap.get(paper.paperId).score) {
                paperThemeMap.set(paper.paperId, theme);
            }
        });
    });

    // Rebuild themes with deduplicated papers
    const finalThemes = themes.map(theme => ({
        ...theme,
        papers: theme.papers.filter(p => paperThemeMap.get(p.paperId) === theme)
    })).filter(t => t.papers.length > 0);

    // Add uncategorized papers
    const allAssigned = new Set();
    finalThemes.forEach(t => t.papers.forEach(p => allAssigned.add(p.paperId)));
    const uncategorized = papers.filter(p => !allAssigned.has(p.paperId));

    if (uncategorized.length > 0) {
        finalThemes.push({
            title: 'Other Related Work',
            keyword: 'other',
            papers: uncategorized,
            score: 0
        });
    }

    return finalThemes.sort((a, b) => b.papers.length - a.papers.length);
}

/**
 * Generate narrative paragraph for a theme group.
 */
function generateThemeNarrative(theme, citationStyle) {
    const papers = theme.papers;
    if (!papers.length) return '';

    let narrative = '';

    if (papers.length === 1) {
        const p = papers[0];
        const citation = formatAuthors(p.authors, citationStyle);
        narrative = `In the area of ${theme.title.toLowerCase()}, ${citation} (${p.year || 'n.d.'}) `;
        if (p.abstract) {
            const firstSentence = p.abstract.split(/[.!?]/)[0];
            narrative += firstSentence.toLowerCase().startsWith('we') || firstSentence.toLowerCase().startsWith('this')
                ? `present work that ${firstSentence.substring(firstSentence.indexOf(' ') + 1).toLowerCase()}.`
                : `investigate ${firstSentence.toLowerCase()}.`;
        } else {
            narrative += `contribute to the understanding of ${theme.title.toLowerCase()}.`;
        }
    } else {
        narrative = `Research on ${theme.title.toLowerCase()} has received significant attention. `;

        papers.forEach((p, idx) => {
            const citation = formatAuthors(p.authors, citationStyle);
            if (idx === 0) {
                narrative += `${citation} (${p.year || 'n.d.'}) `;
                if (p.abstract) {
                    const clean = p.abstract.split(/[.!?]/)[0];
                    narrative += `explore ${clean.toLowerCase()}. `;
                } else {
                    narrative += `provide foundational work in this area. `;
                }
            } else if (idx === papers.length - 1) {
                narrative += `Additionally, ${citation} (${p.year || 'n.d.'}) extend this line of research`;
                if (p.citationCount > 50) {
                    narrative += `, with their highly cited work (${p.citationCount} citations)`;
                }
                narrative += '. ';
            } else {
                narrative += `Building on this, ${citation} (${p.year || 'n.d.'}) further contribute to the field. `;
            }
        });
    }

    return narrative;
}

/**
 * Generate a complete literature review from papers.
 */
export function generateLiteratureReview(papers, citationStyle = 'apa') {
    if (!papers.length) return null;

    const themes = groupByThemes(papers);
    const allMethods = detectMethods(papers.map(p => p.abstract || '').join(' '));

    // Introduction
    const years = papers.map(p => p.year).filter(Boolean).sort();
    const yearRange = years.length ? `${years[0]} to ${years[years.length - 1]}` : 'various years';
    const fields = new Set();
    papers.forEach(p => (p.fieldsOfStudy || []).forEach(f => fields.add(f)));

    let introduction = `This literature review synthesizes findings from ${papers.length} academic papers published between ${yearRange}`;
    if (fields.size > 0) {
        introduction += `, spanning the fields of ${[...fields].slice(0, 3).join(', ')}`;
    }
    introduction += '. ';
    introduction += `The reviewed works collectively have received ${papers.reduce((s, p) => s + (p.citationCount || 0), 0)} citations, indicating the significance of this research area.`;

    // Themed sections
    const sections = themes.map(theme => ({
        title: theme.title,
        narrative: generateThemeNarrative(theme, citationStyle),
        papers: theme.papers
    }));

    // Methodology overview
    let methodology = '';
    if (allMethods.length > 0) {
        methodology = `The reviewed papers employ various methodological approaches including ${allMethods.slice(0, 5).join(', ')}. `;
        methodology += `This diversity of methods suggests a mature research area with multiple analytical perspectives.`;
    }

    // References
    const references = papers.map((p, i) => ({
        number: i + 1,
        citation: formatCitation(p, citationStyle)
    }));

    return {
        introduction,
        sections,
        methodology,
        references,
        themes,
        stats: {
            totalPapers: papers.length,
            totalCitations: papers.reduce((s, p) => s + (p.citationCount || 0), 0),
            yearRange,
            themeCount: themes.length,
            methodCount: allMethods.length
        }
    };
}
