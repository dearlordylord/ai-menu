TODO proper readme

- api app, talks with openai, provides api endpoint; needs some env
- widget app, provides form and api result rendering, talks with the api app
- common utils e.g. shared codecs
- glued with nx monorepo

UI dev:

`npx dotenv -e ./apps/ai-menu-widget-ui/.env npx nx serve ai-menu-widget-ui`

backend dev:

`npx dotenv -e ./apps/ai-menu/.env npx nx serve ai-menu`

for vercel (frontend): 

`npx dotenv -e ./apps/ai-menu-widget-ui/.env npx nx build ai-menu-widget-ui`

NB! UI envs are baked into the build


for DO deploy:

`npx nx docker-build ai-menu`
`docker tag ai-menu:latest registry.digitalocean.com/monadical-sas/ai-menu:latest`
`docker push registry.digitalocean.com/monadical-sas/ai-menu:latest`

for loskutoff.com dokku: `dokku git:from-image monadical-ai-menu registry.digitalocean.com/monadical-sas/ai-menu@sha256:2c2b28e9b4f1574c8dbbfd0803c20bcc9049bb07fa68701a9b7f48911e21d77e`

TODO automate if needed
