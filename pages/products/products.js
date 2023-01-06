import { API_URL, FETCH_NO_API_ERROR } from "../../settings.js"
import { handleHttpErrors } from "../../utils.js"
import { sanitizeStringWithTableRows } from "../../utils.js"
const URL = API_URL + "/products/"

export async function initProducts() {
    document.getElementById("btn-newproduct-confirm").onclick = addNewProduct
    document.getElementById("btn-lookupproduct-confirm").onclick = lookupProduct
    
    try {
        const products = await fetch(URL).then(handleHttpErrors)
        const productsRows = products.map(product => `
        <tr>
        <td>${product.productId}</td>
        <td>${product.name}</td>
        <td>${product.price}</td>
        <td>${product.weight}</td>
        `).join("\n")

        const safeRows = sanitizeStringWithTableRows(productsRows);
        document.getElementById("table-rows").innerHTML = safeRows;
    } catch (err) {
        if (err.apiError) {
            document.getElementById("error").innerText = err.apiError.message
        } else {
            document.getElementById("error").innerText = err.message + FETCH_NO_API_ERROR
            console.error(err.message + FETCH_NO_API_ERROR)
        }
    }
}

async function addNewProduct() {
    const productRequest = {}
    productRequest.name = document.getElementById("input-productname").value
    productRequest.price = document.getElementById("input-price").value
    productRequest.weight = document.getElementById("input-weight").value

    const fetchOptions = {}
    fetchOptions.method = "POST"
    fetchOptions.headers = { "Content-Type": "application/json" }
    fetchOptions.body = JSON.stringify(productRequest)

    try {
        await fetch(URL, fetchOptions).then(handleHttpErrors)
        document.getElementById("newproduct-status-msg").innerText = "Product was successfully created"
        initProducts()
    } catch (err) {
        if (err.apiError) {
            document.getElementById("newproduct-status-msg").innerText = err.apiError.message
        } else {
            document.getElementById("newproduct-status-msg").innerText = err.message + FETCH_NO_API_ERROR
            console.error(err.message + FETCH_NO_API_ERROR)
        }
    }
}

async function lookupProduct(){
    let productId = document.getElementById("input-productid").value
    const productURL = URL + productId

    const fetchOptions = {}
    fetchOptions.headers = { "Content-Type": "application/json" }

    let productProperties = '' 
    try {
        const product = await fetch(productURL, fetchOptions).then(handleHttpErrors)
        productProperties = `<p>Id: ${product.productId}&nbsp Name: ${product.name} &nbsp Price: ${product.productId} &nbsp Weight: ${product.weight}</p>`

        let secureProductProperties = DOMPurify.sanitize(productProperties)
        document.getElementById("product-properties").innerHTML = secureProductProperties
    } catch (err) {
        if (err.apiError) {
            document.getElementById("lookupproduct-status-msg").innerText = err.apiError.message
        } else {
            document.getElementById("lookupproduct-status-msg").innerText = err.message + FETCH_NO_API_ERROR
            console.error(err.message + FETCH_NO_API_ERROR)
        }
    }
}