# Bronnen:
# - flask.palletsprojects.com (01/04/2026)
# - requests.readthedocs.io (01/04/2026)
# - my-json-server.typicode.com (01/04/2026)
# - Claude (2026) - claude-sonnet-4-6 - https://claude.ai

import requests
from flask import Flask, render_template, abort, request

app = Flask(__name__)

API_BASE = "https://my-json-server.typicode.com/arbwld/json-api"


def fetchData(endpoint):
    response = requests.get(f"{API_BASE}/{endpoint}")
    if response.status_code == 200:
        return response.json()
    return []


def findById(items, itemId):
    return next((item for item in items if item["id"] == itemId), None)


@app.route("/")
def index():
    drivers = fetchData("drivers")
    cars = fetchData("cars")
    return render_template("index.html", driverCount=len(drivers), carCount=len(cars))


@app.route("/drivers")
def drivers():
    driverList = fetchData("drivers")
    return render_template("drivers.html", drivers=driverList)


@app.route("/drivers/<int:driverId>")
def driverDetail(driverId):
    driverList = fetchData("drivers")
    carList = fetchData("cars")

    driver = findById(driverList, driverId)
    if not driver:
        abort(404)

    car = findById(carList, driver.get("carId"))
    return render_template("driver_detail.html", driver=driver, car=car)


@app.route("/cars")
def cars():
    carList = fetchData("cars")
    return render_template("cars.html", cars=carList)


@app.route("/cars/<int:carId>")
def carDetail(carId):
    carList = fetchData("cars")
    car = findById(carList, carId)
    if not car:
        abort(404)
    fromPage = request.args.get('from', 'cars')
    return render_template("car_detail.html", car=car, fromPage=fromPage)


if __name__ == "__main__":
    app.run(debug=True)
