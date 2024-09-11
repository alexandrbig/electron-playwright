import type { ElectronApplication, Page, } from '@playwright/test';
import {
    expect,
    test,
} from '@playwright/test';
import type { Menu } from 'electron';
import { clickMenuItem, getElectronApp, mockedDialog } from './utils';

let electronApp: ElectronApplication;
let appWindow: Page;
let menu: Menu | null = null;

test.beforeAll(async ({ }, testInfo) => {
    electronApp = await getElectronApp(testInfo);
    appWindow = await electronApp.waitForEvent('window', (event) => {
        return event.url().includes('index.html');
    });
    menu = await electronApp.evaluate(async ({ Menu }) => {
        return Menu.getApplicationMenu();
    });
});

test.afterAll(async ({ }, testInfo) => {
    await appWindow.screenshot({ path: testInfo.outputPath(`intro-${electronApp.windows().length}.png`) });
    await electronApp.close();
});


test('test menu click', async () => {
    const { dialogOptions, dialogControlHandler } = await mockedDialog(electronApp, { method: 'showMessageBox' });
    const { dialogOptions: o1 } = await mockedDialog(electronApp, { method: 'showMessageBoxSync', value: 1 });
    await clickMenuItem(electronApp, 'test');
    console.log(await dialogOptions);
    await dialogControlHandler.evaluate(({ resolve }) => resolve({ response: 1, checkboxChecked: false }));
    const { title } = await o1;
    expect(title).toBe('OK');
});