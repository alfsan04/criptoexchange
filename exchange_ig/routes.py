from exchange_ig import app
from flask import render_template, jsonify, request
import sqlite3
from http import HTTPStatus

from exchange_ig.models import my_investment_portfolio, select_all, insert

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/v1.0/all", methods=["GET"])
def all_movements():
    try:
        registros = select_all()

        return jsonify(
            {
                "data": registros,
                "status": "OK"
            }
        )
    except sqlite3.Error as e:
        return jsonify(
            {
                "status": "Error",
                "data": str(e)
            }
        ), 400 #añadimos el tipo de error que queremos

@app.route("/api/v1.0/new", methods=["POST"])
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
                "status": "Error",
                "data": str(e)
            }
        ), HTTPStatus.BAD_REQUEST

@app.route("/api/v1.0/balance", methods=["GET"])
def balance():
    try:
        valor_compra = my_investment_portfolio()

        return jsonify(
            {
                "data": valor_compra,
                "status": "OK"
            }
        )
    except sqlite3.Error as e:
        return jsonify(
            {
                "status": "Error",
                "data": str(e)
            }
        ), 400
