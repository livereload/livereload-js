CustomEvents =
  bind: (element, eventName, handler) ->
    if element.addEventListener
      element.addEventListener eventName, handler, false
    else if element.attachEvent
      element[eventName] = 1
      element.attachEvent 'onpropertychange', (event) ->
        if event.propertyName is eventName
          handler()
    else
      throw new Error("Attempt to attach custom event #{eventName} to something which isn't a DOMElement")

  fire: (element, eventName) ->
    if element.addEventListener
      event = document.createEvent('HTMLEvents')
      event.initEvent(eventName, true, true)
      document.dispatchEvent(event)
    else if element.attachEvent
      if element[eventName]
        element[eventName]++
    else
      throw new Error("Attempt to fire custom event #{eventName} on something which isn't a DOMElement")

exports.bind = CustomEvents.bind
exports.fire = CustomEvents.fire
