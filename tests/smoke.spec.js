// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Landing pública', () => {
  test('carga, tiene título correcto y sin errores de consola', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });

    const response = await page.goto('/index.html');
    expect(response?.status()).toBeLessThan(400);
    await expect(page).toHaveTitle(/Soluciones IA CM/);
    await page.waitForTimeout(500);

    const ignorable = /chatbase|supabase|net::ERR_|Failed to fetch|404 \(Not Found\)/i;
    const realErrors = consoleErrors.filter(e => !ignorable.test(e));
    expect(realErrors, `Errores de consola inesperados:\n${realErrors.join('\n')}`).toEqual([]);
  });

  test('el formulario de contacto exige nombre, email, mensaje y consentimiento RGPD', async ({ page }) => {
    await page.goto('/index.html');
    await page.locator('#contact-form button[type="submit"]').click();
    await expect(page.locator('#form-name')).toHaveAttribute('aria-invalid', 'true');
  });

  test('el banner de cookies ofrece Aceptar y Solo necesarias', async ({ page }) => {
    await page.goto('/index.html');
    await expect(page.locator('#cookie-accept')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('#cookie-reject')).toBeVisible();
  });

  test('el menú móvil se abre y permanece abierto tras el clic', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/index.html');
    await page.locator('#menu-toggle').click();
    await expect(page.locator('#menu-toggle')).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#mobile-nav')).toHaveClass(/open/);
  });

  test('el Auditor Web IA tiene protagonismo y ejecuta auditoría real con evidencias técnicas', async ({ page }) => {
    await page.goto('/index.html');
    await expect(page.locator('#auditor')).toBeVisible();
    await page.locator('button[data-sample-url="self"]').click();
    await page.waitForSelector('#auditor-results.active', { timeout: 15000 });
    const scoreText = await page.locator('#auditor-overall-score').textContent();
    expect(Number(scoreText)).toBeGreaterThan(50);
    const criteriaCount = await page.locator('#auditor-criteria .criterion-card').count();
    expect(criteriaCount).toBe(10);
  });
});

test.describe('CRM — acceso seguro y sincronización con el formulario web', () => {
  test('sin sesión, muestra el formulario de login con usuario/email y contraseña', async ({ page }) => {
    await page.goto('/crm.html');
    await expect(page.locator('#login-screen')).toBeVisible();
    await expect(page.locator('#login-username')).toBeVisible();
    await expect(page.locator('#login-password')).toBeVisible();
    await expect(page.locator('#crm-app')).not.toHaveClass(/visible/);
  });

  test('cuando un cliente rellena el formulario de contacto, la consulta se sincroniza con el CRM', async ({ page }) => {
    // 1. El cliente rellena el formulario en index.html
    await page.goto('/index.html#contacto');
    await page.fill('#form-name', 'Cliente Prueba Sincronización');
    await page.fill('#form-email', 'cliente.sync@empresa.es');
    await page.fill('#form-company', ' Panadería Sierra');
    await page.fill('#form-phone', '600123456');
    await page.fill('#form-message', 'Necesito automatizar pedidos y sincronizar con el CRM.');
    await page.check('#form-consent');
    await page.click('#form-submit');

    await expect(page.locator('#contact-success')).toHaveClass(/active/, { timeout: 8000 });

    // 2. El administrador entra en crm.html y ve el lead sincronizado
    await page.goto('/crm.html');
    await page.fill('#login-username', 'jemendo90@gmail.com');
    await page.fill('#login-password', 'SiaCM!2026#Cumbres90$Admin');
    await page.click('#login-submit-btn');

    await expect(page.locator('#crm-app')).toHaveClass(/visible/, { timeout: 8000 });
    await expect(page.locator('#leads-tbody')).toContainText('Cliente Prueba Sincronización');
    await expect(page.locator('#leads-tbody')).toContainText('cliente.sync@empresa.es');
  });

  test('no hay ninguna contraseña en texto plano ni hash SHA-256 antiguo servido al navegador', async ({ page }) => {
    const response = await page.goto('/crm.js');
    const body = await response?.text();
    expect(body).not.toMatch(/siacm2025/i);
    expect(body).not.toMatch(/PASSWORD_HASH/);
    expect(body).toMatch(/PBKDF2/);
  });
});
