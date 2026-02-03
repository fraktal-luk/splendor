
fh = fopen('saved_1/followers');
data = fread(fh, 'float32');

dataMat = reshape(data, 13, []);


dataMat(:,1) = []; # remove column 0 to make column 1 appear at index 1 (no big loss)
# So, state 0 is absent here

nStates = columns(dataMat);


dataMat(dataMat == -1) = nan;

fclose(fh);


# Lets try for first 1000 states
first1000 = dataMat(:, 1:1000);

stepValues = countSteps(dataMat);

[counts, ~] = hist(stepValues, 0.5:max(stepValues));

countsPerState = counts(stepValues);

yValues = ((1:nStates)./countsPerState);


relativeIndexVec = nan(1, nStates); % index of each state among those with equal step value

for s = 1:max(stepValues)
    levelStates = find(stepValues == s);
    indices = 1:numel(levelStates);
    relativeIndexVec(levelStates) = indices;
end

xVals = stepValues;
yVals = relativeIndexVec./(countsPerState+1);

