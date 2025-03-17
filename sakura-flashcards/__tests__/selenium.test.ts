import { Builder, By, Key, until } from 'selenium-webdriver';
import * as chrome from 'selenium-webdriver/chrome';
import 'chromedriver';
import TestServer from './test-server';

function wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

async function runSeleniumTest() {
    const chromeOptions = new chrome.Options();
    chromeOptions.addArguments('--no-sandbox');
    chromeOptions.addArguments('--disable-dev-shm-usage');

    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(chromeOptions)
        .build();

    try {
        console.log("Start test");
        // Navigate to Google
        await driver.get('http://localhost:3000/');
        await wait(3000);
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
    console.log(require("path"));
    beforeAll(async () => {
        await TestServer.start();
    });

    it('Load page', async () => {
      await runSeleniumTest();
    }, 20000);

    afterAll(async () => {
        await TestServer.stop();

        
    });
  });