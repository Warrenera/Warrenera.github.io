# ruff: noqa: ANN201, CPY001, INP001, S101
"""Test the UI for cAnnections using pytest and Selenium.

Silenced Ruff checks:
    - ANN201: None of the test functions should return anything. It
              wouldn't add anything but visual clutter.
    - CPY001: Not needed. See LICENSE
    - INP001: It's fine.
    -   S101: There's going to be a lot of assertions in this file.
"""

import pytest  # pytest convention, see Ruff PT013
from page import Page  # First-party, import the POM
from selenium.webdriver import Firefox
from selenium.webdriver.firefox.options import Options


# Fixtures
@pytest.fixture
def driver() -> Firefox:
    options = Options()
    options.add_argument("--headless")
    return Firefox(options=options)


@pytest.fixture(autouse=True)
def page(driver: Firefox) -> Page:
    driver.get("https://warrenera.github.io")
    return Page(driver)


# Tests
def test_title():
    assert driver.title == "cAnnections: Connections, but about us"


def test_page_structure():
    assert True


driver.quit()
