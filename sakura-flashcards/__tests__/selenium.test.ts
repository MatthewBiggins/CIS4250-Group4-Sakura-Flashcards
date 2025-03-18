import {Browser, Builder, WebDriver} from 'selenium-webdriver';
import TestServer from './test-server';

function wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

describe('Selenium test', () => {
    var driver: WebDriver;
    beforeEach(async () => {
        driver = await new Builder()
                        .forBrowser(Browser.CHROME)
                        .build();
        console.log("DRIVER");
        console.log(driver.getExecutor);
    }, 120000);

    beforeAll(async () => {
        await TestServer.start();
    });

    it('Load page', async () => {
        await driver.get('http://localhost:3000/');
        await wait(3000);
    }, 20000);
  });