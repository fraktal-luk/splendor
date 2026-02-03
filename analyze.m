
fh = fopen('saved_1/followers');
data = fread(fh, 'float32');

dataMat = reshape(data, 13, []);


fclose(fh);

