(function () {
	"use strict";

	// Init vars
	var settingEnableConvertValue =
		localStorage.getItem("settingEnableConvertValue") ?? "true";
	var settingFixSpacesValue =
		localStorage.getItem("settingFixSpacesValue") ?? "true";
	var settingEurToSymbolValue =
		localStorage.getItem("settingEurToSymbolValue") ?? "true";
	var settingAddNbspValue =
		localStorage.getItem("settingFixNbspValue") ?? "true";

	var settingLineBreakText =
		localStorage.getItem("settingLineBreakText") ?? "<br>";
	var settingBoldTextStart =
		localStorage.getItem("settingBoldTextStart") ?? "<strong>";
	var settingBoldTextEnd =
		localStorage.getItem("settingBoldTextEnd") ?? "</strong>";

	var replaceTextToHtml = function (str) {
		str = str
			.replace(/[\t\n\r]+/g, (match) => {
				return settingLineBreakText.repeat(match.length);
			})
			.replace(/[ ]+\n/g, settingLineBreakText)
			.replace(/\s*\\\n/g, settingLineBreakText)
			.replace(/\s*\\\n\s*\\\n/g, settingLineBreakText + settingLineBreakText)
			.replace(/\s*\\\n\n/g, settingLineBreakText + settingLineBreakText)
			.replace(/\n-\n/g, settingLineBreakText)
			.replace(/\n\n\s*\\\n/g, settingLineBreakText + settingLineBreakText)
			.replace(/\n\n\n*/g, settingLineBreakText + settingLineBreakText)
			.replace(/[ ]+$/gm, "")
			.replace(/^\s+|[\s\\]+$/g, "")
			.replace(/<br[^>]*>(.*?)/g, settingLineBreakText)
			.replace(
				/<span[^>]*style="[^"]*font-weight:\s*bold;[^"]*"[^>]*>(.*?)<\/span>/g,
				settingBoldTextStart + "$1" + settingBoldTextEnd
			)
			.replace(
				/<span[^>]*style="[^"]*font-weight:\s*bolder;[^"]*"[^>]*>(.*?)<\/span>/g,
				settingBoldTextStart + "$1" + settingBoldTextEnd
			)
			.replace(
				/<span[^>]*style="[^"]*font-weight:\s*normal;[^"]*"[^>]*>(.*?)<\/span>/g,
				"$1"
			)
			.replace(/<span(?! class="semi-bold")[^>]*>(.*?)<\/span>/g, "$1")
			.replace(/<span(?! class=\\"semi-bold\\")[^>]*>(.*?)<\/span>/g, "$1")
			.replace(/(\ )(<br>)/g, "$2")
			.replace(/<br><br class="Apple-interchange-newline"><br>/g, "")
			.replace(/<br class="Apple-interchange-newline"><br>/g, "")
			.replace(/<br class="Apple-interchange-newline">/g, "");

		str = str
			.replace(/<([a-z][a-z0-9]*)[^>]*?(\/?)>/gi, "<$1>")
			.replace(/<p>/g, "")
			.replace(/<\/p>/g, settingLineBreakText);

		if (settingFixSpacesValue) {
			str = str
				.replace(/(\d)(%)/g, "$1 $2") // Fix no space for %
				.replace(/(\d)(€)/g, "$1 $2"); // Fix no space for €
		}
		if (settingEurToSymbolValue) {
			str = str.replace(/(\d*)\ (?:EUR)/g, "$1 €"); // Transform EUR to €
		}
		if (settingAddNbspValue) {
			str = str
				.replace(/(\d*)\ (%)/g, "$1&nbsp;$2") // Add nbsp for %
				.replace(/(\d*)\ (€)/g, "$1&nbsp;$2") // Add nbsp for €
				.replace(/(\d*)\ (EUR)/g, "$1&nbsp;$2") // Add nbsp for EUR
				.replace(/(\d*)\ (\d)/g, "$1&nbsp;$2"); // Add nbsp between numbers
		}

		return str;
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
		var pastebin = document.querySelector("#pastebin");
		var output = document.querySelector("#output");
		var outputFormatted = document.querySelector("#output-formatted");

		document.addEventListener("keydown", function (event) {
			if (event.ctrlKey || event.metaKey) {
				if (String.fromCharCode(event.which).toLowerCase() === "v") {
					pastebin.innerHTML = "";
					pastebin.focus();
				}
			}
		});

		pastebin.addEventListener("paste", function () {
			setTimeout(function () {
				var html = pastebin.innerHTML;
				console.log(settingEnableConvertValue);
				var replacedText =
					settingEnableConvertValue == "true" ? convert(html) : html;
				insert(output, replacedText);
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

		// Settings - Convert on paste
		var settingEnableConvertInput = document.querySelector(
			"#settingEnableConvertCheck"
		);
		settingEnableConvertInput.checked = settingEnableConvertValue == "true";
		settingEnableConvertInput.addEventListener("change", function () {
			settingEnableConvertValue = settingEnableConvertInput.checked;
			localStorage.setItem(
				"settingEnableConvertValue",
				settingEnableConvertValue
			);
			clearInputs();
		});

		// Settings - Fix spaces for units
		var settingFixSpacesInput = document.querySelector(
			"#settingFixSpacesCheck"
		);
		settingFixSpacesInput.checked = settingFixSpacesValue == "true";
		settingFixSpacesInput.addEventListener("change", function () {
			settingFixSpacesValue = settingFixSpacesInput.checked;
			localStorage.setItem("settingFixSpacesValue", settingFixSpacesValue);
			clearInputs();
		});

		// Settings - EUR to €
		var settingEurToSymbolInput = document.querySelector(
			"#settingEurToSymbolCheck"
		);
		settingEurToSymbolInput.checked = settingEurToSymbolValue == "true";
		settingEurToSymbolInput.addEventListener("change", function () {
			settingEurToSymbolValue = settingEurToSymbolInput.checked;
			localStorage.setItem("settingEurToSymbolValue", settingEurToSymbolValue);
			clearInputs();
		});

		// Settings - Add non-breaking spaces
		var settingAddNbspInput = document.querySelector("#settingAddNbspCheck");
		settingAddNbspInput.checked = settingAddNbspValue == "true";
		settingAddNbspInput.addEventListener("change", function () {
			settingAddNbspValue = settingAddNbspInput.checked;
			localStorage.setItem("settingAddNbspValue", settingAddNbspValue);
			clearInputs();
		});

		// Settings - Line break
		var settingLineBreakSelect = document.querySelector("#settingBrSelect");
		settingLineBreakSelect.value =
			localStorage.getItem("settingLineBreakValue") ?? 1;
		settingLineBreakText =
			settingLineBreakSelect.options[settingLineBreakSelect.selectedIndex].text;
		settingLineBreakSelect.addEventListener("change", function () {
			settingLineBreakText =
				settingLineBreakSelect.options[settingLineBreakSelect.selectedIndex]
					.text;
			localStorage.setItem(
				"settingLineBreakValue",
				settingLineBreakSelect.value
			);
			clearInputs();
		});

		// Settings - Bold text
		var settingBoldSelect = document.querySelector("#settingBoldSelect");
		settingBoldSelect.value = localStorage.getItem("settingBoldValue") ?? 1;
		var selectedText =
			settingBoldSelect.options[settingBoldSelect.selectedIndex].text.split(
				"TEXT"
			);
		settingBoldTextStart = selectedText[0];
		settingBoldTextEnd = selectedText[1];
		settingBoldSelect.addEventListener("change", function () {
			var selectedText =
				settingBoldSelect.options[settingBoldSelect.selectedIndex].text.split(
					"TEXT"
				);
			settingBoldTextStart = selectedText[0];
			settingBoldTextEnd = selectedText[1];
			localStorage.setItem("settingBoldValue", settingBoldSelect.value);
			clearInputs();
		});

		function clearInputs() {
			output.value = "";
			outputFormatted.innerHTML = "";
		}
	});
})();
