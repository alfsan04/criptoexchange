peticion_todos = new XMLHttpRequest()
peticion_alta = new XMLHttpRequest()
peticion_valor_actual = new XMLHttpRequest()

cantidades = {}
let monedas = ["BTC","ETH","USDT","BNB","XRP","ADA","DOT","MATIC"];

function peticion_todos_handler(){ //handler se traduce como manejador
    if (this.readyState === 4) {
        if (this.status === 200){

            const los_datos = JSON.parse(this.responseText)
            const la_tabla = document.querySelector("#movements_table")
            const cantidad_disponible = document.querySelector("#cantidades_disponibles")
            const movimientos = los_datos.data

            cantidades = {};
            for (let i=0; i<monedas.length; i++) {
                cantidades[monedas[i]] = 0;
            }
            
            clear_tab()
            

            for (let i=0; i<movimientos.length; i++) {
                item = movimientos[i]
                if (cantidades.hasOwnProperty(item.moneda_from)) {
                    cantidades[item.moneda_from] -= item.cantidad_from
                }
                if (cantidades.hasOwnProperty(item.moneda_to)) {
                    cantidades[item.moneda_to] += item.cantidad_to
                }
                
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

            for (let i= 0; i<monedas.length; i++) {
                const trow = document.createElement("tr")

                const tdmoneda = document.createElement("td")
                const tdcantidad = document.createElement("td")
                if (cantidades[monedas[i]] && cantidades[monedas[i]] != 0) {
                    tdmoneda.innerHTML = monedas[i]
                    tdcantidad.innerHTML = cantidades[monedas[i]].toFixed(8)

                    trow.appendChild(tdmoneda)
                    trow.appendChild(tdcantidad)
                }
                
                cantidad_disponible.appendChild(trow)
            }

        } else {
            alert("Se ha producido un error en la consulta de movimientos")
        }
    }
}

function clear_tab(){
    const la_tabla = document.querySelector("#movements_table")
    la_tabla.innerHTML = ""
    const trow = document.createElement("tr")
    
    const thdate = document.createElement("th")
    const thtime = document.createElement("th")
    const thmoneda_from = document.createElement("th")
    const thcantidad_from = document.createElement("th")
    const thmoneda_to = document.createElement("th")
    const thcantidad_to = document.createElement("th")

    thdate.innerHTML = "Fecha"
    thtime.innerHTML = "Hora"
    thmoneda_from.innerHTML = "From"
    thcantidad_from.innerHTML = "Cantidad"
    thmoneda_to.innerHTML = "From"
    thcantidad_to.innerHTML = "Cantidad"

    trow.appendChild(thdate)
    trow.appendChild(thtime)
    trow.appendChild(thmoneda_from)                 
    trow.appendChild(thcantidad_from)
    trow.appendChild(thmoneda_to)
    trow.appendChild(thcantidad_to)

    la_tabla.appendChild(trow)

    const cantidad_disponible = document.querySelector("#cantidades_disponibles")
    cantidad_disponible.innerHTML = ""
    const trow2 = document.createElement("tr")
    cantidad_disponible.appendChild(trow2)

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
    const moneda_from = document.querySelector("#moneda_from").value
    const cantidad_from = document.querySelector("#cantidad_from").value
    const moneda_to = document.querySelector("#moneda_to").value
    
    //validamos las respuestas del formulario
    if (moneda_from != "EUR" && Number(cantidad_from) > cantidades[moneda_from]) {
        alert("No tienes suficientes fondos en " + moneda_from + " para realizar la operación")
        return
    }

    if (moneda_from === moneda_to){
        alert("No puedes intercambiar una moneda por sí misma, selecciona otro destino")
        return
    }
    
    if (moneda_from === "") {
        alert("Debes elegir una moneda")
        return
    }

    if (cantidad_from == 0 || cantidad_from === "") {
        alert("Debes informar una cantidad distinta de cero")
        return
    }

    if (moneda_to === "") {
        alert("Debes elegir una moneda")
        return
    }

    peticion_alta.open("POST", "http://localhost:5000/api/v1.0/new", true)
    peticion_alta.onload = peticion_alta_handler
    peticion_alta.onerror = function() { alert("No se ha podido completar la carga de movimientos") }
    peticion_alta.setRequestHeader("Content-Type", "application/json") //siempre hay que ponerlo para que la petición se interprete como un json
    
    const data_json = JSON.stringify({moneda_from: moneda_from, cantidad_from: cantidad_from, moneda_to: moneda_to, cantidad_to: 0})
    peticion_alta.send(data_json)
}

//función para hacer la petición al servidor y recibir todos los valores
function peticion_invest_state_handler() {
    
            peticion_valor_actual.open("GET", "http://localhost:5000/api/v1.0/balance", true) //el true hace que sea asíncrona, no se queda esperando la respuesta a la petición, todo sigue funcionando
            peticion_valor_actual.onload = invest_state
            peticion_valor_actual.onerror = function() { alert("No se ha podido completar la petición de movimientos") }
            peticion_valor_actual.send()
        
}

//revisar la función, no funciona
function invest_state(){

    /*if (this.readyState === 4) {
        if (this.status === 201) {*/
            document.querySelector("#cantidad_invertida").innerHTML = ""
            document.querySelector("#cantidad_recuperada").innerHTML = ""
            document.querySelector("#valor_compra").innerHTML = ""
            document.querySelector("#valor_actual").innerHTML = ""            
            
            const los_datos = JSON.parse(this.responseText)
            const estado_inversion = los_datos.data
                
            document.querySelector("#cantidad_invertida").innerHTML = estado_inversion["invertido"] + " €"
            document.querySelector("#cantidad_recuperada").innerHTML = estado_inversion["recuperado"] + " €"
            document.querySelector("#valor_compra").innerHTML = estado_inversion["valor_compra"] + " €"
            document.querySelector("#valor_actual").innerHTML = estado_inversion["valor_actual"] + " €"
            
} 

function estado_boton() {
    const btn_nuevo_movimiento = document.querySelector("#btn_nuevo_movimiento")
    if (btn_nuevo_movimiento.innerHTML == "+") {
        btn_nuevo_movimiento.innerHTML = "-"
        document.querySelector("#movement_detail").classList.remove("inactive")
    } else {
        btn_nuevo_movimiento.innerHTML = "+"
        document.querySelector("#movement_detail").classList.add("inactive")
    }
}

window.onload = function() {
    peticion_todos.open("GET", "http://localhost:5000/api/v1.0/all", true) //el true hace que sea asíncrona, no se queda esperando la respuesta a la petición, todo sigue funcionando
    peticion_todos.onload = peticion_todos_handler
    peticion_todos.onerror = function() { alert("No se ha podido completar la petición de movimientos") }
    peticion_todos.send()

    peticion_invest_state_handler()

    document.querySelector("#btn_cerrar").onclick = function(ev) {
        ev.preventDefault()
        document.querySelector("#movement_detail").classList.add("inactive")
    }
    
    document.querySelector("#btn_nuevo_movimiento").onclick = estado_boton
    document.querySelector("#btn_actualizar_cartera").onclick = peticion_invest_state_handler
    document.querySelector("#btn_intercambiar").onclick = altaMovimiento
}