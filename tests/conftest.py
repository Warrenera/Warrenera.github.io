"""Provide fixtures for the test framework."""

import threading
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from time import sleep

import pytest  # pytest convention, see Ruff PT013
import requests
from dotenv import dotenv_values
from selenium.webdriver import Firefox
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.remote.webelement import WebElement

from tests.game_page import GamePage


@pytest.fixture(autouse=True, scope="session")
def server() -> str:
    """Spin up a local web server if the BASE_URL is a local address.

    Use a BASE_URL of 'http://127.0.0.1:8000' to test game changes
    locally. Can use the GitHub Pages URL if just testing test framework
    changes. Defaults to the GitHub Pages URL. Yields the webpage URL.
    """
    env = dotenv_values("./.env")
    url = env.get("BASE_URL", "https://warrenera.github.io").rstrip("/")
    if localhost := url == "http://127.0.0.1:8000":
        print(f"INFO: URL set to '{url}'. Using local http.server")
        path = Path("./_site").resolve()
        if not path.exists():
            raise FileNotFoundError(path)

        server_address = ("127.0.0.1", 8_000)
        handler_factory = partial(SimpleHTTPRequestHandler, directory=path)
        httpd = ThreadingHTTPServer(server_address, handler_factory)

        server_thread = threading.Thread(daemon=True, target=httpd.serve_forever)
        server_thread.start()
        sleep(1)

    yield url

    if localhost:
        httpd.shutdown()
        server_thread.join()


@pytest.fixture
def driver(request: pytest.FixtureRequest) -> Firefox:
    """Instantiate the Firefox Web driver for the test.

    Gracefully close the driver after each test as well.
    """
    options = Options()
    options.add_argument("-headless")
    options.add_argument("-height=1080")
    options.add_argument("-width=1920")
    if "requires_clipboard" in request.keywords:
        # Only for marked tests as it's a security concern
        options.set_preference(name="dom.events.testing.asyncClipboard", value=True)
    webdriver = Firefox(options=options)
    yield webdriver
    webdriver.quit()


@pytest.fixture
def page(driver: Firefox, server: str) -> GamePage:
    """Instantiate the Firefox webpage for the test."""
    driver.get(server)
    return GamePage(driver)


@pytest.fixture
def initial_squares(page: GamePage) -> list[WebElement]:
    """Find all the squares on the game board.

    Called the initial squares because if a category is revealed in a
    row then the squares need to be refound as the remaining topics will
    have been moved down.
    """
    return page.find_all(page.SQUARES)


@pytest.fixture
def categories(server: str) -> list[dict]:
    """Get the categories JSON file from the site to have handy."""
    return requests.get(timeout=5, url=f"{server}/topics.json").json()


@pytest.fixture
def categories_chosen(initial_squares: list[WebElement], categories: list[dict]) -> list[dict]:
    """Return categories that match text present in the game squares.

    All four topics for a category must match for it to count.
    """
    square_texts = [square.text for square in initial_squares]
    return [
        category
        for category in categories
        if all(topic in square_texts for topic in category["topics"])
    ]
