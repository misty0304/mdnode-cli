module.exports = {
	/* 基本配置 */
	name: "{{name}}",
	isMoredianService: true,
	port: {{port}}, // 服务器端口号
	/* 本地开发环境配置 */
	local: {
		// /* 基本配置 */
		// port: 4000, // 服务器端口号
		/* 跨域拦截设置 */
		cors: {
			origins: [{{localOrigins}}] // 允许跨域访问域名列表，仅allowed为true时有效
		},
		/* session配置 */
		session: {
			maxAge: 24 * 60 * 60 * 1000 // cookie有效时间
		}
	},
	/* 线上开发环境配置 */
	dev: {
		/* 跨域拦截设置 */
		cors: {
			origins: [{{devOrigins}}] // 允许跨域访问域名列表，仅allowed为true时有效
		},
		/* session配置 */
		session: {
			maxAge: 30 * 60 * 1000 // cookie有效时间
		}
	},
	/* 线上测试环境配置 */
	test: {
		/* 跨域拦截设置 */
		cors: {
			origins: [{{testOrigins}}] // 允许跨域访问域名列表，仅allowed为true时有效
		},
		/* session配置 */
		session: {
			maxAge: 30 * 60 * 1000 // cookie有效时间
		}
	},
	/* 线上生产环境配置 */
	pro: {
		/* 跨域拦截设置 */
		cors: {
			origins: [{{proOrigins}}] // 允许跨域访问域名列表，仅allowed为true时有效
		},
		/* session配置 */
		session: {
			maxAge: 4 * 60 * 60 * 1000 // cookie有效时间
		}
	}
}
