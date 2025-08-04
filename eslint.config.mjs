// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs';

export default withNuxt(
    {
        rules: {
            'vue/multi-word-component-names': 'off',
            'vue/max-attributes-per-line': ['error', {
                singleline: 1,
                multiline: 1,
            }],
            'vue/first-attribute-linebreak': ['error', {
                singleline: 'ignore',
                multiline: 'below',
            }],
            'vue/html-indent': ['error', 4, {
                attribute: 1,
                baseIndent: 1,
                closeBracket: 0,
                alignAttributesVertically: true,
                ignores: [],
            }],
            'vue/html-closing-bracket-newline': ['error', {
                singleline: 'never',
                multiline: 'always',
            }],
            'indent': ['error', 4],
            'comma-dangle': ['error', 'always-multiline'],
            'semi': ['error', 'always'],
        },
    },
);
