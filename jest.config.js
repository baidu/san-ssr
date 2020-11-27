module.exports = {
    roots: [
        '<rootDir>/test'
    ],
    testMatch: [
        '<rootDir>/test/unit/**/*.ts',
        '<rootDir>/test/e2e.spec.ts'
    ],
    transform: {
        '^.+\\.ts$': 'babel-jest'
    },
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/fixtures/**'
    ],
    globals: {
        tsConfig: {
            skipLibCheck: true,
            skipDefaultLibCheck: true
        }
    }
}
