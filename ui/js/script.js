var files = [];
var optimizeBtn = document.getElementById('optimize');
optimizeBtn.addEventListener('click', function () {
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == XMLHttpRequest.DONE ) {
           if(xmlhttp.status == 200){
               console.log(xmlhttp.responseText);
           }
           else if(xmlhttp.status == 400) {
              alert('There was an error 400');
           }
           else {
               alert('something else other than 200 was returned');
               console.log(xmlhttp);
           }
        }
    }

    xmlhttp.open("POST", "/optimize", true);
    xmlhttp.send();
});
/*
override dropzone options
*/

Dropzone.options.myAwesomeDropzone = {
	dictDefaultMessage : 'Click here to browse or drag\'n\'drop the files here',
	acceptedFiles: 'image/jpeg,image/png',
	thumbnailWidth: 200,
	init: function() {
		this.on("addedfile", function(file) { 
			files.push(file);
		});
	}
};