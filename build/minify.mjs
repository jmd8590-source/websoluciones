#!/usr/bin/env node
/**
 * Genera dist/ : una copia desplegable del sitio con el JavaScript
 * minificado y ofuscado (nombres de variables y funciones locales
 * renombrados) para que no se pueda leer ni modificar fácilmente
 * en el navegador. El repositorio sigue guardando el código fuente
 * legible en la raíz, tal y como está; "dist" es solo la salida.
 *
 * No se toca HTML, CSS ni ningún secreto: nunca hay claves ni
 * contraseñas que ofuscar, porque no viven en el código fuente.
 */
import { readFile, writeFile, mkdir, cp, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { minify } from 'terser';
import CleanCSS from 'clean-css';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const distDir = path.join(root, 'dist');

const JS_FILES = ['app.js', 'crm.js', 'facts.js', 'lo-ultimo.js'];
const CSS_FILES = ['styles.css', 'crm.css'];
const STATIC_COPY = [
  'index.html', 'crm.html',
  '_headers', '_redirects',
  'robots.txt', 'sitemap.xml',
  'llms.txt', 'llms-full.txt',
  'assets', 'functions',
];

async function main() {
  if (existsSync(distDir)) await rm(distDir, { recursive: true });
  await mkdir(distDir, { recursive: true });

  for (const name of STATIC_COPY) {
    const src = path.join(root, name);
    if (!existsSync(src)) continue;
    await cp(src, path.join(distDir, name), { recursive: true });
  }

  for (const file of JS_FILES) {
    const src = path.join(root, file);
    if (!existsSync(src)) continue;
    const code = await readFile(src, 'utf8');
    const result = await minify(code, {
      mangle: { toplevel: true }, // renombra variables/funciones locales y de ámbito de módulo
      compress: { drop_console: false }, // mantenemos console.error para depurar en producción
      format: { comments: false },
    });
    if (result.error) throw result.error;
    await writeFile(path.join(distDir, file), result.code, 'utf8');
    console.log(`✓ ${file}: ${code.length} → ${result.code.length} bytes`);
  }

  const cleanCss = new CleanCSS({ level: 2 });
  for (const file of CSS_FILES) {
    const src = path.join(root, file);
    if (!existsSync(src)) continue;
    const code = await readFile(src, 'utf8');
    const result = cleanCss.minify(code);
    if (result.errors.length) throw new Error(result.errors.join('\n'));
    await writeFile(path.join(distDir, file), result.styles, 'utf8');
    console.log(`✓ ${file}: ${code.length} → ${result.styles.length} bytes`);
  }

  console.log('\nBuild completo en dist/. Nada se ha desplegado todavía.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
