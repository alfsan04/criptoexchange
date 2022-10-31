# Aplicación para simular la compra y venta de criptomonedas
   * Con esta aplicación web en local podrás simular la compra y venta de criptomonedas con precio en tiempo real.
   * Para mayor similitud con un exchange al uso se ha puesto una tasa a cada intercambio de cripto, de forma que sea más complejo obtener beneficios con múltiples intercambios.
   * Las criptomonedas existentes en esta aplicación son: BTC, ETH, USDT, BNB, XRP, ADA, DOT y MATIC.
   * La moneda FIAT utilizada para la aplicación es el euro (EUR).

### 1- Crea un entorno virtual
   * Se recomienda crear un entorno virtual para todo el proceso de instalación y ejecución de la aplicación.
___

### 2- Para instalar las dependencias, _"requirements.txt"._
    pip install -r requirements.txt
___        

### 3- Crea una base de datos para registrar movimientos. Usa el fichero  _"/data/create.sql"._
  #### Para hacerlo desde el terminal sigue estos pasos: 
    sqlite3 Nombre_base_datos.db
    .read data/create.sql
    .q

  #### También puedes crearlo directamente en un gestor de bases de datos, como DB Browser SQLite
   * Para ello utiliza la información de creación de tabla de data/create.sql en el directorio de esta aplicación.
___

### 4- Obtener una clave para usar la API de coinapi.io
   * Entra en coinapi.io y consigue una api gratuita, te permitirá 100 consultas diarias.
___

### 5- Modificación del fichero config_template.py
   * Modificar ORIGIN_DATA -> Añade tu ruta al fichero sqlite
   * Modificar APIKEY -> Introduce tu apikey obtenida en coinapi.io
   * Renombrar el fichero config_template.py por config.py
___

### 6- Modificación del fichero .env_template
  * Fija el estado de FLASK_DEBUG como True
  * Renombra el fichero .env_template por .env
___
### 7- Activar servidor flask 
   * Utiliza el comando _Flask run_ para activar el servidor local con flask. Recuerda activar el entorno virtual si lo creaste

### 8- Acceder a la aplicación desde el navegador
   * Abre tu navegador y accede a la aplicación introduciendo la ruta http://localhost seguida del puerto de acceso (generalmente 5000) -> http://localhost:5000