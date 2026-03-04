
prefix = '../saved_3/';

fh = fopen([prefix, 'followers']);
data = fread(fh, 'float32');

fhv = fopen([prefix, 'values']);
valueVector = fread(fhv, 'float32');

fhs = fopen([prefix, 'strings']);
stringVector = fread(fhs, 'uint16');


dataMat = single(reshape(data, 13, []));
stringMat = uint16(reshape(stringVector, 20, []));

clear data stringVector

dataMat(:,1) = []; % remove column 0 to make column 1 appear at index 1 (no big loss)
valueVector(1) = [];
stringMat(:,1) = [];
% So, state 0 is absent here


dataMat(dataMat == -1) = nan;

fclose(fh);
fclose(fhv);
fclose(fhs);

%LIMIT = 6000000; %width(dataMat); % 50000;

%if LIMIT > 2000000; error('WTF!'); end

  % !!!! Cutting to 10k for dev because performance
    dataMat = dataMat;
 % dataMat = dataMat(:, 1:LIMIT);
    valueVector = valueVector;
 % valueVector = valueVector(1:LIMIT);
    stringMat = stringMat;
 % stringMat = stringMat(:, 1:LIMIT);

nStates = width(dataMat);

stepValues = countSteps(dataMat);

win0 = valueVector > 0;
win1 = valueVector < 0;
draw = valueVector == 0;


[moves, points0, points1] = parsePoints(stringMat);

    clear stringMat

diffVector = points0 - points1;


% All edges (except 0-1)
[statesRep, ~] = meshgrid(1:nStates, 1:13);
edgesFrom = statesRep(~isnan(dataMat));
edgesTo = dataMat(~isnan(dataMat));

valuesFrom = valueVector(edgesFrom);
valuesTo = valueVector(edgesTo); % some destinations may be outside LIMIT
groupsFrom = stepValues(edgesFrom); % groups are defined by steps from 0
groupsTo = stepValues(edgesTo); % should be groupsFrom + 1?, but be careful

optimals = markOptimalMoves(valueVector, dataMat);


classes = char(size(valueVector));
classes(isnan(valueVector)) = 'U';
classes((valueVector) > 0) = '0';
classes((valueVector) < 0) = '1';
classes((valueVector) == 0) = 'D';

classCounts = classifyPerGroup(classes, stepValues);

% table to store numbers of edges by from/to
trTable = makeTransitionHist(edgesFrom, edgesTo, classes);
trTablesG = makeTransitionHistPerGroup(edgesFrom, edgesTo, classes, groupsFrom);

[finals, tips, branching] = getCategs(points0, points1, valueVector, moves, dataMat);
