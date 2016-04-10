var fs = require("fs");
var porterStemmer = require("porter-stemmer").stemmer;
var foldersToCheck = ["./spam/", "./ham/"];

var vocabList = fs.readFileSync("./vocabulary_list.txt");
vocabList = vocabList.toString("utf8");
vocabList = vocabList.split(",");
var X = [];
var y = [];

function processEmail(data){
  // process.stdout.write("Start Process:");
  wordIndices = new Array(vocabList.length).join(0).split('').map(parseFloat);
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
        if (/^[0-9]+$/.test(file)){
          pendingFiles++;
          console.log("Adding File",pendingFiles);
          fs.readFile(folder+file, function(err,data){
            if(!err){
              data = data.toString("utf8");
              features = processEmail(data);
              pendingFiles -= 1;
              X.push(features);
              if(folder === "./spam/"){
                y.push(1);
              } else {
                y.push(0);
              }
              if (pendingFiles <= 0){
                console.log("Finish");
                Xtext = "";
                ytext = "";
                for (var i = 0; i < X.length; i++) {
                  Xtext += JSON.stringify(X[i]).replace(/,|\]|\[/g, "") + "\n";
                }
                for (var i = 0; i < y.length; i++) {
                  ytext += JSON.stringify(y[i]).replace(/,|\]|\[/g, "") + "\n";
                }
                fs.writeFile("./X.txt", Xtext, function(err, result){
                  if(!err){
                    console.log("X has been created. \n Total Length: " + X.length + " x " + X[0].length);
                    fs.writeFile("./y.txt", ytext, function(err, result){
                      if(!err){
                        console.log("y has been created. \n Size: " + y.length + " x 1");
                        process.exit();
                      }
                    });
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