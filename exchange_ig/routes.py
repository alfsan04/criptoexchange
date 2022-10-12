from exchange_ig import app
from flask import render_template, jsonify, request
import sqlite3
from http import HTTPStatus

from exchange_ig.models import select_all

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/v1.0/all")
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