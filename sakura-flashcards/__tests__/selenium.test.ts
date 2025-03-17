import { Builder, By, Key, until } from 'selenium-webdriver';
import * as chrome from 'selenium-webdriver/chrome';
import 'chromedriver';


async function runSeleniumTest() {
    const chromeOptions = new chrome.Options();
    // chromeOptions.addArguments('--headless');
    chromeOptions.addArguments('--no-sandbox');
    chromeOptions.addArguments('--disable-dev-shm-usage');

    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(chromeOptions)
        .build();

    try {
        console.log("Start test");
        // Navigate to Google
        await driver.get('https://www.google.com');
        console.log('Navigated to Google');

        // Find the search box
        const searchBox = await driver.findElement(By.name('q'));
        
        // Enter search term and submit
        await searchBox.sendKeys('Selenium TypeScript Test', Key.RETURN);
        console.log('Performed search');

        // Wait for CAPTCHA
        await driver.wait(until.elementLocated(By.id('captcha-form')), 10000);
        console.log('CAPTCHA detected after search! Cannot proceed with automated testing.');

    } catch (error) {
        console.error('An error occurred:', error);
        const pageSource = await driver.getPageSource();
        console.log('Page source snippet:', pageSource.substring(0, 200));
        
    } finally {
        await driver.quit();
        console.log('Browser closed');
    }
}
describe('Selenium test', () => {
    it('should handle async operations', async () => {
      await runSeleniumTest();
    }, 30000);
  });