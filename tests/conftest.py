# ruff: noqa: CPY001
"""."""

import pytest  # pytest convention, see Ruff PT013
from page import Page  # First-party, import the POM
from selenium.webdriver import Firefox
from selenium.webdriver.firefox.options import Options


@pytest.fixture
def driver() -> Firefox:
    options = Options()
    options.add_argument("--headless")
    webdriver = Firefox(options=options)
    yield webdriver
    webdriver.quit()


@pytest.fixture(autouse=True)
def page(driver: Firefox) -> Page:
    driver.get("https://warrenera.github.io")
    return Page(driver)
