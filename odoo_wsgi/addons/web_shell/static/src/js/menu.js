odoo.define('web.terminal_menu', function (require) {
	const SysMenu = require('web.SystrayMenu');
	var Widget = require('web.Widget');
	var Terminal = require('web.terminal')
	var TerminalMenu = Widget.extend({
		events: {
			'click': '_onClick',
		},
		custom_events: {
			'close': '_onClose',
		},
		template: 'web.TerminalMenu',
		init: function (parent) {
			this._super(parent);
			this.opened = false;
			this.$container = $('<div class="o-web-terminal-container" />');

		},
		_onClose: function (ev) {
			this.opened = false
			this.$container.removeClass('opened')
			// this.term.close()
		},
		start: function () {
			this.term = new Terminal(this);
			this.term.appendTo(this.$container);
			this.$container.appendTo('body')
		},
		_onClick: function () {
			this.opened = !this.opened;
			if (this.opened) {
				this.$container.addClass('opened')
				this.term.open()

			} else {
				this.$container.removeClass('opened')
				this.term.close()
			}
		},
	});

	SysMenu.Items.push(TerminalMenu);
})