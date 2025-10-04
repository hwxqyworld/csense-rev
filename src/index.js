import { addStyle } from './util/inject'
import { SceneManager } from './base/scene'
import { IdentityWarningOverlay } from './overlay/identity'
import { HomeScene } from './scene/home'
import { createWindow } from './util/window'
import globalState from './base/state'
import { version as VERSION } from '../package.json'
import { LazyXHR } from './util/inject'
;(() => {
  function asNativeFunc(fn) {
    const toString = (fn.toString = () => 'function () { [native code] }')
    fn.toString.toString = toString
    return fn
  }
  if (!console.log.toString().includes('[native code]')) {
    alert(
      'CSense 加载得太慢了。\n\n这可能会导致一些功能异常，并且我们不会修复这些异常。\n如果您在使用 Tampermonkey: 请换用 Violentmonkey。\n如果您在使用 Violentmonkey：请在设置中勾选同步 page 模式。这可能会导致一些脚本异常，请自行取舍。'
    )
  }
  // try getting axios
  const _apply = Function.prototype.apply
  Function.prototype.apply = function (thisArg, args) {
    if (
      typeof thisArg === 'object' &&
      thisArg &&
      thisArg.defaults &&
      thisArg.interceptors &&
      thisArg.interceptors.request.handlers.length > 0
    ) {
      if (globalState.axios instanceof LazyXHR) {
        globalState.axios.delegate(thisArg)
        globalState.axios = thisArg
        window.axios = thisArg
      }
      this.apply = _apply
    }
    return _apply.call(this, thisArg, args)
  }
  const content = document.createElement('div')
  content.style.fontFamily = 'unset'
  const manager = new SceneManager(content)
  manager.addOverlay(new IdentityWarningOverlay(manager))
  manager.open(new HomeScene(manager))
  const win = createWindow(content, () => {
    return !manager.back()
  })
  manager._doSetTitle = win.setTitle
  globalState.button = win.button
  manager._updateTitle()
  globalThis.manager = manager
  // Anti-detection designed for "some" tricky projects
  // NOTE: 以下为最基本的防护，无法避免通过 documentElement 等方式获取到 CSense 的存在，此时可以考虑安装插件。
  const querySelectorAll = Document.prototype.querySelectorAll
  Document.prototype.querySelectorAll = asNativeFunc(function (selectors) {
    if (this !== document) {
      return querySelectorAll.call(this, selectors)
    }
    const elements = Array.from(querySelectorAll.call(this, selectors))
    const result = elements.filter(
      el => !(el === win.button || el === win.window)
    )
    return Object.assign(result, {
      item(nth) {
        return result[nth]
      }
    })
  })
  const querySelector = Document.prototype.querySelector
  Document.prototype.querySelector = asNativeFunc(function (selectors) {
    if (this !== document) {
      return querySelector.call(this, selectors)
    }
    const res = querySelector.call(this, selectors)
    if (res === win.button || res === win.window) {
      return null
    }
    return res
  })
})()
