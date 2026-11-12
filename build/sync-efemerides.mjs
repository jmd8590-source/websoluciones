#!/usr/bin/env node
/**
 * Regenera data/efemerides.js a partir de facts.js.
 *
 * facts.js sigue siendo el archivo que se edita a mano (ver sus propias
 * instrucciones de actualización mensual). data/efemerides.js es una copia
 * generada, en formato de módulo ES, que usa functions/api/efemeride.js
 * (la función de servidor que sirve solo la efeméride de hoy).
 *
 * Ejecútalo cada vez que edites facts.js:  node build/sync-efemerides.mjs
 * (también se ejecuta automáticamente dentro de "npm run build").
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const src = readFileSync(path.join(root, 'facts.js'), 'utf8');

const marker = 'const TECH_FACTS = ';
const idx = src.indexOf(marker);
if (idx === -1) throw new Error('No se encontró "const TECH_FACTS = " en facts.js');

let objSrc = src.slice(idx + marker.length).trimEnd();
if (objSrc.endsWith(';')) objSrc = objSrc.slice(0, -1);

const data = (0, eval)('(' + objSrc + ')');
const count = Object.keys(data).length;

const out = `/* Generado automáticamente desde facts.js por build/sync-efemerides.mjs — no editar a mano */\nexport default ${JSON.stringify(data)};\n`;
writeFileSync(path.join(root, 'data', 'efemerides.js'), out, 'utf8');
console.log(`✓ data/efemerides.js regenerado (${count} entradas, ${Buffer.byteLength(out)} bytes)`);
