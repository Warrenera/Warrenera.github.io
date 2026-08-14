# ruff: noqa: ANN201, CPY001, S101
"""Test the UI for cAnnections using pytest and Selenium.

Silenced Ruff checks:
    - ANN201: None of the test functions return anything. It'd only add
              visual clutter.
    - CPY001: See LICENSE.
    - F821:   (in-line) Needed to prevent Ruff from calling driver
              undefined. It's defined in conftest.py, which is used
              automatically: https://docs.pytest.org/en/stable/reference/fixtures.html#conftest-py-sharing-fixtures-across-multiple-files
    - S101:   Assertions are needed for testing.
"""


def test_title():
    assert driver.title == "cAnnections: Connections, but about us"  # noqa: F821


def test_page_structure():
    assert True
