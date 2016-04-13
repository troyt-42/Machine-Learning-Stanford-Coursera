var fs = require("fs");
var porterStemmer = require("porter-stemmer").stemmer;
var foldersToCheck = ["./spam/", "./ham/"];

var vocabList = fs.readFileSync("./vocabulary_list.txt");
vocabList = vocabList.toString("utf8");
vocabList = vocabList.split("\n");
var X = [];
var y = [];

function processEmail(data){
  // process.stdout.write("Start Process:");
  wordIndices = new Array(vocabList.length+1).join(0).split('').map(parseFloat);
  data = data.toLowerCase();
  var headerEnd = data.indexOf("\n\n");
  data = data.slice(headerEnd);
  data = data.replace(/<[^<>]+>/g, ' ');
  data = data.replace(/[0-9]+/g, 'number');
  data = data.replace(/(http|https):\/\/[^\s]*/g, 'httpaddr');
  data = data.replace(/[^\s]+@[^\s]+/g, 'emailaddr');
  data = data.replace(/[$]+/g, 'dollar');
  data = data.split(/[^A-Za-z0-9]+/g);
  data.forEach(function(word){
    // process.stdout.write(".");
    if (/^[A-Za-z]+$/.test(word)){
      word = porterStemmer(word);
      index = vocabList.indexOf(word);
      if(index != -1){
        wordIndices[index] = 1;
      }
    }
  });
  // console.log("\nFinish with", data.length, "words being processed");
  return wordIndices;
}

var pendingFiles = 0;
foldersToCheck.forEach(function(folder){
  fs.readdir(folder, function(err, files){
    if (!err){
      files.forEach(function(file,index){
        if (!/^(cmds)(\s*[0-9])*$/.test(file)){
          pendingFiles++;
          console.log("Adding File",pendingFiles);
          fs.readFile(folder+file, function(err,data){
            if(!err){
              data = data.toString("utf8");
              var features = processEmail(data);
              pendingFiles -= 1;
              X.push(features);
              if(folder === "./spam/"){
                y.push(1);
              } else {
                y.push(0);
              }
              if (pendingFiles <= 0){
                console.log("Finish");
                var dataToWrite = "# Created by Nodejs, "+ Date().toString()+" <taozytroy@gmail.com>\n# name: X\n# type: matrix\n# rows: "+X.length+"\n# columns: "+X[0].length+"\n";
                var Xtext = "";
                for (var i = 0; i < X.length; i++) {
                  Xtext += " " + X[i].join(" ") + "\n";
                }
                dataToWrite += Xtext + "\n\n\n";

                dataToWrite += "# name: y\n"+"# type: matrix\n"+"# rows: "+y.length+"\n# columns: 1\n";
                var ytext = "";
                for (var p = y.length - 1; p >= 0; p--) {
                  ytext += " " + y.join(" ") + "\n";
                }
                dataToWrite += ytext + "\n\n\n";
                fs.writeFile("./spamassasin_data.mat", dataToWrite, function(err, result){
                  if(!err){
                    console.log("X has been created. \n Total Length: " + X.length + " x " + X[0].length);
                    console.log("y has been created. \n Size: " + y.length + " x 1");
                    process.exit();
                  }
                });


              }
              console.log("Remaining File", pendingFiles);
            } else {
              console.log(err);
            }
          });
        }
      });
    } else {
      console.log(err);
    }
  });
});
