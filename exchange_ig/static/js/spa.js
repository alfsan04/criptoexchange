peticion_todos = new XMLHttpRequest();
peticion_alta = new XMLHttpRequest();
peticion_valor_actual = new XMLHttpRequest();
peticion_movimiento = new XMLHttpRequest();

cantidades = {};
let monedas = ["BTC","ETH","USDT","BNB","XRP","ADA","DOT","MATIC"];
var moneda_from_glob = "";
var cantidad_from_glob = "";
var moneda_to_glob ="";
var hora = "";

function peticion_todos_handler(){ //handler se traduce como manejador
    if (this.readyState === 4) {
        if (this.status === 200){
            const los_datos = JSON.parse(this.responseText);
            const la_tabla = document.querySelector("#movements_table");
            const cantidad_disponible = document.querySelector("#cantidades_disponibles");
            const movimientos = los_datos.data;

            formulario_cerrado();
            peticion_estado_inversion_handler();

            cantidades = {};
            for (let i=0; i<monedas.length; i++) {
                cantidades[monedas[i]] = 0;
            }
            
            clear_tab();

            for (let i=0; i<movimientos.length; i++) {
                item = movimientos[i];
                if (cantidades.hasOwnProperty(item.moneda_from)) {
                    cantidades[item.moneda_from] -= item.cantidad_from;
                }
                if (cantidades.hasOwnProperty(item.moneda_to)) {
                    cantidades[item.moneda_to] += item.cantidad_to;
                }
                const trow = document.createElement("tr");
                const tddate = document.createElement("td");
                const tdtime = document.createElement("td");
                const tdmoneda_from = document.createElement("td");
                const tdcantidad_from = document.createElement("td");
                const tdmoneda_to = document.createElement("td");
                const tdcantidad_to = document.createElement("td");

                tddate.innerHTML = item.date;
                tdtime.innerHTML = item.time;
                tdmoneda_from.innerHTML = item.moneda_from;
                tdcantidad_from.innerHTML = item.cantidad_from;
                tdmoneda_to.innerHTML = item.moneda_to;
                tdcantidad_to.innerHTML = item.cantidad_to;

                trow.appendChild(tddate);
                trow.appendChild(tdtime);
                trow.appendChild(tdmoneda_from);
                trow.appendChild(tdcantidad_from);
                trow.appendChild(tdmoneda_to);
                trow.appendChild(tdcantidad_to);
                la_tabla.appendChild(trow);
            }
            for (let i= 0; i<monedas.length; i++) {
                const trow = document.createElement("tr");
                const tdmoneda = document.createElement("td");
                const tdcantidad = document.createElement("td");
                if (cantidades[monedas[i]] && cantidades[monedas[i]] != 0) {
                    tdmoneda.innerHTML = monedas[i];
                    tdcantidad.innerHTML = cantidades[monedas[i]].toFixed(8);
                    trow.appendChild(tdmoneda);
                    trow.appendChild(tdcantidad);
                }
                cantidad_disponible.appendChild(trow);
            }
        } else {
            activar_alerta("Se ha producido un error en la consulta de movimientos");
        }
    }
}

function clear_tab(){
    const la_tabla = document.querySelector("#movements_table");
    la_tabla.innerHTML = "";
    const trow = document.createElement("tr");
    
    const thdate = document.createElement("th");
    const thtime = document.createElement("th");
    const thmoneda_from = document.createElement("th");
    const thcantidad_from = document.createElement("th");
    const thmoneda_to = document.createElement("th");
    const thcantidad_to = document.createElement("th");

    thdate.innerHTML = "Fecha";
    thtime.innerHTML = "Hora";
    thmoneda_from.innerHTML = "From";
    thcantidad_from.innerHTML = "Cantidad";
    thmoneda_to.innerHTML = "From";
    thcantidad_to.innerHTML = "Cantidad";

    trow.appendChild(thdate);
    trow.appendChild(thtime);
    trow.appendChild(thmoneda_from);
    trow.appendChild(thcantidad_from);
    trow.appendChild(thmoneda_to);
    trow.appendChild(thcantidad_to);

    la_tabla.appendChild(trow);

    const cantidad_disponible = document.querySelector("#cantidades_disponibles");
    cantidad_disponible.innerHTML = "";
    const trow2 = document.createElement("tr");
    cantidad_disponible.appendChild(trow2);
}

function peticion_alta_handler() {
    if (this.readyState === 4) {
        if (this.status === 201) {
            peticion_todos.open("GET", "http://localhost:5000/api/v1.0/movimientos", true);
            peticion_todos.onload = peticion_todos_handler;
            peticion_todos.onerror = function() { alert("No se ha podido completar la petici??n de movimientos") }
            peticion_todos.send();
        } else {
            activar_alerta("Se ha producido un error en el alta de movimientos");
        }
    }
}

function altaMovimiento(ev) {
    ev.preventDefault()
    const moneda_from_alta = document.querySelector("#moneda_from").value;
    const cantidad_from_alta = document.querySelector("#cantidad_from").value;
    const moneda_to_alta = document.querySelector("#moneda_to").value;

    if (moneda_to_alta != moneda_to_glob) {
        activar_alerta("Has modificado la moneda de destino, debes volver a calcular");
        document.querySelector("#btn_intercambiar").classList.add("inactive");
        borrar_formulario();
        return;
    }

    if (moneda_from_alta != moneda_from_glob) {
        activar_alerta("Has modificado la moneda de origen, debes volver a calcular");
        document.querySelector("#btn_intercambiar").classList.add("inactive");
        borrar_formulario();
        return;
    }

    if (cantidad_from_alta != cantidad_from_glob) {
        activar_alerta("Has modificado la cantidad de origen, debes volver a calcular");
        document.querySelector("#btn_intercambiar").classList.add("inactive");
        borrar_formulario();
        return;
    }

    peticion_alta.open("POST", "http://localhost:5000/api/v1.0/movimiento", true);
    peticion_alta.onload = peticion_alta_handler;
    peticion_alta.onerror = function() { alert("No se ha podido completar la carga de movimientos") };
    peticion_alta.setRequestHeader("Content-Type", "application/json");
    const data_json = JSON.stringify({moneda_from: moneda_from_glob, cantidad_from: cantidad_from_glob, moneda_to: moneda_to_glob, cantidad_to: 0});
    peticion_alta.send(data_json);
}

function borrar_formulario(){
    document.getElementById("moneda_from").options.item(0).selected = "selected";
    document.getElementById("moneda_to").options.item(0).selected = "selected";
    document.getElementById("cantidad_from").value = "";
    document.getElementById("cantidad_from").placeholder = "Cu??nto quieres cambiar";
    document.querySelector("#quantity").innerHTML = "";
    document.querySelector("#precio_unitario").innerHTML = "";
    document.querySelector("#aviso_calculo").classList.add("inactive");
}

function formulario_cerrado(){
    document.querySelector("#btn_intercambiar").classList.add("inactive");
    document.querySelector("#movement_detail").classList.add("inactive");
    document.querySelector("#btn_nuevo_movimiento").innerHTML = "+";
    borrar_formulario();
}

function formulario_abierto(){
    document.querySelector("#movement_detail").classList.remove("inactive");
    document.querySelector("#btn_nuevo_movimiento").innerHTML = "-";
}

function peticion_estado_inversion_handler() {
    peticion_valor_actual.open("GET", "http://localhost:5000/api/v1.0/estado_inversion", true);
    peticion_valor_actual.onload = estado_inversion;
    peticion_valor_actual.onerror = function() { alert("No se ha podido completar la petici??n de movimientos") }
    peticion_valor_actual.send();
}

function estado_inversion(){
    if (this.readyState === 4 && this.status === 200) {
        document.querySelector("#cantidad_invertida").innerHTML = "";
        document.querySelector("#cantidad_recuperada").innerHTML = "";
        document.querySelector("#valor_compra").innerHTML = "";
        document.querySelector("#valor_actual").innerHTML = "";
        
        const los_datos = JSON.parse(this.responseText);
        const estado_inversion = los_datos.data;
            
        document.querySelector("#cantidad_invertida").innerHTML = estado_inversion["invertido"] + " ???";
        document.querySelector("#cantidad_recuperada").innerHTML = estado_inversion["recuperado"] + " ???";
        document.querySelector("#valor_compra").innerHTML = estado_inversion["valor_compra"] + " ???";
        document.querySelector("#valor_actual").innerHTML = estado_inversion["valor_actual"] + " ???";
    } else {
        activar_alerta("Se ha producido un error en el alta de movimientos");
    }
} 

function estado_boton() {
    const btn_nuevo_movimiento = document.querySelector("#btn_nuevo_movimiento");
    if (btn_nuevo_movimiento.innerHTML == "+") {
        formulario_abierto();
    } else {
        formulario_cerrado();
    }
}

function calcular_movimiento_handler(ev){
    ev.preventDefault();
    const moneda_from_loc = document.querySelector("#moneda_from").value;
    moneda_from_glob = moneda_from_loc;
    const cantidad_from_loc = document.querySelector("#cantidad_from").value;
    cantidad_from_glob = cantidad_from_loc;
    const moneda_to_loc = document.querySelector("#moneda_to").value;
    moneda_to_glob = moneda_to_loc;

    if (moneda_from_loc === "") {
        activar_alerta("Debes elegir una moneda");
        return;
    }

    if (moneda_to_loc === "") {
        activar_alerta("Debes elegir una moneda");
        return;
    }

    if (cantidad_from_loc == 0 || cantidad_from_loc === "") {
        activar_alerta("Debes informar una cantidad distinta de cero");
        return;
    }

    if (moneda_from_loc != "EUR" && Number(cantidad_from_loc) > cantidades[moneda_from_loc]) {
        activar_alerta("No tienes suficientes fondos en " + moneda_from_loc + " para realizar la operaci??n");
        return;
    }

    if (moneda_from_loc === moneda_to_loc){
        activar_alerta("No puedes intercambiar una moneda por s?? misma, selecciona otro destino");
        return;
    }
    peticion_movimiento.open("POST", "http://localhost:5000/api/v1.0/tasa", true);
    peticion_movimiento.onload = calcular_movimiento;
    peticion_movimiento.onerror = function() { alert("No se ha podido completar la carga de movimientos") }
    peticion_movimiento.setRequestHeader("Content-Type", "application/json");
    const data_json = JSON.stringify({moneda_from: moneda_from_loc, cantidad_from: cantidad_from_loc, moneda_to: moneda_to_loc, cantidad_to: 0});
    peticion_movimiento.send(data_json);
}

function calcular_movimiento(){
    if (this.readyState === 4 && this.status === 201) {
        document.querySelector("#btn_intercambiar").classList.remove("inactive");

        const los_datos = JSON.parse(this.responseText);
        const calculo_movimiento = los_datos.data;
        hora = calculo_movimiento[1];

        document.querySelector("#quantity").innerHTML = "Q: "+calculo_movimiento[5].toFixed(8);
        document.querySelector("#precio_unitario").innerHTML = "P.U: "+calculo_movimiento[6].toFixed(8);
        document.querySelector("#aviso_calculo").classList.remove("inactive");

    } else {
        alert("Se ha producido un error en el c??lculo de movimientos");
        borrar_formulario();
    }
}
function cargar_pagina(){
    peticion_todos.open("GET", "http://localhost:5000/api/v1.0/movimientos", true); 
    peticion_todos.onload = peticion_todos_handler;
    peticion_todos.onerror = function() { alert("No se ha podido completar la petici??n de movimientos") }
    peticion_todos.send();
}

function ocultar_alerta(){
    document.querySelector("#ocultar").classList.add("inactive");
}

function activar_alerta(mensaje){
    document.querySelector("#ocultar").classList.remove("inactive");
    document.querySelector("#aviso_fallo").innerHTML = mensaje;
}


window.onload = function() {
    cargar_pagina();
    peticion_estado_inversion_handler();

    document.querySelector("#btn_calculate").onclick = calcular_movimiento_handler;
    document.querySelector("#btn_cerrar").onclick = formulario_cerrado;
    document.querySelector("#btn_nuevo_movimiento").onclick = estado_boton;
    document.querySelector("#btn_actualizar_cartera").onclick = peticion_estado_inversion_handler;
    document.querySelector("#btn_intercambiar").onclick = altaMovimiento;
    document.querySelector("#btn_alerta").onclick = ocultar_alerta;
}