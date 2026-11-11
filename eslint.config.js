export default [
    {
        files: ["**/*.js"],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "module",
            globals: {
                document: "readonly",
                window: "readonly",
                console: "readonly",
                Image: "readonly",
                performance: "readonly",
                requestAnimationFrame: "readonly",
                AudioContext: "readonly",
                fetch: "readonly",
            },
        },
        rules: {
            "no-undef": "error",
            "no-unused-vars": "warn",
            "no-const-assign": "error",
            "no-dupe-class-members": "error",
            "no-unreachable": "warn",
            eqeqeq: "warn",
        },
    },
];
