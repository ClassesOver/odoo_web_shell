/*jslint browser:true */



jQuery(function ($) {


	var status = $('#status'),
		waiter = $('#waiter'),
		$state = $('#state'),
		custom_font = document.fonts ? document.fonts.values().next().value : undefined,
		DISCONNECTED = 0,
		CONNECTING = 1,
		CONNECTED = 2,
		state = DISCONNECTED,
		messages = {1: 'This client is connecting ...', 2: 'This client is already connnected.'}

	function store_items (names, data) {
		var i, name, value

		for (i = 0; i < names.length; i++) {
			name = names[i]
			value = data.get(name)
			if (value) {
				window.localStorage.setItem(name, value)
			}
		}
	}

	function restore_items (names) {
		var i, name, value

		for (i = 0; i < names.length; i++) {
			name = names[i]
			value = window.localStorage.getItem(name)
			if (value) {
				$('#' + name).val(value)
			}
		}
	}

	function set_backgound_color (term, color) {
		term.setOption('theme', {
			background: color
		})
	}

	function custom_font_is_loaded () {
		if (!custom_font) {
			console.log('No custom font specified.')
		} else {
			console.log('Status of custom font ' + custom_font.family + ': ' + custom_font.status)
			if (custom_font.status === 'loaded') {
				return true
			}
			if (custom_font.status === 'unloaded') {
				return false
			}
		}
	}

	function log_status (text, to_populate) {
		console.log(text)
		status.html(text.split('\n').join('<br/>'))

		if (waiter.css('display') !== 'none') {
			waiter.hide()
		}
	}

	function main () {
		const isWindows = ['Windows', 'Win16', 'Win32', 'WinCE'].indexOf(navigator.platform) >= 0
		setInterval(() =>{
			var v = messages[state]
			$state.text(v)
		}, 1000)
		var sock = io({transports: ['websocket']});
		sock.connect()
		state = CONNECTING;
		var encoding = 'utf-8'
		var decoder = window.TextDecoder ? new window.TextDecoder(encoding) : encoding
		var terminal = document.getElementById('terminal')
		var term = new window.Terminal({
			windowsMode: isWindows,
			cursorBlink: false,
			theme: {
				background: '#202B33',
				foreground: '#F5F8FA'
			}
		});
	   term.fitAddon = new window.FitAddon.FitAddon();
        term.loadAddon(term.fitAddon);
		var currentLine = ''
		var entries = []

		term.open(terminal);
		term.fitAddon.fit();
		term.exec_count = 1;
		fetch('/show_banner', {
			method: 'POST',
		}).then((resp) => {
			resp.json().then((data) => {
				let banner = data.banner
				for (let line of banner) {
					term.writeln(line)
				}
				term.exec_count = data.exec_count;
				term.prompt()

			})
		})

		term.prompt = () => {
			term.write(`In [${term.exec_count}]: `)
		}

		term.send = (data) => {
			sock.emit('message', JSON.stringify({method: 'execute', data: data}))
		}

		term.onKey((e) => {
			const ev = e.domEvent
			const printable = !ev.altKey && !ev.ctrlKey && !ev.metaKey

			if (ev.keyCode === 13) {
				if (currentLine) {
					entries.push(currentLine)
					term.write('\r\n')
					term.send(currentLine)
				} else {
					term.write('\r\n')
					term.prompt()
				}
			} else if (ev.keyCode === 8) {
				// Do not delete the prompt
				if (currentLine) {
					currentLine = currentLine.slice(0, currentLine.length - 1)
				}
				console.log(term._core.buffer.x)
				console.log(`In [${term.exec_count}]: `.length)
				if (term._core.buffer.x > `In [${term.exec_count}]: `.length) {
					term_write('\b \b')
				}
			} else if (printable) {
				currentLine += e.key
				term_write(e.key)
				console.log(currentLine)
			}
		})

		function term_write (text) {
			term.write(text)
		}

		term.on_resize = function (cols, rows) {
			if (cols !== this.cols || rows !== this.rows) {
				console.log('Resizing terminal to geometry: ' + format_geometry(cols, rows))
				this.resize(cols, rows)
				sock.emit('resize', [cols, rows])
			}
		}

		sock.on('instance_ready', (isReady) => {})
		sock.on('prompt_for_code', () => {
			term.prompt()
		})
		sock.on('connect', () => {
			sock.emit('open')
		});
		sock.on('disconnect', () => {
			state = DISCONNECTED;
		});
		var memoryEl = document.getElementById('memory-usage');
		var memoryChart = echarts.init(memoryEl);

		let mOption = {
			title: {
				text: 'Memory usage'
			},
			tooltip: {
				trigger: 'axis',
				axisPointer: {
					animation: false
				}
			},
			xAxis: {
				type: 'time',
				minInterval: 1000 * 60,
				axisLabel: {
					formatter: function (value, idx) {
						return moment(value).format('HH:mm')
					},
				},
				splitLine: {
					show: false
				}
			},
			yAxis: {
				type: 'value',
				splitLine: {
					show: false
				}
			},
			series: [{
	        name: 'Memory usage',
	        type: 'line',
	        showSymbol: false,
	        hoverAnimation: false,
	        data: []
	    }]
		}
		memoryChart.setOption(mOption)
		var cpuOption = {
			series: [{
				type: 'gauge',
				progress: {
					show: true,
					width: 8
				},
				axisLine: {
					lineStyle: {
						width: 8
					}
				},
				axisTick: {
					show: false
				},
				splitLine: {
					length: 5,
					lineStyle: {
						width: 1,
						color: '#999'
					}
				},
				axisLabel: {
					distance: 12,
					color: '#999',
					fontSize: 8
				},
				anchor: {
					show: true,
					showAbove: true,
					size: 12,
					itemStyle: {
						borderWidth: 2
					}
				},
				title: {
					show: true,
				},
				detail: {
					valueAnimation: true,
					fontSize: 18,
					offsetCenter: [0, '70%']
				},
				data: [{
					value: 0,
					name: 'cpu'
				}]
			}]
		}
		var cpuEl = document.getElementById('cpu-usage');
		var cpuChart = echarts.init(cpuEl);
		// cpuChart.setOption(cpuOption);
		term.serverInfoStartTime = moment();
		sock.on('server_info', (data) => {
			let l =  data.infos.map((v) => {
				return {
					name: v.time,
					value: [v.time, v.percent]
				}
			})
			memoryChart.setOption({
				series: [{
					data: l
				}]
			})
			console.log(data.info.cpu_percent)
			cpuOption.animationDurationUpdate = 1000;
			cpuOption.series[0].data =  [{
					value: data.info.cpu_percent,
				}];
			cpuChart.setOption(cpuOption, true);
		})


		sock.on('open', function () {
			term.focus()
			state = CONNECTED
		})
		sock.on('message', (msg) => {
			currentLine = ''
			let text = msg.data
			term.exec_count = msg.exec_count
			term.writeln(text)
		})
		sock.on('close', function () {
			term.dispose()
			term = undefined
			sock = undefined
			log_status(e.reason, true)
			state = DISCONNECTED
		})
	}

	if (document.fonts) {
		document.fonts.ready.then(
			function () {
				if (custom_font_is_loaded() === false) {
					document.body.style.fontFamily = custom_font.family
				}
			}
		)
	}


	main()
})
