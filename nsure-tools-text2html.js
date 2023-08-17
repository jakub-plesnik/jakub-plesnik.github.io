(function () {
	"use strict";

	// http://pandoc.org/README.html#smart-punctuation
	var replaceTextToHtml = function (str) {
		return str
			.replace(/[\u2018\u2019\u00b4]/g, "'")
			.replace(/[\u201c\u201d\u2033]/g, '"')
			.replace(/[\u2212\u2022\u00b7\u25aa]/g, "-")
			.replace(/[\u2013\u2015]/g, "--")
			.replace(/\u2014/g, "---")
			.replace(/\u2026/g, "...")
			.replace(/[\t\n\r]+/g, "<br>")
			.replace(/[ ]+\n/g, "<br>")
			.replace(/\s*\\\n/g, "<br>")
			.replace(/\s*\\\n\s*\\\n/g, "<br><br>")
			.replace(/\s*\\\n\n/g, "<br><br>")
			.replace(/\n-\n/g, "<br>")
			.replace(/\n\n\s*\\\n/g, "<br><br>")
			.replace(/\n\n\n*/g, "<br><br>")
			.replace(/[ ]+$/gm, "")
			.replace(/^\s+|[\s\\]+$/g, "")
			.replace(
				/<span[^>]*style="[^"]*font-weight:\s*bold;[^"]*"[^>]*>(.*?)<\/span>/g,
				"<strong>$1</strong>"
			)
			.replace(
				/<span[^>]*style="[^"]*font-weight:\s*normal;[^"]*"[^>]*>(.*?)<\/span>/g,
				"$1"
			)
			.replace(/(\d*)\ (?:EUR)/g, "$1&nbsp;€")
			.replace(/(\d*)\ (%)/g, "$1&nbsp;$2")
			.replace(/(\d) (\d)/g, "$1&nbsp;$2")
			.replace(/<br><br class="Apple-interchange-newline"><br>/g, "")
			.replace(/<br class="Apple-interchange-newline"><br>/g, "")
			.replace(/<br class="Apple-interchange-newline">/g, "");
	};

	var convert = function (str) {
		console.log(str);
		return replaceTextToHtml(str);
	};

	var insert = function (myField, myValue) {
		if (document.selection) {
			myField.focus();
			sel = document.selection.createRange();
			sel.text = myValue;
			sel.select();
		} else {
			if (myField.selectionStart || myField.selectionStart == "0") {
				var startPos = myField.selectionStart;
				var endPos = myField.selectionEnd;
				var beforeValue = myField.value.substring(0, startPos);
				var afterValue = myField.value.substring(endPos, myField.value.length);
				myField.value = beforeValue + myValue + afterValue;
				myField.selectionStart = startPos + myValue.length;
				myField.selectionEnd = startPos + myValue.length;
				myField.focus();
			} else {
				myField.value += myValue;
				myField.focus();
			}
		}
	};

	// http://stackoverflow.com/questions/2176861/javascript-get-clipboard-data-on-paste-event-cross-browser
	document.addEventListener("DOMContentLoaded", function () {
		var info = document.querySelector("#info");
		var pastebin = document.querySelector("#pastebin");
		var output = document.querySelector("#output");
		var wrapper = document.querySelector("#wrapper");

		document.addEventListener("keydown", function (event) {
			if (event.ctrlKey || event.metaKey) {
				if (String.fromCharCode(event.which).toLowerCase() === "v") {
					pastebin.innerHTML = "";
					pastebin.focus();
					info.classList.add("hidden");
					wrapper.classList.add("hidden");
				}
			}
		});

		pastebin.addEventListener("paste", function () {
			setTimeout(function () {
				var html = pastebin.innerHTML;
				var replacedText = convert(html);
				// output.value = replacedText;
				insert(output, replacedText);
				wrapper.classList.remove("hidden");
				output.focus();
				output.select();
			}, 200);
		});
	});
})();
