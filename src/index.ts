import { Elysia } from "elysia";
import { html } from '@elysiajs/html';
import { staticPlugin } from '@elysiajs/static'
import { getWeather } from "./getWeather";

new Elysia()
  .use(html())
  .use(staticPlugin({
    prefix: "/",
  }))
  .use(getWeather)
  .get("/", async () => Bun.file("public/index.html"))
  .listen(3000, ({hostname, port}) => {
    console.log(`🦊 Elysia is running at http://${hostname}:${port}`);
  });
