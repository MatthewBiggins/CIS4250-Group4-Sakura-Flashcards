import { Builder, By, Locator, until, WebDriver } from 'selenium-webdriver';
import * as chrome from 'selenium-webdriver/chrome';
import 'chromedriver';
import { exec, spawn } from 'child_process';
import axios from 'axios';
import { doc, getDoc, deleteDoc, collection, query, where, getDocs, and } from 'firebase/firestore';
import db from "../firebase/configuration";

const chromeOptions = new chrome.Options();
chromeOptions.addArguments('--no-sandbox');
chromeOptions.addArguments('--disable-dev-shm-usage');

// Utility to wait for the server to be ready
function waitForServer(url: string, retries = 6, delay = 5000): Promise<void> {
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

    async function getElementExists(locator: Locator) {
        let elements = await driver.findElements(locator);
        return elements.length > 0;
    }

    async function login() {
        // Navigate to login page
        await driver.get('http://localhost:3000/login');
        
        // Find html element with id='email'
        let emailInput = await driver.findElement(By.id('email'));
        // Simulate typing email into input box
        await emailInput.sendKeys('test@gmail.com');
        
        let passwordInput = await driver.findElement(By.id('password'));
        await passwordInput.sendKeys('test');
        
        // Find submit button, simulate click
        let submitButton = await driver.findElement(By.css('button[type="submit"]'));
        await submitButton.click();

        // Wait for the URL to be the expected dashboard URL
        await driver.wait(until.urlIs('http://localhost:3000/dashboard'), 5000);

        // Check the HTTP status code to verify it is 200
        const response = await axios.get('http://localhost:3000/dashboard');
        expect(response.status).toBe(200);
    }
    beforeAll(async () => {
        // Start the server using `npm run dev`
        serverProcess = spawn('npm', ['run', 'dev'])
        serverProcess.on('error', (err: string) => console.error("Error starting server: " + err))
        
        // Wait for the server to be available
        await waitForServer('http://localhost:3000');
    }, 120000);

    beforeEach(async () => {
        driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(chromeOptions)
            .build();
    }, 120000);

    it('Load page', async () => {
        await driver.get('http://localhost:3000/');
        await driver.findElement(By.id('login'));
        await driver.findElement(By.id('signup'));
    }, 20000);

    it('Login and verify redirection status code 200', async () => {
        await login();

        const logOutLink = await driver.findElement(By.id('logout'));
        
        let loginFound = await getElementExists(By.id('login'));
        let signupFound = await getElementExists(By.id('signup'));

        // Check that logout link exists, login and signup are gone
        expect(logOutLink).toBe(true);
        expect(loginFound).toEqual(false);
        expect(signupFound).toEqual(false);
    }, 20000);

    it('Logout and verify redirection status code 200', async () => {
        await login();
        
        await driver.get('http://localhost:3000/');
        
        let logoutButton = await driver.findElement(By.id('logout'));
        await logoutButton.click();
        
        let loginFound = await getElementExists(By.id('login'));
        let signupFound = await getElementExists(By.id('signup'));
        let logoutFound = await getElementExists(By.id('logout'));
        
        expect(loginFound).toBe(true);
        expect(signupFound).toBe(true);
        expect(logoutFound).toBe(false);
    }, 20000);


    const USERNAME = 'seleniumTest';
    const EMAIL = 'selenium@test.com';
    const PASSWORD = 'password'; 
    const usersRef = collection(db, "users");
    const usernameQuery = query(
        usersRef,
        and(where("username", "==", USERNAME), where("email", "==", EMAIL))
      );

    it('Create account', async () => {
      const testUserEmpty = (await getDocs(usernameQuery)).empty;

      expect(testUserEmpty).toBe(true);
      
        await driver.get('http://localhost:3000/sign-up');
        
        let signupButton = await driver.findElement(By.id('signup'));
        await signupButton.click();
        
        let userInput = await driver.findElement(By.id('username'));
        await userInput.sendKeys(USERNAME);
        let emailInput = await driver.findElement(By.id('email'));
        await emailInput.sendKeys(EMAIL);
        let passInput = await driver.findElement(By.id('password'));
        await passInput.sendKeys(PASSWORD);
        let pass2Input = await driver.findElement(By.id('password2'));
        await pass2Input.sendKeys(PASSWORD);

        let submitButton = await driver.findElement(By.css('button[type="submit"]'));
        await submitButton.click();
        
        await driver.wait(until.urlIs('http://localhost:3000/dashboard'), 5000);
      
      const usernameSnapshot = await getDocs(usernameQuery);

      expect(usernameSnapshot.empty).toBe(false);
    }, 20000);

    afterEach(async () => {
        await driver.quit();
        console.log('Browser closed');
    });

    afterAll(async () => {
        // Delete any users created by tests
        const usernameSnapshot = await getDocs(usernameQuery);
        usernameSnapshot.forEach(async doc => {
            await deleteDoc(doc.ref);
        });

        // Kill the server process after the tests are done
        await serverProcess.kill('SIGINT');
        console.log('Server stopped');
    });
});
