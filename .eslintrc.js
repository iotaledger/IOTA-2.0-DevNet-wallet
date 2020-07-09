const defaultRules = [
    'react-app',
    'eslint:recommended'
];

module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: __dirname,
        ecmaFeatures: {
            jsx: true,
        }
    },
    env: {
        browser: true,
        node: true,
        es6: true,
        jest: true
    },
    extends: defaultRules,
    overrides: [
        {
            files: ['**/*.ts', '**/*.tsx'],
            plugins: ['@typescript-eslint'],
            extends: [
                ...defaultRules,
                'plugin:@typescript-eslint/recommended',
                'plugin:@typescript-eslint/eslint-recommended',
                'plugin:react/recommended'
            ],
            rules: {
                'comma-dangle': ['error', 'never'],
                'eqeqeq': 'error',
                'brace-style': 'off',
                'no-loop-func': 'off',
                '@typescript-eslint/brace-style': [
                    'error',
                    '1tbs',
                    {
                        'allowSingleLine': false
                    }
                ],
                '@typescript-eslint/no-inferrable-types': 0,
                '@typescript-eslint/quotes': ['error', 'double', { 'avoidEscape': true }],
                '@typescript-eslint/space-before-function-paren': 0,
                '@typescript-eslint/semi': 1,
                '@typescript-eslint/no-magic-numbers': 0,
                '@typescript-eslint/strict-boolean-expressions': 0,
                '@typescript-eslint/explicit-function-return-type': [
                    'error',
                    {
                        allowExpressions: true
                    }
                ],
                '@typescript-eslint/typedef': [
                    'error',
                    {
                        'arrayDestructuring': false,
                        'arrowParameter': false,
                        'memberVariableDeclaration': true,
                        'parameter': true,
                        'objectDestructuring': false,
                        'propertyDeclaration': true,
                        'variableDeclaration': false
                    },
                ],
                '@typescript-eslint/prefer-readonly-parameter-types': 0,
                '@typescript-eslint/no-dynamic-delete': 0,
                '@typescript-eslint/no-type-alias': 0,
                '@typescript-eslint/explicit-member-accessibility': [
                    'error',
                    {
                        'overrides': {
                            'constructors': 'off'
                        }
                    }
                ],
                '@typescript-eslint/init-declarations': 0,
                '@typescript-eslint/interface-name-prefix': 0,
                '@typescript-eslint/prefer-nullish-coalescing': 'error',
                '@typescript-eslint/lines-between-class-members': 'error'
            },
        },
    ],
    settings: {
        react: {
            // React version. 'detect' automatically picks the version you have installed.
            version: 'detect',
        },
    },
};
// module.exports = {
//     parser: '@typescript-eslint/parser',
//     parserOptions: {
//         ecmaVersion: 2017,
//         sourceType: 'module',
//         ecmaFeatures: {
//             jsx: true,
//         }
//     },
//     env: {
//         browser: true,
//         node: true,
//         es6: true,
//         jest: true,
//     },
//     extends: [
//         'react-app',
//         'eslint:recommended'
//     ],
//     overrides: [
//         {
//             parser: '@typescript-eslint/parser',
//             parserOptions: {
//                 project: ['./tsconfig.json'],
//                 tsconfigRootDir: __dirname,
//                 ecmaFeatures: {
//                     jsx: true
//                 }
//             },
//             files: ['**/*.ts', '**/*.tsx'],
//             plugins: ['@typescript-eslint'],
//             extends: [
//                 'react-app',
//                 'eslint:recommended',
//                 'plugin:@typescript-eslint/eslint-recommended',
//                 'plugin:@typescript-eslint/recommended',
//                 'plugin:react/recommended'
//             ],
//             rules: {
//                 '@typescript-eslint/brace-style': [
//                     'error',
//                     '1tbs',
//                     {
//                         'allowSingleLine': false
//                     }
//                 ],
//                 '@typescript-eslint/no-inferrable-types': 0,
//                 '@typescript-eslint/quotes': ['error', 'single', { 'avoidEscape': true }],
//                 '@typescript-eslint/space-before-function-paren': 0,
//                 '@typescript-eslint/semi': 1,
//                 '@typescript-eslint/no-magic-numbers': 0,
//                 '@typescript-eslint/strict-boolean-expressions': 0,
//                 '@typescript-eslint/explicit-function-return-type': [
//                     'error',
//                     {
//                         allowExpressions: true
//                     }
//                 ],
//                 '@typescript-eslint/typedef': [
//                     'error',
//                     {
//                         'arrayDestructuring': false,
//                         'arrowParameter': false,
//                         'memberVariableDeclaration': true,
//                         'parameter': true,
//                         'objectDestructuring': false,
//                         'propertyDeclaration': true,
//                         'variableDeclaration': false
//                     },
//                 ],
//                 '@typescript-eslint/prefer-readonly-parameter-types': 0,
//                 '@typescript-eslint/no-dynamic-delete': 0,
//                 '@typescript-eslint/no-type-alias': 0,
//                 '@typescript-eslint/explicit-member-accessibility': [
//                     'error',
//                     {
//                         'overrides': {
//                             'constructors': 'off'
//                         }
//                     }
//                 ],
//                 '@typescript-eslint/init-declarations': 0,
//                 '@typescript-eslint/interface-name-prefix': 0
//             }
//         }
//     ]
// };