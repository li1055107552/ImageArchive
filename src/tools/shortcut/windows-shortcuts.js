// var execFile = require('child_process').execFile;
// var pathUtils = require('path');

import pathUtils from "path"
import { execFile } from "child_process"
import iconv from "iconv-lite"


const shortcutexe = pathUtils.join(process.cwd(), "src", "tools", "shortcut", "Shortcut.exe")
console.log(shortcutexe)
const ws = {}


function parseQuery(stdout) {
	// Parses the stdout of a shortcut.exe query into a JS object
	var result = {};
	result.expanded = {};
	stdout.split(/[\r\n]+/)
		.filter(function (line) { return line.indexOf('=') !== -1; })
		.forEach(function (line) {
			var pair = line.split('=', 2),
				key = pair[0],
				value = pair[1];
			if (key === "TargetPath")
				result.target = value;
			else if (key === "TargetPathExpanded")
				result.expanded.target = value;
			else if (key === "Arguments")
				result.args = value;
			else if (key === "ArgumentsExpanded")
				result.expanded.args = value;
			else if (key === "WorkingDirectory")
				result.workingDir = value;
			else if (key === "WorkingDirectoryExpanded")
				result.expanded.workingDir = value;
			else if (key === "RunStyle")
				result.runStyle = +value;
			else if (key === "IconLocation") {
				result.icon = value.split(',')[0];
				result.iconIndex = value.split(',')[1];
			} else if (key === "IconLocationExpanded") {
				result.expanded.icon = value.split(',')[0];
			} else if (key === "HotKey")
				result.hotkey = +value.match(/\d+/)[0];
			else if (key === "Description")
				result.desc = value;
		});
	Object.keys(result.expanded).forEach(function (key) {
		result.expanded[key] = result.expanded[key] || result[key];
	});
	return result;
}

// This function is supposed to act like a windows shell for compatibility with v0.1.2
// Meaning, treat carets as escape characters (replace ^<any> with <any>) and expand env vars
function expandEnv(path) {
	var envRE = /(^|[^^])%((?:\^.|[^^%])*)%/g; // Matches env vars, accounting for escaped chars. I feel dirty.
	return path.replace(envRE, function (_, g1, g2) {
		return g1 + process.env[g2];
	}).replace(/\^(.)/g, "$1");
}

function commandArgs(type, path, options) {
	// Generates a command for shortcut.exe
	var args = ['/A:' + type, '/F:' + expandEnv(path)];

	if (options) {
		if (options.target)
			args.push('/T:' + expandEnv(options.target));
		if (options.args)
			args.push('/P:' + expandEnv(options.args));
		if (options.workingDir)
			args.push('/W:' + expandEnv(options.workingDir) + '');
		if (options.runStyle)
			args.push('/R:' + options.runStyle);
		if (options.icon) {
			args.push('/I:' + expandEnv(options.icon) + ('iconIndex' in options ? ',' + options.iconIndex : ''));
		}
		if (options.hotkey)
			args.push('/H:' + options.hotkey);
		if (options.desc)
			args.push('/D:' + expandEnv(options.desc) + '');
	}
	return args;
}

function isString(x) {
	return Object.prototype.toString.call(x) === "[object String]";
}

// export function query(path, callback) {
ws.query = function (path, callback) {
	execFile(shortcutexe,
		['/A:Q', '/F:' + expandEnv(path)], { encoding: "gkb" },
		function (error, stdout, stderr) {
			error = error ? iconv.decode(error, 'gbk') : error
			stdout = stdout ? iconv.decode(stdout, 'gbk') : stdout
			stderr = stderr ? iconv.decode(stderr, 'gbk') : stderr
			var result = parseQuery(stdout);
			callback(error ? stderr || stdout : null, result);
		});
};

ws.create = function (path, optionsOrCallbackOrTarget, callback) {
	var options = isString(optionsOrCallbackOrTarget) ? { target: optionsOrCallbackOrTarget } : optionsOrCallbackOrTarget;
	callback = typeof optionsOrCallbackOrTarget === 'function' ? optionsOrCallbackOrTarget : callback;

	if (pathUtils.extname(path) !== ".lnk") { // Automatically generate shortcut if a .lnk file name is not given
		if (options && options.target) {
			var targetObj = pathUtils.parse(options.target); // TODO: deal with parse failure?
			var basename = targetObj.ext === ".lnk" ?
				options.target :
				targetObj.name + ".lnk";
			path = pathUtils.join(path, basename);
		} else {
			path = pathUtils.join(path, "New Shortcut.lnk");
		}
	}

	execFile(shortcutexe,
		commandArgs('C', path, options), { encoding: "gkb" },
		function (error, stdout, stderr) {
			error = error ? iconv.decode(error, 'gbk') : error
			stdout = stdout ? iconv.decode(stdout, 'gbk') : stdout
			stderr = stderr ? iconv.decode(stderr, 'gbk') : stderr
			if (callback)
				callback(error ? stderr || stdout : null);
		});
};

ws.edit = function (path, options, callback) {
	execFile(shortcutexe,
		commandArgs('E', path, options), { encoding: "gkb" },
		function (error, stdout, stderr) {
			error = error ? iconv.decode(error, 'gbk') : error
			stdout = stdout ? iconv.decode(stdout, 'gbk') : stdout
			stderr = stderr ? iconv.decode(stderr, 'gbk') : stderr
			if (callback)
				callback(error ? stderr || stdout : null);
		});
};

// Shortcut open states
ws.NORMAL = 1
ws.MAX = 3
ws.MIN = 7

export default ws