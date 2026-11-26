'use strict';
// Correr con: node --test scripts/orca/orca.test.cjs
const test = require('node:test');
const assert = require('node:assert');
const L = require('./_lib.cjs');

test('puertos: lee, deja una sola línea y elige uno libre', () => {
  const c = { puertoPrincipal: 3000, puertoMin: 3001, puertoMax: 3003 };
  assert.equal(L.leerPuerto('A=1\nPORT=3001\n', 'PORT'), 3001);
  assert.equal(L.leerPuerto('#PORT=3001\nXPORT=1\n', 'PORT'), null);
  assert.equal(L.fijarPuerto('A=1\nPORT=1\nB=2', 'PORT', 3002), 'A=1\nB=2\nPORT=3002\n');
  assert.equal(L.elegirPuerto(3002, [3001], c), 3002);
  assert.equal(L.elegirPuerto(3001, [3001], c), 3002);
  assert.equal(L.elegirPuerto(3000, [], c), 3001);
  assert.throws(() => L.elegirPuerto(null, [3001, 3002, 3003], c), /No hay puertos/);
});

test('cierre: solo lo que aportó commits propios ya integrados', () => {
  const m = { estado: 'in-review', rama: 'refs/heads/x', limpio: true, punta: 'a', esAncestro: true, enPrimeraLinea: false, parches: [] };
  const c = (x) => L.decidirCierre({ ...m, ...x }).cerrar;
  assert.equal(c({}), true);
  assert.equal(c({ esAncestro: false, parches: ['-', '-'] }), true);
  assert.equal(c({ esAncestro: false, parches: ['+'], squash: true }), true);
  for (const x of [{ enPrimeraLinea: true }, { esPrincipal: true }, { archivado: true }, { estado: 'completed' }, { rama: '' }, { limpio: false },
    { cerradoEn: 'a' }, { esAncestro: false, parches: ['-', '+'] }, { esAncestro: false, parches: [] }]) assert.equal(c(x), false, JSON.stringify(x));
  assert.equal(c({ cerradoEn: 'anterior' }), true);
});

test('instalación: una vez, sin duplicar y respetando lo que la persona borró', () => {
  const d = (x) => L.decidirInstalacion({ lista: [], nombre: 'n', yaInstalada: false, forzar: false, ...x }).crear;
  assert.equal(d({}), true);
  assert.equal(d({ lista: [{ name: 'n' }], forzar: true }), false);
  assert.equal(d({ yaInstalada: true }), false);
  assert.equal(d({ yaInstalada: true, forzar: true }), true);
});

test('hook post-merge: no pisa uno ajeno', () => {
  const h = L.hookPostMerge('main');
  assert.equal(L.decidirHook(null, h).escribir, true);
  assert.equal(L.decidirHook(h, h).escribir, false);
  assert.equal(L.decidirHook(`#!/bin/sh\n${L.MARCA_HOOK}\n`, h).escribir, true);
  assert.equal(L.decidirHook('#!/bin/sh\nhusky\n', h).escribir, false);
});

test('turno: In progress ↔ In review sin tocar Done ni la copia principal', () => {
  const d = (entrada, estado = 'in-progress', esPrincipal = false) => L.decidirTarjeta({ entrada, estado, esPrincipal }).estado;
  const stop = (x = {}) => ({ hook_event_name: 'Stop', background_tasks: [], session_crons: [], ...x });
  assert.equal(d(stop()), 'in-review');
  assert.equal(d(stop({ background_tasks: [{ status: 'running' }] })), null);
  assert.equal(d(stop({ session_crons: [{}] })), null);
  assert.equal(d({ hook_event_name: 'PreToolUse', tool_name: 'AskUserQuestion' }), 'in-review');
  assert.equal(d({ hook_event_name: 'Notification', notification_type: 'permission_prompt' }), 'in-review');
  assert.equal(d({ hook_event_name: 'Notification', notification_type: 'idle_prompt' }), null);
  assert.equal(d({ hook_event_name: 'UserPromptSubmit' }, 'in-review'), 'in-progress');
  assert.equal(d({ hook_event_name: 'UserPromptSubmit' }, 'todo'), 'in-progress');
  assert.equal(d({ hook_event_name: 'UserPromptSubmit' }, 'completed'), null);
  assert.equal(d(stop(), 'in-progress', true), null);
});
