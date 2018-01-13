/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

export function bind(element, eventName, handler) {
  if (element.addEventListener) {
    element.addEventListener(eventName, handler, false)
  } else if (element.attachEvent) {
    element[eventName] = 1
    element.attachEvent('onpropertychange', function(event) {
      if (event.propertyName === eventName) {
        handler()
      }
    })
  } else {
    throw new Error(`Attempt to attach custom event ${eventName} to something which isn't a DOMElement`)
  }
}

export function fire(element, eventName) {
  if (element.addEventListener) {
    const event = document.createEvent('HTMLEvents')
    event.initEvent(eventName, true, true)
    document.dispatchEvent(event)
  } else if (element.attachEvent) {
    if (element[eventName]) {
      element[eventName]++
    }
  } else {
    throw new Error(`Attempt to fire custom event ${eventName} on something which isn't a DOMElement`)
  }
}
