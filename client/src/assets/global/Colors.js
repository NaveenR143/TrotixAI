const themes = {
	defaulttheme: {
		TEXTPRIMARYCOLOR: '#636e72',
		PRIMARYCOLOR: '#74b9ff',
		SUCCESSCOLOR: '#00b894',
		ERRORCOLOR: '#d63031',
		WARNINGCOLOR: '#e17055',
		INPROGRESSCOLOR: '#00cec9',
		BACKGROUNDCOLOR: '#0984e3',
	},
};

export function getThemeVariablesByName() {
	return themes['defaulttheme'];
}
