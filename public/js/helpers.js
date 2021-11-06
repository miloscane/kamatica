function dateInversion(dateString){
	var array	=	dateString.split("-")
	var result	=	array[2]+"-"+array[1]+"-"+array[0];
	return result
}