export class PolicyChecker {
    static check(title, description, topic) {
        const warnings = [];
        const all = (title + ' ' + description + ' ' + topic).toLowerCase();
        const trademarks = ['coca cola', 'nike', 'apple', 'google', 'microsoft', 'samsung', 'amazon', 'disney', 'marvel', 'netflix'];
        for (const tm of trademarks) {
            if (all.includes(tm))
                warnings.push({ type: 'trademark', severity: 'info', description: `Mentions trademark "${tm}"`, recommendation: 'Ensure fair use — avoid implying endorsement', platform: 'all' });
        }
        if (/guaranteed|100%|proven cure|get rich|earn \$\d+k/i.test(all))
            warnings.push({ type: 'misleading', severity: 'warning', description: 'Potentially misleading claim detected', recommendation: 'Add disclaimer or rephrase', platform: 'all' });
        if (/medical advice|cure|treatment|diagnos/i.test(all))
            warnings.push({ type: 'unsafe_claim', severity: 'warning', description: 'Health-related claim detected', recommendation: 'Add "consult a professional" disclaimer', platform: 'all' });
        if (/copyright|copyrighted|all rights reserved/i.test(all))
            warnings.push({ type: 'copyright', severity: 'info', description: 'Copyright reference detected', recommendation: 'Ensure all content is original or properly licensed', platform: 'all' });
        if (title.toUpperCase() === title && title.length > 10)
            warnings.push({ type: 'guideline_risk', severity: 'info', description: 'ALL CAPS title may reduce reach', recommendation: 'Use Title Case for better performance', platform: 'youtube' });
        return warnings;
    }
}
//# sourceMappingURL=policy-checker.js.map