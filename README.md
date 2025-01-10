TODO proper readme

- api app, talks with openai, provides api endpoint; needs some env
- widget app, provides form and api result rendering, talks with the api app
- common utils e.g. shared codecs
- glued with nx monorepo

UI dev:

`npx dotenv -e ./apps/ai-menu-widget-ui/.env npx nx serve ai-menu-widget-ui`

backend dev:

`npx dotenv -e ./apps/ai-menu/.env npx nx serve ai-menu`
