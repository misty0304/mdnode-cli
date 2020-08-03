#!/usr/bin/env node

const program = require('commander')
const chalk = require('chalk')
const ora = require('ora')
const fs = require('fs')
const inquirer = require('inquirer')
const symbols = require('log-symbols')
const download = require('download-git-repo')
const child_process = require('child_process')
const handlebars = require('handlebars')
const path = require('path')

program
	.version('1.0.0', '-v, --version')
	.command('init <name>')
	.action(name => {
		if (!fs.existsSync(name)) {
			console.log('正在创建项目...')
			inquirer
				.prompt([
					{
						name: 'description',
						message: '请输入项目描述:'
					},
					{
						name: 'port',
						message: '请输入端口号:'
					},
					{
						name: 'localOrigins',
						message: '请输入开发环境允许跨域访问域名(字符串以逗号分隔):'
					},
					{
						name: 'devOrigins',
						message: '请输入开发环境允许跨域访问域名(字符串以逗号分隔):'
					},
					{
						name: 'testOrigins',
						message: '请输入测试环境允许跨域访问域名(字符串以逗号分隔):'
					},
					{
						name: 'proOrigins',
						message: '请输入生产环境允许跨域访问域名(字符串以逗号分隔):'
					}
				])
				.then(answers => {
					const spinner = ora('正在向下载模板...\n')
					spinner.start()
					child_process.exec('git clone http://code.moredian.com:8000/frontEnd/server-format-node.git', function (
						err,
						stdout,
						stderr
					) {
						if (err) {
							spinner.fail()
							console.log(symbols.error, chalk.red('模板下载失败'))
						} else {
							spinner.succeed()
							// 把从git上拉下来的代码移动到创建的项目中
							console.log(__dirname, process.cwd(), process.execPath)
							fs.rename('server-format-node', name, err => {
								if (err) throw err
								console.log('重命名完成')
								// 初始化package.json
								const packageFile = `${name}/package.json`
								const packageFileMeta = {
									name,
									description: answers.description
								}
								if (fs.existsSync(packageFile)) {
									const content = fs.readFileSync(packageFile).toString()
									let dt = JSON.parse(content)
									dt.name = '{{name}}'
									dt.description = '{{description}}'
									const result = handlebars.compile(JSON.stringify(dt, null, 2))(packageFileMeta)
									fs.writeFileSync(packageFile, result)
									console.log(symbols.success, chalk.green('package.json始化完成'))
								} else {
									console.log(symbols.error, chalk.red('package.json不存在'))
								}
								// 初始化
								const configFile = `${__dirname}/user.configModel.js`
								if (fs.existsSync(configFile)) {
									let content = fs.readFileSync(configFile).toString()
									content = content.replace(/{{name}}/, name)
									content = content.replace(/{{port}}/, answers.port)
									content = content.replace(/{{localOrigins}}/, answers.localOrigins)
									content = content.replace(/{{devOrigins}}/, answers.devOrigins)
									content = content.replace(/{{testOrigins}}/, answers.testOrigins)
									content = content.replace(/{{proOrigins}}/, answers.proOrigins)
									fs.writeFileSync(`${name}/user.config.js`, content, {
										encoding: 'utf8'
                  })
                  console.log(symbols.success, chalk.green('user.config.js初始化完成'))
									console.log(symbols.success, chalk.green('项目初始化完成'))
								} else {
									console.log(symbols.error, chalk.red('package不存在'))
								}
							})
						}
					})
				})
		} else {
			console.log(symbols.error, chalk.red('项目已存在'))
		}
	})
program.parse(process.argv)
