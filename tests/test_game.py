# ruff: noqa: ANN201, CPY001, S101
"""Test the UI for cAnnections using pytest and Selenium.

Silenced Ruff checks
--------------------
- ANN201: None of the test functions return anything. It'd only add
          visual clutter.
- CPY001: See LICENSE.
- S101:   Assertions are necessary as this is a test framework.
"""


def test_title(page):
    assert page.title == "cAnnections: Connections, but about us"


def test_page_structure():
    assert True
