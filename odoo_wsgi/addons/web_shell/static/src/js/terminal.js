// import { DEFAULT_ATTR_DATA } from 'xterm/src/common/buffer/BufferLine'

odoo.define('web.terminal', function (require) {

	var Widget = require('web.Widget')
	var core = require('web.core')
	var QWeb = core.qweb
	const isWindows = ['Windows', 'Win16', 'Win32', 'WinCE'].indexOf(navigator.platform) >= 0
	var Terminal = Widget.extend({
		template: 'web.Terminal',
		entriesTemplate: 'web.TerminalEntries',
		events: {
			'click .close': '_onClose',
		},
		init: function (parent) {
			this._super.apply(this, arguments)
			this.encoding = 'utf-8'
			this._pointer = -1
			this.decoder = window.TextDecoder ? new window.TextDecoder(this.encoding) : this.encoding
			this.term = new window.Terminal({
				windowsMode: isWindows,
				cursorBlink: true,
				theme: {
					background: '#202B33',
					foreground: '#F5F8FA'
				}
			})
			this.fitAddon = new window.FitAddon.FitAddon()
			this.term.loadAddon(this.fitAddon)
			this.currentLine = ''
			this.entries = []
			this.firstOpen = true
			this.displayed = false

		},
		_onClose: function (ev) {
			this.close()
			this.trigger_up('close')
		},
		open: function () {
			if (this.firstOpen) {
				this.showBanner()
				this.firstOpen = false
			}
			this.term.focus()

		},
		close: function () {

		},
		showBanner: function () {
			let banner = this.bannerData.banner
			for (let line of banner) {
				this.term.writeln(line)
			}
			this.term.exec_count = this.bannerData.exec_count
			this.prompt()
		},
		_onUpDown: function (ev) {
			if (this.$entries) {
				if (ev >= this.entries.length || ev <= -1) {
					return
				}
				$(this.$entries.find('li.active')).removeClass('active')
				$(this.$entries.find('li')[ev]).addClass('active')
			}

		},
		start: function () {
			this.sock = new io({transports: ['websocket', 'polling']})
			this.$terminal = this.$('#terminal')
			this.term.open(this.$terminal[0])
			this.sock.connect()
			this.on('up_down', this, this._onUpDown)
			this._rpc({model: 'web.terminal', method: 'show_banner'}).then((data) => {
				this.bannerData = data
				this.term.focus()
				this.session_id = data.uuid
			})
			this.sock.on('connect', () => {
				this.sock.emit('open')
			})
			this.sock.on('prompt_for_code', () => {
				this.prompt()
			})
			this.sock.on('open', () => {
				this.term.focus()
			})
			this.sock.on('message', (msg) => {
				this.currentLine = ''
				let text = msg.data
				this.term.exec_count = msg.exec_count
				this.term.writeln(text)
			})
			this.sock.on('close', function () {
				this.term.dispose()
			})
			this.bindTermEvents()

		},
		prompt: function () {
			this.term.write(`In [${this.term.exec_count}]: `)
		},
		send: function (data) {
			this.sock.emit('message',
				JSON.stringify({method: 'execute', data: data, http_session_id: this.session_id}))
		},
		termWrite: function (text) {
			this.term.write(text)
		},
		openEntries: function () {
			if (this.$entries) {
				return
			}
			if (this.entries.length > 0) {
				this.$entries = $(QWeb.render(this.entriesTemplate, {entries: this.entries}))
				this.$entries.appendTo(this.$el)
			}

		},
		closeEntries: function () {
			if (this.$entries) {
				this.$entries.remove()
				this.$entries = null
			}
		},
		bindTermEvents: function () {
			this.term.onKey((e) => {
				const ev = e.domEvent
				const printable = !ev.altKey && !ev.ctrlKey && !ev.metaKey
				if (ev.keyCode === 38) {
					this.openEntries()
					if ((this._pointer - 1) < 0) {
						return
					}
					this._pointer = this._pointer - 1
					this.trigger('up_down', this._pointer)
					return
				}
				if (ev.keyCode === 40) {
					this.openEntries()
					if ((this._pointer + 1) > this.entries.length) {
						return
					}
					this._pointer = this._pointer + 1
					this.trigger('up_down', this._pointer)
					return
				}
				if (ev.keyCode === 13) {
					if (this.$entries) {
						let val = this.$entries.find('li.active').text()
						for (let chr of val.trim()) {
							this.currentLine += chr
							this.term.write(chr)
						}
						this.closeEntries()
						return
					}
					if (this.currentLine) {
						this.entries.push(this.currentLine)
						// if (this.currentLine === 'clear') {
						// 	// this.term.clear()
						// }
						this.term.write('\r\n')
						this._pointer = this.entries.length
						this.send(this.currentLine)
					} else {
						this.term.write('\r\n')
						this.prompt()
					}
				} else if (ev.keyCode === 8) {
					this.closeEntries()
					// Do not delete the prompt
					if (this.currentLine) {
						this.currentLine = this.currentLine.slice(0, this.currentLine.length - 1)
					}
					if (this.term._core.buffer.x > `In [${this.term.exec_count}]: `.length) {
						this.termWrite('\b \b')
					}
				} else if (printable) {
					this.closeEntries()
					this.currentLine += e.key
					this.termWrite(e.key)
				}
			})
		},
	})
	return Terminal
})
