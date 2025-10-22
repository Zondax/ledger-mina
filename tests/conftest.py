from ragger.conftest import configuration
from ragger.navigator import NavInsID
import pytest

###########################
### CONFIGURATION START ###
###########################

# You can configure optional parameters by overriding the value of ragger.configuration.OPTIONAL_CONFIGURATION
# Please refer to ragger/conftest/configuration.py for their descriptions and accepted values
configuration.OPTIONAL.BACKEND_SCOPE = "class"

configuration.OPTIONAL.CUSTOM_SEED = "course grief vintage slim tell hospital car maze model style elegant kitchen state purpose matrix gas grid enable frown road goddess glove canyon key"

#########################
### CONFIGURATION END ###
#########################

# Pull all features from the base ragger conftest using the overridden configuration
pytest_plugins = ("ragger.conftest.base_conftest", )

def pytest_addoption(parser):
    parser.addoption(
        "--all", action="store_true", default=False, help="Run all tests including crypto tests (not for release builds)"
    )

def pytest_configure(config):
    config.addinivalue_line("markers", "all: only run for not release builds")

def pytest_collection_modifyitems(config, items):
    if config.getoption("--all"):
        return
    skip = pytest.mark.skip(reason="Use --all flag to run")
    for item in items:
        if "all" in item.keywords:
            item.add_marker(skip)

class PreauthNavigator:
    def __init__(self, navigator, firmware, default_screenshot_path, test_name):
        self.navigator = navigator
        self.firmware = firmware
        self.default_screenshot_path = default_screenshot_path
        self.test_name = test_name

    def navigate(self):
        if self.firmware.is_nano:
            self.navigator.navigate_until_text_and_compare(navigate_instruction=NavInsID.RIGHT_CLICK,
                                                           validation_instructions=[NavInsID.BOTH_CLICK],
                                                           text="Generate",
                                                           path=self.default_screenshot_path,
                                                           test_case_name=self.test_name + "_preauth",
                                                           screen_change_after_last_instruction=False)

@pytest.fixture(scope="function")
def preauth_navigator(navigator, firmware, default_screenshot_path, test_name) -> PreauthNavigator:
    return PreauthNavigator(navigator, firmware, default_screenshot_path, test_name)

class DeviceSpecificScenarioNavigator:
    """Wrapper around scenario_navigator that fixes ragger 1.40.2 navigation issues"""
    def __init__(self, original_navigator, firmware):
        self._original = original_navigator
        self._firmware = firmware
        
    def review_approve(self, **kwargs):
        """Device-specific review_approve that handles ragger 1.40.2 navigation"""
        # For all nano devices with ragger 1.40.2, override the text pattern to match what Zemu uses
        if hasattr(self._firmware, 'is_nano') and self._firmware.is_nano:
            kwargs['custom_screen_text'] = 'Approve'
        return self._original.review_approve(**kwargs)
        
    def address_review_approve(self, **kwargs):
        """Delegate address review to original navigator"""
        return self._original.address_review_approve(**kwargs)
        
    def __getattr__(self, name):
        """Delegate all other methods to original navigator"""
        return getattr(self._original, name)

@pytest.fixture(scope="function")
def scenario_navigator(scenario_navigator, firmware):
    """Override scenario_navigator with device-specific wrapper"""
    return DeviceSpecificScenarioNavigator(scenario_navigator, firmware)
