pkg load image

fh = fopen('saved_1/followers');
data = fread(fh, 'float32');

fhv = fopen('saved_1/values');
valueVector = fread(fhv, 'float32');

fhs = fopen('saved_1/strings');
stringVector = fread(fhs, 'uint16');



dataMat = reshape(data, 13, []);
stringMat = reshape(stringVector, 20, []);

dataMat(:,1) = []; # remove column 0 to make column 1 appear at index 1 (no big loss)
valueVector(1) = [];
stringMat(:,1) = [];
# So, state 0 is absent here



dataMat(dataMat == -1) = nan;

fclose(fh);
fclose(fhv);
fclose(fhs);

LIMIT = 10000; %numel(valueVector);% 100000;

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

yValues = ((1:nStates)./countsPerState);


relativeIndexVec = nan(1, nStates); % index of each state among those with equal step value

for s = 1:max(stepValues)
    levelStates = find(stepValues == s);
    indices = 1:numel(levelStates);

      % sort by value
      [~, order] = (sortScores(valueVector(levelStates))); % sort(-valueVector(levelStates));

    relativeIndexVec(levelStates(flipud(order))) = indices;
end

xVals = stepValues;
yVals = relativeIndexVec./(countsPerState+1);



win0 = valueVector > 0;
win1 = valueVector < 0;
draw = valueVector == 0;


[x, y, u, v] = calcVectors(dataMat, xVals, yVals, valueVector);

quiver(x, y, u, v, 0, 'k.');
hold on
plot(xVals, yVals, 'k.')
plot(xVals(win0), yVals(win0), 'ro', 'MarkerFaceColor','red');
plot(xVals(win1), yVals(win1), 'bo', 'MarkerFaceColor','blue');
plot(xVals(draw), yVals(draw), 'gd', 'MarkerFaceColor','greed');


points0 = cellfun(@(x) x.players(1).points, states);
points1 = cellfun(@(x) x.players(2).points, states);

moves = cellfun(@(x) x.moves, states);


stem3(xVals, yVals, points1/1000, 'b')
stem3(xVals, yVals, points0/1000, 'r')



