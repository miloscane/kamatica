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

document.addEventListener('touchstart', handleTouchStart, false);        
document.addEventListener('touchmove', handleTouchMove, false);

var xDown = null;                                                        
var yDown = null;

function getTouches(evt) {
  return evt.touches ||             // browser API
         evt.originalEvent.touches; // jQuery
}                                                     
                                                                         
function handleTouchStart(evt) {
    const firstTouch = getTouches(evt)[0];                                      
    xDown = firstTouch.clientX;                                      
    yDown = firstTouch.clientY;                                      
};                                                
                                                                         
function handleTouchMove(evt) {
    if ( ! xDown || ! yDown ) {
        return;
    }

    var xUp = evt.touches[0].clientX;                                    
    var yUp = evt.touches[0].clientY;

    var xDiff = xDown - xUp;
    var yDiff = yDown - yUp;
                                                                         
    if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {/*most significant*/
		if ( xDiff > 0 ) {
            /* right swipe */ 
            console.log('swiped right');
            if(!document.getElementsByClassName('arrowRight')[0].classList.contains('hidden')){
            	navigate(document.getElementsByClassName('arrowRight')[0],1)
            }
        } else {
            /* left swipe */

            console.log('swiped left');
            if(!document.getElementsByClassName('arrowLeft')[0].classList.contains('hidden')){
            	navigate(document.getElementsByClassName('arrowLeft')[0],-1)
            }
        }
    } else {
        if ( yDiff > 0 ) {
            /* down swipe */ 
        } else { 
            /* up swipe */
        }                                                                 
    }
    /* reset values */
    xDown = null;
    yDown = null;                                             
};