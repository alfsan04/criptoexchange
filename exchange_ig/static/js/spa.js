peticion_todos = new XMLHttpRequest()
peticion_alta = new XMLHttpRequest()

function peticion_todos_handler(){ //handler se traduce como manejador
    if (this.readyState === 4) {
        if (this.status === 200){

            const los_datos = JSON.parse(this.responseText)
            const la_tabla = document.querySelector("#movements_table")
            const movimientos = los_datos.data

            for (let i=0; i<movimientos.length; i++) {
                item = movimientos[i]
                const trow = document.createElement("tr")

                const tddate = document.createElement("td")
                const tdtime = document.createElement("td")
                const tdmoneda_from = document.createElement("td")
                const tdcantidad_from = document.createElement("td")
                const tdmoneda_to = document.createElement("td")
                const tdcantidad_to = document.createElement("td")

                tddate.innerHTML = item.date
                tdtime.innerHTML = item.time
                tdmoneda_from.innerHTML = item.moneda_from
                tdcantidad_from.innerHTML = item.cantidad_from
                tdmoneda_to.innerHTML = item.moneda_to
                tdcantidad_to.innerHTML = item.cantidad_to

                trow.appendChild(tddate)
                trow.appendChild(tdtime)
                trow.appendChild(tdmoneda_from)
                trow.appendChild(tdcantidad_from)
                trow.appendChild(tdmoneda_to)
                trow.appendChild(tdcantidad_to)
                la_tabla.appendChild(trow)
            }
        } else {
            alert("Se ha producido un error en la consulta de movimientos")
        }
    }
}

function peticion_alta_handler() {
    if (this.readyState === 4) {
        if (this.status === 201) {
            peticion_todos.open("GET", "http://localhost:5000/api/v1.0/all", true) //el true hace que sea asíncrona, no se queda esperando la respuesta a la petición, todo sigue funcionando
            peticion_todos.onload = peticion_todos_handler
            peticion_todos.onerror = function() { alert("No se ha podido completar la petición de movimientos") }
            peticion_todos.send()
        } else {
            alert("Se ha producido un error en el alta de movimientos")
        }
    }
}

window.onload = function() {
    peticion_todos.open("GET", "http://localhost:5000/api/v1.0/all", true) //el true hace que sea asíncrona, no se queda esperando la respuesta a la petición, todo sigue funcionando
    peticion_todos.onload = peticion_todos_handler
    peticion_todos.onerror = function() { alert("No se ha podido completar la petición de movimientos") }
    peticion_todos.send()
}