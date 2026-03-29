const Koa = require("koa");
const json = require("koa-json");
const bodyParser = require("koa-bodyparser");
const cors = require("@koa/cors");
const router = require("./routes");

const app = new Koa();
app.use(cors());
app.use(json());
app.use(bodyParser());
app.use(router.routes()).use(router.allowedMethods());

if (require.main === module) {
  app.listen(3000, () => console.log("Server running on port 3000"));
}

module.exports = app;
