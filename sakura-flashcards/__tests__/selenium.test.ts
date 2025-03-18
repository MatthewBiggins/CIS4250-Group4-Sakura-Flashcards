import {Browser, Builder, WebDriver} from 'selenium-webdriver';
import TestServer from './test-server';

function wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

describe('Selenium test', () => {
    var driver: WebDriver;
    beforeEach(async () => {
        driver = await new Builder()
                        .forBrowser(Browser.FIREFOX)
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