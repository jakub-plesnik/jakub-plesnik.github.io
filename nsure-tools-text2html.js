(function () {
	"use strict";

	var settingFixFormatting = true;

	var replaceTextToHtml = function (str) {
		if (settingFixFormatting) {
			str = str.replace(/(\d)(%)/g, "$1 $2"); // Fix no space for percent
		}
		return str
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
			.replace(/<br[^>]*>(.*?)/g, "<br>")
			.replace(
				/<span[^>]*style="[^"]*font-weight:\s*bold;[^"]*"[^>]*>(.*?)<\/span>/g,
				"<strong>$1</strong>"
			)
			.replace(
				/<span[^>]*style="[^"]*font-weight:\s*bolder;[^"]*"[^>]*>(.*?)<\/span>/g,
				"<strong>$1</strong>"
			)
			.replace(
				/<span[^>]*style="[^"]*font-weight:\s*normal;[^"]*"[^>]*>(.*?)<\/span>/g,
				"$1"
			)
			.replace(/<span[^>]*>(.*?)<\/span>/g, "$1")
			.replace(/(\d*)\ (?:EUR)/g, "$1&nbsp;€")
			.replace(/(\d*)\ (€)/g, "$1&nbsp;$2")
			.replace(/(\d*)\ (%)/g, "$1&nbsp;$2")
			.replace(/(\d) (\d)/g, "$1&nbsp;$2")
			.replace(/(\ )(<br>)/g, "$2")
			.replace(/<br><br class="Apple-interchange-newline"><br>/g, "")
			.replace(/<br class="Apple-interchange-newline"><br>/g, "")
			.replace(/<br class="Apple-interchange-newline">/g, "");
	};

	var convert = function (str) {
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

	document.addEventListener("DOMContentLoaded", function () {
		var info = document.querySelector("#info");
		var pastebin = document.querySelector("#pastebin");
		var output = document.querySelector("#output");
		var outputFormatted = document.querySelector("#output-formatted");
		var wrapper = document.querySelector("#wrapper");

		document.addEventListener("keydown", function (event) {
			if (event.ctrlKey || event.metaKey) {
				if (String.fromCharCode(event.which).toLowerCase() === "v") {
					pastebin.innerHTML = "";
					pastebin.focus();
					// info.classList.add("d-none");
					// wrapper.classList.add("d-none");
				}
			}
		});

		pastebin.addEventListener("paste", function () {
			setTimeout(function () {
				var html = pastebin.innerHTML;
				var replacedText = convert(html);
				insert(output, replacedText);
				// wrapper.classList.remove("d-none");
				output.focus();
				output.select();

				const outputValue = output.value;
				outputFormatted.innerHTML = outputValue;
			}, 200);
		});

		output.addEventListener("input", function () {
			const outputValue = output.value;
			outputFormatted.innerHTML = outputValue;
		});

		// Settings
		var fixFormattingInput = document.querySelector("#settingFixFormatCheck");
		fixFormattingInput.addEventListener("change", function () {
			settingFixFormatting = fixFormattingInput.checked;
			clearInputs();
		});

		var clearInputs = function () {
			output.value = "";
			outputFormatted.innerHTML = "";
		};
	});
})();
