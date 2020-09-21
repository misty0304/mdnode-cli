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

/**
 * @Description: 域名正则规则
 * @params:
 * @return {type} 无
 */
const checkOrigins = val => {
	return /^((http:\/\/)|(https:\/\/))?([a-z\-\d+]+\.){1,}[a-z\-\d]+(:\d{1,5})?$/i.test(val)
}

/**
 * @Description:校验是否是域名
 * @params:
 * @return {type} 无
 */
const validateOrigins = (val, preAnswer) => {
	const origins = val.split(',')
	if (origins.every(checkOrigins) || !val) return true
	return '请输入正确的域名地址，以http／https开头'
}

/**
 * @Description: 域名数据组装
 * @params:
 * @return {type} 无
 */
const getOrigins = val => {
	const origins = val.split(',')
	const originsStrArr = origins.map(item => `'${item}'`)
	return originsStrArr.join(',')
}

program
	.version('0.0.1', '-v, --version')
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
						message: '请输入开发环境允许跨域访问域名(字符串格式以逗号分隔):',
						validate: (val, preAnswer) => {
							return validateOrigins(val, preAnswer)
						}
					},
					{
						name: 'devOrigins',
						message: '请输入开发环境允许跨域访问域名(字符串格式以逗号分隔):',
						validate: (val, preAnswer) => {
							return validateOrigins(val, preAnswer)
						}
					},
					{
						name: 'testOrigins',
						message: '请输入测试环境允许跨域访问域名(字符串格式以逗号分隔):',
						validate: (val, preAnswer) => {
							return validateOrigins(val, preAnswer)
						}
					},
					{
						name: 'proOrigins',
						message: '请输入生产环境允许跨域访问域名(字符串格式以逗号分隔):',
						validate: (val, preAnswer) => {
							return validateOrigins(val, preAnswer)
						}
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
									content = content.replace(/{{localOrigins}}/, getOrigins(answers.localOrigins))
									content = content.replace(/{{devOrigins}}/, getOrigins(answers.devOrigins))
									content = content.replace(/{{testOrigins}}/, getOrigins(answers.testOrigins))
									content = content.replace(/{{proOrigins}}/, getOrigins(answers.proOrigins))
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
