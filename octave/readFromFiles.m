function [followerMat, valueVector, stringMat, rowBase] = readFromFiles(prefix)

fh = fopen([prefix, 'followers']);
followerData = fread(fh, 'float32');

fhv = fopen([prefix, 'values']);
valueVectorJS = fread(fhv, 'float32');

fhs = fopen([prefix, 'strings']);
stringVector = fread(fhs, 'uint16');

    fhrs = fopen([prefix, 'rstrings']);
    rstringVector = fread(fhrs, 'uint16');

fclose(fh);
fclose(fhv);
fclose(fhs);
fclose(fhrs);

followerMat = single(reshape(followerData, 13, []));
valueVectorJS = reshape(valueVectorJS, 1, []);
stringMat = uint16(reshape(stringVector, 20, []));

rowBase = reshape(rstringVector, 5, [])';

clear followerData stringVector

followerMat(:,1) = []; % remove column 0 to make column 1 appear at index 1 (no big loss)
valueVectorJS(1) = [];
stringMat(:,1) = [];
% So, state 0 is absent here

followerMat(followerMat < 1) = nan;

valueVector = valueVectorJS; % if we use the original file input
