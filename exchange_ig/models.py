import sqlite3
import requests
from config import ORIGIN_DATA
from datetime import datetime
from config import api_key

def filas_to_diccionario(filas, columnas):
    resultado = []
    for fila in filas:
        d = {}
        for posicion, campo in enumerate(columnas):
            d[campo[0]] = fila[posicion]
        resultado.append(d)
    return resultado

def select_all():
    conn = sqlite3.connect(ORIGIN_DATA)
    cur = conn.cursor()
    cur.execute("SELECT id, date, time, moneda_from, cantidad_from, moneda_to, cantidad_to from movements order by date;")
    resultado = filas_to_diccionario(cur.fetchall(), cur.description)
    conn.close()
    for elemento in resultado:
        elemento["cantidad_to"] = round(elemento["cantidad_to"],8)
    return resultado

def select_all_by_coin():
    cartera = select_all()
    cantidades_cripto = {}
    cantidad_recuperada = 0
    cantidad_invertida = 0
    for elemento in cartera:
        if elemento["moneda_to"] == "EUR":
            cantidad_recuperada += elemento["cantidad_to"]
        elif elemento["moneda_to"] not in cantidades_cripto:
            cantidades_cripto[elemento["moneda_to"]] = elemento["cantidad_to"]
        else:
            cantidades_cripto[elemento["moneda_to"]] += elemento["cantidad_to"]
        if elemento["moneda_from"] == "EUR":
            cantidad_invertida += elemento["cantidad_from"]
        else:
            cantidades_cripto[elemento["moneda_from"]] -= elemento["cantidad_from"]
    return [cantidades_cripto, cantidad_invertida, cantidad_recuperada]


def obtain_change(cripto1,cripto2):
    r = requests.get("https://rest.coinapi.io/v1/exchangerate/{}/{}?apikey={}".format(cripto1, cripto2, api_key))
    resultado = r.json()
    if r.status_code == 200:
        tasa = resultado['rate']
    return tasa

#función para devolver el cambio de todas las monedas listadas en coinapi.io
def get_all_changes():
    r = requests.get("https://rest.coinapi.io/v1/assets?apikey={}".format(api_key))
    if r.status_code != 200:
        raise Exception("Error en consulta de assets: {}".format(r.status_code))
    lista_candidatas = r.json()
    return lista_candidatas

#función para trabajar la lista de movimientos y almacenar cantidades de cada cripto en cartera además de su cambio oficial
def my_investment_portfolio():
    portfolio = select_all_by_coin()
    criptos = portfolio[0]
    criptos_con_cambio = {}
    for clave, valor in criptos.items():
        #lista para almacenar cantidad, cambio unitario en euros y cantidad total
        criptos_con_cambio[clave] = [valor, 0, 0]
    euros_invertidos = portfolio[1]
    euros_recuperados = portfolio[2]
    todas_las_criptos = get_all_changes()
    total_balance = 0
    for elemento in todas_las_criptos:
        if elemento["asset_id"] == "EUR":
            change_eur_usd = elemento["price_usd"]
        if elemento["asset_id"] in criptos_con_cambio:
            criptos_con_cambio[elemento["asset_id"]][1] = float(elemento["price_usd"])
    for elemento in criptos_con_cambio:
        criptos_con_cambio[elemento][1] = criptos_con_cambio[elemento][1] * (1/change_eur_usd)
        criptos_con_cambio[elemento][2] = criptos_con_cambio[elemento][0] * criptos_con_cambio[elemento][1]
        total_balance += criptos_con_cambio[elemento][2]
    return {"invertido": round(euros_invertidos,2), "recuperado": round(euros_recuperados,2), "valor_compra": round(euros_invertidos-euros_recuperados,2), "valor_actual": round(total_balance,2)}

def insert(registro):
    conn = sqlite3.connect(ORIGIN_DATA)
    cur = conn.cursor()
    date = datetime.now()

    registro[0] = "{:04d}-{:02d}-{:02d}".format(date.year, date.month, date.day)
    registro[1] = "{:02d}:{:02d}:{:02d}".format(date.hour, date.minute, date.second)
    registro[5] = float(registro[3])*obtain_change(registro[2], registro[4])
    #lo siguiente es comando de sql, decimos los títulos de las columnas (Date, concept, quantity) y luego los valores (?, ?, ?) que es obligado, por último lo que tiene que ir en esas interrogaciones
    cur.execute("INSERT INTO movements (date, time, moneda_from, cantidad_from, moneda_to, cantidad_to) values (?, ?, ?, ?, ?, ?);", registro)
    conn.commit()

    conn.close()

def get_movement(registro):
    date = datetime.now()
    registro[0] = "{:04d}-{:02d}-{:02d}".format(date.year, date.month, date.day)
    registro[1] = "{:02d}:{:02d}:{:02d}".format(date.hour, date.minute, date.second)
    tasa = obtain_change(registro[2], registro[4])
    registro[5] = float(registro[3]) * tasa
    registro.append(tasa)
    return registro


    
    