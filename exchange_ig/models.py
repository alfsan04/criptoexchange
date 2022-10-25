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
    total_balance = 0
    portfolio = []
    cartera = select_all()
    euros_invertidos = 0
    euros_recuperados = 0
    for elemento in cartera:
        contenida = False
        if elemento["moneda_from"] == "EUR":
            euros_invertidos += elemento["cantidad_from"]
        if elemento["moneda_to"] == "EUR":
            euros_recuperados += elemento["cantidad_to"]
        for posicion in portfolio:
            if posicion[0] == elemento["moneda_from"]:
                posicion[1] -= elemento["cantidad_from"]
            if posicion[0] == elemento["moneda_to"]:
                posicion[1] += elemento["cantidad_to"]
                contenida = True
        if contenida == False:
            #creo una lista con 4 posiciones para guardar el elemento, la cantidad que tengo y más adelante el cambio unitario y la cantidad total en EUR
            portfolio.append([elemento["moneda_to"], elemento["cantidad_to"], 0, 0])
    #introducimos el cambio en el momento de la petición
    criptos = get_all_changes()
    for elemento in criptos:
        if elemento["asset_id"] == "EUR":
            change_eur_usd = elemento["price_usd"]
        if elemento["type_is_crypto"] == 1:
            for posicion in portfolio:
                if posicion[0] == elemento["asset_id"]:
                    posicion[2] = elemento["price_usd"]
    #introduzco la cantidad de la posición en euros en la posición 3 de la lista
    for posicion in portfolio:
        posicion[3] = posicion[1]*((1/change_eur_usd)*posicion[2])
        total_balance += posicion[3]

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


    
    