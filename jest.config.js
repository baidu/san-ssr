module.exports = {
    roots: [
        '<rootDir>/test'
    ],
    testMatch: [
        '<rootDir>/test/unit/**/*.ts',
        '<rootDir>/test/integration.spec.ts'
    ],
    transform: {
        '^.+\\.ts$': 'babel-jest'
    },
    collectCoverageFrom: [
        'src/**/*.ts'
    ],
    globals: {
        tsConfig: {
            skipLibCheck: true,
            skipDefaultLibCheck: true
        }
    }
}