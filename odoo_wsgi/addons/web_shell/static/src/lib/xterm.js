(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(self, function() {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./out/browser/AccessibilityManager.js":
/*!*********************************************!*\
  !*** ./out/browser/AccessibilityManager.js ***!
  \*********************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: top-level-this-exports, __webpack_exports__, __webpack_require__ */
/*! CommonJS bailout: this is used directly at 2:17-21 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AccessibilityManager = void 0;
var Strings = __webpack_require__(/*! browser/LocalizableStrings */ "./out/browser/LocalizableStrings.js");
var Platform_1 = __webpack_require__(/*! common/Platform */ "./out/common/Platform.js");
var RenderDebouncer_1 = __webpack_require__(/*! browser/RenderDebouncer */ "./out/browser/RenderDebouncer.js");
var Lifecycle_1 = __webpack_require__(/*! browser/Lifecycle */ "./out/browser/Lifecycle.js");
var Lifecycle_2 = __webpack_require__(/*! common/Lifecycle */ "./out/common/Lifecycle.js");
var ScreenDprMonitor_1 = __webpack_require__(/*! browser/ScreenDprMonitor */ "./out/browser/ScreenDprMonitor.js");
var Dom_1 = __webpack_require__(/*! browser/Dom */ "./out/browser/Dom.js");
var MAX_ROWS_TO_READ = 20;
var AccessibilityManager = (function (_super) {
    __extends(AccessibilityManager, _super);
    function AccessibilityManager(_terminal, _renderService) {
        var _this = _super.call(this) || this;
        _this._terminal = _terminal;
        _this._renderService = _renderService;
        _this._liveRegionLineCount = 0;
        _this._charsToConsume = [];
        _this._charsToAnnounce = '';
        _this._accessibilityTreeRoot = document.createElement('div');
        _this._accessibilityTreeRoot.classList.add('xterm-accessibility');
        _this._rowContainer = document.createElement('div');
        _this._rowContainer.setAttribute('role', 'list');
        _this._rowContainer.classList.add('xterm-accessibility-tree');
        _this._rowElements = [];
        for (var i = 0; i < _this._terminal.rows; i++) {
            _this._rowElements[i] = _this._createAccessibilityTreeNode();
            _this._rowContainer.appendChild(_this._rowElements[i]);
        }
        _this._topBoundaryFocusListener = function (e) { return _this._onBoundaryFocus(e, 0); };
        _this._bottomBoundaryFocusListener = function (e) { return _this._onBoundaryFocus(e, 1); };
        _this._rowElements[0].addEventListener('focus', _this._topBoundaryFocusListener);
        _this._rowElements[_this._rowElements.length - 1].addEventListener('focus', _this._bottomBoundaryFocusListener);
        _this._refreshRowsDimensions();
        _this._accessibilityTreeRoot.appendChild(_this._rowContainer);
        _this._renderRowsDebouncer = new RenderDebouncer_1.RenderDebouncer(_this._renderRows.bind(_this));
        _this._refreshRows();
        _this._liveRegion = document.createElement('div');
        _this._liveRegion.classList.add('live-region');
        _this._liveRegion.setAttribute('aria-live', 'assertive');
        _this._accessibilityTreeRoot.appendChild(_this._liveRegion);
        if (!_this._terminal.element) {
            throw new Error('Cannot enable accessibility before Terminal.open');
        }
        _this._terminal.element.insertAdjacentElement('afterbegin', _this._accessibilityTreeRoot);
        _this.register(_this._renderRowsDebouncer);
        _this.register(_this._terminal.onResize(function (e) { return _this._onResize(e.rows); }));
        _this.register(_this._terminal.onRender(function (e) { return _this._refreshRows(e.start, e.end); }));
        _this.register(_this._terminal.onScroll(function () { return _this._refreshRows(); }));
        _this.register(_this._terminal.onA11yChar(function (char) { return _this._onChar(char); }));
        _this.register(_this._terminal.onLineFeed(function () { return _this._onChar('\n'); }));
        _this.register(_this._terminal.onA11yTab(function (spaceCount) { return _this._onTab(spaceCount); }));
        _this.register(_this._terminal.onKey(function (e) { return _this._onKey(e.key); }));
        _this.register(_this._terminal.onBlur(function () { return _this._clearLiveRegion(); }));
        _this.register(_this._renderService.onDimensionsChange(function () { return _this._refreshRowsDimensions(); }));
        _this._screenDprMonitor = new ScreenDprMonitor_1.ScreenDprMonitor();
        _this.register(_this._screenDprMonitor);
        _this._screenDprMonitor.setListener(function () { return _this._refreshRowsDimensions(); });
        _this.register(Lifecycle_1.addDisposableDomListener(window, 'resize', function () { return _this._refreshRowsDimensions(); }));
        return _this;
    }
    AccessibilityManager.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        Dom_1.removeElementFromParent(this._accessibilityTreeRoot);
        this._rowElements.length = 0;
    };
    AccessibilityManager.prototype._onBoundaryFocus = function (e, position) {
        var boundaryElement = e.target;
        var beforeBoundaryElement = this._rowElements[position === 0 ? 1 : this._rowElements.length - 2];
        var posInSet = boundaryElement.getAttribute('aria-posinset');
        var lastRowPos = position === 0 ? '1' : "" + this._terminal.buffer.lines.length;
        if (posInSet === lastRowPos) {
            return;
        }
        if (e.relatedTarget !== beforeBoundaryElement) {
            return;
        }
        var topBoundaryElement;
        var bottomBoundaryElement;
        if (position === 0) {
            topBoundaryElement = boundaryElement;
            bottomBoundaryElement = this._rowElements.pop();
            this._rowContainer.removeChild(bottomBoundaryElement);
        }
        else {
            topBoundaryElement = this._rowElements.shift();
            bottomBoundaryElement = boundaryElement;
            this._rowContainer.removeChild(topBoundaryElement);
        }
        topBoundaryElement.removeEventListener('focus', this._topBoundaryFocusListener);
        bottomBoundaryElement.removeEventListener('focus', this._bottomBoundaryFocusListener);
        if (position === 0) {
            var newElement = this._createAccessibilityTreeNode();
            this._rowElements.unshift(newElement);
            this._rowContainer.insertAdjacentElement('afterbegin', newElement);
        }
        else {
            var newElement = this._createAccessibilityTreeNode();
            this._rowElements.push(newElement);
            this._rowContainer.appendChild(newElement);
        }
        this._rowElements[0].addEventListener('focus', this._topBoundaryFocusListener);
        this._rowElements[this._rowElements.length - 1].addEventListener('focus', this._bottomBoundaryFocusListener);
        this._terminal.scrollLines(position === 0 ? -1 : 1);
        this._rowElements[position === 0 ? 1 : this._rowElements.length - 2].focus();
        e.preventDefault();
        e.stopImmediatePropagation();
    };
    AccessibilityManager.prototype._onResize = function (rows) {
        this._rowElements[this._rowElements.length - 1].removeEventListener('focus', this._bottomBoundaryFocusListener);
        for (var i = this._rowContainer.children.length; i < this._terminal.rows; i++) {
            this._rowElements[i] = this._createAccessibilityTreeNode();
            this._rowContainer.appendChild(this._rowElements[i]);
        }
        while (this._rowElements.length > rows) {
            this._rowContainer.removeChild(this._rowElements.pop());
        }
        this._rowElements[this._rowElements.length - 1].addEventListener('focus', this._bottomBoundaryFocusListener);
        this._refreshRowsDimensions();
    };
    AccessibilityManager.prototype._createAccessibilityTreeNode = function () {
        var element = document.createElement('div');
        element.setAttribute('role', 'listitem');
        element.tabIndex = -1;
        this._refreshRowDimensions(element);
        return element;
    };
    AccessibilityManager.prototype._onTab = function (spaceCount) {
        for (var i = 0; i < spaceCount; i++) {
            this._onChar(' ');
        }
    };
    AccessibilityManager.prototype._onChar = function (char) {
        var _this = this;
        if (this._liveRegionLineCount < MAX_ROWS_TO_READ + 1) {
            if (this._charsToConsume.length > 0) {
                var shiftedChar = this._charsToConsume.shift();
                if (shiftedChar !== char) {
                    this._charsToAnnounce += char;
                }
            }
            else {
                this._charsToAnnounce += char;
            }
            if (char === '\n') {
                this._liveRegionLineCount++;
                if (this._liveRegionLineCount === MAX_ROWS_TO_READ + 1) {
                    this._liveRegion.textContent += Strings.tooMuchOutput;
                }
            }
            if (Platform_1.isMac) {
                if (this._liveRegion.textContent && this._liveRegion.textContent.length > 0 && !this._liveRegion.parentNode) {
                    setTimeout(function () {
                        _this._accessibilityTreeRoot.appendChild(_this._liveRegion);
                    }, 0);
                }
            }
        }
    };
    AccessibilityManager.prototype._clearLiveRegion = function () {
        this._liveRegion.textContent = '';
        this._liveRegionLineCount = 0;
        if (Platform_1.isMac) {
            Dom_1.removeElementFromParent(this._liveRegion);
        }
    };
    AccessibilityManager.prototype._onKey = function (keyChar) {
        this._clearLiveRegion();
        this._charsToConsume.push(keyChar);
    };
    AccessibilityManager.prototype._refreshRows = function (start, end) {
        this._renderRowsDebouncer.refresh(start, end, this._terminal.rows);
    };
    AccessibilityManager.prototype._renderRows = function (start, end) {
        var buffer = this._terminal.buffer;
        var setSize = buffer.lines.length.toString();
        for (var i = start; i <= end; i++) {
            var lineData = buffer.translateBufferLineToString(buffer.ydisp + i, true);
            var posInSet = (buffer.ydisp + i + 1).toString();
            var element = this._rowElements[i];
            if (element) {
                if (lineData.length === 0) {
                    element.innerText = '\u00a0';
                }
                else {
                    element.textContent = lineData;
                }
                element.setAttribute('aria-posinset', posInSet);
                element.setAttribute('aria-setsize', setSize);
            }
        }
        this._announceCharacters();
    };
    AccessibilityManager.prototype._refreshRowsDimensions = function () {
        if (!this._renderService.dimensions.actualCellHeight) {
            return;
        }
        if (this._rowElements.length !== this._terminal.rows) {
            this._onResize(this._terminal.rows);
        }
        for (var i = 0; i < this._terminal.rows; i++) {
            this._refreshRowDimensions(this._rowElements[i]);
        }
    };
    AccessibilityManager.prototype._refreshRowDimensions = function (element) {
        element.style.height = this._renderService.dimensions.actualCellHeight + "px";
    };
    AccessibilityManager.prototype._announceCharacters = function () {
        if (this._charsToAnnounce.length === 0) {
            return;
        }
        this._liveRegion.textContent += this._charsToAnnounce;
        this._charsToAnnounce = '';
    };
    return AccessibilityManager;
}(Lifecycle_2.Disposable));
exports.AccessibilityManager = AccessibilityManager;


/***/ }),

/***/ "./out/browser/Clipboard.js":
/*!**********************************!*\
  !*** ./out/browser/Clipboard.js ***!
  \**********************************/
/*! flagged exports */
/*! export __esModule [provided] [no usage info] [missing usage info prevents renaming] */
/*! export bracketTextForPaste [provided] [no usage info] [missing usage info prevents renaming] */
/*! export copyHandler [provided] [no usage info] [missing usage info prevents renaming] */
/*! export handlePasteEvent [provided] [no usage info] [missing usage info prevents renaming] */
/*! export moveTextAreaUnderMouseCursor [provided] [no usage info] [missing usage info prevents renaming] */
/*! export paste [provided] [no usage info] [missing usage info prevents renaming] */
/*! export prepareTextForTerminal [provided] [no usage info] [missing usage info prevents renaming] */
/*! export rightClickHandler [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_exports__ */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.rightClickHandler = exports.moveTextAreaUnderMouseCursor = exports.paste = exports.handlePasteEvent = exports.copyHandler = exports.bracketTextForPaste = exports.prepareTextForTerminal = void 0;
function prepareTextForTerminal(text) {
    return text.replace(/\r?\n/g, '\r');
}
exports.prepareTextForTerminal = prepareTextForTerminal;
function bracketTextForPaste(text, bracketedPasteMode) {
    if (bracketedPasteMode) {
        return '\x1b[200~' + text + '\x1b[201~';
    }
    return text;
}
exports.bracketTextForPaste = bracketTextForPaste;
function copyHandler(ev, selectionService) {
    if (ev.clipboardData) {
        ev.clipboardData.setData('text/plain', selectionService.selectionText);
    }
    ev.preventDefault();
}
exports.copyHandler = copyHandler;
function handlePasteEvent(ev, textarea, coreService) {
    ev.stopPropagation();
    if (ev.clipboardData) {
        var text = ev.clipboardData.getData('text/plain');
        paste(text, textarea, coreService);
    }
}
exports.handlePasteEvent = handlePasteEvent;
function paste(text, textarea, coreService) {
    text = prepareTextForTerminal(text);
    text = bracketTextForPaste(text, coreService.decPrivateModes.bracketedPasteMode);
    coreService.triggerDataEvent(text, true);
    textarea.value = '';
}
exports.paste = paste;
function moveTextAreaUnderMouseCursor(ev, textarea, screenElement) {
    var pos = screenElement.getBoundingClientRect();
    var left = ev.clientX - pos.left - 10;
    var top = ev.clientY - pos.top - 10;
    textarea.style.width = '20px';
    textarea.style.height = '20px';
    textarea.style.left = left + "px";
    textarea.style.top = top + "px";
    textarea.style.zIndex = '1000';
    textarea.focus();
}
exports.moveTextAreaUnderMouseCursor = moveTextAreaUnderMouseCursor;
function rightClickHandler(ev, textarea, screenElement, selectionService, shouldSelectWord) {
    moveTextAreaUnderMouseCursor(ev, textarea, screenElement);
    if (shouldSelectWord) {
        selectionService.rightClickSelect(ev);
    }
    textarea.value = selectionService.selectionText;
    textarea.select();
}
exports.rightClickHandler = rightClickHandler;


/***/ }),

/***/ "./out/browser/Color.js":
/*!******************************!*\
  !*** ./out/browser/Color.js ***!
  \******************************/
/*! flagged exports */
/*! export __esModule [provided] [no usage info] [missing usage info prevents renaming] */
/*! export channels [provided] [no usage info] [missing usage info prevents renaming] */
/*! export color [provided] [no usage info] [missing usage info prevents renaming] */
/*! export contrastRatio [provided] [no usage info] [missing usage info prevents renaming] */
/*! export css [provided] [no usage info] [missing usage info prevents renaming] */
/*! export rgb [provided] [no usage info] [missing usage info prevents renaming] */
/*! export rgba [provided] [no usage info] [missing usage info prevents renaming] */
/*! export toPaddedHex [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_exports__ */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.contrastRatio = exports.toPaddedHex = exports.rgba = exports.rgb = exports.css = exports.color = exports.channels = void 0;
var channels;
(function (channels) {
    function toCss(r, g, b, a) {
        if (a !== undefined) {
            return "#" + toPaddedHex(r) + toPaddedHex(g) + toPaddedHex(b) + toPaddedHex(a);
        }
        return "#" + toPaddedHex(r) + toPaddedHex(g) + toPaddedHex(b);
    }
    channels.toCss = toCss;
    function toRgba(r, g, b, a) {
        if (a === void 0) { a = 0xFF; }
        return (r << 24 | g << 16 | b << 8 | a) >>> 0;
    }
    channels.toRgba = toRgba;
})(channels = exports.channels || (exports.channels = {}));
var color;
(function (color_1) {
    function blend(bg, fg) {
        var a = (fg.rgba & 0xFF) / 255;
        if (a === 1) {
            return {
                css: fg.css,
                rgba: fg.rgba
            };
        }
        var fgR = (fg.rgba >> 24) & 0xFF;
        var fgG = (fg.rgba >> 16) & 0xFF;
        var fgB = (fg.rgba >> 8) & 0xFF;
        var bgR = (bg.rgba >> 24) & 0xFF;
        var bgG = (bg.rgba >> 16) & 0xFF;
        var bgB = (bg.rgba >> 8) & 0xFF;
        var r = bgR + Math.round((fgR - bgR) * a);
        var g = bgG + Math.round((fgG - bgG) * a);
        var b = bgB + Math.round((fgB - bgB) * a);
        var css = channels.toCss(r, g, b);
        var rgba = channels.toRgba(r, g, b);
        return { css: css, rgba: rgba };
    }
    color_1.blend = blend;
    function isOpaque(color) {
        return (color.rgba & 0xFF) === 0xFF;
    }
    color_1.isOpaque = isOpaque;
    function ensureContrastRatio(bg, fg, ratio) {
        var result = rgba.ensureContrastRatio(bg.rgba, fg.rgba, ratio);
        if (!result) {
            return undefined;
        }
        return rgba.toColor((result >> 24 & 0xFF), (result >> 16 & 0xFF), (result >> 8 & 0xFF));
    }
    color_1.ensureContrastRatio = ensureContrastRatio;
    function opaque(color) {
        var rgbaColor = (color.rgba | 0xFF) >>> 0;
        var _a = rgba.toChannels(rgbaColor), r = _a[0], g = _a[1], b = _a[2];
        return {
            css: channels.toCss(r, g, b),
            rgba: rgbaColor
        };
    }
    color_1.opaque = opaque;
    function opacity(color, opacity) {
        var a = Math.round(opacity * 0xFF);
        var _a = rgba.toChannels(color.rgba), r = _a[0], g = _a[1], b = _a[2];
        return {
            css: channels.toCss(r, g, b, a),
            rgba: channels.toRgba(r, g, b, a)
        };
    }
    color_1.opacity = opacity;
})(color = exports.color || (exports.color = {}));
var css;
(function (css_1) {
    function toColor(css) {
        switch (css.length) {
            case 7:
                return {
                    css: css,
                    rgba: (parseInt(css.slice(1), 16) << 8 | 0xFF) >>> 0
                };
            case 9:
                return {
                    css: css,
                    rgba: parseInt(css.slice(1), 16) >>> 0
                };
        }
        throw new Error('css.toColor: Unsupported css format');
    }
    css_1.toColor = toColor;
})(css = exports.css || (exports.css = {}));
var rgb;
(function (rgb_1) {
    function relativeLuminance(rgb) {
        return relativeLuminance2((rgb >> 16) & 0xFF, (rgb >> 8) & 0xFF, (rgb) & 0xFF);
    }
    rgb_1.relativeLuminance = relativeLuminance;
    function relativeLuminance2(r, g, b) {
        var rs = r / 255;
        var gs = g / 255;
        var bs = b / 255;
        var rr = rs <= 0.03928 ? rs / 12.92 : Math.pow((rs + 0.055) / 1.055, 2.4);
        var rg = gs <= 0.03928 ? gs / 12.92 : Math.pow((gs + 0.055) / 1.055, 2.4);
        var rb = bs <= 0.03928 ? bs / 12.92 : Math.pow((bs + 0.055) / 1.055, 2.4);
        return rr * 0.2126 + rg * 0.7152 + rb * 0.0722;
    }
    rgb_1.relativeLuminance2 = relativeLuminance2;
})(rgb = exports.rgb || (exports.rgb = {}));
var rgba;
(function (rgba) {
    function ensureContrastRatio(bgRgba, fgRgba, ratio) {
        var bgL = rgb.relativeLuminance(bgRgba >> 8);
        var fgL = rgb.relativeLuminance(fgRgba >> 8);
        var cr = contrastRatio(bgL, fgL);
        if (cr < ratio) {
            if (fgL < bgL) {
                return reduceLuminance(bgRgba, fgRgba, ratio);
            }
            return increaseLuminance(bgRgba, fgRgba, ratio);
        }
        return undefined;
    }
    rgba.ensureContrastRatio = ensureContrastRatio;
    function reduceLuminance(bgRgba, fgRgba, ratio) {
        var bgR = (bgRgba >> 24) & 0xFF;
        var bgG = (bgRgba >> 16) & 0xFF;
        var bgB = (bgRgba >> 8) & 0xFF;
        var fgR = (fgRgba >> 24) & 0xFF;
        var fgG = (fgRgba >> 16) & 0xFF;
        var fgB = (fgRgba >> 8) & 0xFF;
        var cr = contrastRatio(rgb.relativeLuminance2(fgR, fgB, fgG), rgb.relativeLuminance2(bgR, bgG, bgB));
        while (cr < ratio && (fgR > 0 || fgG > 0 || fgB > 0)) {
            fgR -= Math.max(0, Math.ceil(fgR * 0.1));
            fgG -= Math.max(0, Math.ceil(fgG * 0.1));
            fgB -= Math.max(0, Math.ceil(fgB * 0.1));
            cr = contrastRatio(rgb.relativeLuminance2(fgR, fgB, fgG), rgb.relativeLuminance2(bgR, bgG, bgB));
        }
        return (fgR << 24 | fgG << 16 | fgB << 8 | 0xFF) >>> 0;
    }
    rgba.reduceLuminance = reduceLuminance;
    function increaseLuminance(bgRgba, fgRgba, ratio) {
        var bgR = (bgRgba >> 24) & 0xFF;
        var bgG = (bgRgba >> 16) & 0xFF;
        var bgB = (bgRgba >> 8) & 0xFF;
        var fgR = (fgRgba >> 24) & 0xFF;
        var fgG = (fgRgba >> 16) & 0xFF;
        var fgB = (fgRgba >> 8) & 0xFF;
        var cr = contrastRatio(rgb.relativeLuminance2(fgR, fgB, fgG), rgb.relativeLuminance2(bgR, bgG, bgB));
        while (cr < ratio && (fgR < 0xFF || fgG < 0xFF || fgB < 0xFF)) {
            fgR = Math.min(0xFF, fgR + Math.ceil((255 - fgR) * 0.1));
            fgG = Math.min(0xFF, fgG + Math.ceil((255 - fgG) * 0.1));
            fgB = Math.min(0xFF, fgB + Math.ceil((255 - fgB) * 0.1));
            cr = contrastRatio(rgb.relativeLuminance2(fgR, fgB, fgG), rgb.relativeLuminance2(bgR, bgG, bgB));
        }
        return (fgR << 24 | fgG << 16 | fgB << 8 | 0xFF) >>> 0;
    }
    rgba.increaseLuminance = increaseLuminance;
    function toChannels(value) {
        return [(value >> 24) & 0xFF, (value >> 16) & 0xFF, (value >> 8) & 0xFF, value & 0xFF];
    }
    rgba.toChannels = toChannels;
    function toColor(r, g, b) {
        return {
            css: channels.toCss(r, g, b),
            rgba: channels.toRgba(r, g, b)
        };
    }
    rgba.toColor = toColor;
})(rgba = exports.rgba || (exports.rgba = {}));
function toPaddedHex(c) {
    var s = c.toString(16);
    return s.length < 2 ? '0' + s : s;
}
exports.toPaddedHex = toPaddedHex;
function contrastRatio(l1, l2) {
    if (l1 < l2) {
        return (l2 + 0.05) / (l1 + 0.05);
    }
    return (l1 + 0.05) / (l2 + 0.05);
}
exports.contrastRatio = contrastRatio;


/***/ }),

/***/ "./out/browser/ColorContrastCache.js":
/*!*******************************************!*\
  !*** ./out/browser/ColorContrastCache.js ***!
  \*******************************************/
/*! flagged exports */
/*! export ColorContrastCache [provided] [no usage info] [missing usage info prevents renaming] */
/*! export __esModule [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_exports__ */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ColorContrastCache = void 0;
var ColorContrastCache = (function () {
    function ColorContrastCache() {
        this._color = {};
        this._rgba = {};
    }
    ColorContrastCache.prototype.clear = function () {
        this._color = {};
        this._rgba = {};
    };
    ColorContrastCache.prototype.setCss = function (bg, fg, value) {
        if (!this._rgba[bg]) {
            this._rgba[bg] = {};
        }
        this._rgba[bg][fg] = value;
    };
    ColorContrastCache.prototype.getCss = function (bg, fg) {
        return this._rgba[bg] ? this._rgba[bg][fg] : undefined;
    };
    ColorContrastCache.prototype.setColor = function (bg, fg, value) {
        if (!this._color[bg]) {
            this._color[bg] = {};
        }
        this._color[bg][fg] = value;
    };
    ColorContrastCache.prototype.getColor = function (bg, fg) {
        return this._color[bg] ? this._color[bg][fg] : undefined;
    };
    return ColorContrastCache;
}());
exports.ColorContrastCache = ColorContrastCache;


/***/ }),

/***/ "./out/browser/ColorManager.js":
/*!*************************************!*\
  !*** ./out/browser/ColorManager.js ***!
  \*************************************/
/*! flagged exports */
/*! export ColorManager [provided] [no usage info] [missing usage info prevents renaming] */
/*! export DEFAULT_ANSI_COLORS [provided] [no usage info] [missing usage info prevents renaming] */
/*! export __esModule [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_exports__, __webpack_require__ */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ColorManager = exports.DEFAULT_ANSI_COLORS = void 0;
var Color_1 = __webpack_require__(/*! browser/Color */ "./out/browser/Color.js");
var ColorContrastCache_1 = __webpack_require__(/*! browser/ColorContrastCache */ "./out/browser/ColorContrastCache.js");
var DEFAULT_FOREGROUND = Color_1.css.toColor('#ffffff');
var DEFAULT_BACKGROUND = Color_1.css.toColor('#000000');
var DEFAULT_CURSOR = Color_1.css.toColor('#ffffff');
var DEFAULT_CURSOR_ACCENT = Color_1.css.toColor('#000000');
var DEFAULT_SELECTION = {
    css: 'rgba(255, 255, 255, 0.3)',
    rgba: 0xFFFFFF4D
};
exports.DEFAULT_ANSI_COLORS = Object.freeze((function () {
    var colors = [
        Color_1.css.toColor('#2e3436'),
        Color_1.css.toColor('#cc0000'),
        Color_1.css.toColor('#4e9a06'),
        Color_1.css.toColor('#c4a000'),
        Color_1.css.toColor('#3465a4'),
        Color_1.css.toColor('#75507b'),
        Color_1.css.toColor('#06989a'),
        Color_1.css.toColor('#d3d7cf'),
        Color_1.css.toColor('#555753'),
        Color_1.css.toColor('#ef2929'),
        Color_1.css.toColor('#8ae234'),
        Color_1.css.toColor('#fce94f'),
        Color_1.css.toColor('#729fcf'),
        Color_1.css.toColor('#ad7fa8'),
        Color_1.css.toColor('#34e2e2'),
        Color_1.css.toColor('#eeeeec')
    ];
    var v = [0x00, 0x5f, 0x87, 0xaf, 0xd7, 0xff];
    for (var i = 0; i < 216; i++) {
        var r = v[(i / 36) % 6 | 0];
        var g = v[(i / 6) % 6 | 0];
        var b = v[i % 6];
        colors.push({
            css: Color_1.channels.toCss(r, g, b),
            rgba: Color_1.channels.toRgba(r, g, b)
        });
    }
    for (var i = 0; i < 24; i++) {
        var c = 8 + i * 10;
        colors.push({
            css: Color_1.channels.toCss(c, c, c),
            rgba: Color_1.channels.toRgba(c, c, c)
        });
    }
    return colors;
})());
var ColorManager = (function () {
    function ColorManager(document, allowTransparency) {
        this.allowTransparency = allowTransparency;
        var canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        var ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Could not get rendering context');
        }
        this._ctx = ctx;
        this._ctx.globalCompositeOperation = 'copy';
        this._litmusColor = this._ctx.createLinearGradient(0, 0, 1, 1);
        this._contrastCache = new ColorContrastCache_1.ColorContrastCache();
        this.colors = {
            foreground: DEFAULT_FOREGROUND,
            background: DEFAULT_BACKGROUND,
            cursor: DEFAULT_CURSOR,
            cursorAccent: DEFAULT_CURSOR_ACCENT,
            selectionTransparent: DEFAULT_SELECTION,
            selectionOpaque: Color_1.color.blend(DEFAULT_BACKGROUND, DEFAULT_SELECTION),
            ansi: exports.DEFAULT_ANSI_COLORS.slice(),
            contrastCache: this._contrastCache
        };
    }
    ColorManager.prototype.onOptionsChange = function (key) {
        if (key === 'minimumContrastRatio') {
            this._contrastCache.clear();
        }
    };
    ColorManager.prototype.setTheme = function (theme) {
        if (theme === void 0) { theme = {}; }
        this.colors.foreground = this._parseColor(theme.foreground, DEFAULT_FOREGROUND);
        this.colors.background = this._parseColor(theme.background, DEFAULT_BACKGROUND);
        this.colors.cursor = this._parseColor(theme.cursor, DEFAULT_CURSOR, true);
        this.colors.cursorAccent = this._parseColor(theme.cursorAccent, DEFAULT_CURSOR_ACCENT, true);
        this.colors.selectionTransparent = this._parseColor(theme.selection, DEFAULT_SELECTION, true);
        this.colors.selectionOpaque = Color_1.color.blend(this.colors.background, this.colors.selectionTransparent);
        if (Color_1.color.isOpaque(this.colors.selectionTransparent)) {
            var opacity = 0.3;
            this.colors.selectionTransparent = Color_1.color.opacity(this.colors.selectionTransparent, opacity);
        }
        this.colors.ansi[0] = this._parseColor(theme.black, exports.DEFAULT_ANSI_COLORS[0]);
        this.colors.ansi[1] = this._parseColor(theme.red, exports.DEFAULT_ANSI_COLORS[1]);
        this.colors.ansi[2] = this._parseColor(theme.green, exports.DEFAULT_ANSI_COLORS[2]);
        this.colors.ansi[3] = this._parseColor(theme.yellow, exports.DEFAULT_ANSI_COLORS[3]);
        this.colors.ansi[4] = this._parseColor(theme.blue, exports.DEFAULT_ANSI_COLORS[4]);
        this.colors.ansi[5] = this._parseColor(theme.magenta, exports.DEFAULT_ANSI_COLORS[5]);
        this.colors.ansi[6] = this._parseColor(theme.cyan, exports.DEFAULT_ANSI_COLORS[6]);
        this.colors.ansi[7] = this._parseColor(theme.white, exports.DEFAULT_ANSI_COLORS[7]);
        this.colors.ansi[8] = this._parseColor(theme.brightBlack, exports.DEFAULT_ANSI_COLORS[8]);
        this.colors.ansi[9] = this._parseColor(theme.brightRed, exports.DEFAULT_ANSI_COLORS[9]);
        this.colors.ansi[10] = this._parseColor(theme.brightGreen, exports.DEFAULT_ANSI_COLORS[10]);
        this.colors.ansi[11] = this._parseColor(theme.brightYellow, exports.DEFAULT_ANSI_COLORS[11]);
        this.colors.ansi[12] = this._parseColor(theme.brightBlue, exports.DEFAULT_ANSI_COLORS[12]);
        this.colors.ansi[13] = this._parseColor(theme.brightMagenta, exports.DEFAULT_ANSI_COLORS[13]);
        this.colors.ansi[14] = this._parseColor(theme.brightCyan, exports.DEFAULT_ANSI_COLORS[14]);
        this.colors.ansi[15] = this._parseColor(theme.brightWhite, exports.DEFAULT_ANSI_COLORS[15]);
        this._contrastCache.clear();
    };
    ColorManager.prototype._parseColor = function (css, fallback, allowTransparency) {
        if (allowTransparency === void 0) { allowTransparency = this.allowTransparency; }
        if (css === undefined) {
            return fallback;
        }
        this._ctx.fillStyle = this._litmusColor;
        this._ctx.fillStyle = css;
        if (typeof this._ctx.fillStyle !== 'string') {
            console.warn("Color: " + css + " is invalid using fallback " + fallback.css);
            return fallback;
        }
        this._ctx.fillRect(0, 0, 1, 1);
        var data = this._ctx.getImageData(0, 0, 1, 1).data;
        if (data[3] !== 0xFF) {
            if (!allowTransparency) {
                console.warn("Color: " + css + " is using transparency, but allowTransparency is false. " +
                    ("Using fallback " + fallback.css + "."));
                return fallback;
            }
            var _a = this._ctx.fillStyle.substring(5, this._ctx.fillStyle.length - 1).split(',').map(function (component) { return Number(component); }), r = _a[0], g = _a[1], b = _a[2], a = _a[3];
            var alpha = Math.round(a * 255);
            var rgba = Color_1.channels.toRgba(r, g, b, alpha);
            return {
                rgba: rgba,
                css: css
            };
        }
        return {
            css: this._ctx.fillStyle,
            rgba: Color_1.channels.toRgba(data[0], data[1], data[2], data[3])
        };
    };
    return ColorManager;
}());
exports.ColorManager = ColorManager;


/***/ }),

/***/ "./out/browser/Dom.js":
/*!****************************!*\
  !*** ./out/browser/Dom.js ***!
  \****************************/
/*! flagged exports */
/*! export __esModule [provided] [no usage info] [missing usage info prevents renaming] */
/*! export removeElementFromParent [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_exports__ */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.removeElementFromParent = void 0;
function removeElementFromParent() {
    var _a;
    var elements = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        elements[_i] = arguments[_i];
    }
    for (var _b = 0, elements_1 = elements; _b < elements_1.length; _b++) {
        var e = elements_1[_b];
        (_a = e === null || e === void 0 ? void 0 : e.parentElement) === null || _a === void 0 ? void 0 : _a.removeChild(e);
    }
}
exports.removeElementFromParent = removeElementFromParent;


/***/ }),

/***/ "./out/browser/Lifecycle.js":
/*!**********************************!*\
  !*** ./out/browser/Lifecycle.js ***!
  \**********************************/
/*! flagged exports */
/*! export __esModule [provided] [no usage info] [missing usage info prevents renaming] */
/*! export addDisposableDomListener [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_exports__ */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.addDisposableDomListener = void 0;
function addDisposableDomListener(node, type, handler, options) {
    node.addEventListener(type, handler, options);
    var disposed = false;
    return {
        dispose: function () {
            if (disposed) {
                return;
            }
            disposed = true;
            node.removeEventListener(type, handler, options);
        }
    };
}
exports.addDisposableDomListener = addDisposableDomListener;


/***/ }),

/***/ "./out/browser/Linkifier.js":
/*!**********************************!*\
  !*** ./out/browser/Linkifier.js ***!
  \**********************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: top-level-this-exports, __webpack_exports__, __webpack_require__ */
/*! CommonJS bailout: this is used directly at 2:18-22 */
/*! CommonJS bailout: this is used directly at 8:15-19 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MouseZone = exports.Linkifier = void 0;
var EventEmitter_1 = __webpack_require__(/*! common/EventEmitter */ "./out/common/EventEmitter.js");
var Services_1 = __webpack_require__(/*! common/services/Services */ "./out/common/services/Services.js");
var OVERSCAN_CHAR_LIMIT = 2000;
var Linkifier = (function () {
    function Linkifier(_bufferService, _logService, _unicodeService) {
        this._bufferService = _bufferService;
        this._logService = _logService;
        this._unicodeService = _unicodeService;
        this._linkMatchers = [];
        this._nextLinkMatcherId = 0;
        this._onShowLinkUnderline = new EventEmitter_1.EventEmitter();
        this._onHideLinkUnderline = new EventEmitter_1.EventEmitter();
        this._onLinkTooltip = new EventEmitter_1.EventEmitter();
        this._rowsToLinkify = {
            start: undefined,
            end: undefined
        };
    }
    Object.defineProperty(Linkifier.prototype, "onShowLinkUnderline", {
        get: function () { return this._onShowLinkUnderline.event; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Linkifier.prototype, "onHideLinkUnderline", {
        get: function () { return this._onHideLinkUnderline.event; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Linkifier.prototype, "onLinkTooltip", {
        get: function () { return this._onLinkTooltip.event; },
        enumerable: false,
        configurable: true
    });
    Linkifier.prototype.attachToDom = function (element, mouseZoneManager) {
        this._element = element;
        this._mouseZoneManager = mouseZoneManager;
    };
    Linkifier.prototype.linkifyRows = function (start, end) {
        var _this = this;
        if (!this._mouseZoneManager) {
            return;
        }
        if (this._rowsToLinkify.start === undefined || this._rowsToLinkify.end === undefined) {
            this._rowsToLinkify.start = start;
            this._rowsToLinkify.end = end;
        }
        else {
            this._rowsToLinkify.start = Math.min(this._rowsToLinkify.start, start);
            this._rowsToLinkify.end = Math.max(this._rowsToLinkify.end, end);
        }
        this._mouseZoneManager.clearAll(start, end);
        if (this._rowsTimeoutId) {
            clearTimeout(this._rowsTimeoutId);
        }
        this._rowsTimeoutId = setTimeout(function () { return _this._linkifyRows(); }, Linkifier._timeBeforeLatency);
    };
    Linkifier.prototype._linkifyRows = function () {
        this._rowsTimeoutId = undefined;
        var buffer = this._bufferService.buffer;
        if (this._rowsToLinkify.start === undefined || this._rowsToLinkify.end === undefined) {
            this._logService.debug('_rowToLinkify was unset before _linkifyRows was called');
            return;
        }
        var absoluteRowIndexStart = buffer.ydisp + this._rowsToLinkify.start;
        if (absoluteRowIndexStart >= buffer.lines.length) {
            return;
        }
        var absoluteRowIndexEnd = buffer.ydisp + Math.min(this._rowsToLinkify.end, this._bufferService.rows) + 1;
        var overscanLineLimit = Math.ceil(OVERSCAN_CHAR_LIMIT / this._bufferService.cols);
        var iterator = this._bufferService.buffer.iterator(false, absoluteRowIndexStart, absoluteRowIndexEnd, overscanLineLimit, overscanLineLimit);
        while (iterator.hasNext()) {
            var lineData = iterator.next();
            for (var i = 0; i < this._linkMatchers.length; i++) {
                this._doLinkifyRow(lineData.range.first, lineData.content, this._linkMatchers[i]);
            }
        }
        this._rowsToLinkify.start = undefined;
        this._rowsToLinkify.end = undefined;
    };
    Linkifier.prototype.registerLinkMatcher = function (regex, handler, options) {
        if (options === void 0) { options = {}; }
        if (!handler) {
            throw new Error('handler must be defined');
        }
        var matcher = {
            id: this._nextLinkMatcherId++,
            regex: regex,
            handler: handler,
            matchIndex: options.matchIndex,
            validationCallback: options.validationCallback,
            hoverTooltipCallback: options.tooltipCallback,
            hoverLeaveCallback: options.leaveCallback,
            willLinkActivate: options.willLinkActivate,
            priority: options.priority || 0
        };
        this._addLinkMatcherToList(matcher);
        return matcher.id;
    };
    Linkifier.prototype._addLinkMatcherToList = function (matcher) {
        if (this._linkMatchers.length === 0) {
            this._linkMatchers.push(matcher);
            return;
        }
        for (var i = this._linkMatchers.length - 1; i >= 0; i--) {
            if (matcher.priority <= this._linkMatchers[i].priority) {
                this._linkMatchers.splice(i + 1, 0, matcher);
                return;
            }
        }
        this._linkMatchers.splice(0, 0, matcher);
    };
    Linkifier.prototype.deregisterLinkMatcher = function (matcherId) {
        for (var i = 0; i < this._linkMatchers.length; i++) {
            if (this._linkMatchers[i].id === matcherId) {
                this._linkMatchers.splice(i, 1);
                return true;
            }
        }
        return false;
    };
    Linkifier.prototype._doLinkifyRow = function (rowIndex, text, matcher) {
        var _this = this;
        var rex = new RegExp(matcher.regex.source, (matcher.regex.flags || '') + 'g');
        var match;
        var stringIndex = -1;
        var _loop_1 = function () {
            var uri = match[typeof matcher.matchIndex !== 'number' ? 0 : matcher.matchIndex];
            if (!uri) {
                this_1._logService.debug('match found without corresponding matchIndex', match, matcher);
                return "break";
            }
            stringIndex = text.indexOf(uri, stringIndex + 1);
            rex.lastIndex = stringIndex + uri.length;
            if (stringIndex < 0) {
                return "break";
            }
            var bufferIndex = this_1._bufferService.buffer.stringIndexToBufferIndex(rowIndex, stringIndex);
            if (bufferIndex[0] < 0) {
                return "break";
            }
            var line = this_1._bufferService.buffer.lines.get(bufferIndex[0]);
            if (!line) {
                return "break";
            }
            var attr = line.getFg(bufferIndex[1]);
            var fg = attr ? (attr >> 9) & 0x1ff : undefined;
            if (matcher.validationCallback) {
                matcher.validationCallback(uri, function (isValid) {
                    if (_this._rowsTimeoutId) {
                        return;
                    }
                    if (isValid) {
                        _this._addLink(bufferIndex[1], bufferIndex[0] - _this._bufferService.buffer.ydisp, uri, matcher, fg);
                    }
                });
            }
            else {
                this_1._addLink(bufferIndex[1], bufferIndex[0] - this_1._bufferService.buffer.ydisp, uri, matcher, fg);
            }
        };
        var this_1 = this;
        while ((match = rex.exec(text)) !== null) {
            var state_1 = _loop_1();
            if (state_1 === "break")
                break;
        }
    };
    Linkifier.prototype._addLink = function (x, y, uri, matcher, fg) {
        var _this = this;
        if (!this._mouseZoneManager || !this._element) {
            return;
        }
        var width = this._unicodeService.getStringCellWidth(uri);
        var x1 = x % this._bufferService.cols;
        var y1 = y + Math.floor(x / this._bufferService.cols);
        var x2 = (x1 + width) % this._bufferService.cols;
        var y2 = y1 + Math.floor((x1 + width) / this._bufferService.cols);
        if (x2 === 0) {
            x2 = this._bufferService.cols;
            y2--;
        }
        this._mouseZoneManager.add(new MouseZone(x1 + 1, y1 + 1, x2 + 1, y2 + 1, function (e) {
            if (matcher.handler) {
                return matcher.handler(e, uri);
            }
            var newWindow = window.open();
            if (newWindow) {
                newWindow.opener = null;
                newWindow.location.href = uri;
            }
            else {
                console.warn('Opening link blocked as opener could not be cleared');
            }
        }, function () {
            _this._onShowLinkUnderline.fire(_this._createLinkHoverEvent(x1, y1, x2, y2, fg));
            _this._element.classList.add('xterm-cursor-pointer');
        }, function (e) {
            _this._onLinkTooltip.fire(_this._createLinkHoverEvent(x1, y1, x2, y2, fg));
            if (matcher.hoverTooltipCallback) {
                matcher.hoverTooltipCallback(e, uri, { start: { x: x1, y: y1 }, end: { x: x2, y: y2 } });
            }
        }, function () {
            _this._onHideLinkUnderline.fire(_this._createLinkHoverEvent(x1, y1, x2, y2, fg));
            _this._element.classList.remove('xterm-cursor-pointer');
            if (matcher.hoverLeaveCallback) {
                matcher.hoverLeaveCallback();
            }
        }, function (e) {
            if (matcher.willLinkActivate) {
                return matcher.willLinkActivate(e, uri);
            }
            return true;
        }));
    };
    Linkifier.prototype._createLinkHoverEvent = function (x1, y1, x2, y2, fg) {
        return { x1: x1, y1: y1, x2: x2, y2: y2, cols: this._bufferService.cols, fg: fg };
    };
    Linkifier._timeBeforeLatency = 200;
    Linkifier = __decorate([
        __param(0, Services_1.IBufferService),
        __param(1, Services_1.ILogService),
        __param(2, Services_1.IUnicodeService)
    ], Linkifier);
    return Linkifier;
}());
exports.Linkifier = Linkifier;
var MouseZone = (function () {
    function MouseZone(x1, y1, x2, y2, clickCallback, hoverCallback, tooltipCallback, leaveCallback, willLinkActivate) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.clickCallback = clickCallback;
        this.hoverCallback = hoverCallback;
        this.tooltipCallback = tooltipCallback;
        this.leaveCallback = leaveCallback;
        this.willLinkActivate = willLinkActivate;
    }
    return MouseZone;
}());
exports.MouseZone = MouseZone;


/***/ }),

/***/ "./out/browser/Linkifier2.js":
/*!***********************************!*\
  !*** ./out/browser/Linkifier2.js ***!
  \***********************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: top-level-this-exports, __webpack_exports__, __webpack_require__ */
/*! CommonJS bailout: this is used directly at 2:17-21 */
/*! CommonJS bailout: this is used directly at 15:18-22 */
/*! CommonJS bailout: this is used directly at 21:15-19 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Linkifier2 = void 0;
var Services_1 = __webpack_require__(/*! common/services/Services */ "./out/common/services/Services.js");
var EventEmitter_1 = __webpack_require__(/*! common/EventEmitter */ "./out/common/EventEmitter.js");
var Lifecycle_1 = __webpack_require__(/*! common/Lifecycle */ "./out/common/Lifecycle.js");
var Lifecycle_2 = __webpack_require__(/*! browser/Lifecycle */ "./out/browser/Lifecycle.js");
var Linkifier2 = (function (_super) {
    __extends(Linkifier2, _super);
    function Linkifier2(_bufferService) {
        var _this = _super.call(this) || this;
        _this._bufferService = _bufferService;
        _this._linkProviders = [];
        _this._linkCacheDisposables = [];
        _this._isMouseOut = true;
        _this._activeLine = -1;
        _this._onShowLinkUnderline = _this.register(new EventEmitter_1.EventEmitter());
        _this._onHideLinkUnderline = _this.register(new EventEmitter_1.EventEmitter());
        _this.register(Lifecycle_1.getDisposeArrayDisposable(_this._linkCacheDisposables));
        return _this;
    }
    Object.defineProperty(Linkifier2.prototype, "onShowLinkUnderline", {
        get: function () { return this._onShowLinkUnderline.event; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Linkifier2.prototype, "onHideLinkUnderline", {
        get: function () { return this._onHideLinkUnderline.event; },
        enumerable: false,
        configurable: true
    });
    Linkifier2.prototype.registerLinkProvider = function (linkProvider) {
        var _this = this;
        this._linkProviders.push(linkProvider);
        return {
            dispose: function () {
                var providerIndex = _this._linkProviders.indexOf(linkProvider);
                if (providerIndex !== -1) {
                    _this._linkProviders.splice(providerIndex, 1);
                }
            }
        };
    };
    Linkifier2.prototype.attachToDom = function (element, mouseService, renderService) {
        var _this = this;
        this._element = element;
        this._mouseService = mouseService;
        this._renderService = renderService;
        this.register(Lifecycle_2.addDisposableDomListener(this._element, 'mouseleave', function () {
            _this._isMouseOut = true;
            _this._clearCurrentLink();
        }));
        this.register(Lifecycle_2.addDisposableDomListener(this._element, 'mousemove', this._onMouseMove.bind(this)));
        this.register(Lifecycle_2.addDisposableDomListener(this._element, 'click', this._onClick.bind(this)));
    };
    Linkifier2.prototype._onMouseMove = function (event) {
        this._lastMouseEvent = event;
        if (!this._element || !this._mouseService) {
            return;
        }
        var position = this._positionFromMouseEvent(event, this._element, this._mouseService);
        if (!position) {
            return;
        }
        this._isMouseOut = false;
        var composedPath = event.composedPath();
        for (var i = 0; i < composedPath.length; i++) {
            var target = composedPath[i];
            if (target.classList.contains('xterm')) {
                break;
            }
            if (target.classList.contains('xterm-hover')) {
                return;
            }
        }
        if (!this._lastBufferCell || (position.x !== this._lastBufferCell.x || position.y !== this._lastBufferCell.y)) {
            this._onHover(position);
            this._lastBufferCell = position;
        }
    };
    Linkifier2.prototype._onHover = function (position) {
        if (this._activeLine !== position.y) {
            this._clearCurrentLink();
            this._askForLink(position, false);
            return;
        }
        var isCurrentLinkInPosition = this._currentLink && this._linkAtPosition(this._currentLink.link, position);
        if (!isCurrentLinkInPosition) {
            this._clearCurrentLink();
            this._askForLink(position, true);
        }
    };
    Linkifier2.prototype._askForLink = function (position, useLineCache) {
        var _this = this;
        var _a;
        if (!this._activeProviderReplies || !useLineCache) {
            (_a = this._activeProviderReplies) === null || _a === void 0 ? void 0 : _a.forEach(function (reply) {
                reply === null || reply === void 0 ? void 0 : reply.forEach(function (linkWithState) {
                    if (linkWithState.link.dispose) {
                        linkWithState.link.dispose();
                    }
                });
            });
            this._activeProviderReplies = new Map();
            this._activeLine = position.y;
        }
        var linkProvided = false;
        this._linkProviders.forEach(function (linkProvider, i) {
            var _a;
            if (useLineCache) {
                var existingReply = (_a = _this._activeProviderReplies) === null || _a === void 0 ? void 0 : _a.get(i);
                if (existingReply) {
                    linkProvided = _this._checkLinkProviderResult(i, position, linkProvided);
                }
            }
            else {
                linkProvider.provideLinks(position.y, function (links) {
                    var _a, _b;
                    if (_this._isMouseOut) {
                        return;
                    }
                    var linksWithState = links === null || links === void 0 ? void 0 : links.map(function (link) { return ({ link: link }); });
                    (_a = _this._activeProviderReplies) === null || _a === void 0 ? void 0 : _a.set(i, linksWithState);
                    linkProvided = _this._checkLinkProviderResult(i, position, linkProvided);
                    if (((_b = _this._activeProviderReplies) === null || _b === void 0 ? void 0 : _b.size) === _this._linkProviders.length) {
                        _this._removeIntersectingLinks(position.y, _this._activeProviderReplies);
                    }
                });
            }
        });
    };
    Linkifier2.prototype._removeIntersectingLinks = function (y, replies) {
        var occupiedCells = new Set();
        for (var i = 0; i < replies.size; i++) {
            var providerReply = replies.get(i);
            if (!providerReply) {
                continue;
            }
            for (var i_1 = 0; i_1 < providerReply.length; i_1++) {
                var linkWithState = providerReply[i_1];
                var startX = linkWithState.link.range.start.y < y ? 0 : linkWithState.link.range.start.x;
                var endX = linkWithState.link.range.end.y > y ? this._bufferService.cols : linkWithState.link.range.end.x;
                for (var x = startX; x <= endX; x++) {
                    if (occupiedCells.has(x)) {
                        providerReply.splice(i_1--, 1);
                        break;
                    }
                    occupiedCells.add(x);
                }
            }
        }
    };
    Linkifier2.prototype._checkLinkProviderResult = function (index, position, linkProvided) {
        var _this = this;
        var _a;
        if (!this._activeProviderReplies) {
            return linkProvided;
        }
        var links = this._activeProviderReplies.get(index);
        var hasLinkBefore = false;
        for (var j = 0; j < index; j++) {
            if (!this._activeProviderReplies.has(j) || this._activeProviderReplies.get(j)) {
                hasLinkBefore = true;
            }
        }
        if (!hasLinkBefore && links) {
            var linkAtPosition = links.find(function (link) { return _this._linkAtPosition(link.link, position); });
            if (linkAtPosition) {
                linkProvided = true;
                this._handleNewLink(linkAtPosition);
            }
        }
        if (this._activeProviderReplies.size === this._linkProviders.length && !linkProvided) {
            for (var j = 0; j < this._activeProviderReplies.size; j++) {
                var currentLink = (_a = this._activeProviderReplies.get(j)) === null || _a === void 0 ? void 0 : _a.find(function (link) { return _this._linkAtPosition(link.link, position); });
                if (currentLink) {
                    linkProvided = true;
                    this._handleNewLink(currentLink);
                    break;
                }
            }
        }
        return linkProvided;
    };
    Linkifier2.prototype._onClick = function (event) {
        if (!this._element || !this._mouseService || !this._currentLink) {
            return;
        }
        var position = this._positionFromMouseEvent(event, this._element, this._mouseService);
        if (!position) {
            return;
        }
        if (this._linkAtPosition(this._currentLink.link, position)) {
            this._currentLink.link.activate(event, this._currentLink.link.text);
        }
    };
    Linkifier2.prototype._clearCurrentLink = function (startRow, endRow) {
        if (!this._element || !this._currentLink || !this._lastMouseEvent) {
            return;
        }
        if (!startRow || !endRow || (this._currentLink.link.range.start.y >= startRow && this._currentLink.link.range.end.y <= endRow)) {
            this._linkLeave(this._element, this._currentLink.link, this._lastMouseEvent);
            this._currentLink = undefined;
            Lifecycle_1.disposeArray(this._linkCacheDisposables);
        }
    };
    Linkifier2.prototype._handleNewLink = function (linkWithState) {
        var _this = this;
        if (!this._element || !this._lastMouseEvent || !this._mouseService) {
            return;
        }
        var position = this._positionFromMouseEvent(this._lastMouseEvent, this._element, this._mouseService);
        if (!position) {
            return;
        }
        if (this._linkAtPosition(linkWithState.link, position)) {
            this._currentLink = linkWithState;
            this._currentLink.state = {
                decorations: {
                    underline: linkWithState.link.decorations === undefined ? true : linkWithState.link.decorations.underline,
                    pointerCursor: linkWithState.link.decorations === undefined ? true : linkWithState.link.decorations.pointerCursor
                },
                isHovered: true
            };
            this._linkHover(this._element, linkWithState.link, this._lastMouseEvent);
            linkWithState.link.decorations = {};
            Object.defineProperties(linkWithState.link.decorations, {
                pointerCursor: {
                    get: function () { var _a, _b; return (_b = (_a = _this._currentLink) === null || _a === void 0 ? void 0 : _a.state) === null || _b === void 0 ? void 0 : _b.decorations.pointerCursor; },
                    set: function (v) {
                        var _a, _b;
                        if (((_a = _this._currentLink) === null || _a === void 0 ? void 0 : _a.state) && _this._currentLink.state.decorations.pointerCursor !== v) {
                            _this._currentLink.state.decorations.pointerCursor = v;
                            if (_this._currentLink.state.isHovered) {
                                (_b = _this._element) === null || _b === void 0 ? void 0 : _b.classList.toggle('xterm-cursor-pointer', v);
                            }
                        }
                    }
                },
                underline: {
                    get: function () { var _a, _b; return (_b = (_a = _this._currentLink) === null || _a === void 0 ? void 0 : _a.state) === null || _b === void 0 ? void 0 : _b.decorations.underline; },
                    set: function (v) {
                        var _a, _b, _c;
                        if (((_a = _this._currentLink) === null || _a === void 0 ? void 0 : _a.state) && ((_c = (_b = _this._currentLink) === null || _b === void 0 ? void 0 : _b.state) === null || _c === void 0 ? void 0 : _c.decorations.underline) !== v) {
                            _this._currentLink.state.decorations.underline = v;
                            if (_this._currentLink.state.isHovered) {
                                _this._fireUnderlineEvent(linkWithState.link, v);
                            }
                        }
                    }
                }
            });
            if (this._renderService) {
                this._linkCacheDisposables.push(this._renderService.onRenderedBufferChange(function (e) {
                    var start = e.start === 0 ? 0 : e.start + 1 + _this._bufferService.buffer.ydisp;
                    _this._clearCurrentLink(start, e.end + 1 + _this._bufferService.buffer.ydisp);
                }));
            }
        }
    };
    Linkifier2.prototype._linkHover = function (element, link, event) {
        var _a;
        if ((_a = this._currentLink) === null || _a === void 0 ? void 0 : _a.state) {
            this._currentLink.state.isHovered = true;
            if (this._currentLink.state.decorations.underline) {
                this._fireUnderlineEvent(link, true);
            }
            if (this._currentLink.state.decorations.pointerCursor) {
                element.classList.add('xterm-cursor-pointer');
            }
        }
        if (link.hover) {
            link.hover(event, link.text);
        }
    };
    Linkifier2.prototype._fireUnderlineEvent = function (link, showEvent) {
        var range = link.range;
        var scrollOffset = this._bufferService.buffer.ydisp;
        var event = this._createLinkUnderlineEvent(range.start.x - 1, range.start.y - scrollOffset - 1, range.end.x, range.end.y - scrollOffset - 1, undefined);
        var emitter = showEvent ? this._onShowLinkUnderline : this._onHideLinkUnderline;
        emitter.fire(event);
    };
    Linkifier2.prototype._linkLeave = function (element, link, event) {
        var _a;
        if ((_a = this._currentLink) === null || _a === void 0 ? void 0 : _a.state) {
            this._currentLink.state.isHovered = false;
            if (this._currentLink.state.decorations.underline) {
                this._fireUnderlineEvent(link, false);
            }
            if (this._currentLink.state.decorations.pointerCursor) {
                element.classList.remove('xterm-cursor-pointer');
            }
        }
        if (link.leave) {
            link.leave(event, link.text);
        }
    };
    Linkifier2.prototype._linkAtPosition = function (link, position) {
        var sameLine = link.range.start.y === link.range.end.y;
        var wrappedFromLeft = link.range.start.y < position.y;
        var wrappedToRight = link.range.end.y > position.y;
        return ((sameLine && link.range.start.x <= position.x && link.range.end.x >= position.x) ||
            (wrappedFromLeft && link.range.end.x >= position.x) ||
            (wrappedToRight && link.range.start.x <= position.x) ||
            (wrappedFromLeft && wrappedToRight)) &&
            link.range.start.y <= position.y &&
            link.range.end.y >= position.y;
    };
    Linkifier2.prototype._positionFromMouseEvent = function (event, element, mouseService) {
        var coords = mouseService.getCoords(event, element, this._bufferService.cols, this._bufferService.rows);
        if (!coords) {
            return;
        }
        return { x: coords[0], y: coords[1] + this._bufferService.buffer.ydisp };
    };
    Linkifier2.prototype._createLinkUnderlineEvent = function (x1, y1, x2, y2, fg) {
        return { x1: x1, y1: y1, x2: x2, y2: y2, cols: this._bufferService.cols, fg: fg };
    };
    Linkifier2 = __decorate([
        __param(0, Services_1.IBufferService)
    ], Linkifier2);
    return Linkifier2;
}(Lifecycle_1.Disposable));
exports.Linkifier2 = Linkifier2;


/***/ }),

/***/ "./out/browser/LocalizableStrings.js":
/*!*******************************************!*\
  !*** ./out/browser/LocalizableStrings.js ***!
  \*******************************************/
/*! flagged exports */
/*! export __esModule [provided] [no usage info] [missing usage info prevents renaming] */
/*! export promptLabel [provided] [no usage info] [missing usage info prevents renaming] */
/*! export tooMuchOutput [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_exports__ */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.tooMuchOutput = exports.promptLabel = void 0;
exports.promptLabel = 'Terminal input';
exports.tooMuchOutput = 'Too much output to announce, navigate to rows manually to read';


/***/ }),

/***/ "./out/browser/MouseZoneManager.js":
/*!*****************************************!*\
  !*** ./out/browser/MouseZoneManager.js ***!
  \*****************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: top-level-this-exports, __webpack_exports__, __webpack_require__ */
/*! CommonJS bailout: this is used directly at 2:17-21 */
/*! CommonJS bailout: this is used directly at 15:18-22 */
/*! CommonJS bailout: this is used directly at 21:15-19 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MouseZoneManager = void 0;
var Lifecycle_1 = __webpack_require__(/*! common/Lifecycle */ "./out/common/Lifecycle.js");
var Lifecycle_2 = __webpack_require__(/*! browser/Lifecycle */ "./out/browser/Lifecycle.js");
var Services_1 = __webpack_require__(/*! browser/services/Services */ "./out/browser/services/Services.js");
var Services_2 = __webpack_require__(/*! common/services/Services */ "./out/common/services/Services.js");
var MouseZoneManager = (function (_super) {
    __extends(MouseZoneManager, _super);
    function MouseZoneManager(_element, _screenElement, _bufferService, _mouseService, _selectionService, _optionsService) {
        var _this = _super.call(this) || this;
        _this._element = _element;
        _this._screenElement = _screenElement;
        _this._bufferService = _bufferService;
        _this._mouseService = _mouseService;
        _this._selectionService = _selectionService;
        _this._optionsService = _optionsService;
        _this._zones = [];
        _this._areZonesActive = false;
        _this._lastHoverCoords = [undefined, undefined];
        _this._initialSelectionLength = 0;
        _this.register(Lifecycle_2.addDisposableDomListener(_this._element, 'mousedown', function (e) { return _this._onMouseDown(e); }));
        _this._mouseMoveListener = function (e) { return _this._onMouseMove(e); };
        _this._mouseLeaveListener = function (e) { return _this._onMouseLeave(e); };
        _this._clickListener = function (e) { return _this._onClick(e); };
        return _this;
    }
    MouseZoneManager.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this._deactivate();
    };
    MouseZoneManager.prototype.add = function (zone) {
        this._zones.push(zone);
        if (this._zones.length === 1) {
            this._activate();
        }
    };
    MouseZoneManager.prototype.clearAll = function (start, end) {
        if (this._zones.length === 0) {
            return;
        }
        if (!start || !end) {
            start = 0;
            end = this._bufferService.rows - 1;
        }
        for (var i = 0; i < this._zones.length; i++) {
            var zone = this._zones[i];
            if ((zone.y1 > start && zone.y1 <= end + 1) ||
                (zone.y2 > start && zone.y2 <= end + 1) ||
                (zone.y1 < start && zone.y2 > end + 1)) {
                if (this._currentZone && this._currentZone === zone) {
                    this._currentZone.leaveCallback();
                    this._currentZone = undefined;
                }
                this._zones.splice(i--, 1);
            }
        }
        if (this._zones.length === 0) {
            this._deactivate();
        }
    };
    MouseZoneManager.prototype._activate = function () {
        if (!this._areZonesActive) {
            this._areZonesActive = true;
            this._element.addEventListener('mousemove', this._mouseMoveListener);
            this._element.addEventListener('mouseleave', this._mouseLeaveListener);
            this._element.addEventListener('click', this._clickListener);
        }
    };
    MouseZoneManager.prototype._deactivate = function () {
        if (this._areZonesActive) {
            this._areZonesActive = false;
            this._element.removeEventListener('mousemove', this._mouseMoveListener);
            this._element.removeEventListener('mouseleave', this._mouseLeaveListener);
            this._element.removeEventListener('click', this._clickListener);
        }
    };
    MouseZoneManager.prototype._onMouseMove = function (e) {
        if (this._lastHoverCoords[0] !== e.pageX || this._lastHoverCoords[1] !== e.pageY) {
            this._onHover(e);
            this._lastHoverCoords = [e.pageX, e.pageY];
        }
    };
    MouseZoneManager.prototype._onHover = function (e) {
        var _this = this;
        var zone = this._findZoneEventAt(e);
        if (zone === this._currentZone) {
            return;
        }
        if (this._currentZone) {
            this._currentZone.leaveCallback();
            this._currentZone = undefined;
            if (this._tooltipTimeout) {
                clearTimeout(this._tooltipTimeout);
            }
        }
        if (!zone) {
            return;
        }
        this._currentZone = zone;
        if (zone.hoverCallback) {
            zone.hoverCallback(e);
        }
        this._tooltipTimeout = window.setTimeout(function () { return _this._onTooltip(e); }, this._optionsService.options.linkTooltipHoverDuration);
    };
    MouseZoneManager.prototype._onTooltip = function (e) {
        this._tooltipTimeout = undefined;
        var zone = this._findZoneEventAt(e);
        if (zone && zone.tooltipCallback) {
            zone.tooltipCallback(e);
        }
    };
    MouseZoneManager.prototype._onMouseDown = function (e) {
        this._initialSelectionLength = this._getSelectionLength();
        if (!this._areZonesActive) {
            return;
        }
        var zone = this._findZoneEventAt(e);
        if (zone === null || zone === void 0 ? void 0 : zone.willLinkActivate(e)) {
            e.preventDefault();
            e.stopImmediatePropagation();
        }
    };
    MouseZoneManager.prototype._onMouseLeave = function (e) {
        if (this._currentZone) {
            this._currentZone.leaveCallback();
            this._currentZone = undefined;
            if (this._tooltipTimeout) {
                clearTimeout(this._tooltipTimeout);
            }
        }
    };
    MouseZoneManager.prototype._onClick = function (e) {
        var zone = this._findZoneEventAt(e);
        var currentSelectionLength = this._getSelectionLength();
        if (zone && currentSelectionLength === this._initialSelectionLength) {
            zone.clickCallback(e);
            e.preventDefault();
            e.stopImmediatePropagation();
        }
    };
    MouseZoneManager.prototype._getSelectionLength = function () {
        var selectionText = this._selectionService.selectionText;
        return selectionText ? selectionText.length : 0;
    };
    MouseZoneManager.prototype._findZoneEventAt = function (e) {
        var coords = this._mouseService.getCoords(e, this._screenElement, this._bufferService.cols, this._bufferService.rows);
        if (!coords) {
            return undefined;
        }
        var x = coords[0];
        var y = coords[1];
        for (var i = 0; i < this._zones.length; i++) {
            var zone = this._zones[i];
            if (zone.y1 === zone.y2) {
                if (y === zone.y1 && x >= zone.x1 && x < zone.x2) {
                    return zone;
                }
            }
            else {
                if ((y === zone.y1 && x >= zone.x1) ||
                    (y === zone.y2 && x < zone.x2) ||
                    (y > zone.y1 && y < zone.y2)) {
                    return zone;
                }
            }
        }
        return undefined;
    };
    MouseZoneManager = __decorate([
        __param(2, Services_2.IBufferService),
        __param(3, Services_1.IMouseService),
        __param(4, Services_1.ISelectionService),
        __param(5, Services_2.IOptionsService)
    ], MouseZoneManager);
    return MouseZoneManager;
}(Lifecycle_1.Disposable));
exports.MouseZoneManager = MouseZoneManager;


/***/ }),

/***/ "./out/browser/RenderDebouncer.js":
/*!****************************************!*\
  !*** ./out/browser/RenderDebouncer.js ***!
  \****************************************/
/*! flagged exports */
/*! export RenderDebouncer [provided] [no usage info] [missing usage info prevents renaming] */
/*! export __esModule [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_exports__ */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RenderDebouncer = void 0;
var RenderDebouncer = (function () {
    function RenderDebouncer(_renderCallback) {
        this._renderCallback = _renderCallback;
    }
    RenderDebouncer.prototype.dispose = function () {
        if (this._animationFrame) {
            window.cancelAnimationFrame(this._animationFrame);
            this._animationFrame = undefined;
        }
    };
    RenderDebouncer.prototype.refresh = function (rowStart, rowEnd, rowCount) {
        var _this = this;
        this._rowCount = rowCount;
        rowStart = rowStart !== undefined ? rowStart : 0;
        rowEnd = rowEnd !== undefined ? rowEnd : this._rowCount - 1;
        this._rowStart = this._rowStart !== undefined ? Math.min(this._rowStart, rowStart) : rowStart;
        this._rowEnd = this._rowEnd !== undefined ? Math.max(this._rowEnd, rowEnd) : rowEnd;
        if (this._animationFrame) {
            return;
        }
        this._animationFrame = window.requestAnimationFrame(function () { return _this._innerRefresh(); });
    };
    RenderDebouncer.prototype._innerRefresh = function () {
        if (this._rowStart === undefined || this._rowEnd === undefined || this._rowCount === undefined) {
            return;
        }
        var start = Math.max(this._rowStart, 0);
        var end = Math.min(this._rowEnd, this._rowCount - 1);
        this._rowStart = undefined;
        this._rowEnd = undefined;
        this._animationFrame = undefined;
        this._renderCallback(start, end);
    };
    return RenderDebouncer;
}());
exports.RenderDebouncer = RenderDebouncer;


/***/ }),

/***/ "./out/browser/ScreenDprMonitor.js":
/*!*****************************************!*\
  !*** ./out/browser/ScreenDprMonitor.js ***!
  \*****************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: top-level-this-exports, __webpack_exports__, __webpack_require__ */
/*! CommonJS bailout: this is used directly at 2:17-21 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ScreenDprMonitor = void 0;
var Lifecycle_1 = __webpack_require__(/*! common/Lifecycle */ "./out/common/Lifecycle.js");
var ScreenDprMonitor = (function (_super) {
    __extends(ScreenDprMonitor, _super);
    function ScreenDprMonitor() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._currentDevicePixelRatio = window.devicePixelRatio;
        return _this;
    }
    ScreenDprMonitor.prototype.setListener = function (listener) {
        var _this = this;
        if (this._listener) {
            this.clearListener();
        }
        this._listener = listener;
        this._outerListener = function () {
            if (!_this._listener) {
                return;
            }
            _this._listener(window.devicePixelRatio, _this._currentDevicePixelRatio);
            _this._updateDpr();
        };
        this._updateDpr();
    };
    ScreenDprMonitor.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this.clearListener();
    };
    ScreenDprMonitor.prototype._updateDpr = function () {
        var _a;
        if (!this._outerListener) {
            return;
        }
        (_a = this._resolutionMediaMatchList) === null || _a === void 0 ? void 0 : _a.removeListener(this._outerListener);
        this._currentDevicePixelRatio = window.devicePixelRatio;
        this._resolutionMediaMatchList = window.matchMedia("screen and (resolution: " + window.devicePixelRatio + "dppx)");
        this._resolutionMediaMatchList.addListener(this._outerListener);
    };
    ScreenDprMonitor.prototype.clearListener = function () {
        if (!this._resolutionMediaMatchList || !this._listener || !this._outerListener) {
            return;
        }
        this._resolutionMediaMatchList.removeListener(this._outerListener);
        this._resolutionMediaMatchList = undefined;
        this._listener = undefined;
        this._outerListener = undefined;
    };
    return ScreenDprMonitor;
}(Lifecycle_1.Disposable));
exports.ScreenDprMonitor = ScreenDprMonitor;


/***/ }),

/***/ "./out/browser/Terminal.js":
/*!*********************************!*\
  !*** ./out/browser/Terminal.js ***!
  \*********************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: top-level-this-exports, __webpack_exports__, __webpack_require__ */
/*! CommonJS bailout: this is used directly at 2:17-21 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Terminal = void 0;
var CompositionHelper_1 = __webpack_require__(/*! browser/input/CompositionHelper */ "./out/browser/input/CompositionHelper.js");
var Viewport_1 = __webpack_require__(/*! browser/Viewport */ "./out/browser/Viewport.js");
var Clipboard_1 = __webpack_require__(/*! browser/Clipboard */ "./out/browser/Clipboard.js");
var EscapeSequences_1 = __webpack_require__(/*! common/data/EscapeSequences */ "./out/common/data/EscapeSequences.js");
var InputHandler_1 = __webpack_require__(/*! ../common/InputHandler */ "./out/common/InputHandler.js");
var Renderer_1 = __webpack_require__(/*! browser/renderer/Renderer */ "./out/browser/renderer/Renderer.js");
var Linkifier_1 = __webpack_require__(/*! browser/Linkifier */ "./out/browser/Linkifier.js");
var SelectionService_1 = __webpack_require__(/*! browser/services/SelectionService */ "./out/browser/services/SelectionService.js");
var Browser = __webpack_require__(/*! common/Platform */ "./out/common/Platform.js");
var Lifecycle_1 = __webpack_require__(/*! browser/Lifecycle */ "./out/browser/Lifecycle.js");
var Strings = __webpack_require__(/*! browser/LocalizableStrings */ "./out/browser/LocalizableStrings.js");
var SoundService_1 = __webpack_require__(/*! browser/services/SoundService */ "./out/browser/services/SoundService.js");
var MouseZoneManager_1 = __webpack_require__(/*! browser/MouseZoneManager */ "./out/browser/MouseZoneManager.js");
var AccessibilityManager_1 = __webpack_require__(/*! ./AccessibilityManager */ "./out/browser/AccessibilityManager.js");
var DomRenderer_1 = __webpack_require__(/*! browser/renderer/dom/DomRenderer */ "./out/browser/renderer/dom/DomRenderer.js");
var Keyboard_1 = __webpack_require__(/*! common/input/Keyboard */ "./out/common/input/Keyboard.js");
var EventEmitter_1 = __webpack_require__(/*! common/EventEmitter */ "./out/common/EventEmitter.js");
var BufferLine_1 = __webpack_require__(/*! common/buffer/BufferLine */ "./out/common/buffer/BufferLine.js");
var ColorManager_1 = __webpack_require__(/*! browser/ColorManager */ "./out/browser/ColorManager.js");
var RenderService_1 = __webpack_require__(/*! browser/services/RenderService */ "./out/browser/services/RenderService.js");
var Services_1 = __webpack_require__(/*! browser/services/Services */ "./out/browser/services/Services.js");
var CharSizeService_1 = __webpack_require__(/*! browser/services/CharSizeService */ "./out/browser/services/CharSizeService.js");
var MouseService_1 = __webpack_require__(/*! browser/services/MouseService */ "./out/browser/services/MouseService.js");
var Linkifier2_1 = __webpack_require__(/*! browser/Linkifier2 */ "./out/browser/Linkifier2.js");
var CoreBrowserService_1 = __webpack_require__(/*! browser/services/CoreBrowserService */ "./out/browser/services/CoreBrowserService.js");
var CoreTerminal_1 = __webpack_require__(/*! common/CoreTerminal */ "./out/common/CoreTerminal.js");
var Color_1 = __webpack_require__(/*! browser/Color */ "./out/browser/Color.js");
var document = (typeof window !== 'undefined') ? window.document : null;
var Terminal = (function (_super) {
    __extends(Terminal, _super);
    function Terminal(options) {
        if (options === void 0) { options = {}; }
        var _this = _super.call(this, options) || this;
        _this.browser = Browser;
        _this._keyDownHandled = false;
        _this._onCursorMove = new EventEmitter_1.EventEmitter();
        _this._onKey = new EventEmitter_1.EventEmitter();
        _this._onRender = new EventEmitter_1.EventEmitter();
        _this._onSelectionChange = new EventEmitter_1.EventEmitter();
        _this._onTitleChange = new EventEmitter_1.EventEmitter();
        _this._onFocus = new EventEmitter_1.EventEmitter();
        _this._onBlur = new EventEmitter_1.EventEmitter();
        _this._onA11yCharEmitter = new EventEmitter_1.EventEmitter();
        _this._onA11yTabEmitter = new EventEmitter_1.EventEmitter();
        _this._setup();
        _this.linkifier = _this._instantiationService.createInstance(Linkifier_1.Linkifier);
        _this.linkifier2 = _this.register(_this._instantiationService.createInstance(Linkifier2_1.Linkifier2));
        _this.register(_this._inputHandler.onRequestBell(function () { return _this.bell(); }));
        _this.register(_this._inputHandler.onRequestRefreshRows(function (start, end) { return _this.refresh(start, end); }));
        _this.register(_this._inputHandler.onRequestReset(function () { return _this.reset(); }));
        _this.register(_this._inputHandler.onRequestScroll(function (eraseAttr, isWrapped) { return _this.scroll(eraseAttr, isWrapped || undefined); }));
        _this.register(_this._inputHandler.onRequestWindowsOptionsReport(function (type) { return _this._reportWindowsOptions(type); }));
        _this.register(_this._inputHandler.onAnsiColorChange(function (event) { return _this._changeAnsiColor(event); }));
        _this.register(EventEmitter_1.forwardEvent(_this._inputHandler.onCursorMove, _this._onCursorMove));
        _this.register(EventEmitter_1.forwardEvent(_this._inputHandler.onTitleChange, _this._onTitleChange));
        _this.register(EventEmitter_1.forwardEvent(_this._inputHandler.onA11yChar, _this._onA11yCharEmitter));
        _this.register(EventEmitter_1.forwardEvent(_this._inputHandler.onA11yTab, _this._onA11yTabEmitter));
        _this.register(_this._bufferService.onResize(function (e) { return _this._afterResize(e.cols, e.rows); }));
        return _this;
    }
    Object.defineProperty(Terminal.prototype, "options", {
        get: function () { return this.optionsService.options; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Terminal.prototype, "onCursorMove", {
        get: function () { return this._onCursorMove.event; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Terminal.prototype, "onKey", {
        get: function () { return this._onKey.event; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Terminal.prototype, "onRender", {
        get: function () { return this._onRender.event; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Terminal.prototype, "onSelectionChange", {
        get: function () { return this._onSelectionChange.event; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Terminal.prototype, "onTitleChange", {
        get: function () { return this._onTitleChange.event; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Terminal.prototype, "onFocus", {
        get: function () { return this._onFocus.event; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Terminal.prototype, "onBlur", {
        get: function () { return this._onBlur.event; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Terminal.prototype, "onA11yChar", {
        get: function () { return this._onA11yCharEmitter.event; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Terminal.prototype, "onA11yTab", {
        get: function () { return this._onA11yTabEmitter.event; },
        enumerable: false,
        configurable: true
    });
    Terminal.prototype._changeAnsiColor = function (event) {
        var _this = this;
        var _a, _b;
        if (!this._colorManager) {
            return;
        }
        event.colors.forEach(function (ansiColor) {
            var color = Color_1.rgba.toColor(ansiColor.red, ansiColor.green, ansiColor.blue);
            _this._colorManager.colors.ansi[ansiColor.colorIndex] = color;
        });
        (_a = this._renderService) === null || _a === void 0 ? void 0 : _a.setColors(this._colorManager.colors);
        (_b = this.viewport) === null || _b === void 0 ? void 0 : _b.onThemeChange(this._colorManager.colors);
    };
    Terminal.prototype.dispose = function () {
        var _a, _b, _c;
        if (this._isDisposed) {
            return;
        }
        _super.prototype.dispose.call(this);
        (_a = this._renderService) === null || _a === void 0 ? void 0 : _a.dispose();
        this._customKeyEventHandler = undefined;
        this.write = function () { };
        (_c = (_b = this.element) === null || _b === void 0 ? void 0 : _b.parentNode) === null || _c === void 0 ? void 0 : _c.removeChild(this.element);
    };
    Terminal.prototype._setup = function () {
        _super.prototype._setup.call(this);
        this._customKeyEventHandler = undefined;
    };
    Object.defineProperty(Terminal.prototype, "buffer", {
        get: function () {
            return this.buffers.active;
        },
        enumerable: false,
        configurable: true
    });
    Terminal.prototype.focus = function () {
        if (this.textarea) {
            this.textarea.focus({ preventScroll: true });
        }
    };
    Terminal.prototype._updateOptions = function (key) {
        var _a, _b, _c, _d;
        _super.prototype._updateOptions.call(this, key);
        switch (key) {
            case 'fontFamily':
            case 'fontSize':
                (_a = this._renderService) === null || _a === void 0 ? void 0 : _a.clear();
                (_b = this._charSizeService) === null || _b === void 0 ? void 0 : _b.measure();
                break;
            case 'cursorBlink':
            case 'cursorStyle':
                this.refresh(this.buffer.y, this.buffer.y);
                break;
            case 'drawBoldTextInBrightColors':
            case 'letterSpacing':
            case 'lineHeight':
            case 'fontWeight':
            case 'fontWeightBold':
            case 'minimumContrastRatio':
                if (this._renderService) {
                    this._renderService.clear();
                    this._renderService.onResize(this.cols, this.rows);
                    this.refresh(0, this.rows - 1);
                }
                break;
            case 'rendererType':
                if (this._renderService) {
                    this._renderService.setRenderer(this._createRenderer());
                    this._renderService.onResize(this.cols, this.rows);
                }
                break;
            case 'scrollback':
                (_c = this.viewport) === null || _c === void 0 ? void 0 : _c.syncScrollArea();
                break;
            case 'screenReaderMode':
                if (this.optionsService.options.screenReaderMode) {
                    if (!this._accessibilityManager && this._renderService) {
                        this._accessibilityManager = new AccessibilityManager_1.AccessibilityManager(this, this._renderService);
                    }
                }
                else {
                    (_d = this._accessibilityManager) === null || _d === void 0 ? void 0 : _d.dispose();
                    this._accessibilityManager = undefined;
                }
                break;
            case 'tabStopWidth':
                this.buffers.setupTabStops();
                break;
            case 'theme':
                this._setTheme(this.optionsService.options.theme);
                break;
        }
    };
    Terminal.prototype._onTextAreaFocus = function (ev) {
        if (this._coreService.decPrivateModes.sendFocus) {
            this._coreService.triggerDataEvent(EscapeSequences_1.C0.ESC + '[I');
        }
        this.updateCursorStyle(ev);
        this.element.classList.add('focus');
        this._showCursor();
        this._onFocus.fire();
    };
    Terminal.prototype.blur = function () {
        var _a;
        return (_a = this.textarea) === null || _a === void 0 ? void 0 : _a.blur();
    };
    Terminal.prototype._onTextAreaBlur = function () {
        this.textarea.value = '';
        this.refresh(this.buffer.y, this.buffer.y);
        if (this._coreService.decPrivateModes.sendFocus) {
            this._coreService.triggerDataEvent(EscapeSequences_1.C0.ESC + '[O');
        }
        this.element.classList.remove('focus');
        this._onBlur.fire();
    };
    Terminal.prototype._syncTextArea = function () {
        if (!this.textarea || !this.buffer.isCursorInViewport || this._compositionHelper.isComposing) {
            return;
        }
        var cellHeight = Math.ceil(this._charSizeService.height * this.optionsService.options.lineHeight);
        var cursorTop = this._bufferService.buffer.y * cellHeight;
        var cursorLeft = this._bufferService.buffer.x * this._charSizeService.width;
        this.textarea.style.left = cursorLeft + 'px';
        this.textarea.style.top = cursorTop + 'px';
        this.textarea.style.width = this._charSizeService.width + 'px';
        this.textarea.style.height = cellHeight + 'px';
        this.textarea.style.lineHeight = cellHeight + 'px';
        this.textarea.style.zIndex = '-5';
    };
    Terminal.prototype._initGlobal = function () {
        var _this = this;
        this._bindKeys();
        this.register(Lifecycle_1.addDisposableDomListener(this.element, 'copy', function (event) {
            if (!_this.hasSelection()) {
                return;
            }
            Clipboard_1.copyHandler(event, _this._selectionService);
        }));
        var pasteHandlerWrapper = function (event) { return Clipboard_1.handlePasteEvent(event, _this.textarea, _this._coreService); };
        this.register(Lifecycle_1.addDisposableDomListener(this.textarea, 'paste', pasteHandlerWrapper));
        this.register(Lifecycle_1.addDisposableDomListener(this.element, 'paste', pasteHandlerWrapper));
        if (Browser.isFirefox) {
            this.register(Lifecycle_1.addDisposableDomListener(this.element, 'mousedown', function (event) {
                if (event.button === 2) {
                    Clipboard_1.rightClickHandler(event, _this.textarea, _this.screenElement, _this._selectionService, _this.options.rightClickSelectsWord);
                }
            }));
        }
        else {
            this.register(Lifecycle_1.addDisposableDomListener(this.element, 'contextmenu', function (event) {
                Clipboard_1.rightClickHandler(event, _this.textarea, _this.screenElement, _this._selectionService, _this.options.rightClickSelectsWord);
            }));
        }
        if (Browser.isLinux) {
            this.register(Lifecycle_1.addDisposableDomListener(this.element, 'auxclick', function (event) {
                if (event.button === 1) {
                    Clipboard_1.moveTextAreaUnderMouseCursor(event, _this.textarea, _this.screenElement);
                }
            }));
        }
    };
    Terminal.prototype._bindKeys = function () {
        var _this = this;
        this.register(Lifecycle_1.addDisposableDomListener(this.textarea, 'keyup', function (ev) { return _this._keyUp(ev); }, true));
        this.register(Lifecycle_1.addDisposableDomListener(this.textarea, 'keydown', function (ev) { return _this._keyDown(ev); }, true));
        this.register(Lifecycle_1.addDisposableDomListener(this.textarea, 'keypress', function (ev) { return _this._keyPress(ev); }, true));
        this.register(Lifecycle_1.addDisposableDomListener(this.textarea, 'compositionstart', function () { return _this._compositionHelper.compositionstart(); }));
        this.register(Lifecycle_1.addDisposableDomListener(this.textarea, 'compositionupdate', function (e) { return _this._compositionHelper.compositionupdate(e); }));
        this.register(Lifecycle_1.addDisposableDomListener(this.textarea, 'compositionend', function () { return _this._compositionHelper.compositionend(); }));
        this.register(this.onRender(function () { return _this._compositionHelper.updateCompositionElements(); }));
        this.register(this.onRender(function (e) { return _this._queueLinkification(e.start, e.end); }));
    };
    Terminal.prototype.open = function (parent) {
        var _this = this;
        if (!parent) {
            throw new Error('Terminal requires a parent element.');
        }
        if (!parent.isConnected) {
            this._logService.debug('Terminal.open was called on an element that was not attached to the DOM');
        }
        this._document = parent.ownerDocument;
        this.element = this._document.createElement('div');
        this.element.dir = 'ltr';
        this.element.classList.add('terminal');
        this.element.classList.add('xterm');
        this.element.setAttribute('tabindex', '0');
        this.element.setAttribute('role', 'document');
        parent.appendChild(this.element);
        var fragment = document.createDocumentFragment();
        this._viewportElement = document.createElement('div');
        this._viewportElement.classList.add('xterm-viewport');
        fragment.appendChild(this._viewportElement);
        this._viewportScrollArea = document.createElement('div');
        this._viewportScrollArea.classList.add('xterm-scroll-area');
        this._viewportElement.appendChild(this._viewportScrollArea);
        this.screenElement = document.createElement('div');
        this.screenElement.classList.add('xterm-screen');
        this._helperContainer = document.createElement('div');
        this._helperContainer.classList.add('xterm-helpers');
        this.screenElement.appendChild(this._helperContainer);
        fragment.appendChild(this.screenElement);
        this.textarea = document.createElement('textarea');
        this.textarea.classList.add('xterm-helper-textarea');
        this.textarea.setAttribute('aria-label', Strings.promptLabel);
        this.textarea.setAttribute('aria-multiline', 'false');
        this.textarea.setAttribute('autocorrect', 'off');
        this.textarea.setAttribute('autocapitalize', 'off');
        this.textarea.setAttribute('spellcheck', 'false');
        this.textarea.tabIndex = 0;
        this.register(Lifecycle_1.addDisposableDomListener(this.textarea, 'focus', function (ev) { return _this._onTextAreaFocus(ev); }));
        this.register(Lifecycle_1.addDisposableDomListener(this.textarea, 'blur', function () { return _this._onTextAreaBlur(); }));
        this._helperContainer.appendChild(this.textarea);
        var coreBrowserService = this._instantiationService.createInstance(CoreBrowserService_1.CoreBrowserService, this.textarea);
        this._instantiationService.setService(Services_1.ICoreBrowserService, coreBrowserService);
        this._charSizeService = this._instantiationService.createInstance(CharSizeService_1.CharSizeService, this._document, this._helperContainer);
        this._instantiationService.setService(Services_1.ICharSizeService, this._charSizeService);
        this._compositionView = document.createElement('div');
        this._compositionView.classList.add('composition-view');
        this._compositionHelper = this._instantiationService.createInstance(CompositionHelper_1.CompositionHelper, this.textarea, this._compositionView);
        this._helperContainer.appendChild(this._compositionView);
        this.element.appendChild(fragment);
        this._theme = this.options.theme || this._theme;
        this._colorManager = new ColorManager_1.ColorManager(document, this.options.allowTransparency);
        this.register(this.optionsService.onOptionChange(function (e) { return _this._colorManager.onOptionsChange(e); }));
        this._colorManager.setTheme(this._theme);
        var renderer = this._createRenderer();
        this._renderService = this.register(this._instantiationService.createInstance(RenderService_1.RenderService, renderer, this.rows, this.screenElement));
        this._instantiationService.setService(Services_1.IRenderService, this._renderService);
        this.register(this._renderService.onRenderedBufferChange(function (e) { return _this._onRender.fire(e); }));
        this.onResize(function (e) { return _this._renderService.resize(e.cols, e.rows); });
        this._soundService = this._instantiationService.createInstance(SoundService_1.SoundService);
        this._instantiationService.setService(Services_1.ISoundService, this._soundService);
        this._mouseService = this._instantiationService.createInstance(MouseService_1.MouseService);
        this._instantiationService.setService(Services_1.IMouseService, this._mouseService);
        this.viewport = this._instantiationService.createInstance(Viewport_1.Viewport, function (amount, suppressEvent) { return _this.scrollLines(amount, suppressEvent); }, this._viewportElement, this._viewportScrollArea);
        this.viewport.onThemeChange(this._colorManager.colors);
        this.register(this._inputHandler.onRequestSyncScrollBar(function () { return _this.viewport.syncScrollArea(); }));
        this.register(this.viewport);
        this.register(this.onCursorMove(function () {
            _this._renderService.onCursorMove();
            _this._syncTextArea();
        }));
        this.register(this.onResize(function () { return _this._renderService.onResize(_this.cols, _this.rows); }));
        this.register(this.onBlur(function () { return _this._renderService.onBlur(); }));
        this.register(this.onFocus(function () { return _this._renderService.onFocus(); }));
        this.register(this._renderService.onDimensionsChange(function () { return _this.viewport.syncScrollArea(); }));
        this._selectionService = this.register(this._instantiationService.createInstance(SelectionService_1.SelectionService, this.element, this.screenElement));
        this._instantiationService.setService(Services_1.ISelectionService, this._selectionService);
        this.register(this._selectionService.onRequestScrollLines(function (e) { return _this.scrollLines(e.amount, e.suppressScrollEvent); }));
        this.register(this._selectionService.onSelectionChange(function () { return _this._onSelectionChange.fire(); }));
        this.register(this._selectionService.onRequestRedraw(function (e) { return _this._renderService.onSelectionChanged(e.start, e.end, e.columnSelectMode); }));
        this.register(this._selectionService.onLinuxMouseSelection(function (text) {
            _this.textarea.value = text;
            _this.textarea.focus();
            _this.textarea.select();
        }));
        this.register(this.onScroll(function () {
            _this.viewport.syncScrollArea();
            _this._selectionService.refresh();
        }));
        this.register(Lifecycle_1.addDisposableDomListener(this._viewportElement, 'scroll', function () { return _this._selectionService.refresh(); }));
        this._mouseZoneManager = this._instantiationService.createInstance(MouseZoneManager_1.MouseZoneManager, this.element, this.screenElement);
        this.register(this._mouseZoneManager);
        this.register(this.onScroll(function () { return _this._mouseZoneManager.clearAll(); }));
        this.linkifier.attachToDom(this.element, this._mouseZoneManager);
        this.linkifier2.attachToDom(this.element, this._mouseService, this._renderService);
        this.register(Lifecycle_1.addDisposableDomListener(this.element, 'mousedown', function (e) { return _this._selectionService.onMouseDown(e); }));
        if (this._coreMouseService.areMouseEventsActive) {
            this._selectionService.disable();
            this.element.classList.add('enable-mouse-events');
        }
        else {
            this._selectionService.enable();
        }
        if (this.options.screenReaderMode) {
            this._accessibilityManager = new AccessibilityManager_1.AccessibilityManager(this, this._renderService);
        }
        this._charSizeService.measure();
        this.refresh(0, this.rows - 1);
        this._initGlobal();
        this.bindMouse();
    };
    Terminal.prototype._createRenderer = function () {
        switch (this.options.rendererType) {
            case 'canvas': return this._instantiationService.createInstance(Renderer_1.Renderer, this._colorManager.colors, this.screenElement, this.linkifier, this.linkifier2);
            case 'dom': return this._instantiationService.createInstance(DomRenderer_1.DomRenderer, this._colorManager.colors, this.element, this.screenElement, this._viewportElement, this.linkifier, this.linkifier2);
            default: throw new Error("Unrecognized rendererType \"" + this.options.rendererType + "\"");
        }
    };
    Terminal.prototype._setTheme = function (theme) {
        var _a, _b, _c;
        this._theme = theme;
        (_a = this._colorManager) === null || _a === void 0 ? void 0 : _a.setTheme(theme);
        (_b = this._renderService) === null || _b === void 0 ? void 0 : _b.setColors(this._colorManager.colors);
        (_c = this.viewport) === null || _c === void 0 ? void 0 : _c.onThemeChange(this._colorManager.colors);
    };
    Terminal.prototype.bindMouse = function () {
        var _this = this;
        var self = this;
        var el = this.element;
        function sendEvent(ev) {
            var pos = self._mouseService.getRawByteCoords(ev, self.screenElement, self.cols, self.rows);
            if (!pos) {
                return false;
            }
            var but;
            var action;
            switch (ev.overrideType || ev.type) {
                case 'mousemove':
                    action = 32;
                    if (ev.buttons === undefined) {
                        but = 3;
                        if (ev.button !== undefined) {
                            but = ev.button < 3 ? ev.button : 3;
                        }
                    }
                    else {
                        but = ev.buttons & 1 ? 0 :
                            ev.buttons & 4 ? 1 :
                                ev.buttons & 2 ? 2 :
                                    3;
                    }
                    break;
                case 'mouseup':
                    action = 0;
                    but = ev.button < 3 ? ev.button : 3;
                    break;
                case 'mousedown':
                    action = 1;
                    but = ev.button < 3 ? ev.button : 3;
                    break;
                case 'wheel':
                    if (ev.deltaY !== 0) {
                        action = ev.deltaY < 0 ? 0 : 1;
                    }
                    but = 4;
                    break;
                default:
                    return false;
            }
            if (action === undefined || but === undefined || but > 4) {
                return false;
            }
            return self._coreMouseService.triggerMouseEvent({
                col: pos.x - 33,
                row: pos.y - 33,
                button: but,
                action: action,
                ctrl: ev.ctrlKey,
                alt: ev.altKey,
                shift: ev.shiftKey
            });
        }
        var requestedEvents = {
            mouseup: null,
            wheel: null,
            mousedrag: null,
            mousemove: null
        };
        var eventListeners = {
            mouseup: function (ev) {
                sendEvent(ev);
                if (!ev.buttons) {
                    _this._document.removeEventListener('mouseup', requestedEvents.mouseup);
                    if (requestedEvents.mousedrag) {
                        _this._document.removeEventListener('mousemove', requestedEvents.mousedrag);
                    }
                }
                return _this.cancel(ev);
            },
            wheel: function (ev) {
                sendEvent(ev);
                ev.preventDefault();
                return _this.cancel(ev);
            },
            mousedrag: function (ev) {
                if (ev.buttons) {
                    sendEvent(ev);
                }
            },
            mousemove: function (ev) {
                if (!ev.buttons) {
                    sendEvent(ev);
                }
            }
        };
        this.register(this._coreMouseService.onProtocolChange(function (events) {
            if (events) {
                if (_this.optionsService.options.logLevel === 'debug') {
                    _this._logService.debug('Binding to mouse events:', _this._coreMouseService.explainEvents(events));
                }
                _this.element.classList.add('enable-mouse-events');
                _this._selectionService.disable();
            }
            else {
                _this._logService.debug('Unbinding from mouse events.');
                _this.element.classList.remove('enable-mouse-events');
                _this._selectionService.enable();
            }
            if (!(events & 8)) {
                el.removeEventListener('mousemove', requestedEvents.mousemove);
                requestedEvents.mousemove = null;
            }
            else if (!requestedEvents.mousemove) {
                el.addEventListener('mousemove', eventListeners.mousemove);
                requestedEvents.mousemove = eventListeners.mousemove;
            }
            if (!(events & 16)) {
                el.removeEventListener('wheel', requestedEvents.wheel);
                requestedEvents.wheel = null;
            }
            else if (!requestedEvents.wheel) {
                el.addEventListener('wheel', eventListeners.wheel, { passive: false });
                requestedEvents.wheel = eventListeners.wheel;
            }
            if (!(events & 2)) {
                _this._document.removeEventListener('mouseup', requestedEvents.mouseup);
                requestedEvents.mouseup = null;
            }
            else if (!requestedEvents.mouseup) {
                requestedEvents.mouseup = eventListeners.mouseup;
            }
            if (!(events & 4)) {
                _this._document.removeEventListener('mousemove', requestedEvents.mousedrag);
                requestedEvents.mousedrag = null;
            }
            else if (!requestedEvents.mousedrag) {
                requestedEvents.mousedrag = eventListeners.mousedrag;
            }
        }));
        this._coreMouseService.activeProtocol = this._coreMouseService.activeProtocol;
        this.register(Lifecycle_1.addDisposableDomListener(el, 'mousedown', function (ev) {
            ev.preventDefault();
            _this.focus();
            if (!_this._coreMouseService.areMouseEventsActive || _this._selectionService.shouldForceSelection(ev)) {
                return;
            }
            sendEvent(ev);
            if (requestedEvents.mouseup) {
                _this._document.addEventListener('mouseup', requestedEvents.mouseup);
            }
            if (requestedEvents.mousedrag) {
                _this._document.addEventListener('mousemove', requestedEvents.mousedrag);
            }
            return _this.cancel(ev);
        }));
        this.register(Lifecycle_1.addDisposableDomListener(el, 'wheel', function (ev) {
            if (!requestedEvents.wheel) {
                if (!_this.buffer.hasScrollback) {
                    var amount = _this.viewport.getLinesScrolled(ev);
                    if (amount === 0) {
                        return;
                    }
                    var sequence = EscapeSequences_1.C0.ESC + (_this._coreService.decPrivateModes.applicationCursorKeys ? 'O' : '[') + (ev.deltaY < 0 ? 'A' : 'B');
                    var data = '';
                    for (var i = 0; i < Math.abs(amount); i++) {
                        data += sequence;
                    }
                    _this._coreService.triggerDataEvent(data, true);
                }
                return;
            }
        }, { passive: true }));
        this.register(Lifecycle_1.addDisposableDomListener(el, 'wheel', function (ev) {
            if (requestedEvents.wheel)
                return;
            if (!_this.viewport.onWheel(ev)) {
                return _this.cancel(ev);
            }
        }, { passive: false }));
        this.register(Lifecycle_1.addDisposableDomListener(el, 'touchstart', function (ev) {
            if (_this._coreMouseService.areMouseEventsActive)
                return;
            _this.viewport.onTouchStart(ev);
            return _this.cancel(ev);
        }, { passive: true }));
        this.register(Lifecycle_1.addDisposableDomListener(el, 'touchmove', function (ev) {
            if (_this._coreMouseService.areMouseEventsActive)
                return;
            if (!_this.viewport.onTouchMove(ev)) {
                return _this.cancel(ev);
            }
        }, { passive: false }));
    };
    Terminal.prototype.refresh = function (start, end) {
        var _a;
        (_a = this._renderService) === null || _a === void 0 ? void 0 : _a.refreshRows(start, end);
    };
    Terminal.prototype._queueLinkification = function (start, end) {
        var _a;
        (_a = this.linkifier) === null || _a === void 0 ? void 0 : _a.linkifyRows(start, end);
    };
    Terminal.prototype.updateCursorStyle = function (ev) {
        if (this._selectionService && this._selectionService.shouldColumnSelect(ev)) {
            this.element.classList.add('column-select');
        }
        else {
            this.element.classList.remove('column-select');
        }
    };
    Terminal.prototype._showCursor = function () {
        if (!this._coreService.isCursorInitialized) {
            this._coreService.isCursorInitialized = true;
            this.refresh(this.buffer.y, this.buffer.y);
        }
    };
    Terminal.prototype.scrollLines = function (disp, suppressScrollEvent) {
        _super.prototype.scrollLines.call(this, disp, suppressScrollEvent);
        this.refresh(0, this.rows - 1);
    };
    Terminal.prototype.paste = function (data) {
        Clipboard_1.paste(data, this.textarea, this._coreService);
    };
    Terminal.prototype.attachCustomKeyEventHandler = function (customKeyEventHandler) {
        this._customKeyEventHandler = customKeyEventHandler;
    };
    Terminal.prototype.registerLinkMatcher = function (regex, handler, options) {
        var matcherId = this.linkifier.registerLinkMatcher(regex, handler, options);
        this.refresh(0, this.rows - 1);
        return matcherId;
    };
    Terminal.prototype.deregisterLinkMatcher = function (matcherId) {
        if (this.linkifier.deregisterLinkMatcher(matcherId)) {
            this.refresh(0, this.rows - 1);
        }
    };
    Terminal.prototype.registerLinkProvider = function (linkProvider) {
        return this.linkifier2.registerLinkProvider(linkProvider);
    };
    Terminal.prototype.registerCharacterJoiner = function (handler) {
        var joinerId = this._renderService.registerCharacterJoiner(handler);
        this.refresh(0, this.rows - 1);
        return joinerId;
    };
    Terminal.prototype.deregisterCharacterJoiner = function (joinerId) {
        if (this._renderService.deregisterCharacterJoiner(joinerId)) {
            this.refresh(0, this.rows - 1);
        }
    };
    Object.defineProperty(Terminal.prototype, "markers", {
        get: function () {
            return this.buffer.markers;
        },
        enumerable: false,
        configurable: true
    });
    Terminal.prototype.addMarker = function (cursorYOffset) {
        if (this.buffer !== this.buffers.normal) {
            return;
        }
        return this.buffer.addMarker(this.buffer.ybase + this.buffer.y + cursorYOffset);
    };
    Terminal.prototype.hasSelection = function () {
        return this._selectionService ? this._selectionService.hasSelection : false;
    };
    Terminal.prototype.select = function (column, row, length) {
        this._selectionService.setSelection(column, row, length);
    };
    Terminal.prototype.getSelection = function () {
        return this._selectionService ? this._selectionService.selectionText : '';
    };
    Terminal.prototype.getSelectionPosition = function () {
        if (!this._selectionService || !this._selectionService.hasSelection) {
            return undefined;
        }
        return {
            startColumn: this._selectionService.selectionStart[0],
            startRow: this._selectionService.selectionStart[1],
            endColumn: this._selectionService.selectionEnd[0],
            endRow: this._selectionService.selectionEnd[1]
        };
    };
    Terminal.prototype.clearSelection = function () {
        var _a;
        (_a = this._selectionService) === null || _a === void 0 ? void 0 : _a.clearSelection();
    };
    Terminal.prototype.selectAll = function () {
        var _a;
        (_a = this._selectionService) === null || _a === void 0 ? void 0 : _a.selectAll();
    };
    Terminal.prototype.selectLines = function (start, end) {
        var _a;
        (_a = this._selectionService) === null || _a === void 0 ? void 0 : _a.selectLines(start, end);
    };
    Terminal.prototype._keyDown = function (event) {
        this._keyDownHandled = false;
        if (this._customKeyEventHandler && this._customKeyEventHandler(event) === false) {
            return false;
        }
        if (!this._compositionHelper.keydown(event)) {
            if (this.buffer.ybase !== this.buffer.ydisp) {
                this.scrollToBottom();
            }
            return false;
        }
        var result = Keyboard_1.evaluateKeyboardEvent(event, this._coreService.decPrivateModes.applicationCursorKeys, this.browser.isMac, this.options.macOptionIsMeta);
        this.updateCursorStyle(event);
        if (result.type === 3 || result.type === 2) {
            var scrollCount = this.rows - 1;
            this.scrollLines(result.type === 2 ? -scrollCount : scrollCount);
            return this.cancel(event, true);
        }
        if (result.type === 1) {
            this.selectAll();
        }
        if (this._isThirdLevelShift(this.browser, event)) {
            return true;
        }
        if (result.cancel) {
            this.cancel(event, true);
        }
        if (!result.key) {
            return true;
        }
        if (result.key === EscapeSequences_1.C0.ETX || result.key === EscapeSequences_1.C0.CR) {
            this.textarea.value = '';
        }
        this._onKey.fire({ key: result.key, domEvent: event });
        this._showCursor();
        this._coreService.triggerDataEvent(result.key, true);
        if (!this.optionsService.options.screenReaderMode) {
            return this.cancel(event, true);
        }
        this._keyDownHandled = true;
    };
    Terminal.prototype._isThirdLevelShift = function (browser, ev) {
        var thirdLevelKey = (browser.isMac && !this.options.macOptionIsMeta && ev.altKey && !ev.ctrlKey && !ev.metaKey) ||
            (browser.isWindows && ev.altKey && ev.ctrlKey && !ev.metaKey);
        if (ev.type === 'keypress') {
            return thirdLevelKey;
        }
        return thirdLevelKey && (!ev.keyCode || ev.keyCode > 47);
    };
    Terminal.prototype._keyUp = function (ev) {
        if (this._customKeyEventHandler && this._customKeyEventHandler(ev) === false) {
            return;
        }
        if (!wasModifierKeyOnlyEvent(ev)) {
            this.focus();
        }
        this.updateCursorStyle(ev);
    };
    Terminal.prototype._keyPress = function (ev) {
        var key;
        if (this._keyDownHandled) {
            return false;
        }
        if (this._customKeyEventHandler && this._customKeyEventHandler(ev) === false) {
            return false;
        }
        this.cancel(ev);
        if (ev.charCode) {
            key = ev.charCode;
        }
        else if (ev.which === null || ev.which === undefined) {
            key = ev.keyCode;
        }
        else if (ev.which !== 0 && ev.charCode !== 0) {
            key = ev.which;
        }
        else {
            return false;
        }
        if (!key || ((ev.altKey || ev.ctrlKey || ev.metaKey) && !this._isThirdLevelShift(this.browser, ev))) {
            return false;
        }
        key = String.fromCharCode(key);
        this._onKey.fire({ key: key, domEvent: ev });
        this._showCursor();
        this._coreService.triggerDataEvent(key, true);
        return true;
    };
    Terminal.prototype.bell = function () {
        if (this._soundBell()) {
            this._soundService.playBellSound();
        }
    };
    Terminal.prototype.resize = function (x, y) {
        if (x === this.cols && y === this.rows) {
            if (this._charSizeService && !this._charSizeService.hasValidSize) {
                this._charSizeService.measure();
            }
            return;
        }
        _super.prototype.resize.call(this, x, y);
    };
    Terminal.prototype._afterResize = function (x, y) {
        var _a, _b;
        (_a = this._charSizeService) === null || _a === void 0 ? void 0 : _a.measure();
        (_b = this.viewport) === null || _b === void 0 ? void 0 : _b.syncScrollArea(true);
    };
    Terminal.prototype.clear = function () {
        if (this.buffer.ybase === 0 && this.buffer.y === 0) {
            return;
        }
        this.buffer.lines.set(0, this.buffer.lines.get(this.buffer.ybase + this.buffer.y));
        this.buffer.lines.length = 1;
        this.buffer.ydisp = 0;
        this.buffer.ybase = 0;
        this.buffer.y = 0;
        for (var i = 1; i < this.rows; i++) {
            this.buffer.lines.push(this.buffer.getBlankLine(BufferLine_1.DEFAULT_ATTR_DATA));
        }
        this.refresh(0, this.rows - 1);
        this._onScroll.fire(this.buffer.ydisp);
    },
    Terminal.prototype.clearFromN = function (n) {
        if (n === void 0) { n = 0; }
        if (this.buffer.ybase === 0 && this.buffer.y === 0) {
            return;
        }
        this.buffer.lines.set(n, this.buffer.lines.get(this.buffer.ybase + this.buffer.y));
        this.buffer.lines.length = n;
        this.buffer.ydisp = n;
        this.buffer.ybase = n;
        this.buffer.y = n;
        for (var i = (n + 1); i < this.rows; i++) {
            this.buffer.lines.push(this.buffer.getBlankLine(BufferLine_1.DEFAULT_ATTR_DATA));
        }
        this.refresh(n, this.rows - 1);
        this._onScroll.fire(this.buffer.ydisp);
    };
    Terminal.prototype.reset = function () {
        var _a, _b;
        this.options.rows = this.rows;
        this.options.cols = this.cols;
        var customKeyEventHandler = this._customKeyEventHandler;
        this._setup();
        _super.prototype.reset.call(this);
        (_a = this._selectionService) === null || _a === void 0 ? void 0 : _a.reset();
        this._customKeyEventHandler = customKeyEventHandler;
        this.refresh(0, this.rows - 1);
        (_b = this.viewport) === null || _b === void 0 ? void 0 : _b.syncScrollArea();
    };
    Terminal.prototype._reportWindowsOptions = function (type) {
        if (!this._renderService) {
            return;
        }
        switch (type) {
            case InputHandler_1.WindowsOptionsReportType.GET_WIN_SIZE_PIXELS:
                var canvasWidth = this._renderService.dimensions.scaledCanvasWidth.toFixed(0);
                var canvasHeight = this._renderService.dimensions.scaledCanvasHeight.toFixed(0);
                this._coreService.triggerDataEvent(EscapeSequences_1.C0.ESC + "[4;" + canvasHeight + ";" + canvasWidth + "t");
                break;
            case InputHandler_1.WindowsOptionsReportType.GET_CELL_SIZE_PIXELS:
                var cellWidth = this._renderService.dimensions.scaledCellWidth.toFixed(0);
                var cellHeight = this._renderService.dimensions.scaledCellHeight.toFixed(0);
                this._coreService.triggerDataEvent(EscapeSequences_1.C0.ESC + "[6;" + cellHeight + ";" + cellWidth + "t");
                break;
        }
    };
    Terminal.prototype.cancel = function (ev, force) {
        if (!this.options.cancelEvents && !force) {
            return;
        }
        ev.preventDefault();
        ev.stopPropagation();
        return false;
    };
    Terminal.prototype._visualBell = function () {
        return false;
    };
    Terminal.prototype._soundBell = function () {
        return this.options.bellStyle === 'sound';
    };
    return Terminal;
}(CoreTerminal_1.CoreTerminal));
exports.Terminal = Terminal;
function wasModifierKeyOnlyEvent(ev) {
    return ev.keyCode === 16 ||
        ev.keyCode === 17 ||
        ev.keyCode === 18;
}


/***/ }),

/***/ "./out/browser/Viewport.js":
/*!*********************************!*\
  !*** ./out/browser/Viewport.js ***!
  \*********************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: top-level-this-exports, __webpack_exports__, __webpack_require__ */
/*! CommonJS bailout: this is used directly at 2:17-21 */
/*! CommonJS bailout: this is used directly at 15:18-22 */
/*! CommonJS bailout: this is used directly at 21:15-19 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Viewport = void 0;
var Lifecycle_1 = __webpack_require__(/*! common/Lifecycle */ "./out/common/Lifecycle.js");
var Lifecycle_2 = __webpack_require__(/*! browser/Lifecycle */ "./out/browser/Lifecycle.js");
var Services_1 = __webpack_require__(/*! browser/services/Services */ "./out/browser/services/Services.js");
var Services_2 = __webpack_require__(/*! common/services/Services */ "./out/common/services/Services.js");
var FALLBACK_SCROLL_BAR_WIDTH = 15;
var Viewport = (function (_super) {
    __extends(Viewport, _super);
    function Viewport(_scrollLines, _viewportElement, _scrollArea, _bufferService, _optionsService, _charSizeService, _renderService) {
        var _this = _super.call(this) || this;
        _this._scrollLines = _scrollLines;
        _this._viewportElement = _viewportElement;
        _this._scrollArea = _scrollArea;
        _this._bufferService = _bufferService;
        _this._optionsService = _optionsService;
        _this._charSizeService = _charSizeService;
        _this._renderService = _renderService;
        _this.scrollBarWidth = 0;
        _this._currentRowHeight = 0;
        _this._lastRecordedBufferLength = 0;
        _this._lastRecordedViewportHeight = 0;
        _this._lastRecordedBufferHeight = 0;
        _this._lastTouchY = 0;
        _this._lastScrollTop = 0;
        _this._wheelPartialScroll = 0;
        _this._refreshAnimationFrame = null;
        _this._ignoreNextScrollEvent = false;
        _this.scrollBarWidth = (_this._viewportElement.offsetWidth - _this._scrollArea.offsetWidth) || FALLBACK_SCROLL_BAR_WIDTH;
        _this.register(Lifecycle_2.addDisposableDomListener(_this._viewportElement, 'scroll', _this._onScroll.bind(_this)));
        setTimeout(function () { return _this.syncScrollArea(); }, 0);
        return _this;
    }
    Viewport.prototype.onThemeChange = function (colors) {
        this._viewportElement.style.backgroundColor = colors.background.css;
    };
    Viewport.prototype._refresh = function (immediate) {
        var _this = this;
        if (immediate) {
            this._innerRefresh();
            if (this._refreshAnimationFrame !== null) {
                cancelAnimationFrame(this._refreshAnimationFrame);
            }
            return;
        }
        if (this._refreshAnimationFrame === null) {
            this._refreshAnimationFrame = requestAnimationFrame(function () { return _this._innerRefresh(); });
        }
    };
    Viewport.prototype._innerRefresh = function () {
        if (this._charSizeService.height > 0) {
            this._currentRowHeight = this._renderService.dimensions.scaledCellHeight / window.devicePixelRatio;
            this._lastRecordedViewportHeight = this._viewportElement.offsetHeight;
            var newBufferHeight = Math.round(this._currentRowHeight * this._lastRecordedBufferLength) + (this._lastRecordedViewportHeight - this._renderService.dimensions.canvasHeight);
            if (this._lastRecordedBufferHeight !== newBufferHeight) {
                this._lastRecordedBufferHeight = newBufferHeight;
                this._scrollArea.style.height = this._lastRecordedBufferHeight + 'px';
            }
        }
        var scrollTop = this._bufferService.buffer.ydisp * this._currentRowHeight;
        if (this._viewportElement.scrollTop !== scrollTop) {
            this._ignoreNextScrollEvent = true;
            this._viewportElement.scrollTop = scrollTop;
        }
        this._refreshAnimationFrame = null;
    };
    Viewport.prototype.syncScrollArea = function (immediate) {
        if (immediate === void 0) { immediate = false; }
        if (this._lastRecordedBufferLength !== this._bufferService.buffer.lines.length) {
            this._lastRecordedBufferLength = this._bufferService.buffer.lines.length;
            this._refresh(immediate);
            return;
        }
        if (this._lastRecordedViewportHeight !== this._renderService.dimensions.canvasHeight) {
            this._refresh(immediate);
            return;
        }
        var newScrollTop = this._bufferService.buffer.ydisp * this._currentRowHeight;
        if (this._lastScrollTop !== newScrollTop) {
            this._refresh(immediate);
            return;
        }
        if (this._lastScrollTop !== this._viewportElement.scrollTop) {
            this._refresh(immediate);
            return;
        }
        if (this._renderService.dimensions.scaledCellHeight / window.devicePixelRatio !== this._currentRowHeight) {
            this._refresh(immediate);
            return;
        }
    };
    Viewport.prototype._onScroll = function (ev) {
        this._lastScrollTop = this._viewportElement.scrollTop;
        if (!this._viewportElement.offsetParent) {
            return;
        }
        if (this._ignoreNextScrollEvent) {
            this._ignoreNextScrollEvent = false;
            return;
        }
        var newRow = Math.round(this._lastScrollTop / this._currentRowHeight);
        var diff = newRow - this._bufferService.buffer.ydisp;
        this._scrollLines(diff, true);
    };
    Viewport.prototype._bubbleScroll = function (ev, amount) {
        var scrollPosFromTop = this._viewportElement.scrollTop + this._lastRecordedViewportHeight;
        if ((amount < 0 && this._viewportElement.scrollTop !== 0) ||
            (amount > 0 && scrollPosFromTop < this._lastRecordedBufferHeight)) {
            if (ev.cancelable) {
                ev.preventDefault();
            }
            return false;
        }
        return true;
    };
    Viewport.prototype.onWheel = function (ev) {
        var amount = this._getPixelsScrolled(ev);
        if (amount === 0) {
            return false;
        }
        this._viewportElement.scrollTop += amount;
        return this._bubbleScroll(ev, amount);
    };
    Viewport.prototype._getPixelsScrolled = function (ev) {
        if (ev.deltaY === 0) {
            return 0;
        }
        var amount = this._applyScrollModifier(ev.deltaY, ev);
        if (ev.deltaMode === WheelEvent.DOM_DELTA_LINE) {
            amount *= this._currentRowHeight;
        }
        else if (ev.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
            amount *= this._currentRowHeight * this._bufferService.rows;
        }
        return amount;
    };
    Viewport.prototype.getLinesScrolled = function (ev) {
        if (ev.deltaY === 0) {
            return 0;
        }
        var amount = this._applyScrollModifier(ev.deltaY, ev);
        if (ev.deltaMode === WheelEvent.DOM_DELTA_PIXEL) {
            amount /= this._currentRowHeight + 0.0;
            this._wheelPartialScroll += amount;
            amount = Math.floor(Math.abs(this._wheelPartialScroll)) * (this._wheelPartialScroll > 0 ? 1 : -1);
            this._wheelPartialScroll %= 1;
        }
        else if (ev.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
            amount *= this._bufferService.rows;
        }
        return amount;
    };
    Viewport.prototype._applyScrollModifier = function (amount, ev) {
        var modifier = this._optionsService.options.fastScrollModifier;
        if ((modifier === 'alt' && ev.altKey) ||
            (modifier === 'ctrl' && ev.ctrlKey) ||
            (modifier === 'shift' && ev.shiftKey)) {
            return amount * this._optionsService.options.fastScrollSensitivity * this._optionsService.options.scrollSensitivity;
        }
        return amount * this._optionsService.options.scrollSensitivity;
    };
    Viewport.prototype.onTouchStart = function (ev) {
        this._lastTouchY = ev.touches[0].pageY;
    };
    Viewport.prototype.onTouchMove = function (ev) {
        var deltaY = this._lastTouchY - ev.touches[0].pageY;
        this._lastTouchY = ev.touches[0].pageY;
        if (deltaY === 0) {
            return false;
        }
        this._viewportElement.scrollTop += deltaY;
        return this._bubbleScroll(ev, deltaY);
    };
    Viewport = __decorate([
        __param(3, Services_2.IBufferService),
        __param(4, Services_2.IOptionsService),
        __param(5, Services_1.ICharSizeService),
        __param(6, Services_1.IRenderService)
    ], Viewport);
    return Viewport;
}(Lifecycle_1.Disposable));
exports.Viewport = Viewport;


/***/ }),

/***/ "./out/browser/input/CompositionHelper.js":
/*!************************************************!*\
  !*** ./out/browser/input/CompositionHelper.js ***!
  \************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: top-level-this-exports, __webpack_exports__, __webpack_require__ */
/*! CommonJS bailout: this is used directly at 2:18-22 */
/*! CommonJS bailout: this is used directly at 8:15-19 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CompositionHelper = void 0;
var Services_1 = __webpack_require__(/*! browser/services/Services */ "./out/browser/services/Services.js");
var Services_2 = __webpack_require__(/*! common/services/Services */ "./out/common/services/Services.js");
var CompositionHelper = (function () {
    function CompositionHelper(_textarea, _compositionView, _bufferService, _optionsService, _charSizeService, _coreService) {
        this._textarea = _textarea;
        this._compositionView = _compositionView;
        this._bufferService = _bufferService;
        this._optionsService = _optionsService;
        this._charSizeService = _charSizeService;
        this._coreService = _coreService;
        this._isComposing = false;
        this._isSendingComposition = false;
        this._compositionPosition = { start: 0, end: 0 };
        this._dataAlreadySent = '';
    }
    Object.defineProperty(CompositionHelper.prototype, "isComposing", {
        get: function () { return this._isComposing; },
        enumerable: false,
        configurable: true
    });
    CompositionHelper.prototype.compositionstart = function () {
        this._isComposing = true;
        this._compositionPosition.start = this._textarea.value.length;
        this._compositionView.textContent = '';
        this._dataAlreadySent = '';
        this._compositionView.classList.add('active');
    };
    CompositionHelper.prototype.compositionupdate = function (ev) {
        var _this = this;
        this._compositionView.textContent = ev.data;
        this.updateCompositionElements();
        setTimeout(function () {
            _this._compositionPosition.end = _this._textarea.value.length;
        }, 0);
    };
    CompositionHelper.prototype.compositionend = function () {
        this._finalizeComposition(true);
    };
    CompositionHelper.prototype.keydown = function (ev) {
        if (this._isComposing || this._isSendingComposition) {
            if (ev.keyCode === 229) {
                return false;
            }
            if (ev.keyCode === 16 || ev.keyCode === 17 || ev.keyCode === 18) {
                return false;
            }
            this._finalizeComposition(false);
        }
        if (ev.keyCode === 229) {
            this._handleAnyTextareaChanges();
            return false;
        }
        return true;
    };
    CompositionHelper.prototype._finalizeComposition = function (waitForPropagation) {
        var _this = this;
        this._compositionView.classList.remove('active');
        this._isComposing = false;
        if (!waitForPropagation) {
            this._isSendingComposition = false;
            var input = this._textarea.value.substring(this._compositionPosition.start, this._compositionPosition.end);
            this._coreService.triggerDataEvent(input, true);
        }
        else {
            var currentCompositionPosition_1 = {
                start: this._compositionPosition.start,
                end: this._compositionPosition.end
            };
            this._isSendingComposition = true;
            setTimeout(function () {
                if (_this._isSendingComposition) {
                    _this._isSendingComposition = false;
                    var input = void 0;
                    currentCompositionPosition_1.start += _this._dataAlreadySent.length;
                    if (_this._isComposing) {
                        input = _this._textarea.value.substring(currentCompositionPosition_1.start, currentCompositionPosition_1.end);
                    }
                    else {
                        input = _this._textarea.value.substring(currentCompositionPosition_1.start);
                    }
                    if (input.length > 0) {
                        _this._coreService.triggerDataEvent(input, true);
                    }
                }
            }, 0);
        }
    };
    CompositionHelper.prototype._handleAnyTextareaChanges = function () {
        var _this = this;
        var oldValue = this._textarea.value;
        setTimeout(function () {
            if (!_this._isComposing) {
                var newValue = _this._textarea.value;
                var diff = newValue.replace(oldValue, '');
                if (diff.length > 0) {
                    _this._dataAlreadySent = diff;
                    _this._coreService.triggerDataEvent(diff, true);
                }
            }
        }, 0);
    };
    CompositionHelper.prototype.updateCompositionElements = function (dontRecurse) {
        var _this = this;
        if (!this._isComposing) {
            return;
        }
        if (this._bufferService.buffer.isCursorInViewport) {
            var cellHeight = Math.ceil(this._charSizeService.height * this._optionsService.options.lineHeight);
            var cursorTop = this._bufferService.buffer.y * cellHeight;
            var cursorLeft = this._bufferService.buffer.x * this._charSizeService.width;
            this._compositionView.style.left = cursorLeft + 'px';
            this._compositionView.style.top = cursorTop + 'px';
            this._compositionView.style.height = cellHeight + 'px';
            this._compositionView.style.lineHeight = cellHeight + 'px';
            this._compositionView.style.fontFamily = this._optionsService.options.fontFamily;
            this._compositionView.style.fontSize = this._optionsService.options.fontSize + 'px';
            var compositionViewBounds = this._compositionView.getBoundingClientRect();
            this._textarea.style.left = cursorLeft + 'px';
            this._textarea.style.top = cursorTop + 'px';
            this._textarea.style.width = compositionViewBounds.width + 'px';
            this._textarea.style.height = compositionViewBounds.height + 'px';
            this._textarea.style.lineHeight = compositionViewBounds.height + 'px';
        }
        if (!dontRecurse) {
            setTimeout(function () { return _this.updateCompositionElements(true); }, 0);
        }
    };
    CompositionHelper = __decorate([
        __param(2, Services_2.IBufferService),
        __param(3, Services_2.IOptionsService),
        __param(4, Services_1.ICharSizeService),
        __param(5, Services_2.ICoreService)
    ], CompositionHelper);
    return CompositionHelper;
}());
exports.CompositionHelper = CompositionHelper;


/***/ }),

/***/ "./out/browser/input/Mouse.js":
/*!************************************!*\
  !*** ./out/browser/input/Mouse.js ***!
  \************************************/
/*! flagged exports */
/*! export __esModule [provided] [no usage info] [missing usage info prevents renaming] */
/*! export getCoords [provided] [no usage info] [missing usage info prevents renaming] */
/*! export getCoordsRelativeToElement [provided] [no usage info] [missing usage info prevents renaming] */
/*! export getRawByteCoords [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_exports__ */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getRawByteCoords = exports.getCoords = exports.getCoordsRelativeToElement = void 0;
function getCoordsRelativeToElement(event, element) {
    var rect = element.getBoundingClientRect();
    return [event.clientX - rect.left, event.clientY - rect.top];
}
exports.getCoordsRelativeToElement = getCoordsRelativeToElement;
function getCoords(event, element, colCount, rowCount, hasValidCharSize, actualCellWidth, actualCellHeight, isSelection) {
    if (!hasValidCharSize) {
        return undefined;
    }
    var coords = getCoordsRelativeToElement(event, element);
    if (!coords) {
        return undefined;
    }
    coords[0] = Math.ceil((coords[0] + (isSelection ? actualCellWidth / 2 : 0)) / actualCellWidth);
    coords[1] = Math.ceil(coords[1] / actualCellHeight);
    coords[0] = Math.min(Math.max(coords[0], 1), colCount + (isSelection ? 1 : 0));
    coords[1] = Math.min(Math.max(coords[1], 1), rowCount);
    return coords;
}
exports.getCoords = getCoords;
function getRawByteCoords(coords) {
    if (!coords) {
        return undefined;
    }
    return { x: coords[0] + 32, y: coords[1] + 32 };
}
exports.getRawByteCoords = getRawByteCoords;


/***/ }),

/***/ "./out/browser/input/MoveToCell.js":
/*!*****************************************!*\
  !*** ./out/browser/input/MoveToCell.js ***!
  \*****************************************/
/*! flagged exports */
/*! export __esModule [provided] [no usage info] [missing usage info prevents renaming] */
/*! export moveToCellSequence [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_exports__, __webpack_require__ */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.moveToCellSequence = void 0;
var EscapeSequences_1 = __webpack_require__(/*! common/data/EscapeSequences */ "./out/common/data/EscapeSequences.js");
function moveToCellSequence(targetX, targetY, bufferService, applicationCursor) {
    var startX = bufferService.buffer.x;
    var startY = bufferService.buffer.y;
    if (!bufferService.buffer.hasScrollback) {
        return resetStartingRow(startX, startY, targetX, targetY, bufferService, applicationCursor) +
            moveToRequestedRow(startY, targetY, bufferService, applicationCursor) +
            moveToRequestedCol(startX, startY, targetX, targetY, bufferService, applicationCursor);
    }
    var direction;
    if (startY === targetY) {
        direction = startX > targetX ? "D" : "C";
        return repeat(Math.abs(startX - targetX), sequence(direction, applicationCursor));
    }
    direction = startY > targetY ? "D" : "C";
    var rowDifference = Math.abs(startY - targetY);
    var cellsToMove = colsFromRowEnd(startY > targetY ? targetX : startX, bufferService) +
        (rowDifference - 1) * bufferService.cols + 1 +
        colsFromRowBeginning(startY > targetY ? startX : targetX, bufferService);
    return repeat(cellsToMove, sequence(direction, applicationCursor));
}
exports.moveToCellSequence = moveToCellSequence;
function colsFromRowBeginning(currX, bufferService) {
    return currX - 1;
}
function colsFromRowEnd(currX, bufferService) {
    return bufferService.cols - currX;
}
function resetStartingRow(startX, startY, targetX, targetY, bufferService, applicationCursor) {
    if (moveToRequestedRow(startY, targetY, bufferService, applicationCursor).length === 0) {
        return '';
    }
    return repeat(bufferLine(startX, startY, startX, startY - wrappedRowsForRow(bufferService, startY), false, bufferService).length, sequence("D", applicationCursor));
}
function moveToRequestedRow(startY, targetY, bufferService, applicationCursor) {
    var startRow = startY - wrappedRowsForRow(bufferService, startY);
    var endRow = targetY - wrappedRowsForRow(bufferService, targetY);
    var rowsToMove = Math.abs(startRow - endRow) - wrappedRowsCount(startY, targetY, bufferService);
    return repeat(rowsToMove, sequence(verticalDirection(startY, targetY), applicationCursor));
}
function moveToRequestedCol(startX, startY, targetX, targetY, bufferService, applicationCursor) {
    var startRow;
    if (moveToRequestedRow(startY, targetY, bufferService, applicationCursor).length > 0) {
        startRow = targetY - wrappedRowsForRow(bufferService, targetY);
    }
    else {
        startRow = startY;
    }
    var endRow = targetY;
    var direction = horizontalDirection(startX, startY, targetX, targetY, bufferService, applicationCursor);
    return repeat(bufferLine(startX, startRow, targetX, endRow, direction === "C", bufferService).length, sequence(direction, applicationCursor));
}
function wrappedRowsCount(startY, targetY, bufferService) {
    var wrappedRows = 0;
    var startRow = startY - wrappedRowsForRow(bufferService, startY);
    var endRow = targetY - wrappedRowsForRow(bufferService, targetY);
    for (var i = 0; i < Math.abs(startRow - endRow); i++) {
        var direction = verticalDirection(startY, targetY) === "A" ? -1 : 1;
        var line = bufferService.buffer.lines.get(startRow + (direction * i));
        if (line && line.isWrapped) {
            wrappedRows++;
        }
    }
    return wrappedRows;
}
function wrappedRowsForRow(bufferService, currentRow) {
    var rowCount = 0;
    var line = bufferService.buffer.lines.get(currentRow);
    var lineWraps = line && line.isWrapped;
    while (lineWraps && currentRow >= 0 && currentRow < bufferService.rows) {
        rowCount++;
        line = bufferService.buffer.lines.get(--currentRow);
        lineWraps = line && line.isWrapped;
    }
    return rowCount;
}
function horizontalDirection(startX, startY, targetX, targetY, bufferService, applicationCursor) {
    var startRow;
    if (moveToRequestedRow(targetX, targetY, bufferService, applicationCursor).length > 0) {
        startRow = targetY - wrappedRowsForRow(bufferService, targetY);
    }
    else {
        startRow = startY;
    }
    if ((startX < targetX &&
        startRow <= targetY) ||
        (startX >= targetX &&
            startRow < targetY)) {
        return "C";
    }
    return "D";
}
function verticalDirection(startY, targetY) {
    return startY > targetY ? "A" : "B";
}
function bufferLine(startCol, startRow, endCol, endRow, forward, bufferService) {
    var currentCol = startCol;
    var currentRow = startRow;
    var bufferStr = '';
    while (currentCol !== endCol || currentRow !== endRow) {
        currentCol += forward ? 1 : -1;
        if (forward && currentCol > bufferService.cols - 1) {
            bufferStr += bufferService.buffer.translateBufferLineToString(currentRow, false, startCol, currentCol);
            currentCol = 0;
            startCol = 0;
            currentRow++;
        }
        else if (!forward && currentCol < 0) {
            bufferStr += bufferService.buffer.translateBufferLineToString(currentRow, false, 0, startCol + 1);
            currentCol = bufferService.cols - 1;
            startCol = currentCol;
            currentRow--;
        }
    }
    return bufferStr + bufferService.buffer.translateBufferLineToString(currentRow, false, startCol, currentCol);
}
function sequence(direction, applicationCursor) {
    var mod = applicationCursor ? 'O' : '[';
    return EscapeSequences_1.C0.ESC + mod + direction;
}
function repeat(count, str) {
    count = Math.floor(count);
    var rpt = '';
    for (var i = 0; i < count; i++) {
        rpt += str;
    }
    return rpt;
}


/***/ }),

/***/ "./out/browser/public/AddonManager.js":
/*!********************************************!*\
  !*** ./out/browser/public/AddonManager.js ***!
  \********************************************/
/*! flagged exports */
/*! export AddonManager [provided] [no usage info] [missing usage info prevents renaming] */
/*! export __esModule [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_exports__ */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AddonManager = void 0;
var AddonManager = (function () {
    function AddonManager() {
        this._addons = [];
    }
    AddonManager.prototype.dispose = function () {
        for (var i = this._addons.length - 1; i >= 0; i--) {
            this._addons[i].instance.dispose();
        }
    };
    AddonManager.prototype.loadAddon = function (terminal, instance) {
        var _this = this;
        var loadedAddon = {
            instance: instance,
            dispose: instance.dispose,
            isDisposed: false
        };
        this._addons.push(loadedAddon);
        instance.dispose = function () { return _this._wrappedAddonDispose(loadedAddon); };
        instance.activate(terminal);
    };
    AddonManager.prototype._wrappedAddonDispose = function (loadedAddon) {
        if (loadedAddon.isDisposed) {
            return;
        }
        var index = -1;
        for (var i = 0; i < this._addons.length; i++) {
            if (this._addons[i] === loadedAddon) {
                index = i;
                break;
            }
        }
        if (index === -1) {
            throw new Error('Could not dispose an addon that has not been loaded');
        }
        loadedAddon.isDisposed = true;
        loadedAddon.dispose.apply(loadedAddon.instance);
        this._addons.splice(index, 1);
    };
    return AddonManager;
}());
exports.AddonManager = AddonManager;


/***/ }),

/***/ "./out/browser/public/Terminal.js":
/*!****************************************!*\
  !*** ./out/browser/public/Terminal.js ***!
  \****************************************/
/*! flagged exports */
/*! export Terminal [provided] [maybe used in main (runtime-defined)] [usage prevents renaming] */
/*! export __esModule [provided] [maybe used in main (runtime-defined)] [usage prevents renaming] */
/*! other exports [not provided] [maybe used in main (runtime-defined)] */
/*! runtime requirements: __webpack_exports__, __webpack_require__ */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Terminal = void 0;
var CellData_1 = __webpack_require__(/*! common/buffer/CellData */ "./out/common/buffer/CellData.js");
var Terminal_1 = __webpack_require__(/*! ../Terminal */ "./out/browser/Terminal.js");
var Strings = __webpack_require__(/*! ../LocalizableStrings */ "./out/browser/LocalizableStrings.js");
var EventEmitter_1 = __webpack_require__(/*! common/EventEmitter */ "./out/common/EventEmitter.js");
var AddonManager_1 = __webpack_require__(/*! ./AddonManager */ "./out/browser/public/AddonManager.js");
var Terminal = (function () {
    function Terminal(options) {
        this._core = new Terminal_1.Terminal(options);
        this._addonManager = new AddonManager_1.AddonManager();
    }
    Terminal.prototype._checkProposedApi = function () {
        if (!this._core.optionsService.options.allowProposedApi) {
            throw new Error('You must set the allowProposedApi option to true to use proposed API');
        }
    };
    Object.defineProperty(Terminal.prototype, "onCursorMove", {
        get: function () { return this._core.onCursorMove; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Terminal.prototype, "onLineFeed", {
        get: function () { return this._core.onLineFeed; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Terminal.prototype, "onSelectionChange", {
        get: function () { return this._core.onSelectionChange; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Terminal.prototype, "onData", {
        get: function () { return this._core.onData; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Terminal.prototype, "onBinary", {
        get: function () { return this._core.onBinary; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Terminal.prototype, "onTitleChange", {
        get: function () { return this._core.onTitleChange; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Terminal.prototype, "onScroll", {
        get: function () { return this._core.onScroll; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Terminal.prototype, "onKey", {
        get: function () { return this._core.onKey; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Terminal.prototype, "onRender", {
        get: function () { return this._core.onRender; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Terminal.prototype, "onResize", {
        get: function () { return this._core.onResize; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Terminal.prototype, "element", {
        get: function () { return this._core.element; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Terminal.prototype, "parser", {
        get: function () {
            this._checkProposedApi();
            if (!this._parser) {
                this._parser = new ParserApi(this._core);
            }
            return this._parser;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Terminal.prototype, "unicode", {
        get: function () {
            this._checkProposedApi();
            return new UnicodeApi(this._core);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Terminal.prototype, "textarea", {
        get: function () { return this._core.textarea; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Terminal.prototype, "rows", {
        get: function () { return this._core.rows; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Terminal.prototype, "cols", {
        get: function () { return this._core.cols; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Terminal.prototype, "buffer", {
        get: function () {
            this._checkProposedApi();
            if (!this._buffer) {
                this._buffer = new BufferNamespaceApi(this._core);
            }
            return this._buffer;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Terminal.prototype, "markers", {
        get: function () {
            this._checkProposedApi();
            return this._core.markers;
        },
        enumerable: false,
        configurable: true
    });
    Terminal.prototype.blur = function () {
        this._core.blur();
    };
    Terminal.prototype.focus = function () {
        this._core.focus();
    };
    Terminal.prototype.resize = function (columns, rows) {
        this._verifyIntegers(columns, rows);
        this._core.resize(columns, rows);
    };
    Terminal.prototype.open = function (parent) {
        this._core.open(parent);
    };
    Terminal.prototype.attachCustomKeyEventHandler = function (customKeyEventHandler) {
        this._core.attachCustomKeyEventHandler(customKeyEventHandler);
    };
    Terminal.prototype.registerLinkMatcher = function (regex, handler, options) {
        this._checkProposedApi();
        return this._core.registerLinkMatcher(regex, handler, options);
    };
    Terminal.prototype.deregisterLinkMatcher = function (matcherId) {
        this._checkProposedApi();
        this._core.deregisterLinkMatcher(matcherId);
    };
    Terminal.prototype.registerLinkProvider = function (linkProvider) {
        this._checkProposedApi();
        return this._core.registerLinkProvider(linkProvider);
    };
    Terminal.prototype.registerCharacterJoiner = function (handler) {
        this._checkProposedApi();
        return this._core.registerCharacterJoiner(handler);
    };
    Terminal.prototype.deregisterCharacterJoiner = function (joinerId) {
        this._checkProposedApi();
        this._core.deregisterCharacterJoiner(joinerId);
    };
    Terminal.prototype.registerMarker = function (cursorYOffset) {
        this._checkProposedApi();
        this._verifyIntegers(cursorYOffset);
        return this._core.addMarker(cursorYOffset);
    };
    Terminal.prototype.addMarker = function (cursorYOffset) {
        return this.registerMarker(cursorYOffset);
    };
    Terminal.prototype.hasSelection = function () {
        return this._core.hasSelection();
    };
    Terminal.prototype.select = function (column, row, length) {
        this._verifyIntegers(column, row, length);
        this._core.select(column, row, length);
    };
    Terminal.prototype.getSelection = function () {
        return this._core.getSelection();
    };
    Terminal.prototype.getSelectionPosition = function () {
        return this._core.getSelectionPosition();
    };
    Terminal.prototype.clearSelection = function () {
        this._core.clearSelection();
    };
    Terminal.prototype.selectAll = function () {
        this._core.selectAll();
    };
    Terminal.prototype.selectLines = function (start, end) {
        this._verifyIntegers(start, end);
        this._core.selectLines(start, end);
    };
    Terminal.prototype.dispose = function () {
        this._addonManager.dispose();
        this._core.dispose();
    };
    Terminal.prototype.scrollLines = function (amount) {
        this._verifyIntegers(amount);
        this._core.scrollLines(amount);
    };
    Terminal.prototype.scrollPages = function (pageCount) {
        this._verifyIntegers(pageCount);
        this._core.scrollPages(pageCount);
    };
    Terminal.prototype.scrollToTop = function () {
        this._core.scrollToTop();
    };
    Terminal.prototype.scrollToBottom = function () {
        this._core.scrollToBottom();
    };
    Terminal.prototype.scrollToLine = function (line) {
        this._verifyIntegers(line);
        this._core.scrollToLine(line);
    };
    Terminal.prototype.clear = function () {
        this._core.clear();
    };
    Terminal.prototype.write = function (data, callback) {
        this._core.write(data, callback);
    };
    Terminal.prototype.writeUtf8 = function (data, callback) {
        this._core.write(data, callback);
    };
    Terminal.prototype.writeln = function (data, callback) {
        this._core.write(data);
        this._core.write('\r\n', callback);
    };
    Terminal.prototype.paste = function (data) {
        this._core.paste(data);
    };
    Terminal.prototype.getOption = function (key) {
        return this._core.optionsService.getOption(key);
    };
    Terminal.prototype.setOption = function (key, value) {
        this._core.optionsService.setOption(key, value);
    };
    Terminal.prototype.refresh = function (start, end) {
        this._verifyIntegers(start, end);
        this._core.refresh(start, end);
    };
    Terminal.prototype.reset = function () {
        this._core.reset();
    };
    Terminal.prototype.loadAddon = function (addon) {
        return this._addonManager.loadAddon(this, addon);
    };
    Object.defineProperty(Terminal, "strings", {
        get: function () {
            return Strings;
        },
        enumerable: false,
        configurable: true
    });
    Terminal.prototype._verifyIntegers = function () {
        var values = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            values[_i] = arguments[_i];
        }
        for (var _a = 0, values_1 = values; _a < values_1.length; _a++) {
            var value = values_1[_a];
            if (value === Infinity || isNaN(value) || value % 1 !== 0) {
                throw new Error('This API only accepts integers');
            }
        }
    };
    return Terminal;
}());
exports.Terminal = Terminal;
var BufferApiView = (function () {
    function BufferApiView(_buffer, type) {
        this._buffer = _buffer;
        this.type = type;
    }
    BufferApiView.prototype.init = function (buffer) {
        this._buffer = buffer;
        return this;
    };
    Object.defineProperty(BufferApiView.prototype, "cursorY", {
        get: function () { return this._buffer.y; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BufferApiView.prototype, "cursorX", {
        get: function () { return this._buffer.x; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BufferApiView.prototype, "viewportY", {
        get: function () { return this._buffer.ydisp; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BufferApiView.prototype, "baseY", {
        get: function () { return this._buffer.ybase; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BufferApiView.prototype, "length", {
        get: function () { return this._buffer.lines.length; },
        enumerable: false,
        configurable: true
    });
    BufferApiView.prototype.getLine = function (y) {
        var line = this._buffer.lines.get(y);
        if (!line) {
            return undefined;
        }
        return new BufferLineApiView(line);
    };
    BufferApiView.prototype.getNullCell = function () { return new CellData_1.CellData(); };
    return BufferApiView;
}());
var BufferNamespaceApi = (function () {
    function BufferNamespaceApi(_core) {
        var _this = this;
        this._core = _core;
        this._onBufferChange = new EventEmitter_1.EventEmitter();
        this._normal = new BufferApiView(this._core.buffers.normal, 'normal');
        this._alternate = new BufferApiView(this._core.buffers.alt, 'alternate');
        this._core.buffers.onBufferActivate(function () { return _this._onBufferChange.fire(_this.active); });
    }
    Object.defineProperty(BufferNamespaceApi.prototype, "onBufferChange", {
        get: function () { return this._onBufferChange.event; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BufferNamespaceApi.prototype, "active", {
        get: function () {
            if (this._core.buffers.active === this._core.buffers.normal) {
                return this.normal;
            }
            if (this._core.buffers.active === this._core.buffers.alt) {
                return this.alternate;
            }
            throw new Error('Active buffer is neither normal nor alternate');
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BufferNamespaceApi.prototype, "normal", {
        get: function () {
            return this._normal.init(this._core.buffers.normal);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BufferNamespaceApi.prototype, "alternate", {
        get: function () {
            return this._alternate.init(this._core.buffers.alt);
        },
        enumerable: false,
        configurable: true
    });
    return BufferNamespaceApi;
}());
var BufferLineApiView = (function () {
    function BufferLineApiView(_line) {
        this._line = _line;
    }
    Object.defineProperty(BufferLineApiView.prototype, "isWrapped", {
        get: function () { return this._line.isWrapped; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BufferLineApiView.prototype, "length", {
        get: function () { return this._line.length; },
        enumerable: false,
        configurable: true
    });
    BufferLineApiView.prototype.getCell = function (x, cell) {
        if (x < 0 || x >= this._line.length) {
            return undefined;
        }
        if (cell) {
            this._line.loadCell(x, cell);
            return cell;
        }
        return this._line.loadCell(x, new CellData_1.CellData());
    };
    BufferLineApiView.prototype.translateToString = function (trimRight, startColumn, endColumn) {
        return this._line.translateToString(trimRight, startColumn, endColumn);
    };
    return BufferLineApiView;
}());
var ParserApi = (function () {
    function ParserApi(_core) {
        this._core = _core;
    }
    ParserApi.prototype.registerCsiHandler = function (id, callback) {
        return this._core.addCsiHandler(id, function (params) { return callback(params.toArray()); });
    };
    ParserApi.prototype.addCsiHandler = function (id, callback) {
        return this.registerCsiHandler(id, callback);
    };
    ParserApi.prototype.registerDcsHandler = function (id, callback) {
        return this._core.addDcsHandler(id, function (data, params) { return callback(data, params.toArray()); });
    };
    ParserApi.prototype.addDcsHandler = function (id, callback) {
        return this.registerDcsHandler(id, callback);
    };
    ParserApi.prototype.registerEscHandler = function (id, handler) {
        return this._core.addEscHandler(id, handler);
    };
    ParserApi.prototype.addEscHandler = function (id, handler) {
        return this.registerEscHandler(id, handler);
    };
    ParserApi.prototype.registerOscHandler = function (ident, callback) {
        return this._core.addOscHandler(ident, callback);
    };
    ParserApi.prototype.addOscHandler = function (ident, callback) {
        return this.registerOscHandler(ident, callback);
    };
    return ParserApi;
}());
var UnicodeApi = (function () {
    function UnicodeApi(_core) {
        this._core = _core;
    }
    UnicodeApi.prototype.register = function (provider) {
        this._core.unicodeService.register(provider);
    };
    Object.defineProperty(UnicodeApi.prototype, "versions", {
        get: function () {
            return this._core.unicodeService.versions;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(UnicodeApi.prototype, "activeVersion", {
        get: function () {
            return this._core.unicodeService.activeVersion;
        },
        set: function (version) {
            this._core.unicodeService.activeVersion = version;
        },
        enumerable: false,
        configurable: true
    });
    return UnicodeApi;
}());


/***/ }),

/***/ "./out/browser/renderer/BaseRenderLayer.js":
/*!*************************************************!*\
  !*** ./out/browser/renderer/BaseRenderLayer.js ***!
  \*************************************************/
/*! flagged exports */
/*! export BaseRenderLayer [provided] [no usage info] [missing usage info prevents renaming] */
/*! export __esModule [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_exports__, __webpack_require__ */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BaseRenderLayer = void 0;
var Constants_1 = __webpack_require__(/*! common/buffer/Constants */ "./out/common/buffer/Constants.js");
var Constants_2 = __webpack_require__(/*! browser/renderer/atlas/Constants */ "./out/browser/renderer/atlas/Constants.js");
var CharAtlasCache_1 = __webpack_require__(/*! browser/renderer/atlas/CharAtlasCache */ "./out/browser/renderer/atlas/CharAtlasCache.js");
var AttributeData_1 = __webpack_require__(/*! common/buffer/AttributeData */ "./out/common/buffer/AttributeData.js");
var RendererUtils_1 = __webpack_require__(/*! browser/renderer/RendererUtils */ "./out/browser/renderer/RendererUtils.js");
var Color_1 = __webpack_require__(/*! browser/Color */ "./out/browser/Color.js");
var Dom_1 = __webpack_require__(/*! browser/Dom */ "./out/browser/Dom.js");
var BaseRenderLayer = (function () {
    function BaseRenderLayer(_container, id, zIndex, _alpha, _colors, _rendererId, _bufferService, _optionsService) {
        this._container = _container;
        this._alpha = _alpha;
        this._colors = _colors;
        this._rendererId = _rendererId;
        this._bufferService = _bufferService;
        this._optionsService = _optionsService;
        this._scaledCharWidth = 0;
        this._scaledCharHeight = 0;
        this._scaledCellWidth = 0;
        this._scaledCellHeight = 0;
        this._scaledCharLeft = 0;
        this._scaledCharTop = 0;
        this._currentGlyphIdentifier = {
            chars: '',
            code: 0,
            bg: 0,
            fg: 0,
            bold: false,
            dim: false,
            italic: false
        };
        this._canvas = document.createElement('canvas');
        this._canvas.classList.add("xterm-" + id + "-layer");
        this._canvas.style.zIndex = zIndex.toString();
        this._initCanvas();
        this._container.appendChild(this._canvas);
    }
    BaseRenderLayer.prototype.dispose = function () {
        var _a;
        Dom_1.removeElementFromParent(this._canvas);
        (_a = this._charAtlas) === null || _a === void 0 ? void 0 : _a.dispose();
    };
    BaseRenderLayer.prototype._initCanvas = function () {
        this._ctx = RendererUtils_1.throwIfFalsy(this._canvas.getContext('2d', { alpha: this._alpha }));
        if (!this._alpha) {
            this._clearAll();
        }
    };
    BaseRenderLayer.prototype.onOptionsChanged = function () { };
    BaseRenderLayer.prototype.onBlur = function () { };
    BaseRenderLayer.prototype.onFocus = function () { };
    BaseRenderLayer.prototype.onCursorMove = function () { };
    BaseRenderLayer.prototype.onGridChanged = function (startRow, endRow) { };
    BaseRenderLayer.prototype.onSelectionChanged = function (start, end, columnSelectMode) {
        if (columnSelectMode === void 0) { columnSelectMode = false; }
    };
    BaseRenderLayer.prototype.setColors = function (colorSet) {
        this._refreshCharAtlas(colorSet);
    };
    BaseRenderLayer.prototype._setTransparency = function (alpha) {
        if (alpha === this._alpha) {
            return;
        }
        var oldCanvas = this._canvas;
        this._alpha = alpha;
        this._canvas = this._canvas.cloneNode();
        this._initCanvas();
        this._container.replaceChild(this._canvas, oldCanvas);
        this._refreshCharAtlas(this._colors);
        this.onGridChanged(0, this._bufferService.rows - 1);
    };
    BaseRenderLayer.prototype._refreshCharAtlas = function (colorSet) {
        if (this._scaledCharWidth <= 0 && this._scaledCharHeight <= 0) {
            return;
        }
        this._charAtlas = CharAtlasCache_1.acquireCharAtlas(this._optionsService.options, this._rendererId, colorSet, this._scaledCharWidth, this._scaledCharHeight);
        this._charAtlas.warmUp();
    };
    BaseRenderLayer.prototype.resize = function (dim) {
        this._scaledCellWidth = dim.scaledCellWidth;
        this._scaledCellHeight = dim.scaledCellHeight;
        this._scaledCharWidth = dim.scaledCharWidth;
        this._scaledCharHeight = dim.scaledCharHeight;
        this._scaledCharLeft = dim.scaledCharLeft;
        this._scaledCharTop = dim.scaledCharTop;
        this._canvas.width = dim.scaledCanvasWidth;
        this._canvas.height = dim.scaledCanvasHeight;
        this._canvas.style.width = dim.canvasWidth + "px";
        this._canvas.style.height = dim.canvasHeight + "px";
        if (!this._alpha) {
            this._clearAll();
        }
        this._refreshCharAtlas(this._colors);
    };
    BaseRenderLayer.prototype._fillCells = function (x, y, width, height) {
        this._ctx.fillRect(x * this._scaledCellWidth, y * this._scaledCellHeight, width * this._scaledCellWidth, height * this._scaledCellHeight);
    };
    BaseRenderLayer.prototype._fillBottomLineAtCells = function (x, y, width) {
        if (width === void 0) { width = 1; }
        this._ctx.fillRect(x * this._scaledCellWidth, (y + 1) * this._scaledCellHeight - window.devicePixelRatio - 1, width * this._scaledCellWidth, window.devicePixelRatio);
    };
    BaseRenderLayer.prototype._fillLeftLineAtCell = function (x, y, width) {
        this._ctx.fillRect(x * this._scaledCellWidth, y * this._scaledCellHeight, window.devicePixelRatio * width, this._scaledCellHeight);
    };
    BaseRenderLayer.prototype._strokeRectAtCell = function (x, y, width, height) {
        this._ctx.lineWidth = window.devicePixelRatio;
        this._ctx.strokeRect(x * this._scaledCellWidth + window.devicePixelRatio / 2, y * this._scaledCellHeight + (window.devicePixelRatio / 2), width * this._scaledCellWidth - window.devicePixelRatio, (height * this._scaledCellHeight) - window.devicePixelRatio);
    };
    BaseRenderLayer.prototype._clearAll = function () {
        if (this._alpha) {
            this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
        }
        else {
            this._ctx.fillStyle = this._colors.background.css;
            this._ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);
        }
    };
    BaseRenderLayer.prototype._clearCells = function (x, y, width, height) {
        if (this._alpha) {
            this._ctx.clearRect(x * this._scaledCellWidth, y * this._scaledCellHeight, width * this._scaledCellWidth, height * this._scaledCellHeight);
        }
        else {
            this._ctx.fillStyle = this._colors.background.css;
            this._ctx.fillRect(x * this._scaledCellWidth, y * this._scaledCellHeight, width * this._scaledCellWidth, height * this._scaledCellHeight);
        }
    };
    BaseRenderLayer.prototype._fillCharTrueColor = function (cell, x, y) {
        this._ctx.font = this._getFont(false, false);
        this._ctx.textBaseline = 'middle';
        this._clipRow(y);
        this._ctx.fillText(cell.getChars(), x * this._scaledCellWidth + this._scaledCharLeft, y * this._scaledCellHeight + this._scaledCharTop + this._scaledCharHeight / 2);
    };
    BaseRenderLayer.prototype._drawChars = function (cell, x, y) {
        var contrastColor = this._getContrastColor(cell);
        if (contrastColor || cell.isFgRGB() || cell.isBgRGB()) {
            this._drawUncachedChars(cell, x, y, contrastColor);
            return;
        }
        var fg;
        var bg;
        if (cell.isInverse()) {
            fg = (cell.isBgDefault()) ? Constants_2.INVERTED_DEFAULT_COLOR : cell.getBgColor();
            bg = (cell.isFgDefault()) ? Constants_2.INVERTED_DEFAULT_COLOR : cell.getFgColor();
        }
        else {
            bg = (cell.isBgDefault()) ? Constants_1.DEFAULT_COLOR : cell.getBgColor();
            fg = (cell.isFgDefault()) ? Constants_1.DEFAULT_COLOR : cell.getFgColor();
        }
        var drawInBrightColor = this._optionsService.options.drawBoldTextInBrightColors && cell.isBold() && fg < 8;
        fg += drawInBrightColor ? 8 : 0;
        this._currentGlyphIdentifier.chars = cell.getChars() || Constants_1.WHITESPACE_CELL_CHAR;
        this._currentGlyphIdentifier.code = cell.getCode() || Constants_1.WHITESPACE_CELL_CODE;
        this._currentGlyphIdentifier.bg = bg;
        this._currentGlyphIdentifier.fg = fg;
        this._currentGlyphIdentifier.bold = !!cell.isBold();
        this._currentGlyphIdentifier.dim = !!cell.isDim();
        this._currentGlyphIdentifier.italic = !!cell.isItalic();
        var atlasDidDraw = this._charAtlas && this._charAtlas.draw(this._ctx, this._currentGlyphIdentifier, x * this._scaledCellWidth + this._scaledCharLeft, y * this._scaledCellHeight + this._scaledCharTop);
        if (!atlasDidDraw) {
            this._drawUncachedChars(cell, x, y);
        }
    };
    BaseRenderLayer.prototype._drawUncachedChars = function (cell, x, y, fgOverride) {
        this._ctx.save();
        this._ctx.font = this._getFont(!!cell.isBold(), !!cell.isItalic());
        this._ctx.textBaseline = 'middle';
        if (cell.isInverse()) {
            if (fgOverride) {
                this._ctx.fillStyle = fgOverride.css;
            }
            else if (cell.isBgDefault()) {
                this._ctx.fillStyle = Color_1.color.opaque(this._colors.background).css;
            }
            else if (cell.isBgRGB()) {
                this._ctx.fillStyle = "rgb(" + AttributeData_1.AttributeData.toColorRGB(cell.getBgColor()).join(',') + ")";
            }
            else {
                var bg = cell.getBgColor();
                if (this._optionsService.options.drawBoldTextInBrightColors && cell.isBold() && bg < 8) {
                    bg += 8;
                }
                this._ctx.fillStyle = this._colors.ansi[bg].css;
            }
        }
        else {
            if (fgOverride) {
                this._ctx.fillStyle = fgOverride.css;
            }
            else if (cell.isFgDefault()) {
                this._ctx.fillStyle = this._colors.foreground.css;
            }
            else if (cell.isFgRGB()) {
                this._ctx.fillStyle = "rgb(" + AttributeData_1.AttributeData.toColorRGB(cell.getFgColor()).join(',') + ")";
            }
            else {
                var fg = cell.getFgColor();
                if (this._optionsService.options.drawBoldTextInBrightColors && cell.isBold() && fg < 8) {
                    fg += 8;
                }
                this._ctx.fillStyle = this._colors.ansi[fg].css;
            }
        }
        this._clipRow(y);
        if (cell.isDim()) {
            this._ctx.globalAlpha = Constants_2.DIM_OPACITY;
        }
        this._ctx.fillText(cell.getChars(), x * this._scaledCellWidth + this._scaledCharLeft, y * this._scaledCellHeight + this._scaledCharTop + this._scaledCharHeight / 2);
        this._ctx.restore();
    };
    BaseRenderLayer.prototype._clipRow = function (y) {
        this._ctx.beginPath();
        this._ctx.rect(0, y * this._scaledCellHeight, this._bufferService.cols * this._scaledCellWidth, this._scaledCellHeight);
        this._ctx.clip();
    };
    BaseRenderLayer.prototype._getFont = function (isBold, isItalic) {
        var fontWeight = isBold ? this._optionsService.options.fontWeightBold : this._optionsService.options.fontWeight;
        var fontStyle = isItalic ? 'italic' : '';
        return fontStyle + " " + fontWeight + " " + this._optionsService.options.fontSize * window.devicePixelRatio + "px " + this._optionsService.options.fontFamily;
    };
    BaseRenderLayer.prototype._getContrastColor = function (cell) {
        if (this._optionsService.options.minimumContrastRatio === 1) {
            return undefined;
        }
        var adjustedColor = this._colors.contrastCache.getColor(cell.bg, cell.fg);
        if (adjustedColor !== undefined) {
            return adjustedColor || undefined;
        }
        var fgColor = cell.getFgColor();
        var fgColorMode = cell.getFgColorMode();
        var bgColor = cell.getBgColor();
        var bgColorMode = cell.getBgColorMode();
        var isInverse = !!cell.isInverse();
        var isBold = !!cell.isInverse();
        if (isInverse) {
            var temp = fgColor;
            fgColor = bgColor;
            bgColor = temp;
            var temp2 = fgColorMode;
            fgColorMode = bgColorMode;
            bgColorMode = temp2;
        }
        var bgRgba = this._resolveBackgroundRgba(bgColorMode, bgColor, isInverse);
        var fgRgba = this._resolveForegroundRgba(fgColorMode, fgColor, isInverse, isBold);
        var result = Color_1.rgba.ensureContrastRatio(bgRgba, fgRgba, this._optionsService.options.minimumContrastRatio);
        if (!result) {
            this._colors.contrastCache.setColor(cell.bg, cell.fg, null);
            return undefined;
        }
        var color = {
            css: Color_1.channels.toCss((result >> 24) & 0xFF, (result >> 16) & 0xFF, (result >> 8) & 0xFF),
            rgba: result
        };
        this._colors.contrastCache.setColor(cell.bg, cell.fg, color);
        return color;
    };
    BaseRenderLayer.prototype._resolveBackgroundRgba = function (bgColorMode, bgColor, inverse) {
        switch (bgColorMode) {
            case 16777216:
            case 33554432:
                return this._colors.ansi[bgColor].rgba;
            case 50331648:
                return bgColor << 8;
            case 0:
            default:
                if (inverse) {
                    return this._colors.foreground.rgba;
                }
                return this._colors.background.rgba;
        }
    };
    BaseRenderLayer.prototype._resolveForegroundRgba = function (fgColorMode, fgColor, inverse, bold) {
        switch (fgColorMode) {
            case 16777216:
            case 33554432:
                if (this._optionsService.options.drawBoldTextInBrightColors && bold && fgColor < 8) {
                    fgColor += 8;
                }
                return this._colors.ansi[fgColor].rgba;
            case 50331648:
                return fgColor << 8;
            case 0:
            default:
                if (inverse) {
                    return this._colors.background.rgba;
                }
                return this._colors.foreground.rgba;
        }
    };
    return BaseRenderLayer;
}());
exports.BaseRenderLayer = BaseRenderLayer;


/***/ }),

/***/ "./out/browser/renderer/CharacterJoinerRegistry.js":
/*!*********************************************************!*\
  !*** ./out/browser/renderer/CharacterJoinerRegistry.js ***!
  \*********************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: top-level-this-exports, __webpack_exports__, __webpack_require__ */
/*! CommonJS bailout: this is used directly at 2:17-21 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CharacterJoinerRegistry = exports.JoinedCellData = void 0;
var AttributeData_1 = __webpack_require__(/*! common/buffer/AttributeData */ "./out/common/buffer/AttributeData.js");
var Constants_1 = __webpack_require__(/*! common/buffer/Constants */ "./out/common/buffer/Constants.js");
var CellData_1 = __webpack_require__(/*! common/buffer/CellData */ "./out/common/buffer/CellData.js");
var JoinedCellData = (function (_super) {
    __extends(JoinedCellData, _super);
    function JoinedCellData(firstCell, chars, width) {
        var _this = _super.call(this) || this;
        _this.content = 0;
        _this.combinedData = '';
        _this.fg = firstCell.fg;
        _this.bg = firstCell.bg;
        _this.combinedData = chars;
        _this._width = width;
        return _this;
    }
    JoinedCellData.prototype.isCombined = function () {
        return 2097152;
    };
    JoinedCellData.prototype.getWidth = function () {
        return this._width;
    };
    JoinedCellData.prototype.getChars = function () {
        return this.combinedData;
    };
    JoinedCellData.prototype.getCode = function () {
        return 0x1FFFFF;
    };
    JoinedCellData.prototype.setFromCharData = function (value) {
        throw new Error('not implemented');
    };
    JoinedCellData.prototype.getAsCharData = function () {
        return [this.fg, this.getChars(), this.getWidth(), this.getCode()];
    };
    return JoinedCellData;
}(AttributeData_1.AttributeData));
exports.JoinedCellData = JoinedCellData;
var CharacterJoinerRegistry = (function () {
    function CharacterJoinerRegistry(_bufferService) {
        this._bufferService = _bufferService;
        this._characterJoiners = [];
        this._nextCharacterJoinerId = 0;
        this._workCell = new CellData_1.CellData();
    }
    CharacterJoinerRegistry.prototype.registerCharacterJoiner = function (handler) {
        var joiner = {
            id: this._nextCharacterJoinerId++,
            handler: handler
        };
        this._characterJoiners.push(joiner);
        return joiner.id;
    };
    CharacterJoinerRegistry.prototype.deregisterCharacterJoiner = function (joinerId) {
        for (var i = 0; i < this._characterJoiners.length; i++) {
            if (this._characterJoiners[i].id === joinerId) {
                this._characterJoiners.splice(i, 1);
                return true;
            }
        }
        return false;
    };
    CharacterJoinerRegistry.prototype.getJoinedCharacters = function (row) {
        if (this._characterJoiners.length === 0) {
            return [];
        }
        var line = this._bufferService.buffer.lines.get(row);
        if (!line || line.length === 0) {
            return [];
        }
        var ranges = [];
        var lineStr = line.translateToString(true);
        var rangeStartColumn = 0;
        var currentStringIndex = 0;
        var rangeStartStringIndex = 0;
        var rangeAttrFG = line.getFg(0);
        var rangeAttrBG = line.getBg(0);
        for (var x = 0; x < line.getTrimmedLength(); x++) {
            line.loadCell(x, this._workCell);
            if (this._workCell.getWidth() === 0) {
                continue;
            }
            if (this._workCell.fg !== rangeAttrFG || this._workCell.bg !== rangeAttrBG) {
                if (x - rangeStartColumn > 1) {
                    var joinedRanges = this._getJoinedRanges(lineStr, rangeStartStringIndex, currentStringIndex, line, rangeStartColumn);
                    for (var i = 0; i < joinedRanges.length; i++) {
                        ranges.push(joinedRanges[i]);
                    }
                }
                rangeStartColumn = x;
                rangeStartStringIndex = currentStringIndex;
                rangeAttrFG = this._workCell.fg;
                rangeAttrBG = this._workCell.bg;
            }
            currentStringIndex += this._workCell.getChars().length || Constants_1.WHITESPACE_CELL_CHAR.length;
        }
        if (this._bufferService.cols - rangeStartColumn > 1) {
            var joinedRanges = this._getJoinedRanges(lineStr, rangeStartStringIndex, currentStringIndex, line, rangeStartColumn);
            for (var i = 0; i < joinedRanges.length; i++) {
                ranges.push(joinedRanges[i]);
            }
        }
        return ranges;
    };
    CharacterJoinerRegistry.prototype._getJoinedRanges = function (line, startIndex, endIndex, lineData, startCol) {
        var text = line.substring(startIndex, endIndex);
        var joinedRanges = this._characterJoiners[0].handler(text);
        for (var i = 1; i < this._characterJoiners.length; i++) {
            var joinerRanges = this._characterJoiners[i].handler(text);
            for (var j = 0; j < joinerRanges.length; j++) {
                CharacterJoinerRegistry._mergeRanges(joinedRanges, joinerRanges[j]);
            }
        }
        this._stringRangesToCellRanges(joinedRanges, lineData, startCol);
        return joinedRanges;
    };
    CharacterJoinerRegistry.prototype._stringRangesToCellRanges = function (ranges, line, startCol) {
        var currentRangeIndex = 0;
        var currentRangeStarted = false;
        var currentStringIndex = 0;
        var currentRange = ranges[currentRangeIndex];
        if (!currentRange) {
            return;
        }
        for (var x = startCol; x < this._bufferService.cols; x++) {
            var width = line.getWidth(x);
            var length_1 = line.getString(x).length || Constants_1.WHITESPACE_CELL_CHAR.length;
            if (width === 0) {
                continue;
            }
            if (!currentRangeStarted && currentRange[0] <= currentStringIndex) {
                currentRange[0] = x;
                currentRangeStarted = true;
            }
            if (currentRange[1] <= currentStringIndex) {
                currentRange[1] = x;
                currentRange = ranges[++currentRangeIndex];
                if (!currentRange) {
                    break;
                }
                if (currentRange[0] <= currentStringIndex) {
                    currentRange[0] = x;
                    currentRangeStarted = true;
                }
                else {
                    currentRangeStarted = false;
                }
            }
            currentStringIndex += length_1;
        }
        if (currentRange) {
            currentRange[1] = this._bufferService.cols;
        }
    };
    CharacterJoinerRegistry._mergeRanges = function (ranges, newRange) {
        var inRange = false;
        for (var i = 0; i < ranges.length; i++) {
            var range = ranges[i];
            if (!inRange) {
                if (newRange[1] <= range[0]) {
                    ranges.splice(i, 0, newRange);
                    return ranges;
                }
                if (newRange[1] <= range[1]) {
                    range[0] = Math.min(newRange[0], range[0]);
                    return ranges;
                }
                if (newRange[0] < range[1]) {
                    range[0] = Math.min(newRange[0], range[0]);
                    inRange = true;
                }
                continue;
            }
            else {
                if (newRange[1] <= range[0]) {
                    ranges[i - 1][1] = newRange[1];
                    return ranges;
                }
                if (newRange[1] <= range[1]) {
                    ranges[i - 1][1] = Math.max(newRange[1], range[1]);
                    ranges.splice(i, 1);
                    return ranges;
                }
                ranges.splice(i, 1);
                i--;
            }
        }
        if (inRange) {
            ranges[ranges.length - 1][1] = newRange[1];
        }
        else {
            ranges.push(newRange);
        }
        return ranges;
    };
    return CharacterJoinerRegistry;
}());
exports.CharacterJoinerRegistry = CharacterJoinerRegistry;


/***/ }),

/***/ "./out/browser/renderer/CursorRenderLayer.js":
/*!***************************************************!*\
  !*** ./out/browser/renderer/CursorRenderLayer.js ***!
  \***************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: top-level-this-exports, __webpack_exports__, __webpack_require__ */
/*! CommonJS bailout: this is used directly at 2:17-21 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CursorRenderLayer = void 0;
var BaseRenderLayer_1 = __webpack_require__(/*! browser/renderer/BaseRenderLayer */ "./out/browser/renderer/BaseRenderLayer.js");
var CellData_1 = __webpack_require__(/*! common/buffer/CellData */ "./out/common/buffer/CellData.js");
var BLINK_INTERVAL = 600;
var CursorRenderLayer = (function (_super) {
    __extends(CursorRenderLayer, _super);
    function CursorRenderLayer(container, zIndex, colors, rendererId, _onRequestRedraw, bufferService, optionsService, _coreService, _coreBrowserService) {
        var _this = _super.call(this, container, 'cursor', zIndex, true, colors, rendererId, bufferService, optionsService) || this;
        _this._onRequestRedraw = _onRequestRedraw;
        _this._coreService = _coreService;
        _this._coreBrowserService = _coreBrowserService;
        _this._cell = new CellData_1.CellData();
        _this._state = {
            x: 0,
            y: 0,
            isFocused: false,
            style: '',
            width: 0
        };
        _this._cursorRenderers = {
            'bar': _this._renderBarCursor.bind(_this),
            'block': _this._renderBlockCursor.bind(_this),
            'underline': _this._renderUnderlineCursor.bind(_this)
        };
        return _this;
    }
    CursorRenderLayer.prototype.resize = function (dim) {
        _super.prototype.resize.call(this, dim);
        this._state = {
            x: 0,
            y: 0,
            isFocused: false,
            style: '',
            width: 0
        };
    };
    CursorRenderLayer.prototype.reset = function () {
        this._clearCursor();
        if (this._cursorBlinkStateManager) {
            this._cursorBlinkStateManager.dispose();
            this._cursorBlinkStateManager = undefined;
            this.onOptionsChanged();
        }
    };
    CursorRenderLayer.prototype.onBlur = function () {
        if (this._cursorBlinkStateManager) {
            this._cursorBlinkStateManager.pause();
        }
        this._onRequestRedraw.fire({ start: this._bufferService.buffer.y, end: this._bufferService.buffer.y });
    };
    CursorRenderLayer.prototype.onFocus = function () {
        if (this._cursorBlinkStateManager) {
            this._cursorBlinkStateManager.resume();
        }
        else {
            this._onRequestRedraw.fire({ start: this._bufferService.buffer.y, end: this._bufferService.buffer.y });
        }
    };
    CursorRenderLayer.prototype.onOptionsChanged = function () {
        var _this = this;
        var _a;
        if (this._optionsService.options.cursorBlink) {
            if (!this._cursorBlinkStateManager) {
                this._cursorBlinkStateManager = new CursorBlinkStateManager(this._coreBrowserService.isFocused, function () {
                    _this._render(true);
                });
            }
        }
        else {
            (_a = this._cursorBlinkStateManager) === null || _a === void 0 ? void 0 : _a.dispose();
            this._cursorBlinkStateManager = undefined;
        }
        this._onRequestRedraw.fire({ start: this._bufferService.buffer.y, end: this._bufferService.buffer.y });
    };
    CursorRenderLayer.prototype.onCursorMove = function () {
        if (this._cursorBlinkStateManager) {
            this._cursorBlinkStateManager.restartBlinkAnimation();
        }
    };
    CursorRenderLayer.prototype.onGridChanged = function (startRow, endRow) {
        if (!this._cursorBlinkStateManager || this._cursorBlinkStateManager.isPaused) {
            this._render(false);
        }
        else {
            this._cursorBlinkStateManager.restartBlinkAnimation();
        }
    };
    CursorRenderLayer.prototype._render = function (triggeredByAnimationFrame) {
        if (!this._coreService.isCursorInitialized || this._coreService.isCursorHidden) {
            this._clearCursor();
            return;
        }
        var cursorY = this._bufferService.buffer.ybase + this._bufferService.buffer.y;
        var viewportRelativeCursorY = cursorY - this._bufferService.buffer.ydisp;
        if (viewportRelativeCursorY < 0 || viewportRelativeCursorY >= this._bufferService.rows) {
            this._clearCursor();
            return;
        }
        var cursorX = Math.min(this._bufferService.buffer.x, this._bufferService.cols - 1);
        this._bufferService.buffer.lines.get(cursorY).loadCell(cursorX, this._cell);
        if (this._cell.content === undefined) {
            return;
        }
        if (!this._coreBrowserService.isFocused) {
            this._clearCursor();
            this._ctx.save();
            this._ctx.fillStyle = this._colors.cursor.css;
            var cursorStyle = this._optionsService.options.cursorStyle;
            if (cursorStyle && cursorStyle !== 'block') {
                this._cursorRenderers[cursorStyle](cursorX, viewportRelativeCursorY, this._cell);
            }
            else {
                this._renderBlurCursor(cursorX, viewportRelativeCursorY, this._cell);
            }
            this._ctx.restore();
            this._state.x = cursorX;
            this._state.y = viewportRelativeCursorY;
            this._state.isFocused = false;
            this._state.style = cursorStyle;
            this._state.width = this._cell.getWidth();
            return;
        }
        if (this._cursorBlinkStateManager && !this._cursorBlinkStateManager.isCursorVisible) {
            this._clearCursor();
            return;
        }
        if (this._state) {
            if (this._state.x === cursorX &&
                this._state.y === viewportRelativeCursorY &&
                this._state.isFocused === this._coreBrowserService.isFocused &&
                this._state.style === this._optionsService.options.cursorStyle &&
                this._state.width === this._cell.getWidth()) {
                return;
            }
            this._clearCursor();
        }
        this._ctx.save();
        this._cursorRenderers[this._optionsService.options.cursorStyle || 'block'](cursorX, viewportRelativeCursorY, this._cell);
        this._ctx.restore();
        this._state.x = cursorX;
        this._state.y = viewportRelativeCursorY;
        this._state.isFocused = false;
        this._state.style = this._optionsService.options.cursorStyle;
        this._state.width = this._cell.getWidth();
    };
    CursorRenderLayer.prototype._clearCursor = function () {
        if (this._state) {
            this._clearCells(this._state.x, this._state.y, this._state.width, 1);
            this._state = {
                x: 0,
                y: 0,
                isFocused: false,
                style: '',
                width: 0
            };
        }
    };
    CursorRenderLayer.prototype._renderBarCursor = function (x, y, cell) {
        this._ctx.save();
        this._ctx.fillStyle = this._colors.cursor.css;
        this._fillLeftLineAtCell(x, y, this._optionsService.options.cursorWidth);
        this._ctx.restore();
    };
    CursorRenderLayer.prototype._renderBlockCursor = function (x, y, cell) {
        this._ctx.save();
        this._ctx.fillStyle = this._colors.cursor.css;
        this._fillCells(x, y, cell.getWidth(), 1);
        this._ctx.fillStyle = this._colors.cursorAccent.css;
        this._fillCharTrueColor(cell, x, y);
        this._ctx.restore();
    };
    CursorRenderLayer.prototype._renderUnderlineCursor = function (x, y, cell) {
        this._ctx.save();
        this._ctx.fillStyle = this._colors.cursor.css;
        this._fillBottomLineAtCells(x, y);
        this._ctx.restore();
    };
    CursorRenderLayer.prototype._renderBlurCursor = function (x, y, cell) {
        this._ctx.save();
        this._ctx.strokeStyle = this._colors.cursor.css;
        this._strokeRectAtCell(x, y, cell.getWidth(), 1);
        this._ctx.restore();
    };
    return CursorRenderLayer;
}(BaseRenderLayer_1.BaseRenderLayer));
exports.CursorRenderLayer = CursorRenderLayer;
var CursorBlinkStateManager = (function () {
    function CursorBlinkStateManager(isFocused, _renderCallback) {
        this._renderCallback = _renderCallback;
        this.isCursorVisible = true;
        if (isFocused) {
            this._restartInterval();
        }
    }
    Object.defineProperty(CursorBlinkStateManager.prototype, "isPaused", {
        get: function () { return !(this._blinkStartTimeout || this._blinkInterval); },
        enumerable: false,
        configurable: true
    });
    CursorBlinkStateManager.prototype.dispose = function () {
        if (this._blinkInterval) {
            window.clearInterval(this._blinkInterval);
            this._blinkInterval = undefined;
        }
        if (this._blinkStartTimeout) {
            window.clearTimeout(this._blinkStartTimeout);
            this._blinkStartTimeout = undefined;
        }
        if (this._animationFrame) {
            window.cancelAnimationFrame(this._animationFrame);
            this._animationFrame = undefined;
        }
    };
    CursorBlinkStateManager.prototype.restartBlinkAnimation = function () {
        var _this = this;
        if (this.isPaused) {
            return;
        }
        this._animationTimeRestarted = Date.now();
        this.isCursorVisible = true;
        if (!this._animationFrame) {
            this._animationFrame = window.requestAnimationFrame(function () {
                _this._renderCallback();
                _this._animationFrame = undefined;
            });
        }
    };
    CursorBlinkStateManager.prototype._restartInterval = function (timeToStart) {
        var _this = this;
        if (timeToStart === void 0) { timeToStart = BLINK_INTERVAL; }
        if (this._blinkInterval) {
            window.clearInterval(this._blinkInterval);
        }
        this._blinkStartTimeout = window.setTimeout(function () {
            if (_this._animationTimeRestarted) {
                var time = BLINK_INTERVAL - (Date.now() - _this._animationTimeRestarted);
                _this._animationTimeRestarted = undefined;
                if (time > 0) {
                    _this._restartInterval(time);
                    return;
                }
            }
            _this.isCursorVisible = false;
            _this._animationFrame = window.requestAnimationFrame(function () {
                _this._renderCallback();
                _this._animationFrame = undefined;
            });
            _this._blinkInterval = window.setInterval(function () {
                if (_this._animationTimeRestarted) {
                    var time = BLINK_INTERVAL - (Date.now() - _this._animationTimeRestarted);
                    _this._animationTimeRestarted = undefined;
                    _this._restartInterval(time);
                    return;
                }
                _this.isCursorVisible = !_this.isCursorVisible;
                _this._animationFrame = window.requestAnimationFrame(function () {
                    _this._renderCallback();
                    _this._animationFrame = undefined;
                });
            }, BLINK_INTERVAL);
        }, timeToStart);
    };
    CursorBlinkStateManager.prototype.pause = function () {
        this.isCursorVisible = true;
        if (this._blinkInterval) {
            window.clearInterval(this._blinkInterval);
            this._blinkInterval = undefined;
        }
        if (this._blinkStartTimeout) {
            window.clearTimeout(this._blinkStartTimeout);
            this._blinkStartTimeout = undefined;
        }
        if (this._animationFrame) {
            window.cancelAnimationFrame(this._animationFrame);
            this._animationFrame = undefined;
        }
    };
    CursorBlinkStateManager.prototype.resume = function () {
        this.pause();
        this._animationTimeRestarted = undefined;
        this._restartInterval();
        this.restartBlinkAnimation();
    };
    return CursorBlinkStateManager;
}());


/***/ }),

/***/ "./out/browser/renderer/GridCache.js":
/*!*******************************************!*\
  !*** ./out/browser/renderer/GridCache.js ***!
  \*******************************************/
/*! flagged exports */
/*! export GridCache [provided] [no usage info] [missing usage info prevents renaming] */
/*! export __esModule [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_exports__ */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GridCache = void 0;
var GridCache = (function () {
    function GridCache() {
        this.cache = [];
    }
    GridCache.prototype.resize = function (width, height) {
        for (var x = 0; x < width; x++) {
            if (this.cache.length <= x) {
                this.cache.push([]);
            }
            for (var y = this.cache[x].length; y < height; y++) {
                this.cache[x].push(undefined);
            }
            this.cache[x].length = height;
        }
        this.cache.length = width;
    };
    GridCache.prototype.clear = function () {
        for (var x = 0; x < this.cache.length; x++) {
            for (var y = 0; y < this.cache[x].length; y++) {
                this.cache[x][y] = undefined;
            }
        }
    };
    return GridCache;
}());
exports.GridCache = GridCache;


/***/ }),

/***/ "./out/browser/renderer/LinkRenderLayer.js":
/*!*************************************************!*\
  !*** ./out/browser/renderer/LinkRenderLayer.js ***!
  \*************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: top-level-this-exports, __webpack_exports__, __webpack_require__ */
/*! CommonJS bailout: this is used directly at 2:17-21 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LinkRenderLayer = void 0;
var BaseRenderLayer_1 = __webpack_require__(/*! ./BaseRenderLayer */ "./out/browser/renderer/BaseRenderLayer.js");
var Constants_1 = __webpack_require__(/*! browser/renderer/atlas/Constants */ "./out/browser/renderer/atlas/Constants.js");
var CharAtlasUtils_1 = __webpack_require__(/*! browser/renderer/atlas/CharAtlasUtils */ "./out/browser/renderer/atlas/CharAtlasUtils.js");
var LinkRenderLayer = (function (_super) {
    __extends(LinkRenderLayer, _super);
    function LinkRenderLayer(container, zIndex, colors, rendererId, linkifier, linkifier2, bufferService, optionsService) {
        var _this = _super.call(this, container, 'link', zIndex, true, colors, rendererId, bufferService, optionsService) || this;
        linkifier.onShowLinkUnderline(function (e) { return _this._onShowLinkUnderline(e); });
        linkifier.onHideLinkUnderline(function (e) { return _this._onHideLinkUnderline(e); });
        linkifier2.onShowLinkUnderline(function (e) { return _this._onShowLinkUnderline(e); });
        linkifier2.onHideLinkUnderline(function (e) { return _this._onHideLinkUnderline(e); });
        return _this;
    }
    LinkRenderLayer.prototype.resize = function (dim) {
        _super.prototype.resize.call(this, dim);
        this._state = undefined;
    };
    LinkRenderLayer.prototype.reset = function () {
        this._clearCurrentLink();
    };
    LinkRenderLayer.prototype._clearCurrentLink = function () {
        if (this._state) {
            this._clearCells(this._state.x1, this._state.y1, this._state.cols - this._state.x1, 1);
            var middleRowCount = this._state.y2 - this._state.y1 - 1;
            if (middleRowCount > 0) {
                this._clearCells(0, this._state.y1 + 1, this._state.cols, middleRowCount);
            }
            this._clearCells(0, this._state.y2, this._state.x2, 1);
            this._state = undefined;
        }
    };
    LinkRenderLayer.prototype._onShowLinkUnderline = function (e) {
        if (e.fg === Constants_1.INVERTED_DEFAULT_COLOR) {
            this._ctx.fillStyle = this._colors.background.css;
        }
        else if (e.fg && CharAtlasUtils_1.is256Color(e.fg)) {
            this._ctx.fillStyle = this._colors.ansi[e.fg].css;
        }
        else {
            this._ctx.fillStyle = this._colors.foreground.css;
        }
        if (e.y1 === e.y2) {
            this._fillBottomLineAtCells(e.x1, e.y1, e.x2 - e.x1);
        }
        else {
            this._fillBottomLineAtCells(e.x1, e.y1, e.cols - e.x1);
            for (var y = e.y1 + 1; y < e.y2; y++) {
                this._fillBottomLineAtCells(0, y, e.cols);
            }
            this._fillBottomLineAtCells(0, e.y2, e.x2);
        }
        this._state = e;
    };
    LinkRenderLayer.prototype._onHideLinkUnderline = function (e) {
        this._clearCurrentLink();
    };
    return LinkRenderLayer;
}(BaseRenderLayer_1.BaseRenderLayer));
exports.LinkRenderLayer = LinkRenderLayer;


/***/ }),

/***/ "./out/browser/renderer/Renderer.js":
/*!******************************************!*\
  !*** ./out/browser/renderer/Renderer.js ***!
  \******************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: top-level-this-exports, __webpack_exports__, __webpack_require__ */
/*! CommonJS bailout: this is used directly at 2:17-21 */
/*! CommonJS bailout: this is used directly at 15:18-22 */
/*! CommonJS bailout: this is used directly at 21:15-19 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Renderer = void 0;
var TextRenderLayer_1 = __webpack_require__(/*! browser/renderer/TextRenderLayer */ "./out/browser/renderer/TextRenderLayer.js");
var SelectionRenderLayer_1 = __webpack_require__(/*! browser/renderer/SelectionRenderLayer */ "./out/browser/renderer/SelectionRenderLayer.js");
var CursorRenderLayer_1 = __webpack_require__(/*! browser/renderer/CursorRenderLayer */ "./out/browser/renderer/CursorRenderLayer.js");
var LinkRenderLayer_1 = __webpack_require__(/*! browser/renderer/LinkRenderLayer */ "./out/browser/renderer/LinkRenderLayer.js");
var CharacterJoinerRegistry_1 = __webpack_require__(/*! browser/renderer/CharacterJoinerRegistry */ "./out/browser/renderer/CharacterJoinerRegistry.js");
var Lifecycle_1 = __webpack_require__(/*! common/Lifecycle */ "./out/common/Lifecycle.js");
var Services_1 = __webpack_require__(/*! browser/services/Services */ "./out/browser/services/Services.js");
var Services_2 = __webpack_require__(/*! common/services/Services */ "./out/common/services/Services.js");
var CharAtlasCache_1 = __webpack_require__(/*! browser/renderer/atlas/CharAtlasCache */ "./out/browser/renderer/atlas/CharAtlasCache.js");
var EventEmitter_1 = __webpack_require__(/*! common/EventEmitter */ "./out/common/EventEmitter.js");
var nextRendererId = 1;
var Renderer = (function (_super) {
    __extends(Renderer, _super);
    function Renderer(_colors, _screenElement, linkifier, linkifier2, _bufferService, _charSizeService, _optionsService, coreService, coreBrowserService) {
        var _this = _super.call(this) || this;
        _this._colors = _colors;
        _this._screenElement = _screenElement;
        _this._bufferService = _bufferService;
        _this._charSizeService = _charSizeService;
        _this._optionsService = _optionsService;
        _this._id = nextRendererId++;
        _this._onRequestRedraw = new EventEmitter_1.EventEmitter();
        var allowTransparency = _this._optionsService.options.allowTransparency;
        _this._characterJoinerRegistry = new CharacterJoinerRegistry_1.CharacterJoinerRegistry(_this._bufferService);
        _this._renderLayers = [
            new TextRenderLayer_1.TextRenderLayer(_this._screenElement, 0, _this._colors, _this._characterJoinerRegistry, allowTransparency, _this._id, _this._bufferService, _optionsService),
            new SelectionRenderLayer_1.SelectionRenderLayer(_this._screenElement, 1, _this._colors, _this._id, _this._bufferService, _optionsService),
            new LinkRenderLayer_1.LinkRenderLayer(_this._screenElement, 2, _this._colors, _this._id, linkifier, linkifier2, _this._bufferService, _optionsService),
            new CursorRenderLayer_1.CursorRenderLayer(_this._screenElement, 3, _this._colors, _this._id, _this._onRequestRedraw, _this._bufferService, _optionsService, coreService, coreBrowserService)
        ];
        _this.dimensions = {
            scaledCharWidth: 0,
            scaledCharHeight: 0,
            scaledCellWidth: 0,
            scaledCellHeight: 0,
            scaledCharLeft: 0,
            scaledCharTop: 0,
            scaledCanvasWidth: 0,
            scaledCanvasHeight: 0,
            canvasWidth: 0,
            canvasHeight: 0,
            actualCellWidth: 0,
            actualCellHeight: 0
        };
        _this._devicePixelRatio = window.devicePixelRatio;
        _this._updateDimensions();
        _this.onOptionsChanged();
        return _this;
    }
    Object.defineProperty(Renderer.prototype, "onRequestRedraw", {
        get: function () { return this._onRequestRedraw.event; },
        enumerable: false,
        configurable: true
    });
    Renderer.prototype.dispose = function () {
        for (var _i = 0, _a = this._renderLayers; _i < _a.length; _i++) {
            var l = _a[_i];
            l.dispose();
        }
        _super.prototype.dispose.call(this);
        CharAtlasCache_1.removeTerminalFromCache(this._id);
    };
    Renderer.prototype.onDevicePixelRatioChange = function () {
        if (this._devicePixelRatio !== window.devicePixelRatio) {
            this._devicePixelRatio = window.devicePixelRatio;
            this.onResize(this._bufferService.cols, this._bufferService.rows);
        }
    };
    Renderer.prototype.setColors = function (colors) {
        this._colors = colors;
        for (var _i = 0, _a = this._renderLayers; _i < _a.length; _i++) {
            var l = _a[_i];
            l.setColors(this._colors);
            l.reset();
        }
    };
    Renderer.prototype.onResize = function (cols, rows) {
        this._updateDimensions();
        for (var _i = 0, _a = this._renderLayers; _i < _a.length; _i++) {
            var l = _a[_i];
            l.resize(this.dimensions);
        }
        this._screenElement.style.width = this.dimensions.canvasWidth + "px";
        this._screenElement.style.height = this.dimensions.canvasHeight + "px";
    };
    Renderer.prototype.onCharSizeChanged = function () {
        this.onResize(this._bufferService.cols, this._bufferService.rows);
    };
    Renderer.prototype.onBlur = function () {
        this._runOperation(function (l) { return l.onBlur(); });
    };
    Renderer.prototype.onFocus = function () {
        this._runOperation(function (l) { return l.onFocus(); });
    };
    Renderer.prototype.onSelectionChanged = function (start, end, columnSelectMode) {
        if (columnSelectMode === void 0) { columnSelectMode = false; }
        this._runOperation(function (l) { return l.onSelectionChanged(start, end, columnSelectMode); });
    };
    Renderer.prototype.onCursorMove = function () {
        this._runOperation(function (l) { return l.onCursorMove(); });
    };
    Renderer.prototype.onOptionsChanged = function () {
        this._runOperation(function (l) { return l.onOptionsChanged(); });
    };
    Renderer.prototype.clear = function () {
        this._runOperation(function (l) { return l.reset(); });
    };
    Renderer.prototype._runOperation = function (operation) {
        for (var _i = 0, _a = this._renderLayers; _i < _a.length; _i++) {
            var l = _a[_i];
            operation(l);
        }
    };
    Renderer.prototype.renderRows = function (start, end) {
        for (var _i = 0, _a = this._renderLayers; _i < _a.length; _i++) {
            var l = _a[_i];
            l.onGridChanged(start, end);
        }
    };
    Renderer.prototype._updateDimensions = function () {
        if (!this._charSizeService.hasValidSize) {
            return;
        }
        this.dimensions.scaledCharWidth = Math.floor(this._charSizeService.width * window.devicePixelRatio);
        this.dimensions.scaledCharHeight = Math.ceil(this._charSizeService.height * window.devicePixelRatio);
        this.dimensions.scaledCellHeight = Math.floor(this.dimensions.scaledCharHeight * this._optionsService.options.lineHeight);
        this.dimensions.scaledCharTop = this._optionsService.options.lineHeight === 1 ? 0 : Math.round((this.dimensions.scaledCellHeight - this.dimensions.scaledCharHeight) / 2);
        this.dimensions.scaledCellWidth = this.dimensions.scaledCharWidth + Math.round(this._optionsService.options.letterSpacing);
        this.dimensions.scaledCharLeft = Math.floor(this._optionsService.options.letterSpacing / 2);
        this.dimensions.scaledCanvasHeight = this._bufferService.rows * this.dimensions.scaledCellHeight;
        this.dimensions.scaledCanvasWidth = this._bufferService.cols * this.dimensions.scaledCellWidth;
        this.dimensions.canvasHeight = Math.round(this.dimensions.scaledCanvasHeight / window.devicePixelRatio);
        this.dimensions.canvasWidth = Math.round(this.dimensions.scaledCanvasWidth / window.devicePixelRatio);
        this.dimensions.actualCellHeight = this.dimensions.canvasHeight / this._bufferService.rows;
        this.dimensions.actualCellWidth = this.dimensions.canvasWidth / this._bufferService.cols;
    };
    Renderer.prototype.registerCharacterJoiner = function (handler) {
        return this._characterJoinerRegistry.registerCharacterJoiner(handler);
    };
    Renderer.prototype.deregisterCharacterJoiner = function (joinerId) {
        return this._characterJoinerRegistry.deregisterCharacterJoiner(joinerId);
    };
    Renderer = __decorate([
        __param(4, Services_2.IBufferService),
        __param(5, Services_1.ICharSizeService),
        __param(6, Services_2.IOptionsService),
        __param(7, Services_2.ICoreService),
        __param(8, Services_1.ICoreBrowserService)
    ], Renderer);
    return Renderer;
}(Lifecycle_1.Disposable));
exports.Renderer = Renderer;


/***/ }),

/***/ "./out/browser/renderer/RendererUtils.js":
/*!***********************************************!*\
  !*** ./out/browser/renderer/RendererUtils.js ***!
  \***********************************************/
/*! flagged exports */
/*! export __esModule [provided] [no usage info] [missing usage info prevents renaming] */
/*! export throwIfFalsy [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_exports__ */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.throwIfFalsy = void 0;
function throwIfFalsy(value) {
    if (!value) {
        throw new Error('value must not be falsy');
    }
    return value;
}
exports.throwIfFalsy = throwIfFalsy;


/***/ }),

/***/ "./out/browser/renderer/SelectionRenderLayer.js":
/*!******************************************************!*\
  !*** ./out/browser/renderer/SelectionRenderLayer.js ***!
  \******************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: top-level-this-exports, __webpack_exports__, __webpack_require__ */
/*! CommonJS bailout: this is used directly at 2:17-21 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SelectionRenderLayer = void 0;
var BaseRenderLayer_1 = __webpack_require__(/*! browser/renderer/BaseRenderLayer */ "./out/browser/renderer/BaseRenderLayer.js");
var SelectionRenderLayer = (function (_super) {
    __extends(SelectionRenderLayer, _super);
    function SelectionRenderLayer(container, zIndex, colors, rendererId, bufferService, optionsService) {
        var _this = _super.call(this, container, 'selection', zIndex, true, colors, rendererId, bufferService, optionsService) || this;
        _this._clearState();
        return _this;
    }
    SelectionRenderLayer.prototype._clearState = function () {
        this._state = {
            start: undefined,
            end: undefined,
            columnSelectMode: undefined,
            ydisp: undefined
        };
    };
    SelectionRenderLayer.prototype.resize = function (dim) {
        _super.prototype.resize.call(this, dim);
        this._clearState();
    };
    SelectionRenderLayer.prototype.reset = function () {
        if (this._state.start && this._state.end) {
            this._clearState();
            this._clearAll();
        }
    };
    SelectionRenderLayer.prototype.onSelectionChanged = function (start, end, columnSelectMode) {
        if (!this._didStateChange(start, end, columnSelectMode, this._bufferService.buffer.ydisp)) {
            return;
        }
        this._clearAll();
        if (!start || !end) {
            this._clearState();
            return;
        }
        var viewportStartRow = start[1] - this._bufferService.buffer.ydisp;
        var viewportEndRow = end[1] - this._bufferService.buffer.ydisp;
        var viewportCappedStartRow = Math.max(viewportStartRow, 0);
        var viewportCappedEndRow = Math.min(viewportEndRow, this._bufferService.rows - 1);
        if (viewportCappedStartRow >= this._bufferService.rows || viewportCappedEndRow < 0) {
            this._state.ydisp = this._bufferService.buffer.ydisp;
            return;
        }
        this._ctx.fillStyle = this._colors.selectionTransparent.css;
        if (columnSelectMode) {
            var startCol = start[0];
            var width = end[0] - startCol;
            var height = viewportCappedEndRow - viewportCappedStartRow + 1;
            this._fillCells(startCol, viewportCappedStartRow, width, height);
        }
        else {
            var startCol = viewportStartRow === viewportCappedStartRow ? start[0] : 0;
            var startRowEndCol = viewportCappedStartRow === viewportEndRow ? end[0] : this._bufferService.cols;
            this._fillCells(startCol, viewportCappedStartRow, startRowEndCol - startCol, 1);
            var middleRowsCount = Math.max(viewportCappedEndRow - viewportCappedStartRow - 1, 0);
            this._fillCells(0, viewportCappedStartRow + 1, this._bufferService.cols, middleRowsCount);
            if (viewportCappedStartRow !== viewportCappedEndRow) {
                var endCol = viewportEndRow === viewportCappedEndRow ? end[0] : this._bufferService.cols;
                this._fillCells(0, viewportCappedEndRow, endCol, 1);
            }
        }
        this._state.start = [start[0], start[1]];
        this._state.end = [end[0], end[1]];
        this._state.columnSelectMode = columnSelectMode;
        this._state.ydisp = this._bufferService.buffer.ydisp;
    };
    SelectionRenderLayer.prototype._didStateChange = function (start, end, columnSelectMode, ydisp) {
        return !this._areCoordinatesEqual(start, this._state.start) ||
            !this._areCoordinatesEqual(end, this._state.end) ||
            columnSelectMode !== this._state.columnSelectMode ||
            ydisp !== this._state.ydisp;
    };
    SelectionRenderLayer.prototype._areCoordinatesEqual = function (coord1, coord2) {
        if (!coord1 || !coord2) {
            return false;
        }
        return coord1[0] === coord2[0] && coord1[1] === coord2[1];
    };
    return SelectionRenderLayer;
}(BaseRenderLayer_1.BaseRenderLayer));
exports.SelectionRenderLayer = SelectionRenderLayer;


/***/ }),

/***/ "./out/browser/renderer/TextRenderLayer.js":
/*!*************************************************!*\
  !*** ./out/browser/renderer/TextRenderLayer.js ***!
  \*************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: top-level-this-exports, __webpack_exports__, __webpack_require__ */
/*! CommonJS bailout: this is used directly at 2:17-21 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TextRenderLayer = void 0;
var GridCache_1 = __webpack_require__(/*! browser/renderer/GridCache */ "./out/browser/renderer/GridCache.js");
var BaseRenderLayer_1 = __webpack_require__(/*! browser/renderer/BaseRenderLayer */ "./out/browser/renderer/BaseRenderLayer.js");
var AttributeData_1 = __webpack_require__(/*! common/buffer/AttributeData */ "./out/common/buffer/AttributeData.js");
var Constants_1 = __webpack_require__(/*! common/buffer/Constants */ "./out/common/buffer/Constants.js");
var CharacterJoinerRegistry_1 = __webpack_require__(/*! browser/renderer/CharacterJoinerRegistry */ "./out/browser/renderer/CharacterJoinerRegistry.js");
var CellData_1 = __webpack_require__(/*! common/buffer/CellData */ "./out/common/buffer/CellData.js");
var TextRenderLayer = (function (_super) {
    __extends(TextRenderLayer, _super);
    function TextRenderLayer(container, zIndex, colors, characterJoinerRegistry, alpha, rendererId, bufferService, optionsService) {
        var _this = _super.call(this, container, 'text', zIndex, alpha, colors, rendererId, bufferService, optionsService) || this;
        _this._characterWidth = 0;
        _this._characterFont = '';
        _this._characterOverlapCache = {};
        _this._workCell = new CellData_1.CellData();
        _this._state = new GridCache_1.GridCache();
        _this._characterJoinerRegistry = characterJoinerRegistry;
        return _this;
    }
    TextRenderLayer.prototype.resize = function (dim) {
        _super.prototype.resize.call(this, dim);
        var terminalFont = this._getFont(false, false);
        if (this._characterWidth !== dim.scaledCharWidth || this._characterFont !== terminalFont) {
            this._characterWidth = dim.scaledCharWidth;
            this._characterFont = terminalFont;
            this._characterOverlapCache = {};
        }
        this._state.clear();
        this._state.resize(this._bufferService.cols, this._bufferService.rows);
    };
    TextRenderLayer.prototype.reset = function () {
        this._state.clear();
        this._clearAll();
    };
    TextRenderLayer.prototype._forEachCell = function (firstRow, lastRow, joinerRegistry, callback) {
        for (var y = firstRow; y <= lastRow; y++) {
            var row = y + this._bufferService.buffer.ydisp;
            var line = this._bufferService.buffer.lines.get(row);
            var joinedRanges = joinerRegistry ? joinerRegistry.getJoinedCharacters(row) : [];
            for (var x = 0; x < this._bufferService.cols; x++) {
                line.loadCell(x, this._workCell);
                var cell = this._workCell;
                var isJoined = false;
                var lastCharX = x;
                if (cell.getWidth() === 0) {
                    continue;
                }
                if (joinedRanges.length > 0 && x === joinedRanges[0][0]) {
                    isJoined = true;
                    var range = joinedRanges.shift();
                    cell = new CharacterJoinerRegistry_1.JoinedCellData(this._workCell, line.translateToString(true, range[0], range[1]), range[1] - range[0]);
                    lastCharX = range[1] - 1;
                }
                if (!isJoined && this._isOverlapping(cell)) {
                    if (lastCharX < line.length - 1 && line.getCodePoint(lastCharX + 1) === Constants_1.NULL_CELL_CODE) {
                        cell.content &= ~12582912;
                        cell.content |= 2 << 22;
                    }
                }
                callback(cell, x, y);
                x = lastCharX;
            }
        }
    };
    TextRenderLayer.prototype._drawBackground = function (firstRow, lastRow) {
        var _this = this;
        var ctx = this._ctx;
        var cols = this._bufferService.cols;
        var startX = 0;
        var startY = 0;
        var prevFillStyle = null;
        ctx.save();
        this._forEachCell(firstRow, lastRow, null, function (cell, x, y) {
            var nextFillStyle = null;
            if (cell.isInverse()) {
                if (cell.isFgDefault()) {
                    nextFillStyle = _this._colors.foreground.css;
                }
                else if (cell.isFgRGB()) {
                    nextFillStyle = "rgb(" + AttributeData_1.AttributeData.toColorRGB(cell.getFgColor()).join(',') + ")";
                }
                else {
                    nextFillStyle = _this._colors.ansi[cell.getFgColor()].css;
                }
            }
            else if (cell.isBgRGB()) {
                nextFillStyle = "rgb(" + AttributeData_1.AttributeData.toColorRGB(cell.getBgColor()).join(',') + ")";
            }
            else if (cell.isBgPalette()) {
                nextFillStyle = _this._colors.ansi[cell.getBgColor()].css;
            }
            if (prevFillStyle === null) {
                startX = x;
                startY = y;
            }
            if (y !== startY) {
                ctx.fillStyle = prevFillStyle || '';
                _this._fillCells(startX, startY, cols - startX, 1);
                startX = x;
                startY = y;
            }
            else if (prevFillStyle !== nextFillStyle) {
                ctx.fillStyle = prevFillStyle || '';
                _this._fillCells(startX, startY, x - startX, 1);
                startX = x;
                startY = y;
            }
            prevFillStyle = nextFillStyle;
        });
        if (prevFillStyle !== null) {
            ctx.fillStyle = prevFillStyle;
            this._fillCells(startX, startY, cols - startX, 1);
        }
        ctx.restore();
    };
    TextRenderLayer.prototype._drawForeground = function (firstRow, lastRow) {
        var _this = this;
        this._forEachCell(firstRow, lastRow, this._characterJoinerRegistry, function (cell, x, y) {
            if (cell.isInvisible()) {
                return;
            }
            _this._drawChars(cell, x, y);
            if (cell.isUnderline()) {
                _this._ctx.save();
                if (cell.isInverse()) {
                    if (cell.isBgDefault()) {
                        _this._ctx.fillStyle = _this._colors.background.css;
                    }
                    else if (cell.isBgRGB()) {
                        _this._ctx.fillStyle = "rgb(" + AttributeData_1.AttributeData.toColorRGB(cell.getBgColor()).join(',') + ")";
                    }
                    else {
                        var bg = cell.getBgColor();
                        if (_this._optionsService.options.drawBoldTextInBrightColors && cell.isBold() && bg < 8) {
                            bg += 8;
                        }
                        _this._ctx.fillStyle = _this._colors.ansi[bg].css;
                    }
                }
                else {
                    if (cell.isFgDefault()) {
                        _this._ctx.fillStyle = _this._colors.foreground.css;
                    }
                    else if (cell.isFgRGB()) {
                        _this._ctx.fillStyle = "rgb(" + AttributeData_1.AttributeData.toColorRGB(cell.getFgColor()).join(',') + ")";
                    }
                    else {
                        var fg = cell.getFgColor();
                        if (_this._optionsService.options.drawBoldTextInBrightColors && cell.isBold() && fg < 8) {
                            fg += 8;
                        }
                        _this._ctx.fillStyle = _this._colors.ansi[fg].css;
                    }
                }
                _this._fillBottomLineAtCells(x, y, cell.getWidth());
                _this._ctx.restore();
            }
        });
    };
    TextRenderLayer.prototype.onGridChanged = function (firstRow, lastRow) {
        if (this._state.cache.length === 0) {
            return;
        }
        if (this._charAtlas) {
            this._charAtlas.beginFrame();
        }
        this._clearCells(0, firstRow, this._bufferService.cols, lastRow - firstRow + 1);
        this._drawBackground(firstRow, lastRow);
        this._drawForeground(firstRow, lastRow);
    };
    TextRenderLayer.prototype.onOptionsChanged = function () {
        this._setTransparency(this._optionsService.options.allowTransparency);
    };
    TextRenderLayer.prototype._isOverlapping = function (cell) {
        if (cell.getWidth() !== 1) {
            return false;
        }
        if (cell.getCode() < 256) {
            return false;
        }
        var chars = cell.getChars();
        if (this._characterOverlapCache.hasOwnProperty(chars)) {
            return this._characterOverlapCache[chars];
        }
        this._ctx.save();
        this._ctx.font = this._characterFont;
        var overlaps = Math.floor(this._ctx.measureText(chars).width) > this._characterWidth;
        this._ctx.restore();
        this._characterOverlapCache[chars] = overlaps;
        return overlaps;
    };
    return TextRenderLayer;
}(BaseRenderLayer_1.BaseRenderLayer));
exports.TextRenderLayer = TextRenderLayer;


/***/ }),

/***/ "./out/browser/renderer/atlas/BaseCharAtlas.js":
/*!*****************************************************!*\
  !*** ./out/browser/renderer/atlas/BaseCharAtlas.js ***!
  \*****************************************************/
/*! flagged exports */
/*! export BaseCharAtlas [provided] [no usage info] [missing usage info prevents renaming] */
/*! export __esModule [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_exports__ */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BaseCharAtlas = void 0;
var BaseCharAtlas = (function () {
    function BaseCharAtlas() {
        this._didWarmUp = false;
    }
    BaseCharAtlas.prototype.dispose = function () { };
    BaseCharAtlas.prototype.warmUp = function () {
        if (!this._didWarmUp) {
            this._doWarmUp();
            this._didWarmUp = true;
        }
    };
    BaseCharAtlas.prototype._doWarmUp = function () { };
    BaseCharAtlas.prototype.beginFrame = function () { };
    return BaseCharAtlas;
}());
exports.BaseCharAtlas = BaseCharAtlas;


/***/ }),

/***/ "./out/browser/renderer/atlas/CharAtlasCache.js":
/*!******************************************************!*\
  !*** ./out/browser/renderer/atlas/CharAtlasCache.js ***!
  \******************************************************/
/*! flagged exports */
/*! export __esModule [provided] [no usage info] [missing usage info prevents renaming] */
/*! export acquireCharAtlas [provided] [no usage info] [missing usage info prevents renaming] */
/*! export removeTerminalFromCache [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_exports__, __webpack_require__ */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.removeTerminalFromCache = exports.acquireCharAtlas = void 0;
var CharAtlasUtils_1 = __webpack_require__(/*! browser/renderer/atlas/CharAtlasUtils */ "./out/browser/renderer/atlas/CharAtlasUtils.js");
var DynamicCharAtlas_1 = __webpack_require__(/*! browser/renderer/atlas/DynamicCharAtlas */ "./out/browser/renderer/atlas/DynamicCharAtlas.js");
var charAtlasCache = [];
function acquireCharAtlas(options, rendererId, colors, scaledCharWidth, scaledCharHeight) {
    var newConfig = CharAtlasUtils_1.generateConfig(scaledCharWidth, scaledCharHeight, options, colors);
    for (var i = 0; i < charAtlasCache.length; i++) {
        var entry = charAtlasCache[i];
        var ownedByIndex = entry.ownedBy.indexOf(rendererId);
        if (ownedByIndex >= 0) {
            if (CharAtlasUtils_1.configEquals(entry.config, newConfig)) {
                return entry.atlas;
            }
            if (entry.ownedBy.length === 1) {
                entry.atlas.dispose();
                charAtlasCache.splice(i, 1);
            }
            else {
                entry.ownedBy.splice(ownedByIndex, 1);
            }
            break;
        }
    }
    for (var i = 0; i < charAtlasCache.length; i++) {
        var entry = charAtlasCache[i];
        if (CharAtlasUtils_1.configEquals(entry.config, newConfig)) {
            entry.ownedBy.push(rendererId);
            return entry.atlas;
        }
    }
    var newEntry = {
        atlas: new DynamicCharAtlas_1.DynamicCharAtlas(document, newConfig),
        config: newConfig,
        ownedBy: [rendererId]
    };
    charAtlasCache.push(newEntry);
    return newEntry.atlas;
}
exports.acquireCharAtlas = acquireCharAtlas;
function removeTerminalFromCache(rendererId) {
    for (var i = 0; i < charAtlasCache.length; i++) {
        var index = charAtlasCache[i].ownedBy.indexOf(rendererId);
        if (index !== -1) {
            if (charAtlasCache[i].ownedBy.length === 1) {
                charAtlasCache[i].atlas.dispose();
                charAtlasCache.splice(i, 1);
            }
            else {
                charAtlasCache[i].ownedBy.splice(index, 1);
            }
            break;
        }
    }
}
exports.removeTerminalFromCache = removeTerminalFromCache;


/***/ }),

/***/ "./out/browser/renderer/atlas/CharAtlasUtils.js":
/*!******************************************************!*\
  !*** ./out/browser/renderer/atlas/CharAtlasUtils.js ***!
  \******************************************************/
/*! flagged exports */
/*! export __esModule [provided] [no usage info] [missing usage info prevents renaming] */
/*! export configEquals [provided] [no usage info] [missing usage info prevents renaming] */
/*! export generateConfig [provided] [no usage info] [missing usage info prevents renaming] */
/*! export is256Color [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_exports__, __webpack_require__ */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.is256Color = exports.configEquals = exports.generateConfig = void 0;
var Constants_1 = __webpack_require__(/*! common/buffer/Constants */ "./out/common/buffer/Constants.js");
function generateConfig(scaledCharWidth, scaledCharHeight, options, colors) {
    var clonedColors = {
        foreground: colors.foreground,
        background: colors.background,
        cursor: undefined,
        cursorAccent: undefined,
        selection: undefined,
        ansi: colors.ansi
    };
    return {
        devicePixelRatio: window.devicePixelRatio,
        scaledCharWidth: scaledCharWidth,
        scaledCharHeight: scaledCharHeight,
        fontFamily: options.fontFamily,
        fontSize: options.fontSize,
        fontWeight: options.fontWeight,
        fontWeightBold: options.fontWeightBold,
        allowTransparency: options.allowTransparency,
        colors: clonedColors
    };
}
exports.generateConfig = generateConfig;
function configEquals(a, b) {
    for (var i = 0; i < a.colors.ansi.length; i++) {
        if (a.colors.ansi[i].rgba !== b.colors.ansi[i].rgba) {
            return false;
        }
    }
    return a.devicePixelRatio === b.devicePixelRatio &&
        a.fontFamily === b.fontFamily &&
        a.fontSize === b.fontSize &&
        a.fontWeight === b.fontWeight &&
        a.fontWeightBold === b.fontWeightBold &&
        a.allowTransparency === b.allowTransparency &&
        a.scaledCharWidth === b.scaledCharWidth &&
        a.scaledCharHeight === b.scaledCharHeight &&
        a.colors.foreground === b.colors.foreground &&
        a.colors.background === b.colors.background;
}
exports.configEquals = configEquals;
function is256Color(colorCode) {
    return colorCode < Constants_1.DEFAULT_COLOR;
}
exports.is256Color = is256Color;


/***/ }),

/***/ "./out/browser/renderer/atlas/Constants.js":
/*!*************************************************!*\
  !*** ./out/browser/renderer/atlas/Constants.js ***!
  \*************************************************/
/*! flagged exports */
/*! export CHAR_ATLAS_CELL_SPACING [provided] [no usage info] [missing usage info prevents renaming] */
/*! export DIM_OPACITY [provided] [no usage info] [missing usage info prevents renaming] */
/*! export INVERTED_DEFAULT_COLOR [provided] [no usage info] [missing usage info prevents renaming] */
/*! export __esModule [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_exports__ */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CHAR_ATLAS_CELL_SPACING = exports.DIM_OPACITY = exports.INVERTED_DEFAULT_COLOR = void 0;
exports.INVERTED_DEFAULT_COLOR = 257;
exports.DIM_OPACITY = 0.5;
exports.CHAR_ATLAS_CELL_SPACING = 1;


/***/ }),

/***/ "./out/browser/renderer/atlas/DynamicCharAtlas.js":
/*!********************************************************!*\
  !*** ./out/browser/renderer/atlas/DynamicCharAtlas.js ***!
  \********************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: top-level-this-exports, __webpack_exports__, __webpack_require__ */
/*! CommonJS bailout: this is used directly at 2:17-21 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.NoneCharAtlas = exports.DynamicCharAtlas = exports.getGlyphCacheKey = void 0;
var Constants_1 = __webpack_require__(/*! browser/renderer/atlas/Constants */ "./out/browser/renderer/atlas/Constants.js");
var BaseCharAtlas_1 = __webpack_require__(/*! browser/renderer/atlas/BaseCharAtlas */ "./out/browser/renderer/atlas/BaseCharAtlas.js");
var ColorManager_1 = __webpack_require__(/*! browser/ColorManager */ "./out/browser/ColorManager.js");
var LRUMap_1 = __webpack_require__(/*! browser/renderer/atlas/LRUMap */ "./out/browser/renderer/atlas/LRUMap.js");
var Platform_1 = __webpack_require__(/*! common/Platform */ "./out/common/Platform.js");
var RendererUtils_1 = __webpack_require__(/*! browser/renderer/RendererUtils */ "./out/browser/renderer/RendererUtils.js");
var Color_1 = __webpack_require__(/*! browser/Color */ "./out/browser/Color.js");
var TEXTURE_WIDTH = 1024;
var TEXTURE_HEIGHT = 1024;
var TRANSPARENT_COLOR = {
    css: 'rgba(0, 0, 0, 0)',
    rgba: 0
};
var FRAME_CACHE_DRAW_LIMIT = 100;
var GLYPH_BITMAP_COMMIT_DELAY = 100;
function getGlyphCacheKey(glyph) {
    return glyph.code << 21 | glyph.bg << 12 | glyph.fg << 3 | (glyph.bold ? 0 : 4) + (glyph.dim ? 0 : 2) + (glyph.italic ? 0 : 1);
}
exports.getGlyphCacheKey = getGlyphCacheKey;
var DynamicCharAtlas = (function (_super) {
    __extends(DynamicCharAtlas, _super);
    function DynamicCharAtlas(document, _config) {
        var _this = _super.call(this) || this;
        _this._config = _config;
        _this._drawToCacheCount = 0;
        _this._glyphsWaitingOnBitmap = [];
        _this._bitmapCommitTimeout = null;
        _this._bitmap = null;
        _this._cacheCanvas = document.createElement('canvas');
        _this._cacheCanvas.width = TEXTURE_WIDTH;
        _this._cacheCanvas.height = TEXTURE_HEIGHT;
        _this._cacheCtx = RendererUtils_1.throwIfFalsy(_this._cacheCanvas.getContext('2d', { alpha: true }));
        var tmpCanvas = document.createElement('canvas');
        tmpCanvas.width = _this._config.scaledCharWidth;
        tmpCanvas.height = _this._config.scaledCharHeight;
        _this._tmpCtx = RendererUtils_1.throwIfFalsy(tmpCanvas.getContext('2d', { alpha: _this._config.allowTransparency }));
        _this._width = Math.floor(TEXTURE_WIDTH / _this._config.scaledCharWidth);
        _this._height = Math.floor(TEXTURE_HEIGHT / _this._config.scaledCharHeight);
        var capacity = _this._width * _this._height;
        _this._cacheMap = new LRUMap_1.LRUMap(capacity);
        _this._cacheMap.prealloc(capacity);
        return _this;
    }
    DynamicCharAtlas.prototype.dispose = function () {
        if (this._bitmapCommitTimeout !== null) {
            window.clearTimeout(this._bitmapCommitTimeout);
            this._bitmapCommitTimeout = null;
        }
    };
    DynamicCharAtlas.prototype.beginFrame = function () {
        this._drawToCacheCount = 0;
    };
    DynamicCharAtlas.prototype.draw = function (ctx, glyph, x, y) {
        if (glyph.code === 32) {
            return true;
        }
        if (!this._canCache(glyph)) {
            return false;
        }
        var glyphKey = getGlyphCacheKey(glyph);
        var cacheValue = this._cacheMap.get(glyphKey);
        if (cacheValue !== null && cacheValue !== undefined) {
            this._drawFromCache(ctx, cacheValue, x, y);
            return true;
        }
        if (this._drawToCacheCount < FRAME_CACHE_DRAW_LIMIT) {
            var index = void 0;
            if (this._cacheMap.size < this._cacheMap.capacity) {
                index = this._cacheMap.size;
            }
            else {
                index = this._cacheMap.peek().index;
            }
            var cacheValue_1 = this._drawToCache(glyph, index);
            this._cacheMap.set(glyphKey, cacheValue_1);
            this._drawFromCache(ctx, cacheValue_1, x, y);
            return true;
        }
        return false;
    };
    DynamicCharAtlas.prototype._canCache = function (glyph) {
        return glyph.code < 256;
    };
    DynamicCharAtlas.prototype._toCoordinateX = function (index) {
        return (index % this._width) * this._config.scaledCharWidth;
    };
    DynamicCharAtlas.prototype._toCoordinateY = function (index) {
        return Math.floor(index / this._width) * this._config.scaledCharHeight;
    };
    DynamicCharAtlas.prototype._drawFromCache = function (ctx, cacheValue, x, y) {
        if (cacheValue.isEmpty) {
            return;
        }
        var cacheX = this._toCoordinateX(cacheValue.index);
        var cacheY = this._toCoordinateY(cacheValue.index);
        ctx.drawImage(cacheValue.inBitmap ? this._bitmap : this._cacheCanvas, cacheX, cacheY, this._config.scaledCharWidth, this._config.scaledCharHeight, x, y, this._config.scaledCharWidth, this._config.scaledCharHeight);
    };
    DynamicCharAtlas.prototype._getColorFromAnsiIndex = function (idx) {
        if (idx < this._config.colors.ansi.length) {
            return this._config.colors.ansi[idx];
        }
        return ColorManager_1.DEFAULT_ANSI_COLORS[idx];
    };
    DynamicCharAtlas.prototype._getBackgroundColor = function (glyph) {
        if (this._config.allowTransparency) {
            return TRANSPARENT_COLOR;
        }
        if (glyph.bg === Constants_1.INVERTED_DEFAULT_COLOR) {
            return this._config.colors.foreground;
        }
        if (glyph.bg < 256) {
            return this._getColorFromAnsiIndex(glyph.bg);
        }
        return this._config.colors.background;
    };
    DynamicCharAtlas.prototype._getForegroundColor = function (glyph) {
        if (glyph.fg === Constants_1.INVERTED_DEFAULT_COLOR) {
            return Color_1.color.opaque(this._config.colors.background);
        }
        if (glyph.fg < 256) {
            return this._getColorFromAnsiIndex(glyph.fg);
        }
        return this._config.colors.foreground;
    };
    DynamicCharAtlas.prototype._drawToCache = function (glyph, index) {
        this._drawToCacheCount++;
        this._tmpCtx.save();
        var backgroundColor = this._getBackgroundColor(glyph);
        this._tmpCtx.globalCompositeOperation = 'copy';
        this._tmpCtx.fillStyle = backgroundColor.css;
        this._tmpCtx.fillRect(0, 0, this._config.scaledCharWidth, this._config.scaledCharHeight);
        this._tmpCtx.globalCompositeOperation = 'source-over';
        var fontWeight = glyph.bold ? this._config.fontWeightBold : this._config.fontWeight;
        var fontStyle = glyph.italic ? 'italic' : '';
        this._tmpCtx.font =
            fontStyle + " " + fontWeight + " " + this._config.fontSize * this._config.devicePixelRatio + "px " + this._config.fontFamily;
        this._tmpCtx.textBaseline = 'middle';
        this._tmpCtx.fillStyle = this._getForegroundColor(glyph).css;
        if (glyph.dim) {
            this._tmpCtx.globalAlpha = Constants_1.DIM_OPACITY;
        }
        this._tmpCtx.fillText(glyph.chars, 0, this._config.scaledCharHeight / 2);
        this._tmpCtx.restore();
        var imageData = this._tmpCtx.getImageData(0, 0, this._config.scaledCharWidth, this._config.scaledCharHeight);
        var isEmpty = false;
        if (!this._config.allowTransparency) {
            isEmpty = clearColor(imageData, backgroundColor);
        }
        var x = this._toCoordinateX(index);
        var y = this._toCoordinateY(index);
        this._cacheCtx.putImageData(imageData, x, y);
        var cacheValue = {
            index: index,
            isEmpty: isEmpty,
            inBitmap: false
        };
        this._addGlyphToBitmap(cacheValue);
        return cacheValue;
    };
    DynamicCharAtlas.prototype._addGlyphToBitmap = function (cacheValue) {
        var _this = this;
        if (!('createImageBitmap' in window) || Platform_1.isFirefox || Platform_1.isSafari) {
            return;
        }
        this._glyphsWaitingOnBitmap.push(cacheValue);
        if (this._bitmapCommitTimeout !== null) {
            return;
        }
        this._bitmapCommitTimeout = window.setTimeout(function () { return _this._generateBitmap(); }, GLYPH_BITMAP_COMMIT_DELAY);
    };
    DynamicCharAtlas.prototype._generateBitmap = function () {
        var _this = this;
        var glyphsMovingToBitmap = this._glyphsWaitingOnBitmap;
        this._glyphsWaitingOnBitmap = [];
        window.createImageBitmap(this._cacheCanvas).then(function (bitmap) {
            _this._bitmap = bitmap;
            for (var i = 0; i < glyphsMovingToBitmap.length; i++) {
                var value = glyphsMovingToBitmap[i];
                value.inBitmap = true;
            }
        });
        this._bitmapCommitTimeout = null;
    };
    return DynamicCharAtlas;
}(BaseCharAtlas_1.BaseCharAtlas));
exports.DynamicCharAtlas = DynamicCharAtlas;
var NoneCharAtlas = (function (_super) {
    __extends(NoneCharAtlas, _super);
    function NoneCharAtlas(document, config) {
        return _super.call(this) || this;
    }
    NoneCharAtlas.prototype.draw = function (ctx, glyph, x, y) {
        return false;
    };
    return NoneCharAtlas;
}(BaseCharAtlas_1.BaseCharAtlas));
exports.NoneCharAtlas = NoneCharAtlas;
function clearColor(imageData, color) {
    var isEmpty = true;
    var r = color.rgba >>> 24;
    var g = color.rgba >>> 16 & 0xFF;
    var b = color.rgba >>> 8 & 0xFF;
    for (var offset = 0; offset < imageData.data.length; offset += 4) {
        if (imageData.data[offset] === r &&
            imageData.data[offset + 1] === g &&
            imageData.data[offset + 2] === b) {
            imageData.data[offset + 3] = 0;
        }
        else {
            isEmpty = false;
        }
    }
    return isEmpty;
}


/***/ }),

/***/ "./out/browser/renderer/atlas/LRUMap.js":
/*!**********************************************!*\
  !*** ./out/browser/renderer/atlas/LRUMap.js ***!
  \**********************************************/
/*! flagged exports */
/*! export LRUMap [provided] [no usage info] [missing usage info prevents renaming] */
/*! export __esModule [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_exports__ */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LRUMap = void 0;
var LRUMap = (function () {
    function LRUMap(capacity) {
        this.capacity = capacity;
        this._map = {};
        this._head = null;
        this._tail = null;
        this._nodePool = [];
        this.size = 0;
    }
    LRUMap.prototype._unlinkNode = function (node) {
        var prev = node.prev;
        var next = node.next;
        if (node === this._head) {
            this._head = next;
        }
        if (node === this._tail) {
            this._tail = prev;
        }
        if (prev !== null) {
            prev.next = next;
        }
        if (next !== null) {
            next.prev = prev;
        }
    };
    LRUMap.prototype._appendNode = function (node) {
        var tail = this._tail;
        if (tail !== null) {
            tail.next = node;
        }
        node.prev = tail;
        node.next = null;
        this._tail = node;
        if (this._head === null) {
            this._head = node;
        }
    };
    LRUMap.prototype.prealloc = function (count) {
        var nodePool = this._nodePool;
        for (var i = 0; i < count; i++) {
            nodePool.push({
                prev: null,
                next: null,
                key: null,
                value: null
            });
        }
    };
    LRUMap.prototype.get = function (key) {
        var node = this._map[key];
        if (node !== undefined) {
            this._unlinkNode(node);
            this._appendNode(node);
            return node.value;
        }
        return null;
    };
    LRUMap.prototype.peekValue = function (key) {
        var node = this._map[key];
        if (node !== undefined) {
            return node.value;
        }
        return null;
    };
    LRUMap.prototype.peek = function () {
        var head = this._head;
        return head === null ? null : head.value;
    };
    LRUMap.prototype.set = function (key, value) {
        var node = this._map[key];
        if (node !== undefined) {
            node = this._map[key];
            this._unlinkNode(node);
            node.value = value;
        }
        else if (this.size >= this.capacity) {
            node = this._head;
            this._unlinkNode(node);
            delete this._map[node.key];
            node.key = key;
            node.value = value;
            this._map[key] = node;
        }
        else {
            var nodePool = this._nodePool;
            if (nodePool.length > 0) {
                node = nodePool.pop();
                node.key = key;
                node.value = value;
            }
            else {
                node = {
                    prev: null,
                    next: null,
                    key: key,
                    value: value
                };
            }
            this._map[key] = node;
            this.size++;
        }
        this._appendNode(node);
    };
    return LRUMap;
}());
exports.LRUMap = LRUMap;


/***/ }),

/***/ "./out/browser/renderer/dom/DomRenderer.js":
/*!*************************************************!*\
  !*** ./out/browser/renderer/dom/DomRenderer.js ***!
  \*************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: top-level-this-exports, __webpack_exports__, __webpack_require__ */
/*! CommonJS bailout: this is used directly at 2:17-21 */
/*! CommonJS bailout: this is used directly at 15:18-22 */
/*! CommonJS bailout: this is used directly at 21:15-19 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DomRenderer = void 0;
var DomRendererRowFactory_1 = __webpack_require__(/*! browser/renderer/dom/DomRendererRowFactory */ "./out/browser/renderer/dom/DomRendererRowFactory.js");
var Constants_1 = __webpack_require__(/*! browser/renderer/atlas/Constants */ "./out/browser/renderer/atlas/Constants.js");
var Lifecycle_1 = __webpack_require__(/*! common/Lifecycle */ "./out/common/Lifecycle.js");
var Services_1 = __webpack_require__(/*! browser/services/Services */ "./out/browser/services/Services.js");
var Services_2 = __webpack_require__(/*! common/services/Services */ "./out/common/services/Services.js");
var EventEmitter_1 = __webpack_require__(/*! common/EventEmitter */ "./out/common/EventEmitter.js");
var Color_1 = __webpack_require__(/*! browser/Color */ "./out/browser/Color.js");
var Dom_1 = __webpack_require__(/*! browser/Dom */ "./out/browser/Dom.js");
var TERMINAL_CLASS_PREFIX = 'xterm-dom-renderer-owner-';
var ROW_CONTAINER_CLASS = 'xterm-rows';
var FG_CLASS_PREFIX = 'xterm-fg-';
var BG_CLASS_PREFIX = 'xterm-bg-';
var FOCUS_CLASS = 'xterm-focus';
var SELECTION_CLASS = 'xterm-selection';
var nextTerminalId = 1;
var DomRenderer = (function (_super) {
    __extends(DomRenderer, _super);
    function DomRenderer(_colors, _element, _screenElement, _viewportElement, _linkifier, _linkifier2, _charSizeService, _optionsService, _bufferService) {
        var _this = _super.call(this) || this;
        _this._colors = _colors;
        _this._element = _element;
        _this._screenElement = _screenElement;
        _this._viewportElement = _viewportElement;
        _this._linkifier = _linkifier;
        _this._linkifier2 = _linkifier2;
        _this._charSizeService = _charSizeService;
        _this._optionsService = _optionsService;
        _this._bufferService = _bufferService;
        _this._terminalClass = nextTerminalId++;
        _this._rowElements = [];
        _this._rowContainer = document.createElement('div');
        _this._rowContainer.classList.add(ROW_CONTAINER_CLASS);
        _this._rowContainer.style.lineHeight = 'normal';
        _this._rowContainer.setAttribute('aria-hidden', 'true');
        _this._refreshRowElements(_this._bufferService.cols, _this._bufferService.rows);
        _this._selectionContainer = document.createElement('div');
        _this._selectionContainer.classList.add(SELECTION_CLASS);
        _this._selectionContainer.setAttribute('aria-hidden', 'true');
        _this.dimensions = {
            scaledCharWidth: 0,
            scaledCharHeight: 0,
            scaledCellWidth: 0,
            scaledCellHeight: 0,
            scaledCharLeft: 0,
            scaledCharTop: 0,
            scaledCanvasWidth: 0,
            scaledCanvasHeight: 0,
            canvasWidth: 0,
            canvasHeight: 0,
            actualCellWidth: 0,
            actualCellHeight: 0
        };
        _this._updateDimensions();
        _this._injectCss();
        _this._rowFactory = new DomRendererRowFactory_1.DomRendererRowFactory(document, _this._optionsService, _this._colors);
        _this._element.classList.add(TERMINAL_CLASS_PREFIX + _this._terminalClass);
        _this._screenElement.appendChild(_this._rowContainer);
        _this._screenElement.appendChild(_this._selectionContainer);
        _this._linkifier.onShowLinkUnderline(function (e) { return _this._onLinkHover(e); });
        _this._linkifier.onHideLinkUnderline(function (e) { return _this._onLinkLeave(e); });
        _this._linkifier2.onShowLinkUnderline(function (e) { return _this._onLinkHover(e); });
        _this._linkifier2.onHideLinkUnderline(function (e) { return _this._onLinkLeave(e); });
        return _this;
    }
    Object.defineProperty(DomRenderer.prototype, "onRequestRedraw", {
        get: function () { return new EventEmitter_1.EventEmitter().event; },
        enumerable: false,
        configurable: true
    });
    DomRenderer.prototype.dispose = function () {
        this._element.classList.remove(TERMINAL_CLASS_PREFIX + this._terminalClass);
        Dom_1.removeElementFromParent(this._rowContainer, this._selectionContainer, this._themeStyleElement, this._dimensionsStyleElement);
        _super.prototype.dispose.call(this);
    };
    DomRenderer.prototype._updateDimensions = function () {
        this.dimensions.scaledCharWidth = this._charSizeService.width * window.devicePixelRatio;
        this.dimensions.scaledCharHeight = Math.ceil(this._charSizeService.height * window.devicePixelRatio);
        this.dimensions.scaledCellWidth = this.dimensions.scaledCharWidth + Math.round(this._optionsService.options.letterSpacing);
        this.dimensions.scaledCellHeight = Math.floor(this.dimensions.scaledCharHeight * this._optionsService.options.lineHeight);
        this.dimensions.scaledCharLeft = 0;
        this.dimensions.scaledCharTop = 0;
        this.dimensions.scaledCanvasWidth = this.dimensions.scaledCellWidth * this._bufferService.cols;
        this.dimensions.scaledCanvasHeight = this.dimensions.scaledCellHeight * this._bufferService.rows;
        this.dimensions.canvasWidth = Math.round(this.dimensions.scaledCanvasWidth / window.devicePixelRatio);
        this.dimensions.canvasHeight = Math.round(this.dimensions.scaledCanvasHeight / window.devicePixelRatio);
        this.dimensions.actualCellWidth = this.dimensions.canvasWidth / this._bufferService.cols;
        this.dimensions.actualCellHeight = this.dimensions.canvasHeight / this._bufferService.rows;
        for (var _i = 0, _a = this._rowElements; _i < _a.length; _i++) {
            var element = _a[_i];
            element.style.width = this.dimensions.canvasWidth + "px";
            element.style.height = this.dimensions.actualCellHeight + "px";
            element.style.lineHeight = this.dimensions.actualCellHeight + "px";
            element.style.overflow = 'hidden';
        }
        if (!this._dimensionsStyleElement) {
            this._dimensionsStyleElement = document.createElement('style');
            this._screenElement.appendChild(this._dimensionsStyleElement);
        }
        var styles = this._terminalSelector + " ." + ROW_CONTAINER_CLASS + " span {" +
            " display: inline-block;" +
            " height: 100%;" +
            " vertical-align: top;" +
            (" width: " + this.dimensions.actualCellWidth + "px") +
            "}";
        this._dimensionsStyleElement.textContent = styles;
        this._selectionContainer.style.height = this._viewportElement.style.height;
        this._screenElement.style.width = this.dimensions.canvasWidth + "px";
        this._screenElement.style.height = this.dimensions.canvasHeight + "px";
    };
    DomRenderer.prototype.setColors = function (colors) {
        this._colors = colors;
        this._injectCss();
    };
    DomRenderer.prototype._injectCss = function () {
        var _this = this;
        if (!this._themeStyleElement) {
            this._themeStyleElement = document.createElement('style');
            this._screenElement.appendChild(this._themeStyleElement);
        }
        var styles = this._terminalSelector + " ." + ROW_CONTAINER_CLASS + " {" +
            (" color: " + this._colors.foreground.css + ";") +
            (" font-family: " + this._optionsService.options.fontFamily + ";") +
            (" font-size: " + this._optionsService.options.fontSize + "px;") +
            "}";
        styles +=
            this._terminalSelector + " span:not(." + DomRendererRowFactory_1.BOLD_CLASS + ") {" +
                (" font-weight: " + this._optionsService.options.fontWeight + ";") +
                "}" +
                (this._terminalSelector + " span." + DomRendererRowFactory_1.BOLD_CLASS + " {") +
                (" font-weight: " + this._optionsService.options.fontWeightBold + ";") +
                "}" +
                (this._terminalSelector + " span." + DomRendererRowFactory_1.ITALIC_CLASS + " {") +
                " font-style: italic;" +
                "}";
        styles +=
            "@keyframes blink_box_shadow" + "_" + this._terminalClass + " {" +
                " 50% {" +
                "  box-shadow: none;" +
                " }" +
                "}";
        styles +=
            "@keyframes blink_block" + "_" + this._terminalClass + " {" +
                " 0% {" +
                ("  background-color: " + this._colors.cursor.css + ";") +
                ("  color: " + this._colors.cursorAccent.css + ";") +
                " }" +
                " 50% {" +
                ("  background-color: " + this._colors.cursorAccent.css + ";") +
                ("  color: " + this._colors.cursor.css + ";") +
                " }" +
                "}";
        styles +=
            this._terminalSelector + " ." + ROW_CONTAINER_CLASS + ":not(." + FOCUS_CLASS + ") ." + DomRendererRowFactory_1.CURSOR_CLASS + "." + DomRendererRowFactory_1.CURSOR_STYLE_BLOCK_CLASS + " {" +
                (" outline: 1px solid " + this._colors.cursor.css + ";") +
                " outline-offset: -1px;" +
                "}" +
                (this._terminalSelector + " ." + ROW_CONTAINER_CLASS + "." + FOCUS_CLASS + " ." + DomRendererRowFactory_1.CURSOR_CLASS + "." + DomRendererRowFactory_1.CURSOR_BLINK_CLASS + ":not(." + DomRendererRowFactory_1.CURSOR_STYLE_BLOCK_CLASS + ") {") +
                " animation: blink_box_shadow" + "_" + this._terminalClass + " 1s step-end infinite;" +
                "}" +
                (this._terminalSelector + " ." + ROW_CONTAINER_CLASS + "." + FOCUS_CLASS + " ." + DomRendererRowFactory_1.CURSOR_CLASS + "." + DomRendererRowFactory_1.CURSOR_BLINK_CLASS + "." + DomRendererRowFactory_1.CURSOR_STYLE_BLOCK_CLASS + " {") +
                " animation: blink_block" + "_" + this._terminalClass + " 1s step-end infinite;" +
                "}" +
                (this._terminalSelector + " ." + ROW_CONTAINER_CLASS + "." + FOCUS_CLASS + " ." + DomRendererRowFactory_1.CURSOR_CLASS + "." + DomRendererRowFactory_1.CURSOR_STYLE_BLOCK_CLASS + " {") +
                (" background-color: " + this._colors.cursor.css + ";") +
                (" color: " + this._colors.cursorAccent.css + ";") +
                "}" +
                (this._terminalSelector + " ." + ROW_CONTAINER_CLASS + " ." + DomRendererRowFactory_1.CURSOR_CLASS + "." + DomRendererRowFactory_1.CURSOR_STYLE_BAR_CLASS + " {") +
                (" box-shadow: " + this._optionsService.options.cursorWidth + "px 0 0 " + this._colors.cursor.css + " inset;") +
                "}" +
                (this._terminalSelector + " ." + ROW_CONTAINER_CLASS + " ." + DomRendererRowFactory_1.CURSOR_CLASS + "." + DomRendererRowFactory_1.CURSOR_STYLE_UNDERLINE_CLASS + " {") +
                (" box-shadow: 0 -1px 0 " + this._colors.cursor.css + " inset;") +
                "}";
        styles +=
            this._terminalSelector + " ." + SELECTION_CLASS + " {" +
                " position: absolute;" +
                " top: 0;" +
                " left: 0;" +
                " z-index: 1;" +
                " pointer-events: none;" +
                "}" +
                (this._terminalSelector + " ." + SELECTION_CLASS + " div {") +
                " position: absolute;" +
                (" background-color: " + this._colors.selectionTransparent.css + ";") +
                "}";
        this._colors.ansi.forEach(function (c, i) {
            styles +=
                _this._terminalSelector + " ." + FG_CLASS_PREFIX + i + " { color: " + c.css + "; }" +
                    (_this._terminalSelector + " ." + BG_CLASS_PREFIX + i + " { background-color: " + c.css + "; }");
        });
        styles +=
            this._terminalSelector + " ." + FG_CLASS_PREFIX + Constants_1.INVERTED_DEFAULT_COLOR + " { color: " + Color_1.color.opaque(this._colors.background).css + "; }" +
                (this._terminalSelector + " ." + BG_CLASS_PREFIX + Constants_1.INVERTED_DEFAULT_COLOR + " { background-color: " + this._colors.foreground.css + "; }");
        this._themeStyleElement.textContent = styles;
    };
    DomRenderer.prototype.onDevicePixelRatioChange = function () {
        this._updateDimensions();
    };
    DomRenderer.prototype._refreshRowElements = function (cols, rows) {
        for (var i = this._rowElements.length; i <= rows; i++) {
            var row = document.createElement('div');
            this._rowContainer.appendChild(row);
            this._rowElements.push(row);
        }
        while (this._rowElements.length > rows) {
            this._rowContainer.removeChild(this._rowElements.pop());
        }
    };
    DomRenderer.prototype.onResize = function (cols, rows) {
        this._refreshRowElements(cols, rows);
        this._updateDimensions();
    };
    DomRenderer.prototype.onCharSizeChanged = function () {
        this._updateDimensions();
    };
    DomRenderer.prototype.onBlur = function () {
        this._rowContainer.classList.remove(FOCUS_CLASS);
    };
    DomRenderer.prototype.onFocus = function () {
        this._rowContainer.classList.add(FOCUS_CLASS);
    };
    DomRenderer.prototype.onSelectionChanged = function (start, end, columnSelectMode) {
        while (this._selectionContainer.children.length) {
            this._selectionContainer.removeChild(this._selectionContainer.children[0]);
        }
        if (!start || !end) {
            return;
        }
        var viewportStartRow = start[1] - this._bufferService.buffer.ydisp;
        var viewportEndRow = end[1] - this._bufferService.buffer.ydisp;
        var viewportCappedStartRow = Math.max(viewportStartRow, 0);
        var viewportCappedEndRow = Math.min(viewportEndRow, this._bufferService.rows - 1);
        if (viewportCappedStartRow >= this._bufferService.rows || viewportCappedEndRow < 0) {
            return;
        }
        var documentFragment = document.createDocumentFragment();
        if (columnSelectMode) {
            documentFragment.appendChild(this._createSelectionElement(viewportCappedStartRow, start[0], end[0], viewportCappedEndRow - viewportCappedStartRow + 1));
        }
        else {
            var startCol = viewportStartRow === viewportCappedStartRow ? start[0] : 0;
            var endCol = viewportCappedStartRow === viewportEndRow ? end[0] : this._bufferService.cols;
            documentFragment.appendChild(this._createSelectionElement(viewportCappedStartRow, startCol, endCol));
            var middleRowsCount = viewportCappedEndRow - viewportCappedStartRow - 1;
            documentFragment.appendChild(this._createSelectionElement(viewportCappedStartRow + 1, 0, this._bufferService.cols, middleRowsCount));
            if (viewportCappedStartRow !== viewportCappedEndRow) {
                var endCol_1 = viewportEndRow === viewportCappedEndRow ? end[0] : this._bufferService.cols;
                documentFragment.appendChild(this._createSelectionElement(viewportCappedEndRow, 0, endCol_1));
            }
        }
        this._selectionContainer.appendChild(documentFragment);
    };
    DomRenderer.prototype._createSelectionElement = function (row, colStart, colEnd, rowCount) {
        if (rowCount === void 0) { rowCount = 1; }
        var element = document.createElement('div');
        element.style.height = rowCount * this.dimensions.actualCellHeight + "px";
        element.style.top = row * this.dimensions.actualCellHeight + "px";
        element.style.left = colStart * this.dimensions.actualCellWidth + "px";
        element.style.width = this.dimensions.actualCellWidth * (colEnd - colStart) + "px";
        return element;
    };
    DomRenderer.prototype.onCursorMove = function () {
    };
    DomRenderer.prototype.onOptionsChanged = function () {
        this._updateDimensions();
        this._injectCss();
    };
    DomRenderer.prototype.clear = function () {
        for (var _i = 0, _a = this._rowElements; _i < _a.length; _i++) {
            var e = _a[_i];
            e.innerText = '';
        }
    };
    DomRenderer.prototype.renderRows = function (start, end) {
        var cursorAbsoluteY = this._bufferService.buffer.ybase + this._bufferService.buffer.y;
        var cursorX = Math.min(this._bufferService.buffer.x, this._bufferService.cols - 1);
        var cursorBlink = this._optionsService.options.cursorBlink;
        for (var y = start; y <= end; y++) {
            var rowElement = this._rowElements[y];
            rowElement.innerText = '';
            var row = y + this._bufferService.buffer.ydisp;
            var lineData = this._bufferService.buffer.lines.get(row);
            var cursorStyle = this._optionsService.options.cursorStyle;
            rowElement.appendChild(this._rowFactory.createRow(lineData, row === cursorAbsoluteY, cursorStyle, cursorX, cursorBlink, this.dimensions.actualCellWidth, this._bufferService.cols));
        }
    };
    Object.defineProperty(DomRenderer.prototype, "_terminalSelector", {
        get: function () {
            return "." + TERMINAL_CLASS_PREFIX + this._terminalClass;
        },
        enumerable: false,
        configurable: true
    });
    DomRenderer.prototype.registerCharacterJoiner = function (handler) { return -1; };
    DomRenderer.prototype.deregisterCharacterJoiner = function (joinerId) { return false; };
    DomRenderer.prototype._onLinkHover = function (e) {
        this._setCellUnderline(e.x1, e.x2, e.y1, e.y2, e.cols, true);
    };
    DomRenderer.prototype._onLinkLeave = function (e) {
        this._setCellUnderline(e.x1, e.x2, e.y1, e.y2, e.cols, false);
    };
    DomRenderer.prototype._setCellUnderline = function (x, x2, y, y2, cols, enabled) {
        while (x !== x2 || y !== y2) {
            var row = this._rowElements[y];
            if (!row) {
                return;
            }
            var span = row.children[x];
            if (span) {
                span.style.textDecoration = enabled ? 'underline' : 'none';
            }
            if (++x >= cols) {
                x = 0;
                y++;
            }
        }
    };
    DomRenderer = __decorate([
        __param(6, Services_1.ICharSizeService),
        __param(7, Services_2.IOptionsService),
        __param(8, Services_2.IBufferService)
    ], DomRenderer);
    return DomRenderer;
}(Lifecycle_1.Disposable));
exports.DomRenderer = DomRenderer;


/***/ }),

/***/ "./out/browser/renderer/dom/DomRendererRowFactory.js":
/*!***********************************************************!*\
  !*** ./out/browser/renderer/dom/DomRendererRowFactory.js ***!
  \***********************************************************/
/*! flagged exports */
/*! export BOLD_CLASS [provided] [no usage info] [missing usage info prevents renaming] */
/*! export CURSOR_BLINK_CLASS [provided] [no usage info] [missing usage info prevents renaming] */
/*! export CURSOR_CLASS [provided] [no usage info] [missing usage info prevents renaming] */
/*! export CURSOR_STYLE_BAR_CLASS [provided] [no usage info] [missing usage info prevents renaming] */
/*! export CURSOR_STYLE_BLOCK_CLASS [provided] [no usage info] [missing usage info prevents renaming] */
/*! export CURSOR_STYLE_UNDERLINE_CLASS [provided] [no usage info] [missing usage info prevents renaming] */
/*! export DIM_CLASS [provided] [no usage info] [missing usage info prevents renaming] */
/*! export DomRendererRowFactory [provided] [no usage info] [missing usage info prevents renaming] */
/*! export ITALIC_CLASS [provided] [no usage info] [missing usage info prevents renaming] */
/*! export UNDERLINE_CLASS [provided] [no usage info] [missing usage info prevents renaming] */
/*! export __esModule [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_exports__, __webpack_require__ */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DomRendererRowFactory = exports.CURSOR_STYLE_UNDERLINE_CLASS = exports.CURSOR_STYLE_BAR_CLASS = exports.CURSOR_STYLE_BLOCK_CLASS = exports.CURSOR_BLINK_CLASS = exports.CURSOR_CLASS = exports.UNDERLINE_CLASS = exports.ITALIC_CLASS = exports.DIM_CLASS = exports.BOLD_CLASS = void 0;
var Constants_1 = __webpack_require__(/*! browser/renderer/atlas/Constants */ "./out/browser/renderer/atlas/Constants.js");
var Constants_2 = __webpack_require__(/*! common/buffer/Constants */ "./out/common/buffer/Constants.js");
var CellData_1 = __webpack_require__(/*! common/buffer/CellData */ "./out/common/buffer/CellData.js");
var Color_1 = __webpack_require__(/*! browser/Color */ "./out/browser/Color.js");
exports.BOLD_CLASS = 'xterm-bold';
exports.DIM_CLASS = 'xterm-dim';
exports.ITALIC_CLASS = 'xterm-italic';
exports.UNDERLINE_CLASS = 'xterm-underline';
exports.CURSOR_CLASS = 'xterm-cursor';
exports.CURSOR_BLINK_CLASS = 'xterm-cursor-blink';
exports.CURSOR_STYLE_BLOCK_CLASS = 'xterm-cursor-block';
exports.CURSOR_STYLE_BAR_CLASS = 'xterm-cursor-bar';
exports.CURSOR_STYLE_UNDERLINE_CLASS = 'xterm-cursor-underline';
var DomRendererRowFactory = (function () {
    function DomRendererRowFactory(_document, _optionsService, _colors) {
        this._document = _document;
        this._optionsService = _optionsService;
        this._colors = _colors;
        this._workCell = new CellData_1.CellData();
    }
    DomRendererRowFactory.prototype.setColors = function (colors) {
        this._colors = colors;
    };
    DomRendererRowFactory.prototype.createRow = function (lineData, isCursorRow, cursorStyle, cursorX, cursorBlink, cellWidth, cols) {
        var fragment = this._document.createDocumentFragment();
        var lineLength = 0;
        for (var x = Math.min(lineData.length, cols) - 1; x >= 0; x--) {
            if (lineData.loadCell(x, this._workCell).getCode() !== Constants_2.NULL_CELL_CODE || (isCursorRow && x === cursorX)) {
                lineLength = x + 1;
                break;
            }
        }
        for (var x = 0; x < lineLength; x++) {
            lineData.loadCell(x, this._workCell);
            var width = this._workCell.getWidth();
            if (width === 0) {
                continue;
            }
            var charElement = this._document.createElement('span');
            if (width > 1) {
                charElement.style.width = cellWidth * width + "px";
            }
            if (isCursorRow && x === cursorX) {
                charElement.classList.add(exports.CURSOR_CLASS);
                if (cursorBlink) {
                    charElement.classList.add(exports.CURSOR_BLINK_CLASS);
                }
                switch (cursorStyle) {
                    case 'bar':
                        charElement.classList.add(exports.CURSOR_STYLE_BAR_CLASS);
                        break;
                    case 'underline':
                        charElement.classList.add(exports.CURSOR_STYLE_UNDERLINE_CLASS);
                        break;
                    default:
                        charElement.classList.add(exports.CURSOR_STYLE_BLOCK_CLASS);
                        break;
                }
            }
            if (this._workCell.isBold()) {
                charElement.classList.add(exports.BOLD_CLASS);
            }
            if (this._workCell.isItalic()) {
                charElement.classList.add(exports.ITALIC_CLASS);
            }
            if (this._workCell.isDim()) {
                charElement.classList.add(exports.DIM_CLASS);
            }
            if (this._workCell.isUnderline()) {
                charElement.classList.add(exports.UNDERLINE_CLASS);
            }
            if (this._workCell.isInvisible()) {
                charElement.textContent = Constants_2.WHITESPACE_CELL_CHAR;
            }
            else {
                charElement.textContent = this._workCell.getChars() || Constants_2.WHITESPACE_CELL_CHAR;
            }
            var fg = this._workCell.getFgColor();
            var fgColorMode = this._workCell.getFgColorMode();
            var bg = this._workCell.getBgColor();
            var bgColorMode = this._workCell.getBgColorMode();
            var isInverse = !!this._workCell.isInverse();
            if (isInverse) {
                var temp = fg;
                fg = bg;
                bg = temp;
                var temp2 = fgColorMode;
                fgColorMode = bgColorMode;
                bgColorMode = temp2;
            }
            switch (fgColorMode) {
                case 16777216:
                case 33554432:
                    if (this._workCell.isBold() && fg < 8 && this._optionsService.options.drawBoldTextInBrightColors) {
                        fg += 8;
                    }
                    if (!this._applyMinimumContrast(charElement, this._colors.background, this._colors.ansi[fg])) {
                        charElement.classList.add("xterm-fg-" + fg);
                    }
                    break;
                case 50331648:
                    var color_1 = Color_1.rgba.toColor((fg >> 16) & 0xFF, (fg >> 8) & 0xFF, (fg) & 0xFF);
                    if (!this._applyMinimumContrast(charElement, this._colors.background, color_1)) {
                        this._addStyle(charElement, "color:#" + padStart(fg.toString(16), '0', 6));
                    }
                    break;
                case 0:
                default:
                    if (!this._applyMinimumContrast(charElement, this._colors.background, this._colors.foreground)) {
                        if (isInverse) {
                            charElement.classList.add("xterm-fg-" + Constants_1.INVERTED_DEFAULT_COLOR);
                        }
                    }
            }
            switch (bgColorMode) {
                case 16777216:
                case 33554432:
                    charElement.classList.add("xterm-bg-" + bg);
                    break;
                case 50331648:
                    this._addStyle(charElement, "background-color:#" + padStart(bg.toString(16), '0', 6));
                    break;
                case 0:
                default:
                    if (isInverse) {
                        charElement.classList.add("xterm-bg-" + Constants_1.INVERTED_DEFAULT_COLOR);
                    }
            }
            fragment.appendChild(charElement);
        }
        return fragment;
    };
    DomRendererRowFactory.prototype._applyMinimumContrast = function (element, bg, fg) {
        if (this._optionsService.options.minimumContrastRatio === 1) {
            return false;
        }
        var adjustedColor = this._colors.contrastCache.getColor(this._workCell.bg, this._workCell.fg);
        if (adjustedColor === undefined) {
            adjustedColor = Color_1.color.ensureContrastRatio(bg, fg, this._optionsService.options.minimumContrastRatio);
            this._colors.contrastCache.setColor(this._workCell.bg, this._workCell.fg, adjustedColor !== null && adjustedColor !== void 0 ? adjustedColor : null);
        }
        if (adjustedColor) {
            this._addStyle(element, "color:" + adjustedColor.css);
            return true;
        }
        return false;
    };
    DomRendererRowFactory.prototype._addStyle = function (element, style) {
        element.setAttribute('style', "" + (element.getAttribute('style') || '') + style + ";");
    };
    return DomRendererRowFactory;
}());
exports.DomRendererRowFactory = DomRendererRowFactory;
function padStart(text, padChar, length) {
    while (text.length < length) {
        text = padChar + text;
    }
    return text;
}


/***/ }),

/***/ "./out/browser/selection/SelectionModel.js":
/*!*************************************************!*\
  !*** ./out/browser/selection/SelectionModel.js ***!
  \*************************************************/
/*! flagged exports */
/*! export SelectionModel [provided] [no usage info] [missing usage info prevents renaming] */
/*! export __esModule [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_exports__ */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SelectionModel = void 0;
var SelectionModel = (function () {
    function SelectionModel(_bufferService) {
        this._bufferService = _bufferService;
        this.isSelectAllActive = false;
        this.selectionStartLength = 0;
    }
    SelectionModel.prototype.clearSelection = function () {
        this.selectionStart = undefined;
        this.selectionEnd = undefined;
        this.isSelectAllActive = false;
        this.selectionStartLength = 0;
    };
    Object.defineProperty(SelectionModel.prototype, "finalSelectionStart", {
        get: function () {
            if (this.isSelectAllActive) {
                return [0, 0];
            }
            if (!this.selectionEnd || !this.selectionStart) {
                return this.selectionStart;
            }
            return this.areSelectionValuesReversed() ? this.selectionEnd : this.selectionStart;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SelectionModel.prototype, "finalSelectionEnd", {
        get: function () {
            if (this.isSelectAllActive) {
                return [this._bufferService.cols, this._bufferService.buffer.ybase + this._bufferService.rows - 1];
            }
            if (!this.selectionStart) {
                return undefined;
            }
            if (!this.selectionEnd || this.areSelectionValuesReversed()) {
                var startPlusLength = this.selectionStart[0] + this.selectionStartLength;
                if (startPlusLength > this._bufferService.cols) {
                    return [startPlusLength % this._bufferService.cols, this.selectionStart[1] + Math.floor(startPlusLength / this._bufferService.cols)];
                }
                return [startPlusLength, this.selectionStart[1]];
            }
            if (this.selectionStartLength) {
                if (this.selectionEnd[1] === this.selectionStart[1]) {
                    return [Math.max(this.selectionStart[0] + this.selectionStartLength, this.selectionEnd[0]), this.selectionEnd[1]];
                }
            }
            return this.selectionEnd;
        },
        enumerable: false,
        configurable: true
    });
    SelectionModel.prototype.areSelectionValuesReversed = function () {
        var start = this.selectionStart;
        var end = this.selectionEnd;
        if (!start || !end) {
            return false;
        }
        return start[1] > end[1] || (start[1] === end[1] && start[0] > end[0]);
    };
    SelectionModel.prototype.onTrim = function (amount) {
        if (this.selectionStart) {
            this.selectionStart[1] -= amount;
        }
        if (this.selectionEnd) {
            this.selectionEnd[1] -= amount;
        }
        if (this.selectionEnd && this.selectionEnd[1] < 0) {
            this.clearSelection();
            return true;
        }
        if (this.selectionStart && this.selectionStart[1] < 0) {
            this.selectionStart[1] = 0;
        }
        return false;
    };
    return SelectionModel;
}());
exports.SelectionModel = SelectionModel;


/***/ }),

/***/ "./out/browser/services/CharSizeService.js":
/*!*************************************************!*\
  !*** ./out/browser/services/CharSizeService.js ***!
  \*************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: top-level-this-exports, __webpack_exports__, __webpack_require__ */
/*! CommonJS bailout: this is used directly at 2:18-22 */
/*! CommonJS bailout: this is used directly at 8:15-19 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CharSizeService = void 0;
var Services_1 = __webpack_require__(/*! common/services/Services */ "./out/common/services/Services.js");
var EventEmitter_1 = __webpack_require__(/*! common/EventEmitter */ "./out/common/EventEmitter.js");
var CharSizeService = (function () {
    function CharSizeService(document, parentElement, _optionsService) {
        this._optionsService = _optionsService;
        this.width = 0;
        this.height = 0;
        this._onCharSizeChange = new EventEmitter_1.EventEmitter();
        this._measureStrategy = new DomMeasureStrategy(document, parentElement, this._optionsService);
    }
    Object.defineProperty(CharSizeService.prototype, "hasValidSize", {
        get: function () { return this.width > 0 && this.height > 0; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CharSizeService.prototype, "onCharSizeChange", {
        get: function () { return this._onCharSizeChange.event; },
        enumerable: false,
        configurable: true
    });
    CharSizeService.prototype.measure = function () {
        var result = this._measureStrategy.measure();
        if (result.width !== this.width || result.height !== this.height) {
            this.width = result.width;
            this.height = result.height;
            this._onCharSizeChange.fire();
        }
    };
    CharSizeService = __decorate([
        __param(2, Services_1.IOptionsService)
    ], CharSizeService);
    return CharSizeService;
}());
exports.CharSizeService = CharSizeService;
var DomMeasureStrategy = (function () {
    function DomMeasureStrategy(_document, _parentElement, _optionsService) {
        this._document = _document;
        this._parentElement = _parentElement;
        this._optionsService = _optionsService;
        this._result = { width: 0, height: 0 };
        this._measureElement = this._document.createElement('span');
        this._measureElement.classList.add('xterm-char-measure-element');
        this._measureElement.textContent = 'W';
        this._measureElement.setAttribute('aria-hidden', 'true');
        this._parentElement.appendChild(this._measureElement);
    }
    DomMeasureStrategy.prototype.measure = function () {
        this._measureElement.style.fontFamily = this._optionsService.options.fontFamily;
        this._measureElement.style.fontSize = this._optionsService.options.fontSize + "px";
        var geometry = this._measureElement.getBoundingClientRect();
        if (geometry.width !== 0 && geometry.height !== 0) {
            this._result.width = geometry.width;
            this._result.height = Math.ceil(geometry.height);
        }
        return this._result;
    };
    return DomMeasureStrategy;
}());


/***/ }),

/***/ "./out/browser/services/CoreBrowserService.js":
/*!****************************************************!*\
  !*** ./out/browser/services/CoreBrowserService.js ***!
  \****************************************************/
/*! flagged exports */
/*! export CoreBrowserService [provided] [no usage info] [missing usage info prevents renaming] */
/*! export __esModule [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_exports__ */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CoreBrowserService = void 0;
var CoreBrowserService = (function () {
    function CoreBrowserService(_textarea) {
        this._textarea = _textarea;
    }
    Object.defineProperty(CoreBrowserService.prototype, "isFocused", {
        get: function () {
            var docOrShadowRoot = this._textarea.getRootNode ? this._textarea.getRootNode() : document;
            return docOrShadowRoot.activeElement === this._textarea && document.hasFocus();
        },
        enumerable: false,
        configurable: true
    });
    return CoreBrowserService;
}());
exports.CoreBrowserService = CoreBrowserService;


/***/ }),

/***/ "./out/browser/services/MouseService.js":
/*!**********************************************!*\
  !*** ./out/browser/services/MouseService.js ***!
  \**********************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: top-level-this-exports, __webpack_exports__, __webpack_require__ */
/*! CommonJS bailout: this is used directly at 2:18-22 */
/*! CommonJS bailout: this is used directly at 8:15-19 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MouseService = void 0;
var Services_1 = __webpack_require__(/*! ./Services */ "./out/browser/services/Services.js");
var Mouse_1 = __webpack_require__(/*! browser/input/Mouse */ "./out/browser/input/Mouse.js");
var MouseService = (function () {
    function MouseService(_renderService, _charSizeService) {
        this._renderService = _renderService;
        this._charSizeService = _charSizeService;
    }
    MouseService.prototype.getCoords = function (event, element, colCount, rowCount, isSelection) {
        return Mouse_1.getCoords(event, element, colCount, rowCount, this._charSizeService.hasValidSize, this._renderService.dimensions.actualCellWidth, this._renderService.dimensions.actualCellHeight, isSelection);
    };
    MouseService.prototype.getRawByteCoords = function (event, element, colCount, rowCount) {
        var coords = this.getCoords(event, element, colCount, rowCount);
        return Mouse_1.getRawByteCoords(coords);
    };
    MouseService = __decorate([
        __param(0, Services_1.IRenderService),
        __param(1, Services_1.ICharSizeService)
    ], MouseService);
    return MouseService;
}());
exports.MouseService = MouseService;


/***/ }),

/***/ "./out/browser/services/RenderService.js":
/*!***********************************************!*\
  !*** ./out/browser/services/RenderService.js ***!
  \***********************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: top-level-this-exports, __webpack_exports__, __webpack_require__ */
/*! CommonJS bailout: this is used directly at 2:17-21 */
/*! CommonJS bailout: this is used directly at 15:18-22 */
/*! CommonJS bailout: this is used directly at 21:15-19 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RenderService = void 0;
var RenderDebouncer_1 = __webpack_require__(/*! browser/RenderDebouncer */ "./out/browser/RenderDebouncer.js");
var EventEmitter_1 = __webpack_require__(/*! common/EventEmitter */ "./out/common/EventEmitter.js");
var Lifecycle_1 = __webpack_require__(/*! common/Lifecycle */ "./out/common/Lifecycle.js");
var ScreenDprMonitor_1 = __webpack_require__(/*! browser/ScreenDprMonitor */ "./out/browser/ScreenDprMonitor.js");
var Lifecycle_2 = __webpack_require__(/*! browser/Lifecycle */ "./out/browser/Lifecycle.js");
var Services_1 = __webpack_require__(/*! common/services/Services */ "./out/common/services/Services.js");
var Services_2 = __webpack_require__(/*! browser/services/Services */ "./out/browser/services/Services.js");
var RenderService = (function (_super) {
    __extends(RenderService, _super);
    function RenderService(_renderer, _rowCount, screenElement, optionsService, _charSizeService, bufferService) {
        var _this = _super.call(this) || this;
        _this._renderer = _renderer;
        _this._rowCount = _rowCount;
        _this._charSizeService = _charSizeService;
        _this._isPaused = false;
        _this._needsFullRefresh = false;
        _this._isNextRenderRedrawOnly = true;
        _this._needsSelectionRefresh = false;
        _this._canvasWidth = 0;
        _this._canvasHeight = 0;
        _this._selectionState = {
            start: undefined,
            end: undefined,
            columnSelectMode: false
        };
        _this._onDimensionsChange = new EventEmitter_1.EventEmitter();
        _this._onRender = new EventEmitter_1.EventEmitter();
        _this._onRefreshRequest = new EventEmitter_1.EventEmitter();
        _this.register({ dispose: function () { return _this._renderer.dispose(); } });
        _this._renderDebouncer = new RenderDebouncer_1.RenderDebouncer(function (start, end) { return _this._renderRows(start, end); });
        _this.register(_this._renderDebouncer);
        _this._screenDprMonitor = new ScreenDprMonitor_1.ScreenDprMonitor();
        _this._screenDprMonitor.setListener(function () { return _this.onDevicePixelRatioChange(); });
        _this.register(_this._screenDprMonitor);
        _this.register(bufferService.onResize(function (e) { return _this._fullRefresh(); }));
        _this.register(optionsService.onOptionChange(function () { return _this._renderer.onOptionsChanged(); }));
        _this.register(_this._charSizeService.onCharSizeChange(function () { return _this.onCharSizeChanged(); }));
        _this._renderer.onRequestRedraw(function (e) { return _this.refreshRows(e.start, e.end, true); });
        _this.register(Lifecycle_2.addDisposableDomListener(window, 'resize', function () { return _this.onDevicePixelRatioChange(); }));
        if ('IntersectionObserver' in window) {
            var observer_1 = new IntersectionObserver(function (e) { return _this._onIntersectionChange(e[e.length - 1]); }, { threshold: 0 });
            observer_1.observe(screenElement);
            _this.register({ dispose: function () { return observer_1.disconnect(); } });
        }
        return _this;
    }
    Object.defineProperty(RenderService.prototype, "onDimensionsChange", {
        get: function () { return this._onDimensionsChange.event; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RenderService.prototype, "onRenderedBufferChange", {
        get: function () { return this._onRender.event; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RenderService.prototype, "onRefreshRequest", {
        get: function () { return this._onRefreshRequest.event; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RenderService.prototype, "dimensions", {
        get: function () { return this._renderer.dimensions; },
        enumerable: false,
        configurable: true
    });
    RenderService.prototype._onIntersectionChange = function (entry) {
        this._isPaused = entry.isIntersecting === undefined ? (entry.intersectionRatio === 0) : !entry.isIntersecting;
        if (!this._isPaused && !this._charSizeService.hasValidSize) {
            this._charSizeService.measure();
        }
        if (!this._isPaused && this._needsFullRefresh) {
            this.refreshRows(0, this._rowCount - 1);
            this._needsFullRefresh = false;
        }
    };
    RenderService.prototype.refreshRows = function (start, end, isRedrawOnly) {
        if (isRedrawOnly === void 0) { isRedrawOnly = false; }
        if (this._isPaused) {
            this._needsFullRefresh = true;
            return;
        }
        if (!isRedrawOnly) {
            this._isNextRenderRedrawOnly = false;
        }
        this._renderDebouncer.refresh(start, end, this._rowCount);
    };
    RenderService.prototype._renderRows = function (start, end) {
        this._renderer.renderRows(start, end);
        if (this._needsSelectionRefresh) {
            this._renderer.onSelectionChanged(this._selectionState.start, this._selectionState.end, this._selectionState.columnSelectMode);
            this._needsSelectionRefresh = false;
        }
        if (!this._isNextRenderRedrawOnly) {
            this._onRender.fire({ start: start, end: end });
        }
        this._isNextRenderRedrawOnly = true;
    };
    RenderService.prototype.resize = function (cols, rows) {
        this._rowCount = rows;
        this._fireOnCanvasResize();
    };
    RenderService.prototype.changeOptions = function () {
        this._renderer.onOptionsChanged();
        this.refreshRows(0, this._rowCount - 1);
        this._fireOnCanvasResize();
    };
    RenderService.prototype._fireOnCanvasResize = function () {
        if (this._renderer.dimensions.canvasWidth === this._canvasWidth && this._renderer.dimensions.canvasHeight === this._canvasHeight) {
            return;
        }
        this._onDimensionsChange.fire(this._renderer.dimensions);
    };
    RenderService.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
    };
    RenderService.prototype.setRenderer = function (renderer) {
        var _this = this;
        this._renderer.dispose();
        this._renderer = renderer;
        this._renderer.onRequestRedraw(function (e) { return _this.refreshRows(e.start, e.end, true); });
        this._needsSelectionRefresh = true;
        this._fullRefresh();
    };
    RenderService.prototype._fullRefresh = function () {
        if (this._isPaused) {
            this._needsFullRefresh = true;
        }
        else {
            this.refreshRows(0, this._rowCount - 1);
        }
    };
    RenderService.prototype.setColors = function (colors) {
        this._renderer.setColors(colors);
        this._fullRefresh();
    };
    RenderService.prototype.onDevicePixelRatioChange = function () {
        this._charSizeService.measure();
        this._renderer.onDevicePixelRatioChange();
        this.refreshRows(0, this._rowCount - 1);
    };
    RenderService.prototype.onResize = function (cols, rows) {
        this._renderer.onResize(cols, rows);
        this._fullRefresh();
    };
    RenderService.prototype.onCharSizeChanged = function () {
        this._renderer.onCharSizeChanged();
    };
    RenderService.prototype.onBlur = function () {
        this._renderer.onBlur();
    };
    RenderService.prototype.onFocus = function () {
        this._renderer.onFocus();
    };
    RenderService.prototype.onSelectionChanged = function (start, end, columnSelectMode) {
        this._selectionState.start = start;
        this._selectionState.end = end;
        this._selectionState.columnSelectMode = columnSelectMode;
        this._renderer.onSelectionChanged(start, end, columnSelectMode);
    };
    RenderService.prototype.onCursorMove = function () {
        this._renderer.onCursorMove();
    };
    RenderService.prototype.clear = function () {
        this._renderer.clear();
    };
    RenderService.prototype.registerCharacterJoiner = function (handler) {
        return this._renderer.registerCharacterJoiner(handler);
    };
    RenderService.prototype.deregisterCharacterJoiner = function (joinerId) {
        return this._renderer.deregisterCharacterJoiner(joinerId);
    };
    RenderService = __decorate([
        __param(3, Services_1.IOptionsService),
        __param(4, Services_2.ICharSizeService),
        __param(5, Services_1.IBufferService)
    ], RenderService);
    return RenderService;
}(Lifecycle_1.Disposable));
exports.RenderService = RenderService;


/***/ }),

/***/ "./out/browser/services/SelectionService.js":
/*!**************************************************!*\
  !*** ./out/browser/services/SelectionService.js ***!
  \**************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: top-level-this-exports, __webpack_exports__, __webpack_require__ */
/*! CommonJS bailout: this is used directly at 2:17-21 */
/*! CommonJS bailout: this is used directly at 15:18-22 */
/*! CommonJS bailout: this is used directly at 21:15-19 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SelectionService = void 0;
var Browser = __webpack_require__(/*! common/Platform */ "./out/common/Platform.js");
var SelectionModel_1 = __webpack_require__(/*! browser/selection/SelectionModel */ "./out/browser/selection/SelectionModel.js");
var CellData_1 = __webpack_require__(/*! common/buffer/CellData */ "./out/common/buffer/CellData.js");
var EventEmitter_1 = __webpack_require__(/*! common/EventEmitter */ "./out/common/EventEmitter.js");
var Services_1 = __webpack_require__(/*! browser/services/Services */ "./out/browser/services/Services.js");
var Services_2 = __webpack_require__(/*! common/services/Services */ "./out/common/services/Services.js");
var Mouse_1 = __webpack_require__(/*! browser/input/Mouse */ "./out/browser/input/Mouse.js");
var MoveToCell_1 = __webpack_require__(/*! browser/input/MoveToCell */ "./out/browser/input/MoveToCell.js");
var Lifecycle_1 = __webpack_require__(/*! common/Lifecycle */ "./out/common/Lifecycle.js");
var DRAG_SCROLL_MAX_THRESHOLD = 50;
var DRAG_SCROLL_MAX_SPEED = 15;
var DRAG_SCROLL_INTERVAL = 50;
var ALT_CLICK_MOVE_CURSOR_TIME = 500;
var NON_BREAKING_SPACE_CHAR = String.fromCharCode(160);
var ALL_NON_BREAKING_SPACE_REGEX = new RegExp(NON_BREAKING_SPACE_CHAR, 'g');
var SelectionService = (function (_super) {
    __extends(SelectionService, _super);
    function SelectionService(_element, _screenElement, _bufferService, _coreService, _mouseService, _optionsService, _renderService) {
        var _this = _super.call(this) || this;
        _this._element = _element;
        _this._screenElement = _screenElement;
        _this._bufferService = _bufferService;
        _this._coreService = _coreService;
        _this._mouseService = _mouseService;
        _this._optionsService = _optionsService;
        _this._renderService = _renderService;
        _this._dragScrollAmount = 0;
        _this._enabled = true;
        _this._workCell = new CellData_1.CellData();
        _this._mouseDownTimeStamp = 0;
        _this._oldHasSelection = false;
        _this._oldSelectionStart = undefined;
        _this._oldSelectionEnd = undefined;
        _this._onLinuxMouseSelection = _this.register(new EventEmitter_1.EventEmitter());
        _this._onRedrawRequest = _this.register(new EventEmitter_1.EventEmitter());
        _this._onSelectionChange = _this.register(new EventEmitter_1.EventEmitter());
        _this._onRequestScrollLines = _this.register(new EventEmitter_1.EventEmitter());
        _this._mouseMoveListener = function (event) { return _this._onMouseMove(event); };
        _this._mouseUpListener = function (event) { return _this._onMouseUp(event); };
        _this._coreService.onUserInput(function () {
            if (_this.hasSelection) {
                _this.clearSelection();
            }
        });
        _this._trimListener = _this._bufferService.buffer.lines.onTrim(function (amount) { return _this._onTrim(amount); });
        _this.register(_this._bufferService.buffers.onBufferActivate(function (e) { return _this._onBufferActivate(e); }));
        _this.enable();
        _this._model = new SelectionModel_1.SelectionModel(_this._bufferService);
        _this._activeSelectionMode = 0;
        return _this;
    }
    Object.defineProperty(SelectionService.prototype, "onLinuxMouseSelection", {
        get: function () { return this._onLinuxMouseSelection.event; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SelectionService.prototype, "onRequestRedraw", {
        get: function () { return this._onRedrawRequest.event; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SelectionService.prototype, "onSelectionChange", {
        get: function () { return this._onSelectionChange.event; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SelectionService.prototype, "onRequestScrollLines", {
        get: function () { return this._onRequestScrollLines.event; },
        enumerable: false,
        configurable: true
    });
    SelectionService.prototype.dispose = function () {
        this._removeMouseDownListeners();
    };
    SelectionService.prototype.reset = function () {
        this.clearSelection();
    };
    SelectionService.prototype.disable = function () {
        this.clearSelection();
        this._enabled = false;
    };
    SelectionService.prototype.enable = function () {
        this._enabled = true;
    };
    Object.defineProperty(SelectionService.prototype, "selectionStart", {
        get: function () { return this._model.finalSelectionStart; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SelectionService.prototype, "selectionEnd", {
        get: function () { return this._model.finalSelectionEnd; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SelectionService.prototype, "hasSelection", {
        get: function () {
            var start = this._model.finalSelectionStart;
            var end = this._model.finalSelectionEnd;
            if (!start || !end) {
                return false;
            }
            return start[0] !== end[0] || start[1] !== end[1];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SelectionService.prototype, "selectionText", {
        get: function () {
            var start = this._model.finalSelectionStart;
            var end = this._model.finalSelectionEnd;
            if (!start || !end) {
                return '';
            }
            var buffer = this._bufferService.buffer;
            var result = [];
            if (this._activeSelectionMode === 3) {
                if (start[0] === end[0]) {
                    return '';
                }
                for (var i = start[1]; i <= end[1]; i++) {
                    var lineText = buffer.translateBufferLineToString(i, true, start[0], end[0]);
                    result.push(lineText);
                }
            }
            else {
                var startRowEndCol = start[1] === end[1] ? end[0] : undefined;
                result.push(buffer.translateBufferLineToString(start[1], true, start[0], startRowEndCol));
                for (var i = start[1] + 1; i <= end[1] - 1; i++) {
                    var bufferLine = buffer.lines.get(i);
                    var lineText = buffer.translateBufferLineToString(i, true);
                    if (bufferLine && bufferLine.isWrapped) {
                        result[result.length - 1] += lineText;
                    }
                    else {
                        result.push(lineText);
                    }
                }
                if (start[1] !== end[1]) {
                    var bufferLine = buffer.lines.get(end[1]);
                    var lineText = buffer.translateBufferLineToString(end[1], true, 0, end[0]);
                    if (bufferLine && bufferLine.isWrapped) {
                        result[result.length - 1] += lineText;
                    }
                    else {
                        result.push(lineText);
                    }
                }
            }
            var formattedResult = result.map(function (line) {
                return line.replace(ALL_NON_BREAKING_SPACE_REGEX, ' ');
            }).join(Browser.isWindows ? '\r\n' : '\n');
            return formattedResult;
        },
        enumerable: false,
        configurable: true
    });
    SelectionService.prototype.clearSelection = function () {
        this._model.clearSelection();
        this._removeMouseDownListeners();
        this.refresh();
        this._onSelectionChange.fire();
    };
    SelectionService.prototype.refresh = function (isLinuxMouseSelection) {
        var _this = this;
        if (!this._refreshAnimationFrame) {
            this._refreshAnimationFrame = window.requestAnimationFrame(function () { return _this._refresh(); });
        }
        if (Browser.isLinux && isLinuxMouseSelection) {
            var selectionText = this.selectionText;
            if (selectionText.length) {
                this._onLinuxMouseSelection.fire(this.selectionText);
            }
        }
    };
    SelectionService.prototype._refresh = function () {
        this._refreshAnimationFrame = undefined;
        this._onRedrawRequest.fire({
            start: this._model.finalSelectionStart,
            end: this._model.finalSelectionEnd,
            columnSelectMode: this._activeSelectionMode === 3
        });
    };
    SelectionService.prototype._isClickInSelection = function (event) {
        var coords = this._getMouseBufferCoords(event);
        var start = this._model.finalSelectionStart;
        var end = this._model.finalSelectionEnd;
        if (!start || !end || !coords) {
            return false;
        }
        return this._areCoordsInSelection(coords, start, end);
    };
    SelectionService.prototype._areCoordsInSelection = function (coords, start, end) {
        return (coords[1] > start[1] && coords[1] < end[1]) ||
            (start[1] === end[1] && coords[1] === start[1] && coords[0] >= start[0] && coords[0] < end[0]) ||
            (start[1] < end[1] && coords[1] === end[1] && coords[0] < end[0]) ||
            (start[1] < end[1] && coords[1] === start[1] && coords[0] >= start[0]);
    };
    SelectionService.prototype._selectWordAtCursor = function (event) {
        var coords = this._getMouseBufferCoords(event);
        if (coords) {
            this._selectWordAt(coords, false);
            this._model.selectionEnd = undefined;
            this.refresh(true);
        }
    };
    SelectionService.prototype.selectAll = function () {
        this._model.isSelectAllActive = true;
        this.refresh();
        this._onSelectionChange.fire();
    };
    SelectionService.prototype.selectLines = function (start, end) {
        this._model.clearSelection();
        start = Math.max(start, 0);
        end = Math.min(end, this._bufferService.buffer.lines.length - 1);
        this._model.selectionStart = [0, start];
        this._model.selectionEnd = [this._bufferService.cols, end];
        this.refresh();
        this._onSelectionChange.fire();
    };
    SelectionService.prototype._onTrim = function (amount) {
        var needsRefresh = this._model.onTrim(amount);
        if (needsRefresh) {
            this.refresh();
        }
    };
    SelectionService.prototype._getMouseBufferCoords = function (event) {
        var coords = this._mouseService.getCoords(event, this._screenElement, this._bufferService.cols, this._bufferService.rows, true);
        if (!coords) {
            return undefined;
        }
        coords[0]--;
        coords[1]--;
        coords[1] += this._bufferService.buffer.ydisp;
        return coords;
    };
    SelectionService.prototype._getMouseEventScrollAmount = function (event) {
        var offset = Mouse_1.getCoordsRelativeToElement(event, this._screenElement)[1];
        var terminalHeight = this._renderService.dimensions.canvasHeight;
        if (offset >= 0 && offset <= terminalHeight) {
            return 0;
        }
        if (offset > terminalHeight) {
            offset -= terminalHeight;
        }
        offset = Math.min(Math.max(offset, -DRAG_SCROLL_MAX_THRESHOLD), DRAG_SCROLL_MAX_THRESHOLD);
        offset /= DRAG_SCROLL_MAX_THRESHOLD;
        return (offset / Math.abs(offset)) + Math.round(offset * (DRAG_SCROLL_MAX_SPEED - 1));
    };
    SelectionService.prototype.shouldForceSelection = function (event) {
        if (Browser.isMac) {
            return event.altKey && this._optionsService.options.macOptionClickForcesSelection;
        }
        return event.shiftKey;
    };
    SelectionService.prototype.onMouseDown = function (event) {
        this._mouseDownTimeStamp = event.timeStamp;
        if (event.button === 2 && this.hasSelection) {
            return;
        }
        if (event.button !== 0) {
            return;
        }
        if (!this._enabled) {
            if (!this.shouldForceSelection(event)) {
                return;
            }
            event.stopPropagation();
        }
        event.preventDefault();
        this._dragScrollAmount = 0;
        if (this._enabled && event.shiftKey) {
            this._onIncrementalClick(event);
        }
        else {
            if (event.detail === 1) {
                this._onSingleClick(event);
            }
            else if (event.detail === 2) {
                this._onDoubleClick(event);
            }
            else if (event.detail === 3) {
                this._onTripleClick(event);
            }
        }
        this._addMouseDownListeners();
        this.refresh(true);
    };
    SelectionService.prototype._addMouseDownListeners = function () {
        var _this = this;
        if (this._screenElement.ownerDocument) {
            this._screenElement.ownerDocument.addEventListener('mousemove', this._mouseMoveListener);
            this._screenElement.ownerDocument.addEventListener('mouseup', this._mouseUpListener);
        }
        this._dragScrollIntervalTimer = window.setInterval(function () { return _this._dragScroll(); }, DRAG_SCROLL_INTERVAL);
    };
    SelectionService.prototype._removeMouseDownListeners = function () {
        if (this._screenElement.ownerDocument) {
            this._screenElement.ownerDocument.removeEventListener('mousemove', this._mouseMoveListener);
            this._screenElement.ownerDocument.removeEventListener('mouseup', this._mouseUpListener);
        }
        clearInterval(this._dragScrollIntervalTimer);
        this._dragScrollIntervalTimer = undefined;
    };
    SelectionService.prototype._onIncrementalClick = function (event) {
        if (this._model.selectionStart) {
            this._model.selectionEnd = this._getMouseBufferCoords(event);
        }
    };
    SelectionService.prototype._onSingleClick = function (event) {
        this._model.selectionStartLength = 0;
        this._model.isSelectAllActive = false;
        this._activeSelectionMode = this.shouldColumnSelect(event) ? 3 : 0;
        this._model.selectionStart = this._getMouseBufferCoords(event);
        if (!this._model.selectionStart) {
            return;
        }
        this._model.selectionEnd = undefined;
        var line = this._bufferService.buffer.lines.get(this._model.selectionStart[1]);
        if (!line) {
            return;
        }
        if (line.length === this._model.selectionStart[0]) {
            return;
        }
        if (line.hasWidth(this._model.selectionStart[0]) === 0) {
            this._model.selectionStart[0]++;
        }
    };
    SelectionService.prototype._onDoubleClick = function (event) {
        var coords = this._getMouseBufferCoords(event);
        if (coords) {
            this._activeSelectionMode = 1;
            this._selectWordAt(coords, true);
        }
    };
    SelectionService.prototype._onTripleClick = function (event) {
        var coords = this._getMouseBufferCoords(event);
        if (coords) {
            this._activeSelectionMode = 2;
            this._selectLineAt(coords[1]);
        }
    };
    SelectionService.prototype.shouldColumnSelect = function (event) {
        return event.altKey && !(Browser.isMac && this._optionsService.options.macOptionClickForcesSelection);
    };
    SelectionService.prototype._onMouseMove = function (event) {
        event.stopImmediatePropagation();
        if (!this._model.selectionStart) {
            return;
        }
        var previousSelectionEnd = this._model.selectionEnd ? [this._model.selectionEnd[0], this._model.selectionEnd[1]] : null;
        this._model.selectionEnd = this._getMouseBufferCoords(event);
        if (!this._model.selectionEnd) {
            this.refresh(true);
            return;
        }
        if (this._activeSelectionMode === 2) {
            if (this._model.selectionEnd[1] < this._model.selectionStart[1]) {
                this._model.selectionEnd[0] = 0;
            }
            else {
                this._model.selectionEnd[0] = this._bufferService.cols;
            }
        }
        else if (this._activeSelectionMode === 1) {
            this._selectToWordAt(this._model.selectionEnd);
        }
        this._dragScrollAmount = this._getMouseEventScrollAmount(event);
        if (this._activeSelectionMode !== 3) {
            if (this._dragScrollAmount > 0) {
                this._model.selectionEnd[0] = this._bufferService.cols;
            }
            else if (this._dragScrollAmount < 0) {
                this._model.selectionEnd[0] = 0;
            }
        }
        var buffer = this._bufferService.buffer;
        if (this._model.selectionEnd[1] < buffer.lines.length) {
            var line = buffer.lines.get(this._model.selectionEnd[1]);
            if (line && line.hasWidth(this._model.selectionEnd[0]) === 0) {
                this._model.selectionEnd[0]++;
            }
        }
        if (!previousSelectionEnd ||
            previousSelectionEnd[0] !== this._model.selectionEnd[0] ||
            previousSelectionEnd[1] !== this._model.selectionEnd[1]) {
            this.refresh(true);
        }
    };
    SelectionService.prototype._dragScroll = function () {
        if (!this._model.selectionEnd || !this._model.selectionStart) {
            return;
        }
        if (this._dragScrollAmount) {
            this._onRequestScrollLines.fire({ amount: this._dragScrollAmount, suppressScrollEvent: false });
            var buffer = this._bufferService.buffer;
            if (this._dragScrollAmount > 0) {
                if (this._activeSelectionMode !== 3) {
                    this._model.selectionEnd[0] = this._bufferService.cols;
                }
                this._model.selectionEnd[1] = Math.min(buffer.ydisp + this._bufferService.rows, buffer.lines.length - 1);
            }
            else {
                if (this._activeSelectionMode !== 3) {
                    this._model.selectionEnd[0] = 0;
                }
                this._model.selectionEnd[1] = buffer.ydisp;
            }
            this.refresh();
        }
    };
    SelectionService.prototype._onMouseUp = function (event) {
        var timeElapsed = event.timeStamp - this._mouseDownTimeStamp;
        this._removeMouseDownListeners();
        if (this.selectionText.length <= 1 && timeElapsed < ALT_CLICK_MOVE_CURSOR_TIME && event.altKey && this._optionsService.getOption('altClickMovesCursor')) {
            if (this._bufferService.buffer.ybase === this._bufferService.buffer.ydisp) {
                var coordinates = this._mouseService.getCoords(event, this._element, this._bufferService.cols, this._bufferService.rows, false);
                if (coordinates && coordinates[0] !== undefined && coordinates[1] !== undefined) {
                    var sequence = MoveToCell_1.moveToCellSequence(coordinates[0] - 1, coordinates[1] - 1, this._bufferService, this._coreService.decPrivateModes.applicationCursorKeys);
                    this._coreService.triggerDataEvent(sequence, true);
                }
            }
        }
        else {
            this._fireEventIfSelectionChanged();
        }
    };
    SelectionService.prototype._fireEventIfSelectionChanged = function () {
        var start = this._model.finalSelectionStart;
        var end = this._model.finalSelectionEnd;
        var hasSelection = !!start && !!end && (start[0] !== end[0] || start[1] !== end[1]);
        if (!hasSelection) {
            if (this._oldHasSelection) {
                this._fireOnSelectionChange(start, end, hasSelection);
            }
            return;
        }
        if (!start || !end) {
            return;
        }
        if (!this._oldSelectionStart || !this._oldSelectionEnd || (start[0] !== this._oldSelectionStart[0] || start[1] !== this._oldSelectionStart[1] ||
            end[0] !== this._oldSelectionEnd[0] || end[1] !== this._oldSelectionEnd[1])) {
            this._fireOnSelectionChange(start, end, hasSelection);
        }
    };
    SelectionService.prototype._fireOnSelectionChange = function (start, end, hasSelection) {
        this._oldSelectionStart = start;
        this._oldSelectionEnd = end;
        this._oldHasSelection = hasSelection;
        this._onSelectionChange.fire();
    };
    SelectionService.prototype._onBufferActivate = function (e) {
        var _this = this;
        this.clearSelection();
        this._trimListener.dispose();
        this._trimListener = e.activeBuffer.lines.onTrim(function (amount) { return _this._onTrim(amount); });
    };
    SelectionService.prototype._convertViewportColToCharacterIndex = function (bufferLine, coords) {
        var charIndex = coords[0];
        for (var i = 0; coords[0] >= i; i++) {
            var length_1 = bufferLine.loadCell(i, this._workCell).getChars().length;
            if (this._workCell.getWidth() === 0) {
                charIndex--;
            }
            else if (length_1 > 1 && coords[0] !== i) {
                charIndex += length_1 - 1;
            }
        }
        return charIndex;
    };
    SelectionService.prototype.setSelection = function (col, row, length) {
        this._model.clearSelection();
        this._removeMouseDownListeners();
        this._model.selectionStart = [col, row];
        this._model.selectionStartLength = length;
        this.refresh();
    };
    SelectionService.prototype.rightClickSelect = function (ev) {
        if (!this._isClickInSelection(ev)) {
            this._selectWordAtCursor(ev);
            this._fireEventIfSelectionChanged();
        }
    };
    SelectionService.prototype._getWordAt = function (coords, allowWhitespaceOnlySelection, followWrappedLinesAbove, followWrappedLinesBelow) {
        if (followWrappedLinesAbove === void 0) { followWrappedLinesAbove = true; }
        if (followWrappedLinesBelow === void 0) { followWrappedLinesBelow = true; }
        if (coords[0] >= this._bufferService.cols) {
            return undefined;
        }
        var buffer = this._bufferService.buffer;
        var bufferLine = buffer.lines.get(coords[1]);
        if (!bufferLine) {
            return undefined;
        }
        var line = buffer.translateBufferLineToString(coords[1], false);
        var startIndex = this._convertViewportColToCharacterIndex(bufferLine, coords);
        var endIndex = startIndex;
        var charOffset = coords[0] - startIndex;
        var leftWideCharCount = 0;
        var rightWideCharCount = 0;
        var leftLongCharOffset = 0;
        var rightLongCharOffset = 0;
        if (line.charAt(startIndex) === ' ') {
            while (startIndex > 0 && line.charAt(startIndex - 1) === ' ') {
                startIndex--;
            }
            while (endIndex < line.length && line.charAt(endIndex + 1) === ' ') {
                endIndex++;
            }
        }
        else {
            var startCol = coords[0];
            var endCol = coords[0];
            if (bufferLine.getWidth(startCol) === 0) {
                leftWideCharCount++;
                startCol--;
            }
            if (bufferLine.getWidth(endCol) === 2) {
                rightWideCharCount++;
                endCol++;
            }
            var length_2 = bufferLine.getString(endCol).length;
            if (length_2 > 1) {
                rightLongCharOffset += length_2 - 1;
                endIndex += length_2 - 1;
            }
            while (startCol > 0 && startIndex > 0 && !this._isCharWordSeparator(bufferLine.loadCell(startCol - 1, this._workCell))) {
                bufferLine.loadCell(startCol - 1, this._workCell);
                var length_3 = this._workCell.getChars().length;
                if (this._workCell.getWidth() === 0) {
                    leftWideCharCount++;
                    startCol--;
                }
                else if (length_3 > 1) {
                    leftLongCharOffset += length_3 - 1;
                    startIndex -= length_3 - 1;
                }
                startIndex--;
                startCol--;
            }
            while (endCol < bufferLine.length && endIndex + 1 < line.length && !this._isCharWordSeparator(bufferLine.loadCell(endCol + 1, this._workCell))) {
                bufferLine.loadCell(endCol + 1, this._workCell);
                var length_4 = this._workCell.getChars().length;
                if (this._workCell.getWidth() === 2) {
                    rightWideCharCount++;
                    endCol++;
                }
                else if (length_4 > 1) {
                    rightLongCharOffset += length_4 - 1;
                    endIndex += length_4 - 1;
                }
                endIndex++;
                endCol++;
            }
        }
        endIndex++;
        var start = startIndex
            + charOffset
            - leftWideCharCount
            + leftLongCharOffset;
        var length = Math.min(this._bufferService.cols, endIndex
            - startIndex
            + leftWideCharCount
            + rightWideCharCount
            - leftLongCharOffset
            - rightLongCharOffset);
        if (!allowWhitespaceOnlySelection && line.slice(startIndex, endIndex).trim() === '') {
            return undefined;
        }
        if (followWrappedLinesAbove) {
            if (start === 0 && bufferLine.getCodePoint(0) !== 32) {
                var previousBufferLine = buffer.lines.get(coords[1] - 1);
                if (previousBufferLine && bufferLine.isWrapped && previousBufferLine.getCodePoint(this._bufferService.cols - 1) !== 32) {
                    var previousLineWordPosition = this._getWordAt([this._bufferService.cols - 1, coords[1] - 1], false, true, false);
                    if (previousLineWordPosition) {
                        var offset = this._bufferService.cols - previousLineWordPosition.start;
                        start -= offset;
                        length += offset;
                    }
                }
            }
        }
        if (followWrappedLinesBelow) {
            if (start + length === this._bufferService.cols && bufferLine.getCodePoint(this._bufferService.cols - 1) !== 32) {
                var nextBufferLine = buffer.lines.get(coords[1] + 1);
                if (nextBufferLine && nextBufferLine.isWrapped && nextBufferLine.getCodePoint(0) !== 32) {
                    var nextLineWordPosition = this._getWordAt([0, coords[1] + 1], false, false, true);
                    if (nextLineWordPosition) {
                        length += nextLineWordPosition.length;
                    }
                }
            }
        }
        return { start: start, length: length };
    };
    SelectionService.prototype._selectWordAt = function (coords, allowWhitespaceOnlySelection) {
        var wordPosition = this._getWordAt(coords, allowWhitespaceOnlySelection);
        if (wordPosition) {
            while (wordPosition.start < 0) {
                wordPosition.start += this._bufferService.cols;
                coords[1]--;
            }
            this._model.selectionStart = [wordPosition.start, coords[1]];
            this._model.selectionStartLength = wordPosition.length;
        }
    };
    SelectionService.prototype._selectToWordAt = function (coords) {
        var wordPosition = this._getWordAt(coords, true);
        if (wordPosition) {
            var endRow = coords[1];
            while (wordPosition.start < 0) {
                wordPosition.start += this._bufferService.cols;
                endRow--;
            }
            if (!this._model.areSelectionValuesReversed()) {
                while (wordPosition.start + wordPosition.length > this._bufferService.cols) {
                    wordPosition.length -= this._bufferService.cols;
                    endRow++;
                }
            }
            this._model.selectionEnd = [this._model.areSelectionValuesReversed() ? wordPosition.start : wordPosition.start + wordPosition.length, endRow];
        }
    };
    SelectionService.prototype._isCharWordSeparator = function (cell) {
        if (cell.getWidth() === 0) {
            return false;
        }
        return this._optionsService.options.wordSeparator.indexOf(cell.getChars()) >= 0;
    };
    SelectionService.prototype._selectLineAt = function (line) {
        var wrappedRange = this._bufferService.buffer.getWrappedRangeForLine(line);
        this._model.selectionStart = [0, wrappedRange.first];
        this._model.selectionEnd = [this._bufferService.cols, wrappedRange.last];
        this._model.selectionStartLength = 0;
    };
    SelectionService = __decorate([
        __param(2, Services_2.IBufferService),
        __param(3, Services_2.ICoreService),
        __param(4, Services_1.IMouseService),
        __param(5, Services_2.IOptionsService),
        __param(6, Services_1.IRenderService)
    ], SelectionService);
    return SelectionService;
}(Lifecycle_1.Disposable));
exports.SelectionService = SelectionService;


/***/ }),

/***/ "./out/browser/services/Services.js":
/*!******************************************!*\
  !*** ./out/browser/services/Services.js ***!
  \******************************************/
/*! flagged exports */
/*! export ICharSizeService [provided] [no usage info] [missing usage info prevents renaming] */
/*! export ICoreBrowserService [provided] [no usage info] [missing usage info prevents renaming] */
/*! export IMouseService [provided] [no usage info] [missing usage info prevents renaming] */
/*! export IRenderService [provided] [no usage info] [missing usage info prevents renaming] */
/*! export ISelectionService [provided] [no usage info] [missing usage info prevents renaming] */
/*! export ISoundService [provided] [no usage info] [missing usage info prevents renaming] */
/*! export __esModule [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_exports__, __webpack_require__ */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ISoundService = exports.ISelectionService = exports.IRenderService = exports.IMouseService = exports.ICoreBrowserService = exports.ICharSizeService = void 0;
var ServiceRegistry_1 = __webpack_require__(/*! common/services/ServiceRegistry */ "./out/common/services/ServiceRegistry.js");
exports.ICharSizeService = ServiceRegistry_1.createDecorator('CharSizeService');
exports.ICoreBrowserService = ServiceRegistry_1.createDecorator('CoreBrowserService');
exports.IMouseService = ServiceRegistry_1.createDecorator('MouseService');
exports.IRenderService = ServiceRegistry_1.createDecorator('RenderService');
exports.ISelectionService = ServiceRegistry_1.createDecorator('SelectionService');
exports.ISoundService = ServiceRegistry_1.createDecorator('SoundService');


/***/ }),

/***/ "./out/browser/services/SoundService.js":
/*!**********************************************!*\
  !*** ./out/browser/services/SoundService.js ***!
  \**********************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: top-level-this-exports, __webpack_exports__, __webpack_require__ */
/*! CommonJS bailout: this is used directly at 2:18-22 */
/*! CommonJS bailout: this is used directly at 8:15-19 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SoundService = void 0;
var Services_1 = __webpack_require__(/*! common/services/Services */ "./out/common/services/Services.js");
var SoundService = (function () {
    function SoundService(_optionsService) {
        this._optionsService = _optionsService;
    }
    Object.defineProperty(SoundService, "audioContext", {
        get: function () {
            if (!SoundService._audioContext) {
                var audioContextCtor = window.AudioContext || window.webkitAudioContext;
                if (!audioContextCtor) {
                    console.warn('Web Audio API is not supported by this browser. Consider upgrading to the latest version');
                    return null;
                }
                SoundService._audioContext = new audioContextCtor();
            }
            return SoundService._audioContext;
        },
        enumerable: false,
        configurable: true
    });
    SoundService.prototype.playBellSound = function () {
        var ctx = SoundService.audioContext;
        if (!ctx) {
            return;
        }
        var bellAudioSource = ctx.createBufferSource();
        ctx.decodeAudioData(this._base64ToArrayBuffer(this._removeMimeType(this._optionsService.options.bellSound)), function (buffer) {
            bellAudioSource.buffer = buffer;
            bellAudioSource.connect(ctx.destination);
            bellAudioSource.start(0);
        });
    };
    SoundService.prototype._base64ToArrayBuffer = function (base64) {
        var binaryString = window.atob(base64);
        var len = binaryString.length;
        var bytes = new Uint8Array(len);
        for (var i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    };
    SoundService.prototype._removeMimeType = function (dataURI) {
        var splitUri = dataURI.split(',');
        return splitUri[1];
    };
    SoundService = __decorate([
        __param(0, Services_1.IOptionsService)
    ], SoundService);
    return SoundService;
}());
exports.SoundService = SoundService;


/***/ }),

/***/ "./out/common/CircularList.js":
/*!************************************!*\
  !*** ./out/common/CircularList.js ***!
  \************************************/
/*! flagged exports */
/*! export CircularList [provided] [no usage info] [missing usage info prevents renaming] */
/*! export __esModule [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_exports__, __webpack_require__ */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CircularList = void 0;
var EventEmitter_1 = __webpack_require__(/*! common/EventEmitter */ "./out/common/EventEmitter.js");
var CircularList = (function () {
    function CircularList(_maxLength) {
        this._maxLength = _maxLength;
        this.onDeleteEmitter = new EventEmitter_1.EventEmitter();
        this.onInsertEmitter = new EventEmitter_1.EventEmitter();
        this.onTrimEmitter = new EventEmitter_1.EventEmitter();
        this._array = new Array(this._maxLength);
        this._startIndex = 0;
        this._length = 0;
    }
    Object.defineProperty(CircularList.prototype, "onDelete", {
        get: function () { return this.onDeleteEmitter.event; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CircularList.prototype, "onInsert", {
        get: function () { return this.onInsertEmitter.event; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CircularList.prototype, "onTrim", {
        get: function () { return this.onTrimEmitter.event; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CircularList.prototype, "maxLength", {
        get: function () {
            return this._maxLength;
        },
        set: function (newMaxLength) {
            if (this._maxLength === newMaxLength) {
                return;
            }
            var newArray = new Array(newMaxLength);
            for (var i = 0; i < Math.min(newMaxLength, this.length); i++) {
                newArray[i] = this._array[this._getCyclicIndex(i)];
            }
            this._array = newArray;
            this._maxLength = newMaxLength;
            this._startIndex = 0;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CircularList.prototype, "length", {
        get: function () {
            return this._length;
        },
        set: function (newLength) {
            if (newLength > this._length) {
                for (var i = this._length; i < newLength; i++) {
                    this._array[i] = undefined;
                }
            }
            this._length = newLength;
        },
        enumerable: false,
        configurable: true
    });
    CircularList.prototype.get = function (index) {
        return this._array[this._getCyclicIndex(index)];
    };
    CircularList.prototype.set = function (index, value) {
        this._array[this._getCyclicIndex(index)] = value;
    };
    CircularList.prototype.push = function (value) {
        this._array[this._getCyclicIndex(this._length)] = value;
        if (this._length === this._maxLength) {
            this._startIndex = ++this._startIndex % this._maxLength;
            this.onTrimEmitter.fire(1);
        }
        else {
            this._length++;
        }
    };
    CircularList.prototype.recycle = function () {
        if (this._length !== this._maxLength) {
            throw new Error('Can only recycle when the buffer is full');
        }
        this._startIndex = ++this._startIndex % this._maxLength;
        this.onTrimEmitter.fire(1);
        return this._array[this._getCyclicIndex(this._length - 1)];
    };
    Object.defineProperty(CircularList.prototype, "isFull", {
        get: function () {
            return this._length === this._maxLength;
        },
        enumerable: false,
        configurable: true
    });
    CircularList.prototype.pop = function () {
        return this._array[this._getCyclicIndex(this._length-- - 1)];
    };
    CircularList.prototype.splice = function (start, deleteCount) {
        var items = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            items[_i - 2] = arguments[_i];
        }
        if (deleteCount) {
            for (var i = start; i < this._length - deleteCount; i++) {
                this._array[this._getCyclicIndex(i)] = this._array[this._getCyclicIndex(i + deleteCount)];
            }
            this._length -= deleteCount;
            this.onDeleteEmitter.fire({ index: start, amount: deleteCount });
        }
        for (var i = this._length - 1; i >= start; i--) {
            this._array[this._getCyclicIndex(i + items.length)] = this._array[this._getCyclicIndex(i)];
        }
        for (var i = 0; i < items.length; i++) {
            this._array[this._getCyclicIndex(start + i)] = items[i];
        }
        if (items.length) {
            this.onInsertEmitter.fire({ index: start, amount: items.length });
        }
        if (this._length + items.length > this._maxLength) {
            var countToTrim = (this._length + items.length) - this._maxLength;
            this._startIndex += countToTrim;
            this._length = this._maxLength;
            this.onTrimEmitter.fire(countToTrim);
        }
        else {
            this._length += items.length;
        }
    };
    CircularList.prototype.trimStart = function (count) {
        if (count > this._length) {
            count = this._length;
        }
        this._startIndex += count;
        this._length -= count;
        this.onTrimEmitter.fire(count);
    };
    CircularList.prototype.shiftElements = function (start, count, offset) {
        if (count <= 0) {
            return;
        }
        if (start < 0 || start >= this._length) {
            throw new Error('start argument out of range');
        }
        if (start + offset < 0) {
            throw new Error('Cannot shift elements in list beyond index 0');
        }
        if (offset > 0) {
            for (var i = count - 1; i >= 0; i--) {
                this.set(start + i + offset, this.get(start + i));
            }
            var expandListBy = (start + count + offset) - this._length;
            if (expandListBy > 0) {
                this._length += expandListBy;
                while (this._length > this._maxLength) {
                    this._length--;
                    this._startIndex++;
                    this.onTrimEmitter.fire(1);
                }
            }
        }
        else {
            for (var i = 0; i < count; i++) {
                this.set(start + i + offset, this.get(start + i));
            }
        }
    };
    CircularList.prototype._getCyclicIndex = function (index) {
        return (this._startIndex + index) % this._maxLength;
    };
    return CircularList;
}());
exports.CircularList = CircularList;


/***/ }),

/***/ "./out/common/Clone.js":
/*!*****************************!*\
  !*** ./out/common/Clone.js ***!
  \*****************************/
/*! flagged exports */
/*! export __esModule [provided] [no usage info] [missing usage info prevents renaming] */
/*! export clone [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_exports__ */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.clone = void 0;
function clone(val, depth) {
    if (depth === void 0) { depth = 5; }
    if (typeof val !== 'object') {
        return val;
    }
    var clonedObject = Array.isArray(val) ? [] : {};
    for (var key in val) {
        clonedObject[key] = depth <= 1 ? val[key] : (val[key] ? clone(val[key], depth - 1) : val[key]);
    }
    return clonedObject;
}
exports.clone = clone;


/***/ }),

/***/ "./out/common/CoreTerminal.js":
/*!************************************!*\
  !*** ./out/common/CoreTerminal.js ***!
  \************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: top-level-this-exports, __webpack_exports__, __webpack_require__ */
/*! CommonJS bailout: this is used directly at 2:17-21 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CoreTerminal = void 0;
var Lifecycle_1 = __webpack_require__(/*! common/Lifecycle */ "./out/common/Lifecycle.js");
var Services_1 = __webpack_require__(/*! common/services/Services */ "./out/common/services/Services.js");
var InstantiationService_1 = __webpack_require__(/*! common/services/InstantiationService */ "./out/common/services/InstantiationService.js");
var LogService_1 = __webpack_require__(/*! common/services/LogService */ "./out/common/services/LogService.js");
var BufferService_1 = __webpack_require__(/*! common/services/BufferService */ "./out/common/services/BufferService.js");
var OptionsService_1 = __webpack_require__(/*! common/services/OptionsService */ "./out/common/services/OptionsService.js");
var CoreService_1 = __webpack_require__(/*! common/services/CoreService */ "./out/common/services/CoreService.js");
var EventEmitter_1 = __webpack_require__(/*! common/EventEmitter */ "./out/common/EventEmitter.js");
var CoreMouseService_1 = __webpack_require__(/*! common/services/CoreMouseService */ "./out/common/services/CoreMouseService.js");
var DirtyRowService_1 = __webpack_require__(/*! common/services/DirtyRowService */ "./out/common/services/DirtyRowService.js");
var UnicodeService_1 = __webpack_require__(/*! common/services/UnicodeService */ "./out/common/services/UnicodeService.js");
var CharsetService_1 = __webpack_require__(/*! common/services/CharsetService */ "./out/common/services/CharsetService.js");
var WindowsMode_1 = __webpack_require__(/*! common/WindowsMode */ "./out/common/WindowsMode.js");
var InputHandler_1 = __webpack_require__(/*! common/InputHandler */ "./out/common/InputHandler.js");
var WriteBuffer_1 = __webpack_require__(/*! common/input/WriteBuffer */ "./out/common/input/WriteBuffer.js");
var CoreTerminal = (function (_super) {
    __extends(CoreTerminal, _super);
    function CoreTerminal(options) {
        var _this = _super.call(this) || this;
        _this._onBinary = new EventEmitter_1.EventEmitter();
        _this._onData = new EventEmitter_1.EventEmitter();
        _this._onLineFeed = new EventEmitter_1.EventEmitter();
        _this._onResize = new EventEmitter_1.EventEmitter();
        _this._onScroll = new EventEmitter_1.EventEmitter();
        _this._instantiationService = new InstantiationService_1.InstantiationService();
        _this.optionsService = new OptionsService_1.OptionsService(options);
        _this._instantiationService.setService(Services_1.IOptionsService, _this.optionsService);
        _this._bufferService = _this.register(_this._instantiationService.createInstance(BufferService_1.BufferService));
        _this._instantiationService.setService(Services_1.IBufferService, _this._bufferService);
        _this._logService = _this._instantiationService.createInstance(LogService_1.LogService);
        _this._instantiationService.setService(Services_1.ILogService, _this._logService);
        _this._coreService = _this.register(_this._instantiationService.createInstance(CoreService_1.CoreService, function () { return _this.scrollToBottom(); }));
        _this._instantiationService.setService(Services_1.ICoreService, _this._coreService);
        _this._coreMouseService = _this._instantiationService.createInstance(CoreMouseService_1.CoreMouseService);
        _this._instantiationService.setService(Services_1.ICoreMouseService, _this._coreMouseService);
        _this._dirtyRowService = _this._instantiationService.createInstance(DirtyRowService_1.DirtyRowService);
        _this._instantiationService.setService(Services_1.IDirtyRowService, _this._dirtyRowService);
        _this.unicodeService = _this._instantiationService.createInstance(UnicodeService_1.UnicodeService);
        _this._instantiationService.setService(Services_1.IUnicodeService, _this.unicodeService);
        _this._charsetService = _this._instantiationService.createInstance(CharsetService_1.CharsetService);
        _this._instantiationService.setService(Services_1.ICharsetService, _this._charsetService);
        _this._inputHandler = new InputHandler_1.InputHandler(_this._bufferService, _this._charsetService, _this._coreService, _this._dirtyRowService, _this._logService, _this.optionsService, _this._coreMouseService, _this.unicodeService);
        _this.register(EventEmitter_1.forwardEvent(_this._inputHandler.onLineFeed, _this._onLineFeed));
        _this.register(_this._inputHandler);
        _this.register(EventEmitter_1.forwardEvent(_this._bufferService.onResize, _this._onResize));
        _this.register(EventEmitter_1.forwardEvent(_this._coreService.onData, _this._onData));
        _this.register(EventEmitter_1.forwardEvent(_this._coreService.onBinary, _this._onBinary));
        _this.register(_this.optionsService.onOptionChange(function (key) { return _this._updateOptions(key); }));
        _this._writeBuffer = new WriteBuffer_1.WriteBuffer(function (data) { return _this._inputHandler.parse(data); });
        return _this;
    }
    Object.defineProperty(CoreTerminal.prototype, "onBinary", {
        get: function () { return this._onBinary.event; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CoreTerminal.prototype, "onData", {
        get: function () { return this._onData.event; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CoreTerminal.prototype, "onLineFeed", {
        get: function () { return this._onLineFeed.event; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CoreTerminal.prototype, "onResize", {
        get: function () { return this._onResize.event; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CoreTerminal.prototype, "onScroll", {
        get: function () { return this._onScroll.event; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CoreTerminal.prototype, "cols", {
        get: function () { return this._bufferService.cols; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CoreTerminal.prototype, "rows", {
        get: function () { return this._bufferService.rows; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CoreTerminal.prototype, "buffers", {
        get: function () { return this._bufferService.buffers; },
        enumerable: false,
        configurable: true
    });
    CoreTerminal.prototype.dispose = function () {
        var _a;
        if (this._isDisposed) {
            return;
        }
        _super.prototype.dispose.call(this);
        (_a = this._windowsMode) === null || _a === void 0 ? void 0 : _a.dispose();
        this._windowsMode = undefined;
    };
    CoreTerminal.prototype.write = function (data, callback) {
        this._writeBuffer.write(data, callback);
    };
    CoreTerminal.prototype.writeSync = function (data) {
        this._writeBuffer.writeSync(data);
    };
    CoreTerminal.prototype.resize = function (x, y) {
        if (isNaN(x) || isNaN(y)) {
            return;
        }
        x = Math.max(x, BufferService_1.MINIMUM_COLS);
        y = Math.max(y, BufferService_1.MINIMUM_ROWS);
        this._bufferService.resize(x, y);
    };
    CoreTerminal.prototype.scroll = function (eraseAttr, isWrapped) {
        if (isWrapped === void 0) { isWrapped = false; }
        var buffer = this._bufferService.buffer;
        var newLine;
        newLine = this._cachedBlankLine;
        if (!newLine || newLine.length !== this.cols || newLine.getFg(0) !== eraseAttr.fg || newLine.getBg(0) !== eraseAttr.bg) {
            newLine = buffer.getBlankLine(eraseAttr, isWrapped);
            this._cachedBlankLine = newLine;
        }
        newLine.isWrapped = isWrapped;
        var topRow = buffer.ybase + buffer.scrollTop;
        var bottomRow = buffer.ybase + buffer.scrollBottom;
        if (buffer.scrollTop === 0) {
            var willBufferBeTrimmed = buffer.lines.isFull;
            if (bottomRow === buffer.lines.length - 1) {
                if (willBufferBeTrimmed) {
                    buffer.lines.recycle().copyFrom(newLine);
                }
                else {
                    buffer.lines.push(newLine.clone());
                }
            }
            else {
                buffer.lines.splice(bottomRow + 1, 0, newLine.clone());
            }
            if (!willBufferBeTrimmed) {
                buffer.ybase++;
                if (!this._bufferService.isUserScrolling) {
                    buffer.ydisp++;
                }
            }
            else {
                if (this._bufferService.isUserScrolling) {
                    buffer.ydisp = Math.max(buffer.ydisp - 1, 0);
                }
            }
        }
        else {
            var scrollRegionHeight = bottomRow - topRow + 1;
            buffer.lines.shiftElements(topRow + 1, scrollRegionHeight - 1, -1);
            buffer.lines.set(bottomRow, newLine.clone());
        }
        if (!this._bufferService.isUserScrolling) {
            buffer.ydisp = buffer.ybase;
        }
        this._dirtyRowService.markRangeDirty(buffer.scrollTop, buffer.scrollBottom);
        this._onScroll.fire(buffer.ydisp);
    };
    CoreTerminal.prototype.scrollLines = function (disp, suppressScrollEvent) {
        var buffer = this._bufferService.buffer;
        if (disp < 0) {
            if (buffer.ydisp === 0) {
                return;
            }
            this._bufferService.isUserScrolling = true;
        }
        else if (disp + buffer.ydisp >= buffer.ybase) {
            this._bufferService.isUserScrolling = false;
        }
        var oldYdisp = buffer.ydisp;
        buffer.ydisp = Math.max(Math.min(buffer.ydisp + disp, buffer.ybase), 0);
        if (oldYdisp === buffer.ydisp) {
            return;
        }
        if (!suppressScrollEvent) {
            this._onScroll.fire(buffer.ydisp);
        }
    };
    CoreTerminal.prototype.scrollPages = function (pageCount) {
        this.scrollLines(pageCount * (this.rows - 1));
    };
    CoreTerminal.prototype.scrollToTop = function () {
        this.scrollLines(-this._bufferService.buffer.ydisp);
    };
    CoreTerminal.prototype.scrollToBottom = function () {
        this.scrollLines(this._bufferService.buffer.ybase - this._bufferService.buffer.ydisp);
    };
    CoreTerminal.prototype.scrollToLine = function (line) {
        var scrollAmount = line - this._bufferService.buffer.ydisp;
        if (scrollAmount !== 0) {
            this.scrollLines(scrollAmount);
        }
    };
    CoreTerminal.prototype.addEscHandler = function (id, callback) {
        return this._inputHandler.addEscHandler(id, callback);
    };
    CoreTerminal.prototype.addDcsHandler = function (id, callback) {
        return this._inputHandler.addDcsHandler(id, callback);
    };
    CoreTerminal.prototype.addCsiHandler = function (id, callback) {
        return this._inputHandler.addCsiHandler(id, callback);
    };
    CoreTerminal.prototype.addOscHandler = function (ident, callback) {
        return this._inputHandler.addOscHandler(ident, callback);
    };
    CoreTerminal.prototype._setup = function () {
        if (this.optionsService.options.windowsMode) {
            this._enableWindowsMode();
        }
    };
    CoreTerminal.prototype.reset = function () {
        this._inputHandler.reset();
        this._bufferService.reset();
        this._charsetService.reset();
        this._coreService.reset();
        this._coreMouseService.reset();
    };
    CoreTerminal.prototype._updateOptions = function (key) {
        var _a;
        switch (key) {
            case 'scrollback':
                this.buffers.resize(this.cols, this.rows);
                break;
            case 'windowsMode':
                if (this.optionsService.options.windowsMode) {
                    this._enableWindowsMode();
                }
                else {
                    (_a = this._windowsMode) === null || _a === void 0 ? void 0 : _a.dispose();
                    this._windowsMode = undefined;
                }
                break;
        }
    };
    CoreTerminal.prototype._enableWindowsMode = function () {
        var _this = this;
        if (!this._windowsMode) {
            var disposables_1 = [];
            disposables_1.push(this.onLineFeed(WindowsMode_1.updateWindowsModeWrappedState.bind(null, this._bufferService)));
            disposables_1.push(this.addCsiHandler({ final: 'H' }, function () {
                WindowsMode_1.updateWindowsModeWrappedState(_this._bufferService);
                return false;
            }));
            this._windowsMode = {
                dispose: function () {
                    for (var _i = 0, disposables_2 = disposables_1; _i < disposables_2.length; _i++) {
                        var d = disposables_2[_i];
                        d.dispose();
                    }
                }
            };
        }
    };
    return CoreTerminal;
}(Lifecycle_1.Disposable));
exports.CoreTerminal = CoreTerminal;


/***/ }),

/***/ "./out/common/EventEmitter.js":
/*!************************************!*\
  !*** ./out/common/EventEmitter.js ***!
  \************************************/
/*! flagged exports */
/*! export EventEmitter [provided] [no usage info] [missing usage info prevents renaming] */
/*! export __esModule [provided] [no usage info] [missing usage info prevents renaming] */
/*! export forwardEvent [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_exports__ */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.forwardEvent = exports.EventEmitter = void 0;
var EventEmitter = (function () {
    function EventEmitter() {
        this._listeners = [];
        this._disposed = false;
    }
    Object.defineProperty(EventEmitter.prototype, "event", {
        get: function () {
            var _this = this;
            if (!this._event) {
                this._event = function (listener) {
                    _this._listeners.push(listener);
                    var disposable = {
                        dispose: function () {
                            if (!_this._disposed) {
                                for (var i = 0; i < _this._listeners.length; i++) {
                                    if (_this._listeners[i] === listener) {
                                        _this._listeners.splice(i, 1);
                                        return;
                                    }
                                }
                            }
                        }
                    };
                    return disposable;
                };
            }
            return this._event;
        },
        enumerable: false,
        configurable: true
    });
    EventEmitter.prototype.fire = function (arg1, arg2) {
        var queue = [];
        for (var i = 0; i < this._listeners.length; i++) {
            queue.push(this._listeners[i]);
        }
        for (var i = 0; i < queue.length; i++) {
            queue[i].call(undefined, arg1, arg2);
        }
    };
    EventEmitter.prototype.dispose = function () {
        if (this._listeners) {
            this._listeners.length = 0;
        }
        this._disposed = true;
    };
    return EventEmitter;
}());
exports.EventEmitter = EventEmitter;
function forwardEvent(from, to) {
    return from(function (e) { return to.fire(e); });
}
exports.forwardEvent = forwardEvent;


/***/ }),

/***/ "./out/common/InputHandler.js":
/*!************************************!*\
  !*** ./out/common/InputHandler.js ***!
  \************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: top-level-this-exports, __webpack_exports__, __webpack_require__ */
/*! CommonJS bailout: this is used directly at 2:17-21 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.InputHandler = exports.WindowsOptionsReportType = void 0;
var EscapeSequences_1 = __webpack_require__(/*! common/data/EscapeSequences */ "./out/common/data/EscapeSequences.js");
var Charsets_1 = __webpack_require__(/*! common/data/Charsets */ "./out/common/data/Charsets.js");
var EscapeSequenceParser_1 = __webpack_require__(/*! common/parser/EscapeSequenceParser */ "./out/common/parser/EscapeSequenceParser.js");
var Lifecycle_1 = __webpack_require__(/*! common/Lifecycle */ "./out/common/Lifecycle.js");
var TypedArrayUtils_1 = __webpack_require__(/*! common/TypedArrayUtils */ "./out/common/TypedArrayUtils.js");
var TextDecoder_1 = __webpack_require__(/*! common/input/TextDecoder */ "./out/common/input/TextDecoder.js");
var BufferLine_1 = __webpack_require__(/*! common/buffer/BufferLine */ "./out/common/buffer/BufferLine.js");
var EventEmitter_1 = __webpack_require__(/*! common/EventEmitter */ "./out/common/EventEmitter.js");
var Constants_1 = __webpack_require__(/*! common/buffer/Constants */ "./out/common/buffer/Constants.js");
var CellData_1 = __webpack_require__(/*! common/buffer/CellData */ "./out/common/buffer/CellData.js");
var AttributeData_1 = __webpack_require__(/*! common/buffer/AttributeData */ "./out/common/buffer/AttributeData.js");
var OscParser_1 = __webpack_require__(/*! common/parser/OscParser */ "./out/common/parser/OscParser.js");
var DcsParser_1 = __webpack_require__(/*! common/parser/DcsParser */ "./out/common/parser/DcsParser.js");
var GLEVEL = { '(': 0, ')': 1, '*': 2, '+': 3, '-': 1, '.': 2 };
var MAX_PARSEBUFFER_LENGTH = 131072;
var STACK_LIMIT = 10;
function paramToWindowOption(n, opts) {
    if (n > 24) {
        return opts.setWinLines || false;
    }
    switch (n) {
        case 1: return !!opts.restoreWin;
        case 2: return !!opts.minimizeWin;
        case 3: return !!opts.setWinPosition;
        case 4: return !!opts.setWinSizePixels;
        case 5: return !!opts.raiseWin;
        case 6: return !!opts.lowerWin;
        case 7: return !!opts.refreshWin;
        case 8: return !!opts.setWinSizeChars;
        case 9: return !!opts.maximizeWin;
        case 10: return !!opts.fullscreenWin;
        case 11: return !!opts.getWinState;
        case 13: return !!opts.getWinPosition;
        case 14: return !!opts.getWinSizePixels;
        case 15: return !!opts.getScreenSizePixels;
        case 16: return !!opts.getCellSizePixels;
        case 18: return !!opts.getWinSizeChars;
        case 19: return !!opts.getScreenSizeChars;
        case 20: return !!opts.getIconTitle;
        case 21: return !!opts.getWinTitle;
        case 22: return !!opts.pushTitle;
        case 23: return !!opts.popTitle;
        case 24: return !!opts.setWinLines;
    }
    return false;
}
var WindowsOptionsReportType;
(function (WindowsOptionsReportType) {
    WindowsOptionsReportType[WindowsOptionsReportType["GET_WIN_SIZE_PIXELS"] = 0] = "GET_WIN_SIZE_PIXELS";
    WindowsOptionsReportType[WindowsOptionsReportType["GET_CELL_SIZE_PIXELS"] = 1] = "GET_CELL_SIZE_PIXELS";
})(WindowsOptionsReportType = exports.WindowsOptionsReportType || (exports.WindowsOptionsReportType = {}));
var DECRQSS = (function () {
    function DECRQSS(_bufferService, _coreService, _logService, _optionsService) {
        this._bufferService = _bufferService;
        this._coreService = _coreService;
        this._logService = _logService;
        this._optionsService = _optionsService;
        this._data = new Uint32Array(0);
    }
    DECRQSS.prototype.hook = function (params) {
        this._data = new Uint32Array(0);
    };
    DECRQSS.prototype.put = function (data, start, end) {
        this._data = TypedArrayUtils_1.concat(this._data, data.subarray(start, end));
    };
    DECRQSS.prototype.unhook = function (success) {
        if (!success) {
            this._data = new Uint32Array(0);
            return true;
        }
        var data = TextDecoder_1.utf32ToString(this._data);
        this._data = new Uint32Array(0);
        switch (data) {
            case '"q':
                this._coreService.triggerDataEvent(EscapeSequences_1.C0.ESC + "P1$r0\"q" + EscapeSequences_1.C0.ESC + "\\");
                break;
            case '"p':
                this._coreService.triggerDataEvent(EscapeSequences_1.C0.ESC + "P1$r61;1\"p" + EscapeSequences_1.C0.ESC + "\\");
                break;
            case 'r':
                var pt = '' + (this._bufferService.buffer.scrollTop + 1) +
                    ';' + (this._bufferService.buffer.scrollBottom + 1) + 'r';
                this._coreService.triggerDataEvent(EscapeSequences_1.C0.ESC + "P1$r" + pt + EscapeSequences_1.C0.ESC + "\\");
                break;
            case 'm':
                this._coreService.triggerDataEvent(EscapeSequences_1.C0.ESC + "P1$r0m" + EscapeSequences_1.C0.ESC + "\\");
                break;
            case ' q':
                var STYLES = { 'block': 2, 'underline': 4, 'bar': 6 };
                var style = STYLES[this._optionsService.options.cursorStyle];
                style -= this._optionsService.options.cursorBlink ? 1 : 0;
                this._coreService.triggerDataEvent(EscapeSequences_1.C0.ESC + "P1$r" + style + " q" + EscapeSequences_1.C0.ESC + "\\");
                break;
            default:
                this._logService.debug('Unknown DCS $q %s', data);
                this._coreService.triggerDataEvent(EscapeSequences_1.C0.ESC + "P0$r" + EscapeSequences_1.C0.ESC + "\\");
        }
        return true;
    };
    return DECRQSS;
}());
var InputHandler = (function (_super) {
    __extends(InputHandler, _super);
    function InputHandler(_bufferService, _charsetService, _coreService, _dirtyRowService, _logService, _optionsService, _coreMouseService, _unicodeService, _parser) {
        if (_parser === void 0) { _parser = new EscapeSequenceParser_1.EscapeSequenceParser(); }
        var _this = _super.call(this) || this;
        _this._bufferService = _bufferService;
        _this._charsetService = _charsetService;
        _this._coreService = _coreService;
        _this._dirtyRowService = _dirtyRowService;
        _this._logService = _logService;
        _this._optionsService = _optionsService;
        _this._coreMouseService = _coreMouseService;
        _this._unicodeService = _unicodeService;
        _this._parser = _parser;
        _this._parseBuffer = new Uint32Array(4096);
        _this._stringDecoder = new TextDecoder_1.StringToUtf32();
        _this._utf8Decoder = new TextDecoder_1.Utf8ToUtf32();
        _this._workCell = new CellData_1.CellData();
        _this._windowTitle = '';
        _this._iconName = '';
        _this._windowTitleStack = [];
        _this._iconNameStack = [];
        _this._curAttrData = BufferLine_1.DEFAULT_ATTR_DATA.clone();
        _this._eraseAttrDataInternal = BufferLine_1.DEFAULT_ATTR_DATA.clone();
        _this._onRequestBell = new EventEmitter_1.EventEmitter();
        _this._onRequestRefreshRows = new EventEmitter_1.EventEmitter();
        _this._onRequestReset = new EventEmitter_1.EventEmitter();
        _this._onRequestScroll = new EventEmitter_1.EventEmitter();
        _this._onRequestSyncScrollBar = new EventEmitter_1.EventEmitter();
        _this._onRequestWindowsOptionsReport = new EventEmitter_1.EventEmitter();
        _this._onA11yChar = new EventEmitter_1.EventEmitter();
        _this._onA11yTab = new EventEmitter_1.EventEmitter();
        _this._onCursorMove = new EventEmitter_1.EventEmitter();
        _this._onLineFeed = new EventEmitter_1.EventEmitter();
        _this._onScroll = new EventEmitter_1.EventEmitter();
        _this._onTitleChange = new EventEmitter_1.EventEmitter();
        _this._onAnsiColorChange = new EventEmitter_1.EventEmitter();
        _this.register(_this._parser);
        _this._parser.setCsiHandlerFallback(function (ident, params) {
            _this._logService.debug('Unknown CSI code: ', { identifier: _this._parser.identToString(ident), params: params.toArray() });
        });
        _this._parser.setEscHandlerFallback(function (ident) {
            _this._logService.debug('Unknown ESC code: ', { identifier: _this._parser.identToString(ident) });
        });
        _this._parser.setExecuteHandlerFallback(function (code) {
            _this._logService.debug('Unknown EXECUTE code: ', { code: code });
        });
        _this._parser.setOscHandlerFallback(function (identifier, action, data) {
            _this._logService.debug('Unknown OSC code: ', { identifier: identifier, action: action, data: data });
        });
        _this._parser.setDcsHandlerFallback(function (ident, action, payload) {
            if (action === 'HOOK') {
                payload = payload.toArray();
            }
            _this._logService.debug('Unknown DCS code: ', { identifier: _this._parser.identToString(ident), action: action, payload: payload });
        });
        _this._parser.setPrintHandler(function (data, start, end) { return _this.print(data, start, end); });
        _this._parser.registerCsiHandler({ final: '@' }, function (params) { return _this.insertChars(params); });
        _this._parser.registerCsiHandler({ intermediates: ' ', final: '@' }, function (params) { return _this.scrollLeft(params); });
        _this._parser.registerCsiHandler({ final: 'A' }, function (params) { return _this.cursorUp(params); });
        _this._parser.registerCsiHandler({ intermediates: ' ', final: 'A' }, function (params) { return _this.scrollRight(params); });
        _this._parser.registerCsiHandler({ final: 'B' }, function (params) { return _this.cursorDown(params); });
        _this._parser.registerCsiHandler({ final: 'C' }, function (params) { return _this.cursorForward(params); });
        _this._parser.registerCsiHandler({ final: 'D' }, function (params) { return _this.cursorBackward(params); });
        _this._parser.registerCsiHandler({ final: 'E' }, function (params) { return _this.cursorNextLine(params); });
        _this._parser.registerCsiHandler({ final: 'F' }, function (params) { return _this.cursorPrecedingLine(params); });
        _this._parser.registerCsiHandler({ final: 'G' }, function (params) { return _this.cursorCharAbsolute(params); });
        _this._parser.registerCsiHandler({ final: 'H' }, function (params) { return _this.cursorPosition(params); });
        _this._parser.registerCsiHandler({ final: 'I' }, function (params) { return _this.cursorForwardTab(params); });
        _this._parser.registerCsiHandler({ final: 'J' }, function (params) { return _this.eraseInDisplay(params); });
        _this._parser.registerCsiHandler({ prefix: '?', final: 'J' }, function (params) { return _this.eraseInDisplay(params); });
        _this._parser.registerCsiHandler({ final: 'K' }, function (params) { return _this.eraseInLine(params); });
        _this._parser.registerCsiHandler({ prefix: '?', final: 'K' }, function (params) { return _this.eraseInLine(params); });
        _this._parser.registerCsiHandler({ final: 'L' }, function (params) { return _this.insertLines(params); });
        _this._parser.registerCsiHandler({ final: 'M' }, function (params) { return _this.deleteLines(params); });
        _this._parser.registerCsiHandler({ final: 'P' }, function (params) { return _this.deleteChars(params); });
        _this._parser.registerCsiHandler({ final: 'S' }, function (params) { return _this.scrollUp(params); });
        _this._parser.registerCsiHandler({ final: 'T' }, function (params) { return _this.scrollDown(params); });
        _this._parser.registerCsiHandler({ final: 'X' }, function (params) { return _this.eraseChars(params); });
        _this._parser.registerCsiHandler({ final: 'Z' }, function (params) { return _this.cursorBackwardTab(params); });
        _this._parser.registerCsiHandler({ final: '`' }, function (params) { return _this.charPosAbsolute(params); });
        _this._parser.registerCsiHandler({ final: 'a' }, function (params) { return _this.hPositionRelative(params); });
        _this._parser.registerCsiHandler({ final: 'b' }, function (params) { return _this.repeatPrecedingCharacter(params); });
        _this._parser.registerCsiHandler({ final: 'c' }, function (params) { return _this.sendDeviceAttributesPrimary(params); });
        _this._parser.registerCsiHandler({ prefix: '>', final: 'c' }, function (params) { return _this.sendDeviceAttributesSecondary(params); });
        _this._parser.registerCsiHandler({ final: 'd' }, function (params) { return _this.linePosAbsolute(params); });
        _this._parser.registerCsiHandler({ final: 'e' }, function (params) { return _this.vPositionRelative(params); });
        _this._parser.registerCsiHandler({ final: 'f' }, function (params) { return _this.hVPosition(params); });
        _this._parser.registerCsiHandler({ final: 'g' }, function (params) { return _this.tabClear(params); });
        _this._parser.registerCsiHandler({ final: 'h' }, function (params) { return _this.setMode(params); });
        _this._parser.registerCsiHandler({ prefix: '?', final: 'h' }, function (params) { return _this.setModePrivate(params); });
        _this._parser.registerCsiHandler({ final: 'l' }, function (params) { return _this.resetMode(params); });
        _this._parser.registerCsiHandler({ prefix: '?', final: 'l' }, function (params) { return _this.resetModePrivate(params); });
        _this._parser.registerCsiHandler({ final: 'm' }, function (params) { return _this.charAttributes(params); });
        _this._parser.registerCsiHandler({ final: 'n' }, function (params) { return _this.deviceStatus(params); });
        _this._parser.registerCsiHandler({ prefix: '?', final: 'n' }, function (params) { return _this.deviceStatusPrivate(params); });
        _this._parser.registerCsiHandler({ intermediates: '!', final: 'p' }, function (params) { return _this.softReset(params); });
        _this._parser.registerCsiHandler({ intermediates: ' ', final: 'q' }, function (params) { return _this.setCursorStyle(params); });
        _this._parser.registerCsiHandler({ final: 'r' }, function (params) { return _this.setScrollRegion(params); });
        _this._parser.registerCsiHandler({ final: 's' }, function (params) { return _this.saveCursor(params); });
        _this._parser.registerCsiHandler({ final: 't' }, function (params) { return _this.windowOptions(params); });
        _this._parser.registerCsiHandler({ final: 'u' }, function (params) { return _this.restoreCursor(params); });
        _this._parser.registerCsiHandler({ intermediates: '\'', final: '}' }, function (params) { return _this.insertColumns(params); });
        _this._parser.registerCsiHandler({ intermediates: '\'', final: '~' }, function (params) { return _this.deleteColumns(params); });
        _this._parser.setExecuteHandler(EscapeSequences_1.C0.BEL, function () { return _this.bell(); });
        _this._parser.setExecuteHandler(EscapeSequences_1.C0.LF, function () { return _this.lineFeed(); });
        _this._parser.setExecuteHandler(EscapeSequences_1.C0.VT, function () { return _this.lineFeed(); });
        _this._parser.setExecuteHandler(EscapeSequences_1.C0.FF, function () { return _this.lineFeed(); });
        _this._parser.setExecuteHandler(EscapeSequences_1.C0.CR, function () { return _this.carriageReturn(); });
        _this._parser.setExecuteHandler(EscapeSequences_1.C0.BS, function () { return _this.backspace(); });
        _this._parser.setExecuteHandler(EscapeSequences_1.C0.HT, function () { return _this.tab(); });
        _this._parser.setExecuteHandler(EscapeSequences_1.C0.SO, function () { return _this.shiftOut(); });
        _this._parser.setExecuteHandler(EscapeSequences_1.C0.SI, function () { return _this.shiftIn(); });
        _this._parser.setExecuteHandler(EscapeSequences_1.C1.IND, function () { return _this.index(); });
        _this._parser.setExecuteHandler(EscapeSequences_1.C1.NEL, function () { return _this.nextLine(); });
        _this._parser.setExecuteHandler(EscapeSequences_1.C1.HTS, function () { return _this.tabSet(); });
        _this._parser.registerOscHandler(0, new OscParser_1.OscHandler(function (data) { _this.setTitle(data); _this.setIconName(data); return true; }));
        _this._parser.registerOscHandler(1, new OscParser_1.OscHandler(function (data) { return _this.setIconName(data); }));
        _this._parser.registerOscHandler(2, new OscParser_1.OscHandler(function (data) { return _this.setTitle(data); }));
        _this._parser.registerOscHandler(4, new OscParser_1.OscHandler(function (data) { return _this.setAnsiColor(data); }));
        _this._parser.registerEscHandler({ final: '7' }, function () { return _this.saveCursor(); });
        _this._parser.registerEscHandler({ final: '8' }, function () { return _this.restoreCursor(); });
        _this._parser.registerEscHandler({ final: 'D' }, function () { return _this.index(); });
        _this._parser.registerEscHandler({ final: 'E' }, function () { return _this.nextLine(); });
        _this._parser.registerEscHandler({ final: 'H' }, function () { return _this.tabSet(); });
        _this._parser.registerEscHandler({ final: 'M' }, function () { return _this.reverseIndex(); });
        _this._parser.registerEscHandler({ final: '=' }, function () { return _this.keypadApplicationMode(); });
        _this._parser.registerEscHandler({ final: '>' }, function () { return _this.keypadNumericMode(); });
        _this._parser.registerEscHandler({ final: 'c' }, function () { return _this.fullReset(); });
        _this._parser.registerEscHandler({ final: 'n' }, function () { return _this.setgLevel(2); });
        _this._parser.registerEscHandler({ final: 'o' }, function () { return _this.setgLevel(3); });
        _this._parser.registerEscHandler({ final: '|' }, function () { return _this.setgLevel(3); });
        _this._parser.registerEscHandler({ final: '}' }, function () { return _this.setgLevel(2); });
        _this._parser.registerEscHandler({ final: '~' }, function () { return _this.setgLevel(1); });
        _this._parser.registerEscHandler({ intermediates: '%', final: '@' }, function () { return _this.selectDefaultCharset(); });
        _this._parser.registerEscHandler({ intermediates: '%', final: 'G' }, function () { return _this.selectDefaultCharset(); });
        var _loop_1 = function (flag) {
            this_1._parser.registerEscHandler({ intermediates: '(', final: flag }, function () { return _this.selectCharset('(' + flag); });
            this_1._parser.registerEscHandler({ intermediates: ')', final: flag }, function () { return _this.selectCharset(')' + flag); });
            this_1._parser.registerEscHandler({ intermediates: '*', final: flag }, function () { return _this.selectCharset('*' + flag); });
            this_1._parser.registerEscHandler({ intermediates: '+', final: flag }, function () { return _this.selectCharset('+' + flag); });
            this_1._parser.registerEscHandler({ intermediates: '-', final: flag }, function () { return _this.selectCharset('-' + flag); });
            this_1._parser.registerEscHandler({ intermediates: '.', final: flag }, function () { return _this.selectCharset('.' + flag); });
            this_1._parser.registerEscHandler({ intermediates: '/', final: flag }, function () { return _this.selectCharset('/' + flag); });
        };
        var this_1 = this;
        for (var flag in Charsets_1.CHARSETS) {
            _loop_1(flag);
        }
        _this._parser.registerEscHandler({ intermediates: '#', final: '8' }, function () { return _this.screenAlignmentPattern(); });
        _this._parser.setErrorHandler(function (state) {
            _this._logService.error('Parsing error: ', state);
            return state;
        });
        _this._parser.registerDcsHandler({ intermediates: '$', final: 'q' }, new DECRQSS(_this._bufferService, _this._coreService, _this._logService, _this._optionsService));
        return _this;
    }
    Object.defineProperty(InputHandler.prototype, "onRequestBell", {
        get: function () { return this._onRequestBell.event; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(InputHandler.prototype, "onRequestRefreshRows", {
        get: function () { return this._onRequestRefreshRows.event; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(InputHandler.prototype, "onRequestReset", {
        get: function () { return this._onRequestReset.event; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(InputHandler.prototype, "onRequestScroll", {
        get: function () { return this._onRequestScroll.event; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(InputHandler.prototype, "onRequestSyncScrollBar", {
        get: function () { return this._onRequestSyncScrollBar.event; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(InputHandler.prototype, "onRequestWindowsOptionsReport", {
        get: function () { return this._onRequestWindowsOptionsReport.event; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(InputHandler.prototype, "onA11yChar", {
        get: function () { return this._onA11yChar.event; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(InputHandler.prototype, "onA11yTab", {
        get: function () { return this._onA11yTab.event; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(InputHandler.prototype, "onCursorMove", {
        get: function () { return this._onCursorMove.event; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(InputHandler.prototype, "onLineFeed", {
        get: function () { return this._onLineFeed.event; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(InputHandler.prototype, "onScroll", {
        get: function () { return this._onScroll.event; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(InputHandler.prototype, "onTitleChange", {
        get: function () { return this._onTitleChange.event; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(InputHandler.prototype, "onAnsiColorChange", {
        get: function () { return this._onAnsiColorChange.event; },
        enumerable: false,
        configurable: true
    });
    InputHandler.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
    };
    InputHandler.prototype.parse = function (data) {
        var buffer = this._bufferService.buffer;
        var cursorStartX = buffer.x;
        var cursorStartY = buffer.y;
        this._logService.debug('parsing data', data);
        if (this._parseBuffer.length < data.length) {
            if (this._parseBuffer.length < MAX_PARSEBUFFER_LENGTH) {
                this._parseBuffer = new Uint32Array(Math.min(data.length, MAX_PARSEBUFFER_LENGTH));
            }
        }
        this._dirtyRowService.clearRange();
        if (data.length > MAX_PARSEBUFFER_LENGTH) {
            for (var i = 0; i < data.length; i += MAX_PARSEBUFFER_LENGTH) {
                var end = i + MAX_PARSEBUFFER_LENGTH < data.length ? i + MAX_PARSEBUFFER_LENGTH : data.length;
                var len = (typeof data === 'string')
                    ? this._stringDecoder.decode(data.substring(i, end), this._parseBuffer)
                    : this._utf8Decoder.decode(data.subarray(i, end), this._parseBuffer);
                this._parser.parse(this._parseBuffer, len);
            }
        }
        else {
            var len = (typeof data === 'string')
                ? this._stringDecoder.decode(data, this._parseBuffer)
                : this._utf8Decoder.decode(data, this._parseBuffer);
            this._parser.parse(this._parseBuffer, len);
        }
        buffer = this._bufferService.buffer;
        if (buffer.x !== cursorStartX || buffer.y !== cursorStartY) {
            this._onCursorMove.fire();
        }
        this._onRequestRefreshRows.fire(this._dirtyRowService.start, this._dirtyRowService.end);
    };
    InputHandler.prototype.print = function (data, start, end) {
        var code;
        var chWidth;
        var buffer = this._bufferService.buffer;
        var charset = this._charsetService.charset;
        var screenReaderMode = this._optionsService.options.screenReaderMode;
        var cols = this._bufferService.cols;
        var wraparoundMode = this._coreService.decPrivateModes.wraparound;
        var insertMode = this._coreService.modes.insertMode;
        var curAttr = this._curAttrData;
        var bufferRow = buffer.lines.get(buffer.ybase + buffer.y);
        this._dirtyRowService.markDirty(buffer.y);
        if (buffer.x && end - start > 0 && bufferRow.getWidth(buffer.x - 1) === 2) {
            bufferRow.setCellFromCodePoint(buffer.x - 1, 0, 1, curAttr.fg, curAttr.bg, curAttr.extended);
        }
        for (var pos = start; pos < end; ++pos) {
            code = data[pos];
            chWidth = this._unicodeService.wcwidth(code);
            if (code < 127 && charset) {
                var ch = charset[String.fromCharCode(code)];
                if (ch) {
                    code = ch.charCodeAt(0);
                }
            }
            if (screenReaderMode) {
                this._onA11yChar.fire(TextDecoder_1.stringFromCodePoint(code));
            }
            if (!chWidth && buffer.x) {
                if (!bufferRow.getWidth(buffer.x - 1)) {
                    bufferRow.addCodepointToCell(buffer.x - 2, code);
                }
                else {
                    bufferRow.addCodepointToCell(buffer.x - 1, code);
                }
                continue;
            }
            if (buffer.x + chWidth - 1 >= cols) {
                if (wraparoundMode) {
                    while (buffer.x < cols) {
                        bufferRow.setCellFromCodePoint(buffer.x++, 0, 1, curAttr.fg, curAttr.bg, curAttr.extended);
                    }
                    buffer.x = 0;
                    buffer.y++;
                    if (buffer.y === buffer.scrollBottom + 1) {
                        buffer.y--;
                        this._onRequestScroll.fire(this._eraseAttrData(), true);
                    }
                    else {
                        if (buffer.y >= this._bufferService.rows) {
                            buffer.y = this._bufferService.rows - 1;
                        }
                        buffer.lines.get(buffer.ybase + buffer.y).isWrapped = true;
                    }
                    bufferRow = buffer.lines.get(buffer.ybase + buffer.y);
                }
                else {
                    buffer.x = cols - 1;
                    if (chWidth === 2) {
                        continue;
                    }
                }
            }
            if (insertMode) {
                bufferRow.insertCells(buffer.x, chWidth, buffer.getNullCell(curAttr), curAttr);
                if (bufferRow.getWidth(cols - 1) === 2) {
                    bufferRow.setCellFromCodePoint(cols - 1, Constants_1.NULL_CELL_CODE, Constants_1.NULL_CELL_WIDTH, curAttr.fg, curAttr.bg, curAttr.extended);
                }
            }
            bufferRow.setCellFromCodePoint(buffer.x++, code, chWidth, curAttr.fg, curAttr.bg, curAttr.extended);
            if (chWidth > 0) {
                while (--chWidth) {
                    bufferRow.setCellFromCodePoint(buffer.x++, 0, 0, curAttr.fg, curAttr.bg, curAttr.extended);
                }
            }
        }
        if (end - start > 0) {
            bufferRow.loadCell(buffer.x - 1, this._workCell);
            if (this._workCell.getWidth() === 2 || this._workCell.getCode() > 0xFFFF) {
                this._parser.precedingCodepoint = 0;
            }
            else if (this._workCell.isCombined()) {
                this._parser.precedingCodepoint = this._workCell.getChars().charCodeAt(0);
            }
            else {
                this._parser.precedingCodepoint = this._workCell.content;
            }
        }
        if (buffer.x < cols && end - start > 0 && bufferRow.getWidth(buffer.x) === 0 && !bufferRow.hasContent(buffer.x)) {
            bufferRow.setCellFromCodePoint(buffer.x, 0, 1, curAttr.fg, curAttr.bg, curAttr.extended);
        }
        this._dirtyRowService.markDirty(buffer.y);
    };
    InputHandler.prototype.addCsiHandler = function (id, callback) {
        var _this = this;
        if (id.final === 't' && !id.prefix && !id.intermediates) {
            return this._parser.registerCsiHandler(id, function (params) {
                if (!paramToWindowOption(params.params[0], _this._optionsService.options.windowOptions)) {
                    return true;
                }
                return callback(params);
            });
        }
        return this._parser.registerCsiHandler(id, callback);
    };
    InputHandler.prototype.addDcsHandler = function (id, callback) {
        return this._parser.registerDcsHandler(id, new DcsParser_1.DcsHandler(callback));
    };
    InputHandler.prototype.addEscHandler = function (id, callback) {
        return this._parser.registerEscHandler(id, callback);
    };
    InputHandler.prototype.addOscHandler = function (ident, callback) {
        return this._parser.registerOscHandler(ident, new OscParser_1.OscHandler(callback));
    };
    InputHandler.prototype.bell = function () {
        this._onRequestBell.fire();
        return true;
    };
    InputHandler.prototype.lineFeed = function () {
        var buffer = this._bufferService.buffer;
        this._dirtyRowService.markDirty(buffer.y);
        if (this._optionsService.options.convertEol) {
            buffer.x = 0;
        }
        buffer.y++;
        if (buffer.y === buffer.scrollBottom + 1) {
            buffer.y--;
            this._onRequestScroll.fire(this._eraseAttrData());
        }
        else if (buffer.y >= this._bufferService.rows) {
            buffer.y = this._bufferService.rows - 1;
        }
        if (buffer.x >= this._bufferService.cols) {
            buffer.x--;
        }
        this._dirtyRowService.markDirty(buffer.y);
        this._onLineFeed.fire();
        return true;
    };
    InputHandler.prototype.carriageReturn = function () {
        this._bufferService.buffer.x = 0;
        return true;
    };
    InputHandler.prototype.backspace = function () {
        var _a;
        var buffer = this._bufferService.buffer;
        if (!this._coreService.decPrivateModes.reverseWraparound) {
            this._restrictCursor();
            if (buffer.x > 0) {
                buffer.x--;
            }
            return true;
        }
        this._restrictCursor(this._bufferService.cols);
        if (buffer.x > 0) {
            buffer.x--;
        }
        else {
            if (buffer.x === 0
                && buffer.y > buffer.scrollTop
                && buffer.y <= buffer.scrollBottom
                && ((_a = buffer.lines.get(buffer.ybase + buffer.y)) === null || _a === void 0 ? void 0 : _a.isWrapped)) {
                buffer.lines.get(buffer.ybase + buffer.y).isWrapped = false;
                buffer.y--;
                buffer.x = this._bufferService.cols - 1;
                var line = buffer.lines.get(buffer.ybase + buffer.y);
                if (line.hasWidth(buffer.x) && !line.hasContent(buffer.x)) {
                    buffer.x--;
                }
            }
        }
        this._restrictCursor();
        return true;
    };
    InputHandler.prototype.tab = function () {
        if (this._bufferService.buffer.x >= this._bufferService.cols) {
            return true;
        }
        var originalX = this._bufferService.buffer.x;
        this._bufferService.buffer.x = this._bufferService.buffer.nextStop();
        if (this._optionsService.options.screenReaderMode) {
            this._onA11yTab.fire(this._bufferService.buffer.x - originalX);
        }
        return true;
    };
    InputHandler.prototype.shiftOut = function () {
        this._charsetService.setgLevel(1);
        return true;
    };
    InputHandler.prototype.shiftIn = function () {
        this._charsetService.setgLevel(0);
        return true;
    };
    InputHandler.prototype._restrictCursor = function (maxCol) {
        if (maxCol === void 0) { maxCol = this._bufferService.cols - 1; }
        this._bufferService.buffer.x = Math.min(maxCol, Math.max(0, this._bufferService.buffer.x));
        this._bufferService.buffer.y = this._coreService.decPrivateModes.origin
            ? Math.min(this._bufferService.buffer.scrollBottom, Math.max(this._bufferService.buffer.scrollTop, this._bufferService.buffer.y))
            : Math.min(this._bufferService.rows - 1, Math.max(0, this._bufferService.buffer.y));
        this._dirtyRowService.markDirty(this._bufferService.buffer.y);
    };
    InputHandler.prototype._setCursor = function (x, y) {
        this._dirtyRowService.markDirty(this._bufferService.buffer.y);
        if (this._coreService.decPrivateModes.origin) {
            this._bufferService.buffer.x = x;
            this._bufferService.buffer.y = this._bufferService.buffer.scrollTop + y;
        }
        else {
            this._bufferService.buffer.x = x;
            this._bufferService.buffer.y = y;
        }
        this._restrictCursor();
        this._dirtyRowService.markDirty(this._bufferService.buffer.y);
    };
    InputHandler.prototype._moveCursor = function (x, y) {
        this._restrictCursor();
        this._setCursor(this._bufferService.buffer.x + x, this._bufferService.buffer.y + y);
    };
    InputHandler.prototype.cursorUp = function (params) {
        var diffToTop = this._bufferService.buffer.y - this._bufferService.buffer.scrollTop;
        if (diffToTop >= 0) {
            this._moveCursor(0, -Math.min(diffToTop, params.params[0] || 1));
        }
        else {
            this._moveCursor(0, -(params.params[0] || 1));
        }
        return true;
    };
    InputHandler.prototype.cursorDown = function (params) {
        var diffToBottom = this._bufferService.buffer.scrollBottom - this._bufferService.buffer.y;
        if (diffToBottom >= 0) {
            this._moveCursor(0, Math.min(diffToBottom, params.params[0] || 1));
        }
        else {
            this._moveCursor(0, params.params[0] || 1);
        }
        return true;
    };
    InputHandler.prototype.cursorForward = function (params) {
        this._moveCursor(params.params[0] || 1, 0);
        return true;
    };
    InputHandler.prototype.cursorBackward = function (params) {
        this._moveCursor(-(params.params[0] || 1), 0);
        return true;
    };
    InputHandler.prototype.cursorNextLine = function (params) {
        this.cursorDown(params);
        this._bufferService.buffer.x = 0;
        return true;
    };
    InputHandler.prototype.cursorPrecedingLine = function (params) {
        this.cursorUp(params);
        this._bufferService.buffer.x = 0;
        return true;
    };
    InputHandler.prototype.cursorCharAbsolute = function (params) {
        this._setCursor((params.params[0] || 1) - 1, this._bufferService.buffer.y);
        return true;
    };
    InputHandler.prototype.cursorPosition = function (params) {
        this._setCursor((params.length >= 2) ? (params.params[1] || 1) - 1 : 0, (params.params[0] || 1) - 1);
        return true;
    };
    InputHandler.prototype.charPosAbsolute = function (params) {
        this._setCursor((params.params[0] || 1) - 1, this._bufferService.buffer.y);
        return true;
    };
    InputHandler.prototype.hPositionRelative = function (params) {
        this._moveCursor(params.params[0] || 1, 0);
        return true;
    };
    InputHandler.prototype.linePosAbsolute = function (params) {
        this._setCursor(this._bufferService.buffer.x, (params.params[0] || 1) - 1);
        return true;
    };
    InputHandler.prototype.vPositionRelative = function (params) {
        this._moveCursor(0, params.params[0] || 1);
        return true;
    };
    InputHandler.prototype.hVPosition = function (params) {
        this.cursorPosition(params);
        return true;
    };
    InputHandler.prototype.tabClear = function (params) {
        var param = params.params[0];
        if (param === 0) {
            delete this._bufferService.buffer.tabs[this._bufferService.buffer.x];
        }
        else if (param === 3) {
            this._bufferService.buffer.tabs = {};
        }
        return true;
    };
    InputHandler.prototype.cursorForwardTab = function (params) {
        if (this._bufferService.buffer.x >= this._bufferService.cols) {
            return true;
        }
        var param = params.params[0] || 1;
        while (param--) {
            this._bufferService.buffer.x = this._bufferService.buffer.nextStop();
        }
        return true;
    };
    InputHandler.prototype.cursorBackwardTab = function (params) {
        if (this._bufferService.buffer.x >= this._bufferService.cols) {
            return true;
        }
        var param = params.params[0] || 1;
        var buffer = this._bufferService.buffer;
        while (param--) {
            buffer.x = buffer.prevStop();
        }
        return true;
    };
    InputHandler.prototype._eraseInBufferLine = function (y, start, end, clearWrap) {
        if (clearWrap === void 0) { clearWrap = false; }
        var line = this._bufferService.buffer.lines.get(this._bufferService.buffer.ybase + y);
        line.replaceCells(start, end, this._bufferService.buffer.getNullCell(this._eraseAttrData()), this._eraseAttrData());
        if (clearWrap) {
            line.isWrapped = false;
        }
    };
    InputHandler.prototype._resetBufferLine = function (y) {
        var line = this._bufferService.buffer.lines.get(this._bufferService.buffer.ybase + y);
        line.fill(this._bufferService.buffer.getNullCell(this._eraseAttrData()));
        line.isWrapped = false;
    };
    InputHandler.prototype.eraseInDisplay = function (params) {
        this._restrictCursor();
        var j;
        switch (params.params[0]) {
            case 0:
                j = this._bufferService.buffer.y;
                this._dirtyRowService.markDirty(j);
                this._eraseInBufferLine(j++, this._bufferService.buffer.x, this._bufferService.cols, this._bufferService.buffer.x === 0);
                for (; j < this._bufferService.rows; j++) {
                    this._resetBufferLine(j);
                }
                this._dirtyRowService.markDirty(j);
                break;
            case 1:
                j = this._bufferService.buffer.y;
                this._dirtyRowService.markDirty(j);
                this._eraseInBufferLine(j, 0, this._bufferService.buffer.x + 1, true);
                if (this._bufferService.buffer.x + 1 >= this._bufferService.cols) {
                    this._bufferService.buffer.lines.get(j + 1).isWrapped = false;
                }
                while (j--) {
                    this._resetBufferLine(j);
                }
                this._dirtyRowService.markDirty(0);
                break;
            case 2:
                j = this._bufferService.rows;
                this._dirtyRowService.markDirty(j - 1);
                while (j--) {
                    this._resetBufferLine(j);
                }
                this._dirtyRowService.markDirty(0);
                break;
            case 3:
                var scrollBackSize = this._bufferService.buffer.lines.length - this._bufferService.rows;
                if (scrollBackSize > 0) {
                    this._bufferService.buffer.lines.trimStart(scrollBackSize);
                    this._bufferService.buffer.ybase = Math.max(this._bufferService.buffer.ybase - scrollBackSize, 0);
                    this._bufferService.buffer.ydisp = Math.max(this._bufferService.buffer.ydisp - scrollBackSize, 0);
                    this._onScroll.fire(0);
                }
                break;
        }
        return true;
    };
    InputHandler.prototype.eraseInLine = function (params) {
        this._restrictCursor();
        switch (params.params[0]) {
            case 0:
                this._eraseInBufferLine(this._bufferService.buffer.y, this._bufferService.buffer.x, this._bufferService.cols);
                break;
            case 1:
                this._eraseInBufferLine(this._bufferService.buffer.y, 0, this._bufferService.buffer.x + 1);
                break;
            case 2:
                this._eraseInBufferLine(this._bufferService.buffer.y, 0, this._bufferService.cols);
                break;
        }
        this._dirtyRowService.markDirty(this._bufferService.buffer.y);
        return true;
    };
    InputHandler.prototype.insertLines = function (params) {
        this._restrictCursor();
        var param = params.params[0] || 1;
        var buffer = this._bufferService.buffer;
        if (buffer.y > buffer.scrollBottom || buffer.y < buffer.scrollTop) {
            return true;
        }
        var row = buffer.ybase + buffer.y;
        var scrollBottomRowsOffset = this._bufferService.rows - 1 - buffer.scrollBottom;
        var scrollBottomAbsolute = this._bufferService.rows - 1 + buffer.ybase - scrollBottomRowsOffset + 1;
        while (param--) {
            buffer.lines.splice(scrollBottomAbsolute - 1, 1);
            buffer.lines.splice(row, 0, buffer.getBlankLine(this._eraseAttrData()));
        }
        this._dirtyRowService.markRangeDirty(buffer.y, buffer.scrollBottom);
        buffer.x = 0;
        return true;
    };
    InputHandler.prototype.deleteLines = function (params) {
        this._restrictCursor();
        var param = params.params[0] || 1;
        var buffer = this._bufferService.buffer;
        if (buffer.y > buffer.scrollBottom || buffer.y < buffer.scrollTop) {
            return true;
        }
        var row = buffer.ybase + buffer.y;
        var j;
        j = this._bufferService.rows - 1 - buffer.scrollBottom;
        j = this._bufferService.rows - 1 + buffer.ybase - j;
        while (param--) {
            buffer.lines.splice(row, 1);
            buffer.lines.splice(j, 0, buffer.getBlankLine(this._eraseAttrData()));
        }
        this._dirtyRowService.markRangeDirty(buffer.y, buffer.scrollBottom);
        buffer.x = 0;
        return true;
    };
    InputHandler.prototype.insertChars = function (params) {
        this._restrictCursor();
        var line = this._bufferService.buffer.lines.get(this._bufferService.buffer.ybase + this._bufferService.buffer.y);
        if (line) {
            line.insertCells(this._bufferService.buffer.x, params.params[0] || 1, this._bufferService.buffer.getNullCell(this._eraseAttrData()), this._eraseAttrData());
            this._dirtyRowService.markDirty(this._bufferService.buffer.y);
        }
        return true;
    };
    InputHandler.prototype.deleteChars = function (params) {
        this._restrictCursor();
        var line = this._bufferService.buffer.lines.get(this._bufferService.buffer.ybase + this._bufferService.buffer.y);
        if (line) {
            line.deleteCells(this._bufferService.buffer.x, params.params[0] || 1, this._bufferService.buffer.getNullCell(this._eraseAttrData()), this._eraseAttrData());
            this._dirtyRowService.markDirty(this._bufferService.buffer.y);
        }
        return true;
    };
    InputHandler.prototype.scrollUp = function (params) {
        var param = params.params[0] || 1;
        var buffer = this._bufferService.buffer;
        while (param--) {
            buffer.lines.splice(buffer.ybase + buffer.scrollTop, 1);
            buffer.lines.splice(buffer.ybase + buffer.scrollBottom, 0, buffer.getBlankLine(this._eraseAttrData()));
        }
        this._dirtyRowService.markRangeDirty(buffer.scrollTop, buffer.scrollBottom);
        return true;
    };
    InputHandler.prototype.scrollDown = function (params) {
        var param = params.params[0] || 1;
        var buffer = this._bufferService.buffer;
        while (param--) {
            buffer.lines.splice(buffer.ybase + buffer.scrollBottom, 1);
            buffer.lines.splice(buffer.ybase + buffer.scrollTop, 0, buffer.getBlankLine(BufferLine_1.DEFAULT_ATTR_DATA));
        }
        this._dirtyRowService.markRangeDirty(buffer.scrollTop, buffer.scrollBottom);
        return true;
    };
    InputHandler.prototype.scrollLeft = function (params) {
        var buffer = this._bufferService.buffer;
        if (buffer.y > buffer.scrollBottom || buffer.y < buffer.scrollTop) {
            return true;
        }
        var param = params.params[0] || 1;
        for (var y = buffer.scrollTop; y <= buffer.scrollBottom; ++y) {
            var line = buffer.lines.get(buffer.ybase + y);
            line.deleteCells(0, param, buffer.getNullCell(this._eraseAttrData()), this._eraseAttrData());
            line.isWrapped = false;
        }
        this._dirtyRowService.markRangeDirty(buffer.scrollTop, buffer.scrollBottom);
        return true;
    };
    InputHandler.prototype.scrollRight = function (params) {
        var buffer = this._bufferService.buffer;
        if (buffer.y > buffer.scrollBottom || buffer.y < buffer.scrollTop) {
            return true;
        }
        var param = params.params[0] || 1;
        for (var y = buffer.scrollTop; y <= buffer.scrollBottom; ++y) {
            var line = buffer.lines.get(buffer.ybase + y);
            line.insertCells(0, param, buffer.getNullCell(this._eraseAttrData()), this._eraseAttrData());
            line.isWrapped = false;
        }
        this._dirtyRowService.markRangeDirty(buffer.scrollTop, buffer.scrollBottom);
        return true;
    };
    InputHandler.prototype.insertColumns = function (params) {
        var buffer = this._bufferService.buffer;
        if (buffer.y > buffer.scrollBottom || buffer.y < buffer.scrollTop) {
            return true;
        }
        var param = params.params[0] || 1;
        for (var y = buffer.scrollTop; y <= buffer.scrollBottom; ++y) {
            var line = this._bufferService.buffer.lines.get(buffer.ybase + y);
            line.insertCells(buffer.x, param, buffer.getNullCell(this._eraseAttrData()), this._eraseAttrData());
            line.isWrapped = false;
        }
        this._dirtyRowService.markRangeDirty(buffer.scrollTop, buffer.scrollBottom);
        return true;
    };
    InputHandler.prototype.deleteColumns = function (params) {
        var buffer = this._bufferService.buffer;
        if (buffer.y > buffer.scrollBottom || buffer.y < buffer.scrollTop) {
            return true;
        }
        var param = params.params[0] || 1;
        for (var y = buffer.scrollTop; y <= buffer.scrollBottom; ++y) {
            var line = buffer.lines.get(buffer.ybase + y);
            line.deleteCells(buffer.x, param, buffer.getNullCell(this._eraseAttrData()), this._eraseAttrData());
            line.isWrapped = false;
        }
        this._dirtyRowService.markRangeDirty(buffer.scrollTop, buffer.scrollBottom);
        return true;
    };
    InputHandler.prototype.eraseChars = function (params) {
        this._restrictCursor();
        var line = this._bufferService.buffer.lines.get(this._bufferService.buffer.ybase + this._bufferService.buffer.y);
        if (line) {
            line.replaceCells(this._bufferService.buffer.x, this._bufferService.buffer.x + (params.params[0] || 1), this._bufferService.buffer.getNullCell(this._eraseAttrData()), this._eraseAttrData());
            this._dirtyRowService.markDirty(this._bufferService.buffer.y);
        }
        return true;
    };
    InputHandler.prototype.repeatPrecedingCharacter = function (params) {
        if (!this._parser.precedingCodepoint) {
            return true;
        }
        var length = params.params[0] || 1;
        var data = new Uint32Array(length);
        for (var i = 0; i < length; ++i) {
            data[i] = this._parser.precedingCodepoint;
        }
        this.print(data, 0, data.length);
        return true;
    };
    InputHandler.prototype.sendDeviceAttributesPrimary = function (params) {
        if (params.params[0] > 0) {
            return true;
        }
        if (this._is('xterm') || this._is('rxvt-unicode') || this._is('screen')) {
            this._coreService.triggerDataEvent(EscapeSequences_1.C0.ESC + '[?1;2c');
        }
        else if (this._is('linux')) {
            this._coreService.triggerDataEvent(EscapeSequences_1.C0.ESC + '[?6c');
        }
        return true;
    };
    InputHandler.prototype.sendDeviceAttributesSecondary = function (params) {
        if (params.params[0] > 0) {
            return true;
        }
        if (this._is('xterm')) {
            this._coreService.triggerDataEvent(EscapeSequences_1.C0.ESC + '[>0;276;0c');
        }
        else if (this._is('rxvt-unicode')) {
            this._coreService.triggerDataEvent(EscapeSequences_1.C0.ESC + '[>85;95;0c');
        }
        else if (this._is('linux')) {
            this._coreService.triggerDataEvent(params.params[0] + 'c');
        }
        else if (this._is('screen')) {
            this._coreService.triggerDataEvent(EscapeSequences_1.C0.ESC + '[>83;40003;0c');
        }
        return true;
    };
    InputHandler.prototype._is = function (term) {
        return (this._optionsService.options.termName + '').indexOf(term) === 0;
    };
    InputHandler.prototype.setMode = function (params) {
        for (var i = 0; i < params.length; i++) {
            switch (params.params[i]) {
                case 4:
                    this._coreService.modes.insertMode = true;
                    break;
                case 20:
                    break;
            }
        }
        return true;
    };
    InputHandler.prototype.setModePrivate = function (params) {
        for (var i = 0; i < params.length; i++) {
            switch (params.params[i]) {
                case 1:
                    this._coreService.decPrivateModes.applicationCursorKeys = true;
                    break;
                case 2:
                    this._charsetService.setgCharset(0, Charsets_1.DEFAULT_CHARSET);
                    this._charsetService.setgCharset(1, Charsets_1.DEFAULT_CHARSET);
                    this._charsetService.setgCharset(2, Charsets_1.DEFAULT_CHARSET);
                    this._charsetService.setgCharset(3, Charsets_1.DEFAULT_CHARSET);
                    break;
                case 3:
                    if (this._optionsService.options.windowOptions.setWinLines) {
                        this._bufferService.resize(132, this._bufferService.rows);
                        this._onRequestReset.fire();
                    }
                    break;
                case 6:
                    this._coreService.decPrivateModes.origin = true;
                    this._setCursor(0, 0);
                    break;
                case 7:
                    this._coreService.decPrivateModes.wraparound = true;
                    break;
                case 12:
                    break;
                case 45:
                    this._coreService.decPrivateModes.reverseWraparound = true;
                    break;
                case 66:
                    this._logService.debug('Serial port requested application keypad.');
                    this._coreService.decPrivateModes.applicationKeypad = true;
                    this._onRequestSyncScrollBar.fire();
                    break;
                case 9:
                    this._coreMouseService.activeProtocol = 'X10';
                    break;
                case 1000:
                    this._coreMouseService.activeProtocol = 'VT200';
                    break;
                case 1002:
                    this._coreMouseService.activeProtocol = 'DRAG';
                    break;
                case 1003:
                    this._coreMouseService.activeProtocol = 'ANY';
                    break;
                case 1004:
                    this._coreService.decPrivateModes.sendFocus = true;
                    break;
                case 1005:
                    this._logService.debug('DECSET 1005 not supported (see #2507)');
                    break;
                case 1006:
                    this._coreMouseService.activeEncoding = 'SGR';
                    break;
                case 1015:
                    this._logService.debug('DECSET 1015 not supported (see #2507)');
                    break;
                case 25:
                    this._coreService.isCursorHidden = false;
                    break;
                case 1048:
                    this.saveCursor();
                    break;
                case 1049:
                    this.saveCursor();
                case 47:
                case 1047:
                    this._bufferService.buffers.activateAltBuffer(this._eraseAttrData());
                    this._coreService.isCursorInitialized = true;
                    this._onRequestRefreshRows.fire(0, this._bufferService.rows - 1);
                    this._onRequestSyncScrollBar.fire();
                    break;
                case 2004:
                    this._coreService.decPrivateModes.bracketedPasteMode = true;
                    break;
            }
        }
        return true;
    };
    InputHandler.prototype.resetMode = function (params) {
        for (var i = 0; i < params.length; i++) {
            switch (params.params[i]) {
                case 4:
                    this._coreService.modes.insertMode = false;
                    break;
                case 20:
                    break;
            }
        }
        return true;
    };
    InputHandler.prototype.resetModePrivate = function (params) {
        for (var i = 0; i < params.length; i++) {
            switch (params.params[i]) {
                case 1:
                    this._coreService.decPrivateModes.applicationCursorKeys = false;
                    break;
                case 3:
                    if (this._optionsService.options.windowOptions.setWinLines) {
                        this._bufferService.resize(80, this._bufferService.rows);
                        this._onRequestReset.fire();
                    }
                    break;
                case 6:
                    this._coreService.decPrivateModes.origin = false;
                    this._setCursor(0, 0);
                    break;
                case 7:
                    this._coreService.decPrivateModes.wraparound = false;
                    break;
                case 12:
                    break;
                case 45:
                    this._coreService.decPrivateModes.reverseWraparound = false;
                    break;
                case 66:
                    this._logService.debug('Switching back to normal keypad.');
                    this._coreService.decPrivateModes.applicationKeypad = false;
                    this._onRequestSyncScrollBar.fire();
                    break;
                case 9:
                case 1000:
                case 1002:
                case 1003:
                    this._coreMouseService.activeProtocol = 'NONE';
                    break;
                case 1004:
                    this._coreService.decPrivateModes.sendFocus = false;
                    break;
                case 1005:
                    this._logService.debug('DECRST 1005 not supported (see #2507)');
                    break;
                case 1006:
                    this._coreMouseService.activeEncoding = 'DEFAULT';
                    break;
                case 1015:
                    this._logService.debug('DECRST 1015 not supported (see #2507)');
                    break;
                case 25:
                    this._coreService.isCursorHidden = true;
                    break;
                case 1048:
                    this.restoreCursor();
                    break;
                case 1049:
                case 47:
                case 1047:
                    this._bufferService.buffers.activateNormalBuffer();
                    if (params.params[i] === 1049) {
                        this.restoreCursor();
                    }
                    this._coreService.isCursorInitialized = true;
                    this._onRequestRefreshRows.fire(0, this._bufferService.rows - 1);
                    this._onRequestSyncScrollBar.fire();
                    break;
                case 2004:
                    this._coreService.decPrivateModes.bracketedPasteMode = false;
                    break;
            }
        }
        return true;
    };
    InputHandler.prototype._updateAttrColor = function (color, mode, c1, c2, c3) {
        if (mode === 2) {
            color |= 50331648;
            color &= ~16777215;
            color |= AttributeData_1.AttributeData.fromColorRGB([c1, c2, c3]);
        }
        else if (mode === 5) {
            color &= ~(50331648 | 255);
            color |= 33554432 | (c1 & 0xff);
        }
        return color;
    };
    InputHandler.prototype._extractColor = function (params, pos, attr) {
        var accu = [0, 0, -1, 0, 0, 0];
        var cSpace = 0;
        var advance = 0;
        do {
            accu[advance + cSpace] = params.params[pos + advance];
            if (params.hasSubParams(pos + advance)) {
                var subparams = params.getSubParams(pos + advance);
                var i = 0;
                do {
                    if (accu[1] === 5) {
                        cSpace = 1;
                    }
                    accu[advance + i + 1 + cSpace] = subparams[i];
                } while (++i < subparams.length && i + advance + 1 + cSpace < accu.length);
                break;
            }
            if ((accu[1] === 5 && advance + cSpace >= 2)
                || (accu[1] === 2 && advance + cSpace >= 5)) {
                break;
            }
            if (accu[1]) {
                cSpace = 1;
            }
        } while (++advance + pos < params.length && advance + cSpace < accu.length);
        for (var i = 2; i < accu.length; ++i) {
            if (accu[i] === -1) {
                accu[i] = 0;
            }
        }
        switch (accu[0]) {
            case 38:
                attr.fg = this._updateAttrColor(attr.fg, accu[1], accu[3], accu[4], accu[5]);
                break;
            case 48:
                attr.bg = this._updateAttrColor(attr.bg, accu[1], accu[3], accu[4], accu[5]);
                break;
            case 58:
                attr.extended = attr.extended.clone();
                attr.extended.underlineColor = this._updateAttrColor(attr.extended.underlineColor, accu[1], accu[3], accu[4], accu[5]);
        }
        return advance;
    };
    InputHandler.prototype._processUnderline = function (style, attr) {
        attr.extended = attr.extended.clone();
        if (!~style || style > 5) {
            style = 1;
        }
        attr.extended.underlineStyle = style;
        attr.fg |= 268435456;
        if (style === 0) {
            attr.fg &= ~268435456;
        }
        attr.updateExtended();
    };
    InputHandler.prototype.charAttributes = function (params) {
        if (params.length === 1 && params.params[0] === 0) {
            this._curAttrData.fg = BufferLine_1.DEFAULT_ATTR_DATA.fg;
            this._curAttrData.bg = BufferLine_1.DEFAULT_ATTR_DATA.bg;
            return true;
        }
        var l = params.length;
        var p;
        var attr = this._curAttrData;
        for (var i = 0; i < l; i++) {
            p = params.params[i];
            if (p >= 30 && p <= 37) {
                attr.fg &= ~(50331648 | 255);
                attr.fg |= 16777216 | (p - 30);
            }
            else if (p >= 40 && p <= 47) {
                attr.bg &= ~(50331648 | 255);
                attr.bg |= 16777216 | (p - 40);
            }
            else if (p >= 90 && p <= 97) {
                attr.fg &= ~(50331648 | 255);
                attr.fg |= 16777216 | (p - 90) | 8;
            }
            else if (p >= 100 && p <= 107) {
                attr.bg &= ~(50331648 | 255);
                attr.bg |= 16777216 | (p - 100) | 8;
            }
            else if (p === 0) {
                attr.fg = BufferLine_1.DEFAULT_ATTR_DATA.fg;
                attr.bg = BufferLine_1.DEFAULT_ATTR_DATA.bg;
            }
            else if (p === 1) {
                attr.fg |= 134217728;
            }
            else if (p === 3) {
                attr.bg |= 67108864;
            }
            else if (p === 4) {
                attr.fg |= 268435456;
                this._processUnderline(params.hasSubParams(i) ? params.getSubParams(i)[0] : 1, attr);
            }
            else if (p === 5) {
                attr.fg |= 536870912;
            }
            else if (p === 7) {
                attr.fg |= 67108864;
            }
            else if (p === 8) {
                attr.fg |= 1073741824;
            }
            else if (p === 2) {
                attr.bg |= 134217728;
            }
            else if (p === 21) {
                this._processUnderline(2, attr);
            }
            else if (p === 22) {
                attr.fg &= ~134217728;
                attr.bg &= ~134217728;
            }
            else if (p === 23) {
                attr.bg &= ~67108864;
            }
            else if (p === 24) {
                attr.fg &= ~268435456;
            }
            else if (p === 25) {
                attr.fg &= ~536870912;
            }
            else if (p === 27) {
                attr.fg &= ~67108864;
            }
            else if (p === 28) {
                attr.fg &= ~1073741824;
            }
            else if (p === 39) {
                attr.fg &= ~(50331648 | 16777215);
                attr.fg |= BufferLine_1.DEFAULT_ATTR_DATA.fg & (255 | 16777215);
            }
            else if (p === 49) {
                attr.bg &= ~(50331648 | 16777215);
                attr.bg |= BufferLine_1.DEFAULT_ATTR_DATA.bg & (255 | 16777215);
            }
            else if (p === 38 || p === 48 || p === 58) {
                i += this._extractColor(params, i, attr);
            }
            else if (p === 59) {
                attr.extended = attr.extended.clone();
                attr.extended.underlineColor = -1;
                attr.updateExtended();
            }
            else if (p === 100) {
                attr.fg &= ~(50331648 | 16777215);
                attr.fg |= BufferLine_1.DEFAULT_ATTR_DATA.fg & (255 | 16777215);
                attr.bg &= ~(50331648 | 16777215);
                attr.bg |= BufferLine_1.DEFAULT_ATTR_DATA.bg & (255 | 16777215);
            }
            else {
                this._logService.debug('Unknown SGR attribute: %d.', p);
            }
        }
        return true;
    };
    InputHandler.prototype.deviceStatus = function (params) {
        switch (params.params[0]) {
            case 5:
                this._coreService.triggerDataEvent(EscapeSequences_1.C0.ESC + "[0n");
                break;
            case 6:
                var y = this._bufferService.buffer.y + 1;
                var x = this._bufferService.buffer.x + 1;
                this._coreService.triggerDataEvent(EscapeSequences_1.C0.ESC + "[" + y + ";" + x + "R");
                break;
        }
        return true;
    };
    InputHandler.prototype.deviceStatusPrivate = function (params) {
        switch (params.params[0]) {
            case 6:
                var y = this._bufferService.buffer.y + 1;
                var x = this._bufferService.buffer.x + 1;
                this._coreService.triggerDataEvent(EscapeSequences_1.C0.ESC + "[?" + y + ";" + x + "R");
                break;
            case 15:
                break;
            case 25:
                break;
            case 26:
                break;
            case 53:
                break;
        }
        return true;
    };
    InputHandler.prototype.softReset = function (params) {
        this._coreService.isCursorHidden = false;
        this._onRequestSyncScrollBar.fire();
        this._bufferService.buffer.scrollTop = 0;
        this._bufferService.buffer.scrollBottom = this._bufferService.rows - 1;
        this._curAttrData = BufferLine_1.DEFAULT_ATTR_DATA.clone();
        this._coreService.reset();
        this._charsetService.reset();
        this._bufferService.buffer.savedX = 0;
        this._bufferService.buffer.savedY = this._bufferService.buffer.ybase;
        this._bufferService.buffer.savedCurAttrData.fg = this._curAttrData.fg;
        this._bufferService.buffer.savedCurAttrData.bg = this._curAttrData.bg;
        this._bufferService.buffer.savedCharset = this._charsetService.charset;
        this._coreService.decPrivateModes.origin = false;
        return true;
    };
    InputHandler.prototype.setCursorStyle = function (params) {
        var param = params.params[0] || 1;
        switch (param) {
            case 1:
            case 2:
                this._optionsService.options.cursorStyle = 'block';
                break;
            case 3:
            case 4:
                this._optionsService.options.cursorStyle = 'underline';
                break;
            case 5:
            case 6:
                this._optionsService.options.cursorStyle = 'bar';
                break;
        }
        var isBlinking = param % 2 === 1;
        this._optionsService.options.cursorBlink = isBlinking;
        return true;
    };
    InputHandler.prototype.setScrollRegion = function (params) {
        var top = params.params[0] || 1;
        var bottom;
        if (params.length < 2 || (bottom = params.params[1]) > this._bufferService.rows || bottom === 0) {
            bottom = this._bufferService.rows;
        }
        if (bottom > top) {
            this._bufferService.buffer.scrollTop = top - 1;
            this._bufferService.buffer.scrollBottom = bottom - 1;
            this._setCursor(0, 0);
        }
        return true;
    };
    InputHandler.prototype.windowOptions = function (params) {
        if (!paramToWindowOption(params.params[0], this._optionsService.options.windowOptions)) {
            return true;
        }
        var second = (params.length > 1) ? params.params[1] : 0;
        switch (params.params[0]) {
            case 14:
                if (second !== 2) {
                    this._onRequestWindowsOptionsReport.fire(WindowsOptionsReportType.GET_WIN_SIZE_PIXELS);
                }
                break;
            case 16:
                this._onRequestWindowsOptionsReport.fire(WindowsOptionsReportType.GET_CELL_SIZE_PIXELS);
                break;
            case 18:
                if (this._bufferService) {
                    this._coreService.triggerDataEvent(EscapeSequences_1.C0.ESC + "[8;" + this._bufferService.rows + ";" + this._bufferService.cols + "t");
                }
                break;
            case 22:
                if (second === 0 || second === 2) {
                    this._windowTitleStack.push(this._windowTitle);
                    if (this._windowTitleStack.length > STACK_LIMIT) {
                        this._windowTitleStack.shift();
                    }
                }
                if (second === 0 || second === 1) {
                    this._iconNameStack.push(this._iconName);
                    if (this._iconNameStack.length > STACK_LIMIT) {
                        this._iconNameStack.shift();
                    }
                }
                break;
            case 23:
                if (second === 0 || second === 2) {
                    if (this._windowTitleStack.length) {
                        this.setTitle(this._windowTitleStack.pop());
                    }
                }
                if (second === 0 || second === 1) {
                    if (this._iconNameStack.length) {
                        this.setIconName(this._iconNameStack.pop());
                    }
                }
                break;
        }
        return true;
    };
    InputHandler.prototype.saveCursor = function (params) {
        this._bufferService.buffer.savedX = this._bufferService.buffer.x;
        this._bufferService.buffer.savedY = this._bufferService.buffer.ybase + this._bufferService.buffer.y;
        this._bufferService.buffer.savedCurAttrData.fg = this._curAttrData.fg;
        this._bufferService.buffer.savedCurAttrData.bg = this._curAttrData.bg;
        this._bufferService.buffer.savedCharset = this._charsetService.charset;
        return true;
    };
    InputHandler.prototype.restoreCursor = function (params) {
        this._bufferService.buffer.x = this._bufferService.buffer.savedX || 0;
        this._bufferService.buffer.y = Math.max(this._bufferService.buffer.savedY - this._bufferService.buffer.ybase, 0);
        this._curAttrData.fg = this._bufferService.buffer.savedCurAttrData.fg;
        this._curAttrData.bg = this._bufferService.buffer.savedCurAttrData.bg;
        this._charsetService.charset = this._savedCharset;
        if (this._bufferService.buffer.savedCharset) {
            this._charsetService.charset = this._bufferService.buffer.savedCharset;
        }
        this._restrictCursor();
        return true;
    };
    InputHandler.prototype.setTitle = function (data) {
        this._windowTitle = data;
        this._onTitleChange.fire(data);
        return true;
    };
    InputHandler.prototype.setIconName = function (data) {
        this._iconName = data;
        return true;
    };
    InputHandler.prototype._parseAnsiColorChange = function (data) {
        var result = { colors: [] };
        var regex = /(\d+);rgb:([0-9a-f]{2})\/([0-9a-f]{2})\/([0-9a-f]{2})/gi;
        var match;
        while ((match = regex.exec(data)) !== null) {
            result.colors.push({
                colorIndex: parseInt(match[1]),
                red: parseInt(match[2], 16),
                green: parseInt(match[3], 16),
                blue: parseInt(match[4], 16)
            });
        }
        if (result.colors.length === 0) {
            return null;
        }
        return result;
    };
    InputHandler.prototype.setAnsiColor = function (data) {
        var event = this._parseAnsiColorChange(data);
        if (event) {
            this._onAnsiColorChange.fire(event);
        }
        else {
            this._logService.warn("Expected format <num>;rgb:<rr>/<gg>/<bb> but got data: " + data);
        }
        return true;
    };
    InputHandler.prototype.nextLine = function () {
        this._bufferService.buffer.x = 0;
        this.index();
        return true;
    };
    InputHandler.prototype.keypadApplicationMode = function () {
        this._logService.debug('Serial port requested application keypad.');
        this._coreService.decPrivateModes.applicationKeypad = true;
        this._onRequestSyncScrollBar.fire();
        return true;
    };
    InputHandler.prototype.keypadNumericMode = function () {
        this._logService.debug('Switching back to normal keypad.');
        this._coreService.decPrivateModes.applicationKeypad = false;
        this._onRequestSyncScrollBar.fire();
        return true;
    };
    InputHandler.prototype.selectDefaultCharset = function () {
        this._charsetService.setgLevel(0);
        this._charsetService.setgCharset(0, Charsets_1.DEFAULT_CHARSET);
        return true;
    };
    InputHandler.prototype.selectCharset = function (collectAndFlag) {
        if (collectAndFlag.length !== 2) {
            this.selectDefaultCharset();
            return true;
        }
        if (collectAndFlag[0] === '/') {
            return true;
        }
        this._charsetService.setgCharset(GLEVEL[collectAndFlag[0]], Charsets_1.CHARSETS[collectAndFlag[1]] || Charsets_1.DEFAULT_CHARSET);
        return true;
    };
    InputHandler.prototype.index = function () {
        this._restrictCursor();
        var buffer = this._bufferService.buffer;
        this._bufferService.buffer.y++;
        if (buffer.y === buffer.scrollBottom + 1) {
            buffer.y--;
            this._onRequestScroll.fire(this._eraseAttrData());
        }
        else if (buffer.y >= this._bufferService.rows) {
            buffer.y = this._bufferService.rows - 1;
        }
        this._restrictCursor();
        return true;
    };
    InputHandler.prototype.tabSet = function () {
        this._bufferService.buffer.tabs[this._bufferService.buffer.x] = true;
        return true;
    };
    InputHandler.prototype.reverseIndex = function () {
        this._restrictCursor();
        var buffer = this._bufferService.buffer;
        if (buffer.y === buffer.scrollTop) {
            var scrollRegionHeight = buffer.scrollBottom - buffer.scrollTop;
            buffer.lines.shiftElements(buffer.ybase + buffer.y, scrollRegionHeight, 1);
            buffer.lines.set(buffer.ybase + buffer.y, buffer.getBlankLine(this._eraseAttrData()));
            this._dirtyRowService.markRangeDirty(buffer.scrollTop, buffer.scrollBottom);
        }
        else {
            buffer.y--;
            this._restrictCursor();
        }
        return true;
    };
    InputHandler.prototype.fullReset = function () {
        this._parser.reset();
        this._onRequestReset.fire();
        return true;
    };
    InputHandler.prototype.reset = function () {
        this._curAttrData = BufferLine_1.DEFAULT_ATTR_DATA.clone();
        this._eraseAttrDataInternal = BufferLine_1.DEFAULT_ATTR_DATA.clone();
    };
    InputHandler.prototype._eraseAttrData = function () {
        this._eraseAttrDataInternal.bg &= ~(50331648 | 0xFFFFFF);
        this._eraseAttrDataInternal.bg |= this._curAttrData.bg & ~0xFC000000;
        return this._eraseAttrDataInternal;
    };
    InputHandler.prototype.setgLevel = function (level) {
        this._charsetService.setgLevel(level);
        return true;
    };
    InputHandler.prototype.screenAlignmentPattern = function () {
        var cell = new CellData_1.CellData();
        cell.content = 1 << 22 | 'E'.charCodeAt(0);
        cell.fg = this._curAttrData.fg;
        cell.bg = this._curAttrData.bg;
        var buffer = this._bufferService.buffer;
        this._setCursor(0, 0);
        for (var yOffset = 0; yOffset < this._bufferService.rows; ++yOffset) {
            var row = buffer.ybase + buffer.y + yOffset;
            var line = buffer.lines.get(row);
            if (line) {
                line.fill(cell);
                line.isWrapped = false;
            }
        }
        this._dirtyRowService.markAllDirty();
        this._setCursor(0, 0);
        return true;
    };
    return InputHandler;
}(Lifecycle_1.Disposable));
exports.InputHandler = InputHandler;


/***/ }),

/***/ "./out/common/Lifecycle.js":
/*!*********************************!*\
  !*** ./out/common/Lifecycle.js ***!
  \*********************************/
/*! flagged exports */
/*! export Disposable [provided] [no usage info] [missing usage info prevents renaming] */
/*! export __esModule [provided] [no usage info] [missing usage info prevents renaming] */
/*! export disposeArray [provided] [no usage info] [missing usage info prevents renaming] */
/*! export getDisposeArrayDisposable [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_exports__ */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getDisposeArrayDisposable = exports.disposeArray = exports.Disposable = void 0;
var Disposable = (function () {
    function Disposable() {
        this._disposables = [];
        this._isDisposed = false;
    }
    Disposable.prototype.dispose = function () {
        this._isDisposed = true;
        for (var _i = 0, _a = this._disposables; _i < _a.length; _i++) {
            var d = _a[_i];
            d.dispose();
        }
        this._disposables.length = 0;
    };
    Disposable.prototype.register = function (d) {
        this._disposables.push(d);
        return d;
    };
    Disposable.prototype.unregister = function (d) {
        var index = this._disposables.indexOf(d);
        if (index !== -1) {
            this._disposables.splice(index, 1);
        }
    };
    return Disposable;
}());
exports.Disposable = Disposable;
function disposeArray(disposables) {
    for (var _i = 0, disposables_1 = disposables; _i < disposables_1.length; _i++) {
        var d = disposables_1[_i];
        d.dispose();
    }
    disposables.length = 0;
}
exports.disposeArray = disposeArray;
function getDisposeArrayDisposable(array) {
    return { dispose: function () { return disposeArray(array); } };
}
exports.getDisposeArrayDisposable = getDisposeArrayDisposable;


/***/ }),

/***/ "./out/common/Platform.js":
/*!********************************!*\
  !*** ./out/common/Platform.js ***!
  \********************************/
/*! flagged exports */
/*! export __esModule [provided] [no usage info] [missing usage info prevents renaming] */
/*! export isFirefox [provided] [no usage info] [missing usage info prevents renaming] */
/*! export isIpad [provided] [no usage info] [missing usage info prevents renaming] */
/*! export isIphone [provided] [no usage info] [missing usage info prevents renaming] */
/*! export isLinux [provided] [no usage info] [missing usage info prevents renaming] */
/*! export isMac [provided] [no usage info] [missing usage info prevents renaming] */
/*! export isSafari [provided] [no usage info] [missing usage info prevents renaming] */
/*! export isWindows [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_exports__ */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.isLinux = exports.isWindows = exports.isIphone = exports.isIpad = exports.isMac = exports.isSafari = exports.isFirefox = void 0;
var isNode = (typeof navigator === 'undefined') ? true : false;
var userAgent = (isNode) ? 'node' : navigator.userAgent;
var platform = (isNode) ? 'node' : navigator.platform;
exports.isFirefox = userAgent.includes('Firefox');
exports.isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);
exports.isMac = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'].includes(platform);
exports.isIpad = platform === 'iPad';
exports.isIphone = platform === 'iPhone';
exports.isWindows = ['Windows', 'Win16', 'Win32', 'WinCE'].includes(platform);
exports.isLinux = platform.indexOf('Linux') >= 0;


/***/ }),

/***/ "./out/common/TypedArrayUtils.js":
/*!***************************************!*\
  !*** ./out/common/TypedArrayUtils.js ***!
  \***************************************/
/*! flagged exports */
/*! export __esModule [provided] [no usage info] [missing usage info prevents renaming] */
/*! export concat [provided] [no usage info] [missing usage info prevents renaming] */
/*! export fill [provided] [no usage info] [missing usage info prevents renaming] */
/*! export fillFallback [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_exports__ */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.concat = exports.fillFallback = exports.fill = void 0;
function fill(array, value, start, end) {
    if (array.fill) {
        return array.fill(value, start, end);
    }
    return fillFallback(array, value, start, end);
}
exports.fill = fill;
function fillFallback(array, value, start, end) {
    if (start === void 0) { start = 0; }
    if (end === void 0) { end = array.length; }
    if (start >= array.length) {
        return array;
    }
    start = (array.length + start) % array.length;
    if (end >= array.length) {
        end = array.length;
    }
    else {
        end = (array.length + end) % array.length;
    }
    for (var i = start; i < end; ++i) {
        array[i] = value;
    }
    return array;
}
exports.fillFallback = fillFallback;
function concat(a, b) {
    var result = new a.constructor(a.length + b.length);
    result.set(a);
    result.set(b, a.length);
    return result;
}
exports.concat = concat;


/***/ }),

/***/ "./out/common/WindowsMode.js":
/*!***********************************!*\
  !*** ./out/common/WindowsMode.js ***!
  \***********************************/
/*! flagged exports */
/*! export __esModule [provided] [no usage info] [missing usage info prevents renaming] */
/*! export updateWindowsModeWrappedState [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_exports__, __webpack_require__ */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.updateWindowsModeWrappedState = void 0;
var Constants_1 = __webpack_require__(/*! common/buffer/Constants */ "./out/common/buffer/Constants.js");
function updateWindowsModeWrappedState(bufferService) {
    var line = bufferService.buffer.lines.get(bufferService.buffer.ybase + bufferService.buffer.y - 1);
    var lastChar = line === null || line === void 0 ? void 0 : line.get(bufferService.cols - 1);
    var nextLine = bufferService.buffer.lines.get(bufferService.buffer.ybase + bufferService.buffer.y);
    if (nextLine && lastChar) {
        nextLine.isWrapped = (lastChar[Constants_1.CHAR_DATA_CODE_INDEX] !== Constants_1.NULL_CELL_CODE && lastChar[Constants_1.CHAR_DATA_CODE_INDEX] !== Constants_1.WHITESPACE_CELL_CODE);
    }
}
exports.updateWindowsModeWrappedState = updateWindowsModeWrappedState;


/***/ }),

/***/ "./out/common/buffer/AttributeData.js":
/*!********************************************!*\
  !*** ./out/common/buffer/AttributeData.js ***!
  \********************************************/
/*! flagged exports */
/*! export AttributeData [provided] [no usage info] [missing usage info prevents renaming] */
/*! export ExtendedAttrs [provided] [no usage info] [missing usage info prevents renaming] */
/*! export __esModule [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_exports__ */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ExtendedAttrs = exports.AttributeData = void 0;
var AttributeData = (function () {
    function AttributeData() {
        this.fg = 0;
        this.bg = 0;
        this.extended = new ExtendedAttrs();
    }
    AttributeData.toColorRGB = function (value) {
        return [
            value >>> 16 & 255,
            value >>> 8 & 255,
            value & 255
        ];
    };
    AttributeData.fromColorRGB = function (value) {
        return (value[0] & 255) << 16 | (value[1] & 255) << 8 | value[2] & 255;
    };
    AttributeData.prototype.clone = function () {
        var newObj = new AttributeData();
        newObj.fg = this.fg;
        newObj.bg = this.bg;
        newObj.extended = this.extended.clone();
        return newObj;
    };
    AttributeData.prototype.isInverse = function () { return this.fg & 67108864; };
    AttributeData.prototype.isBold = function () { return this.fg & 134217728; };
    AttributeData.prototype.isUnderline = function () { return this.fg & 268435456; };
    AttributeData.prototype.isBlink = function () { return this.fg & 536870912; };
    AttributeData.prototype.isInvisible = function () { return this.fg & 1073741824; };
    AttributeData.prototype.isItalic = function () { return this.bg & 67108864; };
    AttributeData.prototype.isDim = function () { return this.bg & 134217728; };
    AttributeData.prototype.getFgColorMode = function () { return this.fg & 50331648; };
    AttributeData.prototype.getBgColorMode = function () { return this.bg & 50331648; };
    AttributeData.prototype.isFgRGB = function () { return (this.fg & 50331648) === 50331648; };
    AttributeData.prototype.isBgRGB = function () { return (this.bg & 50331648) === 50331648; };
    AttributeData.prototype.isFgPalette = function () { return (this.fg & 50331648) === 16777216 || (this.fg & 50331648) === 33554432; };
    AttributeData.prototype.isBgPalette = function () { return (this.bg & 50331648) === 16777216 || (this.bg & 50331648) === 33554432; };
    AttributeData.prototype.isFgDefault = function () { return (this.fg & 50331648) === 0; };
    AttributeData.prototype.isBgDefault = function () { return (this.bg & 50331648) === 0; };
    AttributeData.prototype.isAttributeDefault = function () { return this.fg === 0 && this.bg === 0; };
    AttributeData.prototype.getFgColor = function () {
        switch (this.fg & 50331648) {
            case 16777216:
            case 33554432: return this.fg & 255;
            case 50331648: return this.fg & 16777215;
            default: return -1;
        }
    };
    AttributeData.prototype.getBgColor = function () {
        switch (this.bg & 50331648) {
            case 16777216:
            case 33554432: return this.bg & 255;
            case 50331648: return this.bg & 16777215;
            default: return -1;
        }
    };
    AttributeData.prototype.hasExtendedAttrs = function () {
        return this.bg & 268435456;
    };
    AttributeData.prototype.updateExtended = function () {
        if (this.extended.isEmpty()) {
            this.bg &= ~268435456;
        }
        else {
            this.bg |= 268435456;
        }
    };
    AttributeData.prototype.getUnderlineColor = function () {
        if ((this.bg & 268435456) && ~this.extended.underlineColor) {
            switch (this.extended.underlineColor & 50331648) {
                case 16777216:
                case 33554432: return this.extended.underlineColor & 255;
                case 50331648: return this.extended.underlineColor & 16777215;
                default: return this.getFgColor();
            }
        }
        return this.getFgColor();
    };
    AttributeData.prototype.getUnderlineColorMode = function () {
        return (this.bg & 268435456) && ~this.extended.underlineColor
            ? this.extended.underlineColor & 50331648
            : this.getFgColorMode();
    };
    AttributeData.prototype.isUnderlineColorRGB = function () {
        return (this.bg & 268435456) && ~this.extended.underlineColor
            ? (this.extended.underlineColor & 50331648) === 50331648
            : this.isFgRGB();
    };
    AttributeData.prototype.isUnderlineColorPalette = function () {
        return (this.bg & 268435456) && ~this.extended.underlineColor
            ? (this.extended.underlineColor & 50331648) === 16777216
                || (this.extended.underlineColor & 50331648) === 33554432
            : this.isFgPalette();
    };
    AttributeData.prototype.isUnderlineColorDefault = function () {
        return (this.bg & 268435456) && ~this.extended.underlineColor
            ? (this.extended.underlineColor & 50331648) === 0
            : this.isFgDefault();
    };
    AttributeData.prototype.getUnderlineStyle = function () {
        return this.fg & 268435456
            ? (this.bg & 268435456 ? this.extended.underlineStyle : 1)
            : 0;
    };
    return AttributeData;
}());
exports.AttributeData = AttributeData;
var ExtendedAttrs = (function () {
    function ExtendedAttrs(underlineStyle, underlineColor) {
        if (underlineStyle === void 0) { underlineStyle = 0; }
        if (underlineColor === void 0) { underlineColor = -1; }
        this.underlineStyle = underlineStyle;
        this.underlineColor = underlineColor;
    }
    ExtendedAttrs.prototype.clone = function () {
        return new ExtendedAttrs(this.underlineStyle, this.underlineColor);
    };
    ExtendedAttrs.prototype.isEmpty = function () {
        return this.underlineStyle === 0;
    };
    return ExtendedAttrs;
}());
exports.ExtendedAttrs = ExtendedAttrs;


/***/ }),

/***/ "./out/common/buffer/Buffer.js":
/*!*************************************!*\
  !*** ./out/common/buffer/Buffer.js ***!
  \*************************************/
/*! flagged exports */
/*! export Buffer [provided] [no usage info] [missing usage info prevents renaming] */
/*! export BufferStringIterator [provided] [no usage info] [missing usage info prevents renaming] */
/*! export MAX_BUFFER_SIZE [provided] [no usage info] [missing usage info prevents renaming] */
/*! export __esModule [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_exports__, __webpack_require__ */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BufferStringIterator = exports.Buffer = exports.MAX_BUFFER_SIZE = void 0;
var CircularList_1 = __webpack_require__(/*! common/CircularList */ "./out/common/CircularList.js");
var BufferLine_1 = __webpack_require__(/*! common/buffer/BufferLine */ "./out/common/buffer/BufferLine.js");
var CellData_1 = __webpack_require__(/*! common/buffer/CellData */ "./out/common/buffer/CellData.js");
var Constants_1 = __webpack_require__(/*! common/buffer/Constants */ "./out/common/buffer/Constants.js");
var BufferReflow_1 = __webpack_require__(/*! common/buffer/BufferReflow */ "./out/common/buffer/BufferReflow.js");
var Marker_1 = __webpack_require__(/*! common/buffer/Marker */ "./out/common/buffer/Marker.js");
var Charsets_1 = __webpack_require__(/*! common/data/Charsets */ "./out/common/data/Charsets.js");
var AttributeData_1 = __webpack_require__(/*! common/buffer/AttributeData */ "./out/common/buffer/AttributeData.js");
exports.MAX_BUFFER_SIZE = 4294967295;
var Buffer = (function () {
    function Buffer(_hasScrollback, _optionsService, _bufferService) {
        this._hasScrollback = _hasScrollback;
        this._optionsService = _optionsService;
        this._bufferService = _bufferService;
        this.ydisp = 0;
        this.ybase = 0;
        this.y = 0;
        this.x = 0;
        this.savedY = 0;
        this.savedX = 0;
        this.savedCurAttrData = BufferLine_1.DEFAULT_ATTR_DATA.clone();
        this.savedCharset = Charsets_1.DEFAULT_CHARSET;
        this.markers = [];
        this._nullCell = CellData_1.CellData.fromCharData([0, Constants_1.NULL_CELL_CHAR, Constants_1.NULL_CELL_WIDTH, Constants_1.NULL_CELL_CODE]);
        this._whitespaceCell = CellData_1.CellData.fromCharData([0, Constants_1.WHITESPACE_CELL_CHAR, Constants_1.WHITESPACE_CELL_WIDTH, Constants_1.WHITESPACE_CELL_CODE]);
        this._cols = this._bufferService.cols;
        this._rows = this._bufferService.rows;
        this.lines = new CircularList_1.CircularList(this._getCorrectBufferLength(this._rows));
        this.scrollTop = 0;
        this.scrollBottom = this._rows - 1;
        this.setupTabStops();
    }
    Buffer.prototype.getNullCell = function (attr) {
        if (attr) {
            this._nullCell.fg = attr.fg;
            this._nullCell.bg = attr.bg;
            this._nullCell.extended = attr.extended;
        }
        else {
            this._nullCell.fg = 0;
            this._nullCell.bg = 0;
            this._nullCell.extended = new AttributeData_1.ExtendedAttrs();
        }
        return this._nullCell;
    };
    Buffer.prototype.getWhitespaceCell = function (attr) {
        if (attr) {
            this._whitespaceCell.fg = attr.fg;
            this._whitespaceCell.bg = attr.bg;
            this._whitespaceCell.extended = attr.extended;
        }
        else {
            this._whitespaceCell.fg = 0;
            this._whitespaceCell.bg = 0;
            this._whitespaceCell.extended = new AttributeData_1.ExtendedAttrs();
        }
        return this._whitespaceCell;
    };
    Buffer.prototype.getBlankLine = function (attr, isWrapped) {
        return new BufferLine_1.BufferLine(this._bufferService.cols, this.getNullCell(attr), isWrapped);
    };
    Object.defineProperty(Buffer.prototype, "hasScrollback", {
        get: function () {
            return this._hasScrollback && this.lines.maxLength > this._rows;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Buffer.prototype, "isCursorInViewport", {
        get: function () {
            var absoluteY = this.ybase + this.y;
            var relativeY = absoluteY - this.ydisp;
            return (relativeY >= 0 && relativeY < this._rows);
        },
        enumerable: false,
        configurable: true
    });
    Buffer.prototype._getCorrectBufferLength = function (rows) {
        if (!this._hasScrollback) {
            return rows;
        }
        var correctBufferLength = rows + this._optionsService.options.scrollback;
        return correctBufferLength > exports.MAX_BUFFER_SIZE ? exports.MAX_BUFFER_SIZE : correctBufferLength;
    };
    Buffer.prototype.fillViewportRows = function (fillAttr) {
        if (this.lines.length === 0) {
            if (fillAttr === undefined) {
                fillAttr = BufferLine_1.DEFAULT_ATTR_DATA;
            }
            var i = this._rows;
            while (i--) {
                this.lines.push(this.getBlankLine(fillAttr));
            }
        }
    };
    Buffer.prototype.clear = function () {
        this.ydisp = 0;
        this.ybase = 0;
        this.y = 0;
        this.x = 0;
        this.lines = new CircularList_1.CircularList(this._getCorrectBufferLength(this._rows));
        this.scrollTop = 0;
        this.scrollBottom = this._rows - 1;
        this.setupTabStops();
    };
    Buffer.prototype.resize = function (newCols, newRows) {
        var nullCell = this.getNullCell(BufferLine_1.DEFAULT_ATTR_DATA);
        var newMaxLength = this._getCorrectBufferLength(newRows);
        if (newMaxLength > this.lines.maxLength) {
            this.lines.maxLength = newMaxLength;
        }
        if (this.lines.length > 0) {
            if (this._cols < newCols) {
                for (var i = 0; i < this.lines.length; i++) {
                    this.lines.get(i).resize(newCols, nullCell);
                }
            }
            var addToY = 0;
            if (this._rows < newRows) {
                for (var y = this._rows; y < newRows; y++) {
                    if (this.lines.length < newRows + this.ybase) {
                        if (this._optionsService.options.windowsMode) {
                            this.lines.push(new BufferLine_1.BufferLine(newCols, nullCell));
                        }
                        else {
                            if (this.ybase > 0 && this.lines.length <= this.ybase + this.y + addToY + 1) {
                                this.ybase--;
                                addToY++;
                                if (this.ydisp > 0) {
                                    this.ydisp--;
                                }
                            }
                            else {
                                this.lines.push(new BufferLine_1.BufferLine(newCols, nullCell));
                            }
                        }
                    }
                }
            }
            else {
                for (var y = this._rows; y > newRows; y--) {
                    if (this.lines.length > newRows + this.ybase) {
                        if (this.lines.length > this.ybase + this.y + 1) {
                            this.lines.pop();
                        }
                        else {
                            this.ybase++;
                            this.ydisp++;
                        }
                    }
                }
            }
            if (newMaxLength < this.lines.maxLength) {
                var amountToTrim = this.lines.length - newMaxLength;
                if (amountToTrim > 0) {
                    this.lines.trimStart(amountToTrim);
                    this.ybase = Math.max(this.ybase - amountToTrim, 0);
                    this.ydisp = Math.max(this.ydisp - amountToTrim, 0);
                    this.savedY = Math.max(this.savedY - amountToTrim, 0);
                }
                this.lines.maxLength = newMaxLength;
            }
            this.x = Math.min(this.x, newCols - 1);
            this.y = Math.min(this.y, newRows - 1);
            if (addToY) {
                this.y += addToY;
            }
            this.savedX = Math.min(this.savedX, newCols - 1);
            this.scrollTop = 0;
        }
        this.scrollBottom = newRows - 1;
        if (this._isReflowEnabled) {
            this._reflow(newCols, newRows);
            if (this._cols > newCols) {
                for (var i = 0; i < this.lines.length; i++) {
                    this.lines.get(i).resize(newCols, nullCell);
                }
            }
        }
        this._cols = newCols;
        this._rows = newRows;
    };
    Object.defineProperty(Buffer.prototype, "_isReflowEnabled", {
        get: function () {
            return this._hasScrollback && !this._optionsService.options.windowsMode;
        },
        enumerable: false,
        configurable: true
    });
    Buffer.prototype._reflow = function (newCols, newRows) {
        if (this._cols === newCols) {
            return;
        }
        if (newCols > this._cols) {
            this._reflowLarger(newCols, newRows);
        }
        else {
            this._reflowSmaller(newCols, newRows);
        }
    };
    Buffer.prototype._reflowLarger = function (newCols, newRows) {
        var toRemove = BufferReflow_1.reflowLargerGetLinesToRemove(this.lines, this._cols, newCols, this.ybase + this.y, this.getNullCell(BufferLine_1.DEFAULT_ATTR_DATA));
        if (toRemove.length > 0) {
            var newLayoutResult = BufferReflow_1.reflowLargerCreateNewLayout(this.lines, toRemove);
            BufferReflow_1.reflowLargerApplyNewLayout(this.lines, newLayoutResult.layout);
            this._reflowLargerAdjustViewport(newCols, newRows, newLayoutResult.countRemoved);
        }
    };
    Buffer.prototype._reflowLargerAdjustViewport = function (newCols, newRows, countRemoved) {
        var nullCell = this.getNullCell(BufferLine_1.DEFAULT_ATTR_DATA);
        var viewportAdjustments = countRemoved;
        while (viewportAdjustments-- > 0) {
            if (this.ybase === 0) {
                if (this.y > 0) {
                    this.y--;
                }
                if (this.lines.length < newRows) {
                    this.lines.push(new BufferLine_1.BufferLine(newCols, nullCell));
                }
            }
            else {
                if (this.ydisp === this.ybase) {
                    this.ydisp--;
                }
                this.ybase--;
            }
        }
        this.savedY = Math.max(this.savedY - countRemoved, 0);
    };
    Buffer.prototype._reflowSmaller = function (newCols, newRows) {
        var nullCell = this.getNullCell(BufferLine_1.DEFAULT_ATTR_DATA);
        var toInsert = [];
        var countToInsert = 0;
        for (var y = this.lines.length - 1; y >= 0; y--) {
            var nextLine = this.lines.get(y);
            if (!nextLine || !nextLine.isWrapped && nextLine.getTrimmedLength() <= newCols) {
                continue;
            }
            var wrappedLines = [nextLine];
            while (nextLine.isWrapped && y > 0) {
                nextLine = this.lines.get(--y);
                wrappedLines.unshift(nextLine);
            }
            var absoluteY = this.ybase + this.y;
            if (absoluteY >= y && absoluteY < y + wrappedLines.length) {
                continue;
            }
            var lastLineLength = wrappedLines[wrappedLines.length - 1].getTrimmedLength();
            var destLineLengths = BufferReflow_1.reflowSmallerGetNewLineLengths(wrappedLines, this._cols, newCols);
            var linesToAdd = destLineLengths.length - wrappedLines.length;
            var trimmedLines = void 0;
            if (this.ybase === 0 && this.y !== this.lines.length - 1) {
                trimmedLines = Math.max(0, this.y - this.lines.maxLength + linesToAdd);
            }
            else {
                trimmedLines = Math.max(0, this.lines.length - this.lines.maxLength + linesToAdd);
            }
            var newLines = [];
            for (var i = 0; i < linesToAdd; i++) {
                var newLine = this.getBlankLine(BufferLine_1.DEFAULT_ATTR_DATA, true);
                newLines.push(newLine);
            }
            if (newLines.length > 0) {
                toInsert.push({
                    start: y + wrappedLines.length + countToInsert,
                    newLines: newLines
                });
                countToInsert += newLines.length;
            }
            wrappedLines.push.apply(wrappedLines, newLines);
            var destLineIndex = destLineLengths.length - 1;
            var destCol = destLineLengths[destLineIndex];
            if (destCol === 0) {
                destLineIndex--;
                destCol = destLineLengths[destLineIndex];
            }
            var srcLineIndex = wrappedLines.length - linesToAdd - 1;
            var srcCol = lastLineLength;
            while (srcLineIndex >= 0) {
                var cellsToCopy = Math.min(srcCol, destCol);
                wrappedLines[destLineIndex].copyCellsFrom(wrappedLines[srcLineIndex], srcCol - cellsToCopy, destCol - cellsToCopy, cellsToCopy, true);
                destCol -= cellsToCopy;
                if (destCol === 0) {
                    destLineIndex--;
                    destCol = destLineLengths[destLineIndex];
                }
                srcCol -= cellsToCopy;
                if (srcCol === 0) {
                    srcLineIndex--;
                    var wrappedLinesIndex = Math.max(srcLineIndex, 0);
                    srcCol = BufferReflow_1.getWrappedLineTrimmedLength(wrappedLines, wrappedLinesIndex, this._cols);
                }
            }
            for (var i = 0; i < wrappedLines.length; i++) {
                if (destLineLengths[i] < newCols) {
                    wrappedLines[i].setCell(destLineLengths[i], nullCell);
                }
            }
            var viewportAdjustments = linesToAdd - trimmedLines;
            while (viewportAdjustments-- > 0) {
                if (this.ybase === 0) {
                    if (this.y < newRows - 1) {
                        this.y++;
                        this.lines.pop();
                    }
                    else {
                        this.ybase++;
                        this.ydisp++;
                    }
                }
                else {
                    if (this.ybase < Math.min(this.lines.maxLength, this.lines.length + countToInsert) - newRows) {
                        if (this.ybase === this.ydisp) {
                            this.ydisp++;
                        }
                        this.ybase++;
                    }
                }
            }
            this.savedY = Math.min(this.savedY + linesToAdd, this.ybase + newRows - 1);
        }
        if (toInsert.length > 0) {
            var insertEvents = [];
            var originalLines = [];
            for (var i = 0; i < this.lines.length; i++) {
                originalLines.push(this.lines.get(i));
            }
            var originalLinesLength = this.lines.length;
            var originalLineIndex = originalLinesLength - 1;
            var nextToInsertIndex = 0;
            var nextToInsert = toInsert[nextToInsertIndex];
            this.lines.length = Math.min(this.lines.maxLength, this.lines.length + countToInsert);
            var countInsertedSoFar = 0;
            for (var i = Math.min(this.lines.maxLength - 1, originalLinesLength + countToInsert - 1); i >= 0; i--) {
                if (nextToInsert && nextToInsert.start > originalLineIndex + countInsertedSoFar) {
                    for (var nextI = nextToInsert.newLines.length - 1; nextI >= 0; nextI--) {
                        this.lines.set(i--, nextToInsert.newLines[nextI]);
                    }
                    i++;
                    insertEvents.push({
                        index: originalLineIndex + 1,
                        amount: nextToInsert.newLines.length
                    });
                    countInsertedSoFar += nextToInsert.newLines.length;
                    nextToInsert = toInsert[++nextToInsertIndex];
                }
                else {
                    this.lines.set(i, originalLines[originalLineIndex--]);
                }
            }
            var insertCountEmitted = 0;
            for (var i = insertEvents.length - 1; i >= 0; i--) {
                insertEvents[i].index += insertCountEmitted;
                this.lines.onInsertEmitter.fire(insertEvents[i]);
                insertCountEmitted += insertEvents[i].amount;
            }
            var amountToTrim = Math.max(0, originalLinesLength + countToInsert - this.lines.maxLength);
            if (amountToTrim > 0) {
                this.lines.onTrimEmitter.fire(amountToTrim);
            }
        }
    };
    Buffer.prototype.stringIndexToBufferIndex = function (lineIndex, stringIndex, trimRight) {
        if (trimRight === void 0) { trimRight = false; }
        while (stringIndex) {
            var line = this.lines.get(lineIndex);
            if (!line) {
                return [-1, -1];
            }
            var length_1 = (trimRight) ? line.getTrimmedLength() : line.length;
            for (var i = 0; i < length_1; ++i) {
                if (line.get(i)[Constants_1.CHAR_DATA_WIDTH_INDEX]) {
                    stringIndex -= line.get(i)[Constants_1.CHAR_DATA_CHAR_INDEX].length || 1;
                }
                if (stringIndex < 0) {
                    return [lineIndex, i];
                }
            }
            lineIndex++;
        }
        return [lineIndex, 0];
    };
    Buffer.prototype.translateBufferLineToString = function (lineIndex, trimRight, startCol, endCol) {
        if (startCol === void 0) { startCol = 0; }
        var line = this.lines.get(lineIndex);
        if (!line) {
            return '';
        }
        return line.translateToString(trimRight, startCol, endCol);
    };
    Buffer.prototype.getWrappedRangeForLine = function (y) {
        var first = y;
        var last = y;
        while (first > 0 && this.lines.get(first).isWrapped) {
            first--;
        }
        while (last + 1 < this.lines.length && this.lines.get(last + 1).isWrapped) {
            last++;
        }
        return { first: first, last: last };
    };
    Buffer.prototype.setupTabStops = function (i) {
        if (i !== null && i !== undefined) {
            if (!this.tabs[i]) {
                i = this.prevStop(i);
            }
        }
        else {
            this.tabs = {};
            i = 0;
        }
        for (; i < this._cols; i += this._optionsService.options.tabStopWidth) {
            this.tabs[i] = true;
        }
    };
    Buffer.prototype.prevStop = function (x) {
        if (x === null || x === undefined) {
            x = this.x;
        }
        while (!this.tabs[--x] && x > 0)
            ;
        return x >= this._cols ? this._cols - 1 : x < 0 ? 0 : x;
    };
    Buffer.prototype.nextStop = function (x) {
        if (x === null || x === undefined) {
            x = this.x;
        }
        while (!this.tabs[++x] && x < this._cols)
            ;
        return x >= this._cols ? this._cols - 1 : x < 0 ? 0 : x;
    };
    Buffer.prototype.addMarker = function (y) {
        var _this = this;
        var marker = new Marker_1.Marker(y);
        this.markers.push(marker);
        marker.register(this.lines.onTrim(function (amount) {
            marker.line -= amount;
            if (marker.line < 0) {
                marker.dispose();
            }
        }));
        marker.register(this.lines.onInsert(function (event) {
            if (marker.line >= event.index) {
                marker.line += event.amount;
            }
        }));
        marker.register(this.lines.onDelete(function (event) {
            if (marker.line >= event.index && marker.line < event.index + event.amount) {
                marker.dispose();
            }
            if (marker.line > event.index) {
                marker.line -= event.amount;
            }
        }));
        marker.register(marker.onDispose(function () { return _this._removeMarker(marker); }));
        return marker;
    };
    Buffer.prototype._removeMarker = function (marker) {
        this.markers.splice(this.markers.indexOf(marker), 1);
    };
    Buffer.prototype.iterator = function (trimRight, startIndex, endIndex, startOverscan, endOverscan) {
        return new BufferStringIterator(this, trimRight, startIndex, endIndex, startOverscan, endOverscan);
    };
    return Buffer;
}());
exports.Buffer = Buffer;
var BufferStringIterator = (function () {
    function BufferStringIterator(_buffer, _trimRight, _startIndex, _endIndex, _startOverscan, _endOverscan) {
        if (_startIndex === void 0) { _startIndex = 0; }
        if (_endIndex === void 0) { _endIndex = _buffer.lines.length; }
        if (_startOverscan === void 0) { _startOverscan = 0; }
        if (_endOverscan === void 0) { _endOverscan = 0; }
        this._buffer = _buffer;
        this._trimRight = _trimRight;
        this._startIndex = _startIndex;
        this._endIndex = _endIndex;
        this._startOverscan = _startOverscan;
        this._endOverscan = _endOverscan;
        if (this._startIndex < 0) {
            this._startIndex = 0;
        }
        if (this._endIndex > this._buffer.lines.length) {
            this._endIndex = this._buffer.lines.length;
        }
        this._current = this._startIndex;
    }
    BufferStringIterator.prototype.hasNext = function () {
        return this._current < this._endIndex;
    };
    BufferStringIterator.prototype.next = function () {
        var range = this._buffer.getWrappedRangeForLine(this._current);
        if (range.first < this._startIndex - this._startOverscan) {
            range.first = this._startIndex - this._startOverscan;
        }
        if (range.last > this._endIndex + this._endOverscan) {
            range.last = this._endIndex + this._endOverscan;
        }
        range.first = Math.max(range.first, 0);
        range.last = Math.min(range.last, this._buffer.lines.length);
        var content = '';
        for (var i = range.first; i <= range.last; ++i) {
            content += this._buffer.translateBufferLineToString(i, this._trimRight);
        }
        this._current = range.last + 1;
        return { range: range, content: content };
    };
    return BufferStringIterator;
}());
exports.BufferStringIterator = BufferStringIterator;


/***/ }),

/***/ "./out/common/buffer/BufferLine.js":
/*!*****************************************!*\
  !*** ./out/common/buffer/BufferLine.js ***!
  \*****************************************/
/*! flagged exports */
/*! export BufferLine [provided] [no usage info] [missing usage info prevents renaming] */
/*! export DEFAULT_ATTR_DATA [provided] [no usage info] [missing usage info prevents renaming] */
/*! export __esModule [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_exports__, __webpack_require__ */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BufferLine = exports.DEFAULT_ATTR_DATA = void 0;
var TextDecoder_1 = __webpack_require__(/*! common/input/TextDecoder */ "./out/common/input/TextDecoder.js");
var Constants_1 = __webpack_require__(/*! common/buffer/Constants */ "./out/common/buffer/Constants.js");
var CellData_1 = __webpack_require__(/*! common/buffer/CellData */ "./out/common/buffer/CellData.js");
var AttributeData_1 = __webpack_require__(/*! common/buffer/AttributeData */ "./out/common/buffer/AttributeData.js");
var CELL_SIZE = 3;
exports.DEFAULT_ATTR_DATA = Object.freeze(new AttributeData_1.AttributeData());
var BufferLine = (function () {
    function BufferLine(cols, fillCellData, isWrapped) {
        if (isWrapped === void 0) { isWrapped = false; }
        this.isWrapped = isWrapped;
        this._combined = {};
        this._extendedAttrs = {};
        this._data = new Uint32Array(cols * CELL_SIZE);
        var cell = fillCellData || CellData_1.CellData.fromCharData([0, Constants_1.NULL_CELL_CHAR, Constants_1.NULL_CELL_WIDTH, Constants_1.NULL_CELL_CODE]);
        for (var i = 0; i < cols; ++i) {
            this.setCell(i, cell);
        }
        this.length = cols;
    }
    BufferLine.prototype.get = function (index) {
        var content = this._data[index * CELL_SIZE + 0];
        var cp = content & 2097151;
        return [
            this._data[index * CELL_SIZE + 1],
            (content & 2097152)
                ? this._combined[index]
                : (cp) ? TextDecoder_1.stringFromCodePoint(cp) : '',
            content >> 22,
            (content & 2097152)
                ? this._combined[index].charCodeAt(this._combined[index].length - 1)
                : cp
        ];
    };
    BufferLine.prototype.set = function (index, value) {
        this._data[index * CELL_SIZE + 1] = value[Constants_1.CHAR_DATA_ATTR_INDEX];
        if (value[Constants_1.CHAR_DATA_CHAR_INDEX].length > 1) {
            this._combined[index] = value[1];
            this._data[index * CELL_SIZE + 0] = index | 2097152 | (value[Constants_1.CHAR_DATA_WIDTH_INDEX] << 22);
        }
        else {
            this._data[index * CELL_SIZE + 0] = value[Constants_1.CHAR_DATA_CHAR_INDEX].charCodeAt(0) | (value[Constants_1.CHAR_DATA_WIDTH_INDEX] << 22);
        }
    };
    BufferLine.prototype.getWidth = function (index) {
        return this._data[index * CELL_SIZE + 0] >> 22;
    };
    BufferLine.prototype.hasWidth = function (index) {
        return this._data[index * CELL_SIZE + 0] & 12582912;
    };
    BufferLine.prototype.getFg = function (index) {
        return this._data[index * CELL_SIZE + 1];
    };
    BufferLine.prototype.getBg = function (index) {
        return this._data[index * CELL_SIZE + 2];
    };
    BufferLine.prototype.hasContent = function (index) {
        return this._data[index * CELL_SIZE + 0] & 4194303;
    };
    BufferLine.prototype.getCodePoint = function (index) {
        var content = this._data[index * CELL_SIZE + 0];
        if (content & 2097152) {
            return this._combined[index].charCodeAt(this._combined[index].length - 1);
        }
        return content & 2097151;
    };
    BufferLine.prototype.isCombined = function (index) {
        return this._data[index * CELL_SIZE + 0] & 2097152;
    };
    BufferLine.prototype.getString = function (index) {
        var content = this._data[index * CELL_SIZE + 0];
        if (content & 2097152) {
            return this._combined[index];
        }
        if (content & 2097151) {
            return TextDecoder_1.stringFromCodePoint(content & 2097151);
        }
        return '';
    };
    BufferLine.prototype.loadCell = function (index, cell) {
        var startIndex = index * CELL_SIZE;
        cell.content = this._data[startIndex + 0];
        cell.fg = this._data[startIndex + 1];
        cell.bg = this._data[startIndex + 2];
        if (cell.content & 2097152) {
            cell.combinedData = this._combined[index];
        }
        if (cell.bg & 268435456) {
            cell.extended = this._extendedAttrs[index];
        }
        return cell;
    };
    BufferLine.prototype.setCell = function (index, cell) {
        if (cell.content & 2097152) {
            this._combined[index] = cell.combinedData;
        }
        if (cell.bg & 268435456) {
            this._extendedAttrs[index] = cell.extended;
        }
        this._data[index * CELL_SIZE + 0] = cell.content;
        this._data[index * CELL_SIZE + 1] = cell.fg;
        this._data[index * CELL_SIZE + 2] = cell.bg;
    };
    BufferLine.prototype.setCellFromCodePoint = function (index, codePoint, width, fg, bg, eAttrs) {
        if (bg & 268435456) {
            this._extendedAttrs[index] = eAttrs;
        }
        this._data[index * CELL_SIZE + 0] = codePoint | (width << 22);
        this._data[index * CELL_SIZE + 1] = fg;
        this._data[index * CELL_SIZE + 2] = bg;
    };
    BufferLine.prototype.addCodepointToCell = function (index, codePoint) {
        var content = this._data[index * CELL_SIZE + 0];
        if (content & 2097152) {
            this._combined[index] += TextDecoder_1.stringFromCodePoint(codePoint);
        }
        else {
            if (content & 2097151) {
                this._combined[index] = TextDecoder_1.stringFromCodePoint(content & 2097151) + TextDecoder_1.stringFromCodePoint(codePoint);
                content &= ~2097151;
                content |= 2097152;
            }
            else {
                content = codePoint | (1 << 22);
            }
            this._data[index * CELL_SIZE + 0] = content;
        }
    };
    BufferLine.prototype.insertCells = function (pos, n, fillCellData, eraseAttr) {
        pos %= this.length;
        if (pos && this.getWidth(pos - 1) === 2) {
            this.setCellFromCodePoint(pos - 1, 0, 1, (eraseAttr === null || eraseAttr === void 0 ? void 0 : eraseAttr.fg) || 0, (eraseAttr === null || eraseAttr === void 0 ? void 0 : eraseAttr.bg) || 0, (eraseAttr === null || eraseAttr === void 0 ? void 0 : eraseAttr.extended) || new AttributeData_1.ExtendedAttrs());
        }
        if (n < this.length - pos) {
            var cell = new CellData_1.CellData();
            for (var i = this.length - pos - n - 1; i >= 0; --i) {
                this.setCell(pos + n + i, this.loadCell(pos + i, cell));
            }
            for (var i = 0; i < n; ++i) {
                this.setCell(pos + i, fillCellData);
            }
        }
        else {
            for (var i = pos; i < this.length; ++i) {
                this.setCell(i, fillCellData);
            }
        }
        if (this.getWidth(this.length - 1) === 2) {
            this.setCellFromCodePoint(this.length - 1, 0, 1, (eraseAttr === null || eraseAttr === void 0 ? void 0 : eraseAttr.fg) || 0, (eraseAttr === null || eraseAttr === void 0 ? void 0 : eraseAttr.bg) || 0, (eraseAttr === null || eraseAttr === void 0 ? void 0 : eraseAttr.extended) || new AttributeData_1.ExtendedAttrs());
        }
    };
    BufferLine.prototype.deleteCells = function (pos, n, fillCellData, eraseAttr) {
        pos %= this.length;
        if (n < this.length - pos) {
            var cell = new CellData_1.CellData();
            for (var i = 0; i < this.length - pos - n; ++i) {
                this.setCell(pos + i, this.loadCell(pos + n + i, cell));
            }
            for (var i = this.length - n; i < this.length; ++i) {
                this.setCell(i, fillCellData);
            }
        }
        else {
            for (var i = pos; i < this.length; ++i) {
                this.setCell(i, fillCellData);
            }
        }
        if (pos && this.getWidth(pos - 1) === 2) {
            this.setCellFromCodePoint(pos - 1, 0, 1, (eraseAttr === null || eraseAttr === void 0 ? void 0 : eraseAttr.fg) || 0, (eraseAttr === null || eraseAttr === void 0 ? void 0 : eraseAttr.bg) || 0, (eraseAttr === null || eraseAttr === void 0 ? void 0 : eraseAttr.extended) || new AttributeData_1.ExtendedAttrs());
        }
        if (this.getWidth(pos) === 0 && !this.hasContent(pos)) {
            this.setCellFromCodePoint(pos, 0, 1, (eraseAttr === null || eraseAttr === void 0 ? void 0 : eraseAttr.fg) || 0, (eraseAttr === null || eraseAttr === void 0 ? void 0 : eraseAttr.bg) || 0, (eraseAttr === null || eraseAttr === void 0 ? void 0 : eraseAttr.extended) || new AttributeData_1.ExtendedAttrs());
        }
    };
    BufferLine.prototype.replaceCells = function (start, end, fillCellData, eraseAttr) {
        if (start && this.getWidth(start - 1) === 2) {
            this.setCellFromCodePoint(start - 1, 0, 1, (eraseAttr === null || eraseAttr === void 0 ? void 0 : eraseAttr.fg) || 0, (eraseAttr === null || eraseAttr === void 0 ? void 0 : eraseAttr.bg) || 0, (eraseAttr === null || eraseAttr === void 0 ? void 0 : eraseAttr.extended) || new AttributeData_1.ExtendedAttrs());
        }
        if (end < this.length && this.getWidth(end - 1) === 2) {
            this.setCellFromCodePoint(end, 0, 1, (eraseAttr === null || eraseAttr === void 0 ? void 0 : eraseAttr.fg) || 0, (eraseAttr === null || eraseAttr === void 0 ? void 0 : eraseAttr.bg) || 0, (eraseAttr === null || eraseAttr === void 0 ? void 0 : eraseAttr.extended) || new AttributeData_1.ExtendedAttrs());
        }
        while (start < end && start < this.length) {
            this.setCell(start++, fillCellData);
        }
    };
    BufferLine.prototype.resize = function (cols, fillCellData) {
        if (cols === this.length) {
            return;
        }
        if (cols > this.length) {
            var data = new Uint32Array(cols * CELL_SIZE);
            if (this.length) {
                if (cols * CELL_SIZE < this._data.length) {
                    data.set(this._data.subarray(0, cols * CELL_SIZE));
                }
                else {
                    data.set(this._data);
                }
            }
            this._data = data;
            for (var i = this.length; i < cols; ++i) {
                this.setCell(i, fillCellData);
            }
        }
        else {
            if (cols) {
                var data = new Uint32Array(cols * CELL_SIZE);
                data.set(this._data.subarray(0, cols * CELL_SIZE));
                this._data = data;
                var keys = Object.keys(this._combined);
                for (var i = 0; i < keys.length; i++) {
                    var key = parseInt(keys[i], 10);
                    if (key >= cols) {
                        delete this._combined[key];
                    }
                }
            }
            else {
                this._data = new Uint32Array(0);
                this._combined = {};
            }
        }
        this.length = cols;
    };
    BufferLine.prototype.fill = function (fillCellData) {
        this._combined = {};
        this._extendedAttrs = {};
        for (var i = 0; i < this.length; ++i) {
            this.setCell(i, fillCellData);
        }
    };
    BufferLine.prototype.copyFrom = function (line) {
        if (this.length !== line.length) {
            this._data = new Uint32Array(line._data);
        }
        else {
            this._data.set(line._data);
        }
        this.length = line.length;
        this._combined = {};
        for (var el in line._combined) {
            this._combined[el] = line._combined[el];
        }
        this._extendedAttrs = {};
        for (var el in line._extendedAttrs) {
            this._extendedAttrs[el] = line._extendedAttrs[el];
        }
        this.isWrapped = line.isWrapped;
    };
    BufferLine.prototype.clone = function () {
        var newLine = new BufferLine(0);
        newLine._data = new Uint32Array(this._data);
        newLine.length = this.length;
        for (var el in this._combined) {
            newLine._combined[el] = this._combined[el];
        }
        for (var el in this._extendedAttrs) {
            newLine._extendedAttrs[el] = this._extendedAttrs[el];
        }
        newLine.isWrapped = this.isWrapped;
        return newLine;
    };
    BufferLine.prototype.getTrimmedLength = function () {
        for (var i = this.length - 1; i >= 0; --i) {
            if ((this._data[i * CELL_SIZE + 0] & 4194303)) {
                return i + (this._data[i * CELL_SIZE + 0] >> 22);
            }
        }
        return 0;
    };
    BufferLine.prototype.copyCellsFrom = function (src, srcCol, destCol, length, applyInReverse) {
        var srcData = src._data;
        if (applyInReverse) {
            for (var cell = length - 1; cell >= 0; cell--) {
                for (var i = 0; i < CELL_SIZE; i++) {
                    this._data[(destCol + cell) * CELL_SIZE + i] = srcData[(srcCol + cell) * CELL_SIZE + i];
                }
            }
        }
        else {
            for (var cell = 0; cell < length; cell++) {
                for (var i = 0; i < CELL_SIZE; i++) {
                    this._data[(destCol + cell) * CELL_SIZE + i] = srcData[(srcCol + cell) * CELL_SIZE + i];
                }
            }
        }
        var srcCombinedKeys = Object.keys(src._combined);
        for (var i = 0; i < srcCombinedKeys.length; i++) {
            var key = parseInt(srcCombinedKeys[i], 10);
            if (key >= srcCol) {
                this._combined[key - srcCol + destCol] = src._combined[key];
            }
        }
    };
    BufferLine.prototype.translateToString = function (trimRight, startCol, endCol) {
        if (trimRight === void 0) { trimRight = false; }
        if (startCol === void 0) { startCol = 0; }
        if (endCol === void 0) { endCol = this.length; }
        if (trimRight) {
            endCol = Math.min(endCol, this.getTrimmedLength());
        }
        var result = '';
        while (startCol < endCol) {
            var content = this._data[startCol * CELL_SIZE + 0];
            var cp = content & 2097151;
            result += (content & 2097152) ? this._combined[startCol] : (cp) ? TextDecoder_1.stringFromCodePoint(cp) : Constants_1.WHITESPACE_CELL_CHAR;
            startCol += (content >> 22) || 1;
        }
        return result;
    };
    return BufferLine;
}());
exports.BufferLine = BufferLine;


/***/ }),

/***/ "./out/common/buffer/BufferReflow.js":
/*!*******************************************!*\
  !*** ./out/common/buffer/BufferReflow.js ***!
  \*******************************************/
/*! flagged exports */
/*! export __esModule [provided] [no usage info] [missing usage info prevents renaming] */
/*! export getWrappedLineTrimmedLength [provided] [no usage info] [missing usage info prevents renaming] */
/*! export reflowLargerApplyNewLayout [provided] [no usage info] [missing usage info prevents renaming] */
/*! export reflowLargerCreateNewLayout [provided] [no usage info] [missing usage info prevents renaming] */
/*! export reflowLargerGetLinesToRemove [provided] [no usage info] [missing usage info prevents renaming] */
/*! export reflowSmallerGetNewLineLengths [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_exports__ */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getWrappedLineTrimmedLength = exports.reflowSmallerGetNewLineLengths = exports.reflowLargerApplyNewLayout = exports.reflowLargerCreateNewLayout = exports.reflowLargerGetLinesToRemove = void 0;
function reflowLargerGetLinesToRemove(lines, oldCols, newCols, bufferAbsoluteY, nullCell) {
    var toRemove = [];
    for (var y = 0; y < lines.length - 1; y++) {
        var i = y;
        var nextLine = lines.get(++i);
        if (!nextLine.isWrapped) {
            continue;
        }
        var wrappedLines = [lines.get(y)];
        while (i < lines.length && nextLine.isWrapped) {
            wrappedLines.push(nextLine);
            nextLine = lines.get(++i);
        }
        if (bufferAbsoluteY >= y && bufferAbsoluteY < i) {
            y += wrappedLines.length - 1;
            continue;
        }
        var destLineIndex = 0;
        var destCol = getWrappedLineTrimmedLength(wrappedLines, destLineIndex, oldCols);
        var srcLineIndex = 1;
        var srcCol = 0;
        while (srcLineIndex < wrappedLines.length) {
            var srcTrimmedTineLength = getWrappedLineTrimmedLength(wrappedLines, srcLineIndex, oldCols);
            var srcRemainingCells = srcTrimmedTineLength - srcCol;
            var destRemainingCells = newCols - destCol;
            var cellsToCopy = Math.min(srcRemainingCells, destRemainingCells);
            wrappedLines[destLineIndex].copyCellsFrom(wrappedLines[srcLineIndex], srcCol, destCol, cellsToCopy, false);
            destCol += cellsToCopy;
            if (destCol === newCols) {
                destLineIndex++;
                destCol = 0;
            }
            srcCol += cellsToCopy;
            if (srcCol === srcTrimmedTineLength) {
                srcLineIndex++;
                srcCol = 0;
            }
            if (destCol === 0 && destLineIndex !== 0) {
                if (wrappedLines[destLineIndex - 1].getWidth(newCols - 1) === 2) {
                    wrappedLines[destLineIndex].copyCellsFrom(wrappedLines[destLineIndex - 1], newCols - 1, destCol++, 1, false);
                    wrappedLines[destLineIndex - 1].setCell(newCols - 1, nullCell);
                }
            }
        }
        wrappedLines[destLineIndex].replaceCells(destCol, newCols, nullCell);
        var countToRemove = 0;
        for (var i_1 = wrappedLines.length - 1; i_1 > 0; i_1--) {
            if (i_1 > destLineIndex || wrappedLines[i_1].getTrimmedLength() === 0) {
                countToRemove++;
            }
            else {
                break;
            }
        }
        if (countToRemove > 0) {
            toRemove.push(y + wrappedLines.length - countToRemove);
            toRemove.push(countToRemove);
        }
        y += wrappedLines.length - 1;
    }
    return toRemove;
}
exports.reflowLargerGetLinesToRemove = reflowLargerGetLinesToRemove;
function reflowLargerCreateNewLayout(lines, toRemove) {
    var layout = [];
    var nextToRemoveIndex = 0;
    var nextToRemoveStart = toRemove[nextToRemoveIndex];
    var countRemovedSoFar = 0;
    for (var i = 0; i < lines.length; i++) {
        if (nextToRemoveStart === i) {
            var countToRemove = toRemove[++nextToRemoveIndex];
            lines.onDeleteEmitter.fire({
                index: i - countRemovedSoFar,
                amount: countToRemove
            });
            i += countToRemove - 1;
            countRemovedSoFar += countToRemove;
            nextToRemoveStart = toRemove[++nextToRemoveIndex];
        }
        else {
            layout.push(i);
        }
    }
    return {
        layout: layout,
        countRemoved: countRemovedSoFar
    };
}
exports.reflowLargerCreateNewLayout = reflowLargerCreateNewLayout;
function reflowLargerApplyNewLayout(lines, newLayout) {
    var newLayoutLines = [];
    for (var i = 0; i < newLayout.length; i++) {
        newLayoutLines.push(lines.get(newLayout[i]));
    }
    for (var i = 0; i < newLayoutLines.length; i++) {
        lines.set(i, newLayoutLines[i]);
    }
    lines.length = newLayout.length;
}
exports.reflowLargerApplyNewLayout = reflowLargerApplyNewLayout;
function reflowSmallerGetNewLineLengths(wrappedLines, oldCols, newCols) {
    var newLineLengths = [];
    var cellsNeeded = wrappedLines.map(function (l, i) { return getWrappedLineTrimmedLength(wrappedLines, i, oldCols); }).reduce(function (p, c) { return p + c; });
    var srcCol = 0;
    var srcLine = 0;
    var cellsAvailable = 0;
    while (cellsAvailable < cellsNeeded) {
        if (cellsNeeded - cellsAvailable < newCols) {
            newLineLengths.push(cellsNeeded - cellsAvailable);
            break;
        }
        srcCol += newCols;
        var oldTrimmedLength = getWrappedLineTrimmedLength(wrappedLines, srcLine, oldCols);
        if (srcCol > oldTrimmedLength) {
            srcCol -= oldTrimmedLength;
            srcLine++;
        }
        var endsWithWide = wrappedLines[srcLine].getWidth(srcCol - 1) === 2;
        if (endsWithWide) {
            srcCol--;
        }
        var lineLength = endsWithWide ? newCols - 1 : newCols;
        newLineLengths.push(lineLength);
        cellsAvailable += lineLength;
    }
    return newLineLengths;
}
exports.reflowSmallerGetNewLineLengths = reflowSmallerGetNewLineLengths;
function getWrappedLineTrimmedLength(lines, i, cols) {
    if (i === lines.length - 1) {
        return lines[i].getTrimmedLength();
    }
    var endsInNull = !(lines[i].hasContent(cols - 1)) && lines[i].getWidth(cols - 1) === 1;
    var followingLineStartsWithWide = lines[i + 1].getWidth(0) === 2;
    if (endsInNull && followingLineStartsWithWide) {
        return cols - 1;
    }
    return cols;
}
exports.getWrappedLineTrimmedLength = getWrappedLineTrimmedLength;


/***/ }),

/***/ "./out/common/buffer/BufferSet.js":
/*!****************************************!*\
  !*** ./out/common/buffer/BufferSet.js ***!
  \****************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: top-level-this-exports, __webpack_exports__, __webpack_require__ */
/*! CommonJS bailout: this is used directly at 2:17-21 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BufferSet = void 0;
var Buffer_1 = __webpack_require__(/*! common/buffer/Buffer */ "./out/common/buffer/Buffer.js");
var EventEmitter_1 = __webpack_require__(/*! common/EventEmitter */ "./out/common/EventEmitter.js");
var Lifecycle_1 = __webpack_require__(/*! common/Lifecycle */ "./out/common/Lifecycle.js");
var BufferSet = (function (_super) {
    __extends(BufferSet, _super);
    function BufferSet(_optionsService, _bufferService) {
        var _this = _super.call(this) || this;
        _this._optionsService = _optionsService;
        _this._bufferService = _bufferService;
        _this._onBufferActivate = _this.register(new EventEmitter_1.EventEmitter());
        _this.reset();
        return _this;
    }
    Object.defineProperty(BufferSet.prototype, "onBufferActivate", {
        get: function () { return this._onBufferActivate.event; },
        enumerable: false,
        configurable: true
    });
    BufferSet.prototype.reset = function () {
        this._normal = new Buffer_1.Buffer(true, this._optionsService, this._bufferService);
        this._normal.fillViewportRows();
        this._alt = new Buffer_1.Buffer(false, this._optionsService, this._bufferService);
        this._activeBuffer = this._normal;
        this.setupTabStops();
    };
    Object.defineProperty(BufferSet.prototype, "alt", {
        get: function () {
            return this._alt;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BufferSet.prototype, "active", {
        get: function () {
            return this._activeBuffer;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BufferSet.prototype, "normal", {
        get: function () {
            return this._normal;
        },
        enumerable: false,
        configurable: true
    });
    BufferSet.prototype.activateNormalBuffer = function () {
        if (this._activeBuffer === this._normal) {
            return;
        }
        this._normal.x = this._alt.x;
        this._normal.y = this._alt.y;
        this._alt.clear();
        this._activeBuffer = this._normal;
        this._onBufferActivate.fire({
            activeBuffer: this._normal,
            inactiveBuffer: this._alt
        });
    };
    BufferSet.prototype.activateAltBuffer = function (fillAttr) {
        if (this._activeBuffer === this._alt) {
            return;
        }
        this._alt.fillViewportRows(fillAttr);
        this._alt.x = this._normal.x;
        this._alt.y = this._normal.y;
        this._activeBuffer = this._alt;
        this._onBufferActivate.fire({
            activeBuffer: this._alt,
            inactiveBuffer: this._normal
        });
    };
    BufferSet.prototype.resize = function (newCols, newRows) {
        this._normal.resize(newCols, newRows);
        this._alt.resize(newCols, newRows);
    };
    BufferSet.prototype.setupTabStops = function (i) {
        this._normal.setupTabStops(i);
        this._alt.setupTabStops(i);
    };
    return BufferSet;
}(Lifecycle_1.Disposable));
exports.BufferSet = BufferSet;


/***/ }),

/***/ "./out/common/buffer/CellData.js":
/*!***************************************!*\
  !*** ./out/common/buffer/CellData.js ***!
  \***************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: top-level-this-exports, __webpack_exports__, __webpack_require__ */
/*! CommonJS bailout: this is used directly at 2:17-21 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CellData = void 0;
var TextDecoder_1 = __webpack_require__(/*! common/input/TextDecoder */ "./out/common/input/TextDecoder.js");
var Constants_1 = __webpack_require__(/*! common/buffer/Constants */ "./out/common/buffer/Constants.js");
var AttributeData_1 = __webpack_require__(/*! common/buffer/AttributeData */ "./out/common/buffer/AttributeData.js");
var CellData = (function (_super) {
    __extends(CellData, _super);
    function CellData() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.content = 0;
        _this.fg = 0;
        _this.bg = 0;
        _this.extended = new AttributeData_1.ExtendedAttrs();
        _this.combinedData = '';
        return _this;
    }
    CellData.fromCharData = function (value) {
        var obj = new CellData();
        obj.setFromCharData(value);
        return obj;
    };
    CellData.prototype.isCombined = function () {
        return this.content & 2097152;
    };
    CellData.prototype.getWidth = function () {
        return this.content >> 22;
    };
    CellData.prototype.getChars = function () {
        if (this.content & 2097152) {
            return this.combinedData;
        }
        if (this.content & 2097151) {
            return TextDecoder_1.stringFromCodePoint(this.content & 2097151);
        }
        return '';
    };
    CellData.prototype.getCode = function () {
        return (this.isCombined())
            ? this.combinedData.charCodeAt(this.combinedData.length - 1)
            : this.content & 2097151;
    };
    CellData.prototype.setFromCharData = function (value) {
        this.fg = value[Constants_1.CHAR_DATA_ATTR_INDEX];
        this.bg = 0;
        var combined = false;
        if (value[Constants_1.CHAR_DATA_CHAR_INDEX].length > 2) {
            combined = true;
        }
        else if (value[Constants_1.CHAR_DATA_CHAR_INDEX].length === 2) {
            var code = value[Constants_1.CHAR_DATA_CHAR_INDEX].charCodeAt(0);
            if (0xD800 <= code && code <= 0xDBFF) {
                var second = value[Constants_1.CHAR_DATA_CHAR_INDEX].charCodeAt(1);
                if (0xDC00 <= second && second <= 0xDFFF) {
                    this.content = ((code - 0xD800) * 0x400 + second - 0xDC00 + 0x10000) | (value[Constants_1.CHAR_DATA_WIDTH_INDEX] << 22);
                }
                else {
                    combined = true;
                }
            }
            else {
                combined = true;
            }
        }
        else {
            this.content = value[Constants_1.CHAR_DATA_CHAR_INDEX].charCodeAt(0) | (value[Constants_1.CHAR_DATA_WIDTH_INDEX] << 22);
        }
        if (combined) {
            this.combinedData = value[Constants_1.CHAR_DATA_CHAR_INDEX];
            this.content = 2097152 | (value[Constants_1.CHAR_DATA_WIDTH_INDEX] << 22);
        }
    };
    CellData.prototype.getAsCharData = function () {
        return [this.fg, this.getChars(), this.getWidth(), this.getCode()];
    };
    return CellData;
}(AttributeData_1.AttributeData));
exports.CellData = CellData;


/***/ }),

/***/ "./out/common/buffer/Constants.js":
/*!****************************************!*\
  !*** ./out/common/buffer/Constants.js ***!
  \****************************************/
/*! flagged exports */
/*! export CHAR_DATA_ATTR_INDEX [provided] [no usage info] [missing usage info prevents renaming] */
/*! export CHAR_DATA_CHAR_INDEX [provided] [no usage info] [missing usage info prevents renaming] */
/*! export CHAR_DATA_CODE_INDEX [provided] [no usage info] [missing usage info prevents renaming] */
/*! export CHAR_DATA_WIDTH_INDEX [provided] [no usage info] [missing usage info prevents renaming] */
/*! export DEFAULT_ATTR [provided] [no usage info] [missing usage info prevents renaming] */
/*! export DEFAULT_COLOR [provided] [no usage info] [missing usage info prevents renaming] */
/*! export NULL_CELL_CHAR [provided] [no usage info] [missing usage info prevents renaming] */
/*! export NULL_CELL_CODE [provided] [no usage info] [missing usage info prevents renaming] */
/*! export NULL_CELL_WIDTH [provided] [no usage info] [missing usage info prevents renaming] */
/*! export WHITESPACE_CELL_CHAR [provided] [no usage info] [missing usage info prevents renaming] */
/*! export WHITESPACE_CELL_CODE [provided] [no usage info] [missing usage info prevents renaming] */
/*! export WHITESPACE_CELL_WIDTH [provided] [no usage info] [missing usage info prevents renaming] */
/*! export __esModule [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_exports__ */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WHITESPACE_CELL_CODE = exports.WHITESPACE_CELL_WIDTH = exports.WHITESPACE_CELL_CHAR = exports.NULL_CELL_CODE = exports.NULL_CELL_WIDTH = exports.NULL_CELL_CHAR = exports.CHAR_DATA_CODE_INDEX = exports.CHAR_DATA_WIDTH_INDEX = exports.CHAR_DATA_CHAR_INDEX = exports.CHAR_DATA_ATTR_INDEX = exports.DEFAULT_ATTR = exports.DEFAULT_COLOR = void 0;
exports.DEFAULT_COLOR = 256;
exports.DEFAULT_ATTR = (0 << 18) | (exports.DEFAULT_COLOR << 9) | (256 << 0);
exports.CHAR_DATA_ATTR_INDEX = 0;
exports.CHAR_DATA_CHAR_INDEX = 1;
exports.CHAR_DATA_WIDTH_INDEX = 2;
exports.CHAR_DATA_CODE_INDEX = 3;
exports.NULL_CELL_CHAR = '';
exports.NULL_CELL_WIDTH = 1;
exports.NULL_CELL_CODE = 0;
exports.WHITESPACE_CELL_CHAR = ' ';
exports.WHITESPACE_CELL_WIDTH = 1;
exports.WHITESPACE_CELL_CODE = 32;


/***/ }),

/***/ "./out/common/buffer/Marker.js":
/*!*************************************!*\
  !*** ./out/common/buffer/Marker.js ***!
  \*************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: top-level-this-exports, __webpack_exports__, __webpack_require__ */
/*! CommonJS bailout: this is used directly at 2:17-21 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Marker = void 0;
var EventEmitter_1 = __webpack_require__(/*! common/EventEmitter */ "./out/common/EventEmitter.js");
var Lifecycle_1 = __webpack_require__(/*! common/Lifecycle */ "./out/common/Lifecycle.js");
var Marker = (function (_super) {
    __extends(Marker, _super);
    function Marker(line) {
        var _this = _super.call(this) || this;
        _this.line = line;
        _this._id = Marker._nextId++;
        _this.isDisposed = false;
        _this._onDispose = new EventEmitter_1.EventEmitter();
        return _this;
    }
    Object.defineProperty(Marker.prototype, "id", {
        get: function () { return this._id; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Marker.prototype, "onDispose", {
        get: function () { return this._onDispose.event; },
        enumerable: false,
        configurable: true
    });
    Marker.prototype.dispose = function () {
        if (this.isDisposed) {
            return;
        }
        this.isDisposed = true;
        this.line = -1;
        this._onDispose.fire();
        _super.prototype.dispose.call(this);
    };
    Marker._nextId = 1;
    return Marker;
}(Lifecycle_1.Disposable));
exports.Marker = Marker;


/***/ }),

/***/ "./out/common/data/Charsets.js":
/*!*************************************!*\
  !*** ./out/common/data/Charsets.js ***!
  \*************************************/
/*! flagged exports */
/*! export CHARSETS [provided] [no usage info] [missing usage info prevents renaming] */
/*! export DEFAULT_CHARSET [provided] [no usage info] [missing usage info prevents renaming] */
/*! export __esModule [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_exports__ */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DEFAULT_CHARSET = exports.CHARSETS = void 0;
exports.CHARSETS = {};
exports.DEFAULT_CHARSET = exports.CHARSETS['B'];
exports.CHARSETS[0] = {
    '`': '\u25c6',
    'a': '\u2592',
    'b': '\u2409',
    'c': '\u240c',
    'd': '\u240d',
    'e': '\u240a',
    'f': '\u00b0',
    'g': '\u00b1',
    'h': '\u2424',
    'i': '\u240b',
    'j': '\u2518',
    'k': '\u2510',
    'l': '\u250c',
    'm': '\u2514',
    'n': '\u253c',
    'o': '\u23ba',
    'p': '\u23bb',
    'q': '\u2500',
    'r': '\u23bc',
    's': '\u23bd',
    't': '\u251c',
    'u': '\u2524',
    'v': '\u2534',
    'w': '\u252c',
    'x': '\u2502',
    'y': '\u2264',
    'z': '\u2265',
    '{': '\u03c0',
    '|': '\u2260',
    '}': '\u00a3',
    '~': '\u00b7'
};
exports.CHARSETS.A = {
    '#': '£'
};
exports.CHARSETS.B = undefined;
exports.CHARSETS[4] = {
    '#': '£',
    '@': '¾',
    '[': 'ij',
    '\\': '½',
    ']': '|',
    '{': '¨',
    '|': 'f',
    '}': '¼',
    '~': '´'
};
exports.CHARSETS.C =
    exports.CHARSETS[5] = {
        '[': 'Ä',
        '\\': 'Ö',
        ']': 'Å',
        '^': 'Ü',
        '`': 'é',
        '{': 'ä',
        '|': 'ö',
        '}': 'å',
        '~': 'ü'
    };
exports.CHARSETS.R = {
    '#': '£',
    '@': 'à',
    '[': '°',
    '\\': 'ç',
    ']': '§',
    '{': 'é',
    '|': 'ù',
    '}': 'è',
    '~': '¨'
};
exports.CHARSETS.Q = {
    '@': 'à',
    '[': 'â',
    '\\': 'ç',
    ']': 'ê',
    '^': 'î',
    '`': 'ô',
    '{': 'é',
    '|': 'ù',
    '}': 'è',
    '~': 'û'
};
exports.CHARSETS.K = {
    '@': '§',
    '[': 'Ä',
    '\\': 'Ö',
    ']': 'Ü',
    '{': 'ä',
    '|': 'ö',
    '}': 'ü',
    '~': 'ß'
};
exports.CHARSETS.Y = {
    '#': '£',
    '@': '§',
    '[': '°',
    '\\': 'ç',
    ']': 'é',
    '`': 'ù',
    '{': 'à',
    '|': 'ò',
    '}': 'è',
    '~': 'ì'
};
exports.CHARSETS.E =
    exports.CHARSETS[6] = {
        '@': 'Ä',
        '[': 'Æ',
        '\\': 'Ø',
        ']': 'Å',
        '^': 'Ü',
        '`': 'ä',
        '{': 'æ',
        '|': 'ø',
        '}': 'å',
        '~': 'ü'
    };
exports.CHARSETS.Z = {
    '#': '£',
    '@': '§',
    '[': '¡',
    '\\': 'Ñ',
    ']': '¿',
    '{': '°',
    '|': 'ñ',
    '}': 'ç'
};
exports.CHARSETS.H =
    exports.CHARSETS[7] = {
        '@': 'É',
        '[': 'Ä',
        '\\': 'Ö',
        ']': 'Å',
        '^': 'Ü',
        '`': 'é',
        '{': 'ä',
        '|': 'ö',
        '}': 'å',
        '~': 'ü'
    };
exports.CHARSETS["="] = {
    '#': 'ù',
    '@': 'à',
    '[': 'é',
    '\\': 'ç',
    ']': 'ê',
    '^': 'î',
    '_': 'è',
    '`': 'ô',
    '{': 'ä',
    '|': 'ö',
    '}': 'ü',
    '~': 'û'
};


/***/ }),

/***/ "./out/common/data/EscapeSequences.js":
/*!********************************************!*\
  !*** ./out/common/data/EscapeSequences.js ***!
  \********************************************/
/*! flagged exports */
/*! export C0 [provided] [no usage info] [missing usage info prevents renaming] */
/*! export C1 [provided] [no usage info] [missing usage info prevents renaming] */
/*! export __esModule [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_exports__ */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.C1 = exports.C0 = void 0;
var C0;
(function (C0) {
    C0.NUL = '\x00';
    C0.SOH = '\x01';
    C0.STX = '\x02';
    C0.ETX = '\x03';
    C0.EOT = '\x04';
    C0.ENQ = '\x05';
    C0.ACK = '\x06';
    C0.BEL = '\x07';
    C0.BS = '\x08';
    C0.HT = '\x09';
    C0.LF = '\x0a';
    C0.VT = '\x0b';
    C0.FF = '\x0c';
    C0.CR = '\x0d';
    C0.SO = '\x0e';
    C0.SI = '\x0f';
    C0.DLE = '\x10';
    C0.DC1 = '\x11';
    C0.DC2 = '\x12';
    C0.DC3 = '\x13';
    C0.DC4 = '\x14';
    C0.NAK = '\x15';
    C0.SYN = '\x16';
    C0.ETB = '\x17';
    C0.CAN = '\x18';
    C0.EM = '\x19';
    C0.SUB = '\x1a';
    C0.ESC = '\x1b';
    C0.FS = '\x1c';
    C0.GS = '\x1d';
    C0.RS = '\x1e';
    C0.US = '\x1f';
    C0.SP = '\x20';
    C0.DEL = '\x7f';
})(C0 = exports.C0 || (exports.C0 = {}));
var C1;
(function (C1) {
    C1.PAD = '\x80';
    C1.HOP = '\x81';
    C1.BPH = '\x82';
    C1.NBH = '\x83';
    C1.IND = '\x84';
    C1.NEL = '\x85';
    C1.SSA = '\x86';
    C1.ESA = '\x87';
    C1.HTS = '\x88';
    C1.HTJ = '\x89';
    C1.VTS = '\x8a';
    C1.PLD = '\x8b';
    C1.PLU = '\x8c';
    C1.RI = '\x8d';
    C1.SS2 = '\x8e';
    C1.SS3 = '\x8f';
    C1.DCS = '\x90';
    C1.PU1 = '\x91';
    C1.PU2 = '\x92';
    C1.STS = '\x93';
    C1.CCH = '\x94';
    C1.MW = '\x95';
    C1.SPA = '\x96';
    C1.EPA = '\x97';
    C1.SOS = '\x98';
    C1.SGCI = '\x99';
    C1.SCI = '\x9a';
    C1.CSI = '\x9b';
    C1.ST = '\x9c';
    C1.OSC = '\x9d';
    C1.PM = '\x9e';
    C1.APC = '\x9f';
})(C1 = exports.C1 || (exports.C1 = {}));


/***/ }),

/***/ "./out/common/input/Keyboard.js":
/*!**************************************!*\
  !*** ./out/common/input/Keyboard.js ***!
  \**************************************/
/*! flagged exports */
/*! export __esModule [provided] [no usage info] [missing usage info prevents renaming] */
/*! export evaluateKeyboardEvent [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_exports__, __webpack_require__ */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.evaluateKeyboardEvent = void 0;
var EscapeSequences_1 = __webpack_require__(/*! common/data/EscapeSequences */ "./out/common/data/EscapeSequences.js");
var KEYCODE_KEY_MAPPINGS = {
    48: ['0', ')'],
    49: ['1', '!'],
    50: ['2', '@'],
    51: ['3', '#'],
    52: ['4', '$'],
    53: ['5', '%'],
    54: ['6', '^'],
    55: ['7', '&'],
    56: ['8', '*'],
    57: ['9', '('],
    186: [';', ':'],
    187: ['=', '+'],
    188: [',', '<'],
    189: ['-', '_'],
    190: ['.', '>'],
    191: ['/', '?'],
    192: ['`', '~'],
    219: ['[', '{'],
    220: ['\\', '|'],
    221: [']', '}'],
    222: ['\'', '"']
};
function evaluateKeyboardEvent(ev, applicationCursorMode, isMac, macOptionIsMeta) {
    var result = {
        type: 0,
        cancel: false,
        key: undefined
    };
    var modifiers = (ev.shiftKey ? 1 : 0) | (ev.altKey ? 2 : 0) | (ev.ctrlKey ? 4 : 0) | (ev.metaKey ? 8 : 0);
    switch (ev.keyCode) {
        case 0:
            if (ev.key === 'UIKeyInputUpArrow') {
                if (applicationCursorMode) {
                    result.key = EscapeSequences_1.C0.ESC + 'OA';
                }
                else {
                    result.key = EscapeSequences_1.C0.ESC + '[A';
                }
            }
            else if (ev.key === 'UIKeyInputLeftArrow') {
                if (applicationCursorMode) {
                    result.key = EscapeSequences_1.C0.ESC + 'OD';
                }
                else {
                    result.key = EscapeSequences_1.C0.ESC + '[D';
                }
            }
            else if (ev.key === 'UIKeyInputRightArrow') {
                if (applicationCursorMode) {
                    result.key = EscapeSequences_1.C0.ESC + 'OC';
                }
                else {
                    result.key = EscapeSequences_1.C0.ESC + '[C';
                }
            }
            else if (ev.key === 'UIKeyInputDownArrow') {
                if (applicationCursorMode) {
                    result.key = EscapeSequences_1.C0.ESC + 'OB';
                }
                else {
                    result.key = EscapeSequences_1.C0.ESC + '[B';
                }
            }
            break;
        case 8:
            if (ev.shiftKey) {
                result.key = EscapeSequences_1.C0.BS;
                break;
            }
            else if (ev.altKey) {
                result.key = EscapeSequences_1.C0.ESC + EscapeSequences_1.C0.DEL;
                break;
            }
            result.key = EscapeSequences_1.C0.DEL;
            break;
        case 9:
            if (ev.shiftKey) {
                result.key = EscapeSequences_1.C0.ESC + '[Z';
                break;
            }
            result.key = EscapeSequences_1.C0.HT;
            result.cancel = true;
            break;
        case 13:
            result.key = ev.altKey ? EscapeSequences_1.C0.ESC + EscapeSequences_1.C0.CR : EscapeSequences_1.C0.CR;
            result.cancel = true;
            break;
        case 27:
            result.key = EscapeSequences_1.C0.ESC;
            if (ev.altKey) {
                result.key = EscapeSequences_1.C0.ESC + EscapeSequences_1.C0.ESC;
            }
            result.cancel = true;
            break;
        case 37:
            if (ev.metaKey) {
                break;
            }
            if (modifiers) {
                result.key = EscapeSequences_1.C0.ESC + '[1;' + (modifiers + 1) + 'D';
                if (result.key === EscapeSequences_1.C0.ESC + '[1;3D') {
                    result.key = EscapeSequences_1.C0.ESC + (isMac ? 'b' : '[1;5D');
                }
            }
            else if (applicationCursorMode) {
                result.key = EscapeSequences_1.C0.ESC + 'OD';
            }
            else {
                result.key = EscapeSequences_1.C0.ESC + '[D';
            }
            break;
        case 39:
            if (ev.metaKey) {
                break;
            }
            if (modifiers) {
                result.key = EscapeSequences_1.C0.ESC + '[1;' + (modifiers + 1) + 'C';
                if (result.key === EscapeSequences_1.C0.ESC + '[1;3C') {
                    result.key = EscapeSequences_1.C0.ESC + (isMac ? 'f' : '[1;5C');
                }
            }
            else if (applicationCursorMode) {
                result.key = EscapeSequences_1.C0.ESC + 'OC';
            }
            else {
                result.key = EscapeSequences_1.C0.ESC + '[C';
            }
            break;
        case 38:
            if (ev.metaKey) {
                break;
            }
            if (modifiers) {
                result.key = EscapeSequences_1.C0.ESC + '[1;' + (modifiers + 1) + 'A';
                if (!isMac && result.key === EscapeSequences_1.C0.ESC + '[1;3A') {
                    result.key = EscapeSequences_1.C0.ESC + '[1;5A';
                }
            }
            else if (applicationCursorMode) {
                result.key = EscapeSequences_1.C0.ESC + 'OA';
            }
            else {
                result.key = EscapeSequences_1.C0.ESC + '[A';
            }
            break;
        case 40:
            if (ev.metaKey) {
                break;
            }
            if (modifiers) {
                result.key = EscapeSequences_1.C0.ESC + '[1;' + (modifiers + 1) + 'B';
                if (!isMac && result.key === EscapeSequences_1.C0.ESC + '[1;3B') {
                    result.key = EscapeSequences_1.C0.ESC + '[1;5B';
                }
            }
            else if (applicationCursorMode) {
                result.key = EscapeSequences_1.C0.ESC + 'OB';
            }
            else {
                result.key = EscapeSequences_1.C0.ESC + '[B';
            }
            break;
        case 45:
            if (!ev.shiftKey && !ev.ctrlKey) {
                result.key = EscapeSequences_1.C0.ESC + '[2~';
            }
            break;
        case 46:
            if (modifiers) {
                result.key = EscapeSequences_1.C0.ESC + '[3;' + (modifiers + 1) + '~';
            }
            else {
                result.key = EscapeSequences_1.C0.ESC + '[3~';
            }
            break;
        case 36:
            if (modifiers) {
                result.key = EscapeSequences_1.C0.ESC + '[1;' + (modifiers + 1) + 'H';
            }
            else if (applicationCursorMode) {
                result.key = EscapeSequences_1.C0.ESC + 'OH';
            }
            else {
                result.key = EscapeSequences_1.C0.ESC + '[H';
            }
            break;
        case 35:
            if (modifiers) {
                result.key = EscapeSequences_1.C0.ESC + '[1;' + (modifiers + 1) + 'F';
            }
            else if (applicationCursorMode) {
                result.key = EscapeSequences_1.C0.ESC + 'OF';
            }
            else {
                result.key = EscapeSequences_1.C0.ESC + '[F';
            }
            break;
        case 33:
            if (ev.shiftKey) {
                result.type = 2;
            }
            else {
                result.key = EscapeSequences_1.C0.ESC + '[5~';
            }
            break;
        case 34:
            if (ev.shiftKey) {
                result.type = 3;
            }
            else {
                result.key = EscapeSequences_1.C0.ESC + '[6~';
            }
            break;
        case 112:
            if (modifiers) {
                result.key = EscapeSequences_1.C0.ESC + '[1;' + (modifiers + 1) + 'P';
            }
            else {
                result.key = EscapeSequences_1.C0.ESC + 'OP';
            }
            break;
        case 113:
            if (modifiers) {
                result.key = EscapeSequences_1.C0.ESC + '[1;' + (modifiers + 1) + 'Q';
            }
            else {
                result.key = EscapeSequences_1.C0.ESC + 'OQ';
            }
            break;
        case 114:
            if (modifiers) {
                result.key = EscapeSequences_1.C0.ESC + '[1;' + (modifiers + 1) + 'R';
            }
            else {
                result.key = EscapeSequences_1.C0.ESC + 'OR';
            }
            break;
        case 115:
            if (modifiers) {
                result.key = EscapeSequences_1.C0.ESC + '[1;' + (modifiers + 1) + 'S';
            }
            else {
                result.key = EscapeSequences_1.C0.ESC + 'OS';
            }
            break;
        case 116:
            if (modifiers) {
                result.key = EscapeSequences_1.C0.ESC + '[15;' + (modifiers + 1) + '~';
            }
            else {
                result.key = EscapeSequences_1.C0.ESC + '[15~';
            }
            break;
        case 117:
            if (modifiers) {
                result.key = EscapeSequences_1.C0.ESC + '[17;' + (modifiers + 1) + '~';
            }
            else {
                result.key = EscapeSequences_1.C0.ESC + '[17~';
            }
            break;
        case 118:
            if (modifiers) {
                result.key = EscapeSequences_1.C0.ESC + '[18;' + (modifiers + 1) + '~';
            }
            else {
                result.key = EscapeSequences_1.C0.ESC + '[18~';
            }
            break;
        case 119:
            if (modifiers) {
                result.key = EscapeSequences_1.C0.ESC + '[19;' + (modifiers + 1) + '~';
            }
            else {
                result.key = EscapeSequences_1.C0.ESC + '[19~';
            }
            break;
        case 120:
            if (modifiers) {
                result.key = EscapeSequences_1.C0.ESC + '[20;' + (modifiers + 1) + '~';
            }
            else {
                result.key = EscapeSequences_1.C0.ESC + '[20~';
            }
            break;
        case 121:
            if (modifiers) {
                result.key = EscapeSequences_1.C0.ESC + '[21;' + (modifiers + 1) + '~';
            }
            else {
                result.key = EscapeSequences_1.C0.ESC + '[21~';
            }
            break;
        case 122:
            if (modifiers) {
                result.key = EscapeSequences_1.C0.ESC + '[23;' + (modifiers + 1) + '~';
            }
            else {
                result.key = EscapeSequences_1.C0.ESC + '[23~';
            }
            break;
        case 123:
            if (modifiers) {
                result.key = EscapeSequences_1.C0.ESC + '[24;' + (modifiers + 1) + '~';
            }
            else {
                result.key = EscapeSequences_1.C0.ESC + '[24~';
            }
            break;
        default:
            if (ev.ctrlKey && !ev.shiftKey && !ev.altKey && !ev.metaKey) {
                if (ev.keyCode >= 65 && ev.keyCode <= 90) {
                    result.key = String.fromCharCode(ev.keyCode - 64);
                }
                else if (ev.keyCode === 32) {
                    result.key = EscapeSequences_1.C0.NUL;
                }
                else if (ev.keyCode >= 51 && ev.keyCode <= 55) {
                    result.key = String.fromCharCode(ev.keyCode - 51 + 27);
                }
                else if (ev.keyCode === 56) {
                    result.key = EscapeSequences_1.C0.DEL;
                }
                else if (ev.keyCode === 219) {
                    result.key = EscapeSequences_1.C0.ESC;
                }
                else if (ev.keyCode === 220) {
                    result.key = EscapeSequences_1.C0.FS;
                }
                else if (ev.keyCode === 221) {
                    result.key = EscapeSequences_1.C0.GS;
                }
            }
            else if ((!isMac || macOptionIsMeta) && ev.altKey && !ev.metaKey) {
                var keyMapping = KEYCODE_KEY_MAPPINGS[ev.keyCode];
                var key = keyMapping && keyMapping[!ev.shiftKey ? 0 : 1];
                if (key) {
                    result.key = EscapeSequences_1.C0.ESC + key;
                }
                else if (ev.keyCode >= 65 && ev.keyCode <= 90) {
                    var keyCode = ev.ctrlKey ? ev.keyCode - 64 : ev.keyCode + 32;
                    result.key = EscapeSequences_1.C0.ESC + String.fromCharCode(keyCode);
                }
            }
            else if (isMac && !ev.altKey && !ev.ctrlKey && !ev.shiftKey && ev.metaKey) {
                if (ev.keyCode === 65) {
                    result.type = 1;
                }
            }
            else if (ev.key && !ev.ctrlKey && !ev.altKey && !ev.metaKey && ev.keyCode >= 48 && ev.key.length === 1) {
                result.key = ev.key;
            }
            else if (ev.key && ev.ctrlKey) {
                if (ev.key === '_') {
                    result.key = EscapeSequences_1.C0.US;
                }
            }
            break;
    }
    return result;
}
exports.evaluateKeyboardEvent = evaluateKeyboardEvent;


/***/ }),

/***/ "./out/common/input/TextDecoder.js":
/*!*****************************************!*\
  !*** ./out/common/input/TextDecoder.js ***!
  \*****************************************/
/*! flagged exports */
/*! export StringToUtf32 [provided] [no usage info] [missing usage info prevents renaming] */
/*! export Utf8ToUtf32 [provided] [no usage info] [missing usage info prevents renaming] */
/*! export __esModule [provided] [no usage info] [missing usage info prevents renaming] */
/*! export stringFromCodePoint [provided] [no usage info] [missing usage info prevents renaming] */
/*! export utf32ToString [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_exports__ */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Utf8ToUtf32 = exports.StringToUtf32 = exports.utf32ToString = exports.stringFromCodePoint = void 0;
function stringFromCodePoint(codePoint) {
    if (codePoint > 0xFFFF) {
        codePoint -= 0x10000;
        return String.fromCharCode((codePoint >> 10) + 0xD800) + String.fromCharCode((codePoint % 0x400) + 0xDC00);
    }
    return String.fromCharCode(codePoint);
}
exports.stringFromCodePoint = stringFromCodePoint;
function utf32ToString(data, start, end) {
    if (start === void 0) { start = 0; }
    if (end === void 0) { end = data.length; }
    var result = '';
    for (var i = start; i < end; ++i) {
        var codepoint = data[i];
        if (codepoint > 0xFFFF) {
            codepoint -= 0x10000;
            result += String.fromCharCode((codepoint >> 10) + 0xD800) + String.fromCharCode((codepoint % 0x400) + 0xDC00);
        }
        else {
            result += String.fromCharCode(codepoint);
        }
    }
    return result;
}
exports.utf32ToString = utf32ToString;
var StringToUtf32 = (function () {
    function StringToUtf32() {
        this._interim = 0;
    }
    StringToUtf32.prototype.clear = function () {
        this._interim = 0;
    };
    StringToUtf32.prototype.decode = function (input, target) {
        var length = input.length;
        if (!length) {
            return 0;
        }
        var size = 0;
        var startPos = 0;
        if (this._interim) {
            var second = input.charCodeAt(startPos++);
            if (0xDC00 <= second && second <= 0xDFFF) {
                target[size++] = (this._interim - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
            }
            else {
                target[size++] = this._interim;
                target[size++] = second;
            }
            this._interim = 0;
        }
        for (var i = startPos; i < length; ++i) {
            var code = input.charCodeAt(i);
            if (0xD800 <= code && code <= 0xDBFF) {
                if (++i >= length) {
                    this._interim = code;
                    return size;
                }
                var second = input.charCodeAt(i);
                if (0xDC00 <= second && second <= 0xDFFF) {
                    target[size++] = (code - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
                }
                else {
                    target[size++] = code;
                    target[size++] = second;
                }
                continue;
            }
            if (code === 0xFEFF) {
                continue;
            }
            target[size++] = code;
        }
        return size;
    };
    return StringToUtf32;
}());
exports.StringToUtf32 = StringToUtf32;
var Utf8ToUtf32 = (function () {
    function Utf8ToUtf32() {
        this.interim = new Uint8Array(3);
    }
    Utf8ToUtf32.prototype.clear = function () {
        this.interim.fill(0);
    };
    Utf8ToUtf32.prototype.decode = function (input, target) {
        var length = input.length;
        if (!length) {
            return 0;
        }
        var size = 0;
        var byte1;
        var byte2;
        var byte3;
        var byte4;
        var codepoint = 0;
        var startPos = 0;
        if (this.interim[0]) {
            var discardInterim = false;
            var cp = this.interim[0];
            cp &= ((((cp & 0xE0) === 0xC0)) ? 0x1F : (((cp & 0xF0) === 0xE0)) ? 0x0F : 0x07);
            var pos = 0;
            var tmp = void 0;
            while ((tmp = this.interim[++pos] & 0x3F) && pos < 4) {
                cp <<= 6;
                cp |= tmp;
            }
            var type = (((this.interim[0] & 0xE0) === 0xC0)) ? 2 : (((this.interim[0] & 0xF0) === 0xE0)) ? 3 : 4;
            var missing = type - pos;
            while (startPos < missing) {
                if (startPos >= length) {
                    return 0;
                }
                tmp = input[startPos++];
                if ((tmp & 0xC0) !== 0x80) {
                    startPos--;
                    discardInterim = true;
                    break;
                }
                else {
                    this.interim[pos++] = tmp;
                    cp <<= 6;
                    cp |= tmp & 0x3F;
                }
            }
            if (!discardInterim) {
                if (type === 2) {
                    if (cp < 0x80) {
                        startPos--;
                    }
                    else {
                        target[size++] = cp;
                    }
                }
                else if (type === 3) {
                    if (cp < 0x0800 || (cp >= 0xD800 && cp <= 0xDFFF) || cp === 0xFEFF) {
                    }
                    else {
                        target[size++] = cp;
                    }
                }
                else {
                    if (cp < 0x010000 || cp > 0x10FFFF) {
                    }
                    else {
                        target[size++] = cp;
                    }
                }
            }
            this.interim.fill(0);
        }
        var fourStop = length - 4;
        var i = startPos;
        while (i < length) {
            while (i < fourStop
                && !((byte1 = input[i]) & 0x80)
                && !((byte2 = input[i + 1]) & 0x80)
                && !((byte3 = input[i + 2]) & 0x80)
                && !((byte4 = input[i + 3]) & 0x80)) {
                target[size++] = byte1;
                target[size++] = byte2;
                target[size++] = byte3;
                target[size++] = byte4;
                i += 4;
            }
            byte1 = input[i++];
            if (byte1 < 0x80) {
                target[size++] = byte1;
            }
            else if ((byte1 & 0xE0) === 0xC0) {
                if (i >= length) {
                    this.interim[0] = byte1;
                    return size;
                }
                byte2 = input[i++];
                if ((byte2 & 0xC0) !== 0x80) {
                    i--;
                    continue;
                }
                codepoint = (byte1 & 0x1F) << 6 | (byte2 & 0x3F);
                if (codepoint < 0x80) {
                    i--;
                    continue;
                }
                target[size++] = codepoint;
            }
            else if ((byte1 & 0xF0) === 0xE0) {
                if (i >= length) {
                    this.interim[0] = byte1;
                    return size;
                }
                byte2 = input[i++];
                if ((byte2 & 0xC0) !== 0x80) {
                    i--;
                    continue;
                }
                if (i >= length) {
                    this.interim[0] = byte1;
                    this.interim[1] = byte2;
                    return size;
                }
                byte3 = input[i++];
                if ((byte3 & 0xC0) !== 0x80) {
                    i--;
                    continue;
                }
                codepoint = (byte1 & 0x0F) << 12 | (byte2 & 0x3F) << 6 | (byte3 & 0x3F);
                if (codepoint < 0x0800 || (codepoint >= 0xD800 && codepoint <= 0xDFFF) || codepoint === 0xFEFF) {
                    continue;
                }
                target[size++] = codepoint;
            }
            else if ((byte1 & 0xF8) === 0xF0) {
                if (i >= length) {
                    this.interim[0] = byte1;
                    return size;
                }
                byte2 = input[i++];
                if ((byte2 & 0xC0) !== 0x80) {
                    i--;
                    continue;
                }
                if (i >= length) {
                    this.interim[0] = byte1;
                    this.interim[1] = byte2;
                    return size;
                }
                byte3 = input[i++];
                if ((byte3 & 0xC0) !== 0x80) {
                    i--;
                    continue;
                }
                if (i >= length) {
                    this.interim[0] = byte1;
                    this.interim[1] = byte2;
                    this.interim[2] = byte3;
                    return size;
                }
                byte4 = input[i++];
                if ((byte4 & 0xC0) !== 0x80) {
                    i--;
                    continue;
                }
                codepoint = (byte1 & 0x07) << 18 | (byte2 & 0x3F) << 12 | (byte3 & 0x3F) << 6 | (byte4 & 0x3F);
                if (codepoint < 0x010000 || codepoint > 0x10FFFF) {
                    continue;
                }
                target[size++] = codepoint;
            }
            else {
            }
        }
        return size;
    };
    return Utf8ToUtf32;
}());
exports.Utf8ToUtf32 = Utf8ToUtf32;


/***/ }),

/***/ "./out/common/input/UnicodeV6.js":
/*!***************************************!*\
  !*** ./out/common/input/UnicodeV6.js ***!
  \***************************************/
/*! flagged exports */
/*! export UnicodeV6 [provided] [no usage info] [missing usage info prevents renaming] */
/*! export __esModule [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_exports__, __webpack_require__ */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UnicodeV6 = void 0;
var TypedArrayUtils_1 = __webpack_require__(/*! common/TypedArrayUtils */ "./out/common/TypedArrayUtils.js");
var BMP_COMBINING = [
    [0x0300, 0x036F], [0x0483, 0x0486], [0x0488, 0x0489],
    [0x0591, 0x05BD], [0x05BF, 0x05BF], [0x05C1, 0x05C2],
    [0x05C4, 0x05C5], [0x05C7, 0x05C7], [0x0600, 0x0603],
    [0x0610, 0x0615], [0x064B, 0x065E], [0x0670, 0x0670],
    [0x06D6, 0x06E4], [0x06E7, 0x06E8], [0x06EA, 0x06ED],
    [0x070F, 0x070F], [0x0711, 0x0711], [0x0730, 0x074A],
    [0x07A6, 0x07B0], [0x07EB, 0x07F3], [0x0901, 0x0902],
    [0x093C, 0x093C], [0x0941, 0x0948], [0x094D, 0x094D],
    [0x0951, 0x0954], [0x0962, 0x0963], [0x0981, 0x0981],
    [0x09BC, 0x09BC], [0x09C1, 0x09C4], [0x09CD, 0x09CD],
    [0x09E2, 0x09E3], [0x0A01, 0x0A02], [0x0A3C, 0x0A3C],
    [0x0A41, 0x0A42], [0x0A47, 0x0A48], [0x0A4B, 0x0A4D],
    [0x0A70, 0x0A71], [0x0A81, 0x0A82], [0x0ABC, 0x0ABC],
    [0x0AC1, 0x0AC5], [0x0AC7, 0x0AC8], [0x0ACD, 0x0ACD],
    [0x0AE2, 0x0AE3], [0x0B01, 0x0B01], [0x0B3C, 0x0B3C],
    [0x0B3F, 0x0B3F], [0x0B41, 0x0B43], [0x0B4D, 0x0B4D],
    [0x0B56, 0x0B56], [0x0B82, 0x0B82], [0x0BC0, 0x0BC0],
    [0x0BCD, 0x0BCD], [0x0C3E, 0x0C40], [0x0C46, 0x0C48],
    [0x0C4A, 0x0C4D], [0x0C55, 0x0C56], [0x0CBC, 0x0CBC],
    [0x0CBF, 0x0CBF], [0x0CC6, 0x0CC6], [0x0CCC, 0x0CCD],
    [0x0CE2, 0x0CE3], [0x0D41, 0x0D43], [0x0D4D, 0x0D4D],
    [0x0DCA, 0x0DCA], [0x0DD2, 0x0DD4], [0x0DD6, 0x0DD6],
    [0x0E31, 0x0E31], [0x0E34, 0x0E3A], [0x0E47, 0x0E4E],
    [0x0EB1, 0x0EB1], [0x0EB4, 0x0EB9], [0x0EBB, 0x0EBC],
    [0x0EC8, 0x0ECD], [0x0F18, 0x0F19], [0x0F35, 0x0F35],
    [0x0F37, 0x0F37], [0x0F39, 0x0F39], [0x0F71, 0x0F7E],
    [0x0F80, 0x0F84], [0x0F86, 0x0F87], [0x0F90, 0x0F97],
    [0x0F99, 0x0FBC], [0x0FC6, 0x0FC6], [0x102D, 0x1030],
    [0x1032, 0x1032], [0x1036, 0x1037], [0x1039, 0x1039],
    [0x1058, 0x1059], [0x1160, 0x11FF], [0x135F, 0x135F],
    [0x1712, 0x1714], [0x1732, 0x1734], [0x1752, 0x1753],
    [0x1772, 0x1773], [0x17B4, 0x17B5], [0x17B7, 0x17BD],
    [0x17C6, 0x17C6], [0x17C9, 0x17D3], [0x17DD, 0x17DD],
    [0x180B, 0x180D], [0x18A9, 0x18A9], [0x1920, 0x1922],
    [0x1927, 0x1928], [0x1932, 0x1932], [0x1939, 0x193B],
    [0x1A17, 0x1A18], [0x1B00, 0x1B03], [0x1B34, 0x1B34],
    [0x1B36, 0x1B3A], [0x1B3C, 0x1B3C], [0x1B42, 0x1B42],
    [0x1B6B, 0x1B73], [0x1DC0, 0x1DCA], [0x1DFE, 0x1DFF],
    [0x200B, 0x200F], [0x202A, 0x202E], [0x2060, 0x2063],
    [0x206A, 0x206F], [0x20D0, 0x20EF], [0x302A, 0x302F],
    [0x3099, 0x309A], [0xA806, 0xA806], [0xA80B, 0xA80B],
    [0xA825, 0xA826], [0xFB1E, 0xFB1E], [0xFE00, 0xFE0F],
    [0xFE20, 0xFE23], [0xFEFF, 0xFEFF], [0xFFF9, 0xFFFB]
];
var HIGH_COMBINING = [
    [0x10A01, 0x10A03], [0x10A05, 0x10A06], [0x10A0C, 0x10A0F],
    [0x10A38, 0x10A3A], [0x10A3F, 0x10A3F], [0x1D167, 0x1D169],
    [0x1D173, 0x1D182], [0x1D185, 0x1D18B], [0x1D1AA, 0x1D1AD],
    [0x1D242, 0x1D244], [0xE0001, 0xE0001], [0xE0020, 0xE007F],
    [0xE0100, 0xE01EF]
];
var table;
function bisearch(ucs, data) {
    var min = 0;
    var max = data.length - 1;
    var mid;
    if (ucs < data[0][0] || ucs > data[max][1]) {
        return false;
    }
    while (max >= min) {
        mid = (min + max) >> 1;
        if (ucs > data[mid][1]) {
            min = mid + 1;
        }
        else if (ucs < data[mid][0]) {
            max = mid - 1;
        }
        else {
            return true;
        }
    }
    return false;
}
var UnicodeV6 = (function () {
    function UnicodeV6() {
        this.version = '6';
        if (!table) {
            table = new Uint8Array(65536);
            TypedArrayUtils_1.fill(table, 1);
            table[0] = 0;
            TypedArrayUtils_1.fill(table, 0, 1, 32);
            TypedArrayUtils_1.fill(table, 0, 0x7f, 0xa0);
            TypedArrayUtils_1.fill(table, 2, 0x1100, 0x1160);
            table[0x2329] = 2;
            table[0x232a] = 2;
            TypedArrayUtils_1.fill(table, 2, 0x2e80, 0xa4d0);
            table[0x303f] = 1;
            TypedArrayUtils_1.fill(table, 2, 0xac00, 0xd7a4);
            TypedArrayUtils_1.fill(table, 2, 0xf900, 0xfb00);
            TypedArrayUtils_1.fill(table, 2, 0xfe10, 0xfe1a);
            TypedArrayUtils_1.fill(table, 2, 0xfe30, 0xfe70);
            TypedArrayUtils_1.fill(table, 2, 0xff00, 0xff61);
            TypedArrayUtils_1.fill(table, 2, 0xffe0, 0xffe7);
            for (var r = 0; r < BMP_COMBINING.length; ++r) {
                TypedArrayUtils_1.fill(table, 0, BMP_COMBINING[r][0], BMP_COMBINING[r][1] + 1);
            }
        }
    }
    UnicodeV6.prototype.wcwidth = function (num) {
        if (num < 32)
            return 0;
        if (num < 127)
            return 1;
        if (num < 65536)
            return table[num];
        if (bisearch(num, HIGH_COMBINING))
            return 0;
        if ((num >= 0x20000 && num <= 0x2fffd) || (num >= 0x30000 && num <= 0x3fffd))
            return 2;
        return 1;
    };
    return UnicodeV6;
}());
exports.UnicodeV6 = UnicodeV6;


/***/ }),

/***/ "./out/common/input/WriteBuffer.js":
/*!*****************************************!*\
  !*** ./out/common/input/WriteBuffer.js ***!
  \*****************************************/
/*! flagged exports */
/*! export WriteBuffer [provided] [no usage info] [missing usage info prevents renaming] */
/*! export __esModule [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_exports__ */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WriteBuffer = void 0;
var DISCARD_WATERMARK = 50000000;
var WRITE_TIMEOUT_MS = 12;
var WRITE_BUFFER_LENGTH_THRESHOLD = 50;
var WriteBuffer = (function () {
    function WriteBuffer(_action) {
        this._action = _action;
        this._writeBuffer = [];
        this._callbacks = [];
        this._pendingData = 0;
        this._bufferOffset = 0;
    }
    WriteBuffer.prototype.writeSync = function (data) {
        if (this._writeBuffer.length) {
            for (var i = this._bufferOffset; i < this._writeBuffer.length; ++i) {
                var data_1 = this._writeBuffer[i];
                var cb = this._callbacks[i];
                this._action(data_1);
                if (cb)
                    cb();
            }
            this._writeBuffer = [];
            this._callbacks = [];
            this._pendingData = 0;
            this._bufferOffset = 0x7FFFFFFF;
        }
        this._action(data);
    };
    WriteBuffer.prototype.write = function (data, callback) {
        var _this = this;
        if (this._pendingData > DISCARD_WATERMARK) {
            throw new Error('write data discarded, use flow control to avoid losing data');
        }
        if (!this._writeBuffer.length) {
            this._bufferOffset = 0;
            setTimeout(function () { return _this._innerWrite(); });
        }
        this._pendingData += data.length;
        this._writeBuffer.push(data);
        this._callbacks.push(callback);
    };
    WriteBuffer.prototype._innerWrite = function () {
        var _this = this;
        var startTime = Date.now();
        while (this._writeBuffer.length > this._bufferOffset) {
            var data = this._writeBuffer[this._bufferOffset];
            var cb = this._callbacks[this._bufferOffset];
            this._bufferOffset++;
            this._action(data);
            this._pendingData -= data.length;
            if (cb)
                cb();
            if (Date.now() - startTime >= WRITE_TIMEOUT_MS) {
                break;
            }
        }
        if (this._writeBuffer.length > this._bufferOffset) {
            if (this._bufferOffset > WRITE_BUFFER_LENGTH_THRESHOLD) {
                this._writeBuffer = this._writeBuffer.slice(this._bufferOffset);
                this._callbacks = this._callbacks.slice(this._bufferOffset);
                this._bufferOffset = 0;
            }
            setTimeout(function () { return _this._innerWrite(); }, 0);
        }
        else {
            this._writeBuffer = [];
            this._callbacks = [];
            this._pendingData = 0;
            this._bufferOffset = 0;
        }
    };
    return WriteBuffer;
}());
exports.WriteBuffer = WriteBuffer;


/***/ }),

/***/ "./out/common/parser/Constants.js":
/*!****************************************!*\
  !*** ./out/common/parser/Constants.js ***!
  \****************************************/
/*! flagged exports */
/*! export PAYLOAD_LIMIT [provided] [no usage info] [missing usage info prevents renaming] */
/*! export __esModule [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_exports__ */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PAYLOAD_LIMIT = void 0;
exports.PAYLOAD_LIMIT = 10000000;


/***/ }),

/***/ "./out/common/parser/DcsParser.js":
/*!****************************************!*\
  !*** ./out/common/parser/DcsParser.js ***!
  \****************************************/
/*! flagged exports */
/*! export DcsHandler [provided] [no usage info] [missing usage info prevents renaming] */
/*! export DcsParser [provided] [no usage info] [missing usage info prevents renaming] */
/*! export __esModule [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_exports__, __webpack_require__ */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DcsHandler = exports.DcsParser = void 0;
var TextDecoder_1 = __webpack_require__(/*! common/input/TextDecoder */ "./out/common/input/TextDecoder.js");
var Params_1 = __webpack_require__(/*! common/parser/Params */ "./out/common/parser/Params.js");
var Constants_1 = __webpack_require__(/*! common/parser/Constants */ "./out/common/parser/Constants.js");
var EMPTY_HANDLERS = [];
var DcsParser = (function () {
    function DcsParser() {
        this._handlers = Object.create(null);
        this._active = EMPTY_HANDLERS;
        this._ident = 0;
        this._handlerFb = function () { };
    }
    DcsParser.prototype.dispose = function () {
        this._handlers = Object.create(null);
        this._handlerFb = function () { };
        this._active = EMPTY_HANDLERS;
    };
    DcsParser.prototype.registerHandler = function (ident, handler) {
        if (this._handlers[ident] === undefined) {
            this._handlers[ident] = [];
        }
        var handlerList = this._handlers[ident];
        handlerList.push(handler);
        return {
            dispose: function () {
                var handlerIndex = handlerList.indexOf(handler);
                if (handlerIndex !== -1) {
                    handlerList.splice(handlerIndex, 1);
                }
            }
        };
    };
    DcsParser.prototype.clearHandler = function (ident) {
        if (this._handlers[ident])
            delete this._handlers[ident];
    };
    DcsParser.prototype.setHandlerFallback = function (handler) {
        this._handlerFb = handler;
    };
    DcsParser.prototype.reset = function () {
        if (this._active.length) {
            this.unhook(false);
        }
        this._active = EMPTY_HANDLERS;
        this._ident = 0;
    };
    DcsParser.prototype.hook = function (ident, params) {
        this.reset();
        this._ident = ident;
        this._active = this._handlers[ident] || EMPTY_HANDLERS;
        if (!this._active.length) {
            this._handlerFb(this._ident, 'HOOK', params);
        }
        else {
            for (var j = this._active.length - 1; j >= 0; j--) {
                this._active[j].hook(params);
            }
        }
    };
    DcsParser.prototype.put = function (data, start, end) {
        if (!this._active.length) {
            this._handlerFb(this._ident, 'PUT', TextDecoder_1.utf32ToString(data, start, end));
        }
        else {
            for (var j = this._active.length - 1; j >= 0; j--) {
                this._active[j].put(data, start, end);
            }
        }
    };
    DcsParser.prototype.unhook = function (success) {
        if (!this._active.length) {
            this._handlerFb(this._ident, 'UNHOOK', success);
        }
        else {
            var j = this._active.length - 1;
            for (; j >= 0; j--) {
                if (this._active[j].unhook(success)) {
                    break;
                }
            }
            j--;
            for (; j >= 0; j--) {
                this._active[j].unhook(false);
            }
        }
        this._active = EMPTY_HANDLERS;
        this._ident = 0;
    };
    return DcsParser;
}());
exports.DcsParser = DcsParser;
var EMPTY_PARAMS = new Params_1.Params();
EMPTY_PARAMS.addParam(0);
var DcsHandler = (function () {
    function DcsHandler(_handler) {
        this._handler = _handler;
        this._data = '';
        this._params = EMPTY_PARAMS;
        this._hitLimit = false;
    }
    DcsHandler.prototype.hook = function (params) {
        this._params = (params.length > 1 || params.params[0]) ? params.clone() : EMPTY_PARAMS;
        this._data = '';
        this._hitLimit = false;
    };
    DcsHandler.prototype.put = function (data, start, end) {
        if (this._hitLimit) {
            return;
        }
        this._data += TextDecoder_1.utf32ToString(data, start, end);
        if (this._data.length > Constants_1.PAYLOAD_LIMIT) {
            this._data = '';
            this._hitLimit = true;
        }
    };
    DcsHandler.prototype.unhook = function (success) {
        var ret = false;
        if (this._hitLimit) {
            ret = false;
        }
        else if (success) {
            ret = this._handler(this._data, this._params);
        }
        this._params = EMPTY_PARAMS;
        this._data = '';
        this._hitLimit = false;
        return ret;
    };
    return DcsHandler;
}());
exports.DcsHandler = DcsHandler;


/***/ }),

/***/ "./out/common/parser/EscapeSequenceParser.js":
/*!***************************************************!*\
  !*** ./out/common/parser/EscapeSequenceParser.js ***!
  \***************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: top-level-this-exports, __webpack_exports__, __webpack_require__ */
/*! CommonJS bailout: this is used directly at 2:17-21 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EscapeSequenceParser = exports.VT500_TRANSITION_TABLE = exports.TransitionTable = void 0;
var Lifecycle_1 = __webpack_require__(/*! common/Lifecycle */ "./out/common/Lifecycle.js");
var TypedArrayUtils_1 = __webpack_require__(/*! common/TypedArrayUtils */ "./out/common/TypedArrayUtils.js");
var Params_1 = __webpack_require__(/*! common/parser/Params */ "./out/common/parser/Params.js");
var OscParser_1 = __webpack_require__(/*! common/parser/OscParser */ "./out/common/parser/OscParser.js");
var DcsParser_1 = __webpack_require__(/*! common/parser/DcsParser */ "./out/common/parser/DcsParser.js");
var TransitionTable = (function () {
    function TransitionTable(length) {
        this.table = new Uint8Array(length);
    }
    TransitionTable.prototype.setDefault = function (action, next) {
        TypedArrayUtils_1.fill(this.table, action << 4 | next);
    };
    TransitionTable.prototype.add = function (code, state, action, next) {
        this.table[state << 8 | code] = action << 4 | next;
    };
    TransitionTable.prototype.addMany = function (codes, state, action, next) {
        for (var i = 0; i < codes.length; i++) {
            this.table[state << 8 | codes[i]] = action << 4 | next;
        }
    };
    return TransitionTable;
}());
exports.TransitionTable = TransitionTable;
var NON_ASCII_PRINTABLE = 0xA0;
exports.VT500_TRANSITION_TABLE = (function () {
    var table = new TransitionTable(4095);
    var BYTE_VALUES = 256;
    var blueprint = Array.apply(null, Array(BYTE_VALUES)).map(function (unused, i) { return i; });
    var r = function (start, end) { return blueprint.slice(start, end); };
    var PRINTABLES = r(0x20, 0x7f);
    var EXECUTABLES = r(0x00, 0x18);
    EXECUTABLES.push(0x19);
    EXECUTABLES.push.apply(EXECUTABLES, r(0x1c, 0x20));
    var states = r(0, 13 + 1);
    var state;
    table.setDefault(1, 0);
    table.addMany(PRINTABLES, 0, 2, 0);
    for (state in states) {
        table.addMany([0x18, 0x1a, 0x99, 0x9a], state, 3, 0);
        table.addMany(r(0x80, 0x90), state, 3, 0);
        table.addMany(r(0x90, 0x98), state, 3, 0);
        table.add(0x9c, state, 0, 0);
        table.add(0x1b, state, 11, 1);
        table.add(0x9d, state, 4, 8);
        table.addMany([0x98, 0x9e, 0x9f], state, 0, 7);
        table.add(0x9b, state, 11, 3);
        table.add(0x90, state, 11, 9);
    }
    table.addMany(EXECUTABLES, 0, 3, 0);
    table.addMany(EXECUTABLES, 1, 3, 1);
    table.add(0x7f, 1, 0, 1);
    table.addMany(EXECUTABLES, 8, 0, 8);
    table.addMany(EXECUTABLES, 3, 3, 3);
    table.add(0x7f, 3, 0, 3);
    table.addMany(EXECUTABLES, 4, 3, 4);
    table.add(0x7f, 4, 0, 4);
    table.addMany(EXECUTABLES, 6, 3, 6);
    table.addMany(EXECUTABLES, 5, 3, 5);
    table.add(0x7f, 5, 0, 5);
    table.addMany(EXECUTABLES, 2, 3, 2);
    table.add(0x7f, 2, 0, 2);
    table.add(0x5d, 1, 4, 8);
    table.addMany(PRINTABLES, 8, 5, 8);
    table.add(0x7f, 8, 5, 8);
    table.addMany([0x9c, 0x1b, 0x18, 0x1a, 0x07], 8, 6, 0);
    table.addMany(r(0x1c, 0x20), 8, 0, 8);
    table.addMany([0x58, 0x5e, 0x5f], 1, 0, 7);
    table.addMany(PRINTABLES, 7, 0, 7);
    table.addMany(EXECUTABLES, 7, 0, 7);
    table.add(0x9c, 7, 0, 0);
    table.add(0x7f, 7, 0, 7);
    table.add(0x5b, 1, 11, 3);
    table.addMany(r(0x40, 0x7f), 3, 7, 0);
    table.addMany(r(0x30, 0x3c), 3, 8, 4);
    table.addMany([0x3c, 0x3d, 0x3e, 0x3f], 3, 9, 4);
    table.addMany(r(0x30, 0x3c), 4, 8, 4);
    table.addMany(r(0x40, 0x7f), 4, 7, 0);
    table.addMany([0x3c, 0x3d, 0x3e, 0x3f], 4, 0, 6);
    table.addMany(r(0x20, 0x40), 6, 0, 6);
    table.add(0x7f, 6, 0, 6);
    table.addMany(r(0x40, 0x7f), 6, 0, 0);
    table.addMany(r(0x20, 0x30), 3, 9, 5);
    table.addMany(r(0x20, 0x30), 5, 9, 5);
    table.addMany(r(0x30, 0x40), 5, 0, 6);
    table.addMany(r(0x40, 0x7f), 5, 7, 0);
    table.addMany(r(0x20, 0x30), 4, 9, 5);
    table.addMany(r(0x20, 0x30), 1, 9, 2);
    table.addMany(r(0x20, 0x30), 2, 9, 2);
    table.addMany(r(0x30, 0x7f), 2, 10, 0);
    table.addMany(r(0x30, 0x50), 1, 10, 0);
    table.addMany(r(0x51, 0x58), 1, 10, 0);
    table.addMany([0x59, 0x5a, 0x5c], 1, 10, 0);
    table.addMany(r(0x60, 0x7f), 1, 10, 0);
    table.add(0x50, 1, 11, 9);
    table.addMany(EXECUTABLES, 9, 0, 9);
    table.add(0x7f, 9, 0, 9);
    table.addMany(r(0x1c, 0x20), 9, 0, 9);
    table.addMany(r(0x20, 0x30), 9, 9, 12);
    table.addMany(r(0x30, 0x3c), 9, 8, 10);
    table.addMany([0x3c, 0x3d, 0x3e, 0x3f], 9, 9, 10);
    table.addMany(EXECUTABLES, 11, 0, 11);
    table.addMany(r(0x20, 0x80), 11, 0, 11);
    table.addMany(r(0x1c, 0x20), 11, 0, 11);
    table.addMany(EXECUTABLES, 10, 0, 10);
    table.add(0x7f, 10, 0, 10);
    table.addMany(r(0x1c, 0x20), 10, 0, 10);
    table.addMany(r(0x30, 0x3c), 10, 8, 10);
    table.addMany([0x3c, 0x3d, 0x3e, 0x3f], 10, 0, 11);
    table.addMany(r(0x20, 0x30), 10, 9, 12);
    table.addMany(EXECUTABLES, 12, 0, 12);
    table.add(0x7f, 12, 0, 12);
    table.addMany(r(0x1c, 0x20), 12, 0, 12);
    table.addMany(r(0x20, 0x30), 12, 9, 12);
    table.addMany(r(0x30, 0x40), 12, 0, 11);
    table.addMany(r(0x40, 0x7f), 12, 12, 13);
    table.addMany(r(0x40, 0x7f), 10, 12, 13);
    table.addMany(r(0x40, 0x7f), 9, 12, 13);
    table.addMany(EXECUTABLES, 13, 13, 13);
    table.addMany(PRINTABLES, 13, 13, 13);
    table.add(0x7f, 13, 0, 13);
    table.addMany([0x1b, 0x9c, 0x18, 0x1a], 13, 14, 0);
    table.add(NON_ASCII_PRINTABLE, 0, 2, 0);
    table.add(NON_ASCII_PRINTABLE, 8, 5, 8);
    table.add(NON_ASCII_PRINTABLE, 6, 0, 6);
    table.add(NON_ASCII_PRINTABLE, 11, 0, 11);
    table.add(NON_ASCII_PRINTABLE, 13, 13, 13);
    return table;
})();
var EscapeSequenceParser = (function (_super) {
    __extends(EscapeSequenceParser, _super);
    function EscapeSequenceParser(_transitions) {
        if (_transitions === void 0) { _transitions = exports.VT500_TRANSITION_TABLE; }
        var _this = _super.call(this) || this;
        _this._transitions = _transitions;
        _this.initialState = 0;
        _this.currentState = _this.initialState;
        _this._params = new Params_1.Params();
        _this._params.addParam(0);
        _this._collect = 0;
        _this.precedingCodepoint = 0;
        _this._printHandlerFb = function (data, start, end) { };
        _this._executeHandlerFb = function (code) { };
        _this._csiHandlerFb = function (ident, params) { };
        _this._escHandlerFb = function (ident) { };
        _this._errorHandlerFb = function (state) { return state; };
        _this._printHandler = _this._printHandlerFb;
        _this._executeHandlers = Object.create(null);
        _this._csiHandlers = Object.create(null);
        _this._escHandlers = Object.create(null);
        _this._oscParser = new OscParser_1.OscParser();
        _this._dcsParser = new DcsParser_1.DcsParser();
        _this._errorHandler = _this._errorHandlerFb;
        _this.registerEscHandler({ final: '\\' }, function () { return true; });
        return _this;
    }
    EscapeSequenceParser.prototype._identifier = function (id, finalRange) {
        if (finalRange === void 0) { finalRange = [0x40, 0x7e]; }
        var res = 0;
        if (id.prefix) {
            if (id.prefix.length > 1) {
                throw new Error('only one byte as prefix supported');
            }
            res = id.prefix.charCodeAt(0);
            if (res && 0x3c > res || res > 0x3f) {
                throw new Error('prefix must be in range 0x3c .. 0x3f');
            }
        }
        if (id.intermediates) {
            if (id.intermediates.length > 2) {
                throw new Error('only two bytes as intermediates are supported');
            }
            for (var i = 0; i < id.intermediates.length; ++i) {
                var intermediate = id.intermediates.charCodeAt(i);
                if (0x20 > intermediate || intermediate > 0x2f) {
                    throw new Error('intermediate must be in range 0x20 .. 0x2f');
                }
                res <<= 8;
                res |= intermediate;
            }
        }
        if (id.final.length !== 1) {
            throw new Error('final must be a single byte');
        }
        var finalCode = id.final.charCodeAt(0);
        if (finalRange[0] > finalCode || finalCode > finalRange[1]) {
            throw new Error("final must be in range " + finalRange[0] + " .. " + finalRange[1]);
        }
        res <<= 8;
        res |= finalCode;
        return res;
    };
    EscapeSequenceParser.prototype.identToString = function (ident) {
        var res = [];
        while (ident) {
            res.push(String.fromCharCode(ident & 0xFF));
            ident >>= 8;
        }
        return res.reverse().join('');
    };
    EscapeSequenceParser.prototype.dispose = function () {
        this._csiHandlers = Object.create(null);
        this._executeHandlers = Object.create(null);
        this._escHandlers = Object.create(null);
        this._oscParser.dispose();
        this._dcsParser.dispose();
    };
    EscapeSequenceParser.prototype.setPrintHandler = function (handler) {
        this._printHandler = handler;
    };
    EscapeSequenceParser.prototype.clearPrintHandler = function () {
        this._printHandler = this._printHandlerFb;
    };
    EscapeSequenceParser.prototype.registerEscHandler = function (id, handler) {
        var ident = this._identifier(id, [0x30, 0x7e]);
        if (this._escHandlers[ident] === undefined) {
            this._escHandlers[ident] = [];
        }
        var handlerList = this._escHandlers[ident];
        handlerList.push(handler);
        return {
            dispose: function () {
                var handlerIndex = handlerList.indexOf(handler);
                if (handlerIndex !== -1) {
                    handlerList.splice(handlerIndex, 1);
                }
            }
        };
    };
    EscapeSequenceParser.prototype.clearEscHandler = function (id) {
        if (this._escHandlers[this._identifier(id, [0x30, 0x7e])])
            delete this._escHandlers[this._identifier(id, [0x30, 0x7e])];
    };
    EscapeSequenceParser.prototype.setEscHandlerFallback = function (handler) {
        this._escHandlerFb = handler;
    };
    EscapeSequenceParser.prototype.setExecuteHandler = function (flag, handler) {
        this._executeHandlers[flag.charCodeAt(0)] = handler;
    };
    EscapeSequenceParser.prototype.clearExecuteHandler = function (flag) {
        if (this._executeHandlers[flag.charCodeAt(0)])
            delete this._executeHandlers[flag.charCodeAt(0)];
    };
    EscapeSequenceParser.prototype.setExecuteHandlerFallback = function (handler) {
        this._executeHandlerFb = handler;
    };
    EscapeSequenceParser.prototype.registerCsiHandler = function (id, handler) {
        var ident = this._identifier(id);
        if (this._csiHandlers[ident] === undefined) {
            this._csiHandlers[ident] = [];
        }
        var handlerList = this._csiHandlers[ident];
        handlerList.push(handler);
        return {
            dispose: function () {
                var handlerIndex = handlerList.indexOf(handler);
                if (handlerIndex !== -1) {
                    handlerList.splice(handlerIndex, 1);
                }
            }
        };
    };
    EscapeSequenceParser.prototype.clearCsiHandler = function (id) {
        if (this._csiHandlers[this._identifier(id)])
            delete this._csiHandlers[this._identifier(id)];
    };
    EscapeSequenceParser.prototype.setCsiHandlerFallback = function (callback) {
        this._csiHandlerFb = callback;
    };
    EscapeSequenceParser.prototype.registerDcsHandler = function (id, handler) {
        return this._dcsParser.registerHandler(this._identifier(id), handler);
    };
    EscapeSequenceParser.prototype.clearDcsHandler = function (id) {
        this._dcsParser.clearHandler(this._identifier(id));
    };
    EscapeSequenceParser.prototype.setDcsHandlerFallback = function (handler) {
        this._dcsParser.setHandlerFallback(handler);
    };
    EscapeSequenceParser.prototype.registerOscHandler = function (ident, handler) {
        return this._oscParser.registerHandler(ident, handler);
    };
    EscapeSequenceParser.prototype.clearOscHandler = function (ident) {
        this._oscParser.clearHandler(ident);
    };
    EscapeSequenceParser.prototype.setOscHandlerFallback = function (handler) {
        this._oscParser.setHandlerFallback(handler);
    };
    EscapeSequenceParser.prototype.setErrorHandler = function (callback) {
        this._errorHandler = callback;
    };
    EscapeSequenceParser.prototype.clearErrorHandler = function () {
        this._errorHandler = this._errorHandlerFb;
    };
    EscapeSequenceParser.prototype.reset = function () {
        this.currentState = this.initialState;
        this._oscParser.reset();
        this._dcsParser.reset();
        this._params.reset();
        this._params.addParam(0);
        this._collect = 0;
        this.precedingCodepoint = 0;
    };
    EscapeSequenceParser.prototype.parse = function (data, length) {
        var code = 0;
        var transition = 0;
        var currentState = this.currentState;
        var osc = this._oscParser;
        var dcs = this._dcsParser;
        var collect = this._collect;
        var params = this._params;
        var table = this._transitions.table;
        for (var i = 0; i < length; ++i) {
            code = data[i];
            transition = table[currentState << 8 | (code < 0xa0 ? code : NON_ASCII_PRINTABLE)];
            switch (transition >> 4) {
                case 2:
                    for (var j_1 = i + 1;; ++j_1) {
                        if (j_1 >= length || (code = data[j_1]) < 0x20 || (code > 0x7e && code < NON_ASCII_PRINTABLE)) {
                            this._printHandler(data, i, j_1);
                            i = j_1 - 1;
                            break;
                        }
                        if (++j_1 >= length || (code = data[j_1]) < 0x20 || (code > 0x7e && code < NON_ASCII_PRINTABLE)) {
                            this._printHandler(data, i, j_1);
                            i = j_1 - 1;
                            break;
                        }
                        if (++j_1 >= length || (code = data[j_1]) < 0x20 || (code > 0x7e && code < NON_ASCII_PRINTABLE)) {
                            this._printHandler(data, i, j_1);
                            i = j_1 - 1;
                            break;
                        }
                        if (++j_1 >= length || (code = data[j_1]) < 0x20 || (code > 0x7e && code < NON_ASCII_PRINTABLE)) {
                            this._printHandler(data, i, j_1);
                            i = j_1 - 1;
                            break;
                        }
                    }
                    break;
                case 3:
                    if (this._executeHandlers[code])
                        this._executeHandlers[code]();
                    else
                        this._executeHandlerFb(code);
                    this.precedingCodepoint = 0;
                    break;
                case 0:
                    break;
                case 1:
                    var inject = this._errorHandler({
                        position: i,
                        code: code,
                        currentState: currentState,
                        collect: collect,
                        params: params,
                        abort: false
                    });
                    if (inject.abort)
                        return;
                    break;
                case 7:
                    var handlers = this._csiHandlers[collect << 8 | code];
                    var j = handlers ? handlers.length - 1 : -1;
                    for (; j >= 0; j--) {
                        if (handlers[j](params)) {
                            break;
                        }
                    }
                    if (j < 0) {
                        this._csiHandlerFb(collect << 8 | code, params);
                    }
                    this.precedingCodepoint = 0;
                    break;
                case 8:
                    do {
                        switch (code) {
                            case 0x3b:
                                params.addParam(0);
                                break;
                            case 0x3a:
                                params.addSubParam(-1);
                                break;
                            default:
                                params.addDigit(code - 48);
                        }
                    } while (++i < length && (code = data[i]) > 0x2f && code < 0x3c);
                    i--;
                    break;
                case 9:
                    collect <<= 8;
                    collect |= code;
                    break;
                case 10:
                    var handlersEsc = this._escHandlers[collect << 8 | code];
                    var jj = handlersEsc ? handlersEsc.length - 1 : -1;
                    for (; jj >= 0; jj--) {
                        if (handlersEsc[jj]()) {
                            break;
                        }
                    }
                    if (jj < 0) {
                        this._escHandlerFb(collect << 8 | code);
                    }
                    this.precedingCodepoint = 0;
                    break;
                case 11:
                    params.reset();
                    params.addParam(0);
                    collect = 0;
                    break;
                case 12:
                    dcs.hook(collect << 8 | code, params);
                    break;
                case 13:
                    for (var j_2 = i + 1;; ++j_2) {
                        if (j_2 >= length || (code = data[j_2]) === 0x18 || code === 0x1a || code === 0x1b || (code > 0x7f && code < NON_ASCII_PRINTABLE)) {
                            dcs.put(data, i, j_2);
                            i = j_2 - 1;
                            break;
                        }
                    }
                    break;
                case 14:
                    dcs.unhook(code !== 0x18 && code !== 0x1a);
                    if (code === 0x1b)
                        transition |= 1;
                    params.reset();
                    params.addParam(0);
                    collect = 0;
                    this.precedingCodepoint = 0;
                    break;
                case 4:
                    osc.start();
                    break;
                case 5:
                    for (var j_3 = i + 1;; j_3++) {
                        if (j_3 >= length || (code = data[j_3]) < 0x20 || (code > 0x7f && code < NON_ASCII_PRINTABLE)) {
                            osc.put(data, i, j_3);
                            i = j_3 - 1;
                            break;
                        }
                    }
                    break;
                case 6:
                    osc.end(code !== 0x18 && code !== 0x1a);
                    if (code === 0x1b)
                        transition |= 1;
                    params.reset();
                    params.addParam(0);
                    collect = 0;
                    this.precedingCodepoint = 0;
                    break;
            }
            currentState = transition & 15;
        }
        this._collect = collect;
        this.currentState = currentState;
    };
    return EscapeSequenceParser;
}(Lifecycle_1.Disposable));
exports.EscapeSequenceParser = EscapeSequenceParser;


/***/ }),

/***/ "./out/common/parser/OscParser.js":
/*!****************************************!*\
  !*** ./out/common/parser/OscParser.js ***!
  \****************************************/
/*! flagged exports */
/*! export OscHandler [provided] [no usage info] [missing usage info prevents renaming] */
/*! export OscParser [provided] [no usage info] [missing usage info prevents renaming] */
/*! export __esModule [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_exports__, __webpack_require__ */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.OscHandler = exports.OscParser = void 0;
var Constants_1 = __webpack_require__(/*! common/parser/Constants */ "./out/common/parser/Constants.js");
var TextDecoder_1 = __webpack_require__(/*! common/input/TextDecoder */ "./out/common/input/TextDecoder.js");
var EMPTY_HANDLERS = [];
var OscParser = (function () {
    function OscParser() {
        this._state = 0;
        this._active = EMPTY_HANDLERS;
        this._id = -1;
        this._handlers = Object.create(null);
        this._handlerFb = function () { };
    }
    OscParser.prototype.registerHandler = function (ident, handler) {
        if (this._handlers[ident] === undefined) {
            this._handlers[ident] = [];
        }
        var handlerList = this._handlers[ident];
        handlerList.push(handler);
        return {
            dispose: function () {
                var handlerIndex = handlerList.indexOf(handler);
                if (handlerIndex !== -1) {
                    handlerList.splice(handlerIndex, 1);
                }
            }
        };
    };
    OscParser.prototype.clearHandler = function (ident) {
        if (this._handlers[ident])
            delete this._handlers[ident];
    };
    OscParser.prototype.setHandlerFallback = function (handler) {
        this._handlerFb = handler;
    };
    OscParser.prototype.dispose = function () {
        this._handlers = Object.create(null);
        this._handlerFb = function () { };
        this._active = EMPTY_HANDLERS;
    };
    OscParser.prototype.reset = function () {
        if (this._state === 2) {
            this.end(false);
        }
        this._active = EMPTY_HANDLERS;
        this._id = -1;
        this._state = 0;
    };
    OscParser.prototype._start = function () {
        this._active = this._handlers[this._id] || EMPTY_HANDLERS;
        if (!this._active.length) {
            this._handlerFb(this._id, 'START');
        }
        else {
            for (var j = this._active.length - 1; j >= 0; j--) {
                this._active[j].start();
            }
        }
    };
    OscParser.prototype._put = function (data, start, end) {
        if (!this._active.length) {
            this._handlerFb(this._id, 'PUT', TextDecoder_1.utf32ToString(data, start, end));
        }
        else {
            for (var j = this._active.length - 1; j >= 0; j--) {
                this._active[j].put(data, start, end);
            }
        }
    };
    OscParser.prototype._end = function (success) {
        if (!this._active.length) {
            this._handlerFb(this._id, 'END', success);
        }
        else {
            var j = this._active.length - 1;
            for (; j >= 0; j--) {
                if (this._active[j].end(success)) {
                    break;
                }
            }
            j--;
            for (; j >= 0; j--) {
                this._active[j].end(false);
            }
        }
    };
    OscParser.prototype.start = function () {
        this.reset();
        this._state = 1;
    };
    OscParser.prototype.put = function (data, start, end) {
        if (this._state === 3) {
            return;
        }
        if (this._state === 1) {
            while (start < end) {
                var code = data[start++];
                if (code === 0x3b) {
                    this._state = 2;
                    this._start();
                    break;
                }
                if (code < 0x30 || 0x39 < code) {
                    this._state = 3;
                    return;
                }
                if (this._id === -1) {
                    this._id = 0;
                }
                this._id = this._id * 10 + code - 48;
            }
        }
        if (this._state === 2 && end - start > 0) {
            this._put(data, start, end);
        }
    };
    OscParser.prototype.end = function (success) {
        if (this._state === 0) {
            return;
        }
        if (this._state !== 3) {
            if (this._state === 1) {
                this._start();
            }
            this._end(success);
        }
        this._active = EMPTY_HANDLERS;
        this._id = -1;
        this._state = 0;
    };
    return OscParser;
}());
exports.OscParser = OscParser;
var OscHandler = (function () {
    function OscHandler(_handler) {
        this._handler = _handler;
        this._data = '';
        this._hitLimit = false;
    }
    OscHandler.prototype.start = function () {
        this._data = '';
        this._hitLimit = false;
    };
    OscHandler.prototype.put = function (data, start, end) {
        if (this._hitLimit) {
            return;
        }
        this._data += TextDecoder_1.utf32ToString(data, start, end);
        if (this._data.length > Constants_1.PAYLOAD_LIMIT) {
            this._data = '';
            this._hitLimit = true;
        }
    };
    OscHandler.prototype.end = function (success) {
        var ret = false;
        if (this._hitLimit) {
            ret = false;
        }
        else if (success) {
            ret = this._handler(this._data);
        }
        this._data = '';
        this._hitLimit = false;
        return ret;
    };
    return OscHandler;
}());
exports.OscHandler = OscHandler;


/***/ }),

/***/ "./out/common/parser/Params.js":
/*!*************************************!*\
  !*** ./out/common/parser/Params.js ***!
  \*************************************/
/*! flagged exports */
/*! export Params [provided] [no usage info] [missing usage info prevents renaming] */
/*! export __esModule [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_exports__ */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Params = void 0;
var MAX_VALUE = 0x7FFFFFFF;
var MAX_SUBPARAMS = 256;
var Params = (function () {
    function Params(maxLength, maxSubParamsLength) {
        if (maxLength === void 0) { maxLength = 32; }
        if (maxSubParamsLength === void 0) { maxSubParamsLength = 32; }
        this.maxLength = maxLength;
        this.maxSubParamsLength = maxSubParamsLength;
        if (maxSubParamsLength > MAX_SUBPARAMS) {
            throw new Error('maxSubParamsLength must not be greater than 256');
        }
        this.params = new Int32Array(maxLength);
        this.length = 0;
        this._subParams = new Int32Array(maxSubParamsLength);
        this._subParamsLength = 0;
        this._subParamsIdx = new Uint16Array(maxLength);
        this._rejectDigits = false;
        this._rejectSubDigits = false;
        this._digitIsSub = false;
    }
    Params.fromArray = function (values) {
        var params = new Params();
        if (!values.length) {
            return params;
        }
        for (var i = (values[0] instanceof Array) ? 1 : 0; i < values.length; ++i) {
            var value = values[i];
            if (value instanceof Array) {
                for (var k = 0; k < value.length; ++k) {
                    params.addSubParam(value[k]);
                }
            }
            else {
                params.addParam(value);
            }
        }
        return params;
    };
    Params.prototype.clone = function () {
        var newParams = new Params(this.maxLength, this.maxSubParamsLength);
        newParams.params.set(this.params);
        newParams.length = this.length;
        newParams._subParams.set(this._subParams);
        newParams._subParamsLength = this._subParamsLength;
        newParams._subParamsIdx.set(this._subParamsIdx);
        newParams._rejectDigits = this._rejectDigits;
        newParams._rejectSubDigits = this._rejectSubDigits;
        newParams._digitIsSub = this._digitIsSub;
        return newParams;
    };
    Params.prototype.toArray = function () {
        var res = [];
        for (var i = 0; i < this.length; ++i) {
            res.push(this.params[i]);
            var start = this._subParamsIdx[i] >> 8;
            var end = this._subParamsIdx[i] & 0xFF;
            if (end - start > 0) {
                res.push(Array.prototype.slice.call(this._subParams, start, end));
            }
        }
        return res;
    };
    Params.prototype.reset = function () {
        this.length = 0;
        this._subParamsLength = 0;
        this._rejectDigits = false;
        this._rejectSubDigits = false;
        this._digitIsSub = false;
    };
    Params.prototype.addParam = function (value) {
        this._digitIsSub = false;
        if (this.length >= this.maxLength) {
            this._rejectDigits = true;
            return;
        }
        if (value < -1) {
            throw new Error('values lesser than -1 are not allowed');
        }
        this._subParamsIdx[this.length] = this._subParamsLength << 8 | this._subParamsLength;
        this.params[this.length++] = value > MAX_VALUE ? MAX_VALUE : value;
    };
    Params.prototype.addSubParam = function (value) {
        this._digitIsSub = true;
        if (!this.length) {
            return;
        }
        if (this._rejectDigits || this._subParamsLength >= this.maxSubParamsLength) {
            this._rejectSubDigits = true;
            return;
        }
        if (value < -1) {
            throw new Error('values lesser than -1 are not allowed');
        }
        this._subParams[this._subParamsLength++] = value > MAX_VALUE ? MAX_VALUE : value;
        this._subParamsIdx[this.length - 1]++;
    };
    Params.prototype.hasSubParams = function (idx) {
        return ((this._subParamsIdx[idx] & 0xFF) - (this._subParamsIdx[idx] >> 8) > 0);
    };
    Params.prototype.getSubParams = function (idx) {
        var start = this._subParamsIdx[idx] >> 8;
        var end = this._subParamsIdx[idx] & 0xFF;
        if (end - start > 0) {
            return this._subParams.subarray(start, end);
        }
        return null;
    };
    Params.prototype.getSubParamsAll = function () {
        var result = {};
        for (var i = 0; i < this.length; ++i) {
            var start = this._subParamsIdx[i] >> 8;
            var end = this._subParamsIdx[i] & 0xFF;
            if (end - start > 0) {
                result[i] = this._subParams.slice(start, end);
            }
        }
        return result;
    };
    Params.prototype.addDigit = function (value) {
        var length;
        if (this._rejectDigits
            || !(length = this._digitIsSub ? this._subParamsLength : this.length)
            || (this._digitIsSub && this._rejectSubDigits)) {
            return;
        }
        var store = this._digitIsSub ? this._subParams : this.params;
        var cur = store[length - 1];
        store[length - 1] = ~cur ? Math.min(cur * 10 + value, MAX_VALUE) : value;
    };
    return Params;
}());
exports.Params = Params;


/***/ }),

/***/ "./out/common/services/BufferService.js":
/*!**********************************************!*\
  !*** ./out/common/services/BufferService.js ***!
  \**********************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: top-level-this-exports, __webpack_exports__, __webpack_require__ */
/*! CommonJS bailout: this is used directly at 2:17-21 */
/*! CommonJS bailout: this is used directly at 15:18-22 */
/*! CommonJS bailout: this is used directly at 21:15-19 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BufferService = exports.MINIMUM_ROWS = exports.MINIMUM_COLS = void 0;
var Services_1 = __webpack_require__(/*! common/services/Services */ "./out/common/services/Services.js");
var BufferSet_1 = __webpack_require__(/*! common/buffer/BufferSet */ "./out/common/buffer/BufferSet.js");
var EventEmitter_1 = __webpack_require__(/*! common/EventEmitter */ "./out/common/EventEmitter.js");
var Lifecycle_1 = __webpack_require__(/*! common/Lifecycle */ "./out/common/Lifecycle.js");
exports.MINIMUM_COLS = 2;
exports.MINIMUM_ROWS = 1;
var BufferService = (function (_super) {
    __extends(BufferService, _super);
    function BufferService(_optionsService) {
        var _this = _super.call(this) || this;
        _this._optionsService = _optionsService;
        _this.isUserScrolling = false;
        _this._onResize = new EventEmitter_1.EventEmitter();
        _this.cols = Math.max(_optionsService.options.cols, exports.MINIMUM_COLS);
        _this.rows = Math.max(_optionsService.options.rows, exports.MINIMUM_ROWS);
        _this.buffers = new BufferSet_1.BufferSet(_optionsService, _this);
        return _this;
    }
    Object.defineProperty(BufferService.prototype, "onResize", {
        get: function () { return this._onResize.event; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BufferService.prototype, "buffer", {
        get: function () { return this.buffers.active; },
        enumerable: false,
        configurable: true
    });
    BufferService.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this.buffers.dispose();
    };
    BufferService.prototype.resize = function (cols, rows) {
        this.cols = cols;
        this.rows = rows;
        this.buffers.resize(cols, rows);
        this.buffers.setupTabStops(this.cols);
        this._onResize.fire({ cols: cols, rows: rows });
    };
    BufferService.prototype.reset = function () {
        this.buffers.reset();
        this.isUserScrolling = false;
    };
    BufferService = __decorate([
        __param(0, Services_1.IOptionsService)
    ], BufferService);
    return BufferService;
}(Lifecycle_1.Disposable));
exports.BufferService = BufferService;


/***/ }),

/***/ "./out/common/services/CharsetService.js":
/*!***********************************************!*\
  !*** ./out/common/services/CharsetService.js ***!
  \***********************************************/
/*! flagged exports */
/*! export CharsetService [provided] [no usage info] [missing usage info prevents renaming] */
/*! export __esModule [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_exports__ */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CharsetService = void 0;
var CharsetService = (function () {
    function CharsetService() {
        this.glevel = 0;
        this._charsets = [];
    }
    CharsetService.prototype.reset = function () {
        this.charset = undefined;
        this._charsets = [];
        this.glevel = 0;
    };
    CharsetService.prototype.setgLevel = function (g) {
        this.glevel = g;
        this.charset = this._charsets[g];
    };
    CharsetService.prototype.setgCharset = function (g, charset) {
        this._charsets[g] = charset;
        if (this.glevel === g) {
            this.charset = charset;
        }
    };
    return CharsetService;
}());
exports.CharsetService = CharsetService;


/***/ }),

/***/ "./out/common/services/CoreMouseService.js":
/*!*************************************************!*\
  !*** ./out/common/services/CoreMouseService.js ***!
  \*************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: top-level-this-exports, __webpack_exports__, __webpack_require__ */
/*! CommonJS bailout: this is used directly at 2:18-22 */
/*! CommonJS bailout: this is used directly at 8:15-19 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CoreMouseService = void 0;
var Services_1 = __webpack_require__(/*! common/services/Services */ "./out/common/services/Services.js");
var EventEmitter_1 = __webpack_require__(/*! common/EventEmitter */ "./out/common/EventEmitter.js");
var DEFAULT_PROTOCOLS = {
    NONE: {
        events: 0,
        restrict: function () { return false; }
    },
    X10: {
        events: 1,
        restrict: function (e) {
            if (e.button === 4 || e.action !== 1) {
                return false;
            }
            e.ctrl = false;
            e.alt = false;
            e.shift = false;
            return true;
        }
    },
    VT200: {
        events: 1 | 2 | 16,
        restrict: function (e) {
            if (e.action === 32) {
                return false;
            }
            return true;
        }
    },
    DRAG: {
        events: 1 | 2 | 16 | 4,
        restrict: function (e) {
            if (e.action === 32 && e.button === 3) {
                return false;
            }
            return true;
        }
    },
    ANY: {
        events: 1 | 2 | 16
            | 4 | 8,
        restrict: function (e) { return true; }
    }
};
function eventCode(e, isSGR) {
    var code = (e.ctrl ? 16 : 0) | (e.shift ? 4 : 0) | (e.alt ? 8 : 0);
    if (e.button === 4) {
        code |= 64;
        code |= e.action;
    }
    else {
        code |= e.button & 3;
        if (e.button & 4) {
            code |= 64;
        }
        if (e.button & 8) {
            code |= 128;
        }
        if (e.action === 32) {
            code |= 32;
        }
        else if (e.action === 0 && !isSGR) {
            code |= 3;
        }
    }
    return code;
}
var S = String.fromCharCode;
var DEFAULT_ENCODINGS = {
    DEFAULT: function (e) {
        var params = [eventCode(e, false) + 32, e.col + 32, e.row + 32];
        if (params[0] > 255 || params[1] > 255 || params[2] > 255) {
            return '';
        }
        return "\u001B[M" + S(params[0]) + S(params[1]) + S(params[2]);
    },
    SGR: function (e) {
        var final = (e.action === 0 && e.button !== 4) ? 'm' : 'M';
        return "\u001B[<" + eventCode(e, true) + ";" + e.col + ";" + e.row + final;
    }
};
var CoreMouseService = (function () {
    function CoreMouseService(_bufferService, _coreService) {
        this._bufferService = _bufferService;
        this._coreService = _coreService;
        this._protocols = {};
        this._encodings = {};
        this._activeProtocol = '';
        this._activeEncoding = '';
        this._onProtocolChange = new EventEmitter_1.EventEmitter();
        this._lastEvent = null;
        for (var _i = 0, _a = Object.keys(DEFAULT_PROTOCOLS); _i < _a.length; _i++) {
            var name_1 = _a[_i];
            this.addProtocol(name_1, DEFAULT_PROTOCOLS[name_1]);
        }
        for (var _b = 0, _c = Object.keys(DEFAULT_ENCODINGS); _b < _c.length; _b++) {
            var name_2 = _c[_b];
            this.addEncoding(name_2, DEFAULT_ENCODINGS[name_2]);
        }
        this.reset();
    }
    CoreMouseService.prototype.addProtocol = function (name, protocol) {
        this._protocols[name] = protocol;
    };
    CoreMouseService.prototype.addEncoding = function (name, encoding) {
        this._encodings[name] = encoding;
    };
    Object.defineProperty(CoreMouseService.prototype, "activeProtocol", {
        get: function () {
            return this._activeProtocol;
        },
        set: function (name) {
            if (!this._protocols[name]) {
                throw new Error("unknown protocol \"" + name + "\"");
            }
            this._activeProtocol = name;
            this._onProtocolChange.fire(this._protocols[name].events);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CoreMouseService.prototype, "areMouseEventsActive", {
        get: function () {
            return this._protocols[this._activeProtocol].events !== 0;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CoreMouseService.prototype, "activeEncoding", {
        get: function () {
            return this._activeEncoding;
        },
        set: function (name) {
            if (!this._encodings[name]) {
                throw new Error("unknown encoding \"" + name + "\"");
            }
            this._activeEncoding = name;
        },
        enumerable: false,
        configurable: true
    });
    CoreMouseService.prototype.reset = function () {
        this.activeProtocol = 'NONE';
        this.activeEncoding = 'DEFAULT';
        this._lastEvent = null;
    };
    Object.defineProperty(CoreMouseService.prototype, "onProtocolChange", {
        get: function () {
            return this._onProtocolChange.event;
        },
        enumerable: false,
        configurable: true
    });
    CoreMouseService.prototype.triggerMouseEvent = function (e) {
        if (e.col < 0 || e.col >= this._bufferService.cols
            || e.row < 0 || e.row >= this._bufferService.rows) {
            return false;
        }
        if (e.button === 4 && e.action === 32) {
            return false;
        }
        if (e.button === 3 && e.action !== 32) {
            return false;
        }
        if (e.button !== 4 && (e.action === 2 || e.action === 3)) {
            return false;
        }
        e.col++;
        e.row++;
        if (e.action === 32 && this._lastEvent && this._compareEvents(this._lastEvent, e)) {
            return false;
        }
        if (!this._protocols[this._activeProtocol].restrict(e)) {
            return false;
        }
        var report = this._encodings[this._activeEncoding](e);
        if (report) {
            if (this._activeEncoding === 'DEFAULT') {
                this._coreService.triggerBinaryEvent(report);
            }
            else {
                this._coreService.triggerDataEvent(report, true);
            }
        }
        this._lastEvent = e;
        return true;
    };
    CoreMouseService.prototype.explainEvents = function (events) {
        return {
            down: !!(events & 1),
            up: !!(events & 2),
            drag: !!(events & 4),
            move: !!(events & 8),
            wheel: !!(events & 16)
        };
    };
    CoreMouseService.prototype._compareEvents = function (e1, e2) {
        if (e1.col !== e2.col)
            return false;
        if (e1.row !== e2.row)
            return false;
        if (e1.button !== e2.button)
            return false;
        if (e1.action !== e2.action)
            return false;
        if (e1.ctrl !== e2.ctrl)
            return false;
        if (e1.alt !== e2.alt)
            return false;
        if (e1.shift !== e2.shift)
            return false;
        return true;
    };
    CoreMouseService = __decorate([
        __param(0, Services_1.IBufferService),
        __param(1, Services_1.ICoreService)
    ], CoreMouseService);
    return CoreMouseService;
}());
exports.CoreMouseService = CoreMouseService;


/***/ }),

/***/ "./out/common/services/CoreService.js":
/*!********************************************!*\
  !*** ./out/common/services/CoreService.js ***!
  \********************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: top-level-this-exports, __webpack_exports__, __webpack_require__ */
/*! CommonJS bailout: this is used directly at 2:17-21 */
/*! CommonJS bailout: this is used directly at 15:18-22 */
/*! CommonJS bailout: this is used directly at 21:15-19 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CoreService = void 0;
var Services_1 = __webpack_require__(/*! common/services/Services */ "./out/common/services/Services.js");
var EventEmitter_1 = __webpack_require__(/*! common/EventEmitter */ "./out/common/EventEmitter.js");
var Clone_1 = __webpack_require__(/*! common/Clone */ "./out/common/Clone.js");
var Lifecycle_1 = __webpack_require__(/*! common/Lifecycle */ "./out/common/Lifecycle.js");
var DEFAULT_MODES = Object.freeze({
    insertMode: false
});
var DEFAULT_DEC_PRIVATE_MODES = Object.freeze({
    applicationCursorKeys: false,
    applicationKeypad: false,
    bracketedPasteMode: false,
    origin: false,
    reverseWraparound: false,
    sendFocus: false,
    wraparound: true
});
var CoreService = (function (_super) {
    __extends(CoreService, _super);
    function CoreService(scrollToBottom, _bufferService, _logService, _optionsService) {
        var _this = _super.call(this) || this;
        _this._bufferService = _bufferService;
        _this._logService = _logService;
        _this._optionsService = _optionsService;
        _this.isCursorInitialized = false;
        _this.isCursorHidden = false;
        _this._onData = _this.register(new EventEmitter_1.EventEmitter());
        _this._onUserInput = _this.register(new EventEmitter_1.EventEmitter());
        _this._onBinary = _this.register(new EventEmitter_1.EventEmitter());
        _this._scrollToBottom = scrollToBottom;
        _this.register({ dispose: function () { return _this._scrollToBottom = undefined; } });
        _this.modes = Clone_1.clone(DEFAULT_MODES);
        _this.decPrivateModes = Clone_1.clone(DEFAULT_DEC_PRIVATE_MODES);
        return _this;
    }
    Object.defineProperty(CoreService.prototype, "onData", {
        get: function () { return this._onData.event; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CoreService.prototype, "onUserInput", {
        get: function () { return this._onUserInput.event; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CoreService.prototype, "onBinary", {
        get: function () { return this._onBinary.event; },
        enumerable: false,
        configurable: true
    });
    CoreService.prototype.reset = function () {
        this.modes = Clone_1.clone(DEFAULT_MODES);
        this.decPrivateModes = Clone_1.clone(DEFAULT_DEC_PRIVATE_MODES);
    };
    CoreService.prototype.triggerDataEvent = function (data, wasUserInput) {
        if (wasUserInput === void 0) { wasUserInput = false; }
        if (this._optionsService.options.disableStdin) {
            return;
        }
        var buffer = this._bufferService.buffer;
        if (buffer.ybase !== buffer.ydisp) {
            this._scrollToBottom();
        }
        if (wasUserInput) {
            this._onUserInput.fire();
        }
        this._logService.debug("sending data \"" + data + "\"", function () { return data.split('').map(function (e) { return e.charCodeAt(0); }); });
        this._onData.fire(data);
    };
    CoreService.prototype.triggerBinaryEvent = function (data) {
        if (this._optionsService.options.disableStdin) {
            return;
        }
        this._logService.debug("sending binary \"" + data + "\"", function () { return data.split('').map(function (e) { return e.charCodeAt(0); }); });
        this._onBinary.fire(data);
    };
    CoreService = __decorate([
        __param(1, Services_1.IBufferService),
        __param(2, Services_1.ILogService),
        __param(3, Services_1.IOptionsService)
    ], CoreService);
    return CoreService;
}(Lifecycle_1.Disposable));
exports.CoreService = CoreService;


/***/ }),

/***/ "./out/common/services/DirtyRowService.js":
/*!************************************************!*\
  !*** ./out/common/services/DirtyRowService.js ***!
  \************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: top-level-this-exports, __webpack_exports__, __webpack_require__ */
/*! CommonJS bailout: this is used directly at 2:18-22 */
/*! CommonJS bailout: this is used directly at 8:15-19 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DirtyRowService = void 0;
var Services_1 = __webpack_require__(/*! common/services/Services */ "./out/common/services/Services.js");
var DirtyRowService = (function () {
    function DirtyRowService(_bufferService) {
        this._bufferService = _bufferService;
        this.clearRange();
    }
    Object.defineProperty(DirtyRowService.prototype, "start", {
        get: function () { return this._start; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DirtyRowService.prototype, "end", {
        get: function () { return this._end; },
        enumerable: false,
        configurable: true
    });
    DirtyRowService.prototype.clearRange = function () {
        this._start = this._bufferService.buffer.y;
        this._end = this._bufferService.buffer.y;
    };
    DirtyRowService.prototype.markDirty = function (y) {
        if (y < this._start) {
            this._start = y;
        }
        else if (y > this._end) {
            this._end = y;
        }
    };
    DirtyRowService.prototype.markRangeDirty = function (y1, y2) {
        if (y1 > y2) {
            var temp = y1;
            y1 = y2;
            y2 = temp;
        }
        if (y1 < this._start) {
            this._start = y1;
        }
        if (y2 > this._end) {
            this._end = y2;
        }
    };
    DirtyRowService.prototype.markAllDirty = function () {
        this.markRangeDirty(0, this._bufferService.rows - 1);
    };
    DirtyRowService = __decorate([
        __param(0, Services_1.IBufferService)
    ], DirtyRowService);
    return DirtyRowService;
}());
exports.DirtyRowService = DirtyRowService;


/***/ }),

/***/ "./out/common/services/InstantiationService.js":
/*!*****************************************************!*\
  !*** ./out/common/services/InstantiationService.js ***!
  \*****************************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: top-level-this-exports, __webpack_exports__, __webpack_require__ */
/*! CommonJS bailout: this is used directly at 2:22-26 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.InstantiationService = exports.ServiceCollection = void 0;
var Services_1 = __webpack_require__(/*! common/services/Services */ "./out/common/services/Services.js");
var ServiceRegistry_1 = __webpack_require__(/*! common/services/ServiceRegistry */ "./out/common/services/ServiceRegistry.js");
var ServiceCollection = (function () {
    function ServiceCollection() {
        var entries = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            entries[_i] = arguments[_i];
        }
        this._entries = new Map();
        for (var _a = 0, entries_1 = entries; _a < entries_1.length; _a++) {
            var _b = entries_1[_a], id = _b[0], service = _b[1];
            this.set(id, service);
        }
    }
    ServiceCollection.prototype.set = function (id, instance) {
        var result = this._entries.get(id);
        this._entries.set(id, instance);
        return result;
    };
    ServiceCollection.prototype.forEach = function (callback) {
        this._entries.forEach(function (value, key) { return callback(key, value); });
    };
    ServiceCollection.prototype.has = function (id) {
        return this._entries.has(id);
    };
    ServiceCollection.prototype.get = function (id) {
        return this._entries.get(id);
    };
    return ServiceCollection;
}());
exports.ServiceCollection = ServiceCollection;
var InstantiationService = (function () {
    function InstantiationService() {
        this._services = new ServiceCollection();
        this._services.set(Services_1.IInstantiationService, this);
    }
    InstantiationService.prototype.setService = function (id, instance) {
        this._services.set(id, instance);
    };
    InstantiationService.prototype.getService = function (id) {
        return this._services.get(id);
    };
    InstantiationService.prototype.createInstance = function (ctor) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var serviceDependencies = ServiceRegistry_1.getServiceDependencies(ctor).sort(function (a, b) { return a.index - b.index; });
        var serviceArgs = [];
        for (var _a = 0, serviceDependencies_1 = serviceDependencies; _a < serviceDependencies_1.length; _a++) {
            var dependency = serviceDependencies_1[_a];
            var service = this._services.get(dependency.id);
            if (!service) {
                throw new Error("[createInstance] " + ctor.name + " depends on UNKNOWN service " + dependency.id + ".");
            }
            serviceArgs.push(service);
        }
        var firstServiceArgPos = serviceDependencies.length > 0 ? serviceDependencies[0].index : args.length;
        if (args.length !== firstServiceArgPos) {
            throw new Error("[createInstance] First service dependency of " + ctor.name + " at position " + (firstServiceArgPos + 1) + " conflicts with " + args.length + " static arguments");
        }
        return new (ctor.bind.apply(ctor, __spreadArrays([void 0], __spreadArrays(args, serviceArgs))))();
    };
    return InstantiationService;
}());
exports.InstantiationService = InstantiationService;


/***/ }),

/***/ "./out/common/services/LogService.js":
/*!*******************************************!*\
  !*** ./out/common/services/LogService.js ***!
  \*******************************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: top-level-this-exports, __webpack_exports__, __webpack_require__ */
/*! CommonJS bailout: this is used directly at 2:18-22 */
/*! CommonJS bailout: this is used directly at 8:15-19 */
/*! CommonJS bailout: this is used directly at 11:22-26 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LogService = exports.LogLevel = void 0;
var Services_1 = __webpack_require__(/*! common/services/Services */ "./out/common/services/Services.js");
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
    LogLevel[LogLevel["INFO"] = 1] = "INFO";
    LogLevel[LogLevel["WARN"] = 2] = "WARN";
    LogLevel[LogLevel["ERROR"] = 3] = "ERROR";
    LogLevel[LogLevel["OFF"] = 4] = "OFF";
})(LogLevel = exports.LogLevel || (exports.LogLevel = {}));
var optionsKeyToLogLevel = {
    debug: LogLevel.DEBUG,
    info: LogLevel.INFO,
    warn: LogLevel.WARN,
    error: LogLevel.ERROR,
    off: LogLevel.OFF
};
var LOG_PREFIX = 'xterm.js: ';
var LogService = (function () {
    function LogService(_optionsService) {
        var _this = this;
        this._optionsService = _optionsService;
        this._updateLogLevel();
        this._optionsService.onOptionChange(function (key) {
            if (key === 'logLevel') {
                _this._updateLogLevel();
            }
        });
    }
    LogService.prototype._updateLogLevel = function () {
        this._logLevel = optionsKeyToLogLevel[this._optionsService.options.logLevel];
    };
    LogService.prototype._evalLazyOptionalParams = function (optionalParams) {
        for (var i = 0; i < optionalParams.length; i++) {
            if (typeof optionalParams[i] === 'function') {
                optionalParams[i] = optionalParams[i]();
            }
        }
    };
    LogService.prototype._log = function (type, message, optionalParams) {
        this._evalLazyOptionalParams(optionalParams);
        type.call.apply(type, __spreadArrays([console, LOG_PREFIX + message], optionalParams));
    };
    LogService.prototype.debug = function (message) {
        var optionalParams = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            optionalParams[_i - 1] = arguments[_i];
        }
        if (this._logLevel <= LogLevel.DEBUG) {
            this._log(console.log, message, optionalParams);
        }
    };
    LogService.prototype.info = function (message) {
        var optionalParams = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            optionalParams[_i - 1] = arguments[_i];
        }
        if (this._logLevel <= LogLevel.INFO) {
            this._log(console.info, message, optionalParams);
        }
    };
    LogService.prototype.warn = function (message) {
        var optionalParams = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            optionalParams[_i - 1] = arguments[_i];
        }
        if (this._logLevel <= LogLevel.WARN) {
            this._log(console.warn, message, optionalParams);
        }
    };
    LogService.prototype.error = function (message) {
        var optionalParams = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            optionalParams[_i - 1] = arguments[_i];
        }
        if (this._logLevel <= LogLevel.ERROR) {
            this._log(console.error, message, optionalParams);
        }
    };
    LogService = __decorate([
        __param(0, Services_1.IOptionsService)
    ], LogService);
    return LogService;
}());
exports.LogService = LogService;


/***/ }),

/***/ "./out/common/services/OptionsService.js":
/*!***********************************************!*\
  !*** ./out/common/services/OptionsService.js ***!
  \***********************************************/
/*! flagged exports */
/*! export DEFAULT_BELL_SOUND [provided] [no usage info] [missing usage info prevents renaming] */
/*! export DEFAULT_OPTIONS [provided] [no usage info] [missing usage info prevents renaming] */
/*! export OptionsService [provided] [no usage info] [missing usage info prevents renaming] */
/*! export __esModule [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_exports__, __webpack_require__ */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.OptionsService = exports.DEFAULT_OPTIONS = exports.DEFAULT_BELL_SOUND = void 0;
var EventEmitter_1 = __webpack_require__(/*! common/EventEmitter */ "./out/common/EventEmitter.js");
var Platform_1 = __webpack_require__(/*! common/Platform */ "./out/common/Platform.js");
var Clone_1 = __webpack_require__(/*! common/Clone */ "./out/common/Clone.js");
exports.DEFAULT_BELL_SOUND = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjMyLjEwNAAAAAAAAAAAAAAA//tQxAADB8AhSmxhIIEVCSiJrDCQBTcu3UrAIwUdkRgQbFAZC1CQEwTJ9mjRvBA4UOLD8nKVOWfh+UlK3z/177OXrfOdKl7pyn3Xf//WreyTRUoAWgBgkOAGbZHBgG1OF6zM82DWbZaUmMBptgQhGjsyYqc9ae9XFz280948NMBWInljyzsNRFLPWdnZGWrddDsjK1unuSrVN9jJsK8KuQtQCtMBjCEtImISdNKJOopIpBFpNSMbIHCSRpRR5iakjTiyzLhchUUBwCgyKiweBv/7UsQbg8isVNoMPMjAAAA0gAAABEVFGmgqK////9bP/6XCykxBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq';
exports.DEFAULT_OPTIONS = Object.freeze({
    cols: 80,
    rows: 24,
    cursorBlink: false,
    cursorStyle: 'block',
    cursorWidth: 1,
    bellSound: exports.DEFAULT_BELL_SOUND,
    bellStyle: 'none',
    drawBoldTextInBrightColors: true,
    fastScrollModifier: 'alt',
    fastScrollSensitivity: 5,
    fontFamily: 'courier-new, courier, monospace',
    fontSize: 15,
    fontWeight: 'normal',
    fontWeightBold: 'bold',
    lineHeight: 1.0,
    linkTooltipHoverDuration: 500,
    letterSpacing: 0,
    logLevel: 'info',
    scrollback: 1000,
    scrollSensitivity: 1,
    screenReaderMode: false,
    macOptionIsMeta: false,
    macOptionClickForcesSelection: false,
    minimumContrastRatio: 1,
    disableStdin: false,
    allowProposedApi: true,
    allowTransparency: false,
    tabStopWidth: 8,
    theme: {},
    rightClickSelectsWord: Platform_1.isMac,
    rendererType: 'canvas',
    windowOptions: {},
    windowsMode: false,
    wordSeparator: ' ()[]{}\',"`',
    altClickMovesCursor: true,
    convertEol: false,
    termName: 'xterm',
    cancelEvents: false
});
var FONT_WEIGHT_OPTIONS = ['normal', 'bold', '100', '200', '300', '400', '500', '600', '700', '800', '900'];
var CONSTRUCTOR_ONLY_OPTIONS = ['cols', 'rows'];
var OptionsService = (function () {
    function OptionsService(options) {
        this._onOptionChange = new EventEmitter_1.EventEmitter();
        this.options = Clone_1.clone(exports.DEFAULT_OPTIONS);
        for (var _i = 0, _a = Object.keys(options); _i < _a.length; _i++) {
            var k = _a[_i];
            if (k in this.options) {
                try {
                    var newValue = options[k];
                    this.options[k] = this._sanitizeAndValidateOption(k, newValue);
                }
                catch (e) {
                    console.error(e);
                }
            }
        }
    }
    Object.defineProperty(OptionsService.prototype, "onOptionChange", {
        get: function () { return this._onOptionChange.event; },
        enumerable: false,
        configurable: true
    });
    OptionsService.prototype.setOption = function (key, value) {
        if (!(key in exports.DEFAULT_OPTIONS)) {
            throw new Error('No option with key "' + key + '"');
        }
        if (CONSTRUCTOR_ONLY_OPTIONS.includes(key)) {
            throw new Error("Option \"" + key + "\" can only be set in the constructor");
        }
        if (this.options[key] === value) {
            return;
        }
        value = this._sanitizeAndValidateOption(key, value);
        if (this.options[key] === value) {
            return;
        }
        this.options[key] = value;
        this._onOptionChange.fire(key);
    };
    OptionsService.prototype._sanitizeAndValidateOption = function (key, value) {
        switch (key) {
            case 'bellStyle':
            case 'cursorStyle':
            case 'rendererType':
            case 'wordSeparator':
                if (!value) {
                    value = exports.DEFAULT_OPTIONS[key];
                }
                break;
            case 'fontWeight':
            case 'fontWeightBold':
                if (typeof value === 'number' && 1 <= value && value <= 1000) {
                    break;
                }
                value = FONT_WEIGHT_OPTIONS.includes(value) ? value : exports.DEFAULT_OPTIONS[key];
                break;
            case 'cursorWidth':
                value = Math.floor(value);
            case 'lineHeight':
            case 'tabStopWidth':
                if (value < 1) {
                    throw new Error(key + " cannot be less than 1, value: " + value);
                }
                break;
            case 'minimumContrastRatio':
                value = Math.max(1, Math.min(21, Math.round(value * 10) / 10));
                break;
            case 'scrollback':
                value = Math.min(value, 4294967295);
                if (value < 0) {
                    throw new Error(key + " cannot be less than 0, value: " + value);
                }
                break;
            case 'fastScrollSensitivity':
            case 'scrollSensitivity':
                if (value <= 0) {
                    throw new Error(key + " cannot be less than or equal to 0, value: " + value);
                }
                break;
        }
        return value;
    };
    OptionsService.prototype.getOption = function (key) {
        if (!(key in exports.DEFAULT_OPTIONS)) {
            throw new Error("No option with key \"" + key + "\"");
        }
        return this.options[key];
    };
    return OptionsService;
}());
exports.OptionsService = OptionsService;


/***/ }),

/***/ "./out/common/services/ServiceRegistry.js":
/*!************************************************!*\
  !*** ./out/common/services/ServiceRegistry.js ***!
  \************************************************/
/*! flagged exports */
/*! export __esModule [provided] [no usage info] [missing usage info prevents renaming] */
/*! export createDecorator [provided] [no usage info] [missing usage info prevents renaming] */
/*! export getServiceDependencies [provided] [no usage info] [missing usage info prevents renaming] */
/*! export serviceRegistry [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_exports__ */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.createDecorator = exports.getServiceDependencies = exports.serviceRegistry = void 0;
var DI_TARGET = 'di$target';
var DI_DEPENDENCIES = 'di$dependencies';
exports.serviceRegistry = new Map();
function getServiceDependencies(ctor) {
    return ctor[DI_DEPENDENCIES] || [];
}
exports.getServiceDependencies = getServiceDependencies;
function createDecorator(id) {
    if (exports.serviceRegistry.has(id)) {
        return exports.serviceRegistry.get(id);
    }
    var decorator = function (target, key, index) {
        if (arguments.length !== 3) {
            throw new Error('@IServiceName-decorator can only be used to decorate a parameter');
        }
        storeServiceDependency(decorator, target, index);
    };
    decorator.toString = function () { return id; };
    exports.serviceRegistry.set(id, decorator);
    return decorator;
}
exports.createDecorator = createDecorator;
function storeServiceDependency(id, target, index) {
    if (target[DI_TARGET] === target) {
        target[DI_DEPENDENCIES].push({ id: id, index: index });
    }
    else {
        target[DI_DEPENDENCIES] = [{ id: id, index: index }];
        target[DI_TARGET] = target;
    }
}


/***/ }),

/***/ "./out/common/services/Services.js":
/*!*****************************************!*\
  !*** ./out/common/services/Services.js ***!
  \*****************************************/
/*! flagged exports */
/*! export IBufferService [provided] [no usage info] [missing usage info prevents renaming] */
/*! export ICharsetService [provided] [no usage info] [missing usage info prevents renaming] */
/*! export ICoreMouseService [provided] [no usage info] [missing usage info prevents renaming] */
/*! export ICoreService [provided] [no usage info] [missing usage info prevents renaming] */
/*! export IDirtyRowService [provided] [no usage info] [missing usage info prevents renaming] */
/*! export IInstantiationService [provided] [no usage info] [missing usage info prevents renaming] */
/*! export ILogService [provided] [no usage info] [missing usage info prevents renaming] */
/*! export IOptionsService [provided] [no usage info] [missing usage info prevents renaming] */
/*! export IUnicodeService [provided] [no usage info] [missing usage info prevents renaming] */
/*! export __esModule [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_exports__, __webpack_require__ */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.IUnicodeService = exports.IOptionsService = exports.ILogService = exports.IInstantiationService = exports.IDirtyRowService = exports.ICharsetService = exports.ICoreService = exports.ICoreMouseService = exports.IBufferService = void 0;
var ServiceRegistry_1 = __webpack_require__(/*! common/services/ServiceRegistry */ "./out/common/services/ServiceRegistry.js");
exports.IBufferService = ServiceRegistry_1.createDecorator('BufferService');
exports.ICoreMouseService = ServiceRegistry_1.createDecorator('CoreMouseService');
exports.ICoreService = ServiceRegistry_1.createDecorator('CoreService');
exports.ICharsetService = ServiceRegistry_1.createDecorator('CharsetService');
exports.IDirtyRowService = ServiceRegistry_1.createDecorator('DirtyRowService');
exports.IInstantiationService = ServiceRegistry_1.createDecorator('InstantiationService');
exports.ILogService = ServiceRegistry_1.createDecorator('LogService');
exports.IOptionsService = ServiceRegistry_1.createDecorator('OptionsService');
exports.IUnicodeService = ServiceRegistry_1.createDecorator('UnicodeService');


/***/ }),

/***/ "./out/common/services/UnicodeService.js":
/*!***********************************************!*\
  !*** ./out/common/services/UnicodeService.js ***!
  \***********************************************/
/*! flagged exports */
/*! export UnicodeService [provided] [no usage info] [missing usage info prevents renaming] */
/*! export __esModule [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_exports__, __webpack_require__ */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UnicodeService = void 0;
var EventEmitter_1 = __webpack_require__(/*! common/EventEmitter */ "./out/common/EventEmitter.js");
var UnicodeV6_1 = __webpack_require__(/*! common/input/UnicodeV6 */ "./out/common/input/UnicodeV6.js");
var UnicodeService = (function () {
    function UnicodeService() {
        this._providers = Object.create(null);
        this._active = '';
        this._onChange = new EventEmitter_1.EventEmitter();
        var defaultProvider = new UnicodeV6_1.UnicodeV6();
        this.register(defaultProvider);
        this._active = defaultProvider.version;
        this._activeProvider = defaultProvider;
    }
    Object.defineProperty(UnicodeService.prototype, "onChange", {
        get: function () { return this._onChange.event; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(UnicodeService.prototype, "versions", {
        get: function () {
            return Object.keys(this._providers);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(UnicodeService.prototype, "activeVersion", {
        get: function () {
            return this._active;
        },
        set: function (version) {
            if (!this._providers[version]) {
                throw new Error("unknown Unicode version \"" + version + "\"");
            }
            this._active = version;
            this._activeProvider = this._providers[version];
            this._onChange.fire(version);
        },
        enumerable: false,
        configurable: true
    });
    UnicodeService.prototype.register = function (provider) {
        this._providers[provider.version] = provider;
    };
    UnicodeService.prototype.wcwidth = function (num) {
        return this._activeProvider.wcwidth(num);
    };
    UnicodeService.prototype.getStringCellWidth = function (s) {
        var result = 0;
        var length = s.length;
        for (var i = 0; i < length; ++i) {
            var code = s.charCodeAt(i);
            if (0xD800 <= code && code <= 0xDBFF) {
                if (++i >= length) {
                    return result + this.wcwidth(code);
                }
                var second = s.charCodeAt(i);
                if (0xDC00 <= second && second <= 0xDFFF) {
                    code = (code - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
                }
                else {
                    result += this.wcwidth(second);
                }
            }
            result += this.wcwidth(code);
        }
        return result;
    };
    return UnicodeService;
}());
exports.UnicodeService = UnicodeService;


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	// module exports must be returned from runtime so entry inlining is disabled
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__("./out/browser/public/Terminal.js");
/******/ })()
;
});
//# sourceMappingURL=xterm.js.map