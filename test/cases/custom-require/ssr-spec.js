module.exports = {
    enabled: {
        jssrc: true,
        comsrc: false,
        comrdr: false
    },
    context: {
        customRequirePath (path) {
            if (path.endsWith('childA.san.js')) {
                return path.replace('childA', 'childB')
            }
        }
    }
}
