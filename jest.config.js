module.exports = {
    "roots": [ "<rootDir>/src" ],
    "setupFiles": [ "<rootDir>/jest.setup.js" ],
    "transform": {
        "^.+\\.ts?$": "ts-jest"
    },
    "testRegex": "(/__tests__/.+(Test))\\.ts?$",
    "moduleFileExtensions": [ "ts", "js", "jsx", "json", "node"],
    globals: {
        'ts-jest': {
            tsConfig: 'tsconfig.json'
        }
    }
};