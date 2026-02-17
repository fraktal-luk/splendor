pkg load image

prefix = '../saved_2/';

fh = fopen([prefix, 'followers']);
data = fread(fh, 'float32');

fhv = fopen([prefix, 'values']);
valueVector = fread(fhv, 'float32');

fhs = fopen([prefix, 'strings']);
stringVector = fread(fhs, 'uint16');



dataMat = single(reshape(data, 13, []));
stringMat = uint16(reshape(stringVector, 20, []));

clear data stringVector

dataMat(:,1) = []; # remove column 0 to make column 1 appear at index 1 (no big loss)
valueVector(1) = [];
stringMat(:,1) = [];
# So, state 0 is absent here



dataMat(dataMat == -1) = nan;

fclose(fh);
fclose(fhv);
fclose(fhs);

LIMIT = 120000; %columns(dataMat); % 50000;

  %% !!!! Cutting to 10k for dev because performance
  dataMat = dataMat(:, 1:LIMIT);
  valueVector = valueVector(1:LIMIT);
  stringMat = stringMat(:, 1:LIMIT);


nStates = columns(dataMat);


states = cell(1, nStates);

for i = 1:nStates
    states{i} = parseState(stringMat(:,i));
end




stepValues = countSteps(dataMat);

[counts, ~] = hist(stepValues, 0.5:max(stepValues));

countsPerState = counts(stepValues);


##relativeIndexVec = nan(1, nStates, 'single'); % index of each state among those with equal step value
##
##for s = 1:max(stepValues)
##    levelStates = find(stepValues == s);
##    indices = 1:numel(levelStates);
##
##      % sort by value
##      [~, order] = (sortScores(valueVector(levelStates))); % sort(-valueVector(levelStates));
##
##    relativeIndexVec(levelStates((order))) = indices;
##end


%clear levelStates indices




win0 = valueVector > 0;
win1 = valueVector < 0;
draw = valueVector == 0;


optimals = markOptimalMoves(valueVector, dataMat, states);

reached = findReachable(dataMat, optimals, states);


points0 = cellfun(@(x) x.players(1).points, states);
points1 = cellfun(@(x) x.players(2).points, states);
moves = cellfun(@(x) x.moves, states);

##stem3(xVals, yVals, points1/1000, 'b')
##stem3(xVals, yVals, points0/1000, 'r')

diffVector = points0 - points1;

diffused = diffuseValues(diffVector, dataMat, states, max(stepValues));

initialStepsGeneral = inf(1, numel(reached));
initialStepsGeneral(reached) = 0;

stepsGeneral = countStepsGeneral(dataMat, initialStepsGeneral);

% CAREFUL: here we'll plot height according to present point difference, not oracle value
relativeIndexVec = getRelativeInds(stepValues, valueVector);
                   % getRelativeInds(stepValues, diffVector);

xVals = stepValues;
yVals = relativeIndexVec./(countsPerState+1);

[x, y, u, v] = calcVectors(dataMat, xVals, yVals);


xN = x(~optimals);
yN = y(~optimals);
uN = u(~optimals);
vN = v(~optimals);

xO = x(optimals);
yO = y(optimals);
uO = u(optimals);
vO = v(optimals);

in4steps = stepsGeneral <= 4;

visualize = true;
if visualize
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


##
##fh2 = fopen('../saved_2/strings');
##sv2 = fread(fh2, 'uint16');
##
##fh2n = fopen('../saved_2/strings_N');
##sv2n = fread(fh2n, 'uint16');

