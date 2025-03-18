import { Builder, By, until, WebDriver } from 'selenium-webdriver';
import * as chrome from 'selenium-webdriver/chrome';
import 'chromedriver';
import { exec } from 'child_process';
import axios from 'axios';

const chromeOptions = new chrome.Options();
chromeOptions.addArguments('--no-sandbox');
chromeOptions.addArguments('--headless');
chromeOptions.addArguments('--disable-dev-shm-usage');

// Utility to wait for the server to be ready
function waitForServer(url: string, retries = 5, delay = 1000): Promise<void> {
    return new Promise((resolve, reject) => {
        const check = async () => {
            for (let i = 0; i < retries; i++) {
                try {
                    const response = await axios.get(url);
                    if (response.status === 200) {
                        resolve(); // Server is up
                        return;
                    }
                } catch (error) {
                    console.log(`Waiting for server... Attempt ${i + 1}`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
            reject(new Error('Server is not ready after multiple attempts'));
        };
        check();
    });
}

describe('Selenium test', () => {
    let driver: WebDriver;
    let serverProcess: any;

    beforeAll(async () => {
        // Start the server using `npm run dev`
        serverProcess = exec('npm run dev', (err: any, stdout: string, stderr: string) => {
            if (err) {
                console.error(`Error starting server: ${stderr}`);
            }
            console.log(`Server output: ${stdout}`);
        });

        // Wait for the server to be available
        await waitForServer('http://localhost:3000');
    }, 120000);

    beforeEach(async () => {
        driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(chromeOptions)
            .build();
    });

    it('Load page', async () => {
        await driver.get('http://localhost:3000/');
    }, 20000);

    it('Login and verify redirection status code 200', async () => {
        await driver.get('http://localhost:3000/login');
        
        let emailInput = await driver.findElement(By.id('email'));
        await emailInput.sendKeys('test@gmail.com');
        
        let passwordInput = await driver.findElement(By.id('password'));
        await passwordInput.sendKeys('test');
        
        let submitButton = await driver.findElement(By.css('button[type="submit"]'));
        await submitButton.click();

        // Wait for the URL to be the expected dashboard URL
        await driver.wait(until.urlIs('http://localhost:3000/dashboard'), 5000);

        // Check the HTTP status code to verify it is 200
        const response = await axios.get('http://localhost:3000/dashboard');
        expect(response.status).toBe(200);

        const logOutLink = await driver.findElement(By.css('a.link.p-2[href="/"]'));
        
        // Check if the 'Log Out' link is present and visible
        const isLogOutLinkDisplayed = await logOutLink.isDisplayed();
        expect(isLogOutLinkDisplayed).toBe(true);
    }, 20000);

    afterEach(async () => {
        await driver.quit();
        console.log('Browser closed');
    });

    afterAll(async () => {
        // Kill the server process after the tests are done
        serverProcess.kill('SIGINT');
        console.log('Server stopped');
    });
});
