var fs = require("fs");
var porterStemmer = require("porter-stemmer").stemmer;

var vocabularyList = [];
var frequencyCounter = {};
var foldersToCheck = ["./spam/", "./ham/"];
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
                if (/^[A-Za-z]+$/.test(word)){
                  word = porterStemmer(word);
                  if (vocabularyList.indexOf(word) === -1){
                    vocabularyList.push(word);
                    frequencyCounter[word] = 1;
                  } else {
                    frequencyCounter[word] ++;
                  }
                }
              });
              pendingFiles -= 1;
              if (pendingFiles <= 0){
                console.log("Finish");
                vocabularyList = [];
                for(var key in frequencyCounter){
                  if(frequencyCounter[key] >= 10){
                    vocabularyList.push(key);
                  }
                }
                fs.writeFile("./vocabulary_list.txt", vocabularyList.join("\n"), function(err, result){
                  if(!err){
                    console.log("Vocabulary List has been created. \n Total Length: " + vocabularyList.length);
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
