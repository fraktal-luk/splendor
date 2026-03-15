
prefix = '../saved_0/';

fh = fopen([prefix, 'followers']);
followerData = fread(fh, 'float32');

fhv = fopen([prefix, 'values']);
valueVectorJS = fread(fhv, 'float32');

fhs = fopen([prefix, 'strings']);
stringVector = fread(fhs, 'uint16');

fclose(fh);
fclose(fhv);
fclose(fhs);

followerMat = single(reshape(followerData, 13, []));
valueVectorJS = reshape(valueVectorJS, 1, []);
stringMat = uint16(reshape(stringVector, 20, []));

clear followerData stringVector

followerMat(:,1) = []; % remove column 0 to make column 1 appear at index 1 (no big loss)
valueVectorJS(1) = [];
stringMat(:,1) = [];
% So, state 0 is absent here

followerMat(followerMat < 1) = nan;


nStates = width(followerMat);


[moves, points0, points1] = parsePoints(stringMat);

%% Basic info is ready now 

    clear stringMat

stepValues = countSteps(followerMat);


diffVector = points0 - points1;


% All edges (except 0-1)
    [statesRep, ~] = meshgrid(1:nStates, 1:13);
    edgesFrom = statesRep(~isnan(followerMat));
    edgesTo = followerMat(~isnan(followerMat));

    clear statesRep

    load gameValues % use this vector calculated with recreateScoring.m
valueVector = gameValues';
%valueVector = valueVectorJS; % if we use the original file input

    clear gameValues valueVectorJS

    % valuesFrom = valueVector(edgesFrom);
    % valuesTo = valueVector(edgesTo); % some destinations may be outside LIMIT
    % groupsFrom = stepValues(edgesFrom); % groups are defined by steps from 0
    % groupsTo = stepValues(edgesTo); % should be groupsFrom + 1?, but be careful



    % optimals = markOptimalMoves(valueVector, followerMat);

    % classes = char(size(valueVector));
    % classes(isnan(valueVector)) = 'U';
    % classes((valueVector) > 0) = '0';
    % classes((valueVector) < 0) = '1';
    % classes((valueVector) == 0) = 'D';

    % classCounts = classifyPerGroup(classes, stepValues);

% table to store numbers of edges by from/to
    % trTable = makeTransitionHist(edgesFrom, edgesTo, classes);
    % trTablesG = makeTransitionHistPerGroup(edgesFrom, edgesTo, classes, groupsFrom);

[finals, tips, ~] = getCategs(points0, points1, valueVector, moves, followerMat);
unknown = isnan(valueVector);

plotValues = makeDisplayValues(valueVector);

gt = groupSteps(stepValues);

