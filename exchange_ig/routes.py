from exchange_ig import app
from flask import render_template, jsonify, request
import sqlite3

from exchange_ig.models import get_movement, my_investment_portfolio, obtain_change, select_all, insert

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/v1.0/movimientos", methods=["GET"])
def all_movements():
    try:
        registros = select_all()

        return jsonify(
            {
                "status": "success",
                "data": registros
            }
        )
    except sqlite3.Error as e:
        return jsonify(
            {
                "status": "fail",
                "mensaje": str(e)
            }
        ), 400 #añadimos el tipo de error que queremos

@app.route("/api/v1.0/movimiento", methods=["POST"])
def new():
    registro = request.json
    try:
        insert([0, 0, registro["moneda_from"], registro["cantidad_from"], registro["moneda_to"], registro["cantidad_to"]])
        return jsonify(
            {
                "status": "success"
            }
        ), 201
    except sqlite3.Error as e:
        return jsonify(
            {
                "status": "fail",
                "mensaje": str(e)
            }
        ), 400

@app.route("/api/v1.0/tasa", methods=["POST"]) 
def calculate():
    registros = request.json
    try:
        operacion = get_movement([0, 0, registros["moneda_from"], registros["cantidad_from"], registros["moneda_to"], registros["cantidad_to"]])
        return jsonify(
            {
                "status": "success",
                "data": operacion
            }
        ), 201
    except sqlite3.Error as e:
        return jsonify(
            {
                "status": "fail",
                "mensaje": str(e)
            }
        ), 400

@app.route("/api/v1.0/estado_inversion", methods=["GET"])
def balance():
    try:
        valor_compra = my_investment_portfolio()

        return jsonify(
            {
                "status": "success",
                "data": valor_compra
            }
        ), 200
    except sqlite3.Error as e:
        return jsonify(
            {
                "status": "Error",
                "mensaje": str(e)
            }
        ), 400
