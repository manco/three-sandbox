module.exports = {
    "roots": [ "<rootDir>/src" ],
    "setupFiles": [ "<rootDir>/jest.setup.js" ],
    "transform": {
        "^.+\\.ts?$": "ts-jest"
    },
    "testRegex": "(/__tests__/.*|(\\.|/)(test|spec))\\.ts?$",
    "moduleFileExtensions": [ "ts", "js", "jsx", "json", "node"],
};