import "./navigo_EditedByLars.js"

import {
  setActiveLink, adjustForMissingHash, renderTemplate, loadHtml
} from "./utils.js"

import { initProducts } from "./pages/products/products.js";
import { initDeliveries } from "./pages/deliveries/deliveries.js";


window.addEventListener("load", async () => {

  const templateNotFound = await loadHtml("./pages/notfound.html")
  const templateProducts = await loadHtml("./pages/products/products.html")
  const templateDeliveries = await loadHtml("./pages/deliveries/deliveries.html")

  adjustForMissingHash()

  const router = new Navigo("/", { hash: true });
  window.router = router

  router
    .hooks({
      before(done, match) {
        setActiveLink("menu", match.url)
        done()
      }
    })
    .on({
      "/": () => document.getElementById("content").innerHTML = `
        <h2>Product/Delivery system</h2>
        <p style='margin-top:1em;font-size: 1.5em;color:darkgray;'>
          Exam project for 3rd Semester, autumn.
          <br>
          Made by Johannes Sloth
        </p>
     `,
      "/products": () => {
        renderTemplate(templateProducts, "content")
        initProducts()
      },
      "/deliveries": () => {
        renderTemplate(templateDeliveries, "content")
        initDeliveries()
      }
    })
    .notFound(() => {
      renderTemplate(templateNotFound, "content")
    })
    .resolve()
});


window.onerror = function (errorMsg, url, lineNumber, column, errorObj) {
  alert('Error: ' + errorMsg + ' Script: ' + url + ' Line: ' + lineNumber
    + ' Column: ' + column + ' StackTrace: ' + errorObj);
}