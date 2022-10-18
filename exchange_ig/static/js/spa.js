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

function altaMovimiento(ev) {
    ev.preventDefault()

    const date = document.querySelector("#date").value
    const time = document.querySelector("#time").value
    const moneda_from = document.querySelector("#moneda_from").value
    const cantidad_from = document.querySelector("#cantidad_from").value
    const moneda_to = document.querySelector("#moneda_to").value
    const cantidad_to = document.querySelector("#cantidad_to").value
    
    
    //validamos las respuestas del formulario
    /*if (concept === "") {
        alert("Debes informar el concepto")
        return
    }

    if (quantity == 0 || quantity === "") {
        alert("Debes informar una cantidad distinta de cero")
        return
    }

    const hoy = new Date().toISOString().split('T')[0] //obtengo la fecha de hoy en formato ISO, lo parto por la letra T de time que separa fecha y hora y me quedo solo con la fecha, posición 0 de la lista
    if (!date || date > hoy) { //!date es not date en javascript
        alert("Debes poner una fecha y no debe ser del futuro")
        return
    }*/

    peticion_alta.open("POST", "http://localhost:5000/api/v1.0/new", true)
    peticion_alta.onload = peticion_alta_handler
    peticion_alta.onerror = function() { alert("No se ha podido completar la carga de movimientos") }
    peticion_alta.setRequestHeader("Content-Type", "application/json") //siempre hay que ponerlo para que la petición se interprete como un json
    
    const data_json = JSON.stringify({date: date, time: time, moneda_from: moneda_from, cantidad_from: cantidad_from, moneda_to: moneda_to, cantidad_to: cantidad_to})
    peticion_alta.send(data_json)
}

window.onload = function() {
    peticion_todos.open("GET", "http://localhost:5000/api/v1.0/all", true) //el true hace que sea asíncrona, no se queda esperando la respuesta a la petición, todo sigue funcionando
    peticion_todos.onload = peticion_todos_handler
    peticion_todos.onerror = function() { alert("No se ha podido completar la petición de movimientos") }
    peticion_todos.send()

    document.querySelector("#btn_cerrar").onclick = function(ev) {
        ev.preventDefault()
        document.querySelector("#movement_detail").classList.add("inactive")
    }

    document.querySelector("#btn_intercambiar").onclick = altaMovimiento
}