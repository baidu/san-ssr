module.exports = {
    'roots': [
        '<rootDir>/src',
        '<rootDir>/test'
    ],
    'testMatch': [
        '<rootDir>/test/unit/**.ts',
        '<rootDir>/test/integration.spec.ts'
    ],
    'transform': {
        '^.+\\.tsx?$': 'ts-jest'
    }
}