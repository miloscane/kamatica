function dateInversion(dateString){
	var array	=	dateString.split("-");
	var result	=	array[2]+"-"+array[1]+"-"+array[0];
	return result
}

function daysTillPayment(dateString){
	var array 	=	dateString.split("-");
	//var mesec 	=	array[1];
	var dan 	=	array[2];
	var result	=	0;
	var oneDay	=	24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds

	if(dan<=day){
		var dateOfPayment	=	new Date(year,month,dan);
	}else if(dan>day){
		var dateOfPayment	=	new Date(year,month-1,dan);
	}

	result	=	Math.round(Math.abs((dateOfPayment - today) / oneDay));
	return result
}

function eurToRsd(iznos){
	return Number(eval(Number(iznos)*Number(kursnaLista["eur"]["sre"])).toFixed(0))
}

function rsdToEur(iznos){
	return Number(eval(Number(iznos)/Number(kursnaLista["eur"]["sre"])).toFixed(2))
}