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
    globals: {
        tsConfig: {
            skipLibCheck: true,
            skipDefaultLibCheck: true
        }
    }
}