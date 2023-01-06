import { API_URL, FETCH_NO_API_ERROR } from "../../settings.js"
import { handleHttpErrors } from "../../utils.js"
import { sanitizeStringWithTableRows } from "../../utils.js"
const URL = API_URL + "/deliveries/"

export async function initDeliveries() {
    document.getElementById("btn-newdelivery-confirm").onclick = addDelivery
    document.getElementById("btn-lookupdelivery-confirm").onclick = lookupDelivery
    document.getElementById("btn-addpo-confirm").onclick = addProductOrderToDelivery
    document.getElementById("btn-vanassignment-confirm").onclick = addDeliveryToVan
    document.getElementById("btn-lookupvan-confirm").onclick = lookupVan

    try {
        const deliveries = await fetch(URL).then(handleHttpErrors)
        const deliveryRows = deliveries.map(delivery => `
        <tr>
        <td>${delivery.deliveryId}</td>
        <td>${delivery.deliveryDate}</td>
        <td>${delivery.fromWarehouse}</td>
        <td>${delivery.destination}</td>
        <td>${delivery.totalPrice}</td>
        <td>${delivery.totalWeight}</td>
        <td>${delivery.productOrders.length}</td>
        `).join("\n")

        const safeRows = sanitizeStringWithTableRows(deliveryRows);
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

async function addDelivery() {
    const deliveryRequest = {}
    deliveryRequest.deliveryDate = document.getElementById("input-deliverydate").value
    deliveryRequest.fromWarehouse = document.getElementById("input-fromwarehouse").value
    deliveryRequest.destination = document.getElementById("input-destination").value

    const fetchOptions = {}
    fetchOptions.method = "POST"
    fetchOptions.headers = { "Content-Type": "application/json" }
    fetchOptions.body = JSON.stringify(deliveryRequest)

    try {
        const delivery = await fetch(URL, fetchOptions).then(handleHttpErrors)
        document.getElementById("newdelivery-status-msg").innerText = "Delivery was successfully created with the id: " + delivery.deliveryId
        initDeliveries()
    } catch (err) {
        if (err.apiError) {
            document.getElementById("newdelivery-status-msg").innerText = err.apiError.message
        } else {
            document.getElementById("newdelivery-status-msg").innerText = err.message + FETCH_NO_API_ERROR
            console.error(err.message + FETCH_NO_API_ERROR)
        }
    }
}

async function addProductOrderToDelivery() {
    let deliveryId = document.getElementById("input-deliveryid-addpo").value
    let productId = document.getElementById("input-productid-addpo").value
    let quantity = document.getElementById("input-quantity-addpo").value
    const addPoUrl = URL + "addproductorder/" + deliveryId + "/" + productId + "/" + quantity

    const fetchOptions = {}
    fetchOptions.method = "POST"
    fetchOptions.headers = { "Content-Type": "application/json" }

    try {
        const delivery = await fetch(addPoUrl, fetchOptions).then(handleHttpErrors)
        document.getElementById("addpo-status-msg").innerText = "Product order has been successfully been added to the delivery"
        document.getElementById("total").innerText = "The new total price of the delivery is: " + delivery.totalPrice + "\n The new total weight of the delivery is: " + delivery.totalWeight

        initDeliveries()
    } catch (err) {
        if (err.apiError) {
            document.getElementById("addpo-status-msg").innerText = err.apiError.message
        } else {
            document.getElementById("addpo-status-msg").innerText = err.message + FETCH_NO_API_ERROR
            console.error(err.message + FETCH_NO_API_ERROR)
        }
    }
}

async function lookupDelivery() {
    let deliveryId = document.getElementById("input-deliveryid").value
    const deliveryURL = URL + deliveryId

    const fetchOptions = {}
    fetchOptions.headers = { "Content-Type": "application/json" }

    let deliveryProperties = ''
    try {
        const delivery = await fetch(deliveryURL, fetchOptions).then(handleHttpErrors)
        deliveryProperties = `
            <ul>
                <li>Id: ${delivery.deliveryId}</li>
                <li>Delivery date: ${delivery.deliveryDate}</li>
                <li>Warehouse: ${delivery.fromWarehouse}</li>
                <li>Total Price: ${delivery.totalPrice}</li>
                <li>Total Weight: ${delivery.totalWeight}</li>
                <li>Product orders:</li>
                <ul>
                ${delivery.productOrders.map(productOrder => `
                    <li>
                        Product Order Id: ${productOrder.productOrderId}<br>
                        Quantity: ${productOrder.quantity}<br>
                        Product:
                        <ul>
                        <li>Product Id: ${productOrder.product.productId}</li>
                        <li>Name: ${productOrder.product.name}</li>
                        <li>Price: ${productOrder.product.price}</li>
                        <li>Weight: ${productOrder.product.weight}</li>
                        </ul>
                    </li>
                    `).join('')}
                </ul>
            </ul>
            `

        let secureDeliveryProperties = DOMPurify.sanitize(deliveryProperties)
        document.getElementById("delivery-properties").innerHTML = secureDeliveryProperties
    } catch (err) {
        if (err.apiError) {
            document.getElementById("lookupdelivery-status-msg").innerText = err.apiError.message
        } else {
            document.getElementById("lookupdelivery-status-msg").innerText = err.message + FETCH_NO_API_ERROR
            console.error(err.message + FETCH_NO_API_ERROR)
        }
    }
}

async function addDeliveryToVan() {
    let vanId = document.getElementById("input-vanid-vanassignment").value
    let deliveryId = document.getElementById("input-deliveryid-vanassignment").value
    const addDeliveryToVanUrl = API_URL + "/vans/" + vanId + "/" + deliveryId

    const fetchOptions = {}
    fetchOptions.method = "POST"
    fetchOptions.headers = { "Content-Type": "application/json" }

    try {
        const vanResponse = await fetch(addDeliveryToVanUrl, fetchOptions).then(handleHttpErrors)
        document.getElementById("vanassignment-status-msg").innerText = "Delivery has been succesfully added to the " + vanResponse.brand + " " + vanResponse.model + " with id: " + vanResponse.vanId
    } catch (err) {
        if (err.apiError) {
            document.getElementById("vanassignment-status-msg").innerText = err.apiError.message
        } else {
            document.getElementById("vanassignment-status-msg").innerText = err.message + FETCH_NO_API_ERROR
            console.error(err.message + FETCH_NO_API_ERROR)
        }
    }
}

async function lookupVan() {
    let vanId = document.getElementById("input-vanid-lookup").value
    const vanURL = API_URL + "/vans/" + vanId

    const fetchOptions = {}
    fetchOptions.headers = { "Content-Type": "application/json" }

    let vanProperties = ''
    try {
        const van = await fetch(vanURL, fetchOptions).then(handleHttpErrors)
        vanProperties = `
            <ul>
                <li>Id: ${van.vanId}</li>
                <li>Brand: ${van.brand}</li>
                <li>Model: ${van.model}</li>
                <li>Capacity: ${van.capacity}</li>
                <li>Deliveries:</li>
                <ul>
                ${van.deliveries.map(delivery => `
                    <li>
                        Delivery Id: ${delivery.deliveryId}<br>
                        Delivery date: ${delivery.deliveryDate}<br>
                        Warehouse: ${delivery.fromWarehouse}<br>
                        Destination: ${delivery.destination}<br>
                        Total Price: ${delivery.totalPrice}<br>
                        Total Weight: ${delivery.totalWeight}<br>
                    </li>
                    `).join('')}
                </ul>
            </ul>
            `

        let secureVanProperties = DOMPurify.sanitize(vanProperties)
        document.getElementById("van-properties").innerHTML = secureVanProperties
    } catch (err) {
        if (err.apiError) {
            document.getElementById("lookupvan-status-msg").innerText = err.apiError.message
        } else {
            document.getElementById("lookupvan-status-msg").innerText = err.message + FETCH_NO_API_ERROR
            console.error(err.message + FETCH_NO_API_ERROR)
        }
    }
}