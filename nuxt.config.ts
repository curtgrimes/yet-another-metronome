// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({

    modules: [
        '@nuxt/eslint',
        '@nuxt/image',
        '@nuxt/ui',
        '@nuxt/test-utils/module',
    ],
    devtools: { enabled: true },

    css: [
        '~/assets/css/main.css',
        'vue-color/style.css',
    ],
    compatibilityDate: '2025-07-15',

    pages: true,

    app: {
        rootAttrs: {
            class: 'h-full',
        },
    },

    vite: {
        build: {
            minify: false,
        },
    },
});
