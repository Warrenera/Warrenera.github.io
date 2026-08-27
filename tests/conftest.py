"""Provide fixtures for the test framework."""

from os import environ

import pytest  # pytest convention, see Ruff PT013
from selenium.webdriver import Firefox
from selenium.webdriver.firefox.options import Options

from tests.game_page import GamePage


@pytest.fixture
def driver() -> Firefox:
    """Instantiate the Firefox Web driver for the test.

    Gracefully close the driver after each test as well.
    """
    options = Options()
    options.add_argument("-headless")
    options.add_argument("-height=1080")
    options.add_argument("-width=1920")
    webdriver = Firefox(options=options)
    yield webdriver
    webdriver.quit()


@pytest.fixture
def page(driver: Firefox) -> GamePage:
    """Instantiate the Firefox webpage for the test."""
    url = environ.get("BASE_URL", "https://warrenera.github.io/")
    driver.get(url)
    return GamePage(driver)
