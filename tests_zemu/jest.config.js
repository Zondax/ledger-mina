// ESM-only dependencies that must be transpiled to CommonJS before Jest
// can require() them. `get-port` went ESM-only in v6; @zondax/zemu still
// require()s it. Add more names here if another transitive dep ships ESM.
const esmDeps = ['get-port']

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
    '^.+\\.m?js$': [
      'ts-jest',
      {
        useESM: false,
        isolatedModules: true,
        tsconfig: {
          allowJs: true,
          esModuleInterop: true,
          module: 'CommonJS',
          target: 'ES2020',
        },
      },
    ],
  },
  transformIgnorePatterns: [`/node_modules/(?!(${esmDeps.join('|')})/)`],
  reporters: ['default', ['summary', { summaryThreshold: 1 }]],
  globalSetup: './globalsetup.js',
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
}
