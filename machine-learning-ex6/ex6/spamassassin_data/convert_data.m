function convert_data = convert_data()

fidX = fopen('./X.txt');
fidy = fopen('./y.txt');

if fidX & fidy
    X = fscanf(fidX, '%c');
    y = fscanf(fidy, '%c\n', [3896, 1]);
    size(X);
    X = reshape(str2num(X), 3896, 5818);
    y = str2num(y);
    save('spamassasin_data.mat', 'X', 'y');
    fclose(fidX);
    fclose(fidy);
    fprintf('Finished\n');
else
    fprintf('Unable to open X.txt or y.txt\n');
end
end
