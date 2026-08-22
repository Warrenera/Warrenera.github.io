# ruff: noqa: CPY001
"""Page object model for https://warrenera.github.io."""

from selenium.webdriver import Firefox
from selenium.webdriver.common.by import By

from tests.base_page import BasePage


class GamePage(BasePage):
    """Represent the cAnnections game page.

    Silenced Ruff checks
    --------------------
    - ANN204: (in-line) __init__() always returns None.
    - S101:   This is test framework code, assertions are necessary.
    """

    url = "https://warrenera.github.io"
    title = "cAnnections: Connections, but about us"

    # Static Locators
    DESELECT = (By.ID, "deselect")
    SHARE = (By.ID, "share")
    SHUFFLE = (By.ID, "shuffle")
    SUBMIT = (By.ID, "submit")
    SUMMARY = (By.ID, "summary")

    def __init__(self, driver: Firefox, timeout: int = 10):  # noqa: ANN204
        """Initialize the BasePage, then determine if on the game page.

        This is the one assertion allowed, and even recommended, by
        Selenium to be present in a page object:
        https://www.selenium.dev/documentation/test_practices/encouraged/page_object_models#assertions-in-page-objects
        """
        super().__init__(driver, timeout)
        cleaned_url = self.driver.current_url.rstrip("/")
        assert cleaned_url == self.url, (  # noqa: S101
            "This is not the right page! Expected cAnnections, "
            f"but the current page is {self.driver.current_url}"
        )

    def deselect_all(self) -> None:
        """Click the 'Deselect All' button, unselecting all buttons."""
        self.click(self.DESELECT)

    def refresh(self) -> None:
        """Refresh the page, resetting the game with new categories.

        Calls the parent method as this one is just here for the
        GamePage-specific docstring.
        """
        super().refresh()

    def select_square(self, square_id: str) -> None:
        """Toggle selection of a category choice button.

        Locator is dynamically constructed to avoid having 16 identical
        locators, one for each square on the game board.
        """
        sid = "square_" + square_id
        square_locator = (By.ID, sid)
        self.click(square_locator)

    def share(self) -> None:
        """Click the Share button.

        This copies text to the clipboard if the navigator.share()
        object is unreachable, i.e., from the desktop.
        """
        self.click(self.SHARE)

    def shuffle(self) -> None:
        """Click the shuffle button, mixing up the category squares.

        Also deselect any currently selected squares.
        """
        self.click(self.SHUFFLE)

    def submit(self) -> None:
        """Click the Submit button to see if the choices were right."""
        self.click(self.SUBMIT)

    def toggle_details(self) -> None:
        """Toggle appearance of the header details drop-down menu."""
        self.click(self.SUMMARY)
