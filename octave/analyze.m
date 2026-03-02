%pkg load image

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

LIMIT = 1000000; %width(dataMat); % 50000;

if LIMIT > 2000000; error('WTF!'); end

  % !!!! Cutting to 10k for dev because performance
  dataMat = dataMat(:, 1:LIMIT);
    valueVectorAll = valueVector;
  valueVector = valueVector(1:LIMIT);
  stringMat = stringMat(:, 1:LIMIT);

nStates = width(dataMat);

if false % Parsing states into structs is costly 
    states = cell(1, nStates);
    
    for i = 1:nStates
        states{i} = parseState(stringMat(:,i));
    end
end


stepValues = countSteps(dataMat);

%[counts, ~] = histcounts(stepValues, 0.5:(max(stepValues) + 0.5));
counts = accumarray(stepValues', ones(nStates, 1));

countsPerState = counts(stepValues);


win0 = valueVector > 0;
win1 = valueVector < 0;
draw = valueVector == 0;


[moves, points0, points1] = parsePoints(stringMat); 
diffVector = points0 - points1;


% All edges (except 0-1)
[statesRep, ~] = meshgrid(1:nStates, 1:13);
edgesFrom = statesRep(~isnan(dataMat));
edgesTo = dataMat(~isnan(dataMat));

valuesFrom = valueVector(edgesFrom);
valuesTo = valueVectorAll(edgesTo); % some destinations may be outside LIMIT
groupsFrom = stepValues(edgesFrom); % groups are defined by steps from 0

optimals = markOptimalMoves(valueVector, dataMat);

reached = findReachable(dataMat, optimals, moves);


    %diffused = diffuseValues(diffVector, dataMat, states, max(stepValues));

    initialStepsGeneral = inf(1, numel(reached));
    initialStepsGeneral(reached) = 0;
    
    stepsGeneral = countStepsGeneral(dataMat, initialStepsGeneral);
    
    in4steps = stepsGeneral <= 4;


classes = char(size(valueVectorAll));
classes(isnan(valueVectorAll)) = 'U';
classes((valueVectorAll) > 0) = '0';
classes((valueVectorAll) < 0) = '1';
classes((valueVectorAll) == 0) = 'D';

classCounts = classifyPerGroup(classes, stepValues);

% table to store numbers of edges by from/to

trTable = makeTransitionHist(edgesFrom, edgesTo, classes);
trTablesG = makeTransitionHistPerGroup(edgesFrom, edgesTo, classes, groupsFrom);


[finals, tips, branching] = getCategs(points0, points1, valueVector, moves, dataMat);

visualize =  false; true;
if visualize
  % CAREFUL: here we'll plot height according to present point difference, not oracle value
  relativeIndexVec = getRelativeInds(stepValues, valueVector);
                     % getRelativeInds(stepValues, diffVector);

  xVals = stepValues;
  yVals = relativeIndexVec(:)./(countsPerState(:)+1);

  [x, y, u, v] = calcVectors(dataMat, xVals, yVals);


  xN = x(~optimals);
  yN = y(~optimals);
  uN = u(~optimals);
  vN = v(~optimals);

  xO = x(optimals);
  yO = y(optimals);
  uO = u(optimals);
  vO = v(optimals);

  semilogx(xVals, yVals, 'k.'); % Setting x to log for more clarity

  hold on

  quiver(xN, yN, uN, vN, 0, 'k.');
  quiver(xO, yO, uO, vO, 0, 'g.');

  %plot(xVals, yVals, 'k.')
  plot(xVals(win0 & reached'), yVals(win0 & reached'), 'ro', 'MarkerFaceColor','red');
  plot(xVals(win1 & reached'), yVals(win1 & reached'), 'bo', 'MarkerFaceColor','blue');
  plot(xVals(draw & reached'), yVals(draw & reached'), 'gd', 'MarkerFaceColor','green');

  %plot(xVals(in4steps), yVals(in4steps), 'gp', 'MarkerFaceColor','black');
end
