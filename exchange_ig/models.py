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

    return resultado

def obtain_change(cripto1,cripto2):
    r = requests.get("https://rest.coinapi.io/v1/exchangerate/{}/{}?apikey={}".format(cripto1, cripto2, api_key))
    resultado = r.json()
    if r.status_code == 200:
        tasa = resultado['rate']
    return tasa

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


    
    