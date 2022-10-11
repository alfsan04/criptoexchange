from exchange_ig import app

@app.route("/")
def index():
    return "Servidor levantado!!!"