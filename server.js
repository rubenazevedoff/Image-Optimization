//Requires in order to work
var express 	= require('express'),
	multer 		= require('multer'),
	Imagemin 	= require('imagemin'),
	fs 			= require('fs'),
	bodyParser  = require('body-parser'),
	exec 		= require('child_process').exec,
	EasyZip 	= require('easy-zip').EasyZip;

var storage =  multer.diskStorage({
	//Destination folder whenever you upload
	destination: function (req, file, callback) {
		callback(null, './uploads');
	},
	//Set the name of the file (current name)
	filename: function (req, file, callback) {
		callback(null, file.originalname);
	}
});

//We will need to storage and in HTMl we will send an array (array('userPhoto') => Search userPhoto in html)
var upload = multer({ storage : storage, dest: './uploads'});

var app = express();

app.use("/css", express.static(__dirname + '/ui/css'));
app.use("/js", express.static(__dirname + '/ui/js'));
app.use("/img", express.static(__dirname + '/ui/img'));

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

//Basic rounting and reply's index
app.get('/',function(req,res){
    res.sendFile(__dirname + "/index.html");
});

app.get('/ui',function(req,res){
    res.sendFile(__dirname + "/ui/index.html");
});

//Gets the croped image and returns the png
app.post('/getImage', function (req, res) {
	var data = req.body.image,
		base64Data,
		binaryData;

	base64Data  =   data.replace(/^data:image\/png;base64,/, "");
	base64Data  +=  base64Data.replace('+', ' ');
	binaryData  =   new Buffer(base64Data, 'base64').toString('binary');

	fs.writeFile("uploads/out.png", binaryData, "binary", function (err) {
	    console.log(err);
	});
});


app.post('/photos', upload.array('file'), function (req, res, next) {
	return res.status(200).send(req.file);
});


app.post('/optimize', function (req, res) {
 //Image optimization
	var file = fs.readdirSync('./uploads/', {});
	var i=0;
	new Imagemin()
	.src('./uploads/*.{gif,jpg,png,svg}')
	.dest('./uploads/')
	.use(Imagemin.jpegtran({progressive: true}))
	.run(function (err, files) {
		//Loop trough each file
		file.forEach( function(file, index) {
			//Just....
			if(file != '.DS_Store') {
				//Convert into webp
				console.log('converting file ' + file);
				exec('cwebp [options] -q 75 ./uploads/'+file+' -o ./public/'+file.slice(0, -4)+'.webp', (err, stdout, stderr) => {
				  if (err) {
				    console.error(err);
				    res.status(500).send(err);
				  }

					//Creates a new instance of eazyZip
					var zip = new EasyZip();
					//Zips the public folder and creates the public.zip
					zip.zipFolder('./public',function(){
						zip.writeToFile('public.zip');
					});

				});
			}
		});
		res.status(200).send('completed!');
	});
});

//When you ask for the download
app.post('/download',function(req,res){
	//He will look for the public.zip
	res.sendFile(__dirname+'/public.zip', {}, function (err) {
		if (err) {
			console.log(err);
			res.status(err.status).end();
		} else {
			console.log('Sent');
		}
	});
});

app.listen(3000,function(){
    console.log("Working on port 3000");
});