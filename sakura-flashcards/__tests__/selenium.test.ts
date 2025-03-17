import { Builder, By, Key, until, WebDriver } from 'selenium-webdriver';
import * as chrome from 'selenium-webdriver/chrome';
import 'chromedriver';
import TestServer from './test-server';

const chromeOptions = new chrome.Options();
chromeOptions.addArguments('--no-sandbox');
chromeOptions.addArguments('--headless');
chromeOptions.addArguments('--disable-dev-shm-usage');


function wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

describe('Selenium test', () => {
    var driver: WebDriver;
    beforeEach(async () => {
        driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(chromeOptions)
            .build();
    });

    beforeAll(async () => {
        await TestServer.start();
    });

    it('Load page', async () => {
        await driver.get('http://localhost:3000/');
        await wait(3000);
    }, 20000);

    afterEach(async () => {
        await driver.quit();
        console.log('Browser closed');
    });

    afterAll(async () => {
        await TestServer.stop();
    });
  });