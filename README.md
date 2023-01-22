[![Node.js CI](https://github.com/BlueMoonDevelopment/ExpenseMan-API/actions/workflows/npm.yml/badge.svg)](https://github.com/BlueMoonDevelopment/ExpenseMan-API/actions/workflows/npm.yml) ![apiexpensemanapp](https://cronitor.io/badges/jAwIlr/production/-GRMEU_JY8FkP7nTGgwixe3U13k.svg) [![ESLint](https://github.com/BlueMoonDevelopment/expenseman-api/actions/workflows/eslint.yml/badge.svg)](https://github.com/BlueMoonDevelopment/expenseman-api/actions/workflows/eslint.yml)

# First installation

NPM, NodeJS and PM2 need to be installed.
On First startup, run <br>
  `npm install`<br>
to install all the neccessary dependencies.<br>
Then copy the `config.example.json` and rename it to `config.json` and change the values to your environment.

# Development

simply run `npm run dev` to start server and it will automatically restart once you make changes.
When using Visual Studio code just press F5

# Production
Then to start the webserver just run the `npm run start`
<br>
Also you should setup an Apache2 Webserver and Proxy the NodeJS Server to that.

# External Documentation

[NodeJS documentation](https://nodejs.org/en/docs/guides/)<br>
[Express.JS documentation](https://expressjs.com/guide/routing.html)<br>
[Swagger documentation](https://swagger.io/docs/specification/describing-request-body/)<br>
