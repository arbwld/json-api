# Bronnen:
# - requests.readthedocs.io (01/04/2026)
# - my-json-server.typicode.com (01/04/2026)
# - Claude (2026) - claude-sonnet-4-6 - https://claude.ai

import requests

API_BASE = "https://my-json-server.typicode.com/arbwld/json-api"


def fetchData(endpoint):
    response = requests.get(f"{API_BASE}/{endpoint}")
    if response.status_code == 200:
        return response.json()
    print(f"Fout bij ophalen van {endpoint}: {response.status_code}")
    return []


def printDrivers(drivers):
    print(f"\n{'=' * 50}")
    print(f"RALLY DRIVERS ({len(drivers)} gevonden)")
    print(f"{'=' * 50}")
    for driver in drivers:
        print(f"  {driver['id']}. {driver['name']} ({driver['nationality']})")
        print(f"     Kampioenschappen : {driver['championships']}")
        print(f"     Iconische auto   : {driver['mostIconicCar']}")
        print(f"     Actief           : {driver['activeYears']}")
        print()


def printCars(cars):
    print(f"\n{'=' * 50}")
    print(f"RALLY CARS ({len(cars)} gevonden)")
    print(f"{'=' * 50}")
    for car in cars:
        legendary = "★ Legende" if car['legendary'] else ""
        print(f"  {car['id']}. {car['name']} ({car['year']}) {legendary}")
        print(f"     Klasse   : {car['class']}")
        print(f"     Vermogen : {car['horsepower']} pk")
        print(f"     Aandrijf : {car['drivetrain']}")
        print()


def main():
    print("Rally API - Data ophalen...")

    drivers = fetchData("drivers")
    cars = fetchData("cars")

    printDrivers(drivers)
    printCars(cars)

    print(f"Klaar! {len(drivers)} rijders en {len(cars)} auto's opgehaald.")


if __name__ == "__main__":
    main()
