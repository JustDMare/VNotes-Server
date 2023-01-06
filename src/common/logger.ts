export default class Logger {
	static consoleColorReset = "\x1b[0m";
	static consoleColorBlack = "\x1b[30m";
	static consoleColorRed = "\x1b[31m";
	static consoleColorGreen = "\x1b[32m";
	static consoleColorYellow = "\x1b[33m";
	static consoleColorBlue = "\x1b[34m";
	static consoleColorMagenta = "\x1b[35m";
	static consoleColorCyan = "\x1b[36m";
	static consoleColorWhite = "\x1b[37m";

	public static log(args: any) {
		console.log(this.consoleColorWhite, `${new Date().toLocaleString()} [LOG]`, args);
	}

	public static success(args: any) {
		console.log(this.consoleColorGreen, `${new Date().toLocaleString()} [SUCCESS]`, args);
	}

	public static info(args: any) {
		console.info(this.consoleColorCyan, `${new Date().toLocaleString()} [INFO]`, args);
	}
	public static warning(args: any) {
		console.warn(this.consoleColorYellow, `[${new Date().toLocaleString()}] [WARN]`, args);
	}
	public static error(args: any) {
		console.error(this.consoleColorRed, `[${new Date().toLocaleString()}] [ERROR]`, args);
	}
}
