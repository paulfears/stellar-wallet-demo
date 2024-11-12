function initPrism(Prism) {
	const playground = document.getElementById("playground");
	console.log(playground);
	Prism.languages.typescript = Prism.languages.extend('javascript', {
        'internalType': /walletAsset|NativeBalance|DataPacket|AssetBalance/,
		'keywords': {
			pattern: /(\b(?:class|extends|implements|instanceof|interface|new|type)\s+)(?!keyof\b)(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?:\s*<(?:[^<>]|<(?:[^<>]|<[^<>]*>)*>)*>)?|(?<=\n).*?(?=:)/,
			lookbehind: true,
			greedy: true,
			inside: null // see below
		},
		'builtin': /\b(?:Array|Function|Promise|any|boolean|console|never|number|string|symbol|unknown|String)\b/,
        
        
	});

	// The keywords TypeScript adds to JavaScript
	Prism.languages.typescript.keyword.push(
		/\b(?:abstract|declare|is|keyof|readonly|require)\b/,
		// keywords that have to be followed by an identifier
		/\b(?:asserts|infer|interface|module|namespace|type)\b(?=\s*(?:[{_$a-zA-Z\xA0-\uFFFF]|$))/,
		// This is for `import type *, {}`
		/\btype\b(?=\s*(?:[\{*]|$))/,
        
	);

	// doesn't work with TS because TS is too complex
	delete Prism.languages.typescript['parameter'];
	delete Prism.languages.typescript['literal-property'];

	// a version of typescript specifically for highlighting types
	var typeInside = Prism.languages.extend('typescript', {});
	delete typeInside['class-name'];

	Prism.languages.typescript['class-name'].inside = typeInside;

	Prism.languages.insertBefore('typescript', 'function', {
		'decorator': {
			pattern: /@[$\w\xA0-\uFFFF]+/,
			inside: {
				'at': {
					pattern: /^@/,
					alias: 'operator'
				},
				'function': /^[\s\S]+/
			}
		},
		'generic-function': {
			// e.g. foo<T extends "bar" | "baz">( ...
			pattern: /#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*\s*<(?:[^<>]|<(?:[^<>]|<[^<>]*>)*>)*>(?=\s*\()/,
			greedy: true,
			inside: {
				'function': /^#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*/,
				'generic': {
					pattern: /<[\s\S]+/, // everything after the first <
					alias: 'class-name',
					inside: typeInside
				}
			}
		}
	});

	Prism.languages.ts = Prism.languages.typescript;
    (function (){
        let typelinks = [...document.getElementsByClassName('token internalType')];
        console.log("typelinks");
        console.log(typelinks);
        console.log("typelinks.length");
        console.log(typelinks.length);
        for (let i = 0; i < typelinks.length; i++) {
            console.log("typelinks[i]");
            console.log(typelinks[i]);
            let type = typelinks[i].innerText;
            console.log(type);
            typelinks[i].innerHTML = `<a href="/#/?id=${type}">${type}</a>`;
        }
    }());


	
	
	
	
	

	

	// change theme
	
	//document.getElementById("theme1").href = `https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/${e.target.value}`;
	
	
	// change font
	function updateFont() {
		let selectFont = document.getElementById("selectFont");
		let fontName = selectFont.options[selectFont.selectedIndex].text;
		let fontNameUrl = fontName.replace(" ", "+");
		let inputFontSize = document.getElementById("inputFontSize");
		document.getElementById("style2").textContent = `
		@import url('https://fonts.googleapis.com/css2?&display=swap&family=${fontNameUrl}');
		pre, code, textarea {
			font-family: "${fontName}", monospace !important;
			font-size: ${inputFontSize.value}pt !important;
		}`;
	}
	
	// change programming language
	
	
	
	

	
	


}
initPrism(Prism);
