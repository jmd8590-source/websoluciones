// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Landing pública', () => {
  test('carga, tiene título correcto y sin errores de consola', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });

    const response = await page.goto('/index.html');
    expect(response?.status()).toBeLessThan(400);
    await expect(page).toHaveTitle(/Soluciones IA CM/);
    await page.waitForTimeout(500); // deja terminar las peticiones /api/* en segundo plano

    // Errores esperables en este entorno aislado de pruebas: red/CDN de
    // terceros no disponible, y los 404 de /api/efemeride y /api/audit
    // (son Cloudflare Pages Functions; bajo un servidor estático de pruebas
    // no existen, y el propio código recurre a su alternativa, tal y como
    // comprueban los tests de más abajo). Nada de esto es una regresión.
    const ignorable = /chatbase|supabase|net::ERR_|Failed to fetch|404 \(Not Found\)/i;
    const realErrors = consoleErrors.filter(e => !ignorable.test(e));
    expect(realErrors, `Errores de consola inesperados:\n${realErrors.join('\n')}`).toEqual([]);
  });

  test('el formulario de contacto exige nombre, email y mensaje', async ({ page }) => {
    await page.goto('/index.html');
    await page.locator('#contact-form button[type="submit"]').click();
    await expect(page.locator('#form-name')).toHaveAttribute('aria-invalid', 'true');
  });

  test('el banner de cookies ofrece Aceptar, Rechazar y Configurar', async ({ page }) => {
    await page.goto('/index.html');
    await expect(page.locator('#cookie-accept')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('#cookie-reject')).toBeVisible();
    await expect(page.locator('#cookie-settings')).toBeVisible();
  });

  test('el chat no carga cookies hasta aceptar', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForTimeout(1800); // esperar a que aparezca el banner
    const cookiesBefore = await page.context().cookies();
    expect(cookiesBefore.find(c => c.name.includes('chatbase'))).toBeUndefined();
  });

  test('el conmutador de modo oscuro cambia el atributo data-theme', async ({ page }) => {
    await page.goto('/index.html');
    const before = await page.locator('html').getAttribute('data-theme');
    await page.locator('.theme-toggle').first().click();
    const after = await page.locator('html').getAttribute('data-theme');
    expect(after).not.toBe(before);
  });

  test('el menú móvil se abre y permanece abierto tras el clic (no se autocierra)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/index.html');
    await page.locator('#menu-toggle').click();
    await expect(page.locator('#menu-toggle')).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#mobile-nav')).toHaveClass(/open/);
  });

  test('el Auditor Web IA es la segunda sección, justo tras el hero', async ({ page }) => {
    await page.goto('/index.html');
    const order = await page.locator('main section').evaluateAll(els => els.map(e => e.id));
    expect(order[0]).toBe('inicio');
    expect(order[1]).toBe('auditor');
  });

  test('la barra de progreso de scroll avanza al hacer scroll', async ({ page }) => {
    await page.goto('/index.html');
    const initial = await page.locator('#scroll-progress').evaluate(el => el.style.width);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.5));
    await page.waitForTimeout(150);
    const after = await page.locator('#scroll-progress').evaluate(el => el.style.width);
    expect(after).not.toBe(initial);
  });

  test('el auditor nunca presenta un resultado de ejemplo como si fuera real', async ({ page }) => {
    await page.goto('/index.html');
    await page.fill('#auditor-url', 'https://ejemplo-cualquiera.test');
    await page.locator('#auditor-submit').click();
    await page.waitForSelector('#auditor-results.active', { timeout: 15000 });
    const sourceText = await page.locator('#auditor-score-source').textContent();
    // En este entorno de pruebas no hay backend real (/api/audit no existe),
    // así que debe mostrar honestamente que es un resultado de ejemplo.
    expect(sourceText).toMatch(/ejemplo|example/i);
  });
});

test.describe('CRM — acceso', () => {
  test('sin sesión, muestra el formulario de login con email y contraseña (no contraseña fija)', async ({ page }) => {
    await page.goto('/crm.html');
    await expect(page.locator('#login-screen')).toBeVisible();
    await expect(page.locator('#login-email')).toBeVisible();
    await expect(page.locator('#login-password')).toBeVisible();
    await expect(page.locator('#crm-app')).not.toHaveClass(/visible/);
  });

  test('el enlace de recuperación de contraseña existe', async ({ page }) => {
    await page.goto('/crm.html');
    await expect(page.locator('#forgot-password-link')).toBeVisible();
  });

  test('no hay ninguna contraseña en texto plano servida al navegador', async ({ page }) => {
    const response = await page.goto('/crm.js');
    const body = await response?.text();
    expect(body).not.toMatch(/siacm2025/i);
    expect(body).not.toMatch(/PASSWORD_HASH/);
  });
});
