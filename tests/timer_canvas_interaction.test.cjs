'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')
const vm = require('node:vm')

const source = fs.readFileSync(path.join(__dirname, '../js/script.js'), 'utf8')

function startApp({ rect = { left: 0, top: 0, width: 300, height: 300 } } = {}) {
  const events = new Map()
  const painter = {}
  for (const fn of ['clearRect', 'beginPath', 'arc', 'fill', 'stroke', 'moveTo', 'closePath', 'fillText']) {
    painter[fn] = () => {}
  }
  const cls = { add() {}, remove() {}, toggle() {} }
  const canvas = {
    width: 300, height: 300, classList: cls,
    getContext: () => painter,
    getBoundingClientRect: () => rect,
    addEventListener: (name, callback) => events.set(name, callback),
  }
  const make = () => ({
    value: '', textContent: '', classList: cls,
    addEventListener() {}, appendChild() {},
  })
  const elements = new Map([['timerCanvas', canvas]])
  const doc = {
    getElementById: (id) => {
      if (!elements.has(id)) elements.set(id, make())
      return elements.get(id)
    },
    createElement: () => make(),
  }
  const context = vm.createContext({
    document: doc,
    setInterval: () => 42, clearInterval() {}, setTimeout() {},
    alert() {},
  })
  // The application itself declares pomodoroTimer; no implicitly exposed
  // window.canvas variable or browser-specific named-element fallback.
  vm.runInContext(source, context, { filename: 'js/script.js', timeout: 2500 })
  return { context, events, elements }
}

test('initializes against the actual timerCanvas element without undefined globals', () => {
  const { context, events } = startApp()
  assert.equal(vm.runInContext('pomodoroTimer.timeLeft', context), 1500)
  assert.equal(typeof events.get('click'), 'function')
})

test('a tap at the quarter-circle position adjusts the live timer and inputs', () => {
  const { context, events, elements } = startApp()
  events.get('click')({ clientX: 300, clientY: 150 })
  assert.equal(vm.runInContext('pomodoroTimer.timeLeft', context), 375)
  assert.equal(elements.get('minuteInput').value, 6)
  assert.equal(elements.get('secondInput').value, 15)
})

test('clicking a CSS-scaled canvas uses its displayed center', () => {
  const { context, events, elements } = startApp({
    rect: { left: 20, top: 50, width: 200, height: 200 },
  })
  events.get('click')({ clientX: 219, clientY: 150 })
  assert.equal(vm.runInContext('pomodoroTimer.timeLeft', context), 375)
  assert.equal(elements.get('minuteInput').value, 6)
  assert.equal(elements.get('secondInput').value, 15)
})
