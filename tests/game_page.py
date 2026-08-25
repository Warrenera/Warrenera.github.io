# ruff: noqa: ANN201
"""Page object model for https://warrenera.github.io/.

Silenced Ruff checks
--------------------
- ANN201: None of the POM functions return anything. It'd only add
          visual clutter
- ANN204: (in-line) __init__() always returns None
- S101:   (in-line) Assertions are necessary as this is a test framework
"""

from selenium.webdriver import Firefox
from selenium.webdriver.common.by import By

from tests.base_page import BasePage


class GamePage(BasePage):
    """Represent the cAnnections game page."""

    url = "https://warrenera.github.io/"
    title = "cAnnections: Connections, but about us"

    # Static Locators
    DESELECT = (By.ID, "deselect")
    FOOTER = (By.ID, "footer")
    HEADER = (By.ID, "header")
    ROWS = (By.ID, "rows")
    SHARE = (By.ID, "share")
    SHUFFLE = (By.ID, "shuffle")
    SUBMIT = (By.ID, "submit")
    SUMMARY = (By.ID, "summary")

    def __init__(self, driver: Firefox, timeout: int = 5):  # noqa: ANN204
        """Initialize the BasePage, then determine if on the game page.

        This is the one assertion allowed, and even recommended, by
        Selenium to be present in a page object:
        https://www.selenium.dev/documentation/test_practices/encouraged/page_object_models#assertions-in-page-objects
        """
        super().__init__(driver, timeout)
        self._verify_page()

    def _verify_page(self) -> None:
        """Check the page and all its components loaded correctly."""
        self.verify_url()
        # TODO: commented locators fail until their IDs are deployed
        for element in (self.ROWS,):  # self.HEADER, self.FOOTER):
            assert self.find(element), (  # noqa: S101
                f"ERROR: critical element with ID '{element[1]}' "
                "did not load properly. Try increasing the timeout"
            )

    def deselect_all(self):
        """Click the 'Deselect All' button, unselecting all buttons."""
        self.click(self.DESELECT)

    def refresh(self):
        """Refresh the page, resetting the game with new categories.

        Calls the parent method as this one is just here for the
        GamePage-specific docstring.
        """
        super().refresh()

    def select_square(self, square_id: str):
        """Toggle selection of a category choice button.

        Locator is dynamically constructed to avoid having 16 identical
        locators, one for each square on the game board.
        """
        sid = "square_" + square_id
        square_locator = (By.ID, sid)
        self.click(square_locator)

    def share(self):
        """Click the Share button.

        This copies text to the clipboard if the navigator.share()
        object is unreachable, i.e., from the desktop.
        """
        self.click(self.SHARE)

    def shuffle(self):
        """Click the shuffle button, mixing up the category squares.

        Also deselect any currently selected squares.
        """
        self.click(self.SHUFFLE)

    def submit(self):
        """Click the Submit button to see if the choices were right."""
        self.click(self.SUBMIT)

    def toggle_details(self):
        """Toggle appearance of the header details drop-down menu."""
        self.click(self.SUMMARY)
